const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
    entry: {
        main: "./src/index.js",
        component: "./iFrameComponent/component/logic_visualizer.js"
    },
    mode: "production",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /locales/,
                loader: '@alienfast/i18next-loader',
                query: {basenameAsNamespace: true}
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "bundle.css"
                        }
                    },
                    {loader: "extract-loader"},
                    {loader: "css-loader"},
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [autoprefixer()]
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                includePaths: ["./node_modules"]
                            },
                            webpackImporter: false
                        }
                    }
                ]
            }
        ]
    }
};
