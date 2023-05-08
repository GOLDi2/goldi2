const colors = require('tailwindcss/colors')

/* Color Palette: https://palettte.app/
[
  {
    "paletteName": "Orange",
    "swatches": [
      {
        "name": "900",
        "color": "993C12"
      },
      {
        "name": "800",
        "color": "B44E18"
      },
      {
        "name": "700",
        "color": "D46421"
      },
      {
        "name": "600",
        "color": "E67528"
      },
      {
        "name": "500",
        "color": "EE822D"
      },
      {
        "name": "400",
        "color": "F58F34"
      },
      {
        "name": "300",
        "color": "FD9F3E"
      },
      {
        "name": "200",
        "color": "FDAE52"
      },
      {
        "name": "100",
        "color": "FFCA89"
      },
      {
        "name": "50",
        "color": "FFF1DD"
      }
    ]
  },
  {
    "paletteName": "Blue",
    "swatches": [
      {
        "name": "900",
        "color": "06152A"
      },
      {
        "name": "800",
        "color": "0B2141"
      },
      {
        "name": "700",
        "color": "152F59"
      },
      {
        "name": "600",
        "color": "233F70"
      },
      {
        "name": "500",
        "color": "365287"
      },
      {
        "name": "400",
        "color": "4E689F"
      },
      {
        "name": "300",
        "color": "6D83B6"
      },
      {
        "name": "200",
        "color": "90A1CD"
      },
      {
        "name": "100",
        "color": "B9C4E5"
      },
      {
        "name": "50",
        "color": "E6EBFC"
      }
    ]
  }
]
*/

module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    colors: {
      black: colors.black,
      white: colors.white,
      primary: {
        DEFAULT: '#06152A', // 900
        '900': '#06152A',
        '800': '#0B2141',
        '700': '#1C355D',//'#152F59',
        '600': '#233F70',
        '500': '#365287',
        '400': '#4E689F',
        '300': '#6D83B6',
        '200': '#90A1CD',
        '100': '#B9C4E5',
        '50': '#E6EBFC',
      },
      secondary: {
        DEFAULT: '#FD9F3E', // 300
        '900': '#993C12',
        '800': '#B44E18',
        '700': '#D46421',
        '600': '#E67528',
        '500': '#EE822D',
        '400': '#F58F34',
        '300': '#FD9F3E',
        '200': '#FDAE52',
        '100': '#FFCA89',
        '50': '#FFF1DD',
      },
    },
    boxShadow: {
      DEFAULT: '0px 1px 6px 0px rgba(67, 67, 74, 0.3)',
      'l': '0px 1px 13px 0px rgba(67, 67, 74, 0.4)',
      'inset': 'inset 0px 1px 6px 0px rgba(67, 67, 74, 0.3)',
      'inset-l': 'inset 0px 1px 13px 0px rgba(67, 67, 74, 0.4)',
    },
    fontFamily: {
      body: 'Roboto Flex',
    },
  },
  plugins: [],
}