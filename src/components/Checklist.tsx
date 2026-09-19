import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Phone,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Clipboard,
  Mail,
  Building,
  User,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { format, differenceInCalendarDays, startOfDay, addDays } from 'date-fns';

// Parafuso decorativo de latão idêntico ao de Averbação / Escala
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

export const formatPlateWithHyphen = (plateStr?: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase();
  return clean.replace(/\b([A-Z]{3})([0-9][A-Z0-9]{3})\b/g, '$1-$2');
};

export const sanitizeForFirebase = <T extends Record<string, any>>(obj: T): T => {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeForFirebase(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
};

interface PdfFile {
  id: string;
  name: string;
  url: string;
}

export interface ChecklistItem {
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

// Componente oficial de exibição de placas mantendo 100% o formato original solicitado
export const LicensePlate: React.FC<{ plate: string; type?: 'cavalo' | 'carreta'; className?: string }> = ({ plate, type, className }) => {
  if (!plate || plate === '-' || plate.trim() === '') return <span className="text-stone-400 font-mono font-bold">-</span>;
  const cleanPlate = formatPlateWithHyphen(plate);
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[136px] h-[44px] shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-xs border",
      isCarreta ? "bg-amber-50 border-amber-300" : "bg-white border-slate-300",
      className
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
  const [activeView, setActiveView] = useState<'monitoring' | 'os' | 'generator'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [osSearchTerm, setOsSearchTerm] = useState('');
  const [osStatusFilter, setOsStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO'>('TODOS');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filter, setFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADOS'>('TODOS');
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  // Toast notifications
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'delete' | 'info';
  }>({ show: false, message: '' });

  const showToast = (message: string, type: 'success' | 'delete' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

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
    greeting: 'Boa noite,',
    requestText: 'Solicito o checklist para os conjuntos abaixo:',
    cavalo: 'SAS2D02',
    carretas: 'POG2095 / POR5E42',
    contato: '(31) 98481-7047',
    signature: 'Att,'
  });
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Safe parse dates
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

  // Sync Firebase RTDB
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
        const hasBeenCleared = localStorage.getItem('checklist_cleared_permanently') === 'true';
        const hasBeenSeeded = localStorage.getItem('checklist_seeded_v1') === 'true';

        if (!hasBeenCleared && !hasBeenSeeded) {
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
          localStorage.setItem('checklist_seeded_v1', 'true');
          await set(checklistRef, initialSeed);
        } else {
          setItems([]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImportData = async (textToImport: string) => {
    if (!textToImport.trim()) {
      showToast('Por favor, cole as informações da planilha antes de atualizar.', 'info');
      return;
    }

    const lines = textToImport.trim().split('\n');
    const updates: Record<string, any> = {};

    const parseDate = (d: string): string => {
      if (!d || d === 'REPROVADO' || d === 'VENCIDO' || d === '#VALUE!') {
        return format(new Date(), 'yyyy-MM-dd');
      }
      const cleanD = d.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanD)) return cleanD;
      if (cleanD.includes('/')) {
        const parts = cleanD.split('/');
        if (parts.length === 3) {
          const [p1, p2, p3] = parts;
          if (p3.length === 4) return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
          if (p1.length === 4) return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
        }
      }
      if (cleanD.includes('-')) {
        const parts = cleanD.split('-');
        if (parts.length === 3) {
          const [p1, p2, p3] = parts;
          if (p3.length === 4) return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
          if (p1.length === 4) return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
        }
      }
      return format(new Date(), 'yyyy-MM-dd');
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      } else if (line.includes(';')) {
        parts = line.split(';').map(p => p.trim()).filter(Boolean);
      } else if (line.includes(',') && !line.includes('/')) {
        parts = line.split(',').map(p => p.trim()).filter(Boolean);
      } else {
        parts = line.split(/\s+/).map(p => p.trim()).filter(Boolean);
      }

      let cavalo = '';
      let carretas = '';
      let statusStr = 'APROVADO';
      let dataTesteStr = '';
      let dataVencStr = '';

      const dateIndices = parts.reduce((acc, t, idx) => {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(t) || /^\d{4}-\d{2}-\d{2}$/.test(t)) {
          acc.push(idx);
        }
        return acc;
      }, [] as number[]);

      if (dateIndices.length >= 2) {
        const tIdx1 = dateIndices[0];
        const tIdx2 = dateIndices[1];
        cavalo = parts[0];
        dataTesteStr = parts[tIdx1];
        dataVencStr = parts[tIdx2];

        if (tIdx1 === 1) {
          carretas = '';
        } else if (tIdx1 === 2) {
          const mid = parts[1].toUpperCase();
          if (mid.includes('APROVADO') || mid.includes('VENCIDO') || mid.includes('REPROVADO') || mid.includes('NEGATIVADO')) {
            statusStr = mid;
          } else {
            carretas = parts[1];
          }
        } else if (tIdx1 >= 3) {
          const candidateStatus = parts[tIdx1 - 1].toUpperCase();
          if (candidateStatus.includes('APROVADO') || candidateStatus.includes('VENCIDO') || candidateStatus.includes('REPROVADO') || candidateStatus.includes('NEGATIVADO')) {
            statusStr = candidateStatus;
            carretas = parts.slice(1, tIdx1 - 1).join(' ');
          } else {
            carretas = parts.slice(1, tIdx1).join(' ');
          }
        }
      } else if (parts.length >= 5) {
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
      } else if (parts.length === 3) {
        cavalo = parts[0];
        dataTesteStr = parts[1];
        dataVencStr = parts[2];
      } else if (parts.length === 2) {
        cavalo = parts[0];
        carretas = parts[1];
      } else if (parts.length === 1) {
        cavalo = parts[0];
      }

      if (!cavalo) continue;

      const cleanCavaloCheck = cavalo.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (['CAVALO', 'PLACA', 'PLACACAVALO', 'VEICULO', 'STATUS'].includes(cleanCavaloCheck)) {
        continue;
      }

      cavalo = formatPlateWithHyphen(cavalo);
      carretas = formatPlateWithHyphen(carretas);

      const parsedTeste = parseDate(dataTesteStr);
      const parsedVenc = (dataVencStr === 'REPROVADO' || dataVencStr === 'VENCIDO' || dataVencStr === '#VALUE!') 
        ? format(addDays(new Date(), -1), 'yyyy-MM-dd') 
        : parseDate(dataVencStr);

      const isNegated = statusStr.includes('NEGATIVADO') || statusStr.includes('REPROVADO') || dataVencStr === 'REPROVADO';
      const resolvedStatus = isNegated ? (statusStr.includes('REPROVADO') ? 'REPROVADO' : 'NEGATIVADO') : null;

      const cleanCavalo = cavalo.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const existing = items.find(item => item.cavalo && item.cavalo.replace(/[^A-Z0-9]/gi, '').toUpperCase() === cleanCavalo);

      const targetId = existing?.id || (Date.now().toString() + Math.random().toString(36).substring(2, 6));

      const itemRecord: Record<string, any> = {
        id: targetId,
        cavalo,
        carretas: carretas || existing?.carretas || '',
        dataTeste: parsedTeste,
        dataVencimento: parsedVenc,
        manutencaoOs: existing?.manutencaoOs || '',
        periferico: existing?.periferico || '',
        observacao: existing?.observacao || '',
        dataAgendamento: existing?.dataAgendamento || '',
        osStatus: existing?.osStatus || 'PENDENTE',
        checklistRealizado: existing?.checklistRealizado || 'não'
      };

      if (existing?.pdfs && Array.isArray(existing.pdfs) && existing.pdfs.length > 0) {
        itemRecord.pdfs = existing.pdfs;
      }

      if (resolvedStatus) {
        itemRecord.statusOverride = resolvedStatus;
      } else if (existing && existing.statusOverride) {
        itemRecord.statusOverride = null;
      }

      updates[`checklist_veiculos/${targetId}`] = sanitizeForFirebase(itemRecord);
    }

    const updatesCount = Object.keys(updates).length;

    if (updatesCount > 0) {
      try {
        localStorage.removeItem('checklist_cleared_permanently');
        const sanitizedUpdates = sanitizeForFirebase(updates);
        await update(ref(rtdb), sanitizedUpdates);
        setPasteData('');
        setShowPasteModal(false);
        showToast(`Checklist atualizado com sucesso! ${updatesCount} veículo(s) salvo(s).`, 'success');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        showToast('Erro ao atualizar checklist.', 'delete');
      }
    } else {
      showToast('Nenhum dado válido encontrado para importação.', 'info');
    }
  };

  const handleAdd = async () => {
    if (!newItem.cavalo) {
      alert('Por favor, informe a placa do cavalo.');
      return;
    }
    const id = Date.now().toString();
    const formattedCavalo = formatPlateWithHyphen(newItem.cavalo);
    const formattedCarretas = formatPlateWithHyphen(newItem.carretas);
    try {
      localStorage.removeItem('checklist_cleared_permanently');
      const payload = sanitizeForFirebase({
        id,
        cavalo: formattedCavalo,
        carretas: formattedCarretas || '',
        dataTeste: newItem.dataTeste || format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: newItem.dataVencimento || format(addDays(new Date(), 60), 'yyyy-MM-dd'),
        manutencaoOs: newItem.manutencaoOs || '',
        periferico: newItem.periferico || '',
        observacao: newItem.observacao || '',
        dataAgendamento: newItem.dataAgendamento || '',
        osStatus: newItem.osStatus || 'PENDENTE',
        checklistRealizado: newItem.checklistRealizado || 'não',
        statusOverride: newItem.statusOverride || null
      });
      await set(ref(rtdb, `checklist_veiculos/${id}`), payload);
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
      showToast('Novo veículo cadastrado com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao adicionar checklist:", error);
      showToast("Erro ao adicionar veículo ao checklist.", 'delete');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem || !editingItem.cavalo) return;
    try {
      const { id, ...data } = editingItem;
      const updatedData = sanitizeForFirebase({
        ...data,
        cavalo: formatPlateWithHyphen(data.cavalo),
        carretas: formatPlateWithHyphen(data.carretas || ''),
        manutencaoOs: data.manutencaoOs || '',
        periferico: data.periferico || '',
        observacao: data.observacao || '',
        dataAgendamento: data.dataAgendamento || '',
        osStatus: data.osStatus || 'PENDENTE',
        checklistRealizado: data.checklistRealizado || 'não',
        statusOverride: data.statusOverride || null
      });
      await update(ref(rtdb, `checklist_veiculos/${id}`), updatedData);
      setEditingItem(null);
      showToast('Veículo atualizado com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao atualizar checklist:", error);
      showToast("Erro ao salvar alterações do veículo.", 'delete');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este checklist?")) return;
    try {
      await remove(ref(rtdb, `checklist_veiculos/${id}`));
      showToast("Registro excluído com sucesso!", 'delete');
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Tem certeza de que deseja apagar TODOS os registros do checklist?")) return;
    try {
      localStorage.setItem('checklist_cleared_permanently', 'true');
      await remove(ref(rtdb, 'checklist_veiculos'));
      setItems([]);
      showToast("Todos os registros foram limpos com sucesso!", 'delete');
    } catch (error) {
      console.error("Erro ao limpar:", error);
    }
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
            showToast("PDF anexado com sucesso!", 'success');
          }
        } catch (error) {
          console.error("Erro ao salvar PDF:", error);
          showToast("Erro ao fazer upload do arquivo.", 'delete');
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

  const getChecklistEmailHtml = (data: typeof genData) => {
    let requestFormatted = data.requestText;
    if (/checklist/i.test(requestFormatted)) {
      requestFormatted = requestFormatted.replace(/checklist/gi, '<span style="color: #D93030; font-weight: bold;">checklist</span>');
    }

    return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.4; background-color: #ffffff; text-align: left; margin: 0; padding: 0;">
  <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: #333333; margin: 0 0 16px 0; padding: 0;">${data.greeting}</p>
  <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; margin: 0 0 12px 0; padding: 0;">${requestFormatted}</p>
  <table style="width: 250px; border-collapse: collapse; border: 1px solid #000000; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px;" border="1" cellpadding="4" cellspacing="0">
    <thead>
      <tr style="background-color: #123B5D; color: #ffffff;">
        <th style="width: 103px; background-color: #123B5D; color: #ffffff; font-weight: bold; text-align: center; padding: 4px 6px; font-size: 12px; border: 1px solid #000000; font-family: Arial, Helvetica, sans-serif;">CAVALO</th>
        <th style="width: 147px; background-color: #123B5D; color: #ffffff; font-weight: bold; text-align: center; padding: 4px 6px; font-size: 12px; border: 1px solid #000000; font-family: Arial, Helvetica, sans-serif;">CARRETAS</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; color: #000000;">
        <td style="width: 103px; text-align: center; padding: 5px 6px; font-weight: bold; font-size: 12px; border: 1px solid #000000; font-family: Arial, Helvetica, sans-serif; color: #000000;">${data.cavalo || '&nbsp;'}</td>
        <td style="width: 147px; text-align: center; padding: 5px 6px; font-weight: bold; font-size: 12px; border: 1px solid #000000; font-family: Arial, Helvetica, sans-serif; color: #000000;">${data.carretas || '&nbsp;'}</td>
      </tr>
    </tbody>
  </table>
  <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; margin: 0 0 16px 0; padding: 0;">Contatos: <span style="color: #D93030;">${data.contato}</span></p>
  <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; margin: 0; padding: 0;">${data.signature}</p>
</div>`;
  };

  const getChecklistEmailText = (data: typeof genData) => {
    return `${data.greeting}\n\n${data.requestText}\n\nCAVALO: ${data.cavalo || "—"}\nCARRETAS: ${data.carretas || "—"}\n\nContatos: ${data.contato}\n\n${data.signature}`;
  };

  const handleCopyFormattedEmail = () => {
    const htmlContent = getChecklistEmailHtml(genData);
    const textContent = getChecklistEmailText(genData);

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([textContent], { type: typeText });
      const clipboardData = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      navigator.clipboard.write(clipboardData).then(() => {
        setCopiedEmail(true);
        showToast('E-mail formatado copiado! Basta colar no Outlook/Gmail.', 'success');
        setTimeout(() => setCopiedEmail(false), 2500);
      });
    } catch (err) {
      navigator.clipboard.writeText(textContent);
      setCopiedEmail(true);
      showToast('Texto do e-mail copiado!', 'success');
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleResetDefaultData = () => {
    setGenData({
      greeting: 'Boa noite,',
      requestText: 'Solicito o checklist para os conjuntos abaixo:',
      cavalo: 'SAS2D02',
      carretas: 'POG2095 / POR5E42',
      contato: '(31) 98481-7047',
      signature: 'Att,'
    });
    showToast('Campos restaurados com sucesso!', 'info');
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.carretas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.periferico && item.periferico.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.manutencaoOs && item.manutencaoOs.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
      const status = getStatus(item);
      if (filter === 'EM DIA') return status.label === 'APROVADO' || status.label === 'A VENCER';
      if (filter === 'VENCIDO') return status.label === 'VENCIDO';
      if (filter === 'NEGATIVADOS') return status.label === 'NEGATIVADO' || status.label === 'REPROVADO';
      return true;
    });
  }, [items, searchTerm, filter]);

  const sortedCavalos = useMemo(() => {
    return [...items].sort((a, b) => a.cavalo.localeCompare(b.cavalo));
  }, [items]);

  const totalVeiculos = items.length;
  const totalVencidos = items.filter(i => {
    const st = getStatus(i).label;
    return st === 'VENCIDO' || st === 'NEGATIVADO' || st === 'REPROVADO';
  }).length;
  const totalEmDia = totalVeiculos - totalVencidos;
  const totalOsPendentes = items.filter(i => (i.osStatus || 'PENDENTE') === 'PENDENTE').length;

  return (
    <div className="w-full flex flex-col min-h-screen relative p-1 sm:p-3 md:p-4 pb-16 font-sans">
      
      {/* Toast de Notificação idêntico ao de Averbação / Escala */}
      {notification.show && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all text-xs font-bold uppercase tracking-wider font-mono",
            notification.type === 'delete' 
              ? "bg-[#2b140d] text-rose-300 border-rose-800/80 shadow-rose-950/50" 
              : notification.type === 'info'
                ? "bg-[#2b140d] text-amber-300 border-amber-800/80 shadow-amber-950/50"
                : "bg-[#1f2e1b] text-emerald-300 border-emerald-800/80 shadow-emerald-950/50"
          )}
        >
          {notification.type === 'delete' ? (
            <Trash2 size={16} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Prancheta Master Vintage Wood Frame com Grampo de Latão e Estilo Averbação */}
      <div 
        className="w-full rounded-[2rem] p-3 sm:p-5 md:p-6 shadow-2xl border-4 border-[#311f14] relative flex flex-col gap-4 overflow-visible"
        style={{
          backgroundColor: '#402615',
          backgroundImage: 'linear-gradient(135deg, rgba(64, 38, 21, 0.95) 0%, rgba(38, 21, 10, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Grampo Metálico Superior da Prancheta */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 bg-gradient-to-b from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-t-xl border-2 border-[#2b170c] shadow-lg flex items-center justify-center z-30 pointer-events-none">
          <div className="w-32 sm:w-44 h-2 bg-[#2b170c]/70 rounded-full shadow-inner" />
        </div>

        {/* Painel Pergaminho Principal (Idêntico a Averbação) */}
        <div
          className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
          }}
        >
          {/* Borda interna decorativa */}
          <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />

          {/* Parafusos de latão nas quinas */}
          <Screw className="absolute top-3 left-3 z-20" />
          <Screw className="absolute top-3 right-3 z-20" />
          <Screw className="absolute bottom-3 left-3 z-20" />
          <Screw className="absolute bottom-3 right-3 z-20" />

          {/* Conteúdo Principal do Parchment */}
          <div className="p-4 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

            {/* Top Area: Splitted into Left (Emblem Badge) and Right (Banner + Header + Black Tag) */}
            <div className="flex flex-col md:flex-row gap-5 items-stretch">
              
              {/* Left Col: Emblem Card idêntico ao de Averbação */}
              <div className="w-28 h-28 md:w-[26%] md:min-w-[210px] md:max-w-[240px] md:h-auto rounded-2xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-gradient-to-b from-[#2a170d] to-[#150a04] flex flex-col items-center justify-center p-4 text-center">
                <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/30 pointer-events-none" />
                
                {/* Logo Emblem */}
                <div className="w-16 h-16 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg mb-2 group-hover:scale-105 transition-transform">
                  <ClipboardCheck size={28} className="text-[#D4AF37]" />
                  <div className="absolute inset-1 border border-dashed border-[#D4AF37]/50 rounded-full" />
                </div>

                <span className="text-[#e2cfb9] font-serif font-black text-xs uppercase tracking-widest leading-tight">
                  Checklist & Vistoria
                </span>
                <span className="text-[10px] text-[#D4AF37] font-mono font-bold mt-0.5 tracking-wider uppercase">
                  Central de Conformidade PGR
                </span>

                <div className="mt-3 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#f5ebd7] uppercase tracking-wider">
                  SISTEMA PGR • GESTÃO DE FROTA
                </div>
              </div>

              {/* Right Col: 4K Banner + Inspirational Quote + Title + Signature Black Passion Tag */}
              <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
                
                {/* 4K Aesthetic Banner idêntico ao de Averbação */}
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
                      GESTÃO DE MANUTENÇÃO & CHECKLIST
                    </span>
                    <span className="text-white text-[10px] font-semibold drop-shadow-md">
                      Santa Luzia / MG — Brasil
                    </span>
                  </div>
                </div>

                {/* Inspirational Quote */}
                <p className="w-full text-[#3d2415] font-serif italic text-xs sm:text-sm text-center leading-snug px-2">
                  "O checklist diário e o controle rigoroso de vistorias garantem a integridade da frota e a segurança de cada viagem na estrada."
                </p>

                {/* Bottom Row: Titles & Signature Black Passion Tag */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="pb-1">
                    <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                      Módulo Integrado de Vistoria e Manutenção
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                      CHECKLIST DE FROTA: <span className="text-[#B32025]">{totalVeiculos} VEÍCULOS / {totalEmDia} EM DIA</span>
                    </h1>
                  </div>

                  {/* Signature Black Tag: Feito com paixão */}
                  <div className="hidden lg:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-3 px-4.5 items-center justify-center gap-3.5 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative shrink-0">
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    
                    <div className="w-8 h-8 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                      <Coffee className="text-[#cfab84]" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-handwritten text-[#e5d5c1] text-base font-bold leading-none mb-0.5">Feito com paixão.</span>
                      <span className="font-handwritten text-[#e5d5c1]/70 text-[11px] font-medium leading-none">Para quem entrega.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Metrics Ribbon (Estilo Averbação Wood/Brass) */}
            <div className="bg-[#FAF6ED] border-2 border-[#d6be9c] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B32025] animate-pulse inline-block" />
                <span className="text-[11px] font-black text-[#3A2414] uppercase tracking-wider font-mono">
                  INDICADORES DA OPERAÇÃO:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-white border border-[#d6be9c] rounded-xl px-3 py-1.5 shadow-xs">
                  <Truck size={14} className="text-[#B32025]" />
                  <span className="text-[10px] font-bold text-[#5c3e29] uppercase">Frota Total:</span>
                  <code className="text-xs font-mono font-black text-[#3A2414] bg-stone-100 px-1.5 py-0.5 rounded">
                    {totalVeiculos}
                  </code>
                </div>

                <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl px-3 py-1.5 shadow-xs">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Em Dia:</span>
                  <code className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {totalEmDia}
                  </code>
                </div>

                <div className="flex items-center gap-2 bg-white border border-rose-300 rounded-xl px-3 py-1.5 shadow-xs">
                  <ShieldAlert size={14} className="text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Vencidos:</span>
                  <code className="text-xs font-mono font-black text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    {totalVencidos}
                  </code>
                </div>

                <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-xl px-3 py-1.5 shadow-xs">
                  <Activity size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-800 uppercase">O.S Pendentes:</span>
                  <code className="text-xs font-mono font-black text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {totalOsPendentes}
                  </code>
                </div>
              </div>
            </div>

            {/* Sub-Aba Navigation idêntica à Averbação */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#5c3e29]/20 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('monitoring')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                    activeView === 'monitoring'
                      ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border border-[#5c3e29] shadow-md scale-102"
                      : "bg-[#FAF6ED] text-[#5c3e29] border border-[#d6be9c] hover:bg-white"
                  )}
                >
                  <ClipboardCheck size={15} />
                  <span>1. Prancheta de Checklist</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#B32025] text-white text-[10px] font-mono font-bold">
                    {totalVeiculos}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('os')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                    activeView === 'os'
                      ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border border-[#5c3e29] shadow-md scale-102"
                      : "bg-[#FAF6ED] text-[#5c3e29] border border-[#d6be9c] hover:bg-white"
                  )}
                >
                  <FileText size={15} />
                  <span>2. Ordens de Serviço (O.S)</span>
                  {totalOsPendentes > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-700 text-white text-[10px] font-mono font-bold">
                      {totalOsPendentes}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('generator')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                    activeView === 'generator'
                      ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border border-[#5c3e29] shadow-md scale-102"
                      : "bg-[#FAF6ED] text-[#5c3e29] border border-[#d6be9c] hover:bg-white"
                  )}
                >
                  <Mail size={15} />
                  <span>3. Solicitação de Checklist</span>
                </button>
              </div>

              {/* Botões de Ação Principais */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20"
                >
                  <Clipboard size={15} className="stroke-[2.5]" />
                  <span>Colar Planilha TSV / Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="bg-[#FAF6ED] hover:bg-white text-[#5c3e29] border border-[#d6be9c] text-xs font-black uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                >
                  <Plus size={15} className="text-[#B32025]" />
                  <span>Novo Registro</span>
                </button>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="bg-[#FAF6ED] hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                    title="Limpar todos os registros"
                  >
                    <Trash2 size={14} />
                    <span>Limpar</span>
                  </button>
                )}
              </div>
            </div>

            {/* ================= ABA 1: PRANCHETA DE CHECKLIST / MONITORAMENTO ================= */}
            {activeView === 'monitoring' && (
              <div className="flex flex-col gap-4">
                
                {/* Search / Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF6ED] p-3 rounded-2xl border border-[#d6be9c]">
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar por Placa do Cavalo, Carretas, Periférico ou O.S..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-xs font-bold text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] shadow-inner uppercase font-mono"
                    />
                  </div>

                  {/* Status filter pills */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-2xs",
                          filter === f
                            ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border-[#5c3e29]"
                            : "bg-white text-[#5c3e29] border-[#d6be9c] hover:bg-[#FAF6ED]"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-[#5c3e29] uppercase tracking-widest block">
                      EXIBINDO VEÍCULOS
                    </span>
                    <span className="text-xs font-black font-mono text-[#B32025]">
                      {filteredItems.length} de {items.length}
                    </span>
                  </div>
                </div>

                {/* Tabela Oficial de Checklist Idêntica à de Averbação */}
                <div className="rounded-2xl border-2 border-[#5c3e29] overflow-hidden shadow-lg bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#2a170d] via-[#3a200a] to-[#1a0c04] text-white">
                          <th className="py-3 px-3 w-10 text-center font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            #
                          </th>
                          <th className="py-3 px-3.5 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Placa Cavalo
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Conjunto / Carretas
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                            Status
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                            Data Teste
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                            Validade
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                            Periférico / O.S
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                            PDFs
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-right pr-4">
                            Ações
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#ebd9c1]">
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-14 text-center text-stone-400 font-medium">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <FileSpreadsheet size={40} className="text-[#d6be9c]" />
                                <p className="font-bold text-[#3A2414] text-sm">
                                  Nenhum registro de checklist encontrado
                                </p>
                                <p className="text-xs text-[#7a5b44] max-w-md">
                                  Clique em <strong>"Colar Planilha TSV / Excel"</strong> acima para importar seus dados ou em <strong>"Novo Registro"</strong> para cadastrar manualmente.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map((item, index) => {
                            const status = getStatus(item);
                            const parsedExpiry = safeParseDate(item.dataVencimento);
                            const diasParaVencer = parsedExpiry ? differenceInCalendarDays(startOfDay(parsedExpiry), startOfDay(new Date())) : 0;
                            const formattedVencimento = parsedExpiry ? format(parsedExpiry, 'dd/MM/yyyy') : (item.dataVencimento || '—');
                            const formattedTeste = item.dataTeste ? (safeParseDate(item.dataTeste) ? format(safeParseDate(item.dataTeste)!, 'dd/MM/yyyy') : item.dataTeste) : '—';
                            const isVencido = status.label === 'VENCIDO' || status.label === 'NEGATIVADO' || status.label === 'REPROVADO' || diasParaVencer < 0;
                            const isAVencer = !isVencido && (status.label === 'A VENCER' || (diasParaVencer >= 0 && diasParaVencer <= 3));

                            return (
                              <tr
                                key={item.id}
                                className={cn(
                                  "transition-colors group",
                                  isVencido 
                                    ? "bg-rose-50/90 hover:bg-rose-100/90" 
                                    : isAVencer 
                                    ? "bg-amber-50/90 hover:bg-amber-100/90" 
                                    : index % 2 === 0 ? "bg-white hover:bg-[#FAF6ED]" : "bg-[#FAF6ED]/60 hover:bg-[#FAF6ED]"
                                )}
                              >
                                {/* Index */}
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-stone-400">
                                  {index + 1}
                                </td>

                                {/* Placa Cavalo (Formato Oficial Mercosul Mantido 100%) */}
                                <td className="py-2 px-3.5 align-middle">
                                  <LicensePlate plate={item.cavalo} type="cavalo" />
                                </td>

                                {/* Placas Carretas */}
                                <td className="py-2.5 px-3">
                                  {item.carretas ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-[#f0e2cf] text-[#4a301e] px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border border-[#d6be9c]/60 shadow-xs">
                                        {item.carretas}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-stone-300 italic text-[11px]">Sem carreta</span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 text-center">
                                  {status.label === 'NEGATIVADO' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> NEGATIVADO
                                    </span>
                                  ) : status.label === 'REPROVADO' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> REPROVADO
                                    </span>
                                  ) : isVencido ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> VENCIDO
                                    </span>
                                  ) : isAVencer ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
                                      <Clock size={12} /> A VENCER
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] uppercase tracking-wider">
                                      <Check size={12} /> APROVADO
                                    </span>
                                  )}
                                </td>

                                {/* Data Teste */}
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-[#5c3e29]">
                                  {formattedTeste}
                                </td>

                                {/* Validade e dias restantes */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-mono font-bold text-xs text-[#3A2414]">
                                      {formattedVencimento}
                                    </span>
                                    <span className={cn(
                                      "font-mono font-bold text-[10px]",
                                      diasParaVencer < 0 ? "text-rose-700" : diasParaVencer <= 3 ? "text-amber-700" : "text-emerald-700"
                                    )}>
                                      {diasParaVencer < 0 ? `${Math.abs(diasParaVencer)}d vencido` : `${diasParaVencer}d restantes`}
                                    </span>
                                  </div>
                                </td>

                                {/* Periférico / O.S */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    {item.periferico && (
                                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-slate-300">
                                        {item.periferico}
                                      </span>
                                    )}
                                    {item.manutencaoOs && (
                                      <span className="bg-[#FAF8F5] text-[#B32025] px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#3A2414]/20">
                                        OS: {item.manutencaoOs}
                                      </span>
                                    )}
                                    {!item.periferico && !item.manutencaoOs && (
                                      <span className="text-stone-300 text-xs">-</span>
                                    )}
                                  </div>
                                </td>

                                {/* PDFs Anexados */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <label className="text-[10px] font-bold text-[#B32025] hover:underline cursor-pointer flex items-center gap-1 font-mono">
                                      {uploadingItemId === item.id ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                      <span>Anexar</span>
                                      <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        className="hidden" 
                                        onChange={(e) => handlePdfUpload(e, item.id)}
                                      />
                                    </label>
                                    {item.pdfs && item.pdfs.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        {item.pdfs.map(p => (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={(e) => handlePdfAction(e, p.url, p.name, 'view')}
                                            className="p-1 bg-red-50 text-[#B32025] rounded border border-red-200 text-[9px] font-bold hover:bg-red-100 cursor-pointer"
                                            title={`Ver PDF: ${p.name}`}
                                          >
                                            <FileText size={12} />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Ações */}
                                <td className="py-2.5 px-3 text-right pr-4">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingItem(item)}
                                      className="p-1.5 text-stone-500 hover:text-[#3A2414] hover:bg-[#ebd9c1] rounded-lg transition-colors cursor-pointer"
                                      title="Editar"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item.id)}
                                      className="p-1.5 text-stone-400 hover:text-[#B32025] hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ================= ABA 2: ORDENS DE SERVIÇO (O.S) ================= */}
            {activeView === 'os' && (
              <div className="flex flex-col gap-4">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FAF6ED] p-3 rounded-2xl border border-[#d6be9c]">
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={osSearchTerm}
                        onChange={(e) => setOsSearchTerm(e.target.value)}
                        placeholder="Buscar placa ou Nº da O.S..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-xs font-bold text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] shadow-inner uppercase font-mono"
                      />
                    </div>

                    {sortedCavalos.length > 0 && (
                      <select
                        value={sortedCavalos.some(i => i.cavalo === osSearchTerm) ? osSearchTerm : ''}
                        onChange={(e) => setOsSearchTerm(e.target.value)}
                        className="bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-xs font-bold text-[#3A2414] uppercase outline-none focus:border-[#B32025] cursor-pointer font-mono shadow-xs"
                      >
                        <option value="">-- Puxar Placa do Checklist --</option>
                        {sortedCavalos.map(item => (
                          <option key={item.id} value={item.cavalo}>
                            {item.cavalo} {item.carretas ? `(${item.carretas})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Status Filters */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['TODOS', 'PENDENTE', 'AGENDADO', 'EM ANDAMENTO', 'CONCLUÍDO', 'CANCELADO'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOsStatusFilter(st)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-2xs",
                          osStatusFilter === st
                            ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border-[#5c3e29]"
                            : "bg-white text-[#5c3e29] border-[#d6be9c] hover:bg-[#FAF6ED]"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabela de Ordens de Serviço */}
                <div className="rounded-2xl border-2 border-[#5c3e29] overflow-hidden shadow-lg bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#2a170d] via-[#3a200a] to-[#1a0c04] text-white">
                          <th className="py-3 px-3 w-10 text-center font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">#</th>
                          <th className="py-3 px-3.5 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">Placa do Cavalo</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">Número da O.S</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">Data Agendamento</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">Dias Restantes</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">Status da O.S</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">Checklist Feito</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-right pr-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ebd9c1]">
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
                          let daysRemainingText = 'Sem agendamento';
                          let daysRemainingStyle = 'bg-stone-100 text-stone-600 border-stone-300';
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
                                daysRemainingStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
                              } else if (diffDays === 0) {
                                daysRemainingText = 'Hoje';
                                daysRemainingStyle = 'bg-amber-50 text-amber-700 border-amber-300 font-bold animate-pulse';
                              } else {
                                const absDays = Math.abs(diffDays);
                                daysRemainingText = `Atrasado ${absDays} dia${absDays > 1 ? 's' : ''}`;
                                daysRemainingStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
                              }
                            } catch (e) {
                              daysRemainingText = 'Data inválida';
                              daysRemainingStyle = 'bg-rose-50 text-rose-700 border-rose-300';
                            }
                          }

                          return (
                            <tr key={item.id} className={cn("transition-colors", i % 2 === 0 ? "bg-white hover:bg-[#FAF6ED]" : "bg-[#FAF6ED]/60 hover:bg-[#FAF6ED]")}>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-stone-400">{i + 1}</td>
                              <td className="py-2 px-3.5 align-middle">
                                <div className="flex flex-col gap-1">
                                  <LicensePlate plate={item.cavalo} type="cavalo" />
                                  {item.carretas && (
                                    <span className="text-[10px] font-mono text-[#5c3e29] font-bold">
                                      Conjunto: {item.carretas}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input 
                                  type="text"
                                  defaultValue={item.manutencaoOs || ''}
                                  onBlur={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    update(ref(rtdb, `checklist_veiculos/${item.id}`), { manutencaoOs: val });
                                  }}
                                  placeholder="Nº DA O.S"
                                  className="w-32 bg-white border border-[#d6be9c] text-[#3A2414] font-bold rounded-lg py-1.5 px-2.5 text-center text-xs font-mono uppercase focus:outline-none focus:border-[#B32025]"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input 
                                  type="date"
                                  value={item.dataAgendamento || ''}
                                  onChange={(e) => {
                                    update(ref(rtdb, `checklist_veiculos/${item.id}`), { dataAgendamento: e.target.value });
                                  }}
                                  className="w-36 bg-white border border-[#d6be9c] text-[#3A2414] font-bold rounded-lg py-1.5 px-2 text-center text-xs font-mono focus:outline-none focus:border-[#B32025]"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={cn("inline-block px-2.5 py-1 rounded-lg text-[10px] uppercase border font-mono font-bold", daysRemainingStyle)}>
                                  {daysRemainingText}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <select
                                  value={item.osStatus || 'PENDENTE'}
                                  onChange={(e) => {
                                    update(ref(rtdb, `checklist_veiculos/${item.id}`), { osStatus: e.target.value });
                                  }}
                                  className="bg-white border border-[#d6be9c] text-[#3A2414] rounded-lg py-1.5 px-2 text-xs font-bold focus:outline-none focus:border-[#B32025] cursor-pointer"
                                >
                                  <option value="PENDENTE">🔴 PENDENTE</option>
                                  <option value="AGENDADO">🔵 AGENDADO</option>
                                  <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                                  <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                                  <option value="CANCELADO">⚫ CANCELADO</option>
                                </select>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <select
                                  value={item.checklistRealizado || 'não'}
                                  onChange={(e) => {
                                    update(ref(rtdb, `checklist_veiculos/${item.id}`), { checklistRealizado: e.target.value });
                                  }}
                                  className={cn(
                                    "border rounded-lg py-1.5 px-2 text-xs font-bold cursor-pointer",
                                    (item.checklistRealizado || 'não') === 'sim'
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : "bg-rose-50 text-rose-800 border-rose-300"
                                  )}
                                >
                                  <option value="não">❌ NÃO</option>
                                  <option value="sim">✔️ SIM</option>
                                </select>
                              </td>
                              <td className="py-2.5 px-3 text-right pr-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingItem(item)}
                                    className="p-1.5 text-stone-500 hover:text-[#3A2414] hover:bg-[#ebd9c1] rounded-lg transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 text-stone-400 hover:text-[#B32025] hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ================= ABA 3: SOLICITAÇÃO DE CHECKLIST (TEMPLATE DE E-MAIL) ================= */}
            {activeView === 'generator' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Form: Controles e Edição */}
                <div className="lg:col-span-5 bg-[#FAF6ED] border-2 border-[#d6be9c] rounded-2xl p-5 shadow-md space-y-4">
                  <div className="border-b border-[#d6be9c] pb-3 flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#3A2414] uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Edit2 size={15} className="text-[#B32025]" />
                      <span>Edição dos Dados da Solicitação</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleResetDefaultData}
                      className="text-xs text-[#5c3e29] hover:text-[#B32025] flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RotateCcw size={12} />
                      <span>Restaurar</span>
                    </button>
                  </div>

                  {/* Preenchimento Rápido por Veículo da Frota */}
                  <div className="space-y-1.5 bg-white border border-[#d6be9c] rounded-xl p-3 shadow-xs">
                    <label className="text-xs font-bold text-[#5c3e29] flex items-center gap-1.5">
                      <Truck size={14} className="text-[#B32025]" />
                      <span>Preenchimento Rápido pela Frota:</span>
                    </label>
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
                      className="w-full bg-[#FAF6ED] border border-[#d6be9c] rounded-lg px-3 py-2 text-xs text-[#3A2414] font-mono font-bold uppercase focus:border-[#B32025] outline-none cursor-pointer"
                    >
                      <option value="">Selecione um cavalo...</option>
                      {sortedCavalos.map(item => (
                        <option key={item.id} value={item.cavalo}>
                          {item.cavalo} — {item.carretas || 'Sem carreta'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#5c3e29] mb-1">
                        1. Saudação:
                      </label>
                      <input
                        type="text"
                        value={genData.greeting}
                        onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                        className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-medium focus:border-[#B32025] outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#5c3e29] mb-1">
                        2. Frase de Solicitação:
                      </label>
                      <input
                        type="text"
                        value={genData.requestText}
                        onChange={(e) => setGenData(prev => ({ ...prev, requestText: e.target.value }))}
                        className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-medium focus:border-[#B32025] outline-none shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#5c3e29] mb-1">
                          3. CAVALO:
                        </label>
                        <input
                          type="text"
                          value={genData.cavalo}
                          onChange={(e) => setGenData(prev => ({ ...prev, cavalo: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-mono font-bold uppercase focus:border-[#B32025] outline-none shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#5c3e29] mb-1">
                          4. CARRETAS:
                        </label>
                        <input
                          type="text"
                          value={genData.carretas}
                          onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-mono font-bold uppercase focus:border-[#B32025] outline-none shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#5c3e29] mb-1">
                        5. Telefone / Contato:
                      </label>
                      <input
                        type="text"
                        value={genData.contato}
                        onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                        className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-medium focus:border-[#B32025] outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#5c3e29] mb-1">
                        6. Assinatura:
                      </label>
                      <input
                        type="text"
                        value={genData.signature}
                        onChange={(e) => setGenData(prev => ({ ...prev, signature: e.target.value }))}
                        className="w-full bg-white border border-[#d6be9c] rounded-lg px-3 py-2 text-[#3A2414] font-medium focus:border-[#B32025] outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Copy Action */}
                  <div className="pt-2 border-t border-[#d6be9c]">
                    <button
                      type="button"
                      onClick={handleCopyFormattedEmail}
                      className="w-full bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-97 border border-white/20"
                    >
                      {copiedEmail ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                      <span>{copiedEmail ? 'E-mail Copiado!' : 'Copiar E-mail Formatado'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Prévia do E-mail */}
                <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-[#5c3e29] p-6 sm:p-8 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-black tracking-widest text-[#B32025] uppercase bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                          FORMATO OFICIAL OUTLOOK / GMAIL
                        </span>
                        <h3 className="font-serif font-black text-base text-[#3A2414] mt-1 uppercase">
                          Prévia do E-mail de Solicitação
                        </h3>
                      </div>
                      <span className="text-[11px] font-medium text-stone-500">100% idêntico ao copiado</span>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200 min-h-[300px]">
                      <div dangerouslySetInnerHTML={{ __html: getChecklistEmailHtml(genData) }} />
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal: Colar Dados da Planilha (TSV / Excel) */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF6ED] border-4 border-[#5c3e29] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#d6be9c] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md">
                <Clipboard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-[#3A2414] uppercase">
                  Colar Dados do Checklist (Planilha Excel / TSV)
                </h3>
                <p className="text-xs text-[#7a5b44]">
                  Cole as colunas copiadas da sua planilha (Placa, Carretas, Status, Data Teste, Validade).
                </p>
              </div>
            </div>

            <textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder={`Cole aqui as linhas copiadas do Excel...\nExemplo:\nSAS2D02\tPOG2095 / POR5E42\tAPROVADO\t11/09/2026\t10/11/2026`}
              className="w-full h-44 p-3.5 bg-white border-2 border-[#d6be9c] rounded-2xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-[#B32025] shadow-inner resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleImportData(pasteData)}
                className="px-6 py-2.5 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer active:scale-97"
              >
                Processar e Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Registro de Checklist */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF6ED] border-4 border-[#5c3e29] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#d6be9c] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-[#3A2414] uppercase">
                  Novo Registro de Checklist
                </h3>
                <p className="text-xs text-[#7a5b44]">
                  Cadastre um novo conjunto de cavalo e carretas na frota.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="EX: POZ4431"
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={newItem.periferico}
                  onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value.toUpperCase() })}
                  placeholder="EX: TECLADO / SENSOR"
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] uppercase font-mono text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Observação</label>
                <textarea
                  value={newItem.observacao}
                  onChange={(e) => setNewItem({ ...newItem, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] text-xs focus:outline-none focus:border-[#B32025] h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#d6be9c]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold uppercase text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-6 py-2 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white rounded-xl font-black uppercase text-xs shadow-md cursor-pointer active:scale-97"
                >
                  Salvar Veículo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Registro */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF6ED] border-4 border-[#5c3e29] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#d6be9c] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md">
                <Edit2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-[#3A2414] uppercase">
                  Editar Checklist: {editingItem.cavalo}
                </h3>
                <p className="text-xs text-[#7a5b44]">
                  Atualize os dados e datas de vistoria do veículo.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={editingItem.carretas}
                  onChange={(e) => setEditingItem({ ...editingItem, carretas: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem({ ...editingItem, dataTeste: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Status Manual</label>
                <select
                  value={editingItem.statusOverride || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, statusOverride: (e.target.value as any) || null })}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] outline-none focus:border-[#B32025] font-medium text-xs cursor-pointer"
                >
                  <option value="">Automático (Calculado pela Data)</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="NEGATIVADO">NEGATIVADO</option>
                  <option value="REPROVADO">REPROVADO</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Nº da O.S</label>
                  <input
                    type="text"
                    value={editingItem.manutencaoOs || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, manutencaoOs: e.target.value.toUpperCase() })}
                    placeholder="EX: 900382"
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] uppercase font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Data Agendamento O.S</label>
                  <input
                    type="date"
                    value={editingItem.dataAgendamento || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataAgendamento: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] font-mono text-xs focus:outline-none focus:border-[#B32025]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Status da O.S</label>
                  <select
                    value={editingItem.osStatus || 'PENDENTE'}
                    onChange={(e) => setEditingItem({ ...editingItem, osStatus: e.target.value as any })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] outline-none focus:border-[#B32025] font-bold text-xs cursor-pointer"
                  >
                    <option value="PENDENTE">🔴 PENDENTE</option>
                    <option value="AGENDADO">🔵 AGENDADO</option>
                    <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                    <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                    <option value="CANCELADO">⚫ CANCELADO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Checklist Realizado</label>
                  <select
                    value={editingItem.checklistRealizado || 'não'}
                    onChange={(e) => setEditingItem({ ...editingItem, checklistRealizado: e.target.value as any })}
                    className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] outline-none focus:border-[#B32025] font-bold text-xs cursor-pointer"
                  >
                    <option value="não">❌ NÃO</option>
                    <option value="sim">✔️ SIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={editingItem.periferico || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, periferico: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] uppercase font-mono text-xs focus:outline-none focus:border-[#B32025]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5c3e29] uppercase mb-1 block">Observação</label>
                <textarea
                  value={editingItem.observacao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacao: e.target.value })}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl px-3 py-2 text-[#3A2414] text-xs focus:outline-none focus:border-[#B32025] h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#d6be9c]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold uppercase text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white rounded-xl font-black uppercase text-xs shadow-md cursor-pointer active:scale-97"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
