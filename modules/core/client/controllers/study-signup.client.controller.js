angular.module('core').controller('StudySignupController', ['$scope','$http','NgTableParams', '$location',
  function($scope, $http, NgTableParams, $location) {
    const init = function() {

      const url = $location.absUrl().split('/');
      $scope.studyId = url[url.length -1];
      $scope.studySessions = null;
      $scope.study = null;
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
      $http.get(window.location.origin + '/api/studySessions/signup/' + $scope.studyId)
        .then((results) => {
          $scope.studySessions = results.data.sessions;
          $scope.study = results.data.study;
          console.log('tw get data');
          console.log('tw study\n', $scope.study);
          console.log('tw sessions\n', $scope.studySessions);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    $scope.hoursAndMinutes = function(minutes) {
      const hours = Math.floor(minutes / 60);
      const remainderMins = Math.floor(minutes % 60);
      const hoursUnits = hours === 1 ? 'hour' : 'hours';
      const hoursStr = hours > 0 ? `${hours} ${hoursUnits}` : '';

      const minutesUnits = remainderMins === 1 ? 'minute' : 'minutes';
      const minutesStr = remainderMins > 0 ? `${remainderMins} ${minutesUnits}` : '';

      const conjunctionFunction = hoursStr && minutesStr ? ' and ' : '';

      return `${hoursStr}${conjunctionFunction}${minutesStr}`;
    };
    init();
  }]);