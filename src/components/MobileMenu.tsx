import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users2, 
  Container, 
  Heart, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  Clock, 
  Calendar, 
  Truck, 
  ChevronRight,
  Activity,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ClipboardCheck,
  FileCheck2,
  CalendarDays,
  Route,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { ICON_MAP, getAllAvailablePages, PageDefinition } from '../data/pagesConfig';

interface MobileMenuProps {
  onSelect: (id: string) => void;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  onUnlockPresenceList?: () => void;
  onLogout?: () => void;
}

export default function MobileMenu({ 
  onSelect, 
  pageVisibility = {},
  availablePages = [],
  onUnlockPresenceList, 
  onLogout 
}: MobileMenuProps) {
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [patioCount, setPatioCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEscalaWorkDay, setIsEscalaWorkDay] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live stats from RTDB for mobile overview
  useEffect(() => {
    const appsRef = ref(db, 'presence_list/appointments');
    const unsubApps = onValue(appsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAppointmentsCount(Object.keys(data).length);
      } else {
        setAppointmentsCount(0);
      }
    });

    const patioRef = ref(db, 'patio_items');
    const unsubPatio = onValue(patioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPatioCount(Object.keys(data).length);
      } else {
        setPatioCount(0);
      }
    });

    const escalaRef = ref(db, 'presence_list/escalaConfig');
    const unsubEscala = onValue(escalaRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.startDate) {
        const refDate = new Date(data.startDate + 'T12:00:00');
        const today = new Date();
        const diffDays = Math.round((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
        setIsEscalaWorkDay(Math.abs(diffDays) % 2 === 0);
      }
    });

    return () => {
      unsubApps();
      unsubPatio();
      unsubEscala();
    };
  }, []);

  const formattedDate = currentTime.toLocaleDateString('pt-BR', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short' 
  }).toUpperCase();

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Calculate visible pages list
  const pages = availablePages.length > 0 ? availablePages : getAllAvailablePages();
  const visiblePages = pages.filter(p => pageVisibility[p.id] !== false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    visiblePages.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [visiblePages]);

  const filteredPages = useMemo(() => {
    return visiblePages.filter(page => {
      if (selectedCategory !== 'all' && page.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          page.label.toLowerCase().includes(q) ||
          page.description.toLowerCase().includes(q) ||
          page.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [visiblePages, selectedCategory, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] relative flex flex-col justify-between overflow-x-hidden select-none pb-28">
      
      {/* Immersive Mobile Background Ambient Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-[#B32025]/25 rounded-full blur-[90px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#d4a373]/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#422212]/35 rounded-full blur-[120px]" />
      </div>

      {/* TOP HEADER: Mobile Native Status & Header Bar */}
      <header className="relative z-10 w-full px-4 pt-4 pb-3 border-b border-amber-500/20 bg-[#160a04]/90 backdrop-blur-xl sticky top-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B32025] to-[#730c10] flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-sans text-base font-black tracking-wider text-[#F5EFE6] uppercase leading-none">
                  Três Corações
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="RTDB Online" />
              </div>
              <p className="text-[10px] font-mono tracking-widest text-[#c2a67e] uppercase font-bold mt-0.5">
                App Mobile PGR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-right">
              <div className="text-[11px] font-mono font-bold text-[#F5EFE6] leading-none">
                {formattedTime}
              </div>
              <div className="text-[8px] font-mono text-[#c2a67e] uppercase">
                {formattedDate}
              </div>
            </div>

            {onUnlockPresenceList && (
              <button
                type="button"
                onClick={onUnlockPresenceList}
                className="w-9 h-9 rounded-xl bg-white/5 active:bg-white/15 border border-white/10 flex items-center justify-center text-[#c2a67e] transition-colors cursor-pointer"
                title="Restrições & Páginas"
              >
                <Lock size={15} />
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-9 h-9 rounded-xl bg-[#B32025]/80 active:bg-[#B32025] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shadow"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN MOBILE APP CONTAINER */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 pt-4 flex flex-col gap-4">
        
        {/* SHIFT & OPERATIONS HERO WIDGET */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-[#24130a] via-[#1a0c05] to-[#0f0502] border border-amber-500/30 p-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2a67e] font-bold flex items-center gap-1.5">
              <Activity size={13} className="text-amber-400" /> Painel Operacional
            </span>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black uppercase tracking-wider border",
              isEscalaWorkDay 
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" 
                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
            )}>
              {isEscalaWorkDay ? "Escala: Trabalho" : "Escala: Folga"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <motion.div 
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect('presence')}
              className="bg-[#120703]/90 rounded-2xl p-3 border border-white/10 flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#d4a373]/20 flex items-center justify-center text-[#e6c29b] shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono uppercase text-[#c2a67e] truncate">Agendamentos</div>
                <div className="text-base font-sans font-black text-white truncate">{appointmentsCount} ativas</div>
              </div>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect('patio')}
              className="bg-[#120703]/90 rounded-2xl p-3 border border-white/10 flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#B32025]/20 flex items-center justify-center text-[#ff6b6b] shrink-0">
                <Truck size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono uppercase text-[#c2a67e] truncate">Pátio Ativo</div>
                <div className="text-base font-sans font-black text-white truncate">{patioCount} veículos</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* MOBILE SEARCH & CATEGORY FILTER */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar módulo ou serviço..."
              className="w-full bg-[#160a04]/90 text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs font-sans rounded-2xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border transition-all cursor-pointer",
                    selectedCategory === cat
                      ? "bg-[#B32025] text-white border-white/30 shadow-md"
                      : "bg-white/5 text-[#c2a67e] border-white/10 hover:bg-white/10"
                  )}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c2a67e] font-black">
              Módulos Disponíveis ({filteredPages.length})
            </h2>
            <p className="text-base font-sans font-black text-[#F5EFE6]">
              Acesse os Serviços
            </p>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#c2a67e] border border-white/10">
            Touch Ready
          </span>
        </div>

        {/* MOBILE APP MODULES GRID */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredPages.map((page) => {
            const IconComponent = ICON_MAP[page.iconName] || Sliders;

            return (
              <motion.button
                key={page.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(page.id)}
                className="w-full text-left rounded-3xl p-4 bg-gradient-to-br from-[#24130a] via-[#1a0c05] to-[#0e0502] border border-amber-500/30 shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-200"
              >
                {/* Visual Glass Glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#B32025]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B32025] via-[#8c1418] to-[#590a0d] flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                      <IconComponent size={24} strokeWidth={2.2} />
                    </div>

                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-[#c2a67e] block">
                        {page.category || 'Módulo'}
                      </span>
                      <h3 className="text-lg font-sans font-black uppercase text-[#F5EFE6] tracking-tight leading-tight">
                        {page.label}
                      </h3>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#B32025] flex items-center justify-center text-white transition-colors duration-200 shrink-0">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <p className="text-xs text-[#d9c7b2]/80 leading-relaxed line-clamp-2 pl-0.5 relative z-10">
                  {page.description}
                </p>

                {page.badge && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 relative z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-mono text-[#e6c29b] border border-white/5">
                      {page.badge}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full text-center px-4 pt-6 pb-2 border-t border-white/10 mt-6">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
        </div>
        <p className="font-sans font-bold text-xs text-[#F5EFE6]/90 tracking-widest">
          Café Três Corações
        </p>
        <span className="text-[8px] font-mono text-[#c2a67e]/70 uppercase tracking-[0.25em] mt-0.5 block">
          Sistema Operacional PGR • 100% Mobile
        </span>
      </footer>

    </div>
  );
}
