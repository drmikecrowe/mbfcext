/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "system-ui"],
      serif: ["Georgia", "serif"],
    },
    extend: {
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  variants: {
    opacity: ["responsive", "hover"],
  },
}
