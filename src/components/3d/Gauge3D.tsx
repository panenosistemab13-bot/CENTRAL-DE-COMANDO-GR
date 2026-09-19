import React from 'react';
import { cn } from '../../lib/utils';

interface Gauge3DProps {
  value: number; // 0 to 100
  label: string;
  size?: number;
  status?: 'normal' | 'warning' | 'critical' | 'info';
  unit?: string;
  className?: string;
}

export function Gauge3D({
  value,
  label,
  size = 140,
  status = 'info',
  unit = '%',
  className
}: Gauge3DProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * (circumference * 0.75); // 270 degree arc

  const statusColors = {
    normal: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
    info: '#38bdf8'
  }[status];

  return (
    <div className={cn("flex flex-col items-center justify-center relative select-none", className)}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG Volumetric Circular Radial Arc */}
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />

          {/* Active 3D Arc Value */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={statusColors}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${statusColors})`,
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>

        {/* Center Value Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {clampedValue}
            <span className="text-xs text-slate-400 font-normal">{unit}</span>
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 max-w-[80px] truncate">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
