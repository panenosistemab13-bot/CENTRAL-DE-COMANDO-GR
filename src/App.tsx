/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InitialMenu from './components/InitialMenu';
import MobileMenu from './components/MobileMenu';
import {
  Users2,
  ShieldAlert,
  Activity,
  FileCheck2,
  CalendarDays,
  Route,
  BellRing,
  Container,
  LayoutGrid,
  Menu,
  X,
  ChevronRight,
  AlertOctagon,
  Clock,
  ClipboardCheck,
  Package,
  User,
  Briefcase,
  Calendar,
  Sliders,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from './lib/utils';
import { rtdb as db } from './firebase';
import { ref, onValue } from 'firebase/database';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}
import PresenceList from './components/PresenceList';
import Dashboard from './components/Dashboard';
import Averbacao from './components/Averbacao';
import SMCreator from './components/SMCreator';
import Rotas from './components/Rotas';
import Patio from './components/Patio';
import Envio from './components/Envio';
import Checklist from './components/Checklist';
import Iscas from './components/Iscas';
import Controle from './components/Controle';
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from './utils/principles';
import { toAbsoluteUrl } from './utils/url';
import coffeeBg from './assets/images/coffee_rustic_bg_1780760486326.png';

type Tab = 'menu' | 'presence' | 'risk' | 'averbacao' | 'sm_creator' | 'rotas' | 'patio' | 'checklist' | 'controle';

const backgroundImages: Record<Tab, string> = {
  menu: '', // Empty for pure dark background
  presence: '/images/bg_presence.jpg', // Notebook and coffee on rustic wood table
  risk: '/images/bg_risk.jpg',
  averbacao: '/images/bg_averbacao.jpg', // Coffee sacks stacked with rich roast beans
  sm_creator: '/images/bg_sm_creator.jpg', // Quality checker analyzing coffee beans
  rotas: '/images/bg_rotas.jpg', // Scenic coffee plantation rows winding through green hills
  patio: '/images/bg_patio.jpg', // Manual vintage grinder and mug on rustic dark background (matches attached design)
  checklist: '/images/bg_checklist.jpg', // Vintage rustic coffee preparation mockup
  controle: '/images/bg_presence.jpg'
};

const tabs = [
  { id: 'menu', label: 'Início', icon: LayoutGrid },
  { id: 'patio', label: 'Pátio', icon: Container },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: CalendarDays },
  { id: 'rotas', label: 'Rotas', icon: Route },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
  { id: 'controle', label: 'Controle', icon: Sliders },
];

function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

