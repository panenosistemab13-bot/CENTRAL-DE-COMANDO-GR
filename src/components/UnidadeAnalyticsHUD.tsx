import React, { useState, useRef, useEffect } from 'react';
import { Building2, Maximize2, Minimize2, Sparkles } from 'lucide-react';
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
      containerRef.current?.requestFullscreen().catch(() => {});
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
        "relative cinema-card cinema-3d p-5 md:p-7 lg:p-8 overflow-hidden space-y-6",
        isFullscreen && "fixed inset-0 z-[999] rounded-none w-screen h-screen overflow-auto bg-[#F7F3EC]"
      )}
    >
      <div className="cinema-light -top-40 -right-40" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#754B2A]/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E7C88A] to-[#B88935] flex items-center justify-center shadow-[0_15px_35px_rgba(117,75,42,.20)]">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#3D8B68]" />
              <span className="text-[10px] uppercase tracking-[.22em] font-extrabold text-[#B88935]">
                Distribuição por Unidade
              </span>
            </div>
            <h2 className="cinema-title text-3xl md:text-4xl text-[#2C1B12]">
              Desempenho por Filial
            </h2>
            <span className="text-xs text-[#756D63]">
              Volumetria e demanda operacional em tempo real
            </span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="cinema-button flex items-center gap-2 self-start sm:self-auto text-xs py-2 px-4"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</span>
        </button>
      </div>

      {/* CARDS DAS FILIAIS */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {unidadeStats.map((unidade, index) => {
          const pct = Math.round((unidade.count / total) * 100);

          return (
            <div
              key={index}
              className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                bg-white/80
                border
                border-white
                p-6
                shadow-[0_20px_50px_rgba(67,46,28,.08)]
                hover:-translate-y-2
                transition-all
                duration-500
              "
            >
              {/* Reflexo */}
              <div className="
                absolute
                -right-20
                -top-20
                w-48
                h-48
                rounded-full
                bg-[#E7C88A]/25
                blur-3xl
              " />

              <div className="relative">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[.18em] font-extrabold text-[#B88935]">
                      Unidade operacional
                    </div>
                    <h3 className="cinema-title text-2xl text-[#2C1B12] mt-1">
                      {unidade.name}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E7C88A] to-[#B88935] flex items-center justify-center shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between mt-8">
                  <div>
                    <span className="text-4xl cinema-number text-[#2C1B12]">
                      {unidade.count}
                    </span>
                    <span className="text-xs text-[#756D63] ml-2">
                      viagens
                    </span>
                  </div>

                  <span className="text-sm font-extrabold text-[#3D8B68]">
                    {pct}%
                  </span>
                </div>

                <div className="mt-5 h-3 rounded-full bg-[#E9E1D5] overflow-hidden p-[2px]">
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-[#E7C88A]
                      via-[#B88935]
                      to-[#754B2A]
                      transition-all
                      duration-700
                    "
                    style={{
                      width: `${pct}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
