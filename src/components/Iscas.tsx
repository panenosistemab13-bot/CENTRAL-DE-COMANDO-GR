import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  FileSpreadsheet, 
  Building2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Search, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  ClipboardPaste, 
  Maximize2, 
  RotateCcw,
  Sliders,
  Table as TableIcon,
  TrendingUp,
  Award,
  Layers,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const GUEST_USER_ID = 'guest_user';

interface IscaItem {
  id: string;
  iscaNumber: string;
  status: string;
  destino: string;
  cavalo: string;
  nf: string;
  responsavel: string;
}

const STATUS_CATEGORIES = [
  'EXTRAVIADAS',
  'EM ROTA IDA',
  'EM ROTA VOLTA',
  'NO DESTINO',
  'EM PREPARAÇÃO',
  'POSSÍVEL EXTRAVIO',
  'NA GARANTIA',
  'EXPIROU A VALIDADE'
];

const EXECUTIVE_COLORS: Record<string, { main: string; light: string; border: string; bg: string; badge: string }> = {
  'EXTRAVIADAS': { main: '#dc2626', light: '#fca5a5', border: 'border-red-200', bg: 'bg-red-50/80', badge: 'bg-red-100 text-red-800' },
  'EM ROTA IDA': { main: '#2563eb', light: '#93c5fd', border: 'border-blue-200', bg: 'bg-blue-50/80', badge: 'bg-blue-100 text-blue-800' },
  'EM ROTA VOLTA': { main: '#0284c7', light: '#7dd3fc', border: 'border-sky-200', bg: 'bg-sky-50/80', badge: 'bg-sky-100 text-sky-800' },
  'NO DESTINO': { main: '#059669', light: '#6ee7b7', border: 'border-emerald-200', bg: 'bg-emerald-50/80', badge: 'bg-emerald-100 text-emerald-800' },
  'EM PREPARAÇÃO': { main: '#d97706', light: '#fde68a', border: 'border-amber-200', bg: 'bg-amber-50/80', badge: 'bg-amber-100 text-amber-800' },
  'POSSÍVEL EXTRAVIO': { main: '#ea580c', light: '#fdba74', border: 'border-orange-200', bg: 'bg-orange-50/80', badge: 'bg-orange-100 text-orange-800' },
  'NA GARANTIA': { main: '#7c3aed', light: '#c4b5fd', border: 'border-purple-200', bg: 'bg-purple-50/80', badge: 'bg-purple-100 text-purple-800' },
  'EXPIROU A VALIDADE': { main: '#475569', light: '#cbd5e1', border: 'border-slate-200', bg: 'bg-slate-50/80', badge: 'bg-slate-100 text-slate-800' }
};

