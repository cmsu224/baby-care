/* Feeding board service worker.
   Shell is cache-first so the board opens with no signal at 3 AM.
   config.json is network-first so a pushed schedule change lands quickly,
   but falls back to the last cached copy rather than failing. */

var CACHE_VERSION = "board-v4";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE_VERSION ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // config.json: network first, cache fallback
  if (url.pathname.indexOf("config.json") !== -1) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put("./config.json", copy); });
        return res;
      }).catch(function () {
        return caches.match("./config.json");
      })
    );
    return;
  }

  // Shell: network first, but only briefly. Cache-first would serve a stale board for a
  // whole load after every deploy; a plain network-first would stall on bad wifi at 3 AM.
  // So: race the network against a short timer and fall back to cache either way.
  e.respondWith(
    caches.match(req).then(function (hit) {
      var timedOut = false;
      var timer = new Promise(function (resolve) {
        setTimeout(function () { timedOut = true; resolve(hit || fetch(req)); }, 2500);
      });
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return timedOut && hit ? hit : res;
      }).catch(function () { return hit; });
      return hit ? Promise.race([net, timer]) : net;
    })
  );
});
