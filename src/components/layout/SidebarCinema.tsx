import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  BarChart3, 
  ShoppingBag, 
  Users2, 
  Package, 
  FileText, 
  Settings, 
  ChevronRight, 
  Radio,
  Sliders,
  CheckCircle2,
  Container,
  Route,
  Calendar
} from 'lucide-react';
import LogoABCafe3D from '../3d/LogoABCafe3D';
import SidebarCoffeeVisual from '../3d/SidebarCoffeeVisual';

export interface NavItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'menu', label: 'Início', sublabel: 'Visão geral', icon: LayoutGrid },
  { id: 'patio', label: 'Pátio', sublabel: 'Gestão de terminal', icon: Container },
  { id: 'checklist', label: 'Checklist', sublabel: 'Vistoria veicular', icon: Package },
  { id: 'averbacao', label: 'Averbação', sublabel: 'Cargas e registros', icon: FileText },
  { id: 'sm_creator', label: 'Solicitação SM', sublabel: 'Monitoramento', icon: Radio },
  { id: 'controle', label: 'Controle', sublabel: 'PGR & Tático', icon: Sliders },
  { id: 'escala', label: 'Escala', sublabel: 'Disponibilidade', icon: Calendar },
  { id: 'presence', label: 'Presença', sublabel: 'Equipe em campo', icon: Users2 },
  { id: 'rotas', label: 'Rotas', icon: Route, sublabel: 'Trajetos & ETAs' },
  { id: 'config', label: 'Ajustes', sublabel: 'Configurações', icon: Settings },
];

interface SidebarCinemaProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  onOpenSettingsModal?: () => void;
}

export default function SidebarCinema({
  activeTab,
  onSelectTab,
  onOpenSettingsModal
}: SidebarCinemaProps) {
  return (
    <aside className="w-64 lg:w-72 shrink-0 bg-gradient-to-b from-[#140b07] via-[#1a0f09] to-[#0f0805] border-r border-[#e2ba61]/25 flex flex-col justify-between relative z-30 shadow-[10px_0_30px_rgba(0,0,0,0.85)] select-none">
      {/* 1. TOP LOGO SECTION */}
      <div className="pt-4 pb-3 border-b border-[#3d2314] px-4">
        <LogoABCafe3D />
      </div>

      {/* 2. NAVIGATION MENU ITEMS */}
      <div className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'config') {
                  if (onOpenSettingsModal) onOpenSettingsModal();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'btn-3d-gold'
                  : 'bg-[#1b1008]/60 hover:bg-[#28170d] border border-[#3d2314]/80 hover:border-[#e2ba61]/35 text-[#d8c2aa]'
              }`}
            >
              {/* Active Golden Glow on the left border */}
              {isActive && (
                <div className="absolute -left-1 top-2 bottom-2 w-1.5 rounded-r bg-[#fff5d1] shadow-[0_0_8px_#ffe699]" />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#1a0f07] text-[#ffe699] shadow-inner'
                    : 'bg-[#26150d] text-[#e2ba61] group-hover:text-[#ffe699] border border-[#3d2314]'
                }`}>
                  <Icon size={16} />
                </div>

                <div className="truncate">
                  <div className={`font-bold text-xs leading-tight truncate ${
                    isActive ? 'text-[#1a0f07]' : 'text-[#f7ede1] group-hover:text-[#ffe699]'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] truncate ${
                    isActive ? 'text-[#3d2516] font-medium' : 'text-[#a88d74]'
                  }`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>

              <ChevronRight
                size={14}
                className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                  isActive ? 'text-[#1a0f07]' : 'text-[#a88d74] group-hover:text-[#ffe699]'
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* 3. LOWER SIDEBAR: BRAND QUOTE + 3D COFFEE CUP + STATUS */}
      <div className="p-3 border-t border-[#3d2314] space-y-2 bg-[#0e0704]/90">
        {/* Luxury Cursive Golden Quote */}
        <div className="text-center px-2">
          <p className="font-serif italic text-xs text-[#e5be4e] tracking-wide opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            "Mais que café, é conexão."
          </p>
        </div>

        {/* 3D Coffee Cup Artwork */}
        <SidebarCoffeeVisual />

        {/* System Online Status Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#180e08] border border-emerald-500/25 text-[10px]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sistema Online</span>
          </div>
          <span className="font-mono text-[#a88d74] text-[9px]">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
}
