/**
 * Lista de transportadoras padronizadas e algoritmo de correspondência inteligente (Fuzzy Matcher)
 */

export const DEFAULT_TRANSPORTADORAS: string[] = [
  'TORNADO',
  'JFW',
  '2M TRANSPORTES',
  'ACS TRANSPORTE',
  'ADVANCE TRANSPORTE',
  'AGV',
  'ALLISSON LOG',
  'ALMEIDA',
  'ANJOS',
  'ATLAS',
  'BCA EXPRESS SERV DE ENCOM LTDA',
  'BERTOLINE',
  'BLUE YELLOW TRANSPORTES E LOGÍSTICA',
  'BRASIL CARGAS',
  'CIMARCO',
  'CLICK (CFC)',
  'COOPER CARGA',
  'COOTRACAP',
  'COOTRAVALE',
  'TRANSDALLAS',
  'DELMAR TRANSPORTES',
  'DINIZ',
  'DMA',
  'DAS TRANSPORTES',
  'EFFICACY',
  'EMF',
  'EPC TRANSPORTES E LOGÍSTICA LTDA EP',
  'EXCLUSIVA',
  'FARMARC',
  'FAVORITA TRANSPORTES',
  'FB CARGAS',
  'FEDEX',
  'FERNÃO DIAS',
  'TRANSPORTADORA FOCCO',
  'FT LOG',
  'GEFCO',
  'GIRO TRANSPORTES',
  'GOBOR',
  'GVM',
  'JS EXPRESSO LOGÍSTICA',
  'KB TRANSPORTES',
  'LAFER',
  'LIONS',
  'LIPPAUS',
  'MEGALOG',
  'MERIDIONAL',
  'MVA TRANSP',
  'MADRI',
  'OLIVEIRA',
  'OMAR',
  'OTM',
  'PALETES OK',
  'PEDRAS BRASIL',
  'PORTO SUL',
  'PIVATO',
  'PREST SERV (TECPET)',
  'PRINT',
  'RAPIDÃO COMETA',
  'REC TRANS',
  'RIACHO',
  'RODOTRIL',
  'RODOTRANS',
  'ROTA',
  'SAM TRANSPORTES',
  'SAMSUNG SDS',
  'SMART',
  'SMART CLIENTE',
  'SPEED BOY',
  'SOUZA MAIA',
  'TCM',
  'TC PORT',
  'TELE CARGA EXPRESS TRANSPORTE ROD',
  'THX',
  'TOMASI',
  'TRANSPORTADORA AMÉRICO',
  'TRANSCCEMA',
  'TRANSMARONI',
  'TRANSPANORAMA',
  'TRACE SOLUÇÕES INTEGRADAS DE LOGÍSTICA LTDA',
  'TRANSCORDEIRO',
  'TRANSFAR',
  'TRANSIMÕES',
  'TRANSNOVY SERVIÇOS E TRANSPORTE LTDA',
  'TRANSOLIVEIRA',
  'TRANSRODAS',
  'TRANSPIZZATO',
  'USIFAST',
  'VIA MUNDI TRANSPORTES',
  'VILA NOVA DO BRASIL (B3)',
  'VITORINI',
  'ZEAGOSTINHO LOGÍSTICA TRANS DISTR LTDA',
  'CAMILO',
  'TADEU TRANSPORTES',
  'VIC LOGISTICA',
  'PRIME',
  'MILA',
  'FAST SOLUTION',
  'ABC CAMINHOES',
  'VWT TRANSPORTES',
  'LOGIC',
  'COOPMETRO',
  'TRANSROUTE',
  'DOCALOG',
  'TRANSVICON',
  'ABREU',
  'DTS',
  'ROVIL',
  'APK',
  'BECKMAN',
  'MANDALOG',
  'RAPIDO MINAS',
  'PAVAO',
  'CARRARO LOG',
  'SANTA CLARA',
  'FB E CD MINAS',
  'LMA',
  'PORTUGA',
  'LAFAIETE',
  'CAFE PIMPINELE',
  'PONTUAL',
  'UTISEG TRANSPORTES',
  'SERRAF',
  'RENOVACAO',
  'DIX LOGISTICA',
  'STL',
  'JETTA',
  'ALLISSON',
  'DEFINITIVA',
  'J A TRANPOR',
  'GT MINAS',
  'DONNA TRANS',
  'CIEM TRANSPORTES',
  'VEX',
  'FIEL LOG',
  'POLI LOGISTICA',
  'KADU',
  'JBS',
  'TOTAL SERVICE',
  'IDR EXPRESS',
  'TSG (TRANSPORTES SILVEIRA GOMES)',
  'MF D SANTO',
  'REC TRANSP',
  'CRUZEIRO',
  'SANCHES',
  'REIS TRANSP',
  'DESAFIO',
  'FIGUEIREDO',
  'GLOBAL',
  'AMA TRANSP',
  'EXP KARISA',
  'NORTELOG',
  'TIM TRANSPORTES',
  'RODO-K TRANSPORTES',
  'HC TRANSP',
  'CIRCULO',
  'REITER LOG',
  'TECPET',
  'PREST SERV',
  'TRANSPORTES VIVAN',
  'ALIANCA NAV',
  'MINAS BRASIL',
  'TRANSPENNA',
  'JCK TRANSP',
  'SANSIL',
  'SALOB',
  'MOEDENSE',
  '(OP/HNK) ALMEIDA',
  'MULTIMODAL',
  'DO VALLE',
  'TRANSDANIEL',
  'TRANS DANIEL',
  'LUBIANA',
  'TRANS LUCAS',
  'SABA',
  'UNITRANS',
  'INOVA LOG',
  'LEDIFRAN',
  'FASI',
  'EXCELL LOG',
  'TRANSAZIZ',
  'MALIBU',
  'SAO MIGUEL',
  'ROT',
  'SEQUOIA',
  'MORAIS FIG',
  'TRANSPREMIO',
  'ZAGNOLI',
  'QSERLOG',
  'GEL TRANSPORTES',
  'TRANS KOTHE',
  'TRANSBEN TRANSPORTES',
  'NUTRITEC',
  'CORREIOS',
  'FM TRANSP',
  'RP TRANSP',
  'TOCANTINS',
  'TRANSBONO',
  'INTEGRAL TRANSPORTES',
  'TRANSFOLHA',
  'ALLI LOGISTICA',
  'BEIRA ALTA',
  'RIZZA TRANSPORTES',
  'TOTALEXPRES',
  'TRES CORACOES ALIMENTOS S/A',
  '3C',
  'TRES CORACOES ALIMENTOS SA',
  'BUSSOLA LOGISTICA LTDA',
  'TDM TRANSPORTES',
  'TRANSPORTES NATAL',
  'APEFERR COM FERR EPI S MAQUINAS LTD',
  'FL BRASIL HOLDING LOGISTICA E TRANS',
  'JAMEF TRANSPORTES EIRELI',
  'PRESTEX ENCOMENDAS EXPRESSAS LTDA',
  'EXATA CARGO LTDA',
  'BAR DO AVIAO LTDA ME',
  'REDE DE SERVICOS LOGISTICOS LTDA',
  'UTISEG TRANSPORTES E LOCACOES LTDA',
  'MODULAR TRANSPORTES LTDA',
  'ALESSANDRA DALVA PERES DA SILVA',
  'CIA IGUACU DE CAFE SOLUVEL',
  'RODONAVES TRANSPORTES E ENCOME',
  'UNICARGO TRANSPORTES E CARGAS LTDA',
  'FIBRA TRANSPORTES LTDA',
  'CAFE TRES CORACOES S A',
  'EXPRESSO RENOVACAO - EIRELI',
  'TRANSBEN TRANSPORTES LTDA',
  'COMTRASIL COMERCIO E TRANSPORTES LT',
  'LOGMAM TRANSPORTES LTDA',
  'SR LOG',
  'MONTSERRAT',
  'TRANSMAGNA',
  'GMM',
  'BOMLOG',
  'COMBOIO',
  'JC TRANSPORTES',
  'MARVEL',
  'BELLUNO',
  'REAL 94',
  'RODORUMO',
  'MAHNIC',
  'VINHEDOS',
  'TRANSFLORIO',
  'JALOTO',
  '5 ESTRADAS',
  'COOCATRANS',
  'EXPERLOG',
  'TCL',
  'TOP DAS GALAXIAS',
  'BLUE YELLOW',
  'TRANSCOURIER',
  'LOGLINE',
  'BLUE TRANSPORTADORA',
  'SRH SARAIVA',
  'FUJIOKA',
  'SUMMER REPRESENTAÇOES',
  'PACTUAL',
  'NORCOAST',
  'LEMME CARGO',
  'ROBERDAN',
  'TRANSFACE',
  'AM CARGAS',
  'SAMID',
  'RNCGG',
  'JCE TRANSPORTES',
  'IRMÃOS FRANCO',
  'DV3 SOLUÇÕES',
  'RGS TRANSPORTES',
  'FB LOG',
  'C D C S A',
  'MERCOTRUCK',
  'TRANSPORTES BAGGETO',
  'LB LOGÍSTICA',
  'COOPERMERCOSUL',
  'TERRA MASTER',
  'UNITRADING LOG',
  'JAUSER DO BRASIL',
  'TRANS CAACUPE',
  'UNITRADING',
  'SERINCAR',
  'MODERN LOGISTICS',
  'JRL TRANSPORTES',
  'VALIM OLIVEIRA',
  'PEREGRINA',
  'MONSON',
  'UNIÃO MULTIMODAL',
  'BUZIN TRANSPORTES',
  'RODOTEC',
  'RODOTRANSFER',
  'RODOFEDERAL'
];

