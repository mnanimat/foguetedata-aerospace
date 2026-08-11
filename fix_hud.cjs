const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

const oldHud = `<div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-2 sm:gap-3 text-slate-800 dark:text-slate-200 shadow-xl">
        <span className="flex items-center gap-1 text-red-400 font-bold">
          <SlidersHorizontal className="w-3 h-3" /> CAD HUD:
        </span>
        <span>$L$: <strong className="text-slate-900 dark:text-white">{hudLengthMm}mm</strong></span>
        <span>$\\varnothing$: <strong className="text-slate-900 dark:text-white">{hudDiameterMm}mm</strong></span>
        <span>$t$: <strong className="text-slate-900 dark:text-white">{hudWallThicknessMm}mm</strong></span>
        <span className="hidden sm:inline text-amber-400 font-bold uppercase">{hudTubeType}</span>
      </div>`;

const newHud = `<div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2 sm:gap-3 text-slate-800 dark:text-slate-200 shadow-xl">
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <SlidersHorizontal className="w-3 h-3" /> CAD HUD:
          </span>
          <span>$L$: <strong className="text-slate-900 dark:text-white">{hudLengthMm}mm</strong></span>
          <span>$\\varnothing$: <strong className="text-slate-900 dark:text-white">{hudDiameterMm}mm</strong></span>
          <span>$t$: <strong className="text-slate-900 dark:text-white">{hudWallThicknessMm}mm</strong></span>
          <span className="hidden sm:inline text-amber-400 font-bold uppercase">{hudTubeType}</span>
        </div>
        
        <div className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-4 text-slate-800 dark:text-slate-200 shadow-xl">
          <div className="flex items-center gap-1">
            <span className="font-bold text-red-400">Modo Visual:</span>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="bg-transparent border-none text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
            >
              <option value="solid">Sólido</option>
              <option value="wireframe">Wireframe</option>
              <option value="xray">Raio-X / Transparente</option>
            </select>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">Visão Explodida:</span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={explodedView} 
              onChange={(e) => setExplodedView(parseFloat(e.target.value))}
              className="w-24 accent-red-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-slate-900 dark:text-white font-bold min-w-[30px]">{(explodedView * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>`;

content = content.replace(oldHud, newHud);
fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
