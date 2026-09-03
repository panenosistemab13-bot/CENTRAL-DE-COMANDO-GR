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
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";


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
  { value: "/images/paletizado_lado_direito.png", label: "Paletizado Lado Direito" },
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
  tecnologia?: string;
  data?: string;
  status?: string;
  cpf?: string;
  telefone?: string;
  rawRowsCount: number;
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

export const SAMPLE_PLACAS_SHEET_DATA = `N°\tORIGEM\tDIA\tDATA\tCONTATO WHATS\tHORA LIBERADO\tSTATUS\tMODELO CARRETA\tMODELO CAVALO\tPRÉ-CHECKLIST\tDESTINO\tTRANSPORTADOR\tCAVALO\tCARRETA\tN° PALLETS\tPBT (TON)\tNF\tCATEGORIA\tTECNOLOGIA\tCONDUTOR\tCPF\tRG / SSP\tCNH\tTELEFONE
1\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tEKP0L77\t21\t23\t44271\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287
2\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tSEB8F09\t21\t23\t44272\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287
3\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\tX\t05:06:51\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tREC. SÍTIO NOVO\tTORNADO\tTDF8G11\tRFV0E16\t28\t30\t53512\tFROTA\tONIXSAT\tCLEUSMAR M DA SILVA\t716.870.495-87\t64188941 SSP RJ\t01256784562\t(31) 97134-9810
4\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\t29.08.59\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tGRAVATAÍ\tTENNA\tUVP-9C05\t---\t28\t30\t53513\tFROTA\tSASCAR\tFRANCISCO CLAWLISON DA SILVA\t056.888.895-70\t49258921 SSP MG\t01529475185\t(31) 98931-1558
5\tSANTA LUZIA/MG\tsábado\t29/08/2024\tX\t08:19:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tNATAL\t3C\tUVP-9C05\tUVP0B29\t21\t17\t44273\tFROTA 3C\tSASCAR\tEMMANUEL RICARDO DE LIMA\t069.652.001-11\t18951234MG1\t01648291754\t(31) 99812-4411
6\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:07:00\t09:50:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tSUMARÉ\tTENNA\tRMK5E77\tSDQ5F71\t28\t30\t53514\tFROTA\tSIGHRA\tJOSE MORAIS DE SOUSA\t906.750.185-00\t092551200 SSP BA\t01644257107\t(71) 71 99219-2756
7\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:55:00\t09:55:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tTFD8E27\tSDQ5F71\t28\t30\t53515\tFROTA\tSIGHRA\tALEXANDRE MACHADO COELHO\t123.056.347-09\t22104523 DET RJ\t02074369037\t(21) 21 98908-0026
8\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:10:00\t12:14:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRFM1J37\tKEM4C01\t28\t30\t53516\tFROTA\tSIGHRA\tMARCOS DE MELLO GODOY\t121.142.296-30\t11467412 SSP SP\t02089207039\t(11) 11 98319-3344
9\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:06:00\t12:35:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBW1E02\tKEM4C01\t28\t30\t53517\tFROTA\tSIGHRA\tDIEGO CARNEIRO\t127.355.829-06\t18432651 SSP SP\t01633596188\t(11) 11 98265-7607
10\tSANTA LUZIA/MG\tsábado\t29/08/2024\t12:26:00\t12:49:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBG7H83\tMSV1J96\t28\t30\t53518\tFROTA\tSIGHRA\tMARCOS GABRIEL OLIVEIRA\t135.097.437-84\t24531872 DET RJ\t04402638459\t(21) 21 98380-0010
11\tSANTA LUZIA/MG\tsábado\t29/08/2024\t13:15:00\t14:58:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRNF6D84\tMSV1J96\t28\t30\t53519\tFROTA\tSIGHRA\tANTONILSON CAMPANHO DE SOUZA LACERDA\t126.658.877-06\t12934812 DET RJ\t03082531065\t(21) 21 99812-0535
12\tSANTA LUZIA/MG\tsábado\t29/08/2024\t14:28:00\t15:19:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSAZ6E84\tRFE2J49\t28\t30\t53520\tFROTA\tSIGHRA\tBONIFACIO BARBOSA DA SILVA\t052.352.766-17\t08129812 SSP AL\t07002317398\t(82) 82 99600-1120
13\tSANTA LUZIA/MG\tsábado\t29/08/2024\t15:05:00\t16:43:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSAY2C81\tRFE2J49\t28\t30\t53521\tFROTA\tSIGHRA\tROBERTO CARLOS PORTUGAL OLIVEIRA\t082.057.457-25\t12948603 DET RJ\t00510251776\t(21) 21 99846-8007
14\tSANTA LUZIA/MG\tdomingo\t29/08/2024\tX\t09:05:36\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRVP9E38\tMDL9F97\t28\t30\t53522\tFROTA\tSIGHRA\tDERLEI PEREIRA DA SILVA\t082.739.561-16\t2856634 SDS PB\t01438973575\t(83) 83 99880-9008`;

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
  // Col 1: ORIGEM, Col 10: DESTINO, Col 11: TRANSPORTADOR, Col 12: CAVALO, Col 13: CARRETA, Col 16: NF, Col 18: TECNOLOGIA, Col 19: CONDUTOR
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

          if (!iscaVal && (/^R\d+/i.test(pClean) || /^30D/i.test(pClean) || pUpper.includes("ISCA"))) {
            // Coluna 2: Número da Isca
            iscaVal = pClean;
          } else if (!umaVal && /^\d{6,14}$/.test(pClean)) {
            // Coluna 4: U.M.A (código numérico)
            umaVal = pClean;
          } else if (!nfVal && (/^\d{4,8}$/.test(pClean) || pUpper.startsWith("NF"))) {
            // Coluna 5: NF
            nfVal = pClean.replace(/^NF\s*:?\s*/i, "");
          } else {
            // Coluna 3: Produto / Descrição / Posição
            if (produtoVal) produtoVal += " - " + part.trim();
            else produtoVal = part.trim();
          }
        });

        result.carretas.push({
          carreta: carretaPlate,
          isca: iscaVal,
          produto: produtoVal,
          uma: umaVal,
          nf: nfVal,
          esquema: produtoVal,
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

  // --- UNIDADES TAB STATE ---
  const [unidadesPastedText, setUnidadesPastedText] = useState("");
  const parsedUnidades = useMemo(() => {
    return parseUnidadesText(unidadesPastedText);
  }, [unidadesPastedText]);

  // --- PLACAS TAB STATE ---
  const [placasPastedData, setPlacasPastedData] = useState("");
  const [placasFilter, setPlacasFilter] = useState("");
  const [importSuccessBanner, setImportSuccessBanner] = useState<{
    cavalo: string;
    motorista: string;
    destino: string;
    transp: string;
  } | null>(null);

  const parsedPlacas = useMemo(() => {
    return parsePlacasData(placasPastedData);
  }, [placasPastedData]);

  const filteredPlacas = useMemo(() => {
    if (!placasFilter.trim()) return parsedPlacas;
    const q = placasFilter.toLowerCase();
    return parsedPlacas.filter(
      (p) =>
        p.cavalo.toLowerCase().includes(q) ||
        p.carreta1.toLowerCase().includes(q) ||
        p.carreta2.toLowerCase().includes(q) ||
        p.condutor.toLowerCase().includes(q) ||
        p.transportador.toLowerCase().includes(q) ||
        p.destino.toLowerCase().includes(q)
    );
  }, [parsedPlacas, placasFilter]);
  // -------------------------

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
  const [copiedIscasSpace, setCopiedIscasSpace] = useState(false);

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

    if (item.nf) {
      const nfClean = item.nf.split("/")[0].trim().replace(/\D/g, "");
      if (nfClean) {
        setNfInicio(formatUMA(nfClean));
      }
      const nfParts = item.nf.split("/");
      if (nfParts.length > 1) {
        const nf2Clean = nfParts[1].trim().replace(/\D/g, "");
        if (nf2Clean) setNfFim(formatUMA(nf2Clean));
      }
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
    if (info.cavalo) setCavalo(info.cavalo);

    if (info.carretas.length > 0) {
      // Carreta 1
      const c1 = info.carretas[0];
      if (c1.carreta) setCarreta1(c1.carreta);
      if (c1.isca) {
        setIsca1(c1.isca);
        handleIsca1Change(c1.isca);
      }
      if (c1.uma) setUma1(formatUMA(c1.uma));
      if (c1.nf) setNfInicio(formatUMA(c1.nf));

      if (c1.esquema) {
        const upperE = c1.esquema.toUpperCase();
        if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
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
        if (c2.uma) setUma2(formatUMA(c2.uma));
        if (c2.nf) setNfFim(formatUMA(c2.nf));

        if (c2.esquema) {
          const upperE = c2.esquema.toUpperCase();
          if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
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
      const { rota, destinoFinal } = findBestMatchingRoute(info.destino, origem);
      setDestino(destinoFinal);
      setRota1(rota);
    }

    if (info.tecnologia) {
      setSidebarTecnologia(info.tecnologia);
    }

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
      sidebarEmbarque1?.toLowerCase().includes("paletizado");
    const isPaletizado2 =
      sidebarEmbarque2 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF" ||
      sidebarEmbarque2 === "/images/paletizado_lado_direito.png" ||
      sidebarEmbarque2?.toLowerCase().includes("paletizado");

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

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FA] text-[#1E293B] overflow-hidden font-sans" style={{ zoom: 0.85 }}>
      {/* Top Header / Quick Tabs Bar */}
      <header className="bg-white border-b border-[#D1E1EB] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B] animate-pulse inline-block"></span>
            <h1 className="text-sm font-black tracking-wider text-[#1E293B] uppercase font-sans flex items-center gap-2">
              <Sliders size={16} className="text-[#64748B]" />
              CENTRAL DE CONTROLE PGR
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "gerador"
                ? "bg-[#1E293B] text-white shadow-md"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60"
            )}
          >
            <Sliders size={14} />
            <span>Gerador PGR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unidades")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative",
              activeTab === "unidades"
                ? "bg-blue-600 text-white shadow-md"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60"
            )}
          >
            <Package size={14} />
            <span>Unidades</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("placas")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative",
              activeTab === "placas"
                ? "bg-[#B32025] text-white shadow-md"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60"
            )}
          >
            <Truck size={14} />
            <span>Placas</span>
            {parsedPlacas.length > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-black",
                  activeTab === "placas"
                    ? "bg-white text-[#B32025]"
                    : "bg-[#B32025] text-white"
                )}
              >
                {parsedPlacas.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-canvas">
        {/* Interactive Toast / Banner when vehicle is imported */}
        {importSuccessBanner && (
          <div className="max-w-[100rem] mx-auto w-full mb-4">
            <div className="bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Veículo Importado com Sucesso!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Cavalo: <strong>{importSuccessBanner.cavalo}</strong> | Motorista:{" "}
                    <strong>{importSuccessBanner.motorista}</strong> | Transportadora:{" "}
                    <strong>{importSuccessBanner.transp}</strong> | Destino:{" "}
                    <strong>{importSuccessBanner.destino}</strong> enviados para Gerador, Formulário e Veículo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100/70 transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Fechar
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Placas */}
        {activeTab === "placas" && (
          <div className="flex flex-col gap-6 max-w-[100rem] mx-auto w-full animate-fade-in">
            {/* Main Card */}
            <div className="bg-white rounded-[2rem] border border-[#D1E1EB] shadow-md p-6 sm:p-8 flex flex-col gap-6">
              {/* Header info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-[#B32025] text-white p-3 rounded-2xl shadow-md border border-red-800">
                    <Truck size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1E293B] uppercase tracking-tight flex items-center gap-2">
                      Importação de Placas & Viagens
                    </h2>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">
                      Cole as informações da planilha (Google Sheets / Excel) para extrair automaticamente e enviar aos formulários de controle.
                    </p>
                  </div>
                </div>

                {/* Target Columns Badges */}
                <div className="flex flex-wrap items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] p-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-[#64748B] mr-1">
                    Colunas Integradas:
                  </span>
                  <span className="bg-[#1E293B] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    TRANSPORTADOR
                  </span>
                  <span className="bg-[#1E293B] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    CONDUTOR
                  </span>
                  <span className="bg-[#B32025] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    CAVALO
                  </span>
                  <span className="bg-[#B32025] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    CARRETA
                  </span>
                  <span className="bg-[#1E293B] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    DESTINO
                  </span>
                </div>
              </div>

              {/* Paste Area & Controls */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1E293B] flex items-center gap-1.5">
                    <FileSpreadsheet size={16} className="text-[#B32025]" />
                    Cole aqui os dados da tabela (Ctrl + V):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlacasPastedData(SAMPLE_PLACAS_SHEET_DATA)}
                      className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Carrega os dados de exemplo da planilha anexa"
                    >
                      <Sparkles size={13} className="text-[#B32025]" />
                      Carregar Exemplo
                    </button>
                    {placasPastedData && (
                      <button
                        type="button"
                        onClick={() => setPlacasPastedData("")}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={placasPastedData}
                  onChange={(e) => setPlacasPastedData(e.target.value)}
                  placeholder="Cole aqui as linhas copiadas da planilha Google Sheets ou Excel (com ou sem cabeçalho)..."
                  className="w-full h-36 bg-[#F8FAFC] border-2 border-[#CBD5E1] focus:border-[#B32025] rounded-xl p-3.5 text-xs font-mono text-[#0F172A] outline-none transition-all placeholder:text-slate-400 focus:bg-white shadow-inner resize-y"
                />
              </div>

              {/* Results Grid & Filter */}
              {parsedPlacas.length > 0 ? (
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#1E293B] tracking-wider">
                        Veículos Identificados:
                      </span>
                      <span className="bg-[#B32025] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                        {filteredPlacas.length} de {parsedPlacas.length}
                      </span>
                    </div>

                    {/* Search Filter */}
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="text"
                        value={placasFilter}
                        onChange={(e) => setPlacasFilter(e.target.value)}
                        placeholder="Buscar por placa, condutor, destino..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#B32025]"
                      />
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPlacas.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-[#E2E8F0] hover:border-[#B32025] rounded-2xl p-4.5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        {/* Top plate badges */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-[#0F172A] text-white text-xs font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                <Truck size={13} className="text-red-400" />
                                {item.cavalo || "S/ CAVALO"}
                              </span>
                              {item.carreta1 && (
                                <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-black uppercase px-2 py-1 rounded-lg">
                                  CR 1: {item.carreta1}
                                </span>
                              )}
                              {item.carreta2 && (
                                <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-black uppercase px-2 py-1 rounded-lg">
                                  CR 2: {item.carreta2}
                                </span>
                              )}
                            </div>
                            {item.rawRowsCount > 1 && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                {item.rawRowsCount} Linhas
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex flex-col gap-1.5 text-xs text-[#334155]">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                Condutor:
                              </span>
                              <span className="font-bold text-[#0F172A] text-right truncate">
                                {item.condutor || "NÃO INFORMADO"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                Transportador:
                              </span>
                              <span className="font-bold text-[#0F172A] text-right truncate">
                                {item.transportador || "NÃO INFORMADO"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                Destino:
                              </span>
                              <span className="font-black text-red-600 text-right truncate flex items-center justify-end gap-1">
                                <MapPin size={11} className="shrink-0" />
                                {item.destino || "NÃO INFORMADO"}
                              </span>
                            </div>
                            {item.origem && (
                              <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200">
                                <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                  Origem:
                                </span>
                                <span className="font-semibold text-slate-600 text-right truncate">
                                  {item.origem}
                                </span>
                              </div>
                            )}
                            {item.tecnologia && (
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                  Tecnologia:
                                </span>
                                <span className="font-semibold text-slate-600 text-right truncate">
                                  {item.tecnologia}
                                </span>
                              </div>
                            )}
                            {item.nf && (
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-[#94A3B8] shrink-0 w-24">
                                  NF:
                                </span>
                                <span className="font-semibold text-slate-600 text-right truncate">
                                  {item.nf}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action button */}
                        <button
                          type="button"
                          onClick={() => handleImportPlacaItem(item)}
                          className="w-full py-2.5 bg-white border-2 border-[#CBD5E1] hover:border-[#B32025] text-[#1E293B] hover:text-white hover:bg-[#B32025] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95 group-hover:border-[#B32025]"
                        >
                          <span>Importar para Controle</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                    <Truck size={24} />
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#1E293B] tracking-wider">
                    Nenhum veículo carregado no momento
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md">
                    Copie as linhas da planilha com as colunas <strong>TRANSPORTADOR, CONDUTOR, CAVALO, CARRETA e DESTINO</strong> e cole no campo acima, ou clique em <strong>"Carregar Exemplo"</strong> para testar.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: Unidades */}
        {activeTab === "unidades" && (
          <div className="flex flex-col gap-6 max-w-[100rem] mx-auto w-full animate-fade-in">
            <div className="bg-white rounded-[2rem] border border-[#D1E1EB] shadow-md p-6 sm:p-8 flex flex-col gap-6">
              {/* Header info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-blue-700 text-white p-3 rounded-2xl shadow-md border border-blue-900">
                    <Package size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1E293B] uppercase tracking-tight flex items-center gap-2">
                      Unidades - Importador de Embarque
                    </h2>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">
                      Copie e cole as informações do embarque recebidas da unidade para preencher automaticamente o Gerador PGR e criar o Pré-Alerta.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnidadesPastedText(SAMPLE_UNIDADES_TEXT)}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Carrega os dados de exemplo da mensagem recebida"
                  >
                    <Sparkles size={14} className="text-blue-600" />
                    Carregar Exemplo (Imagem Anexa)
                  </button>
                  {unidadesPastedText && (
                    <button
                      type="button"
                      onClick={() => setUnidadesPastedText("")}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Banner explaining the 5 required columns */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-300">
                    <Layers size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-blue-300 block">
                      Estrutura das Colunas Recomendada
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Placa da Carreta &nbsp;➔&nbsp; Número da Isca &nbsp;➔&nbsp; Produto &nbsp;➔&nbsp; U.M.A &nbsp;➔&nbsp; NF
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Suporta separação por hífen (-), tabulação ou vírgulas.
                </div>
              </div>

              {/* Paste Area */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-wider text-[#1E293B] flex items-center gap-1.5">
                  <FileText size={16} className="text-blue-600" />
                  Cole aqui o texto do embarque recebido da Unidade (Ctrl + V):
                </label>
                <textarea
                  value={unidadesPastedText}
                  onChange={(e) => setUnidadesPastedText(e.target.value)}
                  placeholder={`Cole aqui as informações da Unidade...\n\nSiga a ordem das colunas:\nPlaca da Carreta - Número da Isca - Produto - U.M.A - NF\n\nExemplo 1:\nRBV2C89 - R100001239 - LADO DIREITO SUPERIOR BATIDO - 12211016 - 305124\n\nExemplo 2:\nData do embarque: 02/09/2026\nPlaca do cavalo: RFX9E81\nPlaca do Baú: RBV2C89 - R100001239 - 12211016 - LADO DIREITO SUPERIOR - BATIDO\nNF : 305124\nDestino: CAMPO GRANDE - MS\nTransportadora: Ledfran\nMotorista: Diego Pereira`}
                  className="w-full h-48 bg-[#F8FAFC] border-2 border-[#CBD5E1] focus:border-blue-600 rounded-2xl p-4 text-xs font-mono text-[#0F172A] outline-none transition-all placeholder:text-slate-400 focus:bg-white shadow-inner resize-y leading-relaxed"
                />
              </div>

              {/* Live Preview of Parsed Data */}
              {parsedUnidades.cavalo || parsedUnidades.carretas.length > 0 || parsedUnidades.destino || parsedUnidades.motorista ? (
                <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                    <span className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-blue-600" />
                      Dados Identificados nas Colunas
                    </span>
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Pronto para importar
                    </span>
                  </div>

                  {/* Summary Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white border border-blue-200 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Placa Cavalo</span>
                      <span className="font-mono font-black text-sm text-blue-950">
                        {parsedUnidades.cavalo || "Não especificado"}
                      </span>
                    </div>

                    <div className="bg-white border border-blue-200 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Motorista</span>
                      <span className="font-bold text-xs text-blue-950 truncate">
                        {parsedUnidades.motorista || "Não especificado"}
                      </span>
                    </div>

                    <div className="bg-white border border-blue-200 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Transportadora</span>
                      <span className="font-bold text-xs text-blue-950 truncate">
                        {parsedUnidades.transportadora || "Não especificada"}
                      </span>
                    </div>

                    <div className="bg-white border border-blue-200 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Destino</span>
                      <span className="font-bold text-xs text-blue-950 truncate">
                        {parsedUnidades.destino || "Não especificado"}
                      </span>
                    </div>
                  </div>

                  {/* Carretas List with 5 Columns explicitly labeled */}
                  {parsedUnidades.carretas.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      <span className="text-[11px] font-black uppercase text-blue-950 tracking-wider flex items-center justify-between">
                        <span>Carretas / Baús Identificados ({parsedUnidades.carretas.length}):</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                          Mapeamento automático das 5 colunas
                        </span>
                      </span>
                      <div className="grid grid-cols-1 gap-3">
                        {parsedUnidades.carretas.map((cr, idx) => (
                          <div key={idx} className="bg-white border-2 border-blue-200 p-4 rounded-xl flex flex-col gap-3 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="bg-blue-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg uppercase flex items-center gap-1.5">
                                <Truck size={14} />
                                Carreta {idx + 1}: {cr.carreta || "S/ Placa"}
                              </span>
                              <span className="text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                                NF: <span className="font-mono text-blue-700">{cr.nf || "---"}</span>
                              </span>
                            </div>

                            {/* 5 Columns Display Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Placa Carreta</span>
                                <span className="font-mono font-black text-slate-900 text-xs">{cr.carreta || "---"}</span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Número da Isca</span>
                                <span className="font-mono font-black text-red-600 text-xs">{cr.isca || "---"}</span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Produto / Posição</span>
                                <span className="font-bold text-slate-900 text-xs truncate block" title={cr.produto}>
                                  {cr.produto || "---"}
                                </span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">4. U.M.A</span>
                                <span className="font-mono font-black text-blue-900 text-xs">{cr.uma || "---"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Import Button */}
                  <button
                    type="button"
                    onClick={() => handleImportUnidadeData(parsedUnidades)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 mt-2"
                  >
                    <Send size={16} />
                    <span>IMPORTAR PARA GERADOR PGR E CRIAR PRÉ-ALERTA COMPLETO</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <Package size={24} />
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#1E293B] tracking-wider">
                    Aguardando colagem de dados da Unidade
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md">
                    Cole as informações da mensagem da unidade na caixa acima ou clique em <strong>"Carregar Exemplo (Imagem Anexa)"</strong> para testar a extração automática.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: Gerador PGR Workspace */}
        {activeTab === "gerador" && (
          <div className="flex flex-col gap-6 max-w-[100rem] mx-auto w-full animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px_310px] gap-6 items-start">
        {/* LEFT AREA: Template Generator */}
        <div className="col-span-1 xl:col-span-1 flex flex-col">
          <div className="flex-1 rounded-[2rem] bg-white border-2 border-[#3A2414]/20 shadow-2xl relative overflow-hidden flex flex-col p-6 sm:p-8">

          {/* Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#3A2414]/10 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#B32025] text-white p-3 rounded-2xl shadow-md border border-[#3A2414]/20">
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3A2414] uppercase tracking-tight">
                  Gerador de Controle PGR
                </h2>
                <p className="text-[10px] text-[#3A2414]/70 font-black uppercase tracking-widest mt-0.5">
                  Gerador corporativo de pré-alerta e iscas
                </p>
              </div>
            </div>
          </div>

          {/* Generator Workspace Form */}
          <div className="flex flex-col gap-6">
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF6F0] border-2 border-[#3A2414]/15 rounded-2xl p-4 shadow-inner">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#3A2414] shrink-0">
                Saudação:
              </label>
              <div className="relative flex-1 max-w-[200px]">
                <select
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-white border-2 border-[#3A2414]/20 rounded-xl px-3.5 py-2.5 text-xs font-black text-[#3A2414] focus:border-[#B32025] outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-black text-[#3A2414]/70 uppercase tracking-wider">
                Define a saudação inicial do pré-alerta
              </p>
            </div>

            {/* EMAIL SUBJECT HEADER BLOCK */}
            <div className="bg-[#F4F8FA] border border-[#D1E1EB] rounded-2xl p-5 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-[#1E293B]">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] block mb-1">
                  Assunto do E-mail (Copiar separadamente)
                </span>
                <h1 className="text-lg font-serif font-black text-[#1E293B] uppercase tracking-tight m-0 select-all">
                  PRÉ-ALERTA DE ISCA - {destino || "BRASÍLIA"} -{" "}
                  {cavalo.replace(/-/g, "") || "TYQ6F51"}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "flex items-center gap-2 font-black uppercase text-[10px] tracking-wider px-5 py-3 rounded-xl shadow-sm transition-all cursor-pointer select-none active:scale-95 shrink-0 border",
                  copiedAssunto
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-[#B32025] hover:bg-[#8c060a] text-white border-[#B32025]/30",
                )}
              >
                {copiedAssunto ? (
                  <>
                    <Check size={13} className="stroke-[3]" /> COPIADO!
                  </>
                ) : (
                  <>
                    <Copy size={13} className="stroke-[2.5]" /> COPIAR ASSUNTO
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW CONTAINER - CORPORATE EXECUTIVE OFFICE PREVIEW */}
            <div className="bg-[#F4F8FA] border border-[#D1E1EB] rounded-[2rem] p-6 sm:p-7 shadow-sm overflow-x-auto relative">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#64748B] block mb-5 border-b border-[#D1E1EB] pb-2">
                Visualização do Pré-Alerta (Template do E-mail)
              </span>

              <div className="min-w-[850px] font-sans text-xs text-[#3A2414]">
                {/* 1. Greeting Output */}
                <div className="mb-4 font-sans font-black text-sm text-[#3A2414] ml-0 pl-0">
                  {saudacao}
                </div>

                {/* 2. Executive Alert Banner */}
                <div className="mb-5 bg-[#B32025] text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider shadow-md flex items-center rounded-xl border-2 border-[#3A2414]/30 max-w-max ml-0">
                  <input
                    type="text"
                    value={alertaResgate}
                    onChange={(e) => setAlertaResgate(e.target.value)}
                    className="bg-transparent border-none text-white w-full outline-none font-black text-xs uppercase p-0.5 focus:ring-1 focus:ring-white/40 hover:bg-white/10 rounded px-1.5 transition-all min-w-[280px]"
                    placeholder="ALERTA RESGATE"
                  />
                </div>

                {/* 3. Atentar às informações */}
                <div className="mb-3.5 font-black text-[#3A2414] text-[13px] ml-0 pl-0">
                  <input
                    type="text"
                    value={infoAbaixo}
                    onChange={(e) => setInfoAbaixo(e.target.value)}
                    className="bg-transparent border-none outline-none hover:bg-[#3A2414]/5 focus:bg-[#3A2414]/10 rounded px-1.5 py-0.5 w-full font-black text-[#3A2414] transition-all"
                  />
                </div>

                {/* 4. Routes and Instructions Selector Box with executive left highlight */}
                <div className="border-2 border-[#3A2414]/20 border-l-4 border-l-[#B32025] bg-white p-4 mb-6 font-bold leading-relaxed max-w-xl rounded-xl shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-[#B32025] text-sm">•</span>
                    <input
                      type="text"
                      value={rota1}
                      onChange={(e) => setRota1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-[#3A2414]/5 focus:bg-[#3A2414]/10 rounded text-xs text-[#3A2414] transition-all"
                      placeholder="· SANTA LUZIA/MG x GUARULHOS/SP;"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#B32025] text-sm">•</span>
                    <input
                      type="text"
                      value={instrucao1}
                      onChange={(e) => setInstrucao1(e.target.value)}
                      className="bg-transparent border-none w-full outline-none font-bold py-0.5 px-1.5 hover:bg-[#3A2414]/5 focus:bg-[#3A2414]/10 rounded text-xs text-[#3A2414] transition-all"
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
                            setSidebarEmbarque2("none");
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
                          setSidebarEmbarque2("none");
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
                          <div className="flex items-center justify-center gap-1.5 mx-auto w-fit">
                            <input
                              type="text"
                              value={isca2 === "SEM ISCA" ? "" : isca2Bateria}
                              onChange={(e) => setIsca2Bateria(e.target.value)}
                              disabled={isca2 === "SEM ISCA"}
                              className="w-12 bg-transparent border-none outline-none hover:bg-slate-200/50 focus:bg-slate-200 rounded px-1 py-0.5 text-xs text-center text-slate-900 font-bold transition-all duration-200 disabled:opacity-50"
                              placeholder={isca2 === "SEM ISCA" ? "" : "100%"}
                            />
                            <div className="relative flex items-center shrink-0">
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
                        <div className="flex items-center justify-center gap-1.5 mx-auto w-fit">
                          <input
                            type="text"
                            value={isca1Bateria}
                            onChange={(e) => setIsca1Bateria(e.target.value)}
                            className="w-12 bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-slate-200/70 rounded px-1 py-0.5 text-xs text-center text-slate-900 font-bold transition-all duration-200"
                            placeholder="100%"
                          />
                          <div className="relative flex items-center shrink-0">
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
                {rota1 &&
                  !DESTINOS_OPCOES.some(
                    (dest) =>
                      dest.replace(/^SANTA LUZIA\/MG/i, origem).toUpperCase() ===
                      rota1.toUpperCase()
                  ) && (
                    <option
                      value={rota1}
                      className="text-slate-900 uppercase text-xs font-bold"
                    >
                      {rota1.toUpperCase()}
                    </option>
                  )}
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
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                  <Sliders size={12} className="text-slate-500" /> N° ISCAS (PREFIXOS & BATERIA)
                </label>
                <button
                  type="button"
                  onClick={handleCopyIscasWithSpace}
                  title="Copiar números das iscas com espaço (ex: R100002466 R100000876)"
                  className={cn(
                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md transition-all cursor-pointer select-none shadow-2xs",
                    copiedIscasSpace
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white hover:shadow-xs active:scale-95"
                  )}
                >
                  {copiedIscasSpace ? (
                    <>
                      <Check size={11} className="stroke-[3]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copiar Iscas</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* ISCA 1 SECTION */}
                <div className="border-b border-slate-200 pb-2.5">
                  <span className="text-[9px] font-extrabold uppercase text-red-600 block mb-1">
                    DISPOSITIVO ISCA 1:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
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
                          let newPrefix = iscaPrefix1;
                          if (val.length === 3) newPrefix = "R100000";
                          else if (val.length === 4) newPrefix = "R10000";
                          
                          setIscaSuffix1(val);
                          setIscaPrefix1(newPrefix);
                          setIsca1(newPrefix + val);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-black text-slate-900 uppercase focus:border-red-600 outline-none transition-all"
                        placeholder="RESTO..."
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
                    <div className="grid grid-cols-2 gap-2">
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
                            let newPrefix = iscaPrefix2;
                            if (val.length === 3) newPrefix = "R100000";
                            else if (val.length === 4) newPrefix = "R10000";
                            
                            setIscaSuffix2(val);
                            setIscaPrefix2(newPrefix);
                            setIsca2(newPrefix + val);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-[10px] font-black text-slate-900 uppercase focus:border-red-600 outline-none transition-all"
                          placeholder="RESTO..."
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* VISUAL PREVIEW & QUICK COPY BAR */}
                {getIscasSpaceSeparated() ? (
                  <div
                    onClick={handleCopyIscasWithSpace}
                    title="Clique para copiar com espaço"
                    className="flex items-center justify-between bg-white border border-slate-300 hover:border-red-400 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[8px] font-extrabold uppercase text-slate-400 shrink-0">ISCAS:</span>
                      <span className="text-[11px] font-mono font-black text-red-600 group-hover:text-red-700 tracking-wider truncate">
                        {getIscasSpaceSeparated()}
                      </span>
                    </div>
                    <div className="shrink-0 ml-1.5 flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 group-hover:text-red-600 transition-colors">
                      {copiedIscasSpace ? (
                        <span className="text-emerald-600 font-black flex items-center gap-0.5">
                          <Check size={11} className="stroke-[3]" /> Copiado
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Copy size={11} /> Copiar
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* EMBARQUE SECTIONS */}
            <div className="flex flex-col gap-4">
              {/* CARRETA 1 EMBARQUE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Image size={12} className="text-slate-500" /> EMBARQUE (CARRETA 1: {carreta1})
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {EMBARQUE_IMAGES.map((img) => (
                    <button
                      key={img.value}
                      type="button"
                      onClick={() => setSidebarEmbarque1(img.value)}
                      className={cn(
                        "relative px-2 py-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 min-h-[55px]",
                        sidebarEmbarque1 === img.value
                          ? "bg-[#B91C1C] border-[#B91C1C] text-white shadow-md ring-2 ring-[#B91C1C]/20"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className={cn(
                        "font-black uppercase tracking-tight text-[10px] leading-tight",
                        sidebarEmbarque1 === img.value ? "text-white" : "text-slate-600"
                      )}>
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

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
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {EMBARQUE_IMAGES.map((img) => (
                      <button
                        key={img.value}
                        type="button"
                        onClick={() => setSidebarEmbarque2(img.value)}
                        className={cn(
                          "relative px-2 py-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 min-h-[55px]",
                          sidebarEmbarque2 === img.value
                            ? "bg-[#B91C1C] border-[#B91C1C] text-white shadow-md ring-2 ring-[#B91C1C]/20"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <span className={cn(
                          "font-black uppercase tracking-tight text-[10px] leading-tight",
                          sidebarEmbarque2 === img.value ? "text-white" : "text-slate-600"
                        )}>
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>

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
      <div className="w-full mt-8 bg-[#F4F8FA] border border-[#CBD5E1] rounded-3xl shadow-sm overflow-hidden flex flex-col p-5 sm:p-7">
        {/* Header banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#CBD5E1]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F172A] text-white rounded-2xl shadow-sm shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] bg-white px-2.5 py-0.5 rounded-md border border-[#CBD5E1]">
                  Planilha Google / Excel
                </span>
              </div>
              <h3 className="text-base font-sans font-extrabold text-[#0F172A] uppercase tracking-tight mt-1 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#0F172A]" /> Copiar Linhas de Iscas para Planilha Google
              </h3>
              <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                Copie cada linha individualmente ou a tabela completa para colar no Google Sheets (Ctrl+V)
              </p>
            </div>
          </div>

          {/* Batch Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            
          </div>
        </div>

        {/* Spreadsheet Mock Preview Table */}
        <div className="mt-5 w-full rounded-2xl border border-[#D1E1EB] overflow-x-auto shadow-sm bg-white">
          <div className="min-w-[1000px]">
            {/* Column Letters Bar A-H */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#F4F8FA] border-b border-[#D1E1EB] text-[10px] font-black text-[#64748B] text-center py-1 divide-x divide-[#D1E1EB]">
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

            {/* Header Row */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#0F172A] text-white text-[11px] font-black uppercase py-2.5 divide-x divide-[#CBD5E1] border-b border-[#CBD5E1] items-center">
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
            <div className="divide-y divide-[#CBD5E1] bg-white text-[#1E293B] font-sans">
              {/* Row 1 (Isca 1) */}
              <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] divide-x divide-[#CBD5E1] items-center hover:bg-[#F4F8FA] transition-colors">
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
                        ? "bg-[#7F1D1D] text-white border-[#7F1D1D]"
                        : "bg-[#B91C1C] border-[#B91C1C] hover:bg-[#991B1B] hover:border-[#991B1B] text-white"
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
                          ? "bg-[#7F1D1D] text-white border-[#7F1D1D]"
                          : "bg-[#B91C1C] border-[#B91C1C] hover:bg-[#991B1B] hover:border-[#991B1B] text-white"
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
    </div>
  );
}
