import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Maximize2,
  Minimize2,
  Activity,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { cn } from '../lib/utils';

export interface StatusStatItem {
  key: string;
  label: string;
  color: string;
  glow: string;
  count: number;
  percentage: number;
}

export interface TimelineDataItem {
  hora: string;
  emRota: number;
  noDestino: number;
  alerta: number;
}

interface StatusAnalyticsHUDProps {
  statusStats: StatusStatItem[];
  timelineData?: TimelineDataItem[];
  totalIscas: number;
}

const DEFAULT_TIMELINE_DATA: TimelineDataItem[] = [
  { hora: '06:00', emRota: 6, noDestino: 2, alerta: 0 },
  { hora: '09:00', emRota: 10, noDestino: 4, alerta: 1 },
  { hora: '12:00', emRota: 14, noDestino: 6, alerta: 1 },
  { hora: '15:00', emRota: 16, noDestino: 9, alerta: 2 },
  { hora: '18:00', emRota: 21, noDestino: 12, alerta: 2 },
];

export const StatusAnalyticsHUD: React.FC<StatusAnalyticsHUDProps> = ({
  statusStats,
  timelineData = DEFAULT_TIMELINE_DATA,
  totalIscas
}) => {
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

  return (
    <section
      ref={containerRef}
      className={cn(
        "bg-gradient-to-b from-[#020617] via-[#070e24] to-[#020617] backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(0,240,255,0.18)] relative overflow-hidden group transition-all duration-300 space-y-6 font-mono",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 flex flex-col justify-between w-screen h-screen overflow-y-auto"
      )}
    >
      {/* Tech Brackets Corners */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />

      {/* Top HUD Analytics Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-300 shadow-[0_0_12px_#00f0ff]"></span>
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              <Activity className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              PAINEL DE ESTATÍSTICAS E FLUXO // ANALYTICS HUD
            </h2>
            <span className="text-[10px] text-cyan-400/70 flex items-center gap-2 mt-0.5">
              <span>MÉTRICAS DE PERFORMANCE EM TEMPO REAL</span>
              <span className="text-cyan-500">•</span>
              <span className="text-cyan-200 font-bold">TOTAL DE ISCAS: {totalIscas}</span>
            </span>
          </div>
        </div>

        {/* Full Screen Toggle Control Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Painel em Tela Cheia"}
          className={cn(
            "px-4 py-2 rounded-xl border font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer text-xs self-start sm:self-auto",
            isFullscreen
              ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_25px_#00f0ff]"
              : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-slate-950" />
              <span>SAIR DA TELA CHEIA (ESC)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>TELA CHEIA</span>
            </>
          )}
        </button>
      </div>

      {/* 1. HUD Radial Gauges Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {statusStats.map(stat => (
          <div
            key={stat.key}
            className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-3.5 flex flex-col items-center text-center relative overflow-hidden group hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.05)]"
          >
            {/* Top Neon Color Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.glow}` }}
            />

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 truncate w-full">
              {stat.label}
            </span>

            {/* Circular Radial HUD Gauge */}
            <div className="relative w-16 h-16 my-2.5 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="24" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  stroke={stat.color}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={150}
                  strokeDashoffset={150 - (150 * stat.percentage) / 100}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${stat.color})` }}
                />
              </svg>
              <span className="absolute text-sm font-black text-white">{stat.count}</span>
            </div>

            <span
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700"
              style={{ color: stat.color }}
            >
              {stat.percentage}% DO TOTAL
            </span>
          </div>
        ))}
      </div>

      {/* 2. Lateral Bar Charts & Timeline Line Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Horizontal Bar Chart - Status Distribution */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              DISTRIBUIÇÃO POR STATUS (BARRAS HORIZONTAIS)
            </h3>
            <span className="text-[10px] text-cyan-400/60 font-bold">TOTAL: {totalIscas} ISCAS</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={statusStats} margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff" strokeOpacity={0.15} horizontal={false} />
                <XAxis type="number" stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis dataKey="label" type="category" width={110} stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: '#00f0ff', borderRadius: '12px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                  cursor={{ fill: 'rgba(0, 240, 255, 0.08)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Line Chart - Timeline / Status Flow Trend */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              FLUXO DE MOVIMENTAÇÃO DE ISCAS (LINHAS TEMPO)
            </h3>
            <span className="text-[10px] text-cyan-400/60 font-bold">HUD TIMELINE</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff" strokeOpacity={0.15} />
                <XAxis dataKey="hora" stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#00f0ff" strokeOpacity={0.5} tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: '#00f0ff', borderRadius: '12px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="emRota" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4, fill: '#00f0ff' }} name="Em Rota (Ativas)" />
                <Line type="monotone" dataKey="noDestino" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="No Destino" />
                <Line type="monotone" dataKey="alerta" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="Ocorrências" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};
