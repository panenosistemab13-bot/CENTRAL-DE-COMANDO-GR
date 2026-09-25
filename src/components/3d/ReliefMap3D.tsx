import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Route, MapPin, ChevronRight, Truck, Radio, Navigation } from 'lucide-react';

interface FleetNode {
  name: string;
  x: number; // %
  y: number; // %
  vehicles: number;
  status: 'active' | 'warning' | 'alert';
}

const FLEET_NODES: FleetNode[] = [
  { name: 'Cuiabá', x: 32, y: 38, vehicles: 2, status: 'active' },
  { name: 'Brasília', x: 54, y: 35, vehicles: 4, status: 'active' },
  { name: 'Belo Horizonte', x: 70, y: 55, vehicles: 7, status: 'active' },
  { name: 'São Paulo', x: 62, y: 78, vehicles: 5, status: 'active' },
];

const ACTIVE_ROUTES = [
  { id: '1', origin: '39', dest: '2 veículos', status: 'Em rota', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: '2', origin: 'BH', dest: 'RJ', count: '1 veículo', status: 'Em rota', statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: '3', origin: 'PITANGUI', count: '1 veículo', status: 'Carregando', statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: '4', origin: 'SP', dest: 'Curitiba', count: '1 veículo', status: 'Descarregando', statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
];

export default function ReliefMap3D({ onOpenRoutes }: { onOpenRoutes?: () => void }) {
  const [selectedNode, setSelectedNode] = useState<FleetNode | null>(FLEET_NODES[2]); // BH default

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full">
      {/* Left: Status Counts & 3D Topographic Terrain View */}
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Left Status Counter Badges */}
        <div className="flex md:flex-col justify-between md:justify-center gap-2 shrink-0 md:w-36">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1d110a] border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-[#d8c2aa]">Em rota</span>
            </div>
            <span className="font-bold font-mono text-sm text-emerald-400">12</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1d110a] border border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs text-[#d8c2aa]">Carregando</span>
            </div>
            <span className="font-bold font-mono text-sm text-amber-400">3</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1d110a] border border-cyan-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-xs text-[#d8c2aa]">Descarregando</span>
            </div>
            <span className="font-bold font-mono text-sm text-cyan-400">2</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1d110a] border border-red-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs text-[#d8c2aa]">Parado</span>
            </div>
            <span className="font-bold font-mono text-sm text-red-400">1</span>
          </div>
        </div>

        {/* 3D Topographic Map Canvas */}
        <div className="flex-1 relative min-h-[190px] rounded-xl overflow-hidden border border-[#e2ba61]/25 bg-gradient-to-b from-[#1c1109] to-[#0d0704] shadow-inner flex items-center justify-center">
          {/* Topographic Contour Lines SVG */}
          <svg viewBox="0 0 400 220" className="w-full h-full absolute inset-0 opacity-60">
            <defs>
              <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3d2514" />
                <stop offset="50%" stopColor="#1f130b" />
                <stop offset="100%" stopColor="#0c0704" />
              </linearGradient>

              <linearGradient id="routeArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#caa031" />
                <stop offset="50%" stopColor="#fff3bf" />
                <stop offset="100%" stopColor="#caa031" />
              </linearGradient>

              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Simulated Topographic Elevation Contours */}
            <path
              d="M 40,80 Q 90,40 160,50 T 260,70 T 360,110 T 320,180 T 180,190 T 80,150 Z"
              fill="url(#terrainGrad)"
              stroke="rgba(226, 186, 97, 0.15)"
              strokeWidth="1"
            />
            <path
              d="M 80,95 Q 120,65 170,75 T 240,90 T 310,120 T 270,165 T 180,170 T 110,140 Z"
              fill="rgba(54, 33, 18, 0.4)"
              stroke="rgba(226, 186, 97, 0.22)"
              strokeWidth="1"
            />
            <path
              d="M 120,110 Q 150,90 190,95 T 230,110 T 260,135 T 230,155 T 170,155 T 130,135 Z"
              fill="rgba(77, 47, 26, 0.5)"
              stroke="rgba(226, 186, 97, 0.35)"
              strokeWidth="1"
            />

            {/* Glowing Golden Arc Routes between hubs */}
            {/* Cuiabá -> Brasília */}
            <path
              d="M 128,84 Q 170,55 216,77"
              fill="none"
              stroke="url(#routeArcGrad)"
              strokeWidth="2"
              strokeDasharray="4 3"
              filter="url(#nodeGlow)"
              className="animate-pulse"
            />
            {/* Brasília -> Belo Horizonte */}
            <path
              d="M 216,77 Q 255,88 280,121"
              fill="none"
              stroke="url(#routeArcGrad)"
              strokeWidth="2.5"
              filter="url(#nodeGlow)"
            />
            {/* Belo Horizonte -> São Paulo */}
            <path
              d="M 280,121 Q 270,150 248,172"
              fill="none"
              stroke="url(#routeArcGrad)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Active Moving Vehicle Marker along Route */}
            <circle cx="248" cy="99" r="3.5" fill="#58d68d" filter="url(#nodeGlow)" className="animate-ping" />
            <circle cx="248" cy="99" r="2.5" fill="#ffffff" />
          </svg>

          {/* Interactive Geographic Nodes */}
          {FLEET_NODES.map((node) => {
            const isSelected = selectedNode?.name === node.name;
            return (
              <div
                key={node.name}
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setSelectedNode(node)}
              >
                {/* Radar Ripple Effect */}
                <div className="absolute -inset-2 rounded-full border border-amber-400/60 radar-ring pointer-events-none" />
                
                {/* Glowing Node Dot */}
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-[#fff2c4] scale-125 shadow-[0_0_12px_#ffcf54]' : 'bg-[#caa031] shadow-[0_0_8px_#caa031]'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1b1008]" />
                </div>

                {/* Node City Label Badge */}
                <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-[#1b1008] border border-[#e2ba61] text-[#ffe699] shadow-md' 
                    : 'bg-[#1b1008]/80 text-[#d8c2aa] group-hover:text-[#ffe699]'
                }`}>
                  {node.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Rotas em andamento Live Panel */}
      <div className="lg:w-64 shrink-0 flex flex-col justify-between bg-[#170e08]/90 p-3 rounded-xl border border-[#e2ba61]/25 shadow-lg">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#3d2314] mb-2">
            <span className="text-xs font-bold text-[#f7ede1] flex items-center gap-1.5">
              <Route size={14} className="text-[#e2ba61]" />
              Rotas em andamento
            </span>
            <button 
              onClick={onOpenRoutes}
              className="text-[10px] font-bold text-[#e2ba61] hover:text-[#fff0b3] flex items-center gap-0.5 cursor-pointer"
            >
              Ver todas <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-1.5">
            {ACTIVE_ROUTES.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#22150d] border border-[#3d2314] hover:border-[#e2ba61]/40 transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[#331e12] flex items-center justify-center shrink-0 text-[#e2ba61] font-mono text-[9px] font-bold">
                    {r.origin.substring(0, 2)}
                  </div>
                  <div className="truncate text-[11px] text-[#e8d5be]">
                    {r.dest ? `${r.origin} → ${r.dest}` : r.origin}
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${r.statusColor}`}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#3d2314] flex items-center justify-between text-[10px] text-[#a88d74]">
          <span className="flex items-center gap-1">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            GPS Atualizado
          </span>
          <span>4 veículos ativos</span>
        </div>
      </div>
    </div>
  );
}
