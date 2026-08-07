import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users2, 
  Container, 
  Heart, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  Clock, 
  Calendar, 
  Truck, 
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface MobileMenuProps {
  onSelect: (id: string) => void;
  pageVisibility?: Record<string, boolean>;
  availablePages?: any[];
  onUnlockPresenceList?: () => void;
  onLogout?: () => void;
}

export default function MobileMenu({ 
  onSelect, 
  pageVisibility,
  onUnlockPresenceList, 
  onLogout 
}: MobileMenuProps) {
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [patioCount, setPatioCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEscalaWorkDay, setIsEscalaWorkDay] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch appointments for mobile preview
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

  return (
    <div className="w-full min-h-screen bg-[#120905] text-[#f5ebd6] relative flex flex-col justify-between overflow-x-hidden select-none pb-28">
      
      {/* Immersive Mobile Background Ambient Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-[#B32025]/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-[#d4a373]/15 rounded-full blur-[90px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#422212]/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,5,3,0.95)_100%)]" />
      </div>

      {/* TOP HEADER: Mobile Native Status & Header Bar */}
      <header className="relative z-10 w-full px-4 pt-4 pb-3 border-b border-white/10 bg-[#1a0e08]/80 backdrop-blur-md sticky top-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B32025] to-[#730c10] flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif text-base font-black tracking-wider text-[#F5EFE6] uppercase leading-none">
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
                title="Configurações"
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

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 pt-4 flex flex-col gap-4">
        
        {/* WELCOME & SHIFT SUMMARY WIDGET */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#2a170d] via-[#1f1008] to-[#140a05] border border-[#7a4f30]/40 p-3.5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2a67e] font-bold flex items-center gap-1.5">
              <Activity size={12} className="text-amber-400" /> Visão Geral do Turno
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
              isEscalaWorkDay 
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" 
                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
            )}>
              {isEscalaWorkDay ? "Escala: Dia de Trabalho" : "Escala: Folga"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-[#120804]/80 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d4a373]/20 flex items-center justify-center text-[#e6c29b]">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-[#c2a67e]/80">Agendamentos</div>
                <div className="text-sm font-serif font-black text-white">{appointmentsCount} registros</div>
              </div>
            </div>

            <div className="bg-[#120804]/80 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B32025]/20 flex items-center justify-center text-[#ff6b6b]">
                <Truck size={16} />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-[#c2a67e]/80">Pátio Ativo</div>
                <div className="text-sm font-serif font-black text-white">{patioCount} veículos</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#c2a67e] font-black">
              Módulos Disponíveis
            </h2>
            <p className="text-lg font-serif font-black text-[#F5EFE6]">
              Acesse as Operações
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#c2a67e] border border-white/10">
            Mobile 2 de 2
          </span>
        </div>

        {/* 100% MOBILE CARD 1: LISTA DE PRESENÇA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('presence')}
          className="w-full text-left rounded-3xl p-5 bg-gradient-to-br from-[#3b2314] via-[#28150a] to-[#160a04] border-2 border-[#8c5a35]/60 shadow-[0_16px_35px_rgba(0,0,0,0.7)] relative overflow-hidden group cursor-pointer transition-all duration-200"
        >
          {/* Subtle light accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4bc96] via-[#c2a67e] to-[#ab8f66] flex items-center justify-center text-[#2d1a0e] shadow-lg border border-amber-200/40 shrink-0">
              <Users2 size={28} strokeWidth={2.3} />
            </div>

            <div className="flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-500/30 text-[#e6c29b] text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
                Controle Diário
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#B32025] flex items-center justify-center text-white transition-colors duration-200">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-bold text-[#c2a67e] block mb-1">
              ESCALA & EFETIVO
            </span>
            <h3 className="text-xl font-serif font-black uppercase text-[#F5EFE6] tracking-tight leading-tight">
              Lista de Presença
            </h3>
            <p className="text-xs text-[#d9c7b2]/80 mt-1 line-clamp-2 leading-relaxed">
              Escala 12x36, registro diário de jornada, banco de horas e agenda corporativa.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                📅 Escala Automática
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                ⏱️ Banco de Horas
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                🔔 Agendamentos
              </span>
            </div>
          </div>
        </motion.button>

        {/* 100% MOBILE CARD 2: PÁTIO */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('patio')}
          className="w-full text-left rounded-3xl p-5 bg-gradient-to-br from-[#2f180d] via-[#200f07] to-[#120703] border-2 border-[#7a4826]/60 shadow-[0_16px_35px_rgba(0,0,0,0.7)] relative overflow-hidden group cursor-pointer transition-all duration-200"
        >
          {/* Subtle light accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B32025]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4d2816] via-[#381a0b] to-[#240e04] flex items-center justify-center text-[#f5ebd6] shadow-lg border border-[#e6c29b]/30 shrink-0">
              <Container size={28} strokeWidth={2.3} className="text-[#e6c29b]" />
            </div>

            <div className="flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
                Logística & Docas
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#B32025] flex items-center justify-center text-white transition-colors duration-200">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-bold text-[#c2a67e] block mb-1">
              MOVIMENTAÇÃO DE VEÍCULOS
            </span>
            <h3 className="text-xl font-serif font-black uppercase text-[#F5EFE6] tracking-tight leading-tight">
              Gestão de Pátio
            </h3>
            <p className="text-xs text-[#d9c7b2]/80 mt-1 line-clamp-2 leading-relaxed">
              Controle de fluxo de caminhões, conferência de placas Mercosul, docas e motoristas.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                🚛 Entradas & Saídas
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                🏷️ Placas Mercosul
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                📦 Status de Carga
              </span>
            </div>
          </div>
        </motion.button>

        {/* QUICK SHORTCUT ACTION BAR FOR MOBILE */}
        <div className="w-full bg-[#1c0e07]/90 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-mono uppercase font-bold text-[#e6c29b]">
              Ações Rápidas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect('presence')}
              className="px-3 py-1.5 rounded-xl bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 text-[10px] font-bold text-amber-200 uppercase tracking-wide transition-colors"
            >
              Presença
            </button>
            <button
              type="button"
              onClick={() => onSelect('patio')}
              className="px-3 py-1.5 rounded-xl bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-[10px] font-bold text-red-200 uppercase tracking-wide transition-colors"
            >
              Pátio
            </button>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full text-center px-4 pt-6 pb-2 border-t border-white/10 mt-6">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
        </div>
        <p className="font-serif italic text-xs text-[#F5EFE6]/90 tracking-widest">
          Café Três Corações
        </p>
        <span className="text-[8px] font-mono text-[#c2a67e]/70 uppercase tracking-[0.25em] mt-0.5 block">
          Sistema Operacional PGR • Mobile
        </span>
      </footer>

    </div>
  );
}
