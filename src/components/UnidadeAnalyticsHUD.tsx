import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Building2, Maximize2, Minimize2, Radio, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { GlassPanel3D } from './3d/GlassPanel3D';

export interface UnidadeStatItem {
  name: string;
  count: number;
}

interface UnidadeAnalyticsHUDProps {
  unidadeStats?: UnidadeStatItem[];
  totalDataCount?: number;
  data?: any[];
}

const DEFAULT_UNIDADES: UnidadeStatItem[] = [
  { name: 'SANTA LUZIA - MG', count: 48 },
  { name: 'LONDRINA - PR', count: 32 },
  { name: 'SUMARÉ - SP', count: 26 },
  { name: 'GRAVATAÍ - RS', count: 18 },
  { name: 'CUIABÁ - MT', count: 14 }
];

export const UnidadeAnalyticsHUD: React.FC<UnidadeAnalyticsHUDProps> = ({
  unidadeStats,
  totalDataCount,
  data
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const computedStats = useMemo(() => {
    if (unidadeStats && unidadeStats.length > 0) return unidadeStats;
    if (data && data.length > 0) {
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const uni = item.unidade || 'SANTA LUZIA - MG';
        counts[uni] = (counts[uni] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }
    return DEFAULT_UNIDADES;
  }, [unidadeStats, data]);

  const total = useMemo(() => {
    if (totalDataCount && totalDataCount > 0) return totalDataCount;
    return computedStats.reduce((acc, curr) => acc + curr.count, 0) || 1;
  }, [totalDataCount, computedStats]);

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
    <section
      ref={containerRef}
      className={cn(
        "flex flex-col gap-6 font-mono relative transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 p-6 w-screen h-screen overflow-y-auto bg-[#070a12]"
      )}
    >
      <GlassPanel3D className="p-6 flex flex-col gap-6 relative overflow-hidden" variant="metallic">
        {/* Top HUD Status Header of Unidades */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-500/30">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-400 shadow-[0_0_12px_#38bdf8]"></span>
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-sky-300 flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-sky-400 animate-pulse" />
                PAINEL OPERACIONAL DE UNIDADES E POLOS // UNIDADES HUD 3D
              </h2>
              <span className="text-[10px] text-sky-400/80 flex items-center gap-2 mt-0.5">
                <span>UNIDADES REGISTRADAS: {computedStats.length}</span>
                <span className="text-sky-500">•</span>
                <span className="text-white font-bold">TOTAL DE ISCAS PROCESSADAS: {total}</span>
              </span>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Painel de Unidades em Tela Cheia"}
            className={cn(
              "px-4 py-2 rounded-xl border font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer text-xs self-start sm:self-auto",
              isFullscreen
                ? "bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.5)] font-black"
                : "bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-sky-500/20 hover:border-sky-400"
            )}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-slate-950" />
                <span>SAIR DA TELA CHEIA (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-sky-400" />
                <span>TELA CHEIA</span>
              </>
            )}
          </button>
        </div>

        {/* Unidades Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {computedStats.map((item, idx) => {
            const percentage = ((item.count / total) * 100).toFixed(1);
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-sky-400/60 transition-all shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-black text-white uppercase truncate">{item.name}</span>
                  <span className="text-[10px] font-mono font-extrabold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden my-2 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono text-slate-400 mt-1">
                  <span>DISPOSITIVOS ALOCADOS</span>
                  <span className="text-base font-black text-white">{item.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel3D>
    </section>
  );
};

export default UnidadeAnalyticsHUD;
