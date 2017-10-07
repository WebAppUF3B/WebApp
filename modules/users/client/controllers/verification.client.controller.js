'use strict';

angular.module('users').controller('VerificationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function ($scope, $state, $http, $location, $window, Authentication) {
    const verify = function () {
      // mark verify field for this user as True (don't know if you need all the vars included above, just copied them from authentication controller)
      alert('We made it');
    };

    // run after page loads
    verify();
  }
]);
