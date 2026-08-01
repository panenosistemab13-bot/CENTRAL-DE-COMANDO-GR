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
  Eye,
  Download,
  Sparkles,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
  Clipboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';
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
}

const QUICK_CODES = [
  { label: 'Cápsula', value: '9000000982' },
  { label: 'Máquina', value: '000000901' },
  { label: 'Embalagem', value: '132' }
];

function Screw({ className }: { className?: string }) {
  return (
    <div className={cn(
      "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
      className
    )}>
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

const WoodenPlaque: React.FC<{
  children: React.ReactNode;
  className?: string;
  screwSize?: string;
}> = ({ children, className, screwSize }) => {
  return (
    <div className={cn(
      "rounded-2xl bg-gradient-to-br from-[#f8f1e5] via-[#eddaba] to-[#e4cbab] border-[6px] border-[#311f14] shadow-[0_22px_45px_rgba(0,0,0,0.88),inset_1.5px_1.5px_3px_rgba(255,255,255,0.45)] relative p-6 flex flex-col justify-between ring-2 ring-[#1c1109]/30",
      className
    )}>
      <Screw className={cn("absolute top-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute top-3 right-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 right-3 w-3 h-3", screwSize)} />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

const LicensePlate: React.FC<{ plate: string; type?: 'cavalo' | 'carreta' }> = ({ plate, type }) => {
  if (!plate || plate === '-') return <span className="text-[#5c3c24] font-mono font-bold">-</span>;
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[140px] h-[46px] shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.35)] border-2",
      isCarreta ? "bg-[#fffde7] border-[#e6b800]" : "bg-[#f7f4ed] border-[#5c3c24]/80"
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
      <div className={cn("w-full flex-1 flex items-center justify-center px-2", isCarreta ? "bg-gradient-to-b from-[#fff176] to-[#fbc02d]" : "bg-gradient-to-b from-[#ffffff] to-[#e8e4db]")}>
        <span className="text-[#1a1c1d] font-black text-[17px] tracking-wide leading-none select-all" style={{ textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.8)' }}>
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default function Checklist() {
  const [pasteData, setPasteData] = useState('');
  const [activeView, setActiveView] = useState<'monitoring' | 'generator'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filter, setFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADOS'>('TODOS');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Omit<ChecklistItem, 'id'>>({
    cavalo: '',
    carretas: '',
    dataTeste: format(new Date(), 'yyyy-MM-dd'),
    dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    manutencaoOs: '',
    periferico: '',
    observacao: ''
  });

  const [genData, setGenData] = useState({
    greeting: 'Bom dia',
    cavalo: '',
    carretas: '',
    contato: '(31) 984817047'
  });
  const [genCopied, setGenCopied] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const copyCodeToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error("Erro ao copiar código:", e);
    }
  };

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
        return { label: item.statusOverride, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-300' };
      }
      return { label: item.statusOverride, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' };
    }
    const today = new Date();
    const expiry = safeParseDate(item.dataVencimento);
    if (!expiry) {
      return { label: 'PENDENTE', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300' };
    }
    const diff = differenceInDays(expiry, today);
    if (diff < 0) return { label: 'VENCIDO', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-300' };
    if (diff <= 3) return { label: 'A VENCER', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300' };
    return { label: 'APROVADO', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' };
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
      <div style="font-family: Calibri, Arial, sans-serif; color: #000000; font-size: 11pt; padding: 20px;">
        <p style="margin: 0 0 16px 0;">${genData.greeting},</p>
        <p style="margin: 0 0 16px 0;">Solicito o <strong>checklist</strong> para os conjuntos abaixo:</p>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #000000; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff;">
              <th style="padding: 8px 12px; border: 1px solid #000000; text-align: center;">VEÍCULO CAVALO</th>
              <th style="padding: 8px 12px; border: 1px solid #000000; text-align: center;">CARRETAS DO CONJUNTO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-weight: bold;">${genData.cavalo || "—"}</td>
              <td style="padding: 8px 12px; border: 1px solid #000000; text-align: center; font-weight: bold;">${genData.carretas || "—"}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin: 0 0 8px 0;">Canal de Atendimento: ${genData.contato}</p>
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
    <div className="flex flex-col min-h-screen bg-[#2D1A10] text-stone-100 font-sans" style={{ zoom: 0.88 }}>
      
      {/* HEADER IDÊNTICO AO PATIO */}
      <header className="bg-[#3A2414] border-b-4 border-[#6B4423] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#B32025] animate-pulse"></div>
          <h1 className="text-base font-black tracking-wider text-[#fdf8f0] uppercase font-serif flex items-center gap-2">
            <ClipboardCheck size={20} className="text-[#C7A26A]" />
            CENTRAL DE CHECKLIST E VISTORIAS DE FROTA
          </h1>
        </div>

        {/* Quick Codes */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-black uppercase text-[#C7A26A] tracking-wider hidden sm:inline">CÓDIGOS RÁPIDOS:</span>
          {QUICK_CODES.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2 bg-[#21120B] border border-[#6B4423] rounded-xl px-3 py-1.5 shadow-inner"
            >
              <span className="text-[11px] font-black text-[#eddaba] uppercase">{item.label}:</span>
              <code className="text-xs font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                {item.value}
              </code>
              <button
                type="button"
                onClick={() => copyCodeToClipboard(item.label, item.value)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border shadow-sm",
                  copiedCode === item.label
                    ? "bg-green-600 border-green-500 text-white"
                    : "bg-[#B32025] hover:bg-[#8c060a] border-[#5a0f12] text-white"
                )}
              >
                {copiedCode === item.label ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedCode === item.label ? 'OK' : 'COPIAR'}</span>
              </button>
            </div>
          ))}
        </div>
      </header>

      {/* SUBHEADER & METRICS RIBBON */}
      <div className="bg-[#21120B] border-b border-[#6B4423]/60 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2 p-1.5 bg-[#3A2414] border border-[#6B4423] rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveView('monitoring')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
              activeView === 'monitoring'
                ? "bg-[#B32025] text-white shadow-md border border-[#ff4d4d]/40"
                : "text-[#eddaba] hover:text-white"
            )}
          >
            <ClipboardCheck size={16} />
            <span>Monitoramento de Frota</span>
          </button>
          <button
            onClick={() => setActiveView('generator')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-serif font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
              activeView === 'generator'
                ? "bg-[#B32025] text-white shadow-md border border-[#ff4d4d]/40"
                : "text-[#eddaba] hover:text-white"
            )}
          >
            <Sparkles size={16} />
            <span>Gerador / Checkpoint</span>
          </button>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-[#3A2414] border border-[#6B4423] rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <Truck size={18} className="text-[#C7A26A]" />
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#eddaba]/70 uppercase block">Total Frota</span>
              <span className="text-sm font-serif font-black text-white">{totalVeiculos}</span>
            </div>
          </div>
          <div className="bg-[#3A2414] border border-[#6B4423] rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <Check size={18} className="text-emerald-400" />
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#eddaba]/70 uppercase block">Em Dia</span>
              <span className="text-sm font-serif font-black text-emerald-400">{totalEmDia}</span>
            </div>
          </div>
          <div className="bg-[#3A2414] border border-[#6B4423] rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <ShieldAlert size={18} className="text-rose-400" />
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#eddaba]/70 uppercase block">Vencidos</span>
              <span className="text-sm font-serif font-black text-rose-400">{totalVencidos}</span>
            </div>
          </div>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeView === 'monitoring' && (
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7A26A]" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar placa cavalo..."
                className="w-full bg-[#3A2414] border border-[#6B4423] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#eddaba]/40 outline-none focus:border-[#B32025] font-mono uppercase shadow-inner"
              />
            </div>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl font-serif font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-[#ff4d4d]/30 shrink-0"
          >
            <Plus size={16} />
            <span>Novo Registro</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-serif font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              title="Apagar todos"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
        {activeView === 'generator' ? (
          <WoodenPlaque className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-5 bg-[#3A2414] border-2 border-[#6B4423] p-6 rounded-3xl shadow-inner text-[#eddaba]">
              <h3 className="text-xs font-bold font-serif uppercase tracking-widest border-b border-[#6B4423] pb-3 flex items-center gap-2 text-[#fdf8f0]">
                <Sparkles size={16} className="text-[#C7A26A]" />
                Configurar Solicitação de Checklist
              </h3>
              
              <div className="space-y-4 font-serif">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block tracking-wider text-[#eddaba]">Saudação</label>
                  <select
                    value={genData.greeting}
                    onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                    className="w-full bg-[#21120B] border border-[#6B4423] rounded-xl px-4 py-3 text-sm text-white focus:border-[#B32025] outline-none cursor-pointer font-serif"
                  >
                    <option value="Bom dia">Bom dia</option>
                    <option value="Boa tarde">Boa tarde</option>
                    <option value="Boa noite">Boa noite</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block tracking-wider text-[#eddaba]">Veículo (Cavalo)</label>
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
                    className="w-full bg-[#21120B] border border-[#6B4423] rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-[#B32025] outline-none cursor-pointer uppercase font-mono"
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
                  <label className="text-[10px] font-black uppercase mb-1.5 block tracking-wider text-[#eddaba]">Carretas Relacionadas</label>
                  <input
                    type="text"
                    value={genData.carretas}
                    onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="EX: PNE7353 / PNE7433"
                    className="w-full bg-[#21120B] border border-[#6B4423] rounded-xl px-4 py-3 text-sm text-white focus:border-[#B32025] outline-none uppercase font-mono placeholder-[#eddaba]/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block tracking-wider text-[#eddaba]">Celular Contato</label>
                  <input
                    type="text"
                    value={genData.contato}
                    onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                    className="w-full bg-[#21120B] border border-[#6B4423] rounded-xl px-4 py-3 text-sm text-white focus:border-[#B32025] outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={handleCopyGenerator}
                className={cn(
                  "w-full mt-6 py-3.5 rounded-xl text-xs font-serif font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all shadow-lg cursor-pointer",
                  genCopied 
                    ? "bg-green-600 text-white border-green-500 shadow-xl" 
                    : "bg-[#B32025] text-white border-[#ff4d4d]/40 hover:bg-[#8c060a]"
                )}
              >
                {genCopied ? <Check size={16} /> : <Copy size={16} />}
                {genCopied ? 'Solicitação Copiada!' : 'Copiar para WhatsApp'}
              </button>
            </div>

            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="w-full max-w-xl bg-white text-stone-900 p-8 rounded-3xl border-4 border-[#311f14] shadow-2xl relative font-serif">
                <p className="mb-4 text-base font-medium">{genData.greeting},</p>
                <p className="mb-6 text-base">Solicito o <strong className="font-bold underline text-[#B32025]">checklist</strong> para os conjuntos abaixo:</p>
                
                <table className="w-full border-collapse border border-stone-300 text-center mb-6">
                  <thead>
                    <tr className="bg-stone-900 text-white text-xs uppercase font-serif">
                      <th className="p-3 border border-stone-300">VEÍCULO CAVALO</th>
                      <th className="p-3 border border-stone-300">CARRETAS DO CONJUNTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-stone-50 font-mono font-bold text-stone-900">
                      <td className="p-3.5 border border-stone-300 uppercase">{genData.cavalo || "—"}</td>
                      <td className="p-3.5 border border-stone-300 uppercase">{genData.carretas || "—"}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 text-stone-800 font-mono text-xs mb-8">
                  Canal de Atendimento: {genData.contato}
                </div>

                <div className="border-t border-stone-300 pt-6 flex justify-between items-end">
                  <p className="text-stone-600 text-xs">Atenciosamente,</p>
                  <div className="text-center mr-2">
                    <p className="italic text-2xl font-serif text-stone-900" style={{ fontFamily: 'Brush Script MT, cursive' }}>Jefferson Augusto</p>
                    <div className="w-32 h-[1px] bg-[#B32025] my-1 mx-auto"></div>
                    <p className="text-[9px] uppercase tracking-widest text-[#B32025] font-bold font-sans">Agente de Risco</p>
                  </div>
                </div>
              </div>
            </div>
          </WoodenPlaque>
        ) : (
          <div className="space-y-6">
            
            {/* FILTER & IMPORT PLAQUE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <WoodenPlaque className="lg:col-span-1">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#5c3c24] uppercase block mb-3 font-extrabold">Filtrar Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[11px] font-bold font-serif uppercase tracking-widest transition-all cursor-pointer text-center border shadow-sm",
                          filter === f 
                            ? "bg-[#B32025] text-white shadow-md border-[#ff4d4d]/40" 
                            : "bg-[#f4ede2] text-[#311f14] hover:bg-[#eddaba] border-[#d4bc96]"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-[#5c3c24] font-serif italic border-t border-[#d4bc96] pt-3 mt-4">
                  Mostrando <strong className="text-[#311f14]">{filteredItems.length}</strong> de {items.length} veículos.
                </div>
              </WoodenPlaque>

              <WoodenPlaque className="lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono tracking-widest text-[#5c3c24] uppercase font-extrabold flex items-center gap-1.5">
                    <FileSpreadsheet size={15} className="text-[#B32025]" />
                    Atualizar Checklist via Colagem (Planilha)
                  </label>
                  <span className="text-[9px] text-[#5c3c24]/70 font-mono">Cole sem cabeçalhos</span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Cole aqui as informações copiadas do Excel..."
                    className="w-full h-20 bg-white border border-[#d4bc96] rounded-2xl px-4 py-3 text-xs text-[#311f14] placeholder-stone-400 outline-none focus:border-[#B32025] resize-none font-mono shadow-inner"
                  />
                  <button 
                    onClick={handleImportData}
                    className="px-6 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-serif font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 shrink-0 flex flex-col items-center justify-center gap-1 cursor-pointer border border-emerald-500/40"
                  >
                    <RefreshCw size={16} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </WoodenPlaque>
            </div>

            {/* VEHICLES CARDS LIST */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const status = getStatus(item);
                  const parsedExpiry = safeParseDate(item.dataVencimento);
                  const diasParaVencer = parsedExpiry ? differenceInDays(parsedExpiry, new Date()) : 0;
                  const formattedVencimento = parsedExpiry ? format(parsedExpiry, 'dd/MM/yyyy') : (item.dataVencimento || '—');

                  return (
                    <WoodenPlaque key={item.id} className="p-6 transition-all duration-300 hover:scale-[1.01]">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 w-full lg:w-auto">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-[#5c3c24] uppercase mb-2 font-extrabold">PLACA CAVALO</span>
                            <LicensePlate plate={item.cavalo} type="cavalo" />
                          </div>

                          {item.carretas && (
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-mono tracking-[0.2em] text-[#5c3c24] uppercase mb-2 font-extrabold">CARRETAS DO CONJUNTO</span>
                              <div className="bg-white border-2 border-[#d4bc96] rounded-2xl px-5 py-3 shadow-inner flex items-center gap-3">
                                <Truck size={22} className="text-[#B32025]" />
                                <span className="font-mono font-black text-sm sm:text-base text-[#311f14] uppercase tracking-wider">{item.carretas}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center lg:items-start gap-3 flex-1 px-2 text-center lg:text-left">
                          <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-start">
                            {status.label === 'NEGATIVADO' ? (
                              <div className="px-4 py-1.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 font-serif font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                                <ShieldAlert size={14} />
                                <span>NEGATIVADO</span>
                              </div>
                            ) : status.label === 'REPROVADO' ? (
                              <div className="px-4 py-1.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 font-serif font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                                <ShieldAlert size={14} />
                                <span>REPROVADO</span>
                              </div>
                            ) : diasParaVencer < 0 || status.label === 'VENCIDO' ? (
                              <div className="px-4 py-1.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 font-serif font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                                <ShieldAlert size={14} />
                                <span>VENCIDO</span>
                              </div>
                            ) : status.label === 'A VENCER' ? (
                              <div className="px-4 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 font-serif font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                                <Clock size={14} />
                                <span>A VENCER</span>
                              </div>
                            ) : (
                              <div className="px-4 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 font-serif font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                <Check size={14} />
                                <span>APROVADO</span>
                              </div>
                            )}

                            {item.periferico && (
                              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#d4bc96] text-[#311f14] font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={12} /> {item.periferico}
                              </span>
                            )}

                            {item.manutencaoOs && (
                              <span className="px-3 py-1.5 rounded-xl bg-stone-200 border border-stone-300 text-stone-800 font-mono font-bold text-[10px]">
                                OS: {item.manutencaoOs}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-5 text-xs font-serif text-[#5c3c24] mt-1 flex-wrap justify-center lg:justify-start">
                            <div className="flex items-center gap-1.5">
                              <Clock size={15} className="text-[#B32025]" />
                              <span>Vencimento: <strong className="font-mono font-black text-sm text-[#311f14]">{formattedVencimento}</strong></span>
                            </div>
                            <span className={cn(
                              "font-mono font-bold text-xs",
                              diasParaVencer < 0 ? "text-rose-700" : diasParaVencer <= 3 ? "text-amber-700" : "text-emerald-700"
                            )}>
                              ({diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias restantes`})
                            </span>
                          </div>

                          {item.observacao && (
                            <p className="text-xs text-[#5c3c24] italic mt-1 max-w-lg">
                              "{item.observacao}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-[#d4bc96] pt-4 lg:pt-0 lg:pl-6 shrink-0">
                          <label className="px-4 py-2 bg-[#311f14] hover:bg-[#4a2e1f] text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5 transition-all">
                            {uploadingItemId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            <span>Anexar PDF</span>
                            <input 
                              type="file" 
                              accept="application/pdf" 
                              className="hidden" 
                              onChange={(e) => handlePdfUpload(e, item.id)}
                            />
                          </label>

                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl transition-all cursor-pointer border border-stone-300"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-all cursor-pointer border border-rose-300"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* PDF Attachments List */}
                      {item.pdfs && item.pdfs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#d4bc96] flex items-center gap-3 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#5c3c24] uppercase">PDFs Anexados:</span>
                          {item.pdfs.map(pdf => (
                            <div key={pdf.id} className="flex items-center gap-2 bg-white border border-[#d4bc96] px-3 py-1.5 rounded-xl shadow-xs">
                              <FileText size={13} className="text-[#B32025]" />
                              <span className="text-xs font-mono font-bold text-[#311f14] max-w-[150px] truncate">{pdf.name}</span>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'view')} 
                                className="text-blue-600 hover:underline text-[10px] font-bold uppercase ml-1 cursor-pointer"
                              >
                                Ver
                              </button>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'download')} 
                                className="text-emerald-700 hover:underline text-[10px] font-bold uppercase ml-1 cursor-pointer"
                              >
                                Baixar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </WoodenPlaque>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f8f1e5] border-4 border-[#311f14] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-base font-serif font-black uppercase text-[#311f14] mb-6 flex items-center justify-between border-b border-[#d4bc96] pb-3">
              <span>Editar Checklist: {editingItem.cavalo}</span>
              <button onClick={() => setEditingItem(null)} className="text-[#5c3c24] hover:text-[#311f14] cursor-pointer">
                <X size={20} />
              </button>
            </h3>

            <div className="space-y-4 font-serif text-sm">
              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono uppercase font-bold outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={editingItem.carretas}
                  onChange={(e) => setEditingItem({ ...editingItem, carretas: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono uppercase font-bold outline-none focus:border-[#B32025]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem({ ...editingItem, dataTeste: e.target.value })}
                    className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono outline-none focus:border-[#B32025]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                    className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono outline-none focus:border-[#B32025]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Status Manual</label>
                <select
                  value={editingItem.statusOverride || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, statusOverride: e.target.value as any || undefined })}
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] outline-none focus:border-[#B32025]"
                >
                  <option value="">Automático (Calculado pela Data)</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="NEGATIVADO">NEGATIVADO</option>
                  <option value="REPROVADO">REPROVADO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={editingItem.periferico || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, periferico: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] uppercase font-mono outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Observação</label>
                <textarea
                  value={editingItem.observacao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacao: e.target.value })}
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] outline-none focus:border-[#B32025] h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4bc96]">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 bg-stone-300 hover:bg-stone-400 text-stone-800 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2.5 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW REGISTRATION MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f8f1e5] border-4 border-[#311f14] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-base font-serif font-black uppercase text-[#311f14] mb-6 flex items-center justify-between border-b border-[#d4bc96] pb-3">
              <span>Novo Registro de Checklist</span>
              <button onClick={() => setIsAdding(false)} className="text-[#5c3c24] hover:text-[#311f14] cursor-pointer">
                <X size={20} />
              </button>
            </h3>

            <div className="space-y-4 font-serif text-sm">
              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="EX: POZ4431"
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono uppercase font-bold outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono uppercase font-bold outline-none focus:border-[#B32025]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono outline-none focus:border-[#B32025]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] font-mono outline-none focus:border-[#B32025]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={newItem.periferico}
                  onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value.toUpperCase() })}
                  placeholder="EX: TECLADO / SENSOR"
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] uppercase font-mono outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3c24] uppercase mb-1 block">Observação</label>
                <textarea
                  value={newItem.observacao}
                  onChange={(e) => setNewItem({ ...newItem, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full bg-white border border-[#d4bc96] rounded-xl px-4 py-2.5 text-[#311f14] outline-none focus:border-[#B32025] h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4bc96]">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 bg-stone-300 hover:bg-stone-400 text-stone-800 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="px-6 py-2.5 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer"
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
