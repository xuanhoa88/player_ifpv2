var winston = require('winston');
var app = require('express')();
var PORT = process.env.PORT || 1447;

app.use(require('serve-webpack-client')({
  distPath: require('path').join(__dirname, 'dist'),
  indexFileName: 'index.html',
  webpackConfig: require('./webpack.config'),
}));

app.listen(PORT, (err) => {
  if (err) {
    winston.error(err);
    return;
  }

  winston.info(`Listening on port ${ require('chalk').yellow(PORT) }`);
});
