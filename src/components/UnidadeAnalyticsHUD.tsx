import React, { useState, useRef, useEffect } from 'react';
import { Building2, Maximize2, Minimize2, Radio, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export interface UnidadeStatItem {
  name: string;
  count: number;
}

interface UnidadeAnalyticsHUDProps {
  unidadeStats: UnidadeStatItem[];
  totalDataCount: number;
}

export const UnidadeAnalyticsHUD: React.FC<UnidadeAnalyticsHUDProps> = ({
  unidadeStats,
  totalDataCount
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

  const total = totalDataCount || 1;

  return (
    <section
      ref={containerRef}
      className={cn(
        "bg-gradient-to-b from-[#020617] via-[#070e24] to-[#020617] backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(0,240,255,0.18)] relative overflow-hidden group transition-all duration-300 space-y-6 font-mono",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 flex flex-col justify-between w-screen h-screen overflow-y-auto bg-[#020617]"
      )}
    >
      {/* Corner Decorative Tech Brackets */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />

      {/* Top HUD Status Header of Unidades */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-300 shadow-[0_0_12px_#00f0ff]"></span>
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              <Building2 className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              PAINEL OPERACIONAL DE UNIDADES E POLOS // UNIDADES HUD
            </h2>
            <span className="text-[10px] text-cyan-400/70 flex items-center gap-2 mt-0.5">
              <span>UNIDADES REGISTRADAS: {unidadeStats.length}</span>
              <span className="text-cyan-500">•</span>
              <span className="text-cyan-200 font-bold">TOTAL DE ISCAS PROCESSADAS: {totalDataCount}</span>
            </span>
          </div>
        </div>

        {/* Full Screen Toggle Control Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Painel de Unidades em Tela Cheia"}
          className={cn(
            "px-4 py-2 rounded-xl border font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer text-xs self-start sm:self-auto",
            isFullscreen
              ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_25px_#00f0ff]"
              : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-slate-950" />
              <span>SAIR DA TELA CHEIA (ESC)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>TELA CHEIA</span>
            </>
          )}
        </button>
      </div>

      {/* Unit Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {unidadeStats.map(unit => {
          const percentage = Math.round((unit.count / total) * 100);
          return (
            <div
              key={unit.name}
              className="bg-slate-950/90 border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,240,255,0.08)] flex flex-col justify-between space-y-4 hover:border-cyan-300 transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-cyan-300 drop-shadow-[0_0_10px_#00f0ff]">{unit.count}</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">{unit.name}</h3>
                <p className="text-xs text-cyan-400/70 mt-1">UNIDADE OPERACIONAL DE ORIGEM</p>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 text-xs flex items-center justify-between text-slate-400">
                <span>PERCENTUAL OPERACIONAL:</span>
                <strong className="text-cyan-300 font-bold">
                  {percentage}%
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Units Table */}
      <div className="bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.08)] space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            ISCAS POR UNIDADE DA CIDADE
          </h3>
          <span className="text-[10px] text-cyan-400/60 font-bold">
            DISTRIBUIÇÃO PERCENTUAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 text-cyan-400/70 text-[10px] uppercase tracking-wider">
                <th className="p-3">UNIDADE / CIDADE</th>
                <th className="p-3">QTD ISCAS</th>
                <th className="p-3">PERCENTUAL</th>
                <th className="p-3">STATUS UNIDADE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 text-slate-300">
              {unidadeStats.map(unit => {
                const percentage = Math.round((unit.count / total) * 100);
                return (
                  <tr key={unit.name} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="p-3 font-bold text-white text-sm">{unit.name}</td>
                    <td className="p-3 font-bold text-cyan-300 text-sm">{unit.count} ISCAS</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-500/30">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-300 font-bold">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        ONLINE // ATIVA
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
