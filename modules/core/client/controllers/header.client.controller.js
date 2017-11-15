'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    $('.nav a').click(() => {
      if ($('.navbar-toggle').is(':visible')) {
        $('.navbar-toggle').click();
      }
    });

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $('.modal').modal('hide');
      $scope.isCollapsed = false;
    });

    $scope.signout = function() {
      localStorage.removeItem('user');
      $scope.authentication.user = undefined;
      $state.go('home');
    };
  }
]);
