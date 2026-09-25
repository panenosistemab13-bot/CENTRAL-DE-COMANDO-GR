import React, { useState } from 'react';
import { DayPerformance } from '../types';

interface ThreeDVolumetricBarChartProps {
  data: DayPerformance[];
  height?: number;
}

export default function ThreeDVolumetricBarChart({
  data,
  height = 240
}: ThreeDVolumetricBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = 55000; // max scale 50k - 55k

  // Calculate SVG dimensions
  const svgWidth = 560;
  const svgHeight = height;
  const paddingLeft = 40;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barGroupWidth = chartWidth / data.length;
  const cylinderRadius = 9;
  const cylinderRx = cylinderRadius;
  const cylinderRy = 4; // Perspective foreshortening for top ellipse

  // Helper to convert value to Y coordinate
  const getY = (val: number) => {
    const ratio = Math.min(val / maxValue, 1);
    return paddingTop + chartHeight * (1 - ratio);
  };

  // Generate spline path for cyan line overlay
  const linePoints = data.map((d, i) => {
    const groupX = paddingLeft + i * barGroupWidth + barGroupWidth / 2;
    const x = groupX + cylinderRadius * 0.8; // Align with cyan bar
    const y = getY(d.vendas);
    return { x, y, value: d.vendas };
  });

  let splinePath = '';
  if (linePoints.length > 0) {
    splinePath = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p0 = linePoints[i === 0 ? 0 : i - 1];
      const p1 = linePoints[i];
      const p2 = linePoints[i + 1];
      const p3 = linePoints[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      splinePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(45, 25, 10, 0.08))' }}
      >
        <defs>
          {/* 3D Gold Cylinder Gradients */}
          <linearGradient id="goldCylinderBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b47818" />
            <stop offset="25%" stopColor="#ffd87d" />
            <stop offset="55%" stopColor="#f5aa22" />
            <stop offset="85%" stopColor="#c57e0e" />
            <stop offset="100%" stopColor="#7a4603" />
          </linearGradient>

          <radialGradient id="goldCylinderTop" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff6d6" />
            <stop offset="45%" stopColor="#ffd266" />
            <stop offset="90%" stopColor="#d98c11" />
            <stop offset="100%" stopColor="#9a5a04" />
          </radialGradient>

          {/* 3D Cyan Glass Cylinder Gradients */}
          <linearGradient id="cyanCylinderBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="25%" stopColor="#67e8f9" />
            <stop offset="55%" stopColor="#06b6d4" />
            <stop offset="85%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#164e63" />
          </linearGradient>

          <radialGradient id="cyanCylinderTop" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e0f7fa" />
            <stop offset="45%" stopColor="#67e8f9" />
            <stop offset="90%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#155e75" />
          </radialGradient>

          {/* Cylinder Base Shadows */}
          <radialGradient id="cylinderShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Line Glow Filter */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Scale */}
        {[0, 10000, 20000, 30000, 40000, 50000].map((tick) => {
          const y = getY(tick);
          const label = tick === 0 ? '0' : `${tick / 1000}k`;
          return (
            <g key={tick} className="opacity-70">
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#e8decb"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9"
                fontWeight="600"
                fill="#8c7866"
                fontFamily="system-ui"
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
          stroke="#d2c3ae"
          strokeWidth="1.5"
        />

        {/* 3D Cylinders for each day */}
        {data.map((item, idx) => {
          const groupCenterX = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
          const baseY = paddingTop + chartHeight;

          // Gold Cylinder (Produção)
          const goldX = groupCenterX - cylinderRadius * 0.8;
          const goldTopY = getY(item.producao);
          const goldHeight = baseY - goldTopY;

          // Cyan Cylinder (Vendas)
          const cyanX = groupCenterX + cylinderRadius * 0.8;
          const cyanTopY = getY(item.vendas);
          const cyanHeight = baseY - cyanTopY;

          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.date}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-all duration-300"
              style={{
                transformOrigin: `${groupCenterX}px ${baseY}px`,
                transform: isHovered ? 'scale(1.03)' : 'scale(1)'
              }}
            >
              {/* Ground Oval Shadows */}
              <ellipse
                cx={goldX}
                cy={baseY + 1}
                rx={cylinderRx * 1.2}
                ry={cylinderRy * 1.1}
                fill="url(#cylinderShadow)"
              />
              <ellipse
                cx={cyanX}
                cy={baseY + 1}
                rx={cylinderRx * 1.2}
                ry={cylinderRy * 1.1}
                fill="url(#cylinderShadow)"
              />

              {/* Gold Cylinder (Produção) */}
              <g>
                {/* Cylinder Body Rect */}
                <rect
                  x={goldX - cylinderRx}
                  y={goldTopY}
                  width={cylinderRx * 2}
                  height={goldHeight}
                  fill="url(#goldCylinderBody)"
                />
                {/* Cylinder Base Curved Bottom */}
                <ellipse
                  cx={goldX}
                  cy={baseY}
                  rx={cylinderRx}
                  ry={cylinderRy}
                  fill="url(#goldCylinderBody)"
                />
                {/* Cylinder Glossy 3D Top Cap */}
                <ellipse
                  cx={goldX}
                  cy={goldTopY}
                  rx={cylinderRx}
                  ry={cylinderRy}
                  fill="url(#goldCylinderTop)"
                  stroke="#ffe899"
                  strokeWidth="0.75"
                />
              </g>

              {/* Cyan Cylinder (Vendas) */}
              <g>
                {/* Cylinder Body Rect */}
                <rect
                  x={cyanX - cylinderRx}
                  y={cyanTopY}
                  width={cylinderRx * 2}
                  height={cyanHeight}
                  fill="url(#cyanCylinderBody)"
                />
                {/* Cylinder Base Curved Bottom */}
                <ellipse
                  cx={cyanX}
                  cy={baseY}
                  rx={cylinderRx}
                  ry={cylinderRy}
                  fill="url(#cyanCylinderBody)"
                />
                {/* Cylinder Glossy 3D Top Cap */}
                <ellipse
                  cx={cyanX}
                  cy={cyanTopY}
                  rx={cylinderRx}
                  ry={cylinderRy}
                  fill="url(#cyanCylinderTop)"
                  stroke="#a5f3fc"
                  strokeWidth="0.75"
                />
              </g>

              {/* X-Axis Date Label */}
              <text
                x={groupCenterX}
                y={baseY + 18}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill={isHovered ? '#b45309' : '#786552'}
                fontFamily="system-ui"
              >
                {item.displayDate}
              </text>
            </g>
          );
        })}

        {/* Cyan Glowing Spline Line Overlay with Data Dots */}
        <path
          d={splinePath}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          filter="url(#cyanGlow)"
          className="transition-all duration-300"
        />

        {linePoints.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#ffffff"
              stroke="#0891b2"
              strokeWidth="2"
              filter="url(#cyanGlow)"
            />
            <circle cx={pt.x} cy={pt.y} r="2" fill="#0891b2" />
          </g>
        ))}

        {/* Hover Tooltip Card */}
        {hoveredIndex !== null && (
          <g
            transform={`translate(${
              Math.min(
                Math.max(paddingLeft + hoveredIndex * barGroupWidth - 45, 10),
                svgWidth - 140
              )
            }, ${Math.max(getY(data[hoveredIndex].producao) - 52, 10)})`}
            style={{ pointerEvents: 'none' }}
          >
            <rect
              width="130"
              height="48"
              rx="8"
              fill="#1e1108"
              stroke="#d4a373"
              strokeWidth="1.2"
              filter="drop-shadow(0 8px 16px rgba(0,0,0,0.35))"
            />
            <text x="10" y="14" fontSize="8.5" fontWeight="800" fill="#ffd88a" fontFamily="system-ui">
              {data[hoveredIndex].displayDate} • DETALHES 3D
            </text>
            <text x="10" y="28" fontSize="9" fontWeight="700" fill="#f5af24" fontFamily="system-ui">
              ● Produção: {data[hoveredIndex].producao.toLocaleString('pt-BR')} kg
            </text>
            <text x="10" y="40" fontSize="9" fontWeight="700" fill="#38bdf8" fontFamily="system-ui">
              ● Vendas: {data[hoveredIndex].vendas.toLocaleString('pt-BR')} kg
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
