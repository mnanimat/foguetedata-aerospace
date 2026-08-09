import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface RocketParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  symbol: string;
  opacity: number;
  color: string;
}

const ROCKET_SYMBOLS = ['🚀', '🪂', '⚙️', '🛰️', '🔴', '🌟', '🚩', '🔥'];
const RED_COLORS = ['#ef4444', '#f87171', '#dc2626', '#f59e0b', '#f43f5e', '#b91c1c'];

interface FallingRocketryRainProps {
  embedded?: boolean;
}

export const FallingRocketryRain: React.FC<FallingRocketryRainProps> = ({ embedded = false }) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 35 particles
    const particles: RocketParticle[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 16 + 12,
      speedY: Math.random() * 1.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      symbol: ROCKET_SYMBOLS[Math.floor(Math.random() * ROCKET_SYMBOLS.length)],
      opacity: Math.random() * 0.6 + 0.25,
      color: RED_COLORS[Math.floor(Math.random() * RED_COLORS.length)]
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Wrap around bottom
        if (p.y > canvas.height + 30) {
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.symbol === '🔴' || p.symbol === '🌟') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.symbol, 0, 0);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  return (
    <>
      {/* Background Falling Rain Canvas */}
      {isActive && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-10 opacity-70"
        />
      )}

      {/* Toggle Control Button */}
      <div className={embedded ? 'font-mono text-xs inline-block' : 'fixed top-20 left-4 z-40 font-mono text-xs'}>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-1.5 ${
            embedded 
              ? 'px-2.5 py-1 rounded-md text-[11px] border shadow-sm'
              : 'px-3 py-1.5 rounded-full shadow-lg border text-[11px]'
          } transition font-bold ${
            isActive
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 ring-1 ring-red-400/40'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Ativar/Desativar Chuva de Elementos Aeroespaciais"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-200 animate-pulse" />
          <span className="font-bold">
            {isActive ? 'Chuva (ON)' : 'Chuva (OFF)'}
          </span>
          {isActive ? <Eye className="w-3 h-3 text-red-200" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
        </button>
      </div>
    </>
  );
};
