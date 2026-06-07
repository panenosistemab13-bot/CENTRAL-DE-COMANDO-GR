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
  ClipboardCheck
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
  { id: 'patio', label: 'Pátio', buttonLabel: 'Logística', icon: Container, color: 'text-zinc-300', description: 'Gestão inteligente de entrada e saída de veículos.' },
  { id: 'presence', label: 'Lista de Presença', buttonLabel: 'Efetivo', icon: Users2, color: 'text-zinc-300', description: 'Controle de escala e presença dos colaboradores.' },
  { id: 'averbacao', label: 'Averbação', buttonLabel: 'Seguros', icon: FileCheck2, color: 'text-zinc-300', description: 'Gestão de apólices e seguros integrados.' },
  { id: 'sm_creator', label: 'SM', buttonLabel: 'Eventos', icon: CalendarDays, color: 'text-zinc-300', description: 'Criação e agendamento de solicitações de monitoramento.' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'Logística', icon: Route, color: 'text-zinc-300', description: 'Otimização e códigos de rotas operacionais.' },
  { id: 'checklist', label: 'Checklist', buttonLabel: 'Vistorias', icon: ClipboardCheck, color: 'text-zinc-300', description: 'Controle de validade e vistorias técnicas de periféricos frota.' },
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
      // Avoid acting if an input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'Enter') onSelect(menuItems[focusedIndex].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, paginate, onSelect]);

  const activeItem = menuItems[focusedIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      
      <div className="relative z-10 w-full max-w-[90rem] flex items-center justify-between gap-4 px-4 sm:px-12 object-contain">
        {/* Left Arrow */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className="w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all pointer-events-auto"
        >
          <ChevronLeft size={24} />
        </motion.button>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center relative h-[32rem]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="flex flex-col items-center w-full absolute inset-0 pt-4 cursor-pointer"
              onClick={() => onSelect(activeItem.id)}
            >
              {/* Card Icon */}
              <div 
                className={cn(
                  "w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center rounded-[3rem] sm:rounded-[4rem]",
                  "bg-white/[0.02] border border-white/5 shadow-2xl transition-all duration-500",
                  "hover:bg-white/[0.04] hover:border-white/10"
                )}
              >
                <activeItem.icon 
                  className={cn("w-24 h-24 sm:w-32 sm:h-32", activeItem.color)} 
                  strokeWidth={1} 
                />
              </div>

              {/* Text Info */}
              <div className="mt-12 flex flex-col items-center text-center px-4 w-full max-w-xl">
                {/* Subtitle / Category */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-[1px] w-12 bg-zinc-800" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#ff3366]">
                    {activeItem.buttonLabel}
                  </span>
                  <div className="h-[1px] w-12 bg-zinc-800" />
                </div>

                {/* Title */}
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight capitalize mb-4">
                  {activeItem.label}
                </h2>
                
                {/* Description */}
                <p className="text-zinc-500 text-sm sm:text-base font-medium leading-relaxed">
                  {activeItem.description}
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className="w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all pointer-events-auto"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

    </div>
  );
}

