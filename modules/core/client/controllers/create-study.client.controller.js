'use strict';
angular.module('core.study', ['angularjs-dropdown-multiselect']).controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication) {
// angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication',
//   function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication) {
// angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication', 'angularjs-dropdown-multiselect',
//   function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication, angularjs-dropdown-multiselect) {
    /* Get all the listings, then bind it to the scope */
    $scope.currentStudy = {};
    $scope.researchers = [];

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

    $document.ready(() => {
      if ($state.current.name === 'studies.edit') {
        $scope.state = 'edit';
      }
    });


    $scope.init = function() {
      $scope.pass = $stateParams.studyId;

      if ($state.current.name === 'studies.edit') {
        $scope.getStudy($scope.pass)
        .then((results) => {
          console.log('Got Current Study!');
          console.log(results);
          $scope.currentStudy.title = results.data.title;
          $scope.currentStudy.location = results.data.location;
          $scope.currentStudy.irb = results.data.irb;
          $scope.currentStudy.compensationType = results.data.compensationType;
          $scope.currentStudy.maxParticipants = results.data.maxParticipants;
          $scope.currentStudy.requireApproval = results.data.requireApproval;
          $scope.currentStudy.satisfactoryNumber = results.data.satisfactoryNumber;
          $scope.currentStudy.duration = results.data.duration;
          $scope.currentStudy.participantsPerSession = results.data.participantsPerSession;
          $scope.currentStudy.description = results.data.description;
          $scope.currentStudy.researchers = results.data.researchers;
          //TODO Add researchers (and compensationAmount?)

          //get researchers to pick from
          $scope.getResearchers()
          .then((results) => {
            console.log('Got list of Researchers!');
            console.log(results.data);
            $scope.researchers = results.data;

            //test out multipicker
            $scope.example13model = [
              //proof of concept, putting in data will instantiate dropdown
              //{ id: 1, label: 'David' }
            ];
            $scope.example13data = [];

            for (let x = 0; x<$scope.researchers.length; x++) {
              $scope.example13data.push({
                id: $scope.researchers[x]._id,
                label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName
              });
            }

            console.log('Completed Researcher Drop Down Population');
            console.log($scope.example13data);

            if ($scope.state === 'edit') {
              console.log('See if everything is kosher for edit researchers');
              console.log($scope.example13data);
              console.log($scope.currentStudy.researchers);
              // console.log('Now see if indexOf will work for subfields');
              // console.log($scope.researchers.indexOf($scope.currentStudy.researchers[0]._id));
              //it doesn't work for subfields
              console.log('Find out index of matching to populate example13model');
              for (let x = 0; x<$scope.currentStudy.researchers.length; x++) {
                const indexOfExistingResearcherInData = $scope.findIndex($scope.currentStudy.researchers[x].userID);
                console.log('In loop, found index, it is:');
                console.log(indexOfExistingResearcherInData);
                $scope.example13model.push($scope.example13data[indexOfExistingResearcherInData]);
              }
            }

          })
          .catch((err) => {
            console.log(err);
          });
        })
        .catch((err) => {
          console.log(err);
        });
      } else {
        //get researchers to pick from
        $scope.getResearchers()
        .then((results) => {
          console.log('Got list of Researchers!');
          console.log(results.data);
          $scope.researchers = results.data;

          //test out multipicker
          $scope.example13model = [
            //proof of concept, putting in data will instantiate dropdown
            //{ id: 1, label: 'David' }
          ];
          $scope.example13data = [];

          for (let x = 0; x<$scope.researchers.length; x++) {
            $scope.example13data.push({
              id: $scope.researchers[x]._id,
              label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName
            });
          }

          console.log('Completed Researcher Drop Down Population');
          console.log($scope.example13data);

        })
        .catch((err) => {
          console.log(err);
        });
      }

      $scope.example13settings = {
        smartButtonMaxItems: 5,
        enableSearch: true,
        smartButtonTextConverter: function(itemText, originalItem) {
          if (itemText === 'Jhon') {
            return 'Jhonny!';
          }
          return itemText;
        }
      };
    };

    $scope.submit = function(isValid) {
      console.log(isValid);
      if ($scope.state === 'edit') {
        console.log('update');
        $scope.update(isValid);
      } else {
        console.log('create');
        $scope.create(isValid);
      }
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

    $scope.getResearchers = function() {
      console.log('Asking for researchers');
      return $http.get(window.location.origin + '/api/studies/research/', $scope.header)
      .then((results) => {
        return results;
      })
      .catch((err) => {
        return err;
      });
    };

    $scope.create = function(isValid) {
      $scope.error = null;
      $scope.currentStudy.researchers = [];
      //$scope.currentStudy.researchers.push({ 'userID': $scope.user._id });
      console.log('What will be ACTUALLY pushed is:');
      for (let x = 0; x<$scope.example13model.length; x++) {
        //console.log($scope.example13model[x].id);
        $scope.currentStudy.researchers.push({ 'userID': $scope.example13model[x].id });
      }

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.post('/api/studies/', $scope.currentStudy, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        console.log(response._id);
        //$state.go('studies.availability', { 'studyId': response._id });
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    $scope.update = function(isValid) {
      $scope.currentStudy.researchers = [];
      for (let x = 0; x<$scope.example13model.length; x++) {
        //console.log($scope.example13model[x].id);
        $scope.currentStudy.researchers.push({ 'userID': $scope.example13model[x].id });
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      console.log($scope.currentStudy);

      $http.put('/api/studies/'+$scope.pass, $scope.currentStudy, $scope.header).success((response) => {
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    $scope.findIndex = function(researchIdInQuestion) {
      for (let x = 0; x<$scope.example13data.length; x++) {
        if ($scope.example13data[x].id === researchIdInQuestion) {
          return x;
        }
      }
      return -1;
    };

    $scope.init();
  }
]);
