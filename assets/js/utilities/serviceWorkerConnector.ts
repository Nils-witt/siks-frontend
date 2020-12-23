let serviceworkerConnector = {
    registration: undefined,
    register: () => {
        return new Promise<void>(async (resolve, reject) => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/serviceworker.js', {}).then((reg) => {
                    console.log('Registrierung erfolgreich. Scope ist ' + reg.scope);
                    if (!reg.active) {
                        console.log('SW not active');
                        location.reload();
                    }
                    serviceworkerConnector.registration = reg;
                    resolve()
                }).catch(function (error) {
                    console.log('Registrierung fehlgeschlagen mit ' + error);
                    reject();
                });
            }
        });
    },
    requestApiKey: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "getApiKey"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    setApiKey: (token) => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "setApiKey", 'key': token}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    sendMessage: (message) => {
        return new Promise(async (resolve, reject) => {

            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    updateCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "updateCache"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    forceCacheUpdate: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "forceUpdateCache"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    disableCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "disableCache"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    enableCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "enableCache"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    logout: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = replyHandler;
            navigator.serviceWorker.controller.postMessage({"command": "logout"}, [messageChannel.port2]);

            function replyHandler(event) {
                resolve(event.data);
            }
        });
    },
    reInit: async () => {
        this.forceCacheUpdate();
        try {
            await caches.delete("StaticCache");
            window.localStorage.clear();
            indexedDB.deleteDatabase("sPlan");
            navigator.serviceWorker.getRegistrations()
                .then((registrations) => {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
        } catch (e) {

        }
        window.location.href = "/pages/login.html";
    }
}