const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const pkgJson = require("../package.json");

const CopyWepbackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
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
    target === "firefox" ? manifestOptions.firefox : {},
    environment === "development"
        ? {
              content_security_policy:
                  "script-src 'self' 'unsafe-eval' https://www.google-analytics.com; object-src 'self'",
          }
        : {
              content_security_policy:
                  "script-src 'self' https://www.google-analytics.com; object-src 'self'",
          }
);

function resolve(dir) {
    return path.join(__dirname, "..", dir);
}

const webpackConfig = {
    node: false,
    resolve: {
        fallback: {
            global: false,
        },
    },
    target: "web",
    entry: {
        background: resolve("src/background/index.ts"),
        facebook: resolve("src/contentscript/facebook.ts"),
        twitter: resolve("src/contentscript/twitter.ts"),
        options: [
            resolve("src/options/index.ts"),
            resolve(`src/assets/options.scss`),
            resolve(`src/assets/${target}-options.scss`),
        ],
        popup: [
            resolve("src/popup/index.ts"),
            resolve(`src/assets/popup.scss`),
            resolve(`src/assets/${target}-popup.scss`),
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
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    transpileOnly: isDev,
                },
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
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
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                use: ["file-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".mjs"],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: resolve("/tsconfig.json"),
                extensions: [".ts", ".tsx", ".js"],
            }),
        ],
        alias: {
            src: resolve("src"),
        },
    },
    plugins: [
        new CopyWepbackPlugin({
            patterns: [
                { from: resolve("public"), to: resolve(`build/${target}`) },
            ],
        }),
        new GenerateJsonPlugin(`manifest.json`, manifest),
        new MiniCssExtractPlugin(),
        new webpack.DefinePlugin({
            "process.env": require(`../env/${environment}.env`),
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
