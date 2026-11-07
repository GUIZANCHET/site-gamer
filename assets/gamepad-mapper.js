/**
 * Continue? — Sistema Universal de Controle, Teclado e Touch Mobile
 * Desenvolvido para ser super leve, acessível para crianças e compatível
 * com celulares básicos, tablets, PCs e controles USB/Bluetooth.
 */
(function () {
  'use strict';

  var STORAGE_KEY_CONTROLS = 'continue_custom_controls_v1';
  var STORAGE_KEY_TOUCH = 'continue_touch_settings_v1';

  // Definição padrão amigável para crianças e compatível com EmulatorJS (SNES, NES, PS1)
  var DEFAULT_BINDINGS = [
    {
      id: 'up',
      ejsIndex: 4,
      label: 'Cima ⬆️',
      shortLabel: '▲',
      kidHint: 'Andar ou olhar para cima',
      defaultKey: 'up arrow',
      defaultCode: 'ArrowUp',
      defaultPad: 'DPAD_UP',
      defaultPadIndex: 12,
      svgId: 'svg-btn-up'
    },
    {
      id: 'down',
      ejsIndex: 5,
      label: 'Baixo ⬇️',
      shortLabel: '▼',
      kidHint: 'Abaixar ou ir para baixo',
      defaultKey: 'down arrow',
      defaultCode: 'ArrowDown',
      defaultPad: 'DPAD_DOWN',
      defaultPadIndex: 13,
      svgId: 'svg-btn-down'
    },
    {
      id: 'left',
      ejsIndex: 6,
      label: 'Esquerda ⬅️',
      shortLabel: '◀',
      kidHint: 'Andar para a esquerda',
      defaultKey: 'left arrow',
      defaultCode: 'ArrowLeft',
      defaultPad: 'DPAD_LEFT',
      defaultPadIndex: 14,
      svgId: 'svg-btn-left'
    },
    {
      id: 'right',
      ejsIndex: 7,
      label: 'Direita ➡️',
      shortLabel: '▶',
      kidHint: 'Andar para a direita',
      defaultKey: 'right arrow',
      defaultCode: 'ArrowRight',
      defaultPad: 'DPAD_RIGHT',
      defaultPadIndex: 15,
      svgId: 'svg-btn-right'
    },
    {
      id: 'b',
      ejsIndex: 0,
      label: 'Botão B / ✕ (Pular)',
      shortLabel: 'B',
      kidHint: 'Pular ou confirmar nos jogos',
      defaultKey: 'z',
      defaultCode: 'KeyZ',
      defaultPad: 'BUTTON_1',
      defaultPadIndex: 0,
      svgId: 'svg-btn-b'
    },
    {
      id: 'a',
      ejsIndex: 8,
      label: 'Botão A / ○ (Especial)',
      shortLabel: 'A',
      kidHint: 'Soltar item, girar ou cancelar',
      defaultKey: 'x',
      defaultCode: 'KeyX',
      defaultPad: 'BUTTON_2',
      defaultPadIndex: 1,
      svgId: 'svg-btn-a'
    },
    {
      id: 'y',
      ejsIndex: 9,
      label: 'Botão Y / □ (Correr / Atacar)',
      shortLabel: 'Y',
      kidHint: 'Correr rápido ou atacar',
      defaultKey: 'a',
      defaultCode: 'KeyA',
      defaultPad: 'BUTTON_3',
      defaultPadIndex: 2,
      svgId: 'svg-btn-y'
    },
    {
      id: 'x',
      ejsIndex: 1,
      label: 'Botão X / △ (Ação Extra)',
      shortLabel: 'X',
      kidHint: 'Trocar arma ou ataque forte',
      defaultKey: 's',
      defaultCode: 'KeyS',
      defaultPad: 'BUTTON_4',
      defaultPadIndex: 3,
      svgId: 'svg-btn-x'
    },
    {
      id: 'l1',
      ejsIndex: 10,
      label: 'Ombro L / L1',
      shortLabel: 'L1',
      kidHint: 'Botão de cima na esquerda',
      defaultKey: 'q',
      defaultCode: 'KeyQ',
      defaultPad: 'LEFT_TOP_SHOULDER',
      defaultPadIndex: 4,
      svgId: 'svg-btn-l'
    },
    {
      id: 'r1',
      ejsIndex: 11,
      label: 'Ombro R / R1',
      shortLabel: 'R1',
      kidHint: 'Botão de cima na direita',
      defaultKey: 'e',
      defaultCode: 'KeyE',
      defaultPad: 'RIGHT_TOP_SHOULDER',
      defaultPadIndex: 5,
      svgId: 'svg-btn-r'
    },
    {
      id: 'start',
      ejsIndex: 3,
      label: 'START (Começar / Pausar)',
      shortLabel: 'START',
      kidHint: 'Começar o jogo ou pausar',
      defaultKey: 'enter',
      defaultCode: 'Enter',
      defaultPad: 'START',
      defaultPadIndex: 9,
      svgId: 'svg-btn-start'
    },
    {
      id: 'select',
      ejsIndex: 2,
      label: 'SELECT (Escolher / Mapa)',
      shortLabel: 'SELECT',
      kidHint: 'Trocar opção ou abrir mapa',
      defaultKey: 'v',
      defaultCode: 'KeyV',
      defaultPad: 'SELECT',
      defaultPadIndex: 8,
      svgId: 'svg-btn-select'
    }
  ];

  // Mapa de nomes de botões do Gamepad W3C Standard para EmulatorJS
  var GAMEPAD_INDEX_TO_EJS = {
    0: { ejs: 'BUTTON_1', label: 'Botão Sul (✕ / B)' },
    1: { ejs: 'BUTTON_2', label: 'Botão Leste (○ / A)' },
    2: { ejs: 'BUTTON_3', label: 'Botão Oeste (□ / Y)' },
    3: { ejs: 'BUTTON_4', label: 'Botão Norte (△ / X)' },
    4: { ejs: 'LEFT_TOP_SHOULDER', label: 'Ombro L1 / LB' },
    5: { ejs: 'RIGHT_TOP_SHOULDER', label: 'Ombro R1 / RB' },
    6: { ejs: 'LEFT_BOTTOM_SHOULDER', label: 'Gatilho L2 / LT' },
    7: { ejs: 'RIGHT_BOTTOM_SHOULDER', label: 'Gatilho R2 / RT' },
    8: { ejs: 'SELECT', label: 'Botão Select / Share' },
    9: { ejs: 'START', label: 'Botão Start / Options' },
    10: { ejs: 'LEFT_STICK', label: 'Clique Analógico Esq (L3)' },
    11: { ejs: 'RIGHT_STICK', label: 'Clique Analógico Dir (R3)' },
    12: { ejs: 'DPAD_UP', label: 'Setinha Cima (D-Pad)' },
    13: { ejs: 'DPAD_DOWN', label: 'Setinha Baixo (D-Pad)' },
    14: { ejs: 'DPAD_LEFT', label: 'Setinha Esquerda (D-Pad)' },
    15: { ejs: 'DPAD_RIGHT', label: 'Setinha Direita (D-Pad)' }
  };

  function normalizeKeyboardEventToEJS(e) {
    var key = e.key;
    var code = e.code;
    if (key === 'ArrowUp') return { ejsKey: 'up arrow', display: 'Seta ⬆️', code: 'ArrowUp' };
    if (key === 'ArrowDown') return { ejsKey: 'down arrow', display: 'Seta ⬇️', code: 'ArrowDown' };
    if (key === 'ArrowLeft') return { ejsKey: 'left arrow', display: 'Seta ⬅️', code: 'ArrowLeft' };
    if (key === 'ArrowRight') return { ejsKey: 'right arrow', display: 'Seta ➡️', code: 'ArrowRight' };
    if (key === 'Enter') return { ejsKey: 'enter', display: 'Enter ⏎', code: 'Enter' };
    if (key === ' ' || code === 'Space') return { ejsKey: 'space', display: 'Espaço ␣', code: 'Space' };
    if (key === 'Tab') return { ejsKey: 'tab', display: 'Tab ⇥', code: 'Tab' };
    if (key === 'Shift') return { ejsKey: 'shift', display: 'Shift ⇧', code: code || 'ShiftLeft' };
    if (key === 'Control') return { ejsKey: 'ctrl', display: 'Ctrl', code: code || 'ControlLeft' };
    if (key === 'Alt') return { ejsKey: 'alt', display: 'Alt', code: code || 'AltLeft' };
    if (key === 'Backspace') return { ejsKey: 'backspace', display: 'Apagar ⌫', code: 'Backspace' };
    var clean = String(key).toLowerCase();
    return {
      ejsKey: clean,
      display: 'Tecla ' + clean.toUpperCase(),
      code: code || ('Key' + clean.toUpperCase())
    };
  }

  function formatKeyDisplay(ejsKey) {
    if (!ejsKey) return '—';
    var map = {
      'up arrow': 'Seta ⬆️',
      'down arrow': 'Seta ⬇️',
      'left arrow': 'Seta ⬅️',
      'right arrow': 'Seta ➡️',
      'enter': 'Enter ⏎',
      'space': 'Espaço ␣',
      'tab': 'Tab ⇥',
      'shift': 'Shift ⇧'
    };
    return map[ejsKey] || ('Tecla ' + String(ejsKey).toUpperCase());
  }

  function formatPadDisplay(padIndex, padName) {
    if (typeof padIndex === 'number' && GAMEPAD_INDEX_TO_EJS[padIndex]) {
      return GAMEPAD_INDEX_TO_EJS[padIndex].label;
    }
    return padName || 'Controle Padrão';
  }

  function getSavedControls() {
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTROLS) || '{}') || {};
    } catch (e) {
      saved = {};
    }
    var result = {};
    for (var i = 0; i < DEFAULT_BINDINGS.length; i++) {
      var b = DEFAULT_BINDINGS[i];
      var custom = saved[b.id] || {};
      result[b.id] = {
        id: b.id,
        ejsIndex: b.ejsIndex,
        label: b.label,
        shortLabel: b.shortLabel,
        kidHint: b.kidHint,
        svgId: b.svgId,
        key: custom.key || b.defaultKey,
        code: custom.code || b.defaultCode,
        keyDisplay: custom.keyDisplay || formatKeyDisplay(custom.key || b.defaultKey),
        pad: custom.pad || b.defaultPad,
        padIndex: typeof custom.padIndex === 'number' ? custom.padIndex : b.defaultPadIndex,
        padDisplay: custom.padDisplay || formatPadDisplay(
          typeof custom.padIndex === 'number' ? custom.padIndex : b.defaultPadIndex,
          custom.pad || b.defaultPad
        )
      };
    }
    return result;
  }

  function saveControls(map) {
    try {
      localStorage.setItem(STORAGE_KEY_CONTROLS, JSON.stringify(map));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('continue:controls-updated', { detail: map }));
  }

  function resetControls() {
    try {
      localStorage.removeItem(STORAGE_KEY_CONTROLS);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('continue:controls-updated', { detail: getSavedControls() }));
  }

  function getTouchSettings() {
    var defaults = {
      size: 'large',      // 'large' | 'normal'
      alwaysShow: true,   // Mostra controles na tela automaticamente em celulares
      vibration: true     // Vibração leve ao apertar botões no celular
    };
    try {
      var raw = localStorage.getItem(STORAGE_KEY_TOUCH);
      if (!raw) return defaults;
      var parsed = JSON.parse(raw);
      return {
        size: parsed.size === 'normal' ? 'normal' : 'large',
        alwaysShow: parsed.alwaysShow !== false,
        vibration: parsed.vibration !== false
      };
    } catch (e) {
      return defaults;
    }
  }

  function saveTouchSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_TOUCH, JSON.stringify(settings));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('continue:touch-updated', { detail: settings }));
  }

  // =========================================================================
  // ANALÓGICOS (sticks) — configurações + leitura com zona morta
  // =========================================================================
  var STORAGE_KEY_ANALOG = 'continue_analog_settings_v1';
  // Presets amigáveis de zona morta (quanto o analógico precisa mexer para contar)
  var ANALOG_DEADZONES = { sensivel: 0.18, normal: 0.3, firme: 0.5 };

  function getAnalogSettings() {
    var defaults = { stickAsDpad: true, preset: 'normal' };
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY_ANALOG) || 'null');
      if (!parsed) return withDeadzone(defaults);
      return withDeadzone({
        stickAsDpad: parsed.stickAsDpad !== false,
        preset: ANALOG_DEADZONES[parsed.preset] ? parsed.preset : 'normal'
      });
    } catch (e) {
      return withDeadzone(defaults);
    }
  }

  function withDeadzone(s) {
    s.deadzone = ANALOG_DEADZONES[s.preset] || ANALOG_DEADZONES.normal;
    return s;
  }

  function saveAnalogSettings(settings) {
    var clean = { stickAsDpad: settings.stickAsDpad !== false, preset: settings.preset };
    try {
      localStorage.setItem(STORAGE_KEY_ANALOG, JSON.stringify(clean));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('continue:analog-updated', { detail: withDeadzone(clean) }));
  }

  function getFirstPad() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) return pads[i];
    }
    return null;
  }

  /**
   * Converte um analógico (x, y) em direções digitais de 8 vias.
   * Retorna { up, down, left, right } respeitando a zona morta.
   */
  function stickToDirections(x, y, deadzone) {
    var dirs = { up: false, down: false, left: false, right: false };
    var mag = Math.sqrt(x * x + y * y);
    if (mag < deadzone) return dirs;
    // 8 setores de 45° (0 = direita, sentido horário porque Y cresce para baixo)
    var sector = Math.round(Math.atan2(y, x) / (Math.PI / 4));
    sector = ((sector % 8) + 8) % 8;
    dirs.right = sector === 0 || sector === 1 || sector === 7;
    dirs.down = sector === 1 || sector === 2 || sector === 3;
    dirs.left = sector === 3 || sector === 4 || sector === 5;
    dirs.up = sector === 5 || sector === 6 || sector === 7;
    return dirs;
  }

  /**
   * Gera o objeto completo `EJS_defaultControls` para EmulatorJS (SNES, NES, PS1)
   */
  function buildEJSControls() {
    var current = getSavedControls();
    var p1 = {
      0: { value: current.b.key, value2: current.b.pad },
      1: { value: current.x.key, value2: current.x.pad },
      2: { value: current.select.key, value2: current.select.pad },
      3: { value: current.start.key, value2: current.start.pad },
      4: { value: current.up.key, value2: current.up.pad },
      5: { value: current.down.key, value2: current.down.pad },
      6: { value: current.left.key, value2: current.left.pad },
      7: { value: current.right.key, value2: current.right.pad },
      8: { value: current.a.key, value2: current.a.pad },
      9: { value: current.y.key, value2: current.y.pad },
      10: { value: current.l1.key, value2: current.l1.pad },
      11: { value: current.r1.key, value2: current.r1.pad },
      12: { value: 'tab', value2: 'LEFT_BOTTOM_SHOULDER' },
      13: { value: 'r', value2: 'RIGHT_BOTTOM_SHOULDER' },
      14: { value: '', value2: 'LEFT_STICK' },
      15: { value: '', value2: 'RIGHT_STICK' },
      // Analógicos: só pelo controle físico. Sem tecla no teclado para não
      // brigar com os botões Y (A) e X (S) que a criança usa no teclado.
      16: { value: '', value2: 'LEFT_STICK_X:+1' },
      17: { value: '', value2: 'LEFT_STICK_X:-1' },
      18: { value: '', value2: 'LEFT_STICK_Y:+1' },
      19: { value: '', value2: 'LEFT_STICK_Y:-1' },
      20: { value: '', value2: 'RIGHT_STICK_X:+1' },
      21: { value: '', value2: 'RIGHT_STICK_X:-1' },
      22: { value: '', value2: 'RIGHT_STICK_Y:+1' },
      23: { value: '', value2: 'RIGHT_STICK_Y:-1' },
      24: { value: '1' },
      25: { value: '2' },
      26: { value: '3' },
      27: { value: 'add' },
      28: { value: 'space' },
      29: { value: 'subtract' }
    };
    return { 0: p1, 1: {}, 2: {}, 3: {} };
  }

  // Exporta API global para todas as páginas e players
  window.ContinueControls = {
    DEFAULT_BINDINGS: DEFAULT_BINDINGS,
    getControls: getSavedControls,
    saveControls: saveControls,
    resetControls: resetControls,
    getTouchSettings: getTouchSettings,
    saveTouchSettings: saveTouchSettings,
    getEJSControls: buildEJSControls,
    getAnalogSettings: getAnalogSettings,
    saveAnalogSettings: saveAnalogSettings,
    stickToDirections: stickToDirections,
    openMapper: openControlMapperModal
  };
  window.openControlMapper = openControlMapperModal;

  // =========================================================================
  // UI: ESTILOS COMPARTILHADOS (MODAL DE CONTROLE + BARRA MOBILE FIXA)
  // =========================================================================
  function injectStyles() {
    if (document.getElementById('continue-mapper-styles')) return;
    var style = document.createElement('style');
    style.id = 'continue-mapper-styles';
    style.textContent = [
      '/* Botão de Controle no Topo */',
      '.btn-top-mapper {',
      '  display: inline-flex; align-items: center; gap: 7px;',
      '  padding: 8px 13px; border-radius: 8px;',
      '  border: 1px solid #3D3D3D; background: #222222; color: #FFFFFF;',
      '  font: 700 12px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer; transition: all 0.16s ease; white-space: nowrap;',
      '}',
      '.btn-top-mapper:hover {',
      '  background: #E60012; border-color: #E60012; color: #FFFFFF;',
      '}',
      '.btn-top-mapper .pad-dot {',
      '  width: 8px; height: 8px; border-radius: 50%; background: #9E9E9E;',
      '}',
      '.btn-top-mapper.connected .pad-dot {',
      '  background: #10B981; box-shadow: 0 0 8px #10B981;',
      '}',
      '',
      '/* Barra Fixa Inferior para Celular (Estilo App de Console) */',
      '.continue-mobile-bar {',
      '  display: none;',
      '  position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;',
      '  height: 66px;',
      '  background: rgba(17, 17, 17, 0.97);',
      '  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);',
      '  border-top: 2px solid #2A2A2A;',
      '  grid-template-columns: repeat(4, 1fr);',
      '  padding: 4px 6px env(safe-area-inset-bottom, 4px);',
      '  box-shadow: 0 -10px 30px rgba(0,0,0,0.8);',
      '}',
      '.continue-mobile-item {',
      '  display: flex; flex-direction: column; align-items: center; justify-content: center;',
      '  gap: 3px; border: 0; background: transparent; color: #9E9E9E;',
      '  text-decoration: none; font: 700 11px "Plus Jakarta Sans", sans-serif;',
      '  border-radius: 10px; padding: 4px 2px; cursor: pointer;',
      '  -webkit-tap-highlight-color: transparent;',
      '}',
      '.continue-mobile-item .m-ico { font-size: 19px; line-height: 1; }',
      '.continue-mobile-item.active {',
      '  color: #FFFFFF; background: #222222; border: 1px solid #3D3D3D;',
      '}',
      '.continue-mobile-item.mapper-cta {',
      '  color: #FFFFFF; background: rgba(230, 0, 18, 0.18); border: 1px solid rgba(230, 0, 18, 0.45);',
      '}',
      '@media (max-width: 860px) {',
      '  .continue-mobile-bar { display: grid; }',
      '  body.has-continue-mobile-bar { padding-bottom: 78px !important; }',
      '}',
      '',
      '/* Modal de Mapeamento de Controle */',
      '.cm-backdrop {',
      '  position: fixed; inset: 0; z-index: 9999;',
      '  background: rgba(0, 0, 0, 0.86);',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  display: none; align-items: center; justify-content: center;',
      '  padding: 14px; overflow-y: auto;',
      '}',
      '.cm-backdrop.open { display: flex; }',
      '.cm-modal {',
      '  width: 100%; max-width: 920px; max-height: 92vh;',
      '  background: #161616; color: #F5F5F5;',
      '  border: 2px solid #3D3D3D; border-top: 4px solid #E60012;',
      '  border-radius: 16px; overflow-y: auto;',
      '  box-shadow: 0 28px 80px rgba(0,0,0,0.92);',
      '  font-family: "Plus Jakarta Sans", sans-serif;',
      '}',
      '.cm-head {',
      '  padding: 18px 22px; background: #1E1E1E; border-bottom: 1px solid #2A2A2A;',
      '  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;',
      '  position: sticky; top: 0; z-index: 5;',
      '}',
      '.cm-title-wrap h2 {',
      '  margin: 0; font: 700 20px "Space Grotesk", sans-serif; color: #FFFFFF; letter-spacing: -0.4px;',
      '}',
      '.cm-title-wrap p {',
      '  margin: 4px 0 0; font-size: 13px; color: #9E9E9E;',
      '}',
      '.cm-close {',
      '  padding: 10px 16px; border-radius: 8px; border: 1px solid #3D3D3D;',
      '  background: #262626; color: #FFFFFF; font: 700 12px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer;',
      '}',
      '.cm-close:hover { background: #E60012; border-color: #E60012; }',
      '.cm-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 20px; }',
      '',
      '/* Barra de Status de Controle Conectado & Wizard */',
      '.cm-wizard-bar {',
      '  display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;',
      '  padding: 16px 18px; background: #1E1E1E; border: 1px solid #333333; border-radius: 12px;',
      '}',
      '.cm-pad-status {',
      '  display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600;',
      '}',
      '.cm-pad-badge {',
      '  padding: 5px 10px; border-radius: 6px; font: 700 11px "JetBrains Mono", monospace;',
      '  background: #262626; color: #9E9E9E; border: 1px solid #3D3D3D;',
      '}',
      '.cm-pad-badge.online {',
      '  background: rgba(16, 185, 129, 0.16); color: #34D399; border-color: rgba(16, 185, 129, 0.45);',
      '}',
      '.cm-wizard-actions { display: flex; gap: 10px; flex-wrap: wrap; }',
      '.cm-btn-primary {',
      '  padding: 13px 20px; border-radius: 10px; border: 0;',
      '  background: #E60012; color: #FFFFFF; font: 700 13.5px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer; transition: transform 0.15s, background 0.15s;',
      '}',
      '.cm-btn-primary:hover { background: #FF1A2B; transform: translateY(-1px); }',
      '.cm-btn-secondary {',
      '  padding: 12px 16px; border-radius: 10px; border: 1px solid #3D3D3D;',
      '  background: #242424; color: #F5F5F5; font: 600 12.5px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer;',
      '}',
      '.cm-btn-secondary:hover { border-color: #FFFFFF; color: #FFFFFF; }',
      '',
      '/* Prompt Gigante quando está escutando botão */',
      '.cm-listen-box {',
      '  display: none; padding: 20px; border-radius: 12px;',
      '  background: rgba(230, 0, 18, 0.14); border: 2px solid #E60012;',
      '  text-align: center; animation: cmPulse 1.2s infinite alternate;',
      '}',
      '.cm-listen-box.active { display: block; }',
      '@keyframes cmPulse {',
      '  from { box-shadow: 0 0 0 rgba(230,0,18,0); }',
      '  to { box-shadow: 0 0 24px rgba(230,0,18,0.45); }',
      '}',
      '.cm-listen-step { font: 700 12px "JetBrains Mono", monospace; color: #FF6B78; text-transform: uppercase; }',
      '.cm-listen-prompt { font: 700 22px "Space Grotesk", sans-serif; color: #FFFFFF; margin: 6px 0; }',
      '.cm-listen-sub { font-size: 13.5px; color: #D4D4D4; margin-bottom: 12px; }',
      '',
      '/* Grid Visual SVG + Lista de Botões */',
      '.cm-grid {',
      '  display: grid; grid-template-columns: 320px 1fr; gap: 18px; align-items: start;',
      '}',
      '.cm-svg-card {',
      '  background: #111111; border: 1px solid #2E2E2E; border-radius: 12px; padding: 16px;',
      '  text-align: center; position: sticky; top: 84px;',
      '}',
      '.cm-svg-card svg { width: 100%; max-width: 280px; height: auto; }',
      '.cm-svg-hint { font-size: 12px; color: #9E9E9E; margin-top: 8px; line-height: 1.45; }',
      '.svg-interactive { cursor: pointer; transition: fill 0.12s, stroke 0.12s; }',
      '.svg-interactive:hover { stroke: #FFFFFF !important; stroke-width: 2.5px !important; }',
      '.svg-interactive.active-listen { fill: #E60012 !important; stroke: #FFFFFF !important; }',
      '.svg-interactive.pressed-now { fill: #10B981 !important; stroke: #FFFFFF !important; }',
      '',
      '.cm-list {',
      '  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;',
      '}',
      '.cm-item {',
      '  background: #1E1E1E; border: 1px solid #2E2E2E; border-radius: 10px; padding: 12px;',
      '  display: flex; flex-direction: column; justify-content: space-between; gap: 8px;',
      '  transition: border-color 0.15s, background 0.15s;',
      '}',
      '.cm-item.listening {',
      '  border-color: #E60012; background: rgba(230, 0, 18, 0.12);',
      '}',
      '.cm-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; }',
      '.cm-item-name { font-weight: 700; font-size: 13.5px; color: #FFFFFF; }',
      '.cm-item-hint { font-size: 11.5px; color: #9E9E9E; margin-top: 2px; }',
      '.cm-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }',
      '.cm-key-pill {',
      '  font: 600 11px "JetBrains Mono", monospace; padding: 4px 8px; border-radius: 6px;',
      '  background: #111111; color: #FFFFFF; border: 1px solid #3D3D3D;',
      '}',
      '.cm-pad-pill {',
      '  font: 600 10.5px "JetBrains Mono", monospace; padding: 4px 8px; border-radius: 6px;',
      '  background: #252525; color: #D4D4D4; border: 1px solid #383838;',
      '}',
      '.cm-remap-btn {',
      '  padding: 8px 12px; border-radius: 7px; border: 1px solid #3D3D3D;',
      '  background: #282828; color: #FFFFFF; font: 700 11.5px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer; width: 100%; text-align: center;',
      '}',
      '.cm-remap-btn:hover { background: #E60012; border-color: #E60012; }',
      '',
      '/* Seção de Ajuste Touch para Celular */',
      '.cm-touch-card {',
      '  background: #1E1E1E; border: 1px solid #2E2E2E; border-radius: 12px; padding: 16px 18px;',
      '  display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;',
      '}',
      '.cm-touch-opts { display: flex; gap: 8px; flex-wrap: wrap; }',
      '.cm-opt-btn {',
      '  padding: 10px 14px; border-radius: 8px; border: 1px solid #3D3D3D;',
      '  background: #141414; color: #9E9E9E; font: 700 12px "Plus Jakarta Sans", sans-serif;',
      '  cursor: pointer;',
      '}',
      '.cm-opt-btn.active {',
      '  background: #FFFFFF; color: #111111; border-color: #FFFFFF;',
      '}',
      '',
      '/* Painel dos Analógicos */',
      '.cm-analog-card {',
      '  background: #1E1E1E; border: 1px solid #2E2E2E; border-radius: 12px; padding: 16px 18px;',
      '  display: grid; grid-template-columns: auto 1fr; gap: 18px; align-items: center;',
      '}',
      '.cm-sticks { display: flex; gap: 14px; }',
      '.cm-stick { text-align: center; }',
      '.cm-stick-ring {',
      '  position: relative; width: 78px; height: 78px; border-radius: 50%;',
      '  background: #141414; border: 2px solid #333333;',
      '}',
      '.cm-stick-dz {',
      '  position: absolute; left: 50%; top: 50%; border-radius: 50%;',
      '  border: 1px dashed #4A4A4A; transform: translate(-50%, -50%);',
      '}',
      '.cm-stick-dot {',
      '  position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; margin: -11px 0 0 -11px;',
      '  border-radius: 50%; background: #3D3D3D; border: 2px solid #5A5A5A;',
      '  transition: background .1s, border-color .1s;',
      '}',
      '.cm-stick-dot.live { background: #22C55E; border-color: #86EFAC; }',
      '.cm-stick-label { font: 700 10.5px "JetBrains Mono", monospace; color: #9E9E9E; margin-top: 6px; }',
      '.cm-analog-rows { display: grid; gap: 12px; }',
      '.cm-analog-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }',
      '.cm-analog-title { font-weight: 700; font-size: 14px; color: #FFFFFF; }',
      '.cm-analog-sub { font-size: 12px; color: #9E9E9E; margin-top: 2px; }',
      '@media (max-width: 780px) {',
      '  .cm-analog-card { grid-template-columns: 1fr; justify-items: center; }',
      '  .cm-analog-rows { width: 100%; }',
      '}',
      '@media (max-width: 780px) {',
      '  .cm-grid { grid-template-columns: 1fr; }',
      '  .cm-svg-card { position: static; }',
      '  .cm-list { grid-template-columns: 1fr; }',
      '  .cm-btn-primary, .cm-btn-secondary { width: 100%; justify-content: center; text-align: center; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // =========================================================================
  // MODAL INTERATIVO DE CONFIGURAÇÃO DE CONTROLE E TECLADO
  // =========================================================================
  var modalEl = null;
  var listeningTargetId = null;
  var wizardQueue = [];
  var wizardIndex = 0;
  var pollRafId = null;
  var prevPadButtons = {};

  function ensureModalDOM() {
    injectStyles();
    if (modalEl) return modalEl;

    var backdrop = document.createElement('div');
    backdrop.className = 'cm-backdrop';
    backdrop.id = 'continue-control-modal';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Configurar Controle e Botões');

    backdrop.innerHTML = [
      '<div class="cm-modal">',
      '  <div class="cm-head">',
      '    <div class="cm-title-wrap">',
      '      <h2>🕹️ Configurar Controle, Teclado e Celular</h2>',
      '      <p>Deixe os botões do seu jeito! Funciona com qualquer controle USB, Bluetooth, teclado ou tela de celular.</p>',
      '    </div>',
      '    <button type="button" class="cm-close" id="cm-close-btn">✕ Fechar (Pronto)</button>',
      '  </div>',
      '  <div class="cm-body">',
      '    <!-- Status e Botão Passo a Passo -->',
      '    <div class="cm-wizard-bar">',
      '      <div class="cm-pad-status">',
      '        <span>Controle USB / Bluetooth:</span>',
      '        <span class="cm-pad-badge" id="cm-pad-status-badge">Nenhum detectado (Aperte um botão no controle)</span>',
      '      </div>',
      '      <div class="cm-wizard-actions">',
      '        <button type="button" class="cm-btn-primary" id="cm-start-wizard">🎯 Configurar Passo a Passo (1 Clique)</button>',
      '        <button type="button" class="cm-btn-secondary" id="cm-reset-defaults">🔄 Voltar ao Padrão</button>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Caixa de Escuta Passo a Passo -->',
      '    <div class="cm-listen-box" id="cm-listen-box">',
      '      <div class="cm-listen-step" id="cm-listen-step">PASSO 1 DE 12</div>',
      '      <div class="cm-listen-prompt" id="cm-listen-prompt">Aperte o botão para CIMA ⬆️</div>',
      '      <div class="cm-listen-sub" id="cm-listen-sub">Pode apertar no seu Controle USB/Bluetooth ou no Teclado!</div>',
      '      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">',
      '        <button type="button" class="cm-btn-secondary" id="cm-skip-step">Pular este botão ⏭️</button>',
      '        <button type="button" class="cm-btn-secondary" id="cm-cancel-listen">Cancelar</button>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Opções para Tela de Celular (Touch) -->',
      '    <div class="cm-touch-card">',
      '      <div>',
      '        <div style="font-weight:700;font-size:14.5px;color:#FFFFFF">📱 Tamanho dos Botões na Tela do Celular</div>',
      '        <div style="font-size:12.5px;color:#9E9E9E;margin-top:2px">Botões grandes facilitam para crianças jogarem sem errar o toque na tela.</div>',
      '      </div>',
      '      <div class="cm-touch-opts">',
      '        <button type="button" class="cm-opt-btn" data-touch-size="large">🖐️ Botões Grandes (Recomendado)</button>',
      '        <button type="button" class="cm-opt-btn" data-touch-size="normal">📱 Tamanho Normal</button>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Analógicos (sticks) -->',
      '    <div class="cm-analog-card">',
      '      <div class="cm-sticks">',
      '        <div class="cm-stick">',
      '          <div class="cm-stick-ring"><div class="cm-stick-dz" id="cm-dz-l"></div><div class="cm-stick-dot" id="cm-stick-l"></div></div>',
      '          <div class="cm-stick-label">ESQUERDO</div>',
      '        </div>',
      '        <div class="cm-stick">',
      '          <div class="cm-stick-ring"><div class="cm-stick-dz" id="cm-dz-r"></div><div class="cm-stick-dot" id="cm-stick-r"></div></div>',
      '          <div class="cm-stick-label">DIREITO</div>',
      '        </div>',
      '      </div>',
      '      <div class="cm-analog-rows">',
      '        <div class="cm-analog-row">',
      '          <div>',
      '            <div class="cm-analog-title">🕹️ Analógico anda igual às setinhas</div>',
      '            <div class="cm-analog-sub">Assim o analógico funciona até nos jogos de Super Nintendo e nos de PS1 sem analógico.</div>',
      '          </div>',
      '          <div class="cm-touch-opts">',
      '            <button type="button" class="cm-opt-btn" data-analog-dpad="on">✅ Ligado</button>',
      '            <button type="button" class="cm-opt-btn" data-analog-dpad="off">Desligado</button>',
      '          </div>',
      '        </div>',
      '        <div class="cm-analog-row">',
      '          <div>',
      '            <div class="cm-analog-title">🎚️ Sensibilidade do analógico</div>',
      '            <div class="cm-analog-sub">O boneco anda sozinho? Escolha <b>Firme</b>. O círculo tracejado mostra quanto precisa mexer.</div>',
      '          </div>',
      '          <div class="cm-touch-opts">',
      '            <button type="button" class="cm-opt-btn" data-analog-preset="sensivel">Sensível</button>',
      '            <button type="button" class="cm-opt-btn" data-analog-preset="normal">Normal</button>',
      '            <button type="button" class="cm-opt-btn" data-analog-preset="firme">Firme (controle velho)</button>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '',
      '    <!-- Desenho Interativo do Controle + Lista de Botões -->',
      '    <div class="cm-grid">',
      '      <div class="cm-svg-card">',
      '        <div style="font:700 11px \'JetBrains Mono\',monospace;color:#E60012;text-transform:uppercase;margin-bottom:8px">// TESTE SEU CONTROLE AO VIVO</div>',
      '        <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">',
      '          <!-- Ombros L e R -->',
      '          <rect id="svg-btn-l" class="svg-interactive" data-bind-id="l1" x="38" y="14" width="66" height="22" rx="8" fill="#262626" stroke="#4A4A4A" stroke-width="2"/>',
      '          <text x="71" y="29" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">L1</text>',
      '          <rect id="svg-btn-r" class="svg-interactive" data-bind-id="r1" x="216" y="14" width="66" height="22" rx="8" fill="#262626" stroke="#4A4A4A" stroke-width="2"/>',
      '          <text x="249" y="29" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">R1</text>',
      '          <!-- Corpo do Controle -->',
      '          <rect x="20" y="32" width="280" height="142" rx="68" fill="#1B1B1B" stroke="#3D3D3D" stroke-width="3"/>',
      '          <circle cx="85" cy="104" r="46" fill="#141414" stroke="#292929" stroke-width="2"/>',
      '          <circle cx="235" cy="104" r="46" fill="#141414" stroke="#292929" stroke-width="2"/>',
      '          <!-- D-Pad -->',
      '          <rect id="svg-btn-up" class="svg-interactive" data-bind-id="up" x="73" y="66" width="24" height="26" rx="4" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="85" y="83" text-anchor="middle" fill="#FFFFFF" font-size="11" pointer-events="none">▲</text>',
      '          <rect id="svg-btn-down" class="svg-interactive" data-bind-id="down" x="73" y="116" width="24" height="26" rx="4" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="85" y="133" text-anchor="middle" fill="#FFFFFF" font-size="11" pointer-events="none">▼</text>',
      '          <rect id="svg-btn-left" class="svg-interactive" data-bind-id="left" x="47" y="92" width="26" height="24" rx="4" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="60" y="108" text-anchor="middle" fill="#FFFFFF" font-size="11" pointer-events="none">◀</text>',
      '          <rect id="svg-btn-right" class="svg-interactive" data-bind-id="right" x="97" y="92" width="26" height="24" rx="4" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="110" y="108" text-anchor="middle" fill="#FFFFFF" font-size="11" pointer-events="none">▶</text>',
      '          <!-- Select & Start -->',
      '          <rect id="svg-btn-select" class="svg-interactive" data-bind-id="select" x="128" y="110" width="28" height="12" rx="6" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="142" y="134" text-anchor="middle" fill="#9E9E9E" font-family="JetBrains Mono,monospace" font-size="8" pointer-events="none">SELECT</text>',
      '          <rect id="svg-btn-start" class="svg-interactive" data-bind-id="start" x="164" y="110" width="28" height="12" rx="6" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="1.5"/>',
      '          <text x="178" y="134" text-anchor="middle" fill="#9E9E9E" font-family="JetBrains Mono,monospace" font-size="8" pointer-events="none">START</text>',
      '          <!-- Botões X, Y, A, B -->',
      '          <circle id="svg-btn-x" class="svg-interactive" data-bind-id="x" cx="235" cy="74" r="13" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="2"/>',
      '          <text x="235" y="78" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">X</text>',
      '          <circle id="svg-btn-y" class="svg-interactive" data-bind-id="y" cx="205" cy="104" r="13" fill="#2A2A2A" stroke="#4A4A4A" stroke-width="2"/>',
      '          <text x="205" y="108" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">Y</text>',
      '          <circle id="svg-btn-a" class="svg-interactive" data-bind-id="a" cx="265" cy="104" r="13" fill="#E60012" stroke="#FF4D5A" stroke-width="2"/>',
      '          <text x="265" y="108" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">A</text>',
      '          <circle id="svg-btn-b" class="svg-interactive" data-bind-id="b" cx="235" cy="134" r="13" fill="#E60012" stroke="#FF4D5A" stroke-width="2"/>',
      '          <text x="235" y="138" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono,monospace" font-weight="700" font-size="11" pointer-events="none">B</text>',
      '        </svg>',
      '        <div class="cm-svg-hint">💡 <b>Dica:</b> Clique em qualquer botão do desenho acima para mudar, ou aperte os botões do seu controle/teclado para vê-los acender em verde!</div>',
      '      </div>',
      '      <div class="cm-list" id="cm-bindings-list"></div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(backdrop);
    modalEl = backdrop;

    // Eventos do modal
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeControlMapperModal();
    });
    document.getElementById('cm-close-btn').addEventListener('click', closeControlMapperModal);

    document.getElementById('cm-start-wizard').addEventListener('click', function () {
      wizardQueue = DEFAULT_BINDINGS.map(function (b) { return b.id; });
      wizardIndex = 0;
      startListeningFor(wizardQueue[0], true);
    });

    document.getElementById('cm-reset-defaults').addEventListener('click', function () {
      stopListening();
      resetControls();
      renderModalBindings();
    });

    document.getElementById('cm-skip-step').addEventListener('click', function () {
      advanceWizard();
    });

    document.getElementById('cm-cancel-listen').addEventListener('click', function () {
      stopListening();
      renderModalBindings();
    });

    backdrop.addEventListener('click', function (e) {
      var remapBtn = e.target.closest('[data-bind-id]');
      if (remapBtn) {
        var bindId = remapBtn.getAttribute('data-bind-id');
        wizardQueue = [];
        startListeningFor(bindId, false);
        return;
      }
      var touchBtn = e.target.closest('[data-touch-size]');
      if (touchBtn) {
        var size = touchBtn.getAttribute('data-touch-size');
        var ts = getTouchSettings();
        ts.size = size;
        saveTouchSettings(ts);
        renderTouchOptions();
        return;
      }
      var dpadBtn = e.target.closest('[data-analog-dpad]');
      if (dpadBtn) {
        var as1 = getAnalogSettings();
        as1.stickAsDpad = dpadBtn.getAttribute('data-analog-dpad') === 'on';
        saveAnalogSettings(as1);
        renderAnalogOptions();
        return;
      }
      var presetBtn = e.target.closest('[data-analog-preset]');
      if (presetBtn) {
        var as2 = getAnalogSettings();
        as2.preset = presetBtn.getAttribute('data-analog-preset');
        saveAnalogSettings(as2);
        renderAnalogOptions();
      }
    });

    return modalEl;
  }

  function renderAnalogOptions() {
    if (!modalEl) return;
    var as = getAnalogSettings();
    var dp = modalEl.querySelectorAll('[data-analog-dpad]');
    for (var i = 0; i < dp.length; i++) {
      dp[i].classList.toggle('active', (dp[i].getAttribute('data-analog-dpad') === 'on') === as.stickAsDpad);
    }
    var pr = modalEl.querySelectorAll('[data-analog-preset]');
    for (var j = 0; j < pr.length; j++) {
      pr[j].classList.toggle('active', pr[j].getAttribute('data-analog-preset') === as.preset);
    }
    // Desenha a zona morta dentro do círculo (anel de 78px, curso útil de 28px)
    var dzSize = Math.round(as.deadzone * 56 + 22) + 'px';
    ['cm-dz-l', 'cm-dz-r'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.style.width = dzSize; el.style.height = dzSize; }
    });
  }

  function updateStickVisual(dotId, x, y, deadzone) {
    var dot = document.getElementById(dotId);
    if (!dot) return;
    var mag = Math.sqrt(x * x + y * y);
    var k = mag > 1 ? 1 / mag : 1; // mantém o ponto dentro do círculo
    dot.style.transform = 'translate(' + (x * k * 28).toFixed(1) + 'px,' + (y * k * 28).toFixed(1) + 'px)';
    dot.classList.toggle('live', mag >= deadzone);
  }

  function renderTouchOptions() {
    if (!modalEl) return;
    var ts = getTouchSettings();
    var btns = modalEl.querySelectorAll('[data-touch-size]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-touch-size') === ts.size);
    }
  }

  function renderModalBindings() {
    if (!modalEl) return;
    var current = getSavedControls();
    var listEl = document.getElementById('cm-bindings-list');

    // Atualiza destaque no SVG
    var svgBtns = modalEl.querySelectorAll('.svg-interactive');
    for (var s = 0; s < svgBtns.length; s++) {
      svgBtns[s].classList.toggle('active-listen', svgBtns[s].getAttribute('data-bind-id') === listeningTargetId);
    }

    listEl.innerHTML = DEFAULT_BINDINGS.map(function (b) {
      var item = current[b.id];
      var isListening = listeningTargetId === b.id;
      return [
        '<div class="cm-item ' + (isListening ? 'listening' : '') + '">',
        '  <div class="cm-item-top">',
        '    <div>',
        '      <div class="cm-item-name">' + item.label + '</div>',
        '      <div class="cm-item-hint">' + item.kidHint + '</div>',
        '    </div>',
        '  </div>',
        '  <div class="cm-badges">',
        '    <span class="cm-key-pill">⌨️ ' + item.keyDisplay + '</span>',
        '    <span class="cm-pad-pill">🕹️ ' + item.padDisplay + '</span>',
        '  </div>',
        '  <button type="button" class="cm-remap-btn" data-bind-id="' + b.id + '">',
        isListening ? '🔴 Aperte uma tecla ou botão agora…' : 'Mudar este botão',
        '  </button>',
        '</div>'
      ].join('\n');
    }).join('\n');
  }

  function startListeningFor(bindId, isWizard) {
    listeningTargetId = bindId;
    var current = getSavedControls();
    var target = current[bindId];
    if (!target) return;

    var box = document.getElementById('cm-listen-box');
    var stepEl = document.getElementById('cm-listen-step');
    var promptEl = document.getElementById('cm-listen-prompt');
    var subEl = document.getElementById('cm-listen-sub');
    var skipBtn = document.getElementById('cm-skip-step');

    box.classList.add('active');
    if (isWizard && wizardQueue.length) {
      stepEl.textContent = 'PASSO ' + (wizardIndex + 1) + ' DE ' + wizardQueue.length;
      skipBtn.style.display = 'inline-block';
    } else {
      stepEl.textContent = ' MUDANDO BOTÃO INDIVIDUAL';
      skipBtn.style.display = 'none';
    }
    promptEl.textContent = 'Aperte o botão para: ' + target.label;
    subEl.textContent = target.kidHint + ' — Aperte no seu Controle ou Teclado!';
    renderModalBindings();
  }

  function stopListening() {
    listeningTargetId = null;
    wizardQueue = [];
    wizardIndex = 0;
    var box = document.getElementById('cm-listen-box');
    if (box) box.classList.remove('active');
  }

  function advanceWizard() {
    if (wizardQueue.length && wizardIndex + 1 < wizardQueue.length) {
      wizardIndex++;
      startListeningFor(wizardQueue[wizardIndex], true);
    } else {
      stopListening();
      renderModalBindings();
    }
  }

  function applyBindingFromKeyboard(e) {
    if (!listeningTargetId) return;
    if (e.key === 'Escape') {
      stopListening();
      renderModalBindings();
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    var norm = normalizeKeyboardEventToEJS(e);
    var current = getSavedControls();
    if (current[listeningTargetId]) {
      current[listeningTargetId].key = norm.ejsKey;
      current[listeningTargetId].code = norm.code;
      current[listeningTargetId].keyDisplay = norm.display;
      saveControls(current);
    }
    advanceWizard();
  }

  function applyBindingFromGamepad(buttonIndex, customAxisEjs, customAxisLabel) {
    if (!listeningTargetId) return;
    var current = getSavedControls();
    if (current[listeningTargetId]) {
      if (customAxisEjs) {
        current[listeningTargetId].pad = customAxisEjs;
        current[listeningTargetId].padDisplay = customAxisLabel;
      } else {
        var info = GAMEPAD_INDEX_TO_EJS[buttonIndex] || {
          ejs: 'BUTTON_' + (buttonIndex + 1),
          label: 'Botão #' + (buttonIndex + 1)
        };
        current[listeningTargetId].pad = info.ejs;
        current[listeningTargetId].padIndex = buttonIndex;
        current[listeningTargetId].padDisplay = info.label;
      }
      saveControls(current);
    }
    advanceWizard();
  }

  function onModalKeyDown(e) {
    if (!modalEl || !modalEl.classList.contains('open')) return;
    if (listeningTargetId) {
      applyBindingFromKeyboard(e);
      return;
    }
    if (e.key === 'Escape') {
      closeControlMapperModal();
      return;
    }
    // Destaca no SVG se o usuário apertar uma tecla mapeada para testar
    var norm = normalizeKeyboardEventToEJS(e);
    var current = getSavedControls();
    Object.keys(current).forEach(function (k) {
      if (current[k].key === norm.ejsKey) {
        var svgNode = document.getElementById(current[k].svgId);
        if (svgNode) {
          svgNode.classList.add('pressed-now');
          setTimeout(function () { svgNode.classList.remove('pressed-now'); }, 220);
        }
      }
    });
  }

  function pollGamepadsInModal() {
    if (!modalEl || !modalEl.classList.contains('open')) return;
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var activePad = null;
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        activePad = pads[i];
        break;
      }
    }

    var badge = document.getElementById('cm-pad-status-badge');
    if (badge) {
      if (activePad) {
        badge.className = 'cm-pad-badge online';
        badge.textContent = '✓ Conectado: ' + String(activePad.id).slice(0, 34);
      } else {
        badge.className = 'cm-pad-badge';
        badge.textContent = 'Nenhum detectado (Aperte um botão no controle)';
      }
    }

    if (activePad) {
      var current = getSavedControls();
      for (var b = 0; b < activePad.buttons.length; b++) {
        var pressed = activePad.buttons[b] && activePad.buttons[b].pressed;
        var wasPressed = !!prevPadButtons['b_' + b];
        if (pressed && !wasPressed) {
          if (listeningTargetId) {
            prevPadButtons['b_' + b] = true;
            applyBindingFromGamepad(b);
            break;
          } else {
            // Acende o SVG correspondente para a criança testar
            Object.keys(current).forEach(function (k) {
              if (current[k].padIndex === b) {
                var svgNode = document.getElementById(current[k].svgId);
                if (svgNode) {
                  svgNode.classList.add('pressed-now');
                  setTimeout(function () { svgNode.classList.remove('pressed-now'); }, 220);
                }
              }
            });
          }
        }
        prevPadButtons['b_' + b] = pressed;
      }

      // Analógicos: visualizador ao vivo + detecção no Passo a Passo
      if (activePad.axes && activePad.axes.length >= 2) {
        var as = getAnalogSettings();
        var ax0 = activePad.axes[0] || 0;
        var ax1 = activePad.axes[1] || 0;
        var ax2 = activePad.axes.length >= 4 ? (activePad.axes[2] || 0) : 0;
        var ax3 = activePad.axes.length >= 4 ? (activePad.axes[3] || 0) : 0;
        updateStickVisual('cm-stick-l', ax0, ax1, as.deadzone);
        updateStickVisual('cm-stick-r', ax2, ax3, as.deadzone);

        var axisRight = ax0 > 0.65;
        var axisLeft = ax0 < -0.65;
        var axisDown = ax1 > 0.65;
        var axisUp = ax1 < -0.65;

        if (listeningTargetId) {
          if (axisUp && !prevPadButtons.ax_up) applyBindingFromGamepad(12, 'DPAD_UP', 'Analógico / Cima ⬆️');
          else if (axisDown && !prevPadButtons.ax_down) applyBindingFromGamepad(13, 'DPAD_DOWN', 'Analógico / Baixo ⬇️');
          else if (axisLeft && !prevPadButtons.ax_left) applyBindingFromGamepad(14, 'DPAD_LEFT', 'Analógico / Esquerda ⬅️');
          else if (axisRight && !prevPadButtons.ax_right) applyBindingFromGamepad(15, 'DPAD_RIGHT', 'Analógico / Direita ➡️');
        } else {
          // Modo teste: o analógico acende as setinhas do desenho (igual vai acontecer no jogo)
          var dirs = stickToDirections(ax0, ax1, as.deadzone);
          var svgMap = { up: 'svg-btn-up', down: 'svg-btn-down', left: 'svg-btn-left', right: 'svg-btn-right' };
          Object.keys(svgMap).forEach(function (d) {
            var node = document.getElementById(svgMap[d]);
            if (node) node.classList.toggle('pressed-now', dirs[d] && as.stickAsDpad);
          });
        }
        prevPadButtons.ax_up = axisUp;
        prevPadButtons.ax_down = axisDown;
        prevPadButtons.ax_left = axisLeft;
        prevPadButtons.ax_right = axisRight;
      }
    }

    pollRafId = requestAnimationFrame(pollGamepadsInModal);
  }

  function openControlMapperModal() {
    ensureModalDOM();
    stopListening();
    renderTouchOptions();
    renderAnalogOptions();
    renderModalBindings();
    modalEl.classList.add('open');
    window.addEventListener('keydown', onModalKeyDown, true);
    if (pollRafId) cancelAnimationFrame(pollRafId);
    pollRafId = requestAnimationFrame(pollGamepadsInModal);
  }

  function closeControlMapperModal() {
    if (!modalEl) return;
    stopListening();
    modalEl.classList.remove('open');
    window.removeEventListener('keydown', onModalKeyDown, true);
    if (pollRafId) {
      cancelAnimationFrame(pollRafId);
      pollRafId = null;
    }
  }

  // =========================================================================
  // BARRA INFERIOR MOBILE & BOTÃO NO TOPO (PÁGINAS PRINCIPAIS)
  // =========================================================================
  function injectMobileNavAndTopButton() {
    // Não injeta a barra inferior dentro dos iframes de emulador (player.html, snes-player.html, ps1-player.html)
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('player.html') !== -1) return;

    injectStyles();

    // Alerta caso esteja abrindo pelo Simple Browser do VS Code
    if (/Electron|Code\//i.test(navigator.userAgent) && !document.getElementById('vscode-warning-bar')) {
      var warn = document.createElement('div');
      warn.id = 'vscode-warning-bar';
      warn.style.cssText = 'background:#991b1b;color:#ffffff;font:700 13px system-ui,sans-serif;padding:10px 16px;text-align:center;position:sticky;top:0;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;gap:10px;';
      warn.innerHTML = '<span>⚠️ <b>Atenção:</b> O navegador embutido do VS Code bloqueia WebGL e áudio. Para jogar, abra no <b>Google Chrome</b> ou no <b>Celular</b>: <code style="background:#000;color:#00e5ff;padding:2px 6px;border-radius:4px">http://localhost:4175</code></span>';
      document.body.prepend(warn);
    }

    // 1. Injeta Barra Fixa Inferior para Celular
    if (!document.getElementById('continue-mobile-bar')) {
      document.body.classList.add('has-continue-mobile-bar');
      var isSnes = path.indexOf('snes.html') !== -1;
      var isPs1 = path.indexOf('ps1.html') !== -1;
      var isHome = !isSnes && !isPs1;

      var bar = document.createElement('nav');
      bar.id = 'continue-mobile-bar';
      bar.className = 'continue-mobile-bar';
      bar.setAttribute('aria-label', 'Menu Rápido para Celular');
      bar.innerHTML = [
        '<a class="continue-mobile-item ' + (isHome ? 'active' : '') + '" href="index.html">',
        '  <span class="m-ico">🏠</span><span>Início</span>',
        '</a>',
        '<a class="continue-mobile-item ' + (isSnes ? 'active' : '') + '" href="snes.html">',
        '  <span class="m-ico">🎮</span><span>SNES (608)</span>',
        '</a>',
        '<a class="continue-mobile-item ' + (isPs1 ? 'active' : '') + '" href="ps1.html">',
        '  <span class="m-ico">💿</span><span>PS1 (12)</span>',
        '</a>',
        '<button type="button" class="continue-mobile-item mapper-cta" id="mobile-open-mapper">',
        '  <span class="m-ico">🕹️</span><span>Controle</span>',
        '</button>'
      ].join('\n');
      document.body.appendChild(bar);

      var mobileMapperBtn = document.getElementById('mobile-open-mapper');
      if (mobileMapperBtn) {
        mobileMapperBtn.addEventListener('click', openControlMapperModal);
      }
    }

    // 2. Liga todos os botões [data-open-mapper] existentes na página
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-mapper]');
      if (trigger) {
        e.preventDefault();
        openControlMapperModal();
      }
    });

    // 3. Atualiza indicador quando um controle USB/Bluetooth é conectado
    function updateTopGamepadIndicator() {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      var hasPad = false;
      for (var i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) { hasPad = true; break; }
      }
      var btns = document.querySelectorAll('.btn-top-mapper');
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.toggle('connected', hasPad);
      }
    }
    window.addEventListener('gamepadconnected', updateTopGamepadIndicator);
    window.addEventListener('gamepaddisconnected', updateTopGamepadIndicator);
  }

  // =========================================================================
  // PONTE ANALÓGICO → SETINHAS (roda só dentro dos players de emulador)
  // SNES e NES não têm analógico, e muitos jogos de PS1 (ex.: Castlevania)
  // só aceitam o D-Pad. Esta ponte lê o analógico esquerdo e aperta as
  // setinhas do emulador, respeitando a zona morta escolhida pela criança.
  // =========================================================================
  var KEYCODES = { 'up arrow': 38, 'down arrow': 40, 'left arrow': 37, 'right arrow': 39, 'enter': 13, 'space': 32, 'tab': 9 };

  function sendDirectionToEmulator(dirId, ejsIndex, pressed) {
    var emu = window.EJS_emulator;
    var gm = emu && emu.gameManager;
    if (gm && typeof gm.simulateInput === 'function') {
      gm.simulateInput(0, ejsIndex, pressed ? 1 : 0);
      return;
    }
    // Plano B: simula a tecla configurada para essa direção
    var binding = getSavedControls()[dirId];
    if (!binding || !binding.key) return;
    var code = KEYCODES[binding.key] || String(binding.key).toUpperCase().charCodeAt(0);
    var ev = new KeyboardEvent(pressed ? 'keydown' : 'keyup', { bubbles: true, cancelable: true, key: binding.key, code: binding.code });
    try {
      Object.defineProperty(ev, 'keyCode', { get: function () { return code; } });
      Object.defineProperty(ev, 'which', { get: function () { return code; } });
    } catch (e) {}
    var target = document.querySelector('#game canvas') || document.querySelector('#game') || document;
    target.dispatchEvent(ev);
  }

  function startAnalogBridge() {
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('player.html') === -1) return;

    var DIRS = [
      { id: 'up', ejs: 4 },
      { id: 'down', ejs: 5 },
      { id: 'left', ejs: 6 },
      { id: 'right', ejs: 7 }
    ];
    var held = { up: false, down: false, left: false, right: false };
    var settings = getAnalogSettings();
    window.addEventListener('continue:analog-updated', function (e) { settings = e.detail || getAnalogSettings(); });
    window.addEventListener('storage', function (e) { if (e.key === STORAGE_KEY_ANALOG) settings = getAnalogSettings(); });

    function releaseAll() {
      DIRS.forEach(function (d) {
        if (held[d.id]) { sendDirectionToEmulator(d.id, d.ejs, false); held[d.id] = false; }
      });
    }
    window.addEventListener('gamepaddisconnected', releaseAll);
    window.addEventListener('blur', releaseAll);

    function tick() {
      var modalOpen = modalEl && modalEl.classList.contains('open');
      var pad = getFirstPad();
      var emu = window.EJS_emulator;
      var gameRunning = !!(emu && (emu.started || emu.gameManager));
      if (!pad || !settings.stickAsDpad || modalOpen || !gameRunning || !pad.axes || pad.axes.length < 2) {
        releaseAll();
      } else {
        var dirs = stickToDirections(pad.axes[0] || 0, pad.axes[1] || 0, settings.deadzone);
        for (var i = 0; i < DIRS.length; i++) {
          var d = DIRS[i];
          if (dirs[d.id] !== held[d.id]) {
            held[d.id] = dirs[d.id];
            sendDirectionToEmulator(d.id, d.ejs, dirs[d.id]);
          }
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  startAnalogBridge();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMobileNavAndTopButton);
  } else {
    injectMobileNavAndTopButton();
  }
})();
