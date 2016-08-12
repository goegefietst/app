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

    vm.addReminder = addReminder;
    vm.editReminder = editReminder;
    vm.toggleDelete = toggleDelete;
    vm.deleteReminder = deleteReminder;
    vm.toggleReminder = toggleReminder;
    vm.toggleEnabled = toggleEnabled;

    loadReminders();

    function loadReminders() {
      Reminders.loadReminders().then(function(reminders) {
        vm.reminders = reminders;
      });
    }

    /**
     * @ngdoc method
     * @name addReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Opens popup to add a reminder
     * See {@link app.reminders.service:RemindersService ReminderService#addReminder()}
     */
    function addReminder() {
      Reminders.addReminder($scope, vm.reminders);
    }

    /**
     * @ngdoc method
     * @name editReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Opens popup to edit a reminder
     * See {@link app.reminders.service:RemindersService ReminderService#editReminder()}
     * @param {Object} reminder reminder that is to be edited
     */
    function editReminder(reminder) {
      Reminders.editReminder($scope, vm.reminders, reminder);
    }

    /**
     * @ngdoc method
     * @name toggleDelete
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggles display of delete button next to every reminder
     */
    function toggleDelete() {
      vm.showDelete = !vm.showDelete;
    }

    /**
     * @ngdoc method
     * @name deleteReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Delete a reminder
     * See {@link app.reminders.service:RemindersService ReminderService#deleteReminder()}
     * @param {Object} reminder reminder that is to be deleted
     */
    function deleteReminder(reminder) {
      vm.showDelete = Reminders.deleteReminder(reminder, vm.reminders);
    }

    /**
     * @ngdoc method
     * @name toggleReminder
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggle whether a reminder is active or not
     * See {@link app.reminders.service:RemindersService ReminderService#toggleReminder()}
     * @param {Object} reminder reminder that is to enabled/disabled
     */
    function toggleReminder(reminder) {
      Reminders.toggleReminder(reminder, vm.reminders);
    }

    /**
     * @ngdoc method
     * @name toggleEnabled
     * @methodOf app.reminders.controller:RemindersController
     * @description
     * Toggle whether all reminders are enabled
     * See {@link app.reminders.service:RemindersService ReminderService#setEnabled()}
     */
    function toggleEnabled() {
      vm.enabled = !vm.enabled;
      Reminders.setEnabled(vm.enabled, vm.reminders);
    }

  }
})();
