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
        _id: user._id,
        role: user.role
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
  const user = req.body;
  // For security measurement we remove the roles from the req.body object
  delete req.body.role;

  if (user) {
    User.findById(user._id)
      .then((userById) => {
        userById.firstName = user.firstName;
        userById.lastName = user.lastName;
        userById.gender = user.gender;
        userById.address = user.address;
        userById.position = user.position;
        userById.birthday = user.birthday;
        userById.updated = Date.now();

        return userById.save();
      })
      .then((result) => {
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
        return res.status(400).send({
          message: 'Update failed. Please contact an admin'
        });
      });
  }
};
