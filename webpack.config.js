// Import/require libraries
// -----------------------------------------------------------------------------

const webpack = require('webpack'); // Lib Webpack
const path = require('path'); // Ayuda con las rutas de los directorios
const merge = require('webpack-merge'); // Fusiona objetos y creo uno nuevo
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // Extrae los archivos de los bundles y los saca separados
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Ayuda con los archivos HTML, como incluir otros y demás
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin'); // Añade los atributos 'async', 'preload', 'prefetch', 'defer', 'module' o customs
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin'); // Ordena identación código
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // Minifica, comprime, etc.
const fs = require('fs'); // File system


// Functions
// -----------------------------------------------------------------------------

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split('.');
        const name = parts[0];
        const extension = parts[1];
        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
        });
    });
}


// Variables
// -----------------------------------------------------------------------------

const basePath = __dirname;
const env = process.env.NODE_ENV;
const localMode = process.env.LOCAL_MODE;
const htmlPlugins = generateHtmlPlugins('./src/templates/pages');


// Common config
// -----------------------------------------------------------------------------

const common = {
    context: path.join(basePath, './src'),
    entry: {
        app: [
            './assets/js/app.js',
            './assets/scss/app.scss'
        ],
    },
    output: {
        path: path.join(basePath, './dist'),
        filename: 'assets/js/[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.json', '.scss', '.pug'],
        alias: {
            node_modules: path.join(basePath, './node_modules'),
            data: path.join(basePath, '.src/data'),
            assets: path.join(basePath, './src/assets'),
            modules: path.join(basePath, './src/assets/js/modules'),
            layouts: path.join(basePath, './src/templates/layouts'),
            pages: path.join(basePath, './src/templates/pages'),
            partials: path.join(basePath, './src/templates/partials'),
            mixins: path.join(basePath, './src/templates/mixins'),
        }
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                exclude: /(a-z A-Z 0-9)*\/fonts\//,
                use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'assets/img/[name].[ext]'
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                        },
                    },
                ],
            },
            {
                test: /\.(eot|ttf|svg|woff|woff2)$/i,
                exclude: /(a-z A-Z 0-9)*\/(img|images)\//,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'assets/fonts/[name].[ext]'
                    },
                }],
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                options: {
                    pretty: true,
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: {
                        loader: 'css-loader'
                    },
                }),
            },
            {
                test: /\.(scss)$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    fallback: ['style-loader'],
                    use: [{
                            loader: 'css-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                config: {
                                    path: './postcss.config.js'
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                        },
                    ],
                }),
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'assets/css/[name].css',
            disable: false,
            allChunks: true,
        }),
        new HtmlBeautifyPlugin({
            config: {
                html: {
                    end_with_newline: true,
                    indent_size: 4,
                    indent_with_tabs: true,
                    indent_inner_html: true,
                    preserve_newlines: true,
                    unformatted: ['p', 'i', 'strong', 'span', 'p > a']
                }
            }
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: 'vendor',
            minChunks: ({
                resource
            }) => /node_modules/.test(resource),
        }),
        new webpack.optimize.CommonsChunkPlugin('manifest'),
    ].concat(htmlPlugins)
};


// Dev config
// -----------------------------------------------------------------------------

if (env === 'dev') {
    module.exports = merge(common, {
        devtool: 'inline-source-map',
        devServer: {
            port: 8080,
        },
    });
}


// Production config
// -----------------------------------------------------------------------------

if (env === 'production') {
    module.exports = merge(common, {
        plugins: [
            new UglifyJsPlugin({
                test: /\.js($|\?)/i,
            }),
        ]
    });
}