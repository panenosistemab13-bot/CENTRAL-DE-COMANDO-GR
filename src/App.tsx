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
  Package
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
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from './utils/principles';
import coffeeBg from './assets/images/coffee_rustic_bg_1780760486326.png';

type Tab = 'menu' | 'presence' | 'risk' | 'averbacao' | 'sm_creator' | 'rotas' | 'patio' | 'checklist';

const backgroundImages: Record<Tab, string> = {
  menu: '', // Empty for pure dark background
  presence: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=2070', // Notebook and coffee on rustic wood table
  risk: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=2070',
  averbacao: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&q=80&w=2070', // Coffee sacks stacked with rich roast beans
  sm_creator: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=2070', // Quality checker analyzing coffee beans
  rotas: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?auto=format&fit=crop&q=80&w=2070', // Scenic coffee plantation rows winding through green hills
  patio: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=2070', // Manual vintage grinder and mug on rustic dark background (matches attached design)
  checklist: 'https://images.unsplash.com/photo-1522012118064-2e650e89d2c2?auto=format&fit=crop&q=80&w=2070' // Vintage rustic coffee preparation mockup
};

const tabs = [
  { id: 'menu', label: 'Início', icon: LayoutGrid },
  { id: 'patio', label: 'Pátio', icon: Container },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: CalendarDays },
  { id: 'rotas', label: 'Rotas', icon: Route },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
];

export default function App() {
  const principle = useCurrentPrinciple();
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
          const currentIdx = tabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const prevIdx = (currentIdx - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevIdx].id as Tab);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIdx = tabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const nextIdx = (currentIdx + 1) % tabs.length;
            setActiveTab(tabs[nextIdx].id as Tab);
          }
        }
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
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `${day} de ${month}. de ${year} • ${time}`;
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

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
        return <Averbacao view={averbacaoView} onBack={() => setActiveTab('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} />;
      case 'rotas':
        return <Rotas />;
      case 'patio':
        return <Patio onBack={() => setActiveTab('menu')} />;
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

  return (
    <div className="min-h-screen md:h-screen flex bg-[#F2E4CC] text-[#2D1A10] md:overflow-hidden font-sans relative flex-col">
      
      {/* Immersive Background Image / Radial glow */}
      {(activeTab === 'menu' || activeTab === 'checklist') ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <img
             src={coffeeBg}
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
                  <img src="https://i.postimg.cc/HxkVgtSZ/Gemini-Generated-Image-ji8y90ji8y90ji8y.png" alt="Logo" className="w-full h-full object-cover scale-105" />
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
               <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full text-xs font-mono text-[#2D1A10] shadow-md">
                 <Clock size={14} className="text-[#B32025]" />
                 {formatDate(currentDateTime)}
               </div>
            </div>
          </header>
        )}

        {/* Scrollable Canvas */}
        <main id="main-scroll-container" className={cn(
          "flex-1 relative",
          activeTab === 'menu' ? "overflow-hidden" : "overflow-y-visible md:overflow-y-auto pb-24 md:pb-32"
        )}>
          <div className={cn(
            "w-full max-w-[1600px] mx-auto relative z-10 flex flex-col transition-all duration-500",
            activeTab === 'menu' ? "h-full p-0" : "min-h-full p-4 sm:p-8 md:p-12"
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
                className={activeTab === 'menu' ? "h-full" : "w-full origin-top scale-[0.93] md:scale-[0.88] transition-all duration-300"}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* System Footer (Only on active modules) */}
        {activeTab !== 'menu' && activeTab !== 'patio' && (
          <footer className="shrink-0 py-4 px-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-50 text-[10px] font-mono font-bold text-[#c7a482] bg-gradient-to-b from-[#1a0f08] to-[#0a0502] border-t border-[#4a2e1b]/50 shadow-[0_-4px_15px_rgba(0,0,0,0.5)]">
            <span className="opacity-80">
              © 2026 <strong className="text-[#e2c19e]">Sistema PGR</strong> - Todos os direitos reservados.
            </span>
            <div className="flex flex-col items-center max-w-lg md:max-w-3xl lg:max-w-4xl text-center px-4">
              <span className="text-[8px] font-mono tracking-widest text-[#cead80] uppercase mb-0.5 font-bold">Princípios de Liderança 3corações</span>
              <span className="font-sans font-black text-[#edd9bf] text-[10px] md:text-xs uppercase tracking-wide mb-1 leading-tight">{principle.title}</span>
              <p className="text-[9px] md:text-[10px] text-[#c7a482] font-semibold leading-relaxed italic">{principle.description}</p>
              <div className="flex gap-1 mt-1.5 opacity-80">
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
            <span className="opacity-80 text-center sm:text-right">
              Sistema Web • Criado por <span className="text-[#e2c19e] font-black">Jefferson Augusto</span>
            </span>
          </footer>
        )}

      </div>
    </div>
  );
}