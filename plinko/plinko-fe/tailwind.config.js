/** @type {import('tailwindcss').Config} */
function range(start, end, increment = 1) {
  const count = Math.floor((end - start + increment) / increment);
  return Array(count)
    .fill(0)
    .map((_, idx) => start + idx * increment);
}

const minFontSize = 5;
const maxFontSize = 80;

const minSpacingPixel = 0;
const maxSpacingPixel = 800;
const spacingPixelIncrement = 5;

const vhs = ['10vh', '20vh', '30vh', '40vh', '50vh', '60vh', '70vh', '80vh', '90vh', '100vh'];
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    // Extend default configurations
    extend: {
      colors: {
        background: '#0a0e1a',
        inputbg: '#091016',
        primary: '#213743',
        secondary: '#3d5564',
        text: '#F2F7FF',
        purple: '#C52BFF',
        purpleDark: '#8D27B3',
        purpleDisable: '#522a60',
        green: '#47ef63',
        greenGrey: '#169e2d',
        greenDisable: '#71d080',
        blue: '#2280f6',
        blueGrey: '#0558c0',
        blueDisable: '#3274c7',
        red: '#fc3166',
        redGrey: '#ab153c',
        redDisable: '#ba375a',
        oddbg: '#112f21',
        oddText: '#4de35d',
        whiteDisable: '#7e7e7e',
        modalbg: 'rgba(0,0,0,0.5)'
      },
      container: {
        center: true,
      },
    },
    // Override default configurations
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 700,
      black: 900,
    },
    fontSize: {
      ...range(minFontSize, maxFontSize).reduce((merged, f) => ({ ...merged, [f]: `${f}px` }), {}),
    },
    spacing: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
    },
    maxWidth: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
    },
    minWidth: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
    },
    maxHeight: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
      ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {}),
    },
    minHeight: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
      ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {}),
    },
  },
  plugins: [],
};