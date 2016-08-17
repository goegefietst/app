(function() {
  'use strict';

  angular
    .module('encouragement')
    .service('Encouragement', Encouragement);

  Encouragement.$inject = ['$window', '$http', '$ionicPopup'];

  /**
   * @ngdoc service
   * @name app.encouragement.service:EncouragementService
   * @description
   * Service responsible for encouragement dialogs.
   */
  /* @ngInject */
  function Encouragement($window, $http, $ionicPopup) {

    this.saveDistance = saveDistance;
    this.showPopup = showPopup;

    function saveDistance(distance) {
      var stored = $window.localStorage.getItem('distance');
      if (stored) {
        stored = parseFloat(stored);
        $window.localStorage.setItem('distance', stored + distance);
      } else {
        $window.localStorage.setItem('distance', distance);
      }
    }

    function showPopup() {
      // Distance done by user
      var distance = getFloat('distance', 0);
      // Distance of last encouragement
      var lastEncouragement = getFloat('encouragement', 0);
      $http.get('txt/encouragements.json').success(function(response) {
        for (var i = response.length - 1; i >= 0; i--) {
          if (response[i].distance < distance) {
            if (response[i].distance <= lastEncouragement) {
              return; // Already gave this encouragement
            }
            $window.localStorage.setItem('encouragement', response[i].distance);
            return $ionicPopup.show({
              template: response[i].text,
              title: response[i].title,
              buttons: [{text: response[i].button, type: 'button-royal'}]
            });
          }
        }
      });
    }

    //retrieve float from localStorage
    function getFloat(key, defaultValue) {
      var float = $window.localStorage.getItem(key);
      if (float) {
        return parseFloat(float);
      }
      return defaultValue;
    }

  }
})();

