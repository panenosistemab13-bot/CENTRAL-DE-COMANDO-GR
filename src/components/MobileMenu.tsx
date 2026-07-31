import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Users2, 
  ClipboardCheck,
  Heart,
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  subtitle: string;
  title: string;
  icon: React.ElementType;
  styleClass: string;
  iconStyle: string;
  badge?: string;
}

const mobileMenuItems: MenuItem[] = [
  { 
    id: 'patio', 
    subtitle: 'CONTROLE LOGÍSTICO', 
    title: 'PÁTIO', 
    icon: Package,
    styleClass: "bg-gradient-to-br from-[#26150b] via-[#3a2214] to-[#1c0f0a] border border-[#5c3e29]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.15)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#3a2214] to-[#1c0f0a] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Gerenciar Pátio'
  },
  { 
    id: 'presence', 
    subtitle: 'EQUIPE & ESCALA', 
    title: 'LISTA DE PRESENÇA', 
    icon: Users2,
    styleClass: "bg-gradient-to-br from-[#d4bc96] via-[#c2a67e] to-[#ab8f66] border border-[#f5ebd6]/40 shadow-[0_12px_30px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] text-[#2d1a0e]",
    iconStyle: "bg-gradient-to-br from-[#bda37d] to-[#997e57] border-[#2d1a0e]/20 text-[#2d1a0e]",
    badge: 'Diário'
  },
  { 
    id: 'checklist', 
    subtitle: 'VISTORIAS & FROTA', 
    title: 'CHECKLIST', 
    icon: ClipboardCheck,
    styleClass: "bg-gradient-to-br from-[#331e11] via-[#24130a] to-[#150a06] border border-[#6b472e]/70 shadow-[0_12px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] text-[#edd9bf]",
    iconStyle: "bg-gradient-to-br from-[#24130a] to-[#0f0704] border-[#dac2ad]/30 text-[#dac2ad]",
    badge: 'Inspeção'
  }
];

interface MobileMenuProps {
  onSelect: (id: string) => void;
  showPresenceList: boolean;
  showRotasPage: boolean;
  onUnlockPresenceList: () => void;
}

export default function MobileMenu({ onSelect, showPresenceList, onUnlockPresenceList }: MobileMenuProps) {
  return (
    <div className="w-full min-h-screen bg-[#140b07] relative flex flex-col justify-between overflow-x-hidden select-none px-5 py-6">
      
      {/* Background ambient lighting and luxury depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#B32025]/15 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#c2a67e]/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,5,3,0.85)_100%)]" />
      </div>

      {/* TOP HEADER: Sophisticated Branding & Status */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2 pb-6 border-b border-[#ffffff]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B32025] to-[#730c10] flex items-center justify-center shadow-lg border border-white/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-black tracking-wider text-[#F5EFE6] uppercase leading-none">
              Três Corações
            </h1>
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#c2a67e] uppercase font-bold mt-1 block">
              Painel Executivo Mobile
            </span>
          </div>
        </div>

        {/* Secret Unlock Button */}
        <button
          type="button"
          onClick={onUnlockPresenceList}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#c2a67e] transition-colors cursor-pointer"
          title="Acesso Administrativo"
        >
          {showPresenceList ? <Unlock size={15} className="text-green-400" /> : <Lock size={15} />}
        </button>
      </div>

      {/* CENTER CONTENT: 3 Professional, High-End Cards */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-4 my-auto py-4">
        
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c2a67e] text-[10px] font-mono tracking-widest uppercase mb-2">
            <Sparkles size={11} /> Módulos Oficiais
          </div>
          <h2 className="text-2xl font-serif font-black text-[#F5EFE6] uppercase tracking-tight">
            Selecione o Serviço
          </h2>
        </div>

        {mobileMenuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full rounded-3xl p-5 flex items-center justify-between text-left relative overflow-hidden group cursor-pointer transition-all duration-300",
                item.styleClass
              )}
            >
              {/* Subtle light sheen on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105 duration-300",
                  item.iconStyle
                )}>
                  <IconComponent size={26} strokeWidth={2.2} />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono font-black tracking-[0.2em] uppercase opacity-80">
                      {item.subtitle}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold uppercase tracking-wider border border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-serif text-lg font-black tracking-wide uppercase leading-tight">
                    {item.title}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-white/10 relative z-10 group-hover:translate-x-1 transition-transform">
                <span className="text-xs font-bold">→</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* FOOTER: Professional Signature */}
      <div className="relative z-10 w-full text-center pt-6 pb-2 border-t border-white/10">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
          <Heart size={12} className="fill-[#B32025] text-[#B32025]" />
        </div>
        <p className="font-serif italic text-xs text-[#F5EFE6]/90 tracking-widest">
          Café Três Corações
        </p>
        <span className="text-[8px] font-mono text-[#c2a67e]/70 uppercase tracking-[0.25em] mt-1 block">
          Sistema Profissional de Logística & Vistorias
        </span>
      </div>

    </div>
  );
}
