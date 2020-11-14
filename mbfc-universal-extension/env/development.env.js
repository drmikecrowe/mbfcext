const { merge } = require("webpack-merge");
var prodEnv = require("./production.env");

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    DEBUG: '"mbfc"',
});
