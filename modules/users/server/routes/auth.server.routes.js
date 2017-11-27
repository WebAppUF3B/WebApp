'use strict';

/**
 * Module dependencies.
 */
const passport = require('passport');
const users = require('../controllers/users.server.controller');

// User Routes
module.exports = function(app) {

  // Setting up the users authentication api
  app.route('/api/auth/signup').post(users.signup);
  app.route('/api/auth/signup/faculty').post(users.facultySignup);
  app.route('/api/auth/signup/researcher').post(users.researcherSignup);
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);

  app.route('/api/auth/verify/:id').post(users.verify);

  app.route('/api/profile/')
  .get(users.getProfile)
  .put(users.update);
};
