/**
 * Created by mseeber on 7/4/17.
 */

var path = require('path');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
    plugins: [
        new TypedocWebpackPlugin({
            includeDeclarations: false,
            ignoreCompilerErrors: true,
            exclude: '**/node_modules/**/*.*',
            module: 'commonjs',
            target : 'es6',
            name : 'BEAST',
            mode : 'file',
            theme : 'default',
        },
            ['./js'] //input directories
        )
    ],
    entry: './js/controller/BeastController.ts',
    module: {
        rules: [
            {
                //rule for tsx tests, currently not needed
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        // bundling BEAST with webpack is not implemented yet
        // but webpack requires an output file
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
};
