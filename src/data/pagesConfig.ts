import React from 'react';
import { 
  Globe, 
  Container, 
  Users2, 
  FileCheck2, 
  CalendarDays, 
  Route, 
  ClipboardCheck, 
  Sliders, 
  Package, 
  ShieldAlert, 
  Activity, 
  Truck, 
  Radio,
  FileSpreadsheet,
  Building2,
  Lock,
  LayoutGrid
} from 'lucide-react';

export interface PageDefinition {
  id: string;
  label: string;
  buttonLabel: string;
  category: string;
  description: string;
  iconName: string;
  color?: string;
  badge?: string;
  isDefaultVisible: boolean;
  isRestrictedByDefault: boolean;
  isCustom?: boolean;
}

export const ICON_MAP: Record<string, React.ElementType> = {
  Globe,
  Container,
  Users2,
  FileCheck2,
  CalendarDays,
  Route,
  ClipboardCheck,
  Sliders,
  Package,
  ShieldAlert,
  Activity,
  Truck,
  Radio,
  FileSpreadsheet,
  Building2,
  LayoutGrid
};

export const DEFAULT_PAGES: PageDefinition[] = [
  { 
    id: 'patio', 
    label: 'Pátio', 
    buttonLabel: 'Logística', 
    category: 'Operacional & Frota',
    iconName: 'Container',
    description: 'Gestão inteligente de entrada, saída, disponibilidade e vistorias de veículos no pátio.',
    isDefaultVisible: true,
    isRestrictedByDefault: false,
    badge: 'Logística'
  },
  { 
    id: 'checklist', 
    label: 'Checklist', 
    buttonLabel: 'Vistorias', 
    category: 'Vistorias & Frota',
    iconName: 'ClipboardCheck',
    description: 'Controle de validade e vistorias técnicas de periféricos e equipamentos da frota.',
    isDefaultVisible: true,
    isRestrictedByDefault: false,
    badge: 'Inspeção'
  },
  { 
    id: 'averbacao', 
    label: 'Averbação', 
    buttonLabel: 'Seguros', 
    category: 'Seguros & Documentos',
    iconName: 'FileCheck2',
    description: 'Gestão de apólices, gerador de códigos e seguros integrados de transporte.',
    isDefaultVisible: true,
    isRestrictedByDefault: false,
    badge: 'Apólices'
  },
  { 
    id: 'sm_creator', 
    label: 'SM (Monitoramento)', 
    buttonLabel: 'Eventos', 
    category: 'Eventos & PGR',
    iconName: 'CalendarDays',
    description: 'Criação e agendamento de solicitações de monitoramento e viagens.',
    isDefaultVisible: true,
    isRestrictedByDefault: false,
    badge: 'Monitoramento'
  },
  { 
    id: 'controle', 
    label: 'Controle', 
    buttonLabel: 'Gerais', 
    category: 'Operações Gerais',
    iconName: 'Sliders',
    description: 'Gerador inteligente de controle, status de bateria, pré-alerta e iscas.',
    isDefaultVisible: true,
    isRestrictedByDefault: false,
    badge: 'Gerais'
  },
  { 
    id: 'presence', 
    label: 'Lista de Presença', 
    buttonLabel: 'Efetivo', 
    category: 'Efetivo & Escala',
    iconName: 'Users2',
    description: 'Controle diário de escala, presença de equipe e agenda de compromissos.',
    isDefaultVisible: false,
    isRestrictedByDefault: true,
    badge: 'Efetivo'
  },
  { 
    id: 'rotas', 
    label: 'Rotas', 
    buttonLabel: 'Logística', 
    category: 'Mapeamento & Rotas',
    iconName: 'Route',
    description: 'Otimização, códigos de rotas operacionais e mapeamento de percursos.',
    isDefaultVisible: false,
    isRestrictedByDefault: true,
    badge: 'Trajetos'
  },
  { 
    id: 'slides', 
    label: 'Slides 4K HUD', 
    buttonLabel: 'Command Center 4K', 
    category: 'Painel Executivo',
    iconName: 'Globe',
    description: 'Dashboard executivo 4K com mapa-múndi holográfico 3D, status de viagens e unidades.',
    isDefaultVisible: false,
    isRestrictedByDefault: true,
    badge: '4K HUD 3D'
  }
];

const VISIBILITY_STORAGE_KEY = 'pgr_page_visibility_v2';
const CUSTOM_PAGES_STORAGE_KEY = 'pgr_custom_pages_v2';

export function getStoredCustomPages(): PageDefinition[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PAGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error('Erro ao ler páginas customizadas:', err);
  }
  return [];
}

export function saveStoredCustomPages(pages: PageDefinition[]) {
  try {
    localStorage.setItem(CUSTOM_PAGES_STORAGE_KEY, JSON.stringify(pages));
  } catch (err) {
    console.error('Erro ao salvar páginas customizadas:', err);
  }
}

export function getAllAvailablePages(): PageDefinition[] {
  const custom = getStoredCustomPages();
  const baseMap = new Map<string, PageDefinition>();
  
  DEFAULT_PAGES.forEach(p => baseMap.set(p.id, p));
  custom.forEach(p => baseMap.set(p.id, p));
  
  return Array.from(baseMap.values());
}

export function loadPageVisibility(): Record<string, boolean> {
  const allPages = getAllAvailablePages();
  const visibility: Record<string, boolean> = {};

  // Default values
  allPages.forEach(page => {
    visibility[page.id] = page.isDefaultVisible;
  });

  // Check new key
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.keys(parsed).forEach(k => {
          visibility[k] = Boolean(parsed[k]);
        });
        return visibility;
      }
    }
  } catch (err) {
    console.error('Erro ao carregar visibilidade:', err);
  }

  // Fallback to legacy keys
  try {
    const showPresence = localStorage.getItem('show_presence_list');
    if (showPresence !== null) visibility.presence = showPresence === 'true';

    const showRotas = localStorage.getItem('show_rotas_page');
    if (showRotas !== null) visibility.rotas = showRotas === 'true';

    const showSlides = localStorage.getItem('show_slides');
    if (showSlides !== null) visibility.slides = showSlides === 'true';
  } catch (e) {
    // Ignore
  }

  return visibility;
}

export function savePageVisibility(visibility: Record<string, boolean>) {
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
    
    // Also keep legacy keys in sync
    if (visibility.presence !== undefined) {
      localStorage.setItem('show_presence_list', String(visibility.presence));
    }
    if (visibility.rotas !== undefined) {
      localStorage.setItem('show_rotas_page', String(visibility.rotas));
    }
    if (visibility.slides !== undefined) {
      localStorage.setItem('show_slides', String(visibility.slides));
    }
  } catch (err) {
    console.error('Erro ao salvar visibilidade:', err);
  }
}
