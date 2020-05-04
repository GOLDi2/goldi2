/**
 * Created by mseeber on 5/23/17.
 */

module.exports = {
    entry: "./beast.ts",  //the entry point of the application
    devtool: "source-map",
    output: {
        path: __dirname + "/build",
        filename: "beast.js"
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};