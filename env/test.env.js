const { merge } = require("webpack-merge");
var devEnv = require("./dev.env");

module.exports = merge(devEnv, {
    NODE_ENV: '"testing"',
    HOST: '"localhost:8000"',
    USE_API_MOCK: "true",
});
