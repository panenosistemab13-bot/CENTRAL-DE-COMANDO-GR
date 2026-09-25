import React from 'react';
import { Sparkles, Radio, ShieldAlert, Truck, Building2 } from 'lucide-react';

export default function FooterCinema() {
  return (
    <footer className="w-full bg-[#0d0704] border-t border-[#3d2314] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a88d74] relative z-20 select-none">
      {/* Left: Tagline */}
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-[#caa031]" />
        <span className="font-serif italic text-[#e2ba61] text-xs font-semibold">
          Qualidade que move o seu dia.
        </span>
      </div>

      {/* Center: Real-Time Operational Counters */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-[#d8c2aa]">
          <Building2 size={13} className="text-[#caa031]" />
          <span className="font-bold text-[#ffe699]">11</span> Unidades
        </div>

        <div className="flex items-center gap-1.5 text-[#d8c2aa]">
          <Radio size={13} className="text-[#caa031]" />
          <span className="font-bold text-[#ffe699]">69</span> Iscas
        </div>

        <div className="flex items-center gap-1.5 text-[#d8c2aa]">
          <Truck size={13} className="text-emerald-400" />
          <span className="font-bold text-emerald-400">32</span> Em rota
        </div>

        <div className="flex items-center gap-1.5 text-[#d8c2aa]">
          <ShieldAlert size={13} className="text-amber-400" />
          <span className="font-bold text-amber-400">4</span> Alertas
        </div>
      </div>

      {/* Right: Copyright & Mini Coffee Bean Art */}
      <div className="flex items-center gap-2 text-[10px] text-[#8c735d]">
        {/* Tiny Roasted Coffee Beans Vector */}
        <div className="flex items-center gap-0.5">
          <span className="w-2 h-1.5 rounded-full bg-[#caa031] inline-block rotate-12" />
          <span className="w-2 h-1.5 rounded-full bg-[#8c6136] inline-block -rotate-12" />
        </div>
        <span>A&B Café • Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
