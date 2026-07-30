import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatioItem } from '../data/patioData';
import { cn } from '../lib/utils';
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from '../utils/principles';
import { 
  Truck, 
  Trash2, 
  Loader2, 
  Activity, 
  ShieldCheck, 
  Search, 
  Plus, 
  Database,
  Image as ImageIcon,
  ChevronLeft,
  Copy,
  Check,
  Cpu,
  UploadCloud,
  Edit,
  X,
  Save,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { rtdb as db, handleFirestoreError, OperationType } from '../firebase';

interface PatioProps {
  onBack?: () => void;
}

// Slotted Vintage Flat-head Screw Component for authentic industrial look
function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      {/* Screw threads flat groove */}
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

// Custom WoodenPlaque Wrapper representing heavy industrial brass or high-contrast wood plaques
const WoodenPlaque: React.FC<{
  children: React.ReactNode;
  className?: string;
  screwSize?: string;
}> = ({ children, className, screwSize }) => {
  return (
    <div 
      className={cn(
        "rounded-2xl bg-gradient-to-br from-[#f8f1e5] via-[#eddaba] to-[#e4cbab] border-[6px] border-[#311f14] shadow-[0_22px_45px_rgba(0,0,0,0.88),inset_1.5px_1.5px_3px_rgba(255,255,255,0.45)] relative p-6 flex flex-col justify-between ring-2 ring-[#1c1109]/30",
        className
      )}
    >
      {/* Corner screws */}
      <Screw className={cn("absolute top-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute top-3 right-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 right-3 w-3 h-3", screwSize)} />
      
      {/* Plaque content container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

// High-fidelity Mercosul Licence Plate displays
const LicensePlate: React.FC<{ 
  plate: string; 
  type?: 'cavalo' | 'carreta'; 
}> = ({ plate, type }) => {
  if (!plate || plate === '-') return <span className="text-[#5c3c24] font-mono font-bold">-</span>;
  
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  
  // Custom headers based on plate type
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  // Outer container color & border classes
  const plateContainerClasses = cn(
    "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[120px] h-[40px] shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.35)]",
    isCarreta 
      ? "bg-[#fffde7] border-2 border-[#e6b800]" 
      : "bg-[#f7f4ed] border-2 border-[#5c3c24]/80"
  );

  // Character container gradient classes
  const charBgClasses = cn(
    "w-full flex-1 flex items-center justify-center px-2",
    isCarreta 
      ? "bg-gradient-to-b from-[#fff176] to-[#fbc02d]" 
      : "bg-gradient-to-b from-[#ffffff] to-[#e8e4db]"
  );

  return (
    <div className={plateContainerClasses}>
      {/* Blue Mercosul Header */}
      <div className="w-full bg-[#0051A2] h-[10px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5px] text-white font-sans font-bold scale-95">BR</span>
        <span className="text-[6.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          {headerText}
        </span>
        {/* Tiny Brazil Flag */}
        <div className="w-[8px] h-[5.5px] bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden">
          <div className="w-[4.5px] h-[3px] bg-yellow-400 rotate-45 transform flex items-center justify-center">
            <div className="w-[1.5px] h-[1.5px] bg-blue-800 rounded-full"></div>
          </div>
        </div>
      </div>
      {/* License plate characters */}
      <div className={charBgClasses}>
        <span className="text-[#1a1c1d] font-black text-[15px] tracking-wide leading-none select-all animate-fade-in" style={{ textShadow: isCarreta ? '0.5px 0.5px 0px rgba(255, 255, 255, 0.4)' : '0.5px 0.5px 0px rgba(255, 255, 255, 0.8)' }}>
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

const parseTableData = (text: string): ParsedTable => {
  if (!text || !text.trim()) return { headers: [], rows: [] };
  
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter (tab, semicolon, pipe, comma)
  let delimiter = '\t';
  const checkLinesCount = Math.min(lines.length, 5);
  const delimiters = ['\t', ';', '|', ','];
  let bestDelimiter = '\t';
  let maxDelimiterScore = -1;
  
  delimiters.forEach(del => {
    let count = 0;
    for (let i = 0; i < checkLinesCount; i++) {
       if (lines[i]) count += lines[i].split(del).length - 1;
    }
    if (count > maxDelimiterScore) {
      maxDelimiterScore = count;
      bestDelimiter = del;
    }
  });
  
  if (maxDelimiterScore > 0) {
    delimiter = bestDelimiter;
  }

  const allRows = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
  const headers = allRows[0] || [];
  const rows = allRows.slice(1).filter(r => r.length > 0 && r.some(cell => cell !== ''));
  return { headers, rows };
};

const getCellStyle = (cellValue: string, isHeader: boolean): string => {
  if (isHeader) {
    return 'background-color: #000000; color: #ffffff; font-family: Calibri, Arial, sans-serif; font-size: 10pt; font-weight: bold; text-align: center; border: 1px solid #000000; padding: 6px 10px; white-space: nowrap; text-transform: uppercase;';
  }
  
  const val = cellValue.trim().toUpperCase();
  let bg = '#ffffff';
  let color = '#000000';
  let isBold = false;
  
  // Regras de formatação condicional inteligente baseadas no Excel real
  if (val === 'SIM' || val === 'LIBERADO' || val === 'VIGENTE' || val === 'EM' || val === 'SIM/SIM' || val === 'CADASTRO VIGENTE') {
    bg = '#c6efce'; // preenchimento verde claro
    color = '#006100'; // texto verde escuro
    isBold = true;
  } else if (val === 'NÃO' || val === 'NAO' || val === 'REPROVADO' || val === 'REPROVADO/REPROVADO' || val === 'NÃO/NÃO' || val === 'NÃO/NAO' || val === 'NAO/NAO' || val === 'VENCIDO' || val === 'BLOQUEADO' || val === 'DIVERGENTE') {
    bg = '#ffc7ce'; // preenchimento vermelho claro
    color = '#9c0006'; // texto vermelho escuro
    isBold = true;
  } else if (val === 'ATENÇÃO' || val === 'ATENCAO' || val === 'ALERTA' || val.includes('VENCER') || val.includes('VENCENDO')) {
    bg = '#ffeb9c'; // preenchimento amarelo claro
    color = '#9c6500'; // texto amarelo escuro
    isBold = true;
  } else if (val === 'MACRO' || val === 'TECNOLOGIA') {
    color = '#0066cc';
    isBold = true;
  } else if (val.includes('SEGURO')) {
    bg = '#c6efce';
    color = '#006100';
    isBold = true;
  }
  
  return `background-color: ${bg}; color: ${color}; font-family: Calibri, Arial, sans-serif; font-size: 9.5pt; font-weight: ${isBold ? 'bold' : 'normal'}; border: 1px solid #000000; padding: 5px 8px; white-space: nowrap; text-align: center;`;
};

const getCellStyleObj = (cellValue: string, isHeader: boolean): React.CSSProperties => {
  if (isHeader) {
    return {
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: '10pt',
      fontWeight: 'bold',
      textAlign: 'center',
      border: '1px solid #000000',
      padding: '6px 10px',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase'
    };
  }
  
  const val = cellValue.trim().toUpperCase();
  let bg = '#ffffff';
  let color = '#000000';
  let isBold = false;
  
  if (val === 'SIM' || val === 'LIBERADO' || val === 'VIGENTE' || val === 'EM' || val === 'SIM/SIM' || val === 'CADASTRO VIGENTE') {
    bg = '#c6efce';
    color = '#006100';
    isBold = true;
  } else if (val === 'NÃO' || val === 'NAO' || val === 'REPROVADO' || val === 'REPROVADO/REPROVADO' || val === 'NÃO/NÃO' || val === 'NÃO/NAO' || val === 'NAO/NAO' || val === 'VENCIDO' || val === 'BLOQUEADO' || val === 'DIVERGENTE') {
    bg = '#ffc7ce';
    color = '#9c0006';
    isBold = true;
  } else if (val === 'ATENÇÃO' || val === 'ATENCAO' || val === 'ALERTA' || val.includes('VENCER') || val.includes('VENCENDO')) {
    bg = '#ffeb9c';
    color = '#9c6500';
    isBold = true;
  } else if (val === 'MACRO' || val === 'TECNOLOGIA') {
    color = '#0066cc';
    isBold = true;
  } else if (val.includes('SEGURO')) {
    bg = '#c6efce';
    color = '#006100';
    isBold = true;
  }
  
  return {
    backgroundColor: bg,
    color: color,
    fontFamily: 'Calibri, Arial, sans-serif',
    fontSize: '9.5pt',
    fontWeight: isBold ? 'bold' : 'normal',
    border: '1px solid #000000',
    padding: '5px 8px',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  };
};

const generateDisponibilidadeHtmlAndText = (greeting: 'bom dia' | 'boa tarde' | 'boa noite', text: string) => {
  const { headers, rows } = parseTableData(text);
  
  const greetingPhrase = `Prezados, ${greeting}!`;
  const subPhrase1 = `Segue a disponibilidade de veículos.`;
  const subPhrase2Text = `Favor ficarem atentos à origem de cada carregamento`;
  const subPhrase2 = `${subPhrase2Text}.`;
  
  // HTML format - totalmente plano, limpo e profissional para ser colado no e-mail (idêntico à imagem de anexo)
  let html = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5; background-color: #ffffff; padding: 10px; margin: 0;">
    <p style="margin: 0 0 16px 0; font-family: Verdana, sans-serif; font-weight: normal; font-size: 11pt; color: #000000;">${greetingPhrase}</p>
    <p style="margin: 0 0 4px 0; font-family: Verdana, sans-serif; font-weight: normal; font-size: 11pt; color: #000000;">${subPhrase1}</p>
    <p style="margin: 0 0 16px 0; font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000000;">
      <span style="background-color: #b4a7d6; font-weight: bold; font-family: Verdana, sans-serif; font-size: 17px; color: #000000; padding: 1px 3px;">${subPhrase2Text}</span>.
    </p>`;

  if (headers.length > 0) {
    let tableHtml = `<table style="border-collapse: collapse; width: 100%; border: 1px solid #000000; font-family: Calibri, Arial, sans-serif; font-size: 10pt; background-color: #ffffff;">
      <thead>
        <tr>`;
            
    headers.forEach(h => {
      tableHtml += `<th style="${getCellStyle(h, true)}">${h}</th>`;
    });
    
    tableHtml += `</tr>
      </thead>
      <tbody>`;
        
    rows.forEach((row) => {
      tableHtml += `<tr>`;
      for (let i = 0; i < headers.length; i++) {
        const cellValue = row[i] || '';
        tableHtml += `<td style="${getCellStyle(cellValue, false)}">${cellValue}</td>`;
      }
      tableHtml += `</tr>`;
    });
    
    tableHtml += `</tbody>
    </table>`;
    
    html += tableHtml;
  }
  
  html += `</div>`;
  
  // Text format (for WhatsApp)
  let plainText = `*${greetingPhrase}*\n\n${subPhrase1}\n*${subPhrase2}*\n\n`;
  if (headers.length > 0) {
    plainText += `${headers.map(h => `[${h}]`).join(' | ')}\n`;
    plainText += `${headers.map(() => '---').join(' | ')}\n`;
    rows.forEach(row => {
      const alignedRow = [];
      for (let i = 0; i < headers.length; i++) {
        alignedRow.push(row[i] || '—');
      }
      plainText += `${alignedRow.join(' | ')}\n`;
    });
  }
  
  return { html, text: plainText };
};

interface IngestedVehicle {
  id: string;
  placa: string;
  isPatio: string;
  hasAssinou: string;
}

const getFormattedEmailSubject = (): string => {
  const now = new Date();
  const daysUpper = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO'
  ];
  const dayOfWeek = daysUpper[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `DISPONIBILIDADE DE VEÍCULOS | ${dayOfWeek} ${dd}/${mm}/${yyyy}`;
};

const getAutoGreeting = (): 'bom dia' | 'boa tarde' | 'boa noite' => {
  const hour = new Date().getHours();
  if (hour >= 12 && hour < 18) {
    return 'boa tarde';
  } else if (hour >= 18) {
    return 'boa noite';
  } else {
    return 'bom dia';
  }
};

export interface OrdemColetaItem {
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
  cargaLiberacao: string;
  estadoMotorista: string;
  estadoCavalo: string;
  estadoCarreta: string;
  pendencia: string;
  checkList: string;
  dias: string;
  segundaCarreta: string;
  inseridoEm?: string;
}

const DEFAULT_ORDEM_COLETA: OrdemColetaItem[] = [];

export default function Patio({ onBack }: PatioProps) {
  const principle = useCurrentPrinciple();
  const [patioData, setPatioData] = useState<PatioItem[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [referencias, setReferencias] = useState<{ [key: string]: any }>({});
  const [patioFilter, setPatioFilter] = useState<'Todos' | 'Sim' | 'Não'>('Todos');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'lista' | 'importar'>('lista');
  const [activeSubTab, setActiveSubTab] = useState<'patio' | 'disponibilidade' | 'iscas' | 'coleta'>('patio');
  const [disponibilidadeGreeting, setDisponibilidadeGreeting] = useState<'bom dia' | 'boa tarde' | 'boa noite'>(getAutoGreeting);
  const [disponibilidadeInput, setDisponibilidadeInput] = useState('');

  useEffect(() => {
    if (activeSubTab === 'disponibilidade') {
      setDisponibilidadeGreeting(getAutoGreeting());
    }
  }, [activeSubTab]);
  const [dispCopied, setDispCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [ingestedVehicles, setIngestedVehicles] = useState<IngestedVehicle[]>([]);

  // Iscas states
  const [iscaInput, setIscaInput] = useState('');
  const [iscaCopied, setIscaCopied] = useState(false);
  const [iscaNumbersCopied, setIscaNumbersCopied] = useState(false);
  const [filterBattery100, setFilterBattery100] = useState(true);
  const [filterSameDay, setFilterSameDay] = useState(true);
  const [filterTwoHours, setFilterTwoHours] = useState(true);
  const [filterSantaLuzia, setFilterSantaLuzia] = useState(true);

  // Interfaces for Isca
  interface IscaItem {
    id: string;
    numero: string;
    endereco: string;
    dataPosicao: string;
    bateria: string;
    latitude?: string;
    longitude?: string;
    ta?: string;
    db?: string;
    isValidDate: boolean;
    isToday: boolean;
    isWithinTwoHours: boolean;
    isBattery100: boolean;
    isSantaLuzia: boolean;
  }

  // Interfaces for Cubagem
  interface CubagemItem {
    id: string;
    cavalo: string;
    carreta: string;
    m3: string;
    inseridoEm: string;
  }

  // Cubagem states
  const [cubagemData, setCubagemData] = useState<CubagemItem[]>([]);
  const [cubagemSearch, setCubagemSearch] = useState('');
  const [cubagemPdfFile, setCubagemPdfFile] = useState<File | null>(null);
  const [isProcessingCubagem, setIsProcessingCubagem] = useState(false);
  const [cubagemStatusMsg, setCubagemStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Manual input states
  const [manualCavalo, setManualCavalo] = useState('');
  const [manualCarreta, setManualCarreta] = useState('');
  const [manualM3, setManualM3] = useState('');
  const [cubagemPasteText, setCubagemPasteText] = useState('');
  const [parsedPreviewItems, setParsedPreviewItems] = useState<{ cavalo: string; carreta: string; m3: string; status: 'ready' | 'duplicate' | 'invalid' }[]>([]);
  const [isShowingPreview, setIsShowingPreview] = useState(false);
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([]);

  // Inline edit states
  const [editingCubagemId, setEditingCubagemId] = useState<string | null>(null);
  const [editingCavalo, setEditingCavalo] = useState('');
  const [editingCarreta, setEditingCarreta] = useState('');
  const [editingM3, setEditingM3] = useState('');

  // Ordem de Coleta states
  const [ordemColetaData, setOrdemColetaData] = useState<OrdemColetaItem[]>([]);
  const [ordemColetaSearch, setOrdemColetaSearch] = useState('');
  const [ordemColetaPdfFile, setOrdemColetaPdfFile] = useState<File | null>(null);
  const [isProcessingOrdemColeta, setIsProcessingOrdemColeta] = useState(false);
  const [ordemColetaStatusMsg, setOrdemColetaStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingOrdemColetaId, setEditingOrdemColetaId] = useState<string | null>(null);
  const [editingOrdemColetaRow, setEditingOrdemColetaRow] = useState<OrdemColetaItem | null>(null);
  const [lastImportedOrdemColetaItems, setLastImportedOrdemColetaItems] = useState<OrdemColetaItem[]>([]);

  const formatOrdemColetaItemToTSV = (item: OrdemColetaItem) => {
    return [
      item.mes || '',
      item.origem || '',
      item.dia || '',
      item.data || '',
      item.contatoWhats || '',
      item.horaLiberado || '',
      item.status || '',
      item.modeloCarreta || '',
      item.modeloCavalo || '',
      item.fezContato || '',
      item.destino || '',
      item.transportador || '',
      item.cavalo || '',
      item.carreta || '',
      item.cargaLiberacao || '',
      item.estadoMotorista || '',
      item.estadoCavalo || '',
      item.estadoCarreta || '',
      item.pendencia || '',
      item.checkList || '',
      item.dias || '',
      item.segundaCarreta || ''
    ].join('\t');
  };

  const handleCopyOrdemColetaForSheets = (items: OrdemColetaItem[], withHeaders = false) => {
    if (!items || items.length === 0) return;
    const headers = [
      'MÊS', 'ORIGEM', 'DIA', 'DATA', 'CONTATO WHATS', 'HORA LIBERADO', 'STATUS',
      'MODELO CARRETA', 'MODELO CAVALO', 'FEZ CONTATO?', 'DESTINO', 'TRANSPORTADOR',
      'CAVALO', 'CARRETA', 'CARGA / LIBERAÇÃO', 'ESTADO MOTORISTA', 'ESTADO CAVALO',
      'ESTADO CARRETA', 'PENDÊNCIA', 'CHECK LIST', 'DIAS', '2ª CARRETA'
    ].join('\t');

    const rowsStr = items.map(formatOrdemColetaItemToTSV).join('\n');
    const fullText = withHeaders ? `${headers}\n${rowsStr}` : rowsStr;

    navigator.clipboard.writeText(fullText).then(() => {
      setOrdemColetaStatusMsg({
        type: 'success',
        text: '📋 Informações copiadas! Abra sua Planilha Google e aperte Ctrl+V para colar nas colunas.'
      });
      setTimeout(() => setOrdemColetaStatusMsg(null), 6000);
    }).catch(err => {
      console.error("Erro ao copiar para clipboard:", err);
    });
  };

  // Firebase listener for Ordem de Coleta
  useEffect(() => {
    const path = 'patio/ordem_coleta';
    const ocRef = ref(db, path);
    console.log(`[Realtime Database] Tentando acessar caminho: ${path}`);
    const unsubscribe = onValue(ocRef, (snapshot) => {
      const data = snapshot.val();
      const items: OrdemColetaItem[] = [];
      if (data) {
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          items.push({ id: key, ...value } as OrdemColetaItem);
        });
        setOrdemColetaData(items);
      } else {
        setOrdemColetaData([]);
      }
    }, (error) => {
      console.error("Erro ao carregar Ordem de Coleta:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleProcessOrdemColetaPdf = async (file: File) => {
    setIsProcessingOrdemColeta(true);
    setOrdemColetaStatusMsg({ type: 'success', text: 'Lendo PDF da Ordem de Coleta...' });

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/parse-ordem-coleta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, fileName: file.name })
      });

      if (!response.ok) {
        throw new Error("Falha ao processar arquivo da Ordem de Coleta.");
      }

      const result = await response.json();
      if (result.success && result.data) {
        const extracted = result.data;
        const ocRef = ref(db, 'patio/ordem_coleta');

        const hasSegundaCarreta = Boolean(
          extracted.segundaCarreta &&
          extracted.segundaCarreta.trim() !== '' &&
          extracted.segundaCarreta.trim() !== '-'
        );

        const row1Data = {
          mes: extracted.mes || 'JUL|26',
          origem: extracted.origem || 'SANTA LUZIA | MG',
          dia: extracted.dia || 'sexta-feira',
          data: extracted.data || '24/07/2026',
          contatoWhats: extracted.contatoWhats || '08:00:00',
          horaLiberado: extracted.horaLiberado || '08:00:00',
          status: extracted.status || 'LIBERADO CARREGAMENTO',
          modeloCarreta: extracted.modeloCarreta || (hasSegundaCarreta ? 'RODOTREM BAÚ' : 'BAÚ'),
          modeloCavalo: extracted.modeloCavalo || 'TRUCADO',
          fezContato: extracted.fezContato || 'SIM',
          destino: extracted.destino || 'GUARULHOS SP',
          transportador: extracted.transportador || 'TRANSMAGNA',
          cavalo: extracted.cavalo || 'SEV5A39',
          carreta: extracted.carreta || 'TPY3G57',
          cargaLiberacao: extracted.cargaLiberacao || '',
          estadoMotorista: extracted.estadoMotorista || 'SC',
          estadoCavalo: extracted.estadoCavalo || 'SC',
          estadoCarreta: extracted.estadoCarreta || 'SC',
          pendencia: extracted.pendencia || '',
          checkList: extracted.checkList || 'OK',
          dias: extracted.dias || '180',
          segundaCarreta: hasSegundaCarreta ? extracted.segundaCarreta : '',
          inseridoEm: new Date().toISOString()
        };

        const newItem1Ref = push(ocRef);
        await set(newItem1Ref, row1Data);

        const createdItems: OrdemColetaItem[] = [{ id: newItem1Ref.key || '1', ...row1Data }];

        if (hasSegundaCarreta) {
          // Rule: if there are plates in both carreta 1 and carreta 2, create 2 rows
          const row2Data = {
            ...row1Data,
            carreta: extracted.segundaCarreta,
            segundaCarreta: ''
          };
          const newItem2Ref = push(ocRef);
          await set(newItem2Ref, row2Data);
          createdItems.push({ id: newItem2Ref.key || '2', ...row2Data });
        }

        setLastImportedOrdemColetaItems(createdItems);
        setOrdemColetaPdfFile(null);
        setOrdemColetaStatusMsg({
          type: 'success',
          text: `Ordem de Coleta importada com sucesso! ${createdItems.length === 2 ? '2 linhas geradas (Placa Carreta 1 e 2)' : '1 linha gerada'}. Clique no botão verde para copiar para a Planilha Google.`
        });
        setTimeout(() => setOrdemColetaStatusMsg(null), 6000);
      } else {
        throw new Error("Não foi possível ler as informações do PDF da Ordem de Coleta.");
      }
    } catch (err: any) {
      console.error("Erro no processamento da Ordem de Coleta:", err);
      setOrdemColetaStatusMsg({ type: 'error', text: err.message || 'Erro ao processar PDF da Ordem de Coleta.' });
      setTimeout(() => setOrdemColetaStatusMsg(null), 5000);
    } finally {
      setIsProcessingOrdemColeta(false);
    }
  };

  const handleAddManualOrdemColeta = async () => {
    try {
      const ocRef = ref(db, 'patio/ordem_coleta');
      const newItemRef = push(ocRef);
      await set(newItemRef, {
        mes: 'JUL|26',
        origem: 'SANTA LUZIA | MG',
        dia: 'sexta-feira',
        data: new Date().toLocaleDateString('pt-BR'),
        contatoWhats: '08:00:00',
        horaLiberado: '08:00:00',
        status: 'LIBERADO CARREGAMENTO',
        modeloCarreta: 'BAÚ',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: 'GUARULHOS SP',
        transportador: 'TRANSMAGNA',
        cavalo: 'ABC1D23',
        carreta: 'XYZ9K88',
        cargaLiberacao: 'NOME MOTORISTA',
        estadoMotorista: 'MG',
        estadoCavalo: 'MG',
        estadoCarreta: 'MG',
        pendencia: '',
        checkList: 'OK',
        dias: '180',
        segundaCarreta: '',
        inseridoEm: new Date().toISOString()
      });
      setOrdemColetaStatusMsg({ type: 'success', text: 'Nova linha adicionada com sucesso!' });
      setTimeout(() => setOrdemColetaStatusMsg(null), 3000);
    } catch (error) {
      console.error("Erro ao adicionar linha manual em Ordem de Coleta:", error);
    }
  };

  const handleDeleteOrdemColeta = async (id: string) => {
    try {
      await remove(ref(db, `patio/ordem_coleta/${id}`));
      setOrdemColetaStatusMsg({ type: 'success', text: 'Registro excluído!' });
      setTimeout(() => setOrdemColetaStatusMsg(null), 3000);
    } catch (error) {
      console.error("Erro ao excluir Ordem de Coleta:", error);
    }
  };

  const handleSaveEditOrdemColeta = async (id: string, updatedRow: OrdemColetaItem) => {
    try {
      await update(ref(db, `patio/ordem_coleta/${id}`), { ...updatedRow });
      setEditingOrdemColetaId(null);
      setEditingOrdemColetaRow(null);
      setOrdemColetaStatusMsg({ type: 'success', text: 'Alterações salvas com sucesso!' });
      setTimeout(() => setOrdemColetaStatusMsg(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar edição em Ordem de Coleta:", error);
    }
  };


  const parseIscaDate = (str: string): Date | null => {
    if (!str) return null;
    const clean = str.trim();
    const parts = clean.split(/[\/\s:]/);
    if (parts.length >= 5) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const hour = parseInt(parts[3], 10);
      const minute = parseInt(parts[4], 10);
      const second = parts[5] ? parseInt(parts[5], 10) : 0;
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) {
        return new Date(year, month, day, hour, minute, second);
      }
    }
    return null;
  };

  const parseIscas = (text: string): IscaItem[] => {
    if (!text.trim()) return [];
    const { headers, rows } = parseTableData(text);
    if (!headers.length) return [];

    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    
    const iscaIdx = normalizedHeaders.findIndex(h => h.includes('isca') || h.includes('nº') || h.includes('dispositivo') || h.includes('número') || h.includes('numero') || h === 'n°' || h === 'no' || h === 'nº da isca');
    const enderecoIdx = normalizedHeaders.findIndex(h => h.includes('endereço') || h.includes('endereco') || h.includes('localização') || h.includes('localizacao') || h.includes('aproximado'));
    const dataIdx = normalizedHeaders.findIndex(h => h.includes('data') || h.includes('último') || h.includes('ultimo') || h.includes('posição') || h.includes('posicao'));
    const bateriaIdx = normalizedHeaders.findIndex(h => h.includes('bateria') || h.includes('bat') || h.includes('rf') || h.includes('isca_rf'));
    const latIdx = normalizedHeaders.findIndex(h => h === 'latitude' || h === 'lat');
    const lngIdx = normalizedHeaders.findIndex(h => h === 'longitude' || h === 'lng' || h === 'lon');
    const taIdx = normalizedHeaders.findIndex(h => h === 'ta');
    const dbIdx = normalizedHeaders.findIndex(h => h === 'db');

    const items: IscaItem[] = [];
    const now = new Date();

    rows.forEach((row, rowIndex) => {
      if (!row || row.length === 0 || row.every(cell => !cell?.trim())) return;

      const numero = (iscaIdx !== -1 ? row[iscaIdx] : row[0])?.trim() || '';
      const endereco = (enderecoIdx !== -1 ? row[enderecoIdx] : row[1])?.trim() || '';
      const dataStr = (dataIdx !== -1 ? row[dataIdx] : row[2])?.trim() || '';
      const bateria = (bateriaIdx !== -1 ? row[bateriaIdx] : row[3])?.trim() || '';
      const latitude = latIdx !== -1 ? row[latIdx]?.trim() : undefined;
      const longitude = lngIdx !== -1 ? row[lngIdx]?.trim() : undefined;
      const ta = taIdx !== -1 ? row[taIdx]?.trim() : undefined;
      const db = dbIdx !== -1 ? row[dbIdx]?.trim() : undefined;

      const parsedDate = parseIscaDate(dataStr);
      let isValidDate = false;
      let isToday = false;
      let isWithinTwoHours = false;

      if (parsedDate) {
        isValidDate = true;
        isToday = parsedDate.getDate() === now.getDate() && 
                  parsedDate.getMonth() === now.getMonth() && 
                  parsedDate.getFullYear() === now.getFullYear();
        
        const diffMs = now.getTime() - parsedDate.getTime();
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        // Permite atraso de até 2 horas. Também tolera até 15 minutos no futuro caso relógios estejam um pouco dessincronizados
        isWithinTwoHours = diffMs >= -900000 && diffMs <= twoHoursInMs;
      }

      const isBattery100 = bateria.includes('100');
      const isSantaLuzia = endereco.toLowerCase().includes('santa luzia') && endereco.toLowerCase().includes('mg');

      items.push({
        id: `isca_${rowIndex}_${Date.now()}`,
        numero,
        endereco,
        dataPosicao: dataStr,
        bateria,
        latitude,
        longitude,
        ta,
        db,
        isValidDate,
        isToday,
        isWithinTwoHours,
        isBattery100,
        isSantaLuzia
      });
    });

    return items;
  };

  const getProcessedIscas = (): IscaItem[] => {
    const parsed = parseIscas(iscaInput);
    
    const filtered = parsed.filter(item => {
      if (filterBattery100 && !item.isBattery100) return false;
      if (filterSameDay && !item.isToday) return false;
      if (filterTwoHours && !item.isWithinTwoHours) return false;
      if (filterSantaLuzia && !item.isSantaLuzia) return false;
      return true;
    });

    const getNumericPart = (str: string): number => {
      const match = str.replace(/[^0-9]/g, '');
      return match ? parseInt(match, 10) : 0;
    };

    return [...filtered].sort((a, b) => {
      const numA = getNumericPart(a.numero);
      const numB = getNumericPart(b.numero);
      if (numA !== numB) {
        return numA - numB;
      }
      return a.numero.localeCompare(b.numero);
    });
  };

  const generateIscasHtmlAndText = (items: IscaItem[]) => {
    let html = `<table style="border-collapse: collapse; width: 100%; border: 1px solid #000000; font-family: Calibri, Arial, sans-serif; font-size: 10pt; background-color: #ffffff;">
      <thead>
        <tr style="background-color: #000000; color: #ffffff;">
          <th style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold; text-align: center;">#</th>
          <th style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Nº da Isca</th>
          <th style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Endereço aproximado da posição</th>
          <th style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold; text-align: center;">Data Posição</th>
          <th style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold; text-align: center;">Bateria Isca_RF</th>
        </tr>
      </thead>
      <tbody>`;
    
    items.forEach((item, idx) => {
      html += `<tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
        <td style="border: 1px solid #000000; padding: 6px 10px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #000000; padding: 6px 10px; font-weight: bold;">${item.numero}</td>
        <td style="border: 1px solid #000000; padding: 6px 10px;">${item.endereco}</td>
        <td style="border: 1px solid #000000; padding: 6px 10px; text-align: center;">${item.dataPosicao}</td>
        <td style="border: 1px solid #000000; padding: 6px 10px; text-align: center; color: green; font-weight: bold;">${item.bateria}</td>
      </tr>`;
    });

    html += `</tbody></table>`;

    let text = `| # | Nº da Isca | Endereço aproximado da posição | Data Posição | Bateria Isca_RF |\n`;
    text += `|---|---|---|---|---|\n`;
    items.forEach((item, idx) => {
      text += `| ${idx + 1} | ${item.numero} | ${item.endereco} | ${item.dataPosicao} | ${item.bateria} |\n`;
    });

    return { html, text };
  };

  useEffect(() => {
    if (!disponibilidadeInput.trim()) {
      setIngestedVehicles([]);
      return;
    }
    const { headers, rows } = parseTableData(disponibilidadeInput);
    if (!headers.length) return;

    // Normalização dos cabeçalhos
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const termoIdx = normalizedHeaders.findIndex(h => h.includes('termo'));
    const cavaloIdx = normalizedHeaders.findIndex(h => h.includes('cavalo'));
    const carretaIdx = normalizedHeaders.findIndex(h => h.includes('carreta'));

    if (termoIdx === -1) return;

    const newVehicles: IngestedVehicle[] = [];

    rows.forEach((row, rowIndex) => {
      // Pula linhas completamente vazias
      if (!row || row.length === 0 || row.every(cell => !cell?.trim())) return;

      // Valor da coluna termo, obtido de forma segura
      const termoValor = row[termoIdx]?.toString().trim().toLowerCase() || '';

      // Filtro tolerante: "não" ou "nao"
      if (termoValor === 'não' || termoValor === 'nao') {
        
        // Se houver a coluna CAVALO e tiver um tamanho mínimo (ex: placa)
        if (cavaloIdx !== -1) {
          const placaCavalo = row[cavaloIdx]?.toString().trim() || '';
          if (placaCavalo.length >= 3) {
            newVehicles.push({
              id: `veh_${rowIndex}_cavalo_${Date.now()}`,
              placa: placaCavalo.toUpperCase().substring(0, 8),
              isPatio: 'NÃO',
              hasAssinou: 'NÃO'
            });
          }
        }
        
        // Se houver a coluna CARRETA e tiver um tamanho mínimo
        if (carretaIdx !== -1) {
          const placaCarreta = row[carretaIdx]?.toString().trim() || '';
          if (placaCarreta.length >= 3) {
            newVehicles.push({
              id: `veh_${rowIndex}_carreta_${Date.now()}`,
              placa: placaCarreta.toUpperCase().substring(0, 8),
              isPatio: 'NÃO',
              hasAssinou: 'NÃO'
            });
          }
        }
      }
    });

    setIngestedVehicles(newVehicles);
  }, [disponibilidadeInput]);

  useEffect(() => {
    // Escutar rtdb
    const path = 'patio/veiculos';
    const patioRef = ref(db, path);
    console.log(`[Realtime Database] Tentando acessar caminho: ${path}`);
    const unsubscribe = onValue(patioRef, (snapshot) => {
      const data = snapshot.val();
      const items: PatioItem[] = [];
      if (data) {
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          items.push({ id: key, ...value } as PatioItem);
        });
      }
      setPatioData(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patio/veiculos');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Escutar cubagem do rtdb
    const path = 'patio/cubagem';
    const cubagemRef = ref(db, path);
    console.log(`[Realtime Database] Tentando acessar caminho: ${path}`);
    const unsubscribe = onValue(cubagemRef, (snapshot) => {
      const data = snapshot.val();
      const items: CubagemItem[] = [];
      if (data) {
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          items.push({ id: key, ...value } as CubagemItem);
        });
      }
      // Ordena por inseridoEm decrescente
      items.sort((a, b) => new Date(b.inseridoEm).getTime() - new Date(a.inseridoEm).getTime());
      setCubagemData(items);
    }, (error) => {
      console.error("Erro ao carregar cubagem no pátio:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCubagemManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCavalo.trim() || !manualCarreta.trim() || !manualM3.trim()) {
      setCubagemStatusMsg({ type: 'error', text: 'Preencha todos os campos.' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
      return;
    }

    const cleanCarreta = manualCarreta.replace(/[\s-]/g, '').toUpperCase();
    const cleanCavalo = manualCavalo.replace(/[\s-]/g, '').toUpperCase();

    // Verificação de duplicidade de Carreta
    const exists = cubagemData.some(item => item.carreta.replace(/[\s-]/g, '').toUpperCase() === cleanCarreta);
    if (exists) {
      setCubagemStatusMsg({ type: 'error', text: `A Carreta ${cleanCarreta} já possui cubagem cadastrada!` });
      setTimeout(() => setCubagemStatusMsg(null), 4000);
      return;
    }

    try {
      const cubagemRef = ref(db, 'patio/cubagem');
      const newItemRef = push(cubagemRef);
      await set(newItemRef, {
        cavalo: cleanCavalo,
        carreta: cleanCarreta,
        m3: manualM3.trim(),
        inseridoEm: new Date().toISOString()
      });
      setManualCavalo('');
      setManualCarreta('');
      setManualM3('');
      setCubagemStatusMsg({ type: 'success', text: 'Cubagem adicionada com sucesso!' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
    } catch (error) {
      console.error("Erro ao adicionar cubagem:", error);
      setCubagemStatusMsg({ type: 'error', text: 'Erro ao salvar cubagem.' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
    }
  };

  const handleSaveEditCubagem = async (id: string) => {
    if (!editingCavalo.trim() || !editingCarreta.trim() || !editingM3.trim()) {
      setCubagemStatusMsg({ type: 'error', text: 'Preencha todos os campos para salvar.' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
      return;
    }

    const cleanCarreta = editingCarreta.replace(/[\s-]/g, '').toUpperCase();
    const cleanCavalo = editingCavalo.replace(/[\s-]/g, '').toUpperCase();

    // Verificação de duplicidade de Carreta, ignorando o próprio item
    const exists = cubagemData.some(item => item.id !== id && item.carreta.replace(/[\s-]/g, '').toUpperCase() === cleanCarreta);
    if (exists) {
      setCubagemStatusMsg({ type: 'error', text: `Outra Carreta já possui a placa ${cleanCarreta} cadastrada!` });
      setTimeout(() => setCubagemStatusMsg(null), 4000);
      return;
    }

    try {
      await update(ref(db, `patio/cubagem/${id}`), {
        cavalo: cleanCavalo,
        carreta: cleanCarreta,
        m3: editingM3.trim()
      });
      setEditingCubagemId(null);
      setCubagemStatusMsg({ type: 'success', text: 'Cubagem atualizada com sucesso!' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar edição de cubagem:", error);
      setCubagemStatusMsg({ type: 'error', text: 'Erro ao salvar alterações.' });
      setTimeout(() => setCubagemStatusMsg(null), 3000);
    }
  };

  const handleCancelEditCubagem = () => {
    setEditingCubagemId(null);
    setEditingCavalo('');
    setEditingCarreta('');
    setEditingM3('');
  };

  const handleDeleteCubagem = async (id: string) => {
    try {
      await remove(ref(db, `patio/cubagem/${id}`));
    } catch (error) {
      console.error("Erro ao excluir cubagem:", error);
    }
  };

  const handleClearAllCubagem = async () => {
    if (window.confirm("Tem certeza que deseja apagar TODAS as informações salvas na aba de cubagem? Esta ação não pode ser desfeita.")) {
      try {
        await remove(ref(db, 'patio/cubagem'));
        setCubagemStatusMsg({ type: 'success', text: 'Todas as cubagens foram apagadas com sucesso!' });
        setTimeout(() => setCubagemStatusMsg(null), 3000);
      } catch (error) {
        console.error("Erro ao apagar todas as cubagens:", error);
        setCubagemStatusMsg({ type: 'error', text: 'Erro ao apagar todas as cubagens.' });
        setTimeout(() => setCubagemStatusMsg(null), 3000);
      }
    }
  };

  const handleProcessCubagemPdf = async (file: File) => {
    setIsProcessingCubagem(true);
    setCubagemStatusMsg({ type: 'success', text: 'Lendo PDF e extraindo cubagem com IA...' });

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 })
      });

      if (!response.ok) {
        throw new Error("Falha ao extrair dados do PDF.");
      }

      const result = await response.json();
      if (result.success && result.data) {
        const dataArray: any[] = Array.isArray(result.data) ? result.data : [result.data];
        
        let addedCount = 0;
        let skippedCount = 0;

        const cubagemRef = ref(db, 'patio/cubagem');
        const processedCarretasInBatch = new Set<string>();

        for (const row of dataArray) {
          const cavalo = (row.cavalo || '').replace(/[\s-]/g, '').toUpperCase();
          const carreta = (row.carreta || '').replace(/[\s-]/g, '').toUpperCase();
          const m3 = (row.m3 || '').trim();

          if (!cavalo || cavalo === '---' || !carreta || carreta === '---' || !m3 || m3 === '---') {
            skippedCount++;
            continue;
          }

          // Verificar duplicidade da carreta tanto no que já existe quanto no que acabou de ser inserido
          const existsInDb = cubagemData.some(item => item.carreta.replace(/[\s-]/g, '').toUpperCase() === carreta);
          const isDuplicateInBatch = processedCarretasInBatch.has(carreta);
          
          if (existsInDb || isDuplicateInBatch) {
            skippedCount++;
            continue;
          }

          processedCarretasInBatch.add(carreta);

          const newItemRef = push(cubagemRef);
          await set(newItemRef, {
            cavalo: cavalo,
            carreta: carreta,
            m3: m3,
            inseridoEm: new Date().toISOString()
          });
          addedCount++;
        }

        setCubagemPdfFile(null);
        setCubagemStatusMsg({ 
          type: 'success', 
          text: `Importação concluída! Adicionados: ${addedCount} | Ignorados (duplicidade/vazio): ${skippedCount}` 
        });
        setTimeout(() => setCubagemStatusMsg(null), 5000);
      } else {
        throw new Error("Não foi possível encontrar dados estruturados no PDF.");
      }
    } catch (error: any) {
      console.error("Erro no processamento da Cubagem:", error);
      setCubagemStatusMsg({ type: 'error', text: error.message || 'Erro ao processar PDF.' });
      setTimeout(() => setCubagemStatusMsg(null), 5000);
    } finally {
      setIsProcessingCubagem(false);
    }
  };

  const isPlate = (str: string): boolean => {
    const clean = str.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length !== 7) return false;
    const letters = clean.slice(0, 3);
    if (!/^[A-Z]{3}$/.test(letters)) return false;
    if (!/^[0-9]$/.test(clean[3])) return false;
    if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) return true;
    if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean)) return true;
    return false;
  };

  const handleParsePastedData = () => {
    if (!cubagemPasteText.trim()) {
      setCubagemStatusMsg({ type: 'error', text: 'Por favor, cole as informações da planilha no campo de texto.' });
      return;
    }

    const lines = cubagemPasteText.split(/\r?\n/);
    const previewList: { cavalo: string; carreta: string; m3: string; status: 'ready' | 'duplicate' | 'invalid' }[] = [];
    const processedCarretasInBatch = new Set<string>();
    let skippedCount = 0;

    // First, scan for a header row to see if we can map columns dynamically
    let cavaloColIndex = -1;
    let carretaColIndex = -1;
    let m3ColIndex = -1;
    let palletsColIndex = -1;
    let pbtColIndex = -1;

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim().toLowerCase();
      if (!line) continue;
      
      const words = line.split(/[\t;|]+/).map(w => w.trim()).filter(Boolean);
      let finalWords = words;
      if (words.length <= 1) {
        finalWords = line.split(/\s{2,}/).map(w => w.trim()).filter(Boolean);
        if (finalWords.length <= 1) {
          finalWords = line.split(/\s+/).map(w => w.trim()).filter(Boolean);
        }
      }

      const hasCavalo = finalWords.some(w => w.includes('cavalo') || w.includes('placa'));
      const hasCarreta = finalWords.some(w => w.includes('carreta') || w.includes('reboque'));
      const hasM3 = finalWords.some(w => w.includes('m³') || w.includes('m3') || w.includes('cubagem') || w.includes('vol') || w.includes('volume'));
      const hasPallets = finalWords.some(w => w.includes('palet') || w.includes('pallet') || w.includes('plts'));
      const hasPbt = finalWords.some(w => w.includes('pbt') || w.includes('ton'));

      if (hasCavalo || hasCarreta || hasM3 || hasPallets || hasPbt) {
        for (let j = 0; j < finalWords.length; j++) {
          const w = finalWords[j];
          if (w.includes('cavalo') || (w.includes('placa') && !w.includes('carreta') && !w.includes('reboque'))) {
            cavaloColIndex = j;
          } else if (w.includes('carreta') || w.includes('reboque') || w.includes('semi')) {
            carretaColIndex = j;
          } else if (w.includes('m³') || w.includes('m3') || w.includes('cubagem') || w.includes('vol') || w.includes('volume')) {
            m3ColIndex = j;
          } else if (w.includes('palet') || w.includes('pallet') || w.includes('plt') || w.includes('n°')) {
            palletsColIndex = j;
          } else if (w.includes('pbt') || w.includes('ton') || w.includes('peso')) {
            pbtColIndex = j;
          }
        }
        break; // Found header, stop scanning
      }
    }

    for (const line of lines) {
      if (!line.trim()) continue;

      // Note: do NOT split by comma to preserve decimal floats (e.g. 41,5)
      const words = line.split(/[\t;|]+/).map(w => w.trim()).filter(Boolean);
      let finalWords = words;
      if (words.length <= 1) {
        finalWords = line.split(/\s{2,}/).map(w => w.trim()).filter(Boolean);
        if (finalWords.length <= 1) {
          finalWords = line.split(/\s+/).map(w => w.trim()).filter(Boolean);
        }
      }

      // If it's a header line, skip it
      const lineLower = line.toLowerCase();
      if (lineLower.includes('cavalo') || lineLower.includes('carreta') || lineLower.includes('cubagem') || lineLower.includes('pallet') || lineLower.includes('pbt')) {
        continue;
      }

      const platesInLine: string[] = [];

      // Find valid plates on this line
      for (const word of finalWords) {
        const cleanWord = word.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (isPlate(cleanWord)) {
          if (!platesInLine.includes(cleanWord)) {
            platesInLine.push(cleanWord);
          }
        }
      }

      if (platesInLine.length < 2) {
        skippedCount++;
        continue;
      }

      const cavalo = platesInLine[0];
      const carreta = platesInLine[1];

      let m3Value = '';

      // CASE A: We mapped a valid m3ColIndex from the header
      if (m3ColIndex !== -1) {
        if (m3ColIndex < finalWords.length) {
          const targetWord = finalWords[m3ColIndex];
          const cleanWordForNum = targetWord.replace(/[^0-9.,]/g, '').replace(',', '.');
          const num = parseFloat(cleanWordForNum);
          if (!isNaN(num) && num > 0) {
            m3Value = cleanWordForNum;
          }
        }
        // If m3ColIndex was identified but the value is empty/invalid, skip this row! Do not fallback or import.
        if (!m3Value) {
          skippedCount++;
          continue;
        }
      } else {
        // CASE B: Fallback heuristic (no header, or mapped index invalid)
        // Collect all numeric candidates in the line
        const candidates: { val: number; strVal: string }[] = [];
        for (const word of finalWords) {
          const cleanWordForNum = word.replace(/[^0-9.,]/g, '').replace(',', '.');
          const num = parseFloat(cleanWordForNum);
          const cleanWordUpper = word.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          const isAPlate = platesInLine.includes(cleanWordUpper);

          // Standard volume, pallet count, or pbt range: 1 to 500
          if (!isNaN(num) && num > 0 && num < 500 && !isAPlate) {
            if (!word.includes('/') && !word.includes(':') && word.length < 8) {
              candidates.push({ val: num, strVal: cleanWordForNum });
            }
          }
        }

        if (candidates.length > 0) {
          // Sort descending: M³ is always the largest of pallets/pbt/cubagem
          candidates.sort((a, b) => b.val - a.val);
          m3Value = candidates[0].strVal;
        }
      }

      // Requer pelo menos 1 placa (carreta) e um valor de cubagem não-vazio
      // Se a coluna m3Value estiver vazia, não importamos a placa! (Regra solicitada pelo usuário)
      if (carreta && m3Value) {
        // Verify duplicates
        const cleanCarreta = carreta.replace(/[\s-]/g, '').toUpperCase();
        const existsInDb = cubagemData.some(item => item.carreta.replace(/[\s-]/g, '').toUpperCase() === cleanCarreta);
        const isDuplicateInBatch = processedCarretasInBatch.has(cleanCarreta);

        if (existsInDb || isDuplicateInBatch) {
          previewList.push({ cavalo, carreta, m3: m3Value, status: 'duplicate' });
        } else {
          previewList.push({ cavalo, carreta, m3: m3Value, status: 'ready' });
          processedCarretasInBatch.add(cleanCarreta);
        }
      } else {
        skippedCount++;
      }
    }

    if (previewList.length === 0) {
      setCubagemStatusMsg({
        type: 'error',
        text: 'Nenhum dado válido de cubagem (com placa e volume M³ preenchido) pôde ser encontrado.'
      });
      setTimeout(() => setCubagemStatusMsg(null), 5000);
      return;
    }

    setParsedPreviewItems(previewList);
    setIsShowingPreview(true);
    setCubagemStatusMsg({
      type: 'success',
      text: `Análise finalizada! ${previewList.filter(p => p.status === 'ready').length} itens prontos para salvar. Revise e confirme ou pare a importação.`
    });
    setTimeout(() => setCubagemStatusMsg(null), 5000);
  };

  const handleConfirmImport = async () => {
    const cubagemRef = ref(db, 'patio/cubagem');
    let addedCount = 0;
    const newlyAddedIds: string[] = [];

    const itemsToImport = parsedPreviewItems.filter(item => item.status === 'ready');

    for (const item of itemsToImport) {
      try {
        const newItemRef = push(cubagemRef);
        const newId = newItemRef.key;
        if (newId) {
          await set(newItemRef, {
            cavalo: item.cavalo,
            carreta: item.carreta,
            m3: item.m3,
            inseridoEm: new Date().toISOString()
          });
          newlyAddedIds.push(newId);
          addedCount++;
        }
      } catch (err) {
        console.error("Erro ao salvar cubagem na base:", err);
      }
    }

    setLastImportedIds(newlyAddedIds);
    setParsedPreviewItems([]);
    setIsShowingPreview(false);
    setCubagemPasteText('');

    setCubagemStatusMsg({
      type: 'success',
      text: `Importação concluída! ${addedCount} registros de cubagem adicionados com sucesso!`
    });
    setTimeout(() => setCubagemStatusMsg(null), 6000);
  };

  const handleCancelImport = () => {
    setParsedPreviewItems([]);
    setIsShowingPreview(false);
    setCubagemPasteText('');
    setCubagemStatusMsg({
      type: 'error',
      text: 'Importação interrompida. Nenhum dado foi salvo no banco de dados.'
    });
    setTimeout(() => setCubagemStatusMsg(null), 4000);
  };

  const handleUndoLastImport = async () => {
    if (lastImportedIds.length === 0) return;
    if (window.confirm(`Deseja realmente desmarcar/remover as últimas ${lastImportedIds.length} cubagens importadas recentemente?`)) {
      let undoneCount = 0;
      for (const id of lastImportedIds) {
        try {
          await remove(ref(db, `patio/cubagem/${id}`));
          undoneCount++;
        } catch (error) {
          console.error(`Erro ao remover item importado ${id}:`, error);
        }
      }
      setCubagemStatusMsg({
        type: 'success',
        text: `Desfazer bem-sucedido! ${undoneCount} cubagens importadas foram retiradas.`
      });
      setLastImportedIds([]);
      setTimeout(() => setCubagemStatusMsg(null), 5000);
    }
  };

  useEffect(() => {
    // Escutar referências para cruzamento de dados de destino e outros valores
    const path = 'pre_alertas/referencias';
    const refsRef = ref(db, path);
    console.log(`[Realtime Database] Tentando acessar caminho: ${path}`);
    const unsubscribeRefs = onValue(refsRef, (snapshot) => {
      if (snapshot.exists()) {
        setReferencias(snapshot.val() || {});
      } else {
        setReferencias({});
      }
    }, (error) => {
      console.error("Erro ao carregar referências no pátio:", error);
    });

    return () => unsubscribeRefs();
  }, []);

  const handleAssinadoChange = async (id: string, value: string) => {
    await updatePatioData(id, 'assinado', value);
  };

  const updatePatioData = async (id: string, field: keyof PatioItem, value: string) => {
    setPatioData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    try {
      await update(ref(db, `patio/veiculos/${id}`), { [field]: value });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `patio/veiculos/${id}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await remove(ref(db, `patio/veiculos/${id}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patio/veiculos/${id}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await remove(ref(db, 'patio/veiculos'));
      setPasteText('');
      setImageFile(null);
      setStatusMsg({ type: 'success', text: 'Todos os dados foram limpos.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch(err) {
      handleFirestoreError(err, OperationType.DELETE, 'patio/veiculos');
    }
  };

  const compressImage = (base64Str: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressed);
    };
  };

  const handleProcessData = async () => {
    if (!pasteText.trim() && !imageFile) {
      setStatusMsg({ type: 'error', text: 'Cole os dados do Excel ou carregue um arquivo/imagem.' });
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'success', text: 'Sincronizando veículos...' });

    try {
      const novosRegistros: any[] = [];
      const regexPlaca = /[A-Z]{3}[0-9][A-Z0-9][0-9]{2}/gi;

      if (imageFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(imageFile);
        });

        const compressed = await new Promise<string>((resolve) => compressImage(base64, resolve));
        const cleanBase64 = compressed.replace(/^data:[^;]+;base64,/, "");

        const response = await fetch('/api/extract-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             imagemBase64: cleanBase64, 
             customPrompt: "Extraia todas as informações dessa prancheta e retorne um array de objetos JSON para cada linha. Inclua campos como cavalo, carreta, destino, motorista. Não limite o número de linhas."
          })
        });

        if (!response.ok) throw new Error("Falha na chamada da API de OCR");
        const result = await response.json();
        
        if (result.success && result.data) {
           const dataArray: any[] = Array.isArray(result.data) ? result.data : [result.data];
           dataArray.forEach(row => {
              const placa = (row.cavalo || row.plate || row.placa || '').replace(/[\s-]/g, '').toUpperCase();
              let motorista = row.motorista || row.responsible || '';
              let destino = row.destination || row.destino || '---';
              let dadosBrutos = JSON.stringify(row);
              
              novosRegistros.push({
                 cavalo: placa || 'DESCONHECIDO',
                 carreta: row.carreta || '---',
                 destino: destino.toUpperCase(),
                 estaNoPatio: 'Não',
                 assinado: 'Não',
                 inseridoEm: new Date().toISOString(),
                 rawStr: dadosBrutos,
                 motorista: motorista
              });
           });
        }
      } else {
        const linhas = pasteText.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');

        let delimiter = '\t';
        const checkLinesCount = Math.min(linhas.length, 5);
        const delimiters = ['\t', ';', '|', ','];
        let bestDelimiter = '\t';
        let maxDelimiterScore = -1;
        
        delimiters.forEach(del => {
          let count = 0;
          for(let i=0; i<checkLinesCount; i++) {
             count += linhas[i].split(del).length - 1;
          }
          if (count > maxDelimiterScore) {
            maxDelimiterScore = count;
            bestDelimiter = del;
          }
        });
        
        if (maxDelimiterScore > 0) {
          delimiter = bestDelimiter;
        }

        const rows = linhas.map(row => row.split(delimiter));

        const isLicensePlate = (str: string): boolean => {
          const clean = str.replace(/[\s-]/g, '').toUpperCase();
          if (clean.length !== 7) return false;
          const firstThreeLetters = /^[A-Z]{3}$/.test(clean.substring(0, 3));
          const restAlphanumeric = /^[0-9][A-Z0-9][0-9]{2}$/.test(clean.substring(3));
          return firstThreeLetters && restAlphanumeric;
        };

        let colCavalo = -1;
        let colCarreta = -1;
        let colDestino = -1;
        let colOrigem = -1;
        let colTermo = -1;
        let colTransportador = -1;
        let headerRowIdx = -1;

        for (let r = 0; r < Math.min(rows.length, 5); r++) {
          const cells = rows[r].map(cell => cell.trim().toUpperCase());
          const hasCavaloHeader = cells.some(c => c.includes('CAVALO') || c === 'PLACA' || c.includes('VEICULO') || c.includes('VEÍCULO') || c.includes('PLACA_CV') || c === 'TRUCK');
          const hasDestinoHeader = cells.some(c => c.includes('DESTINO') || c.includes('CIDADE') || c.includes('FILIAL') || c === 'DEST');
          const hasOrigemHeader = cells.some(c => c.includes('ORIGEM'));
          const hasTransportadorHeader = cells.some(c => c.includes('TRANSPORTADOR') || c === 'TRANSP');
          if (hasCavaloHeader || hasDestinoHeader || hasOrigemHeader || hasTransportadorHeader) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx !== -1) {
          const headers = rows[headerRowIdx].map(h => h.trim().toUpperCase());
          
          const findColumn = (keywords: string[], excludeKeywords: string[] = []): number => {
            for (const kw of keywords) {
              const foundIdx = headers.findIndex(h => h === kw);
              if (foundIdx !== -1) return foundIdx;
            }
            for (const kw of keywords) {
              const foundIdx = headers.findIndex(h => {
                const matchesKw = h.includes(kw);
                if (!matchesKw) return false;
                const matchesExclude = excludeKeywords.some(ex => h.includes(ex));
                return !matchesExclude;
              });
              if (foundIdx !== -1) return foundIdx;
            }
            return -1;
          };

          colCavalo = findColumn(
            ['CAVALO', 'PLACA', 'PLACA_CV', 'TRUCK', 'VEICULO', 'VEÍCULO'],
            ['MODELO', 'ESTADO', 'TIPO', 'CARRETA', 'SEMI', 'REBOQUE']
          );
          colCarreta = findColumn(
            ['CARRETA', 'REBOQUE', 'REBOQUES', 'SEMIRREBOQUE', 'PLACA CARRETA', 'PLACA_CR'],
            ['MODELO', 'ESTADO', 'TIPO']
          );
          colDestino = findColumn(
            ['DESTINO', 'DEST', 'CIDADE', 'FILIAL', 'UF', 'LOCALIDADE', 'ESTADO', 'MUNICIPIO', 'MUNICÍPIO'],
            ['PROPONENTE', 'ORIGEM', 'ORIG', 'STATUS', 'MOTORISTA', 'PLACA', 'CARREGOU', 'EMISSÃO']
          );
          colOrigem = findColumn(
            ['ORIGEM', 'ORIG'],
            ['DESTINO', 'DEST', 'CIDADE']
          );
          colTermo = findColumn(
            ['TERMO'],
            ['CONTATO', 'CARREGOU', 'FEZ']
          );
          colTransportador = findColumn(
            ['TRANSPORTADOR', 'TRANSP', 'TRANSPORTADORA', 'NM_TRANS'],
            []
          );
        }

        const dataStartIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
        let numCols = 1;
        for (let i = dataStartIdx; i < rows.length; i++) {
            if (rows[i].length > numCols) numCols = rows[i].length;
        }

        if (colCavalo === -1) {
          const plateCols: number[] = [];
          for (let colIdx = 0; colIdx < numCols; colIdx++) {
            let matches = 0;
            for(let r = dataStartIdx; r < rows.length; r++) {
               const val = (rows[r][colIdx] || '').trim();
               if (isLicensePlate(val)) matches++;
            }
            if (matches > 0 && matches >= Math.max(1, Math.floor((rows.length - dataStartIdx) * 0.15))) {
              plateCols.push(colIdx);
            }
          }
          if (plateCols.length > 0) {
            colCavalo = plateCols[0];
            if (plateCols.length > 1) {
              colCarreta = plateCols[1];
            }
          }
        }

        if (colDestino === -1) {
          const cityPatterns = ["MOC", "GUARULHOS", "VIANA", "EXTREMA", "SERRA", "BETIM", "CURITIBA", "CONTAGEM", "SANTA LUZIA", "SUMARE", "SUMARÉ", "PINHAIS", "CAMPO GRANDE", "EUSEBIO", "EUSÉBIO", "ARIQUEMES", "VESPASIANO", "RJ", "SP", "MG", "ES", "PR", "SC", "RS", "GO", "MT", "MS", "BA", "CE", "RN", "PE", "PA", "AM", "RO", "TO", "DF"];
          const cityCols: { idx: number; matches: number }[] = [];
          let bestCol = -1;
          let maxMatches = 0;
          
          for (let c = 0; c < numCols; c++) {
            if (c === colCavalo || c === colCarreta) continue;
            let matches = 0;
            for(let r = dataStartIdx; r < Math.min(rows.length, dataStartIdx + 20); r++) {
               const val = (rows[r][c] || '').trim().toUpperCase();
               if (cityPatterns.some(city => val.includes(city)) && !/[0-9]/.test(val)) {
                 matches++;
               }
            }
            if (matches > 0) {
              cityCols.push({ idx: c, matches });
            }
            if (matches > maxMatches) {
               maxMatches = matches;
               bestCol = c;
            }
          }
          
          cityCols.sort((a, b) => a.idx - b.idx);
          if (cityCols.length >= 2) {
            colOrigem = cityCols[0].idx;
            colDestino = cityCols[1].idx;
          } else if (cityCols.length === 1) {
            colDestino = cityCols[0].idx;
          } else if (bestCol !== -1 && maxMatches > 0) {
            colDestino = bestCol;
          } else {
            for (let c = 0; c < numCols; c++) {
              if (c !== colCavalo && c !== colCarreta) {
                  colDestino = c;
                  break;
              }
            }
          }

          if (colOrigem !== -1 && colDestino === -1) {
            let bestColRight = -1;
            let maxMatchesRight = -1;
            for (let c = colOrigem + 1; c < numCols; c++) {
              if (c === colCavalo || c === colCarreta) continue;
              let matches = 0;
              for(let r = dataStartIdx; r < Math.min(rows.length, dataStartIdx + 20); r++) {
                 const val = (rows[r][c] || '').trim().toUpperCase();
                 if (cityPatterns.some(city => val.includes(city)) && !/[0-9]/.test(val)) {
                   matches++;
                 }
              }
              if (matches > maxMatchesRight) {
                maxMatchesRight = matches;
                bestColRight = c;
              }
            }
            if (bestColRight !== -1) {
              colDestino = bestColRight;
            }
          }

          if (colDestino !== -1 && colDestino === colOrigem) {
            colDestino = -1;
          }
        }

        const numColsFinal = numCols || 1;
        if (colCavalo === -1 || colCavalo >= numColsFinal) colCavalo = 0;

        for (let r = dataStartIdx; r < rows.length; r++) {
          const row = rows[r];
          if (row.length === 0 || row.every(c => !c.trim())) continue;

          let isExcludedTransportador = false;
          if (colTransportador !== -1 && colTransportador < row.length) {
            const transpVal = (row[colTransportador] || '').trim().toLowerCase();
            if (transpVal.includes("3c")) {
              isExcludedTransportador = true;
            }
          }
          if (isExcludedTransportador) continue;

          let isTermoSim = false;
          if (colTermo !== -1 && colTermo < row.length) {
            const termoVal = row[colTermo].trim().toUpperCase();
            if (termoVal === 'SIM' || termoVal === 'S') {
              isTermoSim = true;
            }
          }
          if (isTermoSim) continue;

          let isExcludedOrigin = false;
          if (colOrigem !== -1 && colOrigem < row.length) {
            const origemVal = row[colOrigem].trim().toUpperCase();
            if (origemVal.includes('VIANA') || origemVal.includes('MONTES CLAROS')) {
              isExcludedOrigin = true;
            }
          } else {
            for (let c = 0; c < row.length; c++) {
              if (c === colDestino || c === colCavalo || c === colCarreta) continue;
              const cellVal = (row[c] || '').trim().toUpperCase();
              if (cellVal.includes('VIANA') || cellVal.includes('MONTES CLAROS')) {
                isExcludedOrigin = true;
                break;
              }
            }
          }
          if (isExcludedOrigin) continue;

          let placa = '';
          let matchedColIdx = -1;

          if (colCavalo !== -1 && colCavalo < row.length) {
            const val = (row[colCavalo] || '').trim();
            const cleanVal = val.replace(/[\s-]/g, '').toUpperCase();
            const match = cleanVal.match(regexPlaca);
            if (match) {
              placa = match[0];
              matchedColIdx = colCavalo;
            }
          }

          if (!placa) {
            for (let c = 0; c < row.length; c++) {
              const val = (row[c] || '').trim();
              const cleanVal = val.replace(/[\s-]/g, '').toUpperCase();
              const match = cleanVal.match(regexPlaca);
              if (match) {
                placa = match[0];
                matchedColIdx = c;
                break;
              }
            }
          }

          const rawStr = row.join(' | ');

          if (!placa) {
             novosRegistros.push({
                cavalo: 'DESCONHECIDO',
                carreta: '---',
                destino: '---',
                estaNoPatio: 'Não',
                assinado: 'Não',
                inseridoEm: new Date().toISOString(),
                rawStr
              });
              continue;
          }

          const cleanPlaca = placa.replace(/[\s-]/g, '').toUpperCase();
          let carretaVal = '---';
          let destinoVal = 'SANTA LUZIA/MG';

          if (colCarreta !== -1 && colCarreta < row.length && colCarreta !== matchedColIdx) {
            const parsedCar = (row[colCarreta] || '').trim();
            if (parsedCar) carretaVal = parsedCar;
          } else {
            const otherCarretaCell = row.find((cell, cIdx) => cIdx !== matchedColIdx && isLicensePlate((cell || '').trim()));
            if (otherCarretaCell) {
              carretaVal = otherCarretaCell.trim();
            } else {
              const possibleCarreta = row.find((cell, cIdx) => cIdx !== matchedColIdx && /[A-Z0-9]{3,8}/i.test((cell || '').trim()));
              if (possibleCarreta) {
                carretaVal = possibleCarreta.trim();
              }
            }
          }

          if (colDestino !== -1 && colDestino < row.length && colDestino !== matchedColIdx) {
            const val = (row[colDestino] || '').trim();
            if (val && !isLicensePlate(val) && val.length > 1) {
              destinoVal = val;
            }
          } 
          
          if (!destinoVal || destinoVal === '---' || destinoVal === 'SANTA LUZIA/MG' || isLicensePlate(destinoVal)) {
            const shouldRunHeuristic = (colDestino === -1) || isLicensePlate(destinoVal) || !destinoVal || destinoVal === '---';

            if (shouldRunHeuristic) {
              const candidates = row.map((c, cIdx) => ({ val: (c || '').trim(), idx: cIdx }))
                .filter(item => {
                  const valClean = item.val.toUpperCase();
                  if (item.idx === matchedColIdx) return false;
                  if (colOrigem !== -1 && item.idx === colOrigem) return false;
                  if (valClean === cleanPlaca) return false;
                  if (valClean === carretaVal.toUpperCase()) return false;
                  if (!valClean || valClean.length < 2 || valClean.length > 25) return false;
                  if (/[0-9]/.test(valClean)) return false; 
                  return true;
                });

              if (candidates.length > 0) {
                const prior = candidates.find(c => ["MOC", "GUARULHOS", "VIANA", "EXTREMA", "SERRA", "BETIM", "CURITIBA", "CONTAGEM", "SANTA LUZIA", "SUMARE", "SUMARÉ", "PINHAIS", "CAMPO GRANDE", "EUSEBIO", "EUSÉBIO", "ARIQUEMES", "VESPASIANO", "RJ", "SP", "MG", "ES", "PR", "SC", "RS", "DF", "GO", "MT", "MS", "CE", "RN", "PE", "BA", "PA", "AM", "SALVADOR", "MONTES CLAROS", "RIO DE JANEIRO", "LONDRINA", "GRAVATAÍ", "GRAVATAI", "GOV. CELSO RAMOS", "GOVERNADOR CELSO RAMOS", "CUIABÁ", "CUIABA", "NATAL"].some(city => c.val.toUpperCase().includes(city)));
                if (prior) {
                  destinoVal = prior.val;
                } else {
                  candidates.sort((a, b) => a.val.length - b.val.length);
                  destinoVal = candidates[0].val;
                }
              }
            }
          }

          destinoVal = destinoVal.toUpperCase();

          if (placa && placa !== 'DESCONHECIDO') {
            const alreadyExists = novosRegistros.some(r => r.cavalo === placa);
            if (alreadyExists) continue;
          }

          novosRegistros.push({
            cavalo: placa,
            carreta: carretaVal,
            destino: destinoVal,
            estaNoPatio: 'Não',
            assinado: 'Não',
            inseridoEm: new Date().toISOString(),
            rawStr
          });
        }
      }

      if (novosRegistros.length === 0) {
        throw new Error('Nenhum registro encontrado.');
      }

      const patioRef = ref(db, 'patio/veiculos');
      const promises = novosRegistros.map(async (veiculo) => {
        if (veiculo.cavalo !== 'DESCONHECIDO') {
           const existing = patioData.find(item => item.cavalo === veiculo.cavalo);
           if (existing) {
             return update(ref(db, `patio/veiculos/${existing.id}`), {
               ...veiculo,
               dataAtualizacao: new Date().toISOString()
             });
           }
        }
        const novoVeiculoRef = push(patioRef);
        return set(novoVeiculoRef, veiculo);
      });

      await Promise.all(promises);

      setStatusMsg({ type: 'success', text: `${novosRegistros.length} registros integrados!` });
      setPasteText('');
      setImageFile(null);

    } catch (error: any) {
      console.error("Erro no Pátio Sync:", error);
      setStatusMsg({ type: 'error', text: error.message || 'Falha ao processar.' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const safeData = Array.isArray(patioData) ? patioData : [];

  const filteredData = safeData.filter(item => {
    const matchesSearch = (item?.cavalo && item.cavalo.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (item?.carreta && item.carreta.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    
    // Sumir da lista visual imediatamente se estiver assinado
    if (item.assinado === 'Sim') return false;

    if (patioFilter === 'Todos') return true;
    return item.estaNoPatio === patioFilter;
  });

  return (
    <div className="w-full min-h-full text-[#2b180d] relative flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden select-none">
      
       {/* ================= HEADER AREA ================= */}
      <div className="hidden w-full flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-[94rem] mx-auto mt-2 mb-6 shrink-0">
        
        {/* Left title and logo stack */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 text-left w-full md:w-auto">
          <div className="flex items-center gap-5">
            {/* Logo stamp SVG */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 pointer-events-none hover:scale-105 transition-transform duration-500">
              <svg className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(58,36,20,0.35)]" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="40%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d92d33" />
                    <stop offset="100%" stopColor="#7a0307" />
                  </linearGradient>
                </defs>
                {/* Embossed metal rim */}
                <circle cx="60" cy="60" r="54" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
                <circle cx="60" cy="60" r="50" fill="url(#redGrad)" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                
                {/* Outer heart bundle */}
                <g transform="translate(60, 56) scale(0.72)">
                  <path d="M-12,-10 C-17,-15 -25,-12 -25,-4 C-25,4 -15,10 0,22 C15,10 25,4 25,-4 C25,-12 17,-15 12,-10 C8,-6 2,-6 0,-6 C-2,-6 -8,-6 -12,-10 Z" fill="url(#goldGrad)" />
                  {/* Embedded hearts inside */}
                  <path d="M-6,-4 C-8.5,-6.5 -12.5,-5 -12.5,-1 C-12.5,3 -7.5,6 0,12 C7.5,6 12.5,3 12.5,-1 C12.5,-5 8.5,-6.5 6,-4 C4,-2 1,-2 0,-2 C-1,-2 -3,-2 -6,-4 Z" fill="#7a0307" />
                  <path d="M-3,-1.5 C-4.2,-2.7 -6.2,-2 -6.2,0 C-6.2,2 -3.7,3.5 0,6 C3.7,3.5 6.2,2 6.2,0 C6.2,-2 4.2,-2.7 3,-1.5 C2,-0.5 0.5,-0.5 0,-0.5 C-0.5,-0.5 -1,-0.5 -3,-1.5 Z" fill="url(#goldGrad)" />
                </g>

                {/* Gold text border on top */}
                <path id="brandPath" d="M 18,60 A 42,42 0 0,0 102,60" fill="none" />
                <text fontFamily="Oswald" fontSize="9" fontWeight="bold" fill="url(#goldGrad)" textAnchor="middle">
                  <textPath href="#brandPath" startOffset="50%">3 CORAÇÕES</textPath>
                </text>
              </svg>
            </div>

            {/* Page title next to the logo */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-rustic-title font-black text-[#2b180d] uppercase tracking-wide leading-none drop-shadow-[1px_2px_1px_rgba(255,255,255,0.45)]">
                PÁTIO
              </h1>
            </div>
          </div>
        </div>

        {/* Action Button for returning / Back */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-[#ca1a20] to-[#8c060a] hover:from-[#e52229] hover:to-[#a9080d] border-2 border-[#ff3e47]/20 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_4px_10px_rgba(140,6,10,0.3)] active:translate-y-0.5 cursor-pointer select-none"
          >
            <ChevronLeft size={16} className="stroke-[3]" />
            <span>Voltar ao Menu Inicial</span>
          </button>
        )}
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="w-full relative z-10 max-w-[94rem] mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#ebd9c3]/50 p-2.5 border-2 border-[#5c3c24]/20 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 bg-[#e8d5bc]/80 p-1 border-2 border-[#5c3c24]/25 rounded-xl shadow-inner w-full sm:w-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('patio')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 select-none",
              activeSubTab === 'patio'
                ? "bg-gradient-to-b from-[#ca1a20] to-[#800609] text-[#fdefd1] shadow-md border border-[#ff3e47]/20 font-black"
                : "text-[#5c3c24] hover:bg-[#debfa0]/40 font-bold"
            )}
          >
            <Truck size={14} className="stroke-[2.5]" />
            <span>Gerenciar Pátio</span>
          </button>
          <button
            onClick={() => setActiveSubTab('disponibilidade')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 select-none",
              activeSubTab === 'disponibilidade'
                ? "bg-gradient-to-b from-[#ca1a20] to-[#800609] text-[#fdefd1] shadow-md border border-[#ff3e47]/20 font-black"
                : "text-[#5c3c24] hover:bg-[#debfa0]/40 font-bold"
            )}
          >
            <Activity size={14} className="stroke-[2.5]" />
            <span>Disponibilidade</span>
          </button>
          <button
            onClick={() => setActiveSubTab('iscas')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 select-none",
              activeSubTab === 'iscas'
                ? "bg-gradient-to-b from-[#ca1a20] to-[#800609] text-[#fdefd1] shadow-md border border-[#ff3e47]/20 font-black"
                : "text-[#5c3c24] hover:bg-[#debfa0]/40 font-bold"
            )}
          >
            <Cpu size={14} className="stroke-[2.5]" />
            <span>Iscas</span>
          </button>
          <button
            onClick={() => setActiveSubTab('coleta')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 select-none",
              activeSubTab === 'coleta'
                ? "bg-gradient-to-b from-[#ca1a20] to-[#800609] text-[#fdefd1] shadow-md border border-[#ff3e47]/20 font-black"
                : "text-[#5c3c24] hover:bg-[#debfa0]/40 font-bold"
            )}
          >
            <FileText size={14} className="stroke-[2.5]" />
            <span>Ordem de Coleta</span>
          </button>
        </div>
        <div className="text-[10px] text-[#5c3c24]/80 font-bold uppercase tracking-wider hidden md:block">
          SISTEMA DE CONTROLE DE FLUXO & DISPONIBILIDADE
        </div>
      </div>

      {activeSubTab === 'patio' ? (
        <>
          {/* ================= HERO OPERATIONAL MONITORS PLAQUE ================= */}
      <div className="hidden md:block w-full relative z-10 max-w-[94rem] mx-auto mt-6 shrink-0">
        <WoodenPlaque className="py-4 px-6 md:px-8 flex flex-col md:flex-row items-center justify-center gap-6" screwSize="w-2.5 h-2.5">
          {/* Core Metrics Widgets */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-3 sm:gap-4 w-full md:w-auto">
            {/* EM PERMANÊNCIA CARD */}
            <div className="flex-1 md:flex-none md:min-w-[180px] bg-[#f0dfcc]/60 border-2 border-[#5c3c24]/30 rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3.5 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1)] text-left min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#5c3c24] flex items-center justify-center text-[#f7eedf] shadow-md shrink-0">
                <Truck size={15} className="sm:size-[18px] stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] sm:text-[9px] font-black text-[#5c3c24]/80 uppercase tracking-wider leading-none mb-1 truncate">NO PÁTIO</span>
                <span className="text-xl sm:text-3xl font-black text-[#1c1109] leading-none">
                  {safeData.filter(i => i.estaNoPatio === 'Sim').length}
                </span>
              </div>
            </div>

            {/* FLUXO PENDENTE CARD */}
            <div className="flex-1 md:flex-none md:min-w-[180px] bg-[#f0dfcc]/60 border-2 border-[#5c3c24]/30 rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3.5 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1)] text-left min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8c060a] flex items-center justify-center text-[#fdefd1] shadow-md shrink-0">
                <Activity size={15} className="sm:size-[18px] stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] sm:text-[9px] font-black text-[#8c060a] uppercase tracking-wider leading-none mb-1 truncate">PENDENTE</span>
                <span className="text-xl sm:text-3xl font-black text-[#8c060a] leading-none">
                  {safeData.length}
                </span>
              </div>
            </div>
          </div>
        </WoodenPlaque>
      </div>

      {/* Mobile Tab Selector */}
      <div className="hidden w-full lg:hidden bg-[#e8d5bc]/80 p-1 border-3 border-[#5c3c24]/25 rounded-2xl shadow-inner relative z-10 mt-4 shrink-0">
        <button
          onClick={() => setMobileTab('lista')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
            mobileTab === 'lista'
              ? "bg-gradient-to-b from-[#a27a5d] to-[#835835] text-[#fdefd1] shadow-md border-2 border-[#5c3c24]/40"
              : "text-[#5c3c24] hover:bg-[#debfa0]/40"
          )}
        >
          <Truck size={14} className="stroke-[2.5]" />
          <span>Gerenciar Pátio ({filteredData.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('importar')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
            mobileTab === 'importar'
              ? "bg-gradient-to-b from-[#a27a5d] to-[#835835] text-[#fdefd1] shadow-md border-2 border-[#5c3c24]/40"
              : "text-[#5c3c24] hover:bg-[#debfa0]/40"
          )}
        >
          <Database size={14} className="stroke-[2.5]" />
          <span>Importar Lote</span>
        </button>
      </div>

      {/* ================= CONTROLLER CODES & DATA GRID PANEL ================= */}
      <div className="w-full relative z-10 max-w-[94rem] mx-auto mt-6 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: INGESTION CONSOLE PLAQUE */}
        <div className={cn("lg:col-span-4 h-full flex flex-col", mobileTab === 'importar' ? "flex" : "hidden lg:flex")}>
          <WoodenPlaque className="h-full flex-1" screwSize="w-2.5 h-2.5">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-[#5c3c24]/10 text-left">
              <Database size={18} className="text-[#8c060a]" />
              <h2 className="text-sm font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">Console de Ingestão</h2>
            </div>

            <div className="space-y-4 flex flex-col justify-between flex-1">
              
              <div className="space-y-4">
                {/* Embedded Terminal Board */}
                <div className="relative bg-gradient-to-br from-[#1d120a] to-[#2b190f] border-3 border-[#5c3c24]/85 p-1.5 rounded-xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.85),0_1px_2px_rgba(255,255,255,0.15)] overflow-hidden">
                  <textarea 
                    className="w-full h-48 bg-transparent p-4 text-[12px] text-[#edd9bf] font-mono resize-none focus:outline-none placeholder:text-[#5c3c24]/50 uppercase leading-relaxed font-semibold"
                    placeholder="AGUARDANDO ENTRADA DE DADOS ..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                  />
                  
                  {/* Glowing Indicator lamp */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-[8px] font-mono text-[#edd9bf]/40 uppercase tracking-widest">INPUT BUFFER</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  </div>
                </div>

                {statusMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-2.5 shadow-md text-left",
                      statusMsg.type === 'error' 
                        ? "bg-[#fdedeb] border-red-800/40 text-red-900" 
                        : "bg-[#eefdf5] border-emerald-800/40 text-emerald-950"
                    )}
                  >
                    <ShieldCheck size={14} className={statusMsg.type === 'error' ? 'text-red-700' : 'text-emerald-700'} />
                    <span>{statusMsg.text}</span>
                  </motion.div>
                )}
              </div>

              {/* Premium 4K Aesthetic Coffee Image Frame to fill the Empty Space */}
              <div className="flex-1 my-4 flex items-center justify-center min-h-[220px] lg:min-h-[280px]">
                <div className="w-full h-full min-h-[220px] lg:min-h-[280px] relative rounded-2xl overflow-hidden border-2 border-[#5c3c24]/80 shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.1)] group bg-[#26160d]">
                  <img 
                    src="/images/banner_coffee.jpg" 
                    alt="Café Especial 3 Corações Rústico"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d120a]/90 via-[#1d120a]/20 to-[#1d120a]/40 pointer-events-none" />
                  
                  {/* Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-[#1d120a]/90 border border-[#cead80]/40 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-serif font-black text-[#edd9bf] uppercase tracking-wider">Edição Rústica</span>
                      <span className="text-[7px] font-sans text-[#cead80] tracking-widest font-bold">SOFISTICADA</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B32025] animate-pulse shadow-[0_0_8px_#B32025]" />
                  </div>
                </div>
              </div>

              {/* Action Buttons styled like the wooden theme buttons */}
              <div className="flex flex-col gap-3.5 pt-4">
                
                {/* Advanced Hidden File OCR option */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 filter hover:brightness-110 transition-all">
                    <div className="flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-[#5c3c24]/40 hover:border-[#5c3c24]/80 rounded-xl bg-[#eddaba]/40 text-[#5c3c24] text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                      <ImageIcon size={14} className="stroke-[2.5]" />
                      <span>{imageFile ? imageFile.name.substring(0, 18) + '...' : 'Anexar Imagem OCR'}</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                          setStatusMsg({ type: 'success', text: `Imagem '${e.target.files[0].name}' selecionada. Clique em Executar.` });
                        }
                      }} 
                    />
                  </label>
                  {imageFile && (
                    <button 
                      onClick={() => { setImageFile(null); setStatusMsg(null); }}
                      className="p-2 border-2 border-red-800/20 text-red-700 bg-red-150-10 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      X
                    </button>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleProcessData}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-[0_5px_0px_#800609,0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0px_#800609,0_3px_5px_rgba(0,0,0,0.4)] border-2 border-[#ff3e47]/30 text-white",
                    isProcessing 
                      ? "bg-slate-800 text-slate-500 shadow-none border-transparent cursor-not-allowed" 
                      : "bg-gradient-to-b from-[#ca1a20] to-[#8c060a] hover:from-[#e52229] hover:to-[#a9080d]"
                  )}
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="stroke-[3]" />}
                  Executar Lote
                </motion.button>
                
                <button 
                  onClick={handleClearAll}
                  className="w-full py-2.5 text-[#5c3c24] hover:text-[#8c060a] hover:border-[#8c060a]/30 font-black text-[10px] uppercase tracking-[0.25em] border-2 border-[#5c3c24]/20 rounded-xl bg-[#f0e3d2]/60 hover:bg-[#ebd9c3] transition-all cursor-pointer shadow-sm"
                >
                  Resetar Registros
                </button>
              </div>

            </div>
          </WoodenPlaque>
        </div>

        {/* RIGHT COLUMN: CORE MONITOR DATA TABLE SCREEN */}
        <div className={cn("lg:col-span-8 h-full flex flex-col min-h-[22rem] lg:min-h-[30rem]", mobileTab === 'lista' ? "flex" : "hidden lg:flex")}>
          <WoodenPlaque className="h-full flex-1" screwSize="w-2.5 h-2.5">
            
            {/* Header filters and Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#5c3c24]/10">
              
              {/* Filter Tabs raising nicely from wood */}
              <div className="flex w-full sm:w-auto bg-[#e8d5bc]/80 p-0.5 border-3 border-[#5c3c24]/25 rounded-xl shadow-inner relative z-10 shrink-0">
                {(['Todos', 'Sim', 'Não'] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => setPatioFilter(filterOpt)}
                    className={cn(
                      "flex-1 sm:flex-none px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer select-none",
                      patioFilter === filterOpt 
                        ? "bg-gradient-to-b from-[#ca1a20] to-[#800609] text-white shadow-[0_3px_8px_rgba(128,6,10,0.45)] border border-[#ff3e47]/20 font-black" 
                        : "text-[#5c3c24] hover:bg-[#debfa0]/40 font-bold"
                    )}
                  >
                    {filterOpt}
                  </button>
                ))}
              </div>

              {/* Textured search Input bar */}
              <div className="relative w-full sm:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c3c24]/60 group-focus-within:text-[#8c060a] transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="LOCALIZAR PLACA OU MANIFESTO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#f8f5ee] border-2 border-[#5c3c24]/40 rounded-xl pl-11 pr-5 py-2 text-xs font-black tracking-[0.2em] text-[#311f14] uppercase focus:border-[#8c060a] outline-none transition-all placeholder:text-[#5c3c24]/40 shadow-inner"
                />
              </div>

            </div>

            {/* Desktop Table view */}
            <div className="hidden md:block flex-1 pr-1.5">
              <table className="w-full text-left border-collapse leading-none min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-[#5c3c24]/20">
                    <th className="py-3 px-4 text-[10px] font-black text-[#5c3c24]/70 uppercase tracking-[0.25em]">Identificador</th>
                    <th className="py-3 px-4 text-[10px] font-black text-[#5c3c24]/70 uppercase tracking-[0.25em]">Está no Pátio?</th>
                    <th className="py-3 px-4 text-[10px] font-black text-[#5c3c24]/70 uppercase tracking-[0.25em]">Assinou?</th>
                    <th className="py-3 px-4 text-[10px] font-black text-[#5c3c24]/70 uppercase tracking-[0.25em] text-center">--</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5c3c24]/10">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <span className="text-[#5c3c24]/40 font-black uppercase tracking-[0.4em] text-[11px] animate-pulse">Aguardando Sincronização de Fluxo</span>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#ebd9c3]/30 transition-colors">
                        
                        {/* Plate with Mercosul view */}
                        <td className="py-3.5 px-4">
                          <LicensePlate plate={item.cavalo} />
                        </td>

                        {/* Dropdown Está no Pátio */}
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block w-36">
                            <select 
                              value={item.estaNoPatio} 
                              onChange={(e) => updatePatioData(item.id, 'estaNoPatio', e.target.value as 'Sim' | 'Não')} 
                              className={cn(
                                "w-full bg-gradient-to-b from-[#a27a5d] to-[#835835] border-2 border-[#5c3c24]/60 text-[#fdefd1] font-black text-xs uppercase tracking-widest rounded-xl py-2 px-4 shadow-md outline-none cursor-pointer hover:from-[#bfa186] hover:to-[#926b4c] transition-all appearance-none text-center"
                              )}
                            >
                              <option value="Sim" className="bg-[#5c3c24] text-[#fdefd1] font-bold">SIM</option>
                              <option value="Não" className="bg-[#5c3c24] text-[#fdefd1] font-bold">NÃO</option>
                            </select>
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-[#fdefd1] text-[9px] font-bold">
                              ▼
                            </div>
                          </div>
                        </td>

                        {/* Dropdown Assinou */}
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block w-36">
                            <select 
                              value={item.assinado} 
                              onChange={(e) => handleAssinadoChange(item.id, e.target.value)} 
                              className={cn(
                                "w-full bg-gradient-to-b from-[#a27a5d] to-[#835835] border-2 border-[#5c3c24]/60 text-[#fdefd1] font-black text-xs uppercase tracking-widest rounded-xl py-2 px-4 shadow-md outline-none cursor-pointer hover:from-[#bfa186] hover:to-[#926b4c] transition-all appearance-none text-center"
                              )}
                            >
                              <option value="Sim" className="bg-[#5c3c24] text-[#fdefd1] font-bold">SIM</option>
                              <option value="Não" className="bg-[#5c3c24] text-[#fdefd1] font-bold">NÃO</option>
                            </select>
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-[#fdefd1] text-[9px] font-bold">
                              ▼
                            </div>
                          </div>
                        </td>

                        {/* Action Delete */}
                        <td className="py-3.5 px-4 text-center">
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2.5 bg-[#fdedeb] hover:bg-red-200 border-2 border-red-800/10 hover:border-red-800/30 text-red-700 hover:text-red-900 rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0.5"
                            title="Deletar Registro"
                          >
                            <Trash2 size={15} className="stroke-[2.5]" />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List view */}
            <div className="block md:hidden flex-1 space-y-4">
              {filteredData.length === 0 ? (
                <div className="py-20 text-center bg-[#f0dfcc]/30 rounded-2xl border-2 border-[#5c3c24]/10">
                  <span className="text-[#5c3c24]/40 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Aguardando Sincronização</span>
                </div>
              ) : (
                filteredData.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-[#fcf9f2] border-2 border-[#5c3c24]/30 rounded-2xl p-4 shadow-md flex flex-col gap-4 relative hover:border-[#8c060a]/40 transition-colors text-left font-sans"
                  >
                    {/* Delete action button */}
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="absolute top-3.5 right-3.5 p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Deletar Registro"
                    >
                      <Trash2 size={13} className="stroke-[2.5]" />
                    </button>

                    {/* Plates & identifiers details */}
                    <div className="flex items-start gap-3.5">
                      <LicensePlate plate={item.cavalo} />
                      <div className="flex flex-col min-w-0 pr-6 select-text">
                        <div className="hidden items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black text-[#5c3c24]/60 uppercase tracking-wider">Carreta:</span>
                          <span className="text-xs font-black text-[#311f14] font-mono bg-[#ebd9c3]/30 px-1.5 py-0.5 rounded border border-[#5c3c24]/10">{item.carreta || '---'}</span>
                        </div>
                        {item.motorista && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[9px] font-black text-[#5c3c24]/60 uppercase tracking-wider">Mot:</span>
                            <span className="text-xs font-bold text-[#311f14] truncate max-w-[155px]">{item.motorista}</span>
                          </div>
                        )}
                        <div className="hidden items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] font-black text-[#5c3c24]/60 uppercase tracking-wider">Destino:</span>
                          <span className="text-xs font-black text-[#8c060a] uppercase tracking-wide font-sans truncate max-w-[155px]">{item.destino || '---'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Dropdown Tap Zones */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#5c3c24]/10">
                      {/* Está no Pátio select zone */}
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[8.5px] font-black text-[#5c3c24]/75 uppercase tracking-wider pl-1 font-sans">No Pátio?</span>
                        <div className="relative">
                          <select 
                            value={item.estaNoPatio} 
                            onChange={(e) => updatePatioData(item.id, 'estaNoPatio', e.target.value as 'Sim' | 'Não')} 
                            className={cn(
                              "w-full bg-gradient-to-b from-[#a27a5d] to-[#835835] border-2 border-[#5c3c24]/50 text-[#fdefd1] font-black text-[10.5px] uppercase tracking-widest rounded-xl py-2 pl-3 pr-7 shadow-sm outline-none cursor-pointer hover:from-[#bfa186] hover:to-[#926b4c] transition-all appearance-none text-center"
                            )}
                          >
                            <option value="Sim" className="bg-[#5c3c24] text-[#fdefd1]">SIM</option>
                            <option value="Não" className="bg-[#5c3c24] text-[#fdefd1]">NÃO</option>
                          </select>
                          <div className="absolute top-1/2 right-2.5 -translate-y-1/2 pointer-events-none text-[#fdefd1] text-[7.5px]">
                            ▼
                          </div>
                        </div>
                      </div>

                      {/* Assinou select zone */}
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[8.5px] font-black text-[#5c3c24]/75 uppercase tracking-wider pl-1 font-sans">Assinado?</span>
                        <div className="relative">
                          <select 
                            value={item.assinado} 
                            onChange={(e) => handleAssinadoChange(item.id, e.target.value)} 
                            className={cn(
                              "w-full bg-gradient-to-b from-[#a27a5d] to-[#835835] border-2 border-[#5c3c24]/50 text-[#fdefd1] font-black text-[10.5px] uppercase tracking-widest rounded-xl py-2 pl-3 pr-7 shadow-sm outline-none cursor-pointer hover:from-[#bfa186] hover:to-[#926b4c] transition-all appearance-none text-center"
                            )}
                          >
                            <option value="Sim" className="bg-[#5c3c24] text-[#fdefd1]">SIM</option>
                            <option value="Não" className="bg-[#5c3c24] text-[#fdefd1]">NÃO</option>
                          </select>
                          <div className="absolute top-1/2 right-2.5 -translate-y-1/2 pointer-events-none text-[#fdefd1] text-[7.5px]">
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </WoodenPlaque>
        </div>

      </div>
        </>
      ) : activeSubTab === 'disponibilidade' ? (
        /* ================= DISPONIBILIDADE CONSOLE ================= */
        <div className="w-full relative z-10 max-w-[94rem] mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT COLUMN: CONTROL & INPUT */}
          <div className="lg:col-span-5 h-full flex flex-col">
            <WoodenPlaque className="h-full flex-1" screwSize="w-2.5 h-2.5">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-[#5c3c24]/10 text-left">
                <Activity size={18} className="text-[#ca1a20]" />
                <h2 className="text-sm font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">Configuração & Ingestão</h2>
              </div>

              <div className="space-y-5 flex flex-col justify-between flex-1">
                
                {/* Assunto do E-mail (Copiar Separadamente) */}
                <div className="flex flex-col gap-2 text-left bg-[#f8f5ee]/90 border-2 border-[#5c3c24]/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex justify-between items-center gap-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3c24] flex items-center gap-1.5">
                      <FileText size={13} className="text-[#ca1a20] shrink-0" />
                      <span>Assunto do e-mail (copiar separadamente):</span>
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        const subjectText = getFormattedEmailSubject();
                        await navigator.clipboard.writeText(subjectText);
                        setSubjectCopied(true);
                        setTimeout(() => setSubjectCopied(false), 2000);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm shrink-0",
                        subjectCopied
                          ? "bg-green-700 border-green-800 text-white"
                          : "bg-gradient-to-b from-[#ca1a20] to-[#8c060a] hover:from-[#e52229] hover:to-[#a9080d] border-[#ff3e47]/30 text-white"
                      )}
                    >
                      {subjectCopied ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} className="stroke-[2.5]" />}
                      {subjectCopied ? 'Copiado!' : 'Copiar Assunto'}
                    </button>
                  </div>
                  <div className="bg-[#1d120a] border border-[#5c3c24]/60 rounded-lg p-2.5 font-mono text-xs font-bold text-[#edd9bf] select-all tracking-wide break-all">
                    {getFormattedEmailSubject()}
                  </div>
                </div>

                {/* Greeting Dropdown Selector */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3c24]">Saudação Inicial (Automática):</label>
                  <div className="relative inline-block w-full">
                    <select 
                      value={disponibilidadeGreeting} 
                      onChange={(e) => setDisponibilidadeGreeting(e.target.value as 'bom dia' | 'boa tarde' | 'boa noite')} 
                      className="w-full bg-gradient-to-b from-[#f8f5ee] to-[#eddaba] border-2 border-[#5c3c24]/60 text-[#311f14] font-black text-xs uppercase tracking-widest rounded-xl py-3 px-4 shadow-md outline-none cursor-pointer hover:bg-[#e4cbab] transition-all appearance-none text-left"
                    >
                      <option value="bom dia">Prezados, bom dia!</option>
                      <option value="boa tarde">Prezados, boa tarde!</option>
                      <option value="boa noite">Prezados, boa noite!</option>
                    </select>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-[#5c3c24] text-xs font-bold">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex flex-col gap-2 text-left flex-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3c24]">Cole a Tabela da Planilha (Excel/Google Sheets):</label>
                    <button 
                      onClick={() => setDisponibilidadeInput('')}
                      className="text-[9px] uppercase tracking-wider font-extrabold text-[#ca1a20] hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="relative bg-gradient-to-br from-[#1d120a] to-[#2b190f] border-3 border-[#5c3c24]/85 p-1.5 rounded-xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.85),0_1px_2px_rgba(255,255,255,0.15)] flex-1 min-h-[16rem] flex flex-col">
                    <textarea 
                      className="w-full h-full flex-1 bg-transparent p-4 text-[12px] text-[#edd9bf] font-mono resize-none focus:outline-none placeholder:text-[#5c3c24]/50 uppercase leading-relaxed font-semibold min-h-[14rem]"
                      placeholder="COLE SUA PLANILHA AQUI (CTRL+V)...&#13;IDENTIFICAMOS AS COLUNAS DE FORMA INTELIGENTE!"
                      value={disponibilidadeInput}
                      onChange={(e) => setDisponibilidadeInput(e.target.value)}
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
                      <span className="text-[8px] font-mono text-[#edd9bf]/40 uppercase tracking-widest">SHEETS BUFFER</span>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={async () => {
                      if (!disponibilidadeInput.trim()) return;
                      const { html, text } = generateDisponibilidadeHtmlAndText(disponibilidadeGreeting, disponibilidadeInput);
                      try {
                        const typeHtml = "text/html";
                        const typeText = "text/plain";
                        const blobHtml = new Blob([html], { type: typeHtml });
                        const blobText = new Blob([text], { type: typeText });
                        const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
                        await navigator.clipboard.write(data);
                        setDispCopied(true);
                        setTimeout(() => setDispCopied(false), 2000);
                      } catch (err) {
                        await navigator.clipboard.writeText(text);
                        setDispCopied(true);
                        setTimeout(() => setDispCopied(false), 2000);
                      }
                    }}
                    disabled={!disponibilidadeInput.trim()}
                    className={cn(
                      "w-full py-4 font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-[0_5px_0px_#800609,0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0px_#800609,0_3px_5px_rgba(0,0,0,0.4)] border-2 border-[#ff3e47]/30 text-white",
                      !disponibilidadeInput.trim() 
                        ? "bg-slate-800 text-slate-500 shadow-none border-transparent cursor-not-allowed opacity-50" 
                        : "bg-gradient-to-b from-[#ca1a20] to-[#8c060a] hover:from-[#e52229] hover:to-[#a9080d]"
                    )}
                  >
                    {dispCopied ? (
                      <>
                        <Check size={16} className="stroke-[3]" />
                        Disponibilidade Copiada!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="stroke-[2.5]" />
                        Copiar Disponibilidade (HTML)
                      </>
                    )}
                  </motion.button>
                  <p className="text-[8.5px] italic text-stone-500 text-center leading-normal">
                    * Ao copiar, as informações são formatadas em uma tabela profissional ideal para envio no Outlook, Gmail ou Teams/WhatsApp.
                  </p>
                </div>

              </div>
            </WoodenPlaque>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE PREVIEW */}
          <div className="lg:col-span-7 relative min-h-[500px] lg:min-h-0">
            <div className="lg:absolute lg:inset-0 flex flex-col h-full">
              <WoodenPlaque className="h-full flex-1 flex flex-col min-h-0" screwSize="w-2.5 h-2.5">
                <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#5c3c24]/10 text-left shrink-0">
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-[#5c3c24]" />
                    <h2 className="text-sm font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">Visualização do Resultado</h2>
                  </div>
                  <div className="text-[10px] text-green-700 bg-green-100 border border-green-300 rounded px-2.5 py-0.5 font-bold uppercase tracking-wider animate-pulse select-none">
                    Tempo Real
                  </div>
                </div>

                {/* LIVE EMBEDDED EMAIL PREVIEW */}
                <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                  {!disponibilidadeInput.trim() ? (
                    <div className="h-full min-h-[24rem] flex flex-col items-center justify-center border-2 border-dashed border-[#5c3c24]/20 rounded-2xl bg-[#eddaba]/10 p-8 text-center select-none">
                      <Database className="text-[#5c3c24]/30 w-12 h-12 mb-4 animate-bounce" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#5c3c24]/60">Nenhum Dado De Ingestão</span>
                      <p className="text-[10px] text-stone-500 max-w-sm mt-3 font-semibold leading-relaxed">
                        Cole as informações copiadas da planilha Excel no painel à esquerda para gerar o cabeçalho e a tabela da disponibilidade de forma organizada.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#ffffff] border-3 border-[#311f14] rounded-2xl shadow-md text-left select-text w-full overflow-hidden flex flex-col h-full bg-[#f8f5ee]">
                      <div className="flex-1 overflow-auto">
                        {ingestedVehicles.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-center mt-10">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#5c3c24]/60">Nenhum veículo filtrado</span>
                            <p className="text-[10px] text-stone-500 max-w-sm mt-3 font-semibold leading-relaxed">
                              Nenhuma linha da tabela colada atende aos critérios do filtro (Termo = NÃO).
                            </p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse min-w-full">
                            <thead className="sticky top-0 bg-[#311f14] shadow-md z-10">
                              <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#edd9bf] border-b-2 border-[#5c3c24] text-center">Identificador</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#edd9bf] border-b-2 border-[#5c3c24] text-center">Está no Pátio?</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#edd9bf] border-b-2 border-[#5c3c24] text-center">Assinou?</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#edd9bf] border-b-2 border-[#5c3c24] text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#5c3c24]/10">
                              {ingestedVehicles.map(veh => (
                                <tr key={veh.id} className="hover:bg-[#eddaba]/20 transition-colors">
                                  <td className="px-6 py-4 text-center align-middle">
                                    <div className="inline-flex flex-col border-[2px] border-black rounded-md overflow-hidden bg-white shadow-sm w-28 mx-auto">
                                      <div className="bg-[#003399] w-full py-0.5 border-b border-black">
                                        <div className="text-[7px] text-white font-black text-center tracking-widest">BRASIL</div>
                                      </div>
                                      <div className="py-2 text-[#111111] font-black text-sm tracking-[0.15em] text-center font-mono">
                                        {veh.placa || '------'}
                                      </div>
                                    </div>
                                  </td>
                                  
                                  <td className="px-6 py-4 text-center align-middle">
                                    <select
                                      value={veh.isPatio}
                                      onChange={(e) => {
                                        setIngestedVehicles(prev => prev.map(p => p.id === veh.id ? { ...p, isPatio: e.target.value } : p));
                                      }}
                                      className="bg-white border-2 border-[#5c3c24]/30 text-[#311f14] font-bold text-xs rounded-lg py-2 px-3 outline-none cursor-pointer hover:border-[#5c3c24]/60 transition-colors text-center appearance-none shadow-sm w-24 mx-auto block"
                                    >
                                      <option value="NÃO">NÃO</option>
                                      <option value="SIM">SIM</option>
                                    </select>
                                  </td>

                                  <td className="px-6 py-4 text-center align-middle">
                                    <select
                                      value={veh.hasAssinou}
                                      onChange={(e) => {
                                        setIngestedVehicles(prev => prev.map(p => p.id === veh.id ? { ...p, hasAssinou: e.target.value } : p));
                                      }}
                                      className="bg-white border-2 border-[#5c3c24]/30 text-[#311f14] font-bold text-xs rounded-lg py-2 px-3 outline-none cursor-pointer hover:border-[#5c3c24]/60 transition-colors text-center appearance-none shadow-sm w-24 mx-auto block"
                                    >
                                      <option value="NÃO">NÃO</option>
                                      <option value="SIM">SIM</option>
                                    </select>
                                  </td>

                                  <td className="px-6 py-4 text-center align-middle">
                                    <div className="flex justify-center">
                                      <button 
                                        onClick={() => {
                                          setIngestedVehicles(prev => prev.filter(p => p.id !== veh.id));
                                        }}
                                        className="w-9 h-9 flex items-center justify-center bg-white text-[#ca1a20] hover:bg-[#ca1a20] hover:text-white rounded-full transition-colors border border-[#ca1a20]/20 shadow-sm disabled:opacity-50"
                                        title="Excluir Veículo"
                                      >
                                        <Trash2 size={16} className="stroke-[2.5]" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                )}
              </div>
            </WoodenPlaque>
            </div>
          </div>

        </div>
      ) : activeSubTab === 'iscas' ? (
        /* ================= ISCAS CONSOLE ================= */
        <div className="w-full relative z-10 max-w-[94rem] mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0 animate-fade-in">
          
          {/* LEFT COLUMN: CONTROL & INPUT */}
          <div className="lg:col-span-5 h-full flex flex-col">
            <WoodenPlaque className="h-full flex-1" screwSize="w-2.5 h-2.5">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-[#5c3c24]/10 text-left">
                <Cpu size={18} className="text-[#ca1a20]" />
                <h2 className="text-sm font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">Controle & Filtro de Iscas</h2>
              </div>

              <div className="space-y-5 flex flex-col justify-between flex-1">
                
                {/* Input text area */}
                <div className="flex-1 flex flex-col gap-2 text-left min-h-[160px]">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3c24]">
                      Colar Dados da Planilha:
                    </label>
                    <div className="flex items-center gap-3">
                      {iscaInput.trim() && (
                        <button
                          onClick={() => setIscaInput('')}
                          className="text-[9px] font-black uppercase tracking-wider text-[#ca1a20] hover:text-[#e52229] transition-colors flex items-center gap-1 cursor-pointer select-none"
                        >
                          <Trash2 size={10} />
                          Limpar
                        </button>
                      )}
                      <span className="text-[8px] font-mono text-[#edd9bf]/40 uppercase tracking-widest">
                        SUPORTA TAB/EXCEL
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={iscaInput}
                    onChange={(e) => setIscaInput(e.target.value)}
                    placeholder="Cole aqui a planilha contendo as colunas: nº da Isca, Endereço aproximado da posição, Data Posição, Bateria Isca_RF, etc."
                    className="w-full flex-1 min-h-[160px] bg-[#fdfbf7] border-2 border-[#5c3c24]/50 rounded-xl p-4 text-xs font-mono text-[#3a2212] focus:border-[#ca1a20] outline-none transition-all shadow-inner placeholder:text-[#5c3c24]/30 placeholder:font-serif placeholder:italic"
                  />
                </div>

                {/* Filters configuration section */}
                <div className="bg-[#f2e6d9]/60 border-2 border-[#5c3c24]/20 rounded-xl p-4 space-y-3 text-left">
                  <h3 className="text-[10px] font-black text-[#311f14] uppercase tracking-[0.15em] mb-2 font-serif border-b border-[#5c3c24]/10 pb-1">
                    Filtros de Segurança (Ativos)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={filterBattery100}
                        onChange={(e) => setFilterBattery100(e.target.checked)}
                        className="w-4 h-4 rounded border-[#5c3c24]/60 text-[#ca1a20] focus:ring-[#ca1a20] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#5c3c24] group-hover:text-[#ca1a20] transition-colors">
                        Bateria em 100%
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={filterSameDay}
                        onChange={(e) => setFilterSameDay(e.target.checked)}
                        className="w-4 h-4 rounded border-[#5c3c24]/60 text-[#ca1a20] focus:ring-[#ca1a20] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#5c3c24] group-hover:text-[#ca1a20] transition-colors">
                        Data Posição Atual
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={filterTwoHours}
                        onChange={(e) => setFilterTwoHours(e.target.checked)}
                        className="w-4 h-4 rounded border-[#5c3c24]/60 text-[#ca1a20] focus:ring-[#ca1a20] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#5c3c24] group-hover:text-[#ca1a20] transition-colors" title="Aceitável com no máximo 2 horas de atraso">
                        Máx. 2h de atraso
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={filterSantaLuzia}
                        onChange={(e) => setFilterSantaLuzia(e.target.checked)}
                        className="w-4 h-4 rounded border-[#5c3c24]/60 text-[#ca1a20] focus:ring-[#ca1a20] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#5c3c24] group-hover:text-[#ca1a20] transition-colors">
                        Santa Luzia - MG
                      </span>
                    </label>
                  </div>
                </div>

                {/* Metrics / Stats Plaque */}
                <div className="bg-[#edd9bf]/40 border border-[#5c3c24]/20 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#5c3c24]">Total Importado:</span>
                    <span className="font-mono font-bold text-xs bg-white/80 px-2 py-0.5 rounded border border-[#5c3c24]/20 text-[#311f14]">
                      {parseIscas(iscaInput).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-green-700">Total Filtrado:</span>
                    <span className="font-mono font-bold text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                      {getProcessedIscas().length}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2 shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={async () => {
                      const processed = getProcessedIscas();
                      if (processed.length === 0) return;
                      const text = processed.map(item => item.numero).join('\n');
                      await navigator.clipboard.writeText(text);
                      setIscaNumbersCopied(true);
                      setTimeout(() => setIscaNumbersCopied(false), 2000);
                    }}
                    disabled={!iscaInput.trim() || getProcessedIscas().length === 0}
                    className={cn(
                      "w-full py-4 font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-[0_5px_0px_#065f46,0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0px_#065f46,0_3px_5px_rgba(0,0,0,0.4)] border-2 border-[#10b981]/30 text-white",
                      (!iscaInput.trim() || getProcessedIscas().length === 0)
                        ? "bg-slate-800 text-slate-500 shadow-none border-transparent cursor-not-allowed opacity-50" 
                        : "bg-gradient-to-b from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669]"
                    )}
                  >
                    {iscaNumbersCopied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{iscaNumbersCopied ? 'Copiado para Google Planilhas!' : 'Copiar para Planilha Google'}</span>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setIscaInput('');
                    }}
                    disabled={!iscaInput.trim()}
                    className={cn(
                      "w-full py-3.5 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 rounded-xl cursor-pointer border-2 shadow-sm",
                      (!iscaInput.trim())
                        ? "bg-slate-900/10 text-slate-400 border-slate-300/30 cursor-not-allowed opacity-50" 
                        : "bg-[#fcf8f2] text-[#8c060a] border-[#8c060a]/40 hover:bg-[#ebd9c3]/30 hover:text-[#ca1a20]"
                    )}
                  >
                    <Trash2 size={14} className="stroke-[2.5]" />
                    <span>Limpar Informações</span>
                  </motion.button>
                </div>

              </div>
            </WoodenPlaque>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE PREVIEW */}
          <div className="lg:col-span-7 h-full flex flex-col min-h-[400px]">
            <WoodenPlaque className="h-full flex-1 flex flex-col" screwSize="w-2.5 h-2.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-2 border-b-2 border-[#5c3c24]/10">
                <div className="flex items-center gap-3 text-left">
                  <Database size={18} className="text-[#ca1a20]" />
                  <div>
                    <h2 className="text-sm font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">Visualização de Iscas</h2>
                    <p className="text-[9px] font-bold text-[#5c3c24]/80 uppercase tracking-widest mt-0.5">ORDEM NUMÉRICA CRESCENTE • EXCLUÍDOS: LATITUDE, LONGITUDE, TA, DB</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col bg-[#faf6f0] border-2 border-[#5c3c24]/40 rounded-2xl shadow-inner min-h-0 relative">
                {getProcessedIscas().length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Cpu className="text-[#5c3c24]/20 mb-3 animate-pulse" size={48} />
                    <p className="text-xs font-serif italic text-[#5c3c24]/60 font-medium">Nenhum dado de isca correspondente aos filtros.</p>
                    <p className="text-[10px] uppercase font-bold text-[#5c3c24]/40 tracking-wider mt-1">Cole a planilha do lado esquerdo para analisar.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto flex flex-col items-center py-6 px-4">
                    {/* Direct Copy Button for Quick Access */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        const processed = getProcessedIscas();
                        if (processed.length === 0) return;
                        const text = processed.map(item => item.numero).join('\n');
                        await navigator.clipboard.writeText(text);
                        setIscaNumbersCopied(true);
                        setTimeout(() => setIscaNumbersCopied(false), 2000);
                      }}
                      className="mb-6 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.25)] active:translate-y-0.5 border border-[#10b981]/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
                    >
                      {iscaNumbersCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{iscaNumbersCopied ? 'Números Copiados!' : 'Copiar para Planilha Google'}</span>
                    </motion.button>

                    {/* Single Column Isca Table identical to image */}
                    <div className="w-full max-w-[260px] border border-[#be938a] rounded-md overflow-hidden shadow-[0_6px_15px_rgba(0,0,0,0.1)] divide-y divide-[#be938a] bg-[#dfb3ab] shrink-0 mb-6">
                      {getProcessedIscas().map((item) => (
                        <div 
                          key={item.id} 
                          className="px-4 py-3.5 text-center text-[13px] font-black text-[#1a0a07] tracking-wider hover:bg-[#d5a49c] transition-colors select-all"
                        >
                          {item.numero}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </WoodenPlaque>
          </div>

        </div>
      ) : activeSubTab === 'coleta' ? (
        <div className="space-y-6">
          {/* Status Message Notification */}
          {ordemColetaStatusMsg && (
            <div className={cn(
              "p-4 rounded-xl border-2 flex items-center justify-between shadow-md transition-all text-xs font-bold uppercase tracking-wider",
              ordemColetaStatusMsg.type === 'success' 
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/50" 
                : "bg-red-950/90 text-red-200 border-red-500/50"
            )}>
              <div className="flex items-center gap-2">
                {ordemColetaStatusMsg.type === 'success' ? <Check size={18} /> : <X size={18} />}
                <span>{ordemColetaStatusMsg.text}</span>
              </div>
              <button onClick={() => setOrdemColetaStatusMsg(null)} className="p-1 hover:bg-white/10 rounded cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Top Wooden Plaque for Import / Controls */}
          <WoodenPlaque screwSize="w-2.5 h-2.5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b-2 border-[#5c3c24]/10">
              <div className="flex items-center gap-3">
                <FileText size={22} className="text-[#ca1a20]" />
                <div>
                  <h2 className="text-base font-black text-[#311f14] uppercase tracking-[0.2em] font-serif">
                    Controle de Ordem de Coleta
                  </h2>
                  <p className="text-[10px] font-bold text-[#5c3c24]/80 uppercase tracking-widest mt-0.5">
                    EXTRAÇÃO INTELIGENTE DE PDF • PREENCHIMENTO AUTOMÁTICO DE COLUNAS • EDICÃO E EDICÃO MANUAL DA PLANILHA
                  </p>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Copy to Google Sheets Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopyOrdemColetaForSheets(ordemColetaData, true)}
                  className="px-4 py-2.5 bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all"
                  title="Copiar todos os dados para colar no Google Sheets / Excel (Ctrl+V)"
                >
                  <FileSpreadsheet size={15} />
                  <span>Copiar p/ Planilha Google</span>
                </motion.button>

                {/* Add Manual Row */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddManualOrdemColeta}
                  className="px-4 py-2.5 bg-gradient-to-b from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-[#10b981]/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus size={14} className="stroke-[3]" />
                  <span>Adicionar Linha</span>
                </motion.button>

                {/* Clear Table Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (window.confirm("Deseja realmente apagar todas as informações acumuladas da Ordem de Coleta?")) {
                      await remove(ref(db, 'patio/ordem_coleta'));
                      setLastImportedOrdemColetaItems([]);
                      setOrdemColetaStatusMsg({ type: 'success', text: 'Todas as informações da Ordem de Coleta foram limpas!' });
                      setTimeout(() => setOrdemColetaStatusMsg(null), 3000);
                    }
                  }}
                  className="px-4 py-2.5 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-red-400/40 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                  title="Limpar todos os registros da aba Ordem de Coleta"
                >
                  <Trash2 size={15} />
                  <span>Limpar Tudo</span>
                </motion.button>
              </div>
            </div>

            {/* Upload and Search Box Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
              {/* PDF Import Zone */}
              <div className="lg:col-span-8 bg-[#faf6f0] border-2 border-dashed border-[#5c3c24]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e8d5bc] rounded-xl border border-[#5c3c24]/20 text-[#ca1a20]">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#311f14] uppercase tracking-wider block">
                      Importar PDF (Ordem de Coleta / Ordem de Serviço 3C)
                    </span>
                    <span className="text-[10px] font-bold text-[#5c3c24]/70 uppercase tracking-widest block mt-0.5">
                      Selecione o arquivo PDF para extrair os dados e preencher a planilha
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <label className="flex-1 sm:flex-none cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOrdemColetaPdfFile(file);
                          handleProcessOrdemColetaPdf(file);
                        }
                      }}
                    />
                    <div className="px-5 py-2.5 bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-[#fdefd1] font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md border border-[#ff3e47]/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      {isProcessingOrdemColeta ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      <span>{isProcessingOrdemColeta ? 'Importando...' : 'Selecionar PDF'}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Search Input Box */}
              <div className="lg:col-span-4 bg-[#faf6f0] border-2 border-[#5c3c24]/30 rounded-2xl p-4 flex flex-col justify-center shadow-inner">
                <label className="text-[9px] font-black text-[#5c3c24] uppercase tracking-widest mb-1 block">
                  Filtrar / Pesquisar Tabela:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c3c24]/50" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar por motorista, placa, transportador..."
                    value={ordemColetaSearch}
                    onChange={(e) => setOrdemColetaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#5c3c24]/30 rounded-xl text-xs font-bold text-[#311f14] placeholder:text-[#5c3c24]/40 focus:outline-none focus:border-[#ca1a20]"
                  />
                  {ordemColetaSearch && (
                    <button onClick={() => setOrdemColetaSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5c3c24]/60 hover:text-[#ca1a20]">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </WoodenPlaque>

          {/* Banner de Cópia Rápida para o Último PDF Importado */}
          {lastImportedOrdemColetaItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/90 border-2 border-emerald-500/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-800/80 rounded-xl text-emerald-200 border border-emerald-400/40 shrink-0">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-100 uppercase tracking-wider block">
                    {lastImportedOrdemColetaItems.length === 2
                      ? '⚡ PDF Importado com Sucesso! (2 Linhas Criadas - Rodotrem / Placas Carreta 1 e 2)'
                      : '⚡ PDF Importado com Sucesso! (1 Linha Criada)'}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest block mt-0.5">
                    Copie as informações abaixo e cole diretamente na sua Planilha Google (Ctrl+V)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleCopyOrdemColetaForSheets(lastImportedOrdemColetaItems, false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Copy size={16} />
                  <span>Copiar PDF Importado para Planilha Google</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Spreadsheet Table Container matching Attachment 1 */}
          <div className="w-full bg-[#1e293b]/90 border-2 border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-5 py-3 border-b border-[#334155] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <Database size={16} className="text-[#38bdf8]" />
                <span className="text-xs font-black uppercase tracking-wider">Planilha de Controle de Ordem de Coleta</span>
                <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] font-mono px-2 py-0.5 rounded-full border border-[#334155]">
                  {ordemColetaData.filter(item => {
                    if (!ordemColetaSearch.trim()) return true;
                    const s = ordemColetaSearch.toLowerCase();
                    return (
                      item.transportador?.toLowerCase().includes(s) ||
                      item.cargaLiberacao?.toLowerCase().includes(s) ||
                      item.cavalo?.toLowerCase().includes(s) ||
                      item.carreta?.toLowerCase().includes(s) ||
                      item.destino?.toLowerCase().includes(s) ||
                      item.origem?.toLowerCase().includes(s)
                    );
                  }).length} Registros
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const filtered = ordemColetaData.filter(item => {
                      if (!ordemColetaSearch.trim()) return true;
                      const s = ordemColetaSearch.toLowerCase();
                      return (
                        item.transportador?.toLowerCase().includes(s) ||
                        item.cargaLiberacao?.toLowerCase().includes(s) ||
                        item.cavalo?.toLowerCase().includes(s) ||
                        item.carreta?.toLowerCase().includes(s) ||
                        item.destino?.toLowerCase().includes(s) ||
                        item.origem?.toLowerCase().includes(s)
                      );
                    });
                    handleCopyOrdemColetaForSheets(filtered, true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-sm border border-emerald-400/30 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Copiar dados tabulados para colar na Planilha Google (Ctrl+V)"
                >
                  <FileSpreadsheet size={14} />
                  <span>Copiar Tabela para Planilha Google</span>
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Spreadsheet Table Container */}
            <div className="overflow-x-auto w-full max-h-[650px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <table className="w-full border-collapse text-center whitespace-nowrap select-text text-[11px] font-sans">
                <thead>
                  <tr className="bg-[#0c2340] text-white uppercase text-[10px] font-black tracking-wider border-b-2 border-[#1e3a8a] divide-x divide-[#1e3a8a]/50 sticky top-0 z-20 shadow-sm">
                    <th className="px-3 py-2.5">MÊS</th>
                    <th className="px-3 py-2.5">ORIGEM</th>
                    <th className="px-3 py-2.5">DIA</th>
                    <th className="px-3 py-2.5">DATA</th>
                    <th className="px-3 py-2.5">CONTATO WHATS</th>
                    <th className="px-3 py-2.5">HORA LIBERADO</th>
                    <th className="px-3 py-2.5">STATUS</th>
                    <th className="px-3 py-2.5">MODELO CARRETA</th>
                    <th className="px-3 py-2.5">MODELO CAVALO</th>
                    <th className="px-3 py-2.5">FEZ CONTATO?</th>
                    <th className="px-3 py-2.5">DESTINO</th>
                    <th className="px-3 py-2.5">TRANSPORTADOR</th>
                    <th className="px-3 py-2.5">CAVALO</th>
                    <th className="px-3 py-2.5">CARRETA</th>
                    <th className="px-3 py-2.5">CARGA / LIBERAÇÃO</th>
                    <th className="px-3 py-2.5">ESTADO MOTORISTA</th>
                    <th className="px-3 py-2.5">ESTADO CAVALO</th>
                    <th className="px-3 py-2.5">ESTADO CARRETA</th>
                    <th className="px-3 py-2.5">PENDÊNCIA</th>
                    <th className="px-3 py-2.5">CHECK LIST</th>
                    <th className="px-3 py-2.5">DIAS</th>
                    <th className="px-3 py-2.5">2ª CARRETA</th>
                    <th className="px-3 py-2.5 sticky right-0 bg-[#0c2340] z-30 shadow-left">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/60 bg-slate-900 text-slate-200 font-medium">
                  {ordemColetaData
                    .filter(item => {
                      if (!ordemColetaSearch.trim()) return true;
                      const s = ordemColetaSearch.toLowerCase();
                      return (
                        item.transportador?.toLowerCase().includes(s) ||
                        item.cargaLiberacao?.toLowerCase().includes(s) ||
                        item.cavalo?.toLowerCase().includes(s) ||
                        item.carreta?.toLowerCase().includes(s) ||
                        item.destino?.toLowerCase().includes(s) ||
                        item.origem?.toLowerCase().includes(s)
                      );
                    })
                    .map((row) => {
                      const isEditing = editingOrdemColetaId === row.id;
                      const editState = isEditing && editingOrdemColetaRow ? editingOrdemColetaRow : row;

                      return (
                        <tr key={row.id} className="hover:bg-slate-800/80 transition-colors divide-x divide-[#334155]/40 text-[11px]">
                          {/* MÊS */}
                          <td className="px-2.5 py-2 font-bold text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.mes}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, mes: e.target.value })}
                                className="w-16 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-center text-xs"
                              />
                            ) : row.mes}
                          </td>

                          {/* ORIGEM */}
                          <td className="px-2.5 py-2 font-bold text-slate-200">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.origem}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, origem: e.target.value })}
                                className="w-32 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.origem}
                          </td>

                          {/* DIA */}
                          <td className="px-2.5 py-2 text-slate-400 font-medium">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.dia}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, dia: e.target.value })}
                                className="w-24 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.dia}
                          </td>

                          {/* DATA */}
                          <td className="px-2.5 py-2 font-mono font-bold text-amber-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.data}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, data: e.target.value })}
                                className="w-24 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.data}
                          </td>

                          {/* CONTATO WHATS */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.contatoWhats}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, contatoWhats: e.target.value })}
                                className="w-20 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.contatoWhats}
                          </td>

                          {/* HORA LIBERADO */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.horaLiberado}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, horaLiberado: e.target.value })}
                                className="w-20 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.horaLiberado}
                          </td>

                          {/* STATUS */}
                          <td className="px-2.5 py-2 font-bold">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.status}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, status: e.target.value })}
                                className="w-36 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-black text-[10px] tracking-wider">
                                {row.status}
                              </span>
                            )}
                          </td>

                          {/* MODELO CARRETA */}
                          <td className="px-2.5 py-2 font-bold text-slate-300 uppercase">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.modeloCarreta}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, modeloCarreta: e.target.value })}
                                className="w-28 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.modeloCarreta}
                          </td>

                          {/* MODELO CAVALO */}
                          <td className="px-2.5 py-2 font-bold text-slate-300 uppercase">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.modeloCavalo}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, modeloCavalo: e.target.value })}
                                className="w-24 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.modeloCavalo}
                          </td>

                          {/* FEZ CONTATO? */}
                          <td className="px-2.5 py-2">
                            {isEditing ? (
                              <select
                                value={editState.fezContato}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, fezContato: e.target.value })}
                                className="bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              >
                                <option value="SIM">SIM</option>
                                <option value="NÃO">NÃO</option>
                              </select>
                            ) : (
                              <span className={cn(
                                "inline-block px-2.5 py-0.5 rounded font-black text-[10px] tracking-wider uppercase border",
                                row.fezContato === 'SIM' 
                                  ? "bg-[#c6efce] text-[#006100] border-emerald-500/20" 
                                  : "bg-[#ffc7ce] text-[#9c0006] border-red-500/20"
                              )}>
                                {row.fezContato}
                              </span>
                            )}
                          </td>

                          {/* DESTINO */}
                          <td className="px-2.5 py-2 font-black text-amber-200 uppercase">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.destino}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, destino: e.target.value })}
                                className="w-32 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.destino}
                          </td>

                          {/* TRANSPORTADOR */}
                          <td className="px-2.5 py-2 font-black text-sky-300 uppercase">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.transportador}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, transportador: e.target.value })}
                                className="w-32 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.transportador}
                          </td>

                          {/* CAVALO */}
                          <td className="px-2.5 py-2 font-mono font-black text-amber-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.cavalo}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, cavalo: e.target.value })}
                                className="w-20 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs font-mono text-center"
                              />
                            ) : (
                              <span className="bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                                {row.cavalo}
                              </span>
                            )}
                          </td>

                          {/* CARRETA */}
                          <td className="px-2.5 py-2 font-mono font-black text-amber-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.carreta}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, carreta: e.target.value })}
                                className="w-20 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs font-mono text-center"
                              />
                            ) : (
                              <span className="bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                                {row.carreta}
                              </span>
                            )}
                          </td>

                          {/* CARGA / LIBERAÇÃO */}
                          <td className="px-2.5 py-2 font-bold text-slate-100 uppercase">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.cargaLiberacao}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, cargaLiberacao: e.target.value })}
                                className="w-48 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : row.cargaLiberacao || '-'}
                          </td>

                          {/* ESTADO MOTORISTA */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.estadoMotorista}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, estadoMotorista: e.target.value })}
                                className="w-12 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.estadoMotorista}
                          </td>

                          {/* ESTADO CAVALO */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.estadoCavalo}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, estadoCavalo: e.target.value })}
                                className="w-12 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.estadoCavalo}
                          </td>

                          {/* ESTADO CARRETA */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.estadoCarreta}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, estadoCarreta: e.target.value })}
                                className="w-12 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.estadoCarreta}
                          </td>

                          {/* PENDÊNCIA */}
                          <td className="px-2.5 py-2 font-mono text-rose-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.pendencia}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, pendencia: e.target.value })}
                                className="w-24 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.pendencia || '-'}
                          </td>

                          {/* CHECK LIST */}
                          <td className="px-2.5 py-2">
                            {isEditing ? (
                              <select
                                value={editState.checkList}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, checkList: e.target.value })}
                                className="bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs"
                              >
                                <option value="OK">OK</option>
                                <option value="VENCIDO">VENCIDO</option>
                              </select>
                            ) : (
                              <span className={cn(
                                "inline-block px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase border",
                                row.checkList === 'OK' 
                                  ? "bg-[#c6efce] text-[#006100] border-emerald-500/30" 
                                  : "bg-[#fca5a5] text-[#7f1d1d] border-red-500/30"
                              )}>
                                {row.checkList}
                              </span>
                            )}
                          </td>

                          {/* DIAS */}
                          <td className="px-2.5 py-2 font-mono text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.dias}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, dias: e.target.value })}
                                className="w-16 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-center"
                              />
                            ) : row.dias}
                          </td>

                          {/* 2ª CARRETA */}
                          <td className="px-2.5 py-2 font-mono font-black text-amber-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editState.segundaCarreta}
                                onChange={(e) => setEditingOrdemColetaRow({ ...editState, segundaCarreta: e.target.value })}
                                className="w-20 bg-slate-800 text-white border border-blue-500 rounded px-1.5 py-0.5 text-xs font-mono text-center"
                              />
                            ) : row.segundaCarreta ? (
                              <span className="bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                                {row.segundaCarreta}
                              </span>
                            ) : '-'}
                          </td>

                          {/* AÇÕES */}
                          <td className="px-2.5 py-2 sticky right-0 bg-slate-900 border-l border-[#334155]">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 justify-center">
                                <button
                                  onClick={() => handleSaveEditOrdemColeta(row.id, editState)}
                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                                  title="Salvar"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrdemColetaId(null);
                                    setEditingOrdemColetaRow(null);
                                  }}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 justify-center">
                                <button
                                  onClick={() => handleCopyOrdemColetaForSheets([row], false)}
                                  className="p-1.5 bg-emerald-900/80 hover:bg-emerald-700 text-emerald-200 rounded border border-emerald-500/40 cursor-pointer"
                                  title="Copiar esta linha para colar na Planilha Google (Ctrl+V)"
                                >
                                  <FileSpreadsheet size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrdemColetaId(row.id);
                                    setEditingOrdemColetaRow({ ...row });
                                  }}
                                  className="p-1.5 bg-sky-900/60 hover:bg-sky-800 text-sky-300 rounded border border-sky-500/30 cursor-pointer"
                                  title="Editar Linha"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrdemColeta(row.id)}
                                  className="p-1.5 bg-red-900/60 hover:bg-red-800 text-red-300 rounded border border-red-500/30 cursor-pointer"
                                  title="Excluir Linha"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= PORTABLE FOOTER METAL PLATE BAR ================= */}
      <div className="w-full relative z-10 max-w-[94rem] mx-auto mt-6 shrink-0">
        <div 
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#442e1d]/95 via-[#26150b]/98 to-[#442e1d]/95 border-2 border-[#bfa27a]/50 shadow-[0_12px_25px_rgba(0,0,0,0.7),inset_0_1px_4px_rgba(255,255,255,0.15)] flex flex-col md:flex-row justify-between items-center gap-3 relative text-[9px] font-bold text-[#cfa588] select-none text-center md:text-left"
        >
          {/* Edge Anchoring screws */}
          <Screw className="absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3 hidden md:flex" />
          <Screw className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 hidden md:flex" />

          {/* Left copyright notice */}
          <span className="md:pl-8 select-none text-[#cca285]">
            © 2026 Sistema PGR • Todos os direitos reservados.
          </span>

          {/* Center message script */}
          <div className="flex flex-col items-center max-w-lg md:max-w-3xl lg:max-w-4xl text-center px-4 my-1">
            <span className="text-[7.5px] font-mono tracking-widest text-[#cca285] uppercase mb-0.5 font-bold">Princípio de Liderança: {principle.title}</span>
            <span className="font-serif italic text-[10px] md:text-[11px] tracking-wide text-[#eddabf] font-semibold leading-tight">
              "{principle.description}"
            </span>
            <div className="flex justify-center gap-1 mt-1 text-[#bfa27a]/60">
              {PRINCIPLES_OF_LEADERSHIP.map((_, idx) => {
                const isActive = idx === PRINCIPLES_OF_LEADERSHIP.indexOf(principle);
                return (
                  <span 
                    key={idx} 
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[#B32025] scale-125 shadow-[0_0_4px_#B32025]' : 'bg-[#5c3c24]'}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Right author attribution */}
          <span className="md:pr-8 text-center md:text-right select-none text-[#cca285]">
            Sistema Web • Criado por <span className="text-[#f1daaf] font-black tracking-wide">Jefferson Augusto</span>
          </span>
        </div>
      </div>

    </div>
  );
}
