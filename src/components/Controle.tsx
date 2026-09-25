import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
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
  UploadCloud,
  CheckCircle2,
  Filter,
  Layers,
  ExternalLink,
  ArrowUpDown,
  DollarSign,
  Radio,
  Minimize2,
  Maximize2,
  LayoutGrid,
  List,
  ClipboardPaste,
  Building2,
  ShieldCheck,
  Navigation,
  Compass,
  CheckSquare,
  Zap,
  Activity,
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";
import heroRotas from "../assets/images/hero_cinematic_rotas_1790216246671.jpg";

// Tech Corner Component
function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-4 h-4 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[3px] bg-[#9b1526] shadow-[0_0_10px_rgba(155,21,38,0.4)]" />
      <div className="w-[3px] h-full bg-[#9b1526] shadow-[0_0_10px_rgba(155,21,38,0.4)]" />
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
  if (url.includes("1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI") || url.includes("1t20tqT1GEkUUMcsWKcI4NAuinJmX1a8k")) return url;
  if (url.includes("1cw1CQiD8FUzeIBh36sBObz91h8k3bls1")) return url;
  if (url.startsWith("/images/")) return url;
  return url;
};

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

export function parseCurrencyNumber(val?: string | number): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  let cleaned = val.trim().replace(/^["']|["']$/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "---") return 0;

  // Remove currency symbols (R$, RS, $, etc.) and spaces
  cleaned = cleaned.replace(/R?S?\$?\s*/gi, "").trim();

  // If both dot and comma exist (e.g. "176.627,35")
  if (cleaned.includes(".") && cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Only comma exists (e.g. "176627,35" or "1000,00")
    cleaned = cleaned.replace(",", ".");
  } else if (cleaned.includes(".")) {
    // Only dot exists (e.g. "176.627" or "176627.35")
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = cleaned.replace(/\./g, "");
    } else if (parts.length === 2 && parts[1].length === 3) {
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatValorNf(val?: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return "";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const cleaned = val.trim().replace(/^["']|["']$/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "---") return "";

  // Check if it already has R$, RS, or similar currency symbol
  if (/^R?S?\$?\s*/i.test(cleaned)) {
    const numPart = cleaned.replace(/^R?S?\$?\s*/i, "").trim();
    const parsedNum = parseCurrencyNumber(numPart);
    if (parsedNum > 0) {
      return parsedNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    if (numPart) {
      return `R$ ${numPart}`;
    }
  }

  const num = parseCurrencyNumber(cleaned);
  if (num > 0) {
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return cleaned;
}

export const normalizePlacaTransportador = (raw?: string): string => {
  if (!raw) return "";
  const clean = raw.trim().replace(/^["']|["']$/g, "");
  const upper = clean.toUpperCase();
  if (
    upper === "3C" ||
    upper === "3 C" ||
    upper === "3-C" ||
    upper === "FROTA 3C" ||
    upper === "FROTA 3 C" ||
    upper === "FROTA3C" ||
    upper === "3C TRANSPORTES" ||
    upper === "TRANSPORTADORA 3C" ||
    upper === "TRANSP 3C"
  ) {
    return "Frota 3C";
  }
  return clean;
};

export function findBestMatchingRoute(
  destinoInput: string,
  origemInput: string
): { rota: string; destinoFinal: string } {
  if (!destinoInput || !destinoInput.trim()) {
    return { rota: "", destinoFinal: "" };
  }

  const cleanDest = destinoInput.trim().replace(/^["']|["']$/g, "").toUpperCase();
  const stripAccents = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  const normInput = stripAccents(cleanDest);
  const inputWithoutUf = stripAccents(cleanDest.replace(/\/[A-Z]{2}$/, "").trim());

  let bestMatch: string | null = null;

  for (const opt of DESTINOS_OPCOES) {
    const parts = opt.split(/\s*x\s*/i);
    const destPart = parts[parts.length - 1]?.trim() || "";
    const normDestPart = stripAccents(destPart);
    const destPartWithoutUf = stripAccents(destPart.replace(/\/[A-Z]{2}$/, "").trim());

    // 1. Exact match with or without UF
    if (normInput === normDestPart || inputWithoutUf === destPartWithoutUf) {
      bestMatch = opt;
      break;
    }

    // 2. Contains match
    if (
      normInput.length >= 3 &&
      (normDestPart.includes(normInput) ||
        normInput.includes(normDestPart) ||
        destPartWithoutUf.includes(inputWithoutUf) ||
        inputWithoutUf.includes(destPartWithoutUf))
    ) {
      if (!bestMatch) bestMatch = opt;
    }
  }

  // Also check special known destinations (e.g. SÍTIO NOVO -> RECIFE or similar)
  if (!bestMatch && normInput.includes("SITIO NOVO")) {
    const recife = DESTINOS_OPCOES.find((o) => o.includes("RECIFE"));
    if (recife) bestMatch = recife;
  }

  if (bestMatch) {
    const formattedRoute = bestMatch.replace(/^SANTA LUZIA\/MG/i, origemInput);
    const parts = formattedRoute.split(/\s*x\s*/i);
    const lastPart = parts[parts.length - 1]?.trim() || cleanDest;
    return {
      rota: formattedRoute,
      destinoFinal: lastPart,
    };
  }

  return {
    rota: `${origemInput} x ${cleanDest}`,
    destinoFinal: cleanDest,
  };
}

export const SAMPLE_PLACAS_SHEET_DATA = `N°\tORIGEM\tDIA\tDATA\tCONTATO WHATS\tHORA LIBERADO\tSTATUS\tMODELO CARRETA\tMODELO CAVALO\tPRÉ-CHECKLIST\tDESTINO\tTRANSPORTADOR\tCAVALO\tCARRETA\tN° PALLETS\tPBT (TON)\tNF\tCATEGORIA\tTECNOLOGIA\tCONDUTOR\tCPF\tRG / SSP\tCNH\tTELEFONE\tVALOR NF
1\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tEKP0L77\t21\t23\t44271\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287\tR$ 176.627,35
2\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tSEB8F09\t21\t23\t44272\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287\tR$ 176.627,35
3\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\tX\t05:06:51\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tREC. SÍTIO NOVO\tTORNADO\tTDF8G11\tRFV0E16\t28\t30\t53512\tFROTA\tONIXSAT\tCLEUSMAR M DA SILVA\t716.870.495-87\t64188941 SSP RJ\t01256784562\t(31) 97134-9810\tR$ 145.890,20
4\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\t29.08.59\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tGRAVATAÍ\tTENNA\tUVP-9C05\t---\t28\t30\t53513\tFROTA\tSASCAR\tFRANCISCO CLAWLISON DA SILVA\t056.888.895-70\t49258921 SSP MG\t01529475185\t(31) 98931-1558\tR$ 192.410,00
5\tSANTA LUZIA/MG\tsábado\t29/08/2024\tX\t08:19:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tNATAL\t3C\tUVP-9C05\tUVP0B29\t21\t17\t44273\tFROTA 3C\tSASCAR\tEMMANUEL RICARDO DE LIMA\t069.652.001-11\t18951234MG1\t01648291754\t(31) 99812-4411\tR$ 177.724,27
6\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:07:00\t09:50:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tSUMARÉ\tTENNA\tRMK5E77\tSDQ5F71\t28\t30\t53514\tFROTA\tSIGHRA\tJOSE MORAIS DE SOUSA\t906.750.185-00\t092551200 SSP BA\t01644257107\t(71) 71 99219-2756\tR$ 169.627,35
7\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:55:00\t09:55:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tTFD8E27\tSDQ5F71\t28\t30\t53515\tFROTA\tSIGHRA\tALEXANDRE MACHADO COELHO\t123.056.347-09\t22104523 DET RJ\t02074369037\t(21) 21 98908-0026\tR$ 181.230,00
8\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:10:00\t12:14:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRFM1J37\tKEM4C01\t28\t30\t53516\tFROTA\tSIGHRA\tMARCOS DE MELLO GODOY\t121.142.296-30\t11467412 SSP SP\t02089207039\t(11) 11 98319-3344\tR$ 176.627,35
9\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:06:00\t12:35:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBW1E02\tKEM4C01\t28\t30\t53517\tFROTA\tSIGHRA\tDIEGO CARNEIRO\t127.355.829-06\t18432651 SSP SP\t01633596188\t(11) 11 98265-7607\tR$ 176.627,35
10\tSANTA LUZIA/MG\tsábado\t29/08/2024\t12:26:00\t12:49:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBG7H83\tMSV1J96\t28\t30\t53518\tFROTA\tSIGHRA\tMARCOS GABRIEL OLIVEIRA\t135.097.437-84\t24531872 DET RJ\t04402638459\t(21) 21 98380-0010\tR$ 176.627,35
11\tSANTA LUZIA/MG\tsábado\t29/08/2024\t13:15:00\t14:58:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRNF6D84\tMSV1J96\t28\t30\t53519\tFROTA\tSIGHRA\tANTONILSON CAMPANHO DE SOUZA LACERDA\t126.658.877-06\t12934812 DET RJ\t03082531065\t(21) 21 99812-0535\tR$ 177.724,27
12\tSANTA LUZIA/MG\tsábado\t29/08/2024\t14:28:00\t15:19:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSAZ6E84\tRFE2J49\t28\t30\t53520\tFROTA\tSIGHRA\tBONIFACIO BARBOSA DA SILVA\t052.352.766-17\t08129812 SSP AL\t07002317398\t(82) 82 99600-1120\tR$ 180.500,00
13\tSANTA LUZIA/MG\tsábado\t29/08/2024\t15:05:00\t16:43:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSAY2C81\tRFE2J49\t28\t30\t53521\tFROTA\tSIGHRA\tROBERTO CARLOS PORTUGAL OLIVEIRA\t082.057.457-25\t12948603 DET RJ\t00510251776\t(21) 21 99846-8007\tR$ 176.627,35
14\tSANTA LUZIA/MG\tdomingo\t29/08/2024\tX\t09:05:36\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRVP9E38\tMDL9F97\t28\t30\t53522\tFROTA\tSIGHRA\tDERLEI PEREIRA DA SILVA\t082.739.561-16\t2856634 SDS PB\t01438973575\t(83) 83 99880-9008\tR$ 176.627,35`;

export function parsePlacasData(text: string): ParsedPlacaItem[] {
  if (!text || !text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Check headers in first line
  const firstCols = lines[0].split("\t").map((c) => c.trim().toUpperCase());

  const findHeaderIdx = (patterns: string[]) => {
    return firstCols.findIndex((col) =>
      patterns.some((p) => col === p || col.includes(p))
    );
  };

  let transpIdx = findHeaderIdx(["TRANSPORTADOR", "TRANSPORTADORA", "TRANSP", "EMPRESA"]);
  let condutorIdx = findHeaderIdx(["CONDUTOR", "MOTORISTA", "NOME MOTORISTA", "NOME CONDUTOR"]);
  let cavaloIdx = findHeaderIdx(["CAVALO", "PLACA CAVALO", "PLACA DO CAVALO", "PLACA CAV"]);
  let carretaIdx = findHeaderIdx(["CARRETA", "PLACA CARRETA", "SEMI-REBOQUE", "PLACA CAR", "CARRETA 1"]);
  let destinoIdx = findHeaderIdx(["DESTINO", "CIDADE DESTINO", "UNIDADE DESTINO", "DEST"]);
  let origemIdx = findHeaderIdx(["ORIGEM", "CIDADE ORIGEM", "UNIDADE ORIGEM"]);
  let nfIdx = findHeaderIdx(["NF", "NOTA FISCAL", "Nº NF", "N° NF"]);
  let valorNfIdx = findHeaderIdx(["VALOR NF", "VALOR DA CARGA", "VALOR CARGA", "VALOR_NF", "VALOR", "VLR NF", "VLR CARGA"]);
  if (valorNfIdx === -1) {
    valorNfIdx = firstCols.findIndex(
      (col) => col.includes("VALOR") && !col.includes("DATA") && !col.includes("STATUS")
    );
  }
  let tecnologiaIdx = findHeaderIdx(["TECNOLOGIA", "RASTREADOR", "SISTEMA"]);
  let modeloCarretaIdx = findHeaderIdx(["MODELO CARRETA", "TIPO CARRETA"]);
  let modeloCavaloIdx = findHeaderIdx(["MODELO CAVALO", "TIPO CAVALO"]);
  let statusIdx = findHeaderIdx(["STATUS"]);
  let cpfIdx = findHeaderIdx(["CPF"]);
  let telIdx = findHeaderIdx(["TELEFONE", "TEL", "CELULAR", "CONTATO"]);

  const hasHeaders =
    cavaloIdx !== -1 ||
    condutorIdx !== -1 ||
    transpIdx !== -1 ||
    destinoIdx !== -1 ||
    carretaIdx !== -1;
  const startRow = hasHeaders ? 1 : 0;

  // Fallback positional index matching Google Sheet in image.png if no headers detected:
  // Col 1: ORIGEM, Col 10: DESTINO, Col 11: TRANSPORTADOR, Col 12: CAVALO, Col 13: CARRETA, Col 16: NF, Col 18: TECNOLOGIA, Col 19: CONDUTOR, Col 33: VALOR NF
  if (!hasHeaders) {
    origemIdx = 1;
    destinoIdx = 10;
    transpIdx = 11;
    cavaloIdx = 12;
    carretaIdx = 13;
    nfIdx = 16;
    tecnologiaIdx = 18;
    condutorIdx = 19;
    cpfIdx = 20;
    telIdx = 23;
    valorNfIdx = 33;
  }

  const cleanVal = (v?: string) => (v || "").trim().replace(/^["']|["']$/g, "");
  const cleanPlate = (v?: string) => {
    const s = cleanVal(v).toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (s === "---" || s === "-" || s === "SEM PLACA" || s === "SEM CARRETA" || s === "SEMISCA" || s === "SEM") return "";
    return s;
  };

  const rawList: {
    transportador: string;
    condutor: string;
    cavalo: string;
    carreta: string;
    destino: string;
    origem: string;
    nf: string;
    valorNf: string;
    tecnologia: string;
    modeloCarreta: string;
    modeloCavalo: string;
    status: string;
    cpf: string;
    telefone: string;
  }[] = [];

  for (let i = startRow; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < 2) continue;

    const cavalo = cleanPlate(cavaloIdx >= 0 ? cols[cavaloIdx] : "");
    const carreta = cleanPlate(carretaIdx >= 0 ? cols[carretaIdx] : "");
    const transp = normalizePlacaTransportador(cleanVal(transpIdx >= 0 ? cols[transpIdx] : ""));
    const condutor = cleanVal(condutorIdx >= 0 ? cols[condutorIdx] : "").toUpperCase();
    const destino = cleanVal(destinoIdx >= 0 ? cols[destinoIdx] : "").toUpperCase();
    const origem = cleanVal(origemIdx >= 0 ? cols[origemIdx] : "").toUpperCase();
    const nf = cleanVal(nfIdx >= 0 ? cols[nfIdx] : "");
    const valorNf = formatValorNf(
      valorNfIdx >= 0 ? cols[valorNfIdx] : (cols.length > 33 ? cols[33] : "")
    );
    const tecnologia = cleanVal(tecnologiaIdx >= 0 ? cols[tecnologiaIdx] : "").toUpperCase();
    const modeloCarreta = cleanVal(modeloCarretaIdx >= 0 ? cols[modeloCarretaIdx] : "").toUpperCase();
    const modeloCavalo = cleanVal(modeloCavaloIdx >= 0 ? cols[modeloCavaloIdx] : "").toUpperCase();
    const status = cleanVal(statusIdx >= 0 ? cols[statusIdx] : "").toUpperCase();
    const cpf = cleanVal(cpfIdx >= 0 ? cols[cpfIdx] : "");
    const telefone = cleanVal(telIdx >= 0 ? cols[telIdx] : "");

    if (!cavalo && !condutor && !transp && !carreta && !destino) continue;

    rawList.push({
      transportador: transp,
      condutor,
      cavalo,
      carreta,
      destino,
      origem,
      nf,
      valorNf,
      tecnologia,
      modeloCarreta,
      modeloCavalo,
      status,
      cpf,
      telefone,
    });
  }

  // Intelligent grouping by Cavalo plate or (Condutor + Destino)
  const groupedMap = new globalThis.Map<string, ParsedPlacaItem>();

  rawList.forEach((item, idx) => {
    const groupKey = item.cavalo ? item.cavalo : `${item.condutor}_${item.destino}_${idx}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        id: `placa_${idx}_${item.cavalo || idx}`,
        transportador: item.transportador,
        condutor: item.condutor,
        cavalo: item.cavalo,
        carreta1: item.carreta,
        carreta2: "",
        destino: item.destino,
        origem: item.origem,
        nf: item.nf,
        valorNf: item.valorNf,
        tecnologia: item.tecnologia,
        modeloCarreta: item.modeloCarreta,
        modeloCavalo: item.modeloCavalo,
        status: item.status,
        cpf: item.cpf,
        telefone: item.telefone,
        rawRowsCount: 1,
      });
    } else {
      const existing = groupedMap.get(groupKey)!;
      existing.rawRowsCount++;
      if (item.carreta && item.carreta !== existing.carreta1 && !existing.carreta2) {
        existing.carreta2 = item.carreta;
      }
      if (!existing.transportador && item.transportador) existing.transportador = item.transportador;
      if (!existing.condutor && item.condutor) existing.condutor = item.condutor;
      if (!existing.destino && item.destino) existing.destino = item.destino;
      if (!existing.origem && item.origem) existing.origem = item.origem;
      if (!existing.nf && item.nf) existing.nf = item.nf;
      else if (existing.nf && item.nf && !existing.nf.includes(item.nf)) {
        existing.nf = `${existing.nf} / ${item.nf}`;
      }
      if (!existing.valorNf && item.valorNf) {
        existing.valorNf = item.valorNf;
      } else if (existing.valorNf && item.valorNf) {
        const v1 = parseCurrencyNumber(existing.valorNf);
        const v2 = parseCurrencyNumber(item.valorNf);
        if (v1 > 0 || v2 > 0) {
          const sum = v1 + v2;
          existing.valorNf = formatValorNf(sum);
        }
      }
      if (!existing.tecnologia && item.tecnologia) existing.tecnologia = item.tecnologia;
      if (!existing.cpf && item.cpf) existing.cpf = item.cpf;
      if (!existing.telefone && item.telefone) existing.telefone = item.telefone;
    }
  });

  return Array.from(groupedMap.values());
}

export interface ParsedUnidadeItem {
  carreta: string;  // Coluna 1: Placa da carreta
  isca: string;     // Coluna 2: Número da isca
  produto: string;  // Coluna 3: Produto / Descrição / Posição
  uma: string;      // Coluna 4: U.M.A
  nf: string;       // Coluna 5: NF
  esquema: string;  // Esquema / Posição
}

export interface ParsedUnidadeInfo {
  dataEmbarque: string;
  cavalo: string;
  carretas: ParsedUnidadeItem[];
  destino: string;
  transportadora: string;
  motorista: string;
  tecnologia: string;
}

export const SAMPLE_UNIDADES_TEXT = `Data do embarque: 02/09/2026

RODO

Placa do cavalo: RFX9E81

Placa do Baú: RBV2C89 - R100001239 - 12211016 - LADO DIREITO SUPERIOR - BATIDO
NF : 305124

Placa do Baú: RBV2D09 - R100000620 - 12211016- LADO DIREITO SUPERIOR - BATIDO
NF:305128

Destino: CAMPO GRANDE - MS
Transportadora: Ledfran
Motorista: Diego Pereira`;

export function parseUnidadesText(text: string): ParsedUnidadeInfo {
  const result: ParsedUnidadeInfo = {
    dataEmbarque: "",
    cavalo: "",
    carretas: [],
    destino: "",
    transportadora: "",
    motorista: "",
    tecnologia: "",
  };

  if (!text || !text.trim()) return result;

  const lines = text.split("\n").map((l) => l.trim());

  let currentCarretaIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // 1. Data do embarque
    const dateMatch = line.match(/(?:Data(?:\s+do\s+embarque)?)\s*:\s*([^\n]+)/i);
    if (dateMatch && !result.dataEmbarque) {
      result.dataEmbarque = dateMatch[1].trim();
      continue;
    }

    // 2. Placa do cavalo
    const cavaloMatch = line.match(/(?:Placa\s+do\s+cavalo|Cavalo|Placa\s+Cavalo)\s*:\s*([A-Za-z0-9-]+)/i);
    if (cavaloMatch && !result.cavalo) {
      result.cavalo = cavaloMatch[1].trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
      continue;
    }

    // 3. Destino
    const destMatch = line.match(/Destino\s*:\s*([^\n]+)/i);
    if (destMatch && !result.destino) {
      result.destino = destMatch[1].trim().toUpperCase();
      continue;
    }

    // 4. Transportadora
    const transpMatch = line.match(/Transportadora\s*:\s*([^\n]+)/i);
    if (transpMatch && !result.transportadora) {
      result.transportadora = transpMatch[1].trim();
      continue;
    }

    // 5. Motorista / Condutor
    const motMatch = line.match(/(?:Motorista|Condutor)\s*:\s*([^\n]+)/i);
    if (motMatch && !result.motorista) {
      result.motorista = motMatch[1].trim().toUpperCase();
      continue;
    }

    // 6. Tecnologia / Rastreador
    const tecMatch = line.match(/(?:Tecnologia|Rastreador)\s*:\s*([^\n]+)/i);
    if (tecMatch && !result.tecnologia) {
      result.tecnologia = tecMatch[1].trim().toUpperCase();
      continue;
    }

    // 7. Placa do Baú / Carreta / Semi-reboque or line with hyphen/tab separated columns
    const isBauPrefix = /(?:Placa\s+do\s+Baú|Placa\s+do\s+Bau|Placa\s+da\s+Carreta|Carreta|Baú|Bau)\s*:/i.test(line);
    const partsCount = line.split(/[-;\t]/).length;
    const isMultiColumnLine = partsCount >= 2 && !/^(Data|Destino|Transportadora|Motorista|Condutor|Tecnologia|Rastreador|Placa\s+do\s+cavalo|Cavalo)/i.test(line);

    if (isBauPrefix || isMultiColumnLine) {
      const cleanLine = line.replace(/^(Placa\s+do\s+Baú|Placa\s+do\s+Bau|Placa\s+da\s+Carreta|Carreta\s*\d*|Baú\s*\d*|Bau\s*\d*)\s*:\s*/i, "").trim();
      const parts = cleanLine.split(/[-;\t]/).map((p) => p.trim()).filter(Boolean);

      if (parts.length > 0) {
        // Coluna 1: Placa da Carreta
        const carretaPlate = parts[0].toUpperCase().replace(/[^A-Z0-9-]/g, "");

        let iscaVal = "";
        let produtoVal = "";
        let umaVal = "";
        let nfVal = "";

        // Iterate through remaining parts following standard 5-column semantics
        parts.slice(1).forEach((part) => {
          const pUpper = part.toUpperCase().trim();
          const pClean = pUpper.replace(/[^A-Z0-9]/g, "");

          if (!nfVal && (/^NF\s*:?/i.test(pUpper) || pUpper.startsWith("NF"))) {
            // Coluna 5: NF
            nfVal = pUpper.replace(/^NF\s*:?\s*/i, "");
          } else if (!iscaVal && (/^R\d+/i.test(pClean) || /^30D/i.test(pClean) || pUpper.includes("ISCA"))) {
            // Coluna 2: Número da Isca
            iscaVal = pClean;
          } else if (!produtoVal) {
            // Coluna 3: Produto (ex: 12211016)
            produtoVal = part.trim();
          } else {
            // Coluna 4: U.M.A / Descrição / Posição (ex: LADO DIREITO SUPERIOR - BATIDO)
            if (umaVal) umaVal += " - " + part.trim();
            else umaVal = part.trim();
          }
        });

        // Se sobrou a NF sem prefixo "NF" no final das partes quando há 5 ou mais colunas
        if (!nfVal && parts.length >= 5 && umaVal && produtoVal) {
          const lastPart = parts[parts.length - 1].trim();
          const lastClean = lastPart.replace(/\D/g, "");
          if (/^\d{4,8}$/.test(lastClean)) {
            nfVal = lastClean;
            if (umaVal.endsWith(" - " + lastPart)) {
              umaVal = umaVal.substring(0, umaVal.length - (" - " + lastPart).length);
            } else if (umaVal === lastPart) {
              umaVal = "";
            }
          }
        }

        result.carretas.push({
          carreta: carretaPlate,
          isca: iscaVal,
          produto: produtoVal,
          uma: umaVal,
          nf: nfVal,
          esquema: umaVal || produtoVal,
        });
        currentCarretaIdx = result.carretas.length - 1;
        continue;
      }
    }

    // 8. NF on a standalone line (e.g. "NF : 305124")
    const nfMatch = line.match(/^NF\s*:\s*([0-9\/\s-]+)/i);
    if (nfMatch) {
      const nfVal = nfMatch[1].trim().replace(/\D/g, "");
      if (currentCarretaIdx >= 0 && result.carretas[currentCarretaIdx]) {
        result.carretas[currentCarretaIdx].nf = nfVal;
      }
      continue;
    }
  }

  return result;
}

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // Navigation Tabs: 'gerador', 'unidades' or 'placas'
  const [activeTab, setActiveTab] = useState<"gerador" | "placas" | "unidades">("gerador");

  // PRE ALERTA GR Column View Mode: 'normal', 'minimized', 'maximized'
  const [preAlertaMode, setPreAlertaMode] = useState<"normal" | "minimized" | "maximized">("normal");
  // Zoom state for Formulário de Controle and Veículo & Carga when preAlertaMode === 'minimized'
  const [colunasZoom, setColunasZoom] = useState<number>(1);

  // --- UNIDADES TAB STATE ---
  const [unidadesPastedText, setUnidadesPastedText] = useState("");
  const parsedUnidades = useMemo(() => {
    return parseUnidadesText(unidadesPastedText);
  }, [unidadesPastedText]);

  // --- PLACAS (SANTA LUZIA) TAB STATE ---
  const [placasPastedData, setPlacasPastedData] = useState("");
  const [placasFilter, setPlacasFilter] = useState("");
  const [placasViewMode, setPlacasViewMode] = useState<"cards" | "table">("cards");
  const [placasSelectedTransp, setPlacasSelectedTransp] = useState<string>("TODAS");
  const [importSuccessBanner, setImportSuccessBanner] = useState<{
    cavalo: string;
    motorista: string;
    destino: string;
    transp: string;
  } | null>(null);

  const parsedPlacas = useMemo(() => {
    return parsePlacasData(placasPastedData);
  }, [placasPastedData]);

  const santaLuziaStats = useMemo(() => {
    const total = parsedPlacas.length;
    const transps = Array.from(new Set(parsedPlacas.map((p) => p.transportador).filter(Boolean)));
    const destinos = Array.from(new Set(parsedPlacas.map((p) => p.destino).filter(Boolean)));
    const comValor = parsedPlacas.filter((p) => !!p.valorNf).length;
    const biTrems = parsedPlacas.filter((p) => !!p.carreta2).length;
    return { total, transps, destinos, comValor, biTrems };
  }, [parsedPlacas]);

  const filteredPlacas = useMemo(() => {
    let list = parsedPlacas;
    if (placasSelectedTransp && placasSelectedTransp !== "TODAS") {
      list = list.filter((p) => p.transportador.toLowerCase() === placasSelectedTransp.toLowerCase());
    }
    if (!placasFilter.trim()) return list;
    const q = placasFilter.toLowerCase();
    return list.filter(
      (p) =>
        p.cavalo.toLowerCase().includes(q) ||
        p.carreta1.toLowerCase().includes(q) ||
        p.carreta2.toLowerCase().includes(q) ||
        p.condutor.toLowerCase().includes(q) ||
        p.transportador.toLowerCase().includes(q) ||
        p.destino.toLowerCase().includes(q) ||
        (p.nf && p.nf.toLowerCase().includes(q)) ||
        (p.origem && p.origem.toLowerCase().includes(q))
    );
  }, [parsedPlacas, placasFilter, placasSelectedTransp]);

  const handlePasteClipboardPlacas = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPlacasPastedData(text);
    } catch (err) {
      console.warn("Clipboard access denied or unavailable", err);
    }
  };

  const handlePasteClipboardUnidades = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUnidadesPastedText(text);
    } catch (err) {
      console.warn("Clipboard access denied or unavailable", err);
    }
  };

  const [copiedIscaKey, setCopiedIscaKey] = useState<string | null>(null);
  const handleCopySingleIsca = (key: string, isca: string) => {
    if (!isca) return;
    navigator.clipboard.writeText(isca);
    setCopiedIscaKey(key);
    setTimeout(() => setCopiedIscaKey(null), 2000);
  };
  // -------------------------

  const FRASE_RESGATE_PADRAO = "FAVOR SE ATENTAR AO RESGATE!";
  const FRASE_RESGATE_DESCARTAVEL =
    "ESSE PRÉ-ALERTA É APENAS PARA CONTROLE E ACOMPANHAMENTO,\nPOIS A ISCA É DESCARTÁVEL E NÃO NECESSITA DE DEVOLUÇÃO!";

  const isPrefix30D1 = (prefix: string, fullNumber: string) => {
    const p = (prefix || "").trim().toUpperCase();
    const f = (fullNumber || "").trim().toUpperCase();
    return p === "30D10000" || p.startsWith("30D10000") || f.startsWith("30D10000");
  };

  const isDispositivoDescartavel = (
    p1: string,
    p2: string,
    f1: string,
    f2: string,
    totalCarretas: number
  ) => {
    const d1 = isPrefix30D1(p1, f1);
    if (totalCarretas === 1) return d1;
    const d2 = f2 !== "SEM ISCA" && isPrefix30D1(p2, f2);
    return d1 || d2;
  };

  // State for all form fields
  const [numCarretas, setNumCarretas] = useState<1 | 2>(2);
  const [alertaResgate, setAlertaResgate] = useState(
    FRASE_RESGATE_PADRAO,
  );
  const [infoAbaixo, setInfoAbaixo] = useState(
    "Atentar às informações abaixo:",
  );

  // Routes & Warning lines
  const [origem, setOrigem] = useState("SANTA LUZIA/MG");
  const isCuiabaOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized.includes("cuiaba");
  }, [origem]);
  const isGreenOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalized.includes("viana") ||
      normalized.includes("serra") ||
      normalized.includes("cariacica")
    );
  }, [origem]);
  const isVianaOrigem = isGreenOrigem;
  const isPurpleOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalized.includes("montes claros") ||
      normalized.includes("montesclaros")
    );
  }, [origem]);
  const [rota1, setRota1] = useState("");
  const [instrucao1, setInstrucao1] = useState("Favor, acusar o recebimento do pré-alerta;");

  // Table information (CCC.PNG layout)
  const [nfInicio, setNfInicio] = useState("");
  const [nfFim, setNfFim] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [valorCarga, setValorCarga] = useState("");
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

  const isDescartavel = useMemo(() => {
    return isDispositivoDescartavel(
      iscaPrefix1,
      iscaPrefix2,
      isca1,
      isca2,
      numCarretas
    );
  }, [iscaPrefix1, iscaPrefix2, isca1, isca2, numCarretas]);

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
  const [copiedIscasSpace, setCopiedIscasSpace] = useState(false);
  const [copiedFraseEmbarque, setCopiedFraseEmbarque] = useState(false);

  const getDayMonthFromDate = (dateStr: string) => {
    if (!dateStr) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    const clean = dateStr.trim().toLowerCase();
    // match DD/MM or DD/MM/YYYY
    const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
      return `${slashMatch[1].padStart(2, "0")}/${slashMatch[2].padStart(2, "0")}`;
    }
    // match YYYY-MM-DD
    const isoMatch = clean.match(/^\d{4}-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[2]}/${isoMatch[1]}`;
    }
    // match DD-mon or DD.mon (e.g. 15-set. or 15.set or 15-setembro)
    const monthMap: Record<string, string> = {
      jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
      jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
    };
    const monMatch = clean.match(/^(\d{1,2})[-. ]+([a-z]{3})/);
    if (monMatch) {
      const day = monMatch[1].padStart(2, "0");
      const monStr = monMatch[2];
      const monthNum = monthMap[monStr] || String(new Date().getMonth() + 1).padStart(2, "0");
      return `${day}/${monthNum}`;
    }
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const getFraseEmbarqueIsca = () => {
    const dayMonth = getDayMonthFromDate(dataEnviada);
    const destClean = cleanDestinoForPlanilha(destino) || (destino ? destino.toUpperCase().replace(/\/[A-Z]{2}$/, '').trim() : "GUARULHOS");
    return `${dayMonth} ISCA EMBARCADA PARA ${destClean}`;
  };

  const handleCopyFraseEmbarque = async () => {
    const frase = getFraseEmbarqueIsca();
    try {
      await navigator.clipboard.writeText(frase);
      setCopiedFraseEmbarque(true);
      setTimeout(() => setCopiedFraseEmbarque(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar frase de embarque:", err);
    }
  };

  const getIscasSpaceSeparated = () => {
    const iscasList: string[] = [];

    const getCleanIsca = (iscaVal: string, prefix: string, suffix: string) => {
      let val = (iscaVal || "").trim();
      if (!val && (prefix || suffix)) {
        val = (prefix + suffix).trim();
      }
      if (!val || val.toUpperCase() === "SEM ISCA" || val === "---") {
        return "";
      }
      return val;
    };

    const isca1Clean = getCleanIsca(isca1, iscaPrefix1, iscaSuffix1);
    if (isca1Clean) iscasList.push(isca1Clean);

    if (numCarretas === 2) {
      const isca2Clean = getCleanIsca(isca2, iscaPrefix2, iscaSuffix2);
      if (isca2Clean) iscasList.push(isca2Clean);
    }

    return iscasList.join(" ");
  };

  const handleCopyIscasWithSpace = async () => {
    const text = getIscasSpaceSeparated();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIscasSpace(true);
      setTimeout(() => setCopiedIscasSpace(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar iscas:", err);
    }
  };

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
    if (!text.trim()) {
      setIsca1Endereco("");
      setIsca2Endereco("");
      setIsca1Data("");
      setIsca2Data("");
      return;
    }

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

    // Pass 2: Assign unmatched items to remaining unmatched slots in order (isca1 first, then isca2)
    parsedItems.forEach((item, index) => {
      if (matchedItemIndices.has(index)) return;

      if (!matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      } else if (!matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      }
    });

    if (parsedItems.length === 1) {
      if (carreta2 && carreta2.trim() !== "") {
        // Carreta 2 está preenchida: mantém 2 carretas e seleciona a opção "- Sem Isca" para a Carreta 2
        setNumCarretas(2);
        setIsca2("SEM ISCA");
        setIsca2Endereco("");
        setIsca2Data("");
        setIsca2Bateria("");
        setIscaSuffix2("");
        setNfFim("");
        setSidebarEmbarque2("none");
        if (!produto2 || produto2 === "") setProduto2("---");
        if (!uma2 || uma2 === "") setUma2("---");
      } else {
        setNumCarretas(1);
      }
    } else if (parsedItems.length >= 2) {
      setNumCarretas(2);
      if (produto2 === "---") setProduto2("");
      if (uma2 === "---") setUma2("");
    }
  };

  // Handlers for swapping Carretas and copying/swapping Produtos (Veículo & Carga)
  const handleSwapCarretas = () => {
    const temp1 = carreta1;
    const temp2 = carreta2;
    setCarreta1(temp2);
    setCarreta2(temp1);
    if (temp1 && numCarretas === 1) {
      setNumCarretas(2);
    }
  };

  const handleCopyProduto1To2 = () => {
    setProduto2(produto1);
    if (produto1 && numCarretas === 1) {
      setNumCarretas(2);
    }
  };

  const handleCopyProduto2To1 = () => {
    setProduto1(produto2);
  };

  const handleSwapProdutos = () => {
    const temp1 = produto1;
    const temp2 = produto2;
    setProduto1(temp2);
    setProduto2(temp1);
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
        if (data.instrucao1 !== undefined) {
          if (data.instrucao1 === "* Favor, acusar o recebimento do pré-alerta;") {
            setInstrucao1("Favor, acusar o recebimento do pré-alerta;");
          } else {
            setInstrucao1(data.instrucao1);
          }
        }
        if (data.nfInicio !== undefined) setNfInicio(data.nfInicio);
        if (data.nfFim !== undefined) setNfFim(data.nfFim);
        if (data.transportadora !== undefined) setTransportadora(data.transportadora);
        if (data.valorCarga !== undefined) setValorCarga(data.valorCarga);
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
      valorCarga,
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
    valorCarga,
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

  // Monitora e atualiza alertaResgate automaticamente para iscas descartáveis (prefixo 30D10000)
  useEffect(() => {
    const descartavel = isDispositivoDescartavel(
      iscaPrefix1,
      iscaPrefix2,
      isca1,
      isca2,
      numCarretas
    );
    if (descartavel) {
      if (alertaResgate !== FRASE_RESGATE_DESCARTAVEL) {
        setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
      }
    } else {
      if (alertaResgate === FRASE_RESGATE_DESCARTAVEL) {
        setAlertaResgate(FRASE_RESGATE_PADRAO);
      }
    }
  }, [iscaPrefix1, iscaPrefix2, isca1, isca2, numCarretas, alertaResgate]);

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
    setValorCarga("");
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Deseja realmente limpar todas as informações do controle?",
      )
    ) {
      setNumCarretas(2);
      setSaudacao(getInitialGreeting());
      setAlertaResgate(FRASE_RESGATE_PADRAO);
      setInfoAbaixo("Atentar às informações abaixo:");
      setOrigem("SANTA LUZIA/MG");
      setRota1("");
      setInstrucao1("Favor, acusar o recebimento do pré-alerta;");
      setNfInicio("");
      setNfFim("");
      setTransportadora("");
      setValorCarga("");
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

  const handleImportPlacaItem = (item: ParsedPlacaItem) => {
    // 1. Veículo & Carga
    if (item.cavalo) setCavalo(item.cavalo);
    if (item.carreta1) setCarreta1(item.carreta1);
    if (item.carreta2) {
      setCarreta2(item.carreta2);
      setNumCarretas(2);
      if (produto2 === "---") setProduto2("");
      if (uma2 === "---") setUma2("");
    } else {
      setCarreta2("");
      if (
        item.modeloCarreta?.includes("RODOTREM") ||
        item.modeloCarreta?.includes("BITREM")
      ) {
        setNumCarretas(2);
      } else {
        setNumCarretas(1);
      }
    }

    // 2. Formulário de Controle & Dados Gerais
    if (item.transportador) {
      const normTransp = normalizePlacaTransportador(item.transportador);
      const match = allTransportadoras.find(
        (t) => t.toLowerCase() === normTransp.toLowerCase()
      );
      const finalTransp = match || normTransp;

      setTransportadora(finalTransp);
      setSidebarTransportadora(finalTransp);
      if (!match) {
        setCustomTransportadoras((prev) => [...prev, finalTransp]);
      }
    }

    if (item.condutor) {
      setMotorista(item.condutor);
      setSidebarMotorista(item.condutor);
    }

    // Origem & Destino -> Formulário de Controle (SELECIONE A ROTA)
    let finalOrigem = origem || "SANTA LUZIA/MG";
    if (item.origem) {
      const normOrig = item.origem.toUpperCase().trim();
      const matchedOrig = ORIGEM_OPCOES.find(
        (o) =>
          o.toUpperCase() === normOrig ||
          o.toUpperCase().includes(normOrig) ||
          normOrig.includes(o.replace(/\/[A-Z]{2}$/, "").toUpperCase())
      );
      if (matchedOrig) {
        finalOrigem = matchedOrig;
      } else {
        finalOrigem = item.origem.toUpperCase();
      }
      setOrigem(finalOrigem);
    }

    if (item.destino) {
      const { rota, destinoFinal } = findBestMatchingRoute(item.destino, finalOrigem);
      setDestino(destinoFinal);
      setRota1(rota);
    }

    if (item.tecnologia) {
      setSidebarTecnologia(item.tecnologia);
    }

    // As colunas NF INÍCIO e NF FIM precisam ficar vazias ao importar da aba Placas
    setNfInicio("");
    setNfFim("");

    // Somente quando a informação for importada da aba Santa Luzia, importa o VALOR NF para o valor da carga
    if (item.valorNf) {
      setValorCarga(item.valorNf);
    } else {
      setValorCarga("");
    }

    // Interactive confirmation banner
    setImportSuccessBanner({
      cavalo: item.cavalo || "S/ Placa",
      motorista: item.condutor || "Motorista",
      destino: item.destino || "Destino",
      transp: item.transportador || "Transportadora",
    });

    // Automatically switch to Gerador PGR
    setActiveTab("gerador");
  };

  const handleImportUnidadeData = (info: ParsedUnidadeInfo) => {
    // Origem originada da aba Unidades é sempre CUIABÁ/MT
    const unidadeOrigem = "CUIABÁ/MT";
    setOrigem(unidadeOrigem);

    if (info.cavalo) setCavalo(info.cavalo);

    if (info.carretas.length > 0) {
      // Carreta 1
      const c1 = info.carretas[0];
      if (c1.carreta) setCarreta1(c1.carreta);
      if (c1.isca) {
        setIsca1(c1.isca);
        handleIsca1Change(c1.isca);
      }
      if (c1.produto) setProduto1(c1.produto);
      if (c1.uma) setUma1(formatUMA(c1.uma));
      if (c1.nf) setNfInicio(c1.nf.trim().replace(/[\s.]/g, ""));

      if (c1.esquema) {
        const upperE = c1.esquema.toUpperCase();
        if (upperE.includes("LADO DIREITO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI");
        } else if (upperE.includes("LADO ESQUERDO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1");
        } else if (upperE.includes("LADO DIREITO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV");
        } else if (upperE.includes("LADO ESQUERDO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS");
        } else if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh");
        } else if (upperE.includes("PALETIZADO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
        }
      }

      if (info.carretas.length > 1) {
        const c2 = info.carretas[1];
        setNumCarretas(2);
        if (c2.carreta) setCarreta2(c2.carreta);
        if (c2.isca) {
          setIsca2(c2.isca);
          handleIsca2Change(c2.isca);
        }
        if (c2.produto) setProduto2(c2.produto);
        if (c2.uma) setUma2(formatUMA(c2.uma));
        if (c2.nf) setNfFim(c2.nf.trim().replace(/[\s.]/g, ""));

        if (c2.esquema) {
          const upperE = c2.esquema.toUpperCase();
          if (upperE.includes("LADO DIREITO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI");
          } else if (upperE.includes("LADO ESQUERDO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1");
          } else if (upperE.includes("LADO DIREITO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV");
          } else if (upperE.includes("LADO ESQUERDO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS");
          } else if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh");
          } else if (upperE.includes("PALETIZADO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
          }
        }
      } else {
        setNumCarretas(1);
      }
    }

    if (info.transportadora) {
      const normTransp = normalizePlacaTransportador(info.transportadora);
      const match = allTransportadoras.find(
        (t) => t.toLowerCase() === normTransp.toLowerCase()
      );
      const finalTransp = match || normTransp;
      setTransportadora(finalTransp);
      setSidebarTransportadora(finalTransp);
      if (!match) {
        setCustomTransportadoras((prev) => [...prev, finalTransp]);
      }
    }

    if (info.motorista) {
      setMotorista(info.motorista);
      setSidebarMotorista(info.motorista);
    }

    if (info.destino) {
      const { rota, destinoFinal } = findBestMatchingRoute(info.destino, unidadeOrigem);
      setDestino(destinoFinal);
      setRota1(rota);
    } else {
      setRota1(`· ${unidadeOrigem} x DESTINO;`);
    }

    if (info.tecnologia) {
      setSidebarTecnologia(info.tecnologia);
    }

    // Valor da carga fica vazio na importação da aba Unidades (exclusivo para Santa Luzia)
    setValorCarga("");

    // Interactive confirmation banner
    setImportSuccessBanner({
      cavalo: info.cavalo || "S/ Placa",
      motorista: info.motorista || "Motorista",
      destino: info.destino || "Destino",
      transp: info.transportadora || "Transportadora",
    });

    // Automatically switch to Gerador PGR
    setActiveTab("gerador");
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    const isPaletizado1 =
      sidebarEmbarque1 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF" ||
      sidebarEmbarque1 === "/images/paletizado_lado_direito.png" ||
      sidebarEmbarque1 === "/images/img_0.png";
    const isPaletizado2 =
      sidebarEmbarque2 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF" ||
      sidebarEmbarque2 === "/images/paletizado_lado_direito.png" ||
      sidebarEmbarque2 === "/images/img_0.png";

    const getEmbarqueImgSrc = (imgUrl: string) => {
      if (!imgUrl || imgUrl === "none") return "";
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("data:")) {
        return imgUrl;
      }
      if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${imgUrl}`;
      }
      return imgUrl;
    };

    const alertBg = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#EAB308"
          : "#DC2626";
    const alertTextColor = isGreenOrigem
      ? "#FFFFFF"
      : isPurpleOrigem
        ? "#FFFFFF"
        : isCuiabaOrigem
          ? "#0F172A"
          : "#FFFFFF";
    const iscaHighlightColor = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#D97706"
          : "#DC2626";
    const ladderCellBg = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#EAB308"
          : "#DC2626";
    const ladderCellColor = isGreenOrigem
      ? "#FFFFFF"
      : isPurpleOrigem
        ? "#FFFFFF"
        : isCuiabaOrigem
          ? "#0F172A"
          : "#FFFFFF";

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
                      const bg = cell === "P" ? ladderCellBg : "#FFFFFF";
                      const color = cell === "P" ? ladderCellColor : "#0F172A";
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
        <div style="background-color: ${alertBg}; color: ${alertTextColor}; font-weight: 900; padding: 10px 18px; display: inline-block; margin-bottom: 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 6px; line-height: 1.45; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${(alertaResgate || "FAVOR SE ATENTAR AO RESGATE!").replace(/\n/g, "<br>")}
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
            ${
              !pastePlanilha.trim()
                ? `<div style="margin-top: 8px; display: flex; align-items: center; color: #DC2626; font-weight: 800;">
                    <span style="color: #DC2626; font-weight: 900; margin-right: 10px; font-size: 14px;">•</span> O site das iscas está temporariamente fora do ar.
                  </div>`
                : ""
            }
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
              <th colspan="2" style="background-color: #0F172A; border-bottom: 1px solid #334155; width: 17%; text-align: center; vertical-align: middle; padding: 6px;">
                ${valorCarga ? `
                  <div style="font-size: 8px; color: #94A3B8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1;">VALOR DA CARGA</div>
                  <div style="font-size: 11px; color: #FBBF24; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">${valorCarga}</div>
                ` : ''}
              </th>
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
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 900; font-size: 13px; color: ${iscaHighlightColor};">${isca1}</td>
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
              <td style="border-right: 1px solid #CBD5E1; padding: 10px; font-weight: 900; font-size: 13px; color: ${iscaHighlightColor};">${isca2}</td>
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
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-transform: uppercase; font-weight: 900; color: ${iscaHighlightColor};">${isca2 === "SEM ISCA" ? "" : isca2}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-align: left; padding-left: 12px; font-weight: 600; color: ${!pastePlanilha.trim() && !isca2Endereco ? "#DC2626" : "#334155"};">${isca2 === "SEM ISCA" ? "" : (isca2Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : ""))}</td>
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
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-transform: uppercase; font-weight: 900; color: ${iscaHighlightColor};">${isca1}</td>
            <td style="padding: 9px; border: 1px solid #CBD5E1; text-align: left; padding-left: 12px; font-weight: 600; color: ${!pastePlanilha.trim() && !isca1Endereco ? "#DC2626" : "#334155"};">${isca1Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")}</td>
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
                    <img src="${getEmbarqueImgSrc(sidebarEmbarque1)}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
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
                    <img src="${getEmbarqueImgSrc(sidebarEmbarque2)}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
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

        ${
          isDescartavel
            ? ""
            : `
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0; clear: both;">

        <!-- Rodapé Corporativo -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 6px;">
          <p style="font-size: 11px; font-weight: 900; color: #0F172A; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">GERENCIAMENTO DE RISCO</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.</p>
          <p style="font-size: 11px; color: #334155; margin: 0; font-weight: 500; line-height: 1.5;">Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.</p>
        </div>
        `
        }

      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}${!pastePlanilha.trim() ? "\n· O site das iscas está temporariamente fora do ar." : ""}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${[nfInicio, (numCarretas === 2 && isca2 !== "SEM ISCA" ? nfFim : "")].filter(Boolean).map(v => v.replace(/-/g, '')).join(' ')} | TRANSPORTADORA: ${transportadora}${valorCarga ? ` | VALOR CARGA: ${valorCarga}` : ""}
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
${
  isDescartavel
    ? ""
    : `
-----------------------------------------------------------------------------------------------------------------
GERENCIAMENTO DE RISCO:
• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.
Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.
A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.
Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.
`
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

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-[#fdfaf6] min-h-screen overflow-y-auto no-scrollbar font-sans text-stone-900">
      {/* 1. PREMIUM HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[40px] border border-stone-200/60 shadow-[0_20px_50px_rgba(155,21,38,0.04)]"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-4 rounded-[20px] bg-stone-50 border border-stone-100 text-stone-600 hover:bg-[#9b1526] hover:text-white hover:border-[#9b1526] transition-all shadow-sm active:scale-95 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-[2px] bg-[#9b1526]" />
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-stone-950">
                PGR <span className="text-[#9b1526] not-italic">Control</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-11">
              Gerador de Pré-Alertas e Monitoramento Tático
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION - Premium Minimalist Style */}
        <div className="flex bg-stone-50 p-2 rounded-[28px] border border-stone-100 shadow-inner">
          {[
            { id: "gerador", label: "Gerador", icon: Zap },
            { id: "unidades", label: "Unidades", icon: Package },
            { id: "placas", label: "Placas", icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2.5 px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative group",
                activeTab === tab.id
                  ? "bg-white text-[#9b1526] shadow-[0_10px_25px_rgba(155,21,38,0.1)] border border-stone-100"
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              <tab.icon size={16} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "text-[#9b1526]" : "text-stone-300")} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#9b1526] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        {activeTab === "gerador" && (
          <motion.div
            key="gerador"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* LEFT COLUMN: CONTROL & VEHICLE FORMS */}
            <div className={cn(
              "xl:col-span-8 flex flex-col gap-8 transition-all duration-500",
              preAlertaMode === "maximized" && "xl:col-span-12",
              preAlertaMode === "minimized" && "xl:col-span-1 opacity-20 pointer-events-none scale-95 blur-sm"
            )}>
              {/* FORM CARD 1: FORMULÁRIO DE CONTROLE */}
              <div className="bg-white rounded-[40px] border border-stone-200/60 shadow-[0_20px_50px_rgba(155,21,38,0.03)] overflow-hidden">
                <div className="bg-[#9b1526] px-10 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[14px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em]">Formulário de Controle</h2>
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Definições da Operação</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-widest px-5 py-2.5 rounded-full border border-white/10 transition-all active:scale-95"
                    >
                      <Trash2 size={12} /> Limpar Tudo
                    </button>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Origem Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Origem</label>
                    <div className="relative group">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#9b1526] transition-colors" />
                      <select
                        value={origem}
                        onChange={(e) => setOrigem(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-[20px] pl-11 pr-4 py-4 text-[12px] font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#9b1526]/20 focus:border-[#9b1526] transition-all appearance-none cursor-pointer hover:bg-stone-100/50"
                      >
                        {ORIGEM_OPCOES.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destino Final */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Destino Final</label>
                    <div className="relative group">
                      <Navigation size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#9b1526] transition-colors" />
                      <input
                        type="text"
                        value={destino}
                        onChange={(e) => setDestino(e.target.value.toUpperCase())}
                        className="w-full bg-stone-50 border border-stone-100 rounded-[20px] pl-11 pr-4 py-4 text-[12px] font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#9b1526]/20 focus:border-[#9b1526] transition-all hover:bg-stone-100/50"
                        placeholder="EX: RECIFE/PE"
                      />
                    </div>
                  </div>

                  {/* Rota (Auto-filled or manual) */}
                  <div className="space-y-3 lg:col-span-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Rota Operacional</label>
                    <div className="relative group">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#9b1526] transition-colors" />
                      <input
                        type="text"
                        value={rota1}
                        onChange={(e) => setRota1(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-[20px] pl-11 pr-4 py-4 text-[12px] font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#9b1526]/20 focus:border-[#9b1526] transition-all hover:bg-stone-100/50"
                        placeholder="Auto-preenchida ao importar"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM CARD 2: VEÍCULO & CARGA */}
              <div className="bg-white rounded-[40px] border border-stone-200/60 shadow-[0_20px_50px_rgba(155,21,38,0.03)] overflow-hidden">
                <div className="bg-stone-900 px-10 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[14px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h2 className="text-[13px] font-black text-white uppercase tracking-[0.2em]">Veículo & Carga</h2>
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Informações de Embarque</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClearVeiculo}
                    className="text-[9px] font-black text-stone-400 hover:text-[#9b1526] uppercase tracking-[0.3em] transition-colors"
                  >
                    Limpar Seção
                  </button>
                </div>

                <div className="p-10 flex flex-col gap-10">
                  {/* Plates Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Placa Cavalo</label>
                      <input
                        type="text"
                        value={cavalo}
                        onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                        className="w-full bg-[#fdfaf6] border border-stone-200 rounded-[24px] px-6 py-4 text-2xl font-black text-center tracking-tighter text-stone-950 focus:ring-4 focus:ring-[#9b1526]/5 focus:border-[#9b1526] transition-all outline-none shadow-sm"
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Placa Carreta 1</label>
                      <input
                        type="text"
                        value={carreta1}
                        onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                        className="w-full bg-[#fdfaf6] border border-stone-200 rounded-[24px] px-6 py-4 text-2xl font-black text-center tracking-tighter text-stone-950 focus:ring-4 focus:ring-[#9b1526]/5 focus:border-[#9b1526] transition-all outline-none shadow-sm"
                        placeholder="XYZ-5678"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Placa Carreta 2</label>
                      <input
                        type="text"
                        value={carreta2}
                        disabled={numCarretas === 1}
                        onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                        className="w-full bg-[#fdfaf6] border border-stone-200 rounded-[24px] px-6 py-4 text-2xl font-black text-center tracking-tighter text-stone-950 focus:ring-4 focus:ring-[#9b1526]/5 focus:border-[#9b1526] transition-all outline-none shadow-sm disabled:opacity-30 disabled:grayscale"
                        placeholder={numCarretas === 1 ? "INDISPONÍVEL" : "KJL-9012"}
                      />
                    </div>
                  </div>

                  {/* NF & Values Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block pl-1">NF Início</label>
                      <input
                        type="text"
                        value={nfInicio}
                        onChange={(e) => setNfInicio(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3.5 text-xs font-black text-stone-900 focus:border-[#9b1526] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block pl-1">NF Fim</label>
                      <input
                        type="text"
                        value={nfFim}
                        onChange={(e) => setNfFim(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3.5 text-xs font-black text-stone-900 focus:border-[#9b1526] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#dfb15b] uppercase tracking-[0.2em] block pl-1">Valor da Carga</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#dfb15b]" />
                        <input
                          type="text"
                          value={valorCarga}
                          onChange={(e) => setValorCarga(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-10 pr-5 py-3.5 text-xs font-black text-stone-900 focus:border-[#dfb15b] outline-none transition-all"
                          placeholder="R$ 0,00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] block pl-1">Motorista</label>
                      <input
                        type="text"
                        value={motorista}
                        onChange={(e) => setMotorista(e.target.value.toUpperCase())}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3.5 text-xs font-black text-stone-900 focus:border-[#9b1526] outline-none transition-all truncate"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PRE-ALERTA PREVIEW */}
            <div className={cn(
              "xl:col-span-4 flex flex-col gap-6 transition-all duration-500",
              preAlertaMode === "maximized" && "xl:col-span-12",
              preAlertaMode === "minimized" && "xl:col-span-11"
            )}>
              <div className="sticky top-6">
                <div className="bg-white rounded-[40px] border border-stone-200/60 shadow-[0_30px_60px_-15px_rgba(155,21,38,0.1)] overflow-hidden">
                  <div className="bg-stone-50 px-8 py-5 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#9b1526] animate-pulse" />
                      <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Pré-Alerta Preview</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setPreAlertaMode(preAlertaMode === "maximized" ? "normal" : "maximized")}
                        className="p-2 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
                        title={preAlertaMode === "maximized" ? "Reduzir" : "Expandir"}
                      >
                        {preAlertaMode === "maximized" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* EMAIL SUBJECT BOX */}
                    <div className="mb-8 p-6 bg-stone-50 rounded-[24px] border border-stone-100 shadow-inner group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Assunto do E-mail</span>
                        <button
                          onClick={() => {
                            const subject = `PRE ALERTA DE ISCA EMBARCADA ${dataEnviada} - ${cavalo} - ${destino}`;
                            navigator.clipboard.writeText(subject);
                            setCopiedAssunto(true);
                            setTimeout(() => setCopiedAssunto(false), 2000);
                          }}
                          className="flex items-center gap-2 text-[9px] font-black text-[#9b1526] hover:text-[#831220] transition-colors"
                        >
                          {copiedAssunto ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                          {copiedAssunto ? "COPIADO" : "COPIAR"}
                        </button>
                      </div>
                      <p className="text-[13px] font-black text-stone-950 leading-tight uppercase tracking-tight">
                        PRE ALERTA DE ISCA EMBARCADA {dataEnviada} - {cavalo || "___"} - {destino || "___"}
                      </p>
                    </div>

                    {/* EMAIL CONTENT PREVIEW */}
                    <div className="bg-[#fcfbf9] border border-stone-200 rounded-[32px] p-8 shadow-sm overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                          onClick={handleCopyToEmail}
                          className="p-3 bg-[#9b1526] text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      
                      <div className="font-sans text-[12px] leading-relaxed text-stone-800">
                        <div className="mb-4 font-black text-stone-950 text-sm">{saudacao}</div>
                        
                        <div className={cn(
                          "inline-block px-4 py-2 rounded-xl mb-6 font-black text-[10px] uppercase tracking-wider text-white shadow-md",
                          isCuiabaOrigem ? "bg-amber-500" : "bg-[#9b1526]"
                        )}>
                          {alertaResgate}
                        </div>

                        <div className="space-y-3 mb-8">
                          <p className="font-black text-stone-950 text-[11px] uppercase tracking-widest">{infoAbaixo}</p>
                          <div className="pl-4 border-l-4 border-stone-200 space-y-2">
                            <p className="font-bold text-stone-700 italic">• {rota1}</p>
                            <p className="font-bold text-stone-700 italic">• {instrucao1}</p>
                          </div>
                        </div>

                        {/* DATA TABLE VISUALIZER */}
                        <div className="border border-stone-200 rounded-[20px] overflow-hidden shadow-sm bg-white mb-6">
                          <div className="grid grid-cols-2 bg-stone-900 text-white p-3 border-b border-stone-800">
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Motorista</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Cavalo</span>
                          </div>
                          <div className="grid grid-cols-2 p-3 border-b border-stone-100">
                            <span className="text-[11px] font-black truncate">{motorista || "---"}</span>
                            <span className="text-[11px] font-black text-[#9b1526]">{cavalo || "---"}</span>
                          </div>
                          <div className="grid grid-cols-3 bg-stone-50 p-2 text-[9px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100">
                            <span>Isca</span>
                            <span>Produto</span>
                            <span>Destino</span>
                          </div>
                          <div className="grid grid-cols-3 p-3">
                            <span className="text-[10px] font-black text-[#9b1526]">{isca1 || "---"}</span>
                            <span className="text-[10px] font-black">{produto1 || "---"}</span>
                            <span className="text-[10px] font-black">{destino || "---"}</span>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyToEmail}
                          className="w-full py-4 bg-stone-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Mail size={16} />}
                          {copied ? "COPIADO PARA O E-MAIL" : "COPIAR PARA E-MAIL"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "unidades" && (
          <motion.div
            key="unidades"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-8"
          >
            <div className="bg-white rounded-[40px] border border-stone-200/60 shadow-[0_20px_50px_rgba(155,21,38,0.03)] p-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#9b1526] flex items-center justify-center text-white">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-stone-950">Central de Unidades</h2>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Processamento de Dados por Regional</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block pl-1">Área de Transferência</label>
                  <textarea
                    value={unidadesPastedText}
                    onChange={(e) => setUnidadesPastedText(e.target.value)}
                    className="w-full h-64 bg-stone-50 border border-stone-100 rounded-[32px] p-8 text-xs font-mono text-stone-700 outline-none focus:ring-4 focus:ring-[#9b1526]/5 focus:border-[#9b1526] transition-all resize-none shadow-inner"
                    placeholder="Cole aqui os dados copiados da planilha de unidades..."
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handlePasteClipboardUnidades}
                      className="flex-1 py-5 bg-stone-900 hover:bg-black text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                    >
                      <ClipboardPaste size={16} /> Colar Dados
                    </button>
                    <button
                      onClick={() => setUnidadesPastedText("")}
                      className="px-10 py-5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="bg-[#fcfbf9] rounded-[32px] border border-stone-200 p-8 flex flex-col gap-8">
                  <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-4">Resultado do Processamento</h3>
                  
                  {parsedUnidades.carretas.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                          <span className="text-[9px] font-black text-stone-400 uppercase block mb-1">Motorista</span>
                          <p className="text-sm font-black text-stone-900 truncate uppercase">{parsedUnidades.motorista || "Não detectado"}</p>
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                          <span className="text-[9px] font-black text-stone-400 uppercase block mb-1">Cavalo</span>
                          <p className="text-sm font-black text-[#9b1526] uppercase">{parsedUnidades.cavalo || "Não detectado"}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <span className="text-[9px] font-black text-stone-400 uppercase block pl-1">Carretas ({parsedUnidades.carretas.length})</span>
                         {parsedUnidades.carretas.map((c, i) => (
                           <div key={i} className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 font-black text-[10px]">{i+1}</div>
                               <div>
                                 <p className="text-xs font-black text-stone-900">{c.carreta}</p>
                                 <p className="text-[10px] font-bold text-stone-400 uppercase">{c.isca}</p>
                               </div>
                             </div>
                             <span className="text-[10px] font-black text-[#9b1526] bg-[#9b1526]/5 px-3 py-1 rounded-full">{c.produto}</span>
                           </div>
                         ))}
                      </div>

                      <button
                        onClick={() => handleImportUnidadeData(parsedUnidades)}
                        className="w-full py-5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(155,21,38,0.2)] active:scale-95 mt-4"
                      >
                        Importar para o Gerador →
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-300 gap-4">
                      <Search size={48} strokeWidth={1.5} />
                      <p className="text-xs font-bold uppercase tracking-widest text-center max-w-[200px]">Nenhum dado processado. Cole o conteúdo da planilha ao lado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "placas" && (
          <motion.div
            key="placas"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-8"
          >
             <div className="bg-white rounded-[40px] border border-stone-200/60 shadow-[0_20px_50px_rgba(155,21,38,0.03)] p-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#9b1526] flex items-center justify-center text-white">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-stone-950">Monitoramento Regional</h2>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Gestão de Iscas e Frota em Tempo Real</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input
                      type="text"
                      value={placasFilter}
                      onChange={(e) => setPlacasFilter(e.target.value)}
                      className="bg-stone-50 border border-stone-100 rounded-full pl-11 pr-6 py-3 text-xs font-bold text-stone-900 outline-none focus:ring-4 focus:ring-[#9b1526]/5 focus:border-[#9b1526] transition-all w-72 shadow-inner"
                      placeholder="Pesquisar placa ou condutor..."
                    />
                  </div>
                  <button
                    onClick={handlePasteClipboardPlacas}
                    className="px-8 py-3.5 bg-stone-900 hover:bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    Colar Dados
                  </button>
                </div>
              </div>

              {parsedPlacas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="p-6 bg-[#fdfaf6] rounded-[24px] border border-stone-100 flex flex-col">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Detectado</span>
                    <span className="text-3xl font-black text-stone-950 tracking-tighter">{santaLuziaStats.total}</span>
                  </div>
                  <div className="p-6 bg-[#fdfaf6] rounded-[24px] border border-stone-100 flex flex-col">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Bitrems/Rodotrems</span>
                    <span className="text-3xl font-black text-[#9b1526] tracking-tighter">{santaLuziaStats.biTrems}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPlacas.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -6 }}
                    className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-sm hover:shadow-[0_20px_50px_rgba(155,21,38,0.08)] transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => handleImportPlacaItem(item)}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Truck size={64} className="text-[#9b1526] rotate-12" />
                    </div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <span className="px-4 py-1.5 bg-[#9b1526]/5 text-[#9b1526] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#9b1526]/10">
                        {item.transportador || "FROTA"}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-stone-400 uppercase tracking-widest">
                        <MapPin size={12} /> {item.destino || "---"}
                      </div>
                    </div>

                    <div className="mb-6 relative z-10">
                      <h4 className="text-lg font-black text-stone-950 tracking-tighter uppercase mb-1 truncate leading-tight">{item.condutor || "CONDUTOR"}</h4>
                      <div className="flex items-center gap-3">
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Placa:</p>
                         <span className="text-sm font-black text-[#9b1526] tracking-widest">{item.cavalo}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-stone-50 relative z-10">
                      <div className="flex gap-2">
                        {item.carreta1 && <span className="text-[9px] font-black bg-stone-50 px-3 py-1 rounded-lg text-stone-600 border border-stone-100">{item.carreta1}</span>}
                        {item.carreta2 && <span className="text-[9px] font-black bg-amber-50 px-3 py-1 rounded-lg text-amber-600 border border-amber-100">{item.carreta2}</span>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-[#9b1526] transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredPlacas.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-stone-300 gap-4">
                  <Activity size={48} strokeWidth={1} />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMPORT CONFIRMATION BANNER */}
      <AnimatePresence>
        {importSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4"
          >
            <div className="bg-stone-900 text-white rounded-[32px] p-6 shadow-[0_30px_60px_rgba(155,21,38,0.2)] border border-white/10 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-0.5">Dados Integrados</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                    {importSuccessBanner.motorista} • {importSuccessBanner.cavalo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportSuccessBanner(null)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
