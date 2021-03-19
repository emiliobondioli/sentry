const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      current: "currentColor",
      green: {
        light: "#6FFFE9",
        DEFAULT: "#5BC0BE",
        dark: "#3A506B",
      },
      blue: {
        light: "#6FCBFF",
        DEFAULT: "#5B83C0",
        dark: "#5174AA",
      },
      red: {
        light: "#FF6F92",
        DEFAULT: "#C05B73",
        dark: "#9F4C60",
      },
      white: colors.white,
      gray: {
        darkest: "#343A40",
        dark: "#495057",
        DEFAULT: "#6C757D",
        light: "#CED4DA",
        lightest: "#DEE2E6",
      },
      black: {
        DEFAULT: "#212529",
        dark: '#1B1F22'
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      borderWidth: ["first", "last"],
    },
  },
  plugins: [],
};
