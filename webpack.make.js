'use strict';

// Modules
var yargs = require('yargs');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer-core');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var devMode = !(process.env.NODE_ENV === 'production');

module.exports = function (options) {
    /**
     * Environment type
     * BUILD is for generating minified builds
     * TEST is for generating test builds
     */
    var BUILD = !!options.BUILD;
    var TEST = !!options.TEST;

    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    var config = {
        context: path.join(__dirname, 'src')
    };

    /**
     * Entry
     * Reference: http://webpack.github.io/docs/configuration.html#entry
     * Should be an empty object if it's generating a test build
     * Karma will set this when it's a test build
     */
    if (BUILD) {
        config.entry = {
            app: ((sources) => {

                if (devMode) {
                    sources.push('webpack-hot-middleware/client');
                }

                return sources;
            })([
                path.join(__dirname, 'src', 'app.js')
            ])
       };
    }

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     * Should be an empty object if it's generating a test build
     * Karma will handle setting it up for you when it's a test build
     */
    config.output = {};
    if (BUILD) {
        config.output = {
            // Absolute output directory
            path: path.join(__dirname, 'dist'),

            // Output path from the view of the page
            // publicPath: '/',

            // Filename for entry points
            // Only adds hash in build mode
            filename: '[name].[hash].js',

            // The filename of the SourceMaps 
            // for the JavaScript files
            sourceMapFilename: '[name].[hash].js.map',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: '[id].chunk.js'
        }
    }

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (TEST) {
        config.devtool = 'inline-source-map';
    } else {
        config.devtool = devMode ? 'eval' : 'source-map';
    }

    /**
     * Loaders
     * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */

    // Initialize module
    config.module = {
        preLoaders: [],
        loaders: [{
            // JS LOADER
            // Reference: https://github.com/babel/babel-loader
            // Transpile .js files using babel-loader
            // Compiles ES6 and ES7 into ES5 code
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        },
        {
            // JSON LOADER
            // Reference: https://www.npmjs.com/package/json-loader
            // Transpile .json files using json-loader
            // Compiles ES6 and ES7 into ES5 code
            test: /\.json$/,
            loaders: ['json'],
        }, {
            // ASSET LOADER
            // Reference: https://github.com/webpack/url-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(png|jpg|jpeg|gif|svg|woff(2)?|ttf|eot)(.*)?$/,
            loader: 'url?prefix=assets/'
        }, {
            // HTML LOADER
            // Reference: https://github.com/webpack/raw-loader
            // Allow loading html through js
            test: /\.html$/,
            loader: 'raw'
        }]
    };

    // ISPARTA LOADER
    // Reference: https://github.com/ColCh/isparta-instrumenter-loader
    // Instrument JS files with Isparta for subsequent code coverage reporting
    // Skips node_modules and files that end with .test.js
    if (TEST) {
        config.module.preLoaders.push({
            test: /\.js$/,
            exclude: [
                /node_modules/,
                /\.test\.js$/
            ],
            loader: 'isparta'
        });
    }

    // Loading css in build mode
    if (BUILD) {
        // CSS LOADER
        // Reference: https://github.com/webpack/css-loader
        // Allow loading css through js
        //
        // Reference: https://github.com/postcss/postcss-loader
        // Postprocess your css with PostCSS plugins
        config.module.loaders.push({
            test: /\.css$/,
            // Reference: https://github.com/webpack/extract-text-webpack-plugin
            // Extract css files in production builds
            //
            // Reference: https://github.com/webpack/style-loader
            // Use style-loader in development for hot-loading
            loaders: ['style', 'css', 'postcss', 'cssnext'],
        });

        config.module.loaders.push({
            test: /\.(scss|sass)$/,
            loaders: ['style', 'css', 'postcss', 'sass']
        });

        config.module.loaders.push({
            test: /\.less$/,
            loaders: ['style', 'css', 'postcss', 'less']
        });

        /**
         * PostCSS
         * Reference: https://github.com/postcss/autoprefixer-core
         * Add vendor prefixes to your css
         */
        config.postcss = [
            autoprefixer({
                browsers: ['last 2 version']
            })
        ];
    }

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [];
    if (BUILD) {        
        config.plugins.push(
            // recommended by webpack
            new webpack.optimize.OccurenceOrderPlugin(),

            // Reference: https://webpack.github.io/docs/hot-module-replacement.html
            new webpack.HotModuleReplacementPlugin(),

            // Reference: https://github.com/ampedandwired/html-webpack-plugin
            // Render index.html
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'src', 'index.html'),
                inject: 'body'
            }),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
            // Only emit files when there are no errors
            new webpack.NoErrorsPlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
            // Dedupe modules in the output
            new webpack.optimize.DedupePlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin(),

            // Add custom configuration
            new webpack.DefinePlugin({
                'process.env': JSON.stringify(Object.assign({
                    NODE_ENV: process.env.NODE_ENV || 'development',
                    OFFLINE_MODE: !!yargs.argv.OFFLINE_MODE,
                    HYBRID: !!yargs.argv.HYBRID,
                    API: yargs.argv.API
                })),
            }),

            // Reference: https://www.npmjs.com/package/copy-webpack-plugin
            // Copy files and directories in webpack
            new CopyWebpackPlugin([
                { from: 'assets/**/*' },
                { from: '.htaccess' }
            ])
        );
    }

    return config;
};