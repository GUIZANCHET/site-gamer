/*! coi-serviceworker v0.1.7 - Guido Zuidhof -- MIT License */
let coepCredentialless = true;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) {
      return;
    } else if (ev.data.type === "deregister") {
      self.registration
        .unregister()
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        });
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
      return;
    }

    const coepHeader = coepCredentialless ? "credentialless" : "require-corp";

    event.respondWith(
      fetch(r).then((response) => {
        if (response.status === 0) {
          return response;
        }

        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", coepHeader);
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      })
    );
  });
} else {
  (() => {
    const coi = {
      shouldRegister: () => !window.crossOriginIsolated,
      shouldDeregister: () => false,
      coepCredentialless: () => true,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi
    };

    if (!window.isSecureContext) {
      return;
    }

    if (window.crossOriginIsolated) {
      return;
    }

    if ("serviceWorker" in navigator) {
      const currentScript = document.currentScript;
      const scriptUrl = (currentScript && currentScript.src) ? currentScript.src : "coi-serviceworker.js";

      navigator.serviceWorker.register(scriptUrl).then((registration) => {
        registration.addEventListener("updatefound", () => {
          coi.doReload();
        });

        if (registration.active && !navigator.serviceWorker.controller) {
          coi.doReload();
        }
      }).catch((err) => {
        if (!coi.quiet) console.warn("[coi-serviceworker] registration failed:", err);
      });
    }
  })();
}
