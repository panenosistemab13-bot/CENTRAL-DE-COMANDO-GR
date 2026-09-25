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

function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-3.5 h-3.5 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
      <div className="w-[2px] h-full bg-gradient-to-b from-red-500 to-transparent" />
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
    <div className="w-full relative z-10 max-w-full mx-auto flex flex-col font-sans text-stone-900">
      {/* Main Premium Light Container */}
      <div className="flex-1 rounded-3xl bg-white border border-[#d6ccbe] shadow-sm relative overflow-visible flex flex-col">

        {/* Main Padding Container */}
        <div className="p-5 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

          {/* Top Area: Splitted into Left (Badge/Avatar) and Right (Banner + Header) */}
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            
            {/* Left Col: Logistic Emblem Card - Premium Light Style */}
            <div className="w-full md:w-[26%] md:min-w-[210px] md:max-w-[240px] rounded-2xl mx-auto md:mx-0 relative border border-[#d6ccbe] overflow-hidden shrink-0 shadow-sm bg-[#fbf9f5] flex flex-col items-center justify-center p-5 text-center">
              
              {/* Logo Emblem */}
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center relative shadow-xs mb-3">
                <Truck size={28} className="text-[#8a1424]" />
              </div>

              <span className="text-stone-900 font-bold text-xs uppercase tracking-widest leading-tight">
                Frota & Terceiros
              </span>
              <span className="text-[10px] text-stone-500 font-mono font-bold mt-1 tracking-wider uppercase font-bold">
                Base Homologada 3C
              </span>

              <div className="mt-3 bg-white border border-[#d6ccbe] rounded-xl px-3 py-1 text-[10px] font-mono font-bold text-stone-700 uppercase tracking-wider shadow-sm">
                Coluna (M) Oficial
              </div>
            </div>

            {/* Right Col: Banner Image + Motivational Quote + Title */}
            <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
              
              {/* Premium Light Aesthetic Banner */}
              <div className="w-full h-24 md:h-28 rounded-2xl overflow-hidden border border-[#d6ccbe] shadow-sm relative group hidden sm:block">
                <img 
                  src="/images/banner_coffee.jpg"
                  alt="Aesthetic Banner"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-90 relative z-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/45 via-transparent to-stone-900/30 pointer-events-none z-10" />
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                  <span className="bg-[#8a1424] text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow-sm">
                    LOGÍSTICA & DISTRIBUIÇÃO
                  </span>
                  <span className="text-white font-mono text-[10px] font-semibold drop-shadow-sm">
                    Santa Luzia / MG — Brasil
                  </span>
                </div>
              </div>

              {/* Motivational Quote */}
              <p className="w-full text-stone-600 italic text-xs sm:text-sm text-center leading-snug px-2 font-medium">
                "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
              </p>

              {/* Bottom Row: Titles */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Title and category */}
                <div className="pb-1">
                  <span className="text-[#8a1424] font-mono font-bold text-[11px] tracking-widest uppercase block mb-1">
                    Base Oficial de Transportadores (Coluna M)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
                    TRANSPORTADORES: <span className="text-[#8a1424]">{transportadoras.length} CADASTRADOS</span>
                  </h1>
                </div>

                {/* Signature Tag: Feito com paixão */}
                <div className="hidden lg:flex bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3 px-5 items-center justify-center gap-4 shadow-sm relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Truck className="text-amber-700" size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-stone-900 text-xs font-bold leading-none mb-1">Feito com paixão.</span>
                    <span className="font-mono text-stone-500 text-[10px] font-semibold leading-none">Para quem entrega.</span>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Novo Transportador */}
              <button
                onClick={handleOpenAdd}
                className="bg-[#8a1424] hover:bg-[#6f0f1d] text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-[#8a1424]"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>Novo Transportador</span>
              </button>

              {/* Copiar Lista Completa */}
              <button
                onClick={handleCopyAll}
                className={cn(
                  "text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border",
                  copiedStatus
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-white hover:bg-stone-50 text-stone-700 border-[#d6ccbe]"
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
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-emerald-600"
              >
                <Download size={15} />
                <span>Exportar Excel (.xlsx)</span>
              </button>
            </div>

            {/* Restaurar padrão */}
            <button
              onClick={handleResetDefaults}
              className="bg-white hover:bg-stone-50 text-stone-700 border border-[#d6ccbe] text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Restaurar lista original com 180+ transportadoras"
            >
              <RotateCcw size={14} />
              <span>Restaurar Lista Padrão</span>
            </button>
          </div>

          {/* KPI Stat Cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Stat 1: Total Cadastrados */}
            <div className="bg-[#fbf9f5] rounded-2xl border border-[#d6ccbe] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-mono font-bold tracking-wider text-[#8a1424] uppercase mb-1">Total Cadastrado</span>
              <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {transportadoras.length}
              </span>
              <span className="text-[8px] font-mono font-medium text-stone-500 uppercase font-bold">empresas ativas</span>
            </div>

            {/* Stat 2: Visíveis / Filtrados */}
            <div className="bg-[#fbf9f5] rounded-2xl border border-[#d6ccbe] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-800 uppercase mb-1">Itens Filtrados</span>
              <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {filteredList.length}
              </span>
              <span className="text-[8px] font-mono font-medium text-stone-500 uppercase font-bold">nesta pesquisa</span>
            </div>

            {/* Stat 3: Correspondência Automática */}
            <div className="bg-[#fbf9f5] rounded-2xl border border-[#d6ccbe] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-mono font-bold tracking-wider text-[#8a1424] uppercase mb-1">Reconhecimento</span>
              <span className="text-xl sm:text-2xl font-black text-[#8a1424] font-mono leading-none mb-1">
                100%
              </span>
              <span className="text-[8px] font-mono font-medium text-stone-500 uppercase font-bold font-mono">Fuzzy Matcher Ativo</span>
            </div>

            {/* Stat 4: Integração Terceiros */}
            <div className="bg-[#fbf9f5] rounded-2xl border border-[#d6ccbe] flex flex-col items-center justify-center p-3 sm:py-3.5 shadow-sm text-center">
              <span className="text-[9px] font-mono font-bold tracking-wider text-amber-800 uppercase mb-1">Coluna de Destino</span>
              <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                Coluna M
              </span>
              <span className="text-[8px] font-mono font-medium text-stone-500 uppercase font-bold font-mono">Transportador OS</span>
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
                className="w-full bg-white border border-[#d6ccbe] rounded-xl py-3 pl-12 pr-10 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 shadow-sm font-mono font-bold"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Ribbon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-4 py-2.5 shadow-sm gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wide">
                  Base Padronizada e Integrada para o Módulo de Terceiros e Conversor
                </span>
              </div>
              <div className="flex items-center gap-3 text-stone-500">
                <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded text-[10px] font-mono font-bold text-stone-700">
                  SISTEMA 3 CORAÇÕES
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 font-mono">
                  <ShieldCheck size={14} />
                  <span>HOMOLOGADO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Testador de Correspondência Inteligente (Fuzzy Matcher Simulator) */}
          <div className="bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-50 border border-red-100 text-[#8a1424] p-2 rounded-xl">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider leading-none font-mono">
                    Simulador de Reconhecimento Inteligente da Importação (OS)
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono mt-1">
                    Digite qualquer texto bruto da ordem de serviço para testar a correspondência automática.
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-white text-stone-700 border border-[#d6ccbe] px-2.5 py-1 rounded-lg uppercase tracking-wide hidden sm:block shadow-sm">
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
                  className="w-full bg-white border border-[#d6ccbe] text-xs font-mono font-bold rounded-xl p-3 pl-4 pr-9 outline-none text-stone-900 focus:border-stone-400 shadow-sm placeholder-stone-400"
                />
                {testInput && (
                  <button
                    onClick={() => handleTestMatch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="md:col-span-6">
                {testResult ? (
                  <div className="p-2.5 bg-white border border-[#d6ccbe] rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowRight size={14} className="text-stone-500 shrink-0" />
                      <span className="text-stone-500 text-[11px] font-mono uppercase font-bold shrink-0">Padronizado:</span>
                      <strong className="text-[#8a1424] font-mono text-xs truncate">
                        {testResult.matchedName}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold shrink-0 border border-emerald-200">
                      {Math.round(testResult.confidence * 100)}% precisão
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white border border-dashed border-[#d6ccbe] rounded-xl text-stone-500 text-xs italic font-mono">
                    Digite qualquer texto para ver qual transportador será selecionado automaticamente na importação da OS.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List Card Container in Light Style */}
          <div className="rounded-3xl overflow-hidden border border-[#d6ccbe] shadow-sm bg-white flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="bg-[#fbf9f5] text-[#8a1424] flex items-center justify-between py-3.5 px-4 sm:px-6 select-none shadow-sm relative border-b border-[#d6ccbe]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#8a1424]" />
                  <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono">
                    Empresas Transportadoras Homologadas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-stone-600 font-bold">
                  Página {currentPage} de {totalPages} ({filteredList.length} itens)
                </span>
              </div>
            </div>

            {/* List Body */}
            <div className="p-4 sm:p-5 flex flex-col gap-2.5 overflow-y-auto max-h-[580px] bg-[#fcfbf9]">
              {paginatedList.length === 0 ? (
                <div className="bg-white border border-dashed border-[#d6ccbe] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2 text-stone-400">
                  <Truck size={32} className="opacity-30 text-[#8a1424]" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                    Nenhum transportador encontrado com "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-mono text-[#8a1424] hover:underline font-bold mt-1 cursor-pointer"
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
                      className="bg-white border border-[#d6ccbe] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-[#8a1424]/40 transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* ID Badge */}
                        <div className="bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-2.5 py-1.5 flex flex-col items-center justify-center shrink-0 min-w-[54px] shadow-sm">
                          <span className="text-[9px] font-mono font-bold text-[#8a1424] uppercase tracking-wider leading-none">ID</span>
                          <span className="text-xs font-black text-stone-850 font-mono mt-0.5">#{globalIndex + 1}</span>
                        </div>

                        {/* Name and Tag */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-stone-900 uppercase tracking-tight truncate group-hover:text-[#8a1424] transition-colors font-mono">
                            {name}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
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
                            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm flex items-center gap-1",
                            isCopied
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-white hover:bg-stone-50 text-stone-600 border-[#d6ccbe]"
                          )}
                          title="Copiar nome do transportador"
                        >
                          {isCopied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(name)}
                          className="bg-white hover:bg-stone-50 text-stone-600 border border-[#d6ccbe] p-2 rounded-xl transition-all cursor-pointer hover:text-[#8a1424] shadow-sm"
                          title="Editar nome"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDelete(name)}
                          className="bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-[#d6ccbe] hover:border-rose-200 p-2 rounded-xl transition-all cursor-pointer shadow-sm"
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
              <div className="border-t border-[#d6ccbe] p-3 sm:p-4 bg-[#fbf9f5] flex items-center justify-between gap-2 font-mono">
                <div className="text-xs text-stone-500 font-bold">
                  Mostrando {paginatedList.length} de {filteredList.length} empresas
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-[#d6ccbe] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs font-bold text-[#8a1424] font-mono px-3">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-[#d6ccbe] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal for Add / Edit Transportador */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white border border-[#d6ccbe] rounded-3xl w-full max-w-lg shadow-xl p-6 relative flex flex-col gap-4 z-50 text-stone-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 border border-red-100 text-[#8a1424] p-2.5 rounded-2xl">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-stone-900 font-heading">
                      {editingName ? 'Editar Transportador' : 'Novo Transportador Homologado'}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono font-bold mt-0.5">
                      Base Oficial 3 Corações — Coluna (M)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-stone-650 transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                  <label className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                    Nome Oficial do Transportador:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TORNADO, JFW, ATLAS, BRASIL CARGAS..."
                    value={formData}
                    onChange={(e) => setFormData(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#d6ccbe] text-sm font-mono font-bold rounded-xl p-3 outline-none text-stone-900 focus:border-stone-400 shadow-sm placeholder-stone-400 uppercase"
                    autoFocus
                    required
                  />
                  <span className="text-[10px] font-mono text-stone-500 mt-1">
                    Este nome será utilizado automaticamente na coluna (M) ao converter ordens de serviço (PDF ou Word).
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white border border-[#d6ccbe] hover:bg-stone-50 text-stone-650 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.trim()}
                    className={`text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all ${
                      formData.trim()
                        ? 'bg-[#8a1424] hover:bg-[#6f0f1d] text-white cursor-pointer active:scale-98 border border-[#6f0f1d]'
                        : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
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
