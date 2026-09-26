import React from 'react';
import { 
  Compass, 
  Plus, 
  Minus, 
  Crosshair,
  Navigation,
  MapPin,
  FileText,
  Truck,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Target,
  BarChart2,
  ChevronRight,
  Route,
  Activity
} from 'lucide-react';

// Cinematic image assets
import heroConvoy from '../assets/images/hero_convoy_sunset_1790400296415.jpg';
import brazilRelief from '../assets/images/brazil_3d_relief_map_1790400313005.jpg';

interface DashboardInicioFuturisticProps {
  onNavigate?: (tab: string) => void;
}

export default function DashboardInicioFuturistic({ onNavigate }: DashboardInicioFuturisticProps) {
  return (
    <div className="w-full h-auto flex flex-col gap-3.5 select-none">
      
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO WIDESCREEN BANNER                                       */}
      {/* ========================================================================= */}
      <section className="relative w-full rounded-3xl overflow-hidden border border-[#d8d0c5] shadow-md bg-stone-900 min-h-[270px] lg:h-[285px] flex items-center">
        
        {/* Background photo of convoy on highway at golden sunset */}
        <img
          src={heroConvoy}
          alt="Frota Café Três Corações na Rodovia"
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic gradient overlays for maximum contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full h-full px-6 py-5 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          
          {/* Left Hero Text & Call to Actions */}
          <div className="max-w-xl text-left flex flex-col justify-center">
            
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#f3d498] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f3d498] font-mono">
                LOGÍSTICA OPERACIONAL
              </span>
            </div>

            {/* Main Headline with 3D Gold Embossed Gradient */}
            <h1 className="text-3xl lg:text-[44px] font-black text-white tracking-tight leading-[0.92] uppercase mb-3">
              LOGÍSTICA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d8] via-[#dfb15b] to-[#996e1d] font-black drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
                OMNIPRESENTE
              </span>
            </h1>

            {/* Description */}
            <p className="text-xs lg:text-[12.5px] text-stone-200 leading-relaxed font-medium mb-4 max-w-md drop-shadow-sm">
              Conectando regiões, pessoas e oportunidades com segurança, eficiência e o sabor do Brasil em cada rota operada de norte a sul.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                type="button"
                onClick={() => onNavigate?.('rotas')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8f101b] via-[#a31524] to-[#6d0913] hover:from-[#a31524] hover:to-[#8f101b] text-white text-[10.5px] font-bold tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(143,16,27,0.45)] hover:scale-102 active:scale-98 flex items-center gap-2 border border-red-400/30 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <MapPin size={11} />
                </div>
                <span>Lançar Nova Rota</span>
                <ChevronRight size={13} className="ml-0.5 text-white/80" />
              </button>

              <button 
                type="button"
                onClick={() => onNavigate?.('checklist')}
                className="px-5 py-2.5 rounded-full bg-[#fdfbf7]/90 hover:bg-white text-stone-900 text-[10.5px] font-bold tracking-wider uppercase transition-all shadow-md hover:scale-102 active:scale-98 flex items-center gap-2 border border-[#ded5c6] cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-800">
                  <FileText size={11} />
                </div>
                <span>Ver Protocolos</span>
                <ChevronRight size={13} className="ml-0.5 text-stone-500" />
              </button>
            </div>

          </div>

          {/* Right Hero HUD Panel (Dark glass panel with Holographic Brazil Map & Key Stat Indicators) */}
          <div className="w-full lg:w-[415px] bg-black/65 backdrop-blur-md rounded-2xl border border-white/25 p-3.5 shadow-2xl flex items-center gap-4 shrink-0 self-center">
            
            {/* Holographic Mini Map of Brazil with routes and glowing nodes */}
            <div className="w-[180px] h-[140px] relative shrink-0 border-r border-white/15 pr-3 flex items-center justify-center">
              <svg viewBox="0 0 200 160" className="w-full h-full select-none">
                <defs>
                  <filter id="hologramGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Brazil Hologram Boundary */}
                <path 
                  d="M 50,45 Q 90,20 140,28 T 180,65 T 185,100 T 150,140 T 95,150 T 60,110 T 35,70 Z" 
                  fill="rgba(14, 165, 233, 0.08)"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  filter="url(#hologramGlow)"
                />

                {/* Holographic glowing routes */}
                <path d="M 65,55 L 110,60 L 140,90 L 125,120 L 95,138" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                <path d="M 110,60 L 125,120 M 140,90 L 160,80" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 2" />

                {/* Glowing Nodes */}
                <circle cx="65" cy="55" r="3.5" fill="#38bdf8" className="animate-pulse" />
                <circle cx="110" cy="60" r="3.5" fill="#f59e0b" />
                <circle cx="140" cy="90" r="3.5" fill="#22d3ee" />
                <circle cx="125" cy="120" r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                <circle cx="95" cy="138" r="3.5" fill="#22d3ee" />

                {/* Watermark BRASIL */}
                <text 
                  x="100" 
                  y="85" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  opacity="0.8" 
                  fontSize="11" 
                  fontWeight="900" 
                  letterSpacing="3"
                  className="font-mono"
                >
                  BRASIL
                </text>
              </svg>
            </div>

            {/* 3 Vertical Stat Badges */}
            <div className="flex-1 flex flex-col justify-between h-[135px] py-0.5">
              
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b] text-[11px] shrink-0 shadow-xs">
                  <Target size={13} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[9.5px] font-black tracking-wide text-white uppercase block">
                    + Eficiência
                  </span>
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-widest block">
                    Nas Rotas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b] text-[11px] shrink-0 shadow-xs">
                  <ShieldCheck size={13} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[9.5px] font-black tracking-wide text-white uppercase block">
                    + Segurança
                  </span>
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-widest block">
                    Nas Operações
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b] text-[11px] shrink-0 shadow-xs">
                  <BarChart2 size={13} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[9.5px] font-black tracking-wide text-white uppercase block">
                    + Resultados
                  </span>
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-widest block">
                    Em Todas as Regiões
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. THREE-CARD DASHBOARD GRID MATCHING USER SPEC (EDGE-TO-EDGE IN 1 ROW)   */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.32fr_1fr_0.92fr] gap-3.5 w-full items-stretch">

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 1: ROTAS EM TEMPO REAL                                             */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8f101b] shrink-0">
              <MapPin size={13} />
            </div>
            <div>
              <h3 className="text-xs font-black text-stone-900 tracking-wide uppercase font-sans">
                Rotas em Tempo Real
              </h3>
              <p className="text-[8px] font-bold text-stone-500 uppercase tracking-wider">
                Acompanhamento de toda a operação
              </p>
            </div>
          </div>

          {/* Map + Side Info Container */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1 min-h-[220px]">
            
            {/* Left Relief Map container */}
            <div className="sm:col-span-8 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#f5ede1] via-[#efe5d5] to-[#e8dcc9] border border-[#ded5c6] flex items-center justify-center min-h-[200px] shadow-inner">
              
              {/* 3D Isometric Map Background */}
              <img
                src={brazilRelief}
                alt="Relevo 3D Brasil"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-85 mix-blend-multiply"
              />

              {/* Glowing Route Network SVG Overlay */}
              <svg viewBox="0 0 320 240" className="absolute inset-0 w-full h-full select-none z-10">
                <defs>
                  <filter id="neonGlowRoute" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connecting glowing arcs */}
                {/* Manaus -> Brasília */}
                <path d="M 85,60 Q 125,100 160,135" fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#neonGlowRoute)" />
                {/* Belém -> Brasília */}
                <path d="M 165,58 Q 165,95 160,135" fill="none" stroke="#ef4444" strokeWidth="2" />
                {/* Fortaleza -> Salvador */}
                <path d="M 230,65 Q 240,105 210,135" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />
                {/* Salvador -> Recife */}
                <path d="M 210,135 Q 240,110 250,85" fill="none" stroke="#10b981" strokeWidth="2" />
                {/* Brasília -> Salvador */}
                <path d="M 160,135 Q 185,135 210,135" fill="none" stroke="#ef4444" strokeWidth="2.2" />
                {/* Brasília -> S. Paulo/Rio */}
                <path d="M 160,135 Q 175,165 190,185" fill="none" stroke="#ef4444" strokeWidth="2.5" filter="url(#neonGlowRoute)" />
                {/* S. Paulo/Rio -> Porto Alegre */}
                <path d="M 190,185 Q 165,210 145,225" fill="none" stroke="#10b981" strokeWidth="2.2" />

                {/* Node Markers with Labels */}
                {[
                  { n: 'Manaus', x: 85, y: 60, col: '#10b981' },
                  { n: 'Belém', x: 165, y: 58, col: '#ef4444' },
                  { n: 'Fortaleza', x: 230, y: 65, col: '#10b981' },
                  { n: 'Recife', x: 250, y: 85, col: '#10b981' },
                  { n: 'Salvador', x: 210, y: 135, col: '#ef4444' },
                  { n: 'Brasília', x: 160, y: 135, col: '#ef4444' },
                  { n: 'S. Paulo/Rio', x: 190, y: 185, col: '#ef4444' },
                  { n: 'Porto Alegre', x: 145, y: 225, col: '#10b981' },
                ].map(city => (
                  <g key={city.n} transform={`translate(${city.x}, ${city.y})`}>
                    <circle r="4.5" fill={city.col} stroke="#ffffff" strokeWidth="1.5" className="shadow-sm" />
                    <text 
                      y="-7" 
                      textAnchor="middle" 
                      fontSize="6.5" 
                      fontWeight="900" 
                      fill="#222" 
                      className="font-sans filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                    >
                      {city.n}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Map Floating Control Tools (Left vertical stack) */}
              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                <button type="button" className="w-5 h-5 rounded-full bg-white/95 border border-stone-300 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-white transition-colors cursor-pointer">
                  <Crosshair size={10} className="text-[#8f101b]" />
                </button>
                <button type="button" className="w-5 h-5 rounded-full bg-white/95 border border-stone-300 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-white transition-colors cursor-pointer">
                  <Compass size={10} />
                </button>
                <button type="button" className="w-5 h-5 rounded-full bg-white/95 border border-stone-300 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-white transition-colors cursor-pointer">
                  <Plus size={10} />
                </button>
                <button type="button" className="w-5 h-5 rounded-full bg-white/95 border border-stone-300 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-white transition-colors cursor-pointer">
                  <Minus size={10} />
                </button>
                <button type="button" className="w-5 h-5 rounded-full bg-white/95 border border-stone-300 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-white transition-colors cursor-pointer">
                  <Navigation size={10} />
                </button>
              </div>

              {/* Floating Bottom Status Pill */}
              <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-sm border border-white/20 text-white flex items-center gap-1.5 shadow-sm text-[8px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                <span>8 ROTAS ATIVAS • Sistema em operação</span>
              </div>

            </div>

            {/* Right Side Stats in Card 1 */}
            <div className="sm:col-span-4 flex flex-col justify-between space-y-2.5 py-0.5 sm:border-l sm:border-stone-200 sm:pl-3">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <Truck size={14} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-wider block">
                    TOTAL DE ROTAS
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-stone-900 font-mono">42</span>
                    <span className="text-[7.5px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp size={9} className="mr-0.5" /> 12%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0">
                  <Route size={14} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-wider block">
                    DISTÂNCIA PERCORRIDA
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-stone-900 font-mono">12.480 km</span>
                    <span className="text-[7.5px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp size={9} className="mr-0.5" /> 8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0">
                  <Clock size={14} />
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-wider block">
                    TEMPO MÉDIO
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-stone-900 font-mono">8h 24min</span>
                    <span className="text-[7.5px] font-bold text-rose-500 flex items-center">
                      <TrendingDown size={9} className="mr-0.5" /> 6%
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend Dots */}
              <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-1.5 text-[8px] font-bold text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Ativa: 32</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span>Carregada: 5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                  <span>Descarga: 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span>Parada: 2</span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Button at bottom */}
          <button
            type="button"
            onClick={() => onNavigate?.('rotas')}
            className="w-full mt-3 py-2 rounded-xl bg-[#fdfbf7] hover:bg-stone-100 border border-[#ded5c6] text-[9.5px] font-bold uppercase tracking-widest text-stone-700 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <span>Ver todas as rotas</span>
            <ChevronRight size={12} className="text-[#8f101b]" />
          </button>

        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 2: TELEMETRIA TÁTICA                                               */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8f101b] shrink-0">
              <Activity size={13} />
            </div>
            <div>
              <h3 className="text-xs font-black text-stone-900 tracking-wide uppercase font-sans">
                Telemetria Tática
              </h3>
              <p className="text-[8px] font-bold text-stone-500 uppercase tracking-wider">
                Fluxo de movimentação 24h
              </p>
            </div>
          </div>

          {/* 24h Movement Area Curve Chart */}
          <div className="relative w-full h-[155px] bg-white rounded-2xl border border-stone-200 p-2.5 flex flex-col justify-between shadow-inner">
            
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-6 top-3 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
            </div>

            {/* Y-Axis Labels */}
            <div className="absolute left-1.5 top-2 bottom-5 flex flex-col justify-between text-[7px] font-mono text-stone-400 font-bold">
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            {/* SVG Wave lines */}
            <div className="w-full h-full relative pl-4 pb-3">
              <svg viewBox="0 0 300 110" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  {/* Red Area Gradient */}
                  <linearGradient id="telemetryRedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Teal Area Gradient */}
                  <linearGradient id="telemetryTealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Areas */}
                <path 
                  d="M 10,95 C 40,65 60,78 95,82 C 145,55 175,62 205,68 C 240,75 270,72 290,65 L 290,105 L 10,105 Z" 
                  fill="url(#telemetryTealGrad)" 
                />
                <path 
                  d="M 10,85 C 40,50 60,60 95,68 C 145,35 175,45 205,38 C 240,48 270,42 290,40 L 290,105 L 10,105 Z" 
                  fill="url(#telemetryRedGrad)" 
                />

                {/* Glowing Smooth Curves */}
                <path 
                  d="M 10,95 C 40,65 60,78 95,82 C 145,55 175,62 205,68 C 240,75 270,72 290,65" 
                  fill="none" 
                  stroke="#14b8a6" 
                  strokeWidth="2.5" 
                />
                <path 
                  d="M 10,85 C 40,50 60,60 95,68 C 145,35 175,45 205,38 C 240,48 270,42 290,40" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2.5" 
                />

                {/* Peak Nodes */}
                <circle cx="95" cy="68" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                <circle cx="205" cy="38" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                <circle cx="95" cy="82" r="3.5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
                <circle cx="205" cy="68" r="3.5" fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between pl-6 pr-2 text-[7.5px] font-mono text-stone-500 font-bold">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>

          </div>

          {/* 4 Telemetry Under-Grid Cards */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5">
            <div className="bg-[#f7f4ee] rounded-xl p-1.5 text-center border border-stone-200">
              <span className="text-[10px] block">🚚</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Veículos em rota</span>
              <span className="text-xs font-black text-stone-900 font-mono block">32</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-xl p-1.5 text-center border border-stone-200">
              <span className="text-[10px] block">🏢</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Em pátio</span>
              <span className="text-xs font-black text-stone-900 font-mono block">8</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-xl p-1.5 text-center border border-stone-200">
              <span className="text-[10px] block">📦</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Carregando</span>
              <span className="text-xs font-black text-stone-900 font-mono block">6</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-xl p-1.5 text-center border border-stone-200">
              <span className="text-[10px] block">📥</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Descarregando</span>
              <span className="text-xs font-black text-stone-900 font-mono block">4</span>
            </div>
          </div>

        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 3: ALOCAÇÃO DE ATIVOS                                              */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8f101b] shrink-0">
              <Target size={13} />
            </div>
            <div>
              <h3 className="text-xs font-black text-stone-900 tracking-wide uppercase font-sans">
                Alocação de Ativos
              </h3>
              <p className="text-[8px] font-bold text-stone-500 uppercase tracking-wider">
                Distribuição da frota por região
              </p>
            </div>
          </div>

          {/* 3D Glossy Donut Chart Area + Region Breakdown Legend */}
          <div className="flex items-center justify-between gap-3 my-2">
            
            {/* 3D Visual Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
                style={{
                  background: 'conic-gradient(#8f101b 0% 33%, #0d9488 33% 54%, #eab308 54% 71%, #ea580c 71% 85%, #facc15 85% 100%)'
                }}
              />
              {/* Inner cutout with 42 TOTAL */}
              <div className="absolute inset-4 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                <span className="text-lg font-black text-stone-900 leading-none font-mono">42</span>
                <span className="text-[7px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">TOTAL</span>
              </div>
            </div>

            {/* Region List Legend */}
            <div className="flex-1 flex flex-col gap-1.5 text-[8.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8f101b]" />
                  <span className="font-bold text-stone-800">SUDESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">14 <span className="text-[7.5px] font-normal text-stone-400">(33%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
                  <span className="font-bold text-stone-800">SUL</span>
                </div>
                <span className="font-mono font-black text-stone-900">9 <span className="text-[7.5px] font-normal text-stone-400">(21%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                  <span className="font-bold text-stone-800">NORDESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">7 <span className="text-[7.5px] font-normal text-stone-400">(17%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  <span className="font-bold text-stone-800">CENTRO-OESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">6 <span className="text-[7.5px] font-normal text-stone-400">(14%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#facc15]" />
                  <span className="font-bold text-stone-800">NORTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">6 <span className="text-[7.5px] font-normal text-stone-400">(14%)</span></span>
              </div>
            </div>

          </div>

          {/* Action Button at bottom */}
          <button
            type="button"
            onClick={() => onNavigate?.('controle')}
            className="w-full mt-3 py-2 rounded-xl bg-[#fdfbf7] hover:bg-stone-100 border border-[#ded5c6] text-[9.5px] font-bold uppercase tracking-widest text-stone-700 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <span>Ver detalhamento</span>
            <ChevronRight size={12} className="text-[#8f101b]" />
          </button>

        </article>

      </section>

    </div>
  );
}
