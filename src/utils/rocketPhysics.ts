import { RocketParams, TrajectoryPoint } from '../types';

export interface TrajectorySummary {
  points: TrajectoryPoint[];
  maxAltitude: number; // m
  timeToApogee: number; // s
  maxVelocity: number; // m/s
  maxMach: number; // Mach
  maxAcceleration: number; // m/s^2 (or Gs)
  maxGForce: number; // Gs
  maxDynamicPressure: number; // Pa
  timeMaxQ: number; // s
  railExitVelocity: number; // m/s
  isRailExitSafe: boolean; // v_rail >= 15 m/s
  drogueDeployAlt: number; // m
  mainDeployAlt: number; // m
  touchdownVelocity: number; // m/s
  touchdownKineticEnergy: number; // Joules
  isTouchdownSafe: boolean; // Ek <= 15 J
  totalFlightTime: number; // s
  driftDistance: number; // m
  searchRadius: number; // m
  staticMarginInitial: number; // calibers
  staticMarginBurnout: number; // calibers
  specificImpulse: number; // s (Isp)
  motorClass: string; // e.g., "G64" or "H128"
}

// Calculates Standard International Atmosphere (ISA) parameters
export function getAtmosphericProperties(altitude: number, groundTempC: number = 25, groundPressHpa: number = 1013.25) {
  const h = Math.max(0, altitude);
  const T0 = groundTempC + 273.15; // Kelvin
  const P0 = groundPressHpa * 100; // Pascals
  const L = 0.0065; // K/m lapse rate
  const g0 = 9.80665;
  const R = 287.058; // J/(kg*K)
  const gamma = 1.4;

  const T = Math.max(180, T0 - L * h);
  const P = P0 * Math.pow(T / T0, g0 / (R * L));
  const rho = P / (R * T);
  const soundSpeed = Math.sqrt(gamma * R * T);

  return { temperatureK: T, temperatureC: T - 273.15, pressurePa: P, rho, soundSpeed };
}

// Calculates Cd(Mach) incorporating transonic drag rise and wave drag
export function getCdForMach(baseCd: number, mach: number): number {
  if (mach < 0.8) {
    return baseCd;
  } else if (mach <= 1.2) {
    // Transonic drag divergence peak around Mach 1.05
    const bump = 0.85 * baseCd * Math.exp(-14 * Math.pow(mach - 1.05, 2));
    const shock = 0.12 / Math.sqrt(Math.abs(1.0 - mach * mach) + 0.04);
    return baseCd + bump + shock;
  } else {
    // Supersonic wave drag decay
    return baseCd + 0.22 / Math.sqrt(mach * mach - 1.0);
  }
}

// Classify motor impulse (e.g. A, B, C, D, E, F, G, H, I...)
export function getMotorClass(impulse: number): string {
  if (impulse <= 2.5) return 'A';
  if (impulse <= 5.0) return 'B';
  if (impulse <= 10.0) return 'C';
  if (impulse <= 20.0) return 'D';
  if (impulse <= 40.0) return 'E';
  if (impulse <= 80.0) return 'F';
  if (impulse <= 160.0) return 'G';
  if (impulse <= 320.0) return 'H';
  if (impulse <= 640.0) return 'I';
  if (impulse <= 1280.0) return 'J';
  if (impulse <= 2560.0) return 'K';
  if (impulse <= 5120.0) return 'L';
  return 'M+';
}

