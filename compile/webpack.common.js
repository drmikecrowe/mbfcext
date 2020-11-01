const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const pkgJson = require("../package.json");

const CopyWepbackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const VueLoaderPlugin = require("vue-loader").VueLoaderPlugin;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");

const isDev = process.env.NODE_ENV === "development";

const target = process.env.TARGET || "chrome";
const environment = process.env.NODE_ENV || "development";

const manifestTemplate = JSON.parse(fs.readFileSync(resolve(`/manifest.json`)));

const manifestOptions = {
    firefox: {
        applications: {
            gecko: {
                id: pkgJson.name + "@mozilla.org",
            },
        },
    },
};

const manifest = Object.assign(
    {},
    manifestTemplate,
    target === "firefox" ? manifestOptions.firefox : {}
);

function resolve(dir) {
    return path.join(__dirname, "..", dir);
}

const webpackConfig = {
    node: false,
    entry: {
        background: resolve("src/background/index.ts"),
        facebook: resolve("src/contentscript/facebook.ts"),
        twitter: resolve("src/contentscript/twitter.ts"),
        options: [
            resolve("src/options/index.ts"),
            resolve(`src/assets/${target}-options.css`),
        ],
        popup: [
            resolve("src/popup/index.ts"),
            resolve(`src/assets/${target}-popup.css`),
        ],
    },
    output: {
        path: resolve(`build/${target}`),
        filename: "scripts/[name].js",
    },
    optimization: {
        splitChunks: false,
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        scss: "vue-style-loader!css-loader!sass-loader",
                    },
                },
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    transpileOnly: isDev,
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    "vue-style-loader",
                    "style-loader",
                    { loader: "css-loader", options: { importLoaders: 2 } },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                config: "postcss.config.js",
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: { sourceMap: true },
                    },
                ],
            },
            {
                test: /\.md$/,
                use: [
                    {
                        loader: "html-loader",
                    },
                    {
                        loader: "markdown-loader",
                        options: {
                            /* your options here */
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".vue"],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: resolve("/tsconfig.json"),
                extensions: [".ts", ".tsx", ".js", ".vue"],
            }),
        ],
        alias: {
            src: resolve("src"),
            lodash: "lodash-es",
        },
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyWepbackPlugin({
            patterns: [
                { from: resolve("public"), to: resolve(`build/${target}`) },
            ],
        }),
        new GenerateJsonPlugin(`manifest.json`, manifest),
        new MiniCssExtractPlugin(),
        new webpack.DefinePlugin({
            "process.env": require(`../env/${environment}.env`),
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "/tmp/report.html",
        }),
        new webpack.DefinePlugin({
            global: "window", // Placeholder for global used in any node_modules
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
    // stats: "minimal",
};

module.exports = {
    manifest,
    resolve,
    webpackConfig,
    target,
    pkgJson,
};
