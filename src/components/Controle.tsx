import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Copy,
  Check,
  ArrowRight,
  User,
  Sliders,
  FileText,
  Truck,
  Cpu,
  MapPin,
  Search,
  DollarSign,
  Radio,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Navigation,
  Compass,
  RotateCcw,
  Sparkles,
  ClipboardPaste,
  Layers,
  Calendar,
  Clock,
  BatteryCharging
} from "lucide-react";
import { cn } from "../lib/utils";

export const EMBARQUE_IMAGES = [
  { value: "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF", label: "Paletizado (Padrão)" },
  { value: "https://lh3.googleusercontent.com/d/1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH", label: "Carga Batida (Padrão)" },
  { value: "https://lh3.googleusercontent.com/d/1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf", label: "AMARELIN" },
  { value: "https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh", label: "SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX", label: "CASTANHA" },
  { value: "https://lh3.googleusercontent.com/d/1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ", label: "IZOTONICO" },
  { value: "https://lh3.googleusercontent.com/d/1EQ5fMDDHViGvBd8-ehlwhyE4yyOc_peH", label: "ALMOFADA" },
  { value: "https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV", label: "LADO DIREITO SUPERIOR BATIDO (PORTA)" },
  { value: "https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS", label: "LADO ESQUERDO SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI", label: "LADO DIREITO SUPERIOR - BATIDO/PALETIZADO" },
  { value: "https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1", label: "LADO ESQUERDO SUPERIOR - BATIDO/PALETIZADO" },
  { value: "none", label: "Nenhum Embarque" },
];

export const getLocalFallbackImg = (url: string) => {
  if (!url || url === "none") return "";
  if (url.includes("1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF")) return "/images/img_0.png";
  if (url.includes("1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH")) return "/images/img_1.png";
  if (url.includes("1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf")) return "/images/img_2.png";
  if (url.includes("17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh")) return "/images/img_3.png";
  if (url.includes("1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX")) return "/images/img_4.png";
  if (url.includes("1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ")) return "/images/img_5.png";
  if (url.includes("1EQ5fMDDHViGvBd8-ehlwhyE4yyOc_peH")) return "/images/img_6.png";
  if (url.includes("1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV")) return "/images/img_7.png";
  if (url.includes("14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS")) return "/images/img_8.png";
  return url;
};

