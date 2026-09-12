import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Key, 
  FileText, 
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PolicyCard {
  ramo: string;
  seguradora: string;
  apolice: string;
  ddr: string;
  averbadora: string;
}

const POLICIES: PolicyCard[] = [
  { ramo: 'RCTR-C (Acidente)', seguradora: 'PORTO SEGURO', apolice: '0654.12.98765-0', ddr: 'SIM (Integral)', averbadora: 'AT&M TECNOLOGIA' },
  { ramo: 'RC-DC (Roubo/Desvio)', seguradora: 'PORTO SEGURO', apolice: '0654.12.98766-1', ddr: 'SIM (Com PGR)', averbadora: 'AT&M TECNOLOGIA' },
  { ramo: 'RCF-DC (Facultativo)', seguradora: 'TOKIO MARINE', apolice: '5420.98.11200-9', ddr: 'NÃO', averbadora: 'PORTAL ELITE' }
];

export default function MobileAverbacao({ onBack }: { onBack?: () => void }) {
  const [cteNumber, setCteNumber] = useState('');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [valorMercadoria, setValorMercadoria] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!cteNumber && !chaveAcesso) {
      alert('Digite o número do CT-e ou a Chave de Acesso');
      return;
    }

    const num = cteNumber.trim() || chaveAcesso.slice(-8);
    const code = `AVB-3C-${num}-${Date.now().toString().slice(-4)}`;
    setGeneratedCode(code);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      <div className="px-4 pt-3 space-y-4 max-w-full overflow-x-hidden">
        {/* HEADER INTRO */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-red-950/60 via-[#261308] to-[#1a0c05] border border-red-500/30 p-4 shadow-xl">
          <span className="text-[9px] font-mono uppercase text-red-400 block mb-0.5">
            Gestão de Seguros de Carga
          </span>
          <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
            <ShieldCheck size={18} className="text-[#B32025]" />
            <span>Averbação Automática</span>
          </h3>
          <p className="text-xs text-[#c2a67e] mt-1">
            Geração instantânea de protocolo e consulta de apólices 3C.
          </p>
        </div>

        {/* GENERATOR CARD */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl space-y-3">
          <h4 className="text-xs font-sans font-black uppercase text-white">
            Gerador de Protocolo de Averbação
          </h4>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                Número do CT-e
              </label>
              <input
                type="text"
                value={cteNumber}
                onChange={(e) => setCteNumber(e.target.value)}
                placeholder="Ex: 124589"
                className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                Chave de Acesso (44 dígitos)
              </label>
              <input
                type="text"
                value={chaveAcesso}
                onChange={(e) => setChaveAcesso(e.target.value)}
                placeholder="312609..."
                className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                Valor da Mercadoria (R$)
              </label>
              <input
                type="text"
                value={valorMercadoria}
                onChange={(e) => setValorMercadoria(e.target.value)}
                placeholder="Ex: 85.000,00"
                className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#B32025] to-[#800609] text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg border border-white/20 active:scale-97 cursor-pointer mt-2"
            >
              <Sparkles size={15} />
              <span>Gerar Protocolo de Averbação</span>
            </button>
          </div>

          {generatedCode && (
            <div className="mt-3 p-3 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-2">
              <span className="text-[9px] font-mono uppercase text-emerald-400 block">
                Protocolo Gerado com Sucesso:
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono font-black text-white">
                  {generatedCode}
                </span>
                <button
                  onClick={() => copyToClipboard(generatedCode, 'code')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-sans font-bold flex items-center gap-1"
                >
                  {copiedKey === 'code' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === 'code' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* POLICIES LIST */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#c2a67e] px-1">
            Apólices Vigentes Grupo Três Corações
          </h4>

          {POLICIES.map((p, idx) => (
            <div
              key={idx}
              className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-[9px] font-mono text-amber-300 border border-amber-500/30">
                  {p.ramo}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  VIGENTE
                </span>
              </div>

              <h4 className="text-sm font-sans font-black text-white mb-1">
                {p.seguradora}
              </h4>

              <div className="text-[11px] font-mono text-[#c2a67e] space-y-1 mb-3">
                <p>Apólice: <span className="text-white font-bold">{p.apolice}</span></p>
                <p>Averbadora: <span className="text-white">{p.averbadora}</span></p>
                <p>Dispensa Direito de Regresso (DDR): <span className="text-white">{p.ddr}</span></p>
              </div>

              <button
                onClick={() => copyToClipboard(p.apolice, `pol_${idx}`)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === `pol_${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedKey === `pol_${idx}` ? 'Apólice Copiada!' : 'Copiar Número da Apólice'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
