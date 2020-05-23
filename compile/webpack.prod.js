const merge = require("webpack-merge");
const {
    resolve,
    webpackConfig,
    target,
    pkgJson,
} = require("./webpack.common.js");
const ZipPlugin = require("zip-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = merge(webpackConfig, {
    mode: "production",
    resolve: {
        alias: {
            vue$: "vue/dist/vue.runtime.min.js",
        },
    },
    plugins: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                ecma: 6,
            },
        }),
        new ZipPlugin({
            path: resolve("build"),
            filename: `${target}-${pkgJson.name}-${pkgJson.version}.zip`,
        }),
        new FriendlyErrorsWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ],
});

module.exports = config;
