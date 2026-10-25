/* ESCIE INFORMATION NODE REGISTRY
 * Nodes are interface points into the public record system.
 * They are not separate fictional worlds.
 */
const ESCIE_NODES=[
{id:"node-now",label:"NOW",target:"#now",kind:"state",section:"now",role:"CURRENT STATE",description:"The current public signal.",metric:"latest",symbol:"◉"},
{id:"node-work",label:"WORK",target:"#art",kind:"work",section:"work",role:"TRANSMISSIONS",description:"Music and projects as transmissions.",metric:"work",symbol:"✳"},
{id:"node-web",label:"THE WEB",target:"#web",kind:"relationship",section:"web",role:"CONNECTIONS",description:"The visible network of people, places and records.",metric:"connections",symbol:"⌕"},
{id:"node-archive",label:"ARCHIVE",target:"#archives",kind:"evidence",section:"archive",role:"PUBLIC TRACE",description:"Preserved public traces and source material.",metric:"archive",symbol:"▣"},
{id:"node-investigation",label:"INVESTIGATION",target:"#investigation",kind:"question",section:"investigation",role:"OPEN QUESTIONS",description:"Questions, evidence and unresolved connections.",metric:"investigation",symbol:"?"},
{id:"node-glass-eye",label:"GLASS EYE",target:"#glass-eye",kind:"observation",section:"glass-eye",role:"OBSERVATION",description:"The recorded and observed layer.",metric:"media",symbol:"◎"},
{id:"node-escie",label:"ESCIE",target:"#escie",kind:"identity",section:"escie",role:"CENTRAL CONSCIOUSNESS",description:"The central consciousness and interface.",metric:"identity",symbol:"◇"}
];
if(typeof window!=="undefined")window.ESCIE_NODES=ESCIE_NODES;