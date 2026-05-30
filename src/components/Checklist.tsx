import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  Calendar,
  Truck,
  MessageSquare,
  Wrench,
  ChevronRight,
  MoreVertical,
  Filter,
  Edit2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistItem {
  id: string;
  cavalo: string;
  carretas: string;
  dataTeste: string;
  dataVencimento: string;
  manutencaoOs: string;
  periferico: string;
  observacao: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

export default function Checklist() {
  const [activeView, setActiveView] = useState<'monitoring' | 'generator'>('monitoring');
  
  // Monitoring State
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADOS'>('TODOS');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<ChecklistItem, 'id'>>({
    cavalo: '',
    carretas: '',
    dataTeste: format(new Date(), 'yyyy-MM-dd'),
    dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    manutencaoOs: '',
    periferico: '',
    observacao: ''
  });

  // Generator State
  const [genData, setGenData] = useState({
    greeting: 'Bom dia',
    cavalo: '',
    carretas: '',
    contato: '(31) 981203930'
  });
  const [genCopied, setGenCopied] = useState(false);

  useEffect(() => {
    const checklistRef = ref(rtdb, 'checklist_veiculos');
    const unsubscribe = onValue(checklistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setItems(list);
      } else {
        // Seed data if empty
        const seedData = [
          { cavalo: "POZ4431", carretas: "", dataTeste: "2026-02-03", dataVencimento: "2026-04-04", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
          { cavalo: "POZ3241", carretas: "", dataTeste: "2026-02-03", dataVencimento: "2026-04-04", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
          { cavalo: "POD0255", carretas: "", dataTeste: "2026-03-24", dataVencimento: "2026-05-23", manutencaoOs: "", periferico: "SENSOR", observacao: "" },
          { cavalo: "PNY2605", carretas: "PNE7353 / PNE7433", dataTeste: "2026-03-31", dataVencimento: "2026-05-30", manutencaoOs: "", periferico: "BAU", observacao: "CHECKLIST COM OS BAUS - POF9075 / POF8375" },
          { cavalo: "SAR8D82", carretas: "SBF9G98 / TIC0F85", dataTeste: "2026-04-03", dataVencimento: "2026-06-02", manutencaoOs: "", periferico: "TRAVA BAU", observacao: "" },
          { cavalo: "THX5I51", carretas: "POG0685 / POG0545", dataTeste: "2026-04-08", dataVencimento: "2026-06-07", manutencaoOs: "", periferico: "TRAVA BAU", observacao: "" },
          { cavalo: "TYT8A14", carretas: "QOX3164 / QOX3168", dataTeste: "2026-04-08", dataVencimento: "2026-06-07", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
          { cavalo: "SBK4142", carretas: "POF9785 / POR5E42", dataTeste: "2026-04-13", dataVencimento: "2026-06-12", manutencaoOs: "", periferico: "BAU", observacao: "CHECKLIST COM OS BAUS - MIN8723 / TIC0D95" },
          { cavalo: "PNY2215", carretas: "POF9365 / POF9175", dataTeste: "2026-04-15", dataVencimento: "2026-06-14", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
          { cavalo: "SBN4J62", carretas: "PNC8603 / PNC8873", dataTeste: "2026-04-16", dataVencimento: "2026-06-15", manutencaoOs: "", periferico: "SENSOR", observacao: "" },
          { cavalo: "POD0345", carretas: "POF8075 / POF7875", dataTeste: "2026-04-25", dataVencimento: "2026-06-24", manutencaoOs: "", periferico: "BAU", observacao: "CHECKLIST COM OS BAUS - QOX3164 / QOX3168" },
          { cavalo: "POD0645", carretas: "POF9075 / POF8375", dataTeste: "2026-04-29", dataVencimento: "2026-06-28", manutencaoOs: "", periferico: "TRAVA BAU", observacao: "MODO SLEEP - AGUARDANDO MANUTENÇÃO VOLVO" },
          { cavalo: "SAS2D02", carretas: "SBI8C02 / SBI0A72", dataTeste: "2026-05-07", dataVencimento: "2026-06-07", manutencaoOs: "OS #98221", periferico: "PAINEL", observacao: "PUXADA VESPASIANO - PAINEL VIOLADO" },
          { cavalo: "PNP1452-1", carretas: "PNW4982", dataTeste: "2024-10-29", dataVencimento: "2024-10-30", manutencaoOs: "", periferico: "REPROVADO", observacao: "SENSOR BAU TRASEIRO", statusOverride: "NEGATIVADO" },
          { cavalo: "PNP1452-2", carretas: "PNW4812", dataTeste: "2024-10-18", dataVencimento: "2024-10-19", manutencaoOs: "", periferico: "REPROVADO", observacao: "SENSOR BAU TRASEIRO", statusOverride: "NEGATIVADO" },
          { cavalo: "PNP1452-3", carretas: "PNW5562", dataTeste: "2025-03-05", dataVencimento: "2025-03-06", manutencaoOs: "", periferico: "REPROVADO", observacao: "SENSOR BAU TRASEIRO", statusOverride: "NEGATIVADO" },
        ];
        
        seedData.forEach((item, idx) => {
          const id = (Date.now() + idx).toString();
          set(ref(rtdb, `checklist_veiculos/${id}`), { ...item, id });
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!newItem.cavalo) return;
    const id = Date.now().toString();
    try {
      await set(ref(rtdb, `checklist_veiculos/${id}`), { ...newItem, id });
      setIsAdding(false);
      setNewItem({
        cavalo: '',
        carretas: '',
        dataTeste: format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
        manutencaoOs: '',
        periferico: '',
        observacao: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar checklist:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem || !editingItem.cavalo) return;
    try {
      const { id, ...data } = editingItem;
      await update(ref(rtdb, `checklist_veiculos/${id}`), data);
      setEditingItem(null);
    } catch (error) {
      console.error("Erro ao atualizar checklist:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este checklist?")) return;
    try {
      await remove(ref(rtdb, `checklist_veiculos/${id}`));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const getStatus = (item: ChecklistItem) => {
    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
        return { label: item.statusOverride, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      }
      return { label: item.statusOverride, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    }

    const today = new Date();
    const expiry = parseISO(item.dataVencimento);
    const diff = differenceInDays(expiry, today);

    if (diff < 0) return { label: 'VENCIDO', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (diff <= 7) return { label: 'URGENTE', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'APROVADO', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.carretas.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getStatus(item);
    
    if (filter === 'EM DIA') {
      return status.label === 'APROVADO' || status.label === 'URGENTE';
    }
    if (filter === 'VENCIDO') {
      return status.label === 'VENCIDO';
    }
    if (filter === 'NEGATIVADOS') {
      return status.label === 'NEGATIVADO' || status.label === 'REPROVADO';
    }
    
    return true; // TODOS
  });

  const handleCopyGenerator = () => {
    const htmlContent = `
      <div style="font-family: sans-serif; color: #333; font-size: 14px;">
        <p>${genData.greeting},</p>
        <p>Solicito o <span style="background-color: #d1cbcb; padding: 2px 4px;">checklist</span> para o conjunto abaixo:</p>
        
        <table border="1" style="border-collapse: collapse; min-width: 400px; font-family: sans-serif; font-size: 14px; text-align: center; font-weight: bold; margin-top: 15px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #485c96; color: white;">
              <th style="padding: 10px; border: 1px solid #1c274c;">CAVALO</th>
              <th style="padding: 10px; border: 1px solid #1c274c;">CARRETAS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #e8ebf5;">
              <td style="padding: 10px; border: 1px solid #1c274c;">${genData.cavalo}</td>
              <td style="padding: 10px; border: 1px solid #1c274c;">${genData.carretas}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin-top: 20px; font-weight: bold; color: #555;">Contato: ${genData.contato}</p>
        
        <p style="margin-top: 20px; color: #555;">Att,</p>
      </div>
    `;

    const textContent = `${genData.greeting},\n\nSolicito o checklist para o conjunto abaixo:\n\nCAVALO: ${genData.cavalo}\nCARRETAS: ${genData.carretas}\n\nContato: ${genData.contato}\n\nAtt,`;

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([textContent], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      
      navigator.clipboard.write(data).then(() => {
        setGenCopied(true);
        setTimeout(() => setGenCopied(false), 2000);
      });
    } catch (err) {
      console.warn("Clipboard API fallback", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setGenCopied(true);
        setTimeout(() => setGenCopied(false), 2000);
      } catch (e) {
        console.error('Fallback copy failed', e);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="bg-[#0b0d19]/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                <ClipboardCheck size={26} />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Checklist Frota</h1>
            </div>
            
            <div className="flex bg-white/5 rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveView('monitoring')}
                className={cn(
                  "px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                  activeView === 'monitoring' ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Monitoramento
              </button>
              <button
                onClick={() => setActiveView('generator')}
                className={cn(
                  "px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                  activeView === 'generator' ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Gerador de Solicitação
              </button>
            </div>
          </div>

          {activeView === 'monitoring' && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Novo Registro
              </button>
            </div>
          )}
        </div>
      </div>

      {activeView === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0b0d19]/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight border-b border-white/5 pb-4 mb-6">Preencher Dados</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block font-mono">Saudação</label>
                  <select
                    value={genData.greeting}
                    onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Bom dia" className="bg-zinc-900">Bom dia</option>
                    <option value="Boa tarde" className="bg-zinc-900">Boa tarde</option>
                    <option value="Boa noite" className="bg-zinc-900">Boa noite</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block font-mono">Placa do Cavalo</label>
                  <input
                    type="text"
                    value={genData.cavalo}
                    onChange={(e) => setGenData(prev => ({ ...prev, cavalo: e.target.value.toUpperCase() }))}
                    placeholder="Ex: ABC-1234"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white font-bold focus:border-emerald-500/50 outline-none transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block font-mono">Placas das Carretas</label>
                  <input
                    type="text"
                    value={genData.carretas}
                    onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="Ex: XYZ-9876 / LMN-4567"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white font-bold focus:border-emerald-500/50 outline-none transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block font-mono">Contato</label>
                  <input
                    type="text"
                    value={genData.contato}
                    onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={handleCopyGenerator}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                    genCopied ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  )}
                >
                  {genCopied ? <Check size={18} /> : <Copy size={18} />}
                  {genCopied ? 'Copiado para o Clipboard!' : 'Copiar Solicitação'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl text-slate-800 min-h-full">
                <div className="max-w-2xl mx-auto space-y-6 font-sans text-sm">
                  <p>{genData.greeting},</p>
                  <p>Solicito o <span className="bg-[#d1cbcb] px-1 font-medium">checklist</span> para o conjunto abaixo:</p>
                  
                  <div className="mt-6 mb-8 overflow-hidden rounded-md border border-[#1c274c]">
                    <table className="w-full border-collapse text-center uppercase">
                      <thead>
                        <tr className="bg-[#485c96] text-white">
                          <th className="p-3 border-r border-[#1c274c] w-1/2">CAVALO</th>
                          <th className="p-3 w-1/2">CARRETAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-[#e8ebf5] font-bold text-slate-700 text-base">
                          <td className="p-4 border-r border-t border-[#1c274c]">{genData.cavalo || "-"}</td>
                          <td className="p-4 border-t border-[#1c274c]">{genData.carretas || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="font-bold text-slate-600 mt-8 text-base">Contato: {genData.contato}</p>
                  
                  <p className="text-slate-600 mt-12">Att,</p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3">
        {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              filter === f 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Table Grid */}
      <div className="bg-[#0b0d19]/60 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cavalo / Carretas</th>
                <th className="px-8 py-6 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Realização</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-6 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dias</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Manutenção / OS</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const status = getStatus(item);
                  const diasParaVencer = differenceInDays(parseISO(item.dataVencimento), new Date());
                  
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-all")}>
                            <Truck size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white uppercase tracking-wider">{item.cavalo}</div>
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate max-w-[120px]">{item.carretas || 'Nenhuma'}</div>
                          </div>
                        </div>
                      </td>
                    <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          status.color, status.bg, status.border,
                          (status.label === 'VENCIDO' || status.label === 'NEGATIVADO' || status.label === 'REPROVADO') ? "animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]" : ""
                        )}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold">
                          <Calendar size={12} className="text-zinc-600" />
                          {format(parseISO(item.dataTeste), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "flex items-center gap-2 text-xs font-mono font-black",
                          diasParaVencer < 0 ? "text-rose-400" : "text-zinc-300"
                        )}>
                          <Clock size={12} />
                          {format(parseISO(item.dataVencimento), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={cn(
                          "text-sm font-black font-mono",
                          diasParaVencer < 0 ? "text-rose-500" : diasParaVencer <= 7 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {diasParaVencer}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-zinc-400 truncate max-w-[150px]">{item.manutencaoOs || '---'}</span>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                            <Wrench size={8} /> {item.periferico || 'Padrão'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            className="p-2 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-xl transition-all"
                            onClick={() => setEditingItem(item)}
                            title="Editar informações"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-2 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-xl transition-all"
                            onClick={() => {
                              const note = prompt("Atualizar observação:", item.observacao);
                              if (note !== null) {
                                update(ref(rtdb, `checklist_veiculos/${item.id}`), { observacao: note });
                              }
                            }}
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-zinc-700 mb-6">
                <Filter size={40} />
              </div>
              <h3 className="text-white font-black uppercase tracking-tight">Nenhum registro encontrado</h3>
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest mt-2">Personalize sua busca ou adicione um novo checklist.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => {
                setIsAdding(false);
                setEditingItem(null);
              }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0b0d19] border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  {editingItem ? <Edit2 size={24} /> : <Truck size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {editingItem ? 'Editar Registro' : 'Novo Checkpoint'}
                  </h3>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                    {editingItem ? `Atualizando dados de ${editingItem.cavalo}` : 'Insira os dados técnicos do conjunto'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Placa Cavalo</label>
                  <input 
                    type="text" 
                    value={editingItem ? editingItem.cavalo : newItem.cavalo}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, cavalo: val }) : null);
                      else setNewItem(prev => ({ ...prev, cavalo: val }));
                    }}
                    placeholder="AAA-0000"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Placa Carreta(s)</label>
                  <input 
                    type="text" 
                    value={editingItem ? editingItem.carretas : newItem.carretas}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, carretas: val }) : null);
                      else setNewItem(prev => ({ ...prev, carretas: val }));
                    }}
                    placeholder="CAR-1234 / CAR-5678"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Data do Teste</label>
                  <input 
                    type="date" 
                    value={editingItem ? editingItem.dataTeste : newItem.dataTeste}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, dataTeste: val }) : null);
                      else setNewItem(prev => ({ ...prev, dataTeste: val }));
                    }}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Data Vencimento</label>
                  <input 
                    type="date" 
                    value={editingItem ? editingItem.dataVencimento : newItem.dataVencimento}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, dataVencimento: val }) : null);
                      else setNewItem(prev => ({ ...prev, dataVencimento: val }));
                    }}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Periférico</label>
                  <select 
                    value={editingItem ? editingItem.periferico : newItem.periferico}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, periferico: val }) : null);
                      else setNewItem(prev => ({ ...prev, periferico: val }));
                    }}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-zinc-900">Selecione...</option>
                    <option value="TECLADO" className="bg-zinc-900">TECLADO</option>
                    <option value="TRAVA BAU" className="bg-zinc-900">TRAVA BAU</option>
                    <option value="SENSOR" className="bg-zinc-900">SENSOR</option>
                    <option value="BAU" className="bg-zinc-900">BAU</option>
                    <option value="PAINEL" className="bg-zinc-900">PAINEL</option>
                    <option value="OUTROS" className="bg-zinc-900">OUTROS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Manutenção / OS</label>
                  <input 
                    type="text" 
                    value={editingItem ? editingItem.manutencaoOs : newItem.manutencaoOs}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, manutencaoOs: val }) : null);
                      else setNewItem(prev => ({ ...prev, manutencaoOs: val }));
                    }}
                    placeholder="OS #12345"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Observações</label>
                  <textarea 
                    value={editingItem ? editingItem.observacao : newItem.observacao}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(prev => prev ? ({ ...prev, observacao: val }) : null);
                      else setNewItem(prev => ({ ...prev, observacao: val }));
                    }}
                    placeholder="Detalhes adicionais..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-primary/50 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                  }} 
                  className="flex-1 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={editingItem ? handleUpdate : handleAdd}
                  className="flex-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
                >
                  {editingItem ? 'Salvar Alterações' : 'Validar Checklist'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
