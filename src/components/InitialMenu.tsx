import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users2, 
  FileCheck2, 
  CalendarDays, 
  Route, 
  Container, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardCheck, 
  Sliders, 
  Lock, 
  Unlock, 
  Globe, 
  Database, 
  LogOut,
  Package,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
  Activity,
  Terminal,
  Compass,
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageDefinition, ICON_MAP, getAllAvailablePages } from '../data/pagesConfig';
import { GlassPanel3D } from './3d/GlassPanel3D';

interface MenuItem {
  id: string;
  label: string;
  buttonLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const baseMenuItems: MenuItem[] = [
  { id: 'patio', label: 'Pátio', buttonLabel: 'Logística', icon: Container, color: 'text-sky-400', description: 'Gestão inteligente de pátio, entrada e saída de frota.' },
  { id: 'checklist', label: 'Checklist', buttonLabel: 'Vistorias', icon: ClipboardCheck, color: 'text-emerald-400', description: 'Controle de conformidade e vistorias técnicas operacionais.' },
  { id: 'averbacao', label: 'Averbação', buttonLabel: 'Seguros', icon: FileCheck2, color: 'text-amber-400', description: 'Gestão de apólices, documentos e seguros integrados.' },
  { id: 'sm_creator', label: 'SM', buttonLabel: 'Eventos', icon: CalendarDays, color: 'text-blue-400', description: 'Criação e agendamento de solicitações de monitoramento.' },
  { id: 'controle', label: 'Controle', buttonLabel: 'Gerais', icon: Sliders, color: 'text-[#38bdf8]', description: 'Central de controle, pré-alertas, iscas e parâmetros de risco.' },
  { id: 'escala', label: 'Escala', buttonLabel: 'Disponibilidade', icon: FileSpreadsheet, color: 'text-indigo-400', description: 'Painel de escala e planilha de disponibilidade operacionais.' },
  { id: 'presence', label: 'Lista de Presença', buttonLabel: 'Efetivo', icon: Users2, color: 'text-purple-400', description: 'Controle de escala de equipes e efetivo no pátio.' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'Logística', icon: Route, color: 'text-teal-400', description: 'Otimização, telemetria e código de rotas operacionais.' },
  { id: 'slides', label: 'Slides HUD', buttonLabel: 'Command Center 4K', icon: Globe, color: 'text-cyan-400', description: 'Dashboard executivo 4K com mapa-múndi holográfico 3D e métricas.' },
];

interface InitialMenuProps {
  onSelect: (id: string) => void;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  showSlides?: boolean;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  onUnlockPresenceList: () => void;
  onLogout?: () => void;
}

// Interactive 3D Hologram Vector Graphic per Module
function ModuleGraphic3D({ id }: { id: string }) {
  switch (id) {
    case 'slides':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="40,120 100,145 160,120 100,95" fill="#030712" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="40,120 100,145 100,149 40,124" fill="#38bdf8" />
          <polygon points="100,145 160,120 160,124 100,149" fill="#0284c7" />
          <circle cx="100" cy="85" r="34" fill="#070d1e" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="100" cy="85" r="40" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
          <line x1="66" y1="85" x2="134" y2="85" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="51" x2="100" y2="119" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          <circle cx="100" cy="85" r="5" fill="#38bdf8" />
          <circle cx="116" cy="74" r="3.5" fill="#0284c7" />
          <circle cx="84" cy="96" r="3.5" fill="#10b981" />
        </svg>
      );
    case 'patio':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(2,132,199,0.5)]">
          <ellipse cx="100" cy="160" rx="60" ry="14" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="40,110 100,138 100,75 40,47" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="100,138 160,110 160,47 100,75" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="40,47 100,75 160,47 100,19" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <line x1="70" y1="61" x2="70" y2="124" stroke="#38bdf8" strokeWidth="2" />
          <line x1="130" y1="124" x2="130" y2="61" stroke="#38bdf8" strokeWidth="2" />
          <rect x="92" y="80" width="16" height="20" fill="#0284c7" rx="2" transform="skewY(-10)" />
        </svg>
      );
    case 'checklist':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          <ellipse cx="100" cy="165" rx="55" ry="10" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="55,135 115,155 150,110 90,90" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          <polygon points="67,125 111,141 139,103 95,87" fill="#0f172a" />
          <polyline points="75,117 78,120 84,113" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="81,110 84,113 90,106" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="87,103 90,106 96,99" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'averbacao':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="45,115 100,140 100,75 45,50" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
          <polygon points="100,140 155,115 155,50 100,75" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
          <polygon points="45,50 100,75 155,50 100,25" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="127" cy="95" r="14" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="127" cy="95" r="4" fill="#f59e0b" />
        </svg>
      );
    case 'sm_creator':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="45,120 100,145 100,85 45,60" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
          <polygon points="100,145 155,120 155,60 100,85" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.5" />
          <polygon points="45,60 100,85 155,60 100,35" fill="#2563eb" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="72" y1="67" x2="72" y2="25" stroke="#60a5fa" strokeWidth="2.5" />
          <circle cx="72" cy="23" r="3" fill="#ef4444" className="animate-ping" />
          <line x1="128" y1="67" x2="128" y2="25" stroke="#60a5fa" strokeWidth="2.5" />
          <circle cx="128" cy="23" r="3" fill="#3b82f6" />
        </svg>
      );
    case 'rotas':
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(20,184,166,0.5)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <circle cx="100" cy="90" r="42" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
          <polygon points="100,58 104,90 96,90" fill="#ef4444" />
          <polygon points="100,122 104,90 96,90" fill="#64748b" />
          <polygon points="68,90 100,94 100,86" fill="#64748b" />
          <polygon points="132,90 100,94 100,86" fill="#64748b" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_30px_rgba(58,189,248,0.5)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(8px)" />
          <polygon points="45,115 100,140 155,115 100,90" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="45,115 100,140 100,75 45,50" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="100,140 155,115 155,50 100,75" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="100" cy="50" r="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
        </svg>
      );
  }
}

