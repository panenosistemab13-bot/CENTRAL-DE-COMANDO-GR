import React from 'react';
import { cn } from '../../lib/utils';

interface StatusIndicator3DProps {
  status: 'normal' | 'warning' | 'critical' | 'info';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator3D({
  status,
  label,
  size = 'md',
  className
}: StatusIndicator3DProps) {
  const styles = {
    normal: {
      led: 'led-status-green',
      badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
    },
    warning: {
      led: 'led-status-yellow',
      badge: 'bg-amber-500/15 border-amber-500/40 text-amber-300'
    },
    critical: {
      led: 'led-status-red',
      badge: 'bg-rose-500/15 border-rose-500/40 text-rose-300'
    },
    info: {
      led: 'led-status-blue',
      badge: 'bg-sky-500/15 border-sky-500/40 text-sky-300'
    }
  }[status];

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5'
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-lg border font-mono font-bold uppercase tracking-wider", styles.badge, sizeClasses, className)}>
      <span className={styles.led} />
      {label && <span>{label}</span>}
    </div>
  );
}
