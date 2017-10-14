'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  let user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save((err) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      req.login(user, (err) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  const user = req.user;
  const message = null;
  const upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  const profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter; // eslint-disable-line global-require
  
  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, (uploadError) => {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      }
      user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

      user.save((saveError) => {
        if (saveError) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(saveError)
          });
        }
        req.login(user, (err) => {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      });
    });
  }
  res.status(400).send({
    message: 'User is not signed in'
  });
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
