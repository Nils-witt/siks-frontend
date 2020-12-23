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
                }).catch((error) => {
                    console.log('Registrierung fehlgeschlagen mit ' + error);
                    reject();
                });
            }
        });
    },
    requestApiKey: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "getApiKey"}, [messageChannel.port2]);
        });
    },
    setApiKey: (token) => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "setApiKey", 'key': token}, [messageChannel.port2]);
        });
    },
    sendMessage: (message) => {
        return new Promise(async (resolve, reject) => {

            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
        });
    },
    updateCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "updateCache"}, [messageChannel.port2]);
        });
    },
    forceCacheUpdate: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "forceUpdateCache"}, [messageChannel.port2]);
        });
    },
    disableCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "disableCache"}, [messageChannel.port2]);
        });
    },
    enableCache: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "enableCache"}, [messageChannel.port2]);
        });
    },
    logout: () => {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "logout"}, [messageChannel.port2]);
        });
    },
    reInit: async () => {
        await this.forceCacheUpdate();
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