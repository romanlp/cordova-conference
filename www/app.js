var app = ons.bootstrap('conferenceApp', [
    'onsen',
    'conf.shared',
    'conf.home',
    'conf.agenda',
    'conf.session',
    'conf.speaker',
    'conf.technique',
    'conf.about',
    'ngCordova'
])
.config(function($compileProvider){
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);
});
