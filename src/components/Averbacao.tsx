import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  Mail, 
  Clipboard, 
  Trash2, 
  Sparkles, 
  Check, 
  Truck, 
  Building, 
  User, 
  CreditCard, 
  Phone, 
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MercosulPlate } from './MercosulPlate';

interface AverbacaoRow {
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

interface ExtraData {
  transportadora: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

const DEFAULT_TRANSPORTADORAS = [
  "APK",
  "TOMASI",
  "MOEDENSE",
  "FROTA 3C",
  "TRANSMAGNA",
  "RNCGG",
  "GT MINAS",
  "GOBOR",
  "SRH SARAIVA",
  "PACTUAL",
  "JETTA",
  "TECPET",
  "TRANS DANIEL",
  "UTISEG TRANSPORTES E LOCACOES LTDA",
  "COMBOIO",
  "REAL 94",
  "TORNADO",
  "FUJIOKA",
  "MERCOTRUCK",
  "UNITRADING LOG"
];

const QUICK_CODES = [
  { label: 'CÁPSULA', value: '9000000982' },
  { label: 'MÁQUINA', value: '000000901' },
  { label: 'EMBALAGEM', value: '132' },
];

const SAMPLE_TSV_DATA = `16/09/2026\tSANTA LUZIA\tLONDRINA\tQWK6A22\tOLN7307\t104582\tR$ 185.420,00\tR$ 324.950,00\tAVB-98124
16/09/2026\tSANTA LUZIA\tMARINGÁ\tQWK6A22\tOLN7307\t104583\tR$ 139.530,00\tR$ 324.950,00\tAVB-98125`;

export function Averbacao() {
  const [activeSubTab, setActiveSubTab] = useState<'prancheta' | 'email_preview'>('email_preview');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'delete' } | null>(null);

  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>(DEFAULT_TRANSPORTADORAS);
  const [showAddTranspInput, setShowAddTranspInput] = useState(false);
  const [newTranspName, setNewTranspName] = useState("");

