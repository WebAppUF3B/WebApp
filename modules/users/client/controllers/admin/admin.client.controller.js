'use strict';

angular.module('users').controller('AdminPortalController', ['$scope', '$state', 'Authentication', 'userResolve',
  function($scope, $state, Authentication, userResolve) {
    const init = () => {
      $http.post('/api/admin/manage-users', {}).success((response) => {
        $scope.allUsers = response.users;
        console.log($scope.allUsers);
      }).error((response) => {
        $scope.error = response.message;
      });
    };
    init();
  }
]);
