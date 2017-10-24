'use strict';

angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state',
  function($scope, $rootScope, $http, $state) {
    /* Get all the listings, then bind it to the scope */
    console.log($rootScope.getMockUser());

    $scope.create = function (isValid) {
      //alert('Hello World');
      $scope.error = null;


      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.post('/api/studies/create', $scope.study).success((response) => {
        alert(response);
        // If successful we assign the response to the global user model
        console.log('PV', 'Study Created!');
        // And redirect to the previous or home page
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

  }
]);
