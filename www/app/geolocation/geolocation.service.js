(function() {
  'use strict';

  angular
    .module('geolocation')
    .factory('BackgroundGeolocationService', ['$q', '$rootScope', function($q, $rootScope) {
      var locations = [];

      var callbackFn = function(location) {
        //console.log(location);
        logLocation(location);
        locations.push([location.latitude, location.longitude]);
        //$http({
        //request options to send data to server
        //});
        backgroundGeoLocation.finish();
        $rootScope.$emit('geolocation-service-event');
      };

      var failureFn = function(error) {
        console.log('BackgroundGeoLocation error ' + JSON.stringify(error));
      };

      //Enable background geolocation
      var start = function() {
        //save settings (background tracking is enabled) in local storage
        window.localStorage.setItem('bgGPS', 1);
        backgroundGeoLocation.configure(callbackFn, failureFn, {
          desiredAccuracy: 10,
          stationaryRadius: 1,
          distanceFilter: 1,
          locationTimeout: 1,
          locationService: backgroundGeoLocation.service.ANDROID_DISTANCE_FILTER,
          debug: false,
          stopOnTerminate: false,
          fastestInterval: 1000,
          activitiesInterval: 10000
        });

        backgroundGeoLocation.start();
      };

      return {
        start: start,

        // Initialize service and enable background geolocation by default
        init: function() {
          var bgGPS = window.localStorage.getItem('bgGPS');

          if (bgGPS == 1 || bgGPS == null) {
            start();
          }
        },

        // Stop data tracking
        stop: function() {
          window.localStorage.setItem('bgGPS', 0);
          backgroundGeoLocation.stop();
        },

        subscribe: function(scope, callback) {
          var handler = $rootScope.$on('geolocation-service-event', callback);
          scope.$on('$destroy', handler);
        },

        notify: function() {
          $rootScope.$emit('geolocation-service-event');
        },

        locations: locations

      };
    }]);

  function logLocation(location) {
    var date = new Date(0);
    date.setTime(location.time);
    console.log(
      date.getHours() + ':' +
      date.getMinutes() + ':' +
      date.getSeconds() +
      ' lat: ' + location.latitude +
      ' lng: ' + location.longitude);
  }
})();
