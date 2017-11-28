'use strict';

// Setting up route
angular.module('studies').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('studies', {
        url: '/studies',
        templateUrl: 'modules/studies/client/views/studies.client.view.html'
      })
      .state('studies.discover', {
        url: '/discover',
        templateUrl: 'modules/studies/client/views/study-discovery.client.view.html'
      })
      .state('studies.sign-up', {
        url: '/sign-up/:studyId',
        templateUrl: 'modules/studies/client/views/study-sign-up.client.view.html'
      })
      .state('studies.create', {
        url: '/create',
        templateUrl: 'modules/studies/client/views/study-create.client.view.html'
      })
      .state('studies.edit', {
        url: '/edit/:studyId',
        templateUrl: 'modules/studies/client/views/study-create.client.view.html'
      })
      .state('studies.availability', {
        url: '/availability/:studyId',
        templateUrl: 'modules/studies/client/views/availability.client.view.html'
      })
      .state('studies.availability-edit', {
        url: '/edit/availability/:studyId',
        templateUrl: 'modules/studies/client/views/availability.client.view.html',
        params: {
          studyId: null
        }
      })
      .state('studies.data', {
        url: '/data/:studyId',
        templateUrl: 'modules/studies/client/views/study-data.client.view.html'
      });
  }
]);
