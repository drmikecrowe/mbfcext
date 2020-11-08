/* eslint-disable global-require */
const postcssPresetEnv = require("postcss-preset-env");

const purgecss = require("@fullhuman/postcss-purgecss")({
    content: ["./public/**/*.html", "./src/**/*.tsx"],
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
        require("tailwindcss")(`${__dirname}/tailwind.conf.js`),
        postcssPresetEnv({ stage: 1 }),
        ...[purgecss],
    ],
};
