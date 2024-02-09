/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: (function () {
        let list = ['h-[210px]'];

        for (let i = 1; i <= 1440; i++) {
            list.push('row-start-[' + i + ']');
            list.push('row-end-[' + i + ']');
        }

        return list;
    })(),
};
