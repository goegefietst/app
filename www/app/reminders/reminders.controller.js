(function() {
  'use strict';

  angular
    .module('app.reminders')
    .controller('RemindersController', Controller);

  Controller.$inject = ['$scope', 'Reminders'];

  /**
   * @ngdoc controller
   * @name app.reminders.controller:RemindersController
   * @description
   * Controller responsible for reminders.
   */
  /* @ngInject */
  function Controller($scope, Reminders) {
    var vm = this;

    vm.reminders = [];

    vm.showDelete = false;
    vm.showEdit = false;
    vm.enabled = Reminders.isEnabled();

    /**
     * @ngdoc method
     * @name addReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Calls {@link app.reminders.service:RemindersService ReminderService#addReminder()}
     */
    vm.addReminder = addReminder;

    /**
     * @ngdoc method
     * @name editReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Opens popup to edit reminder
     * @param {Object} reminder reminder that is to be edited
     */
    vm.editReminder = editReminder;

    /**
     * @ngdoc method
     * @name toggleDelete
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggles display of delete button next to every reminder
     */
    vm.toggleDelete = toggleDelete;

    /**
     * @ngdoc method
     * @name deleteReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Delete a reminder
     * @param {Object} reminder reminder that is to be deleted
     */
    vm.deleteReminder = deleteReminder;

    /**
     * @ngdoc method
     * @name toggleReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggle whether a reminder is active or not
     * @param {Object} reminder reminder that is to enabled/disabled
     */
    vm.toggleReminder = toggleReminder;

    /**
     * @ngdoc method
     * @name toggleEnabled
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggle whether all reminders are enabled
     */
    vm.toggleEnabled = toggleEnabled;

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

    function deleteReminder(reminder) {
      vm.showDelete = Reminders.deleteReminder(reminder, vm.reminders);
    }

    function toggleReminder(reminder) {
      Reminders.toggleReminder(reminder, vm.reminders);
    }

    function toggleEnabled() {
      vm.enabled = !vm.enabled;
      Reminders.setEnabled(vm.enabled, vm.reminders);
    }

  }
})();
