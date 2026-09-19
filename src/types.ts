export type Tab = 
  | 'menu' 
  | 'slides' 
  | 'presence' 
  | 'risk' 
  | 'averbacao' 
  | 'sm_creator' 
  | 'rotas' 
  | 'patio' 
  | 'checklist' 
  | 'controle' 
  | 'escala'
  | 'mapa_riscos'
  | 'alertas'
  | 'relatorios'
  | 'monitoramento';

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}
