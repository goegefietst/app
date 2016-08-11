(function() {
  'use strict';

  angular
    .module('app.tracker')
    .service('Location', LocationService);

  LocationService.$inject = [
    '$q', '$window'
  ];

  /**
   * @ngdoc service
   * @name app.tracker.service:LocationService
   * @description
   * Service that is responsible for checking which location settings are enabled.
   */
  function LocationService($q, $window) {

    /**
     * @ngdoc method
     * @name checkLocationPermission
     * @methodOf app.tracker.service:LocationService
     * @description
     * Checks whether the app has location permission.
     * @returns {Promise} promise resolved if permission granted
     */
    this.checkLocationPermission = hasLocationPermission;

    /**
     * @ngdoc method
     * @name requestLocationPermission
     * @methodOf app.tracker.service:LocationService
     * @description
     * Requests location permission.
     * @returns {Promise} promise resolved if permission granted
     */
    this.requestLocationPermission = requestLocationPermission;

    /**
     * @ngdoc method
     * @name checkLocationEnabled
     * @methodOf app.tracker.service:LocationService
     * @description
     * Checks whether the location services are enabled.
     * @returns {Promise} promise resolved if location services are enabled
     */
    this.checkLocationEnabled = checkLocationEnabled;

    /**
     * @ngdoc method
     * @name checkHighAccuracy
     * @methodOf app.tracker.service:LocationService
     * @description
     * Checks whether location services are in high accuracy mode (Android only).
     * @returns {Promise} promise resolved if high accuracy enabled or iOS
     */
    this.checkHighAccuracy = checkHighAccuracy;

    var PERMISSION = 'PERMISSION';
    this.PERMISSION = PERMISSION;
    var LOCATION = 'LOCATION';
    this.LOCATION = LOCATION;
    var HIGH_ACCURACY = 'HIGH_ACCURACY';
    this.HIGH_ACCURACY = HIGH_ACCURACY;

    function hasLocationPermission() {
      var deferred = $q.defer();
      cordova.plugins.diagnostic.isLocationAuthorized(function(enabled) {
        if (!enabled) {
          deferred.reject(PERMISSION);
        } else {
          deferred.resolve();
        }
      });
      return deferred.promise;
    }

    function requestLocationPermission() {
      var deferred = $q.defer();
      cordova.plugins.diagnostic.requestLocationAuthorization(function(status) {
        if (status === 'GRANTED') {
          deferred.resolve();
        } else {
          deferred.reject(PERMISSION);
        }
      });
      return deferred.promise;
    }

    function checkLocationEnabled() {
      console.log('IN: ' + LOCATION);
      var deferred = $q.defer();
      cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
        if (enabled) {
          console.log('Location is enabled');
          deferred.resolve();
        } else {
          deferred.reject(LOCATION);
        }
      });
      return deferred.promise;
    }

    function checkHighAccuracy() {
      console.log('IN: ' + HIGH_ACCURACY);
      var deferred = $q.defer();
      if ($window.localStorage.getItem('platform') === 'Android') {
        cordova.plugins.diagnostic.getLocationMode(function(mode) {
          if (mode !== 'high_accuracy') {
            console.log('HIGH ACCURACY OFF');
            deferred.reject(HIGH_ACCURACY);
          } else {
            console.log('HIGH ACCURACY ON');
            deferred.resolve();
          }
        });
      } else {
        //iOS
        deferred.resolve();
      }
      return deferred.promise;
    }
  }
})();
