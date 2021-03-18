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

class Login {
    private secondFactor: boolean;
    private apiUrl: string;
    private disableLogin: () => void;
    private enableLogin: () => void;
    private getUsernameField: () => void;
    private getPasswordField: () => void;
    private getTotpField: () => void;
    private openSecondFactorEntry: () => void;
    private setErrorStatus: (p: this) => void;
    private setSFError: (b: boolean) => void;
    private navigateToMainPage: () => void;
    private getApiKey: () => Promise<void>;

    constructor() {
        this.secondFactor = false;
        this.apiUrl = "";
        this.disableLogin = () => {
        };
        this.enableLogin = () => {
        };
        this.getUsernameField = () => {
        };
        this.getPasswordField = () => {
        };
        this.getTotpField = () => {
        };
        this.openSecondFactorEntry = () => {
        };
        this.setErrorStatus = () => {
        };
        this.setSFError = () => {
        };

        this.navigateToMainPage = () => {
            let url = new URL(window.location.href);
            let by = url.searchParams.get("sw");
            console.log(by);
            if (by !== undefined && by !== null) {
                window.history.go(-1);
            } else {
                window.location.href = "/pages/timeTable.html"
            }
        }

        this.getApiKey = async () => {
            this.disableLogin();

            let payload = {
                "username": this.getUsernameField(),
                "password": this.getPasswordField()
            }

            if (login.secondFactor) {
                payload["code"] = this.getTotpField();
            }

            let response = await fetch(this.apiUrl + "/user/login", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(payload),
            })
            if (response.status === 200) {
                let responseBody = await response.json();
                window.localStorage.setItem('API_TOKEN', responseBody.token);
                let type = 0;
                if (responseBody.userType === "teacher"){
                    type = 2;
                }
                window.localStorage.setItem('USER_TYPE', type.toString());
                await ServiceworkerConnector.setApiKey(responseBody.token);
                this.navigateToMainPage();
            } else if (response.status === 602) {
                this.openSecondFactorEntry();
                this.secondFactor = true;
            } else {
                if (!this.secondFactor) {
                    this.enableLogin();
                    this.setErrorStatus(this);
                } else {
                    this.setSFError(true);
                }
            }
        }
    }

    isLoggedIn() {
        return new Promise(async (resolve, reject) => {

            let key = await ServiceworkerConnector.requestApiKey();
            let localKey = window.localStorage.getItem('API_TOKEN');
            if (key == null) {
                if (localKey != null) {
                    await ServiceworkerConnector.setApiKey(localKey);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                if (typeof key === "string") {
                    window.localStorage.setItem('API_TOKEN', key);
                }
                resolve(true)
            }
        });
    }

    disableLog() {
        this.disableLogin()
    }
}