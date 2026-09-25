import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Trash2,
  FileText,
  Truck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Plus,
  Edit2,
  Coffee,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DispoRow, normalizeDestino } from './Escala';
import { ApoliceItem } from './ApoliceEscala';
import { DEFAULT_TRANSPORTADORAS, findClosestTransportador } from '../data/transportadoras';

// Configuração do Worker do PDF.js (100% no navegador)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Canto angular cibernético HUD para quinas 4K
function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-4 h-4 pointer-events-none select-none z-20", className)}>
      <svg viewBox="0 0 16 16" fill="none" className="w-full h-full text-cyan-400/80 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
        <path d="M1 9V3C1 1.89543 1.89543 1 3 1H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="3" cy="3" r="1.2" fill="currentColor" />
      </svg>
    </div>
  );
}

// Placa oficial no padrão Mercosul (Brasil)
function MercosulPlate({ plate, className }: { plate: string; className?: string }) {
  if (!plate || plate === '-' || plate.trim() === '') {
    return <span className="text-stone-400 font-mono font-bold text-[10px]">-</span>;
  }
  const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[108px] h-[34px] shrink-0 rounded-[5px] shadow-[0_2px_5px_rgba(0,0,0,0.28)] border-2 border-[#1c1c1c] bg-white transition-transform hover:scale-105 cursor-default",
        className
      )}
      title={`Placa Mercosul Cavalo: ${clean}`}
    >
      {/* Faixa Azul Superior do Mercosul */}
      <div className="w-full bg-[#003399] h-[10px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5.5px] text-white font-sans font-bold tracking-tight scale-95">BR</span>
        <span className="text-[6.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          BRASIL
        </span>
        {/* Bandeira do Brasil */}
        <div className="w-[8px] h-[5.5px] bg-[#009b3a] border border-white/30 flex items-center justify-center relative rounded-[1px] overflow-hidden shrink-0">
          <div className="w-[4.5px] h-[3px] bg-[#ffdf00] rotate-45 transform flex items-center justify-center">
            <div className="w-[1.6px] h-[1.6px] bg-[#002776] rounded-full" />
          </div>
        </div>
      </div>

      {/* Caracteres em Alto Relevo Mercosul */}
      <div className="w-full flex-1 flex items-center justify-center bg-gradient-to-b from-[#ffffff] via-[#fafafa] to-[#ece8df] px-1">
        <span
          className="text-[#151515] font-black text-[13.5px] tracking-wider leading-none select-all"
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

interface ChecklistItem {
  id: string;
  cavalo: string;
  carretas?: string;
  dataTeste?: string;
  dataVencimento?: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

interface TerceirosEscalaProps {
  checklistItems?: ChecklistItem[];
  apoliceItems?: ApoliceItem[];
  transportadoras?: string[];
  getChecklistDetails?: (cavalo: string, carreta?: string) => { checkList: string; pendencia: string };
  formatPlateWithHyphen?: (plate: string) => string;
  getMonthAbbrev?: (dateStr: string) => string;
  getDayOfWeek?: (dateStr: string) => string;
}

// Helper para obter o mês atual (Ex: "SET|26")
const getCurrentMonthAbbrev = (_dateStr?: string): string => {
  const refDate = new Date();
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const mStr = months[refDate.getMonth()] || 'SET';
  const yearStr = String(refDate.getFullYear()).slice(-2);
  return `${mStr}|${yearStr}`;
};

// Helper para dia da semana
const getDayOfWeekHelper = (dateStr: string): string => {
  try {
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      return days[d.getDay()] || 'sexta-feira';
    }
  } catch {
    // fallback
  }
  return 'sexta-feira';
};

// Destinos conhecidos para correspondência inteligente
const DESTINOS_PADRAO = [
  'LONDRINA', 'RIO DE JANEIRO', 'SANTA LUZIA|MG', 'CAMPINAS', 'CURITIBA',
  'GUARULHOS', 'PORTO ALEGRE', 'RECIFE', 'SALVADOR', 'FORTALEZA', 'BRASÍLIA',
  'GOIÂNIA', 'BELÉM', 'MANAUS', 'VITÓRIA', 'FLORIANÓPOLIS', 'UBERLÂNDIA',
  'JUIZ DE FORA', 'POUSO ALEGRE', 'MONTES CLAROS', 'BETIM', 'CONTAGEM',
  'SUMARÉ', 'JUNDIAÍ', 'SÃO PAULO', 'SERRA|ES', 'DUQUE DE CAXIAS'
];

