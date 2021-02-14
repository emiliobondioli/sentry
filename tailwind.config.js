const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
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
        darkest: "#1f2d3d",
        dark: "#3c4858",
        DEFAULT: "#1C2541",
        light: "#e0e6ed",
        lightest: "#f9fafc",
      },
      black: {
        DEFAULT: "#0B132B",
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
