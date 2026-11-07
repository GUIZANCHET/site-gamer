const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SNES_ROM_DIR = path.join(ROOT, 'Super nintendo', 'GAMES');
const COVERS_SNES_DIR = path.join(ROOT, 'assets', 'covers', 'snes');
const COVERS_PS1_DIR = path.join(ROOT, 'assets', 'covers', 'ps1');
const COVERS_ARCADE_DIR = path.join(ROOT, 'assets', 'covers', 'arcade');

for (const dir of [COVERS_SNES_DIR, COVERS_PS1_DIR, COVERS_ARCADE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const ROMAN_MAP = { ii: '2', iii: '3', iv: '4', vi: '6', vii: '7', viii: '8' };

const MANUAL_SNES_OVERRIDES = {
  'ad d eye of beholder': 'Advanced Dungeons _ Dragons - Eye of the Beholder (USA)',
  'adventures of tintin prisoners of sun': 'Tintin - Prisoners of the Sun (Europe) (En,Fr,De,Es)',
  'air strike patrol': 'A.S.P. - Air Strike Patrol (USA)',
  'american tale fievel goes west': 'American Tail, An - Fievel Goes West (USA)',
  'archer macleans dropzone': "Archer Maclean's Super Dropzone (Europe)",
  'baby t rex': 'Radical Rex (USA)',
  'batman': 'Batman - Revenge of the Joker (USA) (Proto)',
  'battletoads double dragon ultimate team': 'Battletoads-Double Dragon (USA)',
  'bronkie health hero': 'Bronkie the Bronchiasaurus (USA) (En,Es)',
  'brunswick bowling': 'Brunswick World Tournament of Champions (USA)',
  'bugs bunny in rabbit rampage': 'Bugs Bunny - Rabbit Rampage (USA)',
  'bulls vs blazers': 'Bulls vs Blazers and the NBA Playoffs (Europe)',
  'capcom mvp football': "Capcom's MVP Football (USA)",
  'donkey kong 2': "Donkey Kong Country 2 - Diddy's Kong Quest (USA) (En,Fr)",
  'donkey kong country 3': "Donkey Kong Country 3 - Dixie Kong's Double Trouble! (USA) (En,Fr)",
  'hanna barberas turbo toons': 'Turbo Toons (Europe)',
  'irem major title': 'Major Title (Europe)',
  'jazz411s super mario world': 'Super Mario World (USA)',
  'super mario world hell edition': 'Super Mario World (USA)',
  'super mario world winter': 'Super Mario World (USA)',
  'magic johnsons super slam dunk': 'Super Slam Dunk (USA)',
  'might magic 2 gates to another world': 'Might and Magic II (Europe)',
  'nobunagas ambition lord of darkness': 'Lord of Darkness (USA)',
  'parodius non sense fantasy': 'Parodius (Europe)',
  'pebble beach golf links': 'True Golf Classics - Pebble Beach Golf Links (USA)',
  'pink panther in pink goes to hollywood': 'Pink Goes to Hollywood (USA)',
  'sink or swim': 'S.O.S - Sink or Swim (USA)',
  'sporting news power baseball': 'Sporting News Baseball, The (USA)',
  'star fox super weekend competition': 'Star Fox (USA)',
  'starwing super weekend competition': 'Starwing (Europe)',
  'strike gunner': 'Strike Gunner S.T.G (USA)',
  'super aquatic games': 'Super Aquatic Games Starring the Aquabats, The (USA)',
  'super battletank war in gulf': "Garry Kitchen's Super Battletank - War in the Gulf (USA) (Rev 1)",
  'super conflict mideast': 'Super Conflict (USA)',
  'super earth defense force': 'Earth Defense Force (USA)',
  'super noahs ark 3d': "Super 3D Noah's Ark (USA) (Unl)",
  'test drive 2 duel': 'Duel, The - Test Drive II (USA)',
  'ultraman towards future': 'Ultraman (Europe)',
  'waialae country club': 'True Golf Classics - Waialae Country Club (USA)',
  'wicked 18 golf': 'True Golf Classics - Wicked 18 (USA)',
  'winter extreme skiing snowboarding': "Tommy Moe's Winter Extreme - Skiing and Snowboarding (USA)"
};

function normalizeBase(s) {
  return s
    .replace(/\.(smc|sfc|zip|png|cue|bin|iso|chd|pbp)$/i, '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/_s\b/gi, 's')
    .replace(/'s\b/gi, 's')
    .replace(/&/g, ' ')
    .replace(/\band\b/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function makeWords(str) {
  return str
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w && w !== 'the' && w !== 'a' && w !== 'an');
}

function getKeys(s) {
  const base = normalizeBase(s);
  const w1 = makeWords(base);
  const wRoman = w1.map(w => ROMAN_MAP[w] || w);
  const keys = new Set([
    w1.join(' '),
    w1.join(''),
    wRoman.join(' '),
    wRoman.join('')
  ]);
  if (base.includes(' - ')) {
    const pre = makeWords(base.split(' - ')[0]);
    if (pre.length > 0) {
      keys.add('pre:' + pre.join(''));
      keys.add('pre:' + pre.map(w => ROMAN_MAP[w] || w).join(''));
    }
  }
  return [...keys];
}

function buildIndex(list) {
  const map = new Map();
  const sorted = [...list].sort((a, b) => {
    const score = x => (x.includes('(USA)') ? 0 : x.includes('(Europe)') ? 1 : x.includes('(World)') ? 2 : 3);
    return score(a) - score(b) || a.length - b.length;
  });
  for (const item of sorted) {
    for (const k of getKeys(item)) {
      if (!map.has(k)) map.set(k, item);
    }
  }
  return map;
}

function slugify(str) {
  return str
    .replace(/\.(smc|sfc|zip|cue|bin|iso|chd|pbp)$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanDisplayTitle(filename) {
  let t = filename
    .replace(/\.(smc|sfc|zip|cue|bin|iso|chd|pbp)$/i, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/_s\b/g, "'s")
    .replace(/N_/g, "N'")
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix trailing ", The" or ", A" or ", An" (either at end of string or before " - ")
  t = t.replace(/^([^,-]+),\s*(The|A|An)(\s*-\s*.*)?$/i, (_, main, art, rest) => {
    return `${art} ${main.trim()}${rest || ''}`;
  });
  if (/^donkey kong 2$/i.test(t)) {
    return "Donkey Kong Country 2 - Diddy's Kong Quest";
  }
  if (/^donkey kong country 3$/i.test(t)) {
    return "Donkey Kong Country 3 - Dixie Kong's Double Trouble!";
  }
  return t;
}

function extractRegion(filename) {
  if (/\(BR\)|\[BR\]|portugues|dublado|traduzido|\[T-Port/i.test(filename)) return 'BR';
  if (/\(U\)|\(USA|\(JU\)|\(UE\)/i.test(filename)) return 'USA';
  if (/\(E\)|\(Europe|\(G\)|\(F\)|\(S\)/i.test(filename)) return 'EUR';
  if (/\(J\)|\(Japan/i.test(filename)) return 'JPN';
  if (/\(Beta\)|\(Proto/i.test(filename)) return 'BETA';
  return 'USA';
}

function inferGenre(title) {
  const s = title.toLowerCase();
  if (/\b(rpg|final fantasy|chrono trigger|breath of fire|zelda|lufia|secret of mana|secret of evermore|illusion of gaia|7th saga|soul blazer|terranigma|earthbound|shadowrun|ys iii|drakkhen|dungeon master|eye of the beholder|might and magic|wizardry|ultima|uncharted waters|inindo|paladin|arcana|brain lord|brandish|lagoon|mystic quest|ogre battle|robotrek|romancing saga|star ocean|tales of|dragon view|equinox|king arthur & the knights)\b/.test(s)) {
    return 'RPG / Aventura';
  }
  if (/\b(street fighter|mortal kombat|fatal fury|art of fighting|killer instinct|samurai shodown|world heroes|primal rage|clayfighter|dragon ball|ranma|tuff e nuff|doomsday warrior|weaponlord|power instinct|ballz|pit-fighter|shq fu|shaq fu|justice league|teenage mutant ninja turtles - tournament|wrestlemania|wrestling|wcw|wwf|nwa|barkley|slam masters|king of the monsters|best of the best|ufc|marvel vs\.? capcom|king of fighters)\b/.test(s)) {
    return 'Luta';
  }
  if (/\b(racing|racer|top gear|f-zero|mario kart|outrun|test drive|al unser|nigel mansell|newman haas|kyle petty|michael andretti|full throttle|biker mice|rock n' roll racing|uniracers|unirally|street racer|super off road|dirt trax|stunt race|lamborghini|redline|suzuka|exhaust heat|GP-1|Kawasaki|Cannondale)\b/i.test(s)) {
    return 'Corrida';
  }
  if (/\b(soccer|football|baseball|basketball|tennis|golf|hockey|nhl|nba|nfl|mlb|fifa|madden|tecmo super bowl|bill laimbeer|bulls vs|barkley|ken griffey|cal ripken|nolan ryan|frank thomas|roger clemens|george foreman|riddick bowe|boxing|punch-out|knockout|bowling|billiards|pool|fishing|bass|skiing|snowboarding|olympic|winter gold|track & field|international superstar soccer|90 minutes|world cup|striker|goal!|super goal|tony meola|pele|capcom's soccer|champions world class|kick off|sensible soccer|waialae|pebble beach|wicked 18|true golf|jimmy connors|andre agassi|david crane's amazing tennis|volleyball|dig & spike|cricket|sterling sharpe|emmmit smith|troy aikman|quarterback|college slam|ncaa|jammit|looney tunes b-ball|super high impact|pro Sport|major title|super batting|super bases loaded|extra innings|hardball|relief pitcher|super slam dunk|super tennis)\b/i.test(s)) {
    return 'Esportes';
  }
  if (/\b(aero fighters|axelay|gradius|r-type|super r-type|UN squadron|u\.n\. squadron|darius|phalanx|parodius|biometal|bio metal|imperium|space megaforce|super aleste|star fox|starwing|strike gunner|raiden|edf|earth defense force|blazing skies|wings 2|air strike patrol|desert strike|jungle strike|urban strike|air cavalry|super air diver|carrier aces|Turn and Burn|Lock On|Super Dropzone|Dropzone|Firepower 2000|Total Carnage|Smash T\.V\.|Super Smash T\.V\.|Space Invaders|Galaga|Arkanoid)\b/i.test(s)) {
    return "Shoot 'em up";
  }
  if (/\b(tetris|dr\. mario|bust-a-move|puzzle|pac-attack|pac-in-time|lemmings|simcity|sim city|simant|simearth|civilization|populous|utopia|syndicate|aerobiz|nobunaga|romance of the three kingdoms|genghis khan|liberty or death|pto|p\.t\.o\.|operation europe|super conflict|metal marines|megalomania|powermonger|power monger|chessmaster| chess|monopoly|jeopardy|wheel of fortune|family feud|clue|vegas stakes|caesars palace|super caesars|pinball|kirby's avalanche|wario's woods|yoshi's cookie|on the ball|spindizzy|krusty's super fun house|lost vikings|push-over|troddlers|kablooey|zool|zoop|pipemania|pipe dream|wordtris|breakthru|cacoma knight|superoscope)\b/i.test(s)) {
    return 'Estratégia / Puzzle';
  }
  return 'Ação / Plataforma';
}

const FEATURED_PATTERNS = [
  /^super mario world$/i,
  /^super mario all-stars/i,
  /^super mario kart$/i,
  /^super mario rpg/i,
  /^super mario world 2 - yoshi's island/i,
  /^donkey kong country/i,
  /^the legend of zelda/i,
  /^chrono trigger$/i,
  /^super metroid$/i,
  /^street fighter ii/i,
  /^super street fighter ii/i,
  /^street fighter alpha 2$/i,
  /^top gear$/i,
  /^top gear 2$/i,
  /^top gear 3000$/i,
  /^rock n' roll racing$/i,
  /^f-zero$/i,
  /^mega man x$/i,
  /^mega man x2$/i,
  /^mega man x3$/i,
  /^contra iii/i,
  /^sunset riders$/i,
  /^mortal kombat ii$/i,
  /^mortal kombat 3$/i,
  /^ultimate mortal kombat 3$/i,
  /^killer instinct$/i,
  /^final fantasy ii$/i,
  /^final fantasy iii$/i,
  /^secret of mana$/i,
  /^earthbound$/i,
  /^teenage mutant ninja turtles iv/i,
  /^super castlevania iv$/i,
  /^castlevania - dracula x$/i,
  /^aladdin$/i,
  /^the lion king$/i,
  /^zombies ate my neighbors$/i,
  /^international superstar soccer deluxe$/i
];

function isFeaturedGame(title, name) {
  // Prefer [!] or clean USA/BR versions if duplicates exist
  return FEATURED_PATTERNS.some(rx => rx.test(title));
}

function createStylizedSvgCover(title, genre, region) {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const words = safeTitle.split(/\s+/);
  const line1 = words.slice(0, 3).join(' ');
  const line2 = words.slice(3, 6).join(' ');
  const line3 = words.slice(6, 10).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18191c"/>
      <stop offset="55%" stop-color="#252830"/>
      <stop offset="100%" stop-color="#121316"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8f169"/>
      <stop offset="100%" stop-color="#ff6c9d"/>
    </linearGradient>
  </defs>
  <rect width="400" height="280" fill="url(#bg)"/>
  <rect x="16" y="16" width="368" height="248" rx="12" fill="none" stroke="#383a42" stroke-width="2"/>
  <rect x="28" y="28" width="344" height="6" rx="3" fill="url(#accent)"/>
  <text x="32" y="58" fill="#c8f169" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2">SUPER NINTENDO · ${region}</text>
  <text x="32" y="128" fill="#f0eee6" font-family="sans-serif" font-size="24" font-weight="700">${line1}</text>
  ${line2 ? `<text x="32" y="158" fill="#f0eee6" font-family="sans-serif" font-size="22" font-weight="700">${line2}</text>` : ''}
  ${line3 ? `<text x="32" y="186" fill="#aaa99f" font-family="sans-serif" font-size="18" font-weight="600">${line3}</text>` : ''}
  <rect x="32" y="220" width="140" height="24" rx="4" fill="#2c2f36"/>
  <text x="42" y="236" fill="#aaa99f" font-family="monospace" font-size="10">${genre.toUpperCase()}</text>
</svg>`;
}

function isPngBuffer(buf) {
  return buf && buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

function isValidLocalPng(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);
  if (stat.size < 100) return false;
  const fd = fs.openSync(filePath, 'r');
  const head = Buffer.alloc(8);
  fs.readSync(fd, head, 0, 8, 0);
  fs.closeSync(fd);
  return isPngBuffer(head);
}

async function downloadBuffer(url, depth = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'site-jogos-sync' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  // Follow Git symlinks in libretro-thumbnails repositories
  if (!isPngBuffer(buf) && buf.length < 512 && depth < 3) {
    const targetName = buf.toString('utf8').trim();
    if (targetName.endsWith('.png') && !targetName.includes('\n')) {
      const baseDirUrl = url.slice(0, url.lastIndexOf('/') + 1);
      const redirectedUrl = baseDirUrl + encodeURIComponent(targetName);
      return downloadBuffer(redirectedUrl, depth + 1);
    }
  }
  if (!isPngBuffer(buf)) {
    throw new Error(`Downloaded content from ${url} is not a valid PNG`);
  }
  return buf;
}

async function runPool(items, concurrency, worker) {
  let i = 0;
  const results = new Array(items.length);
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

async function syncSnes() {
  if (!fs.existsSync(SNES_ROM_DIR)) {
    console.log(`1. SNES_ROM_DIR not found at "${SNES_ROM_DIR}". Skipping SNES ROM scan.`);
    return;
  }

  console.log('1. Loading Libretro SNES tree...');
  const cachePath = path.join(ROOT, 'snes-tree-cache.json');
  let tree;
  if (fs.existsSync(cachePath)) {
    tree = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } else {
    const res = await fetch('https://api.github.com/repos/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/git/trees/master?recursive=1', {
      headers: { 'User-Agent': 'site-jogos-sync' }
    });
    const data = await res.json();
    tree = data.tree;
  }

  const boxarts = tree.filter(t => t.path.startsWith('Named_Boxarts/') && t.path.endsWith('.png')).map(t => t.path.slice('Named_Boxarts/'.length, -4));
  const titles = tree.filter(t => t.path.startsWith('Named_Titles/') && t.path.endsWith('.png')).map(t => t.path.slice('Named_Titles/'.length, -4));
  const snaps = tree.filter(t => t.path.startsWith('Named_Snaps/') && t.path.endsWith('.png')).map(t => t.path.slice('Named_Snaps/'.length, -4));

  const boxIdx = buildIndex(boxarts);
  const titleIdx = buildIndex(titles);
  const snapIdx = buildIndex(snaps);

  const romFiles = fs.readdirSync(SNES_ROM_DIR)
    .filter(f => /\.(smc|sfc|zip)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  console.log(`Found ${romFiles.length} SNES ROMs in Super nintendo/GAMES.`);

  let stats = { boxart: 0, title: 0, snap: 0, svgFallback: 0 };
  const featuredSeen = new Set();

  const catalog = await runPool(romFiles, 32, async (romFile, idx) => {
    const rKeys = getKeys(romFile);
    const primaryKey = rKeys[0];
    let match = null;

    if (MANUAL_SNES_OVERRIDES[primaryKey]) {
      const target = MANUAL_SNES_OVERRIDES[primaryKey];
      if (boxarts.includes(target)) match = { folder: 'Named_Boxarts', name: target, kind: 'boxart' };
      else if (titles.includes(target)) match = { folder: 'Named_Titles', name: target, kind: 'title' };
      else if (snaps.includes(target)) match = { folder: 'Named_Snaps', name: target, kind: 'snap' };
    }

    const extraKeys = [...rKeys, ...rKeys.filter(k => !k.startsWith('pre:')).map(k => 'pre:' + k.replace(/\s+/g, ''))];

    if (!match) {
      for (const k of extraKeys) {
        if (boxIdx.has(k)) { match = { folder: 'Named_Boxarts', name: boxIdx.get(k), kind: 'boxart' }; break; }
      }
    }
    if (!match) {
      for (const k of extraKeys) {
        if (titleIdx.has(k)) { match = { folder: 'Named_Titles', name: titleIdx.get(k), kind: 'title' }; break; }
      }
    }
    if (!match) {
      for (const k of extraKeys) {
        if (snapIdx.has(k)) { match = { folder: 'Named_Snaps', name: snapIdx.get(k), kind: 'snap' }; break; }
      }
    }

    const title = cleanDisplayTitle(romFile);
    const region = extractRegion(romFile);
    const genre = inferGenre(title);
    const slug = slugify(romFile);

    let coverRelPath;
    if (match) {
      const pngPath = path.join(COVERS_SNES_DIR, `${slug}.png`);
      coverRelPath = `assets/covers/snes/${slug}.png`;
      if (!isValidLocalPng(pngPath)) {
        const remoteUrl = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/${match.folder}/${encodeURIComponent(match.name)}.png`;
        try {
          const buf = await downloadBuffer(remoteUrl);
          fs.writeFileSync(pngPath, buf);
          stats[match.kind]++;
        } catch (err) {
          console.error(`Failed download for ${romFile}:`, err.message);
          const svgPath = path.join(COVERS_SNES_DIR, `${slug}.svg`);
          fs.writeFileSync(svgPath, createStylizedSvgCover(title, genre, region));
          coverRelPath = `assets/covers/snes/${slug}.svg`;
          stats.svgFallback++;
        }
      } else {
        stats[match.kind]++;
      }
    } else {
      const svgPath = path.join(COVERS_SNES_DIR, `${slug}.svg`);
      fs.writeFileSync(svgPath, createStylizedSvgCover(title, genre, region));
      coverRelPath = `assets/covers/snes/${slug}.svg`;
      stats.svgFallback++;
    }

    const titleKey = title.toLowerCase();
    let featured = false;
    if (isFeaturedGame(title, romFile) && !featuredSeen.has(titleKey)) {
      featured = true;
      featuredSeen.add(titleKey);
    }

    if ((idx + 1) % 100 === 0 || idx === romFiles.length - 1) {
      console.log(`Processed ${idx + 1}/${romFiles.length} SNES games...`);
    }

    return {
      name: romFile,
      title,
      region,
      genre,
      featured,
      url: '/Super%20nintendo/GAMES/' + encodeURIComponent(romFile),
      cover: coverRelPath
    };
  });

  fs.writeFileSync(path.join(ROOT, 'snes-games.json'), JSON.stringify(catalog, null, 2));
  console.log('SNES Sync complete:', stats);
  return { total: catalog.length, stats };
}

async function syncPs1() {
  console.log('2. Syncing PS1 covers, fixing .cue headers, and updating catalog...');

  const ps1Dir = path.join(ROOT, 'ps1');
  if (fs.existsSync(ps1Dir)) {
    const entries = fs.readdirSync(ps1Dir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile()).map(e => e.name);

    for (const file of files) {
      if (!/\.cue$/i.test(file)) continue;
      const cuePath = path.join(ps1Dir, file);
      const baseName = file.replace(/\.cue$/i, '');
      const matchingBin = files.find(
        f => /\.bin$/i.test(f) && f.replace(/\.bin$/i, '').toLowerCase() === baseName.toLowerCase()
      );

      if (!matchingBin) {
        // Remove orphaned .cue file in ps1/ root (e.g. Marvel vs. Capcom without .bin in ps1/ root)
        console.log(`Removing orphaned .cue in ps1/: ${file}`);
        fs.unlinkSync(cuePath);
        continue;
      }

      const cueContent = fs.readFileSync(cuePath, 'utf8');
      const updatedCue = cueContent.replace(/^FILE\s+"[^"]+"\s+BINARY/im, `FILE "${matchingBin}" BINARY`);
      if (updatedCue !== cueContent) {
        fs.writeFileSync(cuePath, updatedCue, 'utf8');
        console.log(`Fixed .cue FILE reference in: ${file} -> "${matchingBin}"`);
      }
    }
  }

  const baseLibretroPs1 = 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/';
  const ps1CoversToFetch = [
    {
      slug: 'castlevania-symphony-of-the-night',
      file: 'Castlevania - Symphony of the Night (USA).png'
    },
    {
      slug: 'marvel-vs-capcom-clash-of-super-heroes',
      file: 'Marvel vs. Capcom - Clash of Super Heroes (USA).png'
    },
    {
      slug: 'ctr-crash-team-racing',
      file: 'CTR - Crash Team Racing (USA).png'
    },
    {
      slug: 'donald-duck-goin-quackers',
      file: "Disney's Donald Duck - Goin' Quackers (USA).png"
    },
    {
      slug: 'driver-2-disc-1',
      file: 'Driver 2 (USA) (Disc 1).png'
    },
    {
      slug: 'driver-2-disc-2',
      file: 'Driver 2 (USA) (Disc 2).png'
    },
    {
      slug: 'jackie-chan-stuntmaster',
      file: 'Jackie Chan Stuntmaster (USA).png'
    },
    {
      slug: 'primal-rage',
      file: 'Primal Rage (USA).png'
    },
    {
      slug: 'spider-man-2-enter-electro',
      file: 'Spider-Man 2 - Enter - Electro (USA).png'
    },
    {
      slug: 'vigilante-8',
      file: 'Vigilante 8 (USA).png'
    },
    {
      slug: 'vigilante-8-2nd-offensive',
      file: 'Vigilante 8 - 2nd Offense (USA).png'
    },
    {
      slug: 'worlds-scariest-police-chases',
      file: "World's Scariest Police Chases (USA).png"
    }
  ];

  for (const item of ps1CoversToFetch) {
    const dest = path.join(COVERS_PS1_DIR, `${item.slug}.png`);
    if (!isValidLocalPng(dest)) {
      const url = baseLibretroPs1 + encodeURIComponent(item.file);
      const buf = await downloadBuffer(url);
      fs.writeFileSync(dest, buf);
      console.log(`Downloaded PS1 cover: ${item.slug}.png (${buf.length} bytes)`);
    } else {
      console.log(`Verified existing PS1 cover: ${item.slug}.png (${fs.statSync(dest).size} bytes)`);
    }
  }

  const encodeSeg = s => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29');

  const ps1Games = [
    {
      name: 'Castlevania Symphony of the Night (BR) (Dublado) (www.romsportugues.com)',
      title: 'Castlevania: Symphony of the Night',
      region: 'BR (Dublado PT-BR)',
      genre: 'RPG / Aventura',
      featured: true,
      url: '/ps1/' + encodeSeg('Castlevania Symphony of the Night (BR) (Dublado) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/castlevania-symphony-of-the-night.png'
    },
    {
      name: 'CTR - Crash Team Racing (BR) (DUB) (www.romsportugues.com)',
      title: 'CTR: Crash Team Racing',
      region: 'BR (Dublado PT-BR)',
      genre: 'Corrida',
      featured: true,
      url: '/ps1/' + encodeSeg('CTR - Crash Team Racing (BR) (DUB) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/ctr-crash-team-racing.png'
    },
    {
      name: "Disney's Donald Duck Goin' Quackers (BR) (DUB) (www.romsportugues.com)",
      title: "Pato Donald: Goin' Quackers",
      region: 'BR (Dublado PT-BR)',
      genre: 'Ação / Plataforma',
      featured: true,
      url: '/ps1/' + encodeSeg("Disney's Donald Duck Goin' Quackers (BR) (DUB) (www.romsportugues.com).bin"),
      cover: 'assets/covers/ps1/donald-duck-goin-quackers.png'
    },
    {
      name: 'Driver 2 (BR) (Disc 1) (v1.1) (www.romsportugues.com)',
      title: 'Driver 2 (Disco 1)',
      region: 'BR (Português)',
      genre: 'Corrida',
      featured: true,
      url: '/ps1/' + encodeSeg('Driver 2 (BR) (Disc 1) (v1.1) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/driver-2-disc-1.png'
    },
    {
      name: 'Driver 2 (BR) (Disc 2) (v1.1) (www.romsportugues.com)',
      title: 'Driver 2 (Disco 2)',
      region: 'BR (Português)',
      genre: 'Corrida',
      featured: true,
      url: '/ps1/' + encodeSeg('Driver 2 (BR) (Disc 2) (v1.1) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/driver-2-disc-2.png'
    },
    {
      name: 'Jackie Chan Stuntmaster (BR) (www.romsportugues.com)',
      title: 'Jackie Chan Stuntmaster',
      region: 'BR (Português)',
      genre: 'Ação / Plataforma',
      featured: true,
      url: '/ps1/' + encodeSeg('Jackie Chan Stuntmaster (BR) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/jackie-chan-stuntmaster.png'
    },
    {
      name: 'Marvel vs. Capcom - Clash of Super Heroes (USA)',
      title: 'Marvel vs. Capcom: Clash of Super Heroes',
      region: 'USA',
      genre: 'Luta',
      featured: true,
      url: '/PlayStation/GAMES/' + encodeSeg('Marvel vs. Capcom - Clash of Super Heroes (USA).bin'),
      cover: 'assets/covers/ps1/marvel-vs-capcom-clash-of-super-heroes.png'
    },
    {
      name: 'Primal Rage (PT) (v1.2A) (www.romsportugues.com)',
      title: 'Primal Rage',
      region: 'BR (Português)',
      genre: 'Luta',
      featured: true,
      url: '/ps1/' + encodeSeg('Primal Rage (PT) (v1.2A) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/primal-rage.png'
    },
    {
      name: 'Spider 2 (BR) (www.romsportugues.com)',
      title: 'Homem-Aranha 2: Enter Electro',
      region: 'BR (Português)',
      genre: 'Ação / Aventura',
      featured: true,
      url: '/ps1/' + encodeSeg('Spider 2 (BR) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/spider-man-2-enter-electro.png'
    },
    {
      name: 'Vigilante 8 (BR) (T1.2) (www.romsportugues.com)',
      title: 'Vigilante 8',
      region: 'BR (Português)',
      genre: 'Combate Veicular',
      featured: true,
      url: '/ps1/' + encodeSeg('Vigilante 8 (BR) (T1.2) (www.romsportugues.com).bin'),
      cover: 'assets/covers/ps1/vigilante-8.png'
    },
    {
      name: 'Vigilante 8 - 2nd Offensive (PT) (www.romsportugues.com)',
      title: 'Vigilante 8: 2nd Offensive',
      region: 'BR (Português)',
      genre: 'Combate Veicular',
      featured: true,
      url: '/ps1/' + encodeSeg('Vigilante 8 - 2nd Offensive (PT) (www.romsportugues.com).BIN'),
      cover: 'assets/covers/ps1/vigilante-8-2nd-offensive.png'
    },
    {
      name: "World's Scariest Police Chases (BR) (DUB) (T1.0) (www.romsportugues.com)",
      title: "World's Scariest Police Chases",
      region: 'BR (Dublado PT-BR)',
      genre: 'Combate Veicular',
      featured: true,
      url: '/ps1/' + encodeSeg("World's Scariest Police Chases (BR) (DUB) (T1.0) (www.romsportugues.com).bin"),
      cover: 'assets/covers/ps1/worlds-scariest-police-chases.png'
    }
  ];

  fs.writeFileSync(path.join(ROOT, 'ps1-games.json'), JSON.stringify(ps1Games, null, 2));
  console.log(`Saved ps1-games.json with ${ps1Games.length} games.`);
}

async function syncArcade() {
  console.log('3. Syncing Arcade showcase covers...');
  const arcadeCovers = [
    {
      slug: 'metal-slug',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/SNK_-_Neo_Geo/master/Named_Boxarts/Metal%20Slug%20-%20Super%20Vehicle-001.png'
    },
    {
      slug: 'street-fighter',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Street%20Fighter%20II%20(USA).png'
    },
    {
      slug: 'sonic',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Sonic%20The%20Hedgehog%20(USA,%20Europe).png'
    },
    {
      slug: 'mortal-kombat',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Mortal%20Kombat%20II%20(USA).png'
    },
    {
      slug: 'outrun',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/OutRun%20(USA,%20Europe).png'
    },
    {
      slug: 'kof-98',
      url: "https://raw.githubusercontent.com/libretro-thumbnails/SNK_-_Neo_Geo/master/Named_Boxarts/The%20King%20of%20Fighters%20'98%20-%20The%20Slugfest%20_%20King%20of%20Fighters%20'98%20-%20dream%20match%20never%20ends%20(NGM-2420).png"
    },
    {
      slug: 'cadillacs',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Boxarts/Cadillacs%20and%20Dinosaurs%20(World%20930201).png'
    },
    {
      slug: 'pac-man',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Boxarts/Pac-Man%20(Midway).png'
    },
    {
      slug: 'marvel-capcom',
      url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/Marvel%20vs.%20Capcom%20-%20Clash%20of%20Super%20Heroes%20(USA).png'
    }
  ];

  for (const item of arcadeCovers) {
    const dest = path.join(COVERS_ARCADE_DIR, `${item.slug}.png`);
    if (!isValidLocalPng(dest)) {
      try {
        const buf = await downloadBuffer(item.url);
        fs.writeFileSync(dest, buf);
        console.log(`Downloaded Arcade cover: ${item.slug}.png (${buf.length} bytes)`);
      } catch (err) {
        console.error(`Failed Arcade cover ${item.slug}:`, err.message);
      }
    }
  }
}

async function main() {
  await syncSnes();
  await syncPs1();
  await syncArcade();
  const cachePath = path.join(ROOT, 'snes-tree-cache.json');
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  console.log('All cover sync operations completed successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
