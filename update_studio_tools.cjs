const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

// Update props
content = content.replace(
  `interface User3DModelStudioProps {\n  currentUser: User | null;\n  onOpenAuthModal: () => void;\n}`,
  `interface User3DModelStudioProps {\n  currentUser: User | null;\n  onOpenAuthModal: () => void;\n  onStartWalkthrough?: () => void;\n}`
);

content = content.replace(
  `export const User3DModelStudio: React.FC<User3DModelStudioProps> = ({\n  currentUser,\n  onOpenAuthModal\n}) => {`,
  `export const User3DModelStudio: React.FC<User3DModelStudioProps> = ({\n  currentUser,\n  onOpenAuthModal,\n  onStartWalkthrough\n}) => {`
);

// Add sketch state variables
const oldStates = `  const [sketchMeasure, setSketchMeasure] = useState<string>('');
  const [sketchAngle, setSketchAngle] = useState<string>('');
  const [explodedView, setExplodedView] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');`;

const newStates = `  const [sketchMeasure, setSketchMeasure] = useState<string>('');
  const [sketchAngle, setSketchAngle] = useState<string>('');
  const [sketchRadius, setSketchRadius] = useState<string>('50');
  const [sketchWidth, setSketchWidth] = useState<string>('100');
  const [sketchHeight, setSketchHeight] = useState<string>('50');
  const [sketchArcAngle, setSketchArcAngle] = useState<string>('180');
  const [hudFillLight, setHudFillLight] = useState<number>(1.2);
  const [hudAmbientLight, setHudAmbientLight] = useState<number>(0.9);
  const [explodedView, setExplodedView] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');`;

content = content.replace(oldStates, newStates);

// Add CAD drawing functions
const oldCalcular = `  const calcularPontoFinal = () => {`;

