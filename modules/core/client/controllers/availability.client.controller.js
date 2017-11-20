angular.module('core.session', ['ui.bootstrap','gm.datepickerMultiSelect']).controller('AvailabilityController',
['$scope','$http', '$location', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $http, $location, $state, $stateParams, $document, Authentication) {
    //$scope.loaded = false;

    $scope.user = Authentication.user;
    console.log('tw user', $scope.user);

    $scope.authToken = Authentication.authToken;
    console.log('tw auth token', $scope.authToken);

    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    const init = function() {
      $scope.studyId = $stateParams.studyId;
      $scope.availability = [];
      $scope.startTime = [];
      $scope.endTime = [];
      $scope.currentStudy = {};
      $scope.error = null;
      $scope.type = 'individual';

      if ($state.current.name === 'studies.availability-edit') {
        $scope.state = 'edit';
        if ($stateParams.avail !== null) {
          localStorage.setItem('avail', JSON.stringify($stateParams.avail));
          $scope.tempAvailability = $stateParams.avail;
        } else {
          console.log('Getting avail from Persistance');
          console.log(JSON.parse(localStorage.getItem('avail')));
          $scope.tempAvailability = JSON.parse(localStorage.getItem('avail'));
          //localStorage.removeItem('avail');
        }
        if ($stateParams.durate !== null) {
          localStorage.setItem('durate', $stateParams.durate);
          $scope.currentStudy.duration = $stateParams.durate;
        } else {
          console.log('Getting durate from Persistance');
          console.log(localStorage.getItem('durate'));
          $scope.currentStudy.duration = localStorage.getItem('durate');
          //localStorage.removeItem('durate');
        }
        alert('Edit Detected');
        console.log('tempAvailability got');
        console.log($scope.tempAvailability);
        console.log('Durate got');
        console.log($scope.currentStudy.duration);
      }
      //alert($scope.studyId);
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
        $scope.currentStudy.requireApproval = results.data.requireApproval;
        $scope.currentStudy.availability = [];
        //$scope.tempAvailability = results.data.availability;
        console.log('From http.get request - availability was left blank on purpose');
        console.log($scope.currentStudy);
        //console.log($scope.tempAvailability);
        $scope.prepStartTime();
      })
      .catch((err) => {
        console.log(err);
      });

      $scope.activeDate = null;
      if ($scope.state === 'edit') {
        $scope.putInDate = [];
        $scope.interpretCurrentAvailability();
        console.log('Finished Interpret of Passed Param');
        console.log($scope.putInDate);
        console.log($scope.availability);
        //$scope.loaded = true;
        $scope.selectedDates = $scope.putInDate; //able to manipulated via external array first.
        console.log('edit date');
      } else {
        //$scope.loaded = true;
        $scope.selectedDates = [new Date().setHours(0,0,0,0)];
        console.log('non-edit date');
      }
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
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
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
      console.log($scope.availability);
      for (let x = 0; x<$scope.currentStudy.availability.length; x++) {
        console.log('Timeslot: '+x+' '+$scope.currentStudy.availability[x]);
      }

      for (let x = 0; x < $scope.availability.length; x++) {
        const convertedUnix = new Date($scope.availability[x].unixDate);

        $scope.currentStudy.availability.push({
          startTime: new Date(
            convertedUnix.getFullYear(),
            convertedUnix.getMonth(),
            convertedUnix.getDate(),
            $scope.availability[x].startTime.getHours(),
            $scope.availability[x].startTime.getMinutes()
          ),
          endTime: new Date(
            convertedUnix.getFullYear(),
            convertedUnix.getMonth(),
            convertedUnix.getDate(),
            $scope.availability[x].endTime.getHours(),
            $scope.availability[x].endTime.getMinutes()
          )
        });

        //console.log($scope.availability[x].lstartTime.getMinutes());
      }

      console.log('Print out Current Study in sendAvailability');
      console.log($scope.currentStudy);


      $scope.error = null;
      $http.put('/api/studies/'+$scope.studyId, $scope.currentStudy, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        console.log(response);
        $state.go('researcher-portal');
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
        startTime: null,
        endTime: null,
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
      return $http.get(window.location.origin + '/api/studies/' + studyId, $scope.header)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
    };

    $scope.prepStartTime = function() {
      if ($scope.currentStudy.duration === 15) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 3; minute++) {
            const unix = new Date().setHours(hour,minute*15,0,0);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.startTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 30) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 1; minute++) {
            const unix = new Date().setHours(hour,minute*30,0,0);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.startTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 60) {
        for (let hour = 0; hour <= 23; hour++) {
          const unix = new Date().setHours(hour,0,0,0);
          const date = new Date(unix);
          const obj = { val: date, show: moment(unix).format('hh:mm A') };
          $scope.startTime.push(obj);
        }
      }
    };

    $scope.prepEndTime = function(possibility) {
      const startDate = possibility.startTime;
      //resets ALL EndTime fields...
      possibility.endTimeList = [];
      console.log('Here is startDate: '+startDate);
      let nextTime = startDate;
      const endOfDayUnix = new Date(startDate).setHours(23,59);
      const endOfDay = new Date(endOfDayUnix);
      console.log('End of Day: ' +endOfDay);
      let addMinutes = 30;
      if ($scope.currentStudy.duration === 15 || $scope.currentStudy.duration === '15') {
        addMinutes = 15;
      }
      if ($scope.currentStudy.duration === 30 || $scope.currentStudy.duration === '30') {
        addMinutes = 30;
      }
      if ($scope.currentStudy.duration === 60 || $scope.currentStudy.duration === '30') {
        addMinutes = 60;
      }
      console.log('Duration: '+addMinutes);
      console.log('nextTime?: '+moment(nextTime).add(addMinutes,'m').toDate());

      while (moment(nextTime).add(addMinutes,'m').toDate() <= endOfDay) {
        nextTime = moment(nextTime).add(addMinutes,'m').toDate();
        const nextTimeUnix = nextTime.getTime();
        const obj = { val: nextTime, show: moment(nextTimeUnix).format('hh:mm A') };
        possibility.endTimeList.push(obj);
      }
      console.log('Here is finished endTime');
      console.log(possibility.endTimeList);
    };

    $scope.removeEntry = function(date) {
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

    //populate what's needed to get existing data to show in edit
    $scope.interpretCurrentAvailability = function() {
      //alert('interpeting tempAvailability');
      for (let x = 0; x < $scope.tempAvailability.length; x++) {
        console.log((moment($scope.tempAvailability[x].startTime)._d));
        console.log((moment($scope.tempAvailability[x].startTime)._d).setHours(0,0,0,0));
        const existingEntry = (moment($scope.tempAvailability[x].startTime)._d).setHours(0,0,0,0);
        //push to initialize existing dates in calendarconsole.log((moment($scope.tempAvailability[x].startTime)._d).setHours(0,0,0,0));
        if ($scope.putInDate.indexOf(existingEntry) === -1) {
          //alert('Adding'+existingEntry);
          $scope.putInDate.push(existingEntry);
        }
        //push to initialize existing timeslots in $scope.availability
        $scope.availability.push({
          startTime: new Date($scope.tempAvailability[x].startTime),
          endTime: new Date($scope.tempAvailability[x].endTime),
          unixDate: existingEntry
        });
        $scope.prepEndTime($scope.availability[x]);
      }
    };
    init();
  }]);
