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

import * as fs from 'fs';

let excludeFiles = [
    './serviceworker.js',
    './package-lock.json',
    './package.json',
    './tsconfig.json',
    './updateCache.js',
    './reset.html',
    "./customStarter.sh",
    "./config.json.default",
    "./cache.json",
    "./updateCache.ts"
];
let excludeDirs = ['node_modules'];

let files = []

let cacheFileTemplate = {
    timestamp: 0,
    date: "",
    files: []
}

let staticCacheFiles = []

async function print(path) {
    const dir = await fs.promises.opendir(path);
    for await (const dirEntry of dir) {
        if (!dirEntry.name.startsWith('.')) {
            if (dirEntry.isDirectory()) {
                if (!excludeDirs.includes(dirEntry.name)) {
                    await print(path + dirEntry.name + '/');
                }
            } else {
                if (!excludeFiles.includes(path + dirEntry.name)) {
                    if (!dirEntry.name.endsWith(".scss") && !dirEntry.name.endsWith(".css.map") && !dirEntry.name.endsWith(".ts") && !dirEntry.name.endsWith(".js.map"))
                        files.push((path + dirEntry.name).substr(1));
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
    cacheFileTemplate.files = files.concat(staticCacheFiles);
    fs.writeFileSync("./cache.json", JSON.stringify(cacheFileTemplate));
})()
