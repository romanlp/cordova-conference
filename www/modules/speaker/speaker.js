angular.module('conf.speaker', [])
    .controller('speakersController', function(loadData, $http, $scope, $filter, $sce){

      loadData.load().then(function(data){
            $scope.speakers = $filter('orderBy')(data.speakers, "firstname");
      });

      $scope.renderHtml = function (htmlCode) {
           return $sce.trustAsHtml($filter('limitTo')(htmlCode, 100));
       };

       var changePage = function(pageLocation, speaker) {
           console.log('changing location ', pageLocation);
           app.navi.pushPage(pageLocation, { speaker: speaker});
       }

       this.openDetail = function(speaker) {
         changePage('modules/speaker/detailSpeaker.html', speaker);
       }

    })
    .controller('speakerController', function($scope, $sce, $cordovaContacts){

      var page = app.navi.getCurrentPage();
      $scope.speaker = page.options.speaker;

      $scope.renderHtml = function (htmlCode) {
           return $sce.trustAsHtml(htmlCode);
       };

       var updateIsInContact = function(){
         var opts = {
             filter : $scope.speaker.id,
             multiple: true,
             fields:  [ 'nickname' ]
         };
         $cordovaContacts.find(opts).then(function (contactsFound) {
             $scope.isInContacts = contactsFound.length > 0;
         });
       }

       $scope.isInContacts = false;
       updateIsInContact();

       $scope.toggleInContact = function(){
         if(!$scope.isInContacts){
             //remove
             var opts = {
                 filter : $scope.speaker.id,
                 multiple: false,
                 fields:  [ 'nickname' ]
             };

             $cordovaContacts.find(opts).then(function (contactsFound) {
                 var contact = contactsFound[0];
                 $cordovaContacts.remove(contact).then(function(result){

                 }, function(err){

                 });
             });
         }
         else {
             //create
             var contact = {
                 displayName : $scope.speaker.firstname + ' ' + $scope.speaker.lastname,
                 name : $scope.speaker.firstname + ' ' + $scope.speaker.lastname,
                 note : $scope.speaker.about,
                 nickname :  $scope.speaker.id,
                 urls : getUrls(),
                 organizations : getOrganizations()
             };
             $cordovaContacts.save(contact).then(function(result) {

             }, function(err) {
                 // Contact error
             });
         }
       }

       var getUrls = function(){
           var ret = [];
           $scope.speaker.socials.forEach(function(element){
               ret.push(new ContactField('url', element.link));
           });
           return ret;
       };

        var getOrganizations = function(){
            var ret = [];
            ret.push(new ContactOrganization(false, 'home', $scope.speaker.company, '', ''));
            return ret;
        };


    });
