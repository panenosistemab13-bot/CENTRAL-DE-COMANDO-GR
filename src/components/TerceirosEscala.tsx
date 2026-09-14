import React, { useState, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DispoRow, normalizeDestino } from './Escala';
import { ApoliceItem } from './ApoliceEscala';
import { DEFAULT_TRANSPORTADORAS, findClosestTransportador } from '../data/transportadoras';

// Configuração do Worker do PDF.js (100% no navegador)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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

export default function TerceirosEscala({
  apoliceItems = [],
  transportadoras = DEFAULT_TRANSPORTADORAS,
  getChecklistDetails,
  formatPlateWithHyphen = formatPlate,
  getMonthAbbrev = getCurrentMonthAbbrev,
  getDayOfWeek = getDayOfWeekHelper
}: TerceirosEscalaProps) {
  const [rows, setRows] = useState<DispoRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // 1. Data e Hora
    const dateMatch = cleanText.match(/(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4})/);
    const dataStr = dateMatch ? dateMatch[1].replace(/\./g, '/') : new Date().toLocaleDateString('pt-BR');
    const timeMatch = cleanText.match(/(?:HORA|HORÁRIO|PREVISÃO|PREVISAO)[\s\:\-]+(\d{1,2}\:\d{2}(?:\:\d{2})?)/i) ||
      cleanText.match(/(\d{2}\:\d{2}(?:\:\d{2})?)/);
    const horaVal = timeMatch ? (timeMatch[1].length === 5 ? `${timeMatch[1]}:00` : timeMatch[1]) : '08:00:00';

    // 2. Placas
    const plateRegex = /\b([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})\b/gi;
    const foundPlates = Array.from(new Set(cleanText.match(plateRegex) || [])).map(p => formatPlateWithHyphen(p));

    const cavaloPlaca = foundPlates[0] || '';
    const carreta1Placa = foundPlates[1] || '';
    const carreta2Placa = foundPlates[2] || '';

    // 3. Documentos e Contatos
    const cpfMatch = cleanText.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\b\d{11}\b)/);
    const cpf = cpfMatch ? cpfMatch[1] : '';

    const cnhMatch = cleanText.match(/(?:CNH|REGISTRO CNH|REGISTRO)[\s\:\-]+(\d{9,11})/i);
    const cnh = cnhMatch ? cnhMatch[1] : '';

    const rgMatch = cleanText.match(/(?:RG|IDENTIDADE|SAP)[\s\:\-]+([A-Z0-9\.\-\/\s]{5,15})/i);
    const rgSap = rgMatch ? rgMatch[1].trim() : '';

    const telMatch = cleanText.match(/(?:TEL|TELEFONE|CEL|CELULAR|WHATSAPP)[\s\:\-]+(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/i) ||
      cleanText.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/);
    const telefone = telMatch ? telMatch[0].trim() : '';

    // 4. Motorista / Condutor
    let conductor = '';
    const driverMatch = cleanText.match(/(?:MOTORISTA|CONDUTOR|NOME DO MOTORISTA)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s]{4,40})/i);
    if (driverMatch) {
      conductor = driverMatch[1].replace(/\b(CPF|RG|CNH|PLACA|CARRETA|CAVALO|TEL|CELULAR)\b.*/i, '').trim().toUpperCase();
    }

    // 5. Transportador - Analisa a coluna/campo do documento e busca a correspondência mais próxima na lista da aba TRANSPORTADOR
    let rawTransportadorFound = '';
    const transpMatch = cleanText.match(/(?:TRANSPORTADOR|TRANSPORTADORA|EMPRESA|TRANSP|TRANSPORTES)[\s\:\-]+([A-Z0-9\s\.\/\-\&]{3,40})/i);
    if (transpMatch) {
      rawTransportadorFound = transpMatch[1].replace(/\b(DATA|HORA|PLACA|MOTORISTA|CONDUTOR|DESTINO|CAVALO|CARRETA|CPF|CNH|RG|TEL|ORIGEM|STATUS)\b.*/i, '').trim();
    } else {
      rawTransportadorFound = cleanText;
    }

    const matchResult = findClosestTransportador(rawTransportadorFound, transportadoras);
    const transportador = matchResult.matchedName;

    // 6. Destino
    let destino = 'LONDRIANA';
    const destMatch = cleanText.match(/(?:DESTINO|FILIAL DESTINO|CIDADE DESTINO)[\s\:\-]+([A-ZÁÉÍÓÚÃÕÂÊÔÇ\s\|\-]+)/i);
    if (destMatch) {
      const rawDest = destMatch[1].replace(/\b(DATA|HORA|PLACA|MOTORISTA|TRANSPORTADOR)\b.*/i, '').trim();
      destino = normalizeDestino(rawDest);
    }

    // 7. Modelos
    let modeloCarreta = 'BAÚ';
    if (/RODOTREM/i.test(cleanText)) {
      modeloCarreta = /SIDER/i.test(cleanText) ? 'RODOTREM SIDER' : 'RODOTREM BAÚ';
    } else if (/SIDER/i.test(cleanText)) {
      modeloCarreta = 'SIDER';
    }

    let modeloCavalo = 'TRUCADO';
    if (/TOCO/i.test(cleanText)) modeloCavalo = 'TOCO';
    else if (/6X2|6X4|CAVALO TRUCADO/i.test(cleanText)) modeloCavalo = 'TRUCADO';

    // 8. Capacidades
    const palletsMatch = cleanText.match(/(\d{1,2})\s*(?:PALLETS|PALETS|PLT)/i);
    const tonMatch = cleanText.match(/(\d{1,2}(?:[\.,]\d{1,2})?)\s*(?:TON|TONELADAS|PESO)/i);
    const pallets = palletsMatch ? palletsMatch[1] : (modeloCarreta.includes('RODOTREM') ? '30' : '28');
    const ton = tonMatch ? tonMatch[1] : (modeloCarreta.includes('RODOTREM') ? '30' : '28');

    // 9. Checklist
    let chkDetails = { checkList: '', pendencia: '' };
    if (getChecklistDetails && cavaloPlaca) {
      chkDetails = getChecklistDetails(cavaloPlaca, carreta1Placa);
    }

    const mes = getMonthAbbrev(dataStr);
    const dia = getDayOfWeek(dataStr);
    const now = new Date();
    const horaAtual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // STATUS RIGOROSO: "REALIZAR IMPRESSÃO"
    const EXACT_STATUS = 'REALIZAR IMPRESSÃO';

    if (carreta1Placa && carreta2Placa) {
      const halfP = String(Math.round(parseInt(pallets, 10) / 2) || 15);
      const halfT = String(Math.round(parseFloat(ton) / 2) || 15);

      const row1: DispoRow = {
        id: `terceiro-${Date.now()}-1`,
        mes,
        origem: 'SANTA LUZIA|MG',
        dia,
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
        categoria: 'TERCEIRO',
        tecnologia: 'SIGHRA',
        conductor,
        cpf,
        rgSap,
        cnh,
        telefone,
        vigenciaCadastro: 'TERCEIRO',
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
      mes,
      origem: 'SANTA LUZIA|MG',
      dia,
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
      categoria: 'TERCEIRO',
      tecnologia: 'SIGHRA',
      conductor,
      cpf,
      rgSap,
      cnh,
      telefone,
      vigenciaCadastro: 'TERCEIRO',
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
      setRows(prev => [...extractedRows, ...prev]);
      setStatusMessage('');
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

  // Botão 1: Copiar dados para a planilha (Apenas linhas de dados, sem cabeçalho)
  const handleCopyTableToClipboard = async () => {
    if (rows.length === 0) return;

    const tsvLines = rows.map(r => [
      r.mes,
      r.origem,
      r.dia,
      r.data,
      r.contatoWhats,
      r.horaLiberado,
      r.status, // Garante o valor exato "REALIZAR IMPRESSÃO"
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
      setTimeout(() => setCopiedStatus(false), 3500);
    } catch (err) {
      console.error('Erro ao copiar dados:', err);
    }
  };

  // Botão 2: Baixar Excel (.xlsx)
  const handleDownloadXLSX = () => {
    if (rows.length === 0) return;

    const dataForSheet = rows.map(r => ({
      'MÊS': r.mes,
      'ORIGEM': r.origem,
      'DIA': r.dia,
      'DATA': r.data,
      'CONTATO WHATS': r.contatoWhats,
      'HORA LIBERADO': r.horaLiberado,
      'STATUS': r.status, // Garante o valor exato "REALIZAR IMPRESSÃO"
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

  return (
    <div className="space-y-6">
      {/* Upload Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                100% Frontend
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Suporte nativo para arquivos PDF (.pdf) e Microsoft Word (.docx)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="text-emerald-400" size={22} />
              Importação de Ordem de Serviço - Terceiros
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Faça o upload do documento PDF ou Word (.docx) para converter automaticamente em dados tabulares com a coluna STATUS padronizada como <strong className="text-emerald-300">REALIZAR IMPRESSÃO</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              className="hidden"
              id="pdf-docx-upload-input"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={cn(
                "px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-all flex items-center gap-2.5 cursor-pointer border",
                isProcessing
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30 hover:scale-102 active:scale-98"
              )}
            >
              <Upload size={18} />
              <span>{isProcessing ? 'Processando Arquivo...' : 'Importar PDF / DOCX'}</span>
            </button>
          </div>
        </div>

        {/* Status indicator */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-pulse">
            <Sparkles size={16} className="shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {uploadedFileName && !isProcessing && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Arquivo carregado: <strong className="text-white">{uploadedFileName}</strong> ({rows.length} registros extraídos)</span>
            </div>
            <button
              onClick={() => { setRows([]); setUploadedFileName(null); }}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Limpar</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions Bar (Copy & Download Excel) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
          <Truck size={16} className="text-cyan-400" />
          <span>Total de Linhas: <strong className="text-white font-bold">{rows.length}</strong></span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyTableToClipboard}
            disabled={rows.length === 0}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-md",
              copiedStatus
                ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : rows.length === 0
                  ? "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50"
                  : "bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30 hover:scale-102"
            )}
          >
            {copiedStatus ? (
              <>
                <Check size={16} className="stroke-[3]" />
                <span>Dados Copiados!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copiar dados para a planilha</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadXLSX}
            disabled={rows.length === 0}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border shadow-md",
              rows.length === 0
                ? "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50"
                : "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400/30 hover:scale-102"
            )}
          >
            <Download size={16} />
            <span>Baixar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs text-slate-200 border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">MÊS</th>
                <th className="py-3 px-3">ORIGEM</th>
                <th className="py-3 px-3">DATA</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">MODELO</th>
                <th className="py-3 px-3">DESTINO</th>
                <th className="py-3 px-3">TRANSP.</th>
                <th className="py-3 px-3">CAVALO</th>
                <th className="py-3 px-3">CARRETA</th>
                <th className="py-3 px-3">MOTORISTA</th>
                <th className="py-3 px-3">CPF</th>
                <th className="py-3 px-3">TELEFONE</th>
                <th className="py-3 px-3">VIGÊNCIA</th>
                <th className="py-3 px-3 text-center">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-14 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileSpreadsheet size={40} className="text-slate-600" />
                      <p className="font-bold text-slate-300 text-sm">
                        Nenhum dado extraído até o momento
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Clique em "Importar PDF / DOCX" acima para selecionar e converter a Ordem de Serviço de Terceiros diretamente no seu navegador.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-cyan-400">{row.mes}</td>
                    <td className="py-3 px-3">{row.origem}</td>
                    <td className="py-3 px-3 font-mono">{row.data}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px] whitespace-nowrap">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{row.modeloCarreta}</td>
                    <td className="py-3 px-3 font-bold text-amber-300 whitespace-nowrap">{row.destino}</td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      <select
                        value={row.transportador}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows(prev => prev.map(r => r.id === row.id ? { ...r, transportador: val } : r));
                        }}
                        className="bg-slate-950 border border-slate-700 text-blue-300 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-blue-400 cursor-pointer max-w-[160px]"
                        title="Transportador associado (Coluna M)"
                      >
                        {transportadoras.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">{row.cavalo}</td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">{row.carreta || '-'}</td>
                    <td className="py-3 px-3 font-bold text-slate-100 whitespace-nowrap">{row.conductor || '-'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{row.cpf || '-'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{row.telefone || '-'}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {row.vigenciaCadastro}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setRows(prev => prev.filter(r => r.id !== row.id))}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
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
  );
}
