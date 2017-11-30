
const path = require('path');
const version = require('./package.json').version

module.exports = {
    entry: {
        index: './index.js',
    },
    output: {
        path: path.resolve(__dirname, 'build', version),
        filename: './index.bundle.js',
        library: "Acquisitions",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            },
        ]
    }
}