(function() {
  'use strict';

  angular
    .module('app.group')
    .service('Groups', ['Connection', function(Connection) {

      this.getTeamsWithDistances = getTeamsWithDistances;

      function getTeamsWithDistances(category) {
        return Connection.getTeamDistances().then(function(teams) {
          return teams.filter(function(entry) {
            return entry.category === category; //e.g. 'Association'
          });
        });
      }

    }]);
})();
