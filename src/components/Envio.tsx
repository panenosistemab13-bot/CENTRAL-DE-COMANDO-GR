import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Copy, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, push, update } from 'firebase/database';

interface ExtractedData {
  baitCode?: string;
  date?: string;
  time?: string;
  dock?: string;
  cavalo?: string;
  carreta?: string;
  volume?: string;
  destination?: string;
  nf?: string;
  responsible?: string;
  product?: string;
  uma?: string;
  nfValue?: string;
  transportadora?: string;
  motorista?: string;
}

interface GroupedData {
  id?: string;
  cavalo: string;
  originInfo: string;
  transportadora: string;
  motorista: string;
  destination: string;
  date: string;
  nfs: string[];
  items: Array<{
    carreta: string;
    baitCode: string;
    product: string;
    uma: string;
  }>;
}

export default function Envio() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const preAlertasRef = ref(rtdb, 'PRE_ALERTAS');
    const unsubscribe = onValue(preAlertasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: GroupedData[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key
        })).reverse(); // Show newest first or last? Let's just reverse to show latest at top
        setGroupedData(parsed);
      } else {
        setGroupedData([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const compressImage = (base64Str: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressed);
    };
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert('Por favor, selecione uma imagem ou arquivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      if (isImage) {
        compressImage(base64, async (compressedBase64) => {
          await extractTableData(compressedBase64);
        });
      } else {
        // For PDF, we send it directly
        await extractTableData(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const extractTableData = async (imageBase64: string) => {
    setIsProcessing(true);
    try {
      const customPrompt = "Extraia as informações da prancheta e formate como JSON. Tenho as colunas: CAVALO, CARRETA, Nº NF, Nº ISCA, PRODUTO, U.M.A., DESTINO, DATA, etc. Se houver nomes, infira os campos com cuidado.";
      
      const response = await fetch('/api/extract-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagemBase64: imageBase64, customPrompt })
      });

      if (!response.ok) {
         let errorText = 'Erro desconhecido da API';
         try {
           const errData = await response.json();
           errorText = errData.error || errorText;
         } catch(e) {
           errorText = `Erro HTTP: ${response.status} ${response.statusText}`;
         }
         alert(`Falha na extração. ${errorText}`);
         setIsProcessing(false);
         return;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Group by Cavalo
        const dataArray: ExtractedData[] = Array.isArray(result.data) ? result.data : [result.data];
        
        const groups: Record<string, GroupedData> = {};

        dataArray.forEach(row => {
          const cavalo = (row.cavalo || 'DESCONHECIDO').trim().toUpperCase();
          
          if (!groups[cavalo]) {
            groups[cavalo] = {
              cavalo,
              originInfo: 'SANTA LUZIA/MG',
              transportadora: 'FROTA 3C',
              motorista: '',
              destination: (row.destination || '').toUpperCase(),
              date: row.date || '',
              nfs: [],
              items: []
            };
          }

          if (row.nf && !groups[cavalo].nfs.includes(row.nf)) {
             // split by comma if multiple
             const nfParts = row.nf.split(/[,/; -]+/);
             nfParts.forEach(p => {
               if (p.trim() && !groups[cavalo].nfs.includes(p.trim())) {
                 groups[cavalo].nfs.push(p.trim());
               }
             });
          }

          if (row.date && !groups[cavalo].date) {
            groups[cavalo].date = row.date;
          }
          if (row.destination && (!groups[cavalo].destination || groups[cavalo].destination.length < row.destination.length)) {
            groups[cavalo].destination = row.destination.toUpperCase();
          }

          const hasData = row.carreta || row.baitCode || row.product || row.uma;
          if (hasData) {
              groups[cavalo].items.push({
                carreta: (row.carreta || 'SEM CARRETA').toUpperCase(),
                baitCode: (row.baitCode || 'SEM ISCA').toUpperCase(),
                product: (row.product || 'SEM ISCA').toUpperCase(),
                uma: (row.uma || '----').toUpperCase()
              });
          }
        });

        // Ensure "SEM ISCA" for missing items if multiple trailers, but they already filled.
        
        const values = Object.values(groups);
        // Add to local state immediately so UI works even if Firebase fails
        setGroupedData(prev => {
            const newArray = [...values, ...prev];
            // assign temporary ids to new items just for local interactions until refreshed
            return newArray.map((g, i) => ({ ...g, id: g.id || `temp-${Date.now()}-${i}` }));
        });

        for (const val of values) {
           try {
               const newRef = push(ref(rtdb, 'PRE_ALERTAS'));
               await set(newRef, val);

               // Also save to reference table for Patio cross-referencing
               if (val.cavalo && val.cavalo !== 'DESCONHECIDO') {
                 const cleanP = val.cavalo.replace(/[\s-]/g, '').toUpperCase();
                 await update(ref(rtdb, `pre_alertas/referencias/${cleanP}`), {
                   destino: val.destination,
                   carreta: val.items[0]?.carreta || '---'
                 });
               }
           } catch(fbErr) {
               console.error("Firebase save error (403 usually means API Key restricted or RTDB Rules are not set to public):", fbErr);
           }
        }
      } else {
        alert('Erro ao extrair dados da imagem. ' + (result.error || ''));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar imagem.');
    }
    setIsProcessing(false);
  };

  const copyToClipboard = (htmlContent: string, plainText: string, index: number) => {
    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      });
      navigator.clipboard.write([clipboardItem]).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
    } catch (e) {
      // Fallback for older browsers
      const el = document.createElement('div');
      el.innerHTML = htmlContent;
      document.body.appendChild(el);
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyGroup = (index: number) => {
    const el = emailRefs.current[index];
    if (!el) return;
    copyToClipboard(el.innerHTML, el.innerText, index);
  };

  const handleFieldChange = (groupIndex: number, field: keyof GroupedData | 'item', value: string | string[], itemIndex?: number, itemField?: keyof GroupedData['items'][0]) => {
     const group = groupedData[groupIndex];
     if (!group || !group.id) return;

     if (field === 'item' && itemIndex !== undefined && itemField) {
        update(ref(rtdb, `PRE_ALERTAS/${group.id}/items/${itemIndex}`), {
           [itemField]: value
        });
        // If it's a carreta change, update reference if it's the first item
        if (itemField === 'carreta' && itemIndex === 0 && group.cavalo && group.cavalo !== 'DESCONHECIDO') {
           const cleanP = group.cavalo.replace(/[\s-]/g, '').toUpperCase();
           update(ref(rtdb, `pre_alertas/referencias/${cleanP}`), {
             carreta: value
           });
        }
     } else {
        update(ref(rtdb, `PRE_ALERTAS/${group.id}`), {
           [field]: value
        });
        
        // Update references for destination changes
        if (field === 'destination' && group.cavalo && group.cavalo !== 'DESCONHECIDO') {
           const cleanP = group.cavalo.replace(/[\s-]/g, '').toUpperCase();
           update(ref(rtdb, `pre_alertas/referencias/${cleanP}`), {
             destino: value
           });
        }
     }
  };

  const handleDeleteGroup = (id: string) => {
    if (window.confirm("Você tem certeza que deseja excluir esse pré-alerta?")) {
      remove(ref(rtdb, `PRE_ALERTAS/${id}`));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 h-full pb-10 font-sans">
      
      {/* Office Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
            <UploadCloud size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-sans">
                Gerenciador de Pré-Alertas
              </h2>
              <span className="text-[10px] font-extrabold bg-blue-900/80 text-blue-200 px-2.5 py-0.5 rounded-md border border-blue-700">
                ESCRITÓRIO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Importação de pranchetas, extração automática via IA e geração de tabelas para e-mail
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
          LOGÍSTICA & MONITORAMENTO
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragging 
            ? 'border-blue-600 bg-blue-50/80 shadow-md' 
            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
          accept="image/*,application/pdf" 
          className="hidden" 
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 text-blue-600">
             <Loader2 className="w-10 h-10 animate-spin" />
             <p className="font-extrabold uppercase tracking-wider text-xs">Processando documento com Inteligência Artificial...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-600">
             <div className="p-3.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
               <UploadCloud className="w-8 h-8" />
             </div>
             <div className="text-center">
               <p className="text-slate-900 font-extrabold uppercase tracking-wide text-xs">Importar prancheta ou documento PDF</p>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Arraste a imagem/PDF aqui ou clique para selecionar do computador</p>
             </div>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {groupedData && groupedData.map((group, index) => {
          return (
            <motion.div 
              key={group.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex flex-col p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative font-sans"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold">
                    #{index + 1}
                  </div>
                  <div>
                     <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                       <ImagePlus className="w-4 h-4 text-blue-600" /> Pré-Alerta: {group.cavalo}
                     </h3>
                     <p className="text-xs text-slate-500 font-medium">Edite as informações abaixo se necessário e clique em copiar e-mail</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => group.id && handleDeleteGroup(group.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                    title="Excluir pré-alerta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyGroup(index)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer shadow-xs border",
                      copiedIndex === index 
                        ? "bg-emerald-600 text-white border-emerald-700" 
                        : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                    )}
                  >
                    {copiedIndex === index ? (
                       <><CheckCircle2 className="w-4 h-4" /> Copiado!</>
                    ) : (
                       <><Copy className="w-4 h-4" /> Copiar E-mail</>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable form fields that mirror the email content */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                 <div className="flex flex-col">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Motorista</label>
                   <input type="text" value={group.motorista} onChange={e => handleFieldChange(index, 'motorista', e.target.value)} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 uppercase" placeholder="Nome do motorista" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Transportadora</label>
                   <input type="text" value={group.transportadora} onChange={e => handleFieldChange(index, 'transportadora', e.target.value)} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 uppercase" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Origem x Destino</label>
                   <input type="text" value={group.originInfo} onChange={e => handleFieldChange(index, 'originInfo', e.target.value)} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 uppercase" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Destino (Tabela)</label>
                   <input type="text" value={group.destination} onChange={e => handleFieldChange(index, 'destination', e.target.value)} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 uppercase" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Data</label>
                   <input type="text" value={group.date} onChange={e => handleFieldChange(index, 'date', e.target.value)} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 uppercase font-mono" />
                 </div>
                 <div className="flex flex-col col-span-3">
                   <label className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Notas Fiscais</label>
                   <input type="text" value={group.nfs.join(' - ')} onChange={e => handleFieldChange(index, 'nfs', e.target.value.split('-').map(s=>s.trim()))} className="bg-white border border-slate-200 rounded-lg text-slate-900 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 font-mono" />
                 </div>
              </div>

              {/* Email Table Preview Box */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs overflow-x-auto select-text">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  PRÉ-VISUALIZAÇÃO DA TABELA DE E-MAIL
                </p>
                <div 
                   ref={el => { emailRefs.current[index] = el }} 
                   style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', color: '#000000', lineHeight: '1.4' }}
                >
                  <p style={{ margin: '0 0 10px 0' }}>Boa noite,</p>
                  
                  <p style={{ margin: '0 0 10px 0' }}>
                    <span style={{ backgroundColor: '#c00000', color: 'white', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>Favor se atentar ao resgate!</span>
                  </p>
                  
                  <p style={{ margin: '0 0 5px 0' }}>Atentar às informações abaixo:</p>
                  
                  <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
                    <li>
                       <span style={{ border: '1px solid black', padding: '1px 4px', fontWeight: 'bold' }}>
                         {group.originInfo} x {group.destination}
                       </span>;
                    </li>
                    <li style={{ marginTop: '2px' }}>
                       <span style={{ border: '1px solid black', padding: '1px 4px' }}>
                         * Favor, acusar o recebimento do pré-alerta;
                       </span>
                    </li>
                  </ul>
                  
                  <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black', textAlign: 'center', fontSize: '10pt', minWidth: '700px' }}>
                    <thead>
                      <tr>
                        <th colSpan={8} style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>
                          PRÉ - ALERTA DE ISCA EMBARCADA
                        </th>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px', width: '15%' }}>NÚMERO DA NF:</th>
                        <td colSpan={2} style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.nfs.join(' - ') || 'N/A'}</td>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>TRANSPORTADORA:</th>
                        <td colSpan={4} style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.transportadora || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>MOTORISTA</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>CAVALO</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>CARRETAS</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>Nº ISCAS</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>PRODUTO EMBARCADO</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>CÓDIGO U.M.A.</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>DESTINO</th>
                        <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>DATA ENVIADA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.length > 0 ? group.items.map((item, itemIdx) => (
                        <tr key={itemIdx}>
                          {itemIdx === 0 && <td rowSpan={group.items.length} style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.motorista}</td>}
                          {itemIdx === 0 && <td rowSpan={group.items.length} style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.cavalo}</td>}
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{item.carreta}</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{item.baitCode}</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{item.product}</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{item.uma}</td>
                          {itemIdx === 0 && <td rowSpan={group.items.length} style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.destination}</td>}
                          {itemIdx === 0 && <td rowSpan={group.items.length} style={{ border: '1px solid black', padding: '5px' }}>{group.date}</td>}
                        </tr>
                      )) : (
                        <tr>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.motorista}</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.cavalo}</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>-</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>-</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>-</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>-</td>
                          <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>{group.destination}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{group.date}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black', textAlign: 'center', fontSize: '10pt', minWidth: '700px', marginTop: '10px' }}>
                     <tbody>
                        <tr>
                          <th style={{ backgroundColor: '#b4c6e7', border: '1px solid black', padding: '5px' }}>
                            Parametrização das iscas
                          </th>
                        </tr>
                     </tbody>
                  </table>
                  
                  <p style={{ margin: '12px 0 0 0', fontWeight: 'bold', fontSize: '10pt', textTransform: 'uppercase' }}>ESQUEMA DE EMBARQUE DAS ISCAS:</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
