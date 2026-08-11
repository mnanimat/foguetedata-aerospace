const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

const oldRaycasterSketch = `      // Se estiver no modo Sketch, a gente pega a coordenada do Grid no Z=0
      if (activeViewportCadTab === 'sketch' && hudSketchTool === 'line') {
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 2); // plano Y=-2 (posição do grid)
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, target);
        if (target) {
          // Fixando em Z=0 no grid
          if (!sketchStartPoint) {
            setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
            setToastMessage(\`Ponto Inicial: (\${target.x.toFixed(1)}, \${target.z.toFixed(1)}). Selecione o final ou digite medida/ângulo.\`);
            setTimeout(() => setToastMessage(null), 3000);
          } else {
            // Desenha linha até o alvo e o alvo vira o novo ponto inicial
            const novaLinha = [
              [sketchStartPoint.x, sketchStartPoint.y, sketchStartPoint.z],
              [target.x, target.y, target.z]
            ];
            setSketchLines(prev => [...prev, novaLinha]);
            setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
            
            // Atualiza inputs com a medida e angulo reais
            const dx = target.x - sketchStartPoint.x;
            const dz = target.z - sketchStartPoint.z;
            const dist = Math.sqrt(dx*dx + dz*dz).toFixed(1);
            let ang = (Math.atan2(dz, dx) * 180 / Math.PI).toFixed(1);
            if (parseFloat(ang) < 0) ang = (360 + parseFloat(ang)).toFixed(1);
            
            setSketchMeasure(dist);
            setSketchAngle(ang);
            
            setToastMessage(\`Linha Desenhada. Novo Ponto Inicial: (\${target.x.toFixed(1)}, \${target.z.toFixed(1)}).\`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        }
        return;
      }`;

const newRaycasterSketch = `      // Se estiver no modo Sketch, a gente intercepta o clique no Grid 3D
      if (activeViewportCadTab === 'sketch') {
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 2);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, target);
        if (target) {
          if (hudSketchTool === 'line') {
            if (!sketchStartPoint) {
              setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
              setToastMessage(\`Ponto Inicial: (\${target.x.toFixed(1)}, \${target.z.toFixed(1)}). Clique no próximo ponto.\`);
            } else {
              const novaLinha = [
                [sketchStartPoint.x, sketchStartPoint.y, sketchStartPoint.z],
                [target.x, target.y, target.z]
              ];
              setSketchLines(prev => [...prev, novaLinha]);
              setSketchStartPoint({ x: target.x, y: target.y, z: target.z });
              const dx = target.x - sketchStartPoint.x;
              const dz = target.z - sketchStartPoint.z;
              setSketchMeasure((Math.sqrt(dx*dx + dz*dz) * 20).toFixed(0));
              setToastMessage(\`Linha desenhada! Ponto: (\${target.x.toFixed(1)}, \${target.z.toFixed(1)})\`);
            }
          } else if (hudSketchTool === 'circle') {
            desenharCirculo(target.x, target.z);
          } else if (hudSketchTool === 'rectangle') {
            desenharRetangulo(target.x, target.z);
          } else if (hudSketchTool === 'arc') {
            desenharArco(target.x, target.z);
          }
          setTimeout(() => setToastMessage(null), 2500);
        }
        return;
      }`;

content = content.replace(oldRaycasterSketch, newRaycasterSketch);

// Replace dependency array
content = content.replace(
  `  }, [models, selectedModelId, isExpanded, activeGizmoTool, pushHistory, sketchLines, sketchStartPoint, activeViewportCadTab, explodedView, viewMode]);`,
  `  }, [models, selectedModelId, isExpanded, activeGizmoTool, pushHistory, sketchLines, sketchStartPoint, activeViewportCadTab, hudSketchTool, hudKeyLight, hudFillLight, hudAmbientLight, explodedView, viewMode]);`
);

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
