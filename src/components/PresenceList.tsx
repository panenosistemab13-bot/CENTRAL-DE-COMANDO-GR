import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Coffee, 
  Users,
  ChevronUp,
  Heart,
  Calendar,
  Camera,
  LayoutGrid,
  Briefcase,
  User,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Eye,
  MoreVertical,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import heroPresence from '../assets/images/hero_cinematic_presence_1790216237869.jpg';
import cardChecklist from '../assets/images/card_cinematic_check_1790214967098.jpg';
import MasterModulePage, { MasterRecord, MercosulPlate } from './MasterModulePage';

const DEFAULT_PRESENCE_RECORDS: MasterRecord[] = [
  {
    id: 'pres-1',
    itemImage: cardChecklist,
    itemTitle: 'Cleber Ribeiro',
    itemSubtitle: 'Turno A (06:00 - 18:00)',
    plate: 'POD-4461',
    secondaryPlate: 'SBM-1234',
    personName: 'Cleber Ribeiro',
    personRole: 'Motorista Líder 3C',
    categoryTag: 'Presente',
    progressValue: 100,
    progressText: 'No Pátio',
    status: 'concluido',
    statusLabel: 'Presente',
    timestamp: '23/09/2026 05:48'
  },
  {
    id: 'pres-2',
    itemImage: cardChecklist,
    itemTitle: 'Guilherme Santos',
    itemSubtitle: 'Turno B (14:00 - 22:00)',
    plate: 'QWK6A22',
    secondaryPlate: 'OLN7307',
    personName: 'Guilherme Santos',
    personRole: 'Motorista Frota',
    categoryTag: 'Presente',
    progressValue: 100,
    progressText: 'No Pátio',
    status: 'concluido',
    statusLabel: 'Presente',
    timestamp: '23/09/2026 13:52'
  },
  {
    id: 'pres-3',
    itemImage: cardChecklist,
    itemTitle: 'Marcelo Castro',
    itemSubtitle: 'Turno C (22:00 - 06:00)',
    plate: 'POD-8255',
    secondaryPlate: 'FIW0188',
    personName: 'Marcelo Castro',
    personRole: 'Motorista Substituto',
    categoryTag: 'Aguardando',
    progressValue: 0,
    progressText: 'A Caminho',
    status: 'pendente',
    statusLabel: 'Pendente',
    timestamp: '23/09/2026 --:--'
  }
];

