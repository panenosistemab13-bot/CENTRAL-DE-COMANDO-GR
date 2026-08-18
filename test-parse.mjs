const lines = [
"Nº	ORIGEM	DIA	DATA	CONTATO WHATS	HORA LIBERADO	STATUS	MODELO CARRETA	MODELO CAVALO	FEZ CONTATO?	DESTINO	TRANSPORTADORA	CAVALO	CARRETA	ESTADO CARRETA	3 CARGO	CARREGOU ?	TERMO	VALOR NF	OPERAÇÃO",
"1	SANTA LUZIA	quinta	13/08	x	17:06:00	LIBERADO	SIDER	TRUCADO	SIM	GOV	GOBOR	BEY5I57	RYW8D78	SC	SIM	SIM	SIM	100	MACRO",
"3	MONTES CLAROS	sexta	14/08	x	23:27:11	LIBERADO	BAÚ	TRUCADO	SIM	SUMARÉ	TRANSMAGNA	TAR6H34	MKL8684	SC	SIM	NÃO	SIM	637	MACRO",
"4	MONTES CLAROS	sexta	14/08	x	23:27:12	LIBERADO	RODOTREM	TRUCADO	SIM	SUMARÉ	TRANSMAGNA	TAR6H34	MKL8624	SC	SIM	NÃO	SIM	644	MACRO"
];
const headers = lines[0].split('\t').map(h => h.trim().toUpperCase());
const cavaloIdx = headers.findIndex(h => h === 'CAVALO' || (h.includes('CAVALO') && !h.includes('MODELO')));
const carretaIdx = headers.findIndex(h => h === 'CARRETA' || (h.includes('CARRETA') && !h.includes('MODELO') && !h.includes('ESTADO')));
const transpIdx = headers.findIndex(h => h.includes('TRANSPORTADOR') || h === 'TRANSPORTADORA');
const destinoIdx = headers.findIndex(h => h === 'DESTINO');
console.log({ cavaloIdx, carretaIdx, transpIdx, destinoIdx });
