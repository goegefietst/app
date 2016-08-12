(function() {
  'use strict';

  angular
    .module('geolocation')
    .service('Geolocation', Geolocation);

  Geolocation.$inject = ['$q', '$rootScope'];

  /**
   * @ngdoc service
   * @name geolocation.service:GeolocationService
   * @description
   * Service responsible for tracking with geolocation.
   */
  /* @ngInject */
  function Geolocation($q, $rootScope) {
    /**
     * @ngdoc property
     * @name locations
     * @propertyOf geolocation.service:GeolocationService
     * @description
     * Array to which locations are pushed while tracking.
     */
    var locations = [];

    this.start = start;
    this.stop = stop;
    this.subscribe = subscribe;
    this.getLocations = getLocations;

    /**
     * @ngdoc method
     * @name start
     * @methodOf geolocation.service:GeolocationService
     * @description
     * Start tracking with geolocation.<br/>
     * Sets localStorage item 'bgGPS' to 1.<br/>
     * Points are pushed to {@link geolocation.service:GeolocationService locations}.<br/>
     * Emits 'geolocation-service-event' on $rootScope every time a location is added.
     * @return {Promise} promise resolves if tracking started successfully
     */
    function start() {
      var callbackFn = function(location) {
        logLocation(location);
        locations.push({
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          accuracy: location.accuracy,
          speed: location.speed,
          time: location.time === undefined ? Date.now() : location.time
        });
        backgroundGeoLocation.finish();
        $rootScope.$emit('geolocation-service-event');
      };
      var failureFn = function(error) {
        console.log('Geolocation error ' + JSON.stringify(error));
      };
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
        stopOnTerminate: true,
        fastestInterval: 1000,
        activitiesInterval: 10000
      });
      backgroundGeoLocation.start();
      return $q.resolve();
    }

    /**
     * @ngdoc method
     * @name stop
     * @methodOf geolocation.service:GeolocationService
     * @description
     * Stop tracking with geolocation.<br/>
     * Sets localStorage item 'bgGPS' to 0.<br/>
     * @return {Array} locations array with registered locations
     */
    function stop() {
      window.localStorage.setItem('bgGPS', 0);
      backgroundGeoLocation.stop();
      console.log('stopped tracking');
      return locations;
    }

    /**
     * @ngdoc method
     * @name subscribe
     * @methodOf geolocation.service:GeolocationService
     * @description
     * Subscribes to 'geolocation-service-event'.<br/>
     * Callback is called every time event occurs.
     * @param {$scope} scope scope
     * @param {function} callback callback to be called on event
     */
    function subscribe(scope, callback) {
      var handler = $rootScope.$on('geolocation-service-event', callback);
      scope.$on('$destroy', handler);
    }

    /**
     * @ngdoc method
     * @name getLocations
     * @methodOf geolocation.service:GeolocationService
     * @return {Array} locations array with registered locations
     */
    function getLocations() {
      return locations;
    }
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

