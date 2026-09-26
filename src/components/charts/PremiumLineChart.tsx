import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function PremiumLineChart({
  data,
  xKey = 'month',
  lines,
  height = 200,
  title,
  subtitle,
  unit = '',
  className
}: PremiumLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Coordinates mapping
  const svgWidth = 600;
  const svgHeight = height;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const pointCount = data.length || 1;
  const stepX = chartWidth / (pointCount - 1 || 1);

  // Compute maximum value for scaling
  const allValues: number[] = [];
  data.forEach(item => {
    lines.forEach(line => {
      const val = Number(item[line.key]) || 0;
      allValues.push(val);
    });
  });
  const maxVal = Math.max(...allValues, 10) * 1.15; // 15% head padding

  // Coordinates helper
  const getX = (index: number) => paddingLeft + index * stepX;
  const getY = (val: number) => {
    const ratio = Math.min(val / maxVal, 1);
    return paddingTop + chartHeight * (1 - ratio);
  };

  // Helper to construct cubic spline path (Bezier curves)
  const getSplinePath = (lineKey: string) => {
    if (data.length < 2) return '';
    
    let path = `M ${getX(0)} ${getY(Number(data[0][lineKey]) || 0)}`;

    for (let i = 0; i < data.length - 1; i++) {
      const p0X = getX(i === 0 ? 0 : i - 1);
      const p0Y = getY(Number(data[i === 0 ? 0 : i - 1][lineKey]) || 0);

      const p1X = getX(i);
      const p1Y = getY(Number(data[i][lineKey]) || 0);

      const p2X = getX(i + 1);
      const p2Y = getY(Number(data[i + 1][lineKey]) || 0);

      const p3X = getX(i + 2 >= data.length ? data.length - 1 : i + 2);
      const p3Y = getY(Number(data[i + 2 >= data.length ? data.length - 1 : i + 2][lineKey]) || 0);

      // Spline control points tension factor (0.16)
      const cp1X = p1X + (p2X - p0X) / 6;
      const cp1Y = p1Y + (p2Y - p0Y) / 6;
      const cp2X = p2X - (p3X - p1X) / 6;
      const cp2Y = p2Y - (p3Y - p1Y) / 6;

      path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${p2X} ${p2Y}`;
    }

    return path;
  };

  // Construct Area fill path below the spline curve
  const getAreaFillPath = (lineKey: string) => {
    const spline = getSplinePath(lineKey);
    if (!spline) return '';
    const baseY = paddingTop + chartHeight;
    return `${spline} L ${getX(data.length - 1)} ${baseY} L ${getX(0)} ${baseY} Z`;
  };

  // Horizontal ticks
  const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal * 0.95];

  return (
    <div className={cn("w-full bg-transparent flex flex-col justify-between overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && (
              <h4 className="text-xs font-mono font-black uppercase tracking-[0.15em] text-[#9b1526]">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] font-sans font-medium text-stone-500 uppercase tracking-wider mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full relative" style={{ height: svgHeight }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Area Fill Gradients for each line */}
            {lines.map(line => (
              <linearGradient key={`areaGrad-${line.key}`} id={`areaGrad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity={0.28} />
                <stop offset="60%" stopColor={line.color} stopOpacity={0.08} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0.00} />
              </linearGradient>
            ))}

            {/* Glowing Shadow filter for 3D line separation */}
            <filter id="line3DDepthShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
              <feOffset dx="0" dy="3.5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.15" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Gridlines */}
          {ticks.map((tick, idx) => {
            const y = getY(tick);
            const label = tick === 0 ? '0' : tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick).toString();
            return (
              <g key={idx} className="opacity-75">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#ded5c6"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  className="font-mono font-bold text-stone-500 fill-current"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Vertical Interactive Tracker Line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={paddingTop + chartHeight}
              stroke="rgba(155, 21, 38, 0.25)"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
          )}

          {/* Render Layered Splines */}
          {lines.map(line => {
            const splinePath = getSplinePath(line.key);
            const areaPath = getAreaFillPath(line.key);
            if (!splinePath) return null;

            return (
              <g key={line.key}>
                {/* 1. Layered Translucent Area Fill below curve */}
                <path
                  d={areaPath}
                  fill={`url(#areaGrad-${line.key})`}
                  pointerEvents="none"
                />

                {/* 2. Glow/Shadow line offsetted below for 3D floating effect */}
                <path
                  d={splinePath}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="4"
                  opacity="0.18"
                  filter="url(#line3DDepthShadow)"
                  pointerEvents="none"
                />

                {/* 3. Main solid premium line */}
                <path
                  d={splinePath}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </g>
            );
          })}

          {/* Render 3D Nodes/Dots */}
          {lines.map(line => (
            <g key={`dots-${line.key}`}>
              {data.map((item, idx) => {
                const x = getX(idx);
                const y = getY(Number(item[line.key]) || 0);
                const isSelected = hoveredIndex === idx;

                return (
                  <g 
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Concentric Glow Core ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6.5 : 4.5}
                      fill={line.color}
                      opacity={isSelected ? 0.35 : 0.15}
                      className="transition-all duration-300"
                    />
                    
                    {/* Main point stroke */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 4.5 : 3}
                      fill="#ffffff"
                      stroke={line.color}
                      strokeWidth={isSelected ? 2.5 : 1.75}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </g>
          ))}

          {/* Baseline Ground axis */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#c8bca6"
            strokeWidth="1.25"
          />

          {/* X-Axis Category Labels */}
          {data.map((item, idx) => {
            const x = getX(idx);
            const isSelected = hoveredIndex === idx;
            return (
              <text
                key={idx}
                x={x}
                y={paddingTop + chartHeight + 15}
                textAnchor="middle"
                fontSize="8.5"
                className={cn(
                  "font-mono font-bold tracking-wide transition-colors",
                  isSelected ? "fill-[#9b1526] font-extrabold" : "fill-stone-500"
                )}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item[xKey]}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3.5 shadow-xl z-50 font-mono text-[10px] pointer-events-none"
              style={{
                left: `${Math.min(
                  Math.max(getX(hoveredIndex) - 50, 10),
                  svgWidth - 145
                ) * (100 / svgWidth)}%`,
                top: `${Math.max(getY(Math.max(...lines.map(l => Number(data[hoveredIndex][l.key]) || 0))) - 55, 10)}px`
              }}
            >
              <p className="font-extrabold text-stone-900 border-b border-[#e7dac9] pb-1 uppercase mb-2">
                Tempo: {data[hoveredIndex][xKey]}
              </p>
              <div className="space-y-1.5">
                {lines.map(line => (
                  <div key={line.key} className="flex items-center justify-between gap-5">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[9px]">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: line.color }} />
                      {line.name}:
                    </span>
                    <span className="font-black text-[#9b1526]">
                      {(Number(data[hoveredIndex][line.key]) || 0).toLocaleString('pt-BR')} {unit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