const newDrawingFuncs = `  const desenharCirculo = (centerX = sketchStartPoint?.x || 0, centerZ = sketchStartPoint?.z || 0) => {
    const r = parseFloat(sketchRadius) / 20 || 2.5;
    const segments = 32;
    const lines: number[][][] = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      lines.push([
        [centerX + r * Math.cos(a1), -2, centerZ + r * Math.sin(a1)],
        [centerX + r * Math.cos(a2), -2, centerZ + r * Math.sin(a2)]
      ]);
    }
    setSketchLines(prev => [...prev, ...lines]);
    setToastMessage(\`⭕ Círculo (Ø \${(r * 20).toFixed(0)}mm) desenhado no estúdio!\`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const desenharRetangulo = (startX = sketchStartPoint?.x || -2, startZ = sketchStartPoint?.z || -1) => {
    const w = parseFloat(sketchWidth) / 20 || 4.0;
    const h = parseFloat(sketchHeight) / 20 || 2.0;
    const y = -2;
    const rectLines: number[][][] = [
      [[startX, y, startZ], [startX + w, y, startZ]],
      [[startX + w, y, startZ], [startX + w, y, startZ + h]],
      [[startX + w, y, startZ + h], [startX, y, startZ + h]],
      [[startX, y, startZ + h], [startX, y, startZ]]
    ];
    setSketchLines(prev => [...prev, ...rectLines]);
    setToastMessage(\`▭ Retângulo (\${(w * 20).toFixed(0)}x\${(h * 20).toFixed(0)}mm) desenhado no estúdio!\`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const desenharArco = (centerX = sketchStartPoint?.x || 0, centerZ = sketchStartPoint?.z || 0) => {
    const r = parseFloat(sketchRadius) / 20 || 2.5;
    const sweepDeg = parseFloat(sketchArcAngle) || 180;
    const sweepRad = (sweepDeg * Math.PI) / 180;
    const segments = 20;
    const lines: number[][][] = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * sweepRad;
      const a2 = ((i + 1) / segments) * sweepRad;
      lines.push([
        [centerX + r * Math.cos(a1), -2, centerZ + r * Math.sin(a1)],
        [centerX + r * Math.cos(a2), -2, centerZ + r * Math.sin(a2)]
      ]);
    }
    setSketchLines(prev => [...prev, ...lines]);
    setToastMessage(\`🌙 Arco (\${sweepDeg}°, R \${(r * 20).toFixed(0)}mm) desenhado no estúdio!\`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtrudeToSolid = () => {
    const newId = \`extrude_\${Date.now()}\`;
    const shapeType = hudSketchTool === 'circle' ? 'cylinder' : hudSketchTool === 'rectangle' ? 'cube' : 'cylinder';
    
    const newModel: User3DModel = {
      id: newId,
      title: \`Peça CAD Extrudada \${models.length + 1}\`,
      author: currentUser?.displayName || 'Micael Nildo',
      type: 'peca_solida',
      meshType: 'cylinder_rocket',
      primitiveShape: shapeType,
      visible: true,
      locked: false,
      posX: sketchStartPoint?.x || 0,
      posY: 1.0,
      posZ: sketchStartPoint?.z || 0,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: parseFloat(sketchWidth || sketchRadius || '100') / 50 || 1.2,
      scaleY: hudExtrudeDepth / 200 || 1.5,
      scaleZ: parseFloat(sketchHeight || sketchRadius || '100') / 50 || 1.2,
      color: '#38bdf8',
      description: \`Sólido 3D gerado por extrusão CAD com profundidade \${hudExtrudeDepth}mm.\`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels(prev => [...prev, newModel]);
    setSelectedModelId(newId);
    setSketchLines([]);
    setSketchStartPoint(null);
    setToastMessage(\`⚡ Sólido CAD extrudado (\${hudExtrudeDepth}mm) inserido no estúdio!\`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRevolveToSolid = () => {
    const newId = \`revolve_\${Date.now()}\`;
    const newModel: User3DModel = {
      id: newId,
      title: \`Corpo de Revolução CAD \${models.length + 1}\`,
      author: currentUser?.displayName || 'Micael Nildo',
      type: 'foguete_completo',
      meshType: 'cylinder_rocket',
      primitiveShape: 'cone',
      visible: true,
      locked: false,
      posX: 0,
      posY: 2.0,
      posZ: 0,
      rotX: 0, rotY: 0, rotZ: 0,
      scaleX: parseFloat(hudDiameterMm.toString()) / 60 || 1.3,
      scaleY: parseFloat(hudLengthMm.toString()) / 500 || 2.0,
      scaleZ: parseFloat(hudDiameterMm.toString()) / 60 || 1.3,
      color: '#f59e0b',
      description: \`Sólido de revolução 360° no eixo Y gerado a partir do perfil CAD.\`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setModels(prev => [...prev, newModel]);
    setSelectedModelId(newId);
    setSketchLines([]);
    setSketchStartPoint(null);
    setToastMessage(\`🌀 Sólido de Revolução 360° gerado e inserido no estúdio!\`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateCircularPattern = () => {
    if (!currentModel) {
      setToastMessage("Selecione um componente para aplicar o Padrão Circular!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const count = Math.max(2, Math.min(12, hudPatternCount));
    const radius = 1.2;
    const newModels: User3DModel[] = [];

    for (let i = 1; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      newModels.push({
        ...currentModel,
        id: \`\${currentModel.id}_pattern_\${i}_\${Date.now()}\`,
        title: \`\${currentModel.title} (Cópia Radial \${i + 1})\`,
        posX: currentModel.posX + radius * Math.cos(angle),
        posZ: currentModel.posZ + radius * Math.sin(angle),
        rotY: currentModel.rotY + angle,
        description: \`Elemento \${i + 1} de \${count} no padrão circular radial.\`
      });
    }

    setModels(prev => [...prev, ...newModels]);
    setToastMessage(\`🎯 Padrão circular gerado com \${count} elementos espelhados radiais!\`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const calcularPontoFinal = () => {`;

content = content.replace(oldCalcular, newDrawingFuncs);

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
