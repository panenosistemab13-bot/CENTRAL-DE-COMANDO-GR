import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  addDays, 
  addMonths,
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  startOfDay,
  endOfDay,
  eachDayOfInterval, 
  isToday,
  parse,
  differenceInMinutes,
  differenceInDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  UserPlus, 
  Clock, 
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users as UsersIcon,
  Download,
  TrendingUp,
  Save,
  Archive,
  Activity,
  Trash2,
  Pencil
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

interface DayShift {
  data: string;
  horaEntrada: string;
  horaSaida: string;
  minutosBancoHoras: number;
  status: 'trabalhei' | 'ferias' | 'folga1' | 'folga2';
  color?: string;
}

interface StatusConfig {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_STATUSES: StatusConfig[] = [
  { id: 'trabalhei', label: 'Trabalhei', color: '#10b981' }, // verde
  { id: 'ferias', label: 'Férias', color: '#3b82f6' }, // azul
  { id: 'folga1', label: 'Folga', color: '#71717a' }, // cinza
  { id: 'folga2', label: 'Folga Extra', color: '#f59e0b' }, // amarelo
];

interface PeriodoFerias {
  id: string;
  dataInicio: string;
  dataTermino: string;
}

interface Lembrete {
  id: string;
  date: string;
  title: string;
  category: string;
}

const EMPLOYEES = [
  { 
    id: 'jefferson', 
    name: 'Jefferson Augusto', 
    role: 'ANALISTA DE RISCO', 
    shift: '18:00 AS 06:00',
    scheduleType: '12x36',
    startShiftDate: new Date(2026, 4, 1), 
    defaultEntrance: '18:00', 
    defaultExit: '06:00',
    avatar: 'https://i.postimg.cc/vHdJXHnf/1000613930.png'
  },
  { 
    id: 'douglas', 
    name: 'Douglas Medeiros', 
    role: 'ANALISTA DE RISCO', 
    shift: '06:00 AS 18:00',
    scheduleType: '12x36',
    startShiftDate: new Date(2026, 4, 2), 
    defaultEntrance: '06:00', 
    defaultExit: '18:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Douglas'
  },
  { 
    id: 'alef', 
    name: 'Alef Junior', 
    role: 'ANALISTA DE RISCO', 
    shift: '08:00 AS 17:00',
    scheduleType: 'mon-fri',
    startShiftDate: new Date(2026, 4, 1), 
    defaultEntrance: '08:00', 
    defaultExit: '17:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alef'
  },
  { 
    id: 'vinicius', 
    name: 'Vinicius Holanda', 
    role: 'ANALISTA DE RISCO', 
    shift: '06:00 AS 18:00',
    scheduleType: '12x36',
    startShiftDate: new Date(2026, 4, 1), 
    defaultEntrance: '06:00', 
    defaultExit: '18:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vinicius'
  },
  { 
    id: 'ulisses', 
    name: 'Ulisses Lima', 
    role: 'ANALISTA DE RISCO', 
    shift: '18:00 AS 06:00',
    scheduleType: '12x36',
    startShiftDate: new Date(2026, 4, 2), 
    defaultEntrance: '18:00', 
    defaultExit: '06:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ulisses'
  },
];

const BRAZILIAN_HOLIDAYS: Record<string, string> = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalhador',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal',
  '2026-02-17': 'Carnaval',
  '2026-04-03': 'Sexta-feira Santa',
  '2026-06-04': 'Corpus Christi',
};

