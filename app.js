var database = 'bi-m2';
var extractedPath = 'extracted';
var mysql      = require('mysql');
var async      = require('async');
var _          = require('lodash');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : database
});

async.series({

    /*
     * Check connection
     */
    connection: function(callback){
        connection.connect(function(err) {
            if (err) return callback(err);
            console.log('connected as id ' + connection.threadId);
            return callback(null);
        });
    },

    /*
     * Truncate all tables
     */
    drop: function(callback){

        async.parallel({
            team: function(callback){
                connection.query('TRUNCATE team', function(err, rows) {
                    if (err) return callback(err);
                    console.log('Table team empty');
                    return callback(null);
                });
            }
        },
        function(err, results) {
            console.log('all tables empty');
            return callback(err, results);
        });
    },

    /*
     * fill table team
     */
    fillTeam: function(callback){

        // Get data from json
        require('fs').readFile(extractedPath + '/league-hierarchy.json', 'utf8', function (err, data) {
            if (err) return callback(err);
            obj = JSON.parse(data);
            var teamToAdd = [];

            // Loop over conference
            _.forEach(obj.conferences, function( conference ) {

                // Loop over division
                _.forEach(conference.divisions, function( division ) {

                    // Loop over teams
                    _.forEach(division.teams, function( team ) {

                        // Register new team
                        teamToAdd.push({
                            id: team.id,
                            conference: conference.name,
                            division: division.name,
                            name: team.name,
                            season: ''
                        });

                    });

                });
            });

            // Add all team
            async.each(teamToAdd, function( team, cbAsync) {
                connection.query("INSERT INTO `bi-m2`.`team` (`id`, `conference`, `division`, `name`, `season`) VALUES ('"+team.id+"', '"+team.conference+"', '"+team.division+"', '"+team.name+"', '"+team.season+"')", function(err, rows) {
                    return cbAsync(err);
                });
            }, function(err){
                return callback(err);
            });

        });
    }

},
function(err, results) {
    if(err){
        console.error('Error in main program: ' + err.stack);
    }
    // results is now equal to: {one: 1, two: 2}

    connection.end();
    console.log('End of program');
});




