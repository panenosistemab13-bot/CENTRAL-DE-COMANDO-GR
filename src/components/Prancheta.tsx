import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Download, 
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface PranchetaRow {
  id: string;
  noIsca: string;
  data: string;
  hora: string;
  doca: string;
  cavalo: string;
  carreta: string;
  m3: string;
  destino: string;
  noNf: string;
  responsavel: string;
  produto: string;
  uma: string;
  valorNf: string;
  preAlertaGr: string;
  planCarreg: string;
  baixaGr: string;
}

export const INITIAL_PRANCHETA_ROWS: PranchetaRow[] = [
  {
    id: '1',
    noIsca: 'R10000639',
    data: '21/07',
    hora: '22:03',
    doca: '03',
    cavalo: 'TYM5E00',
    carreta: 'GEK8H91',
    m3: '88',
    destino: 'Guarulhos',
    noNf: '2932174',
    responsavel: 'Vini',
    produto: '12031025',
    uma: '13758510281',
    valorNf: '417.897,75',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '2',
    noIsca: 'R10000913',
    data: '21/07',
    hora: '22:06',
    doca: '',
    cavalo: 'TYM5F10',
    carreta: 'EGK4H93',
    m3: '98',
    destino: 'Guarulhos',
    noNf: '2932175',
    responsavel: 'Vini',
    produto: '12031025',
    uma: '13758516172',
    valorNf: '417.897,75',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '3',
    noIsca: 'R10000839',
    data: '22/07',
    hora: '06:25',
    doca: '07',
    cavalo: 'SAS2D02',
    carreta: 'SJOA12',
    m3: '',
    destino: 'MOC',
    noNf: '610307735',
    responsavel: 'Vini',
    produto: '12031007',
    uma: '6000000017382',
    valorNf: '22.371,79',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '4',
    noIsca: 'R10000629',
    data: '22/07',
    hora: '08:07',
    doca: '06',
    cavalo: 'SAS2D02',
    carreta: 'SBI2C02',
    m3: '',
    destino: 'MOC',
    noNf: '610320423',
    responsavel: 'Vini',
    produto: '12051024',
    uma: '13505370123',
    valorNf: '133.726,75',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '5',
    noIsca: 'R10001586',
    data: '22/07',
    hora: '06:25',
    doca: '05',
    cavalo: 'SJR2D83',
    carreta: 'QSU0B27',
    m3: '',
    destino: 'Londrina',
    noNf: '2932188',
    responsavel: 'Vini',
    produto: '12121019',
    uma: '13714400049',
    valorNf: '639.075,72',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '6',
    noIsca: 'R10000081',
    data: '22/07',
    hora: '14:03',
    doca: '04',
    cavalo: 'RYU1A28',
    carreta: 'TPJ9H20',
    m3: '107',
    destino: 'Gov. Celso',
    noNf: '2932205',
    responsavel: 'Vini',
    produto: '12031245',
    uma: '13741400069',
    valorNf: '703.054,23',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '7',
    noIsca: 'R100002197',
    data: '22/07',
    hora: '16:39',
    doca: '10',
    cavalo: 'SDI0A28',
    carreta: 'SDB0A92',
    m3: '88',
    destino: 'Cuiabá',
    noNf: '2932204',
    responsavel: 'Vini',
    produto: '12034101',
    uma: '13757180009',
    valorNf: '626.385,81',
    preAlertaGr: 'Vini',
    planCarreg: 'OK',
    baixaGr: 'OK',
  },
  {
    id: '8',
    noIsca: 'R100001483',
    data: '22/07',
    hora: '19:50',
    doca: '09',
    cavalo: 'PYV-8215',
    carreta: 'PVE-9195',
    m3: '98',
    destino: 'CABAM',
    noNf: '2932189',
    responsavel: 'PGEF',
    produto: '12034097',
    uma: '13696130083',
    valorNf: '553.292,06',
    preAlertaGr: 'PGEF',
    planCarreg: '',
    baixaGr: '',
  },
  {
    id: '9',
    noIsca: 'R100000756',
    data: '22/07',
    hora: '17:09',
    doca: '05',
    cavalo: 'SJX6E34',
    carreta: 'TDG1G94',
    m3: '86',
    destino: 'Gov. Celso',
    noNf: '2932203',
    responsavel: 'Vini',
    produto: '12031215',
    uma: 'Batida',
    valorNf: '1.069.271,88',
    preAlertaGr: 'Vini',
    planCarreg: '',
    baixaGr: '',
  },
  {
    id: '10',
    noIsca: 'R100000122',
    data: '22/07',
    hora: '20:05',
    doca: '10',
    cavalo: 'PVE0645',
    carreta: 'TIC0D95',
    m3: '91',
    destino: 'RS',
    noNf: '2932113',
    responsavel: 'DCGF',
    produto: '12041029',
    uma: '13790150086',
    valorNf: '230.688,60',
    preAlertaGr: 'DCGF',
    planCarreg: '',
    baixaGr: '',
  },
  {
    id: '11',
    noIsca: 'R100000756',
    data: '22/07',
    hora: '20:15',
    doca: '05',
    cavalo: 'DBW-9B15',
    carreta: '',
    m3: '86',
    destino: 'Londrina',
    noNf: '2932091',
    responsavel: 'DCGF',
    produto: '12031155',
    uma: '13578530014',
    valorNf: '246.981,22',
    preAlertaGr: 'DCGF',
    planCarreg: '',
    baixaGr: '',
  },
  {
    id: '12',
    noIsca: 'R100002203',
    data: '',
    hora: '',
    doca: '',
    cavalo: '',
    carreta: '',
    m3: '',
    destino: '',
    noNf: '',
    responsavel: '',
    produto: '',
    uma: '',
    valorNf: '',
    preAlertaGr: '',
    planCarreg: '',
    baixaGr: '',
  },
  {
    id: '13',
    noIsca: 'R100000780',
    data: '',
    hora: '',
    doca: '',
    cavalo: '',
    carreta: '',
    m3: '',
    destino: '',
    noNf: '',
    responsavel: '',
    produto: '',
    uma: '',
    valorNf: '',
    preAlertaGr: '',
    planCarreg: '',
    baixaGr: '',
  }
];

