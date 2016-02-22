angular.module('conf.agenda',[])
    .controller('agendaController', function(loadData, $scope, $filter){

      loadData.load().then(function(data){
        $scope.hours = data.hours;
        $scope.sessions = $filter('orderBy')(data.sessions, "hour");
      });

      $scope.getHour = function(hour){
        var h = $scope.hours[hour];
        return h.hourStart + ":" + h.minStart;
      }

      $scope.getDuration = function(hour) {
          var h = $scope.hours[hour];
          var start = parseInt(h.hourStart) * 60 + parseInt(h.minStart);
          var end = parseInt(h.hourEnd) * 60 + parseInt(h.minEnd);
          var duration = end - start;
          var min = duration%60 === 0 ? "00" : duration%60;
          return Math.floor(duration/60) + "h" + min;
      }
      $scope.getSpeaker = function(session) {
          if(session.speakers !== undefined){
              return "@" + session.speakers[0];
          }
          else {
              return "";
          }
      }

    });
