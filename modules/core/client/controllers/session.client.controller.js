angular.module('core').controller('SessionController', ['$scope','$http','NgTableParams', '$location', '$state',
  function($scope, $http, NgTableParams, $location, $state) {
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

    $scope.create = function(isValid) {
      //alert('Creating Session');
      //alert($scope.session.sessionDate.getFullYear());
      $scope.session.sessStart = new Date (
        $scope.session.sessionDate.getFullYear(),
        $scope.session.sessionDate.getMonth(),
        $scope.session.sessionDate.getDate(),
        $scope.session.startTime.getHours(),
        $scope.session.startTime.getMinutes()
      );
      //alert($scope.session.sessStart);
      $scope.session.sessEnd = new Date (
        $scope.session.sessionDate.getFullYear(),
        $scope.session.sessionDate.getMonth(),
        $scope.session.sessionDate.getDate(),
        $scope.session.endTime.getHours(),
        $scope.session.endTime.getMinutes()
      );
      //alert($scope.session.sessEnd);

      $http.post('/api/sessions/create/'+$scope.studyId, $scope.session).success((response) => {
        //alert(response);
        // If successful we assign the response to the global user model
        console.log('PV', 'Session Created!');
        console.log(response);
        // And redirect to the previous or home page
        $state.go('sessions',{ 'studyId': $scope.studyId });
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });

    };

    init();
  }]);
