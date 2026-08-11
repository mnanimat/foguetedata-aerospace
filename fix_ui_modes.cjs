const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

const toolbarTarget = `              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => handleSetView('top')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="hidden sm:inline font-bold group-hover:text-white">TOP (Y)</span>
                </button>`;

const newToolbarCond = `              <div className="flex items-center gap-2 mr-4">
                <select 
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] p-1.5 rounded"
                >
                  <option value="solid">Sólido</option>
                  <option value="wireframe">Wireframe</option>
                  <option value="xray">Raio-X (Transparente)</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Visão Explodida:</span>
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={explodedView} 
                    onChange={(e) => setExplodedView(parseFloat(e.target.value))}
                    className="w-20 accent-red-500 h-1 bg-slate-300 dark:bg-slate-700 rounded"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => handleSetView('top')} className="bg-white/90 dark:bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 dark:hover:bg-red-600/90 text-slate-800 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-slate-300 dark:border-slate-700 hover:border-red-500 transition shadow-lg text-[10px] font-mono flex items-center justify-between gap-2 group">
                  <span className="hidden sm:inline font-bold group-hover:text-white">TOP (Y)</span>
                </button>`;

content = content.replace(toolbarTarget, newToolbarCond);

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
