(function() {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = ['$scope', '$ionicPopup'];

  /* @ngInject */
  function Controller($scope, $ionicPopup) {
    var vm = this;

    vm.type = 'school';
    vm.groups = [{
      nr: 1,
      name: 'HoGent',
      km: '324,5'
    }, {
      nr: 2,
      name: 'uGent',
      km: '302,8'
    }, {
      nr: 3,
      name: 'Artevelde',
      km: '267,1'
    }, {
      nr: 4,
      name: 'Odisee',
      km: '120,4'
    }, {
      nr: 5,
      name: 'Luca',
      km: '103,9'
    }];

    vm.isActive = isActive;
    vm.goToSchool = goToSchool;
    vm.goToFaculty = goToFaculty;
    vm.goToAssociation = goToAssociation;
    vm.unsubscribe = unsubscribe;
    vm.subscribe = subscribe;

    function goToSchool() {
      vm.type = 'school';
    }

    function goToFaculty() {
      vm.type = 'faculty';
    }

    function goToAssociation() {
      vm.type = 'association';
    }

    function isActive(value) {
      return vm.type === value;
    }

    function unsubscribe() {
      //CHECK IF USER IS ALREADY SUBSCRIBED TO SCHOOL/FACULTY/ASSOCIATIONS
      //IF USER IS SUBSCRIBED, ASK THEM IF THEY ARE SURE THEY WANT TO UNSUBSCRIBE
      //IF USER ISN'T SUBSCRIBED, TELL THEM THEY CAN'T UNSUBSCRIBE

      //THIS IS THE SCHOOL/FACULTY/ASSOCIATIONS
      $scope.unsubscribeTest = 'HoGent';
      var popup = $ionicPopup.show({
        scope: $scope,
        title: 'Uitschrijven',
        subTitle: 'Ben je zeker dat je volgende groep wenst te verlaten?',
        template: '<p style="text-align: center;">{{unsubscribeTest}}</p>',
        buttons: [
          {
            text: 'Nee',
            onTap: function() {
              return false;
            }
          }, {
            text: '<b>Ja</b>',
            type: 'button-royal',
            onTap: function() {
              return true;
            }
          }
        ]
      });

      popup.then(function(res) {
        console.log(res);
        if (res) {
          //UNSUBSCRIBE
        }
      });
    }

    function subscribe() {
      //CHECK IF USER IS ALREADY SUBSCRIBED TO SCHOOL/FACULTY/ASSOCIATIONS
      //IF USER IS SUBSCRIBED, TELL THEM THEY CAN'T SUBSCRIBE FOR MULTIPLE GROUPS (EXCEPT ASSOCIATIONS)
      //IF USER ISN'T SUBSCRIBED YET, GET POSSIBLE SCHOOLS/FACULTIES/ASSOCIATIONS TO SUBSCRIBE TO
      //SHOW GROUPS IN POPUP

      //THESE ARE THE SCHOOLS/FACULTIES/ASSOCIATIONS WHERE A USER CAN SUBSCRIBE TO
      var groupsArray = [
        {
          id: 1,
          name: 'HoGent'
        },
        {
          id: 2,
          name: 'uGent'
        },
        {
          id: 3,
          name: 'Artevelde'
        }
      ];
      $scope.test = {
        groups: groupsArray,
        result: null
      };
      var popup = $ionicPopup.show({
        scope: $scope,
        template:
          '<label for="repeatSelect"> Repeat select: </label>' +
          '<select name="repeatSelect" ng-model="test.result">' +
          '<option ng-repeat="group in test.groups" value="{{group.id}}">{{group.name}}</option>' +
          '</select>',
        title: 'Inschrijven',
        subTitle: 'Kies de groep waar je je wenst bij aan te sluiten.',
        buttons: [{
          text: 'Annuleer',
          onTap: function() {
            return;
          }
        }, {
          text: '<b>Kies</b>',
          type: 'button-royal',
          onTap: function(e) {
            if ($scope.test.result === null) {
              e.preventDefault();
            } else {
              console.log($scope.test.result);
              return $scope.test.result;
            }
          }
        }]
      });
      //RES IS THE ID OF THE SELECTED ITEM
      popup.then(function(res) {
        console.log(res);
      });
    }
  }
})();
