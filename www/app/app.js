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

      var options = {
        notSent: true
      };

      Database
        .selectRoutes(options)
        .then(addPoints)
        .then(sendRoutes);

      function addPoints(values) {
        var deferred = $q.defer();
        var routes = values.routes;
        if (Object.prototype.toString.call(routes) !== '[object Array]' ||
          routes.length < 1) {
          console.log('ERROR: ROUTES IS NOT AN ARRAY OR AN EMPTY ARRAY');
          console.log(routes);
          deferred.reject('ERROR: ROUTES IS NOT AN ARRAY OR AN EMPTY ARRAY');
          return deferred.promise;
        }
        var promises = [];
        for (var i = 0; i < routes.length; i++) {
          promises.push(getPoints(routes[i]));
        }
        $q.all(promises).then(function() {
          deferred.resolve(routes);
        }, function(reason) {
          deferred.reject(reason);
        });

        function getPoints(route) {
          var deferred = $q.defer();
          Database
            .selectPoints([route.id])
            .then(function(points) {
              route.points = points;
              deferred.resolve(points);
            }, function(error) {
              deferred.reject(error);
            });
          return deferred.promise;
        }
        return deferred.promise;
      }

      function sendRoutes(routes) {
        var deferred = $q.defer();
        var promises = [];
        for (var i = 0; i < routes.length; i++) {
          promises.push(postRoute(uuid, secret, routes[i]).then(sentRoute));
        }

        function postRoute(uuid, secret, route) {
          var deferred = $q.defer();
          Connection.postRoute(uuid, secret, route).then(function() {
            deferred.resolve(route);
          }, function() {
            deferred.reject();
          });
          return deferred.promise;
        }

        function sentRoute(route) {
          var deferred = $q.defer();
          Database.sentRoute(route).then(function() {
            deferred.resolve();
          }, function() {
            deferred.reject();
          });
          return deferred.promise;
        }

        $q.all(promises).then(function() {
          deferred.resolve(routes);
        }, function(reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
      }

    });
  });
})();
