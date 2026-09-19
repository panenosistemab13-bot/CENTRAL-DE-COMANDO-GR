import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Maximize2, Minimize2, Trophy, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { Podium3D, PodiumItem } from './3d/Podium3D';
import { GlassPanel3D } from './3d/GlassPanel3D';

export interface DestinoStatItem {
  name: string;
  count: number;
  iscas?: string[];
  drivers?: string[];
}

interface DestinoRankingHUDProps {
  destinoStats?: DestinoStatItem[];
  data?: any[];
}

export const DestinoRankingHUD: React.FC<DestinoRankingHUDProps> = ({ destinoStats, data }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Compute stats if data is provided instead of destinoStats
  const computedStats: DestinoStatItem[] = useMemo(() => {
    if (destinoStats && destinoStats.length > 0) return destinoStats;

    if (data && data.length > 0) {
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const dest = item.destino || item.unidade || 'GUARULHOS-SP';
        counts[dest] = (counts[dest] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Default realistic operational destinations for PGR Command Center
    return [
      { name: 'GUARULHOS - SP', count: 42 },
      { name: 'SANTA LUZIA - MG', count: 35 },
      { name: 'LONDRINA - PR', count: 28 },
      { name: 'SUMARÉ - SP', count: 21 },
      { name: 'CUIABÁ - MT', count: 18 },
      { name: 'GRAVATAÍ - RS', count: 14 },
      { name: 'GOV. CELSO RAMOS - SC', count: 11 },
      { name: 'VIANA - ES', count: 9 }
    ];
  }, [destinoStats, data]);

  // Compute Podium Items for Top 3
  const podiumItems: PodiumItem[] = useMemo(() => {
    if (computedStats.length === 0) return [];

    const top1 = computedStats[0];
    const top2 = computedStats[1] || { name: 'SANTA LUZIA - MG', count: 35 };
    const top3 = computedStats[2] || { name: 'LONDRINA - PR', count: 28 };

    const total = computedStats.reduce((acc, curr) => acc + curr.count, 0) || 1;

    return [
      {
        rank: 1,
        name: top1.name,
        subtitle: "Hub Central Logística",
        value: `${top1.count} Iscas`,
        trend: `+${((top1.count / total) * 100).toFixed(1)}% Participação`
      },
      {
        rank: 2,
        name: top2.name,
        subtitle: "Unidade de Transbordo",
        value: `${top2.count} Iscas`,
        trend: `+${((top2.count / total) * 100).toFixed(1)}%`
      },
      {
        rank: 3,
        name: top3.name,
        subtitle: "Pátio Regional",
        value: `${top3.count} Iscas`,
        trend: `+${((top3.count / total) * 100).toFixed(1)}%`
      }
    ];
  }, [computedStats]);

  const barGradients = [
    { start: '#f59e0b', end: '#b45309' }, // Gold
    { start: '#38bdf8', end: '#0284c7' }, // Steel Blue
    { start: '#10b981', end: '#047857' }, // Emerald
    { start: '#8b5cf6', end: '#6d28d9' }, // Purple
    { start: '#ec4899', end: '#be185d' }, // Pink
    { start: '#f97316', end: '#c2410c' }, // Orange
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-6 font-mono relative transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 p-6 w-screen h-screen overflow-y-auto bg-[#070a12]"
      )}
    >
      {/* 3D PODIUM DISPLAY FOR TOP DESTINATIONS */}
      <Podium3D
        title="PODIUM DE DESTINOS DE MAIOR VOLUME"
        subtitle="Mapeamento em tempo real dos fluxos logísticos mais movimentados"
        items={podiumItems}
      />

      {/* DETAILED RANKING BARS & METRIC CARDS */}
      <GlassPanel3D className="p-6 flex flex-col gap-5 relative overflow-hidden" variant="metallic">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="led-status led-status-blue" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400">
                PGR VOLUMETRIC BARS & TELEMETRY
              </span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              RANKING DE ISCAS E DISPOSITIVOS POR DESTINO
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-sky-400/80 font-bold hidden sm:inline border border-sky-500/30 px-3 py-1 rounded-xl bg-sky-500/10">
              TOTAL DESTINOS: {computedStats.length}
            </span>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Ranking em Tela Cheia"}
              className={cn(
                "px-3.5 py-1.5 rounded-xl border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer text-xs",
                isFullscreen
                  ? "bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] font-black"
                  : "bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-sky-500/20 hover:border-sky-400"
              )}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>SAIR DA TELA CHEIA (ESC)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>TELA CHEIA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Volumetric Bar Chart Visualizer */}
        <div className={cn("w-full transition-all mt-2", isFullscreen ? "h-[500px]" : "h-[320px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={computedStats.slice(0, 8)}
              layout="vertical"
              margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                width={140}
                tick={{ fill: '#38bdf8', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070a12',
                  borderColor: '#38bdf8',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
                }}
                formatter={(val: any) => [`${val} Dispositivos / Iscas`, 'Volume']}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                {computedStats.slice(0, 8).map((entry, index) => {
                  const gradient = barGradients[index % barGradients.length];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={gradient.start}
                      stroke={gradient.end}
                      strokeWidth={1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Volumetric Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {computedStats.slice(0, 4).map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{item.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-white">{item.count}</span>
                <span className="text-[10px] text-sky-400 font-bold">TOP #{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel3D>
    </div>
  );
};

export default DestinoRankingHUD;
