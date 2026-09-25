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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <GlassPanel3D
        className={cn("w-full border-[#d6ccbe] shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white", maxWidth)}
        variant="default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 p-5 border-b border-[#e7dac9] bg-[#fbf9f5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-[#9b1526]">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-base font-black font-mono uppercase tracking-wider text-stone-900">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-sans text-stone-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer border border-stone-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] no-scrollbar text-stone-900">
          {children}
        </div>
      </GlassPanel3D>
    </div>
  );
}
