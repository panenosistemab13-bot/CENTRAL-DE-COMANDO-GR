import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Clipboard,
  Check,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Sliders,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Info,
  ShieldAlert,
  Search,
  Edit2,
  Save,
  X,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import FileSaver from 'file-saver';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { parseISO, differenceInDays } from 'date-fns';

// 33 exact columns required for "Disponibilidade" (Pátio) spreadsheet (Colunas A a AG)
export const DISPO_COLUMNS = [
  'MÊS',                            // 1 (A)
  'ORIGEM',                         // 2 (B)
  'DIA',                            // 3 (C)
  'DATA',                           // 4 (D)
  'CONTATO WHATS',                  // 5 (E)
  'HORA LIBERADO',                  // 6 (F)
  'STATUS',                         // 7 (G)
  'MODELO CARRETA',                 // 8 (H)
  'MODELO CAVALO',                  // 9 (I)
  'FEZ CONTATO?',                   // 10 (J)
  'DESTINO',                        // 11 (K)
  'TRANSPORTADOR',                  // 12 (L)
  'CAVALO',                         // 13 (M)
  'CARRETA',                        // 14 (N)
  'Nº PALLETS',                     // 15 (O)
  'TON',                            // 16 (P)
  'M³',                             // 17 (Q)
  'CATEGORIA',                      // 18 (R)
  'TECNOLOGIA',                     // 19 (S)
  'CONDUCTOR',                      // 20 (T)
  'CPF',                            // 21 (U)
  'RG / SAP',                       // 22 (V)
  'CNH',                            // 23 (W)
  'TELEFONE',                       // 24 (X)
  'VIGÊNCIA DO CADASTRO',           // 25 (Y)
  'CÓDIGO DA TRANSPORTADORA',       // 26 (Z)
  'ID DA CARGA / LACRE EXPORTAÇÃO',  // 27 (AA)
  'ESTADO MOTORISTA',               // 28 (AB)
  'ESTADO CAVALO',                  // 29 (AC)
  'ESTADO CARRETA',                 // 30 (AD)
  '',                               // 31 (AE)
  'PENDENCIA',                      // 32 (AF)
  'CHECK LIST'                      // 33 (AG)
] as const;

export interface DispoRow {
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
  checkList: string;
  pendencia: string;
}

export interface Motorista3C {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
}

// 27 Drivers list from user's attached image (image.png)
export const INITIAL_MOTORISTAS_3C: Omit<Motorista3C, 'id'>[] = [
  { nome: 'ADILSON DOS REIS SILVA', cpf: '599.612.106.97', rg: 'MG3330429' },
  { nome: 'ADRIANO DA SILVA DE SOUZA', cpf: '080.054.376.92', rg: 'MG13811014' },
  { nome: 'ALAN HENRIQUE ALVES MACIEL DOS SANTOS', cpf: '067.595.466.52', rg: 'MG10829620' },
  { nome: 'ALVIMARIO DOS SANTOS', cpf: '028.654.416.44', rg: 'MG7668785' },
  { nome: 'ANDERSON DE ALMEIDA SOARES', cpf: '065.123.286.47', rg: 'MG10229992' },
  { nome: 'DANIEL PEREIRA DA CUNHA', cpf: '100.359.096.92', rg: 'MG14723148' },
  { nome: 'DIEGO RODRIGO DE OLIVEIRA TORRES', cpf: '085.734.946.54', rg: 'MG15511875' },
  { nome: 'ELIAS DE SOUZA BARBOSA', cpf: '056.154.926.51', rg: 'MG12208437' },
  { nome: 'FERNANDO COLOR ALVES CARDOSO', cpf: '119.173.486.22', rg: 'MG17532481' },
  { nome: 'JONATAS SILVA MATIAS', cpf: '086.851.316.42', rg: 'MG15322717' },
  { nome: 'LEANDRO ALVES PIRES', cpf: '059.560.626.40', rg: 'MG12155796' },
  { nome: 'LUCIO ROBERTO CARDOSO DOS ANJOS', cpf: '097.029.916.84', rg: 'MG16166279' },
  { nome: 'LUIZ ANTONIO DOS SANTOS MARQUES', cpf: '684.258.136.20', rg: 'MG4418906' },
  { nome: 'MARISON RESENDE LEMOS', cpf: '015.784.926.02', rg: 'MG11378218' },
  { nome: 'PAULO DE OLIVEIRA RAMOS', cpf: '881.913.116.15', rg: 'MG5041854' },
  { nome: 'PAULO PEREIRA DE SOUSA', cpf: '035.812.206.60', rg: 'MG10489715' },
  { nome: 'PEDRO HENRIQUE ARAUJO DE SOUSA', cpf: '109.604.946.50', rg: 'MG16373993' },
  { nome: 'RENATO LÚCIO FERREIRA', cpf: '013.639.816.25', rg: 'MG12114900' },
  { nome: 'SAMUEL ALVES PEREIRA DA SILVA', cpf: '104.722.696.32', rg: 'MG17029661' },
  { nome: 'SIDNEY COSTA LIDORIO', cpf: '074.498.246.47', rg: 'MG14140167' },
  { nome: 'WALLISSON DE JESUS PEREIRA', cpf: '117.616.486.40', rg: 'MG15903697' },
  { nome: 'WARLEY OLIVEIRA DO SANTOS', cpf: '058.508.696.00', rg: 'MG10709292' },
  { nome: 'WEBER DALFRAN FERNANDES', cpf: '036.847.996.02', rg: 'MG12967576' },
  { nome: 'WENDEL POLOZZI REIS MAIA', cpf: '108.064.276.55', rg: 'MG16269190' },
  { nome: 'JOSE FRANCISCO DEBORTOLI LOPES', cpf: '084.694.686.24', rg: 'MG14542349' },
  { nome: 'EVERTON LUCAS FERNANDES', cpf: '079.149.766.60', rg: 'MG14891367' },
  { nome: 'WELLINGTON TADEU MUNIZ', cpf: '050.728.216.69', rg: '' }
];

// 58 Standardized Destinations from user's attached list (image.png)
export const DESTINOS_PADRAO = [
  'ARIQUEMES RO',
  'BARBALHA',
  'BARRA VELHA',
  'BEBEDOURO-SP',
  'BELÉM',
  'BRASÍLIA',
  'CAMPO GRANDE',
  'CAMPO GRANDE / CUIABÁ',
  'CARIACICA ES',
  'CASTRO PR',
  'CECONSLO',
  'CLIENTE',
  'CONDOR - CURITIBA',
  'CONTAGEM MG',
  'CSD - PAIÇANDU PR',
  'CUIABÁ',
  'CUIABÁ / ARIQUEMES',
  'DESTRO - CURITIBA',
  'DF SOLUÇÕES LOG',
  'DMA',
  'EXPORTAÇÃO',
  'FUBOKA - BRASÍLIA',
  'GASTRÔ',
  'GOV. CELSO RAMOS',
  'GRAVATAÍ',
  'GUARULHOS',
  'JOÃO PESSOA',
  'JUAZEIRO DO NORTE',
  'JUIZ DE FORA',
  'JUNDIAÍ SP',
  'LONDRINA',
  'MACEIÓ',
  'MANAUS',
  'MONTES CLAROS',
  'MOSSORÓ',
  'MUFFATO - CAMBÉ/PR',
  'NATAL',
  'NATAL / EUSÉBIO',
  'PATROCÍNIO PAULISTA',
  'PINHAIS',
  'PORTO ALEGRE MG',
  'POUSO ALEGRE MG',
  'RECIFE',
  'RIO DE JANEIRO',
  'S CAETTI',
  'SALVADOR',
  'SANTA LUZIA',
  'SMART',
  'SUMARÉ',
  'SUPERFRIO',
  'TERESINA',
  'TOTAL SERVICE',
  'TRIANGULO SP',
  'UBERLÂNDIA MG',
  'VARGEM GRANDE DO SUL SP',
  'VESPASIANO',
  'VIANA',
  'XAXIM SC'
] as const;

