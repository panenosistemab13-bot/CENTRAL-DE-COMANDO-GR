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
  '#9b1526', // Red 3C
  '#06b6d4', // Cyan
  '#dfb15b', // Gold
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
];

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-[#9b1526]/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(155,21,38,0.15)] font-mono text-[10px] z-50">
      <p className="font-black text-stone-900 uppercase mb-2 border-b border-stone-100 pb-2 tracking-widest text-[11px]">
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 font-black text-stone-400 uppercase text-[9px] tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name || entry.dataKey}:
            </span>
            <span className="font-black text-stone-900" style={{ color: entry.color || entry.fill }}>
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
  barKeys = [{ key: 'value', name: 'Valor', color: '#9b1526' }],
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
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#9b1526]">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest mt-1.5">
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
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.04)" vertical={false} />
            {horizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#78716c', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis dataKey={xKey} type="category" tick={{ fontSize: 9, fill: '#1c1917', fontWeight: '900', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: '#1c1917', fontWeight: '900', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#78716c', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              </>
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
            {barKeys.map((bar, idx) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color || colors[idx % colors.length]}
                radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                barSize={16}
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((_, cellIdx) => (
                  <Cell 
                    key={`cell-${cellIdx}`} 
                    fill={barKeys.length === 1 && customColorList ? colors[cellIdx % colors.length] : (bar.color || colors[idx % colors.length])}
                    className="transition-all duration-700 hover:brightness-110 cursor-pointer"
                    style={{ filter: `drop-shadow(0 4px 10px ${bar.color || colors[idx % colors.length]}33)` }}
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

