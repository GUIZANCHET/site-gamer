/**
 * Arcade Continue? — Gerenciador de Armazenamento de ROMs (Cloudflare R2 / Nuvem / Local)
 */
(function() {
  const STORAGE_KEY = 'continue_rom_storage_url';

  // URL Cloudflare R2 - Conta 1 (PlayStation 1)
  const PS1_R2_URL = 'https://pub-d47b5e32ad1342f086599fd4c17f1622.r2.dev';

  // URL Cloudflare R2 - Conta 2 (Super Nintendo e Neo Geo)
  const RETRO_R2_URL = 'https://pub-b60b23ea89e943358e1ba84d45a1521a.r2.dev';

  window.ContinueStorage = {
    // Retorna a URL base padrão (PlayStation)
    getBaseUrl() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        return saved.trim().replace(/\/+$/, '');
      }

      if (this.isLocalHost()) {
        return ''; // Vazio = usa o próprio servidor local
      }

      return PS1_R2_URL;
    },

    // Retorna a URL base para Super Nintendo e Neo Geo
    getRetroUrl() {
      const saved = localStorage.getItem('continue_retro_storage_url');
      if (saved && saved.trim()) {
        return saved.trim().replace(/\/+$/, '');
      }

      if (this.isLocalHost()) {
        return '';
      }

      return RETRO_R2_URL;
    },

    isLocalHost() {
      const host = window.location.hostname;
      return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    },

    // Salva uma nova URL de storage
    setBaseUrl(url) {
      if (!url || !url.trim()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/+$/, ''));
      }
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

      // Direciona Super Nintendo e Neo Geo para o bucket retro (Conta 2)
      if (decoded.startsWith('/super nintendo/') || decoded.startsWith('/neogeo/')) {
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
