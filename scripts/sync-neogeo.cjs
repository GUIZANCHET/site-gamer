const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const NEOGEO_ROM_DIR = path.join(ROOT, 'neogeo');
const COVERS_NEOGEO_DIR = path.join(ROOT, 'assets', 'covers', 'neogeo');

fs.mkdirSync(COVERS_NEOGEO_DIR, { recursive: true });

function slugify(str) {
  return str
    .replace(/\.(smc|sfc|zip|cue|bin|iso|chd|pbp)$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPngBuffer(buf) {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}

function isValidLocalPng(p) {
  if (!fs.existsSync(p)) return false;
  const stat = fs.statSync(p);
  if (stat.size < 512) return false;
  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);
  return isPngBuffer(buf);
}

async function downloadBuffer(url, depth = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'continue-arcade-sync' }
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
  return buf;
}

function generateFallbackWithPython(title, genre, year, publisher, outputPath) {
  const pythonScript = `
from PIL import Image, ImageDraw, ImageFont
import sys

w, h = 480, 680
img = Image.new("RGBA", (w, h), "#0a0c14")
draw = ImageDraw.Draw(img)

for y in range(0, h, 24):
    draw.line([(0, y), (w, y)], fill="#141824", width=1)
for x in range(0, w, 24):
    draw.line([(x, 0), (x, h)], fill="#141824", width=1)

draw.rectangle([12, 12, w-12, h-12], outline="#c59b27", width=4)
draw.rectangle([20, 20, w-20, h-20], outline="#dc3545", width=2)

draw.rectangle([26, 26, w-26, 95], fill="#121520", outline="#c59b27", width=1)

try:
    font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
except:
    font_large = font_sub = font_title = font_small = ImageFont.load_default()

draw.text((w/2, 50), "NEO - GEO", fill="#f1c40f", anchor="mm", font=font_large)
draw.text((w/2, 78), "ADVANCED ENTERTAINMENT SYSTEM", fill="#a6b1c2", anchor="mm", font=font_sub)

draw.rectangle([36, 120, w-36, 500], fill="#161b2b", outline="#30384f", width=2)
draw.rectangle([46, 200, w-46, 420], fill="#1c2237")

draw.polygon([(46, 200), (106, 200), (46, 260)], fill="#dc3545")
draw.polygon([(w-46, 420), (w-106, 420), (w-46, 360)], fill="#c59b27")

words = sys.argv[1].split()
lines = []
curr = ""
for word in words:
    if len(curr + " " + word) < 22:
        curr = (curr + " " + word).strip()
    else:
        lines.append(curr)
        curr = word
if curr:
    lines.append(curr)

start_y = 290 - (len(lines) * 16)
for i, line in enumerate(lines):
    draw.text((w/2, start_y + i * 32), line.upper(), fill="#ffffff", anchor="mm", font=font_title)

draw.rectangle([w/2 - 100, 440, w/2 + 100, 472], fill="#dc3545")
draw.text((w/2, 456), sys.argv[2].upper(), fill="#ffffff", anchor="mm", font=font_sub)

draw.rectangle([26, h-120, w-26, h-26], fill="#121520", outline="#c59b27", width=1)
meta_text = f"{sys.argv[4].upper()} • {sys.argv[3]}"
draw.text((w/2, h-90), meta_text, fill="#ffffff", anchor="mm", font=font_small)
draw.text((w/2, h-65), "MAX 330 MEGA • PRO-GEAR SPEC", fill="#f1c40f", anchor="mm", font=font_sub)
draw.text((w/2, h-45), "SNK / MVS ARCADE SYSTEM", fill="#7f8c8d", anchor="mm", font=font_sub)

img.save(sys.argv[5], "PNG")
`;

  const res = spawnSync('python3', ['-c', pythonScript, title, genre, year, publisher, outputPath], {
    encoding: 'utf8'
  });
  if (res.status !== 0) {
    throw new Error(`Python error: ${res.stderr || res.stdout}`);
  }
}

