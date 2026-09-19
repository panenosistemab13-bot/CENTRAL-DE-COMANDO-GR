import React from 'react';
import { LucideIcon, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Navigation3DProps {
  tabs: NavTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Navigation3D({
  tabs,
  activeTab,
  onTabChange,
  className
}: Navigation3DProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer select-none",
              isActive
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-sky-300 font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <Icon size={16} className={cn(isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-400")} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
