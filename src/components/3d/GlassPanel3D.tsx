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
    default: 'bg-white border-[#d6ccbe] shadow-xs text-stone-900',
    glow: 'bg-[#fbf9f5] border-[#d6ccbe] shadow-md text-stone-900',
    dark: 'bg-[#181a1f] border-stone-800 text-stone-100 shadow-lg',
    metallic: 'bg-gradient-to-b from-white via-[#fbf9f5] to-[#f4ede4] border-[#d6ccbe] shadow-xs text-stone-900'
  }[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden group",
        variantClasses,
        onClick && "cursor-pointer hover:border-[#9b1526] hover:translate-y-[-2px]",
        className
      )}
    >
      {/* Top Specular Bevel Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d6ccbe] to-transparent pointer-events-none" />

      {/* HUD Corner Brackets - subtle warm gray */}
      {showBrackets && (
        <>
          <div className="hud-bracket hud-bracket-tl opacity-40" />
          <div className="hud-bracket hud-bracket-tr opacity-40" />
          <div className="hud-bracket hud-bracket-bl opacity-40" />
          <div className="hud-bracket hud-bracket-br opacity-40" />
        </>
      )}

      {children}
    </div>
  );
}
