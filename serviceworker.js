/*
const precacheResources = [
    '/assets/css/global.css',
    '/assets/css/loginForm.css',
    '/assets/css/Navigation-with-Button.css',
    '/assets/css/stundenplan.css',
    '/assets/icons/S-Plan-192.png',
    '/assets/icons/S-Plan-512.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
    'https://browser.sentry-cdn.com/5.7.0/bundle.min.js',
    'https://code.jquery.com/jquery-3.3.1.slim.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
    '/assets/js/databaseConnector.js',
    '/assets/js/apiConnector.js',
    '/assets/js/main.js',
    '/assets/js/student/stundenplan.js',
    '/manifest.json'

];*/

const precacheResources = [];

const dynamicCacheName = 'ApplicationCache';
const staticCacheName = 'StaticCache'

let apiKey;
let username;

let cacheOn = true;

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(precacheResources);
            })
    );
    setTimeout(function () {
        refreshClients();
    },500);
});

self.addEventListener('fetch', event => {
    //caches.open(staticCacheName).then(function(cache) {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                //cache.put(event.request, response.clone());

                return response;
            })
            .catch(function() {
                return caches.match(event.request);
            })
    );
    //});
});

self.addEventListener('activate', async (event) => {
    setTimeout(function () {
        refreshClients();
    },500);

    console.log('Service worker activate event!');
});


self.addEventListener("message", (evt) => {
    const client = evt.source;
    let data = evt.data;
    if(data.hasOwnProperty("command")){
        if(data.command == "getApiKey"){
            client.postMessage({"success":true,"Type":"apiKey","Key":apiKey})
        }else if (data.command == "setApiKey"){
            apiKey = data.key;
            client.postMessage({"set":true});
        }else if (data.command == "logout"){
            logout();
            client.postMessage({"set":true});
        }else if (data.command == "setUsername"){
            username = data.Username;
            client.postMessage({"set":true});
        }else if (data.command == "getUsername"){
            client.postMessage({"success":true,"Type":"username","Username":username});
        }else if (data.command == "refreshClients"){
            refreshClients();
            client.postMessage({});
        }else if (data.command == "toggleCache"){
            refreshClients();
            client.postMessage({"cache":cacheOn});
        }else if (data.command == "push"){
            initPush();
            client.postMessage({"psuh":"done"});
        }
    }
});

self.addEventListener('push', event => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
    });
});


function logout() {
    apiKey = null;
    username = null;
    let db;
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

self.addEventListener("push", function(event) {
    if (event.data) {
        console.log("Push event!! ", event.data.text());
        let data = JSON.parse(event.data.text());
        showLocalNotification(data.body, data.body, self.registration);
    } else {
        console.log("Push event but no data");
    }
});
const showLocalNotification = (title, body, swRegistration) => {
    const options = {
        body
    };
    swRegistration.showNotification(title, options);
};