const staticCacheName = 'StaticCache'

let apiKey;
let username;

let cacheVersion = "";
let disableCache = false;

//Event to install and initialise the service worker
self.addEventListener('install', event => {
    self.skipWaiting();
});



//Event for the control takeover
self.addEventListener('activate', async (event) => {
    setTimeout(function () {
        refreshClients();
    },500);
});

//Event if a site requests a file from the server
self.addEventListener('fetch', function(event) {
    try {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }catch (e) {
        console.log(e)
    }
});

//Messages between sites ---> worker
self.addEventListener("message", (event) => {
    let data = event.data;

    if(data.hasOwnProperty("command")){
        if(data.command === "getApiKey"){
            event.ports[0].postMessage(apiKey);
        }else if (data.command === "setApiKey"){
            apiKey = data.key;
            event.ports[0].postMessage({"set":true});
        }else if (data.command === "logout"){
            logout();
            event.ports[0].postMessage({"set":true});
        }else if (data.command === "setUsername"){
            username = data.Username;
            event.ports[0].postMessage({"set":true});
        }else if (data.command === "getUsername"){
            event.ports[0].postMessage({"success":true,"Type":"username","Username":username});
        }else if (data.command === "push"){
            initPush();
            event.ports[0].postMessage({"push":"done"});
        }else if (data.command === "disableCache"){
            caches.delete(staticCacheName);
            disableCache = true;
            event.ports[0].postMessage({"cache":"disabled"});
        }else if (data.command === "enableCache"){
            loadCacheManifest()
            disableCache = false;
            event.ports[0].postMessage({"cache":"enabled"});
        }else if (data.command === "updateCache"){
            loadCacheManifest();
        }else if (data.command === "forceUpdateCache"){
            forceCacheUpdate();
        }
    }
});

//TODO 2 times the same event listener????
self.addEventListener('push', event => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {body: data.body,});
});

//Called when a user performs logout and cleans all stored data that need authorisation
function logout() {
    apiKey = null;
    username = null;
    if (indexedDB) {
        indexedDB.deleteDatabase('sPlan')
    }
    self.clients.matchAll({type: 'window'})
        .then(clients => {
            return clients.map(client => {
                if ('navigate' in client) {
                    return client.navigate('/pages/login.html');
                }
            });
        })
}

//refreshes the windows of all tabs / windows controlled by this instance
function refreshClients(){
    self.clients.matchAll({type: 'window'})
        .then(clients => {
            return clients.map(client => {
                if ('navigate' in client) {
                    console.log(client.url)
                    return client.navigate(client.url);
                }
            });
        })
}
//Enables push notifications
async function initPush(){
    try {
        const applicationServerKey = urlB64ToUint8Array("BBDWHJkJr4mFzQwkNVWKG_Lj6NTXFx38XxBvUCHV9Sm_U4xlvMYapvImY8BBUSd6UI8NkzNygJRZ5J_MMgsSTek");
        const options = {applicationServerKey, userVisibleOnly: true}
        console.log(options)
        const subscription = await self.registration.pushManager.subscribe(options)
        console.log(JSON.stringify(subscription))
    } catch (err) {
        console.log('Error', err)
    }
}

const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

//TODO extend
self.addEventListener("push", function(event) {
    if (event.data) {
        console.log("Push event!! ", event.data.text());
        let data = JSON.parse(event.data.text());
        showLocalNotification(data.body, data.body, self.registration);
    } else {
        console.log("Push event but no data");
    }
});

//TODO extend
const showLocalNotification = (title, body, swRegistration) => {
    const options = {
        body
    };
    swRegistration.showNotification(title, options);
};


async function loadCacheManifest() {
    try {
        //For development purposes delete cache if there is one and dont create a new one
        if(!disableCache){
            //Load file containing Information about which files should be loaded for a cache version and retained until the the version increases
            let res = await fetch( "/cache.json");
            let cacheDetails = await res.json();
            if(cacheDetails.files.length > 0){
                if(cacheDetails.version !== cacheVersion){
                    console.log("Updating cache");
                    //clearing existing cache
                    await caches.delete(staticCacheName);
                    let cache = await caches.open(staticCacheName);
                    for (const cacheDetailsKey in cacheDetails.files) {
                        if(cacheDetails.files.hasOwnProperty(cacheDetailsKey)){
                            //Load files from the list and save them into the cache
                            let file = await fetch(cacheDetails.files[cacheDetailsKey]);
                            await cache.put(cacheDetails.files[cacheDetailsKey], file);
                        }
                    }
                    cacheVersion = cacheDetails.version;
                }
            }else {
                console.log("Cache file may invalid");
            }
        }else {
            await caches.delete(staticCacheName);
        }
    }catch (e) {
        console.log(e)
    }
}

async function forceCacheUpdate() {
    try {
        //For development purposes delete cache if there is one and dont create a new one
        if(!disableCache){
            //Load file containing Information about which files should be loaded for a cache version and retained until the the version increases
            let res = await fetch( "/cache.json");
            let cacheDetails = await res.json();
            if(cacheDetails.files.length > 0){
                //clearing existing cache
                await caches.delete(staticCacheName);
                let cache = await caches.open(staticCacheName);
                for (const cacheDetailsKey in cacheDetails.files) {
                    if(cacheDetails.files.hasOwnProperty(cacheDetailsKey)){
                        //Load files from the list and save them into the cache
                        let file = await fetch(cacheDetails.files[cacheDetailsKey]);
                        await cache.put(cacheDetails.files[cacheDetailsKey], file);
                    }
                }
                cacheVersion = cacheDetails.version;

            }else {
                console.log("Cache file may invalid");
            }
        }else {
            await caches.delete(staticCacheName);
        }
    }catch (e) {
        console.log(e)
    }
}