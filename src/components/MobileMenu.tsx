import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Users2, 
  FileCheck2, 
  CalendarDays, 
  Route, 
  Container,
  ShieldAlert,
  BellRing,
  ClipboardCheck,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  label: string;
  buttonLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const menuItems: MenuItem[] = [
  { id: 'patio', label: 'Pátio', buttonLabel: 'Logística', icon: Container, color: 'from-purple-500 to-indigo-600', description: 'Portaria e Pátio' },
  { id: 'presence', label: 'Presença', buttonLabel: 'Efetivo', icon: Users2, color: 'from-orange-400 to-red-600', description: 'Lista de presença' },
  { id: 'averbacao', label: 'Averbação', buttonLabel: 'Seguros', icon: FileCheck2, color: 'from-blue-500 to-blue-800', description: 'Gestão de seguros' },
  { id: 'sm_creator', label: 'SM', buttonLabel: 'Eventos', icon: CalendarDays, color: 'from-rose-500 to-pink-700', description: 'Criar solicitações' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'Logística', icon: Route, color: 'from-amber-400 to-yellow-600', description: 'Códigos de rotas' },
  { id: 'checklist', label: 'Checklist', buttonLabel: 'Vistorias', icon: ClipboardCheck, color: 'from-indigo-500 to-blue-700', description: 'Vistorias frota' },
];

interface MobileMenuProps {
  onSelect: (id: string) => void;
}

export default function MobileMenu({ onSelect }: MobileMenuProps) {
  return (
    <div className="w-full px-6 py-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Módulos</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Selecione uma categoria para iniciar</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(item.id)}
            className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-zinc-900 border border-white/5 active:scale-95 transition-all overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className={cn("absolute inset-0 opacity-0 group-active:opacity-10 transition-opacity bg-gradient-to-br", item.color)} />
            
            <div className={cn(
              "w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 transition-all group-active:scale-110",
              "border border-white/5 shadow-inner"
            )}>
              <item.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{item.buttonLabel}</span>
            <span className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</span>

            {/* Micro Indicator */}
            <div className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full transition-all opacity-20",
              item.color.split(' ')[0].replace('from-', 'bg-')
            )} />
          </motion.button>
        ))}
      </div>

      {/* Stats Card or Quick Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-5 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 backdrop-blur-3xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20">
             <ShieldAlert className="text-indigo-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wide">Status do Sistema</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Todos os módulos operacionais</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
           {[ {l: 'Ativos', v: '12'}, {l: 'Alertas', v: '03'}, {l: 'Online', v: '100%'} ].map((s, i) => (
             <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-indigo-400 font-black text-lg">{s.v}</span>
                <span className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">{s.l}</span>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
