'use strict';

/**
 * Module dependencies.
 */
const adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function(app) {
  // User route registration first. Ref: #713
  //require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);

  app.route('/api/admin/approval')
    .get(admin.getWaitingUsers);
  app.route('/api/admin/approval/:userId')
    .put(admin.approveUser)
    .delete(admin.denyUser);
  app.route('/api/admin/getAllUsers')
    .get(admin.getAllUsers);
  app.route('/api/admin/editUser/:userId')
    .get(admin.getUser)
    .put(admin.editUser);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(admin.update)
    //.put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
