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

// Get profile info
exports.getProfile = function(req, res) {
  User.findById(req.decodedUser._id, '-salt -password')
    .then((user) => {
      const minimalUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        birthday: user.birthday,
        address: user.address,
        position: user.position,
        _id: user._id
      };

      res.json(minimalUser);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * Update user details
 */
exports.update = function(req, res) {
  // Init Variables
  //console.log(req.body);
  const user = req.body;

  //console.log(req.user);
  // For security measurement we remove the roles from the req.body object
  delete req.body.role;

  if (user) {
    //console.log('user here');
    User.findById(user._id)
      .then((userById) => {
        //console.log('user here', userById);
        userById.firstName = user.firstName;
        userById.lastName = user.lastName;
        userById.gender = user.gender;
        userById.address = user.address;
        userById.position = user.position;
        userById.birthday = user.birthday;
        userById.updated = Date.now();
        //console.log('user updated  here', userById);

        return userById.save();
      })
      .then((result) => {
        //console.log('result here after saving', result);
        const minimalUser = {
          firstName: result.firstName,
          lastName: result.lastName,
          gender: result.gender,
          birthday: result.birthday,
          email: result.email,
          role: result.role,
          position: result.position,
          address: result.address,
          _id: result._id
        };
        //Authentication.user = user;
        res.status(200).send({
          message: 'Profile updated',
          user: minimalUser
        });
      })
      .catch((err) => {
        console.log('Err updating profile:', err);
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
