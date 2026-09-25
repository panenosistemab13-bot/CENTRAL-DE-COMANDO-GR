import React from 'react';
import { Truck, ShieldCheck, Clock, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { GlassPanel3D } from './GlassPanel3D';
import { StatusIndicator3D } from './StatusIndicator3D';
import { cn } from '../../lib/utils';

interface VehicleCard3DProps {
  plate: string;
  driver?: string;
  type?: string;
  status: 'patio' | 'viagem' | 'manutencao' | 'checklist_pendente';
  entryTime?: string;
  checklistStatus?: 'ok' | 'pendente' | 'vencido';
  docStatus?: 'ok' | 'atencao' | 'vencido';
  onClick?: () => void;
  className?: string;
}

export function VehicleCard3D({
  plate,
  driver,
  type = 'Caminhão Reboque',
  status,
  entryTime,
  checklistStatus = 'ok',
  docStatus = 'ok',
  onClick,
  className
}: VehicleCard3DProps) {
  const statusMap = {
    patio: { label: 'No Pátio', type: 'normal' as const },
    viagem: { label: 'Em Viagem', type: 'info' as const },
    manutencao: { label: 'Manutenção', type: 'warning' as const },
    checklist_pendente: { label: 'Checklist Pendente', type: 'critical' as const }
  }[status];

  return (
    <GlassPanel3D
      onClick={onClick}
      className={cn("p-4.5 flex flex-col justify-between relative group hover:border-sky-400/50 transition-all", className)}
      variant="metallic"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-sky-400">
            <Truck size={18} />
          </div>
          <div>
            <h4 className="text-sm font-mono font-black tracking-wider text-white uppercase">
              {plate}
            </h4>
            <span className="text-[10px] font-sans font-medium text-slate-400">
              {type}
            </span>
          </div>
        </div>

        <StatusIndicator3D status={statusMap.type} label={statusMap.label} size="sm" />
      </div>

      {/* Driver info */}
      {driver && (
        <div className="flex items-center gap-2 text-xs text-slate-300 font-sans my-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
          <User size={14} className="text-slate-400 shrink-0" />
          <span className="truncate font-semibold">{driver}</span>
        </div>
      )}

      {/* Details Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        {entryTime && (
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-500" />
            <span>Entrada: {entryTime}</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className={cn(
            "px-2 py-0.5 rounded border text-[9px] font-bold uppercase flex items-center gap-1",
            checklistStatus === 'ok' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          )}>
            <ShieldCheck size={10} /> Checklist
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded border text-[9px] font-bold uppercase flex items-center gap-1",
            docStatus === 'ok' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          )}>
            <FileText size={10} /> Docs
          </span>
        </div>
      </div>
    </GlassPanel3D>
  );
}
