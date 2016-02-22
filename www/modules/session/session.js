angular.module('conf.session',[])
    .controller('sessionsController', function(loadData, $scope, favoris){

      loadData.load().then(function(data){
        $scope.categories = data.categories;
        $scope.sessions = data.sessions;
        favoris.getAllFavoris().then(function(result) {
          for (var fav in result) {
            $scope.sessions[fav].fav = true;
          }
        });
      });


      var changePage = function(pageLocation, session) {
          console.log('changing location ', pageLocation);
          app.navi.pushPage(pageLocation, { session: session});
      }

      this.openDetail = function(session) {
        changePage('modules/session/session.html', session);
      }

    })
    .controller('sessionController', function($scope, notation, favoris){

      var page = app.navi.getCurrentPage();
      $scope.session = page.options.session;
      $scope.note = 0;
      var fav = false;

      notation.getNote($scope.session.id).then(function(data){
        $scope.note = data;
      });

      $scope.getNote = function(note){
        if(note > $scope.note){
          return "fa-star-o";
        }
        else{
          return "fa-star";
        }
      }

      $scope.setNote = function(note){
        notation.setNote($scope.session.id, note).then(function(data){
          $scope.note = note;
          console.log("Note ajoutée");
        })
      }

      favoris.isFavoris($scope.session.id).then(function(res){
        fav = res;
      });

      $scope.isFavoris = function(){
          if(fav == true) return "fa-heart";
          else           return "fa-heart-o";
      }

      $scope.setFavoris = function(){
        favoris.setFavoris($scope.session.id).then(function(res){
          fav = res;
        });
      };

      console.log(page.options.session);

      this.openNote = function() {
        app.navi.pushPage('modules/session/note.html', { session: $scope.session });
      }

    })
    .controller('noteController', function ($scope, $cordovaSQLite, $cordovaCamera, $cordovaCapture, $cordovaActionSheet, $cordovaSocialSharing, medias, notation) {
      var page = app.navi.getCurrentPage();
      $scope.session = page.options.session;
      $scope.note = "";
      $scope.images = [];
      $scope.audios = [];
      $scope.videos = [];

      medias.load($scope.session.id).then(function(data){
        $scope.note   = data.note;
        $scope.images = data.images;
        $scope.audios = data.videos;
        $scope.videos = data.audios;
      });


      $scope.saveNote = function(){
        medias.saveNote($scope.session.id, $scope.note).then(function(data){
          console.log("Sauvegarde de :" + $scope.note);
        });
      };

      $scope.takePicture = function(){
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 150,
          targetHeight: 150,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };
        saveImage(options);

      }

      $scope.selectPicture = function(){
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 150,
          targetHeight: 150,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };
        saveImage(options);
      }

      function saveImage(options){
        $cordovaCamera.getPicture(options).then(function(imageURI) {
          $scope.images.push(imageURI);
          medias.saveMedia($scope.session.id, imageURI, "image");
        }, function(err) {
          // error
        });
      }

      $scope.captureAudio = function(){
        var options = { limit: 1, duration: 10 };
        $cordovaCapture.captureAudio(options).then(function(audioData) {
          $scope.audios.push(audioData[0].fullPath);
          medias.saveMedia($scope.session.id, audioData[0].fullPath, "audio");
        }, function(err) {
          console.log(err);
        });
      }

      $scope.captureVideo = function(){
        var options = { limit: 1, duration: 15 };

        $cordovaCapture.captureVideo(options).then(function(videoData) {
          $scope.videos.push(videoData[0].fullPath);
          medias.saveMedia($scope.session.id, videoData[0].fullPath, "video");
        }, function(err) {
          console.log(err);
        });
      }

      function deleteImage(media){
        $scope.images.splice($scope.images.indexOf(media), 1);
        $cordovaSQLite.execute(db, 'DELETE from media_note where id=? and data=?;', [$scope.session.id, media]);
      }

      function shareImage(media) {
        var message = "Regarde cette belle image";
        var subject = $scope.session.title;
        $cordovaSocialSharing
          .share(message, subject, media)
          .then(function(result) {
            // Success!
          }, function(err) {
            // An error occured. Show a message to the user
          });
      }

      $scope.showActions = function(media){
        var options = {
          'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
          title: 'Que voulez-vous faire de cette image ?',
          buttonLabels: ['Supprimer', 'Partager'],
          addCancelButtonWithLabel: 'Annuler',
          androidEnableCancelButton : true,
        };

        $cordovaActionSheet.show(options)
            .then(function(btnIndex) {
              if(btnIndex == 1)
                deleteImage(media);
              else if(btnIndex == 2)
                shareImage(media);
        });
      }

    });