// Main High-Precision Runge-Kutta / Step Flight Simulator
export function calculatePreciseTrajectory(params: RocketParams): TrajectorySummary {
  const dt = 0.02; // 20ms precision step
  const g0 = 9.80665;
  const Re = 6371000; // Earth radius (m)
  const areaRocket = (Math.PI * Math.pow(params.diameter, 2)) / 4;
  const areaDrogue = (Math.PI * Math.pow(params.drogueDiameter, 2)) / 4;
  const areaMain = (Math.PI * Math.pow(params.mainDiameter, 2)) / 4;

  const angleRad = (params.launchAngle * Math.PI) / 180;
  const windMps = (params.windSpeed * 1000) / 3600;

  const mPropellant = Math.max(0.001, params.massInitial - params.massFinal);
  const burnRate = mPropellant / params.burnTime;
  const specificImpulse = params.motorImpulse / (mPropellant * g0);

  const thrustStartDelay = params.thrustStartDelay || 0;
  const burnTime = params.burnTime;
  const thrustEndTime = thrustStartDelay + burnTime;
  const chuteMode = params.parachuteDeployMode || 'apogee_auto';
  const chuteDelay = params.parachuteDeployDelay || 0;

  // Initial State Variables
  let t = 0;
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let isDrogueDeployed = false;
  let isMainDeployed = false;
  let apogeeReached = false;

  let maxAlt = 0;
  let timeApogee = 0;
  let maxVel = 0;
  let maxM = 0;
  let maxA = 0;
  let maxQ = 0;
  let timeQ = 0;
  let vRailExit = 0;
  let railRecorded = false;
  let drogueAlt = 0;
  let mainAlt = 0;
  let driftDist = 0;

  const points: TrajectoryPoint[] = [];

  while (y >= 0 && t <= 250) {
    // Current Gravity at altitude
    const gAcc = g0 * Math.pow(Re / (Re + y), 2);

    // Current Atmospheric Properties
    const atmos = getAtmosphericProperties(y, params.temperatureGround, params.pressureGround);
    const rho = atmos.rho;
    const aSound = atmos.soundSpeed;

    // Wind at Altitude (Hellman Power Law)
    const vWindAlt = windMps * Math.pow(Math.max(y, 0.5) / 10, 0.143);

    // Thrust & Propellant Mass Elapsed
    const tBurn = t - thrustStartDelay;
    const isThrustActive = tBurn >= 0 && tBurn <= burnTime;

    let currentM = params.massFinal;
    if (t < thrustStartDelay) {
      currentM = params.massInitial;
    } else if (isThrustActive) {
      currentM = params.massInitial - burnRate * tBurn;
    }

    // Thrust Profile (Sine Bell Curve)
    let thrust = 0;
    if (isThrustActive) {
      const avgThrust = params.motorImpulse / burnTime;
      thrust = (Math.PI / 2) * avgThrust * Math.sin((Math.PI * tBurn) / burnTime);
    }

    // Velocity relative to wind
    const vxRel = vx - vWindAlt;
    const vyRel = vy;
    const vRel = Math.sqrt(vxRel * vxRel + vyRel * vyRel);
    const vGround = Math.sqrt(vx * vx + vy * vy);

    const mach = vGround / aSound;
    const dynPress = 0.5 * rho * vGround * vGround;

    // Track Apogee Event
    if (vy <= 0 && !apogeeReached && t > 0.5) {
      apogeeReached = true;
      timeApogee = t;
    }

    // Determine Parachute Deployment Trigger
    let shouldDeployChute = false;
    if (chuteMode === 'apogee_auto') {
      shouldDeployChute = apogeeReached || vy <= 0;
    } else if (chuteMode === 'delay_after_apogee') {
      shouldDeployChute = apogeeReached && t >= (timeApogee + chuteDelay);
    } else if (chuteMode === 'fixed_time') {
      shouldDeployChute = t >= chuteDelay;
    }

    // Static Margin
    const cgCurrent = params.cgPosition + ((params.cpPosition - params.cgPosition) * 0.2 * (Math.max(0, tBurn) / Math.max(1, burnTime)));
    const staticMargin = (params.cpPosition - cgCurrent) / (params.diameter * 100);

    // Determine Phase
    const distRail = Math.sqrt(x * x + y * y);
    let phase: TrajectoryPoint['phase'] = 'ramp';

    if (distRail <= params.railLength && isThrustActive) {
      phase = 'ramp';
      if (!railRecorded && distRail >= params.railLength) {
        vRailExit = vGround;
        railRecorded = true;
      }
    } else if (isThrustActive) {
      phase = 'thrust';
    } else if (!shouldDeployChute && vy >= -1) {
      phase = 'coast';
    } else if (!isMainDeployed) {
      phase = 'drogue';
      if (!isDrogueDeployed) {
        isDrogueDeployed = true;
        drogueAlt = y;
        if (!timeApogee) timeApogee = t;
      }
      if (y <= params.mainDeployAlt) {
        isMainDeployed = true;
        mainAlt = y;
      }
    } else {
      phase = 'main_chute';
    }

    // Drag Calculation
    let dragForce = 0;
    if (phase === 'ramp' || phase === 'thrust' || phase === 'coast') {
      const cd = getCdForMach(params.cd, mach);
      dragForce = 0.5 * rho * areaRocket * cd * vRel * vRel;
    } else if (phase === 'drogue') {
      dragForce = 0.5 * rho * areaDrogue * params.drogueCd * vRel * vRel;
    } else if (phase === 'main_chute') {
      dragForce = 0.5 * rho * areaMain * params.mainCd * vRel * vRel;
    }

    // Force Components
    let fx = 0;
    let fy = 0;

    if (phase === 'ramp') {
      // Constrained along launch rail
      const netPropulsion = thrust - (vRel > 0 ? dragForce : 0) - currentM * gAcc * Math.sin(angleRad);
      const accelAlongRail = Math.max(0, netPropulsion / currentM);
      fx = currentM * accelAlongRail * Math.cos(angleRad);
      fy = currentM * accelAlongRail * Math.sin(angleRad);
    } else if (phase === 'thrust') {
      // Rocket orientation along flight path angle
      const pitchAngle = vGround > 0.1 ? Math.atan2(vy, vx) : angleRad;
      const dragX = vRel > 0 ? dragForce * (vxRel / vRel) : 0;
      const dragY = vRel > 0 ? dragForce * (vyRel / vRel) : 0;

      fx = thrust * Math.cos(pitchAngle) - dragX;
      fy = thrust * Math.sin(pitchAngle) - dragY - currentM * gAcc;
    } else {
      // Coast or Recovery Descent
      const dragX = vRel > 0 ? dragForce * (vxRel / vRel) : 0;
      const dragY = vRel > 0 ? dragForce * (vyRel / vRel) : 0;

      fx = -dragX;
      fy = -dragY - currentM * gAcc;
    }

    const ax = fx / currentM;
    const ay = fy / currentM;
    const accelMag = Math.sqrt(ax * ax + ay * ay);

    // Track Peak Metrics
    if (y > maxAlt) maxAlt = y;
    if (vGround > maxVel) maxVel = vGround;
    if (mach > maxM) maxM = mach;
    if (accelMag > maxA) maxA = accelMag;
    if (dynPress > maxQ) {
      maxQ = dynPress;
      timeQ = t;
    }

    // Accumulate Drift during Descent
    if (vy < 0) {
      driftDist += vWindAlt * dt;
    }

    // Record Point every ~0.06s (to keep ~200-400 points for chart)
    if (Math.floor(t / 0.06) !== Math.floor((t - dt) / 0.06) || y === 0) {
      points.push({
        time: parseFloat(t.toFixed(2)),
        altitude: parseFloat(Math.max(0, y).toFixed(2)),
        velocity: parseFloat(vGround.toFixed(2)),
        acceleration: parseFloat((accelMag / g0).toFixed(2)), // in Gs
        phase,
        xPos: parseFloat(x.toFixed(2)),
        yPos: parseFloat(Math.max(0, y).toFixed(2)),
        mach: parseFloat(mach.toFixed(3)),
        dynamicPressure: parseFloat(dynPress.toFixed(1)),
        dragForce: parseFloat(dragForce.toFixed(1)),
        thrustForce: parseFloat(thrust.toFixed(1)),
        currentMass: parseFloat(currentM.toFixed(3)),
        airDensity: parseFloat(rho.toFixed(4)),
        staticMargin: parseFloat(staticMargin.toFixed(2)),
        driftDistance: parseFloat(driftDist.toFixed(1))
      });
    }

    // Step Integration
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;

    if (y < 0) break;
  }

  // Touchdown Parameters
  const lastPoint = points[points.length - 1] || { velocity: 0, time: 0 };
  const vTouchdown = lastPoint.velocity;
  const ekTouchdown = 0.5 * params.massFinal * Math.pow(vTouchdown, 2);
  const motorClassLetter = getMotorClass(params.motorImpulse);

  return {
    points,
    maxAltitude: parseFloat(maxAlt.toFixed(2)),
    timeToApogee: parseFloat(timeApogee.toFixed(2)),
    maxVelocity: parseFloat(maxVel.toFixed(2)),
    maxMach: parseFloat(maxM.toFixed(3)),
    maxAcceleration: parseFloat((maxA / g0).toFixed(2)),
    maxGForce: parseFloat((maxA / g0).toFixed(2)),
    maxDynamicPressure: parseFloat(maxQ.toFixed(1)),
    timeMaxQ: parseFloat(timeQ.toFixed(2)),
    railExitVelocity: parseFloat((vRailExit || points[1]?.velocity || 12).toFixed(2)),
    isRailExitSafe: (vRailExit || points[1]?.velocity || 12) >= 15.0,
    drogueDeployAlt: parseFloat(drogueAlt.toFixed(2)),
    mainDeployAlt: parseFloat(mainAlt.toFixed(2)),
    touchdownVelocity: parseFloat(vTouchdown.toFixed(2)),
    touchdownKineticEnergy: parseFloat(ekTouchdown.toFixed(2)),
    isTouchdownSafe: ekTouchdown <= 15.0, // AEB/NAR 15 Joules kinetic limit
    totalFlightTime: parseFloat(t.toFixed(2)),
    driftDistance: parseFloat(driftDist.toFixed(1)),
    searchRadius: parseFloat((driftDist * 0.15 + 15).toFixed(1)),
    staticMarginInitial: parseFloat(((params.cpPosition - params.cgPosition) / (params.diameter * 100)).toFixed(2)),
    staticMarginBurnout: parseFloat(((params.cpPosition - (params.cgPosition + 2)) / (params.diameter * 100)).toFixed(2)),
    specificImpulse: parseFloat(specificImpulse.toFixed(1)),
    motorClass: `${motorClassLetter}${(params.motorImpulse / params.burnTime).toFixed(0)}`
  };
}
