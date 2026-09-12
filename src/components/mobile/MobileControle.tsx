import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Battery, 
  Radio, 
  Search, 
  MapPin, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface IscaCard {
  id: string;
  numero: string;
  bateria: number;
  local: string;
  ultimaPosicao: string;
  status: 'online' | 'alerta' | 'offline';
  cavalo?: string;
}

const SAMPLE_ISCAS: IscaCard[] = [
  { id: '1', numero: 'ISCA-9941', bateria: 98, local: 'SANTA LUZIA - CD FABRICA', ultimaPosicao: 'Hoje, 09:42', status: 'online', cavalo: 'SCL-3C01' },
  { id: '2', numero: 'ISCA-8812', bateria: 85, local: 'BR-381 KM 450 (EM TRÂNSITO)', ultimaPosicao: 'Hoje, 09:30', status: 'online', cavalo: 'POZ-4431' },
  { id: '3', numero: 'ISCA-4421', bateria: 32, local: 'SUMARÉ - SP', ultimaPosicao: 'Hoje, 08:15', status: 'alerta', cavalo: 'JAH-9112' },
  { id: '4', numero: 'ISCA-1029', bateria: 12, local: 'PÁTIO INTERNO', ultimaPosicao: 'Ontem, 22:00', status: 'offline' }
];

export default function MobileControle({ onBack }: { onBack?: () => void }) {
  const [iscas, setIscas] = useState<IscaCard[]>(SAMPLE_ISCAS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'online' | 'alerta'>('todos');

  const filtered = iscas.filter(i => {
    if (filter === 'online' && i.status !== 'online') return false;
    if (filter === 'alerta' && i.status === 'online') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return i.numero.toLowerCase().includes(q) || i.local.toLowerCase().includes(q) || (i.cavalo && i.cavalo.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      <div className="px-4 pt-3 space-y-3.5 max-w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-stone-900 via-[#261308] to-[#1a0c05] border border-amber-500/30 p-4 shadow-xl">
          <span className="text-[9px] font-mono uppercase text-amber-400 block mb-0.5">
            Telemetria & Dispositivos
          </span>
          <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
            <Radio size={18} className="text-amber-500" />
            <span>Controle de Iscas & Baterias</span>
          </h3>
          <p className="text-xs text-[#c2a67e] mt-1">
            Monitoramento de níveis de bateria e posições em tempo real.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número da isca, placa ou local..."
            className="w-full bg-[#160a04] text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'online', label: 'Bateria OK' },
            { id: 'alerta', label: 'Atenção / Baixa' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                filter === f.id
                  ? "bg-amber-600 text-white border-amber-400/40"
                  : "bg-white/5 text-[#c2a67e] border-white/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST OF ISCAS */}
        <div className="space-y-3">
          {filtered.map(isca => {
            const isHigh = isca.bateria >= 80;
            const isMed = isca.bateria >= 40 && isca.bateria < 80;

            return (
              <div
                key={isca.id}
                className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                      <Radio size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-mono font-black text-white">
                        {isca.numero}
                      </h4>
                      {isca.cavalo && (
                        <span className="text-[10px] font-mono text-[#c2a67e]">
                          Placa: {isca.cavalo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 border",
                      isHigh
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                        : isMed
                        ? "bg-amber-950 text-amber-300 border-amber-500/30"
                        : "bg-rose-950 text-rose-300 border-rose-500/30"
                    )}>
                      <Battery size={13} />
                      <span>{isca.bateria}%</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#c2a67e] space-y-1 my-2 bg-black/30 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-zinc-300 truncate">
                    <MapPin size={12} className="text-amber-400 shrink-0" />
                    <span>{isca.local}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c2a67e]">
                    <Clock size={11} className="shrink-0" />
                    <span>Último sinal: {isca.ultimaPosicao}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
