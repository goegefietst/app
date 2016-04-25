(function() {
'use strict';

angular
  .module('app.group')
  .config(function($stateProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // Each tab has its own nav history stack:

      .state('tab.group', {
      url: '/group',
      views: {
        'tab-group': {
          templateUrl: 'app/group/group.template.html',
          controller: 'GroupController as group'
        }
      }
    });
  });
})();
