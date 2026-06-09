import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Mail, 
  Truck, 
  Cpu, 
  User, 
  CreditCard, 
  Phone,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
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

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, DATA_PATH);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.parsedRows) setParsedRows(data.parsedRows);
        if (data.extraData) setExtraData(data.extraData);
      }
    };
    fetchData();
  }, []);

  const saveData = async (rows: RawData[], extra: ExtraData) => {
    setParsedRows(rows);
    setExtraData(extra);
    await setDoc(doc(db, DATA_PATH), { parsedRows: rows, extraData: extra });
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
    await saveData(emptyRows, emptyExtra);
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

  const copyToEmail = async () => {
    const greeting = getGreeting();
    const htmlContent = `
      <div style="margin: 0; padding: 0; background-color: #f6efe2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border: 1px solid #d4c3a3; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header with Logo and Brand -->
          <tr>
            <td align="center" style="padding: 30px 20px; background-color: #3a2414; background-image: linear-gradient(135deg, #3a2414 0%, #2b180d 100%);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <div style="display: inline-block; background-color: #b32025; color: #ffffff; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; font-size: 28px; font-weight: 900; border: 3px solid #f2e4cc; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">3</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #f2e4cc; margin: 0; font-size: 22px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase;">Averbação de Carga</h1>
                    <p style="color: #b49271; margin: 5px 0 0 0; font-size: 10px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">Módulo de Logística Premium</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2d1a10; margin: 0 0 15px 0; font-size: 24px; font-weight: 800;">${greeting}!</h2>
              <p style="color: #6b4423; margin: 0 0 30px 0; font-size: 15px; line-height: 1.6;">Informamos que o relatório de averbação foi gerado com sucesso através do sistema integrador. Abaixo seguem os detalhes consolidados da operação.</p>
              
              <!-- Operation Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdfaf5; border-left: 6px solid #b32025; border-radius: 4px; border: 1px solid #e8d4b0; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="color: #8c6b4e; margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Trajeto da Operação</p>
                          <p style="color: #2d1a10; margin: 4px 0 0 0; font-size: 18px; font-weight: 800; text-transform: uppercase;">${getRoute()}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #8c6b4e; margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Valor Declarado (SM)</p>
                          <p style="color: #b32025; margin: 4px 0 0 0; font-size: 22px; font-weight: 900;">${getTotalValue()}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #2d1a10; margin: 0 0 15px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Dados Técnicos e Documentação</p>
              
              <!-- Data Table -->
              <div style="overflow-x: auto;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; min-width: 600px;">
                  <tr style="background-color: #3a2414;">
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Transportadora</th>
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Tecnologia</th>
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Placa Cavalo</th>
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Placa Carreta</th>
                  </tr>
                  <tr>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${extraData.transportadora || '---'}</td>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${extraData.tecnologia || '---'}</td>
                    <td style="padding: 15px 10px; color: #b32025; font-size: 14px; font-weight: 800; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${parsedRows[0]?.placaCav || '---'}</td>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${getPlacasCarretas() || '---'}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 20px; overflow-x: auto;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; min-width: 600px;">
                  <tr style="background-color: #3a2414;">
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Motorista</th>
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">CPF</th>
                    <th style="padding: 12px 10px; color: #f2e4cc; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid #2b180d; text-transform: uppercase;">Telefone</th>
                  </tr>
                  <tr>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${extraData.nomeMotorista || '---'}</td>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${extraData.cpf || '---'}</td>
                    <td style="padding: 15px 10px; color: #3a2414; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #e8d4b0; background-color: #fdfcf9;">${extraData.telefone || '---'}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin-top: 30px; color: #6b4423; font-size: 14px; font-style: italic;">As Notas Fiscais seguem anexadas a este envio.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #fdf9f0; border-top: 1px solid #e8d4b0; text-align: center;">
              <p style="margin: 0; color: #8c6b4e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Sistema PGR Integrado • 3 Corações</p>
              <p style="margin: 5px 0 0 0; color: #b49271; font-size: 10px;">Feito com paixão. Feito para entregar.</p>
            </td>
          </tr>
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

        <button onClick={clearData} className="w-full bg-[#3A2414] hover:bg-[#2D1A10] text-[#E8D4B0] py-3 rounded-lg font-black text-[10px] mb-4 flex items-center justify-center gap-2 transition-all border-b-4 border-black/40">
            <Trash2 size={12} /> LIMPAR INFORMAÇÕES
        </button>

        <div className="bg-[#3A2414] p-4 rounded-lg text-[10px] text-[#F2E4CC] border-2 border-[#C7A26A] shadow-inner font-mono">
            <strong className="text-[#C7A26A]">DICA DE GESTÃO</strong><br/>Verifique os dados cuidadosamente antes de enviar.
        </div>
      </div>
      
      {/* Main - Artisan Report */}
      <div className="flex-1 p-10 overflow-y-auto">
        {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6B4423]">
               <div className="relative mb-8 group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-[#B32025] to-[#3A2414] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                 <img src={mockupImg} alt="Interface Mockup" className="relative w-80 h-auto rounded-2xl shadow-2xl border-4 border-[#3A2414]/10 transform -rotate-2 hover:rotate-0 transition-all duration-500" />
               </div>
               <textarea onChange={(e) => parseInput(e.target.value)} placeholder="Cole os dados aqui..." className="w-96 h-48 p-6 border-4 border-dashed border-[#C7A26A] bg-[#fdfaf5] rounded-2xl text-center text-[#3A2414] placeholder-[#6B4423]/50 shadow-inner focus:border-[#B32025] focus:outline-none transition-all"/>
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
