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

class Global {
    static user: User;

    /**
     * Function to be called on each site load to set the runtime
     */
    public static async init() {
        if (window.location.protocol === 'http:') {
            console.log("Wrong Protocol");
            window.location.protocol = 'https:';
        }
        Global.user = new User();
        await Global.user.loadUser();
        ApiConnector.api_host = localStorage.getItem("API_HOST");
        ApiConnector.token = localStorage.getItem("API_TOKEN");

        await DatabaseConnector.initDB();
        if (ApiConnector.token !== null) {
            await ApiConnector.updateStores();
        }
    }

    public static logout() {
        localStorage.clear();
        ServiceworkerConnector.registration.unregister();
        window.location.href = "/"
        indexedDB.deleteDatabase("sPlan")
    }

}

Global.init();

enum UserType {
    NONE = -1,
    STUDENT = 0,
    TEACHER = 1,
}