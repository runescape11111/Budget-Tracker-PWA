
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "index.js",
    "db.js",
    "/manifest.json",
    "/favicon.ico",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";

  self.addEventListener("install", function (evt) {

    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Your files were pre-cached successfully! ✅");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function (evt) {

    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data 🧹", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", function (evt) {

    console.log(
      `Service working is handling request for '${evt.request.url}'. 📝`
    );
  
    // Checks for requests to any url containing "/api/"
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  console.log("Saving response in the data cache. 🔑");
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch((err) => {
                // Network request failed, try to get it from the cache.
                console.log(
                  "Unable to reach the server. Getting data from the cache instead. 📝"
                );
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      caches.match(evt.request).then(function (response) {
        return response || fetch(evt.request);
      })
    )
  });
  