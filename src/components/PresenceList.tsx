import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Coffee, 
  Tag, 
  Activity, 
  Flame, 
  Check, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  Wind, 
  Sliders, 
  Package, 
  FileText, 
  Award, 
  Droplet, 
  UtensilsCrossed, 
  Leaf, 
  Compass, 
  HelpCircle,
  Eye,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  UserPlus,
  Percent,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { isWorkDay, getWorkScheduleForDate } from '../utils/workSchedule';

// Dynamic import of Google Fonts for cursive tag and display serif fonts
const fontImportStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Satisfy&family=Caveat:wght@400..700&display=swap');
  
  .font-handwritten {
    font-family: 'Satisfy', 'Caveat', cursive, sans-serif;
  }
  .font-serif-display {
    font-family: 'Playfair Display', Georgia, serif;
  }
`;

interface Hotspot {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  infoQuote: string;
  editorialNote: string;
  icon: React.ComponentType<any>;
  top: string;
  left: string;
  handwrittenText?: string;
  itemCode: string;
}

const COFFEE_HOTSPOTS: Hotspot[] = [
  {
    id: 'saco_juta',
    index: 1,
    title: 'Saco de Juta',
    subtitle: 'Saco de Juta Rústico & Grãos',
    description: 'Um saco de serapilheira rústico, denso e altamente texturizado, preenchido até a borda com grãos de café de torra escura.',
    infoQuote: 'O saco é amarrado à mão com barbante de juta cru de fibra grossa. O entrelaçamento natural das fibras ajuda a reter os óleos aromáticos voláteis, protegendo o lote contra variações de temperatura externos e preservando as características de grãos gourmet cultivados em elevadas altitudes.',
    editorialNote: 'Grãos 100% Arábica selecionados meticulosamente. Notas olfativas intensas de chocolate amargo e avelã torrada.',
    icon: Package,
    top: '25%',
    left: '23%',
    itemCode: 'LOTE #1704B'
  },
  {
    id: 'etiqueta_kraft',
    index: 2,
    title: 'Etiqueta de Papel',
    subtitle: 'Papel Kraft Texturizado',
    description: 'Presa elegantemente ao saco através do barbante de juta, a etiqueta de papel kraft envelhecido apresenta bordas intencionalmente irregulares e rasgadas.',
    infoQuote: 'Num convite à herança clássica das fazendas mineiras, a etiqueta serve como certidão de origem do microlote. Ostenta uma caligrafia manual refinada que acentua a curadoria especial desta safra selecionada.',
    editorialNote: 'O design gráfico minimalista e monocromático destaca o contraste sofisticado entre o artesanal e o contemporâneo.',
    icon: Tag,
    top: '41%',
    left: '21%',
    handwrittenText: 'Edição Rústica Sofisticada / Café em Grãos Selecionados',
    itemCode: 'CURADORIA DE ESTÚDIO'
  },
  {
    id: 'selo_cera',
    index: 3,
    title: 'Selo de Cera',
    subtitle: 'Selo 3corações Premium',
    description: 'Um suntuoso selo de lacre de cera vermelha-escura derretida, posicionado com precisão impecável no canto inferior esquerdo da etiqueta de papel.',
    infoQuote: 'O selo ostenta o icônico logotipo da "3corações" em relevo dourado tridimensional. Uma técnica centenária que sela um compromisso indissolúvel de integridade, afeto corporativo e alto padrão artesanal.',
    editorialNote: 'A cera especial de alta fusão preserva os detalhes microscópicos do design com um brilho profundo que captura a luz directional do estúdio.',
    icon: Award,
    top: '60%',
    left: '16%',
    itemCode: 'AUTENTICIDADE CERTIFICADA'
  },
  {
    id: 'gotejador_cobre',
    index: 4,
    title: 'Gotejador de Cobre',
    subtitle: 'Cestinha de Gotejamento Polido',
    description: 'Um refinado gotejador de café cônico em cobre puríssimo e bronze escovado, exibindo ranhuras espirais internas para fluxo uniforme da água.',
    infoQuote: 'Dentro do filtro de papel branco imaculado, repousa o pó fresco sob calor preciso. Plumas translúcidas de vapor de água aquecida sobem delicadamente em espirais sinuosas no ar, evocando a tranquilidade dos rituais lentos.',
    editorialNote: 'O design cônico V60 de cobre polido distribui o calor com excelência térmica inigualável durante toda a extração.',
    icon: Droplet,
    top: '31%',
    left: '41%',
    itemCode: 'V60 SOLID COPPER'
  },
  {
    id: 'caneca_ceramica',
    index: 5,
    title: 'Caneca de Cerâmica',
    subtitle: 'Cerâmica Artesanal de Argila',
    description: 'Modelada manualmente em torno de oleiro e finalizada com um esmalte vitrificado em tons terrosos, a caneca ostenta a marca "3corações" em baixo-relevo.',
    infoQuote: 'Uma verdadeira peça de autor. A espessura generosa da argila refratária preserva o calor da bebida com perfeição térmica, enquanto a textura áspera da base crua confere um toque tátil e orgânico extremamente prazeroso.',
    editorialNote: 'Esmaltação reativa em alta temperatura que torna cada caneca uma peça estritamente única no mundo.',
    icon: Coffee,
    top: '56%',
    left: '42%',
    itemCode: 'STUDIO CERAMICS'
  },
  {
    id: 'graos_espalhados',
    index: 6,
    title: 'Grãos de Café',
    subtitle: 'Grãos de Torra Escura',
    description: 'Grãos selecionados espalhados espontaneamente e de forma casual sobre a fatia de tronco de árvore desgastada, capturando os reflexos da iluminação.',
    infoQuote: 'Os grãos recém-saídos da torra revelam uma pátina sutil de óleos essenciais na superfície, o que comprova o ponto de caramelização perfeita dos açúcares naturais da semente.',
    editorialNote: 'Origem controlada das melhores regiões montanhosas do cerrado mineiro com altitude superior a 1.100 metros.',
    icon: Sparkles,
    top: '69%',
    left: '32%',
    itemCode: '100% ARÁBICA'
  },
  {
    id: 'cerejas_maduras',
    index: 7,
    title: 'Frutos de Café (Cerejas)',
    subtitle: 'Cerejas de Café Frescas & Secas',
    description: 'Um cacho de café maduro posicionado no canto inferior direito, exibindo frutos na cor vermelho-rubi profunda ao lado de bagas secas em tons café.',
    infoQuote: 'Amarrados à história agrícola, as cerejas frescas relembram a conexão botânica do café com a terra e o ciclo fenológico da planta antes de se transformar na bebida dourada.',
    editorialNote: 'Colheita estritamente manual (hand-picking) para assegurar que apenas os frutos no topo de maturidade celular sejam selecionados.',
    icon: UtensilsCrossed,
    top: '68%',
    left: '55%',
    itemCode: 'BOTÂNICA DA SEMENTE'
  },
  {
    id: 'folhas_verdes',
    index: 8,
    title: 'Folhas de Café',
    subtitle: 'Folhas Verdes Frescas',
    description: 'Duas folhas de coloração verde-viva intensa com textura encerada e nervuras simétricas proeminentes, dispostas gentilmente sobre a fatia de madeira.',
    infoQuote: 'Colhidas no mesmo dia diretamente da lavoura experimental, as folhas adicionam vida e um contraste cromático impecável com os tons de bronze, terracota e marrom da composição rústica.',
    editorialNote: 'As folhas refletem o vigor fisiológico do cafeeiro da espécie Arábica Bourbon Amarelo.',
    icon: Leaf,
    top: '71%',
    left: '12%',
    itemCode: 'TERROIR MINEIRO'
  },
  {
    id: 'moedor_metal',
    index: 9,
    title: 'Moedor de Café',
    subtitle: 'Moedor Manual Antigo',
    description: 'Um moedor clássico de manivela de ferro fundido e caixa de jacarandá antiga, parcialmente visível no bokeh deslumbrante de fundo.',
    infoQuote: 'As lâminas cônicas internas de aço carbono trituram os grãos de forma sutil, minimizando o atrito térmico negativo para evitar a perda dos aromas voláteis mais sutis e preservando o amargor equilibrado.',
    editorialNote: 'Regulado sob fricção fina tradicional para extrações curtas ou médias no gotejador de cobre.',
    icon: Compass,
    top: '40%',
    left: '63%',
    itemCode: 'HERANÇA COLONIAL'
  }
];

export default function PresenceList() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeHotspot = COFFEE_HOTSPOTS[selectedIdx];

  // Warmth control
  const [warmth, setWarmth] = useState<number>(100);

  // Audio simulation states
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  // Extraction stimulation states
  const [extractionState, setExtractionState] = useState<'idle' | 'brewing' | 'done'>('idle');
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [steamParticles, setSteamParticles] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);

  // Wax stamp states
  const [stampState, setStampState] = useState<'idle' | 'stamping' | 'stamped'>('idle');
  const [grindSize, setGrindSize] = useState<'FINA' | 'MÉDIA' | 'GROSSA'>('MÉDIA');

  // --- CALENDAR & ATTENDANCE STATES ---
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1)); // June 2026
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-06'); // June 6, 2026
  const [escalasList, setEscalasList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom new collaborator form state
  const [newColabName, setNewColabName] = useState('');
  const [newColabRole, setNewColabRole] = useState('Motorista');
  const [newColabNote, setNewColabNote] = useState('');

  // Editing notes state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [isHoliday, setIsHoliday] = useState<boolean>(false);

  // Sync escalasList from Firebase Realtime Database
  useEffect(() => {
    const escalasListRef = ref(rtdb, 'escalas');
    const unsubscribe = onValue(escalasListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEscalasList(Object.values(data));
      } else {
        setEscalasList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter scales for active selectedDate
  const activeRoster = useMemo(() => {
    return escalasList.filter((item: any) => item.date === selectedDate);
  }, [escalasList, selectedDate]);

  // Filter roster by name search
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return activeRoster;
    return activeRoster.filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeRoster, searchQuery]);

  // Handle month changes
  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
    playSynthesizedTone(440, 'sine', 0.1, 0.05);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
    playSynthesizedTone(460, 'sine', 0.1, 0.05);
  };

  // Populate Default Collaborators for a fresh day roster
  const handlePopulateDefault = async () => {
    const DEFAULT_STAFF = [
      { name: "Manoel Silva", role: "Motorista", worked: true, observacao: "Presença regular" },
      { name: "Luiz Carlos", role: "Motorista", worked: true, observacao: "Início pontual" },
      { name: "Cláudio Sousa", role: "Ajudante", worked: true, observacao: "Carregamento concluído" },
      { name: "Carlos Alberto", role: "Ajudante", worked: false, observacao: "Falta médica justificativa" },
      { name: "Roberto Dias", role: "Monitor", worked: true, observacao: "Rotas verificadas" },
      { name: "Thiago Santos", role: "Motorista", worked: true, observacao: "Apoio de pátio" },
      { name: "Eduardo Souza", role: "Monitor", worked: true, observacao: "Operação SM ativa" },
      { name: "José Augusto", role: "Supervisor", worked: true, observacao: "Supervisão geral" }
    ];

    for (const staff of DEFAULT_STAFF) {
      const nameKey = staff.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const entryId = `${selectedDate}_${nameKey}`;
      await set(ref(rtdb, `escalas/${entryId}`), {
        id: entryId,
        name: staff.name,
        role: staff.role,
        date: selectedDate,
        worked: staff.worked,
        observacao: staff.observacao
      });
    }
    playSynthesizedTone(580, 'sine', 0.3, 0.1);
  };

  // Toggle present/worked status in Firebase
  const handleToggleWorked = async (item: any) => {
    await update(ref(rtdb, `escalas/${item.id}`), {
      worked: !item.worked
    });
    playSynthesizedTone(item.worked ? 220 : 330, 'triangle', 0.15, 0.12);
  };

  // Delete worker from selected date scale
  const handleDeleteWorker = async (id: string) => {
    await remove(ref(rtdb, `escalas/${id}`));
    playSynthesizedTone(180, 'sine', 0.25, 0.08);
  };

  // Add new custom collaborator to this date
  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColabName.trim()) return;
    const nameKey = newColabName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const entryId = `${selectedDate}_${nameKey}`;
    
    await set(ref(rtdb, `escalas/${entryId}`), {
      id: entryId,
      name: newColabName.trim(),
      role: newColabRole,
      date: selectedDate,
      worked: true,
      observacao: newColabNote.trim() || 'Adicionado manualmente'
    });

    setNewColabName('');
    setNewColabNote('');
    playSynthesizedTone(620, 'sine', 0.2, 0.1);
  };

  // Start inline note editing
  const startEditingNote = (item: any) => {
    setEditingNoteId(item.id);
    setTempNoteText(item.observacao || '');
    playSynthesizedTone(420, 'sine', 0.1, 0.05);
  };

  // Save modified note inline to Firebase
  const saveEditedNote = async (id: string) => {
    await update(ref(rtdb, `escalas/${id}`), {
      observacao: tempNoteText.trim()
    });
    setEditingNoteId(null);
    playSynthesizedTone(540, 'sine', 0.15, 0.1);
  };

  // Calendar month-grid generator
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();

    const days: Array<{ dayNum: number; fullDateStr: string; isActiveMonth: boolean }> = [];

    // Prev month filler
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dNum).padStart(2, '0');
      days.push({
        dayNum: dNum,
        fullDateStr: `${prevYear}-${mStr}-${dStr}`,
        isActiveMonth: false
      });
    }

    // Active month
    for (let dNum = 1; dNum <= totalDays; dNum++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(dNum).padStart(2, '0');
      days.push({
        dayNum: dNum,
        fullDateStr: `${year}-${mStr}-${dStr}`,
        isActiveMonth: true
      });
    }

    // Next month filler
    const remaining = 42 - days.length;
    for (let dNum = 1; dNum <= remaining; dNum++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(dNum).padStart(2, '0');
      days.push({
        dayNum: dNum,
        fullDateStr: `${nextYear}-${mStr}-${dStr}`,
        isActiveMonth: false
      });
    }

    return days;
  }, [currentMonth]);

  // Check if a date string has any attendance logged for badges
  const getAttendanceSummaryForDate = (dateStr: string) => {
    const items = escalasList.filter((item: any) => item.date === dateStr);
    const total = items.length;
    const present = items.filter((item: any) => item.worked).length;
    return { total, present };
  };

  // List of beautiful coffee images related to monthly theme
  const CALENDAR_IMAGES = [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', // Janeiro: Torrefação
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', // Fevereiro: Cafeteira
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', // Março: Grãos em pilhas
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800', // Abril: Frutos vermelhos
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800', // Maio: Caneca antiga
    'https://i.postimg.cc/dVfY4TLn/Whats-App-Image-2026-06-06-at-02-34-52.jpg', // Junho: Extração manual lenta
    'https://images.unsplash.com/photo-1459756269037-a7da64077552?auto=format&fit=crop&q=80&w=800', // Julho: Mesa rústica outonal
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800', // Agosto: Cappuccino art em estúdio
    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800', // Setembro: Gotículas de café expresso
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', // Outubro: Bistrô antigo
    'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=800', // Novembro: Vapor de café fervendo
    'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=800'  // Dezembro: Presente rústico de grãos
  ];

  const MONTHS_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentMonthImage = CALENDAR_IMAGES[currentMonth.getMonth()];
  const currentMonthName = MONTHS_NAMES[currentMonth.getMonth()];

  // Stats calculation
  const totalStaff = activeRoster.length;
  const totalPresent = activeRoster.filter(item => item.worked).length;
  const totalAbsent = activeRoster.filter(item => !item.worked).length;
  const attendancePercentage = totalStaff > 0 ? Math.round((totalPresent / totalStaff) * 100) : 0;
  
  const scheduleInfo = useMemo(() => getWorkScheduleForDate(new Date(selectedDate)), [selectedDate]);

  // Trigger sound synthesis for ambient
  const toggleAmbientSound = () => {
    if (typeof window === 'undefined') return;

    if (isAudioPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  const startAmbientSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master output volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 1. Create a quiet crackling white-noise generator of fireplace
      // We will make 1 second of buffer noise and loop it
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const fireNoise = ctx.createBufferSource();
      fireNoise.buffer = noiseBuffer;
      fireNoise.loop = true;

      // Crackle bandpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Random gain spikes to simulate fireplace/pop sound
      const modulationGain = ctx.createGain();
      modulationGain.gain.setValueAtTime(0.015, ctx.currentTime);

      // Low frequency hum for boiling water
      const lowOsc = ctx.createOscillator();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(82, ctx.currentTime);
      const lowGain = ctx.createGain();
      lowGain.gain.setValueAtTime(0.05, ctx.currentTime);

      // Subtle bubble popping oscillator
      const bubbleOsc = ctx.createOscillator();
      bubbleOsc.type = 'triangle';
      bubbleOsc.frequency.setValueAtTime(450, ctx.currentTime);
      const bubbleGain = ctx.createGain();
      bubbleGain.gain.setValueAtTime(0, ctx.currentTime);

      // Frequency modulation for bubble
      const bubbleLFO = ctx.createOscillator();
      bubbleLFO.type = 'sine';
      bubbleLFO.frequency.setValueAtTime(2.5, ctx.currentTime); // 2.5Hz bubbles
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(50, ctx.currentTime);

      bubbleLFO.connect(lfoGain);
      lfoGain.connect(bubbleOsc.frequency);
      bubbleOsc.connect(bubbleGain);

      // Connect modules
      fireNoise.connect(filter);
      filter.connect(modulationGain);
      modulationGain.connect(masterGain);

      lowOsc.connect(lowGain);
      lowGain.connect(masterGain);
      bubbleGain.connect(masterGain);

      // Start sound oscillators
      fireNoise.start(0);
      lowOsc.start(0);
      bubbleOsc.start(0);
      bubbleLFO.start(0);

      // Keep reference to LFO/crackler to stop them
      lfoRef.current = lowOsc; // reuse for ease
      setIsAudioPlaying(true);

      // Gentle intermittent rustle gain
      const interval = setInterval(() => {
        if (ctx.state === 'closed') {
          clearInterval(interval);
          return;
        }
        // Occasional crackle burst
        const t = ctx.currentTime;
        modulationGain.gain.setValueAtTime(0.02 + Math.random() * 0.04, t);
        modulationGain.gain.exponentialRampToValueAtTime(0.008, t + 0.15);

        // Occasional bubble pop sound
        if (Math.random() > 0.4) {
          bubbleGain.gain.setValueAtTime(0.08, t);
          bubbleOsc.frequency.setValueAtTime(220 + Math.random() * 600, t);
          bubbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        }
      }, 250);

    } catch (e) {
      console.error("Audio Synthesis error", e);
    }
  };

  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().then(() => {
        setIsAudioPlaying(false);
        audioCtxRef.current = null;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Synthesis a small stamp "thump" or extraction ping
  const playSynthesizedTone = (frequency: number, type: OscillatorType, dur: number, vol: number) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const node = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      node.gain.setValueAtTime(vol, ctx.currentTime);
      node.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      
      osc.connect(node);
      node.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch(e){}
  };

  // Run stamp animation
  const handleStampWax = () => {
    if (stampState === 'stamping') return;
    setStampState('stamping');
    playSynthesizedTone(150, 'triangle', 0.4, 0.25);
    setTimeout(() => {
      setStampState('stamped');
      playSynthesizedTone(380, 'sine', 0.25, 0.12);
      setSelectedIdx(2); // Auto select wax seal on complete to inspect
    }, 1100);
  };

  // Run water infusion/extraction procedure
  const handleStartExtraction = () => {
    if (extractionState === 'brewing') return;
    setExtractionState('brewing');
    setExtractionProgress(0);
    playSynthesizedTone(290, 'sine', 0.6, 0.2);

    // Dynamic steam particles triggers
    const particles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${35 + Math.random() * 15}%`,
      delay: `${i * 0.4}s`,
      duration: `${1.5 + Math.random() * 1.5}s`
    }));
    setSteamParticles(particles);

    const steps = [
      { max: 20, label: 'Aquecendo caldeira e gotejador de cobre...' },
      { max: 45, label: 'Invocando pré-infusão aromática (bloom)...' },
      { max: 70, label: 'Efluxo vertical lento pelo coador cônico...' },
      { max: 95, label: 'Gotejamento artesanal e fusão do esmalte...' },
      { max: 100, label: 'Extração Completa! Sirva-se com afeto.' }
    ];

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 1.5;
      if (currentProg >= 100) {
        currentProg = 100;
        setExtractionProgress(100);
        setExtractionStep('Extração Completa! Desfrute do seu Café 3corações.');
        setExtractionState('done');
        playSynthesizedTone(520, 'sine', 0.5, 0.15);
        clearInterval(interval);
        setSelectedIdx(4); // Highlight ceramic mug on complete
      } else {
        setExtractionProgress(currentProg);
        const activeStep = steps.find(s => currentProg <= s.max);
        if (activeStep) {
          setExtractionStep(activeStep.label);
        }
      }
    }, 120);
  };

  return (
    <div className="space-y-8 pb-12 select-none relative" id="rustic_coffee_studio_card">
      {/* Dynamic Style Injection */}
      <style dangerouslySetInnerHTML={{ __html: fontImportStyle }} />

      {/* Centered Main Layout */}
      <div className="w-full px-2 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Visual Composition Studio Frame */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1a1411] border-4 border-[#3e2516] shadow-2xl p-3 relative group w-full">
          
          {/* Ambient vignette shadow frame inside */}
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 z-10 pointer-events-none" />

          {/* Corner traditional framing brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/40 z-20 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500/40 z-20 pointer-events-none" />

          {/* The Image Canvas containing the main photographic scene */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-[2rem] overflow-hidden bg-black shadow-inner border border-white/5">
            <img 
              src="/assets/images/coffee_rustic_bg_1780760486326.png" 
              alt="Café 3corações Edição Rústica Sofisticada" 
              className="w-full h-full object-cover transition-all duration-1000 scale-[1.01] group-hover:scale-105"
              referrerPolicy="no-referrer"
              style={{ filter: `contrast(1.05) brightness(1.15) saturate(1.1)` }}
            />

            {/* Steam simulation particles floating over drip filter */}
            <AnimatePresence>
              {extractionState === 'brewing' && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {steamParticles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      initial={{ opacity: 0, y: "45%", scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 0.65, 0.3, 0], 
                        y: ["42%", "20%", "5%"],
                        x: ["0%", "5%", "-5%", "2%"],
                        scale: [0.8, 1.4, 2.2, 3] 
                      }}
                      transition={{ 
                        delay: particle.id * 0.25,
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                      className="absolute w-12 h-12 bg-white/10 blur-[15px] rounded-full"
                      style={{ left: particle.left }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Stamped wax seal golden glowing feedback on the label area */}
            <AnimatePresence>
              {stampState === 'stamped' && (
                <motion.div
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute z-20 pointer-events-none"
                  style={{ top: '56%', left: '11%' }}
                >
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/80 bg-red-800/10 animate-pulse flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                    <Sparkles size={18} className="text-amber-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hotspots mapped over the canvas */}
            {COFFEE_HOTSPOTS.map((hotspot, idx) => {
              const isActive = selectedIdx === idx;
              const IconComp = hotspot.icon;
              return (
                <div 
                  key={hotspot.id}
                  className="absolute z-30"
                  style={{ top: hotspot.top, left: hotspot.left }}
                >
                  {/* Pulsating back ring */}
                  <div className={cn(
                    "absolute -inset-4 rounded-full border transition-all duration-500 pointer-events-none",
                    isActive 
                      ? "border-amber-400/80 bg-amber-400/5 animate-pulse shadow-[0_0_20px_#eab308]" 
                      : "border-amber-500/20 bg-transparent group-hover:border-amber-500/40"
                  )} />
                  
                  {/* Pulsating beam ring */}
                  <div className={cn(
                    "absolute -inset-2.5 rounded-full border border-dashed transition-all duration-700 pointer-events-none",
                    isActive 
                      ? "border-amber-400/60 animate-spin" 
                      : "border-transparent"
                  )} 
                    style={{ animationDuration: '10s' }}
                  />

                  {/* Interactive Hotspot Node Button */}
                  <button
                    onClick={() => {
                      setSelectedIdx(idx);
                      playSynthesizedTone(300 + idx * 40, 'sine', 0.2, 0.08);
                    }}
                    className={cn(
                      "relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-2xl shadow-xl",
                      isActive 
                        ? "bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300 text-white hover:scale-110" 
                        : "bg-black/85 border-[#4a2e1d]/90 text-amber-200/90 hover:bg-black hover:border-amber-400 hover:scale-115"
                    )}
                    aria-label={`Visualizar item ${hotspot.title}`}
                  >
                    <IconComp size={12} className={isActive ? "text-white" : "text-amber-400/90"} />

                    {/* Hotspot Hover Mini-Tooltip */}
                    <span className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#1c120c] border border-[#523019] px-2.5 py-1 rounded-lg text-[8px] font-mono uppercase tracking-[0.2em] font-black text-[#fbf8f5] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                      {hotspot.title}
                    </span>
                  </button>
                </div>
              );
            })}

          </div>

{/* Integrated Hotspot details panel embedded below the image - HIDDEN as per user request */}
          {/*
          <div className="mt-4 p-6 bg-[#120d0b] border border-[#3e2516] rounded-3xl shadow-inner text-stone-200">
            
          </div>
          */}


        </div>

        {/* SECTION 2: Interactive Rustic Calendar & Collaborator Attendance List */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="bg-[#181310] border-4 border-[#3e2516] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full"
            id="presence_rustic_manager_panel"
          >
            {/* Cozy hanging wooden signs decor */}
            <div className="absolute top-0 left-12 w-[1px] h-6 bg-amber-800/40" />
            <div className="absolute top-0 left-14 w-[1px] h-10 bg-amber-800/30" />
            <div className="absolute top-0 right-14 w-[1px] h-8 bg-amber-800/30" />

            {/* Dual Pane Layout: Calendar & Duty Roster */}
            <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-12 gap-8 items-start">
              
              {/* LEFT PANEL: Interactive Calendar & Picture of the Month (Column span 5) */}
              <div className="md:col-span-5 lg:col-span-1 xl:col-span-1 2xl:col-span-5 space-y-6">
                
                {/* Calendar Image Frame Card */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-[#3c291d] bg-stone-950 aspect-[16/10] group/cal-img">
                  <img 
                    src={currentMonthImage} 
                    alt={`Ritual do Café - ${currentMonthName}`}
                    className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover/cal-img:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
                  

                </div>

                {/* Practical Calendar grid Box */}
                <div className="bg-[#120d0a] border-2 border-[#2f1c11] rounded-2xl p-5 shadow-inner" id="presence_calendar_widget">
                  
                  {/* Calendar Month & Navigation header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#2d1b10] mb-4">
                    <button 
                      onClick={handlePrevMonth}
                      className="p-1 px-1.5 rounded-lg bg-[#1a110a] border border-[#3e2516] text-[#eab308] hover:bg-amber-950/40 transition-all cursor-pointer"
                      title="Mês Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="text-center">
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#eab308]/75 block">Central de Escalas</span>
                      <h4 className="text-lg font-serif-display font-bold text-white uppercase tracking-wider">
                        {currentMonthName} <span className="text-amber-500 font-mono text-sm">/ {currentMonth.getFullYear()}</span>
                      </h4>
                    </div>

                    <button 
                      onClick={handleNextMonth}
                      className="p-1 px-1.5 rounded-lg bg-[#1a110a] border border-[#3e2516] text-[#eab308] hover:bg-amber-950/40 transition-all cursor-pointer"
                      title="Próximo Mês"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Calendar Days cells */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((dayItem, dayIdx) => {
                      const isSelected = dayItem.fullDateStr === selectedDate;
                      const { total, present } = getAttendanceSummaryForDate(dayItem.fullDateStr);
                      
                      // Today highlight
                      const todayObj = new Date();
                      const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
                      const isToday = dayItem.fullDateStr === todayStr;

                      return (
                        <button
                          key={dayIdx}
                          onClick={() => {
                            setSelectedDate(dayItem.fullDateStr);
                            playSynthesizedTone(350 + dayItem.dayNum * 5, 'sine', 0.12, 0.08);
                          }}
                          className={cn(
                            "relative aspect-square rounded-xl flex flex-col items-center justify-between p-2 transition-all group/day border outline-none cursor-pointer",
                            dayItem.isActiveMonth 
                              ? "text-stone-300 hover:border-amber-500/40" 
                              : "text-stone-600 hover:border-amber-500/20",
                            isSelected 
                              ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-300 shadow-[0_0_15px_#eab308]/40 scale-105 animate-none" 
                              : "bg-[#18110c] border-[#29180d]",
                            isToday && !isSelected ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-black" : ""
                          )}
                        >
                          {/* Day Number */}
                          <div className={cn(
                            "absolute bottom-1 left-2 right-2 h-0.5 rounded-full pointer-events-none",
                            (() => {
                                const baseDate = new Date(2026, 5, 6);
                                const dt = new Date(dayItem.fullDateStr + 'T12:00:00');
                                return Math.floor((dt.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) % 2 === 0 ? "bg-yellow-400" : "bg-transparent";
                            })()
                          )} />
                          <span className={cn(
                            "text-sm font-mono font-bold leading-none self-start",
                            isSelected ? "text-white" : "",
                            !dayItem.isActiveMonth && !isSelected ? "opacity-35" : ""
                          )}>
                            {dayItem.dayNum}
                          </span>

                          {/* Attendances badge inside day cell */}
                          {total > 0 && (
                            <div className="flex gap-0.5 items-center justify-center mt-auto">
                              {isSelected ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse" />
                              ) : (
                                <div className="flex items-center gap-0.5">
                                  {/* Glowing coffee heart icon representation */}
                                  <Heart size={8} className="text-amber-400 fill-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                                  <span className="text-[7px] font-mono text-amber-500 font-bold">
                                    {present}/{total}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Back to Today quick trigger */}
                  <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Hoje: 06 de Junho de 2026
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDate('2026-06-06');
                        setCurrentMonth(new Date(2026, 5, 1));
                        playSynthesizedTone(300, 'triangle', 0.25, 0.1);
                      }}
                      className="px-2 py-1 rounded bg-[#1c120a] hover:bg-[#2c1d11] border border-[#3e2516] text-[#eab308] hover:text-white transition-colors cursor-pointer font-bold"
                    >
                      Ir para Hoje
                    </button>
                  </div>

                </div>

              </div>

              {/* RIGHT PANEL: Collaborators Presence Checklist roster (Column span 7) */}
              <div className="md:col-span-7 lg:col-span-1 xl:col-span-1 2xl:col-span-7 flex flex-col h-full bg-[#110d0a] border-2 border-[#2f1c11] rounded-[2rem] p-6 shadow-inner">
                
                {/* Active Date Title */}
                <div className="pb-4 border-b border-[#2d1b10] mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-[#c79165]/80 block uppercase">
                      LISTA ATIVA DE ATENDIMENTO
                    </span>
                    
                    {/* Format date string for humans */}
                    <h3 className="text-2xl font-serif-display font-medium text-white tracking-wide uppercase mt-0.5">
                      Escala: <span className="text-[#eab308]">
                        {selectedDate.split('-').reverse().join('/')}
                      </span>
                    </h3>
                  </div>

                  {/* Roster Search bar */}
                  <div className="relative max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500 pointer-events-none">
                      <Search size={12} />
                    </span>
                    <input
                      type="text"
                      placeholder="Filtrar colaborador..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-[#18110b] border border-[#3c291d] rounded-xl text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/80 transition-colors"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-white cursor-pointer"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    )}
                  </div>
                </div>

  {/* Quick Gauges / Stats of the selected date */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} className="peer sr-only" />
                        <div className="w-8 h-4 rounded-full bg-stone-800 peer-checked:bg-amber-600 transition-colors" />
                        <span className="text-[10px] font-mono text-stone-500 group-hover:text-amber-400">Feriado Nacional</span>
                    </label>

                    <div className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-2 border",
                        scheduleInfo.working 
                            ? "bg-amber-950/20 border-amber-500/30 text-amber-500" 
                            : "bg-stone-900 border-stone-800 text-stone-500"
                    )}>
                        <span>{scheduleInfo.working ? "🕒" : "🌙"}</span>
                        {scheduleInfo.label}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  
                  {/* Gauge 1: Present count */}
                  <div className="bg-[#17110c] border border-[#2d1a0f] rounded-xl p-3 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-mono text-stone-500 uppercase block mb-1">Presentes</span>
                    <span className="text-xl font-mono font-bold text-amber-500">{totalPresent}</span>
                    <span className="text-[9px] text-stone-600 font-mono">efetivos ativos</span>
                  </div>

                  {/* Gauge 2: Absent count */}
                  <div className="bg-[#17110c] border border-[#2d1a0f] rounded-xl p-3 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-mono text-stone-500 uppercase block mb-1">Faltas</span>
                    <span className="text-xl font-mono font-bold text-red-400">{totalAbsent}</span>
                    <span className="text-[9px] text-stone-600 font-mono">justificadas / ausentes</span>
                  </div>

                  {/* Gauge 3: Presence Rate */}
                  <div className="bg-[#17110c] border border-[#2d1a0f] rounded-xl p-3 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-mono text-stone-500 uppercase block mb-1">Frequência</span>
                    <div className="flex items-center justify-center gap-1">
                      <Percent size={12} className="text-amber-500" />
                      <span className="text-xl font-mono font-bold text-white">{attendancePercentage}%</span>
                    </div>
                    <span className="text-[9px] text-stone-600 font-mono">presença média</span>
                  </div>

                </div>

                {/* Interactive collaborators checklist */}
                <div className="flex-grow space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {filteredRoster.length > 0 ? (
                      filteredRoster.map((item: any) => {
                        const isEditing = editingNoteId === item.id;
                        const isPresent = item.worked;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={cn(
                              "p-3 rounded-xl border flex flex-col gap-2 transition-all",
                              isPresent 
                                ? "bg-[#18120d] border-amber-950/60 hover:border-amber-500/30" 
                                : "bg-[#1c1511]/40 border-stone-800/60 opacity-80"
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              
                              {/* Left contents info */}
                              <div className="flex items-center gap-3">
                                {/* Avatar icon */}
                                <div className={cn(
                                  "w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-mono font-black font-bold",
                                  isPresent 
                                    ? "bg-amber-950/65 border-amber-500/40 text-amber-500" 
                                    : "bg-stone-900 border-stone-800 text-stone-500"
                                )}>
                                  {item.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>

                                <div>
                                  <h4 className="text-xs font-mono font-bold text-stone-200 tracking-wider">
                                    {item.name}
                                  </h4>
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 text-[8px] uppercase">
                                    {item.role || 'Colaborador'}
                                  </span>
                                </div>
                              </div>

                              {/* Action toggle switch present/absent */}
                              <div className="flex items-center gap-2">
                                
                                {/* Presence status select */}
                                <select 
                                  value={item.attendanceStatus || 'nao_informado'}
                                  onChange={(e) => update(ref(rtdb, `escalas/${item.id}`), { attendanceStatus: e.target.value })}
                                  className={cn(
                                    "px-2 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider border cursor-pointer bg-[#1a1310] text-[#eab308] border-[#421d1d]"
                                  )}
                                >
                                  <option value="nao_informado">Status...</option>
                                  <option value="trabalhei">Trabalhei</option>
                                  <option value="falta">Falta</option>
                                  <option value="folguei">Folguei</option>
                                  <option value="sair_cedo">Sair cedo</option>
                                  <option value="cheguei_atrasado">Cheguei atrasado</option>
                                </select>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWorker(item.id)}
                                  className="p-1.5 rounded-lg bg-[#2a170e] hover:bg-red-900/35 text-stone-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-950 cursor-pointer"
                                  title="Remover Registro"
                                >
                                  <Trash2 size={12} />
                                </button>
                                
                              </div>

                            </div>

                            {/* Notes label and inline editor */}
                            <div className="pl-11 pr-2 pb-1 text-[10px] flex items-start gap-2 text-stone-400 font-mono">
                              {isEditing ? (
                                <div className="flex items-center gap-2 w-full mt-1">
                                  <input
                                    type="text"
                                    value={tempNoteText}
                                    onChange={(e) => setTempNoteText(e.target.value)}
                                    className="flex-1 bg-[#120a06] border border-[#4a2e1d] p-1 px-2 rounded text-[10px] text-white outline-none focus:border-amber-500"
                                    placeholder="Insira uma observação..."
                                    autoFocus
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => saveEditedNote(item.id)}
                                    className="px-2 py-1 rounded bg-[#3c2517] border border-amber-500/40 text-[#eab308] font-bold text-[8px] cursor-pointer"
                                  >
                                    SALVAR
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-500 font-bold text-[8px] cursor-pointer"
                                  >
                                    CANCELAR
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full gap-4 text-[9px] bg-[#120c08] border border-stone-950 p-2.5 rounded-lg text-stone-500">
                                  <span className="italic text-[#c79165]/90">
                                    {item.observacao ? `"${item.observacao}"` : "Sem notas de operação."}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => startEditingNote(item)}
                                    className="text-[8px] text-amber-500/70 hover:text-amber-500 uppercase font-black cursor-pointer"
                                  >
                                    Editar Notas
                              </button>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    );
                  }) ) : null}
              </AnimatePresence>
            </div>

            {/* Quick Add Custom Collaborator Container */}
            {activeRoster.length > 0 && (
              <form 
                onSubmit={handleAddCollaborator} 
                className="mt-5 pt-4 border-t border-[#29180f] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
              >
                <div className="sm:col-span-5">
                  <label className="text-[8px] font-mono uppercase tracking-widest text-[#c79165]/80 block mb-1">
                    Nome do Colaborador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Geraldo Fonseca"
                    value={newColabName}
                    onChange={(e) => setNewColabName(e.target.value)}
                    className="w-full bg-[#18110b] border border-[#3c291d] p-1.5 px-2.5 rounded-lg text-[11px] text-stone-200 placeholder-stone-700 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[8px] font-mono uppercase tracking-widest text-[#c79165]/80 block mb-1">
                    Função / Cargo
                  </label>
                  <select
                    value={newColabRole}
                    onChange={(e) => setNewColabRole(e.target.value)}
                    className="w-full bg-[#18110b] border border-[#3c291d] p-1.5 px-2.5 rounded-lg text-[11px] text-stone-300 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Motorista">Motorista</option>
                    <option value="Ajudante">Ajudante</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[8px] font-mono uppercase tracking-widest text-[#c79165]/80 block mb-1">
                    Nota Inicial
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Escala de Viagem"
                    value={newColabNote}
                    onChange={(e) => setNewColabNote(e.target.value)}
                    className="w-full bg-[#18110b] border border-[#3c291d] p-1.5 px-2.5 rounded-lg text-[11px] text-stone-200 placeholder-stone-700 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    className="w-full h-[32px] rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border border-amber-400 hover:border-amber-300 shadow flex items-center justify-center text-stone-950 hover:scale-105 transition-transform cursor-pointer"
                    title="Adicionar Novo Colaborador"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </motion.div>

    </div>
  </div>
  );
}
