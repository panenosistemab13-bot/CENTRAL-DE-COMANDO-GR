import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface DestinoSlice {
  label: string;
  percentage: number;
  count: number;
  color: string;
  gradId: string;
  stop1: string;
  stop2: string;
  stop3: string;
}

const DESTINOS: DestinoSlice[] = [
  { label: 'São Paulo', percentage: 26, count: 96, color: '#e5be4e', gradId: 'spGrad', stop1: '#fced98', stop2: '#d4a33a', stop3: '#7a5214' },
  { label: 'Rio de Janeiro', percentage: 22, count: 81, color: '#b5a642', gradId: 'rjGrad', stop1: '#d8c764', stop2: '#9e912c', stop3: '#524b13' },
  { label: 'Minas Gerais', percentage: 18, count: 66, color: '#38a169', gradId: 'mgGrad', stop1: '#68d391', stop2: '#2f855a', stop3: '#1c4d33' },
  { label: 'Bahia', percentage: 12, count: 44, color: '#319795', gradId: 'baGrad', stop1: '#4fd1c5', stop2: '#285e61', stop3: '#133537' },
  { label: 'Espírito Santo', percentage: 8, count: 29, color: '#3182ce', gradId: 'esGrad', stop1: '#63b3ed', stop2: '#2b6cb0', stop3: '#1a365d' },
  { label: 'Outros', percentage: 12, count: 44, color: '#718096', gradId: 'outrosGrad', stop1: '#a0aec0', stop2: '#4a5568', stop3: '#2d3748' },
];

export default function DonutChart3D({ onOpenComplete }: { onOpenComplete?: () => void }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Calculate angles for 3D donut arcs
  let currentAngle = -90; // Start at top
  const slicesWithAngles = DESTINOS.map((d) => {
    const angleSpan = (d.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle = endAngle;
    return {
      ...d,
      startAngle,
      endAngle,
      angleSpan
    };
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeArc = (cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) => {
    const outerStart = polarToCartesian(cx, cy, rOuter, endAngle);
    const outerEnd = polarToCartesian(cx, cy, rOuter, startAngle);
    const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
    const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', outerStart.x, outerStart.y,
      'A', rOuter, rOuter, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      'L', innerStart.x, innerStart.y,
      'A', rInner, rInner, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
      'Z'
    ].join(' ');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full h-full">
      {/* 3D Isometric Donut Ring Graphic */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        {/* Isometric 3D transform container */}
        <div 
          className="w-full h-full relative"
          style={{
            transform: 'perspective(400px) rotateX(28deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Ground drop shadow under 3D donut */}
          <div 
            className="absolute inset-0 rounded-full bg-black/80 blur-lg"
            style={{ transform: 'translateY(16px) scale(0.92)' }}
          />

          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            <defs>
              {DESTINOS.map((d) => (
                <linearGradient key={d.gradId} id={d.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={d.stop1} />
                  <stop offset="50%" stopColor={d.stop2} />
                  <stop offset="100%" stopColor={d.stop3} />
                </linearGradient>
              ))}

              {/* 3D Extrusion Side Wall Gradient */}
              <linearGradient id="wallDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
              </linearGradient>
            </defs>

            {/* Render Lower Depth Layer (3D Extrusion base) */}
            <g transform="translate(0, 10)">
              {slicesWithAngles.map((slice, i) => (
                <path
                  key={`depth-${slice.label}`}
                  d={describeArc(100, 100, 82, 48, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  opacity="0.5"
                  filter="brightness(0.35)"
                />
              ))}
            </g>

            {/* Render Top Surface Slices */}
            {slicesWithAngles.map((slice, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <g
                  key={slice.label}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <path
                    d={describeArc(100, 100, isHovered ? 86 : 82, isHovered ? 44 : 48, slice.startAngle, slice.endAngle)}
                    fill={`url(#${slice.gradId})`}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth={isHovered ? "1.8" : "1"}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 0 10px rgba(226, 186, 97, 0.6)) brightness(1.15)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                    }}
                  />
                </g>
              );
            })}

            {/* Inner Metallic Bezel Hub */}
            <circle
              cx="100"
              cy="100"
              r="44"
              fill="#180e08"
              stroke="rgba(226, 186, 97, 0.35)"
              strokeWidth="1.5"
            />
            <circle
              cx="100"
              cy="100"
              r="38"
              fill="#0e0704"
              stroke="rgba(0, 0, 0, 0.8)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Central 3D Counter Display */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"
            style={{ transform: 'translateZ(15px)' }}
          >
            <span className="font-extrabold text-xl font-heading text-[#ffe699] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {hoveredIdx !== null ? DESTINOS[hoveredIdx].count : '368'}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a88d74]">
              {hoveredIdx !== null ? DESTINOS[hoveredIdx].label.split(' ')[0] : 'Total'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Legend with Progress Meters */}
      <div className="flex-1 flex flex-col justify-between w-full min-w-0 py-1">
        <div className="space-y-1.5">
          {DESTINOS.map((d, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={d.label}
                className={`flex items-center justify-between text-xs py-0.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  isHovered ? 'bg-[#2f1b11] border border-[#e2ba61]/40' : 'hover:bg-[#20120a]'
                }`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: d.color, color: d.color }}
                  />
                  <span className={`truncate text-xs ${isHovered ? 'text-[#ffe699] font-bold' : 'text-[#d8c2aa]'}`}>
                    {d.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-[#f7ede1]">
                    {d.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action Link */}
        <button
          onClick={onOpenComplete}
          className="mt-2.5 flex items-center justify-end gap-1 text-[11px] font-bold text-[#e5be4e] hover:text-[#fff0b3] transition-colors py-1 cursor-pointer group"
        >
          <span>Ver gráfico completo</span>
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
