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
  Sliders,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Info,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import FileSaver from 'file-saver';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { parseISO, differenceInDays } from 'date-fns';

// 30 exact columns required for "Disponibilidade" (Pátio) spreadsheet
export const DISPO_COLUMNS = [
  'MÊS',                           // 1
  'ORIGEM',                        // 2
  'DIA',                           // 3
  'DATA',                          // 4
  'CONTATO WHATS',                 // 5
  'HORA LIBERADO',                 // 6
  'STATUS',                        // 7
  'MODELO CARRETA',                // 8
  'MODELO CAVALO',                 // 9
  'FEZ CONTATO?',                  // 10
  'DESTINO',                       // 11
  'TRANSPORTADOR',                 // 12
  'CAVALO',                        // 13
  'CARRETA',                       // 14
  'Nº PALLETS',                    // 15
  'TON',                           // 16
  'M³',                            // 17
  'CATEGORIA',                     // 18
  'TECNOLOGIA',                    // 19
  'CONDUCTOR',                     // 20
  'CPF',                           // 21
  'RG / SAP',                      // 22
  'CNH',                           // 23
  'TELEFONE',                      // 24
  'VIGÊNCIA DO CADASTRO',          // 25
  'CÓDIGO DA TRANSPORTADORA',      // 26
  'ID DA CARGA / LACRE EXPORTAÇÃO', // 27
  'ESTADO MOTORISTA',              // 28
  'ESTADO CAVALO',                 // 29
  'ESTADO CARRETA'                 // 30
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
}

interface ChecklistItem {
  id: string;
  cavalo: string;
  carretas?: string;
  dataTeste?: string;
  dataVencimento?: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

// Sample data from image.png provided by user
const SAMPLE_INPUT_TEXT = `10/09/2026\tBRUNO KERVIN FERNANDES DO NASCIMENTO\tUUF-3F25\tUUG-4I45\tUUG-4B95\tSANTA LUZIA X NATAL\t32503\t1001203515\t48\t34
10/09/2026\tMAURICIO APARECIDO DA SILVA\tUUO-8D35\tUVA-5F15\tUVA-4E95\tSANTA LUZIA X RECIFE\t32512\t1001215981\t48\t45
10/09/2026\tPAULO EDER DE OLIVEIRA MENDES\tUUO-9D95\tUVA-6C45\tUVA-6F45\tSANTA LUZIA X JOÃO PESSOA\t32471\t1000425673\t48\t45
10/09/2026\tMARCOS MENDES PEREIRA\tUUU-8F75\tUUH-3A45\tUUF-9H85\tSANTA LUZIA X MACEIO\t32514\t1001216423\t48\t34`;

interface EscalaProps {
  onBack?: () => void;
}

export default function Escala({ onBack }: EscalaProps) {
  const [inputText, setInputText] = useState<string>(SAMPLE_INPUT_TEXT);
  const [includeHeaderInCopy, setIncludeHeaderInCopy] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Global default configuration for auto-filling
  const [defaults, setDefaults] = useState({
    transportador: 'TOMASI',
    modeloCavalo: 'TRUCADO',
    modeloCarreta2: 'RODOTREM BAÚ',
    modeloCarreta1: 'BAÚ',
    categoria: 'FROTA',
    tecnologia: 'SASCAR',
    status: 'LIBERADO CARREGAMENTO',
    horaLiberado: '08:00:00',
    contatoWhats: 'SIM',
    fezContato: 'SIM',
    vigenciaCadastro: 'SEGURO PRÓPRIO',
    codigoTransportadora: '1000000496',
    estadoMotorista: 'MG',
    estadoCavalo: 'MG',
    estadoCarreta: 'MG'
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

  // Get month abbreviation e.g. "SET/26" or "JAN/26"
  const getMonthAbbrev = (dateStr: string): string => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const year = parts[2].slice(-2);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mStr = months[month - 1] || 'SET';
        return `${mStr}/${year}`;
      }
    } catch (e) {
      // fallback
    }
    return 'SET/26';
  };

