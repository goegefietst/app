(function() {
  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', Controller);

  Controller.$inject = []; //dependencies

  /* @ngInject */
  function Controller(dependencies) {
    var vm = this;

    activate();

    function activate() {

    }

    vm.showDelete = false;
    vm.showEdit = false;
    vm.masterCheck = true;

    vm.testReminders = [
      {
        id: 0,
        check: true,
        days: 'iedere dag',
        time: '7:20'
      },{
        id: 1,
        check: false,
        days: 'zaterdag',
        time: '12:00'
      }
      ,{
        id: 2,
        check: true,
        days: 'iedere dag',
        time: '12:30'
      }
    ];

    vm.add = function add() {
      console.log('test add');
    }

    vm.onItemDelete = function onItemDelete(reminder) {
      console.log('test delete');
      console.log(reminder.id);
    }

    vm.onItemEdit = function onItemEdit(reminder) {
      console.log('test edit');
      console.log(reminder);
    }
  }
})();
