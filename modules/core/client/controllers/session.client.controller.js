//angular.module('core',['gm.datepickerMultiSelect']).controller('SessionController', ['$scope','$http','NgTableParams', '$location', '$state', '$stateParams',
angular.module('core.session', ['ui.bootstrap','gm.datepickerMultiSelect']).controller('SessionController', ['$scope','$http', '$location', '$state', '$stateParams',
  function($scope, $http, $location, $state, $stateParams) {
    $scope.activeDate = null;
    $scope.selectedDates = [new Date().setHours(0,0,0,0)];
    $scope.options = {
      startingDay: 1,
      minDate: new Date(),
      customClass: function(data) {
        if ($scope.selectedDates.indexOf(data.date.setHours(0, 0, 0, 0)) > -1) {
          return 'selected';
        }
        return '';
      }
    };
    const init = function() {
      $scope.studyId = $stateParams.studyId;
      $scope.studySessions = null;
      $scope.error = null;
    };

    $scope.create = function(isValid) {
      $scope.session.sessStart = new Date (
        $scope.session.sessionDate.getFullYear(),
        $scope.session.sessionDate.getMonth(),
        $scope.session.sessionDate.getDate(),
        $scope.session.startTime.getHours(),
        $scope.session.startTime.getMinutes()
      );
      $scope.session.sessEnd = new Date (
        $scope.session.sessionDate.getFullYear(),
        $scope.session.sessionDate.getMonth(),
        $scope.session.sessionDate.getDate(),
        $scope.session.endTime.getHours(),
        $scope.session.endTime.getMinutes()
      );

      $http.post('/api/sessions/create/'+$scope.studyId, $scope.session).success((response) => {
        // If successful we assign the response to the global user model
        console.log('PV', 'Session Created!');
        console.log(response);
        // And redirect to the previous or home page
        //$state.go('sessions',{ 'studyId': $scope.studyId }); TODO make this go to researcher page, since session management page no longer exists
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });

    };

    init();
  }]);
