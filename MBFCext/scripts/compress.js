// From: https://github.com/jhen0409/react-chrome-extension-boilerplate/blob/master/scripts/compress.js

const fs = require("fs");
const ChromeExtension = require("crx");
/* eslint import/no-unresolved: 0 */
const manifest = require("../build/manifest.json");
const version = manifest.version;
const name = manifest.name.replace(/[/]/g, "-");
const argv = require("minimist")(process.argv.slice(2));

const keyPath = argv.key || "key.pem";
const existsKey = fs.existsSync(keyPath);
const crx = new ChromeExtension({
    appId: argv["app-id"],
    codebase: argv.codebase,
    privateKey: existsKey ? fs.readFileSync(keyPath) : null,
});

crx.load("build")
    .then(() => crx.loadContents())
    .then(archiveBuffer => {
        fs.writeFileSync(`dist/${name}-${version}.zip`, archiveBuffer);

        if (!argv.codebase || !existsKey) return;
        crx.pack(archiveBuffer).then(crxBuffer => {
            const updateXML = crx.generateUpdateXML();

            fs.writeFile("update.xml", updateXML);
            fs.writeFile(`${name}.crx`, crxBuffer);
        });
    });
