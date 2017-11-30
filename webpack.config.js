const path = require('path');
const version = require('./package.json').version

module.exports = {
    entry: {
        index: './index.js',
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
    },
    output: {
        path: path.resolve(__dirname, 'build', version),
        filename: './index.bundle.js',
        library: 'Acquisitions',
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'example'),
    }
}
