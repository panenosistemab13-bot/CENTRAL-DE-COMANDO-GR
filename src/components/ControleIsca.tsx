import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Cpu, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Save, 
  RefreshCw, 
  ArrowRight, 
  Mail, 
  Printer, 
  Info, 
  Sliders,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { ref, set, onValue } from 'firebase/database';
import { rtdb as db } from '../firebase';

// Helper for vintage screws
function Screw({ className }: { className?: string }) {
  return (
    <div className={`w-3 h-3 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_1.5px_2px_rgba(0,0,0,0.6),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0 ${className}`}>
      <div className="w-1.5 h-[1.2px] bg-[#311b09]/80 rotate-[35deg] rounded-sm" />
    </div>
  );
}

interface IscaRow {
  number: string;
  address: string;
  datePosition: string;
}

interface PocketState {
  [key: string]: boolean; // "rack_col_row" -> true if contains "P"
}

interface ControleData {
  headerTitle: string;
  senderName: string;
  senderEmail: string;
  recipients: string;
  warningText: string;
  routeOriginDest: string;
  nfNumber: string;
  carrier: string;
  motorista: string;
  cavalo: string;
  carretas: string;
  iscas: string;
  produtoEmbarcado: string;
  codigoUMA: string;
  destino: string;
  dataEnviada: string;
  iscasParams: IscaRow[];
  pocketStates: PocketState;
}

