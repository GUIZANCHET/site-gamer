/**
 * Arcade Continue? — Gerenciador de Armazenamento de ROMs (Cloudflare R2 / Nuvem / Local)
 */
(function() {
  const STORAGE_KEY = 'continue_rom_storage_url';

  // URL Cloudflare R2 - Conta 1 (PlayStation 1)
  // [CORS 100% ATIVO]
  const BUCKET_1_URL = 'https://pub-d47b5e32ad1342f086599fd4c17f1622.r2.dev';

  // URL Cloudflare R2 - Conta 2 (Super Nintendo, Neo Geo e Nintendo 64)
  // [CORS 100% ATIVO]: Configuração CORS validada e funcionando no Cloudflare R2
  const BUCKET_2_URL = 'https://pub-b60b23ea89e943358e1ba84d45a1521a.r2.dev';

  const PS1_R2_URL = BUCKET_1_URL;
  const RETRO_R2_URL = BUCKET_2_URL;

  function safeGet(key) {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function isValidStorageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
      const host = parsed.hostname.toLowerCase();
      return host.endsWith('.r2.dev') || host.endsWith('.cloudflare.com') || host === 'localhost' || host === '127.0.0.1';
    } catch (e) {
      return false;
    }
  }

  function safeSet(key, val) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (!val) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, val);
        }
      }
    } catch (e) {}
  }

  window.ContinueStorage = {
    BUCKET_1_URL,
    BUCKET_2_URL,
    // Retorna a URL base padrão (PlayStation)
    getBaseUrl() {
      if (this.isLocalHost()) {
        return ''; // Vazio = usa o próprio servidor local
      }

      const saved = safeGet(STORAGE_KEY);
      if (saved && saved.trim() && isValidStorageUrl(saved.trim())) {
        return saved.trim().replace(/\/+$/, '');
      }

      return PS1_R2_URL;
    },

    // Retorna a URL base para Super Nintendo, Neo Geo e Nintendo 64
    getRetroUrl() {
      if (this.isLocalHost()) {
        return '';
      }

      const saved = safeGet('continue_retro_storage_url');
      if (saved && saved.trim() && isValidStorageUrl(saved.trim())) {
        return saved.trim().replace(/\/+$/, '');
      }

      return RETRO_R2_URL;
    },

    isLocalHost() {
      const host = window.location.hostname;
      return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    },

    // Salva uma nova URL de storage
    setBaseUrl(url) {
      safeSet(STORAGE_KEY, url ? url.trim().replace(/\/+$/, '') : null);
    },

    // Resolve o caminho final da ROM
    resolveUrl(relativeUrl) {
      if (!relativeUrl) return '';
      // Se já for URL absoluta (http, https, blob)
      if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('blob:')) {
        return relativeUrl;
      }

      if (this.isLocalHost()) {
        return relativeUrl;
      }

      const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl;
      const decoded = decodeURIComponent(cleanRelative).toLowerCase();

      // Direciona Super Nintendo, Neo Geo e Nintendo 64 para o bucket retro (Conta 2)
      if (decoded.startsWith('/super nintendo/') || decoded.startsWith('/neogeo/') || decoded.startsWith('/n64/')) {
        const retroBase = this.getRetroUrl();
        return retroBase ? retroBase + cleanRelative : cleanRelative;
      }

      // Direciona PlayStation 1 para o bucket principal (Conta 1)
      const base = this.getBaseUrl();
      return base ? base + cleanRelative : cleanRelative;
    },

    // Detecta se estamos rodando na Vercel / Nuvem sem storage configurado
    isCloudWithoutStorage() {
      return !this.isLocalHost() && !this.getBaseUrl();
    }
  };
})();
