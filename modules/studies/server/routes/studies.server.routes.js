'use strict';

// Study Routes
const studies = require('../controllers/studies.server.controller.js');

module.exports = function (app) {
  // Setting up the users profile api
  app.route('/api/studies/all').get(studies.getAll);
  app.route('/api/studies/:studyId')
    .get(studies.get)
    .put(studies.update)
    .delete(studies.delete);
  app.route('/api/studies/user/:userId').get(studies.getUserStudies);

  app.route('/api/studies/create').post(studies.create);

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  app.param('studyId', studies.studyById);
};
