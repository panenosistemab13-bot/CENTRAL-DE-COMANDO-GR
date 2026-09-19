import React from 'react';
import { GlassPanel3D } from './GlassPanel3D';
import { cn } from '../../lib/utils';
import { Filter, Search } from 'lucide-react';

interface FilterPanel3DProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FilterPanel3D({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  children,
  className
}: FilterPanel3DProps) {
  return (
    <GlassPanel3D className={cn("p-3.5 flex flex-wrap items-center justify-between gap-3", className)} variant="metallic">
      {/* Search Input if provided */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors shadow-inner"
          />
        </div>
      )}

      {/* Children filters */}
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </GlassPanel3D>
  );
}
