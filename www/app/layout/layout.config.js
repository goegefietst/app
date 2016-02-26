(function() {
  'use strict';

  angular
    .module('app.layout')
    .config(function($stateProvider, $urlRouterProvider) {

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider

      // setup an abstract state for the tabs directive
        .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'app/layout/layout.html'
      });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/tracker');

    });
})();
