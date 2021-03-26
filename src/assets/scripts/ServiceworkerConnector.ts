/*
 * S-Plan
 * Copyright (c) 2021 Nils Witt
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of the author nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class ServiceworkerConnector {
    static registration: ServiceWorkerRegistration

    static register() {
        return new Promise<void>(async (resolve, reject) => {
            if ('serviceWorker' in navigator) {
                if (ServiceworkerConnector.registration == null) {
                    navigator.serviceWorker.register('/serviceworker.js', {}).then((reg) => {
                        console.log('SW Registrierung erfolgreich.');
                        if (!reg.active) {
                            console.log('SW not active');
                            location.reload();
                        }
                        this.registration = reg;
                        resolve()
                    }).catch((error) => {
                        console.log('Registrierung fehlgeschlagen mit ' + error);
                        reject();
                    });
                } else {
                    console.log("LS")
                    resolve();
                }
            }
        });
    }

    static requestApiKey() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "getApiKey"}, [messageChannel.port2]);
        });
    }

    static setApiKey(token) {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "setApiKey", 'key': token}, [messageChannel.port2]);
        });
    }

    static sendMessage(message) {
        return new Promise(async (resolve, reject) => {

            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
        });
    }

    static updateCache() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "updateCache"}, [messageChannel.port2]);
        });
    }

    static forceCacheUpdate() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "forceUpdateCache"}, [messageChannel.port2]);
        });
    }

    static disableCache() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "disableCache"}, [messageChannel.port2]);
        });
    }

    static enableCache() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "enableCache"}, [messageChannel.port2]);
        });
    }

    static logout() {
        return new Promise(async (resolve, reject) => {
            let messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({"command": "logout"}, [messageChannel.port2]);
        });
    }

    static async reInit() {
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

ServiceworkerConnector.register();