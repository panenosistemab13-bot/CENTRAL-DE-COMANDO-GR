import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  Clock, 
  Search,
  Truck,
  Wrench,
  Edit2,
  Copy,
  Check,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { AnimatePresence } from 'motion/react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';

interface PdfFile {
  id: string;
  name: string;
  url: string;
}

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
  pdfs?: PdfFile[];
  dataAgendamento?: string;
  osStatus?: 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  checklistRealizado?: 'sim' | 'não';
}

const LicensePlate: React.FC<{ plate: string; type?: 'cavalo' | 'carreta' }> = ({ plate, type }) => {
  if (!plate || plate === '-') return <span className="text-slate-400 font-mono font-bold">-</span>;
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[136px] h-[44px] shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-xs border",
      isCarreta ? "bg-amber-50 border-amber-300" : "bg-white border-slate-300"
    )}>
      <div className="w-full bg-[#0051A2] h-[11px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5.5px] text-white font-sans font-bold">BR</span>
        <span className="text-[7px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          {headerText}
        </span>
        <div className="w-[8px] h-[5.5px] bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden">
          <div className="w-[4.5px] h-[3px] bg-yellow-400 rotate-45 transform flex items-center justify-center">
            <div className="w-[1.5px] h-[1.5px] bg-blue-800 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className={cn("w-full flex-1 flex items-center justify-center px-2", isCarreta ? "bg-amber-100" : "bg-slate-50")}>
        <span className="text-slate-900 font-black text-[16px] tracking-wide leading-none select-all font-mono">
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default function Checklist() {
  const [pasteData, setPasteData] = useState('');
  const [activeView, setActiveView] = useState<'monitoring' | 'os' | 'generator'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [osSearchTerm, setOsSearchTerm] = useState('');
  const [osStatusFilter, setOsStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO'>('TODOS');
  const [items, setItems] = useState<ChecklistItem[]>([]);
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
    observacao: '',
    dataAgendamento: '',
    osStatus: 'PENDENTE',
    checklistRealizado: 'não'
  });

  const [genData, setGenData] = useState({
    greeting: 'Bom dia',
    cavalo: '',
    carretas: '',
    contato: '(31) 984817047'
  });
  const [genCopied, setGenCopied] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const handleImportData = async () => {
    const lines = pasteData.trim().split('\n');
    const updates: Record<string, any> = {};

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      let cavalo = '';
      let carretas = '';
      let statusStr = 'APROVADO';
      let dataTesteStr = '';
      let dataVencStr = '';

      if (parts.length >= 5) {
        cavalo = parts[0];
        carretas = parts[1];
        statusStr = parts[2].toUpperCase();
        dataTesteStr = parts[3];
        dataVencStr = parts[4];
      } else if (parts.length === 4) {
        cavalo = parts[0];
        carretas = '';
        statusStr = parts[1].toUpperCase();
        dataTesteStr = parts[2];
        dataVencStr = parts[3];
      } else {
        const tokens = line.split(/\s+/);
        if (tokens.length >= 5) {
          cavalo = tokens[0];
          const dateIndices = tokens.reduce((acc, t, idx) => {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) acc.push(idx);
            return acc;
          }, [] as number[]);

          if (dateIndices.length >= 2) {
            const tIdx1 = dateIndices[0];
            const tIdx2 = dateIndices[1];
            dataTesteStr = tokens[tIdx1];
            dataVencStr = tokens[tIdx2];
            statusStr = tokens.slice(tIdx1 - 2, tIdx1).join(' ').toUpperCase();
            carretas = tokens.slice(1, tIdx1 - 2).join(' ');
          }
        }
      }

      if (cavalo) {
        cavalo = cavalo.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase();
        const parseDate = (d: string) => {
          if (!d || d === 'REPROVADO' || d === 'VENCIDO' || d === '#VALUE!') return format(new Date(), 'yyyy-MM-dd');
          const [dd, mm, yyyy] = d.split('/');
          if (yyyy && mm && dd) return `${yyyy}-${mm}-${dd}`;
          return format(new Date(), 'yyyy-MM-dd');
        };

        const parsedTeste = parseDate(dataTesteStr);
        const parsedVenc = (dataVencStr === 'REPROVADO' || dataVencStr === 'VENCIDO' || dataVencStr === '#VALUE!') 
          ? format(addDays(new Date(), -1), 'yyyy-MM-dd') 
          : parseDate(dataVencStr);

        const isNegated = statusStr.includes('VENCIDO') || statusStr.includes('NEGATIVADO') || statusStr.includes('REPROVADO') || dataVencStr === 'REPROVADO';
        const resolvedStatus = isNegated ? 'NEGATIVADO' : 'APROVADO';

        const existing = items.find(item => item.cavalo.toUpperCase() === cavalo.toUpperCase());
        if (existing) {
          updates[`checklist_veiculos/${existing.id}`] = {
            ...existing,
            carretas: carretas || existing.carretas,
            statusOverride: resolvedStatus as ChecklistItem['statusOverride'],
            dataTeste: parsedTeste,
            dataVencimento: parsedVenc
          };
        } else {
          const newId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
          updates[`checklist_veiculos/${newId}`] = {
            cavalo,
            carretas: carretas || '',
            statusOverride: resolvedStatus as ChecklistItem['statusOverride'],
            dataTeste: parsedTeste,
            dataVencimento: parsedVenc,
            manutencaoOs: '',
            periferico: '',
            observacao: ''
          };
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      try {
        await update(ref(rtdb), updates);
        alert('Checklist atualizado com sucesso via colagem!');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar checklist.');
      }
    } else {
      alert('Nenhum dado válido encontrado para importação.');
    }
    setPasteData('');
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos PDF são permitidos.');
      return;
    }

    setUploadingItemId(itemId);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const fileId = Date.now().toString();
          const item = items.find(i => i.id === itemId);
          if (item) {
            const newPdf = { id: fileId, name: file.name, url: base64String };
            const updatedPdfs = item.pdfs ? [...item.pdfs, newPdf] : [newPdf];
            await update(ref(rtdb, `checklist_veiculos/${itemId}`), { pdfs: updatedPdfs });
          }
        } catch (error) {
          console.error("Erro ao salvar PDF:", error);
          alert("Erro ao fazer upload do arquivo.");
        } finally {
          setUploadingItemId(null);
          event.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      setUploadingItemId(null);
      event.target.value = '';
    }
  };

  const handlePdfAction = (e: React.MouseEvent, pdfUrl: string, title: string, action: 'view' | 'download') => {
    e.stopPropagation();
    e.preventDefault();
    let urlToUse = pdfUrl;
    if (pdfUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = pdfUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        urlToUse = URL.createObjectURL(blob);
      } catch (err) {
        console.error("Error creating blob", err);
      }
    }

    if (action === 'view') {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${urlToUse}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        window.location.href = urlToUse;
      }
    } else {
      const a = document.createElement('a');
      a.href = urlToUse;
      a.download = title || 'checklist.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
        setItems([]);
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
        observacao: '',
        dataAgendamento: '',
        osStatus: 'PENDENTE',
        checklistRealizado: 'não',
        statusOverride: undefined
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

  const handleClearAll = async () => {
    if (!confirm("Tem certeza de que deseja apagar TODOS os registros do checklist?")) return;
    try {
      await remove(ref(rtdb, 'checklist_veiculos'));
      setItems([]);
    } catch (error) {
      console.error("Erro ao limpar:", error);
    }
  };

  const safeParseDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    let d = parseISO(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    const timestampDate = new Date(dateStr);
    if (!isNaN(timestampDate.getTime())) return timestampDate;
    return null;
  };

  const getStatus = (item: ChecklistItem) => {
    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
        return { label: item.statusOverride, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
      }
      return { label: item.statusOverride, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    }
    const today = new Date();
    const expiry = safeParseDate(item.dataVencimento);
    if (!expiry) {
      return { label: 'PENDENTE', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    }
    const diff = differenceInDays(expiry, today);
    if (diff < 0) return { label: 'VENCIDO', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    if (diff <= 3) return { label: 'A VENCER', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'APROVADO', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.carretas.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const status = getStatus(item);
    if (filter === 'EM DIA') return status.label === 'APROVADO' || status.label === 'A VENCER';
    if (filter === 'VENCIDO') return status.label === 'VENCIDO';
    if (filter === 'NEGATIVADOS') return status.label === 'NEGATIVADO' || status.label === 'REPROVADO';
    return true;
  });

  const sortedCavalos = [...items].sort((a, b) => a.cavalo.localeCompare(b.cavalo));

  const handleCopyGenerator = () => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; font-size: 11pt; padding: 20px;">
        <p style="margin: 0 0 16px 0;">${genData.greeting},</p>
        <p style="margin: 0 0 16px 0;">Solicito o <strong>checklist</strong> para os conjuntos abaixo:</p>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #0F2D59; color: #ffffff;">
              <th style="padding: 10px 14px; border: 1px solid #cbd5e1; text-align: center;">VEÍCULO CAVALO</th>
              <th style="padding: 10px 14px; border: 1px solid #cbd5e1; text-align: center;">CARRETAS DO CONJUNTO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">${genData.cavalo || "—"}</td>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">${genData.carretas || "—"}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin: 0 0 8px 0;">Canal de Atendimento: <strong>${genData.contato}</strong></p>
        <p style="margin: 20px 0 0 0;">Atenciosamente,<br/><strong>Jefferson Augusto</strong> - Agente de Risco</p>
      </div>
    `;
    const textContent = `*${genData.greeting}*,\n\nSolicito o *checklist* para os conjuntos abaixo:\n\n*VEÍCULO CAVALO*: ${genData.cavalo || "—"}\n*CARRETAS DO CONJUNTO*: ${genData.carretas || "—"}\n\n*Canal de Atendimento*: ${genData.contato}\n\nAtenciosamente,\n*Jefferson Augusto* - Agente de Risco`;
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
      navigator.clipboard.writeText(textContent);
      setGenCopied(true);
      setTimeout(() => setGenCopied(false), 2000);
    }
  };

  const totalVeiculos = items.length;
  const totalVencidos = items.filter(i => getStatus(i).label === 'VENCIDO' || getStatus(i).label === 'NEGATIVADO' || getStatus(i).label === 'REPROVADO').length;
  const totalEmDia = totalVeiculos - totalVencidos;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* CORPORATE OFFICE HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ClipboardCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-blue-950 uppercase">
              Central de Checklist & Vistorias de Frota
            </h1>
            <p className="text-xs font-semibold text-blue-800">
              Sistema corporativo de conformidade e controle de manutenção
            </p>
          </div>
        </div>
      </header>

      {/* SUBHEADER & CONTROLS RIBBON */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setActiveView('monitoring')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
              activeView === 'monitoring'
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-900 hover:bg-white"
            )}
          >
            <ClipboardCheck size={16} />
            <span>Checklist</span>
          </button>
          <button
            onClick={() => setActiveView('os')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
              activeView === 'os'
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-900 hover:bg-white"
            )}
          >
            <FileText size={16} />
            <span>O.S</span>
          </button>
          <button
            onClick={() => setActiveView('generator')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
              activeView === 'generator'
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-900 hover:bg-white"
            )}
          >
            <Sparkles size={16} />
            <span>Solicitação</span>
          </button>
        </div>

        {/* Metrics Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <Truck size={16} className="text-blue-600" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block leading-tight">Total Frota</span>
              <span className="text-sm font-extrabold text-blue-950">{totalVeiculos}</span>
            </div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <Check size={16} className="text-emerald-600" />
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block leading-tight">Em Dia</span>
              <span className="text-sm font-extrabold text-emerald-800">{totalEmDia}</span>
            </div>
          </div>
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-rose-600" />
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase block leading-tight">Vencidos</span>
              <span className="text-sm font-extrabold text-rose-800">{totalVencidos}</span>
            </div>
          </div>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeView === 'monitoring' && (
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar placa ou carreta..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono uppercase transition-all"
              />
            </div>
          )}

          {activeView === 'os' && (
            <div className="flex flex-wrap items-center gap-2 flex-1 md:flex-initial">
              <div className="relative flex-1 md:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={osSearchTerm}
                  onChange={(e) => setOsSearchTerm(e.target.value)}
                  placeholder="Buscar placa / O.S..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono uppercase transition-all"
                />
                {osSearchTerm && (
                  <button
                    onClick={() => setOsSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {sortedCavalos.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={sortedCavalos.some(i => i.cavalo === osSearchTerm) ? osSearchTerm : ''}
                    onChange={(e) => setOsSearchTerm(e.target.value)}
                    className="bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-950 uppercase outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer font-mono shadow-2xs transition-all"
                    title="Puxar placa da aba Checklist"
                  >
                    <option value="">-- Puxar Placa do Checklist --</option>
                    {sortedCavalos.map(item => (
                      <option key={item.id} value={item.cavalo}>
                        {item.cavalo} {item.carretas ? `(${item.carretas})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Novo Registro</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              title="Apagar todos os registros"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
        
        {/* ================= VIEW: GERADOR / CHECKPOINT ================= */}
        {activeView === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Form Configuration Card */}
            <div className="lg:col-span-1 space-y-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2 text-blue-950">
                <Sparkles size={18} className="text-blue-600" />
                Configurar Solicitação de Checklist
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1.5 block tracking-wider text-blue-950">Saudação</label>
                  <select
                    value={genData.greeting}
                    onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                  >
                    <option value="Bom dia">Bom dia</option>
                    <option value="Boa tarde">Boa tarde</option>
                    <option value="Boa noite">Boa noite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase mb-1.5 block tracking-wider text-blue-950">Veículo (Cavalo)</label>
                  <select
                    value={genData.cavalo}
                    onChange={(e) => {
                      const cavalo = e.target.value;
                      const relatedItem = items.find(i => i.cavalo === cavalo);
                      setGenData(prev => ({ 
                        ...prev, 
                        cavalo,
                        carretas: relatedItem ? relatedItem.carretas : prev.carretas 
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer uppercase"
                  >
                    <option value="">Selecione veículo...</option>
                    {sortedCavalos.map(item => (
                      <option key={item.id} value={item.cavalo}>
                        {item.cavalo} {getStatus(item).label === 'VENCIDO' ? `(⚠️ VENCIDO)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase mb-1.5 block tracking-wider text-blue-950">Carretas Relacionadas</label>
                  <input
                    type="text"
                    value={genData.carretas}
                    onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="EX: PNE7353 / PNE7433"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none uppercase font-mono placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase mb-1.5 block tracking-wider text-blue-950">Celular Contato</label>
                  <input
                    type="text"
                    value={genData.contato}
                    onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={handleCopyGenerator}
                className={cn(
                  "w-full mt-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer",
                  genCopied 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {genCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{genCopied ? 'Solicitação Copiada!' : 'Copiar para WhatsApp'}</span>
              </button>
            </div>

            {/* Preview Document Card */}
            <div className="lg:col-span-2 flex items-center justify-center bg-white border border-slate-200 p-8 rounded-2xl shadow-xs">
              <div className="w-full max-w-xl bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
                <p className="mb-4 text-base font-semibold text-blue-950">{genData.greeting},</p>
                <p className="mb-6 text-sm text-slate-700">
                  Solicito o <strong className="font-bold text-blue-700">checklist</strong> para os conjuntos abaixo:
                </p>
                
                <table className="w-full border-collapse border border-slate-300 text-center mb-6 overflow-hidden rounded-lg">
                  <thead>
                    <tr className="bg-blue-900 text-white text-xs uppercase font-bold tracking-wider">
                      <th className="p-3 border border-blue-950">Veículo Cavalo</th>
                      <th className="p-3 border border-blue-950">Carretas do Conjunto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white font-mono font-bold text-slate-900">
                      <td className="p-3.5 border border-slate-300 uppercase">{genData.cavalo || "—"}</td>
                      <td className="p-3.5 border border-slate-300 uppercase">{genData.carretas || "—"}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-blue-950 font-mono text-xs mb-8 font-semibold">
                  Canal de Atendimento: {genData.contato}
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-between items-end">
                  <p className="text-slate-500 text-xs font-medium">Atenciosamente,</p>
                  <div className="text-center mr-2">
                    <p className="font-serif italic text-2xl text-blue-950">Jefferson Augusto</p>
                    <div className="w-32 h-[1.5px] bg-blue-600 my-1 mx-auto"></div>
                    <p className="text-[10px] uppercase tracking-widest text-blue-800 font-bold font-sans">Agente de Risco</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'os' ? (
          /* ================= VIEW: ORDEM DE SERVIÇO (O.S) ================= */
          <div className="space-y-6 animate-fade-in">
            {/* Header and Filter Plaque */}
            <div className="w-full bg-white text-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-blue-950">
                    Controle de Ordens de Serviço (O.S)
                  </h2>
                  <p className="text-xs text-blue-800 font-semibold mt-0.5">
                    Sincronizado em tempo real com todas as placas da aba Checklist
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                {(['TODOS', 'PENDENTE', 'AGENDADO', 'EM ANDAMENTO', 'CONCLUÍDO', 'CANCELADO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOsStatusFilter(st)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                      osStatusFilter === st
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-blue-900 hover:bg-white"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Truck size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Frota</span>
                  <span className="text-base font-extrabold text-blue-950">{items.length}</span>
                </div>
              </div>
              <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                  <ShieldAlert size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-rose-700 tracking-wider">Pendente</span>
                  <span className="text-base font-extrabold text-rose-700">
                    {items.filter(item => (item.osStatus || 'PENDENTE') === 'PENDENTE').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Activity size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-blue-700 tracking-wider">Agendado</span>
                  <span className="text-base font-extrabold text-blue-700">
                    {items.filter(item => item.osStatus === 'AGENDADO').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <Loader2 size={18} className="stroke-[2.5] animate-spin" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-amber-700 tracking-wider">Em Andamento</span>
                  <span className="text-base font-extrabold text-amber-700">
                    {items.filter(item => item.osStatus === 'EM ANDAMENTO').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Concluído</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {items.filter(item => item.osStatus === 'CONCLUÍDO').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Table Container Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-hidden">
              {items.filter(item => {
                const term = osSearchTerm.toLowerCase().trim();
                const matchesSearch = !term || 
                  (item.cavalo || '').toLowerCase().includes(term) || 
                  (item.carretas || '').toLowerCase().includes(term) ||
                  (item.manutencaoOs || '').toLowerCase().includes(term);
                const currentStatus = item.osStatus || 'PENDENTE';
                const matchesStatus = osStatusFilter === 'TODOS' || currentStatus === osStatusFilter;
                return matchesSearch && matchesStatus;
              }).length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 min-h-[300px]">
                  <Truck className="text-slate-400 w-12 h-12 mb-3" />
                  <p className="text-sm text-slate-800 mb-1 font-bold uppercase">Nenhum registro encontrado</p>
                  <p className="text-xs text-slate-500 max-w-md">
                    {osSearchTerm || osStatusFilter !== 'TODOS'
                      ? "Altere os filtros ou termos da sua busca para encontrar os veículos."
                      : "Nenhum veículo cadastrado. Clique no botão 'Novo Registro' acima para cadastrar."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-blue-900 text-white text-xs uppercase font-bold tracking-wider h-11 border-b border-blue-950">
                        <th className="px-3 py-2.5 w-12 text-center select-none">#</th>
                        <th className="px-4 py-2.5 min-w-[260px]">Placa do Cavalo</th>
                        <th className="px-4 py-2.5 w-56 text-center">Número da O.S</th>
                        <th className="px-4 py-2.5 w-56 text-center">Data Agendamento</th>
                        <th className="px-4 py-2.5 w-52 text-center">Dias Vencimento</th>
                        <th className="px-4 py-2.5 w-52 text-center">Status da O.S</th>
                        <th className="px-4 py-2.5 w-48 text-center">Checklist Feito</th>
                        <th className="px-4 py-2.5 w-28 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.filter(item => {
                        const term = osSearchTerm.toLowerCase().trim();
                        const matchesSearch = !term || 
                          (item.cavalo || '').toLowerCase().includes(term) || 
                          (item.carretas || '').toLowerCase().includes(term) ||
                          (item.manutencaoOs || '').toLowerCase().includes(term);
                        const currentStatus = item.osStatus || 'PENDENTE';
                        const matchesStatus = osStatusFilter === 'TODOS' || currentStatus === osStatusFilter;
                        return matchesSearch && matchesStatus;
                      }).map((item, i) => {
                        // Calculate days remaining
                        let daysRemainingText = 'Sem agendamento';
                        let daysRemainingStyle = 'bg-slate-50 text-slate-500 border-slate-200';
                        if (item.dataAgendamento) {
                          try {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const target = new Date(item.dataAgendamento + 'T00:00:00');
                            target.setHours(0, 0, 0, 0);
                            const diffTime = target.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays > 0) {
                              daysRemainingText = `Faltam ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
                              daysRemainingStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                            } else if (diffDays === 0) {
                              daysRemainingText = 'Hoje';
                              daysRemainingStyle = 'bg-amber-50 text-amber-700 border-amber-200 font-bold animate-pulse';
                            } else {
                              const absDays = Math.abs(diffDays);
                              daysRemainingText = `Atrasado ${absDays} dia${absDays > 1 ? 's' : ''}`;
                              daysRemainingStyle = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                            }
                          } catch (e) {
                            daysRemainingText = 'Data inválida';
                            daysRemainingStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                          }
                        }

                        // Select styles helper
                        let selectStyle = 'bg-slate-50 text-slate-900 border-slate-300 font-bold';
                        switch (item.osStatus) {
                          case 'PENDENTE':
                            selectStyle = 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500 font-bold';
                            break;
                          case 'AGENDADO':
                            selectStyle = 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500 font-bold';
                            break;
                          case 'EM ANDAMENTO':
                            selectStyle = 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500 font-bold';
                            break;
                          case 'CONCLUÍDO':
                            selectStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500 font-bold';
                            break;
                          case 'CANCELADO':
                            selectStyle = 'bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-500 font-bold';
                            break;
                        }

                        return (
                          <tr 
                            key={item.id} 
                            className="text-xs text-slate-900 hover:bg-blue-50/40 transition-colors border-b border-slate-100 h-16"
                          >
                            {/* Index */}
                            <td className="p-2 text-center text-slate-400 font-mono text-xs w-12 select-none font-bold">
                              {i + 1}
                            </td>

                            {/* Plates column */}
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  {item.cavalo && (
                                    <LicensePlate plate={item.cavalo} type="cavalo" />
                                  )}
                                </div>
                                {item.carretas && (
                                  <span className="text-[11px] font-mono text-blue-900 font-bold">
                                    Conjunto: {item.carretas}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* O.S Number column */}
                            <td className="p-3">
                              <input 
                                id={`os-number-${item.id}`}
                                type="text"
                                defaultValue={item.manutencaoOs || ''}
                                onBlur={(e) => {
                                  const val = e.target.value;
                                  update(ref(rtdb, `checklist_veiculos/${item.id}`), { manutencaoOs: val }).catch(err => {
                                    console.error("Erro ao salvar O.S:", err);
                                  });
                                }}
                                placeholder="Nº DA O.S (EX: 900382)"
                                className="w-full bg-slate-50 border border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:bg-white text-blue-950 font-bold rounded-lg py-2 px-3 text-center outline-none transition-all uppercase text-xs font-mono"
                              />
                            </td>

                            {/* Scheduled Date column */}
                            <td className="p-3">
                              <input 
                                id={`os-date-${item.id}`}
                                type="date"
                                value={item.dataAgendamento || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  update(ref(rtdb, `checklist_veiculos/${item.id}`), { dataAgendamento: val }).catch(err => {
                                    console.error("Erro ao salvar data agendamento:", err);
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:bg-white text-slate-900 font-bold rounded-lg py-2 px-3 text-center outline-none transition-all text-xs font-mono"
                              />
                            </td>

                            {/* Expiry Days column */}
                            <td className="p-3 text-center">
                              <div className={cn(
                                "inline-block px-3 py-1.5 rounded-lg text-[10px] uppercase border select-none min-w-[120px] text-center font-mono font-bold",
                                daysRemainingStyle
                              )}>
                                {daysRemainingText}
                              </div>
                            </td>

                            {/* Status dropdown column */}
                            <td className="p-3 text-center">
                              <select
                                id={`os-status-${item.id}`}
                                value={item.osStatus || 'PENDENTE'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  update(ref(rtdb, `checklist_veiculos/${item.id}`), { osStatus: val }).catch(err => {
                                    console.error("Erro ao salvar status:", err);
                                  });
                                }}
                                className={cn(
                                  "w-full border rounded-lg py-2 px-3 text-center outline-none transition-all text-xs font-bold cursor-pointer",
                                  selectStyle
                                )}
                              >
                                <option value="PENDENTE">🔴 PENDENTE</option>
                                <option value="AGENDADO">🔵 AGENDADO</option>
                                <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                                <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                                <option value="CANCELADO">⚫ CANCELADO</option>
                              </select>
                            </td>

                            {/* Checklist Realizado dropdown column */}
                            <td className="p-3 text-center">
                              <select
                                id={`os-checklist-realizado-${item.id}`}
                                value={item.checklistRealizado || 'não'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  update(ref(rtdb, `checklist_veiculos/${item.id}`), { checklistRealizado: val }).catch(err => {
                                    console.error("Erro ao salvar checklist realizado:", err);
                                  });
                                }}
                                className={cn(
                                  "w-full border rounded-lg py-2 px-3 text-center outline-none transition-all text-xs font-bold cursor-pointer",
                                  (item.checklistRealizado || 'não') === 'sim'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500"
                                    : "bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-500"
                                )}
                              >
                                <option value="não">❌ NÃO</option>
                                <option value="sim">✔️ SIM</option>
                              </select>
                            </td>

                            {/* Actions column */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-2 bg-slate-100 hover:bg-blue-50 text-blue-900 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= VIEW: MONITORAMENTO (DEFAULT) ================= */
          <div className="space-y-6 animate-fade-in">
            
            {/* Filter & Import Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Filter Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-950 block mb-3">Filtrar por Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center border shadow-2xs",
                          filter === f 
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 mt-4">
                  Mostrando <strong className="text-blue-950 font-bold">{filteredItems.length}</strong> de {items.length} veículos.
                </div>
              </div>

              {/* Paste Importer Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <FileSpreadsheet size={16} className="text-blue-600" />
                    Atualizar Checklist via Colagem (Planilha)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Cole as colunas sem cabeçalho</span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Cole aqui as informações copiadas do Excel (Placa, Conjunto, Status, Data Teste, Data Vencimento)..."
                    className="w-full h-20 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none font-mono transition-all"
                  />
                  <button 
                    onClick={handleImportData}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 shrink-0 flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicles Cards List */}
            <div className="space-y-3.5">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const status = getStatus(item);
                  const parsedExpiry = safeParseDate(item.dataVencimento);
                  const diasParaVencer = parsedExpiry ? differenceInDays(parsedExpiry, new Date()) : 0;
                  const formattedVencimento = parsedExpiry ? format(parsedExpiry, 'dd/MM/yyyy') : (item.dataVencimento || '—');

                  return (
                    <div key={item.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition-all">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        
                        {/* Plates Section */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 w-full lg:w-auto">
                          <div className="flex flex-col items-center lg:items-start">
                            <span className="text-[10px] font-bold text-blue-950 uppercase mb-1.5 tracking-wider">Placa Cavalo</span>
                            <LicensePlate plate={item.cavalo} type="cavalo" />
                          </div>

                          {item.carretas && (
                            <div className="flex flex-col items-center lg:items-start">
                              <span className="text-[10px] font-bold text-blue-950 uppercase mb-1.5 tracking-wider">Carretas do Conjunto</span>
                              <div className="bg-blue-50/60 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-2.5">
                                <Truck size={18} className="text-blue-600" />
                                <span className="font-mono font-extrabold text-sm text-blue-950 uppercase tracking-wide">{item.carretas}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details & Status Section */}
                        <div className="flex flex-col items-center lg:items-start gap-2.5 flex-1 px-2 text-center lg:text-left">
                          <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                            {status.label === 'NEGATIVADO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={14} />
                                <span>NEGATIVADO</span>
                              </div>
                            ) : status.label === 'REPROVADO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={14} />
                                <span>REPROVADO</span>
                              </div>
                            ) : diasParaVencer < 0 || status.label === 'VENCIDO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={14} />
                                <span>VENCIDO</span>
                              </div>
                            ) : status.label === 'A VENCER' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={14} />
                                <span>A VENCER</span>
                              </div>
                            ) : (
                              <div className="px-3.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Check size={14} />
                                <span>APROVADO</span>
                              </div>
                            )}

                            {item.periferico && (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={12} className="text-blue-600" /> {item.periferico}
                              </span>
                            )}

                            {item.manutencaoOs && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-mono font-bold text-[11px]">
                                OS: {item.manutencaoOs}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 mt-0.5 flex-wrap justify-center lg:justify-start">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-blue-600" />
                              <span>Vencimento: <strong className="font-mono font-bold text-slate-900">{formattedVencimento}</strong></span>
                            </div>
                            <span className={cn(
                              "font-mono font-bold text-xs",
                              diasParaVencer < 0 ? "text-rose-700" : diasParaVencer <= 3 ? "text-amber-700" : "text-emerald-700"
                            )}>
                              ({diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias restantes`})
                            </span>
                          </div>

                          {item.observacao && (
                            <p className="text-xs text-slate-500 italic max-w-lg">
                              "{item.observacao}"
                            </p>
                          )}
                        </div>

                        {/* Actions Section */}
                        <div className="flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                          <label className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all">
                            {uploadingItemId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            <span>Anexar PDF</span>
                            <input 
                              type="file" 
                              accept="application/pdf" 
                              className="hidden" 
                              onChange={(e) => handlePdfUpload(e, item.id)}
                            />
                          </label>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all cursor-pointer border border-slate-200"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-all cursor-pointer border border-rose-200"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* PDF Attachments List */}
                      {item.pdfs && item.pdfs.length > 0 && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-bold text-blue-950 uppercase tracking-wider">PDFs Anexados:</span>
                          {item.pdfs.map(pdf => (
                            <div key={pdf.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shadow-2xs">
                              <FileText size={13} className="text-blue-600" />
                              <span className="text-xs font-mono font-bold text-slate-800 max-w-[150px] truncate">{pdf.name}</span>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'view')} 
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold uppercase ml-1 cursor-pointer"
                              >
                                Ver
                              </button>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'download')} 
                                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold uppercase ml-1 cursor-pointer"
                              >
                                Baixar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* ================= EDIT MODAL ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-base font-bold uppercase text-blue-950 mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Editar Checklist: {editingItem.cavalo}</span>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono uppercase font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={editingItem.carretas}
                  onChange={(e) => setEditingItem({ ...editingItem, carretas: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono uppercase font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem({ ...editingItem, dataTeste: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Status Manual</label>
                <select
                  value={editingItem.statusOverride || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, statusOverride: e.target.value as any || undefined })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium"
                >
                  <option value="">Automático (Calculado pela Data)</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="NEGATIVADO">NEGATIVADO</option>
                  <option value="REPROVADO">REPROVADO</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Nº da O.S</label>
                  <input
                    type="text"
                    value={editingItem.manutencaoOs || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, manutencaoOs: e.target.value.toUpperCase() })}
                    placeholder="EX: 900382"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Data Agendamento O.S</label>
                  <input
                    type="date"
                    value={editingItem.dataAgendamento || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataAgendamento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Status da O.S</label>
                  <select
                    value={editingItem.osStatus || 'PENDENTE'}
                    onChange={(e) => setEditingItem({ ...editingItem, osStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold"
                  >
                    <option value="PENDENTE">🔴 PENDENTE</option>
                    <option value="AGENDADO">🔵 AGENDADO</option>
                    <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                    <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                    <option value="CANCELADO">⚫ CANCELADO</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Checklist Realizado</label>
                  <select
                    value={editingItem.checklistRealizado || 'não'}
                    onChange={(e) => setEditingItem({ ...editingItem, checklistRealizado: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold"
                  >
                    <option value="não">❌ NÃO</option>
                    <option value="sim">✔️ SIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={editingItem.periferico || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, periferico: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Observação</label>
                <textarea
                  value={editingItem.observacao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacao: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW REGISTRATION MODAL ================= */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-base font-bold uppercase text-blue-950 mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Novo Registro de Checklist</span>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </h3>

            <div className="space-y-4 text-sm">
              {/* Dropdown to pull existing plate from Checklist */}
              {sortedCavalos.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                    <Truck size={14} className="text-blue-600" />
                    <span>Puxar Placa da aba Checklist</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedCavalo = e.target.value;
                      if (!selectedCavalo) return;
                      const found = items.find(i => i.cavalo === selectedCavalo);
                      if (found) {
                        setNewItem({
                          cavalo: found.cavalo || '',
                          carretas: found.carretas || '',
                          dataTeste: found.dataTeste || format(new Date(), 'yyyy-MM-dd'),
                          dataVencimento: found.dataVencimento || format(addDays(new Date(), 60), 'yyyy-MM-dd'),
                          manutencaoOs: found.manutencaoOs || '',
                          periferico: found.periferico || '',
                          observacao: found.observacao || '',
                          dataAgendamento: found.dataAgendamento || '',
                          osStatus: found.osStatus || 'PENDENTE',
                          checklistRealizado: found.checklistRealizado || 'não',
                          statusOverride: found.statusOverride
                        });
                      }
                    }}
                    className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs text-blue-950 font-mono font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 uppercase cursor-pointer"
                  >
                    <option value="">-- Selecione uma placa da aba Checklist --</option>
                    {sortedCavalos.map(item => (
                      <option key={item.id} value={item.cavalo}>
                        {item.cavalo} {item.carretas ? `(${item.carretas})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-800 font-medium">
                    Preenche automaticamente a placa do cavalo e conjunto com os dados do Checklist.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="EX: POZ4431"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono uppercase font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono uppercase font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={newItem.periferico}
                  onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value.toUpperCase() })}
                  placeholder="EX: TECLADO / SENSOR"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-950 uppercase mb-1 block">Observação</label>
                <textarea
                  value={newItem.observacao}
                  onChange={(e) => setNewItem({ ...newItem, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                >
                  Cadastrar Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
