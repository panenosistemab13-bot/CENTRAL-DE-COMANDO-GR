import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Users2, 
  FileCheck2, 
  CalendarDays, 
  Route, 
  Container,
  ChevronLeft,
  ChevronRight,
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
  { id: 'patio', label: 'Pátio', buttonLabel: 'Logística', icon: Container, color: 'from-purple-500 to-indigo-600', description: 'Gestão inteligente de entrada e saída de veículos.' },
  { id: 'presence', label: 'Lista de Presença', buttonLabel: 'Efetivo', icon: Users2, color: 'from-orange-400 to-red-600', description: 'Controle de escala e presença dos colaboradores.' },
  { id: 'averbacao', label: 'Averbação', buttonLabel: 'Seguros', icon: FileCheck2, color: 'from-blue-500 to-blue-800', description: 'Gestão de apólices e seguros integrados.' },
  { id: 'sm_creator', label: 'SM Creator', buttonLabel: 'Eventos', icon: CalendarDays, color: 'from-rose-500 to-pink-700', description: 'Criação e agendamento de solicitações de monitoramento.' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'Logística', icon: Route, color: 'from-amber-400 to-yellow-600', description: 'Otimização e códigos de rotas operacionais.' },
  { id: 'checklist', label: 'Checklist', buttonLabel: 'Vistorias', icon: ClipboardCheck, color: 'from-indigo-500 to-blue-700', description: 'Controle de validade e vistorias técnicas de periféricos frota.' },
];

interface InitialMenuProps {
  onSelect: (id: string) => void;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function InitialMenu({ onSelect, focusedIndex, setFocusedIndex }: InitialMenuProps) {
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setFocusedIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = menuItems.length - 1;
      if (next >= menuItems.length) next = 0;
      return next;
    });
  }, [setFocusedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'Enter') onSelect(menuItems[focusedIndex].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, paginate, onSelect]);

  const activeItem = menuItems[focusedIndex];

  return (
    <div className="relative w-full h-full flex items-center justify-center py-4 px-4 overflow-hidden">
      {/* Background LED Ambient Glow - Subtle and diffuse */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            className={cn("w-full h-full max-w-4xl max-h-4xl rounded-full blur-[160px]", activeItem.color)}
          />
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between gap-4 md:gap-8 overflow-visible">
        <motion.button 
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl"
        >
          <ChevronLeft size={32} />
        </motion.button>

        <div className="flex-1 flex flex-col items-center overflow-visible">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="flex flex-col items-center cursor-pointer w-full"
              onClick={() => onSelect(activeItem.id)}
            >
              {/* Dynamic LED Container */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 40px rgba(255,255,255,0.05)",
                      "0 0 80px rgba(255,255,255,0.15)",
                      "0 0 40px rgba(255,255,255,0.05)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={cn(
                    "relative z-10 p-12 rounded-[3rem] bg-zinc-950 border border-white/10",
                    "shadow-[inset_0_2px_20px_rgba(255,255,255,0.05)]"
                  )}
                >
                  {/* Internal Glow LED - Simplified to avoid artifacts */}
                  <div className={cn("absolute inset-0 opacity-10 blur-2xl", activeItem.color.split(' ')[0].replace('from-', 'bg-'))} />
                  
                  <activeItem.icon 
                    className="w-24 h-24 sm:w-28 sm:h-28 relative z-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                    strokeWidth={1.2} 
                  />
                </motion.div>

                {/* Outer LED Halo */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className={cn("absolute -inset-4 rounded-[4rem] border border-white/5 blur-sm opacity-20", activeItem.color.replace('from-', 'border-').split(' ')[0])}
                />
              </div>

              {/* Immersive Text */}
              <motion.div 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12 text-center pb-4"
              >
                <motion.div 
                   animate={{ opacity: [0.4, 1, 0.4] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="flex items-center justify-center gap-6 mb-3"
                >
                  <div className="h-0.5 w-10 bg-gradient-to-r from-transparent to-primary" />
                  <span className="text-xs font-black uppercase tracking-[0.8em] text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{activeItem.buttonLabel}</span>
                  <div className="h-0.5 w-10 bg-gradient-to-l from-transparent to-primary" />
                </motion.div>

                <h2 className="text-6xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {activeItem.label}
                </h2>
                
                <p className="text-zinc-500 text-base max-w-lg mx-auto font-medium leading-relaxed tracking-wide">
                  {activeItem.description}
                </p>

                <motion.div 
                  className="mt-8 inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform"
                >
                  Acessar Módulo
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.button 
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl"
        >
          <ChevronRight size={32} />
        </motion.button>
      </div>
    </div>
  );
}
