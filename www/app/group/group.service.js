(function() {
  'use strict';

  angular
    .module('app.group')
    .service('Groups', ['Connection', function(Connection) {

      this.getTeamsWithDistances = getTeamsWithDistances;

      function getTeamsWithDistances(data) {
        return Connection.getTeamDistances().then(function(teams) {
          data.teams = teams.filter(function(entry) {
            return entry.category === data.category; //e.g. 'Association'
          });
          return data;
        });
      }

    }]);
})();
