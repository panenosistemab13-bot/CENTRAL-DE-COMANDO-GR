import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
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
import steamingCoffee from '../assets/images/steaming_cup_coffee_1789847106425.jpg';
import truckAsset from '../assets/images/sidebar_truck_red_1790209039511.jpg';

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

  useEffect(() => {
    setActiveNav(activeTab);
  }, [activeTab]);

  // Synchronized real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    <div className="w-full min-h-screen h-auto flex flex-col bg-gradient-to-br from-[#e8dfd2] via-[#f6f1e8] to-[#ede5d8] text-[#171717] font-sans relative select-none overflow-y-auto">

      {/* ========================================================================= */}
      {/* 1. TOPBAR OPERACIONAL CAFÉ TRÊS CORAÇÕES                                  */}
      {/* ========================================================================= */}
      <header className="w-full h-15 px-4 lg:px-5 bg-[#faf8f3]/95 backdrop-blur-md border-b border-[#ded5c6] flex items-center justify-between shadow-2xs z-40 shrink-0">
        
        {/* Left: Brand Identity & Sistema Operacional Title */}
        <div className="flex items-center gap-5">
          <div 
            onClick={() => handleItemClick('menu')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* 3D Gold Rimmed Red Circle with 3 Corações Heart Logo */}
            <div className="w-10 h-10 rounded-full bg-[#8f101b] p-0.5 flex items-center justify-center shadow-md border-2 border-[#dfb15b] group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <circle cx="50" cy="50" r="46" fill="#8f101b" />
                <path 
                  d="M50 82 C50 82 20 60 20 38 C20 25 31 16 43 18 C47 19 50 22 50 22 C50 22 53 19 57 18 C69 16 80 25 80 38 C80 60 50 82 50 82 Z" 
                  fill="#dfb15b" 
                />
                <path 
                  d="M50 72 C50 72 26 54 26 38 C26 28 35 22 43 24 C46 25 50 28 50 28 C50 28 54 25 57 24 C65 22 74 28 74 38 C74 54 50 72 50 72 Z" 
                  fill="#a31524" 
                />
                <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="sans-serif">
                  3corações
                </text>
              </svg>
            </div>
            
            <div className="leading-tight text-left">
              <strong className="text-sm font-black text-stone-900 tracking-wide font-sans block">
                Café Três Corações
              </strong>
              <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-widest block">
                SEGURANÇA • LOGÍSTICA • RESULTADOS
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-300 shrink-0" />

          {/* Sistema Operacional Center Title */}
          <div className="flex flex-col text-left leading-tight shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 font-sans">
              SISTEMA OPERACIONAL
            </span>
            <span className="text-[7.5px] font-bold uppercase tracking-widest text-stone-500">
              CONTROLE TÁTICO • GESTÃO • RESULTADOS
            </span>
          </div>
        </div>

        {/* Center-Right & Right: Search, Notifications, Profile, Clock */}
        <div className="flex items-center gap-3.5 shrink-0">

          {/* Search Bar Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4efe6] border border-[#ded5c6] w-48 sm:w-64 shadow-inner text-stone-600 focus-within:bg-white focus-within:border-stone-400 transition-all">
            <Search size={13} className="text-stone-400 shrink-0" />
            <input 
              type="text"
              placeholder="Buscar no sistema..."
              className="bg-transparent border-none outline-none text-xs text-stone-800 placeholder-stone-400 w-full"
            />
          </div>

          {/* Notification Bell with Badge 3 */}
          <div className="relative shrink-0">
            <button 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 border border-[#ded5c6] flex items-center justify-center text-stone-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Bell size={14} />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8f101b] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
              3
            </span>
          </div>

          {/* User Profile Capsule */}
          <div className="relative shrink-0">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-[#ded5c6] transition-colors cursor-pointer shadow-2xs group"
            >
              <img
                src={avatarJefferson}
                alt="Jefferson Dias"
                className="w-7 h-7 rounded-full object-cover border border-stone-300 shadow-2xs"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-stone-900 leading-tight">Jefferson Dias</span>
                <span className="text-[9px] text-stone-500 font-medium leading-none">Administrador</span>
              </div>
              <ChevronDown size={13} className="text-stone-400 group-hover:text-stone-700 ml-1 transition-colors" />
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
          <div className="flex flex-col items-end border-l border-[#ded5c6] pl-3.5 leading-tight shrink-0">
            <span className="text-[8.5px] font-mono font-bold text-stone-500 uppercase tracking-wider">
              26 SET 2026
            </span>
            <strong className="text-base font-mono font-black text-stone-900 tracking-tight mt-0.5">
              02:03
            </strong>
          </div>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN HORIZONTAL DESKTOP WORKSPACE (NO HEIGHT LOCK, NATIVE SCROLL)      */}
      {/* ========================================================================= */}
      <main className={cn(
        "flex-1 w-full p-3 lg:p-4 gap-3.5 grid",
        activeNav === 'menu' 
          ? "grid-cols-[180px_1fr_235px]" 
          : "grid-cols-[180px_1fr]"
      )}>
        
        {/* ----------------------------------------------------------------------- */}
        {/* COMPACT LEFT SIDEBAR                                                    */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="bg-[#faf8f3]/95 border border-[#d8d0c5] rounded-3xl p-2.5 shadow-sm flex flex-col justify-between self-start sticky top-3 shrink-0">
          
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-2xl text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer group text-left relative",
                    isActive
                      ? "bg-gradient-to-r from-[#7c0b17] via-[#a31524] to-[#680812] text-white shadow-[0_4px_14px_rgba(124,11,23,0.35)] border border-red-900/60"
                      : "text-stone-700 hover:text-stone-950 hover:bg-white/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                      isActive ? "bg-white/20 text-white" : "bg-[#efe6db] text-[#8f101b]"
                    )}>
                      <Icon size={12} />
                    </div>
                    <span className="font-sans font-bold text-[10.5px]">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight 
                    size={13} 
                    className={cn(
                      "shrink-0 transition-transform",
                      isActive ? "text-white translate-x-0.5" : "text-stone-400 group-hover:text-stone-600"
                    )} 
                  />
                </button>
              );
            })}
          </nav>

          {/* Bottom Coffee Brand Promo Card */}
          <div className="mt-4 pt-3 border-t border-[#ded5c6]/60">
            <div className="relative rounded-2xl overflow-hidden border border-[#ded5c6] shadow-sm bg-stone-900 group h-[145px]">
              <img
                src={steamingCoffee}
                alt="Café Três Corações"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 text-left">
                <span className="text-[7.5px] font-mono font-bold tracking-widest text-[#f5d799] uppercase block mb-0.5">
                  CAFÉ TRÊS CORAÇÕES
                </span>
                <span className="text-[11px] font-black text-white leading-tight block drop-shadow-sm">
                  Mais que café,<br />movemos o Brasil.
                </span>
              </div>
            </div>
          </div>

        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER CONTENT COLUMN                                                   */}
        {/* ----------------------------------------------------------------------- */}
        <section className="min-w-0 flex flex-col">
          {activeNav === 'menu' ? (
            <DashboardInicioFuturistic onNavigate={handleItemClick} />
          ) : (
            <div id="main-scroll-container" className="bg-[#ede6dc] rounded-3xl min-h-full h-auto overflow-y-auto border border-[#ded5c6] shadow-sm relative z-10 p-3">
              {renderActiveModuleContent()}
            </div>
          )}
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT RAIL INDICATORS (RENDERED ON DASHBOARD VIEW)                      */}
        {/* ----------------------------------------------------------------------- */}
        {activeNav === 'menu' && (
          <aside className="flex flex-col gap-3.5 self-start sticky top-3 shrink-0">
            
            {/* Metric Card 1: OPERAÇÃO GLOBAL */}
            <article className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                  <span className="text-[#8f101b] text-sm">♥</span> OPERAÇÃO GLOBAL
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-300">
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="leading-tight text-left">
                  <span className="text-3xl font-black text-stone-900 font-mono tracking-tight block">100%</span>
                  <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5">
                    COBERTURA ATIVA DE PÁTIO E FROTA
                  </span>
                </div>
                <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xs border border-stone-200 shrink-0">
                  <img 
                    src={truckAsset} 
                    alt="Frota Ativa"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </article>

            {/* Metric Card 2: PROCESSAMENTO DA OPERAÇÃO */}
            <article className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                  <Settings size={13} className="text-[#8f101b]" /> PROCESSAMENTO DA OPERAÇÃO
                </div>
                <span 
                  onClick={() => handleItemClick('rotas')} 
                  className="px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-300 transition-colors cursor-pointer"
                >
                  EFICIÊNCIA ›
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 mt-1">
                <div className="leading-tight text-left">
                  <span className="text-3xl font-black text-stone-900 font-mono tracking-tight block">98%</span>
                  <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5">
                    PROCESSAMENTO DA OPERAÇÃO
                  </span>
                </div>
                {/* 3D Ascending Bars in warm amber/gold to red */}
                <div className="flex items-end gap-1.5 h-10 w-20 shrink-0 pr-1">
                  <div className="w-2.5 h-[35%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#dfb15b] shadow-xs" />
                  <div className="w-2.5 h-[50%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#dfb15b] shadow-xs" />
                  <div className="w-2.5 h-[65%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#dfb15b] shadow-xs" />
                  <div className="w-2.5 h-[80%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#dfb15b] shadow-xs" />
                  <div className="w-2.5 h-[100%] rounded-t-sm bg-gradient-to-t from-[#8f101b] to-[#b51e2c] shadow-xs" />
                </div>
              </div>
            </article>

            {/* Metric Card 3: ALOCAÇÃO DE ATIVOS */}
            <article 
              onClick={() => handleItemClick('escala')}
              className="bg-[#fffdfa] rounded-3xl border border-[#ded5c9] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[110px] cursor-pointer hover:border-stone-400 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-wider text-stone-900 font-sans">
                  <Settings size={13} className="text-[#8f101b]" /> ALOCAÇÃO DE ATIVOS
                </div>
                <ChevronRight size={14} className="text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider mb-2 text-left">
                DISTRIBUIÇÃO DA FROTA POR REGIÃO
              </div>
              <div className="w-full py-1.5 px-3 rounded-full bg-[#faeee6] border border-[#f0d4c3] flex items-center justify-between transition-colors group-hover:bg-[#f6e2d6]">
                <div className="w-5 h-5 rounded-full bg-[#8f101b] text-white flex items-center justify-center text-[10px]">
                  <MapPin size={11} />
                </div>
                <span className="text-[9px] font-bold text-[#8f101b]">Ver escala ›</span>
              </div>
            </article>

          </aside>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER BAR MATCHING USER DESIGN                                        */}
      {/* ========================================================================= */}
      <footer className="w-full h-8 px-5 bg-[#faf8f3]/95 border-t border-[#ded5c6] flex items-center justify-between text-xs text-stone-600 font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-bold text-stone-800">Café Três Corações</span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-600 font-sans text-[10px]">Do campo para o Brasil, com segurança.</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="text-[#8f101b] text-sm">♡</span>
        </div>
      </footer>

    </div>
  );
}
