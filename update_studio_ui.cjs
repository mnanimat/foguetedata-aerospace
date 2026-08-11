const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

// Add handleCaptureHQPhoto & handleSetView
const photoAndCameraFuncs = `
  const handleCaptureHQPhoto = () => {
    const mount = isExpanded ? expandedMountRef.current : mountRef.current;
    const canvas = mount?.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = \`FogueteData_3D_Studio_Render_\${Date.now()}.png\`;
      a.click();
      setToastMessage('📸 Snapshot 4K renderizado e salvo como PNG!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSetView = (view: 'top' | 'front' | 'side' | 'iso' | 'back') => {
    if (!orbitControlsRef.current) return;
    const controls = orbitControlsRef.current;
    const cam = controls.object as THREE.PerspectiveCamera;

    if (view === 'top') {
      cam.position.set(0, 18, 0.01);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Superior (Topo Y)');
    } else if (view === 'front') {
      cam.position.set(0, 0, 18);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Frontal (Z)');
    } else if (view === 'side') {
      cam.position.set(18, 0, 0);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Lateral (X)');
    } else if (view === 'back') {
      cam.position.set(0, 0, -18);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Traseira (-Z)');
    } else {
      cam.position.set(8, 8, 14);
      controls.target.set(0, 0, 0);
      setToastMessage('👁️ Vista Isométrica 3D');
    }
    controls.update();
    setTimeout(() => setToastMessage(null), 1500);
  };
`;

content = content.replace(
  `  const handleViewportExportPDF = () => {`,
  photoAndCameraFuncs + `\n  const handleViewportExportPDF = () => {`
);

// Replace Tab 1 Measures UI to add Circular Pattern button
const oldTab1End = `              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Padrão Circular (Circular Pattern):</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={hudPatternCount}
                  onChange={(e) => setHudPatternCount(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>`;

const newTab1End = `              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Padrão Circular (Circular Pattern):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={hudPatternCount}
                    onChange={(e) => setHudPatternCount(Number(e.target.value))}
                    className="w-20 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <button
                    onClick={handleGenerateCircularPattern}
                    className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 shadow"
                  >
                    <Repeat className="w-3 h-3" />
                    Gerar Copias Radiais
                  </button>
                </div>
              </div>
            </div>`;

content = content.replace(oldTab1End, newTab1End);

// Replace Tab 2 Sketch UI to render controls for all tools
const oldTab2Code = `          {/* TAB 2: SKETCH */}
          {activeViewportCadTab === 'sketch' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Ferramenta:</span>
                {(['line', 'circle', 'arc', 'rectangle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHudSketchTool(t)}
                    className={\`px-2 py-1 rounded border capitalize \${hudSketchTool === t ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'}\`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              {hudSketchTool === 'line' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Medida (mm):</span>
                    <input
                      type="number"
                      value={sketchMeasure}
                      onChange={(e) => setSketchMeasure(e.target.value)}
                      placeholder="Ex: 100"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Ângulo (°):</span>
                    <input
                      type="number"
                      value={sketchAngle}
                      onChange={(e) => setSketchAngle(e.target.value)}
                      placeholder="Ex: 45"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={calcularPontoFinal}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Desenhar Linha
                  </button>
                  <button
                    onClick={() => {
                      setSketchLines([]);
                      setSketchStartPoint(null);
                      setToastMessage("Esboço limpo!");
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                <button
                  onClick={() => setHudConstraint(hudConstraint === 'coincident' ? 'parallel' : 'coincident')}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-300 px-2 py-1 rounded flex items-center gap-1"
                >
                  {hudConstraint === 'coincident' ? <Crosshair className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
                  Restrição {hudConstraint.toUpperCase()}
                </button>
                <button
                  onClick={() => {
                    setToastMessage(\`⚡ Esboço extrudado (\${hudExtrudeDepth}mm) no estúdio!\`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold"
                >
                  Extrudar para Sólido (\${hudExtrudeDepth}mm)
                </button>
              </div>
            </div>
          )}`;

