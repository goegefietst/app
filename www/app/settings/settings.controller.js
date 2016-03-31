(function() {
  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', Controller);

  Controller.$inject = ['$ionicPopup', '$scope', '$cordovaNetwork', 'Database', 'ionicTimePicker'];//dependencies

  /* @ngInject */
  function Controller($ionicPopup, $scope, $cordovaNetwork, Database, ionicTimePicker) {
    var vm = this;

    vm.reminders = [];

    activate();

    function activate() {
      //FOR TESTING PURPOSES
      //TODO Make periodically
      console.log('NETWORK TYPE');
      console.log($cordovaNetwork.getNetwork());
      console.log('IS ONLINE');
      console.log($cordovaNetwork.isOnline());

      Database.selectRoutes(function(routes) {
        console.log('ROUTES');
        console.log(routes);
        for (var i = 0; i < routes.length; i++) {
          //TODO Send to server, if successful update db entry
          Database.sentRoute(routes[i]);
        }
      }, {
        sent: true
      });
    }

    Database.selectReminders(map);

    vm.showDelete = false;
    vm.showEdit = false;
    vm.masterCheck = true;
    vm.selectedTime = {};

    vm.editReminder = editReminder;
    vm.toggleDelete = toggleDelete; //TURN ON/OFF DELETE OPTION
    vm.toggleEdit = toggleEdit; //NOT USED ATM
    vm.addNotification = addNotification; //ADD NEW REMINDER

    vm.onItemDelete = onItemDelete; //DELETE REMINDER
    vm.onItemEdit = onItemEdit; //EDIT REMINDER
    vm.toggleReminder = toggleReminder; //TOGGLE REMINDER ON/OFF
    vm.toggleMasterCheck = toggleMasterCheck; //TOGGLE ALL REMINDERS ON/OFF

    vm.templatePopup =
      '<ion-list><ion-checkbox ng-model="data.monday">maandag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.tuesday">dinsdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.wednesday">woensdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.thursday">donderdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.friday">vrijdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.saturday">zaterdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.sunday">zondag</ion-checkbox></ion-list>';

    vm.timePickerObject = {
      inputTime: ((new Date()).getHours() * 60 * 60), //Optional
      step: 5, //Optional
      format: 24, //Optional
      titleLabel: 'Kies het uur', //Optional
      setLabel: 'Kies', //Optional
      closeLabel: 'Annuleer', //Optional
      setButtonType: 'button-positive', //Optional
      closeButtonType: 'button-stable', //Optional
      callback: function(val) { //Mandatory
        timePickerCallback(val);
      }
    };

    function addNotification() {
      ionicTimePicker.openTimePicker(vm.timePickerObject);
    }

    function timePickerCallback(val) {
      if (typeof(val) === 'undefined') {
        console.log('User didn\'t select a time');
      } else {
        var time = new Date(val * 1000);
        vm.selectedTime.hours = time.getUTCHours();
        vm.selectedTime.minutes = time.getUTCMinutes();
        setDays();
      }
    }

    function map(object) {
      for (var i = 0; i < object.length; i++) {
        var days = [];
        days.push(object[i].mon === 'true');
        days.push(object[i].tue === 'true');
        days.push(object[i].wed === 'true');
        days.push(object[i].thu === 'true');
        days.push(object[i].fri === 'true');
        days.push(object[i].sat === 'true');
        days.push(object[i].sun === 'true');

        console.log(format(object[i].hour));
        console.log(format(object[i].minutes));
        var reminder = {
          id: object[i].id,
          active: object[i].active === 'true',
          hour: format(object[i].hour),
          minutes: format(object[i].minutes),
          days: days,
          daysString: daysToString(days)
        };
        vm.reminders.push(reminder);
      }
    }

    function updateDatabase(newReminders) {
      Database.deleteReminders(function() {
        Database.insertReminders(newReminders);
      });
    }

    function updateReminders(reminders) {
      cordova.plugins.notification.local.cancelAll();
      var notifications = [];
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].active) {
          for (var j = 0; j < reminders[i].days.length; j++) {
            if (reminders[i].days[j]) {
              var result =
                returnDateObject(reminders[i].hour, reminders[i].minutes, j);
              notifications.push({
                id: reminders[i].id * 10 + j,
                text: 'Vergeet niet je route te tracken!',
                at: result,
                every: 'week',
              });
            }
          }
        }
      }
      console.log('setting notifications');
      console.log(notifications);
      cordova.plugins.notification.local.schedule(notifications);
    }

    function editReminder(reminder) {
      console.log('REMINDER');
      console.log(reminder);
      reminder.test = 'SUCCESSFUL';
      var index = vm.reminders.map(function(x) {return x.id; }).indexOf(reminder.id);
      console.log('TEST');
      console.log(vm.reminders[index].test);
    }

    function toggleDelete() {
      vm.showDelete = !vm.showDelete;
    }

    function toggleEdit() {
      vm.showEdit = !vm.showEdit;
    }

    function setDays() {
      $scope.data = {};

      var myPopup = $ionicPopup.show({
        template: vm.templatePopup,
        title: 'Kies de dag(en)',
        scope: $scope,
        buttons: [{
          text: 'Annuleer'
        }, {
          text: '<b>Kies</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.monday &&
              !$scope.data.tuesday &&
              !$scope.data.wednesday &&
              !$scope.data.thursday &&
              !$scope.data.friday &&
              !$scope.data.saturday &&
              !$scope.data.sunday) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return mapDays($scope.data);
            }
          }
        }]
      });

      myPopup.then(function(res) {
        if (res !== undefined) {
          var ids = window.localStorage.counterIds;
          if (ids === undefined) {
            ids = 1;
          } else {
            ids++;
          }
          window.localStorage.counterIds = ids;
          //user did select day/days
          var newReminder = {
            id: ids,
            active: true,
            hour: format(vm.selectedTime.hours),
            minutes: format(vm.selectedTime.minutes),
            days: res,
            daysString: daysToString(res)
          };
          //add notification to db
          vm.reminders.push(newReminder);
          updateReminders(vm.reminders);
          updateDatabase(vm.reminders);
        } else {
          //user didn't select one or more days of the week
          console.log('User didn\'t select any days of the week');
        }
        vm.selectedTime = {};
      });
    }

    function onItemDelete(reminder) {
      vm.reminders.splice(vm.reminders.indexOf(reminder), 1);
      Database.deleteReminder(reminder);
      cancelNotification(reminder);
      if (vm.reminders.length === 0) {
        vm.showDelete = false;
      }
      Database.selectReminders(function(object) {
        console.log(object);
      });
    }

    function onItemEdit(reminder) {
      //TODO
    }

    function toggleReminder(reminder) {
      reminder.active = !reminder.active;
      if (reminder.active) {
        updateReminders(vm.reminders);
        updateDatabase(vm.reminders);
      } else {
        updateReminders(vm.reminders);
        updateDatabase(vm.reminders);
      }
    }

    function toggleMasterCheck() {
      vm.masterCheck = !vm.masterCheck;
      if (vm.masterCheck) {
        updateReminders(vm.reminders);
      } else {
        cordova.plugins.notification.local.cancelAll(function() {
          console.log('cancel all notifications');
        });
        cordova.plugins.notification.local.getAllIds(function(ids) {
          console.log(ids);
        });
      }
    }

    function cancelNotification(reminder) {
      cordova.plugins.notification.local.cancel(reminder.id, function() {
        console.log('cancel notification with id ' + reminder.id);
      });
    }

    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }

    function daysToString(days) {
      var daysString = [];
      for (var i = 0; i < days.length; i++) {
        if (days[i]) {
          switch (i) {
            case 0:
              daysString.push('ma');
              break;
            case 1:
              daysString.push('di');
              break;
            case 2:
              daysString.push('wo');
              break;
            case 3:
              daysString.push('do');
              break;
            case 4:
              daysString.push('vr');
              break;
            case 5:
              daysString.push('za');
              break;
            case 6:
              daysString.push('zo');
              break;
          }
        }
      }
      console.log(daysString);
      return daysString;
    }

    function mapDays(input) {
      var result = [];
      if (input.monday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.tuesday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.wednesday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.thursday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.friday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.saturday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.sunday) {
        result.push(true);
      } else {
        result.push(false);
      }
      return result;
    }

    function returnDateObject(hours, minutes, j) {
      var now = new Date();
      var result = new Date();
      var dayOfWeek = now.getDay();
      var date;

      if (j === 0) {
        date = now.getDate() + 8 - dayOfWeek;
      }
      if (j === 1) {
        date = now.getDate() + 9 - dayOfWeek;
      }
      if (j === 2) {
        date = now.getDate() + 10 - dayOfWeek;
      }
      if (j === 3) {
        date = now.getDate() + 11 - dayOfWeek;
      }
      if (j === 4) {
        date = now.getDate() + 12 - dayOfWeek;
      }
      if (j === 5) {
        date = now.getDate() + 13 - dayOfWeek;
      }
      if (j === 6) {
        date = now.getDate() + 14 - dayOfWeek;
      }
      var diff = (date - now.getDate());
      if (diff > 7) {
        date = date - 7;
      } else if (diff === 7) {
        if (parseInt(hours) > now.getHours()) {
          date = date - 7;
        } else if (parseInt(hours) === now.getHours()) {
          if (parseInt(minutes) > now.getMinutes()) {
            date = date - 7;
          }
        }
      }

      result.setDate(date);
      result.setHours(parseInt(hours));
      result.setMinutes(parseInt(minutes));
      result.setSeconds(0);

      return result;
    }
  }
})();
