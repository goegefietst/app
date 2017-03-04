(function () {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = ['$window', '$timeout', 'Connection'];

  /**
   * @ngdoc controller
   * @name app.group.controller:GroupController
   * @description
   * Controller responsible for displaying groups.
   */
  /* @ngInject */
  function Controller($window, $timeout, Connection) {
    var vm = this;

    /**
     * @ngdoc const
     * @name CATEGORIES
     * @propertyOf app.group.controller:GroupController
     * @description
     * Array with categories of groups.
     * <table>
     * <tr><th>index</th><th>category</th></tr>
     * <tr><td>0</td><td>School</td></tr>
     * <tr><td>1</td><td>Faculty</td></tr>
     * <tr><td>2</td><td>Association</td></tr>
     * </table>
     */
    var CATEGORIES = ['School', 'Association', 'Faculty'];
    var storedTeams = JSON.parse($window.localStorage.getItem('userTeams'));

    /**
     * @ngdoc property
     * @name index
     * @propertyOf app.group.controller:GroupController
     * @description
     * Index of the current tab.
     */
    vm.index = 0;


    /**
   * @ngdoc property
   * @name createmode
   * @propertyOf app.group.controller:GroupController
   * @description
   * True or false for creating a new team
   */
    vm.createmode = 'false';

    /**
     * @ngdoc property
     * @name listTeams
     * @propertyOf app.group.controller:GroupController
     * @description
     * Array of categories (e.g. 'School', 'Faculty', 'Assocation') that each contain an array of teams (e.g. 'HoGent', 'UGent' in category 'School').
     * Index of a category matches that of the corresponding tab. So if 'School' is tab 0, then listTeams[0] has to be an array of school teams.<br/>
     * Example: listTeams
     * <table>
     *   <tr><th>index</th><th>category</th></tr>
     *   <tr><td>0</td><td>{Array} School teams</td></tr>
     *   <tr><td>1</td><td>{Array} Faculty teams</td></tr>
     *   <tr><td>2</td><td>{Array} Association teams</td></tr>
     * </table>
     * Example: listTeams[0] (School teams)
     * <table>
     *   <tr><th>index</th><th>team</th><th>team.name</th><th>team.distance</th></tr>
     *   <tr><td>0</td><td>{Object} HoGent team</td><td>{String} HoGent</td><td>{Number} 0</td></tr>
     *   <tr><td>1</td><td>{Object} UGent team</td><td>{String} UGent</td><td>{Number} 0</td></tr>
     *   <tr><td>2</td><td>{Object} Odisee team</td><td>{String} Odisee</td><td>{Number} 0</td></tr>
     * </table>
     */
    vm.listTeams = [[], [], []];

    /**
     * @ngdoc property
     * @name dropdownTeams
     * @propertyOf app.group.controller:GroupController
     * @description
     * Array of categories (e.g. 'School', 'Faculty', 'Assocation') that each contain an array of teams (e.g. 'HoGent', 'UGent' in category 'School').
     * Index of a category matches that of the corresponding tab. So if 'School' is tab 0, then listTeams[0] has to be an array of school teams.
     * The first team in every category is 'No team', which represents not being in a team.<br/>
     * Example: dropdownTeams
     * <table>
     *   <tr><th>index</th><th>category</th></tr>
     *   <tr><td>0</td><td>{Array} School teams</td></tr>
     *   <tr><td>1</td><td>{Array} Faculty teams</td></tr>
     *   <tr><td>2</td><td>{Array} Association teams</td></tr>
     * </table>
     * Example: dropdownTeams[0] (School teams)
     * <table>
     *   <tr><th>index</th><th>team</th><th>team.name</th><th>team.distance</th></tr>
     *   <tr><td>0</td><td>{Object} No team</td><td>{String} Geen team</td><td>{Number} 0</td></tr>
     *   <tr><td>1</td><td>{Object} HoGent team</td><td>{String} HoGent</td><td>{Number} 0</td></tr>
     *   <tr><td>2</td><td>{Object} UGent team</td><td>{String} UGent</td><td>{Number} 0</td></tr>
     *   <tr><td>3</td><td>{Object} Odisee team</td><td>{String} Odisee</td><td>{Number} 0</td></tr>
     * </table>
     */
    vm.dropdownTeams = [[], [], []];

    /**
     * @ngdoc property
     * @name userTeams
     * @propertyOf app.group.controller:GroupController
     * @description
     * Array of teams that the user belongs to. Index matches the category of a team.
     * So if category 'School' has index 0, userTeams[0] contains the school team of the user.<br/>
     * Example: userTeams
     * <table>
     *   <tr><th>index (name of category for reference)</th><th>team</th></tr>
     *   <tr><td>0 (School)</td><td>{Object} HoGent</td></tr>
     *   <tr><td>1 (Faculty)</td><td>{Object} Bedrijf en organisatie</td></tr>
     *   <tr><td>2 (Association)</td><td>{Object} Bacchus</td></tr>
     * </table>
     */
    vm.userTeams = [];

    var valid = false;
    var initialising = false;

    vm.isActiveTab = isActiveTab;
    vm.goToTab = goToTab;
    vm.saveTeams = saveTeams;

    vm.toggleCreateMode = toggleCreateMode;
    vm.addTeam = addTeam;
    vm.inputTeam = "";

    var contentHeight =
      angular.element(document.getElementById('groups'))[0].offsetHeight;
    vm.tabsHeight = contentHeight / 9 * 0.8;
    vm.listHeight = contentHeight / 9 * 7;
    vm.dropdownHeight = contentHeight / 9 * 1;

    init();
    $timeout(invalidate, 60 * 1000);

    function init() {
      if (initialising || valid) {
        return;
      }
      initialising = true;
      Connection.getTeams().then(function (teams) {
        for (var i = 0; i < 3; i++) {
          var category = CATEGORIES[i];
          var data = { index: i, category: category };
          data.teams = teams.filter(filterByCategory);
          load(data);
          initialising = false;
          valid = true;
        }
        function filterByCategory(entry) {
          return entry.category === data.category; //e.g. 'Association'
        }
      }).catch(function () {
        initialising = false;
      });
    }

    function invalidate() {
      valid = false;
      $timeout(invalidate, 60 * 1000);
    }

    function load(data) {
      var index = data.index;
      var teams = data.teams;
      var teamsWithEmpty = teams.slice();
      var emptyTeam = {
        name: 'Nog geen gekozen...',
        category: teams[0].category,
        distance: 0
      };
      teamsWithEmpty.unshift(emptyTeam);
      vm.listTeams[index] = teams;
      vm.dropdownTeams[index] = teamsWithEmpty;
      vm.userTeams[index] = teamsWithEmpty[0];
      if (storedTeams && storedTeams[index]) {
        var team = teamsWithEmpty.filter(function (team) {
          return team.name === storedTeams[index].name;
        });
        if (team[0]) {
          vm.userTeams[index] = team[0];
        }
      }
    }

    /**
     * @ngdoc method
     * @name toggleCreateMode
     * @methodOf app.group.controller:GroupController
     * @description
     */
    function toggleCreateMode() {
      if (vm.createmode == 'true') vm.createmode = 'false';
      else vm.createmode = 'true';
    }

    /**
     * @ngdoc method
     * @name toggleCreateMode
     * @methodOf app.group.controller:GroupController
     * @description
     */
    function addTeam() {
      let isok = true;
      if (vm.inputTeam.lenght < 1) isok = false;
      vm.dropdownTeams.forEach(function (element) {
        if (element == vm.inputTeam) isok = false;
      }, this);
      if (vm.inputTeam.lenght < 1) isok = false;

      if (isok) {
        var newTeam = {
          name: vm.inputTeam,
          category: CATEGORIES[vm.index],
          distance: 0
        };

        // Add the new team to db
        Connection.postTeam(newTeam).then(function () {
            // Refresh 
            init();
        });
      }

      
        // Close create mode
        vm.inputTeam = "";
        toggleCreateMode();
    }

    /**
     * @ngdoc method
     * @name goToTab
     * @methodOf app.group.controller:GroupController
     * @description
     * Changes the current tab.
     * @param {Number} index index of tab
     */
    function goToTab(index) {
      init();
      vm.inputTeam = "";
      vm.createmode = 'false';
      vm.index = index;
    }

    /**
     * @ngdoc method
     * @name isActiveTab
     * @methodOf app.group.controller:GroupController
     * @description
     * Returns whether the index matches that of the active tab.
     * @param {Number} index index of tab
     * @return {Boolean} boolean index matches that of active tab
     */
    function isActiveTab(index) {
      return vm.index === index;
    }

    /**
     * @ngdoc method
     * @name saveTeams
     * @methodOf app.group.controller:GroupController
     * @description
     * Writes currently selected teams to local storage.
     */
    function saveTeams() {
      $window.localStorage.setItem('userTeams', JSON.stringify(vm.userTeams));
    }
  }
})();
