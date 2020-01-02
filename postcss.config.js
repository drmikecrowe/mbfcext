const cssnano = require("cssnano");
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  syntax: "postcss-scss",
  plugins: [
    require("tailwindcss")("tailwind.conf.js"),
    require("autoprefixer"),
    cssnano({
      preset: "default",
    }),
    // purgecss({
    //   content: [
    //     "./public/**/*.html",
    //     "./public/**/*.css",
    //     "./src/**/*.vue",
    //     "./src/**/*.html",
    //     "./src/**/*.css",
    //     "./src/**/*.scss",
    //     "./src/**/*.sass",
    //     "./src/**/*.ts",
    //   ],
    //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    // }),
  ],
};
