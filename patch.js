const fs = require('fs');

const file = 'src/components/Controle.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update activeTab type
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta'>('gerador');",
  "const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta' | 'rota'>('gerador');"
);

// 2. Add Rota tab button
const navTabs = `          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
              activeTab === "gerador"
                ? "bg-[#B32025] text-white border-[#B32025]"
                : "bg-white text-[#1E293B] border-[#D1E1EB] hover:border-[#64748B]"
            )}
          >
            <Sliders size={14} />
            Gerador PGR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rota")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
              activeTab === "rota"
                ? "bg-[#B32025] text-white border-[#B32025]"
                : "bg-white text-[#1E293B] border-[#D1E1EB] hover:border-[#64748B]"
            )}
          >
            <Map size={14} />
            Rota
          </button>`;

content = content.replace(
  `          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
              activeTab === "gerador"
                ? "bg-[#B32025] text-white border-[#B32025]"
                : "bg-white text-[#1E293B] border-[#D1E1EB] hover:border-[#64748B]"
            )}
          >
            <Sliders size={14} />
            Gerador PGR
          </button>`,
  navTabs
);

// 3. Add Rota state and logic
const rotaStateStr = `  // Navigation tab state: 'gerador' | 'prancheta' | 'rota'
  const [activeTab, setActiveTab] = useState<'gerador' | 'prancheta' | 'rota'>('gerador');

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
    
    // Find column indexes from header
    const headers = lines[0].split('\\t').map(h => h.trim().toUpperCase());
    let cavaloIdx = headers.findIndex(h => h === 'CAVALO' || (h.includes('CAVALO') && !h.includes('MODELO')));
    let carretaIdx = headers.findIndex(h => h === 'CARRETA' || (h.includes('CARRETA') && !h.includes('MODELO') && !h.includes('ESTADO')));
    let transpIdx = headers.findIndex(h => h.includes('TRANSPORTADOR'));
    let motoristaIdx = headers.findIndex(h => h.includes('MOTORISTA'));
    
    // Fallbacks based on common Google Sheets columns
    if (cavaloIdx === -1 && lines.length > 1) {
       cavaloIdx = 12;
       carretaIdx = 13;
       transpIdx = 11;
    }
    
    const parsedMap = new Map<string, any>();
    
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
        const existing = parsedMap.get(cavalo)!;
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

// 4. Add Rota tab content
const rotaTabContent = `      {/* TAB CONTENT: Rota */}
      {activeTab === "rota" && (
        <div className="flex flex-col gap-6 max-w-[100rem] mx-auto w-full animate-fade-in">
           <div className="bg-white rounded-[2rem] border border-[#D1E1EB] shadow-sm p-6 sm:p-8 flex flex-col gap-6">
              <div>
                 <h2 className="text-xl font-black text-[#1E293B] uppercase tracking-wider mb-2">Importar da Planilha de Rota</h2>
                 <p className="text-sm text-[#64748B]">Cole as informações da planilha Google (incluindo o cabeçalho) no campo abaixo para gerar a lista de veículos.</p>
              </div>
              <textarea
                 className="w-full h-40 bg-[#F4F8FA] border border-[#D1E1EB] rounded-xl p-4 text-xs font-mono text-[#1E293B] outline-none focus:border-[#64748B] focus:ring-2 focus:ring-[#D1E1EB] resize-y transition-all"
                 placeholder="Cole aqui (Ctrl+V) os dados copiados da planilha..."
                 value={rotaPastedData}
                 onChange={(e) => setRotaPastedData(e.target.value)}
              />
              {parsedRotas.length > 0 && (
                 <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider">Veículos Encontrados ({parsedRotas.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                       {parsedRotas.map((rota, idx) => (
                          <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-[#94A3B8] transition-colors relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[#B32025]"></div>
                             <div className="flex items-center gap-2 mb-1 pl-1">
                               <div className="bg-[#1E293B] text-white text-[10px] px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                                 <Truck size={10} /> CAVALO: {rota.placaCavalo}
                               </div>
                               {rota.carreta1 && (
                                 <div className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-black uppercase border border-slate-300">
                                   CR 1: {rota.carreta1}
                                 </div>
                               )}
                               {rota.carreta2 && (
                                 <div className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-black uppercase border border-slate-300">
                                   CR 2: {rota.carreta2}
                                 </div>
                               )}
                             </div>
                             <div className="text-[11px] text-[#475569] flex flex-col gap-1.5 pl-1">
                               <span className="font-semibold uppercase flex items-center gap-1"><span className="text-[#94A3B8] w-20">Motorista:</span> {rota.motorista || "NÃO INFORMADO"}</span>
                               <span className="font-semibold uppercase flex items-center gap-1"><span className="text-[#94A3B8] w-20">Transp:</span> {rota.transportadora || "NÃO INFORMADA"}</span>
                             </div>
                             
                             <button
                               onClick={() => {
                                 setCavalo(rota.placaCavalo);
                                 setCarreta1(rota.carreta1);
                                 setCarreta2(rota.carreta2);
                                 if (rota.carreta2) {
                                   setNumCarretas(2);
                                 } else {
                                   setNumCarretas(1);
                                 }
                                 if (rota.transportadora) setTransportadora(rota.transportadora);
                                 if (rota.motorista) setMotorista(rota.motorista);
                                 setActiveTab("gerador");
                               }}
                               className="mt-2 w-full py-2 bg-white border-2 border-[#D1E1EB] hover:border-[#B32025] hover:text-[#B32025] text-[#1E293B] font-black uppercase text-[10px] tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-[#B32025] group-hover:text-white group-hover:border-[#B32025]"
                             >
                               <ArrowRight size={14} /> Importar para Controle
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        </div>
      )}
      </div>`;

content = content.replace(
  "      {/* TAB CONTENT: Gerador PGR */}",
  rotaTabContent + "\n\n      {/* TAB CONTENT: Gerador PGR */}"
);

fs.writeFileSync(file, content, 'utf8');
