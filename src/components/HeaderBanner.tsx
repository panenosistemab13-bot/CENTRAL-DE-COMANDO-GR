import React, { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  CircleUserRound,
  ChevronDown,
  Bell,
  Settings,
  Power,
  RefreshCw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderBannerProps {
  user?: UserProfile;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onSelectSite?: (site: string) => void;
}

export default function HeaderBanner({
  user = {
    name: 'Jefferson Augusto',
    role: 'Sistema Web',
    site: '3 COR - BH',
    email: 'jefferson@3coracoes.com.br'
  },
  onOpenSettings,
  onOpenNotifications,
  onSelectSite
}: HeaderBannerProps) {
  const [selectedSite, setSelectedSite] = useState<string>(user.site || '3 COR - BH');
  const [showSiteDropdown, setShowSiteDropdown] = useState<boolean>(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>('Relatório Importado');

  const sites = [
    '3 COR - BH',
    'Matriz - São Paulo',
    'CD Varginha - Sul de Minas',
    'Porto de Santos - Exportação',
    'Unidade Manhuaçu - Matas de Minas'
  ];

  const periods = [
    'Relatório Importado',
    'Hoje (Tempo Real)',
    'Últimos 7 Dias',
    'Mês Atual (Setembro/2026)',
    'Safra 2026'
  ];

  return (
    <header className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(40,25,12,0.14)] border border-[#e2d5c3] mb-5 bg-[#1a0f07]">
      {/* Background Panoramic 3D Truck Sunset Image with Cinematic Lighting */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_truck_sunset_1789847050862.jpg"
          alt="Rodovia ao Pôr do Sol A&B Café"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.88] saturate-[1.1]"
          onError={(e) => {
            e.currentTarget.src = '/background-cafe.jpg';
          }}
        />
        {/* Soft Gold Ambient Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#180e07]/90 via-[#180e07]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#180e07]/80 via-transparent to-[#180e07]/40" />
      </div>

      {/* Top Floating Utility Icon Row */}
      <div className="relative z-20 flex justify-end items-center gap-2.5 px-6 pt-3">
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/30 text-amber-200 flex items-center justify-center transition-all hover:scale-105"
          title="4 Notificações Pendentes"
        >
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
            4
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/30 text-amber-200 flex items-center justify-center transition-all hover:scale-105"
          title="Configurações do Sistema"
        >
          <Settings size={15} />
        </button>

        <button
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/30 text-amber-200 flex items-center justify-center transition-all hover:scale-105"
          title="Perfil / Logout"
        >
          <Power size={15} />
        </button>
      </div>

      {/* Main Banner Content: Left Welcome & Right Info Chips */}
      <div className="relative z-10 px-6 pb-6 pt-2 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Left Side: Editorial Typography Greeting */}
        <div className="max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white tracking-tight drop-shadow-md">
            Olá, <span className="font-bold not-italic font-serif">{user.name}</span>
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-amber-300 uppercase tracking-widest mt-1 drop-shadow">
            Bem-vindo ao sistema A&B Café
          </h2>
          <p className="text-xs sm:text-sm text-stone-200/90 font-medium leading-relaxed mt-1.5 max-w-lg drop-shadow-sm">
            Aqui você tem o controle total da sua operação, com dados em tempo real e inteligência para tomar as melhores decisões.
          </p>
        </div>

        {/* Right Side: Frosted Glass Filter Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chip 1: Última Atualização */}
          <div className="bg-black/55 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5 text-white shadow-lg">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Clock size={13} />
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-300">
                Última atualização
              </span>
              <strong className="block text-xs font-semibold text-amber-200 font-mono">
                18/09/2026 • 10:21
              </strong>
            </div>
          </div>

          {/* Chip 2: Período Selectable */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="bg-black/55 hover:bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5 text-white shadow-lg transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <CalendarDays size={13} />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-300">
                  Período
                </span>
                <strong className="block text-xs font-semibold text-white">
                  {period}
                </strong>
              </div>
              <ChevronDown size={14} className="text-stone-400 ml-1" />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#1a110a] border border-amber-500/30 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      period === p
                        ? 'bg-amber-500 text-[#2b180d] font-bold'
                        : 'text-stone-200 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chip 3: Site Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSiteDropdown(!showSiteDropdown)}
              className="bg-black/55 hover:bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2.5 text-white shadow-lg transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <MapPin size={13} />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-300">
                  Site
                </span>
                <strong className="block text-xs font-bold text-amber-300 font-mono">
                  {selectedSite}
                </strong>
              </div>
              <ChevronDown size={14} className="text-stone-400 ml-1" />
            </button>

            {showSiteDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#1a110a] border border-amber-500/30 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {sites.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSite(s);
                      if (onSelectSite) onSelectSite(s);
                      setShowSiteDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedSite === s
                        ? 'bg-amber-500 text-[#2b180d] font-bold'
                        : 'text-stone-200 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chip 4: User Profile Capsule */}
          <div className="bg-black/55 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-400/30 flex items-center gap-2.5 text-white shadow-lg">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 flex items-center justify-center text-[#2b180d] font-bold shrink-0 shadow">
              JA
            </div>
            <div>
              <strong className="block text-xs font-bold text-white leading-tight">
                {user.name}
              </strong>
              <span className="block text-[10px] text-amber-300/90 font-medium">
                {user.role}
              </span>
            </div>
            <ChevronDown size={13} className="text-stone-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
