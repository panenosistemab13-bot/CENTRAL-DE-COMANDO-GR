import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  ClipboardCheck,
  FileCheck2,
  Share2,
  BarChart3,
  Calendar,
  Users2,
  MapPin,
  ChevronRight,
  ChevronDown,
  Lock,
  LogOut,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageDefinition } from '../data/pagesConfig';

import Checklist from './Checklist';
import Averbacao from './Averbacao';
import SMCreator from './SMCreator';
import Controle from './Controle';
import Escala from './Escala';
import PresenceList from './PresenceList';
import Rotas from './Rotas';
import DashboardInicioFuturistic from './DashboardInicioFuturistic';

// High-fidelity image assets
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';
import coffeeLatteCup from '../assets/images/latte_cup_saucer_beans_1790406410066.jpg';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';

interface InitialMenuProps {
  onSelect: (pageId: string) => void;
  pages?: PageDefinition[];
  activeTab?: string;
  onUnlockPresenceList?: () => void;
  onLogout?: () => void;
  averbacaoView?: 'generator' | 'analytics';
  smCreatorView?: 'generator' | 'codes';
  focusedIndex?: any;
  setFocusedIndex?: any;
  pageVisibility?: any;
  availablePages?: any;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
}

export default function InitialMenu({
  onSelect,
  activeTab = 'menu',
  onUnlockPresenceList,
  onLogout,
  averbacaoView = 'generator',
  smCreatorView = 'generator',
}: InitialMenuProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState(activeTab);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Proportional 1930 x 815 scaling controller
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setActiveNav(activeTab);
  }, [activeTab]);

  // Synchronized real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute uniform scale to fit 1930 x 815 perfectly into the viewport
  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1930;
      const targetHeight = 815;
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;

      // Uniform proportional scale
      const sX = wWidth / targetWidth;
      const sY = wHeight / targetHeight;
      const calculatedScale = Math.min(sX, sY);

      // Clamp between 0.55 and 1.25
      setScale(Math.max(0.55, Math.min(1.25, calculatedScale)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    const day = currentTime.getDate();
    const month = currentTime.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
    const year = currentTime.getFullYear();
    return `${day} ${month} ${year}`;
  }, [currentTime]);

  // Sidebar navigation items matching the layout
  const sidebarItems = [
    { id: 'menu', label: 'Início', icon: Home },
    { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
    { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', icon: Share2 },
    { id: 'controle', label: 'Controle', icon: BarChart3 },
    { id: 'escala', label: 'Escala', icon: Calendar },
    { id: 'presence', label: 'Lista de Presença', icon: Users2 },
    { id: 'rotas', label: 'Rotas', icon: MapPin },
  ];

  const handleItemClick = (id: string) => {
    setActiveNav(id);
    onSelect(id);
  };

  const renderActiveModuleContent = () => {
    switch (activeNav) {
      case 'checklist':
        return <Checklist />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} onBack={() => handleItemClick('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} onBack={() => handleItemClick('menu')} />;
      case 'controle':
        return <Controle onBack={() => handleItemClick('menu')} />;
      case 'escala':
        return <Escala onBack={() => handleItemClick('menu')} />;
      case 'presence':
        return <PresenceList onBack={() => handleItemClick('menu')} />;
      case 'rotas':
        return <Rotas onBack={() => handleItemClick('menu')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen h-screen overflow-hidden flex items-center justify-center bg-[#f4ede1] text-[#171717] font-sans relative select-none">

      {/* ========================================================================= */}
      {/* UNIFORMLY SCALED DESIGN CANVAS (1930px × 815px BASE CANVAS)               */}
      {/* ========================================================================= */}
      <div
        style={{
          width: `${1930 * scale}px`,
          height: `${815 * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div 
          ref={containerRef}
          style={{
            width: '1930px',
            height: '815px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className="bg-[#f6efe4] shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
        >

        {/* ======================================================================= */}
        {/* 1. TOPBAR OPERACIONAL CAFÉ TRÊS CORAÇÕES (HEIGHT = 70px)                */}
        {/* ======================================================================= */}
        <header className="w-full h-[70px] px-7 bg-[#f8f1e6]/95 backdrop-blur-md border-b border-[#dfd6c6] flex items-center justify-between shadow-[0_2px_14px_rgba(0,0,0,0.04)] z-40 shrink-0">
          
          {/* Left: Brand Identity & Sistema Operacional Title */}
          <div className="flex items-center gap-7">
            <div 
              onClick={() => handleItemClick('menu')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              {/* 3D Gold Rimmed Red Circle Medal with 3 Corações Heart Logo */}
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(180,130,40,0.35)] group-hover:scale-105 transition-transform flex items-center justify-center bg-transparent">
                <img 
                  src={goldMedalLogo} 
                  alt="Café Três Corações"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="leading-tight text-left">
                <strong className="text-[17px] font-black text-stone-900 tracking-wide font-sans block">
                  Café Três Corações
                </strong>
                <span className="text-[8.5px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5">
                  SEGURANÇA • LOGÍSTICA • RESULTADOS
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#dfd6c6] shrink-0" />

            {/* Sistema Operacional Center Title */}
            <div className="flex flex-col text-left leading-tight shrink-0">
              <span className="text-[14px] font-black uppercase tracking-wider text-stone-900 font-sans">
                SISTEMA OPERACIONAL
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-widest text-stone-500 mt-0.5">
                CONTROLE TÁTICO • GESTÃO • RESULTADOS
              </span>
            </div>
          </div>

          {/* Center-Right & Right: Search, Notifications, Profile, Clock */}
          <div className="flex items-center gap-5 shrink-0">

            {/* Search Bar Pill (Width ~280px, Height ~43px, Radius ~25px) */}
            <div className="flex items-center gap-2.5 px-4 h-[43px] rounded-[25px] bg-[#f2e8d8]/85 border border-[#dfd6c6] w-[280px] shadow-inner text-stone-600 focus-within:bg-white focus-within:border-stone-400 transition-all">
              <Search size={15} className="text-stone-400 shrink-0" />
              <input 
                type="text"
                placeholder="Buscar no sistema..."
                className="bg-transparent border-none outline-none text-[13px] text-stone-800 placeholder-stone-400 w-full font-sans"
              />
            </div>

            {/* Notification Bell with Badge 3 */}
            <div className="relative shrink-0">
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-white hover:bg-stone-50 border border-[#dfd6c6] flex items-center justify-center text-stone-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Bell size={16} />
              </button>
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#8e0b18] text-white text-[9.5px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                3
              </span>
            </div>

            {/* User Profile Capsule */}
            <div className="relative shrink-0">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-[#dfd6c6] transition-colors cursor-pointer shadow-2xs group"
              >
                <img
                  src={avatarJefferson}
                  alt="Jefferson Dias"
                  className="w-8 h-8 rounded-full object-cover border border-stone-300 shadow-xs"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[12.5px] font-bold text-stone-900 leading-tight">Jefferson Dias</span>
                  <span className="text-[9.5px] text-stone-500 font-medium leading-none mt-0.5">Administrador</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-hover:text-stone-700 ml-0.5 transition-colors" />
              </div>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 top-full w-56 bg-white border border-[#ded5c6] rounded-2xl shadow-xl p-2 z-50 text-xs"
                  >
                    <button
                      onClick={onUnlockPresenceList}
                      className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-stone-50 text-stone-800 font-bold flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                        <Lock size={14} />
                      </div>
                      <span>Segurança Operacional</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-red-50 text-red-700 font-bold flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                          <LogOut size={14} />
                        </div>
                        <span>Encerrar Sessão</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date & Time */}
            <div className="flex flex-col items-end border-l border-[#dfd6c6] pl-5 leading-tight shrink-0">
              <span className="text-[9.5px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                {formattedDate}
              </span>
              <strong className="text-[20px] font-mono font-black text-stone-900 tracking-tight mt-0.5">
                {formattedTime}
              </strong>
            </div>

          </div>

        </header>

        {/* ======================================================================= */}
        {/* 2. MAIN WORKSPACE: SIDEBAR (~198px) + DASHBOARD CONTENT (~1700px)        */}
        {/* ======================================================================= */}
        <main className="flex-1 w-full p-3.5 gap-3.5 flex items-stretch overflow-hidden">
          
          {/* --------------------------------------------------------------------- */}
          {/* ENLARGED LEFT SIDEBAR (~245px × 725px)                                */}
          {/* --------------------------------------------------------------------- */}
          <aside className="w-[245px] shrink-0 bg-[#faf8f3]/95 border border-[#dfd6c6] rounded-[24px] p-3 shadow-[0_4px_22px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
            
            {/* Navigation Links - Enlarged & High-Legibility */}
            <nav className="flex flex-col gap-2">
              {sidebarItems.map((item) => {
                const isActive = activeNav === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "w-full h-[52px] flex items-center justify-between px-3.5 rounded-[18px] text-[14px] font-bold tracking-wide transition-all duration-200 cursor-pointer group text-left relative",
                      isActive
                        ? "bg-gradient-to-r from-[#8e0b18] via-[#a91625] to-[#6f0712] text-white shadow-[0_6px_20px_rgba(142,11,24,0.42)] border border-red-900/40"
                        : "text-stone-700 hover:text-stone-950 hover:bg-white/90"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                        isActive ? "bg-white/20 text-white" : "bg-[#f2e8d9] text-[#8e0b18]"
                      )}>
                        <Icon size={17} />
                      </div>
                      <span className="font-sans font-bold text-[14px]">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={cn(
                        "shrink-0 transition-transform",
                        isActive ? "text-white translate-x-0.5" : "text-stone-400 group-hover:text-stone-600"
                      )} 
                    />
                  </button>
                );
              })}
            </nav>

            {/* Bottom Coffee Brand Promo Card (Visible, unclipped cup with steam and beans) */}
            <div className="mt-2 pt-2 border-t border-[#dfd6c6]/60">
              <div className="relative rounded-[20px] overflow-hidden border border-[#dfd6c6] shadow-sm bg-stone-950 group h-[175px]">
                <img
                  src={coffeeLatteCup}
                  alt="Café Três Corações"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3.5 right-3.5 text-left">
                  <span className="text-[8.5px] font-mono font-bold tracking-[0.2em] text-[#f5d799] uppercase block mb-1">
                    CAFÉ TRÊS CORAÇÕES
                  </span>
                  <span className="text-[13.5px] font-black text-white leading-snug block drop-shadow-sm font-heading">
                    Mais que café,<br />movemos o Brasil.
                  </span>
                </div>
              </div>
            </div>

          </aside>

          {/* --------------------------------------------------------------------- */}
          {/* MAIN CONTENT AREA: DASHBOARD OR ACTIVE SUB-MODULE                     */}
          {/* --------------------------------------------------------------------- */}
          <section className="flex-1 min-w-0 h-full overflow-hidden">
            {activeNav === 'menu' ? (
              <DashboardInicioFuturistic onNavigate={handleItemClick} />
            ) : (
              <div id="main-scroll-container" className="bg-[#fffdfa] rounded-[22px] h-full overflow-y-auto border border-[#ded5c6] shadow-sm relative z-10 p-5">
                <div className="mb-4 pb-3 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleItemClick('menu')}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      ‹ Voltar ao Início
                    </button>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {sidebarItems.find(i => i.id === activeNav)?.label}
                    </span>
                  </div>
                </div>
                {renderActiveModuleContent()}
              </div>
            )}
          </section>

        </main>

      </div>
      </div>

    </div>
  );
}
