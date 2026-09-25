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
    <div className="bg-white/95 backdrop-blur-xl border border-[#9b1526]/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(155,21,38,0.15)] font-mono text-[10px] z-50">
      <p className="font-black text-stone-400 uppercase text-[9px] flex items-center gap-2 mb-2 tracking-widest">
        <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: entry.payload.color || entry.fill }} />
        {entry.name}
      </p>
      <p className="font-black text-stone-900 text-sm" style={{ color: entry.payload.color || entry.fill }}>
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

      <div className="flex items-center justify-center gap-8 my-auto">
        {/* Ring / Donut */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: height, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.35}
                outerRadius={height * 0.46}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={entry.color} 
                    className="transition-all duration-700 hover:brightness-110 cursor-pointer"
                    style={{ filter: `drop-shadow(0 4px 12px ${entry.color}33)` }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black font-mono text-stone-900 leading-none tracking-tighter">
              {totalVal}
            </span>
            <span className="text-[9px] font-black text-[#9b1526] uppercase mt-2 tracking-[0.2em] opacity-60">
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-3 font-mono text-[10px] font-black overflow-hidden border-l-2 border-stone-100 pl-6">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group cursor-pointer transition-transform hover:translate-x-1">
                <span className="w-3 h-3 rounded-full shrink-0 shadow-md border-2 border-white" style={{ backgroundColor: item.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-[120px] uppercase text-stone-400 group-hover:text-stone-900 transition-colors text-[9px] tracking-widest mb-0.5">
                    {item.name}
                  </span>
                  <span className="text-stone-900">
                    {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
                    {unit && <span className="ml-1 opacity-40 font-bold">{unit}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

