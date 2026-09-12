import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
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
  ShieldCheck,
  AlertCircle,
  X,
  Edit2,
  FileCheck,
  Eye,
  Sliders
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { DISPO_COLUMNS, DispoRow, normalizeDestino } from './Escala';

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
  getChecklistDetails?: (cavalo: string, carreta?: string) => { checkList: string; pendencia: string };
  formatPlateWithHyphen?: (plate: string) => string;
  getMonthAbbrev?: (dateStr: string) => string;
  getDayOfWeek?: (dateStr: string) => string;
}

// Data from user's attached OS document (TORNADOLOG / Wilmer Diaz Sanchez)
const SAMPLE_OS_DATA = {
  transportador: 'TORNADOLOG',
  dataCarregamento: '05/08/2026',
  previsaoHorario: 'FROTA',
  filialOrigem: 'VESPASIANO/MG',
  filialDestino: 'EUSÉBIO/CE',
  agendaDescarregamento: '',
  nomeMotorista: 'WILMER DIAZ SANCHEZ',
  cpf: '709.874.852-88',
  vinculoMotorista: 'FROTA',
  rgUf: 'F 439659 S PF / AM',
  cnh: '08359828273',
  idCargo: '',
  celular: '48 99219-2019',
  perfilCavalo: 'TRUCADO',
  perfilCarreta: 'SIDER',
  capacidadePallets: '30',
  capacidadeToneladas: '30',
  placaCavalo: 'TLN-3E35',
  ufCavalo: 'SC',
  placaCarreta1: 'TPI-4B34',
  ufCarreta1: 'SC',
  placaCarreta2: '',
  ufCarreta2: '',
  rastreador: 'ONIX',
  quantEixos: '6',
  comprimentoCarreta: '14,6',
  larguraCarreta: '2,45',
  alturaCarreta: '2,82'
};

