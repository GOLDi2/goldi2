const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    colors: {
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      primary: '#f2ab55',
      secondary: {
        DEFAULT: '#7ea1c4',
        'light': '#e8eef3',
        'lighter': '#f5f8fc',
        'dark': '#1c355d',
        'darkblue':'#06152a',
      },
    },
    fontFamily: {
      body: 'Roboto Condensed',
    }  
  },
  plugins: [],
}