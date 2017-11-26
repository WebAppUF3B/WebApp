'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
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
exports.update = function(req, res) {
  // Init Variables
  console.log(req.body);
  const user = req.body;

  //console.log(req.user);
  // For security measurement we remove the roles from the req.body object
  delete req.body.role;

  if (user) {
    User.findById(user._id)
      .then((userById) => {
        userById.firstName = user.firstName;
        userById.lastName = user.lastName;
        userById.gender = user.gender;
        userById.address = user.address;
        userById.updated = Date.now();
        return userById.save();
      })
      .then((result) => {
        //console.log('result here after saving', result);
        const minimalUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          birthday: user.birthday,
          email: user.email,
          role: user.role,
          address: user.address,
          _id: user._id
        };
        //Authentication.user = user;
        res.status(200).send({
          message: 'Profile updated',
          user: minimalUser
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: 'Update failed. Please contact an admin'
        });
      });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function(req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};


exports.getUser = function(req, res) {
  console.log('hi there');
  console.log(req.params.UserId);
  res.status(200);
  res.json(req.body);

};
