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
    <GlassPanel3D className={cn("p-3.5 flex flex-wrap items-center justify-between gap-3", className)} variant="default">
      {/* Search Input if provided */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white border border-[#d6ccbe] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b1526] transition-colors shadow-xs"
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
