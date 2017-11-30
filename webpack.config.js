const path = require('path');
const version = require('./package.json').version

function buildConfig(env) {
    const commonConfig = {
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
    }

    let envConfig;
    
    if (env === 'prod') {
        envConfig = {
            output: {
                path: path.resolve(__dirname, 'build', version),
                filename: './index.bundle.js',
                library: 'Acquisitions',
            },
        }
    }

    if (env === 'dev') {
        envConfig = {
            output: {
                path: path.resolve(__dirname, 'example'),
                filename: './index.bundle.js',
                library: 'Acquisitions',
            },
            devServer: {
                contentBase: path.resolve(__dirname, 'example'),
            }
        }
    }

    if (!envConfig) {
        throw 'usage: --env=[prod|dev]'
    }

    return Object.assign({}, commonConfig, envConfig)
}

module.exports = env => buildConfig(env)
