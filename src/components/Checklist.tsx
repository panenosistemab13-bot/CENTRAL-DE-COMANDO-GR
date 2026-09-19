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
  FileText,
  X,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, remove, update, push } from 'firebase/database';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { Gauge3D } from './3d/Gauge3D';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

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
  dataAgendamento?: string;
  osStatus?: 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  checklistRealizado?: 'sim' | 'não';
}

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'os'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADO'>('TODOS');
  const [isLoading, setIsLoading] = useState(true);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    cavalo: '',
    carretas: '',
    dataTeste: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    manutencaoOs: '',
    periferico: 'RASTREADOR PRINCIPAL',
    observacao: '',
    checklistRealizado: 'sim'
  });

  useEffect(() => {
    const checklistRef = ref(db, 'checklist_veiculos');
    const unsubscribe = onValue(checklistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: ChecklistItem[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setItems(parsed);
      } else {
        setItems([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.cavalo) return;

    const checklistRef = ref(db, 'checklist_veiculos');
    const newRef = push(checklistRef);
    await set(newRef, newItem);

    setIsAddingNew(false);
    setNewItem({
      cavalo: '',
      carretas: '',
      dataTeste: new Date().toISOString().split('T')[0],
      dataVencimento: '',
      manutencaoOs: '',
      periferico: 'RASTREADOR PRINCIPAL',
      observacao: '',
      checklistRealizado: 'sim'
    });
  };

  const handleUpdateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.id) return;

    const itemRef = ref(db, `checklist_veiculos/${editingItem.id}`);
    await update(itemRef, editingItem);
    setEditingItem(null);
  };

  const handleDeleteChecklist = async (id: string) => {
    if (window.confirm("Confirmar remoção de registro de vistoria/checklist?")) {
      const itemRef = ref(db, `checklist_veiculos/${id}`);
      await remove(itemRef);
    }
  };

  const getItemStatus = (item: ChecklistItem): 'normal' | 'warning' | 'critical' => {
    if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
      return 'critical';
    }
    if (!item.dataVencimento) return 'normal';

    const vencimento = new Date(item.dataVencimento);
    const hoje = new Date();
    if (vencimento < hoje) return 'critical';
    
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'warning';
    return 'normal';
  };

  const expiredCount = items.filter(i => getItemStatus(i) === 'critical').length;
  const warningCount = items.filter(i => getItemStatus(i) === 'warning').length;
  const normalCount = items.filter(i => getItemStatus(i) === 'normal').length;
  const complianceRate = items.length > 0 ? Math.round((normalCount / items.length) * 100) : 100;

  const filteredItems = items.filter(i => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      i.cavalo.toLowerCase().includes(query) ||
      i.carretas.toLowerCase().includes(query) ||
      i.periferico.toLowerCase().includes(query) ||
      i.manutencaoOs.toLowerCase().includes(query)
    );

    if (statusFilter === 'VENCIDO') return matchesSearch && getItemStatus(i) === 'critical';
    if (statusFilter === 'EM DIA') return matchesSearch && getItemStatus(i) === 'normal';
    return matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="led-status led-status-blue" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
              PGR COMMAND CENTER 3D • CONFORMIDADE OPERACIONAL
            </span>
          </div>
          <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck size={24} className="text-sky-400" />
            CHECKLIST & VISTORIAS TÉCNICAS
          </h1>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> NOVO CHECKLIST
        </button>
      </GlassPanel3D>

      {/* METRICS & GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard3D
          title="Total Vistorias"
          value={items.length}
          subtitle="Banco de Dados RTDB"
          icon={ClipboardCheck}
          status="info"
        />
        <MetricCard3D
          title="Vistorias Vencidas"
          value={expiredCount}
          subtitle="Ação Inmediata Exigida"
          icon={AlertTriangle}
          status={expiredCount > 0 ? "critical" : "normal"}
        />
        <MetricCard3D
          title="A Vencer 7 Dias"
          value={warningCount}
          subtitle="Janela de Agendamento"
          icon={Clock}
          status={warningCount > 0 ? "warning" : "normal"}
        />
        <GlassPanel3D className="p-4 flex items-center justify-center" variant="metallic">
          <Gauge3D value={complianceRate} label="Taxa de Conformidade" size={130} status={complianceRate > 85 ? "normal" : "warning"} />
        </GlassPanel3D>
      </div>

      {/* FILTER PANEL */}
      <FilterPanel3D
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filtrar por cavalo, carreta, periférico ou O.S..."
      />

      {/* MAIN CHECKLIST TABLE */}
      <HUDPanel title={`Tabela de Vistorias e Checklists (${filteredItems.length})`} badge="COMPLIANCE">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-sky-400" />
            <span>Carregando dados de conformidade...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhuma vistoria localizada com os critérios fornecidos.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Placa Cavalo</th>
                  <th className="py-3 px-4">Placas Carretas</th>
                  <th className="py-3 px-4">Periférico / Teste</th>
                  <th className="py-3 px-4">Data Vencimento</th>
                  <th className="py-3 px-4">O.S. Manutenção</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
                {filteredItems.map((item) => {
                  const status = getItemStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-sky-500/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-white uppercase">
                        {item.cavalo}
                      </td>
                      <td className="py-3 px-4 text-slate-300 uppercase">
                        {item.carretas || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-sky-300">{item.periferico}</div>
                        <span className="text-[10px] text-slate-400">Teste: {item.dataTeste || '-'}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {item.dataVencimento || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.manutencaoOs || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusIndicator3D
                          status={status}
                          label={status === 'critical' ? 'VENCIDO' : status === 'warning' ? 'A VENCER' : 'EM DIA'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteChecklist(item.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer border border-rose-500/30"
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
        )}
      </HUDPanel>

      {/* CREATE MODAL */}
      <Modal3D
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        title="Registrar Novo Checklist / Vistoria"
      >
        <form onSubmit={handleCreateChecklist} className="flex flex-col gap-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo *</label>
              <input
                type="text"
                required
                value={newItem.cavalo}
                onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                placeholder="ABC1D23"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Carretas</label>
              <input
                type="text"
                value={newItem.carretas}
                onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                placeholder="XYZ9E87"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Data Vistoria</label>
              <input
                type="date"
                value={newItem.dataTeste}
                onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Data Vencimento</label>
              <input
                type="date"
                value={newItem.dataVencimento}
                onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Periférico / Sensor</label>
            <input
              type="text"
              value={newItem.periferico}
              onChange={(e) => setNewItem({ ...newItem, periferico: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Salvar Vistoria
            </button>
          </div>
        </form>
      </Modal3D>

      {/* EDIT MODAL */}
      {editingItem && (
        <Modal3D
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`Editar Vistoria: ${editingItem.cavalo}`}
        >
          <form onSubmit={handleUpdateChecklist} className="flex flex-col gap-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cavalo</label>
                <input
                  type="text"
                  value={editingItem.cavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, cavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Data Vencimento</label>
                <input
                  type="date"
                  value={editingItem.dataVencimento || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, dataVencimento: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
              >
                Atualizar Vistoria
              </button>
            </div>
          </form>
        </Modal3D>
      )}

    </div>
  );
}
