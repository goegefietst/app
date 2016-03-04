(function() {
  'use strict';

  angular
    .module('app.performance')
    .config(function($stateProvider) {

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider

      // Each tab has its own nav history stack:

        .state('tab.performance', {
        url: '/performance',
        abstract: true,
        views: {
          'tab-performance': {
            templateUrl: 'app/performance/performance.template.html'
          }
        }
      })

      .state('tab.performance.personal', {
        url: '/personal',
        views: {
          'prestaties-page': {
            templateUrl: 'app/performance/performance-personal/performance-personal.template.html',
            controller: 'PersonalPerformanceController as personal'
          }
        }
      })

      .state('tab.performance.group', {
        url: '/group',
        views: {
          'prestaties-page': {
            templateUrl: 'app/performance/performance-group/performance-group.template.html',
            controller: 'GroupPerformanceController'
          }
        }
      });
    });
})();
