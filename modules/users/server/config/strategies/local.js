'use strict';

/**
 * Module dependencies.
 */
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function() {
  // Use local strategy

  const signInErr = {
    message: 'Invalid email or password',
    code: 400
  };

  const notVerifiedErr = {
    message: 'Email has not been verified',
    code: 400
  };

  const notAdminApproved = {
    message: 'Researchers and Faculty members require admin approval before log in.',
    code: 400
  };

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    User.findOne({
      email: email.toLowerCase()
    }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user || !user.authenticate(password)) {
        return done(null, false, signInErr);
      }

      if ((user.role === 'researcher' || user.role === 'faculty') && !user.adminApproved) {
        return done(null, false, notAdminApproved);
      }

      if (!user.emailValidated) {
        return done(null, false, notVerifiedErr);
      }

      return done(null, user);
    });
  }));
};
