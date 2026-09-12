import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CalendarDays, 
  Copy, 
  Check, 
  Truck, 
  UserCheck, 
  MapPin, 
  ShieldCheck, 
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MobileSMCreator({ onBack }: { onBack?: () => void }) {
  const [smNumero, setSmNumero] = useState(`SM-${Math.floor(100000 + Math.random() * 900000)}`);
  const [motorista, setMotorista] = useState('');
  const [cpf, setCpf] = useState('');
  const [cavalo, setCavalo] = useState('');
  const [carreta, setCarreta] = useState('');
  const [origem, setOrigem] = useState('SANTA LUZIA - MG');
  const [destino, setDestino] = useState('');
  const [tecnologia, setTecnologia] = useState('SASCAR');
  const [iscas, setIscas] = useState('');
  const [valorCarga, setValorCarga] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateSM = () => {
    if (!motorista || !cavalo) {
      alert('Preencha ao menos o Motorista e a Placa do Cavalo');
      return;
    }

    const txt = `📋 *SOLICITAÇÃO DE MONITORAMENTO (SM)*
Número: ${smNumero}
Data: ${new Date().toLocaleDateString('pt-BR')}

🚚 *VEÍCULO & MOTORISTA:*
Motorista: ${motorista.toUpperCase()}
CPF: ${cpf || 'NÃO INFORMADO'}
Cavalo: ${cavalo.toUpperCase()}
Carreta: ${carreta.toUpperCase() || 'NÃO INFORMADO'}
Tecnologia: ${tecnologia}

📍 *ROTA & CARGA:*
Origem: ${origem}
Destino: ${destino.toUpperCase() || 'NÃO INFORMADO'}
Valor da Carga: R$ ${valorCarga || 'A DEFINIR'}
Iscas de Carga: ${iscas || 'NENHUMA'}

🔒 *STATUS:* AGUARDANDO LIBERAÇÃO PGR / BUONNY / OPEN TECH`;

    setGeneratedText(txt);
  };

  const copySM = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      <div className="px-4 pt-3 space-y-4 max-w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#261308] to-[#1a0c05] border border-amber-500/30 p-4 shadow-xl">
          <span className="text-[9px] font-mono uppercase text-amber-400 block mb-0.5">
            Eventos & PGR
          </span>
          <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
            <CalendarDays size={18} className="text-amber-500" />
            <span>Criador de S.M.</span>
          </h3>
          <p className="text-xs text-[#c2a67e] mt-1">
            Gere a Solicitação de Monitoramento formatada para PGR e WhatsApp.
          </p>
        </div>

        {/* FORM */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-sans font-black uppercase text-white">
              Dados da Viagem
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {smNumero}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                Nome do Motorista *
              </label>
              <input
                type="text"
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                placeholder="NOME COMPLETO"
                className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Tecnologia
                </label>
                <select
                  value={tecnologia}
                  onChange={(e) => setTecnologia(e.target.value)}
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                >
                  <option value="SASCAR">SASCAR</option>
                  <option value="AUTOTRAC">AUTOTRAC</option>
                  <option value="OMNILINK">OMNILINK</option>
                  <option value="SIGHRA">SIGHRA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Placa Cavalo *
                </label>
                <input
                  type="text"
                  value={cavalo}
                  onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Placa Carreta
                </label>
                <input
                  type="text"
                  value={carreta}
                  onChange={(e) => setCarreta(e.target.value.toUpperCase())}
                  placeholder="XYZ-5678"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Origem
                </label>
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Destino
                </label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ex: SUMARÉ - SP"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Valor da Carga (R$)
                </label>
                <input
                  type="text"
                  value={valorCarga}
                  onChange={(e) => setValorCarga(e.target.value)}
                  placeholder="120.000,00"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                  Nº da Isca (se houver)
                </label>
                <input
                  type="text"
                  value={iscas}
                  onChange={(e) => setIscas(e.target.value)}
                  placeholder="Ex: ISCA 4509"
                  className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSM}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg border border-amber-400/30 active:scale-97 cursor-pointer mt-2"
            >
              <Sparkles size={15} />
              <span>Gerar Solicitação de Monitoramento</span>
            </button>
          </div>

          {generatedText && (
            <div className="mt-3 p-3 rounded-2xl bg-black/60 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-[9px] font-mono uppercase text-amber-300 font-bold">
                  Texto Formatado para Envio:
                </span>
                <button
                  onClick={copySM}
                  className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-sans font-bold flex items-center gap-1"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {generatedText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