function TechCorner({ className }: { className?: string }) {
  return null;
}

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

  const formatLocalDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} - ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [profileImage, setProfileImage] = useState('/images/avatar.jpg');
  const [viewDate, setViewDate] = useState<Date>(() => {
    return new Date();
  });

  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, { entrada: string; saida: string }>>({});
  const [escalaConfig, setEscalaConfig] = useState<{ enabled: boolean; startDate: string }>({
    enabled: true,
    startDate: '2026-06-14',
  });
  const [bancoHorasManual, setBancoHorasManual] = useState<number>(0);
  const [isEditingBankCard, setIsEditingBankCard] = useState(false);
  const [tempHours, setTempHours] = useState('');
  const [tempMins, setTempMins] = useState('');

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppTime, setNewAppTime] = useState('12:00');
  const [newAppType, setNewAppType] = useState<'pessoal' | 'corporativo'>('corporativo');
  const [showAllAppsDropdown, setShowAllAppsDropdown] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listFilter, setListFilter] = useState<'all' | 'concluido' | 'pendente' | 'em_atraso'>('all');

  // Mobile navigation state
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [mobileTab, setMobileTab] = useState<'calendario' | 'agenda'>('calendario');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal para Agendar Lembrete ao Clicar em um Dia do Calendário
  const [showDayReminderModal, setShowDayReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderType, setReminderType] = useState<'pessoal' | 'corporativo'>('corporativo');

  useEffect(() => {
    const presenceRef = ref(db, 'presence_list');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.statuses) setDayStatuses(data.statuses);
        if (data.times) setDayTimes(data.times);
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.escalaConfig) {
          setEscalaConfig(data.escalaConfig);
        }
        if (data.bancoHorasManual !== undefined && typeof data.bancoHorasManual === 'number') {
          setBancoHorasManual(data.bancoHorasManual);
        }
        if (data.appointments) {
          setAppointments(data.appointments);
        } else {
          setAppointments({});
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const updateEscalaConfig = (config: { enabled: boolean; startDate: string }) => {
    setEscalaConfig(config);
    set(ref(db, 'presence_list/escalaConfig'), config);
  };

  const updateBancoHorasManual = (minutes: number) => {
    setBancoHorasManual(minutes);
    set(ref(db, 'presence_list/bancoHorasManual'), minutes);
  };

  const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
    if (!dateStr1 || !dateStr2) return 0;
    const d1 = new Date(dateStr1 + 'T12:00:00');
    const d2 = new Date(dateStr2 + 'T12:00:00');
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const isAutomaticWorkDay = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const isEnabled = escalaConfig.enabled !== false;
    if (!isEnabled) return false;
    const refDate = escalaConfig.startDate || '2026-06-14';
    const diff = getDaysDifference(dateStr, refDate);
    return Math.abs(diff) % 2 === 0;
  };

  const updateStatus = (date: string, status: 'trabalhei' | 'falta' | 'folga' | '') => {
    setDayStatuses(prev => ({ ...prev, [date]: status }));
    update(ref(db, 'presence_list/statuses'), { [date]: status });
  };

  const updateTime = (date: string, times: { entrada: string; saida: string }) => {
    setDayTimes(prev => ({ ...prev, [date]: times }));
    update(ref(db, 'presence_list/times'), { [date]: times });
  };

  const updateProfileImage = (url: string) => {
    setProfileImage(url);
    set(ref(db, 'presence_list/profileImage'), url);
  };

  const addAppointment = (time: string, title: string, type: 'pessoal' | 'corporativo') => {
    if (!title.trim() || !time) return;
    const id = `app_${Date.now()}`;
    const newApp: Appointment = { id, date: selectedDate, time, title, type };
    update(ref(db, `presence_list/appointments`), { [id]: newApp });
    setNewAppTitle('');
  };

  const addAppointmentForTargetDate = (targetDate: string, time: string, title: string, type: 'pessoal' | 'corporativo') => {
    if (!title.trim() || !time || !targetDate) return;
    const id = `app_${Date.now()}`;
    const newApp: Appointment = { id, date: targetDate, time, title, type };
    update(ref(db, `presence_list/appointments`), { [id]: newApp });
  };

  const deleteAppointment = (id: string) => {
    update(ref(db, `presence_list/appointments`), { [id]: null });
  };

  // Convert time "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  // Convert minutes back to pretty string representation
  const formatBalanceMinutes = (totalMinutes: number): string => {
    const sign = totalMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(totalMinutes);
    const hrs = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${sign}${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  // Calculate day bank-of-hours balance based on rules
  const calculateDayBalance = (dateStr: string, status: string, entradaStr: string, saidaStr: string) => {
    if (status !== 'trabalhei') {
      return { total: 0, entradaDiff: 0, saidaDiff: 0, entradaStatus: 'none', saidaStatus: 'none' as 'none' | 'positivo' | 'negativo' };
    }

    const entrada = entradaStr || '18:00';
    const saida = saidaStr || '06:00';

    const entMin = timeToMinutes(entrada);
    const saiMin = timeToMinutes(saida);

    const targetEntMin = 18 * 60; // 1080 min (18:00)
    const targetSaiMin = 6 * 60;  // 360 min (06:00)

    let entradaDiff = 0;
    let entradaStatus: 'positivo' | 'negativo' | 'none' = 'none';

    let saidaDiff = 0;
    let saidaStatus: 'positivo' | 'negativo' | 'none' = 'none';

    // Rule 1: "se eu bater ponto antes das 18:06 irar negativo para o banco de horas"
    // Rule 4: "se eu bater ponto antes 17:54 irar positivo para o banco de horas"
    if (entMin < 17 * 60 + 54) { // Before 17:54 (early arrival)
      entradaDiff = targetEntMin - entMin; // Extra early minutes
      entradaStatus = 'positivo';
    } else if (entMin < 18 * 60 + 6) { // Between 17:54 and 18:06 (late/regular window)
      if (entMin < targetEntMin) {
        // Handled as penalty for not arriving sufficiently early, as requested
        entradaDiff = -10; 
      } else {
        // Late arrival
        entradaDiff = targetEntMin - entMin;
      }
      entradaStatus = 'negativo';
    } else {
      // Arrived after 18:06 (Definitely late)
      entradaDiff = targetEntMin - entMin;
      entradaStatus = 'negativo';
    }

    // Rule 2: "se eu bater ponto antes 05:56 irar negativo para o banco de horas"
    // Rule 3: "se eu bater ponto antes 06:06 irar positivo para o banco de horas"
    if (saiMin < 5 * 60 + 56) { // Before 05:56
      saidaDiff = saiMin - targetSaiMin; // Left early (negative)
      saidaStatus = 'negativo';
    } else if (saiMin < 6 * 60 + 6) { // Between 05:56 and 06:06 (positive zone)
      if (saiMin < targetSaiMin) {
        saidaDiff = 5; // Positive incentive bonus
      } else {
        saidaDiff = saiMin - targetSaiMin; // Overtime
      }
      saidaStatus = 'positivo';
    } else {
      // After 06:06 (standard positive overtime)
      saidaDiff = saiMin - targetSaiMin;
      saidaStatus = 'positivo';
    }

    return {
      total: entradaDiff + saidaDiff,
      entradaDiff,
      saidaDiff,
      entradaStatus,
      saidaStatus
    };
  };

  const calculateTotalBankOfHours = () => {
    let total = 0;
    Object.keys(dayStatuses).forEach(dateStr => {
      if (dayStatuses[dateStr] === 'trabalhei') {
        const times = dayTimes[dateStr] || { entrada: '18:00', saida: '06:00' };
        const bal = calculateDayBalance(dateStr, 'trabalhei', times.entrada, times.saida);
        total += bal.total;
      }
    });
    return total + (bancoHorasManual || 0);
  };

  const totalBankOfHours = calculateTotalBankOfHours();

  const getActiveMonthStats = () => {
    let presentes = 0;
    let faltas = 0;
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;

    Object.keys(dayStatuses).forEach(dateStr => {
      if (dateStr.startsWith(prefix)) {
        if (dayStatuses[dateStr] === 'trabalhei') presentes++;
        if (dayStatuses[dateStr] === 'falta') faltas++;
      }
    });

    return { presentes, faltas };
  };

  const { presentes, faltas } = getActiveMonthStats();

  // viewDate state moved to the top of component to resolve initialization order conflicts

  const getHolidayForDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const mmdd = `${parts[1]}-${parts[2]}`;

    const annualHolidays: { [key: string]: string } = {
      '01-01': 'Confraternização Universal',
      '04-21': 'Tiradentes',
      '05-01': 'Dia do Trabalho',
      '09-07': 'Independência do Brasil',
      '10-12': 'Nossa Senhora Aparecida',
      '11-02': 'Finados',
      '11-15': 'Proclamação da República',
      '11-20': 'Dia da Consciência Negra',
      '12-25': 'Natal'
    };

    const specificHolidays: { [key: string]: string } = {
      '2026-06-04': 'Corpus Christi',
      '2025-06-19': 'Corpus Christi',
      '2027-05-27': 'Corpus Christi'
    };

    if (specificHolidays[dateStr]) {
      return { date: dateStr, name: specificHolidays[dateStr] };
    }
    if (annualHolidays[mmdd]) {
      return { date: dateStr, name: annualHolidays[mmdd] };
    }
    return null;
  };

  const currentHoliday = getHolidayForDate(selectedDate);
  const isHoliday = !!currentHoliday;

  const currentStatus = dayStatuses[selectedDate] || '';
  const isSelectedWorkDay = currentStatus === 'trabalhei';

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Generate dynamic calendar days grid for any selected month/year
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { day: number; inactive?: boolean; dateStr: string }[] = [];

    // Fill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      const prevMonthDate = new Date(year, month - 1, prevDay);
      const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
      days.push({
        day: prevDay,
        inactive: true,
        dateStr
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr
      });
    }

    // Fill next month days to make grid have standard size (35 or 42 cells)
    const totalCellsNeeded = days.length <= 35 ? 35 : 42;
    const remaining = totalCellsNeeded - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
      days.push({
        day: i,
        inactive: true,
        dateStr
      });
    }

    const weeks: { day: number; inactive?: boolean; dateStr: string }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  const currentMonthLabel = `${monthNames[viewDate.getMonth()]} / ${viewDate.getFullYear()}`;

  const getHolidaysForView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const list: { date: string; name: string }[] = [];
    
    const totalDays = new Date(year, month, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const holiday = getHolidayForDate(dateStr);
      if (holiday) {
        list.push(holiday);
      }
    }
    
    if (list.length === 0) {
      return [
        { date: `${year}-01-01`, name: 'Confraternização Universal' },
        { date: `${year}-05-01`, name: 'Dia do Trabalho' },
        { date: `${year}-09-07`, name: 'Independência do Brasil' },
        { date: `${year}-12-25`, name: 'Natal' }
      ];
    }
    return list;
  };

  const activeHolidaysList = getHolidaysForView();

  const allAppointments = (Object.values(appointments || {}) as Appointment[])
    .filter(app => app && app.date)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="w-full relative pb-8 space-y-4 text-stone-900 font-sans animate-fade-in">
      
      {/* ================= TOP MODULE HEADER ================= */}
      <div className="bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#9b1526] text-white rounded-xl shadow-xs shrink-0">
            <Users size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9b1526]">
                // ESCALA 12x36 & CONTROLE DE PONTO
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tempo Real
              </span>
            </div>
            <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase leading-tight mt-0.5">
              Lista de Presença & Banco de Horas
            </h2>
          </div>
        </div>

        {/* Month Navigator & Quick KPIs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Switcher */}
          <div className="flex items-center bg-white border border-[#d6ccbe] rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-mono font-bold uppercase tracking-wider text-stone-900 min-w-[150px] text-center">
              {currentMonthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* KPI Badges */}
          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#d6ccbe] px-3 py-1.5 rounded-xl shadow-2xs text-center">
              <span className="text-[9px] font-mono font-bold text-stone-500 uppercase block leading-none">Dias Trabalhados</span>
              <span className="text-xs font-mono font-black text-emerald-700 mt-0.5 block">{presentes} dias</span>
            </div>
            <div className="bg-white border border-[#d6ccbe] px-3 py-1.5 rounded-xl shadow-2xs text-center">
              <span className="text-[9px] font-mono font-bold text-stone-500 uppercase block leading-none">Faltas</span>
              <span className="text-xs font-mono font-black text-rose-700 mt-0.5 block">{faltas} dias</span>
            </div>
            <div className={cn(
              "border px-3 py-1.5 rounded-xl shadow-2xs text-center",
              totalBankOfHours >= 0 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            )}>
              <span className="text-[9px] font-mono font-bold opacity-80 uppercase block leading-none">Saldo Banco</span>
              <span className="text-xs font-mono font-black mt-0.5 block">{formatBalanceMinutes(totalBankOfHours)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN OPERATIONAL GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ================= LEFT COLUMN: CALENDAR & DIÁRIO (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* ================= CALENDAR CARD (MATCHING REFERENCE EXACTLY) ================= */}
          <div className="bg-[#fffcf7] border border-[#e4d7c5] rounded-3xl shadow-md overflow-hidden font-sans">
            
            {/* Dark Espresso Brown Header */}
            <div className="bg-[#221712] px-6 py-4 flex items-center justify-between text-white select-none">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-stone-300 hover:text-white transition-colors cursor-pointer rounded-lg"
                title="Mês Anterior"
              >
                <ChevronLeft size={20} className="stroke-[2.5]" />
              </button>
              
              <h3 className="text-sm sm:text-base font-black tracking-[0.18em] uppercase font-sans text-white">
                {currentMonthLabel}
              </h3>
              
              <button
                onClick={handleNextMonth}
                className="p-1 text-stone-300 hover:text-white transition-colors cursor-pointer rounded-lg"
                title="Próximo Mês"
              >
                <ChevronRight size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Calendar Body */}
            <div className="p-4 sm:p-6 select-none">
              
              {/* Day of Week Headers (Caramel / Warm Golden Brown) */}
              <div className="grid grid-cols-7 text-center mb-4">
                {daysOfWeek.map((dayName, idx) => (
                  <div 
                    key={idx} 
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#a87442]"
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Weeks & Days Grid */}
              <div className="space-y-3 sm:space-y-4">
                {calendarDays.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 text-center items-center">
                    {week.map((dayObj, dayIdx) => {
                      const isSelected = dayObj.dateStr === selectedDate;
                      const status = dayStatuses[dayObj.dateStr] || (isAutomaticWorkDay(dayObj.dateStr) ? 'trabalhei' : 'folga');
                      const holiday = getHolidayForDate(dayObj.dateStr);
                      const dayApps = (Object.values(appointments || {}) as Appointment[]).filter(a => a && a.date === dayObj.dateStr);
                      const isWorkDay = status === 'trabalhei';
                      const isFalta = status === 'falta';

                      return (
                        <div
                          key={dayIdx}
                          onClick={() => setSelectedDate(dayObj.dateStr)}
                          onDoubleClick={() => {
                            setSelectedDate(dayObj.dateStr);
                            setShowDayReminderModal(true);
                          }}
                          className="flex flex-col items-center justify-center cursor-pointer group relative py-1"
                        >
                          {/* Day Number inside Circle (if selected) or standalone */}
                          <div className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded-full transition-all relative",
                            isSelected
                              ? "border-2 border-[#bfa074] bg-[#f8f2e6]/60 shadow-xs"
                              : "hover:bg-[#f5ecdd]/50"
                          )}>
                            <span className={cn(
                              "text-sm sm:text-base leading-none font-bold",
                              dayObj.inactive 
                                ? "text-stone-300 font-normal" 
                                : isSelected 
                                  ? "text-[#221712] font-black" 
                                  : "text-[#221712]"
                            )}>
                              {dayObj.day}
                            </span>

                            {/* Green Turquoise Underline for Plantão / 12x36 Work Day */}
                            {!dayObj.inactive && (
                              <div className="h-[4px] mt-0.5 flex items-center justify-center">
                                {isWorkDay && (
                                  <span className="w-4 sm:w-5 h-[3px] bg-[#10b981] rounded-full shadow-2xs" />
                                )}
                                {isFalta && (
                                  <span className="w-4 sm:w-5 h-[3px] bg-[#ef4444] rounded-full shadow-2xs" />
                                )}
                              </div>
                            )}

                            {/* Indicator dot for appointment / holiday */}
                            {!dayObj.inactive && (dayApps.length > 0 || holiday) && (
                              <span className={cn(
                                "absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full",
                                holiday ? "bg-blue-600" : "bg-[#9b1526]"
                              )} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Subtle Legend Bar at bottom */}
              <div className="mt-6 pt-4 border-t border-[#ede3d3] flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono font-bold text-stone-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-4 h-[3px] bg-[#10b981] rounded-full inline-block" /> Plantão 12x36
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-3 h-3 rounded-full border-2 border-[#bfa074] inline-block" /> Dia Selecionado
                  </span>
                </div>
                <span className="text-stone-400">
                  Clique para registrar • Duplo clique para lembrete
                </span>
              </div>

            </div>
          </div>

          {/* Selected Date Work & Time Details Card */}
          <div className="bg-white border border-[#d6ccbe] rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#fbf9f5] border border-[#d6ccbe] text-stone-900 rounded-xl">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-stone-900">
                    Registro do Dia: {formatLocalDate(selectedDate)}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Gerencie o status de trabalho, horário de entrada/saída e banco de horas
                  </p>
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center gap-1 bg-[#fbf9f5] border border-[#d6ccbe] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => updateStatus(selectedDate, 'trabalhei')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1",
                    (dayStatuses[selectedDate] === 'trabalhei' || (!dayStatuses[selectedDate] && isAutomaticWorkDay(selectedDate)))
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  )}
                >
                  Trabalhei
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selectedDate, 'folga')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1",
                    (dayStatuses[selectedDate] === 'folga' || (!dayStatuses[selectedDate] && !isAutomaticWorkDay(selectedDate)))
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  )}
                >
                  Folga
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selectedDate, 'falta')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1",
                    dayStatuses[selectedDate] === 'falta'
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  )}
                >
                  Falta
                </button>
              </div>
            </div>

            {/* Time Entries and Daily Calculation */}
            {isSelectedWorkDay || (!dayStatuses[selectedDate] && isAutomaticWorkDay(selectedDate)) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-[#fbf9f5] border border-[#d6ccbe] p-3.5 rounded-xl">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Horário Entrada
                  </label>
                  <input
                    type="time"
                    value={dayTimes[selectedDate]?.entrada || '18:00'}
                    onChange={(e) => updateTime(selectedDate, {
                      entrada: e.target.value,
                      saida: dayTimes[selectedDate]?.saida || '06:00'
                    })}
                    className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-600 shadow-2xs"
                  />
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5 block">Alvo oficial: 18:00</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Horário Saída
                  </label>
                  <input
                    type="time"
                    value={dayTimes[selectedDate]?.saida || '06:00'}
                    onChange={(e) => updateTime(selectedDate, {
                      entrada: dayTimes[selectedDate]?.entrada || '18:00',
                      saida: e.target.value
                    })}
                    className="w-full bg-white border border-[#d6ccbe] rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-600 shadow-2xs"
                  />
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5 block">Alvo oficial: 06:00</span>
                </div>

                {/* Day Balance Summary */}
                {(() => {
                  const times = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                  const dayBal = calculateDayBalance(selectedDate, 'trabalhei', times.entrada, times.saida);
                  return (
                    <div className="bg-white border border-[#d6ccbe] p-3 rounded-lg text-center shadow-2xs">
                      <span className="text-[9px] font-mono font-bold text-stone-500 uppercase block leading-none">
                        Impacto no Banco do Dia
                      </span>
                      <span className={cn(
                        "text-base font-mono font-black mt-1 block",
                        dayBal.total >= 0 ? "text-emerald-700" : "text-rose-700"
                      )}>
                        {formatBalanceMinutes(dayBal.total)}
                      </span>
                      <span className="text-[8.5px] font-mono text-stone-400 block mt-0.5">
                        Entrada: {dayBal.entradaDiff >= 0 ? `+${dayBal.entradaDiff}m` : `${dayBal.entradaDiff}m`} | Saída: {dayBal.saidaDiff >= 0 ? `+${dayBal.saidaDiff}m` : `${dayBal.saidaDiff}m`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-4 bg-[#fbf9f5] border border-dashed border-[#d6ccbe] rounded-xl text-center">
                <p className="text-xs font-mono font-bold text-stone-600">
                  {dayStatuses[selectedDate] === 'falta' ? 'Dia marcado como FALTA.' : 'Dia de FOLGA na escala 12x36.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: BANCO DE HORAS & AGENDA (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card Banco de Horas Consolidado */}
          <div className="bg-white border border-[#d6ccbe] p-4 rounded-2xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Clock size={15} className="text-[#9b1526]" />
                Banco de Horas Geral
              </h3>
              <button
                onClick={() => setIsEditingBankCard(!isEditingBankCard)}
                className="text-[10px] font-mono font-bold text-[#9b1526] hover:underline uppercase cursor-pointer"
              >
                {isEditingBankCard ? 'Fechar' : 'Ajustar'}
              </button>
            </div>

            {/* Total Display */}
            <div className={cn(
              "p-4 rounded-xl border text-center relative overflow-hidden",
              totalBankOfHours >= 0
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : "bg-rose-50/60 border-rose-200 text-rose-900"
            )}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 block mb-0.5">
                Saldo Acumulado Atual
              </span>
              <h4 className="text-3xl font-mono font-black tracking-tight">
                {formatBalanceMinutes(totalBankOfHours)}
              </h4>
              <p className="text-[10px] font-mono text-stone-500 mt-1">
                Calculado com regras automáticas de tolerância e apontamento
              </p>
            </div>

            {/* Manual Balance Adjustment Form */}
            {isEditingBankCard && (
              <div className="bg-[#fbf9f5] border border-[#d6ccbe] p-3 rounded-xl space-y-2 animate-fade-in">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 block">
                  Ajuste Manual Inicial (Minutos)
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Minutos (+ ou -)"
                    value={tempMins || bancoHorasManual.toString()}
                    onChange={(e) => setTempMins(e.target.value)}
                    className="flex-1 bg-white border border-[#d6ccbe] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none"
                  />
                  <button
                    onClick={() => {
                      const mins = parseInt(tempMins, 10);
                      if (!isNaN(mins)) {
                        updateBancoHorasManual(mins);
                        setIsEditingBankCard(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* Escala 12x36 Config Trigger */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-600">
              <span>Escala base: <strong>{escalaConfig.startDate || '2026-06-14'}</strong></span>
              <span className="text-emerald-700 font-bold">12x36 Ativa</span>
            </div>
          </div>

          {/* Card Agenda & Compromissos */}
          <div className="bg-white border border-[#d6ccbe] p-4 rounded-2xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Calendar size={15} className="text-[#9b1526]" />
                Compromissos ({formatLocalDate(selectedDate).split(' - ')[0]})
              </h3>
              <button
                onClick={() => setShowDayReminderModal(true)}
                className="p-1 bg-red-50 hover:bg-red-100 text-[#9b1526] rounded-lg transition-colors cursor-pointer"
                title="Novo Compromisso"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* List of Appointments for Selected Date */}
            {(() => {
              const dayApps = (Object.values(appointments || {}) as Appointment[]).filter(a => a && a.date === selectedDate);
              if (dayApps.length === 0) {
                return (
                  <div className="py-6 text-center text-stone-400 bg-[#fbf9f5] border border-dashed border-[#d6ccbe] rounded-xl">
                    <p className="text-xs font-mono font-bold">Nenhum compromisso neste dia.</p>
                    <button
                      onClick={() => setShowDayReminderModal(true)}
                      className="mt-2 text-[10px] font-mono font-bold text-[#9b1526] hover:underline uppercase cursor-pointer"
                    >
                      + Adicionar Lembrete
                    </button>
                  </div>
                );
              }
              return (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dayApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-stone-900 text-white">
                            {app.time}
                          </span>
                          <span className={cn(
                            "text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded",
                            app.type === 'corporativo' ? "bg-red-100 text-[#9b1526]" : "bg-blue-100 text-blue-800"
                          )}>
                            {app.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-900 truncate" title={app.title}>
                          {app.title}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Quick Add Form */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <input
                type="text"
                placeholder="Novo compromisso ou tarefa..."
                value={newAppTitle}
                onChange={(e) => setNewAppTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addAppointment(newAppTime, newAppTitle, newAppType);
                  }
                }}
                className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 outline-none focus:border-stone-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newAppTime}
                  onChange={(e) => setNewAppTime(e.target.value)}
                  className="w-24 bg-[#fbf9f5] border border-[#d6ccbe] rounded-lg px-2 py-1 text-xs font-mono font-bold text-stone-900 outline-none"
                />
                <select
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value as any)}
                  className="flex-1 bg-[#fbf9f5] border border-[#d6ccbe] rounded-lg px-2 py-1 text-xs font-mono font-bold text-stone-700 outline-none"
                >
                  <option value="corporativo">Corporativo</option>
                  <option value="pessoal">Pessoal</option>
                </select>
                <button
                  onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                  disabled={!newAppTitle.trim()}
                  className="px-3 py-1.5 bg-[#9b1526] hover:bg-[#831220] disabled:opacity-40 text-white rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>

          {/* Card Feriados do Mês */}
          <div className="bg-white border border-[#d6ccbe] p-4 rounded-2xl shadow-xs space-y-2.5">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-200">
              <Calendar size={15} className="text-[#9b1526]" />
              Feriados em {monthNames[viewDate.getMonth()]}
            </h3>
            <div className="space-y-1.5">
              {activeHolidaysList.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[#fbf9f5] border border-[#d6ccbe] rounded-lg text-xs">
                  <span className="font-bold text-stone-800">{h.name}</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {h.date.split('-').reverse().join('/')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL AGENDAR COMPROMISSO ================= */}
      {showDayReminderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white border border-[#d6ccbe] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-stone-900">
            <div className="bg-[#fbf9f5] p-4 border-b border-[#e7dac9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-[#9b1526] rounded-xl border border-red-200">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-stone-900">
                    Adicionar Compromisso
                  </h3>
                  <p className="text-[10px] text-stone-500 font-mono">
                    {formatLocalDate(selectedDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDayReminderModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Título do Lembrete
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reunião Operacional / Treinamento"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl p-2.5 text-xs text-stone-900 font-bold outline-none focus:border-stone-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl p-2 text-xs font-mono font-bold text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-xl p-2 text-xs font-mono font-bold text-stone-900 outline-none"
                  >
                    <option value="corporativo">Corporativo</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#fbf9f5] p-4 border-t border-[#e7dac9] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDayReminderModal(false)}
                className="px-4 py-2 bg-white border border-[#d6ccbe] text-stone-700 font-mono font-bold text-xs rounded-xl uppercase hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (reminderTitle.trim()) {
                    addAppointmentForTargetDate(selectedDate, reminderTime, reminderTitle.trim(), reminderType);
                    setReminderTitle('');
                    setShowDayReminderModal(false);
                  }
                }}
                disabled={!reminderTitle.trim()}
                className="px-4 py-2 bg-[#9b1526] hover:bg-[#831220] disabled:opacity-40 text-white font-mono font-bold text-xs rounded-xl uppercase transition-colors cursor-pointer shadow-xs"
              >
                Salvar Compromisso
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
