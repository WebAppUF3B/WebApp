'use strict';

// Course Routes
const courses = require('../controllers/courses.server.controller.js');
const authUtils = require('../../../utils/server/authUtils');

module.exports = function(app) {
  // Setting up the course api
  app.use(authUtils.authUser);
  app.route('/api/courses/')
    .get(courses.getAll)
    .post(courses.create);
  app.route('/api/courses/faculty/')
      .get(courses.getAll);
  app.route('/api/courses/:courseName');

  /*
    The 'router.param' method allows us to specify middleware we would like to use to handle
    requests with a parameter.
   */
  app.param('courseName', courses.courseByName);
};