interface PranchetaProps {
  onUseRowInControle?: (row: PranchetaRow) => void;
}

export default function Prancheta({ onUseRowInControle }: PranchetaProps) {
  const [rows, setRows] = useState<PranchetaRow[]>(() => {
    const saved = localStorage.getItem('prancheta_digitalizada_rows');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRANCHETA_ROWS;
  });

  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const saveRows = (newRows: PranchetaRow[]) => {
    setRows(newRows);
    localStorage.setItem('prancheta_digitalizada_rows', JSON.stringify(newRows));
  };

  const handleCellChange = (id: string, field: keyof PranchetaRow, value: string) => {
    const updated = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    saveRows(updated);
  };

  const handleAddRow = () => {
    const newRow: PranchetaRow = {
      id: Date.now().toString(),
      noIsca: '',
      data: '',
      hora: '',
      doca: '',
      cavalo: '',
      carreta: '',
      m3: '',
      destino: '',
      noNf: '',
      responsavel: '',
      produto: '',
      uma: '',
      valorNf: '',
      preAlertaGr: '',
      planCarreg: '',
      baixaGr: '',
    };
    saveRows([...rows, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    saveRows(rows.filter((r) => r.id !== id));
  };

  const handleResetAnexo = () => {
    if (window.confirm('Restaurar a prancheta original anexada (21/07 - 22/07)?')) {
      saveRows(INITIAL_PRANCHETA_ROWS);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os registros da prancheta?')) {
      saveRows([]);
    }
  };

  const handleCopyRow = async (row: PranchetaRow) => {
    const text = [
      row.noIsca,
      row.data,
      row.hora,
      row.doca,
      row.cavalo,
      row.carreta,
      row.m3,
      row.destino,
      row.noNf,
      row.responsavel,
      row.produto,
      row.uma,
      row.valorNf,
      row.preAlertaGr,
      row.planCarreg,
      row.baixaGr,
    ].join('\t');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyAllTSV = async () => {
    const header = [
      'Nº ISCA',
      'DATA',
      'HORA',
      'DOCA',
      'CAVALO',
      'CARRETA',
      'M3',
      'DESTINO',
      'Nº NF',
      'RESPONSÁVEL',
      'PRODUTO',
      'U.M.A.',
      'VALOR NF (R$)',
      'PRE-ALERTA GR',
      'PLAN. CARREG.',
      'BAIXA GR'
    ].join('\t');

    const lines = rows.map((r) =>
      [
        r.noIsca,
        r.data,
        r.hora,
        r.doca,
        r.cavalo,
        r.carreta,
        r.m3,
        r.destino,
        r.noNf,
        r.responsavel,
        r.produto,
        r.uma,
        r.valorNf,
        r.preAlertaGr,
        r.planCarreg,
        r.baixaGr,
      ].join('\t')
    );

    const fullText = [header, ...lines].join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const fileName = file.name;
      const isTextFile = fileName.endsWith('.csv') || fileName.endsWith('.txt');

      if (isTextFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text && text.length > 0) {
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            const parsedRows: PranchetaRow[] = [];
            
            lines.forEach((line, idx) => {
              const parts = line.split(/[\t;,|]+/);
              if (parts.length >= 3) {
                parsedRows.push({
                  id: (Date.now() + idx).toString(),
                  noIsca: parts[0]?.trim() || '',
                  data: parts[1]?.trim() || '',
                  hora: parts[2]?.trim() || '',
                  doca: parts[3]?.trim() || '',
                  cavalo: parts[4]?.trim() || '',
                  carreta: parts[5]?.trim() || '',
                  m3: parts[6]?.trim() || '',
                  destino: parts[7]?.trim() || '',
                  noNf: parts[8]?.trim() || '',
                  responsavel: parts[9]?.trim() || '',
                  produto: parts[10]?.trim() || '',
                  uma: parts[11]?.trim() || '',
                  valorNf: parts[12]?.trim() || '',
                  preAlertaGr: parts[13]?.trim() || '',
                  planCarreg: parts[14]?.trim() || '',
                  baixaGr: parts[15]?.trim() || '',
                });
              }
            });

            if (parsedRows.length > 0) {
              saveRows([...rows, ...parsedRows]);
              alert(`${parsedRows.length} linhas importadas da prancheta!`);
            }
          }
          setIsProcessing(false);
        };
        reader.readAsText(file);
      } else {
        // Send PDF or Image file to backend API route /api/parse-prancheta
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileBase64 = event.target?.result as string;
          try {
            const res = await fetch('/api/parse-prancheta', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileBase64,
                mimeType: file.type || 'application/pdf',
                fileName: file.name
              })
            });

            const result = await res.json();
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
              const newRows: PranchetaRow[] = result.data.map((item: any, idx: number) => ({
                id: (Date.now() + idx + Math.random()).toString(),
                noIsca: item.noIsca || '',
                data: item.data || '',
                hora: item.hora || '',
                doca: item.doca || '',
                cavalo: item.cavalo || '',
                carreta: item.carreta || '',
                m3: item.m3 || '',
                destino: item.destino || '',
                noNf: item.noNf || '',
                responsavel: item.responsavel || '',
                produto: item.produto || '',
                uma: item.uma || '',
                valorNf: item.valorNf || '',
                preAlertaGr: item.preAlertaGr || '',
                planCarreg: item.planCarreg || '',
                baixaGr: item.baixaGr || ''
              }));

              saveRows([...rows, ...newRows]);
              alert(`Digitalização com IA concluída! ${newRows.length} registros extraídos da prancheta.`);
            } else {
              alert(result.error || 'Não foi possível extrair dados estruturados da prancheta. Verifique a qualidade do arquivo.');
            }
          } catch (err) {
            console.error('Erro ao enviar prancheta para API:', err);
            alert('Erro ao conectar ao serviço de leitura de pranchetas.');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo de prancheta:', error);
      setIsProcessing(false);
    }
  };

  const filteredRows = rows.filter((r) => {
    if (!filterText.trim()) return true;
    const search = filterText.toLowerCase();
    return (
      r.noIsca.toLowerCase().includes(search) ||
      r.cavalo.toLowerCase().includes(search) ||
      r.carreta.toLowerCase().includes(search) ||
      r.destino.toLowerCase().includes(search) ||
      r.noNf.toLowerCase().includes(search) ||
      r.produto.toLowerCase().includes(search) ||
      r.uma.toLowerCase().includes(search) ||
      r.responsavel.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Banner & Control Actions */}
      <div className="bg-[#FFFDFB] border-2 border-[#5c3e29] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7A0C22] font-black uppercase text-xs tracking-wider mb-1">
            <FileText size={18} />
            <span>Digitalização de Prancheta / Controle de Embarque de Iscas</span>
          </div>
          <p className="text-xs text-[#5c3e29] font-medium max-w-2xl">
            Informações digitalizadas exatamente como constam na prancheta em anexo. Você pode editar, filtrar, copiar ou importar novos arquivos de prancheta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-[#7A0C22] hover:bg-[#5a0919] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Upload size={14} />
            {isProcessing ? 'Processando...' : 'Importar PDF / Imagem'}
          </button>

          <button
            type="button"
            onClick={handleResetAnexo}
            className="bg-[#EFE3CD] hover:bg-[#e4d3b6] text-[#3e2516] border border-[#c5ab92] font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Restaurar dados originais da folha em anexo"
          >
            <RefreshCw size={14} />
            Carregar Prancheta Anexa
          </button>

          <button
            type="button"
            onClick={handleCopyAllTSV}
            className="bg-[#3e2516] hover:bg-[#28180e] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            {copiedAll ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copiedAll ? 'Copiado para Excel!' : 'Copiar Tabela (Excel)'}
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Limpar todos os registros da prancheta"
          >
            <Trash2 size={14} />
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* Top Warning Banner identical to the paper sheet */}
      <div className="bg-[#1a0509] text-white border-2 border-[#7A0C22] rounded-xl py-2.5 px-4 text-center font-black text-xs sm:text-sm tracking-wide uppercase shadow-md flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-amber-400 shrink-0" />
        <span>FAVOR NÃO ESQUECER DE MARCAR NA ÚLTIMA FOLHA O POSICIONAMENTO DA ISCA NA CARRETA</span>
      </div>

      {/* Filter and Add Row Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EFE3CD]/60 border border-[#c5ab92] rounded-2xl p-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6b4e]" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por Isca, Cavalo, NF, Destino..."
            className="w-full bg-white border border-[#c5ab92] rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-[#3e2516] outline-none focus:border-[#7A0C22]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-black text-[#5c3e29] uppercase mr-2">
            Total: {filteredRows.length} registros
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="bg-[#2e5d32] hover:bg-[#204323] text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} /> Adicionar Linha
          </button>
        </div>
      </div>

      {/* Main Table Matching the Prancheta Layout */}
      <div className="overflow-x-auto border-2 border-[#7A0C22] rounded-2xl shadow-xl bg-white max-w-full">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            {/* Top Multi-column Header */}
            <tr className="bg-[#7A0C22] text-white font-black text-[11px] uppercase tracking-wider text-center divide-x divide-[#5a0919] border-b border-[#5a0919]">
              <th className="p-2.5 min-w-[110px]" rowSpan={2}>Nº ISCA</th>
              <th className="p-2.5 min-w-[70px]" rowSpan={2}>DATA</th>
              <th className="p-2.5 min-w-[70px]" rowSpan={2}>HORA</th>
              <th className="p-2.5 min-w-[60px]" rowSpan={2}>DOCA</th>
              <th className="p-2.5 min-w-[95px]" rowSpan={2}>CAVALO</th>
              <th className="p-2.5 min-w-[95px]" rowSpan={2}>CARRETA</th>
              <th className="p-2.5 min-w-[55px]" rowSpan={2}>M³</th>
              <th className="p-2.5 min-w-[100px]" rowSpan={2}>DESTINO</th>
              <th className="p-2.5 min-w-[95px]" rowSpan={2}>Nº NF</th>
              <th className="p-2.5 min-w-[90px]" rowSpan={2}>RESP.</th>
              <th className="p-2.5 min-w-[95px]" rowSpan={2}>PRODUTO</th>
              <th className="p-2.5 min-w-[120px]" rowSpan={2}>U.M.A.</th>
              <th className="p-2.5 min-w-[110px]" rowSpan={2}>VALOR NF (R$)</th>
              <th className="p-2 border-b border-[#5a0919]" colSpan={3}>USO DO GR</th>
              <th className="p-2.5 min-w-[110px]" rowSpan={2}>AÇÕES</th>
            </tr>
            <tr className="bg-[#5a0919] text-white font-bold text-[10px] uppercase text-center divide-x divide-[#44030E]">
              <th className="p-1.5 min-w-[80px]">PRÉ-ALERTA GR</th>
              <th className="p-1.5 min-w-[80px]">PLAN. CARREG.</th>
              <th className="p-1.5 min-w-[80px]">BAIXA GR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1ccb0] font-sans font-medium text-[#3e2516]">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={17} className="p-8 text-center text-stone-500 font-bold uppercase">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "hover:bg-[#f3e9d8] transition-colors divide-x divide-[#e1ccb0]/80",
                      isEven ? "bg-[#FFFDFB]" : "bg-[#F9F4EB]"
                    )}
                  >
                    {/* Nº ISCA */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.noIsca}
                        onChange={(e) => handleCellChange(row.id, 'noIsca', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-bold font-mono text-[#7A0C22] uppercase focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* DATA */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.data}
                        onChange={(e) => handleCellChange(row.id, 'data', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* HORA */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.hora}
                        onChange={(e) => handleCellChange(row.id, 'hora', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* DOCA */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.doca}
                        onChange={(e) => handleCellChange(row.id, 'doca', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* CAVALO */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.cavalo}
                        onChange={(e) => handleCellChange(row.id, 'cavalo', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-black uppercase text-[#3e2516] focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* CARRETA */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.carreta}
                        onChange={(e) => handleCellChange(row.id, 'carreta', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-bold uppercase focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* M3 */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.m3}
                        onChange={(e) => handleCellChange(row.id, 'm3', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* DESTINO */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.destino}
                        onChange={(e) => handleCellChange(row.id, 'destino', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-bold uppercase focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* Nº NF */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.noNf}
                        onChange={(e) => handleCellChange(row.id, 'noNf', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-black font-mono focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* RESPONSÁVEL */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.responsavel}
                        onChange={(e) => handleCellChange(row.id, 'responsavel', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* PRODUTO */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.produto}
                        onChange={(e) => handleCellChange(row.id, 'produto', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-mono focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* U.M.A. */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.uma}
                        onChange={(e) => handleCellChange(row.id, 'uma', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 font-mono font-bold focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* VALOR NF */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.valorNf}
                        onChange={(e) => handleCellChange(row.id, 'valorNf', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-right font-black font-mono text-[#2e5d32] focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* PRÉ-ALERTA GR */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.preAlertaGr}
                        onChange={(e) => handleCellChange(row.id, 'preAlertaGr', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* PLAN. CARREG. */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.planCarreg}
                        onChange={(e) => handleCellChange(row.id, 'planCarreg', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold text-green-700 focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* BAIXA GR */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.baixaGr}
                        onChange={(e) => handleCellChange(row.id, 'baixaGr', e.target.value)}
                        className="w-full bg-transparent px-1 py-0.5 text-center font-bold text-green-700 focus:bg-white focus:ring-1 focus:ring-[#7A0C22] outline-none rounded"
                      />
                    </td>

                    {/* AÇÕES */}
                    <td className="p-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onUseRowInControle && (
                          <button
                            type="button"
                            onClick={() => onUseRowInControle(row)}
                            title="Usar no Gerador de Controle PGR"
                            className="p-1.5 bg-[#7A0C22] hover:bg-[#5a0919] text-white rounded-lg transition-all active:scale-90"
                          >
                            <ArrowRight size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyRow(row)}
                          title="Copiar linha"
                          className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-all active:scale-90"
                        >
                          {copiedId === row.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          title="Excluir linha"
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all active:scale-90"
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

      {/* Footer Notes section from sheet */}
      <div className="bg-[#FAF6ED] border border-[#c5ab92] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono font-bold text-[#5c3e29]">
        <div>
          <span className="text-[10px] uppercase text-[#8c6b4e] block font-sans">Anotações do Rodapé:</span>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <span>PRODUTO: 12035067</span>
            <span>CARRETA/PLACA: SBQ-1J22</span>
            <span>OUTRO: PW10372</span>
          </div>
        </div>
        <div className="text-right text-[10px] text-stone-500 font-sans">
          <span>Data Emissão: 21/07/2026 15:09:31</span>
        </div>
      </div>
    </div>
  );
}
