'use strict';

module.exports = function (app) {
  // Root routing
  var studies = require('../controllers/studies.server.controller');

  // Define error pages
  app.route('/server-error').get(studies.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(studies.renderNotFound);

  // Define application route
  app.route('/*').get(studies.renderIndex);
};
