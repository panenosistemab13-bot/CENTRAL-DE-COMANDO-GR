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
  Sparkles,
  Globe,
  LogOut,
  Container,
  FileCheck2,
  CalendarDays,
  Route,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageDefinition, ICON_MAP, getAllAvailablePages } from '../data/pagesConfig';

interface MobileMenuItem {
  id: string;
  subtitle: string;
  title: string;
  icon: React.ElementType;
  styleClass: string;
  iconStyle: string;
  badge?: string;
}

const baseMobileItems: Record<string, { subtitle: string; title: string; icon: React.ElementType; styleClass: string; iconStyle: string; badge?: string }> = {
  slides: { 
    subtitle: 'COMMAND CENTER 4K HUD', 
    title: 'SLIDES HUD', 
    icon: Globe,
    styleClass: "bg-gradient-to-br from-[#030712] via-[#0b1329] to-[#050b18] border border-cyan-500/60 shadow-[0_12px_30px_rgba(0,240,255,0.35),inset_0_1px_1px_rgba(0,240,255,0.3)] text-cyan-200",
    iconStyle: "bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-400/50 text-cyan-300",
    badge: '4K HUD 3D'
  },
  patio: { 
    subtitle: 'CONTROLE LOGÍSTICO', 
    title: 'PÁTIO', 
    icon: Container,
    styleClass: "bg-gradient-to-br from-[#26150b] via-[#3a2214] to-[#1c0f0a] border border-[#5c3e29]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.15)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#3a2214] to-[#1c0f0a] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Gerenciar Pátio'
  },
  checklist: { 
    subtitle: 'VISTORIAS & FROTA', 
    title: 'CHECKLIST', 
    icon: ClipboardCheck,
    styleClass: "bg-gradient-to-br from-[#331e11] via-[#24130a] to-[#150a06] border border-[#6b472e]/70 shadow-[0_12px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] text-[#edd9bf]",
    iconStyle: "bg-gradient-to-br from-[#24130a] to-[#0f0704] border-[#dac2ad]/30 text-[#dac2ad]",
    badge: 'Inspeção'
  },
  averbacao: { 
    subtitle: 'SEGUROS & APÓLICES', 
    title: 'AVERBAÇÃO', 
    icon: FileCheck2,
    styleClass: "bg-gradient-to-br from-[#2d1a0e] via-[#3d2414] to-[#1c0f0a] border border-[#7a4f30]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#4a2e1d] to-[#26150b] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Seguros'
  },
  sm_creator: { 
    subtitle: 'EVENTOS & PGR', 
    title: 'SM MONITORAMENTO', 
    icon: CalendarDays,
    styleClass: "bg-gradient-to-br from-[#2a170b] via-[#382011] to-[#190c06] border border-[#6b4428]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#3d2414] to-[#1e0e06] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Viagens'
  },
  controle: { 
    subtitle: 'OPERAÇÕES GERAIS', 
    title: 'CONTROLE', 
    icon: Sliders,
    styleClass: "bg-gradient-to-br from-[#311b0e] via-[#422513] to-[#1f0f07] border border-[#85532f]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#4d2d18] to-[#24130a] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Gerais'
  },
  presence: { 
    subtitle: 'EQUIPE & ESCALA', 
    title: 'LISTA DE PRESENÇA', 
    icon: Users2,
    styleClass: "bg-gradient-to-br from-[#d4bc96] via-[#c2a67e] to-[#ab8f66] border border-[#f5ebd6]/40 shadow-[0_12px_30px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] text-[#2d1a0e]",
    iconStyle: "bg-gradient-to-br from-[#bda37d] to-[#997e57] border-[#2d1a0e]/20 text-[#2d1a0e]",
    badge: 'Diário'
  },
  rotas: { 
    subtitle: 'LOGÍSTICA & TRAJETOS', 
    title: 'ROTAS', 
    icon: Route,
    styleClass: "bg-gradient-to-br from-[#2f1b0f] via-[#3f2414] to-[#1c0e07] border border-[#784a29]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65)] text-[#f5ebd6]",
    iconStyle: "bg-gradient-to-br from-[#472a17] to-[#211107] border-[#e6c29b]/40 text-[#e6c29b]",
    badge: 'Mapeamento'
  }
};

