import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Mail, 
  Truck, 
  Cpu, 
  User, 
  CreditCard, 
  Phone
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RawData {
  dataAverbacao: string;
  origem: string;
  destino: string;
  placaCav: string;
  placaCarr: string;
  nf: string;
  valorNf: string;
  somaVl: string;
  protocolo: string;
}

interface ExtraData {
  transportadora: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

interface AverbacaoProps {
  onBack?: () => void;
}

export default function Averbacao({ onBack }: AverbacaoProps) {
  const [parsedRows, setParsedRows] = useState<RawData[]>([]);
  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: '',
    tecnologia: '',
    nomeMotorista: '',
    cpf: '',
    telefone: ''
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedRows = localStorage.getItem('averbacao_rows');
    if (storedRows) setParsedRows(JSON.parse(storedRows));
  }, []);

  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtraData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n');
    const newRows: RawData[] = [];
    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 7) {
        newRows.push({
          dataAverbacao: parts[0] || '',
          origem: parts[1] || '',
          destino: parts[2] || '',
          placaCav: parts[3] || '',
          placaCarr: parts[4] || '',
          nf: parts[5] || '',
          valorNf: parts[6] || '',
          somaVl: parts[7] || '',
          protocolo: parts[8] || ''
        });
      }
    });
    if (newRows.length > 0) {
      setParsedRows(newRows);
      localStorage.setItem('averbacao_rows', JSON.stringify(newRows));
    }
  };

  const getTotalValue = () => {
    for (let i = parsedRows.length - 1; i >= 0; i--) {
      if (parsedRows[i].somaVl && parsedRows[i].somaVl.trim() !== '') return parsedRows[i].somaVl;
    }
    return 'R$ 0,00';
  };

  const getRoute = () => {
    if (parsedRows.length === 0) return 'ORIGEM x DESTINO';
    const row = parsedRows[0];
    return `${row.origem} x ${row.destino}`;
  };

  const getPlacasCarretas = () => [...new Set(parsedRows.map(r => r.placaCarr).filter(p => !!p))].join(' / ');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 && hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const copyToEmail = async () => {
    const htmlContent = `
        <div style="background-color: #F2E4CC; padding: 40px; font-family: 'serif'; color: #2D1A10; border: 8px solid #6B4423;">
          <h1 style="font-size: 28px; margin-bottom: 20px; font-family: 'Playfair Display', serif;">${getGreeting()}!</h1>
          <p style="margin-bottom: 25px; font-size: 16px;">Relatório gerado via sistema.</p>
          <div style="background-color: #E8D4B0; border-left: 8px solid #B32025; padding: 25px; margin: 25px 0; border: 2px solid #C7A26A; border-radius: 4px;">
            <p style="font-weight: 800; margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase;">ROTA: <span>${getRoute().toUpperCase()}</span></p>
            <p style="font-weight: 800; margin: 0; font-size: 18px; text-transform: uppercase;">VALOR DA CARGA: <span style="color: #B32025;">${getTotalValue()}</span></p>
          </div>
          <p style="margin-bottom: 25px; font-size: 16px;">Segue dados e NF's em anexo.</p>
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; border: 2px solid #3A2414;">
            <thead>
              <tr style="background-color: #3A2414; color: #E8D4B0; text-transform: uppercase;">
                ${['ORIGEM', 'DESTINO', 'TRANSPORTADORA', 'PLACA CAVALO', 'PLACAS CARRETAS', 'TECNOLOGIA', 'NOME MOTORISTA', 'CPF', 'TELEFONE'].map(h => `<th style="padding: 12px; border: 1px solid #6B4423;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr style="text-align: center; background-color: #FDF9F0;">
                <td style="padding: 15px; border: 1px solid #C7A26A;">${parsedRows[0]?.origem || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${parsedRows[0]?.destino || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${extraData.transportadora || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A; font-weight: bold;">${parsedRows[0]?.placaCav || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${getPlacasCarretas() || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${extraData.tecnologia || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${extraData.nomeMotorista || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${extraData.cpf || '---'}</td>
                <td style="padding: 15px; border: 1px solid #C7A26A;">${extraData.telefone || '---'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlContent], { type: 'text/html' }) })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="flex h-screen canvas-grid">
      {/* Sidebar - Artisan Plate */}
      <div className="w-[320px] bg-[#E8D4B0] p-6 flex flex-col border-r-8 border-[#6B4423] shadow-2xl relative">
        <div className="flex items-center gap-3 mb-8 bg-[#3A2414] p-4 rounded-xl border border-[#C7A26A]">
          <div className="w-12 h-12 bg-[#B32025] rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/20">3</div>
          <div>
            <h1 className="font-bold text-sm text-[#F2E4CC] tracking-widest uppercase">AVERBAÇÃO</h1>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> MÓDULO ATIVO</p>
          </div>
        </div>
        
        {/* Input Fields */}
        <div className="space-y-4 flex-1">
          {[
            { label: 'TRANSPORTADORA', key: 'transportadora', icon: Truck },
            { label: 'TECNOLOGIA', key: 'tecnologia', icon: Cpu },
            { label: 'NOME MOTORISTA', key: 'nomeMotorista', icon: User },
            { label: 'CPF', key: 'cpf', icon: CreditCard },
            { label: 'TELEFONE', key: 'telefone', icon: Phone }
          ].map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[10px] font-black text-[#6B4423] flex items-center gap-2 uppercase tracking-wide"><field.icon size={12}/> {field.label}</label>
              <input name={field.key} value={(extraData as any)[field.key]} onChange={handleExtraChange} className="w-full p-3 rounded-lg border-2 border-[#C7A26A] bg-[#F2E4CC] text-xs font-bold text-[#2D1A10] placeholder-[#6B4423]/50 focus:border-[#B32025] focus:outline-none shadow-inner" placeholder="DIGITE..." />
            </div>
          ))}
        </div>
        
        <button onClick={copyToEmail} className="w-full bg-[#B32025] hover:bg-[#8c060a] text-white py-4 rounded-lg font-black text-xs mb-4 flex items-center justify-center gap-2 transition-all shadow-lg border-b-4 border-[#5a0f12]">
            <Mail size={16} /> {copied ? 'COPIADO!' : 'COPIAR PARA EMAIL'}
        </button>

        <div className="bg-[#3A2414] p-4 rounded-lg text-[10px] text-[#F2E4CC] border-2 border-[#C7A26A] shadow-inner font-mono">
            <strong className="text-[#C7A26A]">DICA DE GESTÃO</strong><br/>Verifique os dados cuidadosamente antes de enviar.
        </div>
      </div>
      
      {/* Main - Artisan Report */}
      <div className="flex-1 p-10 overflow-y-auto">
        {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6B4423]">
               <Clipboard size={80} className="mb-6 opacity-30"/>
               <textarea onChange={(e) => parseInput(e.target.value)} placeholder="Cole os dados aqui..." className="w-96 h-48 p-6 border-4 border-dashed border-[#C7A26A] bg-transparent rounded-xl text-center text-[#3A2414] placeholder-[#6B4423]/50"/>
            </div>
        ) : (
            <div className="report-card p-8">
                <h2 className="text-3xl font-heading mb-1 text-[#2D1A10]">{getGreeting()}!</h2>
                <p className="mb-8 text-[#6B4423] font-medium italic">Relatório gerado via sistema integrador.</p>
                
                <div className="bg-[#E8D4B0] p-6 rounded-xl mb-8 border-l-8 border-[#B32025] shadow-inner">
                    <p className="font-bold text-lg text-[#2D1A10] uppercase">ROTA: {getRoute().toUpperCase()}</p>
                    <p className="font-bold text-xl text-[#B32025] uppercase mt-2">VALOR DA CARGA: {getTotalValue()}</p>
                </div>
                
                <p className="mb-6 text-sm text-[#2D1A10] font-medium uppercase tracking-wide">Segue dados e NF's em anexo.</p>
                
                <div className="overflow-hidden border-2 border-[#3A2414] rounded-xl shadow-lg">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="bg-[#3A2414] text-[#E8D4B0] uppercase font-black tracking-widest">
                        {['ORIGEM', 'DESTINO', 'TRANSPORTADORA', 'PLACA CAVALO', 'PLACAS CARRETAS', 'TECNOLOGIA', 'NOME MOTORISTA', 'CPF', 'TELEFONE'].map(h => <th key={h} className="p-4 border-r border-[#6B4423]">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="bg-[#FDF9F0]">
                      <tr className="text-[#2D1A10] font-medium">
                        <td className="p-5 border-r border-[#E8D4B0]">{parsedRows[0]?.origem || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{parsedRows[0]?.destino || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{extraData.transportadora || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0] font-bold text-[#B32025]">{parsedRows[0]?.placaCav || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{getPlacasCarretas() || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{extraData.tecnologia || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{extraData.nomeMotorista || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{extraData.cpf || '---'}</td>
                        <td className="p-5 border-r border-[#E8D4B0]">{extraData.telefone || '---'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
