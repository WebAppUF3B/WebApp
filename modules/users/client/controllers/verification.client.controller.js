'use strict';
angular.module('users').controller('VerificationController', ['$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication',
  function($scope, $state, $stateParams, $http, $location, $window, Authentication) {
    const verify = function() {
      $scope.error = false;
      // mark verify field for this user as True (don't know if you need all the vars included above, just copied them from authentication controller)
      const pass = $stateParams.userId;
      console.log(pass);
      $http.post('/api/auth/verify/'+pass, $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.user = response;
      }).error((response) => {
        $scope.error = true;
      });
      //alert(request);
    };

    // run after page loads
    verify();
  }
]);
