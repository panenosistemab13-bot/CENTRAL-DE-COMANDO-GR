import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Truck,
  ClipboardCheck,
  FileCheck2,
  Share2,
  BarChart3,
  Calendar,
  Users2,
  MapPin,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Warehouse,
  Clock,
  TrendingUp,
  AlertTriangle,
  Info,
  Wrench,
  Lock,
  LogOut,
  CloudSun,
  Maximize2,
  Settings
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
import { PremiumBarChart, PremiumDonutChart, PremiumChart } from './charts';
import DashboardInicioFuturistic from './DashboardInicioFuturistic';

// High-definition cinematic image assets matching the reference
import heroLogistica from '../assets/images/cafe_tres_coracoes_terminal_hub_1790250325063.jpg';
import cctvYard from '../assets/images/cctv_cinematic_yard_1790214986048.jpg';
import sidebarTruck from '../assets/images/sidebar_truck_red_1790209039511.jpg';
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';
import truckHighwaySunset from '../assets/images/hero_truck_sunset_1789847050862.jpg';
import tacticalMapPin from '../assets/images/wallpaper_tactical_satellite_1790202511817.jpg';
import coffeeBeansBg from '../assets/images/coffee_beans_3d_1789847062486.jpg';

interface InitialMenuProps {
  onSelect: (id: string) => void;
  activeTab?: string;
  focusedIndex?: number;
  setFocusedIndex?: React.Dispatch<React.SetStateAction<number>>;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  onUnlockPresenceList: () => void;
  onLogout?: () => void;
  averbacaoView?: 'generator' | 'codes';
  smCreatorView?: 'generator' | 'codes';
}

