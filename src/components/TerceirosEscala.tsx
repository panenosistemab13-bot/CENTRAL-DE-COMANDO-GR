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

// Parafuso de latão/bronze decorativo para as quinas da prancheta
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

// Formatar placa com hífen (Ex: ABC-1234 ou ABC-1D23)
const formatPlate = (p?: string): string => {
  if (!p) return '';
  const clean = p.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (clean.length === 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return p.toUpperCase().trim();
};

// Formatar placa SEM hífen para cópia na planilha (Ex: SEV-5A39 -> SEV5A39, POG-7735 -> POG7735)
export const formatPlateWithoutHyphen = (p?: string): string => {
  if (!p) return '';
  return p.replace(/-/g, '').replace(/[^A-Z0-9\/\s]/gi, '').trim().toUpperCase();
};

// Interface do Documento 3C
export interface Documento3C {
  transportador: string;
  dataCarregamento: string;
  horarioCarregamento: string;
  origem: string;
  ufOrigem: string;
  destino: string;
  ufDestino: string;
  motorista: string;
  cpf: string;
  rg: string;
  registroCnh: string;
  id3c: string;
  cargo: string;
  perfilCavalo: string;
  perfilCarreta: string;
  capacidadePallets: string;
  capacidadeToneladas: string;
  placaCavalo: string;
  ufPlacaCavalo: string;
  placaCarreta1: string;
  ufPlacaCarreta1: string;
  placaCarreta2: string;
  ufPlacaCarreta2: string;
  rastreador: string;
  quantidadeEixos: string;
  comprimentoCarreta: string;
  larguraCarreta: string;
  alturaCarreta: string;
  vinculo: string;
  celular: string;
}

// Normalizador de texto para comparação segura sem acentos
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
};

