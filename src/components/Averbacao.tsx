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
    <div className="flex flex-col min-h-screen bg-[#2D1A10] text-stone-100 overflow-hidden font-sans" style={{ zoom: 0.85 }}>
      {/* Top Header / Quick Codes Bar */}
      <header className="bg-[#3A2414] border-b-2 border-[#6B4423] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B32025] animate-pulse inline-block"></span>
            <h1 className="text-sm font-black tracking-wider text-[#E8D4B0] uppercase font-serif flex items-center gap-2">
              <FileText size={16} className="text-[#C7A26A]" />
              CENTRAL DE AVERBAÇÃO E SEGUROS
            </h1>
          </div>
        </div>

        {/* Quick Codes Pill Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-black uppercase text-[#C7A26A] tracking-wider hidden sm:inline">CÓDIGOS RÁPIDOS:</span>
          {QUICK_CODES.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2 bg-[#21120B] border border-[#C7A26A]/30 hover:border-[#C7A26A] rounded-xl px-3 py-1.5 transition-all shadow-inner group"
            >
              <span className="text-[11px] font-black text-[#E8D4B0] uppercase">{item.label}:</span>
              <code className="text-xs font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 tracking-wider">
                {item.value}
              </code>
              <button
                type="button"
                onClick={() => copyCodeToClipboard(item.label, item.value)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border shadow-sm",
                  copiedCode === item.label
                    ? "bg-green-600 border-green-500 text-white"
                    : "bg-[#B32025] hover:bg-[#8c060a] border-[#5a0f12] text-white"
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
        <aside className="w-full lg:w-[380px] bg-[#E8D4B0] text-[#2D1A10] p-6 flex flex-col border-b-8 lg:border-b-0 lg:border-r-8 border-[#6B4423] shadow-2xl relative shrink-0 overflow-y-auto">
          
          <div className="mb-5 bg-[#3A2414] p-4 rounded-2xl border-2 border-[#C7A26A] text-[#F2E4CC] shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#C7A26A] uppercase block">PAINEL DE CONTROLE</span>
              <h2 className="font-bold text-sm tracking-wide text-white">DADOS DO TRANSPORTE</h2>
            </div>
            <div className="w-10 h-10 bg-[#B32025] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-inner border border-white/20">
              <Sparkles size={18} />
            </div>
          </div>

          {/* Paste Area for Raw Data */}
          <div className="mb-5 space-y-2">
            <label className="text-[10px] font-black text-[#6B4423] uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard size={12} />
              COLAR DADOS DA PLANILHA (TSV)
            </label>
            <textarea 
              value={rawInputText}
              onChange={(e) => parseInput(e.target.value)}
              placeholder="Cole aqui as linhas copiadas da planilha..."
              className="w-full h-24 p-3 rounded-xl border-2 border-[#C7A26A] bg-[#FAF3E8] text-xs font-mono font-medium text-[#2D1A10] placeholder-[#6B4423]/50 focus:border-[#B32025] focus:outline-none shadow-inner resize-none transition-all"
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
                <label className="text-[10px] font-black text-[#6B4423] flex items-center gap-1.5 uppercase tracking-wide">
                  <field.icon size={12}/> {field.label}
                </label>
                <input 
                  name={field.key} 
                  value={(extraData as any)[field.key]} 
                  onChange={handleExtraChange} 
                  className="w-full p-2.5 rounded-xl border-2 border-[#C7A26A] bg-[#FAF3E8] text-xs font-bold text-[#2D1A10] placeholder-[#6B4423]/40 focus:border-[#B32025] focus:bg-white focus:outline-none shadow-inner transition-all" 
                  placeholder={field.placeholder} 
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button 
              onClick={copyToEmail} 
              className="w-full bg-[#B32025] hover:bg-[#8c060a] text-white py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg border-b-4 border-[#5a0f12] cursor-pointer"
            >
              <Mail size={16} /> 
              <span>{copied ? 'EMAIL COPIADO COM SUCESSO!' : 'COPIAR FORMATADO PARA EMAIL'}</span>
            </button>

            <button 
              onClick={clearData} 
              className="w-full bg-[#3A2414] hover:bg-[#2D1A10] text-[#E8D4B0] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all border-b-4 border-black/40 cursor-pointer"
            >
              <Trash2 size={13} /> 
              <span>LIMPAR DADOS E REINICIAR</span>
            </button>
          </div>
        </aside>

        {/* Right Panel: Interactive Email Preview Dashboard */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto flex flex-col items-center justify-center bg-[#24140C]">
          {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center max-w-lg text-center py-12 px-6 bg-[#3A2414]/60 border-2 border-dashed border-[#C7A26A]/40 rounded-3xl shadow-2xl backdrop-blur-sm">
              <div className="w-16 h-16 bg-[#B32025]/20 rounded-2xl border-2 border-[#B32025] flex items-center justify-center text-[#B32025] mb-4 shadow-inner">
                <FileText size={32} />
              </div>
              <h2 className="text-lg font-black text-[#E8D4B0] uppercase mb-2 tracking-wide">Nenhum dado importado ainda</h2>
              <p className="text-xs text-stone-300 mb-6 leading-relaxed">
                Cole os dados copiados da planilha no campo à esquerda ou utilize o painel para configurar os dados da carga e gerar a pré-visualização instantânea do e-mail de averbação.
              </p>
              <div className="relative group w-full max-w-xs flex justify-center opacity-80 hover:opacity-100 transition-opacity">
                <img src={toAbsoluteUrl(mockupImg)} alt="Mockup" className="w-64 h-auto rounded-xl shadow-xl border-2 border-[#C7A26A]/30" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-white text-stone-900 rounded-3xl shadow-2xl p-8 lg:p-12 border-2 border-[#C7A26A]/50 relative animate-fade-in">
              
              {/* Preview Header Bar */}
              <div className="flex flex-wrap items-center justify-between border-b-2 border-stone-200 pb-5 mb-8 gap-4">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[#B32025] uppercase bg-[#B32025]/10 px-2.5 py-1 rounded-full border border-[#B32025]/20">
                    PRÉ-VISUALIZAÇÃO OFICIAL DO E-MAIL
                  </span>
                  <h3 className="font-extrabold text-base text-stone-800 mt-1">FORMATO PRONTO PARA ENVIO</h3>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={copyToEmail} 
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Clipboard size={14} /> 
                    <span>{copied ? 'COPIADO!' : 'COPIAR E-MAIL'}</span>
                  </button>
                  <button 
                    onClick={clearData} 
                    className="px-3 py-2.5 bg-stone-100 hover:bg-rose-600 hover:text-white text-stone-600 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer border border-stone-200"
                    title="Limpar dados"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="space-y-6 text-stone-900 text-sm leading-relaxed font-sans">
                <p className="font-semibold text-base">{getGreeting()}!</p>
                <p>
                  Segue <span className="bg-yellow-300 font-bold px-1.5 py-0.5 rounded text-stone-950 border border-yellow-400">averbação</span> realizada via sistema.
                </p>
                
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 font-bold text-stone-950 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-mono">ROTA:</span>
                    <span className="uppercase text-stone-900">{getRoute()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-mono">PROTOCOLO(S):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getProtocols().length > 0 ? (
                        getProtocols().map(p => (
                          <span key={p} className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{p}</span>
                        ))
                      ) : (
                        <span className="text-blue-600 font-mono">---</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-mono">VALOR DA CARGA:</span>
                    <span className="text-rose-600 font-mono text-base">{getTotalValue()}</span>
                  </div>
                </div>

                <p>Segue dados e NF's em anexo.</p>

                {/* Email Table Preview */}
                <div className="overflow-x-auto my-6 border-2 border-stone-900 rounded-2xl shadow-md">
                  <table className="w-full text-center text-xs border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-black text-white uppercase font-black text-[10px] tracking-wider">
                        <th className="p-3.5 border border-stone-800">ORIGEM</th>
                        <th className="p-3.5 border border-stone-800">DESTINO</th>
                        <th className="p-3.5 border border-stone-800">TRANSPORTADORA</th>
                        <th className="p-3.5 border border-stone-800">PLACA CAVALO</th>
                        <th className="p-3.5 border border-stone-800">PLACAS CARRETAS</th>
                        <th className="p-3.5 border border-stone-800">TECNOLOGIA</th>
                        <th className="p-3.5 border border-stone-800">NOME MOTORISTA</th>
                        <th className="p-3.5 border border-stone-800">CPF</th>
                        <th className="p-3.5 border border-stone-800">TELEFONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-extrabold text-black uppercase divide-x divide-stone-900">
                        <td className="p-4 border border-stone-900 bg-yellow-300">{parsedRows[0]?.origem || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300">{parsedRows[0]?.destino || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300">{extraData.transportadora || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-stone-300 font-mono">{parsedRows[0]?.placaCav || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300 font-mono">{getPlacasCarretas() || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300">{extraData.tecnologia || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300">{extraData.nomeMotorista || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300 font-mono">{extraData.cpf || '---'}</td>
                        <td className="p-4 border border-stone-900 bg-yellow-300 font-mono">{extraData.telefone || '---'}</td>
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
