(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);

  Controller.$inject = [
    '$ionicPlatform',
    '$scope',
    '$window',
    '$q',
    '$state',
    '$ionicPopup',
    'leafletData',
    'BackgroundGeolocationService',
    'Database',
    'LocationSettings',
    'Popup'
  ];

  /**
   * @ngdoc controller
   * @name app.tracker.controller:TrackerController
   * @description
   * Controller responsible for tracking.
   */
  /* @ngInject */
  function Controller($ionicPlatform, $scope, $window, $q,
                      $state, $ionicPopup, leafletData,
                      Geolocation, Database,
                      LocationSettings, Popup) {

    var vm = this;

    // RELATIVE HEIGHT OF THE MAP, STATS AND BUTTON
    var contentHeight =
      angular.element(document.getElementById('content'))[0].offsetHeight;
    vm.height = {
      stats: contentHeight * 3 / 9,
      map: contentHeight * 5 / 9,
      button: contentHeight * 1 / 9
    };

    // MAP
    vm.markers = [];
    vm.paths = {};
    vm.defaults = { //todo: check configurations
      touchZoom: true,
      scrollWheelZoom: true,
      zoomControl: false
    };
    vm.location = {
      lat: 51.050,
      lng: 3.733,
      zoom: 10
    };
    vm.tiles = {
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/' +
        'copyright">OpenStreetMap</a> contributors'
      }
    };

    // DISTANCE, SPEED AND STOPWATCH
    vm.distance = 0.0;
    vm.speed = 0.0;
    vm.stopwatch = {
      hours: '00',
      minutes: '00',
      seconds: '00'
    };

    // BUTTON TO START & STOP TRACKING
    vm.textButton = 'Start route';
    vm.toggleTracking = toggleTracking; //START AND STOP TRACKING
    var timestamp; // Timestamp when tracking begun
    var running = false; // Whether tracking is on or not

    // SERVICE STILL RUNNING AFTER APP WAS CLOSED
    $ionicPlatform.ready().then(recover);

    // SUBSCRIBE TO GEOLOCATION SERVICE AND UPDATE UI FOR EVERY LOCATION SAVED
    Geolocation.subscribe($scope, function dataUpdated() {
      var locations = Geolocation.getLocations();
      updateUI(locations);
      if (vm.tracking && isStationary(locations, 15, 0.5)) {
        stopTracking();
        Popup.showStopped();
      }
    });

    /**
     * @ngdoc method
     * @name toggleTracking
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Toggles tracking on and off. See startTracking and startTracking.
     * @see stopTracking
     */
    function toggleTracking() {
      if (!vm.tracking) {
        startTracking();
      } else {
        stopTracking();
      }
    }

    /**
     * @ngdoc method
     * @name startTracking
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Attempts to start tracking.
     * 1. Checks if already tracking
     * 2. Checks for location permission and asks for permission
     * 3. Checks if location is enabled and redirects to settings
     * 4. Checks if high accuracy is enabled (not mandatory) and redirects to settings
     * 5. Start tracking with geolocation services and start stopwatch
     */
    function startTracking() {
      if (vm.tracking) {
        console.log('CANNOT START TRACKING: ALREADY TRACKING');
        return;
      }
      LocationSettings.checkLocationPermission()
        .catch(function() {
          return LocationSettings.requestLocationPermission();
        })
        .then(LocationSettings.checkLocationPermission)
        .then(LocationSettings.checkLocationEnabled)
        .then(LocationSettings.checkHighAccuracy)
        .catch(function(err) {
          // Only meant to catch high accuracy, rethrow if anything else
          if (err !== LocationSettings.HIGH_ACCURACY) {
            return $q.reject(err);
          }
          return Popup.showAccuracy().then(function(settings) {
            return settings ? $q.reject() : $q.resolve();
          });
        })
        .then(Geolocation.start)
        .then(startStopwatch)
        .then(function() {
          vm.tracking = true;
          vm.textButton = 'Stop route';
        }).catch(function(err) {
        switch (err) {
          case LocationSettings.PERMISSION:
            Popup.showPermission();
            break;
          case LocationSettings.LOCATION:
            Popup.showLocation();
            break;
        }
      });
    }

    /**
     * @ngdoc method
     * @name stopTracking
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Attempts to stop tracking.
     * 1. Checks if tracking
     * 2. Stop tracking with geolocation services, clear map and reset stopwatch
     * 3. Insert route in database
     * 4. Redirect to performance tab
     */
    function stopTracking() {
      if (!vm.tracking) {
        console.log('CANNOT STOP TRACKING: IS NOT TRACKING');
        return;
      }
      var route = Geolocation.stop();
      console.log(route);
      vm.tracking = false;
      vm.distance = 0.0;
      vm.speed = 0.0;
      vm.textButton = 'Start route';

      stopStopwatch();
      clearRoutes();
      clearMarkers();

      Database.insertRoute(route);
      $state.go('tab.performance.personal', {
        route: route
      });
    }

    /**
     * @ngdoc method
     * @name startStopwatch
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Set timestamp and start a timeCounter.
     */
    function startStopwatch() {
      var now = new Date();
      timestamp = now.getTime();
      running = true;
      timeCounter();
      return $q.resolve();
    }

    /**
     * @ngdoc method
     * @name timeCounter
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Updates the stopwatch time every second based on timestamp in startStopwatch.
     */
    function timeCounter() {
      var now = new Date();
      var timediff = now.getTime() - timestamp;
      if (running === true) {
        var time = formatTime(timediff);
        vm.stopwatch.hours = time.hours;
        vm.stopwatch.minutes = time.minutes;
        vm.stopwatch.seconds = time.seconds;
        setTimeout(function() {
          timeCounter();
          $scope.$apply();
        }, 1000);
      }
    }

    /**
     * @ngdoc method
     * @name stopStopwatch
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Stop time counter and reset stopwatch.
     */
    function stopStopwatch() {
      running = false;
      console.log('User tracked for ' +
        vm.stopwatch.hours + ':' +
        vm.stopwatch.minutes + ':' +
        vm.stopwatch.seconds);
      vm.stopwatch.hours = '00';
      vm.stopwatch.minutes = '00';
      vm.stopwatch.seconds = '00';
    }

    /**
     * @ngdoc method
     * @name recover
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Recovers from closing previous tracking session and notifies the user that the previous session was lost.
     */
    function recover() {
      if ($window.localStorage.getItem('bgGPS') === '1') {
        $window.localStorage.setItem('bgGPS', false);
        $ionicPopup.show({
          title: 'Rit gestopt',
          template: 'De app werd afgesloten tijdens je meest recente rit.' +
          ' De data is daarom helaas verloren gegaan.',
          buttons: [{
            text: 'OK',
            type: 'button-royal'
          }]
        });
      }
    }

    /**
     * @ngdoc method
     * @name updateUI
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Retrieves route from local db then updates the UI (map, distance, speed) to reflect changes.
     */
    function updateUI(locations) {
      var latlngs = [];
      var lastPoint;
      var secondLastPoint;

      for (var i = 0; i < locations.length; i++) {
        var point = locations[i];
        latlngs.push([point.latitude, point.longitude]);
      }

      if (locations.length === 1) {
        lastPoint = locations[(locations.length - 1)];
      }

      if (locations.length > 1) {
        lastPoint = locations[(locations.length - 1)];
        secondLastPoint = locations[(locations.length - 2)];
        vm.distance += getDistance(secondLastPoint.latitude,
          secondLastPoint.longitude,
          lastPoint.latitude,
          lastPoint.longitude);
        vm.distance = Math.round(vm.distance * 100) / 100;
        console.log(vm.distance);

        var duration = locations[locations.length - 1].time - locations[0].time;

        if (duration === 0) {
          vm.speed = 0;
        } else {
          vm.speed = (vm.distance / duration * 1000 * 60 * 60);
          vm.speed = Math.round(vm.speed * 100) / 100;
        }
        vm.speed = Math.round(vm.speed * 100) / 100;
      }

      drawRoute(latlngs);
    }

    /**
     * @ngdoc method
     * @name formatTime
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Format ms to object with hour, minutes and seconds.
     * @returns {Object}
     * {
     *  hours,
     *  minutes,
     *  seconds
     * }
     */
    function formatTime(ms) {
      var second = Math.floor(ms / 1000);
      var minute = Math.floor(ms / 60000);
      var hour = Math.floor(ms / 3600000);
      second = second - 60 * minute - 24 * hour;
      minute = minute - 24 * hour;

      second = second > 9 ? '' + second : '0' + second;
      minute = minute > 9 ? '' + minute : '0' + minute;
      hour = hour > 9 ? '' + hour : '0' + hour;

      return {
        hours: hour,
        minutes: minute,
        seconds: second
      };
    }

    /**
     * @ngdoc method
     * @name isStationary
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Whether all locations recorded within 'minutes' before the last location are within 'radius'.<br/>
     * Exception: if all location are within 'radius' of the first location it will not be considered stationary.
     * @param {Array} locations array of locations which contain 'time', 'latitude' and 'longitude'
     * @param {Number} minutes minutes before considered stationary
     * @param {Number} radius radius in kilometer
     * @returns {Boolean} stationary
     */
    function isStationary(locations, minutes, radius) {
      if (locations.length < 10) {
        return false;
      }
      var start = locations[0];
      var end = locations[locations.length - 1];
      var started = false;
      var stationary = true;
      for (var i = locations.length - 2; i > 0; i--) {
        var loc = locations[i];
        if (end.time - loc.time < minutes * 60 * 1000 &&
          getDistance(loc.latitude, loc.longitude,
            end.latitude, end.longitude) > radius) {
          stationary = false;
        }
        if (getDistance(loc.latitude, loc.longitude,
            start.latitude, start.longitude) > radius) {
          started = true;
        }
      }
      return stationary && started;
    }

    /**
     * @ngdoc method
     * @name clearRoutes
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Removes all paths from the map.
     */
    function clearRoutes() {
      vm.paths = {};
    }

    /**
     * @ngdoc method
     * @name clearRoutes
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Removes all markers from the map.
     */
    function clearMarkers() {
      vm.markers = [];
    }

    /**
     * @ngdoc method
     * @name addMarker
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Adds marker to the map.
     * @param {Object} latlng { lat, lng }
     */
    function addMarker(latlng) {
      vm.markers.push({
        lat: latlng.lat,
        lng: latlng.lng
      });
    }

    /**
     * @ngdoc method
     * @name moveViewTo
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Moves map view to latitude and longitude, retains zoom level.
     * @param {Object} latlng { lat, lng }
     */
    function moveViewTo(latlng) {
      leafletData.getMap('map').then(
        function(map) {
          vm.location = {
            lat: latlng.lat,
            lng: latlng.lng,
            zoom: map.getZoom()
          };
        }
      );
    }

    /**
     * @ngdoc method
     * @name drawRoute
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Moves map view to latitude and longitude, retains zoom level.
     * @param {Array} latlngs [ lat, lng ]
     */
    function drawRoute(latlngs) {
      if (!latlngs) {
        return;
      }
      clearRoutes();
      clearMarkers();
      vm.paths.path = {
        type: 'polyline',
        weight: 4,
        color: 'red',
        opacity: 0.5,
        latlngs: latlngs
      };
      if (latlngs.length > 0) {
        var lastPoint = {
          lat: latlngs[latlngs.length - 1][0],
          lng: latlngs[latlngs.length - 1][1]
        };
        addMarker(lastPoint);
        moveViewTo(lastPoint);
      }
    }

    /**
     * @ngdoc method
     * @name getDistance
     * @methodOf app.tracker.controller:TrackerController
     * @description
     * Calculates the distance between two locations.
     * @param {Number} lat1 latitude of first location
     * @param {Number} lng1 longitude of first location
     * @param {Number} lat2 latitude of second location
     * @param {Number} lng2 longitude of second location
     * @returns {Number} distance in km
     */
    function getDistance(lat1, lng1, lat2, lng2) {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lng1 - lng2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      return dist;
    }
  }
})();
