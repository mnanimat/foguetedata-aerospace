const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

const targetStr = `      meshObj.userData = { id: m.id };
      meshObj.traverse((child) => {
        child.userData = { id: m.id };
      });

      objectsGroup.add(meshObj);

      if (m.id === selectedModelId) {`;

const newStr = `      meshObj.userData = { id: m.id };
      meshObj.traverse((child) => {
        child.userData = { id: m.id };
        if (child.isMesh && m.id === selectedModelId) {
          if (child.material) {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(0xef4444);
            child.material.emissiveIntensity = 0.5;
          }
        }
      });
      
      if (meshObj.isMesh && m.id === selectedModelId) {
        if (meshObj.material) {
          meshObj.material = meshObj.material.clone();
          meshObj.material.emissive = new THREE.Color(0xef4444);
          meshObj.material.emissiveIntensity = 0.5;
        }
      }

      objectsGroup.add(meshObj);

      if (m.id === selectedModelId) {`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
