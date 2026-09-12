import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfParse from "pdf-parse";

const pdf = (pdfParse as any).default || pdfParse;

const app = express();
const PORT = 3000;

async function startServer() {
  // Increase the payload size limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/parse-prancheta", async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: "Arquivo base64 é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      let effectiveMimeType = mimeType || "application/pdf";
      if (fileName && fileName.toLowerCase().endsWith(".pdf")) {
        effectiveMimeType = "application/pdf";
      } else if (fileName && fileName.toLowerCase().endsWith(".png")) {
        effectiveMimeType = "image/png";
      } else if (fileName && (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg"))) {
        effectiveMimeType = "image/jpeg";
      }

      // 1. If Gemini API key is present, use multimodal Gemini 3.5 Flash
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          const promptText = `Você é um especialista em OCR e digitalização de relatórios logísticos e pranchetas de controle de embarque de iscas.
Analise com máxima precisão o documento em anexo (Prancheta / Controle de Embarque de Iscas).
Leia atentamente todas as linhas da tabela, identificando tanto textos impressos quanto anotações manuscritas (como números de isca, datas, horas, docas, placas de cavalo e carreta, m3, destinos, notas fiscais, nomes de responsáveis, produtos, U.M.A. e valores em R$).
Identifique a ortografia o mais próximo possível do original. Se algum campo estiver em branco ou totalmente ilegível, deixe-o em branco ("").

Campos exigidos em cada objeto da lista JSON:
- noIsca: Número/código da ISCA (ex: R10000639, R10000913)
- data: Data do embarque (ex: 21/07, 22/07)
- hora: Horário no formato HH:MM (ex: 22:03, 06:25)
- doca: Número da Doca (ex: 03, 07, 05, 10, etc)
- cavalo: Placa do Cavalo Mecânico (ex: TYM5E00, SAS2D02, PYV-8215)
- carreta: Placa da Carreta / Reboque (ex: GEK8H91, SJOA72, PVE-9195)
- m3: Volume M³ (ex: 88, 98, 107, 86, 91)
- destino: Cidade ou código do destino (ex: Guarulhos, MOC, Londrina, Gov. Celso, Cuiabá, CABAM, RS)
- noNf: Número da Nota Fiscal (ex: 2932174, 610307735, 2932205)
- responsavel: Nome ou sigla do responsável (ex: Vini, PGEF, DCGF)
- produto: Código do produto (ex: 12031025, 12051024, 12034101)
- uma: Número da U.M.A. ou texto impresso/manuscrito (ex: 13758510281, 6000000017382, Batida)
- valorNf: Valor da NF formatado em R$ com ponto e vírgula (ex: 417.897,75 ou 22.371,79 ou 1.069.271,88)
- preAlertaGr: Pré-alerta GR (ex: Vini, PGEF, DCGF)
- planCarreg: Status ou informação do planejamento (ex: OK)
- baixaGr: Status da baixa GR (ex: OK)

Retorne estritamente o array JSON com as linhas encontradas.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: effectiveMimeType,
                    data: cleanBase64
                  }
                },
                { text: promptText }
              ]
            },
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    noIsca: { type: Type.STRING },
                    data: { type: Type.STRING },
                    hora: { type: Type.STRING },
                    doca: { type: Type.STRING },
                    cavalo: { type: Type.STRING },
                    carreta: { type: Type.STRING },
                    m3: { type: Type.STRING },
                    destino: { type: Type.STRING },
                    noNf: { type: Type.STRING },
                    responsavel: { type: Type.STRING },
                    produto: { type: Type.STRING },
                    uma: { type: Type.STRING },
                    valorNf: { type: Type.STRING },
                    preAlertaGr: { type: Type.STRING },
                    planCarreg: { type: Type.STRING },
                    baixaGr: { type: Type.STRING }
                  }
                }
              }
            }
          });

          let jsonText = response.text || "";
          jsonText = jsonText.replace(/```json\n?|```/g, "").trim();
          const parsedRows = JSON.parse(jsonText);

          if (Array.isArray(parsedRows) && parsedRows.length > 0) {
            return res.status(200).json({ success: true, data: parsedRows });
          }
        } catch (geminiErr) {
          console.warn("Gemini extraction failed for prancheta, trying fallback:", geminiErr);
        }
      }

      // Fallback using pdf-parse if it's a PDF
      if (effectiveMimeType === "application/pdf") {
        try {
          const buffer = Buffer.from(cleanBase64, 'base64');
          const pdfData = await pdf(buffer);
          const text = pdfData.text || "";
          const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

          const extractedRows: any[] = [];
          const iscaPattern = /(R\d{6,10})/gi;
          const platePattern = /([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})/gi;
          const timePattern = /(\d{2}:\d{2})/;
          const datePattern = /(\d{2}\/\d{2}(?:\/\d{2,4})?)/;

          for (const l of lines) {
            const iscas = l.match(iscaPattern);
            const plates = l.match(platePattern);
            if (iscas || plates) {
              const timeMatch = l.match(timePattern);
              const dateMatch = l.match(datePattern);
              const numbers = l.match(/\b\d{6,11}\b/g) || [];

              extractedRows.push({
                noIsca: iscas ? iscas[0] : "",
                data: dateMatch ? dateMatch[1] : "",
                hora: timeMatch ? timeMatch[1] : "",
                doca: "",
                cavalo: plates && plates[0] ? plates[0].replace(/[\s-]/g, '').toUpperCase() : "",
                carreta: plates && plates[1] ? plates[1].replace(/[\s-]/g, '').toUpperCase() : "",
                m3: "",
                destino: "",
                noNf: numbers[0] || "",
                responsavel: "",
                produto: numbers[1] || "",
                uma: numbers[2] || "",
                valorNf: "",
                preAlertaGr: "",
                planCarreg: "",
                baixaGr: ""
              });
            }
          }

          if (extractedRows.length > 0) {
            return res.status(200).json({ success: true, data: extractedRows });
          }
        } catch (pdfErr) {
          console.warn("PDF parse fallback error:", pdfErr);
        }
      }

      return res.status(400).json({ error: "Não foi possível extrair os dados do arquivo fornecido." });

    } catch (err) {
      console.error("Erro na rota /api/parse-prancheta:", err);
      return res.status(500).json({ error: "Erro interno ao processar a prancheta." });
    }
  });

  app.post("/api/parse-os-pdf", async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: "Arquivo base64 é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      let effectiveMimeType = mimeType || "application/pdf";
      if (fileName && fileName.toLowerCase().endsWith(".pdf")) {
        effectiveMimeType = "application/pdf";
      } else if (fileName && fileName.toLowerCase().endsWith(".png")) {
        effectiveMimeType = "image/png";
      } else if (fileName && (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg"))) {
        effectiveMimeType = "image/jpeg";
      }

      // 1. Try Gemini 2.5 Flash if API key is present
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          const promptText = `Você é um especialista em logística, PGR e transporte de cargas da Três Corações (3C).
Analise com rigorosa precisão o documento em anexo (pode ser uma Ordem de Serviço 3C, OS de Terceiros, Romaneio, CT-e, Manifesto ou relatório de embarques).

Identifique com exatidão TODOS os dados operacionais de transporte presentes no documento:
- Se houver mais de uma carga/veículo/viagem/OS no documento, extraia CADA UMA DELAS.
- Se houver apenas uma Ordem de Serviço, extraia esse único registro.

Para CADA embarque/viagem/veículo, extraia com máxima fidelidade:
- transportador: Razão Social ou Nome Fantasia da transportadora (ex: TORNADOLOG, 3C, PATRUS, JAMEF, etc)
- dataCarregamento: Data no formato DD/MM/AAAA (ex: 05/08/2026)
- previsaoHorario: Previsão ou texto do horário (ex: FROTA ou 08:00)
- filialOrigem: Cidade/UF de origem (ex: VESPASIANO/MG, SANTA LUZIA/MG)
- filialDestino: Cidade/UF de destino (ex: EUSÉBIO/CE, NATAL/RN, RECIFE/PE, etc)
- agendaDescarregamento: Data/hora agendada para descarga se houver
- nomeMotorista: Nome completo do motorista em maiúsculas (ex: WILMER DIAZ SANCHEZ)
- cpf: CPF do motorista formatado (ex: 709.874.852-88)
- vinculoMotorista: Vínculo do motorista (ex: TERCEIRO, FROTA, AGREGADO, AUTÔNOMO)
- rgUf: RG e UF do motorista (ex: F 439659 S PF / AM)
- cnh: Número de registro da CNH (ex: 08359828273)
- celular: Telefone celular ou WhatsApp com DDD (ex: 48 99219-2019)
- perfilCavalo: Perfil do Cavalo (ex: TRUCADO, TOCO, 6X2, 6X4)
- perfilCarreta: Perfil da Carreta (ex: SIDER, BAÚ, RODOTREM, BITREM, CARRETA LS)
- capacidadePallets: Capacidade em pallets em número (ex: 30)
- capacidadeToneladas: Capacidade em toneladas em número (ex: 30)
- placaCavalo: Placa do cavalo mecânico com hífen (ex: TLN-3E35 ou ABC-1234)
- ufCavalo: UF do cavalo (ex: SC, MG, SP)
- placaCarreta1: Placa da carreta 1 com hífen (ex: TPI-4B34)
- ufCarreta1: UF da carreta 1 (ex: SC, MG, SP)
- placaCarreta2: Placa da carreta 2 se houver (ex: rodotrem ou bitrem)
- ufCarreta2: UF da carreta 2 se houver
- rastreador: Tecnologia/marca do rastreador (ex: ONIX, SASCAR, AUTOTRAC, OMNILINK, SIGHRA, KRONA)
- quantEixos: Quantidade de eixos (ex: 6, 9)
- comprimentoCarreta: Comprimento da carreta (ex: 14,6)
- larguraCarreta: Largura da carreta (ex: 2,45)
- alturaCarreta: Altura da carreta (ex: 2,82)
- idCargo: Número da OS, Carga, CT-e ou Lacre se houver

IMPORTANTE: Retorne estritamente um ARRAY de objetos JSON (mesmo se houver apenas 1, retorne um array com 1 objeto).`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: effectiveMimeType,
                    data: cleanBase64
                  }
                },
                { text: promptText }
              ]
            },
            config: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          });

          let jsonText = response.text || "";
          jsonText = jsonText.replace(/```json\n?|```/g, "").trim();
          const parsed = JSON.parse(jsonText);

          let items: any[] = [];
          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.data)) items = parsed.data;
            else if (Array.isArray(parsed.items)) items = parsed.items;
            else if (Array.isArray(parsed.ordens)) items = parsed.ordens;
            else items = [parsed];
          }

          if (items.length > 0) {
            return res.status(200).json({ success: true, data: items });
          }
        } catch (geminiErr) {
          console.warn("Gemini extraction failed for OS PDF, fallback to text parser:", geminiErr);
        }
      }

      // 2. Fallback text parsing via pdf-parse
      if (effectiveMimeType === "application/pdf") {
        try {
          const buffer = Buffer.from(cleanBase64, 'base64');
          const pdfData = await pdf(buffer);
          const rawText = pdfData.text || "";
          
          // Match all Brazilian plates (Standard ABC-1234 or Mercosul ABC1D23)
          const plateRegex = /\b([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})\b/gi;
          const rawPlates = (rawText.match(plateRegex) || []).map(p => {
            const clean = p.replace(/[\s-]/g, '').toUpperCase();
            if (clean.length === 7) {
              return `${clean.slice(0, 3)}-${clean.slice(3)}`;
            }
            return p.toUpperCase();
          });
          const plates = Array.from(new Set(rawPlates));

          // Date
          const dateMatch = rawText.match(/(?:DATA(?:\s+DE\s+CARREGAMENTO|\s+EMISS[ÃA]O)?[\s:]*)?(\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4})/i);
          
          // CPF
          const cpfMatch = rawText.match(/\b(\d{3}\.?\d{3}\.?\d{3}[-\/]?\d{2})\b/);
          
          // CNH
          const cnhMatch = rawText.match(/(?:CNH|REGISTRO(?:\s+CNH)?)[\s:\-]+(\d{9,12})/i);
          
          // Telefone / Celular
          const celMatch = rawText.match(/(?:CELULAR|TELEFONE|FONE|WHATSAPP|CONTATO)[\s:\-]+(\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4})/i);

          // Transportador
          let transportador = '';
          const trMatch = rawText.match(/(?:TRANSPORTADOR(?:A)?|EMPRESA)[\s:\-]+([A-Za-z0-9\.\-_ ]{3,40})/i);
          if (trMatch) {
            transportador = trMatch[1].trim().toUpperCase();
          } else {
            const trNamedMatch = rawText.match(/\b(TORNADOLOG|3C|PATRUS|JAMEF|BRASPRESS|TRANSRAPIDO|TRANSILVA|LOG EXPRESS|RODONAVES)\b/i);
            if (trNamedMatch) transportador = trNamedMatch[1].toUpperCase();
          }

          // Motorista / Condutor
          let motorista = '';
          const motMatch = rawText.match(/(?:NOME(?:\s+DO)?\s+MOTORISTA|CONDUTOR|NOME)[\s:\-]+([A-Za-zÀ-ÿ\s]{4,55})(?=\n|$|\s{3,}|CPF|RG|CNH)/i);
          if (motMatch) {
            motorista = motMatch[1].trim().toUpperCase();
          } else {
            // Alternative layout: Line after "NOME MOTORISTA"
            const altMot = rawText.match(/NOME MOTORISTA\s*\n+([A-Za-zÀ-ÿ\s]+?)(?=\s+\d{3}|\n|$)/i);
            if (altMot) motorista = altMot[1].trim().toUpperCase();
          }

          // RG / UF
          let rgUf = '';
          const rgMatch = rawText.match(/(?:RG(?:\s*[\/\-]\s*UF)?|SAP)[\s:\-]+([A-Za-z0-9\.\-\/\s]{4,25})/i);
          if (rgMatch) rgUf = rgMatch[1].trim().toUpperCase();

          // Origem & Destino
          let orig = '';
          let dest = '';
          const origMatch = rawText.match(/(?:FILIAL DE ORIGEM|ORIGEM)[\s:\-]+([A-Za-zÀ-ÿ0-9\s\/\-_]{3,35})/i);
          if (origMatch) orig = origMatch[1].trim().toUpperCase();

          const destMatch = rawText.match(/(?:FILIAL DE DESTINO|DESTINO)[\s:\-]+([A-Za-zÀ-ÿ0-9\s\/\-_]{3,35})/i);
          if (destMatch) dest = destMatch[1].trim().toUpperCase();

          if (!orig && !dest) {
            const odMatch = rawText.match(/FILIAL DE ORIGEM[\s\S]*?([A-Za-zÀ-ÿ0-9\s\/]+?)\s{2,}([A-Za-zÀ-ÿ0-9\s\/]+)/i);
            if (odMatch) {
              orig = odMatch[1].trim().toUpperCase();
              dest = odMatch[2].trim().toUpperCase();
            }
          }

          // Rastreador
          let rastreador = 'ONIX';
          const rastMatch = rawText.match(/(?:RASTREADOR|TECNOLOGIA)[\s:\-]+(ONIX|SASCAR|AUTOTRAC|OMNILINK|SIGHRA|KRONA|[A-Za-z0-9\-]{3,20})/i);
          if (rastMatch) rastreador = rastMatch[1].toUpperCase();

          // Pallets & Toneladas
          let pallets = '30';
          const pMatch = rawText.match(/(?:CAPACIDADE(?:\s+DE)?\s+PALLETS|PALLETS|PLTS)[\s:\-]+(\d{1,3})/i);
          if (pMatch) pallets = pMatch[1];

          let ton = '30';
          const tMatch = rawText.match(/(?:CAPACIDADE(?:\s+DE)?\s+TONELADAS|TONELADAS|TON|PBT)[\s:\-]+(\d{1,3}(?:[,\.]\d{1,2})?)/i);
          if (tMatch) ton = tMatch[1].replace(',', '.');

          // Perfil Cavalo & Carreta
          let perfilCavalo = 'TRUCADO';
          const cavMatch = rawText.match(/(?:PERFIL(?:\s+DO)?\s+CAVALO|TIPO CAVALO)[\s:\-]+([A-Za-z0-9\- ]{3,25})/i);
          if (cavMatch) perfilCavalo = cavMatch[1].trim().toUpperCase();

          let perfilCarreta = 'SIDER';
          const carMatch = rawText.match(/(?:PERFIL(?:\s+DA)?\s+CARRETA|TIPO CARRETA)[\s:\-]+([A-Za-z0-9\- ]{3,25})/i);
          if (carMatch) perfilCarreta = carMatch[1].trim().toUpperCase();

          // OS / ID Carga
          let idCargo = '';
          const osMatch = rawText.match(/(?:ID\s*CARGO|Nº\s*OS|ORDEM\s*DE\s*SERVIÇO|CARGA|CTE)[\s:\-]+([A-Za-z0-9\-_]{3,30})/i);
          if (osMatch) idCargo = osMatch[1].trim().toUpperCase();

          const fallbackData = {
            transportador: transportador || 'TORNADOLOG',
            dataCarregamento: dateMatch ? dateMatch[1] : '',
            filialOrigem: orig || 'VESPASIANO/MG',
            filialDestino: dest || 'EUSÉBIO/CE',
            nomeMotorista: motorista || '',
            cpf: cpfMatch ? cpfMatch[1] : '',
            vinculoMotorista: 'TERCEIRO',
            rgUf: rgUf || '',
            cnh: cnhMatch ? cnhMatch[1] : '',
            celular: celMatch ? celMatch[1] : '',
            perfilCavalo: perfilCavalo,
            perfilCarreta: perfilCarreta,
            capacidadePallets: pallets,
            capacidadeToneladas: ton,
            placaCavalo: plates[0] || '',
            ufCavalo: 'SC',
            placaCarreta1: plates[1] || '',
            ufCarreta1: 'SC',
            placaCarreta2: plates[2] || '',
            ufCarreta2: plates[2] ? 'SC' : '',
            rastreador: rastreador,
            idCargo: idCargo
          };

          return res.status(200).json({ success: true, data: [fallbackData] });
        } catch (pdfErr) {
          console.warn("PDF parse fallback error:", pdfErr);
        }
      }

      return res.status(400).json({ error: "Não foi possível extrair dados do PDF fornecido." });
    } catch (err) {
      console.error("Erro na rota /api/parse-os-pdf:", err);
      return res.status(500).json({ error: "Erro interno ao processar a OS." });
    }
  });

  app.post("/api/extract-table", async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { textoCopiado, imagemBase64, customPrompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Chave API do Gemini não configurada." });
        }

        // 1. Inicialização segura (Lazy) apenas quando a rota for chamada
        const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });

        const parts = [];

        if (textoCopiado) {
            parts.push({ text: `TEXTO EXCEL:\n${textoCopiado}` });
        }

        if (imagemBase64) {
            let mimeType = "image/jpeg";
            const mimeMatch = imagemBase64.match(/^data:([^;]+);base64,/);
            if (mimeMatch) {
                mimeType = mimeMatch[1];
            }
            const apenasBase64 = imagemBase64.replace(/^data:[^;]+;base64,/, "");
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: apenasBase64
                }
            });
        }

        const defaultPrompt = "Converta os dados fornecidos em um array de objetos JSON para Pré-Alerta de GR. Retorne apenas o JSON limpo, sem markdown.";
        parts.push({
            text: customPrompt || defaultPrompt
        });

        const config: any = {
            responseMimeType: "application/json",
            temperature: 0.1
        };

        if (imagemBase64) {
            config.responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        baitCode: { type: Type.STRING, description: "Número ou código da isca" },
                        date: { type: Type.STRING, description: "Data do embarque formato dd/mm/aaaa" },
                        time: { type: Type.STRING, description: "Hora do embarque formato hh:mm" },
                        dock: { type: Type.STRING, description: "Identificador da Doca" },
                        cavalo: { type: Type.STRING, description: "Placa do cavalo mecânico" },
                        carreta: { type: Type.STRING, description: "Placa do reboque" },
                        volume: { type: Type.STRING, description: "Quantidade de volumes" },
                        destination: { type: Type.STRING, description: "Destino final da carga" },
                        nf: { type: Type.STRING, description: "Número(s) das Notas Fiscais" },
                        responsible: { type: Type.STRING, description: "Nome do responsável" },
                        product: { type: Type.STRING, description: "Categoria do produto" },
                        uma: { type: Type.STRING, description: "Identificação UMA" },
                        nfValue: { type: Type.STRING, description: "Valor financeiro" }
                    }
                }
            };
        } else if (textoCopiado) {
            config.responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        plate: { type: Type.STRING, description: "Placa do veículo" },
                        vehicleType: { type: Type.STRING, description: "Tipo de veículo" },
                        cargoType: { type: Type.STRING, description: "Tipo da carga" },
                        location: { type: Type.STRING, description: "Local de implantação" },
                        nfs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array com Notas Fiscais" },
                        baitIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array com iscas logísticas" },
                        destination: { type: Type.STRING, description: "Cidade / Estado destino" },
                        products: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Nomes de produtos" }
                    }
                }
            };
        }

        // 2. Correção do modelo para a versão existente
        const genResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts },
            config: config
        });

        let textoJSON = genResponse.text;
        
        if (!textoJSON) {
            return res.status(500).json({ error: "A IA não retornou uma resposta válida." });
        }

        textoJSON = textoJSON.replace(/```json\n?|```/g, "").trim();
        
        try {
            const parsedData = JSON.parse(textoJSON);
            return res.status(200).json({ success: true, data: parsedData });
        } catch (parseError) {
            console.warn("Falha no parse inicial do JSON, retornando texto bruto...");
            return res.status(200).json({ success: true, partial: true, rawData: textoJSON });
        }

    } catch (error) {
        console.error("Erro no processamento da imagem ou texto pelo Gemini:", error);
        return res.status(500).json({ error: "Erro interno ao processar dados com a Inteligência Artificial." });
    }
  });

  app.post("/api/extract-pdf", async (req, res) => {
    try {
        const { pdfBase64 } = req.body;

        if (!pdfBase64) {
            return res.status(400).json({ error: "O arquivo PDF em base64 é obrigatório." });
        }

        const apenasBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(apenasBase64, 'base64');

        // Parse PDF locally
        const data = await pdf(buffer);
        const text = data.text;

        if (!text) {
            return res.status(400).json({ error: "Não foi possível extrair texto do PDF." });
        }

        const lines = text.split(/\r?\n/);
        const results = [];

        // Plate Regex for standard and Mercosul Brazilian formats
        const platePattern = /([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})/gi;

        for (const line of lines) {
            if (!line.trim()) continue;

            const matches = line.match(platePattern) || [];
            
            // Standardize matches to clean 7-character uppercase plates
            const uniquePlates: string[] = Array.from(new Set(
                matches.map((p: string) => p.replace(/[\s-]/g, '').toUpperCase())
            ));

            // A valid truck row must contain at least 2 distinct plates (cavalo and carreta)
            if (uniquePlates.length >= 2) {
                const cavalo = uniquePlates[0];
                const carreta = uniquePlates[1];

                const words = line.split(/\s+/);
                
                // Find index of the second plate in the words array to look for M³ right after it
                let plate2Index = -1;
                for (let i = 0; i < words.length; i++) {
                    const normalizedWord = words[i].replace(/[|()\[\]\s-]/g, '').toUpperCase();
                    if (normalizedWord.includes(carreta)) {
                        plate2Index = i;
                        break;
                    }
                }

                let m3Value = '';
                if (plate2Index !== -1) {
                    const candidates: { val: number; strVal: string }[] = [];
                    // Check words after the carreta plate for the volume
                    for (let i = plate2Index + 1; i < words.length; i++) {
                        const cleanWord = words[i].replace(/[|()\[\]\s]/g, '').replace(/,/, '.');
                        const num = parseFloat(cleanWord);
                        const isPlate = uniquePlates.some(p => p.includes(cleanWord) || cleanWord.includes(p));
                        if (!isNaN(num) && num > 0 && num < 500 && !isPlate && !cleanWord.includes('/') && !cleanWord.includes(':')) {
                            candidates.push({ val: num, strVal: cleanWord });
                        }
                    }
                    if (candidates.length > 0) {
                        candidates.sort((a, b) => b.val - a.val);
                        m3Value = candidates[0].strVal;
                    }
                }

                // Fallback: If no M³ found right after the second plate, scan the entire line
                if (!m3Value) {
                    const candidates: { val: number; strVal: string }[] = [];
                    for (let i = 0; i < words.length; i++) {
                        const cleanWord = words[i].replace(/[|()\[\]\s]/g, '').replace(/,/, '.');
                        const num = parseFloat(cleanWord);
                        const isPlate = uniquePlates.some(p => p.includes(cleanWord) || cleanWord.includes(p));
                        if (!isNaN(num) && num >= 15 && num <= 500 && !isPlate && !cleanWord.includes('/') && !cleanWord.includes(':')) {
                            candidates.push({ val: num, strVal: cleanWord });
                        }
                    }
                    if (candidates.length > 0) {
                        candidates.sort((a, b) => b.val - a.val);
                        m3Value = candidates[0].strVal;
                    }
                }

                results.push({
                    cavalo,
                    carreta,
                    m3: m3Value || '---'
                });
            }
        }

        return res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error("Erro ao extrair PDF localmente:", error);
        return res.status(500).json({ error: "Erro interno ao ler e extrair os dados do PDF." });
    }
  });

function extractNfValueFromText(text: string): { valor: number; valorFormatado: string; numeroNf: string } | null {
  if (!text) return null;

  let numeroNf = '---';
  const nfNumMatch = text.match(/(?:NF-e|NOTA FISCAL|Nº|Nº\.|Nº:)\s*(\d{1,3}(?:\.\d{3})+|\d{4,9})/i) ||
                     text.match(/(?:SÉRIE|SERIE).*?(?:Nº|Nº\.|NUMERO)\s*(\d+)/i);
  if (nfNumMatch) {
    numeroNf = nfNumMatch[1];
  }

  const lines = text.split(/\r?\n/);

  // 1. Explicit inline keywords like "VALOR TOTAL DA NOTA 15.420,50" or "VALOR TOTAL DA NOTA R$ 15.420,50"
  const directMatch = text.match(/(?:VALOR\s+TOTAL\s+DA\s+NOTA|VALOR\s+TOTAL\s+DO\s+DOCUMENTO|VALOR\s+TOTAL\s+DA\s+NF|VALOR\s+TOTAL\s+DOS\s+PRODUTOS|V\.\s*TOTAL\s+DA\s+NOTA|TOTAL\s+DA\s+NOTA)\s*[:\.]?\s*(?:R\$\s*)?([\d\.]+\,\d{2})/i);
  if (directMatch) {
    const strVal = directMatch[1];
    const numVal = parseFloat(strVal.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(numVal) && numVal > 0) {
      return {
        valor: numVal,
        valorFormatado: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numVal),
        numeroNf
      };
    }
  }

  // 2. Line-by-line DANFE block search
  for (let i = 0; i < lines.length; i++) {
    const lineUpper = lines[i].toUpperCase();
    if (
      lineUpper.includes('VALOR TOTAL DA NOTA') || 
      lineUpper.includes('VALOR TOTAL DO DOCUMENTO') || 
      lineUpper.includes('VALOR TOTAL DA NF') ||
      lineUpper.includes('V. TOTAL') ||
      lineUpper.includes('VALOR TOTAL DOS PRODUTOS')
    ) {
      for (let j = i; j <= Math.min(i + 3, lines.length - 1); j++) {
        const moneyMatches = lines[j].match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
        if (moneyMatches && moneyMatches.length > 0) {
          const lastValStr = moneyMatches[moneyMatches.length - 1];
          const numVal = parseFloat(lastValStr.replace(/\./g, '').replace(',', '.'));
          if (!isNaN(numVal) && numVal > 0) {
            return {
              valor: numVal,
              valorFormatado: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numVal),
              numeroNf
            };
          }
        }
      }
    }
  }

  // 3. Fallback: Search all currency patterns with R$
  const allMoney = text.match(/(?:R\$\s*)(\d{1,3}(?:\.\d{3})*,\d{2})/g);
  if (allMoney && allMoney.length > 0) {
    let maxVal = 0;
    for (const m of allMoney) {
      const clean = m.replace(/R\$\s*/, '');
      const numVal = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(numVal) && numVal > maxVal) {
        maxVal = numVal;
      }
    }
    if (maxVal > 0) {
      return {
        valor: maxVal,
        valorFormatado: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(maxVal),
        numeroNf
      };
    }
  }

  return null;
}

  app.post("/api/parse-ordem-coleta", async (req, res) => {
    try {
      const { fileBase64, fileName } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: "O arquivo PDF em base64 é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");

      // If Gemini API key is available, use Gemini 3.5 Flash for multimodal document extraction
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          const promptText = `Você é um assistente especialista em leitura de Ordens de Coleta e Ordens de Serviço 3C logísticas.
Analise o documento PDF em anexo e extraia todas as informações necessárias para preencher a planilha de controle de coleta.

Campos que devem ser extraídos do documento:
- mes: Mês e ano abreviado em maiúsculas (ex: "JUL|26" ou "JAN|26")
- origem: Filial de Origem formatada com estado se houver (ex: "SANTA LUZIA | MG")
- dia: Dia da semana da data de carregamento em minúsculas (ex: "sexta-feira", "segunda-feira")
- data: Data de carregamento no formato DD/MM/AAAA (ex: "24/07/2026")
- contatoWhats: Horário ou contato de WhatsApp (ex: "08:00:00")
- horaLiberado: Hora da liberação ou previsão (ex: "08:00:00")
- status: Status do carregamento (padrão: "LIBERADO CARREGAMENTO")
- modeloCarreta: Modelo/Perfil da Carreta (ex: "BAÚ", "SIDER", "RODOTREM BAÚ")
- modeloCavalo: Modelo/Perfil do Cavalo (ex: "TRUCADO", "TOCO", "TRAÇÃO")
- fezContato: Se fez contato ("SIM" ou "NÃO", padrão "SIM")
- destino: Filial ou Cidade de Destino (ex: "GUARULHOS", "GOV. CELSO RAMOS")
- transportador: Nome da empresa transportadora (ex: "TRANSMAGNA", "COMBOIO", "TOMASI")
- cavalo: Placa do Cavalo sem traços (ex: "SEV5A39")
- carreta: Placa da 1ª Carreta sem traços (ex: "TPY3G57")
- cargaLiberacao: Nome completo do motorista (ex: "WISTOR FRANKLIN BELISARIO BRITO")
- estadoMotorista: UF do motorista ou da placa (ex: "SC", "MG", "RS")
- estadoCavalo: UF da placa do cavalo (ex: "SC")
- estadoCarreta: UF da placa da carreta (ex: "SC")
- pendencia: Data ou informação de pendência se houver (ex: "" ou "-")
- checkList: Status do checklist ("OK" ou "VENCIDO", padrão "OK")
- dias: Número de dias (ex: "180" ou "")
- segundaCarreta: Placa da 2ª Carreta se houver, ou "" (ex: "FXV2244")

Retorne um array JSON com 1 objeto contendo exatamente esses campos.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: cleanBase64
                  }
                },
                { text: promptText }
              ]
            },
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mes: { type: Type.STRING },
                    origem: { type: Type.STRING },
                    dia: { type: Type.STRING },
                    data: { type: Type.STRING },
                    contatoWhats: { type: Type.STRING },
                    horaLiberado: { type: Type.STRING },
                    status: { type: Type.STRING },
                    modeloCarreta: { type: Type.STRING },
                    modeloCavalo: { type: Type.STRING },
                    fezContato: { type: Type.STRING },
                    destino: { type: Type.STRING },
                    transportador: { type: Type.STRING },
                    cavalo: { type: Type.STRING },
                    carreta: { type: Type.STRING },
                    cargaLiberacao: { type: Type.STRING },
                    estadoMotorista: { type: Type.STRING },
                    estadoCavalo: { type: Type.STRING },
                    estadoCarreta: { type: Type.STRING },
                    pendencia: { type: Type.STRING },
                    checkList: { type: Type.STRING },
                    dias: { type: Type.STRING },
                    segundaCarreta: { type: Type.STRING }
                  }
                }
              }
            }
          });

          let jsonText = response.text || "";
          jsonText = jsonText.replace(/```json\n?|```/g, "").trim();
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.status(200).json({ success: true, data: parsed[0] });
          }
        } catch (geminiErr) {
          console.warn("Gemini parsing for Ordem de Coleta failed, falling back to local pdf-parse:", geminiErr);
        }
      }

      // Local pdf-parse fallback
      const buffer = Buffer.from(cleanBase64, 'base64');
      const pdfData = await pdf(buffer);
      const text = pdfData.text || "";

      const getMatch = (regex: RegExp) => {
        const m = text.match(regex);
        return m ? m[1].trim() : "";
      };

      const transportador = getMatch(/TRANSPORTADOR\s+([A-Z0-9\s]+)/i) || "TRANSMAGNA";
      const dataCarregamento = getMatch(/DATA DE CARREGAMENTO\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i) || getMatch(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      const horaPrevisao = getMatch(/PREVISÃO DA CHEGADA[^\n]*\n?([0-9]{2}:[0-9]{2})/i) || "08:00:00";
      const filialOrigem = getMatch(/FILIAL DE ORIGEM\s+([A-Z0-9\s]+)/i) || "SANTA LUZIA MG";
      const filialDestino = getMatch(/FILIAL DE DESTINO\s+([A-Z0-9\s]+)/i) || "GUARULHOS SP";
      const nomeMotorista = getMatch(/NOME\s+([A-Z\s]{3,})/i) || "";
      const perfilCavalo = getMatch(/PERFIL DO CAVALO\s+([A-Z]+)/i) || "TRUCADO";
      const perfilCarreta = getMatch(/PERFIL CARRETA\s+([A-Z]+)/i) || "BAÚ";
      
      const plateRegex = /([A-Z]{3}[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}[0-9]{4})/gi;
      const allPlates = text.match(plateRegex) || [];
      const cavalo = allPlates[0] || "";
      const carreta = allPlates[1] || "";
      const segundaCarreta = allPlates[2] || "";

      const ufMatch = text.match(/([A-Z]{2})\s+PLACA CARRETA/i) || text.match(/\b(SC|MG|RS|SP|PR|RJ|GO|BA)\b/g);
      const uf = ufMatch ? ufMatch[0] : "SC";

      const itemData = {
        mes: "JUL|26",
        origem: filialOrigem.includes("|") ? filialOrigem : filialOrigem.replace(/([A-Z\s]+)\s+([A-Z]{2})$/, "$1 | $2"),
        dia: "sexta-feira",
        data: dataCarregamento || "24/07/2026",
        contatoWhats: horaPrevisao.includes(":") && horaPrevisao.length === 5 ? `${horaPrevisao}:00` : horaPrevisao,
        horaLiberado: horaPrevisao.includes(":") && horaPrevisao.length === 5 ? `${horaPrevisao}:00` : horaPrevisao,
        status: "LIBERADO CARREGAMENTO",
        modeloCarreta: perfilCarreta.toUpperCase(),
        modeloCavalo: perfilCavalo.toUpperCase(),
        fezContato: "SIM",
        destino: filialDestino.split(" ")[0] || "GUARULHOS",
        transportador: transportador,
        cavalo: cavalo,
        carreta: carreta,
        cargaLiberacao: nomeMotorista,
        estadoMotorista: uf,
        estadoCavalo: uf,
        estadoCarreta: uf,
        pendencia: "",
        checkList: "OK",
        dias: "180",
        segundaCarreta: segundaCarreta
      };

      return res.status(200).json({ success: true, data: itemData });

    } catch (err: any) {
      console.error("Erro na rota /api/parse-ordem-coleta:", err);
      return res.status(500).json({ error: "Erro interno ao processar Ordem de Coleta." });
    }
  });

  app.post("/api/parse-nf-pdfs", async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo PDF fornecido." });
    }

    const results = [];
    const apiKey = process.env.GEMINI_API_KEY;

    for (const fileItem of files) {
      const fileName = fileItem.name || "nota.pdf";
      const base64Data = (fileItem.base64 || "").replace(/^data:[^;]+;base64,/, "");

      if (!base64Data) {
        results.push({
          fileName,
          success: false,
          error: "Base64 inválido",
          valor: 0,
          valorFormatado: "0,00",
          numeroNf: "---"
        });
        continue;
      }

      let parsedInfo = null;

      // 1. Try local PDF parsing with pdf-parse
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        const pdfData = await pdf(buffer);
        const text = pdfData.text || "";
        parsedInfo = extractNfValueFromText(text);
      } catch (err) {
        console.warn(`Local pdf-parse failed for ${fileName}:`, err);
      }

      // 2. Gemini fallback if needed
      if ((!parsedInfo || !parsedInfo.valor) && apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
          const genResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data
                  }
                },
                {
                  text: "Analise esta Nota Fiscal / DANFE em PDF. Extraia o Valor Total da Nota Fiscal e o Número da Nota. Responda estritamente em JSON: {\"valorTotalNf\": \"12345.67\", \"valorTotalNfFormatado\": \"12.345,67\", \"numeroNf\": \"12345\"}"
                }
              ]
            },
            config: {
              responseMimeType: "application/json"
            }
          });

          let jsonText = genResponse.text || "";
          jsonText = jsonText.replace(/```json\n?|```/g, "").trim();
          const geminiData = JSON.parse(jsonText);

          let numVal = parseFloat(geminiData.valorTotalNf || '0');
          if (isNaN(numVal) && geminiData.valorTotalNfFormatado) {
            numVal = parseFloat(geminiData.valorTotalNfFormatado.replace(/\./g, '').replace(',', '.'));
          }

          if (!isNaN(numVal) && numVal > 0) {
            parsedInfo = {
              valor: numVal,
              valorFormatado: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numVal),
              numeroNf: geminiData.numeroNf || "---"
            };
          }
        } catch (geminiErr) {
          console.error(`Gemini extraction failed for ${fileName}:`, geminiErr);
        }
      }

      if (parsedInfo && parsedInfo.valor > 0) {
        results.push({
          fileName,
          success: true,
          valor: parsedInfo.valor,
          valorFormatado: parsedInfo.valorFormatado,
          numeroNf: parsedInfo.numeroNf || "---"
        });
      } else {
        results.push({
          fileName,
          success: false,
          error: "Não foi possível extrair o Valor Total da Nota",
          valor: 0,
          valorFormatado: "0,00",
          numeroNf: "---"
        });
      }
    }

    const totalSomado = results.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const totalSomadoFormatado = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(totalSomado);

    return res.status(200).json({
      success: true,
      totalSomado,
      totalSomadoFormatado,
      items: results
    });

  } catch (err) {
    console.error("Erro na rota /api/parse-nf-pdfs:", err);
    return res.status(500).json({ error: "Erro interno ao processar arquivos PDF." });
  }
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
