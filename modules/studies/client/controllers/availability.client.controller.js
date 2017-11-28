angular.module('studies.session', ['ui.bootstrap','gm.datepickerMultiSelect']).controller('AvailabilityController',
['$scope','$http', '$location', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $http, $location, $state, $stateParams, $document, Authentication) {

    Authentication.loading = true;

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
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

      //Initialize the calendar with fake date
      $scope.selectedDates = [0];
      $scope.options = {
        startingDay: 1,
        minDate: new Date(),
        customClass: function(data) {
          if ($scope.selectedDates.indexOf(data.date.setHours(0, 0, 0, 0)) > -1) {
            return 'selected';
          }
          console.log('Running');
          return '';
        }
      };

      if ($state.current.name === 'studies.availability-edit') {
        $scope.state = 'edit';
      }
      $scope.getStudy($scope.studyId)
      .then((results) => {
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
        $scope.tempAvailability = results.data.availability;
        $scope.currentStudy.compensationAmount = results.data.compensationAmount;
        console.log($scope.currentStudy);
        $scope.prepStartTime();

        // Prepare data for calendar
        if ($scope.state === 'edit') {
          $scope.putInDate = [];
          $scope.interpretCurrentAvailability();
          $scope.selectedDates = $scope.putInDate; //able to manipulated via external array first.
        } else {
          $scope.selectedDates = [new Date().setHours(0,0,0,0)];
        }
        $scope.activeDate = $scope.selectedDates[0];
        $scope.activeDate = null;
        Authentication.loading = false;
      })
      .catch((err) => {
        console.log(err);
        Authentication.loading = true;
      });
    };

    $scope.removeFromSelected = function(dt) {
      console.log('Removing: ' + dt);
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

      Authentication.loading = true;

      for (let x = 0; x<$scope.availability.length; x++) {
        for (let y = 0; y<$scope.availability.length; y++) {
          if (x === y) {
            continue;
          } else {
            if ($scope.availability[x].unixDate === $scope.availability[y].unixDate) {
              const startTimexsplit = $scope.availability[x].startTime;
              const endTimexsplit = $scope.availability[x].endTime;
              const startTimeysplit = $scope.availability[y].startTime;
              const endTimeysplit = $scope.availability[y].endTime;
              const startTimex = parseFloat(startTimexsplit.substring(0,startTimexsplit.indexOf(':'))+'.'+startTimexsplit.substring(startTimexsplit.indexOf(':')));
              const endTimex = parseFloat(endTimexsplit.substring(0,endTimexsplit.indexOf(':'))+'.'+endTimexsplit.substring(endTimexsplit.indexOf(':')));
              const startTimey = parseFloat(startTimeysplit.substring(0,startTimeysplit.indexOf(':'))+'.'+startTimeysplit.substring(startTimeysplit.indexOf(':')));
              const endTimey = parseFloat(endTimeysplit.substring(0,endTimeysplit.indexOf(':'))+'.'+endTimeysplit.substring(endTimeysplit.indexOf(':')));
              if ((startTimex>startTimey && startTimex<endTimey) || (endTimex>startTimey && endTimex<endTimey)) {
                alert('Overlapping Times Detected, Please Check Times');
                return;
              }
            }
          }
        }
      }

      for (let x = 0; x < $scope.availability.length; x++) {
        if ($scope.availability[x].startTime === null || $scope.availability[x].endTime === null) {
          continue;
        } else {
          const convertedUnix = new Date($scope.availability[x].unixDate);
          const startTimeArray = $scope.availability[x].startTime.split(':');
          const endTimeArray = $scope.availability[x].endTime.split(':');

          $scope.currentStudy.availability.push({
            startTime: new Date(
              convertedUnix.getFullYear(),
              convertedUnix.getMonth(),
              convertedUnix.getDate(),
              startTimeArray[0],
              startTimeArray[1]
            ),
            endTime: new Date(
              convertedUnix.getFullYear(),
              convertedUnix.getMonth(),
              convertedUnix.getDate(),
              endTimeArray[0],
              endTimeArray[1]
            )
          });
        }
      }

      console.log('Submitting here we go:');
      console.log($scope.currentStudy);

      $scope.error = null;
      $http.put('/api/studies/'+$scope.studyId, $scope.currentStudy, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
      });

    };

    $scope.addEntry = function(date) {
      //multipicker saves dates in unix milliseconds
      const convertDateToDate = new Date (date);

      $scope.availability.push({
        startTime: null,
        endTime: null,
        unixDate: date
      });
      console.log($scope.availability);
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
            const obj = { val: date.getHours() + ':' + date.getMinutes(), show: moment(unix).format('hh:mm A') };
            $scope.startTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 30) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 1; minute++) {
            const unix = new Date().setHours(hour,minute*30,0,0);
            const date = new Date(unix);
            const obj = { val: date.getHours() + ':' + date.getMinutes(), show: moment(unix).format('hh:mm A') };
            $scope.startTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 60) {
        for (let hour = 0; hour <= 23; hour++) {
          const unix = new Date().setHours(hour,0,0,0);
          const date = new Date(unix);
          const obj = { val: date.getHours() + ':' + date.getMinutes(), show: moment(unix).format('hh:mm A') };
          $scope.startTime.push(obj);
        }
      }
    };

    $scope.prepEndTime = function(possibility) {
      let startDate = new Date(possibility.unixDate);
      const startTimeArray = possibility.startTime.split(':');
      startDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startTimeArray[0],
        startTimeArray[1]
      );

      //resets ALL EndTime fields...
      possibility.endTimeList = [];
      let nextTime = startDate;
      const endOfDayUnix = new Date(startDate).setHours(23,59);
      const endOfDay = new Date(endOfDayUnix);
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

      while (moment(nextTime).add(addMinutes,'m').toDate() <= endOfDay) {
        nextTime = moment(nextTime).add(addMinutes,'m').toDate();
        const nextTimeUnix = nextTime.getTime();
        const obj = { val: nextTime.getHours() + ':' + nextTime.getMinutes(), show: moment(nextTimeUnix).format('hh:mm A') };
        possibility.endTimeList.push(obj);
      }
      nextTime = moment(nextTime).add(addMinutes-1,'m').toDate();
      const lastTimeUnix = nextTime.getTime();
      const lastObj = { val: nextTime.getHours() + ':' + nextTime.getMinutes(), show: moment(lastTimeUnix).format('hh:mm A') };
      possibility.endTimeList.push(lastObj);
    };

    $scope.copyToTemp = function(date) {
      $scope.copyTemp = [];
      console.log('copyExist to date:');
      console.log(date);

      for (let x = 0; x<$scope.availability.length; x++) {
        if (date === $scope.availability[x].unixDate) {
          $scope.copyTemp.push({
            copyStart: $scope.availability[x].startTime,
            copyEnd: $scope.availability[x].endTime
          });
        }
      }

      console.log('finished populating copyExist');
      console.log($scope.copyTemp);
    };

    $scope.pasteToDay = function(date) {

      for (let x = 0; x<$scope.availability.length; x++) {
        if ($scope.availability[x].unixDate === date) {
          $scope.availability.splice(x,1);
        }
      }

      console.log('copyExist to date:');
      console.log(date);

      for (let x = 0; x<$scope.copyTemp.length; x++) {
        $scope.availability.push({
          startTime: $scope.copyTemp[x].copyStart,
          endTime: $scope.copyTemp[x].copyEnd,
          unixDate: date
        });
        $scope.prepEndTime($scope.availability[$scope.availability.length-1]);
      }
    };

    $scope.removeEntry = function(date) {
      let index = -1;
      //alert('Removing Entry from date: '+convertedDate);

      for (let x = 0; x < $scope.availability.length; x++) {
        if ($scope.availability[x].$$hashKey === date.$$hashKey) {
          index = x;
          break;
        }
      }

      $scope.availability.splice(index,1);
    };

    //populate what's needed to get existing data to show in edit
    $scope.interpretCurrentAvailability = function() {
      for (let x = 0; x < $scope.tempAvailability.length; x++) {
        const existingEntry = (moment($scope.tempAvailability[x].startTime)._d).setHours(0,0,0,0);
        //push to initialize existing dates in calendarconsole.log((moment($scope.tempAvailability[x].startTime)._d).setHours(0,0,0,0));
        if ($scope.putInDate.indexOf(existingEntry) === -1) {
          $scope.putInDate.push(existingEntry);
        }
        const startDate = new Date($scope.tempAvailability[x].startTime);
        const endDate = new Date($scope.tempAvailability[x].endTime);
        //push to initialize existing timeslots in $scope.availability
        $scope.availability.push({
          startTime: startDate.getHours() + ':' + startDate.getMinutes(),
          endTime: endDate.getHours() + ':' + endDate.getMinutes(),
          unixDate: existingEntry
        });
        $scope.prepEndTime($scope.availability[x]);
      }
    };
    init();
  }]);
