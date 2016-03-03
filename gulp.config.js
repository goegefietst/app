module.exports = function() {
  'use strict';
  var config = {
    bower: {
      json: require('./bower.json'),
      directory: './www/lib/',
      ignorePath: '../..'
    }
  };

  config.getWiredepDefaultOptions = function() {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };

  return config;
};
