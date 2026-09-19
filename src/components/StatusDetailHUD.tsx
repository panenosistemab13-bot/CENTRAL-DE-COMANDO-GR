import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ListFilter
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
  const [isMinimized, setIsMinimized] = useState(false);
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

  const getStatusBadgeStyle = (status: string) => {
    const norm = normalizeStatus(status);
    if (norm === 'Em Rota Ida' || norm === 'Em Rota Volta') {
      return 'bg-[#E7C88A]/30 text-[#754B2A] border-[#B88935]/40';
    }
    if (norm === 'No Destino') {
      return 'bg-[#3D8B68]/15 text-[#3D8B68] border-[#3D8B68]/30';
    }
    if (norm === 'Extraviada' || norm === 'Possível Extravio') {
      return 'bg-[#B94A48]/15 text-[#B94A48] border-[#B94A48]/30';
    }
    return 'bg-[#F2E4C8] text-[#2C1B12] border-[#754B2A]/20';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative cinema-card cinema-3d p-6 md:p-8 space-y-4 overflow-hidden transition-all duration-300",
        isFullscreen && "fixed inset-0 z-[999] rounded-none p-6 flex flex-col justify-between w-screen h-screen overflow-hidden bg-[#F7F3EC]"
      )}
    >
      <div className="cinema-light -top-40 -left-40" />

      {/* Header Bar */}
      <div 
        className="relative z-10 flex items-center justify-between border-b border-[#754B2A]/10 pb-4 gap-4 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2E4C8] flex items-center justify-center shadow-sm">
            <ListFilter className="w-5 h-5 text-[#754B2A]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[.2em] font-extrabold text-[#B88935]">
              Auditoria de Registros
            </div>
            <h3 className="cinema-title text-2xl text-[#2C1B12]">
              Detalhamento de Iscas por Status ({filteredData.length})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="cinema-button-secondary flex items-center gap-2 text-xs py-2 px-3"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}</span>
          </button>

          <button 
            type="button" 
            className="w-9 h-9 rounded-xl bg-white/80 border border-[#754B2A]/15 flex items-center justify-center text-[#754B2A] hover:bg-[#F2E4C8]"
          >
            {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Table Container */}
      {!isMinimized && (
        <div className={cn("relative z-10 overflow-x-auto", isFullscreen && "flex-1 overflow-y-auto")}>
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#F4EFE6] z-10">
              <tr className="border-b border-[#754B2A]/15 text-[#756D63] text-[10px] uppercase tracking-wider font-extrabold">
                <th className="p-3.5">ID Isca</th>
                <th className="p-3.5">Destino</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Motorista</th>
                <th className="p-3.5">Cavalo</th>
                <th className="p-3.5">Carreta</th>
                <th className="p-3.5">Unidade</th>
                <th className="p-3.5">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#754B2A]/10 text-[#2C1B12]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#756D63] font-medium">
                    Nenhum registro encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredData.map(row => (
                  <tr key={row.id} className="hover:bg-[#E7C88A]/15 transition-colors">
                    <td className="p-3.5 font-extrabold text-[#754B2A] cinema-number">{row.idIsca}</td>
                    <td className="p-3.5 font-bold text-[#2C1B12]">{row.destino || '---'}</td>
                    <td className="p-3.5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border",
                        getStatusBadgeStyle(row.status)
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#524B43]">{row.motorista || '---'}</td>
                    <td className="p-3.5 text-[#754B2A] font-bold cinema-number">{row.cavalo || '---'}</td>
                    <td className="p-3.5 text-[#756D63] cinema-number">{row.carreta || '---'}</td>
                    <td className="p-3.5 text-[#3D8B68] font-bold">{row.unidade}</td>
                    <td className="p-3.5 text-[#756D63] max-w-xs truncate">{row.obs1 || '---'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
