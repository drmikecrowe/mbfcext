#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const zip = require("bestzip");
const pkg = require("../package.json");

const BUNDLE_DIR = process.env.BUNDLE_DIR || path.join(__dirname, "../build");
const targets = ["chrome", "firefox", "opera"];
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
        return reject(err);
      }

      if (!evalRegexForProduction.test(data)) {
        console.log(`No CSP specific code found in ${file}.`);
        return resolve();
      }

      data = data.replace(evalRegexForProduction, "globalThis");

      fs.writeFile(file, data, (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  });
};

const zipDir = async (target) => {
  return new Promise((resolve, reject) => {
    zip({
      source: `.`,
      cwd: `build/${target}`,
      destination:
        process.cwd() + `/build/${target}-${pkg.name}-${pkg.version}.zip`,
    })
      .then(function () {
        console.log("all done!");
        resolve();
      })
      .catch(function (err) {
        console.error(err.stack);
        reject(err);
      });
  });
};

const main = () => {
  bundles.forEach((bundle) => {
    targets.forEach(async (target) => {
      await removeEvals(path.join(BUNDLE_DIR, target, bundle));
      await zipDir(target);
    });
  });
};

main();
