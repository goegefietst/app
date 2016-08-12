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
    this.updateTeams = updateTeams;
    this.postRoute = postRoute;
    this.getTeamDistances = getTeamDistances;

    //UNUSED
    this.getRoutes = getRoutes;
    this.getRoutesByUser = getRoutesByUser;
    this.getTeams = getTeams;

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
        .post('https://goegefietst.gent/user')
        .then(success, error);
    }

    /**
     * @ngdoc method
     * @name updateTeams
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @param {String} uuid user id
     * @param {String} secret user secret
     * @param {Array} teams teams array [school, faculty, association]
     * @return {Promise} promise TODO
     */
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

    /**
     * @ngdoc method
     * @name postRoute
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @param {String} uuid user id
     * @param {String} secret user secret
     * @param {Object} route route object { id, time, sent, points[] }
     * @return {Promise} promise TODO
     */
    function postRoute(uuid, secret, route) {
      var config = {
        headers: {
          'secret': secret
        }
      };
      console.log('UNTRIMMED ROUTE');
      console.log(route.points);
      var data = {};
      data.id = route.id;
      data.time = route.time;
      data.sent = route.sent;
      data.points = Helper.trimRoute(route.points, 500);
      console.log('TRIMMED ROUTE');
      console.log(data.points);
      return $http
        .post('https://goegefietst.gent/route/' + uuid, data, config)
        .then(function(response) {
          console.log('POST ROUTE RESPONSE');
          console.log(response);
          return response.data;
        });
    }

    /**
     * @ngdoc method
     * @name getTeamDistances
     * @methodOf connection.service:ConnectionService
     * @description
     * TODO
     * @return {Promise} promise TODO
     */
    function getTeamDistances() {
      return $http
        .get('https://goegefietst.gent/teams/distances')
        .then(function(response) {
          return response.data;
        });
    }

    //UNUSED
    function getRoutes() {
      return $http
        .get('https://goegefietst.gent/routes')
        .then(function(response) {
          console.log('GET ROUTES RESPONSE');
          console.log(response);
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
        .get('https://goegefietst.gent/route/' + uuid, config)
        .then(function(response) {
          console.log('GET ROUTES BY USER RESPONSE');
          console.log(response);
          return response.data;
        });
    }

    //UNUSED
    function getTeams() {
      return $http
        .get('https://goegefietst.gent/teams/names')
        .then(function(response) {
          return response.data;
        });
    }
  }
})();
