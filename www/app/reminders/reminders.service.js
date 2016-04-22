(function() {
  'use strict';

  angular
    .module('app.reminders')
    .service('Reminders', Reminders);

  Reminders.$inject = [
    '$q', '$ionicPopup', 'Database', 'ionicTimePicker'
  ];

  /* @ngInject */
  function Reminders($q, $ionicPopup, Database, ionicTimePicker) {

    this.loadReminders = loadReminders;
    this.addReminder = addReminder;
    this.editReminder = editReminder;
    this.deleteReminder = deleteReminder;
    this.toggleReminder = toggleReminder;
    this.setMasterCheck = setMasterCheck;

    var templatePopup =
      '<ion-list>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.monday">' +
      'maandag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.tuesday">' +
      'dinsdag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.wednesday">' +
      'woensdag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.thursday">' +
      'donderdag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.friday">' +
      'vrijdag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.saturday">' +
      'zaterdag</ion-checkbox>' +
      '<ion-checkbox class="checkbox-royal" ng-model="data.sunday">' +
      'zondag</ion-checkbox></ion-list>';

    function loadReminders() {
      return Database.selectReminders().then(map);
    }

    function addReminder($scope, reminders) {
      ionicTimePicker.openTimePicker({
        inputTime: ((new Date()).getHours() * 60 * 60), //Optional
        step: 5, //Optional
        format: 24, //Optional
        titleLabel: 'Kies een tijdstip', //Optional
        setLabel: 'Kies', //Optional
        closeLabel: 'Annuleer', //Optional
        callback: function(val) { //Mandatory
          timePickerCallback($scope, reminders, val);
        }
      });
    }

    function editReminder($scope, reminders, reminder) {
      ionicTimePicker.openTimePicker({
        //If hour when editing a reminder is incorrect, this is the place to check first
        inputTime: (parseInt(reminder.hour) * 60 * 60 +
          parseInt(reminder.minutes) * 60), //Optional
        step: 5, //Optional
        format: 24, //Optional
        titleLabel: 'Kies een tijdstip', //Optional
        setLabel: 'Kies', //Optional
        closeLabel: 'Annuleer', //Optional
        callback: function(val) { //Mandatory
          timePickerCallback($scope, reminders, val, reminder);
        }
      });
    }

    function timePickerCallback($scope, reminders, val, reminder) {
      if (typeof(val) === 'undefined') {
        console.log('User didn\'t select a time');
      } else {
        var time = new Date(val * 1000);
        setDays($scope, time.getUTCHours(), time.getUTCMinutes(), reminder, reminders);
      }
    }

    function setDays($scope, hour, minutes, reminder, reminders) {
      $scope.data = {};
      if (reminder) {
        $scope.data.monday = reminder.days[0];
        $scope.data.tuesday = reminder.days[1];
        $scope.data.wednesday = reminder.days[2];
        $scope.data.thursday = reminder.days[3];
        $scope.data.friday = reminder.days[4];
        $scope.data.saturday = reminder.days[5];
        $scope.data.sunday = reminder.days[6];
      }

      var myPopup = $ionicPopup.show({
        template: templatePopup,
        title: 'Kies de dag(en)',
        scope: $scope,
        buttons: [{
          text: 'Annuleer'
        }, {
          text: '<b>Kies</b>',
          type: 'button-royal',
          onTap: function(e) {
            if (!$scope.data.monday &&
              !$scope.data.tuesday &&
              !$scope.data.wednesday &&
              !$scope.data.thursday &&
              !$scope.data.friday &&
              !$scope.data.saturday &&
              !$scope.data.sunday) {
              e.preventDefault();
            } else {
              return mapDays($scope.data);
            }
          }
        }]
      });

      myPopup.then(function(res) {
        if (res !== undefined) {
          if (reminder) {
            reminder.hour = format(hour);
            reminder.minutes = format(minutes);
            reminder.days = res;
            reminder.daysString = daysToString(res);
            updateReminders(reminders);
            updateDatabase(reminders);
          } else {
            var newReminder = {
              id: getAvailableId(reminders),
              active: true,
              hour: format(hour),
              minutes: format(minutes),
              days: res,
              daysString: daysToString(res)
            };
            //add notification to db
            reminders.push(newReminder);
            updateReminders(reminders);
            updateDatabase(reminders);
          }
        } else {
          //user didn't select one or more days of the week
          console.log('User didn\'t select any days of the week');
        }
      });
    }

    function map(object) {
      var deferred = $q.defer();
      var reminders = [];
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
        reminders.push(reminder);
      }
      deferred.resolve(reminders);
      return deferred.promise;
    }

    function updateDatabase(newReminders) {

      var deleteReminders = function() {
        return Database.deleteReminders();
      };

      var insertReminders = function() {
        return Database.insertReminders(newReminders);
      };

      deleteReminders().then(insertReminders);
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
                color: 'EE6E35',
                led: 'EE6E35',
              });
            }
          }
        }
      }
      console.log('setting notifications');
      console.log(notifications);
      cordova.plugins.notification.local.schedule(notifications);
    }

    function deleteReminder(reminder, reminders) {
      reminders.splice(reminders.indexOf(reminder), 1);
      updateReminders(reminders);
      updateDatabase(reminders);
      if (reminders.length === 0) {
        return false;
      }
      return true;
    }

    function toggleReminder(reminder, reminders) {
      reminder.active = !reminder.active;
      if (reminder.active) {
        updateReminders(reminders);
        updateDatabase(reminders);
      } else {
        updateReminders(reminders);
        updateDatabase(reminders);
      }
    }

    function setMasterCheck(check, reminders) {
      if (check) {
        updateReminders(reminders);
      } else {
        cordova.plugins.notification.local.cancelAll(function() {
          console.log('Cancelling all notifications');
        });
      }
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

    function getAvailableId(reminders) {
      if (!reminders || reminders.length === 0) {
        return 0;
      }
      return Math.max.apply(null, reminders.map(function(reminder) {
        return reminder.id;
      })) + 1;
    }
  }
})();