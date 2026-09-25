import React from 'react';
import {
  Home,
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Coffee,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const navItems = [
    { id: 'inicio', label: 'Início', icon: <Home size={18} /> },
    { id: 'graficos', label: 'Gráficos', icon: <BarChart3 size={18} /> },
    { id: 'vendas', label: 'Vendas', icon: <ShoppingCart size={18} /> },
    { id: 'clientes', label: 'Clientes', icon: <Users size={18} /> },
    { id: 'produtos', label: 'Produtos', icon: <Package size={18} /> },
    { id: 'relatorios', label: 'Relatórios', icon: <FileText size={18} /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-56 shrink-0 bg-gradient-to-b from-[#26150b] via-[#1a0e07] to-[#120904] text-white rounded-3xl p-4 flex flex-col justify-between shadow-[0_20px_50px_rgba(20,10,4,0.45)] border border-[#d4a373]/25 sticky top-4 h-[calc(100vh-2rem)] select-none z-30">
      <div>
        {/* Top Luxury Crown Crest "A&B CAFÉ" */}
        <div className="flex flex-col items-center py-4 mb-4 border-b border-[#ffd77d]/15 relative">
          <div className="relative w-20 h-20 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(212,145,26,0.4)] cursor-pointer group">
            {/* Outer Laurel Golden Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffd77d]/60 group-hover:rotate-45 transition-transform duration-700" />
            
            {/* Golden Medal Shield Disc */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9d6505] via-[#e6a827] to-[#fff2b2] p-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#3a200a] to-[#201004] flex flex-col items-center justify-center border border-[#ffecaa]/40">
                <Crown size={15} className="text-[#ffd77d] -mb-0.5 filter drop-shadow" />
                <span className="font-serif font-black text-sm tracking-wider text-[#ffd77d] leading-none">
                  A&B
                </span>
                <span className="text-[7.5px] font-bold tracking-widest text-[#f5c369] uppercase mt-0.5">
                  CAFÉ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ffd77d] via-[#f3a82e] to-[#e28c11] text-[#2c1808] shadow-[0_8px_20px_rgba(243,168,46,0.35)] scale-[1.02]'
                    : 'text-stone-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-200 ${isActive ? 'text-[#2c1808]' : 'text-amber-300/80 group-hover:text-amber-300 group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isActive
                      ? 'text-[#2c1808] rotate-0'
                      : 'text-stone-400 group-hover:text-stone-200 -rotate-90'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: "Qualidade em cada detalhe." + Steaming Coffee Cup & Live Status */}
      <div className="pt-3 border-t border-[#ffd77d]/15 text-center flex flex-col items-center">
        <p className="font-serif italic text-amber-200/90 text-xs font-semibold tracking-wide drop-shadow mb-2">
          "Qualidade em cada detalhe."
        </p>

        {/* Steaming Espresso Visual */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-[0_8px_16px_rgba(0,0,0,0.4)] mb-3 relative group">
          <img
            src="/src/assets/images/steaming_cup_coffee_1789847106425.jpg"
            alt="Café Espresso Steaming"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/hero-podium-coffee.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Live System Online Status */}
        <div className="flex items-center justify-between w-full px-2 text-[11px] text-stone-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-300 text-[10px]">Sistema Online</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
}
