import React, { useState, useEffect, useMemo } from 'react';
import {
  Clipboard,
  FileSpreadsheet,
  Copy,
  Check,
  Trash2,
  FileText,
  Truck,
  Search,
  Plus,
  Edit2,
  X,
  User,
  ShieldCheck,
  RefreshCw,
  Mail,
  ChevronLeft,
  Phone,
  Building,
  CheckCircle2,
  FileCheck2,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

export interface RawData {
  dataAverbacao: string;
  origem: string;
  destino: string;
  placaCav: string;
  placaCarr: string;
  nf: string;
  valorNf: string;
  somaVl: string;
  protocolo: string;
}

export interface ExtraData {
  transportadora: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

interface AverbacaoProps {
  onBack?: () => void;
  view?: 'generator' | 'codes';
}

const DATA_PATH = 'averbacao_data/default';

const QUICK_CODES = [
  { label: 'Cápsula', value: '9000000982' },
  { label: 'Máquina', value: '000000901' },
  { label: 'Embalagem', value: '132' }
];

export default function Averbacao({ onBack, view = 'generator' }: AverbacaoProps) {
  const [parsedRows, setParsedRows] = useState<RawData[]>([]);
  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: 'MOEDENSE',
    tecnologia: 'SIGHRA',
    nomeMotorista: '',
    cpf: '',
    telefone: ''
  });

  const [rawInputText, setRawInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const docRef = doc(db, DATA_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.rows) setParsedRows(data.rows);
          if (data.extra) setExtraData(data.extra);
        }
      } catch (err) {
        console.warn("Error loading averbacao data from Firestore:", err);
      }
    };
    loadSavedData();
  }, []);

  const saveToFirestore = async (newRows: RawData[], newExtra: ExtraData) => {
    try {
      const docRef = doc(db, DATA_PATH);
      await setDoc(docRef, {
        rows: newRows,
        extra: newExtra,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Error saving averbacao data to Firestore:", err);
    }
  };

  const handleParseInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInputText.trim()) return;

    const lines = rawInputText.split(/\r?\n/).filter(line => line.trim() !== '');
    const newRows: RawData[] = lines.map(line => {
      const parts = line.split(/\t|;/).map(p => p.trim());
      return {
        dataAverbacao: parts[0] || new Date().toLocaleDateString('pt-BR'),
        origem: parts[1] || 'SANTA LUZIA',
        destino: parts[2] || 'LONDRINA',
        placaCav: parts[3] || '',
        placaCarr: parts[4] || '',
        nf: parts[5] || '',
        valorNf: parts[6] || 'R$ 0,00',
        somaVl: parts[7] || 'R$ 0,00',
        protocolo: parts[8] || 'AVB-PENDENTE'
      };
    });

    const updatedRows = [...parsedRows, ...newRows];
    setParsedRows(updatedRows);
    saveToFirestore(updatedRows, extraData);
    setRawInputText('');
    setShowPasteModal(false);
  };

  const handleCopyCode = (val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedCode(val);
      setTimeout(() => setCopiedCode(null), 1500);
    });
  };

  const handleClearAll = async () => {
    if (window.confirm("Confirmar exclusão de todas as averbações registradas?")) {
      setParsedRows([]);
      await saveToFirestore([], extraData);
    }
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
                PGR COMMAND CENTER 3D • MÓDULO SEGUROS & APÓLICES
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <FileCheck2 size={24} className="text-sky-400" />
              AVERBAÇÃO E APÓLICES DIGITAIS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> COLAR TSV / EXCEL
          </button>
          {parsedRows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} /> LIMPAR
            </button>
          )}
        </div>
      </GlassPanel3D>

      {/* QUICK CODES ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_CODES.map((code, idx) => (
          <GlassPanel3D key={idx} className="p-4 flex items-center justify-between" variant="metallic">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{code.label}</span>
              <h4 className="text-lg font-mono font-black text-white">{code.value}</h4>
            </div>
            <button
              onClick={() => handleCopyCode(code.value)}
              className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all cursor-pointer"
            >
              {copiedCode === code.value ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </GlassPanel3D>
        ))}
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="Total de Registros"
          value={parsedRows.length}
          subtitle="Sincronizado Firestore"
          icon={FileCheck2}
          status="info"
        />
        <MetricCard3D
          title="Transportadora Ativa"
          value={extraData.transportadora}
          subtitle="Apólice Corrente"
          icon={Building}
          status="normal"
        />
        <MetricCard3D
          title="Tecnologia Rastreador"
          value={extraData.tecnologia}
          subtitle="Integração Telemetria"
          icon={Shield}
          status="normal"
        />
      </div>

      {/* FILTER PANEL */}
      <FilterPanel3D
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filtrar por placa, nota fiscal ou protocolo de averbação..."
      />

      {/* MAIN TABLE */}
      <HUDPanel title={`Lista de Registros de Averbação (${parsedRows.length})`} badge="SEGUROS PGR">
        {parsedRows.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhuma averbação registrada. Clique em "Colar TSV / Excel" para adicionar dados.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Origem / Destino</th>
                  <th className="py-3 px-4">Placas</th>
                  <th className="py-3 px-4">Nota Fiscal</th>
                  <th className="py-3 px-4">Valor N.F.</th>
                  <th className="py-3 px-4">Protocolo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
                {parsedRows.filter(r => {
                  const q = searchTerm.toLowerCase();
                  return (
                    r.placaCav.toLowerCase().includes(q) ||
                    r.placaCarr.toLowerCase().includes(q) ||
                    r.nf.toLowerCase().includes(q) ||
                    r.protocolo.toLowerCase().includes(q)
                  );
                }).map((row, idx) => (
                  <tr key={idx} className="hover:bg-sky-500/10 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{row.dataAverbacao}</td>
                    <td className="py-3 px-4 font-bold text-white uppercase">{row.origem} ➔ {row.destino}</td>
                    <td className="py-3 px-4 font-bold text-sky-300 uppercase">{row.placaCav} / {row.placaCarr}</td>
                    <td className="py-3 px-4 text-amber-300 font-bold">N.F. {row.nf}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{row.valorNf}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator3D status="normal" label={row.protocolo} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HUDPanel>

      {/* TSV INPUT MODAL */}
      <Modal3D
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        title="Importar Dados de Averbação (TSV / Excel)"
      >
        <form onSubmit={handleParseInput} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cole os dados copiados do Excel ou Planilha (separados por tabulação):</label>
            <textarea
              rows={8}
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder="Data	Origem	Destino	Cavalo	Carreta	NF	ValorNF	SomaValores	Protocolo"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Processar e Salvar
            </button>
          </div>
        </form>
      </Modal3D>

    </div>
  );
}
