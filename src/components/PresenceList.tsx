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
  Camera
} from 'lucide-react';

export default function PresenceList() {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [profileImage, setProfileImage] = useState('https://i.postimg.cc/hjdJt0Wh/Whats-App-Image-2026-06-06-at-02-34-52.jpg');
  const [viewDate, setViewDate] = useState<Date>(() => {
    return new Date();
  });

  // New persistent states for calendar status and times
  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>(() => {
    const saved = localStorage.getItem('presence_statuses');
    let parsed: Record<string, 'trabalhei' | 'falta' | 'folga' | ''> = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    if (!parsed["2026-06-08"]) {
      parsed["2026-06-08"] = "trabalhei";
    }
    return parsed;
  });

  const [dayTimes, setDayTimes] = useState<Record<string, { entrada: string; saida: string }>>(() => {
    const saved = localStorage.getItem('presence_times');
    let parsed: Record<string, { entrada: string; saida: string }> = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    if (!parsed["2026-06-08"]) {
      parsed["2026-06-08"] = { entrada: "18:00", saida: "06:00" };
    }
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('presence_statuses', JSON.stringify(dayStatuses));
  }, [dayStatuses]);

  useEffect(() => {
    localStorage.setItem('presence_times', JSON.stringify(dayTimes));
  }, [dayTimes]);

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
    return total;
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

  const formatLocalDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} - ${formatted}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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

  return (
    <div className="w-full relative z-10 max-w-[96rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
      
      {/* Left Column (Card) */}
      <div className="hidden lg:block lg:col-span-4 lg:col-start-1">
        <div className="rounded-3xl bg-[#1d1008] border border-[#a27a5d]/30 shadow-2xl overflow-hidden relative flex flex-col h-full ring-4 ring-[#1d1008]/50 outline outline-1 outline-[#a27a5d]/20">
          
          {/* Inner padded container for top content */}
          <div className="p-6 pb-4">
            {/* Header: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 relative shadow-lg">
                {/* Simulated 3 Corações Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart size={24} className="text-[#D4AF37] fill-[#D4AF37]" />
                </div>
                <div className="absolute inset-1 border-[1px] border-dashed border-[#D4AF37]/50 rounded-full" />
                <span className="absolute bottom-2 text-[6px] font-bold text-[#D4AF37] tracking-widest mt-4">3 CORAÇÕES</span>
              </div>
              <div>
                <h2 className="text-white font-serif text-2xl tracking-wide font-bold">LISTA DE PRESENÇA</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span className="text-[#a27a5d] text-[10px] font-bold tracking-widest uppercase">MÓDULO ATIVO</span>
                </div>
              </div>
            </div>

            {/* Gold Ribbon Label */}
            <div className="mt-6 bg-gradient-to-r from-[#996b42] to-[#bfa16a] text-white py-3 px-4 rounded-xl text-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-[#e4c28c]/40 font-semibold tracking-widest text-[11px] uppercase">
              Café 3 Corações Edição Rústica Sofisticada
            </div>
          </div>

          {/* Large Center Image with fade effect */}
          <div className="relative w-full aspect-[4/3] flex-1 min-h-[220px]">
             {/* Coffee beans image similar to original */}
             <img 
               src="https://i.postimg.cc/2SDqGtb9/top.jpg" 
               alt="Gãos de Café" 
               className="w-full h-full object-cover object-center grayscale-[20%] contrast-125 brightness-75"
             />
             {/* Vignette gradients to blend image into the dark card */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#1d1008] via-transparent to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#1d1008] opacity-50 via-transparent to-transparent h-12" />
          </div>

          {/* Bottom Info Section */}
          <div className="p-6 pt-2 bg-[#1d1008] z-10 flex flex-col justify-end">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[#8c6b4e] text-xs font-mono font-bold tracking-widest uppercase">Lote #3708B</span>
              <span className="text-[#a27a5d] font-handwritten text-xl opacity-90 hidden sm:block font-serif italic">Qualidade Premium</span>
            </div>
            
            <h3 className="text-white text-2xl font-bold font-serif mb-3 tracking-wide">SACO DE JUTA</h3>
            <p className="text-stone-400 text-xs leading-relaxed max-w-[90%] mb-6 font-light">
              Uma edição especial e limitada, aprimorada naturalmente, torrada com maestria para momentos que pedem presença.
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="bg-[#B32025] hover:bg-[#8c060a] text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg outline-none cursor-pointer">
                <Coffee size={14} className="fill-current" />
                SÓ BOAS VIBRAÇÕES
              </button>
              <button className="bg-[#593d2b] hover:bg-[#4a3222] text-[#e8dbcc] border border-[#7a5b44] text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg outline-none cursor-pointer">
                <Coffee size={14} />
                DETALHES DO CAFÉ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Main App Panel) */}
      <div className="col-span-1 lg:col-span-8 lg:col-start-5 flex flex-col">
        <div className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-hidden flex flex-col"
             style={{
               backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
             }}
        >
          {/* Inner border trim */}
          <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />
          
          {/* Main Padding Container */}
          <div className="p-6 relative z-10 flex flex-col h-full gap-5">
            
            {/* Top Area: Splitted into Left (Profile) and Right (Image + Titles) */}
            <div className="flex flex-col md:flex-row gap-5">
              
              {/* Left Col: Profile Image card */}
              <div className="w-24 h-24 md:w-[30%] md:h-auto rounded-full md:rounded-xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-[#e2cfb9]">
                <img 
                  src={profileImage}
                  alt="Perfil" 
                  className="w-full h-full md:h-auto object-cover block"
                  referrerPolicy="no-referrer"
                />
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-[#3A2414]/60 flex-col items-center justify-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex text-[#e2cfb9]">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Alterar Foto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                </label>
              </div>

              {/* Right Col: Banner Image + Headers */}
              <div className="flex-1 flex flex-col justify-between pt-0.5">
                
                {/* 4K Image Banner (Aesthetic from Initial Menu) */}
                <div className="w-full flex-1 max-h-[160px] min-h-[100px] mb-2 rounded-xl overflow-hidden border-2 border-[#5c3e29]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative group hidden md:block">
                  <img 
                    src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=100&w=1200&h=400"
                    alt="Coffee Aesthetic Header"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter sepia-[20%] contrast-[1.1] brightness-90 relative z-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
                </div>

                {/* Inspirational Phrase */}
                <p className="w-full text-[#3d2415] font-serif italic text-sm text-center mb-4 leading-snug px-4">
                  "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Teste e aprenda rápido, gerando e adaptando ideias. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
                </p>

                {/* Bottom of Right Col: Texts + Black Tag */}
                <div className="flex items-end justify-between">
                  {/* Title texts */}
                  <div className="pb-1">
                    <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                      Lista Ativa de Atendimento
                    </span>
                    <h1 className="text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                      ESCALA: <span className="text-[#B32025]">{selectedDate.split('-').reverse().join('/')}</span>
                    </h1>
                  </div>

                  {/* Black tag: Feito com paixão */}
                  <div className="hidden md:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-4 px-6 items-center justify-center gap-5 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative">
                    {/* Screw holes */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    
                    <div className="w-10 h-10 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                      <Coffee className="text-[#cfab84]" size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-handwritten text-[#e5d5c1] text-xl font-bold leading-none mb-1">Feito com paixão.</span>
                      <span className="font-handwritten text-[#e5d5c1]/70 text-sm font-medium leading-none">Para quem entrega.</span>
                      <div className="flex gap-1.5 mt-2">
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Input Filter & Ribbon row */}
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text"
                  placeholder="Filtrar colaboradores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl py-3 pl-12 pr-4 text-sm text-[#3A2414] placeholder-stone-400 outline-none focus:border-[#B32025] shadow-inner font-medium"
                />
              </div>

              {/* Status Ribbon (Feriado Nacional / Time) */}
              <div className="flex items-center justify-between bg-[#f8f1e5] border border-[#e1ccb0] rounded-xl px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  {isHoliday ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8b5a2b]" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">{currentHoliday.name}</span>
                    </>
                  ) : currentStatus === 'trabalhei' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B32025]" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Dia de Trabalho (12x36)</span>
                    </>
                  ) : currentStatus === 'falta' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Falta Registrada</span>
                    </>
                  ) : currentStatus === 'folga' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Dia de Folga</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Aguardando Registro</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[#9a785c]">
                  <div className="flex items-center gap-1.5 bg-[#e1ccb0]/50 px-2.5 py-1 rounded text-[10px] font-bold">
                    ESCALA 12x36
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-xs font-mono font-bold">18:00 - 06:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2-Panel Area */}
            <div className="flex flex-col md:flex-row gap-5 flex-1 min-h-0 pt-2">
              
              {/* Left Inner: Calendar */}
              <div className="w-full md:w-[45%] flex flex-col shrink-0 rounded-3xl overflow-hidden border border-[#eedecb] shadow-xl bg-gradient-to-b from-[#fffbf7] to-[#FAF6ED]">
                
                {/* Calendar Header with premium brand look */}
                <div className="bg-gradient-to-r from-[#3e2516] to-[#4e341f] text-white flex items-center justify-between py-3.5 px-5 select-none shadow-sm relative">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-[#dfc2a1]/20" />
                  <button onClick={handlePrevMonth} className="text-[#dfc2a1] hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer p-1.5 rounded-full hover:bg-white/10"><ChevronLeft size={18} /></button>
                  <span className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase font-sans text-[#eddcc9]">{currentMonthLabel}</span>
                  <button onClick={handleNextMonth} className="text-[#dfc2a1] hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer p-1.5 rounded-full hover:bg-white/10"><ChevronRight size={18} /></button>
                </div>

                {/* Calendar Grid Container */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  {/* Days of week header with refined spacing */}
                  <div className="grid grid-cols-7 mb-2 bg-[#f4ebdc]/40 rounded-xl py-2 border border-[#eedecb]/40">
                    {daysOfWeek.map(d => (
                      <div key={d} className="text-center text-[10px] font-black tracking-wider text-[#8b6b4e]">{d}</div>
                    ))}
                  </div>
                  
                  {/* Days cells with premium tiled aesthetic */}
                  <div className="grid grid-cols-7 flex-1 gap-1.5">
                    {calendarDays.map((week, wIdx) => (
                      week.map((d, dIdx) => {
                        const isSelected = selectedDate === d.dateStr;
                        const status = dayStatuses[d.dateStr] || '';
                        
                        let cellStyle = 'bg-white hover:bg-[#FAF6ED]/70 border border-[#eedecb]/70 rounded-2xl';
                        if (status === 'trabalhei') cellStyle = 'bg-green-50/50 border border-green-200/80 hover:bg-green-50/85 rounded-2xl';
                        else if (status === 'falta') cellStyle = 'bg-red-50/50 border border-red-200/80 hover:bg-red-50/85 rounded-2xl';
                        else if (status === 'folga') cellStyle = 'bg-amber-50/50 border border-amber-200/80 hover:bg-amber-50/85 rounded-2xl';
                        else if (d.inactive) cellStyle = 'bg-stone-50/40 border border-transparent text-stone-300 opacity-40 rounded-2xl pointer-events-none';

                        if (isSelected && !d.inactive) {
                          cellStyle = 'bg-[#FAF5EE] border-2 border-[#B32025] shadow-[0_4px_14px_rgba(179,32,37,0.14)] ring-2 ring-[#B32025]/15 scale-[1.03] z-10 rounded-2xl';
                        }

                        return (
                          <div 
                            key={`${wIdx}-${dIdx}`} 
                            onClick={() => {
                              setSelectedDate(d.dateStr);
                              if (d.inactive) {
                                setViewDate(new Date(d.dateStr));
                              }
                            }}
                            className={`
                              flex flex-col justify-between p-2 pb-3.5 transition-all duration-300 relative min-h-[58px] sm:min-h-[66px] cursor-pointer select-none
                              ${cellStyle}
                            `}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className={`font-sans text-[11px] sm:text-xs font-black px-1.5 py-0.5 rounded-lg transition-colors duration-200
                                ${isSelected ? 'bg-[#B32025] text-white' : 'text-[#4e341f]'}
                              `}>
                                {d.day}
                              </span>
                            </div>

                            {/* Dropdown status options shown only when selected, otherwise show simple elegant badge */}
                            {isSelected ? (
                              <div className="mt-1">
                                <select
                                  value={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(d.dateStr);
                                    if (d.inactive) {
                                      setViewDate(new Date(d.dateStr));
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value as 'trabalhei' | 'falta' | 'folga' | '';
                                    setDayStatuses(prev => ({
                                      ...prev,
                                      [d.dateStr]: val
                                    }));
                                  }}
                                  className={`
                                    w-full text-[8.5px] font-black border rounded-lg p-1 cursor-pointer outline-none transition-all duration-200 shadow-sm
                                    ${status === 'trabalhei' ? 'border-green-600 bg-green-700 text-white font-bold' : ''}
                                    ${status === 'falta' ? 'border-red-600 bg-red-700 text-white font-bold' : ''}
                                    ${status === 'folga' ? 'border-amber-600 bg-amber-700 text-white font-bold' : ''}
                                    ${status === '' ? 'border-[#dac0a3] bg-white text-stone-800' : ''}
                                  `}
                                >
                                  <option value="" className="text-stone-800 bg-[#fdfaf5]">--</option>
                                  <option value="trabalhei" className="text-stone-800 bg-[#fdfaf5]">TRAB</option>
                                  <option value="falta" className="text-stone-800 bg-[#fdfaf5]">FALTA</option>
                                  <option value="folga" className="text-stone-800 bg-[#fdfaf5]">FOLGA</option>
                                </select>
                              </div>
                            ) : (
                              status ? (
                                <div className={`
                                  w-full text-[8px] font-black text-center border rounded-md py-0.5 mt-auto select-none uppercase tracking-wider transition-colors duration-200
                                  ${status === 'trabalhei' ? 'border-green-500/20 bg-green-600/10 text-green-700' : ''}
                                  ${status === 'falta' ? 'border-red-500/20 bg-red-600/10 text-red-700' : ''}
                                  ${status === 'folga' ? 'border-amber-500/20 bg-amber-600/10 text-amber-700' : ''}
                                `}>
                                  {status === 'trabalhei' ? 'TRAB' : status === 'falta' ? 'FALTA' : 'FOLGA'}
                                </div>
                              ) : (
                                <div className="text-[10px] text-stone-400 mt-auto text-center opacity-25 font-bold select-none">--</div>
                              )
                            )}

                            {/* Solid brown line under worked days */}
                            {status === 'trabalhei' && (
                              <div className="absolute bottom-1 left-3 right-3 h-[3.5px] bg-[#5c3e29] rounded-full" title="Dia Trabalhado" />
                            )}
                          </div>
                        );
                      })
                    ))}
                  </div> {/* Days cells */}
                </div> {/* Calendar Grid */}
              </div> {/* Left Inner: Calendar */}

              {/* Right Inner: Stats & Interactive Controls */}
              <div className="flex flex-col flex-1 gap-4 relative min-h-[300px] w-full">
                
                {/* 3 Stat Boxes Top row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-[#fdfbf7] rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#2e7d32] uppercase mb-1">Presentes</span>
                    <span className="text-xl sm:text-2xl font-black text-[#2e7d32] leading-none mb-1">{presentes}</span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">este mês</span>
                  </div>
                  <div className="bg-[#fdfbf7] rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#c62828] uppercase mb-1">Faltas</span>
                    <span className="text-xl sm:text-2xl font-black text-[#c62828] leading-none mb-1">{faltas}</span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">registradas</span>
                  </div>
                  <div className="bg-[#fdfbf7] rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#8c7462] uppercase mb-1">Banco Horas</span>
                    <span className={`text-sm sm:text-lg font-black leading-none mb-1 ${totalBankOfHours >= 0 ? 'text-green-700' : 'text-[#B32025]'}`}>
                      {formatBalanceMinutes(totalBankOfHours)}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">saldo total</span>
                  </div>
                </div>

                {/* Painel do Dia Selecionado: Entrada, Saída e Status */}
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#B32025] text-white p-1.5 rounded-lg">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-[#3e2516] uppercase tracking-widest leading-none mb-1">Editor de Jornada</h3>
                        <p className="text-[10px] text-[#8c6b4e] font-mono leading-none">{formatLocalDate(selectedDate)}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#4e341f] text-white px-2 py-0.5 rounded uppercase tracking-wide">Minha Hora</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status do Dia */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#5c3e29] uppercase tracking-wider">Status de Presença:</label>
                      <select
                        value={dayStatuses[selectedDate] || ''}
                        onChange={(e) => {
                          const val = e.target.value as 'trabalhei' | 'falta' | 'folga' | '';
                          setDayStatuses(prev => ({
                            ...prev,
                            [selectedDate]: val
                          }));
                        }}
                        className={`w-full text-xs font-bold border rounded-lg p-2.5 cursor-pointer outline-none transition-all shadow-inner
                          ${dayStatuses[selectedDate] === 'trabalhei' ? 'border-green-600 bg-green-50 text-green-800' : ''}
                          ${dayStatuses[selectedDate] === 'falta' ? 'border-red-600 bg-red-50 text-red-800' : ''}
                          ${dayStatuses[selectedDate] === 'folga' ? 'border-amber-600 bg-amber-50 text-amber-800' : ''}
                          ${!(dayStatuses[selectedDate]) ? 'border-[#dac0a3] bg-white text-stone-800' : ''}
                        `}
                      >
                        <option value="">Selecione status...</option>
                        <option value="trabalhei">Fui trabalhar (Trabalhei)</option>
                        <option value="falta">Falta (Não fui)</option>
                        <option value="folga">Folga oficial</option>
                      </select>
                    </div>

                    {/* Escala padrão label */}
                    <div className="flex flex-col justify-center bg-[#f8f1e5] border border-[#e1ccb0] rounded-xl p-3 text-center sm:text-left shadow-inner">
                      <span className="text-[9px] font-bold text-[#8c6b4e] uppercase tracking-wider block">Escala Padrão Noturna</span>
                      <span className="text-sm font-mono font-bold text-[#4e341f] block mt-0.5">18:00 às 06:00 (12h)</span>
                    </div>
                  </div>

                  {/* Se for dia Trabalhado, mostrar opções de horário de Entrada e Saída */}
                  {(dayStatuses[selectedDate] === 'trabalhei') ? (
                    <div className="bg-[#fffefb] border border-[#e1ccb0] rounded-xl p-4 flex flex-col gap-3.5 shadow-inner">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#3e2516] uppercase tracking-wider flex items-center gap-1">
                            <span>ENTRADA DE TRABALHO</span>
                          </label>
                          <input
                            type="time"
                            value={dayTimes[selectedDate]?.entrada || '18:00'}
                            onChange={(e) => {
                              const existing = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                              setDayTimes(prev => ({
                                ...prev,
                                [selectedDate]: { ...existing, entrada: e.target.value }
                              }));
                            }}
                            className="bg-white border border-[#dac0a3] text-sm font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#3e2516] uppercase tracking-wider flex items-center gap-1">
                            <span>SAÍDA DE TRABALHO</span>
                          </label>
                          <input
                            type="time"
                            value={dayTimes[selectedDate]?.saida || '06:00'}
                            onChange={(e) => {
                              const existing = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                              setDayTimes(prev => ({
                                ...prev,
                                [selectedDate]: { ...existing, saida: e.target.value }
                              }));
                            }}
                            className="bg-white border border-[#dac0a3] text-sm font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Banco de horas do dia */}
                      {(() => {
                        const times = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                        const balance = calculateDayBalance(selectedDate, 'trabalhei', times.entrada, times.saida);
                        
                        return (
                          <div className="border-t border-[#e1ccb0] pt-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between bg-[#fcf8f2] p-2.5 rounded-lg border border-[#e1ccb0]">
                              <span className="text-[10px] font-bold text-[#5c3e29] uppercase tracking-wider">Saldo Deste Dia:</span>
                              <span className={`text-sm font-mono font-black ${balance.total >= 0 ? 'text-[#2e7d32]' : 'text-[#B32025]'}`}>
                                {formatBalanceMinutes(balance.total)}
                              </span>
                            </div>

                            {/* Detalhamento dos Gatilhos do Banco de Horas */}
                            <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-stone-700 font-medium">
                              {/* Regras da Entrada */}
                              <div className="flex items-start gap-2">
                                <span className="text-xs mt-0.5">{balance.entradaStatus === 'positivo' ? '🟢' : '🔴'}</span>
                                <div>
                                  <span className="font-bold text-[#4e341f]">Entrada às {times.entrada}: </span>
                                  {balance.entradaStatus === 'positivo' ? (
                                    <span className="text-green-700">Gatilho de Entrada antes de 17:54 ativado (Banco Positivo {formatBalanceMinutes(balance.entradaDiff)})</span>
                                  ) : (
                                    <span className="text-[#B32025]">Gatilho de Entrada antes de 18:06 ativado (Banco Negativo {formatBalanceMinutes(balance.entradaDiff)})</span>
                                  )}
                                </div>
                              </div>

                              {/* Regras de Saída */}
                              <div className="flex items-start gap-2">
                                <span className="text-xs mt-0.5">{balance.saidaStatus === 'positivo' ? '🟢' : '🔴'}</span>
                                <div>
                                  <span className="font-bold text-[#4e341f]">Saída às {times.saida}: </span>
                                  {balance.saidaStatus === 'positivo' ? (
                                    <span className="text-green-700">Gatilho de Saída antes de 06:06 ativado (Banco Positivo {formatBalanceMinutes(balance.saidaDiff)})</span>
                                  ) : (
                                    <span className="text-[#B32025]">Gatilho de Saída antes de 05:56 ativado (Banco Negativo {formatBalanceMinutes(balance.saidaDiff)})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-[#f8f1e5]/50 border border-dashed border-[#d6be9c] rounded-xl p-6 text-center text-stone-400 text-xs">
                      Não há compensação de banco de horas para faltas ou folgas. Selecione "Fui trabalhar (Trabalhei)" para registrar horários e acumular créditos ou débitos.
                    </div>
                  )}
                </div>

                {/* Quadro explicativo definitivo de Banco de Horas */}
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#4e341f] p-1.5 rounded-lg text-[#dfc2a1]">
                      <Calendar size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-[#3e2516] tracking-widest uppercase">Manual de Regras do Banco</span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-stone-700 leading-relaxed">
                    <div className="flex items-start gap-2 p-1.5 bg-red-500/5 rounded border border-red-500/10">
                      <span className="text-[#B32025] font-black">🔴</span>
                      <div>
                        <strong className="text-red-900 block">DÉBITO (Banco Negativo):</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px] text-red-800">
                          <li>Entrada antes de <strong>18:06</strong> (entre 17:54 e 18:05)</li>
                          <li>Saída antes de <strong>05:56</strong> (ex: saída às 05:50)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-1.5 bg-green-500/5 rounded border border-green-500/10">
                      <span className="text-green-600 font-black">🟢</span>
                      <div>
                        <strong className="text-green-900 block">CRÉDITO (Banco Positivo):</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px] text-green-800">
                          <li>Entrada antes de <strong>17:54</strong> (ex: chegada às 17:50)</li>
                          <li>Saída antes de <strong>06:06</strong> (ou após 05:56, ex: saída às 06:05)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div> {/* Close Right Inner */}

            </div> {/* Close Bottom 2-Panel Area */}
            
            {/* Very Bottom Text / Return top link inside main container */}
            <div className="flex items-center justify-between mt-auto opacity-90 pt-2">
              <span className="text-xs font-bold text-[#5c3e29] font-mono">Hoje: {getTodayStr().split('-').reverse().join('/')}</span>
              <button 
                onClick={() => window.scrollTo(0,0)}
                className="bg-[#B32025] hover:bg-[#8c060a] text-white text-[9px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
               >
                Voltar ao topo <ChevronUp size={12} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
