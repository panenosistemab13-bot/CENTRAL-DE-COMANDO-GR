import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function PremiumBarChart({
  data,
  xKey = 'name',
  barKeys = [{ key: 'value', name: 'Valor', color: '#9b1526' }],
  height = 200,
  horizontal = false, // We'll render optimized vertical cylinders that feel premium
  title,
  subtitle,
  unit = '',
  className,
  customColorList
}: PremiumBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Coordinates
  const svgWidth = 600;
  const svgHeight = height;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barGroupWidth = chartWidth / (data.length || 1);
  const cylinderRadius = 8;
  const cylinderRy = 3.5; // perspective flattening of top/bottom caps

  // Find max value in dataset to scale the heights
  const allValues: number[] = [];
  data.forEach(item => {
    barKeys.forEach(bar => {
      const val = Number(item[bar.key]) || 0;
      allValues.push(val);
    });
  });
  const maxVal = Math.max(...allValues, 10) * 1.15; // 15% padding at top

  // Axis helper
  const getYCoordinate = (val: number) => {
    const ratio = Math.min(val / maxVal, 1);
    return paddingTop + chartHeight * (1 - ratio);
  };

  // Color shading helpers
  const getSideColor = (hex: string, factor: number) => {
    const cleanHex = hex.replace('#', '');
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Generate tick marks (4 divisions)
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
            {/* Cylinder Bottom Shadow */}
            <radialGradient id="cylinderGroundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(45, 28, 14, 0.45)" />
              <stop offset="100%" stopColor="rgba(45, 28, 14, 0)" />
            </radialGradient>

            {/* Shaders for each configured key color */}
            {barKeys.map((bar, idx) => {
              const hex = bar.color || (customColorList && customColorList[idx]) || '#9b1526';
              const shadowColor = getSideColor(hex, 0.65);
              const highlightColor = getSideColor(hex, 1.35);
              const glintColor = '#ffffff';

              return (
                <React.Fragment key={bar.key}>
                  {/* Lateral lighting for cylinder body */}
                  <linearGradient id={`cylinderBodyGrad-${bar.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={shadowColor} />
                    <stop offset="25%" stopColor={highlightColor} />
                    <stop offset="60%" stopColor={hex} />
                    <stop offset="85%" stopColor={shadowColor} />
                    <stop offset="100%" stopColor={getSideColor(hex, 0.45)} />
                  </linearGradient>

                  {/* Radial lighting for glossy top cap */}
                  <radialGradient id={`cylinderTopGrad-${bar.key}`} cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor={glintColor} stopOpacity={0.8} />
                    <stop offset="40%" stopColor={highlightColor} />
                    <stop offset="85%" stopColor={hex} />
                    <stop offset="100%" stopColor={shadowColor} />
                  </radialGradient>
                </React.Fragment>
              );
            })}
          </defs>

          {/* Gridlines & Y-Axis Labels */}
          {ticks.map((tick, idx) => {
            const y = getYCoordinate(tick);
            const label = tick === 0 ? '0' : tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick).toString();
            return (
              <g key={idx} className="opacity-75">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#ded5c6"
                  strokeWidth="0.75"
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

          {/* Ground Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#c8bca6"
            strokeWidth="1.5"
          />

          {/* Render 3D Volumetric Cylinders */}
          {data.map((item, idx) => {
            const groupCenterX = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
            const baseY = paddingTop + chartHeight;
            const isGroupHovered = hoveredIndex === idx;

            // Compute offset columns if multiple bar keys are rendered side-by-side
            const totalBars = barKeys.length;
            const gap = 4;
            const barWidth = cylinderRadius * 2;
            const totalWidthOfBars = totalBars * barWidth + (totalBars - 1) * gap;
            const startX = groupCenterX - totalWidthOfBars / 2 + barWidth / 2;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Visual grouping guide */}
                {isGroupHovered && (
                  <rect
                    x={groupCenterX - barGroupWidth / 2 + 2}
                    y={paddingTop - 5}
                    width={barGroupWidth - 4}
                    height={chartHeight + 10}
                    fill="rgba(155, 21, 38, 0.03)"
                    rx="12"
                    stroke="rgba(155, 21, 38, 0.08)"
                    strokeWidth="1"
                    pointerEvents="none"
                  />
                )}

                {barKeys.map((bar, barIdx) => {
                  const val = Number(item[bar.key]) || 0;
                  const topY = getYCoordinate(val);
                  const barHeight = baseY - topY;

                  // Shift coordinate for side-by-side grouping
                  const x = startX + barIdx * (barWidth + gap);

                  return (
                    <g 
                      key={bar.key}
                      className="transition-transform duration-300 origin-bottom"
                      style={{
                        transform: isGroupHovered ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: `${x}px ${baseY}px`
                      }}
                    >
                      {/* Ground Shadow */}
                      <ellipse
                        cx={x}
                        cy={baseY + 1}
                        rx={cylinderRadius * 1.3}
                        ry={cylinderRy * 1.1}
                        fill="url(#cylinderGroundShadow)"
                      />

                      {/* Cylindrical Base (drawn first to sit below body) */}
                      <ellipse
                        cx={x}
                        cy={baseY}
                        rx={cylinderRadius}
                        ry={cylinderRy}
                        fill={`url(#cylinderBodyGrad-${bar.key})`}
                      />

                      {/* Cylindrical Extruded Rect Body */}
                      <rect
                        x={x - cylinderRadius}
                        y={topY}
                        width={cylinderRadius * 2}
                        height={barHeight}
                        fill={`url(#cylinderBodyGrad-${bar.key})`}
                      />

                      {/* 3D Top Cap Ellipse with reflective glass highlight */}
                      <ellipse
                        cx={x}
                        cy={topY}
                        rx={cylinderRadius}
                        ry={cylinderRy}
                        fill={`url(#cylinderTopGrad-${bar.key})`}
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="0.5"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Category Label */}
                <text
                  x={groupCenterX}
                  y={baseY + 16}
                  textAnchor="middle"
                  fontSize="9"
                  className={cn(
                    "font-sans font-bold tracking-wide transition-all",
                    isGroupHovered ? "fill-[#9b1526] font-extrabold" : "fill-stone-600"
                  )}
                >
                  {item[xKey]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3 shadow-xl z-50 font-mono text-[10.5px] pointer-events-none"
              style={{
                left: `${Math.min(
                  Math.max(paddingLeft + hoveredIndex * barGroupWidth - 40, 10),
                  svgWidth - 140
                ) * (100 / svgWidth)}%`,
                top: `${Math.min(getYCoordinate(Math.max(...barKeys.map(b => Number(data[hoveredIndex][b.key]) || 0))) - 25, svgHeight - 70)}px`
              }}
            >
              <p className="font-extrabold text-stone-900 border-b border-[#e7dac9] pb-1 uppercase mb-2">
                {data[hoveredIndex][xKey]}
              </p>
              <div className="space-y-1">
                {barKeys.map(bar => (
                  <div key={bar.key} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[9px]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bar.color }} />
                      {bar.name}:
                    </span>
                    <span className="font-black text-[#9b1526]">
                      {(Number(data[hoveredIndex][bar.key]) || 0).toLocaleString('pt-BR')} {unit}
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
