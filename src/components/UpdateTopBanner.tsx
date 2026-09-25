import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Radio, Clock } from 'lucide-react';
import { useAppVersion } from '../utils/version';
import { cn } from '../lib/utils';

interface UpdateTopBannerProps {
  className?: string;
}

export default function UpdateTopBanner({ className }: UpdateTopBannerProps) {
  const { lastUpdateDate, isNewVersionAvailable, reloadApp, isAIStudio, updateDateToNow } = useAppVersion();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleManualDateUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDateToNow();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      id="top-update-banner"
      className={cn(
        "w-full z-50 sticky top-0 bg-slate-950/80 backdrop-blur-md text-slate-200 border-b border-white/10 shadow-lg select-none transition-all duration-300",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Status Dot + Última Atualização + Data */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Pulsing indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="font-sans font-bold uppercase text-[10px] sm:text-xs tracking-wider text-slate-400 shrink-0">
              Última sincronização:
            </span>
            <span className="font-mono font-bold text-[11px] sm:text-xs text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-white/10 tracking-wide truncate">
              {lastUpdateDate}
            </span>
          </div>
        </div>

        {/* Right Side: Action Button (AI Studio Interactive Update / Reload Notice) */}
        <div className="flex items-center gap-2 shrink-0">
          {isNewVersionAvailable ? (
            <button
              onClick={reloadApp}
              className="bg-[#B32025] hover:bg-[#c9252a] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-white/20 animate-pulse cursor-pointer"
              title="Clique para atualizar para a versão mais recente"
            >
              <RefreshCw size={11} className="animate-spin" />
              <span>Nova Atualização (Atualizar)</span>
            </button>
          ) : isAIStudio ? (
            <button
              type="button"
              onClick={handleManualDateUpdate}
              disabled={isUpdating}
              className={cn(
                "flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer select-none active:scale-95 shadow-xs",
                isSuccess
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/50"
                  : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"
              )}
              title="Atualizar data e hora da última modificação para agora (exclusivo AI Studio)"
            >
              {isSuccess ? (
                <CheckCircle2 size={11} className="stroke-[3] text-white shrink-0" />
              ) : (
                <RefreshCw size={11} className={cn("shrink-0 text-emerald-400", isUpdating && "animate-spin")} />
              )}
              <span>
                {isUpdating ? "ATUALIZANDO..." : isSuccess ? "DATA ATUALIZADA!" : "ATUALIZAR DATA"}
              </span>
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}
