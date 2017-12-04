module.exports = {

  entry: './src/state_machine.ts',
  
  output: {
    filename: './dist/state_machine.js',
  },
  
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js']
  },
  
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
  
}