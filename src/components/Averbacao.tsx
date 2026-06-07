import React, { useState, useEffect, useRef } from 'react';
import { 
  Clipboard, 
  Trash2, 
  Mail, 
  Check, 
  HelpCircle,
  FileText,
  Copy,
  Info,
  Table as TableIcon,
  Send,
  Truck,
  Cpu,
  User,
  CreditCard,
  Phone,
  Download,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
  view?: 'generator' | 'codes';
}

export default function Averbacao({ view = 'generator' }: AverbacaoProps) {
  const [inputText, setInputText] = useState('');
  const [parsedRows, setParsedRows] = useState<RawData[]>([]);
  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: '',
    tecnologia: '',
    nomeMotorista: '',
    cpf: '',
    telefone: ''
  });
  const [copied, setCopied] = useState(false);
  const [activeInternalTab, setActiveInternalTab] = useState<'normal' | 'exportacao'>('normal');

  const storedRowsRef = useRef<boolean>(false);
  useEffect(() => {
    if (!storedRowsRef.current) {
      const storedRows = localStorage.getItem('averbacao_rows');
      if (storedRows) setParsedRows(JSON.parse(storedRows));
      storedRowsRef.current = true;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('averbacao_rows', JSON.stringify(parsedRows));
  }, [parsedRows]);

  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtraData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n');
    const newRows: RawData[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 7) {
        if (parts[0].includes('/') || !isNaN(Number(parts[0].charAt(0)))) {
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
      }
    });

    if (newRows.length > 0) {
      setParsedRows(newRows);
      setInputText('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    parseInput(text);
  };

  const clearData = () => {
    setParsedRows([]);
    setExtraData({
      transportadora: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    });
    setInputText('');
    localStorage.removeItem('averbacao_rows');
  };

  const getTotalValue = () => {
    for (let i = parsedRows.length - 1; i >= 0; i--) {
      if (parsedRows[i].somaVl && parsedRows[i].somaVl.trim() !== '') {
        return parsedRows[i].somaVl;
      }
    }
    return 'R$ 0,00';
  };

  const getRoute = () => {
    if (parsedRows.length === 0) return 'ORIGEM x DESTINO';
    const row = parsedRows[0];
    return `${row.origem} x ${row.destino}`;
  };

  const getPlacasCarretas = () => {
    const placas = [...new Set(parsedRows.map(r => r.placaCarr).filter(p => p !== ''))];
    return placas.join(' / ');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 || hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();
    const protocolsStrText = [...new Set(parsedRows.map(r => r.protocolo).filter(p => !!p))].map(p => `PROTOCOLO: ${p}`).join('\n');
    const protocolsStrHtml = [...new Set(parsedRows.map(r => r.protocolo).filter(p => !!p))].map(p => `<p style="margin: 5px 0 0 0; font-family: sans-serif; font-weight: 800; text-transform: uppercase; font-size: 14px;">PROTOCOLO: <span style="font-weight: 400; color: #002d3d; text-decoration: underline;">${p}</span></p>`).join('');
    
    const htmlContent = `
      <div style="background-color: #f7f1e3; padding: 40px; font-family: 'Georgia', serif; color: #1a1310; line-height: 1.5;">
        <h1 style="font-weight: normal; font-size: 28px; margin: 0 0 20px 0;">${greeting}!</h1>
        
        <p style="font-size: 16px; margin: 0 0 25px 0;">
          Segue <span style="background-color: #633219; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-family: sans-serif; font-size: 14px;">averbação</span> realizada via sistema.
        </p>

        <div style="background-color: #eeeeee; border-left: 6px solid #c9b09a; padding: 25px; border-radius: 4px; margin: 0 0 25px 0;">
          <p style="margin: 0; font-family: sans-serif; font-weight: 800; text-transform: uppercase; font-size: 16px; letter-spacing: -0.02em;">
            ROTA: <span style="font-weight: 500; font-family: sans-serif; color: #000;">${getRoute().toUpperCase()}</span>
          </p>
          ${protocolsStrHtml}
          <p style="margin: 15px 0 0 0; font-family: sans-serif; font-weight: 800; text-transform: uppercase; font-size: 18px; letter-spacing: -0.02em;">
            VALOR DA CARGA: <span style="color: #bb2d2d; font-weight: 900;">${getTotalValue()}</span>
          </p>
        </div>

        <p style="font-style: italic; color: #666; margin: 0 0 20px 0;">Segue dados e NF's em anexo.</p>

        <div style="border-radius: 12px; overflow: hidden; border: 1px solid #c9b09a;">
          <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-family: sans-serif; font-size: 10px; text-align: center; text-transform: uppercase; font-weight: bold; background-color: #ffffff;">
            <thead>
              <tr style="background-color: #1a1310; color: #d4b791;">
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">ORIGEM</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">DESTINO</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">TRANSPORTADORA</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516; color: #eab308;">PLACA CAVALO</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">PLACAS CARRETAS</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">TECNOLOGIA</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">NOME MOTORISTA</th>
                <th style="padding: 12px 8px; border-right: 1px solid #3e2516;">CPF</th>
                <th style="padding: 12px 8px;">TELEFONE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${parsedRows[0]?.origem || ''}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${parsedRows[0]?.destino || ''}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${extraData.transportadora || '---'}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a; background-color: #e6dac3; color: #633219;">${parsedRows[0]?.placaCav || ''}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${getPlacasCarretas()}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${extraData.tecnologia || '---'}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${extraData.nomeMotorista || '---'}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${extraData.cpf || '---'}</td>
                <td style="padding: 15px 10px; border: 1px solid #c9b09a;">${extraData.telefone || '---'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #c9b09a; padding-top: 20px;">
          <p style="font-style: italic; color: #666; margin: 0 0 10px 0; font-size: 14px;">Atenciosamente,</p>
          <p style="font-weight: normal; font-size: 24px; margin: 0; color: #1a1310; text-transform: uppercase; font-family: 'Georgia', serif;">Sistema PGR</p>
          <p style="font-size: 11px; color: #a1a1a1; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; font-family: sans-serif; font-weight: bold;">Gestão inteligente de entrada e saída de veículos.</p>
        </div>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue averbação realizada via sistema.\n\nROTA: ${getRoute()}\n${protocolsStrText}\nValor da Carga: ${getTotalValue()}\n\nSegue dados e NF's em anexo.\n\nAtenciosamente,\nSistema PGR`;

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

  return (
    <div className="min-h-full">
      {parsedRows.length === 0 ? (
        <div className="max-w-4xl mx-auto py-20 px-4 sm:px-0">
          <div className="leather-texture p-12 flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-[#3e2516] shadow-2xl group hover:border-[#5a3621] transition-all cursor-text" onClick={() => document.getElementById('paste-area')?.focus()}>
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20">
              <Clipboard className="text-[#a16241] w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif-display font-bold text-white mb-3">Área de Averbação</h3>
            <p className="text-stone-400 text-sm text-center max-w-md mb-8 italic">
              Cole aqui os dados copiados da sua planilha para gerar o relatório profissional.
            </p>
            
            <textarea
              id="paste-area"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              className="w-full h-40 bg-[#1a110a] border-2 border-[#3e2516] rounded-2xl p-6 text-xs font-mono text-amber-100/70 focus:border-[#a16241]/50 outline-none resize-none shadow-inner"
              placeholder="Pressione Ctrl+V aqui..."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-0 rounded-[2.5rem] overflow-hidden border-4 border-[#3e2516] shadow-[0_40px_100px_rgba(0,0,0,0.5)] bg-white">
          
          {/* SIDEBAR: Leather Control Panel */}
          <div className="lg:w-96 leather-texture p-8 flex flex-col h-auto lg:h-[auto] relative min-h-full">
            <div className="absolute top-0 right-0 w-2 h-full bg-black/10" />
            
            {/* 3 Corações Logo */}
            <div className="relative mb-14 group">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#633219] rounded-br-[3rem] p-4 flex items-center justify-center shadow-lg border-b-4 border-r-4 border-[#3e2516]">
                <img src="https://i.postimg.cc/Y23w34cv/1www.png" alt="3 Corações" className="w-12 h-12 object-contain" />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-8 mt-4">
              <button
                onClick={() => setActiveInternalTab('normal')}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2",
                  activeInternalTab === 'normal' 
                    ? "bg-[#d4b791] text-[#2c1a12] border-b-4 border-[#a88a64]" 
                    : "bg-[#1a110a] text-stone-500 border-b-4 border-black hover:text-stone-300"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", activeInternalTab === 'normal' ? "bg-[#633219]" : "bg-stone-700")} />
                NORMAL
              </button>
              <div className="flex-1 flex items-center gap-2 bg-[#1a110a] rounded-xl px-4 border-b-4 border-black opacity-50 cursor-not-allowed">
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">EXPORTAÇÃO</span>
                <Download size={14} className="text-stone-700" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 flex-1 pb-10">
              {[
                { label: 'TRANSPORTADORA', key: 'transportadora', icon: Truck },
                { label: 'TECNOLOGIA', key: 'tecnologia', icon: Cpu },
                { label: 'NOME MOTORISTA', key: 'nomeMotorista', icon: User },
                { label: 'CPF', key: 'cpf', icon: CreditCard },
                { label: 'TELEFONE', key: 'telefone', icon: Phone }
              ].map((field) => (
                <div key={field.key} className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#1a110a] rounded-lg border border-[#3e2516]">
                      <field.icon size={14} className="text-amber-600" />
                    </div>
                    <label className="text-[9px] font-black text-amber-800/80 uppercase tracking-[0.2em] font-mono">
                      {field.label}
                    </label>
                  </div>
                  <input
                    type="text"
                    name={field.key}
                    value={(extraData as any)[field.key]}
                    onChange={handleExtraChange}
                    placeholder="DIGITE..."
                    className="w-full bg-[#1a110a]/80 border-b-2 border-[#3e2516] rounded-t-lg px-4 py-2.5 text-xs text-stone-200 placeholder-stone-700 outline-none focus:border-[#a16241] transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>

            {/* Main Action Button */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
              <button 
                onClick={copyToEmail}
                className={cn(
                  "w-full h-16 bg-gradient-to-b from-[#a16241] to-[#633219] hover:from-[#b37352] hover:to-[#743e21] rounded-2xl border-b-4 border-[#3e2516] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white transition-all active:translate-y-1 active:border-b-0 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group",
                  copied && "bg-green-600 from-green-500 to-green-700"
                )}
              >
                <div className="bg-black/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  {copied ? <Check size={20} /> : <Mail size={20} />}
                </div>
                <span>{copied ? 'COPIADO!' : 'COPIAR PARA EMAIL'}</span>
              </button>

              {/* Manager Tip Card */}
              <div className="p-5 bg-black/30 border border-[#3e2516] rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 text-[#633219]/20 group-hover:text-amber-900 transition-colors">
                   <AlertTriangle size={40} />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-amber-600/20 rounded shadow-inner">
                        <HelpCircle size={12} className="text-amber-600" />
                      </div>
                      <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">DICA DE GESTÃO</span>
                   </div>
                   <p className="text-[10px] text-stone-400 font-medium leading-relaxed italic">
                     Verifique os dados cuidadosamente antes de enviar.
                   </p>
                 </div>
              </div>
            </div>
            
            {/* Sidebar Footer Slogan */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-30 grayscale hover:grayscale-0 transition-all">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <img src="https://i.postimg.cc/Y23w34cv/1www.png" alt="3C" className="w-4 h-4 opacity-50" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white tracking-widest">3CORAÇÕES</span>
                    <span className="text-[6px] text-stone-500 font-bold uppercase">PREMIUM LOGISTICS</span>
                  </div>
               </div>
               <button onClick={clearData} className="p-2 text-stone-600 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
               </button>
            </div>
          </div>

          {/* MAIN AREA: Paper Parchment Relatório */}
          <div className="flex-1 paper-texture p-8 sm:p-12 lg:p-16 relative flex flex-col font-sans text-stone-800 min-h-full overflow-y-visible">
            
            {/* Watermark/Stamp */}
            <div className="absolute top-10 right-10 opacity-30 pointer-events-none group hover:opacity-100 transition-all duration-1000 hidden md:block">
               <div className="w-40 h-40 border-4 border-dashed border-[#c9b09a] rounded-full p-4 flex flex-col items-center justify-center transform rotate-12 scale-110 group-hover:rotate-0 transition-transform">
                  <div className="flex flex-col items-center border border-double border-[#c9b09a] rounded-full p-6">
                    <img src="https://i.postimg.cc/Y23w34cv/1www.png" alt="Logo" className="w-8 h-8 opacity-30 mb-2 grayscale" />
                    <span className="text-[8px] font-serif-display font-black tracking-widest text-[#a88a64]">TRÊS CORAÇÕES</span>
                    <span className="text-[6px] font-mono tracking-tighter text-[#a88a64]">DESDE 1959</span>
                  </div>
               </div>
            </div>

            {/* Coffee Decoration */}
            <div className="absolute bottom-10 right-10 pointer-events-none opacity-60 group hover:opacity-100 transition-opacity hidden md:block">
               <img src="https://i.postimg.cc/vT53Tf24/coffee-beans-drawing.png" alt="Coffee" className="w-48 h-auto opacity-20 group-hover:opacity-60 transition-opacity" />
               <div className="absolute -top-6 -left-6 transform scale-75 group-hover:scale-100 transition-transform">
                  <div className="relative">
                    <div className="w-20 h-20 bg-[#e6dac3] rounded-full blur-2xl opacity-40" />
                    <img src="https://i.postimg.cc/hGwpVQqX/Gemini-Generated-Image-5vo6rf5vo6rf5vo6.png" alt="Cup" className="w-24 h-auto relative z-10" />
                  </div>
               </div>
            </div>

            <div className="max-w-4xl w-full mx-auto relative z-10 space-y-8 pb-32">
              
              <div className="space-y-4">
                <h1 className="text-3xl font-serif-display font-medium text-stone-900 tracking-tight">{getGreeting()}!</h1>
                <p className="text-base text-stone-700">
                  Segue <span className="bg-[#633219] text-white px-3 py-1 rounded-md font-bold tracking-tight text-sm shadow-md">averbação</span> realizada via sistema.
                </p>
              </div>

              <div className="py-6 border-l-4 border-[#c9b09a] pl-8 space-y-3 bg-stone-900/5 rounded-r-2xl">
                <p className="text-lg font-black tracking-tight uppercase text-stone-800">
                  ROTA: <span className="text-[#633219]">{getRoute()}</span>
                </p>
                <div className="space-y-1">
                  {Array.from(new Set(parsedRows.map(r => r.protocolo).filter(p => !!p))).map((prot, i) => (
                    <p key={i} className="text-base font-black uppercase text-stone-800">
                      PROTOCOLO: <span className="text-[#002d3d] underline decoration-stone-300">{prot}</span>
                    </p>
                  ))}
                </div>
                <p className="text-xl font-bold tracking-tight uppercase text-stone-800 flex items-baseline gap-2">
                  Valor da Carga: <span className="text-[#bb2d2d] font-black text-2xl">{getTotalValue()}</span>
                </p>
              </div>

              <p className="text-base font-medium text-stone-500 italic pb-2">Segue dados e NF's em anexo.</p>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-[#c9b09a] bg-white">
                <table className="w-full border-collapse text-[10px] sm:text-[11px] font-bold text-center uppercase tracking-tight min-w-[800px]">
                  <thead>
                    <tr className="bg-[#1a1310] text-[#d4b791]">
                      <th className="p-4 border-r border-[#3e2516]">ORIGEM</th>
                      <th className="p-4 border-r border-[#3e2516]">DESTINO</th>
                      <th className="p-4 border-r border-[#3e2516]">TRANSPORTADORA</th>
                      <th className="p-4 border-r border-[#3e2516] text-[#eab308]">PLACA CAVALO</th>
                      <th className="p-4 border-r border-[#3e2516]">PLACAS CARRETAS</th>
                      <th className="p-4 border-r border-[#3e2516]">TECNOLOGIA</th>
                      <th className="p-4 border-r border-[#3e2516]">NOME MOTORISTA</th>
                      <th className="p-4 border-r border-[#3e2516]">CPF</th>
                      <th className="p-4">TELEFONE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#fffff0] text-stone-800 hover:bg-stone-50 transition-colors">
                      <td className="p-5 border-r border-[#c9b09a] border-b">{parsedRows[0]?.origem}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b">{parsedRows[0]?.destino}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b">{extraData.transportadora || '---'}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b bg-[#e6dac3]/30 text-[#633219] font-black">{parsedRows[0]?.placaCav}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b">{getPlacasCarretas()}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b">{extraData.tecnologia || '---'}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b truncate max-w-[120px]">{extraData.nomeMotorista || '---'}</td>
                      <td className="p-5 border-r border-[#c9b09a] border-b">{extraData.cpf || '---'}</td>
                      <td className="p-5 border-b">{extraData.telefone || '---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Decorative Separator */}
              <div className="py-8 flex items-center justify-center gap-4 opacity-40">
                <div className="h-[1px] flex-1 bg-stone-300" />
                <div className="flex gap-2 text-[#c9b09a]">
                  <Heart size={14} className="fill-current" />
                  <Heart size={14} className="fill-current" />
                </div>
                <div className="h-[1px] flex-1 bg-stone-300" />
              </div>

              {/* Signature Footer */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-stone-500 italic">Atenciosamente,</p>
                <div className="flex flex-col">
                  <span className="text-3xl font-serif-display font-medium text-[#1a1310] tracking-tight uppercase">Sistema PGR</span>
                  <span className="text-xs text-stone-400 font-medium tracking-wide uppercase">Gestão inteligente de entrada e saída de veículos.</span>
                </div>
              </div>
            </div>

            {/* APP FOOTER (Inside Module) */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1a1310] border-t-2 border-[#3e2516] flex items-center px-8 lg:px-12 justify-between">
               <div className="flex items-center gap-3">
                  <img src="https://i.postimg.cc/Y23w34cv/1www.png" alt="L" className="w-8 h-8 object-contain scale-75 grayscale brightness-200" />
                  <div className="flex flex-col">
                     <h4 className="text-[12px] font-black text-white tracking-widest leading-none">SISTEMA PGR</h4>
                     <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest mt-1">SANTA LUZIA / MG</span>
                  </div>
               </div>
               
               <div className="hidden xl:block">
                  <p className="text-[16px] font-handwritten text-[#d4b791] opacity-60 italic">
                    Paixão que move, qualidade que fica.
                  </p>
               </div>

               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-stone-600 leading-none">© 2026 Sistema PGR</span>
                  <span className="text-[8px] text-stone-700 mt-1 uppercase font-bold tracking-tighter">Todos os direitos reservados.</span>
               </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
