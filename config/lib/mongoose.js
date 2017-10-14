'use strict';

/**
 * Module dependencies.
 */
const config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function (callback) {
  // Globbing model files
  config.files.server.models.forEach((modelPath) => {
    require(path.resolve(modelPath)); // eslint-disable-line global-require
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (cb) {
  const _this = this;
  console.log('db:', process.env.MONGOLAB_URI);
  const db = mongoose.connect(config.db.uri, config.db.options,(err) => {
    // Log Error
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {

      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (cb) cb(db);
    }
  });
};

module.exports.disconnect = function (cb) {
  mongoose.disconnect((err) => {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};
