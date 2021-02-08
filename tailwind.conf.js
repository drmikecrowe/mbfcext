// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

const fontFamily = defaultTheme.fontFamily;
fontFamily["sans"] = [
  "Roboto", // <-- Roboto is a default sans font now
  "system-ui",
  // <-- you may provide more font fallbacks here
];

module.exports = {
  important: true,
  purge: false,
  theme: {
    fontFamily: fontFamily, // <-- this is where the override is happening
    extend: {},
  },
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
