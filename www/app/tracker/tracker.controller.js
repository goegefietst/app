(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);

  Controller.$inject = ['$scope', 'leafletData']; //dependencies

  /* @ngInject */
  function Controller($scope, leafletData) {
    var vm = this;
    angular.extend($scope, {
      gent: {
        lat: 55, //51.050,
        lng: 4, //3.733,
        zoom: 10
      },
      markers: []
    });

    var clearRoutes = function() {
      $scope.paths = {};
    };

    var addMarker = function(latlng) {
      $scope.markers.push({
        lat: latlng.lat,
        lng: latlng.lng
      });
    };

    var setView = function(latlng) {
      leafletData.getMap('map').then(
        function(map) {
          map.setView(latlng);
        }
      );
    };

    var drawRoutes = function(routes) {
      clearRoutes();

      routes.type = 'multiPolyline';
      routes.weight = 4;
      routes.color = 'red';
      routes.opacity = 0.5;
      $scope.paths.multiPolyline = routes;

      var lastPoint = routes.latlngs[0][routes.latlngs[0].length - 1];
      addMarker(lastPoint);
      setView(lastPoint);
    };

    drawRoutes(routes);
  }
})();
