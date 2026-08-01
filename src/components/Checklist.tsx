import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  Clock, 
  Search,
  Truck,
  MessageSquare,
  Wrench,
  Edit2,
  Copy,
  Check,
  Heart,
  Upload,
  FileText,
  X,
  Loader2,
  Eye,
  Download,
  Sparkles,
  ShieldAlert,
  FileSpreadsheet,
  UserCheck,
  RefreshCw
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
  estaNoPatio?: 'SIM' | 'NÃO';
  assinou?: 'SIM' | 'NÃO';
  pdfs?: PdfFile[];
}

const LicensePlate = ({ plate, size = 'normal' }: { plate: string; size?: 'normal' | 'large' }) => (
  <div className={cn(
    "relative bg-gradient-to-b from-[#ffffff] via-[#f2f2f2] to-[#e4e4e4] border-[4px] sm:border-[5px] border-[#d4d4d4] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_4px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-stretch select-none transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_16px_35px_rgba(179,32,37,0.4)]",
    size === 'large' ? "w-[210px] sm:w-[260px]" : "w-[140px]"
  )}>
    {/* Mercosul Top Blue Banner */}
    <div className={cn(
      "bg-gradient-to-r from-[#002b7a] via-[#003d99] to-[#002b7a] flex items-center justify-between px-3 text-white uppercase font-sans font-black shadow-inner border-b border-[#001845]",
      size === 'large' ? "h-[28px] text-[11px]" : "h-[20px] text-[8.5px]"
    )}>
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

      <span className="tracking-[0.3em] font-serif font-black text-[#fdfdfd] drop-shadow">BRASIL</span>

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
    <div className="w-full h-full flex items-center justify-center bg-stone-900">
      <Loader2 size={20} className="animate-spin text-amber-500/60" />
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden relative bg-stone-900">
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
  const [searchTerm, setSearchTerm] = useState('');
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
      alert('Nenhum dado válido encontrado para importação. Verifique o formato colado.');
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
        console.error("Error creating blob for action", err);
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
        return { label: item.statusOverride, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' };
      }
      return { label: item.statusOverride, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' };
    }
    const today = new Date();
    const expiry = parseISO(item.dataVencimento);
    const diff = differenceInDays(expiry, today);
    if (diff < 0) return { label: 'VENCIDO', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' };
    if (diff <= 7) return { label: 'URGENTE', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
    return { label: 'APROVADO', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' };
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
      <div style="font-family: Georgia, serif; color: #f4ede2; font-size: 15px; max-width: 550px; background-color: #16120f; padding: 30px; border: 2px solid #b45309; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <p style="margin-bottom: 16px; font-size: 15px; color: #f4ede2; margin-top: 0;">${genData.greeting},</p>
        <p style="margin-bottom: 24px; font-size: 15px; color: #d6ccc2;">Solicito o <span style="font-weight: bold; text-decoration: underline; text-decoration-color: #b45309;">checklist</span> para os conjuntos abaixo:</p>
        
        <table style="width: 100%; border-collapse: collapse; text-align: center; border: 1px solid #3a322b; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #1c1815; color: #f4ede2;">
              <th style="padding: 12px 14px; border-bottom: 1px solid #3a322b; font-weight: bold; width: 50%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-right: 1px solid #3a322b;">VEÍCULO CAVALO</th>
              <th style="padding: 12px 14px; border-bottom: 1px solid #3a322b; font-weight: bold; width: 50%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">CARRETAS DO CONJUNTO</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #211c18; color: #f4ede2; font-size: 15px; font-weight: bold; font-family: monospace;">
              <td style="padding: 14px; border-right: 1px solid #3a322b; text-transform: uppercase; letter-spacing: 0.5px;">${genData.cavalo || "—"}</td>
              <td style="padding: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${genData.carretas || "—"}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #1c1815; border-radius: 12px; padding: 12px 16px; border: 1px solid #3a322b; margin-bottom: 30px;">
          <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #d6ccc2; text-align: left;">
            Canal de Atendimento: ${genData.contato}
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #3a322b; padding-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
           <p style="color: #a89f91; font-size: 13px; margin: 0;">Atenciosamente,</p>
           <div style="text-align: center; margin-right: 8px;">
              <p style="font-style: italic; font-size: 24px; font-family: 'Brush Script MT', cursive; color: #f4ede2; margin: 0 0 2px 0;">Jefferson Augusto</p>
              <div style="width: 128px; height: 1px; background-color: #b45309; margin: 4px auto;"></div>
              <p style="font-size: 9px; color: #b45309; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Agente de Risco</p>
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

  const totalVeiculos = items.length;
  const totalVencidos = items.filter(i => getStatus(i).label === 'VENCIDO' || getStatus(i).label === 'NEGATIVADO' || getStatus(i).label === 'REPROVADO').length;
  const totalEmDia = totalVeiculos - totalVencidos;

  return (
    <div className="w-full min-h-screen bg-[#0c0a09] text-[#f4ede2] font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,10,9,0.92)_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* EXECUTIVE OFFICE HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#29221d]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c1815] to-[#120f0d] border border-[#3a322b] flex items-center justify-center shadow-xl">
              <ClipboardCheck size={28} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                  Painel Corporativo
                </span>
                <span className="text-stone-500 text-[10px] font-mono">• Três Corações Logística</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#f4ede2] uppercase">
                Central de Checklist & Vistorias
              </h1>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="bg-[#16120f] border border-[#3a322b] rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Truck size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase block">Total Frota</span>
                <span className="text-lg font-serif font-bold text-[#f4ede2]">{totalVeiculos}</span>
              </div>
            </div>

            <div className="bg-[#16120f] border border-[#3a322b] rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Check size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase block">Em Dia</span>
                <span className="text-lg font-serif font-bold text-emerald-400">{totalEmDia}</span>
              </div>
            </div>

            <div className="bg-[#16120f] border border-[#3a322b] rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase block">Vencidos</span>
                <span className="text-lg font-serif font-bold text-rose-400">{totalVencidos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS & ACTION TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#16120f] border border-[#3a322b] rounded-2xl w-fit shadow-md">
            <button
              onClick={() => setActiveView('monitoring')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeView === 'monitoring'
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-500/40"
                  : "text-stone-400 hover:text-white"
              )}
            >
              <ClipboardCheck size={15} />
              <span>Monitoramento de Frota</span>
            </button>
            <button
              onClick={() => setActiveView('generator')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeView === 'generator'
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-500/40"
                  : "text-stone-400 hover:text-white"
              )}
            >
              <Sparkles size={15} />
              <span>Adicionar Checkpoint</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeView === 'monitoring' && (
              <div className="relative flex-1 sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar placa cavalo ou carreta..."
                  className="w-full bg-[#16120f] border border-[#3a322b] rounded-2xl pl-10 pr-4 py-3 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-amber-500/50 shadow-inner"
                />
              </div>
            )}

            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-serif font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Plus size={16} />
              <span>Novo Registro</span>
            </button>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                title="Apagar todos os registros"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Limpar Base</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        {activeView === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 rounded-[2.5rem] bg-gradient-to-br from-[#16120f] to-[#0e0c0a] border border-[#3a322b] p-6 sm:p-8 shadow-2xl">
            <div className="lg:col-span-1 space-y-6 bg-[#110f0d] border border-[#2e2621] p-6 rounded-3xl shadow-inner">
              <h3 className="text-xs font-bold font-serif text-amber-400 uppercase tracking-widest border-b border-[#2e2621] pb-3">
                Configurar Solicitação
              </h3>
              
              <div className="space-y-4 font-serif">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase mb-1.5 block tracking-wider">Saudação</label>
                  <select
                    value={genData.greeting}
                    onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                    className="w-full bg-[#16120f] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-stone-200 focus:border-amber-500 outline-none transition-colors cursor-pointer"
                  >
                    <option value="Bom dia">Bom dia</option>
                    <option value="Boa tarde">Boa tarde</option>
                    <option value="Boa noite">Boa noite</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase mb-1.5 block tracking-wider">Veículo (Cavalo)</label>
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
                    className="w-full bg-[#16120f] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-stone-200 font-bold focus:border-amber-500 outline-none transition-colors cursor-pointer uppercase font-mono"
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
                  <label className="text-[10px] font-black text-stone-400 uppercase mb-1.5 block tracking-wider">Carretas Relacionadas</label>
                  <input
                    type="text"
                    value={genData.carretas}
                    onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="EX: PNE7353 / PNE7433"
                    className="w-full bg-[#16120f] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-stone-200 focus:border-amber-500 outline-none placeholder-stone-600 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase mb-1.5 block tracking-wider">Celular Contato</label>
                  <input
                    type="text"
                    value={genData.contato}
                    onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                    className="w-full bg-[#16120f] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-stone-200 focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={handleCopyGenerator}
                className={cn(
                  "w-full mt-6 py-3.5 rounded-xl text-xs font-serif font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 shadow-lg cursor-pointer",
                  genCopied 
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_2px_15px_rgba(16,185,129,0.4)]" 
                    : "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500 hover:brightness-110 active:scale-95"
                )}
              >
                {genCopied ? <Check size={16} /> : <Copy size={16} />}
                {genCopied ? 'Solicitação Copiada!' : 'Copiar para WhatsApp'}
              </button>
            </div>

            <div className="lg:col-span-2 relative z-10 flex items-center justify-center h-full">
              <div className="w-full max-w-xl bg-[#16120f] p-2 rounded-3xl border border-[#3a322b] shadow-2xl relative">
                <div className="border border-[#3a322b] rounded-2xl p-6 sm:p-10 bg-[#1c1815] shadow-inner relative min-h-[350px]">
                  <div className="relative z-10 space-y-6 font-serif text-stone-200 text-sm sm:text-base">
                    <p className="leading-relaxed">{genData.greeting},</p>
                    <p className="leading-relaxed">Solicito o <strong className="font-bold underline decoration-amber-500 decoration-2 underline-offset-4">checklist</strong> para os conjuntos abaixo:</p>

                    <div className="overflow-hidden rounded-xl border border-[#3a322b] shadow-sm my-6">
                      <table className="w-full text-center">
                        <thead>
                          <tr className="bg-[#120f0d] text-amber-400">
                            <th className="p-3 font-serif font-black text-xs tracking-wider uppercase border-r border-[#3a322b]">VEÍCULO CAVALO</th>
                            <th className="p-3 font-serif font-black text-xs tracking-wider uppercase">CARRETAS DO CONJUNTO</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-[#16120f] text-stone-200 font-bold font-mono">
                            <td className="p-4 border-r border-t border-[#3a322b] uppercase tracking-wide">{genData.cavalo || "—"}</td>
                            <td className="p-4 border-t border-[#3a322b] uppercase tracking-wide">{genData.carretas || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-[#16120f] rounded-xl p-3.5 border border-[#3a322b] text-stone-300">
                      <p className="font-mono font-bold text-xs sm:text-[14px]">Canal de Atendimento: {genData.contato}</p>
                    </div>

                    <div className="pt-8 flex justify-between items-end border-t border-[#3a322b]">
                      <p className="text-stone-400 text-xs">Atenciosamente,</p>
                      <div className="text-center mr-2">
                        <p className="italic text-2xl font-serif text-stone-200 leading-none pb-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>Jefferson Augusto</p>
                        <div className="w-32 h-[1px] bg-amber-600/50 my-1 mx-auto"></div>
                        <p className="text-[9px] uppercase tracking-widest text-amber-400 font-bold font-sans">Agente de Risco</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* FILTER PILLS & SPREADSHEET PASTE TOOL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Filter Pills */}
              <div className="lg:col-span-1 bg-[#16120f] border border-[#3a322b] rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block mb-3 font-bold">Filtrar Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[11px] font-bold font-serif uppercase tracking-widest transition-all cursor-pointer text-center",
                          filter === f 
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-500/40" 
                            : "bg-[#110f0d] text-stone-400 hover:text-white border border-[#2e2621]"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-stone-400 font-serif italic border-t border-[#2e2621] pt-3">
                  Mostrando <strong className="text-amber-400">{filteredItems.length}</strong> de {items.length} veículos cadastrados.
                </div>
              </div>

              {/* Spreadsheet Paste Import Box */}
              <div className="lg:col-span-2 bg-[#16120f] border border-[#3a322b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-bold flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-amber-400" />
                      Atualizar Checklist via Colagem (Tabela)
                    </label>
                    <span className="text-[9px] text-stone-500 font-mono">Cole sem cabeçalhos</span>
                  </div>
                  <div className="flex gap-3">
                    <textarea
                      value={pasteData}
                      onChange={(e) => setPasteData(e.target.value)}
                      placeholder="Cole aqui as informações copiadas da planilha Excel..."
                      className="w-full h-20 bg-[#110f0d] border border-[#2e2621] rounded-2xl px-4 py-3 text-xs text-stone-200 placeholder-stone-600 outline-none focus:border-amber-500/50 resize-none font-mono"
                    />
                    <button 
                      onClick={handleImportData}
                      className="px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl text-xs font-serif font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 shrink-0 flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={16} />
                      <span>Atualizar</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* VEHICLES CARDS GRID WITH GIANT 4K MERCOSUL PLATES */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const status = getStatus(item);
                  const diasParaVencer = differenceInDays(parseISO(item.dataVencimento), new Date());

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-gradient-to-br from-[#1c1815] via-[#16120f] to-[#110f0d] border border-[#3a322b] rounded-[2rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300"
                    >
                      {/* Metallic rivets */}
                      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#3a322b] to-amber-500 opacity-60" />
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-tr from-[#3a322b] to-amber-500 opacity-60" />

                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                        
                        {/* Giant Mercosul Plates & Carretas */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 w-full lg:w-auto">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-stone-400 uppercase mb-2 font-bold">PLACA CAVALO</span>
                            <LicensePlate plate={item.cavalo} size="large" />
                          </div>

                          {item.carretas && (
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-mono tracking-[0.2em] text-stone-400 uppercase mb-2 font-bold">CARRETAS DO CONJUNTO</span>
                              <div className="bg-[#110f0d] border-2 border-[#3a322b] rounded-2xl px-5 py-4 shadow-inner flex items-center gap-3">
                                <Truck size={22} className="text-amber-400" />
                                <span className="font-mono font-black text-sm sm:text-base text-stone-200 uppercase tracking-wider">{item.carretas}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status & Dates Details */}
                        <div className="flex flex-col items-center lg:items-start gap-3 flex-1 px-2 text-center lg:text-left">
                          <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-start">
                            {diasParaVencer < 0 || status.label === 'VENCIDO' || status.label === 'REPROVADO' ? (
                              <div className="px-4 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-serif font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-pulse">
                                <ShieldAlert size={14} />
                                <span>VENCIDO (EXPIROU)</span>
                              </div>
                            ) : (
                              <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-serif font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5">
                                <Check size={14} />
                                <span>EM DIA (APROVADO)</span>
                              </div>
                            )}

                            {item.periferico && (
                              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={12} /> {item.periferico}
                              </span>
                            )}

                            {item.manutencaoOs && (
                              <span className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 font-mono font-bold text-[10px] tracking-wider">
                                OS: {item.manutencaoOs}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-5 text-xs font-serif text-stone-300 mt-1 flex-wrap justify-center lg:justify-start">
                            <div className="flex items-center gap-1.5">
                              <Clock size={15} className="text-amber-500" />
                              <span>Vencimento: <strong className="font-mono font-black text-sm text-white">{format(parseISO(item.dataVencimento), 'dd/MM/yyyy')}</strong></span>
                            </div>
                            <span className={cn(
                              "font-mono font-bold text-xs",
                              diasParaVencer < 0 ? "text-rose-400" : "text-emerald-400"
                            )}>
                              ({diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias restantes`})
                            </span>
                          </div>

                          {item.observacao && (
                            <p className="text-xs text-stone-400 italic mt-1 max-w-lg line-clamp-1">
                              "{item.observacao}"
                            </p>
                          )}
                        </div>

                        {/* Action buttons drawer */}
                        <div className="flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-[#3a322b] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto shrink-0">
                          <div className="flex items-center gap-2">
                            <label className={cn(
                              "px-3.5 py-2.5 bg-[#120f0d] hover:bg-amber-500/10 border border-[#3a322b] text-stone-300 font-serif font-black text-[11px] rounded-xl tracking-wider transition-colors shadow cursor-pointer flex items-center gap-1.5",
                              uploadingItemId === item.id && "opacity-50 pointer-events-none"
                            )}>
                              {uploadingItemId === item.id ? <Loader2 size={13} className="animate-spin text-amber-400" /> : <Upload size={13} className="text-amber-400" />}
                              <span>{uploadingItemId === item.id ? 'ENVIANDO...' : 'ANEXAR PDF'}</span>
                              <input 
                                type="file" 
                                accept="application/pdf" 
                                className="hidden" 
                                onChange={(e) => handlePdfUpload(e, item.id)}
                                disabled={uploadingItemId === item.id}
                              />
                            </label>

                            <button
                              onClick={() => setEditingItem(item)}
                              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-black text-[11px] rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <Edit2 size={13} />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* PDF Files Carousel / Row if attached */}
                      {item.pdfs && item.pdfs.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-[#3a322b]">
                          <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-bold block mb-3 flex items-center gap-1.5">
                            <FileText size={13} className="text-amber-400" />
                            Planilhas & Vistorias Anexadas ({item.pdfs.length})
                          </span>
                          <div className="flex overflow-x-auto gap-4 pb-1" style={{ scrollbarWidth: 'thin' }}>
                            {item.pdfs.map(pdf => (
                              <div key={pdf.id} className="relative w-[280px] h-[150px] shrink-0 bg-[#110f0d] border border-[#3a322b] rounded-2xl overflow-hidden group shadow-md">
                                <PdfThumbnail pdfUrl={pdf.url} title={pdf.name} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                  <button
                                    onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'view')}
                                    className="w-9 h-9 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Visualizar PDF"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => handlePdfAction(e, pdf.url, pdf.name, 'download')}
                                    className="w-9 h-9 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Baixar PDF"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => handlePdfDelete(item.id, pdf.id)}
                                    className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Remover"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        )}

      </div>

      {/* EDIT MODAL DIALOG */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-xl bg-gradient-to-br from-[#1c1815] to-[#110f0d] border-2 border-[#3a322b] rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] space-y-6 text-[#f4ede2] relative"
            >
              <div className="flex items-center justify-between border-b border-[#3a322b] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black uppercase text-white tracking-wide">
                      Editar Checkpoint: {editingItem.cavalo}
                    </h3>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                      Atualização de Dados PGR
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Placa Cavalo</label>
                  <input 
                    type="text" 
                    value={editingItem.cavalo}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, cavalo: e.target.value.toUpperCase() }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Placas Carretas</label>
                  <input 
                    type="text" 
                    value={editingItem.carretas}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, carretas: e.target.value.toUpperCase() }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Data Teste</label>
                  <input 
                    type="date" 
                    value={editingItem.dataTeste}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, dataTeste: e.target.value }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Data Vencimento</label>
                  <input 
                    type="date" 
                    value={editingItem.dataVencimento}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, dataVencimento: e.target.value }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Item Periférico</label>
                  <select 
                    value={editingItem.periferico}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, periferico: e.target.value }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Ordem de Serviço (OS)</label>
                  <input 
                    type="text" 
                    value={editingItem.manutencaoOs || ''}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, manutencaoOs: e.target.value }) : null)}
                    placeholder="OS #98221"
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Status do Checklist</label>
                  <select 
                    value={editingItem.statusOverride || ''}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, statusOverride: e.target.value as ChecklistItem['statusOverride'] || undefined }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Automático (Por Data)</option>
                    <option value="APROVADO">APROVADO (EM DIA)</option>
                    <option value="NEGATIVADO">NEGATIVADO / REPROVADO</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Observação</label>
                  <textarea 
                    value={editingItem.observacao || ''}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, observacao: e.target.value }) : null)}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#3a322b]">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 text-xs font-serif font-bold text-stone-400 hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MODAL DIALOG */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-xl bg-gradient-to-br from-[#1c1815] to-[#110f0d] border-2 border-[#3a322b] rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] space-y-6 text-[#f4ede2] relative"
            >
              <div className="flex items-center justify-between border-b border-[#3a322b] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black uppercase text-white tracking-wide">
                      Adicionar Novo Checkpoint
                    </h3>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                      Registro de Frota PGR
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Placa Cavalo *</label>
                  <input 
                    type="text" 
                    value={newItem.cavalo}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cavalo: e.target.value.toUpperCase() }))}
                    placeholder="EX: POZ4431"
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Placas Carretas</label>
                  <input 
                    type="text" 
                    value={newItem.carretas}
                    onChange={(e) => setNewItem(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                    placeholder="EX: PNE7353 / PNE7433"
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Data Teste</label>
                  <input 
                    type="date" 
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem(prev => ({ ...prev, dataTeste: e.target.value }))}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Data Vencimento</label>
                  <input 
                    type="date" 
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem(prev => ({ ...prev, dataVencimento: e.target.value }))}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Item Periférico</label>
                  <select 
                    value={newItem.periferico}
                    onChange={(e) => setNewItem(prev => ({ ...prev, periferico: e.target.value }))}
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Ordem de Serviço (OS)</label>
                  <input 
                    type="text" 
                    value={newItem.manutencaoOs}
                    onChange={(e) => setNewItem(prev => ({ ...prev, manutencaoOs: e.target.value }))}
                    placeholder="OS #98221"
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Observação</label>
                  <textarea 
                    value={newItem.observacao}
                    onChange={(e) => setNewItem(prev => ({ ...prev, observacao: e.target.value }))}
                    placeholder="Observações adicionais..."
                    className="w-full bg-[#110f0d] border border-[#3a322b] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#3a322b]">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-xs font-serif font-bold text-stone-400 hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Adicionar Checkpoint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
