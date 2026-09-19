import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChevronLeft, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Calendar,
  Briefcase,
  User,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { Modal3D } from './3d/Modal3D';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}

interface PresenceListProps {
  onBack?: () => void;
}

export default function PresenceList({ onBack }: PresenceListProps) {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [bancoHorasMinutes, setBancoHorasMinutes] = useState(0);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState<'pessoal' | 'corporativo'>('corporativo');

  useEffect(() => {
    const presenceRef = ref(db, 'presence_list');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.bancoHorasManual !== undefined) setBancoHorasMinutes(data.bancoHorasManual);
        if (data.appointments) setAppointments(data.appointments);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newId = `app_${Date.now()}`;
    const newAppointment: Appointment = {
      id: newId,
      date: selectedDate,
      time: newTime,
      title: newTitle,
      type: newType
    };

    const updated = { ...appointments, [newId]: newAppointment };
    setAppointments(updated);
    set(ref(db, 'presence_list/appointments'), updated);

    setIsAddingAppointment(false);
    setNewTitle('');
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = { ...appointments };
    delete updated[id];
    setAppointments(updated);
    set(ref(db, 'presence_list/appointments'), updated);
  };

  const appointmentsList: Appointment[] = (Object.values(appointments) as Appointment[]) || [];

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
                PGR COMMAND CENTER 3D • ESCALA DE PRESENÇA E PLANTONISTAS
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Users size={24} className="text-sky-400" />
              CONTROLE DE ESCALA DE OPERADORES & ESCAP
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddingAppointment(true)}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> NOVO LEMBRETE / ESCALA
        </button>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="Total Agendamentos"
          value={appointmentsList.length}
          subtitle="Compromissos Mapeados"
          icon={Calendar}
          status="info"
        />
        <MetricCard3D
          title="Corporativos"
          value={appointmentsList.filter(a => a.type === 'corporativo').length}
          subtitle="Turnos Operacionais PGR"
          icon={Briefcase}
          status="normal"
        />
        <MetricCard3D
          title="Pessoais"
          value={appointmentsList.filter(a => a.type === 'pessoal').length}
          subtitle="Compromissos da Equipe"
          icon={User}
          status="warning"
        />
      </div>

      {/* APPOINTMENTS TABLE */}
      <HUDPanel title={`Agenda e Escala de Operações (${appointmentsList.length})`} badge="AGENDA PGR">
        {appointmentsList.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhum compromisso ou escala agendada. Clique em "Novo Lembrete / Escala".
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4">Título / Descrição</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
                {appointmentsList.map((app) => (
                  <tr key={app.id} className="hover:bg-sky-500/10 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{app.date}</td>
                    <td className="py-3 px-4 font-bold text-sky-300">{app.time}</td>
                    <td className="py-3 px-4 font-bold text-white">{app.title}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator3D
                        status={app.type === 'corporativo' ? 'normal' : 'warning'}
                        label={app.type.toUpperCase()}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAppointment(app.id)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer border border-rose-500/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HUDPanel>

      {/* CREATE APPOINTMENT MODAL */}
      <Modal3D
        isOpen={isAddingAppointment}
        onClose={() => setIsAddingAppointment(false)}
        title="Agendar Novo Lembrete / Turno"
      >
        <form onSubmit={handleAddAppointment} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Título do Agendamento *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Turno de Monitoramento Especial..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Horário</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Categoria</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'pessoal' | 'corporativo')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
            >
              <option value="corporativo">Corporativo / Turno PGR</option>
              <option value="pessoal">Pessoal / Lembrete Equipe</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddingAppointment(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Salvar Agendamento
            </button>
          </div>
        </form>
      </Modal3D>

    </div>
  );
}
