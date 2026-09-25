import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';

export interface BarKeyConfig {
  key: string;
  name: string;
  color: string;
}

export interface PremiumBarChartProps {
  data: any[];
  xKey?: string;
  barKeys?: BarKeyConfig[];
  height?: number;
  horizontal?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
  className?: string;
  customColorList?: string[];
}

export const DEFAULT_BAR_COLORS = [
  '#00f2ff', // Cyan
  '#7000ff', // Purple
  '#ff0055', // Pink
  '#00ff99', // Emerald
  '#ffcc00', // Gold
  '#2563eb', // Sapphire Blue
];

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl font-mono text-[10px] z-50">
      <p className="font-black text-white uppercase mb-1.5 border-b border-white/5 pb-1 tracking-widest">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-bold text-slate-400 uppercase">
              <span className="w-2 h-2 rounded-full inline-block shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.color || entry.fill, color: entry.color || entry.fill }} />
              {entry.name || entry.dataKey}:
            </span>
            <span className="font-black text-white text-neon" style={{ color: entry.color || entry.fill }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value} {unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PremiumBarChart({
  data,
  xKey = 'name',
  barKeys = [{ key: 'value', name: 'Valor', color: '#00f2ff' }],
  height = 200,
  horizontal = false,
  title,
  subtitle,
  unit,
  className,
  customColorList
}: PremiumBarChartProps) {
  const colors = customColorList || DEFAULT_BAR_COLORS;

  return (
    <div className={cn("w-full bg-transparent border-0 p-0 flex flex-col justify-between overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && (
              <h4 className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-white">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full min-h-0 flex-1" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis dataKey={xKey} type="category" tick={{ fontSize: 9, fill: '#f1f5f9', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: '#f1f5f9', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              </>
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            {barKeys.map((bar, idx) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color || colors[idx % colors.length]}
                radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                barSize={18}
              >
                {data.map((_, cellIdx) => (
                  <Cell 
                    key={`cell-${cellIdx}`} 
                    fill={barKeys.length === 1 && customColorList ? colors[cellIdx % colors.length] : (bar.color || colors[idx % colors.length])}
                    className="transition-all duration-500 hover:brightness-125"
                    style={{ filter: `drop-shadow(0 0 10px ${bar.color || colors[idx % colors.length]}44)` }}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
