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
                let userType = window.localStorage.getItem('userType');
                window.location.href = "/pages/" + userType + "/timeTable.html"
            }
        }

        this.getApiKey = async () => {
            this.disableLogin();

            let payload = {
                "username": this.getUsernameField(),
                "password": this.getPasswordField()
            }

            if (login.secondFactor) {
                payload["secondFactor"] = this.getTotpField();
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
                window.localStorage.setItem('token', responseBody.token);
                window.localStorage.setItem('userType', responseBody.userType);
                await serviceworkerConnector.setApiKey(responseBody.token);
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

            let key = await serviceworkerConnector.requestApiKey();
            let localKey = window.localStorage.getItem('token');
            console.log(key);
            console.log(localKey);
            if (key == null) {
                if (localKey != null) {
                    await serviceworkerConnector.setApiKey(localKey);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                if (typeof key === "string") {
                    window.localStorage.setItem('token', key);
                }
                resolve(true)
            }
        });
    }

    disableLog() {
        this.disableLogin()
    }
}