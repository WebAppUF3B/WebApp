angular.module('core').controller('SessionCancellationController', ['$scope','$http', '$state', '$stateParams', 'Authentication',
  function($scope, $http, $state, $stateParams, Authentication) {
    const init = function() {
      $scope.error = null;

      // Get token
      const token = $stateParams.token;
      console.log(token);

      // Cancel the session
      // $http.get(`${window.location.origin}/api/sessions/cancel/${token}`)
      //   .catch((err) => {
      //     $scope.error = true;
      //     console.log(err);
      //   });
    };

    init();
  }]);
