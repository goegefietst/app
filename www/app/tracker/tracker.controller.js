(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);
  //dependencies
  Controller.$inject = [
    '$ionicPlatform',
    '$scope',
    '$http',
    '$window',
    '$state',
    '$ionicPopup',
    'leafletData',
    'BackgroundGeolocationService',
    'Database'
  ];

  /* @ngInject */
  function Controller(
    $ionicPlatform,
    $scope,
    $http,
    $window,
    $state,
    $ionicPopup,
    leafletData,
    BackgroundGeolocationService,
    Database) {

    var vm = this;
    var timestamp;
    var running = false;
    var contentHeight =
      angular.element(document.getElementById('content'))[0].offsetHeight;

    vm.distance = 0.0;
    vm.speed = 0.0;
    vm.markers = [];
    vm.paths = {};
    vm.statsHeight = contentHeight * 3 / 9;
    vm.mapHeight = contentHeight * 5 / 9;
    vm.buttonHeight = contentHeight * 1 / 9;
    vm.stopwatch = {
      hours: '00',
      minutes: '00',
      seconds: '00'
    };
    vm.defaults = { //todo: check configurations
      touchZoom: true,
      scrollWheelZoom: true,
      zoomControl: false,
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

    vm.toggle = toggle; //START AND STOP TRACKING
    vm.startStopwatch = startStopwatch; //START THE STOPWATCH
    vm.stopStopwatch = stopStopwatch; //STOP THE STOPWATCH

    vm.clearRoutes = clearRoutes; //DELETE ROUTES FROM MAP
    vm.clearMarkers = clearMarkers; //DELETE MARKERS FROM MAP
    vm.addMarker = addMarker; //ADD MARKER TO MAP
    vm.setView = setView; //SET VIEW OF MAP
    vm.drawRoute = drawRoute; //DRAWS ROUTE ON MAP

    $ionicPlatform.ready().then(checkService);

    BackgroundGeolocationService.subscribe($scope, function dataUpdated() {
      console.log('Data updated!');
      getRoute();
    });

    function toggle() {
      if (!vm.tracking) {
        console.log('app starts vm.tracking');
        cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
          if (enabled) {
            if ($window.localStorage.getItem('platform') === 'Android') {
              cordova.plugins.diagnostic.getLocationMode(function(mode) {
                if (mode !== 'high_accuracy') {
                  showPopup('accuracy');
                }
              });
            }
            BackgroundGeolocationService.start();
            vm.startStopwatch();
            vm.tracking = true;
            vm.textButton = 'Stop route';
          } else {
            showPopup('location');
          }
        });
      } else {
        console.log('app stops vm.tracking');
        var route = BackgroundGeolocationService.stop();
        console.log(route);
        vm.tracking = false;
        vm.distance = 0.0;
        vm.speed = 0.0;
        vm.textButton = 'Start route';

        vm.stopStopwatch();
        vm.clearRoutes();
        vm.clearMarkers();

        Database.insertRoute(route);
        $state.go('tab.performance.personal', {
          route: route
        });
      }
    }

    function startStopwatch() {
      var now = new Date();
      timestamp = now.getTime();
      running = true;
      timecounter();
    }

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

    function timecounter() {
      var now = new Date();
      var timediff = now.getTime() - timestamp;
      if (running === true) {
        var time = formattedtime(timediff);
        vm.stopwatch.hours = time.hours;
        vm.stopwatch.minutes = time.minutes;
        vm.stopwatch.seconds = time.seconds;
        console.log(vm.stopwatch.hours + ':' +
          vm.stopwatch.minutes + ':' +
          vm.stopwatch.seconds);

        setTimeout(function() {
          timecounter();
          $scope.$apply();
        }, 1000);

      }
    }

    function checkService() {
      var running = window.localStorage.getItem('bgGPS');
      if (running === '1') {
        console.log('service is still running');
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
        //vm.tracking = true;
        //vm.textButton = 'Stop route';
      } else {
        vm.tracking = false;
        vm.textButton = 'Start route';
        vm.distance = 0.0;
      }
    }

    function getRoute() {
      var latlngs = [];
      var locations = BackgroundGeolocationService.getLocations();
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
        console.log(vm.speed);
      }

      vm.drawRoute(latlngs);
    }

    function formattedtime(unformattedtime) {
      var second = Math.floor(unformattedtime / 1000);
      var minute = Math.floor(unformattedtime / 60000);
      var hour = Math.floor(unformattedtime / 3600000);
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

    vm.loadRoute = function() {
      $http.get('route.geo.json').success(function(data, status) {
        if (status !== 200) {
          console.log('Something went wrong, status code: ' + status);
        }
        angular.extend($scope, {
          geojson: {
            data: data,
            style: {
              color: 'red',
              weight: 4,
              opacity: 0.5
            }
          }
        });
        var coordinates = data.features[0].geometry.coordinates;
        vm.addMarker({
          lng: coordinates[coordinates.length - 1][0],
          lat: coordinates[coordinates.length - 1][1]
        });
      });
    };

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

    function setView(latlng) {
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

      vm.clearRoutes();
      vm.clearMarkers();

      var path = {
        type: 'polyline',
        weight: 4,
        color: 'red',
        opacity: 0.5,
        latlngs: route
      };
      vm.paths.path = path;

      if (route.length > 0) {
        var lastPoint = {
          lat: route[route.length - 1][0],
          lng: route[route.length - 1][1]
        };
        vm.addMarker(lastPoint);
        vm.setView(lastPoint);
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

    function showPopup(type) {
      var myPopup = $ionicPopup.show({
        template: type === 'accuracy' ?
          '<p>Je resultaten zullen nauwkeuriger zijn als' +

          ' je locatie op de grootste nauwkeurigheid staat.</p>' :
          '<p>We kunnen enkel je route tracken als je locatie aanstaat.</p>',
        title: type === 'accuracy' ? 'Nauwkeurigheid' : 'Locatie',
        buttons: [{
          text: 'Annuleer'
        }, {
          text: '<b>Instellingen</b>',
          type: 'button-royal',
          onTap: function() {
            if ($window.localStorage.getItem('platform') === 'Android') {
              BackgroundGeolocationService.locationSettings();
            } else {
              cordova.plugins.diagnostic.switchToSettings(function() {
                console.log('Successfully switched to Settings app');
              },
              function(error) {
                console.error('The following error occurred: ' + error);
              });
            }
          }
        }]
      });
      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });
    }
  }
})();