// Mapa de sinônimos/aliases para cada campo da Ordem de Serviço 3C
export const FIELD_MAP: Record<keyof Documento3C, string[]> = {
  transportador: ['TRANSPORTADOR', 'TRANSPORTADORA', 'EMPRESA', 'TRANSP', 'TRANSPORTES'],
  dataCarregamento: ['DATA DE CARREGAMENTO', 'DATA CARREGAMENTO', 'DATA DO CARREGAMENTO', 'DATA'],
  horarioCarregamento: [
    'PREVISAO DA CHEGADA NA FILIAL DE ORIGEM (HORARIO)',
    'PREVISAO DA CHEGADA NA FILIAL DE ORIGEM',
    'PREVISÃO DA CHEGADA NA FILIAL DE ORIGEM (HORÁRIO)',
    'PREVISÃO DA CHEGADA NA FILIAL DE ORIGEM',
    'PREVISAO DA CHEGADA',
    'PREVISÃO DA CHEGADA',
    'HORARIO',
    'HORÁRIO',
    'HORA'
  ],
  origem: ['FILIAL DE ORIGEM', 'FILIAL ORIGEM', 'ORIGEM', 'CIDADE ORIGEM', 'UNIDADE ORIGEM'],
  ufOrigem: ['UF ORIGEM', 'UF FILIAL ORIGEM', 'ESTADO ORIGEM', 'UF'],
  destino: ['FILIAL DE DESTINO', 'FILIAL DESTINO', 'DESTINO', 'CIDADE DESTINO', 'UNIDADE DESTINO'],
  ufDestino: ['UF DESTINO', 'UF FILIAL DESTINO', 'ESTADO DESTINO'],
  motorista: ['NOME', 'NOME DO MOTORISTA', 'MOTORISTA', 'CONDUTOR', 'NOME COMPLETO'],
  cpf: ['CPF', 'CPF DO MOTORISTA'],
  rg: ['RG', 'IDENTIDADE', 'RG SAP', 'SAP'],
  registroCnh: ['N° DO REGISTRO CNH', 'N° DO REGISTRO', 'N DO REGISTRO CNH', 'NUMERO REGISTRO CNH', 'REGISTRO CNH', 'CNH', 'REGISTRO'],
  id3c: ['ID 3 CARGO', 'ID 3C', 'ID CARGO', 'ID DA CARGA', 'ID CARGA'],
  cargo: ['CARGO', 'FUNCAO', 'FUNÇÃO'],
  perfilCavalo: ['PERFIL DO CAVALO', 'PERFIL CAVALO', 'TIPO CAVALO', 'MODELO CAVALO'],
  perfilCarreta: ['PERFIL CARRETA', 'PERFIL DA CARRETA', 'TIPO CARRETA', 'MODELO CARRETA'],
  capacidadePallets: ['CAPACIDADE PALLETS', 'CAPACIDADE PALLET', 'PALLETS', 'PALETS', 'CAPACIDADE'],
  capacidadeToneladas: ['CAPACIDADE TONELADAS', 'CAPACIDADE TONELADA', 'TONELADAS', 'TON', 'PESO'],
  placaCavalo: ['PLACA CAVALO', 'PLACA DO CAVALO', 'CAVALO'],
  ufPlacaCavalo: ['UF PLACA CAVALO', 'UF CAVALO'],
  placaCarreta1: ['PLACA CARRETA 1', 'PLACA DA CARRETA 1', 'PLACA CARRETA', 'CARRETA 1', 'CARRETA'],
  ufPlacaCarreta1: ['UF PLACA CARRETA 1', 'UF CARRETA 1', 'UF CARRETA'],
  placaCarreta2: ['PLACA CARRETA 2', 'PLACA DA CARRETA 2', 'CARRETA 2'],
  ufPlacaCarreta2: ['UF PLACA CARRETA 2', 'UF CARRETA 2'],
  rastreador: ['RASTREADOR', 'TECNOLOGIA', 'SISTEMA RASTREADOR'],
  quantidadeEixos: ['QUANT DE EIXOS (CAVALO + CARRETA)', 'QUANT DE EIXOS', 'QUANTIDADE DE EIXOS', 'EIXOS'],
  comprimentoCarreta: ['COMPRIMENTO CARRETA', 'COMPRIMENTO'],
  larguraCarreta: ['LARGURA CARRETA', 'LARGURA'],
  alturaCarreta: ['ALTURA CARRETA', 'ALTURA'],
  vinculo: ['VINCULO MOTORISTA', 'VÍNCULO MOTORISTA', 'VINCULO', 'VÍNCULO'],
  celular: ['CELULAR', 'TELEFONE', 'TEL', 'WHATSAPP', 'FONE']
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
    status: 'REALIZAR IMPRESSÃO'
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

  // Helper de formatação estrita de data DD/MM/YYYY
  const formatDateStrict = (rawDate: string): string => {
    if (!rawDate) return '';
    const clean = rawDate.replace(/\./g, '/').trim();
    const match = clean.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      let year = match[3];
      if (year.length === 2) year = `20${year}`;
      return `${day}/${month}/${year}`;
    }
    return rawDate;
  };

  // Helper de formatação estrita de horário HH:MM
  const formatTimeStrict = (rawTime: string): string => {
    if (!rawTime) return '08:00';
    const match = rawTime.match(/\b(\d{1,2}):(\d{2})\b/);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      return `${hours}:${minutes}`;
    }
    return rawTime.trim();
  };

  // Parser semântico estruturado para Ordem de Serviço 3C
  const parse3CDocument = (rawText: string): Documento3C => {
    const doc: Documento3C = {
      transportador: '',
      dataCarregamento: '',
      horarioCarregamento: '',
      origem: '',
      ufOrigem: '',
      destino: '',
      ufDestino: '',
      motorista: '',
      cpf: '',
      rg: '',
      registroCnh: '',
      id3c: '',
      cargo: '',
      perfilCavalo: '',
      perfilCarreta: '',
      capacidadePallets: '',
      capacidadeToneladas: '',
      placaCavalo: '',
      ufPlacaCavalo: '',
      placaCarreta1: '',
      ufPlacaCarreta1: '',
      placaCarreta2: '',
      ufPlacaCarreta2: '',
      rastreador: '',
      quantidadeEixos: '',
      comprimentoCarreta: '',
      larguraCarreta: '',
      alturaCarreta: '',
      vinculo: '',
      celular: ''
    };

    const cleanOneLine = rawText.replace(/\s+/g, ' ').trim();

    // 1. Mapeamento por Chave-Valor (se presente no formato CAMPO: VALOR)
    for (const [fieldKey, aliases] of Object.entries(FIELD_MAP)) {
      for (const alias of aliases) {
        const escapedAlias = alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const kvRegex = new RegExp(`(?:^|\\b)${escapedAlias}\\s*[:\\-]\\s*([^\\r\\n]+)`, 'i');
        const match = rawText.match(kvRegex);
        if (match && match[1]) {
          const val = match[1].trim();
          if (val && !doc[fieldKey as keyof Documento3C]) {
            doc[fieldKey as keyof Documento3C] = val;
          }
        }
      }
    }

    // 2. Extração de Data
    if (!doc.dataCarregamento) {
      const dateMatch = cleanOneLine.match(/\b(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4})\b/);
      if (dateMatch) {
        doc.dataCarregamento = formatDateStrict(dateMatch[1]);
      }
    } else {
      doc.dataCarregamento = formatDateStrict(doc.dataCarregamento);
    }

    // 3. Extração de Horário
    if (!doc.horarioCarregamento) {
      const timeMatch = cleanOneLine.match(/(?:HORA|HORÁRIO|PREVISÃO|PREVISAO)[\s\:\-]+(\d{1,2}\:\d{2}(?:\:\d{2})?)/i) ||
        cleanOneLine.match(/\b(\d{1,2}\:\d{2})\b/);
      if (timeMatch) {
        doc.horarioCarregamento = formatTimeStrict(timeMatch[1]);
      } else {
        doc.horarioCarregamento = '08:00';
      }
    } else {
      doc.horarioCarregamento = formatTimeStrict(doc.horarioCarregamento);
    }

    // 4. Extração de Placas e UFs
    const plateRegex = /\b([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}[- ]?[0-9]{4})\b/gi;
    const foundPlates = Array.from(new Set(cleanOneLine.match(plateRegex) || [])).map(p => formatPlateWithoutHyphen(p));

    if (!doc.placaCavalo && foundPlates.length > 0) {
      doc.placaCavalo = foundPlates[0];
    }
    if (!doc.placaCarreta1 && foundPlates.length > 1) {
      doc.placaCarreta1 = foundPlates[1];
    }
    if (!doc.placaCarreta2 && foundPlates.length > 2) {
      doc.placaCarreta2 = foundPlates[2];
    }

    // Extrair UFs de Placas se não definidas
    const ufMatches = Array.from(cleanOneLine.matchAll(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/g)).map(m => m[1]);
    if (!doc.ufPlacaCavalo) {
      const cavaloUfMatch = cleanOneLine.match(new RegExp(`${doc.placaCavalo}\\s+([A-Z]{2})`, 'i'));
      doc.ufPlacaCavalo = cavaloUfMatch ? cavaloUfMatch[1].toUpperCase() : (ufMatches[2] || 'SC');
    }
    if (!doc.ufPlacaCarreta1) {
      const car1UfMatch = cleanOneLine.match(new RegExp(`${doc.placaCarreta1}\\s+([A-Z]{2})`, 'i'));
      doc.ufPlacaCarreta1 = car1UfMatch ? car1UfMatch[1].toUpperCase() : (ufMatches[3] || doc.ufPlacaCavalo || 'SC');
    }

    // 5. CPF (Tratar rigorosamente como string sem parseInt/Number)
    if (!doc.cpf) {
      const cpfMatch = cleanOneLine.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\b\d{11}\b)/);
      if (cpfMatch) {
        doc.cpf = cpfMatch[1].replace(/[^0-9]/g, '');
      }
    } else {
      doc.cpf = doc.cpf.replace(/[^0-9]/g, '');
    }

    // 6. CNH / Registro CNH (Tratar rigorosamente como string)
    if (!doc.registroCnh) {
      const cnhWithLabel = cleanOneLine.match(/(?:CNH|REGISTRO CNH|REGISTRO|N[°º]?\s*DO REGISTRO(?:\s*CNH)?)[\s\:\-]+(\d{9,11})/i);
      if (cnhWithLabel && cnhWithLabel[1]) {
        doc.registroCnh = cnhWithLabel[1].replace(/[^0-9]/g, '');
      } else {
        const potentialCnhs = cleanOneLine.match(/\b(0\d{10}|\d{11})\b/g);
        if (potentialCnhs && potentialCnhs.length > 0) {
          const distinct = potentialCnhs.find(c => c.replace(/[^0-9]/g, '') !== doc.cpf);
          if (distinct) doc.registroCnh = distinct.replace(/[^0-9]/g, '');
        }
      }
    } else {
      doc.registroCnh = doc.registroCnh.replace(/[^0-9]/g, '');
    }

    // 7. RG (Tratar rigorosamente como string)
    if (!doc.rg) {
      const rgMatch = cleanOneLine.match(/(?:RG|IDENTIDADE|SAP)[\s\:\-]+([A-Z0-9\.\-\/\s]{5,15})/i) ||
        cleanOneLine.match(/\b([A-Z]\d{6,8}[A-Z]?|MG\d{6,9}|\d{7,10})\b/i);
      if (rgMatch) {
        doc.rg = rgMatch[1].trim();
      }
    }

    // 8. Motorista / Condutor
    if (!doc.motorista) {
      const driverMatch = cleanOneLine.match(/(?:MOTORISTA|CONDUTOR|NOME DO MOTORISTA|NOME)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{4,40})/i);
      if (driverMatch) {
        doc.motorista = driverMatch[1].replace(/\b(CPF|RG|CNH|PLACA|CARRETA|CAVALO|TEL|CELULAR|VINCULO|FROTA)\b.*/i, '').trim().toUpperCase();
      } else if (doc.cpf) {
        const beforeCpfMatch = cleanOneLine.match(new RegExp(`([A-ZÁÉÍÓÚÃÕÂÊÔÇ\\s]{5,40})\\s+${doc.cpf}`));
        if (beforeCpfMatch) {
          doc.motorista = beforeCpfMatch[1].replace(/.*(?:SP|MG|RJ|PR|SC|RS|BA|GO|ES|DF)\s+/i, '').trim().toUpperCase();
        }
      }
    }

    // 9. Transportador
    if (!doc.transportador) {
      const transpMatch = cleanOneLine.match(/(?:TRANSPORTADOR|TRANSPORTADORA|EMPRESA|TRANSP|TRANSPORTES)[\s\:\-]+([A-Z0-9\s\.\/\-\&]{3,40})/i);
      const rawTransp = transpMatch ? transpMatch[1].replace(/\b(DATA|HORA|PLACA|MOTORISTA|CONDUTOR|DESTINO|CAVALO|CARRETA|CPF|CNH|RG|TEL|ORIGEM|STATUS)\b.*/i, '').trim() : cleanOneLine;
      const matched = findClosestTransportador(rawTransp, transportadoras);
      doc.transportador = matched.matchedName;
    } else {
      const matched = findClosestTransportador(doc.transportador, transportadoras);
      doc.transportador = matched.matchedName;
    }

    // 10. Origem e UF Origem
    if (!doc.origem) {
      const origMatch = cleanOneLine.match(/(?:FILIAL DE ORIGEM|FILIAL ORIGEM|ORIGEM)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{3,30})/i);
      if (origMatch) {
        doc.origem = origMatch[1].replace(/\b(MG|SP|RJ|PR|SC|RS|BA|GO|FILIAL|DESTINO|DATA)\b.*/i, '').trim().toUpperCase();
      } else if (/SANTA LUZIA/i.test(cleanOneLine)) {
        doc.origem = 'SANTA LUZIA';
      } else {
        doc.origem = 'SANTA LUZIA';
      }
    }
    if (!doc.ufOrigem) {
      const origUfMatch = cleanOneLine.match(/SANTA LUZIA\s+([A-Z]{2})/i) || cleanOneLine.match(/FILIAL DE ORIGEM[\s\S]*?([A-Z]{2})\s+FILIAL/i);
      doc.ufOrigem = origUfMatch ? origUfMatch[1].toUpperCase() : 'MG';
    }

    // 11. Destino e UF Destino
    if (!doc.destino) {
      const destMatch = cleanOneLine.match(/(?:FILIAL DE DESTINO|FILIAL DESTINO|DESTINO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{3,30})/i);
      if (destMatch) {
        doc.destino = destMatch[1].replace(/\b(SP|MG|RJ|PR|SC|RS|BA|GO|AGENDA|DATA|HORA)\b.*/i, '').trim().toUpperCase();
      } else if (/GUARULHOS/i.test(cleanOneLine)) {
        doc.destino = 'GUARULHOS';
      } else {
        doc.destino = 'LONDRINA';
      }
    }
    if (!doc.ufDestino) {
      const destUfMatch = cleanOneLine.match(/GUARULHOS\s+([A-Z]{2})/i) || cleanOneLine.match(/FILIAL DE DESTINO[\s\S]*?([A-Z]{2})/i);
      doc.ufDestino = destUfMatch ? destUfMatch[1].toUpperCase() : 'SP';
    }

    // 12. Modelos Cavalo e Carreta
    if (!doc.perfilCarreta) {
      if (/RODOTREM/i.test(cleanOneLine)) {
        doc.perfilCarreta = /SIDER/i.test(cleanOneLine) ? 'RODOTREM SIDER' : 'RODOTREM BAÚ';
      } else if (/SIDER/i.test(cleanOneLine)) {
        doc.perfilCarreta = 'SIDER';
      } else {
        doc.perfilCarreta = 'BAÚ';
      }
    }
    if (!doc.perfilCavalo) {
      if (/TOCO/i.test(cleanOneLine)) doc.perfilCavalo = 'TOCO';
      else if (/6X2|6X4|TRUCADO/i.test(cleanOneLine)) doc.perfilCavalo = 'TRUCADO';
      else doc.perfilCavalo = 'TRUCADO';
    }

    // 13. Capacidades (Pallets e Toneladas)
    if (!doc.capacidadePallets) {
      const pMatch = cleanOneLine.match(/(\d{1,2})\s*(?:PALLETS|PALETS|PLT)/i) || cleanOneLine.match(/CAPACIDADE PALLETS\s*(\d{1,2})/i);
      if (pMatch) doc.capacidadePallets = pMatch[1];
      else {
        const numPairMatch = cleanOneLine.match(/(?:BAU|BAÚ|SIDER)\s+(\d{1,2})\s+(\d{1,2})/i);
        if (numPairMatch) {
          doc.capacidadePallets = numPairMatch[1];
          doc.capacidadeToneladas = numPairMatch[2];
        } else {
          doc.capacidadePallets = '28';
        }
      }
    }
    if (!doc.capacidadeToneladas) {
      const tMatch = cleanOneLine.match(/(\d{1,2}(?:[\.,]\d{1,2})?)\s*(?:TON|TONELADAS|PESO)/i) || cleanOneLine.match(/CAPACIDADE TONELADAS\s*(\d{1,2})/i);
      if (tMatch) doc.capacidadeToneladas = tMatch[1];
      else doc.capacidadeToneladas = '30';
    }

    // 14. Rastreador / Tecnologia
    if (!doc.rastreador) {
      const rastrMatch = cleanOneLine.match(/(?:RASTREADOR|TECNOLOGIA)[\s\:\-]+([A-Z0-9\s]{3,20})/i) ||
        cleanOneLine.match(/\b(SIGHRA|AUTOTRAC|OMNILINK|ONIXSAT|SASCAR|POSIGEO|KRONA|SASI)\b/i);
      if (rastrMatch) doc.rastreador = (rastrMatch[1] || rastrMatch[0]).trim().toUpperCase();
      else doc.rastreador = 'SIGHRA';
    }

    // 15. Quantidade de Eixos
    if (!doc.quantidadeEixos) {
      const eixosMatch = cleanOneLine.match(/(?:QUANT(?:IDADE)? DE EIXOS|EIXOS)[\s\:\-]+([0-9\s\+]+)/i) ||
        cleanOneLine.match(/\b(\d{2}\s*\+\s*\d{1,2}|\d{1,2}\s*\+\s*\d{1,2})\b/);
      if (eixosMatch) doc.quantidadeEixos = eixosMatch[1].trim();
      else doc.quantidadeEixos = '04 + 1';
    }

    // 16. Celular / Telefone (Tratar rigorosamente como string)
    if (!doc.celular) {
      const celMatch = cleanOneLine.match(/(?:CELULAR|TELEFONE|TEL|WHATSAPP)[\s\:\-]+([0-9\s\(\)\-]{8,20})/i) ||
        cleanOneLine.match(/\b(9\d{7,8}|\d{2}\s*9?\d{8}|04\s*1\s*9\d{7})\b/i);
      if (celMatch) {
        doc.celular = celMatch[1] ? celMatch[1].replace(/[^0-9]/g, '') : celMatch[0].replace(/[^0-9]/g, '');
        if (doc.celular.startsWith('041') && doc.celular.length === 11) {
          doc.celular = doc.celular.slice(3);
        }
      }
    } else {
      doc.celular = doc.celular.replace(/[^0-9]/g, '');
    }

    // 17. Vínculo
    if (!doc.vinculo) {
      const vincMatch = cleanOneLine.match(/(?:VINCULO MOTORISTA|VÍNCULO MOTORISTA|VINCULO|VÍNCULO)[\s\:\-]+([A-Z\/\s]{3,20})/i);
      if (vincMatch) doc.vinculo = vincMatch[1].trim().toUpperCase();
      else if (/FROTA/i.test(cleanOneLine)) doc.vinculo = 'FROTA';
      else doc.vinculo = 'TERCEIRO';
    }

    return doc;
  };

  // Parser de dados do documento extraído no Frontend
  const parseDocumentTextToDispoRows = (text: string): DispoRow[] => {
    const doc = parse3CDocument(text);

    const dataStr = doc.dataCarregamento || new Date().toLocaleDateString('pt-BR');
    const mes = getMonthAbbrev(dataStr);
    const dia = getDayOfWeek(dataStr);
    const now = new Date();
    const horaAtual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const EXACT_STATUS = 'REALIZAR IMPRESSÃO';
    const origemFormatted = doc.origem ? `${doc.origem}|${doc.ufOrigem || 'MG'}` : 'SANTA LUZIA|MG';
    const destinoFormatted = normalizeDestino(doc.destino || 'LONDRINA');

    let chkDetails = { checkList: '', pendencia: '' };
    if (getChecklistDetails && doc.placaCavalo) {
      chkDetails = getChecklistDetails(doc.placaCavalo, doc.placaCarreta1);
    }

    // Caso possua 2 carretas (Bitrem / Rodotrem)
    if (doc.placaCarreta1 && doc.placaCarreta2) {
      const halfP = String(Math.round(parseInt(doc.capacidadePallets || '30', 10) / 2) || 15);
      const halfT = String(Math.round(parseFloat(doc.capacidadeToneladas || '30') / 2) || 15);

      const row1: DispoRow = {
        id: `terceiro-${Date.now()}-1`,
        mes,
        origem: origemFormatted,
        dia,
        data: dataStr,
        contatoWhats: doc.horarioCarregamento || '08:00',
        horaLiberado: horaAtual,
        status: EXACT_STATUS,
        modeloCarreta: doc.perfilCarreta || 'RODOTREM BAÚ',
        modeloCavalo: doc.perfilCavalo || 'TRUCADO',
        fezContato: 'SIM',
        destino: destinoFormatted,
        transportador: doc.transportador,
        cavalo: formatPlateWithoutHyphen(doc.placaCavalo),
        carreta: formatPlateWithoutHyphen(doc.placaCarreta1),
        pallets: halfP,
        ton: halfT,
        m3: '95 m³',
        categoria: 'TERCEIRO',
        tecnologia: doc.rastreador || 'SIGHRA',
        conductor: doc.motorista,
        cpf: doc.cpf,
        rgSap: doc.rg,
        cnh: doc.registroCnh,
        telefone: doc.celular,
        vigenciaCadastro: 'TERCEIRO',
        codigoTransportadora: doc.id3c || '100000496',
        idCarga: '',
        estadoMotorista: doc.ufOrigem || 'MG',
        estadoCavalo: doc.ufPlacaCavalo || 'SC',
        estadoCarreta: doc.ufPlacaCarreta1 || 'SC',
        pendencia: chkDetails.pendencia,
        checkList: chkDetails.checkList
      };

      const row2: DispoRow = {
        ...row1,
        id: `terceiro-${Date.now()}-2`,
        carreta: formatPlateWithoutHyphen(doc.placaCarreta2),
        estadoCarreta: doc.ufPlacaCarreta2 || doc.ufPlacaCarreta1 || 'SC',
        pallets: halfP,
        ton: halfT
      };

      return [row1, row2];
    }

    // Carreta Única (Padrão 3C)
    const singleRow: DispoRow = {
      id: `terceiro-${Date.now()}-1`,
      mes,
      origem: origemFormatted,
      dia,
      data: dataStr,
      contatoWhats: doc.horarioCarregamento || '08:00',
      horaLiberado: horaAtual,
      status: EXACT_STATUS,
      modeloCarreta: doc.perfilCarreta || 'BAÚ',
      modeloCavalo: doc.perfilCavalo || 'TRUCADO',
      fezContato: 'SIM',
      destino: destinoFormatted,
      transportador: doc.transportador,
      cavalo: formatPlateWithoutHyphen(doc.placaCavalo),
      carreta: formatPlateWithoutHyphen(doc.placaCarreta1),
      pallets: doc.capacidadePallets || '28',
      ton: doc.capacidadeToneladas || '30',
      m3: '90 m³',
      categoria: 'TERCEIRO',
      tecnologia: doc.rastreador || 'SIGHRA',
      conductor: doc.motorista,
      cpf: doc.cpf,
      rgSap: doc.rg,
      cnh: doc.registroCnh,
      telefone: doc.celular,
      vigenciaCadastro: 'TERCEIRO',
      codigoTransportadora: doc.id3c || '100000496',
      idCarga: '',
      estadoMotorista: doc.ufOrigem || 'MG',
      estadoCavalo: doc.ufPlacaCavalo || 'SC',
      estadoCarreta: doc.ufPlacaCarreta1 || 'SC',
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
      alert('Por favor, selecione um arquivo no formato PDF (.pdf) ou Word (.docx).');
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
      alert('Ocorreu um erro ao processar o arquivo diretamente no navegador.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper to generate EXACT 33-column TSV line for spreadsheet export
  const getRowTSV = (r: DispoRow): string => {
    const cols: string[] = [
      r.mes ?? '',                                       // 1 (A)
      r.origem ?? '',                                    // 2 (B)
      r.dia ?? '',                                       // 3 (C)
      r.data ?? '',                                      // 4 (D)
      r.contatoWhats ?? '',                              // 5 (E)
      r.horaLiberado ?? '',                              // 6 (F)
      r.status || 'REALIZAR IMPRESSÃO',                  // 7 (G)
      r.modeloCarreta ?? '',                             // 8 (H)
      r.modeloCavalo ?? '',                              // 9 (I)
      r.fezContato || 'SIM',                             // 10 (J)
      r.destino ?? '',                                   // 11 (K)
      r.transportador ?? '',                             // 12 (L)
      formatPlateWithoutHyphen(r.cavalo),                // 13 (M) - Cavalo SEM hífen
      formatPlateWithoutHyphen(r.carreta),               // 14 (N) - Carreta SEM hífen
      r.pallets ?? '',                                   // 15 (O)
      r.ton ?? '',                                       // 16 (P)
      r.m3 ?? '',                                        // 17 (Q)
      r.categoria || 'TERCEIRO',                         // 18 (R)
      r.tecnologia ?? '',                                // 19 (S)
      r.conductor ?? '',                                 // 20 (T)
      r.cpf ?? '',                                       // 21 (U)
      r.rgSap ?? '',                                     // 22 (V)
      r.cnh ?? '',                                       // 23 (W)
      r.telefone ?? '',                                  // 24 (X)
      r.vigenciaCadastro || 'TERCEIRO',                  // 25 (Y)
      r.codigoTransportadora || '100000496',             // 26 (Z)
      r.idCarga ?? '',                                   // 27 (AA)
      r.estadoMotorista ?? '',                           // 28 (AB)
      r.estadoCavalo ?? '',                              // 29 (AC)
      r.estadoCarreta ?? '',                             // 30 (AD)
      '',                                                // 31 (AE - Vazio obrigatório)
      r.pendencia ?? '',                                 // 32 (AF)
      r.checkList ?? ''                                  // 33 (AG)
    ];

    return cols.join('\t');
  };

  // Copiar dados para a planilha (TSV estruturado em 33 colunas com placas sem hífen)
  const handleCopyTableToClipboard = async () => {
    if (filteredRows.length === 0) return;

    const tsvLines = filteredRows.map(r => getRowTSV(r));
    const fullTSV = tsvLines.join('\r\n');

    try {
      await navigator.clipboard.writeText(fullTSV);
      setCopiedStatus(true);
      setNotification({
        show: true,
        message: `${filteredRows.length} linha(s) de Terceiros copiada(s) com placas sem hífen (Ex: SEV5A39)!`,
        type: 'success'
      });
      setTimeout(() => setCopiedStatus(false), 3000);
      setTimeout(() => setNotification({ show: false, message: '' }), 4000);
    } catch (err) {
      console.error('Erro ao copiar dados:', err);
    }
  };

  // Copiar linha individual (com placas sem hífen)
  const handleCopySingleRow = async (row: DispoRow) => {
    const line = getRowTSV(row);
    try {
      await navigator.clipboard.writeText(line);
      setNotification({
        show: true,
        message: `Linha de "${row.conductor || 'Terceiro'}" (${formatPlateWithoutHyphen(row.cavalo) || 'Sem Placa'}) copiada com placas sem hífen!`,
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 3500);
    } catch (err) {
      console.error('Erro ao copiar linha:', err);
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
      'STATUS': r.status, // "REALIZAR IMPRESSÃO"
      'MODELO CARRETA': r.modeloCarreta,
      'MODELO CAVALO': r.modeloCavalo,
      'FEZ CONTATO': r.fezContato,
      'DESTINO': r.destino,
      'TRANSPORTADOR': r.transportador,
      'CAVALO': formatPlateWithoutHyphen(r.cavalo),
      'CARRETA': formatPlateWithoutHyphen(r.carreta),
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
    if (!window.confirm(`Deseja remover o registro ${cavalo || ''} da lista de Terceiros?`)) {
      return;
    }
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
    if (!window.confirm(`Tem certeza que deseja apagar os ${selectedIds.size} registros selecionados de Terceiros?`)) {
      return;
    }
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
    if (rows.length === 0) return;
    if (!window.confirm(`Deseja realmente limpar TODOS os ${rows.length} registros importados de Terceiros?`)) {
      return;
    }
    saveRows([]);
    setSelectedIds(new Set());
    setUploadedFileName(null);
    setNotification({
      show: true,
      message: 'Todos os registros de Terceiros foram limpos.',
      type: 'delete'
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3500);
  };

  // Carregar exemplo de Terceiro para teste rápido
  const handleLoadSample = () => {
    const sampleRows: DispoRow[] = [
      {
        id: `terceiro-sample-1`,
        mes: getCurrentMonthAbbrev(),
        origem: 'SANTA LUZIA|MG',
        dia: 'sexta-feira',
        data: new Date().toLocaleDateString('pt-BR'),
        contatoWhats: '09:14:39',
        horaLiberado: '10:00:00',
        status: 'REALIZAR IMPRESSÃO',
        modeloCarreta: 'RODOTREM SIDER',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: 'LONDRINA',
        transportador: 'MOEDENSE',
        cavalo: 'QWK6A22',
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
      },
      {
        id: `terceiro-sample-2`,
        mes: getCurrentMonthAbbrev(),
        origem: 'SANTA LUZIA|MG',
        dia: 'sábado',
        data: new Date().toLocaleDateString('pt-BR'),
        contatoWhats: '07:16:30',
        horaLiberado: '08:30:00',
        status: 'REALIZAR IMPRESSÃO',
        modeloCarreta: 'BAÚ',
        modeloCavalo: 'TRUCADO',
        fezContato: 'SIM',
        destino: 'RIO DE JANEIRO',
        transportador: 'TRANSMAGNA',
        cavalo: 'SEV5A49',
        carreta: 'FIW0188',
        pallets: '28',
        ton: '28',
        m3: '115 m³',
        categoria: 'TERCEIRO',
        tecnologia: 'SIGHRA',
        conductor: 'RICARDO VIEIRA DE SOUZA',
        cpf: '090.351.747-31',
        rgSap: '05779176380',
        cnh: '05578062121',
        telefone: '21 99823-1176',
        vigenciaCadastro: 'TERCEIRO',
        codigoTransportadora: '1000506206',
        idCarga: '',
        estadoMotorista: 'RJ',
        estadoCavalo: 'PR',
        estadoCarreta: 'SC',
        pendencia: '',
        checkList: 'VALIDO'
      }
    ];

    saveRows(prev => [...sampleRows, ...prev]);
    setNotification({
      show: true,
      message: 'Exemplo de registros de terceiros carregado!',
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
      status: 'REALIZAR IMPRESSÃO'
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
      status: row.status || 'REALIZAR IMPRESSÃO'
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

    if (editingRow) {
      saveRows(prev =>
        prev.map(r =>
          r.id === editingRow.id
            ? {
                ...r,
                data: modalForm.data,
                mes: getMonthAbbrev(modalForm.data),
                dia: getDayOfWeek(modalForm.data),
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
                status: 'REALIZAR IMPRESSÃO'
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
        mes: getMonthAbbrev(modalForm.data),
        origem: modalForm.origem.toUpperCase(),
        dia: getDayOfWeek(modalForm.data),
        data: modalForm.data,
        contatoWhats: '08:00:00',
        horaLiberado: new Date().toLocaleTimeString('pt-BR'),
        status: 'REALIZAR IMPRESSÃO',
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
        categoria: 'TERCEIRO',
        tecnologia: 'SIGHRA',
        conductor: modalForm.conductor.toUpperCase(),
        cpf: modalForm.cpf,
        rgSap: '',
        cnh: '',
        telefone: modalForm.telefone,
        vigenciaCadastro: 'TERCEIRO',
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

      {/* Main Parchment Panel identical to Lista de Presença */}
      <div 
        className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
        }}
      >
        {/* Inner border trim */}
        <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />

        {/* Decorative corner screws */}
        <Screw className="absolute top-3 left-3 z-20" />
        <Screw className="absolute top-3 right-3 z-20" />
        <Screw className="absolute bottom-3 left-3 z-20" />
        <Screw className="absolute bottom-3 right-3 z-20" />

        {/* Main Padding Container */}
        <div className="p-4 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

          {/* Top Area: Splitted into Left (Emblem Badge) and Right (Banner + Header + Black Tag) */}
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            
            {/* Left Col: Emblem Card matching Profile Image in PresenceList */}
            <div className="w-28 h-28 md:w-[26%] md:min-w-[210px] md:max-w-[240px] md:h-auto rounded-2xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-gradient-to-b from-[#2a170d] to-[#150a04] flex flex-col items-center justify-center p-4 text-center">
              {/* Gold border accent inside */}
              <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/30 pointer-events-none" />
              
              {/* Logo Emblem */}
              <div className="w-16 h-16 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg mb-2 group-hover:scale-105 transition-transform">
                <FileText size={26} className="text-[#D4AF37]" />
                <div className="absolute inset-1 border border-dashed border-[#D4AF37]/50 rounded-full" />
              </div>

              <span className="text-[#e2cfb9] font-serif font-black text-xs uppercase tracking-widest leading-tight">
                Ordem de Serviço
              </span>
              <span className="text-[10px] text-[#D4AF37] font-mono font-bold mt-0.5 tracking-wider uppercase">
                Terceiros & Agregados
              </span>

              <div className="mt-3 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#f5ebd7] uppercase tracking-wider">
                PDF • DOCX • NAVEGADOR
              </div>
            </div>

            {/* Right Col: Banner Image + Motivational Quote + Title + Black Tag */}
            <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
              
              {/* 4K Aesthetic Banner matching PresenceList */}
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
                    LOGÍSTICA & DISTRIBUIÇÃO
                  </span>
                  <span className="text-white text-[10px] font-semibold drop-shadow-md">
                    Santa Luzia / MG — Brasil
                  </span>
                </div>
              </div>

              {/* Inspirational Quote */}
              <p className="w-full text-[#3d2415] font-serif italic text-xs sm:text-sm text-center leading-snug px-2">
                "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
              </p>

              {/* Bottom Row: Titles & Signature Black Passion Tag */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Title and category */}
                <div className="pb-1">
                  <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                    Importação e Estruturação de Ordens de Serviço (Terceiros)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                    TERCEIROS: <span className="text-[#B32025]">{rows.length} ORDENS IMPORTADAS</span>
                  </h1>
                </div>

                {/* Signature Black Tag: Feito com paixão */}
                <div className="hidden lg:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-3.5 px-5 items-center justify-center gap-4 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative shrink-0">
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                  
                  <div className="w-9 h-9 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                    <Coffee className="text-[#cfab84]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-handwritten text-[#e5d5c1] text-lg font-bold leading-none mb-1">Feito com paixão.</span>
                    <span className="font-handwritten text-[#e5d5c1]/70 text-xs font-medium leading-none">Para quem entrega.</span>
                    <div className="flex gap-1 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Action Buttons Toolbar in PresenceList Aesthetic */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
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
                className="bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:from-[#e52229] hover:to-[#a9080d] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20 disabled:opacity-50"
              >
                <Upload size={15} className="stroke-[2.5]" />
                <span>{isProcessing ? 'Processando Arquivo...' : 'Importar PDF / DOCX'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Copiar Dados para Planilha */}
              <button
                type="button"
                onClick={handleCopyTableToClipboard}
                disabled={filteredRows.length === 0}
                className={cn(
                  "text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-white/20 disabled:opacity-40",
                  copiedStatus
                    ? "bg-[#2e7d32] text-white"
                    : "bg-gradient-to-b from-[#3A2414] to-[#1f1208] hover:from-[#4d321d] hover:to-[#2b190c] text-[#f5ebd7]"
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
                  className="bg-[#FAF6ED] hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97"
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
            <div className="p-4 bg-[#FAF6ED] rounded-2xl border-2 border-[#d6be9c] shadow-md flex items-center gap-3 text-xs font-bold text-[#3A2414] animate-pulse">
              <RefreshCw size={18} className="animate-spin text-[#B32025] shrink-0" />
              <span>{statusMessage || 'Processando arquivo diretamente no seu navegador...'}</span>
            </div>
          )}

          {/* Upload Dropzone Box (Parchment Styled) */}
          {showUploadArea && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-[#a6866b] bg-[#FAF6ED] hover:bg-white p-6 sm:p-8 text-center cursor-pointer transition-all shadow-inner group relative"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowUploadArea(false); }}
                className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#B32025]/10 text-[#B32025] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <h3 className="text-sm font-black text-[#3A2414] uppercase tracking-wide">
                Clique aqui para selecionar a Ordem de Serviço
              </h3>
              <p className="text-xs text-[#7a5b44] mt-1">
                Suporta documentos em formato <strong>PDF (.pdf)</strong> ou <strong>Microsoft Word (.docx)</strong>
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-[#e8dbcc] text-[#3A2414] px-2.5 py-1 rounded-md">
                  Status Automático: REALIZAR IMPRESSÃO
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#e8dbcc] text-[#3A2414] px-2.5 py-1 rounded-md">
                  Origem Padrão: SANTA LUZIA|MG
                </span>
              </div>
            </div>
          )}

          {/* Active File Banner */}
          {uploadedFileName && !isProcessing && (
            <div className="p-3 bg-[#FAF6ED] rounded-xl border border-[#d6be9c] flex items-center justify-between text-xs text-[#5c3e29]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Último arquivo processado: <strong className="text-[#3A2414]">{uploadedFileName}</strong> ({rows.length} registros extraídos)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Pronto para cópia
              </span>
            </div>
          )}

          {/* Parchment Ledger Table */}
          <div className="rounded-2xl border border-[#d6be9c] overflow-hidden bg-white shadow-md">
            <div className="overflow-x-auto max-h-[640px]">
              <table className="w-full text-left text-xs border-collapse">
                {/* Header in deep espresso with gold lettering */}
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#1c1008] text-[#e8dbcc] border-b-2 border-[#5c3e29]">
                    <th className="py-3 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredRows.length && filteredRows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-[#a6866b] text-[#B32025] focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Cavalo (Mercosul)
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Carreta
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Transportador
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Motorista / Condutor
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Destino
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-center">
                      Status
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Modelo
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Data / Hora
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1]">
                      Telefone
                    </th>
                    <th className="py-3 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-[#dfc2a1] text-right pr-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#ebd9c1]">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-stone-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <FileSpreadsheet size={40} className="text-[#d6be9c]" />
                          <p className="font-bold text-[#3A2414] text-sm">
                            Nenhum registro de Terceiro importado até o momento
                          </p>
                          <p className="text-xs text-[#7a5b44] max-w-md">
                            Clique em <strong>"Importar PDF / DOCX"</strong> acima para carregar a Ordem de Serviço ou clique em <strong>"Carregar Exemplo"</strong> para testar a conversão.
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
                              ? "bg-[#f5e6d0]"
                              : index % 2 === 0
                                ? "bg-white hover:bg-[#FAF6ED]"
                                : "bg-[#FAF6ED]/60 hover:bg-[#FAF6ED]"
                          )}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-2.5 px-3 text-center align-middle">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(row.id)}
                              className="rounded border-[#a6866b] text-[#B32025] focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Cavalo License Plate in Mercosul Format */}
                          <td className="py-2 px-3 align-middle">
                            <MercosulPlate plate={row.cavalo} />
                          </td>

                          {/* Carreta */}
                          <td className="py-2 px-3 font-mono font-bold text-[#5c3e29] align-middle">
                            {row.carreta ? (
                              <span className="bg-[#f0e2cf] text-[#4a301e] px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#d6be9c]/60 shadow-xs">
                                {row.carreta}
                              </span>
                            ) : (
                              <span className="text-stone-300 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Transportador Editable Select */}
                          <td className="py-2 px-3 font-bold text-[#3A2414] text-[10px] uppercase tracking-wider align-middle">
                            <div className="flex items-center gap-1.5">
                              <Truck size={14} className="text-[#8c5a2b] shrink-0" />
                              <select
                                value={row.transportador}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  saveRows(prev =>
                                    prev.map(r => (r.id === row.id ? { ...r, transportador: val } : r))
                                  );
                                }}
                                className="bg-[#FAF6ED] border border-[#d6be9c] text-[#3A2414] rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none focus:border-[#B32025] cursor-pointer max-w-[160px] shadow-inner uppercase"
                                title="Transportador associado (Clique para alterar)"
                              >
                                {transportadoras.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Motorista */}
                          <td className="py-2 px-3 font-bold text-[#4a301e] text-[10px] uppercase tracking-wider max-w-[200px] truncate align-middle" title={row.conductor}>
                            {row.conductor ? (
                              <div className="flex items-center gap-1.5">
                                <User size={14} className="text-[#a6866b] shrink-0" />
                                <span className="truncate">{row.conductor}</span>
                              </div>
                            ) : (
                              <span className="text-stone-300 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Destino */}
                          <td className="py-2 px-3 font-mono font-bold text-[#B32025] text-[10px] uppercase tracking-wider align-middle">
                            {row.destino}
                          </td>

                          {/* Status Rigoroso */}
                          <td className="py-2 px-3 text-center align-middle">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border inline-block shadow-xs bg-emerald-50 text-emerald-800 border-emerald-300 whitespace-nowrap">
                              {row.status}
                            </span>
                          </td>

                          {/* Modelo */}
                          <td className="py-2 px-3 font-mono font-bold text-[#5c3e29] text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            {row.modeloCarreta}
                          </td>

                          {/* Data e Hora */}
                          <td className="py-2 px-3 font-mono font-bold text-[#5c3e29] text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            <span>{row.data}</span>
                            {row.contatoWhats && (
                              <span className="text-[#a6866b] text-[9px] block">
                                {row.contatoWhats}
                              </span>
                            )}
                          </td>

                          {/* Telefone */}
                          <td className="py-2 px-3 font-mono font-bold text-[#5c3e29] text-[10px] uppercase tracking-wider align-middle whitespace-nowrap">
                            {row.telefone || '-'}
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3 text-right pr-4 align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopySingleRow(row)}
                                className="p-1 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                title="Copiar linha sem hífen nas placas (Ex: SEV5A39)"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(row)}
                                className="p-1 text-stone-400 hover:text-[#5c3e29] hover:bg-[#ebd9c1]/50 rounded transition-colors cursor-pointer"
                                title="Editar registro"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id, row.cavalo)}
                                className="p-1 text-stone-400 hover:text-[#B32025] hover:bg-rose-100 rounded transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAF6ED] border-t border-[#d6be9c] text-xs font-bold text-[#5c3e29]">
                <span>
                  Página {currentPage} de {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-[#d6be9c] bg-white text-[#3A2414] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span className="px-2 py-1 font-mono text-[11px]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-[#d6be9c] bg-white text-[#3A2414] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal: Adicionar / Editar Registro Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-xl rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-hidden flex flex-col p-6 text-[#3A2414]"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
            }}
          >
            <Screw className="absolute top-3 left-3 z-20" />
            <Screw className="absolute top-3 right-3 z-20" />
            <Screw className="absolute bottom-3 left-3 z-20" />
            <Screw className="absolute bottom-3 right-3 z-20" />

            <div className="flex items-center justify-between border-b border-[#d6be9c] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#B32025] text-white flex items-center justify-center shadow-md">
                  <Truck size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-[#3A2414] uppercase tracking-wide">
                    {editingRow ? 'Editar Registro de Terceiro' : 'Novo Registro de Terceiro'}
                  </h3>
                  <span className="text-[10px] text-[#7a5b44] font-medium block">
                    Status fixo padronizado: REALIZAR IMPRESSÃO
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500 hover:text-stone-800 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs font-bold text-[#3A2414]">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-[#5c3e29] uppercase tracking-wider">
                      Placa Cavalo *
                    </label>
                    {modalForm.cavalo.trim() && (
                      <span className="text-[9px] text-[#003399] font-black uppercase tracking-wider">
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
                      placeholder="Ex: QWK6A22"
                      className="flex-1 px-3 py-2 bg-white border border-[#d6be9c] rounded-xl font-mono text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] uppercase shadow-inner text-xs font-bold"
                    />
                    {modalForm.cavalo.trim() && (
                      <MercosulPlate plate={modalForm.cavalo} className="scale-90 origin-right" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Placa Carreta
                  </label>
                  <input
                    type="text"
                    value={modalForm.carreta}
                    onChange={(e) => setModalForm({ ...modalForm, carreta: e.target.value })}
                    placeholder="Ex: OLN7307"
                    className="w-full px-3 py-2 bg-white border border-[#d6be9c] rounded-xl font-mono text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] uppercase shadow-inner text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Transportador
                  </label>
                  <select
                    value={modalForm.transportador}
                    onChange={(e) => setModalForm({ ...modalForm, transportador: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-[#3A2414] focus:outline-none focus:border-[#B32025] shadow-inner text-xs font-bold cursor-pointer uppercase"
                  >
                    {transportadoras.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={modalForm.destino}
                    onChange={(e) => setModalForm({ ...modalForm, destino: e.target.value })}
                    placeholder="Ex: LONDRINA"
                    className="w-full px-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] uppercase shadow-inner text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Motorista / Condutor
                  </label>
                  <input
                    type="text"
                    value={modalForm.conductor}
                    onChange={(e) => setModalForm({ ...modalForm, conductor: e.target.value })}
                    placeholder="Nome completo do motorista"
                    className="w-full px-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] uppercase shadow-inner text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={modalForm.telefone}
                    onChange={(e) => setModalForm({ ...modalForm, telefone: e.target.value })}
                    placeholder="Ex: 31 99999-9999"
                    className="w-full px-3 py-2 bg-white border border-[#d6be9c] rounded-xl text-[#3A2414] placeholder-stone-400 focus:outline-none focus:border-[#B32025] shadow-inner text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Modelo Carreta
                  </label>
                  <select
                    value={modalForm.modeloCarreta}
                    onChange={(e) => setModalForm({ ...modalForm, modeloCarreta: e.target.value })}
                    className="w-full px-2.5 py-2 bg-white border border-[#d6be9c] rounded-xl text-[#3A2414] focus:outline-none focus:border-[#B32025] shadow-inner text-xs font-bold cursor-pointer"
                  >
                    <option value="BAÚ">BAÚ</option>
                    <option value="SIDER">SIDER</option>
                    <option value="RODOTREM BAÚ">RODOTREM BAÚ</option>
                    <option value="RODOTREM SIDER">RODOTREM SIDER</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Data
                  </label>
                  <input
                    type="text"
                    value={modalForm.data}
                    onChange={(e) => setModalForm({ ...modalForm, data: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-2.5 py-2 bg-white border border-[#d6be9c] rounded-xl font-mono text-[#3A2414] focus:outline-none focus:border-[#B32025] shadow-inner text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-[#5c3e29] uppercase tracking-wider">
                    Pallets / Ton
                  </label>
                  <input
                    type="text"
                    value={modalForm.pallets}
                    onChange={(e) => setModalForm({ ...modalForm, pallets: e.target.value, ton: e.target.value })}
                    placeholder="28"
                    className="w-full px-2.5 py-2 bg-white border border-[#d6be9c] rounded-xl font-mono text-[#3A2414] focus:outline-none focus:border-[#B32025] shadow-inner text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#d6be9c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#d6be9c] hover:bg-[#FAF6ED] text-[#3A2414] text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-b from-[#B32025] to-[#780d11] hover:from-[#c9252a] hover:to-[#8c0e13] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer border border-white/20"
                >
                  {editingRow ? 'Salvar Alterações' : 'Cadastrar Terceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
