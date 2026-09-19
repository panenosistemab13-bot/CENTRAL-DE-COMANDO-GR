import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Radio,
  Layers,
  MapPin,
  TrendingUp,
  Building2,
  Search,
  ClipboardPaste,
  Sparkles,
  Zap,
  Activity,
  Trash2,
  FileSpreadsheet,
  X,
  Database,
  ArrowRight
} from 'lucide-react';
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

export type ActiveTabType = 'status' | 'destinos' | 'unidade' | 'import';

export const ALL_UNIDADES = [
  'MONTES CLAROS',
  'SANTA LUZIA',
  'VIANA',
  'VIANA (OP. RG)',
  'VIANA (OP. TIMS)',
  'VIANA (OP. APEX)',
  'CUIABÁ'
];

export const STATUS_CATEGORIES = [
  { key: 'Em Rota Ida', label: 'Em Rota Ida', color: '#B88935', glow: 'rgba(184, 137, 53, 0.4)' },
  { key: 'Em Rota Volta', label: 'Em Rota Volta', color: '#754B2A', glow: 'rgba(117, 75, 42, 0.4)' },
  { key: 'No Destino', label: 'No Destino', color: '#3D8B68', glow: 'rgba(61, 139, 104, 0.4)' },
  { key: 'Preparação', label: 'Preparação', color: '#E7C88A', glow: 'rgba(231, 200, 138, 0.4)' },
  { key: 'Extraviada', label: 'Extraviada', color: '#B94A48', glow: 'rgba(185, 74, 72, 0.4)' },
  { key: 'Possível Extravio', label: 'Possível Extravio', color: '#A8443B', glow: 'rgba(168, 68, 59, 0.4)' },
  { key: 'Disponível', label: 'Disponível', color: '#8A7B6D', glow: 'rgba(138, 123, 109, 0.4)' },
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
        cidade: name,
        count: val.count,
        total: val.count,
        percentage: Math.round((val.count / (filteredData.length || 1)) * 100),
        iscas: val.iscas,
        drivers: val.drivers
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
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

    lines.forEach((line, index) => {
      let delimiter = '\t';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';')) delimiter = ';';
      else if (line.includes(',')) delimiter = ',';

      const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      
      if (index === 0 && (cols[0].toUpperCase().includes('ID') || cols[0].toUpperCase().includes('ISCA'))) {
        return;
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

  const timelineData = useMemo(() => {
    const len = filteredData.length;
    return [
      { hora: '06:00', emRota: Math.floor(len * 0.3), noDestino: 2, alerta: 0 },
      { hora: '09:00', emRota: Math.floor(len * 0.5), noDestino: 4, alerta: 1 },
      { hora: '12:00', emRota: Math.floor(len * 0.7), noDestino: 6, alerta: 1 },
      { hora: '15:00', emRota: Math.floor(len * 0.8), noDestino: 9, alerta: 2 },
      { hora: '18:00', emRota: len, noDestino: 12, alerta: 2 },
    ];
  }, [filteredData]);

  return (
    <div className="cinema-background w-full min-h-screen p-4 sm:p-8 space-y-8 relative selection:bg-[#E7C88A] selection:text-[#2C1B12]">
      <div className="relative z-10 space-y-8 w-full max-w-[120rem] mx-auto">

        {/* TOP COMMAND HEADER */}
        <header className="cinema-card cinema-3d p-6 sm:p-8 overflow-hidden">
          <div className="cinema-light -top-40 -right-40" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#754B2A]/10">
            {/* Title Block */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E7C88A] via-[#B88935] to-[#754B2A] flex items-center justify-center shadow-[0_20px_45px_rgba(117,75,42,.25)] shrink-0 border border-white/60">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="cinema-title text-4xl sm:text-5xl text-[#2C1B12]">
                    Slides
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-[#E7C88A]/30 border border-[#B88935]/40 text-xs font-extrabold tracking-widest text-[#754B2A] uppercase flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#3D8B68] animate-pulse" />
                    Centro de Comando 4K
                  </span>
                </div>
                <p className="text-xs text-[#756D63] font-bold tracking-wide mt-1 uppercase flex items-center gap-2">
                  <span>SISTEMA DE MONITORAMENTO DE ISCAS E RASTREAMENTO LOGÍSTICO</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/80 border border-[#754B2A]/15 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#756D63]">Total de Iscas</span>
                  <span className="text-2xl cinema-number text-[#2C1B12]">{data.length}</span>
                </div>
                <Database className="w-6 h-6 text-[#B88935]" />
              </div>

              <button
                onClick={() => setData([])}
                className="cinema-button-secondary flex items-center gap-2 text-xs py-3 px-4 text-[#B94A48] hover:bg-[#B94A48]/10"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Registros</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs & Search */}
          <div className="relative z-10 mt-6 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Capsule Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white/70 p-2 rounded-2xl border border-white shadow-sm">
              <button
                onClick={() => setActiveTab('status')}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'status'
                    ? "cinema-button shadow-md"
                    : "text-[#756D63] hover:text-[#2C1B12] hover:bg-white/90"
                )}
              >
                <Activity className="w-4 h-4" />
                Aba Status
              </button>

              <button
                onClick={() => setActiveTab('destinos')}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'destinos'
                    ? "cinema-button shadow-md"
                    : "text-[#756D63] hover:text-[#2C1B12] hover:bg-white/90"
                )}
              >
                <MapPin className="w-4 h-4" />
                Aba Destinos ({destinoStats.length})
              </button>

              <button
                onClick={() => setActiveTab('unidade')}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'unidade'
                    ? "cinema-button shadow-md"
                    : "text-[#756D63] hover:text-[#2C1B12] hover:bg-white/90"
                )}
              >
                <Building2 className="w-4 h-4" />
                Aba Unidade ({unidadeStats.length})
              </button>

              <button
                onClick={() => setActiveTab('import')}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === 'import'
                    ? "cinema-button shadow-md"
                    : "text-[#756D63] hover:text-[#2C1B12] hover:bg-white/90"
                )}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Campo de Importação
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#754B2A]" />
              <input
                type="text"
                placeholder="Filtrar isca, destino, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 border border-[#754B2A]/20 rounded-2xl py-2.5 pl-11 pr-10 text-xs font-bold text-[#2C1B12] placeholder-[#756D63]/60 focus:outline-none focus:border-[#B88935] focus:ring-2 focus:ring-[#E7C88A]/50 shadow-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756D63] hover:text-[#2C1B12]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* MAIN TAB CONTENT */}
        
        {/* VIEW 1: STATUS */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <BrazilMapHUD
              selectedMapNode={selectedMapNode}
              setSelectedMapNode={setSelectedMapNode}
              hoveredCity={hoveredCity}
              setHoveredCity={setHoveredCity}
              count={filteredData.length}
            />

            <StatusAnalyticsHUD
              statusStats={statusStats}
              timelineData={timelineData}
              totalIscas={filteredData.length}
            />

            <StatusDetailHUD
              filteredData={filteredData}
              normalizeStatus={normalizeStatus}
              STATUS_CATEGORIES={STATUS_CATEGORIES}
            />
          </motion.div>
        )}

        {/* VIEW 2: DESTINOS */}
        {activeTab === 'destinos' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <DestinoRankingHUD destinos={destinoStats} />

            {/* Destination Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinoStats.map(dest => (
                <div
                  key={dest.name}
                  className="
                    cinema-card
                    p-6
                    space-y-4
                    shadow-[0_15px_35px_rgba(67,46,28,.06)]
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >
                  <div className="flex items-center justify-between border-b border-[#754B2A]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F2E4C8] flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#754B2A]" />
                      </div>
                      <h4 className="cinema-title text-xl text-[#2C1B12] font-bold">{dest.name}</h4>
                    </div>
                    <span className="px-3 py-1 bg-[#E7C88A]/30 text-[#754B2A] border border-[#B88935]/30 rounded-xl text-xs font-extrabold">
                      {dest.count} iscas
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#756D63]">Códigos das Iscas:</div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {dest.iscas.map(id => (
                        <span key={id} className="px-2 py-1 bg-white border border-[#754B2A]/15 rounded-lg text-[#754B2A] font-extrabold text-[10px] cinema-number shadow-2xs">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {dest.drivers.length > 0 && (
                    <div className="pt-3 border-t border-[#754B2A]/10 text-[11px] text-[#756D63]">
                      Motoristas: <span className="text-[#2C1B12] font-bold">{dest.drivers.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: UNIDADE */}
        {activeTab === 'unidade' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <UnidadeAnalyticsHUD
              unidadeStats={unidadeStats}
              totalDataCount={data.length}
            />
          </motion.div>
        )}

        {/* VIEW 4: IMPORTAÇÃO */}
        {(activeTab === 'import' || showImportModal) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="cinema-card cinema-3d p-6 sm:p-10 space-y-6 relative overflow-hidden"
          >
            <div className="cinema-light -top-40 -left-40" />

            <div className="relative z-10 flex items-center justify-between border-b border-[#754B2A]/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F2E4C8] flex items-center justify-center text-[#754B2A] shadow-sm">
                  <ClipboardPaste className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="cinema-title text-3xl text-[#2C1B12]">
                    Importação de Dados da Planilha
                  </h3>
                  <p className="text-xs text-[#756D63] font-medium">
                    Cole as linhas diretamente da sua planilha Excel ou Google Sheets para sincronizar os dados.
                  </p>
                </div>
              </div>

              {showImportModal && (
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2.5 text-[#756D63] hover:text-[#2C1B12] rounded-xl hover:bg-white/80"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Instruction Banner */}
            <div className="relative z-10 bg-white/70 border border-[#754B2A]/15 rounded-2xl p-4 text-xs text-[#2C1B12] space-y-2">
              <div className="font-extrabold text-[#754B2A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88935]" />
                Formato Reconhecido Automaticamente:
              </div>
              <p className="text-[11px] font-bold text-[#756D63] bg-[#F2E4C8]/50 p-3 rounded-xl border border-[#754B2A]/10">
                ID ISCA &nbsp;|&nbsp; DESTINO &nbsp;|&nbsp; STATUS &nbsp;|&nbsp; OBS 1 &nbsp;|&nbsp; DATA STATUS &nbsp;|&nbsp; CARRETA &nbsp;|&nbsp; CAVALO &nbsp;|&nbsp; MOTORISTA &nbsp;|&nbsp; UNIDADE
              </p>
            </div>

            {/* Large Textarea */}
            <div className="relative z-10 space-y-2">
              <label className="text-xs font-extrabold text-[#754B2A] uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#B88935]" />
                Área de Transferência:
              </label>
              <textarea
                rows={10}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Cole aqui as linhas copiadas da planilha...`}
                className="w-full bg-white/90 border border-[#754B2A]/20 rounded-2xl p-4 text-xs font-bold text-[#2C1B12] placeholder-[#756D63]/50 focus:outline-none focus:border-[#B88935] focus:ring-2 focus:ring-[#E7C88A]/40 shadow-inner resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
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
                className="cinema-button-secondary flex items-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4 text-[#B88935]" />
                Carregar Exemplo Modelo
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setPastedText('')}
                  className="cinema-button-secondary text-xs text-[#B94A48]"
                >
                  Limpar
                </button>

                <button
                  onClick={() => handleParsePastedText(pastedText)}
                  disabled={!pastedText.trim()}
                  className="cinema-button flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  Processar e Sincronizar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
