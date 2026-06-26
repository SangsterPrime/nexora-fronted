const webpack = require('webpack')
const { existsSync } = require('fs')

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
if (!process.env.CHROME_BIN && existsSync(edgePath)) {
  process.env.CHROME_BIN = edgePath
}

module.exports = function configureKarma(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-webpack'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    files: [
      'src/test/setupTests.js',
      'src/test/**/*.spec.jsx',
    ],
    preprocessors: {
      'src/test/setupTests.js': ['webpack'],
      'src/test/**/*.spec.jsx': ['webpack'],
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
          assert: false,
          buffer: false,
          crypto: false,
          fs: false,
          path: false,
          stream: false,
          util: false,
        },
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false,
            },
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(webp|png|jpe?g|gif|svg|mp4)$/,
            type: 'asset/resource',
          },
        ],
      },
      plugins: [
        new webpack.DefinePlugin({
          'import.meta.env.VITE_API_URL': JSON.stringify(''),
          'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''),
        }),
      ],
    },
    webpackMiddleware: {
      stats: 'errors-only',
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['ChromeHeadless'],
    singleRun: false,
    autoWatch: true,
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
      ],
    },
    client: {
      clearContext: false,
    },
  })
}
