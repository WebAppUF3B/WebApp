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
    $scope.time = [];
    $scope.currentStudy = {};
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
        $scope.currentStudy.title = results.data.title;
        $scope.currentStudy.location = results.data.location;
        $scope.currentStudy.irb = results.data.irb;
        $scope.currentStudy.compensationType = results.data.compensationType;
        $scope.currentStudy.maxParticipants = results.data.maxParticipants;
        $scope.currentStudy.satisfactoryNumber = results.data.satisfactoryNumber;
        $scope.currentStudy.duration = results.data.duration;
        $scope.currentStudy.participantsPerSession = results.data.participantsPerSession;
        $scope.currentStudy.description = results.data.description;
        $scope.currentStudy.researchers = results.data.researchers;
        $scope.currentStudy.availability = [];

        //$scope.currentStudy.durationFromStudy = results.data.duration;
        console.log($scope.currentStudy);
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
      console.log('PV', 'Time Duration: '+$scope.currentStudy.duration);
      //console.log('SessionStart: '+$scope.startTime);
      for (let x = 0; x<$scope.currentStudy.availability.length; x++) {
        console.log('Timeslot: '+x+' '+$scope.currentStudy.availability[x]);
      }

      for (let x = 0; x < $scope.availability.length; x++) {
        let convertedUnix = new Date($scope.availability[x].unixDate);

        $scope.currentStudy.availability.push({
          startTime: new Date(
            convertedUnix.getFullYear(),
            convertedUnix.getMonth(),
            convertedUnix.getDate(),
            $scope.availability[x].lstartTime.getHours(),
            $scope.availability[x].lstartTime.getMinutes()
          ),
          endTime: new Date(
            convertedUnix.getFullYear(),
            convertedUnix.getMonth(),
            convertedUnix.getDate(),
            $scope.availability[x].lendTime.getHours(),
            $scope.availability[x].lendTime.getMinutes()
          )
        });

        //console.log($scope.availability[x].lstartTime.getMinutes());
      }

      console.log('Print out Current Study in sendAvailability');
      console.log($scope.currentStudy);


      $scope.error = null;
      $http.put('/api/studies/'+$scope.studyId, $scope.currentStudy).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        //$state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });

    };

    $scope.addEntry = function(date) {
      //multipicker saves dates in unix milliseconds
      const convertDateToDate = new Date (date);
      //let convertStart = new Date($scope.startTime);
      //let convertEnd = new Date($scope.endTime);
      //alert(convertDateToDate);

      $scope.availability.push({
        lstartTime: null,
        lendTime: null,
        unixDate: date
      });
      console.log($scope.availability);

      //alert('Convert Date to Date'+convertDateToDate);
      //alert('Start Time Default: '+convertStart+'\nEnd Time Default: '+convertEnd);
      /*
      for (let x = 0; x<$scope.availability.length; x++) {
        console.log('Unix for Entry '+x+': '+$scope.availability[x].unixDate);
      }
      */
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
      if ($scope.currentStudy.duration === 15) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 2; minute++) {
            const unix = new Date().setHours(hour,minute*15);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.time.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 30) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 1; minute++) {
            const unix = new Date().setHours(hour,minute*30);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.time.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 60) {
        for (let hour = 0; hour <= 23; hour++) {
          const unix = new Date().setHours(hour,0);
          const date = new Date(unix);
          const obj = { val: date, show: moment(unix).format('hh:mm A') };
          $scope.time.push(obj);
        }
      }
    };

    $scope.removeEntry = function(date) {
      const convertedDate = new Date(date.unixDate);
      let index = -1;
      console.log(date.$$hashKey);
      //alert('Removing Entry from date: '+convertedDate);

      for (let x = 0; x < $scope.availability.length; x++) {
        if ($scope.availability[x].$$hashKey === date.$$hashKey) {
          index = x;
          break;
        }
      }

      console.log('Index of entry with '+date.$$hashKey+' is '+index);

      $scope.availability.splice(index,1);
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
