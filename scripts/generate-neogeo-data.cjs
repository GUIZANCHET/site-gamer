const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NEOGEO_DIR = path.join(ROOT, 'neogeo');
const COVERS_DIR = path.join(ROOT, 'assets', 'covers', 'neogeo');

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

// Copy known arcade PNG covers if available
try {
  const kof98Src = path.join(ROOT, 'assets', 'covers', 'arcade', 'kof-98.png');
  const mslugSrc = path.join(ROOT, 'assets', 'covers', 'arcade', 'metal-slug.png');
  if (fs.existsSync(kof98Src)) {
    fs.copyFileSync(kof98Src, path.join(COVERS_DIR, 'kof98.png'));
  }
  if (fs.existsSync(mslugSrc)) {
    fs.copyFileSync(mslugSrc, path.join(COVERS_DIR, 'mslug.png'));
  }
} catch (e) {
  console.warn('Could not copy arcade PNG covers:', e.message);
}

const ROM_METADATA = {
  "2020bb": { title: "2020 Super Baseball", genre: "Esportes", featured: false },
  "3countb": { title: "3 Count Bout (Fire Suplex)", genre: "Luta", featured: false },
  "alpham2": { title: "Alpha Mission II (ASO II)", genre: "Nave / Tiro", featured: false },
  "androdun": { title: "Andro Dunos", genre: "Nave / Tiro", featured: false },
  "aodk": { title: "Aggressors of Dark Kombat", genre: "Luta", featured: false },
  "aof": { title: "Art of Fighting", genre: "Luta", featured: false },
  "aof2": { title: "Art of Fighting 2", genre: "Luta", featured: true },
  "aof3": { title: "Art of Fighting 3: The Path of the Warrior", genre: "Luta", featured: false },
  "b2b": { title: "Bang Bang Busters", genre: "Ação / Plataforma", featured: false },
  "bakatono": { title: "Bakatonosama Mahjong Manyuki", genre: "Puzzle / Tabuleiro", featured: false },
  "bangbead": { title: "Bang Bead", genre: "Esportes / Arcade", featured: false },
  "bjourney": { title: "Blue's Journey (Raguy)", genre: "Ação / Plataforma", featured: false },
  "blazstar": { title: "Blazing Star", genre: "Nave / Tiro", featured: true },
  "breakers": { title: "Breakers", genre: "Luta", featured: false },
  "breakrev": { title: "Breakers Revenge", genre: "Luta", featured: true },
  "bstars": { title: "Baseball Stars Professional", genre: "Esportes", featured: false },
  "bstars2": { title: "Baseball Stars 2", genre: "Esportes", featured: true },
  "burningf": { title: "Burning Fight", genre: "Ação / Luta", featured: false },
  "cnbe": { title: "Cyber-Lip (Alternate Edition)", genre: "Ação / Tiro", featured: false },
  "columnsn": { title: "Columns", genre: "Puzzle", featured: false },
  "crswd2bl": { title: "Crossed Swords II", genre: "Ação / RPG", featured: false },
  "crsword": { title: "Crossed Swords", genre: "Ação / RPG", featured: false },
  "ctomaday": { title: "Captain Tomaday", genre: "Nave / Tiro", featured: false },
  "cyberlip": { title: "Cyber-Lip", genre: "Ação / Tiro", featured: false },
  "diggerma": { title: "Digger Man", genre: "Arcade / Ação", featured: false },
  "doubledr": { title: "Double Dragon (Neo Geo)", genre: "Luta", featured: true },
  "eightman": { title: "Eight Man", genre: "Ação / Luta", featured: false },
  "fatfursp": { title: "Fatal Fury Special", genre: "Luta", featured: true },
  "fatfury1": { title: "Fatal Fury: King of Fighters", genre: "Luta", featured: false },
  "fatfury2": { title: "Fatal Fury 2", genre: "Luta", featured: false },
  "fatfury3": { title: "Fatal Fury 3: Road to the Final Victory", genre: "Luta", featured: false },
  "fbfrenzy": { title: "Football Frenzy", genre: "Esportes", featured: false },
  "ffeast": { title: "Far East of Eden: Kabuki Klash", genre: "Luta", featured: false },
  "fightfev": { title: "Fight Fever", genre: "Luta", featured: false },
  "flipshot": { title: "Battle Flip Shot", genre: "Esportes / Arcade", featured: false },
  "froman2b": { title: "Idol Mahjong Final Romance 2", genre: "Puzzle / Tabuleiro", featured: false },
  "galaxyfg": { title: "Galaxy Fight: Universal Warriors", genre: "Luta", featured: false },
  "ganryu": { title: "Ganryu (Musashi Ganryuki)", genre: "Ação / Plataforma", featured: false },
  "ghostlop": { title: "Ghostlop", genre: "Puzzle / Arcade", featured: false },
  "goalx3": { title: "Goal! Goal! Goal!", genre: "Esportes", featured: false },
  "gowcaizr": { title: "Voltage Fighter Gowcaizer", genre: "Luta", featured: false },
  "gpilots": { title: "Ghost Pilots", genre: "Nave / Tiro", featured: false },
  "gururin": { title: "Gururin", genre: "Puzzle", featured: false },
  "ironclad": { title: "Ironclad (Choutetsu Brikin'ger)", genre: "Nave / Tiro", featured: false },
  "irrmaze": { title: "The Irritating Maze", genre: "Puzzle / Arcade", featured: false },
  "janshin": { title: "Jyanshin Densetsu: Quest of Jongmaster", genre: "Puzzle / Tabuleiro", featured: false },
  "jockeygp": { title: "Jockey Grand Prix", genre: "Esportes / Corrida", featured: false },
  "joyjoy": { title: "Puzzled (Joy Joy Kid)", genre: "Puzzle", featured: false },
  "kabukikl": { title: "Kabuki Klash (Tengai Makyou Shinden)", genre: "Luta", featured: false },
  "karnovr": { title: "Karnov's Revenge (Fighter's History Dynamite)", genre: "Luta", featured: true },
  "kizuna": { title: "Kizuna Encounter: Super Tag Battle", genre: "Luta", featured: true },
  "kof2000": { title: "The King of Fighters 2000", genre: "Luta", featured: true },
  "kof2001": { title: "The King of Fighters 2001", genre: "Luta", featured: false },
  "kof2002": { title: "The King of Fighters 2002: Challenge to Ultimate Battle", genre: "Luta", featured: true },
  "kof2003": { title: "The King of Fighters 2003", genre: "Luta", featured: true },
  "kof94": { title: "The King of Fighters '94", genre: "Luta", featured: false },
  "kof95": { title: "The King of Fighters '95", genre: "Luta", featured: false },
  "kof96": { title: "The King of Fighters '96", genre: "Luta", featured: false },
  "kof97": { title: "The King of Fighters '97", genre: "Luta", featured: true },
  "kof98": { title: "The King of Fighters '98: The Slugfest", genre: "Luta", featured: true },
  "kotm": { title: "King of the Monsters", genre: "Luta", featured: false },
  "kotm2": { title: "King of the Monsters 2: The Next Thing", genre: "Luta", featured: false },
  "lastblad": { title: "The Last Blade (Gekka no Kenshi)", genre: "Luta", featured: true },
  "lastbld2": { title: "The Last Blade 2", genre: "Luta", featured: true },
  "lasthope": { title: "Last Hope", genre: "Nave / Tiro", featured: false },
  "lbowling": { title: "League Bowling", genre: "Esportes", featured: false },
  "legendos": { title: "Legend of Success Joe", genre: "Luta", featured: false },
  "lresort": { title: "Last Resort", genre: "Nave / Tiro", featured: true },
  "ltorb": { title: "Last Resort (Prototype)", genre: "Nave / Tiro", featured: false },
  "magdrop2": { title: "Magical Drop II", genre: "Puzzle", featured: true },
  "magdrop3": { title: "Magical Drop III", genre: "Puzzle", featured: true },
  "maglord": { title: "Magician Lord", genre: "Ação / Plataforma", featured: false },
  "mahretsu": { title: "Mahjong Kyoretsuden", genre: "Puzzle / Tabuleiro", featured: false },
  "marukodq": { title: "Chibi Maruko-chan Deluxe Quiz", genre: "Quiz / Trivia", featured: false },
  "miexchng": { title: "Money Idol Exchanger", genre: "Puzzle", featured: false },
  "minasan": { title: "Minnasanno Okagesamadesu", genre: "Puzzle / Tabuleiro", featured: false },
  "moshougi": { title: "Syougi No Tatsujin: Master of Syougi", genre: "Puzzle / Tabuleiro", featured: false },
  "mslug": { title: "Metal Slug: Super Vehicle-001", genre: "Ação / Tiro", featured: true },
  "mslug2": { title: "Metal Slug 2: Super Vehicle-001/II", genre: "Ação / Tiro", featured: true },
  "mslug3": { title: "Metal Slug 3", genre: "Ação / Tiro", featured: true },
  "mslug4": { title: "Metal Slug 4", genre: "Ação / Tiro", featured: true },
  "mslug5": { title: "Metal Slug 5", genre: "Ação / Tiro", featured: true },
  "mslugx": { title: "Metal Slug X: Super Vehicle-001", genre: "Ação / Tiro", featured: true },
  "mutnat": { title: "Mutation Nation", genre: "Ação / Luta", featured: false },
  "nam1975": { title: "NAM-1975", genre: "Ação / Tiro", featured: true },
  "ncombat": { title: "Ninja Combat", genre: "Ação / Luta", featured: false },
  "ncommand": { title: "Ninja Commando", genre: "Ação / Tiro", featured: false },
  "neobombe": { title: "Neo Bomberman", genre: "Ação / Puzzle", featured: true },
  "neocup98": { title: "Neo Geo Cup '98: The Road to the Victory", genre: "Esportes", featured: false },
  "neodrift": { title: "Neo Drift Out: New Technology", genre: "Corrida", featured: true },
  "neomrdo": { title: "Neo Mr. Do!", genre: "Arcade / Ação", featured: false },
  "neonopon": { title: "Neo No Panepon", genre: "Puzzle", featured: false },
  "neopong": { title: "Neo Pong", genre: "Esportes / Arcade", featured: false },
  "neothund": { title: "Neo Thunder", genre: "Nave / Tiro", featured: false },
  "ngem2k": { title: "Neo Geo EM2K", genre: "Arcade / Ação", featured: false },
  "ngtetris": { title: "Neo Geo Tetris", genre: "Puzzle", featured: false },
  "ninjamas": { title: "Ninja Master's: Haoh Ninpo Cho", genre: "Luta", featured: false },
  "nitd": { title: "Nightmare in the Dark", genre: "Ação / Plataforma", featured: true },
  "overtop": { title: "Over Top", genre: "Corrida", featured: false },
  "panicbom": { title: "Panic Bomber: Bomberman", genre: "Puzzle", featured: false },
  "pbobbl2n": { title: "Puzzle Bobble 2 / Bust-A-Move Again", genre: "Puzzle", featured: true },
  "pbobblen": { title: "Puzzle Bobble / Bust-A-Move", genre: "Puzzle", featured: true },
  "pgoal": { title: "Pleasure Goal: 5 on 5 Mini Soccer", genre: "Esportes", featured: false },
  "pnyaa": { title: "Pochi and Nyaa", genre: "Puzzle", featured: false },
  "poknight": { title: "Poker Night", genre: "Cartas / Casino", featured: false },
  "popbounc": { title: "Pop 'n Bounce (Gonta de Pokkun)", genre: "Arcade / Puzzle", featured: false },
  "powerins": { title: "Power Instinct (Gouketsuji Ichizoku)", genre: "Luta", featured: false },
  "preisle2": { title: "Prehistoric Isle 2", genre: "Nave / Tiro", featured: true },
  "pspikes2": { title: "Power Spikes II", genre: "Esportes", featured: false },
  "pulstar": { title: "Pulstar", genre: "Nave / Tiro", featured: true },
  "puzzldpr": { title: "Puzzle De Pon! R!", genre: "Puzzle", featured: false },
  "puzzledp": { title: "Puzzle De Pon!", genre: "Puzzle", featured: false },
  "quizdai2": { title: "Quiz Meijin Sen 2", genre: "Quiz / Trivia", featured: false },
  "quizdais": { title: "Quiz Daisousasen: The Last Count Down", genre: "Quiz / Trivia", featured: false },
  "quizkof": { title: "Quiz King of Fighters", genre: "Quiz / Trivia", featured: false },
  "ragnagrd": { title: "Ragnagard (Shin-Oh-Ken)", genre: "Luta", featured: false },
  "rbff1": { title: "Real Bout Fatal Fury", genre: "Luta", featured: true },
  "rbff2": { title: "Real Bout Fatal Fury 2: The Newcomers", genre: "Luta", featured: true },
  "rbffspec": { title: "Real Bout Fatal Fury Special", genre: "Luta", featured: true },
  "ridhero": { title: "Riding Hero", genre: "Corrida", featured: false },
  "roboarmy": { title: "Robo Army", genre: "Ação / Luta", featured: false },
  "rotd": { title: "Rage of the Dragons", genre: "Luta", featured: true },
  "samsh5sp": { title: "Samurai Shodown V Special", genre: "Luta", featured: true },
  "samsho": { title: "Samurai Shodown", genre: "Luta", featured: false },
  "samsho2": { title: "Samurai Shodown II", genre: "Luta", featured: true },
  "samsho3": { title: "Samurai Shodown III: Blades of Blood", genre: "Luta", featured: false },
  "samsho4": { title: "Samurai Shodown IV: Amakusa's Revenge", genre: "Luta", featured: true },
  "savagere": { title: "Savage Reign (Fu'un Mokushiroku)", genre: "Luta", featured: false },
  "sbp": { title: "Super Bubble Pop", genre: "Puzzle", featured: false },
  "sdodgeb": { title: "Super Dodge Ball (Kunio no Nekketsu)", genre: "Esportes", featured: true },
  "sengoku": { title: "Sengoku (Sengoku Denshou)", genre: "Ação / Luta", featured: false },
  "sengoku2": { title: "Sengoku 2", genre: "Ação / Luta", featured: false },
  "sengoku3": { title: "Sengoku 3", genre: "Ação / Luta", featured: true },
  "shocktr2": { title: "Shock Troopers: 2nd Squad", genre: "Ação / Tiro", featured: true },
  "shocktro": { title: "Shock Troopers", genre: "Ação / Tiro", featured: true },
  "socbrawl": { title: "Soccer Brawl", genre: "Esportes", featured: false },
  "sonicwi2": { title: "Aero Fighters 2 (Sonic Wings 2)", genre: "Nave / Tiro", featured: true },
  "sonicwi3": { title: "Aero Fighters 3 (Sonic Wings 3)", genre: "Nave / Tiro", featured: true },
  "spinmast": { title: "Spin Master (Miracle Adventure)", genre: "Ação / Plataforma", featured: true },
  "ssideki": { title: "Super Sidekicks", genre: "Esportes", featured: false },
  "ssideki2": { title: "Super Sidekicks 2: The World Championship", genre: "Esportes", featured: true },
  "ssideki3": { title: "Super Sidekicks 3: The Next Glory", genre: "Esportes", featured: false },
  "ssideki4": { title: "The Ultimate 11: SNK Football Championship", genre: "Esportes", featured: false },
  "stakwin": { title: "Stakes Winner", genre: "Esportes", featured: false },
  "stakwin2": { title: "Stakes Winner 2", genre: "Esportes", featured: false },
  "strhoop": { title: "Street Hoop (Dunk Dream)", genre: "Esportes", featured: true },
  "superspy": { title: "The Super Spy", genre: "Ação / Luta", featured: false },
  "tophuntr": { title: "Top Hunter: Roddy & Cathy", genre: "Ação / Plataforma", featured: true },
  "totc": { title: "The King of Fighters: 10th Anniversary Extra Plus", genre: "Luta", featured: false },
  "tpgolf": { title: "Top Player's Golf", genre: "Esportes", featured: false },
  "trally": { title: "Thrash Rally", genre: "Corrida", featured: false },
  "turfmast": { title: "Neo Turf Masters (Big Tournament Golf)", genre: "Esportes", featured: true },
  "twinspri": { title: "Twinkle Star Sprites", genre: "Nave / Tiro", featured: true },
  "twsoc96": { title: "Tecmo World Soccer '96", genre: "Esportes", featured: false },
  "viewpoin": { title: "Viewpoint", genre: "Nave / Tiro", featured: true },
  "vliner": { title: "V-Liner", genre: "Cartas / Casino", featured: false },
  "wakuwak7": { title: "Waku Waku 7", genre: "Luta", featured: true },
  "wh1": { title: "World Heroes", genre: "Luta", featured: false },
  "wh2": { title: "World Heroes 2", genre: "Luta", featured: false },
  "wh2j": { title: "World Heroes 2 Jet", genre: "Luta", featured: false },
  "whp": { title: "World Heroes Perfect", genre: "Luta", featured: true },
  "wjammers": { title: "Windjammers (Flying Power Disc)", genre: "Esportes", featured: true },
  "zedblade": { title: "Zed Blade (Operation Ragnarok)", genre: "Nave / Tiro", featured: false },
  "zintrckb": { title: "Zintrick (Oshidashi Zintrick)", genre: "Puzzle", featured: false },
  "zupapa": { title: "Zupapa!", genre: "Ação / Plataforma", featured: false }
};

