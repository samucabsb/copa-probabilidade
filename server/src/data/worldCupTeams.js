/**
 * Todos os 48 classificados para a Copa do Mundo 2026 — grupos confirmados.
 * Grupos e informações de: FIFA / Copa do Mundo 2026 oficial.
 */
export const WORLD_CUP_TEAMS = [
  // ── GRUPO A: México, Coreia do Sul, Tchéquia, África do Sul ──────────────
  { name: "Mexico",       displayName: "México",         code: "MEX", flag: "🇲🇽", group: "A", fifaRank: 15, aliases: ["Mexico","México","MEX"] },
  { name: "South Korea",  displayName: "Coreia do Sul",  code: "KOR", flag: "🇰🇷", group: "A", fifaRank: 25, aliases: ["South Korea","Korea Republic","República da Coreia","Coreia do Sul","KOR"] },
  { name: "Czechia",      displayName: "República Tcheca", code: "CZE", flag: "🇨🇿", group: "A", fifaRank: 41, aliases: ["Czechia","Czech Republic","República Tcheca","Tchéquia","CZE"] },
  { name: "South Africa", displayName: "África do Sul",  code: "RSA", flag: "🇿🇦", group: "A", fifaRank: 60, aliases: ["South Africa","África do Sul","RSA"] },

  // ── GRUPO B: Suíça, Canadá, Catar, Bósnia ────────────────────────────────
  { name: "Switzerland",          displayName: "Suíça",                code: "SUI", flag: "🇨🇭", group: "B", fifaRank: 19, aliases: ["Switzerland","Suíça","SUI"] },
  { name: "Canada",               displayName: "Canadá",               code: "CAN", flag: "🇨🇦", group: "B", fifaRank: 39, aliases: ["Canada","Canadá","CAN"] },
  { name: "Qatar",                displayName: "Catar",                code: "QAT", flag: "🇶🇦", group: "B", fifaRank: 55, aliases: ["Qatar","Catar","QAT"] },
  { name: "Bosnia and Herzegovina", displayName: "Bósnia e Herzegovina", code: "BIH", flag: "🇧🇦", group: "B", fifaRank: 65, aliases: ["Bosnia and Herzegovina","Bosnia-Herzegovina","Bósnia e Herzegovina","BIH"] },

  // ── GRUPO C: Escócia, Marrocos, Brasil, Haiti ─────────────────────────────
  { name: "Scotland", displayName: "Escócia",  code: "SCO", flag: "🏴", group: "C", fifaRank: 43, aliases: ["Scotland","Escócia","SCO"] },
  { name: "Morocco",  displayName: "Marrocos", code: "MAR", flag: "🇲🇦", group: "C", fifaRank: 8,  aliases: ["Morocco","Marrocos","MAR"] },
  { name: "Brazil",   displayName: "Brasil",   code: "BRA", flag: "🇧🇷", group: "C", fifaRank: 6,  aliases: ["Brazil","Brasil","BRA"] },
  { name: "Haiti",    displayName: "Haiti",    code: "HAI", flag: "🇭🇹", group: "C", fifaRank: 83, aliases: ["Haiti","HAI"] },

  // ── GRUPO D: EUA, Austrália, Turquia, Paraguai ────────────────────────────
  { name: "United States", displayName: "Estados Unidos", code: "USA", flag: "🇺🇸", group: "D", fifaRank: 16, aliases: ["United States","USA","United States Soccer","Estados Unidos"] },
  { name: "Australia",     displayName: "Austrália",      code: "AUS", flag: "🇦🇺", group: "D", fifaRank: 20, aliases: ["Australia","Austrália","AUS"] },
  { name: "Turkey",        displayName: "Turquia",        code: "TUR", flag: "🇹🇷", group: "D", fifaRank: 22, aliases: ["Turkey","Türkiye","Turquia","TUR"] },
  { name: "Paraguay",      displayName: "Paraguai",       code: "PAR", flag: "🇵🇾", group: "D", fifaRank: 40, aliases: ["Paraguay","Paraguai","PAR"] },

  // ── GRUPO E: Alemanha, Curaçao, Equador, Costa do Marfim ─────────────────
  { name: "Germany",    displayName: "Alemanha",       code: "GER", flag: "🇩🇪", group: "E", fifaRank: 10, aliases: ["Germany","Alemanha","GER"] },
  { name: "Curacao",    displayName: "Curaçao",        code: "CUW", flag: "🇨🇼", group: "E", fifaRank: 82, aliases: ["Curacao","Curaçao","CUW"] },
  { name: "Ecuador",    displayName: "Equador",        code: "ECU", flag: "🇪🇨", group: "E", fifaRank: 23, aliases: ["Ecuador","Equador","ECU"] },
  { name: "Ivory Coast",displayName: "Costa do Marfim",code: "CIV", flag: "🇨🇮", group: "E", fifaRank: 34, aliases: ["Ivory Coast","Côte d'Ivoire","Cote d Ivoire","Costa do Marfim","CIV"] },

  // ── GRUPO F: Holanda, Suécia, Japão, Tunísia ─────────────────────────────
  { name: "Netherlands", displayName: "Holanda", code: "NED", flag: "🇳🇱", group: "F", fifaRank: 7,  aliases: ["Netherlands","Holland","Holanda","Países Baixos","NED"] },
  { name: "Sweden",      displayName: "Suécia",        code: "SWE", flag: "🇸🇪", group: "F", fifaRank: 38, aliases: ["Sweden","Suécia","SWE"] },
  { name: "Japan",       displayName: "Japão",         code: "JPN", flag: "🇯🇵", group: "F", fifaRank: 18, aliases: ["Japan","Japão","JPN"] },
  { name: "Tunisia",     displayName: "Tunísia",       code: "TUN", flag: "🇹🇳", group: "F", fifaRank: 44, aliases: ["Tunisia","Tunísia","TUN"] },

  // ── GRUPO G: Bélgica, Irã, Egito, Nova Zelândia ──────────────────────────
  { name: "Belgium",     displayName: "Bélgica",      code: "BEL", flag: "🇧🇪", group: "G", fifaRank: 9,  aliases: ["Belgium","Bélgica","BEL"] },
  { name: "Iran",        displayName: "Irã",          code: "IRN", flag: "🇮🇷", group: "G", fifaRank: 21, aliases: ["Iran","IR Iran","RI do Irã","Irã","IRN"] },
  { name: "Egypt",       displayName: "Egito",        code: "EGY", flag: "🇪🇬", group: "G", fifaRank: 29, aliases: ["Egypt","Egito","EGY"] },
  { name: "New Zealand", displayName: "Nova Zelândia",code: "NZL", flag: "🇳🇿", group: "G", fifaRank: 89, aliases: ["New Zealand","Nova Zelândia","NZL"] },

  // ── GRUPO H: Espanha, Uruguai, Arábia Saudita, Cabo Verde ────────────────
  { name: "Spain",        displayName: "Espanha",       code: "ESP", flag: "🇪🇸", group: "H", fifaRank: 2,  aliases: ["Spain","Espanha","ESP"] },
  { name: "Uruguay",      displayName: "Uruguai",       code: "URU", flag: "🇺🇾", group: "H", fifaRank: 17, aliases: ["Uruguay","Uruguai","URU"] },
  { name: "Saudi Arabia", displayName: "Arábia Saudita",code: "KSA", flag: "🇸🇦", group: "H", fifaRank: 61, aliases: ["Saudi Arabia","Arábia Saudita","KSA"] },
  { name: "Cape Verde",   displayName: "Cabo Verde",    code: "CPV", flag: "🇨🇻", group: "H", fifaRank: 69, aliases: ["Cape Verde","Cabo Verde","CPV"] },

  // ── GRUPO I: França, Noruega, Senegal, Iraque ────────────────────────────
  { name: "France",   displayName: "França",  code: "FRA", flag: "🇫🇷", group: "I", fifaRank: 1,  aliases: ["France","França","FRA"] },
  { name: "Norway",   displayName: "Noruega", code: "NOR", flag: "🇳🇴", group: "I", fifaRank: 31, aliases: ["Norway","Noruega","NOR"] },
  { name: "Senegal",  displayName: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", fifaRank: 14, aliases: ["Senegal","SEN"] },
  { name: "Iraq",     displayName: "Iraque",  code: "IRQ", flag: "🇮🇶", group: "I", fifaRank: 57, aliases: ["Iraq","Iraque","IRQ"] },

  // ── GRUPO J: Argentina, Argélia, Áustria, Jordânia ───────────────────────
  { name: "Argentina", displayName: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", fifaRank: 3,  aliases: ["Argentina","ARG"] },
  { name: "Algeria",   displayName: "Argélia",   code: "ALG", flag: "🇩🇿", group: "J", fifaRank: 28, aliases: ["Algeria","Argélia","ALG"] },
  { name: "Austria",   displayName: "Áustria",   code: "AUT", flag: "🇦🇹", group: "J", fifaRank: 24, aliases: ["Austria","Áustria","AUT"] },
  { name: "Jordan",    displayName: "Jordânia",  code: "JOR", flag: "🇯🇴", group: "J", fifaRank: 63, aliases: ["Jordan","Jordânia","JOR"] },

  // ── GRUPO K: Colômbia, Portugal, RD Congo, Uzbequistão ───────────────────
  { name: "Colombia",   displayName: "Colômbia",    code: "COL", flag: "🇨🇴", group: "K", fifaRank: 13, aliases: ["Colombia","Colômbia","COL"] },
  { name: "Portugal",   displayName: "Portugal",    code: "POR", flag: "🇵🇹", group: "K", fifaRank: 5,  aliases: ["Portugal","POR"] },
  { name: "DR Congo",   displayName: "RD Congo",    code: "COD", flag: "🇨🇩", group: "K", fifaRank: 46, aliases: ["DR Congo","Congo DR","Democratic Republic of the Congo","RD do Congo","RD Congo","COD"] },
  { name: "Uzbekistan", displayName: "Uzbequistão", code: "UZB", flag: "🇺🇿", group: "K", fifaRank: 50, aliases: ["Uzbekistan","Uzbequistão","UZB"] },

  // ── GRUPO L: Croácia, Gana, Inglaterra, Panamá ───────────────────────────
  { name: "Croatia",  displayName: "Croácia",   code: "CRO", flag: "🇭🇷", group: "L", fifaRank: 11, aliases: ["Croatia","Croácia","CRO"] },
  { name: "Ghana",    displayName: "Gana",      code: "GHA", flag: "🇬🇭", group: "L", fifaRank: 74, aliases: ["Ghana","Gana","GHA"] },
  { name: "England",  displayName: "Inglaterra",code: "ENG", flag: "🏴", group: "L", fifaRank: 4,  aliases: ["England","Inglaterra","ENG"] },
  { name: "Panama",   displayName: "Panamá",   code: "PAN", flag: "🇵🇦", group: "L", fifaRank: 33, aliases: ["Panama","Panamá","PAN"] },
];

export function getTeamByName(name) {
  const n = normalize(name);
  return WORLD_CUP_TEAMS.find(t =>
    normalize(t.name) === n ||
    normalize(t.displayName) === n ||
    normalize(t.code) === n ||
    t.aliases.some(a => normalize(a) === n)
  );
}

export function normalize(v = '') {
  return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}
