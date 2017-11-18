'use strict';

// Study Routes
const studies = require('../controllers/studies.server.controller.js');
const authUtils = require('../../../utils/server/authUtils');

module.exports = function (app) {
  // Setting up the users profile api
  app.use(authUtils.authUser);
  app.route('/api/studies/')
    .get(studies.getAll)
    .post(studies.create);
  app.route('/api/studies/:studyID')
    .get(studies.get)
    .put(studies.update)
    .delete(studies.delete);
  app.route('/api/studies/user/:userID').get(studies.get);
  app.route('/api/studies/close/:studyID').put(studies.closeStudy);
  app.route('/api/studies/reopen/:studyID').put(studies.reopenStudy);

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  app.param('studyID', studies.studyById);
  app.param('userID', studies.studyByUserId);
};
