'use strict';
const users = require('../controllers/users.server.controller');
const authUtils = require('../../../utils/authUtils');

module.exports = function (app) {
  // User Routes

  // Setting up the users profile api
  app.use(authUtils.authUser);
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
