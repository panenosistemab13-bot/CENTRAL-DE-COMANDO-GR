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
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GUEST_USER_ID } from '../constants';

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
}

interface SMCreatorProps {
  view?: 'generator' | 'codes';
}

export default function SMCreator({ view = 'generator' }: SMCreatorProps) {
  const [idaRows, setIdaRows] = useState<SMRow[]>([]);
  const [voltaRows, setVoltaRows] = useState<SMRow[]>([]);
  const [calcValues, setCalcValues] = useState<string[]>(['']);

  useEffect(() => {
    const storedIda = localStorage.getItem('sm_creator_ida');
    const storedVolta = localStorage.getItem('sm_creator_volta');
    const storedCalc = localStorage.getItem('sm_creator_calc');
    if (storedIda) setIdaRows(JSON.parse(storedIda));
    if (storedVolta) setVoltaRows(JSON.parse(storedVolta));
    if (storedCalc) setCalcValues(JSON.parse(storedCalc));
  }, []);

  useEffect(() => {
    localStorage.setItem('sm_creator_ida', JSON.stringify(idaRows));
    localStorage.setItem('sm_creator_volta', JSON.stringify(voltaRows));
    localStorage.setItem('sm_creator_calc', JSON.stringify(calcValues));
  }, [idaRows, voltaRows, calcValues]);
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

  const parseInput = (text: string, setRows: React.Dispatch<React.SetStateAction<SMRow[]>>, section: 'ida' | 'volta', forceZeroValue: boolean = false) => {
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
      setRows(prev => [...prev, ...newRows]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, section: 'ida' | 'volta') => {
    const text = e.clipboardData.getData('text');
    parseInput(text, section === 'ida' ? setIdaRows : setVoltaRows, section, true);
  };

  const addNewRow = (section: 'ida' | 'volta') => {
    const newRow: SMRow = {
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: '',
      valorNf: 'R$ 0,00'
    };
    if (section === 'ida') {
      setIdaRows([...idaRows, newRow]);
    } else {
      setVoltaRows([...voltaRows, newRow]);
    }
  };

  const updateRowValue = (index: number, field: keyof SMRow, value: string, section: 'ida' | 'volta') => {
    let finalValue = value;
    
    if (field === 'valorNf') {
      finalValue = formatNfValue(value);
    } else if (field === 'placa') {
      finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (field === 'trecho') {
      finalValue = value.toUpperCase();
    }

    const updater = (prev: SMRow[]) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      return newRows;
    };

    if (section === 'ida') {
      setIdaRows(updater);
    } else {
      setVoltaRows(updater);
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

  const addCalcLine = () => setCalcValues([...calcValues, '']);
  const updateCalcValue = (index: number, val: string) => {
    const newVals = [...calcValues];
    newVals[index] = val;
    setCalcValues(newVals);
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
    const formatRowsHtml = (rows: SMRow[], title: string, color: string) => {
      if (rows.length === 0) return '';
      let html = `<h3 style="color: ${color}; font-family: sans-serif; margin-bottom: 5px;">--- ${title} ---</h3>`;
      html += `<table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; text-align: left;">
        <thead>
          <tr style="background-color: ${color}; color: white; text-transform: uppercase;">
            <th style="padding: 8px; border: 1px solid #ccc;">DATA</th>
            <th style="padding: 8px; border: 1px solid #ccc;">MOTORISTA</th>
            <th style="padding: 8px; border: 1px solid #ccc;">PLACA</th>
            <th style="padding: 8px; border: 1px solid #ccc;">BAÚ 1</th>
            <th style="padding: 8px; border: 1px solid #ccc;">BAÚ 2</th>
            <th style="padding: 8px; border: 1px solid #ccc;">TRECHO</th>
            <th style="padding: 8px; border: 1px solid #ccc;">VALOR NF</th>
          </tr>
        </thead>
        <tbody>`;
      
      rows.forEach(r => {
        html += `<tr>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.dataSaida}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.motorista}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.placa}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.bau1}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.bau2}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.trecho}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${r.valorNf}</td>
        </tr>`;
      });
      html += `</tbody></table><br/>`;
      return html;
    };

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
      <div style="font-family: sans-serif; color: #333;">
        <p>${greeting}!</p>
        <p>Segue relatórios de SM - Ida e Volta.</p>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #9333ea; margin-bottom: 5px;">--- ROTA IDA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <strong>${getJourneyDate(idaRows)}</strong>!</p>
          ${formatRowsHtml(idaRows, '', '#9333ea')}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #c62828; margin-bottom: 5px;">--- ROTA VOLTA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <strong>${getJourneyDate(voltaRows)}</strong>!</p>
          ${formatRowsHtml(voltaRows, '', '#c62828')}
        </div>

        <p style="margin-top: 20px;"><strong>Total Calculado: ${calculateTotal()}</strong></p>
        <p>Att,</p>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue relatórios de SM - Ida e Volta.\n\nROTA IDA\n${greeting}, Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${getJourneyDate(idaRows)}!\n${formatRowsText(idaRows, '')}\nROTA VOLTA\n${greeting}, Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${getJourneyDate(voltaRows)}!\n${formatRowsText(voltaRows, '')}\nTotal Calculado: ${calculateTotal()}\n\nAtt,`;

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
    
    const color = title.includes('IDA') ? '#9333ea' : '#c62828';
    const isIda = title.includes('IDA');
    const greeting = getGreeting();
    const date = getJourneyDate(rows);
    
    const phrase = isIda 
      ? `Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${date}!`
      : `Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${date}!`;

    let html = `<div style="font-family: sans-serif; color: #333;">
      <h3 style="color: ${color}; margin-bottom: 5px;">--- ${title} ---</h3>
      <p style="font-size: 13px;">${greeting},</p>
      <p style="font-size: 13px;">${phrase}</p>`;
    
    html += `<table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; text-align: left;">
      <thead>
        <tr style="background-color: ${color}; color: white; text-transform: uppercase;">
          <th style="padding: 8px; border: 1px solid #ccc;">DATA</th>
          <th style="padding: 8px; border: 1px solid #ccc;">MOTORISTA</th>
          <th style="padding: 8px; border: 1px solid #ccc;">PLACA</th>
          <th style="padding: 8px; border: 1px solid #ccc;">BAÚ 1</th>
          <th style="padding: 8px; border: 1px solid #ccc;">BAÚ 2</th>
          <th style="padding: 8px; border: 1px solid #ccc;">TRECHO</th>
          <th style="padding: 8px; border: 1px solid #ccc;">VALOR NF</th>
        </tr>
      </thead>
      <tbody>`;
    
    rows.forEach(r => {
      html += `<tr>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.dataSaida}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.motorista}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.placa}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.bau1}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.bau2}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.trecho}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${r.valorNf}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;

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
    <div className="space-y-8">
      {view === 'codes' ? (
        renderCodesTable()
      ) : (
        <>
          <div className="report-card p-8 border-l-8 border-l-primary bg-[#0b0f1a] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner border border-primary/20">
                <Calculator size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Sistema de Monitoramento</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Relatórios & Cálculos Operacionais</p>
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(59,130,246,0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToEmail}
              className={cn(
                "px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all relative z-10 shadow-xl",
                copied ? "bg-green-500 text-white shadow-green-500/20" : "bg-primary text-white"
              )}
            >
              {copied ? <Check size={18} /> : <Mail size={18} />}
              {copied ? 'CONTEÚDO COPIADO' : 'GERAR RELATÓRIO P/ EMAIL'}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* ROTA IDA (Purple Theme) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} /> Rota Ida
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('ida')}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {idaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          idaCopied ? "bg-purple-500 text-white" : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                        )}
                      >
                        {idaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {idaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => setIdaRows([])} className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-tighter">Limpar Tudo</button>
                  </div>
                </div>

                <div className="report-card overflow-hidden bg-[#e9d5ff]/10 border-purple-500/20">
                  {idaRows.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="p-4 bg-purple-500/10 rounded-full mb-4">
                        <Clipboard className="text-purple-500 w-8 h-8" />
                      </div>
                      <p className="text-sm text-slate-400 mb-4">Cole aqui as informações da Rota Ida ou adicione manualmente</p>
                      <div className="flex flex-col gap-3 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'ida')}
                          placeholder="Ctrl+V aqui..."
                          className="w-full h-24 bg-white/5 border border-border-dark rounded-xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-purple-500/50 resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('ida')}
                          className="w-full py-3 border border-dashed border-purple-500/30 rounded-xl text-purple-500 hover:text-purple-400 flex items-center justify-center gap-2 text-xs font-bold uppercase"
                        >
                          <Plus size={16} /> Adicionar manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-purple-600/20 text-purple-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-purple-500/20">
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
                        <tbody className="divide-y divide-purple-500/10">
                          {idaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-slate-200 hover:bg-purple-500/[0.05] transition-all group/row">
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'ida')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 font-bold group/cell">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'ida')}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-purple-500/10 hover:bg-purple-500/30 rounded-lg text-purple-500 transition-all shrink-0"
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
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all font-black tracking-widest uppercase"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'ida')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'ida')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.trecho}
                                  onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'ida')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all uppercase"
                                />
                              </td>
                              <td className="p-3 text-right font-black text-purple-500 group/cell">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-purple-500/10 hover:bg-purple-500/30 rounded-lg text-purple-500 transition-all shrink-0"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-right focus:bg-purple-500/10 focus:border-purple-500/30 outline-none transition-all font-mono"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setIdaRows(idaRows.filter((_, idx) => idx !== i))} 
                                  className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg shadow-rose-500/10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* ROTA VOLTA (Sky Theme) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Download size={16} className="rotate-180" /> Rota Volta
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNewRow('volta')}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={12} /> Add Linha
                    </button>
                    {voltaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          voltaCopied ? "bg-red-500 text-white" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        )}
                      >
                        {voltaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Planilha'}
                      </button>
                    )}
                    <button onClick={() => setVoltaRows([])} className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-tighter">Limpar Tudo</button>
                  </div>
                </div>

                <div className="report-card overflow-hidden bg-[#f4cccc]/10 border-red-500/20">
                  {voltaRows.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="p-4 bg-red-500/10 rounded-full mb-4">
                        <Clipboard className="text-red-500 w-8 h-8" />
                      </div>
                      <p className="text-sm text-slate-400 mb-4">Cole aqui as informações da Rota Volta ou adicione manualmente</p>
                      <div className="flex flex-col gap-3 w-full max-w-md">
                        <textarea 
                          onPaste={(e) => handlePaste(e, 'volta')}
                          placeholder="Ctrl+V aqui..."
                          className="w-full h-24 bg-white/5 border border-border-dark rounded-xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-red-500/50 resize-none"
                        />
                        <button 
                          onClick={() => addNewRow('volta')}
                          className="w-full py-3 border border-dashed border-red-500/30 rounded-xl text-red-500 hover:text-red-400 flex items-center justify-center gap-2 text-xs font-bold uppercase"
                        >
                          <Plus size={16} /> Adicionar manualmente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-red-600/20 text-red-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-red-500/20">
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
                        <tbody className="divide-y divide-red-500/10">
                          {voltaRows.map((row, i) => (
                            <tr key={i} className="text-xs text-slate-200 hover:bg-red-500/[0.05] transition-all group/row">
                              <td className="p-3">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'volta')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 font-bold group/cell">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'volta')}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-500 transition-all shrink-0"
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
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-black tracking-widest uppercase"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'volta')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'volta')}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-center focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 group/trecho">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'volta')}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all uppercase"
                                  />
                                  <button 
                                    onClick={() => {
                                      const inverted = invertRoute(row.trecho);
                                      updateRowValue(i, 'trecho', inverted, 'volta');
                                    }}
                                    className="opacity-0 group-hover/trecho:opacity-100 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shrink-0 shadow-lg"
                                    title="Inverter Rota"
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right font-black text-red-500 group/cell">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-500 transition-all shrink-0"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-right focus:bg-red-500/10 focus:border-red-500/30 outline-none transition-all font-mono"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => setVoltaRows(voltaRows.filter((_, idx) => idx !== i))} 
                                  className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg shadow-rose-500/10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Calculator Sidebar */}
            <div className="space-y-6">
              <div className="report-card p-6 flex flex-col h-full border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calculator size={16} className="text-primary" />
                    Soma de Valores
                  </h3>
                  <button 
                    onClick={() => setCalcValues([''])}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Resetar calculadora"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="bg-[#0b0f1a] rounded-2xl p-6 mb-6 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-center relative group/total overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Consolidado</p>
                  <h4 className="text-3xl font-black text-white tracking-tighter">
                    <span className="text-primary mr-2 text-xl font-medium">R$</span>
                    {calculateTotal()}
                  </h4>
                  <div className="absolute top-3 right-3 opacity-0 group-hover/total:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={copyTotalRaw}
                      className={cn(
                        "p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center",
                        totalRawCopied ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-primary"
                      )}
                      title="Copiar Valor"
                    >
                      {totalRawCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] no-scrollbar pr-1">
                  {calcValues.map((val, i) => (
                    <div key={i} className="group relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-[10px]">R$</div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateCalcValue(i, e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-10 py-3 text-sm text-white font-mono focus:bg-primary/[0.05] focus:border-primary/30 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                      />
                      {calcValues.length > 1 && (
                        <button 
                          onClick={() => setCalcValues(calcValues.filter((_, idx) => idx !== i))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addCalcLine}
                    className="w-full py-5 border-2 border-dashed border-white/5 hover:border-primary/30 rounded-2xl text-slate-500 hover:text-primary flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.25em] bg-white/[0.02]"
                  >
                    <Plus size={20} /> Adicionar Linha
                  </motion.button>
                </div>

                <div className="mt-8 pt-6 border-t border-border-dark">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                        <Info size={14} />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        A calculadora aceita valores com pontos e vírgulas. A soma é atualizada em tempo real.
                      </p>
                    </div>
                </div>
              </div>
              
              <div className="report-card p-4 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Última Atualização</p>
                    <p className="text-xs font-bold text-white">Agora mesmo</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
