/**
 * Created by mseeber on 7/4/17.
 */

var path = require('path');

module.exports = {
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
