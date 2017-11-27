'use strict';

/**
 * Module dependencies.
 */
const admin = require('../controllers/admin.server.controller');

module.exports = function(app) {
  // User route registration first. Ref: #713
  //require('./users.server.routes.js')(app);

  app.route('/api/admin/approval')
    .get(admin.getWaitingUsers);
  app.route('/api/admin/approval/:userId')
    .put(admin.approveUser)
    .delete(admin.denyUser);

  // Single user routes
  app.route('/api/users/:userId')
    .get(admin.read)
    .put(admin.update);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
