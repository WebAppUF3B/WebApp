'use strict';

(function () {
  describe('HomeController', () => {
    //Initialize global variables
    let scope,
      HomeController;

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(($controller, $rootScope) => {
      scope = $rootScope.$new();

      HomeController = $controller('HomeController', {
        $scope: scope
      });
    }));

    it('should expose the authentication service', () => {
      expect(scope.authentication).toBeTruthy();
    });
  });
})();