const newTab2Code = `          {/* TAB 2: SKETCH */}
          {activeViewportCadTab === 'sketch' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Ferramenta:</span>
                {(['line', 'circle', 'arc', 'rectangle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHudSketchTool(t)}
                    className={\`px-2.5 py-1 rounded border capitalize text-[11px] font-bold font-mono transition \${hudSketchTool === t ? 'bg-amber-600 text-white border-amber-400 shadow' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'}\`}
                  >
                    {t === 'line' ? '📏 Linha' : t === 'circle' ? '⭕ Círculo' : t === 'arc' ? '🌙 Arco' : '▭ Retângulo'}
                  </button>
                ))}
              </div>
              
              {hudSketchTool === 'line' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Medida (mm):</span>
                    <input
                      type="number"
                      value={sketchMeasure}
                      onChange={(e) => setSketchMeasure(e.target.value)}
                      placeholder="Ex: 100"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Ângulo (°):</span>
                    <input
                      type="number"
                      value={sketchAngle}
                      onChange={(e) => setSketchAngle(e.target.value)}
                      placeholder="Ex: 45"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={calcularPontoFinal}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Desenhar Linha
                  </button>
                </div>
              )}

              {hudSketchTool === 'circle' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Raio (mm):</span>
                    <input
                      type="number"
                      value={sketchRadius}
                      onChange={(e) => setSketchRadius(e.target.value)}
                      placeholder="50"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => desenharCirculo()}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Circle className="w-3.5 h-3.5" />
                    Desenhar Círculo
                  </button>
                </div>
              )}

              {hudSketchTool === 'rectangle' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Largura (mm):</span>
                    <input
                      type="number"
                      value={sketchWidth}
                      onChange={(e) => setSketchWidth(e.target.value)}
                      placeholder="100"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Altura (mm):</span>
                    <input
                      type="number"
                      value={sketchHeight}
                      onChange={(e) => setSketchHeight(e.target.value)}
                      placeholder="50"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => desenharRetangulo()}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Box className="w-3.5 h-3.5" />
                    Desenhar Retângulo
                  </button>
                </div>
              )}

              {hudSketchTool === 'arc' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Raio (mm):</span>
                    <input
                      type="number"
                      value={sketchRadius}
                      onChange={(e) => setSketchRadius(e.target.value)}
                      placeholder="50"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Abertura (°):</span>
                    <input
                      type="number"
                      value={sketchArcAngle}
                      onChange={(e) => setSketchArcAngle(e.target.value)}
                      placeholder="180"
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded w-20 text-[11px] outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => desenharArco()}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Desenhar Arco
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-300 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHudConstraint(hudConstraint === 'coincident' ? 'parallel' : 'coincident')}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-500 dark:text-amber-300 px-2 py-1 rounded text-[11px] flex items-center gap-1 font-bold"
                  >
                    {hudConstraint === 'coincident' ? <Crosshair className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
                    Restrição {hudConstraint.toUpperCase()}
                  </button>
                  <button
                    onClick={() => {
                      setSketchLines([]);
                      setSketchStartPoint(null);
                      setToastMessage("Esboço limpo!");
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRevolveToSolid}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <RotateCw className="w-3 h-3" />
                    Revolução 3D (360°)
                  </button>
                  <button
                    onClick={handleExtrudeToSolid}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Box className="w-3.5 h-3.5" />
                    Extrudar para Sólido ({hudExtrudeDepth}mm)
                  </button>
                </div>
              </div>
            </div>
          )}`;

content = content.replace(oldTab2Code, newTab2Code);

// Replace Tab 3 Lighting UI to include HQ snapshot button & 3 light sliders
const oldTab3Code = `          {/* TAB 3: LIGHTING */}
          {activeViewportCadTab === 'lighting' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400">Key Light: {hudKeyLight}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={hudKeyLight}
                  onChange={(e) => setHudKeyLight(Number(e.target.value))}
                  className="w-32 accent-yellow-500 cursor-pointer"
                />
              </div>
              <button
                onClick={() => {
                  setToastMessage("📸 Foto Render HQ 4K Capturada!");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded font-bold"
              >
                Capturar Foto 4K HQ
              </button>
            </div>
          )}`;

const newTab3Code = `          {/* TAB 3: LIGHTING */}
          {activeViewportCadTab === 'lighting' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Key Light (Luz Principal): <strong className="text-yellow-400">{hudKeyLight}x</strong></label>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={hudKeyLight}
                    onChange={(e) => setHudKeyLight(Number(e.target.value))}
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Fill Light (Luz de Preenchimento): <strong className="text-cyan-400">{hudFillLight}x</strong></label>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={hudFillLight}
                    onChange={(e) => setHudFillLight(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Ambient Light (Luz Ambiente): <strong className="text-amber-400">{hudAmbientLight}x</strong></label>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={hudAmbientLight}
                    onChange={(e) => setHudAmbientLight(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Vistas Rápidas de Câmera CAD:</span>
                <div className="flex items-center gap-1.5">
                  {(['iso', 'top', 'front', 'side', 'back'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => handleSetView(v)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCaptureHQPhoto}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capturar Foto 4K HQ
                </button>
              </div>
            </div>
          )}`;

content = content.replace(oldTab3Code, newTab3Code);

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
