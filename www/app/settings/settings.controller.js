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
        check: true,
        days: 'iedere dag',
        time: '7:20'
      },{
        check: false,
        days: 'zaterdag',
        time: '12:00'
      }
      ,{
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
      console.log(reminder);
      console.log(vm.testReminders.indexOf(reminder));
      vm.testReminders.splice(vm.testReminders.indexOf(reminder),1);
      
    }

    vm.onItemEdit = function onItemEdit(reminder) {
      console.log('test edit');
      console.log(reminder);
    }
  }
})();
