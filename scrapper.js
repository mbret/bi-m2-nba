/**
 * Created by Maxime on 15/11/2014.
 */
var http = require('http');
var jf = require('jsonfile');
var extractedPath = 'extracted';
var async      = require('async');
var _          = require('lodash');
var host = 'api.sportsdatallc.org';
// maxime, joris
var keys = ['khr6x4favjaqctsp6h29ucnn','5n9qx5mnseq5za8xevz2vbz7'];
var usedKey = 0;

console.log('Start of program');
async.series([

    function(callback){
        extractInjuriesFromAPI(function(err){
            return callback(err);
        });
    },

//    function(callback){
//        extractAllTeamProfileFromAPI(function(err){
//            callback(err);
//        });
//    },

//    function(callback){
//        extractAllPlayerProfileFromAPI(function(err){
//            callback(err);
//        });
//    },

    function(callback){
        extractScheduleFromAPI(function(err){
            return callback(err);
        })
    }
],
function(err, results) {
    if(err){
        console.error('Error in main program: ' + err.stack);
    }
    console.log('End of program');
});


function extractScheduleFromAPI( callback ){


    var tasks = [];

    // 2014, 2013, 2012
    var tick = 0;
    for(var i = 2012; i<= 2014; i++){
        tick++;
        doCall(i, 'pre', tick);
        tick++;
        doCall(i, 'reg', tick);
        tick++;
        doCall(i, 'pst', tick);
    }


    function doCall( year, nba_season, tick ){
        setTimeout(function(){
            console.log('/nba-t3/games/' + year + '/' + nba_season + '/schedule.json?api_key=' + keys[usedKey]);
            var request = http.request(
                {
                    host: host,
                    port: 80,
                    path: '/nba-t3/games/' + year + '/' + nba_season + '/schedule.json?api_key=' + keys[usedKey]
                },
                function(response) {
                    var str = '';

                    //another chunk of data has been recieved, so append it to `str`
                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    //the whole response has been recieved, so we just print it out here
                    response.on('end', function () {

                        var obj2 = JSON.parse(str);
                        jf.writeFileSync(extractedPath + '/schedules/' + year + '_'+nba_season+'.json', obj2);

                        return callback(null);
                    });
                }
            );
            request.on('error', function(err) {
                return callback(err);
            });
            request.end();
        , 3000 * tick});
    }

}


function extractInjuriesFromAPI( callback ){
    console.log('/nba-t3/league/injuries.json?api_key=' + keys[usedKey]);
    var request = http.request(
        {
            host: host,
            port: 80,
            path: '/nba-t3/league/injuries.json?api_key=' + keys[usedKey]
        },
        function(response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {

                var obj2 = JSON.parse(str);
                jf.writeFileSync(extractedPath + '/injuries.json', obj2);

                return callback(null);
            });
        }
    );
    request.on('error', function(err) {
        return callback(err);
    });
    request.end();
}

/*
 * Get all team profiles
 * REQUIRE: league-hierarchy.json
 */
function extractAllTeamProfileFromAPI( callback ){
    require('fs').readFile(extractedPath + '/league-hierarchy.json', 'utf8', function (err, data) {
        if (err) return callback(err);

        obj = JSON.parse(data);

        var listOfTeams = [];
        // Loop over conference
        _.forEach(obj.conferences, function (conference) {
            // Loop over division
            _.forEach(conference.divisions, function (division) {
                // Loop over teams
                _.forEach(division.teams, function (team) {
                    listOfTeams.push(team);
                });
            });
        });

        for(var i = 0; i< listOfTeams.length; i++){
            doSetTimeout(listOfTeams[i], i+1, listOfTeams.length);
        }

        function doSetTimeout(team, i, maxOfi) {
            setTimeout(function(){
                console.log('/nba-t3/teams/'+team.id+'/profile.json?api_key=' + keys[usedKey]);
                var request = http.request(
                    {
                        host: host,
                        port: 80,
                        path: '/nba-t3/teams/'+team.id+'/profile.json?api_key=' + keys[usedKey]
                    },
                    function(response) {
                        var str = '';

                        //another chunk of data has been recieved, so append it to `str`
                        response.on('data', function (chunk) {
                            str += chunk;
                        });

                        //the whole response has been recieved, so we just print it out here
                        response.on('end', function () {

                            var obj2 = JSON.parse(str);
                            jf.writeFileSync(extractedPath + '/teams/' + team.name + '.json', obj2);

                            if(maxOfi == i) return callback(null);
                        });
                    }
                );
                request.on('error', function(err) {
                    return callback(err);
                });
                request.end();
            }, 2000*i);
        }
    });
}

/*
 * REQUIRE: team-x-x.json
 */
function extractAllPlayerProfileFromAPI( callback ){

    // Loop over dir
    require('fs').readdir(extractedPath + '/teams',function(err,files){
        if(err) return callback(err);

        var players = [];
        files.forEach(function(file){
//            console.log(file);

            if(/(.*).json/.test(file)) {

                try {
                    data = require('fs').readFileSync(extractedPath + '/teams/' + file, 'utf8');
                    obj = JSON.parse(data);

                    for (var i = 0; i < obj.players.length; i++) {
                        players.push(obj.players[i]);
                    }
                } catch (err) {
                    return callback(err);
                }
            }
        });

        for (var i = 0; i < players.length; i++) {
            doSetTimeout(players[i], i+1, players.length);
        }

        function doSetTimeout(player, i, maxOfi) {
            setTimeout(function () {
                console.log('/nba-t3/players/' + player.id + '/profile.json?api_key=' + keys[usedKey]);
                var request = http.request(
                    {
                        host: host,
                        port: 80,
                        path: '/nba-t3/players/' + player.id + '/profile.json?api_key=' + keys[usedKey]
                    },
                    function (response) {
                        var str = '';

                        //another chunk of data has been recieved, so append it to `str`
                        response.on('data', function (chunk) {
                            str += chunk;
                        });

                        //the whole response has been recieved, so we just print it out here
                        response.on('end', function () {

                            var obj2 = JSON.parse(str);
                            jf.writeFileSync(extractedPath + '/players/' + player.full_name + '.json', obj2);

                            if(maxOfi == i) return callback(null);
                        });
                    }
                );
                request.on('error', function (err) {
                    return callback(err);
                });
                request.end();
            }, 4000 * i);
        }
    });
}
