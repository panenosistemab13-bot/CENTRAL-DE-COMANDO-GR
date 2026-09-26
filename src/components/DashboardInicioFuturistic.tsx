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
  Activity, 
  Settings, 
  Building2, 
  Package, 
  ArrowDownToLine, 
  UserCheck 
} from 'lucide-react';

// Photorealistic and 3D image assets
import heroRedConvoy from '../assets/images/hero_red_convoy_3c_1790406399003.jpg';
import brazilRelief3D from '../assets/images/brazil_relief_satellite_3d_1790406421390.jpg';
import truckThumb from '../assets/images/sidebar_truck_red_1790209039511.jpg';

interface DashboardInicioFuturisticProps {
  onNavigate?: (tab: string) => void;
}

export default function DashboardInicioFuturistic({ onNavigate }: DashboardInicioFuturisticProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between select-none font-sans overflow-hidden">
      
      {/* ========================================================================= */}
      {/* ROW 1: HERO BANNER (LEFT) + 3 STACKED METRIC CARDS (RIGHT)                */}
      {/* STRICT HEIGHT = 315px, ZERO OVERFLOW, ZERO OVERLAPPING                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-[1fr_335px] gap-3.5 items-stretch w-full h-[315px] max-h-[315px] shrink-0">
        
        {/* ----------------------------------------------------------------------- */}
        {/* HERO CINEMATIC WIDESCREEN BANNER                                        */}
        {/* ----------------------------------------------------------------------- */}
        <section className="relative w-full h-full rounded-[22px] overflow-hidden border border-[#ded5c6] shadow-[0_4px_20px_rgba(0,0,0,0.06)] bg-stone-950 flex items-center">
          
          {/* Background: Photorealistic 4K red convoy curving on highway at sunset */}
          <img
            src={heroRedConvoy}
            alt="Frota Café Três Corações na Rodovia"
            className="absolute inset-0 w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />

          {/* Cinematic lighting gradients to ensure sharp typography and HUD contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

          {/* Hero Content Container */}
          <div className="relative z-10 w-full h-full px-6 py-4 flex items-center justify-between gap-4">
            
            {/* Left Hero Text & Call to Actions */}
            <div className="max-w-[460px] text-left flex flex-col justify-center">
              
              {/* Eyebrow with Pulsing Gold Dot */}
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f3d498] shadow-[0_0_10px_#f3d498] animate-pulse" />
                <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#f3d498] font-mono">
                  LOGÍSTICA OPERACIONAL
                </span>
              </div>

              {/* Main Headline with 3D Gold Embossed Gradient */}
              <h1 className="text-[38px] font-black text-white tracking-tight leading-[0.92] uppercase mb-2 font-heading">
                LOGÍSTICA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#fff8e3] via-[#e5b85e] to-[#996e1d] font-black drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
                  OMNIPRESENTE
                </span>
              </h1>

              {/* Description */}
              <p className="text-[11.5px] text-stone-200 leading-relaxed font-medium mb-3.5 max-w-[420px] drop-shadow-sm">
                Conectando regiões, pessoas e oportunidades com segurança, eficiência e o sabor do Brasil em cada rota operada de norte a sul.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => onNavigate?.('rotas')}
                  className="px-4.5 py-2 rounded-full bg-gradient-to-r from-[#8e0b18] via-[#a91625] to-[#6f0712] hover:from-[#a91625] hover:to-[#8e0b18] text-white text-[10.5px] font-bold tracking-wider uppercase transition-all shadow-[0_4px_18px_rgba(142,11,24,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-red-400/35 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                    <MapPin size={11} />
                  </div>
                  <span>Lançar Nova Rota</span>
                  <ChevronRight size={13} className="text-white/80" />
                </button>

                <button 
                  type="button"
                  onClick={() => onNavigate?.('checklist')}
                  className="px-4.5 py-2 rounded-full bg-[#fdfbf7] hover:bg-white text-stone-900 text-[10.5px] font-bold tracking-wider uppercase transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-[#ded5c6] cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-800 shrink-0 shadow-inner">
                    <FileText size={11} />
                  </div>
                  <span>Ver Protocolos</span>
                  <ChevronRight size={13} className="text-stone-500" />
                </button>
              </div>

            </div>

            {/* Right Hero HUD Panel (Dark glass panel with Holographic Brazil Map & Key Stat Indicators) */}
            <div className="w-[390px] h-[215px] bg-black/70 backdrop-blur-md rounded-[20px] border border-white/25 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 shrink-0 self-center">
              
              {/* Holographic Mini Map of Brazil with glowing routes, nodes & 3D wireframe mesh */}
              <div className="w-[185px] h-[180px] relative shrink-0 border-r border-white/15 pr-2.5 flex items-center justify-center">
                <svg viewBox="0 0 200 180" className="w-full h-full select-none">
                  <defs>
                    <filter id="hologramGlow2" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="holoMeshGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
                    </radialGradient>
                  </defs>

                  {/* Topographic 3D Wireframe Relief Contour Lines of Brazil */}
                  <path 
                    d="M 45,45 Q 85,22 135,28 T 175,60 T 180,105 T 145,150 T 90,165 T 55,120 T 35,75 Z" 
                    fill="url(#holoMeshGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    filter="url(#hologramGlow2)"
                  />
                  {/* Internal wireframe topographic grid */}
                  <path 
                    d="M 55,55 Q 90,38 125,40 T 160,68 T 165,100 T 135,135 T 95,145 T 65,110 T 48,80 Z" 
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                    opacity="0.65"
                  />
                  <path 
                    d="M 70,68 Q 100,52 125,58 T 145,82 T 140,110 T 115,130 T 80,110 Z" 
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.6"
                    opacity="0.45"
                  />

                  {/* Wireframe mesh lattice lines across Brazil */}
                  <line x1="45" y1="45" x2="135" y2="135" stroke="#22d3ee" strokeWidth="0.4" opacity="0.35" strokeDasharray="3 3" />
                  <line x1="135" y1="28" x2="90" y2="165" stroke="#22d3ee" strokeWidth="0.4" opacity="0.35" strokeDasharray="3 3" />
                  <line x1="175" y1="60" x2="55" y2="120" stroke="#22d3ee" strokeWidth="0.4" opacity="0.35" strokeDasharray="3 3" />

                  {/* Glowing routes connecting key operational hubs */}
                  <path d="M 60,65 L 110,65 L 140,95 L 125,130 L 95,152" fill="none" stroke="#22d3ee" strokeWidth="2" filter="url(#hologramGlow2)" />
                  <path d="M 110,65 L 125,130 M 140,95 L 165,85" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                  <path d="M 60,65 L 85,110 L 125,130" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />

                  {/* Glowing Nodes */}
                  <circle cx="60" cy="65" r="4" fill="#38bdf8" className="animate-pulse" filter="url(#hologramGlow2)" />
                  <circle cx="110" cy="65" r="3.5" fill="#f59e0b" />
                  <circle cx="140" cy="95" r="3.5" fill="#22d3ee" />
                  <circle cx="165" cy="85" r="3" fill="#10b981" />
                  <circle cx="125" cy="130" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" filter="url(#hologramGlow2)" />
                  <circle cx="95" cy="152" r="3.5" fill="#22d3ee" />

                  {/* Watermark BRASIL */}
                  <text 
                    x="102" 
                    y="95" 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    opacity="0.9" 
                    fontSize="13" 
                    fontWeight="900" 
                    letterSpacing="4"
                    className="font-mono drop-shadow-[0_2px_8px_rgba(34,211,238,0.9)]"
                  >
                    BRASIL
                  </text>
                </svg>
              </div>

              {/* 3 Vertical Stat Badges with 3D Metallic Golden Coin Badges */}
              <div className="flex-1 flex flex-col justify-between h-[170px] py-1">
                
                {/* Badge 1: EFICIÊNCIA */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                    <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                      <Target size={13} className="stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="leading-tight text-left">
                    <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                      EFICIÊNCIA
                    </span>
                    <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                      NAS ROTAS
                    </span>
                  </div>
                </div>

                {/* Badge 2: + SEGURANÇA */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                    <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                      <ShieldCheck size={13} className="stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="leading-tight text-left">
                    <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                      + SEGURANÇA
                    </span>
                    <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                      NAS OPERAÇÕES
                    </span>
                  </div>
                </div>

                {/* Badge 3: - RESULTADOS */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                    <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                      <BarChart2 size={13} className="stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="leading-tight text-left">
                    <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                      - RESULTADOS
                    </span>
                    <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                      EM TODAS AS REGIÕES
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: 3 STACKED METRIC CARDS                                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex flex-col gap-2 h-full justify-between">
          
          {/* Card 1: OPERAÇÃO GLOBAL (Height: 96px) */}
          <article className="h-[96px] bg-[#fffdfa] rounded-[18px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                <div className="w-4.5 h-4.5 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18]">
                  <MapPin size={10} />
                </div>
                <span>OPERAÇÃO GLOBAL</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[7.5px] font-black uppercase tracking-wider border border-emerald-300">
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 mt-0.5">
              <div className="leading-tight text-left">
                <span className="text-[26px] font-black text-stone-900 font-mono tracking-tight block">100%</span>
                <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
                  COBERTURA ATIVA DE PÁTIO E FROTA
                </span>
              </div>
              <div className="w-18 h-11 rounded-lg overflow-hidden shadow-xs border border-stone-200 shrink-0">
                <img 
                  src={truckThumb} 
                  alt="Frota Ativa"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </article>

          {/* Card 2: PROCESSAMENTO DA OPERAÇÃO (Height: 104px) */}
          <article className="h-[104px] bg-[#fffdfa] rounded-[18px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                <Settings size={12} className="text-[#8e0b18]" /> 
                <span>PROCESSAMENTO DA OPERAÇÃO</span>
              </div>
              <span 
                onClick={() => onNavigate?.('rotas')} 
                className="px-2 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[7.5px] font-black uppercase tracking-wider border border-emerald-300 transition-colors cursor-pointer"
              >
                EFICIÊNCIA
              </span>
            </div>
            <div className="flex items-end justify-between gap-3 mt-0.5">
              <div className="leading-tight text-left">
                <span className="text-[26px] font-black text-stone-900 font-mono tracking-tight block">98%</span>
                <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
                  PROCESSAMENTO DA OPERAÇÃO
                </span>
              </div>
              {/* 3D Ascending Bars with glossy cylindrical gradient, volume and highlights */}
              <div className="flex items-end gap-1.5 h-10 w-22 shrink-0 pr-1">
                <div className="w-2.5 h-[35%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.15)] border-t border-white/60" />
                <div className="w-2.5 h-[50%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.15)] border-t border-white/60" />
                <div className="w-2.5 h-[65%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.15)] border-t border-white/60" />
                <div className="w-2.5 h-[80%] rounded-t-sm bg-gradient-to-t from-[#d97706] via-[#f59e0b] to-[#fef3c7] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.15)] border-t border-white/60" />
                <div className="w-2.5 h-[100%] rounded-t-sm bg-gradient-to-t from-[#8e0b18] via-[#b51e2c] to-[#ff808d] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_2px_4px_rgba(142,11,24,0.3)] border-t border-white/60" />
              </div>
            </div>
          </article>

          {/* Card 3: ALOCAÇÃO DE ATIVOS (Height: 88px) */}
          <article 
            onClick={() => onNavigate?.('escala')}
            className="h-[88px] bg-[#fffdfa] rounded-[18px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0 cursor-pointer hover:border-stone-400 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                <Settings size={12} className="text-[#8e0b18]" /> 
                <span>ALOCAÇÃO DE ATIVOS</span>
              </div>
              <ChevronRight size={13} className="text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
            </div>
            
            <div className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider text-left">
              DISTRIBUIÇÃO DA FROTA POR REGIÃO
            </div>

            <div className="flex items-center justify-between pt-0.5">
              {/* Subtle 3D Truck Trailer graphic */}
              <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 120 28" className="w-22 h-5 text-stone-400">
                  <path d="M 5,20 L 5,6 Q 5,4 8,4 L 85,4 L 100,10 L 115,10 Q 118,10 118,14 L 118,20 Z" fill="#e8dfd2" stroke="#baa895" strokeWidth="1" />
                  <circle cx="20" cy="22" r="4.5" fill="#444" stroke="#888" strokeWidth="1" />
                  <circle cx="34" cy="22" r="4.5" fill="#444" stroke="#888" strokeWidth="1" />
                  <circle cx="95" cy="22" r="4.5" fill="#444" stroke="#888" strokeWidth="1" />
                  <circle cx="107" cy="22" r="4.5" fill="#444" stroke="#888" strokeWidth="1" />
                  <text x="45" y="14" fontSize="6" fontWeight="bold" fill="#8e0b18" fontFamily="sans-serif">3corações</text>
                </svg>
              </div>
              <span className="text-[9px] font-black text-[#8e0b18] group-hover:underline">
                Ver escala ›
              </span>
            </div>
          </article>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ROW 2: THREE-CARD BOTTOM DASHBOARD GRID (FULL WIDTH IN 1 ROW, ~370px)      */}
      {/* ZERO OVERLAP, DISTINCT MARGIN                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-[1.42fr_1.02fr_1.02fr] gap-3.5 w-full h-[365px] max-h-[365px] items-stretch shrink-0 mt-3.5">

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 1: ROTAS EM TEMPO REAL                                             */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-[22px] border border-[#ded5c9] p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 shrink-0">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18] shrink-0">
              <MapPin size={12} />
            </div>
            <div className="text-left">
              <h3 className="text-[12px] font-black text-stone-900 tracking-wide uppercase font-sans">
                Rotas em Tempo Real
              </h3>
              <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
                Acompanhamento de toda a operação
              </p>
            </div>
          </div>

          {/* Map + Side Info Container */}
          <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0 items-stretch">
            
            {/* Left 3D Relief Map Container */}
            <div className="col-span-8 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#f5ede1] via-[#efe5d5] to-[#e8dcc9] border border-[#ded5c6] flex items-center justify-center shadow-inner h-full">
              
              {/* 3D Isometric Satellite Relief Background */}
              <img
                src={brazilRelief3D}
                alt="Relevo 3D Brasil"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
              />

              {/* Glowing Route Network SVG Overlay with key hub city nodes */}
              <svg viewBox="0 0 340 260" className="absolute inset-0 w-full h-full select-none z-10">
                <defs>
                  <filter id="neonGlowRoute2" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connecting glowing arcs between operational hubs */}
                {/* Manaus -> Brasília */}
                <path d="M 85,65 Q 130,105 168,145" fill="none" stroke="#10b981" strokeWidth="2.8" filter="url(#neonGlowRoute2)" />
                {/* Belém -> Brasília */}
                <path d="M 172,62 Q 172,105 168,145" fill="none" stroke="#ef4444" strokeWidth="2.4" />
                {/* Fortaleza -> Salvador */}
                <path d="M 242,70 Q 252,115 220,148" fill="none" stroke="#10b981" strokeWidth="2.2" strokeDasharray="3 2" />
                {/* Salvador -> Recife */}
                <path d="M 220,148 Q 252,120 265,92" fill="none" stroke="#10b981" strokeWidth="2.2" />
                {/* Brasília -> Salvador */}
                <path d="M 168,145 Q 194,145 220,148" fill="none" stroke="#ef4444" strokeWidth="2.4" />
                {/* Brasília -> S. Paulo/Rio */}
                <path d="M 168,145 Q 185,180 200,202" fill="none" stroke="#ef4444" strokeWidth="2.8" filter="url(#neonGlowRoute2)" />
                {/* S. Paulo/Rio -> Porto Alegre */}
                <path d="M 200,202 Q 172,230 150,245" fill="none" stroke="#10b981" strokeWidth="2.4" />

                {/* Node Markers with Labels matching reference */}
                {[
                  { n: 'Manaus', x: 85, y: 65, col: '#10b981' },
                  { n: 'Belém', x: 172, y: 62, col: '#ef4444' },
                  { n: 'Fortaleza', x: 242, y: 70, col: '#10b981' },
                  { n: 'Recife', x: 265, y: 92, col: '#10b981' },
                  { n: 'Salvador', x: 220, y: 148, col: '#ef4444' },
                  { n: 'Brasília', x: 168, y: 145, col: '#ef4444' },
                  { n: 'S. Paulo/Rio', x: 200, y: 202, col: '#ef4444' },
                  { n: 'Porto Alegre', x: 150, y: 245, col: '#10b981' },
                ].map(city => (
                  <g key={city.n} transform={`translate(${city.x}, ${city.y})`}>
                    <circle r="4.5" fill={city.col} stroke="#ffffff" strokeWidth="1.8" className="shadow-sm" />
                    <text 
                      y="-7" 
                      textAnchor="middle" 
                      fontSize="7" 
                      fontWeight="900" 
                      fill="#111" 
                      className="font-sans filter drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]"
                    >
                      {city.n}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Map Floating Control Tools (Left vertical stack of 5 dark circular glass buttons) */}
              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                <button type="button" className="w-5.5 h-5.5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-md hover:bg-black transition-colors cursor-pointer">
                  <Crosshair size={10} className="text-[#f59e0b]" />
                </button>
                <button type="button" className="w-5.5 h-5.5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-md hover:bg-black transition-colors cursor-pointer">
                  <Compass size={10} />
                </button>
                <button type="button" className="w-5.5 h-5.5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-md hover:bg-black transition-colors cursor-pointer">
                  <Plus size={10} />
                </button>
                <button type="button" className="w-5.5 h-5.5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-md hover:bg-black transition-colors cursor-pointer">
                  <Minus size={10} />
                </button>
                <button type="button" className="w-5.5 h-5.5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-md hover:bg-black transition-colors cursor-pointer">
                  <Navigation size={10} />
                </button>
              </div>

              {/* Floating Bottom Status Pill */}
              <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-sm border border-white/25 text-white flex items-center gap-1.5 shadow-md text-[8px] font-bold">
                <div className="w-3.5 h-3.5 rounded-full bg-[#8e0b18] flex items-center justify-center text-white">
                  <MapPin size={8} />
                </div>
                <span className="font-bold text-white tracking-wide">8 ROTAS ATIVAS</span>
                <span className="text-stone-300">• Sistema em operação</span>
              </div>

            </div>

            {/* Right Side Stats in Card 1 */}
            <div className="col-span-4 flex flex-col justify-between py-0.5 pl-2 text-left border-l border-stone-200">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-2">
                <div className="w-7.5 h-7.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
                  <Truck size={14} />
                </div>
                <div className="leading-tight">
                  <span className="text-[7px] font-bold text-stone-400 uppercase tracking-wider block">
                    TOTAL DE ROTAS
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-stone-900 font-mono">42</span>
                    <span className="text-[8px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp size={8} className="mr-0.5" /> 12%
                    </span>
                  </div>
                  <span className="text-[6.5px] text-stone-400">vs. mês anterior</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2">
                <div className="w-7.5 h-7.5 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
                  <Route size={14} />
                </div>
                <div className="leading-tight">
                  <span className="text-[7px] font-bold text-stone-400 uppercase tracking-wider block">
                    DISTÂNCIA PERCORRIDA
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-stone-900 font-mono">12.480 km</span>
                    <span className="text-[8px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp size={8} className="mr-0.5" /> 8%
                    </span>
                  </div>
                  <span className="text-[6.5px] text-stone-400">vs. mês anterior</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2">
                <div className="w-7.5 h-7.5 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
                  <Clock size={14} />
                </div>
                <div className="leading-tight">
                  <span className="text-[7px] font-bold text-stone-400 uppercase tracking-wider block">
                    TEMPO MÉDIO
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-stone-900 font-mono">8h 24min</span>
                    <span className="text-[8px] font-bold text-rose-500 flex items-center">
                      <TrendingDown size={8} className="mr-0.5" /> 6%
                    </span>
                  </div>
                  <span className="text-[6.5px] text-stone-400">vs. mês anterior</span>
                </div>
              </div>

              {/* Legend Dots */}
              <div className="pt-1.5 border-t border-stone-200 grid grid-cols-2 gap-1 text-[7.5px] font-bold text-stone-600">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span>Ativa: 32</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  <span>Carregada: 5</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                  <span>Descarga: 3</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  <span>Parada: 2</span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Button at bottom */}
          <button
            type="button"
            onClick={() => onNavigate?.('rotas')}
            className="w-full mt-2 py-1.5 rounded-xl bg-[#fdfbf7] hover:bg-stone-100 border border-[#ded5c6] text-[9px] font-bold uppercase tracking-widest text-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span>VER TODAS AS ROTAS</span>
            <ChevronRight size={12} className="text-[#8e0b18]" />
          </button>

        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 2: TELEMETRIA TÁTICA                                               */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-[22px] border border-[#ded5c9] p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18] shrink-0">
                <Activity size={12} />
              </div>
              <div className="text-left">
                <h3 className="text-[12px] font-black text-stone-900 tracking-wide uppercase font-sans">
                  Telemetria Tática
                </h3>
                <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
                  Fluxo de movimentação 24h
                </p>
              </div>
            </div>

            {/* Top Right Legend */}
            <div className="flex items-center gap-2.5 text-[7.5px] font-bold text-stone-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span>KM</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                <span>VELOCIDADE</span>
              </div>
            </div>
          </div>

          {/* 24h Movement Area Curve Chart */}
          <div className="relative w-full h-[180px] bg-white rounded-xl border border-stone-200 p-2 flex flex-col justify-between shadow-inner">
            
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-7 top-3 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
              <div className="border-b border-stone-200" />
            </div>

            {/* Y-Axis Labels */}
            <div className="absolute left-2 top-2 bottom-5 flex flex-col justify-between text-[7px] font-mono text-stone-400 font-bold">
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            {/* SVG Wave lines */}
            <div className="w-full h-full relative pl-5 pb-3">
              <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  {/* Red Area Gradient */}
                  <linearGradient id="telemetryRedGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Teal Area Gradient */}
                  <linearGradient id="telemetryTealGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Areas */}
                <path 
                  d="M 10,105 C 40,75 60,88 95,92 C 145,65 175,72 205,78 C 240,85 270,82 290,75 L 290,115 L 10,115 Z" 
                  fill="url(#telemetryTealGrad2)" 
                />
                <path 
                  d="M 10,95 C 40,60 60,70 95,78 C 145,45 175,55 205,48 C 240,58 270,52 290,50 L 290,115 L 10,115 Z" 
                  fill="url(#telemetryRedGrad2)" 
                />

                {/* Glowing Smooth Curves */}
                <path 
                  d="M 10,105 C 40,75 60,88 95,92 C 145,65 175,72 205,78 C 240,85 270,82 290,75" 
                  fill="none" 
                  stroke="#14b8a6" 
                  strokeWidth="2.6" 
                />
                <path 
                  d="M 10,95 C 40,60 60,70 95,78 C 145,45 175,55 205,48 C 240,58 270,52 290,50" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2.6" 
                />

                {/* Peak Nodes */}
                <circle cx="95" cy="78" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.6" />
                <circle cx="205" cy="48" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.6" />
                <circle cx="95" cy="92" r="3.5" fill="#14b8a6" stroke="#fff" strokeWidth="1.6" />
                <circle cx="205" cy="78" r="3.5" fill="#14b8a6" stroke="#fff" strokeWidth="1.6" />
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
          <div className="grid grid-cols-4 gap-1.5 mt-1.5 shrink-0">
            <div className="bg-[#f7f4ee] rounded-lg p-1.5 text-center border border-stone-200 shadow-2xs">
              <span className="text-[11px] block">🚚</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Em rota</span>
              <span className="text-xs font-black text-stone-900 font-mono block">32</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-lg p-1.5 text-center border border-stone-200 shadow-2xs">
              <span className="text-[11px] block">🏢</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Em pátio</span>
              <span className="text-xs font-black text-stone-900 font-mono block">8</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-lg p-1.5 text-center border border-stone-200 shadow-2xs">
              <span className="text-[11px] block">📦</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Carregando</span>
              <span className="text-xs font-black text-stone-900 font-mono block">6</span>
            </div>
            <div className="bg-[#f7f4ee] rounded-lg p-1.5 text-center border border-stone-200 shadow-2xs">
              <span className="text-[11px] block">📥</span>
              <span className="text-[6.5px] font-bold text-stone-500 uppercase tracking-tighter block mt-0.5">Descarga</span>
              <span className="text-xs font-black text-stone-900 font-mono block">4</span>
            </div>
          </div>

        </article>

        {/* ----------------------------------------------------------------------- */}
        {/* CARD 3: ALOCAÇÃO DE ATIVOS (DONUT CHART WITH 3D VOLUMETRIC EFFECT)       */}
        {/* ----------------------------------------------------------------------- */}
        <article className="bg-[#fffdfa] rounded-[22px] border border-[#ded5c9] p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 shrink-0">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18] shrink-0">
              <UserCheck size={12} />
            </div>
            <div className="text-left">
              <h3 className="text-[12px] font-black text-stone-900 tracking-wide uppercase font-sans">
                Alocação de Ativos
              </h3>
              <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
                Distribuição da frota por região
              </p>
            </div>
          </div>

          {/* 3D Glossy Donut Chart Area + Region Breakdown Legend */}
          <div className="flex items-center justify-between gap-3 my-1 flex-1">
            
            {/* 3D Volumetric Visual Donut with Specular Highlights and Radial Shading */}
            <div className="relative w-30 h-30 shrink-0 flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.18)] relative overflow-hidden"
                style={{
                  background: 'conic-gradient(#8e0b18 0% 33%, #0d9488 33% 54%, #eab308 54% 71%, #ea580c 71% 85%, #facc15 85% 100%)'
                }}
              >
                {/* 3D Specular Highlight Ring Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/25 via-transparent to-white/40 pointer-events-none" />
              </div>

              {/* Inner Cutout Cylinder with Depth & 42 TOTAL */}
              <div className="absolute inset-4 rounded-full bg-white shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border border-stone-100">
                <span className="text-xl font-black text-stone-900 leading-none font-mono">42</span>
                <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">TOTAL</span>
              </div>
            </div>

            {/* Region List Legend */}
            <div className="flex-1 flex flex-col gap-1.5 text-[8.5px] text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8e0b18] shadow-2xs" />
                  <span className="font-bold text-stone-800 uppercase">SUDESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">14 <span className="text-[7px] font-normal text-stone-400">(33%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0d9488] shadow-2xs" />
                  <span className="font-bold text-stone-800 uppercase">SUL</span>
                </div>
                <span className="font-mono font-black text-stone-900">9 <span className="text-[7px] font-normal text-stone-400">(21%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#eab308] shadow-2xs" />
                  <span className="font-bold text-stone-800 uppercase">NORDESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">7 <span className="text-[7px] font-normal text-stone-400">(17%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c] shadow-2xs" />
                  <span className="font-bold text-stone-800 uppercase">CENTRO-OESTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">6 <span className="text-[7px] font-normal text-stone-400">(14%)</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#facc15] shadow-2xs" />
                  <span className="font-bold text-stone-800 uppercase">NORTE</span>
                </div>
                <span className="font-mono font-black text-stone-900">6 <span className="text-[7px] font-normal text-stone-400">(14%)</span></span>
              </div>
            </div>

          </div>

          {/* Action Button at bottom */}
          <button
            type="button"
            onClick={() => onNavigate?.('controle')}
            className="w-full mt-2 py-1.5 rounded-xl bg-[#fdfbf7] hover:bg-stone-100 border border-[#ded5c6] text-[9px] font-bold uppercase tracking-widest text-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span>VER DETALHAMENTO</span>
            <ChevronRight size={12} className="text-[#8e0b18]" />
          </button>

        </article>

      </div>

    </div>
  );
}
