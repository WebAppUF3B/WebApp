'use strict';
angular.module('users').controller('VerificationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function ($scope, $state, $http, $location, $window, Authentication) {
    const verify = function () {
      // mark verify field for this user as True (don't know if you need all the vars included above, just copied them from authentication controller)
      const request = window.location.pathname;
      const pass = request.slice(23);
      $http.post('/api/auth/verify/'+pass, $scope.credentials).success((response) => {
        //+$stateParams.id
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error((response) => {
        $scope.error = response.message;
      });
      //alert(request);
    };

    // run after page loads
    verify();
  }
]);
