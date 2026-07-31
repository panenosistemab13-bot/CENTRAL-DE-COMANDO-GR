import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  Clock, 
  Search,
  Truck,
  MessageSquare,
  Wrench,
  Filter,
  Edit2,
  Copy,
  Check,
  Heart,
  Upload,
  FileText,
  X,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb, storage } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  estaNoPatio?: 'SIM' | 'NÃO';
  assinou?: 'SIM' | 'NÃO';
  pdfs?: PdfFile[];
}

const CoffeeBean = ({ className = "w-6 h-6", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <path d="M 20,40 C 15,15 45,5 65,15 C 85,25 90,55 80,75 C 70,95 40,95 25,85 C 10,75 25,65 20,40 Z" fill="currentColor" />
    <path d="M 45,8 C 48,25 28,45 68,72 C 78,81 72,92 72,92" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const LicensePlate = ({ plate, size = 'normal' }: { plate: string; size?: 'normal' | 'large' }) => (
  <div className={cn(
    "relative bg-gradient-to-b from-[#ffffff] via-[#f2f2f2] to-[#e4e4e4] border-[4px] sm:border-[5px] border-[#d4d4d4] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_4px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-stretch select-none transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_16px_35px_rgba(179,32,37,0.35)]",
    size === 'large' ? "w-[210px] sm:w-[260px]" : "w-[140px]"
  )}>
    {/* Mercosul Top Blue Banner */}
    <div className={cn(
      "bg-gradient-to-r from-[#002b7a] via-[#003d99] to-[#002b7a] flex items-center justify-between px-3 text-white uppercase font-sans font-black shadow-inner border-b border-[#001845]",
      size === 'large' ? "h-[28px] text-[11px]" : "h-[20px] text-[8.5px]"
    )}>
      {/* Left BR flag badge */}
      <div className="flex items-center gap-1.5">
        <div className={cn(
          "bg-[#009739] rounded-sm flex items-center justify-center shadow-sm relative overflow-hidden",
          size === 'large' ? "w-[16px] h-[11px]" : "w-[12px] h-[8px]"
        )}>
          <div className="w-[6px] h-[4px] bg-[#FEDD00] rotate-45 flex items-center justify-center">
            <div className="w-[2px] h-[2px] bg-[#002776] rounded-full"></div>
          </div>
        </div>
        <span className="tracking-[0.25em] font-extrabold text-[#f0f4ff]">BR</span>
      </div>

      {/* Center title */}
      <span className="tracking-[0.3em] font-serif font-black text-[#fdfdfd] drop-shadow">BRASIL</span>

      {/* Right Mercosul Symbol / State Badge */}
      <div className="flex items-center gap-1">
        <div className={cn(
          "rounded-full bg-[#1e40af] border border-white/40 flex items-center justify-center text-[7px] font-black text-white",
          size === 'large' ? "w-4 h-4 text-[9px]" : "w-3 h-3 text-[6px]"
        )}>
          M
        </div>
      </div>
    </div>

    {/* Main Plate Character Display (Embossed 3D Metallic Style) */}
    <div className={cn(
      "bg-gradient-to-b from-[#ffffff] via-[#f7f4ed] to-[#ede5d8] text-[#110905] font-black text-center leading-none font-mono uppercase tracking-[0.2em] py-2.5 sm:py-3.5 relative flex items-center justify-center shadow-inner",
      size === 'large' ? "text-[28px] sm:text-[34px]" : "text-[20px]"
    )} style={{ textShadow: '0 2px 2px rgba(255,255,255,0.9), 0 -1px 1px rgba(0,0,0,0.25), 1px 1px 0px rgba(0,0,0,0.1)' }}>
      {plate}
    </div>

    {/* Bottom holographic / security striping detail */}
    <div className="h-1 bg-gradient-to-r from-transparent via-[#c0c0c0]/40 to-transparent w-full"></div>
  </div>
);

const PdfThumbnail = ({ pdfUrl, title }: { pdfUrl: string, title: string }) => {
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    if (!pdfUrl) return;
    
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
        const url = URL.createObjectURL(blob);
        setObjectUrl(url + '#view=FitH&toolbar=0&navpanes=0&scrollbar=0');
        
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Error creating blob from data URL", e);
        setObjectUrl(pdfUrl);
      }
    } else {
      setObjectUrl(pdfUrl + '#view=FitH&toolbar=0&navpanes=0&scrollbar=0');
    }
  }, [pdfUrl]);

  if (!objectUrl) return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <Loader2 size={20} className="animate-spin text-[#B32025]/50" />
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden relative bg-white">
      <iframe 
        src={objectUrl}
        className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left pointer-events-none border-0"
        style={{ transform: 'scale(0.25)' }}
        title={title}
        scrolling="no"
      />
    </div>
  );
};

