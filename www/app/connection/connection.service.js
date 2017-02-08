(function() {
  'use strict';

  angular
    .module('connection')
    .service('Connection', Connection);

  Connection.$inject = ['$http', 'Helper'];

  /**
   * @ngdoc service
   * @name connection.service:ConnectionService
   * @description
   * Service responsible for interacting with the server.
   */
  /* @ngInject */
  function Connection($http, Helper) {

    this.makeAccount = makeAccount;
    this.postRoute = postRoute;
    this.getTeams = getTeams;

    var cutoff = 100; // amount of meter to be cut off at start and end of route

    //UNUSED
    this.getRoutesByUser = getRoutesByUser;

    /**
     * @ngdoc method
     * @name makeAccount
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @return {Promise} promise TODO
     */
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
        .post('https://goegefietst.gent/users')
        .then(success, error);
    }

    /**
     * @ngdoc method
     * @name postRoute
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @param {String} uuid user id
     * @param {String} secret user secret
     * @param {Object} route route object { id, time, sent, points[] }
     * @param {Array} teams teams that the user belongs to
     * @return {Promise} promise TODO
     */
    function postRoute(uuid, secret, route, teams) {
      var config = {
        headers: {
          'secret': secret
        }
      };
      console.log('UNTRIMMED ROUTE');
      console.log(route.points);
      var data = {};
      data.uuid = uuid;
      data.time = route.time;
      data.points = Helper.trimRoute(route.points, cutoff);
      data.teams = teams;
      console.log('TRIMMED ROUTE');
      console.log(data.points);
      console.log('BODY');
      console.log(data);
      return $http
        .post('https://goegefietst.gent/routes', data, config)
        .then(function(response) {
          console.log('POST ROUTE RESPONSE');
          console.log(response);
          return response.data;
        });
    }

    /**
     * @ngdoc method
     * @name getTeams
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @return {Promise} promise TODO
     */
    function getTeams() {
      return $http
        .get('https://goegefietst.gent/teams')
        .then(function(response) {
          return response.data;
        });
    }

    //UNUSED
    function getRoutesByUser(uuid, secret) {
      var config = {
        headers: {
          'secret': secret
        }
      };
      return $http
        .get('https://goegefietst.gent/routes/' + uuid, config)
        .then(function(response) {
          console.log('GET ROUTES BY USER RESPONSE');
          console.log(response);
          return response.data;
        });
    }
  }
})();
