import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Bell, User, CheckCircle2, ChevronDown, FileSpreadsheet } from 'lucide-react';
import TruckHeaderVisual3D from '../3d/TruckHeaderVisual3D';

interface HeaderCinemaProps {
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export default function HeaderCinema({ onOpenNotifications, onOpenProfile }: HeaderCinemaProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${String(currentTime.getDate()).padStart(2, '0')}/${String(currentTime.getMonth() + 1).padStart(2, '0')}/${currentTime.getFullYear()}`;
  const formattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

  return (
    <header className="relative w-full rounded-2xl overflow-hidden card-3d-cinema p-3.5 sm:p-4 mb-4 select-none">
      {/* 3D Cinematic Sunset Highway Background */}
      <TruckHeaderVisual3D />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Greeting & Welcome Title */}
        <div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-[#fff5d1] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Olá, Jefferson Augusto
          </h2>
          <p className="text-xs text-[#d8c2aa] mt-0.5 max-w-xl leading-relaxed">
            Bem-vindo ao sistema A&B CAFÉ. Controle total da sua operação com dados em tempo real.
          </p>
        </div>

        {/* Right: Operational Status Chips & User Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chip 1: Última Atualização */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a0f08]/90 border border-[#e2ba61]/30 shadow-md backdrop-blur-md text-xs">
            <div className="w-6 h-6 rounded-lg bg-[#331e12] flex items-center justify-center text-[#e2ba61] shrink-0">
              <Clock size={13} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-[#a88d74] uppercase tracking-wider">
                Última Atualização
              </div>
              <div className="font-mono font-bold text-[11px] text-[#ffe699]">
                {formattedDate} às {formattedTime}
              </div>
            </div>
          </div>

          {/* Chip 2: Período */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a0f08]/90 border border-[#e2ba61]/30 shadow-md backdrop-blur-md text-xs">
            <div className="w-6 h-6 rounded-lg bg-[#331e12] flex items-center justify-center text-[#e2ba61] shrink-0">
              <FileSpreadsheet size={13} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-[#a88d74] uppercase tracking-wider">
                Período
              </div>
              <div className="font-bold text-[11px] text-[#f7ede1]">
                Relatório Importado
              </div>
            </div>
          </div>

          {/* Chip 3: Site */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a0f08]/90 border border-[#e2ba61]/30 shadow-md backdrop-blur-md text-xs">
            <div className="w-6 h-6 rounded-lg bg-[#331e12] flex items-center justify-center text-[#e2ba61] shrink-0">
              <MapPin size={13} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-[#a88d74] uppercase tracking-wider">
                Site
              </div>
              <div className="font-bold text-[11px] text-[#ffe699]">
                3 COR - BH
              </div>
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl bg-[#1a0f08]/90 hover:bg-[#2e1a0f] border border-[#e2ba61]/30 flex items-center justify-center text-[#e2ba61] hover:text-[#ffe699] transition-all cursor-pointer shadow-md"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center border border-amber-300 shadow-sm animate-pulse">
              3
            </span>
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#1a0f08]/90 hover:bg-[#2e1a0f] border border-[#e2ba61]/30 shadow-md cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#caa031] to-[#6b4c10] flex items-center justify-center text-[#1a0f07] font-bold text-xs shadow-inner">
              JA
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#f7ede1] leading-tight">
                Jefferson Augusto
              </div>
              <div className="text-[10px] text-[#caa031] leading-tight">
                Sistema Web
              </div>
            </div>
          </div>

          {/* Sistema Online Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
