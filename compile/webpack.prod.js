const merge = require("webpack-merge");
const {
    resolve,
    webpackConfig,
    target,
    pkgJson,
} = require("./webpack.common.js");
const ZipPlugin = require("zip-webpack-plugin");

const config = merge(webpackConfig, {
    devtool: "none",
    mode: "production",
    resolve: {
        alias: {
            vue$: "vue/dist/vue.runtime.min.js",
        },
    },
    plugins: [
        new ZipPlugin({
            path: resolve("build"),
            filename: `${target}-${pkgJson.name}-${pkgJson.version}.zip`,
        }),
    ],
});

module.exports = config;
