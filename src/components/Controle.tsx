import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Copy, 
  Check, 
  ArrowLeft, 
  User, 
  CreditCard, 
  Phone, 
  Info,
  Sliders,
  Send,
  Sparkles,
  FileText,
  Truck,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

// Vintage Screw component
function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

const TRANSPORTADORAS = [
  'apk',
  'tomasi',
  'moedense',
  'Frota 3C',
  'TRANSMAGNA',
  'RNCGG',
  'GT MINAS',
  'GOBOR',
  'SRH SARAIVA',
  'PACTUAL',
  'JETTA',
  'TECPET',
  'TRANS DANIEL',
  'UTISEG TRANSPORTES E LOCACOES LTDA',
  'COMBOIO',
  'REAL 94',
  'TORNADO',
  'FUJIOKA',
  'MERCOTRUCK',
  'UNITRADING LOG'
];

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // State for all form fields
  const [saudacao, setSaudacao] = useState('Boa tarde,');
  const [alertaResgate, setAlertaResgate] = useState('Favor se atentar ao resgate!');
  const [infoAbaixo, setInfoAbaixo] = useState('Atentar às informações abaixo:');
  
  // Routes & Warning lines
  const [rota1, setRota1] = useState('SANTA LUZIA/MG x GUARULHOS/SP');
  const [instrucao1, setInstrucao1] = useState('Favor, acusar o recebimento do pré-alerta;');

  // Table information (CCC.PNG layout)
  const [numeroNf, setNumeroNf] = useState('2970815 - 2970843');
  const [transportadora, setTransportadora] = useState('moedense');
  const [motorista, setMotorista] = useState('GILDEI FERREIRA DA CUNHA');
  const [cavalo, setCavalo] = useState('PWD4E25');
  
  // Row 1 lists (Carreta 1, Isca 1, Produto 1, UMA 1)
  const [carreta1, setCarreta1] = useState('FQC2B85');
  const [carreta2, setCarreta2] = useState('FQG1D53');
  const [isca1, setIsca1] = useState('R100002195');
  const [isca2, setIsca2] = useState('R100003797');
  const [produto1, setProduto1] = useState('12031007');
  const [produto2, setProduto2] = useState('12031007');
  const [uma1, setUma1] = useState('013.490.990.005');
  const [uma2, setUma2] = useState('013.439.400.547');
  
  const [destino, setDestino] = useState('GUARULHOS/SP');
  const [dataEnviada, setDataEnviada] = useState('26-jun.');
  
  // Parametrização and Esquema de Embarque
  const [parametrizacao, setParametrizacao] = useState('Parametrização das iscas');
  const [esquemaEmbarque, setEsquemaEmbarque] = useState('CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA');

  // Isca positions (addresses, times and battery level) matching the image exactly
  const [isca1Endereco, setIsca1Endereco] = useState('rod mg-020 – santa luzia - mg - brazil - 0 a 0 - santa luzia - MG');
  const [isca2Endereco, setIsca2Endereco] = useState('r Quarenta E Tres - Santa Luzia - Mg - Brazil - 189 A 278 - santa Luzia - MG');
  const [isca1Data, setIsca1Data] = useState('26/06/2026 22:29:59');
  const [isca2Data, setIsca2Data] = useState('26/06/2026 22:22:53');
  const [isca1Bateria, setIsca1Bateria] = useState('100%');
  const [isca2Bateria, setIsca2Bateria] = useState('100%');

  // Interactive ladders for Esquema de Embarque
  const [ladder1, setLadder1] = useState<string[][]>(() => {
    const grid = Array(12).fill(null).map(() => Array(2).fill(''));
    grid[0][0] = 'P';
    return grid;
  });
  const [ladder2, setLadder2] = useState<string[][]>(() => {
    const grid = Array(12).fill(null).map(() => Array(2).fill(''));
    grid[0][0] = 'P';
    return grid;
  });

  // Sidebar specific inputs (COLUNA.PNG layout)
  const [sidebarTransportadora, setSidebarTransportadora] = useState('moedense');
  const [sidebarTecnologia, setSidebarTecnologia] = useState('SASCAR');
  const [sidebarMotorista, setSidebarMotorista] = useState('MARISON REZENDE LEMOS');
  const [sidebarTelefone, setSidebarTelefone] = useState('');
  const [pastePlanilha, setPastePlanilha] = useState('');

  // Prefixes and Suffixes for N° ISCAS (individual prefixes)
  const [iscaPrefix1, setIscaPrefix1] = useState('R10000');
  const [iscaPrefix2, setIscaPrefix2] = useState('R10000');
  const [iscaSuffix1, setIscaSuffix1] = useState('2195');
  const [iscaSuffix2, setIscaSuffix2] = useState('3797');

  const [copied, setCopied] = useState(false);

  // Sync transportadora and motorista states when either updates, keeping both sections intuitive
  const handleSidebarTranspChange = (val: string) => {
    setSidebarTransportadora(val);
    setTransportadora(val);
  };

  const handleSidebarMotoristaChange = (val: string) => {
    setSidebarMotorista(val);
    setMotorista(val);
  };

  const handleTableTranspChange = (val: string) => {
    setTransportadora(val);
    setSidebarTransportadora(val);
  };

  const handleTableMotoristaChange = (val: string) => {
    setMotorista(val);
    setSidebarMotorista(val);
  };

  const handleIsca1Change = (val: string) => {
    setIsca1(val);
    if (val.startsWith(iscaPrefix1)) {
      setIscaSuffix1(val.substring(iscaPrefix1.length));
    } else {
      const prefixes = ['R100000', 'R10000', '30D10000'];
      const matched = prefixes.find(p => val.startsWith(p));
      if (matched) {
        setIscaPrefix1(matched);
        setIscaSuffix1(val.substring(matched.length));
      } else {
        setIscaSuffix1(val);
      }
    }
  };

  const handleIsca2Change = (val: string) => {
    setIsca2(val);
    if (val.startsWith(iscaPrefix2)) {
      setIscaSuffix2(val.substring(iscaPrefix2.length));
    } else {
      const prefixes = ['R100000', 'R10000', '30D10000'];
      const matched = prefixes.find(p => val.startsWith(p));
      if (matched) {
        setIscaPrefix2(matched);
        setIscaSuffix2(val.substring(matched.length));
      } else {
        setIscaSuffix2(val);
      }
    }
  };

  const handlePastePlanilhaChange = (text: string) => {
    setPastePlanilha(text);
    if (!text.trim()) return;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    interface ParsedIsca {
      id: string;
      endereco: string;
      data: string;
      bateria: string;
    }
    const parsedItems: ParsedIsca[] = [];

    lines.forEach(line => {
      const matchIsca = line.match(/^(\S+)/);
      if (!matchIsca) return;
      const iscaId = matchIsca[1];

      // Match DD/MM/YYYY HH:MM:SS or HH:MM
      const dateRegex = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})|(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/;
      const matchDate = line.match(dateRegex);

      let address = '';
      let dateVal = '';
      let batteryVal = '100%';

      if (matchDate && matchDate.index !== undefined) {
        dateVal = matchDate[0];
        const dateIndex = matchDate.index;

        address = line.substring(iscaId.length, dateIndex).trim();

        const remaining = line.substring(dateIndex + dateVal.length).trim();
        const matchBattery = remaining.match(/(\d+%)/);
        if (matchBattery) {
          batteryVal = matchBattery[1];
        }
      } else {
        const parts = line.split(/\s+/);
        if (parts.length > 1) {
          address = parts.slice(1).join(' ');
        }
      }

      parsedItems.push({
        id: iscaId,
        endereco: address,
        data: dateVal,
        bateria: batteryVal
      });
    });

    let matchedIsca1 = false;
    let matchedIsca2 = false;
    const matchedItemIndices = new Set<number>();

    // Pass 1: Try to match by current suffix/ID to preserve assignment if already entered
    parsedItems.forEach((item, index) => {
      const cleanId = item.id.toUpperCase();
      const cleanIsca1 = isca1.toUpperCase();
      const cleanIscaSuffix1 = iscaSuffix1.toUpperCase();
      const cleanIsca2 = isca2.toUpperCase();
      const cleanIscaSuffix2 = iscaSuffix2.toUpperCase();

      const isMatch1 = cleanIscaSuffix1.length >= 3 && (cleanId.includes(cleanIscaSuffix1) || cleanIsca1.includes(cleanId));
      const isMatch2 = cleanIscaSuffix2.length >= 3 && (cleanId.includes(cleanIscaSuffix2) || cleanIsca2.includes(cleanId));

      if (isMatch1 && !matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      } else if (isMatch2 && !matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      }
    });

    // Pass 2: Assign unmatched items to remaining unmatched slots in order
    parsedItems.forEach((item, index) => {
      if (matchedItemIndices.has(index)) return;

      if (!matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      } else if (!matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      }
    });
  };

  // Sync initial values
  useEffect(() => {
    setSidebarTransportadora(transportadora);
    setSidebarMotorista(motorista);
  }, []);

  const handleClear = () => {
    if (window.confirm("Deseja realmente limpar todas as informações do controle?")) {
      setSaudacao('Boa tarde,');
      setAlertaResgate('Favor se atentar ao resgate!');
      setInfoAbaixo('Atentar às informações abaixo:');
      setRota1('SANTA LUZIA/MG x GUARULHOS/SP');
      setInstrucao1('Favor, acusar o recebimento do pré-alerta;');
      setNumeroNf('');
      setTransportadora('');
      setMotorista('');
      setCavalo('');
      setCarreta1('');
      setCarreta2('');
      setIsca1('');
      setIsca2('');
      setProduto1('');
      setProduto2('');
      setUma1('');
      setUma2('');
      setDestino('GUARULHOS/SP');
      setDataEnviada('');
      setParametrizacao('Parametrização das iscas');
      setEsquemaEmbarque('CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA');

      setIsca1Endereco('rod mg-020 – santa luzia - mg - brazil - 0 a 0 - santa luzia - MG');
      setIsca2Endereco('r Quarenta E Tres - Santa Luzia - Mg - Brazil - 189 A 278 - santa Luzia - MG');
      setIsca1Data('26/06/2026 22:29:59');
      setIsca2Data('26/06/2026 22:22:53');
      setIsca1Bateria('100%');
      setIsca2Bateria('100%');

      setLadder1(() => {
        const grid = Array(12).fill(null).map(() => Array(2).fill(''));
        grid[0][0] = 'P';
        return grid;
      });
      setLadder2(() => {
        const grid = Array(12).fill(null).map(() => Array(2).fill(''));
        grid[0][0] = 'P';
        return grid;
      });
      
      setSidebarTransportadora('');
      setSidebarTecnologia('');
      setSidebarMotorista('');
      setSidebarTelefone('');
      setPastePlanilha('');

      setIscaPrefix1('R10000');
      setIscaPrefix2('R10000');
      setIscaSuffix1('');
      setIscaSuffix2('');
    }
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    // Helper to render ladder visual grid inside email HTML
    const renderLadderHtml = (grid: string[][], label: string) => {
      return `
        <table cellpadding="0" cellspacing="0" style="display: inline-block; margin-right: 35px; border-collapse: collapse; font-family: Arial, sans-serif; text-align: center; vertical-align: top; margin-bottom: 20px;">
          <tr>
            <td style="font-size: 10px; font-weight: 900; color: #8C1D24; padding-bottom: 4px; font-family: Arial, sans-serif; text-transform: uppercase;">${cavalo || 'TYQ-6F51'}</td>
          </tr>
          <tr>
            <td style="background-color: #3C2218; color: #FFFFFF; font-weight: bold; padding: 4px 12px; font-size: 10px; text-transform: uppercase; font-family: Arial, sans-serif; border: 1.5px solid #3C2218;">${label}</td>
          </tr>
          <tr>
            <td style="padding: 0;">
              <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 66px; border: 1.5px solid #3C2218;">
                ${grid.map((row) => `
                  <tr>
                    ${row.map((cell) => {
                      const bg = cell === 'P' ? '#8C1D24' : '#FFFFFF';
                      const color = cell === 'P' ? '#FFFFFF' : '#000000';
                      return `<td style="background-color: ${bg}; color: ${color}; font-weight: 900; font-size: 10px; width: 31px; height: 18px; border: 1px solid #3C2218; text-align: center; vertical-align: middle;">${cell || '&nbsp;'}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>
        </table>
      `;
    };

    // Constructing HTML string matching the attached image exactly
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #3e2516; line-height: 1.5; max-width: 1000px; margin: 0 auto; background-color: #FAF5EC; padding: 25px; border-radius: 8px;">
        
        <!-- Header Title block with Status badge -->
        <div style="margin-bottom: 18px; font-family: Arial, sans-serif; display: block;">
          <h1 style="color: #631C24; font-size: 20px; font-weight: 900; margin: 0; display: inline-block; vertical-align: middle; text-transform: uppercase; letter-spacing: -0.5px;">
            PRÉ-ALERTA DE ISCA - ${destino || 'BRASÍLIA'} - ${cavalo || 'TYQ-6F51'}
          </h1>
          <span style="background-color: #9C8570; color: #ffffff; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 10px; display: inline-block; vertical-align: middle; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, sans-serif;">
            SC CONTROLE DE ISCA ×
          </span>
        </div>

        <!-- Cursive-style greeting -->
        <div style="font-size: 15px; font-style: italic; font-weight: bold; margin-bottom: 14px; font-family: 'Georgia', serif; color: #3e2516;">
          ${saudacao || 'Bom dia,'}
        </div>
        
        <!-- Beautiful Maroon Ribbon with border fold simulation -->
        <div style="background-color: #7C0623; color: #ffffff; font-weight: 900; font-size: 13px; font-family: Arial, sans-serif; text-transform: uppercase; padding: 10px 18px; margin-bottom: 16px; border-left: 10px solid #4D0012; border-radius: 0 4px 4px 0; box-shadow: 2px 2px 4px rgba(0,0,0,0.15); display: inline-block; min-width: 250px;">
          ${alertaResgate || 'Favor se atentar ao resgate!'}
        </div>

        <div style="font-size: 13px; font-weight: bold; margin-bottom: 12px; font-family: Arial, sans-serif; color: #3e2516;">
          ${infoAbaixo || 'Atentar as informações abaixo:'}
        </div>

        <!-- Double border informational box -->
        <div style="border: 1px solid #c5ab92; outline: 1px solid #c5ab92; outline-offset: -3px; background-color: #FFFDFB; padding: 10px 16px; margin-bottom: 22px; font-size: 12px; font-weight: bold; line-height: 1.8; color: #3e2516; font-family: Arial, sans-serif; display: inline-block; min-width: 420px; border-radius: 2px;">
          • ${rota1}; <br />
          • ${instrucao1}
        </div>

        <!-- TABLE 1: MAIN LOGISTICS DATA -->
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; color: #3e2516; border: 1.5px solid #c5ab92; margin-bottom: 0px;">
          <thead>
            <!-- Spanned Header Title row -->
            <tr>
              <th colspan="8" style="background-color: #F2E2D2; color: #4A2B0F; text-align: center; font-weight: 900; border: 1.5px solid #c5ab92; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                PRÉ - ALERTA DE ISCA EMBARCADA
              </th>
            </tr>
            <!-- NF & Transportadora row -->
            <tr>
              <th colspan="2" style="background-color: #F2E2D2; color: #4A2B0F; font-weight: 900; text-align: center; border: 1.5px solid #c5ab92; padding: 8px; text-transform: uppercase;">NÚMERO DA NF:</th>
              <th colspan="1" style="background-color: #FFFFFF; font-weight: bold; text-align: center; border: 1.5px solid #c5ab92; padding: 8px; color: #000000;">${numeroNf}</th>
              <th colspan="1" style="background-color: #F2E2D2; color: #4A2B0F; font-weight: 900; text-align: center; border: 1.5px solid #c5ab92; padding: 8px; text-transform: uppercase;">TRANSPORTADORA:</th>
              <th colspan="2" style="background-color: #FFFFFF; font-weight: 900; text-align: center; border: 1.5px solid #c5ab92; padding: 8px; color: #000000; text-transform: uppercase;">${transportadora}</th>
              <th colspan="2" style="background-color: #FFFDFB; border: 1.5px solid #c5ab92; padding: 8px;"></th>
            </tr>
            <!-- Grid headers -->
            <tr style="background-color: #F2E2D2; color: #4A2B0F; text-align: center; font-weight: 900; font-size: 10px; height: 32px;">
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 22%;">MOTORISTA</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 11%;">CAVALO</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 11%;">CARRETAS</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 12%;">N° ISCAS</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 13%;">PRODUTO EMBARCADO</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 15%;">CÓDIGO U.M.A.</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 11%;">DESTINO</th>
              <th style="border: 1.5px solid #c5ab92; padding: 6px; width: 10%;">DATA ENVIADA</th>
            </tr>
          </thead>
          <tbody>
            <!-- First device row (Row 1) -->
            <tr style="background-color: #FFFFFF; text-align: center; height: 42px;">
              <td rowspan="2" style="border: 1.5px solid #c5ab92; padding: 8px; font-weight: 900; text-transform: uppercase; color: #000000; font-size: 11px;">${motorista}</td>
              <td rowspan="2" style="border: 1.5px solid #c5ab92; padding: 8px; font-weight: 900; text-transform: uppercase; color: #000000; font-size: 11px;">${cavalo}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold; text-transform: uppercase;">${carreta1}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold; text-transform: uppercase;">${isca1}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold;">${produto1}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold;">${uma1}</td>
              <td rowspan="2" style="border: 1.5px solid #c5ab92; padding: 8px; font-weight: 900; text-transform: uppercase; color: #000000; font-size: 11px;">${destino}</td>
              <td rowspan="2" style="border: 1.5px solid #c5ab92; padding: 8px; font-weight: 900; color: #000000; font-size: 11px;">${dataEnviada}</td>
            </tr>
            <!-- Second device row (Row 2) -->
            <tr style="background-color: #FFFFFF; text-align: center; height: 42px;">
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold; text-transform: uppercase;">${carreta2}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold; text-transform: uppercase;">${isca2}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold;">${produto2}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px; color: #000000; font-weight: bold;">${uma2}</td>
            </tr>
          </tbody>
        </table>

        <!-- TABLE 2: ISCA PARAMETRIZATION & POSITIONS -->
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; color: #3e2516; border: 1.5px solid #c5ab92; border-top: none;">
          <tbody>
            <!-- Parametrização Header row -->
            <tr>
              <td colspan="4" style="background-color: #2D1C10; color: #FFFFFF; text-align: center; font-weight: 900; border: 1.5px solid #c5ab92; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${parametrizacao || 'Parametrização das Iscas'}
              </td>
            </tr>
            <!-- Search / Subheaders Row -->
            <tr style="background-color: #2D1C10; text-align: center; font-weight: bold; color: #efdfc6; font-size: 11px;">
              <!-- Left: Iscas code box with input/search look -->
              <td style="border: 1.5px solid #c5ab92; padding: 8px; width: 25%;">
                <span style="background-color: #FFFFFF; color: #000000; border: 1px solid #c5ab92; padding: 4px 10px; border-radius: 2px; font-size: 11px; font-weight: 900; display: inline-block;">
                  ${isca1} ${isca2}
                </span>
              </td>
              <!-- Middle: Address header with sort/search -->
              <td style="border: 1.5px solid #c5ab92; padding: 8px; color: #FFEAA7; width: 45%; text-transform: uppercase; font-weight: 900;">
                🔍 Endereço aproximado da posição ⇅
              </td>
              <!-- Right: Date header -->
              <td style="border: 1.5px solid #c5ab92; padding: 8px; color: #FFEAA7; width: 18%; text-transform: uppercase; font-weight: 900;">
                🔍 Data Posição ⇅
              </td>
              <!-- Battery header -->
              <td style="border: 1.5px solid #c5ab92; padding: 8px; color: #FFEAA7; width: 12%; text-transform: uppercase; font-weight: 900;">
                🔍 Bateria Isca_RF ⇅
              </td>
            </tr>
            <!-- Isca 2 row (Matching top sequence in the image) -->
            <tr style="background-color: #FAF2E6; text-align: center; height: 38px; color: #3e2516; font-weight: bold;">
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px; font-weight: 900;">${isca2}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 12px; text-align: left; font-size: 11px; font-weight: bold; text-transform: lowercase;">${isca2Endereco}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px;">${isca2Data}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px;">${isca2Bateria || '100%'}</td>
            </tr>
            <!-- Isca 1 row -->
            <tr style="background-color: #FAF2E6; text-align: center; height: 38px; color: #3e2516; font-weight: bold;">
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px; font-weight: 900;">${isca1}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 12px; text-align: left; font-size: 11px; font-weight: bold; text-transform: lowercase;">${isca1Endereco}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px;">${isca1Data}</td>
              <td style="border: 1.5px solid #c5ab92; padding: 6px 8px; font-size: 11px;">${isca1Bateria || '100%'}</td>
            </tr>
          </tbody>
        </table>

        <!-- ESQUEMA DE EMBARQUE GRAPHICS (Ladders) -->
        <div style="margin-top: 25px; font-family: Arial, sans-serif;">
          <strong style="font-size: 13px; color: #3e2516; display: block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            ESQUEMA DE EMBARQUE DAS ISCAS:
          </strong>
          
          <div style="display: block;">
            <!-- Render Side-by-Side Ladder grids representing actual selected states -->
            ${renderLadderHtml(ladder1, 'CAVALO')}
            ${renderLadderHtml(ladder2, 'CAVALO')}
          </div>
        </div>

        <!-- Supportive Info Area -->
        ${(sidebarTecnologia || sidebarTelefone) ? `
          <div style="margin-top: 25px; border-top: 1.5px dashed #c5ab92; padding-top: 15px; font-size: 11px; color: #3e2516; font-family: Arial, sans-serif;">
            <strong style="text-transform: uppercase; display: block; margin-bottom: 5px; color: #4A2B0F; font-size: 12px;">Informações de Apoio:</strong>
            ${sidebarTecnologia ? `• Tecnologia: <strong style="color: #000000; text-transform: uppercase;">${sidebarTecnologia}</strong><br />` : ''}
            ${sidebarTelefone ? `• Telefone Motorista: <strong style="color: #000000;">${sidebarTelefone}</strong><br />` : ''}
          </div>
        ` : ''}
        
      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${numeroNf} | TRANSPORTADORA: ${transportadora}
-----------------------------------------------------------------------------------------------------------------
MOTORISTA: ${motorista}
CAVALO: ${cavalo}
DESTINO: ${destino}
DATA ENVIADA: ${dataEnviada}
-----------------------------------------------------------------------------------------------------------------
DETALHES DE CARGA & ISCAS:
1. Carreta: ${carreta1} | N° Isca: ${isca1} | Produto: ${produto1} | Cód U.M.A.: ${uma1}
2. Carreta: ${carreta2} | N° Isca: ${isca2} | Produto: ${produto2} | Cód U.M.A.: ${uma2}
-----------------------------------------------------------------------------------------------------------------
${parametrizacao.toUpperCase()}

ESQUEMA DE EMBARQUE DAS ISCAS:
${esquemaEmbarque}

-----------------------------------------------------------------------------------------------------------------
Informações de Apoio:
Tecnologia: ${sidebarTecnologia}
Telefone: ${sidebarTelefone}
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        alert('Falha ao copiar conteúdo. Por favor, selecione e copie manualmente.');
      }
    }
  };

  return (
    <div className="w-full relative z-10 max-w-[96rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch font-sans">
      
      {/* LEFT AREA: Template Generator (col-span-8) */}
      <div className="col-span-1 xl:col-span-8 flex flex-col">
        <div className="flex-1 rounded-3xl bg-[#fdfbf7] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-8">
          
          {/* Decorative brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#e1ccb0] pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#B32025] text-white p-2.5 rounded-2xl shadow-md">
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3e2516] uppercase tracking-tight">Gerador de Controle PGR</h2>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">Gerador idêntico de pré-alerta e iscas</p>
              </div>
            </div>
            {onBack && (
              <button 
                onClick={onBack}
                className="bg-stone-100 hover:bg-stone-200 text-[#5c3e29] border border-stone-300 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Menu
              </button>
            )}
          </div>

          {/* Generator Workspace Form */}
          <div className="flex flex-col gap-6">
            
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF6ED] border border-[#e1ccb0]/80 rounded-2xl p-4 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#5c3e29] shrink-0">Saudação:</label>
              <div className="relative flex-1 max-w-[200px]">
                <select 
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-white border-2 border-[#5c3e29]/35 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#3e2516] focus:border-[#B32025] focus:ring-0 outline-none transition-all cursor-pointer shadow-xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-bold text-[#8c6b4e] uppercase tracking-wider">Define a saudação inicial do pré-alerta</p>
            </div>

            {/* PREVIEW CONTAINER - LOOKS EXACTLY LIKE THE OUTLOOK EMAIL / CCC.PNG */}
            <div className="bg-[#FAF5EC] border-3 border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl overflow-x-auto relative">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8c6b4e] block mb-5 border-b border-[#dac0a3] pb-1.5">Visualização do Pré-Alerta (Template do E-mail)</span>
              
              <div className="min-w-[850px] font-sans text-xs text-[#3e2516]">
                
                {/* Header Title block with Status badge directly matching the image top */}
                <div className="mb-5 flex items-center gap-3">
                  <h1 className="text-xl font-sans font-black text-[#631C24] uppercase tracking-tight m-0 select-all">
                    PRÉ-ALERTA DE ISCA - {destino || 'BRASÍLIA'} - {cavalo || 'TYQ-6F51'}
                  </h1>
                  <span className="bg-[#9C8570] text-white px-3 py-1 rounded font-bold text-[9px] uppercase tracking-wider select-none">
                    SC CONTROLE DE ISCA ×
                  </span>
                </div>

                {/* 1. Greeting Output */}
                <div className="mb-4 font-serif font-black italic text-base text-[#3e2516]">
                  {saudacao}
                </div>

                {/* 2. Beautiful Maroon Ribbon Fold */}
                <div className="mb-5 bg-[#7C0623] text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider shadow-sm flex items-center rounded-r border-l-[10px] border-[#4D0012] max-w-max">
                  <input 
                    type="text" 
                    value={alertaResgate} 
                    onChange={(e) => setAlertaResgate(e.target.value)}
                    className="bg-transparent border-none text-white w-full outline-none font-black text-xs uppercase p-0 focus:ring-0 min-w-[280px]" 
                    placeholder="ALERTA RESGATE"
                  />
                </div>

                {/* 3. Atentar às informações */}
                <div className="mb-3.5 font-black text-[#3e2516] text-[13px]">
                  <input 
                    type="text" 
                    value={infoAbaixo} 
                    onChange={(e) => setInfoAbaixo(e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-dashed hover:border-[#c5ab92] focus:border-[#5c3e29] w-full outline-none font-black py-0.5" 
                  />
                </div>

                {/* 4. Routes and Instructions Selector Box with double border styling */}
                <div className="border border-[#c5ab92] outline outline-1 outline-[#c5ab92] outline-offset-[-3.5px] p-4 mb-6 font-bold leading-relaxed bg-[#FFFDFB] max-w-xl rounded-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c5ab92] text-sm">•</span>
                    <input 
                      type="text" 
                      value={rota1} 
                      onChange={(e) => setRota1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0 text-xs text-[#3e2516]" 
                      placeholder="· SANTA LUZIA/MG x GUARULHOS/SP;"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#c5ab92] text-sm">•</span>
                    <input 
                      type="text" 
                      value={instrucao1} 
                      onChange={(e) => setInstrucao1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0 text-xs text-[#3e2516]" 
                      placeholder="· Favor, acusar o recebimento do pré-alerta;"
                    />
                  </div>
                </div>

                {/* 5. BIG INTERACTIVE SPREADSHEET TABLE 1 */}
                <table className="w-full border-collapse border border-[#c5ab92] text-xs font-sans text-black table-fixed">
                  <thead>
                    
                    {/* Row 1: NF and Transportadora */}
                    <tr className="border border-[#c5ab92]">
                      <th colSpan={2} className="bg-[#F2E2D2] border-r border-[#c5ab92] text-[#4A2B0F] text-center font-black p-2.5 uppercase text-[11px] align-middle w-[25%]">
                        NÚMERO DA NF:
                      </th>
                      <th colSpan={1} className="border-r border-[#c5ab92] p-1.5 align-middle w-[15%] bg-white">
                        <input 
                          type="text" 
                          value={numeroNf} 
                          onChange={(e) => setNumeroNf(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-black"
                          placeholder="2970815 - 2970843"
                        />
                      </th>
                      <th colSpan={1} className="bg-[#F2E2D2] border-r border-[#c5ab92] text-[#4A2B0F] text-center font-black p-2.5 uppercase text-[11px] align-middle w-[18%]">
                        TRANSPORTADORA:
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-[#c5ab92] align-middle w-[25%] bg-white">
                        <select 
                          value={transportadora} 
                          onChange={(e) => handleTableTranspChange(e.target.value)}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none focus:ring-0 p-0 text-xs cursor-pointer text-black"
                        >
                          <option value="">SELECIONE...</option>
                          {TRANSPORTADORAS.map((t) => (
                            <option key={t} value={t} className="text-black uppercase text-xs font-black">
                              {t}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th colSpan={2} className="w-[17%] bg-[#FFFDFB]"></th>
                    </tr>

                    {/* Row 2: Standard Columns Headings */}
                    <tr className="border-b border-[#c5ab92] bg-[#F2E2D2] text-[#4A2B0F] text-center font-black uppercase text-[10px] h-[34px]">
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[22%]">MOTORISTA</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">CAVALO</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">CARRETAS</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[13%]">N° ISCAS</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[14%]">PRODUTO EMBARCADO</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[15%]">CÓDIGO U.M.A.</th>
                      <th className="border-r border-[#c5ab92] p-1.5 align-middle w-[11%]">DESTINO</th>
                      <th className="p-1.5 align-middle w-[11%]">DATA ENVIADA</th>
                    </tr>

                  </thead>
                  <tbody>
                    
                    {/* Rows of data */}
                    <tr className="border-b border-[#c5ab92] text-center text-xs h-[42px] bg-white">
                      
                      {/* Motorista - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle">
                        <textarea 
                          value={motorista} 
                          onChange={(e) => handleTableMotoristaChange(e.target.value)}
                          className="w-full h-full min-h-[48px] text-center font-bold uppercase bg-transparent border-none outline-none focus:ring-0 resize-none p-0.5 text-xs leading-snug text-black"
                          placeholder="NOME MOTORISTA"
                        />
                      </td>

                      {/* Cavalo - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle">
                        <input 
                          type="text" 
                          value={cavalo} 
                          onChange={(e) => setCavalo(e.target.value)}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-black"
                          placeholder="PLACA"
                        />
                      </td>

                      {/* Carreta Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={carreta1} 
                          onChange={(e) => setCarreta1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="CARRETA 1"
                        />
                      </td>

                      {/* N Iscas Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={isca1} 
                          onChange={(e) => handleIsca1Change(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="ISCA 1"
                        />
                      </td>

                      {/* Produto Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={produto1} 
                          onChange={(e) => setProduto1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="PROD 1"
                        />
                      </td>

                      {/* UMA Row 1 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={uma1} 
                          onChange={(e) => setUma1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="UMA 1"
                        />
                      </td>

                      {/* Destino - Span rowspan 2 */}
                      <td rowSpan={2} className="border-r border-[#c5ab92] p-1.5 font-bold uppercase text-[11px] align-middle">
                        <input 
                          type="text" 
                          value={destino} 
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full text-center font-bold uppercase bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-black"
                          placeholder="DESTINO"
                        />
                      </td>

                      {/* Data Enviada - Span rowspan 2 */}
                      <td rowSpan={2} className="p-1.5 font-bold text-black text-xs align-middle">
                        <input 
                          type="text" 
                          value={dataEnviada} 
                          onChange={(e) => setDataEnviada(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-black"
                          placeholder="DATA"
                        />
                      </td>

                    </tr>
                    
                    {/* Second row of sub-items (Carreta 2, Isca 2, Prod 2, UMA 2) */}
                    <tr className="border-b border-[#c5ab92] text-center text-xs h-[42px] bg-white">
                      
                      {/* Carreta Row 2 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={carreta2} 
                          onChange={(e) => setCarreta2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="CARRETA 2"
                        />
                      </td>

                      {/* Isca Row 2 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={isca2} 
                          onChange={(e) => handleIsca2Change(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="ISCA 2"
                        />
                      </td>

                      {/* Produto Row 2 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={produto2} 
                          onChange={(e) => setProduto2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="PROD 2"
                        />
                      </td>

                      {/* UMA Row 2 */}
                      <td className="border-r border-[#c5ab92] p-1.5 align-middle">
                        <input 
                          type="text" 
                          value={uma2} 
                          onChange={(e) => setUma2(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:ring-0 p-0 uppercase font-bold text-xs text-black"
                          placeholder="UMA 2"
                        />
                      </td>

                    </tr>

                  </tbody>
                </table>

                {/* TABLE 2: PARAMETRIZAÇÃO DAS ISCAS */}
                <table className="w-full border-collapse border border-[#c5ab92] text-xs font-sans text-black table-fixed mt-0">
                  <tbody>
                    {/* Header bar */}
                    <tr>
                      <td colSpan={4} className="bg-[#2D1C10] text-center font-black text-white p-2.5 uppercase text-[11px] tracking-wide border-b border-[#c5ab92]">
                        <input 
                          type="text" 
                          value={parametrizacao} 
                          onChange={(e) => setParametrizacao(e.target.value)}
                          className="w-full text-center font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-[11px] uppercase text-[#efdfc6]"
                        />
                      </td>
                    </tr>
                    {/* Subheaders Row */}
                    <tr className="bg-[#2D1C10] text-center font-black text-[#FFEAA7] text-[10px] h-[34px] border-b border-[#c5ab92]">
                      <td className="border-r border-[#c5ab92] p-1 w-[25%] align-middle text-center">
                        <div className="flex items-center bg-white border border-[#c5ab92]/50 rounded px-2 py-0.5 max-w-[150px] mx-auto shadow-inner">
                          <input
                            type="text"
                            value={`${isca1} ${isca2}`}
                            readOnly
                            className="bg-transparent border-none text-black font-black text-[9px] uppercase p-0 focus:ring-0 w-full text-center outline-none select-all"
                          />
                          <span className="text-stone-400 font-bold text-[8px] cursor-pointer ml-1 select-none">⇅</span>
                        </div>
                      </td>
                      <td className="border-r border-[#c5ab92] p-1 w-[45%] uppercase tracking-wider text-[#efdfc6] text-[10px] align-middle">🔍 ENDEREÇO APROXIMADO DA POSIÇÃO ⇅</td>
                      <td className="border-r border-[#c5ab92] p-1 w-[18%] uppercase tracking-wider text-[#efdfc6] text-[10px] align-middle">🔍 DATA POSIÇÃO ⇅</td>
                      <td className="p-1 w-[12%] uppercase tracking-wider text-[#efdfc6] text-[10px] align-middle">🔍 BATERIA ISCA_RF ⇅</td>
                    </tr>
                    {/* Row 1 (Isca 2) */}
                    <tr className="bg-[#FAF2E6] text-center font-semibold text-[#3e2516] h-[44px] border-b border-[#c5ab92]">
                      <td className="border-r border-[#c5ab92] p-1.5 font-black uppercase text-[11px] text-center bg-[#FAF2E6] align-middle">
                        {isca2}
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-left font-medium text-xs bg-[#FAF2E6] align-middle">
                        <textarea
                          value={isca2Endereco}
                          onChange={(e) => setIsca2Endereco(e.target.value)}
                          rows={1}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-[#3e2516] resize-y leading-tight font-bold"
                          placeholder="Endereço da Isca 2..."
                        />
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-center font-bold text-xs bg-[#FAF2E6] align-middle">
                        <input
                          type="text"
                          value={isca2Data}
                          onChange={(e) => setIsca2Data(e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-center text-[#3e2516] font-bold"
                          placeholder="Data/Hora..."
                        />
                      </td>
                      <td className="p-1.5 text-center font-bold text-xs bg-[#FAF2E6] align-middle">
                        <input
                          type="text"
                          value={isca2Bateria}
                          onChange={(e) => setIsca2Bateria(e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-center text-[#3e2516] font-bold"
                          placeholder="100%"
                        />
                      </td>
                    </tr>
                    {/* Row 2 (Isca 1) */}
                    <tr className="bg-[#FAF2E6] text-center font-semibold text-[#3e2516] h-[44px] border-b border-[#c5ab92]">
                      <td className="border-r border-[#c5ab92] p-1.5 font-black uppercase text-[11px] text-center bg-[#FAF2E6] align-middle">
                        {isca1}
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-left font-medium text-xs bg-[#FAF2E6] align-middle">
                        <textarea
                          value={isca1Endereco}
                          onChange={(e) => setIsca1Endereco(e.target.value)}
                          rows={1}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-[#3e2516] resize-y leading-tight font-bold"
                          placeholder="Endereço da Isca 1..."
                        />
                      </td>
                      <td className="border-r border-[#c5ab92] p-1.5 text-center font-bold text-xs bg-[#FAF2E6] align-middle">
                        <input
                          type="text"
                          value={isca1Data}
                          onChange={(e) => setIsca1Data(e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-center text-[#3e2516] font-bold"
                          placeholder="Data/Hora..."
                        />
                      </td>
                      <td className="p-1.5 text-center font-bold text-xs bg-[#FAF2E6] align-middle">
                        <input
                          type="text"
                          value={isca1Bateria}
                          onChange={(e) => setIsca1Bateria(e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs text-center text-[#3e2516] font-bold"
                          placeholder="100%"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 6. INTERACTIVE ESQUEMA DE EMBARQUE (LADDERS) */}
                <div className="mt-6 border-t border-[#c5ab92]/50 pt-5">
                  <span className="text-xs font-black uppercase tracking-wide block mb-1.5 text-stone-950 font-serif">ESQUEMA DE EMBARQUE DAS ISCAS:</span>
                  <p className="text-[10px] text-[#8c6b4e] font-black uppercase tracking-wider mb-4">
                    Clique nas células para marcar/desmarcar a isca ("P"). Esse esquema será copiado visualmente para o e-mail!
                  </p>
                  
                  <div className="flex flex-wrap gap-8">
                    {/* Ladder 1 */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-[#8C1D24] mb-1 uppercase tracking-wider">{cavalo || 'TYQ-6F51'}</span>
                      <div className="bg-[#3C2218] text-white font-black text-[9px] uppercase px-4 py-1.5 text-center border border-[#3C2218] tracking-widest w-[80px]">
                        CAVALO
                      </div>
                      <div className="grid grid-cols-2 gap-0 border border-[#3C2218] bg-stone-100 mt-0.5">
                        {ladder1.map((row, rIndex) => (
                          row.map((cell, cIndex) => (
                            <button
                              key={`ladder1-${rIndex}-${cIndex}`}
                              onClick={() => {
                                const copy = [...ladder1.map(r => [...r])];
                                copy[rIndex][cIndex] = copy[rIndex][cIndex] === 'P' ? '' : 'P';
                                setLadder1(copy);
                              }}
                              className={cn(
                                "w-7 h-[18px] border border-[#3C2218] font-black text-[10px] flex items-center justify-center transition-all cursor-pointer select-none",
                                cell === 'P' ? 'bg-[#8C1D24] text-white' : 'bg-white hover:bg-stone-50'
                              )}
                            >
                              {cell}
                            </button>
                          ))
                        ))}
                      </div>
                    </div>

                    {/* Ladder 2 */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-[#8C1D24] mb-1 uppercase tracking-wider">{cavalo || 'TYQ-6F51'}</span>
                      <div className="bg-[#3C2218] text-white font-black text-[9px] uppercase px-4 py-1.5 text-center border border-[#3C2218] tracking-widest w-[80px]">
                        CAVALO
                      </div>
                      <div className="grid grid-cols-2 gap-0 border border-[#3C2218] bg-stone-100 mt-0.5">
                        {ladder2.map((row, rIndex) => (
                          row.map((cell, cIndex) => (
                            <button
                              key={`ladder2-${rIndex}-${cIndex}`}
                              onClick={() => {
                                const copy = [...ladder2.map(r => [...r])];
                                copy[rIndex][cIndex] = copy[rIndex][cIndex] === 'P' ? '' : 'P';
                                setLadder2(copy);
                              }}
                              className={cn(
                                "w-7 h-[18px] border border-[#3C2218] font-black text-[10px] flex items-center justify-center transition-all cursor-pointer select-none",
                                cell === 'P' ? 'bg-[#8C1D24] text-white' : 'bg-white hover:bg-stone-50'
                              )}
                            >
                              {cell}
                            </button>
                          ))
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes additional line */}
                  <div className="mt-5 max-w-xl">
                    <span className="text-[10px] font-black uppercase text-[#8c6b4e] tracking-wider block mb-1">Notas adicionais de embarque:</span>
                    <input 
                      type="text" 
                      value={esquemaEmbarque}
                      onChange={(e) => setEsquemaEmbarque(e.target.value)}
                      className="w-full bg-transparent border-b border-[#c5ab92] hover:border-dashed focus:border-[#5c3e29] py-1 text-xs outline-none uppercase font-mono font-bold text-[#3e2516]"
                      placeholder="EX: CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO..."
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Quick action helper card inside main container */}
            <div className="bg-[#FAF6ED] border border-[#e1ccb0] rounded-2xl p-4 flex gap-3 items-start mt-2">
              <Info className="text-[#B32025] shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#5c3e29] uppercase tracking-wide">Dica do Gerador</span>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">Você pode clicar diretamente nos campos da tabela acima para preenchê-los manualmente de forma ágil, ou utilizar a coluna de preenchimento rápido ao lado para carregar dados corporativos específicos.</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR: Fast Fill Column (col-span-4, identical style to COLUNA.PNG) */}
      <div className="col-span-1 xl:col-span-4 flex flex-col">
        <div className="rounded-3xl bg-[#e6d5bf] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col p-6 sm:p-7"
             style={{
               backgroundImage: 'linear-gradient(135deg, #efdfc6 0%, #e2cfb2 100%)',
             }}>
          
          {/* Vintage brass flat-head screws on corners */}
          <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

          {/* Form Header */}
          <div className="border-b border-[#dac0a3] pb-4 mb-5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8c6b4e] block">Painel Lateral</span>
            <h3 className="text-base font-serif font-black text-[#3e2516] uppercase tracking-tight mt-0.5 flex items-center gap-2">
              <Sliders size={18} className="text-[#B32025]" /> Formulário de Controle
            </h3>
          </div>

          {/* Form inputs identical to COLUNA.PNG layout */}
          <div className="flex flex-col gap-4">
            
            {/* TRANSPORTADORA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Truck size={12} className="text-[#8c6b4e]" /> TRANSPORTADORA
              </label>
              <select 
                value={sidebarTransportadora}
                onChange={(e) => handleSidebarTranspChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">SELECIONE...</option>
                {TRANSPORTADORAS.map((t) => (
                  <option key={t} value={t} className="text-black uppercase text-xs font-black">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* COLAR DA PLANILHA (PARAMETRIZAÇÃO) textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <FileText size={12} className="text-[#8c6b4e]" /> COLAR DA PLANILHA (PARAMETRIZAÇÃO)
              </label>
              <textarea 
                value={pastePlanilha}
                onChange={(e) => handlePastePlanilhaChange(e.target.value)}
                rows={3}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2 text-xs font-bold text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs resize-none"
                placeholder="Cole as linhas da planilha de iscas aqui..."
              />
            </div>

            {/* NOME MOTORISTA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <User size={12} className="text-[#8c6b4e]" /> NOME MOTORISTA
              </label>
              <input 
                type="text"
                value={sidebarMotorista}
                onChange={(e) => handleSidebarMotoristaChange(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="NOME COMPLETO"
              />
            </div>

            {/* MENU SUSPENSO DE PREFIXO ISCAS NO LUGAR DA COLUNA CPF */}
            <div className="flex flex-col gap-3 bg-[#FAF6ED]/70 border-2 border-[#5c3e29]/20 rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Sliders size={12} className="text-[#8c6b4e]" /> N° ISCAS (PREFIXOS & BATERIA)
              </label>
              
              <div className="flex flex-col gap-3">
                {/* ISCA 1 SECTION */}
                <div className="border-b border-[#e1ccb0]/50 pb-2.5">
                  <span className="text-[9px] font-black uppercase text-[#B32025] block mb-1">DISPOSITIVO ISCA 1:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">PREFIXO:</span>
                      <select 
                        value={iscaPrefix1}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setIscaPrefix1(newPrefix);
                          setIsca1(newPrefix + iscaSuffix1);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1 py-1.5 text-[10px] font-extrabold text-[#3e2516] focus:border-[#B32025] outline-none cursor-pointer transition-all"
                      >
                        <option value="R100000">R100000</option>
                        <option value="R10000">R10000</option>
                        <option value="30D10000">30D10000</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">RESTO:</span>
                      <input 
                        type="text"
                        value={iscaSuffix1}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setIscaSuffix1(val);
                          setIsca1(iscaPrefix1 + val);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] uppercase focus:border-[#B32025] outline-none transition-all"
                        placeholder="RESTO..."
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">BATERIA:</span>
                      <input 
                        type="text"
                        value={isca1Bateria}
                        onChange={(e) => setIsca1Bateria(e.target.value)}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] focus:border-[#B32025] outline-none transition-all"
                        placeholder="100%"
                      />
                    </div>
                  </div>
                </div>

                {/* ISCA 2 SECTION */}
                <div>
                  <span className="text-[9px] font-black uppercase text-[#B32025] block mb-1">DISPOSITIVO ISCA 2:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">PREFIXO:</span>
                      <select 
                        value={iscaPrefix2}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setIscaPrefix2(newPrefix);
                          setIsca2(newPrefix + iscaSuffix2);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1 py-1.5 text-[10px] font-extrabold text-[#3e2516] focus:border-[#B32025] outline-none cursor-pointer transition-all"
                      >
                        <option value="R100000">R100000</option>
                        <option value="R10000">R10000</option>
                        <option value="30D10000">30D10000</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">RESTO:</span>
                      <input 
                        type="text"
                        value={iscaSuffix2}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setIscaSuffix2(val);
                          setIsca2(iscaPrefix2 + val);
                        }}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] uppercase focus:border-[#B32025] outline-none transition-all"
                        placeholder="RESTO..."
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-stone-500 block mb-0.5">BATERIA:</span>
                      <input 
                        type="text"
                        value={isca2Bateria}
                        onChange={(e) => setIsca2Bateria(e.target.value)}
                        className="w-full bg-[#fdfbf7] border-2 border-[#5c3e29]/25 rounded-lg px-1.5 py-1.5 text-[10px] font-black text-[#3e2516] focus:border-[#B32025] outline-none transition-all"
                        placeholder="100%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TELEFONE input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-[#5c3e29] flex items-center gap-1">
                <Phone size={12} className="text-[#8c6b4e]" /> TELEFONE
              </label>
              <input 
                type="text"
                value={sidebarTelefone}
                onChange={(e) => setSidebarTelefone(e.target.value)}
                className="w-full bg-[#fdfbf7]/80 border-2 border-[#5c3e29]/25 rounded-xl px-4 py-2.5 text-xs font-black uppercase text-[#3e2516] focus:border-[#B32025] focus:bg-white outline-none transition-all shadow-2xs"
                placeholder="DIGITE..."
              />
            </div>

            {/* Buttons area (identical to COLUNA.PNG buttons) */}
            <div className="flex flex-col gap-3.5 mt-4">
              
              {/* COPIAR PARA EMAIL BUTTON (Red, elegant) */}
              <button
                onClick={handleCopyToEmail}
                className={cn(
                  "w-full text-white text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-97 cursor-pointer border-2 border-transparent",
                  copied 
                    ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" 
                    : "bg-[#B32025] hover:bg-[#8c060a] hover:border-red-900 shadow-red-500/10"
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3]" /> COPIADO COM SUCESSO!
                  </>
                ) : (
                  <>
                    <Mail size={14} className="stroke-[2.5]" /> COPIAR PARA EMAIL
                  </>
                )}
              </button>

              {/* LIMPAR INFORMAÇÕES BUTTON (Dark brown, styled) */}
              <button
                onClick={handleClear}
                className="w-full bg-[#3e2516] hover:bg-[#2d1a10] text-[#efdfc6] text-[11px] font-black uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md border-2 border-[#5c3e29]/30 transition-all active:scale-97 cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" /> LIMPAR INFORMAÇÕES
              </button>

            </div>

            {/* DICA DE GESTÃO CARD */}
            <div className="bg-[#3c2518] rounded-2xl p-4 border border-[#5c3e29] shadow-inner mt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-1">Dica de Gestão</span>
              <p className="text-[10px] font-semibold text-[#fdefd1]/90 leading-relaxed">
                Verifique os dados cuidadosamente antes de enviar. O pré-alerta gerado deve estar 100% de acordo com a nota fiscal e a ordem de coleta de iscas do pátio para mitigar sinistros.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
