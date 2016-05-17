(function() {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = ['$scope', '$window', '$ionicPopup', 'Connection', 'Groups'];

  /* @ngInject */
  function Controller($scope, $window, $ionicPopup, Connection, Groups) {
    var vm = this;
    var uuid = $window.localStorage.getItem('uuid');
    var secret = $window.localStorage.getItem('secret');
    var userTeams = $window.localStorage.getItem('userTeams');
    vm.userTeams = userTeams ? userTeams : [];

    vm.isActive = isActive;
    vm.goToSchool = goToSchool;
    vm.goToFaculty = goToFaculty;
    vm.goToAssociation = goToAssociation;

    vm.ListAssociation = [];
    vm.ListFaculty = [];
    vm.ListSchool = [];
    vm.DropdownAssociation = [];
    vm.DropdownFaculty = [];
    vm.DropdownSchool = [];
    vm.currentType = 'school';
    vm.currentTeams = [];
    vm.storedAssociation = $window.localStorage.getItem('currentAssociation');
    vm.storedFaculty = $window.localStorage.getItem('currentFaculty');
    vm.storedSchool = $window.localStorage.getItem('currentSchool');
    vm.setGroup = setGroup;

    var contentHeight =
      angular.element(document.getElementById('groups'))[0].offsetHeight;
    vm.tabsHeight = contentHeight / 9 * 0.8;
    vm.listHeight = contentHeight / 9 * 7;
    vm.dropdownHeight = contentHeight / 9 * 1;

    ['Association', 'School', 'Faculty'].forEach(function(category) {
      Groups.getTeamsWithDistances(category).then(function(teams) {
        var teamsWithEmpty = teams.slice();
        var emptyTeam = {
          name: 'Geen team',
          category: teams[0].category,
          values: {
            distance: 0
          }
        };
        teamsWithEmpty.push(emptyTeam);
        vm['List' + category] = teams;
        vm['Dropdown' + category] = teamsWithEmpty;
        var team = teams.find(function(team) {
          return team.name === vm['stored' + category];
        });
        vm['current' + category] = team ? team : emptyTeam;
        if (category === 'School') {
          vm.currentTeams = teams;
          vm.currentTeam = vm.currentSchool;
          vm.currentDropdown = vm.DropdownSchool;
        }
      });
    });

    function goToSchool() {
      vm.currentType = 'school';
      vm.currentTeams = vm.ListSchool;
      vm.currentTeam = vm.currentSchool;
      vm.currentDropdown = vm.DropdownSchool;
    }

    function goToFaculty() {
      vm.currentType = 'faculty';
      vm.currentTeams = vm.ListFaculty;
      vm.currentTeam = vm.currentFaculty;
      vm.currentDropdown = vm.DropdownFaculty;
    }

    function goToAssociation() {
      vm.currentType = 'association';
      vm.currentTeams = vm.ListAssociation;
      vm.currentTeam = vm.currentAssociation;
      vm.currentDropdown = vm.DropdownAssociation;
    }

    function isActive(value) {
      return vm.currentType === value;
    }

    function setGroup() {
      vm['current' + vm.currentTeam.category] = vm.currentTeam;
      $window.localStorage
        .setItem('current' + vm.currentTeam.category, vm.currentTeam.name);
      updateTeams();
    }

    function updateTeams() {
      var teams = [vm.currentSchool, vm.currentFaculty, vm.currentAssociation];
      $window.localStorage.setItem('userTeams', teams);
      Connection.updateTeams(uuid, secret, teams);
    }
  }
})();
