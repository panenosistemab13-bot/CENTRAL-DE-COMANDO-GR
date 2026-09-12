import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Wrench, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  X,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../firebase';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { differenceInDays, parseISO, format } from 'date-fns';

export const formatPlateMobile = (plateStr?: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{3}[A-Z0-9]{4}$/.test(clean)) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return plateStr.trim().toUpperCase();
};

interface MobileChecklistItem {
  id: string;
  cavalo: string;
  carretas: string;
  dataTeste: string;
  dataVencimento: string;
  periferico: string;
  manutencaoOs: string;
  observacao: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

export default function MobileChecklist({ onBack }: { onBack?: () => void }) {
  const [items, setItems] = useState<MobileChecklistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'vencidos' | 'avencer' | 'ok'>('todos');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MobileChecklistItem | null>(null);
  const [formCavalo, setFormCavalo] = useState('');
  const [formCarretas, setFormCarretas] = useState('');
  const [formDataTeste, setFormDataTeste] = useState('');
  const [formDataVencimento, setFormDataVencimento] = useState('');
  const [formPeriferico, setFormPeriferico] = useState('SASCAR');
  const [formObservacao, setFormObservacao] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Subscribe to checklist_veiculos
  useEffect(() => {
    try {
      const chkRef = ref(rtdb, 'checklist_veiculos');
      const unsub = onValue(chkRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: MobileChecklistItem[] = Object.entries(val).map(([k, v]: [string, any]) => ({
            id: k,
            ...v
          }));
          setItems(list);
        } else {
          setItems([]);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Calculate status for each item
  const getItemStatus = (item: MobileChecklistItem) => {
    if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'NEGATIVADO' || item.statusOverride === 'REPROVADO') {
      return { status: 'vencido', label: 'VENCIDO', color: 'bg-rose-950 text-rose-300 border-rose-500/40' };
    }

    if (!item.dataVencimento) {
      return { status: 'none', label: 'SEM DATA', color: 'bg-zinc-800 text-zinc-400 border-white/10' };
    }

    try {
      let expiry: Date | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.dataVencimento)) {
        expiry = parseISO(item.dataVencimento);
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.dataVencimento)) {
        const [d, m, y] = item.dataVencimento.split('/');
        expiry = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      }

      if (expiry && !isNaN(expiry.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);
        const diff = differenceInDays(expiry, today);

        if (diff < 0) {
          return { status: 'vencido', label: `VENCIDO HÁ ${Math.abs(diff)} DIAS`, color: 'bg-rose-950 text-rose-300 border-rose-500/40' };
        }
        if (diff <= 30) {
          return { status: 'avencer', label: `VENCE EM ${diff} DIAS`, color: 'bg-amber-950 text-amber-300 border-amber-500/40' };
        }
        return { status: 'ok', label: `EM DIA (${diff} DIAS)`, color: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
      }
    } catch (e) {
      // fallback
    }

    return { status: 'ok', label: 'EM DIA', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const st = getItemStatus(item).status;
      if (filterType === 'vencidos' && st !== 'vencido') return false;
      if (filterType === 'avencer' && st !== 'avencer') return false;
      if (filterType === 'ok' && st !== 'ok') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.cavalo || '').toLowerCase().includes(q) ||
          (item.carretas || '').toLowerCase().includes(q) ||
          (item.periferico || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, filterType, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    let vencidos = 0;
    let avencer = 0;
    let ok = 0;
    items.forEach(i => {
      const s = getItemStatus(i).status;
      if (s === 'vencido') vencidos++;
      else if (s === 'avencer') avencer++;
      else if (s === 'ok') ok++;
    });
    return { total: items.length, vencidos, avencer, ok };
  }, [items]);

  // Handle Save (Add or Edit)
  const handleSave = async () => {
    if (!formCavalo.trim()) {
      showToast('Preencha a Placa do Cavalo!');
      return;
    }

    try {
      if (editingItem) {
        await update(ref(rtdb, `checklist_veiculos/${editingItem.id}`), {
          cavalo: formatPlateMobile(formCavalo),
          carretas: formatPlateMobile(formCarretas),
          dataTeste: formDataTeste,
          dataVencimento: formDataVencimento,
          periferico: formPeriferico.toUpperCase(),
          observacao: formObservacao
        });
        showToast('Checklist atualizado com sucesso!');
      } else {
        const newRef = push(ref(rtdb, 'checklist_veiculos'));
        await set(newRef, {
          cavalo: formatPlateMobile(formCavalo),
          carretas: formatPlateMobile(formCarretas),
          dataTeste: formDataTeste || format(new Date(), 'yyyy-MM-dd'),
          dataVencimento: formDataVencimento,
          periferico: formPeriferico.toUpperCase(),
          observacao: formObservacao,
          manutencaoOs: '',
          statusOverride: 'APROVADO'
        });
        showToast('Novo Checklist cadastrado!');
      }

      setShowModal(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, plate: string) => {
    if (confirm(`Excluir checklist do veículo ${formatPlateMobile(plate)}?`)) {
      try {
        await remove(ref(rtdb, `checklist_veiculos/${id}`));
        showToast('Checklist removido!');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-50 p-3.5 rounded-2xl bg-[#B32025] text-white font-sans text-xs font-bold text-center shadow-2xl border border-white/20"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-3 space-y-3.5 max-w-full overflow-x-hidden">
        {/* COUNTER METRICS */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-[#1c0d05] border border-white/10 rounded-2xl p-2 text-center">
            <span className="text-[8px] font-mono uppercase text-[#c2a67e] block">Total</span>
            <span className="text-base font-sans font-black text-white">{counts.total}</span>
          </div>
          <div className="bg-[#1c0d05] border border-emerald-500/20 rounded-2xl p-2 text-center">
            <span className="text-[8px] font-mono uppercase text-emerald-400 block">Em Dia</span>
            <span className="text-base font-sans font-black text-emerald-300">{counts.ok}</span>
          </div>
          <div className="bg-[#1c0d05] border border-amber-500/20 rounded-2xl p-2 text-center">
            <span className="text-[8px] font-mono uppercase text-amber-400 block">&lt; 30 Dias</span>
            <span className="text-base font-sans font-black text-amber-300">{counts.avencer}</span>
          </div>
          <div className="bg-[#1c0d05] border border-rose-500/20 rounded-2xl p-2 text-center">
            <span className="text-[8px] font-mono uppercase text-rose-400 block">Vencidos</span>
            <span className="text-base font-sans font-black text-rose-300">{counts.vencidos}</span>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={() => {
            setEditingItem(null);
            setFormCavalo('');
            setFormCarretas('');
            setFormDataTeste(format(new Date(), 'yyyy-MM-dd'));
            setFormDataVencimento('');
            setFormPeriferico('SASCAR');
            setFormObservacao('');
            setShowModal(true);
          }}
          className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#B32025] to-[#800609] text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-white/20 active:scale-97 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Novo Checklist de Veículo</span>
        </button>

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa cavalo, carreta ou periferico..."
            className="w-full bg-[#160a04] text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'vencidos', label: 'Vencidos' },
            { id: 'avencer', label: 'A Vencer' },
            { id: 'ok', label: 'Em Dia' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                filterType === f.id
                  ? "bg-[#B32025] text-white border-white/30"
                  : "bg-white/5 text-[#c2a67e] border-white/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST OF CARDS */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-[#160a04] border border-white/10">
              <ClipboardCheck size={32} className="mx-auto mb-2 text-[#c2a67e]/40" />
              <p className="text-sm font-sans font-bold text-white">Nenhum checklist encontrado</p>
              <p className="text-xs text-[#c2a67e]/70 mt-1">
                Cadastre um novo checklist ou ajuste o filtro.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const st = getItemStatus(item);

              return (
                <div
                  key={item.id}
                  className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl relative overflow-hidden"
                >
                  {/* Header: Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black uppercase tracking-wider border",
                      st.color
                    )}>
                      {st.label}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-mono text-[#c2a67e] border border-white/5">
                      {item.periferico || 'SASCAR'}
                    </span>
                  </div>

                  {/* Plates */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 flex items-center gap-1.5 shadow-inner">
                      <span className="text-[8px] font-mono uppercase text-[#c2a67e]">Cavalo</span>
                      <span className="text-sm font-mono font-black text-white tracking-wider">
                        {formatPlateMobile(item.cavalo)}
                      </span>
                    </div>

                    {item.carretas && (
                      <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 flex items-center gap-1.5 shadow-inner">
                        <span className="text-[8px] font-mono uppercase text-[#c2a67e]">Carreta</span>
                        <span className="text-sm font-mono font-black text-amber-200 tracking-wider">
                          {formatPlateMobile(item.carretas)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 pb-2.5 border-b border-white/10">
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[#c2a67e] block">Data do Teste</span>
                      <span className="text-white font-bold">{item.dataTeste || '-'}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="text-[#c2a67e] block">Vencimento</span>
                      <span className="text-amber-200 font-bold">{item.dataVencimento || 'NÃO INFORMADO'}</span>
                    </div>
                  </div>

                  {/* Observation if any */}
                  {item.observacao && (
                    <p className="text-[11px] text-[#f5ebd6]/80 italic mb-3">
                      "{item.observacao}"
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setFormCavalo(item.cavalo);
                        setFormCarretas(item.carretas || '');
                        setFormDataTeste(item.dataTeste || '');
                        setFormDataVencimento(item.dataVencimento || '');
                        setFormPeriferico(item.periferico || 'SASCAR');
                        setFormObservacao(item.observacao || '');
                        setShowModal(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Wrench size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.cavalo)}
                      className="text-xs font-sans font-bold text-rose-400/80 hover:text-rose-300 flex items-center gap-1 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-[#180c06] border-t-2 border-amber-500/40 rounded-t-[2.5rem] p-5 text-[#f5ebd6] max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-base font-sans font-black uppercase text-white">
                  {editingItem ? 'Editar Checklist' : 'Novo Checklist de Frota'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Placa Cavalo *
                    </label>
                    <input
                      type="text"
                      value={formCavalo}
                      onChange={(e) => setFormCavalo(e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Placa Carreta(s)
                    </label>
                    <input
                      type="text"
                      value={formCarretas}
                      onChange={(e) => setFormCarretas(e.target.value.toUpperCase())}
                      placeholder="XYZ-5678"
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Data do Teste
                    </label>
                    <input
                      type="date"
                      value={formDataTeste}
                      onChange={(e) => setFormDataTeste(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Data Vencimento *
                    </label>
                    <input
                      type="date"
                      value={formDataVencimento}
                      onChange={(e) => setFormDataVencimento(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Tecnologia / Periférico
                  </label>
                  <select
                    value={formPeriferico}
                    onChange={(e) => setFormPeriferico(e.target.value)}
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  >
                    <option value="SASCAR">SASCAR</option>
                    <option value="AUTOTRAC">AUTOTRAC</option>
                    <option value="OMNILINK">OMNILINK</option>
                    <option value="SIGHRA">SIGHRA</option>
                    <option value="ONIXSAT">ONIXSAT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Observação
                  </label>
                  <textarea
                    rows={2}
                    value={formObservacao}
                    onChange={(e) => setFormObservacao(e.target.value)}
                    placeholder="Informações adicionais do checklist..."
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-sans font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl bg-[#B32025] hover:bg-[#c02428] text-white font-sans font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
