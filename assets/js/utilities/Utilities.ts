class Utilities {
    static urlB64ToUint8Array(base64String) {
        let padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        let base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        let rawData = atob(base64);
        let outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    };

    static convertTimeToSeconds(time) {
        let date = time.split(":");
        return (date[0] * 3600) + (date[1] * 60);
    }

    randomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}