// Formatar placa com hífen (Ex: ABC-1234 ou ABC-1D23)
const formatPlate = (p?: string): string => {
  if (!p) return '';
  const clean = p.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (clean.length === 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return p.toUpperCase().trim();
};

export default function TerceirosEscala({
  apoliceItems = [],
  transportadoras = DEFAULT_TRANSPORTADORAS,
  getChecklistDetails,
  formatPlateWithHyphen = formatPlate,
  getMonthAbbrev = getCurrentMonthAbbrev,
  getDayOfWeek = getDayOfWeekHelper
}: TerceirosEscalaProps) {
  // Inicialização com persistência em localStorage para evitar perda acidental
  const [rows, setRows] = useState<DispoRow[]>(() => {
    try {
      const saved = localStorage.getItem('terceiros_escala_rows');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showUploadArea, setShowUploadArea] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTransportador, setFilterTransportador] = useState<string>('TODOS');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal de edição / adição manual
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [editingRow, setEditingRow] = useState<DispoRow | null>(null);
  const [modalForm, setModalForm] = useState({
    data: new Date().toLocaleDateString('pt-BR'),
    origem: 'SANTA LUZIA|MG',
    destino: 'LONDRINA',
    transportador: 'MOEDENSE',
    cavalo: '',
    carreta: '',
    conductor: '',
    cpf: '',
    telefone: '',
    modeloCarreta: 'BAÚ',
    modeloCavalo: 'TRUCADO',
    pallets: '28',
    ton: '28',
    categoria: 'TERCEIRO',
    status: 'AGUARDANDO CONTATO'
  });

  // Notificações Toast
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'delete' | 'info';
  }>({ show: false, message: '' });

  // Paginação da tabela
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar rows com localStorage sempre que alterar
  const saveRows = (newRowsOrUpdater: DispoRow[] | ((prev: DispoRow[]) => DispoRow[])) => {
    setRows(prev => {
      const updated = typeof newRowsOrUpdater === 'function' ? newRowsOrUpdater(prev) : newRowsOrUpdater;
      try {
        localStorage.setItem('terceiros_escala_rows', JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao salvar terceiros_escala_rows:', e);
      }
      return updated;
    });
  };

  // Extração de texto de PDF diretamente no cliente com pdfjs-dist
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  // Extração de texto de Word (.docx) diretamente no cliente com mammoth
  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  };

  // Parser de dados do documento extraído no Frontend
  const parseDocumentTextToDispoRows = (text: string): DispoRow[] => {
    const cleanText = text.replace(/\s+/g, ' ');

    // (E) "DATA" e (D) "DIA" SEMPRE com o dia/data atual em que o usuário cola/importa
    const now = new Date();
    const dataStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const daysOfWeek = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const diaStr = daysOfWeek[now.getDay()] || 'sexta-feira';
    const mesStr = getCurrentMonthAbbrev(dataStr);

    // Horário de previsão do documento
    const timeMatch = cleanText.match(/(?:HORA|HORÁRIO|PREVISÃO|PREVISAO|PREVISÃO DA CHEGADA NA FILIAL DE ORIGEM|HORARIO)[\s\:\-]+(\d{1,2}\:\d{2}(?:\:\d{2})?)/i) ||
      cleanText.match(/(\d{2}\:\d{2}(?:\:\d{2})?)/);
    const horaVal = timeMatch ? (timeMatch[1].length === 5 ? `${timeMatch[1]}:00` : timeMatch[1]) : '08:00:00';
    const horaAtual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // (H) "STATUS" SEMPRE PRECISA FICAR COM A FRASE: "AGUARDANDO CONTATO"
    const EXACT_STATUS = 'AGUARDANDO CONTATO';

    // 1. Placas (Cavalo e Carretas)
    const plateRegex = /\b([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})\b/gi;
    const foundPlates = Array.from(new Set(cleanText.match(plateRegex) || [])).map(p => formatPlateWithHyphen(p));

    const cavaloPlaca = foundPlates[0] || '';
    const carreta1Placa = foundPlates[1] || '';
    const carreta2Placa = foundPlates[2] || '';

    // 2. Documentos (CPF, CNH, RG)
    const cpfMatch = cleanText.match(/(?:CPF)[\s\:\-]+(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\b\d{11}\b)/i) ||
      cleanText.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\b\d{11}\b)/);
    const cpf = cpfMatch ? cpfMatch[1] : '';

    const cnhMatch = cleanText.match(/(?:N° DO REGISTRO CNH|REGISTRO CNH|CNH|Nº REGISTRO CNH|REGISTRO)[\s\:\-]+(\d{9,11})/i);
    const cnh = cnhMatch ? cnhMatch[1] : '';

    const rgMatch = cleanText.match(/(?:RG|IDENTIDADE|SAP)[\s\:\-]+([A-Z0-9\.\-\/\s]{5,15})/i);
    const rgSap = rgMatch ? rgMatch[1].trim() : '';

    // 3. (Y) "TELEFONE" precisa puxar informações da coluna do documento com o título "CELULAR"
    let telefone = '';
    const celMatch = cleanText.match(/(?:CELULAR|CEL|TELEFONE|TEL|WHATSAPP|FONE)[\s\:\-]+([0-9\(\)\s\-\.]{8,22})/i);
    if (celMatch && celMatch[1].trim()) {
      telefone = celMatch[1].trim();
    } else {
      const telFallback = cleanText.match(/(?:TEL|TELEFONE|CEL|CELULAR|WHATSAPP)[\s\:\-]+(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/i) ||
        cleanText.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/) ||
        cleanText.match(/\b04\s*1\s*\d{8}\b/);
      if (telFallback) {
        telefone = telFallback[0].trim();
      }
    }

    // 4. (U) "CONDUTOR" precisa puxar informações da coluna do documento com o título "NOME"
    let conductor = '';
    const nomeMatch = cleanText.match(/(?:NOME DO MOTORISTA|NOME CONDUTOR|NOME DO CONDUTOR|NOME)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{4,60}?)(?=(?:CPF|RG|CNH|VINCULO|VÍNCULO|CELULAR|ID|PERFIL|PLACA|TRANSPORTADOR|$))/i);
    if (nomeMatch && nomeMatch[1].trim()) {
      conductor = nomeMatch[1].trim().toUpperCase();
    } else {
      const driverMatch = cleanText.match(/(?:MOTORISTA|CONDUTOR)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{4,50})/i);
      if (driverMatch) {
        conductor = driverMatch[1].trim().toUpperCase();
      } else {
        const nameBeforeCpf = cleanText.match(/([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{4,60}?)\s+(?:\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\b\d{11}\b)/i);
        if (nameBeforeCpf && !/FILIAL|TRANSPORTADOR|ORDEM|SERVIÇO|CARREGAMENTO/i.test(nameBeforeCpf[1])) {
          conductor = nameBeforeCpf[1].trim().toUpperCase();
        }
      }
    }
    conductor = conductor.replace(/\b(CPF|RG|CNH|PLACA|CARRETA|CAVALO|TEL|CELULAR|VINCULO|VÍNCULO)\b.*/i, '').trim();

    // 5. (S) "CATEGORIA" precisa puxar informações da coluna do documento com o título "VINCULO MOTORISTA"
    let categoria = 'TERCEIRO';
    const vinculoMatch = cleanText.match(/(?:VINCULO MOTORISTA|VÍNCULO MOTORISTA|VINCULO DO MOTORISTA|VÍNCULO DO MOTORISTA|VINCULO|VÍNCULO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s]{3,30}?)(?=(?:RG|CPF|CNH|CELULAR|ID|PERFIL|PLACA|NOME|DATA|$))/i);
    if (vinculoMatch && vinculoMatch[1].trim()) {
      categoria = vinculoMatch[1].trim().toUpperCase();
    } else {
      const gridVinculo = cleanText.match(/\b(FROTA|TERCEIRO|AGREGADO|FROTA 3C|AUTONOMO|AUTÔNOMO)\b/i);
      if (gridVinculo) {
        categoria = gridVinculo[1].toUpperCase();
      }
    }

    // 6. Transportador
    let rawTransportadorFound = '';
    const transpMatch = cleanText.match(/(?:TRANSPORTADOR|TRANSPORTADORA|EMPRESA|TRANSP|TRANSPORTES)[\s\:\-]+([A-Z0-9\s\.\/\-\&]{3,40})/i);
    if (transpMatch) {
      rawTransportadorFound = transpMatch[1].replace(/\b(DATA|HORA|PLACA|MOTORISTA|CONDUTOR|DESTINO|CAVALO|CARRETA|CPF|CNH|RG|TEL|ORIGEM|STATUS|FILIAL)\b.*/i, '').trim();
    } else {
      rawTransportadorFound = cleanText;
    }
    const matchResult = findClosestTransportador(rawTransportadorFound, transportadoras);
    const transportador = matchResult.matchedName;

    // 7. (L) DESTINO precisa puxar informações da coluna do documento com o título "FILIAL DE DESTINO"
    let destino = 'LONDRINA';
    let rawDestino = '';
    const destMatch = cleanText.match(/(?:FILIAL DE DESTINO|FILIAL DESTINO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s\/\-\|\_]{2,40}?)(?=(?:AGENDA|AGENDA DE DESCARREGAMENTO|NOME|CPF|VINCULO|VÍNCULO|RG|PERFIL|TRANSPORTADOR|DATA|HORA|PLACA|$))/i) ||
      cleanText.match(/(?:DESTINO|CIDADE DESTINO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s\|\-]+)/i);
    if (destMatch && destMatch[1].trim()) {
      rawDestino = destMatch[1].trim();
    } else {
      // Look for standard destinations in text
      for (const d of DESTINOS_PADRAO) {
        if (new RegExp(`\\b${d.replace(/[\/\-]/g, '\\$&')}\\b`, 'i').test(cleanText)) {
          rawDestino = d;
          break;
        }
      }
    }
    if (rawDestino) {
      destino = normalizeDestino(rawDestino);
    }

    // 8. Modelos (Carreta e Cavalo)
    let modeloCarreta = 'BAÚ';
    const perfilCarretaMatch = cleanText.match(/(?:PERFIL CARRETA|PERFIL DA CARRETA|TIPO CARRETA)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{3,30})/i);
    if (perfilCarretaMatch) {
      const rawPc = perfilCarretaMatch[1].toUpperCase();
      if (rawPc.includes('RODOTREM')) {
        modeloCarreta = rawPc.includes('SIDER') ? 'RODOTREM SIDER' : 'RODOTREM BAÚ';
      } else if (rawPc.includes('SIDER')) {
        modeloCarreta = 'SIDER';
      } else if (rawPc.includes('BAU') || rawPc.includes('BAÚ')) {
        modeloCarreta = 'BAÚ';
      }
    } else {
      if (/RODOTREM/i.test(cleanText)) {
        modeloCarreta = /SIDER/i.test(cleanText) ? 'RODOTREM SIDER' : 'RODOTREM BAÚ';
      } else if (/SIDER/i.test(cleanText)) {
        modeloCarreta = 'SIDER';
      }
    }

    let modeloCavalo = 'TRUCADO';
    const perfilCavaloMatch = cleanText.match(/(?:PERFIL DO CAVALO|PERFIL CAVALO|TIPO CAVALO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s]{3,30})/i);
    if (perfilCavaloMatch) {
      const rawCav = perfilCavaloMatch[1].toUpperCase();
      if (rawCav.includes('TOCO')) modeloCavalo = 'TOCO';
      else if (rawCav.includes('TRUCADO') || rawCav.includes('6X2') || rawCav.includes('6X4')) modeloCavalo = 'TRUCADO';
    } else {
      if (/TOCO/i.test(cleanText)) modeloCavalo = 'TOCO';
      else if (/6X2|6X4|CAVALO TRUCADO/i.test(cleanText)) modeloCavalo = 'TRUCADO';
    }

    // 9. (Q) "PBT (TON)" precisa puxar informações da coluna do documento com o título "CAPACIDADE TONELADAS"
    let ton = modeloCarreta.includes('RODOTREM') ? '30' : '28';
    const tonMatch = cleanText.match(/(?:CAPACIDADE TONELADAS|CAPACIDADE TONELADA|CAPACIDADE TON|CAPACIDADE PESO)[\s\:\-]+(\d{1,3}(?:[\.,]\d{1,2})?)/i) ||
      cleanText.match(/(\d{1,3}(?:[\.,]\d{1,2})?)\s*(?:TON|TONELADAS)/i);
    if (tonMatch && tonMatch[1]) {
      ton = tonMatch[1].replace(',', '.');
    }

    // Capacidade Pallets
    const palletsMatch = cleanText.match(/(?:CAPACIDADE PALLETS|CAPACIDADE PALETS|CAPACIDADE PLT|PALLETS|PALETS)[\s\:\-]+(\d{1,3})/i) ||
      cleanText.match(/(\d{1,2})\s*(?:PALLETS|PALETS|PLT)/i);
    const pallets = palletsMatch ? palletsMatch[1] : (modeloCarreta.includes('RODOTREM') ? '30' : '28');

    // Rastreador / Tecnologia
    let tecnologia = 'SIGHRA';
    const rastrMatch = cleanText.match(/(?:RASTREADOR|TECNOLOGIA)[\s\:\-]+([A-Z0-9\s]{3,20})/i);
    if (rastrMatch && rastrMatch[1].trim()) {
      tecnologia = rastrMatch[1].trim().toUpperCase();
    }

    // 10. Checklist
    let chkDetails = { checkList: '', pendencia: '' };
    if (getChecklistDetails && cavaloPlaca) {
      chkDetails = getChecklistDetails(cavaloPlaca, carreta1Placa);
    }

    if (carreta1Placa && carreta2Placa) {
      const halfP = String(Math.round(parseInt(pallets, 10) / 2) || 15);
      const halfT = String(Math.round(parseFloat(ton) / 2) || 15);

      const row1: DispoRow = {
        id: `terceiro-${Date.now()}-1`,
        mes: mesStr,
        origem: 'SANTA LUZIA|MG',
        dia: diaStr,
        data: dataStr,
        contatoWhats: horaVal,
        horaLiberado: horaAtual,
        status: EXACT_STATUS,
        modeloCarreta,
        modeloCavalo,
        fezContato: 'SIM',
        destino: destino.toUpperCase(),
        transportador,
        cavalo: cavaloPlaca,
        carreta: carreta1Placa,
        pallets: halfP,
        ton: halfT,
        m3: '95 m³',
        categoria: categoria,
        tecnologia: tecnologia,
        conductor,
        cpf,
        rgSap,
        cnh,
        telefone,
        vigenciaCadastro: categoria === 'FROTA' ? 'FROTA' : 'TERCEIRO',
        codigoTransportadora: '100000496',
        idCarga: '',
        estadoMotorista: 'MG',
        estadoCavalo: 'MG',
        estadoCarreta: 'MG',
        pendencia: chkDetails.pendencia,
        checkList: chkDetails.checkList
      };

      const row2: DispoRow = {
        ...row1,
        id: `terceiro-${Date.now()}-2`,
        carreta: carreta2Placa,
        pallets: halfP,
        ton: halfT
      };

      return [row1, row2];
    }

    const singleRow: DispoRow = {
      id: `terceiro-${Date.now()}-1`,
      mes: mesStr,
      origem: 'SANTA LUZIA|MG',
      dia: diaStr,
      data: dataStr,
      contatoWhats: horaVal,
      horaLiberado: horaAtual,
      status: EXACT_STATUS,
      modeloCarreta,
      modeloCavalo,
      fezContato: 'SIM',
      destino: destino.toUpperCase(),
      transportador,
      cavalo: cavaloPlaca,
      carreta: carreta1Placa,
      pallets,
      ton,
      m3: '90 m³',
      categoria: categoria,
      tecnologia: tecnologia,
      conductor,
      cpf,
      rgSap,
      cnh,
      telefone,
      vigenciaCadastro: categoria === 'FROTA' ? 'FROTA' : 'TERCEIRO',
      codigoTransportadora: '100000496',
      idCarga: '',
      estadoMotorista: 'MG',
      estadoCavalo: 'MG',
      estadoCarreta: 'MG',
      pendencia: chkDetails.pendencia,
      checkList: chkDetails.checkList
    };

    return [singleRow];
  };

  // Upload e processamento de arquivos PDF ou DOCX
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc');

    if (!isPDF && !isDOCX) {
      setNotification({
        show: true,
        message: 'Por favor, selecione um arquivo no formato PDF (.pdf) ou Word (.docx).',
        type: 'info'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(`Lendo arquivo: "${file.name}"...`);
      setUploadedFileName(file.name);

      let extractedText = '';
      if (isPDF) {
        setStatusMessage('Extraindo texto do PDF no navegador...');
        extractedText = await extractTextFromPDF(file);
      } else if (isDOCX) {
        setStatusMessage('Extraindo texto do DOCX no navegador via Mammoth...');
        extractedText = await extractTextFromDOCX(file);
      }

      setStatusMessage('Estruturando dados da Ordem de Serviço...');
      const extractedRows = parseDocumentTextToDispoRows(extractedText);

      saveRows(prev => [...extractedRows, ...prev]);
      setStatusMessage('');
      setShowUploadArea(false);

      setNotification({
        show: true,
        message: `${extractedRows.length} registro(s) de Terceiro importado(s) com sucesso da OS "${file.name}"!`,
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
    } catch (error) {
      console.error('Erro ao processar arquivo no frontend:', error);
      setNotification({
        show: true,
        message: 'Ocorreu um erro ao processar o arquivo diretamente no navegador.',
        type: 'delete'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Processar texto colado diretamente
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;

    try {
      setIsProcessing(true);
      const extractedRows = parseDocumentTextToDispoRows(pastedText);

      if (extractedRows.length === 0) {
        setNotification({
          show: true,
          message: 'Não foi possível identificar registros no texto colado.',
          type: 'info'
        });
        setTimeout(() => setNotification({ show: false, message: '' }), 4000);
        return;
      }

      saveRows(prev => [...extractedRows, ...prev]);
      setPastedText('');
      setIsPasteModalOpen(false);

      setNotification({
        show: true,
        message: `${extractedRows.length} registro(s) convertido(s) e inserido(s) com sucesso!`,
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
    } catch (error) {
      console.error('Erro ao converter texto colado:', error);
      setNotification({
        show: true,
        message: 'Erro ao processar o texto colado.',
        type: 'delete'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copiar dados para a planilha (TSV limpo para colar no app ou Excel)
  const handleCopyTableToClipboard = async () => {
    if (filteredRows.length === 0) return;

    const tsvLines = filteredRows.map(r => [
      r.mes,
      r.origem,
      r.dia,
      r.data,
      r.contatoWhats,
      r.horaLiberado,
      r.status, // Garante o valor exato "AGUARDANDO CONTATO"
      r.modeloCarreta,
      r.modeloCavalo,
      r.fezContato,
      r.destino,
      r.transportador,
      r.cavalo,
      r.carreta,
      r.pallets,
      r.ton,
      r.m3,
      r.categoria,
      r.tecnologia,
      r.conductor,
      r.cpf,
      r.rgSap,
      r.cnh,
      r.telefone,
      r.vigenciaCadastro,
      r.codigoTransportadora,
      r.idCarga,
      r.estadoMotorista,
      r.estadoCavalo,
      r.estadoCarreta,
      '',
      r.pendencia || '',
      r.checkList || ''
    ].join('\t'));

    const fullTSV = tsvLines.join('\n');

    try {
      await navigator.clipboard.writeText(fullTSV);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar dados:', err);
    }
  };

  // Baixar Excel (.xlsx)
  const handleDownloadXLSX = () => {
    if (filteredRows.length === 0) return;

    const dataForSheet = filteredRows.map(r => ({
      'MÊS': r.mes,
      'ORIGEM': r.origem,
      'DIA': r.dia,
      'DATA': r.data,
      'CONTATO WHATS': r.contatoWhats,
      'HORA LIBERADO': r.horaLiberado,
      'STATUS': r.status, // "AGUARDANDO CONTATO"
      'MODELO CARRETA': r.modeloCarreta,
      'MODELO CAVALO': r.modeloCavalo,
      'FEZ CONTATO': r.fezContato,
      'DESTINO': r.destino,
      'TRANSPORTADOR': r.transportador,
      'CAVALO': r.cavalo,
      'CARRETA': r.carreta,
      'Nº PALLETS': r.pallets,
      'TON': r.ton,
      'M³': r.m3,
      'CATEGORIA': r.categoria,
      'TECNOLOGIA': r.tecnologia,
      'CONDUTOR': r.conductor,
      'CPF': r.cpf,
      'RG / SAP': r.rgSap,
      'CNH': r.cnh,
      'TELEFONE': r.telefone,
      'VIGÊNCIA DO CADASTRO': r.vigenciaCadastro,
      'CÓDIGO DA TRANSPORTADORA': r.codigoTransportadora,
      'ID DA CARGA / LACRE': r.idCarga,
      'ESTADO MOTORISTA': r.estadoMotorista,
      'ESTADO CAVALO': r.estadoCavalo,
      'ESTADO CARRETA': r.estadoCarreta,
      'PENDÊNCIA': r.pendencia,
      'CHECK LIST': r.checkList
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Terceiros');

    const fileName = `Escala_Terceiros_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Exclusão individual
  const handleDeleteRow = (id: string, cavalo?: string) => {
    saveRows(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setNotification({
      show: true,
      message: `Registro ${cavalo || ''} removido com sucesso.`,
      type: 'delete'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Exclusão em massa
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    saveRows(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    setNotification({
      show: true,
      message: `${count} registro(s) de Terceiros removido(s) com sucesso.`,
      type: 'delete'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Limpar todos os registros
  const handleClearAll = () => {
    saveRows([]);
    setSelectedIds(new Set());
    setUploadedFileName(null);
    try {
      localStorage.removeItem('terceiros_escala_rows');
    } catch {}
    setNotification({
      show: true,
      message: 'Todos os registros de Terceiros foram limpos com sucesso.',
      type: 'delete'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Carregar exemplo de Terceiro para teste rápido
  const handleLoadSample = () => {
    const todayDateStr = new Date().toLocaleDateString('pt-BR');
    const todayDia = getDayOfWeek(todayDateStr);
    const todayMes = getCurrentMonthAbbrev(todayDateStr);

    const sampleRows: DispoRow[] = [
      {
        id: `terceiro-sample-1`,
        mes: todayMes,
        origem: 'SANTA LUZIA|MG',
        dia: todayDia,
        data: todayDateStr,
        contatoWhats: '08:00:00',
        horaLiberado: '08:00:00',
        status: 'AGUARDANDO CONTATO',
        modeloCarreta: 'BAÚ',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: 'GUARULHOS',
        transportador: 'TRANSMAGNA',
        cavalo: 'SEV-5A39',
        carreta: 'TPY3G57',
        pallets: '28',
        ton: '30',
        m3: '90 m³',
        categoria: 'FROTA',
        tecnologia: 'SIGHRA',
        conductor: 'WISTOR FRANKLIN BELISARIO BRITO',
        cpf: '71323870148',
        rgSap: 'G465211T',
        cnh: '07277322482',
        telefone: '04 1 91094136',
        vigenciaCadastro: 'FROTA',
        codigoTransportadora: '1000506206',
        idCarga: '',
        estadoMotorista: 'MG',
        estadoCavalo: 'SC',
        estadoCarreta: 'SC',
        pendencia: '',
        checkList: 'VALIDO'
      },
      {
        id: `terceiro-sample-2`,
        mes: todayMes,
        origem: 'SANTA LUZIA|MG',
        dia: todayDia,
        data: todayDateStr,
        contatoWhats: '09:14:39',
        horaLiberado: '09:14:39',
        status: 'AGUARDANDO CONTATO',
        modeloCarreta: 'RODOTREM SIDER',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: 'LONDRINA',
        transportador: 'MOEDENSE',
        cavalo: 'QWK-6A22',
        carreta: 'OLN7307',
        pallets: '15',
        ton: '15',
        m3: '87 m³',
        categoria: 'TERCEIRO',
        tecnologia: 'SIGHRA',
        conductor: 'ROBSON LUIS VIEIRA',
        cpf: '051.848.966-09',
        rgSap: 'MG10309990',
        cnh: '06451999242',
        telefone: '31 99935-0970',
        vigenciaCadastro: 'TERCEIRO',
        codigoTransportadora: '1000587291',
        idCarga: '',
        estadoMotorista: 'MG',
        estadoCavalo: 'MG',
        estadoCarreta: 'MG',
        pendencia: '',
        checkList: 'VALIDO'
      }
    ];

    saveRows(prev => [...sampleRows, ...prev]);
    setNotification({
      show: true,
      message: 'Exemplo de registros carregado com sucesso!',
      type: 'success'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Abrir Modal de Adição Manual
  const handleOpenAddModal = () => {
    setEditingRow(null);
    setModalForm({
      data: new Date().toLocaleDateString('pt-BR'),
      origem: 'SANTA LUZIA|MG',
      destino: 'LONDRINA',
      transportador: transportadoras[0] || 'MOEDENSE',
      cavalo: '',
      carreta: '',
      conductor: '',
      cpf: '',
      telefone: '',
      modeloCarreta: 'BAÚ',
      modeloCavalo: 'TRUCADO',
      pallets: '28',
      ton: '28',
      categoria: 'TERCEIRO',
      status: 'AGUARDANDO CONTATO'
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (row: DispoRow) => {
    setEditingRow(row);
    setModalForm({
      data: row.data || new Date().toLocaleDateString('pt-BR'),
      origem: row.origem || 'SANTA LUZIA|MG',
      destino: row.destino || 'LONDRINA',
      transportador: row.transportador || 'MOEDENSE',
      cavalo: row.cavalo || '',
      carreta: row.carreta || '',
      conductor: row.conductor || '',
      cpf: row.cpf || '',
      telefone: row.telefone || '',
      modeloCarreta: row.modeloCarreta || 'BAÚ',
      modeloCavalo: row.modeloCavalo || 'TRUCADO',
      pallets: row.pallets || '28',
      ton: row.ton || '28',
      categoria: row.categoria || 'TERCEIRO',
      status: row.status || 'AGUARDANDO CONTATO'
    });
    setIsModalOpen(true);
  };

  // Salvar registro manual ou editado
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.cavalo.trim()) {
      alert('Informe a placa do Cavalo.');
      return;
    }

    const cleanCav = modalForm.cavalo.trim().toUpperCase();
    const cleanCar = modalForm.carreta.trim().toUpperCase();
    const rowDate = modalForm.data || new Date().toLocaleDateString('pt-BR');

    if (editingRow) {
      saveRows(prev =>
        prev.map(r =>
          r.id === editingRow.id
            ? {
                ...r,
                data: rowDate,
                mes: getCurrentMonthAbbrev(rowDate),
                dia: getDayOfWeek(rowDate),
                origem: modalForm.origem.toUpperCase(),
                destino: modalForm.destino.toUpperCase(),
                transportador: modalForm.transportador.toUpperCase(),
                cavalo: cleanCav,
                carreta: cleanCar,
                conductor: modalForm.conductor.toUpperCase(),
                cpf: modalForm.cpf,
                telefone: modalForm.telefone,
                modeloCarreta: modalForm.modeloCarreta,
                modeloCavalo: modalForm.modeloCavalo,
                pallets: modalForm.pallets,
                ton: modalForm.ton,
                categoria: modalForm.categoria,
                status: 'AGUARDANDO CONTATO'
              }
            : r
        )
      );
      setNotification({
        show: true,
        message: `Registro ${cleanCav} atualizado com sucesso!`,
        type: 'success'
      });
    } else {
      const newRow: DispoRow = {
        id: `terceiro-manual-${Date.now()}`,
        mes: getCurrentMonthAbbrev(rowDate),
        origem: modalForm.origem.toUpperCase(),
        dia: getDayOfWeek(rowDate),
        data: rowDate,
        contatoWhats: '08:00:00',
        horaLiberado: new Date().toLocaleTimeString('pt-BR'),
        status: 'AGUARDANDO CONTATO',
        modeloCarreta: modalForm.modeloCarreta,
        modeloCavalo: modalForm.modeloCavalo,
        fezContato: 'SIM',
        destino: modalForm.destino.toUpperCase(),
        transportador: modalForm.transportador.toUpperCase(),
        cavalo: cleanCav,
        carreta: cleanCar,
        pallets: modalForm.pallets,
        ton: modalForm.ton,
        m3: '90 m³',
        categoria: modalForm.categoria || 'TERCEIRO',
        tecnologia: 'SIGHRA',
        conductor: modalForm.conductor.toUpperCase(),
        cpf: modalForm.cpf,
        rgSap: '',
        cnh: '',
        telefone: modalForm.telefone,
        vigenciaCadastro: modalForm.categoria === 'FROTA' ? 'FROTA' : 'TERCEIRO',
        codigoTransportadora: '100000496',
        idCarga: '',
        estadoMotorista: 'MG',
        estadoCavalo: 'MG',
        estadoCarreta: 'MG',
        pendencia: '',
        checkList: 'VALIDO'
      };

      saveRows(prev => [newRow, ...prev]);
      setNotification({
        show: true,
        message: `Novo registro de terceiro ${cleanCav} cadastrado com sucesso!`,
        type: 'success'
      });
    }

    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
    setIsModalOpen(false);
    setEditingRow(null);
  };

  // Selecionar Linha
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selecionar Todas
  const handleSelectAll = () => {
    if (selectedIds.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map(r => r.id)));
    }
  };

  // Filtros
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        r.cavalo.toLowerCase().includes(term) ||
        (r.carreta && r.carreta.toLowerCase().includes(term)) ||
        (r.conductor && r.conductor.toLowerCase().includes(term)) ||
        r.transportador.toLowerCase().includes(term) ||
        r.destino.toLowerCase().includes(term) ||
        (r.cpf && r.cpf.includes(term)) ||
        (r.telefone && r.telefone.includes(term));

      const matchTransp =
        filterTransportador === 'TODOS' ||
        r.transportador.toUpperCase() === filterTransportador.toUpperCase();

      return matchSearch && matchTransp;
    });
  }, [rows, searchTerm, filterTransportador]);

  // Lista de transportadores presentes nos dados
  const availableTransportadores = useMemo(() => {
    const setT = new Set<string>();
    rows.forEach(r => {
      if (r.transportador) setT.add(r.transportador.toUpperCase());
    });
    return Array.from(setT).sort();
  }, [rows]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTransportador]);

  return (
    <div className="w-full relative z-10 max-w-full mx-auto flex flex-col font-sans">
      
      {/* Toast Notifications */}
      {copiedStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2e7d32] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wider animate-bounce border border-white/20">
          <Check size={18} />
          <span>Dados dos Terceiros copiados para colar no App ou Excel!</span>
        </div>
      )}

      {notification.show && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black tracking-wide border transition-all animate-in fade-in slide-in-from-bottom-4",
            notification.type === 'delete'
              ? "bg-[#4a1215] border-red-500/50 text-red-100 shadow-[0_0_25px_rgba(179,32,37,0.5)]"
              : "bg-[#18331e] border-emerald-500/50 text-emerald-100 shadow-[0_0_25px_rgba(46,125,50,0.5)]"
          )}
        >
          {notification.type === 'delete' ? (
            <Trash2 size={18} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main 4K Cyber HUD Panel */}
      <div className="glass-card-3d border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 space-y-6 text-white">
        {/* Decorative corner accents */}
        <TechCorner className="absolute top-3 left-3" />
        <TechCorner className="absolute top-3 right-3 rotate-90" />
        <TechCorner className="absolute bottom-3 left-3 -rotate-90" />
        <TechCorner className="absolute bottom-3 right-3 rotate-180" />

        {/* Top Area: Splitted into Left (Holo Emblem Badge) and Right (Banner + Header + HUD Tag) */}
        <div className="flex flex-col md:flex-row gap-5 items-stretch relative z-10">
          
          {/* Left Col: Cyber Emblem Card */}
          <div className="w-full md:w-[26%] md:min-w-[210px] md:max-w-[240px] rounded-2xl relative group border border-white/15 overflow-hidden shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center">
            {/* Holographic inner border */}
            <div className="absolute inset-1.5 rounded-xl border border-cyan-500/20 pointer-events-none" />
            
            {/* Logo Emblem with 3D Cyan Pulse */}
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <FileText size={28} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <div className="absolute inset-1 border border-dashed border-cyan-400/50 rounded-xl" />
            </div>

            <span className="text-white font-heading font-black text-xs uppercase tracking-widest leading-tight">
              Ordem de Serviço
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold mt-0.5 tracking-wider uppercase">
              Terceiros & Agregados
            </span>

            <div className="mt-3 bg-cyan-950/80 border border-cyan-500/40 rounded-lg px-2.5 py-1 text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              PDF • DOCX • NAVEGADOR
            </div>
          </div>

          {/* Right Col: 4K Logistics Banner + Header + HUD Tag */}
          <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
            
            {/* 4K Aesthetic Logistics Banner */}
            <div className="w-full h-24 md:h-28 rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative group hidden sm:block">
              <img 
                src="/images/banner_coffee.jpg"
                alt="Logistics Banner"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 contrast-[1.15] brightness-90 relative z-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none z-10" />
              <div className="absolute inset-0 border border-white/10 pointer-events-none z-10" />
              <div className="absolute bottom-2.5 left-4 z-20 flex items-center gap-2">
                <span className="bg-[#B32025] text-white text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded shadow-[0_0_10px_rgba(179,32,37,0.5)] border border-red-500/40">
                  LOGÍSTICA & DISTRIBUIÇÃO 4K
                </span>
                <span className="text-cyan-300 font-mono text-[10px] font-semibold drop-shadow-md">
                  Terminal Santa Luzia / MG — Brasil
                </span>
              </div>
            </div>

            {/* Inspirational Quote / HUD Subtitle */}
            <p className="w-full text-slate-300 font-mono text-xs sm:text-xs text-center leading-snug px-2 italic">
              "Transforme dados brutos em decisões operacionais ágeis. Gestão de pátio em tempo real com precisão absoluta."
            </p>

            {/* Bottom Row: Titles & Cyber HUD Tag */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              {/* Title and category */}
              <div className="pb-1">
                <span className="text-cyan-400 font-mono font-bold text-[11px] tracking-widest uppercase block mb-1">
                  Módulo de Extração Inteligente // Terceiros
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading uppercase tracking-tight">
                  TERCEIROS: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500 drop-shadow-[0_0_15px_rgba(255,42,75,0.4)]">{rows.length} ORDENS IMPORTADAS</span>
                </h1>
              </div>

              {/* Cyber Telemetry Status Tag */}
              <div className="hidden lg:flex bg-slate-950/90 border border-white/15 rounded-2xl p-3 px-5 items-center justify-center gap-3.5 shadow-[0_0_20px_rgba(0,0,0,0.6)] relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-white text-xs font-black uppercase tracking-wider">HUD OPERACIONAL</span>
                  <span className="font-mono text-cyan-400 text-[10px] font-bold">100% Client-Side Engine</span>
                  <div className="flex gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              className="hidden"
              id="terceiros-pdf-docx-input"
            />

            {/* Botão Importar PDF / DOCX */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-gradient-to-r from-[#ff2a4b] to-[#b32025] hover:brightness-110 text-white text-xs font-mono font-black uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-[0_0_15px_rgba(255,42,75,0.4)] transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-red-500/40 disabled:opacity-50"
            >
              <Upload size={14} className="stroke-[2.5]" />
              <span>{isProcessing ? 'Processando...' : 'Importar PDF / DOCX'}</span>
            </button>

            {/* Botão Colar Texto / Ordem de Serviço */}
            <button
              type="button"
              onClick={() => setIsPasteModalOpen(true)}
              disabled={isProcessing}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 hover:border-cyan-400/50"
              title="Colar texto extraído da Ordem de Serviço ou planilha"
            >
              <FileText size={14} className="text-cyan-400" />
              <span>Colar Texto / OS</span>
            </button>

            {/* Botão Novo Registro Manual */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 hover:border-cyan-400/50"
            >
              <Plus size={14} className="text-cyan-400" />
              <span>Novo Registro</span>
            </button>

            {/* Carregar Exemplo */}
            <button
              type="button"
              onClick={handleLoadSample}
              className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
              title="Carregar exemplo de Ordem de Serviço"
            >
              <FileSpreadsheet size={14} className="text-amber-400" />
              <span>Exemplo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Baixar XLSX */}
            {filteredRows.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadXLSX}
                className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                title="Exportar para arquivo Microsoft Excel (.xlsx)"
              >
                <Download size={14} />
                <span>Excel (.xlsx)</span>
              </button>
            )}

            {/* Copiar Dados para Planilha */}
            <button
              type="button"
              onClick={handleCopyTableToClipboard}
              disabled={filteredRows.length === 0}
              className={cn(
                "text-xs font-mono font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border disabled:opacity-40",
                copiedStatus
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              )}
              title="Copiar linhas formatadas sem cabeçalho para colar na planilha do app"
            >
              {copiedStatus ? <Check size={15} className="stroke-[3]" /> : <Copy size={15} />}
              <span>{copiedStatus ? 'Copiado c/ Sucesso!' : 'Copiar p/ Planilha'}</span>
            </button>

            {/* Limpar Tudo */}
            {rows.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="bg-white/5 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-97"
                title="Limpar todos os registros importados"
              >
                <Trash2 size={14} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Processing Status Banner */}
        {isProcessing && (
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-3 text-xs font-mono font-bold text-cyan-300 animate-pulse relative z-10">
            <RefreshCw size={18} className="animate-spin text-cyan-400 shrink-0" />
            <span>{statusMessage || 'Processando arquivo diretamente no seu navegador...'}</span>
          </div>
        )}

        {/* Upload Dropzone Box (Cyber HUD) */}
        {showUploadArea && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-3xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-950/80 hover:bg-slate-950 p-6 sm:p-8 text-center cursor-pointer transition-all shadow-[0_0_30px_rgba(6,182,212,0.1)] group relative z-10"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowUploadArea(false); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Upload size={24} />
            </div>
            <h3 className="text-sm font-heading font-black text-white uppercase tracking-wide">
              Clique aqui para selecionar a Ordem de Serviço
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Suporta documentos em formato <strong className="text-cyan-300">PDF (.pdf)</strong> ou <strong className="text-cyan-300">Microsoft Word (.docx)</strong>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-cyan-300 px-2.5 py-1 rounded-md">
                Status Automático: REALIZAR IMPRESSÃO
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-md">
                Origem Padrão: SANTA LUZIA|MG
              </span>
            </div>
          </div>
        )}

          {/* Active File Banner */}
          {uploadedFileName && !isProcessing && (
            <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300 relative z-10 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                <span>
                  Último arquivo processado: <strong className="text-white">{uploadedFileName}</strong> ({rows.length} registros extraídos)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold px-2 py-0.5 rounded shadow-2xs">
                Pronto para cópia
              </span>
            </div>
          )}

          {/* 4K Cyber Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/80 shadow-2xl relative z-10 backdrop-blur-md">
            <div className="overflow-x-auto max-h-[640px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                {/* Header in obsidian glass with cyan neon lettering */}
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-950 text-cyan-400 border-b border-white/10">
                    <th className="py-3 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredRows.length && filteredRows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-white/20 text-[#B32025] focus:ring-0 cursor-pointer accent-[#B32025]"
                      />
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Cavalo (Mercosul)
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Carreta
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Transportador
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Motorista / Condutor
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Destino
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300 text-center">
                      Status
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Modelo
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Data / Hora
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                      Telefone
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-cyan-300 text-right pr-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-white/5 bg-slate-900/60 font-mono">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <FileSpreadsheet size={40} className="text-cyan-400/50" />
                          <p className="font-bold text-white text-sm">
                            Nenhum registro de Terceiro importado até o momento
                          </p>
                          <p className="text-xs text-slate-400 max-w-md">
                            Clique em <strong className="text-cyan-300">"Importar PDF / DOCX"</strong> acima para carregar a Ordem de Serviço ou clique em <strong className="text-cyan-300">"Carregar Exemplo"</strong> para testar a conversão.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => {
                      const isSelected = selectedIds.has(row.id);

                      return (
                        <tr
                          key={row.id || index}
                          className={cn(
                            "transition-colors group",
                            isSelected
                              ? "bg-cyan-950/60 border-y border-cyan-500/30"
                              : "hover:bg-white/5"
                          )}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-2.5 px-3 text-center align-middle">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(row.id)}
                              className="rounded border-white/20 text-[#B32025] focus:ring-0 cursor-pointer accent-[#B32025]"
                            />
                          </td>

                          {/* Cavalo License Plate in Mercosul Format */}
                          <td className="py-2 px-3 align-middle">
                            <MercosulPlate plate={row.cavalo} />
                          </td>

                          {/* Carreta */}
                          <td className="py-2 px-3 font-mono font-bold text-amber-300 align-middle">
                            {row.carreta ? (
                              <span className="bg-white/5 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-xs">
                                {row.carreta}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Transportador Editable Select */}
                          <td className="py-2 px-3 font-bold text-slate-200 text-[10px] uppercase tracking-wider align-middle">
                            <div className="flex items-center gap-1.5">
                              <Truck size={14} className="text-cyan-400 shrink-0" />
                              <select
                                value={row.transportador}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  saveRows(prev =>
                                    prev.map(r => (r.id === row.id ? { ...r, transportador: val } : r))
                                  );
                                }}
                                className="bg-slate-900 border border-white/20 text-white rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[160px] shadow-inner uppercase"
                                title="Transportador associado (Clique para alterar)"
                              >
                                {transportadoras.map(t => (
                                  <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Motorista */}
                          <td className="py-2 px-3 font-bold text-white text-[10px] uppercase tracking-wider max-w-[200px] truncate align-middle" title={row.conductor}>
                            {row.conductor ? (
                              <div className="flex items-center gap-1.5">
                                <User size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate">{row.conductor}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Destino */}
                          <td className="py-2 px-3 font-mono font-bold text-red-400 text-[10px] uppercase tracking-wider align-middle">
                            {row.destino}
                          </td>

                          {/* Status Rigoroso */}
                          <td className="py-2 px-3 text-center align-middle">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border inline-block shadow-xs bg-emerald-950/80 text-emerald-300 border-emerald-500/40 whitespace-nowrap">
                              {row.status}
                            </span>
                          </td>

                          {/* Modelo */}
                          <td className="py-2 px-3 font-mono font-bold text-slate-300 text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            {row.modeloCarreta}
                          </td>

                          {/* Data e Hora */}
                          <td className="py-2 px-3 font-mono font-bold text-slate-300 text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            <span>{row.data}</span>
                            {row.contatoWhats && (
                              <span className="text-slate-400 text-[9px] block">
                                {row.contatoWhats}
                              </span>
                            )}
                          </td>

                          {/* Telefone */}
                          <td className="py-2 px-3 font-mono font-bold text-slate-300 text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            {row.telefone || '-'}
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3 text-right pr-4 align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(row)}
                                className="p-1.5 text-slate-400 hover:text-cyan-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Editar registro"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id, row.cavalo)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Remover registro de terceiro"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-t border-white/10 text-xs font-mono font-bold text-slate-300">
                <span>
                  Página {currentPage} de {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 cursor-pointer hover:bg-white/10"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span className="px-2 py-1 font-mono text-[11px] text-cyan-400">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 cursor-pointer hover:bg-white/10"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      {/* Modal: Adicionar / Editar Registro Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-950 border border-white/20 shadow-2xl relative overflow-hidden flex flex-col p-6 text-white">
            <TechCorner className="absolute top-3 left-3" />
            <TechCorner className="absolute top-3 right-3 rotate-90" />
            <TechCorner className="absolute bottom-3 left-3 -rotate-90" />
            <TechCorner className="absolute bottom-3 right-3 rotate-180" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,42,75,0.3)]">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white uppercase tracking-wide">
                    {editingRow ? 'Editar Registro de Terceiro' : 'Novo Registro de Terceiro'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Status fixo padronizado: AGUARDANDO CONTATO
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs font-mono font-bold text-white">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Placa Cavalo *
                    </label>
                    {modalForm.cavalo.trim() && (
                      <span className="text-[9px] text-cyan-400 font-black uppercase tracking-wider">
                        Mercosul
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={modalForm.cavalo}
                      onChange={(e) => setModalForm({ ...modalForm, cavalo: e.target.value })}
                      placeholder="Ex: QWK-6A22"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-white/20 rounded-xl font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase shadow-inner text-xs font-bold"
                    />
                    {modalForm.cavalo.trim() && (
                      <MercosulPlate plate={modalForm.cavalo} className="scale-90 origin-right" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Placa Carreta
                  </label>
                  <input
                    type="text"
                    value={modalForm.carreta}
                    onChange={(e) => setModalForm({ ...modalForm, carreta: e.target.value })}
                    placeholder="Ex: OLN7307"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase shadow-inner text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Transportador
                  </label>
                  <select
                    value={modalForm.transportador}
                    onChange={(e) => setModalForm({ ...modalForm, transportador: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold cursor-pointer uppercase"
                  >
                    {transportadoras.map(t => (
                      <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Destino (Filial de Destino)
                  </label>
                  <input
                    type="text"
                    value={modalForm.destino}
                    onChange={(e) => setModalForm({ ...modalForm, destino: e.target.value })}
                    placeholder="Ex: LONDRINA"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase shadow-inner text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Motorista / Condutor (Nome)
                  </label>
                  <input
                    type="text"
                    value={modalForm.conductor}
                    onChange={(e) => setModalForm({ ...modalForm, conductor: e.target.value })}
                    placeholder="Nome completo do motorista"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase shadow-inner text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Telefone (Celular)
                  </label>
                  <input
                    type="text"
                    value={modalForm.telefone}
                    onChange={(e) => setModalForm({ ...modalForm, telefone: e.target.value })}
                    placeholder="Ex: 31 99999-9999"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Categoria (Vínculo)
                  </label>
                  <select
                    value={modalForm.categoria || 'TERCEIRO'}
                    onChange={(e) => setModalForm({ ...modalForm, categoria: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-900 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold cursor-pointer font-mono"
                  >
                    <option value="TERCEIRO">TERCEIRO</option>
                    <option value="FROTA">FROTA</option>
                    <option value="AGREGADO">AGREGADO</option>
                    <option value="DEDICADO">DEDICADO</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Modelo Carreta
                  </label>
                  <select
                    value={modalForm.modeloCarreta}
                    onChange={(e) => setModalForm({ ...modalForm, modeloCarreta: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-900 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold cursor-pointer font-mono"
                  >
                    <option value="BAÚ">BAÚ</option>
                    <option value="SIDER">SIDER</option>
                    <option value="RODOTREM BAÚ">RODOTREM BAÚ</option>
                    <option value="RODOTREM SIDER">RODOTREM SIDER</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Data (Dia Atual)
                  </label>
                  <input
                    type="text"
                    value={modalForm.data}
                    onChange={(e) => setModalForm({ ...modalForm, data: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-2 py-2 bg-slate-900 border border-white/20 rounded-xl font-mono text-white focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">
                    Capacidade / Ton
                  </label>
                  <input
                    type="text"
                    value={modalForm.ton || modalForm.pallets}
                    onChange={(e) => setModalForm({ ...modalForm, ton: e.target.value, pallets: e.target.value })}
                    placeholder="Ex: 30"
                    className="w-full px-2 py-2 bg-slate-900 border border-white/20 rounded-xl font-mono text-white focus:outline-none focus:border-cyan-400 shadow-inner text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#ff2a4b] to-[#b32025] hover:brightness-110 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,42,75,0.4)] transition-all cursor-pointer border border-red-500/40"
                >
                  {editingRow ? 'Salvar Alterações' : 'Cadastrar Terceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Colar Texto / Ordem de Serviço */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col p-6 text-white">
            <TechCorner className="absolute top-3 left-3" />
            <TechCorner className="absolute top-3 right-3 rotate-90" />
            <TechCorner className="absolute bottom-3 left-3 -rotate-90" />
            <TechCorner className="absolute bottom-3 right-3 rotate-180" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white uppercase tracking-wide">
                    Colar Texto da Ordem de Serviço
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Reconhecimento automático: Filial de Destino, Vínculo Motorista, Nome, Capacidade Toneladas, Celular, etc.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Cole aqui o texto copiado do documento PDF, Word ou tabela de Ordem de Serviço..."
                rows={9}
                className="w-full p-3.5 bg-slate-900 border border-white/20 focus:border-cyan-400 rounded-2xl font-mono text-xs text-white placeholder-slate-500 shadow-inner resize-none focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setPastedText(''); setIsPasteModalOpen(false); }}
                  className="px-4 py-2 bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  disabled={!pastedText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-[#ff2a4b] to-[#b32025] hover:brightness-110 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,42,75,0.4)] transition-all cursor-pointer border border-red-500/40 disabled:opacity-40"
                >
                  Converter & Inserir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
