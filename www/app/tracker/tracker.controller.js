/**
 * @namespace Tracker
 */
(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);

  Controller.$inject = [
    '$ionicPlatform',
    '$scope',
    '$q',
    '$window',
    '$state',
    '$ionicPopup',
    'leafletData',
    'BackgroundGeolocationService',
    'Database',
    'LocationSettings',
    'Popup'
  ];

  /**
   * @class
   * @name TrackerController
   * @memberof Tracker
   * @description Controller responsible for tracking tab
   */
  /* @ngInject */
  function Controller($ionicPlatform, $scope, $q, $window,
                      $state, $ionicPopup, leafletData,
                      BackgroundGeolocationService, Database,
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
    $ionicPlatform.ready().then(checkService);

    // SUBSCRIBE TO GEOLOCATION SERVICE AND UPDATE UI FOR EVERY LOCATION SAVED
    BackgroundGeolocationService.subscribe($scope, function dataUpdated() {
      var locations = BackgroundGeolocationService.getLocations();
      updateUI(locations);
      if (isStationary(locations)) {
        stopTracking();
        Popup.showStopped();
      }
    });

    /**
     * @function
     * @name toggleTracking
     * @memberof Tracker.TrackerController
     * @description Toggles tracking on and off
     */
    function toggleTracking() {
      if (!vm.tracking) {
        startTracking();
      } else {
        stopTracking();
      }
    }

    /**
     * @function
     * @name startTracking
     * @memberof Tracker.TrackerController
     * @description Promise chain for start tracking
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
        .then(BackgroundGeolocationService.start)
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
     * @function
     * @name stopTracking
     * @memberof Tracker.TrackerController
     * @description Promise chain for stop tracking
     */
    function stopTracking() {
      if (!vm.tracking) {
        console.log('CANNOT STOP TRACKING: IS NOT TRACKING');
        return;
      }
      var route = BackgroundGeolocationService.stop();
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
     * @function
     * @name startStopwatch
     * @memberof Tracker.TrackerController
     * @description Set timestamp and start a time counter
     */
    function startStopwatch() {
      var now = new Date();
      timestamp = now.getTime();
      running = true;
      timeCounter();
      return $q.resolve();
    }

    /**
     * @function
     * @name timeCounter
     * @memberof Tracker.TrackerController
     * @description Updates the stopwatch time every second
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
     * @function
     * @name stopStopwatch
     * @memberof Tracker.TrackerController
     * @description Stop time counter and reset stopwatch
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
     * @function
     * @name checkService
     * @memberof Tracker.TrackerController
     * @description Checks if a previous geolocation service was still running, if so it ends it and notifies the user.
     */
    function checkService() {
      var running = window.localStorage.getItem('bgGPS');
      if (running === '1') {
        console.log('PREVIOUS GEOLOCATION SERVICE STILL RUNNING');
        $ionicPopup.show({
          title: 'Rit gestopt',
          template: 'De app werd afgesloten tijdens je meest recente rit.' +
          ' De data is daarom helaas verloren gegaan.',
          buttons: [{
            text: 'OK',
            type: 'button-royal'
          }]
        });
        BackgroundGeolocationService.start();
        BackgroundGeolocationService.stop();
        vm.tracking = false;
        vm.textButton = 'Start route';
        vm.distance = 0.0;
      } else {
        vm.tracking = false;
        vm.textButton = 'Start route';
        vm.distance = 0.0;
      }
    }

    /**
     * @function
     * @name updateUI
     * @memberof Tracker.TrackerController
     * @description Retrieves route from local db then updates the UI (map, distance, speed) to reflect changes
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
     * @function
     * @name formatTime
     * @memberof Tracker.TrackerController
     * @description Format ms to object with hour, minutes and seconds
     * @returns {Object} hours, minutes and seconds
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

    function isStationary(locations) {
      return false;
    }

    function clearRoutes() {
      vm.paths = {};
    }

    function clearMarkers() {
      vm.markers = [];
    }

    function addMarker(latlng) {
      vm.markers.push({
        lat: latlng.lat,
        lng: latlng.lng
      });
    }

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

    function drawRoute(route) {
      if (!route) {
        return;
      }
      clearRoutes();
      clearMarkers();
      vm.paths.path = {
        type: 'polyline',
        weight: 4,
        color: 'red',
        opacity: 0.5,
        latlngs: route
      };
      if (route.length > 0) {
        var lastPoint = {
          lat: route[route.length - 1][0],
          lng: route[route.length - 1][1]
        };
        addMarker(lastPoint);
        moveViewTo(lastPoint);
      }
    }

    function getDistance(lat1, lon1, lat2, lon2) {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
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
