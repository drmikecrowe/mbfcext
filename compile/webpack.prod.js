const { merge } = require("webpack-merge");
const { webpackConfig, target, pkgJson } = require("./webpack.common.js");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const plugins = [
    new FileManagerPlugin({
        events: {
            onEnd: {
                archive: [
                    {
                        source: `build/${target}/`,
                        destination: `build/${target}-${pkgJson.name}-${pkgJson.version}.zip`,
                    },
                ],
            },
        },
    }),
];

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//     .BundleAnalyzerPlugin;

// plugins.push(
//     new BundleAnalyzerPlugin({
//         analyzerMode: "static",
//         generateStatsFile: true,
//         reportFilename: `/tmp/report-${target}.html`,
//     })
// );

const config = merge(webpackConfig, {
    devtool: false,
    mode: "production",
    optimization: {
        usedExports: true,
        minimize: true,
    },
    plugins,
});

module.exports = config;
