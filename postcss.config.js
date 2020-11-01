const purgecss = require("@fullhuman/postcss-purgecss")({
    content: ["./public/**/*.html", "./src/**/*.vue"],
    defaultExtractor: (content) => {
        const contentWithoutStyleBlocks = content.replace(
            /<style[^]+?<\/style>/gi,
            ""
        );
        return (
            contentWithoutStyleBlocks.match(
                /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
            ) || []
        );
    },
    whitelistPatterns: [
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!cursor-move).+-move$/,
        /^router-link(|-exact)-active$/,
    ],
});
module.exports = {
    syntax: "postcss-scss",
    plugins: [
        require("postcss-import"),
        require("tailwindcss"),
        require("autoprefixer"),
        require("cssnano")({
            preset: "default",
        }),
        ...[purgecss],
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