export default function ControleIsca() {
  const [data, setData] = useState<ControleData>({
    headerTitle: 'PRÉ-ALERTA DE ISCA - BRASÍLIA - TYQ-6F51',
    senderName: 'JEFFERSON AUGUSTO PINTO',
    senderEmail: 'jeffersonpinto@2careicars.com.br',
    recipients: 'LUHAN, DECIO, ULSSSIS, LUDES, VANDERSON, Antorsn, Sabrina, RAFAEL, Carlos, LOGISTICA, GIISANTALUITA, grupopr',
    warningText: 'Favor se atentar ao resgate!',
    routeOriginDest: 'SANTA LUZIA/MG x BRA SÍLIA/DF',
    nfNumber: '2570040 - 2569966',
    carrier: '3C',
    motorista: 'ALAN HENRIQUE ALVES MACIEL DOS SANTOS',
    cavalo: 'TYQ-6F51',
    carretas: 'POG6685\nPOG8545',
    iscas: 'R100002428\nR100000564',
    produtoEmbarcado: '12031007\n12031007',
    codigoUMA: '013.436.400.221\n013.499.400.112',
    destino: 'BRA SÍLIA/DF',
    dataEnviada: '25-jun.',
    iscasParams: [
      {
        number: 'R100000564',
        address: 'r Oito - Santa Luzia - Mg - Brazil - 1 A 216 - santa Luzia - MG',
        datePosition: '25/06/2026 03:01:33'
      },
      {
        number: 'R100002428',
        address: 'rua vinte e seis - 153 - sao benedito - santa luzia - mg - 33170-590 - brasil',
        datePosition: '25/06/2026 03:23:56'
      }
    ],
    pocketStates: {
      '0_0_0': true, // first rack top-left has 'P'
      '1_0_0': true  // second rack top-left has 'P'
    }
  });

  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Load from RTDB on Mount
  useEffect(() => {
    const controleRef = ref(db, 'patio/controle_iscas');
    const unsubscribe = onValue(controleRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Merge with initial defaults in case keys are missing
        setData(prev => ({
          ...prev,
          ...val,
          iscasParams: val.iscasParams || prev.iscasParams,
          pocketStates: val.pocketStates || prev.pocketStates
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      await set(ref(db, 'patio/controle_iscas'), data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erro ao salvar controle de iscas:', err);
    }
  };

  const handleInputChange = (field: keyof ControleData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIscaParamChange = (index: number, field: keyof IscaRow, value: string) => {
    const updated = [...data.iscasParams];
    updated[index] = { ...updated[index], [field]: value };
    handleInputChange('iscasParams', updated);
  };

  const addIscaParamRow = () => {
    handleInputChange('iscasParams', [
      ...data.iscasParams,
      { number: '', address: '', datePosition: '' }
    ]);
  };

  const removeIscaParamRow = (index: number) => {
    const updated = data.iscasParams.filter((_, i) => i !== index);
    handleInputChange('iscasParams', updated);
  };

  // Auto import from latest active Iscas or Disponibilidade pasted data
  const handleImportFromPatio = () => {
    // Attempt to query Firebase data for patio/veiculos to import
    const patioRef = ref(db, 'patio/veiculos');
    onValue(patioRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const items = Object.values(val) as any[];
        if (items.length > 0) {
          // Take the latest one or a sample to pre-fill
          const item = items[items.length - 1];
          handleInputChange('cavalo', item.cavalo || '');
          handleInputChange('carretas', item.carreta || '');
          handleInputChange('destino', item.destino || '');
          handleInputChange('motorista', item.motorista || 'ALAN HENRIQUE ALVES MACIEL DOS SANTOS');
          
          // Show a status warning
          alert('Informações de veículo importadas com sucesso do Pátio!');
        } else {
          alert('Nenhum veículo encontrado no Pátio para importar.');
        }
      } else {
        alert('Nenhum dado disponível para importação automática.');
      }
    }, { onlyOnce: true });
  };

  const togglePocket = (rackIndex: number, col: number, row: number) => {
    const key = `${rackIndex}_${col}_${row}`;
    const updated = { ...data.pocketStates };
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    handleInputChange('pocketStates', updated);
  };

  // Copy structured Email body as rich text/HTML to clipboard
  const handleCopyToClipboard = async () => {
    // Generate identical HTML for email
    const carretasFormatted = data.carretas.split('\n').join('<br />');
    const iscasFormatted = data.iscas.split('\n').join('<br />');
    const produtoFormatted = data.produtoEmbarcado.split('\n').join('<br />');
    const codigoFormatted = data.codigoUMA.split('\n').join('<br />');

    const htmlContent = `
      <div style="background-color: #fcf8f2; font-family: Calibri, Arial, sans-serif; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #ddd;">
        <h2 style="font-family: serif; color: #1a0a07; border-bottom: 2px solid #5c3c24; pb: 5px; margin-bottom: 5px;">${data.headerTitle}</h2>
        <p style="font-size: 11px; color: #666; margin: 0 0 15px 0;">
          <strong>De:</strong> ${data.senderName} &lt;${data.senderEmail}&gt;<br/>
          <strong>Para:</strong> ${data.recipients}
        </p>
        <p style="font-size: 14px; margin-bottom: 15px;">Bom dia,</p>
        
        <div style="background-color: #B32025; color: white; padding: 10px 15px; font-weight: bold; font-size: 14px; border-radius: 4px; margin-bottom: 15px;">
          ${data.warningText}
        </div>
        
        <p style="font-size: 13px; font-weight: bold; margin-bottom: 15px;">
          Atentar as informações abaixo:<br/>
          • ${data.routeOriginDest};<br/>
          • Favor, acusar o recebimento do pre-alerta:
        </p>

        <table style="border-collapse: collapse; width: 100%; border: 1px solid #bfa27a; font-size: 12px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f7edd8; color: #3e2516;">
              <th colspan="8" style="border: 1px solid #bfa27a; padding: 8px; text-align: center; font-weight: bold; text-transform: uppercase;">PRÉ - ALERTA DE ISCA EMBARCADA</th>
            </tr>
            <tr style="background-color: #FAF6ED; color: #3e2516;">
              <th colspan="2" style="border: 1px solid #bfa27a; padding: 6px; font-weight: bold;">NÚMERO DA NF:</th>
              <td colspan="2" style="border: 1px solid #bfa27a; padding: 6px; text-align: center;">${data.nfNumber}</td>
              <th colspan="2" style="border: 1px solid #bfa27a; padding: 6px; font-weight: bold;">TRANSPORTADORA:</th>
              <td colspan="2" style="border: 1px solid #bfa27a; padding: 6px; text-align: center;">${data.carrier}</td>
            </tr>
            <tr style="background-color: #fbf4e9; color: #3e2516; font-weight: bold; text-align: center;">
              <th style="border: 1px solid #bfa27a; padding: 6px;">MOTORISTA</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">CAVALO</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">CARRETAS</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">Nº ISCAS</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">PRODUTO EMBARCADO</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">CÓDIGO U.M.A.</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">DESTINO</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">DATA ENVIADA</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #ffffff; text-align: center;">
              <td style="border: 1px solid #bfa27a; padding: 8px; font-weight: bold;">${data.motorista}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-weight: bold; font-family: monospace;">${data.cavalo}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-family: monospace;">${carretasFormatted}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-family: monospace; color: #8c060a;">${iscasFormatted}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-family: monospace;">${produtoFormatted}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-family: monospace;">${codigoFormatted}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px; font-weight: bold;">${data.destino}</td>
              <td style="border: 1px solid #bfa27a; padding: 8px;">${data.dataEnviada}</td>
            </tr>
          </tbody>
        </table>

        <div style="background-color: #2b1a16; color: #eddabf; font-weight: bold; padding: 8px 12px; font-size: 13px; margin-top: 20px; text-align: center;">
          Parametrização das Iscas
        </div>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #bfa27a; font-size: 12px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #FAF6ED; color: #3e2516; font-weight: bold; text-align: left;">
              <th style="border: 1px solid #bfa27a; padding: 6px; width: 150px; text-align: center;">Nº Isca</th>
              <th style="border: 1px solid #bfa27a; padding: 6px;">Endereço aproximado da posição</th>
              <th style="border: 1px solid #bfa27a; padding: 6px; width: 180px; text-align: center;">Data Posição</th>
            </tr>
          </thead>
          <tbody>
            ${data.iscasParams.map(isca => `
              <tr style="background-color: #ffffff;">
                <td style="border: 1px solid #bfa27a; padding: 6px; font-weight: bold; text-align: center; font-family: monospace;">${isca.number}</td>
                <td style="border: 1px solid #bfa27a; padding: 6px; font-size: 11px;">${isca.address}</td>
                <td style="border: 1px solid #bfa27a; padding: 6px; text-align: center; font-family: monospace; font-size: 11px;">${isca.datePosition}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlContent], { type: typeHtml });
      const blobText = new Blob([`PRÉ-ALERTA DE ISCA: ${data.headerTitle}\nMotorista: ${data.motorista}\nCavalo: ${data.cavalo}`], { type: typeText });
      const clipboardData = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(clipboardData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      await navigator.clipboard.writeText(`PRÉ-ALERTA DE ISCA: ${data.headerTitle}\n\nMotorista: ${data.motorista}\nCavalo: ${data.cavalo}\nDestino: ${data.destino}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generatePlaintextBody = () => {
    return `Bom dia,

${data.warningText || 'Favor se atentar ao resgate!'}

Atentar as informações abaixo:
• ${data.routeOriginDest || 'SANTA LUZIA/MG x BRASÍLIA/DF'};
• Favor, acusar o recebimento do pre-alerta:

=======================================================
            PRÉ-ALERTA DE ISCA EMBARCADA
=======================================================
NÚMERO DA NF:    ${data.nfNumber}
TRANSPORTADORA:  ${data.carrier}
-------------------------------------------------------
MOTORISTA:       ${data.motorista}
CAVALO:          ${data.cavalo}
CARRETAS:
${data.carretas}
-------------------------------------------------------
Nº ISCAS:
${data.iscas}
-------------------------------------------------------
PRODUTO EMBAR.:
${data.produtoEmbarcado}
-------------------------------------------------------
CÓDIGO U.M.A.:
${data.codigoUMA}
-------------------------------------------------------
DESTINO:         ${data.destino}
DATA ENVIADA:    ${data.dataEnviada}

=======================================================
               PARAMETRIZAÇÃO DAS ISCAS
=======================================================
${data.iscasParams.map((row, i) => `${i + 1}. Isca: ${row.number}\n   Posição: ${row.address}\n   Data: ${row.datePosition}`).join('\n\n')}

Atenciosamente,
${data.senderName}`;
  };

  const handleCopyPlaintext = async () => {
    const text = generatePlaintextBody();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(data.headerTitle);
    const bodyText = generatePlaintextBody();
    const mailtoUrl = `mailto:${encodeURIComponent(data.recipients)}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
  };

  const renderRackGrid = (rackIndex: number) => {
    const rows = 12;
    const cols = 2;
    const cells = [];

    for (let r = 0; r < rows; r++) {
      const rowCells = [];
      for (let c = 0; c < cols; c++) {
        const key = `${rackIndex}_${c}_${r}`;
        const hasP = data.pocketStates[key];
        rowCells.push(
          <div 
            key={c}
            onClick={() => togglePocket(rackIndex, c, r)}
            className={`w-6 h-6 border border-[#a28670] flex items-center justify-center font-black text-xs cursor-pointer select-none transition-all
              ${hasP 
                ? 'bg-[#8c060a] text-[#fdefd1] shadow-inner scale-95' 
                : 'bg-[#faf6ed] text-transparent hover:bg-[#ebd9c3]/50'
              }`}
          >
            {hasP ? 'P' : ''}
          </div>
        );
      }
      cells.push(
        <div key={r} className="flex gap-0.5">
          {rowCells}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5 border-2 border-[#5c3c24] p-1 bg-[#eddaba]/40 rounded-sm">
        <div className="text-[7.5px] font-black text-center text-[#5c3c24]/90 tracking-wide font-sans mb-1 leading-none">
          {data.cavalo || 'TYQ-6F51'}
        </div>
        <div className="bg-[#442a17] text-white text-[7px] font-black text-center py-0.5 mb-1 select-none">
          CAVALO
        </div>
        <div className="flex flex-col gap-0.5">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative z-10 max-w-[94rem] mx-auto flex flex-col gap-6">
      
      {/* Tab Switcher & Action Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#f7edd8]/60 p-3.5 border-2 border-[#5c3c24]/30 rounded-2xl gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="bg-[#B32025] text-white p-2 rounded-xl">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#311f14] uppercase tracking-widest font-serif">SC Controle de Isca (Pré-Alerta)</h2>
            <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Preenchimento Manual & Geração de Formulário de Alerta de Isca</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Editor/Preview Mode Toggle */}
          <div className="flex bg-[#ebd9c3] p-1 border border-[#5c3c24]/20 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer
                ${activeTab === 'editor' 
                  ? 'bg-[#5c3c24] text-[#fdefd1] shadow-sm' 
                  : 'text-[#5c3c24] hover:bg-[#ebd9c3]/50'
                }`}
            >
              <Sliders size={11} className="inline mr-1" /> Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer
                ${activeTab === 'preview' 
                  ? 'bg-[#5c3c24] text-[#fdefd1] shadow-sm' 
                  : 'text-[#5c3c24] hover:bg-[#ebd9c3]/50'
                }`}
            >
              <Mail size={11} className="inline mr-1" /> Pré-visualizar
            </button>
          </div>

          <button
            onClick={handleImportFromPatio}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 py-2 px-3 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Importar placa e destino do último registro do Pátio automaticamente"
          >
            <RefreshCw size={11} /> Importar Pátio
          </button>

          <button
            onClick={handleSave}
            className="bg-[#5c3c24] hover:bg-[#311f14] text-[#fdefd1] py-2 px-3.5 text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            {saved ? <Check size={11} /> : <Save size={11} />}
            <span>{saved ? 'Salvo!' : 'Salvar dados'}</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="bg-[#B32025] hover:bg-[#8c060a] text-white py-2 px-3.5 text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Copiar em formato HTML para colar diretamente no Outlook ou Gmail com as tabelas coloridas e racks visualmente montados"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? 'Copiar HTML' : 'Copiar HTML'}</span>
          </button>

          <button
            onClick={handleCopyPlaintext}
            className="bg-amber-800 hover:bg-amber-900 text-white py-2 px-3.5 text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Copiar o conteúdo em texto limpo formatado"
          >
            {copiedText ? <Check size={11} /> : <FileText size={11} />}
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handleOpenMailClient}
            className="bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3.5 text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Abrir seu aplicativo de e-mail padrão (Outlook, Gmail) com destinatários, assunto e corpo já preenchidos"
          >
            <Mail size={11} />
            <span>Enviar E-mail</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'editor' ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Editor Fields Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Plaque 1: Meta & Header details */}
              <div className="bg-[#fcf8f2] border-2 border-[#5c3c24] rounded-2xl p-5 shadow-md text-left flex flex-col gap-4 relative">
                <Screw className="absolute -top-1.5 -left-1.5" />
                <Screw className="absolute -top-1.5 -right-1.5" />
                <Screw className="absolute -bottom-1.5 -left-1.5" />
                <Screw className="absolute -bottom-1.5 -right-1.5" />

                <div className="flex items-center gap-2 pb-2 border-b border-[#e1ccb0]">
                  <Mail size={16} className="text-[#B32025]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#3e2516]">Cabeçalho do E-mail & Alertas</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Título Principal:</label>
                    <input 
                      type="text" 
                      value={data.headerTitle}
                      onChange={(e) => handleInputChange('headerTitle', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Remetente:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Nome"
                        value={data.senderName}
                        onChange={(e) => handleInputChange('senderName', e.target.value)}
                        className="bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                      />
                      <input 
                        type="email" 
                        placeholder="E-mail"
                        value={data.senderEmail}
                        onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                        className="bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Destinatários (Para):</label>
                  <input 
                    type="text" 
                    value={data.recipients}
                    onChange={(e) => handleInputChange('recipients', e.target.value)}
                    className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Texto em Destaque (Faixa Vermelha):</label>
                    <input 
                      type="text" 
                      value={data.warningText}
                      onChange={(e) => handleInputChange('warningText', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-black text-[#B32025] uppercase outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Origem x Destino:</label>
                    <input 
                      type="text" 
                      value={data.routeOriginDest}
                      onChange={(e) => handleInputChange('routeOriginDest', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                </div>
              </div>

              {/* Plaque 2: Main Grid Details */}
              <div className="bg-[#fcf8f2] border-2 border-[#5c3c24] rounded-2xl p-5 shadow-md text-left flex flex-col gap-4 relative">
                <Screw className="absolute -top-1.5 -left-1.5" />
                <Screw className="absolute -top-1.5 -right-1.5" />
                <Screw className="absolute -bottom-1.5 -left-1.5" />
                <Screw className="absolute -bottom-1.5 -right-1.5" />

                <div className="flex items-center justify-between pb-2 border-b border-[#e1ccb0]">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#B32025]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#3e2516]">Tabela Pré-Alerta Embarcada</span>
                  </div>
                  <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-300 rounded px-1.5 py-0.5 font-mono">EDITAR CAMPOS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Número da NF:</label>
                    <input 
                      type="text" 
                      value={data.nfNumber}
                      onChange={(e) => handleInputChange('nfNumber', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Transportadora:</label>
                    <input 
                      type="text" 
                      value={data.carrier}
                      onChange={(e) => handleInputChange('carrier', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Data Enviada:</label>
                    <input 
                      type="text" 
                      value={data.dataEnviada}
                      onChange={(e) => handleInputChange('dataEnviada', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Motorista:</label>
                    <input 
                      type="text" 
                      value={data.motorista}
                      onChange={(e) => handleInputChange('motorista', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Placa Cavalo:</label>
                    <input 
                      type="text" 
                      value={data.cavalo}
                      onChange={(e) => handleInputChange('cavalo', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025] uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Placas Carretas (uma por linha):</label>
                    <textarea 
                      rows={3}
                      value={data.carretas}
                      onChange={(e) => handleInputChange('carretas', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold font-mono text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Nº das Iscas (uma por linha):</label>
                    <textarea 
                      rows={3}
                      value={data.iscas}
                      onChange={(e) => handleInputChange('iscas', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold font-mono text-[#8c060a] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Produto Embarcado (um por linha):</label>
                    <textarea 
                      rows={3}
                      value={data.produtoEmbarcado}
                      onChange={(e) => handleInputChange('produtoEmbarcado', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold font-mono text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Código U.M.A. (um por linha):</label>
                    <textarea 
                      rows={3}
                      value={data.codigoUMA}
                      onChange={(e) => handleInputChange('codigoUMA', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold font-mono text-[#3e2516] outline-none focus:border-[#B32025]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3c24]">Destino Final:</label>
                    <input 
                      type="text" 
                      value={data.destino}
                      onChange={(e) => handleInputChange('destino', e.target.value)}
                      className="w-full bg-white border border-[#be938a] rounded-lg px-3 py-2 text-xs font-bold text-[#3e2516] outline-none focus:border-[#B32025] uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Plaque 3: Parametrização das Iscas */}
              <div className="bg-[#fcf8f2] border-2 border-[#5c3c24] rounded-2xl p-5 shadow-md text-left flex flex-col gap-4 relative">
                <Screw className="absolute -top-1.5 -left-1.5" />
                <Screw className="absolute -top-1.5 -right-1.5" />
                <Screw className="absolute -bottom-1.5 -left-1.5" />
                <Screw className="absolute -bottom-1.5 -right-1.5" />

                <div className="flex items-center justify-between pb-2 border-b border-[#e1ccb0]">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#B32025]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#3e2516]">Parametrização de Posições das Iscas</span>
                  </div>
                  <button
                    onClick={addIscaParamRow}
                    className="bg-[#5c3c24] hover:bg-[#311f14] text-white text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus size={10} /> Adicionar Isca
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {data.iscasParams.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center border border-[#e1ccb0]/50 p-3 rounded-xl bg-white/70">
                      <div className="md:col-span-3 flex flex-col gap-1">
                        <label className="text-[8px] font-black uppercase tracking-wider text-stone-500">Nº Isca:</label>
                        <input 
                          type="text" 
                          value={row.number}
                          onChange={(e) => handleIscaParamChange(idx, 'number', e.target.value)}
                          className="w-full bg-white border border-[#be938a] rounded-md px-2.5 py-1.5 text-xs font-bold font-mono text-stone-800 outline-none focus:border-[#B32025]"
                          placeholder="Ex: R100000564"
                        />
                      </div>
                      <div className="md:col-span-5 flex flex-col gap-1">
                        <label className="text-[8px] font-black uppercase tracking-wider text-stone-500">Endereço de Posição:</label>
                        <input 
                          type="text" 
                          value={row.address}
                          onChange={(e) => handleIscaParamChange(idx, 'address', e.target.value)}
                          className="w-full bg-white border border-[#be938a] rounded-md px-2.5 py-1.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#B32025]"
                          placeholder="Ex: rua vinte e seis - 153..."
                        />
                      </div>
                      <div className="md:col-span-3 flex flex-col gap-1">
                        <label className="text-[8px] font-black uppercase tracking-wider text-stone-500">Data & Hora Posição:</label>
                        <input 
                          type="text" 
                          value={row.datePosition}
                          onChange={(e) => handleIscaParamChange(idx, 'datePosition', e.target.value)}
                          className="w-full bg-white border border-[#be938a] rounded-md px-2.5 py-1.5 text-xs font-bold font-mono text-stone-800 outline-none focus:border-[#B32025]"
                          placeholder="Ex: 25/06/2026 03:00"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
                        <button
                          onClick={() => removeIscaParamRow(idx)}
                          className="text-stone-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Excluir isca"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {data.iscasParams.length === 0 && (
                    <div className="text-center py-6 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                      Nenhuma isca parametrizada no momento.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Pockets Layout Column Right */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#fcf8f2] border-2 border-[#5c3c24] rounded-2xl p-5 shadow-md text-left flex flex-col gap-4 relative h-full">
                <Screw className="absolute -top-1.5 -left-1.5" />
                <Screw className="absolute -top-1.5 -right-1.5" />
                <Screw className="absolute -bottom-1.5 -left-1.5" />
                <Screw className="absolute -bottom-1.5 -right-1.5" />

                <div className="flex items-center gap-2 pb-2 border-b border-[#e1ccb0]">
                  <Cpu size={16} className="text-[#B32025]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#3e2516]">Esquema de Embarque (Rack)</span>
                </div>

                <p className="text-[10px] text-stone-600 leading-relaxed font-semibold">
                  Clique nas caixas abaixo para posicionar as iscas. A caixa destacada com "P" representa as iscas instaladas nos bolsos de embarque físico.
                </p>

                <div className="flex flex-wrap gap-8 justify-center py-4">
                  {/* Rack 1 */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-500 uppercase mb-1">Rack 1</span>
                    {renderRackGrid(0)}
                  </div>

                  {/* Rack 2 */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-stone-500 uppercase mb-1">Rack 2</span>
                    {renderRackGrid(1)}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mt-auto flex gap-2">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-amber-800 leading-normal font-semibold">
                    * Esse esquema visual "Esquema de Embarque das Iscas" será impresso em escala exata idêntica à do e-mail de pré-alerta oficial anexado.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Email Canvas Window exactly replicating the image layout */}
            <div className="w-full max-w-[850px] bg-[#f2ebd9] border-4 border-[#311f14] rounded-3xl p-6 sm:p-10 shadow-2xl relative text-left select-all">
              {/* Retro metal hardware ornaments */}
              <Screw className="absolute top-4 left-4 w-4 h-4" />
              <Screw className="absolute top-4 right-4 w-4 h-4" />
              <Screw className="absolute bottom-4 left-4 w-4 h-4" />
              <Screw className="absolute bottom-4 right-4 w-4 h-4" />

              {/* Title & Header Bar simulating email application tab */}
              <div className="flex flex-wrap items-center justify-between border-b-2 border-[#5c3e29] pb-4 mb-4 select-none">
                <div className="flex items-center gap-3">
                  <h1 className="text-sm sm:text-base font-black text-[#1a0a07] font-sans tracking-tight uppercase flex items-center gap-2">
                    {data.headerTitle}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 bg-[#5c3e29] text-[#efdfc6] text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-[#3e2516] shrink-0">
                    SC CONTROLE DE ISCA <span className="text-[6px] opacity-75">✕</span>
                  </span>
                </div>
              </div>

              {/* Profile Bar */}
              <div className="flex items-start gap-3 border-b border-[#e1ccb0] pb-3.5 mb-4 font-sans">
                {/* Profile Avatar Placeholder */}
                <div className="w-9 h-9 rounded-full bg-stone-200 border-2 border-stone-400 overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone-600">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-black text-[#1a0a07] leading-none mb-1">
                    {data.senderName} <span className="text-stone-500 font-normal font-mono">&lt;{data.senderEmail}&gt;</span>
                  </p>
                  <p className="text-[9px] text-[#5c3c24] font-bold leading-tight font-sans">
                    para <span className="text-[#3e2516] font-extrabold">{data.recipients}</span>
                  </p>
                </div>
              </div>

              {/* Greetings */}
              <p className="text-sm italic font-serif text-[#1a0a07] font-semibold mb-3">
                Bom dia,
              </p>

              {/* Ribbon Banner */}
              <div className="bg-[#B32025] border-2 border-[#8c060a] text-[#ffffff] font-extrabold text-[12px] uppercase tracking-[0.1em] py-2 px-5 rounded-md shadow-sm mb-4 inline-block transform -skew-x-6">
                {data.warningText || 'Favor se atentar ao resgate!'}
              </div>

              {/* Instructions */}
              <div className="text-[12px] text-[#3e2516] font-bold font-sans space-y-1 mb-5">
                <p>Atentar as informações abaixo:</p>
                <div className="pl-4 space-y-1">
                  <p>• {data.routeOriginDest};</p>
                  <p>• Favor, acusar o recebimento do pre-alerte:</p>
                </div>
              </div>

              {/* PRE-ALERTA TABLE */}
              <div className="overflow-x-auto border-2 border-[#5c3e29] rounded-xl shadow-md mb-6 bg-white">
                <table className="w-full text-left border-collapse font-sans text-[11px] min-w-[650px]">
                  <thead>
                    <tr className="bg-[#edd6b7] border-b-2 border-[#5c3e29]">
                      <th colSpan={8} className="px-4 py-2.5 text-center text-xs font-black text-[#3e2516] uppercase tracking-widest font-serif">
                        PRÉ - ALERTA DE ISCA EMBARCADA
                      </th>
                    </tr>
                    <tr className="bg-[#faf6ed] border-b border-[#e1ccb0] font-bold">
                      <th colSpan={2} className="px-3 py-2 text-right text-stone-500 uppercase tracking-wider border-r border-[#e1ccb0]">NÚMERO DA NF:</th>
                      <td colSpan={2} className="px-3 py-2 text-left font-extrabold font-mono text-stone-800 border-r border-[#e1ccb0]">{data.nfNumber}</td>
                      <th colSpan={2} className="px-3 py-2 text-right text-stone-500 uppercase tracking-wider border-r border-[#e1ccb0]">TRANSPORTADORA:</th>
                      <td colSpan={2} className="px-3 py-2 text-left font-extrabold text-stone-800">{data.carrier}</td>
                    </tr>
                    <tr className="bg-[#f2dfc7] border-b border-[#5c3e29] text-center font-black uppercase text-[10px] tracking-wider text-[#3e2516]">
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">MOTORISTA</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">CAVALO</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">CARRETAS</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">Nº ISCAS</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">PRODUTO EMBARCADO</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">CÓDIGO U.M.A.</th>
                      <th className="px-3 py-2.5 border-r border-[#5c3e29]">DESTINO</th>
                      <th className="px-3 py-2.5">DATA ENVIADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center font-bold text-stone-800 bg-white leading-normal divide-x divide-[#e1ccb0]">
                      {/* Driver */}
                      <td className="px-4 py-3.5 font-extrabold text-[#3e2516] text-[10px] uppercase text-left max-w-[160px] break-words">
                        {data.motorista}
                      </td>
                      {/* Cavalo */}
                      <td className="px-3 py-3.5 font-black font-mono text-[11px] tracking-wide uppercase">
                        {data.cavalo}
                      </td>
                      {/* Carretas */}
                      <td className="px-3 py-3.5 font-mono text-[10.5px] leading-relaxed text-stone-600 whitespace-pre-line text-center">
                        {data.carretas}
                      </td>
                      {/* Nº Iscas */}
                      <td className="px-3 py-3.5 font-black font-mono text-[11px] text-[#8c060a] leading-relaxed whitespace-pre-line text-center">
                        {data.iscas}
                      </td>
                      {/* Produto Embarcado */}
                      <td className="px-3 py-3.5 font-mono text-[10.5px] leading-relaxed text-stone-600 whitespace-pre-line text-center">
                        {data.produtoEmbarcado}
                      </td>
                      {/* Código U.M.A */}
                      <td className="px-3 py-3.5 font-mono text-[10.5px] leading-relaxed text-stone-600 whitespace-pre-line text-center">
                        {data.codigoUMA}
                      </td>
                      {/* Destino */}
                      <td className="px-3 py-3.5 font-extrabold text-[#3e2516] uppercase text-center max-w-[120px] break-words">
                        {data.destino}
                      </td>
                      {/* Data enviada */}
                      <td className="px-3 py-3.5 text-stone-600 font-medium text-center">
                        {data.dataEnviada}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PARAMETRIZAÇÃO DAS ISCAS HEADER */}
              <div className="bg-[#22130c] border border-black/30 rounded-t-lg text-amber-100/90 font-bold uppercase tracking-widest text-[11px] px-4 py-2 flex items-center justify-between shadow-sm">
                <span>Parametrização das Iscas</span>
              </div>
              
              {/* PARAMETRIZAÇÃO TABLE */}
              <div className="overflow-x-auto border border-[#5c3e29] border-t-0 rounded-b-lg shadow-md bg-white mb-6">
                <table className="w-full text-left border-collapse font-sans text-[11.5px] min-w-[600px]">
                  <thead>
                    <tr className="bg-[#f0dfcc]/40 border-b border-[#5c3e29] text-[#3e2516] font-bold text-[10.5px]">
                      <th className="px-4 py-2 text-center border-r border-[#e1ccb0] w-[140px]">
                        🔍 Nº Isca
                      </th>
                      <th className="px-4 py-2 border-r border-[#e1ccb0] flex items-center justify-between gap-1">
                        <span>🔍 Endereço aproximado da posição</span>
                        <span className="text-[9px] font-normal opacity-50">⇅</span>
                      </th>
                      <th className="px-4 py-2 w-[180px] text-center">
                        🔍 Data Posição
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1ccb0]/80">
                    {data.iscasParams.map((row, idx) => (
                      <tr key={idx} className="bg-white hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 text-center border-r border-[#e1ccb0] font-black font-mono text-[#3e2516] tracking-wide select-all">
                          {row.number || '---'}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-700 leading-normal select-all">
                          {row.address || '---'}
                        </td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-stone-600 text-[11px] select-all">
                          {row.datePosition || '---'}
                        </td>
                      </tr>
                    ))}
                    {data.iscasParams.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-stone-400 italic">
                          Nenhum registro de posição.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* POCKETS RACK PLAN HEADER */}
              <p className="text-[12px] font-black text-[#1a0a07] uppercase tracking-wider mb-2">
                ESQUEMA DE EMBARQUE DAS ISCAS:
              </p>

              {/* Render structural racks */}
              <div className="flex gap-4 flex-wrap justify-start">
                <div className="flex flex-col">
                  {renderRackGrid(0)}
                </div>
                <div className="flex flex-col">
                  {renderRackGrid(1)}
                </div>
              </div>

            </div>

            {/* Hint bar with multiple copy/send methods */}
            <div className="bg-[#5c3c24]/10 border border-[#5c3c24]/30 rounded-2xl p-5 max-w-[850px] w-full text-left flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex gap-3">
                <Printer size={20} className="text-[#5c3c24] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#3e2516] block mb-1">Dicas de Envio Corporativo:</span>
                  <p className="text-[9.5px] text-[#5c3c24] leading-relaxed font-semibold">
                    • <strong>Copiar HTML:</strong> Copia o design original completo (tabelas e cores) para colar diretamente no Outlook ou Gmail.<br/>
                    • <strong>Copiar Texto:</strong> Copia uma versão em formato texto sem formatação, ideal para mensagens rápidas ou WhatsApp.<br/>
                    • <strong>Enviar E-mail:</strong> Abre automaticamente seu aplicativo de e-mail (Outlook/Gmail) com destinatários, assunto e dados preenchidos.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  onClick={handleCopyToClipboard}
                  className="bg-[#B32025] hover:bg-[#8c060a] text-white py-1.5 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
                >
                  {copied ? 'HTML Copiado!' : 'Copiar HTML'}
                </button>
                <button
                  onClick={handleCopyPlaintext}
                  className="bg-amber-800 hover:bg-amber-900 text-white py-1.5 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
                >
                  {copiedText ? 'Texto Copiado!' : 'Copiar Texto'}
                </button>
                <button
                  onClick={handleOpenMailClient}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
                >
                  Abrir E-mail
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
