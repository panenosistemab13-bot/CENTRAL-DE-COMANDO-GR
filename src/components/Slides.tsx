import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Radio,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Search,
  ClipboardPaste,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Shield,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Maximize2,
  Crosshair,
  Download,
  Plus,
  Trash2,
  FileSpreadsheet,
  X,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { cn } from '../lib/utils';
import { BrazilMapHUD } from './BrazilMapHUD';
import { StatusAnalyticsHUD } from './StatusAnalyticsHUD';
import { StatusDetailHUD } from './StatusDetailHUD';
import { DestinoRankingHUD } from './DestinoRankingHUD';
import { UnidadeAnalyticsHUD } from './UnidadeAnalyticsHUD';

export interface IscaDataRow {
  id: string;
  idIsca: string;
  destino: string;
  status: string;
  obs1: string;
  dataStatus: string;
  carreta: string;
  cavalo: string;
  motorista: string;
  unidade: string;
}

// Initial sample dataset pre-loaded directly from attached image.png + additional status samples
export const INITIAL_SLIDES_DATA: IscaDataRow[] = [];

export type ActiveTabType = 'status' | 'destinos' | 'unidade' | 'import';

// List of all units based on user requirement
export const ALL_UNIDADES = [
  'MONTES CLAROS',
  'SANTA LUZIA',
  'VIANA',
  'VIANA (OP. RG)',
  'VIANA (OP. TIMS)',
  'VIANA (OP. APEX)',
  'CUIABÁ'
];

