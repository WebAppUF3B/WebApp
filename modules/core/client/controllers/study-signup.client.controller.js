'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('StudySignupController', ['$scope','$http', '$location',
  function($scope, $http, $location) {
    const url = $location.absUrl().split('/');
    const studyId = url[url.length - 1];
    console.log(studyId);
  }
]);
