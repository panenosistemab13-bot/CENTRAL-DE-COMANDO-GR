import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  Plus,
  Copy,
  Check,
  Download,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
  Save,
  CheckCircle2,
  Coffee,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import {
  DEFAULT_TRANSPORTADORAS,
  findClosestTransportador,
  sanitizeString
} from '../data/transportadoras';

function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

interface TransportadorEscalaProps {
  transportadoras: string[];
  onUpdateTransportadoras: (newList: string[]) => void;
}

export default function TransportadorEscala({
  transportadoras = DEFAULT_TRANSPORTADORAS,
  onUpdateTransportadoras
}: TransportadorEscalaProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Testador de Correspondência Inteligente
  const [testInput, setTestInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    matchedName: string;
    confidence: number;
    isExact: boolean;
  } | null>(null);

  // Modal para Adicionar / Editar
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState<string>('');

  // Paginação simples para ergonomia
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Filtro de pesquisa
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return transportadoras;
    const cleanSearch = sanitizeString(searchTerm);
    return transportadoras.filter(t => sanitizeString(t).includes(cleanSearch));
  }, [transportadoras, searchTerm]);

  // Reset page when searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  // Executa o teste de correspondência
  const handleTestMatch = (text: string) => {
    setTestInput(text);
    if (!text.trim()) {
      setTestResult(null);
      return;
    }
    const result = findClosestTransportador(text, transportadoras);
    setTestResult(result);
  };

  // Abrir Modal de Cadastro
  const handleOpenAdd = () => {
    setEditingName(null);
    setFormData('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (name: string) => {
    setEditingName(name);
    setFormData(name);
    setIsModalOpen(true);
  };

  // Salvar (Adicionar / Editar)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formData.trim().toUpperCase();
    if (!clean) return;

    if (editingName) {
      const updated = transportadoras.map(t => (t === editingName ? clean : t));
      onUpdateTransportadoras(updated);
    } else {
      if (!transportadoras.includes(clean)) {
        onUpdateTransportadoras([clean, ...transportadoras]);
      }
    }
    setIsModalOpen(false);
  };

  // Excluir
  const handleDelete = (name: string) => {
    if (window.confirm(`Deseja remover a transportadora "${name}" da lista oficial?`)) {
      const updated = transportadoras.filter(t => t !== name);
      onUpdateTransportadoras(updated);
    }
  };

  // Restaurar Lista Padrão
  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar a lista padrão original com todas as transportadoras homologadas?')) {
      onUpdateTransportadoras(DEFAULT_TRANSPORTADORAS);
    }
  };

  // Copiar lista inteira
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(transportadoras.join('\n'));
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Copiar item individual
  const handleCopySingle = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedItem(name);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar item:', err);
    }
  };

  // Exportar Excel (.xlsx)
  const handleExportXLSX = () => {
    const data = transportadoras.map((name, index) => ({
      '#': index + 1,
      'TRANSPORTADOR PADRÃO (COLUNA M)': name,
      'STATUS': 'HOMOLOGADO',
      'ORIGEM PADRÃO': 'SANTA LUZIA / MG'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transportadores');
    XLSX.writeFile(wb, `TRANSPORTADORES_OFICIAL_3C_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="w-full relative z-10 max-w-[96rem] mx-auto flex flex-col font-sans">
      {/* Main Parchment Panel identical to Lista de Presença */}
      <div 
        className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
        }}
      >
        {/* Inner border trim */}
        <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />

        {/* Decorative corner screws */}
        <Screw className="absolute top-3 left-3 z-20" />
        <Screw className="absolute top-3 right-3 z-20" />
        <Screw className="absolute bottom-3 left-3 z-20" />
        <Screw className="absolute bottom-3 right-3 z-20" />

        {/* Main Padding Container */}
        <div className="p-4 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

          {/* Top Area: Splitted into Left (Badge/Avatar) and Right (Banner + Header + Black Tag) */}
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            
            {/* Left Col: Logistic Emblem Card matching Profile Image in PresenceList */}
            <div className="w-28 h-28 md:w-[26%] md:min-w-[210px] md:max-w-[240px] md:h-auto rounded-2xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-gradient-to-b from-[#2a170d] to-[#150a04] flex flex-col items-center justify-center p-4 text-center">
              {/* Gold border accent inside */}
              <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/30 pointer-events-none" />
              
              {/* Logo Emblem */}
              <div className="w-16 h-16 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg mb-2 group-hover:scale-105 transition-transform">
                <Truck size={24} className="text-[#D4AF37]" />
                <div className="absolute inset-1 border border-dashed border-[#D4AF37]/50 rounded-full" />
              </div>

              <span className="text-[#e2cfb9] font-serif font-black text-xs uppercase tracking-widest leading-tight">
                Frota & Terceiros
              </span>
              <span className="text-[10px] text-[#D4AF37] font-mono font-bold mt-0.5 tracking-wider uppercase">
                Base Homologada 3C
              </span>

              <div className="mt-3 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#f5ebd7] uppercase tracking-wider">
                Coluna (M) Oficial
              </div>
            </div>

            {/* Right Col: Banner Image + Motivational Quote + Title + Black Tag */}
            <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
              
              {/* 4K Aesthetic Banner matching PresenceList */}
              <div className="w-full h-24 md:h-28 rounded-xl overflow-hidden border-2 border-[#5c3e29]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative group hidden sm:block">
                <img 
                  src="/images/banner_coffee.jpg"
                  alt="Aesthetic Banner"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter sepia-[20%] contrast-[1.1] brightness-90 relative z-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none z-10" />
                <div className="absolute bottom-2 left-4 z-20 flex items-center gap-2">
                  <span className="bg-[#B32025] text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                    LOGÍSTICA & DISTRIBUIÇÃO
                  </span>
                  <span className="text-white text-[10px] font-semibold drop-shadow-md">
                    Santa Luzia / MG — Brasil
                  </span>
                </div>
              </div>

              {/* Inspirational Quote */}
              <p className="w-full text-[#3d2415] font-serif italic text-xs sm:text-sm text-center leading-snug px-2">
                "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
              </p>

              {/* Bottom Row: Titles & Signature Black Passion Tag */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Title and category */}
                <div className="pb-1">
                  <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                    Base Oficial de Transportadores (Coluna M)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                    TRANSPORTADORES: <span className="text-[#B32025]">{transportadoras.length} CADASTRADOS</span>
                  </h1>
                </div>

                {/* Signature Black Tag: Feito com paixão */}
                <div className="hidden lg:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-3.5 px-5 items-center justify-center gap-4 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative shrink-0">
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  
                  <div className="w-9 h-9 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                    <Truck className="text-[#cfab84]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-handwritten text-[#e5d5c1] text-lg font-bold leading-none mb-1">Feito com paixão.</span>
                    <span className="font-handwritten text-[#e5d5c1]/70 text-xs font-medium leading-none">Para quem entrega.</span>
                    <div className="flex gap-1 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Action Buttons Toolbar in PresenceList Aesthetic */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Novo Transportador */}
              <button
                onClick={handleOpenAdd}
                className="bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>Novo Transportador</span>
              </button>

              {/* Copiar Lista Completa */}
              <button
                onClick={handleCopyAll}
                className={cn(
                  "text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border",
                  copiedStatus
                    ? "bg-[#2e7d32] text-white border-green-700"
                    : "bg-[#5c3e29] hover:bg-[#4a3222] text-[#efdfc6] border-[#7a5b44]"
                )}
              >
                {copiedStatus ? (
                  <>
                    <Check size={15} className="stroke-[3]" />
                    <span>Lista Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copiar Lista</span>
                  </>
                )}
              </button>

              {/* Exportar Excel */}
              <button
                onClick={handleExportXLSX}
                className="bg-[#2e7d32] hover:bg-[#256327] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-emerald-400/30"
              >
                <Download size={15} />
                <span>Exportar Excel (.xlsx)</span>
              </button>
            </div>

            {/* Restaurar padrão */}
            <button
              onClick={handleResetDefaults}
              className="bg-white/80 hover:bg-white text-[#5c3e29] border border-[#d6be9c] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:text-[#B32025]"
              title="Restaurar lista original com 180+ transportadoras"
            >
              <RotateCcw size={14} />
              <span>Restaurar Lista Padrão</span>
            </button>
          </div>

          {/* KPI Stat Cards row (matching the 3-Stat boxes from PresenceList) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Stat 1: Total Cadastrados */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#d6be9c] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold tracking-wider text-[#2e7d32] uppercase mb-1">Total Cadastrado</span>
              <span className="text-xl sm:text-2xl font-black text-[#2e7d32] leading-none mb-1">
                {transportadoras.length}
              </span>
              <span className="text-[8px] font-medium text-stone-500 uppercase">empresas ativas</span>
            </div>

            {/* Stat 2: Visíveis / Filtrados */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#d6be9c] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold tracking-wider text-[#5c3e29] uppercase mb-1">Itens Filtrados</span>
              <span className="text-xl sm:text-2xl font-black text-[#5c3e29] leading-none mb-1">
                {filteredList.length}
              </span>
              <span className="text-[8px] font-medium text-stone-500 uppercase">nesta pesquisa</span>
            </div>

            {/* Stat 3: Correspondência Automática */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#d6be9c] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold tracking-wider text-[#B32025] uppercase mb-1">Reconhecimento</span>
              <span className="text-xl sm:text-2xl font-black text-[#B32025] leading-none mb-1">
                100%
              </span>
              <span className="text-[8px] font-medium text-stone-500 uppercase">Fuzzy Matcher Ativo</span>
            </div>

            {/* Stat 4: Integração Terceiros */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#d6be9c] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold tracking-wider text-amber-700 uppercase mb-1">Coluna de Destino</span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 leading-none mb-1">
                Coluna M
              </span>
              <span className="text-[8px] font-medium text-stone-500 uppercase">Transportador OS</span>
            </div>
          </div>

          {/* Search Bar and Status Ribbon */}
          <div className="flex flex-col gap-2.5">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text"
                placeholder="Filtrar transportador por nome (ex: TORNADO, JFW, ATLAS, FEDEX...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#d6be9c] rounded-xl py-3 pl-12 pr-10 text-sm text-[#3A2414] placeholder-stone-400 outline-none focus:border-[#B32025] shadow-inner font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#B32025] p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Ribbon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#f8f1e5] border border-[#e1ccb0] rounded-xl px-4 py-2.5 shadow-sm gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] shrink-0" />
                <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">
                  Base Padronizada e Integrada para o Módulo de Terceiros e Conversor
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#9a785c]">
                <div className="flex items-center gap-1.5 bg-[#e1ccb0]/50 px-2.5 py-1 rounded text-[10px] font-bold">
                  SISTEMA 3 CORAÇÕES
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5c3e29]">
                  <ShieldCheck size={14} className="text-[#2e7d32]" />
                  <span>HOMOLOGADO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testador de Correspondência Inteligente (Fuzzy Matcher Simulator) */}
          <div className="bg-[#fcfaf4] border border-[#d6be9c]/75 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#B32025] text-white p-2 rounded-xl shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#3e2516] uppercase tracking-wider leading-tight">
                    Simulador de Reconhecimento Inteligente da Importação (OS)
                  </h3>
                  <p className="text-[11px] text-[#8c6b4e] font-mono leading-none mt-0.5">
                    Digite qualquer texto bruto da ordem de serviço (PDF/Word) para testar a correspondência automática
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-[#5c3e29] text-[#efdfc6] px-2.5 py-1 rounded-lg uppercase tracking-wide hidden sm:block">
                Fuzzy Matcher
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              <div className="md:col-span-6 relative">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => handleTestMatch(e.target.value)}
                  placeholder="Ex: TORNADOLOG TRANSP, TRANSMAGNA LOG, VIVAN LTDA..."
                  className="w-full bg-white border border-[#dac0a3] text-xs font-semibold rounded-xl p-3 pl-4 pr-9 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner placeholder-stone-400"
                />
                {testInput && (
                  <button
                    onClick={() => handleTestMatch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#B32025] cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="md:col-span-6">
                {testResult ? (
                  <div className="p-2.5 bg-white border-2 border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowRight size={14} className="text-[#5c3e29] shrink-0" />
                      <span className="text-stone-500 text-[11px] uppercase font-bold shrink-0">Padronizado:</span>
                      <strong className="text-[#2e7d32] font-mono text-xs truncate">
                        {testResult.matchedName}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#2e7d32] text-[10px] font-mono font-bold shrink-0 border border-emerald-200">
                      {Math.round(testResult.confidence * 100)}% precisão
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white/70 border border-dashed border-[#d6be9c] rounded-xl text-stone-500 text-xs italic">
                    Digite qualquer texto para ver qual transportador será selecionado automaticamente na importação da OS.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List Card Container in Deep Coffee & Parchment Header */}
          <div className="rounded-3xl overflow-hidden border border-[#eedecb] shadow-xl bg-gradient-to-b from-[#fffbf7] to-[#FAF6ED] flex flex-col flex-1 min-h-0">
            {/* Header with Deep Coffee Look & Screws */}
            <div className="bg-[#1c1008] text-white flex items-center justify-between py-3.5 px-4 sm:px-6 select-none shadow-sm relative">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-[#dfc2a1]/20" />
              
              <div className="flex items-center gap-3">
                <Screw className="w-3.5 h-3.5" />
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#dfc2a1]" />
                  <span className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase font-sans text-white">
                    Empresas Transportadoras Homologadas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#dfc2a1] font-bold">
                  Página {currentPage} de {totalPages} ({filteredList.length} itens)
                </span>
                <Screw className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* List Body */}
            <div className="p-4 sm:p-5 flex flex-col gap-2.5 overflow-y-auto max-h-[580px]">
              {paginatedList.length === 0 ? (
                <div className="bg-white border border-dashed border-[#d6be9c] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2 text-stone-500">
                  <Truck size={32} className="opacity-30 stroke-[1.5] text-[#5c3e29]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5c3e29]">
                    Nenhum transportador encontrado com "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-[#B32025] hover:underline font-bold mt-1 cursor-pointer"
                  >
                    Limpar filtro de pesquisa
                  </button>
                </div>
              ) : (
                paginatedList.map((name, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                  const isCopied = copiedItem === name;

                  return (
                    <div 
                      key={name}
                      className="bg-white border-2 border-[#e1ccb0]/60 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-[#dac0a3] transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* ID Badge */}
                        <div className="bg-[#FAF6ED] border-2 border-[#d6be9c]/80 rounded-xl px-2.5 py-1.5 flex flex-col items-center justify-center shrink-0 min-w-[54px] shadow-sm">
                          <span className="text-[9px] font-black text-[#5c3e29] uppercase tracking-wider leading-none">ID</span>
                          <span className="text-xs font-black text-[#3e2516] font-mono mt-0.5">#{globalIndex + 1}</span>
                        </div>

                        {/* Name and Tag */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-[#3e2516] uppercase tracking-tight truncate group-hover:text-[#B32025] transition-colors">
                            {name}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50 flex items-center gap-1">
                              <Check size={10} className="stroke-[3]" />
                              Padronizada (Coluna M)
                            </span>
                            <span className="text-[9px] font-bold text-stone-400 font-mono hidden sm:inline-block">
                              SANTA LUZIA / MG
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copiar */}
                        <button
                          onClick={() => handleCopySingle(name)}
                          className={cn(
                            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs flex items-center gap-1",
                            isCopied
                              ? "bg-[#2e7d32] text-white border-green-700"
                              : "bg-[#FAF6ED] hover:bg-[#ebdcc8] text-[#5c3e29] border-[#d6be9c]"
                          )}
                          title="Copiar nome do transportador"
                        >
                          {isCopied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(name)}
                          className="bg-[#FAF6ED] hover:bg-[#ebdcc8] text-[#5c3e29] border border-[#d6be9c] p-2 rounded-xl transition-all cursor-pointer hover:text-[#B32025] shadow-2xs"
                          title="Editar nome"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDelete(name)}
                          className="bg-[#FAF6ED] hover:bg-red-50 text-stone-400 hover:text-red-600 border border-[#d6be9c] hover:border-red-300 p-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                          title="Remover transportadora"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="border-t border-[#e1ccb0] p-3 sm:p-4 bg-[#fdfbf7] flex items-center justify-between gap-2">
                <div className="text-xs text-[#5c3e29] font-mono font-bold">
                  Mostrando {paginatedList.length} de {filteredList.length} empresas
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-[#dac0a3] text-[#5c3e29] hover:bg-[#FAF6ED] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs font-black text-[#3e2516] font-mono px-3">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-[#dac0a3] text-[#5c3e29] hover:bg-[#FAF6ED] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal for Add / Edit Transportador in PresenceList Aesthetic */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#fdfbf7] border-2 border-[#5c3e29] rounded-3xl w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-6 relative flex flex-col gap-4 z-50"
            >
              {/* Corner Screws */}
              <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
              <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
              <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
              <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="bg-[#B32025] text-white p-2.5 rounded-2xl shadow-md">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-[#3e2516] font-serif">
                      {editingName ? 'Editar Transportador' : 'Novo Transportador Homologado'}
                    </h3>
                    <p className="text-xs text-[#8c6b4e] font-mono font-bold mt-0.5">
                      Base Oficial 3 Corações — Coluna (M)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#5c3e29]/10 text-[#5c3e29]/75 hover:text-[#B32025] transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="bg-[#fcfaf4] border border-[#d6be9c] rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
                  <label className="text-[10px] font-bold text-[#8c6b4e] uppercase tracking-wider">
                    Nome Oficial do Transportador:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TORNADO, JFW, ATLAS, BRASIL CARGAS..."
                    value={formData}
                    onChange={(e) => setFormData(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#dac0a3] text-sm font-black rounded-xl p-3 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner placeholder-stone-400 uppercase"
                    autoFocus
                    required
                  />
                  <span className="text-[10px] text-stone-500 mt-1">
                    Este nome será utilizado automaticamente na coluna (M) ao converter ordens de serviço (PDF ou Word).
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-[#5c3e29] hover:bg-[#3e2516] text-[#efdfc6] text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer active:scale-97"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.trim()}
                    className={`text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all ${
                      formData.trim()
                        ? 'bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white cursor-pointer active:scale-98'
                        : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Save size={15} />
                    <span>Salvar Transportador</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
