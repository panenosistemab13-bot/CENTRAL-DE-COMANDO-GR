import React, { useState, useMemo } from 'react';
import {
  Truck,
  Building2,
  Calendar,
  ClipboardList,
  ShieldCheck,
  Search,
  Filter,
  Copy,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Check,
  ChevronDown,
  AlertCircle,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import highwayNightBg from '../assets/images/highway_night_bg_1789344097881.jpg';

export interface ApoliceItem {
  id: string;
  cavalo: string;
  carretas: string;
  transportador: string;
  motorista?: string;
  dataHoraViagem?: string;
  vigenciaCadastro: string;
  checkList: string;
  apolice: 'MACRO' | 'SEGURO PROPRIO' | string;
}

// Sample sheet text from user's spreadsheet
const SAMPLE_SHEET_TEXT = `SET|26\tSANTA LUZIA|MG\tsexta-feira\t11/09/2026\tX\t09:14:39\tCOLETAR ASSINATURA\tRODOTREM SIDER\tTRUCADO\tSIM\tLONDRINA\tMOEDENSE\tQWK6A22\tOLN7307\t31\t22\t87 m³\tFROTA\tSASCAR\tROBSON LUIS VIEIRA\t051.848.966-09\tMG10309990\t06451999242\t5531 9 9935-0970\t13/05/2027\t1000587291\t\tMG\tMG\tMG\t\t10/11/2026\tVALIDO
SET|26\tSANTA LUZIA|MG\tsexta-feira\t11/09/2026\tX\t09:14:39\tCOLETAR ASSINATURA\tRODOTREM SIDER\tTRUCADO\tSIM\tLONDRINA\tMOEDENSE\tQWK6A22\tOLN7457\t31\t22\t87 m³\tFROTA\tSASCAR\tROBSON LUIS VIEIRA\t051.848.966-09\tMG10309990\t06451999242\t5531 9 9935-0970\t13/05/2027\t1000587291\t\tMG\tMG\tMG\t\t10/11/2026\tVALIDO
SET|26\tSANTA LUZIA|MG\tsábado\t12/09/2026\t04:12:00\t07:16:30\tLIBERADO CARREGAMENTO\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSMAGNA\tSEV5A49\tFIW0188\t28\t30\t115 m³\tFROTA\tSIGHRA\tRICARDO VIEIRA DE SOUZA\t090.351.747-31\t05779176380 DETRAN RJ\t05578062121\t5521 9 9823-1176\tSEGURO PROPRIO\t1000506206\t\tRJ\tPR\tSC\t\t\tVENCIDO
SET|26\tSANTA LUZIA|MG\tsexta-feira\t11/09/2026\tX\t10:01:20\tCOLETAR ASSINATURA\tRODOTREM SIDER\tTRUCADO\tSIM\tGUARULHOS\tMOEDENSE\tQWK6A22\tOLN7307\t31\t22\t87 m³\tFROTA\tSASCAR\tRAYSON BARBOSA DE OLIVEIRA\t051.851.135-44\t14364422 SSP MG\t06983057212\t5531 9 8652-0925\t21/06/2027\t1000587291\t\tMG\tMG\tMG\t\t09/11/2026\tVALIDO
SET|26\tSANTA LUZIA|MG\tsexta-feira\t11/09/2026\tX\t10:01:20\tCOLETAR ASSINATURA\tRODOTREM SIDER\tTRUCADO\tSIM\tGUARULHOS\tMOEDENSE\tQWK6A22\tOLN7457\t31\t22\t87 m³\tFROTA\tSASCAR\tRAYSON BARBOSA DE OLIVEIRA\t051.851.135-44\t14364422 SSP MG\t06983057212\t5531 9 8652-0925\t21/06/2027\t1000587291\t\tMG\tMG\tMG\t\t09/11/2026\tVALIDO`;

export default function ApoliceEscala() {
  const [pasteInput, setPasteInput] = useState<string>('');
  const [items, setItems] = useState<ApoliceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterApolice, setFilterApolice] = useState<string>('TODAS');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Clean plate format
  const cleanPlate = (p: string): string => {
    if (!p) return '';
    return p.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  };

  const isVehiclePlate = (str: string): boolean => {
    const c = cleanPlate(str);
    return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(c) || /^[A-Z]{3}[0-9]{4}$/.test(c);
  };

  const isDateStr = (str: string): boolean => {
    const t = str.trim();
    return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t);
  };

  const isTimeStr = (str: string): boolean => {
    const t = str.trim();
    return /^\d{1,2}:\d{2}(:\d{2})?$/.test(t);
  };

  // Convert Brazilian date (DD/MM/YYYY) and optional time (HH:MM:SS) to comparable timestamp number
  const parseDateTimeToTimestamp = (dateStr: string, timeStr?: string): number => {
    if (!dateStr || !isDateStr(dateStr)) return 0;
    const parts = dateStr.trim().split('/');
    if (parts.length !== 3) return 0;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timeStr && isTimeStr(timeStr)) {
      const timeParts = timeStr.trim().split(':');
      hours = parseInt(timeParts[0] || '0', 10);
      minutes = parseInt(timeParts[1] || '0', 10);
      seconds = parseInt(timeParts[2] || '0', 10);
    }

    const dt = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(dt.getTime()) ? 0 : dt.getTime();
  };

  // Parse pasted raw text into structured ApoliceItem list
  const handleParseSheet = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;

    const lines = rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const firstLineCols = lines[0].split('\t').map(c => c.trim());
    const normalizeHeader = (s: string) =>
      s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    let colTransportador = -1;
    let colVigencia = -1;
    let colChecklist = -1;
    let colCavalo = -1;
    let colCarreta = -1;
    let colMotorista = -1;
    let colDataViagem = -1;
    let colHoraViagem = -1;

    firstLineCols.forEach((col, idx) => {
      const h = normalizeHeader(col);
      if (h.includes('TRANSPORTADOR') || h === 'TRANS' || h === 'TRANSPORTADORA') {
        colTransportador = idx;
      } else if (h.includes('VIGENCIA') || h.includes('VIGENCIA DO CADASTRO')) {
        colVigencia = idx;
      } else if (h.includes('CHECK LIST') || h.includes('CHECKLIST') || h === 'CHECK') {
        colChecklist = idx;
      } else if (h.includes('CAVALO') || h === 'PLACA CAVALO') {
        colCavalo = idx;
      } else if (h.includes('CARRETA') || h === 'PLACA CARRETA' || h === 'CARRETAS') {
        colCarreta = idx;
      } else if (h.includes('MOTORISTA') || h === 'CONDUTOR' || h === 'NOME MOTORISTA') {
        colMotorista = idx;
      } else if (h.includes('DATA VIAGEM') || h === 'DATA' || h.includes('DATA/HORA')) {
        colDataViagem = idx;
      } else if (h.includes('HORA VIAGEM') || h === 'HORA' || h === 'HORARIO') {
        colHoraViagem = idx;
      }
    });

    let dataLines = lines;
    const hasHeader =
      colTransportador !== -1 ||
      colVigencia !== -1 ||
      colCavalo !== -1 ||
      colCarreta !== -1 ||
      firstLineCols.some(c => normalizeHeader(c).includes('STATUS') || normalizeHeader(c).includes('MES'));

    if (hasHeader) {
      dataLines = lines.slice(1);
    }

    const idxTrans = colTransportador !== -1 ? colTransportador : 11;
    const idxCav = colCavalo !== -1 ? colCavalo : 12;
    const idxCarr = colCarreta !== -1 ? colCarreta : 13;
    const idxMotorista = colMotorista !== -1 ? colMotorista : 19;
    const idxDataViagem = colDataViagem !== -1 ? colDataViagem : 3;
    const idxHoraViagem = colHoraViagem !== -1 ? colHoraViagem : 5;
    const idxVig = colVigencia !== -1 ? colVigencia : 23;
    const idxCheck = colChecklist !== -1 ? colChecklist : 31;

    // STEP 1: Aggregate rows by Cavalo + Motorista + Viagem / Line occurrence
    // Because a set of trailers (rodotrem / bitrem) can span multiple lines (e.g. Cavalo QWK6A22 with OLN7307 on line 1 and OLN7457 on line 2),
    // we first group rows that belong to the same trip/session (Cavalo + Motorista + DataViagem/HoraViagem).
    interface TripRow {
      cavalo: string;
      carretasSet: Set<string>;
      transportador: string;
      motorista: string;
      dataViagem: string;
      horaViagem: string;
      vigenciaCadastro: string;
      checkList: string;
      timestamp: number;
      lineIndex: number;
    }

    const tripMap = new Map<string, TripRow>();

    dataLines.forEach((line, lineIdx) => {
      const cols = line.split('\t').map(c => c.trim());
      if (cols.length < 3) return;

      let cavalo = cols[idxCav] || '';
      let carreta = cols[idxCarr] || '';
      let transportador = cols[idxTrans] || '';
      let motorista = cols[idxMotorista] || '';
      let vigencia = cols[idxVig] || '';
      let checklist = cols[idxCheck] || '';
      let dataViagem = cols[idxDataViagem] || '';
      let horaViagem = cols[idxHoraViagem] || '';

      if (!isVehiclePlate(cavalo)) {
        const plateCandidate = cols.find(c => isVehiclePlate(c));
        if (plateCandidate) {
          cavalo = plateCandidate;
        }
      }

      if (!cavalo) return;

      const normCavalo = cleanPlate(cavalo);
      if (!normCavalo) return;

      // Locate date / time if not in expected column
      if (!isDateStr(dataViagem)) {
        const dateCandidate = cols.slice(0, 10).find(c => isDateStr(c));
        if (dateCandidate) dataViagem = dateCandidate;
      }
      if (!isTimeStr(horaViagem)) {
        const timeCandidate = cols.slice(0, 10).find(c => isTimeStr(c));
        if (timeCandidate) horaViagem = timeCandidate;
      }

      // Check checklist
      if (!checklist || (!isDateStr(checklist) && checklist.toUpperCase() !== 'N/A')) {
        if (cols[32] && isDateStr(cols[32])) {
          checklist = cols[32];
        } else if (cols[31] && isDateStr(cols[31])) {
          checklist = cols[31];
        } else {
          const dateAfterVig = cols.slice(Math.max(idxVig + 1, 24)).find(c => isDateStr(c));
          if (dateAfterVig) {
            checklist = dateAfterVig;
          }
        }
      }

      if (!vigencia) {
        const segProprio = cols.find(c => c.toUpperCase().includes('SEGURO PROPRIO') || c.toUpperCase().includes('FROTA'));
        if (segProprio) vigencia = segProprio;
      }

      // Motorista fallback
      const normMotorista = motorista ? motorista.toUpperCase().trim() : '';

      // Calculate timestamp from dataViagem & horaViagem
      const rowTimestamp = parseDateTimeToTimestamp(dataViagem, horaViagem);

      // Key for grouping rodotrem/bitrem lines of the same trip
      // We group by: Cavalo + Motorista + DataViagem + HoraViagem (or line sequence if time missing)
      const tripKey = `${normCavalo}_${normMotorista}_${dataViagem}_${horaViagem}`;

      const existingTrip = tripMap.get(tripKey);
      if (existingTrip) {
        if (carreta && carreta !== '-') {
          existingTrip.carretasSet.add(cleanPlate(carreta));
        }
        if (!existingTrip.transportador && transportador) {
          existingTrip.transportador = transportador.toUpperCase();
        }
        if ((!existingTrip.vigenciaCadastro || existingTrip.vigenciaCadastro === '-') && vigencia) {
          existingTrip.vigenciaCadastro = vigencia;
        }
        if ((!existingTrip.checkList || existingTrip.checkList === 'N/A') && checklist) {
          existingTrip.checkList = checklist;
        }
        existingTrip.lineIndex = Math.max(existingTrip.lineIndex, lineIdx);
        if (rowTimestamp > existingTrip.timestamp) {
          existingTrip.timestamp = rowTimestamp;
        }
      } else {
        const carretasSet = new Set<string>();
        if (carreta && carreta !== '-') {
          carretasSet.add(cleanPlate(carreta));
        }
        tripMap.set(tripKey, {
          cavalo: normCavalo,
          carretasSet,
          transportador: transportador ? transportador.toUpperCase() : '-',
          motorista: normMotorista,
          dataViagem,
          horaViagem,
          vigenciaCadastro: vigencia || '-',
          checkList: checklist || '',
          timestamp: rowTimestamp,
          lineIndex: lineIdx
        });
      }
    });

    // STEP 2: Group by Conjunto Exacto: (Cavalo + Carretas Ordenadas + Motorista)
    // "quando um conjunto: (placa do cavalo e as mesmas carretas e o mesmo motorista)
    // pegue a informação mais recente e adicione ao app e ignore as outras"
    interface ConjuntoEntry {
      cavalo: string;
      carretasStr: string;
      transportador: string;
      motorista: string;
      vigenciaCadastro: string;
      checkList: string;
      dataViagem: string;
      horaViagem: string;
      timestamp: number;
      lineIndex: number;
    }

    const conjuntoMap = new Map<string, ConjuntoEntry>();

    tripMap.forEach((trip) => {
      // Sort trailer plates alphabetically so that combinations in any order match the same conjunto
      const sortedCarretas = Array.from(trip.carretasSet).filter(Boolean).sort();
      const carretasNormalizedKey = sortedCarretas.join('|');
      const carretasDisplayStr = sortedCarretas.length > 0 ? sortedCarretas.join(' / ') : '-';

      // Deduplication key: Cavalo + Sorted Carretas + Motorista
      const conjuntoKey = `${trip.cavalo}:::${carretasNormalizedKey}:::${trip.motorista}`;

      const existing = conjuntoMap.get(conjuntoKey);
      if (!existing) {
        conjuntoMap.set(conjuntoKey, {
          cavalo: trip.cavalo,
          carretasStr: carretasDisplayStr,
          transportador: trip.transportador,
          motorista: trip.motorista,
          vigenciaCadastro: trip.vigenciaCadastro,
          checkList: trip.checkList,
          dataViagem: trip.dataViagem,
          horaViagem: trip.horaViagem,
          timestamp: trip.timestamp,
          lineIndex: trip.lineIndex
        });
      } else {
        // Compare to keep the most recent entry:
        // 1. By timestamp (data/hora da viagem)
        // 2. If timestamps are equal or zero, the line that appeared lower down in the spreadsheet (lineIndex)
        const isCurrentMoreRecent =
          trip.timestamp > existing.timestamp ||
          (trip.timestamp === existing.timestamp && trip.lineIndex > existing.lineIndex);

        if (isCurrentMoreRecent) {
          conjuntoMap.set(conjuntoKey, {
            cavalo: trip.cavalo,
            carretasStr: carretasDisplayStr,
            transportador: trip.transportador || existing.transportador,
            motorista: trip.motorista || existing.motorista,
            vigenciaCadastro: trip.vigenciaCadastro || existing.vigenciaCadastro,
            checkList: trip.checkList || existing.checkList,
            dataViagem: trip.dataViagem || existing.dataViagem,
            horaViagem: trip.horaViagem || existing.horaViagem,
            timestamp: trip.timestamp,
            lineIndex: trip.lineIndex
          });
        }
      }
    });

    const resultItems: ApoliceItem[] = [];

    conjuntoMap.forEach((data) => {
      const normVig = data.vigenciaCadastro.toUpperCase().trim();
      const normCheck = data.checkList.toUpperCase().trim();

      let apoliceVal: 'MACRO' | 'SEGURO PRÓPRIO' = 'MACRO';

      const isSeguroProprioText =
        normVig.includes('SEGURO PROPRIO') ||
        normVig.includes('SEGURO PRÓPRIO') ||
        normVig.includes('FROTA 3C') ||
        normVig.includes('FROTA');

      const isChecklistEmpty = !normCheck || normCheck === '-' || normCheck === 'N/A' || normCheck === 'VAZIO';

      if (isSeguroProprioText || (isSeguroProprioText && isChecklistEmpty)) {
        apoliceVal = 'SEGURO PRÓPRIO';
      } else {
        apoliceVal = 'MACRO';
      }

      const displayChecklist = isChecklistEmpty ? 'N/A' : data.checkList;
      const displayVigencia = isSeguroProprioText ? 'SEGURO PRÓPRIO' : data.vigenciaCadastro;

      resultItems.push({
        id: `apolice-${data.cavalo}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        cavalo: data.cavalo,
        carretas: data.carretasStr,
        transportador: data.transportador,
        motorista: data.motorista,
        dataHoraViagem: data.dataViagem ? `${data.dataViagem} ${data.horaViagem}`.trim() : undefined,
        vigenciaCadastro: displayVigencia,
        checkList: displayChecklist,
        apolice: apoliceVal
      });
    });

    setItems(resultItems);
    setPasteInput('');
  };

  const handleLoadSample = () => {
    handleParseSheet(SAMPLE_SHEET_TEXT);
  };

  const handleToggleApolice = (id: string, newApolice: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, apolice: newApolice } : item))
    );
    setActiveDropdownId(null);
  };

  const handleDeleteRow = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearAll = () => {
    if (items.length > 0 && !window.confirm('Deseja realmente limpar toda a lista de apólices?')) {
      return;
    }
    setItems([]);
    setSelectedIds(new Set());
  };

  // Checkbox selection
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

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch =
        !searchTerm ||
        item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carretas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transportador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vigenciaCadastro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.checkList.toLowerCase().includes(searchTerm.toLowerCase());

      const normItemApolice = item.apolice.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normFilter = filterApolice.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const matchApolice =
        filterApolice === 'TODAS' ||
        normItemApolice === normFilter;

      return matchSearch && matchApolice;
    });
  }, [items, searchTerm, filterApolice]);

  const totalMacro = useMemo(
    () => items.filter(i => i.apolice.toUpperCase().includes('MACRO')).length,
    [items]
  );
  const totalSeguroProprio = useMemo(
    () =>
      items.filter(
        i =>
          i.apolice.toUpperCase().includes('SEGURO PROPRIO') ||
          i.apolice.toUpperCase().includes('SEGURO PRÓPRIO')
      ).length,
    [items]
  );

  const handleCopyTable = () => {
    if (filteredItems.length === 0) return;

    const headers = ['CAVALO', 'CARRETAS', 'TRANSPORTADOR', 'VIGENCIA DO CADASTRO', 'CHECK LIST', 'APOLICE'];
    const rows = filteredItems.map(i => [
      i.cavalo,
      i.carretas,
      i.transportador,
      i.vigenciaCadastro,
      i.checkList,
      i.apolice
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  const handleExportXLSX = () => {
    if (filteredItems.length === 0) return;

    const data = filteredItems.map(i => ({
      CAVALO: i.cavalo,
      CARRETAS: i.carretas,
      TRANSPORTADOR: i.transportador,
      'VIGENCIA DO CADASTRO': i.vigenciaCadastro,
      'CHECK LIST': i.checkList,
      APOLICE: i.apolice
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Apolices');
    XLSX.writeFile(wb, `Apolices_Escala_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden p-3 sm:p-6 space-y-6">
      {/* Background with night highway atmosphere exactly matching image.png */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10 brightness-[0.75] contrast-[1.15]"
        style={{ backgroundImage: `url(${highwayNightBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-slate-950/80 to-black/90 -z-10 backdrop-blur-[2px]" />

      {/* Copy Notification Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider animate-bounce">
          <Check size={18} />
          <span>Tabela copiada para a área de transferência!</span>
        </div>
      )}

      {/* TOP CARD: COLAR INFORMAÇÕES DA PLANILHA DE ESCALA */}
      <div className="relative rounded-2xl md:rounded-3xl border border-cyan-500/25 bg-[#070e1b]/80 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-4">
        {/* Header line inside card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Amber glowing rounded square icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f8be31] to-[#df920f] p-2.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center text-slate-950 shrink-0">
              <FileText size={24} className="stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                <span>COLAR INFORMAÇÕES DA PLANILHA DE ESCALA</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 font-medium">
                Copie as linhas no Excel e cole abaixo (identifica automaticamente: Transportador, Vigência, Check List, Cavalo, Carreta)
              </p>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2 rounded-xl border border-[#d49929] bg-black/40 hover:bg-[#2b1f09] text-[#fcd34d] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
              title="Carregar exemplo baseado na captura de tela da planilha"
            >
              <Sparkles size={16} className="text-[#fcd34d]" />
              <span>CARREGAR EXEMPLO DA PLANILHA</span>
            </button>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-[#520f1e] hover:bg-[#6e1529] border border-rose-500/40 text-rose-200 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
                title="Limpar todos os registros da lista"
              >
                <Trash2 size={16} />
                <span>LIMPAR LISTA</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea Box with glowing cyan border matching image.png */}
        <div className="relative">
          <textarea
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Cole aqui as linhas da sua planilha (exemplo: selecione as colunas na planilha do Excel, aperte Ctrl+C e cole aqui com Ctrl+V)..."
            rows={4}
            className="w-full bg-[#050b14]/90 border border-cyan-500/50 focus:border-cyan-400 rounded-xl p-4 text-xs font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 transition-all resize-y shadow-[0_0_15px_rgba(6,182,212,0.12)]"
          />
        </div>

        {/* Bottom bar of top box: Info text & Process button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-serif font-black text-[10px] shrink-0">
              i
            </span>
            <span>
              Identificação inteligente: conjuntos com mesmo <strong className="text-amber-400 font-black">Cavalo</strong>, <strong className="text-amber-400 font-black">Carretas</strong> e <strong className="text-amber-400 font-black">Motorista</strong> mantêm automaticamente a informação mais recente.
            </span>
          </div>

          <button
            type="button"
            disabled={!pasteInput.trim()}
            onClick={() => handleParseSheet(pasteInput)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a0e27] via-[#a81434] to-[#bd183c] hover:from-[#a01230] hover:to-[#d61d46] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-400/40 shadow-lg shadow-rose-950/60 transition-all cursor-pointer hover:scale-102"
          >
            <Check size={16} className="stroke-[3]" />
            <span>PROCESSAR LINHAS COLADAS</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CARD: TABLE EXACTLY MATCHING image.png */}
      <div className="relative rounded-2xl md:rounded-3xl border border-cyan-500/25 bg-[#070e1b]/85 backdrop-blur-md overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)] space-y-0">
        {/* Table Top Controls Bar */}
        <div className="p-3.5 sm:p-4 bg-[#091122]/90 border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Search Input with cyan border */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar placa, carreta, transportador..."
                className="w-full pl-10 pr-3 py-2 bg-[#050a14]/90 border border-cyan-500/40 focus:border-cyan-400 rounded-xl text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 shadow-inner"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <div className="relative">
                <select
                  value={filterApolice}
                  onChange={(e) => setFilterApolice(e.target.value)}
                  className="appearance-none bg-[#050a14]/90 border border-cyan-500/40 focus:border-cyan-400 rounded-xl pl-3.5 pr-8 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas as Apólices</option>
                  <option value="MACRO">Apenas MACRO</option>
                  <option value="SEGURO PRÓPRIO">Apenas SEGURO PRÓPRIO</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons: Copiar Tabela & Exportar Excel */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyTable}
              disabled={filteredItems.length === 0}
              className="px-4 py-2 rounded-xl bg-[#0b1526] hover:bg-[#12223d] border border-slate-600/80 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-102 disabled:opacity-40"
              title="Copiar dados para colar no Excel"
            >
              <Copy size={16} />
              <span>COPIAR TABELA</span>
            </button>

            <button
              type="button"
              onClick={handleExportXLSX}
              disabled={filteredItems.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#006e40] to-[#008a50] hover:from-[#007d49] hover:to-[#009e5c] border border-emerald-400/50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/60 transition-all hover:scale-102 disabled:opacity-40"
              title="Exportar como arquivo XLSX"
            >
              <FileSpreadsheet size={16} />
              <span>EXPORTAR EXCEL</span>
            </button>
          </div>
        </div>

        {/* Table in Dark Wine/Burgundy Header Style */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              {/* Deep wine / burgundy header matching image.png */}
              <tr className="bg-[#380712] border-b border-rose-900/60 text-white font-serif font-black uppercase tracking-wider text-center text-[11px] sm:text-[12px]">
                {/* Checkbox column */}
                <th className="py-3 px-3 w-10 border-r border-rose-900/50 text-center">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-transparent text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>

                <th className="py-3 px-4 border-r border-rose-900/50 whitespace-nowrap min-w-[130px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Truck size={15} />
                    <span>CAVALO</span>
                  </div>
                </th>

                <th className="py-3 px-4 border-r border-rose-900/50 whitespace-nowrap min-w-[180px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Truck size={15} className="scale-x-[-1]" />
                    <span>CARRETAS</span>
                  </div>
                </th>

                <th className="py-3 px-4 border-r border-rose-900/50 whitespace-nowrap min-w-[160px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Building2 size={15} />
                    <span>TRANSPORTADOR</span>
                  </div>
                </th>

                <th className="py-3 px-4 border-r border-rose-900/50 whitespace-nowrap min-w-[180px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Calendar size={15} />
                    <span>VIGÊNCIA DO CADASTRO</span>
                  </div>
                </th>

                <th className="py-3 px-4 border-r border-rose-900/50 whitespace-nowrap min-w-[140px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <ClipboardList size={15} />
                    <span>CHECK LIST</span>
                  </div>
                </th>

                <th className="py-3 px-4 whitespace-nowrap min-w-[170px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck size={15} />
                    <span>APÓLICE</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck size={36} className="text-slate-600" />
                      <p className="font-bold text-slate-300 text-sm">
                        Nenhum conjunto na lista de apólices
                      </p>
                      <p className="text-xs text-slate-500">
                        Cole as linhas da planilha acima ou clique em "Carregar Exemplo da Planilha"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSeguroProprio =
                    item.vigenciaCadastro.toUpperCase().includes('SEGURO PROPRIO') ||
                    item.vigenciaCadastro.toUpperCase().includes('SEGURO PRÓPRIO');

                  const isApoliceMacro = item.apolice.toUpperCase().includes('MACRO');
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors text-center text-xs font-bold text-white border-b border-slate-800/70",
                        isSelected
                          ? "bg-blue-950/40 hover:bg-blue-950/60"
                          : "hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 w-10 border-r border-slate-800/60 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="w-4 h-4 rounded border-slate-600 bg-transparent text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* CAVALO */}
                      <td className="py-3.5 px-4 font-mono font-black text-white border-r border-slate-800/60 tracking-wider">
                        {item.cavalo}
                      </td>

                      {/* CARRETAS */}
                      <td className="py-3.5 px-4 font-mono font-black text-white border-r border-slate-800/60 tracking-wider">
                        {item.carretas}
                      </td>

                      {/* TRANSPORTADOR */}
                      <td className="py-3.5 px-4 font-black uppercase text-white border-r border-slate-800/60">
                        {item.transportador}
                      </td>

                      {/* VIGÊNCIA DO CADASTRO (Green badge block when SEGURO PRÓPRIO as in image.png) */}
                      <td className="py-2.5 px-3 border-r border-slate-800/60">
                        {isSeguroProprio ? (
                          <div className="bg-gradient-to-r from-[#028a39] to-[#0ba849] border border-emerald-400/40 text-white font-black text-xs uppercase px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(11,168,73,0.4)]">
                            <ShieldCheck size={16} />
                            <span>SEGURO PRÓPRIO</span>
                          </div>
                        ) : (
                          <span className="font-bold text-white tracking-wide">
                            {item.vigenciaCadastro}
                          </span>
                        )}
                      </td>

                      {/* CHECK LIST */}
                      <td className="py-3.5 px-4 font-bold text-white border-r border-slate-800/60">
                        {item.checkList}
                      </td>

                      {/* APÓLICE (Pill button dropdown matching image.png) */}
                      <td className="py-2.5 px-4 relative">
                        <div className="inline-block relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                            className={cn(
                              "py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider flex items-center justify-between gap-3 shadow-md hover:brightness-110 transition-all cursor-pointer",
                              isApoliceMacro
                                ? "bg-gradient-to-r from-[#0051b8] to-[#0066e0] border border-blue-400/40 min-w-[135px] px-5 shadow-[0_0_12px_rgba(0,102,224,0.35)]"
                                : "bg-gradient-to-r from-[#800c1f] to-[#991026] border border-rose-400/40 min-w-[155px] px-4 shadow-[0_0_12px_rgba(153,16,38,0.4)]"
                            )}
                            title="Clique para alternar a apólice"
                          >
                            <span className="flex-1 text-center">{item.apolice}</span>
                            <ChevronDown size={14} className="shrink-0 opacity-90" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeDropdownId === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveDropdownId(null)}
                              />
                              <div className="absolute right-0 mt-1.5 z-30 w-44 bg-[#0a1222] rounded-2xl shadow-2xl border-2 border-cyan-500/40 py-2 text-xs text-left animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() => handleToggleApolice(item.id, 'MACRO')}
                                  className="w-full px-3 py-2 hover:bg-blue-600/20 text-blue-300 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066e0]" />
                                  <span>MACRO</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleApolice(item.id, 'SEGURO PRÓPRIO')}
                                  className="w-full px-3 py-2 hover:bg-rose-600/20 text-rose-300 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#991026]" />
                                  <span>SEGURO PRÓPRIO</span>
                                </button>
                                <div className="border-t border-slate-700 my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(item.id)}
                                  className="w-full px-3 py-2 hover:bg-rose-950/60 text-rose-400 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={13} />
                                  <span>Remover Linha</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with metrics matching image.png */}
        <div className="p-3.5 sm:p-4 bg-[#070e1b]/95 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div>
            Exibindo <strong>{filteredItems.length}</strong> de <strong>{items.length}</strong> {items.length === 1 ? 'conjunto' : 'conjuntos'}
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0070f3] shadow-[0_0_8px_#0070f3]" />
              <span>MACRO: {totalMacro}</span>
            </span>
            <span className="flex items-center gap-2 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b31536] shadow-[0_0_8px_#b31536]" />
              <span>SEGURO PRÓPRIO: {totalSeguroProprio}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