// Standardized Status Categories requested by prompt
export const STATUS_CATEGORIES = [
  { key: 'Em Rota Ida', label: 'Em Rota Ida', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' },
  { key: 'Em Rota Volta', label: 'Em Rota Volta', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { key: 'No Destino', label: 'No Destino', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { key: 'Preparação', label: 'Preparação', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { key: 'Extraviada', label: 'Extraviada', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  { key: 'Possível Extravio', label: 'Possível Extravio', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
  { key: 'Disponível', label: 'Disponível', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
];

export function normalizeStatus(statusRaw: string): string {
  if (!statusRaw) return 'Outros';
  const clean = statusRaw.trim().toUpperCase();
  if (clean.includes('ROTA') && clean.includes('IDA')) return 'Em Rota Ida';
  if (clean.includes('ROTA') && clean.includes('VOLTA')) return 'Em Rota Volta';
  if (clean.includes('DESTINO')) return 'No Destino';
  if (clean.includes('PREPA')) return 'Preparação';
  if (clean.includes('POSS') || clean.includes('POSSIVEL') || clean.includes('POSSÍVEL')) return 'Possível Extravio';
  if (clean.includes('EXTRAV')) return 'Extraviada';
  if (clean.includes('DISPO') || clean.includes('DISPONIVEL') || clean.includes('DISPONÍVEL')) return 'Disponível';
  return statusRaw;
}

export default function Slides() {
  const [data, setData] = useState<IscaDataRow[]>(() => {
    const saved = localStorage.getItem('slides_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  React.useEffect(() => {
    localStorage.setItem('slides_data', JSON.stringify(data));
  }, [data]);
  
  const [activeTab, setActiveTab] = useState<ActiveTabType>('status');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(
      r =>
        r.idIsca.toLowerCase().includes(term) ||
        r.destino.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term) ||
        r.motorista.toLowerCase().includes(term) ||
        r.unidade.toLowerCase().includes(term) ||
        r.cavalo.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Aggregation 1: Status Counts
  const statusStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Em Rota Ida': 0,
      'Em Rota Volta': 0,
      'No Destino': 0,
      'Preparação': 0,
      'Extraviada': 0,
      'Possível Extravio': 0,
      'Disponível': 0
    };

    filteredData.forEach(row => {
      const norm = normalizeStatus(row.status);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      } else {
        counts[norm] = (counts[norm] || 0) + 1;
      }
    });

    const total = filteredData.length || 1;
    return STATUS_CATEGORIES.map(cat => ({
      ...cat,
      count: counts[cat.key] || 0,
      percentage: Math.round(((counts[cat.key] || 0) / total) * 100)
    }));
  }, [filteredData]);

  // Aggregation 2: Destination Counts (Destinos)
  const destinoStats = useMemo(() => {
    const counts: Record<string, { count: number; iscas: string[]; drivers: string[] }> = {};
    filteredData.forEach(row => {
      let dest = row.destino.trim();
      if (dest.toUpperCase() === 'GOVERNADOR VALADARES') dest = 'GOV';
      else if (!dest) dest = 'DISPONIVEL';
      
      if (!counts[dest]) {
        counts[dest] = { count: 0, iscas: [], drivers: [] };
      }
      counts[dest].count++;
      if (row.idIsca) counts[dest].iscas.push(row.idIsca);
      if (row.motorista && !counts[dest].drivers.includes(row.motorista)) {
        counts[dest].drivers.push(row.motorista);
      }
    });

    return Object.entries(counts)
      .map(([name, val]) => ({
        name,
        count: val.count,
        iscas: val.iscas,
        drivers: val.drivers
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Aggregation 3: Unidade Counts (Unidades)
  const unidadeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(row => {
      const unit = row.unidade.trim();
      if (unit) {
        counts[unit] = (counts[unit] || 0) + 1;
      }
    });

    return ALL_UNIDADES.map(name => ({
      name,
      count: counts[name] || 0
    }));
  }, [filteredData]);

  // Parse TSV / CSV text pasted from user spreadsheet
  const handleParsePastedText = (rawText: string) => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const parsedRows: IscaDataRow[] = [];

    // Detect delimiter (Tab or Semicolon or Comma)
    lines.forEach((line, index) => {
      let delimiter = '\t';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';')) delimiter = ';';
      else if (line.includes(',')) delimiter = ',';

      const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      
      // Check if line is header
      if (index === 0 && (cols[0].toUpperCase().includes('ID') || cols[0].toUpperCase().includes('ISCA'))) {
        return; // Skip header line
      }

      if (cols.length > 0 && cols[0]) {
        parsedRows.push({
          id: (Date.now() + index).toString(),
          idIsca: cols[0] || `R${1000000 + index}`,
          destino: cols[1] || '',
          status: cols[2] || 'DISPONIVEL',
          obs1: cols[3] || '',
          dataStatus: cols[4] || 'Hoje',
          carreta: cols[5] || '',
          cavalo: cols[6] || '',
          motorista: cols[7] || '',
          unidade: (cols[8] && cols[8].trim().toUpperCase() === 'BELO HORIZONTE') ? 'SANTA LUZIA' : (cols[8] || 'SANTA LUZIA')
        });
      }
    });

    if (parsedRows.length > 0) {
      setData(parsedRows);
      setPastedText('');
      setShowImportModal(false);
    }
  };

  // Timeline series for line chart simulation
  const timelineData = useMemo(() => {
    return [
      { hora: '06:00', emRota: Math.floor(filteredData.length * 0.3), noDestino: 2, alerta: 0 },
      { hora: '09:00', emRota: Math.floor(filteredData.length * 0.5), noDestino: 4, alerta: 1 },
      { hora: '12:00', emRota: Math.floor(filteredData.length * 0.7), noDestino: 6, alerta: 1 },
      { hora: '15:00', emRota: Math.floor(filteredData.length * 0.8), noDestino: 9, alerta: 2 },
      { hora: '18:00', emRota: filteredData.length, noDestino: 12, alerta: 2 },
    ];
  }, [filteredData]);

  return (
    <div className="w-full min-h-screen bg-[#030712] text-slate-100 font-sans p-3 sm:p-6 space-y-6 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Custom Wallpaper Background & 3D High-Tech HUD Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* User Defined Background Image from Google Drive */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/d/1-OMBqWyF1Lt7YwnSHUYtU8-DeNGpsOE1'), url('https://drive.google.com/uc?export=view&id=1-OMBqWyF1Lt7YwnSHUYtU8-DeNGpsOE1')`
          }}
        />

        {/* Dark Vignette Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/70 to-[#030712]/90" />

        {/* Holographic cyan grid background */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #00f0ff 1px, transparent 1px),
              linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} 
        />

        {/* Studio spotlight glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-400/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.015] to-transparent animate-pulse pointer-events-none" />
      </div>

      <div className="relative z-10 space-y-6 max-w-[110rem] mx-auto">

        {/* TOP HEADER - "Slides" High-Tech 4K Command Center Title */}
        <header className="bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden group">
          {/* Decorative Corner HUD Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* Cyan Glowing Header Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title Block */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.3)] shrink-0 relative group-hover:scale-105 transition-transform">
                <Globe className="w-8 h-8 text-cyan-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_10px_#00f0ff]" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-400 font-mono uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                    Slides
                  </h1>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                    <Radio className="w-3 h-3 text-cyan-400 animate-ping" />
                    4K COMMAND HUD UI
                  </span>
                </div>
                <p className="text-xs text-cyan-200/70 font-mono tracking-widest mt-1 uppercase flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  SISTEMA DE MONITORAMENTO DE ISCAS E RASTREAMENTO LOGÍSTICO
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Telemetry Counter Pill */}
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-4 py-2 flex items-center gap-3 font-mono shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-cyan-400/70">TOTAL DE ISCAS</span>
                  <span className="text-xl font-black text-cyan-300 font-mono">{data.length}</span>
                </div>
                <Database className="w-5 h-5 text-cyan-400 opacity-60" />
              </div>

              {/* Limpar Tudo Button */}
              <button
                onClick={() => setData([])}
                className="bg-slate-900/80 border border-rose-500/30 rounded-2xl px-4 py-3 flex items-center gap-2 font-mono hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-300">LIMPAR TUDO</span>
              </button>
            </div>
          </div>

          {/* HUD Navigation Tabs */}
          <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            
            {/* Abas requested by user styled as capsule dock with rivets */}
            <div className="flex items-center gap-2 bg-[#020617]/95 p-2 rounded-full border-2 border-cyan-500/40 font-mono shadow-[0_0_30px_rgba(0,240,255,0.15)] relative">
              {/* Corner cyan tech rivets */}
              <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-800 border border-cyan-400/60 shadow-[0_0_6px_#00f0ff] flex items-center justify-center">
                <div className="w-1 h-[1px] bg-cyan-950 rotate-45" />
              </div>
              <div className="absolute bottom-1 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-800 border border-cyan-400/60 shadow-[0_0_6px_#00f0ff] flex items-center justify-center">
                <div className="w-1 h-[1px] bg-cyan-950 rotate-45" />
              </div>
              <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-800 border border-cyan-400/60 shadow-[0_0_6px_#00f0ff] flex items-center justify-center">
                <div className="w-1 h-[1px] bg-cyan-950 -rotate-45" />
              </div>
              <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-800 border border-cyan-400/60 shadow-[0_0_6px_#00f0ff] flex items-center justify-center">
                <div className="w-1 h-[1px] bg-cyan-950 -rotate-45" />
              </div>

              <button
                onClick={() => setActiveTab('status')}
                className={cn(
                  "px-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'status'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.8)] font-black border border-cyan-300"
                    : "text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
              >
                <Activity className="w-4 h-4" />
                ABA STATUS
              </button>

              <button
                onClick={() => setActiveTab('destinos')}
                className={cn(
                  "px-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'destinos'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.8)] font-black border border-cyan-300"
                    : "text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
              >
                <MapPin className="w-4 h-4" />
                ABA DESTINOS ({destinoStats.length})
              </button>

              <button
                onClick={() => setActiveTab('unidade')}
                className={cn(
                  "px-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'unidade'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.8)] font-black border border-cyan-300"
                    : "bg-transparent text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
              >
                <Building2 className="w-4 h-4" />
                ABA UNIDADE ({unidadeStats.length})
              </button>

              <button
                onClick={() => setActiveTab('import')}
                className={cn(
                  "px-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'import'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.8)] font-black border border-cyan-300"
                    : "text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
              >
                <FileSpreadsheet className="w-4 h-4" />
                CAMPO DE IMPORTAÇÃO
              </button>
            </div>

            {/* Search Filter input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="FILTRAR ISCA, DESTINO, STATUS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-cyan-200 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* MAIN TAB CONTENT - 4 DYNAMIC VIEWS */}
        
        {/* ========================================================= */}
        {/* VIEW 1: ABA "STATUS" */}
        {/* ========================================================= */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* CENTRAL MAIN HIGHLIGHT - HIGHLY DETAILED 4K CARTOGRAPHIC MAP OF BRAZIL UI (16:9 HUD) */}
            <BrazilMapHUD
              selectedMapNode={selectedMapNode}
              setSelectedMapNode={setSelectedMapNode}
              hoveredCity={hoveredCity}
              setHoveredCity={setHoveredCity}
              count={filteredData.length}
              destinoStats={destinoStats}
            />
            {/* GROUPED STATUS ANALYTICS HUD WITH FULL SCREEN TOGGLE */}
            <StatusAnalyticsHUD
              statusStats={statusStats}
              totalIscas={filteredData.length}
            />

            {/* Live Data Table for Status with Fullscreen Toggle */}
            <StatusDetailHUD
              filteredData={filteredData}
              normalizeStatus={normalizeStatus}
              STATUS_CATEGORIES={STATUS_CATEGORIES}
            />
          </motion.div>
        )}


        {/* ========================================================= */}
        {/* VIEW 2: ABA "DESTINOS" */}
        {/* ========================================================= */}
        {activeTab === 'destinos' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Top Bar Chart: Destinations ranking with Fullscreen option */}
            <DestinoRankingHUD destinoStats={destinoStats} />

            {/* Destination Numeric HUD Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {destinoStats.map(dest => (
                <div
                  key={dest.name}
                  className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,240,255,0.05)] hover:border-cyan-400 transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-black text-sm text-white uppercase tracking-wider">{dest.name}</h4>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-xl text-xs font-black">
                      {dest.count} ISCAS
                    </span>
                  </div>

                  {/* List of Iscas attached */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="text-[10px] text-cyan-400/70 uppercase">CÓDIGOS DAS ISCAS:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.iscas.map(id => (
                        <span key={id} className="px-2 py-0.5 bg-slate-900 border border-cyan-500/30 rounded text-cyan-300 font-bold text-[10px]">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Drivers attached */}
                  {dest.drivers.length > 0 && (
                    <div className="pt-2 border-t border-cyan-500/10 text-[10px] text-slate-400">
                      MOTORISTAS: <span className="text-white font-bold">{dest.drivers.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}


        {/* ========================================================= */}
        {/* VIEW 3: ABA "UNIDADE" */}
        {/* ========================================================= */}
        {activeTab === 'unidade' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <UnidadeAnalyticsHUD
              unidadeStats={unidadeStats}
              totalDataCount={data.length}
            />
          </motion.div>
        )}


        {/* ========================================================= */}
        {/* VIEW 4: CAMPO DE IMPORTAÇÃO INTEGRADO */}
        {/* ========================================================= */}
        {(activeTab === 'import' || showImportModal) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.2)] font-mono space-y-6 relative"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <ClipboardPaste className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    CAMPO EM BRANCO PARA COLAR INFORMAÇÕES DA PLANILHA (IMAGE.PNG)
                  </h3>
                  <p className="text-xs text-cyan-400/70">
                    Copie e cole diretamente da sua planilha Excel, Google Sheets ou texto formatado.
                  </p>
                </div>
              </div>

              {showImportModal && (
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-cyan-400 hover:text-white rounded-xl hover:bg-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Instruction Banner */}
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 text-xs text-cyan-200/90 leading-relaxed space-y-2">
              <div className="font-black text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                FORMATO RECOMENDADO DAS COLUNAS (PARSER AUTOMÁTICO):
              </div>
              <p className="font-mono text-[11px] text-cyan-400/80 bg-slate-950 p-2.5 rounded-xl border border-cyan-500/20">
                ID ISCA &nbsp;|&nbsp; DESTINO &nbsp;|&nbsp; STATUS &nbsp;|&nbsp; OBS 1 &nbsp;|&nbsp; DATA STATUS &nbsp;|&nbsp; CARRETA &nbsp;|&nbsp; CAVALO &nbsp;|&nbsp; MOTORISTA &nbsp;|&nbsp; UNIDADE
              </p>
            </div>

            {/* Large Blank Textarea for Paste */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                COLE OS DADOS DA PLANILHA AQUI:
              </label>
              <textarea
                rows={10}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Exemplo de dados para colar:
R100000783\tBRASILIA\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tPOF9075\tPNY2605\tRENATO LÚCIO FERREIRA\tSANTA LUZIA
R100000579\tGUARULHOS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tMGL9787\tTAX0F37\tROBERTO DA SILVA SOBREIRA\tSANTA LUZIA
R100000586\tRIO DE JANEIRO\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tQOX3168\tTHX8C51\tSAMUEL ALVES PEREIRA DA SILVA\tSANTA LUZIA
R100000882\t\tPREPARAÇÃO\t\t31.jul.\t\t\t\tSANTA LUZIA
R100000876\t\tDISPONIVEL\t\t30.jul.\t\t\t\tSANTA LUZIA`}
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 font-mono text-xs text-cyan-200 placeholder-cyan-600/40 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-400 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)] resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={() => {
                  setPastedText(`R100000783\tBRASILIA\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tPOF9075\tPNY2605\tRENATO LÚCIO FERREIRA\tSANTA LUZIA
R100000579\tGUARULHOS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tMGL9787\tTAX0F37\tROBERTO DA SILVA SOBREIRA\tSANTA LUZIA
R100000586\tRIO DE JANEIRO\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tQOX3168\tTHX8C51\tSAMUEL ALVES PEREIRA DA SILVA\tSANTA LUZIA
R100000682\tBRASILIA\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tPOF8375\tPNY2605\tRENATO LÚCIO FERREIRA\tSANTA LUZIA
R100000582\tGUARULHOS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tQTL8222\tSFA8H52\tAGNALDO DA SILVA\tSANTA LUZIA
R100000609\tRIO DE JANEIRO\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tQOX3164\tTHX8C51\tSAMUEL ALVES PEREIRA DA SILVA\tSANTA LUZIA
R100000815\tSUMARE\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tRLF2I61\tTAS2H49\tVALDIR DA SILVA PASSOS\tSANTA LUZIA
R100000882\t\tPREPARAÇÃO\t\t31.jul.\t\t\t\tSANTA LUZIA
R100002495\tGUARULHOS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tPNE7353\tTYQ6F51\tWARLEY OLIVEIRA DOS SANTOS\tSANTA LUZIA
R100002334\tGUARULHOS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t31.jul.\tPOF8075\tPOD0345\tLucio Roberto Cardoso dos Anjos\tSANTA LUZIA
R100000876\t\tDISPONIVEL\t\t30.jul.\t\t\t\tSANTA LUZIA
R100000902\tMONTES CLAROS\tEM ROTA(IDA)\tPRÉ ALERTA OK\t31.jul.\tSBI8C02\tSAS2D02\tSidney Costa Lidorio\tSANTA LUZIA
R100000792\t\tDISPONIVEL\t\t30.jul.\t\t\t\tSANTA LUZIA
R100000850\t\tDISPONIVEL\t\t30.jul.\t\t\t\tSANTA LUZIA
R100000835\t\tDISPONIVEL\t\t30.jul.\t\t\t\tSANTA LUZIA
R100002336\tRIO DE JANEIRO\tEM ROTA(IDA)\tPRÉ ALERTA OK\t31.jul.\tSBF9G98\tSAR8D82\tADILSON DOS REIS SILVA\tSANTA LUZIA
R100000571\tGOVERNADOR VALADARES\tEM ROTA(IDA)\tPRÉ ALERTA OK\t30.jul.\tEIH6I81\tSJL8H32\tALAN SANTOS SOARES\tSANTA LUZIA`);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                PREENCHER COM EXEMPO DA PLANILHA IMAGE.PNG
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setPastedText('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  LIMPAR TEXTO
                </button>

                <button
                  onClick={() => handleParsePastedText(pastedText)}
                  disabled={!pastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] cursor-pointer transition-all border border-cyan-300 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  PROCESSAR E ATUALIZAR DASHBOARD
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
