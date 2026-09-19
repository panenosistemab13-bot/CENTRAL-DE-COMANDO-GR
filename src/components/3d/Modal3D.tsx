import React from 'react';
import { X, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassPanel3D } from './GlassPanel3D';

interface Modal3DProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal3D({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl'
}: Modal3DProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <GlassPanel3D
        className={cn("w-full border-sky-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col p-0 overflow-hidden", maxWidth)}
        variant="glow"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base font-black font-mono uppercase tracking-wider text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-sans text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] no-scrollbar">
          {children}
        </div>
      </GlassPanel3D>
    </div>
  );
}
