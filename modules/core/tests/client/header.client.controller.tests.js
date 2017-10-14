'use strict';

(function () {
  describe('HeaderController', () => {
    //Initialize global variables
    let scope,
      HeaderController,
      $state,
      Authentication;

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(($controller, $rootScope, _$state_, _Authentication_) => {
      scope = $rootScope.$new();
      $state = _$state_;
      Authentication = _Authentication_;

      HeaderController = $controller('HeaderController', {
        $scope: scope
      });
    }));

    it('should expose the authentication service', () => {
      expect(scope.authentication).toBe(Authentication);
    });

    it('should expose the $state service', () => {
      expect(scope.$state).toBe($state);
    });

    it('should default menu to collapsed', () => {
      expect(scope.isCollapsed).toBeFalsy();
    });

    describe('when toggleCollapsibleMenu', () => {
      let defaultCollapse;
      beforeEach(() => {
        defaultCollapse = scope.isCollapsed;
        scope.toggleCollapsibleMenu();
      });

      it('should toggle isCollapsed to non default value', () => {
        expect(scope.isCollapsed).not.toBe(defaultCollapse);
      });

      it('should then toggle isCollapsed back to default value', () => {
        scope.toggleCollapsibleMenu();
        expect(scope.isCollapsed).toBe(defaultCollapse);
      });
    });

    describe('when view state changes', () => {
      beforeEach(() => {
        scope.isCollapsed = true;
        scope.$broadcast('$stateChangeSuccess');
      });

      it('should set isCollapsed to false', () => {
        expect(scope.isCollapsed).toBeFalsy();
      });
    });
  });
})();
