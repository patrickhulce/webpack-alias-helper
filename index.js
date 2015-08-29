var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var updateMappingForFolder = function (options, mapping, moduleName, srcPath) {
  return function (folder) {
    var potentialFiles = options.filenames.map(function (nameTemplate) {
      return path.join(
        srcPath,
        folder,
        nameTemplate.replace('[folder]', folder)
      );
    }).filter(fs.existsSync);

    if (potentialFiles.length) {
      mapping[moduleName + '/' + folder] = potentialFiles[0];
    }
  };
};

module.exports = function (options) {
  if (typeof options === 'string') {
    options = {
      root: options
    };
  }

  options = _.extend({
    root: path.join(__dirname + '../node_modules'),
    srcPath: 'src',
    filenames: ['index.js', '[folder].js']
  }, options);

  return {
    modules: function (moduleNames) {
      var mapping = {};
      moduleNames.forEach(function (moduleName) {
        var srcPath = path.join(options.root, moduleName, options.srcPath);
        fs.readdirSync(srcPath).filter(function (file) {
          return fs.statSync(path.join(srcPath, file)).isDirectory();
        }).forEach(updateMappingForFolder(options, mapping, moduleName, srcPath));
      });
      return mapping;
    }
  };
};
