# Goe Gefietst !

Goe Gefietst is an app that tracks your bike rides in Ghent. It's made by students for students (though not exclusively) to encourage you to travel by bike more often. It tracks your route on your device and gives you feedback at the end of your ride. The app then sends the gathered data anonymously to our server. This data can then be used by the [City of Ghent] to improve bike routes, safety and available amenities.

### Features
  - A tracker that displays the route you travelled on a map
  - Statistics about your past rides, enjoy a rising chart as you bike more often
  - Customizable notifications to remind you to start the app before going to college or uni (or anywhere you go on a regular basis)

### Tech
The app is made with the [ionic] framework which is build on top of [angular] (for web apps) and [cordova] (wraps web apps in a native app). It uses several cordova plugins to make native calls to track [geolocation], send [notifications], etc. Check package.json for an exhaustive list.

### Installation
First make sure you have [node.js] 4 installed. Then install [ionic] and [cordova].

    $ npm install -g cordova ionic

Now you can clone the project and resolve dependencies using [npm] and [bower]. Then install cordova plugins by restoring the state.

    $ git clone https://github.com/Buccaneer/goegefietst.git goegefietst
    $ cd goegefietst
    $ npm install
    $ bower install
    $ ionic state restore

The following step shouldn't be required. But if you encounter angular related dependency errors: manually run the injection task then try to run the app again.

    $ gulp inject

Run the project in your browser.  
Note: most cordova plugins such as geolocation and notifications rely on native calls and don't work in your browser.

    $ ionic serve

Run the project on an android device (to run on ios, replace 'android' with 'ios').  
Adding the platform is only necessary the first time you run that platform.

    $ ionic platform add android
    $ ionic run android

### Version
0.0.1 in development

License
----
Copyright (C) 2016 TreinTramBus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

[//]: #

   [City of Ghent]: <https://stad.gent/>
   [npm]: <https://www.npmjs.com/>
   [node.js]: <https://nodejs.org/en/>
   [bower]: <http://bower.io/>
   [ionic]: <http://ionicframework.com/>
   [cordova]: <https://cordova.apache.org/>
   [angular]: <https://angularjs.org/>
   [geolocation]: <https://github.com/mauron85/cordova-plugin-background-geolocation>
   [notifications]: <https://github.com/katzer/cordova-plugin-local-notifications>