export default function PresenceList() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(EMPLOYEES[0].id);
  const currentEmployee = EMPLOYEES.find(e => e.id === selectedEmployeeId) || EMPLOYEES[0];
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shifts, setShifts] = useState<Record<string, DayShift>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editTimes, setEditTimes] = useState({ 
    entrada: currentEmployee.defaultEntrance, 
    saida: currentEmployee.defaultExit, 
    status: 'trabalhei' as DayShift['status'] 
  });
  const [statusConfigs, setStatusConfigs] = useState<StatusConfig[]>(() => {
    const saved = localStorage.getItem('presence_status_colors');
    return saved ? JSON.parse(saved) : DEFAULT_STATUSES;
  });

  useEffect(() => {
    localStorage.setItem('presence_status_colors', JSON.stringify(statusConfigs));
  }, [statusConfigs]);

  // Ferias State
  const [vacations, setVacations] = useState<PeriodoFerias[]>([]);
  const [vacationModalOpen, setVacationModalOpen] = useState(false);
  const [vacationForm, setVacationForm] = useState({ inicio: '', termino: '' });

  // Lembretes State
  const [reminders, setReminders] = useState<Lembrete[]>([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderCategory, setReminderCategory] = useState('Pessoal');

  const [manualAdjustment, setManualAdjustment] = useState(0);
  const [isEditingBanco, setIsEditingBanco] = useState(false);
  const [tempBancoHours, setTempBancoHours] = useState('0');
  const [tempBancoMins, setTempBancoMins] = useState('0');

  const totalCalculatedMins = Object.values(shifts).reduce((acc: number, shift: any) => acc + (Number(shift.minutosBancoHoras) || 0), 0) as number;
  const totalBancoMins = totalCalculatedMins + manualAdjustment;

  const formatBanco = (mins: number) => {
    const sign = mins >= 0 ? '+' : '-';
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  const handleSaveManualBanco = async () => {
    try {
      const h = parseInt(tempBancoHours) || 0;
      const m = parseInt(tempBancoMins) || 0;
      const total = (h * 60) + (m * (h < 0 ? -1 : 1));
      await set(ref(db, `banco_manual_equipe/${selectedEmployeeId}`), total);
      setManualAdjustment(total);
      setIsEditingBanco(false);
    } catch (err) {
      console.error('Erro ao salvar ajuste manual', err);
    }
  };

  useEffect(() => {
    // Sync Ponto (Shifts)
    const shiftsRef = ref(db, `escalas_equipe/${selectedEmployeeId}`);
    const unPonto = onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      setShifts(data || {});
    });

    // Sync Manual Adjustment
    const manualRef = ref(db, `banco_manual_equipe/${selectedEmployeeId}`);
    const unManual = onValue(manualRef, (snapshot) => {
      const val = snapshot.val() || 0;
      setManualAdjustment(val);
      const abs = Math.abs(val);
      setTempBancoHours((Math.floor(abs / 60) * (val < 0 ? -1 : 1)).toString());
      setTempBancoMins((abs % 60).toString());
    });

    // Reset edit times when employee changes
    setEditTimes({
      entrada: currentEmployee.defaultEntrance,
      saida: currentEmployee.defaultExit,
      status: 'trabalhei' as DayShift['status']
    });

    // Sync Ferias
    const feriasRef = ref(db, `periodos_ferias_equipe/${selectedEmployeeId}`);
    const unFerias = onValue(feriasRef, (snapshot) => {
      const data = snapshot.val();
      const items: PeriodoFerias[] = [];
      if (data) {
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          items.push({ id: key, ...val });
        });
      }
      setVacations(items);
    });

    // Sync Lembretes
    const lembretesRef = ref(db, `lembretes_calendario_equipe/${selectedEmployeeId}`);
    const unLembretes = onValue(lembretesRef, (snapshot) => {
      const data = snapshot.val();
      const items: Lembrete[] = [];
      if (data) {
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          items.push({ id: key, ...val });
        });
      }
      setReminders(items);
    });

    return () => {
      unPonto();
      unManual();
      unFerias();
      unLembretes();
    };
  }, [selectedEmployeeId]);

  const daysInMonthGrid = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(selectedMonth)),
      end: endOfWeek(endOfMonth(selectedMonth))
    });
  }, [selectedMonth]);

  const getHoliday = (day: Date) => {
    const key = format(day, 'MM-dd');
    const fullKey = format(day, 'yyyy-MM-dd');
    return BRAZILIAN_HOLIDAYS[fullKey] || BRAZILIAN_HOLIDAYS[key];
  };

  const holidaysInMonth = useMemo(() => {
    const defaultMonthDays = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });
    return defaultMonthDays
      .map(day => ({ day, name: getHoliday(day) }))
      .filter(h => h.name);
  }, [selectedMonth]);

  const saveShift = async () => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    const saldo = calcularBanco(editTimes.entrada, editTimes.saida);
    try {
      await set(ref(db, `escalas_equipe/${selectedEmployeeId}/${key}`), {
        data: key,
        horaEntrada: editTimes.entrada,
        horaSaida: editTimes.saida,
        minutosBancoHoras: saldo,
        worked: editTimes.status === 'trabalhei',
        status: editTimes.status
      });
      setModalOpen(false);
    } catch(err) {
      console.error('Erro salvando ponto no RTDB', err);
    }
  };

  const calcularBanco = (entrada: string, saida: string): number => {
    if (!entrada || !saida) return 0;
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    let start = parseTime(entrada);
    let end = parseTime(saida);
    let duration = end - start;
    if (duration < 0) duration += 1440; // Crossed midnight
    return duration - 720; // 12 hours base
  };

  const isOnShift = (startDate: Date, targetDate: Date, scheduleType?: string) => {
    if (scheduleType === 'mon-fri') {
      const dayOfWeek = targetDate.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Seg a Sex
    }
    const diffDays = differenceInDays(startOfDay(targetDate), startOfDay(startDate));
    return Math.abs(diffDays) % 2 === 0;
  };

  const isDayOnVacation = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return vacations.some(v => dayStr >= v.dataInicio && dayStr <= v.dataTermino);
  };

  const saveVacation = async () => {
    if (!vacationForm.inicio || !vacationForm.termino) return;
    try {
      const newRef = push(ref(db, `periodos_ferias_equipe/${selectedEmployeeId}`));
      await set(newRef, {
        dataInicio: vacationForm.inicio,
        dataTermino: vacationForm.termino
      });
      setVacationModalOpen(false);
      setVacationForm({ inicio: '', termino: '' });
    } catch (err) {
      console.error('Erro salvando ferias no RTDB', err);
    }
  };

  const saveReminder = async () => {
    if (!reminderTitle.trim()) return;
    const key = format(selectedDate, 'yyyy-MM-dd');
    try {
      const newRef = push(ref(db, `lembretes_calendario_equipe/${selectedEmployeeId}`));
      await set(newRef, {
        date: key,
        title: reminderTitle,
        category: reminderCategory
      });
      setReminderTitle('');
    } catch (err) {
      console.error('Erro salvando lembrete no RTDB', err);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await remove(ref(db, `lembretes_calendario_equipe/${selectedEmployeeId}/${id}`));
    } catch (err) {
      console.error('Erro ao deletar lembrete no RTDB', err);
    }
  };

  const currentReminders = reminders.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd'));

  const handleDayClick = (day: Date, isScale: boolean, shift: DayShift | undefined, isOnVacation: boolean) => {
    setSelectedDate(day);
    setEditTimes({
      entrada: shift?.horaEntrada || currentEmployee.defaultEntrance,
      saida: shift?.horaSaida || currentEmployee.defaultExit,
      status: shift?.status || (isOnVacation ? 'ferias' : isScale ? 'trabalhei' : 'folga1')
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Employee Selection Bar */}
      <div className="bg-[#0b0d19] border border-white/5 rounded-3xl p-2 flex flex-wrap gap-2">
        {EMPLOYEES.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmployeeId(emp.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all border",
              selectedEmployeeId === emp.id 
                ? "bg-primary/20 border-primary/40 text-white" 
                : "bg-transparent border-transparent text-slate-500 hover:bg-white/5"
            )}
          >
            <img src={emp.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-tight">{emp.name}</span>
              <span className="text-[8px] font-mono opacity-50">{emp.shift}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Header / Profile Summary */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0b0d19] border border-white/5 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <img 
                src={currentEmployee.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-3xl border-2 border-primary/30 object-cover relative z-10" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{currentEmployee.name}</h1>
              <p className="text-primary/70 font-mono text-xs font-bold uppercase tracking-widest mt-1">{currentEmployee.role}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center min-w-[120px] relative group">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Banco de Horas</span>
                  {isEditingBanco ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-600 uppercase ml-1">Horas</span>
                          <input 
                            type="number"
                            value={tempBancoHours}
                            onChange={(e) => setTempBancoHours(e.target.value)}
                            className="w-14 bg-black/40 border border-primary/30 rounded px-2 py-1 text-xs text-white font-black"
                            autoFocus
                          />
                        </div>
                        <span className="text-white pt-3">:</span>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-600 uppercase ml-1">Minutos</span>
                          <input 
                            type="number"
                            value={tempBancoMins}
                            onChange={(e) => setTempBancoMins(e.target.value)}
                            className="w-14 bg-black/40 border border-primary/30 rounded px-2 py-1 text-xs text-white font-black"
                          />
                        </div>
                        <button 
                          onClick={handleSaveManualBanco}
                          className="mt-3 p-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className={cn("text-xl font-black tabular-nums", totalBancoMins >= 0 ? "text-emerald-400" : "text-amber-400")}>
                        {formatBanco(totalBancoMins)}
                      </span>
                      <button 
                        onClick={() => setIsEditingBanco(true)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-white/5 text-zinc-500 rounded hover:text-white transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                  <div className="absolute -bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase">Ajuste Manual: {formatBanco(manualAdjustment)}</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Status Hoje</span>
                  <span className={cn(
                    "text-sm font-bold uppercase mt-1",
                    (() => {
                      const today = new Date();
                      const dayKey = format(today, 'yyyy-MM-dd');
                      const shift = shifts[dayKey];
                      if (isDayOnVacation(today)) return "text-blue-400";
                      if (shift?.status === 'trabalhei') return "text-emerald-400";
                      if (shift?.status === 'folga1' || shift?.status === 'folga2') return "text-zinc-500";
                      return isOnShift(currentEmployee.startShiftDate, today, (currentEmployee as any).scheduleType) ? "text-amber-400" : "text-zinc-500";
                    })()
                  )}>
                    {(() => {
                      const today = new Date();
                      const dayKey = format(today, 'yyyy-MM-dd');
                      const shift = shifts[dayKey];
                      if (isDayOnVacation(today)) return 'Férias';
                      if (shift) return shift.status === 'trabalhei' ? 'Em Turno' : 'Folga';
                      return isOnShift(currentEmployee.startShiftDate, today, (currentEmployee as any).scheduleType) ? 'Escala' : 'Folga';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Color Configurator */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Save size={12} /> Configurar Legenda
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {statusConfigs.map((config, idx) => (
                <div key={config.id} className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={config.color}
                    onChange={(e) => {
                      const newConfigs = [...statusConfigs];
                      newConfigs[idx].color = e.target.value;
                      setStatusConfigs(newConfigs);
                    }}
                    className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0 p-0"
                  />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar and Details */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Modern Custom Calendar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#0b0d19] rounded-[2.5rem] border border-white/5 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black text-white capitalize font-mono">
                {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <button 
                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysInMonthGrid.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, selectedMonth);
                const dayKey = format(day, 'yyyy-MM-dd');
                const isOnVacation = isDayOnVacation(day);
                const shift = shifts[dayKey];
                const isScale = isOnShift(currentEmployee.startShiftDate, day, (currentEmployee as any).scheduleType);

                if (!isCurrentMonth) return <div key={day.toISOString()} className="h-12 opacity-0" />;

                // Find status color
                let statusColor = '';
                if (shift?.status) {
                  statusColor = statusConfigs.find(c => c.id === shift.status)?.color || '';
                } else if (isOnVacation) {
                  statusColor = statusConfigs.find(c => c.id === 'ferias')?.color || '';
                } else if (isScale) {
                  statusColor = statusConfigs.find(c => c.id === 'trabalhei')?.color || '';
                } else {
                  statusColor = 'transparent';
                }

                return (
                  <motion.div
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayClick(day, isScale, shift, isOnVacation)}
                    className={cn(
                      "relative h-14 flex items-center justify-center rounded-2xl cursor-pointer transition-all border group",
                      isSelected ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "border-white/5 hover:bg-white/5"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected ? "text-white" : isToday(day) ? "text-primary" : "text-zinc-500"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Status Indicator Bar */}
                    <div 
                      className="absolute bottom-1.5 left-1.5 right-1.5 h-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: statusColor }}
                    />

                    {/* Reminder Dot */}
                    {reminders.some(r => r.date === dayKey) && (
                      <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => setVacationModalOpen(true)}
                className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Planejar Férias
              </button>
            </div>
          </div>
        </div>

        {/* Selected Date View */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#0b0d19] rounded-[2.5rem] border border-white/5 p-8 shadow-xl min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-8">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h2>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">Registros de Atividade</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2"
                >
                  <Clock size={16} /> Lançar Ponto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Day Status Summary */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} /> Resumo do Dia
                </h4>
                
                <div className="space-y-4">
                  {isDayOnVacation(selectedDate) ? (
                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Archive size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Status: Férias</span>
                        <p className="text-white font-bold opacity-90">Período de descanso programado.</p>
                      </div>
                    </div>
                  ) : shifts[format(selectedDate, 'yyyy-MM-dd')] ? (
                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            shifts[format(selectedDate, 'yyyy-MM-dd')].worked ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-500"
                          )}>
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Status: Turno Concluído</span>
                            <p className="text-white font-bold">{shifts[format(selectedDate, 'yyyy-MM-dd')].status === 'trabalhei' ? currentEmployee.name : 'Folga Registrada'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">Entrada</span>
                          <span className="text-sm font-bold text-white">{shifts[format(selectedDate, 'yyyy-MM-dd')].horaEntrada}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">Saída</span>
                          <span className="text-sm font-bold text-white">{shifts[format(selectedDate, 'yyyy-MM-dd')].horaSaida}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">Saldo</span>
                          <span className={cn("text-sm font-black", shifts[format(selectedDate, 'yyyy-MM-dd')].minutosBancoHoras >= 0 ? "text-emerald-400" : "text-amber-400")}>
                            {formatBanco(shifts[format(selectedDate, 'yyyy-MM-dd')].minutosBancoHoras)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-600">
                        <Clock3 size={24} />
                      </div>
                      <div>
                        {isOnShift(currentEmployee.startShiftDate, selectedDate, (currentEmployee as any).scheduleType) ? (
                          <>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Status: Pendente</span>
                            <p className="text-white font-bold opacity-60">Escala ativa - lançamento aguardando.</p>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status: Folga</span>
                            <p className="text-white font-bold opacity-40">Dia de descanso programado.</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders / Commitments */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CalendarIcon size={14} /> Compromissos & Lembretes
                </h4>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="Adicionar compromisso..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                  />
                  <button 
                    onClick={saveReminder}
                    className="p-3 bg-primary/20 text-primary hover:bg-primary/30 rounded-2xl transition-all"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {currentReminders.length === 0 ? (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-zinc-600 font-mono uppercase tracking-widest text-center py-10"
                      >
                        Nenhum compromisso agendado
                      </motion.p>
                    ) : (
                      currentReminders.map(rem => (
                        <motion.div 
                          key={rem.id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          className="group flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-sm font-bold text-white/90">{rem.title}</span>
                          </div>
                          <button 
                            onClick={() => deleteReminder(rem.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0b0d19] border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Lançamento de Ponto</h2>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Entrada</label>
                        <input 
                          type="time" 
                          value={editTimes.entrada}
                          onChange={(e) => setEditTimes(prev => ({ ...prev, entrada: e.target.value }))}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-white font-mono text-xl focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Saída</label>
                        <input 
                          type="time" 
                          value={editTimes.saida}
                          onChange={(e) => setEditTimes(prev => ({ ...prev, saida: e.target.value }))}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-white font-mono text-xl focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Status do Dia</label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusConfigs.map(config => (
                        <button
                          key={config.id}
                          onClick={() => setEditTimes(prev => ({ ...prev, status: config.id as any }))}
                          className={cn(
                            "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            editTimes.status === config.id 
                              ? "bg-white/10 border-white/20 text-white" 
                              : "bg-transparent border-white/5 text-zinc-500 hover:border-white/10"
                          )}
                          style={{ borderColor: editTimes.status === config.id ? config.color : '' }}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Saldo Previsto</span>
                  <span className="text-xl font-black text-white tabular-nums">
                    {formatBanco(calcularBanco(editTimes.entrada, editTimes.saida))}
                  </span>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={saveShift}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all"
                  >
                    Salvar Registro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Férias Modal */}
        {vacationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setVacationModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0b0d19] border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="relative z-10 space-y-6 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto">
                  <Archive size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Programar Férias</h2>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Controle de Descanso Anual</p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Início</label>
                    <input 
                      type="date" 
                      value={vacationForm.inicio}
                      onChange={(e) => setVacationForm(prev => ({ ...prev, inicio: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Término</label>
                    <input 
                      type="date" 
                      value={vacationForm.termino}
                      onChange={(e) => setVacationForm(prev => ({ ...prev, termino: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={saveVacation}
                  disabled={!vacationForm.inicio || !vacationForm.termino}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50"
                >
                  Confirmar Férias
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
