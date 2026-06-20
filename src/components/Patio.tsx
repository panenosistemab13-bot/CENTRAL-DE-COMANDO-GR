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
  Check
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
const LicensePlate: React.FC<{ plate: string }> = ({ plate }) => {
  if (!plate || plate === '-') return <span className="text-[#5c3c24] font-mono font-bold">-</span>;
  
  const cleanPlate = plate.trim().toUpperCase();
  
  return (
    <div className="inline-flex flex-col items-center justify-center bg-[#f7f4ed] border-2 border-[#5c3c24]/80 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.35)] overflow-hidden select-none font-mono tracking-wider w-[120px] h-[40px] shrink-0 transform transition-transform hover:scale-105">
      {/* Blue Mercosul Header */}
      <div className="w-full bg-[#0051A2] h-[10px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5px] text-white font-sans font-bold scale-95">BR</span>
        <span className="text-[6.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">BRASIL</span>
        {/* Tiny Brazil Flag */}
        <div className="w-[8px] h-[5.5px] bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden">
          <div className="w-[4.5px] h-[3px] bg-yellow-400 rotate-45 transform flex items-center justify-center">
            <div className="w-[1.5px] h-[1.5px] bg-blue-800 rounded-full"></div>
          </div>
        </div>
      </div>
      {/* License plate characters */}
      <div className="w-full flex-1 flex items-center justify-center bg-gradient-to-b from-[#ffffff] to-[#e8e4db] px-2">
        <span className="text-[#1a1c1d] font-black text-[15px] tracking-wide leading-none select-all animate-fade-in" style={{ textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.8)' }}>
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
  const [activeSubTab, setActiveSubTab] = useState<'patio' | 'disponibilidade'>('patio');
  const [disponibilidadeGreeting, setDisponibilidadeGreeting] = useState<'bom dia' | 'boa tarde' | 'boa noite'>('bom dia');
  const [disponibilidadeInput, setDisponibilidadeInput] = useState('');
  const [dispCopied, setDispCopied] = useState(false);

  useEffect(() => {
    // Escutar rtdb
    const patioRef = ref(db, 'patio/veiculos');
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
    // Escutar referências para cruzamento de dados de destino e outros valores
    const refsRef = ref(db, 'pre_alertas/referencias');
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
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-[94rem] mx-auto mt-2 mb-6 shrink-0">
        
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
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600 border border-[#fefdfa] animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.7)]" />
                <span className="text-xs font-mono font-black text-[#5c3c24] uppercase tracking-widest pl-0.5">
                  MÓDULO ATIVO
                </span>
              </div>
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
      ) : (
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
                
                {/* Greeting Dropdown Selector */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3c24]">Saudação Inicial (Menu Suspenso):</label>
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
                    <div className="bg-[#ffffff] border-3 border-[#311f14] rounded-2xl p-6 shadow-md text-left select-text w-full overflow-x-hidden">
                    
                    {/* Hardcoded Header Info with dropdown alignment */}
                    <div className="border-b border-dashed border-stone-300 pb-4 mb-5 select-text font-sans text-black" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                      <p className="text-[15px] text-black m-0 leading-normal" style={{ marginBottom: '16px', fontFamily: 'Verdana', fontWeight: 'normal' }}>
                        Prezados, {disponibilidadeGreeting}!
                      </p>
                      <p className="text-[15px] text-black m-0 leading-normal" style={{ marginBottom: '4px', fontFamily: 'Verdana', fontWeight: 'normal' }}>
                        Segue a disponibilidade de veículos.
                      </p>
                      <p className="text-[15px] text-black m-0 leading-normal" style={{ fontFamily: 'Verdana' }}>
                        <span className="bg-[#b4a7d6] text-black px-1 py-0.5 rounded-none font-bold text-[17px]" style={{ fontSize: '17px', fontWeight: 'bold', fontFamily: 'Verdana' }}>Favor ficarem atentos à origem de cada carregamento</span>.
                      </p>
                    </div>

                    {/* Preview Table */}
                    {(() => {
                      const { headers, rows } = parseTableData(disponibilidadeInput);
                      if (headers.length === 0) return null;
                      return (
                        <div className="overflow-x-auto rounded-none border border-black max-w-full select-text">
                          <table className="w-full text-left border-collapse min-w-full" style={{ border: '1px solid #000000' }}>
                            <thead>
                              <tr>
                                {headers.map((h, hIdx) => (
                                  <th key={hIdx} style={getCellStyleObj(h, true)}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="select-text">
                              {rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {headers.map((_, colIdx) => {
                                    const cellVal = row[colIdx] || '';
                                    return (
                                      <td key={colIdx} style={getCellStyleObj(cellVal, false)}>
                                        {cellVal}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>
            </WoodenPlaque>
            </div>
          </div>

        </div>
      )}

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
