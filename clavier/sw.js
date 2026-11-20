/* Exercices Clavier — service worker (mode hors ligne)
   Auteur : Tom Rougeaud · Réalisé avec l’aide de l’IA : Claude Sonnet 5.5 (Anthropic)
   À chaque mise à jour du jeu : changer le numéro de VERSION ci-dessous
   (sinon les anciens fichiers restent servis). */
const VERSION = "clavier-v1.5";
const FICHIERS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

// Installation : on met les fichiers en cache (sans activer tout de suite : le jeu propose « Recharger »)
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }));
});
// Activation : on supprime les anciens caches de CE jeu uniquement
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.filter(function (n) { return n.indexOf("clavier-") === 0 && n !== VERSION; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
// Message envoyé par le bouton « Recharger » du jeu
self.addEventListener("message", function (e) { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
// Réponses : cache d’abord, sinon réseau ; page d’accueil en secours hors ligne
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(function (m) {
    return m || fetch(e.request).catch(function () { return caches.match("./index.html"); });
  }));
});
