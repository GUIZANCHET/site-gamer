const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const covers = [
  // PSP COVERS
  {
    path: 'assets/covers/psp/gta-vice-city-stories.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_gta" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F0C20"/>
      <stop offset="50%" stop-color="#3A1C71"/>
      <stop offset="100%" stop-color="#D76D77"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#FFA07A" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#3A1C71" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="270" fill="url(#bg_gta)"/>
  <circle cx="240" cy="110" r="80" fill="url(#sun)"/>
  <rect x="0" y="0" width="480" height="28" fill="rgba(10,10,15,0.9)"/>
  <text x="16" y="19" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="800" fill="#00E5FF" letter-spacing="2">PSP™</text>
  <text x="64" y="19" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#CCC">PLAYSTATION PORTABLE</text>
  <rect x="380" y="6" width="86" height="16" rx="3" fill="#E60012"/>
  <text x="423" y="18" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF">18+ ADULTO</text>
  <g transform="translate(240, 115)">
    <text x="0" y="0" text-anchor="middle" font-size="52">🌴🏎️</text>
  </g>
  <rect x="20" y="170" width="440" height="85" rx="8" fill="rgba(12,12,18,0.85)" stroke="rgba(0,229,255,0.3)" stroke-width="1.5"/>
  <text x="36" y="194" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FF5252" letter-spacing="1">ROCKSTAR GAMES • 2006</text>
  <text x="36" y="218" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Grand Theft Auto: Vice City Stories</text>
  <text x="36" y="240" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#9AA5B8">Ação em Mundo Aberto nos anos 80 em Vice City</text>
</svg>`
  },
  {
    path: 'assets/covers/psp/spider-man-friend-or-foe.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_spid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A0B2E"/>
      <stop offset="50%" stop-color="#16213E"/>
      <stop offset="100%" stop-color="#0F3460"/>
    </linearGradient>
    <radialGradient id="web_glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#E94560" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#1A0B2E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="480" height="270" fill="url(#bg_spid)"/>
  <circle cx="240" cy="110" r="90" fill="url(#web_glow)"/>
  <rect x="0" y="0" width="480" height="28" fill="rgba(10,10,15,0.9)"/>
  <text x="16" y="19" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="800" fill="#00E5FF" letter-spacing="2">PSP™</text>
  <text x="64" y="19" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#CCC">PLAYSTATION PORTABLE</text>
  <rect x="388" y="6" width="78" height="16" rx="3" fill="#10B981"/>
  <text x="427" y="18" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF">LIVRE</text>
  <g transform="translate(240, 115)">
    <text x="0" y="0" text-anchor="middle" font-size="52">🕷️🕸️</text>
  </g>
  <rect x="20" y="170" width="440" height="85" rx="8" fill="rgba(12,12,18,0.85)" stroke="rgba(233,69,96,0.4)" stroke-width="1.5"/>
  <text x="36" y="194" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#00E5FF" letter-spacing="1">ACTIVISION • MARVEL • 2007</text>
  <text x="36" y="218" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Spider-Man: Friend or Foe</text>
  <text x="36" y="240" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#9AA5B8">Batalhas épicas e alianças contra vilões cósmicos</text>
</svg>`
  },

  // GAME BOY COVERS
  {
    path: 'assets/covers/gameboy/pokemon-blue.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1565C0"/>
      <stop offset="100%" stop-color="#0D47A1"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_blue)"/>
  <!-- Game Boy classic side stripe -->
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.15)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">🐢💧</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(10,25,47,0.85)" stroke="#64B5F6" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFCA28">NINTENDO • 1998</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="800" fill="#FFF">Pokémon Blue</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#90CAF9">A jornada clássica de Kanto e Blastoise</text>
</svg>`
  },
  {
    path: 'assets/covers/gameboy/pokemon-red.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C62828"/>
      <stop offset="100%" stop-color="#8E0000"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_red)"/>
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.15)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">🔥🐉</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(40,10,10,0.85)" stroke="#EF5350" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFCA28">NINTENDO • 1998</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="800" fill="#FFF">Pokémon Red</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#EF9A9A">A jornada clássica de Kanto e Charizard</text>
</svg>`
  },
  {
    path: 'assets/covers/gameboy/pokemon-yellow.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_yellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F9A825"/>
      <stop offset="100%" stop-color="#E65100"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_yellow)"/>
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.2)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">⚡🐹</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(30,20,5,0.85)" stroke="#FFD54F" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFF">SPECIAL PIKACHU EDITION</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="19" font-weight="800" fill="#FFF">Pokémon Yellow</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#FFE082">Acompanhe Pikachu na aventura inspirada no anime</text>
</svg>`
  },
  {
    path: 'assets/covers/gameboy/donkey-kong-land-2.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_dk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4E342E"/>
      <stop offset="100%" stop-color="#271406"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_dk)"/>
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.1)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">🍌🐵</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(20,10,5,0.85)" stroke="#FFA726" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFCC80">RARE • NINTENDO • 1996</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Donkey Kong Land 2</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#FFE082">Diddy & Dixie em Crocodile Isle portátil</text>
</svg>`
  },
  {
    path: 'assets/covers/gameboy/metroid-2-return-of-samus.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_met" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B5E20"/>
      <stop offset="50%" stop-color="#0D3310"/>
      <stop offset="100%" stop-color="#051807"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_met)"/>
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(76,175,80,0.2)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">🪐🔫</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(5,20,8,0.85)" stroke="#66BB6A" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#81C784">NINTENDO R&D1 • 1991</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="17" font-weight="800" fill="#FFF">Metroid II: Samus</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#A5D6A7">A caçada no planeta SR388</text>
</svg>`
  },
  {
    path: 'assets/covers/gameboy/hercules.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="gb_herc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E65100"/>
      <stop offset="100%" stop-color="#5D4037"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="8" fill="url(#gb_herc)"/>
  <rect x="0" y="0" width="38" height="320" fill="#B0BEC5"/>
  <text x="19" y="160" transform="rotate(-90 19 160)" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="800" fill="#37474F" letter-spacing="4">GAME BOY™</text>
  <g transform="translate(180, 110)">
    <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.15)"/>
    <text x="0" y="14" text-anchor="middle" font-size="44">🏛️⚡</text>
  </g>
  <rect x="48" y="200" width="260" height="105" rx="6" fill="rgba(30,15,5,0.85)" stroke="#FFB74D" stroke-width="1.5"/>
  <text x="60" y="224" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFE082">DISNEY INTERACTIVE • 1997</text>
  <text x="60" y="252" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Disney's Hércules</text>
  <text x="60" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#FFE082">Torne-se um verdadeiro herói mitológico</text>
</svg>`
  },

  // SEGA GENESIS / MEGA DRIVE COVERS
  {
    path: 'assets/covers/sega/sonic-1.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_s1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0052D4"/>
      <stop offset="50%" stop-color="#4364F7"/>
      <stop offset="100%" stop-color="#6FB1FC"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_s1)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="48">🦔💨</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#00E5FF">SONIC TEAM • 1991</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="800" fill="#FFF">Sonic The Hedgehog</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#90CAF9">O lendário início da velocidade azul</text>
