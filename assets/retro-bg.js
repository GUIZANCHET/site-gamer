/**
 * Continue? — Fundo Animado Retrô (Wireframe Terrain + Sol Sintetizador + Brasas em Pixel)
 * Estilo arcade dos anos 80 (OutRun / Synthwave).
 * Otimizado com Canvas 2D ultra-leve para não travar celulares fracos.
 * Pausa automaticamente durante partidas ou quando a aba estiver em segundo plano.
 */
(function() {
  'use strict';

  var STORAGE_KEY_BG = 'continue_retro_bg_v1';
  var enabled = true;
  try {
    var saved = localStorage.getItem(STORAGE_KEY_BG);
    if (saved !== null) enabled = saved !== 'false';
  } catch (e) {}

  var canvas, ctx;
  var width = 0, height = 0;
  var animId = null;
  var offsetZ = 0;
  var speed = 0.035;

  // Partículas de brasas / pixels de fogo flutuando suavemente
  var particles = [];
  var MAX_PARTICLES = 40;

  function initParticles() {
    particles = [];
    for (var i = 0; i < MAX_PARTICLES; i++) {
      particles.push(createParticle(true));
    }
  }

  function createParticle(randomY) {
    var horizonY = height * 0.44;
    return {
      x: width * 0.5 + (Math.random() - 0.5) * Math.min(width * 0.8, 600),
      y: randomY ? horizonY + Math.random() * (height - horizonY) : height + 10,
      size: Math.random() < 0.6 ? 2 : Math.random() < 0.85 ? 3 : 4, // pixels quadrados
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.5 + Math.random() * 1.2),
      alpha: 0.3 + Math.random() * 0.7,
      decay: 0.003 + Math.random() * 0.006,
      color: Math.random() < 0.4 ? '#ff3c00' : Math.random() < 0.75 ? '#ff8400' : '#ffd000'
    };
  }

  function getElevation(gx, gz) {
    var distCenter = Math.abs(gx);
    if (distCenter < 2.8) return 0; // pista/vale central
    var factor = Math.pow((distCenter - 2.8) / 5.2, 1.4);
    var wave = Math.sin(gx * 0.85 + gz * 0.45) * 0.65 + Math.cos(gx * 1.5 - gz * 0.6) * 0.35;
    return Math.max(0, (wave + 1) * 1.55 * factor);
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function isEmulatorActive() {
    // Pausa se o emulador estiver rodando para garantir 100% de FPS nos jogos
    var snesPlayer = document.getElementById('player');
    if (snesPlayer && snesPlayer.classList.contains('open')) return true;
    var modal = document.getElementById('modal');
    if (modal && modal.classList.contains('open')) return true;
    return false;
  }

  function loop() {
    if (!enabled || document.hidden || isEmulatorActive()) {
      animId = null;
      return;
    }

    render();
    animId = requestAnimationFrame(loop);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    var horizonY = height * 0.42;
    var centerX = width * 0.5;
    var fov = height * 0.68;
    var cameraY = -2.3;

    // --- 1. O SOL RETRÔ DOS ANOS 80 (OutRun / Synthwave) ---
    var sunRadius = Math.min(width, height) * 0.22;
    sunRadius = Math.max(80, Math.min(190, sunRadius));
    var sunY = horizonY - sunRadius * 0.28;

    // Brilho do sol
    var glow = ctx.createRadialGradient(centerX, sunY, sunRadius * 0.2, centerX, sunY, sunRadius * 1.7);
    glow.addColorStop(0, 'rgba(255, 60, 0, 0.38)');
    glow.addColorStop(0.5, 'rgba(230, 0, 18, 0.14)');
    glow.addColorStop(1, 'rgba(17, 17, 17, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, sunY, sunRadius * 1.7, 0, Math.PI * 2);
    ctx.fill();

    // Círculo do sol cortado
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.clip();

    var sunGrad = ctx.createLinearGradient(centerX, sunY - sunRadius, centerX, sunY + sunRadius);
    sunGrad.addColorStop(0, '#ffa800');
    sunGrad.addColorStop(0.35, '#ff3c00');
    sunGrad.addColorStop(0.85, '#e60012');
    sunGrad.addColorStop(1, '#660008');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(centerX - sunRadius, sunY - sunRadius, sunRadius * 2, sunRadius * 2);

    // Listras horizontais do sol clássico (ficam mais largas na parte de baixo)
    var numSlices = 7;
    for (var i = 0; i < numSlices; i++) {
      var sliceY = sunY + (i / numSlices) * sunRadius;
      var sliceH = 2 + (i * 1.8);
      ctx.fillStyle = '#111111';
      ctx.fillRect(centerX - sunRadius, sliceY, sunRadius * 2, sliceH);
    }
    ctx.restore();

    // --- 2. TERRENO DE ARAME 3D (Wireframe Grid) ---
    offsetZ = (offsetZ + speed) % 1;

    var cols = 24;
    var rows = 18;
    var xRange = 18;

    var points = [];
    for (var r = 0; r <= rows; r++) {
      points[r] = [];
      var z = (rows - r + offsetZ);
      var scale = fov / z;

      for (var c = 0; c <= cols; c++) {
        var gx = (c - cols / 2) * (xRange / cols);
        var elevation = getElevation(gx, z);
        var y = cameraY + elevation;

        var screenX = centerX + gx * scale;
        var screenY = horizonY - y * scale;
        var alpha = Math.min(1, Math.max(0, (rows - r) / (rows * 0.8)));

        points[r][c] = { x: screenX, y: screenY, alpha: alpha };
      }
    }

    ctx.lineWidth = 1.1;

    // Linhas horizontais (transversais)
    for (var hr = 0; hr <= rows; hr++) {
      ctx.beginPath();
      var started = false;
      var hAlpha = Math.max(0, Math.min(1, (rows - hr) / rows));
      ctx.strokeStyle = 'rgba(230, 0, 18, ' + (hAlpha * 0.65).toFixed(3) + ')';

      for (var hc = 0; hc <= cols; hc++) {
        var hp = points[hr][hc];
        if (hp.y >= horizonY - 2) {
          if (!started) { ctx.moveTo(hp.x, hp.y); started = true; }
          else { ctx.lineTo(hp.x, hp.y); }
        }
      }
      ctx.stroke();
    }

    // Linhas de profundidade (colunas)
    for (var vc = 0; vc <= cols; vc++) {
      ctx.beginPath();
      var vStarted = false;
      var isRoadEdge = (vc === Math.floor(cols / 2 - 2) || vc === Math.ceil(cols / 2 + 2));

      for (var vr = rows; vr >= 0; vr--) {
        var vp = points[vr][vc];
        if (vp.y >= horizonY - 2) {
          if (!vStarted) {
            ctx.moveTo(vp.x, vp.y);
            vStarted = true;
          } else {
            ctx.lineTo(vp.x, vp.y);
          }
        }
      }
      var dist = Math.abs(vc - cols / 2);
      ctx.strokeStyle = isRoadEdge 
        ? 'rgba(255, 120, 0, 0.8)' 
        : (dist < 2.5 ? 'rgba(230, 0, 18, 0.35)' : 'rgba(180, 20, 20, 0.48)');
      ctx.stroke();
    }

    // Neblina no horizonte
    var fog = ctx.createLinearGradient(0, horizonY - 30, 0, horizonY + 70);
    fog.addColorStop(0, 'rgba(17, 17, 17, 0.95)');
    fog.addColorStop(0.35, 'rgba(17, 17, 17, 0.7)');
    fog.addColorStop(1, 'rgba(17, 17, 17, 0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, horizonY - 30, width, 100);

    // --- 3. BRASAS DE FOGUEIRA EM PIXEL ---
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y < horizonY - 80) {
        particles[pi] = createParticle(false);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  function start() {
    if (!enabled) return;
    if (!animId) {
      animId = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function setup() {
    if (document.getElementById('retro-bg-canvas')) return;

    var container = document.createElement('div');
    container.id = 'retro-bg-container';
    container.style.cssText = [
      'position: fixed',
      'inset: 0',
      'z-index: 0',
      'pointer-events: none',
      'overflow: hidden',
      'opacity: 0.85',
      'transition: opacity 0.4s ease'
    ].join(';');

    canvas = document.createElement('canvas');
    canvas.id = 'retro-bg-canvas';
    canvas.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; display: block;';
    ctx = canvas.getContext('2d');

    // Gradiente sutil para escurecer suavemente conforme a página rola para os cards
    var vignette = document.createElement('div');
    vignette.style.cssText = [
      'position: absolute',
      'inset: 0',
      'background: linear-gradient(180deg, rgba(17,17,17,0.15) 0%, rgba(17,17,17,0.4) 40%, rgba(17,17,17,0.92) 85%, #111111 100%)',
      'pointer-events: none'
    ].join(';');

    container.appendChild(canvas);
    container.appendChild(vignette);
    document.body.insertBefore(container, document.body.firstChild);

    // Ajusta z-index do conteúdo principal para ficar acima do fundo
    var shell = document.querySelector('.shell');
    if (shell) {
      shell.style.position = 'relative';
      shell.style.zIndex = '1';
    }

    resize();
    initParticles();
    window.addEventListener('resize', resize);

    // Pausar quando aba não estiver visível
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stop();
      else start();
    });

    // Observar quando o player é aberto/fechado para pausar
    var observer = new MutationObserver(function() {
      if (isEmulatorActive()) stop();
      else start();
    });

    var snesPlayer = document.getElementById('player');
    if (snesPlayer) observer.observe(snesPlayer, { attributes: true, attributeFilter: ['class'] });
    var modal = document.getElementById('modal');
    if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

    start();
  }

  // API global para controle do fundo
  window.ContinueRetroBg = {
    toggle: function() {
      enabled = !enabled;
      try { localStorage.setItem(STORAGE_KEY_BG, enabled ? 'true' : 'false'); } catch (e) {}
      var container = document.getElementById('retro-bg-container');
      if (container) container.style.display = enabled ? 'block' : 'none';
      if (enabled) start();
      else stop();
      return enabled;
    },
    isEnabled: function() {
      return enabled;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
