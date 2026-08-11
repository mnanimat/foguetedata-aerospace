const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

// Add states for exploded view and view mode
const stateInjectStr = `  const [sketchMeasure, setSketchMeasure] = useState<string>('');
  const [sketchAngle, setSketchAngle] = useState<string>('');`;

const newStatesStr = `  const [sketchMeasure, setSketchMeasure] = useState<string>('');
  const [sketchAngle, setSketchAngle] = useState<string>('');
  const [explodedView, setExplodedView] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');`;
content = content.replace(stateInjectStr, newStatesStr);

// Update render dependency
content = content.replace(
  `sketchLines, sketchStartPoint, activeViewportCadTab]);`,
  `sketchLines, sketchStartPoint, activeViewportCadTab, explodedView, viewMode]);`
);

// Update mesh position and material based on view mode and exploded view
const renderLoopStr = `      const customGeo = importedGeometriesRef.current[m.id];
      const meshObj = createMeshForModel(m, customGeo);

      meshObj.position.set(m.posX, m.posY, m.posZ);
      meshObj.rotation.set(m.rotX, m.rotY, m.rotZ);
      meshObj.scale.set(m.scaleX, m.scaleY, m.scaleZ);
      
      meshObj.userData = { id: m.id };
      meshObj.traverse((child) => {`;

const newRenderLoopStr = `      const customGeo = importedGeometriesRef.current[m.id];
      const meshObj = createMeshForModel(m, customGeo);
      
      // Exploded View logic: push objects away from center along Y axis based on their initial Y pos
      const explodeOffset = m.posY > 0 ? explodedView * m.posY : (m.posY < 0 ? explodedView * m.posY : 0);
      meshObj.position.set(m.posX, m.posY + explodeOffset, m.posZ);

      meshObj.rotation.set(m.rotX, m.rotY, m.rotZ);
      meshObj.scale.set(m.scaleX, m.scaleY, m.scaleZ);
      
      meshObj.userData = { id: m.id };
      meshObj.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          if (viewMode === 'wireframe') {
            child.material.wireframe = true;
          } else if (viewMode === 'xray') {
            child.material.transparent = true;
            child.material.opacity = 0.3;
            child.material.depthWrite = false;
          }
        }
`;
content = content.replace(renderLoopStr, newRenderLoopStr);

// Add the meshObj condition too for viewMode
const meshObjCondStr = `      if (meshObj.isMesh && m.id === selectedModelId) {
        if (meshObj.material) {
          meshObj.material = meshObj.material.clone();`;
const newMeshObjCondStr = `      if (meshObj.isMesh) {
        if (meshObj.material) {
          meshObj.material = meshObj.material.clone();
          if (viewMode === 'wireframe') {
            meshObj.material.wireframe = true;
          } else if (viewMode === 'xray') {
            meshObj.material.transparent = true;
            meshObj.material.opacity = 0.3;
            meshObj.material.depthWrite = false;
          }
        }
      }
      
      if (meshObj.isMesh && m.id === selectedModelId) {
        if (meshObj.material) {
          meshObj.material = meshObj.material.clone();`;
content = content.replace(meshObjCondStr, newMeshObjCondStr);

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