// Helper para normalizar string (remover acentos, pontuações, múltiplos espaços)
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Remove palavras comuns de razão social para comparação do nome principal
const stripNoiseWords = (str: string): string => {
  const sanitized = sanitizeString(str);
  const noiseRegex = /\b(TRANSPORTADORA|TRANSPORTES|TRANSPORTE|TRANSPORT|TRANSP|LOGISTICA|LOG|SERVICOS|SERV|EXPRESSO|EXPRESS|EIRELI|LTDA|ME|EPP|EP|S\/A|SA|DO BRASIL|BRASIL|DE|E|EM)\b/gi;
  return sanitized.replace(noiseRegex, ' ').replace(/\s+/g, ' ').trim();
};

// Distância de Levenshtein para cálculo de similaridade
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // remoção
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Calcula score de similaridade (0 a 1)
const stringSimilarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
};

/**
 * Função de correspondência inteligente: encontra a transportadora padronizada mais próxima
 */
export const findClosestTransportador = (
  rawInput: string,
  candidateList: string[] = DEFAULT_TRANSPORTADORAS
): { matchedName: string; confidence: number; isExact: boolean } => {
  if (!rawInput || !rawInput.trim()) {
    return { matchedName: 'TRANSMAGNA', confidence: 0, isExact: false };
  }

  const raw = rawInput.trim();
  const cleanRaw = sanitizeString(raw);
  const coreRaw = stripNoiseWords(raw);

  // Mapeamentos diretos conhecidos
  if (/TORNADOLOG|TORNADO/i.test(raw)) {
    const found = candidateList.find(c => c === 'TORNADO');
    if (found) return { matchedName: found, confidence: 1, isExact: true };
  }
  if (/\b3C\b|FROTA 3C|TRES CORACOES/i.test(raw)) {
    const found = candidateList.find(c => c === '3C' || c.startsWith('TRES CORACOES'));
    if (found) return { matchedName: found, confidence: 1, isExact: true };
  }
  if (/TRANSMAGNA/i.test(raw)) {
    const found = candidateList.find(c => c === 'TRANSMAGNA');
    if (found) return { matchedName: found, confidence: 1, isExact: true };
  }

  // 1. Verificação Exata (case-insensitive)
  for (const candidate of candidateList) {
    if (candidate.toUpperCase() === raw.toUpperCase()) {
      return { matchedName: candidate, confidence: 1, isExact: true };
    }
  }

  // 2. Verificação Sanitizada Exata
  for (const candidate of candidateList) {
    if (sanitizeString(candidate) === cleanRaw) {
      return { matchedName: candidate, confidence: 0.98, isExact: true };
    }
  }

  // 3. Verificação pelo Núcleo do Nome (Core sem "Transportes", "Ltda", etc)
  if (coreRaw.length >= 3) {
    for (const candidate of candidateList) {
      const coreCandidate = stripNoiseWords(candidate);
      if (coreCandidate === coreRaw && coreCandidate.length >= 3) {
        return { matchedName: candidate, confidence: 0.95, isExact: false };
      }
    }
  }

  // 4. Substring / Inclusão de Tokens
  for (const candidate of candidateList) {
    const cleanCand = sanitizeString(candidate);
    const coreCand = stripNoiseWords(candidate);

    if (cleanCand.length >= 4 && (cleanRaw.includes(cleanCand) || cleanCand.includes(cleanRaw))) {
      return { matchedName: candidate, confidence: 0.90, isExact: false };
    }

    if (coreCand.length >= 4 && (cleanRaw.includes(coreCand) || coreRaw.includes(coreCand))) {
      return { matchedName: candidate, confidence: 0.88, isExact: false };
    }
  }

  // 5. Similaridade por Levenshtein & Tokens
  let bestMatch = candidateList[0] || 'TRANSMAGNA';
  let bestScore = 0;

  const rawTokens = cleanRaw.split(' ').filter(t => t.length >= 3);

  for (const candidate of candidateList) {
    const cleanCand = sanitizeString(candidate);
    const coreCand = stripNoiseWords(candidate);

    const scoreFull = stringSimilarity(cleanRaw, cleanCand);
    const scoreCore = coreRaw && coreCand ? stringSimilarity(coreRaw, coreCand) : 0;

    let tokenScore = 0;
    const candTokens = cleanCand.split(' ').filter(t => t.length >= 3);
    for (const rTok of rawTokens) {
      for (const cTok of candTokens) {
        const sim = stringSimilarity(rTok, cTok);
        if (sim > tokenScore) tokenScore = sim;
      }
    }

    const finalScore = Math.max(scoreFull, scoreCore * 1.05, tokenScore * 0.9);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMatch = candidate;
    }
  }

  // Se score for aceitável (> 0.40), usa o melhor match; caso contrário retorna o melhor candidato
  return {
    matchedName: bestMatch,
    confidence: bestScore,
    isExact: bestScore >= 0.95
  };
};
