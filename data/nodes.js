/* ESCIE INFORMATION NODE REGISTRY
 * Nodes are interface points into the public record system.
 * They are not separate fictional worlds.
 */
const ESCIE_NODES=[
{id:"node-now",label:"NOW",target:"#now",kind:"state",section:"now",role:"CURRENT STATE",description:"The current public signal.",metric:"latest",symbol:"◉",order:1,public:true},
{id:"node-work",label:"WORK",target:"#art",kind:"work",section:"work",role:"TRANSMISSIONS",description:"Music and projects as transmissions.",metric:"work",symbol:"✳",order:2,public:true},
{id:"node-world",label:"THE WORLD",target:"#world",kind:"world",section:"world",role:"THE LIVING INDEX",description:"The traversable public record: people, places, moments, fragments, symbols, trails and connections.",metric:"world",symbol:"◌",order:3,public:true},
{id:"node-merch",label:"MERCH",target:"#merch",kind:"merch",section:"merch",role:"THE PHYSICAL LAYER",description:"Physical objects from the world. Checkout and fulfillment remain external.",metric:"merch",symbol:"◇",order:3,public:true},
{id:"node-web",label:"THE WEB",target:"#web",kind:"relationship",section:"web",role:"CONNECTIONS",description:"The visible network of people, places and records.",metric:"connections",symbol:"⌕",order:4,public:true},
{id:"node-archive",label:"ARCHIVE",target:"#archives",kind:"evidence",section:"archive",role:"PUBLIC TRACE",description:"Preserved public traces and source material.",metric:"archive",symbol:"▣",order:5,public:true},
{id:"node-investigation",label:"INVESTIGATION",target:"#investigation",kind:"question",section:"investigation",role:"OPEN QUESTIONS",description:"Questions, evidence and unresolved connections.",metric:"investigation",symbol:"?",order:6,public:true},
{id:"node-glass-eye",label:"GLASS EYE",target:"#glass-eye",kind:"observation",section:"glass-eye",role:"OBSERVATION",description:"The recorded and observed layer.",metric:"media",symbol:"◎",order:8,public:true},
{id:"node-escie",label:"THE FATHER / THE MAN",target:"#escie",kind:"identity",section:"escie",role:"CENTRAL PRESENCE",description:"The Father / the Man. ESCIE is the human center of the work and world.",metric:"identity",symbol:"◇",order:7,public:true},
{id:"node-enter-world",label:"ENTER THE WORLD",target:"world/",kind:"game",section:"world",role:"PLAYABLE REALITY",description:"The dedicated playable RPG layer of the same ESCIE world.",metric:"game",symbol:"🎮",order:10,public:true}
];
if(typeof window!=="undefined")window.ESCIE_NODES=ESCIE_NODES;