/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InitialMenu from './components/InitialMenu';
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
  Unlock,
  Settings
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
import Checklist from './components/Checklist';
import Controle from './components/Controle';
import Escala from './components/Escala';
import Slides from './components/Slides';
import LoginScreen from './components/LoginScreen';
import RestrictedPagesModal from './components/RestrictedPagesModal';
import UpdateTopBanner from './components/UpdateTopBanner';
import { 
  PageDefinition, 
  getAllAvailablePages, 
  loadPageVisibility, 
  savePageVisibility, 
  saveStoredCustomPages,
  saveStoredPageOrder,
  getStoredCustomPages,
  getStoredPageOrder,
  saveFullPageConfigToFirebase,
  ICON_MAP 
} from './data/pagesConfig';
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from './utils/principles';
import { toAbsoluteUrl } from './utils/url';
import coffeeBg from './assets/images/coffee_rustic_bg_1780760486326.png';
import pgrShieldImg from './assets/images/pgr_shield_3d_1789796132107.jpg';
import pgrNightHighwayImg from './assets/images/pgr_night_highway_1789796143992.jpg';
import PgrCommandCenter from './components/PgrCommandCenter';
import PgrTacticalViews from './components/PgrTacticalViews';
import {
  Globe,
  Database,
  FileSpreadsheet,
  SunMedium,
  CloudSun,
  ShieldCheck,
  ChevronDown,
  Layers,
  MapPin,
  Bell,
  FileText,
  Radio,
  SlidersHorizontal,
  Home
} from 'lucide-react';

export type Tab = 
  | 'menu' 
  | 'slides' 
  | 'presence' 
  | 'risk' 
  | 'averbacao' 
  | 'sm_creator' 
  | 'rotas' 
  | 'patio' 
  | 'checklist' 
  | 'controle' 
  | 'escala'
  | 'mapa_riscos'
  | 'alertas'
  | 'relatorios'
  | 'monitoramento';

const backgroundImages: Record<Tab, string> = {
  menu: '', // Empty for pure dark background
  slides: '',
  presence: '/images/bg_presence.jpg', // Notebook and coffee on rustic wood table
  risk: '/images/bg_risk.jpg',
  averbacao: '',
  sm_creator: '/images/bg_sm_creator.jpg', // Quality checker analyzing coffee beans
  rotas: '/images/bg_rotas.jpg', // Scenic coffee plantation rows winding through green hills
  patio: '/images/bg_patio.jpg', // Manual vintage grinder and mug on rustic dark background (matches attached design)
  checklist: '/images/bg_checklist.jpg', // Vintage rustic coffee preparation mockup
  controle: '/images/bg_presence.jpg',
  escala: '/images/bg_patio.jpg',
  mapa_riscos: '/images/tactical_sat_map_8k.png',
  alertas: '/images/security_shield_core_8k.png',
  relatorios: '/images/bg_presence.jpg',
  monitoramento: '/images/semi_truck_heavy_8k.png'
};

const allTabs = [
  { id: 'menu', label: 'Início', icon: LayoutGrid },
  { id: 'slides', label: 'Slides 4K HUD', icon: Globe },
  { id: 'patio', label: 'Pátio', icon: Container },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: CalendarDays },
  { id: 'controle', label: 'Controle', icon: Sliders },
  { id: 'escala', label: 'Escala', icon: FileSpreadsheet },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'rotas', label: 'Rotas', icon: Route },
];

function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-3.5 h-3.5 bg-gradient-to-br from-[#e8cfb3] via-[#a37243] to-[#381f0b] rounded-full shadow-[1px_2px_3px_rgba(0,0,0,0.8),inset_0.5px_0.5px_1px_rgba(255,255,255,0.4)] border border-[#c49a6c]/40 relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2 h-[1.5px] bg-[#241306]/90 rotate-[38deg] rounded-sm shadow-inner" />
    </div>
  );
}