export default function App() {
  const principle = useCurrentPrinciple();
  const [showPresenceList, setShowPresenceList] = useState<boolean>(() => {
    return localStorage.getItem('show_presence_list') === 'true';
  });
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  const visibleTabs = tabs.filter(tab => tab.id !== 'presence' || showPresenceList);

  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [averbacaoView, setAverbacaoView] = useState<'generator' | 'codes'>('generator');
  const [smCreatorView, setSmCreatorView] = useState<'generator' | 'codes'>('generator');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  useEffect(() => {
    const appsRef = ref(db, 'presence_list/appointments');
    const unsubscribe = onValue(appsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAppointments(data);
      } else {
        setAppointments({});
      }
    });
    return () => unsubscribe();
  }, []);

  const getTodayStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getMinutesFromMidnight = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts (Ctrl + Number)
      if (e.ctrlKey) {
        switch (e.key) {
          case '1': e.preventDefault(); setActiveTab('patio'); return;
          case '2': e.preventDefault(); if (showPresenceList) setActiveTab('presence'); return;
          case '3': e.preventDefault(); setActiveTab('averbacao'); return;
          case '4': e.preventDefault(); setActiveTab('sm_creator'); return;
          case '5': e.preventDefault(); setActiveTab('rotas'); return;
          case '6': e.preventDefault(); setActiveTab('checklist'); return;
          case '7': e.preventDefault(); setActiveTab('controle'); return;
        }
      }

      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA' || 
                             document.activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      // Global Backspace to Return to Menu
      if (e.key === 'Backspace' && activeTab !== 'menu') {
        e.preventDefault();
        setActiveTab('menu');
        return;
      }

      // Arrow Up/Down for smooth main page scrolling
      if (e.key === 'ArrowDown') {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (scrollContainer) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: 180, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (scrollContainer) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: -180, behavior: 'smooth' });
        }
      }

      // Arrow Left/Right to transition to different page categories when not on the main menu carousel
      if (activeTab !== 'menu') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIdx = visibleTabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const prevIdx = (currentIdx - 1 + visibleTabs.length) % visibleTabs.length;
            setActiveTab(visibleTabs[prevIdx].id as Tab);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIdx = visibleTabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const nextIdx = (currentIdx + 1) % visibleTabs.length;
            setActiveTab(visibleTabs[nextIdx].id as Tab);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, showPresenceList, visibleTabs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `${day} de ${month}. de ${year} • ${time}`;
  };

  const activeTabInfo = visibleTabs.find(t => t.id === activeTab);

  const renderContent = () => {
    if (isMobile && activeTab === 'menu') {
      return (
        <MobileMenu 
          onSelect={(id) => setActiveTab(id as Tab)} 
          showPresenceList={showPresenceList}
          onUnlockPresenceList={() => setShowPasswordModal(true)}
        />
      );
    }

    switch (activeTab) {
      case 'menu':
        return (
          <InitialMenu 
            onSelect={(id) => { setActiveTab(id as Tab); }} 
            focusedIndex={focusedCardIndex}
            setFocusedIndex={setFocusedCardIndex}
            showPresenceList={showPresenceList}
            onUnlockPresenceList={() => setShowPasswordModal(true)}
          />
        );
      case 'presence':
        return <PresenceList onBack={() => setActiveTab('menu')} />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} onBack={() => setActiveTab('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} onBack={() => setActiveTab('menu')} />;
      case 'rotas':
        return <Rotas onBack={() => setActiveTab('menu')} />;
      case 'patio':
        return <Patio onBack={() => setActiveTab('menu')} />;
      case 'envio':
        return <Envio />;
      case 'checklist':
        return <Checklist />;
      case 'iscas':
        return <Iscas />;
      case 'controle':
        return <Controle onBack={() => setActiveTab('menu')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
            <AlertOctagon className="w-12 h-12 mb-4 opacity-50" />
            <h2 className="text-xl font-medium tracking-tight text-zinc-300">Em Desenvolvimento</h2>
            <p className="text-sm">Este módulo está sendo refatorado para o novo padrão de design.</p>
          </div>
        );
    }
  };

  const todayStr = getTodayStr(currentDateTime);
  const currentMinutes = currentDateTime.getHours() * 60 + currentDateTime.getMinutes();

  const todayAppointments = (Object.values(appointments || {}) as Appointment[])
    .filter(app => app && app.date === todayStr)
    .map(app => {
      const appMinutes = getMinutesFromMidnight(app.time);
      const diff = appMinutes - currentMinutes;
      
      let urgency: 'critical' | 'warning' | 'info' | 'past' = 'info';
      let urgencyScore = 1;

      if (diff < -15) {
        urgency = 'past';
        urgencyScore = 0;
      } else if (diff >= -15 && diff <= 0) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 0 && diff <= 30) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 30 && diff <= 120) {
        urgency = 'warning';
        urgencyScore = 2;
      } else {
        urgency = 'info';
        urgencyScore = 1;
      }

      return {
        ...app,
        diff,
        urgency,
        urgencyScore
      };
    })
    .sort((a, b) => {
      if (a.urgencyScore !== b.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return a.time.localeCompare(b.time);
    });

  const activeTodayApps = todayAppointments.filter(app => app.urgency !== 'past');
  const maxUrgencyApp = activeTodayApps[0];
  const maxUrgencyScore = maxUrgencyApp ? maxUrgencyApp.urgencyScore : 0;

  return (
    <div className="min-h-screen md:h-screen flex bg-[#F2E4CC] text-[#2D1A10] md:overflow-hidden font-sans relative flex-col">
      
      {/* Immersive Background Image / Radial glow */}
      {(activeTab === 'menu' || activeTab === 'checklist') ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <img
             src={toAbsoluteUrl(coffeeBg)}
             className="w-full h-full object-cover select-none brightness-105 saturate-110"
             alt="Dashboard Coffee Background"
             referrerPolicy="no-referrer"
           />
           {/* Cinematic warm light glow overlays */}
           <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(181, 138, 76, 0.15) 0%, rgba(242, 228, 204, 0.45) 100%)' }} />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            {backgroundImages[activeTab] && (
              <motion.img
                key={activeTab}
                src={backgroundImages[activeTab]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.92, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.5 }}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          {/* Immersive warm chocolate/dark vignette to integrate the page element contrast beautifully */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 20%, rgba(45, 26, 16, 0.4) 100%)' }} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden relative z-10 min-h-screen md:h-full">
        
        {/* Top Header (Only on active modules) */}
        {activeTab !== 'menu' && (
          <header className="h-20 shrink-0 flex items-center justify-between px-8 z-50 relative pointer-events-none">
            <div className={cn("hidden md:flex items-center gap-6 w-1/4 pointer-events-auto", activeTab === 'averbacao' ? "opacity-0 invisible" : "")}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#cead80] bg-[#800609] flex items-center justify-center shrink-0 shadow-lg shadow-black/30">
                  <img src="/logo-pgr.png" alt="Logo" className="w-full h-full object-cover scale-105" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-widest text-[#3A2414] leading-none font-serif">SISTEMA PGR</span>
                  <span className="text-[10px] font-black text-[#B32025] uppercase tracking-[0.2em] mt-1.5 leading-none">
                    SANTA LUZIA / MG
                  </span>
                </div>
              </div>
            </div>

            {/* Centered Navigation */}
            <div className="flex-1 hidden lg:flex justify-center pointer-events-auto">
              <AnimatePresence>
                <motion.nav 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2 p-1.5 bg-[#3A2414] border-2 border-[#C7A26A]/50 rounded-2xl shadow-xl relative"
                >
                  {/* Miniature decorative brass rivets */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md border border-[#C7A26A]/40" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md border border-[#C7A26A]/40" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md border border-[#C7A26A]/40" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md border border-[#C7A26A]/40" />

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveTab('menu')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#6B4423] text-[#C7A26A] hover:text-white transition-all border border-transparent hover:border-white/5"
                  >
                    <LayoutGrid size={20} />
                  </motion.button>
                  
                  <div className="w-[1px] h-6 bg-[#C7A26A]/20 mx-1" />

                  {visibleTabs.filter(t => t.id !== 'menu').map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={cn(
                          "relative p-2.5 rounded-xl transition-all duration-300 group",
                          isActive 
                            ? "bg-[#B32025] text-white shadow-[0_4px_12px_rgba(179,32,37,0.35)] border border-[#ff3e47]/20" 
                            : "text-[#C7A26A] hover:bg-[#6B4423]/50 hover:text-[#fddcb4]"
                        )}
                      >
                        <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        
                        {/* Tooltip */}
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#3A2414] border border-[#C7A26A]/30 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#fdefd1] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                          {tab.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.nav>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-end gap-8 w-1/4 pointer-events-auto">
               {/* Dynamic Breadcrumb */}
               <AnimatePresence>
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="hidden sm:flex items-center gap-3 px-6 py-2 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#3a1d0f] shadow-sm"
                 >
                    <span>PGR</span> 
                    <ChevronRight size={12} className="text-[#3A2414]/40" /> 
                    <motion.span 
                      key={activeTab}
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[#B32025]"
                    >
                      {activeTabInfo?.label}
                    </motion.span>
                 </motion.div>
               </AnimatePresence>

               {/* Clock Box */}
               <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full text-[10px] leading-[14px] font-mono text-[#2D1A10] shadow-md">
                 <Clock size={14} className="text-[#B32025]" />
                 {formatDate(currentDateTime)}
               </div>
            </div>
          </header>
        )}

        {/* ALERTA DE COMPROMISSOS GLOBAL */}
        {activeTodayApps.length > 0 && !isAlertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className={cn(
              "mx-4 sm:mx-8 md:mx-12 mt-4 relative rounded-2xl border-2 shadow-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 transition-all duration-300",
              maxUrgencyScore === 3
                ? "bg-gradient-to-r from-[#800609] via-[#B32025] to-[#800609] text-white border-[#ffd880] shadow-[0_0_25px_rgba(179,32,37,0.55)]"
                : maxUrgencyScore === 2
                  ? "bg-gradient-to-r from-[#d97706] to-[#b45309] text-white border-[#fbd38d] shadow-[0_10px_20px_rgba(217,119,6,0.25)]"
                  : "bg-[#fdfbf7] border-[#5c3e29] text-[#3e2516] shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
            )}
          >
            {/* Vintage brass flat-head screws on corners */}
            <Screw className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5" />

            {/* Content left */}
            <div className="flex items-center gap-4.5 flex-1 min-w-0">
              <div className={cn(
                "w-12 h-12 rounded-xl shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden",
                maxUrgencyScore === 3
                  ? "bg-amber-400 text-[#800609] animate-bounce"
                  : maxUrgencyScore === 2
                    ? "bg-[#3A2414] text-amber-400 animate-pulse"
                    : "bg-[#B32025] text-white"
              )}>
                {maxUrgencyScore === 3 ? (
                  <ShieldAlert size={24} className="stroke-[2.5]" />
                ) : (
                  <BellRing size={22} className="stroke-[2]" />
                )}
                
                {/* Visual pulse rings for critical status */}
                {maxUrgencyScore === 3 && (
                  <span className="absolute inset-0 bg-amber-300/30 animate-ping rounded-full pointer-events-none" />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm border",
                    maxUrgencyScore === 3
                      ? "bg-[#ffeb3b] text-[#800609] border-[#ffeb3b]"
                      : maxUrgencyScore === 2
                        ? "bg-[#3A2414] text-amber-400 border-amber-400/20"
                        : "bg-[#5c3e29] text-[#fdefd1] border-[#5c3e29]"
                  )}>
                    {maxUrgencyScore === 3 
                      ? "⚡ COMPROMISSO IMINENTE / EM ANDAMENTO" 
                      : maxUrgencyScore === 2 
                        ? "⏰ COMPROMISSO PRÓXIMO" 
                        : "📅 COMPROMISSO HOJE"}
                  </span>

                  {maxUrgencyApp.diff > 0 && (
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                      maxUrgencyScore === 3
                        ? "bg-black/25 text-[#ffe082]"
                        : maxUrgencyScore === 2
                          ? "bg-black/15 text-white"
                          : "bg-[#e1ccb0] text-[#3e2516]"
                    )}>
                      {maxUrgencyApp.diff <= 60 
                        ? `Começa em ${maxUrgencyApp.diff} min` 
                        : `Começa em ${Math.floor(maxUrgencyApp.diff / 60)}h${maxUrgencyApp.diff % 60}m`}
                    </span>
                  )}

                  {maxUrgencyApp.diff <= 0 && maxUrgencyApp.diff >= -15 && (
                    <span className="text-[10px] font-black uppercase bg-green-500 text-white px-2 py-0.5 rounded animate-pulse shadow-sm">
                      Acontecendo Agora
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5">
                  <h3 className={cn(
                    "text-sm font-black tracking-tight truncate font-serif uppercase",
                    maxUrgencyScore === 3 ? "text-white text-base font-black" : "text-[#3e2516]"
                  )}>
                    {maxUrgencyApp.title}
                  </h3>
                  <span className={cn(
                    "hidden sm:inline opacity-40",
                    maxUrgencyScore === 3 ? "text-white" : "text-[#5c3e29]"
                  )}>•</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 flex items-center gap-1",
                      maxUrgencyScore === 3 ? "text-amber-200" : "text-[#5c3e29] bg-[#f2e4cc]/40"
                    )}>
                      <Clock size={11} />
                      {maxUrgencyApp.time}
                    </span>
                    
                    {maxUrgencyApp.type === 'pessoal' ? (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1",
                        maxUrgencyScore === 3 
                          ? "bg-amber-400/20 text-amber-200 border-amber-400/30" 
                          : maxUrgencyScore === 2
                            ? "bg-amber-100/10 text-amber-200 border-amber-200/20"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        <User size={10} />
                        Pessoal
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1",
                        maxUrgencyScore === 3 
                          ? "bg-red-950/40 text-red-100 border-red-200/30" 
                          : maxUrgencyScore === 2
                            ? "bg-red-100/10 text-red-200 border-red-200/20"
                            : "bg-red-50 text-[#B32025] border-red-200"
                      )}>
                        <Briefcase size={10} />
                        Corporativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Close / Manage) */}
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setActiveTab('presence');
                  setTimeout(() => {
                    const agendaSection = document.getElementById('main-scroll-container');
                    agendaSection?.scrollTo({ top: 300, behavior: 'smooth' });
                  }, 400);
                }}
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl border transition-all cursor-pointer shadow-md active:scale-97 flex items-center gap-1.5",
                  maxUrgencyScore === 3
                    ? "bg-[#ffeb3b] hover:bg-yellow-300 text-[#800609] border-[#ffeb3b]"
                    : maxUrgencyScore === 2
                      ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                      : "bg-[#B32025] hover:bg-[#8c060a] text-white border-[#B32025]"
                )}
              >
                <Calendar size={13} />
                Ver Agenda
                <ChevronRight size={13} />
              </button>
              
              <button
                onClick={() => setIsAlertDismissed(true)}
                className={cn(
                  "p-2.5 rounded-xl transition-colors cursor-pointer",
                  maxUrgencyScore >= 2
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-[#5c3e29]/70 hover:text-[#5c3e29] hover:bg-[#5c3e29]/10"
                )}
                title="Dispensar alerta temporariamente"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Scrollable Canvas */}
        <main id="main-scroll-container" className={cn(
          "flex-1 relative",
          activeTab === 'menu' ? "overflow-hidden" : "overflow-y-visible md:overflow-y-auto pb-4 md:pb-8"
        )}>
          <div className={cn(
            "w-full max-w-[102rem] mx-auto relative z-10 flex flex-col transition-all duration-500",
            activeTab === 'menu' ? "h-full p-0" : "min-h-full p-4 sm:p-6 md:p-8"
          )}>
            {activeTab !== 'menu' && activeTab !== 'patio' && activeTab !== 'presence' && activeTab !== 'averbacao' && (
               <motion.div 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
               >
                 <div>
                   <h2 className="text-4xl sm:text-5xl font-black text-[#3A2414] tracking-tight uppercase mb-2 font-serif filter drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,0.85)]">
                     {activeTabInfo?.label}
                   </h2>
                   <p className="text-[#6B4423]/80 text-xs sm:text-sm font-black tracking-widest uppercase">{activeTabInfo?.id === 'menu' ? 'Navegação Central' : 'Módulo Ativo'}</p>
                 </div>

                 {isMobile && (
                   <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setActiveTab('menu')}
                     className="flex items-center justify-center gap-3 px-6 py-4 bg-[#B32025] hover:bg-[#8c060a] border-2 border-[#8c060a] rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg transition-all cursor-pointer"
                   >
                     <LayoutGrid size={18} className="text-white" />
                     <span>Voltar ao Menu</span>
                   </motion.button>
                 )}
               </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  activeTab === 'menu' ? "h-full" : "w-full transition-all duration-300",
                  activeTab === 'controle' && "origin-top scale-[0.85] xl:scale-[0.80]"
                )}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Floating trigger widget when dismissed */}
        {activeTodayApps.length > 0 && isAlertDismissed && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsAlertDismissed(false)}
            className={cn(
              "fixed bottom-22 right-6 z-50 p-4.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.55)] cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2",
              maxUrgencyScore === 3
                ? "bg-[#B32025] text-white border-amber-300 shadow-[0_0_20px_rgba(179,32,37,0.6)]"
                : maxUrgencyScore === 2
                  ? "bg-amber-600 text-white border-[#fbd38d] shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                  : "bg-[#5c3e29] text-[#efdfc6] border-[#dac0a3]"
            )}
            title={`Você possui ${activeTodayApps.length} compromisso(s) pendente(s) hoje. Clique para abrir.`}
          >
            <div className="relative">
              <BellRing size={24} className={cn("stroke-[2]", maxUrgencyScore === 3 ? "animate-pulse" : "")} />
              <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-[#800609] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                {activeTodayApps.length}
              </span>
            </div>
          </motion.button>
        )}

        {/* System Footer (Only on active modules) */}
        {activeTab !== 'menu' && activeTab !== 'patio' && (
          <footer className="shrink-0 py-2 px-6 flex flex-row items-center justify-between gap-4 relative z-50 text-[10px] font-mono font-bold text-[#c7a482] bg-gradient-to-b from-[#1a0f08] to-[#0a0502] border-t border-[#4a2e1b]/50 shadow-[0_-4px_15px_rgba(0,0,0,0.5)]">
            <span className="opacity-80 flex-1 hidden sm:block">
              © 2026 <strong className="text-[#e2c19e]">Sistema PGR</strong>
            </span>
            <div className="flex flex-col items-center justify-center flex-[2] text-center px-2">
              <span className="font-sans font-black text-[#edd9bf] text-[9px] sm:text-[10px] uppercase tracking-wide leading-tight">
                {principle.title}
              </span>
              <div className="flex gap-1 mt-1 opacity-80">
                {PRINCIPLES_OF_LEADERSHIP.map((item, idx) => {
                  const isActive = idx === PRINCIPLES_OF_LEADERSHIP.indexOf(principle);
                  return (
                    <span 
                      key={idx} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[#B32025] scale-125 shadow-[0_0_4px_#B32025]' : 'bg-[#c7a482]/40'}`}
                      title={item.title} 
                    />
                  );
                })}
              </div>
            </div>
            <span className="opacity-80 flex-1 text-right">
              <span className="hidden sm:inline">Criado por </span><span className="text-[#e2c19e] font-black">Jefferson</span>
            </span>
          </footer>
        )}

      </div>

      {/* Global Password Modal Overlay */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-gradient-to-br from-[#dfcbab] via-[#cbaf8c] to-[#ae926e] border-[5px] border-[#311f14] shadow-2xl rounded-3xl p-6 relative ring-4 ring-[#1c1109]/30 text-[#2D1A10]"
          >
            {/* Corner rivets */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-md" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-md" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-md" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-md" />

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-14 h-14 rounded-full bg-[#311f14] flex items-center justify-center mb-4 border-2 border-[#bfa27a] text-[#fdefd1] shadow-lg">
                <Lock size={24} className="stroke-[2.5]" />
              </div>
              
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-[#2D1A10] mb-2">
                Acesso Restrito
              </h3>

              <p className="text-xs font-bold text-[#3c2518]/90 max-w-xs mb-4 leading-relaxed">
                Digite a senha de administrador para alternar a exibição da página <strong className="text-[#800609]">Lista de Presença</strong> no menu principal.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === '#trescafe27') {
                  const newShowValue = !showPresenceList;
                  setShowPresenceList(newShowValue);
                  localStorage.setItem('show_presence_list', String(newShowValue));
                  setShowPasswordModal(false);
                  setPasswordInput('');
                  setPasswordError(false);
                } else {
                  setPasswordError(true);
                }
              }} className="w-full">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Digite a senha..."
                  className={cn(
                    "w-full bg-[#1c1109] text-[#fdefd1] placeholder-[#8c6039]/60 border-2 rounded-xl px-4 py-3 text-center font-mono tracking-widest focus:outline-none transition-colors",
                    passwordError 
                      ? "border-[#B32025] text-red-400" 
                      : "border-[#8c6039] focus:border-[#B32025]"
                  )}
                  autoFocus
                />
                
                {passwordError && (
                  <p className="text-red-700 text-[10px] font-black uppercase tracking-wider mt-1.5 animate-pulse">
                    ⚠️ Senha Incorreta! Tente novamente.
                  </p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                      setPasswordError(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-black/10 hover:bg-black/20 text-[#2D1A10] font-black uppercase text-xs tracking-wider transition-colors border border-[#311f14]/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:brightness-110 text-white font-black uppercase text-xs tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}