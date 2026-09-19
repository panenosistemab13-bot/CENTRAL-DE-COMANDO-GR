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
  Settings,
  Globe,
  Database,
  FileSpreadsheet,
  Cpu,
  Radio,
  Compass
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

export type Tab = 'menu' | 'slides' | 'presence' | 'risk' | 'averbacao' | 'sm_creator' | 'rotas' | 'patio' | 'checklist' | 'controle' | 'escala';

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
          const targetIndex = pressedNumber - 1;
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

      if (e.key === 'Backspace' && activeTab !== 'menu') {
        e.preventDefault();
        setActiveTab('menu');
        return;
      }

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

  const handleOpenPageSelector = () => {
    setShowPasswordModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
        return (
          <InitialMenu 
            onSelect={(id) => { setActiveTab(id as Tab); }} 
            focusedIndex={focusedCardIndex}
            setFocusedIndex={setFocusedCardIndex}
            pageVisibility={pageVisibility}
            availablePages={availablePages}
            onUnlockPresenceList={handleOpenPageSelector}
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
          <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <AlertOctagon className="w-12 h-12 mb-4 opacity-50" />
            <h2 className="text-xl font-mono font-bold tracking-tight text-slate-300 uppercase">Módulo Em Construção</h2>
            <p className="text-xs font-sans">Este módulo está integrado ao novo PGR Command Center 3D.</p>
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
    <div className="min-h-screen md:h-screen flex bg-[#070a12] text-slate-100 md:overflow-hidden font-sans relative flex-col">
      {/* Top Banner on Menu */}
      {activeTab === 'menu' && <UpdateTopBanner />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden relative z-10 min-h-screen md:h-full">
        
        {/* Desktop Top Header for Active Modules */}
        {activeTab !== 'menu' && (
          <header className="flex py-2.5 shrink-0 items-center justify-between px-4 sm:px-8 z-50 relative pointer-events-none w-full bg-slate-950/80 backdrop-blur-xl border-b border-sky-500/20 shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
            
            {/* Header Left Brand Label */}
            <div className="pointer-events-auto flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('menu')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                <LayoutGrid size={16} /> INÍCIO
              </button>
              <span className="text-slate-700">|</span>
              <span className="text-xs font-mono font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Cpu size={14} className="text-sky-400 animate-pulse" />
                PGR COMMAND CENTER 3D
              </span>
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-center pointer-events-auto max-w-full overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
                {visibleTabs.filter(t => t.id !== 'menu').map((tab) => {
                  const isActive = activeTab === tab.id;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer",
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)] font-black"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <IconComp size={15} />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Header Right Live Time */}
            <div className="pointer-events-auto hidden md:flex items-center gap-3 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="led-status led-status-green" /> ONLINE
              </span>
              <span>{currentDateTime.toLocaleTimeString('pt-BR')}</span>
            </div>
          </header>
        )}

        {/* ALERTA DE COMPROMISSOS GLOBAL */}
        {activeTodayApps.length > 0 && !isAlertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className={cn(
              "mx-4 sm:mx-8 md:mx-12 mt-3 relative rounded-2xl border shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 backdrop-blur-xl",
              maxUrgencyScore === 3
                ? "bg-rose-950/80 border-rose-500/60 text-rose-100 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                : maxUrgencyScore === 2
                  ? "bg-amber-950/80 border-amber-500/60 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                  : "bg-slate-900/90 border-sky-500/40 text-slate-100"
            )}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-mono font-bold text-lg border",
                maxUrgencyScore === 3 ? "bg-rose-500 text-slate-950 border-rose-300 animate-bounce" : "bg-sky-500/20 text-sky-400 border-sky-500/40"
              )}>
                <BellRing size={20} />
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {maxUrgencyScore === 3 ? "⚡ COMPROMISSO IMINENTE" : "📅 AGENDA OPERACIONAL"}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-300">
                    {maxUrgencyApp.time} - {maxUrgencyApp.title}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('presence')}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase transition-all shadow-md cursor-pointer"
              >
                Ver Agenda
              </button>
              <button
                onClick={() => setIsAlertDismissed(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
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
            "w-full max-w-full mx-auto relative z-10 flex flex-col transition-all duration-500",
            activeTab === 'menu' ? "h-full p-0" : "min-h-full p-2.5 sm:p-5 md:p-6 pb-28 md:pb-8"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  activeTab === 'menu' ? "h-full" : "w-full transition-all duration-300"
                )}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer for active modules */}
        {activeTab !== 'menu' && activeTab !== 'patio' && (
          <footer className="shrink-0 py-2 px-6 flex flex-row items-center justify-between gap-4 relative z-50 text-[10px] font-mono font-bold text-slate-400 bg-slate-950/90 border-t border-slate-800">
            <span>© 2026 SISTEMA PGR • COMMAND CENTER 3D</span>
            <span className="text-sky-400 uppercase">{principle.title}</span>
            <span>OPERADOR: <strong className="text-white">Jefferson Augusto</strong></span>
          </footer>
        )}

      </div>

      {/* Restricted Pages Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 border-2 border-sky-500/40 shadow-2xl rounded-3xl p-6 relative text-white"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400">
                <Lock size={22} />
              </div>

              <h3 className="text-xl font-mono font-black uppercase tracking-tight mb-2">
                Acesso Restrito
              </h3>

              <p className="text-xs font-sans text-slate-400 mb-4">
                Digite a senha do Administrador para alterar as páginas ativas do sistema.
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
                    "w-full bg-slate-950 text-white border rounded-xl px-4 py-2.5 text-center font-mono text-sm focus:outline-none transition-colors",
                    passwordError ? "border-rose-500" : "border-slate-700 focus:border-sky-400"
                  )}
                  autoFocus
                />

                {passwordError && (
                  <p className="text-rose-400 text-[10px] font-mono font-bold uppercase mt-2">
                    ⚠️ Senha Incorreta.
                  </p>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                      setPasswordError(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md transition-all cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Restricted Pages Configuration Modal */}
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
