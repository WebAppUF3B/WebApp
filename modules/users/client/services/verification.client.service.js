'use strict';

// Users service used for verifying user
angular.module('users').factory('User', ['$resource',
  function ($resource) {
    // TODO update code here to verify in backend (need to add backend function too)
    return $resource('api/users/verify', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