  const handleAddCustomTransp = () => {
    const trimmed = newTranspName.trim().toUpperCase();
    if (trimmed) {
      if (!customTransportadoras.includes(trimmed)) {
        setCustomTransportadoras((prev) => [...prev, trimmed]);
      }
      saveData(parsedRows, { ...extraData, transportadora: trimmed });
      setNewTranspName("");
      setShowAddTranspInput(false);
      showNotificationMsg(`Transportadora "${trimmed}" adicionada!`);
    }
  };

  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: 'MOEDENSE',
    tecnologia: 'SIGHRA',
    nomeMotorista: 'ROBSON LUIS VIEIRA',
    cpf: '051.848.966-09',
    telefone: '(31) 99935-0970'
  });

  const [parsedRows, setParsedRows] = useState<AverbacaoRow[]>([
    {
      dataAverbacao: '16/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'LONDRINA',
      placaCav: 'QWK6A22',
      placaCarr: 'OLN7307',
      nf: '104582',
      valorNf: 'R$ 185.420,00',
      somaVl: 'R$ 324.950,00',
      protocolo: 'AVB-98124'
    },
    {
      dataAverbacao: '16/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'MARINGÁ',
      placaCav: 'QWK6A22',
      placaCarr: 'OLN7307',
      nf: '104583',
      valorNf: 'R$ 139.530,00',
      somaVl: 'R$ 324.950,00',
      protocolo: 'AVB-98125'
    }
  ]);

  const showNotificationMsg = (message: string, type: 'success' | 'delete' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const parseInput = (text: string) => {
    if (!text.trim()) return;
    const lines = text.trim().split('\n');
    const newRows: AverbacaoRow[] = [];

    lines.forEach((line) => {
      const cols = line.split('\t');
      if (cols.length >= 2) {
        newRows.push({
          dataAverbacao: cols[0]?.trim() || '16/09/2026',
          origem: cols[1]?.trim() || 'SANTA LUZIA',
          destino: cols[2]?.trim() || 'DESTINO',
          placaCav: cols[3]?.trim() || 'QWK6A22',
          placaCarr: cols[4]?.trim() || 'OLN7307',
          nf: cols[5]?.trim() || '104580',
          valorNf: cols[6]?.trim() || 'R$ 100.000,00',
          somaVl: cols[7]?.trim() || 'R$ 100.000,00',
          protocolo: cols[8]?.trim() || 'AVB-98120'
        });
      }
    });

    if (newRows.length > 0) {
      setParsedRows(newRows);
      setShowPasteModal(false);
      setRawInputText('');
      showNotificationMsg(`Planilha processada com sucesso! ${newRows.length} registros carregados.`);
    } else {
      // Fallback sample
      setParsedRows([
        {
          dataAverbacao: '16/09/2026',
          origem: 'SANTA LUZIA',
          destino: 'LONDRINA',
          placaCav: 'QWK6A22',
          placaCarr: 'OLN7307',
          nf: '104582',
          valorNf: 'R$ 185.420,00',
          somaVl: 'R$ 324.950,00',
          protocolo: 'AVB-98124'
        }
      ]);
      setShowPasteModal(false);
      showNotificationMsg('Dados de exemplo carregados com sucesso!');
    }
  };

  const handleClearAll = () => {
    setParsedRows([]);
    showNotificationMsg('Todos os registros foram limpos.', 'delete');
  };

  const handleDeleteRow = (index: number) => {
    const updated = parsedRows.filter((_, i) => i !== index);
    setParsedRows(updated);
    showNotificationMsg('Registro removido com sucesso.', 'delete');
  };

  const saveData = (rows: AverbacaoRow[], newExtra: ExtraData) => {
    setParsedRows(rows);
    setExtraData(newExtra);
  };

  const parseCurrency = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/R\$/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const getTotalValue = () => {
    if (parsedRows.length === 0) return 'R$ 0,00';
    const sum = parsedRows.reduce((acc, row) => acc + parseCurrency(row.valorNf), 0);
    return formatCurrency(sum);
  };

  const getRoute = () => {
    if (parsedRows.length === 0) return 'SANTA LUZIA x DESTINO';
    const origem = parsedRows[0]?.origem || 'SANTA LUZIA';
    const destinos = Array.from(new Set(parsedRows.map(r => r.destino))).filter(Boolean);
    if (destinos.length === 1) return `${origem} x ${destinos[0]}`;
    return `${origem} x MÚLTIPLOS DESTINOS (${destinos.join(', ')})`;
  };

  const getProtocols = () => {
    return Array.from(new Set(parsedRows.map(r => r.protocolo).filter(Boolean)));
  };

  const getPlacasCarretas = () => {
    return Array.from(new Set(parsedRows.map(r => r.placaCarr).filter(Boolean))).join(', ');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const copyCodeToClipboard = (label: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
    showNotificationMsg(`Código ${label} copiado!`);
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();
    const route = getRoute();
    const protocols = getProtocols().length > 0 ? getProtocols().join(', ') : '---';
    const totalValue = getTotalValue();
    const transportadora = extraData.transportadora || 'MOEDENSE';
    const tecnologia = extraData.tecnologia || 'SIGHRA';
    const condutor = extraData.nomeMotorista || '---';
    const cpf = extraData.cpf || '---';
    const telefone = extraData.telefone || '---';
    const origem = parsedRows[0]?.origem || 'SANTA LUZIA';
    const destino = parsedRows[0]?.destino || '---';
    const placaCav = parsedRows[0]?.placaCav || '---';
    const placaCarr = getPlacasCarretas() || '---';

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #000000; line-height: 1.5;">
        <p style="margin: 0 0 16px 0;">${greeting}!</p>
        <p style="margin: 0 0 16px 0;">
          Segue <span style="background-color: #FFFF00; font-weight: bold; padding: 1px 4px; color: #000000;">averbação</span> realizada via sistema.
        </p>
        <p style="margin: 0 0 4px 0; font-weight: bold;">ROTA: ${route.toUpperCase()}</p>
        <p style="margin: 0 0 4px 0; font-weight: bold;">PROTOCOLO: <span style="color: #0000FF;">${protocols}</span></p>
        <p style="margin: 0 0 16px 0; font-weight: bold;">Valor da Carga: <span style="color: #FF0000;">${totalValue}</span></p>
        <p style="margin: 0 0 16px 0;">Segue dados e NF's em anexo.</p>

        <table style="border-collapse: collapse; width: 100%; text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 20px; border: 1px solid #000000;">
          <thead>
            <tr style="background-color: #000000; color: #FFFFFF; font-size: 10px; text-transform: uppercase;">
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">ORIGEM</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">DESTINO</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">TRANSPORTADORA</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">PLACA CAVALO</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">PLACAS CARRETAS</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">TECNOLOGIA</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">NOME MOTORISTA</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">CPF</th>
              <th style="padding: 10px 6px; border: 1px solid #000000; font-weight: bold;">TELEFONE</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #000000;">
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${origem}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${destino}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${transportadora}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #CCCCCC;">${placaCav}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${placaCarr}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${tecnologia}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${condutor}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${cpf}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #FFFF00;">${telefone}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin: 0;">Att,</p>
      </div>
    `;

    const plainText = `${greeting}!\n\nSegue averbação realizada via sistema.\n\nROTA: ${route.toUpperCase()}\nPROTOCOLO: ${protocols}\nValor da Carga: ${totalValue}\n\nSegue dados e NF's em anexo.\n\nAtt,`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showNotificationMsg('Formato exato de e-mail copiado!');
    } catch (err) {
      console.error('Erro ao copiar e-mail:', err);
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filteredRows = parsedRows.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.placaCav.toLowerCase().includes(term) ||
      r.placaCarr.toLowerCase().includes(term) ||
      r.nf.toLowerCase().includes(term) ||
      r.protocolo.toLowerCase().includes(term) ||
      r.destino.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full h-full flex flex-col relative" style={{ zoom: '0.80' }}>
      
      {/* Notification Toast */}
      {notification && (
        <div 
          className={cn(
            "absolute top-3 right-3 z-50 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2.5 shadow-2xl transition-all animate-in fade-in slide-in-from-top-2",
            notification.type === 'delete'
              ? "bg-rose-950/90 text-rose-100 border-rose-800"
              : "bg-stone-900/95 text-stone-100 border-stone-700"
          )}
        >
          {notification.type === 'delete' ? (
            <Trash2 size={16} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Master Light Executive Container */}
      <div className="w-full flex-1 min-h-0 bg-white border border-[#d6ccbe] rounded-3xl p-3 sm:p-4 md:p-5 shadow-xs relative flex flex-col gap-3 overflow-hidden text-stone-900">
        
        {/* Top Area */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch relative z-10 shrink-0">
          
          {/* Left Col: Master Executive Badge */}
          <div className="w-full md:w-[26%] md:min-w-[220px] md:max-w-[250px] rounded-2xl relative group border border-[#d6ccbe] overflow-hidden shrink-0 shadow-xs bg-[#fbf9f5] flex flex-col items-center justify-center p-3.5 text-center">
            
            <div className="w-12 h-12 rounded-xl bg-[#9b1526] border border-red-200 flex items-center justify-center relative shadow-xs mb-1.5 group-hover:scale-105 transition-transform">
              <ShieldCheck size={24} className="text-white" />
            </div>

            <span className="text-stone-900 font-mono font-bold text-sm uppercase tracking-wider leading-tight">
              Averbação de Carga
            </span>
            <span className="text-[10px] text-[#9b1526] font-mono font-bold mt-1 tracking-wider uppercase">
              Central de Apólices & NF
            </span>

            <div className="mt-2 bg-white border border-[#d6ccbe] rounded-xl px-3 py-1 text-[9px] font-mono font-bold text-stone-700 uppercase tracking-wider shadow-xs">
              4K DUAL • SEGUROS
            </div>
          </div>

          {/* Right Col: Quote + Title */}
          <div className="flex-1 flex flex-col justify-between pt-0.5 gap-2">
            
            <p className="w-full text-stone-600 font-sans text-xs sm:text-sm text-center leading-snug px-2">
              "A conformidade de seguro e a averbação pontual garantem a integridade da frota e a tranquilidade de cada viagem na estrada."
            </p>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div className="pb-0.5">
                <span className="text-stone-500 font-mono font-bold text-[10px] tracking-widest uppercase block mb-0.5">
                  MÓDULO INTEGRADO DE AVERBAÇÃO DE SEGUROS
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-mono uppercase tracking-tight">
                  AVERBAÇÃO: <span className="text-[#9b1526]">{parsedRows.length} NOTAS / {parsedRows[0]?.placaCav || 'FROTA'}</span>
                </h1>
              </div>

              <div className="hidden lg:flex bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl p-2 px-3 items-center justify-center gap-2.5 shadow-xs relative shrink-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#d6ccbe] flex items-center justify-center">
                  <span className="text-[#9b1526] font-bold text-xs">☕</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-900 text-xs font-bold leading-none mb-0.5">Feito com paixão.</span>
                  <span className="text-stone-500 text-[10px] font-mono leading-none">Para quem entrega.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 2-Column Composition: Main Content (Left) + Vertical Operational Panel (Right) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
          
          {/* LEFT MAIN AREA (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar pr-1">
            
            {/* Quick Codes Pill Bar */}
            <div className="bg-gradient-to-r from-[#fbf9f5] via-[#f8f4ed] to-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse inline-block" />
                <span className="text-xs font-mono font-extrabold text-stone-800 uppercase tracking-widest">
                  CÓDIGOS RÁPIDOS DA OPERAÇÃO:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {QUICK_CODES.map((item) => (
                  <div 
                    key={item.label}
                    className="flex items-center gap-2 bg-white border border-[#d6ccbe] rounded-xl px-3 py-1.5 shadow-2xs hover:shadow-xs hover:border-stone-400 transition-all group"
                  >
                    <span className="text-[10px] font-mono font-black text-stone-500 uppercase tracking-wider">{item.label}:</span>
                    <code className="text-xs font-mono font-black text-stone-900 bg-stone-100/90 px-2.5 py-0.5 rounded-md border border-stone-200/90 tracking-wide">
                      {item.value}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCodeToClipboard(item.label, item.value)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs border",
                        copiedCode === item.label
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/20"
                          : "bg-[#9b1526] hover:bg-[#831220] border-red-800/80 text-white shadow-red-950/20"
                      )}
                      title={`Copiar código ${item.label}`}
                    >
                      {copiedCode === item.label ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedCode === item.label ? 'COPIADO' : 'COPIAR'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Aba Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7dac9] pb-2.5 shrink-0">
              
              {/* Segmented Control Capsule Tabs */}
              <div className="flex items-center bg-[#f1ebe1] p-1 rounded-2xl border border-[#d6ccbe] shadow-inner gap-1 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('email_preview')}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer relative bg-[#9b1526] text-white shadow-md border border-red-800"
                >
                  <Mail size={15} />
                  <span>Pré-visualização do E-mail</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full font-mono font-black text-[10px] bg-white/20 text-white border border-white/30 shadow-2xs">
                    {parsedRows.length} NF
                  </span>
                </button>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="bg-[#9b1526] hover:bg-[#831220] active:scale-95 text-white text-xs font-mono font-extrabold uppercase tracking-wider py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-red-800"
                >
                  <Clipboard size={15} />
                  <span>Colar Planilha TSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => parseInput(SAMPLE_TSV_DATA)}
                  className="bg-white hover:bg-stone-100/80 active:scale-95 text-stone-800 border border-[#d6ccbe] text-xs font-mono font-extrabold uppercase tracking-wider py-2 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Carregar exemplo real de averbação com 2 notas"
                >
                  <Sparkles size={14} className="text-[#9b1526]" />
                  <span>Exemplo</span>
                </button>

                {parsedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 text-xs font-mono font-extrabold uppercase tracking-wider py-2 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Limpar todos os dados"
                  >
                    <Trash2 size={14} />
                    <span>Limpar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visualização: Prancheta vs Pré-visualização do E-mail */}
            <div className="flex-1 min-h-0 flex flex-col">
              {activeSubTab === 'prancheta' ? (
                <div className="flex-1 min-h-0 flex flex-col gap-3 relative z-10">
                  
                  {/* Search / Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#fbf9f5] via-white to-[#fbf9f5] p-2.5 px-3.5 rounded-2xl border border-[#d6ccbe] shadow-xs shrink-0">
                    <div className="relative flex-1 w-full">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por Placa, Nota Fiscal, Protocolo ou Destino..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-[#d6ccbe] focus:border-[#9b1526] focus:ring-2 focus:ring-[#9b1526]/10 rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 shadow-inner transition-all outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                      <div className="bg-white border border-[#d6ccbe] px-4 py-1.5 rounded-xl shadow-2xs text-right min-w-[170px] flex flex-col justify-center">
                        <span className="text-[9px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-tight mb-0.5">
                          VALOR TOTAL AVERBADO
                        </span>
                        <span className="text-lg font-black font-mono text-[#9b1526] tracking-tight leading-none">
                          {getTotalValue()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Master Light Table */}
                  <div className="rounded-2xl border border-[#d6ccbe] overflow-hidden shadow-xs bg-white flex-1 min-h-0 flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="bg-[#fbf9f5] border-b border-[#e7dac9] text-stone-700 sticky top-0 z-20">
                            <th className="py-2 px-3.5 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Data
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Origem
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Destino
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Placa Cavalo
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Placa Carreta
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Nota Fiscal
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Valor NF
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Valor de Carga
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                              Protocolo
                            </th>
                            <th className="py-2 px-3 font-mono font-bold uppercase tracking-wider text-[10px] text-right pr-4">
                              Ações
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#e7dac9]">
                          {filteredRows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-stone-500 font-medium">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <FileSpreadsheet size={32} className="text-stone-300" />
                                  <p className="font-bold text-stone-800 text-xs font-mono">
                                    Nenhum registro de averbação carregado até o momento
                                  </p>
                                  <p className="text-[10px] text-stone-500 max-w-md font-mono">
                                    Clique em <strong className="text-stone-900">"Colar Planilha TSV"</strong> acima para importar os dados ou em <strong className="text-stone-900">"Exemplo"</strong> para conferir o preenchimento.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredRows.map((row, index) => (
                              <tr
                                key={index}
                                className="hover:bg-stone-50 transition-colors group"
                              >
                                <td className="py-2 px-3.5 font-mono font-bold text-[11px] text-stone-700">
                                  {row.dataAverbacao || '-'}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] uppercase text-stone-900">
                                  {row.origem || 'SANTA LUZIA'}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-[#9b1526] uppercase">
                                  {row.destino || '-'}
                                </td>
                                <td className="py-1.5 px-3 align-middle">
                                  <MercosulPlate plate={row.placaCav} className="w-[84px] h-[26px]" />
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-stone-700">
                                  {row.placaCarr ? (
                                    <span className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-stone-200">
                                      {row.placaCarr}
                                    </span>
                                  ) : (
                                    <span className="text-stone-400 italic text-[9px]">-</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-stone-900">
                                  {row.nf ? (
                                    <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded-md border border-amber-200 text-[10px]">
                                      {row.nf}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-stone-700">
                                  {row.valorNf || '-'}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-emerald-700">
                                  {getTotalValue()}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-[11px] text-stone-900">
                                  {row.protocolo ? (
                                    <span className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-md border border-stone-200 text-[10px]">
                                      {row.protocolo}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="py-1.5 px-3 text-right pr-4">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(index)}
                                    className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                /* Sub-Aba 2: Pré-visualização do E-mail */
                <div className="bg-white rounded-2xl border border-[#d6ccbe] p-4 shadow-sm relative z-10 text-slate-900 flex-1 min-h-0 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#e7dac9] pb-2.5 mb-3 gap-3 shrink-0">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#9b1526] uppercase bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                        FORMATO EXATO PARA CLIENTE DE E-MAIL
                      </span>
                      <h3 className="font-mono font-black text-sm text-stone-900 mt-1 uppercase">
                        Corpo da Mensagem de Averbação
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={copyToEmail}
                      className="px-4 py-2 bg-[#9b1526] hover:bg-[#831220] text-white rounded-xl font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Clipboard size={13} />
                      <span>{copied ? 'COPIADO COM SUCESSO!' : 'COPIAR FORMATADO'}</span>
                    </button>
                  </div>

                  {/* Email Body Preview matching reference image */}
                  <div className="space-y-3 text-black text-xs leading-relaxed font-sans bg-white p-5 rounded-2xl border border-stone-300 overflow-y-auto flex-1 min-h-0 shadow-inner">
                    <p className="font-normal text-sm">{getGreeting()}!</p>
                    <p>
                      Segue <span className="bg-[#FFFF00] text-black font-bold px-1.5 py-0.5 border border-yellow-400">averbação</span> realizada via sistema.
                    </p>

                    <div className="space-y-1 font-bold text-black py-1">
                      <p className="text-xs uppercase">
                        ROTA: {getRoute().toUpperCase()}
                      </p>
                      <p className="text-xs uppercase">
                        PROTOCOLO: <span className="text-blue-600 font-bold">{getProtocols().length > 0 ? getProtocols().join(', ') : '---'}</span>
                      </p>
                      <p className="text-xs">
                        Valor da Carga: <span className="text-red-600 font-bold">{getTotalValue()}</span>
                      </p>
                    </div>

                    <p>
                      Segue dados e <span className="underline decoration-red-500 decoration-wavy">NF's</span> em anexo.
                    </p>

                    {/* Tabela do E-mail matching uploaded image */}
                    <div className="overflow-x-auto my-4 border border-black shadow-xs bg-white">
                      <table className="w-full text-center text-[10px] border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-black text-white uppercase font-black text-[9.5px] tracking-wider">
                            <th className="p-2 border border-black">ORIGEM</th>
                            <th className="p-2 border border-black">DESTINO</th>
                            <th className="p-2 border border-black">TRANSPORTADORA</th>
                            <th className="p-2 border border-black">PLACA CAVALO</th>
                            <th className="p-2 border border-black">PLACAS CARRETAS</th>
                            <th className="p-2 border border-black">TECNOLOGIA</th>
                            <th className="p-2 border border-black">NOME MOTORISTA</th>
                            <th className="p-2 border border-black">CPF</th>
                            <th className="p-2 border border-black">TELEFONE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="font-bold text-black uppercase text-[10px]">
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black">{parsedRows[0]?.origem || 'SANTA LUZIA'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black">{parsedRows[0]?.destino || '---'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black">{extraData.transportadora || 'MOEDENSE'}</td>
                            <td className="p-2.5 border border-black bg-[#CCCCCC] text-black font-mono">{parsedRows[0]?.placaCav || '---'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black font-mono">{getPlacasCarretas() || '---'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black">{extraData.tecnologia || 'SIGHRA'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black">{extraData.nomeMotorista || '---'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black font-mono">{extraData.cpf || '---'}</td>
                            <td className="p-2.5 border border-black bg-[#FFFF00] text-black font-mono">{extraData.telefone || '---'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="pt-2 font-normal">Att,</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT VERTICAL OPERATIONAL PANEL (1 Column) */}
          <div className="lg:col-span-1 bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-4 shadow-xs flex flex-col gap-3 shrink-0 overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-2 border-b border-[#e7dac9] pb-2.5">
              <Truck size={16} className="text-[#9b1526]" />
              <span className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
                DADOS OPERACIONAIS
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Transportadora */}
              <div className="bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-xs space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building size={13} className="text-[#9b1526]" /> TRANSPORTADORA
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 font-bold">
                    {customTransportadoras.length} DISPONÍVEIS
                  </span>
                </label>

                <select
                  value={extraData.transportadora}
                  onChange={(e) => saveData(parsedRows, { ...extraData, transportadora: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] uppercase cursor-pointer shadow-inner"
                >
                  {customTransportadoras.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {showAddTranspInput ? (
                  <div className="pt-1.5 flex flex-col gap-1.5 animate-in fade-in">
                    <input
                      type="text"
                      value={newTranspName}
                      onChange={(e) => setNewTranspName(e.target.value.toUpperCase())}
                      placeholder="NOME DA TRANSPORTADORA"
                      className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] uppercase shadow-inner"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCustomTransp();
                        if (e.key === 'Escape') setShowAddTranspInput(false);
                      }}
                    />
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddTranspInput(false)}
                        className="px-2 py-1 text-[10px] font-mono font-bold text-stone-600 hover:text-stone-900 rounded-md cursor-pointer"
                      >
                        CANCELAR
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomTransp}
                        className="px-3 py-1 bg-[#9b1526] hover:bg-[#831220] text-white rounded-md text-[10px] font-mono font-bold uppercase cursor-pointer shadow-xs"
                      >
                        SALVAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddTranspInput(true)}
                    className="pt-1 text-[10px] font-mono font-bold text-[#9b1526] hover:text-[#831220] hover:underline uppercase flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>+ ADICIONAR TRANSPORTADORA</span>
                  </button>
                )}
              </div>

              {/* Tecnologia */}
              <div className="bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-xs space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#9b1526]" /> TECNOLOGIA
                </label>
                <select
                  value={extraData.tecnologia}
                  onChange={(e) => saveData(parsedRows, { ...extraData, tecnologia: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] uppercase cursor-pointer shadow-inner"
                >
                  <option value="ONIXSAT">ONIXSAT</option>
                  <option value="AUTOTRAC">AUTOTRAC</option>
                  <option value="SASCAR">SASCAR</option>
                  <option value="SIGHRA">SIGHRA</option>
                  <option value="OMNILINK">OMNILINK</option>
                  <option value="RASTREK">RASTREK</option>
                  <option value="SITRACK">SITRACK</option>
                  <option value="PÓSITRON">PÓSITRON</option>
                  <option value="NÃO POSSUI">NÃO POSSUI</option>
                </select>
              </div>

              {/* Nome do Condutor */}
              <div className="bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-xs space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} className="text-[#9b1526]" /> NOME DO CONDUTOR
                </label>
                <input
                  type="text"
                  value={extraData.nomeMotorista}
                  onChange={(e) => saveData(parsedRows, { ...extraData, nomeMotorista: e.target.value.toUpperCase() })}
                  placeholder="NOME COMPLETO"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] uppercase shadow-inner placeholder:text-stone-400"
                />
              </div>

              {/* CPF */}
              <div className="bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-xs space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[#9b1526]" /> CPF
                </label>
                <input
                  type="text"
                  value={extraData.cpf}
                  onChange={(e) => saveData(parsedRows, { ...extraData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] shadow-inner placeholder:text-stone-400"
                />
              </div>

              {/* Telefone */}
              <div className="bg-white border border-[#d6ccbe] rounded-xl p-3 shadow-xs space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9b1526] uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} className="text-[#9b1526]" /> TELEFONE
                </label>
                <input
                  type="text"
                  value={extraData.telefone}
                  onChange={(e) => saveData(parsedRows, { ...extraData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-[#9b1526] shadow-inner placeholder:text-stone-400"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Colar Dados da Planilha (TSV / Excel) Master Light */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#d6ccbe] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-4 text-stone-900">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#e7dac9] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#9b1526] text-white flex items-center justify-center shadow-xs">
                <Clipboard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-stone-900 uppercase">
                  Colar Dados da Planilha (TSV / Excel)
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Copie as linhas da planilha de averbação (com ou sem cabeçalho) e cole diretamente aqui.
                </p>
              </div>
            </div>

            <textarea
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder={`Cole aqui as linhas da planilha...\nExemplo:\n16/09/2026\tSANTA LUZIA\tLONDRINA\tQWK6A22\tOLN7307\t104582\tR$ 185.420,00\tR$ 324.950,00\tAVB-98124`}
              className="w-full h-44 p-3.5 bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl text-xs font-mono font-medium text-stone-900 focus:outline-none focus:border-stone-500 shadow-inner resize-none placeholder:text-stone-400"
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRawInputText(SAMPLE_TSV_DATA)}
                className="text-xs font-mono font-bold text-[#9b1526] hover:underline cursor-pointer uppercase flex items-center gap-1"
              >
                <Sparkles size={14} /> Usar dados de exemplo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#d6ccbe] text-xs font-mono font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => parseInput(rawInputText)}
                  className="px-6 py-2.5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-xs cursor-pointer active:scale-95"
                >
                  Processar e Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Averbacao;