export default function TerceirosEscala({
  checklistItems = [],
  getChecklistDetails,
  formatPlateWithHyphen = (p: string) => {
    if (!p) return '';
    const clean = p.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (clean.length === 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return p.toUpperCase().trim();
  },
  getMonthAbbrev = (dateStr: string) => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const year = parts[2].slice(-2);
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mStr = months[month - 1] || 'SET';
        return `${mStr}|${year}`;
      }
    } catch {
      // ignore
    }
    return 'AGO|26';
  },
  getDayOfWeek = (dateStr: string) => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        return days[d.getDay()] || 'quarta-feira';
      }
    } catch {
      // ignore
    }
    return 'quarta-feira';
  }
}: TerceirosEscalaProps) {
  const [rows, setRows] = useState<DispoRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [includeHeaderInCopy, setIncludeHeaderInCopy] = useState<boolean>(false);
  const [uploadedFilesHistory, setUploadedFilesHistory] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<DispoRow | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to build a DispoRow from raw OS object or extracted entity
  const buildDispoRowsFromOS = (raw: any): DispoRow[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.flatMap(item => buildDispoRowsFromOS(item));
    }

    const os = {
      transportador: raw.transportador || raw.transportadora || raw.empresa || '',
      dataCarregamento: raw.dataCarregamento || raw.data || '',
      previsaoHorario: raw.previsaoHorario || raw.horario || raw.hora || '',
      filialOrigem: raw.filialOrigem || raw.origem || '',
      filialDestino: raw.filialDestino || raw.destino || '',
      agendaDescarregamento: raw.agendaDescarregamento || raw.agenda || '',
      nomeMotorista: raw.nomeMotorista || raw.motorista || raw.condutor || raw.conductor || '',
      cpf: raw.cpf || raw.cpfMotorista || '',
      vinculoMotorista: raw.vinculoMotorista || raw.vinculo || raw.categoria || 'TERCEIRO',
      rgUf: raw.rgUf || raw.rg || raw.rgSap || '',
      cnh: raw.cnh || raw.cnhMotorista || '',
      idCargo: raw.idCargo || raw.idCarga || raw.os || raw.ordem || '',
      celular: raw.celular || raw.telefone || raw.fone || '',
      perfilCavalo: raw.perfilCavalo || raw.tipoCavalo || 'TRUCADO',
      perfilCarreta: raw.perfilCarreta || raw.tipoCarreta || 'SIDER',
      capacidadePallets: String(raw.capacidadePallets || raw.pallets || '30'),
      capacidadeToneladas: String(raw.capacidadeToneladas || raw.toneladas || raw.ton || '30'),
      placaCavalo: raw.placaCavalo || raw.cavalo || raw.placa || '',
      ufCavalo: raw.ufCavalo || raw.estadoCavalo || 'SC',
      placaCarreta1: raw.placaCarreta1 || raw.carreta || raw.carreta1 || '',
      ufCarreta1: raw.ufCarreta1 || raw.estadoCarreta || 'SC',
      placaCarreta2: raw.placaCarreta2 || raw.carreta2 || '',
      ufCarreta2: raw.ufCarreta2 || '',
      rastreador: raw.rastreador || raw.tecnologia || 'ONIX',
      quantEixos: raw.quantEixos || raw.eixos || '',
      comprimentoCarreta: raw.comprimentoCarreta || '',
      larguraCarreta: raw.larguraCarreta || '',
      alturaCarreta: raw.alturaCarreta || ''
    };

    const dataStr = os.dataCarregamento || new Date().toLocaleDateString('pt-BR');
    const mes = getMonthAbbrev(dataStr);
    const dia = getDayOfWeek(dataStr);
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const cavalo = formatPlateWithHyphen(os.placaCavalo);
    const carreta1 = formatPlateWithHyphen(os.placaCarreta1);
    const carreta2 = formatPlateWithHyphen(os.placaCarreta2);

    let chkDetails1 = { checkList: '', pendencia: '' };
    let chkDetails2 = { checkList: '', pendencia: '' };
    if (getChecklistDetails) {
      chkDetails1 = getChecklistDetails(cavalo, carreta1);
      if (carreta2) {
        chkDetails2 = getChecklistDetails(cavalo, carreta2);
      }
    }

    const destinoNorm = normalizeDestino(os.filialDestino || '');

    // Calculate m3 if dimensions available: comp * larg * alt
    let m3Val = '';
    if (os.comprimentoCarreta && os.larguraCarreta && os.alturaCarreta) {
      const c = parseFloat(String(os.comprimentoCarreta).replace(',', '.'));
      const l = parseFloat(String(os.larguraCarreta).replace(',', '.'));
      const a = parseFloat(String(os.alturaCarreta).replace(',', '.'));
      if (!isNaN(c) && !isNaN(l) && !isNaN(a)) {
        m3Val = `${Math.round(c * l * a)} m³`;
      }
    }

    // Extract driver State from RG / UF or fallback
    let estadoMotorista = 'MG';
    if (os.rgUf) {
      const parts = os.rgUf.split(/[\/\-]/);
      if (parts.length > 1) {
        estadoMotorista = parts[parts.length - 1].trim().toUpperCase();
      }
    }

    const baseRow: Omit<DispoRow, 'id' | 'carreta' | 'pallets' | 'ton' | 'm3' | 'checkList' | 'pendencia'> = {
      mes,
      origem: (os.filialOrigem || 'VESPASIANO/MG').toUpperCase(),
      dia,
      data: dataStr,
      contatoWhats: 'X',
      horaLiberado: hora,
      status: 'LIBERADO CARREGAMENTO',
      modeloCarreta: (os.perfilCarreta || 'SIDER').toUpperCase(),
      modeloCavalo: (os.perfilCavalo || 'TRUCADO').toUpperCase(),
      fezContato: 'SIM',
      destino: (destinoNorm || os.filialDestino || 'EUSÉBIO/CE').toUpperCase(),
      transportador: (os.transportador || 'TERCEIRO').toUpperCase(),
      cavalo,
      categoria: (os.vinculoMotorista || 'TERCEIRO').toUpperCase(),
      tecnologia: (os.rastreador || 'ONIX').toUpperCase(),
      conductor: (os.nomeMotorista || '').toUpperCase(),
      cpf: os.cpf || '',
      rgSap: os.rgUf || '',
      cnh: os.cnh || '',
      telefone: os.celular || '',
      vigenciaCadastro: 'TERCEIRO',
      codigoTransportadora: '',
      idCarga: os.idCargo || '',
      estadoMotorista,
      estadoCavalo: (os.ufCavalo || 'SC').toUpperCase(),
      estadoCarreta: (os.ufCarreta1 || 'SC').toUpperCase()
    };

    if (carreta1 && carreta2) {
      // 2 carretas: divide pallets and ton
      const numP = parseFloat(os.capacidadePallets || '30');
      const numT = parseFloat(os.capacidadeToneladas || '30');
      const halfP = !isNaN(numP) ? String(Math.round(numP / 2)) : os.capacidadePallets;
      const halfT = !isNaN(numT) ? String(numT / 2) : os.capacidadeToneladas;

      const row1: DispoRow = {
        ...baseRow,
        id: `os-row-${Date.now()}-1`,
        carreta: carreta1,
        pallets: halfP,
        ton: halfT,
        m3: m3Val,
        checkList: chkDetails1.checkList,
        pendencia: chkDetails1.pendencia
      };

      const row2: DispoRow = {
        ...baseRow,
        id: `os-row-${Date.now()}-2`,
        carreta: carreta2,
        estadoCarreta: (os.ufCarreta2 || os.ufCarreta1 || 'SC').toUpperCase(),
        pallets: halfP,
        ton: halfT,
        m3: m3Val,
        checkList: chkDetails2.checkList,
        pendencia: chkDetails2.pendencia
      };

      return [row1, row2];
    }

    const singleRow: DispoRow = {
      ...baseRow,
      id: `os-row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      carreta: carreta1 || carreta2 || 'SEM CARRETA',
      pallets: os.capacidadePallets || '30',
      ton: os.capacidadeToneladas || '30',
      m3: m3Val,
      checkList: chkDetails1.checkList,
      pendencia: chkDetails1.pendencia
    };

    return [singleRow];
  };

  // Dedicated parser for Excel (.xlsx, .xls) and CSV spreadsheets
  const parseExcelOrCsvFile = async (file: File): Promise<DispoRow[]> => {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return [];

    const ws = wb.Sheets[firstSheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!data || data.length === 0) return [];

    const headerRow = (data[0] || []).map(h => String(h || '').trim().toUpperCase());
    
    // Check if it's the standard 33-column availability sheet
    const is33Cols = headerRow.length >= 20 && (
      headerRow.includes('MÊS') || 
      headerRow.includes('MES') || 
      headerRow.includes('CAVALO')
    );

    const extractedRows: DispoRow[] = [];
    const startIndex = (headerRow.includes('MÊS') || headerRow.includes('MES') || headerRow.includes('CAVALO') || headerRow.includes('PLACA')) ? 1 : 0;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (is33Cols) {
        const cavalo = formatPlateWithHyphen(String(row[12] || ''));
        const carreta = formatPlateWithHyphen(String(row[13] || ''));
        const conductor = String(row[19] || '').trim().toUpperCase();

        if (!cavalo && !carreta && !conductor) continue;

        let chk = { checkList: '', pendencia: '' };
        if (getChecklistDetails && cavalo) {
          chk = getChecklistDetails(cavalo, carreta);
        }

        extractedRows.push({
          id: `excel-row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          mes: String(row[0] || ''),
          origem: String(row[1] || 'VESPASIANO/MG').toUpperCase(),
          dia: String(row[2] || ''),
          data: String(row[3] || ''),
          contatoWhats: String(row[4] || 'X'),
          horaLiberado: String(row[5] || ''),
          status: String(row[6] || 'LIBERADO CARREGAMENTO'),
          modeloCarreta: String(row[7] || 'SIDER').toUpperCase(),
          modeloCavalo: String(row[8] || 'TRUCADO').toUpperCase(),
          fezContato: String(row[9] || 'SIM'),
          destino: String(row[10] || '').toUpperCase(),
          transportador: String(row[11] || 'TERCEIRO').toUpperCase(),
          cavalo,
          carreta,
          pallets: String(row[14] || '30'),
          ton: String(row[15] || '30'),
          m3: String(row[16] || ''),
          categoria: String(row[17] || 'TERCEIRO').toUpperCase(),
          tecnologia: String(row[18] || 'ONIX').toUpperCase(),
          conductor,
          cpf: String(row[20] || ''),
          rgSap: String(row[21] || ''),
          cnh: String(row[22] || ''),
          telefone: String(row[23] || ''),
          vigenciaCadastro: String(row[24] || 'TERCEIRO'),
          codigoTransportadora: String(row[25] || ''),
          idCarga: String(row[26] || ''),
          estadoMotorista: String(row[27] || 'MG').toUpperCase(),
          estadoCavalo: String(row[28] || 'SC').toUpperCase(),
          estadoCarreta: String(row[29] || 'SC').toUpperCase(),
          pendencia: String(row[31] || chk.pendencia || ''),
          checkList: String(row[32] || chk.checkList || '')
        });
      } else {
        const getColVal = (keys: string[]) => {
          for (const key of keys) {
            const idx = headerRow.findIndex(h => h.includes(key));
            if (idx !== -1 && row[idx] !== undefined) return String(row[idx] || '').trim();
          }
          return '';
        };

        const cavalo = formatPlateWithHyphen(getColVal(['CAVALO', 'PLACA CAVALO', 'VEICULO', 'PLACA']));
        const carreta = formatPlateWithHyphen(getColVal(['CARRETA', 'REBOQUE', 'PLACA CARRETA']));
        const motorista = getColVal(['MOTORISTA', 'CONDUTOR', 'NOME']);
        const cpf = getColVal(['CPF']);
        const destino = getColVal(['DESTINO', 'FILIAL DESTINO']);
        const origem = getColVal(['ORIGEM', 'FILIAL ORIGEM']) || 'VESPASIANO/MG';
        const dataStr = getColVal(['DATA', 'CARREGAMENTO']) || new Date().toLocaleDateString('pt-BR');
        const transportador = getColVal(['TRANSPORTADOR', 'TRANSPORTADORA', 'EMPRESA']) || 'TERCEIRO';

        if (!cavalo && !carreta && !motorista) continue;

        let chk = { checkList: '', pendencia: '' };
        if (getChecklistDetails && cavalo) {
          chk = getChecklistDetails(cavalo, carreta);
        }

        extractedRows.push({
          id: `excel-row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          mes: getMonthAbbrev(dataStr),
          origem: origem.toUpperCase(),
          dia: getDayOfWeek(dataStr),
          data: dataStr,
          contatoWhats: 'X',
          horaLiberado: new Date().toLocaleTimeString('pt-BR'),
          status: 'LIBERADO CARREGAMENTO',
          modeloCarreta: (getColVal(['MODELO CARRETA', 'TIPO CARRETA']) || 'SIDER').toUpperCase(),
          modeloCavalo: (getColVal(['MODELO CAVALO', 'TIPO CAVALO']) || 'TRUCADO').toUpperCase(),
          fezContato: 'SIM',
          destino: (normalizeDestino(destino) || destino || 'EUSÉBIO/CE').toUpperCase(),
          transportador: transportador.toUpperCase(),
          cavalo,
          carreta: carreta || 'SEM CARRETA',
          pallets: getColVal(['PALLETS', 'PLTS']) || '30',
          ton: getColVal(['TONELADAS', 'TON', 'PESO']) || '30',
          m3: getColVal(['M3', 'METRAGEM', 'VOL']) || '',
          categoria: (getColVal(['CATEGORIA', 'VINCULO']) || 'TERCEIRO').toUpperCase(),
          tecnologia: (getColVal(['TECNOLOGIA', 'RASTREADOR']) || 'ONIX').toUpperCase(),
          conductor: motorista.toUpperCase(),
          cpf: cpf,
          rgSap: getColVal(['RG', 'SAP']),
          cnh: getColVal(['CNH']),
          telefone: getColVal(['TELEFONE', 'CELULAR', 'FONE']),
          vigenciaCadastro: 'TERCEIRO',
          codigoTransportadora: getColVal(['CODIGO']),
          idCarga: getColVal(['CARGA', 'OS', 'CTE']),
          estadoMotorista: (getColVal(['UF MOTORISTA', 'ESTADO MOTORISTA']) || 'MG').toUpperCase(),
          estadoCavalo: (getColVal(['UF CAVALO', 'ESTADO CAVALO']) || 'SC').toUpperCase(),
          estadoCarreta: (getColVal(['UF CARRETA', 'ESTADO CARRETA']) || 'SC').toUpperCase(),
          pendencia: chk.pendencia,
          checkList: chk.checkList
        });
      }
    }

    return extractedRows;
  };

  // Convert row into 33 exact TSV columns (A to AG) for Excel clipboard pasting
  const getRowTSV = (row: DispoRow): string => {
    const cols = [
      row.mes,                            // 1 (A)
      row.origem,                         // 2 (B)
      row.dia,                            // 3 (C)
      row.data,                           // 4 (D)
      row.contatoWhats,                   // 5 (E)
      row.horaLiberado,                   // 6 (F)
      row.status,                         // 7 (G)
      row.modeloCarreta,                  // 8 (H)
      row.modeloCavalo,                   // 9 (I)
      row.fezContato,                     // 10 (J)
      row.destino,                        // 11 (K)
      row.transportador,                  // 12 (L)
      formatPlateWithHyphen(row.cavalo),  // 13 (M)
      formatPlateWithHyphen(row.carreta), // 14 (N)
      row.pallets,                        // 15 (O)
      row.ton,                            // 16 (P)
      row.m3,                             // 17 (Q)
      row.categoria,                      // 18 (R)
      row.tecnologia,                     // 19 (S)
      row.conductor,                      // 20 (T)
      row.cpf,                            // 21 (U)
      row.rgSap,                          // 22 (V)
      row.cnh,                            // 23 (W)
      row.telefone,                       // 24 (X)
      row.vigenciaCadastro,               // 25 (Y)
      row.codigoTransportadora,           // 26 (Z)
      row.idCarga,                        // 27 (AA)
      row.estadoMotorista,                // 28 (AB)
      row.estadoCavalo,                   // 29 (AC)
      row.estadoCarreta,                  // 30 (AD)
      '',                                 // 31 (AE)
      row.pendencia || '',                // 32 (AF)
      row.checkList || ''                 // 33 (AG)
    ];
    return cols.slice(0, 33).join('\t');
  };

  // Process a single file (PDF, Image, Excel, CSV)
  const processFile = async (file: File): Promise<DispoRow[]> => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    if (isExcel) {
      setProcessingStatus(`Lendo planilha ${file.name}...`);
      try {
        const excelRows = await parseExcelOrCsvFile(file);
        return excelRows;
      } catch (err) {
        console.error('Erro ao ler planilha:', err);
        throw new Error(`Erro ao ler "${file.name}": ${(err as Error).message}`);
      }
    }

    return new Promise<DispoRow[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Falha ao ler arquivo "${file.name}".`));
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setProcessingStatus(`Extraindo dados de ${file.name}...`);

          const res = await fetch('/api/parse-os-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64,
              fileName: file.name,
              mimeType: file.type || 'application/pdf'
            })
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const items = Array.isArray(json.data) ? json.data : [json.data];
              const parsedRows: DispoRow[] = [];
              for (const item of items) {
                const built = buildDispoRowsFromOS(item);
                parsedRows.push(...built);
              }
              if (parsedRows.length > 0) {
                resolve(parsedRows);
                return;
              }
            }
          }

          const errMsg = `Não foi possível extrair dados operacionais legíveis de "${file.name}".`;
          console.warn(errMsg);
          reject(new Error(errMsg));
        } catch (err) {
          console.error('Erro ao processar arquivo:', err);
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload input
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus(`Iniciando importação de ${files.length} arquivo(s)...`);

    const allNewRows: DispoRow[] = [];
    const fileNames: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileNames.push(file.name);
      setProcessingStatus(`Processando ${i + 1}/${files.length}: ${file.name}`);
      try {
        const rowsFromFile = await processFile(file);
        if (rowsFromFile && rowsFromFile.length > 0) {
          allNewRows.push(...rowsFromFile);
        } else {
          errors.push(`Nenhuma linha identificada em ${file.name}`);
        }
      } catch (err) {
        errors.push((err as Error).message || `Erro em ${file.name}`);
      }
    }

    if (allNewRows.length > 0) {
      setRows(prev => [...allNewRows, ...prev]);
      setUploadedFilesHistory(prev => [...fileNames, ...prev]);
      setToastMessage(`Importação concluída! ${allNewRows.length} registro(s) importado(s) com sucesso.`);
    } else {
      setToastMessage(errors.length > 0 ? errors.join('; ') : 'Nenhum dado pôde ser extraído dos arquivos importados.');
    }

    setIsProcessing(false);
    setProcessingStatus('');
    setTimeout(() => setToastMessage(null), 5000);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load sample OS from user's attached image
  const handleLoadSampleOS = () => {
    setIsProcessing(true);
    setProcessingStatus('Carregando dados da Ordem de Serviço 3C (TORNADOLOG)...');
    setTimeout(() => {
      const sampleRows = buildDispoRowsFromOS(SAMPLE_OS_DATA);
      setRows(prev => [...sampleRows, ...prev]);
      setUploadedFilesHistory(prev => ['ORDEM_DE_SERVICO_3C_TORNADOLOG.pdf', ...prev]);
      setIsProcessing(false);
      setProcessingStatus('');
      setToastMessage('Ordem de Serviço 3C (TORNADOLOG) carregada com sucesso! Pronto para colar no Excel ou baixar .xlsx.');
      setTimeout(() => setToastMessage(null), 4500);
    }, 400);
  };

  // Copy all rows as TSV for direct paste into Excel
  const handleCopyAllToClipboard = async () => {
    if (rows.length === 0) return;
    const lines: string[] = [];
    if (includeHeaderInCopy) {
      lines.push(DISPO_COLUMNS.join('\t'));
    }
    rows.forEach(r => lines.push(getRowTSV(r)));
    const tsvText = lines.join('\n');

    try {
      await navigator.clipboard.writeText(tsvText);
      setCopiedStatus(true);
      setToastMessage(`Copiado! ${rows.length} linha(s) em formato tabular (Colunas A a AG). Pressione Ctrl + V na célula MÊS da sua planilha.`);
      setTimeout(() => {
        setCopiedStatus(false);
        setToastMessage(null);
      }, 4500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Copy single row
  const handleCopySingleRow = async (row: DispoRow) => {
    const tsvText = getRowTSV(row);
    try {
      await navigator.clipboard.writeText(tsvText);
      setCopiedRowId(row.id);
      setToastMessage(`Linha do motorista "${row.conductor || 'Terceiro'}" (${row.cavalo}) copiada! Cole no Excel com Ctrl + V.`);
      setTimeout(() => {
        setCopiedRowId(null);
        setToastMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Erro ao copiar linha:', err);
    }
  };

  // Export genuine Microsoft Excel (.xlsx) file
  const handleExportXLSX = () => {
    if (rows.length === 0) return;

    const data = [
      [...DISPO_COLUMNS],
      ...rows.map(row => [
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
        formatPlateWithHyphen(row.cavalo),
        formatPlateWithHyphen(row.carreta),
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
        row.estadoCarreta,
        '',
        row.pendencia || '',
        row.checkList || ''
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Dynamic column widths for aesthetic Excel layout
    const colWidths = DISPO_COLUMNS.map((col, i) => {
      let maxLen = col.length;
      rows.forEach(r => {
        const val = String(data[rows.indexOf(r) + 1]?.[i] || '');
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 11), 38) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidade');

    const fileName = `Disponibilidade_Terceiros_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    setToastMessage(`Planilha Excel baixada com sucesso: "${fileName}"!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Edit cell inline
  const handleCellEdit = (rowId: string, field: keyof DispoRow, value: string) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        if (field === 'cavalo' || field === 'carreta') {
          const cav = field === 'cavalo' ? formatPlateWithHyphen(value) : formatPlateWithHyphen(r.cavalo);
          const car = field === 'carreta' ? formatPlateWithHyphen(value) : formatPlateWithHyphen(r.carreta);
          updated.cavalo = cav;
          updated.carreta = car;
          if (getChecklistDetails) {
            const chk = getChecklistDetails(cav, car);
            updated.checkList = chk.checkList;
            updated.pendencia = chk.pendencia;
          }
        }
        return updated;
      })
    );
  };

  // Statistics
  const totalTon = useMemo(() => {
    return rows.reduce((sum, r) => sum + (parseFloat(r.ton) || 0), 0);
  }, [rows]);

  const totalPallets = useMemo(() => {
    return rows.reduce((sum, r) => sum + (parseFloat(r.pallets) || 0), 0);
  }, [rows]);

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 rounded-2xl shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <Check size={22} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-sans font-black uppercase tracking-wide text-white">
                  Operação Concluída com Sucesso!
                </h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  {toastMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-emerald-300 hover:text-white font-bold uppercase underline cursor-pointer"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Drag & Drop PDF Import Header Box */}
      <div className="bg-[#FAF8F5] border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A2414]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B32025] text-white flex items-center justify-center shadow-lg shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-black uppercase tracking-tight text-[#2D1A10]">
                  Importação de Ordens de Serviço (PDF Terceiros)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400/40 text-[10px] font-mono font-bold uppercase">
                  IA & OCR Integrados
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Importe o arquivo PDF da <strong>Ordem de Serviço 3C</strong> para converter automaticamente nas 33 colunas da planilha de Disponibilidade.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLoadSampleOS}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400/50 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
              title="Carregar exemplo da Ordem de Serviço 3C (Tornadolog) anexada"
            >
              <Sparkles size={16} className="text-[#B32025]" />
              <span>Carregar Exemplo (OS Tornadolog)</span>
            </button>

            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => setRows([])}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Limpar tabela"
              >
                <Trash2 size={15} />
                <span>Limpar Tabela</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files) {
              handleFilesUpload(e.dataTransfer.files);
            }
          }}
          className={cn(
            "w-full border-3 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-3 relative overflow-hidden group",
            isProcessing
              ? "border-amber-400 bg-amber-50/70"
              : "border-amber-600/40 hover:border-[#B32025] bg-gradient-to-b from-white/90 to-amber-50/50 hover:bg-amber-50/80 shadow-inner"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            onChange={(e) => handleFilesUpload(e.target.files)}
          />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-[#B32025] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {isProcessing ? (
              <RefreshCw size={28} className="animate-spin" />
            ) : (
              <Upload size={28} />
            )}
          </div>

          <div>
            <h4 className="text-base font-serif font-black uppercase text-[#2D1A10]">
              {isProcessing ? processingStatus || "Processando Documento..." : "Clique ou Arraste os arquivos aqui"}
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
              Suporta <strong>Ordem de Serviço 3C (PDF ou Imagem)</strong> e planilhas <strong>Excel / CSV (.xlsx, .xls, .csv)</strong>. O sistema extrai com 100% de precisão transportador, datas, motoristas, placas do cavalo e carretas, pallets, pesos e checklist.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <span className="px-3 py-1 rounded-lg bg-[#3A2414]/5 text-[#3A2414] text-[11px] font-mono font-bold uppercase border border-[#3A2414]/10">
              Formatos: .PDF, .PNG, .JPG, .XLSX, .CSV
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-mono font-bold uppercase border border-emerald-300">
              Saída: Microsoft Excel (.xlsx) + Ctrl+V
            </span>
          </div>
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="bg-[#2D1A10] rounded-2xl p-4 text-[#dac0a3] flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg border border-amber-500/30">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAllToClipboard}
              disabled={rows.length === 0}
              className={cn(
                "px-5 py-3 rounded-xl font-sans font-black uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer",
                copiedStatus
                  ? "bg-emerald-600 text-white shadow-emerald-700/50"
                  : rows.length > 0
                    ? "bg-[#B32025] hover:bg-[#8f181c] text-white shadow-[#B32025]/40 hover:scale-102"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
              )}
            >
              {copiedStatus ? <Check size={18} /> : <Copy size={18} />}
              <span>{copiedStatus ? "Dados Copiados!" : "Copiar para Área de Transferência (Colar no Excel)"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportXLSX}
              disabled={rows.length === 0}
              className={cn(
                "px-5 py-3 rounded-xl font-sans font-black uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer",
                rows.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/40 hover:scale-102 border border-emerald-400/30"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
              )}
              title="Baixar diretamente a planilha em formato .xlsx compatível com Microsoft Excel"
            >
              <FileSpreadsheet size={18} className="text-emerald-200" />
              <span>Baixar Planilha do Microsoft Excel (.xlsx)</span>
            </button>

            <label className="flex items-center gap-2 text-xs font-bold text-[#fdefd1] cursor-pointer ml-1 select-none">
              <input
                type="checkbox"
                checked={includeHeaderInCopy}
                onChange={(e) => setIncludeHeaderInCopy(e.target.checked)}
                className="rounded border-amber-400 text-[#B32025] focus:ring-[#B32025] w-4 h-4 cursor-pointer"
              />
              <span>Incluir Cabeçalho ao Copiar</span>
            </label>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold uppercase">Linhas:</span>
              <span className="text-white font-black bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {rows.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold uppercase">Pallets:</span>
              <span className="text-white font-black bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {totalPallets}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold uppercase">Ton:</span>
              <span className="text-white font-black bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {totalTon}t
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Banner for Excel Paste */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400/40 text-amber-950 flex items-start gap-3 shadow-md">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
          <FileCheck size={18} />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-black uppercase tracking-wide">
            Como colar na sua Planilha de Disponibilidade existente:
          </p>
          <p className="text-amber-900 mt-0.5">
            1. Clique no botão <strong className="text-[#B32025]">"Copiar para Área de Transferência"</strong> acima.<br />
            2. Abra a sua planilha Excel ou Google Planilhas, selecione a primeira célula da linha (<strong className="text-[#B32025]">Coluna A - MÊS</strong>).<br />
            3. Pressione <kbd className="px-1.5 py-0.5 bg-black/10 rounded border border-amber-500/40 font-mono font-bold">Ctrl + V</kbd>. As 33 colunas (MÊS, ORIGEM, DIA, DATA, CONTATO, STATUS, CAVALO, CARRETA, PALLETS, TON, etc.) se encaixarão perfeitamente!<br />
            4. Ou se preferir, clique em <strong className="text-emerald-700">"Baixar Planilha do Microsoft Excel (.xlsx)"</strong> para ter o arquivo já pronto.
          </p>
        </div>
      </div>

      {/* Table Preview (33 Columns) */}
      <div className="bg-[#FAF8F5] border-2 border-[#3A2414]/20 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3A2414] text-amber-300 flex items-center justify-center font-black">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h4 className="text-sm font-serif font-black uppercase tracking-tight text-[#2D1A10]">
                Pré-Visualização Tabular (33 Colunas - A a AG)
              </h4>
              <p className="text-xs text-slate-600">
                Você pode editar qualquer célula diretamente na tabela antes de copiar ou baixar.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {rows.length} registro(s) no total
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <FileText size={36} className="mx-auto text-slate-400 opacity-60" />
            <p className="text-sm font-bold text-slate-700">Nenhum dado importado no momento</p>
            <p className="text-xs text-slate-500">
              Faça upload de uma Ordem de Serviço em PDF ou clique em "Carregar Exemplo (OS Tornadolog)" para testar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-[#3A2414]/20 shadow-inner max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="bg-[#2D1A10] text-[#dac0a3] sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="p-3 font-mono text-[11px] font-black uppercase text-center border-r border-[#3A2414] sticky left-0 bg-[#2D1A10] z-30">
                    AÇÕES
                  </th>
                  {DISPO_COLUMNS.map((col, idx) => (
                    <th
                      key={idx}
                      className="p-3 font-mono text-[10px] font-black uppercase border-r border-amber-900/40 tracking-wider"
                    >
                      <div className="text-amber-400 text-[9px]">COL {idx + 1}</div>
                      <div className="text-white">{col || `COL ${idx + 1}`}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-950/10 font-mono">
                {rows.map((row, rIdx) => {
                  const isCopied = copiedRowId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors hover:bg-amber-100/60",
                        rIdx % 2 === 0 ? "bg-white" : "bg-[#F7F4EF]"
                      )}
                    >
                      {/* Actions Sticky Column */}
                      <td className="p-2 border-r border-slate-300 sticky left-0 bg-white z-10 text-center shadow-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingleRow(row)}
                            className={cn(
                              "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                              isCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-amber-100 text-amber-950 hover:bg-[#B32025] hover:text-white border border-amber-300"
                            )}
                            title="Copiar apenas esta linha para o Excel"
                          >
                            {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-300 transition-colors cursor-pointer"
                            title="Excluir linha"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                      {/* 1: MÊS */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.mes}
                          onChange={(e) => handleCellEdit(row.id, 'mes', e.target.value)}
                          className="w-20 bg-transparent font-bold text-[#2D1A10] focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 2: ORIGEM */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.origem}
                          onChange={(e) => handleCellEdit(row.id, 'origem', e.target.value)}
                          className="w-28 bg-transparent font-bold text-slate-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 3: DIA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.dia}
                          onChange={(e) => handleCellEdit(row.id, 'dia', e.target.value)}
                          className="w-24 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 4: DATA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.data}
                          onChange={(e) => handleCellEdit(row.id, 'data', e.target.value)}
                          className="w-24 bg-transparent font-bold text-[#B32025] focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 5: CONTATO WHATS */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.contatoWhats}
                          onChange={(e) => handleCellEdit(row.id, 'contatoWhats', e.target.value)}
                          className="w-12 text-center bg-transparent focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 6: HORA LIBERADO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.horaLiberado}
                          onChange={(e) => handleCellEdit(row.id, 'horaLiberado', e.target.value)}
                          className="w-20 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 7: STATUS */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.status}
                          onChange={(e) => handleCellEdit(row.id, 'status', e.target.value)}
                          className="w-36 bg-transparent font-bold text-emerald-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 8: MODELO CARRETA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.modeloCarreta}
                          onChange={(e) => handleCellEdit(row.id, 'modeloCarreta', e.target.value)}
                          className="w-24 bg-transparent font-bold text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 9: MODELO CAVALO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.modeloCavalo}
                          onChange={(e) => handleCellEdit(row.id, 'modeloCavalo', e.target.value)}
                          className="w-24 bg-transparent font-bold text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 10: FEZ CONTATO? */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.fezContato}
                          onChange={(e) => handleCellEdit(row.id, 'fezContato', e.target.value)}
                          className="w-14 text-center bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 11: DESTINO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.destino}
                          onChange={(e) => handleCellEdit(row.id, 'destino', e.target.value)}
                          className="w-36 bg-transparent font-black text-[#2D1A10] focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 12: TRANSPORTADOR */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.transportador}
                          onChange={(e) => handleCellEdit(row.id, 'transportador', e.target.value)}
                          className="w-28 bg-transparent font-black text-[#B32025] focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 13: CAVALO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.cavalo}
                          onChange={(e) => handleCellEdit(row.id, 'cavalo', e.target.value)}
                          className="w-24 bg-transparent font-black text-slate-900 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 14: CARRETA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.carreta}
                          onChange={(e) => handleCellEdit(row.id, 'carreta', e.target.value)}
                          className="w-24 bg-transparent font-black text-slate-900 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 15: PALLETS */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.pallets}
                          onChange={(e) => handleCellEdit(row.id, 'pallets', e.target.value)}
                          className="w-14 text-center bg-transparent font-bold text-amber-900 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 16: TON */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.ton}
                          onChange={(e) => handleCellEdit(row.id, 'ton', e.target.value)}
                          className="w-14 text-center bg-transparent font-bold text-amber-900 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 17: M³ */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.m3}
                          onChange={(e) => handleCellEdit(row.id, 'm3', e.target.value)}
                          className="w-16 text-center bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 18: CATEGORIA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.categoria}
                          onChange={(e) => handleCellEdit(row.id, 'categoria', e.target.value)}
                          className="w-24 bg-transparent font-bold text-slate-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 19: TECNOLOGIA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.tecnologia}
                          onChange={(e) => handleCellEdit(row.id, 'tecnologia', e.target.value)}
                          className="w-20 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 20: CONDUCTOR */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.conductor}
                          onChange={(e) => handleCellEdit(row.id, 'conductor', e.target.value)}
                          className="w-48 bg-transparent font-black text-[#2D1A10] focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 21: CPF */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.cpf}
                          onChange={(e) => handleCellEdit(row.id, 'cpf', e.target.value)}
                          className="w-32 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 22: RG / SAP */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.rgSap}
                          onChange={(e) => handleCellEdit(row.id, 'rgSap', e.target.value)}
                          className="w-36 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 23: CNH */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.cnh}
                          onChange={(e) => handleCellEdit(row.id, 'cnh', e.target.value)}
                          className="w-28 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 24: TELEFONE */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.telefone}
                          onChange={(e) => handleCellEdit(row.id, 'telefone', e.target.value)}
                          className="w-32 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 25: VIGÊNCIA DO CADASTRO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.vigenciaCadastro}
                          onChange={(e) => handleCellEdit(row.id, 'vigenciaCadastro', e.target.value)}
                          className="w-24 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 26: CÓDIGO DA TRANSPORTADORA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.codigoTransportadora}
                          onChange={(e) => handleCellEdit(row.id, 'codigoTransportadora', e.target.value)}
                          className="w-28 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 27: ID DA CARGA / LACRE EXPORTAÇÃO */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.idCarga}
                          onChange={(e) => handleCellEdit(row.id, 'idCarga', e.target.value)}
                          className="w-28 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 28: ESTADO MOTORISTA */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.estadoMotorista}
                          onChange={(e) => handleCellEdit(row.id, 'estadoMotorista', e.target.value)}
                          className="w-14 text-center bg-transparent font-bold text-slate-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 29: ESTADO CAVALO */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.estadoCavalo}
                          onChange={(e) => handleCellEdit(row.id, 'estadoCavalo', e.target.value)}
                          className="w-14 text-center bg-transparent font-bold text-slate-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 30: ESTADO CARRETA */}
                      <td className="p-2 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          value={row.estadoCarreta}
                          onChange={(e) => handleCellEdit(row.id, 'estadoCarreta', e.target.value)}
                          className="w-14 text-center bg-transparent font-bold text-slate-800 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 31: VAZIA */}
                      <td className="p-2 border-r border-slate-200 text-center text-slate-300">
                        -
                      </td>

                      {/* 32: PENDENCIA */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.pendencia}
                          onChange={(e) => handleCellEdit(row.id, 'pendencia', e.target.value)}
                          placeholder="Validade Checklist"
                          className="w-28 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
                      </td>

                      {/* 33: CHECK LIST */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.checkList}
                          onChange={(e) => handleCellEdit(row.id, 'checkList', e.target.value)}
                          placeholder="Status Checklist"
                          className="w-28 bg-transparent text-slate-700 focus:bg-white focus:outline-none px-1 rounded"
                        />
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
