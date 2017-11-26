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
          $scope.currentStudy.compensationAmount = results.data.compensationAmount;

          //get researchers to pick from
          $scope.getResearchers()
          .then((results) => {
            console.log('Got list of Researchers!');
            console.log(results.data);
            $scope.researchers = results.data;

            //researcher multipicker
            $scope.researchermodel = [
              //proof of concept, putting in data will instantiate dropdown
              //{ id: 1, label: 'David' }
            ];
            $scope.researcherdata = [];

            for (let x = 0; x<$scope.researchers.length; x++) {
              $scope.researcherdata.push({
                id: $scope.researchers[x]._id,
                label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName
              });
            }

            console.log('Completed Researcher Drop Down Population');
            console.log($scope.researcherdata);

            if ($scope.state === 'edit') {
              console.log('See if everything is kosher for edit researchers');
              console.log($scope.researcherdata);
              console.log($scope.currentStudy.researchers);
              // console.log('Now see if indexOf will work for subfields');
              // console.log($scope.researchers.indexOf($scope.currentStudy.researchers[0]._id));
              //it doesn't work for subfields
              console.log('Find out index of matching to populate researchermodel');
              for (let x = 0; x<$scope.currentStudy.researchers.length; x++) {
                const indexOfExistingResearcherInData = $scope.findIndex($scope.currentStudy.researchers[x].userID);
                console.log('In loop, found index, it is:');
                console.log(indexOfExistingResearcherInData);
                $scope.researchermodel.push($scope.researcherdata[indexOfExistingResearcherInData]);
              }
            }

          })
          .catch((err) => {
            console.log(err);
          });

          $scope.compensatemodel = [
            //proof of concept, putting in data will instantiate dropdown
            //{ id: 1, label: 'David' }
          ];
          $scope.compensatedata = [
            { id: 1, label: 'Extra Credit' },
            { id: 2, label: 'Monetary' }
          ];

          if ($scope.currentStudy.compensationType.length === 2) {
            $scope.compensatemodel.push({ id: 1, label: 'Extra Credit' });
            $scope.compensatemodel.push({ id: 2, label: 'Monetary' });
          } else {
            if ($scope.currentStudy.compensationType[0] === 'extraCredit') {
              $scope.compensatemodel.push({ id: 1, label: 'Extra Credit' });
            } else {
              $scope.compensatemodel.push({ id: 2, label: 'Monetary' });
            }
          }

        })
        .catch((err) => {
          console.log(err);
        });
      } else {

        $scope.compensatemodel = [
          //proof of concept, putting in data will instantiate dropdown
          //{ id: 1, label: 'David' }
        ];
        $scope.compensatedata = [
          { id: 1, label: 'Extra Credit' },
          { id: 0, label: 'Monetary' }
        ];

        //get researchers to pick from
        $scope.getResearchers()
        .then((results) => {
          console.log('Got list of Researchers!');
          console.log(results.data);
          $scope.researchers = results.data;

          //research multipicker
          $scope.researchermodel = [
            //proof of concept, putting in data will instantiate dropdown
            //{ id: 1, label: 'David' }
          ];
          $scope.researcherdata = [];

          for (let x = 0; x<$scope.researchers.length; x++) {
            $scope.researcherdata.push({
              id: $scope.researchers[x]._id,
              label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName
            });
          }

          console.log('Completed Researcher Drop Down Population');
          console.log($scope.researcherdata);

        })
        .catch((err) => {
          console.log(err);
        });
      }

      $scope.researchersettings = {
        smartButtonMaxItems: 5,
        enableSearch: true,
        smartButtonTextConverter: function(itemText, originalItem) {
          if (itemText === 'Jhon') {
            return 'Jhonny!';
          }
          return itemText;
        }
      };

      $scope.compensatesettings = {
        smartButtonMaxItems: 2
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
      for (let x = 0; x<$scope.researchermodel.length; x++) {
        //console.log($scope.researchermodel[x].id);
        $scope.currentStudy.researchers.push({ 'userID': $scope.researchermodel[x].id });
      }

      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length === 2) {
        $scope.currentStudy.compensationType.push('extraCredit');
        $scope.currentStudy.compensationType.push('monetary');
      } else {
        console.log('Here is compensatemodel before send off');
        console.log($scope.compensatemodel);
        if ($scope.compensatemodel[0].id === 1) {
          $scope.currentStudy.compensationType.push('extraCredit');
        } else {
          $scope.currentStudy.compensationType.push('monetary');
        }
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
      for (let x = 0; x<$scope.researchermodel.length; x++) {
        //console.log($scope.researchermodel[x].id);
        $scope.currentStudy.researchers.push({ 'userID': $scope.researchermodel[x].id });
      }

      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length === 2) {
        $scope.currentStudy.compensationType.push('extraCredit');
        $scope.currentStudy.compensationType.push('monetary');
      } else {
        console.log('Here is compensatemodel before send off');
        console.log($scope.compensatemodel);
        if ($scope.compensatemodel[0].id === 1) {
          $scope.currentStudy.compensationType.push('extraCredit');
        } else {
          $scope.currentStudy.compensationType.push('monetary');
        }
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
      for (let x = 0; x<$scope.researcherdata.length; x++) {
        if ($scope.researcherdata[x].id === researchIdInQuestion) {
          return x;
        }
      }
      return -1;
    };

    $scope.init();
  }
]);