// SVG Themes per genre
const GENRE_THEMES = {
  "Luta": {
    bg1: "#1A0606", bg2: "#380D0E", accent: "#E60012", highlight: "#FFD700", icon: "🥊", label: "FIGHTING"
  },
  "Ação / Tiro": {
    bg1: "#0B150F", bg2: "#193322", accent: "#2ECC71", highlight: "#F39C12", icon: "💥", label: "ACTION / SHOOTER"
  },
  "Ação / Plataforma": {
    bg1: "#101026", bg2: "#202052", accent: "#3B82F6", highlight: "#00F0FF", icon: "🏃", label: "PLATFORMER"
  },
  "Ação / Luta": {
    bg1: "#1A0F0A", bg2: "#3D1E10", accent: "#E67E22", highlight: "#FFCC00", icon: "🥋", label: "BEAT 'EM UP"
  },
  "Ação / RPG": {
    bg1: "#140A20", bg2: "#2E154A", accent: "#9B59B6", highlight: "#E056FD", icon: "⚔️", label: "ACTION RPG"
  },
  "Nave / Tiro": {
    bg1: "#061324", bg2: "#0F2848", accent: "#00D2D3", highlight: "#54A0FF", icon: "🚀", label: "SHMUP"
  },
  "Esportes": {
    bg1: "#061E14", bg2: "#0E3E2A", accent: "#10B981", highlight: "#F1C40F", icon: "⚽", label: "SPORTS"
  },
  "Esportes / Arcade": {
    bg1: "#1E1805", bg2: "#3D310A", accent: "#F59E0B", highlight: "#FF6B6B", icon: "🏆", label: "ARCADE SPORTS"
  },
  "Esportes / Corrida": {
    bg1: "#1A1005", bg2: "#38230A", accent: "#F39C12", highlight: "#E74C3C", icon: "🏇", label: "RACING"
  },
  "Corrida": {
    bg1: "#1E0D05", bg2: "#3F1B0A", accent: "#FF4757", highlight: "#FFA502", icon: "🏎️", label: "RACING"
  },
  "Puzzle": {
    bg1: "#1A0620", bg2: "#3D0E4A", accent: "#ED4C67", highlight: "#F368E0", icon: "🧩", label: "PUZZLE"
  },
  "Puzzle / Arcade": {
    bg1: "#150826", bg2: "#2D1252", accent: "#9B51E0", highlight: "#FF7675", icon: "🎯", label: "ARCADE PUZZLE"
  },
  "Puzzle / Tabuleiro": {
    bg1: "#121A0F", bg2: "#24351E", accent: "#2ED573", highlight: "#ECCC68", icon: "🀄", label: "BOARD / MAHJONG"
  },
  "Quiz / Trivia": {
    bg1: "#0A1826", bg2: "#14304D", accent: "#3867D6", highlight: "#45AAF2", icon: "❓", label: "QUIZ & TRIVIA"
  },
  "Cartas / Casino": {
    bg1: "#0A1E14", bg2: "#143C28", accent: "#20BF6B", highlight: "#FA8231", icon: "🃏", label: "CASINO"
  },
  "Arcade / Ação": {
    bg1: "#151515", bg2: "#282828", accent: "#E60012", highlight: "#F1C40F", icon: "🕹️", label: "ARCADE CLASSIC"
  }
};

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateSvgCard(romKey, meta) {
  const theme = GENRE_THEMES[meta.genre] || GENRE_THEMES["Arcade / Ação"];
  const title = meta.title;
  const isFeatured = Boolean(meta.featured);

  // Split title if long
  let line1 = title;
  let line2 = "";
  if (title.length > 22) {
    const words = title.split(" ");
    let cur = "";
    let splitIdx = words.length;
    for (let i = 0; i < words.length; i++) {
      if ((cur + " " + words[i]).trim().length > 20) {
        splitIdx = i || 1;
        break;
      }
      cur = (cur + " " + words[i]).trim();
    }
    line1 = words.slice(0, splitIdx).join(" ");
    line2 = words.slice(splitIdx).join(" ");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
  <defs>
    <linearGradient id="g_${romKey}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="50%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <pattern id="pat_${romKey}" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow_${romKey}" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="380" fill="url(#g_${romKey})"/>
  <rect width="600" height="380" fill="url(#pat_${romKey})"/>
  <circle cx="300" cy="140" r="220" fill="url(#glow_${romKey})"/>

  <!-- Arcade Marquee Header Bar -->
  <rect x="0" y="0" width="600" height="42" fill="#0D0D0D"/>
  <rect x="0" y="40" width="600" height="2" fill="${theme.accent}"/>
  <text x="24" y="27" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="13" font-weight="700" fill="#E60012" letter-spacing="1.5">NEO•GEO</text>
  <text x="100" y="27" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="11" font-weight="600" fill="#888888" letter-spacing="1.5">MVS / AES SYSTEM</text>
  <rect x="470" y="10" width="106" height="22" rx="4" fill="rgba(255,255,255,0.08)"/>
  <text x="523" y="25" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="${theme.highlight}" letter-spacing="1">100 MEGA SHOCK</text>

  <!-- Central Arcade Visual Element -->
  <g transform="translate(300, 150)">
    <circle cx="0" cy="0" r="64" fill="rgba(0,0,0,0.5)" stroke="${theme.accent}" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4" stroke-width="2"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">${theme.icon}</text>
  </g>

  <!-- Neo Geo 4-Button Color Accent Pill -->
  <g transform="translate(252, 230)">
    <circle cx="0" cy="0" r="6" fill="#E60012"/><!-- A Red -->
    <circle cx="32" cy="0" r="6" fill="#F1C40F"/><!-- B Yellow -->
    <circle cx="64" cy="0" r="6" fill="#2ECC71"/><!-- C Green -->
    <circle cx="96" cy="0" r="6" fill="#3498DB"/><!-- D Blue -->
  </g>

  <!-- Title & Genre Footer Block -->
  <rect x="18" y="256" width="564" height="106" rx="10" fill="rgba(12,12,12,0.88)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>

  <!-- Category & Featured Badges -->
  <text x="36" y="284" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="${theme.highlight}" letter-spacing="1.2">${escapeXml(theme.label)}</text>
  ${isFeatured ? `
  <rect x="490" y="268" width="76" height="22" rx="5" fill="#E60012"/>
  <text x="528" y="283" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" letter-spacing="1">★ CLÁSSICO</text>
  ` : ''}

  <!-- Game Title -->
  <text x="36" y="${line2 ? '315' : '325'}" font-family="'Space Grotesk', 'Plus Jakarta Sans', sans-serif" font-size="${line2 ? '20' : '22'}" font-weight="700" fill="#FFFFFF">${escapeXml(line1)}</text>
  ${line2 ? `<text x="36" y="342" font-family="'Space Grotesk', 'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600" fill="#CCCCCC">${escapeXml(line2)}</text>` : ''}
</svg>`;
}

// Read all files
const romFiles = fs.readdirSync(NEOGEO_DIR)
  .filter(f => f.endsWith('.zip') && f.toLowerCase() !== 'neogeo.zip')
  .sort((a, b) => a.localeCompare(b, 'pt-BR'));

const gamesCatalog = [];

for (const filename of romFiles) {
  const romBase = filename.replace(/\.zip$/i, '');
  const meta = ROM_METADATA[romBase] || {
    title: romBase.toUpperCase(),
    genre: "Arcade / Ação",
    featured: false
  };

  const svgPath = path.join(COVERS_DIR, `${romBase}.svg`);
  const pngPath = path.join(COVERS_DIR, `${romBase}.png`);
  
  // Write SVG card if PNG doesn't exist
  fs.writeFileSync(svgPath, generateSvgCard(romBase, meta), 'utf8');

  let coverRel = `assets/covers/neogeo/${romBase}.svg`;
  if (fs.existsSync(pngPath)) {
    coverRel = `assets/covers/neogeo/${romBase}.png`;
  }

  gamesCatalog.push({
    name: filename,
    title: meta.title,
    region: "Arcade (MVS/AES)",
    genre: meta.genre,
    featured: Boolean(meta.featured),
    url: `/neogeo/${encodeURIComponent(filename)}`,
    cover: coverRel
  });
}

// Sort alphabetically by title
gamesCatalog.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

// Write neogeo-games.json
const jsonOutput = path.join(ROOT, 'neogeo-games.json');
fs.writeFileSync(jsonOutput, JSON.stringify(gamesCatalog, null, 2), 'utf8');

console.log(`✅ neogeo-games.json criado com sucesso com ${gamesCatalog.length} jogos.`);
console.log(`🎨 Capas geradas em assets/covers/neogeo/`);
