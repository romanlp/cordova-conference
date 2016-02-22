angular.module('conf.about',[])
    .controller('aboutController', function($scope, $cordovaInAppBrowser){

      $scope.version = "1.0.0";

      $scope.openGithub = function(){
        var options = {
          location: 'yes',
          clearcache: 'yes',
          toolbar: 'yes'
        };

        $cordovaInAppBrowser.open('https://github.com/romanlp', '_blank', options);
      }
    });
