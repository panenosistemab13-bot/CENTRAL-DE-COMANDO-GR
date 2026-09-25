import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Truck,
  FileCheck2,
  ClipboardCheck,
  CalendarDays,
  Sliders,
  Users2,
  Route,
  Container,
  Check,
  X,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mercosul Plate Component
export function MercosulPlate({ plate, className }: { plate: string; className?: string }) {
  if (!plate || plate === '-' || plate.trim() === '') {
    return <span className="text-stone-400 font-mono font-bold text-[10px]">-</span>;
  }
  const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[96px] h-[30px] shrink-0 rounded-[5px] shadow-sm border-2 border-[#1c1c1c] bg-white transition-transform hover:scale-105 cursor-default",
        className
      )}
      title={`Placa Mercosul: ${clean}`}
    >
      <div className="w-full bg-[#003399] h-[8px] flex items-center justify-between px-1 leading-none relative">
        <span className="text-[4.5px] text-white font-sans font-bold tracking-tight">BR</span>
        <span className="text-[5.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          BRASIL
        </span>
        <div className="w-[6px] h-[4px] bg-[#009b3a] border border-white/30 flex items-center justify-center relative rounded-[1px] overflow-hidden shrink-0">
          <div className="w-[3px] h-[2px] bg-[#ffdf00] rotate-45 transform flex items-center justify-center">
            <div className="w-[1px] h-[1px] bg-[#002776] rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex items-center justify-center bg-gradient-to-b from-[#ffffff] via-[#fafafa] to-[#ece8df] px-1">
        <span
          className="text-[#151515] font-black text-[11.5px] tracking-wider leading-none"
          style={{
            fontFamily: "'Courier New', monospace, sans-serif",
            letterSpacing: '0.08em',
            textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.9)'
          }}
        >
          {clean}
        </span>
      </div>
    </div>
  );
}

