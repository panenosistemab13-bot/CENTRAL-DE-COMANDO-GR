import React, { useState } from 'react';
import { Truck, Navigation, MapPin, ChevronRight, Activity, Radio } from 'lucide-react';
import { ActiveRoute, FleetVehicle } from '../types';

interface ThreeDFleetMapProps {
  routes: ActiveRoute[];
  vehicles: FleetVehicle[];
  onSelectRoute?: (route: ActiveRoute) => void;
}

export default function ThreeDFleetMap({
  routes,
  vehicles,
  onSelectRoute
}: ThreeDFleetMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<FleetVehicle | null>(null);

  // Brazilian key coffee logistic hubs (Coordinates mapped to SVG canvas 700x320)
  const hubs = [
    { name: 'Brasília', state: 'DF', x: 330, y: 80, vehiclesCount: 1, color: '#38bdf8' },
    { name: 'Belo Horizonte', state: 'MG', x: 420, y: 150, vehiclesCount: 4, color: '#f59e0b' },
    { name: 'Rio de Janeiro', state: 'RJ', x: 460, y: 220, vehiclesCount: 2, color: '#10b981' },
    { name: 'São Paulo', state: 'SP', x: 360, y: 230, vehiclesCount: 5, color: '#eab308' },
    { name: 'Curitiba', state: 'PR', x: 310, y: 285, vehiclesCount: 2, color: '#06b6d4' }
  ];

  return (
    <div className="w-full bg-[#0d2127] rounded-2xl overflow-hidden border border-[#23454b] shadow-[0_15px_35px_rgba(0,0,0,0.35)] relative">
      {/* Top Status Bar Over Map */}
      <div className="absolute top-4 left-5 z-20 flex flex-wrap items-center gap-4 bg-[#081519]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[#23454b]/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Em rota: <strong className="text-white font-mono">12</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Carregando: <strong className="text-white font-mono">3</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Descarregando: <strong className="text-white font-mono">2</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span>Parado: <strong className="text-white font-mono">1</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[300px]">
        {/* Interactive 3D Relief Radar Canvas */}
        <div className="lg:col-span-8 relative overflow-hidden flex items-center justify-center p-2">
          {/* Topographic Relief & Neon Highway Network SVG */}
          <svg
            viewBox="0 0 540 330"
            className="w-full h-full max-h-[330px] select-none"
            style={{ filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.15))' }}
          >
            <defs>
              {/* Radar Radial Ambient */}
              <radialGradient id="radarAmbient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#133e38" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#0a2327" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#081419" stopOpacity="1" />
              </radialGradient>

              {/* Highway Neon Glow */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Truck 3D Marker Gradient */}
              <linearGradient id="goldTruckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe899" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
            </defs>

            {/* Radar Background & Grid */}
            <rect width="540" height="330" fill="url(#radarAmbient)" />

            {/* Simulated 3D Topographic Contour Waves */}
            <path
              d="M 50 300 Q 180 260 260 280 T 450 290 T 520 220 L 520 330 L 50 330 Z"
              fill="#0e3532"
              opacity="0.4"
            />
            <path
              d="M 120 280 Q 240 210 340 230 T 480 180 L 520 190 L 520 330 L 120 330 Z"
              fill="#14463d"
              opacity="0.3"
            />

            {/* Isometric Radar Concentric Scanning Rings */}
            <ellipse cx="380" cy="180" rx="140" ry="70" fill="none" stroke="#1b5952" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
            <ellipse cx="380" cy="180" rx="220" ry="110" fill="none" stroke="#1b5952" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.3" />

            {/* Main Interstate Logistic Highway Corridors */}
            {/* SP -> BH */}
            <path
              d="M 360 230 C 375 200, 400 180, 420 150"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              filter="url(#neonGlow)"
              strokeDasharray="6 4"
            />
            {/* BH -> RJ */}
            <path
              d="M 420 150 C 445 175, 455 195, 460 220"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.8"
              filter="url(#neonGlow)"
            />
            {/* DF -> SP */}
            <path
              d="M 330 80 C 335 130, 345 180, 360 230"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.8"
              filter="url(#neonGlow)"
              strokeDasharray="5 3"
            />
            {/* SP -> Curitiba */}
            <path
              d="M 360 230 C 345 250, 325 265, 310 285"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.8"
              filter="url(#neonGlow)"
            />

            {/* City Hub Nodes */}
            {hubs.map((hub) => {
              const isSelected = selectedCity === hub.name;
              return (
                <g
                  key={hub.name}
                  transform={`translate(${hub.x}, ${hub.y})`}
                  className="cursor-pointer transition-transform duration-300"
                  onClick={() => setSelectedCity(hub.name)}
                >
                  {/* Radar Ripple Effect */}
                  <circle r="14" fill={hub.color} opacity="0.15" className="animate-ping" />
                  <circle r="7" fill={hub.color} stroke="#ffffff" strokeWidth="1.5" />
                  <circle r="2.5" fill="#ffffff" />

                  {/* City Label Badge */}
                  <rect
                    x="-40"
                    y="-24"
                    width="80"
                    height="17"
                    rx="4"
                    fill="#0a171d"
                    stroke={hub.color}
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#ffffff"
                    fontFamily="system-ui"
                  >
                    {hub.name}
                  </text>
                </g>
              );
            })}

            {/* 3D Moving Truck Markers on Routes */}
            {/* Truck 1 on SP -> BH */}
            <g transform="translate(390, 185)" className="cursor-pointer" onMouseEnter={() => setHoveredVehicle(vehicles[0])}>
              <rect x="-14" y="-10" width="28" height="20" rx="5" fill="url(#goldTruckGrad)" stroke="#fff" strokeWidth="1" filter="url(#neonGlow)" />
              <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#2c1a0e" fontFamily="system-ui">
                🚛
              </text>
            </g>

            {/* Truck 2 on DF -> SP */}
            <g transform="translate(340, 145)" className="cursor-pointer" onMouseEnter={() => setHoveredVehicle(vehicles[2])}>
              <rect x="-14" y="-10" width="28" height="20" rx="5" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#2c1a0e" fontFamily="system-ui">
                🚚
              </text>
            </g>

            {/* Truck 3 on SP -> Curitiba */}
            <g transform="translate(330, 260)" className="cursor-pointer" onMouseEnter={() => setHoveredVehicle(vehicles[3])}>
              <rect x="-14" y="-10" width="28" height="20" rx="5" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#2c1a0e" fontFamily="system-ui">
                🚛
              </text>
            </g>
          </svg>
        </div>

        {/* Right Active Routes Feed Panel */}
        <div className="lg:col-span-4 bg-[#09181e]/90 p-4 border-t lg:border-t-0 lg:border-l border-[#23454b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#23454b]/80 mb-3">
              <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Navigation size={14} className="text-amber-400" />
                Rotas em andamento
              </span>
              <button
                onClick={() => onSelectRoute && onSelectRoute(routes[0])}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition-colors"
              >
                Ver todas <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {routes.map((rt) => {
                const statusBadge =
                  rt.status === 'em_rota'
                    ? { bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300', label: 'Em rota', dot: 'bg-emerald-400' }
                    : rt.status === 'carregando'
                    ? { bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300', label: 'Carregando', dot: 'bg-amber-400' }
                    : { bg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300', label: 'Descarregando', dot: 'bg-cyan-400' };

                return (
                  <div
                    key={rt.id}
                    onClick={() => onSelectRoute && onSelectRoute(rt)}
                    className="p-2.5 rounded-xl bg-[#0e232b] hover:bg-[#132f3a] border border-[#23454b] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#183642] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <Truck size={14} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block">
                          {rt.route}
                        </strong>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {rt.vehicleCount} {rt.vehicleCount > 1 ? 'veículos' : 'veículo'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Fleet Health Banner */}
          <div className="mt-3 pt-2.5 border-t border-[#23454b]/60 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              Telemetria PGR Ativa
            </span>
            <span className="font-mono text-amber-400 font-bold">100% Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