export default function Checklist() {
  const [pasteData, setPasteData] = useState('');
  const [activeView, setActiveView] = useState<'monitoring' | 'generator'>('monitoring');

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
        alert('Checklist atualizado com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar checklist.');
      }
    } else {
      alert('Nenhum dado válido encontrado para importação. Verifique o formato colado.');
    }
    setPasteData('');
  };

  const handlePdfAction = (e: React.MouseEvent, base64Url: string, name: string, action: 'view' | 'download') => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let objectUrl = base64Url;
      if (base64Url.startsWith('data:application/pdf;base64,')) {
        const base64Data = base64Url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
      }

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(objectUrl, '_blank');
      }
    } catch (error) {
      console.error("Error processing PDF action:", error);
    }
  };

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

  const [genData, setGenData] = useState({
    greeting: 'Bom dia',
    cavalo: '',
    carretas: '',
    contato: '(31) 984817047'
  });
  const [genCopied, setGenCopied] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

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
          alert("Erro ao fazer upload do arquivo. O arquivo pode ser muito grande.");
        } finally {
          setUploadingItemId(null);
          event.target.value = '';
        }
      };

      reader.onerror = () => {
        console.error("Erro ao ler o arquivo PDF");
        alert("Erro ao ler o arquivo.");
        setUploadingItemId(null);
        event.target.value = '';
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      alert("Erro ao processar o arquivo.");
      setUploadingItemId(null);
      event.target.value = '';
    }
  };

  const handlePdfDelete = async (itemId: string, pdfId: string) => {
    if (!confirm('Deseja realmente remover este arquivo?')) return;
    
    try {
      const item = items.find(i => i.id === itemId);
      if (!item || !item.pdfs) return;

      const updatedPdfs = item.pdfs.filter(p => p.id !== pdfId);
      await update(ref(rtdb, `checklist_veiculos/${itemId}`), { pdfs: updatedPdfs });
    } catch (error) {
      console.error("Erro ao deletar PDF:", error);
      alert("Erro ao remover o arquivo.");
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
        const initialized = localStorage.getItem('checklist_initialized');
        if (!initialized) {
          localStorage.setItem('checklist_initialized', 'true');
          const seedData = [
            { cavalo: "POZ4431", carretas: "", dataTeste: "2026-02-03", dataVencimento: "2026-04-04", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
            { cavalo: "POZ3241", carretas: "", dataTeste: "2026-02-03", dataVencimento: "2026-04-04", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
            { cavalo: "POD0255", carretas: "", dataTeste: "2026-03-24", dataVencimento: "2026-05-23", manutencaoOs: "", periferico: "SENSOR", observacao: "" },
            { cavalo: "PNY2605", carretas: "PNE7353 / PNE7433", dataTeste: "2026-03-31", dataVencimento: "2026-05-30", manutencaoOs: "", periferico: "BAU", observacao: "CHECKLIST COM OS BAUS - POF9075 / POF8375" },
            { cavalo: "SAR8D82", carretas: "SBF9G98 / TIC0F85", dataTeste: "2026-04-03", dataVencimento: "2026-06-02", manutencaoOs: "", periferico: "TRAVA BAU", observacao: "" },
            { cavalo: "THX5I51", carretas: "POG0685 / POG0545", dataTeste: "2026-04-08", dataVencimento: "2026-06-07", manutencaoOs: "", periferico: "TRAVA BAU", observacao: "" },
            { cavalo: "TYT8A14", carretas: "QOX3164 / QOX3168", dataTeste: "2026-04-08", dataVencimento: "2026-06-07", manutencaoOs: "", periferico: "TECLADO", observacao: "" },
            { cavalo: "SBK4142", carretas: "POF9785 / POR5E42", dataTeste: "2026-04-13", dataVencimento: "2026-06-12", manutencaoOs: "", periferico: "BAU", observacao: "CHECKLIST COM OS BAUS - MIN8723 / TIC0D95" },
          ];
          seedData.forEach((item, idx) => {
            const id = (Date.now() + idx).toString();
            set(ref(rtdb, `checklist_veiculos/${id}`), { ...item, id });
          });
        } else {
          setItems([]);
        }
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
    if (!confirm("Tem certeza de que deseja apagar TODOS os registros do checklist? Esta ação não pode ser desfeita.")) return;
    try {
      localStorage.setItem('checklist_initialized', 'true');
      await remove(ref(rtdb, 'checklist_veiculos'));
      setItems([]);
      alert("Todos os registros do checklist foram apagados com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar registros:", error);
      alert("Erro ao apagar os registros do checklist.");
    }
  };

  const getStatus = (item: ChecklistItem) => {
    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
        return { label: item.statusOverride, color: 'text-amber-500', bg: 'bg-[#B32025]/20', border: 'border-[#B32025]/30' };
      }
      return { label: item.statusOverride, color: 'text-[#55a360]', bg: 'bg-[#55a360]/20', border: 'border-[#55a360]/30' };
    }
    const today = new Date();
    const expiry = parseISO(item.dataVencimento);
    const diff = differenceInDays(expiry, today);
    if (diff < 0) return { label: 'VENCIDO', color: 'text-[#B32025]', bg: 'bg-[#B32025]/10', border: 'border-[#B32025]/20' };
    if (diff <= 7) return { label: 'URGENTE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'APROVADO', color: 'text-[#55a360]', bg: 'bg-[#55a360]/10', border: 'border-[#55a360]/20' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.carretas.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const status = getStatus(item);
    if (filter === 'EM DIA') return status.label === 'APROVADO' || status.label === 'URGENTE';
    if (filter === 'VENCIDO') return status.label === 'VENCIDO';
    if (filter === 'NEGATIVADOS') return status.label === 'NEGATIVADO' || status.label === 'REPROVADO';
    return true;
  });

  const sortedCavalos = [...items].sort((a, b) => {
    const statusA = getStatus(a).label;
    const statusB = getStatus(b).label;
    const aIsVencido = statusA === 'VENCIDO' || statusA === 'NEGATIVADO' || statusA === 'REPROVADO';
    const bIsVencido = statusB === 'VENCIDO' || statusB === 'NEGATIVADO' || statusB === 'REPROVADO';
    if (aIsVencido && !bIsVencido) return -1;
    if (!aIsVencido && bIsVencido) return 1;
    return a.cavalo.localeCompare(b.cavalo);
  });

  const handleCopyGenerator = () => {
    const htmlContent = `
      <div style="font-family: Georgia, serif; color: #4a3623; font-size: 15px; max-width: 550px; background-color: #fdfaf5; padding: 30px; border: 2px solid #c79165; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <p style="margin-bottom: 16px; font-family: Georgia, serif; font-size: 15px; color: #4a3623; margin-top: 0;">${genData.greeting},</p>
        <p style="margin-bottom: 24px; font-family: Georgia, serif; font-size: 15px; color: #4a3623;">Solicito o <span style="font-weight: bold; text-decoration: underline; text-decoration-color: #d0a782; text-decoration-thickness: 2px;">checklist</span> para os conjuntos abaixo:</p>
        
        <table style="width: 100%; border-collapse: collapse; font-family: Georgia, serif; font-size: 14px; text-align: center; border: 1px solid #c0a892; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background-color: #4e2d18; color: #fdfaf5;">
              <th style="padding: 12px 14px; border-bottom: 1px solid #c0a892; font-weight: bold; width: 50%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-right: 1px solid #3d2212;">VEÍCULO CAVALO</th>
              <th style="padding: 12px 14px; border-bottom: 1px solid #c0a892; font-weight: bold; width: 50%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">CARRETAS DO CONJUNTO</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: rgba(230, 213, 195, 0.5); color: #301a0e; font-size: 15px; font-weight: bold; font-family: monospace;">
              <td style="padding: 14px; border-right: 1px solid #c0a892; text-transform: uppercase; letter-spacing: 0.5px;">${genData.cavalo || "—"}</td>
              <td style="padding: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${genData.carretas || "—"}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: rgba(230, 213, 195, 0.3); border-radius: 12px; padding: 12px 16px; border: 1px solid rgba(192, 168, 146, 0.4); margin-bottom: 30px;">
          <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #37281a; margin: 0; text-align: left;">
            Canal de Atendimento: ${genData.contato}
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid rgba(214, 195, 165, 0.5); padding-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
           <p style="color: #737373; font-size: 13px; margin: 0; font-family: Georgia, serif;">Atenciosamente,</p>
           <div style="text-align: center; margin-right: 8px;">
              <p style="font-style: italic; font-size: 24px; font-family: 'Brush Script MT', 'Great Vibes', cursive; color: #292524; margin: 0 0 2px 0; line-height: 1;">Jefferson Augusto</p>
              <div style="width: 128px; height: 1px; background-color: #d1c4b4; margin: 4px auto;"></div>
              <p style="font-size: 9px; color: #B58A4C; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Agente de Risco</p>
           </div>
        </div>
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

  return (
    <div className="flex flex-col min-h-screen bg-[#2D1A10] text-stone-100 overflow-hidden font-sans" style={{ zoom: 0.85 }}>
      {/* Top Header / Quick Codes Bar */}
      <header className="bg-[#3A2414] border-b-2 border-[#6B4423] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 pointer-events-none">
            <svg className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d92d33" />
                  <stop offset="100%" stopColor="#7a0307" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
              <circle cx="60" cy="60" r="50" fill="url(#redGrad)" />
              <g transform="translate(60, 56) scale(0.72)">
                <path d="M-12,-10 C-17,-15 -25,-12 -25,-4 C-25,4 -15,10 0,22 C15,10 25,4 25,-4 C25,-12 17,-15 12,-10 C8,-6 2,-6 0,-6 C-2,-6 -8,-6 -12,-10 Z" fill="url(#goldGrad)" />
              </g>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-serif font-black text-white uppercase tracking-wider">
              CENTRAL DE CHECKLIST PGR
            </h1>
            <p className="text-[10px] text-[#C7A26A] font-serif uppercase tracking-widest">
              MONITORAMENTO DE FROTA E VALIDADE
            </p>
          </div>
        </div>

        {/* View Mode Switch Tabs */}
        <div className="flex bg-[#120702] rounded-xl p-1 border border-[#3d2011]">
          <button
            onClick={() => setActiveView('monitoring')}
            className={cn(
              "px-5 py-2 text-xs font-bold font-serif uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeView === 'monitoring' 
                ? "bg-gradient-to-b from-[#B32025] to-[#800609] text-white shadow-md border-t border-[#F93E47]/30" 
                : "text-[#8c7465] hover:text-[#d8c3a5]"
            )}
          >
            <CoffeeBean className="w-3.5 h-3.5" />
            Monitoramento
          </button>
          <button
            onClick={() => setActiveView('generator')}
            className={cn(
              "px-5 py-2 text-xs font-bold font-serif uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeView === 'generator' 
                ? "bg-gradient-to-b from-[#B32025] to-[#800609] text-white shadow-md border-t border-[#F93E47]/30" 
                : "text-[#8c7465] hover:text-[#d8c3a5]"
            )}
          >
            <CoffeeBean className="w-3.5 h-3.5" />
            Solicitação
          </button>
        </div>
      </header>

      {/* Main Workspace Scroll Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Dynamic styles injected for real cup of coffee steam rising effect */}
      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          20% { opacity: 0.6; }
          60% { opacity: 0.3; }
          100% { transform: translateY(-40px) scale(1.5) rotate(10deg); opacity: 0; }
        }
        .steam-line {
          animation: rise 5s infinite ease-in-out;
        }
        .steam-line-1 { animation-delay: 0.5s; }
        .steam-line-2 { animation-delay: 2.2s; }
        .steam-line-3 { animation-delay: 3.8s; }
      `}</style>

      {/* Decorative Scattered Coffee Beans under layer */}
      <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none transform rotate-[45deg] z-0">
        <CoffeeBean className="w-96 h-96 text-white" />
      </div>

      {/* CORE CONTROL BOARD CARD - MADEIRA ENVELHECIDA */}
      <div className="relative z-10 bg-gradient-to-br from-[#2A1408] to-[#120703] border-[6px] border-[#3D2012] rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_1px_1px_3px_rgba(255,255,255,0.08)]">
        {/* Metal decorative corner hinges */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow-[1px_1px_2px_black]" />
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow-[1px_1px_2px_black]" />
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow-[1px_1px_2px_black]" />
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow-[1px_1px_2px_black]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#160B05]/95 border border-[#3e1f0e] rounded-[1.8rem] p-5 sm:p-6 shadow-inner">
          <div className="flex items-center gap-3">
            <ClipboardCheck size={26} className="text-[#B58A4C]" />
            <span className="text-lg font-bold font-serif text-white tracking-tight uppercase">PAINEL DE CONTROLE CHECKLIST</span>
          </div>

          {activeView === 'monitoring' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c7465]" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#140b07] border-2 border-[#2b180d] text-white placeholder-[#8c7465] rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#B58A4C] outline-none shadow-inner transition-colors"
                />
              </div>
              
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-b from-[#B32025] to-[#7f0003] text-white rounded-xl text-xs font-serif font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all border-y border-t-[#F93E47]/20 border-b-black/40 cursor-pointer"
              >
                <Plus size={16} /> NOVO REGISTRO
              </button>

              <button 
                onClick={handleClearAll}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white rounded-xl text-xs font-serif font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all border border-red-800/60 cursor-pointer"
                title="Limpar todos os registros de checklist"
              >
                <Trash2 size={16} /> LIMPAR TUDO
              </button>
            </div>
          )}
        </div>
      </div>

      {activeView === 'generator' ? (
        /* SOLICITAÇÃO TAB DESIGN (PARCHMENT PAPER DASHBOARD STYLE) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 rounded-[2.5rem] bg-gradient-to-b from-[#1c0e05] to-[#0f0702] border-4 border-[#3D2012] p-6 relative overflow-hidden shadow-2xl">
          {/* Scatter Background design */}
          <div className="absolute top-1/2 left-10 opacity-[0.04] pointer-events-none transform -translate-y-1/2 z-0">
            <CoffeeBean className="w-80 h-80 text-[#B58A4C]" />
          </div>

          {/* Editor inputs left side */}
          <div className="lg:col-span-1 space-y-5 relative z-10 bg-[#160B05] border border-[#2b180d] p-6 rounded-2xl shadow-inner">
            <h3 className="text-sm font-bold font-serif text-[#B58A4C] uppercase tracking-widest border-b border-[#301a0e] pb-3 mb-4">
              DADOS DO SOLICITANTE
            </h3>
            
            <div className="space-y-4 font-serif">
              <div>
                <label className="text-[10px] font-black text-[#8c7465] uppercase mb-1.5 block tracking-wider">Saudação</label>
                <select
                  value={genData.greeting}
                  onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                  className="w-full bg-[#110703] border border-[#2e180d] rounded-xl px-4 py-3 text-sm text-[#fed7aa] focus:border-[#B58A4C] outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="Bom dia">Bom dia</option>
                  <option value="Boa tarde">Boa tarde</option>
                  <option value="Boa noite">Boa noite</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#8c7465] uppercase mb-1.5 block tracking-wider">Veículo (Cavalo)</label>
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
                  className="w-full bg-[#110703] border border-[#2e180d] rounded-xl px-4 py-3 text-sm text-[#fed7aa] font-bold focus:border-[#B58A4C] outline-none transition-colors appearance-none cursor-pointer uppercase"
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
                <label className="text-[10px] font-black text-[#8c7465] uppercase mb-1.5 block tracking-wider">Carretas Relacionadas</label>
                <input
                  type="text"
                  value={genData.carretas}
                  onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                  placeholder="EX: PNE7353 / PNE7433"
                  className="w-full bg-[#110703] border border-[#2e180d] rounded-xl px-4 py-3 text-sm text-white focus:border-[#B58A4C] outline-none placeholder-[#4a2712] uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-[#8c7465] uppercase mb-1.5 block tracking-wider">Celular Contato</label>
                <input
                  type="text"
                  value={genData.contato}
                  onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                  className="w-full bg-[#110703] border border-[#2e180d] rounded-xl px-4 py-3 text-sm text-white focus:border-[#B58A4C] outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleCopyGenerator}
              className={cn(
                "w-full mt-6 py-3.5 rounded-xl text-xs font-serif font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 shadow-md",
                genCopied 
                  ? "bg-[#2d5930] text-white border-[#3d7a42] shadow-[0_2px_10px_rgba(45,89,48,0.4)]" 
                  : "bg-gradient-to-b from-[#B32025] to-[#7f0003] text-white border-[#C41C24] hover:brightness-115 active:scale-95"
              )}
            >
              {genCopied ? <Check size={16} /> : <Copy size={16} />}
              {genCopied ? 'Solicitação Copiada!' : 'Copiar para WhatsApp'}
            </button>
          </div>

          {/* Right Preview Card Clipboard mockup */}
          <div className="lg:col-span-2 relative z-10 flex items-center justify-center h-full">
            <div className="w-full max-w-xl bg-[#e6d5c3] p-1.5 rounded-3xl border-[6px] border-[#c79165] shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative ring-2 ring-[#eadfc8]/40 ring-offset-4 ring-offset-[#1a0f08]">
              <div className="border border-[#c79165] rounded-2xl p-6 sm:p-10 bg-[#fdfaf5] shadow-inner relative min-h-[350px]">
                <div className="relative z-10 space-y-6 font-serif text-[#4a3623] text-sm sm:text-base">
                  <p className="leading-relaxed">{genData.greeting},</p>
                  <p className="leading-relaxed">Solicito o <strong className="font-bold underline decoration-[#d0a782] decoration-2 underline-offset-4">checklist</strong> para os conjuntos abaixo:</p>

                  <div className="overflow-hidden rounded-xl border border-[#c0a892] shadow-sm my-6">
                    <table className="w-full text-center">
                      <thead>
                        <tr className="bg-[#4e2d18] text-[#fdfaf5]">
                          <th className="p-3 font-serif font-black text-xs tracking-wider uppercase border-r border-[#301a0e]">VEÍCULO CAVALO</th>
                          <th className="p-3 font-serif font-black text-xs tracking-wider uppercase">CARRETAS DO CONJUNTO</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-[#e6d5c3]/50 text-[#301a0e] font-bold font-mono">
                          <td className="p-4 border-r border-t border-[#c0a892] uppercase tracking-wide">{genData.cavalo || "—"}</td>
                          <td className="p-4 border-t border-[#c0a892] uppercase tracking-wide">{genData.carretas || "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#e6d5c3]/20 rounded-xl p-3 sm:py-3.5 border border-[#c0a892]/40 text-[#4a3623]">
                    <p id="canal-atendimento-p" className="font-mono font-bold text-xs sm:text-[14px]">Canal de Atendimento: {genData.contato}</p>
                  </div>

                  <div className="pt-8 flex justify-between items-end border-t border-[#d6c3a5]/50">
                    <p className="text-stone-500 text-xs">Atenciosamente,</p>
                    <div className="text-center mr-2">
                      <p className="italic text-2xl font-serif text-[#292524] opacity-90 leading-none pb-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>Jefferson Augusto</p>
                      <div className="w-32 h-[1px] bg-stone-300 my-1 mx-auto"></div>
                      <p className="text-[9px] uppercase tracking-widest text-[#B58A4C] font-bold">Agente de Risco</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MONITORAMENTO LIST VIEW */
        <>
          {/* Active Filtering Tag row */}
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold font-serif uppercase tracking-widest transition-all",
                    filter === f 
                      ? "bg-gradient-to-b from-[#B32025] to-[#7f0003] text-white shadow-lg border border-[#C41C24]" 
                      : "bg-[#180d07] text-[#8c7465] hover:text-[#d8c3a5] border border-[#2b180d]"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            
            {/* Import Data Section */}
            <div className="bg-[#180d07] p-4 rounded-xl border border-[#2b180d] w-full">
              <label className="text-[10px] font-black text-[#8c7465] uppercase mb-2 block tracking-wider">Atualizar Checklist via Colagem (Tabela):</label>
              <div className="flex gap-2">
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder="Cole aqui os dados da planilha..."
                  className="w-full h-20 bg-[#110703] border border-[#2e180d] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B58A4C]"
                />
                <button 
                  onClick={handleImportData}
                  className="px-6 bg-gradient-to-b from-[#55a360] to-[#3a7542] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CHECKLIST VINTAGE WOOD CONTAINER CARDS */}
          <div className="space-y-6 relative z-10">
            <AnimatePresence>
              {filteredItems.map((item) => {
                const status = getStatus(item);
                const diasParaVencer = differenceInDays(parseISO(item.dataVencimento), new Date());
                const isEditingThis = editingItem && editingItem.id === item.id;

                if (isEditingThis) {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-[#FAF0DE] border-[4px] border-[#3A2414] rounded-[2.2rem] p-6 shadow-[0_15px_40px_rgba(58,36,20,0.25)] relative overflow-hidden text-[#3A2414] w-full"
                    >
                      {/* Corner decorative rivet screws */}
                      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] opacity-80" />
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] opacity-80" />
                      <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] opacity-80" />
                      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] opacity-80" />

                      <div className="flex items-center gap-3 border-b border-[#3A2414]/15 pb-3.5 mb-4">
                        <Truck size={22} className="text-[#B32025]" />
                        <div>
                          <h3 className="text-xl font-black font-serif text-[#3A2414] uppercase tracking-wide">
                            Editar Checkpoint: {item.cavalo}
                          </h3>
                          <p className="text-[#3A2414]/70 text-[9px] uppercase tracking-widest mt-0.5 font-bold">
                            REGISTRO DE ESCAPE CENTRAL - PGR
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 font-serif">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Placa Cavalo</label>
                          <input 
                            type="text" 
                            value={editingItem.cavalo}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setEditingItem(prev => prev ? ({ ...prev, cavalo: val }) : null);
                            }}
                            placeholder="POZ4431"
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none tracking-wider uppercase shadow-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Placas Carretas</label>
                          <input 
                            type="text" 
                            value={editingItem.carretas}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setEditingItem(prev => prev ? ({ ...prev, carretas: val }) : null);
                            }}
                            placeholder="PNE7353 / PNE7433"
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none tracking-wider uppercase shadow-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Data Efetiva Teste</label>
                          <input 
                            type="date" 
                            value={editingItem.dataTeste}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingItem(prev => prev ? ({ ...prev, dataTeste: val }) : null);
                            }}
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Data Efetiva Vencimento</label>
                          <input 
                            type="date" 
                            value={editingItem.dataVencimento}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingItem(prev => prev ? ({ ...prev, dataVencimento: val }) : null);
                            }}
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Item Periférico</label>
                          <select 
                            value={editingItem.periferico}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingItem(prev => prev ? ({ ...prev, periferico: val }) : null);
                            }}
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%232c1a12%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_1rem_center] bg-no-repeat"
                          >
                            <option value="">Selecione...</option>
                            <option value="TECLADO">TECLADO</option>
                            <option value="TRAVA BAU">TRAVA BAU</option>
                            <option value="SENSOR">SENSOR</option>
                            <option value="BAU">BAU</option>
                            <option value="PAINEL">PAINEL</option>
                            <option value="OUTROS">OUTROS</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Ordem de Serviço (OS)</label>
                          <input 
                            type="text" 
                            value={editingItem.manutencaoOs || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingItem(prev => prev ? ({ ...prev, manutencaoOs: val }) : null);
                            }}
                            placeholder="OS #98221"
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm"
                          />
                        </div>

                        <div className="space-y-1 col-span-1 md:col-span-2">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">status do checklist</label>
                          <select 
                            value={editingItem.statusOverride || ''}
                            onChange={(e) => {
                              const val = e.target.value as ChecklistItem['statusOverride'] | '';
                              setEditingItem(prev => prev ? ({ ...prev, statusOverride: val || undefined }) : null);
                            }}
                            className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-2.5 text-xs text-[#2D1A10] font-mono focus:border-[#B32025] outline-none cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%232c1a12%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_1rem_center] bg-no-repeat"
                          >
                            <option value="">Selecione...</option>
                            <option value="NEGATIVADO">NEGATIVADO</option>
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider ml-1">Observações Livres</label>
                          <textarea 
                            value={editingItem.observacao || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingItem(prev => prev ? ({ ...prev, observacao: val }) : null);
                            }}
                            placeholder="Mais observações do veículo..."
                            className="w-full bg-white border border-[#3A2414]/20 rounded-xl px-4.5 py-2.5 text-xs text-[#2D1A10] focus:border-[#B32025] outline-none min-h-[55px] resize-none shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-[#3A2414]/15 uppercase">
                        <button 
                          onClick={() => {
                            setEditingItem(null);
                          }} 
                          className="flex-1 py-2.5 text-xs font-bold text-[#3A2414]/70 hover:text-[#B32025] tracking-widest transition-colors font-serif cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleUpdate}
                          className="flex-1 py-2.5 bg-[#B32025] text-white rounded-xl border border-[#B32025] font-serif font-black text-xs tracking-wider shadow-md hover:bg-[#8c060d] active:scale-98 transition-all cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setEditingItem(item)}
                    className="cursor-pointer bg-gradient-to-br from-[#fcf8f0] via-[#f2e6d6] to-[#ebd4bc] border-2 sm:border-[4px] border-[#3A2414] rounded-[2rem] p-4 sm:p-6 shadow-[0_16px_36px_rgba(58,36,20,0.18)] relative overflow-hidden group hover:border-[#B32025] transition-all duration-300 hover:scale-[1.01]"
                  >
                    {/* Metal rivets in corners */}
                    <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow" />
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow" />
                    <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow" />
                    <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#5a3e1b] to-[#cfae7c] shadow" />

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                      
                      {/* Left: Huge License Plates */}
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black font-serif text-[#3A2414] uppercase tracking-[0.2em] mb-2">CAVALO (TRATOR)</span>
                          <div className="transform transition-transform group-hover:scale-105 duration-300">
                            <LicensePlate plate={item.cavalo} size="large" />
                          </div>
                        </div>

                        {item.carretas && (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black font-serif text-[#3A2414] uppercase tracking-[0.2em] mb-2">CARRETA(S) DO CONJUNTO</span>
                            <div className="bg-[#fdfcf9] border-2 border-[#8c7465] rounded-xl px-4 py-3.5 shadow-md flex items-center gap-2">
                              <Truck size={20} className="text-[#3A2414]" />
                              <span className="font-mono font-black text-base text-[#2D1A10] uppercase tracking-wider">{item.carretas}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Center: Status & Expiration Details */}
                      <div className="flex flex-col items-center lg:items-start gap-2.5 text-center lg:text-left flex-1 px-2">
                        <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-start">
                          {diasParaVencer < 0 || status.label === 'VENCIDO' || status.label === 'REPROVADO' ? (
                            <div className="px-3.5 py-1.5 rounded-xl bg-[#B32025] text-white font-serif font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-pulse">
                              <span>🚨 VENCIDO (EXPIROU)</span>
                            </div>
                          ) : (
                            <div className="px-3.5 py-1.5 rounded-xl bg-[#2e7d32] text-white font-serif font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5">
                              <span>✅ EM DIA (APROVADO)</span>
                            </div>
                          )}

                          {item.periferico && (
                            <span className="px-3 py-1 rounded-xl bg-[#3A2414]/10 text-[#3A2414] font-mono font-bold text-[10px] uppercase">
                              {item.periferico}
                            </span>
                          )}

                          {item.manutencaoOs && (
                            <span className="px-3 py-1 rounded-xl bg-amber-500/25 text-amber-900 font-mono font-bold text-[10px]">
                              OS: {item.manutencaoOs}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-serif text-[#3A2414]/90 mt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock size={15} className="text-[#B32025]" />
                            <span>Vencimento: <strong className="font-mono font-black text-sm">{format(parseISO(item.dataVencimento), 'dd/MM/yyyy')}</strong></span>
                          </div>
                          <span className={cn(
                            "font-mono font-bold text-xs",
                            diasParaVencer < 0 ? "text-[#B32025]" : "text-[#2e7d32]"
                          )}>
                            ({diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias restantes`})
                          </span>
                        </div>

                        {item.observacao && (
                          <p className="text-xs text-[#3A2414]/80 italic mt-1 max-w-md line-clamp-1">
                            "{item.observacao}"
                          </p>
                        )}
                      </div>

                      {/* Right: Action prompt */}
                      <div className="flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-[#3A2414]/15 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
                        <span className="text-[10px] font-serif font-bold text-[#3A2414]/70 uppercase tracking-wider text-center">
                          Clique na placa para detalhes
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            className="px-4.5 py-2.5 bg-[#3A2414] hover:bg-[#B32025] text-[#fdf8f0] font-serif font-black text-xs rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <Edit2 size={13} />
                            <span>Ver Detalhes / Editar</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-[#fdfaf5] border border-[#3A2414]/15 rounded-2xl relative overflow-hidden shadow-inner">
                <Filter size={36} className="text-[#3A2414]/50 mb-4" />
                <h3 className="text-[#3A2414] font-serif font-bold uppercase tracking-widest text-sm">Nenhum registro correspondente</h3>
                <p className="text-[#3A2414]/70 text-xs mt-1 tracking-wider uppercase">Experimente ajustar o termo de pesquisa ou marque outra aba.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* RUSTIC PREMIUM ADD MODAL SHEET */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => {
                setIsAdding(false);
              }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              style={{ zoom: 0.9 }}
              className="relative z-10 w-full max-w-xl bg-[#FAF0DE] border-[6px] border-[#3A2414] rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_70px_rgba(58,36,20,0.5)] space-y-4 text-[#3A2414] my-auto"
            >
              {/* Corner decorative rivet screws */}
              <div className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] border border-[#3A2414]/30 shadow-sm" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] border border-[#3A2414]/30 shadow-sm" />
              <div className="absolute bottom-4 left-4 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] border border-[#3A2414]/30 shadow-sm" />
              <div className="absolute bottom-4 right-4 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#6a4220] to-[#b89467] border border-[#3A2414]/30 shadow-sm" />

              <div className="flex items-center gap-3 border-b border-[#3A2414]/15 pb-4 mb-2">
                <Truck size={24} className="text-[#B32025]" />
                <div>
                  <h3 className="text-xl font-black font-serif text-[#3A2414] uppercase tracking-wide">
                    Adicionar Checkpoint
                  </h3>
                  <p className="text-[#3A2414]/70 text-[10px] uppercase tracking-widest mt-0.5 font-bold">
                    REGISTRO DE ESCAPE CENTRAL - PGR
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 font-serif">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Placa Cavalo</label>
                  <input 
                    type="text" 
                    value={newItem.cavalo}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewItem(prev => ({ ...prev, cavalo: val }));
                    }}
                    placeholder="POZ4431"
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none tracking-wider uppercase shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Placas Carretas</label>
                  <input 
                    type="text" 
                    value={newItem.carretas}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewItem(prev => ({ ...prev, carretas: val }));
                    }}
                    placeholder="PNE7353 / PNE7433"
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none tracking-wider uppercase shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Data Efetiva Teste</label>
                  <input 
                    type="date" 
                    value={newItem.dataTeste}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItem(prev => ({ ...prev, dataTeste: val }));
                    }}
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Data Efetiva Vencimento</label>
                  <input 
                    type="date" 
                    value={newItem.dataVencimento}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItem(prev => ({ ...prev, dataVencimento: val }));
                    }}
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Item Periférico</label>
                  <select 
                    value={newItem.periferico}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItem(prev => ({ ...prev, periferico: val }));
                    }}
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%232c1a12%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="">Selecione...</option>
                    <option value="TECLADO">TECLADO</option>
                    <option value="TRAVA BAU">TRAVA BAU</option>
                    <option value="SENSOR">SENSOR</option>
                    <option value="BAU">BAU</option>
                    <option value="PAINEL">PAINEL</option>
                    <option value="OUTROS">OUTROS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">Ordem de Serviço (OS)</label>
                  <input 
                    type="text" 
                    value={newItem.manutencaoOs}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItem(prev => ({ ...prev, manutencaoOs: val }));
                    }}
                    placeholder="OS #98221"
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider block ml-1">status do checklist</label>
                  <select 
                    value={newItem.statusOverride || ''}
                    onChange={(e) => {
                      const val = e.target.value as ChecklistItem['statusOverride'] | '';
                      setNewItem(prev => ({ ...prev, statusOverride: val || undefined }));
                    }}
                    className="w-full bg-white border border-[#3A2414]/15 rounded-xl px-4 py-3 text-sm text-[#2D1A10] font-mono focus:border-[#B32025] outline-none cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%232c1a12%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="">Selecione...</option>
                    <option value="NEGATIVADO">NEGATIVADO</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-[#3A2414] uppercase tracking-wider ml-1">Observações Livres</label>
                  <textarea 
                    value={newItem.observacao}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItem(prev => ({ ...prev, observacao: val }));
                    }}
                    placeholder="Mais observações do veículo..."
                    className="w-full bg-white border border-[#3A2414]/20 rounded-xl px-4.5 py-3 text-sm text-[#2D1A10] focus:border-[#B32025] outline-none min-h-[75px] resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#3A2414]/15 uppercase">
                <button 
                  onClick={() => {
                    setIsAdding(false);
                  }} 
                  className="flex-1 py-3.5 text-xs font-bold text-[#3A2414]/70 hover:text-[#B32025] tracking-widest transition-colors font-serif cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-3.5 bg-[#B32025] text-white rounded-xl border border-[#B32025] font-serif font-black text-xs tracking-wider shadow-lg hover:bg-[#8c060d] active:scale-98 transition-all cursor-pointer"
                >
                  Validar Checklist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Footer Details */}
      <div className="relative z-10 text-center py-6 border-t border-[#311a0c] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7465] mt-10">
        <span className="mb-2 sm:mb-0">© 2026 Sistema PGR • Todos os direitos reservados.</span>
        <div className="flex items-center gap-1 text-[#a47a46] font-serif font-extrabold italic">
          <span>Feito com paixão. Feito para entregar.</span>
          <div className="flex items-center text-[#B32025] ml-1.5 gap-1">
            <Heart size={10} className="fill-current" />
            <Heart size={10} className="fill-current" />
            <Heart size={10} className="fill-current" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
