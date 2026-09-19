import React from 'react';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassPanel3D } from './GlassPanel3D';

interface AlertCard3DProps {
  title: string;
  message: string;
  type?: 'critical' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AlertCard3D({
  title,
  message,
  type = 'warning',
  onDismiss,
  action,
  className
}: AlertCard3DProps) {
  const styles = {
    critical: {
      border: 'border-rose-500/50',
      bg: 'bg-rose-950/40',
      text: 'text-rose-200',
      icon: AlertOctagon,
      iconColor: 'text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white'
    },
    warning: {
      border: 'border-amber-500/50',
      bg: 'bg-amber-950/40',
      text: 'text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white'
    },
    info: {
      border: 'border-sky-500/50',
      bg: 'bg-sky-950/40',
      text: 'text-sky-200',
      icon: Info,
      iconColor: 'text-sky-400',
      btn: 'bg-sky-600 hover:bg-sky-500 text-white'
    },
    success: {
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    }
  }[type];

  const Icon = styles.icon;

  return (
    <GlassPanel3D className={cn("p-4 border relative", styles.border, styles.bg, className)} variant="metallic">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("p-2 rounded-xl border border-white/10 shrink-0 bg-slate-900/60", styles.iconColor)}>
            <Icon size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-mono font-black uppercase tracking-wide text-white">
              {title}
            </h4>
            <p className={cn("text-xs font-sans mt-0.5 leading-relaxed", styles.text)}>
              {message}
            </p>
            {action && (
              <button
                onClick={action.onClick}
                className={cn("mt-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer", styles.btn)}
              >
                {action.label}
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </GlassPanel3D>
  );
}
