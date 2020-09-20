const path = require('path');
const fs = require('fs');
const PostCSSPresetEnv = require('postcss-preset-env');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

Object.fromEntries = (arr) =>
  Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));

const examples = fs
  .readdirSync(path.resolve(__dirname, 'src/examples'))
  .filter((fileName) => fileName.endsWith('.js'));

const entries = Object.fromEntries(
  examples.map((page) => [
    page.split('.')[0],
    path.resolve(__dirname, `src/examples/${page}`)
  ])
);

module.exports = {
  mode: 'development',
  watch: true,
  stats: { colors: true },
  // Can't use faster eval due to a bug with MiniCssExtractPlugin
  // see https://github.com/webpack-contrib/mini-css-extract-plugin/issues/29
  devtool: 'cheap-module-source-map',
  entry: {
    index: [
      path.resolve(__dirname, 'src/assets/scripts/index.js'),
      path.resolve(__dirname, 'src/assets/styles/index.scss')
    ],
    ...entries
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/assets'),
    publicPath: '/assets/'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    // Will create a `webpack.njk` with the css/jss files
    // that then gets picked up by eleventy
    ...examples.map(page => new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'webpack.html'),
      filename: `${page.split('.')[0]}.njk`,
      hash: true,
      inject: false
    })),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      // Loads all image files; no minfication
      {
        test: /\.(png|svg|jpe?g|gif|ico)$/i,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'images/',
            name: '[name].[ext]',
            esModule: false
          }
        }
      },
      // Loads all audio files
      {
        test: /\.(ogg|wma|mp3|wav|mpe?g)$/i,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'audio/',
            // name: "[name].[contenthash].[ext]"
            name: '[name].[ext]',
            esModule: false
          }
        }
      },
      // Loads all font files
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'fonts/',
            name: '[name].[ext]',
            esModule: false
          }
        }
      },
      // Loads all 3D model files; add more based on your needs
      {
        test: /\.(obj|gltf|drc|mtl|glb)$/i,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'models/',
            name: '[name].[ext]',
            esModule: false
          }
        }
      },
      {
        test: /\.s?css/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            // Does not respect devtools option
            // https://github.com/webpack-contrib/css-loader/issues/622
            options: { sourceMap: true }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [PostCSSPresetEnv],
              // Does not respect devtools option
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[contenthash].[ext]',
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  }
};
