#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const BUNDLE_DIR = process.env.BUNDLE_DIR || path.join(__dirname, "../dist");
const bundles = [
    "scripts/background.js",
    "scripts/facebook.js",
    "scripts/options.js",
    "scripts/popup.js",
    "scripts/twitter.js",
];

const evalRegexForProduction = /Function\(["']return this['"]\)\(\)/g;

const removeEvals = (file) => {
    console.info(`Removing eval() from ${file}`);

    return new Promise((resolve, reject) => {
        fs.readFile(file, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            if (!evalRegexForProduction.test(data)) {
                reject(`No CSP specific code found in ${file}.`);
                return;
            }

            data = data.replace(evalRegexForProduction, "window");

            fs.writeFile(file, data, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });
};

const main = () => {
    bundles.forEach((bundle) => {
        removeEvals(path.join(BUNDLE_DIR, bundle))
            .then(() => console.info(`Bundle ${bundle}: OK`))
            .catch(console.error);
    });
};

main();
