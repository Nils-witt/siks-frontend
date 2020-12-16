class Appearence {

    darkMode(active) {
        console.log("Darkmode: " + active)
    }

    enableDarkModeListener() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.darkMode(true);
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            console.log("Dark LT")
            this.darkMode(e.matches);
        });
    }
}