export default function InitialMenu({
  onSelect,
  activeTab = 'menu',
  onUnlockPresenceList,
  onLogout,
  averbacaoView = 'generator',
  smCreatorView = 'generator',
}: InitialMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState(activeTab);
  const [movementTab, setMovementTab] = useState<'entradas' | 'saidas'>('entradas');
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

  // Sidebar navigation items matching reference exactly
  const sidebarItems = [
    { id: 'menu', label: 'Início', icon: Home, hasArrow: true },
    { id: 'checklist', label: 'Checklist', icon: ClipboardCheck, hasArrow: true },
    { id: 'averbacao', label: 'Averbação', icon: FileCheck2, hasArrow: false },
    { id: 'sm_creator', label: 'SM', icon: Share2, hasArrow: false },
    { id: 'controle', label: 'Controle', icon: BarChart3, hasArrow: false },
    { id: 'escala', label: 'Escala', icon: Calendar, hasArrow: false },
    { id: 'presence', label: 'Lista de Presença', icon: Users2, hasArrow: false },
    { id: 'rotas', label: 'Rotas', icon: MapPin, hasArrow: true },
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
    <div className="w-full h-screen max-h-screen flex flex-col bg-[#ede6dc] text-stone-900 font-sans select-none overflow-hidden relative max-w-[1920px] mx-auto">
      
      {/* Cinematic ivory/champagne gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5eee3] via-[#ede6dc] to-[#e4dcd0] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <header className="w-full h-15 px-4 sm:px-6 bg-[#ede6dc]/95 backdrop-blur-md border-b border-[#ded5c6] flex items-center justify-between shrink-0 z-30 relative shadow-sm">
        
        {/* Left: Brand Identity with 3 Corações Heart Logo */}
        <div 
          onClick={() => handleItemClick('menu')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Official 3 Corações Red Circle Heart Emblem */}
          <div className="w-10 h-10 rounded-full bg-[#9b1526] p-0.5 flex items-center justify-center shadow-md border-2 border-[#dfb15b] group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              {/* Outer Glow */}
              <circle cx="50" cy="50" r="46" fill="#9b1526" />
              {/* Gold Heart Graphic */}
              <path 
                d="M50 82 C50 82 20 60 20 38 C20 25 31 16 43 18 C47 19 50 22 50 22 C50 22 53 19 57 18 C69 16 80 25 80 38 C80 60 50 82 50 82 Z" 
                fill="#dfb15b" 
              />
              <path 
                d="M50 72 C50 72 26 54 26 38 C26 28 35 22 43 24 C46 25 50 28 50 28 C50 28 54 25 57 24 C65 22 74 28 74 38 C74 54 50 72 50 72 Z" 
                fill="#b81d2c" 
              />
              {/* Center Mini Gold Hearts */}
              <path 
                d="M44 48 C44 48 36 40 36 34 C36 30 39 27 42 28 C45 29 46 32 46 32 C46 32 47 29 50 28 C53 27 56 30 56 34 C56 40 48 48 44 48 Z" 
                fill="#ffd27d" 
                transform="scale(0.8) translate(12, 10)"
              />
              <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.5">
                3corações
              </text>
            </svg>
          </div>

          <div className="flex flex-col pl-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-stone-900 uppercase leading-none font-sans">
                SISTEMA OPERACIONAL
              </h1>
              <div className="flex items-center bg-[#9b1526] px-2.5 py-0.5 rounded-full border border-red-900/30 shadow-sm">
                <span className="text-[8.5px] font-mono font-black text-white tracking-tight">
                  1920x1080P + DUAL 4K
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-stone-500 tracking-[0.2em] uppercase mt-1 opacity-90">
              CONTROLE TÁTICO • GESTÃO • RESULTADOS
            </span>
          </div>
        </div>

        {/* Center: Search Capsule (Oval with soft cream background) */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-stone-800 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar no sistema de logística..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f5ee] hover:bg-white focus:bg-white border border-[#ded5c6] focus:border-stone-400 rounded-full py-2 pl-11 pr-10 text-xs text-stone-800 font-medium placeholder-stone-400 outline-none transition-all shadow-inner"
            />
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          </div>
        </div>

        {/* Right: Notifications, User Profile & Clock */}
        <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full bg-[#f8f5ee] hover:bg-white border border-[#ded5c6] flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all relative cursor-pointer shadow-sm"
              title="Notificações"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9b1526] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#ede6dc] shadow-xs">
                3
              </span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#dacfc2] rounded-2xl shadow-xl p-3 z-50 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-2">
                    <span className="font-bold uppercase tracking-wider text-stone-800">Alertas Recentes</span>
                    <span className="text-[10px] font-mono text-[#9b1526] font-bold">3 novos</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-[#9b1526] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-stone-800">Veículo 023 - Atraso na saída</p>
                        <p className="text-[10px] text-stone-500">Há 15 min • Pátio</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-stone-800">Checklist pendente - Veículo 017</p>
                        <p className="text-[10px] text-stone-500">Há 32 min • Checklist</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Capsule */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[#f8f5ee] hover:bg-white border border-[#ded5c6] transition-all cursor-pointer shadow-sm group"
            >
              <img
                src={avatarJefferson}
                alt="Jefferson Dias"
                className="w-7 h-7 rounded-full object-cover border border-stone-300 shadow-2xs"
              />
              <div className="hidden sm:flex flex-col text-left">
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
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#ded5c6] rounded-2xl shadow-xl p-2 z-50 text-xs"
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

          {/* Clock & Date */}
          <div className="hidden lg:flex flex-col items-end pl-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 tracking-tight leading-none">
              {formattedTime}
            </span>
            <span className="text-[10px] font-mono font-bold text-stone-500 mt-0.5 uppercase tracking-wider">
              {formattedDate}
            </span>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEWPORT CANVAS: LEFT SIDEBAR + CENTER + RIGHT SIDEBAR           */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden p-2.5 gap-2.5 relative z-10">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT SIDEBAR (LIGHT IVORY GLASS CONTAINER MATCHING REFERENCE IMAGE)     */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-48 lg:w-52 h-full flex flex-col justify-between shrink-0 select-none bg-[#fbf9f5]/90 backdrop-blur-md rounded-2xl p-2.5 border border-[#d6ccbe] shadow-sm overflow-hidden relative">
          
          {/* Navigation Links list */}
          <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar pr-0.5 relative z-10">
            {sidebarItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group text-left relative",
                    isActive
                      ? "bg-gradient-to-r from-[#9b1526] via-[#85111f] to-[#6d0d18] text-white shadow-md shadow-red-950/20 font-bold border border-red-800/80"
                      : "text-stone-800 hover:text-stone-950 hover:bg-white/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0",
                      isActive ? "bg-white/20 text-white" : "bg-[#9b1526]/10 text-[#9b1526]"
                    )}>
                      <Icon size={14} />
                    </div>
                    <span className="text-[12px] tracking-wide font-sans">
                      {item.label}
                    </span>
                  </div>
                  
                  {item.hasArrow && (
                    <ChevronRight 
                      size={13} 
                      className={cn(
                        "shrink-0 transition-transform",
                        isActive ? "text-white translate-x-0.5" : "text-stone-400 group-hover:text-stone-700"
                      )} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Slanted Truck Card */}
          <div className="mt-2 pt-2 border-t border-[#e7dac9] relative z-10">
            <div className="relative rounded-xl overflow-hidden border border-[#d6ccbe] shadow-sm bg-black group h-24">
              <img
                src={sidebarTruck}
                alt="Operação Integrada"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute bottom-2 left-2.5 right-2 flex flex-col">
                <span className="text-[9.5px] font-mono font-black tracking-widest text-white uppercase leading-tight">
                  OPERAÇÃO
                </span>
                <span className="text-[9.5px] font-mono font-black tracking-widest text-white uppercase leading-tight">
                  INTEGRADA
                </span>
                <span className="text-[9.5px] font-mono font-black tracking-widest text-[#dfb15b] uppercase leading-tight">
                  RESULTADOS
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] font-mono font-black tracking-widest text-white uppercase leading-tight">
                    REAIS
                  </span>
                  <span className="text-[9.5px] font-mono font-black tracking-wider text-red-500">
                    ////
                  </span>
                </div>
              </div>
            </div>
          </div>

        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER MAIN WORKSPACE CANVAS                                           */}
        {/* ----------------------------------------------------------------------- */}
        {activeNav === 'menu' ? (
          <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden p-2.5">
            <DashboardInicioFuturistic id="main-scroll-container" />
          </main>
        ) : (
          <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden p-2.5">
            <div id="main-scroll-container" className="bg-[#ede6dc] rounded-[32px] h-full overflow-y-auto border border-white/20 shadow-2xl relative z-10">
              {renderActiveModuleContent()}
            </div>
          </main>
        )}
      </div>

      {/* GLOBAL FOOTER (MATCHING REFERENCE IMAGE) */}
      <footer className="w-full h-7 px-4 sm:px-6 bg-[#ede6dc]/95 backdrop-blur-md border-t border-[#ded5c6] flex items-center justify-between text-[10px] font-mono text-stone-600 shrink-0 relative z-30">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#9b1526] flex items-center justify-center text-white text-[7px] font-black">
            ☕
          </div>
          <span className="font-bold text-stone-900">Café Três Corações</span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-600 font-medium">Sistema Operacional</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="font-bold text-stone-900">Sistema Online</span>
          </div>
          <span className="text-stone-400">v2.8.7</span>
          <button 
            type="button"
            onClick={onUnlockPresenceList}
            className="flex items-center gap-1 hover:text-stone-900 transition-colors cursor-pointer text-stone-600"
            title="Configurações"
          >
            <Settings size={11} className="text-stone-500" />
            <span>Configurações</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

