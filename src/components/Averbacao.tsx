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
  Send
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

  const [activeInternalTab, setActiveInternalTab] = useState<'normal' | 'esporadica'>('normal');
  const [esporadicaData, setEsporadicaData] = useState({
    cadastro: 'Cadastro e Consulta vigente;',
    rastreador: 'Veículo monitorado via rastreador de tecnologia OnixSat (Trucks Control);',
    iscas: '2 iscas embarcadas (rodotrem);',
    motoristaFrota: 'Motorista frota da transportadora.'
  });

  const handleEsporadicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEsporadicaData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  useEffect(() => {
    if (parsedRows.length > 0) {
      if (getTotalValueNumber() > 1700000) {
        setActiveInternalTab('esporadica');
      } else {
        setActiveInternalTab('normal');
      }
    }
  }, [parsedRows]);

  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtraData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n');
    const newRows: RawData[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      // Expecting standard column count or similar structure to image.png
      // Data Averb | Origem | Destino | Placa Cav | Placa Carr | NF | Valor NF | Soma | Protocolo
      if (parts.length >= 7) {
        // Simple heuristic: if the first part looks like a date or the headers are NOT there
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

  const getProtocols = () => {
    const protocols = [...new Set(parsedRows.map(r => r.protocolo).filter(p => p !== ''))];
    return protocols;
  };

  const getTotalValue = () => {
    // Search for the first non-empty somaVl from bottom up
    for (let i = parsedRows.length - 1; i >= 0; i--) {
      if (parsedRows[i].somaVl && parsedRows[i].somaVl.trim() !== '') {
        return parsedRows[i].somaVl;
      }
    }
    return 'R$ 0,00';
  };

  const getTotalValueNumber = () => {
    const valString = getTotalValue();
    const clean = valString.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
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
    const protocolsStrText = getProtocols().map(p => `PROTOCOLO: ${p}`).join('\n');
    const protocolsStrHtml = getProtocols().map(p => `<p style="margin: 0; font-weight: bold;">PROTOCOLO: <span style="color: #00008b;">${p}</span></p>`).join('');
    
    let htmlContent = '';
    let textContent = '';

    if (activeInternalTab === 'normal') {
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <p>${greeting}!</p>
          <p>Segue <span style="background-color: #fce783; padding: 0 4px;">averbação</span> realizada via sistema.</p>
          <div style="margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">ROTA: ${getRoute()}</p>
            ${protocolsStrHtml}
            <p style="margin: 0; font-weight: bold;">Valor da Carga: <span style="color: #ff0000;">${getTotalValue()}</span></p>
          </div>
          <p>Segue dados e NF's em anexo.</p>
          <table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 10px; text-align: center; text-transform: uppercase; font-weight: bold;">
            <thead>
              <tr style="background-color: black; color: white;">
                <th style="padding: 8px; border: 1px solid #000;">ORIGEM</th>
                <th style="padding: 8px; border: 1px solid #000;">DESTINO</th>
                <th style="padding: 8px; border: 1px solid #000;">TRANSPORTADORA</th>
                <th style="padding: 8px; border: 1px solid #000;">PLACA CAVALO</th>
                <th style="padding: 8px; border: 1px solid #000;">PLACAS CARRETAS</th>
                <th style="padding: 8px; border: 1px solid #000;">TECNOLOGIA</th>
                <th style="padding: 8px; border: 1px solid #000;">NOME MOTORISTA</th>
                <th style="padding: 8px; border: 1px solid #000;">CPF</th>
                <th style="padding: 8px; border: 1px solid #000;">TELEFONE</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #ffff00;">
                <td style="padding: 10px; border: 1px solid #000;">${parsedRows[0]?.origem || ''}</td>
                <td style="padding: 10px; border: 1px solid #000;">${parsedRows[0]?.destino || ''}</td>
                <td style="padding: 10px; border: 1px solid #000;">${extraData.transportadora}</td>
                <td style="padding: 10px; border: 1px solid #000; background-color: #cccccc;">${parsedRows[0]?.placaCav || ''}</td>
                <td style="padding: 10px; border: 1px solid #000;">${getPlacasCarretas()}</td>
                <td style="padding: 10px; border: 1px solid #000;">${extraData.tecnologia}</td>
                <td style="padding: 10px; border: 1px solid #000;">${extraData.nomeMotorista}</td>
                <td style="padding: 10px; border: 1px solid #000;">${extraData.cpf}</td>
                <td style="padding: 10px; border: 1px solid #000;">${extraData.telefone}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 30px;">Att,</p>
        </div>
      `;

      textContent = `${greeting}!\n\nSegue averbação realizada via sistema.\n\nROTA: ${getRoute()}\n${protocolsStrText}\nValor da Carga: ${getTotalValue()}\n\nSegue dados e NF's em anexo.\n\nAtt,`;
    } else {
      // Esporadica layout
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <p>${greeting}</p>
          <p>Segue solicitação de averbação esporádica e com <span style="color: #c97f7f;">isenção de escolta e com o valor de <span style="background-color: #d9827c; padding: 2px 4px; color: black; font-weight: bold;">${getTotalValue()}</span></span></p>
          
          <div style="margin: 20px 0;">
            <p style="margin: 0;">ROTA: ${getRoute()}</p>
          </div>

          <div style="margin: 20px 0;">
            <p style="margin: 0;">Valor da Carga: ${getTotalValue()}</p>
          </div>

          <div style="margin: 20px 0;">
            <p style="margin: 0;">${esporadicaData.cadastro}</p>
            <p style="margin: 0;">${esporadicaData.rastreador}</p>
            <p style="margin: 0;">${esporadicaData.iscas}</p>
            <p style="margin: 0;">${esporadicaData.motoristaFrota}</p>
            <p style="margin: 0;">Segue dados e NF's em anexo.</p>
          </div>

          <div style="margin: 20px 0;">
            ${protocolsStrHtml.replace(/color: #00008b;/g, 'color: #333; font-weight: normal;')}
          </div>

          <p>Segue dados e NF's em anexo.</p>
        </div>
      `;

      textContent = `${greeting}\n\nSegue solicitação de averbação esporádica e com isenção de escolta e com o valor de ${getTotalValue()}\n\nROTA: ${getRoute()}\n\nValor da Carga: ${getTotalValue()}\n\n${esporadicaData.cadastro}\n${esporadicaData.rastreador}\n${esporadicaData.iscas}\n${esporadicaData.motoristaFrota}\nSegue dados e NF's em anexo.\n\n${protocolsStrText}\n\nSegue dados e NF's em anexo.`;
    }

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

  const renderCodesTable = () => (
    <div className="report-card overflow-hidden">
      <div className="bg-[#4d0c24] p-3 text-center">
        <h3 className="text-white font-bold uppercase tracking-widest text-lg">Averbação</h3>
        <p className="text-[#fce783] text-xs font-bold">FAIRFAX</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-bold uppercase text-center text-xs">
          <thead>
            <tr className="bg-[#002d3d] text-white">
              <th className="border border-zinc-700 p-3 w-1/3">Códigos</th>
              <th className="border border-zinc-700 p-3">Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">1</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Ao Lado Nota Fiscal</td>
            </tr>
            <tr>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">132</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Embalagem Adequada</td>
            </tr>
            <tr>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">9000000982</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Capsula</td>
            </tr>
            <tr>
              <td className="bg-[#bdd7ee] border border-slate-700 p-3 text-red-600">901</td>
              <td className="bg-[#1f384c] border border-slate-700 p-3 text-slate-100">Maquina</td>
            </tr>
            {/* Empty rows to match image style */}
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="h-10">
                <td className="bg-[#bdd7ee] border border-slate-700 p-3"></td>
                <td className="bg-[#1f384c] border border-slate-700 p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {view === 'codes' ? (
        renderCodesTable()
      ) : (
        <>
          {/* Input Area */}
          {parsedRows.length === 0 ? (
        <div className="report-card p-12 flex flex-col items-center justify-center border-dashed border-2 border-border-dark group hover:border-primary/50 transition-all cursor-text" onClick={() => document.getElementById('paste-area')?.focus()}>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Clipboard className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Área de Averbação</h3>
          <p className="text-slate-400 text-sm text-center max-w-md mb-8">
            Cole aqui os dados copiados da sua planilha (conforme IMAGE.PNG). O sistema irá processar e gerar o modelo de e-mail automaticamente.
          </p>
          
          <textarea
            id="paste-area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
            className="w-full h-32 bg-white/5 border border-border-dark rounded-xl p-4 text-xs font-mono text-slate-300 focus:border-primary/50 outline-none resize-none"
            placeholder="Pressione Ctrl+V ou cole os dados da planilha aqui..."
          />
          
          <div className="mt-8 flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-primary" />
              <span>Detecção Automática de Colunas</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              <span>Suporte a Múltiplos Protocolos</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Edit Extra Data */}
          <div className="lg:col-span-1 space-y-6">
            <div className="report-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-white/5 rounded-lg w-full mr-4 p-1">
                  <button
                    onClick={() => setActiveInternalTab('normal')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                      activeInternalTab === 'normal' ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setActiveInternalTab('esporadica')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                      activeInternalTab === 'esporadica' ? "bg-red-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Esporádica
                  </button>
                </div>

                <button onClick={clearData} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              
              {activeInternalTab === 'normal' ? (
                <div className="space-y-4">
                  {Object.entries(extraData).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block font-mono">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleExtraChange}
                        className="w-full bg-white/5 border border-border-dark rounded-xl px-4 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(esporadicaData).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block font-mono">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleEsporadicaChange}
                        className="w-full bg-white/5 border border-red-900/30 focus:border-red-500/50 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border-dark">
                <button 
                  onClick={copyToEmail}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                    copied ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/20",
                    activeInternalTab === 'esporadica' && !copied && "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                  )}
                >
                  {copied ? <Check size={18} /> : <Mail size={18} />}
                  {copied ? 'Copiado para o Email!' : 'Copiar para Email'}
                </button>
              </div>
            </div>

            <div className="report-card p-4 bg-primary/5 border-primary/20">
               <div className="flex items-start gap-4">
                 <div className="p-2 bg-primary/20 rounded-lg text-primary">
                   <HelpCircle size={18} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-white mb-1">Dica de Gestão</p>
                   <p className="text-[10px] text-slate-400 leading-relaxed">
                     Verifique se as placas estão corretas antes de enviar o e-mail.
                     {activeInternalTab === 'esporadica' && <span className="text-red-400 block mt-1">Modo esporádica ativado (cargas &gt; R$ 1.700.000).</span>}
                   </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Result Preview (IMAGE111.PNG style) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="report-card p-8 bg-white text-slate-900 border-none shadow-2xl">
              {activeInternalTab === 'normal' ? (
                <div className="space-y-6 font-sans">
                  <p className="text-sm">{getGreeting()}!</p>
                  <p className="text-sm">Segue <span className="bg-[#fce783] px-1">averbação</span> realizada via sistema.</p>
                  
                  <div className="space-y-1 mt-6">
                    <p className="text-sm font-black">ROTA: {getRoute()}</p>
                    {getProtocols().map((p, i) => (
                      <p key={i} className="text-sm font-black">PROTOCOLO: <span className="text-[#00008b]">{p}</span></p>
                    ))}
                    <p className="text-sm font-black">Valor da Carga: <span className="text-red-600">{getTotalValue()}</span></p>
                  </div>

                  <p className="text-sm mt-6 font-medium">Segue dados e NF's em anexo.</p>

                  <div className="mt-8 overflow-x-auto">
                    <table className="w-full border-collapse text-[10px] uppercase font-bold text-center border-black">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="border border-black p-2">ORIGEM</th>
                          <th className="border border-black p-2">DESTINO</th>
                          <th className="border border-black p-2">TRANSPORTADORA</th>
                          <th className="border border-black p-2">PLACA CAVALO</th>
                          <th className="border border-black p-2">PLACAS CARRETAS</th>
                          <th className="border border-black p-2">TECNOLOGIA</th>
                          <th className="border border-black p-2">NOME MOTORISTA</th>
                          <th className="border border-black p-2">CPF</th>
                          <th className="border border-black p-2">TELEFONE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-[#ffff00]">
                          <td className="border border-black p-3">{parsedRows[0]?.origem}</td>
                          <td className="border border-black p-3">{parsedRows[0]?.destino}</td>
                          <td className="border border-black p-3">{extraData.transportadora}</td>
                          <td className="border border-black p-3 bg-[#cccccc] text-slate-800">{parsedRows[0]?.placaCav}</td>
                          <td className="border border-black p-3">{getPlacasCarretas()}</td>
                          <td className="border border-black p-3">{extraData.tecnologia}</td>
                          <td className="border border-black p-3">{extraData.nomeMotorista}</td>
                          <td className="border border-black p-3">{extraData.cpf}</td>
                          <td className="border border-black p-3">{extraData.telefone}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-12 text-sm">
                    <p>Att,</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 font-sans">
                  <p className="text-sm">{getGreeting()}</p>
                  <p className="text-sm">Segue solicitação de averbação esporádica e com <span className="text-[#c97f7f] font-medium">isenção de escolta e com o valor de <strong className="bg-[#d9827c] px-1 text-black font-bold">{getTotalValue()}</strong></span></p>
                  
                  <div className="space-y-1 mt-6">
                    <p className="text-sm font-medium">ROTA: {getRoute()}</p>
                  </div>

                  <div className="space-y-1 mt-6">
                    <p className="text-sm font-medium">Valor da Carga: {getTotalValue()}</p>
                  </div>

                  <div className="space-y-1 mt-6 text-sm font-medium text-slate-800">
                    <p>{esporadicaData.cadastro}</p>
                    <p>{esporadicaData.rastreador}</p>
                    <p>{esporadicaData.iscas}</p>
                    <p>{esporadicaData.motoristaFrota}</p>
                    <p>Segue dados e NF's em anexo.</p>
                  </div>

                  <div className="space-y-1 mt-6 text-sm font-medium">
                    {getProtocols().map((p, i) => (
                      <p key={i}>PROTOCOLO: {p}</p>
                    ))}
                  </div>

                  <p className="text-sm mt-6 font-medium">Segue dados e NF's em anexo.</p>

                  <div className="mt-12 text-sm">
                    <p>Att,</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <div className="w-2 h-2 justify-center bg-green-500 rounded-full" />
                <span>Visualização Ativa</span>
              </div>
              <button 
                onClick={copyToEmail}
                className={cn(
                  "text-xs font-bold flex items-center gap-2 hover:underline",
                  activeInternalTab === 'esporadica' ? "text-red-600" : "text-primary"
                )}
              >
                <Copy size={14} /> CLIQUE PARA COPIAR CONTEÚDO
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    )}
  </div>
);
}
