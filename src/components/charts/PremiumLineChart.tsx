import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { cn } from '../../lib/utils';

export interface LineKeyConfig {
  key: string;
  name: string;
  color: string;
}

export interface PremiumLineChartProps {
  data: any[];
  xKey?: string;
  lines: LineKeyConfig[];
  height?: number;
  title?: string;
  subtitle?: string;
  unit?: string;
  className?: string;
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl p-3 shadow-md font-mono text-xs z-50">
      <p className="font-black text-stone-900 uppercase mb-1.5 border-b border-[#e7dac9] pb-1">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-bold text-stone-600 uppercase text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name || entry.dataKey}:
            </span>
            <span className="font-extrabold text-stone-900">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value} {unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PremiumLineChart({
  data,
  xKey = 'month',
  lines,
  height = 200,
  title,
  subtitle,
  unit,
  className
}: PremiumLineChartProps) {
  return (
    <div className={cn("w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            {title && (
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-stone-900">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] font-sans font-medium text-stone-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full min-h-0 flex-1" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              {lines.map((line) => (
                <linearGradient key={`grad-${line.key}`} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ded0" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#181a1f', fontWeight: 'bold', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#grad-${line.key})`}
                dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#ffffff' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
