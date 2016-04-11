(function() {
  'use strict';

  angular.module('app', [
    'ionic',
    'app.tracker',
    'app.performance',
    'app.settings',
    'app.layout',
    'ionic-timepicker',
    'database',
    'connection'
  ])

  .run(function($ionicPlatform, $cordovaNetwork, $window, $q, Database, Connection) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins &&
        window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.backgroundColorByHexString('#f07b47');
      }
    });
    $ionicPlatform.on('pause', function() {
      if (
        $cordovaNetwork.getNetwork() !== 'wifi' ||
        $cordovaNetwork.isOnline() === false
      ) {
        return;
      }
      var uuid = $window.localStorage.getItem('uuid');
      var secret = $window.localStorage.getItem('secret');
      if (uuid === null || secret === null) {
        Connection.makeAccount().then(function(data) {
          uuid = data.uuid;
          secret = data.secret;
          $window.localStorage.setItem('uuid', data.uuid);
          $window.localStorage.setItem('secret', data.secret);
        });
      }

      var callback = function(routes) {
        if (Object.prototype.toString.call(routes) !== '[object Array]' ||
          routes.length < 1) {
          console.log('ERROR: ROUTES IS NOT AN ARRAY OR AN EMPTY ARRAY');
          console.log(routes);
          return;
        }
        for (var i = 0; i < routes.length; i++) {
          var callback = function(points) {
            var route = routes[i];
            route.points = points;
            Connection.postRoute(uuid, secret, route).then(function() {
              console.log('Sent a route to the server');
              console.log(route);
              Database.sentRoute(route);
            });
          };
          Database.selectPoints(callback, [routes[i].id]);

        }
      };
      var options = {
        sent: true
      };
      Database.selectRoutes(callback, options);

      /*
      FOR TESTING PURPOSES
      Connection.getRoutes().then(function(d) {
        console.log('DATA');
        console.log(d);
      });
      */
    });
  });
})();