</svg>`
  },
  {
    path: 'assets/covers/sega/sonic-2.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_s2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021B79"/>
      <stop offset="50%" stop-color="#0575E6"/>
      <stop offset="100%" stop-color="#F27121"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_s2)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="48">🦊🦔</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#F27121">SEGA • SONIC & TAILS • 1992</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="800" fill="#FFF">Sonic The Hedgehog 2</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#90CAF9">O Spin Dash e a estreia de Tails!</text>
</svg>`
  },
  {
    path: 'assets/covers/sega/sonic-3-knuckles.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_s3k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B71C1C"/>
      <stop offset="50%" stop-color="#0D47A1"/>
      <stop offset="100%" stop-color="#2E7D32"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_s3k)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="46">💎🥊</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#EF5350">LOCK-ON TECHNOLOGY • 1994</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Sonic 3 & Knuckles</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#E0E0E0">A obra-prima definitiva completa!</text>
</svg>`
  },
  {
    path: 'assets/covers/sega/earthworm-jim-2.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_ej" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4A148C"/>
      <stop offset="50%" stop-color="#880E4F"/>
      <stop offset="100%" stop-color="#F57F17"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_ej)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="46">🪱🔫</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFD54F">SHINY ENTERTAINMENT • 1995</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="19" font-weight="800" fill="#FFF">Earthworm Jim 2</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#E0E0E0">O minhoca espacial mais maluco dos games</text>
</svg>`
  },
  {
    path: 'assets/covers/sega/golden-axe.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_ga" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3E2723"/>
      <stop offset="50%" stop-color="#D84315"/>
      <stop offset="100%" stop-color="#BF360C"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_ga)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="46">🪓🔥</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#FFB74D">SEGA ARCADE • 1989</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="800" fill="#FFF">Golden Axe</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#E0E0E0">Bárbaros, magias e dragões em Yuria</text>
</svg>`
  },
  {
    path: 'assets/covers/sega/shinobi-3.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" width="100%" height="100%">
  <defs>
    <linearGradient id="sega_sh" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#212121"/>
      <stop offset="50%" stop-color="#37474F"/>
      <stop offset="100%" stop-color="#006064"/>
    </linearGradient>
  </defs>
  <rect width="340" height="320" rx="8" fill="url(#sega_sh)"/>
  <rect x="0" y="0" width="340" height="34" fill="#0A0A0A"/>
  <text x="16" y="23" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" fill="#FFF" letter-spacing="3">SEGA</text>
  <text x="76" y="22" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#00E5FF">16-BIT MEGA DRIVE</text>
  <g transform="translate(170, 115)">
    <circle cx="0" cy="0" r="54" fill="rgba(0,0,0,0.3)" stroke="#FFF" stroke-width="2"/>
    <text x="0" y="16" text-anchor="middle" font-size="46">🥷⚔️</text>
  </g>
  <rect x="18" y="195" width="304" height="110" rx="6" fill="rgba(10,12,24,0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="32" y="220" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#80DEEA">SEGA • JOE MUSASHI • 1993</text>
  <text x="32" y="248" font-family="'Space Grotesk', sans-serif" font-size="18" font-weight="800" fill="#FFF">Shinobi III: Ninja Master</text>
  <text x="32" y="274" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#E0E0E0">Ação ninja impecável e trilha inesquecível</text>
</svg>`
  }
];

for (const c of covers) {
  const fullPath = path.join(root, c.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, c.svg.trim(), 'utf8');
  console.log('✅ Criado:', c.path);
}