export interface MasterRecord {
  id: string;
  itemImage?: string;
  itemTitle: string;
  itemSubtitle?: string;
  plate?: string;
  secondaryPlate?: string;
  personName: string;
  personRole?: string;
  personAvatar?: string;
  categoryTag: string;
  progressValue: number; // 0 - 100 or fraction
  progressText?: string;
  status: 'concluido' | 'pendente' | 'em_atraso' | 'em_operacao' | 'em_transito';
  statusLabel?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface MasterModulePageProps {
  moduleKey?: string;
  titleKicker?: string;
  headline?: string;
  subtext?: string;
  heroImage?: string;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  metrics?: {
    total: number;
    completed: number;
    pending: number;
    delayed: number;
  };
  donutData?: {
    score: number; // e.g. 67 for 67%
    scoreLabel: string; // e.g. "Conformidade"
    legend: {
      completed: number;
      pending: number;
      delayed: number;
      total: number;
    };
  };
  records?: MasterRecord[];
  onViewRecord?: (record: MasterRecord) => void;
  customActionContent?: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  hideHeroBanner?: boolean;
}

export function MasterModulePage({
  titleKicker,
  headline,
  subtext,
  heroImage,
  primaryCtaLabel,
  onPrimaryCta,
  metrics,
  donutData,
  records = [],
  onViewRecord,
  title,
  subtitle,
  badge,
  onBack,
  actions,
  children,
  hideHeroBanner = false,
}: MasterModulePageProps) {
  if (children) {
    return (
      <div className="w-full h-full flex flex-col gap-4 min-h-0 overflow-y-auto no-scrollbar select-none font-sans">
        <div className="bg-white rounded-3xl p-5 border border-[#d6ccbe] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 border border-[#d6ccbe] cursor-pointer transition-all"
                title="Voltar"
              >
                <ArrowUpRight size={18} className="rotate-180" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-600 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <span>{badge || '// HUD 4K'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 uppercase tracking-tight">
                {title || headline || 'Módulo'}
              </h1>
              <p className="text-xs text-stone-500 font-sans">
                {subtitle || subtext || ''}
              </p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {children}
      </div>
    );
  }

  const [filter, setFilter] = useState<'all' | 'concluido' | 'pendente' | 'em_atraso'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MasterRecord | null>(null);

  const safeRecords = records || [];
  const filteredRecords = useMemo(() => {
    return safeRecords.filter(r => {
      const matchSearch =
        r.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.plate && r.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.categoryTag && r.categoryTag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (filter === 'concluido') return r.status === 'concluido' || r.status === 'em_operacao';
      if (filter === 'pendente') return r.status === 'pendente' || r.status === 'em_transito';
      if (filter === 'em_atraso') return r.status === 'em_atraso';

      return true;
    });
  }, [safeRecords, searchTerm, filter]);

  return (
    <div className="w-full h-full flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO ROW: 16:9 Photography Banner + Donut Gauge Card             */}
      {/* ========================================================================= */}
      {!hideHeroBanner && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 shrink-0">
          
          {/* Left Hero Box (Spans 3 Columns) */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden relative border border-[#dacfc2] shadow-sm bg-stone-900 min-h-[175px] flex flex-col justify-between p-4 sm:p-5 group">
            
            {/* Background 4K Photography */}
            <img
              src={heroImage}
              alt={headline}
              className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
            />

            {/* Vignette Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent pointer-events-none" />

            {/* Top Row: Shield Badge + Headline Content */}
            <div className="relative z-10 flex items-start gap-4">
              
              {/* Emblem Badge 3D */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#831828] via-[#6d1320] to-[#450912] p-0.5 border border-red-400/40 shadow-lg shadow-red-950/50 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#18080a]/90 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck size={22} className="text-red-400 animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black tracking-widest text-red-400 uppercase">
                    {titleKicker}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-white bg-red-900/60 px-1.5 py-0.5 rounded border border-red-500/30">
                    1920x2160P
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase font-mono">
                  {headline}
                </h2>
                <p className="text-xs text-stone-300 font-medium line-clamp-1 opacity-90 mt-0.5">
                  {subtext}
                </p>
              </div>
            </div>

            {/* Bottom Row: 4 Overlaid Status Pill Counters */}
            <div className="relative z-10 flex items-center gap-2 flex-wrap pt-3 border-t border-white/10">
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
                <Container size={14} className="text-stone-300" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Total:</span>
                  <span className="text-xs font-mono font-black text-white">{metrics.total}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-emerald-400/80 uppercase font-mono font-bold">Concluídos:</span>
                  <span className="text-xs font-mono font-black text-emerald-200">{metrics.completed}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-300">
                <Clock size={14} className="text-amber-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-amber-400/80 uppercase font-mono font-bold">Pendentes:</span>
                  <span className="text-xs font-mono font-black text-amber-200">{metrics.pending}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/70 backdrop-blur-md border border-red-500/30 text-red-300">
                <AlertTriangle size={14} className="text-red-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-red-400/80 uppercase font-mono font-bold">Em atraso:</span>
                  <span className="text-xs font-mono font-black text-red-200">{metrics.delayed}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Gauge Card (1 Column) - Donut Chart 3D */}
          <div className="lg:col-span-1 rounded-2xl bg-white/95 border border-[#dacfc2] p-4 flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
            
            <div className="w-full flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Sparkles size={12} className="text-[#831828]" />
                MÉTRICA GLOBAL
              </span>
              <span className="text-[9px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                REAL TIME
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2 w-full">
              {/* 3D Donut SVG Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-200"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#831828] transition-all duration-1000 ease-out"
                    strokeDasharray={`${donutData.score}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-stone-900 font-mono leading-none">
                    {donutData.score}%
                  </span>
                  <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-tight mt-0.5">
                    {donutData.scoreLabel}
                  </span>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="flex flex-col gap-1 text-[10px] font-mono font-semibold text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Concluídos: <strong className="text-stone-900">{donutData.legend.completed}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pendentes: <strong className="text-stone-900">{donutData.legend.pending}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Em atraso: <strong className="text-stone-900">{donutData.legend.delayed}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5 border-t border-stone-200 text-stone-500">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span>Total: <strong className="text-stone-900">{donutData.legend.total}</strong></span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER FILTER & ACTION CONTROLS ROW                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white/90 p-2 rounded-2xl border border-[#dacfc2] shadow-sm shrink-0">
        
        {/* Primary CTA + Segmented Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          
          {primaryCtaLabel && (
            <button
              onClick={onPrimaryCta}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#831828] via-[#6e1320] to-[#550c18] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 active:scale-95 border border-red-900/40"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>{primaryCtaLabel}</span>
            </button>
          )}

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filter === 'all'
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('concluido')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filter === 'concluido'
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFilter('pendente')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filter === 'pendente'
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('em_atraso')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                filter === 'em_atraso'
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Em atraso
            </button>
          </div>

        </div>

        {/* Right Search Input & Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-mono font-bold">
            <CalendarIcon size={13} />
            <span>23/09/2026</span>
          </div>

          <button
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
            title="Filtros Avançados"
          >
            <SlidersHorizontal size={14} />
          </button>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar veículo, placa ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 focus:bg-white border border-stone-200 focus:border-[#831828] rounded-xl py-1.5 pl-9 pr-3 text-xs text-stone-800 placeholder-stone-400 outline-none transition-all font-medium"
            />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN RECORDS CANVAS (High-Density Widescreen Glass Grid Cards)          */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
        
        {filteredRecords.length === 0 ? (
          <div className="w-full h-48 rounded-2xl bg-white/70 border border-stone-200 flex flex-col items-center justify-center p-8 text-center text-stone-500">
            <Container size={32} className="text-stone-300 mb-2" />
            <span className="text-sm font-bold text-stone-800">Nenhum registro encontrado</span>
            <span className="text-xs text-stone-500 mt-0.5">Ajuste os filtros de pesquisa para visualizar os dados do módulo.</span>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isCompleted = record.status === 'concluido' || record.status === 'em_operacao';
            const isPending = record.status === 'pendente' || record.status === 'em_transito';
            const isDelayed = record.status === 'em_atraso';

            return (
              <div
                key={record.id}
                onClick={() => onViewRecord && onViewRecord(record)}
                className="w-full bg-white hover:bg-stone-50/90 border border-[#dacfc2] hover:border-[#831828]/50 rounded-2xl p-2.5 sm:p-3 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col md:flex-row items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Col 1: Item Thumbnail & Title */}
                <div className="flex items-center gap-3 w-full md:w-1/4 min-w-[200px]">
                  {record.itemImage ? (
                    <div className="w-12 h-10 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-sm">
                      <img
                        src={record.itemImage}
                        alt={record.itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-[#831828] to-[#4e0913] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Truck size={18} />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-stone-900 uppercase truncate tracking-tight font-mono">
                      {record.itemTitle}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium truncate">
                      {record.itemSubtitle || 'Operação Regular'}
                    </span>
                  </div>
                </div>

                {/* Col 2: Mercosul Plate Badge */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-start md:justify-center">
                  <MercosulPlate plate={record.plate || 'ABC-1234'} />
                  {record.secondaryPlate && (
                    <ChevronRight size={14} className="text-stone-300" />
                  )}
                  {record.secondaryPlate && (
                    <MercosulPlate plate={record.secondaryPlate} />
                  )}
                </div>

                {/* Col 3: Responsible Person & Avatar */}
                <div className="flex items-center gap-2.5 w-full md:w-1/5 min-w-[150px]">
                  <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center text-stone-700 font-bold text-xs">
                    {record.personAvatar ? (
                      <img src={record.personAvatar} alt={record.personName} className="w-full h-full object-cover" />
                    ) : (
                      record.personName.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {record.personName}
                    </span>
                    <span className="text-[9.5px] text-stone-500 font-medium truncate">
                      {record.personRole || 'Operador Responsável'}
                    </span>
                  </div>
                </div>

                {/* Col 4: Category Pill */}
                <div className="w-full md:w-auto shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {record.categoryTag}
                  </span>
                </div>

                {/* Col 5: Progress Bar */}
                <div className="flex flex-col gap-1 w-full md:w-32 shrink-0">
                  <div className="flex items-center justify-between text-[9.5px] font-mono font-bold text-stone-600">
                    <span>PROGRESSO</span>
                    <span>{record.progressText || `${record.progressValue}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        isCompleted ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-red-600"
                      )}
                      style={{ width: `${Math.min(100, record.progressValue)}%` }}
                    />
                  </div>
                </div>

                {/* Col 6: Status Tag */}
                <div className="w-full md:w-auto shrink-0">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : isPending
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-red-100 text-red-800 border-red-300"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isCompleted ? "bg-emerald-600" : isPending ? "bg-amber-600" : "bg-red-600"
                    )} />
                    {record.statusLabel || (isCompleted ? 'Concluído' : isPending ? 'Pendente' : 'Em atraso')}
                  </span>
                </div>

                {/* Col 7: Timestamp */}
                <div className="text-[10px] font-mono text-stone-500 shrink-0 hidden lg:block">
                  {record.timestamp}
                </div>

                {/* Col 8: Action Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRecord && onViewRecord(record);
                    }}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Visualizar detalhes"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Mais opções"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default MasterModulePage;

