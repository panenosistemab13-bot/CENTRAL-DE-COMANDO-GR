import React from 'react';
import { cn } from '../lib/utils';

interface MercosulPlateProps {
  plate: string;
  className?: string;
}

export function MercosulPlate({ plate, className }: MercosulPlateProps) {
  const cleanPlate = plate || 'QWK6A22';
  return (
    <div className={cn("inline-flex flex-col border-2 border-stone-800 rounded-md overflow-hidden shadow-xs bg-white text-stone-900 font-mono font-black uppercase text-center select-none", className)}>
      <div className="bg-[#003399] text-white text-[7px] font-bold tracking-widest py-0.5 flex items-center justify-center gap-1 border-b border-stone-800">
        <span>🇧🇷</span> BRASIL
      </div>
      <div className="bg-white text-stone-900 text-xs tracking-wider py-0.5 px-1 leading-none">
        {cleanPlate}
      </div>
    </div>
  );
}
