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
    <div className="bg-[#fbf9f5]/95 backdrop-blur-2xl border border-[#9b1526]/20 rounded-2xl p-4 shadow-[0_25px_50px_-12px_rgba(155,21,38,0.2)] z-50 ring-1 ring-white/20">
      <p className="font-black text-stone-900 uppercase mb-3 border-b border-[#9b1526]/10 pb-2 tracking-[0.2em] text-[10px]">
        {label}
      </p>
      <div className="space-y-2.5">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-8">
            <span className="flex items-center gap-2.5 font-bold text-stone-500 uppercase text-[9px] tracking-widest">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block shadow-[0_0_8px_rgba(0,0,0,0.1)] ring-2 ring-white" 
                style={{ backgroundColor: entry.color }} 
              />
              {entry.name || entry.dataKey}
            </span>
            <span className="font-black text-[#9b1526] tabular-nums">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
              {unit && <span className="ml-1 text-[8px] opacity-60">{unit}</span>}
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
    <div className={cn(
      "group relative w-full bg-[#fbf9f5]/40 backdrop-blur-md border border-[#9b1526]/5 rounded-[2.5rem] p-7 transition-all duration-700 hover:bg-[#fbf9f5]/60 hover:border-[#9b1526]/20 hover:shadow-[0_30px_60px_-15px_rgba(155,21,38,0.1)] overflow-hidden",
      className
    )}>
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9b1526]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#9b1526]/10 transition-colors duration-700" />
      
      {(title || subtitle) && (
        <div className="mb-6 relative z-10">
          {title && (
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9b1526]/80 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#9b1526]/20" />
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[12px] font-bold text-stone-900 mt-2 tracking-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="w-full relative z-10" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {lines.map((line) => (
                <React.Fragment key={`defs-${line.key}`}>
                  <linearGradient id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={line.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                  <filter id={`glow-${line.key}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </React.Fragment>
              ))}
            </defs>
            <CartesianGrid 
              strokeDasharray="8 8" 
              stroke="#9b1526" 
              strokeOpacity={0.03} 
              vertical={false} 
            />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 9, fill: '#78716c', fontWeight: '700', letterSpacing: '0.1em' }} 
              axisLine={false} 
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#78716c', fontWeight: '500' }} 
              axisLine={false} 
              tickLine={false}
              dx={-5}
            />
            <Tooltip 
              content={<CustomTooltip unit={unit} />} 
              cursor={{ stroke: '#9b1526', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />
            {lines.map((line) => (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#grad-${line.key})`}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  stroke: line.color, 
                  strokeWidth: 4, 
                  fill: '#fbf9f5',
                  className: "shadow-xl"
                }}
                animationBegin={200}
                animationDuration={2000}
                animationEasing="ease-in-out"
                filter={`url(#glow-${line.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

