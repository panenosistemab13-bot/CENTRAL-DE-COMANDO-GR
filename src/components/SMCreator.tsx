import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Trash2, 
  Mail, 
  Plus, 
  Check, 
  Copy,
  ChevronLeft,
  Truck,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Send,
  Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

interface SMRow {
  dataSaida: string;
  motorista: string;
  placa: string;
  bau1: string;
  bau2: string;
  trecho: string;
  valorNf: string;
  ok?: boolean;
}

interface SMCreatorProps {
  view?: 'generator' | 'codes';
  onBack?: () => void;
}

export default function SMCreator({ view = 'generator', onBack }: SMCreatorProps) {
  const [rows, setRows] = useState<SMRow[]>([]);
  const [filterText, setFilterText] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [isAddingRow, setIsAddingRow] = useState(false);

  const [newRow, setNewRow] = useState<SMRow>({
    dataSaida: new Date().toLocaleDateString('pt-BR'),
    motorista: '',
    placa: '',
    bau1: '',
    bau2: '',
    trecho: 'SANTA LUZIA X GUARULHOS',
    valorNf: 'R$ 0,00'
  });

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.motorista || !newRow.placa) return;

    setRows([...rows, newRow]);
    setIsAddingRow(false);
    setNewRow({
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: 'SANTA LUZIA X GUARULHOS',
      valorNf: 'R$ 0,00'
    });
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleCopySummary = () => {
    if (rows.length === 0) return;
    const text = rows.map((r, i) => `${i + 1}. ${r.dataSaida} | ${r.motorista} | CAV: ${r.placa} | BAÚ: ${r.bau1}/${r.bau2} | TRECHO: ${r.trecho} | VALOR: ${r.valorNf}`).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

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
                PGR COMMAND CENTER 3D • SOLICITAÇÃO DE MONITORAMENTO
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Send size={24} className="text-sky-400" />
              GERADOR DE S.M. (SOLICITAÇÃO DE MONITORAMENTO)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingRow(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> ADICIONAR SOLICITAÇÃO
          </button>
          {rows.length > 0 && (
            <button
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              {copiedText ? <Check size={16} /> : <Copy size={16} />}
              {copiedText ? "COPIADO!" : "COPIAR SOLICITAÇÕES"}
            </button>
          )}
        </div>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="S.M. Geradas"
          value={rows.length}
          subtitle="Lote Atual"
          icon={Send}
          status="info"
        />
        <MetricCard3D
          title="Rotas Diretas"
          value={rows.filter(r => !r.trecho.includes('RETORNO')).length}
          subtitle="Saídas de Base"
          icon={Truck}
          status="normal"
        />
        <MetricCard3D
          title="Prontas para Envio"
          value={rows.length}
          subtitle="Formato Padronizado"
          icon={CheckCircle2}
          status="normal"
        />
      </div>

      {/* FILTER PANEL */}
      <FilterPanel3D
        searchQuery={filterText}
        onSearchChange={setFilterText}
        searchPlaceholder="Filtrar por motorista, placa, trecho..."
      />

      {/* MAIN TABLE */}
      <HUDPanel title={`Fila de Solicitações de Monitoramento (${rows.length})`} badge="S.M. REALTIME">
        {rows.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhuma S.M. adicionada. Clique no botão acima para adicionar.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Data Saída</th>
                  <th className="py-3 px-4">Motorista</th>
                  <th className="py-3 px-4">Placa Cavalo / Baú</th>
                  <th className="py-3 px-4">Trecho Operacional</th>
                  <th className="py-3 px-4">Valor N.F.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
                {rows.filter(r => {
                  const q = filterText.toLowerCase();
                  return (
                    r.motorista.toLowerCase().includes(q) ||
                    r.placa.toLowerCase().includes(q) ||
                    r.trecho.toLowerCase().includes(q)
                  );
                }).map((row, idx) => (
                  <tr key={idx} className="hover:bg-sky-500/10 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{row.dataSaida}</td>
                    <td className="py-3 px-4 font-bold text-white uppercase">{row.motorista}</td>
                    <td className="py-3 px-4 font-bold text-sky-300 uppercase">{row.placa} ({row.bau1}/{row.bau2 || '-'})</td>
                    <td className="py-3 px-4 font-bold text-amber-300 uppercase">{row.trecho}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{row.valorNf}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRow(idx)}
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
        isOpen={isAddingRow}
        onClose={() => setIsAddingRow(false)}
        title="Nova Solicitação de Monitoramento (S.M.)"
      >
        <form onSubmit={handleAddRow} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nome do Motorista *</label>
            <input
              type="text"
              required
              value={newRow.motorista}
              onChange={(e) => setNewRow({ ...newRow, motorista: e.target.value })}
              placeholder="Nome do motorista..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo *</label>
              <input
                type="text"
                required
                value={newRow.placa}
                onChange={(e) => setNewRow({ ...newRow, placa: e.target.value.toUpperCase() })}
                placeholder="ABC1D23"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Baú 1</label>
              <input
                type="text"
                value={newRow.bau1}
                onChange={(e) => setNewRow({ ...newRow, bau1: e.target.value.toUpperCase() })}
                placeholder="XYZ9E87"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Baú 2</label>
              <input
                type="text"
                value={newRow.bau2}
                onChange={(e) => setNewRow({ ...newRow, bau2: e.target.value.toUpperCase() })}
                placeholder="KLM4P56"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Trecho Operacional</label>
              <input
                type="text"
                value={newRow.trecho}
                onChange={(e) => setNewRow({ ...newRow, trecho: e.target.value.toUpperCase() })}
                placeholder="SANTA LUZIA X GUARULHOS"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Valor Nota Fiscal</label>
              <input
                type="text"
                value={newRow.valorNf}
                onChange={(e) => setNewRow({ ...newRow, valorNf: e.target.value })}
                placeholder="R$ 150.000,00"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddingRow(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Adicionar S.M.
            </button>
          </div>
        </form>
      </Modal3D>

    </div>
  );
}
