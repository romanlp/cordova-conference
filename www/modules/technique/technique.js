angular.module('conf.technique',[])
    .controller('techController', function($scope){
      document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
          console.log(device.cordova);
          $scope.device = device;
        }

    });
