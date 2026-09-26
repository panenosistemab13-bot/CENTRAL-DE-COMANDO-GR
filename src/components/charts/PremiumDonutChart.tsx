import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function PremiumDonutChart({
  data,
  height = 180,
  title,
  subtitle,
  centerLabel = 'Total',
  centerValue,
  showLegend = true,
  unit = '',
  className
}: PremiumDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalVal = centerValue !== undefined 
    ? centerValue 
    : data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Geometric configuration for isometric 3D tilt
  const size = height;
  const cx = size / 2;
  const cy = size / 2 - 5; // Adjust slightly upwards to balance the 3D extrusion height
  const rxOut = size * 0.44;
  const ryOut = size * 0.28; // Tilted Y-radius
  const rxIn = size * 0.24;
  const ryIn = size * 0.15;  // Tilted inner Y-radius
  const extrusionHeight = 12; // 3D depth in pixels

  // Compute angles and segments
  const totalValueSum = data.reduce((acc, curr) => acc + (curr.value || 0), 0) || 1;
  let cumulativePercent = 0;

  const slices = data.map((item, idx) => {
    const percent = item.value / totalValueSum;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    const endPercent = cumulativePercent;

    // Convert percent to angles (in radians, starting from -PI/2)
    const startAngle = startPercent * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPercent * 2 * Math.PI - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const largeArc = percent > 0.5 ? 1 : 0;

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle,
      largeArc,
      index: idx,
      percent
    };
  });

  // Color shading helpers for realistic 3D lighting
  const getShadedColor = (hexColor: string, factor: number) => {
    // Basic hex darkener/lightener
    const cleanHex = hexColor.replace('#', '');
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);

    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto">
        {/* Render 3D Donut SVG */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size + 15 }}>
          
          <svg
            width={size}
            height={size + 15}
            viewBox={`0 0 ${size} ${size + 15}`}
            className="overflow-visible"
          >
            <defs>
              {/* Ground shadow drop */}
              <radialGradient id="donutGroundShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(45, 28, 14, 0.4)" />
                <stop offset="70%" stopColor="rgba(45, 28, 14, 0.15)" />
                <stop offset="100%" stopColor="rgba(45, 28, 14, 0)" />
              </radialGradient>

              {/* Glass reflection filter */}
              <filter id="premiumHighlightGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient drop shadow behind the 3D block */}
            <ellipse
              cx={cx}
              cy={cy + extrusionHeight + 8}
              rx={rxOut * 1.05}
              ry={ryOut * 1.1}
              fill="url(#donutGroundShadow)"
              className="opacity-90"
            />

            {/* Painter's algorithm: Render from back-to-front or side-walls first, then top faces */}
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              const hoverShift = isHovered ? 6 : 0;
              const shiftX = Math.cos(slice.midAngle) * hoverShift;
              const shiftY = Math.sin(slice.midAngle) * hoverShift;

              // Top outer/inner coordinates
              const x1Out = cx + rxOut * Math.cos(slice.startAngle);
              const y1Out = cy + ryOut * Math.sin(slice.startAngle);
              const x2Out = cx + rxOut * Math.cos(slice.endAngle);
              const y2Out = cy + ryOut * Math.sin(slice.endAngle);

              const x1In = cx + rxIn * Math.cos(slice.startAngle);
              const y1In = cy + ryIn * Math.sin(slice.startAngle);
              const x2In = cx + rxIn * Math.cos(slice.endAngle);
              const y2In = cy + ryIn * Math.sin(slice.endAngle);

              // Shading variants
              const baseColor = slice.color;
              const sideColor = getShadedColor(baseColor, 0.7); // darker side wall
              const innerSideColor = getShadedColor(baseColor, 0.55); // even darker inner cavity wall
              const highlightColor = getShadedColor(baseColor, 1.25); // bright top reflection

              // SVG Arc flag strings
              const sweepClockwise = 1;
              const sweepCounterClockwise = 0;

              // SVG Paths
              const topFacePath = `
                M ${x1Out} ${y1Out}
                A ${rxOut} ${ryOut} 0 ${slice.largeArc} ${sweepClockwise} ${x2Out} ${y2Out}
                L ${x2In} ${y2In}
                A ${rxIn} ${ryIn} 0 ${slice.largeArc} ${sweepCounterClockwise} ${x1In} ${y1In}
                Z
              `;

              const outerWallPath = `
                M ${x1Out} ${y1Out}
                A ${rxOut} ${ryOut} 0 ${slice.largeArc} ${sweepClockwise} ${x2Out} ${y2Out}
                L ${x2Out} ${y2Out + extrusionHeight}
                A ${rxOut} ${ryOut} 0 ${slice.largeArc} ${sweepCounterClockwise} ${x1Out} ${y1Out + extrusionHeight}
                Z
              `;

              const innerWallPath = `
                M ${x1In} ${y1In}
                A ${rxIn} ${ryIn} 0 ${slice.largeArc} ${sweepClockwise} ${x2In} ${y2In}
                L ${x2In} ${y2In + extrusionHeight}
                A ${rxIn} ${ryIn} 0 ${slice.largeArc} ${sweepCounterClockwise} ${x1In} ${y1In + extrusionHeight}
                Z
              `;

              const startRadialWallPath = `
                M ${x1In} ${y1In}
                L ${x1Out} ${y1Out}
                L ${x1Out} ${y1Out + extrusionHeight}
                L ${x1In} ${y1In + extrusionHeight}
                Z
              `;

              const endRadialWallPath = `
                M ${x2In} ${y2In}
                L ${x2Out} ${y2Out}
                L ${x2Out} ${y2Out + extrusionHeight}
                L ${x2In} ${y2In + extrusionHeight}
                Z
              `;

              return (
                <g
                  key={slice.index}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <g style={{ transform: `translate(${shiftX}px, ${shiftY}px)`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    
                    {/* 1. Outer 3D Wall extrusion */}
                    <path
                      d={outerWallPath}
                      fill={sideColor}
                      stroke={sideColor}
                      strokeWidth="0.5"
                      opacity="0.95"
                    />

                    {/* 2. Inner Cavity Wall extrusion */}
                    <path
                      d={innerWallPath}
                      fill={innerSideColor}
                      stroke={innerSideColor}
                      strokeWidth="0.5"
                      opacity="0.9"
                    />

                    {/* 3. Radial Start Wall */}
                    <path
                      d={startRadialWallPath}
                      fill={sideColor}
                      stroke={sideColor}
                      strokeWidth="0.2"
                    />

                    {/* 4. Radial End Wall */}
                    <path
                      d={endRadialWallPath}
                      fill={sideColor}
                      stroke={sideColor}
                      strokeWidth="0.2"
                    />

                    {/* 5. Glowing Top Bevel Path */}
                    <path
                      d={topFacePath}
                      fill={`url(#topGrad-${slice.index})`}
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="0.75"
                    />
                    
                    {/* Highlight gloss line overlay */}
                    <path
                      d={`M ${x1Out} ${y1Out} A ${rxOut} ${ryOut} 0 ${slice.largeArc} ${sweepClockwise} ${x2Out} ${y2Out}`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      opacity="0.45"
                      pointerEvents="none"
                    />

                    <defs>
                      <linearGradient id={`topGrad-${slice.index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={highlightColor} />
                        <stop offset="100%" stopColor={baseColor} />
                      </linearGradient>
                    </defs>

                  </g>
                </g>
              );
            })}

            {/* Inner Ring cavity highlight */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rxIn}
              ry={ryIn}
              fill="none"
              stroke="rgba(45, 28, 14, 0.1)"
              strokeWidth="1"
              pointerEvents="none"
            />
          </svg>

          {/* Central Absolute Metric Overlaid on Donut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-[-10px]">
            <motion.span 
              key={totalVal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl sm:text-3xl font-black font-mono text-[#9b1526] leading-none drop-shadow-xs"
            >
              {totalVal.toLocaleString('pt-BR')}
            </motion.span>
            <span className="text-[9px] font-mono font-black text-stone-500 uppercase mt-1 tracking-widest leading-none">
              {centerLabel}
            </span>
          </div>

          {/* Tooltip Overlay */}
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[-15px] bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-1.5 shadow-lg z-50 font-mono text-[10px] pointer-events-none"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data[hoveredIndex].color }} />
                  <span className="font-extrabold text-stone-900 uppercase">
                    {data[hoveredIndex].name}:
                  </span>
                  <span className="font-black text-[#9b1526]">
                    {data[hoveredIndex].value.toLocaleString('pt-BR')} {unit} ({((data[hoveredIndex].value / totalValueSum) * 100).toFixed(1)}%)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Elegant Premium Sidebar Legend */}
        {showLegend && (
          <div className="flex flex-col gap-2.5 font-sans text-xs w-full max-w-[170px] overflow-hidden sm:border-l border-[#ded5c6]/60 sm:pl-5">
            {slices.map((item, idx) => {
              const isHovered = hoveredIndex === item.index;
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center justify-between group cursor-pointer py-0.5 px-1 rounded-md transition-all",
                    isHovered ? "bg-stone-100" : ""
                  )}
                  onMouseEnter={() => setHoveredIndex(item.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs group-hover:scale-110 transition-transform" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="truncate uppercase font-bold text-[10.5px] text-stone-600 group-hover:text-stone-950 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono text-[11px] font-black text-stone-900 pl-2">
                    <span>{item.value}</span>
                    <span className="text-[9px] text-stone-400 font-bold">({(item.percent * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
