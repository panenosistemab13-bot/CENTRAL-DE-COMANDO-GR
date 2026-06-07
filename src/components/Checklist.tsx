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
  Check,
  Heart
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
  estaNoPatio?: 'SIM' | 'NÃO';
  assinou?: 'SIM' | 'NÃO';
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
    contato: '(31) 984817047'
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
      <div style="font-family: Georgia, serif; color: #4a3623; font-size: 15px; max-width: 600px; background-color: #fdfaf5; padding: 30px; border: 2px solid #d0a782; border-radius: 12px; box-shadow: inset 0 0 20px rgba(208, 167, 130, 0.2);">
        <div style="display: flex; align-items: center; margin-bottom: 24px; gap: 12px;">
           <img src="https://i.postimg.cc/Lsw0vpDT/Gemini-Generated-Image-ju3ympju3ympju3y.png" alt="3 Corações" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 5px rgba(0,0,0,0.2); border: 1px solid rgba(153, 27, 27, 0.3);" />
           <strong style="color: #b48554; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">Grupo 3 Corações</strong>
        </div>
        <p style="margin-bottom: 16px;">${genData.greeting},</p>
        <p style="margin-bottom: 24px;">Solicito o <strong>checklist</strong> para o conjunto abaixo:</p>
        
        <table style="width: 100%; border-collapse: collapse; font-family: Georgia, serif; font-size: 15px; text-align: center; border: 1px solid #1e3a8a; border-radius: 4px; overflow: hidden; margin-bottom: 32px; color: #4a3623;">
          <thead>
            <tr style="background-color: #0f2a4a; color: #e2e8f0;">
              <th style="padding: 12px 16px; border-right: 1px solid #1e3a8a; border-bottom: 1px solid #1e3a8a; font-weight: bold; width: 50%; text-transform: uppercase;">CAVALO</th>
              <th style="padding: 12px 16px; border-bottom: 1px solid #1e3a8a; font-weight: bold; width: 50%; text-transform: uppercase;">CARRETAS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #d2c2b2; color: #4a3623; font-size: 16px;">
              <td style="padding: 16px 20px; text-shadow: 0 1px 0 rgba(255,255,255,0.3); border-right: 1px solid #c0a892; font-weight: bold;">${genData.cavalo}</td>
              <td style="padding: 16px 20px; text-shadow: 0 1px 0 rgba(255,255,255,0.3); font-weight: bold;">${genData.carretas}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
           <p style="font-size: 15px; color: #4a3623;"><strong style="font-weight: bold;">Contato:</strong> ${genData.contato}</p>
        </div>
        
        <div style="margin-top: 40px; text-align: right;">
           <p style="color: #4a3623; margin-bottom: 4px;">Att,</p>
           <p style="font-style: italic; font-size: 24px; font-family: 'Brush Script MT', cursive; color: #292524; margin: 0;">Jefferson</p>
           <div style="border-top: 1px solid #4a3623; width: 180px; margin-left: auto; margin-top: 4px;"></div>
           <p style="font-size: 12px; margin-top: 4px;">Agente de risco (Jefferson)</p>
        </div>
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
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Checklist</h1>
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
                Solicitação
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 sm:p-8 lg:p-12 rounded-[2.5rem] bg-cover bg-center shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] border-4 border-[#2b180d] relative overflow-hidden" style={{backgroundImage: "url('https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2600&auto=format&fit=crop')"}}>
          {/* Overlay to darken background slightly */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

          {/* Editor Form */}
          <div className="lg:col-span-1 space-y-6 relative z-10">
            <div className="bg-[#312c27] border-2 border-[#111] rounded-2xl p-2 shadow-2xl">
              <div className="border border-dashed border-[#8c6b4a] rounded-xl p-5 sm:p-6 bg-[#312c27]">
                <h3 className="text-[14px] font-bold text-[#c29665] font-serif uppercase tracking-widest border-b border-[#4e3b2e] pb-4 mb-6">Preencher Dados</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-[#c29665] uppercase mb-2 block font-serif tracking-wider">Saudação</label>
                    <select
                      value={genData.greeting}
                      onChange={(e) => setGenData(prev => ({ ...prev, greeting: e.target.value }))}
                      className="w-full bg-[#7a4b31] border-2 border-[#5c3722] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-md px-4 py-2.5 text-sm text-[#fed7aa] font-serif focus:border-[#c29665] outline-none transition-all appearance-none"
                    >
                      <option value="Bom dia" className="bg-[#4e311b]">Bom dia</option>
                      <option value="Boa tarde" className="bg-[#4e311b]">Boa tarde</option>
                      <option value="Boa noite" className="bg-[#4e311b]">Boa noite</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#c29665] uppercase mb-2 block font-serif tracking-wider">Placa do Cavalo</label>
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
                      className="w-full bg-[#7a4b31] border-2 border-[#5c3722] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-md px-4 py-2.5 text-sm text-[#fed7aa] font-serif font-bold focus:border-[#c29665] outline-none transition-all uppercase appearance-none"
                    >
                      <option value="" className="bg-[#4e311b]">Selecione um veículo...</option>
                      {sortedCavalos.map(item => (
                        <option key={item.id} value={item.cavalo} className="bg-[#4e311b]">
                          {item.cavalo} {getStatus(item).label === 'VENCIDO' || getStatus(item).label === 'NEGATIVADO' || getStatus(item).label === 'REPROVADO' ? `(⚠️ VENCIDO)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#c29665] uppercase mb-2 block font-serif tracking-wider">Placas das Carretas</label>
                    <input
                      type="text"
                      value={genData.carretas}
                      onChange={(e) => setGenData(prev => ({ ...prev, carretas: e.target.value.toUpperCase() }))}
                      placeholder="EX: XYZ-9876/LMN-4567"
                      className="w-full bg-[#7a4b31] border-2 border-[#5c3722] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-md px-4 py-2.5 text-sm text-[#fed7aa] font-serif font-bold focus:border-[#c29665] outline-none transition-all uppercase placeholder-[#5c3722]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#c29665] uppercase mb-2 block font-serif tracking-wider">Contato</label>
                    <input
                      type="text"
                      value={genData.contato}
                      onChange={(e) => setGenData(prev => ({ ...prev, contato: e.target.value }))}
                      className="w-full bg-[#7a4b31] border-2 border-[#5c3722] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-md px-4 py-2.5 text-sm text-[#fed7aa] font-serif focus:border-[#c29665] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={handleCopyGenerator}
                    className={cn(
                      "w-full py-3.5 rounded-md font-serif text-[12px] uppercase tracking-wider flex items-center justify-center gap-3 transition-all border-y-[3px]",
                      genCopied 
                        ? "bg-[#2d5930] text-white border-t-[#3b7540] border-b-[#1b361d] shadow-[0_2px_10px_rgba(0,0,0,0.3)]" 
                        : "bg-[#1c3f25] text-[#81b287] hover:bg-[#234d2d] hover:text-[#a8cda8] border-t-[#2d5930] border-b-[#0f2414] shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    {genCopied ? <Check size={16} /> : <Copy size={16} />}
                    {genCopied ? 'Copiado!' : 'Copiar Solicitação'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Box - The Card */}
          <div className="lg:col-span-2 relative z-10 flex items-center h-full">
             <div className="w-full bg-[#e6d5c3] rounded-2xl p-2 sm:p-3 border-[6px] border-[#c79165] shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden ring-4 ring-[#eadfc8]/50 ring-offset-4 ring-offset-[#301a0e]">
                <div className="border border-[#c79165] rounded-xl p-6 sm:p-10 bg-[#fdfaf5] shadow-inner min-h-[350px] relative">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-8 right-8 text-[#d0a782]/20">
                     <Heart size={120} strokeWidth={1} style={{ fill: 'currentColor' }} />
                  </div>

                  <div className="relative z-10 max-w-2xl mx-auto space-y-6 font-serif text-[15px] sm:text-base text-[#4a3623]">
                    
                    {/* Header with Logo */}
                    <div className="flex items-center gap-4 mb-8">
                      <img src="https://i.postimg.cc/Lsw0vpDT/Gemini-Generated-Image-ju3ympju3ympju3y.png" alt="3 Corações" className="w-14 h-14 rounded-full object-cover shadow-md border border-[#991b1b]/30" />
                      <h2 className="text-[#b48554] text-lg sm:text-xl font-bold uppercase tracking-widest drop-shadow-sm">Grupo 3 Corações</h2>
                    </div>

                    <p>{genData.greeting},</p>
                    <p>Solicito o <strong className="font-bold underline decoration-[#d0a782] decoration-2 underline-offset-4">checklist</strong> para o conjunto abaixo:</p>
                    
                    {/* Rustic Table */}
                    <div className="mt-8 mb-8 overflow-hidden rounded-md border-2 border-[#5c3722] shadow-md bg-[#fdfaf5]">
                      <table className="w-full border-collapse text-center tracking-wide">
                        <thead>
                          <tr className="bg-gradient-to-b from-[#7a4b31] to-[#5c3722] text-[#fdfaf5]">
                            <th className="p-4 border-r border-[#4e311b] w-1/2 font-bold font-serif text-sm sm:text-[15px] uppercase tracking-widest drop-shadow-sm">CAVALO</th>
                            <th className="p-4 w-1/2 font-bold font-serif text-sm sm:text-[15px] uppercase tracking-widest drop-shadow-sm">CARRETAS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#d2c2b2] text-[#4a3623] font-bold font-mono sm:text-lg">
                            <td className="p-5 sm:p-6 border-r border-t border-[#c0a892] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] uppercase">{genData.cavalo || "-"}</td>
                            <td className="p-5 sm:p-6 border-t border-[#c0a892] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] uppercase">{genData.carretas || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                      <p className="text-[#4a3623] sm:text-lg">
                        <strong className="font-bold text-[#292524]">Contato:</strong> {genData.contato}
                      </p>
                      <div className="flex items-center gap-2 animate-pulse text-[#b48554]">
                        <Heart size={16} style={{ fill: 'currentColor' }} className="-rotate-12" />
                        <Heart size={20} style={{ fill: 'currentColor' }} className="rotate-6" />
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-between items-end">
                      <p className="text-[#4a3623]">Att,</p>
                      
                      {/* Signature */}
                      <div className="text-center mr-4 sm:mr-8">
                        <p className="font-serif italic text-3xl sm:text-4xl text-[#292524] opacity-90 pb-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>Jefferson</p>
                        <div className="w-40 h-[1px] bg-[#4a3623] mx-auto opacity-50"></div>
                        <p className="text-[10px] uppercase tracking-widest text-[#4a3623] mt-2 font-bold select-none">Agente de risco (Jefferson)</p>
                      </div>
                    </div>

                  </div>
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
      <div className="bg-[#0b0c10]/40 border border-white/5 rounded-[1.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const status = getStatus(item);
              const diasParaVencer = differenceInDays(parseISO(item.dataVencimento), new Date());

              return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col xl:flex-row xl:items-center justify-between p-5 md:px-8 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors gap-6 xl:gap-8 group"
              >
                {/* IDENTIFICADOR / PLACA MERCOSUL */}
                <div className="flex flex-col w-full xl:w-[200px] shrink-0">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Identificador</span>
                  <div className="flex flex-col w-[130px] rounded-[6px] overflow-hidden shadow-lg border border-white/10 shrink-0">
                    <div className="bg-[#003399] h-[16px] flex items-center justify-between px-2">
                      <span className="text-[8px] font-black text-white uppercase leading-none mt-[1px] tracking-tight">Brasil</span>
                      <div className="w-[6px] h-[6px] rounded-full bg-[#ffcc00]"></div>
                    </div>
                    <div className="bg-white text-black font-black text-[20px] text-center leading-none py-2 tracking-wide uppercase">
                      {item.cavalo}
                    </div>
                  </div>
                </div>

                {/* INFORMAÇÕES DO CHECKLIST (Validade, Status, etc) */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                  <div className="flex flex-col bg-[#0b0c10]/60 border border-white/5 rounded-xl px-4 py-3 h-[68px] justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> STATUS</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm w-fit mt-1",
                      status.color, status.bg, status.border,
                      (status.label === 'VENCIDO' || status.label === 'NEGATIVADO' || status.label === 'REPROVADO') ? "animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]" : ""
                    )}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#0b0c10]/60 border border-white/5 rounded-xl px-4 py-3 h-[68px] justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> VALIDADE</span>
                    <div className={cn(
                      "flex items-center gap-1.5 text-[13px] font-mono font-black mt-1",
                      diasParaVencer < 0 ? "text-rose-400" : "text-emerald-400"
                    )}>
                      <Clock size={14} strokeWidth={2.5} />
                      {format(parseISO(item.dataVencimento), 'dd/MM/yyyy')}
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#0b0c10]/60 border border-white/5 rounded-xl px-4 py-3 h-[68px] justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> CARRETAS</span>
                    <span className="text-[12px] font-mono text-zinc-300 font-bold truncate mt-1">
                      {item.carretas || 'Nenhuma'}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#0b0c10]/60 border border-white/5 rounded-xl px-4 py-3 h-[68px] justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> PERIFÉRICO</span>
                    <span className="text-[12px] font-mono text-zinc-300 font-bold truncate flex items-center gap-1.5 mt-1">
                      <Wrench size={14} className="text-zinc-500" strokeWidth={2.5} /> {item.periferico || 'Padrão'}
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#0b0c10]/60 border border-white/5 rounded-xl px-4 py-3 h-[68px] justify-between cursor-help relative group/tooltip">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> RESTANTES</span>
                    <span className={cn(
                      "text-[12px] font-mono font-black truncate flex items-center gap-1.5 mt-1",
                      diasParaVencer < 0 ? "text-rose-500" : diasParaVencer <= 7 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {diasParaVencer < 0 ? `${Math.abs(diasParaVencer)} dias vencido` : `${diasParaVencer} dias`}
                    </span>
                  </div>
                </div>

                {/* ESTÁ NO PÁTIO? & ASSINOU? */}
                <div className="hidden flex-col sm:flex-row items-center gap-4 xl:gap-8 w-full xl:w-auto shrink-0">
                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-between">
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest leading-tight">Está no<br/>pátio?</span>
                    <select 
                      value={item.estaNoPatio || 'NÃO'}
                      onChange={(e) => update(ref(rtdb, `checklist_veiculos/${item.id}`), { estaNoPatio: e.target.value })}
                      className="bg-[#0b0c10] border border-white/10 text-white text-xl sm:text-[22px] font-black font-mono px-4 py-2 rounded-lg outline-none focus:border-primary/50 cursor-pointer appearance-none w-[110px] sm:w-[130px] text-center"
                    >
                      <option value="NÃO" className="bg-[#0b0c10]">NÃO</option>
                      <option value="SIM" className="bg-[#0b0c10]">SIM</option>
                    </select>
                  </div>

                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-between">
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Assinou?</span>
                    <select 
                      value={item.assinou || 'NÃO'}
                      onChange={(e) => update(ref(rtdb, `checklist_veiculos/${item.id}`), { assinou: e.target.value })}
                      className="bg-[#0b0c10] border border-white/10 text-white text-xl sm:text-[22px] font-black font-mono px-4 py-2 rounded-lg outline-none focus:border-primary/50 cursor-pointer appearance-none w-[110px] sm:w-[130px] text-center"
                    >
                      <option value="NÃO" className="bg-[#0b0c10]">NÃO</option>
                      <option value="SIM" className="bg-[#0b0c10]">SIM</option>
                    </select>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="flex items-center justify-end w-full xl:w-auto gap-1 border-t border-white/5 xl:border-0 pt-4 xl:pt-0 mt-2 xl:mt-0 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-all">
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
                    title="Observações"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>

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
