'use strict';
angular.module('users').controller('VerificationController', ['$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication',
  function($scope, $state, $stateParams, $http, $location, $window, Authentication) {
    // Runs as soon as page loads
    const verify = function() {
      Authentication.loading = true;
      $scope.error = false;
      // mark verify field for this user as True (don't know if you need all the vars included above, just copied them from authentication controller)
      const userId = $stateParams.userId;
      $http.post('/api/auth/verify/'+userId, $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.user = response;
        Authentication.loading = false;
      }).error((response) => {
        $scope.error = true;
        Authentication.loading = false;
      });
    };
    verify();
  }
]);
