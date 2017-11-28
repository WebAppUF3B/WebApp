'use strict';

angular.module('core').controller('FacultyPortalController', ['$scope','$http','NgTableParams', 'Authentication',
  function($scope, $http, NgTableParams, Authentication) {
    Authentication.loading = true;
    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };
    $scope.participatedStudies = {};
    $scope.extraCredit = {};
    $scope.newCourse = {};
    $scope.currentStudy = {};

    // Search on 'enter' press
    $("#course").keypress((e) => {
      if (e.keyCode === 13) {
        $('#add-course-btn').click();
      }
    });

    // Called after page loads
    $scope.init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      // Get all courses in the system
      $scope.courses.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allCourses = results.data;
        });
    };

    // Attempt to populate users when everything is selected
    $scope.attemptPopulate = function() {
      if ($scope.selectedCourse && $scope.selectedSemester) {
        populateCourse();
      }
    };

    const populateCourse = function() {
      Authentication.loading = true;
      $scope.sessions.extraCreditByCourse($scope.selectedCourse.name)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.participatedStudies.data = results.data;
          console.log($scope.participatedStudies.data);

          $scope.participatedStudies = new NgTableParams({
            count: 10,
            sorting: {
              studyTitle: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.participatedStudies.data // select data
          });
          Authentication.loading = false;
        });
    };

    // Separate init function to dynamically create semesters
    $scope.init2 = function() {
      // Generate the time periods starting with Fall 2017
      const today = new Date();
      let temp = { startDate: new Date(2017, 7, 15), endDate: new Date(2018, 0, 1), name: 'Fall' };
      $scope.semesters = [];
      // Loop until present day
      while (temp.startDate <= today) {
        $scope.semesters.unshift(temp);

        if (temp.name === 'Fall') {
          // Fall case
          temp = { startDate: new Date(temp.startDate.getFullYear() + 1, 0, 1), endDate: new Date(temp.startDate.getFullYear() + 1, 4, 6), name: 'Spring' };
        } else if (temp.name === 'Spring') {
          // Spring case
          temp = { startDate: new Date(temp.startDate.getFullYear(), 4, 6), endDate: new Date(temp.startDate.getFullYear(), 7, 15), name: 'Summer' };
        } else {
          // Summer case
          temp = { startDate: new Date(temp.startDate.getFullYear(), 7, 15), endDate: new Date(temp.startDate.getFullYear() + 1, 0, 1), name: 'Fall' };
        }
      }
      Authentication.loading = false;
    };

    // Open the list of students modal
    $scope.studentModal = function(study) {
      $scope.currentStudy = study;
      $scope.extraCredit.data = $scope.currentStudy.list;

      $scope.extraCredit = new NgTableParams({
        count: 10,
        sorting: {
          lastName: 'asc'
        }
      }, {
        counts: [], // hides page sizes
        dataset: $scope.extraCredit.data // select data
      });

      $('#studentModal').modal('show');
    };

    // Open the add course modal
    $scope.courseModal = function() {
      $scope.error = '';
      $scope.newCourse = {};
      $('#addCourseModal').modal('show');
    };

    // Add the new course code to the database
    $scope.addCourse = function() {
      if (!Authentication.loading) {
        $scope.error = '';
        Authentication.loading = true;

        if (!$scope.newCourse.name) {
          $scope.error = 'The course name cannot be empty!';
          Authentication.loading = false;
        } else {
          $http.post('/api/courses/', $scope.newCourse, $scope.header).success((response) => {
            $('#addCourseModal').modal('hide');
            $scope.init();
            Authentication.loading = false;
          }).error((err) => {
            $scope.error = 'This course is already in the system!';
            Authentication.loading = false;
          });
        }
      }
    };

    // Export the list of students for canvas
    $scope.exportCSV = function() {
      if (!Authentication.loading) {
        Authentication.loading = true;

        const fileName = "Grades-" + $scope.currentStudy.studyTitle + '.csv';
        let mimeType = 'text/csv;encoding=utf-8';
        //$scope.extraCredit.data
        let data = [['Student,' , 'ID,' , 'SIS User ID,' , 'SIS Login ID,' , 'Section,' , $scope.newAssignment]];
        let tempArray = [""];
        data.push(tempArray);
        for (let i = 0; i < $scope.extraCredit.data.length; i++) {
          tempArray = ["\"" + $scope.extraCredit.data[i].lastName + ", " + $scope.extraCredit.data[i].firstName + "\""]; //some random ID?
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
        if (navigator.msSaveBlob) { //IE10
          navigator.msSaveBlob(new Blob([csvContent], {
            type: mimeType
          }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
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
        $('#exportModal').modal('hide');
        Authentication.loading = false;
      }
    };

    // Declare methods that can be used to access session data
    $scope.sessions = {
      extraCreditByCourse: function(courseName) {
        return $http.put(window.location.origin + '/api/sessions/course/' + courseName, $scope.selectedSemester, $scope.header);
      }
    };

    // Declare methods that can be used to access course data
    $scope.courses = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/courses/faculty/', $scope.header);
      },
    };

    // Run our init functions
    $scope.init();
    $scope.init2();
  }
]);