export const normalizeDestino = (raw: string): string => {
  if (!raw || !raw.trim()) return '';
  const rawUpper = raw.trim().toUpperCase();
  const clean = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const normRaw = clean(raw);

  // Explicit city abbreviation mappings requested
  if (normRaw === 'MOC' || normRaw === 'MOCMG') return 'MONTES CLAROS';
  if (normRaw === 'RJO' || normRaw === 'RJOMG' || normRaw === 'RIO') return 'RIO DE JANEIRO';
  if (normRaw === 'SPO' || normRaw === 'SPOMG' || normRaw === 'GRU') return 'GUARULHOS';
  if (normRaw === 'BRA' || normRaw === 'BRAMG' || normRaw === 'BSB') return 'BRASÍLIA';
  if (normRaw === 'LON' || normRaw === 'LONPR') return 'LONDRINA';
  if (normRaw === 'VIA' || normRaw === 'VIAES') return 'VIANA';
  if (normRaw === 'CAM' || normRaw === 'CAMSP' || normRaw === 'SUMARE') return 'SUMARÉ';
  if (normRaw === 'PINH' || normRaw === 'PINHPR') return 'PINHAIS';
  if (normRaw === 'VESP' || normRaw === 'VESPMG') return 'VESPASIANO';

  // Check token-based abbreviation matches
  const tokens = rawUpper.split(/[\s\/\-\|\_\,]+/).map(t => clean(t)).filter(Boolean);
  for (const t of tokens) {
    if (t === 'MOC') return 'MONTES CLAROS';
    if (t === 'RJO') return 'RIO DE JANEIRO';
    if (t === 'SPO') return 'GUARULHOS';
    if (t === 'BRA') return 'BRASÍLIA';
    if (t === 'LON') return 'LONDRINA';
    if (t === 'VIA') return 'VIANA';
    if (t === 'CAM') return 'SUMARÉ';
    if (t === 'PINH') return 'PINHAIS';
    if (t === 'VESP') return 'VESPASIANO';
  }

  // Exact match after accent/punctuation stripping
  for (const dest of DESTINOS_PADRAO) {
    if (clean(dest) === normRaw) {
      return dest;
    }
  }

  // Specific common mapping rules based on destination image
  if (normRaw.includes('CAMPOGRANDE') && normRaw.includes('CUIABA')) return 'CAMPO GRANDE / CUIABÁ';
  if (normRaw.includes('CUIABA') && normRaw.includes('ARIQUEMES')) return 'CUIABÁ / ARIQUEMES';
  if (normRaw.includes('NATAL') && normRaw.includes('EUSEBIO')) return 'NATAL / EUSÉBIO';
  if (normRaw.includes('DESTRO') && normRaw.includes('CURITIBA')) return 'DESTRO - CURITIBA';
  if (normRaw.includes('CONDOR') && normRaw.includes('CURITIBA')) return 'CONDOR - CURITIBA';
  if (normRaw.includes('FUBOKA')) return 'FUBOKA - BRASÍLIA';
  if (normRaw.includes('MUFFATO')) return 'MUFFATO - CAMBÉ/PR';
  if (normRaw.includes('CSD') || normRaw.includes('PAICANDU')) return 'CSD - PAIÇANDU PR';
  if (normRaw.includes('DFSOLUCOES') || normRaw.includes('DFSOLUC')) return 'DF SOLUÇÕES LOG';
  if (normRaw.includes('PATROCINIOPAULISTA') || normRaw.includes('PATROCINIO')) return 'PATROCÍNIO PAULISTA';
  if (normRaw.includes('VARGEMGRANDE')) return 'VARGEM GRANDE DO SUL SP';
  if (normRaw.includes('GOVCELSO') || normRaw.includes('CELSORAMOS')) return 'GOV. CELSO RAMOS';
  if (normRaw.includes('TOTALSERVICE')) return 'TOTAL SERVICE';
  if (normRaw.includes('JUIZDEFORA')) return 'JUIZ DE FORA';
  if (normRaw.includes('PORTOALEGRE')) return 'PORTO ALEGRE MG';
  if (normRaw.includes('POUSOALEGRE')) return 'POUSO ALEGRE MG';
  if (normRaw.includes('UBERLANDIA')) return 'UBERLÂNDIA MG';
  if (normRaw.includes('CONTAGEM')) return 'CONTAGEM MG';
  if (normRaw.includes('SANTALUZIA')) return 'SANTA LUZIA';
  if (normRaw.includes('RIODEJANEIRO')) return 'RIO DE JANEIRO';
  if (normRaw.includes('JOAOPESSOA')) return 'JOÃO PESSOA';
  if (normRaw.includes('JUAZEIRO')) return 'JUAZEIRO DO NORTE';
  if (normRaw.includes('SCAETI') || normRaw.includes('SCAETTI') || normRaw.includes('SCAETANO')) return 'S CAETTI';
  if (normRaw.includes('MONTESCLAROS')) return 'MONTES CLAROS';
  if (normRaw.includes('BEBEDOURO')) return 'BEBEDOURO-SP';
  if (normRaw.includes('CARIACICA')) return 'CARIACICA ES';
  if (normRaw.includes('JUNDIAI')) return 'JUNDIAÍ SP';
  if (normRaw.includes('TRIANGULO')) return 'TRIANGULO SP';
  if (normRaw.includes('CASTRO')) return 'CASTRO PR';
  if (normRaw.includes('ARIQUEMES')) return 'ARIQUEMES RO';
  if (normRaw.includes('XAXIM')) return 'XAXIM SC';
  if (normRaw.includes('MACEIO')) return 'MACEIÓ';
  if (normRaw.includes('BELEM')) return 'BELÉM';
  if (normRaw.includes('BRASILIA')) return 'BRASÍLIA';
  if (normRaw.includes('CUIABA')) return 'CUIABÁ';
  if (normRaw.includes('MOSSORO')) return 'MOSSORÓ';
  if (normRaw.includes('GASTRO')) return 'GASTRÔ';
  if (normRaw.includes('EXPORTACAO')) return 'EXPORTAÇÃO';

  // Partial match fallback
  for (const dest of DESTINOS_PADRAO) {
    const cleanD = clean(dest);
    if (cleanD.includes(normRaw) || normRaw.includes(cleanD)) {
      return dest;
    }
  }

  return raw.toUpperCase().trim();
};

