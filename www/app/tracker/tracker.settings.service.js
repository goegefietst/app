/**
 * @namespace LocationSettings
 */
(function() {
  'use strict';

  angular
    .module('app.tracker')
    .service('LocationSettings', LocationSettings);

  LocationSettings.$inject = [
    '$q', '$window'
  ];

  /**
   * @class
   * @name Service
   * @memberof LocationSettings
   * @description Service that is responsible for checking which location settings are enabled.
   */
  function LocationSettings($q, $window) {

    this.checkLocationPermission = hasLocationPermission;
    this.requestLocationPermission = requestLocationPermission;
    this.checkLocationEnabled = checkLocationEnabled;
    this.checkHighAccuracy = checkHighAccuracy;
    var PERMISSION = 'PERMISSION';
    this.PERMISSION = PERMISSION;
    var LOCATION = 'LOCATION';
    this.LOCATION = LOCATION;
    var HIGH_ACCURACY = 'HIGH_ACCURACY';
    this.HIGH_ACCURACY = HIGH_ACCURACY;

    /**
     * @function
     * @name hasLocationPermission
     * @description Checks if the app is authorized to use location services
     * @memberof LocationsSettings.Service
     * @returns {Promise}
     */
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

    /**
     * @function
     * @name checkLocationEnabled
     * @description Checks if location services are enabled
     * @memberof LocationsSettings.Service
     * @returns {Promise}
     */
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

    /**
     * @function
     * @name checkHighAccuracy
     * @description Checks if high accuracy mode is enabled
     * @memberof LocationsSettings.Service
     * @returns {Promise}
     */
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
