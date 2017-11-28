'use strict';
angular.module('studies.study', ['ui.bootstrap','angularjs-dropdown-multiselect']).config(['$uibTooltipProvider',
function($uibTooltipProvider) {
  $uibTooltipProvider.options({
    trigger: 'focus'
  });
}]);

angular.module('studies.study').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication) {

    Authentication.loading = true;

    /* Get all the listings, then bind it to the scope */
    $scope.currentStudy = {};
    $scope.researchers = [];

    $scope.user = Authentication.user;

    $scope.authToken = Authentication.authToken;

    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $document.ready(() => {
      //detect if editing study or not
      if ($state.current.name === 'studies.edit') {
        $scope.state = 'edit';
      }
    });

    //sorting researchers in multiselect
    const sortResearchers = function(a,b) {
      if (a.lastName < b.lastName)
        return -1;
      if (a.lastName > b.lastName)
        return 1;
      if (a.lastName === b.lastName) {
        if (a.firstName < b.firstName)
          return -1;
        if (a.firstName > b.firstName)
          return 1;
      }
      return 0;
    };
    //runs upon loading the page
    $scope.init = function() {
      $scope.pass = $stateParams.studyId;
      //if editing in a study, get study information
      if ($state.current.name === 'studies.edit') {
        $scope.getStudy($scope.pass)
        .then((results) => {
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
          $scope.currentStudy.availability = results.data.availability;
          $scope.currentStudy.researchers = results.data.researchers;
          $scope.currentStudy.compensationAmount = results.data.compensationAmount;

          //get researchers to pick from
          $scope.getResearchers()
          .then((results) => {
            $scope.researchers = results.data;
            $scope.researchers.sort(sortResearchers);

            for (let i = 0; i < $scope.researchers.length; i++) {
              if ($scope.researchers[i]._id === $scope.user._id) {
                $scope.researchers.splice(i,1);
                break;
              }
            }

            //researcher multipicker
            $scope.researchermodel = [];
            $scope.researcherdata = [];

            for (let x = 0; x<$scope.researchers.length; x++) {
              $scope.researcherdata.push({
                id: $scope.researchers[x]._id,
                label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName+' - '+$scope.researchers[x].position
              });
            }

            for (let x = 0; x<$scope.currentStudy.researchers.length; x++) {
              if ($scope.currentStudy.researchers[x].userID !== $scope.user._id) {
                const indexOfExistingResearcherInData = $scope.findIndex($scope.currentStudy.researchers[x].userID);
                $scope.researchermodel.push($scope.researcherdata[indexOfExistingResearcherInData]);
              }
            }

          })
          .catch((err) => {
            console.log(err);
          });
          //setup compensate multiselect
          $scope.compensatemodel = [];
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
          Authentication.loading = false;
        })
        .catch((err) => {
          Authentication.loading = false;
          console.log(err);
        });
      } else {
        //set up compensate multi select
        $scope.compensatemodel = [];
        $scope.compensatedata = [
          { id: 1, label: 'Extra Credit' },
          { id: 2, label: 'Monetary' }
        ];

        //get researchers to pick from
        $scope.getResearchers()
        .then((results) => {
          $scope.researchers = results.data;
          $scope.researchers.sort(sortResearchers);

          for (let i = 0; i < $scope.researchers.length; i++) {
            if ($scope.researchers[i]._id == $scope.user._id) {
              $scope.researchers.splice(i,1);
              break;
            }
          }

          //researcher multipicker
          $scope.researchermodel = [];
          $scope.researcherdata = [];

          for (let x = 0; x<$scope.researchers.length; x++) {
            $scope.researcherdata.push({
              id: $scope.researchers[x]._id,
              label: $scope.researchers[x].firstName+' '+$scope.researchers[x].lastName+' - '+$scope.researchers[x].position
            });
          }
          Authentication.loading = false;
        })
        .catch((err) => {
          Authentication.loading = false;
          console.log(err);
        });
      }
      //smartbutton showing the dropdown multiselect for researchers
      $scope.researchersettings = {
        smartButtonMaxItems: 1,
        enableSearch: true,
        buttonClasses: 'form-control',
        smartButtonTextConverter: function(itemText, originalItem) {
          if (itemText === 'Jhon') {
            return 'Jhonny!';
          }
          return itemText;
        }
      };
      //dropdown multi setting for compensate dropbox
      $scope.compensatesettings = {
        smartButtonMaxItems: 2,
        buttonClasses: 'form-control needs-validation'
      };
    };
    //determine if editing or creating update to backend
    $scope.submit = function(isValid) {
      if ($scope.state === 'edit') {
        $scope.update(isValid);
      } else {
        $scope.create(isValid);
      }
    };
    //query backend for study information
    $scope.getStudy = function(studyId) {
      return $http.get(window.location.origin + '/api/studies/' + studyId, $scope.header)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
    };
    //query backend for all non-participant users
    $scope.getResearchers = function() {
      return $http.get(window.location.origin + '/api/studies/research/', $scope.header)
      .then((results) => {
        return results;
      })
      .catch((err) => {
        return err;
      });
    };
    //create study in backend
    $scope.create = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      $('.needs-validation').removeClass('highlight-error');

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'studyForm');
        $scope.error = 'Please fill in all required fields.';
        return false;
      }
      //populate research list from multiselect dropbox
      $scope.currentStudy.researchers = [];
      $scope.currentStudy.researchers.push({ 'userID': $scope.user._id });
      for (let x = 0; x<$scope.researchermodel.length; x++) {
        $scope.currentStudy.researchers.push({ 'userID': $scope.researchermodel[x].id });
      }
      //populate compensationType list from multiselect dropbox
      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length !== 0) {
        if ($scope.compensatemodel.length === 2) {
          $scope.currentStudy.compensationType.push('extraCredit');
          $scope.currentStudy.compensationType.push('monetary');
        } else {
          if ($scope.compensatemodel[0].id === 1) {
            $scope.currentStudy.compensationType.push('extraCredit');
          } else {
            $scope.currentStudy.compensationType.push('monetary');
          }
        }
      }

      $http.post('/api/studies/', $scope.currentStudy, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        $state.go('studies.availability', { 'studyId': response._id });
      }).error((response) => {
        $scope.error = 'There was a problem creating your study, please contact the admin.';
      });
    };

    $scope.update = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      $('.needs-validation').removeClass('highlight-error');

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'studyForm');
        $scope.error = 'Please fill in all required fields.';
        if ($scope.compensatemodel.length === 0) $('.needs-validation').addClass('highlight-error');
        Authentication.loading = false;
        return false;
      }
      //populate research list from multiselect dropbox
      $scope.currentStudy.researchers = [];
      $scope.currentStudy.researchers.push({ 'userID': $scope.user._id });
      for (let x = 0; x<$scope.researchermodel.length; x++) {
        $scope.currentStudy.researchers.push({ 'userID': $scope.researchermodel[x].id });
      }
      //populate compensationType list from multiselect dropbox
      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length !== 0) {
        if ($scope.compensatemodel.length === 2) {
          $scope.currentStudy.compensationType.push('extraCredit');
          $scope.currentStudy.compensationType.push('monetary');
        } else {
          if ($scope.compensatemodel[0].id === 1) {
            $scope.currentStudy.compensationType.push('extraCredit');
          } else {
            $scope.currentStudy.compensationType.push('monetary');
          }
        }
      }

      $http.put('/api/studies/'+$scope.pass, $scope.currentStudy, $scope.header).success((response) => {
        $state.go('studies.availability-edit', { 'studyId': response._id });
      }).error((response) => {
        $scope.error = 'There was a problem updating your study, please contact the admin.';
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