interface ChecklistItem {
  id: string;
  cavalo: string;
  carretas?: string;
  dataTeste?: string;
  dataVencimento?: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

// Sample data with 3C drivers
const SAMPLE_INPUT_TEXT = `10/09/2026\tADILSON DOS REIS SILVA\tUUF-3F25\tUUG-4I45\tUUG-4B95\tSANTA LUZIA X NATAL\t32503\t1001203515\t48\t34
10/09/2026\tADRIANO DA SILVA DE SOUZA\tUUO-8D35\tUVA-5F15\tUVA-4E95\tSANTA LUZIA X RECIFE\t32512\t1001215981\t48\t45
10/09/2026\tPAULO EDER DE OLIVEIRA MENDES\tUUO-9D95\tUVA-6C45\tUVA-6F45\tSANTA LUZIA X JOÃO PESSOA\t32471\t1000425673\t48\t45
10/09/2026\tDIEGO RODRIGO DE OLIVEIRA TORRES\tUUU-8F75\tUUH-3A45\tUUF-9H85\tSANTA LUZIA X MACEIO\t32514\t1001216423\t48\t34`;

interface EscalaProps {
  onBack?: () => void;
}

export default function Escala({ onBack }: EscalaProps) {
  const [activeTab, setActiveTab] = useState<'escala' | 'motoristas'>('escala');
  const [inputText, setInputText] = useState<string>('');
  const [includeHeaderInCopy, setIncludeHeaderInCopy] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [motoristas3C, setMotoristas3C] = useState<Motorista3C[]>([]);
  const [searchMotorista, setSearchMotorista] = useState<string>('');

  // Modal State for adding/editing driver
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Motorista3C | null>(null);
  const [formData, setFormData] = useState({ nome: '', cpf: '', rg: '' });

  // Modal State for viewing standardized destinations (58)
  const [isDestinosModalOpen, setIsDestinosModalOpen] = useState<boolean>(false);

  // Toggle for showing/hiding Section 2 (Padrões da Planilha) - Default HIDDEN (oculto)
  const [showDefaults, setShowDefaults] = useState<boolean>(false);

  // Toggle for showing/hiding Table Preview (31 Colunas) - Default HIDDEN (oculto)
  const [showTablePreview, setShowTablePreview] = useState<boolean>(false);

  // Helper to get current time string HH:mm:ss
  const getCurrentTimeString = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Global default configuration for auto-filling
  const [defaults, setDefaults] = useState({
    transportador: '3C',
    modeloCavalo: 'TRUCADO',
    modeloCarreta2: 'RODOTREM BAÚ',
    modeloCarreta1: 'BAÚ',
    categoria: 'FROTA',
    tecnologia: 'SASCAR',
    status: 'LIBERADO CARREGAMENTO',
    horaLiberado: getCurrentTimeString(),
    contatoWhats: 'X',
    fezContato: 'SIM',
    vigenciaCadastro: 'FROTA 3C',
    codigoTransportadora: '1000000496',
    estadoMotorista: 'FROTA 3C',
    estadoCavalo: 'FROTA 3C',
    estadoCarreta: 'FROTA 3C'
  });

  // Subscribe to checklist database for status lookup by Cavalo plate
  useEffect(() => {
    try {
      const checklistRef = ref(rtdb, 'checklist_veiculos');
      const unsubscribe = onValue(checklistRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          }));
          setChecklistItems(list);
        } else {
          setChecklistItems([]);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error('Erro ao conectar ao checklist:', err);
    }
  }, []);

  // Subscribe to Motoristas 3C database & seed if empty
  useEffect(() => {
    try {
      const motoristasRef = ref(rtdb, 'motoristas_3c');
      const unsubscribe = onValue(motoristasRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          }));
          setMotoristas3C(list);
        } else {
          // Seed initial 27 drivers if empty in database
          INITIAL_MOTORISTAS_3C.forEach((item) => {
            push(motoristasRef, item);
          });
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error('Erro ao conectar aos motoristas 3C:', err);
    }
  }, []);

  // Calculate checklist status for a given plate
  const getPlateChecklistStatus = (plate: string) => {
    if (!plate || !plate.trim()) {
      return { status: 'none', label: 'Sem Placa', bgClass: '', badgeClass: '', borderCell: '' };
    }

    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const match = checklistItems.find(item => {
      const c = (item.cavalo || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return c === cleanPlate;
    });

    if (!match) {
      return { 
        status: 'none', 
        label: 'Sem Checklist Cadastrado', 
        bgClass: 'bg-[#2D1A10]', 
        badgeClass: 'bg-slate-200 text-slate-700 border-slate-300',
        borderCell: ''
      };
    }

    if (match.statusOverride === 'VENCIDO' || match.statusOverride === 'NEGATIVADO' || match.statusOverride === 'REPROVADO') {
      return {
        status: 'vencido',
        label: `CHECKLIST VENCIDO / ${match.statusOverride}`,
        bgClass: 'bg-rose-600 text-white font-black',
        badgeClass: 'bg-rose-700 text-white font-black border-rose-800 shadow-sm',
        borderCell: 'border-l-4 border-l-rose-600 bg-rose-100/80'
      };
    }

    if (match.dataVencimento) {
      let expiryDate: Date | null = null;
      try {
        expiryDate = parseISO(match.dataVencimento);
        if (isNaN(expiryDate.getTime())) {
          const parts = match.dataVencimento.split('/');
          if (parts.length === 3) {
            expiryDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        }
      } catch (e) {
        expiryDate = null;
      }

      if (expiryDate && !isNaN(expiryDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);
        exp.setHours(0, 0, 0, 0);

        const diff = differenceInDays(exp, today);

        if (diff < 0) {
          return {
            status: 'vencido',
            label: `CHECKLIST VENCIDO (Há ${Math.abs(diff)} dias)`,
            bgClass: 'bg-rose-600 text-white font-black',
            badgeClass: 'bg-rose-700 text-white font-black border-rose-800 shadow-sm',
            borderCell: 'border-l-4 border-l-rose-600 bg-rose-100/90'
          };
        }
        if (diff <= 2) {
          return {
            status: 'a_vencer',
            label: diff === 0 ? 'CHECKLIST VENCE HOJE!' : `CHECKLIST PARA VENCER EM ${diff} DIA(S)`,
            bgClass: 'bg-amber-400 text-amber-950 font-black',
            badgeClass: 'bg-amber-500 text-amber-950 font-black border-amber-600 shadow-sm',
            borderCell: 'border-l-4 border-l-amber-500 bg-amber-100/90'
          };
        }
        return {
          status: 'ok',
          label: `CHECKLIST OK (Vence em ${diff} dias)`,
          bgClass: 'bg-emerald-600 text-white font-black',
          badgeClass: 'bg-emerald-700 text-white font-black border-emerald-800 shadow-sm',
          borderCell: 'border-l-4 border-l-emerald-600 bg-emerald-100/80'
        };
      }
    }

    return {
      status: 'ok',
      label: 'CHECKLIST OK',
      bgClass: 'bg-emerald-600 text-white font-black',
      badgeClass: 'bg-emerald-700 text-white font-black border-emerald-800 shadow-sm',
      borderCell: 'border-l-4 border-l-emerald-600 bg-emerald-100/80'
    };
  };

  // Helper to extract checklist expiry date string and pendencia status for columns AF and AG
  const getChecklistDetails = (cavaloPlate: string, carretaPlate?: string): { checkList: string; pendencia: string } => {
    if (!cavaloPlate && !carretaPlate) return { checkList: '', pendencia: '' };
    const cleanCav = (cavaloPlate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanCar = (carretaPlate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const match = checklistItems.find(item => {
      const c = (item.cavalo || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const car = (item.carretas || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return (cleanCav && c === cleanCav) || (cleanCar && car && car.includes(cleanCar));
    });

    if (!match) return { checkList: 'SEM CHECKLIST', pendencia: '' };

    let checkList = '';
    let isVencido = false;

    if (match.statusOverride === 'VENCIDO' || match.statusOverride === 'NEGATIVADO' || match.statusOverride === 'REPROVADO') {
      isVencido = true;
    }

    if (match.dataVencimento) {
      const raw = match.dataVencimento.trim();
      let expiryDate: Date | null = null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-');
        checkList = `${d}/${m}/${y}`;
        expiryDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
        checkList = raw;
        const [d, m, y] = raw.split('/');
        expiryDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      } else {
        checkList = raw;
      }

      if (expiryDate && !isNaN(expiryDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);
        exp.setHours(0, 0, 0, 0);

        if (exp < today) {
          isVencido = true;
        }
      }
    } else if (match.statusOverride) {
      checkList = match.statusOverride;
    } else {
      checkList = 'SEM CHECKLIST';
    }

    return {
      checkList: checkList || 'SEM CHECKLIST',
      pendencia: isVencido ? 'CHECKLIST' : ''
    };
  };

  // Helper to extract checklist expiry date string for column 33
  const getChecklistExpiryStr = (cavaloPlate: string, carretaPlate?: string): string => {
    return getChecklistDetails(cavaloPlate, carretaPlate).checkList;
  };

  // Helper to format license plate with hyphen e.g. POZ4431 -> POZ-4431, UUO8D35 -> UUO-8D35
  const formatPlateWithHyphen = (plateStr: string): string => {
    if (!plateStr) return '';
    const trimmed = plateStr.trim().toUpperCase();
    if (trimmed.includes('-')) {
      return trimmed;
    }
    const clean = trimmed.replace(/[^A-Z0-9]/g, '');
    if (/^[A-Z]{3}[A-Z0-9]{4}$/.test(clean)) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    return trimmed;
  };

  // Helper to get current date formatted dd/MM/yyyy
  const getTodayDateStr = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper to get current day of week in Portuguese (e.g., sábado)
  const getTodayDayOfWeek = (): string => {
    const now = new Date();
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    return days[now.getDay()] || 'sábado';
  };

  // Calculate day of week string in Portuguese
  const getDayOfWeek = (dateStr: string): string => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        return days[date.getDay()] || 'quinta-feira';
      }
    } catch (e) {
      // fallback
    }
    return 'quinta-feira';
  };

  // Get month abbreviation with pipe e.g. "SET|26" or "OUT|26"
  const getMonthAbbrev = (dateStr: string): string => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const year = parts[2].slice(-2);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mStr = months[month - 1] || 'SET';
        return `${mStr}|${year}`;
      }
    } catch (e) {
      // fallback
    }
    return 'SET|26';
  };

  // Find 3C Driver matching name
  const findDriver3C = (driverName: string): Motorista3C | null => {
    if (!driverName || !driverName.trim()) return null;
    const clean = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
    const target = clean(driverName);

    return motoristas3C.find(m => {
      const mNorm = clean(m.nome);
      return mNorm === target || (target.length > 5 && (mNorm.includes(target) || target.includes(mNorm)));
    }) || null;
  };

  // Parse input pasted lines into structured 31-column DispoRow objects
  const parsedRows = useMemo<DispoRow[]>(() => {
    if (!inputText.trim()) return [];

    const todayDateStr = getTodayDateStr();
    const todayDayOfWeek = getTodayDayOfWeek();
    const todayMonth = getMonthAbbrev(todayDateStr);

    const lines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const rows: DispoRow[] = [];

    lines.forEach((line, index) => {
      // Ignore header if pasted
      const upper = line.toUpperCase();
      if (upper.includes('DATA DA SAÍDA') || upper.includes('MOTORISTA') || upper.includes('PALETIZAÇÃO')) {
        return;
      }

      // Split by tab first, fallback to multiple spaces or semicolon
      let cols = line.split('\t').map(c => c.trim());
      if (cols.length < 3) {
        cols = line.split(';').map(c => c.trim());
      }
      if (cols.length < 3) {
        cols = line.split(/\s{2,}/).map(c => c.trim());
      }

      if (cols.length < 2) return;

      // Extract fields based on order in image.png:
      // 0: DATA DA SAÍDA
      // 1: MOTORISTA
      // 2: PLACA (Cavalo)
      // 3: BAÚ 1
      // 4: BAÚ 2
      // 5: TRECHO
      // 6: MATRICULA
      // 7: COD. SAP
      // 8: Paletização
      // 9: TON
      const motorista = cols[1] || '';
      const rawPlacaCavalo = cols[2] || '';
      const rawBau1 = cols[3] || '';
      const rawBau2 = cols[4] || '';
      const trecho = cols[5] || '';
      const matricula = cols[6] || '';
      const codSap = cols[7] || '';
      const rawPallets = cols[8] || '48';
      const rawTon = cols[9] || '34';

      const placaCavalo = formatPlateWithHyphen(rawPlacaCavalo);
      const bau1 = formatPlateWithHyphen(rawBau1);
      const bau2 = formatPlateWithHyphen(rawBau2);

      // Always format Santa Luzia as "SANTA LUZIA|MG" (Fixed requirement)
      const origem = 'SANTA LUZIA|MG';
      let destino = '';

      if (trecho) {
        const trechoParts = trecho.split(/\s+X\s+|\s+x\s+|X|x/);
        if (trechoParts.length >= 2) {
          destino = normalizeDestino(trechoParts[1].trim());
        } else {
          destino = normalizeDestino(trecho);
        }
      }

      // Auto-match CPF and RG from Motoristas 3C database
      let matchedCPF = '';
      let matchedRG = '';
      const matched3CDriver = findDriver3C(motorista);
      if (matched3CDriver) {
        matchedCPF = matched3CDriver.cpf || '';
        matchedRG = matched3CDriver.rg || '';
      }

      // RG / SAP combined (When Motoristas 3C has RG/SAP filled, use ONLY that info directly)
      let rgSap = '';
      if (matchedRG) {
        rgSap = matchedRG;
      } else if (codSap) {
        rgSap = codSap;
      }

      const currentTime = getCurrentTimeString();
      const isTwoBaus = Boolean(bau1 && bau2);

      if (isTwoBaus) {
        // Divide Pallets & Ton half-and-half between Baú 1 and Baú 2
        const numP = parseFloat(rawPallets);
        const palletsHalf = !isNaN(numP) ? String(Math.round(numP / 2)) : rawPallets;

        const numT = parseFloat(rawTon);
        const tonHalf = !isNaN(numT) ? String(numT / 2) : rawTon;

        let m3Half = '43.5 m³';
        if (!isNaN(numT / 2)) {
          const halfVal = numT / 2;
          if (halfVal >= 20) m3Half = '55 m³';
          else m3Half = '43.5 m³';
        }

        const chkDetails1 = getChecklistDetails(placaCavalo, bau1);
        const chkDetails2 = getChecklistDetails(placaCavalo, bau2);

        // Row 1 for Baú 1
        const row1: DispoRow = {
          id: `row-${index}-bau1-${Date.now()}`,
          mes: todayMonth,
          origem: origem.toUpperCase(),
          dia: todayDayOfWeek,
          data: todayDateStr,
          contatoWhats: 'X',
          horaLiberado: currentTime,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta2, // RODOTREM BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador, // Always "3C" by default
          cavalo: formatPlateWithHyphen(placaCavalo),
          carreta: formatPlateWithHyphen(bau1),
          pallets: palletsHalf,
          ton: tonHalf,
          m3: '',
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: matchedCPF,
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: 'FROTA 3C',
          estadoCavalo: 'FROTA 3C',
          estadoCarreta: 'FROTA 3C',
          checkList: chkDetails1.checkList,
          pendencia: chkDetails1.pendencia
        };

        // Row 2 for Baú 2
        const row2: DispoRow = {
          id: `row-${index}-bau2-${Date.now()}`,
          mes: todayMonth,
          origem: origem.toUpperCase(),
          dia: todayDayOfWeek,
          data: todayDateStr,
          contatoWhats: 'X',
          horaLiberado: currentTime,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta2, // RODOTREM BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador, // Always "3C" by default
          cavalo: formatPlateWithHyphen(placaCavalo),
          carreta: formatPlateWithHyphen(bau2),
          pallets: palletsHalf,
          ton: tonHalf,
          m3: '',
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: matchedCPF,
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: 'FROTA 3C',
          estadoCavalo: 'FROTA 3C',
          estadoCarreta: 'FROTA 3C',
          checkList: chkDetails2.checkList,
          pendencia: chkDetails2.pendencia
        };

        rows.push(row1, row2);
      } else {
        // Single Baú
        const singleCarreta = bau1 || bau2;
        const chkDetails = getChecklistDetails(placaCavalo, singleCarreta);

        const row: DispoRow = {
          id: `row-${index}-${Date.now()}`,
          mes: todayMonth,
          origem: origem.toUpperCase(),
          dia: todayDayOfWeek,
          data: todayDateStr,
          contatoWhats: 'X',
          horaLiberado: currentTime,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta1, // BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador, // Always "3C" by default
          cavalo: formatPlateWithHyphen(placaCavalo),
          carreta: formatPlateWithHyphen(singleCarreta),
          pallets: rawPallets,
          ton: rawTon,
          m3: '',
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: matchedCPF,
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: 'FROTA 3C',
          estadoCavalo: 'FROTA 3C',
          estadoCarreta: 'FROTA 3C',
          checkList: chkDetails.checkList,
          pendencia: chkDetails.pendencia
        };

        rows.push(row);
      }
    });

    return rows;
  }, [inputText, defaults, motoristas3C, checklistItems]);

  // Editable rows state
  const [editableRows, setEditableRows] = useState<DispoRow[]>([]);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [copyToastMessage, setCopyToastMessage] = useState<string | null>(null);

  // Update editableRows when parsedRows change
  useEffect(() => {
    setEditableRows(parsedRows);
  }, [parsedRows]);

  // Handle cell edit
  const handleCellEdit = (rowId: string, field: keyof DispoRow, value: string) => {
    setEditableRows(prev =>
      prev.map(r => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        if (field === 'conductor') {
          const matched3CDriver = findDriver3C(value);
          if (matched3CDriver) {
            if (matched3CDriver.cpf) updated.cpf = matched3CDriver.cpf;
            if (matched3CDriver.rg) updated.rgSap = matched3CDriver.rg;
          }
        } else if (field === 'cavalo' || field === 'carreta') {
          const cav = field === 'cavalo' ? formatPlateWithHyphen(value) : formatPlateWithHyphen(r.cavalo);
          const car = field === 'carreta' ? formatPlateWithHyphen(value) : formatPlateWithHyphen(r.carreta);
          updated.cavalo = cav;
          updated.carreta = car;
          const chk = getChecklistDetails(cav, car);
          updated.checkList = chk.checkList;
          updated.pendencia = chk.pendencia;
        }
        return updated;
      })
    );
  };

  // Helper to convert a single DispoRow object into 33-column TSV string (Colunas A a AG)
  const getRowTSV = (row: DispoRow): string => {
    return [
      row.mes,                  // 1 (A)
      row.origem,               // 2 (B)
      row.dia,                  // 3 (C)
      row.data,                 // 4 (D)
      row.contatoWhats,         // 5 (E)
      row.horaLiberado,         // 6 (F)
      row.status,               // 7 (G)
      row.modeloCarreta,        // 8 (H)
      row.modeloCavalo,         // 9 (I)
      row.fezContato,           // 10 (J)
      row.destino,              // 11 (K)
      row.transportador,        // 12 (L)
      formatPlateWithHyphen(row.cavalo),  // 13 (M)
      formatPlateWithHyphen(row.carreta), // 14 (N)
      row.pallets,              // 15 (O)
      row.ton,                  // 16 (P)
      row.m3,                   // 17 (Q)
      row.categoria,            // 18 (R)
      row.tecnologia,           // 19 (S)
      row.conductor,            // 20 (T)
      row.cpf,                  // 21 (U)
      row.rgSap,                // 22 (V)
      row.cnh,                  // 23 (W)
      row.telefone,             // 24 (X)
      row.vigenciaCadastro,     // 25 (Y)
      row.codigoTransportadora, // 26 (Z)
      row.idCarga,              // 27 (AA - ID da Carga / Lacre Exportação)
      row.estadoMotorista,      // 28 (AB)
      row.estadoCavalo,         // 29 (AC)
      row.estadoCarreta,        // 30 (AD)
      '',                       // 31 (AE - Vazia)
      row.pendencia || '',      // 32 (AF - Pendência: "CHECKLIST" quando vencido)
      row.checkList             // 33 (AG - Check List / Validade dos veículos puxada do Checklist)
    ].join('\t');
  };

  // Convert rows to TSV string for copying (pure plain text without formatting or headers by default)
  const generateTSV = (includeHeader: boolean): string => {
    const lines: string[] = [];

    if (includeHeader) {
      lines.push(DISPO_COLUMNS.join('\t'));
    }

    editableRows.forEach(row => {
      lines.push(getRowTSV(row));
    });

    return lines.join('\n');
  };

  // Copy single row
  const handleCopySingleRow = async (row: DispoRow) => {
    const lineText = getRowTSV(row);
    try {
      await navigator.clipboard.writeText(lineText);
      setCopiedRowId(row.id);
      setCopyToastMessage(`Linha de "${row.conductor || 'Motorista'}" (${row.cavalo || 'Sem Placa'}) copiada!`);
      setTimeout(() => {
        setCopiedRowId(null);
        setCopyToastMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Erro ao copiar linha:', err);
    }
  };

  // Copy a whole conjunto (set of rows for a truck/driver)
  const handleCopyConjunto = async (rowsToCopy: DispoRow[], label: string) => {
    const tsv = rowsToCopy.map(r => getRowTSV(r)).join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedRowId(rowsToCopy[0]?.id || 'conjunto');
      setCopyToastMessage(`Conjunto de "${label}" copiado (${rowsToCopy.length} linha${rowsToCopy.length > 1 ? 's' : ''})!`);
      setTimeout(() => {
        setCopiedRowId(null);
        setCopyToastMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Erro ao copiar conjunto:', err);
    }
  };

  // Group rows into Conjuntos (by Conductor + Cavalo + Data)
  const conjuntosList = useMemo(() => {
    const groups: {
      id: string;
      conductor: string;
      cavalo: string;
      destino: string;
      rows: DispoRow[];
    }[] = [];

    editableRows.forEach((row) => {
      const cond = (row.conductor || '').trim().toUpperCase() || 'SEM_MOTORISTA';
      const cav = (row.cavalo || '').trim().toUpperCase() || 'SEM_CAVALO';
      const key = `${cond}_${cav}_${row.data}`;
      
      let group = groups.find(g => g.id === key);
      if (!group) {
        group = {
          id: key,
          conductor: row.conductor || 'MOTORISTA N/I',
          cavalo: row.cavalo || 'SEM PLACA',
          destino: row.destino || 'DESTINO N/I',
          rows: []
        };
        groups.push(group);
      }
      group.rows.push(row);
    });

    return groups;
  }, [editableRows]);

  // Copy TSV to clipboard
  const handleCopyToClipboard = async () => {
    const tsvText = generateTSV(includeHeaderInCopy);
    try {
      await navigator.clipboard.writeText(tsvText);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 4000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Export as CSV File (with UTF-8 BOM)
  const handleExportCSV = () => {
    const tsvText = generateTSV(true);
    // Replace tabs with semicolons for PT-BR Excel CSV standard
    const csvLines = tsvText.split('\n').map(line => line.split('\t').map(val => `"${val.replace(/"/g, '""')}"`).join(';'));
    const csvContent = '\uFEFF' + csvLines.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, `ESCALA_DISPONIBILIDADE_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Add new empty row
  const handleAddRow = () => {
    const todayDateStr = getTodayDateStr();
    const todayDayOfWeek = getTodayDayOfWeek();
    const todayMonth = getMonthAbbrev(todayDateStr);

    const newRow: DispoRow = {
      id: `manual-${Date.now()}`,
      mes: todayMonth,
      origem: 'SANTA LUZIA|MG',
      dia: todayDayOfWeek,
      data: todayDateStr,
      contatoWhats: 'X',
      horaLiberado: getCurrentTimeString(),
      status: defaults.status,
      modeloCarreta: defaults.modeloCarreta2,
      modeloCavalo: defaults.modeloCavalo,
      fezContato: defaults.fezContato,
      destino: 'NATAL',
      transportador: defaults.transportador,
      cavalo: '',
      carreta: '',
      pallets: '24',
      ton: '17',
      m3: '',
      categoria: defaults.categoria,
      tecnologia: defaults.tecnologia,
      conductor: '',
      cpf: '',
      rgSap: '',
      cnh: '',
      telefone: '',
      vigenciaCadastro: defaults.vigenciaCadastro,
      codigoTransportadora: defaults.codigoTransportadora,
      idCarga: '',
      estadoMotorista: 'FROTA 3C',
      estadoCavalo: 'FROTA 3C',
      estadoCarreta: 'FROTA 3C',
      checkList: '',
      pendencia: ''
    };
    setEditableRows(prev => [...prev, newRow]);
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    setEditableRows(prev => prev.filter(r => r.id !== rowId));
  };

  // Motoristas 3C CRUD actions
  const handleOpenAddMotoristaModal = () => {
    setEditingDriver(null);
    setFormData({ nome: '', cpf: '', rg: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditMotoristaModal = (driver: Motorista3C) => {
    setEditingDriver(driver);
    setFormData({ nome: driver.nome, cpf: driver.cpf, rg: driver.rg });
    setIsModalOpen(true);
  };

  const handleSaveMotorista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    try {
      const motoristasRef = ref(rtdb, 'motoristas_3c');
      if (editingDriver) {
        const itemRef = ref(rtdb, `motoristas_3c/${editingDriver.id}`);
        await update(itemRef, {
          nome: formData.nome.toUpperCase().trim(),
          cpf: formData.cpf.trim(),
          rg: formData.rg.toUpperCase().trim()
        });
      } else {
        await push(motoristasRef, {
          nome: formData.nome.toUpperCase().trim(),
          cpf: formData.cpf.trim(),
          rg: formData.rg.toUpperCase().trim()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar motorista:', err);
    }
  };

  const handleDeleteMotorista = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o motorista "${name}"?`)) {
      try {
        const itemRef = ref(rtdb, `motoristas_3c/${id}`);
        await remove(itemRef);
      } catch (err) {
        console.error('Erro ao remover motorista:', err);
      }
    }
  };

  // Filtered Motoristas 3C list
  const filteredMotoristas = useMemo(() => {
    if (!searchMotorista.trim()) return motoristas3C;
    const q = searchMotorista.toLowerCase();
    return motoristas3C.filter(
      m => m.nome.toLowerCase().includes(q) || m.cpf.includes(q) || m.rg.toLowerCase().includes(q)
    );
  }, [motoristas3C, searchMotorista]);

  // Calculate totals for KPI summary
  const totalPallets = editableRows.reduce((acc, r) => acc + (parseInt(r.pallets, 10) || 0), 0);
  const totalTon = editableRows.reduce((acc, r) => acc + (parseFloat(r.ton) || 0), 0);
  const uniqueDestinations = Array.from(new Set(editableRows.map(r => r.destino).filter(Boolean)));

  return (
    <div className="w-full max-w-[102rem] mx-auto p-4 sm:p-6 space-y-6 text-[#2D1A10]">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-[#2D1A10] via-[#3d2417] to-[#1c100a] text-[#fdefd1] rounded-3xl p-6 sm:p-8 border-[3px] border-[#8c6039]/40 shadow-2xl relative overflow-hidden">
        {/* Screw rivets */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md" />
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md" />
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md" />
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#dfc1a0] to-[#3a200a] shadow-md" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3 bg-[#1c100a] hover:bg-[#3d2417] text-[#fdefd1] border border-[#8c6039]/50 rounded-2xl transition-all cursor-pointer shadow-md hover:scale-105"
                title="Voltar ao Menu"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-[#B32025] text-white text-[10px] font-black uppercase tracking-widest border border-red-400/30 flex items-center gap-1.5 shadow-sm">
                  <FileSpreadsheet size={13} />
                  Módulo Escala
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Transportador: 3C
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  SANTA LUZIA|MG
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white uppercase">
                Escala 3C
              </h1>
              <p className="text-xs sm:text-sm text-[#dac0a3] mt-1 font-sans">
                Desmembramento automático de baús, Origem fixa (<strong className="text-[#fdefd1]">SANTA LUZIA|MG</strong>), preenchimento de CPF/RG dos motoristas 3C e cópia de 33 colunas (preservando a Coluna <strong className="text-amber-300">AJ - DIAS</strong> intacta).
              </p>
            </div>
          </div>

          {/* Quick Action Copy Button on Top Header */}
          {activeTab === 'escala' && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCopyToClipboard}
                disabled={editableRows.length === 0}
                className={cn(
                  "px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2.5 border-2",
                  copiedStatus
                    ? "bg-emerald-600 text-white border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105"
                    : editableRows.length === 0
                      ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:brightness-110 text-white border-amber-300 shadow-[0_8px_20px_rgba(179,32,37,0.5)] active:scale-98"
                )}
              >
                {copiedStatus ? (
                  <>
                    <Check size={18} className="stroke-[3]" />
                    <span>Dados Copiados! (Somente Conteúdo)</span>
                  </>
                ) : (
                  <>
                    <Clipboard size={18} />
                    <span>Copiar para Planilha de Disponibilidade</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#8c6039]/30">
          <button
            onClick={() => setActiveTab('escala')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'escala'
                ? "bg-[#fdefd1] text-[#2D1A10] shadow-md scale-102"
                : "bg-[#1c100a]/60 text-[#dac0a3] hover:bg-[#3d2417] hover:text-white"
            )}
          >
            <FileSpreadsheet size={16} />
            <span>1. Conversor de Escala</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#B32025] text-white text-[10px] font-mono font-bold">
              {editableRows.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('motoristas')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'motoristas'
                ? "bg-[#fdefd1] text-[#2D1A10] shadow-md scale-102"
                : "bg-[#1c100a]/60 text-[#dac0a3] hover:bg-[#3d2417] hover:text-white"
            )}
          >
            <Users size={16} />
            <span>2. Motoristas 3C</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-[10px] font-mono font-bold">
              {motoristas3C.length}
            </span>
          </button>

          <button
            onClick={() => setIsDestinosModalOpen(true)}
            className="ml-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer bg-blue-950/80 hover:bg-blue-900 text-blue-100 border border-blue-400/30 hover:border-blue-300 shadow-md"
            title="Visualizar a lista completa de 58 destinos padronizados"
          >
            <MapPin size={16} className="text-blue-300" />
            <span>Destinos Padrão (58)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'escala' ? (
        <>
          {/* Copy Alert Banner */}
          <AnimatePresence>
            {copiedStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="p-4 bg-emerald-900/90 border-2 border-emerald-400 text-emerald-100 rounded-2xl shadow-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black">
                    <Check size={22} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-white">
                      Dados copiados em formato tabular ({editableRows.length} linhas sem cabeçalho)!
                    </h4>
                    <p className="text-xs text-emerald-200">
                      Abra a sua planilha de Disponibilidade, selecione a primeira célula da linha de dados (<strong className="text-white">MÊS</strong>) e pressione <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-emerald-400/40 text-white font-mono">Ctrl + V</kbd>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCopiedStatus(false)}
                  className="text-xs text-emerald-300 hover:text-white font-bold uppercase underline cursor-pointer"
                >
                  Fechar
                </button>
              </motion.div>
            )}

            {copyToastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="p-3.5 bg-slate-900 border-2 border-amber-400 text-amber-100 rounded-2xl shadow-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wide text-white">
                      {copyToastMessage}
                    </h4>
                    <p className="text-[11px] text-amber-200">
                      Copiado em formato de colunas (TSV). Pronto para colar na planilha com <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-amber-400/40 text-white font-mono">Ctrl + V</kbd>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCopyToastMessage(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold uppercase cursor-pointer"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid: Left Paste Box & Right Default Configs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Textarea Paste Area (full width when defaults are hidden) */}
            <div className={cn(
              "bg-[#FAF8F5] border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between transition-all",
              showDefaults ? "lg:col-span-7" : "lg:col-span-12"
            )}>
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#3A2414] text-[#fdefd1] flex items-center justify-center font-bold">
                      <Clipboard size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-black uppercase tracking-tight text-[#2D1A10]">
                        1. Cole os Dados da Escala
                      </h3>
                      <p className="text-xs text-slate-600">
                        Copie a tabela da imagem/planilha e cole no campo abaixo.
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInputText(SAMPLE_INPUT_TEXT)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Carregar exemplo da imagem anexa"
                    >
                      <Sparkles size={14} className="text-[#B32025]" />
                      <span>Exemplo com Motoristas 3C</span>
                    </button>

                    <button
                      onClick={() => setInputText('')}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Limpar campo"
                    >
                      <Trash2 size={14} />
                      <span>Limpar</span>
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Cole aqui as linhas copiadas da tabela de escala..."
                    rows={7}
                    className="w-full bg-white border-2 border-[#3A2414]/30 rounded-2xl p-4 font-mono text-xs text-[#2D1A10] placeholder-slate-400 focus:outline-none focus:border-[#B32025] transition-colors shadow-inner resize-y leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white font-mono text-[10px] font-bold">
                    {editableRows.length} linha(s) final(is)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
                <span>
                  Status: <strong className="text-emerald-700 font-bold">{editableRows.length} linhas prontas</strong>
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] uppercase text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-amber-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeHeaderInCopy}
                      onChange={(e) => setIncludeHeaderInCopy(e.target.checked)}
                      className="rounded text-[#B32025] focus:ring-[#B32025] w-4 h-4 cursor-pointer"
                    />
                    <span>Incluir linha de cabeçalho ao copiar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Default Operational Configs (5 cols) - HIDDEN BY DEFAULT */}
            {showDefaults && (
              <div className="lg:col-span-5 bg-[#FAF8F5] border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#B32025] text-white flex items-center justify-center font-bold">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black uppercase tracking-tight text-[#2D1A10]">
                      2. Padrões da Planilha
                    </h3>
                    <p className="text-xs text-slate-600">
                      Ajuste as propriedades padrão pré-preenchidas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Transportador */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Transportador
                    </label>
                    <input
                      type="text"
                      value={defaults.transportador}
                      onChange={(e) => setDefaults(prev => ({ ...prev, transportador: e.target.value }))}
                      className="w-full bg-amber-50 border-2 border-amber-400 rounded-xl px-3 py-2 font-black text-amber-950 focus:outline-none focus:border-[#B32025]"
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Categoria (FROTA)
                    </label>
                    <select
                      value={defaults.categoria}
                      onChange={(e) => setDefaults(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full bg-white border-2 border-purple-300 rounded-xl px-3 py-2 font-black text-purple-900 focus:outline-none focus:border-[#B32025]"
                    >
                      <option value="FROTA">FROTA</option>
                      <option value="AGREGADO">AGREGADO</option>
                      <option value="AUTÔNOMO">AUTÔNOMO</option>
                    </select>
                  </div>

                  {/* Tecnologia */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Tecnologia (SASCAR)
                    </label>
                    <select
                      value={defaults.tecnologia}
                      onChange={(e) => setDefaults(prev => ({ ...prev, tecnologia: e.target.value }))}
                      className="w-full bg-white border-2 border-cyan-300 rounded-xl px-3 py-2 font-black text-cyan-900 focus:outline-none focus:border-[#B32025]"
                    >
                      <option value="SASCAR">SASCAR</option>
                      <option value="ONIXSAT">ONIXSAT</option>
                      <option value="AUTOTRAC">AUTOTRAC</option>
                    </select>
                  </div>

                  {/* Modelo Cavalo */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Modelo Cavalo
                    </label>
                    <select
                      value={defaults.modeloCavalo}
                      onChange={(e) => setDefaults(prev => ({ ...prev, modeloCavalo: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
                    >
                      <option value="TRUCADO">TRUCADO</option>
                      <option value="TOCO">TOCO</option>
                      <option value="TRUCK">TRUCK</option>
                    </select>
                  </div>

                  {/* Modelo Carreta (2 Baús) */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Modelo (2 Baús)
                    </label>
                    <select
                      value={defaults.modeloCarreta2}
                      onChange={(e) => setDefaults(prev => ({ ...prev, modeloCarreta2: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
                    >
                      <option value="RODOTREM BAÚ">RODOTREM BAÚ</option>
                      <option value="RODOTREM SIDER">RODOTREM SIDER</option>
                      <option value="RODOTREM">RODOTREM</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value={defaults.status}
                      onChange={(e) => setDefaults(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
                    />
                  </div>

                  {/* Hora Liberado */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Hora Liberado
                    </label>
                    <input
                      type="text"
                      value={defaults.horaLiberado}
                      onChange={(e) => setDefaults(prev => ({ ...prev, horaLiberado: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
                    />
                  </div>

                  {/* Vigência do Cadastro */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                      Vigência Cadastro
                    </label>
                    <input
                      type="text"
                      value={defaults.vigenciaCadastro}
                      onChange={(e) => setDefaults(prev => ({ ...prev, vigenciaCadastro: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
                    />
                  </div>
                </div>

                {/* Checklist Legend Box */}
                <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-700 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-black uppercase text-[10px] text-amber-400">
                    <ShieldAlert size={14} />
                    <span>Legenda da Validação do Checklist (Cavalo):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center">
                    <div className="p-1 rounded bg-rose-600 text-white uppercase shadow-xs">
                      🔴 Vencido
                    </div>
                    <div className="p-1 rounded bg-amber-400 text-amber-950 uppercase shadow-xs">
                      🟡 Vence em até 2 dias
                    </div>
                    <div className="p-1 rounded bg-emerald-600 text-white uppercase shadow-xs">
                      🟢 Checklist OK
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Conjuntos (Veículos / Viagens) Section - Copiar por Conjunto */}
          {conjuntosList.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/10 via-amber-900/5 to-amber-950/10 border-2 border-amber-800/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-800/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold shadow-md shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black uppercase tracking-tight text-[#2D1A10] flex items-center gap-2">
                      Copiar por Conjunto Individual ({conjuntosList.length} {conjuntosList.length === 1 ? 'Conjunto' : 'Conjuntos'})
                    </h3>
                    <p className="text-xs text-slate-600">
                      Lista de veículos e motoristas agrupados. Clique em "Copiar Conjunto" para copiar individualmente.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-200/90 text-amber-950 border border-amber-300/80 shadow-2xs self-start sm:self-auto shrink-0">
                  {editableRows.length} {editableRows.length === 1 ? 'linha' : 'linhas'} em {conjuntosList.length} {conjuntosList.length === 1 ? 'conjunto' : 'conjuntos'}
                </span>
              </div>

              {/* Vertical List of Conjuntos */}
              <div className="flex flex-col gap-3">
                {conjuntosList.map((conjunto, cIdx) => {
                  const isMultiRow = conjunto.rows.length > 1;
                  const firstRowId = conjunto.rows[0]?.id;
                  const isCopied = copiedRowId === firstRowId;

                  const carretasArr = Array.from(new Set(conjunto.rows.map(r => r.carreta).filter(Boolean)));
                  const carretasStr = carretasArr.length > 0 ? carretasArr.join(' + ') : 'SEM CARRETA';
                  const checkListStr = conjunto.rows.map(r => r.checkList).filter(Boolean).join(' / ') || 'N/A';

                  return (
                    <div
                      key={conjunto.id}
                      className="bg-white border-2 border-slate-200/90 hover:border-amber-600/60 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      {/* Left Info Column */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-black uppercase text-amber-900 bg-amber-100/90 border border-amber-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                            Conjunto #{cIdx + 1}
                          </span>
                          <span className={cn(
                            "text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg uppercase border shadow-2xs",
                            isMultiRow 
                              ? "bg-purple-100 text-purple-900 border-purple-300 font-black" 
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          )}>
                            {isMultiRow ? `Rodotrem (2 Linhas)` : `Baú Único (1 Linha)`}
                          </span>
                          {conjunto.rows[0]?.data && (
                            <span className="text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              Data: {conjunto.rows[0].data}
                            </span>
                          )}
                        </div>

                        {/* Driver Name Header */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                            <User size={14} className="stroke-[2.5]" />
                          </div>
                          <h4 className="text-sm font-black uppercase text-[#2D1A10] truncate" title={conjunto.conductor}>
                            {conjunto.conductor}
                          </h4>
                        </div>

                        {/* Vehicle & Route Badges */}
                        <div className="flex items-center gap-2 text-xs font-mono font-bold flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                            <span className="text-slate-500 font-normal">Cavalo:</span> {conjunto.cavalo}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                            <span className="text-slate-500 font-normal">Carreta:</span> {carretasStr}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                            <MapPin size={13} className="text-emerald-700" />
                            <span className="text-emerald-800/80 font-normal">Destino:</span> {conjunto.destino}
                          </span>
                          {checkListStr !== 'N/A' && (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                              <ShieldCheck size={13} className="text-blue-700" />
                              <span className="text-blue-800/80 font-normal">Check List:</span> {checkListStr}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <button
                        onClick={() => handleCopyConjunto(conjunto.rows, conjunto.conductor)}
                        className={cn(
                          "w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs border shrink-0",
                          isCopied
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md scale-102"
                            : "bg-[#2D1A10] hover:bg-[#B32025] text-[#fdefd1] hover:text-white border-[#3d2417] hover:border-red-400 active:scale-98"
                        )}
                      >
                        {isCopied ? (
                          <>
                            <Check size={16} className="stroke-[3]" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Copiar Conjunto ({conjunto.rows.length} {conjunto.rows.length === 1 ? 'Linha' : 'Linhas'})</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Table Preview Section */}
          <div className="bg-white border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-xl space-y-4">
            
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-serif font-black uppercase tracking-tight text-[#2D1A10] flex items-center gap-2">
                  <FileSpreadsheet className="text-[#B32025]" size={20} />
                  Pré-visualização da Tabela de Disponibilidade (33 Colunas)
                </h3>
                <p className="text-xs text-slate-600">
                  * Ao clicar em <strong className="text-[#B32025]">Copiar</strong>, apenas o conteúdo dos dados é copiado (sem cores e sem cabeçalho por padrão).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowTablePreview(prev => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  {showTablePreview ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showTablePreview ? 'Ocultar Tabela' : 'Mostrar Tabela (33 Colunas)'}</span>
                </button>

                <button
                  onClick={handleAddRow}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Adicionar Linha</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={editableRows.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>Baixar CSV / Excel</span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={editableRows.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#B32025] hover:bg-[#8c060a] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Clipboard size={15} />
                  <span>Copiar Dados ({editableRows.length} linhas)</span>
                </button>
              </div>
            </div>

            {/* Scrollable Spreadsheet Table */}
            {showTablePreview && (
              editableRows.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                  <FileSpreadsheet size={40} className="mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Nenhuma linha processada.</p>
                  <p className="text-xs text-slate-400">Cole os dados da escala no campo acima para gerar a tabela.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar border border-slate-200 rounded-2xl shadow-inner max-h-[580px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#2D1A10] text-[#fdefd1] sticky top-0 z-20 font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-[#8c6039]/40 text-center w-10">#</th>
                      {DISPO_COLUMNS.map((col, idx) => (
                        <th key={idx} className="p-3 border-b border-r border-[#8c6039]/40 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      <th className="p-3 border-b border-[#8c6039]/40 text-center whitespace-nowrap min-w-[110px]">Ação / Copiar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-sans">
                    {editableRows.map((row, idx) => {
                      const chkStatus = getPlateChecklistStatus(row.cavalo);
                      const isCopied = copiedRowId === row.id;

                      return (
                        <tr key={row.id} className="hover:bg-amber-50/60 transition-colors group">
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400 bg-slate-50">
                            {idx + 1}
                          </td>

                          {/* 1. MÊS */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-[#2D1A10]">
                            <input
                              type="text"
                              value={row.mes}
                              onChange={(e) => handleCellEdit(row.id, 'mes', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-xs"
                            />
                          </td>

                          {/* 2. ORIGEM */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-slate-800">
                            <input
                              type="text"
                              value={row.origem}
                              onChange={(e) => handleCellEdit(row.id, 'origem', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
                            />
                          </td>

                          {/* 3. DIA */}
                          <td className="p-1.5 border-r border-slate-200 text-slate-700">
                            <input
                              type="text"
                              value={row.dia}
                              onChange={(e) => handleCellEdit(row.id, 'dia', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-xs"
                            />
                          </td>

                          {/* 4. DATA */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-900">
                            <input
                              type="text"
                              value={row.data}
                              onChange={(e) => handleCellEdit(row.id, 'data', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 5. CONTATO WHATS */}
                          <td className="p-1.5 border-r border-slate-200 text-center font-bold text-emerald-700">
                            <input
                              type="text"
                              value={row.contatoWhats}
                              onChange={(e) => handleCellEdit(row.id, 'contatoWhats', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center text-xs"
                            />
                          </td>

                          {/* 6. HORA LIBERADO */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-slate-800">
                            <input
                              type="text"
                              value={row.horaLiberado}
                              onChange={(e) => handleCellEdit(row.id, 'horaLiberado', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 7. STATUS */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-emerald-800">
                            <input
                              type="text"
                              value={row.status}
                              onChange={(e) => handleCellEdit(row.id, 'status', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
                            />
                          </td>

                          {/* 8. MODELO CARRETA */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-slate-800">
                            <input
                              type="text"
                              value={row.modeloCarreta}
                              onChange={(e) => handleCellEdit(row.id, 'modeloCarreta', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
                            />
                          </td>

                          {/* 9. MODELO CAVALO */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-slate-800">
                            <input
                              type="text"
                              value={row.modeloCavalo}
                              onChange={(e) => handleCellEdit(row.id, 'modeloCavalo', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
                            />
                          </td>

                          {/* 10. FEZ CONTATO? */}
                          <td className="p-1.5 border-r border-slate-200 text-center font-bold text-emerald-700">
                            <input
                              type="text"
                              value={row.fezContato}
                              onChange={(e) => handleCellEdit(row.id, 'fezContato', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center text-xs"
                            />
                          </td>

                          {/* 11. DESTINO */}
                          <td className="p-1.5 border-r border-slate-200 font-black text-blue-900 bg-blue-50/40">
                            <input
                              type="text"
                              list="destinos-padrao-list"
                              value={row.destino}
                              onChange={(e) => handleCellEdit(row.id, 'destino', e.target.value)}
                              onBlur={(e) => {
                                const norm = normalizeDestino(e.target.value);
                                if (norm && norm !== e.target.value) {
                                  handleCellEdit(row.id, 'destino', norm);
                                }
                              }}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-black text-xs text-blue-900"
                              placeholder="DESTINO"
                            />
                          </td>

                          {/* 12. TRANSPORTADOR */}
                          <td className="p-1.5 border-r border-slate-200 font-black text-amber-950 bg-amber-100/40">
                            <input
                              type="text"
                              value={row.transportador}
                              onChange={(e) => handleCellEdit(row.id, 'transportador', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-200 focus:outline-none rounded font-black text-xs text-amber-950"
                            />
                          </td>

                          {/* 13. CAVALO (Highlighted based on Checklist validity) */}
                          <td className={cn(
                            "p-1.5 border-r border-slate-200 transition-colors relative",
                            chkStatus.borderCell
                          )}>
                            <div className="flex items-center justify-between gap-1">
                              <input
                                type="text"
                                value={row.cavalo}
                                onChange={(e) => handleCellEdit(row.id, 'cavalo', e.target.value)}
                                className={cn(
                                  "w-full bg-transparent px-2 py-1 focus:bg-amber-200 focus:outline-none rounded font-mono font-black text-xs uppercase tracking-wider",
                                  chkStatus.status === 'vencido' && "text-rose-900 font-black",
                                  chkStatus.status === 'a_vencer' && "text-amber-950 font-black",
                                  chkStatus.status === 'ok' && "text-emerald-900 font-black"
                                )}
                              />
                              {chkStatus.status !== 'none' && (
                                <span 
                                  title={chkStatus.label}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest shrink-0 uppercase border shadow-2xs cursor-help select-none",
                                    chkStatus.badgeClass
                                  )}
                                >
                                  {chkStatus.status === 'vencido' ? 'VENCIDO' : chkStatus.status === 'a_vencer' ? '2 DIAS' : 'OK'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 14. CARRETA */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-800">
                            <input
                              type="text"
                              value={row.carreta}
                              onChange={(e) => handleCellEdit(row.id, 'carreta', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-xs uppercase"
                            />
                          </td>

                          {/* 15. Nº PALLETS */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-center text-amber-900 bg-amber-50/40">
                            <input
                              type="text"
                              value={row.pallets}
                              onChange={(e) => handleCellEdit(row.id, 'pallets', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-center text-xs"
                            />
                          </td>

                          {/* 16. TON */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-center text-slate-900">
                            <input
                              type="text"
                              value={row.ton}
                              onChange={(e) => handleCellEdit(row.id, 'ton', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-center text-xs"
                            />
                          </td>

                          {/* 17. M³ */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-center text-slate-700">
                            <input
                              type="text"
                              value={row.m3}
                              onChange={(e) => handleCellEdit(row.id, 'm3', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-center text-xs"
                            />
                          </td>

                          {/* 18. CATEGORIA (FROTA) */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-purple-900 bg-purple-50/30">
                            <input
                              type="text"
                              value={row.categoria}
                              onChange={(e) => handleCellEdit(row.id, 'categoria', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs text-purple-900"
                            />
                          </td>

                          {/* 19. TECNOLOGIA (SASCAR) */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-cyan-900 bg-cyan-50/30">
                            <input
                              type="text"
                              value={row.tecnologia}
                              onChange={(e) => handleCellEdit(row.id, 'tecnologia', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs text-cyan-900"
                            />
                          </td>

                          {/* 20. CONDUCTOR */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-[#2D1A10]">
                            <input
                              type="text"
                              value={row.conductor}
                              onChange={(e) => handleCellEdit(row.id, 'conductor', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs uppercase"
                            />
                          </td>

                          {/* 21. CPF */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-blue-900 bg-blue-50/30">
                            <input
                              type="text"
                              value={row.cpf}
                              onChange={(e) => handleCellEdit(row.id, 'cpf', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-xs"
                            />
                          </td>

                          {/* 22. RG / SAP */}
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-blue-900 bg-blue-50/30">
                            <input
                              type="text"
                              value={row.rgSap}
                              onChange={(e) => handleCellEdit(row.id, 'rgSap', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-xs"
                            />
                          </td>

                          {/* 23. CNH */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-slate-700">
                            <input
                              type="text"
                              value={row.cnh}
                              onChange={(e) => handleCellEdit(row.id, 'cnh', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 24. TELEFONE */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-slate-700">
                            <input
                              type="text"
                              value={row.telefone}
                              onChange={(e) => handleCellEdit(row.id, 'telefone', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 25. VIGÊNCIA DO CADASTRO */}
                          <td className="p-1.5 border-r border-slate-200 text-slate-800">
                            <input
                              type="text"
                              value={row.vigenciaCadastro}
                              onChange={(e) => handleCellEdit(row.id, 'vigenciaCadastro', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-xs"
                            />
                          </td>

                          {/* 26. CÓDIGO DA TRANSPORTADORA */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-slate-800">
                            <input
                              type="text"
                              value={row.codigoTransportadora}
                              onChange={(e) => handleCellEdit(row.id, 'codigoTransportadora', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 27. ID DA CARGA */}
                          <td className="p-1.5 border-r border-slate-200 font-mono text-slate-700">
                            <input
                              type="text"
                              value={row.idCarga}
                              onChange={(e) => handleCellEdit(row.id, 'idCarga', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                            />
                          </td>

                          {/* 28. ESTADO MOTORISTA */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-center text-slate-700">
                            <input
                              type="text"
                              value={row.estadoMotorista}
                              onChange={(e) => handleCellEdit(row.id, 'estadoMotorista', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center font-bold text-xs uppercase"
                            />
                          </td>

                          {/* 29. ESTADO CAVALO */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-center text-slate-700">
                            <input
                              type="text"
                              value={row.estadoCavalo}
                              onChange={(e) => handleCellEdit(row.id, 'estadoCavalo', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center font-bold text-xs uppercase"
                            />
                          </td>

                          {/* 30. ESTADO CARRETA (AD) */}
                          <td className="p-1.5 border-r border-slate-200 font-bold text-center text-slate-700">
                            <input
                              type="text"
                              value={row.estadoCarreta}
                              onChange={(e) => handleCellEdit(row.id, 'estadoCarreta', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center font-bold text-xs uppercase"
                            />
                          </td>

                          {/* 31. COLUNA AE (Vazia) */}
                          <td className="p-1.5 border-r border-slate-200 bg-slate-50/30">
                            <input
                              type="text"
                              value=""
                              readOnly
                              className="w-full bg-transparent px-2 py-1 text-center font-mono text-xs text-slate-300 select-none cursor-not-allowed"
                            />
                          </td>

                          {/* 32. PENDENCIA (AF - Coluna Pendência: CHECKLIST se vencido) */}
                          <td className={cn(
                            "p-1.5 border-r border-slate-200 transition-colors text-center font-mono font-bold",
                            row.pendencia === 'CHECKLIST' ? "bg-amber-100/90 text-amber-950 font-black" : "bg-slate-50/50 text-slate-400"
                          )}>
                            <input
                              type="text"
                              value={row.pendencia || ''}
                              onChange={(e) => handleCellEdit(row.id, 'pendencia', e.target.value)}
                              placeholder="—"
                              className={cn(
                                "w-full bg-transparent px-2 py-1 text-center font-mono font-black text-xs focus:bg-amber-200 focus:outline-none rounded uppercase",
                                row.pendencia === 'CHECKLIST' ? "text-amber-950 font-black" : "text-slate-400"
                              )}
                              title="Coluna AF (Pendência) - preenchida com 'CHECKLIST' se o checklist estiver vencido"
                            />
                          </td>

                          {/* 33. CHECK LIST (AG - Validade do Checklist/Veículos) */}
                          <td className={cn(
                            "p-1.5 border-r border-slate-200 font-mono font-bold transition-colors",
                            row.pendencia === 'CHECKLIST' ? "bg-rose-50 text-rose-900 font-black" : "bg-emerald-50/50 text-emerald-900"
                          )}>
                            <input
                              type="text"
                              value={row.checkList}
                              onChange={(e) => handleCellEdit(row.id, 'checkList', e.target.value)}
                              className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono font-bold text-xs text-slate-900"
                              title="Coluna AG (Check List) - Validade dos veículos puxada da página Checklist"
                            />
                          </td>

                          {/* Action & Individual Copy */}
                          <td className="p-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopySingleRow(row)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 border cursor-pointer shadow-2xs",
                                  isCopied
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 border-slate-300 hover:border-amber-400"
                                )}
                                title="Copiar individualmente apenas esta linha (33 colunas)"
                              >
                                {isCopied ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} />}
                                <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                              </button>

                              <button
                                onClick={() => handleRemoveRow(row.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-rose-200"
                                title="Remover linha"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Tab 2: Motoristas 3C Database Management */
        <div className="bg-white border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Users className="text-[#B32025]" size={22} />
                <h3 className="text-xl font-serif font-black uppercase tracking-tight text-[#2D1A10]">
                  Cadastro de Motoristas 3C
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Sempre que um motorista desta lista aparecer nos dados colados da escala, seu CPF e RG serão inseridos automaticamente.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por Nome, CPF ou RG..."
                  value={searchMotorista}
                  onChange={(e) => setSearchMotorista(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#B32025] font-sans"
                />
              </div>

              {/* Add Motorista Button */}
              <button
                onClick={handleOpenAddMotoristaModal}
                className="px-4 py-2 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0"
              >
                <UserPlus size={16} />
                <span>Novo Motorista</span>
              </button>
            </div>
          </div>

          {/* Motoristas Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#2D1A10] text-[#fdefd1] font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-b border-[#8c6039]/40 text-center w-12">#</th>
                  <th className="p-3 border-b border-[#8c6039]/40">NOME DO MOTORISTA</th>
                  <th className="p-3 border-b border-[#8c6039]/40">CPF</th>
                  <th className="p-3 border-b border-[#8c6039]/40">RG / SAP</th>
                  <th className="p-3 border-b border-[#8c6039]/40 text-center w-28">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-sans">
                {filteredMotoristas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                      Nenhum motorista encontrado com os termos pesquisados.
                    </td>
                  </tr>
                ) : (
                  filteredMotoristas.map((motorista, index) => (
                    <tr key={motorista.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-400 bg-slate-50">
                        {index + 1}
                      </td>
                      <td className="p-3 font-bold text-[#2D1A10] uppercase">
                        {motorista.nome}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-900 bg-blue-50/30">
                        {motorista.cpf || '-'}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-900 bg-blue-50/30">
                        {motorista.rg || '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditMotoristaModal(motorista)}
                            className="p-1.5 text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Dados"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMotorista(motorista.id, motorista.nome)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Motorista"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Motorista 3C */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-[#3A2414] rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="text-[#B32025]" size={20} />
                  <h3 className="text-lg font-serif font-black uppercase text-[#2D1A10]">
                    {editingDriver ? 'Editar Motorista 3C' : 'Novo Motorista 3C'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMotorista} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">
                    Nome Completo do Motorista *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="EX: ADILSON DOS REIS SILVA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#B32025] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="EX: 599.612.106.97"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-[#B32025]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">
                    RG / SAP
                  </label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                    placeholder="EX: MG3330429"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-none focus:border-[#B32025] uppercase"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#B32025] hover:bg-[#8c060a] text-white rounded-xl font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Save size={15} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Viewing All 58 Standardized Destinations */}
      <AnimatePresence>
        {isDestinosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-blue-900 rounded-3xl p-6 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-900 text-blue-100 flex items-center justify-center shadow-md">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black uppercase text-[#2D1A10]">
                      Destinos Padronizados ({DESTINOS_PADRAO.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Todos os destinos na coluna DESTINO são formatados automaticamente conforme esta tabela oficial.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDestinosModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid of 58 Destinations */}
              <div className="overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {DESTINOS_PADRAO.map((dest, idx) => (
                    <div
                      key={dest}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition-colors flex items-center gap-2 font-mono text-xs font-bold text-slate-800"
                    >
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{dest}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
                <span className="text-slate-500 font-bold">
                  Dica: Ao digitar no campo DESTINO da tabela, o sistema auto-completa com estes valores.
                </span>
                <button
                  onClick={() => setIsDestinosModalOpen(false)}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HTML Datalist for Standardized Destinos (58) */}
      <datalist id="destinos-padrao-list">
        {DESTINOS_PADRAO.map((dest) => (
          <option key={dest} value={dest} />
        ))}
      </datalist>

    </div>
  );
}
