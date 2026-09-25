import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { cn } from '../../lib/utils';

export interface DonutDataConfig {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface PremiumDonutChartProps {
  data: DonutDataConfig[];
  height?: number;
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  unit?: string;
  className?: string;
}

function CustomTooltip({ active, payload, unit }: any) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl font-mono text-[10px] z-50">
      <p className="font-bold text-slate-400 uppercase text-[9px] flex items-center gap-1.5 mb-1 tracking-widest">
        <span className="w-2 h-2 rounded-full inline-block shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.payload.color || entry.fill, color: entry.payload.color || entry.fill }} />
        {entry.name}:
      </p>
      <p className="font-black text-white text-xs text-neon" style={{ color: entry.payload.color || entry.fill }}>
        {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value} {unit || ''}
      </p>
    </div>
  );
}

export default function PremiumDonutChart({
  data,
  height = 180,
  title,
  subtitle,
  centerLabel = 'Total',
  centerValue,
  showLegend = true,
  unit,
  className
}: PremiumDonutChartProps) {
  const totalVal = centerValue !== undefined 
    ? centerValue 
    : data.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('pt-BR');

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

      <div className="flex items-center justify-center gap-4 my-auto">
        {/* Ring / Donut */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: height, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.32}
                outerRadius={height * 0.45}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={entry.color} 
                    className="transition-all duration-500 hover:brightness-125"
                    style={{ filter: `drop-shadow(0 0 10px ${entry.color}44)` }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black font-mono text-white leading-none text-neon">
              {totalVal}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1 tracking-widest">
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-2 font-mono text-[9px] text-slate-400 font-bold overflow-hidden border-l border-white/5 pl-4">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 group cursor-default">
                <span className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                <span className="truncate max-w-[100px] uppercase font-bold text-slate-500 group-hover:text-slate-200 transition-colors">
                  {item.name}
                </span>
                <span className="font-black text-white ml-auto">
                  {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