interface MobileMenuProps {
  onSelect: (id: string) => void;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  showSlides?: boolean;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  onUnlockPresenceList: () => void;
  onLogout?: () => void;
}

export default function MobileMenu({ 
  onSelect, 
  showPresenceList, 
  showRotasPage, 
  showSlides, 
  pageVisibility,
  availablePages,
  onUnlockPresenceList, 
  onLogout 
}: MobileMenuProps) {
  const allPages = availablePages || getAllAvailablePages();

  const menuItemsList: MobileMenuItem[] = allPages.map(page => {
    const config = baseMobileItems[page.id];
    const IconComp = ICON_MAP[page.iconName] || config?.icon || Sliders;
    
    return {
      id: page.id,
      subtitle: config?.subtitle || page.category?.toUpperCase() || 'MÓDULO PGR',
      title: page.label?.toUpperCase() || 'MÓDULO',
      icon: IconComp,
      styleClass: config?.styleClass || "bg-gradient-to-br from-[#26150b] via-[#3a2214] to-[#1c0f0a] border border-[#5c3e29]/60 shadow-[0_12px_30px_rgba(0,0,0,0.65)] text-[#f5ebd6]",
      iconStyle: config?.iconStyle || "bg-gradient-to-br from-[#3a2214] to-[#1c0f0a] border-[#e6c29b]/40 text-[#e6c29b]",
      badge: page.badge || config?.badge || 'Oficial'
    };
  });

  const filteredMenuItems = menuItemsList.filter(item => {
    if (pageVisibility && pageVisibility[item.id] !== undefined) {
      return Boolean(pageVisibility[item.id]);
    }
    if (item.id === 'presence') return Boolean(showPresenceList);
    if (item.id === 'rotas') return Boolean(showRotasPage);
    if (item.id === 'slides') return Boolean(showSlides);
    return true;
  });

  const itemsToRender = filteredMenuItems.length > 0 ? filteredMenuItems : menuItemsList.slice(0, 1);

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

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-[#B32025] hover:bg-[#9a1a1e] border border-white/25 flex items-center gap-1.5 text-white font-serif font-black text-xs transition-colors cursor-pointer shadow"
              title="Sair"
            >
              <LogOut size={14} /> Sair
            </button>
          )}

          {/* Secret Unlock Button */}
          <button
            type="button"
            onClick={onUnlockPresenceList}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#c2a67e] transition-colors cursor-pointer"
            title="Acesso Administrativo / Páginas Restritas"
          >
            {pageVisibility?.presence || showPresenceList ? <Unlock size={15} className="text-green-400" /> : <Lock size={15} />}
          </button>
        </div>
      </div>

      {/* CENTER CONTENT: High-End Dynamic Cards */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-4 my-auto py-4">
        
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c2a67e] text-[10px] font-mono tracking-widest uppercase mb-2">
            <Sparkles size={11} /> Módulos Ativos ({itemsToRender.length})
          </div>
          <h2 className="text-2xl font-serif font-black text-[#F5EFE6] uppercase tracking-tight">
            Selecione o Serviço
          </h2>
        </div>

        {itemsToRender.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full rounded-3xl p-4.5 flex items-center justify-between text-left relative overflow-hidden group cursor-pointer transition-all duration-300",
                item.styleClass
              )}
            >
              {/* Subtle light sheen on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className={cn(
                  "w-13 h-13 rounded-2xl border flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105 duration-300",
                  item.iconStyle
                )}>
                  <IconComponent size={24} strokeWidth={2.2} />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono font-black tracking-[0.2em] uppercase opacity-80 truncate">
                      {item.subtitle}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold uppercase tracking-wider border border-white/10 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-serif text-base font-black tracking-wide uppercase leading-tight truncate">
                    {item.title}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-white/10 relative z-10 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
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
