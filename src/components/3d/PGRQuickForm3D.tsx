import React, { useState } from 'react';
import { UploadCloud, Trash2, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PGRQuickFormProps {
  onSuccessCopy?: (text: string) => void;
  onNavigateToFull?: () => void;
}

export default function PGRQuickForm3D({ onSuccessCopy, onNavigateToFull }: PGRQuickFormProps) {
  const [origem, setOrigem] = useState('SANTA LUZIA/MG');
  const [destino, setDestino] = useState('BRASÍLIA - DF');
  const [transportadora, setTransportadora] = useState('MODENSE');
  const [motorista, setMotorista] = useState('MARISON REZENDE LEMOS');
  const [pasteData, setPasteData] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyAssunto = () => {
    const text = `PRÉ ALERTA PGR - ${origem} / ${destino} - ${transportadora} - ${motorista}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onSuccessCopy) onSuccessCopy(text);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    setOrigem('SANTA LUZIA/MG');
    setDestino('BRASÍLIA - DF');
    setTransportadora('MODENSE');
    setMotorista('MARISON REZENDE LEMOS');
    setPasteData('');
  };

  return (
    <div className="flex flex-col justify-between w-full h-full text-xs">
      <div className="space-y-2.5">
        {/* Row 1: Origem & Destino */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-[#a88d74] uppercase tracking-wider mb-1">
              Origem
            </label>
            <div className="relative">
              <select
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full bg-[#1b1008] border border-[#e2ba61]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#ffe699] font-medium appearance-none focus:outline-none focus:border-[#e2ba61] shadow-inner"
              >
                <option value="SANTA LUZIA/MG">SANTA LUZIA/MG</option>
                <option value="MONTES CLAROS/MG">MONTES CLAROS/MG</option>
                <option value="VIANA/ES">VIANA/ES</option>
                <option value="CUIABÁ/MT">CUIABÁ/MT</option>
                <option value="SUMARÉ/SP">SUMARÉ/SP</option>
                <option value="LONDRINA/PR">LONDRINA/PR</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#a88d74] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#a88d74] uppercase tracking-wider mb-1">
              Destino
            </label>
            <div className="relative">
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full bg-[#1b1008] border border-[#e2ba61]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#ffe699] font-medium appearance-none focus:outline-none focus:border-[#e2ba61] shadow-inner"
              >
                <option value="BRASÍLIA - DF">BRASÍLIA - DF</option>
                <option value="SÃO PAULO - SP">SÃO PAULO - SP</option>
                <option value="RIO DE JANEIRO - RJ">RIO DE JANEIRO - RJ</option>
                <option value="SALVADOR - BA">SALVADOR - BA</option>
                <option value="CURITIBA - PR">CURITIBA - PR</option>
                <option value="NATAL - RN">NATAL - RN</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#a88d74] text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Transportadora & Motorista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-[#a88d74] uppercase tracking-wider mb-1">
              Transportadora
            </label>
            <div className="relative">
              <select
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
                className="w-full bg-[#1b1008] border border-[#e2ba61]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#ffe699] font-medium appearance-none focus:outline-none focus:border-[#e2ba61] shadow-inner"
              >
                <option value="MODENSE">MODENSE</option>
                <option value="TOMASI">TOMASI</option>
                <option value="APK">APK</option>
                <option value="FROTA 3C">FROTA 3C</option>
                <option value="TRANSMAGNA">TRANSMAGNA</option>
                <option value="GOBOR">GOBOR</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#a88d74] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#a88d74] uppercase tracking-wider mb-1">
              Motorista
            </label>
            <div className="relative">
              <select
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                className="w-full bg-[#1b1008] border border-[#e2ba61]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#ffe699] font-medium appearance-none focus:outline-none focus:border-[#e2ba61] shadow-inner"
              >
                <option value="MARISON REZENDE LEMOS">MARISON REZENDE LEMOS</option>
                <option value="JEFFERSON AUGUSTO">JEFFERSON AUGUSTO</option>
                <option value="CARLOS EDUARDO SILVA">CARLOS EDUARDO SILVA</option>
                <option value="ANTONIO MARCOS">ANTONIO MARCOS</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#a88d74] text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Colar da planilha (parametrização) */}
        <div>
          <label className="block text-[10px] font-semibold text-[#a88d74] uppercase tracking-wider mb-1">
            Colar da planilha (parametrização)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cole as linhas da planilha de iscas aqui..."
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              className="w-full bg-[#1b1008] border border-[#e2ba61]/30 rounded-lg px-2.5 py-1.5 pr-8 text-xs text-[#f7ede1] placeholder-[#7d6550] focus:outline-none focus:border-[#e2ba61] shadow-inner"
            />
            <button
              onClick={onNavigateToFull}
              title="Abrir gerador completo"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#caa031] hover:text-[#ffe699] cursor-pointer"
            >
              <UploadCloud size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-[#3d2314] flex items-center justify-between gap-2">
        <button
          onClick={handleClear}
          className="btn-3d-glass px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer text-[#d8c2aa] hover:text-[#f7ede1]"
        >
          <Trash2 size={13} />
          <span>Limpar</span>
        </button>

        <button
          onClick={handleCopyAssunto}
          className="btn-3d-gold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#1a0f07]" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copiar Assunto</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
