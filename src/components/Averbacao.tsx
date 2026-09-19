import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clipboard,
  FileSpreadsheet,
  Copy,
  Check,
  Trash2,
  FileText,
  Truck,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Coffee,
  X,
  User,
  ShieldCheck,
  RefreshCw,
  Mail,
  ArrowRight,
  ChevronDown,
  Phone,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_TRANSPORTADORAS, findClosestTransportador } from '../data/transportadoras';
import { DESTINOS_PADRAO } from './Escala';

// Parafuso decorativo de latão idêntico ao conversor de terceiros / escala
function Screw({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

// Placa oficial no padrão Mercosul (Brasil) idêntica à de TerceirosEscala
function MercosulPlate({ plate, className }: { plate: string; className?: string }) {
  if (!plate || plate === '-' || plate.trim() === '') {
    return <span className="text-stone-400 font-mono font-bold text-[10px]">-</span>;
  }
  const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[104px] h-[32px] shrink-0 rounded-[5px] shadow-[0_2px_4px_rgba(0,0,0,0.25)] border-2 border-[#1c1c1c] bg-white transition-transform hover:scale-105 cursor-default",
        className
      )}
      title={`Placa Mercosul Cavalo: ${clean}`}
    >
      <div className="w-full bg-[#003399] h-[9px] flex items-center justify-between px-1 leading-none relative">
        <span className="text-[5px] text-white font-sans font-bold tracking-tight">BR</span>
        <span className="text-[6px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          BRASIL
        </span>
        <div className="w-[7px] h-[5px] bg-[#009b3a] border border-white/30 flex items-center justify-center relative rounded-[1px] overflow-hidden shrink-0">
          <div className="w-[4px] h-[2.5px] bg-[#ffdf00] rotate-45 transform flex items-center justify-center">
            <div className="w-[1.4px] h-[1.4px] bg-[#002776] rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex items-center justify-center bg-gradient-to-b from-[#ffffff] via-[#fafafa] to-[#ece8df] px-1">
        <span
          className="text-[#151515] font-black text-[12.5px] tracking-wider leading-none select-all"
          style={{
            fontFamily: "'FE-Font', 'Courier New', monospace, sans-serif",
            letterSpacing: '0.08em',
            textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.9)'
          }}
        >
          {clean}
        </span>
      </div>
    </div>
  );
}

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

