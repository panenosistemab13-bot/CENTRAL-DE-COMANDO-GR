import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PatioItem, initialPatioData } from '../data/patioData';
import { cn } from '../lib/utils';
import { MapPin, CheckCircle, Truck, FileCheck, ClipboardPaste, Upload, Trash2, Loader2, LayoutGrid, Activity, ShieldCheck, Search, Filter, Plus, Database } from 'lucide-react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { rtdb as db, handleFirestoreError, OperationType } from '../firebase';

const LicensePlate: React.FC<{ plate: string }> = ({ plate }) => {
  if (!plate || plate === '-') return <span className="text-slate-500 font-mono">-</span>;
  
  const cleanPlate = plate.trim().toUpperCase();
  
  return (
    <div className="inline-flex flex-col items-center justify-center bg-[#F8FAFC] border border-slate-400 rounded-md shadow-sm overflow-hidden select-none font-mono tracking-wider" style={{ width: '105px', height: '36px' }}>
      {/* Top blue bar representing Mercosul licence plate standard */}
      <div className="w-full bg-[#0051A2] h-[8px] flex items-center justify-between px-1.5 select-none leading-none">
        <span className="text-[5.5px] text-white font-sans font-black tracking-widest uppercase scale-90 origin-left">BRASIL</span>
        <div className="w-[4px] h-[3px] bg-yellow-400 rounded-xs"></div>
      </div>
      {/* Main plate text */}
      <div className="w-full flex-1 flex items-center justify-center bg-white">
        <span className="text-slate-950 font-black text-sm tracking-wide leading-none select-all">
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default function Patio() {
  const [patioData, setPatioData] = useState<PatioItem[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [referencias, setReferencias] = useState<{ [key: string]: any }>({});
  const [patioFilter, setPatioFilter] = useState<'Todos' | 'Sim' | 'Não'>('Todos');

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
    // Atualiza o estado local imediatamente para feedback visual instantâneo
    setPatioData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    try {
      // Atualizar campo específico no banco
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
      setStatusMsg({ type: 'success', text: 'Todos os dados foram limpos.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch(err) {
      handleFirestoreError(err, OperationType.DELETE, 'patio/veiculos');
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setStatusMsg({ type: 'error', text: 'Por favor, cole os dados do Excel ou selecione uma imagem.' });
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

        // Detect delimiter by counting occurrences in first few lines without using slice directly
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

        // Create a matrix of cells
        const rows = linhas.map(row => row.split(delimiter));

        // Helper to identify a license plate pattern (both older Brazilian formats and new Mercosul format)
        const isLicensePlate = (str: string): boolean => {
          const clean = str.replace(/[\s-]/g, '').toUpperCase();
          if (clean.length !== 7) return false;
          const firstThreeLetters = /^[A-Z]{3}$/.test(clean.substring(0, 3));
          const restAlphanumeric = /^[0-9][A-Z0-9][0-9]{2}$/.test(clean.substring(3));
          return firstThreeLetters && restAlphanumeric;
        };

        // 1. Scan for headers to find column mappings if present
        let colCavalo = -1;
        let colCarreta = -1;
        let colDestino = -1;
        let colOrigem = -1;
        let colTermo = -1;
        let headerRowIdx = -1;

        for (let r = 0; r < Math.min(rows.length, 5); r++) {
          const cells = rows[r].map(cell => cell.trim().toUpperCase());
          const hasCavaloHeader = cells.some(c => c.includes('CAVALO') || c === 'PLACA' || c.includes('VEICULO') || c.includes('VEÍCULO') || c.includes('PLACA_CV') || c === 'TRUCK');
          const hasDestinoHeader = cells.some(c => c.includes('DESTINO') || c.includes('CIDADE') || c.includes('FILIAL') || c === 'DEST');
          const hasOrigemHeader = cells.some(c => c.includes('ORIGEM'));
          if (hasCavaloHeader || hasDestinoHeader || hasOrigemHeader) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx !== -1) {
          const headers = rows[headerRowIdx].map(h => h.trim().toUpperCase());
          
          const findColumn = (keywords: string[], excludeKeywords: string[] = []): number => {
            // 1. Prioritized exact match of keywords (highest priority first)
            for (const kw of keywords) {
              const foundIdx = headers.findIndex(h => h === kw);
              if (foundIdx !== -1) return foundIdx;
            }
            
            // 2. Prioritized contains match of keywords with exclusion (flexible but safe)
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
        }

        // Process rows of data
        const dataStartIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
        
        let numCols = 1;
        for (let i = dataStartIdx; i < rows.length; i++) {
            if (rows[i].length > numCols) numCols = rows[i].length;
        }

        // Auto-profile columns if not found via header
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
          // Provide basic fallback by looking for cells that match common city/state patterns
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
            // Last resort fallback
            for (let c = 0; c < numCols; c++) {
              if (c !== colCavalo && c !== colCarreta) {
                  colDestino = c;
                  break;
              }
            }
          }

          if (colOrigem !== -1 && colDestino === -1) {
            // Find the best city pattern match strictly to the right of colOrigem
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

          // Double check they never point to the same column index
          if (colDestino !== -1 && colDestino === colOrigem) {
            colDestino = -1;
          }
        }

        const numColsFinal = numCols || 1;
        if (colCavalo === -1 || colCavalo >= numColsFinal) colCavalo = 0;
        // Do not force colDestino to colCavalo, allow it to be -1 if not found


        for (let r = dataStartIdx; r < rows.length; r++) {
          const row = rows[r];
          if (row.length === 0 || row.every(c => !c.trim())) continue;

          // Skip rows where the "Termo" column is "SIM"
          let isTermoSim = false;
          if (colTermo !== -1 && colTermo < row.length) {
            const termoVal = row[colTermo].trim().toUpperCase();
            if (termoVal === 'SIM' || termoVal === 'S') {
              isTermoSim = true;
            }
          }

          if (isTermoSim) {
            continue;
          }

          // Skip rows where the origin is MONTES CLAROS or VIANA (case-insensitive)
          let isExcludedOrigin = false;
          if (colOrigem !== -1 && colOrigem < row.length) {
            const origemVal = row[colOrigem].trim().toUpperCase();
            if (origemVal.includes('VIANA') || origemVal.includes('MONTES CLAROS')) {
              isExcludedOrigin = true;
            }
          } else {
            // Fallback scan: check all cells except the known dest, cavalo, carreta
            for (let c = 0; c < row.length; c++) {
              if (c === colDestino || c === colCavalo || c === colCarreta) continue;
              const cellVal = (row[c] || '').trim().toUpperCase();
              if (cellVal.includes('VIANA') || cellVal.includes('MONTES CLAROS')) {
                isExcludedOrigin = true;
                break;
              }
            }
          }

          if (isExcludedOrigin) {
            continue;
          }

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

          // If no plaque or matching plate found, create a generic entry with the raw data
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
          let destinoVal = 'SANTA LUZIA/MG'; // Default fallback destination if nothing fits disambiguation

          // B. Extract Carreta and Destino manually from column patterns
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
            // Basic check to ensure we aren't pulling a plate as destination if we deduced colDestino via density
            if (val && !isLicensePlate(val) && val.length > 1) {
              destinoVal = val;
            }
          } 
          
          // Only attempt heuristic fallback if the detected column produced a non-valid or empty result
          if (!destinoVal || destinoVal === '---' || destinoVal === 'SANTA LUZIA/MG' || isLicensePlate(destinoVal)) {
            // If the value is 'SANTA LUZIA/MG' but was found specifically by colDestino, we should probably keep it
            // So we only run heuristic if colDestino was NOT found or produced a definitely wrong value (like a plate)
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

          const registro = {
            cavalo: placa,
            carreta: carretaVal,
            destino: destinoVal,
            estaNoPatio: 'Não', // "todos têm que ficar não" as requested
            assinado: 'Não',
            inseridoEm: new Date().toISOString(),
            rawStr
          };
          novosRegistros.push(registro);
        }
      }

      if (novosRegistros.length === 0) {
        throw new Error('Nenhum registro encontrado no texto ou imagem informada.');
      }

      // 2. SALVAMENTO DIRETO E ISOLADO NO FIREBASE
      const patioRef = ref(db, 'patio/veiculos');
      const promises = novosRegistros.map(async (veiculo) => {
        // Find existing match by plate if possible, otherwise just insert
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

      setStatusMsg({ type: 'success', text: `${novosRegistros.length} registros integrados com sucesso!` });
      setPasteText('');
      setImageFile(null);

    } catch (error: any) {
      console.error("Erro no Pátio o:", error);
      setStatusMsg({ type: 'error', text: error.message || 'Falha ao processar os dados locais.' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const safeData = Array.isArray(patioData) ? patioData : [];

  const chartData = safeData.reduce((acc, curr) => {
    const found = acc.find(a => a.destino === curr.destino);
    if(found) found.count++;
    else acc.push({ destino: curr.destino || 'N/A', count: 1 });
    return acc;
  }, [] as { destino: string, count: number }[]);

  const filteredData = safeData.filter(item => {
    const matchesSearch = (item?.cavalo && item.cavalo.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (item?.carreta && item.carreta.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    
    // Regra de Negócio: Se estiver assinado como "Sim" (concluído), some da lista visual imediatamente
    if (item.assinado === 'Sim') return false;

    if (patioFilter === 'Todos') return true;
    return item.estaNoPatio === patioFilter;
  });

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-32 pt-4">
        {/* Superior Operational HUD */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
            <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-purple-600 rounded-full" />
                <h1 className="text-4xl font-black text-white tracking-[ -0.05em] flex items-center gap-4 leading-none uppercase">
                    Unidade Pátio
                    <span className="text-purple-500/40 text-xl font-mono px-3 border-l border-white/10 ml-2">SL-MG.01</span>
                </h1>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistema Ativo</span>
                    </div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{new Date().toLocaleDateString('pt-BR')} • {new Date().getHours()}:{new Date().getMinutes()}</span>
                </div>
            </div>

            <div className="hidden lg:flex flex-wrap gap-4">
                {[
                  { label: 'Em Permanência', value: safeData.filter(i => i.estaNoPatio === 'Sim').length, icon: Truck, color: 'text-emerald-400' },
                  { label: 'Fluxo Pendente', value: safeData.length, icon: Activity, color: 'text-purple-400' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#080a12] border border-white/5 p-5 min-w-[220px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] -rotate-45 translate-x-8 -translate-y-8" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={cn("p-2 bg-white/[0.03] border border-white/5 rounded-lg", stat.color)}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
        </div>

        {/* Console Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Tactical Console */}
            <div className="hidden lg:block lg:col-span-4 space-y-10">
                {/* Console de Ingestão */}
                <div className="bg-[#080a12] border border-white/10 p-8 relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 40px)` }} />
                    
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <Database size={16} className="text-purple-500" />
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Console de Ingestão</h2>
                        </div>
                        <div className="w-12 h-[1px] bg-white/10" />
                    </div>

                    <div className="space-y-6">
                        <div className="relative bg-black/60 border border-white/5 p-1">
                            <textarea 
                                className="w-full h-40 bg-transparent p-5 text-[11px] text-slate-400 font-mono resize-none focus:outline-none placeholder:text-slate-800"
                                placeholder="AGUARDANDO ENTRADA DE DADOS..."
                                value={pasteText}
                                onChange={(e) => setPasteText(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-700 uppercase">Input Buffer</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/20" />
                            </div>
                        </div>

                        {statusMsg && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "p-4 border-l-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-3",
                                    statusMsg.type === 'error' ? "bg-rose-500/5 border-rose-500 text-rose-400" : "bg-emerald-500/5 border-emerald-500 text-emerald-400"
                                )}
                            >
                                <ShieldCheck size={14} />
                                {statusMsg.text}
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={handleProcessData}
                                disabled={isProcessing}
                                className={cn(
                                    "w-full py-5 font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4",
                                    isProcessing ? "bg-slate-900 text-slate-700" : "bg-white text-black hover:bg-purple-500 hover:text-white"
                                )}
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Executar Lote
                            </motion.button>
                            <button 
                                onClick={handleClearAll}
                                className="w-full py-4 text-slate-600 hover:text-rose-500 font-black text-[9px] uppercase tracking-[0.4em] border border-white/5 hover:border-rose-500/20 transition-all"
                            >
                                Resetar Registros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Operational Monitor */}
            <div className="lg:col-span-8 flex flex-col gap-10">
                <div className="bg-[#080a12] border border-white/10 p-5 flex flex-col xl:flex-row items-center gap-10">
                    <div className="flex bg-black p-1 border border-white/5 xl:min-w-[320px]">
                        {(['Todos', 'Sim', 'Não'] as const).map((filterOpt) => (
                            <button
                                key={filterOpt}
                                onClick={() => setPatioFilter(filterOpt)}
                                className={cn(
                                    "flex-1 px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                    patioFilter === filterOpt 
                                        ? "bg-purple-600 text-white" 
                                        : "text-slate-600 hover:bg-white/5"
                                )}
                            >
                                {filterOpt}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-purple-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="LOCALIZAR PLACA OU MANIFESTO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/5 pl-14 pr-6 py-4 text-[10px] font-black tracking-[0.4em] text-white uppercase focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-800"
                        />
                    </div>
                </div>

                {/* Overhauled Vehicle Grid */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-1 gap-2 leading-none">
                        {filteredData.length === 0 ? (
                            <div className="py-32 text-center bg-[#080a12] border border-dashed border-white/5">
                                <span className="text-slate-700 font-black uppercase tracking-[0.6em] text-[10px]">Aguardando Sincronização de Fluxo</span>
                            </div>
                        ) : (
                            filteredData.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={item.id} 
                                    className="bg-[#080a12] border border-white/5 flex items-center hover:bg-purple-500/5 hover:border-purple-500/40 transition-all group h-20 overflow-hidden"
                                >
                                    {/* Vertical Index Stripe */}
                                    <div className="w-1.5 h-full bg-white/5 group-hover:bg-purple-500 transition-colors" />
                                    
                                    {/* Primary Key Identification */}
                                    <div className="px-10 flex items-center gap-10 min-w-[200px] border-r border-white/5 h-full">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Identificador</span>
                                            <LicensePlate plate={item.cavalo} />
                                        </div>
                                    </div>

                                    {/* Contextual Status Slab */}
                                    <div className="flex-1 px-12 grid grid-cols-2 gap-16">
                                        <div className="flex items-center gap-8">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] w-24">Está no Pátio?</span>
                                            <select 
                                                value={item.estaNoPatio} 
                                                onChange={(e) => updatePatioData(item.id, 'estaNoPatio', e.target.value)} 
                                                className={cn(
                                                    "bg-black border border-white/10 px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-purple-500/50 transition-all",
                                                    item.estaNoPatio === 'Sim' ? "text-emerald-500 border-emerald-500/40" : "text-slate-500"
                                                )}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] w-24">Assinou?</span>
                                            <select 
                                                value={item.assinado} 
                                                onChange={(e) => handleAssinadoChange(item.id, e.target.value)} 
                                                className={cn(
                                                    "bg-black border border-white/10 px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-purple-500/50 transition-all",
                                                    item.assinado === 'Sim' ? "text-emerald-500 border-emerald-500/40" : "text-slate-500"
                                                )}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Termination Action */}
                                    <div className="px-10 border-l border-white/5 h-full flex items-center">
                                        <button 
                                          onClick={() => handleDeleteItem(item.id)}
                                          className="p-3 text-slate-700 hover:text-rose-500 transition-colors"
                                          title="Deletar Registro"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mobile View - Refined Industrial Aesthetic */}
                <div className="md:hidden flex flex-col gap-3">
                    {filteredData.map((item) => (
                        <div key={item.id} className="p-5 bg-[#080a12] border border-white/5 flex flex-col gap-5 relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-purple-500/20" />
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Identificador</span>
                                    <LicensePlate plate={item.cavalo || ''} />
                                </div>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-3 bg-white/[0.02] border border-white/5 text-slate-700 hover:text-rose-500 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider italic">ESTÁ NO PÁTIO?</span>
                                    <select 
                                        value={item.estaNoPatio} 
                                        onChange={(e) => updatePatioData(item.id, 'estaNoPatio', e.target.value)} 
                                        className={cn(
                                            "w-full bg-black border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none",
                                            item.estaNoPatio === 'Sim' ? "text-emerald-500" : "text-slate-500"
                                        )}
                                    >
                                        <option>Sim</option>
                                        <option>Não</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider italic">ASSINOU?</span>
                                    <select 
                                        value={item.assinado} 
                                        onChange={(e) => handleAssinadoChange(item.id, e.target.value)} 
                                        className={cn(
                                            "w-full bg-black border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none",
                                            item.assinado === 'Sim' ? "text-emerald-500" : "text-slate-500"
                                        )}
                                    >
                                        <option>Sim</option>
                                        <option>Não</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
