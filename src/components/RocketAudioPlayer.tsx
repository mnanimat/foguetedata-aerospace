import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Radio, Disc, Minimize2, ChevronUp } from 'lucide-react';

interface RocketAudioPlayerProps {
  embedded?: boolean;
}

export const RocketAudioPlayer: React.FC<RocketAudioPlayerProps> = ({ embedded = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // Collapsed by default as requested
  const [activeTrack, setActiveTrack] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.25);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const tracks = [
    { name: 'Órbita Silenciosa (Sintetizador Aeroespacial)', desc: 'Frequência espacial relaxante e harmônica livre de direitos autorais.' },
    { name: 'Contagem Regressiva & Missão BAR-AEB', desc: 'Pulso de graves e atmosfera de sala de controle de lançamento.' },
    { name: 'Cruzeiro Suborbital & Apogeu', desc: 'Vibração ambiental inspirada na mesosfera e recuperação por paraquedas.' }
  ];

  // Web Audio Synth Generator for royalty-free ambient rocketry soundscape
  const startSynth = (trackIdx: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Stop previous oscillator if exists
      if (oscillatorNodeRef.current) {
        oscillatorNodeRef.current.stop();
        oscillatorNodeRef.current.disconnect();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Track Frequencies and Waves
      if (trackIdx === 0) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // A2
        osc.frequency.exponentialRampToValueAtTime(164.81, ctx.currentTime + 8); // E3
      } else if (trackIdx === 1) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(87.31, ctx.currentTime); // F2
        osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 6); // C3
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 10); // A3
      }

      const currentGain = isMuted ? 0 : volume * 0.3;
      gain.gain.setValueAtTime(currentGain, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorNodeRef.current = osc;
      gainNodeRef.current = gain;
    } catch {
      // Graceful fallback for audio policy restrictions
    }
  };

  const stopSynth = () => {
    if (oscillatorNodeRef.current) {
      try {
        oscillatorNodeRef.current.stop();
        oscillatorNodeRef.current.disconnect();
      } catch {
        // Ignore
      }
      oscillatorNodeRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      startSynth(activeTrack);
      setIsPlaying(true);
    }
  };

  const handleTrackChange = (index: number) => {
    setActiveTrack(index);
    if (isPlaying) {
      startSynth(index);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume * 0.3;
      gainNodeRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className={embedded ? 'relative font-mono text-xs inline-block' : 'fixed top-20 right-4 z-40 font-mono text-xs'}>
      {isCollapsed ? (
        /* Collapsed Minimalist Trigger Button */
        <button
          onClick={() => setIsCollapsed(false)}
          className={`bg-[#0f172a]/90 hover:bg-[#0f172a] border border-red-500/50 hover:border-red-400 text-white ${
            embedded ? 'px-2.5 py-1 rounded-md text-[11px] shadow-sm' : 'px-3 py-2 rounded-full shadow-2xl text-xs'
          } backdrop-blur-md flex items-center gap-1.5 transition hover:scale-105 active:scale-95 group font-bold`}
          title="Expandir Player de Música de Foguetemodelismo"
        >
          <div className="relative">
            <Disc className={`w-3.5 h-3.5 text-red-500 ${isPlaying ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-slate-200 group-hover:text-red-400 transition">
            {isPlaying ? 'Música (ON)' : 'Música'}
          </span>
          <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-white" />
        </button>
      ) : (
        /* Expanded Audio Control Box */
        <div className={embedded ? 'absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] border border-red-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 text-slate-200 font-sans min-w-[320px]' : 'bg-[#0f172a] border border-red-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 text-slate-200 font-sans'}>
          
          {/* Animated Disc Icon */}
          <div className="relative">
            <Disc className={`w-6 h-6 text-red-500 ${isPlaying ? 'animate-spin' : 'opacity-60'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </div>

          {/* Track info & selector */}
          <div className="flex flex-col max-w-[210px]">
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <Radio className="w-3 h-3 text-red-400 animate-pulse" />
              Música Aeroespacial
            </span>
            <select
              value={activeTrack}
              onChange={(e) => handleTrackChange(Number(e.target.value))}
              className="bg-[#020617] border border-slate-700 text-slate-200 rounded text-[11px] px-1.5 py-1 outline-none font-sans font-medium mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap focus:border-red-500"
            >
              {tracks.map((t, idx) => (
                <option key={idx} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 border-l border-slate-700/80 pl-2">
            
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`p-2 rounded-xl transition ${
                isPlaying
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isPlaying ? 'Pausar Trilha' : 'Tocar Música'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isMuted ? 'Ativar Áudio' : 'Desativar Mudo'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Collapse/Minimize Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1"
              title="Encolher Player"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      )}
    </div>
  );
};
