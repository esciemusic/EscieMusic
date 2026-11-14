/* ESCIE INFORMATION NODE REGISTRY */
const ESCIE_NODES=[
{id:"node-now",label:"NOW",target:"#now",kind:"state",section:"now",role:"CURRENT STATE",description:"The current public signal.",metric:"latest",symbol:"◉",order:1,public:true},
{id:"node-art",label:"ART",target:"#art",kind:"work",section:"art",role:"ART",description:"Photography, writing, sound, film, drawing, painting, objects and experiments made from life.",metric:"work",symbol:"✳",order:2,public:true},
{id:"node-world",label:"THE WORLD",target:"#world",kind:"world",section:"world",role:"MONTRÉAL / NOW",description:"The living geographic record. Montréal first; locations appear as the world progresses.",metric:"world",symbol:"◌",order:3,public:true},
{id:"node-glass-eye",label:"GLASS EYE",target:"#glass-eye",kind:"observation",section:"glass-eye",role:"THE PARTICIPANT EYE",description:"See, hear, follow, miss, return — and leave something behind.",metric:"media",symbol:"◎",order:4,public:true},
{id:"node-web",label:"THE WEB",target:"#web",kind:"relationship",section:"web",role:"CONNECTIONS",description:"The visible network connecting public records, people, places and signals.",metric:"connections",symbol:"⌕",order:5,public:true},
{id:"node-archives",label:"THE ARCHIVES",label:"THE ARCHIVES",target:"#archives",kind:"evidence",section:"archives",role:"PUBLIC TRACE",description:"Preserved traces, sources, images and records.",metric:"archive",symbol:"▣",order:6,public:true},
{id:"node-investigation",label:"THE CASE FILES",target:"#investigation",kind:"question",section:"investigation",role:"OPEN QUESTIONS",description:"Open questions, approved evidence, contradictions and unresolved threads.",metric:"investigation",symbol:"?",order:7,public:true},
{id:"node-escie",label:"GLASS EYE",target:"#glass-eye",kind:"observation",section:"glass-eye",role:"THE PARTICIPANT EYE",description:"See, hear, follow, miss, return — and leave something behind.",,label:"ESCIE",target:"#escie",kind:"identity",section:"escie",role:"THE FATHER / THE MAN / THE MONSTER",description:"ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF.",metric:"identity",symbol:"◇",order:8,public:true}
];
if(typeof window!=="undefined")window.ESCIE_NODES=ESCIE_NODES;
if(typeof module!=="undefined"&&module.exports)module.exports=ESCIE_NODES;