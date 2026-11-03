/* ESCIE INFORMATION NODE REGISTRY
 * Nodes are interface points into the public record system.
 * They are not separate fictional worlds.
 */
const ESCIE_NODES=[
{id:"node-work",label:"ART",target:"#art",kind:"work",section:"work",role:"ART",description:"Music, writing, images, objects and projects made from life.",metric:"work",symbol:"✳",order:2,public:true},
{id:"node-world",label:"THE WORLD",target:"#world",kind:"world",section:"world",role:"THE LIVING INDEX",description:"The traversable public record: people, places, moments, fragments, symbols, trails and connections.",metric:"world",symbol:"◌",order:3,public:true},
{id:"node-web",label:"THE WEB",target:"#web",kind:"relationship",section:"web",role:"CONNECTIONS",description:"The visible network connecting people, places, moments and records.",metric:"connections",symbol:"⌕",order:4,public:true},
{id:"node-archive",label:"THE ARCHIVES",target:"#archives",kind:"evidence",section:"archive",role:"PUBLIC TRACE",description:"Preserved traces, sources, images and records.",metric:"archive",symbol:"▣",order:5,public:true},
{id:"node-investigation",label:"INVESTIGATION",target:"#investigation",kind:"question",section:"investigation",role:"OPEN QUESTIONS",description:"Questions, evidence and unresolved connections.",metric:"investigation",symbol:"?",order:6,public:true},
{id:"node-merch",label:"THE WORLD YOU CAN WEAR",target:"#merch",kind:"merch",section:"merch",role:"THE PHYSICAL LAYER",description:"Clothing as the physical layer of the ESCIE world.",metric:"merch",symbol:"◇",order:7,public:true},
{id:"node-glass-eye",label:"GLASS EYE",target:"#glass-eye",kind:"observation",section:"glass-eye",role:"THE AUDIENCE EYE",description:"Your side of the screen — see, hear, follow, miss and return.",metric:"media",symbol:"◎",order:8,public:true},
{id:"node-escie",label:"ESCIE",target:"#escie",kind:"identity",section:"escie",role:"THE ARTIST",description:"ESCIE is the artist. The work speaks from here.",metric:"identity",symbol:"◇",order:9,public:true},
{id:"node-now",label:"NOW",target:"#now",kind:"state",section:"now",role:"CURRENT STATE",description:"The current public signal.",metric:"latest",symbol:"◉",order:1,public:false}
];
if(typeof window!=="undefined")window.ESCIE_NODES=ESCIE_NODES;