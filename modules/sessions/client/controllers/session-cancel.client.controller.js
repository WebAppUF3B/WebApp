angular.module('sessions').controller('SessionCancellationController', ['$scope','$http', '$state', '$stateParams', 'Authentication',
  function($scope, $http, $state, $stateParams, Authentication) {
    const init = function() {
      $scope.error = null;

      // Get token
      const token = $stateParams.token;
      $scope.user = Authentication.user;
      $scope.authToken = Authentication.authToken;
      Authentication.loading = true;
      $scope.header = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': $scope.authToken
        }
      };

      // Cancel the session
      $http.delete(`${window.location.origin}/api/sessions/cancel/${token}`, $scope.header)
        .then(() => {
          Authentication.loading = false;
        })
        .catch((err) => {
          $scope.error = true;
          Authentication.loading = false;
          console.log(err);
        });
    };

    init();
  }]);
