import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap,
  Clipboard, 
  Trash2, 
  Sparkles, 
  Check, 
  Building, 
  User, 
  CreditCard, 
  Phone, 
  Search,
  Copy,
  X,
  Plus,
  ChevronRight,
  Sliders
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
  "MODECENSE",
  "APK",
  "TOMASI",
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
const COLOR_THEMES = {
  amarelo: {
    color: '#FFFF00',
    textColor: '#000000',
    badgeClass: 'bg-[#FFFF00] text-black border border-yellow-400 font-bold',
    borderStyle: 'border-l-2 border-[#FFFF00]'
  },
  vermelho: {
    color: '#FF0000',
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#FF0000] text-white border border-red-600 font-bold',
    borderStyle: 'border-l-2 border-[#FF0000]'
  },
  azul: {
    color: '#0000FF',
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#0000FF] text-white border border-blue-700 font-bold',
    borderStyle: 'border-l-2 border-[#0000FF]'
  },
  verde: {
    color: '#00FF00',
    textColor: '#000000',
    badgeClass: 'bg-[#00FF00] text-black border border-green-500 font-bold',
    borderStyle: 'border-l-2 border-[#00FF00]'
  }
};

const SAMPLE_TSV_DATA = `25/09/2026\tSANTA LUZIA\tLONDRINA\tQWA6A22\tDLV7307\t104582\tR$ 185.420,00\tR$ 324.998,00\tAVB-98124
25/09/2026\tSANTA LUZIA\tMARINGÁ\tQWA6A22\tDLV7307\t104583\tR$ 139.578,00\tR$ 324.998,00\tAVB-98125`;

