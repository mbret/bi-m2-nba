var database = 'bi-m2';
var extractedPath = 'extracted';
var mysql      = require('mysql');
var async      = require('async');
var _          = require('lodash');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : database
});

async.waterfall([

    /*
     * Check connection
     */
    function connectionCheck(callback){
        connection.connect(function(err) {
            if (err) return callback(err);
            console.log('connected as id ' + connection.threadId);
            return callback(null);
        });
    },

    /*
     * Truncate all tables
     */
    function emptyAllTable(callback){

        var tables = ['team', 'team_player', 'team_coatch', 'player', 'injury', 'coatch', 'game'];
        var tasks = [];
        _.forEach(tables, function( table ) {

            tasks.push( function(callback){
                connection.query('TRUNCATE ' + table, function(err, rows) {
                    if (err) return callback(err);
                    console.log('Table '+table+' empty');
                    return callback(null);
                });
            } );
        });

        async.parallel(tasks, function(err, results) {
            if(!err) console.log('all tables empty');
            return callback(err);
        });
    },

    /*
     * fill table team
     */
    function fillTeam(callback){

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
                if(!err) console.log('Table team filled');
                return callback(err);
            });

        });
    },

    /*
     * @require: teams/*.json
     */
    function fillCoatch(callback){
        var files = require('fs').readdirSync(extractedPath + '/teams');
        var teams = [];
        files.forEach(function(file){

            if(/(.*).json/.test(file)) {
                data = require('fs').readFileSync(extractedPath + '/teams/' + file, 'utf8');
                teams.push( JSON.parse(data) );
            }
        });

        var entries = [];
        _.forEach(teams, function( team ) {
            _.forEach(team.coaches, function( coatch ) {
                entries.push({
                    id: coatch.id,
                    full_name: coatch.full_name,
                    position: coatch.position,
                    experience: coatch.experience
                });

            });
        });

        // Add all entries
        async.each(entries, function( entry, cbAsync) {
            connection.query("INSERT INTO `bi-m2`.`coatch` (`id`, `full_name`, `position`, `experience` ) VALUES ('"+entry.id+"', "+mysql.escape(entry.full_name)+", '"+entry.position+"', '"+entry.experience+"')", function(err, rows) {
                return cbAsync(err);
            });
        }, function(err){
            if(!err) console.log('Table coatch filled');
            return callback(err, teams);
        });
    },

    function fillTeamCoatch(teams, callback){
        var entries = [];
        _.forEach(teams, function( team ) {
            _.forEach(team.coaches, function( coatch ) {
                entries.push({
                    team_id: team.id,
                    coatch_id: coatch.id,
                    start_date: '2014-01-01',
                    end_date: '2014-12-31',
                    season: 2014
                });

            });
        });

        // Add all entries
        async.each(entries, function( entry, cbAsync) {
            connection.query("INSERT INTO `bi-m2`.`team_coatch` (`coatch_id`, `team_id`, `start_date`, `end_date`, `season` ) VALUES ('"+entry.coatch_id+"', '"+entry.team_id+"', '"+entry.start_date+"', '"+entry.end_date+"', '"+entry.season+"')", function(err, rows) {
                return cbAsync(err);
            });
        }, function(err){
            if(!err) console.log('Table team_coatch filled');
            return callback(err, teams);
        });
    },

    /*
     *
     */
    function fillPlayer(teams, callback){

        /*
         * Loop over players
         */
        var files = require('fs').readdirSync(extractedPath + '/players');
        var players = [];
        files.forEach(function(file){

            if(/(.*).json/.test(file)) {
                data = require('fs').readFileSync(extractedPath + '/players/' + file, 'utf8');
                players.push( JSON.parse(data) );
            }
        });

        // Add all players
        async.each(players, function( player, cbAsync) {
//            console.log(player.full_name + ' & ' + mysql.escape(player.full_name));
            connection.query("INSERT INTO `bi-m2`.`player` (`id`, `name`, `birthdate`, `height`, `position`, `primary_position`, `status`, `experience` ) VALUES ('"+player.id+"', "+mysql.escape(player.full_name)+", '"+player.birthdate+"', '"+player.height+"', '"+player.position+"', '"+player.primary_position+"', '"+player.status+"', '"+player.experience+"')", function(err, rows) {
                return cbAsync(err);
            });
        }, function(err){
            if(!err) console.log('Table player filled');
            return callback(err, teams, players);
        });
    },

    /*
     * Fill for each team the players composing the team at specific date
     */
    function fillTeamPlayer(teams, players, callback){

        var entries = [];
        // Loop over each players
        _.forEach(players, function( player ) {

            // loop over each season
            _.forEach(player.seasons, function( season ) {

                // loop over each team
                _.forEach(season.teams, function( team ) {

                    entries.push({
                        date_start: season.year + '-01-01',
                        date_end: season.year + '-12-31',
                        season: season.year,
                        player_id: player.id,
                        team_id: team.id
                    })
                });
            });
        });

//        console.log(players);
        // Add all entries
        async.each(entries, function( entry, cbAsync) {
            connection.query("INSERT INTO `bi-m2`.`team_player` (`date_start`, `date_end`, `season`, `player_id`, `team_id`) VALUES ('"+entry.date_start+"', '"+entry.date_end+"', '"+entry.season+"', '"+entry.player_id+"', '"+entry.team_id+"')", function(err, rows) {
                return cbAsync(err);
            });
        }, function(err){
            if(!err) console.log('Table team_player filled');
            return callback(err);
        });
    },

    /*
     * fill injuries table
     * @require: injuries.json
     */
    function fillInjuries(callback){
        var data = require('fs').readFileSync(extractedPath + '/injuries.json', 'utf8');
        var injuries = JSON.parse(data);

        var injuriesToDb = [];

        _.forEach(injuries.teams, function( team ) {

            _.forEach(team.players, function( player ) {

                _.forEach(player.injuries, function( injury ) {
                    injuriesToDb.push({
                        id: injury.id,
                        player_id: player.id,
                        start_date: injury.start_date,
                        update_date: injury.update_date,
                        status: injury.status
                    })
                });
            });
        });

        // Add all entries
        async.each(injuriesToDb, function( entry, cbAsync) {
            connection.query("INSERT INTO `bi-m2`.`injury` (`id`, `start_date`, `update_date`, `player_id`, `status`) VALUES ('"+entry.id+"', '"+entry.start_date+"', '"+entry.update_date+"', '"+entry.player_id+"', '"+entry.status+"')", function(err, rows) {
                return cbAsync(err);
            });
        }, function(err){
            if(!err) console.log('Table injury filled');
            return callback(err);
        });
    },

    /*
     * Fill the table game
     * @require: /games/boxscores/*.jons
     */
    function fillGame(callback){

        var files = require('fs').readdirSync(extractedPath + '/games/boxscores');
        var games = [];

        // Loop over each files with a sync iterator function
        // in parallel
        async.each( files, function(file, callback){

            if(/(.*).json/.test(file)) {

                data = require('fs').readFileSync(extractedPath + '/games/boxscores/' + file, 'utf8');
                var game = JSON.parse(data);

                // Games that has not been played
                if(game.status == 'unnecessary'){
                    return callback();
                }

                connection.query(
                    "INSERT INTO `bi-m2`.`game` (`id`, `team_home_id`, `team_away_id`, `away_points`, `home_points`, `duration` ) VALUES ('"+game.id+"', '"+game.home.id+"', '"+game.away.id+"', '"+game.away.points+"', '"+game.home.points+"', '"+game.duration+"')",
                    function(err, rows) {
                        return callback(err);
                    }
                );
            }
        },
        function(err){
            if(!err) console.log('Table game filled');
            return callback(err);
        });
    },

    function fillGameStatistic( callback ){
        return callback();
    },

    function fillGameStatisticForPlayers( callback ){
        return callback();
    },


],
function(err, results) {
    if(err){
        console.error('Error in main program: ' + err.stack);
    }
    // results is now equal to: {one: 1, two: 2}

    connection.end();
    console.log('End of program');
});




