import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IscaDataRow } from './Slides';

interface StatusDetailHUDProps {
  filteredData: IscaDataRow[];
  normalizeStatus: (status: string) => string;
  STATUS_CATEGORIES: Array<{ key: string; label: string; color: string; glow: string }>;
}

export const StatusDetailHUD: React.FC<StatusDetailHUDProps> = ({
  filteredData,
  normalizeStatus,
  STATUS_CATEGORIES
}) => {
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
        "bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.08)] space-y-4 font-mono relative overflow-hidden transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 flex flex-col justify-between w-screen h-screen overflow-hidden bg-[#020617]"
      )}
    >
      {/* Corner Decorative Tech Brackets for Fullscreen or HUD feel */}
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
          <Zap className="w-4 h-4 text-cyan-400" />
          DETALHAMENTO DE ISCAS POR STATUS ({filteredData.length})
        </h3>

        {/* Full Screen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Detalhamento em Tela Cheia"}
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

      {/* Table Container */}
      <div className={cn("overflow-x-auto", isFullscreen && "flex-1 overflow-y-auto")}>
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-950 z-10">
            <tr className="border-b border-cyan-500/20 text-cyan-400/70 text-[10px] uppercase tracking-wider">
              <th className="p-3">ID ISCA</th>
              <th className="p-3">DESTINO</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">MOTORISTA</th>
              <th className="p-3">PLACA (CAVALO)</th>
              <th className="p-3">CARRETA</th>
              <th className="p-3">UNIDADE</th>
              <th className="p-3">OBSERVACAO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/10 text-slate-300">
            {filteredData.map(row => {
              const norm = normalizeStatus(row.status);
              const cat = STATUS_CATEGORIES.find(c => c.key === norm) || { color: '#00f0ff' };
              return (
                <tr key={row.id} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="p-3 font-bold text-cyan-300">{row.idIsca}</td>
                  <td className="p-3 font-bold text-white">{row.destino || '---'}</td>
                  <td className="p-3">
                    <span 
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}40` }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">{row.motorista || '---'}</td>
                  <td className="p-3 text-cyan-400 font-bold">{row.cavalo || '---'}</td>
                  <td className="p-3 text-slate-400">{row.carreta || '---'}</td>
                  <td className="p-3 text-emerald-400 font-bold">{row.unidade}</td>
                  <td className="p-3 text-slate-400">{row.obs1 || '---'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
