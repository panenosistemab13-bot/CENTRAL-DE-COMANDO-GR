import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Trash2, 
  Edit3, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { parseISO, differenceInDays } from 'date-fns';
import TerceirosEscala from '../TerceirosEscala';

export interface DispoMobileRow {
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
  pendencia?: string;
  checkList?: string;
}

const DISPO_COLUMNS = [
  'MÊS', 'ORIGEM', 'DIA', 'DATA', 'CONTATO WHATS', 'HORA LIBERADO', 'STATUS',
  'MODELO CARRETA', 'MODELO CAVALO', 'FEZ CONTATO', 'DESTINO', 'TRANSPORTADOR',
  'CAVALO', 'CARRETA', 'PALLETS', 'PBT (TON)', 'M3', 'CATEGORIA', 'TECNOLOGIA',
  'CONDUTOR', 'CPF', 'RG / SAP', 'CNH', 'TELEFONE', 'VIGÊNCIA DO CADASTRO',
  'CÓDIGO DA TRANSPORTADORA', 'ID DA CARGA / LACRE EXPORTAÇÃO',
  'ESTADO MOTORISTA', 'ESTADO CAVALO', 'ESTADO CARRETA', 'LINHA 31', 'PENDÊNCIA', 'CHECK LIST'
];

export const formatPlateMobile = (plateStr: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{3}[A-Z0-9]{4}$/.test(clean)) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return plateStr.trim().toUpperCase();
};

