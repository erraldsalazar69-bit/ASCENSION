/* ASCENSION / SERAPHIM V1.9.8 AI Chat Starter service worker. Own-cache cleanup is scoped to this app only. */
const CACHE='ascension-seraphim-tactical-integrated-v19-8-scan-english-fix2-20261026';
const APP_CACHE_PREFIX='ascension-seraphim-tactical-integrated-';
const ASSETS=[
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './seraphim.js?v=19-8-scan-english-fix2-20261026','./seraphim-nexus.html?v=19-8-scan-english-fix2-20261026',
 './seraphim-tactical-command.js?v=19-8-scan-english-fix2-20261026','./seraphim-dragon-line-ice.png','./seraphim-dragon-line-neon.png',
 './world-intel.js?v=19-8-scan-english-fix2-20261026','./news.json'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(APP_CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(event.request);
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
   return response;
  }catch{
   const appCache=await caches.open(CACHE);
   const cached=await appCache.match(event.request);
   if(cached)return cached;
   // Serve this app's cached file despite a cache-busting query (for example news.json?t=...).
   const cachedIgnoringQuery=await appCache.match(event.request,{ignoreSearch:true});
   if(cachedIgnoringQuery)return cachedIgnoringQuery;
   if(event.request.mode==='navigate')return (await appCache.match('./index.html'))||Response.error();
   return new Response('This resource is not available offline.',{status:503,statusText:'Offline and not cached',headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  }
 })());
});
