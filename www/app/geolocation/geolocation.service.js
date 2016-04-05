(function() {
  'use strict';

  angular
    .module('geolocation')
    .factory('BackgroundGeolocationService', ['$q', '$rootScope', function($q, $rootScope) {
      var locations = [];

      var callbackFn = function(location) {
        console.log(location);
        logLocation(location);
        locations.push({
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          accuracy: location.accuracy,
          speed: location.speed,
          time: location.time
        });
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
        locations = [];
        window.localStorage.setItem('bgGPS', 1);
        backgroundGeoLocation.configure(callbackFn, failureFn, {
          desiredAccuracy: 10,
          stationaryRadius: 1,
          distanceFilter: 1,
          locationTimeout: 1,
          notificationTitle: 'Goe Gefietst',
          notificationIconColor: '#ee6e35',
          notificationText: 'Goe Gefietst is uw route aan het tracken',
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

          if (bgGPS === 1) {
            start();
          }
        },

        // Stop data tracking
        stop: function() {
          window.localStorage.setItem('bgGPS', 0);
          backgroundGeoLocation.stop();
          console.log('stopped tracking');
          return locations;
        },

        subscribe: function(scope, callback) {
          var handler = $rootScope.$on('geolocation-service-event', callback);
          scope.$on('$destroy', handler);
        },

        notify: function() {
          $rootScope.$emit('geolocation-service-event');
        },

        getLocations: function() {
          return locations;
        },

        check: check,

        locationSettings: function() {
          backgroundGeoLocation.showLocationSettings();
        }
      };
    }]);

  function check(callback) {
    backgroundGeoLocation.isLocationEnabled(function(enabled) {
      if (enabled) {
        callback(enabled);
      } else {
        callback(enabled);
      }
    });
  }

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
