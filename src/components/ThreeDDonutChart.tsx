import React, { useState } from 'react';
import { ProductDistribution } from '../types';

interface ThreeDDonutChartProps {
  data: ProductDistribution[];
  size?: number;
}

export default function ThreeDDonutChart({
  data,
  size = 200
}: ThreeDDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.44;
  const innerRadius = size * 0.23;

  // Compute slice angles
  let cumulativeAngle = -Math.PI / 2; // Start from top
  const totalPercentage = data.reduce((acc, curr) => acc + curr.percentage, 0);

  const slices = data.map((item, index) => {
    const sliceAngle = (item.percentage / totalPercentage) * (2 * Math.PI);
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    // Mid angle for hover translation
    const midAngle = (startAngle + endAngle) / 2;

    // Geometry points
    const x1Outer = cx + outerRadius * Math.cos(startAngle);
    const y1Outer = cy + outerRadius * Math.sin(startAngle);
    const x2Outer = cx + outerRadius * Math.cos(endAngle);
    const y2Outer = cy + outerRadius * Math.sin(endAngle);

    const x1Inner = cx + innerRadius * Math.cos(endAngle);
    const y1Inner = cy + innerRadius * Math.sin(endAngle);
    const x2Inner = cx + innerRadius * Math.cos(startAngle);
    const y2Inner = cy + innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      midAngle,
      index
    };
  });

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{ filter: 'drop-shadow(0 14px 28px rgba(45, 25, 10, 0.16))' }}
      >
        <defs>
          {/* 3D Segment Gradients */}
          <linearGradient id="donutGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd87d" />
            <stop offset="45%" stopColor="#e5a120" />
            <stop offset="100%" stopColor="#9a5a04" />
          </linearGradient>

          <linearGradient id="donutBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="donutGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>

          <linearGradient id="donutAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="donutRose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Depth Inner Shadow */}
          <filter id="donutDepth" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ambient glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 3}
          fill="none"
          stroke="#faeed7"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* 3D Extruded Slices */}
        {slices.map((slice) => {
          const isHovered = hoveredIndex === slice.index;
          const shiftDistance = isHovered ? 6 : 0;
          const shiftX = Math.cos(slice.midAngle) * shiftDistance;
          const shiftY = Math.sin(slice.midAngle) * shiftDistance;

          const gradientId =
            slice.index === 0
              ? 'url(#donutGold)'
              : slice.index === 1
              ? 'url(#donutBlue)'
              : slice.index === 2
              ? 'url(#donutGreen)'
              : slice.index === 3
              ? 'url(#donutAmber)'
              : 'url(#donutRose)';

          return (
            <g
              key={slice.id}
              transform={`translate(${shiftX}, ${shiftY})`}
              className="cursor-pointer transition-transform duration-300"
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <path
                d={slice.pathData}
                fill={gradientId}
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{
                  filter: isHovered
                    ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                    : 'none'
                }}
              />
            </g>
          );
        })}

        {/* Center Cavity with Golden Ring & Coffee Bean Icon */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill="#ffffff"
          stroke="#e8decb"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(inset 0 3px 6px rgba(0,0,0,0.2))' }}
        />

        {/* 3D Center Golden Coffee Bean Emblem */}
        <g transform={`translate(${cx - 16}, ${cy - 16})`}>
          <ellipse
            cx="16"
            cy="16"
            rx="12"
            ry="15"
            transform="rotate(-28 16 16)"
            fill="url(#donutGold)"
            stroke="#b47818"
            strokeWidth="1"
          />
          {/* Bean Center S-curve Crease */}
          <path
            d="M 12 5 Q 18 16 12 27"
            transform="rotate(-28 16 16)"
            fill="none"
            stroke="#4a2800"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
