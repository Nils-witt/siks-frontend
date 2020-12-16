import * as fs from 'fs';

let excludeFiles = [
    './serviceworker.js',
    './package-lock.json',
    './package.json',
    './tsconfig.json',
    './manifest.json',
    './updateCache.js',
    './reset.html',
];
let excludeDirs = ['node_modules'];

let files = []

let cacheFileTemplate = {
    timestamp: 0,
    date: "",
    files: []
}

let staticCacheFiles = [
    "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://code.jquery.com/jquery-3.3.1.slim.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
]

async function print(path) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
        if (!dirent.name.startsWith('.')) {
            if (dirent.isDirectory()) {
                if (!excludeDirs.includes(dirent.name)) {
                    await print(path + dirent.name + '/');
                }
            } else {
                if (!excludeFiles.includes(path + dirent.name)) {
                    files.push((path + dirent.name).substr(1));
                }
            }
        }
    }
}

(async () => {
    await print('./')
    let date = new Date();
    cacheFileTemplate.timestamp = date.getTime();
    cacheFileTemplate.date = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
    cacheFileTemplate.files = files;
    fs.writeFileSync("./cache.json", JSON.stringify(cacheFileTemplate));
})()
