'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', '$injector',
  function($window) {

    const user = JSON.parse(localStorage.getItem('user'));

    return {
      user: user
    };
  }
]);
