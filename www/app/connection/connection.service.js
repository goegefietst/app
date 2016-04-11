(function() {
  'use strict';

  angular
    .module('connection')
    .service('Connection', ['$http', '$q', function($http) {

      this.getRoutes = getRoutes;
      this.makeAccount = makeAccount;
      this.postRoute = postRoute;
      this.getRoutesByUser = getRoutesByUser;

      function getRoutes() {
        var promise =
          $http
          .get('https://goegefietst.gent/routes')
          .then(function(response) {
            console.log('GET ROUTES RESPONSE');
            console.log(response);
            return response.data;
          });
        return promise;
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
        var promise =
          $http
          .post('https://goegefietst.gent/user')
          .then(success, error);
        return promise;
      }

      function postRoute(uuid, secret, route) {
        var config = {
          headers: {
            'secret': secret
          }
        };
        var data = route;
        data.secret = secret; //Shouldn't we move this to headers on server?
        var promise =
          $http
          .post('https://goegefietst.gent/user/' + uuid, data, config)
          .then(function(response) {
            console.log('POST ROUTE RESPONSE');
            console.log(response);
            return response.data;
          });
        return promise;
      }

      function getRoutesByUser(uuid, secret) {
        var config = {
          headers: {
            'secret': secret
          }
        };
        var promise =
          $http
          .get('https://goegefietst.gent/user/' + uuid, config)
          .then(function(response) {
            console.log('GET ROUTES BY USER RESPONSE');
            console.log(response);
            return response.data;
          });
        return promise;
      }

    }]);
})();