export const TRANSPORTADORAS = [
  "Frota 3C",
  "apk",
  "tomasi",
  "moedense",
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

export const DESTINOS_OPCOES = [
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

export const ORIGEM_OPCOES = [
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

export const cleanDestinoForPlanilha = (raw: string): string => {
  if (!raw) return "";
  const upper = raw.toUpperCase().trim();
  if (DESTINOS_PLANILHA_ISCAS.includes(upper)) return upper;
  let clean = upper.replace(/^SANTA\s+LUZIA(?:\/MG)?\s*X\s*/i, "").trim();
  if (DESTINOS_PLANILHA_ISCAS.includes(clean)) return clean;
  if (clean.includes("PINHAIS")) return "CURITIBA";
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

export interface ParsedPlacaItem {
  id: string;
  transportador: string;
  condutor: string;
  cavalo: string;
  carreta1: string;
  carreta2: string;
  destino: string;
  origem?: string;
  modeloCarreta?: string;
  modeloCavalo?: string;
  nf?: string;
  valorNf?: string;
  tecnologia?: string;
  data?: string;
  status?: string;
  cpf?: string;
  telefone?: string;
  rawRowsCount: number;
}

export function parsePlacasData(text: string): ParsedPlacaItem[] {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split("\n");
  if (lines.length === 0) return [];
  const results: ParsedPlacaItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const parts = rawLine.split("\t").map((p) => p.trim());
    if (parts.length < 3) continue;

    // Check if header line
    if (parts.some((p) => p.toUpperCase().includes("TRANSP") || p.toUpperCase().includes("CONDUTOR") || p.toUpperCase().includes("CAVALO"))) {
      continue;
    }

    const item: ParsedPlacaItem = {
      id: `placa-${i}-${Date.now()}`,
      transportador: parts[11] || parts[1] || "",
      condutor: parts[19] || parts[2] || "",
      cavalo: (parts[12] || parts[3] || "").replace(/-/g, "").toUpperCase(),
      carreta1: parts[13] || parts[4] || "",
      carreta2: parts[14] || "",
      destino: parts[10] || parts[6] || "",
      origem: parts[1] || "SANTA LUZIA/MG",
      nf: parts[16] || "",
      valorNf: parts[24] || "",
      tecnologia: parts[18] || "SASCAR",
      cpf: parts[20] || "",
      telefone: parts[23] || "",
      rawRowsCount: 1,
    };

    if (item.cavalo || item.condutor) {
      results.push(item);
    }
  }

  return results;
}

export function parseUnidadesText(text: string) {
  if (!text || !text.trim()) {
    return {
      unidade: "",
      transp: "",
      condutor: "",
      cavalo: "",
      carretas: [] as { carreta: string; isca: string; produto: string; uma: string; nf?: string }[],
    };
  }

  const lines = text.split("\n");
  let unidade = "";
  let transp = "";
  let condutor = "";
  let cavalo = "";
  const carretas: { carreta: string; isca: string; produto: string; uma: string; nf?: string }[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const upper = line.toUpperCase();

    if (upper.includes("UNIDADE:")) {
      unidade = line.split(/UNIDADE:/i)[1]?.trim() || "";
    } else if (upper.includes("TRANSPORTADOR:") || upper.includes("EMPRESA:")) {
      transp = line.split(/TRANSPORTADOR:|EMPRESA:/i)[1]?.trim() || "";
    } else if (upper.includes("MOTORISTA:") || upper.includes("CONDUTOR:")) {
      condutor = line.split(/MOTORISTA:|CONDUTOR:/i)[1]?.trim() || "";
    } else if (upper.includes("CAVALO:") || upper.includes("PLACA:")) {
      cavalo = line.split(/CAVALO:|PLACA:/i)[1]?.trim().replace(/-/g, "").toUpperCase() || "";
    } else if (upper.includes("CARRETA") || /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}/.test(upper)) {
      const parts = line.split(/[\t|;,]/).map((p) => p.trim());
      if (parts.length >= 2) {
        carretas.push({
          carreta: parts[0] || "",
          isca: parts[1] || "",
          produto: parts[2] || "",
          uma: parts[3] || "",
          nf: parts[4] || "",
        });
      }
    }
  }

  return { unidade, transp, condutor, cavalo, carretas };
}

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  const [activeTab, setActiveTab] = useState<"gerador" | "placas" | "unidades">("gerador");

  // Form State
  const [numCarretas, setNumCarretas] = useState<1 | 2>(2);
  const [origem, setOrigem] = useState("SANTA LUZIA/MG");
  const [destino, setDestino] = useState("GUARULHOS/SP");
  const [transportadora, setTransportadora] = useState("Frota 3C");
  const [tecnologia, setTecnologia] = useState("SASCAR");
  const [motorista, setMotorista] = useState("DAMIÃO GALVÃO ALVES");
  const [cavalo, setCavalo] = useState("SFD3J76");
  const [carreta1, setCarreta1] = useState("EKP0L77");
  const [carreta2, setCarreta2] = useState("SEB8F09");
  const [isca1, setIsca1] = useState("R10000913");
  const [isca2, setIsca2] = useState("R10000639");
  const [produto1, setProduto1] = useState("12211016");
  const [produto2, setProduto2] = useState("12211016");
  const [uma1, setUma1] = useState("031.025.114.090");
  const [uma2, setUma2] = useState("031.025.114.091");
  const [nfInicio, setNfInicio] = useState("44271");
  const [nfFim, setNfFim] = useState("44272");
  const [valorCarga, setValorCarga] = useState("R$ 176.627,35");
  const [alertaResgate, setAlertaResgate] = useState("FAVOR SE ATENTAR AO RESGATE!");
  const [infoAbaixo, setInfoAbaixo] = useState("Atentar às informações abaixo:");
  const [rota1, setRota1] = useState("SANTA LUZIA/MG x GUARULHOS/SP");
  const [instrucao1, setInstrucao1] = useState("Favor, acusar o recebimento do pré-alerta;");
  const [saudacao, setSaudacao] = useState("Boa tarde,");
  const [dataEnviada, setDataEnviada] = useState("");
  const [esquemaEmbarque, setEsquemaEmbarque] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [esquemaEmbarque2, setEsquemaEmbarque2] = useState("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
  const [isca1Endereco, setIsca1Endereco] = useState("PÁTIO SANTA LUZIA - DOCA 04");
  const [isca2Endereco, setIsca2Endereco] = useState("PÁTIO SANTA LUZIA - DOCA 05");
  const [isca1Data, setIsca1Data] = useState("");
  const [isca2Data, setIsca2Data] = useState("");
  const [isca1Bateria, setIsca1Bateria] = useState("100%");
  const [isca2Bateria, setIsca2Bateria] = useState("100%");
  const [ocultarNotas, setOcultarNotas] = useState(false);

  // Copy Feedback
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAssunto, setCopiedAssunto] = useState(false);

  // Placas Sheet State
  const [placasPastedData, setPlacasPastedData] = useState("");
  const [placasSearch, setPlacasSearch] = useState("");
  const parsedPlacas = useMemo(() => parsePlacasData(placasPastedData), [placasPastedData]);
  const filteredPlacas = useMemo(() => {
    if (!placasSearch.trim()) return parsedPlacas;
    const q = placasSearch.toLowerCase();
    return parsedPlacas.filter(
      (p) =>
        p.cavalo.toLowerCase().includes(q) ||
        p.condutor.toLowerCase().includes(q) ||
        p.destino.toLowerCase().includes(q) ||
        p.transportador.toLowerCase().includes(q)
    );
  }, [parsedPlacas, placasSearch]);

  // Unidades State
  const [unidadesPastedText, setUnidadesPastedText] = useState("");
  const parsedUnidades = useMemo(() => parseUnidadesText(unidadesPastedText), [unidadesPastedText]);

  // Set default dates
  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    const dStr = `${day}-${months[now.getMonth()]}`;
    setDataEnviada(dStr);
    const nowTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setIsca1Data(`${dStr} ${nowTime}`);
    setIsca2Data(`${dStr} ${nowTime}`);
  }, []);

  const handleClear = () => {
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
    setNfInicio("");
    setNfFim("");
    setValorCarga("");
  };

  const handleCopySubject = async () => {
    const isDefaultOrigem = origem === "SANTA LUZIA/MG";
    const subjectPrefix = isDefaultOrigem ? "" : `${origem.toUpperCase()} X `;
    const subject = `PRÉ-ALERTA DE ISCA - ${subjectPrefix}${(destino || "GUARULHOS/SP").toUpperCase()} - ${(cavalo.replace(/-/g, "") || "TYQ6F51").toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedAssunto(true);
      setTimeout(() => setCopiedAssunto(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyEmail = async () => {
    const isDefaultOrigem = origem === "SANTA LUZIA/MG";
    const subjectPrefix = isDefaultOrigem ? "" : `${origem.toUpperCase()} X `;
    const subject = `PRÉ-ALERTA DE ISCA - ${subjectPrefix}${(destino || "GUARULHOS/SP").toUpperCase()} - ${(cavalo.replace(/-/g, "") || "TYQ6F51").toUpperCase()}`;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${origem} x ${destino};
· ${instrucao1}

---------------------------------------------------------------------------------
NÚMERO DA NF: ${[nfInicio, numCarretas === 2 ? nfFim : ""].filter(Boolean).join(" ")} | TRANSPORTADORA: ${transportadora}${valorCarga ? ` | VALOR: ${valorCarga}` : ""}
MOTORISTA: ${motorista}
CAVALO: ${cavalo}
DESTINO: ${destino}
DATA: ${dataEnviada}
---------------------------------------------------------------------------------
1. CARRETA: ${carreta1} | ISCA: ${isca1} | PROD: ${produto1} | UMA: ${uma1}
${numCarretas === 2 ? `2. CARRETA: ${carreta2} | ISCA: ${isca2} | PROD: ${produto2} | UMA: ${uma2}` : ""}
---------------------------------------------------------------------------------
    `.trim();

    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportPlaca = (item: ParsedPlacaItem) => {
    if (item.condutor) setMotorista(item.condutor);
    if (item.cavalo) setCavalo(item.cavalo);
    if (item.carreta1) setCarreta1(item.carreta1);
    if (item.carreta2) {
      setCarreta2(item.carreta2);
      setNumCarretas(2);
    } else {
      setNumCarretas(1);
    }
    if (item.transportador) setTransportadora(item.transportador);
    if (item.destino) {
      setDestino(item.destino);
      setRota1(`${origem} x ${item.destino}`);
    }
    if (item.nf) setNfInicio(item.nf);
    if (item.valorNf) setValorCarga(item.valorNf);
    setActiveTab("gerador");
  };

  return (
    <div className="w-full h-full flex flex-col font-sans select-none bg-[#faf7f2] text-stone-900 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE SLIM HEADER & TAB NAVIGATION BAR                             */}
      {/* ========================================================================= */}
      <div className="px-5 py-3 bg-[#fdfbf7] border-b border-[#ded5c6] flex items-center justify-between shrink-0 shadow-2xs">
        
        {/* Left Title & Breadcrumb */}
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-[#ded5c6] cursor-pointer transition-colors shadow-2xs"
              title="Voltar ao Início"
            >
              <ArrowRight size={14} className="rotate-180" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#8e0b18] text-white flex items-center justify-center shadow-xs">
              <Sliders size={15} />
            </div>
            <div className="leading-tight text-left">
              <h1 className="text-[15px] font-black text-stone-950 font-heading uppercase tracking-wide">
                Central de Controle PGR
              </h1>
              <span className="text-[8.5px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
                PRÉ-ALERTA DE ISCAS • TELEMETRIA • GESTÃO DE VIAGENS
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Tabs */}
        <div className="flex items-center bg-[#f0e9dd] p-1 rounded-xl border border-[#ded5c6] gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
              activeTab === "gerador"
                ? "bg-[#8e0b18] text-white shadow-xs"
                : "text-stone-700 hover:text-stone-950 hover:bg-white/60"
            )}
          >
            <Sliders size={13} />
            <span>Pré-Alerta GR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("placas")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer relative",
              activeTab === "placas"
                ? "bg-[#1f1915] text-white shadow-xs"
                : "text-stone-700 hover:text-stone-950 hover:bg-white/60"
            )}
          >
            <Truck size={13} />
            <span>Santa Luzia / MG</span>
            {parsedPlacas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-amber-400 text-stone-900">
                {parsedPlacas.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unidades")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer relative",
              activeTab === "unidades"
                ? "bg-[#1f1915] text-white shadow-xs"
                : "text-stone-700 hover:text-stone-950 hover:bg-white/60"
            )}
          >
            <Compass size={13} />
            <span>Cuiabá / MT</span>
            {parsedUnidades.carretas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-cyan-400 text-stone-900">
                {parsedUnidades.carretas.length}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: GERADOR DE PRÉ-ALERTA GR (COMPACT SPLIT COCKPIT)               */}
      {/* ========================================================================= */}
      {activeTab === "gerador" && (
        <div className="flex-1 w-full grid grid-cols-12 gap-3.5 p-3.5 overflow-hidden">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: COMPACT FORM & OPERATIONAL INPUTS (SPAN 6)               */}
          {/* --------------------------------------------------------------------- */}
          <div className="col-span-12 lg:col-span-6 h-full flex flex-col gap-2.5 overflow-y-auto pr-1">
            
            {/* Top Toolbar in Form: Configs, Greetings, Carretas Mode */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-2.5 flex items-center justify-between shadow-2xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Config:</span>
                <div className="flex items-center bg-[#f2ecdf] p-0.5 rounded-lg border border-[#ded5c6]">
                  <button
                    type="button"
                    onClick={() => setNumCarretas(1)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                      numCarretas === 1 ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
                    )}
                  >
                    1 Carreta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumCarretas(2)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                      numCarretas === 2 ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
                    )}
                  >
                    2 Carretas (Bi-trem)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="bg-white border border-[#ded5c6] rounded-lg px-2 py-1 text-xs font-bold text-stone-800 outline-none cursor-pointer shadow-2xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Limpar campos"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Fieldset 1: Viagem & Rota */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-stone-200 text-stone-800">
                <MapPin size={13} className="text-[#8e0b18]" />
                <span className="text-[11px] font-black uppercase tracking-wider font-heading">
                  1. Rota & Documentos da Carga
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Origem</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
                  >
                    {ORIGEM_OPCOES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Destino</label>
                  <input
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value.toUpperCase())}
                    placeholder="Ex: GUARULHOS/SP"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Transportadora</label>
                  <select
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
                  >
                    {TRANSPORTADORAS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">NF Início</label>
                  <input
                    type="text"
                    value={nfInicio}
                    onChange={(e) => setNfInicio(e.target.value)}
                    placeholder="Ex: 44271"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">NF Fim (Opcional)</label>
                  <input
                    type="text"
                    value={nfFim}
                    onChange={(e) => setNfFim(e.target.value)}
                    placeholder="Ex: 44272"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Valor Carga (R$)</label>
                  <input
                    type="text"
                    value={valorCarga}
                    onChange={(e) => setValorCarga(e.target.value)}
                    placeholder="Ex: R$ 176.627,35"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-black text-emerald-700 outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Fieldset 2: Veículo & Motorista */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-stone-200 text-stone-800">
                <Truck size={13} className="text-[#8e0b18]" />
                <span className="text-[11px] font-black uppercase tracking-wider font-heading">
                  2. Cavalo, Carretas & Condutor
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Placa Cavalo</label>
                  <input
                    type="text"
                    value={cavalo}
                    onChange={(e) => setCavalo(e.target.value.replace(/-/g, "").toUpperCase())}
                    placeholder="Ex: TYQ6F51"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-black text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase tracking-wide"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Nome do Motorista</label>
                  <input
                    type="text"
                    value={motorista}
                    onChange={(e) => setMotorista(e.target.value.toUpperCase())}
                    placeholder="Ex: DAMIÃO GALVÃO ALVES"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Carreta 1</label>
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    placeholder="Ex: EKP0L77"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                  />
                </div>

                {numCarretas === 2 ? (
                  <div>
                    <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Carreta 2</label>
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      placeholder="Ex: SEB8F09"
                      className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-stone-400 italic pt-4">
                    <span>(Veículo simples: apenas 1 carreta)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fieldset 3: Iscas & Produtos */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-stone-200 text-stone-800">
                <Radio size={13} className="text-[#8e0b18]" />
                <span className="text-[11px] font-black uppercase tracking-wider font-heading">
                  3. Iscas, Produtos & Código U.M.A.
                </span>
              </div>

              {/* Carreta 1 Line */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-[#8e0b18] uppercase block mb-0.5">N° Isca 1</label>
                  <input
                    type="text"
                    value={isca1}
                    onChange={(e) => setIsca1(e.target.value.toUpperCase())}
                    placeholder="Ex: R10000913"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-black text-[#8e0b18] outline-none focus:border-red-500 shadow-2xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Produto 1</label>
                  <input
                    type="text"
                    value={produto1}
                    onChange={(e) => setProduto1(e.target.value.toUpperCase())}
                    placeholder="Ex: 12211016"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Cód. U.M.A. 1</label>
                  <input
                    type="text"
                    value={uma1}
                    onChange={(e) => setUma1(e.target.value.toUpperCase())}
                    placeholder="Ex: 031.025.114.090"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                  />
                </div>
              </div>

              {/* Carreta 2 Line (If 2 carretas) */}
              {numCarretas === 2 && (
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100">
                  <div>
                    <label className="text-[8.5px] font-bold text-[#8e0b18] uppercase block mb-0.5">N° Isca 2</label>
                    <input
                      type="text"
                      value={isca2}
                      onChange={(e) => setIsca2(e.target.value.toUpperCase())}
                      placeholder="Ex: R10000639"
                      className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-black text-[#8e0b18] outline-none focus:border-red-500 shadow-2xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Produto 2</label>
                    <input
                      type="text"
                      value={produto2}
                      onChange={(e) => setProduto2(e.target.value.toUpperCase())}
                      placeholder="Ex: 12211016"
                      className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Cód. U.M.A. 2</label>
                    <input
                      type="text"
                      value={uma2}
                      onChange={(e) => setUma2(e.target.value.toUpperCase())}
                      placeholder="Ex: 031.025.114.091"
                      className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fieldset 4: Telemetria & Posição */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-stone-200 text-stone-800">
                <Cpu size={13} className="text-[#8e0b18]" />
                <span className="text-[11px] font-black uppercase tracking-wider font-heading">
                  4. Telemetria & Posição da Isca
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Endereço Aproximado</label>
                  <input
                    type="text"
                    value={isca1Endereco}
                    onChange={(e) => setIsca1Endereco(e.target.value)}
                    placeholder="Ex: PÁTIO SANTA LUZIA - DOCA 04"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-stone-500 uppercase block mb-0.5">Bateria Isca 1</label>
                  <input
                    type="text"
                    value={isca1Bateria}
                    onChange={(e) => setIsca1Bateria(e.target.value)}
                    placeholder="Ex: 100%"
                    className="w-full h-8 bg-white border border-[#ded5c6] rounded-lg px-2 text-xs font-mono font-black text-emerald-700 outline-none focus:border-stone-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: EXECUTIVE LIVE PREVIEW & INSTANT DISPATCH (SPAN 6)      */}
          {/* --------------------------------------------------------------------- */}
          <div className="col-span-12 lg:col-span-6 h-full flex flex-col gap-2.5 overflow-hidden">
            
            {/* Sticky Top Toolbar with 1-Click Copy Buttons */}
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-2.5 flex items-center justify-between shadow-2xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs",
                    copiedEmail
                      ? "bg-emerald-600 text-white"
                      : "bg-[#8e0b18] hover:bg-[#a91625] text-white"
                  )}
                >
                  {copiedEmail ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                  <span>{copiedEmail ? "E-mail Copiado!" : "Copiar E-mail Completo"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySubject}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-black shadow-xs",
                    copiedAssunto
                      ? "bg-black text-[#FFFF00]"
                      : "bg-[#1f1915] hover:bg-black text-stone-200"
                  )}
                >
                  {copiedAssunto ? <Check size={13} className="text-[#FFFF00]" /> : <FileText size={13} />}
                  <span>{copiedAssunto ? "Assunto Copiado!" : "Copiar Assunto"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOcultarNotas(!ocultarNotas)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#ded5c6] text-[10px] font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {ocultarNotas ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{ocultarNotas ? "Ver Esquema" : "Ocultar Esquema"}</span>
                </button>
              </div>
            </div>

            {/* Email Subject Headline Card (Corporate Black & Yellow Accent) */}
            <div className="bg-black text-white rounded-xl border border-black overflow-hidden shadow-xs shrink-0">
              <div className="px-3.5 py-1 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                <span>Assunto Formatado do E-mail</span>
                <span className="text-amber-400 font-bold">PRÉ-ALERTA</span>
              </div>
              <div className="p-3 bg-[#FFFF00] text-black flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-mono font-black uppercase tracking-tight truncate leading-tight">
                  PRÉ-ALERTA DE ISCA - {destino || "GUARULHOS/SP"} - {cavalo || "SFD3J76"}
                </h2>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="px-2.5 py-1 rounded bg-black text-[#FFFF00] text-[9.5px] font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-2xs hover:bg-stone-800 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Email Body Live Preview Card (Scrollable, Clean Corporate Paper View) */}
            <div className="flex-1 bg-white rounded-xl border border-[#ded5c6] p-4 shadow-2xs overflow-y-auto font-sans text-xs text-stone-900">
              
              {/* Greeting */}
              <div className="font-bold text-[13px] text-stone-950 mb-2">
                {saudacao}
              </div>

              {/* Alert Badge */}
              <div className="inline-block bg-[#dc2626] text-white px-3 py-1 rounded text-[11px] font-black uppercase tracking-wide mb-3 shadow-2xs">
                {alertaResgate}
              </div>

              {/* Instructions */}
              <p className="font-bold text-stone-800 text-[11.5px] mb-2">
                {infoAbaixo}
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 mb-3 text-[11px] font-medium text-stone-700 leading-relaxed">
                <div>• {origem} x {destino};</div>
                <div>• {instrucao1}</div>
              </div>

              {/* Main Logistics Table */}
              <div className="border border-stone-300 rounded-lg overflow-hidden shadow-2xs mb-3">
                <table className="w-full text-center border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-[#1f1915] text-white font-black text-[9px] uppercase tracking-wider">
                      <th className="p-1.5 border-r border-stone-700">NF</th>
                      <th className="p-1.5 border-r border-stone-700">Transportadora</th>
                      <th className="p-1.5 border-r border-stone-700">Cavalo</th>
                      <th className="p-1.5 border-r border-stone-700">Carreta</th>
                      <th className="p-1.5 border-r border-stone-700 text-[#f5d799]">N° Isca</th>
                      <th className="p-1.5 border-r border-stone-700">Produto</th>
                      <th className="p-1.5 border-r border-stone-700">Cód UMA</th>
                      <th className="p-1.5 border-r border-stone-700">Destino</th>
                      <th className="p-1.5">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-t border-stone-300">
                      <td className="p-1.5 border-r border-stone-200 font-mono font-bold text-stone-900">{nfInicio || "---"}</td>
                      <td className="p-1.5 border-r border-stone-200 font-bold">{transportadora}</td>
                      <td className="p-1.5 border-r border-stone-200 font-mono font-black text-sky-700">{cavalo}</td>
                      <td className="p-1.5 border-r border-stone-200 font-mono font-bold">{carreta1}</td>
                      <td className="p-1.5 border-r border-stone-200 font-mono font-black text-[#8e0b18]">{isca1}</td>
                      <td className="p-1.5 border-r border-stone-200 font-mono font-bold">{produto1}</td>
                      <td className="p-1.5 border-r border-stone-200 font-mono">{uma1}</td>
                      <td className="p-1.5 border-r border-stone-200 font-bold">{destino}</td>
                      <td className="p-1.5 font-medium">{dataEnviada}</td>
                    </tr>
                    {numCarretas === 2 && (
                      <tr className="bg-stone-50 border-t border-stone-200">
                        <td className="p-1.5 border-r border-stone-200 font-mono font-bold text-stone-900">{nfFim || nfInicio || "---"}</td>
                        <td className="p-1.5 border-r border-stone-200 font-bold">{transportadora}</td>
                        <td className="p-1.5 border-r border-stone-200 font-mono font-black text-sky-700">{cavalo}</td>
                        <td className="p-1.5 border-r border-stone-200 font-mono font-bold">{carreta2}</td>
                        <td className="p-1.5 border-r border-stone-200 font-mono font-black text-[#8e0b18]">{isca2}</td>
                        <td className="p-1.5 border-r border-stone-200 font-mono font-bold">{produto2}</td>
                        <td className="p-1.5 border-r border-stone-200 font-mono">{uma2}</td>
                        <td className="p-1.5 border-r border-stone-200 font-bold">{destino}</td>
                        <td className="p-1.5 font-medium">{dataEnviada}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Telemetry Details */}
              <div className="bg-[#fcfaf7] border border-stone-300 rounded-lg p-2.5 mb-3 text-[10.5px]">
                <div className="font-black text-stone-900 uppercase tracking-wider text-[10px] mb-1 pb-1 border-b border-stone-200 flex items-center justify-between">
                  <span>PARAMETRIZAÇÃO DAS ISCAS</span>
                  <span className="font-mono text-emerald-700 font-bold">100% SINAL</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-stone-500 uppercase block">Posição Isca 1 ({isca1}):</span>
                    <span className="font-semibold text-stone-900">{isca1Endereco || "Pátio Santa Luzia"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-500 uppercase block">Data/Hora & Bateria:</span>
                    <span className="font-semibold text-stone-900">{isca1Data} • {isca1Bateria}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Footer */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-[9.5px] text-stone-600 leading-relaxed">
                <span className="font-black text-stone-900 uppercase block mb-1">GERENCIAMENTO DE RISCO CAFÉ TRÊS CORAÇÕES</span>
                <p>• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem com segurança e agilidade operacional.</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: SANTA LUZIA / MG (COMPACT IMPORTATION WORKSPACE)                 */}
      {/* ========================================================================= */}
      {activeTab === "placas" && (
        <div className="flex-1 w-full p-4 overflow-y-auto flex flex-col gap-3">
          
          {/* Header & Ingestion Card */}
          <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8e0b18] text-white flex items-center justify-center">
                  <Truck size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide font-heading">
                    Importação de Planilha — Santa Luzia / MG
                  </h2>
                  <span className="text-[9px] font-mono text-stone-500 uppercase">
                    Cole as linhas da planilha logística para importar automaticamente para o Pré-Alerta
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) setPlacasPastedData(text);
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
                >
                  <ClipboardPaste size={13} />
                  <span>Colar da Área de Transferência</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={placasPastedData}
              onChange={(e) => setPlacasPastedData(e.target.value)}
              placeholder="Cole aqui as linhas da planilha de Santa Luzia (TRANSPORTADOR | CONDUTOR | CAVALO | CARRETA | DESTINO | NF | VALOR)..."
              className="w-full bg-white border border-[#ded5c6] rounded-lg p-2.5 text-xs font-mono text-stone-900 outline-none focus:border-stone-500 shadow-inner resize-y"
            />
          </div>

          {/* Parsed Placas Table View */}
          {parsedPlacas.length > 0 && (
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Veículos Identificados:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#8e0b18] text-white">
                    {filteredPlacas.length} de {parsedPlacas.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-64">
                  <Search size={13} className="text-stone-400" />
                  <input
                    type="text"
                    value={placasSearch}
                    onChange={(e) => setPlacasSearch(e.target.value)}
                    placeholder="Buscar por placa, motorista..."
                    className="w-full h-7 bg-white border border-[#ded5c6] rounded px-2 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#1f1915] text-white font-mono text-[9px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Cavalo</th>
                      <th className="p-2">Carreta 1</th>
                      <th className="p-2">Carreta 2</th>
                      <th className="p-2">Motorista</th>
                      <th className="p-2">Transportador</th>
                      <th className="p-2">Destino</th>
                      <th className="p-2">Valor NF</th>
                      <th className="p-2 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredPlacas.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-amber-50/60 transition-colors">
                        <td className="p-2 font-mono text-stone-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-black text-sky-800">{item.cavalo}</td>
                        <td className="p-2 font-mono text-stone-700">{item.carreta1 || "---"}</td>
                        <td className="p-2 font-mono text-stone-700">{item.carreta2 || "---"}</td>
                        <td className="p-2 font-bold text-stone-900">{item.condutor || "---"}</td>
                        <td className="p-2 text-stone-700">{item.transportador || "---"}</td>
                        <td className="p-2 font-bold text-stone-800">{item.destino || "---"}</td>
                        <td className="p-2 font-mono font-black text-emerald-700">{item.valorNf || "---"}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleImportPlaca(item)}
                            className="px-2.5 py-1 rounded bg-[#8e0b18] hover:bg-[#a91625] text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                          >
                            + Importar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: CUIABÁ / MT                                                     */}
      {/* ========================================================================= */}
      {activeTab === "unidades" && (
        <div className="flex-1 w-full p-4 overflow-y-auto flex flex-col gap-3">
          <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8e0b18] text-white flex items-center justify-center">
                  <Compass size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide font-heading">
                    Importação de Manifesto — Unidade Cuiabá / MT
                  </h2>
                  <span className="text-[9px] font-mono text-stone-500 uppercase">
                    Cole o relatório ou bloco de texto da unidade Cuiabá para processamento
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setUnidadesPastedText(text);
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
              >
                <ClipboardPaste size={13} />
                <span>Colar da Área de Transferência</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={unidadesPastedText}
              onChange={(e) => setUnidadesPastedText(e.target.value)}
              placeholder="Cole aqui o manifesto de Cuiabá (UNIDADE, MOTORISTA, CAVALO, CARRETA, ISCA, PRODUTO)..."
              className="w-full bg-white border border-[#ded5c6] rounded-lg p-2.5 text-xs font-mono text-stone-900 outline-none focus:border-stone-500 shadow-inner resize-y"
            />
          </div>

          {parsedUnidades.carretas.length > 0 && (
            <div className="bg-[#fffdfa] rounded-xl border border-[#ded5c6] p-3 shadow-2xs flex flex-col gap-2">
              <span className="text-xs font-black uppercase text-stone-900 font-heading">
                Carretas Identificadas em Cuiabá ({parsedUnidades.carretas.length})
              </span>

              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#1f1915] text-white font-mono text-[9px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2">Carreta</th>
                      <th className="p-2">Isca</th>
                      <th className="p-2">Produto</th>
                      <th className="p-2">U.M.A.</th>
                      <th className="p-2 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {parsedUnidades.carretas.map((c, i) => (
                      <tr key={i} className="hover:bg-amber-50/60 transition-colors">
                        <td className="p-2 font-mono font-black text-stone-900">{c.carreta}</td>
                        <td className="p-2 font-mono font-bold text-[#8e0b18]">{c.isca}</td>
                        <td className="p-2 font-mono text-stone-700">{c.produto}</td>
                        <td className="p-2 font-mono text-stone-700">{c.uma}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (parsedUnidades.condutor) setMotorista(parsedUnidades.condutor);
                              if (parsedUnidades.cavalo) setCavalo(parsedUnidades.cavalo);
                              if (parsedUnidades.transp) setTransportadora(parsedUnidades.transp);
                              setCarreta1(c.carreta);
                              setIsca1(c.isca);
                              setProduto1(c.produto);
                              setUma1(c.uma);
                              setOrigem("CUIABÁ/MT");
                              setActiveTab("gerador");
                            }}
                            className="px-2.5 py-1 rounded bg-[#8e0b18] hover:bg-[#a91625] text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                          >
                            + Importar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
