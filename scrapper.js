/**
 * Created by Maxime on 15/11/2014.
 */
var http = require('http');
var jf = require('jsonfile');
var extractedPath = 'extracted';
var async      = require('async');
var _          = require('lodash');
var host = 'api.sportsdatallc.org';
var key = 'khr6x4favjaqctsp6h29ucnn';


extractAllPlayerProfileFromAPI( 2014 );

/*
 * Get all team profiles
 * REQUIRE: league-hierarchy.json
 */
function extractAllTeamProfileFromAPI(){
    require('fs').readFile(extractedPath + '/league-hierarchy.json', 'utf8', function (err, data) {
        if (err){
            console.log(err.stack);
            return;
        }
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
            doSetTimeout(listOfTeams[i], i);
        }

        function doSetTimeout(team, i) {
            setTimeout(function(){
                console.log('/nba-t3/teams/'+team.id+'/profile.json?api_key=' + key);
                var request = http.request(
                    {
                        host: host,
                        port: 80,
                        path: '/nba-t3/teams/'+team.id+'/profile.json?api_key=' + key
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
                            jf.writeFileSync(extractedPath + '/team-' + team.name + '-2014.json', obj2);

                        });
                    }
                );
                request.on('error', function(err) {
                    console.log(err.stack);
                    return;
                });
                request.end();
            }, 500*i);
        }
    });
}

/*
 * REQUIRE: team-x-x.json
 */
function extractAllPlayerProfileFromAPI( year ){

    // Loop over dir
    require('fs').readdir(extractedPath,function(err,files){
        if(err) throw err;
        files.forEach(function(file){

            // Get only file about team
            if(/team-(.*)-2014.json/.test(file)){

                require('fs').readFile(extractedPath + '/' + file, 'utf8', function (err, data) {
                    if (err){
                        console.log(err.stack);
                        return;
                    }
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
                        doSetTimeout(listOfTeams[i], i);
                    }

                    function doSetTimeout(team, i) {
                        setTimeout(function(){
                            console.log('/nba-t3/teams/'+team.id+'/profile.json?api_key=' + key);
                            var request = http.request(
                                {
                                    host: host,
                                    port: 80,
                                    path: '/nba-t3/teams/'+team.id+'/profile.json?api_key=' + key
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
                                        jf.writeFileSync(extractedPath + '/team-' + team.name + '-2014.json', obj2);

                                    });
                                }
                            );
                            request.on('error', function(err) {
                                console.log(err.stack);
                                return;
                            });
                            request.end();
                        }, 500*i);
                    }
                });

            }
        });
    });


}
