'use strict';

// Session Routes
const sessions = require('../controllers/sessions.server.controller.js');

module.exports = function (app) {
  // Setting up the session api
  app.route('/api/sessions/')
    .get(sessions.getAll)
    .post(sessions.create);
  app.route('/api/sessions/:sessionId')
    .get(sessions.get)
    .put(sessions.update)
    .delete(sessions.delete);
  app.route('/api/sessions/user/:userId').get(sessions.get);
  app.route('/api/sessions/attend/:sessionId').put(sessions.changeAttendance);
  app.route('/api/sessions/compensate/:sessionId').put(sessions.markCompensated);

  app.route('/api/studySessions/:studyId')
    .get(sessions.allSessionsFromStudy);

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  app.param('sessionId', sessions.sessionById);
  app.param('userId', sessions.sessionsByUserId);
  app.param('studyId', sessions.sessionsByStudyId);
};
