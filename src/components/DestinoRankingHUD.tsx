import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';

export interface DestinoStatItem {
  name: string;
  count: number;
  iscas: string[];
  drivers: string[];
}

interface DestinoRankingHUDProps {
  destinoStats: DestinoStatItem[];
}

export const DestinoRankingHUD: React.FC<DestinoRankingHUDProps> = ({ destinoStats }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_35px_rgba(0,240,255,0.08)] space-y-4 font-mono relative overflow-hidden transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 flex flex-col justify-between w-screen h-screen overflow-hidden bg-[#020617]"
      )}
    >
      {/* Corner Tech Brackets in Fullscreen */}
      {isFullscreen && (
        <>
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
        </>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 gap-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          RANKING DE ISCAS POR DESTINO (BARRAS LATERAIS)
        </h3>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-cyan-400/60 font-bold hidden sm:inline">
            TOTAL DESTINOS: {destinoStats.length}
          </span>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Ranking em Tela Cheia"}
            className={cn(
              "px-3 py-1.5 rounded-xl border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer text-[10px]",
              isFullscreen
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_#00f0ff]"
                : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400"
            )}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-950" />
                <span>SAIR DA TELA CHEIA (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>TELA CHEIA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className={cn("w-full transition-all", isFullscreen ? "flex-1 min-h-0" : "h-[300px]")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={destinoStats} margin={{ left: 10, right: 20, top: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff" strokeOpacity={0.15} />
            <XAxis dataKey="name" stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 11, fontFamily: 'monospace' }} />
            <YAxis stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 11, fontFamily: 'monospace' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#030712', borderColor: '#00f0ff', borderRadius: '12px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
            />
            <Bar dataKey="count" fill="#00f0ff" radius={[8, 8, 0, 0]}>
              {destinoStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f0ff' : '#0066ff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
