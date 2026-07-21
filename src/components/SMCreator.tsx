import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

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

interface SMCreatorProps {
  view?: 'generator' | 'codes';
  onBack?: () => void;
}

const generateStyledTableHtml = (rows: SMRow[], isIda: boolean) => {
  if (rows.length === 0) return '';
  const primaryColor = isIda ? '#1E3A8A' : '#B91C1C';
  const lightBg = isIda ? '#F0F5FF' : '#FEF2F2';
  const borderCol = isIda ? '#DBEAFE' : '#FEE2E2';
  const accentText = isIda ? '#1E40AF' : '#B91C1C';

  let rowsHtml = '';
  rows.forEach((r, idx) => {
    const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    rowsHtml += `
      <tr style="background-color: ${rowBg}; height: 44px;">
        <td style="width: 11%; padding: 8px 6px; text-align: center; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <span style="color: #475569; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px;">
            ${r.dataSaida || '-'}
          </span>
        </td>
        <td style="width: 25%; padding: 8px 12px; text-align: left; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <span style="color: #0F172A; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.02em;">
            ${r.motorista || '-'}
          </span>
        </td>
        <td style="width: 12%; padding: 8px 6px; text-align: center; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <div style="background-color: ${lightBg}; border: 1.5px solid ${borderCol}; border-radius: 6px; padding: 4px 6px; color: ${accentText}; font-weight: 700; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; display: inline-block; text-transform: uppercase; text-align: center; letter-spacing: 0.05em; min-width: 65px;">
            ${r.placa || '-'}
          </div>
        </td>
        <td style="width: 11%; padding: 8px 6px; text-align: center; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px 6px; color: #475569; font-weight: 600; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10.5px; display: inline-block; min-width: 55px;">
            ${r.bau1 || '-'}
          </div>
        </td>
        <td style="width: 11%; padding: 8px 6px; text-align: center; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; padding: 4px 6px; color: #475569; font-weight: 600; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10.5px; display: inline-block; min-width: 55px;">
            ${r.bau2 || '-'}
          </div>
        </td>
        <td style="width: 18%; padding: 8px 6px; text-align: center; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <span style="color: #334155; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10.5px; text-transform: uppercase;">
            ${r.trecho || '-'}
          </span>
        </td>
        <td style="width: 12%; padding: 8px 12px; text-align: right; vertical-align: middle; border-bottom: 1px solid #E2E8F0;">
          <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-weight: 750; color: #059669; font-size: 11.5px; letter-spacing: -0.02em;">
            R$ ${r.valorNf || '0,00'}
          </span>
        </td>
      </tr>`;
  });

  return `
    <div style="width: 100%; max-width: 1000px; box-sizing: border-box; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 5px solid ${primaryColor}; border-radius: 12px; padding: 6px; display: block; text-align: left; margin: 12px 0; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.03);">
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <thead>
          <tr style="background-color: ${primaryColor}; color: #FFFFFF; height: 38px;">
            <th style="width: 11%; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 4px; text-transform: uppercase;">DATA</th>
            <th style="width: 25%; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 12px; text-transform: uppercase;">MOTORISTA</th>
            <th style="width: 12%; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 4px; text-transform: uppercase;">PLACA</th>
            <th style="width: 11%; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 4px; text-transform: uppercase;">BAÚ 1</th>
            <th style="width: 11%; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 4px; text-transform: uppercase;">BAÚ 2</th>
            <th style="width: 18%; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 4px; text-transform: uppercase;">TRECHO</th>
            <th style="width: 12%; text-align: right; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 10px 12px; text-transform: uppercase;">VALOR NF</th>
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

  useEffect(() => {
    const smRef = ref(db, 'sm_creator_data');
    const unsubscribe = onValue(smRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.ida) setIdaRows(data.ida);
        if (data.volta) setVoltaRows(data.volta);
        if (data.calc) setCalcValues(data.calc);
      }
    });
    return () => unsubscribe();
  }, []);

  const saveIda = (rows: SMRow[]) => {
    setIdaRows(rows);
    set(ref(db, 'sm_creator_data/ida'), rows);
  };

  const saveVolta = (rows: SMRow[]) => {
    setVoltaRows(rows);
    set(ref(db, 'sm_creator_data/volta'), rows);
  };

  const saveCalc = (vals: string[]) => {
    setCalcValues(vals);
    set(ref(db, 'sm_creator_data/calc'), vals);
  };
  const [totalRawCopied, setTotalRawCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [idaCopied, setIdaCopied] = useState(false);
  const [voltaCopied, setVoltaCopied] = useState(false);

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

  const parseInput = (text: string, saveFunc: (rows: SMRow[]) => void, existingRows: SMRow[], section: 'ida' | 'volta', forceZeroValue: boolean = false) => {
    const lines = text.trim().split('\n');
    const newRows: SMRow[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        let trecho = parts[5] || '';
        if (section === 'volta') {
          trecho = invertRoute(trecho);
        }

        newRows.push({
          dataSaida: parts[0] || '',
          motorista: parts[1] || '',
          placa: (parts[2] || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
          bau1: parts[3] || '',
          bau2: parts[4] || '',
          trecho: trecho,
          valorNf: forceZeroValue ? '0,00' : (parts[6] || '')
        });
      }
    });

    if (newRows.length > 0) {
      saveFunc([...existingRows, ...newRows]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, section: 'ida' | 'volta') => {
    const text = e.clipboardData.getData('text');
    parseInput(text, section === 'ida' ? saveIda : saveVolta, section === 'ida' ? idaRows : voltaRows, section, true);
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
      saveIda([...idaRows, newRow]);
    } else {
      saveVolta([...voltaRows, newRow]);
    }
  };

  const updateRowValue = (index: number, field: keyof SMRow, value: any, section: 'ida' | 'volta') => {
    let finalValue = value;
    
    if (field === 'valorNf' && typeof value === 'string') {
      finalValue = formatNfValue(value);
    } else if (field === 'placa' && typeof value === 'string') {
      finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (field === 'trecho' && typeof value === 'string') {
      finalValue = value.toUpperCase();
    }

    if (section === 'ida') {
      const newRows = [...idaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveIda(newRows);
    } else {
      const newRows = [...voltaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveVolta(newRows);
    }
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

  const addCalcLine = () => saveCalc([...calcValues, '']);
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; max-width: 1000px; padding: 24px; background-color: #FAFDFE; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 10px 25px rgba(30, 41, 59, 0.05); margin: 15px auto;">
        
        <div style="border-bottom: 2px solid #EFF6FF; padding-bottom: 16px; margin-bottom: 20px; display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: middle;">
            <span style="font-size: 20px; vertical-align: middle; margin-right: 6px;">☕</span>
            <span style="font-size: 15px; font-weight: 800; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.05em;">Três Corações Alimentos</span>
          </div>
          <div style="display: table-cell; text-align: right; vertical-align: middle;">
            <div style="background-color: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 20px; padding: 4px 12px; display: inline-block;">
              <span style="font-size: 11px; font-weight: 700; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.05em;">SM - Relatório Consolidado</span>
            </div>
          </div>
        </div>

        <p style="font-size: 14px; color: #334155; margin: 0 0 4px 0; line-height: 1.5; font-weight: 600;">
          ${greeting}!
        </p>
        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.5;">
          Seguem abaixo os relatórios de SM consolidados de Ida e Volta.
        </p>
        
        <div style="margin-top: 24px; margin-bottom: 28px;">
          <div style="margin-bottom: 8px;">
            <span style="font-size: 16px; margin-right: 6px; vertical-align: middle;">📈</span>
            <h3 style="color: #1E3A8A; margin: 0; font-family: sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; display: inline-block; vertical-align: middle;">ROTA IDA</h3>
          </div>
          <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0;">
            Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <strong style="color: #1E3A8A;">${getJourneyDate(idaRows)}</strong>!
          </p>
          ${generateStyledTableHtml(idaRows, true)}
        </div>

        <div style="margin-top: 28px; margin-bottom: 28px; border-top: 1px dashed #E2E8F0; padding-top: 24px;">
          <div style="margin-bottom: 8px;">
            <span style="font-size: 16px; margin-right: 6px; vertical-align: middle;">📉</span>
            <h3 style="color: #B91C1C; margin: 0; font-family: sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; display: inline-block; vertical-align: middle;">ROTA VOLTA</h3>
          </div>
          <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0;">
            Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <strong style="color: #B91C1C;">${getJourneyDate(voltaRows)}</strong>!
          </p>
          ${generateStyledTableHtml(voltaRows, false)}
        </div>

        <div style="background-color: #F8FAFC; border-left: 4px solid #10B981; border-radius: 8px; padding: 14px 18px; margin: 24px 0; display: table; width: 100%;">
          <div style="display: table-cell; text-align: left; vertical-align: middle;">
            <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.03em;">Total Consolidado das NF's</span>
          </div>
          <div style="display: table-cell; text-align: right; vertical-align: middle;">
            <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 16px; font-weight: 800; color: #059669;">
              R$ ${calculateTotal()}
            </span>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 13px; color: #64748B;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">Atenciosamente,</p>
          <p style="margin: 0; font-weight: 500; color: #1E3A8A;">Equipe de Monitoramento e Logística</p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #94A3B8;">Este e-mail contém relatórios automáticos gerados pelo sistema.</p>
        </div>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue relatórios de SM - Ida e Volta.\n\nROTA IDA\n${greeting}, Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${getJourneyDate(idaRows)}!\n${formatRowsText(idaRows, '')}\nROTA VOLTA\n${greeting}, Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${getJourneyDate(voltaRows)}!\n${formatRowsText(voltaRows, '')}\nTotal Calculado: R$ ${calculateTotal()}\n\nAtt,`;

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
    
    const isIda = title.includes('IDA');
    const color = isIda ? '#1E3A8A' : '#B91C1C';
    const badgeBg = isIda ? '#EFF6FF' : '#FEF2F2';
    const badgeBorder = isIda ? '#BFDBFE' : '#FEE2E2';
    const badgeText = isIda ? '#1E40AF' : '#B91C1C';
    const signatureColor = isIda ? '#1E3A8A' : '#B91C1C';
    const greeting = getGreeting();
    const date = getJourneyDate(rows);
    
    const phrase = isIda 
      ? `Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${date}!`
      : `Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${date}!`;

    let html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; max-width: 1000px; padding: 24px; background-color: #FAFDFE; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 10px 25px rgba(30, 41, 59, 0.05); margin: 15px auto;">
        <div style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 20px; padding: 4px 12px; margin-bottom: 16px; display: inline-block;">
          <span style="font-size: 11px; font-weight: 700; color: ${badgeText}; text-transform: uppercase; letter-spacing: 0.05em;">📊 Relatório de Escala</span>
        </div>
        
        <h2 style="color: ${color}; margin: 0 0 12px 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em;">
          ${title}
        </h2>
        
        <p style="font-size: 14px; color: #334155; margin: 0 0 4px 0; line-height: 1.5; font-weight: 600;">
          ${greeting},
        </p>
        <p style="font-size: 14px; color: #475569; margin: 0 0 18px 0; line-height: 1.5;">
          ${phrase}
        </p>
        
        ${generateStyledTableHtml(rows, isIda)}
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">Atenciosamente,</p>
          <p style="margin: 0; font-weight: 500; color: ${signatureColor};">Equipe de Monitoramento e Logística • Três Corações Alimentos</p>
        </div>
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
      {onBack && (
        <div className="w-full max-w-[94rem] mx-auto px-6 mt-4 md:hidden">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full bg-[#3A2414] hover:bg-[#2A1408] text-[#fbdba5] py-3.5 rounded-2xl font-black text-xs transition-all border border-[#3A2414] shadow-md cursor-pointer"
          >
            <LayoutGrid size={16} className="text-[#B32025]" />
            <span>Voltar ao Menu Inicial</span>
          </button>
        </div>
      )}

      {/* ================= HEADER AREA ================= */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 max-w-[94rem] mx-auto mt-2 mb-6 px-6">
        
        {/* Left title and logo stack */}
        <div className="flex items-center gap-5 text-left w-full md:w-auto">
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
              SM
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

      {view === 'codes' ? (
        <div className="relative z-10 bg-[#fdfcf9] p-6 rounded-xl border-4 border-[#3A2414] shadow-2xl">{renderCodesTable()}</div>
      ) : (
        <div className="relative z-10 space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* ROTA IDA (Delicate Blue Theme) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      <TrendingUp size={14} className="stroke-[2.5]" />
                    </span>
                    <span>Rota Ida</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('ida')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <Plus size={12} className="stroke-[3]" /> Add Linha
                    </button>
                    {idaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md",
                          idaCopied 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "bg-slate-800 hover:bg-slate-900 text-white"
                        )}
                      >
                        {idaCopied ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} />}
                        {idaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => saveIda([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer pl-1">Limpar Tudo</button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden relative">
                  <div className="relative z-10 w-full overflow-hidden p-1">
                    {idaRows.length === 0 ? (
                      <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50/40 h-full border border-dashed border-slate-200 rounded-xl shadow-inner">
                        <div className="p-4 bg-blue-50 rounded-full mb-4 border border-blue-100">
                          <Clipboard className="text-blue-500 w-8 h-8" />
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-sans font-medium">Cole aqui as informações da Rota Ida ou adicione manualmente</p>
                        <div className="flex flex-col gap-3 w-full max-w-md">
                          <textarea 
                            onPaste={(e) => handlePaste(e, 'ida')}
                            placeholder="Pressione Ctrl+V aqui para colar..."
                            className="w-full h-24 bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-xs font-mono text-slate-700 outline-none placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none transition-all"
                          />
                          <button 
                            onClick={() => addNewRow('ida')}
                            className="w-full py-3 border border-dashed border-blue-300 hover:border-blue-500 rounded-xl text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all bg-white"
                          >
                            <Plus size={16} className="stroke-[2.5]" /> Adicionar manualmente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-white text-[10px] uppercase font-bold tracking-widest border-b border-blue-950/25 shadow-sm">
                              <th className="p-4 w-10 text-center">#</th>
                              <th className="p-4 w-12 text-center">OK</th>
                              <th className="p-4">Data</th>
                              <th className="p-4">Motorista</th>
                              <th className="p-4 text-center">Placa</th>
                              <th className="p-4 text-center">Baú 1</th>
                              <th className="p-4 text-center">Baú 2</th>
                              <th className="p-4">Trecho</th>
                              <th className="p-4 text-right">Valor NF</th>
                              <th className="p-4 w-12 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white font-sans">
                            {idaRows.map((row, i) => (
                              <tr key={i} className="text-xs text-slate-800 hover:bg-blue-50/20 transition-all group/row font-sans relative">
                                <td className="p-3 text-center text-slate-400 font-mono font-bold text-xs w-10">
                                  {i + 1}
                                </td>
                                <td className="p-3 text-center w-12">
                                  <button
                                    type="button"
                                    onClick={() => updateRowValue(i, 'ok', !row.ok, 'ida')}
                                    className={cn(
                                      "w-5 h-5 mx-auto flex items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                                      row.ok 
                                        ? "bg-blue-600 border-blue-700 text-white shadow-sm" 
                                        : "bg-slate-50 border-slate-200 text-transparent hover:border-blue-500/50"
                                    )}
                                    title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                  >
                                    <Check size={12} className="stroke-[3]" />
                                  </button>
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text"
                                    value={row.dataSaida}
                                    onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3 font-bold group/cell">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={row.motorista}
                                      onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'ida')}
                                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all uppercase font-medium"
                                    />
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(row.motorista)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all shrink-0"
                                      title="Copiar Motorista"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.placa}
                                    onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold tracking-widest uppercase font-mono"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau1}
                                    onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau2}
                                    onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'ida')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all uppercase font-medium"
                                  />
                                </td>
                                <td className="p-3 text-right font-bold text-emerald-600 group/cell">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all shrink-0"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <input 
                                      type="text"
                                      value={row.valorNf}
                                      onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-emerald-600 font-bold shadow-sm rounded-lg py-1.5 px-3 text-right focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-mono"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => saveIda(idaRows.filter((_, idx) => idx !== i))} 
                                    className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ROTA VOLTA (Delicate Indigo Theme) */}
              <section className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Download size={14} className="rotate-180 stroke-[2.5]" />
                    </span>
                    <span>Rota Volta</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('volta')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <Plus size={12} className="stroke-[3]" /> Add Linha
                    </button>
                    {voltaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md",
                          voltaCopied 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "bg-slate-800 hover:bg-slate-900 text-white"
                        )}
                      >
                        {voltaCopied ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => saveVolta([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer pl-1">Limpar Tudo</button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden relative">
                  <div className="relative z-10 w-full overflow-hidden p-1">
                    {voltaRows.length === 0 ? (
                      <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50/40 h-full border border-dashed border-slate-200 rounded-xl shadow-inner">
                        <div className="p-4 bg-indigo-50 rounded-full mb-4 border border-indigo-100">
                          <Clipboard className="text-indigo-500 w-8 h-8" />
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-sans font-medium">Cole aqui as informações da Rota Volta ou adicione manualmente</p>
                        <div className="flex flex-col gap-3 w-full max-w-md">
                          <textarea 
                            onPaste={(e) => handlePaste(e, 'volta')}
                            placeholder="Pressione Ctrl+V aqui para colar..."
                            className="w-full h-24 bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-xs font-mono text-slate-700 outline-none placeholder-slate-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 resize-none transition-all"
                          />
                          <button 
                            onClick={() => addNewRow('volta')}
                            className="w-full py-3 border border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all bg-white"
                          >
                            <Plus size={16} className="stroke-[2.5]" /> Adicionar manualmente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white text-[10px] uppercase font-bold tracking-widest border-b border-indigo-950/25 shadow-sm">
                              <th className="p-4 w-10 text-center">#</th>
                              <th className="p-4 w-12 text-center">OK</th>
                              <th className="p-4">Data</th>
                              <th className="p-4">Motorista</th>
                              <th className="p-4 text-center">Placa</th>
                              <th className="p-4 text-center">Baú 1</th>
                              <th className="p-4 text-center">Baú 2</th>
                              <th className="p-4">Trecho</th>
                              <th className="p-4 text-right">Valor NF</th>
                              <th className="p-4 w-12 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white font-sans">
                            {voltaRows.map((row, i) => (
                              <tr key={i} className="text-xs text-slate-800 hover:bg-indigo-50/20 transition-all group/row font-sans relative">
                                <td className="p-3 text-center text-slate-400 font-mono font-bold text-xs w-10">
                                  {i + 1}
                                </td>
                                <td className="p-3 text-center w-12">
                                  <button
                                    type="button"
                                    onClick={() => updateRowValue(i, 'ok', !row.ok, 'volta')}
                                    className={cn(
                                      "w-5 h-5 mx-auto flex items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                                      row.ok 
                                        ? "bg-blue-600 border-blue-700 text-white shadow-sm" 
                                        : "bg-slate-50 border-slate-200 text-transparent hover:border-blue-500/50"
                                    )}
                                    title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                  >
                                    <Check size={12} className="stroke-[3]" />
                                  </button>
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text"
                                    value={row.dataSaida}
                                    onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3 font-bold group/cell">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={row.motorista}
                                      onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'volta')}
                                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all uppercase font-medium"
                                    />
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(row.motorista)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-all shrink-0"
                                      title="Copiar Motorista"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.placa}
                                    onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold tracking-widest uppercase font-mono"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau1}
                                    onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau2}
                                    onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'volta')}
                                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-mono"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 group/trecho">
                                    <input 
                                      type="text"
                                      value={row.trecho}
                                      onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'volta')}
                                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 shadow-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all uppercase font-medium"
                                    />
                                    <button 
                                      onClick={() => {
                                        const inverted = invertRoute(row.trecho);
                                        updateRowValue(i, 'trecho', inverted, 'volta');
                                      }}
                                      className="opacity-0 group-hover/trecho:opacity-100 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all shrink-0 shadow-sm"
                                      title="Inverter Rota"
                                    >
                                      <RefreshCw size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-right font-bold text-emerald-600 group/cell">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all shrink-0"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <input 
                                      type="text"
                                      value={row.valorNf}
                                      onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-emerald-600 font-bold shadow-sm rounded-lg py-1.5 px-3 text-right focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-mono"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => saveVolta(voltaRows.filter((_, idx) => idx !== i))} 
                                    className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Calculator Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-1.5 rounded-3xl shadow-xl relative overflow-hidden h-full flex flex-col">
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col flex-1 relative shadow-inner">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider font-sans">
                      <Calculator size={16} className="text-blue-600" />
                      Soma de Valores
                    </h3>
                    <button 
                      onClick={() => saveCalc(calcValues.map(() => ''))}
                      className="p-1.5 text-rose-500 hover:text-rose-600 font-sans text-xs font-bold transition-colors cursor-pointer"
                      title="Resetar calculadora"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-6 mb-6 border border-blue-950/20 shadow-md text-center relative group/total overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    <p className="text-[11px] font-black text-blue-100 font-sans uppercase tracking-[0.2em] mb-2">Total Consolidado</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter font-sans drop-shadow-sm">
                      <span className="text-blue-200 mr-2 text-xl font-medium">R$</span>
                      {calculateTotal()}
                    </h4>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/total:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={copyTotalRaw}
                        className={cn(
                          "p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer",
                          totalRawCopied ? "bg-emerald-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                        title="Copiar Valor"
                      >
                        {totalRawCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] no-scrollbar pr-1">
                    {calcValues.map((val, i) => (
                      <div key={i} className="group relative flex items-center">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">R$</div>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updateCalcValue(i, e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-20 py-3 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {val && (
                            <button 
                              onClick={() => updateCalcValue(i, '')}
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-all cursor-pointer"
                              title="Limpar Campo"
                            >
                              <X size={13} className="stroke-[2.5]" />
                            </button>
                          )}
                          {calcValues.length > 1 && (
                            <button 
                              onClick={() => saveCalc(calcValues.filter((_, idx) => idx !== i))}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-all cursor-pointer"
                              title="Remover Linha"
                            >
                              <Trash2 size={13} className="stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <motion.button 
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(37, 99, 235, 0.05)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={addCalcLine}
                        className="py-4 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-[0.15em] bg-transparent cursor-pointer"
                      >
                        <Plus size={16} /> Adicionar Linha
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(225, 29, 72, 0.05)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => saveCalc(calcValues.map(() => ''))}
                        className="py-4 border-2 border-dashed border-rose-200 hover:border-rose-500 text-rose-500 hover:text-rose-600 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-[0.15em] bg-transparent cursor-pointer"
                        title="Limpar todos os valores adicionados"
                      >
                        <Trash2 size={16} /> Limpar Tudo
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 bg-white/50 p-4 rounded-xl shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1 border border-blue-100">
                        <Info size={14} />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
                        A calculadora aceita valores com pontos e vírgulas. A soma é atualizada em tempo real.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 p-4 flex items-center justify-between group cursor-pointer hover:border-blue-500 transition-all rounded-xl shadow-sm mt-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Última Atualização</p>
                    <p className="text-xs font-bold text-slate-700 font-sans">Agora mesmo</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
