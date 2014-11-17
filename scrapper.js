/**
 * Created by Maxime on 15/11/2014.
 */
var http = require('http');
var jf = require('jsonfile');
var extractedPath = 'extracted';
var async      = require('async');
var _          = require('lodash');
var request    = require('request');
var host = 'http://api.sportsdatallc.org';
// maxime, joris, colon
var keys = ['khr6x4favjaqctsp6h29ucnn','5n9qx5mnseq5za8xevz2vbz7', '8tp8f44kaavt2jdag3gpn35a'];
var usedKey = 2;
var ourTeamId     = '583ec773-fb46-11e1-82cb-f4ce4684ea4c'; // Cavaliers

// x ms second between each requests
var nextAPIcallTimeout = 1000;
var APIcallTimoutExtra = 1000;

console.log('Start of program');
async.series([

    function(callback){
        console.log('Start extracting of injuries');
        extractInjuriesFromAPI(function(err){
            return callback(err);
        });
    },

    function(callback){
        console.log('Start extracting of teams profile');
        extractAllTeamProfileFromAPI(function(err){
            callback(err);
        });
    },

    function(callback){
        console.log('Start extracting of players profile');
        // Only extract info from our
        extractAllPlayerProfileFromAPI( function(err){
            callback(err);
        });
    },

    function(callback){
        console.log('Start extracting of schedules');
        extractScheduleFromAPI(function(err){
            return callback(err);
        });
    },

    function(callback){
        console.log('Start extracting of boxscores');
        extractBoxScoresFromAPI( [ourTeamId], function(err){
            return callback(err);
        });
    },

    function(callback){
        console.log('Start extracting of summaries');
        extractGamesSummariesFromAPI( [ourTeamId], function(err){
            return callback(err);
        });
    }
],
function(err, results) {
    if(err){
        console.error('Error in main program: ' + err.stack);
        console.log('End of program with error');
        process.exit(code=0);
    }
    console.log('End of program with sucess');
});

/**
 * @require: schedules/*.json
 * @param teamIdFilter only extract boxscores for games related to this team
 */
function extractBoxScoresFromAPI( teamIdFilter, callback){

    require('fs').readdir(extractedPath + '/schedules',function(err,files){
        if(err) return callback(err);

        // Loop over schedules
        async.eachSeries( files, function(file, callback){

            if(/(.*).json/.test(file)  ) {


                try {
                    data = require('fs').readFileSync(extractedPath + '/schedules/' + file, 'utf8');
                    schedule = JSON.parse(data);

                    // Loop over all games inside schedule
                    async.eachSeries( schedule.games, function(game, callback){

                        // Only take games for team in filter
                        // If there are no filter or if filter (home or away should be in array of id)
                        if( teamIdFilter == null || (teamIdFilter.indexOf(game.home.id) > -1 || teamIdFilter.indexOf(game.away.id) > -1 )  ){

                            // && (teamIdFilter && teamIdFilter.indexOf(file.substring( 0, (file.length - '.json'.length))) > -1
                            var fileToCreate = extractedPath + '/games/boxscores/' + game.id + '.json';
                            var urlToCall = host + '/nba-t3/games/' + game.id + '/boxscore.json?api_key=' + keys[usedKey];

                            if( require('fs').existsSync(fileToCreate) ){
                                console.log('Element ' + game.id + ' skipped because already extracted!');
                                return callback();
                            }
                            else{
                                setTimeout(function () {
                                    nextAPIcallTimeout += APIcallTimoutExtra;

                                    console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');
                                    request(urlToCall, function(error, response, body){
                                        if(error) return callback(error);
                                        if (response.statusCode == 403) {
                                            return callback(new Error(response.body));
                                        }
                                        else{
                                            var obj2 = JSON.parse(body);
                                            jf.writeFileSync(fileToCreate, obj2);
                                            console.log('Element ' + game.id + ' extracted!');
                                            return callback();
                                        }
                                    });

                                }, nextAPIcallTimeout);
                            }
                        }
                        else{
                            return callback();
                        }


                    }, function(err){
                        return callback(err);
                    });

                } catch (err) {
                    return callback(err);
                }
            }
            else{
                return callback();
            }

        }, function(err){
            return callback(err);
        });
    });
}

