'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('participant-portal', {
      url: '/participant',
      templateUrl: 'modules/core/client/views/participant-portal.client.view.html'
    })
    .state('studies', {
      url: '/studies',
      templateUrl: 'modules/core/client/views/studies.client.view.html'
    })
    .state('studies.discover', {
      url: '/discover',
      templateUrl: 'modules/core/client/views/study-discovery.client.view.html'
    })
    .state('studies.sign-up', {
      url: '/sign-up/:studyId',
      templateUrl: 'modules/core/client/views/study-sign-up.client.view.html'
    })
    .state('studies.thank-you', {
      url: '/thank-you',
      templateUrl: 'modules/core/client/views/study-thank-you.client.view.html'
    })
    .state('researcher-portal', {
      url: '/researcher',
      templateUrl: 'modules/core/client/views/researcher-portal.client.view.html'
    })
    .state('studies.create', {
      url: '/create',
      templateUrl: 'modules/core/client/views/study-create.client.view.html'
    })
    .state('studies.edit', {
      url: '/edit/:studyId',
      templateUrl: 'modules/core/client/views/study-edit.client.view.html'
    })
    .state('faculty-portal', {
      url: '/faculty',
      templateUrl: 'modules/core/client/views/faculty-portal.client.view.html'
    })
    .state('admin-portal', {
      url: '/admin',
      templateUrl: 'modules/core/client/views/admin-portal.client.view.html'
    })
    .state('manage-users', {
      url: '/admin-portal.manage-users',
      templateUrl: 'modules/core/client/views/manage-users.client.view.html'
    })
    .state('manage-studies', {
      url: '/admin-portal.manage-studies',
      templateUrl: 'modules/core/client/views/manage-studies.client.view.html'
    })
    .state('manage-sessions', {
      url: '/admin-portal.manage-sessions',
      templateUrl: 'modules/core/client/views/manage-sessions.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);
