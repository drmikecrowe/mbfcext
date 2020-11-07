const webpack = require("webpack");
const { merge } = require("webpack-merge");
const { webpackConfig } = require("./webpack.common.js");
const WriteFilePlugin = require("write-file-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

module.exports = merge(webpackConfig, {
    devtool: "eval-source-map",
    mode: "development",
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: "development",
            DEBUG: "mbfc",
        }),
        new FriendlyErrorsWebpackPlugin(),
        new ExtensionReloader({
            reloadPage: true, // Force the reload of the page also
            entries: {
                background: "background",
                extensionPage: ["popup", "options"],
                contentScript: ["facebook", "twitter"],
            },
        }),
        new WriteFilePlugin(),
    ],
    output: {
        // devtoolModuleFilenameTemplate: (info) => {
        //     let $filename = "sources://" + info.resourcePath;
        //     console.log(info);
        //     if (
        //         (info.resourcePath.match(/\.vue$/) &&
        //             !info.query.match(/type=script/)) ||
        //         `${info.moduleId}` !== ``
        //     ) {
        //         $filename =
        //             "webpack-generated:///" +
        //             info.resourcePath +
        //             "?" +
        //             info.hash;
        //     }
        //     return $filename;
        // },
        // devtoolFallbackModuleFilenameTemplate:
        //     "webpack:///[resource-path]?[hash]",
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js",
        },
    },
    watch: true,
    devServer: {
        // stats: "minimal",
        quiet: true,
        watchContentBase: true,
        watchOptions: {
            poll: true,
        },
        disableHostCheck: true,
    },
});
