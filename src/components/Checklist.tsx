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
import { format, differenceInDays, differenceInCalendarDays, startOfDay, parseISO, addDays } from 'date-fns';

export const formatPlateWithHyphen = (plateStr?: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase();
  // Formats plates like SAS2D02 -> SAS-2D02, POZ4431 -> POZ-4431
  // Handles multiple plates separated by slashes or spaces e.g. POG2095 / POF7735 -> POG-2095 / POF-7735
  return clean.replace(/\b([A-Z]{3})([0-9][A-Z0-9]{3})\b/g, '$1-$2');
};

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
  const cleanPlate = formatPlateWithHyphen(plate);
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
    greeting: 'Boa noite',
    cavalo: 'SAS2D02',
    carretas: 'POG2095 / POR5E42',
    contato: '(31) 98481-7047',
    templateStyle: 'card' as 'card' | 'simple'
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
        cavalo = formatPlateWithHyphen(cavalo);
        carretas = formatPlateWithHyphen(carretas);

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

        const isNegated = statusStr.includes('NEGATIVADO') || statusStr.includes('REPROVADO') || dataVencStr === 'REPROVADO';
        const resolvedStatus = isNegated ? (statusStr.includes('REPROVADO') ? 'REPROVADO' : 'NEGATIVADO') : undefined;

        const cleanCavalo = cavalo.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const existing = items.find(item => item.cavalo.replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanCavalo);

        if (existing) {
          updates[`checklist_veiculos/${existing.id}`] = {
            ...existing,
            cavalo,
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
    const unsubscribe = onValue(checklistRef, async (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val,
          cavalo: formatPlateWithHyphen(val.cavalo),
          carretas: formatPlateWithHyphen(val.carretas)
        }));
        setItems(list);
      } else {
        // Seed default fleet list if database is empty so plates remain fixed and persistent
        const initialSeed: Record<string, any> = {
          "v1": { id: "v1", cavalo: "POZ-4431", carretas: "", dataTeste: "2026-06-10", dataVencimento: "2026-08-09", manutencaoOs: "", periferico: "", observacao: "" },
          "v2": { id: "v2", cavalo: "POZ-3241", carretas: "", dataTeste: "2026-06-30", dataVencimento: "2026-08-29", manutencaoOs: "", periferico: "", observacao: "" },
          "v3": { id: "v3", cavalo: "SBK-5A52", carretas: "POG-2095 / POF-7735", dataTeste: "2026-07-09", dataVencimento: "2026-09-07", manutencaoOs: "", periferico: "", observacao: "" },
          "v4": { id: "v4", cavalo: "SBK-5C22", carretas: "POG-1245 / POG-0885", dataTeste: "2026-07-16", dataVencimento: "2026-09-14", manutencaoOs: "", periferico: "", observacao: "" },
          "v5": { id: "v5", cavalo: "TYQ-6F51", carretas: "PNE-7353 / PNE-7433", dataTeste: "2026-07-18", dataVencimento: "2026-09-16", manutencaoOs: "", periferico: "", observacao: "" },
          "v6": { id: "v6", cavalo: "SBK-5B52", carretas: "PNC-8303 / PNC-8953", dataTeste: "2026-07-29", dataVencimento: "2026-09-27", manutencaoOs: "", periferico: "", observacao: "" },
          "v7": { id: "v7", cavalo: "TYT-8A14", carretas: "QOX-3164 / QOX-3168", dataTeste: "2026-08-08", dataVencimento: "2026-10-07", manutencaoOs: "", periferico: "", observacao: "" },
          "v8": { id: "v8", cavalo: "SAR-8D82", carretas: "SBF-9G98 / TIC-0F85", dataTeste: "2026-08-09", dataVencimento: "2026-10-08", manutencaoOs: "", periferico: "", observacao: "" },
          "v9": { id: "v9", cavalo: "THX-5I51", carretas: "POG-0685 / POG-0545", dataTeste: "2026-08-10", dataVencimento: "2026-10-09", manutencaoOs: "", periferico: "", observacao: "" },
          "v10": { id: "v10", cavalo: "SBK-4J52", carretas: "SBG-0B88 / PZX-4633", dataTeste: "2026-08-10", dataVencimento: "2026-10-09", manutencaoOs: "900382", periferico: "", observacao: "" },
          "v11": { id: "v11", cavalo: "POD-0255", carretas: "SBJ-0E22 / SBJ-0C82", dataTeste: "2026-08-12", dataVencimento: "2026-10-11", manutencaoOs: "", periferico: "", observacao: "" },
          "v12": { id: "v12", cavalo: "PNY-2605", carretas: "POF-9075 / POF-8375", dataTeste: "2026-08-21", dataVencimento: "2026-10-20", manutencaoOs: "", periferico: "", observacao: "" },
          "v13": { id: "v13", cavalo: "UUF-7I05", carretas: "PNW-5562", dataTeste: "2026-08-21", dataVencimento: "2026-10-20", manutencaoOs: "", periferico: "", observacao: "" },
          "v14": { id: "v14", cavalo: "PNY-2215", carretas: "SBJ-0E22 / SBJ-0C82", dataTeste: "2026-08-28", dataVencimento: "2026-10-27", manutencaoOs: "", periferico: "", observacao: "" },
          "v15": { id: "v15", cavalo: "SBN-4J62", carretas: "PNC-8603 / PNC-8873", dataTeste: "2026-08-29", dataVencimento: "2026-10-28", manutencaoOs: "", periferico: "", observacao: "" },
          "v16": { id: "v16", cavalo: "POD-0345", carretas: "POF-8075 / POF-7875", dataTeste: "2026-08-31", dataVencimento: "2026-10-30", manutencaoOs: "", periferico: "", observacao: "" },
          "v17": { id: "v17", cavalo: "POD-0645", carretas: "MIN-8723 / TIC-0D95", dataTeste: "2026-09-04", dataVencimento: "2026-11-03", manutencaoOs: "", periferico: "", observacao: "" },
          "v18": { id: "v18", cavalo: "THX-8C51", carretas: "PNE-4812 / POG-0885", dataTeste: "2026-09-08", dataVencimento: "2026-11-07", manutencaoOs: "", periferico: "", observacao: "" },
          "v19": { id: "v19", cavalo: "SBK-4I42", carretas: "POF-9785 / POR-5E42", dataTeste: "2026-09-10", dataVencimento: "2026-11-09", manutencaoOs: "", periferico: "", observacao: "" },
          "v20": { id: "v20", cavalo: "SAS-2D02", carretas: "SBI-8C02 / SBJ-0A72", dataTeste: "2026-09-11", dataVencimento: "2026-11-10", manutencaoOs: "", periferico: "", observacao: "" }
        };
        await set(checklistRef, initialSeed);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!newItem.cavalo) return;
    const id = Date.now().toString();
    const formattedCavalo = formatPlateWithHyphen(newItem.cavalo);
    const formattedCarretas = formatPlateWithHyphen(newItem.carretas);
    try {
      await set(ref(rtdb, `checklist_veiculos/${id}`), {
        ...newItem,
        cavalo: formattedCavalo,
        carretas: formattedCarretas,
        id
      });
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
      const updatedData = {
        ...data,
        cavalo: formatPlateWithHyphen(data.cavalo),
        carretas: formatPlateWithHyphen(data.carretas)
      };
      await update(ref(rtdb, `checklist_veiculos/${id}`), updatedData);
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
    if (!dateStr || dateStr === 'REPROVADO' || dateStr === 'VENCIDO' || dateStr === '#VALUE!') return null;
    const trimmed = dateStr.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        if (dd && mm && yyyy) {
          return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
        }
      }
    }
    if (trimmed.includes('-')) {
      const parts = trimmed.split('T')[0].split('-');
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        if (yyyy && mm && dd) {
          return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
        }
      }
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const getStatus = (item: ChecklistItem) => {
    const today = startOfDay(new Date());
    const expiry = safeParseDate(item.dataVencimento);

    // If expiration date exists and has passed (diff < 0), ALWAYS return VENCIDO
    if (expiry) {
      const expStart = startOfDay(expiry);
      const diff = differenceInCalendarDays(expStart, today);
      if (diff < 0) {
        return { label: 'VENCIDO', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
      }
    }

    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
        return { label: item.statusOverride, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
      }
      if (item.statusOverride === 'APROVADO') {
        return { label: 'APROVADO', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      }
    }

    if (!expiry) {
      return { label: 'PENDENTE', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    }

    const expStart = startOfDay(expiry);
    const diff = differenceInCalendarDays(expStart, today);

    if (diff <= 3) {
      return { label: 'A VENCER', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    }

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
    let htmlContent = '';
    let textContent = '';

    if (genData.templateStyle === 'card') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 550px; background-color: #ffffff; border: 2px solid #23120a; border-radius: 16px; overflow: hidden; color: #23120a; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
          <div style="background-color: #23120a; color: #e5c687; text-align: center; padding: 8px 14px; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">
            EMPRESA TRÊS CORAÇÕES - COMUNICAÇÃO INTERNA
          </div>
          <div style="background: linear-gradient(135deg, #680a0d 0%, #a3181c 45%, #c89753 100%); padding: 18px 20px; text-align: center; border-bottom: 2px solid #c89753;">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background-color: #a3181c; border: 2px solid rgba(255,255,255,0.4); display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div style="display: inline-block; text-align: left; vertical-align: middle; margin-left: 8px;">
                <span style="font-size: 10px; font-weight: bold; color: #fff2d6; letter-spacing: 2px; display: block; text-transform: uppercase;">CAFÉ</span>
                <span style="font-size: 22px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Times New Roman', Georgia, serif;">TRÊS CORAÇÕES</span>
              </div>
            </div>
          </div>
          <div style="padding: 32px 36px; background-color: #ffffff;">
            <p style="margin: 0 0 18px 0; font-size: 15pt; font-weight: bold; color: #23120a;">${genData.greeting},</p>
            <p style="margin: 0 0 22px 0; font-size: 11pt; color: #23120a; font-weight: 500;">Solicito o checklist para os conjuntos abaixo:</p>
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 2px solid #23120a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #23120a; color: #ffffff;">
                  <th style="padding: 12px 16px; text-align: center; font-size: 11pt; font-weight: bold; border-right: 1px solid #4a2c1c; width: 50%; letter-spacing: 1px;">CAVALO</th>
                  <th style="padding: 12px 16px; text-align: center; font-size: 11pt; font-weight: bold; width: 50%; letter-spacing: 1px;">CARRETAS</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #faf4eb; color: #23120a;">
                  <td style="padding: 14px 16px; text-align: center; font-size: 12pt; font-weight: bold; font-family: monospace; border-right: 1px solid #d6c3aa;">${genData.cavalo || "—"}</td>
                  <td style="padding: 14px 16px; text-align: center; font-size: 12pt; font-weight: bold; font-family: monospace;">${genData.carretas || "—"}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin: 0; font-size: 12pt; text-align: center; color: #23120a;">
              <strong>Contatos:</strong> ${genData.contato}
            </p>
          </div>
          <div style="border-top: 2px solid #c89753; background-color: #23120a; height: 12px;"></div>
        </div>
      `;
      textContent = `${genData.greeting},\n\nSolicito o checklist para os conjuntos abaixo:\n\n*CAVALO*: ${genData.cavalo || "—"}\n*CARRETAS*: ${genData.carretas || "—"}\n\n*Contatos*: ${genData.contato}`;
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #000000; max-width: 500px;">
          <p style="font-family: Georgia, serif; font-size: 14pt; margin: 0 0 16px 0; font-weight: bold;">${genData.greeting},</p>
          <p style="font-size: 11pt; margin: 0 0 20px 0;">Solicito o <span style="color: #a3181c; font-weight: bold;">checklist</span> para os conjuntos abaixo:</p>
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #0b3b60; color: #ffffff;">
                <th style="padding: 8px 14px; text-align: center; font-size: 11pt; font-weight: bold; border: 1.5px solid #000000; width: 50%;">CAVALO</th>
                <th style="padding: 8px 14px; text-align: center; font-size: 11pt; font-weight: bold; border: 1.5px solid #000000; width: 50%;">CARRETAS</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #ffffff; color: #000000;">
                <td style="padding: 10px 14px; text-align: center; font-size: 12pt; font-weight: bold; font-family: monospace; border: 1.5px solid #000000;">${genData.cavalo || "—"}</td>
                <td style="padding: 10px 14px; text-align: center; font-size: 12pt; font-weight: bold; font-family: monospace; border: 1.5px solid #000000;">${genData.carretas || "—"}</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 11pt; margin: 0 0 20px 0;">
            <strong>Contatos:</strong> ${genData.contato}
          </p>
          <p style="font-family: Georgia, serif; font-size: 11pt; margin: 0;">Att,</p>
        </div>
      `;
      textContent = `${genData.greeting},\n\nSolicito o checklist para os conjuntos abaixo:\n\n*CAVALO*: ${genData.cavalo || "—"}\n*CARRETAS*: ${genData.carretas || "—"}\n\n*Contatos*: ${genData.contato}\n\nAtt,`;
    }

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
          <div className="w-10 h-10 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md border border-[#8c060a]">
            <ClipboardCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#2B180D] uppercase font-heading">
              Central de Checklist & Vistorias de Frota
            </h1>
            <p className="text-xs font-bold text-[#B32025] font-sans">
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
              "px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 font-sans",
              activeView === 'monitoring'
                ? "bg-[#B32025] text-white shadow-md"
                : "text-slate-600 hover:text-[#2B180D] hover:bg-white"
            )}
          >
            <ClipboardCheck size={16} />
            <span>Checklist</span>
          </button>
          <button
            onClick={() => setActiveView('os')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 font-sans",
              activeView === 'os'
                ? "bg-[#B32025] text-white shadow-md"
                : "text-slate-600 hover:text-[#2B180D] hover:bg-white"
            )}
          >
            <FileText size={16} />
            <span>O.S</span>
          </button>
          <button
            onClick={() => setActiveView('generator')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 font-sans",
              activeView === 'generator'
                ? "bg-[#B32025] text-white shadow-md"
                : "text-slate-600 hover:text-[#2B180D] hover:bg-white"
            )}
          >
            <Sparkles size={16} />
            <span>Solicitação</span>
          </button>
        </div>

        {/* Metrics Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-[#FAF8F5] border border-[#3A2414]/15 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <Truck size={16} className="text-[#B32025]" />
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block leading-tight font-sans">Total Frota</span>
              <span className="text-sm font-black text-[#2B180D] font-mono">{totalVeiculos}</span>
            </div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <Check size={16} className="text-emerald-600" />
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block leading-tight font-sans">Em Dia</span>
              <span className="text-sm font-black text-emerald-800 font-mono">{totalEmDia}</span>
            </div>
          </div>
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-rose-600" />
            <div>
              <span className="text-[10px] font-extrabold text-rose-700 uppercase block leading-tight font-sans">Vencidos</span>
              <span className="text-sm font-black text-rose-800 font-mono">{totalVencidos}</span>
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 font-mono uppercase transition-all font-bold"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 font-mono uppercase transition-all font-bold"
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
                    className="bg-[#FAF8F5] border border-[#3A2414]/20 hover:border-[#B32025] rounded-xl px-3 py-2 text-xs font-bold text-[#2B180D] uppercase outline-none focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 cursor-pointer font-mono shadow-2xs transition-all"
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
            className="px-4 py-2 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 font-sans"
          >
            <Plus size={16} />
            <span>Novo Registro</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-sans"
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
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2 text-[#2B180D] font-heading">
                <Sparkles size={18} className="text-[#B32025]" />
                Configurar Solicitação de Checklist
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold uppercase mb-1.5 block tracking-wider text-[#2B180D] font-sans">Modelo de Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenData(prev => ({ ...prev, templateStyle: 'card' }))}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border text-center transition-all cursor-pointer font-sans",
                        genData.templateStyle === 'card'
                          ? "bg-[#23120A] text-[#E5C687] border-[#23120A] shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      )}
                    >
                      Card (Imagem 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenData(prev => ({ ...prev, templateStyle: 'simple' }))}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border text-center transition-all cursor-pointer font-sans",
                        genData.templateStyle === 'simple'
                          ? "bg-[#0B3B60] text-white border-[#0B3B60] shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      )}
                    >
                      E-mail (Imagem 2)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase mb-1.5 block tracking-wider text-[#2B180D] font-sans">Saudação</label>
                  <select
                    value={genData.greeting}
                    onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 outline-none cursor-pointer font-medium"
                  >
                    <option value="Bom dia">Bom dia</option>
                    <option value="Boa tarde">Boa tarde</option>
                    <option value="Boa noite">Boa noite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase mb-1.5 block tracking-wider text-[#2B180D] font-sans">Veículo (Cavalo)</label>
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 outline-none cursor-pointer uppercase"
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
                  <label className="text-xs font-extrabold uppercase mb-1.5 block tracking-wider text-[#2B180D] font-sans">Carretas Relacionadas</label>
                  <input
                    type="text"
                    value={genData.carretas}
                    onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="EX: PNE7353 / PNE7433"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 outline-none uppercase font-mono placeholder-slate-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase mb-1.5 block tracking-wider text-[#2B180D] font-sans">Celular Contato</label>
                  <input
                    type="text"
                    value={genData.contato}
                    onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <button 
                onClick={handleCopyGenerator}
                className={cn(
                  "w-full mt-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer font-sans",
                  genCopied 
                    ? "bg-emerald-600 text-white" 
                    : "bg-[#B32025] text-white hover:bg-[#8c060a]"
                )}
              >
                {genCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{genCopied ? 'Solicitação Copiada!' : 'Copiar Solicitação'}</span>
              </button>
            </div>

            {/* Preview Document Card */}
            <div className="lg:col-span-2 flex items-center justify-center bg-slate-100 border border-slate-200 p-4 sm:p-8 rounded-2xl shadow-inner min-h-[480px]">
              {genData.templateStyle === 'card' ? (
                /* CARD TRÊS CORAÇÕES (IMAGEM 1) */
                <div className="w-full max-w-xl bg-white rounded-2xl border-2 border-[#23120A] shadow-2xl overflow-hidden text-[#23120A] font-sans">
                  
                  {/* Top header bar */}
                  <div className="bg-[#23120A] text-[#E5C687] text-center py-2 px-4 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase">
                    EMPRESA TRÊS CORAÇÕES - COMUNICAÇÃO INTERNA
                  </div>

                  {/* Banner Header with Logo */}
                  <div className="relative bg-gradient-to-r from-[#680A0D] via-[#A3181C] to-[#C89753] p-5 text-center border-b-2 border-[#C89753] flex items-center justify-center gap-3">
                    {/* Coffee Beans / Heart Emblem SVG */}
                    <div className="w-11 h-11 rounded-full bg-[#A3181C] border-2 border-white/40 flex items-center justify-center shadow-inner shrink-0 text-white">
                      <svg className="w-6 h-6 fill-white text-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-[11px] font-bold tracking-widest text-[#FFF2D6] uppercase">CAFÉ</span>
                      <span className="block text-2xl sm:text-3xl font-black tracking-tight text-white font-serif uppercase drop-shadow-xs">
                        TRÊS CORAÇÕES
                      </span>
                    </div>
                  </div>

                  {/* Document Body */}
                  <div className="p-7 sm:p-10 space-y-6 bg-white">
                    {/* Greeting */}
                    <p className="text-lg sm:text-xl font-bold text-[#23120A]">
                      {genData.greeting},
                    </p>

                    {/* Body Paragraph */}
                    <p className="text-base text-[#23120A] font-medium leading-relaxed">
                      Solicito o checklist para os conjuntos abaixo:
                    </p>
                    
                    {/* Styled Table matching attached Image 1 */}
                    <div className="border-2 border-[#23120A] rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="bg-[#23120A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
                            <th className="py-3 px-4 border-r border-[#4A2C1C] w-1/2">CAVALO</th>
                            <th className="py-3 px-4 w-1/2">CARRETAS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-[#FAF4EB] text-[#23120A] font-mono font-bold text-sm sm:text-base border-t border-[#23120A]">
                            <td className="py-3.5 px-4 border-r border-[#D6C3AA] uppercase">{genData.cavalo || "—"}</td>
                            <td className="py-3.5 px-4 uppercase">{genData.carretas || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Contact Line */}
                    <div className="text-center pt-2 pb-1">
                      <p className="text-base text-[#23120A]">
                        <strong className="font-extrabold">Contatos:</strong> {genData.contato}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Accent */}
                  <div className="border-t-2 border-[#C89753] bg-[#23120A] h-3.5 w-full"></div>

                </div>
              ) : (
                /* E-MAIL SIMPLES (IMAGEM 2) */
                <div className="w-full max-w-lg bg-white rounded-xl border border-slate-300 shadow-md p-8 text-slate-900 font-sans space-y-5">
                  <p className="text-lg font-serif font-bold text-slate-900">
                    {genData.greeting},
                  </p>
                  <p className="text-base text-slate-800 font-medium">
                    Solicito o <span className="text-[#A3181C] font-bold">checklist</span> para os conjuntos abaixo:
                  </p>
                  <div className="overflow-hidden border-2 border-slate-900">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-[#0B3B60] text-white text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 border-slate-900">
                          <th className="py-2.5 px-4 border-r-2 border-slate-900 w-1/2">CAVALO</th>
                          <th className="py-2.5 px-4 w-1/2">CARRETAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white text-slate-900 font-mono font-bold text-sm sm:text-base">
                          <td className="py-3 px-4 border-r-2 border-slate-900 uppercase">{genData.cavalo || "—"}</td>
                          <td className="py-3 px-4 uppercase">{genData.carretas || "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-base text-slate-900 pt-1">
                    <strong className="font-bold">Contatos:</strong> {genData.contato}
                  </p>
                  <p className="text-base font-serif text-slate-900 pt-2">
                    Att,
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeView === 'os' ? (
          /* ================= VIEW: ORDEM DE SERVIÇO (O.S) ================= */
          <div className="space-y-6 animate-fade-in">
            {/* Header and Filter Plaque */}
            <div className="w-full bg-white text-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md border border-[#8c060a]">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h2 className="text-base font-black uppercase tracking-wider text-[#2B180D] font-heading">
                    Controle de Ordens de Serviço (O.S)
                  </h2>
                  <p className="text-xs text-[#B32025] font-bold mt-0.5 font-sans">
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
                      "px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer font-sans",
                      osStatusFilter === st
                        ? "bg-[#B32025] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#2B180D] hover:bg-white"
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
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#B32025] flex items-center justify-center border border-[#3A2414]/15">
                  <Truck size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider font-sans">Total Frota</span>
                  <span className="text-base font-black text-[#2B180D] font-mono">{items.length}</span>
                </div>
              </div>
              <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                  <ShieldAlert size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase text-rose-700 tracking-wider font-sans">Pendente</span>
                  <span className="text-base font-black text-rose-700 font-mono">
                    {items.filter(item => (item.osStatus || 'PENDENTE') === 'PENDENTE').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <Activity size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase text-blue-700 tracking-wider font-sans">Agendado</span>
                  <span className="text-base font-black text-blue-700 font-mono">
                    {items.filter(item => item.osStatus === 'AGENDADO').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <Loader2 size={18} className="stroke-[2.5] animate-spin" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase text-amber-700 tracking-wider font-sans">Em Andamento</span>
                  <span className="text-base font-black text-amber-700 font-mono">
                    {items.filter(item => item.osStatus === 'EM ANDAMENTO').length}
                  </span>
                </div>
              </div>
              <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs flex items-center gap-3 text-left col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider font-sans">Concluído</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
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
                      <tr className="bg-[#2B180D] text-white text-xs uppercase font-extrabold tracking-wider h-11 border-b border-[#3A2414] font-heading">
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

                        const itemStatus = getStatus(item);
                        const isRowVencido = itemStatus.label === 'VENCIDO' || itemStatus.label === 'NEGATIVADO' || itemStatus.label === 'REPROVADO';

                        return (
                          <tr 
                            key={item.id} 
                            className={cn(
                              "text-xs transition-colors border-b h-16",
                              isRowVencido 
                                ? "bg-rose-50/95 hover:bg-rose-100/95 text-rose-950 border-rose-200 font-medium" 
                                : "text-slate-900 hover:bg-[#FAF8F5] border-slate-100"
                            )}
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
                                  <span className="text-[11px] font-mono text-[#2B180D] font-bold">
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
                                className="w-full bg-slate-50 border border-slate-300 hover:border-[#B32025] focus:border-[#B32025] focus:bg-white text-[#2B180D] font-bold rounded-lg py-2 px-3 text-center outline-none transition-all uppercase text-xs font-mono"
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
                                className="w-full bg-slate-50 border border-slate-300 hover:border-[#B32025] focus:border-[#B32025] focus:bg-white text-slate-900 font-bold rounded-lg py-2 px-3 text-center outline-none transition-all text-xs font-mono"
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
                                  className="p-2 bg-slate-100 hover:bg-[#FAF8F5] text-[#2B180D] rounded-lg border border-slate-200 transition-colors cursor-pointer"
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
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2B180D] block mb-3 font-sans">Filtrar por Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center border shadow-2xs font-sans",
                          filter === f 
                            ? "bg-[#B32025] text-white border-[#B32025] shadow-xs" 
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 mt-4 font-sans">
                  Mostrando <strong className="text-[#2B180D] font-black font-mono">{filteredItems.length}</strong> de {items.length} veículos.
                </div>
              </div>

              {/* Paste Importer Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#2B180D] flex items-center gap-1.5 font-sans">
                    <FileSpreadsheet size={16} className="text-[#B32025]" />
                    Atualizar Checklist via Colagem (Planilha)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Cole as colunas sem cabeçalho</span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Cole aqui as informações copiadas do Excel (Placa, Conjunto, Status, Data Teste, Data Vencimento)..."
                    className="w-full h-20 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#B32025] focus:ring-2 focus:ring-[#B32025]/15 resize-none font-mono transition-all font-medium"
                  />
                  <button 
                    onClick={handleImportData}
                    className="px-6 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 shrink-0 flex flex-col items-center justify-center gap-1 cursor-pointer font-sans"
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
                  const diasParaVencer = parsedExpiry ? differenceInCalendarDays(startOfDay(parsedExpiry), startOfDay(new Date())) : 0;
                  const formattedVencimento = parsedExpiry ? format(parsedExpiry, 'dd/MM/yyyy') : (item.dataVencimento || '—');
                  const isVencido = status.label === 'VENCIDO' || status.label === 'NEGATIVADO' || status.label === 'REPROVADO' || diasParaVencer < 0;

                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden border-2",
                        isVencido 
                          ? "bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20 shadow-md shadow-rose-100" 
                          : "bg-white border-slate-200 hover:border-[#B32025]/40"
                      )}
                    >
                      {isVencido && (
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-600 animate-pulse" />
                      )}

                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pl-1">
                        
                        {/* Plates Section */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 w-full lg:w-auto">
                          <div className="flex flex-col items-center lg:items-start">
                            <span className="text-[10px] font-extrabold text-[#2B180D] uppercase mb-1.5 tracking-wider font-sans">Placa Cavalo</span>
                            <LicensePlate plate={item.cavalo} type="cavalo" />
                          </div>

                          {item.carretas && (
                            <div className="flex flex-col items-center lg:items-start">
                              <span className="text-[10px] font-extrabold text-[#2B180D] uppercase mb-1.5 tracking-wider font-sans">Carretas do Conjunto</span>
                              <div className={cn(
                                "border rounded-xl px-4 py-2 flex items-center gap-2.5",
                                isVencido ? "bg-rose-100/70 border-rose-300" : "bg-[#FAF8F5] border-[#3A2414]/20"
                              )}>
                                <Truck size={18} className="text-[#B32025]" />
                                <span className="font-mono font-black text-sm text-[#2B180D] uppercase tracking-wide">{item.carretas}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details & Status Section */}
                        <div className="flex flex-col items-center lg:items-start gap-2.5 flex-1 px-2 text-center lg:text-left">
                          <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                            {status.label === 'NEGATIVADO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <ShieldAlert size={14} />
                                <span>NEGATIVADO</span>
                              </div>
                            ) : status.label === 'REPROVADO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <ShieldAlert size={14} />
                                <span>REPROVADO</span>
                              </div>
                            ) : diasParaVencer < 0 || status.label === 'VENCIDO' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <ShieldAlert size={14} />
                                <span>VENCIDO</span>
                              </div>
                            ) : status.label === 'A VENCER' ? (
                              <div className="px-3.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <Clock size={14} />
                                <span>A VENCER</span>
                              </div>
                            ) : (
                              <div className="px-3.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <Check size={14} />
                                <span>APROVADO</span>
                              </div>
                            )}

                            {item.periferico && (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={12} className="text-[#B32025]" /> {item.periferico}
                              </span>
                            )}

                            {item.manutencaoOs && (
                              <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#3A2414]/20 text-[#2B180D] font-mono font-bold text-[11px]">
                                OS: {item.manutencaoOs}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 mt-0.5 flex-wrap justify-center lg:justify-start font-sans">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-[#B32025]" />
                              <span>Vencimento: <strong className="font-mono font-bold text-[#2B180D]">{formattedVencimento}</strong></span>
                            </div>
                            <span className={cn(
                              "font-mono font-bold text-xs",
                              diasParaVencer < 0 ? "text-rose-700" : diasParaVencer <= 3 ? "text-amber-700" : "text-emerald-700"
                            )}>
                              ({diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias restantes`})
                            </span>
                          </div>

                          {item.observacao && (
                            <p className="text-xs text-slate-500 italic max-w-lg font-sans">
                              "{item.observacao}"
                            </p>
                          )}
                        </div>

                        {/* Actions Section */}
                        <div className="flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                          <label className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-slate-100 text-[#2B180D] border border-[#3A2414]/20 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all font-sans">
                            {uploadingItemId === item.id ? <Loader2 size={14} className="animate-spin text-[#B32025]" /> : <Upload size={14} className="text-[#B32025]" />}
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
                          <span className="text-[10px] font-extrabold text-[#2B180D] uppercase tracking-wider font-sans">PDFs Anexados:</span>
                          {item.pdfs.map(pdf => (
                            <div key={pdf.id} className="flex items-center gap-2 bg-[#FAF8F5] border border-[#3A2414]/15 px-3 py-1 rounded-lg shadow-2xs">
                              <FileText size={13} className="text-[#B32025]" />
                              <span className="text-xs font-mono font-bold text-[#2B180D] max-w-[150px] truncate">{pdf.name}</span>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'view')} 
                                className="text-[#B32025] hover:text-[#8c060a] text-[11px] font-extrabold uppercase ml-1 cursor-pointer font-sans"
                              >
                                Ver
                              </button>
                              <button 
                                onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'download')} 
                                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-extrabold uppercase ml-1 cursor-pointer font-sans"
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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 pt-24 sm:pt-20 pb-12 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative max-h-[78vh] flex flex-col transform scale-90 sm:scale-95 transition-transform my-auto">
            <h3 className="text-xs sm:text-sm font-black uppercase text-blue-950 mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <span className="truncate pr-2">EDITAR CHECKLIST: {editingItem.cavalo}</span>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 shrink-0">
                <X size={18} />
              </button>
            </h3>

            <div className="space-y-2.5 text-xs overflow-y-auto pr-1 flex-1 custom-scrollbar">
              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono uppercase font-bold text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={editingItem.carretas}
                  onChange={(e) => setEditingItem({ ...editingItem, carretas: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono uppercase font-bold text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Data Teste</label>
                  <input
                    type="date"
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem({ ...editingItem, dataTeste: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Status Manual</label>
                <select
                  value={editingItem.statusOverride || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, statusOverride: e.target.value as any || undefined })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-xs cursor-pointer"
                >
                  <option value="">Automático (Calculado pela Data)</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="NEGATIVADO">NEGATIVADO</option>
                  <option value="REPROVADO">REPROVADO</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Nº da O.S</label>
                  <input
                    type="text"
                    value={editingItem.manutencaoOs || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, manutencaoOs: e.target.value.toUpperCase() })}
                    placeholder="EX: 900382"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 uppercase font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Data Agendamento O.S</label>
                  <input
                    type="date"
                    value={editingItem.dataAgendamento || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataAgendamento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Status da O.S</label>
                  <select
                    value={editingItem.osStatus || 'PENDENTE'}
                    onChange={(e) => setEditingItem({ ...editingItem, osStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-xs cursor-pointer"
                  >
                    <option value="PENDENTE">🔴 PENDENTE</option>
                    <option value="AGENDADO">🔵 AGENDADO</option>
                    <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                    <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                    <option value="CANCELADO">⚫ CANCELADO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Checklist Realizado</label>
                  <select
                    value={editingItem.checklistRealizado || 'não'}
                    onChange={(e) => setEditingItem({ ...editingItem, checklistRealizado: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-xs cursor-pointer"
                  >
                    <option value="não">❌ NÃO</option>
                    <option value="sim">✔️ SIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Periférico</label>
                <input
                  type="text"
                  value={editingItem.periferico || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, periferico: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 uppercase font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Observação</label>
                <textarea
                  value={editingItem.observacao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacao: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 h-14 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase tracking-wider text-[11px] shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 pt-24 sm:pt-20 pb-12 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative max-h-[78vh] flex flex-col transform scale-90 sm:scale-95 transition-transform my-auto">
            <h3 className="text-xs sm:text-sm font-black uppercase text-blue-950 mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <span className="truncate pr-2">Novo Registro de Checklist</span>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 shrink-0">
                <X size={18} />
              </button>
            </h3>

            <div className="space-y-2.5 text-xs overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {/* Dropdown to pull existing plate from Checklist */}
              {sortedCavalos.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-xl space-y-1">
                  <label className="text-[10px] font-bold text-blue-950 uppercase flex items-center gap-1.5">
                    <Truck size={13} className="text-blue-600" />
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
                    className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs text-blue-950 font-mono font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 uppercase cursor-pointer"
                  >
                    <option value="">-- Selecione uma placa da aba Checklist --</option>
                    {sortedCavalos.map(item => (
                      <option key={item.id} value={item.cavalo}>
                        {item.cavalo} {item.carretas ? `(${item.carretas})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-blue-800 font-medium">
                    Preenche automaticamente a placa do cavalo e conjunto com os dados do Checklist.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="EX: POZ4431"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono uppercase font-bold text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono uppercase font-bold text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Periférico</label>
                <input
                  type="text"
                  value={newItem.periferico}
                  onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value.toUpperCase() })}
                  placeholder="EX: TECLADO / SENSOR"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 uppercase font-mono text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-blue-950 uppercase mb-0.5 block">Observação</label>
                <textarea
                  value={newItem.observacao}
                  onChange={(e) => setNewItem({ ...newItem, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 h-14 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase tracking-wider text-[11px] shadow-xs cursor-pointer"
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
