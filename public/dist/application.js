'use strict';

// Init the application configuration module for AngularJS application
const ApplicationConfiguration = (function () {
  // Init module configuration options
  const applicationModuleName = 'mean';
  const applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngMaterial', 'ngTable'];

  // Add a new vertical module
  const registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  $rootScope.getMockUser = function() {
    return {
      _id: '59e8f85f4fec93497c42b75e',
      firstName: 'Tim',
      lastName: 'Tebow',
      gender: 'male',
      birthday: '2015-02-03T05:00:00.000Z',
      email: 'trenflem@gmail.com',
      role: 'participant'
    }
  };

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Articles',
      state: 'articles',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'List Articles',
      state: 'articles.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'articles', {
      title: 'Create Articles',
      state: 'articles.create',
      roles: ['user']
    });
  }
]);

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        url: '',
        templateUrl: 'modules/articles/client/views/list-articles.client.view.html'
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/create-article.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('articles.view', {
        url: '/:articleId',
        templateUrl: 'modules/articles/client/views/view-article.client.view.html'
      })
      .state('articles.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/articles/client/views/edit-article.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
  function ($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      // Create new Article object
      var article = new Articles({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      article.$save(function (response) {
        $location.path('articles/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Article
    $scope.remove = function (article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };

    // Update existing Article
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var article = $scope.article;

      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function () {
      $scope.articles = Articles.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
  }
]);

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
  function ($resource) {
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('participant-portal', {
      url: '/participant',
      templateUrl: 'modules/core/client/views/participant-portal.client.view.html'
    })
    .state('studies', {
      url: '/studies',
      templateUrl: 'modules/core/client/views/studies.client.view.html'
    })
    .state('studies.discover', {
      url: '/discover',
      templateUrl: 'modules/core/client/views/study-discovery.client.view.html'
    })
    .state('studies.sign-up', {
      url: '/sign-up/:studyId',
      templateUrl: 'modules/core/client/views/study-sign-up.client.view.html'
    })
    .state('studies.thank-you', {
      url: '/thank-you',
      templateUrl: 'modules/core/client/views/study-thank-you.client.view.html'
    })
    .state('researcher-portal', {
      url: '/researcher',
      templateUrl: 'modules/core/client/views/researcher-portal.client.view.html'
    })
    .state('studies.create', {
      url: '/create',
      templateUrl: 'modules/core/client/views/study-create.client.view.html'
    })
    .state('studies.edit', {
      url: '/edit/:studyId',
      templateUrl: 'modules/core/client/views/study-edit.client.view.html'
    })
    .state('sessions', {
      url: '/sessions/:studyId',
      templateUrl: 'modules/core/client/views/session-handle.client.view.html'
    })
    .state('faculty-portal', {
      url: '/faculty',
      templateUrl: 'modules/core/client/views/faculty-portal.client.view.html'
    })
    .state('admin-portal', {
      url: '/admin',
      templateUrl: 'modules/core/client/views/admin-portal.client.view.html'
    })
    .state('manage-users', {
      url: '/admin-portal.manage-users',
      templateUrl: 'modules/core/client/views/manage-users.client.view.html'
    })
    .state('manage-studies', {
      url: '/admin-portal.manage-studies',
      templateUrl: 'modules/core/client/views/manage-studies.client.view.html'
    })
    .state('manage-sessions', {
      url: '/admin-portal.manage-sessions',
      templateUrl: 'modules/core/client/views/manage-sessions.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('AdminPortalController', ['$scope', '$http', 'NgTableParams',
  function($scope, $http, NgTableParams) {
    const init = () => {
      $scope.admin.getWaitingUsers()
        .then((results) => {
          $scope.allUsers = results.data;
          console.log(results.data);
          $scope.approvalTable = new NgTableParams({
            count: 10,
            sorting: {
              lastName: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.allUsers // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    $scope.approvalDetails = function(user, index) {
      $scope.currentUser = user;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#approvalModal').modal('show');
    };

    $scope.approveUser = function() {
      console.log('Approved!');
      console.log($scope.currentUser._id);
      return $http.put(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
      //init();
    };

    $scope.denyUser = function() {
      console.log('DENIED!');
      console.log($scope.currentUser._id);
      return $http.delete(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
    };

    // Declare methods that can be used to access administrative data
    $scope.admin = {
      getWaitingUsers: function() {
        return $http.get(window.location.origin + '/api/admin/approval')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      approve: function(id) {
        console.log('eyyyyyyyy');
        return $.ajax({
          url: window.location.origin + '/api/admin/approval/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json'
        });
      },

      deny: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/admin/approval/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });
      }
    };

    init();
  }
]);

'use strict';

angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$document',
  function($scope, $rootScope, $http, $state, $document) {
    /* Get all the listings, then bind it to the scope */
    console.log($rootScope.getMockUser());

    $document.ready(() => {
      $scope.request = window.location.pathname;
      $scope.pass = $scope.request.slice(14);
      //alert('document fire');
      if (window.location.pathname.includes('edit')) {
        $scope.init();
      }
    });


    $scope.init = function() {
      //alert('init called');

      $scope.getStudy($scope.pass)
      .then((results) => {
        $scope.study = results;
        console.log($scope.study);
        $scope.study.title = $scope.study.data.title;
        $scope.study.location = $scope.study.data.location;
        $scope.study.irb = $scope.study.data.irb;
        $scope.study.compensationType = $scope.study.data.compensationType;
        $scope.study.maxParticipants = $scope.study.data.maxParticipants;
        $scope.study.maxParticipantsPerSession = $scope.study.data.maxParticipantsPerSession;
        $scope.study.description = $scope.study.data.description;
        //TODO Add researchers (and compensationAmount?)

      })
      .catch((err) => {
        console.log(err);
      });

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

    $scope.create = function(isValid) {
      //alert('Hello World');
      $scope.error = null;


      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.post('/api/studies/create', $scope.study).success((response) => {
        //alert(response);
        // If successful we assign the response to the global user model
        console.log('PV', 'Study Created!');
        // And redirect to the previous or home page
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    $scope.update = function(isValid) {

      //alert($scope.study.title);

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.put('/api/studies/'+pass, $scope.study).success((response) => {
        //alert($scope.study.title+' meow');
        console.log('PV', 'Study Updated!');
        //$state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    /*
    $document.ready(() => {
      alert('document fire');
      alert(window.location.pathname);
      if (window.location.pathname.includes('edit')) {
        $scope.init();
      }
    });
    */
  }
]);

'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('FacultyPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {
    $scope.extraCredit = {};
    $scope.newCourse = {};

    // Prevent race condition
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function(){
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.courses.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allCourses = results.data;
        });
    };

    $scope.populateCourse = function(){
      $scope.sessions.extraCreditByCourse($scope.selectedCourse.name)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.extraCredit.data = results.data;
          console.log($scope.extracredit);

          $scope.extraCredit = new NgTableParams({
            count: 10,
            sorting: {
              lastName: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.extraCredit.data // select data
          });
        });
    };

    $scope.addCourse = function() {
      if(!alreadyClicked){
        $scope.error = '';
        if(!$scope.newCourse.name){
          $scope.error = "The course name cannot be empty!";
        } else{
          $http.post('/api/courses/', $scope.newCourse).success((response) => {
            $('#addCourseModal').modal('hide');
            $scope.init();
            alreadyClicked = false;
          }).error((response) => {
            $scope.error = response.message;
            alreadyClicked = false;
          });
        }
      }
    };

    $scope.exportCSV = function() {
      const fileName = "Grades-" + $scope.selectedCourse.name + '.csv';
      let mimeType = 'text/csv;encoding=utf-8';
      $scope.extraCredit.data
      let data = [["Student"]];
      for(let i = 0; i < $scope.extraCredit.data.length; i++) {
        const tempArray = ["\"" + $scope.extraCredit.data[i].lastName + ", " + $scope.extraCredit.data[i].firstName + "\""];
        data.push(tempArray);
      }
      let lineArray = [];
      data.forEach(function(infoArray, index) {
        let line = infoArray.join("");
        lineArray.push(line);
      });
      let csvContent = lineArray.join("\n");
      let a = document.createElement('a');
      mimeType = mimeType || 'application/octet-stream';
      if(navigator.msSaveBlob) { //IE10
        navigator.msSaveBlob(new Blob([csvContent], {
          type: mimeType
        }), fileName);
      } else if(URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([csvContent], {
          type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(csvContent); //only this mime type is supported
      }
    };

    // Declare methods that can be used to access session data
    $scope.sessions = {
      extraCreditByCourse: function(courseName) {
        return $http.get(window.location.origin + '/api/sessions/course/' + courseName)
            .then((results) => {
              return results;
            })
            .catch((err) => {
              return err;
            });
      }
    };

    // Declare methods that can be used to access course data
    $scope.courses = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/courses/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newCourse) {
        return $.ajax({
          url: window.location.origin + '/api/courses/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newCourse)
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

// TODO consider replacing $http requests with factory (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','$state', 'Authentication', 'NgTableParams',
  function($scope, $http, $state, Authentication, NgTableParams) {

    // Prevent race conditions
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];

      // TODO Assign user
      $scope.user = Authentication.user;
      console.log($scope.user);

      if (!$scope.user) {
        $state.go('authentication.signin');
      }

      $scope.sessions.getUserSessions($scope.user._id)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allSessions = results.data;

          // Populate date and time fields for each sessions
          const today = new Date();
          let date;
          $scope.allSessions.forEach((session) => {
            date = new Date(session.sessionTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            // Place session in correct array
            if (date >= today) {
              $scope.upcomingSessions.data.push(session);
            } else {
              $scope.pastSessions.data.push(session);
            }
          });

          $scope.upcomingSessions = new NgTableParams({
            count: 5,
            sorting: {
              sessionTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          $scope.pastSessions = new NgTableParams({
            count: 5,
            sorting: {
              sessionTime: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.pastSessions.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Show modal and populate it with session data
    $scope.sessionDetails = function(session, currentTable, index) {
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.currentTable = currentTable;
      $scope.error = false;
      $('#detailModal').modal('show');
    };

    // Close cancel modal
    $scope.cancelClose = function() {
      if (!alreadyClicked) {
        $('#cancelModal').modal('hide');
      }
    };

    // Cancel session and remove from table
    $scope.confirmCancel = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        cancellor.date = $scope.currentSession.date;
        cancellor.time = $scope.currentSession.time;
        $scope.sessions.cancel($scope.currentSession._id, cancellor)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#cancelModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Declare methods that can be used to access session data
    $scope.sessions = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/sessions/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newSession) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
        });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/sessions/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newSession) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id, newSession,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
        });
      },

      cancel: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);

'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('ResearcherPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Prevent race conditions
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $scope.myStudies = {};
      $scope.myStudies.data = [];
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];
      $scope.compensation = {};
      $scope.compensation.data = [];

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      $scope.studies.getUserStudies($scope.user._id)
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            if (!study.removed) {
              if (study.currentNumber > study.satisfactoryNumber) {
                study.satisfied = true;
              }
              // Store in array
              $scope.myStudies.data.push(study);
            }
          });

          $scope.myStudies = new NgTableParams({
            count: 10,
            sorting: {
              title: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.myStudies.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });

      $scope.sessions.getUserSessions($scope.user._id)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allSessions = results.data;

          // Populate date and time fields for each sessions
          const today = new Date();
          let date;
          $scope.allSessions.forEach((session) => {
            date = new Date(session.sessionTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            // Place session in correct array
            if (date >= today) {
              $scope.upcomingSessions.data.push(session);
            } else {
              $scope.pastSessions.data.push(session);
            }

            // Populate table with users awaiting compensationType
            session.participants.forEach((participant) => {
              if (participant.attended && participant.compensationType === 'monetary' && !participant.compensationGiven) {
                const temp = participant;
                temp.studyID = session.studyID;
                temp.session = session._id;
                $scope.compensation.data.push(temp);
              }
            });
          });

          $scope.upcomingSessions = new NgTableParams({
            count: 10,
            sorting: {
              sessionTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          $scope.pastSessions = new NgTableParams({
            count: 10,
            sorting: {
              sessionTime: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.pastSessions.data // select data
          });

          $scope.compensation = new NgTableParams({
            count: 10,
            sorting: {
              'userID.lastName': 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.compensation.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Show modal and populate it with study details
    $scope.studyDetails = function(study, index) {
      $scope.currentStudy = study;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studyModal').modal('show');
    };

    // Show modal and populate it with compensation data
    $scope.compensationDetails = function(participant, index) {
      $scope.currentParticipant = participant;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#compensationModal').modal('show');
    };

    // Show modal and populate it with session data
    $scope.sessionDetails = function(session, currentTable, index) {
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.currentTable = currentTable;
      $scope.error = false;
      $('#detailModal').modal('show');
    };

    // Close cancel modal
    $scope.cancelClose = function() {
      if (!alreadyClicked) {
        $('#cancelModal').modal('hide');
      }
    };

    // Close closeStudy modal
    $scope.closeStudyClose = function() {
      if (!alreadyClicked) {
        $('#closeStudyModal').modal('hide');
      }
    };

    // Close closeStudy modal
    $scope.removeStudyClose = function() {
      if (!alreadyClicked) {
        $('#removeStudyModal').modal('hide');
      }
    };

    // Close study in backend
    $scope.confirmCloseStudy = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        $scope.studies.close($scope.currentStudy._id, cancellor)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#closeStudyModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Remove study in backend
    $scope.confirmRemoveStudy = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        $scope.studies.remove($scope.currentStudy._id)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#removeStudyModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Cancel session and remove from table
    $scope.confirmCancel = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        cancellor.date = $scope.currentSession.date;
        cancellor.time = $scope.currentSession.time;
        $scope.sessions.cancel($scope.currentSession._id, cancellor)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#cancelModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Change attendance value of participant
    $scope.changeAttendance = function(participant) {
      const change = { 'userID': participant.userID._id, 'attended': participant.attended };
      $scope.sessions.attend($scope.currentSession._id, change)
        .then(() => {
          // Refetch sessions
          alreadyClicked = false;
        })
        .catch((err) => {
          $scope.error = true;
          console.log(err);
          alreadyClicked = false;
        });
    };

    // Mark participant as compensated
    $scope.markCompensated = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const user = { 'userID': $scope.currentParticipant.userID._id };
        $scope.sessions.compensate($scope.currentParticipant.session, user)
          .then((response) => {
            // Refetch sessions
            $scope.init();
            $('#compensationModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Declare methods that can be used to access session data
    $scope.sessions = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/sessions/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newSession) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
        });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/sessions/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newSession) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id, newSession,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
        });
      },

      cancel: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      },

      attend: function(id, change) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/attend/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(change)
        });
      },

      compensate: function(id, user) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/compensate/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(user)
        });
      }
    };

    // Declare methods that can be used to access session data
    $scope.studies = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/studies/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserStudies: function(userId) {
        return $http.get(window.location.origin + '/api/studies/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/studies/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/' + id, newStudy,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      close: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/studies/close/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      },

      remove: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/studies/remove/' + id,
          type: 'PUT'
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);

angular.module('core').controller('SessionController', ['$scope','$http','NgTableParams', '$location',
  function($scope, $http, NgTableParams, $location) {
    const init = function() {

      const url = $location.absUrl().split('/');
      $scope.studyId = url[url.length -1];
      $scope.studySessions = null;
      $scope.error = null;

      $scope.getAllSessionsByStudyId();
      $scope.myStudySessions = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        }
      }, {
        counts: [], // hides page sizes
        dataset: $scope.studySessions // select data
      });
    };
    $scope.getAllSessionsByStudyId = function() {
      $http.get(window.location.origin + '/api/studySessions/' + $scope.studyId)
        .then((results) => {
          $scope.studySessions = results.data;
          console.log('tw session data', $scope.studySessions);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    $scope.hoursAndMinutes = function(minutes) {
      const hours = Math.floor(minutes / 60);
      const remainderMins = Math.floor(minutes % 60);
      const hoursUnits = hours === 1 ? 'hour' : 'hours';
      const hoursStr = hours > 0 ? `${hours} ${hoursUnits}` : '';

      const minutesUnits = remainderMins === 1 ? 'minute' : 'minutes';
      const minutesStr = remainderMins > 0 ? `${remainderMins} ${minutesUnits}` : '';

      const conjunctionFunction = hoursStr && minutesStr ? ' and ' : '';

      return `${hoursStr}${conjunctionFunction}${minutesStr}`;
    };
    init();
  }]);


'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('StudyDiscoveryController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Prevent race conditions
    const alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.allStudies = [];
      $scope.filters = {};

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      // TODO filter these based on study criteria and use profile
      $scope.studies.getAll()
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            if (!study.removed) {
              // Store in array
              $scope.allStudies.push(study);
            }
          });

          $scope.studyTable = new NgTableParams({
            count: 10,
            sorting: {
              title: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.allStudies // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Toggle filter area open or closed
    $scope.expandFilters = function() {
      $('.filter-area').slideToggle();
    };

    // Check and see if any filters are applied
    $scope.checkFilters = function() {
      if ($scope.filters.compensationType) {
        $('.clear-filters-btn').show();
      } else {
        $('.clear-filters-btn').hide();
      }
      $scope.reloadTable();
    };

    // Remove table filters
    $scope.clearFilters = function() {
      $scope.filters = '';
      $('.clear-filters-btn').hide();
      $scope.reloadTable();
    };

    // Search table
    $scope.search = function() {
      $scope.searchQuery = $scope.searchText;
    };

    // Search on 'enter' press
    $("#search").keypress((e) => {
      if (e.keyCode === 13) {
        $('#search-btn').click();
      }
    });

    $scope.reloadTable = function() {
      $scope.studyTable = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        },
        filter: $scope.filters
      }, {
        counts: [], // hides page sizes
        dataset: $scope.allStudies // select data
      });
    };

    // Show details of study in modal
    $scope.studyDetails = function(study, index) {
      $scope.currentStudy = study;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studyModal').modal('show');
    };

    // Declare methods that can be used to access study data
    $scope.studies = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/studies/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserStudies: function(userId) {
        return $http.get(window.location.origin + '/api/studies/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/studies/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/' + id, newStudy,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      close: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/studies/close/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      },

      remove: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/studies/remove/' + id,
          type: 'PUT'
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

angular.module('core').factory('Sessions', ['$http',
  function($http) {
    const methods = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/sessions/');
      },

      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId);
      },

      create: function(newSession) {
        return $http.post(window.location.origin + '/api/sessions/', newSession);
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/sessions/' + id);
      },

      update: function(id, newSession) {
        return $http.put(window.location.origin + '/api/sessions/' + id, newSession);
      },

      delete: function(id) {
        return $http.delete(window.location.origin + '/api/sessions/' + id);
      }
    };

    return methods;
  }
]);

// TODO Figure out if we need to use $resource
// angular.module('core').factory('Sessions', ['$resource',
//   function ($resource) {
//     return $resource('api/sessions', {}, {
//       getAll: {
//         method: 'GET'
//       },
//       create: {
//         method: 'POST'
//       },
//       get
//       update: {
//         method: 'PUT'
//       }
//     });
//   }
// ]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.faculty-signup', {
        url: '/signup/faculty',
        templateUrl: 'modules/users/client/views/authentication/faculty-signup.client.view.html'
      })
      .state('authentication.researcher-signup', {
        url: '/signup/researcher',
        templateUrl: 'modules/users/client/views/authentication/researcher-signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('authentication.email-sent', {
        url: '/email-sent',
        templateUrl: 'modules/users/client/views/authentication/email.client.view.html'
      })
      .state('authentication.verify', {
        url: '/verify/:userId',
        templateUrl: 'modules/users/client/views/authentication/verify.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
      // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function(isValid) {
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();

      console.log($scope.credentials);

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        return false;
      }

      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup', $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.facultySignup = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        return false;
      }
      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup/faculty', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.researcherSignup = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        return false;
      }
      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup/researcher', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.signin = function(isValid) {
      $scope.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success((response) => {
        localStorage.setItem('user', JSON.stringify(response));
        redirect(response);
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirectTo=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
    $scope.validateConfirmPassword = (confirmation) => {
      const password = $scope.userForm.password.$viewValue;
      if (confirmation && password && confirmation !== password) {
        $scope.userForm.confirm.$setValidity('goodConfirm', false);
        return;
      }
      $scope.userForm.confirm.$setValidity('goodConfirm', true);
    };
    const redirect = (response) => {
      // If successful we assign the response to the global user model
      console.log(response);
      $scope.authentication.user = response;

      let destination;
      switch ($scope.authentication.user.role) {
        case 'participant':
          destination = 'participant-portal';
          break;
        case 'faculty':
          destination = 'faculty-portal';
          break;
        case 'researcher':
          destination = 'researcher-portal';
          break;
        case 'admin':
          destination = 'admin-portal';
          break;
        default:
          $scope.error = 'Your role doesn\'t exist, what did you do?';
          break;
      }

      // And redirect to the previous or home page
      if (!$scope.error) $state.go(destination, $state.previous.params);
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error((response) => {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error((response) => {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';
angular.module('users').controller('VerificationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function($scope, $state, $http, $location, $window, Authentication) {
    const verify = function() {
      $scope.error = false;
      // mark verify field for this user as True (don't know if you need all the vars included above, just copied them from authentication controller)
      const request = window.location.pathname;
      const pass = request.slice(23);
      $http.post('/api/auth/verify/'+pass, $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.user = response;
      }).error((response) => {
        $scope.error = true;
      });
      //alert(request);
    };

    // run after page loads
    verify();
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          let status = true;
          if (password) {
            const result = PasswordValidator.getResult(password);
            let requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            const requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        scope.$watch(() => {
          let combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, (value) => {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              const origin = scope.passwordVerify;
              return origin === password;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', () => {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push((input) => {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', '$injector',
  function($window) {

    const user = JSON.parse(localStorage.getItem('user'));

    return {
      user: user
    };
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    const owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
    owaspPasswordStrengthTest.config({
      allowPassphrases       : false,
      maxLength              : 128,
      minLength              : 8,
      minPhraseLength        : 20,
      minOptionalTestsToPass : 4,
    });

    return {
      getResult: function (password) {
        return owaspPasswordStrengthTest.test(password);
      },
      getPopoverMsg: function () {
        return 'Please enter a password with at least 8 characters and at least one number, lowercase, uppercase, and special character.';
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Users service used for verifying user
/* Kyle's factory
angular.module('users').factory('User', ['$resource',
  function ($resource) {
    // TODO update code here to verify in backend (need to add backend function too)
    return $resource('api/users/verify/:user_.id', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
*/

angular.module('users').factory('User', ["$resource", function($resource) {
  return $resource('/api/users/:id', { id: '_id' }, {
    update: {
      method: 'PUT'
    }
  });
}]);