const SAMPLE_TSV_DATA = `16/09/2026\tSANTA LUZIA\tLONDRINA\tQWK6A22\tOLN7307\t104582\tR$ 185.420,00\tR$ 324.950,00\tAVB-2026-98124
16/09/2026\tSANTA LUZIA\tLONDRINA\tQWK6A22\tFIW0188\t104583\tR$ 139.530,00\tR$ 324.950,00\tAVB-2026-98125`;

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
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'prancheta' | 'email_preview'>('prancheta');

  // Notificações Toast
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'delete' | 'info';
  }>({ show: false, message: '' });

  // Copiar código rápido
  const copyCodeToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(label);
      setNotification({
        show: true,
        message: `Código ${label} (${value}) copiado com sucesso!`,
        type: 'success'
      });
      setTimeout(() => {
        setCopiedCode(null);
        setNotification({ show: false, message: '' });
      }, 2500);
    } catch (e) {
      console.error("Erro ao copiar código:", e);
    }
  };

  // Carregar dados salvos no Firebase / LocalStorage
  useEffect(() => {
    const fetchData = async () => {
      const localSaved = localStorage.getItem('backup_averbacao_data');
      if (localSaved) {
        try {
          const data = JSON.parse(localSaved);
          if (data.parsedRows && data.parsedRows.length > 0) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(prev => ({ ...prev, ...data.extraData }));
        } catch (e) {
          console.error("Local backup parse error:", e);
        }
      }

      try {
        const docRef = doc(db, DATA_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.parsedRows && data.parsedRows.length > 0) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(prev => ({ ...prev, ...data.extraData }));
        }
      } catch (error) {
        console.warn("Firestore offline or inaccessible. Operating with local backup:", error);
      }
    };
    fetchData();
  }, []);

  // Salvar no storage
  const saveData = async (rows: RawData[], extra: ExtraData) => {
    setParsedRows(rows);
    setExtraData(extra);
    localStorage.setItem('backup_averbacao_data', JSON.stringify({ parsedRows: rows, extraData: extra }));

    try {
      await setDoc(doc(db, DATA_PATH), { parsedRows: rows, extraData: extra });
    } catch (error) {
      console.warn("Failed to sync with Firestore:", error);
    }
  };

  // Parser de dados de planilha
  const parseInput = (text: string) => {
    setRawInputText(text);
    if (!text.trim()) return;

    const lines = text.trim().split('\n');
    const newRows: RawData[] = [];
    
    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      // Se não for tab, tenta por ponto e vírgula ou múltiplos espaços
      const cleanParts = parts.length >= 5 ? parts : line.split(';').map(p => p.trim());

      if (cleanParts.length >= 4) {
        newRows.push({
          dataAverbacao: cleanParts[0] || new Date().toLocaleDateString('pt-BR'),
          origem: cleanParts[1] || 'SANTA LUZIA',
          destino: cleanParts[2] || 'LONDRINA',
          placaCav: (cleanParts[3] || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
          placaCarr: (cleanParts[4] || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
          nf: cleanParts[5] || '',
          valorNf: cleanParts[6] || '',
          somaVl: cleanParts[7] || cleanParts[6] || '',
          protocolo: cleanParts[8] || ''
        });
      }
    });

    if (newRows.length > 0) {
      saveData(newRows, extraData);
      setNotification({
        show: true,
        message: `${newRows.length} linha(s) de averbação importada(s) com sucesso!`,
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 3500);
      setShowPasteModal(false);
    }
  };

  // Carregar Exemplo Real
  const handleLoadSample = () => {
    parseInput(SAMPLE_TSV_DATA);
    saveData(
      [
        {
          dataAverbacao: '16/09/2026',
          origem: 'SANTA LUZIA',
          destino: 'LONDRINA',
          placaCav: 'QWK6A22',
          placaCarr: 'OLN7307',
          nf: '104582',
          valorNf: 'R$ 185.420,00',
          somaVl: 'R$ 324.950,00',
          protocolo: 'AVB-2026-98124'
        },
        {
          dataAverbacao: '16/09/2026',
          origem: 'SANTA LUZIA',
          destino: 'LONDRINA',
          placaCav: 'QWK6A22',
          placaCarr: 'FIW0188',
          nf: '104583',
          valorNf: 'R$ 139.530,00',
          somaVl: 'R$ 324.950,00',
          protocolo: 'AVB-2026-98125'
        }
      ],
      {
        transportadora: 'MOEDENSE',
        tecnologia: 'SIGHRA',
        nomeMotorista: 'ROBSON LUIS VIEIRA',
        cpf: '051.848.966-09',
        telefone: '(31) 99935-0970'
      }
    );
    setNotification({
      show: true,
      message: 'Exemplo de averbação com dados reais carregado!',
      type: 'success'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Limpar dados
  const handleClearAll = () => {
    if (parsedRows.length === 0 && !extraData.nomeMotorista) return;
    if (!window.confirm('Deseja realmente limpar todos os registros e formulários de averbação?')) {
      return;
    }
    const emptyRows: RawData[] = [];
    const emptyExtra: ExtraData = {
      transportadora: 'MOEDENSE',
      tecnologia: 'SIGHRA',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    };
    setRawInputText('');
    saveData(emptyRows, emptyExtra);
    setNotification({
      show: true,
      message: 'Todos os dados de averbação foram limpos.',
      type: 'delete'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  // Excluir linha individual
  const handleDeleteRow = (idx: number) => {
    const updated = parsedRows.filter((_, i) => i !== idx);
    saveData(updated, extraData);
    setNotification({
      show: true,
      message: 'Registro removido da averbação.',
      type: 'info'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 2500);
  };

  // Informações calculadas
  const getTotalValue = () => {
    for (let i = parsedRows.length - 1; i >= 0; i--) {
      if (parsedRows[i].somaVl && parsedRows[i].somaVl.trim() !== '') return parsedRows[i].somaVl;
    }
    return 'R$ 0,00';
  };

  const getRoute = () => {
    if (parsedRows.length === 0) return 'ORIGEM x DESTINO';
    const row = parsedRows[0];
    return `${row.origem} x ${row.destino}`;
  };

  const getPlacasCarretas = () => [...new Set(parsedRows.map(r => r.placaCarr).filter(p => !!p))].join(' / ');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 && hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const getProtocols = () => {
    const protocols = parsedRows
      .map(r => r.protocolo?.trim())
      .filter(p => !!p);
    return [...new Set(protocols)];
  };

  // Copiar formato HTML idêntico para colar diretamente no Outlook / Gmail
  const copyToEmail = async () => {
    const greeting = getGreeting();
    const protocols = getProtocols();
    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14.5px; color: #000000; line-height: 1.6; padding: 25px 15px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">${greeting}!</p>
        
        <p style="margin: 0 0 25px 0; font-size: 14.5px; color: #000000;">Segue <span style="background-color: #ffff00; font-weight: bold; padding: 1px 3px; border-radius: 2px;">averbação</span> realizada via sistema.</p>
        
        <p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000; text-transform: uppercase;">ROTA: ${getRoute().toUpperCase()}</p>
        ${protocols.length > 0 
          ? protocols.map(p => `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">${p}</span></p>`).join('') 
          : `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">---</span></p>`
        }
        <p style="margin: 0 0 25px 0; font-size: 14.5px; font-weight: bold; color: #000000;">Valor da Carga: <span style="color: #ff0000;">${getTotalValue()}</span></p>
        
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">Segue dados e NF's em anexo.</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #000000; font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-align: center; width: 100%; max-width: 900px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff; text-transform: uppercase; font-weight: bold;">
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">ORIGEM</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">DESTINO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TRANSPORTADORA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">PLACA CAVALO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">PLACAS CARRETAS</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TECNOLOGIA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">NOME MOTORISTA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">CPF</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 10%;">TELEFONE</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-weight: bold; text-transform: uppercase; color: #000000;">
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.origem || 'SANTA LUZIA'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.destino || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.transportadora || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #cccccc;">${parsedRows[0]?.placaCav || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${getPlacasCarretas() || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.tecnologia || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.nomeMotorista || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.cpf || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.telefone || '---'}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin: 0; color: #000000; font-size: 14.5px;">Att,</p>
      </div>
    `;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlContent], { type: 'text/html' }) })]);
      setCopied(true);
      setNotification({
        show: true,
        message: 'E-mail formatado copiado! Basta colar (Ctrl+V) no Outlook ou Gmail.',
        type: 'success'
      });
      setTimeout(() => {
        setCopied(false);
        setNotification({ show: false, message: '' });
      }, 3500);
    } catch (err) {
      console.error("Clipboard HTML write error:", err);
    }
  };

  // Linhas filtradas para busca rápida
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return parsedRows;
    const term = searchTerm.toLowerCase();
    return parsedRows.filter(
      r =>
        r.placaCav.toLowerCase().includes(term) ||
        r.placaCarr.toLowerCase().includes(term) ||
        r.nf.toLowerCase().includes(term) ||
        r.protocolo.toLowerCase().includes(term) ||
        r.destino.toLowerCase().includes(term) ||
        r.origem.toLowerCase().includes(term)
    );
  }, [parsedRows, searchTerm]);

  return (
    <div className="w-full flex flex-col min-h-screen relative p-1 sm:p-3 md:p-4 pb-16 font-sans">
      
      {/* Toast de Notificação idêntico ao de Escala/Terceiros */}
      {notification.show && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all text-xs font-bold uppercase tracking-wider font-mono",
            notification.type === 'delete' 
              ? "bg-[#2b140d] text-rose-300 border-rose-800/80 shadow-rose-950/50" 
              : notification.type === 'info'
                ? "bg-[#2b140d] text-amber-300 border-amber-800/80 shadow-amber-950/50"
                : "bg-[#1f2e1b] text-emerald-300 border-emerald-800/80 shadow-emerald-950/50"
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

      {/* Prancheta Master Vintage Wood Frame com Grampo de Latão e Estilo Escala */}
      <div 
        className="w-full rounded-[2rem] p-3 sm:p-5 md:p-6 shadow-2xl border-4 border-[#311f14] relative flex flex-col gap-4 overflow-visible"
        style={{
          backgroundColor: '#402615',
          backgroundImage: 'linear-gradient(135deg, rgba(64, 38, 21, 0.95) 0%, rgba(38, 21, 10, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Grampo Metálico Superior da Prancheta */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 bg-gradient-to-b from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-t-xl border-2 border-[#2b170c] shadow-lg flex items-center justify-center z-30 pointer-events-none">
          <div className="w-32 sm:w-44 h-2 bg-[#2b170c]/70 rounded-full shadow-inner" />
        </div>

        {/* Painel Pergaminho Principal (Idêntico a TerceirosEscala) */}
        <div
          className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
          }}
        >
          {/* Borda interna decorativa */}
          <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />

          {/* Parafusos de latão nas quinas */}
          <Screw className="absolute top-3 left-3 z-20" />
          <Screw className="absolute top-3 right-3 z-20" />
          <Screw className="absolute bottom-3 left-3 z-20" />
          <Screw className="absolute bottom-3 right-3 z-20" />

          {/* Conteúdo Principal do Parchment */}
          <div className="p-4 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

            {/* Top Area: Splitted into Left (Emblem Badge) and Right (Banner + Header + Black Tag) */}
            <div className="flex flex-col md:flex-row gap-5 items-stretch">
              
              {/* Left Col: Emblem Card idêntico ao Conversor de Terceiros */}
              <div className="w-28 h-28 md:w-[26%] md:min-w-[210px] md:max-w-[240px] md:h-auto rounded-2xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-gradient-to-b from-[#2a170d] to-[#150a04] flex flex-col items-center justify-center p-4 text-center">
                <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/30 pointer-events-none" />
                
                {/* Logo Emblem */}
                <div className="w-16 h-16 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg mb-2 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={28} className="text-[#D4AF37]" />
                  <div className="absolute inset-1 border border-dashed border-[#D4AF37]/50 rounded-full" />
                </div>

                <span className="text-[#e2cfb9] font-serif font-black text-xs uppercase tracking-widest leading-tight">
                  Averbação de Carga
                </span>
                <span className="text-[10px] text-[#D4AF37] font-mono font-bold mt-0.5 tracking-wider uppercase">
                  Central de Apólices & NF
                </span>

                <div className="mt-3 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#f5ebd7] uppercase tracking-wider">
                  SISTEMA PGR • FORMATO E-MAIL
                </div>
              </div>

              {/* Right Col: 4K Banner + Inspirational Quote + Title + Signature Black Passion Tag */}
              <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
                
                {/* 4K Aesthetic Banner idêntico ao de Escala */}
                <div className="w-full h-24 md:h-28 rounded-xl overflow-hidden border-2 border-[#5c3e29]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative group hidden sm:block">
                  <img 
                    src="/images/banner_coffee.jpg"
                    alt="Aesthetic Banner"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter sepia-[20%] contrast-[1.1] brightness-90 relative z-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none z-10" />
                  <div className="absolute bottom-2 left-4 z-20 flex items-center gap-2">
                    <span className="bg-[#B32025] text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                      GESTÃO DE RISCO & SEGUROS
                    </span>
                    <span className="text-white text-[10px] font-semibold drop-shadow-md">
                      Santa Luzia / MG — Brasil
                    </span>
                  </div>
                </div>

                {/* Inspirational Quote */}
                <p className="w-full text-[#3d2415] font-serif italic text-xs sm:text-sm text-center leading-snug px-2">
                  "A conformidade de seguro e a averbação pontual garantem a integridade da frota e a tranquilidade de cada viagem na estrada."
                </p>

                {/* Bottom Row: Titles & Signature Black Passion Tag */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="pb-1">
                    <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                      Módulo Integrado de Averbação de Seguros
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                      AVERBAÇÃO: <span className="text-[#B32025]">{parsedRows.length} NOTAS / {parsedRows[0]?.placaCav || 'FROTA'}</span>
                    </h1>
                  </div>

                  {/* Signature Black Tag: Feito com paixão */}
                  <div className="hidden lg:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-3 px-4.5 items-center justify-center gap-3.5 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative shrink-0">
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    
                    <div className="w-8 h-8 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                      <Coffee className="text-[#cfab84]" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-handwritten text-[#e5d5c1] text-base font-bold leading-none mb-0.5">Feito com paixão.</span>
                      <span className="font-handwritten text-[#e5d5c1]/70 text-[11px] font-medium leading-none">Para quem entrega.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Codes Pill Bar (Estilo Escala Wood/Brass) */}
            <div className="bg-[#FAF6ED] border-2 border-[#d6be9c] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B32025] animate-pulse inline-block" />
                <span className="text-[11px] font-black text-[#3A2414] uppercase tracking-wider font-mono">
                  CÓDIGOS RÁPIDOS DA OPERAÇÃO:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {QUICK_CODES.map((item) => (
                  <div 
                    key={item.label}
                    className="flex items-center gap-2 bg-white border border-[#d6be9c] rounded-xl px-2.5 py-1 shadow-xs group hover:border-[#B32025] transition-all"
                  >
                    <span className="text-[10px] font-bold text-[#5c3e29] uppercase">{item.label}:</span>
                    <code className="text-xs font-mono font-black text-[#B32025] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      {item.value}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCodeToClipboard(item.label, item.value)}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border",
                        copiedCode === item.label
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-[#B32025] hover:bg-[#8c060a] border-[#8c060a] text-white"
                      )}
                      title={`Copiar código ${item.label}`}
                    >
                      {copiedCode === item.label ? <Check size={10} /> : <Copy size={10} />}
                      <span>{copiedCode === item.label ? 'OK' : 'COPIAR'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Aba Navigation idêntica à Escala (Conversor de Averbação vs Pré-visualização do E-mail) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#5c3e29]/20 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('prancheta')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                    activeSubTab === 'prancheta'
                      ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border border-[#5c3e29] shadow-md scale-102"
                      : "bg-[#FAF6ED] text-[#5c3e29] border border-[#d6be9c] hover:bg-white"
                  )}
                >
                  <FileSpreadsheet size={15} />
                  <span>1. Prancheta de Averbação</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#B32025] text-white text-[10px] font-mono font-bold">
                    {parsedRows.length} NF
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('email_preview')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                    activeSubTab === 'email_preview'
                      ? "bg-gradient-to-b from-[#3A2414] to-[#1f1208] text-[#f5ebd7] border border-[#5c3e29] shadow-md scale-102"
                      : "bg-[#FAF6ED] text-[#5c3e29] border border-[#d6be9c] hover:bg-white"
                  )}
                >
                  <Mail size={15} />
                  <span>2. Pré-visualização do E-mail</span>
                </button>
              </div>

              {/* Botões de Ação Principais */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20"
                >
                  <Clipboard size={15} className="stroke-[2.5]" />
                  <span>Colar Planilha TSV</span>
                </button>

                <button
                  type="button"
                  onClick={copyToEmail}
                  disabled={parsedRows.length === 0}
                  className={cn(
                    "text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20 disabled:opacity-40",
                    copied
                      ? "bg-[#2e7d32] text-white"
                      : "bg-gradient-to-b from-[#3A2414] to-[#1f1208] hover:from-[#4d321d] hover:to-[#2b190c] text-[#f5ebd7]"
                  )}
                >
                  {copied ? <Check size={15} className="stroke-[3]" /> : <Mail size={15} />}
                  <span>{copied ? 'E-mail Copiado!' : 'Copiar p/ E-mail'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="bg-[#FAF6ED] hover:bg-white text-[#5c3e29] border border-[#d6be9c] text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                  title="Carregar exemplo real de averbação com 2 notas"
                >
                  <Sparkles size={14} className="text-[#B32025]" />
                  <span>Exemplo</span>
                </button>

                {parsedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="bg-[#FAF6ED] hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                    title="Limpar todos os dados"
                  >
                    <Trash2 size={14} />
                    <span>Limpar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Painel de Campos Operacionais Fixos (Transportador, Tecnologia, Condutor, CPF, Telefone) */}
            <div className="bg-[#FAF6ED] border border-[#d6be9c] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-[#d6be9c]/60 pb-2">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#B32025]" />
                  <span className="text-xs font-black text-[#3A2414] uppercase tracking-wider font-heading">
                    Dados Operacionais do Condutor & Transportador (Cabeçalho do E-mail)
                  </span>
                </div>
                <span className="text-[10px] text-[#7a5b44] font-bold">
                  Sincronizado automaticamente com o modelo oficial
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Transportadora */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider flex items-center gap-1">
                    <Building size={12} className="text-[#B32025]" /> Transportadora
                  </label>
                  <select
                    value={extraData.transportadora}
                    onChange={(e) => saveData(parsedRows, { ...extraData, transportadora: e.target.value })}
                    className="w-full bg-white border border-[#d6be9c] text-[#3A2414] rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-[#B32025] uppercase cursor-pointer shadow-xs"
                  >
                    {DEFAULT_TRANSPORTADORAS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Tecnologia */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} className="text-[#B32025]" /> Tecnologia
                  </label>
                  <input
                    type="text"
                    value={extraData.tecnologia}
                    onChange={(e) => saveData(parsedRows, { ...extraData, tecnologia: e.target.value.toUpperCase() })}
                    placeholder="Ex: SIGHRA, AUTOTRAC"
                    className="w-full bg-white border border-[#d6be9c] text-[#3A2414] rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-[#B32025] uppercase shadow-xs"
                  >
                  </input>
                </div>

                {/* Condutor */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider flex items-center gap-1">
                    <User size={12} className="text-[#B32025]" /> Nome do Condutor
                  </label>
                  <input
                    type="text"
                    value={extraData.nomeMotorista}
                    onChange={(e) => saveData(parsedRows, { ...extraData, nomeMotorista: e.target.value.toUpperCase() })}
                    placeholder="NOME COMPLETO"
                    className="w-full bg-white border border-[#d6be9c] text-[#3A2414] rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-[#B32025] uppercase shadow-xs"
                  />
                </div>

                {/* CPF */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider flex items-center gap-1">
                    <CreditCard size={12} className="text-[#B32025]" /> CPF
                  </label>
                  <input
                    type="text"
                    value={extraData.cpf}
                    onChange={(e) => saveData(parsedRows, { ...extraData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-white border border-[#d6be9c] text-[#3A2414] rounded-xl px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#B32025] shadow-xs"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider flex items-center gap-1">
                    <Phone size={12} className="text-[#B32025]" /> Telefone
                  </label>
                  <input
                    type="text"
                    value={extraData.telefone}
                    onChange={(e) => saveData(parsedRows, { ...extraData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white border border-[#d6be9c] text-[#3A2414] rounded-xl px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#B32025] shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Visualização: Prancheta vs Pré-visualização do E-mail */}
            {activeSubTab === 'prancheta' ? (
              <div className="flex flex-col gap-4">
                
                {/* Search / Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF6ED] p-3 rounded-2xl border border-[#d6be9c]">
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar por Placa, Nota Fiscal, Protocolo ou Destino..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-xs font-bold text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] shadow-inner"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-black text-[#5c3e29] uppercase tracking-widest block">
                        VALOR TOTAL AVERBADO
                      </span>
                      <span className="text-sm font-black font-mono text-[#B32025]">
                        {getTotalValue()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabela Oficial Idêntica à de Terceiros */}
                <div className="rounded-2xl border-2 border-[#5c3e29] overflow-hidden shadow-lg bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#2a170d] via-[#3a200a] to-[#1a0c04] text-white">
                          <th className="py-3 px-3.5 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Data
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Origem
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Destino
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Placa Cavalo
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Placa Carreta
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Nota Fiscal
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Valor NF
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Soma / Carga
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                            Protocolo
                          </th>
                          <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-right pr-4">
                            Ações
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#ebd9c1]">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-14 text-center text-stone-400 font-medium">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <FileSpreadsheet size={40} className="text-[#d6be9c]" />
                                <p className="font-bold text-[#3A2414] text-sm">
                                  Nenhum registro de averbação carregado até o momento
                                </p>
                                <p className="text-xs text-[#7a5b44] max-w-md">
                                  Clique em <strong>"Colar Planilha TSV"</strong> acima para importar os dados da planilha de averbação ou em <strong>"Exemplo"</strong> para conferir o preenchimento.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row, index) => (
                            <tr
                              key={index}
                              className={cn(
                                "transition-colors group",
                                index % 2 === 0 ? "bg-white hover:bg-[#FAF6ED]" : "bg-[#FAF6ED]/60 hover:bg-[#FAF6ED]"
                              )}
                            >
                              {/* Data */}
                              <td className="py-2.5 px-3.5 font-mono font-bold text-xs text-[#5c3e29]">
                                {row.dataAverbacao || '-'}
                              </td>

                              {/* Origem */}
                              <td className="py-2.5 px-3 font-bold text-xs uppercase text-[#3A2414]">
                                {row.origem || 'SANTA LUZIA'}
                              </td>

                              {/* Destino */}
                              <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#B32025] uppercase">
                                {row.destino || '-'}
                              </td>

                              {/* Placa Cavalo Mercosul */}
                              <td className="py-2 px-3 align-middle">
                                <MercosulPlate plate={row.placaCav} />
                              </td>

                              {/* Placa Carreta */}
                              <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#5c3e29]">
                                {row.placaCarr ? (
                                  <span className="bg-[#f0e2cf] text-[#4a301e] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#d6be9c]/60 shadow-xs">
                                    {row.placaCarr}
                                  </span>
                                ) : (
                                  <span className="text-stone-300 italic text-[10px]">-</span>
                                )}
                              </td>

                              {/* Nota Fiscal */}
                              <td className="py-2.5 px-3 font-mono font-black text-xs text-[#3A2414]">
                                {row.nf ? (
                                  <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-md border border-slate-300">
                                    {row.nf}
                                  </span>
                                ) : '-'}
                              </td>

                              {/* Valor NF */}
                              <td className="py-2.5 px-3 font-mono font-bold text-xs text-slate-800">
                                {row.valorNf || '-'}
                              </td>

                              {/* Soma da Carga */}
                              <td className="py-2.5 px-3 font-mono font-black text-xs text-emerald-800">
                                {row.somaVl || '-'}
                              </td>

                              {/* Protocolo */}
                              <td className="py-2.5 px-3 font-mono font-bold text-xs text-blue-700">
                                {row.protocolo ? (
                                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                                    {row.protocolo}
                                  </span>
                                ) : '-'}
                              </td>

                              {/* Ações */}
                              <td className="py-2.5 px-3 text-right pr-4">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(index)}
                                  className="p-1.5 text-stone-400 hover:text-[#B32025] hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                  title="Remover linha"
                                >
                                  <Trash2 size={14} />
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
              /* Sub-Aba 2: Pré-visualização do E-mail (Idêntico ao layout clássico mas estilizado como documento oficial) */
              <div className="bg-white rounded-2xl border-2 border-[#5c3e29] p-6 sm:p-8 shadow-xl">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#B32025] uppercase bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                      FORMATO EXATO PARA CLIENTE DE E-MAIL
                    </span>
                    <h3 className="font-serif font-black text-lg text-[#3A2414] mt-1 uppercase">
                      Corpo da Mensagem de Averbação
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={copyToEmail}
                    className="px-5 py-2.5 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Clipboard size={14} />
                    <span>{copied ? 'COPIADO COM SUCESSO!' : 'COPIAR FORMATADO'}</span>
                  </button>
                </div>

                {/* Email Body Preview */}
                <div className="space-y-5 text-slate-900 text-sm leading-relaxed font-sans bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                  <p className="font-semibold text-base">{getGreeting()}!</p>
                  <p>
                    Segue <span className="bg-yellow-300 font-bold px-1.5 py-0.5 rounded text-slate-950 border border-yellow-400">averbação</span> realizada via sistema.
                  </p>

                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#3A2414]/15 space-y-1.5 font-bold text-[#2B180D] shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#2B180D]/70 font-mono">ROTA:</span>
                      <span className="uppercase text-[#2B180D] font-mono">{getRoute()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#2B180D]/70 font-mono">PROTOCOLO(S):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {getProtocols().length > 0 ? (
                          getProtocols().map(p => (
                            <span key={p} className="text-[#B32025] font-mono bg-white px-2 py-0.5 rounded border border-[#3A2414]/20">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 font-mono">---</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#2B180D]/70 font-mono">VALOR DA CARGA:</span>
                      <span className="text-[#B32025] font-mono text-base font-black">{getTotalValue()}</span>
                    </div>
                  </div>

                  <p>Segue dados e NF's em anexo.</p>

                  {/* Tabela do E-mail */}
                  <div className="overflow-x-auto my-4 border border-slate-300 rounded-xl shadow-xs">
                    <table className="w-full text-center text-xs border-collapse min-w-[780px]">
                      <thead>
                        <tr className="bg-[#2B180D] text-white uppercase font-bold text-[10px] tracking-wider">
                          <th className="p-3 border border-[#3A2414]">ORIGEM</th>
                          <th className="p-3 border border-[#3A2414]">DESTINO</th>
                          <th className="p-3 border border-[#3A2414]">TRANSPORTADORA</th>
                          <th className="p-3 border border-[#3A2414]">PLACA CAVALO</th>
                          <th className="p-3 border border-[#3A2414]">PLACAS CARRETAS</th>
                          <th className="p-3 border border-[#3A2414]">TECNOLOGIA</th>
                          <th className="p-3 border border-[#3A2414]">NOME MOTORISTA</th>
                          <th className="p-3 border border-[#3A2414]">CPF</th>
                          <th className="p-3 border border-[#3A2414]">TELEFONE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="font-bold text-slate-900 uppercase">
                          <td className="p-3.5 border border-slate-300 bg-yellow-300">{parsedRows[0]?.origem || 'SANTA LUZIA'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300">{parsedRows[0]?.destino || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300">{extraData.transportadora || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-slate-200 font-mono">{parsedRows[0]?.placaCav || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300 font-mono">{getPlacasCarretas() || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300">{extraData.tecnologia || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300">{extraData.nomeMotorista || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300 font-mono">{extraData.cpf || '---'}</td>
                          <td className="p-3.5 border border-slate-300 bg-yellow-300 font-mono">{extraData.telefone || '---'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="pt-2 font-medium">Att,</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal: Colar Dados da Planilha (TSV / Excel) */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#FAF6ED] border-4 border-[#5c3e29] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#d6be9c] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#B32025] text-white flex items-center justify-center shadow-md">
                <Clipboard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-[#3A2414] uppercase">
                  Colar Dados da Planilha (TSV / Excel)
                </h3>
                <p className="text-xs text-[#7a5b44]">
                  Copie as linhas da planilha de averbação (com ou sem cabeçalho) e cole diretamente aqui.
                </p>
              </div>
            </div>

            <textarea
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder={`Cole aqui as linhas da planilha...\nExemplo:\n16/09/2026\tSANTA LUZIA\tLONDRINA\tQWK6A22\tOLN7307\t104582\tR$ 185.420,00\tR$ 324.950,00\tAVB-98124`}
              className="w-full h-44 p-3.5 bg-white border-2 border-[#d6be9c] rounded-2xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-[#B32025] shadow-inner resize-none"
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRawInputText(SAMPLE_TSV_DATA)}
                className="text-xs font-black text-[#B32025] hover:underline cursor-pointer uppercase flex items-center gap-1 font-mono"
              >
                <Sparkles size={14} /> Usar dados de exemplo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold uppercase text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => parseInput(rawInputText)}
                  className="px-6 py-2.5 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer active:scale-97"
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
