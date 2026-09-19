import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Flame,
  Shield,
  Leaf,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Truck,
  HardHat,
  FileCheck,
  Radio,
  Clock,
  Headphones,
  Compass,
  Plus,
  Minus,
  Maximize2,
  ChevronDown,
  Layers,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import tacticalMapImg from '../assets/images/pgr_tactical_relief_map_1789796108088.jpg';
import truckSunsetImg from '../assets/images/pgr_truck_sunset_1789796120595.jpg';
import shield3dImg from '../assets/images/pgr_shield_3d_1789796132107.jpg';

interface PgrCommandCenterProps {
  onNavigateTab?: (tabId: string) => void;
  onOpenSettings?: () => void;
}

interface MapIncident {
  id: string;
  type: 'critical' | 'moderate' | 'low';
  name: string;
  city: string;
  x: number; // percentage from left
  y: number; // percentage from top
  desc: string;
  time: string;
}

export default function PgrCommandCenter({ onNavigateTab, onOpenSettings }: PgrCommandCenterProps) {
  // Map toggles
  const [toggleIncendio, setToggleIncendio] = useState(true);
  const [toggleSeguranca, setToggleSeguranca] = useState(true);
  const [toggleAmbiental, setToggleAmbiental] = useState(false);
  const [toggleOperacional, setToggleOperacional] = useState(true);

  const [mapZoom, setMapZoom] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Map incident pins
  const incidents: MapIncident[] = [
    {
      id: 'inc-1',
      type: 'critical',
      name: 'Vazamento Logístico',
      city: 'Santa Luzia - MG',
      x: 52,
      y: 38,
      desc: 'Bloqueio preventivo na baia 04 do centro de distribuição.',
      time: '2h atrás'
    },
    {
      id: 'inc-2',
      type: 'critical',
      name: 'Interdição de Faixa',
      city: 'Betim - MG (BR-381)',
      x: 46,
      y: 54,
      desc: 'Congestionamento severo e desvio obrigatório para frotas.',
      time: '3h atrás'
    },
    {
      id: 'inc-3',
      type: 'moderate',
      name: 'Condição Climática Severa',
      city: 'Serra do Cafezal - SP/MG',
      x: 40,
      y: 33,
      desc: 'Neblina densa e pista escorregadia com velocidade reduzida.',
      time: '4h atrás'
    },
    {
      id: 'inc-4',
      type: 'moderate',
      name: 'Atraso de Transbordo',
      city: 'Pouso Alegre - MG',
      x: 58,
      y: 62,
      desc: 'Aguardando liberação de janela de descarga fiscal.',
      time: '5h atrás'
    },
    {
      id: 'inc-5',
      type: 'moderate',
      name: 'Inspeção Sanitária Rota',
      city: 'Uberlândia - MG',
      x: 65,
      y: 35,
      desc: 'Checagem de temperatura e lacres de segurança.',
      time: '1h atrás'
    },
    {
      id: 'inc-6',
      type: 'low',
      name: 'Manutenção Preventiva',
      city: 'Unidade RJ',
      x: 43,
      y: 42,
      desc: 'Troca de atuadores telemáticos em 4 cavalos mecânicos.',
      time: '6h atrás'
    },
    {
      id: 'inc-7',
      type: 'low',
      name: 'Auditoria de Periféricos',
      city: 'Juiz de Fora - MG',
      x: 50,
      y: 68,
      desc: 'Checklist regular concluído com 100% de conformidade.',
      time: '7h atrás'
    },
    {
      id: 'inc-8',
      type: 'low',
      name: 'Abastecimento em Trânsito',
      city: 'Montes Claros - MG',
      x: 68,
      y: 48,
      desc: 'Veículos em rota de entrega monitorada.',
      time: '8h atrás'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col gap-3.5 select-none animate-in fade-in duration-500 text-slate-100">
      
      {/* Top 4 KPI 3D Prism Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Riscos Críticos */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="pgr-glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-red-500/30 group cursor-pointer shadow-[0_10px_30px_rgba(255,34,51,0.15)]"
          onClick={() => onNavigateTab?.('alertas')}
        >
          {/* Subtle 3D Red Prism Emblem */}
          <div className="w-13 h-13 rounded-2xl pgr-prism-red flex items-center justify-center shrink-0 relative shadow-[0_0_25px_rgba(255,34,51,0.6)]">
            <AlertTriangle className="w-7 h-7 text-white stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Riscos Críticos
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,34,51,0.4)]">
                5
              </span>
              <span className="text-xs font-bold text-red-400 flex items-center gap-0.5">
                <TrendingUp size={12} className="stroke-[3]" />
                25%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              vs. mês anterior
            </span>
          </div>
          
          {/* Background Ambient Glow */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none group-hover:bg-red-600/20 transition-all" />
        </motion.div>

        {/* Card 2: Riscos Moderados */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="pgr-glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-amber-500/30 group cursor-pointer shadow-[0_10px_30px_rgba(255,170,0,0.15)]"
          onClick={() => onNavigateTab?.('alertas')}
        >
          {/* Subtle 3D Amber Prism Emblem */}
          <div className="w-13 h-13 rounded-2xl pgr-prism-amber flex items-center justify-center shrink-0 relative shadow-[0_0_25px_rgba(255,170,0,0.6)]">
            <AlertTriangle className="w-7 h-7 text-white stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Riscos Moderados
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,170,0,0.4)]">
                12
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                <TrendingUp size={12} className="stroke-[3]" />
                8%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              vs. mês anterior
            </span>
          </div>

          <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
        </motion.div>

        {/* Card 3: Riscos Baixos */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="pgr-glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-cyan-500/30 group cursor-pointer shadow-[0_10px_30px_rgba(0,229,255,0.15)]"
          onClick={() => onNavigateTab?.('alertas')}
        >
          {/* Subtle 3D Cyan Prism Emblem */}
          <div className="w-13 h-13 rounded-2xl pgr-prism-cyan flex items-center justify-center shrink-0 relative shadow-[0_0_25px_rgba(0,229,255,0.6)]">
            <Info className="w-7 h-7 text-white stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Riscos Baixos
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                28
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingDown size={12} className="stroke-[3]" />
                12%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              vs. mês anterior
            </span>
          </div>

          <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
        </motion.div>

        {/* Card 4: Conformidade */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="pgr-glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-emerald-500/30 group cursor-pointer shadow-[0_10px_30px_rgba(0,230,118,0.15)]"
          onClick={() => onNavigateTab?.('checklist')}
        >
          {/* Subtle 3D Green Prism Emblem */}
          <div className="w-13 h-13 rounded-2xl pgr-prism-green flex items-center justify-center shrink-0 relative shadow-[0_0_25px_rgba(0,230,118,0.6)]">
            <CheckCircle2 className="w-7 h-7 text-white stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 rounded-2xl pointer-events-none" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Conformidade
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]">
                93%
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={12} className="stroke-[3]" />
                6%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              vs. mês anterior
            </span>
          </div>

          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        </motion.div>

      </div>

      {/* Main Grid: 3D Tactical Relief Map (Left) + Quick Actions Sidebar (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 flex-1 min-h-0">
        
        {/* Central Tactical Map Section (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-3.5 min-h-[480px]">
          
          {/* 3D Map HUD Container */}
          <div className="pgr-glass-card rounded-3xl p-4 sm:p-5 flex-1 relative overflow-hidden border border-cyan-500/25 flex flex-col shadow-[0_15px_45px_rgba(0,0,0,0.8)]">
            
            {/* Header overlay */}
            <div className="flex items-center justify-between z-20 relative gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-bold text-slate-200 shadow-md">
                <Layers size={14} className="text-cyan-400" />
                <span>Mapa de Riscos</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE 8K LIVE HUD
                </span>
              </div>
            </div>

            {/* Tactical Relief Map Canvas */}
            <div className="relative flex-1 w-full mt-2 rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[340px] flex items-center justify-center bg-[#050b14] border border-cyan-900/40">
              
              {/* Ultra realistic 3D Relief background */}
              <motion.img
                src={tacticalMapImg}
                alt="3D Tactical Relief Map"
                className="w-full h-full object-cover object-center select-none"
                style={{ scale: mapZoom }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              />

              {/* High-tech Vignette & Grid Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b14]/90 via-transparent to-[#060b14]/40 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(0,180,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              {/* Interactive Tactical Pins */}
              {incidents.map((pin) => {
                const isSelected = selectedIncident?.id === pin.id;
                const isCritical = pin.type === 'critical';
                const isModerate = pin.type === 'moderate';

                return (
                  <div
                    key={pin.id}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                    onClick={() => setSelectedIncident(isSelected ? null : pin)}
                  >
                    {/* Pulsing ring */}
                    <div
                      className={`absolute -inset-2.5 rounded-full animate-ping opacity-60 pointer-events-none ${
                        isCritical ? 'bg-red-500' : isModerate ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />

                    {/* 3D Pin Head */}
                    <motion.div
                      whileHover={{ scale: 1.35 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-lg border relative transition-all ${
                        isCritical
                          ? 'pgr-prism-red border-red-300 text-white'
                          : isModerate
                            ? 'pgr-prism-amber border-amber-200 text-white'
                            : 'pgr-prism-green border-emerald-200 text-white'
                      } ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
                    >
                      {isCritical ? (
                        <AlertTriangle size={13} className="stroke-[2.5]" />
                      ) : isModerate ? (
                        <AlertTriangle size={13} className="stroke-[2.5]" />
                      ) : (
                        <Info size={13} className="stroke-[2.5]" />
                      )}
                    </motion.div>

                    {/* Tooltip on hover or select */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 border border-cyan-500/40 p-2.5 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 text-left">
                      <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 uppercase">
                        <span>{pin.city}</span>
                        <span>{pin.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">{pin.name}</h4>
                      <p className="text-[10px] text-slate-300 mt-1 leading-snug">{pin.desc}</p>
                    </div>
                  </div>
                );
              })}

              {/* Left Tactical Map Filters Overlay (Directly matching screenshot) */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 max-w-[170px] shadow-2xl text-[11px]">
                
                {/* Risk Counters */}
                <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-800">
                  <div className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff2233]" />
                      <span className="font-semibold text-[10px]">Risco Crítico</span>
                    </div>
                    <span className="font-bold text-red-400">5</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#ffaa00]" />
                      <span className="font-semibold text-[10px]">Risco Moderado</span>
                    </div>
                    <span className="font-bold text-amber-300">12</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00e676]" />
                      <span className="font-semibold text-[10px]">Risco Baixo</span>
                    </div>
                    <span className="font-bold text-emerald-400">28</span>
                  </div>
                </div>

                {/* Layer Toggles */}
                <div className="flex flex-col gap-2 pt-1">
                  {/* Incêndio */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Flame size={12} className="text-red-400" />
                      Incêndio
                    </span>
                    <button
                      type="button"
                      onClick={() => setToggleIncendio(!toggleIncendio)}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        toggleIncendio ? 'bg-cyan-500 shadow-[0_0_8px_#00e5ff]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          toggleIncendio ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Segurança */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Shield size={12} className="text-blue-400" />
                      Segurança
                    </span>
                    <button
                      type="button"
                      onClick={() => setToggleSeguranca(!toggleSeguranca)}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        toggleSeguranca ? 'bg-cyan-500 shadow-[0_0_8px_#00e5ff]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          toggleSeguranca ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Ambiental */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Leaf size={12} className="text-emerald-400" />
                      Ambiental
                    </span>
                    <button
                      type="button"
                      onClick={() => setToggleAmbiental(!toggleAmbiental)}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        toggleAmbiental ? 'bg-cyan-500 shadow-[0_0_8px_#00e5ff]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          toggleAmbiental ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Operacional */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <SettingsIcon size={12} className="text-cyan-400" />
                      Operacional
                    </span>
                    <button
                      type="button"
                      onClick={() => setToggleOperacional(!toggleOperacional)}
                      className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        toggleOperacional ? 'bg-cyan-500 shadow-[0_0_8px_#00e5ff]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          toggleOperacional ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>

              {/* 3D Compass Rose (Top Right) */}
              <div className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/75 border border-cyan-500/30 backdrop-blur-md">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="absolute -top-1 text-[8px] font-black text-cyan-300">N</span>
                  <span className="absolute -bottom-1 text-[8px] font-black text-slate-400">S</span>
                  <span className="absolute -left-1 text-[8px] font-black text-slate-400">O</span>
                  <span className="absolute -right-1 text-[8px] font-black text-slate-400">E</span>
                  <Compass size={22} className="text-cyan-400 animate-spin-slow" />
                </div>
              </div>

              {/* Zoom Controls (Bottom Right) */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-cyan-500/30 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.min(prev + 0.15, 1.6))}
                  className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
                  title="Aproximar mapa"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(prev => Math.max(prev - 0.15, 0.85))}
                  className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
                  title="Afastar mapa"
                >
                  <Minus size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Row: Últimos Alertas + Indicadores de Risco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Box 1: Últimos Alertas */}
            <div className="pgr-glass-card rounded-2xl p-4 flex flex-col justify-between border border-cyan-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Últimos Alertas
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('alertas')}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  Ver todos →
                </button>
              </div>

              <div className="flex flex-col gap-2.5 mt-3">
                {/* Alert 1 */}
                <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/50 transition-colors border border-red-500/15">
                  <div className="w-8 h-8 rounded-lg pgr-prism-red flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-400">Risco Crítico</span>
                      <span className="text-[9px] font-mono text-slate-500">2h atrás</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      Vazamento identificado na área de logística - Unidade MG
                    </p>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/50 transition-colors border border-amber-500/15">
                  <div className="w-8 h-8 rounded-lg pgr-prism-amber flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400">Risco Moderado</span>
                      <span className="text-[9px] font-mono text-slate-500">4h atrás</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      Condições climáticas adversas - Rota SP/MG
                    </p>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/50 transition-colors border border-emerald-500/15">
                  <div className="w-8 h-8 rounded-lg pgr-prism-green flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400">Risco Baixo</span>
                      <span className="text-[9px] font-mono text-slate-500">6h atrás</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      Manutenção preventiva em andamento - Unidade RJ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Indicadores de Risco (Neon Donut Chart) */}
            <div className="pgr-glass-card rounded-2xl p-4 flex flex-col justify-between border border-cyan-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Radio size={15} className="text-cyan-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Indicadores de Risco
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('relatorios')}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  Ver relatório →
                </button>
              </div>

              <div className="flex items-center justify-around gap-4 mt-3">
                {/* 3D Glowing Donut Chart */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="3.8"
                    />
                    {/* Segment 1: Low Risk (Green 46%) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00e676"
                      strokeWidth="4"
                      strokeDasharray="46, 100"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(0,230,118,0.7)]"
                    />
                    {/* Segment 2: Moderate Risk (Amber 38%) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ffaa00"
                      strokeWidth="4"
                      strokeDasharray="38, 100"
                      strokeDashoffset="-46"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(255,170,0,0.7)]"
                    />
                    {/* Segment 3: Critical Risk (Red 16%) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ff2233"
                      strokeWidth="4.2"
                      strokeDasharray="16, 100"
                      strokeDashoffset="-84"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_rgba(255,34,51,0.8)]"
                    />
                  </svg>

                  {/* Inner text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-white leading-none">32</span>
                    <span className="text-[8px] font-semibold text-slate-400 uppercase mt-0.5">
                      Total de Riscos
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ff2233]" />
                      Críticos
                    </span>
                    <span className="font-bold text-slate-100">5 (16%)</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#ffaa00]" />
                      Moderados
                    </span>
                    <span className="font-bold text-slate-100">12 (38%)</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#00e676]" />
                      Baixos
                    </span>
                    <span className="font-bold text-slate-100">15 (46%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Dock / Realtime Status Bar (Matching screenshot bottom dock) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2 rounded-2xl bg-slate-950/70 border border-cyan-500/20 backdrop-blur-md">
            
            {/* Dock item 1 */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/50">
              <div className="w-8 h-8 rounded-lg pgr-prism-cyan flex items-center justify-center shrink-0">
                <Radio size={14} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-slate-200 truncate">
                  Monitoramento 24h
                </span>
                <span className="text-[9px] text-slate-400 truncate">
                  Veículos e cargas em tempo real
                </span>
              </div>
            </div>

            {/* Dock item 2 */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shrink-0">
                <Truck size={14} className="text-cyan-300" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-slate-200 truncate">
                  Rodovias Monitoradas
                </span>
                <span className="text-[9px] text-slate-400 truncate">
                  Principais e secundárias
                </span>
              </div>
            </div>

            {/* Dock item 3 */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-blue-950 border border-blue-500 flex items-center justify-center shrink-0">
                <Headphones size={14} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-slate-200 truncate">
                  Suporte Operacional
                </span>
                <span className="text-[9px] text-slate-400 truncate">
                  Equipe especializada
                </span>
              </div>
            </div>

            {/* Dock item 4 */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/50">
              <div className="w-8 h-8 rounded-lg pgr-prism-cyan flex items-center justify-center shrink-0">
                <Clock size={14} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-slate-200 truncate">
                  Tempo de resposta
                </span>
                <span className="text-[9px] text-slate-400 truncate">
                  Média de 12 min
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Section (4 Cols - Hero Truck & Action Orbs) */}
        <div className="xl:col-span-4 flex flex-col gap-3.5">
          
          {/* Hero Truck Card: Gestão de Riscos */}
          <div className="pgr-glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden border border-cyan-500/25 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.7)] group">
            
            {/* Cinematic 8K Truck Photo Banner */}
            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-cyan-500/30">
              <img
                src={truckSunsetImg}
                alt="Gestão de Riscos Caminhão na Rodovia"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-[9px] font-black text-cyan-300">
                8K ULTRA HDR
              </div>
            </div>

            <div className="mt-3.5">
              <h3 className="text-base font-black text-white tracking-wide uppercase">
                Gestão de Riscos
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Mais controle, menos surpresas.
              </p>

              <button
                type="button"
                onClick={() => onNavigateTab?.('escala')}
                className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,180,255,0.4)] transition-all cursor-pointer active:scale-98"
              >
                <span>Ver detalhes</span>
                <ChevronRight size={14} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* 4 Quick Action 3D Orbs Cards (Matching screenshot) */}
          <div className="flex flex-col gap-2.5">
            
            {/* Item 1: Segurança do Trabalho */}
            <motion.div
              whileHover={{ x: 3 }}
              onClick={() => onNavigateTab?.('checklist')}
              className="pgr-glass-card pgr-glass-card-hover rounded-2xl p-3 flex items-center justify-between border border-amber-500/20 cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl pgr-prism-amber flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,170,0,0.5)]">
                  <HardHat size={18} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide truncate">
                    Segurança do Trabalho
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Prevenção de acidentes e proteção da sua equipe.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </motion.div>

            {/* Item 2: Meio Ambiente */}
            <motion.div
              whileHover={{ x: 3 }}
              onClick={() => onNavigateTab?.('rotas')}
              className="pgr-glass-card pgr-glass-card-hover rounded-2xl p-3 flex items-center justify-between border border-emerald-500/20 cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl pgr-prism-green flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,230,118,0.5)]">
                  <Leaf size={18} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide truncate">
                    Meio Ambiente
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Sustentabilidade em todas as operações.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </motion.div>

            {/* Item 3: Logística e Transporte */}
            <motion.div
              whileHover={{ x: 3 }}
              onClick={() => onNavigateTab?.('patio')}
              className="pgr-glass-card pgr-glass-card-hover rounded-2xl p-3 flex items-center justify-between border border-cyan-500/20 cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl pgr-prism-cyan flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                  <Truck size={18} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide truncate">
                    Logística e Transporte
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Monitoramento de rotas e cargas.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </motion.div>

            {/* Item 4: Conformidade Legal */}
            <motion.div
              whileHover={{ x: 3 }}
              onClick={() => onNavigateTab?.('averbacao')}
              className="pgr-glass-card pgr-glass-card-hover rounded-2xl p-3 flex items-center justify-between border border-slate-500/20 cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-400 flex items-center justify-center shrink-0 shadow-md">
                  <FileCheck size={18} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide truncate">
                    Conformidade Legal
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Tudo dentro das normas.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </motion.div>

          </div>

          {/* Bottom Card: PGR Metallic Shield Promo Banner */}
          <div className="pgr-glass-card rounded-2xl p-3.5 relative overflow-hidden border border-cyan-500/25 flex items-center gap-3.5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-cyan-400/40 p-1 bg-slate-900/60 shadow-[0_0_15px_rgba(0,180,255,0.4)]">
              <img src={shield3dImg} alt="PGR 3D Shield" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-sm font-black text-white tracking-wider uppercase">
                PGR
              </h4>
              <p className="text-[10px] text-slate-300 leading-tight">
                Riscos sob controle. Resultados em foco.
              </p>
              <div className="flex gap-1 mt-1.5">
                <span className="w-3.5 h-1 rounded-full bg-cyan-400" />
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="w-1 h-1 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
