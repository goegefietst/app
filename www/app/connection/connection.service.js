(function() {
  'use strict';

  angular
    .module('connection')
    .service('Connection', ['$http', function($http) {

      this.getRoutes = getRoutes;
      this.makeAccount = makeAccount;
      this.updateTeams = updateTeams;
      this.postRoute = postRoute;
      this.getRoutesByUser = getRoutesByUser;
      this.getTeams = getTeams;
      this.getTeamDistances = getTeamDistances;

      function getRoutes() {
        return $http
          .get('https://goegefietst.gent/routes')
          .then(function(response) {
            console.log('GET ROUTES RESPONSE');
            console.log(response);
            return response.data;
          });
      }

      function makeAccount() {
        var success = function(response) {
          console.log('MAKE ACCOUNT SUCCESS');
          console.log(response);
          return response.data;
        };
        var error = function() {
          console.log('MAKE ACCOUNT ERROR');
        };
        return $http
          .post('https://goegefietst.gent/user')
          .then(success, error);
      }

      function updateTeams(uuid, secret, teams) {
        var config = {
          headers: {
            'secret': secret
          }
        };
        var data = {
          teams: teams
        };
        return $http
          .post('https://goegefietst.gent/user/' + uuid, data, config);
      }

      function postRoute(uuid, secret, route) {
        var config = {
          headers: {
            'secret': secret
          }
        };
        var data = route;
        return $http
          .post('https://goegefietst.gent/route/' + uuid, data, config)
          .then(function(response) {
            console.log('POST ROUTE RESPONSE');
            console.log(response);
            return response.data;
          });
      }

      function getRoutesByUser(uuid, secret) {
        var config = {
          headers: {
            'secret': secret
          }
        };
        return $http
          .get('https://goegefietst.gent/route/' + uuid, config)
          .then(function(response) {
            console.log('GET ROUTES BY USER RESPONSE');
            console.log(response);
            return response.data;
          });
      }

      function getTeams() {
        return $http
          .get('https://goegefietst.gent/teams/names')
          .then(function(response) {
            return response.data;
          });
      }

      function getTeamDistances() {
        return $http
          .get('https://goegefietst.gent/teams/distances')
          .then(function(response) {
            return response.data;
          });
      }

    }]);
})();
