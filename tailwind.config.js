import { addIconSelectors } from "@iconify/tailwind"
const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: '#0f54ff'
      }
    },
  },
  plugins: [
    addIconSelectors(["ri", "mingcute", "logos"]),
    iconsPlugin({
      // Select the icon collections you want to use
      // You can also ignore this option to automatically discover all individual icon packages you have installed
      // If you install @iconify/json, you should explicitly specify the collections you want to use, like this:
      collections: getIconCollections(["ri", "mingcute", "logos"]),
      // If you want to use all icons from @iconify/json, you can do this:
      // collections: getIconCollections("all"),
      // and the more recommended way is to use `dynamicIconsPlugin`, see below.
    }),
  ],
}

