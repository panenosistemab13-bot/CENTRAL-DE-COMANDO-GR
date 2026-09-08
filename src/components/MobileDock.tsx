import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Users2, Container, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileDockProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  appointmentsCount?: number;
  patioCount?: number;
}

export function MobileBottomDock({ 
  activeTab, 
  onSelectTab, 
  appointmentsCount = 0, 
  patioCount = 0 
}: MobileDockProps) {
  const tabs = [
    { 
      id: 'menu', 
      label: 'Início', 
      icon: LayoutGrid, 
      badge: null 
    },
    { 
      id: 'presence', 
      label: 'Presença', 
      icon: Users2, 
      badge: appointmentsCount > 0 ? appointmentsCount : null 
    },
    { 
      id: 'patio', 
      label: 'Pátio', 
      icon: Container, 
      badge: patioCount > 0 ? patioCount : null 
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-3 flex justify-center md:hidden">
      <nav 
        className="pointer-events-auto w-full max-w-md bg-[#180e08]/95 backdrop-blur-xl border border-[#7a4f30]/60 rounded-3xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] p-1.5 flex items-center justify-around ring-1 ring-white/10"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-2xl relative transition-all duration-200 cursor-pointer select-none",
                isActive 
                  ? "bg-gradient-to-b from-[#B32025] to-[#780d11] text-white shadow-[0_4px_15px_rgba(179,32,37,0.5)] border border-white/20" 
                  : "text-[#d4bc96]/80 hover:text-[#f5ebd6] hover:bg-white/5"
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge !== null && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B32025] text-white text-[9px] font-bold flex items-center justify-center border border-[#180e08]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={cn(
                "text-[10px] font-serif font-black tracking-wider uppercase mt-1 leading-none",
                isActive ? "text-white" : "text-[#d4bc96]/90"
              )}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

interface MobileTopBarProps {
  activeTab: string;
  onBack: () => void;
  onSelectTab: (tabId: string) => void;
}

export function MobileTopBar({ activeTab, onBack, onSelectTab }: MobileTopBarProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'presence': return 'Lista de Presença';
      case 'patio': return 'Controle de Pátio';
      default: return 'Três Corações';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'presence': return 'Escala & Ponto';
      case 'patio': return 'Logística & Docas';
      default: return 'App Mobile';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#180e08]/95 backdrop-blur-md border-b border-[#7a4f30]/40 px-3 py-2.5 flex items-center justify-between shadow-md md:hidden">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/10 active:bg-white/20 text-[#f5ebd6] flex items-center justify-center border border-white/10 transition-colors cursor-pointer shrink-0"
          title="Voltar ao Início"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-serif text-sm font-black uppercase text-[#f5ebd6] leading-tight">
            {getTitle()}
          </h1>
          <p className="text-[9px] font-mono uppercase text-[#c2a67e] tracking-wider leading-none">
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* Quick Switch Pill between Presença and Pátio */}
      <div className="flex items-center bg-[#0e0704] p-1 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => onSelectTab('presence')}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-serif font-black uppercase tracking-wider transition-all cursor-pointer",
            activeTab === 'presence' 
              ? "bg-[#B32025] text-white shadow-sm" 
              : "text-[#c2a67e] hover:text-white"
          )}
        >
          Presença
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('patio')}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-serif font-black uppercase tracking-wider transition-all cursor-pointer",
            activeTab === 'patio' 
              ? "bg-[#B32025] text-white shadow-sm" 
              : "text-[#c2a67e] hover:text-white"
          )}
        >
          Pátio
        </button>
      </div>
    </header>
  );
}
