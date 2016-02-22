angular.module('conf.home', [])
    .controller('homeController', function(){
        this.title = 'Application Conference';

        var changePage = function(pageLocation) {
            console.log('changing location ', pageLocation);
            app.menu.setMainPage(pageLocation);
        }


        this.goToSessions = function() { changePage('modules/session/sessions.html');}
        this.goToSpeakers = function() { changePage('modules/speaker/speakers.html');}
        this.goToHome = function() { changePage('modules/home/home.html');}
        this.goToTechniques = function() { changePage('modules/technique/techniques.html');}
        this.goToAbout = function() { changePage('modules/about/about.html');}

    });
