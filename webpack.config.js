
module.exports = {
    entry: {
        index: './index.js',
    },
    output: {
        filename: './[name].bundle.js',
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