// Complete 165 ROM database for Neo Geo
const NEOGEO_REGISTRY = [
  { code: '2020bb', title: '2020 Super Baseball', genre: 'Esportes', year: '1991', publisher: 'SNK / Pallas', featured: false, libretro: '2020 Super Baseball (set 1).png' },
  { code: '3countb', title: '3 Count Bout', genre: 'Luta', year: '1993', publisher: 'SNK', featured: false, libretro: '3 Count Bout _ Fire Suplex (NGM-043)(NGH-043).png' },
  { code: 'alpham2', title: 'Alpha Mission II', genre: 'Nave / Shmup', year: '1991', publisher: 'SNK', featured: false, libretro: 'Alpha Mission II _ ASO II - Last Guardian (NGM-007)(NGH-007).png' },
  { code: 'androdun', title: 'Andro Dunos', genre: 'Nave / Shmup', year: '1992', publisher: 'Visco', featured: false, libretro: 'Andro Dunos (NGM-049)(NGH-049).png' },
  { code: 'aodk', title: 'Aggressors of Dark Kombat', genre: 'Luta', year: '1994', publisher: 'ADK / SNK', featured: false, libretro: 'Aggressors of Dark Kombat _ Tsuukai GANGAN Koushinkyoku (ADM-008)(ADH-008).png' },
  { code: 'aof', title: 'Art of Fighting', genre: 'Luta', year: '1992', publisher: 'SNK', featured: false, libretro: 'Art of Fighting _ Ryuuko no Ken (NGM-044)(NGH-044).png' },
  { code: 'aof2', title: 'Art of Fighting 2', genre: 'Luta', year: '1994', publisher: 'SNK', featured: false, libretro: 'Art of Fighting 2 _ Ryuuko no Ken 2 (NGM-056).png' },
  { code: 'aof3', title: 'Art of Fighting 3: The Path of the Warrior', genre: 'Luta', year: '1996', publisher: 'SNK', featured: false, libretro: 'Art of Fighting 3 - The Path of the Warrior _ Art of Fighting - Ryuuko no Ken Gaiden.png' },
  { code: 'b2b', title: 'Bang Bang Busters', genre: 'Ação / Tiro', year: '2010', publisher: 'Visco', featured: false, libretro: 'Bang Bang Busters (2010 NCI release).png' },
  { code: 'bakatono', title: 'Bakatonosama Mahjong Manyuki', genre: 'Puzzle', year: '1991', publisher: 'Monolith Corp.', featured: false, libretro: 'Bakatonosama Mahjong Manyuuki (MOM-002)(MOH-002).png' },
  { code: 'bangbead', title: 'Bang Bead', genre: 'Esportes', year: '2000', publisher: 'Visco', featured: false, libretro: 'Bang Bead.png' },
  { code: 'bjourney', title: "Blue's Journey", genre: 'Ação / Tiro', year: '1990', publisher: 'Alpha Denshi', featured: false, libretro: "Blue's Journey _ Raguy (ALM-001)(ALH-001).png" },
  { code: 'blazstar', title: 'Blazing Star', genre: 'Nave / Shmup', year: '1998', publisher: 'Yumekobo', featured: true, libretro: 'Blazing Star.png' },
  { code: 'breakers', title: 'Breakers', genre: 'Luta', year: '1996', publisher: 'Visco', featured: false, libretro: 'Breakers.png' },
  { code: 'breakrev', title: 'Breakers Revenge', genre: 'Luta', year: '1998', publisher: 'Visco', featured: false, libretro: 'Breakers Revenge.png' },
  { code: 'bstars', title: 'Baseball Stars Professional', genre: 'Esportes', year: '1990', publisher: 'SNK', featured: false, libretro: 'Baseball Stars Professional (NGH-002).png' },
  { code: 'bstars2', title: 'Baseball Stars 2', genre: 'Esportes', year: '1992', publisher: 'SNK', featured: false, libretro: 'Baseball Stars 2.png' },
  { code: 'burningf', title: 'Burning Fight', genre: 'Ação / Tiro', year: '1991', publisher: 'SNK', featured: false, libretro: 'Burning Fight (NGM-018)(NGH-018).png' },
  { code: 'cnbe', title: 'Codename: Blut Engel', genre: 'Nave / Shmup', year: '2006', publisher: 'blastar', featured: false, libretro: null },
  { code: 'columnsn', title: 'Columns (Neo Geo)', genre: 'Puzzle', year: '2002', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'crswd2bl', title: 'Crossed Swords II', genre: 'Ação / Tiro', year: '1996', publisher: 'ADK / SNK', featured: false, libretro: null },
  { code: 'crsword', title: 'Crossed Swords', genre: 'Ação / Tiro', year: '1991', publisher: 'Alpha Denshi', featured: false, libretro: 'Crossed Swords (ALM-002)(ALH-002).png' },
  { code: 'ctomaday', title: 'Captain Tomaday', genre: 'Nave / Shmup', year: '1999', publisher: 'Visco', featured: false, libretro: 'Captain Tomaday.png' },
  { code: 'cyberlip', title: 'Cyber-Lip', genre: 'Ação / Tiro', year: '1990', publisher: 'SNK', featured: false, libretro: 'Cyber-Lip (NGM-010).png' },
  { code: 'diggerma', title: 'Digger Man', genre: 'Puzzle', year: '2000', publisher: 'Kyle Hodgetts', featured: false, libretro: 'Digger Man [Homebrew].png' },
  { code: 'doubledr', title: 'Double Dragon (Neo Geo)', genre: 'Luta', year: '1995', publisher: 'Technos Japan', featured: false, libretro: 'Double Dragon (Neo-Geo).png' },
  { code: 'eightman', title: 'Eight Man', genre: 'Ação / Tiro', year: '1991', publisher: 'SNK / Pallas', featured: false, libretro: 'Eight Man (NGM-025)(NGH-025).png' },
  { code: 'fatfursp', title: 'Fatal Fury Special', genre: 'Luta', year: '1993', publisher: 'SNK', featured: true, libretro: 'Fatal Fury Special _ Garou Densetsu Special (set 1)(NGM-058)(NGH-058).png' },
  { code: 'fatfury1', title: 'Fatal Fury: King of Fighters', genre: 'Luta', year: '1991', publisher: 'SNK', featured: false, libretro: 'Fatal Fury - King of Fighters _ Garou Densetsu - shukumei no tatakai (NGM-033)(NGH-033).png' },
  { code: 'fatfury2', title: 'Fatal Fury 2', genre: 'Luta', year: '1992', publisher: 'SNK', featured: false, libretro: 'Fatal Fury 2 _ Garou Densetsu 2 - arata-naru tatakai (NGM-047)(NGH-047).png' },
  { code: 'fatfury3', title: 'Fatal Fury 3: Road to the Final Victory', genre: 'Luta', year: '1995', publisher: 'SNK', featured: false, libretro: 'Fatal Fury 3 - Road to the Final Victory _ Garou Densetsu 3 - haruka-naru tatakai (NGM-069)(NGH-069).png' },
  { code: 'fbfrenzy', title: 'Football Frenzy', genre: 'Esportes', year: '1992', publisher: 'SNK', featured: false, libretro: 'Football Frenzy (NGM-034)(NGH-034).png' },
  { code: 'ffeast', title: 'Frog Feast', genre: 'Ação / Tiro', year: '2005', publisher: 'Raster Soft', featured: false, libretro: null },
  { code: 'fightfev', title: 'Fight Fever', genre: 'Luta', year: '1994', publisher: 'Viccom', featured: false, libretro: 'Fight Fever (set 1).png' },
  { code: 'flipshot', title: 'Battle Flip Shot', genre: 'Esportes', year: '1998', publisher: 'Visco', featured: false, libretro: 'Battle Flip Shot.png' },
  { code: 'froman2b', title: 'Idol Mahjong Final Romance 2', genre: 'Puzzle', year: '1995', publisher: 'Video System', featured: false, libretro: null },
  { code: 'galaxyfg', title: 'Galaxy Fight: Universal Warriors', genre: 'Luta', year: '1995', publisher: 'Sunsoft', featured: false, libretro: 'Galaxy Fight - Universal Warriors.png' },
  { code: 'ganryu', title: 'Ganryu / Musashi Ganryuki', genre: 'Ação / Tiro', year: '1999', publisher: 'Visco', featured: false, libretro: 'Ganryu _ Musashi Ganryuki.png' },
  { code: 'ghostlop', title: 'Ghostlop', genre: 'Puzzle', year: '1996', publisher: 'Data East', featured: false, libretro: 'Ghostlop (prototype).png' },
  { code: 'goalx3', title: 'Goal! Goal! Goal!', genre: 'Esportes', year: '1995', publisher: 'Visco', featured: false, libretro: 'Goal! Goal! Goal!.png' },
  { code: 'gowcaizr', title: 'Voltage Fighter Gowcaizer', genre: 'Luta', year: '1995', publisher: 'Technos Japan', featured: false, libretro: 'Voltage Fighter - Gowcaizer _ Choujin Gakuen Gowcaizer.png' },
  { code: 'gpilots', title: 'Ghost Pilots', genre: 'Nave / Shmup', year: '1991', publisher: 'SNK', featured: false, libretro: 'Ghost Pilots (NGM-020)(NGH-020).png' },
  { code: 'gururin', title: 'Gururin', genre: 'Puzzle', year: '1994', publisher: 'Face', featured: false, libretro: 'Gururin.png' },
  { code: 'ironclad', title: "Ironclad / Choutetsu Brikin'ger", genre: 'Nave / Shmup', year: '1996', publisher: 'Saurus', featured: false, libretro: "Choutetsu Brikin'ger - Iron Clad (prototype).png" },
  { code: 'irrmaze', title: 'The Irritating Maze', genre: 'Puzzle', year: '1997', publisher: 'SNK / Saurus', featured: false, libretro: 'The Irritating Maze _ Ultra Denryu Iraira Bou.png' },
  { code: 'janshin', title: 'Jyanshin Densetsu: Quest of Jongmaster', genre: 'Puzzle', year: '1994', publisher: 'Aicom', featured: false, libretro: 'Jyanshin Densetsu - Quest of Jongmaster.png' },
  { code: 'jockeygp', title: 'Jockey Grand Prix', genre: 'Corrida', year: '2001', publisher: 'Sun Amusement / BrezzaSoft', featured: false, libretro: 'Jockey Grand Prix (set 1).png' },
  { code: 'joyjoy', title: 'Puzzled / Joy Joy Kid', genre: 'Puzzle', year: '1990', publisher: 'SNK', featured: false, libretro: 'Puzzled _ Joy Joy Kid (NGM-021)(NGH-021).png' },
  { code: 'kabukikl', title: 'Kabuki Klash: Far East of Eden', genre: 'Luta', year: '1995', publisher: 'Hudson Soft', featured: false, libretro: 'Far East of Eden - Kabuki Klash _ Tengai Makyou - Shin Den.png' },
  { code: 'karnovr', title: "Karnov's Revenge / Fighter's History Dynamite", genre: 'Luta', year: '1994', publisher: 'Data East', featured: false, libretro: "Karnov's Revenge _ Fighter's History Dynamite.png" },
  { code: 'kizuna', title: 'Kizuna Encounter: Super Tag Battle', genre: 'Luta', year: '1996', publisher: 'SNK', featured: false, libretro: "Kizuna Encounter - Super Tag Battle _ Fu'un Super Tag Battle.png" },
  { code: 'kof2000', title: 'The King of Fighters 2000', genre: 'Luta', year: '2000', publisher: 'SNK', featured: false, libretro: 'The King of Fighters 2000 (NGM-2570) (NGH-2570).png' },
  { code: 'kof2001', title: 'The King of Fighters 2001', genre: 'Luta', year: '2001', publisher: 'Eolith / SNK', featured: false, libretro: 'The King of Fighters 2001 (NGH-2621).png' },
  { code: 'kof2002', title: 'The King of Fighters 2002: Challenge to Ultimate Battle', genre: 'Luta', year: '2002', publisher: 'Eolith / Playmore', featured: true, libretro: 'The King of Fighters 2002 (NGM-2650)(NGH-2650).png' },
  { code: 'kof2003', title: 'The King of Fighters 2003', genre: 'Luta', year: '2003', publisher: 'SNK Playmore', featured: false, libretro: 'The King of Fighters 2003 (NGM-2710).png' },
  { code: 'kof94', title: "The King of Fighters '94", genre: 'Luta', year: '1994', publisher: 'SNK', featured: false, libretro: "The King of Fighters '94 (NGM-055)(NGH-055).png" },
  { code: 'kof95', title: "The King of Fighters '95", genre: 'Luta', year: '1995', publisher: 'SNK', featured: false, libretro: "The King of Fighters '95 (NGM-084).png" },
  { code: 'kof96', title: "The King of Fighters '96", genre: 'Luta', year: '1996', publisher: 'SNK', featured: false, libretro: "The King of Fighters '96 (NGM-214).png" },
  { code: 'kof97', title: "The King of Fighters '97", genre: 'Luta', year: '1997', publisher: 'SNK', featured: true, libretro: "The King of Fighters '97 (NGM-2320).png" },
  { code: 'kof98', title: "The King of Fighters '98: The Slugfest", genre: 'Luta', year: '1998', publisher: 'SNK', featured: true, libretro: "The King of Fighters '98 - The Slugfest _ King of Fighters '98 - dream match never ends (NGM-2420).png" },
  { code: 'kotm', title: 'King of the Monsters', genre: 'Luta', year: '1991', publisher: 'SNK', featured: false, libretro: 'King of the Monsters (set 1).png' },
  { code: 'kotm2', title: 'King of the Monsters 2: The Next Dimension', genre: 'Ação / Tiro', year: '1992', publisher: 'SNK', featured: false, libretro: 'King of the Monsters 2 - The Next Thing (NGM-039)(NGH-039).png' },
  { code: 'lastblad', title: 'The Last Blade', genre: 'Luta', year: '1997', publisher: 'SNK', featured: false, libretro: 'The Last Blade _ Bakumatsu Roman - Gekka no Kenshi (NGM-2340).png' },
  { code: 'lastbld2', title: 'The Last Blade 2', genre: 'Luta', year: '1998', publisher: 'SNK', featured: true, libretro: 'The Last Blade 2 _ Bakumatsu Roman - Dai Ni Maku Gekka no Kenshi (NGM-2430)(NGH-2430).png' },
  { code: 'lasthope', title: 'Last Hope', genre: 'Nave / Shmup', year: '2006', publisher: 'NG:DEV.TEAM', featured: false, libretro: 'MAME:Last Hope.png' },
  { code: 'lbowling', title: 'League Bowling', genre: 'Esportes', year: '1990', publisher: 'SNK', featured: false, libretro: 'League Bowling (NGM-019)(NGH-019).png' },
  { code: 'legendos', title: 'Legend of Success Joe', genre: 'Ação / Tiro', year: '1991', publisher: 'Wave Corp.', featured: false, libretro: 'Legend of Success Joe _ Ashitano Joe Densetsu.png' },
  { code: 'lresort', title: 'Last Resort', genre: 'Nave / Shmup', year: '1992', publisher: 'SNK', featured: false, libretro: 'Last Resort.png' },
  { code: 'ltorb', title: 'Jonas Indiana and the Lost Temple of Ra', genre: 'Puzzle', year: '2005', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'magdrop2', title: 'Magical Drop II', genre: 'Puzzle', year: '1996', publisher: 'Data East', featured: false, libretro: 'Magical Drop II.png' },
  { code: 'magdrop3', title: 'Magical Drop III', genre: 'Puzzle', year: '1997', publisher: 'Data East', featured: true, libretro: 'Magical Drop III.png' },
  { code: 'maglord', title: 'Magician Lord', genre: 'Ação / Tiro', year: '1990', publisher: 'Alpha Denshi', featured: false, libretro: 'Magician Lord (NGM-005).png' },
  { code: 'mahretsu', title: 'Mahjong Kyoretsuden', genre: 'Puzzle', year: '1990', publisher: 'SNK', featured: false, libretro: 'Mahjong Kyo Retsuden (NGM-004)(NGH-004).png' },
  { code: 'marukodq', title: 'Chibi Maruko-chan Deluxe Quiz', genre: 'Puzzle', year: '1995', publisher: 'Takara', featured: false, libretro: 'Chibi Marukochan Deluxe Quiz.png' },
  { code: 'miexchng', title: 'Money Idol Exchanger', genre: 'Puzzle', year: '1997', publisher: 'Face', featured: false, libretro: 'Money Puzzle Exchanger _ Money Idol Exchanger.png' },
  { code: 'minasan', title: 'Minnasanno Okagesamadesu', genre: 'Puzzle', year: '1990', publisher: 'Monolith Corp.', featured: false, libretro: 'Minasanno Okagesamadesu! Daisugorokutaikai (MOM-001)(MOH-001).png' },
  { code: 'moshougi', title: 'Master of Syougi', genre: 'Puzzle', year: '1995', publisher: 'ADK / SNK', featured: false, libretro: 'Syougi No Tatsujin - Master of Shougi.png' },
  { code: 'mslug', title: 'Metal Slug: Super Vehicle-001', genre: 'Ação / Tiro', year: '1996', publisher: 'Nazca', featured: true, libretro: 'Metal Slug - Super Vehicle-001.png' },
  { code: 'mslug2', title: 'Metal Slug 2: Super Vehicle-001/II', genre: 'Ação / Tiro', year: '1998', publisher: 'SNK', featured: true, libretro: 'Metal Slug 2 - Super Vehicle-001_II (NGM-2410) (NGH-2410).png' },
  { code: 'mslug3', title: 'Metal Slug 3', genre: 'Ação / Tiro', year: '2000', publisher: 'SNK', featured: true, libretro: 'Metal Slug 3 (NGM-2560).png' },
  { code: 'mslug4', title: 'Metal Slug 4', genre: 'Ação / Tiro', year: '2002', publisher: 'Mega Enterprise / Playmore', featured: false, libretro: 'Metal Slug 4 (NGM-2630).png' },
  { code: 'mslug5', title: 'Metal Slug 5', genre: 'Ação / Tiro', year: '2003', publisher: 'SNK Playmore', featured: false, libretro: 'Metal Slug 5 (NGM-2680).png' },
  { code: 'mslugx', title: 'Metal Slug X: Super Vehicle-001', genre: 'Ação / Tiro', year: '1999', publisher: 'SNK', featured: true, libretro: 'Metal Slug X - Super Vehicle-001 (NGM-2500)(NGH-2500).png' },
  { code: 'mutnat', title: 'Mutation Nation', genre: 'Ação / Tiro', year: '1992', publisher: 'SNK', featured: false, libretro: 'Mutation Nation (NGM-014)(NGH-014).png' },
  { code: 'nam1975', title: 'NAM-1975', genre: 'Ação / Tiro', year: '1990', publisher: 'SNK', featured: false, libretro: 'NAM-1975 (NGM-001)(NGH-001).png' },
  { code: 'ncombat', title: 'Ninja Combat', genre: 'Ação / Tiro', year: '1990', publisher: 'Alpha Denshi', featured: false, libretro: 'Ninja Combat (NGH-009).png' },
  { code: 'ncommand', title: 'Ninja Commando', genre: 'Ação / Tiro', year: '1992', publisher: 'Alpha Denshi', featured: false, libretro: 'Ninja Commando.png' },
  { code: 'neobombe', title: 'Neo Bomberman', genre: 'Puzzle', year: '1997', publisher: 'Hudson Soft', featured: false, libretro: 'Neo Bomberman.png' },
  { code: 'neocup98', title: "Neo Geo Cup '98: The Road to the Victory", genre: 'Esportes', year: '1998', publisher: 'SNK', featured: false, libretro: "Neo-Geo Cup '98 - The Road to the Victory.png" },
  { code: 'neodrift', title: 'Neo Drift Out: New Technology', genre: 'Corrida', year: '1996', publisher: 'Visco', featured: true, libretro: 'Neo Drift Out - New Technology.png' },
  { code: 'neomrdo', title: 'Neo Mr. Do!', genre: 'Puzzle', year: '1996', publisher: 'Visco', featured: false, libretro: 'Neo Mr. Do!.png' },
  { code: 'neonopon', title: 'Neo No Panepon', genre: 'Puzzle', year: '2002', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'neopong', title: 'Neo Pong 1.1', genre: 'Esportes', year: '2002', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'neothund', title: 'Neo Thunder', genre: 'Nave / Shmup', year: '2012', publisher: 'Sebastian Mihai', featured: false, libretro: null },
  { code: 'ngem2k', title: 'NGEM2K (Game Boy Emulator)', genre: 'Puzzle', year: '2006', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'ngtetris', title: 'Neo Geo Tetris', genre: 'Puzzle', year: '2000', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'ninjamas', title: "Ninja Master's: Haoh Ninpo Cho", genre: 'Luta', year: '1996', publisher: 'ADK / SNK', featured: false, libretro: "Ninja Master's - haoh-ninpo-cho.png" },
  { code: 'nitd', title: 'Nightmare in the Dark', genre: 'Ação / Tiro', year: '2000', publisher: 'Eleven / Gavaking', featured: false, libretro: 'Nightmare in the Dark.png' },
  { code: 'overtop', title: 'Over Top', genre: 'Corrida', year: '1996', publisher: 'ADK', featured: false, libretro: 'Over Top.png' },
  { code: 'panicbom', title: 'Panic Bomber: Bomberman', genre: 'Puzzle', year: '1994', publisher: 'Hudson Soft', featured: false, libretro: 'Panic Bomber.png' },
  { code: 'pbobbl2n', title: 'Puzzle Bobble 2 / Bust-A-Move Again', genre: 'Puzzle', year: '1999', publisher: 'Taito / SNK', featured: false, libretro: 'Puzzle Bobble 2 _ Bust-A-Move Again (Neo-Geo).png' },
  { code: 'pbobblen', title: 'Puzzle Bobble / Bust-A-Move', genre: 'Puzzle', year: '1994', publisher: 'Taito', featured: true, libretro: 'Puzzle Bobble _ Bust-A-Move (Neo-Geo) (NGM-083).png' },
  { code: 'pgoal', title: 'Pleasure Goal: 5 on 5 Mini Soccer', genre: 'Esportes', year: '1996', publisher: 'Saurus', featured: false, libretro: 'Pleasure Goal _ Futsal - 5 on 5 Mini Soccer (NGM-219).png' },
  { code: 'pnyaa', title: 'Pochi and Nyaa', genre: 'Puzzle', year: '2003', publisher: 'Aiky / Taito', featured: false, libretro: 'Pochi and Nyaa (Ver 2.00).png' },
  { code: 'poknight', title: 'Poker Night', genre: 'Puzzle', year: '2003', publisher: 'Homebrew', featured: false, libretro: null },
  { code: 'popbounc', title: "Pop 'n Bounce / Gapporin", genre: 'Puzzle', year: '1997', publisher: 'Video System', featured: false, libretro: "Pop 'n Bounce _ Gapporin.png" },
  { code: 'powerins', title: 'Power Instinct', genre: 'Luta', year: '1993', publisher: 'Atlus', featured: false, libretro: 'MAME:Power Instinct (USA).png' },
  { code: 'preisle2', title: 'Prehistoric Isle 2', genre: 'Nave / Shmup', year: '1999', publisher: 'Yumekobo', featured: false, libretro: 'Prehistoric Isle 2.png' },
  { code: 'pspikes2', title: 'Power Spikes II', genre: 'Esportes', year: '1994', publisher: 'Video System', featured: false, libretro: 'Power Spikes II (NGM-068).png' },
  { code: 'pulstar', title: 'Pulstar', genre: 'Nave / Shmup', year: '1995', publisher: 'Aicom', featured: true, libretro: 'Pulstar.png' },
  { code: 'puzzldpr', title: 'Puzzle De Pon! R!', genre: 'Puzzle', year: '1997', publisher: 'Visco', featured: false, libretro: 'Puzzle De Pon! R!.png' },
  { code: 'puzzledp', title: 'Puzzle De Pon!', genre: 'Puzzle', year: '1995', publisher: 'Visco', featured: false, libretro: 'Puzzle De Pon!.png' },
  { code: 'quizdai2', title: 'Quiz Daisousasen Part 2', genre: 'Puzzle', year: '1992', publisher: 'SNK', featured: false, libretro: 'Quiz Meitantei Neo _ Geo - Quiz Daisousa Sen part 2 (NGM-042)(NGH-042).png' },
  { code: 'quizdais', title: 'Quiz Daisousasen: The Last Count Down', genre: 'Puzzle', year: '1991', publisher: 'SNK', featured: false, libretro: 'Quiz Daisousa Sen - The Last Count Down (NGM-023)(NGH-023).png' },
  { code: 'quizkof', title: 'Quiz King of Fighters', genre: 'Puzzle', year: '1995', publisher: 'Saurus / SNK', featured: false, libretro: 'Quiz King of Fighters (SAM-080)(SAH-080).png' },
  { code: 'ragnagrd', title: 'Ragnagard', genre: 'Luta', year: '1996', publisher: 'Saurus', featured: false, libretro: 'Ragnagard _ Shin-Oh-Ken.png' },
  { code: 'rbff1', title: 'Real Bout Fatal Fury', genre: 'Luta', year: '1995', publisher: 'SNK', featured: false, libretro: 'Real Bout Fatal Fury _ Real Bout Garou Densetsu (NGM-095)(NGH-095).png' },
  { code: 'rbff2', title: 'Real Bout Fatal Fury 2: The Newcomers', genre: 'Luta', year: '1998', publisher: 'SNK', featured: false, libretro: 'Real Bout Fatal Fury 2 - The Newcomers _ Real Bout Garou Densetsu 2 - the newcomers (NGM-2400).png' },
  { code: 'rbffspec', title: 'Real Bout Fatal Fury Special', genre: 'Luta', year: '1996', publisher: 'SNK', featured: true, libretro: 'Real Bout Fatal Fury Special _ Real Bout Garou Densetsu Special.png' },
  { code: 'ridhero', title: 'Riding Hero', genre: 'Corrida', year: '1990', publisher: 'SNK', featured: false, libretro: 'Riding Hero (NGM-006)(NGH-006).png' },
  { code: 'roboarmy', title: 'Robo Army', genre: 'Ação / Tiro', year: '1991', publisher: 'SNK', featured: false, libretro: 'Robo Army (set 1).png' },
  { code: 'rotd', title: 'Rage of the Dragons', genre: 'Luta', year: '2002', publisher: 'Evoga / Playmore', featured: true, libretro: 'Rage of the Dragons (NGM-264_).png' },
  { code: 'samsh5sp', title: 'Samurai Shodown V Special', genre: 'Luta', year: '2004', publisher: 'Yuki Enterprise / SNK Playmore', featured: false, libretro: 'Samurai Shodown V Special _ Samurai Spirits Zero Special (NGM-2720).png' },
  { code: 'samsho', title: 'Samurai Shodown', genre: 'Luta', year: '1993', publisher: 'SNK', featured: false, libretro: 'Samurai Shodown _ Samurai Spirits (NGM-045).png' },
  { code: 'samsho2', title: 'Samurai Shodown II', genre: 'Luta', year: '1994', publisher: 'SNK', featured: true, libretro: 'Samurai Shodown II _ Shin Samurai Spirits - Haohmaru jigokuhen (NGM-063)(NGH-063).png' },
  { code: 'samsho3', title: 'Samurai Shodown III', genre: 'Luta', year: '1995', publisher: 'SNK', featured: false, libretro: 'Samurai Shodown III _ Samurai Spirits - Zankurou Musouken (NGM-087).png' },
  { code: 'samsho4', title: "Samurai Shodown IV: Amakusa's Revenge", genre: 'Luta', year: '1996', publisher: 'SNK', featured: false, libretro: "Samurai Shodown IV - Amakusa's Revenge _ Samurai Spirits - Amakusa Kourin (NGM-222)(NGH-222).png" },
  { code: 'savagere', title: 'Savage Reign', genre: 'Luta', year: '1995', publisher: 'SNK', featured: false, libretro: "Savage Reign _ Fu'un Mokushiroku - kakutou sousei.png" },
  { code: 'sbp', title: 'Super Bubble Pop', genre: 'Puzzle', year: '2004', publisher: 'Vektorlogic', featured: false, libretro: null },
  { code: 'sdodgeb', title: 'Super Dodge Ball', genre: 'Esportes', year: '1996', publisher: 'Technos Japan', featured: false, libretro: 'Super Dodge Ball _ Kunio no Nekketsu Toukyuu Densetsu.png' },
  { code: 'sengoku', title: 'Sengoku', genre: 'Ação / Tiro', year: '1991', publisher: 'SNK', featured: false, libretro: 'Sengoku _ Sengoku Denshou (NGM-017)(NGH-017).png' },
  { code: 'sengoku2', title: 'Sengoku 2', genre: 'Ação / Tiro', year: '1993', publisher: 'SNK', featured: false, libretro: 'Sengoku 2 _ Sengoku Denshou 2.png' },
  { code: 'sengoku3', title: 'Sengoku 3', genre: 'Ação / Tiro', year: '2001', publisher: 'Noise Factory / SNK', featured: true, libretro: 'Sengoku 3 _ Sengoku Densho 2001 (set 1).png' },
  { code: 'shocktr2', title: 'Shock Troopers: 2nd Squad', genre: 'Ação / Tiro', year: '1998', publisher: 'Saurus', featured: false, libretro: 'Shock Troopers - 2nd Squad.png' },
  { code: 'shocktro', title: 'Shock Troopers', genre: 'Ação / Tiro', year: '1997', publisher: 'Saurus', featured: true, libretro: 'Shock Troopers (set 1).png' },
  { code: 'socbrawl', title: 'Soccer Brawl', genre: 'Esportes', year: '1991', publisher: 'SNK', featured: false, libretro: 'Soccer Brawl (NGM-031).png' },
  { code: 'sonicwi2', title: 'Aero Fighters 2 / Sonic Wings 2', genre: 'Nave / Shmup', year: '1994', publisher: 'Video System', featured: false, libretro: 'Aero Fighters 2 _ Sonic Wings 2.png' },
  { code: 'sonicwi3', title: 'Aero Fighters 3 / Sonic Wings 3', genre: 'Nave / Shmup', year: '1995', publisher: 'Video System', featured: false, libretro: 'Aero Fighters 3 _ Sonic Wings 3.png' },
  { code: 'spinmast', title: 'Spinmaster', genre: 'Ação / Tiro', year: '1993', publisher: 'Data East', featured: false, libretro: 'Spin Master _ Miracle Adventure.png' },
  { code: 'ssideki', title: 'Super Sidekicks', genre: 'Esportes', year: '1992', publisher: 'SNK', featured: false, libretro: 'Super Sidekicks _ Tokuten Ou.png' },
  { code: 'ssideki2', title: 'Super Sidekicks 2: The World Championship', genre: 'Esportes', year: '1994', publisher: 'SNK', featured: false, libretro: 'Super Sidekicks 2 - The World Championship _ Tokuten Ou 2 - real fight football (NGM-061)(NGH-061).png' },
  { code: 'ssideki3', title: 'Super Sidekicks 3: The Next Glory', genre: 'Esportes', year: '1995', publisher: 'SNK', featured: false, libretro: 'Super Sidekicks 3 - The Next Glory _ Tokuten Ou 3 - eikou e no michi.png' },
  { code: 'ssideki4', title: 'The Ultimate 11: The SNK Football Championship', genre: 'Esportes', year: '1996', publisher: 'SNK', featured: false, libretro: 'The Ultimate 11 - The SNK Football Championship _ Tokuten Ou - Honoo no Libero.png' },
  { code: 'stakwin', title: 'Stakes Winner', genre: 'Corrida', year: '1995', publisher: 'Saurus', featured: false, libretro: 'Stakes Winner _ Stakes Winner - GI kinzen seiha e no michi.png' },
  { code: 'stakwin2', title: 'Stakes Winner 2', genre: 'Corrida', year: '1996', publisher: 'Saurus', featured: false, libretro: 'Stakes Winner 2.png' },
  { code: 'strhoop', title: 'Street Hoop / Dunk Dream', genre: 'Esportes', year: '1994', publisher: 'Data East', featured: true, libretro: 'Street Hoop _ Street Slam _ Dunk Dream (DEM-004) (DEH-004).png' },
  { code: 'superspy', title: 'The Super Spy', genre: 'Ação / Tiro', year: '1990', publisher: 'SNK', featured: false, libretro: 'The Super Spy (NGM-011)(NGH-011).png' },
  { code: 'tophuntr', title: 'Top Hunter: Roddy & Cathy', genre: 'Ação / Tiro', year: '1994', publisher: 'SNK', featured: false, libretro: 'Top Hunter - Roddy _ Cathy (NGM-046).png' },
  { code: 'totc', title: 'Treasure of the Caribbean', genre: 'Puzzle', year: '2011', publisher: 'Face / NCI - Le Cortex', featured: false, libretro: 'Treasure of the Caribbean.png' },
  { code: 'tpgolf', title: "Top Player's Golf", genre: 'Esportes', year: '1990', publisher: 'SNK', featured: false, libretro: "Top Player's Golf (NGM-003)(NGH-003).png" },
  { code: 'trally', title: 'Thrash Rally', genre: 'Corrida', year: '1991', publisher: 'Alpha Denshi', featured: false, libretro: 'Thrash Rally (ALM-003)(ALH-003).png' },
  { code: 'turfmast', title: 'Neo Turf Masters', genre: 'Esportes', year: '1996', publisher: 'Nazca', featured: true, libretro: 'Neo Turf Masters _ Big Tournament Golf.png' },
  { code: 'twinspri', title: 'Twinkle Star Sprites', genre: 'Nave / Shmup', year: '1996', publisher: 'ADK / SNK', featured: true, libretro: 'Twinkle Star Sprites.png' },
  { code: 'twsoc96', title: "Tecmo World Soccer '96", genre: 'Esportes', year: '1996', publisher: 'Tecmo', featured: false, libretro: "Tecmo World Soccer '96.png" },
  { code: 'viewpoin', title: 'Viewpoint', genre: 'Nave / Shmup', year: '1992', publisher: 'Sammy / Aicom', featured: true, libretro: 'Viewpoint.png' },
  { code: 'vliner', title: 'V-Liner', genre: 'Puzzle', year: '2001', publisher: 'Dyna / BrezzaSoft', featured: false, libretro: 'V-Liner (set 1).png' },
  { code: 'wakuwak7', title: 'Waku Waku 7', genre: 'Luta', year: '1996', publisher: 'Sunsoft', featured: true, libretro: 'Waku Waku 7.png' },
  { code: 'wh1', title: 'World Heroes', genre: 'Luta', year: '1992', publisher: 'Alpha Denshi', featured: false, libretro: 'World Heroes (ALM-005).png' },
  { code: 'wh2', title: 'World Heroes 2', genre: 'Luta', year: '1993', publisher: 'ADK', featured: false, libretro: 'World Heroes 2 (ALM-006)(ALH-006).png' },
  { code: 'wh2j', title: 'World Heroes 2 Jet', genre: 'Luta', year: '1994', publisher: 'ADK / SNK', featured: false, libretro: 'World Heroes 2 Jet (ADM-007)(ADH-007).png' },
  { code: 'whp', title: 'World Heroes Perfect', genre: 'Luta', year: '1995', publisher: 'ADK / SNK', featured: false, libretro: 'World Heroes Perfect.png' },
  { code: 'wjammers', title: 'Windjammers / Flying Power Disc', genre: 'Esportes', year: '1994', publisher: 'Data East', featured: true, libretro: 'Windjammers _ Flying Power Disc.png' },
  { code: 'zedblade', title: 'Zed Blade', genre: 'Nave / Shmup', year: '1994', publisher: 'NMK', featured: false, libretro: 'Zed Blade _ Operation Ragnarok.png' },
  { code: 'zintrckb', title: 'Zintrick', genre: 'Puzzle', year: '1996', publisher: 'ADK / SNK', featured: false, libretro: 'Zintrick _ Oshidashi Zentrix (hack _ bootleg) [Bootleg].png' },
  { code: 'zupapa', title: 'Zupapa!', genre: 'Ação / Tiro', year: '2001', publisher: 'SNK', featured: false, libretro: 'Zupapa!.png' }
];

