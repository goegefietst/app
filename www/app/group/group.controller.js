(function() {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = ['$window', 'Connection'];

  /* @ngInject */
  function Controller($window, Connection) {
    var vm = this;
    var CATEGORIES = ['School', 'Faculty', 'Association'];
    var storedTeams = JSON.parse($window.localStorage.getItem('userTeams'));

    vm.index = 0;
    vm.listTeams = [[],[],[]];
    vm.dropdownTeams = [[],[],[]];
    vm.userTeams = [];

    vm.isActive = isActive;
    vm.goToIndex = goToIndex;
    vm.saveTeams = saveTeams;

    var contentHeight =
      angular.element(document.getElementById('groups'))[0].offsetHeight;
    vm.tabsHeight = contentHeight / 9 * 0.8;
    vm.listHeight = contentHeight / 9 * 7;
    vm.dropdownHeight = contentHeight / 9 * 1;

    init();

    function init() {
      Connection.getTeamDistances().then(function(teams) {
        function filterByCategory(entry) {
          return entry.category === data.category; //e.g. 'Association'
        }
        for (var i = 0; i < 3; i++) {
          var category = CATEGORIES[i];
          var data = {index: i, category: category};
          data.teams = teams.filter(filterByCategory);
          load(data);
        }
      });
    }

    function load(data) {
      var index = data.index;
      var teams = data.teams;
      var teamsWithEmpty = teams.slice();
      var emptyTeam = {
        name: 'Geen team',
        category: teams[0].category,
        values: {
          distance: 0
        }
      };
      teamsWithEmpty.unshift(emptyTeam);
      vm.listTeams[index] = teams;
      vm.dropdownTeams[index] = teamsWithEmpty;
      vm.userTeams[index] = teamsWithEmpty[0];
      if (storedTeams && storedTeams[index]) {
        var team = teamsWithEmpty.filter(function(team) {
          return team.name === storedTeams[index].name;
        });
        if (team[0]) {
          vm.userTeams[index] = team[0];
        }
      }
    }

    function goToIndex(index) {
      vm.index = index;
    }

    function isActive(index) {
      return vm.index === index;
    }

    function saveTeams() {
      $window.localStorage.setItem('userTeams', JSON.stringify(vm.userTeams));
    }
  }
})();
