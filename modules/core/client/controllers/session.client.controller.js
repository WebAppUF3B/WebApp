angular.module('core').controller('SessionController', ['$scope','$http','NgTableParams', '$location',
  function($scope, $http, NgTableParams, $location) {
    const init = function() {

      const url = $location.absUrl().split('/');
      $scope.studyId = url[url.length -1];
      $scope.studySessions = null;
      $scope.error = null;

      $scope.getAllSessionsByStudyId();
      $scope.myStudySessions = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        }
      }, {
        counts: [], // hides page sizes
        dataset: $scope.studySessions // select data
      });
    };
    $scope.getAllSessionsByStudyId = function() {
      $http.get(window.location.origin + '/api/studySessions/' + $scope.studyId)
        .then((results) => {
          $scope.studySessions = results.data;
          console.log('tw session data', $scope.studySessions);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    init();
  }]);

