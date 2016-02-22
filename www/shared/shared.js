angular.module('conf.shared', [])
    .controller('menuController', function(){

        var changePage = function(pageLocation) {
            console.log('changing location ', pageLocation);
            app.menu.setMainPage(pageLocation);
            app.menu.closeMenu();
        }


        this.goToAgenda   = function() { changePage('modules/agenda/agenda.html');}
        this.goToSessions = function() { changePage('modules/session/sessions.html');}
        this.goToSpeakers = function() { changePage('modules/speaker/speakers.html');}
        this.goToHome =     function() { changePage('modules/home/home.html');}
        this.goToTechniques=function() { changePage('modules/technique/techniques.html');}
        this.goToAbout =    function() { changePage('modules/about/about.html');}

    })
    .factory('loadData', function($http, $q){

      function load(){
        return $q(function(resolve, reject){
            if(window.localStorage["com.conference.data"] != undefined){
              resolve(JSON.parse(window.localStorage["com.conference.data"]));
            }
            else{
              $http.get('http://devfest2015.gdgnantes.com/assets/prog.json')
                .success(function(data){
                  window.localStorage["com.conference.data"] = JSON.stringify(data);
                  resolve(data);
                })
                .error(function(data){
                  reject(data);
                });
            }
        })
      }

      return {
        load: load
      }

    })
    .factory('medias', function($q, $cordovaSQLite){

      var db = undefined;
      return {
        load: load,
        saveNote: saveNote,
        saveMedia: saveMedia
      }

      function load(id) {
        var sqlCreateNote = 'CREATE TABLE IF NOT EXISTS note_session (id text primary key, data text)';
        var sqlCreateImageNote = 'CREATE TABLE IF NOT EXISTS media_note (id text, data text primary key, type text)';
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        console.log("toto");
        return $q(function(resolve, reject){
            $cordovaSQLite.execute(db, sqlCreateNote, [])
              .then(function(res){
                $cordovaSQLite.execute(db, sqlCreateImageNote, [])
                .then(function(res){

                  var ret = {
                    "note":"",
                    "images": [],
                    "videos": [],
                    "audios": [],
                  };

                  var sql = 'SELECT * FROM note_session WHERE id=?;';
                  $cordovaSQLite.execute(db, sql, [id]).then(function(res){
                    if(res.rows.item(0) !== undefined)
                      ret.note = res.rows.item(0).data;

                    var sql = 'SELECT * FROM media_note WHERE id=?;';
                    $cordovaSQLite.execute(db, sql, [id]).then(function(res){
                      for (var i=0 ; i<res.rows.length ; i++) {
                        if(res.rows.item(i).type == "image"){
                          ret.images.push(res.rows.item(i).data)
                        }
                        else if(res.rows.item(i).type == "video"){
                          ret.videos.push(res.rows.item(i).data)
                        }
                        else if(res.rows.item(i).type == "audio"){
                          ret.audios.push(res.rows.item(i).data)
                        }
                      }
                      console.log("data retrieved");
                      resolve(ret);
                    });
                  });
                });
              });
        });
      }

      function saveNote(id, note){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'INSERT OR REPLACE INTO note_session values (?,?);';
          $cordovaSQLite.execute(db, sql, [id, note]).then(function(res){
            resolve(res);
          })
        });

      }

      function saveMedia(id, uri, type){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'INSERT OR REPLACE INTO media_note values (?,?,?);';
          $cordovaSQLite.execute(db, sql, [id, uri, type]).then(function(res){
            resolve(res);
          })
        });
      }


    })
    .factory('notation', function($q, $cordovaSQLite){

      var db = undefined;
      return {
        getNote: getNote,
        setNote: setNote,
      }

      function createTable(){
        var sqlCreateNote = 'CREATE TABLE IF NOT EXISTS notation_session (id text primary key, note text)';
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject){
            $cordovaSQLite.execute(db, sqlCreateNote, [])
              .then(function(res){
                resolve(res);
              });
            });
      }

      function setNote(id, note){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'INSERT OR REPLACE INTO notation_session values (?,?);';
          createTable().then(function(res){
            $cordovaSQLite.execute(db, sql, [id, note]).then(function(res){
              resolve(res);
            });
          });
        });
      }

      function getNote(id){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'SELECT * FROM notation_session WHERE id=?;';
          createTable().then(function(res){
            $cordovaSQLite.execute(db, sql, [id]).then(function(res){
              if(res.rows.item(0) !== undefined)
                resolve(res.rows.item(0).note);
              });
            });
          });
        }
    })
    .factory('favoris', function($q, $cordovaSQLite){

      var db = undefined;
      return {
        getAllFavoris: getAllFavoris,
        isFavoris: isFavoris,
        setFavoris: setFavoris,
      }

      function createTable(){
        var sqlCreateNote = 'CREATE TABLE IF NOT EXISTS favoris (id text primary key)';
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject){
            $cordovaSQLite.execute(db, sqlCreateNote, [])
              .then(function(res){
                resolve(res);
              });
            });
      }

      function setFavoris(id){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'INSERT OR REPLACE INTO favoris values (?);';
          var sqlRemove = 'DELETE from favoris where id=?;';
          createTable().then(function(res){
            isFavoris(id).then(function(res){
              if(res)
                $cordovaSQLite.execute(db, sqlRemove, [id]).then(function(res){
                  resolve(false);
                });
              else
                $cordovaSQLite.execute(db, sql, [id]).then(function(res){
                  resolve(true);
                });
            });
          });
        });
      }

      function isFavoris(id){
        if(db == undefined){
          db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
        }
        return $q(function(resolve, reject) {
          var sql = 'SELECT * FROM favoris WHERE id=?;';
          createTable().then(function(res){
            $cordovaSQLite.execute(db, sql, [id]).then(function(res){
              if(res.rows.item(0) !== undefined)
                resolve(true);
              else
                resolve(false);
              });
            });
          });
        }

        function getAllFavoris(){
          if(db == undefined){
            db =  $cordovaSQLite.openDB({ name: "my.db.conference" });
          }
          return $q(function(resolve, reject) {
            var sql = 'SELECT * FROM favoris;';
            createTable().then(function(res){
              $cordovaSQLite.execute(db, sql, []).then(function(res){
                var favoris = []
                for (var i = 0; i < res.rows.length; i++) {
                  favoris.push(res.rows.item(i));
                }
                resolve(favoris);
                });
              });
            });
          }
    });
