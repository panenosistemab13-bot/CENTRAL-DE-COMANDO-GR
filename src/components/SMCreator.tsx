import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Clipboard, 
  Trash2, 
  Calculator, 
  Mail, 
  Plus, 
  Check, 
  ChevronRight,
  TrendingUp,
  Download,
  Info,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  LayoutGrid,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  StickyNote
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.error('Error initializing PDF worker src:', e);
  }
}

let isWorkerConfigured = false;
const ensurePdfWorker = async () => {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  try {
    const version = pdfjsLib.version || '3.11.174';
    const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    const response = await fetch(cdnUrl);
    if (response.ok) {
      const workerCode = await response.text();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
    }
  } catch (err) {
    console.warn('Fallback workerSrc:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  } finally {
    isWorkerConfigured = true;
  }
};

const invertRoute = (trecho: string) => {
  if (!trecho) return '';
  const parts = trecho.trim().split(/\s+/);
  const xIndex = parts.findIndex(p => p.toUpperCase() === 'X');
  if (xIndex > 0 && xIndex < parts.length - 1) {
    const newParts = [...parts];
    const startCity = newParts[xIndex - 1];
    const endCity = newParts[xIndex + 1];
    newParts[xIndex - 1] = endCity;
    newParts[xIndex + 1] = startCity;
    return newParts.join(' ').toUpperCase();
  }
  return trecho.toUpperCase();
};

const formatNfValue = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '0,00';
  const amount = parseFloat(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

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

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

interface SMCreatorProps {
  view?: 'generator' | 'codes';
  onBack?: () => void;
}

interface RouteItem {
  ida: string;
  idaCod: string;
  volta: string;
  voltaCod: string;
}

const DEFAULT_ROUTES: RouteItem[] = [
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4069', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4079' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4070', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '3971/4076' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4081' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASILIA-DF', idaCod: '4071', volta: 'BRASILIA-DF X SANTA LUZIA-MG', voltaCod: '4077' },
  { ida: 'SANTA LUZIA-MG X SUMARE-SP', idaCod: '', volta: 'SUMARE-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4080' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4027', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '3975/4078/4091' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4015', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3969/3970/4075' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X GRAVATAI-RS', idaCod: '', volta: 'GRAVATAI-RS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MT', idaCod: '', volta: 'CAMPO GRANDE-MS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CUIABA-MT', idaCod: '', volta: 'CUIABA-MT X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES', idaCod: '', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3989/3990' },
];

const CITY_MAP: Record<string, string> = {
  slt: 'SANTA LUZIA',
  stl: 'SANTA LUZIA',
  'santa luzia': 'SANTA LUZIA',
  vesp: 'VESPASIANO',
  vespasiano: 'VESPASIANO',
  bra: 'BRASILIA',
  brasilia: 'BRASILIA',
  spo: 'GUARULHOS',
  guarulhos: 'GUARULHOS',
  cam: 'SUMARE',
  sumare: 'SUMARE',
  via: 'VIANA',
  viana: 'VIANA',
  rjo: 'RIO DE JANEIRO',
  'rio de janeiro': 'RIO DE JANEIRO',
  pinh: 'PINHAIS',
  pinhais: 'PINHAIS',
  lon: 'LONDRINA',
  londrina: 'LONDRINA',
  moc: 'MONTES CLAROS',
  'montes claros': 'MONTES CLAROS',
  nat: 'NATAL',
  natal: 'NATAL',
  gov: 'GOV. CELSO RAMOS',
  salv: 'SALVADOR',
  euseb: 'EUSEBIO',
  grav: 'GRAVATAI',
  cg: 'CAMPO GRANDE',
  cui: 'CUIABA',
  ariq: 'ARIQUEMES'
};

const resolveCityName = (term: string): string => {
  const clean = term.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (CITY_MAP[clean]) return CITY_MAP[clean];
  
  for (const [key, val] of Object.entries(CITY_MAP)) {
    if (clean.includes(key)) return val;
  }
  return clean.toUpperCase();
};

const findRouteCode = (trechoStr: string, section: 'ida' | 'volta', routes: RouteItem[]): string => {
  if (!trechoStr || !trechoStr.trim()) return '---';
  
  const raw = trechoStr.trim();
  const parts = raw.split(/\s*X\s*/i);
  let origin = '';
  let destination = '';

  if (parts.length >= 2) {
    origin = resolveCityName(parts[0]);
    destination = resolveCityName(parts[1]);
  } else {
    origin = resolveCityName(raw);
  }

  if (section === 'volta') {
    if (origin === 'SANTA LUZIA' && destination && destination !== 'SANTA LUZIA') {
      const temp = origin;
      origin = destination;
      destination = temp;
    }
  }

  for (const r of routes) {
    const idaUpper = (r.ida || '').toUpperCase();
    const voltaUpper = (r.volta || '').toUpperCase();

    if (section === 'ida') {
      if (origin && destination) {
        if (idaUpper.includes(origin) && idaUpper.includes(destination)) {
          return r.idaCod || r.voltaCod || '---';
        }
      } else if (origin) {
        if (idaUpper.includes(origin)) return r.idaCod || r.voltaCod || '---';
      }
    } else {
      if (origin && destination) {
        if (voltaUpper.includes(origin) && voltaUpper.includes(destination)) {
          return r.voltaCod || r.idaCod || '---';
        }
      } else if (origin) {
        if (voltaUpper.includes(origin)) return r.voltaCod || r.idaCod || '---';
      }
    }
  }

  for (const r of routes) {
    const idaUpper = (r.ida || '').toUpperCase();
    const voltaUpper = (r.volta || '').toUpperCase();

    if (origin && destination) {
      if ((idaUpper.includes(origin) && idaUpper.includes(destination)) ||
          (voltaUpper.includes(origin) && voltaUpper.includes(destination))) {
        return section === 'ida' ? (r.idaCod || r.voltaCod || '---') : (r.voltaCod || r.idaCod || '---');
      }
    }
  }

  return '---';
};

const generateStyledTableHtml = (rows: SMRow[], isIda: boolean) => {
  if (rows.length === 0) return '';
  const headerBg = isIda ? '#0F2D59' : '#801414';
  
  let rowsHtml = '';
  rows.forEach((r, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    rowsHtml += `
      <tr style="background-color: ${bg}; height: 32px;">
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.dataSaida || '-'}</td>
        <td style="width: 25%; padding: 6px 8px; text-align: left; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.motorista || '-'}</td>
        <td style="width: 12%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.placa || '-'}</td>
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.bau1 || '-'}</td>
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.bau2 || '-'}</td>
        <td style="width: 18%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.trecho || '-'}</td>
        <td style="width: 12%; padding: 6px 8px; text-align: right; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px;">${r.valorNf || '0,00'}</td>
      </tr>`;
  });

  return `
    <div style="width: 100%; max-width: 950px; box-sizing: border-box; margin: 10px 0;">
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; border: 1px solid #94a3b8; background-color: #ffffff;">
        <thead>
          <tr style="background-color: ${headerBg}; color: #ffffff; height: 36px;">
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBg};">DATA</th>
            <th style="width: 25%; text-align: left; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 8px; border: 1px solid ${headerBg};">MOTORISTA</th>
            <th style="width: 12%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBg};">PLACA</th>
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBg};">BAÚ 1</th>
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBg};">BAÚ 2</th>
            <th style="width: 18%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBg};">TRECHO</th>
            <th style="width: 12%; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 8px; border: 1px solid ${headerBg};">VALOR NF</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>`;
};

export default function SMCreator({ view = 'generator', onBack }: SMCreatorProps) {
  const [idaRows, setIdaRows] = useState<SMRow[]>([]);
  const [voltaRows, setVoltaRows] = useState<SMRow[]>([]);
  const [calcValues, setCalcValues] = useState<string[]>(['']);
  const [routesList, setRoutesList] = useState<RouteItem[]>(DEFAULT_ROUTES);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    const smRef = ref(db, 'sm_creator_data');
    const unsubscribeSM = onValue(smRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.ida) setIdaRows(data.ida);
        if (data.volta) setVoltaRows(data.volta);
        if (data.calc) setCalcValues(data.calc);
        if (data.notes) {
          const notesArray = Object.entries(data.notes).map(([id, note]: [string, any]) => ({
            id,
            ...note
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotes(notesArray);
        } else {
          setNotes([]);
        }
      }
    });

    const rotasRef = ref(db, 'app_rotas_data');
    const unsubscribeRotas = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        setRoutesList(data);
      } else {
        setRoutesList(DEFAULT_ROUTES);
      }
    });

    return () => {
      unsubscribeSM();
      unsubscribeRotas();
    };
  }, []);

  const historyRef = useRef<Array<{ ida: SMRow[]; volta: SMRow[]; calc: string[] }>>([]);
  const lastPushTimeRef = useRef<number>(0);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);

  const pushHistory = (forcePush = false) => {
    const currentSnapshot = {
      ida: JSON.parse(JSON.stringify(idaRows)),
      volta: JSON.parse(JSON.stringify(voltaRows)),
      calc: [...calcValues]
    };

    const history = historyRef.current;
    const last = history[history.length - 1];
    const now = Date.now();

    const isDifferent = !last || JSON.stringify(last) !== JSON.stringify(currentSnapshot);

    if (isDifferent) {
      if (!forcePush && history.length > 0 && now - lastPushTimeRef.current < 800) {
        // Keeps the state prior to the rapid typing sequence
      } else {
        if (history.length >= 50) history.shift();
        history.push(currentSnapshot);
        lastPushTimeRef.current = now;
        setHistoryCount(history.length);
      }
    }
  };

  const saveIda = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setIdaRows(rows);
    set(ref(db, 'sm_creator_data/ida'), rows);
  };

  const saveVolta = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setVoltaRows(rows);
    set(ref(db, 'sm_creator_data/volta'), rows);
  };

  const saveCalc = (vals: string[], forcePush = false) => {
    pushHistory(forcePush);
    setCalcValues(vals);
    set(ref(db, 'sm_creator_data/calc'), vals);
  };

  const saveNote = (text: string) => {
    if (!text.trim()) return;
    const noteId = Date.now().toString();
    const newNote = {
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    set(ref(db, `sm_creator_data/notes/${noteId}`), newNote);
    setNewNoteText('');
  };

  const deleteNote = (id: string) => {
    set(ref(db, `sm_creator_data/notes/${id}`), null);
  };

  const handleUndo = () => {
    const history = historyRef.current;
    if (history.length === 0) return;

    const previousState = history.pop();
    setHistoryCount(history.length);

    if (previousState) {
      setIdaRows(previousState.ida);
      setVoltaRows(previousState.volta);
      setCalcValues(previousState.calc);

      set(ref(db, 'sm_creator_data'), {
        ida: previousState.ida,
        volta: previousState.volta,
        calc: previousState.calc
      });

      setShowUndoToast(true);
      setTimeout(() => setShowUndoToast(false), 2500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        if (historyRef.current.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [totalRawCopied, setTotalRawCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [idaCopied, setIdaCopied] = useState(false);
  const [voltaCopied, setVoltaCopied] = useState(false);

  // PDF Import Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetSection, setPdfTargetSection] = useState<'ida' | 'volta' | 'calc'>('ida');
  const [pdfTargetRowIndex, setPdfTargetRowIndex] = useState<number | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [parsedPdfItems, setParsedPdfItems] = useState<Array<{
    fileName: string;
    numeroNf: string;
    valor: number;
    valorFormatado: string;
    success: boolean;
    error?: string;
  }>>([]);
  const [pdfTotalSomado, setPdfTotalSomado] = useState<number>(0);
  const [pdfTotalSomadoFormatado, setPdfTotalSomadoFormatado] = useState<string>('0,00');
  const [pdfCopied, setPdfCopied] = useState(false);

  const openPdfModal = (section: 'ida' | 'volta' | 'calc' = 'ida', rowIndex: number | null = null) => {
    setPdfTargetSection(section);
    setPdfTargetRowIndex(rowIndex);
    setIsPdfModalOpen(true);
  };  const processarNotasFiscaisClient = async (arquivos: File[]) => {
    await ensurePdfWorker();

    const extractedItems: Array<{
      fileName: string;
      numeroNf: string;
      valor: number;
      valorFormatado: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const arquivo of arquivos) {
      try {
        const arrayBuffer = await arquivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        interface SpatialItem {
          str: string;
          x: number;
          y: number;
        }

        interface PageExtractionResult {
          pageNum: number;
          valorNumerico: number | null;
          valorTexto: string | null;
        }

        const pageResults: PageExtractionResult[] = [];
        let numeroNf = '---';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();

          const pageItems: SpatialItem[] = [];
          const pageStrs: string[] = [];

          for (const item of content.items as any[]) {
            if (!item.str) continue;
            pageStrs.push(item.str);
            if (item.str.trim()) {
              const transform = item.transform || [1, 0, 0, 1, 0, 0];
              pageItems.push({
                str: item.str,
                x: transform[4] || 0,
                y: transform[5] || 0
              });
            }
          }

          const rawPageText = pageStrs.join(' ');

          // Agrupa itens em linhas na página atual (coordenada Y com tolerância de 6pt)
          const lineGroups: Array<{ y: number; items: SpatialItem[] }> = [];
          for (const item of pageItems) {
            let group = lineGroups.find(g => Math.abs(g.y - item.y) <= 6);
            if (!group) {
              group = { y: item.y, items: [] };
              lineGroups.push(group);
            }
            group.items.push(item);
          }

          lineGroups.sort((a, b) => b.y - a.y); // Do topo para o rodapé

          const lines = lineGroups.map(g => {
            g.items.sort((a, b) => a.x - b.x); // Da esquerda para a direita
            return {
              y: g.y,
              items: g.items,
              fullText: g.items.map(i => i.str).join(' ')
            };
          });

          const fullSpatialText = lines.map(l => l.fullText).join('\n');
          const combinedPageText = rawPageText + '\n' + fullSpatialText;

          // Extrai o Número da NF se ainda não encontrado
          if (numeroNf === '---') {
            const matchNf = combinedPageText.match(/Nº[\s\.:]*(\d[\d\.\-]*\d|\d+)/i) || 
                            combinedPageText.match(/NF-e[\s\.:]*(\d+)/i) ||
                            combinedPageText.match(/NOTA\s+FISCAL[\s\S]{0,30}?(\d{3,9})/i);
            if (matchNf && matchNf[1]) {
              numeroNf = matchNf[1].replace(/\D/g, '');
            }
          }

          let pageValTexto: string | null = null;
          let pageValNumerico: number | null = null;

          // ESTRATÉGIA 1: Correspondência direta quando a etiqueta e o valor estão adjacentes
          const matchDirect1 = rawPageText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[^\d]*?([\d\.]+\,\d{2})/i) ||
                               fullSpatialText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[^\d]*?([\d\.]+\,\d{2})/i);
          if (matchDirect1 && matchDirect1[1]) {
            pageValTexto = matchDirect1[1];
            pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
          }

          // ESTRATÉGIA 2: Análise espacial por linhas
          if (pageValNumerico === null) {
            for (let idx = 0; idx < lines.length; idx++) {
              const line = lines[idx];
              if (/VALOR\s+TOTAL\s+(?:DA\s+)?NF/i.test(line.fullText)) {
                // Tenta encontrar valor na mesma linha após a etiqueta
                const labelIdx = line.fullText.search(/VALOR\s+TOTAL\s+(?:DA\s+)?NF/i);
                const afterLabel = line.fullText.substring(labelIdx);
                const afterMatch = afterLabel.match(/([\d\.]+\,\d{2})/);
                if (afterMatch) {
                  pageValTexto = afterMatch[1];
                  pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
                  break;
                }

                // Senão procura nas 3 linhas imediatamente abaixo
                const labelItem = line.items.slice().reverse().find(i => /NF|TOTAL|VALOR/i.test(i.str)) || line.items[line.items.length - 1];
                const labelX = labelItem ? labelItem.x : 400;

                for (let offset = 1; offset <= 3; offset++) {
                  if (idx + offset < lines.length) {
                    const subLine = lines[idx + offset];
                    const numbersInSubLine: Array<{ numStr: string; val: number; x: number }> = [];
                    
                    for (const item of subLine.items) {
                      const m = item.str.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g);
                      if (m) {
                        for (const numStr of m) {
                          const val = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
                          numbersInSubLine.push({ numStr, val, x: item.x });
                        }
                      }
                    }

                    if (numbersInSubLine.length > 0) {
                      const rightAligned = numbersInSubLine.filter(n => n.x >= labelX - 100);
                      if (rightAligned.length > 0) {
                        rightAligned.sort((a, b) => b.x - a.x);
                        pageValTexto = rightAligned[0].numStr;
                        pageValNumerico = rightAligned[0].val;
                      } else {
                        const lastNum = numbersInSubLine[numbersInSubLine.length - 1];
                        pageValTexto = lastNum.numStr;
                        pageValNumerico = lastNum.val;
                      }
                      break;
                    }
                  }
                }
                if (pageValNumerico !== null) break;
              }
            }
          }

          // ESTRATÉGIA 3: Região do quadro "CÁLCULO DO IMPOSTO"
          if (pageValNumerico === null) {
            const regexBlock = /(?:CALCULO\s+DO\s+IMPOSTO|VALOR\s+TOTAL\s+PRODUTOS)[\s\S]{0,350}/i;
            const blockMatch = combinedPageText.match(regexBlock);
            if (blockMatch) {
              const blockText = blockMatch[0];
              const allCurrencies = blockText.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g);
              if (allCurrencies && allCurrencies.length > 0) {
                const lastVal = allCurrencies[allCurrencies.length - 1];
                pageValTexto = lastVal;
                pageValNumerico = parseFloat(lastVal.replace(/\./g, '').replace(',', '.'));
              }
            }
          }

          // ESTRATÉGIA 4: Fallback por regex geral
          if (pageValNumerico === null) {
            const matchFallback = combinedPageText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[\s\S]{0,150}?([\d\.]+\,\d{2})/i);
            if (matchFallback && matchFallback[1]) {
              pageValTexto = matchFallback[1];
              pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
            }
          }

          pageResults.push({
            pageNum,
            valorNumerico: pageValNumerico,
            valorTexto: pageValTexto
          });
        }

        // Seleciona o melhor resultado entre todas as folhas do PDF
        let valorNumericoResult: number | null = null;
        let valorTextoResult: string | null = null;

        // 1. Procura por valores positivos (> 0). Dá preferência ao valor preenchido na última folha que tiver valor > 0
        const nonZeroResults = pageResults.filter(p => p.valorNumerico !== null && p.valorNumerico > 0);
        if (nonZeroResults.length > 0) {
          const chosen = nonZeroResults[nonZeroResults.length - 1];
          valorNumericoResult = chosen.valorNumerico;
          valorTextoResult = chosen.valorTexto;
        } else {
          // 2. Se nenhuma folha tinha valor > 0, pega o primeiro resultado válido (ex: 0,00)
          const anyResult = pageResults.find(p => p.valorNumerico !== null);
          if (anyResult) {
            valorNumericoResult = anyResult.valorNumerico;
            valorTextoResult = anyResult.valorTexto;
          }
        }

        if (valorNumericoResult !== null && valorTextoResult !== null) {
          const valorFormatado = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(valorNumericoResult);

          extractedItems.push({
            fileName: arquivo.name,
            numeroNf,
            valor: valorNumericoResult,
            valorFormatado,
            success: true
          });
        } else {
          extractedItems.push({
            fileName: arquivo.name,
            numeroNf,
            valor: 0,
            valorFormatado: '0,00',
            success: false,
            error: 'Valor Total da NF não localizado'
          });
        }
      } catch (erro: any) {
        console.error(`Erro ao ler o arquivo ${arquivo.name}:`, erro);
        extractedItems.push({
          fileName: arquivo.name,
          numeroNf: '---',
          valor: 0,
          valorFormatado: '0,00',
          success: false,
          error: `Erro de leitura: ${erro?.message || 'PDF inválido'}`
        });
      }
    }

    return extractedItems;
  };

  const handlePdfFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPdf(true);
    const fileArray: File[] = Array.from(files);

    try {
      const newExtracted = await processarNotasFiscaisClient(fileArray);
      const newItems = [...parsedPdfItems, ...newExtracted];
      const newTotal = newItems.reduce((acc, curr) => acc + (curr.valor || 0), 0);
      const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(newTotal);

      setParsedPdfItems(newItems);
      setPdfTotalSomado(newTotal);
      setPdfTotalSomadoFormatado(newTotalFormatted);
    } catch (err) {
      console.error('Erro ao ler arquivos PDF:', err);
      alert('Erro ao processar os arquivos PDF.');
    } finally {
      setIsProcessingPdf(false);
      e.target.value = '';
    }
  };

  const updateParsedPdfItemValue = (index: number, rawVal: string) => {
    const digits = rawVal.replace(/\D/g, '');
    const amount = digits ? parseFloat(digits) / 100 : 0;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    const updated = [...parsedPdfItems];
    updated[index] = {
      ...updated[index],
      valor: amount,
      valorFormatado: formatted,
      success: amount > 0
    };

    const newTotal = updated.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(newTotal);

    setParsedPdfItems(updated);
    setPdfTotalSomado(newTotal);
    setPdfTotalSomadoFormatado(newTotalFormatted);
  };

  const removeParsedPdfItem = (index: number) => {
    const updated = parsedPdfItems.filter((_, idx) => idx !== index);
    const newTotal = updated.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(newTotal);

    setParsedPdfItems(updated);
    setPdfTotalSomado(newTotal);
    setPdfTotalSomadoFormatado(newTotalFormatted);
  };

  const applyPdfTotalToTarget = (section: 'ida' | 'volta' | 'calc') => {
    const totalValStr = pdfTotalSomadoFormatado;

    if (section === 'calc') {
      if (calcValues.length === 1 && (!calcValues[0] || calcValues[0] === '')) {
        saveCalc([totalValStr], true);
      } else {
        saveCalc([...calcValues, totalValStr], true);
      }
    } else {
      const targetRows = section === 'ida' ? idaRows : voltaRows;
      const saveFunc = section === 'ida' ? saveIda : saveVolta;

      if (pdfTargetRowIndex !== null && targetRows[pdfTargetRowIndex]) {
        const updatedRows = [...targetRows];
        updatedRows[pdfTargetRowIndex] = {
          ...updatedRows[pdfTargetRowIndex],
          valorNf: totalValStr
        };
        saveFunc(updatedRows, true);
      } else if (targetRows.length > 0) {
        const updatedRows = [...targetRows];
        updatedRows[updatedRows.length - 1] = {
          ...updatedRows[updatedRows.length - 1],
          valorNf: totalValStr
        };
        saveFunc(updatedRows, true);
      } else {
        const newRow: SMRow = {
          dataSaida: new Date().toLocaleDateString('pt-BR'),
          motorista: '',
          placa: '',
          bau1: '',
          bau2: '',
          trecho: '',
          valorNf: totalValStr
        };
        saveFunc([newRow], true);
      }
    }

    setIsPdfModalOpen(false);
  };

  const applyIndividualPdfValuesToCalc = () => {
    const validValues = parsedPdfItems.filter(i => i.valor > 0).map(i => i.valorFormatado);
    if (validValues.length > 0) {
      if (calcValues.length === 1 && (!calcValues[0] || calcValues[0] === '')) {
        saveCalc(validValues, true);
      } else {
        saveCalc([...calcValues, ...validValues], true);
      }
    }
    setIsPdfModalOpen(false);
  };

  const copyPdfTotal = () => {
    navigator.clipboard.writeText(pdfTotalSomadoFormatado);
    setPdfCopied(true);
    setTimeout(() => setPdfCopied(false), 2000);
  };

  const renderCodesTable = () => (
    <div className="report-card overflow-hidden">
      <div className="bg-[#4d0c24] p-3 text-center">
        <h3 className="text-white font-bold uppercase tracking-widest text-lg">Solicitação de Monitoramento</h3>
        <p className="text-[#fce783] text-xs font-bold uppercase">Trafegus</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-bold uppercase text-center text-xs">
          <thead>
            <tr className="bg-[#002d3d] text-white">
              <th className="border border-zinc-700 p-3 w-1/3">Assunto</th>
              <th className="border border-zinc-700 p-3 w-1/4">Códigos</th>
              <th className="border border-slate-700 p-3">Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Tipo de Transporte</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">1</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Transferencia</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Tipos de Operação</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">2</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100 italic opacity-80">Dedicados</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Embarcador</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">913</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Tres Corações Alimentos</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Transportador</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">87</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">3C Santa Luzia Dedicados</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Valor Mercadoria Especifica</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">126</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Acima de 900 Mil</td>
            </tr>
            <tr>
              <td className="bg-[#f4b084] border border-slate-700 p-3 text-slate-900">Valor Mercadoria Especifica</td>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">42</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Abaixo de 900 Mil</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const parseInput = (text: string, saveFunc: (rows: SMRow[], forcePush?: boolean) => void, existingRows: SMRow[], section: 'ida' | 'volta') => {
    const lines = text.trim().split('\n');
    const newRows: SMRow[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        let trecho = parts[5] || '';
        if (section === 'volta') {
          trecho = invertRoute(trecho);
        }

        const motoristaRaw = parts[1] || '';
        const motoristaClean = motoristaRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

        newRows.push({
          dataSaida: parts[0] || '',
          motorista: motoristaClean,
          placa: (parts[2] || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
          bau1: parts[3] || '',
          bau2: parts[4] || '',
          trecho: trecho,
          valorNf: '0,00'
        });
      }
    });

    if (newRows.length > 0) {
      saveFunc([...existingRows, ...newRows], true);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, section: 'ida' | 'volta') => {
    const text = e.clipboardData.getData('text');
    parseInput(text, section === 'ida' ? saveIda : saveVolta, section === 'ida' ? idaRows : voltaRows, section);
  };

  const addNewRow = (section: 'ida' | 'volta') => {
    const newRow: SMRow = {
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: '',
      valorNf: '0,00'
    };
    if (section === 'ida') {
      saveIda([...idaRows, newRow], true);
    } else {
      saveVolta([...voltaRows, newRow], true);
    }
  };

  const updateRowValue = (index: number, field: keyof SMRow, value: any, section: 'ida' | 'volta', forcePush = false) => {
    let finalValue = value;
    
    if (field === 'valorNf' && typeof value === 'string') {
      finalValue = formatNfValue(value);
    } else if (field === 'placa' && typeof value === 'string') {
      finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (field === 'trecho' && typeof value === 'string') {
      finalValue = value.toUpperCase();
    } else if (field === 'motorista' && typeof value === 'string') {
      finalValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }

    const isDiscrete = forcePush || field === 'ok';

    if (section === 'ida') {
      const newRows = [...idaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveIda(newRows, isDiscrete);
    } else {
      const newRows = [...voltaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveVolta(newRows, isDiscrete);
    }
  };

  const moveRow = (index: number, direction: 'up' | 'down', section: 'ida' | 'volta') => {
    const rows = section === 'ida' ? [...idaRows] : [...voltaRows];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= rows.length) return;

    const temp = rows[index];
    rows[index] = rows[newIndex];
    rows[newIndex] = temp;

    if (section === 'ida') {
      saveIda(rows, true);
    } else {
      saveVolta(rows, true);
    }
  };

  const copyIdaToVolta = () => {
    if (idaRows.length === 0) return;
    
    const newVoltaRows: SMRow[] = idaRows.map(row => ({
      ...row,
      trecho: invertRoute(row.trecho),
      valorNf: '0,00',
      ok: false
    }));

    saveVolta([...voltaRows, ...newVoltaRows], true);
  };

  const calculateTotal = () => {
    const sum = calcValues.reduce((acc, curr) => {
      const val = parseFloat(curr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      return isNaN(val) ? acc : acc + val;
    }, 0);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(sum);
  };

  const copyTotalRaw = () => {
    const total = calculateTotal();
    navigator.clipboard.writeText(total);
    setTotalRawCopied(true);
    setTimeout(() => setTotalRawCopied(false), 2000);
  };

  const addCalcLine = () => saveCalc([...calcValues, ''], true);
  const updateCalcValue = (index: number, val: string) => {
    const newVals = [...calcValues];
    newVals[index] = val;
    saveCalc(newVals);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 || hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const getJourneyDate = (rows: SMRow[]) => {
    return rows[0]?.dataSaida || '---';
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();

    const formatRowsText = (rows: SMRow[], title: string) => {
      if (rows.length === 0) return '';
      let text = `--- ${title} ---\n`;
      text += `DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF\n`;
      rows.forEach(r => {
        text += `${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf}\n`;
      });
      return text + '\n';
    };

    const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <p>${greeting}!</p>
        <p>Segue relatórios de SM - Ida e Volta.</p>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #14325c; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA IDA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <strong>${getJourneyDate(idaRows)}</strong>!</p>
          ${generateStyledTableHtml(idaRows, true)}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #7f1d1d; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA VOLTA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <strong>${getJourneyDate(voltaRows)}</strong>!</p>
          ${generateStyledTableHtml(voltaRows, false)}
        </div>

        <p style="margin-top: 20px;"><strong>Total Calculado: ${calculateTotal()}</strong></p>
        <p>Att,</p>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue relatórios de SM - Ida e Volta.\n\nROTA IDA\n${greeting}, Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${getJourneyDate(idaRows)}!\n${formatRowsText(idaRows, '')}\nROTA VOLTA\n${greeting}, Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${getJourneyDate(voltaRows)}!\n${formatRowsText(voltaRows, '')}\nTotal Calculado: ${calculateTotal()}\n\nAtt,`;

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([textContent], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copySection = async (rows: SMRow[], title: string, setCopiedStatus: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (rows.length === 0) return;
    
    const color = title.includes('IDA') ? '#14325c' : '#7f1d1d';
    const isIda = title.includes('IDA');
    const greeting = getGreeting();
    const date = getJourneyDate(rows);
    
    const phrase = isIda 
      ? `Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${date}!`
      : `Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${date}!`;

    let html = `<div style="font-family: sans-serif; color: #333;">
      <h3 style="color: ${color}; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ${title} ---</h3>
      <p style="font-size: 13px;">${greeting},</p>
      <p style="font-size: 13px;">${phrase}</p>
      ${generateStyledTableHtml(rows, isIda)}
    </div>`;

    let text = `--- ${title} ---\n${greeting},\n${phrase}\n\n`;
    text += `| DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF |\n`;
    rows.forEach(r => {
      text += `| ${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf} |\n`;
    });

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([html], { type: typeHtml });
      const blobText = new Blob([text], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(data);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } catch (err) {
      navigator.clipboard.writeText(text);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    }
  };

  return (
    <>
      {/* ================= HEADER AREA ================= */}
      <div className="w-full flex flex-col md:flex-row items-center justify-end gap-6 max-w-[94rem] mx-auto mt-2 mb-6 px-6 font-sans">
        
        {/* Global actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button 
            onClick={() => setIsNotepadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm border bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 cursor-pointer"
            title="Abrir bloco de notas"
          >
            <StickyNote size={16} /> Bloco de Notas
          </button>

          <button 
            onClick={handleUndo}
            disabled={historyCount === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm border",
              historyCount > 0 
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-700 cursor-pointer" 
                : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
            )}
            title="Restaurar informação modificada (Ctrl + Z)"
          >
            <RotateCcw size={16} /> Desfazer (Ctrl+Z)
          </button>

          {(idaRows.length > 0 || voltaRows.length > 0) && (
            <button 
              onClick={copyToEmail}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border",
                copied 
                  ? "bg-emerald-600 text-white border-emerald-700" 
                  : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Tudo Copiado!' : 'Copiar Tudo (Ida + Volta)'}
            </button>
          )}

          <button 
            onClick={() => openPdfModal('ida')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2D59] hover:bg-[#0B2347] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-[#0F2D59]"
          >
            <FileText size={16} /> Importar NFs (PDF)
          </button>
        </div>
      </div>

      {view === 'codes' ? (
        <div className="relative z-10 bg-[#fdfcf9] p-6 rounded-xl border-4 border-[#3A2414] shadow-2xl">{renderCodesTable()}</div>
      ) : (
        <div className="relative z-10 space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* ROTA IDA (Blue Theme) */}
              <section className="space-y-3 font-sans">
                <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-xl shadow-sm border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-white font-sans uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-400" /> Rota Ida
                    </h3>
                    <span className="text-[10px] font-extrabold bg-blue-950/80 text-blue-200 px-2.5 py-0.5 rounded-md border border-blue-800">
                      AZUL
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openPdfModal('ida')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                      title="Importar várias NFs em PDF para Rota Ida"
                    >
                      <FileText size={12} /> PDF Ida
                    </button>
                    <button 
                      onClick={() => addNewRow('ida')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-[#0F2D59] hover:bg-[#0B2347] text-white font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-blue-400/30"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {idaRows.length > 0 && (
                      <button 
                        onClick={copyIdaToVolta}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-[10px] font-bold uppercase tracking-tight cursor-pointer"
                        title="Enviar dados da Ida para Volta (Invertendo Trecho)"
                      >
                        <ArrowRightLeft size={12} /> Enviar para Volta
                      </button>
                    )}
                    {idaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm border",
                          idaCopied 
                            ? "bg-emerald-600 text-white border-emerald-700" 
                            : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        )}
                      >
                        {idaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {idaCopied ? 'Copiado!' : 'Copiar Ida'}
                      </button>
                    )}
                    <button onClick={() => saveIda([], true)} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-tight cursor-pointer pl-2">Limpar</button>
                  </div>
                </div>

                {/* Email Header Preview Box */}
                <div className="hidden bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-sans text-xs text-slate-800 shadow-2xs">
                  <p className="font-extrabold text-[#0F2D59] text-sm mb-0.5">--- ROTA IDA ---</p>
                  <p className="font-medium text-slate-700">Boa noite,</p>
                  <p className="font-medium text-slate-700 mt-0.5">
                    Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <span className="font-extrabold text-slate-900">{getJourneyDate(idaRows)}</span>!
                  </p>
                </div>

                {/* Styled Table Frame */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs overflow-hidden relative">
                  {idaRows.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                      <Clipboard className="text-slate-400 w-8 h-8 mb-2" />
                      <p className="text-xs text-slate-600 mb-3 font-bold font-sans">Cole aqui as informações da Rota Ida ou adicione manualmente</p>
                      <div className="flex flex-col gap-2.5 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'ida')}
                          placeholder="Ctrl+V aqui para colar escala..."
                          className="w-full h-20 bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 font-bold outline-none placeholder:text-slate-400 focus:border-[#0F2D59] resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('ida')}
                          className="w-full py-2.5 bg-[#0F2D59] hover:bg-[#0B2347] text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                        >
                          <Plus size={14} className="inline mr-1" /> Adicionar linha manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-[#0F2D59] text-white text-[11px] uppercase font-extrabold tracking-wider h-10">
                            <th className="px-2 py-2 w-8 text-center">#</th>
                            <th className="px-2 py-2 w-10 text-center">OK</th>
                            <th className="px-2 py-2 w-28 text-center">DATA</th>
                            <th className="px-2 py-2">MOTORISTA</th>
                            <th className="px-2 py-2 w-28 text-center">PLACA</th>
                            <th className="px-2 py-2 w-24 text-center">BAÚ 1</th>
                            <th className="px-2 py-2 w-24 text-center">BAÚ 2</th>
                            <th className="px-2 py-2 text-center">TRECHO</th>
                            <th className="px-2 py-2 w-20 text-center">ROTAS</th>
                            <th className="px-2 py-2 w-32 text-right">VALOR NF</th>
                            <th className="px-2 py-2 w-12 text-center">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {idaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-slate-900 group/row font-bold hover:bg-slate-50 transition-colors border-b border-slate-100">
                              <td className="p-1.5 text-center text-slate-400 font-mono text-xs w-8">
                                {i + 1}
                              </td>
                              <td className="p-1.5 text-center w-10">
                                <button
                                  type="button"
                                  onClick={() => updateRowValue(i, 'ok', !row.ok, 'ida')}
                                  className={cn(
                                    "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                    row.ok 
                                      ? "bg-emerald-600 border-emerald-700 text-white shadow-xs" 
                                      : "bg-slate-100 border-slate-300 text-transparent hover:border-emerald-600"
                                  )}
                                  title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'ida')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 group/cell">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded text-[#0F2D59] transition-all shrink-0 cursor-pointer"
                                    title="Copiar Motorista"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.placa}
                                  onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'ida')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs font-mono"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'ida')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'ida')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.trecho}
                                  onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'ida')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center" title="Código da rota obtido da página de Rotas">
                                  {findRouteCode(row.trecho, 'ida', routesList)}
                                </div>
                              </td>
                              <td className="p-1.5 text-right font-extrabold group/cell">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => openPdfModal('ida', i)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#0F2D59]/10 hover:bg-[#0F2D59]/25 rounded text-[#0F2D59] transition-all shrink-0 cursor-pointer"
                                    title="Importar PDFs de NFs para esta linha"
                                  >
                                    <FileText size={12} />
                                  </button>
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded text-[#0F2D59] transition-all shrink-0 cursor-pointer"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-right focus:bg-white focus:border-[#0F2D59] focus:ring-2 focus:ring-[#0F2D59]/20 outline-none transition-all text-xs"
                                  />
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className="flex flex-col gap-0.5">
                                    <button 
                                      onClick={() => moveRow(i, 'up', 'ida')}
                                      disabled={i === 0}
                                      className={cn(
                                        "p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer",
                                        i === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-indigo-600"
                                      )}
                                      title="Mover para cima"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button 
                                      onClick={() => moveRow(i, 'down', 'ida')}
                                      disabled={i === idaRows.length - 1}
                                      className={cn(
                                        "p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer",
                                        i === idaRows.length - 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-indigo-600"
                                      )}
                                      title="Mover para baixo"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => saveIda(idaRows.filter((_, idx) => idx !== i), true)} 
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                    title="Remover Linha"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* ROTA VOLTA (Red Theme) */}
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-xl shadow-sm border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-white font-sans uppercase tracking-wider flex items-center gap-2">
                      <Download size={16} className="rotate-180 text-rose-400" /> Rota Volta
                    </h3>
                    <span className="text-[10px] font-extrabold bg-rose-950/80 text-rose-200 px-2.5 py-0.5 rounded-md border border-rose-800">
                      VERMELHA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openPdfModal('volta')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                      title="Importar várias NFs em PDF para Rota Volta"
                    >
                      <FileText size={12} /> PDF Volta
                    </button>
                    <button 
                      onClick={() => addNewRow('volta')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-[#801414] hover:bg-[#661010] text-white font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-rose-400/30"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {voltaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm border",
                          voltaCopied 
                            ? "bg-emerald-600 text-white border-emerald-700" 
                            : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        )}
                      >
                        {voltaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Volta'}
                      </button>
                    )}
                    <button onClick={() => saveVolta([], true)} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-tight cursor-pointer pl-2">Limpar</button>
                  </div>
                </div>

                {/* Email Header Preview Box */}
                <div className="hidden bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-sans text-xs text-slate-800 shadow-2xs">
                  <p className="font-extrabold text-[#801414] text-sm mb-0.5">--- ROTA VOLTA ---</p>
                  <p className="font-medium text-slate-700">Boa noite,</p>
                  <p className="font-medium text-slate-700 mt-0.5">
                    Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <span className="font-extrabold text-slate-900">{getJourneyDate(voltaRows)}</span>!
                  </p>
                </div>

                {/* Styled Table Frame */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs overflow-hidden relative">
                  {voltaRows.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                      <Clipboard className="text-slate-400 w-8 h-8 mb-2" />
                      <p className="text-xs text-slate-600 mb-3 font-bold font-sans">Cole aqui as informações da Rota Volta ou adicione manualmente</p>
                      <div className="flex flex-col gap-2.5 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'volta')}
                          placeholder="Ctrl+V aqui para colar escala..."
                          className="w-full h-20 bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 font-bold outline-none placeholder:text-slate-400 focus:border-[#801414] resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('volta')}
                          className="w-full py-2.5 bg-[#801414] hover:bg-[#661010] text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                        >
                          <Plus size={14} className="inline mr-1" /> Adicionar linha manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-[#801414] text-white text-[11px] uppercase font-extrabold tracking-wider h-10">
                            <th className="px-2 py-2 w-8 text-center">#</th>
                            <th className="px-2 py-2 w-10 text-center">OK</th>
                            <th className="px-2 py-2 w-28 text-center">DATA</th>
                            <th className="px-2 py-2">MOTORISTA</th>
                            <th className="px-2 py-2 w-28 text-center">PLACA</th>
                            <th className="px-2 py-2 w-24 text-center">BAÚ 1</th>
                            <th className="px-2 py-2 w-24 text-center">BAÚ 2</th>
                            <th className="px-2 py-2 text-center">TRECHO</th>
                            <th className="px-2 py-2 w-20 text-center">ROTAS</th>
                            <th className="px-2 py-2 w-32 text-right">VALOR NF</th>
                            <th className="px-2 py-2 w-12 text-center">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {voltaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-slate-900 group/row font-bold hover:bg-slate-50 transition-colors border-b border-slate-100">
                              <td className="p-1.5 text-center text-slate-400 font-mono text-xs w-8">
                                {i + 1}
                              </td>
                              <td className="p-1.5 text-center w-10">
                                <button
                                  type="button"
                                  onClick={() => updateRowValue(i, 'ok', !row.ok, 'volta')}
                                  className={cn(
                                    "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                    row.ok 
                                      ? "bg-emerald-600 border-emerald-700 text-white shadow-xs" 
                                      : "bg-slate-100 border-slate-300 text-transparent hover:border-emerald-600"
                                  )}
                                  title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'volta')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 group/cell">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-rose-600/10 hover:bg-rose-600/20 rounded text-[#801414] transition-all shrink-0 cursor-pointer"
                                    title="Copiar Motorista"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.placa}
                                  onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'volta')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs font-mono"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'volta')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'volta')}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="flex items-center gap-1 group/trecho">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all uppercase text-xs"
                                  />
                                  <button 
                                    onClick={() => {
                                      const inverted = invertRoute(row.trecho);
                                      updateRowValue(i, 'trecho', inverted, 'volta');
                                    }}
                                    className="opacity-0 group-hover/trecho:opacity-100 p-1.5 bg-rose-600/10 text-rose-700 hover:bg-rose-600 hover:text-white rounded transition-all shrink-0 cursor-pointer"
                                    title="Inverter Rota"
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center" title="Código da rota obtido da página de Rotas">
                                  {findRouteCode(row.trecho, 'volta', routesList)}
                                </div>
                              </td>
                              <td className="p-1.5 text-right font-extrabold group/cell">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => openPdfModal('volta', i)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#801414]/10 hover:bg-[#801414]/25 rounded text-[#801414] transition-all shrink-0 cursor-pointer"
                                    title="Importar PDFs de NFs para esta linha"
                                  >
                                    <FileText size={12} />
                                  </button>
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-rose-600/10 hover:bg-rose-600/20 rounded text-[#801414] transition-all shrink-0 cursor-pointer"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold rounded-md py-1.5 px-2 text-right focus:bg-white focus:border-[#801414] focus:ring-2 focus:ring-[#801414]/20 outline-none transition-all text-xs"
                                  />
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className="flex flex-col gap-0.5">
                                    <button 
                                      onClick={() => moveRow(i, 'up', 'volta')}
                                      disabled={i === 0}
                                      className={cn(
                                        "p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer",
                                        i === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-rose-600"
                                      )}
                                      title="Mover para cima"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button 
                                      onClick={() => moveRow(i, 'down', 'volta')}
                                      disabled={i === voltaRows.length - 1}
                                      className={cn(
                                        "p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer",
                                        i === voltaRows.length - 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-rose-600"
                                      )}
                                      title="Mover para baixo"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => saveVolta(voltaRows.filter((_, idx) => idx !== i), true)} 
                                    className="p-1.5 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Remover Linha"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Calculator Sidebar */}
            <div className="space-y-4 font-sans">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col font-sans">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <Calculator size={16} className="text-slate-700" />
                    Soma de Valores
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => openPdfModal('calc')}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer border border-slate-300"
                      title="Importar PDFs de NFs para somar na calculadora"
                    >
                      <FileText size={11} /> PDF
                    </button>
                    <button 
                      onClick={() => saveCalc(calcValues.map(() => ''), true)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Resetar calculadora"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 mb-4 text-center relative group/total text-white shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Total Consolidado</p>
                  <h4 className="text-2xl font-black tracking-tight font-sans">
                    <span className="text-slate-400 mr-1 text-sm font-semibold">R$</span>
                    {calculateTotal()}
                  </h4>
                  <div className="absolute top-2.5 right-2.5">
                    <button 
                      onClick={copyTotalRaw}
                      className={cn(
                        "p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer",
                        totalRawCopied ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      )}
                      title="Copiar Valor"
                    >
                      {totalRawCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-0.5">
                  {calcValues.map((val, i) => (
                    <div key={i} className="group relative flex items-center">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateCalcValue(i, e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-16 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {val && (
                          <button 
                            onClick={() => updateCalcValue(i, '')}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all cursor-pointer"
                            title="Limpar Campo"
                          >
                            <X size={12} />
                          </button>
                        )}
                        {calcValues.length > 1 && (
                          <button 
                            onClick={() => saveCalc(calcValues.filter((_, idx) => idx !== i), true)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-all cursor-pointer"
                            title="Remover Linha"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button 
                      onClick={addCalcLine}
                      className="py-2.5 border border-dashed border-slate-300 hover:border-slate-800 rounded-lg text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider bg-slate-50 cursor-pointer"
                    >
                      <Plus size={14} /> Nova Linha
                    </button>

                    <button 
                      onClick={() => saveCalc(calcValues.map(() => ''))}
                      className="py-2.5 border border-dashed border-rose-200 hover:border-rose-400 text-rose-600 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider bg-rose-50/50 cursor-pointer"
                      title="Limpar todos os valores adicionados"
                    >
                      <Trash2 size={14} /> Limpar
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-[10px] text-slate-600 font-medium">
                  A soma aceita vírgulas e pontos. Atualizada em tempo real.
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 flex items-center justify-between group cursor-pointer hover:border-slate-400 transition-all rounded-xl shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon size={16} className="text-slate-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Atualização</p>
                    <p className="text-xs font-bold text-slate-800">Agora mesmo</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ================= PDF IMPORT MODAL ================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#fdfcf9] border-4 border-[#3A2414] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#3A2414] to-[#25150a] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#B32025] rounded-xl text-white shadow-md">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-serif font-black uppercase text-base tracking-wide text-amber-100">
                    Importar Várias Notas Fiscais (PDF)
                  </h3>
                  <p className="text-xs text-amber-200/80 font-sans">
                    Extração automática do valor total das NFs e cálculo da soma total
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 text-amber-200/60 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* File Upload Dropzone */}
              <div className="relative border-2 border-dashed border-[#B32025]/40 hover:border-[#B32025] bg-[#B32025]/5 hover:bg-[#B32025]/10 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer group">
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf,.pdf" 
                  onChange={handlePdfFilesUpload}
                  disabled={isProcessingPdf}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="p-4 bg-white rounded-full text-[#B32025] shadow-md group-hover:scale-110 transition-transform mb-3 border border-[#B32025]/20">
                  <Upload size={28} />
                </div>
                <p className="text-sm font-bold text-[#3A2414] uppercase tracking-wide">
                  Clique para Selecionar ou Arraste os PDFs das NFs
                </p>
                <p className="text-xs text-[#3A2414]/60 mt-1">
                  Você pode selecionar várias notas fiscais em PDF simultaneamente (DANFE / NF-e)
                </p>
              </div>

              {/* Processing Loader */}
              {isProcessingPdf && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-900 font-bold text-sm animate-pulse">
                  <Loader2 size={20} className="animate-spin text-[#B32025]" />
                  Processando e lendo o valor das NFs em PDF...
                </div>
              )}

              {/* Parsed Results Area */}
              {parsedPdfItems.length > 0 && (
                <div className="space-y-4">
                  {/* Total Banner */}
                  <div className="bg-gradient-to-r from-[#B32025] via-[#8c060d] to-[#590206] p-5 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-amber-200/90 font-serif">
                        Valor Total Somado ({parsedPdfItems.length} NFs)
                      </p>
                      <h4 className="text-3xl font-black text-white font-serif tracking-tight mt-0.5">
                        <span className="text-amber-300 text-xl font-normal mr-1.5">R$</span>
                        {pdfTotalSomadoFormatado}
                      </h4>
                    </div>

                    <button 
                      onClick={copyPdfTotal}
                      className={cn(
                        "px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer border",
                        pdfCopied 
                          ? "bg-green-600 border-green-400 text-white" 
                          : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
                      )}
                    >
                      {pdfCopied ? <Check size={16} /> : <Copy size={16} />}
                      {pdfCopied ? 'Copiado!' : 'Copiar Total'}
                    </button>
                  </div>

                  {/* List of imported PDFs */}
                  <div className="border border-[#3A2414]/15 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#3A2414]/5 p-3 border-b border-[#3A2414]/15 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#3A2414] tracking-wider font-serif">
                        Notas Importadas ({parsedPdfItems.length})
                      </span>
                      <button 
                        onClick={() => {
                          setParsedPdfItems([]);
                          setPdfTotalSomado(0);
                          setPdfTotalSomadoFormatado('0,00');
                        }}
                        className="text-[10px] font-bold text-[#B32025] hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Limpar Lista
                      </button>
                    </div>

                    <div className="divide-y divide-[#3A2414]/10 max-h-56 overflow-y-auto">
                      {parsedPdfItems.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-stone-50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={cn("p-1.5 rounded-lg shrink-0", item.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                              {item.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#2D1A10] truncate" title={item.fileName}>
                                {item.fileName}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                {item.numeroNf !== '---' ? `NF Nº ${item.numeroNf}` : item.error || 'Valor extraído do PDF'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-stone-400 font-bold text-[10px]">R$</span>
                            <input 
                              type="text" 
                              value={item.valorFormatado}
                              onChange={(e) => updateParsedPdfItemValue(idx, e.target.value)}
                              className="w-28 bg-[#d2c2b2]/40 border border-[#c0a892] rounded-lg py-1 px-2 text-right font-mono text-xs font-bold text-[#3A2414] outline-none focus:border-[#B32025]"
                            />
                            <button 
                              onClick={() => removeParsedPdfItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remover Nota"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-[#3A2414]/5 p-5 border-t border-[#3A2414]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#3A2414]/70 font-serif font-bold text-center sm:text-left">
                {pdfTargetRowIndex !== null ? (
                  <span>Aplicando na linha #{pdfTargetRowIndex + 1} ({pdfTargetSection === 'ida' ? 'Rota Ida' : 'Rota Volta'})</span>
                ) : (
                  <span>Selecione onde aplicar o valor total somado (R$ {pdfTotalSomadoFormatado})</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => applyPdfTotalToTarget('ida')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#14325c] hover:bg-[#0f2a4a] disabled:opacity-50 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-black/20"
                >
                  Preencher Rota Ida
                </button>

                <button 
                  onClick={() => applyPdfTotalToTarget('volta')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#7f1d1d] hover:bg-[#991b1b] disabled:opacity-50 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-black/20"
                >
                  Preencher Rota Volta
                </button>

                <button 
                  onClick={() => applyPdfTotalToTarget('calc')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#3A2414] hover:bg-[#2A1408] disabled:opacity-50 text-[#fbdba5] font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-black/20"
                >
                  Lançar na Calculadora
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notepad Sliding Panel */}
      <AnimatePresence>
        {isNotepadOpen && (
          <div className="fixed inset-0 z-50 flex justify-end font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotepadOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <StickyNote size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Bloco de Notas</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lembretes e Avisos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNotepadOpen(false)}
                  className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 border-b border-slate-100 bg-white">
                <div className="flex gap-2">
                  <textarea
                    placeholder="Digite seu lembrete aqui..."
                    className="flex-1 min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-medium placeholder:text-slate-400"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveNote(newNoteText);
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => saveNote(newNoteText)}
                    disabled={!newNoteText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                {notes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                    <div className="p-4 bg-slate-100 rounded-full">
                      <StickyNote size={32} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum lembrete salvo</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                      key={note.id}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                            {note.text}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <CalendarIcon size={10} />
                            <span>
                              {new Date(note.timestamp).toLocaleDateString('pt-BR')} às {new Date(note.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast feedback when Ctrl+Z is activated */}
      <AnimatePresence>
        {showUndoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700"
          >
            <RotateCcw className="text-amber-400 w-5 h-5" />
            <div>
              <p className="text-xs font-bold font-sans">Informação restaurada!</p>
              <p className="text-[10px] text-slate-400 font-sans">Desfazer (Ctrl + Z) aplicado com sucesso.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
