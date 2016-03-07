var geolocation = angular.module('app.geolocation', []);

geolocation.factory('BackgroundGeolocationService', ['$q', function($q) {
  'use strict';

  var callbackFn = function(location) {
    //console.log(location);
    logLocation(location);
    //$http({
    //request options to send data to server
    //});
    backgroundGeoLocation.finish();
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
    }
  };
}]);

function logLocation(location) {
  'use strict';
  var date = new Date(0);
  date.setTime(location.time);
  console.log(
    date.getHours() + ':' +
    date.getMinutes() + ':' +
    date.getSeconds() +
    ' lat: ' + location.latitude +
    ' lng: ' + location.longitude);
}
