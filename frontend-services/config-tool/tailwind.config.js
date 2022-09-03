const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.ts'],
  theme: {
    colors: {
      black: '#242728',
      white: colors.white,
      gray: colors.gray,
      primary: '#f2ab55',
      secondary: {
        DEFAULT: '#7ea1c4',
        'light': '#e8eef3',
        'lighter': '#f5f8fc',
        'light-middle':'#7E9AC4',
        'middle': '#3F4F8D',
        'dark': '#1c355d',
        'darkblue':'#06152a',

        'primary-hover':'#EF9C01',
        'light-middle-hover':'#3B65A5',

        'footer-black': '#191616',
      },
    },
    fontFamily: {
      body: 'Roboto Condensed',
    }  
  },
  plugins: [],
}