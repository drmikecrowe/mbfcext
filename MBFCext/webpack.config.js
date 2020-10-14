var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs"),
  env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 3000,
  },
  { CleanWebpackPlugin } = require("clean-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  WriteFilePlugin = require("write-file-webpack-plugin"),
  ExtensionReloader = require("webpack-extension-reloader");

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js");

var fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    options: path.join(__dirname, "src", "options.ts"),
    background: path.join(__dirname, "src", "background.ts"),
    popup: path.join(__dirname, "src", "popup.ts"),
    facebook: path.join(__dirname, "src", "inject-facebook.ts"),
    twitter: path.join(__dirname, "src", "inject-twitter.ts"),
  },
  output: {
    path: path.join(__dirname, "build/chrome"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
        exclude: /node_modules/,
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: alias,
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "options.html"),
      filename: "options.html",
      chunks: ["options"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "background.html"),
      filename: "background.html",
      chunks: ["background"],
    }),
    new WriteFilePlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: "node_modules/chrome-options",
          from: "dist/main.min.js",
          to: "options/main.min.js",
        },
        {
          context: "node_modules/chrome-options",
          from: "dist/styles.min.js",
          to: "options/styles.min.js",
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [{ context: "public", from: ".", to: "." }],
    }),
  ],
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
  options.plugins.push(
    new ExtensionReloader({
      reloadPage: true, // Force the reload of the page also
      entries: {
        // The entries used for the content/background scripts or extension pages
        contentScript: ["facebook", "twitter"],
        background: "background",
        extensionPage: "popup",
      },
    })
  );
}

module.exports = options;
