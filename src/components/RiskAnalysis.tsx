import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Target, 
  Lock, 
  Camera,
  Server,
  Network,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { Gauge3D } from './3d/Gauge3D';

const CHART_DATA = [
  { time: '08:00', created: 12, integrated: 10 },
  { time: '10:00', created: 19, integrated: 18 },
  { time: '12:00', created: 15, integrated: 15 },
  { time: '14:00', created: 25, integrated: 22 },
  { time: '16:00', created: 20, integrated: 20 },
];

const EVENTS_LOG = [
  { time: '15:42', msg: 'Excesso de velocidade Rota 4069', status: 'WARN' },
  { time: '15:35', msg: 'Desvio de rota detectado', status: 'CRIT' },
  { time: '15:10', msg: 'Sensor de pressão pneu aberto', status: 'OK' },
];

export default function RiskAnalysis() {
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const storedCalc = localStorage.getItem('sm_creator_calc');
    if (storedCalc) {
      try {
        const vals = JSON.parse(storedCalc);
        const sum = vals.reduce((acc: number, curr: string) => {
          const val = parseFloat(curr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
          return isNaN(val) ? acc : acc + val;
        }, 0);
        setTotalValue(sum);
      } catch (e) {
        console.warn("Calc parse error:", e);
      }
    }
  }, []);

  const securityNodes = [
    { id: 'cam-01', name: 'Perímetro Norte', status: 'OK', integrity: 98, icon: Camera },
    { id: 'srv-alpha', name: 'Datacenter PGR', status: 'Atenção', integrity: 76, icon: Server },
    { id: 'net-mesh', name: 'Rede Telemetria', status: 'OK', integrity: 99, icon: Network },
    { id: 'gate-primary', name: 'Controle de Pátio', status: 'Privado', integrity: 100, icon: Lock },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex items-center justify-between" variant="glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="led-status led-status-red animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
              PGR COMMAND CENTER 3D • ANÁLISE DE RISCO & MATRIZ
            </span>
          </div>
          <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
            <ShieldAlert size={24} className="text-sky-400" />
            MATRIZ DE RISCOS E TELEMETRIA OPERACIONAL
          </h1>
        </div>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard3D
          title="Valor Total Sob Risco"
          value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Cargas em Trânsito"
          icon={ShieldAlert}
          status="warning"
        />
        <MetricCard3D
          title="SMs Ativas"
          value={5}
          subtitle="Monitoramento em Tempo Real"
          icon={Activity}
          status="info"
        />
        <GlassPanel3D className="p-4 flex items-center justify-center" variant="metallic">
          <Gauge3D value={98.4} label="Eficiência de Transmissão" size={130} status="normal" />
        </GlassPanel3D>
      </div>

      {/* NODES GRID */}
      <HUDPanel title="Nós de Segurança e Telemetria de Campo" badge="HARDWARE INFRA">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityNodes.map((node) => (
            <GlassPanel3D key={node.id} className="p-4 flex flex-col justify-between gap-3" variant="metallic">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/30 text-sky-400">
                  <node.icon size={18} />
                </div>
                <StatusIndicator3D
                  status={node.status === 'OK' ? 'normal' : 'warning'}
                  label={node.status}
                  size="sm"
                />
              </div>

              <div>
                <h4 className="font-mono font-bold text-white text-sm">{node.name}</h4>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>ID: {node.id}</span>
                  <span className="font-bold text-sky-400">{node.integrity}% Integro</span>
                </div>
              </div>
            </GlassPanel3D>
          ))}
        </div>
      </HUDPanel>

      {/* CHART & LOGS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HUDPanel title="Fluxo de Monitoramento (SMs Criadas vs Integradas)" badge="TELEMETRIA">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="created" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="integrated" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HUDPanel>

        <HUDPanel title="Log de Eventos e Telemetria Crítica" badge="REALTIME LOGS">
          <div className="space-y-3 font-mono text-xs">
            {EVENTS_LOG.map((evt, idx) => (
              <GlassPanel3D key={idx} className="p-3 flex items-center justify-between" variant="metallic">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[10px] font-bold">{evt.time}</span>
                  <span className="text-white font-medium">{evt.msg}</span>
                </div>
                <StatusIndicator3D
                  status={evt.status === 'CRIT' ? 'critical' : evt.status === 'WARN' ? 'warning' : 'normal'}
                  label={evt.status}
                  size="sm"
                />
              </GlassPanel3D>
            ))}
          </div>
        </HUDPanel>
      </div>

    </div>
  );
}
