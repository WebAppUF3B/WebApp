angular.module('core.session', ['ui.bootstrap','gm.datepickerMultiSelect']).controller('AvailabilityController', ['$scope','$http', '$location', '$state', '$stateParams',
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
    $scope.availability = [];
    $scope.durationFromStudy = '';
    $scope.time = [];
    //$scope.startTime = new Date().setHours(0,0);
    //$scope.endTime = new Date().setHours(23,0);

    const init = function() {
      $scope.studyId = $stateParams.studyId;
      $scope.studySessions = null;
      $scope.error = null;
      $scope.type = 'individual';

      $scope.getStudy($scope.studyId)
      .then((results) => {
        console.log(results);
        $scope.durationFromStudy = results.data.duration;
        $scope.prepTime();
      })
      .catch((err) => {
        console.log(err);
      });
    };

    $scope.removeFromSelected = function(dt) {
      $scope.selectedDates.splice($scope.selectedDates.indexOf(dt), 1);
      /// Need to change activeDate for datepicker to call customClass again
      $scope.activeDate = dt;
      for (let x = 0; x<$scope.availability.length; x++) {
        if ($scope.availability[x].unixDate === dt) {
          $scope.availability.splice(x, 1);
          x = -1;
        }
      }
    };

    $scope.sendAvailability = function() {
      alert('Sending Availability');
      console.log('PV', 'Time Duration: '+$scope.durationFromStudy);
      console.log('SessionStart: '+$scope.startTime);
      for (let x = 0; x<$scope.availability.length; x++) {
        console.log('Timeslot Start: '+$scope.availability[x].startTime);
        console.log('Timeslot End: '+$scope.availability[x].endTime);
      }
    };

    $scope.addEntry = function(date) {
      //multipicker saves dates in unix milliseconds
      const convertDateToDate = new Date (date);
      //let convertStart = new Date($scope.startTime);
      //let convertEnd = new Date($scope.endTime);
      alert(convertDateToDate);

      $scope.availability.push({
        startTime: null,
        endTime: null,
        unixDate: date,
        meow: 'meow'
      });
      console.log($scope.availability);

      //alert('Convert Date to Date'+convertDateToDate);
      //alert('Start Time Default: '+convertStart+'\nEnd Time Default: '+convertEnd);
      for (let x = 0; x<$scope.availability.length; x++) {
        console.log('Unix for Entry '+x+': '+$scope.availability[x].unixDate);
      }
    };

    $scope.getStudy = function(studyId) {
      return $http.get(window.location.origin + '/api/studies/' + studyId)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
    };

    $scope.prepTime = function() {
      if ($scope.durationFromStudy === 15) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 2; minute++) {
            const unix = new Date().setHours(hour,minute*15);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.time.push(obj);
          }
        }
      }
      if ($scope.durationFromStudy === 30) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 1; minute++) {
            const unix = new Date().setHours(hour,minute*30);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.time.push(obj);
          }
        }
      }
      if ($scope.durationFromStudy === 60) {
        for (let hour = 0; hour <= 23; hour++) {
          const unix = new Date().setHours(hour,0);
          const date = new Date(unix);
          const obj = { val: date, show: moment(unix).format('hh:mm A') };
          $scope.time.push(obj);
        }
      }
    };

    init();

    /* Single Session Creation Method
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
    */
  }]);
