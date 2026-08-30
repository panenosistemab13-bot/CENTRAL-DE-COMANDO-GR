import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Mail, 
  Truck, 
  Cpu, 
  User, 
  CreditCard, 
  Phone,
  Trash2,
  LayoutGrid,
  Copy,
  Check,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toAbsoluteUrl } from '../utils/url';
import mockupImg from '../assets/images/averba_o_interface_mockup_1780899726248.png';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
  view: 'generator' | 'codes';
}

const DATA_PATH = 'averbacao_data/default';

const QUICK_CODES = [
  { label: 'Cápsula', value: '9000000982' },
  { label: 'Máquina', value: '000000901' },
  { label: 'Embalagem', value: '132' }
];

export default function Averbacao({ onBack, view }: AverbacaoProps) {
  const [parsedRows, setParsedRows] = useState<RawData[]>([]);
  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: '',
    tecnologia: '',
    nomeMotorista: '',
    cpf: '',
    telefone: ''
  });
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [rawInputText, setRawInputText] = useState('');

  const copyCodeToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error("Erro ao copiar código:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const localSaved = localStorage.getItem('backup_averbacao_data');
      if (localSaved) {
        try {
          const data = JSON.parse(localSaved);
          if (data.parsedRows) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(data.extraData);
        } catch (e) {
          console.error("Local backup parse error:", e);
        }
      }

      try {
        const docRef = doc(db, DATA_PATH);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.parsedRows) setParsedRows(data.parsedRows);
          if (data.extraData) setExtraData(data.extraData);
          localStorage.setItem('backup_averbacao_data', JSON.stringify({
            parsedRows: data.parsedRows || [],
            extraData: data.extraData || {
              transportadora: '',
              tecnologia: '',
              nomeMotorista: '',
              cpf: '',
              telefone: ''
            }
          }));
        }
      } catch (error) {
        console.warn("Firestore offline or inaccessible. Operating with local backup:", error);
      }
    };
    fetchData();
  }, []);

  const saveData = async (rows: RawData[], extra: ExtraData) => {
    setParsedRows(rows);
    setExtraData(extra);
    localStorage.setItem('backup_averbacao_data', JSON.stringify({ parsedRows: rows, extraData: extra }));

    try {
      await setDoc(doc(db, DATA_PATH), { parsedRows: rows, extraData: extra });
    } catch (error) {
      console.warn("Failed to sync with Firestore:", error);
    }
  };

  const handleExtraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExtra = { ...extraData, [e.target.name]: e.target.value };
    await saveData(parsedRows, newExtra);
  };

  const clearData = async () => {
    const emptyRows: RawData[] = [];
    const emptyExtra: ExtraData = {
      transportadora: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    };
    setRawInputText('');
    await saveData(emptyRows, emptyExtra);
  };

  const parseInput = (text: string) => {
    setRawInputText(text);
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
      saveData(newRows, extraData);
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

  const getProtocols = () => {
    const protocols = parsedRows
      .map(r => r.protocolo?.trim())
      .filter(p => !!p);
    return [...new Set(protocols)];
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();
    const protocols = getProtocols();
    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14.5px; color: #000000; line-height: 1.6; padding: 25px 15px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">${greeting}!</p>
        
        <p style="margin: 0 0 25px 0; font-size: 14.5px; color: #000000;">Segue <span style="background-color: #ffff00; font-weight: bold; padding: 1px 3px; border-radius: 2px;">averbação</span> realizada via sistema.</p>
        
        <p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000; text-transform: uppercase;">ROTA: ${getRoute().toUpperCase()}</p>
        ${protocols.length > 0 
          ? protocols.map(p => `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">${p}</span></p>`).join('') 
          : `<p style="margin: 0 0 6px 0; font-size: 14.5px; font-weight: bold; color: #000000;">PROTOCOLO: <span style="color: #0000ff;">---</span></p>`
        }
        <p style="margin: 0 0 25px 0; font-size: 14.5px; font-weight: bold; color: #000000;">Valor da Carga: <span style="color: #ff0000;">${getTotalValue()}</span></p>
        
        <p style="margin: 0 0 15px 0; font-size: 14.5px; color: #000000;">Segue dados e NF's em anexo.</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #000000; font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-align: center; width: 100%; max-width: 900px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff; text-transform: uppercase; font-weight: bold;">
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">ORIGEM</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">DESTINO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TRANSPORTADORA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">PLACA CAVALO</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">PLACAS CARRETAS</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">TECNOLOGIA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 12%;">NOME MOTORISTA</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 11%;">CPF</th>
              <th style="border: 1px solid #000000; padding: 10px 5px; width: 10%;">TELEFONE</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-weight: bold; text-transform: uppercase; color: #000000;">
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.origem || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${parsedRows[0]?.destino || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.transportadora || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #cccccc;">${parsedRows[0]?.placaCav || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${getPlacasCarretas() || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.tecnologia || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.nomeMotorista || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.cpf || '---'}</td>
              <td style="border: 1px solid #000000; padding: 12px 5px; background-color: #ffff00;">${extraData.telefone || '---'}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin: 0; color: #000000; font-size: 14.5px;">Att,</p>
      </div>
    `;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlContent], { type: 'text/html' }) })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard HTML write error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans" style={{ zoom: 0.85 }}>
      {/* Top Header / Quick Codes Bar */}
      <header className="bg-blue-950 border-b border-blue-900 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse inline-block"></span>
            <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-sans flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              CENTRAL DE AVERBAÇÃO E SEGUROS
            </h1>
          </div>
        </div>

        {/* Quick Codes Pill Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase text-blue-200 tracking-wider hidden sm:inline">CÓDIGOS RÁPIDOS:</span>
          {QUICK_CODES.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2 bg-blue-900/60 border border-blue-800 hover:border-blue-600 rounded-xl px-3 py-1.5 transition-all shadow-2xs group"
            >
              <span className="text-[11px] font-bold text-blue-100 uppercase">{item.label}:</span>
              <code className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 tracking-wider">
                {item.value}
              </code>
              <button
                type="button"
                onClick={() => copyCodeToClipboard(item.label, item.value)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border shadow-2xs",
                  copiedCode === item.label
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 border-blue-500 text-white"
                )}
                title={`Copiar ${item.label}`}
              >
                {copiedCode === item.label ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedCode === item.label ? 'OK' : 'COPIAR'}</span>
              </button>
            </div>
          ))}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Panel: Inputs & Data Controls */}
        <aside className="w-full lg:w-[380px] bg-white text-slate-900 p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 shadow-xs relative shrink-0 overflow-y-auto">
          
          <div className="mb-5 bg-blue-50 p-4 rounded-2xl border border-blue-200 text-blue-950 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-blue-600 uppercase block">PAINEL DE CONTROLE</span>
              <h2 className="font-bold text-sm tracking-wide text-blue-950">DADOS DO TRANSPORTE</h2>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-2xs border border-blue-500">
              <Sparkles size={18} />
            </div>
          </div>

          {/* Paste Area for Raw Data */}
          <div className="mb-5 space-y-2">
            <label className="text-[10px] font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard size={12} className="text-blue-600" />
              COLAR DADOS DA PLANILHA (TSV)
            </label>
            <textarea 
              value={rawInputText}
              onChange={(e) => parseInput(e.target.value)}
              placeholder="Cole aqui as linhas copiadas da planilha..."
              className="w-full h-24 p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs resize-none transition-all"
            />
          </div>

          {/* Additional Structured Fields */}
          <div className="space-y-3.5 flex-grow mb-6">
            {[
              { label: 'TRANSPORTADORA', key: 'transportadora', icon: Truck, placeholder: 'Ex: TRANSMAGNA' },
              { label: 'TECNOLOGIA', key: 'tecnologia', icon: Cpu, placeholder: 'Ex: SIGHRA' },
              { label: 'NOME MOTORISTA', key: 'nomeMotorista', icon: User, placeholder: 'Nome Completo' },
              { label: 'CPF', key: 'cpf', icon: CreditCard, placeholder: '000.000.000-00' },
              { label: 'TELEFONE', key: 'telefone', icon: Phone, placeholder: '(00) 00000-0000' }
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[10px] font-extrabold text-blue-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <field.icon size={12} className="text-blue-600" /> {field.label}
                </label>
                <input 
                  name={field.key} 
                  value={(extraData as any)[field.key]} 
                  onChange={handleExtraChange} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all" 
                  placeholder={field.placeholder} 
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button 
              onClick={copyToEmail} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Mail size={16} /> 
              <span>{copied ? 'E-MAIL COPIADO COM SUCESSO!' : 'COPIAR FORMATADO PARA E-MAIL'}</span>
            </button>

            <button 
              onClick={clearData} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all border border-slate-300 cursor-pointer"
            >
              <Trash2 size={13} /> 
              <span>LIMPAR DADOS E REINICIAR</span>
            </button>
          </div>
        </aside>

        {/* Right Panel: Interactive Email Preview Dashboard */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto flex flex-col items-center justify-center bg-slate-100">
          {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center max-w-lg text-center py-12 px-6 bg-white border border-dashed border-slate-300 rounded-3xl shadow-xs">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
                <FileText size={32} />
              </div>
              <h2 className="text-lg font-extrabold text-blue-950 uppercase mb-2 tracking-wide">Nenhum dado importado ainda</h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Cole os dados copiados da planilha no campo à esquerda ou utilize o painel para configurar os dados da carga e gerar a pré-visualização instantânea do e-mail de averbação.
              </p>
              <div className="relative group w-full max-w-xs flex justify-center opacity-80 hover:opacity-100 transition-opacity">
                <img src={toAbsoluteUrl(mockupImg)} alt="Mockup" className="w-64 h-auto rounded-xl shadow-md border border-slate-200" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-sm p-8 lg:p-12 border border-slate-200 relative animate-fade-in">
              
              {/* Preview Header Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    PRÉ-VISUALIZAÇÃO OFICIAL DO E-MAIL
                  </span>
                  <h3 className="font-extrabold text-base text-blue-950 mt-1">FORMATO PRONTO PARA ENVIO</h3>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={copyToEmail} 
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <Clipboard size={14} /> 
                    <span>{copied ? 'COPIADO!' : 'COPIAR E-MAIL'}</span>
                  </button>
                  <button 
                    onClick={clearData} 
                    className="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                    title="Limpar dados"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="space-y-6 text-slate-900 text-sm leading-relaxed font-sans">
                <p className="font-semibold text-base">{getGreeting()}!</p>
                <p>
                  Segue <span className="bg-yellow-300 font-bold px-1.5 py-0.5 rounded text-slate-950 border border-yellow-400">averbação</span> realizada via sistema.
                </p>
                
                <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-2 font-bold text-blue-950 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-800 font-mono">ROTA:</span>
                    <span className="uppercase text-blue-950">{getRoute()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-800 font-mono">PROTOCOLO(S):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getProtocols().length > 0 ? (
                        getProtocols().map(p => (
                          <span key={p} className="text-blue-700 font-mono bg-white px-2 py-0.5 rounded border border-blue-300">{p}</span>
                        ))
                      ) : (
                        <span className="text-blue-600 font-mono">---</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-800 font-mono">VALOR DA CARGA:</span>
                    <span className="text-rose-600 font-mono text-base">{getTotalValue()}</span>
                  </div>
                </div>

                <p>Segue dados e NF's em anexo.</p>

                {/* Email Table Preview */}
                <div className="overflow-x-auto my-6 border border-slate-300 rounded-2xl shadow-2xs">
                  <table className="w-full text-center text-xs border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-blue-950 text-white uppercase font-bold text-[10px] tracking-wider">
                        <th className="p-3.5 border border-blue-900">ORIGEM</th>
                        <th className="p-3.5 border border-blue-900">DESTINO</th>
                        <th className="p-3.5 border border-blue-900">TRANSPORTADORA</th>
                        <th className="p-3.5 border border-blue-900">PLACA CAVALO</th>
                        <th className="p-3.5 border border-blue-900">PLACAS CARRETAS</th>
                        <th className="p-3.5 border border-blue-900">TECNOLOGIA</th>
                        <th className="p-3.5 border border-blue-900">NOME MOTORISTA</th>
                        <th className="p-3.5 border border-blue-900">CPF</th>
                        <th className="p-3.5 border border-blue-900">TELEFONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-slate-900 uppercase divide-x divide-slate-300">
                        <td className="p-4 border border-slate-300 bg-yellow-300">{parsedRows[0]?.origem || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300">{parsedRows[0]?.destino || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300">{extraData.transportadora || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-slate-200 font-mono">{parsedRows[0]?.placaCav || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300 font-mono">{getPlacasCarretas() || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300">{extraData.tecnologia || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300">{extraData.nomeMotorista || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300 font-mono">{extraData.cpf || '---'}</td>
                        <td className="p-4 border border-slate-300 bg-yellow-300 font-mono">{extraData.telefone || '---'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-2 font-medium">Att,</p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
