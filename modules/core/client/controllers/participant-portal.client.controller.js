'use strict';

// angular.module('core', ["ngTable"]).controller('ParticipantPortalController', ['$scope',
angular.module('core').controller('ParticipantPortalController', ['$scope', '$rootScope',
  function($scope, $rootScope) {
    /* Get all the listings, then bind it to the scope */
    console.log($rootScope.getMockUser());
  }
]);
