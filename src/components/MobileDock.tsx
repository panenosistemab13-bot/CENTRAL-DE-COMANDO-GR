import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Users2, 
  Container, 
  ArrowLeft, 
  Sliders, 
  X, 
  ClipboardCheck, 
  FileCheck2, 
  CalendarDays, 
  Route, 
  Globe, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ICON_MAP } from '../data/pagesConfig';

interface MobileDockProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  appointmentsCount?: number;
  patioCount?: number;
  availablePages?: any[];
  pageVisibility?: Record<string, boolean>;
}

export function MobileBottomDock({ 
  activeTab, 
  onSelectTab, 
  appointmentsCount = 0, 
  patioCount = 0,
  availablePages = [],
  pageVisibility = {}
}: MobileDockProps) {
  const [showDrawer, setShowDrawer] = useState(false);

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
    },
    {
      id: 'drawer',
      label: 'Módulos',
      icon: Sliders,
      badge: null
    }
  ];

  const visiblePagesList = availablePages.filter(p => pageVisibility[p.id] !== false);

  return (
    <>
      {/* FLOATING MOBILE BOTTOM DOCK */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-3 flex justify-center md:hidden">
        <nav 
          className="pointer-events-auto w-full max-w-md bg-[#160a04]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] p-2 flex items-center justify-around ring-1 ring-white/10"
        >
          {tabs.map((tab) => {
            const isDrawerBtn = tab.id === 'drawer';
            const isActive = !isDrawerBtn && activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (isDrawerBtn) {
                    setShowDrawer(true);
                  } else {
                    onSelectTab(tab.id);
                  }
                }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative transition-all duration-200 cursor-pointer select-none min-h-[50px]",
                  isActive 
                    ? "bg-gradient-to-b from-[#B32025] to-[#780d11] text-white shadow-[0_4px_16px_rgba(179,32,37,0.6)] border border-white/20" 
                    : isDrawerBtn && showDrawer
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-[#d4bc96]/80 hover:text-[#f5ebd6] active:bg-white/5"
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.badge !== null && tab.badge > 0 && !isActive && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B32025] text-white text-[9px] font-bold flex items-center justify-center border border-[#160a04]">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className={cn(
                  "text-[10px] font-sans font-black tracking-wider uppercase mt-1 leading-none",
                  isActive ? "text-white" : "text-[#d4bc96]/90"
                )}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* MOBILE MODULES DRAWER BOTTOM SHEET */}
      <AnimatePresence>
        {showDrawer && (
          <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-full bg-gradient-to-br from-[#24130a] via-[#1a0c05] to-[#0d0502] border-t-2 border-amber-500/40 rounded-t-[2.5rem] p-5 text-[#f5ebd6] shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Sheet Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#B32025] flex items-center justify-center text-white shadow-md">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-sans font-black uppercase text-[#F5EFE6] leading-none">
                      Módulos do Sistema
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#c2a67e] mt-0.5">
                      Selecione para navegar
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid of Mobile Pages */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {visiblePagesList.map((page) => {
                  const isCurrent = activeTab === page.id;
                  const IconComp = ICON_MAP[page.iconName] || Sliders;

                  return (
                    <motion.button
                      key={page.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setShowDrawer(false);
                        onSelectTab(page.id);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all",
                        isCurrent
                          ? "bg-gradient-to-br from-[#B32025] to-[#780d11] border-white/30 text-white shadow-lg"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-[#f5ebd6]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shadow-md",
                          isCurrent ? "bg-white/20 text-white" : "bg-[#B32025]/30 text-[#e6c29b] border border-white/10"
                        )}>
                          <IconComp size={18} />
                        </div>
                        <ChevronRight size={14} className={isCurrent ? "text-white" : "text-[#c2a67e]"} />
                      </div>

                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#c2a67e] block">
                          {page.category || 'Módulo'}
                        </span>
                        <h4 className="text-sm font-sans font-black uppercase tracking-tight leading-tight mt-0.5">
                          {page.label}
                        </h4>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDrawer(false);
                  onSelectTab('menu');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#B32025] hover:bg-[#c02428] text-white font-sans font-black uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutGrid size={16} /> Voltar ao Menu Início
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface MobileTopBarProps {
  activeTab: string;
  onBack: () => void;
  onSelectTab: (tabId: string) => void;
  availablePages?: any[];
}

export function MobileTopBar({ activeTab, onBack, onSelectTab, availablePages = [] }: MobileTopBarProps) {
  const currentPage = availablePages.find(p => p.id === activeTab);

  const getTitle = () => {
    if (currentPage) return currentPage.label;
    switch (activeTab) {
      case 'presence': return 'Lista de Presença';
      case 'patio': return 'Gestão de Pátio';
      case 'checklist': return 'Checklist Frota';
      case 'averbacao': return 'Averbação de Cargas';
      case 'sm_creator': return 'SM & Eventos';
      case 'controle': return 'Controle Geral';
      case 'escala': return 'Conversor Escala';
      case 'rotas': return 'Mapeamento Rotas';
      case 'slides': return 'Command Center 4K';
      default: return 'Três Corações';
    }
  };

  const getSubtitle = () => {
    if (currentPage) return currentPage.category || 'App Mobile';
    switch (activeTab) {
      case 'presence': return 'Escala 12x36 & Efetivo';
      case 'patio': return 'Logística & Docas';
      case 'checklist': return 'Vistorias & Periféricos';
      case 'averbacao': return 'Apólices & Códigos';
      case 'sm_creator': return 'Solicitações de Monitoramento';
      case 'controle': return 'Baterias & Iscas';
      case 'escala': return 'Planilha Disponibilidade';
      case 'rotas': return 'Trajetos & Códigos';
      case 'slides': return 'Executive HUD 3D';
      default: return 'PGR Mobile';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#180e08]/95 backdrop-blur-xl border-b border-amber-500/30 px-3 py-2.5 flex items-center justify-between shadow-lg md:hidden">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/10 active:bg-white/20 text-[#f5ebd6] flex items-center justify-center border border-white/10 transition-colors cursor-pointer shrink-0"
          title="Voltar ao Início"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="font-sans text-sm font-black uppercase text-[#f5ebd6] leading-tight truncate">
            {getTitle()}
          </h1>
          <p className="text-[9px] font-mono uppercase text-[#c2a67e] tracking-wider leading-none truncate">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="px-2.5 py-1.5 rounded-xl bg-[#B32025] text-white text-[10px] font-sans font-black uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <LayoutGrid size={12} /> Início
        </button>
      </div>
    </header>
  );
}
