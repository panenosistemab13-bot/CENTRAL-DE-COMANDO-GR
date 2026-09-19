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
  RefreshCw,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Package,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toAbsoluteUrl } from '../utils/url';
import { PageDefinition, ICON_MAP, getAllAvailablePages } from '../data/pagesConfig';
import { useAppVersion } from '../utils/version';
import cinemaBg from '../assets/images/ab_cafe_cinema_bg_1789847899939.jpg';
import goldCubeImg from '../assets/images/gold_cube_emblem_1789847913021.jpg';

interface MenuItem {
  id: string;
  label: string;
  buttonLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const baseMenuItems: MenuItem[] = [
  { id: 'escala', label: 'Escala', buttonLabel: 'DISPONIBILIDADE', icon: FileSpreadsheet, color: 'text-amber-300', description: 'Conversor de escala para formato de planilha de Disponibilidade do Pátio (30 colunas).' },
  { id: 'patio', label: 'Pátio', buttonLabel: 'LOGÍSTICA', icon: Container, color: 'text-amber-300', description: 'Gestão inteligente de entrada e saída de veículos e docas operacionais.' },
  { id: 'checklist', label: 'Checklist', buttonLabel: 'VISTORIAS', icon: ClipboardCheck, color: 'text-amber-300', description: 'Controle de validade e vistorias técnicas de periféricos frota.' },
  { id: 'averbacao', label: 'Averbação', buttonLabel: 'SEGUROS', icon: FileCheck2, color: 'text-amber-300', description: 'Gestão de apólices, notas fiscais e seguros integrados.' },
  { id: 'sm_creator', label: 'SM', buttonLabel: 'EVENTOS', icon: CalendarDays, color: 'text-amber-300', description: 'Criação e agendamento de solicitações de monitoramento.' },
  { id: 'controle', label: 'Controle', buttonLabel: 'GERAIS', icon: Sliders, color: 'text-amber-300', description: 'Gerador inteligente de controle, pré-alerta e iscas de rastreamento.' },
  { id: 'presence', label: 'Lista de Presença', buttonLabel: 'EFETIVO', icon: Users2, color: 'text-amber-300', description: 'Controle de escala, agenda corporativa e presença de colaboradores.' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'LOGÍSTICA', icon: Route, color: 'text-amber-300', description: 'Otimização de trajetos e códigos de rotas operacionais.' },
  { id: 'slides', label: 'Slides HUD', buttonLabel: 'COMMAND CENTER 4K', icon: Globe, color: 'text-cyan-400', description: 'Dashboard executivo 4K com mapa-múndi holográfico 3D e status de unidades.' },
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
  notificationsCount?: number;
}

// 3D Golden Logo Seal "A&B CAFÉ"
function AbCafeSeal() {
  return (
    <div className="flex items-center gap-2 select-none group cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a0f08] via-[#2d1b0f] to-[#120a05] border-[2.5px] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4),inset_0_1px_3px_rgba(255,255,255,0.3)] flex flex-col items-center justify-center p-1 relative transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full rounded-full border border-[#d4af37]/60 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 to-black/80">
          <span className="font-serif font-black text-[#f5d77f] text-[11px] leading-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            A&B
          </span>
          <span className="font-serif font-bold text-[#c7a462] text-[7.5px] leading-none tracking-[0.18em] uppercase mt-0.5">
            Café
          </span>
        </div>
      </div>
    </div>
  );
}

// Coffee Bean Icon
function CoffeeBeanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-4 h-4", className)}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79 2.5 1.5 5.5 1.7 8.5.5.6 2.8 2.3 5.1 4.7 6.4-.9 1.6-2.5 2.7-4.4 2.82zm5.79-4.24c-2.2-1.3-3.8-3.3-4.4-5.8 2.6-.9 5.3-.8 7.6.5-.4 2.1-1.6 3.9-3.2 5.3z" />
    </svg>
  );
}

