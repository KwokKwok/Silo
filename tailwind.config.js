import { addIconSelectors } from "@iconify/tailwind"
const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")


const _round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
const round = (num) => _round(num)
const rem = (px) => `${_round(px / 16)}rem`
const em = (px, base, ratio) => `${_round(px / base * ratio)}em`

const SPACING_RATIO = 0.6;
const LINE_HEIGHT_RATIO = 0.9;


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./entrypoints/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: '#0f54ff'
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)'
      },
      transitionProperty: {
        'visible': 'transform, opacity',
      },
      typography: {
        sm: {
          css: [
            {
              fontSize: rem(14),
              lineHeight: round(24 / 14 * LINE_HEIGHT_RATIO),
              p: {
                marginTop: em(16, 14, SPACING_RATIO),
                marginBottom: em(16, 14, SPACING_RATIO),
              },
              '[class~="lead"]': {
                fontSize: em(18, 14),
                lineHeight: round(28 / 18 * LINE_HEIGHT_RATIO),
                marginTop: em(16, 18, SPACING_RATIO),
                marginBottom: em(16, 18, SPACING_RATIO),
              },
              blockquote: {
                marginTop: em(24, 18, SPACING_RATIO),
                marginBottom: em(24, 18, SPACING_RATIO),
                paddingInlineStart: em(20, 18, SPACING_RATIO),
              },
              h1: {
                fontSize: em(30, 14),
                marginTop: '0',
                marginBottom: em(24, 30, SPACING_RATIO),
                lineHeight: round(36 / 30 * LINE_HEIGHT_RATIO),
              },
              h2: {
                fontSize: em(20, 14),
                marginTop: em(32, 20, SPACING_RATIO),
                marginBottom: em(16, 20, SPACING_RATIO),
                lineHeight: round(28 / 20 * LINE_HEIGHT_RATIO),
              },
              h3: {
                fontSize: em(18, 14),
                marginTop: em(28, 18, SPACING_RATIO),
                marginBottom: em(8, 18, SPACING_RATIO),
                lineHeight: round(28 / 18 * LINE_HEIGHT_RATIO),
              },
              h4: {
                marginTop: em(20, 14, SPACING_RATIO),
                marginBottom: em(8, 14, SPACING_RATIO),
                lineHeight: round(20 / 14 * LINE_HEIGHT_RATIO),
              },
              img: {
                marginTop: em(24, 14, SPACING_RATIO),
                marginBottom: em(24, 14, SPACING_RATIO),
              },
              picture: {
                marginTop: em(24, 14, SPACING_RATIO),
                marginBottom: em(24, 14, SPACING_RATIO),
              },
              'picture > img': {
                marginTop: '0',
                marginBottom: '0',
              },
              video: {
                marginTop: em(24, 14, SPACING_RATIO),
                marginBottom: em(24, 14, SPACING_RATIO),
              },
              kbd: {
                fontSize: em(12, 14),
                borderRadius: rem(5),
                paddingTop: em(2, 14, SPACING_RATIO),
                paddingInlineEnd: em(5, 14, SPACING_RATIO),
                paddingBottom: em(2, 14, SPACING_RATIO),
                paddingInlineStart: em(5, 14, SPACING_RATIO),
              },
              code: {
                fontSize: em(12, 14),
              },
              'h2 code': {
                fontSize: em(18, 20),
              },
              'h3 code': {
                fontSize: em(16, 18),
              },
              pre: {
                fontSize: em(12, 14),
                lineHeight: round(20 / 12 * LINE_HEIGHT_RATIO),
                marginTop: em(20, 12, SPACING_RATIO),
                marginBottom: em(20, 12, SPACING_RATIO),
                borderRadius: rem(4),
                paddingTop: em(8, 12, SPACING_RATIO),
                paddingInlineEnd: em(12, 12, SPACING_RATIO),
                paddingBottom: em(8, 12, SPACING_RATIO),
                paddingInlineStart: em(12, 12, SPACING_RATIO),
              },
              ol: {
                marginTop: em(16, 14, SPACING_RATIO),
                marginBottom: em(16, 14, SPACING_RATIO),
                paddingInlineStart: em(22, 14, SPACING_RATIO),
              },
              ul: {
                marginTop: em(16, 14, SPACING_RATIO),
                marginBottom: em(16, 14, SPACING_RATIO),
                paddingInlineStart: em(22, 14, SPACING_RATIO),
              },
              li: {
                marginTop: em(4, 14, SPACING_RATIO),
                marginBottom: em(4, 14, SPACING_RATIO),
              },
              'ol > li': {
                paddingInlineStart: em(6, 14, SPACING_RATIO),
              },
              'ul > li': {
                paddingInlineStart: em(6, 14, SPACING_RATIO),
              },
              '> ul > li p': {
                marginTop: em(8, 14, SPACING_RATIO),
                marginBottom: em(8, 14, SPACING_RATIO),
              },
              '> ul > li > p:first-child': {
                marginTop: em(16, 14, SPACING_RATIO),
              },
              '> ul > li > p:last-child': {
                marginBottom: em(16, 14, SPACING_RATIO),
              },
              '> ol > li > p:first-child': {
                marginTop: em(16, 14, SPACING_RATIO),
              },
              '> ol > li > p:last-child': {
                marginBottom: em(16, 14, SPACING_RATIO),
              },
              'ul ul, ul ol, ol ul, ol ol': {
                marginTop: em(8, 14, SPACING_RATIO),
                marginBottom: em(8, 14, SPACING_RATIO),
              },
              dl: {
                marginTop: em(16, 14, SPACING_RATIO),
                marginBottom: em(16, 14, SPACING_RATIO),
              },
              dt: {
                marginTop: em(16, 14, SPACING_RATIO),
              },
              dd: {
                marginTop: em(4, 14, SPACING_RATIO),
                paddingInlineStart: em(22, 14, SPACING_RATIO),
              },
              hr: {
                marginTop: em(40, 14, SPACING_RATIO),
                marginBottom: em(40, 14, SPACING_RATIO),
              },
              'hr + *': {
                marginTop: '0',
              },
              'h2 + *': {
                marginTop: '0',
              },
              'h3 + *': {
                marginTop: '0',
              },
              'h4 + *': {
                marginTop: '0',
              },
              table: {
                fontSize: em(12, 14),
                lineHeight: round(18 / 12 * LINE_HEIGHT_RATIO),
              },
              'thead th': {
                paddingInlineEnd: em(12, 12, SPACING_RATIO),
                paddingBottom: em(8, 12, SPACING_RATIO),
                paddingInlineStart: em(12, 12, SPACING_RATIO),
              },
              'thead th:first-child': {
                paddingInlineStart: '0',
              },
              'thead th:last-child': {
                paddingInlineEnd: '0',
              },
              'tbody td, tfoot td': {
                paddingTop: em(8, 12, SPACING_RATIO),
                paddingInlineEnd: em(12, 12, SPACING_RATIO),
                paddingBottom: em(8, 12, SPACING_RATIO),
                paddingInlineStart: em(12, 12, SPACING_RATIO),
              },
              'tbody td:first-child, tfoot td:first-child': {
                paddingInlineStart: '0',
              },
              'tbody td:last-child, tfoot td:last-child': {
                paddingInlineEnd: '0',
              },
              figure: {
                marginTop: em(24, 14, SPACING_RATIO),
                marginBottom: em(24, 14, SPACING_RATIO),
              },
              'figure > *': {
                marginTop: '0',
                marginBottom: '0',
              },
              figcaption: {
                fontSize: em(12, 14),
                lineHeight: round(16 / 12 * LINE_HEIGHT_RATIO),
                marginTop: em(8, 12, SPACING_RATIO),
              },
            },
            {
              '> :first-child': {
                marginTop: '0',
              },
              '> :last-child': {
                marginBottom: '0',
              },
            },
          ],
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
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