async function syncNeoGeo() {
  console.log('=== Iniciando sincronização de jogos e capas do Neo Geo ===');

  const romFiles = fs.readdirSync(NEOGEO_ROM_DIR)
    .filter(f => f.endsWith('.zip') && f !== 'neogeo.zip')
    .sort();

  console.log(`Detectadas ${romFiles.length} ROMs na pasta neogeo/`);

  const regMap = new Map();
  for (const entry of NEOGEO_REGISTRY) {
    regMap.set(entry.code, entry);
  }

  let downloadedCount = 0;
  let fallbackCount = 0;
  let alreadyExistedCount = 0;
  let failedCount = 0;

  const finalGames = [];

  for (const romFile of romFiles) {
    const code = romFile.replace(/\.zip$/i, '');
    const meta = regMap.get(code);

    if (!meta) {
      console.warn(`[AVISO] ROM não encontrada no registro: ${romFile}`);
      continue;
    }

    const slug = slugify(meta.title);
    const coverRel = `assets/covers/neogeo/${slug}.png`;
    const coverPath = path.join(ROOT, coverRel);

    let coverReady = isValidLocalPng(coverPath);

    if (coverReady) {
      alreadyExistedCount++;
    } else {
      let success = false;
      if (meta.libretro) {
        let remoteUrl;
        if (meta.libretro.startsWith('MAME:')) {
          const mameFile = meta.libretro.replace('MAME:', '');
          remoteUrl = `https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Boxarts/${encodeURIComponent(mameFile)}`;
        } else {
          remoteUrl = `https://raw.githubusercontent.com/libretro-thumbnails/SNK_-_Neo_Geo/master/Named_Boxarts/${encodeURIComponent(meta.libretro)}`;
        }

        try {
          const buf = await downloadBuffer(remoteUrl);
          if (isPngBuffer(buf)) {
            fs.writeFileSync(coverPath, buf);
            console.log(`[DOWNLOAD] ${slug}.png (${buf.length} bytes) de ${meta.libretro}`);
            downloadedCount++;
            success = true;
          }
        } catch (err) {
          console.warn(`[FALHA DOWNLOAD] ${meta.title} (${meta.libretro}): ${err.message}`);
        }
      }

      if (!success) {
        try {
          generateFallbackWithPython(meta.title, meta.genre, meta.year, meta.publisher, coverPath);
          console.log(`[FALLBACK GERADO] ${slug}.png para ${meta.title}`);
          fallbackCount++;
          success = true;
        } catch (err) {
          console.error(`[ERRO FALLBACK] ${meta.title}: ${err.message}`);
          failedCount++;
        }
      }
    }

    finalGames.push({
      name: romFile,
      title: meta.title,
      region: 'MVS / Arcade',
      genre: meta.genre,
      year: meta.year,
      publisher: meta.publisher,
      featured: Boolean(meta.featured),
      url: `/neogeo/${encodeURIComponent(romFile)}`,
      cover: coverRel
    });
  }

  // Ordenar alfabeticamente pelo título
  finalGames.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));

  const jsonPath = path.join(ROOT, 'neogeo-games.json');
  fs.writeFileSync(jsonPath, JSON.stringify(finalGames, null, 2), 'utf8');
  console.log(`\nSalvo arquivo final: ${jsonPath} com ${finalGames.length} jogos.`);

  console.log('\n--- Resumo ---');
  console.log(`Total de jogos catalogados: ${finalGames.length}`);
  console.log(`Capas já existentes e válidas: ${alreadyExistedCount}`);
  console.log(`Capas oficiais baixadas da Libretro: ${downloadedCount}`);
  console.log(`Capas fallback geradas: ${fallbackCount}`);
  console.log(`Falhas: ${failedCount}`);
  console.log('----------------');

  return {
    total: finalGames.length,
    downloaded: downloadedCount,
    fallback: fallbackCount,
    alreadyExisted: alreadyExistedCount,
    failed: failedCount
  };
}

if (require.main === module) {
  syncNeoGeo().catch(err => {
    console.error('Erro na execução do script:', err);
    process.exit(1);
  });
}

module.exports = { syncNeoGeo, NEOGEO_REGISTRY };
