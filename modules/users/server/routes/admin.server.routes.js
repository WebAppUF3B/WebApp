/*~*/
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
  app.route('/api/admin/getAllUsers')
    .get(admin.getAllUsers);
  app.route('/api/admin/editUser/:userId')
    .get(admin.getUser)
    .put(admin.editUser);
  app.route('/api/admin/createUser')
    .post(admin.createUser);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
