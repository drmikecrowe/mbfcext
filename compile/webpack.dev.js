const debug = require("debug")("webpack:dev");
const inspect = require("util").inspect;
const merge = require("webpack-merge");
const { resolve, webpackConfig } = require("./webpack.common.js");
const WriteFilePlugin = require("write-file-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
// const DashboardPlugin = require("webpack-dashboard/plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

module.exports = merge(webpackConfig, {
    // devtool: "inline-source-map",
    mode: "development",
    plugins: [
        new FriendlyErrorsWebpackPlugin(),
        new ExtensionReloader({
            reloadPage: true, // Force the reload of the page also
            entries: {
                background: "background",
                extensionPage: ["popup", "options"],
                contentScript: ["facebook", "twitter"],
            },
        }),
        // new DashboardPlugin(),
        new WriteFilePlugin(),
    ],
    output: {
        devtoolModuleFilenameTemplate: (info) => {
            let $filename = "sources://" + info.resourcePath;
            // console.log(info);
            if (
                (info.resourcePath.match(/\.vue$/) &&
                    !info.query.match(/type=script/)) ||
                `${info.moduleId}` !== ``
            ) {
                $filename =
                    "webpack-generated:///" +
                    info.resourcePath +
                    "?" +
                    info.hash;
            }
            return $filename;
        },
        devtoolFallbackModuleFilenameTemplate:
            "webpack:///[resource-path]?[hash]",
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js",
        },
    },
    watch: true,
    devServer: {
        // stats: "minimal",
        // quiet: true,
        watchContentBase: true,
        watchOptions: {
            poll: true,
        },
        disableHostCheck: true,
    },
});
