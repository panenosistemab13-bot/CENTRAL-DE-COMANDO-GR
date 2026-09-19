import React, { useState, useEffect } from "react";
import {
  Mail,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  User,
  CreditCard,
  Phone,
  Info,
  Sliders,
  Send,
  FileText,
  Truck,
  Image as ImageIcon,
  MapPin,
  Search,
  Package,
  Plus,
  Building2,
  ShieldCheck,
  Navigation,
  Compass,
  CheckSquare,
  Radio,
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";
import { GlassPanel3D } from "./3d/GlassPanel3D";
import { MetricCard3D } from "./3d/MetricCard3D";
import { HUDPanel } from "./3d/HUDPanel";
import { StatusIndicator3D } from "./3d/StatusIndicator3D";
import { FilterPanel3D } from "./3d/FilterPanel3D";
import { Modal3D } from "./3d/Modal3D";

const TRANSPORTADORAS = [
  "apk", "tomasi", "moedense", "Frota 3C", "TRANSMAGNA", "RNCGG", "GT MINAS", "GOBOR",
  "SRH SARAIVA", "PACTUAL", "JETTA", "TECPET", "TRANS DANIEL", "UTISEG TRANSPORTES E LOCACOES LTDA",
  "COMBOIO", "REAL 94", "TORNADO", "FUJIOKA", "MERCOTRUCK", "UNITRADING LOG"
];

const EMBARQUE_IMAGES = [
  { value: "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF", label: "Paletizado (Padrão)" },
  { value: "https://lh3.googleusercontent.com/d/1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH", label: "Carga Batida (Padrão)" },
  { value: "https://lh3.googleusercontent.com/d/1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf", label: "AMARELIN" },
  { value: "https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh", label: "SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX", label: "CASTANHA" },
  { value: "https://lh3.googleusercontent.com/d/1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ", label: "IZOTONICO" },
  { value: "https://lh3.googleusercontent.com/d/1EQ5fMDDHViGvBd8-ehlwhyE4yyOc_peH", label: "ALMOFADA" },
  { value: "none", label: "Nenhum Embarque" }
];

export const DESTINOS_PLANILHA_ISCAS = [
  "ARAÇARIGUAMA", "ARIQUEMES-RO", "BARBALHA", "BRASILIA", "CAMPO GRANDE", "CLIENTE", "CUIABA",
  "CURITIBA", "DESCARTÁVEL", "EUSEBIO", "EXPORTAÇÃO", "GOVERNADOR CR", "GRAVATAI", "GUARULHOS",
  "JUIZ DE FORA", "JOÃO PESSOA", "LONDRINA", "MACEIÓ", "MANAUS", "MOSSORO", "MONTES CLAROS",
  "NATAL", "RECIFE", "RIO DE JANEIRO", "SALVADOR", "SANTA LUZIA", "SUMARÉ", "TERESINA", "VIANA"
];

export default function Controle({ onBack }: { onBack?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'iscas' | 'embarque'>('geral');
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Form State
  const [motorista, setMotorista] = useState('');
  const [placaCavalo, setPlacaCavalo] = useState('');
  const [placaCarreta, setPlacaCarreta] = useState('');
  const [transportadora, setTransportadora] = useState(TRANSPORTADORAS[0]);
  const [destino, setDestino] = useState(DESTINOS_PLANILHA_ISCAS[0]);
  const [embarqueImg, setEmbarqueImg] = useState(EMBARQUE_IMAGES[0].value);

  const handleCopySummary = () => {
    const summary = `CENTRAL DE CONTROLE PGR
Motorista: ${motorista || 'N/A'}
Placa Cavalo: ${placaCavalo || 'N/A'}
Placa Carreta: ${placaCarreta || 'N/A'}
Transportadora: ${transportadora}
Destino: ${destino}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="led-status led-status-blue" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
                PGR COMMAND CENTER 3D • CENTRAL DE CONTROLE
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Sliders size={24} className="text-sky-400" />
              GERENCIADOR DE PARÂMETROS E DISPOSITIVOS
            </h1>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          {copiedText ? <Check size={16} /> : <Copy size={16} />}
          {copiedText ? "COPIADO!" : "COPIAR RESUMO"}
        </button>
      </GlassPanel3D>

      {/* SUB TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800/80">
        {[
          { id: 'geral', label: 'Parâmetros Gerais', icon: Sliders },
          { id: 'iscas', label: 'Dispositivos & Iscas', icon: Radio },
          { id: 'embarque', label: 'Imagens de Embarque', icon: ImageIcon }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer",
                isActive
                  ? "bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)] font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: GERAL */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HUDPanel title="Formulário de Controle de Parâmetros" badge="INPUT OPERACIONAL">
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nome do Motorista</label>
                <input
                  type="text"
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  placeholder="Informe o motorista..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo</label>
                  <input
                    type="text"
                    value={placaCavalo}
                    onChange={(e) => setPlacaCavalo(e.target.value.toUpperCase())}
                    placeholder="ABC1D23"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Carreta</label>
                  <input
                    type="text"
                    value={placaCarreta}
                    onChange={(e) => setPlacaCarreta(e.target.value.toUpperCase())}
                    placeholder="XYZ9E87"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Transportadora</label>
                  <select
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                  >
                    {TRANSPORTADORAS.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destino Operacional</label>
                  <select
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                  >
                    {DESTINOS_PLANILHA_ISCAS.map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </HUDPanel>

          <HUDPanel title="Pré-Visualização do Espelho PGR" badge="PREVIEW 3D">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase">MOTORISTA:</span>
                <span className="text-white font-bold">{motorista || 'NÃO INFORMADO'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase">PLACA CAVALO:</span>
                <span className="text-white font-bold">{placaCavalo || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase">PLACA CARRETA:</span>
                <span className="text-white font-bold">{placaCarreta || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase">TRANSPORTADORA:</span>
                <span className="text-white font-bold">{transportadora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">DESTINO:</span>
                <span className="text-emerald-400 font-bold">{destino}</span>
              </div>
            </div>
          </HUDPanel>
        </div>
      )}

      {/* SUB TAB 2: ISCAS */}
      {activeSubTab === 'iscas' && (
        <HUDPanel title="Parâmetros de Dispositivos e Iscas Satelitais" badge="ISCAS DE CARGA">
          <div className="p-8 text-center font-mono text-xs text-slate-400">
            Mapeamento e pareamento de iscas eletrônicas e sensores de carga operacionais.
          </div>
        </HUDPanel>
      )}

      {/* SUB TAB 3: EMBARQUE */}
      {activeSubTab === 'embarque' && (
        <HUDPanel title="Galeria de Imagens de Embarque de Carga" badge="GALERIA">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {EMBARQUE_IMAGES.filter(img => img.value !== 'none').map((img, idx) => (
              <GlassPanel3D key={idx} className="p-3 flex flex-col items-center gap-2" variant="metallic">
                <img
                  src={img.value}
                  alt={img.label}
                  className="w-full h-36 object-cover rounded-xl border border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase text-center mt-1">
                  {img.label}
                </span>
              </GlassPanel3D>
            ))}
          </div>
        </HUDPanel>
      )}

    </div>
  );
}
