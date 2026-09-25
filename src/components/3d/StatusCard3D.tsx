import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassPanel3D } from './GlassPanel3D';

interface StatusCard3DProps {
  title: string;
  statusText: string;
  status: 'normal' | 'warning' | 'critical' | 'info';
  description?: string;
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function StatusCard3D({
  title,
  statusText,
  status,
  description,
  icon: Icon,
  className,
  onClick
}: StatusCard3DProps) {
  const statusStyles = {
    normal: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      led: 'led-status-green',
      iconText: 'text-emerald-400'
    },
    warning: {
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      led: 'led-status-yellow',
      iconText: 'text-amber-400'
    },
    critical: {
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      led: 'led-status-red',
      iconText: 'text-rose-400'
    },
    info: {
      border: 'border-sky-500/30',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      led: 'led-status-blue',
      iconText: 'text-sky-400'
    }
  }[status];

  return (
    <GlassPanel3D
      onClick={onClick}
      className={cn("p-4 flex flex-col justify-between relative", statusStyles.border, className)}
      variant="metallic"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={statusStyles.led} />
          <h4 className="text-xs font-mono font-black uppercase text-slate-200 tracking-wide">
            {title}
          </h4>
        </div>
        {Icon && <Icon size={16} className={statusStyles.iconText} />}
      </div>

      <div className="my-1">
        <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border inline-block", statusStyles.badge)}>
          {statusText}
        </span>
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-2">
          {description}
        </p>
      )}
    </GlassPanel3D>
  );
}
