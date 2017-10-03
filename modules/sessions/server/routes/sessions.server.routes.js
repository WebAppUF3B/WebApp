'use strict';

// Study Routes
const sessions = require('../controllers/sessions.server.controller.js');

module.exports = function (app) {
  // Setting up the users profile api
  app.route('/api/sessions/all').get(sessions.getAll);
  app.route('/api/sessions/:sessionId').get(sessions.get).put(sessions.update).post(sessions.create).delete(sessions.delete);
  app.route('/api/sessions/user/:userId').get(sessions.getUserSessions);

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  router.param('sessionId', sessions.sessionById);
};