  // Parse input pasted lines into structured 30-column DispoRow objects
  const parsedRows = useMemo<DispoRow[]>(() => {
    if (!inputText.trim()) return [];

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
      const dataSaida = cols[0] || '10/09/2026';
      const motorista = cols[1] || '';
      const placaCavalo = cols[2] || '';
      const bau1 = cols[3] || '';
      const bau2 = cols[4] || '';
      const trecho = cols[5] || '';
      const matricula = cols[6] || '';
      const codSap = cols[7] || '';
      const rawPallets = cols[8] || '48';
      const rawTon = cols[9] || '34';

      // Extract Origem and Destino from Trecho (e.g. "SANTA LUZIA X NATAL")
      let origem = 'SANTA LUZIA / MG';
      let destino = '';

      if (trecho) {
        const trechoParts = trecho.split(/\s+X\s+|\s+x\s+|X|x/);
        if (trechoParts.length >= 2) {
          const rawOrigem = trechoParts[0].trim();
          origem = rawOrigem.includes('/') ? rawOrigem : `${rawOrigem} / MG`;
          destino = trechoParts[1].trim();
        } else {
          destino = trecho;
        }
      }

      // RG / SAP combined
      let rgSap = codSap;
      if (matricula && codSap) {
        rgSap = `${matricula} / ${codSap}`;
      } else if (matricula) {
        rgSap = matricula;
      }

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

        // Row 1 for Baú 1
        const row1: DispoRow = {
          id: `row-${index}-bau1-${Date.now()}`,
          mes: getMonthAbbrev(dataSaida),
          origem: origem.toUpperCase(),
          dia: getDayOfWeek(dataSaida),
          data: dataSaida,
          contatoWhats: defaults.contatoWhats,
          horaLiberado: defaults.horaLiberado,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta2, // RODOTREM BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador,
          cavalo: placaCavalo.toUpperCase(),
          carreta: bau1.toUpperCase(),
          pallets: palletsHalf,
          ton: tonHalf,
          m3: m3Half,
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: '',
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: defaults.estadoMotorista,
          estadoCavalo: defaults.estadoCavalo,
          estadoCarreta: defaults.estadoCarreta
        };

        // Row 2 for Baú 2
        const row2: DispoRow = {
          id: `row-${index}-bau2-${Date.now()}`,
          mes: getMonthAbbrev(dataSaida),
          origem: origem.toUpperCase(),
          dia: getDayOfWeek(dataSaida),
          data: dataSaida,
          contatoWhats: defaults.contatoWhats,
          horaLiberado: defaults.horaLiberado,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta2, // RODOTREM BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador,
          cavalo: placaCavalo.toUpperCase(),
          carreta: bau2.toUpperCase(),
          pallets: palletsHalf,
          ton: tonHalf,
          m3: m3Half,
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: '',
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: defaults.estadoMotorista,
          estadoCavalo: defaults.estadoCavalo,
          estadoCarreta: defaults.estadoCarreta
        };

        rows.push(row1, row2);
      } else {
        // Single Baú
        const singleCarreta = bau1 || bau2;
        let m3 = '87 m³';
        const numT = parseFloat(rawTon);
        if (!isNaN(numT)) {
          if (numT >= 40) m3 = '110 m³';
          else if (numT >= 30) m3 = '87 m³';
          else m3 = '80 m³';
        }

        const row: DispoRow = {
          id: `row-${index}-${Date.now()}`,
          mes: getMonthAbbrev(dataSaida),
          origem: origem.toUpperCase(),
          dia: getDayOfWeek(dataSaida),
          data: dataSaida,
          contatoWhats: defaults.contatoWhats,
          horaLiberado: defaults.horaLiberado,
          status: defaults.status,
          modeloCarreta: defaults.modeloCarreta1, // BAÚ
          modeloCavalo: defaults.modeloCavalo,
          fezContato: defaults.fezContato,
          destino: destino.toUpperCase(),
          transportador: defaults.transportador,
          cavalo: placaCavalo.toUpperCase(),
          carreta: singleCarreta.toUpperCase(),
          pallets: rawPallets,
          ton: rawTon,
          m3: m3,
          categoria: defaults.categoria, // FROTA
          tecnologia: defaults.tecnologia, // SASCAR
          conductor: motorista.toUpperCase(),
          cpf: '',
          rgSap: rgSap,
          cnh: '',
          telefone: '',
          vigenciaCadastro: defaults.vigenciaCadastro,
          codigoTransportadora: defaults.codigoTransportadora,
          idCarga: '',
          estadoMotorista: defaults.estadoMotorista,
          estadoCavalo: defaults.estadoCavalo,
          estadoCarreta: defaults.estadoCarreta
        };

        rows.push(row);
      }
    });

    return rows;
  }, [inputText, defaults]);

  // Editable rows state
  const [editableRows, setEditableRows] = useState<DispoRow[]>([]);

  // Update editableRows when parsedRows change
  useEffect(() => {
    setEditableRows(parsedRows);
  }, [parsedRows]);

  // Handle cell edit
  const handleCellEdit = (rowId: string, field: keyof DispoRow, value: string) => {
    setEditableRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Convert rows to TSV string for copying (pure plain text without formatting or headers by default)
  const generateTSV = (includeHeader: boolean): string => {
    const lines: string[] = [];

    if (includeHeader) {
      lines.push(DISPO_COLUMNS.join('\t'));
    }

    editableRows.forEach(row => {
      const lineValues = [
        row.mes,
        row.origem,
        row.dia,
        row.data,
        row.contatoWhats,
        row.horaLiberado,
        row.status,
        row.modeloCarreta,
        row.modeloCavalo,
        row.fezContato,
        row.destino,
        row.transportador,
        row.cavalo,
        row.carreta,
        row.pallets,
        row.ton,
        row.m3,
        row.categoria,
        row.tecnologia,
        row.conductor,
        row.cpf,
        row.rgSap,
        row.cnh,
        row.telefone,
        row.vigenciaCadastro,
        row.codigoTransportadora,
        row.idCarga,
        row.estadoMotorista,
        row.estadoCavalo,
        row.estadoCarreta
      ];
      lines.push(lineValues.join('\t'));
    });

    return lines.join('\n');
  };

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
    const newRow: DispoRow = {
      id: `manual-${Date.now()}`,
      mes: 'SET/26',
      origem: 'SANTA LUZIA / MG',
      dia: 'quinta-feira',
      data: '10/09/2026',
      contatoWhats: defaults.contatoWhats,
      horaLiberado: defaults.horaLiberado,
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
      m3: '43.5 m³',
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
      estadoMotorista: defaults.estadoMotorista,
      estadoCavalo: defaults.estadoCavalo,
      estadoCarreta: defaults.estadoCarreta
    };
    setEditableRows(prev => [...prev, newRow]);
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    setEditableRows(prev => prev.filter(r => r.id !== rowId));
  };

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
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-3 py-1 rounded-lg bg-[#B32025] text-white text-[10px] font-black uppercase tracking-widest border border-red-400/30 flex items-center gap-1.5 shadow-sm">
                  <FileSpreadsheet size={13} />
                  Módulo Escala
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Desmembramento de Baús & Validação de Checklist
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white uppercase">
                Conversor de Escala para Disponibilidade do Pátio
              </h1>
              <p className="text-xs sm:text-sm text-[#dac0a3] mt-1 font-sans">
                Gera linhas separadas para cada baú (com divisão de paletização e tonelagem meio a meio), valida a validade do checklist dos cavalos e copia apenas os dados (sem cabeçalho).
              </p>
            </div>
          </div>

          {/* Quick Action Copy Button on Top Header */}
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
        </div>
      </div>

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
                  Abra a sua planilha de Disponibilidade, selecione a primeira célula da linha de dados (<strong className="text-white">MÊS</strong> ou a próxima célula vazia) e pressione <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-emerald-400/40 text-white font-mono">Ctrl + V</kbd>.
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
      </AnimatePresence>

      {/* Main Grid: Left Paste Box & Right Default Configs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Textarea Paste Area (7 cols) */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
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
                  <span>Exemplo da Imagem</span>
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

            {/* Instruction Box */}
            <div className="bg-[#2D1A10]/5 border border-[#3A2414]/15 rounded-2xl p-3 text-xs text-[#2D1A10] space-y-1 mb-3">
              <div className="flex items-center gap-2 font-bold text-[#B32025] uppercase text-[11px]">
                <Info size={14} />
                <span>Regras de Conversão Automática:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 font-sans">
                <li>Linhas com <strong>Baú 1 e Baú 2</strong> são duplicadas em 2 linhas separadas (uma para cada Baú).</li>
                <li><strong>Paletização</strong> e <strong>Tonelagem</strong> são divididas meio a meio entre os baús (ex: 48 pallets/34 ton &rarr; 24 e 17 para cada).</li>
                <li><strong>Categoria</strong> fixada em <strong className="text-purple-800">FROTA</strong> e <strong>Tecnologia</strong> fixada em <strong className="text-cyan-800">SASCAR</strong>.</li>
              </ul>
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

        {/* Right Column: Default Operational Configs (5 cols) */}
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

            {/* Transportador */}
            <div>
              <label className="block text-[10px] font-black uppercase text-[#2D1A10] mb-1">
                Transportador
              </label>
              <input
                type="text"
                value={defaults.transportador}
                onChange={(e) => setDefaults(prev => ({ ...prev, transportador: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-[#B32025]"
              />
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
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Linhas de Carga</span>
            <span className="text-lg font-black text-[#2D1A10] font-mono">{editableRows.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Pallets</span>
            <span className="text-lg font-black text-[#2D1A10] font-mono">{totalPallets}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tonelagem Total</span>
            <span className="text-lg font-black text-[#2D1A10] font-mono">{totalTon} TON</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Destinos Únicos</span>
            <span className="text-xs font-bold text-[#2D1A10] truncate max-w-[140px] block" title={uniqueDestinations.join(', ')}>
              {uniqueDestinations.length > 0 ? uniqueDestinations.join(', ') : 'Nenhum'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Preview Section */}
      <div className="bg-white border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-xl space-y-4">
        
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-serif font-black uppercase tracking-tight text-[#2D1A10] flex items-center gap-2">
              <FileSpreadsheet className="text-[#B32025]" size={20} />
               Pré-visualização da Tabela de Disponibilidade (30 Colunas)
            </h3>
            <p className="text-xs text-slate-600">
              * Ao clicar em <strong className="text-[#B32025]">Copiar</strong>, apenas o conteúdo dos dados é copiado (sem cores e sem cabeçalho por padrão).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
        {editableRows.length === 0 ? (
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
                  <th className="p-3 border-b border-[#8c6039]/40 text-center w-12">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-sans">
                {editableRows.map((row, idx) => {
                  const chkStatus = getPlateChecklistStatus(row.cavalo);

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
                      <td className="p-1.5 border-r border-slate-200 font-bold text-[#B32025]">
                        <input
                          type="text"
                          value={row.modeloCarreta}
                          onChange={(e) => handleCellEdit(row.id, 'modeloCarreta', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
                        />
                      </td>

                      {/* 9. MODELO CAVALO */}
                      <td className="p-1.5 border-r border-slate-200 text-slate-700 font-bold">
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
                          value={row.destino}
                          onChange={(e) => handleCellEdit(row.id, 'destino', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-black text-xs text-blue-900"
                        />
                      </td>

                      {/* 12. TRANSPORTADOR */}
                      <td className="p-1.5 border-r border-slate-200 font-bold text-slate-800">
                        <input
                          type="text"
                          value={row.transportador}
                          onChange={(e) => handleCellEdit(row.id, 'transportador', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-bold text-xs"
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
                      <td className="p-1.5 border-r border-slate-200 font-mono text-slate-700">
                        <input
                          type="text"
                          value={row.cpf}
                          onChange={(e) => handleCellEdit(row.id, 'cpf', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded font-mono text-xs"
                        />
                      </td>

                      {/* 22. RG / SAP */}
                      <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-800">
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

                      {/* 30. ESTADO CARRETA */}
                      <td className="p-1.5 border-r border-slate-200 font-bold text-center text-slate-700">
                        <input
                          type="text"
                          value={row.estadoCarreta}
                          onChange={(e) => handleCellEdit(row.id, 'estadoCarreta', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 focus:bg-amber-100 focus:outline-none rounded text-center font-bold text-xs uppercase"
                        />
                      </td>

                      {/* Action */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                          title="Remover linha"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
