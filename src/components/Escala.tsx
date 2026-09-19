import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Trash2, 
  Plus, 
  Search,
  Truck,
  Users,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Download,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

export interface DispoRow {
  id: string;
  mes: string;
  origem: string;
  dia: string;
  data: string;
  contatoWhats: string;
  horaLiberado: string;
  status: string;
  modeloCarreta: string;
  modeloCavalo: string;
  fezContato: string;
  destino: string;
  transportador: string;
  cavalo: string;
  carreta: string;
  pallets: string;
  ton: string;
  m3: string;
  categoria: string;
  tecnologia: string;
  conductor: string;
  cpf: string;
  rgSap: string;
  cnh: string;
  telefone: string;
  vigenciaCadastro: string;
  codigoTransportadora: string;
  idCarga: string;
  estadoMotorista: string;
  estadoCavalo: string;
  estadoCarreta: string;
  checkList: string;
  pendencia: string;
}

export interface EscalaProps {
  onBack?: () => void;
}

export function normalizeDestino(destinoRaw?: string): string {
  if (!destinoRaw) return 'OUTROS';
  return destinoRaw.trim().toUpperCase();
}

export default function Escala({ onBack }: EscalaProps) {
  const [rows, setRows] = useState<DispoRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newRow, setNewRow] = useState<Partial<DispoRow>>({
    mes: 'SETEMBRO',
    origem: 'SANTA LUZIA',
    dia: 'QUARTA',
    data: new Date().toLocaleDateString('pt-BR'),
    status: 'LIBERADO',
    destino: 'GUARULHOS',
    transportador: 'FROTA 3C',
    cavalo: '',
    carreta: '',
    conductor: '',
    telefone: ''
  });

  useEffect(() => {
    const dispoRef = ref(db, 'dispo_rows_v2');
    const unsubscribe = onValue(dispoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: DispoRow[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setRows(parsed);
      } else {
        setRows([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateDispo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.cavalo) return;

    const dispoRef = ref(db, 'dispo_rows_v2');
    const newRef = push(dispoRef);
    await set(newRef, newRow);

    setIsAddingNew(false);
    setNewRow({
      mes: 'SETEMBRO',
      origem: 'SANTA LUZIA',
      dia: 'QUARTA',
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'LIBERADO',
      destino: 'GUARULHOS',
      transportador: 'FROTA 3C',
      cavalo: '',
      carreta: '',
      conductor: '',
      telefone: ''
    });
  };

  const handleDeleteDispo = async (id: string) => {
    if (window.confirm("Confirmar remoção de escala do pátio?")) {
      const itemRef = ref(db, `dispo_rows_v2/${id}`);
      await remove(itemRef);
    }
  };

  const filteredRows = rows.filter(r => {
    const query = searchTerm.toLowerCase();
    return (
      (r.cavalo && r.cavalo.toLowerCase().includes(query)) ||
      (r.carreta && r.carreta.toLowerCase().includes(query)) ||
      (r.conductor && r.conductor.toLowerCase().includes(query)) ||
      (r.destino && r.destino.toLowerCase().includes(query)) ||
      (r.transportador && r.transportador.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="led-status led-status-blue" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
                PGR COMMAND CENTER 3D • ESCALA E DISPONIBILIDADE
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Calendar size={24} className="text-sky-400" />
              ESCALA OPERACIONAL E DISPONIBILIDADE DE PÁTIO
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> NOVO AGENDAMENTO
        </button>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="Veículos Escalados"
          value={rows.length}
          subtitle="Base RTDB Sync"
          icon={Calendar}
          status="info"
        />
        <MetricCard3D
          title="Frota Liberada"
          value={rows.filter(r => r.status === 'LIBERADO').length}
          subtitle="Aptos para Viagem"
          icon={CheckCircle2}
          status="normal"
        />
        <MetricCard3D
          title="Motoristas Escalados"
          value={rows.filter(r => Boolean(r.conductor)).length}
          subtitle="Tripulação Confirmada"
          icon={Users}
          status="normal"
        />
      </div>

      {/* FILTER PANEL */}
      <FilterPanel3D
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar na escala por motorista, placa, transportador ou destino..."
      />

      {/* MAIN TABLE */}
      <HUDPanel title={`Tabela de Escala de Pátio (${filteredRows.length})`} badge="DISPONIBILIDADE">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs">Carregando escala de pátio...</div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhum registro de escala encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Data / Dia</th>
                  <th className="py-3 px-4">Motorista</th>
                  <th className="py-3 px-4">Cavalo / Carreta</th>
                  <th className="py-3 px-4">Transportador</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-sky-500/10 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{row.data} ({row.dia})</td>
                    <td className="py-3 px-4 font-bold text-white uppercase">{row.conductor || 'NÃO INFORMADO'}</td>
                    <td className="py-3 px-4 font-bold text-sky-300 uppercase">{row.cavalo} / {row.carreta || '-'}</td>
                    <td className="py-3 px-4 text-slate-300 uppercase">{row.transportador}</td>
                    <td className="py-3 px-4 font-bold text-amber-300 uppercase">{row.destino}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator3D
                        status={row.status === 'LIBERADO' ? 'normal' : 'warning'}
                        label={row.status || 'PENDENTE'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDispo(row.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer border border-rose-500/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HUDPanel>

      {/* CREATE MODAL */}
      <Modal3D
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        title="Novo Agendamento de Escala"
      >
        <form onSubmit={handleCreateDispo} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nome do Motorista</label>
            <input
              type="text"
              value={newRow.conductor}
              onChange={(e) => setNewRow({ ...newRow, conductor: e.target.value })}
              placeholder="Nome do motorista..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo *</label>
              <input
                type="text"
                required
                value={newRow.cavalo}
                onChange={(e) => setNewRow({ ...newRow, cavalo: e.target.value.toUpperCase() })}
                placeholder="ABC1D23"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Carreta</label>
              <input
                type="text"
                value={newRow.carreta}
                onChange={(e) => setNewRow({ ...newRow, carreta: e.target.value.toUpperCase() })}
                placeholder="XYZ9E87"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Transportador</label>
              <input
                type="text"
                value={newRow.transportador}
                onChange={(e) => setNewRow({ ...newRow, transportador: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destino</label>
              <input
                type="text"
                value={newRow.destino}
                onChange={(e) => setNewRow({ ...newRow, destino: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
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
              Salvar Escala
            </button>
          </div>
        </form>
      </Modal3D>

    </div>
  );
}
