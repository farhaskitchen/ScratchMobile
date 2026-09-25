const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScratchWebpackConfigBuilder = require('scratch-webpack-configuration');

// We consume scratch-gui as vendored source (vendor/scratch-gui/src), not the npm
// package, so we can eventually fork small pieces of it if the DOM-structural approach
// in app.jsx turns out too fragile. ScratchWebpackConfigBuilder gives us the same
// babel/css-modules/svg loader rules scratch-gui's own webpack config uses, so imports
// from vendor/scratch-gui/src resolve and compile identically to how they do upstream.

const config = new ScratchWebpackConfigBuilder(
    {
        rootPath: path.resolve(__dirname),
        enableReact: true,
        shouldSplitChunks: false,
        publicPath: 'auto'
    })
    .setTarget('browserslist')
    .merge({
        entry: {
            main: path.resolve(__dirname, 'src/index.js')
        },
        resolve: {
            alias: {
                'scratch-gui$': path.resolve(__dirname, 'vendor/scratch-gui/src/index.js'),
                'scratch-gui/src': path.resolve(__dirname, 'vendor/scratch-gui/src')
            },
            modules: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, 'vendor/scratch-gui/node_modules')
            ]
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].js'
        }
    })
    .addModuleRule({
        test: /\.(svg|png|wav|mp3|gif|jpg)$/,
        resourceQuery: /^$/, // reject any query string
        type: 'asset' // let webpack decide on the best type of asset
    })
    .addPlugin(new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        chunks: ['main']
    }))
    .get();

module.exports = config;
