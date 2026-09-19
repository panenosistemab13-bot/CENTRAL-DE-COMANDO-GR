import React from 'react';
import { cn } from '../../lib/utils';

interface GlassPanel3DProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'dark' | 'metallic';
  showBrackets?: boolean;
  onClick?: () => void;
  id?: string;
  key?: React.Key;
}

export function GlassPanel3D({
  children,
  className,
  variant = 'default',
  showBrackets = true,
  onClick,
  id
}: GlassPanel3DProps) {
  const variantClasses = {
    default: 'bg-[#0b1329]/80 border-sky-500/20 shadow-[0_15px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)]',
    glow: 'bg-[#0d1836]/90 border-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.15),0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)]',
    dark: 'bg-[#070c18]/90 border-slate-800/80 shadow-[0_20px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.05)]',
    metallic: 'bg-gradient-to-b from-slate-900/90 via-[#0b1528]/95 to-[#070d1a]/95 border-slate-700/60 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.18)]'
  }[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden group",
        variantClasses,
        onClick && "cursor-pointer hover:border-sky-400/50 hover:translate-y-[-2px]",
        className
      )}
    >
      {/* Top Specular Bevel Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

      {/* HUD Corner Brackets */}
      {showBrackets && (
        <>
          <div className="hud-bracket hud-bracket-tl" />
          <div className="hud-bracket hud-bracket-tr" />
          <div className="hud-bracket hud-bracket-bl" />
          <div className="hud-bracket hud-bracket-br" />
        </>
      )}

      {children}
    </div>
  );
}
