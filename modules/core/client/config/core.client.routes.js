/*~*/
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

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
      templateUrl: 'modules/core/client/views/study-create.client.view.html'
    })
    .state('studies.availability', {
      url: '/availability/:studyId',
      templateUrl: 'modules/core/client/views/availability.client.view.html'
    })
    .state('studies.availability-edit', {
      url: '/edit/availability/:studyId',
      templateUrl: 'modules/core/client/views/availability.client.view.html',
      params: {
        studyId: null
      }
    })
    .state('studies.data', {
      url: '/data/:studyId',
      templateUrl: 'modules/core/client/views/study-data.client.view.html'
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
      url: '/admin/manage-users',
      templateUrl: 'modules/core/client/views/manage-users.client.view.html'
    })
    .state('edit-user', {
      url: '/admin/manage-users/edit/:userId',
      templateUrl: 'modules/core/client/views/edit-user.client.view.html'
    })
    .state('create-user', {
      url: '/admin/manage-users/create',
      templateUrl: 'modules/core/client/views/edit-user.client.view.html'
    })
    .state('reset-password', {
      url: '/reset-password/:token',
      templateUrl: 'modules/core/client/views/reset-password.client.view.html'
    })
    .state('forgot-password', {
      url: '/forgot-password',
      templateUrl: 'modules/core/client/views/forgot-password.client.view.html'
    })
    .state('reset-password-known', { //reset password if you know your current one
      url: '/reset-password',
      templateUrl: 'modules/core/client/views/reset-password-known.client.view.html'
    })
    .state('cancel', {
      url: '/cancel/:token',
      templateUrl: 'modules/core/client/views/session-cancel.client.view.html'
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
