import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  Search,
  Filter,
  Copy,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Check,
  ChevronDown,
  FileText,
  Plus,
  Edit2,
  Cloud,
  Save,
  X,
  CheckCircle2,
  User,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-3.5 h-3.5 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
      <div className="w-[2px] h-full bg-gradient-to-b from-red-500 to-transparent" />
    </div>
  );
}

// Placa no formato oficial Mercosul (Brasil)
function MercosulPlate({ plate, className }: { plate: string; className?: string }) {
  if (!plate || plate === '-') {
    return <span className="text-stone-400 font-mono font-bold text-[10px]">-</span>;
  }
  const clean = plate.trim().toUpperCase();

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

export interface ApoliceEscalaProps {
  items?: ApoliceItem[];
  onItemsChange?: (items: ApoliceItem[]) => void;
}

export default function ApoliceEscala({
  items: externalItems,
  onItemsChange
}: ApoliceEscalaProps = {}) {
  const [pasteInput, setPasteInput] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [internalItems, setInternalItems] = useState<ApoliceItem[]>(() => {
    try {
      const saved = localStorage.getItem('apolice_escala_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Subscribe to Firebase Realtime Database for permanent synchronization if standalone
  useEffect(() => {
    if (externalItems !== undefined) return;
    try {
      const apoliceRef = ref(rtdb, 'apolice_escala_items');
      const unsubscribe = onValue(apoliceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let list: ApoliceItem[] = [];
          if (Array.isArray(data)) {
            list = data.filter(Boolean);
          } else if (typeof data === 'object') {
            list = Object.entries(data).map(([key, val]: [string, any]) => ({
              id: val.id || key,
              ...val
            }));
          }
          if (list.length > 0) {
            setInternalItems(list);
            try {
              localStorage.setItem('apolice_escala_items', JSON.stringify(list));
            } catch (err) {
              console.error('Erro ao salvar apólices no localStorage:', err);
            }
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error('Erro ao conectar às apólices no RTDB:', err);
    }
  }, [externalItems]);

  const items = externalItems !== undefined ? externalItems : internalItems;

  // Central save function: guarantees persistence to Firebase RTDB and LocalStorage
  const setItems = (newItemsOrUpdater: ApoliceItem[] | ((prev: ApoliceItem[]) => ApoliceItem[])) => {
    const updated = typeof newItemsOrUpdater === 'function' ? newItemsOrUpdater(items) : newItemsOrUpdater;
    
    if (onItemsChange) {
      onItemsChange(updated);
    } else {
      setInternalItems(updated);
    }

    try {
      localStorage.setItem('apolice_escala_items', JSON.stringify(updated));
    } catch (err) {
      console.error('Erro ao salvar apólices no localStorage:', err);
    }

    try {
      const apoliceRef = ref(rtdb, 'apolice_escala_items');
      set(apoliceRef, updated);
    } catch (err) {
      console.error('Erro ao salvar apólices no Firebase RTDB:', err);
    }
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterApolice, setFilterApolice] = useState<string>('TODAS');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Status and notification toast
  const [syncNotification, setSyncNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'delete' | 'info';
  }>({ show: false, message: '' });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ApoliceItem | null>(null);
  const [modalForm, setModalForm] = useState({
    cavalo: '',
    carretas: '',
    transportador: '3C',
    motorista: '',
    vigenciaCadastro: 'SEGURO PRÓPRIO',
    checkList: 'VALIDO',
    apolice: 'MACRO'
  });

  // Pagination for table ergonomics
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterApolice]);

  // Clean and sanitize license plates
  const cleanPlate = (plate?: string): string => {
    if (!plate) return '';
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  };

  // Helper to test if a string looks like a Brazilian plate
  const isLicensePlate = (str?: string): boolean => {
    if (!str) return false;
    const clean = cleanPlate(str);
    return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(clean) || /^[A-Z]{3}[0-9]{4}$/.test(clean);
  };

  // Parse pasted sheet text
  const handleParseSheet = (text: string) => {
    if (!text || !text.trim()) return;

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newParsedList: ApoliceItem[] = [];

    lines.forEach((line, lineIndex) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 5) return;

      const firstPartUpper = parts[0]?.toUpperCase() || '';
      if (firstPartUpper.includes('PLACA') || firstPartUpper.includes('CAVALO') || firstPartUpper.includes('SET|') && parts[1]?.toUpperCase().includes('SANTA LUZIA') && lineIndex === 0 && isNaN(Number(parts[3]?.replace(/\D/g, '')))) {
        // Potential header row, skip
        if (parts.some(p => p.toUpperCase() === 'TRANSPORTADOR' || p.toUpperCase() === 'CARRETAS')) {
          return;
        }
      }

      let cavalo = '';
      let carretas = '';
      let transportador = '';
      let motorista = '';
      let dataHoraViagem = '';
      let vigenciaCadastro = '';
      let checkList = '';
      let apolice = 'MACRO';

      // Pattern A: Standard 33-column export sheet
      if (parts.length >= 25 && isLicensePlate(parts[12])) {
        cavalo = parts[12]?.toUpperCase().trim();
        carretas = parts[13]?.toUpperCase().trim() || '';
        transportador = parts[11]?.toUpperCase().trim() || '3C';
        dataHoraViagem = `${parts[3] || ''} ${parts[5] || ''}`.trim();
        motorista = parts[19]?.toUpperCase().trim() || '';
        vigenciaCadastro = parts[24]?.toUpperCase().trim() || '';
        checkList = (parts[32] || parts[31] || '').toUpperCase().trim();

        if (vigenciaCadastro.includes('SEGURO PROPRIO') || vigenciaCadastro.includes('SEGURO PRÓPRIO')) {
          apolice = 'SEGURO PRÓPRIO';
        } else {
          apolice = 'MACRO';
        }

        if (!checkList || checkList === '-' || checkList === '') {
          checkList = 'VALIDO';
        }
      } else {
        // Pattern B: Search dynamically across all column cells
        let foundPlates: string[] = [];
        parts.forEach(cell => {
          const words = cell.split(/[\/\,\;\s]+/);
          words.forEach(w => {
            if (isLicensePlate(w) && !foundPlates.includes(cleanPlate(w))) {
              foundPlates.push(cleanPlate(w));
            }
          });
        });

        if (foundPlates.length >= 1) {
          cavalo = foundPlates[0];
          carretas = foundPlates.slice(1).join(' ');
        }

        // Look for transportador
        const knownTrans = ['3C', 'MOEDENSE', 'TRANSMAGNA', 'FROTA', 'ROB', 'STL', 'EXPRESSO', 'TRANSLIQUIDO', 'JAMEF'];
        const foundTrans = parts.find(p => knownTrans.some(kt => p.toUpperCase().includes(kt)));
        if (foundTrans) {
          transportador = foundTrans.toUpperCase();
        } else if (parts[11]) {
          transportador = parts[11].toUpperCase();
        } else {
          transportador = '3C';
        }

        // Check for date of validity
        const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
        const foundDates = parts.filter(p => dateRegex.test(p));
        if (foundDates.length >= 2) {
          vigenciaCadastro = foundDates[foundDates.length - 1];
        } else if (foundDates.length === 1) {
          vigenciaCadastro = foundDates[0];
        }

        if (line.toUpperCase().includes('SEGURO PROPRIO') || line.toUpperCase().includes('SEGURO PRÓPRIO')) {
          apolice = 'SEGURO PRÓPRIO';
          if (!vigenciaCadastro) vigenciaCadastro = 'SEGURO PRÓPRIO';
        }

        if (line.toUpperCase().includes('VENCIDO')) {
          checkList = 'VENCIDO';
        } else if (line.toUpperCase().includes('VALIDO') || line.toUpperCase().includes('VÁLIDO')) {
          checkList = 'VALIDO';
        }
      }

      if (cavalo) {
        newParsedList.push({
          id: `${cleanPlate(cavalo)}_${cleanPlate(carretas)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          cavalo: cleanPlate(cavalo),
          carretas: carretas ? carretas.split(/[\/\,\;\s]+/).map(cleanPlate).filter(Boolean).join(' ') : '',
          transportador: transportador || '3C',
          motorista: motorista || '',
          dataHoraViagem: dataHoraViagem || '',
          vigenciaCadastro: vigenciaCadastro || (apolice === 'SEGURO PRÓPRIO' ? 'SEGURO PRÓPRIO' : '13/05/2027'),
          checkList: checkList || 'VALIDO',
          apolice: apolice
        });
      }
    });

    if (newParsedList.length === 0) {
      alert('Nenhum conjunto válido foi identificado. Verifique se copiou as linhas com as colunas de placas no Excel.');
      return;
    }

    setItems(prev => {
      const updatedList = [...prev];
      let addedCount = 0;
      let updatedCount = 0;

      for (const newItem of newParsedList) {
        const normCav = cleanPlate(newItem.cavalo);
        const normTrailers = (newItem.carretas || '')
          .split(/[\/\,\;\s]+/)
          .map(cleanPlate)
          .filter(Boolean)
          .sort()
          .join('|');
        const normDriver = (newItem.motorista || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9\s]/g, '')
          .trim();

        // Check if an entry with same Cavalo and Carretas/Motorista already exists
        const existingIdx = updatedList.findIndex((it) => {
          const itCav = cleanPlate(it.cavalo);
          if (itCav !== normCav) return false;

          const itTrailers = (it.carretas || '')
            .split(/[\/\,\;\s]+/)
            .map(cleanPlate)
            .filter(Boolean)
            .sort()
            .join('|');
          const itDriver = (it.motorista || '')
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9\s]/g, '')
            .trim();

          const trailersMatch = !normTrailers || !itTrailers || normTrailers === itTrailers;
          const driverMatch = !normDriver || !itDriver || normDriver === itDriver || normDriver.includes(itDriver) || itDriver.includes(normDriver);

          return trailersMatch && driverMatch;
        });

        if (existingIdx >= 0) {
          // Update existing while preserving ID and not duplicating
          const current = updatedList[existingIdx];
          updatedList[existingIdx] = {
            ...current,
            transportador: newItem.transportador || current.transportador,
            vigenciaCadastro: newItem.vigenciaCadastro || current.vigenciaCadastro,
            checkList:
              newItem.checkList && newItem.checkList !== 'N/A' && newItem.checkList !== '-'
                ? newItem.checkList
                : current.checkList,
            apolice: newItem.apolice || current.apolice,
            dataHoraViagem: newItem.dataHoraViagem || current.dataHoraViagem,
            motorista: newItem.motorista || current.motorista
          };
          updatedCount++;
        } else {
          // Add as new entry
          updatedList.unshift(newItem);
          addedCount++;
        }
      }

      setSyncNotification({
        show: true,
        message: `${addedCount} novos conjuntos salvos e ${updatedCount} atualizados na Apólice permanentemente!`,
        type: 'success'
      });
      setTimeout(() => setSyncNotification({ show: false, message: '' }), 4000);

      return updatedList;
    });

    setPasteInput('');
    setShowPasteBox(false);
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

  // Only user can explicitly delete records
  const handleDeleteRow = (id: string, cavalo?: string) => {
    if (!window.confirm(`Tem certeza que deseja apagar o conjunto ${cavalo || ''}? Esta ação removerá o registro permanentemente do banco de dados.`)) {
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setActiveDropdownId(null);
    setSyncNotification({
      show: true,
      message: `Conjunto ${cavalo || ''} apagado pelo usuário com sucesso.`,
      type: 'delete'
    });
    setTimeout(() => setSyncNotification({ show: false, message: '' }), 3500);
  };

  // User bulk delete selected items
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Tem certeza que deseja apagar permanentemente os ${selectedIds.size} registros selecionados da Apólice?`)) {
      return;
    }
    const count = selectedIds.size;
    setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setSyncNotification({
      show: true,
      message: `${count} conjuntos apagados pelo usuário com sucesso.`,
      type: 'delete'
    });
    setTimeout(() => setSyncNotification({ show: false, message: '' }), 3500);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (!window.confirm(`ATENÇÃO: Deseja realmente excluir permanentemente TODOS os ${items.length} conjuntos cadastrados na Apólice? Somente você pode executar esta ação e ela não poderá ser desfeita.`)) {
      return;
    }
    setItems([]);
    setSelectedIds(new Set());
    setSyncNotification({
      show: true,
      message: 'Todos os registros foram apagados pelo usuário.',
      type: 'delete'
    });
    setTimeout(() => setSyncNotification({ show: false, message: '' }), 3500);
  };

  // Open modal to add manual conjunto
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalForm({
      cavalo: '',
      carretas: '',
      transportador: '3C',
      motorista: '',
      vigenciaCadastro: 'SEGURO PRÓPRIO',
      checkList: 'VALIDO',
      apolice: 'MACRO'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ApoliceItem) => {
    setEditingItem(item);
    setModalForm({
      cavalo: item.cavalo,
      carretas: item.carretas || '',
      transportador: item.transportador || '3C',
      motorista: item.motorista || '',
      vigenciaCadastro: item.vigenciaCadastro || '',
      checkList: item.checkList || 'VALIDO',
      apolice: item.apolice || 'MACRO'
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.cavalo.trim()) {
      alert('Por favor informe a placa do Cavalo.');
      return;
    }

    const cleanCav = cleanPlate(modalForm.cavalo);
    const cleanCar = modalForm.carretas.split(/[\/\,\;\s]+/).map(cleanPlate).filter(Boolean).join(' ');

    if (editingItem) {
      setItems(prev =>
        prev.map(i =>
          i.id === editingItem.id
            ? {
                ...i,
                cavalo: cleanCav,
                carretas: cleanCar,
                transportador: modalForm.transportador.trim().toUpperCase() || '3C',
                motorista: modalForm.motorista.trim().toUpperCase(),
                vigenciaCadastro: modalForm.vigenciaCadastro.trim().toUpperCase(),
                checkList: modalForm.checkList.trim().toUpperCase(),
                apolice: modalForm.apolice
              }
            : i
        )
      );
      setSyncNotification({
        show: true,
        message: `Conjunto ${cleanCav} atualizado com sucesso!`,
        type: 'success'
      });
    } else {
      const newItem: ApoliceItem = {
        id: `${cleanCav}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        cavalo: cleanCav,
        carretas: cleanCar,
        transportador: modalForm.transportador.trim().toUpperCase() || '3C',
        motorista: modalForm.motorista.trim().toUpperCase(),
        vigenciaCadastro: modalForm.vigenciaCadastro.trim().toUpperCase(),
        checkList: modalForm.checkList.trim().toUpperCase(),
        apolice: modalForm.apolice
      };
      setItems(prev => [newItem, ...prev]);
      setSyncNotification({
        show: true,
        message: `Novo conjunto ${cleanCav} cadastrado com sucesso!`,
        type: 'success'
      });
    }

    setTimeout(() => setSyncNotification({ show: false, message: '' }), 3500);
    setIsModalOpen(false);
    setEditingItem(null);
  };

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
        (item.motorista && item.motorista.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleCopyTable = () => {
    if (filteredItems.length === 0) return;

    const headers = ['CAVALO', 'CARRETAS', 'TRANSPORTADOR', 'MOTORISTA', 'VIGENCIA DO CADASTRO', 'CHECK LIST', 'APOLICE'];
    const rows = filteredItems.map(i => [
      i.cavalo,
      i.carretas,
      i.transportador,
      i.motorista || '-',
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
      MOTORISTA: i.motorista || '-',
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
    <div className="w-full relative z-10 max-w-full mx-auto flex flex-col font-sans text-stone-900">
      
      {/* Toast Notifications */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-black uppercase tracking-wider border border-emerald-500">
          <Check size={18} />
          <span>Tabela copiada para a área de transferência!</span>
        </div>
      )}

      {syncNotification.show && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-black tracking-wide border transition-all animate-in fade-in slide-in-from-bottom-4",
            syncNotification.type === 'delete'
              ? "bg-[#6f0f1d] border-[#8a1424] text-red-100 shadow-md"
              : "bg-emerald-950 border-emerald-500 text-emerald-100 shadow-md"
          )}
        >
          {syncNotification.type === 'delete' ? (
            <Trash2 size={18} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          )}
          <span>{syncNotification.message}</span>
        </div>
      )}

      {/* Main Premium Light Container */}
      <div className="flex-1 rounded-3xl bg-white border border-[#d6ccbe] shadow-sm relative overflow-visible flex flex-col">

        {/* Main Padding Container */}
        <div className="p-5 sm:p-6 md:p-8 relative z-10 flex flex-col h-full gap-5">

          {/* Top Area: Splitted into Left (Shield/Avatar Emblem) and Right (Banner + Header) */}
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            
            {/* Left Col: Shield Emblem Card - Premium Light Style */}
            <div className="w-full md:w-[26%] md:min-w-[210px] md:max-w-[240px] rounded-2xl mx-auto md:mx-0 relative border border-[#d6ccbe] overflow-hidden shrink-0 shadow-sm bg-[#fbf9f5] flex flex-col items-center justify-center p-5 text-center">
              
              {/* Logo Emblem */}
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center relative shadow-xs mb-3">
                <ShieldCheck size={28} className="text-[#8a1424]" />
              </div>

              <span className="text-stone-900 font-bold text-xs uppercase tracking-widest leading-tight">
                Apólices & Seguro
              </span>
              <span className="text-[10px] text-stone-500 font-mono font-bold mt-1 tracking-wider uppercase">
                Classificação 3C
              </span>

              <div className="mt-3 bg-white border border-[#d6ccbe] rounded-xl px-3 py-1 text-[10px] font-mono font-bold text-stone-700 uppercase tracking-wider shadow-sm">
                Macro • Próprio
              </div>
            </div>

            {/* Right Col: Banner Image + Motivational Quote + Title */}
            <div className="flex-1 flex flex-col justify-between pt-0.5 gap-3">
              
              {/* Premium Light Aesthetic Banner */}
              <div className="w-full h-24 md:h-28 rounded-2xl overflow-hidden border border-[#d6ccbe] shadow-sm relative group hidden sm:block">
                <img 
                  src="/images/banner_coffee.jpg"
                  alt="Aesthetic Banner"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-90 relative z-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/45 via-transparent to-stone-900/30 pointer-events-none z-10" />
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                  <span className="bg-[#8a1424] text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow-sm">
                    LOGÍSTICA & DISTRIBUIÇÃO
                  </span>
                  <span className="text-white font-mono text-[10px] font-semibold drop-shadow-sm">
                    Santa Luzia / MG — Brasil
                  </span>
                </div>
              </div>

              {/* Motivational Quote */}
              <p className="w-full text-stone-600 italic text-xs sm:text-sm text-center leading-snug px-2 font-medium">
                "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
              </p>

              {/* Bottom Row: Titles */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Title and category */}
                <div className="pb-1">
                  <span className="text-[#8a1424] font-mono font-bold text-[11px] tracking-widest uppercase block mb-1">
                    Classificação de Apólices & Vigências (Conjuntos Homologados)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
                    APÓLICES: <span className="text-[#8a1424]">{items.length} CONJUNTOS CADASTRADOS</span>
                  </h1>
                </div>

                {/* Signature Tag: Feito com paixão */}
                <div className="hidden lg:flex bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-3 px-5 items-center justify-center gap-4 shadow-sm relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Coffee className="text-amber-700" size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-stone-900 text-xs font-bold leading-none mb-1">Feito com paixão.</span>
                    <span className="font-mono text-stone-500 text-[10px] font-semibold leading-none">Para quem entrega.</span>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Status Ribbon & Counters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8a1424]" />
                <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wide">
                  Total: <strong className="text-stone-900 font-extrabold">{items.length}</strong>
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#d6ccbe]" />

              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono font-bold text-[#8a1424] uppercase tracking-wider">MACRO:</span>
                <span className="text-xs font-black text-[#8a1424] font-mono">{totalMacro}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-wider">SEGURO PRÓPRIO:</span>
                <span className="text-xs font-black text-cyan-900 font-mono">{totalSeguroProprio}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-[10px] font-bold font-mono shadow-sm">
              <Cloud size={12} className="text-emerald-700" />
              <span>SINCRONIZAÇÃO NUVEM ATIVA</span>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Novo Conjunto */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-[#8a1424] hover:bg-[#6f0f1d] text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-[#8a1424]"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>+ Novo Conjunto</span>
              </button>

              {/* Colar da Planilha (Toggle Box) */}
              <button
                type="button"
                onClick={() => setShowPasteBox(!showPasteBox)}
                className={cn(
                  "text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border",
                  showPasteBox
                    ? "bg-stone-100 text-stone-900 border-[#d6ccbe] shadow-inner"
                    : "bg-[#fbf9f5] hover:bg-stone-50 text-stone-700 border-[#d6ccbe]"
                )}
              >
                <ClipboardList size={15} />
                <span>{showPasteBox ? 'Ocultar Colagem' : 'Colar da Planilha'}</span>
              </button>

              {/* Carregar Exemplo */}
              <button
                type="button"
                onClick={handleLoadSample}
                className="bg-white hover:bg-stone-50 text-amber-800 border border-[#d6ccbe] text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97"
                title="Carregar exemplo da planilha de escala oficial"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Carregar Exemplo</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Copiar Tabela */}
              <button
                type="button"
                onClick={handleCopyTable}
                disabled={filteredItems.length === 0}
                className="bg-white hover:bg-stone-50 text-stone-700 border border-[#d6ccbe] text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 disabled:opacity-40"
                title="Copiar registros formatados para o Excel"
              >
                <Copy size={14} />
                <span>Copiar Tabela</span>
              </button>

              {/* Exportar Excel */}
              <button
                type="button"
                onClick={handleExportXLSX}
                disabled={filteredItems.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97 border border-emerald-600 disabled:opacity-40"
              >
                <FileSpreadsheet size={15} />
                <span>Exportar Excel</span>
              </button>

              {/* Limpar Tudo */}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-97"
                  title="Limpar todos os registros"
                >
                  <Trash2 size={14} />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Box: Colar Informações da Planilha */}
          {showPasteBox && (
            <div className="rounded-2xl bg-[#fbf9f5] border border-[#d6ccbe] p-4 sm:p-5 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8a1424] border border-red-100 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
                      Colar Linhas do Excel
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Cole as colunas de dados da planilha para classificar automaticamente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasteBox(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 self-end sm:self-auto cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                placeholder="Copie as linhas no Excel e cole aqui (Ctrl+V)..."
                rows={3}
                className="w-full bg-white border border-[#d6ccbe] rounded-xl p-3 text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-sm resize-y"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-stone-500 italic">
                  * Registros repetidos são atualizados automaticamente sem duplicar.
                </span>

                <button
                  type="button"
                  disabled={!pasteInput.trim()}
                  onClick={() => handleParseSheet(pasteInput)}
                  className="bg-[#8a1424] hover:bg-[#6f0f1d] disabled:opacity-40 text-white text-xs font-mono font-bold uppercase tracking-wider py-2 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-[#8a1424]"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Processar Linhas Coladas</span>
                </button>
              </div>
            </div>
          )}

          {/* Search, Filter & Bulk Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fbf9f5] p-3 rounded-2xl border border-[#d6ccbe] shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  placeholder="Filtrar por placa, transportador, motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#d6ccbe] rounded-xl py-2 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-stone-400 shadow-sm font-mono font-bold"
                />
              </div>

              {/* Filter by Apolice */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={15} className="text-[#8a1424] shrink-0" />
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={filterApolice}
                    onChange={(e) => setFilterApolice(e.target.value)}
                    className="appearance-none bg-white border border-[#d6ccbe] rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-bold text-stone-800 outline-none focus:border-stone-400 shadow-sm cursor-pointer w-full"
                  >
                    <option value="TODAS" className="bg-white text-stone-900">Todas as Apólices ({items.length})</option>
                    <option value="MACRO" className="bg-white text-stone-900">Apenas MACRO ({totalMacro})</option>
                    <option value="SEGURO PRÓPRIO" className="bg-white text-stone-900">Apenas SEGURO PRÓPRIO ({totalSeguroProprio})</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bulk Selection and Counter */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Excluir Selecionados ({selectedIds.size})</span>
                </button>
              )}

              <span className="text-xs font-mono font-bold text-stone-500">
                Exibindo <strong className="text-stone-900">{filteredItems.length}</strong> de {items.length}
              </span>
            </div>
          </div>

          {/* 4K Cyber Ledger Table */}
          <div className="rounded-2xl border border-[#d6ccbe] overflow-hidden bg-white shadow-sm relative z-10">
            <div className="overflow-x-auto max-h-[640px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#fbf9f5] text-stone-800 border-b border-[#d6ccbe]">
                    <th className="py-3.5 px-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-[#d6ccbe] text-[#8a1424] focus:ring-0 cursor-pointer accent-[#8a1424]"
                      />
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900">
                      Cavalo
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900">
                      Carretas
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900">
                      Transportador
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900">
                      Motorista
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900">
                      Vigência
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900 text-center">
                      Check List
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900 text-center">
                      Apólice (Clique p/ Alternar)
                    </th>
                    <th className="py-3.5 px-3 font-mono font-bold uppercase tracking-wider text-[11px] text-stone-900 text-right pr-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-200 bg-white font-mono">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-stone-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldCheck size={36} className="text-stone-300" />
                          <span className="font-bold text-stone-600 text-sm">Nenhum conjunto encontrado com os filtros aplicados.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, index) => {
                      const isSelected = selectedIds.has(item.id);
                      const isMacro = item.apolice.toUpperCase().includes('MACRO');
                      const isCheckListValido = item.checkList.toUpperCase().includes('VALIDO') || item.checkList.toUpperCase().includes('VÁLIDO');

                      return (
                        <tr
                          key={item.id || index}
                          className={cn(
                            "transition-colors group",
                            isSelected
                              ? "bg-red-50/40 border-y border-red-100"
                              : "hover:bg-[#fcfaf7]"
                          )}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-2.5 px-3.5 text-center align-middle">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(item.id)}
                              className="rounded border-[#d6ccbe] text-[#8a1424] focus:ring-0 cursor-pointer accent-[#8a1424]"
                            />
                          </td>

                          {/* Cavalo License Plate in Mercosul Format */}
                          <td className="py-2 px-3 align-middle">
                            <MercosulPlate plate={item.cavalo} />
                          </td>

                          {/* Carretas */}
                          <td className="py-2 px-3 font-mono font-bold text-stone-800 align-middle">
                            {item.carretas ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.carretas.split(' ').map((c, i) => (
                                  <span
                                    key={i}
                                    className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-stone-200 shadow-xs"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-stone-400 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Transportador */}
                          <td className="py-2 px-3 font-bold text-stone-700 text-[10px] uppercase tracking-wider align-middle">
                            <div className="flex items-center gap-1.5">
                              <Truck size={14} className="text-stone-500 shrink-0" />
                              <span className="font-bold tracking-wider">{item.transportador || '3C'}</span>
                            </div>
                          </td>

                          {/* Motorista */}
                          <td className="py-2 px-3 font-bold text-stone-950 text-[10px] uppercase tracking-wider max-w-[200px] truncate align-middle" title={item.motorista}>
                            {item.motorista ? (
                              <div className="flex items-center gap-1.5">
                                <User size={14} className="text-stone-400 shrink-0" />
                                <span className="truncate">{item.motorista}</span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic text-[10px] font-bold uppercase tracking-wider">-</span>
                            )}
                          </td>

                          {/* Vigência */}
                          <td className="py-2 px-3 font-mono font-bold text-stone-700 text-[10px] uppercase tracking-wider align-middle">
                            {item.vigenciaCadastro}
                          </td>

                          {/* Check List */}
                          <td className="py-2 px-3 text-center align-middle">
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border inline-block shadow-sm",
                                isCheckListValido
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              )}
                            >
                              {item.checkList || 'VALIDO'}
                            </span>
                          </td>

                          {/* Apólice (Clickable Pill) */}
                          <td className="py-2 px-3 text-center align-middle">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() => handleToggleApolice(item.id, isMacro ? 'SEGURO PRÓPRIO' : 'MACRO')}
                                className={cn(
                                  "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl transition-all cursor-pointer shadow-sm border flex items-center gap-1.5 mx-auto active:scale-95",
                                  isMacro
                                    ? "bg-red-50 text-[#8a1424] border-red-200 hover:bg-red-100/70"
                                    : "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/70"
                                )}
                                title="Clique para alternar entre MACRO e SEGURO PRÓPRIO"
                              >
                                <span>{item.apolice}</span>
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right pr-4 align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Editar registro"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(item.id, item.cavalo)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Excluir conjunto"
                              >
                                <Trash2 size={14} />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 bg-[#fbf9f5] border-t border-[#d6ccbe] flex items-center justify-between text-xs font-mono text-stone-600">
                <span className="font-semibold">
                  Página <strong className="text-stone-900">{currentPage}</strong> de {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-[#d6ccbe] bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-2 font-mono font-bold text-[#8a1424]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-[#d6ccbe] bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal: Novo / Editar Conjunto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#d6ccbe] shadow-xl relative p-6 flex flex-col gap-4 text-stone-900">

            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-[#8a1424] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 uppercase tracking-tight">
                    {editingItem ? 'Editar Conjunto' : 'Novo Conjunto'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Cadastro de Apólice na base oficial 3 Corações
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs font-mono font-bold text-stone-900">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-stone-500 uppercase tracking-wider">
                      Placa Cavalo *
                    </label>
                    {modalForm.cavalo.trim() && (
                      <span className="text-[9px] text-[#8a1424] font-black uppercase tracking-wider">
                        Padrão Mercosul
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
                      className="flex-1 px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm text-xs font-bold"
                    />
                    {modalForm.cavalo.trim() && (
                      <MercosulPlate plate={modalForm.cavalo} className="scale-90 origin-right" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                    Carretas
                  </label>
                  <input
                    type="text"
                    value={modalForm.carretas}
                    onChange={(e) => setModalForm({ ...modalForm, carretas: e.target.value })}
                    placeholder="Ex: OLN7307 OLN7457"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                    Transportador
                  </label>
                  <input
                    type="text"
                    value={modalForm.transportador}
                    onChange={(e) => setModalForm({ ...modalForm, transportador: e.target.value })}
                    placeholder="Ex: 3C, MOEDENSE"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                    Motorista
                  </label>
                  <input
                    type="text"
                    value={modalForm.motorista}
                    onChange={(e) => setModalForm({ ...modalForm, motorista: e.target.value })}
                    placeholder="Nome do motorista"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                    Vigência do Cadastro
                  </label>
                  <input
                    type="text"
                    value={modalForm.vigenciaCadastro}
                    onChange={(e) => setModalForm({ ...modalForm, vigenciaCadastro: e.target.value })}
                    placeholder="Ex: 13/05/2027 ou SEGURO PRÓPRIO"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                    Check List
                  </label>
                  <input
                    type="text"
                    value={modalForm.checkList}
                    onChange={(e) => setModalForm({ ...modalForm, checkList: e.target.value })}
                    placeholder="Ex: VALIDO ou VENCIDO"
                    className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 uppercase shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] text-stone-500 uppercase tracking-wider">
                  Classificação da Apólice
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, apolice: 'MACRO' })}
                    className={cn(
                      "py-2.5 px-4 rounded-xl font-bold uppercase text-center border transition-all cursor-pointer shadow-sm",
                      modalForm.apolice === 'MACRO'
                        ? "bg-[#8a1424] text-white border-[#8a1424]"
                        : "bg-[#fbf9f5] border-[#d6ccbe] text-stone-500 hover:text-stone-900"
                    )}
                  >
                    MACRO
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, apolice: 'SEGURO PRÓPRIO' })}
                    className={cn(
                      "py-2.5 px-4 rounded-xl font-bold uppercase text-center border transition-all cursor-pointer shadow-sm",
                      modalForm.apolice === 'SEGURO PRÓPRIO'
                        ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                        : "bg-[#fbf9f5] border-[#d6ccbe] text-stone-500 hover:text-stone-900"
                    )}
                  >
                    SEGURO PRÓPRIO
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#d6ccbe] hover:bg-stone-50 text-stone-600 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8a1424] hover:bg-[#6f0f1d] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#6f0f1d]"
                >
                  <Save size={14} />
                  <span>Salvar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
