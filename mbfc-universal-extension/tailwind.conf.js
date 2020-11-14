// tailwind.config.js
module.exports = {
    important: true,
    purge: false,
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    theme: {
        customForms: (theme) => ({
            default: {
                input: {
                    borderRadius: theme("borderRadius.lg"),
                    backgroundColor: theme("colors.gray.200"),
                    "&:focus": {
                        backgroundColor: theme("colors.white"),
                    },
                },
                select: {
                    borderRadius: theme("borderRadius.lg"),
                    boxShadow: theme("boxShadow.default"),
                },
                checkbox: {
                    width: theme("spacing.6"),
                    height: theme("spacing.6"),
                },
            },
        }),
    },
    variants: {
        opacity: ["responsive", "hover"],
    },
    plugins: [
        require("@tailwindcss/custom-forms"),
        // function({ addBase, config }) {
        //   addBase({
        //     ".vue-form-generator": { fontSize: "14px" },
        //   });
        // },
    ],
};
