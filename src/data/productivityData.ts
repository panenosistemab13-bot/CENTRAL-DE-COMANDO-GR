export interface CollaboratorProductivity {
  id: string;
  rank: number;
  name: string;
  productivity: number; // Unidades apanhadas / conferidas
  movements: number; // Movimentações / Ordens
  percentage: number; // Participação %
  growth: number; // Ex: 7.9%
  category?: string; // Separação, Conferência, Empilhadeira
  shift?: string; // 1º Turno, 2º Turno, 3º Turno
  sparklineData?: number[];
}

export const INITIAL_COLLABORATORS: CollaboratorProductivity[] = [
  {
    id: 'colab-1',
    rank: 1,
    name: 'WESLLEY ALAN DE OLIVEIRA SOUSA',
    productivity: 57095,
    movements: 1122,
    percentage: 14.12,
    growth: 7.9,
    category: 'CONF VOLUME',
    shift: '1º Turno',
    sparklineData: [42, 45, 48, 52, 50, 55, 57]
  },
  {
    id: 'colab-2',
    rank: 2,
    name: 'ITALO RODRIGUES SILVA',
    productivity: 37142,
    movements: 972,
    percentage: 9.19,
    growth: 7.9,
    category: 'SEPARAÇÃO',
    shift: '1º Turno',
    sparklineData: [28, 30, 32, 35, 34, 36, 37]
  },
  {
    id: 'colab-3',
    rank: 3,
    name: 'ELISANDRO ERMELINDO ABADE AMARAL',
    productivity: 30703,
    movements: 569,
    percentage: 7.60,
    growth: 7.9,
    category: 'CONF VOLUME',
    shift: '2º Turno',
    sparklineData: [22, 24, 26, 28, 27, 29, 30.7]
  },
  {
    id: 'colab-4',
    rank: 4,
    name: 'CLEITON MARCOS CATALUNHA SANTOS',
    productivity: 25231,
    movements: 408,
    percentage: 6.24,
    growth: 7.9,
    category: 'SEPARAÇÃO',
    shift: '2º Turno',
    sparklineData: [18, 19, 21, 23, 22, 24, 25.2]
  },
  {
    id: 'colab-5',
    rank: 5,
    name: 'BRUNO DINIZ PEREIRA',
    productivity: 21326,
    movements: 517,
    percentage: 5.28,
    growth: 7.9,
    category: 'CONF VOLUME',
    shift: '1º Turno',
    sparklineData: [16, 17, 18, 19, 20, 20.8, 21.3]
  },
  {
    id: 'colab-6',
    rank: 6,
    name: 'MAGNO INACIO GOMES',
    productivity: 21210,
    movements: 1361,
    percentage: 5.25,
    growth: 7.9,
    category: 'MOVIMENTAÇÃO',
    shift: '3º Turno',
    sparklineData: [15, 17, 18, 20, 19, 20.5, 21.2]
  },
  {
    id: 'colab-7',
    rank: 7,
    name: 'LUCAS GABRIEL FERREIRA',
    productivity: 18450,
    movements: 380,
    percentage: 4.56,
    growth: 6.5,
    category: 'SEPARAÇÃO',
    shift: '1º Turno',
    sparklineData: [14, 15, 16, 17, 17.5, 18, 18.4]
  },
  {
    id: 'colab-8',
    rank: 8,
    name: 'RODRIGO APARECIDO DE SOUZA',
    productivity: 16980,
    movements: 345,
    percentage: 4.20,
    growth: 5.8,
    category: 'CONF VOLUME',
    shift: '2º Turno',
    sparklineData: [12, 13, 14, 15, 15.5, 16.2, 16.9]
  },
  {
    id: 'colab-9',
    rank: 9,
    name: 'MARCOS VINICIUS ALMEIDA',
    productivity: 15420,
    movements: 290,
    percentage: 3.81,
    growth: 6.1,
    category: 'SEPARAÇÃO',
    shift: '1º Turno',
    sparklineData: [11, 12, 13, 14, 14.5, 15, 15.4]
  },
  {
    id: 'colab-10',
    rank: 10,
    name: 'FELIPE AUGUSTO CARDOSO',
    productivity: 14110,
    movements: 275,
    percentage: 3.49,
    growth: 5.2,
    category: 'CONF VOLUME',
    shift: '3º Turno',
    sparklineData: [10, 11, 12, 12.8, 13.2, 13.8, 14.1]
  },
  {
    id: 'colab-11',
    rank: 11,
    name: 'GABRIEL HENRIQUE NASCIMENTO',
    productivity: 12890,
    movements: 240,
    percentage: 3.19,
    growth: 4.9,
    category: 'SEPARAÇÃO',
    shift: '2º Turno',
    sparklineData: [9, 10, 11, 11.5, 12, 12.4, 12.8]
  },
  {
    id: 'colab-12',
    rank: 12,
    name: 'THIAGO CARVALHO DE OLIVEIRA',
    productivity: 11650,
    movements: 215,
    percentage: 2.88,
    growth: 4.5,
    category: 'MOVIMENTAÇÃO',
    shift: '1º Turno',
    sparklineData: [8, 9, 9.8, 10.4, 10.9, 11.2, 11.6]
  },
  {
    id: 'colab-13',
    rank: 13,
    name: 'ALEXANDRE PEREIRA MARTINS',
    productivity: 10420,
    movements: 195,
    percentage: 2.58,
    growth: 5.1,
    category: 'SEPARAÇÃO',
    shift: '3º Turno',
    sparklineData: [7, 8, 8.5, 9.2, 9.7, 10.1, 10.4]
  },
  {
    id: 'colab-14',
    rank: 14,
    name: 'RAFAEL DOS SANTOS BARBOSA',
    productivity: 9850,
    movements: 180,
    percentage: 2.44,
    growth: 4.3,
    category: 'CONF VOLUME',
    shift: '1º Turno',
    sparklineData: [7, 7.5, 8.2, 8.8, 9.1, 9.5, 9.8]
  },
  {
    id: 'colab-15',
    rank: 15,
    name: 'LEANDRO COSTA RIBEIRO',
    productivity: 9120,
    movements: 165,
    percentage: 2.26,
    growth: 3.9,
    category: 'SEPARAÇÃO',
    shift: '2º Turno',
    sparklineData: [6.5, 7.1, 7.8, 8.2, 8.5, 8.9, 9.1]
  },
  {
    id: 'colab-16',
    rank: 16,
    name: 'DIEGO FERNANDES LIMA',
    productivity: 8640,
    movements: 152,
    percentage: 2.14,
    growth: 4.0,
    category: 'MOVIMENTAÇÃO',
    shift: '1º Turno',
    sparklineData: [6, 6.7, 7.2, 7.6, 8.0, 8.3, 8.6]
  },
  {
    id: 'colab-17',
    rank: 17,
    name: 'DOUGLAS HENRIQUE VIANA',
    productivity: 8150,
    movements: 140,
    percentage: 2.02,
    growth: 3.8,
    category: 'CONF VOLUME',
    shift: '2º Turno',
    sparklineData: [5.8, 6.3, 6.9, 7.2, 7.5, 7.8, 8.1]
  },
  {
    id: 'colab-18',
    rank: 18,
    name: 'WAGNER BATISTA DA SILVA',
    productivity: 7820,
    movements: 135,
    percentage: 1.93,
    growth: 3.5,
    category: 'SEPARAÇÃO',
    shift: '3º Turno',
    sparklineData: [5.5, 6.0, 6.5, 6.9, 7.2, 7.5, 7.8]
  },
  {
    id: 'colab-19',
    rank: 19,
    name: 'FERNANDO DIAS MACHADO',
    productivity: 7340,
    movements: 128,
    percentage: 1.82,
    growth: 3.2,
    category: 'MOVIMENTAÇÃO',
    shift: '1º Turno',
    sparklineData: [5.2, 5.7, 6.1, 6.5, 6.8, 7.1, 7.3]
  },
  {
    id: 'colab-20',
    rank: 20,
    name: 'ANDERSON ROCHA PINTO',
    productivity: 6980,
    movements: 120,
    percentage: 1.73,
    growth: 3.1,
    category: 'SEPARAÇÃO',
    shift: '2º Turno',
    sparklineData: [4.9, 5.3, 5.8, 6.2, 6.5, 6.8, 6.9]
  },
  // Operadores 21 a 69 gerados de forma consistente para somar o total de 69 colaboradores
  ...Array.from({ length: 49 }).map((_, index) => {
    const rank = index + 21;
    const baseProd = Math.max(1200, Math.round(6800 - index * 110));
    const baseMoves = Math.max(25, Math.round(115 - index * 1.8));
    const pct = Number(((baseProd / 404219) * 100).toFixed(2));
    const names = [
      'MARCELO TAVARES DE SOUZA', 'JULIO CESAR CORREIA', 'PAULO RICARDO MORAES',
      'FABRICIO GOMES MOREIRA', 'CAIO CESAR MONTEIRO', 'VITOR HUGO TEIXEIRA',
      'GUSTAVO HENRIQUE BRAGA', 'DANILO FERREIRA CAMPOS', 'RENATO LOPES CASTRO',
      'SAMUEL ALVES COUTINHO', 'ADRIANO SOARES FONSECA', 'IGOR MATHEUS GUIMARAES',
      'LUCAS MOREIRA DUARTE', 'LEONARDO SANTOS NOGUEIRA', 'ROBSON XAVIER PACHECO',
      'DENIS AUGUSTO PRADO', 'EDSON LUIZ RAMOS', 'JEFFERSON VIEIRA RESENDE',
      'VALMIR PEREIRA SALGADO', 'CLAUDIO MARCIO TELES', 'FABIO JUNIOR VALENTIM',
      'ALAN KARDEC ZANIN', 'CLEBER ANTONIO BARROS', 'MOACIR DE CARVALHO NETO',
      'CRISTIANO ROCHA DIAS', 'EMERSON SILVA ESTEVES', 'SERGIO MURILO FRANCA',
      'ELTON JOHN GALVAO', 'HELIO BICUDO HORTA', 'ISRAEL CARDOSO ISIDORO',
      'JORGE LUIS JARDIM', 'KLEBER LUCAS KOCH', 'LAERTE MENDES LEMOS',
      'NELSON NED NORONHA', 'OTAVIO AUGUSTO OLIVA', 'PLINIO MARCOS PINHO',
      'QUIRINO JOSE QUEIROZ', 'REINALDO SILVA REIS', 'SEBASTIAO BENTO SA',
      'TARCISIO MEIRA TOLEDO', 'UBIRATAN GOMES UCHOA', 'VINICIUS DE MORAIS VAZ',
      'WALDIR PEREIRA WALSH', 'YURI GAGARIN YOSHIDA', 'ZACARIAS MENDES ZEMA',
      'BRENO AUGUSTO ALCANTARA', 'CASSIO FELIPE BITTENCOURT', 'DANIEL OTAVIO COELHO',
      'ENRICO DANTAS EVANGELISTA'
    ];
    const name = names[index % names.length];
    return {
      id: `colab-${rank}`,
      rank,
      name,
      productivity: baseProd,
      movements: baseMoves,
      percentage: pct,
      growth: Number((3.5 - (index * 0.04)).toFixed(1)),
      category: index % 3 === 0 ? 'CONF VOLUME' : index % 3 === 1 ? 'SEPARAÇÃO' : 'MOVIMENTAÇÃO',
      shift: index % 3 === 0 ? '1º Turno' : index % 3 === 1 ? '2º Turno' : '3º Turno',
      sparklineData: [
        baseProd * 0.7,
        baseProd * 0.75,
        baseProd * 0.82,
        baseProd * 0.88,
        baseProd * 0.92,
        baseProd * 0.97,
        baseProd
      ]
    };
  })
];

export const STORAGE_KEY_PRODUCTIVITY = 'saga_wms_productivity_collaborators_v1';

export function loadStoredCollaborators(): CollaboratorProductivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTIVITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler dados de produtividade salvos:', err);
  }
  return INITIAL_COLLABORATORS;
}

export function saveStoredCollaborators(data: CollaboratorProductivity[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTIVITY, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar dados de produtividade:', err);
  }
}