export default function InitialMenu({ 
  onSelect, 
  focusedIndex, 
  setFocusedIndex, 
  showPresenceList, 
  showRotasPage, 
  showSlides, 
  pageVisibility, 
  availablePages, 
  onUnlockPresenceList, 
  onLogout 
}: InitialMenuProps) {
  const [direction, setDirection] = useState(0);

  const allPages = availablePages || getAllAvailablePages();

  const menuItemsList: MenuItem[] = allPages.map(page => {
    const existing = baseMenuItems.find(b => b.id === page.id);
    const IconComp = ICON_MAP[page.iconName] || existing?.icon || Sliders;
    return {
      id: page.id,
      label: page.label,
      buttonLabel: page.buttonLabel || page.category || 'Módulo',
      icon: IconComp,
      color: existing?.color || 'text-slate-300',
      description: page.description
    };
  });

  const filteredMenuItems = menuItemsList.filter(item => {
    if (pageVisibility && pageVisibility[item.id] !== undefined) {
      return Boolean(pageVisibility[item.id]);
    }
    if (item.id === 'presence') return Boolean(showPresenceList);
    if (item.id === 'rotas') return Boolean(showRotasPage);
    if (item.id === 'slides') return Boolean(showSlides);
    return true;
  });

  const itemsToRender = filteredMenuItems.length > 0 ? filteredMenuItems : menuItemsList.slice(0, 1);
  const safeFocusedIndex = Math.min(focusedIndex, Math.max(0, itemsToRender.length - 1));
  const activeItem = itemsToRender[safeFocusedIndex] || itemsToRender[0];

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setFocusedIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = itemsToRender.length - 1;
      if (next >= itemsToRender.length) next = 0;
      return next;
    });
  }, [setFocusedIndex, itemsToRender.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'Enter') {
        const currentItem = itemsToRender[safeFocusedIndex] || itemsToRender[0];
        if (currentItem) onSelect(currentItem.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeFocusedIndex, paginate, onSelect, itemsToRender]);

  return (
    <div className="w-full min-h-screen text-slate-100 select-none relative flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden md:overflow-y-hidden">
      
      {/* ================= HEADER AREA ================= */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 max-w-full mx-auto mt-2 px-2 sm:px-4">
        
        {/* TOP LEFT HEADER: PGR COMMAND CENTER BRANDING */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl rounded-2xl py-2 px-4 border border-sky-500/30 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center shrink-0 shadow-lg text-sky-400">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-sky-400 leading-none mb-1">
              PGR COMMAND CENTER 3D
            </span>
            <span className="text-base font-black font-mono uppercase tracking-wide text-white leading-none">
              CENTRAL OPERACIONAL DE RISCO
            </span>
          </div>
        </div>

        {/* TOP RIGHT SYSTEM STATUS PLATE */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="led-status led-status-green" />
              <span className="text-slate-300 font-bold uppercase">SISTEMA ATIVO</span>
            </div>
            <span className="text-slate-600">|</span>
            <button
              onClick={onUnlockPresenceList}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Acesso Administrador"
            >
              {showPresenceList ? <Unlock size={14} className="text-emerald-400" /> : <Lock size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= CENTRAL COMMAND MODULE CAROUSEL ================= */}
      <div className="flex-1 flex items-center justify-between gap-4 w-full max-w-full mx-auto px-2 sm:px-4 relative z-10 select-none py-6">
        
        {/* LEFT CHEVRON */}
        <motion.button 
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-sky-500/40 shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all cursor-pointer"
        >
          <ChevronLeft size={24} className="stroke-[2.5]" />
        </motion.button>

        {/* 3D CAROUSEL CORE DISPLAY */}
        <div className="flex-1 flex items-center justify-center relative min-h-[28rem]">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              initial={{ x: direction > 0 ? 120 : -120, opacity: 0, scale: 0.92 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: direction > 0 ? -120 : 120, opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-[360px] h-[26rem] rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0c1527]/95 to-slate-950/95 border-2 border-sky-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.2)] p-6 flex flex-col items-center justify-between relative cursor-pointer group"
              onClick={() => onSelect(activeItem.id)}
            >
              {/* Corner HUD brackets */}
              <div className="hud-bracket hud-bracket-tl" />
              <div className="hud-bracket hud-bracket-tr" />
              <div className="hud-bracket hud-bracket-bl" />
              <div className="hud-bracket hud-bracket-br" />

              {/* Holographic 3D Vector */}
              <div className="flex-1 flex items-center justify-center relative w-full pt-2">
                <ModuleGraphic3D id={activeItem.id} />
              </div>

              {/* Module Metadata */}
              <div className="flex flex-col items-center text-center w-full mt-2">
                <span className="bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-mono font-extrabold px-4 py-1 uppercase tracking-widest rounded-full shadow-lg">
                  {activeItem.buttonLabel}
                </span>

                <h2 className="text-2xl font-mono font-black text-white tracking-tight uppercase mt-3">
                  {activeItem.label}
                </h2>

                <p className="text-slate-300 text-xs font-sans leading-relaxed max-w-[16rem] mt-2 line-clamp-2">
                  {activeItem.description}
                </p>

                <div className="mt-4 px-6 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                  <Terminal size={14} /> ACESSAR MÓDULO <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT CHEVRON */}
        <motion.button 
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-sky-500/40 shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all cursor-pointer"
        >
          <ChevronRight size={24} className="stroke-[2.5]" />
        </motion.button>
      </div>

      {/* ================= FOOTER BAR ================= */}
      <div className="w-full relative z-10 max-w-full mx-auto mt-auto px-2 sm:px-4">
        <div className="w-full py-3 px-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono text-slate-400">
          <span>© 2026 SISTEMA PGR • COMMAND CENTER 3D</span>
          <div className="flex items-center gap-4">
            <span>Jefferson Augusto</span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1 uppercase transition-all cursor-pointer"
              >
                <LogOut size={12} /> Sair
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
