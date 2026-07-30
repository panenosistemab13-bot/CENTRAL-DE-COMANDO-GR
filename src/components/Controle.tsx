import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Cpu,
  Image,
  MapPin,
  Search,
  Package,
  Hash,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Battery,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";
import Prancheta, { PranchetaRow } from "./Prancheta";

// Vintage Screw component
function Screw({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className,
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

const TRANSPORTADORAS = [
  "apk",
  "tomasi",
  "moedense",
  "Frota 3C",
  "TRANSMAGNA",
  "RNCGG",
  "GT MINAS",
  "GOBOR",
  "SRH SARAIVA",
  "PACTUAL",
  "JETTA",
  "TECPET",
  "TRANS DANIEL",
  "UTISEG TRANSPORTES E LOCACOES LTDA",
  "COMBOIO",
  "REAL 94",
  "TORNADO",
  "FUJIOKA",
  "MERCOTRUCK",
  "UNITRADING LOG",
];

const EMBARQUE_IMAGES = [
  { value: "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF", label: "Paletizado (Padrão)" },
  {
    value: "https://lh3.googleusercontent.com/d/1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH",
    label: "Carga Batida (Padrão)",
  },
  { value: "https://lh3.googleusercontent.com/d/1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf", label: "AMARELIN" },
  { value: "https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh", label: "SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX", label: "CASTANHA" },
  { value: "https://lh3.googleusercontent.com/d/1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ", label: "IZOTONICO" },
  { value: "none", label: "Nenhum Embarque" },
];

export const DESTINOS_PLANILHA_ISCAS = [
  "ARAÇARIGUAMA",
  "ARIQUEMES-RO",
  "BARBALHA",
  "BRASILIA",
  "CAMPO GRANDE",
  "CLIENTE",
  "CUIABA",
  "CURITIBA",
  "DESCARTÁVEL",
  "EUSEBIO",
  "EXPORTAÇÃO",
  "GOVERNADOR CR",
  "GRAVATAI",
  "GUARULHOS",
  "JUIZ DE FORA",
  "JOÃO PESSOA",
  "LONDRINA",
  "MACEIÓ",
  "MANAUS",
  "MOSSORO",
  "MONTES CLAROS",
  "NATAL",
  "RECIFE",
  "RIO DE JANEIRO",
  "SALVADOR",
  "SANTA LUZIA",
  "SMART",
  "SUMARE",
  "TERESINA",
  "TOTAL SERVICE",
  "VESPASIANO",
  "VIANA"
];

export const cleanDestinoForPlanilha = (raw: string): string => {
  if (!raw) return "";
  const upper = raw.toUpperCase().trim();
  
  if (DESTINOS_PLANILHA_ISCAS.includes(upper)) return upper;

  let clean = upper.replace(/^SANTA\s+LUZIA(?:\/MG)?\s*X\s*/i, "").trim();

  if (DESTINOS_PLANILHA_ISCAS.includes(clean)) return clean;

  if (clean.includes("GOV") || clean.includes("CELSO RAMOS") || clean.includes("GOVERNADOR")) return "GOVERNADOR CR";
  if (clean.includes("RIO DE JANEIRO")) return "RIO DE JANEIRO";
  if (clean.includes("GUARULHOS")) return "GUARULHOS";
  if (clean.includes("BRASILIA") || clean.includes("BRASÍLIA")) return "BRASILIA";
  if (clean.includes("MONTES CLAROS")) return "MONTES CLAROS";
  if (clean.includes("LONDRINA")) return "LONDRINA";
  if (clean.includes("VIANA")) return "VIANA";
  if (clean.includes("CAMPO GRANDE")) return "CAMPO GRANDE";
  if (clean.includes("CLIENTE")) return "CLIENTE";
  if (clean.includes("CUIABA") || clean.includes("CUIABÁ")) return "CUIABA";
  if (clean.includes("EUSEBIO") || clean.includes("EUSÉBIO")) return "EUSEBIO";
  if (clean.includes("EXPORTAÇÃO") || clean.includes("EXPORTACAO")) return "EXPORTAÇÃO";
  if (clean.includes("GRAVATAI") || clean.includes("GRAVATAÍ")) return "GRAVATAI";
  if (clean.includes("JUIZ DE FORA")) return "JUIZ DE FORA";
  if (clean.includes("MANAUS")) return "MANAUS";
  if (clean.includes("MOSSORO") || clean.includes("MOSSORÓ")) return "MOSSORO";
  if (clean.includes("NATAL")) return "NATAL";
  if (clean.includes("ARIQUEMES")) return "ARIQUEMES-RO";
  if (clean.includes("RECIFE")) return "RECIFE";
  if (clean.includes("SALVADOR")) return "SALVADOR";
  if (clean.includes("SANTA LUZIA")) return "SANTA LUZIA";
  if (clean.includes("SMART")) return "SMART";
  if (clean.includes("SUMARE") || clean.includes("SUMARÉ")) return "SUMARE";
  if (clean.includes("TOTAL SERVICE")) return "TOTAL SERVICE";
  if (clean.includes("VESPASIANO")) return "VESPASIANO";
  if (clean.includes("TERESINA")) return "TERESINA";
  if (clean.includes("BARBALHA")) return "BARBALHA";
  if (clean.includes("MACEIÓ") || clean.includes("MACEIO")) return "MACEIÓ";
  if (clean.includes("JOÃO PESSOA") || clean.includes("JOAO PESSOA")) return "JOÃO PESSOA";
  if (clean.includes("ARAÇARIGUAMA") || clean.includes("ARACARIGUAMA")) return "ARAÇARIGUAMA";
  if (clean.includes("CURITIBA")) return "CURITIBA";
  if (clean.includes("DESCARTÁVEL") || clean.includes("DESCARTAVEL")) return "DESCARTÁVEL";

  const withoutUf = clean.replace(/\/[A-Z]{2}$/, "").trim();
  if (DESTINOS_PLANILHA_ISCAS.includes(withoutUf)) return withoutUf;

  return clean;
};

const DESTINOS_OPCOES = [
  "SANTA LUZIA/MG x RIO DE JANEIRO/RJ",
  "SANTA LUZIA/MG x GUARULHOS/SP",
  "SANTA LUZIA/MG x BRASÍLIA/DF",
  "SANTA LUZIA/MG x PINHAIS/PR",
  "SANTA LUZIA/MG x MONTES CLAROS/MG",
  "SANTA LUZIA/MG x LONDRINA/PR",
  "SANTA LUZIA/MG x VIANA/ES",
  "SANTA LUZIA/MG x 3 CAFFI",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS",
  "SANTA LUZIA/MG x CLIENTE",
  "SANTA LUZIA/MG x CUIABÁ/MT",
  "SANTA LUZIA/MG x EUSÉBIO/CE",
  "SANTA LUZIA/MG x EXPORTAÇÃO",
  "SANTA LUZIA/MG x GOV. CELSO RAMOS/SC",
  "SANTA LUZIA/MG x GRAVATAÍ/RS",
  "SANTA LUZIA/MG x JUIZ DE FORA/MG",
  "SANTA LUZIA/MG x MANAUS/AM",
  "SANTA LUZIA/MG x MOSSORÓ/RN",
  "SANTA LUZIA/MG x NATAL/RN",
  "SANTA LUZIA/MG x ARIQUEMES/RO",
  "SANTA LUZIA/MG x RECIFE/PE",
  "SANTA LUZIA/MG x SALVADOR/BA",
  "SANTA LUZIA/MG x SANTA LUZIA/MG",
  "SANTA LUZIA/MG x SMART",
  "SANTA LUZIA/MG x SUMARÉ/SP",
  "SANTA LUZIA/MG x TOTAL SERVICE",
  "SANTA LUZIA/MG x VESPASIANO/MG",
  "SANTA LUZIA/MG x BEBEDOURO/SP",
  "SANTA LUZIA/MG x CASTRO/PR",
  "SANTA LUZIA/MG x JUNDIAÍ/SP",
  "SANTA LUZIA/MG x DMA",
  "SANTA LUZIA/MG x PATROCÍNIO PAULISTA/SP",
  "SANTA LUZIA/MG x VARGEM GRANDE DO SUL/SP",
  "SANTA LUZIA/MG x SUPERFRIO",
  "SANTA LUZIA/MG x TRIANGULO/SP",
  "SANTA LUZIA/MG x NATAL/RN x EUSÉBIO/CE",
  "SANTA LUZIA/MG x BARRA VELHA/SC",
  "SANTA LUZIA/MG x UBERLÂNDIA/MG",
  "SANTA LUZIA/MG x CONTAGEM/MG",
  "SANTA LUZIA/MG x POUSO ALEGRE/MG",
  "SANTA LUZIA/MG x CONDOR x CURITIBA/PR",
  "SANTA LUZIA/MG x MUFFATO x CAMBÉ/PR",
  "SANTA LUZIA/MG x DESTRO x CURITIBA/PR",
  "SANTA LUZIA/MG x CUIABÁ/MT x ARIQUEMES/RO",
  "SANTA LUZIA/MG x PORTO ALEGRE/RS",
  "SANTA LUZIA/MG x CECONSUD",
  "SANTA LUZIA/MG x FUJIOKA x BRASÍLIA/DF",
  "SANTA LUZIA/MG x XAXIM/SC",
  "SANTA LUZIA/MG x TERESINA/PI",
  "SANTA LUZIA/MG x BARBALHA/CE",
  "SANTA LUZIA/MG x CSD x PAIÇANDU/PR",
  "SANTA LUZIA/MG x CARIACICA/ES",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS x CUIABÁ/MT",
  "SANTA LUZIA/MG x MACEIÓ/AL",
  "SANTA LUZIA/MG x EF SOLUÇÕES LOG x GUARULHOS/SP",
  "SANTA LUZIA/MG x JOÃO PESSOA/PB",
  "SANTA LUZIA/MG x BELÉM/PA",
];

const ORIGEM_OPCOES = [
  "SANTA LUZIA/MG",
  "VIANA/ES",
  "SERRA/ES",
  "CARIACICA/ES",
  "MONTES CLAROS/MG",
  "SMART/MG",
  "TOTAL SERVICE/MG",
  "CUIABÁ/MT",
  "JUIZ DE FORA/MG",
];

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // Navigation tab state: 'gerador' or 'prancheta'
  const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta'>('gerador');

  // State for all form fields
  const [numCarretas, setNumCarretas] = useState<1 | 2>(2);
  const [alertaResgate, setAlertaResgate] = useState(
    "FAVOR SE ATENTAR AO RESGATE!",
  );
  const [infoAbaixo, setInfoAbaixo] = useState(
    "Atentar às informações abaixo:",
  );

  // Routes & Warning lines
  const [origem, setOrigem] = useState("SANTA LUZIA/MG");
  const [rota1, setRota1] = useState("");
  const [instrucao1, setInstrucao1] = useState("* Favor, acusar o recebimento do pré-alerta;");

  // Table information (CCC.PNG layout)
  const [nfInicio, setNfInicio] = useState("");
  const [nfFim, setNfFim] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [motorista, setMotorista] = useState("");
  const [cavalo, setCavalo] = useState("");

  // Row 1 lists (Carreta 1, Isca 1, Produto 1, UMA 1)
  const [carreta1, setCarreta1] = useState("");
  const [carreta2, setCarreta2] = useState("");
  const [isca1, setIsca1] = useState("");
  const [isca2, setIsca2] = useState("");
  const [produto1, setProduto1] = useState("");
  const [produto2, setProduto2] = useState("");
  const [uma1, setUma1] = useState("");
  const [uma2, setUma2] = useState("");

  const [destino, setDestino] = useState("");
  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = [
      "jan.",
      "fev.",
      "mar.",
      "abr.",
      "mai.",
      "jun.",
      "jul.",
      "ago.",
      "set.",
      "out.",
      "nov.",
      "dez.",
    ];
    return `${day}-${months[now.getMonth()]}`;
  };

  const formatUMA = (value: string) => {
    if (!value) return "";

    // Se contiver letras, permite escrita alfanumérica livre (convertendo para maiúsculas)
    if (/[a-zA-Z]/.test(value)) {
      return value.toUpperCase();
    }

    // Remove todos os caracteres não numéricos se for estritamente numérico
    let digits = value.replace(/\D/g, "");

    if (!digits) return value.toUpperCase();

    // Se o primeiro dígito for '9' ou '6', não adiciona '0' nem pontos, e permite até 14 dígitos
    if (digits.length > 0 && (digits[0] === "9" || digits[0] === "6")) {
      return digits.substring(0, 14);
    }

    // Apenas adiciona '0' automaticamente se houver 11 dígitos e não começar com '0'
    if (digits.length === 11 && digits[0] !== "0") {
      digits = "0" + digits;
    }

    // Limita a 12 dígitos (padrão 0XXX.XXX.XXX.XXX)
    digits = digits.substring(0, 12);

    // Aplica pontos a cada 3 caracteres se for numérico
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ".";
      }
      formatted += digits[i];
    }
    return formatted;
  };

  const getInitialGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia,";
    if (hour < 18) return "Boa tarde,";
    return "Boa noite,";
  };

  const [dataEnviada, setDataEnviada] = useState(getFormattedDate());
  const [saudacao, setSaudacao] = useState(getInitialGreeting());

  useEffect(() => {
    setDataEnviada(getFormattedDate());
    setSaudacao(getInitialGreeting());
  }, []);

  // Parametrização and Esquema de Embarque
  const [parametrizacao, setParametrizacao] = useState(
    "Parametrização das Iscas",
  );
  const [esquemaEmbarque, setEsquemaEmbarque] = useState(
    "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
  );

  // Isca positions (addresses, times and battery level) matching the image exactly
  const [isca1Endereco, setIsca1Endereco] = useState("");
  const [isca2Endereco, setIsca2Endereco] = useState("");
  const [isca1Data, setIsca1Data] = useState("");
  const [isca2Data, setIsca2Data] = useState("");
  const [isca1Bateria, setIsca1Bateria] = useState("");
  const [isca2Bateria, setIsca2Bateria] = useState("");

  // Interactive ladders for Esquema de Embarque
  const [ladder1, setLadder1] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });
  const [ladder2, setLadder2] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });

  // Sidebar specific inputs (COLUNA.PNG layout)
  const [sidebarTransportadora, setSidebarTransportadora] =
    useState("moedense");
  const [sidebarTecnologia, setSidebarTecnologia] = useState("SASCAR");
  const [sidebarMotorista, setSidebarMotorista] = useState(
    "MARISON REZENDE LEMOS",
  );
  const [sidebarEmbarque1, setSidebarEmbarque1] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [sidebarEmbarque2, setSidebarEmbarque2] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [searchRota, setSearchRota] = useState("");
  const [pastePlanilha, setPastePlanilha] = useState("");

  // Prefixes and Suffixes for N° ISCAS (individual prefixes)
  const [iscaPrefix1, setIscaPrefix1] = useState("R10000");
  const [iscaPrefix2, setIscaPrefix2] = useState("R10000");
  const [iscaSuffix1, setIscaSuffix1] = useState("2195");
  const [iscaSuffix2, setIscaSuffix2] = useState("3797");

  const [copied, setCopied] = useState(false);
  const [copiedAssunto, setCopiedAssunto] = useState(false);
  const [ocultarNotas, setOcultarNotas] = useState(false);
  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>([]);
  const [newTranspName, setNewTranspName] = useState("");
  const [isAddingTransp, setIsAddingTransp] = useState(false);

  // Google Sheets Export States for Iscas (matching attached user format)
  const getIscaDataStatusDefault = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return `${day}.${months[now.getMonth()]}`; // e.g. "28.jul."
  };

  const [statusIsca1, setStatusIsca1] = useState("EM ROTA(IDA)");
  const [statusIsca2, setStatusIsca2] = useState("EM ROTA(IDA)");
  const [obs1Isca1, setObs1Isca1] = useState("PRÉ ALERTA OK");
  const [obs1Isca2, setObs1Isca2] = useState("PRÉ ALERTA OK");
  const [dataStatusIsca1, setDataStatusIsca1] = useState(getIscaDataStatusDefault());
  const [dataStatusIsca2, setDataStatusIsca2] = useState(getIscaDataStatusDefault());

  const [copiedIscaRow1, setCopiedIscaRow1] = useState(false);
  const [copiedIscaRow2, setCopiedIscaRow2] = useState(false);
  const [copiedIscaAll, setCopiedIscaAll] = useState(false);
  const [copiedIscaDataOnly, setCopiedIscaDataOnly] = useState(false);

  const getIscaRows = () => {
    const rows = [];
    const formattedDest = cleanDestinoForPlanilha(destino) || destino || "";
    
    // Row 1 (Isca 1)
    const row1 = {
      id: '1',
      idIsca: isca1 || "",
      destino: formattedDest,
      status: statusIsca1 || "EM ROTA(IDA)",
      obs1: obs1Isca1 || "PRÉ ALERTA OK",
      dataStatus: dataStatusIsca1 || getIscaDataStatusDefault(),
      carreta: carreta1 || "",
      cavalo: cavalo || "",
      motorista: motorista || sidebarMotorista || ""
    };
    rows.push(row1);

    // Row 2 (Isca 2, if 2 carretas and isca2 is set and not "SEM ISCA")
    if (numCarretas === 2 && isca2 && isca2 !== "SEM ISCA") {
      const row2 = {
        id: '2',
        idIsca: isca2 || "",
        destino: formattedDest,
        status: statusIsca2 || "EM ROTA(IDA)",
        obs1: obs1Isca2 || "PRÉ ALERTA OK",
        dataStatus: dataStatusIsca2 || getIscaDataStatusDefault(),
        carreta: carreta2 || "",
        cavalo: cavalo || "",
        motorista: motorista || sidebarMotorista || ""
      };
      rows.push(row2);
    }

    return rows;
  };

  const copyIscaRowToClipboard = (row: ReturnType<typeof getIscaRows>[0], withHeaders = false, isRow2 = false) => {
    const headers = ["ID ISCA", "DESTINO", "STATUS", "OBS 1", "DATA STATUS", "CARRETA", "CAVALO", "MOTORISTA"].join("\t");
    const rowTsv = [
      row.idIsca,
      row.destino,
      row.status,
      row.obs1,
      row.dataStatus,
      row.carreta,
      row.cavalo,
      row.motorista
    ].join("\t");

    const textToCopy = withHeaders ? `${headers}\n${rowTsv}` : rowTsv;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (isRow2) {
        setCopiedIscaRow2(true);
        setTimeout(() => setCopiedIscaRow2(false), 3000);
      } else {
        setCopiedIscaRow1(true);
        setTimeout(() => setCopiedIscaRow1(false), 3000);
      }
    });
  };

  const copyAllIscaRowsToClipboard = (withHeaders = true) => {
    const rows = getIscaRows();
    if (rows.length === 0) return;

    const headers = ["ID ISCA", "DESTINO", "STATUS", "OBS 1", "DATA STATUS", "CARRETA", "CAVALO", "MOTORISTA"].join("\t");
    const rowsTsv = rows.map(row => [
      row.idIsca,
      row.destino,
      row.status,
      row.obs1,
      row.dataStatus,
      row.carreta,
      row.cavalo,
      row.motorista
    ].join("\t")).join("\n");

    const textToCopy = withHeaders ? `${headers}\n${rowsTsv}` : rowsTsv;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (withHeaders) {
        setCopiedIscaAll(true);
        setTimeout(() => setCopiedIscaAll(false), 3000);
      } else {
        setCopiedIscaDataOnly(true);
        setTimeout(() => setCopiedIscaDataOnly(false), 3000);
      }
    });
  };

  const allTransportadoras = [...TRANSPORTADORAS, ...customTransportadoras];

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

  const handleAddCustomTransp = () => {
    const trimmed = newTranspName.trim();
    if (!trimmed) return;
    
    const exists = allTransportadoras.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Esta transportadora já está cadastrada!");
      return;
    }

    const updated = [...customTransportadoras, trimmed];
    setCustomTransportadoras(updated);
    setSidebarTransportadora(trimmed);
    setTransportadora(trimmed);
    setNewTranspName("");
    setIsAddingTransp(false);
  };

  const handleIsca1Change = (val: string) => {
    setIsca1(val);
    if (val.startsWith(iscaPrefix1)) {
      setIscaSuffix1(val.substring(iscaPrefix1.length));
    } else {
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
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
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
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

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    interface ParsedIsca {
      id: string;
      endereco: string;
      data: string;
      bateria: string;
    }
    const parsedItems: ParsedIsca[] = [];

    lines.forEach((line) => {
      const matchIsca = line.match(/^(\S+)/);
      if (!matchIsca) return;
      const iscaId = matchIsca[1];

      // Match DD/MM/YYYY HH:MM:SS or HH:MM
      const dateRegex =
        /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})|(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/;
      const matchDate = line.match(dateRegex);

      let address = "";
      let dateVal = "";
      let batteryVal = "100%";

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
          address = parts.slice(1).join(" ");
        }
      }

      parsedItems.push({
        id: iscaId,
        endereco: address,
        data: dateVal,
        bateria: batteryVal,
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

      const isMatch1 =
        cleanIscaSuffix1.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix1) || cleanIsca1.includes(cleanId));
      const isMatch2 =
        cleanIscaSuffix2.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix2) || cleanIsca2.includes(cleanId));

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

    if (parsedItems.length === 1) {
      setNumCarretas(1);
    } else if (parsedItems.length >= 2) {
      setNumCarretas(2);
    }
  };

  const STORAGE_KEY = "controle_pgr_data";

  // Sync initial values and load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.numCarretas !== undefined) setNumCarretas(data.numCarretas);
        if (data.alertaResgate !== undefined) setAlertaResgate(data.alertaResgate);
        if (data.infoAbaixo !== undefined) setInfoAbaixo(data.infoAbaixo);
        if (data.origem !== undefined) setOrigem(data.origem);
        if (data.rota1 !== undefined) setRota1(data.rota1);
        if (data.instrucao1 !== undefined) setInstrucao1(data.instrucao1);
        if (data.nfInicio !== undefined) setNfInicio(data.nfInicio);
        if (data.nfFim !== undefined) setNfFim(data.nfFim);
        if (data.transportadora !== undefined) setTransportadora(data.transportadora);
        if (data.motorista !== undefined) setMotorista(data.motorista);
        if (data.cavalo !== undefined) setCavalo(data.cavalo);
        if (data.carreta1 !== undefined) setCarreta1(data.carreta1);
        if (data.carreta2 !== undefined) setCarreta2(data.carreta2);
        if (data.isca1 !== undefined) setIsca1(data.isca1);
        if (data.isca2 !== undefined) setIsca2(data.isca2);
        if (data.produto1 !== undefined) setProduto1(data.produto1);
        if (data.produto2 !== undefined) setProduto2(data.produto2);
        if (data.uma1 !== undefined) setUma1(data.uma1);
        if (data.uma2 !== undefined) setUma2(data.uma2);
        if (data.destino !== undefined) setDestino(data.destino);
        if (data.parametrizacao !== undefined) setParametrizacao(data.parametrizacao);
        if (data.esquemaEmbarque !== undefined) setEsquemaEmbarque(data.esquemaEmbarque);
        if (data.isca1Endereco !== undefined) setIsca1Endereco(data.isca1Endereco);
        if (data.isca2Endereco !== undefined) setIsca2Endereco(data.isca2Endereco);
        if (data.isca1Data !== undefined) setIsca1Data(data.isca1Data);
        if (data.isca2Data !== undefined) setIsca2Data(data.isca2Data);
        if (data.isca1Bateria !== undefined) setIsca1Bateria(data.isca1Bateria);
        if (data.isca2Bateria !== undefined) setIsca2Bateria(data.isca2Bateria);
        if (data.ladder1 !== undefined) setLadder1(data.ladder1);
        if (data.ladder2 !== undefined) setLadder2(data.ladder2);
        if (data.sidebarTransportadora !== undefined) setSidebarTransportadora(data.sidebarTransportadora);
        if (data.sidebarTecnologia !== undefined) setSidebarTecnologia(data.sidebarTecnologia);
        if (data.sidebarMotorista !== undefined) setSidebarMotorista(data.sidebarMotorista);
        if (data.sidebarEmbarque1 !== undefined) setSidebarEmbarque1(data.sidebarEmbarque1);
        if (data.sidebarEmbarque2 !== undefined) setSidebarEmbarque2(data.sidebarEmbarque2);
        if (data.iscaPrefix1 !== undefined) setIscaPrefix1(data.iscaPrefix1);
        if (data.iscaPrefix2 !== undefined) setIscaPrefix2(data.iscaPrefix2);
        if (data.iscaSuffix1 !== undefined) setIscaSuffix1(data.iscaSuffix1);
        if (data.iscaSuffix2 !== undefined) setIscaSuffix2(data.iscaSuffix2);
        if (data.customTransportadoras !== undefined) setCustomTransportadoras(data.customTransportadoras);
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
      }
    } else {
      setSidebarTransportadora(transportadora);
      setSidebarMotorista(motorista);
    }
  }, []);

  // Save to localStorage whenever a state changes
  useEffect(() => {
    const dataToSave = {
      numCarretas,
      alertaResgate,
      infoAbaixo,
      origem,
      rota1,
      instrucao1,
      nfInicio,
      nfFim,
      transportadora,
      motorista,
      cavalo,
      carreta1,
      carreta2,
      isca1,
      isca2,
      produto1,
      produto2,
      uma1,
      uma2,
      destino,
      parametrizacao,
      esquemaEmbarque,
      isca1Endereco,
      isca2Endereco,
      isca1Data,
      isca2Data,
      isca1Bateria,
      isca2Bateria,
      ladder1,
      ladder2,
      sidebarTransportadora,
      sidebarTecnologia,
      sidebarMotorista,
      sidebarEmbarque1,
      sidebarEmbarque2,
      iscaPrefix1,
      iscaPrefix2,
      iscaSuffix1,
      iscaSuffix2,
      customTransportadoras,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    numCarretas,
    alertaResgate,
    infoAbaixo,
    origem,
    rota1,
    instrucao1,
    nfInicio,
    nfFim,
    transportadora,
    motorista,
    cavalo,
    carreta1,
    carreta2,
    isca1,
    isca2,
    produto1,
    produto2,
    uma1,
    uma2,
    destino,
    parametrizacao,
    esquemaEmbarque,
    isca1Endereco,
    isca2Endereco,
    isca1Data,
    isca2Data,
    isca1Bateria,
    isca2Bateria,
    ladder1,
    ladder2,
    sidebarTransportadora,
    sidebarTecnologia,
    sidebarMotorista,
    sidebarEmbarque1,
    sidebarEmbarque2,
    iscaPrefix1,
    iscaPrefix2,
    iscaSuffix1,
    iscaSuffix2,
    customTransportadoras,
  ]);

  const handleClearVeiculo = () => {
    setCavalo("");
    setCarreta1("");
    setCarreta2("");
    setIsca1("");
    setIsca2("");
    setProduto1("");
    setProduto2("");
    setUma1("");
    setUma2("");
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Deseja realmente limpar todas as informações do controle?",
      )
    ) {
      setNumCarretas(2);
      setSaudacao(getInitialGreeting());
      setAlertaResgate("Favor se atentar ao resgate!");
      setInfoAbaixo("Atentar às informações abaixo:");
      setOrigem("SANTA LUZIA/MG");
      setRota1("");
      setInstrucao1("* Favor, acusar o recebimento do pré-alerta;");
      setNfInicio("");
      setNfFim("");
      setTransportadora("");
      setMotorista("");
      setCavalo("");
      setCarreta1("");
      setCarreta2("");
      setIsca1("");
      setIsca2("");
      setProduto1("");
      setProduto2("");
      setUma1("");
      setUma2("");
      setDestino("");
      setDataEnviada(getFormattedDate());
      setParametrizacao("Parametrização das iscas");
      setEsquemaEmbarque(
        "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
      );

      setIsca1Endereco("");
      setIsca2Endereco("");
      setIsca1Data("");
      setIsca2Data("");
      setIsca1Bateria("");
      setIsca2Bateria("");

      setLadder1(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });
      setLadder2(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });

      setSidebarTransportadora("");
      setSidebarTecnologia("");
      setSidebarMotorista("");
      setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setPastePlanilha("");

      setIscaPrefix1("R10000");
      setIscaPrefix2("R10000");
      setIscaSuffix1("");
      setIscaSuffix2("");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    const isPaletizado1 = sidebarEmbarque1 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF";
    const isPaletizado2 = sidebarEmbarque2 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF";

    // Helper to render ladder visual grid inside email HTML matching modern executive style
    const renderLadderHtml = (
      grid: string[][],
      label: string,
      plate: string,
      extraStyle: string = "",
    ) => {
      return `
        <td style="vertical-align: top; width: 50%; text-align: center; ${extraStyle}">
          
          <table cellpadding="0" cellspacing="0" style="width: 75px; margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td colspan="2" style="background-color: #0F172A; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 5px 0; border: 1px solid #0F172A; text-transform: uppercase; text-align: center; letter-spacing: 0.5px;">${label}</td>
            </tr>
            ${grid
              .map((row) => {
                return `
                <tr>
                  ${row
                    .map((cell) => {
                      const bg = cell === "P" ? "#DC2626" : "#FFFFFF";
                      const color = cell === "P" ? "#FFFFFF" : "#0F172A";
                      return `<td style="border: 1px solid #CBD5E1; background-color: ${bg}; color: ${color}; font-size: 10px; font-weight: bold; width: 50%; height: 18px; text-align: center; vertical-align: middle;">${cell === "P" ? "P" : ""}</td>`;
                    })
                    .join("")}
                </tr>`;
              })
              .join("")}
          </table>
          
          <p style="font-size: 11px; font-weight: 800; color: #0F172A; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${plate}</p>
        </td>
      `;
    };

    const htmlEmail = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #FFFFFF; padding: 24px; color: #0F172A; max-width: 850px; border-radius: 8px; border: 1px solid #E2E8F0;">
        
        <!-- Saudação -->
        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-weight: 700; color: #0F172A; font-size: 15px; margin-bottom: 16px; margin-top: 0; padding: 0;">${saudacao || "Boa tarde,"}</p>
        
        <!-- Alerta Resgate Corporate Banner -->
        <div style="background-color: #DC2626; color: #FFFFFF; font-weight: 900; padding: 10px 18px; display: inline-block; margin-bottom: 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${alertaResgate || "FAVOR SE ATENTAR AO RESGATE!"}
        </div>
        
        <p style="font-weight: 800; font-size: 13px; margin-bottom: 14px; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">${infoAbaixo || "Atentar às informações abaixo:"}</p>
        
        <!-- Caixa de Observações (Executive Blue Left Card) -->
        <div style="border: 1px solid #CBD5E1; border-left: 5px solid #0284C7; background-color: #F0F9FF; padding: 14px 18px; margin-bottom: 24px; max-width: 620px; border-radius: 6px;">
          <div style="font-size: 12px; font-weight: 700; color: #0F172A; line-height: 1.6;">
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="color: #0284C7; font-weight: 900; margin-right: 10px; font-size: 14px;">•</span> ${rota1}
            </div>
            <div style="display: flex; align-items: center;">
              <span style="color: #0284C7; font-weight: 900; margin-right: 10px; font-size: 14px;">•</span> ${instrucao1}
            </div>
          </div>
        </div>

        <!-- TABELA 1: PRÉ-ALERTA DE ISCA EMBARCADA -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 12px; text-align: center; font-weight: bold; color: #0F172A; margin-bottom: 25px; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #0F172A; color: #FFFFFF;">
              <th colspan="2" style="background-color: #0F172A; color: #FFFFFF; border-right: 1px solid #334155; border-bottom: 1px solid #334155; font-weight: 900; padding: 10px; text-transform: uppercase; font-size: 11px; width: 25%; letter-spacing: 0.5px;">NÚMERO DA NF:</th>
              <th colspan="1" style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 6px; width: 15%; background-color: #F8FAFC; text-align: center; font-family: sans-serif; font-size: 11px; line-height: 1.2;">
                <div style="font-weight: 900; color: #0F172A; text-align: center; width: 100%;">${nfInicio.replace(/-/g, '') || '&nbsp;'}</div>
                ${numCarretas === 2 && isca2 !== "SEM ISCA" ? `
                  <div style="font-weight: 900; color: #0F172A; text-align: center; width: 100%;">${nfFim.replace(/-/g, '') || nfInicio.replace(/-/g, '') || '&nbsp;'}</div>
                ` : ''}
              </th>
              <th colspan="1" style="background-color: #0F172A; color: #FFFFFF; border-right: 1px solid #334155; border-bottom: 1px solid #334155; font-weight: 900; padding: 10px; text-transform: uppercase; font-size: 11px; width: 18%; letter-spacing: 0.5px;">TRANSPORTADORA:</th>
              <th colspan="2" style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 6px; width: 25%; background-color: #F8FAFC; text-transform: uppercase; font-weight: 900; color: #0F172A;">${transportadora}</th>
              <th colspan="2" style="background-color: #0F172A; border-bottom: 1px solid #334155; width: 17%;"></th>
            </tr>
            <tr style="background-color: #0F172A; color: #FFFFFF; text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 0.5px;">
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 22%;">MOTORISTA</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 11%;">CAVALO</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 11%;">CARRETAS</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 13%;">N° ISCA</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 14%;">PRODUTO EMBARCADO</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 15%;">CÓDIGO U.M.A.</th>
              <th style="border-right: 1px solid #334155; border-bottom: 1px solid #334155; padding: 9px; width: 11%;">DESTINO</th>
              <th style="border-bottom: 1px solid #334155; padding: 9px; width: 11%;">DATA PARTIDA</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #CBD5E1; text-align: center; background-color: #FFFFFF;">
              <td rowspan="${numCarretas}" style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 700; text-transform: uppercase; font-size: 11px; color: #0F172A;">${motorista}</td>
              <td rowspan="${numCarretas}" style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 900; text-transform: uppercase; font-size: 13px; color: #0284C7; letter-spacing: 0.5px;">${cavalo.replace(/-/g, '')}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; text-transform: uppercase; font-weight: 700; color: #0F172A;">${carreta1}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 900; font-size: 13px; color: #DC2626;">${isca1}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 700; font-size: 12px; color: #0F172A;">${produto1}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 700; font-size: 12px; color: #0F172A;">${uma1}</td>
              <td rowspan="${numCarretas}" style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 800; text-transform: uppercase; font-size: 11px; color: #0F172A;">${destino}</td>
              <td rowspan="${numCarretas}" style="padding: 10px; font-weight: 700; font-size: 12px; color: #0F172A;">${dataEnviada}</td>
            </tr>
            ${
              numCarretas === 2
                ? `
            <tr style="border-bottom: 1px solid #CBD5E1; text-align: center; background-color: #F8FAFC;">
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; text-transform: uppercase; font-weight: 700; color: #0F172A;">${carreta2}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 900; font-size: 13px; color: #DC2626;">${isca2}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 700; font-size: 12px; color: #0F172A;">${produto2}</td>
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 700; font-size: 12px; color: #0F172A;">${uma2}</td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>

        <!-- TABELA 2: PARAMETRIZAÇÃO DAS ISCAS -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 11px; text-align: center; font-weight: bold; color: #0F172A; margin-bottom: 30px; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
          <tr style="background-color: #0F172A; color: #FFFFFF; font-size: 12px;">
            <td colspan="4" style="padding: 10px; border: 1px solid #334155; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">PARAMETRIZAÇÃO DAS ISCAS</td>
          </tr>
          <tr style="background-color: #1E293B; color: #FFFFFF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
            <td style="padding: 8px; border: 1px solid #334155; width: 25%;">
              <span style="background-color: #0F172A; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; font-size: 9px; text-transform: uppercase; font-weight: 900; border: 1px solid #475569;">
                ${numCarretas === 2 && isca2 !== "SEM ISCA" ? `${isca1} ${isca2}` : isca1}
              </span>
            </td>
            <td style="padding: 8px; border: 1px solid #334155; width: 45%; color: #FFFFFF;">🔍 ENDEREÇO APROXIMADO DA POSIÇÃO ⇅</td>
            <td style="padding: 8px; border: 1px solid #334155; width: 20%; color: #FFFFFF;">🔍 DATA POSIÇÃO ⇅</td>
            <td style="padding: 8px; border: 1px solid #334155; width: 10%; color: #FFFFFF;">🔍 BATERIA ISCA_RF ⇅</td>
          </tr>
          ${
            numCarretas === 2
              ? `
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-transform: uppercase; font-weight: 900; color: #DC2626;">${isca2 === "SEM ISCA" ? "" : isca2}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-align: left; padding-left: 12px; font-weight: 600; color: #334155;">${isca2 === "SEM ISCA" ? "" : isca2Endereco}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; font-weight: 600; color: #0F172A;">${isca2 === "SEM ISCA" ? "" : isca2Data}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1;">
              <div style="display: flex; align-items: center; justify-content: center;">
                ${isca2 !== "SEM ISCA" ? `<span style="margin-right: 6px; font-weight: 800; color: #16A34A;">${isca2Bateria || "100%"}</span>` : ""}
                <div style="width: 20px; height: 10px; border: 1px solid #16A34A; border-radius: 2px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${isca2 === "SEM ISCA" ? 0 : Math.min(100, parseInt(isca2Bateria) || 100)}%; height: 100%; background-color: #16A34A; border-radius: 1px;"></div>
                  <div style="position: absolute; right: -3px; top: 2px; width: 2px; height: 4px; background-color: #16A34A; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
            </td>
          </tr>
          `
              : ""
          }
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-transform: uppercase; font-weight: 900; color: #DC2626;">${isca1}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-align: left; padding-left: 12px; font-weight: 600; color: #334155;">${isca1Endereco}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; font-weight: 600; color: #0F172A;">${isca1Data}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1;">
              <div style="display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 6px; font-weight: 800; color: #16A34A;">${isca1Bateria || "100%"}</span>
                <div style="width: 20px; height: 10px; border: 1px solid #16A34A; border-radius: 2px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${Math.min(100, parseInt(isca1Bateria) || 100)}%; height: 100%; background-color: #16A34A; border-radius: 1px;"></div>
                  <div style="position: absolute; right: -3px; top: 2px; width: 2px; height: 4px; background-color: #16A34A; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- SEÇÃO: ESQUEMA DE EMBARQUE -->
        ${
          ocultarNotas
            ? ""
            : `
        <div style="margin-top: 25px;">
          <p style="font-weight: 900; font-size: 13px; margin-bottom: 20px; color: #0F172A; text-transform: uppercase; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; letter-spacing: 0.5px;">
            ESQUEMA DE EMBARQUE DAS ISCAS:
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; max-width: 720px; margin: 0 auto; gap: ${(!sidebarEmbarque1 && !sidebarEmbarque2) ? '10px' : '30px'};">
            <!-- Carreta 1 Section -->
            ${
              sidebarEmbarque1 === "none"
                ? ""
                : sidebarEmbarque1
                ? `
                <div style="text-align: center; width: ${isPaletizado1 ? '150px' : '320px'};">
                  <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: ${isPaletizado1 ? '6px' : '12px'}; margin-bottom: ${isPaletizado1 ? '8px' : '15px'}; width: ${isPaletizado1 ? '150px' : '320px'}; height: ${isPaletizado1 ? '200px' : '420px'}; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 6px; shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${sidebarEmbarque1}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: ${isPaletizado1 ? '9px' : '11px'}; font-weight: 800; color: #0F172A; margin-top: ${isPaletizado1 ? '6px' : '12px'}; text-transform: uppercase;">${carreta1}</p>
                </div>
              `
                : `<div style="text-align: center; width: 100px;">
                    ${renderLadderHtml(ladder1, "ESCALA 01", carreta1, "").replace('padding-right: 15px; padding-top: 15px;', '')}
                  </div>`
            }

            <!-- Carreta 2 Section -->
            ${
              numCarretas === 2
                ? (sidebarEmbarque2 === "none"
                  ? ""
                  : sidebarEmbarque2
                  ? `
                <div style="text-align: center; width: ${isPaletizado2 ? '150px' : '320px'};">
                  <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: ${isPaletizado2 ? '6px' : '12px'}; margin-bottom: ${isPaletizado2 ? '8px' : '15px'}; width: ${isPaletizado2 ? '150px' : '320px'}; height: ${isPaletizado2 ? '200px' : '420px'}; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 6px; shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${sidebarEmbarque2}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: ${isPaletizado2 ? '9px' : '11px'}; font-weight: 800; color: #0F172A; margin-top: ${isPaletizado2 ? '6px' : '12px'}; text-transform: uppercase;">${carreta2}</p>
                </div>
                `
                  : `<div style="text-align: center; width: 100px;">
                      ${renderLadderHtml(ladder2, "ESCALA 02", carreta2, "").replace('padding-top: 15px;', '')}
                    </div>`)
                : ""
            }
          </div>
        </div>
        `
        }

        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0; clear: both;">

        <!-- Rodapé Corporativo -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 6px;">
          <p style="font-size: 11px; font-weight: 900; color: #0F172A; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">GERENCIAMENTO DE RISCO</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.</p>
          <p style="font-size: 11px; color: #334155; margin: 0; font-weight: 500; line-height: 1.5;">Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.</p>
        </div>

      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${[nfInicio, (numCarretas === 2 && isca2 !== "SEM ISCA" ? nfFim : "")].filter(Boolean).map(v => v.replace(/-/g, '')).join(' ')} | TRANSPORTADORA: ${transportadora}
-----------------------------------------------------------------------------------------------------------------
MOTORISTA: ${motorista}
CAVALO: ${cavalo.replace(/-/g, '')}
DESTINO: ${destino}
DATA ENVIADA: ${dataEnviada}
-----------------------------------------------------------------------------------------------------------------
DETALHES DE CARGA & ISCAS:
1. Carreta: ${carreta1} | N° Isca: ${isca1} | Produto: ${produto1} | Cód U.M.A.: ${uma1}
${numCarretas === 2 ? `2. Carreta: ${carreta2} | N° Isca: ${isca2} | Produto: ${produto2} | Cód U.M.A.: ${uma2}` : ""}
-----------------------------------------------------------------------------------------------------------------
${parametrizacao.toUpperCase()}
${
  ocultarNotas
    ? ""
    : `
ESQUEMA DE EMBARQUE DAS ISCAS:
${
  numCarretas === 1
    ? `1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}`
    : `
1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}
2. CARRETA: ${carreta2} - ${sidebarEmbarque2 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)?.label : "Paletizado (Padrão)"}
`.trim()
}
`
}
-----------------------------------------------------------------------------------------------------------------
Informações de Apoio:
Tecnologia: ${sidebarTecnologia}
Embarque: ${
  sidebarEmbarque1 || sidebarEmbarque2
    ? [
        sidebarEmbarque1
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)
              ?.label || "Carreta 1"
          : null,
        sidebarEmbarque2 && numCarretas === 2
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)
              ?.label || "Carreta 2"
          : null,
      ]
        .filter(Boolean)
        .join(" / ")
    : "PALETIZADO (PADRÃO)"
}
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      // Fallback
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        alert(
          "Falha ao copiar conteúdo. Por favor, selecione e copie manualmente.",
        );
      }
    }
  };

  const handleCopySubject = async () => {
    const isDefaultOrigem = origem === "SANTA LUZIA/MG";
    const subjectPrefix = isDefaultOrigem ? "" : `${origem.toUpperCase()} X `;
    const subject = `PRÉ-ALERTA DE ISCA - ${subjectPrefix}${(destino || "GUARULHOS/SP").toUpperCase()} - ${(cavalo.replace(/-/g, "") || "TYQ6F51").toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedAssunto(true);
      setTimeout(() => setCopiedAssunto(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar assunto:", err);
    }
  };

  const handleUsePranchetaRow = (row: PranchetaRow) => {
    if (row.noIsca) handleIsca1Change(row.noIsca);
    if (row.cavalo) setCavalo(row.cavalo);
    if (row.carreta) setCarreta1(row.carreta);
    if (row.noNf) setNfInicio(row.noNf);
    if (row.produto) setProduto1(row.produto);
    if (row.uma) setUma1(formatUMA(row.uma));
    if (row.destino) {
      const destUpper = row.destino.toUpperCase();
      const matched = DESTINOS_OPCOES.find((d) => d.toUpperCase().includes(destUpper));
      if (matched) {
        setDestino(matched);
      } else {
        setDestino(row.destino);
      }
    }
    setActiveTab("gerador");
    alert(`Informações da ISCA ${row.noIsca} aplicadas no Gerador de Controle PGR!`);
  };

  return (
    <div 
      className="w-full relative z-10 max-w-[102rem] mx-auto flex flex-col gap-5 font-sans"
      style={{ zoom: 0.9 }}
    >
      {/* Top Navigation Tabs Bar */}
      <div className="bg-[#FFFDFB] border-2 border-[#5c3e29] rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
              activeTab === "gerador"
                ? "bg-[#B32025] text-white shadow-md"
                : "bg-transparent text-[#5c3e29] hover:bg-[#EFE3CD]"
            )}
          >
            <Sliders size={16} />
            Gerador de Controle PGR
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prancheta")}
            className={cn(
              "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer relative",
              activeTab === "prancheta"
                ? "bg-[#7A0C22] text-white shadow-md"
                : "bg-transparent text-[#5c3e29] hover:bg-[#EFE3CD]"
            )}
          >
            <FileText size={16} />
            Prancheta (Anexo)
            <span className="bg-[#B32025] text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
              Digitalizada
            </span>
          </button>
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

      {/* TAB CONTENT: Prancheta */}
      {activeTab === "prancheta" && (
        <Prancheta onUseRowInControle={handleUsePranchetaRow} />
      )}

      {/* TAB CONTENT: Gerador PGR */}
      {activeTab === "gerador" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px_380px] gap-6 items-start">
      {/* LEFT AREA: Template Generator (expanded dynamically) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div className="flex-1 rounded-3xl bg-white border border-slate-200/80 shadow-xl relative overflow-hidden flex flex-col p-6 sm:p-8">

          {/* Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white p-2.5 rounded-2xl shadow-md">
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-sans font-black text-slate-900 uppercase tracking-tight">
                  Gerador de Controle PGR
                </h2>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
                  Gerador corporativo de pré-alerta e iscas
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Menu
              </button>
            )}
          </div>

          {/* Generator Workspace Form */}
          <div className="flex flex-col gap-6">
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 shrink-0">
                Saudação:
              </label>
              <div className="relative flex-1 max-w-[200px]">
                <select
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-extrabold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all cursor-pointer shadow-2xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Define a saudação inicial do pré-alerta
              </p>
            </div>

            {/* EMAIL SUBJECT HEADER BLOCK */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg text-white">
              <div className="flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                  Assunto do E-mail (Copiar separadamente)
                </span>
                <h1 className="text-lg font-sans font-black text-white uppercase tracking-tight m-0 select-all">
                  PRÉ-ALERTA DE ISCA - {destino || "BRASÍLIA"} -{" "}
                  {cavalo.replace(/-/g, "") || "TYQ6F51"}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "flex items-center gap-2 font-black uppercase text-[10px] tracking-wider px-4 py-3 rounded-xl shadow-md transition-all cursor-pointer select-none active:scale-95 shrink-0 border-2",
                  copiedAssunto
                    ? "bg-emerald-600 text-white border-transparent"
                    : "bg-red-600 hover:bg-red-700 text-white border-transparent",
                )}
              >
                {copiedAssunto ? (
                  <>
                    <Check size={12} className="stroke-[3]" /> COPIADO!
                  </>
                ) : (
                  <>
                    <Copy size={12} className="stroke-[2.5]" /> COPIAR ASSUNTO
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW CONTAINER - CORPORATE EXECUTIVE OFFICE PREVIEW */}
            <div className="bg-slate-50 border border-slate-300 rounded-3xl p-6 sm:p-7 shadow-xl overflow-x-auto relative">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block mb-5 border-b border-slate-200 pb-2">
                Visualização do Pré-Alerta (Template do E-mail)
              </span>

              <div className="min-w-[850px] font-sans text-xs text-slate-900">
                {/* 1. Greeting Output */}
                <div className="mb-4 font-sans font-extrabold text-sm text-slate-900 ml-0 pl-0">
                  {saudacao}
                </div>

                {/* 2. Executive Alert Banner */}
                <div className="mb-5 bg-red-600 text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider shadow-sm flex items-center rounded-lg border border-red-700 max-w-max ml-0">
                  <input
                    type="text"
                    value={alertaResgate}
                    onChange={(e) => setAlertaResgate(e.target.value)}
                    className="bg-transparent border-none text-white w-full outline-none font-black text-xs uppercase p-0.5 focus:ring-1 focus:ring-white/40 hover:bg-white/10 rounded px-1.5 transition-all min-w-[280px]"
                    placeholder="ALERTA RESGATE"
                  />
                </div>

                {/* 3. Atentar às informações */}
                <div className="mb-3.5 font-black text-slate-900 text-[13px] ml-0 pl-0">
                  <input
                    type="text"
                    value={infoAbaixo}
                    onChange={(e) => setInfoAbaixo(e.target.value)}
                    className="bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1.5 py-0.5 w-full font-black text-slate-900 transition-all"
                  />
                </div>

                {/* 4. Routes and Instructions Selector Box with executive left highlight */}
                <div className="border border-slate-200 border-l-4 border-l-sky-600 bg-sky-50/70 p-4 mb-6 font-bold leading-relaxed max-w-xl rounded-lg shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-600 text-sm">•</span>
                    <input
                      type="text"
                      value={rota1}
                      onChange={(e) => setRota1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-slate-200/50 focus:bg-slate-200 rounded text-xs text-slate-900 transition-all"
                      placeholder="· SANTA LUZIA/MG x GUARULHOS/SP;"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sky-600 text-sm">•</span>
                    <input
                      type="text"
                      value={instrucao1}
                      onChange={(e) => setInstrucao1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-slate-200/50 focus:bg-slate-200 rounded text-xs text-slate-900 transition-all"
                      placeholder="· * Favor, acusar o recebimento do pré-alerta;"
                    />
                  </div>
                </div>

                {/* 5. BIG INTERACTIVE SPREADSHEET TABLE 1 */}
                <div className="flex justify-end gap-2 mb-2">
                  {numCarretas === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNumCarretas(2);
                        if (isca2 === "SEM ISCA") {
                          setIsca2("");
                          setProduto2("");
                          setUma2("");
                        }
                      }}
                      className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                    >
                      <Plus size={10} className="stroke-[3]" /> Adicionar
                      Segunda Carreta
                    </button>
                  ) : (
                    <>
                      {isca2 === "SEM ISCA" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsca2("");
                            setProduto2("");
                            setUma2("");
                          }}
                          className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                        >
                          <Plus size={10} className="stroke-[3]" /> Adicionar Isca
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsca2("SEM ISCA");
                            setProduto2("---");
                            setUma2("---");
                            setNfFim("");
                            if (!carreta2 && carreta1) {
                              setCarreta2(carreta1);
                            }
                          }}
                          className="flex items-center gap-1 bg-[#B32025] hover:bg-[#8c060a] text-white font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer select-none"
                        >
                          <Minus size={10} className="stroke-[3]" /> Sem Isca
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNumCarretas(1);
                          setNfFim("");
                        }}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-extrabold uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-md shadow-2xs transition-all cursor-pointer select-none"
                      >
                        <Minus size={10} className="stroke-[3]" /> Remover Segunda
                        Carreta
                      </button>
                    </>
                  )}
                </div>
                <table className="w-full border-collapse border border-slate-300 text-xs font-sans text-slate-900 table-fixed rounded-lg overflow-hidden shadow-2xs">
                  <thead>
                    {/* Row 1: NF and Transportadora */}
                    <tr className="border-b border-slate-300">
                      <th
                        colSpan={2}
                        className="bg-slate-900 border-r border-slate-700 text-white text-center font-extrabold p-2.5 uppercase text-[11px] align-middle w-[25%]"
                      >
                        NÚMERO DA NF:
                      </th>
                      <th
                        colSpan={1}
                        className="border-r border-slate-300 p-1.5 align-middle w-[15%] bg-slate-50"
                      >
                        <div className="flex flex-col items-center gap-0 w-full">
                          <input
                            type="text"
                            value={nfInicio}
                            onChange={(e) => setNfInicio(e.target.value.replace(/-/g, ""))}
                            className="w-full text-center font-extrabold bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 text-[11px] text-slate-900 transition-all duration-200"
                            placeholder="INÍCIO"
                          />
                          {numCarretas === 2 && isca2 !== "SEM ISCA" && (
                            <input
                              type="text"
                              value={nfFim}
                              onChange={(e) => setNfFim(e.target.value.replace(/-/g, ""))}
                              className="w-full text-center font-extrabold bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 text-[11px] text-slate-900 transition-all duration-200"
                              placeholder="FIM"
                            />
                          )}
                        </div>
                      </th>
                      <th
                        colSpan={1}
                        className="bg-slate-900 border-r border-slate-700 text-white text-center font-extrabold p-2.5 uppercase text-[11px] align-middle w-[18%]"
                      >
                        TRANSPORTADORA:
                      </th>
                      <th
                        colSpan={2}
                        className="p-1.5 border-r border-slate-300 align-middle w-[25%] bg-slate-50"
                      >
                        <select
                          value={transportadora}
                          onChange={(e) =>
                            handleTableTranspChange(e.target.value)
                          }
                          className="w-full text-center font-extrabold uppercase bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 text-xs cursor-pointer text-slate-900 transition-all duration-200"
                        >
                          <option value="">SELECIONE...</option>
                          {allTransportadoras.map((t) => (
                            <option
                              key={t}
                              value={t}
                              className="text-slate-900 uppercase text-xs font-black"
                            >
                              {t}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th colSpan={2} className="w-[17%] bg-slate-900"></th>
                    </tr>

                    {/* Row 2: Standard Columns Headings */}
                    <tr className="border-b border-slate-300 bg-slate-900 text-white text-center font-extrabold uppercase text-[10px] h-[36px]">
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[22%]">
                        MOTORISTA
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[11%]">
                        CAVALO
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[11%]">
                        CARRETAS
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[13%]">
                        N° ISCA
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[14%]">
                        PRODUTO EMBARCADO
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[15%]">
                        CÓDIGO U.M.A.
                      </th>
                      <th className="border-r border-slate-700 p-1.5 align-middle w-[11%]">
                        DESTINO
                      </th>
                      <th className="p-1.5 align-middle w-[11%]">
                        DATA PARTIDA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Rows of data */}
                    <tr className="border-b border-slate-300 text-center text-xs h-[42px] bg-white">
                      {/* Motorista - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-slate-300 p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <textarea
                          value={motorista}
                          onChange={(e) =>
                            handleTableMotoristaChange(e.target.value)
                          }
                          className="w-full h-full min-h-[48px] text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded resize-none p-1 text-xs leading-snug text-slate-900 transition-all duration-200"
                          placeholder="NOME MOTORISTA"
                        />
                      </td>

                      {/* Cavalo - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-slate-300 p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <input
                          type="text"
                          value={cavalo}
                          onChange={(e) => setCavalo(e.target.value.replace(/-/g, ""))}
                          className="w-full text-center font-extrabold uppercase bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 text-[14px] text-slate-900 transition-all duration-200"
                          placeholder="PLACA"
                        />
                      </td>

                      {/* Carreta Row 1 */}
                      <td className="border-r border-slate-300 p-1.5 align-middle">
                        <input
                          type="text"
                          value={carreta1}
                          onChange={(e) => setCarreta1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 uppercase font-bold text-xs text-slate-900 transition-all duration-200"
                          placeholder="CARRETA 1"
                        />
                      </td>

                      {/* N Iscas Row 1 */}
                      <td className="border-r border-slate-300 p-1.5 align-middle">
                        <input
                          type="text"
                          value={isca1}
                          onChange={(e) => handleIsca1Change(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 uppercase font-black text-[13px] text-red-600 transition-all duration-200"
                          placeholder="ISCA 1"
                        />
                      </td>

                      {/* Produto Row 1 */}
                      <td className="border-r border-slate-300 p-1.5 align-middle">
                        <input
                          type="text"
                          value={produto1}
                          onChange={(e) => setProduto1(e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 uppercase font-bold text-[13px] text-slate-900 transition-all duration-200"
                          placeholder="PROD 1"
                        />
                      </td>

                      {/* UMA Row 1 */}
                      <td className="border-r border-slate-300 p-1.5 align-middle">
                        <input
                          type="text"
                          value={uma1}
                          onChange={(e) => setUma1(formatUMA(e.target.value))}
                          className="w-full text-center bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 uppercase font-bold text-[13px] text-slate-900 transition-all duration-200"
                          placeholder="0XX.XXX.XXX.XXX"
                        />
                      </td>

                      {/* Destino - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="border-r border-slate-300 p-1.5 font-bold uppercase text-[11px] align-middle"
                      >
                        <input
                          type="text"
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 text-xs text-slate-900 transition-all duration-200"
                          placeholder="DESTINO"
                        />
                      </td>

                      {/* Data Enviada - Span rowspan */}
                      <td
                        rowSpan={numCarretas}
                        className="p-1.5 font-bold text-slate-900 text-xs align-middle"
                      >
                        <input
                          type="text"
                          value={dataEnviada}
                          onChange={(e) => setDataEnviada(e.target.value)}
                          className="w-full text-center font-bold bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 text-xs text-slate-900 transition-all duration-200"
                          placeholder="DATA"
                        />
                      </td>
                    </tr>

                    {/* Second row of sub-items (Carreta 2, Isca 2, Prod 2, UMA 2) */}
                    {numCarretas === 2 && (
                      <tr className="border-b border-slate-300 text-center text-xs h-[42px] bg-slate-50">
                        {/* Carreta Row 2 */}
                        <td className="border-r border-slate-300 p-1.5 align-middle">
                          <input
                            type="text"
                            value={carreta2}
                            onChange={(e) => setCarreta2(e.target.value)}
                            className="w-full text-center bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 uppercase font-bold text-xs text-slate-900 transition-all duration-200"
                            placeholder="CARRETA 2"
                          />
                        </td>

                        {/* Isca Row 2 */}
                        <td className="border-r border-slate-300 p-1.5 align-middle">
                          <input
                            type="text"
                            value={isca2}
                            onChange={(e) => handleIsca2Change(e.target.value)}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 uppercase font-black text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-slate-400 font-bold" : "text-red-600"
                            )}
                            placeholder="ISCA 2"
                          />
                        </td>

                        {/* Produto Row 2 */}
                        <td className="border-r border-slate-300 p-1.5 align-middle">
                          <input
                            type="text"
                            value={produto2}
                            onChange={(e) => setProduto2(e.target.value)}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 uppercase font-bold text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-slate-400 font-bold" : "text-slate-900"
                            )}
                            placeholder="PROD 2"
                          />
                        </td>

                        {/* UMA Row 2 */}
                        <td className="border-r border-slate-300 p-1.5 align-middle">
                          <input
                            type="text"
                            value={uma2}
                            onChange={(e) => setUma2(formatUMA(e.target.value))}
                            className={cn(
                              "w-full text-center bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 uppercase font-bold text-[13px] transition-all duration-200",
                              isca2 === "SEM ISCA" ? "text-slate-400 font-bold" : "text-slate-900"
                            )}
                            placeholder="0XX.XXX.XXX.XXX"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* TABLE 2: PARAMETRIZAÇÃO DAS ISCAS */}
                <table className="w-full border-collapse border border-slate-300 text-xs font-sans text-slate-900 table-fixed rounded-lg overflow-hidden shadow-2xs mt-0">
                  <tbody>
                    {/* Header bar */}
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-slate-900 text-center font-extrabold text-white p-2.5 uppercase text-[11px] tracking-wide border-b border-slate-700"
                      >
                        <input
                          type="text"
                          value={parametrizacao}
                          onChange={(e) => setParametrizacao(e.target.value)}
                          className="w-full text-center font-extrabold bg-transparent border-none outline-none hover:bg-white/10 focus:bg-white/20 rounded px-1 py-0.5 text-[11px] uppercase text-white transition-all duration-200"
                        />
                      </td>
                    </tr>
                    {/* Subheaders Row */}
                    <tr className="bg-slate-800 text-center font-extrabold text-white text-[10px] h-[34px] border-b border-slate-700">
                      <td className="border-r border-slate-700 p-1 w-[25%] align-middle text-center">
                        <div className="flex items-center bg-white border border-slate-300 rounded px-2 py-0.5 max-w-[150px] mx-auto shadow-2xs">
                          <input
                            type="text"
                            value={
                              numCarretas === 2 && isca2 !== "SEM ISCA" ? `${isca1} ${isca2}` : isca1
                            }
                            readOnly
                            className="bg-transparent border-none text-slate-900 font-extrabold text-[9px] uppercase p-0 focus:ring-0 w-full text-center outline-none select-all"
                          />
                          <span className="text-slate-400 font-bold text-[8px] cursor-pointer ml-1 select-none">
                            ⇅
                          </span>
                        </div>
                      </td>
                      <td className="border-r border-slate-700 p-1 w-[45%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 ENDEREÇO APROXIMADO DA POSIÇÃO ⇅
                      </td>
                      <td className="border-r border-slate-700 p-1 w-[18%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 DATA POSIÇÃO ⇅
                      </td>
                      <td className="p-1 w-[12%] uppercase tracking-wider text-white text-[10px] align-middle">
                        🔍 BATERIA ISCA_RF ⇅
                      </td>
                    </tr>
                    {/* Row 1 (Isca 2) */}
                    {numCarretas === 2 && (
                      <tr className="bg-slate-50 text-center font-semibold text-slate-900 h-[44px] border-b border-slate-300">
                        <td className="border-r border-slate-300 p-1.5 font-extrabold uppercase text-[11px] text-center bg-slate-50 align-middle text-red-600">
                          {isca2 === "SEM ISCA" ? "" : isca2}
                        </td>
                        <td className="border-r border-slate-300 p-1.5 text-left font-medium text-xs bg-slate-50 align-middle">
                          <textarea
                            value={isca2 === "SEM ISCA" ? "" : isca2Endereco}
                            onChange={(e) => setIsca2Endereco(e.target.value)}
                            disabled={isca2 === "SEM ISCA"}
                            rows={1}
                            className="w-full bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-900 resize-y leading-tight font-bold transition-all duration-200 disabled:opacity-50"
                            placeholder={isca2 === "SEM ISCA" ? "" : "Endereço da Isca 2..."}
                          />
                        </td>
                        <td className="border-r border-slate-300 p-1.5 text-center font-bold text-xs bg-slate-50 align-middle">
                          <input
                            type="text"
                            value={isca2 === "SEM ISCA" ? "" : isca2Data}
                            onChange={(e) => setIsca2Data(e.target.value)}
                            disabled={isca2 === "SEM ISCA"}
                            className="w-full bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1.5 py-0.5 text-xs text-center text-slate-900 font-bold transition-all duration-200 disabled:opacity-50"
                            placeholder={isca2 === "SEM ISCA" ? "" : "Data/Hora..."}
                          />
                        </td>
                        <td className="p-1.5 text-center font-bold text-xs bg-slate-50 align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="text"
                              value={isca2 === "SEM ISCA" ? "" : isca2Bateria}
                              onChange={(e) => setIsca2Bateria(e.target.value)}
                              disabled={isca2 === "SEM ISCA"}
                              className="w-10 bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 text-xs text-right text-slate-900 font-bold transition-all duration-200 disabled:opacity-50"
                              placeholder={isca2 === "SEM ISCA" ? "" : "100%"}
                            />
                            <div className="relative flex items-center">
                              <Battery className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
                              <div 
                                className="absolute left-[3px] top-[6.5px] h-[7px] bg-emerald-500 rounded-[1px]"
                                style={{ width: `${(isca2 === "SEM ISCA" ? 0 : Math.min(100, parseInt(isca2Bateria) || 100)) * 0.11}px` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Row 2 (Isca 1) */}
                    <tr className="bg-white text-center font-semibold text-slate-900 h-[44px] border-b border-slate-300">
                      <td className="border-r border-slate-300 p-1.5 font-extrabold uppercase text-[11px] text-center bg-white align-middle text-red-600">
                        {isca1}
                      </td>
                      <td className="border-r border-slate-300 p-1.5 text-left font-medium text-xs bg-white align-middle">
                        <textarea
                          value={isca1Endereco}
                          onChange={(e) => setIsca1Endereco(e.target.value)}
                          rows={1}
                          className="w-full bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1.5 py-0.5 text-xs text-slate-900 resize-y leading-tight font-bold transition-all duration-200"
                          placeholder="Endereço da Isca 1..."
                        />
                      </td>
                      <td className="border-r border-slate-300 p-1.5 text-center font-bold text-xs bg-white align-middle">
                        <input
                          type="text"
                          value={isca1Data}
                          onChange={(e) => setIsca1Data(e.target.value)}
                          className="w-full bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1.5 py-0.5 text-xs text-center text-slate-900 font-bold transition-all duration-200"
                          placeholder="Data/Hora..."
                        />
                      </td>
                      <td className="p-1.5 text-center font-bold text-xs bg-white align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="text"
                            value={isca1Bateria}
                            onChange={(e) => setIsca1Bateria(e.target.value)}
                            className="w-full bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 text-xs text-right text-slate-900 font-bold transition-all duration-200"
                            placeholder="100%"
                          />
                          <div className="relative flex items-center">
                            <Battery className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
                            <div 
                              className="absolute left-[3px] top-[6.5px] h-[7px] bg-emerald-500 rounded-[1px]"
                              style={{ width: `${Math.min(100, parseInt(isca1Bateria) || 100) * 0.11}px` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 6. INTERACTIVE ESQUEMA DE EMBARQUE (LADDERS) */}
                {!ocultarNotas && (
                  <div className="mt-6 border-t border-slate-300/80 pt-5">
                    <span className="text-[13px] font-extrabold uppercase block mt-[20px] mb-[15px] text-slate-900 font-sans border-b border-slate-200 pb-2">
                      ESQUEMA DE EMBARQUE DAS ISCAS:
                    </span>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-4">
                      {sidebarEmbarque1 || sidebarEmbarque2
                        ? "Imagem do esquema de embarque selecionada! Ela será incluída no e-mail."
                        : 'Clique nas células para marcar/desmarcar a isca ("P"). Esse esquema será copiado visualmente para o e-mail!'}
                    </p>

                    <div className={cn(
                      "flex flex-wrap justify-center items-start max-w-[720px] mx-auto transition-all duration-300",
                      (!sidebarEmbarque1 && !sidebarEmbarque2) ? "gap-[10px]" : "gap-[30px]"
                    )}>
                      {/* Carreta 1 Section */}
                      {sidebarEmbarque1 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque1 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque1 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-white border border-slate-300 p-2.5 text-center shadow-sm w-[320px] h-[420px] flex items-center justify-center box-border rounded-lg">
                                <img
                                  src={sidebarEmbarque1}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white mx-auto block border-0"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-slate-900 uppercase">
                                  CARRETA 1: {carreta1}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-slate-900 text-white font-extrabold text-[8px] uppercase w-[50px] py-[3px] text-center border border-slate-900 tracking-normal rounded-t">
                                  ESCALA 01
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-slate-400 bg-white w-[50px]">
                                  {ladder1.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder1-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder1.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder1(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[12px] border-[0.5px] border-slate-400 font-black text-[8px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? "bg-red-600 text-white"
                                            : "bg-white hover:bg-slate-100 text-slate-900",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[10px]">
                                <span className="text-[11px] font-black text-slate-900 uppercase">
                                  CARRETA 1: {carreta1}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Carreta 2 Section */}
                      {numCarretas === 2 && sidebarEmbarque2 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque2 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque2 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-white border border-slate-300 p-2.5 text-center shadow-sm w-[320px] h-[420px] flex items-center justify-center box-border rounded-lg">
                                <img
                                  src={sidebarEmbarque2}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white mx-auto block border-0"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-slate-900 uppercase">
                                  CARRETA 2: {carreta2}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-slate-900 text-white font-extrabold text-[9px] uppercase w-[75px] py-[5px] text-center border border-slate-900 tracking-normal rounded-t">
                                  ESCALA 02
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-slate-400 bg-white w-[75px]">
                                  {ladder2.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder2-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder2.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder2(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[12px] border-[0.5px] border-slate-400 font-black text-[8px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? "bg-red-600 text-white"
                                            : "bg-white hover:bg-slate-100 text-slate-900",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-slate-900 uppercase">
                                  CARRETA 2: {carreta2}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes additional line (HIDDEN PER USER REQUEST) */}
                <div className="hidden mt-5 max-w-xl mx-auto border-2 border-stone-800 rounded-2xl p-4 bg-[#FFFDFB] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-[#8c6b4e] tracking-wider block">
                      Notas adicionais de embarque:
                    </span>
                    <button
                      type="button"
                      onClick={() => setOcultarNotas(!ocultarNotas)}
                      className={cn(
                        "flex items-center gap-1.5 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-lg border-2 transition-all cursor-pointer select-none active:scale-95",
                        ocultarNotas
                          ? "bg-[#B32025] hover:bg-[#8c060a] text-white border-transparent"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300",
                      )}
                    >
                      {ocultarNotas ? (
                        <>
                          <EyeOff size={11} className="stroke-[3]" /> OCULTO NO
                          E-MAIL
                        </>
                      ) : (
                        <>
                          <Eye size={11} className="stroke-[2.5]" /> OCULTAR NO
                          E-MAIL
                        </>
                      )}
                    </button>
                  </div>

                  {!ocultarNotas ? (
                    <input
                      type="text"
                      value={esquemaEmbarque}
                      onChange={(e) => setEsquemaEmbarque(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-stone-300 focus:border-[#B32025] py-1 text-xs outline-none uppercase font-mono font-bold text-[#3e2516]"
                      placeholder="EX: CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO..."
                    />
                  ) : (
                    <p className="text-[10px] text-stone-500 font-semibold italic">
                      O esquema e as notas de embarque estão ocultos e não serão
                      incluídos no e-mail copiado.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action helper card inside main container */}
            <div className="bg-[#FAF6ED] border border-[#e1ccb0] rounded-2xl p-4 flex gap-3 items-start mt-2">
              <Info className="text-[#B32025] shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#5c3e29] uppercase tracking-wide">
                  Dica do Gerador
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  Você pode clicar diretamente nos campos da tabela acima para
                  preenchê-los manualmente de forma ágil, ou utilizar a coluna
                  de preenchimento rápido ao lado para carregar dados
                  corporativos específicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SIDEBAR: Fast Fill Column (fixed width) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden flex flex-col p-5 sm:p-6">
          {/* Form Header */}
          <div className="border-b border-slate-200 pb-4 mb-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
              Painel Lateral
            </span>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-sans font-extrabold text-slate-900 uppercase tracking-tight mt-0.5 flex items-center gap-2">
                <Sliders size={18} className="text-red-600" /> Formulário de Controle
              </h3>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Limpar formulário"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {/* ORIGEM (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <MapPin size={12} className="text-slate-500" /> ORIGEM
              </label>
              <select
                value={origem}
                onChange={(e) => {
                  const newOrigem = e.target.value;
                  setOrigem(newOrigem);
                  if (rota1) {
                    if (rota1.includes(" x ")) {
                      const parts = rota1.split(/\s*x\s*/i);
                      const firstPart = parts[0];
                      const prefixMatch = firstPart.match(/^(\s*·?\s*)/);
                      const prefix = prefixMatch ? prefixMatch[1] : "";
                      const restOfRoute = parts.slice(1).join(" x ");
                      setRota1(`${prefix}${newOrigem} x ${restOfRoute}`);
                    }
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                {ORIGEM_OPCOES.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="text-slate-900 uppercase text-xs font-bold"
                  >
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECIONAR ROTA (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <MapPin size={12} className="text-slate-500" /> SELECIONAR ROTA (DESTINO)
              </label>

              {/* Search input for filtering */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={12} className="text-slate-400" />
                </span>
                <input
                  type="text"
                  value={searchRota}
                  onChange={(e) => setSearchRota(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-bold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs placeholder:text-slate-400"
                  placeholder="PESQUISAR ROTA..."
                />
                {searchRota && (
                  <button
                    type="button"
                    onClick={() => setSearchRota("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[10px] font-black text-red-600 hover:text-red-700 uppercase cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <select
                value={rota1}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setRota1(val);
                    const parts = val.split(/\s*x\s*/i);
                    const lastPart = parts[parts.length - 1]?.trim();
                    if (lastPart) {
                      setDestino(lastPart);
                    }
                  } else {
                    setRota1("");
                    setDestino("");
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">
                  {searchRota
                    ? "RESULTADOS DA BUSCA..."
                    : "SELECIONE A ROTA..."}
                </option>
                {DESTINOS_OPCOES.filter((dest) =>
                  dest.toLowerCase().includes(searchRota.toLowerCase()),
                ).map((dest) => {
                  const displayDest = dest.replace(/^SANTA LUZIA\/MG/i, origem);
                  return (
                    <option
                      key={dest}
                      value={displayDest}
                      className="text-slate-900 uppercase text-xs font-bold"
                    >
                      {displayDest.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* TRANSPORTADORA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Truck size={12} className="text-slate-500" /> TRANSPORTADORA
              </label>
              <select
                value={sidebarTransportadora}
                onChange={(e) => handleSidebarTranspChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs cursor-pointer"
              >
                <option value="">SELECIONE...</option>
                {allTransportadoras.map((t) => (
                  <option
                    key={t}
                    value={t}
                    className="text-slate-900 uppercase text-xs font-bold"
                  >
                    {t}
                  </option>
                ))}
              </select>

              {!isAddingTransp ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTransp(true)}
                  className="self-start text-[10px] font-extrabold text-red-600 hover:text-red-700 flex items-center gap-1 mt-0.5 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Plus size={12} /> Adicionar Transportadora
                </button>
              ) : (
                <div className="flex flex-col gap-1.5 p-2 bg-slate-100 rounded-lg border border-slate-200 mt-0.5 shadow-2xs">
                  <input
                    type="text"
                    placeholder="NOME DA TRANSPORTADORA"
                    value={newTranspName}
                    onChange={(e) => setNewTranspName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTransp();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTransp(false);
                        setNewTranspName("");
                      }}
                      className="px-2 py-0.5 text-[10px] font-extrabold text-slate-600 hover:bg-slate-200 rounded uppercase transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomTransp}
                      className="px-2.5 py-0.5 text-[10px] font-extrabold text-white bg-red-600 hover:bg-red-700 rounded uppercase shadow-2xs transition-colors cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLAR DA PLANILHA (PARAMETRIZAÇÃO) textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <FileText size={12} className="text-slate-500" /> COLAR DA PLANILHA (PARAMETRIZAÇÃO)
              </label>
              <textarea
                value={pastePlanilha}
                onChange={(e) => handlePastePlanilhaChange(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs resize-none placeholder:text-slate-400"
                placeholder="Cole as linhas da planilha de iscas aqui..."
              />
            </div>

            {/* NOME MOTORISTA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <User size={12} className="text-slate-500" /> NOME MOTORISTA
              </label>
              <input
                type="text"
                value={sidebarMotorista}
                onChange={(e) => handleSidebarMotoristaChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs"
                placeholder="NOME COMPLETO"
              />
            </div>

            {/* PREFIXOS & BATERIA ISCAS */}
            <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                <Sliders size={12} className="text-slate-500" /> N° ISCAS (PREFIXOS & BATERIA)
              </label>

              <div className="flex flex-col gap-3">
                {/* ISCA 1 SECTION */}
                <div className="border-b border-slate-200 pb-2.5">
                  <span className="text-[9px] font-extrabold uppercase text-red-600 block mb-1">
                    DISPOSITIVO ISCA 1:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                        PREFIXO:
                      </span>
                      <select
                        value={iscaPrefix1}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setIscaPrefix1(newPrefix);
                          setIsca1(newPrefix + iscaSuffix1);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-1 py-1 text-[10px] font-extrabold text-slate-900 focus:border-red-600 outline-none cursor-pointer transition-all"
                      >
                        <option value="R100000">R100000</option>
                        <option value="R10000">R10000</option>
                        <option value="30D10000">30D10000</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                        RESTO:
                      </span>
                      <input
                        type="text"
                        value={iscaSuffix1}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setIscaSuffix1(val);
                          setIsca1(iscaPrefix1 + val);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-black text-slate-900 uppercase focus:border-red-600 outline-none transition-all"
                        placeholder="RESTO..."
                      />
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                        BATERIA:
                      </span>
                      <input
                        type="text"
                        value={isca1Bateria}
                        onChange={(e) => setIsca1Bateria(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-extrabold text-slate-900 focus:border-red-600 outline-none transition-all"
                        placeholder="100%"
                      />
                    </div>
                  </div>
                </div>

                {/* ISCA 2 SECTION */}
                {numCarretas === 2 && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-red-600 block mb-1">
                      DISPOSITIVO ISCA 2:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                          PREFIXO:
                        </span>
                        <select
                          value={iscaPrefix2}
                          onChange={(e) => {
                            const newPrefix = e.target.value;
                            setIscaPrefix2(newPrefix);
                            setIsca2(newPrefix + iscaSuffix2);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-md px-1 py-1 text-[10px] font-extrabold text-slate-900 focus:border-red-600 outline-none cursor-pointer transition-all"
                        >
                          <option value="R100000">R100000</option>
                          <option value="R10000">R10000</option>
                          <option value="30D10000">30D10000</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                          RESTO:
                        </span>
                        <input
                          type="text"
                          value={iscaSuffix2}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setIscaSuffix2(val);
                            setIsca2(iscaPrefix2 + val);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-black text-slate-900 uppercase focus:border-red-600 outline-none transition-all"
                          placeholder="RESTO..."
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-500 block mb-0.5">
                          BATERIA:
                        </span>
                        <input
                          type="text"
                          value={isca2Bateria}
                          onChange={(e) => setIsca2Bateria(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-extrabold text-slate-900 focus:border-red-600 outline-none transition-all"
                          placeholder="100%"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* EMBARQUE SECTIONS */}
            <div className="flex flex-col gap-4">
              {/* CARRETA 1 EMBARQUE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Image size={12} className="text-slate-500" /> EMBARQUE (CARRETA 1: {carreta1})
                </label>
                <select
                  value={sidebarEmbarque1}
                  onChange={(e) => setSidebarEmbarque1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none cursor-pointer transition-all shadow-2xs"
                >
                  {EMBARQUE_IMAGES.map((img) => (
                    <option
                      key={img.value}
                      value={img.value}
                      className="font-sans"
                    >
                      {img.label.toUpperCase()}
                    </option>
                  ))}
                </select>

                {sidebarEmbarque1 && (
                  <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-2xs">
                    <img
                      src={sidebarEmbarque1}
                      alt="Preview 1"
                      referrerPolicy="no-referrer"
                      className="max-h-[70px] object-contain rounded border border-slate-300 bg-white"
                    />
                    <span className="text-[9px] font-extrabold text-slate-900 mt-1.5 uppercase">
                      CARRETA 1: {carreta1 || "NÃO INFORMADA"}
                    </span>
                  </div>
                )}
              </div>

              {/* CARRETA 2 EMBARQUE */}
              {numCarretas === 2 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Image size={12} className="text-slate-500" /> EMBARQUE (CARRETA 2: {carreta2})
                  </label>
                  <select
                    value={sidebarEmbarque2}
                    onChange={(e) => setSidebarEmbarque2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none cursor-pointer transition-all shadow-2xs"
                  >
                    {EMBARQUE_IMAGES.map((img) => (
                      <option
                        key={img.value}
                        value={img.value}
                        className="font-sans"
                      >
                        {img.label.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {sidebarEmbarque2 && (
                    <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-2xs">
                      <img
                        src={sidebarEmbarque2}
                        alt="Preview 2"
                        referrerPolicy="no-referrer"
                        className="max-h-[70px] object-contain rounded border border-slate-300 bg-white"
                      />
                      <span className="text-[9px] font-extrabold text-slate-900 mt-1.5 uppercase">
                        CARRETA 2: {carreta2 || "NÃO INFORMADA"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons area */}
            <div className="flex flex-col gap-3 mt-2">
              {/* COPIAR PARA EMAIL BUTTON */}
              <button
                onClick={handleCopyToEmail}
                className={cn(
                  "w-full text-white text-[11px] font-extrabold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer border border-transparent",
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20",
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

              {/* LIMPAR INFORMAÇÕES BUTTON */}
              <button
                onClick={handleClear}
                className="w-full bg-slate-800 hover:bg-slate-900 text-slate-200 text-[11px] font-extrabold uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-98 cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" /> LIMPAR INFORMAÇÕES
              </button>
            </div>

            {/* DICA DE GESTÃO CARD */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 shadow-sm mt-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-400 block mb-1">
                Dica de Gestão PGR
              </span>
              <p className="text-[10px] font-medium text-slate-300 leading-relaxed">
                Verifique os dados cuidadosamente antes de enviar. O pré-alerta
                gerado deve estar 100% de acordo com a nota fiscal e a ordem de
                coleta de iscas do pátio para mitigar sinistros.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Vehicle & Cargo Column (fixed width) */}
      <div className="col-span-1 xl:col-span-1 flex flex-col">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden flex flex-col p-5 sm:p-6">
          {/* Form Header */}
          <div className="border-b border-slate-200 pb-4 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                Painel de Viagem
              </span>
              <h3 className="text-base font-sans font-extrabold text-slate-900 uppercase tracking-tight mt-0.5 flex items-center gap-2">
                <Truck size={18} className="text-red-600" /> Veículo & Carga
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClearVeiculo}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Limpar formulário de Veículo & Carga"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {/* CAVALO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Truck size={12} className="text-slate-500" /> Placa do Cavalo
              </label>
              <input
                type="text"
                value={cavalo}
                onChange={(e) => setCavalo(e.target.value.replace(/-/g, "").toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-extrabold uppercase text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 hover:bg-white outline-none transition-all shadow-2xs"
                placeholder="PLACA DO CAVALO"
              />
            </div>

            {/* CARRETA 1 GROUP */}
            <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Truck size={10} className="text-slate-500" /> Carreta 1
                  </label>
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                    placeholder="CARRETA 1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Package size={10} className="text-slate-500" /> Produto 1
                  </label>
                  <input
                    type="text"
                    value={produto1}
                    onChange={(e) => setProduto1(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                    placeholder="PRODUTO 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Hash size={10} className="text-slate-500" /> U.M.A. 1
                  </label>
                  <input
                    type="text"
                    value={uma1}
                    onChange={(e) => setUma1(formatUMA(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                    placeholder="0XX.XXX.XXX.XXX"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <FileText size={10} className="text-slate-500" /> NF Início
                  </label>
                  <input
                    type="text"
                    value={nfInicio}
                    onChange={(e) => setNfInicio(e.target.value.replace(/-/g, "").toUpperCase())}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                    placeholder="INÍCIO"
                  />
                </div>
              </div>
            </div>

            {/* CARRETA 2 GROUP */}
            {numCarretas === 2 && (
              <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <Truck size={10} className="text-slate-500" /> Carreta 2
                    </label>
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                      placeholder="CARRETA 2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <Package size={10} className="text-slate-500" /> Produto 2
                    </label>
                    <input
                      type="text"
                      value={produto2}
                      onChange={(e) => setProduto2(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                      placeholder="PRODUTO 2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={isca2 === "SEM ISCA" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                      <Hash size={10} className="text-slate-500" /> U.M.A. 2
                    </label>
                    <input
                      type="text"
                      value={uma2}
                      onChange={(e) => setUma2(formatUMA(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                      placeholder="0XX.XXX.XXX.XXX"
                    />
                  </div>
                  {isca2 !== "SEM ISCA" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <FileText size={10} className="text-slate-500" /> NF Fim
                      </label>
                      <input
                        type="text"
                        value={nfFim}
                        onChange={(e) => setNfFim(e.target.value.replace(/-/g, "").toUpperCase())}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-slate-900 focus:border-red-600 outline-none transition-all shadow-2xs"
                        placeholder="FIM"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* SEÇÃO DE CÓPIA PARA PLANILHA GOOGLE (LINHAS DE ISCA) */}
      <div className="w-full mt-8 bg-[#1e293b]/95 border-2 border-[#334155] rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-7">
        {/* Header banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg border border-emerald-400/40 shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  Planilha Google / Excel
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white uppercase tracking-tight mt-1">
                Copiar Linhas de Iscas para Planilha Google
              </h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Copie cada linha individualmente ou a tabela completa para colar no Google Sheets (Ctrl+V)
              </p>
            </div>
          </div>

          {/* Batch Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => copyAllIscaRowsToClipboard(false)}
              className={cn(
                "px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg border flex items-center gap-2 transition-all cursor-pointer active:scale-98",
                copiedIscaDataOnly
                  ? "bg-emerald-500 text-slate-950 border-emerald-300"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40"
              )}
              title="Copiar todas as linhas tabuladas para colar no Google Sheets (Ctrl+V)"
            >
              {copiedIscaDataOnly ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedIscaDataOnly ? "Copiado para Planilha!" : "Copiar Apenas Dados (Ctrl+V)"}</span>
            </button>

            <button
              type="button"
              onClick={() => copyAllIscaRowsToClipboard(true)}
              className={cn(
                "px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg border flex items-center gap-2 transition-all cursor-pointer active:scale-98",
                copiedIscaAll
                  ? "bg-emerald-500 text-slate-950 border-emerald-300"
                  : "bg-teal-700 hover:bg-teal-600 text-white border-teal-400/40"
              )}
              title="Copiar cabeçalho + linhas de iscas no formato Google Sheets"
            >
              {copiedIscaAll ? <Check size={16} /> : <FileSpreadsheet size={16} />}
              <span>{copiedIscaAll ? "Tabela Copiada!" : "Copiar com Cabeçalho"}</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Mock Preview Table matching attached image */}
        <div className="mt-5 w-full rounded-2xl border-2 border-emerald-800/60 overflow-x-auto shadow-xl bg-[#0b2829]">
          <div className="min-w-[1000px]">
            {/* Column Letters Bar A-H */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#071c1d] border-b border-emerald-800/80 text-[10px] font-black text-emerald-300 text-center py-1 divide-x divide-emerald-800/50">
              <div>A</div>
              <div>B</div>
              <div>C</div>
              <div>D</div>
              <div>E</div>
              <div>F</div>
              <div>G</div>
              <div>H</div>
              <div>AÇÃO</div>
            </div>

            {/* Header Row (Dark Teal with white uppercase text like attached image) */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#0b3c3d] text-white text-[11px] font-black uppercase py-2.5 divide-x divide-emerald-800/80 border-b border-emerald-700/80 items-center">
              <div className="px-2 text-center">ID ISCA</div>
              <div className="px-2 text-center">DESTINO</div>
              <div className="px-2 text-center">STATUS</div>
              <div className="px-2 text-center">OBS 1</div>
              <div className="px-2 text-center">DATA STATUS</div>
              <div className="px-2 text-center">CARRETA</div>
              <div className="px-2 text-center">CAVALO</div>
              <div className="px-2 text-center">MOTORISTA</div>
              <div className="px-2 text-center">AÇÃO</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-slate-300 bg-stone-100 text-slate-900 font-sans">
              {/* Row 1 (Isca 1) */}
              <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] divide-x divide-slate-300 items-center hover:bg-emerald-50 transition-colors">
                {/* ID ISCA */}
                <div className="p-2 font-black text-xs text-slate-900 text-center">
                  <input
                    type="text"
                    value={isca1}
                    onChange={(e) => handleIsca1Change(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="R100000..."
                  />
                </div>

                {/* DESTINO */}
                <div className="p-2 font-black text-xs text-slate-900 text-center uppercase relative flex items-center justify-center">
                  <select
                    value={cleanDestinoForPlanilha(destino)}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-2 py-0.5 border border-transparent focus:border-emerald-500 cursor-pointer appearance-none pr-4"
                  >
                    <option value="" disabled className="text-slate-400 font-bold">SELECIONE</option>
                    {cleanDestinoForPlanilha(destino) && !DESTINOS_PLANILHA_ISCAS.includes(cleanDestinoForPlanilha(destino)) && (
                      <option value={cleanDestinoForPlanilha(destino)} className="text-slate-900 font-black">{cleanDestinoForPlanilha(destino)}</option>
                    )}
                    {DESTINOS_PLANILHA_ISCAS.map((dest) => (
                      <option key={dest} value={dest} className="text-slate-900 font-black">
                        {dest}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-600 text-[9px]">▼</span>
                </div>

                {/* STATUS */}
                <div className="p-2 text-center font-black text-xs uppercase">
                  <input
                    type="text"
                    value={statusIsca1}
                    onChange={(e) => setStatusIsca1(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="EM ROTA(IDA)"
                  />
                </div>

                {/* OBS 1 */}
                <div className="p-2 text-center font-black text-xs uppercase">
                  <input
                    type="text"
                    value={obs1Isca1}
                    onChange={(e) => setObs1Isca1(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="PRÉ ALERTA OK"
                  />
                </div>

                {/* DATA STATUS */}
                <div className="p-2 text-center font-bold text-xs text-slate-900">
                  <input
                    type="text"
                    value={dataStatusIsca1}
                    onChange={(e) => setDataStatusIsca1(e.target.value)}
                    className="w-full text-center bg-transparent font-bold text-xs text-slate-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="28.jul."
                  />
                </div>

                {/* CARRETA */}
                <div className="p-2 text-center font-black text-xs text-slate-900 uppercase">
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="CARRETA 1"
                  />
                </div>

                {/* CAVALO */}
                <div className="p-2 text-center font-black text-xs text-slate-900 uppercase">
                  <input
                    type="text"
                    value={cavalo}
                    onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                    className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="CAVALO"
                  />
                </div>

                {/* MOTORISTA */}
                <div className="p-2 font-black text-xs text-slate-900 uppercase">
                  <input
                    type="text"
                    value={motorista || sidebarMotorista}
                    onChange={(e) => handleTableMotoristaChange(e.target.value)}
                    className="w-full bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="NOME MOTORISTA"
                  />
                </div>

                {/* AÇÃO (COPIAR LINHA 1) */}
                <div className="p-1.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => copyIscaRowToClipboard(getIscaRows()[0], false, false)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border flex items-center gap-1 transition-all cursor-pointer active:scale-95",
                      copiedIscaRow1
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500/40"
                    )}
                    title="Copiar esta linha para colar no Google Sheets (Ctrl+V)"
                  >
                    {copiedIscaRow1 ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedIscaRow1 ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Row 2 (Isca 2, if 2 carretas and isca2 is set and not "SEM ISCA") */}
              {numCarretas === 2 && isca2 && isca2 !== "SEM ISCA" && (
                <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] divide-x divide-slate-300 items-center hover:bg-emerald-50 transition-colors">
                  {/* ID ISCA */}
                  <div className="p-2 font-black text-xs text-slate-900 text-center">
                    <input
                      type="text"
                      value={isca2}
                      onChange={(e) => handleIsca2Change(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="R100000..."
                    />
                  </div>

                  {/* DESTINO */}
                  <div className="p-2 font-black text-xs text-slate-900 text-center uppercase relative flex items-center justify-center">
                    <select
                      value={cleanDestinoForPlanilha(destino)}
                      onChange={(e) => setDestino(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-2 py-0.5 border border-transparent focus:border-emerald-500 cursor-pointer appearance-none pr-4"
                    >
                      <option value="" disabled className="text-slate-400 font-bold">SELECIONE</option>
                      {cleanDestinoForPlanilha(destino) && !DESTINOS_PLANILHA_ISCAS.includes(cleanDestinoForPlanilha(destino)) && (
                        <option value={cleanDestinoForPlanilha(destino)} className="text-slate-900 font-black">{cleanDestinoForPlanilha(destino)}</option>
                      )}
                      {DESTINOS_PLANILHA_ISCAS.map((dest) => (
                        <option key={dest} value={dest} className="text-slate-900 font-black">
                          {dest}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-600 text-[9px]">▼</span>
                  </div>

                  {/* STATUS */}
                  <div className="p-2 text-center font-black text-xs uppercase">
                    <input
                      type="text"
                      value={statusIsca2}
                      onChange={(e) => setStatusIsca2(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="EM ROTA(IDA)"
                    />
                  </div>

                  {/* OBS 1 */}
                  <div className="p-2 text-center font-black text-xs uppercase">
                    <input
                      type="text"
                      value={obs1Isca2}
                      onChange={(e) => setObs1Isca2(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="PRÉ ALERTA OK"
                    />
                  </div>

                  {/* DATA STATUS */}
                  <div className="p-2 text-center font-bold text-xs text-slate-900">
                    <input
                      type="text"
                      value={dataStatusIsca2}
                      onChange={(e) => setDataStatusIsca2(e.target.value)}
                      className="w-full text-center bg-transparent font-bold text-xs text-slate-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="28.jul."
                    />
                  </div>

                  {/* CARRETA */}
                  <div className="p-2 text-center font-black text-xs text-slate-900 uppercase">
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="CARRETA 2"
                    />
                  </div>

                  {/* CAVALO */}
                  <div className="p-2 text-center font-black text-xs text-slate-900 uppercase">
                    <input
                      type="text"
                      value={cavalo}
                      onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                      className="w-full text-center bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="CAVALO"
                    />
                  </div>

                  {/* MOTORISTA */}
                  <div className="p-2 font-black text-xs text-slate-900 uppercase">
                    <input
                      type="text"
                      value={motorista || sidebarMotorista}
                      onChange={(e) => handleTableMotoristaChange(e.target.value)}
                      className="w-full bg-transparent font-black text-xs text-slate-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="NOME MOTORISTA"
                    />
                  </div>

                  {/* AÇÃO (COPIAR LINHA 2) */}
                  <div className="p-1.5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const rows = getIscaRows();
                        if (rows.length > 1) {
                          copyIscaRowToClipboard(rows[1], false, true);
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border flex items-center gap-1 transition-all cursor-pointer active:scale-95",
                        copiedIscaRow2
                          ? "bg-emerald-600 text-white border-emerald-400"
                          : "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500/40"
                      )}
                      title="Copiar esta linha para colar no Google Sheets (Ctrl+V)"
                    >
                      {copiedIscaRow2 ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIscaRow2 ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
