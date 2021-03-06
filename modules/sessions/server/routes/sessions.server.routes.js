'use strict';

// Session Routes
const sessions = require('../controllers/sessions.server.controller.js');
const authUtils = require('../../../utils/server/authUtils');

module.exports = function(app) {
  // Setting up the session api
  app.use(authUtils.authUser);
  app.route('/api/sessions/')
    .get(sessions.getAll)
    .post(sessions.create);
  app.route('/api/sessions/emailReminders').get(sessions.emailReminders);
  app.route('/api/sessions/create/:studyID').post(sessions.create);
  app.route('/api/sessions/cancel/:token').delete(sessions.delete);
  app.route('/api/sessions/approveUser/:sessionId').put(sessions.approveUser);
  app.route('/api/sessions/denyUser/:sessionId').put(sessions.denyUser);
  app.route('/api/sessions/user/:userId').get(sessions.get);
  app.route('/api/sessions/attend/:sessionId').put(sessions.changeAttendance);
  app.route('/api/sessions/compensate/:sessionId').put(sessions.markCompensated);
  app.route('/api/sessions/denyUser/:sessionId').put(sessions.denyUser);
  app.route('/api/sessions/course/:courseName').put(sessions.getExtraCredit);
  app.route('/api/sessions/:sessionId')
    .get(sessions.get)
    .put(sessions.update)
    .delete(sessions.delete);
  app.route('/api/studySessions/:studyId').get(sessions.allSessionsFromStudy);
  app.route('/api/studySessions/signup/:userId/:studyId').get(sessions.allSessionsForSignup);
  app.route('/api/studySession/signup').post(sessions.sessionSignup);

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  app.param('sessionId', sessions.sessionById);
  app.param('userId', sessions.sessionsByUserId);
  app.param('courseName', sessions.extraCreditByCourse);
  app.param('studyId', sessions.sessionsByStudyId);
  app.param('token', sessions.parseToken);
};
