/**
 * Arcade Continue? — Gerenciador de Armazenamento de ROMs (Cloudflare R2 / Nuvem / Local)
 */
(function() {
  const STORAGE_KEY = 'continue_rom_storage_url';

  // URL padrão configurada no Cloudflare R2
  const DEFAULT_R2_URL = 'https://pub-d47b5e32ad1342f086599fd4c17f1622.r2.dev';

  window.ContinueStorage = {
    // Retorna a URL base do storage
    getBaseUrl() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        return saved.trim().replace(/\/+$/, '');
      }

      // Se estiver rodando localmente (localhost ou IP na rede local)
      const host = window.location.hostname;
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
      if (isLocal) {
        return ''; // Vazio = usa o próprio servidor local
      }

      return DEFAULT_R2_URL;
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

      const base = this.getBaseUrl();
      if (!base) {
        return relativeUrl;
      }

      const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl;
      return base + cleanRelative;
    },

    // Detecta se estamos rodando na Vercel / Nuvem sem storage configurado
    isCloudWithoutStorage() {
      const host = window.location.hostname;
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
      return !isLocal && !this.getBaseUrl();
    }
  };
})();
