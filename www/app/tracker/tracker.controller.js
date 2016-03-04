(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);

  Controller.$inject = ['$scope', '$http', 'leafletData']; //dependencies

  /* @ngInject */
  function Controller($scope, $http, leafletData) {
    var vm = this;
    angular.extend($scope, {
      gent: {
        lat: 51.050,
        lng: 3.733,
        zoom: 10
      },
      markers: []
    });

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

    vm.clearRoutes = function() {
      $scope.paths = {};
    };

    vm.clearMarkers = function() {
      $scope.markers = [];
    };

    vm.addMarker = function(latlng) {
      $scope.markers.push({
        lat: latlng.lat,
        lng: latlng.lng
      });
    };

    vm.setView = function(latlng) {
      leafletData.getMap('map').then(
        function(map) {
          map.setView(latlng);
        }
      );
    };

    vm.drawRoutes = function(routes) {
      vm.clearRoutes();
      vm.clearMarkers();

      routes.type = 'multiPolyline';
      routes.weight = 4;
      routes.color = 'red';
      routes.opacity = 0.5;
      $scope.paths.multiPolyline = routes;

      var lastPoint = routes.latlngs[0][routes.latlngs[0].length - 1];
      vm.addMarker(lastPoint);
      vm.setView(lastPoint);
    };

    vm.loadRoute();
    //drawRoutes(routes);
  }
})();
