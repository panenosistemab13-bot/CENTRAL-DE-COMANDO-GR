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
import MasterModulePage, { MasterRecord } from './MasterModulePage';
import heroChecklist from '../assets/images/hero_cinematic_hub_1790214946110.jpg';
import cardChecklist from '../assets/images/card_cinematic_check_1790214967098.jpg';

// 3D Neon Status Sensor
function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-3.5 h-3.5 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
      <div className="w-[2px] h-full bg-gradient-to-b from-red-500 to-transparent" />
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

  const masterRecords: MasterRecord[] = useMemo(() => {
    return items.slice(0, 8).map(i => {
      const st = getStatus(i);
      const isConcluido = st.label === 'APROVADO';
      const isAtrasado = st.label === 'VENCIDO' || st.label === 'NEGATIVADO' || st.label === 'REPROVADO';
      return {
        id: i.id,
        itemImage: cardChecklist,
        itemTitle: `Cavalo ${i.cavalo}`,
        itemSubtitle: i.carretas ? `Carretas: ${i.carretas}` : 'Sem carreta vinculada',
        plate: i.cavalo,
        secondaryPlate: i.carretas || undefined,
        personName: i.periferico || 'Vistoria Geral',
        personRole: i.manutencaoOs ? `O.S: ${i.manutencaoOs}` : 'Conformidade PGR',
        categoryTag: st.label,
        progressValue: isConcluido ? 100 : isAtrasado ? 20 : 65,
        progressText: st.label,
        status: isConcluido ? 'concluido' : isAtrasado ? 'em_atraso' : 'pendente',
        statusLabel: st.label,
        timestamp: i.dataVencimento ? `Venc: ${i.dataVencimento}` : '—'
      };
    });
  }, [items]);

  return (
    <div className="w-full flex flex-col min-h-screen relative p-1 sm:p-3 md:p-4 pb-16 font-sans space-y-6" style={{ zoom: '0.75' }}>
      
      {/* 1. MASTER MODULE BANNER (Matching Home/Dashboard Master Design System) */}
      <MasterModulePage
        moduleKey="checklist"
        titleKicker="// CONFORMIDADE & SEGURANÇA VEICULAR"
        headline="Checklist Operacional & Vistoria Preventiva"
        subtext="Supervisão contínua de periféricos, testes de telemetria, sensores de porta e ordens de serviço."
        heroImage={heroChecklist}
        primaryCtaLabel="+ Novo Checklist"
        onPrimaryCta={() => setIsAdding(true)}
        metrics={{
          total: totalVeiculos,
          completed: totalEmDia,
          pending: totalOsPendentes,
          delayed: totalVencidos
        }}
        donutData={{
          score: totalVeiculos > 0 ? Math.round((totalEmDia / totalVeiculos) * 100) : 100,
          scoreLabel: "Conformidade",
          legend: {
            completed: totalEmDia,
            pending: totalOsPendentes,
            delayed: totalVencidos,
            total: totalVeiculos
          }
        }}
        records={masterRecords}
        onViewRecord={(record) => {
          const item = items.find(it => it.id === record.id);
          if (item) setEditingItem(item);
        }}
      />

      {/* Toast de Notificação */}
      {notification.show && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border transition-all text-xs font-bold uppercase tracking-wider font-mono",
            notification.type === 'delete' 
              ? "bg-red-50 text-red-800 border-red-200" 
              : notification.type === 'info'
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
          )}
        >
          {notification.type === 'delete' ? (
            <Trash2 size={16} className="text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Painel Operacional Principal (Estilo Executivo Master: Branco/Marfim, Bordas Finas, Tipografia Grafite) */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-7 relative flex flex-col gap-6 border border-[#d6ccbe] shadow-sm text-stone-900">
        
        {/* Top Area: Resumo e Indicadores em Tempo Real */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-widest bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                VISTORIAS PREVENTIVAS & SEGURANÇA NA ESTRADA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
              Console de Vistorias: <span className="text-[#9b1526]">{totalVeiculos} Veículos</span> / <span className="text-emerald-700">{totalEmDia} em dia</span>
            </h2>
            <p className="text-stone-500 text-xs leading-relaxed max-w-2xl font-sans">
              Monitoramento detalhado de periféricos, testes telemáticos, datas de vencimento e solicitações formais de checklist.
            </p>
          </div>

          {/* Quick Metrics Ribbon (Light Executive Chips) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Truck size={14} className="text-[#9b1526]" />
              <span className="text-[10px] font-bold text-stone-500 uppercase font-mono">Frota:</span>
              <span className="text-xs font-mono font-black text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                {totalVeiculos}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Em Dia:</span>
              <span className="text-xs font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {totalEmDia}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 shadow-xs">
              <ShieldAlert size={14} className="text-red-700" />
              <span className="text-[10px] font-bold text-red-800 uppercase font-mono">Vencidos:</span>
              <span className="text-xs font-mono font-black text-red-900 bg-white px-2 py-0.5 rounded border border-red-200">
                {totalVencidos}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Activity size={14} className="text-amber-700" />
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono">O.S:</span>
              <span className="text-xs font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                {totalOsPendentes}
              </span>
            </div>
          </div>

        </div>

        {/* Sub-Aba Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7dac9] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('monitoring')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                activeView === 'monitoring'
                  ? "bg-gradient-to-r from-[#9b1526] via-[#851221] to-[#6b0d1a] text-white shadow-md border border-red-500/40"
                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200"
              )}
            >
              <ClipboardCheck size={14} />
              <span>1. Radar de Checklist</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold">
                {totalVeiculos}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('os')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                activeView === 'os'
                  ? "bg-gradient-to-r from-[#9b1526] via-[#851221] to-[#6b0d1a] text-white shadow-md border border-red-500/40"
                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200"
              )}
            >
              <FileText size={14} />
              <span>2. Ordens de Serviço (O.S)</span>
              {totalOsPendentes > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-mono font-bold">
                  {totalOsPendentes}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('generator')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                activeView === 'generator'
                  ? "bg-gradient-to-r from-[#9b1526] via-[#851221] to-[#6b0d1a] text-white shadow-md border border-red-500/40"
                  : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200"
              )}
            >
              <Mail size={14} />
              <span>3. Solicitação de Checklist</span>
            </button>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="bg-[#181a1f] hover:bg-stone-800 text-white text-xs font-mono font-bold uppercase tracking-wider py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-stone-700"
            >
              <Clipboard size={14} className="stroke-[2.5]" />
              <span>Colar Planilha Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="bg-[#9b1526] hover:bg-[#851221] text-white text-xs font-mono font-bold uppercase tracking-wider py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-red-600/40"
            >
              <Plus size={14} />
              <span>Novo Registro</span>
            </button>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Limpar todos os registros"
              >
                <Trash2 size={13} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

            {/* ================= ABA 1: PRANCHETA DE CHECKLIST / MONITORAMENTO ================= */}
            {activeView === 'monitoring' && (
              <div className="flex flex-col gap-4">
                
                {/* Search / Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fbf9f5] p-3.5 rounded-2xl border border-[#d6ccbe] shadow-xs">
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar por Placa do Cavalo, Carretas, Periférico ou O.S..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6ccbe] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b1526] shadow-xs uppercase"
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
                          "px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-xs",
                          filter === f
                            ? "bg-[#181a1f] text-white border-stone-800"
                            : "bg-white text-stone-600 border-[#d6ccbe] hover:text-stone-900 hover:bg-stone-100"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">
                      EXIBINDO VEÍCULOS
                    </span>
                    <span className="text-xs font-black font-mono text-[#9b1526]">
                      {filteredItems.length} de {items.length}
                    </span>
                  </div>
                </div>

                {/* Tabela Oficial Executiva Light */}
                <div className="rounded-2xl border border-[#d6ccbe] overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-[#fbf7ee] text-stone-700 border-b border-[#e7dac9]">
                          <th className="py-3 px-3 w-10 text-center font-mono font-bold uppercase tracking-wider text-[11px]">
                            #
                          </th>
                          <th className="py-3 px-3.5 font-mono font-bold uppercase tracking-wider text-[11px]">
                            Placa Cavalo
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px]">
                            Conjunto / Carretas
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">
                            Status
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">
                            Data Teste
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">
                            Validade
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">
                            Periférico / O.S
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">
                            PDFs
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-right pr-4">
                            Ações
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#eee7dc]">
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-14 text-center text-stone-500 font-medium">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <FileSpreadsheet size={40} className="text-stone-400" />
                                <p className="font-bold text-stone-900 text-sm font-heading">
                                  Nenhum registro de checklist encontrado
                                </p>
                                <p className="text-xs text-stone-500 max-w-md font-sans">
                                  Clique em <strong>"Colar Planilha Excel"</strong> acima para importar seus dados ou em <strong>"Novo Registro"</strong> para cadastrar manualmente.
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
                                    ? "bg-red-50/40 hover:bg-red-50/70" 
                                    : isAVencer 
                                    ? "bg-amber-50/40 hover:bg-amber-50/70" 
                                    : "hover:bg-stone-50/80"
                                )}
                              >
                                {/* Index */}
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-stone-400">
                                  {index + 1}
                                </td>

                                {/* Placa Cavalo */}
                                <td className="py-2 px-3.5 align-middle">
                                  <LicensePlate plate={item.cavalo} type="cavalo" />
                                </td>

                                {/* Placas Carretas */}
                                <td className="py-2.5 px-3">
                                  {item.carretas ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border border-stone-200">
                                        {item.carretas}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-stone-400 italic text-[11px]">Sem carreta</span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 text-center">
                                  {status.label === 'NEGATIVADO' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> NEGATIVADO
                                    </span>
                                  ) : status.label === 'REPROVADO' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> REPROVADO
                                    </span>
                                  ) : isVencido ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-[10px] uppercase tracking-wider">
                                      <ShieldAlert size={12} /> VENCIDO
                                    </span>
                                  ) : isAVencer ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-[10px] uppercase tracking-wider">
                                      <Clock size={12} /> A VENCER
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px] uppercase tracking-wider">
                                      <Check size={12} /> APROVADO
                                    </span>
                                  )}
                                </td>

                                {/* Data Teste */}
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-stone-600">
                                  {formattedTeste}
                                </td>

                                {/* Validade e dias restantes */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="font-mono font-bold text-xs text-stone-900">
                                      {formattedVencimento}
                                    </span>
                                    <span className={cn(
                                      "font-mono font-bold text-[10px]",
                                      diasParaVencer < 0 ? "text-red-600 font-black" : diasParaVencer <= 3 ? "text-amber-700 font-black" : "text-emerald-700 font-black"
                                    )}>
                                      {diasParaVencer < 0 ? `${Math.abs(diasParaVencer)}d vencido` : `${diasParaVencer}d restantes`}
                                    </span>
                                  </div>
                                </td>

                                {/* Periférico / O.S */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    {item.periferico && (
                                      <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-stone-200">
                                        {item.periferico}
                                      </span>
                                    )}
                                    {item.manutencaoOs && (
                                      <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-red-200">
                                        OS: {item.manutencaoOs}
                                      </span>
                                    )}
                                    {!item.periferico && !item.manutencaoOs && (
                                      <span className="text-stone-400 text-xs">-</span>
                                    )}
                                  </div>
                                </td>

                                {/* PDFs Anexados */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <label className="text-[10px] font-bold text-[#9b1526] hover:underline cursor-pointer flex items-center gap-1 font-mono">
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
                                            className="p-1 bg-red-50 text-red-700 rounded border border-red-200 text-[9px] font-bold hover:bg-red-100 cursor-pointer"
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
                                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                      title="Editar"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item.id)}
                                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir"
                                    >
                                      <Trash2 size={13} />
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#fbf9f5] p-3.5 rounded-2xl border border-[#d6ccbe] shadow-xs">
                  <div className="flex items-center gap-2 flex-1 w-full">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={osSearchTerm}
                        onChange={(e) => setOsSearchTerm(e.target.value)}
                        placeholder="Buscar placa ou Nº da O.S..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6ccbe] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b1526] shadow-xs uppercase"
                      />
                    </div>

                    {sortedCavalos.length > 0 && (
                      <select
                        value={sortedCavalos.some(i => i.cavalo === osSearchTerm) ? osSearchTerm : ''}
                        onChange={(e) => setOsSearchTerm(e.target.value)}
                        className="bg-white border border-[#d6ccbe] rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase outline-none focus:border-[#9b1526] cursor-pointer shadow-xs"
                      >
                        <option value="">-- Puxar Placa do Checklist --</option>
                        {sortedCavalos.map(item => (
                          <option key={item.id} value={item.cavalo} className="bg-white text-stone-900">
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
                          "px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-xs",
                          osStatusFilter === st
                            ? "bg-[#181a1f] text-white border-stone-800"
                            : "bg-white text-stone-600 border-[#d6ccbe] hover:text-stone-900 hover:bg-stone-100"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabela de Ordens de Serviço */}
                <div className="rounded-2xl border border-[#d6ccbe] overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-[#fbf7ee] text-stone-700 border-b border-[#e7dac9]">
                          <th className="py-3 px-3 w-10 text-center font-mono font-bold uppercase tracking-wider text-[11px]">#</th>
                          <th className="py-3 px-3.5 font-mono font-bold uppercase tracking-wider text-[11px]">Placa do Cavalo</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">Número da O.S</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">Data Agendamento</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">Dias Restantes</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">Status da O.S</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-center">Checklist Feito</th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-right pr-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee7dc]">
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
                          let daysRemainingStyle = 'bg-stone-100 text-stone-500 border-stone-200';
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
                                daysRemainingStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
                              } else if (diffDays === 0) {
                                daysRemainingText = 'Hoje';
                                daysRemainingStyle = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                              } else {
                                const absDays = Math.abs(diffDays);
                                daysRemainingText = `Atrasado ${absDays} dia${absDays > 1 ? 's' : ''}`;
                                daysRemainingStyle = 'bg-red-50 text-red-800 border-red-200 font-bold';
                              }
                            } catch (e) {
                              daysRemainingText = 'Data inválida';
                              daysRemainingStyle = 'bg-red-50 text-red-800 border-red-200';
                            }
                          }

                          return (
                            <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-stone-400">{i + 1}</td>
                              <td className="py-2 px-3.5 align-middle">
                                <div className="flex flex-col gap-1">
                                  <LicensePlate plate={item.cavalo} type="cavalo" />
                                  {item.carretas && (
                                    <span className="text-[10px] font-mono text-stone-600 font-bold">
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
                                  className="w-32 bg-stone-50 border border-stone-300 text-stone-900 font-bold rounded-lg py-1.5 px-2.5 text-center text-xs font-mono uppercase focus:outline-none focus:border-[#9b1526]"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input 
                                  type="date"
                                  value={item.dataAgendamento || ''}
                                  onChange={(e) => {
                                    update(ref(rtdb, `checklist_veiculos/${item.id}`), { dataAgendamento: e.target.value });
                                  }}
                                  className="w-36 bg-stone-50 border border-stone-300 text-stone-900 font-bold rounded-lg py-1.5 px-2 text-center text-xs font-mono focus:outline-none focus:border-[#9b1526]"
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
                                  className="bg-white border border-stone-300 text-stone-900 rounded-lg py-1.5 px-2 text-xs font-bold focus:outline-none focus:border-[#9b1526] cursor-pointer"
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
                                    "border rounded-lg py-1.5 px-2 text-xs font-bold cursor-pointer font-mono",
                                    (item.checklistRealizado || 'não') === 'sim'
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : "bg-red-50 text-red-800 border-red-300"
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
                                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                </div>

              </div>
            )}

            {/* ================= ABA 3: SOLICITAÇÃO DE CHECKLIST (TEMPLATE DE E-MAIL) ================= */}
            {activeView === 'generator' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Form: Controles e Edição */}
                <div className="lg:col-span-5 bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-[#e7dac9] pb-3 flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Edit2 size={14} className="text-[#9b1526]" />
                      <span>Edição dos Dados da Solicitação</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleResetDefaultData}
                      className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <RotateCcw size={12} />
                      <span>Restaurar</span>
                    </button>
                  </div>

                  {/* Preenchimento Rápido por Veículo da Frota */}
                  <div className="space-y-1.5 bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-2xs">
                    <label className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                      <Truck size={14} className="text-[#9b1526]" />
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
                      className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-lg px-3 py-2 text-xs text-stone-900 font-mono font-bold uppercase focus:border-[#9b1526] outline-none cursor-pointer"
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
                  <div className="space-y-3 text-xs font-mono">
                    <div>
                      <label className="block font-bold text-stone-600 mb-1">
                        1. Saudação:
                      </label>
                      <input
                        type="text"
                        value={genData.greeting}
                        onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                        className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-stone-900 font-medium focus:border-[#9b1526] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-600 mb-1">
                        2. Frase de Solicitação:
                      </label>
                      <input
                        type="text"
                        value={genData.requestText}
                        onChange={(e) => setGenData(prev => ({ ...prev, requestText: e.target.value }))}
                        className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-stone-900 font-medium focus:border-[#9b1526] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">
                          3. CAVALO:
                        </label>
                        <input
                          type="text"
                          value={genData.cavalo}
                          onChange={(e) => setGenData(prev => ({ ...prev, cavalo: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-[#9b1526] font-mono font-bold uppercase focus:border-[#9b1526] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-600 mb-1">
                          4. CARRETAS:
                        </label>
                        <input
                          type="text"
                          value={genData.carretas}
                          onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                          className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-[#9b1526] font-mono font-bold uppercase focus:border-[#9b1526] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-600 mb-1">
                        5. Telefone / Contato:
                      </label>
                      <input
                        type="text"
                        value={genData.contato}
                        onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                        className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-stone-900 font-medium focus:border-[#9b1526] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-600 mb-1">
                        6. Assinatura:
                      </label>
                      <input
                        type="text"
                        value={genData.signature}
                        onChange={(e) => setGenData(prev => ({ ...prev, signature: e.target.value }))}
                        className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-stone-900 font-medium focus:border-[#9b1526] outline-none"
                      />
                    </div>
                  </div>

                  {/* Copy Action */}
                  <div className="pt-2 border-t border-[#e7dac9]">
                    <button
                      type="button"
                      onClick={handleCopyFormattedEmail}
                      className="w-full bg-gradient-to-r from-[#9b1526] via-[#851221] to-[#6b0d1a] hover:from-[#aa182b] hover:to-[#7a0f1e] text-white px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 border border-red-500/40"
                    >
                      {copiedEmail ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                      <span>{copiedEmail ? 'E-mail Copiado!' : 'Copiar E-mail Formatado'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Prévia do E-mail */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#d6ccbe] p-6 sm:p-8 shadow-xs flex flex-col justify-between text-stone-900">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#e7dac9] pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#9b1526] uppercase bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                          FORMATO OFICIAL OUTLOOK / GMAIL
                        </span>
                        <h3 className="font-heading font-black text-base text-stone-900 mt-1 uppercase">
                          Prévia do E-mail de Solicitação
                        </h3>
                      </div>
                      <span className="text-[11px] font-medium text-stone-500">100% idêntico ao copiado</span>
                    </div>

                    <div className="bg-[#fbf9f5] p-6 rounded-xl border border-[#d6ccbe] min-h-[300px]">
                      <div dangerouslySetInnerHTML={{ __html: getChecklistEmailHtml(genData) }} />
                    </div>
                  </div>
                </div>

              </div>
            )}

      </div>

      {/* Modal: Colar Dados da Planilha (TSV / Excel) */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#d6ccbe] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-4 text-stone-900">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#e7dac9] pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#9b1526] flex items-center justify-center shadow-xs">
                <Clipboard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 uppercase tracking-wide">
                  Colar Dados do Checklist (Planilha Excel / TSV)
                </h3>
                <p className="text-xs text-stone-500">
                  Cole as colunas copiadas da sua planilha (Placa, Carretas, Status, Data Teste, Validade).
                </p>
              </div>
            </div>

            <textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder={`Cole aqui as linhas copiadas do Excel...\nExemplo:\nSAS2D02\tPOG2095 / POR5E42\tAPROVADO\t11/09/2026\t10/11/2026`}
              className="w-full h-44 p-3.5 bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl text-xs font-mono font-medium text-stone-900 focus:outline-none focus:border-[#9b1526] shadow-inner resize-none placeholder-stone-400"
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e7dac9]">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleImportData(pasteData)}
                className="px-6 py-2.5 bg-[#9b1526] hover:bg-[#851221] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer active:scale-97 border border-red-600/40"
              >
                Processar e Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Registro de Checklist */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#d6ccbe] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-stone-900">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#e7dac9] pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#9b1526] flex items-center justify-center shadow-xs">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 uppercase tracking-wide">
                  Novo Registro de Checklist
                </h3>
                <p className="text-xs text-stone-500">
                  Cadastre um novo conjunto de cavalo e carretas na frota.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="EX: POZ4431"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={newItem.periferico}
                  onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value.toUpperCase() })}
                  placeholder="EX: TECLADO / SENSOR"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 uppercase font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Observação</label>
                <textarea
                  value={newItem.observacao}
                  onChange={(e) => setNewItem({ ...newItem, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#9b1526] h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e7dac9]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold uppercase text-xs cursor-pointer border border-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-6 py-2 bg-[#9b1526] hover:bg-[#851221] text-white rounded-xl font-bold uppercase text-xs shadow-sm cursor-pointer active:scale-97 border border-red-600/40"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#d6ccbe] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-stone-900">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#e7dac9] pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#9b1526] flex items-center justify-center shadow-xs">
                <Edit2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 uppercase tracking-wide">
                  Editar Checklist: {editingItem.cavalo}
                </h3>
                <p className="text-xs text-stone-500">
                  Atualize os dados e datas de vistoria do veículo.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Carretas do Conjunto</label>
                <input
                  type="text"
                  value={editingItem.carretas}
                  onChange={(e) => setEditingItem({ ...editingItem, carretas: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Data Teste</label>
                  <input
                    type="date"
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem({ ...editingItem, dataTeste: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Data Vencimento</label>
                  <input
                    type="date"
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Status Manual</label>
                <select
                  value={editingItem.statusOverride || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, statusOverride: (e.target.value as any) || null })}
                  className="w-full bg-white border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-[#9b1526] font-medium text-xs cursor-pointer"
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
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Nº da O.S</label>
                  <input
                    type="text"
                    value={editingItem.manutencaoOs || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, manutencaoOs: e.target.value.toUpperCase() })}
                    placeholder="EX: 900382"
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 uppercase font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Data Agendamento O.S</label>
                  <input
                    type="date"
                    value={editingItem.dataAgendamento || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataAgendamento: e.target.value })}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Status da O.S</label>
                  <select
                    value={editingItem.osStatus || 'PENDENTE'}
                    onChange={(e) => setEditingItem({ ...editingItem, osStatus: e.target.value as any })}
                    className="w-full bg-white border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-[#9b1526] font-bold text-xs cursor-pointer"
                  >
                    <option value="PENDENTE">🔴 PENDENTE</option>
                    <option value="AGENDADO">🔵 AGENDADO</option>
                    <option value="EM ANDAMENTO">🟡 EM ANDAMENTO</option>
                    <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                    <option value="CANCELADO">⚫ CANCELADO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Checklist Realizado</label>
                  <select
                    value={editingItem.checklistRealizado || 'não'}
                    onChange={(e) => setEditingItem({ ...editingItem, checklistRealizado: e.target.value as any })}
                    className="w-full bg-white border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-[#9b1526] font-bold text-xs cursor-pointer"
                  >
                    <option value="não">❌ NÃO</option>
                    <option value="sim">✔️ SIM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Periférico</label>
                <input
                  type="text"
                  value={editingItem.periferico || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, periferico: e.target.value.toUpperCase() })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 uppercase font-mono text-xs focus:outline-none focus:border-[#9b1526]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-stone-700 uppercase mb-1 block">Observação</label>
                <textarea
                  value={editingItem.observacao || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacao: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#9b1526] h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e7dac9]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold uppercase text-xs cursor-pointer border border-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-[#9b1526] hover:bg-[#851221] text-white rounded-xl font-bold uppercase text-xs shadow-sm cursor-pointer active:scale-97 border border-red-600/40"
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
