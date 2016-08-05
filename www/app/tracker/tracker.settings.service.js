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

    this.checkLocationAuthorized = checkLocationAuthorized;
    this.checkLocationEnabled = checkLocationEnabled;
    this.checkHighAccuracy = checkHighAccuracy;
    LocationSettings.AUTHORIZATION = 'AUTHORIZATION';
    LocationSettings.ENABLED = 'ENABLED';
    LocationSettings.HIGH_ACCURACY = 'HIGH_ACCURACY';

    /**
     * @function
     * @name checkLocationAuthorized
     * @description Checks if the app is authorized to use location services
     * @memberof LocationsSettings.Service
     * @returns {Promise}
     */
    function checkLocationAuthorized() {
      console.log('IN: ' + LocationSettings.AUTHORIZATION);
      var deferred = $q.defer();
      cordova.plugins.diagnostic.isLocationAuthorized(function(enabled) {
        if (!enabled) {
          cordova.plugins.diagnostic
            .requestLocationAuthorization(function(status) {
              if (status === 'GRANTED') {
                deferred.resolve();
              } else {
                deferred.reject(LocationSettings.AUTHORIZATION);
              }
            });
        } else {
          deferred.resolve();
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
      console.log('IN: ' + LocationSettings.ENABLED);
      var deferred = $q.defer();
      cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
        if (enabled) {
          console.log('Location is enabled');
          deferred.resolve();
        } else {
          deferred.reject(LocationSettings.ENABLED);
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
      console.log('IN: ' + LocationSettings.HIGH_ACCURACY);
      var deferred = $q.defer();
      if ($window.localStorage.getItem('platform') === 'Android') {
        cordova.plugins.diagnostic.getLocationMode(function(mode) {
          if (mode !== 'high_accuracy') {
            console.log('HIGH ACCURACY OFF');
            deferred.reject(LocationSettings.HIGH_ACCURACY);
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
