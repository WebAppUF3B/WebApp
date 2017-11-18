angular.module('core.session', ['ui.bootstrap','gm.datepickerMultiSelect']).controller('AvailabilityController', ['$scope','$http', '$location', '$state', '$stateParams', '$document',
  function($scope, $http, $location, $state, $stateParams, $document) {

    const init = function() {
      $scope.studyId = $stateParams.studyId;
      $scope.availability = [];
      $scope.startTime = [];
      $scope.endTime = [];
      $scope.currentStudy = {};
      $scope.studySessions = null;
      $scope.error = null;
      $scope.type = 'individual';

      if ($state.current.name === 'studies.availability-edit') {
        $scope.state = 'edit';
        $scope.tempAvailability = $stateParams.avail;
        alert('Edit Detected');
        console.log('tempAvailability got');
        console.log($scope.tempAvailability);
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
        $scope.currentStudy.availability = [];
        /*
        if ($scope.state === 'edit') {
          $scope.tempAvailability = results.data.availability;
          $scope.putInDate = [new Date().setHours(0,0,0,0)];
          console.log('Edit Detected, Populating temp availability');
          console.log($scope.tempAvailability);
          alert('going to interpret');
          $scope.interpretCurrentAvailability();
          console.log('interpret finished, here is the array to initialize calendar in edit');
          console.log($scope.putInDate);
          console.log('interpret finished, here is the array to initialize timeslots in edit');
          console.log($scope.availability);
        }
        */
        //$scope.currentStudy.durationFromStudy = results.data.duration;
        console.log('From http.get request - availability was left blank on purpose');
        console.log($scope.currentStudy);

        $scope.prepStartTime();
      })
      .catch((err) => {
        console.log(err);
      });

      //$scope.putInDate = [];
      //$scope.interpretCurrentAvailability();

      $scope.activeDate = null;
      if ($scope.state === 'edit') {
        $scope.putInDate = [];
        $scope.interpretCurrentAvailability();
        //const madeUpDate = new Date(2017,10,16,0,0,0,0);//remember month is 0-11, not 1-12
        //const putToUse = madeUpDate.getTime();
        //alert('Manual/Default Entry into putInDate '+madeUpDate);
        //$scope.putInDate = [new Date().setHours(0,0,0,0), putToUse, new Date().setHours(48,0,0,0)];
        console.log('Finished Interpret of Passed Param');
        console.log($scope.putInDate);
        console.log($scope.availability);
        $scope.selectedDates = $scope.putInDate; //able to manipulated via external array first.
        console.log('edit date');
      } else {
        $scope.selectedDates = [new Date().setHours(0,0,0,0)];
        console.log('non-edit date');
      }
      //$scope.prepTime(); might be breaking since it's not in getStudy
      console.log('Printing out times');
      console.log($scope.time);
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
      $http.put('/api/studies/'+$scope.studyId, $scope.currentStudy).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
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
      return $http.get(window.location.origin + '/api/studies/' + studyId)
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

    $scope.prepEndTime = function(startDate) {
      console.log('Here is startDate: '+startDate);
      const startingTime = startDate.getTime();
      
      if ($scope.currentStudy.duration === 15) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 3; minute++) {
            const unix = new Date().setHours(hour,minute*15,0,0);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.endTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 30) {
        for (let hour = 0; hour <= 23; hour++) {
          for (let minute = 0; minute <= 1; minute++) {
            const unix = new Date().setHours(hour,minute*30,0,0);
            const date = new Date(unix);
            const obj = { val: date, show: moment(unix).format('hh:mm A') };
            $scope.endTime.push(obj);
          }
        }
      }
      if ($scope.currentStudy.duration === 60) {
        for (let hour = 0; hour <= 23; hour++) {
          const unix = new Date().setHours(hour,0,0,0);
          const date = new Date(unix);
          const obj = { val: date, show: moment(unix).format('hh:mm A') };
          $scope.endTime.push(obj);
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
      }
      console.log($scope.time);
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