export default function MobileEscala({ onBack }: { onBack?: () => void }) {
  const [mobileSubTab, setMobileSubTab] = useState<'disponibilidade' | 'terceiros' | 'motoristas'>('disponibilidade');
  const [rows, setRows] = useState<DispoMobileRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [motoristas3C, setMotoristas3C] = useState<any[]>([]);
  
  // Modal State for Add / Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<DispoMobileRow | null>(null);

  // New Row Form
  const [formOrigem, setFormOrigem] = useState('SANTA LUZIA');
  const [formDestino, setFormDestino] = useState('');
  const [formCavalo, setFormCavalo] = useState('');
  const [formCarreta, setFormCarreta] = useState('');
  const [formMotorista, setFormMotorista] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formStatus, setFormStatus] = useState('LIBERADO CARREGAMENTO');
  const [formPallets, setFormPallets] = useState('28');
  const [formTon, setFormTon] = useState('30');
  const [formTransportador, setFormTransportador] = useState('3C');

  // Load checklist items
  useEffect(() => {
    try {
      const chkRef = ref(rtdb, 'checklist_veiculos');
      const unsub = onValue(chkRef, (snap) => {
        const val = snap.val();
        if (val) {
          setChecklistItems(Object.entries(val).map(([k, v]: [string, any]) => ({ id: k, ...v })));
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load motoristas 3C
  useEffect(() => {
    try {
      const motRef = ref(rtdb, 'motoristas_3c');
      const unsub = onValue(motRef, (snap) => {
        const val = snap.val();
        if (val) {
          setMotoristas3C(Object.entries(val).map(([k, v]: [string, any]) => ({ id: k, ...v })));
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Calculate checklist status
  const getPlateChecklist = (cavaloPlate: string) => {
    if (!cavaloPlate) return { status: 'none', label: 'Sem Placa', color: 'bg-zinc-800 text-zinc-400' };
    const clean = cavaloPlate.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const match = checklistItems.find(item => (item.cavalo || '').replace(/[^A-Z0-9]/g, '').toUpperCase() === clean);

    if (!match) return { status: 'none', label: 'Sem Checklist', color: 'bg-zinc-800 text-zinc-400' };
    if (match.statusOverride === 'VENCIDO' || match.statusOverride === 'NEGATIVADO') {
      return { status: 'vencido', label: 'CHECKLIST VENCIDO', color: 'bg-rose-900/90 text-rose-200 border-rose-500/40' };
    }
    return { status: 'ok', label: 'CHECKLIST OK', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/30' };
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Seed sample rows if empty
  useEffect(() => {
    if (rows.length === 0) {
      const now = new Date();
      const todayDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      setRows([
        {
          id: 'row_1',
          mes: 'SET|26',
          origem: 'SANTA LUZIA',
          dia: 'sábado',
          data: todayDate,
          contatoWhats: 'X',
          horaLiberado: '08:30:00',
          status: 'LIBERADO CARREGAMENTO',
          modeloCarreta: 'RODOTREM BAÚ',
          modeloCavalo: 'TRUCADO',
          fezContato: 'SIM',
          destino: 'GUARULHOS - SP',
          transportador: '3C',
          cavalo: 'SCL-3C01',
          carreta: 'BAU-9801',
          pallets: '28',
          ton: '30',
          m3: '110',
          categoria: 'FROTA',
          tecnologia: 'SASCAR',
          conductor: 'ALEXANDRE SILVA',
          cpf: '123.456.789-00',
          rgSap: 'MG-12.345.678',
          cnh: '01234567890',
          telefone: '31988887777',
          vigenciaCadastro: 'FROTA 3C',
          codigoTransportadora: '1000000496',
          idCarga: 'LC-98214',
          estadoMotorista: 'MG',
          estadoCavalo: 'MG',
          estadoCarreta: 'MG',
          checkList: '',
          pendencia: '28/11/2026'
        },
        {
          id: 'row_2',
          mes: 'SET|26',
          origem: 'SANTA LUZIA',
          dia: 'sábado',
          data: todayDate,
          contatoWhats: 'X',
          horaLiberado: '09:15:00',
          status: 'AGUARDANDO DOCA',
          modeloCarreta: 'BAÚ',
          modeloCavalo: 'TRUCADO',
          fezContato: 'SIM',
          destino: 'SUMARÉ - SP',
          transportador: '3C',
          cavalo: 'SCL-3C02',
          carreta: 'BAU-4412',
          pallets: '28',
          ton: '28',
          m3: '105',
          categoria: 'FROTA',
          tecnologia: 'SASCAR',
          conductor: 'MARCOS VINICIUS',
          cpf: '987.654.321-11',
          rgSap: 'MG-98.765.432',
          cnh: '09876543211',
          telefone: '31999998888',
          vigenciaCadastro: 'FROTA 3C',
          codigoTransportadora: '1000000496',
          idCarga: '',
          estadoMotorista: 'MG',
          estadoCavalo: 'MG',
          estadoCarreta: 'MG',
          checkList: '',
          pendencia: '15/10/2026'
        }
      ]);
    }
  }, []);

  // Filtered Rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'liberado' && !r.status.toUpperCase().includes('LIBERADO')) return false;
        if (statusFilter === 'aguardando' && !r.status.toUpperCase().includes('AGUARDANDO')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.cavalo.toLowerCase().includes(q) ||
          r.carreta.toLowerCase().includes(q) ||
          r.conductor.toLowerCase().includes(q) ||
          r.destino.toLowerCase().includes(q) ||
          r.origem.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, statusFilter, searchQuery]);

  // Copy single row in TSV format
  const handleCopyRow = (row: DispoMobileRow) => {
    const tsv = [
      row.mes, row.origem, row.dia, row.data, row.contatoWhats, row.horaLiberado, row.status,
      row.modeloCarreta, row.modeloCavalo, row.fezContato, row.destino, row.transportador,
      formatPlateMobile(row.cavalo), formatPlateMobile(row.carreta), row.pallets, row.ton, row.m3,
      row.categoria, row.tecnologia, row.conductor, row.cpf, row.rgSap, row.cnh, row.telefone,
      row.vigenciaCadastro, row.codigoTransportadora, row.idCarga, row.estadoMotorista,
      row.estadoCavalo, row.estadoCarreta, '', row.pendencia || '', row.checkList || ''
    ].join('\t');

    navigator.clipboard.writeText(tsv);
    setCopiedId(row.id);
    showToast(`Linha de ${row.conductor} copiada para colar no Excel!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all rows
  const handleCopyAll = () => {
    if (rows.length === 0) return;
    const tsv = rows.map(r => [
      r.mes, r.origem, r.dia, r.data, r.contatoWhats, r.horaLiberado, r.status,
      r.modeloCarreta, r.modeloCavalo, r.fezContato, r.destino, r.transportador,
      formatPlateMobile(r.cavalo), formatPlateMobile(r.carreta), r.pallets, r.ton, r.m3,
      r.categoria, r.tecnologia, r.conductor, r.cpf, r.rgSap, r.cnh, r.telefone,
      r.vigenciaCadastro, r.codigoTransportadora, r.idCarga, r.estadoMotorista,
      r.estadoCavalo, r.estadoCarreta, '', r.pendencia || '', r.checkList || ''
    ].join('\t')).join('\n');

    navigator.clipboard.writeText(tsv);
    showToast(`${rows.length} linhas copiadas para a área de transferência!`);
  };

  // Export XLSX
  const handleExportXLSX = () => {
    if (rows.length === 0) return;
    const data = [
      [...DISPO_COLUMNS],
      ...rows.map(r => [
        r.mes, r.origem, r.dia, r.data, r.contatoWhats, r.horaLiberado, r.status,
        r.modeloCarreta, r.modeloCavalo, r.fezContato, r.destino, r.transportador,
        formatPlateMobile(r.cavalo), formatPlateMobile(r.carreta), r.pallets, r.ton, r.m3,
        r.categoria, r.tecnologia, r.conductor, r.cpf, r.rgSap, r.cnh, r.telefone,
        r.vigenciaCadastro, r.codigoTransportadora, r.idCarga, r.estadoMotorista,
        r.estadoCavalo, r.estadoCarreta, '', r.pendencia || '', r.checkList || ''
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidade');
    const fileName = `DISPONIBILIDADE_MOBILE_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('Planilha Excel (.xlsx) gerada com sucesso!');
  };

  // Add / Save row
  const handleSaveRow = () => {
    if (!formCavalo.trim() || !formMotorista.trim()) {
      showToast('Preencha a Placa do Cavalo e o Condutor!');
      return;
    }

    const now = new Date();
    const todayDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    if (editingRow) {
      setRows(prev => prev.map(r => r.id === editingRow.id ? {
        ...r,
        origem: formOrigem,
        destino: formDestino.toUpperCase(),
        cavalo: formatPlateMobile(formCavalo),
        carreta: formatPlateMobile(formCarreta),
        conductor: formMotorista.toUpperCase(),
        telefone: formTelefone,
        status: formStatus,
        pallets: formPallets,
        ton: formTon,
        transportador: formTransportador
      } : r));
      showToast('Registro atualizado com sucesso!');
    } else {
      const newRow: DispoMobileRow = {
        id: `row_${Date.now()}`,
        mes: 'SET|26',
        origem: formOrigem,
        dia: 'sábado',
        data: todayDate,
        contatoWhats: 'X',
        horaLiberado: timeStr,
        status: formStatus,
        modeloCarreta: 'RODOTREM BAÚ',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: formDestino.toUpperCase() || 'GUARULHOS - SP',
        transportador: formTransportador,
        cavalo: formatPlateMobile(formCavalo),
        carreta: formatPlateMobile(formCarreta),
        pallets: formPallets,
        ton: formTon,
        m3: '110',
        categoria: 'FROTA',
        tecnologia: 'SASCAR',
        conductor: formMotorista.toUpperCase(),
        cpf: '',
        rgSap: '',
        cnh: '',
        telefone: formTelefone,
        vigenciaCadastro: 'FROTA 3C',
        codigoTransportadora: '1000000496',
        idCarga: '',
        estadoMotorista: 'MG',
        estadoCavalo: 'MG',
        estadoCarreta: 'MG',
        checkList: '',
        pendencia: ''
      };
      setRows(prev => [newRow, ...prev]);
      showToast('Novo veículo adicionado à Escala!');
    }

    setShowAddModal(false);
    setEditingRow(null);
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

      {/* MOBILE SEGMENTED BAR */}
      <div className="sticky top-0 z-30 bg-[#160a04]/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-white/10">
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setMobileSubTab('disponibilidade')}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider transition-all",
              mobileSubTab === 'disponibilidade'
                ? "bg-[#B32025] text-white shadow-md"
                : "text-[#c2a67e] hover:text-white"
            )}
          >
            1. Escala
          </button>
          <button
            onClick={() => setMobileSubTab('terceiros')}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1",
              mobileSubTab === 'terceiros'
                ? "bg-emerald-600 text-white shadow-md"
                : "text-[#c2a67e] hover:text-white"
            )}
          >
            2. Terceiros
            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-black/40 text-emerald-300 font-mono">
              PDF
            </span>
          </button>
          <button
            onClick={() => setMobileSubTab('motoristas')}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider transition-all",
              mobileSubTab === 'motoristas'
                ? "bg-amber-600 text-white shadow-md"
                : "text-[#c2a67e] hover:text-white"
            )}
          >
            3. Motoristas
          </button>
        </div>
      </div>

      {mobileSubTab === 'disponibilidade' ? (
        <div className="px-4 pt-3 space-y-3.5 max-w-full overflow-x-hidden">
          {/* QUICK METRICS BAR */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1c0d05] border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-mono uppercase text-[#c2a67e] block">Total</span>
              <span className="text-lg font-sans font-black text-white">{rows.length}</span>
            </div>
            <div className="bg-[#1c0d05] border border-emerald-500/20 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-mono uppercase text-emerald-400 block">Liberados</span>
              <span className="text-lg font-sans font-black text-emerald-300">
                {rows.filter(r => r.status.toUpperCase().includes('LIBERADO')).length}
              </span>
            </div>
            <div className="bg-[#1c0d05] border border-amber-500/20 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-mono uppercase text-amber-400 block">Aguardando</span>
              <span className="text-lg font-sans font-black text-amber-300">
                {rows.filter(r => !r.status.toUpperCase().includes('LIBERADO')).length}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS (EXCEL & ADD) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingRow(null);
                setFormOrigem('SANTA LUZIA');
                setFormDestino('');
                setFormCavalo('');
                setFormCarreta('');
                setFormMotorista('');
                setFormTelefone('');
                setShowAddModal(true);
              }}
              className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-[#B32025] to-[#800609] text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-white/20 active:scale-97 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Novo Veículo</span>
            </button>

            <button
              onClick={handleExportXLSX}
              className="py-3 px-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md border border-emerald-400/30 active:scale-97 cursor-pointer"
              title="Baixar planilha Excel .xlsx"
            >
              <FileSpreadsheet size={16} />
              <span>Excel</span>
            </button>

            <button
              onClick={handleCopyAll}
              className="py-3 px-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md border border-white/10 active:scale-97 cursor-pointer"
              title="Copiar todas as linhas"
            >
              <Copy size={16} />
              <span>Copiar</span>
            </button>
          </div>

          {/* SEARCH & FILTER */}
          <div className="space-y-2">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por placa, motorista ou destino..."
                className="w-full bg-[#160a04] text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'liberado', label: 'Liberados' },
                { id: 'aguardando', label: 'Aguardando' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                    statusFilter === f.id
                      ? "bg-[#B32025] text-white border-white/30"
                      : "bg-white/5 text-[#c2a67e] border-white/10"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* CARD LIST */}
          <div className="space-y-3">
            {filteredRows.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-[#160a04] border border-white/10">
                <Truck size={32} className="mx-auto mb-2 text-[#c2a67e]/40" />
                <p className="text-sm font-sans font-bold text-white">Nenhum veículo encontrado</p>
                <p className="text-xs text-[#c2a67e]/70 mt-1">
                  Adicione um veículo ou limpe os filtros de busca.
                </p>
              </div>
            ) : (
              filteredRows.map((row) => {
                const isExpanded = expandedRowId === row.id;
                const chk = getPlateChecklist(row.cavalo);
                const isLiberado = row.status.toUpperCase().includes('LIBERADO');

                return (
                  <div
                    key={row.id}
                    className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl relative overflow-hidden"
                  >
                    {/* Top Row: Origin -> Destino & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-lg bg-black/50 text-[10px] font-mono text-[#d4bc96] border border-white/5 truncate">
                          {row.origem}
                        </span>
                        <span className="text-[#c2a67e] text-xs">➔</span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-[10px] font-mono font-bold text-amber-200 border border-amber-500/30 truncate">
                          {row.destino}
                        </span>
                      </div>

                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black uppercase tracking-wider border shrink-0",
                        isLiberado
                          ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-950/90 text-amber-300 border-amber-500/40"
                      )}>
                        {row.status}
                      </span>
                    </div>

                    {/* License Plate Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 flex items-center gap-1.5 shadow-inner">
                        <span className="text-[8px] font-mono uppercase text-[#c2a67e]">Cavalo</span>
                        <span className="text-sm font-mono font-black text-white tracking-wider">
                          {formatPlateMobile(row.cavalo) || 'SEM PLACA'}
                        </span>
                      </div>

                      <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 flex items-center gap-1.5 shadow-inner">
                        <span className="text-[8px] font-mono uppercase text-[#c2a67e]">Carreta</span>
                        <span className="text-sm font-mono font-black text-amber-200 tracking-wider">
                          {formatPlateMobile(row.carreta) || 'SEM PLACA'}
                        </span>
                      </div>
                    </div>

                    {/* Driver & Details */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
                      <div className="min-w-0">
                        <div className="text-[9px] font-mono uppercase text-[#c2a67e] flex items-center gap-1">
                          <UserCheck size={11} /> Condutor
                        </div>
                        <h4 className="text-sm font-sans font-black text-white uppercase truncate">
                          {row.conductor || 'CONDUTOR NÃO INFORMADO'}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[9px] font-mono uppercase text-[#c2a67e]">Carga / PBT</div>
                        <span className="text-xs font-mono font-bold text-[#f5ebd6]">
                          {row.pallets || '28'} Plts • {row.ton || '30'} Ton
                        </span>
                      </div>
                    </div>

                    {/* Checklist pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border",
                        chk.color
                      )}>
                        {chk.label}
                      </span>

                      {row.telefone && (
                        <a
                          href={`https://wa.me/55${row.telefone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[10px] font-sans font-bold flex items-center gap-1 border border-emerald-500/30"
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Expandable 33 Columns Mobile Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 pb-3 space-y-2 border-t border-white/10 text-xs font-mono"
                        >
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Mês / Data</span>
                              <span className="text-white font-bold">{row.mes} • {row.data}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Hora Liberado</span>
                              <span className="text-white font-bold">{row.horaLiberado}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Modelo Cavalo/Carreta</span>
                              <span className="text-white font-bold">{row.modeloCavalo} / {row.modeloCarreta}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Transportador</span>
                              <span className="text-white font-bold">{row.transportador}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Tecnologia</span>
                              <span className="text-white font-bold">{row.tecnologia}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">CPF Condutor</span>
                              <span className="text-white font-bold">{row.cpf || '-'}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">RG / SAP</span>
                              <span className="text-white font-bold">{row.rgSap || '-'}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">CNH</span>
                              <span className="text-white font-bold">{row.cnh || '-'}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Vigência Cadastro</span>
                              <span className="text-white font-bold">{row.vigenciaCadastro}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-[#c2a67e] block">Pendência / Checklist</span>
                              <span className="text-white font-bold">{row.pendencia || 'EM DIA'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleCopyRow(row)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-[#B32025] text-white text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === row.id ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copiar Linha</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditingRow(row);
                          setFormOrigem(row.origem);
                          setFormDestino(row.destino);
                          setFormCavalo(row.cavalo);
                          setFormCarreta(row.carreta);
                          setFormMotorista(row.conductor);
                          setFormTelefone(row.telefone);
                          setFormStatus(row.status);
                          setFormPallets(row.pallets);
                          setFormTon(row.ton);
                          setFormTransportador(row.transportador);
                          setShowAddModal(true);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#c2a67e] hover:text-white cursor-pointer"
                        title="Editar registro"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Deseja remover este registro da Escala?')) {
                            setRows(prev => prev.filter(r => r.id !== row.id));
                            showToast('Registro removido!');
                          }
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/80 text-[#c2a67e] hover:text-rose-300 cursor-pointer"
                        title="Excluir registro"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#c2a67e] hover:text-white flex items-center gap-1 cursor-pointer text-[10px] font-sans font-bold"
                      >
                        <span>{isExpanded ? 'Ocultar' : '33 Colunas'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : mobileSubTab === 'terceiros' ? (
        <div className="px-4 pt-3 max-w-full overflow-x-hidden">
          <TerceirosEscala
            checklistItems={checklistItems}
            getChecklistDetails={(cav, car) => ({ checkList: '', pendencia: '' })}
            formatPlateWithHyphen={formatPlateMobile}
            getMonthAbbrev={() => 'SET|26'}
            getDayOfWeek={() => 'sábado'}
          />
        </div>
      ) : (
        /* Tab 3: Motoristas 3C */
        <div className="px-4 pt-3 space-y-3 max-w-full overflow-x-hidden">
          <div className="bg-[#160a04] p-4 rounded-3xl border border-white/10">
            <h3 className="text-sm font-sans font-black uppercase text-white mb-1">
              Base de Motoristas 3C ({motoristas3C.length})
            </h3>
            <p className="text-xs text-[#c2a67e]">
              Dados de CPF e RG integrados automaticamente na Escala.
            </p>
          </div>

          <div className="space-y-2.5">
            {motoristas3C.map((mot) => (
              <div
                key={mot.id}
                className="p-3.5 rounded-2xl bg-[#1a0c05] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-sans font-black uppercase text-white truncate">
                    {mot.nome || mot.conductor}
                  </h4>
                  <div className="text-[10px] font-mono text-[#c2a67e] mt-0.5">
                    CPF: {mot.cpf || '-'} • RG: {mot.rg || '-'}
                  </div>
                </div>

                {mot.telefone && (
                  <a
                    href={`tel:${mot.telefone}`}
                    className="p-2 rounded-xl bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 shrink-0"
                  >
                    <Phone size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE ADD / EDIT MODAL BOTTOM SHEET */}
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
                  {editingRow ? 'Editar Veículo' : 'Novo Veículo na Escala'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Origem
                  </label>
                  <input
                    type="text"
                    value={formOrigem}
                    onChange={(e) => setFormOrigem(e.target.value)}
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                  />
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
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Placa Cavalo
                    </label>
                    <input
                      type="text"
                      value={formCavalo}
                      onChange={(e) => setFormCavalo(e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono"
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
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Nome do Condutor
                  </label>
                  <input
                    type="text"
                    value={formMotorista}
                    onChange={(e) => setFormMotorista(e.target.value.toUpperCase())}
                    placeholder="NOME COMPLETO"
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                    >
                      <option value="LIBERADO CARREGAMENTO">LIBERADO</option>
                      <option value="AGUARDANDO DOCA">AGUARDANDO DOCA</option>
                      <option value="EM CARREGAMENTO">EM CARREGAMENTO</option>
                      <option value="VIAGEM INICIADA">VIAGEM INICIADA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Celular / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(e.target.value)}
                      placeholder="31999998888"
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Pallets
                    </label>
                    <input
                      type="text"
                      value={formPallets}
                      onChange={(e) => setFormPallets(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      PBT (Ton)
                    </label>
                    <input
                      type="text"
                      value={formTon}
                      onChange={(e) => setFormTon(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
                    />
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
                  onClick={handleSaveRow}
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
