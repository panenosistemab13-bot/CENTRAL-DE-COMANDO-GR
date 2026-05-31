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
  ClipboardCheck
} from 'lucide-react';
import { cn } from './lib/utils';
import PresenceList from './components/PresenceList';
import Dashboard from './components/Dashboard';
import Averbacao from './components/Averbacao';
import SMCreator from './components/SMCreator';
import Rotas from './components/Rotas';
import Patio from './components/Patio';
import Envio from './components/Envio';
import Checklist from './components/Checklist';
import Iscas from './components/Iscas';

type Tab = 'menu' | 'presence' | 'risk' | 'averbacao' | 'sm_creator' | 'rotas' | 'patio' | 'checklist';

const backgroundImages: Record<Tab, string> = {
  menu: 'https://i.postimg.cc/G2DbBnz9/774375.jpg',
  presence: 'https://i.postimg.cc/CKXFLxCY/light-purple-light-reflecting-on-puddle-4pyniztjrjxrf42e.jpg',
  risk: 'https://i.postimg.cc/NMXQyvbh/neon-purple-4k-bt68lnajmpy3t8f8.jpg',
  averbacao: 'https://i.postimg.cc/cJ2s4LRz/neon-purple-4k-dl5i83z2j7nzkkth.jpg',
  sm_creator: 'https://i.postimg.cc/sXW3BCmb/neon-purple-4k-gfiyd4u9c96jn5lp.jpg',
  rotas: 'https://i.postimg.cc/1tFyg1MZ/papel-de-parede-adesivo-roxo-dark-12001-1-8efdb8f5551b52eaef2304f71b37ecb3.webp',
  patio: 'https://i.postimg.cc/G2DbBnz9/774375.jpg',
  checklist: 'https://i.postimg.cc/1tFyg1MZ/papel-de-parede-adesivo-roxo-dark-12001-1-8efdb8f5551b52eaef2304f71b37ecb3.webp'
};

const tabs = [
  { id: 'menu', label: 'Início', icon: LayoutGrid },
  { id: 'patio', label: 'Pátio', icon: Container },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: CalendarDays },
  { id: 'rotas', label: 'Sistema de rotas', icon: Route },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [averbacaoView, setAverbacaoView] = useState<'generator' | 'codes'>('generator');
  const [smCreatorView, setSmCreatorView] = useState<'generator' | 'codes'>('generator');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

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
      // Global Backspace to Return to Menu
      if (e.key === 'Backspace' && activeTab !== 'menu') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setActiveTab('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ' • ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderContent = () => {
    if (isMobile && activeTab === 'menu') {
      return <MobileMenu onSelect={(id) => setActiveTab(id as Tab)} />;
    }

    switch (activeTab) {
      case 'menu':
        return (
          <InitialMenu 
            onSelect={(id) => { setActiveTab(id as Tab); }} 
            focusedIndex={focusedCardIndex}
            setFocusedIndex={setFocusedCardIndex}
          />
        );
      case 'presence':
        return <PresenceList />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} />;
      case 'rotas':
        return <Rotas />;
      case 'patio':
        return <Patio />;
      case 'envio':
        return <Envio />;
      case 'checklist':
        return <Checklist />;
      case 'iscas':
        return <Iscas />;
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

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-300 overflow-hidden font-sans relative">
      
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab}
            src={backgroundImages[activeTab]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full object-cover mix-blend-screen"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 opacity-80" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 h-full">
        
        {/* Top Header - Immersive Neon Style */}
        <header className="h-20 flex items-center justify-between px-8 shrink-0 z-50 relative pointer-events-none">
          <div className="flex items-center gap-6 w-1/4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-pgr.png" 
                alt="Logo Sistema PGR" 
                className="h-8 w-auto object-contain" 
              />
              <div className="flex flex-col">
                <span className="logo-text">Sistema PGR</span>
                <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest mt-1 italic">SANTA LUZIA-MG</span>
              </div>
            </div>
          </div>

          {/* Centered Navigation */}
          <div className="flex-1 hidden lg:flex justify-center pointer-events-auto">
            <AnimatePresence>
              {activeTab !== 'menu' && (
                <motion.nav 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2 p-1.5 bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-xl"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveTab('menu')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-transparent hover:border-white/5"
                  >
                    <LayoutGrid size={20} />
                  </motion.button>
                  
                  <div className="w-[1px] h-6 bg-white/10 mx-1" />

                  {tabs.filter(t => t.id !== 'menu').map((tab) => {
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
                            ? "bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                            : "text-white/20 hover:text-white/40"
                        )}
                      >
                        <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        
                        {/* Tooltip */}
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 border border-white/10 rounded-md text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          {tab.label}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end gap-8 w-1/4 pointer-events-auto">
             {/* Dynamic Breadcrumb */}
             <AnimatePresence>
               {activeTab !== 'menu' && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="hidden sm:flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/40"
                 >
                    <span>PGR</span> 
                    <ChevronRight size={12} className="text-white/20" /> 
                    <motion.span 
                      key={activeTab}
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="text-primary"
                    >
                      {activeTabInfo?.label}
                    </motion.span>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl text-xs font-mono text-zinc-400 shadow-2xl">
               <Clock size={14} className="text-primary animate-pulse" />
               {formatDate(currentDateTime)}
             </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className={cn(
          "flex-1 relative",
          (activeTab === 'menu' && !isMobile) ? "overflow-hidden" : "overflow-y-auto pb-48"
        )}>
          <div className={cn(
            "w-full max-w-[1600px] mx-auto relative z-10 flex flex-col transition-all duration-500",
            (activeTab === 'menu' && !isMobile) ? "h-full p-0" : "min-h-full p-4 sm:p-8 md:p-12"
          )}>
            {activeTab !== 'menu' && (
               <motion.div 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
               >
                 <div>
                   <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                     {activeTabInfo?.label}
                   </h2>
                   <p className="text-zinc-500 text-xs sm:text-sm font-medium tracking-wide uppercase">{activeTabInfo?.id === 'menu' ? 'Navegação Central' : 'Módulo Ativo'}</p>
                 </div>

                 {isMobile && (
                   <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setActiveTab('menu')}
                     className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-2xl active:bg-zinc-800 transition-all"
                   >
                     <LayoutGrid size={18} className="text-primary" />
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
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* System Footer - Credits & Launch Date */}
        <footer className="shrink-0 py-4 px-8 border-t border-white/5 bg-zinc-950/60 backdrop-blur-md text-[10px] font-mono text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-2 relative z-50">
          <span>
            © 2026 Sistema PGR • Todos os direitos reservados.
          </span>
          <span className="text-center sm:text-right">
            Criado e desenvolvido por <span className="text-zinc-300 font-semibold uppercase tracking-wider">Jefferson Augusto</span> • Data de lançamento: <span className="text-zinc-400">21/05/2026</span>
          </span>
        </footer>

      </div>
    </div>
  );
}

