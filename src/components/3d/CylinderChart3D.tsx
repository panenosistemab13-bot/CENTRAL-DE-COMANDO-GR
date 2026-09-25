import React, { useState } from 'react';
import { motion } from 'motion/react';

interface DataPoint {
  time: string;
  value: number; // 0 to 100
  operations: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { time: '00:00', value: 38, operations: 8 },
  { time: '03:00', value: 45, operations: 11 },
  { time: '06:00', value: 68, operations: 18 },
  { time: '09:00', value: 58, operations: 15 },
  { time: '12:00', value: 85, operations: 22 },
  { time: '18:00', value: 72, operations: 19 },
  { time: '21:00', value: 64, operations: 16 }
];

export default function CylinderChart3D() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 580;
  const height = 230;
  const chartBottom = 190;
  const chartTop = 30;
  const maxVal = 100;

  const getX = (index: number) => 60 + index * 75;
  const getY = (val: number) => chartBottom - (val / maxVal) * (chartBottom - chartTop);

  // Generate smooth spline path for the glowing gold line trace
  const points = DEFAULT_DATA.map((d, i) => ({ x: getX(i) + 16, y: getY(d.value) - 8 }));
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="relative w-full h-full flex flex-col select-none">
      {/* Chart Canvas Area */}
      <div className="relative flex-1 w-full min-h-[210px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            {/* 3D Gold Cylinder Gradients */}
            <linearGradient id="goldCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a2e15" />
              <stop offset="25%" stopColor="#d4a33a" />
              <stop offset="50%" stopColor="#fff1ba" />
              <stop offset="75%" stopColor="#b88426" />
              <stop offset="100%" stopColor="#3d210b" />
            </linearGradient>

            <linearGradient id="goldCylinderGradHover" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#633d1b" />
              <stop offset="25%" stopColor="#f7cb59" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#dba135" />
              <stop offset="100%" stopColor="#4a290f" />
            </linearGradient>

            {/* Cylinder Top Cap Disc Gradient */}
            <radialGradient id="topDiscGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fff9e6" />
              <stop offset="50%" stopColor="#dfb14b" />
              <stop offset="100%" stopColor="#875614" />
            </radialGradient>

            {/* Glowing Line Gradient */}
            <linearGradient id="lineGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#caa031" />
              <stop offset="50%" stopColor="#ffe699" />
              <stop offset="100%" stopColor="#e5be4e" />
            </linearGradient>

            {/* Area Fill Gradient under line */}
            <linearGradient id="lineAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(226, 186, 97, 0.25)" />
              <stop offset="100%" stopColor="rgba(226, 186, 97, 0.0)" />
            </linearGradient>

            {/* 3D Drop Shadow Filter */}
            <filter id="shadow3d" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="3" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.85" />
            </filter>
            
            <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-Axis Scale */}
          {[0, 25, 50, 75, 100].map((val) => {
            const yPos = getY(val);
            return (
              <g key={val} className="text-[10px] fill-[#8c7460] font-mono">
                <text x="24" y={yPos + 3} textAnchor="end" className="select-none font-semibold">
                  {val}
                </text>
                <line
                  x1="34"
                  y1={yPos}
                  x2={width - 20}
                  y2={yPos}
                  stroke="rgba(226, 186, 97, 0.12)"
                  strokeDasharray="3 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* 3D Pillar Cylinders */}
          {DEFAULT_DATA.map((item, idx) => {
            const cx = getX(idx);
            const cyTop = getY(item.value);
            const rx = 16;
            const ry = 6;
            const cylinderHeight = chartBottom - cyTop;
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={item.time}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* 3D Base Shadow on Ground */}
                <ellipse
                  cx={cx + rx}
                  cy={chartBottom + 2}
                  rx={rx + 4}
                  ry={ry + 2}
                  fill="rgba(0, 0, 0, 0.7)"
                  filter="blur(4px)"
                />

                {/* Cylinder Body */}
                <path
                  d={`
                    M ${cx} ${cyTop}
                    L ${cx} ${chartBottom}
                    A ${rx} ${ry} 0 0 0 ${cx + rx * 2} ${chartBottom}
                    L ${cx + rx * 2} ${cyTop}
                    Z
                  `}
                  fill={isHovered ? "url(#goldCylinderGradHover)" : "url(#goldCylinderGrad)"}
                  filter="url(#shadow3d)"
                />

                {/* Cylinder Bottom Lip Rim Highlight */}
                <path
                  d={`
                    M ${cx} ${chartBottom}
                    A ${rx} ${ry} 0 0 0 ${cx + rx * 2} ${chartBottom}
                  `}
                  stroke="rgba(255, 235, 180, 0.4)"
                  strokeWidth="1.2"
                  fill="none"
                />

                {/* Cylinder Top Cap Disc (Glossy 3D Bevel) */}
                <ellipse
                  cx={cx + rx}
                  cy={cyTop}
                  rx={rx}
                  ry={ry}
                  fill="url(#topDiscGrad)"
                  stroke="#ffe8a3"
                  strokeWidth={isHovered ? "1.8" : "1.2"}
                  className="transition-all duration-200"
                />

                {/* Vertical Specular Glint line along pillar */}
                <line
                  x1={cx + rx * 0.75}
                  y1={cyTop + ry}
                  x2={cx + rx * 0.75}
                  y2={chartBottom - ry}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Glowing Line Overlay */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`}
            fill="url(#lineAreaGrad)"
          />

          {/* Blurred Glow Trace */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffcf54"
            strokeWidth="4"
            opacity="0.4"
            filter="url(#glowFilter)"
          />

          {/* Main Gold Spline Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGlowGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points on Line with Glowing Orbs */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4.5}
                  fill="#fff9e6"
                  stroke="#caa031"
                  strokeWidth="2.5"
                  filter="url(#glowFilter)"
                  className="transition-all duration-200"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={2}
                  fill="#2b180d"
                />
              </g>
            );
          })}

          {/* X-Axis Timestamps */}
          {DEFAULT_DATA.map((item, idx) => {
            const cx = getX(idx) + 16;
            const isHovered = hoveredIndex === idx;
            return (
              <text
                key={item.time}
                x={cx}
                y={chartBottom + 18}
                textAnchor="middle"
                className={`text-[10px] font-mono tracking-wider transition-colors duration-200 ${
                  isHovered ? 'fill-[#f5d77f] font-bold' : 'fill-[#a88d74]'
                }`}
              >
                {item.time}
              </text>
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip */}
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[#1a0f08]/95 border border-[#e2ba61] shadow-[0_4px_16px_rgba(0,0,0,0.8)] text-center text-xs backdrop-blur-md"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: `${(getY(DEFAULT_DATA[hoveredIndex].value) / height) * 100 - 18}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-[10px] font-mono text-[#a88d74] uppercase tracking-wider">
              {DEFAULT_DATA[hoveredIndex].time}
            </div>
            <div className="font-bold text-[#ffe699] text-sm flex items-center justify-center gap-1">
              <span>{DEFAULT_DATA[hoveredIndex].operations}</span>
              <span className="text-[10px] font-normal text-zinc-300">operações</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
