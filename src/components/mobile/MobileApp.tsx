import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Truck, 
  FileSpreadsheet, 
  ClipboardCheck, 
  Menu, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  FileCheck2, 
  CalendarDays, 
  Radio, 
  Route, 
  Activity, 
  Lock, 
  LogOut, 
  Bell, 
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tab } from '../../types';
import { PageDefinition } from '../../data/pagesConfig';

import MobileMenu from '../MobileMenu';
import MobileEscala from './MobileEscala';
import MobilePatio from './MobilePatio';
import MobileChecklist from './MobileChecklist';
import MobilePresence from './MobilePresence';
import MobileAverbacao from './MobileAverbacao';
import MobileSMCreator from './MobileSMCreator';
import MobileControle from './MobileControle';
import MobileRotas from './MobileRotas';
import MobileSlides from './MobileSlides';

interface MobileAppProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  pageVisibility: Record<string, boolean>;
  availablePages: PageDefinition[];
  onOpenPageSelector: () => void;
  onLogout?: () => void;
  urgentAppointment?: any;
}

export default function MobileApp({
  activeTab,
  setActiveTab,
  pageVisibility,
  availablePages,
  onOpenPageSelector,
  onLogout,
  urgentAppointment
}: MobileAppProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getPageTitle = (tab: Tab) => {
    switch (tab) {
      case 'escala': return 'Escala & Terceiros';
      case 'patio': return 'Pátio de Veículos';
      case 'checklist': return 'Checklist da Frota';
      case 'presence': return 'Presença & 12x36';
      case 'averbacao': return 'Averbação de Carga';
      case 'sm_creator': return 'Criador de S.M.';
      case 'controle': return 'Controle de Iscas';
      case 'rotas': return 'Rotas & PGR';
      case 'slides': return 'Painel Executivo';
      default: return 'Três Corações';
    }
  };

  const navItems = [
    { id: 'menu' as Tab, label: 'Início', icon: LayoutGrid },
    { id: 'patio' as Tab, label: 'Pátio', icon: Truck },
    { id: 'escala' as Tab, label: 'Escala', icon: FileSpreadsheet },
    { id: 'checklist' as Tab, label: 'Checklist', icon: ClipboardCheck },
  ];

  const drawerModules = [
    { id: 'presence' as Tab, label: 'Presença & Escala 12x36', icon: Users, desc: 'Plantão, folgas e agenda corporativa' },
    { id: 'averbacao' as Tab, label: 'Averbação de Carga', icon: FileCheck2, desc: 'Apólices de seguro Porto Seguro e protocolos' },
    { id: 'sm_creator' as Tab, label: 'Criador de S.M.', icon: CalendarDays, desc: 'Solicitação de monitoramento para PGR' },
    { id: 'controle' as Tab, label: 'Controle de Iscas', icon: Radio, desc: 'Baterias e posições de telemetria' },
    { id: 'rotas' as Tab, label: 'Rotas & Pontos de Parada', icon: Route, desc: 'Distâncias, pedágios e credenciados' },
    { id: 'slides' as Tab, label: 'Painel Executivo', icon: Activity, desc: 'Métricas gerais e conformidade' }
  ];

  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#B32025]/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-[#800609]/20 rounded-full blur-[100px]" />
      </div>

      {/* TOP HEADER */}
      {activeTab !== 'menu' && (
        <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#160a04]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-xl flex items-center justify-between">
          <button
            onClick={() => navigateTo('menu')}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#f5ebd6] text-xs font-sans font-bold border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>

          <div className="text-center min-w-0 px-2">
            <span className="text-[9px] font-mono uppercase text-[#c2a67e] block truncate">
              Três Corações Mobile
            </span>
            <h2 className="text-sm font-sans font-black text-white uppercase truncate">
              {getPageTitle(activeTab)}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenPageSelector}
              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#c2a67e] border border-white/10"
              title="Restrições"
            >
              <Lock size={14} />
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10"
              title="Mais"
            >
              <Menu size={16} />
            </button>
          </div>
        </header>
      )}

      {/* URGENT APPOINTMENT BANNER */}
      {urgentAppointment && (
        <div className="relative z-30 mx-4 mt-2 p-3 rounded-2xl bg-gradient-to-r from-red-900/90 to-amber-900/90 border border-red-500/40 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-amber-300 animate-bounce" />
            <div className="text-xs">
              <span className="font-bold text-amber-200">Atenção: </span>
              <span>{urgentAppointment.title} ({urgentAppointment.time})</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('presence')}
            className="text-[10px] font-bold uppercase underline text-amber-300"
          >
            Ver
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="relative z-10 flex-1 w-full max-w-full overflow-x-hidden">
        {activeTab === 'menu' && (
          <MobileMenu
            onSelect={(id) => navigateTo(id as Tab)}
            pageVisibility={pageVisibility}
            availablePages={availablePages}
            onUnlockPresenceList={onOpenPageSelector}
            onLogout={onLogout}
          />
        )}

        {activeTab === 'escala' && <MobileEscala onBack={() => navigateTo('menu')} />}
        {activeTab === 'patio' && <MobilePatio onBack={() => navigateTo('menu')} />}
        {activeTab === 'checklist' && <MobileChecklist onBack={() => navigateTo('menu')} />}
        {activeTab === 'presence' && <MobilePresence onBack={() => navigateTo('menu')} />}
        {activeTab === 'averbacao' && <MobileAverbacao onBack={() => navigateTo('menu')} />}
        {activeTab === 'sm_creator' && <MobileSMCreator onBack={() => navigateTo('menu')} />}
        {activeTab === 'controle' && <MobileControle onBack={() => navigateTo('menu')} />}
        {activeTab === 'rotas' && <MobileRotas onBack={() => navigateTo('menu')} />}
        {activeTab === 'slides' && <MobileSlides onBack={() => navigateTo('menu')} />}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#160a04]/95 backdrop-blur-2xl border-t border-amber-500/20 px-3 py-2 shadow-2xl safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative min-w-[58px]",
                  isActive
                    ? "text-[#B32025]"
                    : "text-[#c2a67e]/70 hover:text-[#f5ebd6]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileTabActive"
                    className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="relative z-10" />
                <span className={cn(
                  "text-[10px] font-sans font-bold tracking-tight mt-1 relative z-10",
                  isActive ? "text-white" : "text-[#c2a67e]"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* "+ Mais" Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px]",
              drawerOpen || (!navItems.some(i => i.id === activeTab))
                ? "text-amber-400"
                : "text-[#c2a67e]/70 hover:text-[#f5ebd6]"
            )}
          >
            <Menu size={20} strokeWidth={drawerOpen ? 2.5 : 1.8} />
            <span className="text-[10px] font-sans font-bold tracking-tight mt-1 text-[#c2a67e]">
              Mais
            </span>
          </button>
        </div>
      </div>

      {/* MORE MODULES BOTTOM DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <div 
              className="absolute inset-0"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full bg-[#180c06] border-t-2 border-amber-500/40 rounded-t-[2.5rem] p-5 text-[#f5ebd6] max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 block">
                    Navegação Rápida
                  </span>
                  <h3 className="text-base font-sans font-black uppercase text-white">
                    Todos os Módulos do Sistema
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {drawerModules.map((mod) => {
                  const Icon = mod.icon;
                  const isCur = activeTab === mod.id;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => navigateTo(mod.id)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all border cursor-pointer",
                        isCur
                          ? "bg-[#B32025]/30 border-[#B32025] text-white"
                          : "bg-white/5 border-white/10 text-[#f5ebd6] hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-sans font-black uppercase text-white">
                            {mod.label}
                          </h4>
                          <p className="text-[10px] text-[#c2a67e]">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#c2a67e]" />
                    </button>
                  );
                })}
              </div>

              {/* Admin & Logout Section */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenPageSelector();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-[#c2a67e] hover:text-white text-xs font-sans font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lock size={15} />
                    <span>Gerenciar Páginas e Restrições</span>
                  </div>
                  <ChevronRight size={14} />
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-[#B32025]/20 border border-[#B32025]/40 text-red-300 text-xs font-sans font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Encerrar Sessão</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