// 3D Visual for the Centerpiece Card
function Module3DGraphic({ id }: { id: string }) {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Ambient glowing golden pedestal halo */}
      <div 
        className="absolute bottom-2 w-36 h-10 rounded-full blur-md opacity-80 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.7) 0%, rgba(212, 175, 55, 0) 70%)'
        }}
      />

      {/* Floating 3D Gold Cube with crown and coffee bean emblem */}
      <motion.div
        animate={{ 
          y: [0, -6, 0],
          rotateZ: [0, 1, 0, -1, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4.5, 
          ease: "easeInOut" 
        }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        {/* Glowing Orbit Rings */}
        <div className="absolute w-40 h-40 rounded-full border border-[#d4af37]/30 animate-pulse pointer-events-none" />
        <div className="absolute w-32 h-32 rounded-full border border-[#f5d77f]/20 pointer-events-none" />

        {/* 3D Generated Gold Cube Asset */}
        <div className="w-36 h-36 relative flex items-center justify-center">
          <img 
            src={toAbsoluteUrl(goldCubeImg)} 
            alt="3D Gold Emblem"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>
  );
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
  onLogout,
  notificationsCount = 3
}: InitialMenuProps) {
  const [direction, setDirection] = useState(0);
  const { lastUpdateDate, isAIStudio, updateDateToNow } = useAppVersion();
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);

  const allPages = availablePages || getAllAvailablePages();

  const menuItemsList: MenuItem[] = allPages.map(page => {
    const existing = baseMenuItems.find(b => b.id === page.id);
    const IconComp = ICON_MAP[page.iconName] || existing?.icon || Sliders;
    return {
      id: page.id,
      label: page.label,
      buttonLabel: page.buttonLabel || page.category || existing?.buttonLabel || 'MÓDULO',
      icon: IconComp,
      color: existing?.color || 'text-amber-300',
      description: page.description || existing?.description || 'Acesso rápido às funcionalidades operacionais.'
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

  const handleUpdateData = async () => {
    if (isUpdatingDate) return;
    setIsUpdatingDate(true);
    try {
      if (updateDateToNow) {
        await updateDateToNow();
      }
      setIsUpdateSuccess(true);
      setTimeout(() => setIsUpdateSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingDate(false);
    }
  };

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
    <div className="w-full h-screen min-h-screen relative overflow-hidden flex flex-col justify-between font-sans select-none text-[#f5ebd7]">
      
      {/* ================= FULL HD 3D CINEMATIC BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={toAbsoluteUrl(cinemaBg)}
          alt="Cinematic 3D Cafe Background"
          className="w-full h-full object-cover select-none brightness-100 saturate-105"
          referrerPolicy="no-referrer"
        />
        {/* Subtle cinematic vignette for pristine UI contrast */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(10,5,2,0.65) 100%)' 
          }} 
        />
      </div>

      {/* ================= TOP HEADER BAR ================= */}
      <header className="w-full relative z-20 px-4 sm:px-6 md:px-10 pt-3 sm:pt-4 flex items-center justify-between gap-4">
        
        {/* Top Left: A&B Logo Seal + Última Atualização Pill */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <AbCafeSeal />

          {/* Status Capsule */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-black/50 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse shrink-0" />
            <span className="font-black text-[9px] sm:text-[11px] uppercase tracking-wider text-[#d4af37] shrink-0">
              ÚLTIMA ATUALIZAÇÃO:
            </span>
            <div className="flex items-center gap-1.5 text-white/95 font-medium text-[10px] sm:text-xs">
              <Calendar size={13} className="text-[#d4af37] shrink-0 opacity-90" />
              <span className="font-mono tracking-tight">{lastUpdateDate}</span>
            </div>
          </div>
        </div>

        {/* Top Right: Atualizar Dados + Notification Bell + User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Atualizar Dados Emerald Pill Button */}
          <button
            type="button"
            onClick={handleUpdateData}
            disabled={isUpdatingDate}
            className={cn(
              "px-3.5 sm:px-4 py-1.5 rounded-full border-2 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md transition-all cursor-pointer active:scale-95",
              isUpdateSuccess
                ? "bg-emerald-600 border-emerald-400 text-white"
                : "bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-500/70 text-emerald-300 hover:text-emerald-200"
            )}
            title="Atualizar dados do sistema"
          >
            {isUpdateSuccess ? (
              <CheckCircle2 size={13} className="text-white" />
            ) : (
              <RefreshCw size={13} className={cn("text-emerald-400", isUpdatingDate && "animate-spin")} />
            )}
            <span>{isUpdatingDate ? "ATUALIZANDO..." : isUpdateSuccess ? "ATUALIZADO!" : "ATUALIZAR DADOS"}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#eddabf] hover:text-white hover:bg-black/70 transition-all cursor-pointer shadow-md"
              title="Notificações e Compromissos"
            >
              <Bell size={16} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border border-white/40 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-md">
            <div className="w-7 h-7 rounded-full bg-[#3a2213] border border-[#d4af37]/60 flex items-center justify-center text-[#eddabf] shrink-0">
              <User size={14} />
            </div>
            <div className="flex flex-col text-left leading-tight pr-1 hidden xs:flex">
              <span className="text-[11px] font-bold text-white tracking-tight">Jefferson Augusto</span>
              <span className="text-[9px] text-[#cca07d] font-medium">Sistema Web</span>
            </div>
          </div>

        </div>

      </header>

      {/* ================= TOP-LEFT FLOATING QUOTE CARD ================= */}
      <div className="absolute top-20 left-4 sm:left-8 md:left-10 z-20 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-r from-black/70 via-black/50 to-black/70 border border-[#d4af37]/50 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-md flex items-center gap-3.5 group hover:border-[#f5d77f]/80 transition-all"
        >
          {/* Steaming Coffee Cup Icon */}
          <div className="relative shrink-0 flex flex-col items-center">
            {/* Steams */}
            <div className="flex gap-0.5 -mt-2 mb-0.5 opacity-80">
              <span className="w-0.5 h-2 bg-[#f5d77f] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-0.5 h-3 bg-[#f5d77f] rounded-full animate-bounce" style={{ animationDelay: '0.35s' }} />
              <span className="w-0.5 h-2 bg-[#f5d77f] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            {/* Cup */}
            <div className="w-5 h-3.5 border-2 border-[#f5d77f] rounded-b-md relative flex items-center justify-center">
              <span className="absolute -right-[4.5px] top-0.5 w-[4.5px] h-1.5 border-2 border-l-0 border-[#f5d77f] rounded-r-md" />
            </div>
            <div className="w-7 h-[1.5px] bg-[#f5d77f] rounded-full mt-[1px]" />
          </div>

          <div className="flex flex-col pr-1">
            <p className="font-serif italic text-[11px] sm:text-xs text-[#fdefd1] font-semibold leading-none">
              Feito com paixão.
            </p>
            <p className="font-serif italic text-[10px] sm:text-[11px] text-[#cca07d] font-semibold leading-none mt-1">
              Feito para entregar.
            </p>
            
            {/* 3 Dots & Lock toggle */}
            <div className="flex items-center justify-between gap-3 mt-1.5 pt-0.5 border-t border-white/10">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/30" />
              </div>
              
              <button
                type="button"
                onClick={onUnlockPresenceList}
                className="text-[#d4af37]/70 hover:text-[#fdefd1] transition-colors cursor-pointer"
                title="Acesso Administrador / Páginas Restritas"
              >
                {showPresenceList ? <Unlock size={11} className="text-emerald-400" /> : <Lock size={11} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= CENTER CAROUSEL & PEDESTAL STAGE ================= */}
      <main className="flex-1 flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-8 relative z-20 py-2 sm:py-0">
        
        {/* LEFT CHEVRON ARROW BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.12, boxShadow: "0 0 25px rgba(212,175,55,0.6)" }}
          whileTap={{ scale: 0.92 }}
          onClick={() => paginate(-1)}
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-full bg-black/70 border-2 border-[#d4af37]/70 shadow-[0_8px_25px_rgba(0,0,0,0.9)] text-[#eddabf] hover:text-white hover:border-[#f5d77f] transition-all cursor-pointer backdrop-blur-md z-30"
          aria-label="Item anterior"
        >
          <ChevronLeft size={26} className="drop-shadow-md stroke-[2.5]" />
        </motion.button>

        {/* CENTER PEDESTAL & MAIN CARD */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[26rem] sm:min-h-[28rem] px-2">
          
          {/* Circular Glowing Pedestal under the card */}
          <div className="absolute bottom-6 w-72 sm:w-80 h-16 pointer-events-none flex items-center justify-center">
            <div 
              className="w-full h-full rounded-full border-2 border-[#d4af37]/50 shadow-[0_0_50px_rgba(212,175,55,0.6)]" 
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.4) 0%, rgba(40,20,10,0.8) 60%, transparent 100%)',
                transform: 'rotateX(68deg)'
              }}
            />
          </div>

          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              initial={{ x: direction > 0 ? 90 : -90, opacity: 0, scale: 0.94 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: direction > 0 ? -90 : 90, opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="w-full max-w-[340px] sm:max-w-[370px] rounded-[2rem] border-[3px] border-[#d4af37]/80 bg-gradient-to-b from-[#bfa078]/85 via-[#684b32]/90 to-[#2c1a0e]/95 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.92),inset_0_2px_4px_rgba(255,255,255,0.35),0_0_35px_rgba(212,175,55,0.25)] p-6 sm:p-7 flex flex-col items-center justify-between relative cursor-pointer select-none group transition-all duration-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.98),0_0_50px_rgba(212,175,55,0.4)]"
              onClick={() => onSelect(activeItem.id)}
            >
              {/* Beveled Card Metallic Corner Highlights */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#f5d77f]/60 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#f5d77f]/60 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#f5d77f]/60 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#f5d77f]/60 rounded-br-lg pointer-events-none" />

              {/* 3D Visual Centerpiece */}
              <div className="w-full flex items-center justify-center -mt-2 mb-1">
                <Module3DGraphic id={activeItem.id} />
              </div>

              {/* Red Badge Ribbon */}
              <div className="mb-2">
                <span className="bg-gradient-to-r from-[#990000] via-[#cc1111] to-[#990000] text-white text-[10px] font-black uppercase tracking-widest px-5 py-1 rounded-full shadow-[0_4px_15px_rgba(204,17,17,0.7)] border border-red-400/50">
                  {activeItem.buttonLabel}
                </span>
              </div>

              {/* Module Title */}
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-2 text-center">
                {activeItem.label}
              </h2>

              {/* Description */}
              <p className="text-[#f5ebd7] text-xs sm:text-[13px] font-medium leading-relaxed text-center max-w-[280px] drop-shadow-sm mb-4">
                {activeItem.description}
              </p>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.90 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(activeItem.id);
                }}
                className="w-11 h-11 rounded-full border-2 border-[#d4af37] bg-black/60 hover:bg-[#d4af37] text-[#d4af37] hover:text-black shadow-[0_4px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer group"
                title={`Entrar no módulo ${activeItem.label}`}
              >
                <ChevronRight size={22} className="stroke-[3] transition-transform group-hover:translate-x-0.5" />
              </motion.button>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* RIGHT CHEVRON ARROW BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.12, boxShadow: "0 0 25px rgba(212,175,55,0.6)" }}
          whileTap={{ scale: 0.92 }}
          onClick={() => paginate(1)}
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-full bg-black/70 border-2 border-[#d4af37]/70 shadow-[0_8px_25px_rgba(0,0,0,0.9)] text-[#eddabf] hover:text-white hover:border-[#f5d77f] transition-all cursor-pointer backdrop-blur-md z-30"
          aria-label="Próximo item"
        >
          <ChevronRight size={26} className="drop-shadow-md stroke-[2.5]" />
        </motion.button>

      </main>

      {/* ================= BOTTOM FOOTER BAR ================= */}
      <footer className="w-full relative z-20 px-4 sm:px-8 py-2.5 sm:py-3 bg-black/60 backdrop-blur-md border-t border-[#d4af37]/30 shadow-[0_-5px_20px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-medium text-[#d6b493]">
        
        {/* Left: Copyright */}
        <div className="flex items-center gap-2">
          <CoffeeBeanIcon className="text-[#d4af37]" />
          <span>© 2026 Sistema PGR - Todos os direitos reservados.</span>
        </div>

        {/* Center: Quote */}
        <div className="flex items-center gap-1.5 font-serif italic text-[#fdefd1] text-xs font-semibold">
          <span className="text-[#d4af37]">🍃</span>
          <span>Feito com paixão. Feito para entregar.</span>
          <span className="text-[#d4af37]">🍃</span>
        </div>

        {/* Right: Author & Status */}
        <div className="flex items-center gap-2.5">
          <span>Sistema Web - <strong className="text-white font-bold">Jefferson Augusto</strong></span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" title="Sistema Online" />
          
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="ml-2 px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut size={11} /> Sair
            </button>
          )}
        </div>

      </footer>

    </div>
  );
}
