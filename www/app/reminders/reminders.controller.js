(function() {
  'use strict';

  angular
    .module('app.reminders')
    .controller('RemindersController', Controller);

  Controller.$inject = ['$ionicPopup', '$scope', '$window', 'Reminders'];

  /* @ngInject */
  function Controller($ionicPopup, $scope, $window, Reminders) {
    var vm = this;

    vm.reminders = [];

    vm.showDelete = false;
    vm.showEdit = false;
    vm.masterCheck =
      $window.localStorage.masterCheck === 'false' ? false : true;

    vm.editReminder = editReminder;
    vm.toggleDelete = toggleDelete; //TURN ON/OFF DELETE OPTION
    vm.toggleEdit = toggleEdit; //NOT USED ATM
    vm.addReminder = addReminder; //ADD NEW REMINDER

    vm.onItemDelete = onItemDelete; //DELETE REMINDER
    vm.onItemEdit = onItemEdit; //EDIT REMINDER
    vm.toggleReminder = toggleReminder; //TOGGLE REMINDER ON/OFF
    vm.toggleMasterCheck = toggleMasterCheck; //TOGGLE ALL REMINDERS ON/OFF

    loadReminders();

    function loadReminders() {
      Reminders.loadReminders().then(function(reminders) {
        vm.reminders = reminders;
      });
    }

    function addReminder() {
      Reminders.addReminder($scope, vm.reminders);
    }

    function editReminder(reminder) {
      Reminders.editReminder($scope, vm.reminders, reminder);
    }

    function toggleDelete() {
      vm.showDelete = !vm.showDelete;
    }

    //UNUSED
    function toggleEdit() {
      vm.showEdit = !vm.showEdit;
    }

    function onItemDelete(reminder) {
      vm.showDelete = Reminders.deleteReminder(reminder, vm.reminders);
    }

    //UNUSED
    function onItemEdit(reminder) {
      console.log(reminder);
    }

    function toggleReminder(reminder) {
      Reminders.toggleReminder(reminder, vm.reminders);
    }

    function toggleMasterCheck() {
      vm.masterCheck = !vm.masterCheck;
      $window.localStorage.masterCheck = vm.masterCheck;
      Reminders.setMasterCheck(vm.masterCheck, vm.reminders);
    }

  }
})();
