import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const app = express();
const PORT = 3000;

async function startServer() {
  // Increase the payload size limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