export function Averbacao() {
  const [emailColor, setEmailColor] = useState<'amarelo' | 'vermelho' | 'azul' | 'verde'>('amarelo');
  const activeTheme = COLOR_THEMES[emailColor];
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
    transportadora: 'MODECENSE',
    tecnologia: 'SIGHRA',
    nomeMotorista: 'ROBSON LUIS VIEIRA',
    cpf: '051.248.966-09',
    telefone: '(31) 99935-0970'
  });

  const [parsedRows, setParsedRows] = useState<AverbacaoRow[]>([
    {
      dataAverbacao: '25/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'LONDRINA',
      placaCav: 'QWA6A22',
      placaCarr: 'DLV7307',
      nf: '104582',
      valorNf: 'R$ 185.420,00',
      somaVl: 'R$ 324.998,00',
      protocolo: 'AVB-98124'
    },
    {
      dataAverbacao: '25/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'MARINGÁ',
      placaCav: 'QWA6A22',
      placaCarr: 'DLV7307',
      nf: '104583',
      valorNf: 'R$ 139.578,00',
      somaVl: 'R$ 324.998,00',
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
          dataAverbacao: cols[0]?.trim() || '25/09/2026',
          origem: cols[1]?.trim() || 'SANTA LUZIA',
          destino: cols[2]?.trim() || 'DESTINO',
          placaCav: cols[3]?.trim() || 'QWA6A22',
          placaCarr: cols[4]?.trim() || 'DLV7307',
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
      setParsedRows([
        {
          dataAverbacao: '25/09/2026',
          origem: 'SANTA LUZIA',
          destino: 'LONDRINA',
          placaCav: 'QWA6A22',
          placaCarr: 'DLV7307',
          nf: '104582',
          valorNf: 'R$ 185.420,00',
          somaVl: 'R$ 324.998,00',
          protocolo: 'AVB-98124'
        }
      ]);
      setShowPasteModal(false);
      showNotificationMsg('Dados de exemplo carregados com sucesso!');
    }
  };

  const handleClearAll = () => {
    setParsedRows([]);
    setExtraData({
      transportadora: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    });
    showNotificationMsg('Todos os registros e dados operacionais foram limpos.', 'delete');
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
    const theme = COLOR_THEMES[emailColor];
    const greeting = getGreeting();
    const route = getRoute();
    const protocols = getProtocols().length > 0 ? getProtocols().join(', ') : '---';
    const totalValue = getTotalValue();
    const transportadora = extraData.transportadora || 'MODECENSE';
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
          Segue <span style="background-color: ${theme.color}; font-weight: bold; padding: 2px 6px; color: ${theme.textColor}; border-radius: 4px;">averbação</span> realizada via sistema.
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
            <tr style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${theme.textColor};">
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${origem}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${destino}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${transportadora}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: #CCCCCC; color: #000000;">${placaCav}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${placaCarr}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${tecnologia}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${condutor}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${cpf}</td>
              <td style="padding: 12px 6px; border: 1px solid #000000; background-color: ${theme.color};">${telefone}</td>
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
      showNotificationMsg('Formato de e-mail copiado para a área de transferência!');
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
    <div className="w-full min-h-full h-auto overflow-y-auto flex flex-col relative p-5 pb-14 text-left gap-5">
      
      {/* Premium Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            className={cn(
              "fixed top-4 right-4 z-50 px-4.5 py-3 rounded-2xl border text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md",
              notification.type === 'delete'
                ? "bg-red-50 text-red-800 border-red-200 shadow-red-950/5"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-950/5"
            )}
          >
            <Check size={16} className={notification.type === 'delete' ? "text-red-600" : "text-emerald-600"} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <div className="w-full flex flex-col gap-5 relative overflow-visible h-auto">
        
        {/* ========================================================================= */}
        {/* 1. CINEMATIC HEADER BANNER WITH TRUCK BACKGROUND                            */}
        {/* ========================================================================= */}
        <div className="relative w-full rounded-[24px] overflow-hidden border border-[#ded5c6] h-56 shadow-md bg-[#1d120a] flex items-center">
          {/* Background Image of the Premium Red Truck */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/hero_cinematic_averb_1790216192276.jpg"
              alt="Averbação de Carga"
              className="w-full h-full object-cover object-center filter brightness-[0.85] saturate-[1.1]"
              onError={(e) => {
                // fallback to general truck sunset if specific doesn't exist
                e.currentTarget.src = '/src/assets/images/hero_truck_sunset_1789847050862.jpg';
              }}
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          </div>

          {/* Banner Contents */}
          <div className="relative z-10 w-full px-6 flex items-center justify-between gap-6">
            
            {/* Left Column Info */}
            <div className="flex items-center gap-4.5 text-left">
              {/* Embossed Golden Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#cb9d50] to-[#8c5b16] p-[2px] shadow-lg flex items-center justify-center border border-amber-300/30 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#1d120a] flex items-center justify-center">
                  <ShieldCheck size={28} className="text-amber-400" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center bg-[#cce3f5] text-[#1b4360] font-sans font-black text-[9.5px] tracking-wider px-2.5 py-0.5 rounded-full uppercase border border-[#b2cfeb]/60">
                  OPERAÇÃO & SEGURANÇA
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight mt-1 text-white leading-none">
                  AVERBAÇÃO <span className="text-[#e23a4b]">DE CARGA</span>
                </h1>
                <p className="text-xs font-sans font-extrabold text-stone-300 mt-1 uppercase tracking-wide">
                  Ativos em viagem • <span className="text-amber-400 font-mono font-black">{parsedRows.length} notas</span> cadastrados
                </p>
              </div>
            </div>

            {/* Right Column Slogan - Elegant Serifs */}
            <div className="hidden md:block max-w-[280px] text-right text-stone-200">
              <p className="font-serif italic text-[15px] leading-snug tracking-wide text-white drop-shadow-md">
                "Segurança em cada rota, confiança em cada entrega."
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SPLIT LAYOUT (LEFT: 9 COLS FOR CONTENT, RIGHT: 3 COLS FOR SIDEBAR)      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full h-auto">
          
          {/* CENTRAL WORKSPACE COLUMN (9 cols) */}
          <div className="lg:col-span-9 flex flex-col gap-4 text-left h-auto">
            
            {/* BARRA DE CÓDIGOS RÁPIDOS OPERACIONAIS */}
            <div className="bg-[#fbf9f5] border border-[#ded5c6] rounded-[24px] p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Zap size={13} className="fill-amber-500" />
                </div>
                <span className="text-[10.5px] font-mono font-black text-stone-600 uppercase tracking-widest">
                  CÓDIGOS RÁPIDOS OPERACIONAIS:
                </span>
              </div>

              {/* Codes & Buttons Grid */}
              <div className="flex flex-wrap items-center gap-3.5">
                
                {/* Placa field */}
                <div className="flex items-center gap-2 bg-white border border-[#ded5c6] rounded-xl px-3 py-1 shadow-2xs">
                  <span className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider">PLACA:</span>
                  <code className="text-[11.5px] font-mono font-black text-stone-900 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                    QWA6A22
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCodeToClipboard('PLACA', 'QWA6A22')}
                    className={cn(
                      "p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer",
                      copiedCode === 'PLACA' ? "text-emerald-600" : "text-stone-400 hover:text-stone-700"
                    )}
                  >
                    {copiedCode === 'PLACA' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>

                {/* Máquina field */}
                <div className="flex items-center gap-2 bg-white border border-[#ded5c6] rounded-xl px-3 py-1 shadow-2xs">
                  <span className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider">MÁQUINA:</span>
                  <code className="text-[11.5px] font-mono font-black text-stone-900 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                    00008901
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCodeToClipboard('MÁQUINA', '00008901')}
                    className={cn(
                      "p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer",
                      copiedCode === 'MÁQUINA' ? "text-emerald-600" : "text-stone-400 hover:text-stone-700"
                    )}
                  >
                    {copiedCode === 'MÁQUINA' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>

                {/* Embarques field */}
                <div className="flex items-center gap-2 bg-white border border-[#ded5c6] rounded-xl px-3 py-1 shadow-2xs">
                  <span className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider">EMBARQUES:</span>
                  <code className="text-[11.5px] font-mono font-black text-stone-900 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                    132
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCodeToClipboard('EMBARQUES', '132')}
                    className={cn(
                      "p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer",
                      copiedCode === 'EMBARQUES' ? "text-emerald-600" : "text-stone-400 hover:text-stone-700"
                    )}
                  >
                    {copiedCode === 'EMBARQUES' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 border-l border-[#ded5c6]/60 pl-3.5">
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(true)}
                    className="bg-[#9b1526] hover:bg-[#831220] text-white text-[10px] font-mono font-black uppercase tracking-wider py-1.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Clipboard size={12} /> COLAR PLANILHA TSV
                  </button>

                  <button
                    type="button"
                    onClick={() => parseInput(SAMPLE_TSV_DATA)}
                    className="bg-white hover:bg-stone-50 border border-[#ded5c6] text-stone-800 text-[10px] font-mono font-black uppercase py-1.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} className="text-[#9b1526]" /> EXEMPLO
                  </button>

                  {parsedRows.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="bg-white hover:bg-red-50/50 border border-red-200 text-red-700 text-[10px] font-mono font-black uppercase py-1.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} /> LIMPAR
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Search Input Filter bar */}
            <div className="relative w-full">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por placa, nota, protocolo ou destino..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#ded5c6] focus:border-[#9b1526]/50 rounded-2xl text-xs font-sans font-bold text-stone-950 placeholder:text-stone-400 outline-none transition-all shadow-sm"
              />
            </div>

            {/* CORPO DA MENSAGEM DE AVERBAÇÃO */}
            <div className="bg-white rounded-[24px] border border-[#ded5c6] p-5 shadow-sm flex flex-col w-full h-auto">
              
              {/* Header Box within Email Body card */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4 gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9b1526] flex items-center justify-center border border-red-100 shadow-2xs">
                    <Clipboard size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black text-[#9b1526] uppercase tracking-wider block">
                      FORMATO PARA CLIENTE DE E-MAIL
                    </span>
                    <h3 className="font-sans font-black text-xs sm:text-sm text-stone-900 uppercase tracking-wide leading-none mt-1">
                      CORPO DA MENSAGEM DE AVERBAÇÃO
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyToEmail}
                  className="px-4 py-2 bg-[#9b1526] hover:bg-[#831220] text-white rounded-xl font-mono font-black text-[10px] uppercase flex items-center gap-1.5 transition-all shadow-sm border border-red-950/10 cursor-pointer active:scale-95"
                >
                  <Clipboard size={12} />
                  <span>{copied ? 'COPIADO COM SUCESSO!' : 'COPIAR FORMATADO'}</span>
                </button>
              </div>

              {/* Styled Interactive Simulated Email Display */}
              <div className="space-y-4 text-black text-xs leading-relaxed font-sans bg-[#fbf9f5]/20 p-5 rounded-2xl border border-stone-200 shadow-inner w-full h-auto text-left">
                <p className="font-bold text-stone-850 text-[13px]">{getGreeting()}!</p>
                
                <p className="text-stone-750 font-medium">
                  Segue <span className="font-sans font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs border transition-all duration-350" style={{ backgroundColor: activeTheme.color, color: activeTheme.textColor }}>averbação</span> realizada via sistema.
                </p>

                <div className={cn("space-y-1 font-black text-black py-2 pl-4 bg-stone-50/70 rounded-r-xl transition-all duration-350", activeTheme.borderStyle)}>
                  <p className="text-[11px] uppercase tracking-wide">
                    ROTA: <span className="text-stone-900 font-mono font-extrabold">{getRoute().toUpperCase()}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-wide">
                    PROTOCOLO: <span className="font-mono font-black text-[#0000FF]">{getProtocols().length > 0 ? getProtocols().join(', ') : '---'}</span>
                  </p>
                  <p className="text-[11px] tracking-wide">
                    Valor da Carga: <span className="font-mono font-black text-[#FF0000]">{getTotalValue()}</span>
                  </p>
                </div>

                <p className="text-stone-750 font-medium flex items-center gap-1.5">
                  <span>Segue dados e NFs em anexo:</span>
                </p>

                {/* Table Inside Email Preview Container */}
                <div className="overflow-x-auto w-full border border-stone-800 shadow-xs rounded-xl bg-white">
                  <table className="w-full text-center text-[10.5px] border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-black text-white uppercase font-black text-[9px] tracking-wider border-b border-stone-800">
                        <th className="p-3 border-r border-stone-800">ORIGEM</th>
                        <th className="p-3 border-r border-stone-800">DESTINO</th>
                        <th className="p-3 border-r border-stone-800">TRANSPORTADORA</th>
                        <th className="p-3 border-r border-stone-800">PLACA CAVALO</th>
                        <th className="p-3 border-r border-stone-800">PLACAS CARRETAS</th>
                        <th className="p-3 border-r border-stone-800">TECNOLOGIA</th>
                        <th className="p-3 border-r border-stone-800">NOME MOTORISTA</th>
                        <th className="p-3 border-r border-stone-800">CPF</th>
                        <th className="p-3 border border-stone-800">TELEFONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold uppercase text-[11px] border-b border-stone-800" style={{ color: activeTheme.textColor }}>
                        <td className="p-3 border-r border-stone-800" style={{ backgroundColor: activeTheme.color }}>{parsedRows[0]?.origem || 'SANTA LUZIA'}</td>
                        <td className="p-3 border-r border-stone-800" style={{ backgroundColor: activeTheme.color }}>{parsedRows[0]?.destino || '---'}</td>
                        <td className="p-3 border-r border-stone-800" style={{ backgroundColor: activeTheme.color }}>{extraData.transportadora || 'MODECENSE'}</td>
                        {/* Always gray Placa Cavalo cell */}
                        <td className="p-3 border-r border-stone-800 font-mono font-extrabold text-[#111827] bg-[#CCCCCC]">
                          {parsedRows[0]?.placaCav || '---'}
                        </td>
                        <td className="p-3 border-r border-stone-800 font-mono" style={{ backgroundColor: activeTheme.color }}>{getPlacasCarretas() || '---'}</td>
                        <td className="p-3 border-r border-stone-800" style={{ backgroundColor: activeTheme.color }}>{extraData.tecnologia || 'SIGHRA'}</td>
                        <td className="p-3 border-r border-stone-800" style={{ backgroundColor: activeTheme.color }}>{extraData.nomeMotorista || '---'}</td>
                        <td className="p-3 border-r border-stone-800 font-mono" style={{ backgroundColor: activeTheme.color }}>{extraData.cpf || '---'}</td>
                        <td className="p-3 border-stone-800 font-mono" style={{ backgroundColor: activeTheme.color }}>{extraData.telefone || '---'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-2 text-stone-700 font-extrabold text-[12px]">Att,</p>
              </div>

              {/* Footer Indicator info under email block */}
              <div className="flex flex-wrap items-center justify-between mt-4 pt-3.5 border-t border-stone-100 text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Total de rotas: <strong className="text-stone-700">1</strong></span>
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                  <span>Total de notas: <strong className="text-stone-700">{parsedRows.length}</strong></span>
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                  <span>Última atualização: <strong className="text-stone-700">25/09/2026 21:39</strong></span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sistema Online</span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN FOR OPERATION FIELDS (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-5 h-auto text-left">
            
            {/* DADOS OPERACIONAIS CARD CONTAINER */}
            <div className="bg-[#fbf9f5] border border-[#ded5c6] rounded-[24px] p-5 shadow-sm flex flex-col gap-4.5 relative h-fit">
              
              {/* Sidebar Title Header */}
              <div className="flex items-center justify-between border-b border-[#ded5c6]/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#9b1526]/10 flex items-center justify-center text-[#9b1526]">
                    <Building size={14} className="fill-[#9b1526]/15" />
                  </div>
                  <span className="text-[11.5px] font-mono font-black text-stone-900 uppercase tracking-wider">
                    DADOS OPERACIONAIS
                  </span>
                </div>
                <ChevronRight size={15} className="text-stone-400" />
              </div>

              {/* Bento Item 1: Transportadora Select box */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={12} className="text-[#9b1526]" /> TRANSPORTADORA
                </label>
                <select
                  value={extraData.transportadora}
                  onChange={(e) => saveData(parsedRows, { ...extraData, transportadora: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-[#ded5c6] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none uppercase cursor-pointer transition-all shadow-inner"
                >
                  <option value="">SELECIONE...</option>
                  {customTransportadoras.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {showAddTranspInput ? (
                  <div className="pt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                    <input
                      type="text"
                      value={newTranspName}
                      onChange={(e) => setNewTranspName(e.target.value.toUpperCase())}
                      placeholder="NOME DA TRANSPORTADORA"
                      className="w-full bg-[#fbf9f5] border border-[#ded5c6] focus:border-[#9b1526] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none uppercase shadow-inner"
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
                        className="px-2 py-1 text-[9px] font-mono font-bold text-stone-500 hover:text-stone-900 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomTransp}
                        className="px-3 py-1 bg-[#9b1526] hover:bg-[#831220] text-white rounded text-[9px] font-mono font-black uppercase shadow-sm"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddTranspInput(true)}
                    className="pt-1 text-[9.5px] font-mono font-black text-[#9b1526] hover:text-[#831220] hover:underline uppercase flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={11} /> ADICIONAR NOVA
                  </button>
                )}
              </div>

              {/* Bento Item 2: Tecnologia PGR */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} className="text-[#9b1526]" /> TECNOLOGIA PGR
                </label>
                <select
                  value={extraData.tecnologia}
                  onChange={(e) => saveData(parsedRows, { ...extraData, tecnologia: e.target.value })}
                  className="w-full bg-[#fbf9f5] border border-[#ded5c6] text-stone-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none uppercase cursor-pointer transition-all shadow-inner"
                >
                  <option value="">SELECIONE...</option>
                  <option value="SIGHRA">SIGHRA</option>
                  <option value="ONIXSAT">ONIXSAT</option>
                  <option value="AUTOTRAC">AUTOTRAC</option>
                  <option value="SASCAR">SASCAR</option>
                  <option value="OMNILINK">OMNILINK</option>
                  <option value="RASTREK">RASTREK</option>
                  <option value="SITRACK">SITRACK</option>
                  <option value="PÓSITRON">PÓSITRON</option>
                  <option value="NÃO POSSUI">NÃO POSSUI</option>
                </select>
              </div>

              {/* Bento Item 3: Nome do Condutor */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-[#9b1526]" /> NOME DO CONDUTOR
                </label>
                <div className="flex items-center gap-2.5 bg-[#fbf9f5] border border-[#ded5c6] rounded-lg px-2.5 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#9b1526]/10 flex items-center justify-center text-[#9b1526] shrink-0">
                    <User size={11} />
                  </div>
                  <input
                    type="text"
                    value={extraData.nomeMotorista}
                    onChange={(e) => saveData(parsedRows, { ...extraData, nomeMotorista: e.target.value.toUpperCase() })}
                    placeholder="NOME COMPLETO"
                    className="w-full bg-transparent text-stone-950 font-sans font-black text-xs focus:outline-none uppercase placeholder:text-stone-300"
                  />
                </div>
              </div>

              {/* Bento Item 4: CPF / Motorista */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={12} className="text-[#9b1526]" /> CPF / MOTORISTA
                </label>
                <div className="flex items-center gap-2.5 bg-[#fbf9f5] border border-[#ded5c6] rounded-lg px-2.5 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#9b1526]/10 flex items-center justify-center text-[#9b1526] shrink-0">
                    <CreditCard size={11} />
                  </div>
                  <input
                    type="text"
                    value={extraData.cpf}
                    onChange={(e) => saveData(parsedRows, { ...extraData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-transparent text-stone-950 font-mono font-bold text-xs focus:outline-none placeholder:text-stone-300"
                  />
                </div>
              </div>

              {/* Bento Item 5: Telefone / WhatsApp */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} className="text-[#9b1526]" /> TELEFONE / WHATSAPP
                </label>
                <div className="flex items-center gap-2.5 bg-[#fbf9f5] border border-[#ded5c6] rounded-lg px-2.5 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#9b1526]/10 flex items-center justify-center text-[#9b1526] shrink-0">
                    <Phone size={11} />
                  </div>
                  <input
                    type="text"
                    value={extraData.telefone}
                    onChange={(e) => saveData(parsedRows, { ...extraData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-transparent text-stone-950 font-mono font-bold text-xs focus:outline-none placeholder:text-stone-300"
                  />
                </div>
              </div>

              {/* Bento Item 6: Paleta de Cores do E-mail */}
              <div className="bg-white border border-[#ded5c6] rounded-xl p-3.5 shadow-2xs space-y-2">
                <label className="text-[9.5px] font-mono font-black text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    🎨 PALETA DE CORES DO E-MAIL
                  </span>
                  <span className={cn("text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded uppercase", activeTheme.badgeClass)}>
                    {emailColor}
                  </span>
                </label>
                
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'amarelo', label: 'Amarelo', colorClass: 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500' },
                    { id: 'vermelho', label: 'Vermelho', colorClass: 'bg-red-600 hover:bg-red-700 border-red-700' },
                    { id: 'azul', label: 'Azul', colorClass: 'bg-blue-600 hover:bg-blue-700 border-blue-700' },
                    { id: 'verde', label: 'Verde', colorClass: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700' }
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setEmailColor(color.id as any);
                        showNotificationMsg(`Formato de e-mail alterado para: ${color.label.toUpperCase()}`);
                      }}
                      className={cn(
                        "h-8 rounded-lg cursor-pointer transition-all duration-200 border flex items-center justify-center relative active:scale-95",
                        color.colorClass,
                        emailColor === color.id ? "scale-105 shadow-md border-stone-850 ring-2 ring-stone-900/10" : "opacity-85 border-transparent hover:opacity-100"
                      )}
                      title={color.label}
                    >
                      {emailColor === color.id && (
                        <Check size={14} className={cn("font-extrabold shadow-2xs", color.id === 'amarelo' ? 'text-stone-850' : 'text-white')} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ROTAS ATIVAS GORGEOUS BOTTOM WIDGET */}
            <div className="relative rounded-[24px] overflow-hidden border border-[#ded5c6] h-32 shadow-sm bg-stone-900 group">
              {/* Map background snippet */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/src/assets/images/hero_cinematic_rotas_1790216246671.jpg"
                  alt="Rotas Ativas Map"
                  className="w-full h-full object-cover filter brightness-[0.7] saturate-[1.2] group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/pgr_tactical_relief_map_1789796108088.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
              </div>

              {/* Rotas Ativas UI Overlay */}
              <div className="relative z-10 w-full h-full p-4.5 flex items-center justify-between text-left">
                <div>
                  <span className="text-[9.5px] font-sans font-black text-white uppercase tracking-wider opacity-90 block">
                    ROTAS ATIVAS
                  </span>
                  <div className="text-4xl font-mono font-black text-white mt-1 leading-none">
                    1
                  </div>
                  <span className="text-[10px] font-sans font-extrabold text-stone-300 uppercase tracking-wide block mt-1.5">
                    Em andamento
                  </span>
                </div>

                <button 
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer transition-transform group-hover:translate-x-0.5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. PREMIUM PASTE MODAL DIALOG                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPasteModal && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white border border-[#ded5c6] rounded-[28px] p-6 max-w-2xl w-full shadow-2xl relative flex flex-col gap-4 text-stone-900"
            >
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-[#ded5c6]/60 pb-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#9b1526] text-white flex items-center justify-center shadow-md">
                  <Clipboard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-black text-stone-950 uppercase leading-none">
                    Importador Planilha TSV / Excel
                  </h3>
                  <p className="text-[10px] text-stone-400 font-mono mt-1">
                    Copie e cole diretamente as linhas da planilha de seguros (com ou sem cabeçalhos).
                  </p>
                </div>
              </div>

              <textarea
                value={rawInputText}
                onChange={(e) => setRawInputText(e.target.value)}
                placeholder={`Cole as colunas tabuladas...\n\nExemplo:\n25/09/2026\tSANTA LUZIA\tLONDRINA\tQWA6A22\tDLV7307\t104582\tR$ 185.420,00\tR$ 324.998,00\tAVB-98124`}
                className="w-full h-44 p-3.5 bg-[#fbf9f5] border border-[#ded5c6] focus:border-[#9b1526]/50 rounded-2xl text-xs font-mono font-medium text-stone-900 focus:outline-none shadow-inner resize-none placeholder:text-stone-300"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRawInputText(SAMPLE_TSV_DATA)}
                  className="text-[10px] font-mono font-black text-[#9b1526] hover:text-[#831220] cursor-pointer uppercase flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Carregar exemplo simulado
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#ded5c6] text-[10px] font-mono font-black uppercase text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => parseInput(rawInputText)}
                    className="px-5 py-2.5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-xl text-[10px] font-mono font-black uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Importar registros
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Averbacao;
