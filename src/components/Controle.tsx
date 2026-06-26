import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Copy, 
  Check, 
  ArrowLeft, 
  User, 
  CreditCard, 
  Phone, 
  Info,
  Sliders,
  Send,
  Sparkles,
  FileText,
  Truck,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

// Vintage Screw component
function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // State for all form fields
  const [saudacao, setSaudacao] = useState('Boa tarde,');
  const [alertaResgate, setAlertaResgate] = useState('Favor se atentar ao resgate!');
  const [infoAbaixo, setInfoAbaixo] = useState('Atentar às informações abaixo:');
  
  // Routes & Warning lines
  const [rota1, setRota1] = useState('SANTA LUZIA/MG x GUARULHOS/SP');
  const [instrucao1, setInstrucao1] = useState('Favor, acusar o recebimento do pré-alerta;');

  // Table information (CCC.PNG layout)
  const [numeroNf, setNumeroNf] = useState('2970815 - 2970843');
  const [transportadora, setTransportadora] = useState('MOEDENSE');
  const [motorista, setMotorista] = useState('GILDEI FERREIRA DA CUNHA');
  const [cavalo, setCavalo] = useState('PWD4E25');
  
  // Row 1 lists (Carreta 1, Isca 1, Produto 1, UMA 1)
  const [carreta1, setCarreta1] = useState('FQC2B85');
  const [carreta2, setCarreta2] = useState('FQG1D53');
  const [isca1, setIsca1] = useState('R100002113');
  const [isca2, setIsca2] = useState('R100002407');
  const [produto1, setProduto1] = useState('12031007');
  const [produto2, setProduto2] = useState('12031007');
  const [uma1, setUma1] = useState('013.490.990.005');
  const [uma2, setUma2] = useState('013.439.400.547');
  
  const [destino, setDestino] = useState('GUARULHOS/SP');
  const [dataEnviada, setDataEnviada] = useState('26-jun.');
  
  // Parametrização and Esquema de Embarque
  const [parametrizacao, setParametrizacao] = useState('Parametrização das iscas');
  const [esquemaEmbarque, setEsquemaEmbarque] = useState('CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA');

  // Sidebar specific inputs (COLUNA.PNG layout)
  const [sidebarTransportadora, setSidebarTransportadora] = useState('3C');
  const [sidebarTecnologia, setSidebarTecnologia] = useState('SASCAR');
  const [sidebarMotorista, setSidebarMotorista] = useState('MARISON REZENDE LEMOS');
  const [sidebarCpf, setSidebarCpf] = useState('');
  const [sidebarTelefone, setSidebarTelefone] = useState('');

  const [copied, setCopied] = useState(false);

  // Sync transportadora and motorista states when either updates, keeping both sections intuitive
  const handleSidebarTranspChange = (val: string) => {
    setSidebarTransportadora(val);
    setTransportadora(val);
  };

  const handleSidebarMotoristaChange = (val: string) => {
    setSidebarMotorista(val);
    setMotorista(val);
  };

  const handleTableTranspChange = (val: string) => {
    setTransportadora(val);
    setSidebarTransportadora(val);
  };

  const handleTableMotoristaChange = (val: string) => {
    setMotorista(val);
    setSidebarMotorista(val);
  };

  // Sync initial values
  useEffect(() => {
    setSidebarTransportadora(transportadora);
    setSidebarMotorista(motorista);
  }, []);

  const handleClear = () => {
    if (window.confirm("Deseja realmente limpar todas as informações do controle?")) {
      setSaudacao('Boa tarde,');
      setAlertaResgate('Favor se atentar ao resgate!');
      setInfoAbaixo('Atentar às informações abaixo:');
      setRota1('SANTA LUZIA/MG x GUARULHOS/SP');
      setInstrucao1('Favor, acusar o recebimento do pré-alerta;');
      setNumeroNf('');
      setTransportadora('');
      setMotorista('');
      setCavalo('');
      setCarreta1('');
      setCarreta2('');
      setIsca1('');
      setIsca2('');
      setProduto1('');
      setProduto2('');
      setUma1('');
      setUma2('');
      setDestino('GUARULHOS/SP');
      setDataEnviada('');
      setParametrizacao('Parametrização das iscas');
      setEsquemaEmbarque('');
      
      setSidebarTransportadora('');
      setSidebarTecnologia('');
      setSidebarMotorista('');
      setSidebarCpf('');
      setSidebarTelefone('');
    }
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    const tableStyle = `
      width: 100%; 
      border-collapse: collapse; 
      font-family: Arial, sans-serif; 
      font-size: 11px; 
      color: #000000;
      border: 1px solid #1a365d;
    `;

    const headerStyle = `
      background-color: #C5DFEC; 
      font-weight: bold; 
      text-align: center; 
      border: 1px solid #1a365d; 
      padding: 6px; 
      text-transform: uppercase;
    `;

    const cellStyle = `
      border: 1px solid #1a365d; 
      padding: 6px; 
      text-align: center;
      vertical-align: middle;
      background-color: #ffffff;
    `;

    const cellLeftStyle = `
      border: 1px solid #1a365d; 
      padding: 6px; 
      text-align: left;
      vertical-align: middle;
      background-color: #ffffff;
    `;

    const titleRowStyle = `
      background-color: #C5DFEC; 
      font-weight: bold; 
      text-align: left; 
      border: 1px solid #1a365d; 
      padding: 6px;
      text-transform: uppercase;
    `;

    // Constructing HTML string
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5; max-width: 1000px; margin: 0 auto; background-color: #ffffff; padding: 15px;">
        <div style="font-size: 14px; font-weight: normal; margin-bottom: 12px; font-family: Arial, sans-serif;">
          ${saudacao}
        </div>
        
        <div style="background-color: #FF0000; color: #FFFFFF; font-weight: bold; padding: 6px 12px; font-size: 13px; margin-bottom: 12px; display: inline-block; width: 100%; box-sizing: border-box; text-transform: uppercase; font-family: Arial, sans-serif;">
          ${alertaResgate}
        </div>

        <div style="font-size: 13px; font-weight: bold; margin-bottom: 12px; font-family: Arial, sans-serif;">
          ${infoAbaixo}
        </div>

        <div style="border: 2px solid #000000; padding: 8px 12px; margin-bottom: 20px; font-size: 12px; font-weight: bold; line-height: 1.6; background-color: #f8fafc; font-family: Arial, sans-serif; display: inline-block; min-width: 320px;">
          · ${rota1}; <br />
          · ${instrucao1}
        </div>

        <table style="${tableStyle}">
          <thead>
            <tr>
              <th colspan="2" style="${titleRowStyle}">NÚMERO DA NF:</th>
              <th colspan="1" style="${cellStyle}"><strong>${numeroNf}</strong></th>
              <th colspan="1" style="${titleRowStyle}">TRANSPORTADORA:</th>
              <th colspan="4" style="${cellStyle}"><strong>${transportadora}</strong></th>
            </tr>
            <tr style="height: 28px;">
              <th style="${headerStyle} width: 20%;">MOTORISTA</th>
              <th style="${headerStyle} width: 10%;">CAVALO</th>
              <th style="${headerStyle} width: 10%;">CARRETAS</th>
              <th style="${headerStyle} width: 12%;">N° ISCAS</th>
              <th style="${headerStyle} width: 14%;">PRODUTO EMBARCADO</th>
              <th style="${headerStyle} width: 16%;">CÓDIGO U.M.A.</th>
              <th style="${headerStyle} width: 10%;">DESTINO</th>
              <th style="${headerStyle} width: 8%;">DATA ENVIADA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" style="${cellStyle} font-weight: bold; text-transform: uppercase;">${motorista}</td>
              <td rowspan="2" style="${cellStyle} font-weight: bold; text-transform: uppercase;">${cavalo}</td>
              <td style="${cellStyle}">${carreta1}</td>
              <td style="${cellStyle}">${isca1}</td>
              <td style="${cellStyle}">${produto1}</td>
              <td style="${cellStyle}">${uma1}</td>
              <td rowspan="2" style="${cellStyle} font-weight: bold; text-transform: uppercase;">${destino}</td>
              <td rowspan="2" style="${cellStyle} font-weight: bold;">${dataEnviada}</td>
            </tr>
            <tr>
              <td style="${cellStyle}">${carreta2}</td>
              <td style="${cellStyle}">${isca2}</td>
              <td style="${cellStyle}">${produto2}</td>
              <td style="${cellStyle}">${uma2}</td>
            </tr>
            <tr>
              <td colspan="8" style="background-color: #C5DFEC; text-align: center; font-weight: bold; border: 1px solid #1a365d; padding: 6px; font-size: 11px; text-transform: uppercase;">
                ${parametrizacao}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 15px; font-family: Arial, sans-serif;">
          <strong style="font-size: 12px; display: block; margin-bottom: 6px; text-transform: uppercase;">ESQUEMA DE EMBARQUE DAS ISCAS:</strong>
          <div style="font-size: 11px; font-family: Courier New, Courier, monospace; background-color: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
            ${esquemaEmbarque || 'NENHUM ESQUEMA PREENCHIDO'}
          </div>
        </div>

        ${(sidebarTecnologia || sidebarCpf || sidebarTelefone) ? `
          <div style="margin-top: 20px; border-top: 1px dashed #cbd5e1; pt: 15px; font-size: 11px; color: #555555; font-family: Arial, sans-serif;">
            <strong style="text-transform: uppercase; display: block; margin-bottom: 4px; color: #333333;">Informações de Apoio:</strong>
            ${sidebarTecnologia ? `• Tecnologia: <strong>${sidebarTecnologia}</strong><br />` : ''}
            ${sidebarCpf ? `• CPF Motorista: <strong>${sidebarCpf}</strong><br />` : ''}
            ${sidebarTelefone ? `• Telefone Motorista: <strong>${sidebarTelefone}</strong><br />` : ''}
          </div>
        ` : ''}
      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${numeroNf} | TRANSPORTADORA: ${transportadora}
-----------------------------------------------------------------------------------------------------------------
MOTORISTA: ${motorista}
CAVALO: ${cavalo}
DESTINO: ${destino}
DATA ENVIADA: ${dataEnviada}
-----------------------------------------------------------------------------------------------------------------
DETALHES DE CARGA & ISCAS:
1. Carreta: ${carreta1} | N° Isca: ${isca1} | Produto: ${produto1} | Cód U.M.A.: ${uma1}
2. Carreta: ${carreta2} | N° Isca: ${isca2} | Produto: ${produto2} | Cód U.M.A.: ${uma2}
-----------------------------------------------------------------------------------------------------------------
${parametrizacao.toUpperCase()}

ESQUEMA DE EMBARQUE DAS ISCAS:
${esquemaEmbarque}

-----------------------------------------------------------------------------------------------------------------
Informações de Apoio:
Tecnologia: ${sidebarTecnologia}
CPF: ${sidebarCpf}
Telefone: ${sidebarTelefone}
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        alert('Falha ao copiar conteúdo. Por favor, selecione e copie manualmente.');
      }
    }
  };

  return (
    <div className="w-full relative z-10 max-w-[96rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch font-sans">
      
      {/* LEFT AREA: Template Generator (col-span-8) */}
      <div className="col-span-1 xl:col-span-8 flex flex-col">
        <div className="flex-1 rounded-3xl bg-[#fdfbf7] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-8">
          
          {/* Decorative brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#e1ccb0] pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#B32025] text-white p-2.5 rounded-2xl shadow-md">
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3e2516] uppercase tracking-tight">Gerador de Controle PGR</h2>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">Gerador idêntico de pré-alerta e iscas</p>
              </div>
            </div>
            {onBack && (
              <button 
                onClick={onBack}
                className="bg-stone-100 hover:bg-stone-200 text-[#5c3e29] border border-stone-300 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Menu
              </button>
            )}
          </div>

          {/* Generator Workspace Form */}
          <div className="flex flex-col gap-6">
            
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF6ED] border border-[#e1ccb0]/80 rounded-2xl p-4 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3e29] shrink-0">Saudação:</label>
              <div className="relative flex-1 max-w-[200px]">
                <select 
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-white border-2 border-[#5c3e29]/35 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#3e2516] focus:border-[#B32025] focus:ring-0 outline-none transition-all cursor-pointer shadow-xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-bold text-[#8c6b4e] uppercase tracking-wider">Define a saudação inicial do pré-alerta</p>
            </div>

            {/* PREVIEW CONTAINER - LOOKS EXACTLY LIKE THE OUTLOOK EMAIL / CCC.PNG */}
            <div className="bg-white border-3 border-stone-800 rounded-2xl p-5 shadow-inner overflow-x-auto">
              <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block mb-4 border-b border-stone-200 pb-1">Visualização do Pré-Alerta (Template Oficial)</span>
              
              <div className="min-w-[800px] font-sans text-xs text-black">
                
                {/* 1. Greeting Select Output */}
                <div className="mb-3 font-semibold text-stone-800 text-sm">
                  {saudacao}
                </div>

                {/* 2. Red Alert Bar */}
                <div className="mb-4 bg-[#FF0000] text-white font-black text-sm uppercase px-4 py-1.5 tracking-wide shadow-xs flex items-center">
                  <input 
                    type="text" 
                    value={alertaResgate} 
                    onChange={(e) => setAlertaResgate(e.target.value)}
                    className="bg-transparent border-none text-white w-full outline-none font-black text-sm uppercase p-0 focus:ring-0" 
                    placeholder="ALERTA"
                  />
                </div>

                {/* 3. Atentar às informações */}
                <div className="mb-3 font-bold text-stone-900">
                  <input 
                    type="text" 
                    value={infoAbaixo} 
                    onChange={(e) => setInfoAbaixo(e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-dashed hover:border-stone-400 focus:border-stone-500 w-full outline-none font-bold py-0.5" 
                  />
                </div>

                {/* 4. Routes and Instructions Selector Box */}
                <div className="border-2 border-black p-3.5 mb-5 font-bold leading-relaxed bg-[#f8fafc] max-w-xl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-800">•</span>
                    <input 
                      type="text" 
                      value={rota1} 
                      onChange={(e) => setRota1(e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-dashed hover:border-stone-400 focus:border-stone-500 w-full outline-none font-bold py-0 text-xs" 
                      placeholder="· SANTA LUZIA/MG x GUARULHOS/SP;"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-stone-800">•</span>
                    <input 
                      type="text" 
                      value={instrucao1} 
                      onChange={(e) => setInstrucao1(e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-dashed hover:border-stone-400 focus:border-stone-500 w-full outline-none font-bold py-0 text-xs" 
                      placeholder="· Favor, acusar o recebimento do pré-alerta;"
                    />
                  </div>
                </div>

                {/* 5. BIG INTERACTIVE SPREADSHEET TABLE */}
                <table className="w-full border-collapse border border-stone-800 text-xs font-sans text-black table-fixed">
                  <thead>
                    
                    {/* Row 1: NF and Transportadora */}
                    <tr className="border border-stone-800">
                      <th colSpan={2} className="bg-[#C5DFEC] border-r border-stone-800 text-left font-black p-2 uppercase text-[11px] align-middle w-[25%]">
                        NÚMERO DA NF:
                      </th>
                      <th colSpan={1} className="border-r border-stone-800 p-1 align-middle w-[15%]">
                        <input 
                          type="text" 
                          value={numeroNf} 
                          onChange={(e) => setNumeroNf(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none focus:ring-0 p-1 text-xs"
                          placeholder="2970815 - 2970843"
                        />
                      </th>
                      <th colSpan={1} className="bg-[#C5DFEC] border-r border-stone-800 text-left font-black p-2 uppercase text-[11px] align-middle w-[18%]">
                        TRANSPORTADORA:
                      </th>
                      <th colSpan={4} className="p-1 align-middle w-[42%]">
                        <input 
                          type="text" 
                          value={transportadora} 
                          onChange={(e) => handleTableTranspChange(e.target.value)}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none focus:ring-0 p-1 text-xs"
                          placeholder="DIGITE A TRANSPORTADORA..."
                        />
                      </th>
                    </tr>

                    {/* Row 2: Standard Columns Headings */}
                    <tr className="border-b border-stone-800 bg-[#C5DFEC] text-center font-black uppercase text-[10px] h-[34px]">
                      <th className="border-r border-stone-800 p-1 align-middle w-[22%]">MOTORISTA</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[11%]">CAVALO</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[11%]">CARRETAS</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[13%]">N° ISCAS</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[14%]">PRODUTO EMBARCADO</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[15%]">CÓDIGO U.M.A.</th>
                      <th className="border-r border-stone-800 p-1 align-middle w-[11%]">DESTINO</th>
                      <th className="p-1 align-middle w-[11%]">DATA ENVIADA</th>
                    </tr>

                  </thead>
                  <tbody>
                    
                    {/* Rows of data - Styled identical to image layout */}
                    <tr className="border-b border-stone-800 text-center text-xs h-[42px] bg-white">
                      
                      {/* Motorista - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-stone-800 p-1.5 font-bold uppercase text-[11px] align-middle">
                        <textarea 
                          value={motorista} 
                          onChange={(e) => handleTableMotoristaChange(e.target.value)}
                          className="w-full h-full min-h-[50px] text-center font-bold uppercase bg-transparent border-none outline-none focus:ring-0 resize-none p-1 text-xs leading-snug"
                          placeholder="NOME MOTORISTA"
                        />
                      </td>

                      {/* Cavalo - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-stone-800 p-1 font-bold uppercase text-[11px] align-middle">
                        <input 
                          type="text" 
                          value={cavalo} 
                          onChange={(e) => setCavalo(e.target.value)}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none focus:ring-0 p-0.5 text-xs"
                          placeholder="PLACA"
                        />
                      </td>

                      {/* Carreta Row 1 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={carreta1} 
                          onChange={(e) => setCarreta1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="CARRETA 1"
                        />
                      </td>

                      {/* N Iscas Row 1 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={isca1} 
                          onChange={(e) => setIsca1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="ISCA 1"
                        />
                      </td>

                      {/* Produto Row 1 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={produto1} 
                          onChange={(e) => setProduto1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="PROD 1"
                        />
                      </td>

                      {/* UMA Row 1 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={uma1} 
                          onChange={(e) => setUma1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="UMA 1"
                        />
                      </td>

                      {/* Destino - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-stone-800 p-1.5 font-bold uppercase text-[11px] align-middle">
                        <input 
                          type="text" 
                          value={destino} 
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full text-center font-bold uppercase bg-transparent border-none outline-none focus:ring-0 p-1 text-xs"
                          placeholder="DESTINO"
                        />
                      </td>

                      {/* Data Enviada - Span rowspan 2 */}
                      <td rowSpan={2} className="p-1.5 font-bold text-stone-700 text-xs align-middle">
                        <input 
                          type="text" 
                          value={dataEnviada} 
                          onChange={(e) => setDataEnviada(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none focus:ring-0 p-1 text-xs"
                          placeholder="DATA"
                        />
                      </td>

                    </tr>
                    
                    {/* Second row of sub-items (Carreta 2, Isca 2, Prod 2, UMA 2) */}
                    <tr className="border-b border-stone-800 text-center text-xs h-[42px] bg-white">
                      
                      {/* Carreta Row 2 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={carreta2} 
                          onChange={(e) => setCarreta2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="CARRETA 2"
                        />
                      </td>

                      {/* Isca Row 2 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={isca2} 
                          onChange={(e) => setIsca2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="ISCA 2"
                        />
                      </td>

                      {/* Produto Row 2 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={produto2} 
                          onChange={(e) => setProduto2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="PROD 2"
                        />
                      </td>

                      {/* UMA Row 2 */}
                      <td className="border-r border-stone-800 p-1 align-middle">
                        <input 
                          type="text" 
                          value={uma2} 
                          onChange={(e) => setUma2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0.5 uppercase font-medium text-xs"
                          placeholder="UMA 2"
                        />
                      </td>

                    </tr>

                    {/* Row 4: Parametrização Section bar */}
                    <tr>
                      <td colSpan={8} className="bg-[#C5DFEC] text-center font-black uppercase text-[11px] p-2 border-t border-stone-800 tracking-wide">
                        <input 
                          type="text" 
                          value={parametrizacao} 
                          onChange={(e) => setParametrizacao(e.target.value)}
                          className="w-full text-center font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-[11px] uppercase"
                        />
                      </td>
                    </tr>

                  </tbody>
                </table>

                {/* Footer text: Esquema de Embarque */}
                <div className="mt-4">
                  <span className="text-xs font-black uppercase tracking-wide block mb-1.5 text-stone-900">ESQUEMA DE EMBARQUE DAS ISCAS:</span>
                  <textarea 
                    value={esquemaEmbarque}
                    onChange={(e) => setEsquemaEmbarque(e.target.value)}
                    rows={3}
                    className="w-full bg-[#f8fafc] border-2 border-stone-200 rounded-xl p-3.5 text-xs font-extrabold text-[#3e2516] uppercase font-mono outline-none focus:border-[#5c3e29] transition-all resize-none shadow-xs leading-relaxed"
                    placeholder="DIGITE O DETALHAMENTO DO ESQUEMA DE EMBARQUE..."
                  />
                </div>

              </div>

            </div>

            {/* Quick action helper card inside main container */}
            <div className="bg-[#FAF6ED] border border-[#e1ccb0] rounded-2xl p-4 flex gap-3 items-start mt-2">
              <Info className="text-[#B32025] shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#5c3e29] uppercase tracking-wide">Dica do Gerador</span>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">Você pode clicar diretamente nos campos da tabela acima para preenchê-los manualmente de forma ágil, ou utilizar a coluna de preenchimento rápido ao lado para carregar dados corporativos específicos.</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR: Fast Fill Column (col-span-4, identical style to COLUNA.PNG) */}
      <div className="col-span-1 xl:col-span-4 flex flex-col">
        <div className="rounded-3xl bg-[#e6d5bf] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-7"
             style={{
               backgroundImage: 'linear-gradient(135deg, #efdfc6 0%, #e2cfb2 100%)',
             }}>
          
          {/* Vintage brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Form Header */}
          <div className="border-b border-[#dac0a3] pb-4 mb-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c6b4e] block">Painel Lateral</span>
            <h3 className="text-base font-serif font-black text-[#3e2516] uppercase tracking-tight mt-0.5 flex items-center gap-2">
              <Sliders size={18} className="text-[#B32025]" /> Formulário de Controle
            </h3>
          </div>

          {/* Form inputs identical to COLUNA.PNG layout */}
          <div className="flex flex-col gap-4">
            
            {/* TRANSPORTADORA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Truck size={12} className="text-[#8c6b4e]" /> TRANSPORTADORA
              </label>
              <input 
                type="text"
                value={sidebarTransportadora}
                onChange={(e) => handleSidebarTranspChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="Ex: 3C"
              />
            </div>

            {/* TECNOLOGIA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Cpu size={12} className="text-[#8c6b4e]" /> TECNOLOGIA
              </label>
              <input 
                type="text"
                value={sidebarTecnologia}
                onChange={(e) => setSidebarTecnologia(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="Ex: SASCAR"
              />
            </div>

            {/* NOME MOTORISTA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <User size={12} className="text-[#8c6b4e]" /> NOME MOTORISTA
              </label>
              <input 
                type="text"
                value={sidebarMotorista}
                onChange={(e) => handleSidebarMotoristaChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="NOME COMPLETO"
              />
            </div>

            {/* CPF input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <CreditCard size={12} className="text-[#8c6b4e]" /> CPF
              </label>
              <input 
                type="text"
                value={sidebarCpf}
                onChange={(e) => setSidebarCpf(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="DIGITE..."
              />
            </div>

            {/* TELEFONE input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Phone size={12} className="text-[#8c6b4e]" /> TELEFONE
              </label>
              <input 
                type="text"
                value={sidebarTelefone}
                onChange={(e) => setSidebarTelefone(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="DIGITE..."
              />
            </div>

            {/* Buttons area (identical to COLUNA.PNG buttons) */}
            <div className="flex flex-col gap-3.5 mt-4">
              
              {/* COPIAR PARA EMAIL BUTTON (Red, elegant) */}
              <button
                onClick={handleCopyToEmail}
                className={cn(
                  "w-full text-white text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-97 cursor-pointer border-2 border-transparent",
                  copied 
                    ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" 
                    : "bg-[#B32025] hover:bg-[#8c060a] hover:border-red-900 shadow-red-500/10"
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3]" /> COPIADO COM SUCESSO!
                  </>
                ) : (
                  <>
                    <Mail size={14} className="stroke-[2.5]" /> COPIAR PARA EMAIL
                  </>
                )}
              </button>

              {/* LIMPAR INFORMAÇÕES BUTTON (Dark brown, styled) */}
              <button
                onClick={handleClear}
                className="w-full bg-[#3e2516] hover:bg-[#2d1a10] text-[#efdfc6] text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md border-2 border-[#5c3e29]/30 transition-all active:scale-97 cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" /> LIMPAR INFORMAÇÕES
              </button>

            </div>

            {/* DICA DE GESTÃO CARD */}
            <div className="bg-[#3c2518] rounded-2xl p-4 border border-[#5c3e29] shadow-inner mt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-1">Dica de Gestão</span>
              <p className="text-[10px] font-semibold text-[#fdefd1]/90 leading-relaxed">
                Verifique os dados cuidadosamente antes de enviar. O pré-alerta gerado deve estar 100% de acordo com a nota fiscal e a ordem de coleta de iscas do pátio para mitigar sinistros.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
