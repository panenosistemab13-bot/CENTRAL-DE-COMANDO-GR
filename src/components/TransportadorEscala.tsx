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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import {
  DEFAULT_TRANSPORTADORAS,
  findClosestTransportador,
  sanitizeString
} from '../data/transportadoras';

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

  // Filtro de pesquisa
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return transportadoras;
    const cleanSearch = sanitizeString(searchTerm);
    return transportadoras.filter(t => sanitizeString(t).includes(cleanSearch));
  }, [transportadoras, searchTerm]);

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
    if (window.confirm(`Deseja remover a transportadora "${name}" da lista?`)) {
      const updated = transportadoras.filter(t => t !== name);
      onUpdateTransportadoras(updated);
    }
  };

  // Restaurar Lista Padrão
  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar a lista padrão original com todas as 180+ transportadoras?')) {
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
      'TRANSPORTADOR PADRÃO': name
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transportadores');
    XLSX.writeFile(wb, `TRANSPORTADORES_ESCALA_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono font-bold border border-blue-500/30 flex items-center gap-1.5">
                <Building2 size={13} />
                Lista Oficial de Transportadores
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                {transportadoras.length} Cadastrados
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Truck className="text-blue-400" size={24} />
              Base de Transportadores (Coluna M)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Esta lista é utilizada como referência oficial pelo módulo de <strong className="text-emerald-300">Terceiros</strong>. Ao importar uma Ordem de Serviço (PDF ou Word), o sistema analisa a transportadora do arquivo e busca automaticamente o nome padronizado mais próximo para preencher na coluna <strong className="text-blue-300">TRANSPORTADOR (Coluna M)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
            >
              <Plus size={16} />
              <span>Novo Transportador</span>
            </button>

            <button
              onClick={handleCopyAll}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer border shadow-md",
                copiedStatus
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              )}
            >
              {copiedStatus ? (
                <>
                  <Check size={16} />
                  <span>Lista Copiada!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Lista</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportXLSX}
              className="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <Download size={16} />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-700"
              title="Restaurar lista padrão"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Testador de Correspondência Inteligente */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Testar Reconhecimento Inteligente da Importação:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <input
                type="text"
                value={testInput}
                onChange={(e) => handleTestMatch(e.target.value)}
                placeholder="Digite um nome bruto da OS (Ex: TORNADOLOG TRANSP, TRANSMAGNA LOG, VIVAN LTDA...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {testInput && (
                <button
                  onClick={() => handleTestMatch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="md:col-span-6">
              {testResult ? (
                <div className="p-2.5 bg-slate-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <ArrowRight size={14} className="text-slate-500 shrink-0" />
                    <span className="text-slate-400 text-[11px] shrink-0">Padronizado:</span>
                    <strong className="text-emerald-400 font-mono text-xs truncate">
                      {testResult.matchedName}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono shrink-0">
                    {Math.round(testResult.confidence * 100)}% precisão
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-[11px] italic">
                  Digite qualquer texto para ver qual transportador será selecionado automaticamente na importação da OS.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Transportadores */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-white">
        {/* Barra de Filtros */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar transportador por nome..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Exibindo <strong className="text-white">{filteredList.length}</strong> de <strong className="text-white">{transportadoras.length}</strong> transportadoras
          </div>
        </div>

        {/* Grid de Lista */}
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-16 text-center">#</th>
                <th className="py-3 px-4">NOME DO TRANSPORTADOR</th>
                <th className="py-3 px-4 text-center w-36">COPIAR</th>
                <th className="py-3 px-4 text-center w-28">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Nenhum transportador encontrado para o termo pesquisado.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={`${item}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <Truck size={15} className="text-blue-400/70 shrink-0" />
                      <span>{item}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleCopySingle(item)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 mx-auto cursor-pointer border",
                          copiedItem === item
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        )}
                        title="Copiar nome do transportador"
                      >
                        {copiedItem === item ? (
                          <>
                            <Check size={12} />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Adicionar / Editar Transportador */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-5 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="text-blue-400" size={20} />
                  <h3 className="text-base font-bold uppercase">
                    {editingName ? 'Editar Transportador' : 'Novo Transportador'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">
                    Nome Padronizado do Transportador *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData}
                    onChange={(e) => setFormData(e.target.value.toUpperCase())}
                    placeholder="Ex: TORNADO, TRANSMAGNA, 3C..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white uppercase focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este nome será utilizado na coluna TRANSPORTADOR (Coluna M) da planilha.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save size={16} />
                    <span>Salvar</span>
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
