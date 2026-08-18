const fs = require('fs');

const file = 'src/components/Controle.tsx';
let content = fs.readFileSync(file, 'utf8');

const rotaStateStr = `  const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta' | 'rota'>('gerador');

  // --- ROTA STATE ---
  const [rotaPastedData, setRotaPastedData] = useState("");
  const [parsedRotas, setParsedRotas] = useState<any[]>([]);

  useEffect(() => {
    if (!rotaPastedData.trim()) {
      setParsedRotas([]);
      return;
    }
    const lines = rotaPastedData.split('\\n');
    if (lines.length === 0) return;
    
    const headers = lines[0].split('\\t').map(h => h.trim().toUpperCase());
    let cavaloIdx = headers.findIndex(h => h === 'CAVALO' || (h.includes('CAVALO') && !h.includes('MODELO')));
    let carretaIdx = headers.findIndex(h => h === 'CARRETA' || (h.includes('CARRETA') && !h.includes('MODELO') && !h.includes('ESTADO')));
    let transpIdx = headers.findIndex(h => h.includes('TRANSPORTADOR'));
    let motoristaIdx = headers.findIndex(h => h.includes('MOTORISTA'));
    
    if (cavaloIdx === -1 && lines.length > 1) {
       cavaloIdx = 12;
       carretaIdx = 13;
       transpIdx = 11;
    }
    
    const parsedMap = new Map();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cols = line.split('\\t');
      
      const cavalo = cavaloIdx >= 0 && cols[cavaloIdx] ? cols[cavaloIdx].trim() : "";
      const carreta = carretaIdx >= 0 && cols[carretaIdx] ? cols[carretaIdx].trim() : "";
      const transportadora = transpIdx >= 0 && cols[transpIdx] ? cols[transpIdx].trim() : "";
      const motorista = motoristaIdx >= 0 && cols[motoristaIdx] ? cols[motoristaIdx].trim() : "";
      
      if (!cavalo) continue;
      
      if (parsedMap.has(cavalo)) {
        const existing = parsedMap.get(cavalo);
        if (existing.carreta1 && existing.carreta1 !== carreta && !existing.carreta2) {
           existing.carreta2 = carreta;
        } else if (!existing.carreta1 && carreta) {
           existing.carreta1 = carreta;
        }
      } else {
        parsedMap.set(cavalo, {
          placaCavalo: cavalo,
          carreta1: carreta,
          carreta2: "",
          motorista: motorista,
          transportadora: transportadora
        });
      }
    }
    
    setParsedRotas(Array.from(parsedMap.values()));
  }, [rotaPastedData]);
  // ------------------
`;

content = content.replace(
  "  const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta' | 'rota'>('gerador');",
  rotaStateStr
);

fs.writeFileSync(file, content, 'utf8');
