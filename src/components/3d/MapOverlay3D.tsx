import React from 'react';
import { cn } from '../../lib/utils';
import { Compass, Globe2, Activity, ShieldCheck } from 'lucide-react';

interface MapOverlay3DProps {
  title?: string;
  coordinates?: string;
  activeVehiclesCount?: number;
  criticalAlertsCount?: number;
  className?: string;
  children?: React.ReactNode;
}

export function MapOverlay3D({
  title = "Mapa Operacional PGR 3D",
  coordinates = "-19.9167° S, -43.9345° W",
  activeVehiclesCount = 42,
  criticalAlertsCount = 0,
  className,
  children
}: MapOverlay3DProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 hud-grid-bg flex flex-col justify-between p-4", className)}>
      {/* Scanline texture */}
      <div className="scanline-overlay absolute inset-0 z-0 opacity-40" />

      {/* Top Map HUD Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Globe2 size={16} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-white">
              {title}
            </h3>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Compass size={10} /> {coordinates}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono font-bold text-sky-400 flex items-center gap-1.5">
            <Activity size={12} className="animate-pulse" />
            <span>FROTA ATIVA: <strong className="text-white">{activeVehiclesCount}</strong></span>
          </div>

          <div className={cn(
            "px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5",
            criticalAlertsCount > 0
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          )}>
            <ShieldCheck size={12} />
            <span>ALERTAS: <strong>{criticalAlertsCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Center map content / canvas */}
      <div className="relative z-10 flex-1 my-3 flex items-center justify-center">
        {children}
      </div>

      {/* Bottom status bar */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
        <span>SISTEMA DE RASTREAMENTO SATELITAL SGC-PGR</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="led-status led-status-green" /> ONLINE
        </span>
      </div>
    </div>
  );
}
