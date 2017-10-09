'use strict';

angular.module('core').controller('ParticipantHomeController', ['$scope', 'studySession', 
  function($scope, studySession) {
    /* Get all the listings, then bind it to the scope */
    studySession.getAll().then(function(response) {
      $scope.studySession = response.data;
    }, function(error) {
      console.log('Unable to retrieve studySession:', error);
    });

  }
]);