function NavCornerScrew({ position }: { position: 'tl' | 'bl' | 'tr' | 'br' }) {
  const posClasses = {
    tl: "top-1.5 left-2",
    bl: "bottom-1.5 left-2",
    tr: "top-1.5 right-2",
    br: "bottom-1.5 right-2"
  }[position];

  const slotRotation = {
    tl: "rotate-[35deg]",
    bl: "rotate-[55deg]",
    tr: "rotate-[-40deg]",
    br: "rotate-[25deg]"
  }[position];

  return (
    <div 
      className={cn(
        "absolute w-3 h-3 bg-gradient-to-br from-[#ebcca8] via-[#9e6d3c] to-[#361d09] rounded-full shadow-[1px_2px_3px_rgba(0,0,0,0.9),inset_0.5px_0.5px_1px_rgba(255,255,255,0.5)] border border-[#c49a6c]/40 flex items-center justify-center select-none pointer-events-none transition-all z-20",
        posClasses
      )}
    >
      <div className={cn("w-1.5 h-[1.2px] bg-[#241306]/90 rounded-sm shadow-inner", slotRotation)} />
    </div>
  );
}

export default function App() {
  const principle = useCurrentPrinciple();
  const [currentUser] = useState<{ email: string; name: string; role: string }>({
    email: 'admin@3coracoes.com.br',
    name: 'Administrador 3C',
    role: 'admin'
  });

  const [availablePages, setAvailablePages] = useState<PageDefinition[]>(() => getAllAvailablePages());
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(() => loadPageVisibility());

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showRestrictedPagesModal, setShowRestrictedPagesModal] = useState<boolean>(false);

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Dynamic visible tabs calculation
  const visibleTabs = [
    { id: 'menu', label: 'Início', icon: LayoutGrid },
    ...availablePages
      .filter(p => Boolean(pageVisibility[p.id]))
      .map(p => {
        const found = allTabs.find(t => t.id === p.id);
        const IconComponent = ICON_MAP[p.iconName] || found?.icon || Sliders;
        return {
          id: p.id,
          label: p.label,
          icon: IconComponent
        };
      })
  ];

  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [averbacaoView, setAverbacaoView] = useState<'generator' | 'codes'>('generator');
  const [smCreatorView, setSmCreatorView] = useState<'generator' | 'codes'>('generator');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Real-time synchronization of Restricted Pages Configuration across ALL devices
  useEffect(() => {
    const pagesConfigRef = ref(db, 'pages_config');
    const unsubscribe = onValue(pagesConfigRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { visibility, customPages, pageOrder } = data;

        if (customPages && Array.isArray(customPages)) {
          saveStoredCustomPages(customPages);
        }
        if (pageOrder && Array.isArray(pageOrder)) {
          saveStoredPageOrder(pageOrder);
        }
        if (visibility && typeof visibility === 'object') {
          savePageVisibility(visibility);
          setPageVisibility(visibility);
        }

        setAvailablePages(getAllAvailablePages());
      } else {
        // Initial setup if empty in Firebase RTDB
        const curVis = loadPageVisibility();
        const curCustom = getStoredCustomPages();
        const curOrder = getStoredPageOrder();
        saveFullPageConfigToFirebase(curVis, curCustom, curOrder);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts (Ctrl + Number / Cmd + Number) mapped dynamically to the numerical order in "Sugestão de Páginas Restritas"
      if (e.ctrlKey || e.metaKey) {
        let pressedNumber: number | null = null;
        if (e.key >= '1' && e.key <= '9') {
          pressedNumber = parseInt(e.key, 10);
        } else if (e.code && /^Digit[1-9]$/.test(e.code)) {
          pressedNumber = parseInt(e.code.replace('Digit', ''), 10);
        } else if (e.code && /^Numpad[1-9]$/.test(e.code)) {
          pressedNumber = parseInt(e.code.replace('Numpad', ''), 10);
        }

        if (pressedNumber !== null) {
          const targetIndex = pressedNumber - 1; // 1-indexed to 0-indexed position
          if (targetIndex >= 0 && targetIndex < availablePages.length) {
            e.preventDefault();
            const targetPage = availablePages[targetIndex];
            setActiveTab(targetPage.id as Tab);
            return;
          }
        } else if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          if (availablePages.length >= 10) {
            setActiveTab(availablePages[9].id as Tab);
          } else {
            setActiveTab('menu');
          }
          return;
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
  }, [activeTab, pageVisibility, visibleTabs, availablePages]);

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

  const handleOpenPageSelector = () => {
    setShowPasswordModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
      case 'mapa_riscos':
        return (
          <PgrCommandCenter 
            onNavigateTab={(id) => { setActiveTab(id as Tab); }} 
            onOpenSettings={handleOpenPageSelector}
          />
        );
      case 'alertas':
      case 'relatorios':
      case 'monitoramento':
        return (
          <PgrTacticalViews 
            view={activeTab} 
            onBack={() => setActiveTab('menu')} 
          />
        );
      case 'slides':
        return <Slides />;
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
      case 'checklist':
        return <Checklist />;
      case 'controle':
        return <Controle onBack={() => setActiveTab('menu')} />;
      case 'escala':
        return <Escala onBack={() => setActiveTab('menu')} />;
      default:
        return (
          <PgrCommandCenter 
            onNavigateTab={(id) => { setActiveTab(id as Tab); }} 
            onOpenSettings={handleOpenPageSelector}
          />
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim().toLowerCase();
    if (clean === '#trescafe2027' || clean === '#trescafe' || clean === 'trescafe' || clean === 'admin') {
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
      setShowRestrictedPagesModal(true);
    } else {
      setPasswordError(true);
    }
  };

  const formattedDate = currentDateTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const formattedTime = currentDateTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#040812] text-slate-100 overflow-hidden font-sans relative selection:bg-cyan-500/30">
      
      {/* 8K ULTRA HDR Cinematic Top Header (Exact Match to Reference Image) */}
      <header className="shrink-0 h-16 bg-[#060b14]/90 backdrop-blur-xl border-b border-cyan-500/20 px-3 sm:px-6 flex items-center justify-between z-50 relative select-none shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        
        {/* Left: 3D Shield Logo + PGR text + Prevenção Gestão Resultados */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('menu')}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-slate-900 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0 group-hover:scale-105 transition-transform">
            <img src={pgrShieldImg} alt="PGR 3D Shield" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-heading">
                PGR
              </span>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase leading-tight mt-0.5">
              Prevenção • Gestão • Resultados
            </span>
          </div>
        </div>

        {/* Center Widgets Group: User, Calendar, Weather */}
        <div className="hidden xl:flex items-center gap-3">
          
          {/* User Greeting Pill */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-black shadow-[0_0_10px_rgba(0,180,255,0.4)]">
              <User size={14} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">Olá, Jefferson</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">Gestão de Riscos</span>
            </div>
          </div>

          {/* Live Date & Time Pill */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Calendar size={14} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-medium leading-none">{capitalizedDate}</span>
              <span className="text-xs font-black text-white font-mono leading-tight mt-0.5 tracking-wider">{formattedTime}</span>
            </div>
          </div>

          {/* Weather Pill */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(255,170,0,0.3)]">
              <CloudSun size={15} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">22°C Santa Luzia - MG</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">Parcialmente nublado</span>
            </div>
          </div>

        </div>

        {/* Right Controls: Notifications & User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setActiveTab('alertas')}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
            title="Alertas Ativos (3)"
          >
            <Bell size={17} />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 border-2 border-slate-950 text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_#ff2233] animate-pulse">
              3
            </span>
          </button>

          {/* User Avatar Capsule */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 text-white text-xs font-black flex items-center justify-center shadow-md">
              JD
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">Jefferson</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-slate-200 cursor-pointer"
          >
            <Menu size={18} />
          </button>

        </div>

      </header>

      {/* Main Body Area: Left Navigation Sidebar + Content Canvas */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#050b14]/95 lg:bg-[#050b14]/85 backdrop-blur-2xl border-r border-cyan-500/20 p-3.5 flex flex-col justify-between transition-transform duration-300 select-none overflow-y-auto no-scrollbar shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col gap-1">
            
            {/* Main Nav Items (Exact match to reference design) */}
            {[
              { id: 'menu', label: 'Início', icon: Home },
              { id: 'mapa_riscos', label: 'Mapa de Riscos', icon: MapPin },
              { id: 'alertas', label: 'Alertas', icon: Bell, badge: '3' },
              { id: 'relatorios', label: 'Relatórios', icon: FileText },
              { id: 'monitoramento', label: 'Monitoramento', icon: Radio },
            ].map((item) => {
              const isActive = activeTab === item.id || (item.id === 'menu' && activeTab === 'menu');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group text-left",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(0,180,255,0.4)] border border-cyan-400 font-black"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon size={16} className={isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-300"} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-[10px] font-black text-white shadow-[0_0_8px_#ff2233]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Section Divider */}
            <div className="my-2 border-t border-slate-800/80 px-2 pt-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Módulos Operacionais
              </span>
            </div>

            {/* Operational Tabs (Escala, Checklist, Pátio, Averbação, etc.) */}
            {visibleTabs.filter(t => t.id !== 'menu').map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group text-left",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_18px_rgba(0,180,255,0.4)] border border-cyan-400 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  )}
                >
                  <tab.icon size={15} className={isActive ? "text-white" : "text-slate-500 group-hover:text-cyan-400"} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(true);
                setIsSidebarOpen(false);
              }}
              className="w-full mt-1 flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <Settings size={15} className="text-slate-500" />
              <span>Configurações</span>
            </button>

          </div>

          {/* Bottom Left Banner (Night highway photo) */}
          <div className="mt-4 rounded-2xl overflow-hidden border border-cyan-500/25 relative group shadow-lg">
            <img
              src={pgrNightHighwayImg}
              alt="PGR Segurança Rodoviária Noturna"
              className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-2.5 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-white leading-tight drop-shadow">
                Mais segurança para o seu patrimônio.
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-4 h-4 rounded overflow-hidden">
                  <img src={pgrShieldImg} alt="PGR Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-black text-cyan-300 uppercase tracking-wider">
                  PGR Prevenção
                </span>
              </div>
            </div>
          </div>

        </aside>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          />
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
          "flex-1 relative bg-[#040812] selection:bg-cyan-500/30",
          activeTab === 'menu' ? "overflow-hidden" : "overflow-y-auto pb-4 md:pb-8"
        )}>
          <div className={cn(
            "w-full max-w-full mx-auto relative z-10 flex flex-col transition-all duration-500",
            activeTab === 'menu' ? "h-full p-0" : "min-h-full p-3 sm:p-5 md:p-6"
          )}>
            {/* Operational Module HUD Header */}
            {activeTab !== 'menu' && activeTab !== 'mapa_riscos' && (
              <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md shadow-lg shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    ← Início
                  </button>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Módulo: <strong className="text-cyan-400 font-black">{activeTabInfo?.label || activeTab}</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    8K ULTRA RESOLUTION • LIVE HUD
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  activeTab === 'menu' ? "h-full" : "w-full transition-all duration-300"
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
                Digite a senha de administrador para gerenciar e sugerir as <strong className="text-[#800609]">Páginas Restritas e Ocultas</strong> do sistema.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const clean = passwordInput.trim().toLowerCase();
                if (clean === '#trescafe2027' || clean === '#trescafe' || clean === 'trescafe' || clean === 'admin') {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                  setPasswordError(false);
                  setShowRestrictedPagesModal(true);
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

      {/* Global Restricted Pages Suggestion & Configuration Modal */}
      <RestrictedPagesModal
        isOpen={showRestrictedPagesModal}
        onClose={() => setShowRestrictedPagesModal(false)}
        currentVisibility={pageVisibility}
        onSave={(newVisibility, updatedPages) => {
          setPageVisibility(newVisibility);
          setAvailablePages(updatedPages);
        }}
      />
    </div>
  );
}