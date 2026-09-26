import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Phone, 
  AlertCircle, 
  X, 
  Coffee, 
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../firebase';
import { ref, onValue, push, set, remove, update } from 'firebase/database';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  shift: 'dia' | 'noite';
  status: 'presente' | 'folga' | 'ferias' | 'atestado';
  phone?: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'ALEF JUNIO', role: 'Supervisor de Logística', shift: 'dia', status: 'presente', phone: '31986635900' },
  { id: 'm2', name: 'DOUGLAS MEDEIROS', role: 'Operador de Monitoramento', shift: 'dia', status: 'presente', phone: '31986635900' },
  { id: 'm3', name: 'PAULO PEREIRA', role: 'Motorista Instrutor', shift: 'dia', status: 'presente', phone: '31988887777' },
  { id: 'm4', name: 'LUCAS GOMES', role: 'Controlador de Tráfego', shift: 'noite', status: 'folga', phone: '31977776666' },
  { id: 'm5', name: 'MARCOS VINICIUS', role: 'Analista de PGR', shift: 'noite', status: 'folga', phone: '31966665555' }
];

export default function MobilePresence({ onBack }: { onBack?: () => void }) {
  const [subTab, setSubTab] = useState<'escala' | 'agenda'>('escala');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Appointment
  const [showAppModal, setShowAppModal] = useState(false);
  const [appDate, setAppDate] = useState(new Date().toISOString().slice(0, 10));
  const [appTime, setAppTime] = useState('14:00');
  const [appTitle, setAppTitle] = useState('');
  const [appType, setAppType] = useState<'pessoal' | 'corporativo'>('corporativo');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Real-time listener for appointments
  useEffect(() => {
    try {
      const appRef = ref(rtdb, 'presence_list/appointments');
      const unsub = onValue(appRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: Appointment[] = Object.entries(val).map(([k, v]: [string, any]) => ({
            id: k,
            ...v
          }));
          setAppointments(list);
        } else {
          setAppointments([]);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Real-time listener for members
  useEffect(() => {
    try {
      const memRef = ref(rtdb, 'presence_list/members');
      const unsub = onValue(memRef, (snap) => {
        const val = snap.val();
        if (val) {
          const list: TeamMember[] = Object.entries(val).map(([k, v]: [string, any]) => ({
            id: k,
            ...v
          }));
          setMembers(list);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Toggle member status
  const handleToggleStatus = async (member: TeamMember) => {
    const statuses: TeamMember['status'][] = ['presente', 'folga', 'ferias', 'atestado'];
    const currentIdx = statuses.indexOf(member.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    try {
      await update(ref(rtdb, `presence_list/members/${member.id}`), { status: nextStatus });
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m));
      showToast(`${member.name}: status alterado para ${nextStatus.toUpperCase()}`);
    } catch (e) {
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m));
    }
  };

  // Add Appointment
  const handleAddAppointment = async () => {
    if (!appTitle.trim()) {
      showToast('Digite o título do compromisso!');
      return;
    }

    try {
      const newRef = push(ref(rtdb, 'presence_list/appointments'));
      await set(newRef, {
        date: appDate,
        time: appTime,
        title: appTitle.trim(),
        type: appType
      });
      showToast('Compromisso agendado com sucesso!');
      setShowAppModal(false);
      setAppTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (id: string) => {
    try {
      await remove(ref(rtdb, `presence_list/appointments/${id}`));
      showToast('Compromisso excluído!');
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'presente': return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
      case 'folga': return 'bg-amber-950 text-amber-300 border-amber-500/40';
      case 'ferias': return 'bg-blue-950 text-blue-300 border-blue-500/40';
      case 'atestado': return 'bg-rose-950 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-50 p-3.5 rounded-2xl bg-[#B32025] text-white font-sans text-xs font-bold text-center shadow-2xl border border-white/20"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE SEGMENTED CONTROL */}
      <div className="sticky top-0 z-30 bg-[#160a04]/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-white/10">
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setSubTab('escala')}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
              subTab === 'escala'
                ? "bg-[#B32025] text-white shadow-md"
                : "text-[#c2a67e] hover:text-white"
            )}
          >
            <Users size={13} />
            <span>Escala 12x36</span>
          </button>
          <button
            onClick={() => setSubTab('agenda')}
            className={cn(
              "flex-1 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
              subTab === 'agenda'
                ? "bg-amber-600 text-white shadow-md"
                : "text-[#c2a67e] hover:text-white"
            )}
          >
            <Calendar size={13} />
            <span>Agenda</span>
            {appointments.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black/50 text-[9px] font-mono flex items-center justify-center text-amber-200">
                {appointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3.5 max-w-full overflow-x-hidden">
        {subTab === 'escala' ? (
          <>
            {/* CURRENT SHIFT STATUS CARD */}
            <div className="w-full rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#261308] to-[#1a0c05] border border-amber-500/30 p-4 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-amber-400 block mb-0.5">
                  Turno em Andamento
                </span>
                <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
                  <Sun size={16} className="text-amber-400" />
                  <span>Turno Diurno (06h - 18h)</span>
                </h3>
                <p className="text-xs text-[#c2a67e] mt-1">
                  Escala A: Plantão Ativo • Escala B: Folga
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-mono font-bold text-xs">
                12x36
              </div>
            </div>

            {/* TEAM MEMBERS LIST */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#c2a67e] px-1">
                Integrantes da Equipe ({members.length})
              </h4>

              {members.map((member) => (
                <div
                  key={member.id}
                  className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-sans font-black text-white uppercase truncate">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-[#c2a67e] mt-0.5">
                        {member.role}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider border cursor-pointer active:scale-95 transition-transform",
                        getStatusColor(member.status)
                      )}
                    >
                      {member.status}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c2a67e]">
                      {member.shift === 'dia' ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-blue-400" />}
                      <span>Turno {member.shift.toUpperCase()}</span>
                    </div>

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600/30 text-emerald-200 text-[10px] font-sans font-bold flex items-center gap-1 border border-emerald-500/30"
                      >
                        <Phone size={11} />
                        <span>Ligar</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* TAB AGENDA */
          <>
            <button
              onClick={() => setShowAppModal(true)}
              className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-amber-400/30 active:scale-97 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Novo Compromisso na Agenda</span>
            </button>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-[#160a04] border border-white/10">
                  <Calendar size={32} className="mx-auto mb-2 text-[#c2a67e]/40" />
                  <p className="text-sm font-sans font-bold text-white">Nenhum compromisso agendado</p>
                  <p className="text-xs text-[#c2a67e]/70 mt-1">
                    Toque no botão acima para criar uma nova tarefa.
                  </p>
                </div>
              ) : (
                appointments.map((app) => (
                  <div
                    key={app.id}
                    className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-black/50 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                          {app.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-mono font-bold text-white">
                          {app.time}
                        </span>
                      </div>

                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border",
                        app.type === 'corporativo'
                          ? "bg-blue-950 text-blue-300 border-blue-500/30"
                          : "bg-purple-950 text-purple-300 border-purple-500/30"
                      )}>
                        {app.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-sans font-bold text-white mb-3">
                      {app.title}
                    </h4>

                    <div className="flex items-center justify-end pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleDeleteAppointment(app.id)}
                        className="text-xs font-sans font-bold text-rose-400/80 hover:text-rose-300 flex items-center gap-1 p-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL APPOINTMENT */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-[#180c06] border-t-2 border-amber-500/40 rounded-t-[2.5rem] p-5 text-[#f5ebd6] max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-base font-sans font-black uppercase text-white">
                  Novo Compromisso
                </h3>
                <button
                  onClick={() => setShowAppModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Título do Compromisso *
                  </label>
                  <input
                    type="text"
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="Ex: Reunião de Alinhamento de Frota..."
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={appDate}
                      onChange={(e) => setAppDate(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={appTime}
                      onChange={(e) => setAppTime(e.target.value)}
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#c2a67e] block mb-1">
                    Tipo
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as any)}
                    className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 text-xs"
                  >
                    <option value="corporativo">Corporativo / Operação</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-sans font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddAppointment}
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-sans font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Agendar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
