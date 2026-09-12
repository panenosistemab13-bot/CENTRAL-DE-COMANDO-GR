import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  FileText, 
  Activity, 
  Copy, 
  UserCheck, 
  Radio, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../firebase';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { PatioItem } from '../../data/patioData';

export const formatPlateMobile = (plateStr: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{3}[A-Z0-9]{4}$/.test(clean)) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return plateStr.trim().toUpperCase();
};

export default function MobilePatio({ onBack }: { onBack?: () => void }) {
  const [patioItems, setPatioItems] = useState<PatioItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'patio' | 'fora' | 'assinado'>('todos');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formCavalo, setFormCavalo] = useState('');
  const [formCarreta, setFormCarreta] = useState('');
  const [formDestino, setFormDestino] = useState('');
  const [formMotorista, setFormMotorista] = useState('');
  const [formEstaNoPatio, setFormEstaNoPatio] = useState<'Sim' | 'Não'>('Sim');
  const [formAssinado, setFormAssinado] = useState<'Sim' | 'Não'>('Não');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Real-time listener from patio/veiculos
  useEffect(() => {
    try {
      const patioRef = ref(rtdb, 'patio/veiculos');
      const unsub = onValue(patioRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: PatioItem[] = Object.entries(val).map(([k, v]: [string, any]) => ({
            id: k,
            ...v
          }));
          setPatioItems(list);
        } else {
          setPatioItems([]);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return patioItems.filter(item => {
      if (activeFilter === 'patio' && item.estaNoPatio !== 'Sim') return false;
      if (activeFilter === 'fora' && item.estaNoPatio === 'Sim') return false;
      if (activeFilter === 'assinado' && item.assinado !== 'Sim') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.cavalo || '').toLowerCase().includes(q) ||
          (item.carreta || '').toLowerCase().includes(q) ||
          (item.destino || '').toLowerCase().includes(q) ||
          (item.motorista || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [patioItems, activeFilter, searchQuery]);

  // Toggle patio status
  const handleTogglePatio = async (item: PatioItem) => {
    const nextVal = item.estaNoPatio === 'Sim' ? 'Não' : 'Sim';
    try {
      await update(ref(rtdb, `patio/veiculos/${item.id}`), { estaNoPatio: nextVal });
      showToast(`Veículo ${formatPlateMobile(item.cavalo)}: ${nextVal === 'Sim' ? 'Entrou no Pátio' : 'Saiu do Pátio'}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle signed status
  const handleToggleAssinado = async (item: PatioItem) => {
    const nextVal = item.assinado === 'Sim' ? 'Não' : 'Sim';
    try {
      await update(ref(rtdb, `patio/veiculos/${item.id}`), { assinado: nextVal });
      showToast(`Termo assinado: ${nextVal}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete vehicle
  const handleDelete = async (id: string, plate: string) => {
    if (confirm(`Remover o veículo ${formatPlateMobile(plate)} do pátio?`)) {
      try {
        await remove(ref(rtdb, `patio/veiculos/${id}`));
        showToast('Veículo removido com sucesso!');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Add new vehicle
  const handleAddVehicle = async () => {
    if (!formCavalo.trim()) {
      showToast('Preencha a Placa do Cavalo!');
      return;
    }

    try {
      const newRef = push(ref(rtdb, 'patio/veiculos'));
      await set(newRef, {
        cavalo: formatPlateMobile(formCavalo),
        carreta: formatPlateMobile(formCarreta),
        destino: formDestino.toUpperCase() || 'SANTA LUZIA',
        motorista: formMotorista.toUpperCase(),
        estaNoPatio: formEstaNoPatio,
        assinado: formAssinado
      });

      showToast('Veículo adicionado com sucesso!');
      setShowAddModal(false);
      setFormCavalo('');
      setFormCarreta('');
      setFormDestino('');
      setFormMotorista('');
    } catch (e) {
      console.error(e);
    }
  };

  const totalNoPatio = patioItems.filter(i => i.estaNoPatio === 'Sim').length;
  const totalAssinados = patioItems.filter(i => i.assinado === 'Sim').length;

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
        {/* TOP METRICS SUMMARY */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1c0d05] border border-white/10 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] font-mono uppercase text-[#c2a67e] block">Total</span>
            <span className="text-lg font-sans font-black text-white">{patioItems.length}</span>
          </div>
          <div className="bg-[#1c0d05] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] font-mono uppercase text-emerald-400 block">No Pátio</span>
            <span className="text-lg font-sans font-black text-emerald-300">{totalNoPatio}</span>
          </div>
          <div className="bg-[#1c0d05] border border-amber-500/20 rounded-2xl p-2.5 text-center">
            <span className="text-[9px] font-mono uppercase text-amber-400 block">Assinados</span>
            <span className="text-lg font-sans font-black text-amber-300">{totalAssinados}</span>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#B32025] to-[#800609] text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-white/20 active:scale-97 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Cadastrar Veículo no Pátio</span>
        </button>

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa, destino ou motorista..."
            className="w-full bg-[#160a04] text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'patio', label: 'No Pátio' },
            { id: 'fora', label: 'Fora do Pátio' },
            { id: 'assinado', label: 'Assinados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                activeFilter === f.id
                  ? "bg-[#B32025] text-white border-white/30"
                  : "bg-white/5 text-[#c2a67e] border-white/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* VEHICLE CARDS */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-[#160a04] border border-white/10">
              <Truck size={32} className="mx-auto mb-2 text-[#c2a67e]/40" />
              <p className="text-sm font-sans font-bold text-white">Nenhum veículo no pátio</p>
              <p className="text-xs text-[#c2a67e]/70 mt-1">
                Toque no botão acima para registrar um veículo.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const inPatio = item.estaNoPatio === 'Sim';
              const signed = item.assinado === 'Sim';

              return (
                <div
                  key={item.id}
                  className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl relative overflow-hidden"
                >
                  {/* Top: Status Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 rounded-lg bg-black/50 text-[10px] font-mono text-[#d4bc96] border border-white/5">
                        SANTA LUZIA
                      </span>
                      <span className="text-[#c2a67e] text-xs">➔</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-[10px] font-mono font-bold text-amber-200 border border-amber-500/30 truncate">
                        {item.destino || 'DESTINO NÃO DEFINIDO'}
                      </span>
                    </div>

                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black uppercase tracking-wider border shrink-0",
                      inPatio
                        ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-950/90 text-rose-300 border-rose-500/40"
                    )}>
                      {inPatio ? 'NO PÁTIO' : 'FORA'}
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

                    <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 flex items-center gap-1.5 shadow-inner">
                      <span className="text-[8px] font-mono uppercase text-[#c2a67e]">Carreta</span>
                      <span className="text-sm font-mono font-black text-amber-200 tracking-wider">
                        {formatPlateMobile(item.carreta) || 'SEM CARRETA'}
                      </span>
                    </div>
                  </div>

                  {/* Driver & Details */}
                  {item.motorista && (
                    <div className="mb-3 pb-2.5 border-b border-white/10">
                      <div className="text-[9px] font-mono uppercase text-[#c2a67e] flex items-center gap-1">
                        <UserCheck size={11} /> Motorista
                      </div>
                      <h4 className="text-xs font-sans font-black text-white uppercase truncate">
                        {item.motorista}
                      </h4>
                    </div>
                  )}

                  {/* Quick Toggles: No Pátio & Assinado */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => handleTogglePatio(item)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl border text-[11px] font-sans font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer",
                        inPatio
                          ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-200"
                          : "bg-white/5 border-white/10 text-[#c2a67e]"
                      )}
                    >
                      <Building2 size={13} />
                      <span>{inPatio ? 'No Pátio' : 'Fora do Pátio'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleAssinado(item)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl border text-[11px] font-sans font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer",
                        signed
                          ? "bg-amber-600/30 border-amber-500/50 text-amber-200"
                          : "bg-white/5 border-white/10 text-[#c2a67e]"
                      )}
                    >
                      <ShieldCheck size={13} />
                      <span>{signed ? 'Assinado' : 'Não Assinou'}</span>
                    </button>
                  </div>

                  {/* Delete button */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleDelete(item.id, item.cavalo)}
                      className="text-xs font-sans font-bold text-rose-400/80 hover:text-rose-300 flex items-center gap-1 p-1"
                    >
                      <Trash2 size={13} />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MOBILE ADD BOTTOM SHEET */}
      <AnimatePresence>
        {showAddModal && (
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
                  Cadastrar Veículo no Pátio
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
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
                      Placa Carreta
                    </label>
                    <input
                      type="text"
                      value={formCarreta}
                      onChange={(e) => setFormCarreta(e.target.value.toUpperCase())}
                      placeholder="XYZ-5678"
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={formDestino}
                    onChange={(e) => setFormDestino(e.target.value)}
                    placeholder="Ex: GUARULHOS - SP"
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Nome do Motorista
                  </label>
                  <input
                    type="text"
                    value={formMotorista}
                    onChange={(e) => setFormMotorista(e.target.value)}
                    placeholder="Nome completo..."
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Está no Pátio?
                    </label>
                    <select
                      value={formEstaNoPatio}
                      onChange={(e) => setFormEstaNoPatio(e.target.value as any)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Termo Assinado?
                    </label>
                    <select
                      value={formAssinado}
                      onChange={(e) => setFormAssinado(e.target.value as any)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    >
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-sans font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="flex-1 py-3 rounded-2xl bg-[#B32025] hover:bg-[#c02428] text-white font-sans font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Cadastrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