export default function Iscas() {
  const [iscas, setIscas] = useState<IscaItem[]>([]);
  const [pasteContent, setPasteContent] = useState('');
  const [santaLuziaInput, setSantaLuziaInput] = useState('');
  const [santaLuziaList, setSantaLuziaList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('ALL');

  // Firebase Realtime Listener
  useEffect(() => {
    const iscasRef = ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`);
    const unsubIscas = onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setIscas(list);
      } else {
        const seed: Omit<IscaItem, 'id'>[] = [
          { iscaNumber: 'R100000555', status: 'EM ROTA IDA', destino: 'PINHAIS', cavalo: 'SBK-5A52', nf: '2938195', responsavel: 'WEBER' },
          { iscaNumber: 'R100000577', status: 'NO DESTINO', destino: 'RIO DE JANEIRO (RJ)', cavalo: 'SAR-8D82', nf: '2898921', responsavel: 'BGEF' },
          { iscaNumber: 'R100000617', status: 'EM PREPARAÇÃO', destino: 'VIANA', cavalo: 'SBK-5B52', nf: '5138918', responsavel: 'BGEF' },
          { iscaNumber: 'R100000673', status: 'POSSÍVEL EXTRAVIO', destino: 'RIO DE JANEIRO (RJ)', cavalo: 'SAR-7D82', nf: '2898920', responsavel: 'BGEF' },
          { iscaNumber: 'R100000679', status: 'EXTRAVIADAS', destino: 'BRASILIA', cavalo: 'SBK-5C82', nf: '2898916', responsavel: 'BGEF' },
          { iscaNumber: 'R100000698', status: 'NA GARANTIA', destino: 'BRASILIA', cavalo: 'SBK-5C22', nf: '2898917', responsavel: 'BGEF' },
          { iscaNumber: 'R100000712', status: 'EXPIROU A VALIDADE', destino: 'PINHAIS', cavalo: 'ABC-1234', nf: '2938199', responsavel: 'CARLOS' },
          { iscaNumber: 'R100000755', status: 'EM ROTA VOLTA', destino: 'SANTA LUZIA/MG', cavalo: 'XYZ-9876', nf: '2938200', responsavel: 'MARIO' }
        ];
        seed.forEach((item, idx) => {
          const id = (Date.now() + idx).toString();
          set(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2/${id}`), { ...item, id });
        });
      }
    });

    const slRef = ref(rtdb, `users/${GUEST_USER_ID}/santa_luzia_numbers`);
    const unsubSL = onValue(slRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setSantaLuziaList(data);
        setSantaLuziaInput(data.join(', '));
      } else {
        const defaultSl = ['R100000555', 'R100000617', 'R100000755'];
        setSantaLuziaList(defaultSl);
        setSantaLuziaInput(defaultSl.join(', '));
      }
    });

    return () => {
      unsubIscas();
      unsubSL();
    };
  }, []);

  // Process pasted spreadsheet
  const handleProcessPaste = async () => {
    if (!pasteContent.trim()) {
      alert('Por favor, cole as informações da planilha antes de importar.');
      return;
    }

    const lines = pasteContent.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return;

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(/\t|,/).map(h => h.trim());
    
    const iscaIdx = headers.findIndex(h => h.includes('isca') || h.includes('numero') || h.includes('rastreador'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('situacao') || h.includes('estado'));
    const destinoIdx = headers.findIndex(h => h.includes('destino') || h.includes('cidade') || h.includes('rota'));
    const cavaloIdx = headers.findIndex(h => h.includes('cavalo') || h.includes('placa') || h.includes('veiculo'));
    const nfIdx = headers.findIndex(h => h.includes('nf') || h.includes('nota') || h.includes('fatura'));
    const respIdx = headers.findIndex(h => h.includes('responsavel') || h.includes('motorista') || h.includes('nome'));

    const startIndex = (iscaIdx !== -1 || statusIdx !== -1 || destinoIdx !== -1) ? 1 : 0;
    const newItems: Record<string, any> = {};

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(/\t|,/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length === 0 || !cols[0]) continue;

      let iscaNumber = iscaIdx !== -1 && cols[iscaIdx] ? cols[iscaIdx] : (cols[0] || `R100000${Math.floor(100+Math.random()*900)}`);
      let rawStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx].toUpperCase() : (cols[1] || 'EM PREPARAÇÃO');
      let destino = destinoIdx !== -1 && cols[destinoIdx] ? cols[destinoIdx].toUpperCase() : (cols[2] || 'DESTINO GERAL');
      let cavalo = cavaloIdx !== -1 && cols[cavaloIdx] ? cols[cavaloIdx].toUpperCase() : (cols[3] || 'PADRÃO');
      let nf = nfIdx !== -1 && cols[nfIdx] ? cols[nfIdx] : (cols[4] || '000000');
      let responsavel = respIdx !== -1 && cols[respIdx] ? cols[respIdx].toUpperCase() : (cols[5] || 'EQUIPE');

      let normalizedStatus = 'EM PREPARAÇÃO';
      const upperSt = rawStatus.toUpperCase();
      if (upperSt.includes('EXTRAVI') && upperSt.includes('POSSIB')) normalizedStatus = 'POSSÍVEL EXTRAVIO';
      else if (upperSt.includes('EXTRAVI')) normalizedStatus = 'EXTRAVIADAS';
      else if (upperSt.includes('IDA') || upperSt.includes('ROTA IDA')) normalizedStatus = 'EM ROTA IDA';
      else if (upperSt.includes('VOLTA') || upperSt.includes('ROTA VOLTA')) normalizedStatus = 'EM ROTA VOLTA';
      else if (upperSt.includes('DESTINO') || upperSt.includes('CHEGOU')) normalizedStatus = 'NO DESTINO';
      else if (upperSt.includes('GARANTIA')) normalizedStatus = 'NA GARANTIA';
      else if (upperSt.includes('VALIDADE') || upperSt.includes('VENCID') || upperSt.includes('EXPIROU')) normalizedStatus = 'EXPIROU A VALIDADE';
      else if (upperSt.includes('PREPAR')) normalizedStatus = 'EM PREPARAÇÃO';

      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      newItems[id] = {
        id,
        iscaNumber: iscaNumber.toUpperCase(),
        status: normalizedStatus,
        destino,
        cavalo,
        nf,
        responsavel
      };
    }

    if (Object.keys(newItems).length > 0) {
      try {
        await update(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`), newItems);
        alert(`Sucesso! ${Object.keys(newItems).length} iscas importadas para a apresentação.`);
        setPasteContent('');
        setCurrentSlide(0); // Jump to Slide 1 Executive Summary
      } catch (err) {
        console.error(err);
        alert('Erro ao sincronizar com o banco.');
      }
    } else {
      alert('Nenhum dado reconhecido.');
    }
  };

  // Save Santa Luzia/MG custom ID array
  const handleSaveSantaLuzia = async () => {
    const list = santaLuziaInput
      .split(/,|\n|\s+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    
    try {
      await set(ref(rtdb, `users/${GUEST_USER_ID}/santa_luzia_numbers`), list);
      setSantaLuziaList(list);
      alert('Iscas de Santa Luzia/MG salvas com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    }
  };

  const clearAllIscas = async () => {
    if (!confirm('Deseja redefinir os dados da apresentação?')) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`));
      setIscas([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics filtering
  const filteredIscas = selectedDestinationFilter === 'ALL' 
    ? iscas 
    : iscas.filter(i => (i.destino || 'OUTROS') === selectedDestinationFilter);

  const totalCounts: Record<string, number> = {};
  STATUS_CATEGORIES.forEach(st => {
    totalCounts[st] = filteredIscas.filter(i => i.status === st).length;
  });

  const santaLuziaIscas = iscas.filter(i => santaLuziaList.includes(i.iscaNumber));
  const santaLuziaCounts: Record<string, number> = {};
  STATUS_CATEGORIES.forEach(st => {
    santaLuziaCounts[st] = santaLuziaIscas.filter(i => i.status === st).length;
  });

  const destinationsList = Array.from(new Set(iscas.map(i => i.destino || 'OUTROS'))).filter(Boolean);
  const destinationBreakdown = destinationsList.map(dest => {
    const destIscas = iscas.filter(i => (i.destino || 'OUTROS') === dest);
    const counts: Record<string, number> = {};
    STATUS_CATEGORIES.forEach(st => {
      counts[st] = destIscas.filter(i => i.status === st).length;
    });
    return {
      destination: dest,
      total: destIscas.length,
      counts
    };
  });

  const chartData = STATUS_CATEGORIES.map(st => ({
    name: st,
    Total: totalCounts[st] || 0,
    'Santa Luzia': santaLuziaCounts[st] || 0
  }));

  const pieData = STATUS_CATEGORIES.map(st => ({
    name: st,
    value: totalCounts[st] || 0,
    color: EXECUTIVE_COLORS[st]?.main || '#000000'
  })).filter(d => d.value > 0);

  const slides = [
    { id: 'slide1', title: '01. Sumário Executivo & KPIS' },
    { id: 'slide2', title: '02. Indicadores Volumétricos 3D' },
    { id: 'slide3', title: '03. Análise por Destino' },
    { id: 'slide4', title: '04. Entrada de Dados & Santa Luzia' },
    { id: 'slide5', title: '05. Tabela de Registros' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-100 font-sans p-4 md:p-8 flex flex-col justify-between pb-24">
      
      {/* POWERPOINT EXECUTIVE PRESENTATION HEADER BAR */}
      <div className="w-full max-w-7xl mx-auto bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <Presentation size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-widest border border-amber-500/30">
                Apresentação Executiva de Gestão
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">• Café Três Corações</span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-black text-white tracking-tight uppercase">
              Relatório Corporativo de Iscas & Rastreio
            </h1>
          </div>
        </div>

        {/* Slide Controls & Deck Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Slide Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 px-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                  currentSlide === idx
                    ? "bg-amber-500 text-slate-950 shadow-md scale-110"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Próximo Slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* SLIDE CANVAS STAGE (CORPORATE POWERPOINT CARD WITH SLIDE TRANSITION) */}
      <div className="w-full max-w-7xl mx-auto flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* SLIDE 1: SUMÁRIO EXECUTIVO & KPIS */}
          {currentSlide === 0 && (
            <motion.div
              key="slide1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-8 min-h-[600px] flex flex-col justify-between"
            >
              {/* Slide Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                    SLIDE 01 / 05 — VISÃO EXECUTIVA
                  </span>
                  <h2 className="text-3xl font-serif font-black text-white uppercase mt-1">
                    Sumário de Operações & Rastreamento
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Total Registrado: <span className="font-bold text-white">{iscas.length} iscas</span>
                </div>
              </div>

              {/* Destination Filter Pill Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold mr-2">Filtrar Praça:</span>
                <button
                  onClick={() => setSelectedDestinationFilter('ALL')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
                    selectedDestinationFilter === 'ALL'
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  Todas ({iscas.length})
                </button>
                {destinationsList.map(dest => (
                  <button
                    key={dest}
                    onClick={() => setSelectedDestinationFilter(dest)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
                      selectedDestinationFilter === dest
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {dest} ({iscas.filter(i => (i.destino || 'OUTROS') === dest).length})
                  </button>
                ))}
              </div>

              {/* Executive Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="text-xs font-mono uppercase font-bold text-slate-400">Geral Ativo</div>
                  <div className="text-4xl font-serif font-black text-white mt-2">{filteredIscas.length}</div>
                  <p className="text-xs text-slate-400 mt-2 font-mono">Base total cadastrada</p>
                </div>

                <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="text-xs font-mono uppercase font-bold text-amber-400">Santa Luzia / MG</div>
                  <div className="text-4xl font-serif font-black text-amber-400 mt-2">{santaLuziaIscas.length}</div>
                  <p className="text-xs text-amber-200/60 mt-2 font-mono">Pertencentes à unidade principal</p>
                </div>

                <div className="bg-slate-800/80 border border-red-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="text-xs font-mono uppercase font-bold text-red-400">Alertas / Extravio</div>
                  <div className="text-4xl font-serif font-black text-red-400 mt-2">
                    {(totalCounts['EXTRAVIADAS'] || 0) + (totalCounts['POSSÍVEL EXTRAVIO'] || 0)}
                  </div>
                  <p className="text-xs text-red-300/70 mt-2 font-mono">Iscas sob protocolo de risco</p>
                </div>

                <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="text-xs font-mono uppercase font-bold text-emerald-400">Em Trânsito / Destino</div>
                  <div className="text-4xl font-serif font-black text-emerald-400 mt-2">
                    {(totalCounts['EM ROTA IDA'] || 0) + (totalCounts['EM ROTA VOLTA'] || 0) + (totalCounts['NO DESTINO'] || 0)}
                  </div>
                  <p className="text-xs text-emerald-300/70 mt-2 font-mono">Trânsito com status normal</p>
                </div>

              </div>

              {/* Bar & Donut Visualizers Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 h-72">
                  <h3 className="text-sm font-serif font-black text-slate-200 uppercase mb-4">Volume Geral vs Santa Luzia</h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Santa Luzia" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 h-72 flex flex-col justify-between">
                  <h3 className="text-sm font-serif font-black text-slate-200 uppercase">Composição Por Cento</h3>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Footer Slide Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-800">
                <span>Café Três Corações S.A. — Relatório Executivo</span>
                <span>Pressione as setas para avançar os slides →</span>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: INDICADORES VOLUMÉTRICOS 3D (8 QUADRADOS & CÍRCULOS) */}
          {currentSlide === 1 && (
            <motion.div
              key="slide2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-8 min-h-[600px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                    SLIDE 02 / 05 — CATEGORIAS EM DETALHE
                  </span>
                  <h2 className="text-3xl font-serif font-black text-white uppercase mt-1">
                    Indicadores Volumétricos por Categoria
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                  8 Categorias Analisadas
                </div>
              </div>

              {/* 8 CATEGORY CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {STATUS_CATEGORIES.map((st, idx) => {
                  const cfg = EXECUTIVE_COLORS[st];
                  const count = totalCounts[st] || 0;
                  const totalBase = filteredIscas.length || 1;
                  const percentage = Math.round((count / totalBase) * 100);
                  const slCount = santaLuziaCounts[st] || 0;

                  return (
                    <div
                      key={st}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                          CAT 0{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ backgroundColor: cfg.main, color: '#fff' }}>
                          {percentage}%
                        </span>
                      </div>

                      <h3 className="text-sm font-serif font-bold text-white uppercase tracking-tight mb-4">
                        {st}
                      </h3>

                      <div className="flex items-center justify-between my-2">
                        {/* Circular Progress Gauge */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-16 h-16 -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              stroke={cfg.main}
                              strokeWidth="6"
                              strokeDasharray="163"
                              strokeDashoffset={163 - (163 * percentage) / 100}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <span className="absolute text-[10px] font-mono font-bold text-white">{percentage}%</span>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-serif font-black text-white">{count}</div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Iscas</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Santa Luzia/MG:</span>
                        <span className="font-bold text-amber-400">{slCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-800">
                <span>Café Três Corações S.A. — Relatório Executivo</span>
                <span>Slide 2 de 5</span>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: ANÁLISE POR DESTINO */}
          {currentSlide === 2 && (
            <motion.div
              key="slide3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-8 min-h-[600px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                    SLIDE 03 / 05 — DISTRIBUIÇÃO GEOGRÁFICA
                  </span>
                  <h2 className="text-3xl font-serif font-black text-white uppercase mt-1">
                    Análise e Rastreio Dividido por Destino
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                  {destinationsList.length} Praças Registradas
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[420px] pr-2">
                {destinationBreakdown.map((dest) => (
                  <div key={dest.destination} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-serif font-black text-lg text-white uppercase">{dest.destination}</span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                        {dest.total} iscas
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {STATUS_CATEGORIES.map(st => {
                        const val = dest.counts[st] || 0;
                        if (val === 0) return null;
                        const cfg = EXECUTIVE_COLORS[st];
                        return (
                          <div key={st} className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.main }} />
                              {st}
                            </span>
                            <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-800">
                <span>Café Três Corações S.A. — Relatório Executivo</span>
                <span>Slide 3 de 5</span>
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: ENTRADA DE DADOS PLANILHA & SANTA LUZIA */}
          {currentSlide === 3 && (
            <motion.div
              key="slide4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-8 min-h-[600px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                    SLIDE 04 / 05 — CARGA DE DADOS
                  </span>
                  <h2 className="text-3xl font-serif font-black text-white uppercase mt-1">
                    Importação de Planilha & Base Santa Luzia/MG
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* PASTE SPREADSHEET AREA */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-black text-lg text-white uppercase flex items-center gap-2">
                      <FileSpreadsheet className="text-amber-400" size={20} /> Colar Dados da Planilha
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cole as informações copiadas do Excel incluindo cabeçalhos (ISCA, STATUS, DESTINO, CAVALO, NF).
                  </p>
                  <textarea
                    rows={7}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Cole aqui as linhas copiadas da planilha..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleProcessPaste}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Sparkles size={16} /> Processar & Atualizar Slide Deck
                  </button>
                </div>

                {/* SANTA LUZIA/MG BASE AREA */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-black text-lg text-white uppercase flex items-center gap-2">
                      <Building2 className="text-amber-400" size={20} /> Iscas Santa Luzia/MG
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Insira somente os números das iscas pertencentes a Santa Luzia/MG (separados por vírgula ou espaço).
                  </p>
                  <textarea
                    rows={7}
                    value={santaLuziaInput}
                    onChange={(e) => setSantaLuziaInput(e.target.value)}
                    placeholder="Ex: R100000555, R100000617, R100000755..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveSantaLuzia}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-serif font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Salvar Números de Santa Luzia/MG
                  </button>
                </div>

              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-800">
                <span>Café Três Corações S.A. — Relatório Executivo</span>
                <span>Slide 4 de 5</span>
              </div>
            </motion.div>
          )}

          {/* SLIDE 5: TABELA REGISTROS */}
          {currentSlide === 4 && (
            <motion.div
              key="slide5"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-6 min-h-[600px] flex flex-col justify-between"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                    SLIDE 05 / 05 — REGISTROS
                  </span>
                  <h2 className="text-3xl font-serif font-black text-white uppercase mt-1">
                    Tabela Geral de Registros ({iscas.length})
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-amber-500 w-52"
                    />
                  </div>
                  <button
                    onClick={clearAllIscas}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 border border-red-500/20 cursor-pointer"
                  >
                    <Trash2 size={14} /> Redefinir
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 max-h-[380px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      <th className="p-3">Nº Isca</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Destino</th>
                      <th className="p-3">Cavalo / Placa</th>
                      <th className="p-3">Nota Fiscal</th>
                      <th className="p-3">Responsável</th>
                      <th className="p-3 text-center">Santa Luzia/MG?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {iscas
                      .filter(i => 
                        i.iscaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.cavalo.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((item) => {
                        const isSL = santaLuziaList.includes(item.iscaNumber);
                        const cfg = EXECUTIVE_COLORS[item.status] || EXECUTIVE_COLORS['EM PREPARAÇÃO'];
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-mono font-bold text-white">{item.iscaNumber}</td>
                            <td className="p-3">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono", cfg.badge)}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 uppercase text-slate-200">{item.destino}</td>
                            <td className="p-3 uppercase font-mono text-slate-400">{item.cavalo}</td>
                            <td className="p-3 font-mono text-slate-400">{item.nf}</td>
                            <td className="p-3 text-slate-300">{item.responsavel}</td>
                            <td className="p-3 text-center">
                              {isSL ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">SIM</span>
                              ) : (
                                <span className="text-slate-600">NÃO</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-4 border-t border-slate-800">
                <span>Café Três Corações S.A. — Relatório Executivo</span>
                <span>Slide 5 de 5</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