function extractScheduleFromAPI( callback ){

    async.eachSeries([2012,2013,2014], function( year, callback){

        async.eachSeries( ['pre', 'reg', 'pst'], function( nba_season, callback){

            var fileToCreate = extractedPath + '/schedules/' + year + '_' + nba_season + '.json';
            var urlToCall = host + '/nba-t3/games/' + year + '/' + nba_season + '/schedule.json?api_key=' + keys[usedKey];

            if( require('fs').existsSync(fileToCreate) ){
                console.log('Element schedule ' +year+ ' ' +nba_season+ ' skipped because already extracted!');
                return callback();
            }
            else{
                setTimeout(function() {

                    nextAPIcallTimeout += APIcallTimoutExtra;
                    console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');

                    request(urlToCall, function(error, response, body){
                        if(error) return callback(error);
                        if (response.statusCode == 403) {
                            return callback(new Error(new Error(response.body)));
                        }
                        else{
                            var obj2 = JSON.parse(body);
                            jf.writeFileSync(fileToCreate, obj2);
                            console.log('Element schedule ' +year+ ' ' +nba_season+ ' extracted!');
                            return callback();
                        }
                    });

                }, nextAPIcallTimeout);
            }

        }, function(err){
            return callback(err);
        });

    }, function(err){
        return callback(err);
    });

}

/**
 *
 * @require: nothing
 */
function extractInjuriesFromAPI( callback ){

    var fileToCreate = extractedPath + '/injuries.json';
    var urlToCall = host + '/nba-t3/league/injuries.json?api_key=' + keys[usedKey];

    if( require('fs').existsSync(fileToCreate) ){
        console.log('Element injuries skipped because already extracted!');
        return callback();
    }
    else{
        setTimeout(function () {
            nextAPIcallTimeout += APIcallTimoutExtra;

            console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');
            request(urlToCall, function(error, response, body){
                if(error) return callback(error);
                if (response.statusCode == 403) {
                    return callback(new Error(response.body));
                }
                else{
                    var obj2 = JSON.parse(body);
                    jf.writeFileSync(fileToCreate, obj2);
                    console.log('Element injuries.json extracted!');
                    return callback();
                }
            });

        }, nextAPIcallTimeout);
    }
}

/*
 * Get all team profiles
 * @require: league-hierarchy.json
 */
function extractAllTeamProfileFromAPI( callback ){

    require('fs').readFile(extractedPath + '/league-hierarchy.json', 'utf8', function (err, data) {
        if (err) return callback(err);

        obj = JSON.parse(data);

        async.eachSeries(obj.conferences, function(conference, callback){

            async.eachSeries(conference.divisions, function(division, callback){

                async.eachSeries(division.teams, function(team, callback){

                    var fileToCreate = extractedPath + '/teams/' + team.id + '.json';
                    var urlToCall = host + '/nba-t3/teams/'+team.id+'/profile.json?api_key=' + keys[usedKey];

                    if( require('fs').existsSync(fileToCreate) ){
                        console.log('Element '+team.id+' skipped because already extracted!');
                        return callback();
                    }
                    else{
                        setTimeout(function () {
                            nextAPIcallTimeout += APIcallTimoutExtra;
                            console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');
                            request(urlToCall, function(error, response, body){
                                if(error) return callback(error);
                                if (response.statusCode == 403) {
                                    return callback(new Error(response.body));
                                }
                                else{
                                    var obj2 = JSON.parse(body);
                                    jf.writeFileSync(fileToCreate, obj2);
                                    console.log('Element '+team.id+' extracted!');
                                    return callback();
                                }
                            });

                        }, nextAPIcallTimeout);
                    }
                }, function(err){
                    return callback(err);
                });
            }, function(err){
                return callback(err);
            });
        }, function(err){
            return callback(err);
        });
    });
}

