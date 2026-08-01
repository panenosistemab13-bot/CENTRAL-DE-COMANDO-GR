import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Radio,
  Zap,
  X,
  Crosshair,
  MapPin,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BrazilMapHUDProps {
  selectedMapNode: string | null;
  setSelectedMapNode: (node: string | null) => void;
  hoveredCity: string | null;
  setHoveredCity: (city: string | null) => void;
  count: number;
  data?: any[];
}

export const BrazilMapHUD: React.FC<BrazilMapHUDProps> = ({
  selectedMapNode,
  setSelectedMapNode,
  hoveredCity,
  setHoveredCity,
  count,
  data = [],
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
        "bg-gradient-to-b from-[#020617] via-[#070e24] to-[#020617] backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_80px_rgba(0,240,255,0.18)] relative overflow-hidden group transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 flex flex-col justify-between w-screen h-screen overflow-auto"
      )}
    >
      
      {/* Corner Decorative Tech Brackets */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff] pointer-events-none z-10" />

      {/* Top HUD Status Header of Map */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-cyan-500/30 font-mono">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-300 shadow-[0_0_12px_#00f0ff]"></span>
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-300 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              <Globe className="w-4.5 h-4.5 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
              CENTRO DE COMANDO BRASIL
            </h2>
            <span className="text-[10px] text-cyan-400/70 font-mono flex items-center gap-2 mt-0.5">
              <span>MONITORAMENTO EM TEMPO REAL</span>
              <span className="text-cyan-500">•</span>
              <span className="text-cyan-200 font-bold">BASE OPERACIONAL: SANTA LUZIA / MG</span>
            </span>
          </div>
        </div>
        
        {/* Operational Base Category Filters & Interactive Toggles & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-slate-400 uppercase font-bold mr-1 hidden sm:inline">CATEGORIAS DE BASE:</span>
          
          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'SMART TOTAL SERVICE' ? null : 'SMART TOTAL SERVICE')}
            className={cn(
              "px-2.5 py-1 rounded-lg border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer",
              selectedMapNode === 'SMART TOTAL SERVICE'
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#00f0ff]"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            Smart Total Service
          </button>

          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'CLIENTE' ? null : 'CLIENTE')}
            className={cn(
              "px-2.5 py-1 rounded-lg border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer",
              selectedMapNode === 'CLIENTE'
                ? "bg-blue-500 text-white border-blue-300 shadow-[0_0_15px_#3b82f6]"
                : "bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#3b82f6]" />
            Cliente
          </button>

          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'DESCARTAVEL' ? null : 'DESCARTAVEL')}
            className={cn(
              "px-2.5 py-1 rounded-lg border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer",
              selectedMapNode === 'DESCARTAVEL'
                ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_#10b981]"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            Descartável
          </button>

          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'EXPORTACAO' ? null : 'EXPORTACAO')}
            className={cn(
              "px-2.5 py-1 rounded-lg border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer",
              selectedMapNode === 'EXPORTACAO'
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_#f59e0b]"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            Exportação
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair da Tela Cheia" : "Expandir em Tela Cheia"}
            className={cn(
              "ml-auto sm:ml-2 px-3 py-1 rounded-lg border font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer text-[10px]",
              isFullscreen
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_#00f0ff]"
                : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400"
            )}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-950" />
                <span>SAIR DA TELA CHEIA (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>TELA CHEIA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Futuristic Brazil Map Canvas Container (Aspect Ratio 16:9 or Flexible in Fullscreen) */}
      <div className={cn(
        "relative w-full bg-[#02081c] rounded-2xl border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-[inset_0_0_70px_rgba(0,240,255,0.15)] transition-all",
        isFullscreen ? "flex-1 min-h-0 h-full aspect-auto" : "aspect-[16/9] min-h-[480px] sm:min-h-[560px]"
      )}>
        
        {/* Dark Mode Cyber-Tech Navy Grid Data Matrix Background */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <defs>
            <pattern id="navyGrid4k" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#004488" strokeWidth="0.6" strokeDasharray="2,2" />
            </pattern>
            <radialGradient id="hubRadialGlow" cx="62%" cy="60%" r="45%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#0044aa" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#02081c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="neonCyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0066ff" stopOpacity="0.25" />
            </linearGradient>
            <filter id="hudNeonFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#navyGrid4k)" />
          <rect width="100%" height="100%" fill="url(#hubRadialGlow)" />
        </svg>

        {/* LAT / LONG HUD Coordinates Markings */}
        <div className="absolute top-3 right-4 font-mono text-[9px] text-cyan-400/60 space-y-0.5 text-right pointer-events-none bg-slate-950/60 p-2 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
          <div className="text-cyan-300 font-bold">BRAZIL CARTOGRAPHIC HUD [4K]</div>
          <div>LATITUDE: 05°N A 33°S</div>
          <div>LONGITUDE: 34°W A 74°W</div>
          <div>ESTADOS: 26 ESTADOS + DF</div>
          <div>STATUS CONEXÃO: 100% ONLINE</div>
        </div>

        {/* REALISTIC HIGH-TECH CARTOGRAPHIC VECTORIAL MAP OF BRAZIL (1000 x 562.5 - 16:9 Canvas) */}
        <svg 
          viewBox="0 0 1000 562.5" 
          className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(0,240,255,0.4)] select-none"
        >
          {/* === 1. REALISTIC CARTOGRAPHIC SHAPE OF BRAZILIAN TERRITORY & STATE DIVISIONS === */}
          <g stroke="#00f0ff" strokeWidth="1.2" strokeOpacity="0.75" fill="url(#neonCyanGlowGrad)" fillOpacity="0.09">
            
            {/* AMAZONAS (AM) */}
            <path d="M 170,110 L 240,80 L 330,65 L 370,105 L 350,180 L 290,210 L 200,190 L 170,150 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* RORAIMA (RR) */}
            <path d="M 270,30 L 320,20 L 340,55 L 310,75 L 260,55 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* PARÁ (PA) */}
            <path d="M 330,65 L 430,45 L 490,60 L 520,110 L 460,195 L 370,185 L 370,105 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* AMAPÁ (AP) */}
            <path d="M 430,45 L 480,25 L 490,60 L 450,65 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* ACRE (AC) */}
            <path d="M 120,165 L 170,150 L 200,190 L 160,205 L 110,185 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* RONDÔNIA (RO) */}
            <path d="M 200,190 L 290,210 L 280,260 L 230,245 L 200,210 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* TOCANTINS (TO) */}
            <path d="M 460,195 L 500,150 L 530,200 L 490,270 L 460,240 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* MARANHÃO (MA) */}
            <path d="M 490,60 L 570,80 L 590,140 L 530,165 L 520,110 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* PIAUÍ (PI) */}
            <path d="M 570,80 L 620,95 L 635,165 L 590,170 L 590,140 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* CEARÁ (CE) */}
            <path d="M 620,95 L 685,90 L 705,135 L 655,145 L 635,120 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* RIO GRANDE DO NORTE (RN) */}
            <path d="M 685,90 L 755,95 L 750,125 L 705,120 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* PARAÍBA (PB) */}
            <path d="M 705,120 L 760,125 L 755,150 L 705,140 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* PERNAMBUCO (PE) */}
            <path d="M 635,165 L 755,150 L 750,175 L 660,185 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* ALAGOAS (AL) */}
            <path d="M 715,175 L 750,175 L 740,195 L 710,190 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* SERGIPE (SE) */}
            <path d="M 710,190 L 740,195 L 730,215 L 705,205 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* BAHIA (BA) */}
            <path d="M 530,200 L 660,185 L 730,215 L 695,305 L 600,290 L 560,250 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* MATO GROSSO (MT) */}
            <path d="M 290,210 L 460,195 L 460,240 L 450,320 L 360,310 L 340,265 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* GOIÁS (GO) & DF */}
            <path d="M 460,240 L 560,250 L 575,320 L 490,325 L 460,290 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* MATO GROSSO DO SUL (MS) */}
            <path d="M 360,310 L 450,320 L 485,390 L 415,405 L 390,360 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* MINAS GERAIS (MG) - HUB SANTA LUZIA LOCATION */}
            <path d="M 560,250 L 695,305 L 665,375 L 575,370 L 555,320 Z" className="hover:fill-cyan-500/40 transition-all cursor-pointer stroke-cyan-200 stroke-[2] shadow-[0_0_15px_#00f0ff]" />
            
            {/* ESPÍRITO SANTO (ES) */}
            <path d="M 665,320 L 705,325 L 690,365 L 665,360 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* RIO DE JANEIRO (RJ) */}
            <path d="M 630,370 L 690,365 L 665,395 L 620,385 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* SÃO PAULO (SP) */}
            <path d="M 485,390 L 575,370 L 620,385 L 560,430 L 480,415 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* PARANÁ (PR) */}
            <path d="M 480,415 L 560,430 L 540,465 L 465,445 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* SANTA CATARINA (SC) */}
            <path d="M 465,445 L 540,465 L 530,490 L 460,475 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
            
            {/* RIO GRANDE DO SUL (RS) */}
            <path d="M 460,475 L 530,490 L 515,545 L 440,515 Z" className="hover:fill-cyan-500/25 transition-all cursor-pointer" />
          </g>

          {/* Precise State Border Dotted Overlays */}
          <g stroke="#00f0ff" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.45" fill="none">
            <line x1="370" y1="105" x2="370" y2="185" />
            <line x1="460" y1="195" x2="560" y2="250" />
            <line x1="560" y1="250" x2="575" y2="370" />
            <line x1="575" y1="370" x2="480" y2="415" />
            <line x1="480" y1="415" x2="560" y2="430" />
          </g>

          {/* === 2. GLOWING NEON ROUTE LINES EXPANDING FROM HUB SANTA LUZIA / MG (cx: 620, cy: 335) === */}
          <g>
            {/* Main Central Hub Radial Pulse Rings */}
            <circle cx="620" cy="335" r="18" fill="none" stroke="#00f0ff" strokeWidth="1.8" filter="url(#hudNeonFilter)">
              <animate attributeName="r" values="6;28;6" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="620" cy="335" r="30" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,2">
              <animate attributeName="r" values="10;45;10" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.8s" repeatCount="indefinite" />
            </circle>

            {/* Smooth Curved Neon Ray Lines connecting Santa Luzia (620, 335) to all 26 secondary locations */}
            {[
              { cx: 550, cy: 285, name: 'BRASILIA' },
              { cx: 635, cy: 385, name: 'RIO DE JANEIRO' },
              { cx: 565, cy: 380, name: 'GUARULHOS' },
              { cx: 730, cy: 245, name: 'SALVADOR' },
              { cx: 810, cy: 180, name: 'RECIFE' },
              { cx: 320, cy: 140, name: 'MANAUS' },
              { cx: 525, cy: 420, name: 'CURITIBA' },
              { cx: 410, cy: 280, name: 'CUIABA' },
              { cx: 435, cy: 345, name: 'CAMPO GRANDE' },
              { cx: 815, cy: 150, name: 'NATAL' },
              { cx: 650, cy: 145, name: 'TERESINA' },
              { cx: 795, cy: 205, name: 'MACEIO' },
              { cx: 820, cy: 165, name: 'JOAO PESSOA' },
              { cx: 610, cy: 330, name: 'VESPASIANO' },
              { cx: 625, cy: 295, name: 'MONTES CLAROS' },
              { cx: 630, cy: 365, name: 'JUIZ DE FORA' },
              { cx: 660, cy: 320, name: 'GOVERNADOR VALADARES' },
              { cx: 550, cy: 368, name: 'SUMARE' },
              { cx: 495, cy: 385, name: 'LONDRINA' },
              { cx: 735, cy: 130, name: 'EUSEBIO' },
              { cx: 500, cy: 485, name: 'GRAVATAI' },
              { cx: 685, cy: 345, name: 'VIANA' },
              { cx: 775, cy: 140, name: 'MOSSORO' },
              { cx: 725, cy: 170, name: 'BARBALHA' },
              { cx: 555, cy: 395, name: 'ARACARIGUAMA' },
              { cx: 260, cy: 220, name: 'ARIQUEMES-RO' }
            ].map((target) => {
              const isMatch = selectedMapNode === null || selectedMapNode === target.name;
              const midX = (620 + target.cx) / 2 - (target.cy > 335 ? 15 : -15);
              const midY = (335 + target.cy) / 2 - (target.cx > 620 ? 15 : -15);

              return (
                <g key={target.name}>
                  <path
                    d={`M 620,335 Q ${midX},${midY} ${target.cx},${target.cy}`}
                    fill="none"
                    stroke={isMatch ? "#00f0ff" : "#0055aa"}
                    strokeWidth={isMatch ? 1.4 : 0.5}
                    strokeDasharray={isMatch ? "4,3" : "2,4"}
                    opacity={isMatch ? 0.85 : 0.2}
                    filter={isMatch ? "url(#hudNeonFilter)" : undefined}
                  />
                </g>
              );
            })}
          </g>

          {/* === 3. ORGANIZED NEON PINS & NON-OVERLAPPING TEXT LABELS FOR ALL CITIES === */}
          
          {/* === CENTRAL HUB BASE: SANTA LUZIA / MG (cx: 620, cy: 335) === */}
          <g 
            className="cursor-pointer group/node"
            onClick={() => setSelectedMapNode('SANTA LUZIA')}
            onMouseEnter={() => setHoveredCity('Santa Luzia / MG (HUB BASE)')}
            onMouseLeave={() => setHoveredCity(null)}
          >
            {/* Glowing Core Dot */}
            <circle cx="620" cy="335" r="8" fill="#00f0ff" filter="url(#hudNeonFilter)" />
            <circle cx="620" cy="335" r="3" fill="#ffffff" />
            
            {/* Leader Line to Hub Badge */}
            <line x1="620" y1="335" x2="620" y2="355" stroke="#00f0ff" strokeWidth="1.5" />
            
            {/* Callout Box Badge */}
            <rect x="535" y="355" width="170" height="22" rx="6" fill="#030712" stroke="#00f0ff" strokeWidth="1.5" className="shadow-[0_0_15px_#00f0ff]" />
            <text x="620" y="370" fill="#00f0ff" fontSize="9.5" fontFamily="monospace" textAnchor="middle" fontWeight="black">
              ★ SANTA LUZIA / MG (HUB BASE)
            </text>
          </g>

          {/* === 26 SECONDARY CITIES & POLOS WITH ZERO TEXT OVERLAP === */}
          {[
            // CAPITAIS E POLOS (13)
            { id: 'MANAUS', name: 'Manaus', state: 'AM', cx: 320, cy: 140, lx: 260, ly: 120, anchor: 'end' },
            { id: 'ARIQUEMES-RO', name: 'Ariquemes', state: 'RO', cx: 260, cy: 220, lx: 195, ly: 220, anchor: 'end' },
            { id: 'CUIABA', name: 'Cuiabá', state: 'MT', cx: 410, cy: 280, lx: 345, ly: 275, anchor: 'end' },
            { id: 'CAMPO GRANDE', name: 'Campo Grande', state: 'MS', cx: 435, cy: 345, lx: 370, ly: 365, anchor: 'end' },
            { id: 'BRASILIA', name: 'Brasília', state: 'DF', cx: 550, cy: 285, lx: 550, ly: 255, anchor: 'middle' },
            { id: 'TERESINA', name: 'Teresina', state: 'PI', cx: 650, cy: 145, lx: 595, ly: 125, anchor: 'end' },
            { id: 'EUSEBIO', name: 'Eusébio', state: 'CE', cx: 735, cy: 130, lx: 735, ly: 105, anchor: 'middle' },
            { id: 'BARBALHA', name: 'Barbalha', state: 'CE', cx: 725, cy: 170, lx: 665, ly: 170, anchor: 'end' },
            { id: 'MOSSORO', name: 'Mossoró', state: 'RN', cx: 775, cy: 140, lx: 825, ly: 125, anchor: 'start' },
            { id: 'NATAL', name: 'Natal', state: 'RN', cx: 815, cy: 150, lx: 870, ly: 145, anchor: 'start' },
            { id: 'JOAO PESSOA', name: 'João Pessoa', state: 'PB', cx: 820, cy: 165, lx: 875, ly: 165, anchor: 'start' },
            { id: 'RECIFE', name: 'Recife', state: 'PE', cx: 810, cy: 180, lx: 865, ly: 185, anchor: 'start' },
            { id: 'MACEIO', name: 'Maceió', state: 'AL', cx: 795, cy: 205, lx: 855, ly: 210, anchor: 'start' },
            { id: 'SALVADOR', name: 'Salvador', state: 'BA', cx: 730, cy: 245, lx: 785, ly: 245, anchor: 'start' },
            { id: 'MONTES CLAROS', name: 'Montes Claros', state: 'MG', cx: 625, cy: 295, lx: 685, ly: 285, anchor: 'start' },
            { id: 'VESPASIANO', name: 'Vespasiano', state: 'MG', cx: 610, cy: 330, lx: 540, ly: 315, anchor: 'end' },
            { id: 'GOVERNADOR VALADARES', name: 'Gov. Valadares', state: 'MG', cx: 660, cy: 320, lx: 725, ly: 315, anchor: 'start' },
            { id: 'VIANA', name: 'Viana', state: 'ES', cx: 685, cy: 345, lx: 745, ly: 345, anchor: 'start' },
            { id: 'JUIZ DE FORA', name: 'Juiz de Fora', state: 'MG', cx: 630, cy: 365, lx: 695, ly: 365, anchor: 'start' },
            { id: 'RIO DE JANEIRO', name: 'Rio de Janeiro', state: 'RJ', cx: 635, cy: 385, lx: 700, ly: 405, anchor: 'start' },
            { id: 'SUMARE', name: 'Sumaré', state: 'SP', cx: 550, cy: 368, lx: 485, ly: 368, anchor: 'end' },
            { id: 'ARACARIGUAMA', name: 'Araçariguama', state: 'SP', cx: 555, cy: 395, lx: 485, ly: 410, anchor: 'end' },
            { id: 'GUARULHOS', name: 'Guarulhos', state: 'SP', cx: 565, cy: 380, lx: 510, ly: 435, anchor: 'end' },
            { id: 'LONDRINA', name: 'Londrina', state: 'PR', cx: 495, cy: 385, lx: 430, ly: 385, anchor: 'end' },
            { id: 'CURITIBA', name: 'Curitiba', state: 'PR', cx: 525, cy: 420, lx: 460, ly: 460, anchor: 'end' },
            { id: 'GRAVATAI', name: 'Gravataí', state: 'RS', cx: 500, cy: 485, lx: 550, ly: 510, anchor: 'start' }
          ].map((city) => {
            const isSelected = selectedMapNode === city.id;
            return (
              <g 
                key={city.id} 
                className="cursor-pointer group/pin"
                onClick={() => setSelectedMapNode(selectedMapNode === city.id ? null : city.id)}
                onMouseEnter={() => setHoveredCity(`${city.name} - ${city.state}`)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Micro Connector Leader Line */}
                <line 
                  x1={city.cx} 
                  y1={city.cy} 
                  x2={city.lx} 
                  y2={city.ly} 
                  stroke={isSelected ? "#00f0ff" : "#0077cc"} 
                  strokeWidth={isSelected ? 1.2 : 0.8} 
                  strokeDasharray="2,2" 
                  opacity={isSelected ? 1 : 0.6} 
                />

                {/* Microchip / Bait Symbol for State */}
                <g transform={`translate(${city.cx}, ${city.cy})`}>
                  <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill={isSelected ? "#00f0ff" : "#1e293b"} stroke={isSelected ? "#ffffff" : "#00f0ff"} strokeWidth="1" filter={isSelected ? "url(#hudNeonFilter)" : undefined} />
                  <line x1="-7" y1="-2" x2="-4.5" y2="-2" stroke="#00f0ff" strokeWidth="1" />
                  <line x1="-7" y1="2" x2="-4.5" y2="2" stroke="#00f0ff" strokeWidth="1" />
                  <line x1="4.5" y1="-2" x2="7" y2="-2" stroke="#00f0ff" strokeWidth="1" />
                  <line x1="4.5" y1="2" x2="7" y2="2" stroke="#00f0ff" strokeWidth="1" />
                  <circle cx="0" cy="0" r="2" fill={isSelected ? "#ffffff" : "#00f0ff"} />
                </g>

                {/* Tiny Red Bait Symbols (Iscas) representing each bait in this city */}
                {(() => {
                  const cityBaitsCount = data ? data.filter(row => {
                    const dest = (row.destino || '').trim().toUpperCase();
                    const unit = (row.unidade || '').trim().toUpperCase();
                    const cityName = city.id.toUpperCase();
                    if (cityName === 'GUARULHOS' && (dest === 'GUARULHOS' || unit === 'GUARULHOS')) return true;
                    return dest === cityName || unit === cityName;
                  }).length : 0;

                  if (cityBaitsCount <= 0) return null;

                  return (
                    <g transform={`translate(${city.cx}, ${city.cy})`}>
                      {Array.from({ length: Math.min(cityBaitsCount, 25) }).map((_, idx) => {
                        const col = idx % 5;
                        const row = Math.floor(idx / 5);
                        const offsetX = (col - 2) * 5.5;
                        const offsetY = 10 + row * 5.5;
                        return (
                          <g key={idx} transform={`translate(${offsetX}, ${offsetY})`} className="transition-all hover:scale-125">
                            <rect x="-2" y="-2" width="4" height="4" rx="0.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="0.75" fill="#ffffff" />
                          </g>
                        );
                      })}
                      {cityBaitsCount > 25 && (
                        <text x="0" y="32" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          +{cityBaitsCount - 25}
                        </text>
                      )}
                    </g>
                  );
                })()}

                {/* HUD Label Text Pill */}
                <text 
                  x={city.lx} 
                  y={city.ly} 
                  fill={isSelected ? "#00f0ff" : "#94a3b8"} 
                  fontSize="8" 
                  fontFamily="monospace" 
                  textAnchor={city.anchor} 
                  fontWeight={isSelected ? "bold" : "medium"}
                  className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] transition-colors hover:fill-cyan-300"
                >
                  {city.name.toUpperCase()} ({city.state})
                </text>
              </g>
            );
          })}

        </svg>

        {/* Floating Top Left HUD Status Card requested by user */}
        <div className="absolute top-4 left-4 bg-slate-950/95 border border-cyan-500/50 rounded-2xl p-3.5 font-mono text-[10px] space-y-2 shadow-[0_0_30px_rgba(0,240,255,0.25)] backdrop-blur-md max-w-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-black border-b border-cyan-500/30 pb-1.5">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>CENTRO DE COMANDO BRASIL - HUB BASE</span>
          </div>
          <div className="space-y-1 text-cyan-200/90">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">UNIDADE BASE:</span>
              <strong className="text-white bg-cyan-950 px-2 py-0.5 rounded border border-cyan-400/40">SANTA LUZIA / MG</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">ISCAS REGISTRADAS:</span>
              <strong className="text-cyan-300 font-bold">{count} ISCAS</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">CAPITAIS / POLOS:</span>
              <strong className="text-cyan-400">13 NODES</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">UNIDADES ESTRATÉGICAS:</span>
              <strong className="text-emerald-400">14 CIDADES</strong>
            </div>
          </div>

          {hoveredCity && (
            <div className="pt-1 border-t border-cyan-500/30 text-[9.5px] text-cyan-300 flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3 text-cyan-400 animate-bounce" />
              <span>NODE SELECIONADO: {hoveredCity}</span>
            </div>
          )}
        </div>

        {/* Bottom Left Legend for Node Types */}
        <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-2.5 font-mono text-[9px] flex flex-wrap items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="text-cyan-200 font-bold">HUB SANTA LUZIA / MG</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
            <span className="text-cyan-200">CAPITAIS E POLOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-cyan-200">UNIDADES ESTRATÉGICAS</span>
          </div>
        </div>

        {/* Bottom Right Map Status HUD indicator */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-2.5 font-mono text-[9px] flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
            <span className="text-cyan-300 font-bold">CARTOGRAPHIC BRAZIL HUD 4K // 16:9 RENDER</span>
          </div>
        </div>

      </div>
    </section>
  );
};