/**
 * Get all profiles for all NBA players.
 * We use all teams/*.json to get all possible players
 * @require /teams/*.json
 */
function extractAllPlayerProfileFromAPI( callback  ){

    // Loop over dir
    require('fs').readdir(extractedPath + '/teams',function(err,files){
        if(err) return callback(err);

        /*
         * Loop over files synchronously
         */
        async.eachSeries( files, function(file, callback){

            // Only take .json files
            if(/(.*).json/.test(file) ) {

                try {
                    data = require('fs').readFileSync(extractedPath + '/teams/' + file, 'utf8');
                    obj = JSON.parse(data);

                    /*
                     * Loop over players synchronously
                     */
                    async.eachSeries(obj.players, function(player, callback){

                        var fileToCreate = extractedPath + '/players/' + player.id + '.json';
                        var urlToCall = host + '/nba-t3/players/' + player.id + '/profile.json?api_key=' + keys[usedKey];

                        if( require('fs').existsSync(fileToCreate) ){
                            console.log('Element '+player.id+'skipped because already extracted!');
                            return callback();
                        }
                        else{
                            setTimeout(function () {
                                nextAPIcallTimeout += APIcallTimoutExtra;

                                console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');
                                request(urlToCall, function(error, response, body){
                                    if(error) return callback(error);
                                    if (response.statusCode == 403) {
                                        return callback(new Error(response.body));
                                    }
                                    else{
                                        var obj2 = JSON.parse(body);
                                        jf.writeFileSync(fileToCreate, obj2);

                                        console.log('Element '+player.id+' extracted!');
                                        return callback();
                                    }
                                });

                            }, nextAPIcallTimeout);
                        }

                    }, function(err){
                        return callback(err);
                    })
                } catch (err) {
                    return callback(err);
                }
            }
            else{
                return callback();
            }
        },function(err){
            return callback(err);
        })
    });
}

/**
 *
 * @require /schedules/*.json
 */
function extractGamesSummariesFromAPI( teamIdFilter, callback ){

    require('fs').readdir(extractedPath + '/schedules',function(err,files){
        if(err) return callback(err);

        // Loop over schedules
        async.eachSeries( files, function(file, callback){

            if(/(.*).json/.test(file)) {

                try {
                    data = require('fs').readFileSync(extractedPath + '/schedules/' + file, 'utf8');
                    schedule = JSON.parse(data);

                    // Loop over all games inside schedule
                    async.eachSeries( schedule.games, function(game, callback){

                        // Only take games for team in filter
                        // If there are no filter or if filter (home or away should be in array of id)
                        if( teamIdFilter == null || (teamIdFilter.indexOf(game.home.id) > -1 || teamIdFilter.indexOf(game.away.id) > -1 ) ){

                            var fileToCreate = extractedPath + '/games/summaries/' + game.id + '.json';
                            var urlToCall = host + '/nba-t3/games/' + game.id + '/summary.json?api_key=' + keys[usedKey];

                            if( require('fs').existsSync(fileToCreate) ){
                                console.log('Element [game summary ' + game.id + '] skipped because already extracted!');
                                return callback();
                            }
                            else{
                                setTimeout(function () {
                                    nextAPIcallTimeout += APIcallTimoutExtra;

                                    console.log('call: ' + urlToCall + ' after: ' + nextAPIcallTimeout + 'ms');
                                    request(urlToCall, function(error, response, body){
                                        if(error) return callback(error);
                                        if (response.statusCode == 403) {
                                            return callback(new Error(response.body));
                                        }
                                        else{
                                            var obj2 = JSON.parse(body);
                                            jf.writeFileSync(fileToCreate, obj2);
                                            console.log('Element [game summary ' + game.id + '] extracted!');
                                            return callback();
                                        }
                                    });

                                }, nextAPIcallTimeout);
                            }
                        }
                        else{
                            return callback();
                        }
                    }, function(err){
                        return callback(err);
                    });

                } catch (err) {
                    return callback(err);
                }
            }
            else{
                return callback();
            }

        }, function(err){
            return callback(err);
        });
    });
}