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
var ourTeamId     = '583ec773-fb46-11e1-82cb-f4ce4684ea4c'; // Cavaliers

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

        var tables = ['injury', 'team_player', 'team_coatch', 'coatch', 'game_stat', 'game_player_stat', 'game', 'player', 'team', 'transfer' ];
        async.eachSeries(tables, function( table, callback ) {
            connection.query('TRUNCATE ' + table, function(err, rows) {
                if (err) return callback(err);
                console.log('Table '+table+' empty');
                return callback(null);
            });
        }, function(err){
            if(!err) console.log('all tables empty');
            return callback(err);
        });
    },

    /*
     * fill table team with all teams
     * Use the /teams/*.json to know all teams.
     */
    function fillTeam(callback){

        // Get data from json
        var files = require('fs').readdirSync(extractedPath + '/teams');

        async.eachSeries(files, function(file, callback){

            // Take only json files
            if(/(.*).json/.test(file) ) {
                data = require('fs').readFileSync(extractedPath + '/teams/' + file, 'utf8');
                team = JSON.parse(data);
                connection.query(
                    "INSERT INTO `bi-m2`.`team` (`id`, `conference`, `division`, `name`) " +
                    "VALUES ('"+team.id+"', '"+team.conference.name+"', '"+team.division.name+"', '"+team.name+"')", function(err, rows) {
                    return callback(err);
                });
            }
            else{
                return callback();
            }
        }, function(err){
            if(!err) console.log('Table team filled');
            return callback(err);
        });
    },

    /**
     * Fill all coaches present in /teams/*.js for all teams.
     * @todo Find a way to get more than only 2014 coaches (vecause the use of /teams/*.json is not reliable)
     * @require: teams/*.json
     *
     */
    function fillCoatch(callback){
        var files = require('fs').readdirSync(extractedPath + '/teams');
        var teams = [];
        async.eachSeries(files, function(file, callback){

            if(/(.*).json/.test(file)) {
                data = require('fs').readFileSync(extractedPath + '/teams/' + file, 'utf8');
                teams.push( JSON.parse(data) );
                var team = JSON.parse(data);
                async.eachSeries(team.coaches, function(coach, callback){
                    connection.query(
                            "INSERT INTO `bi-m2`.`coatch` (`id`, `full_name`, `position`, `experience` ) " +
                            "VALUES ('"+coach.id+"', "+mysql.escape(coach.full_name)+", '"+coach.position+"', '"+coach.experience+"')", function(err, rows) {
                        return callback(err);
                    });
                }, function(err){
                    return callback(err);
                })
            }
            else{
                return callback();
            }
        }, function(err){
            if(!err) console.log('Table coatch filled');
            return callback(err, teams);
        });
    },

    /**
     * Fill for all teams the coaches presents
     * @todo for the moment we only have coatches for 2014
     * @param teams
     * @param callback
     */
    function fillTeamCoatch(teams, callback){
        async.eachSeries(teams, function( team, callback ) {
            async.eachSeries(team.coaches, function( coach, callback ) {
                connection.query(
                        "INSERT INTO `bi-m2`.`team_coatch` (`coatch_id`, `team_id`, `start_date`, `end_date`, `season` ) " +
                        "VALUES ('"+coach.id+"', '"+team.id+"', '2014-01-01', '2014-12-31', 2014)", function(err, rows) {
                    return callback(err);
                });

            }, function(err){
                return callback(err);
            });
        }, function(err){
            if(!err) console.log('Table team_coatch filled');
            return callback(err, teams);
        });
    },

    /*
     * Fill all players actives in NBA
     */
    function fillPlayer(teams, callback){

        /*
         * Loop over players
         */
        var files = require('fs').readdirSync(extractedPath + '/players');
        var players = [];

        async.eachSeries(files, function(file, callback){

            // Take only json files
            if(/(.*).json/.test(file) ) {
                data = require('fs').readFileSync(extractedPath + '/players/' + file, 'utf8');
                var player = JSON.parse(data);
                players.push(player);
                connection.query(
                        "INSERT INTO `bi-m2`.`player` (`id`, `name`, `birthdate`, `height`, `position`, `primary_position`, `status`, `experience` ) " +
                        "VALUES ('"+player.id+"', "+mysql.escape(player.full_name)+", '"+player.birthdate+"', '"+player.height+"', '"+player.position+"', '"+player.primary_position+"', '"+player.status+"', '"+player.experience+"')",
                    function(err, rows) {
                    return callback(err, teams, players);
                });
            }
            else{
                return callback();
            }

        }, function(err){
            if(!err) console.log('Table player filled');
            return callback(err, teams, players);
        });

    },

    /*
     * Fill for our team the players actives
     * Check all players but keep and store only players that has played in our team.
     * @todo check why we only have history from 2013 to 2014 for team only
     */
    function fillTeamPlayer(teams, players, callback){

        async.eachSeries(players, function(player, callback){
            async.eachSeries(player.seasons, function(season, callback){
                async.eachSeries(season.teams, function(team, callback){

                    // Keep only players relative to our team
                    if( team.id != ourTeamId ){
                        return callback();
                    }
                    else{
                        connection.query(
                            "INSERT INTO `bi-m2`.`team_player` (`date_start`, `date_end`, `season`, `player_id`, `team_id`) " +
                            "VALUES ('"+season.year + '-01-01'+"', '"+season.year + '-12-31'+"', '"+season.year+"', '"+player.id+"', '"+team.id+"')",
                            function(err, rows) {
                                return callback(err);
                        });
                    }

                }, function(err){
                    return callback(err);
                })
            }, function(err){
                return callback(err);
            })
        }, function(err){
            if(!err) console.log('Table team_player filled');
            return callback(err);
        });
    },

    /*
     * fill injuries table
     * injuries.json give only injuries for current year so we just need to take only our team to store correct players injuries
     * @require: injuries.json
     */
    function fillInjuries(callback){
        var data = require('fs').readFileSync(extractedPath + '/injuries.json', 'utf8');
        var injuries = JSON.parse(data);

        var injuriesToDb = [];

        async.eachSeries(injuries.teams, function(team, callback){

            // Check our team
            if( team.id != ourTeamId ) return callback();
            else{
                async.eachSeries(team.players, function(player, callback){
                    async.eachSeries(player.injuries, function(injury, callback){

                        connection.query(
                                "INSERT INTO `bi-m2`.`injury` (`id`, `start_date`, `update_date`, `player_id`, `status`) " +
                                "VALUES ('"+injury.id+"', '"+injury.start_date+"', '"+injury.update_date+"', '"+player.id+"', '"+injury.status+"')",
                            function(err, rows) {
                                return callback(err);
                            }
                        );
                    }, function(err){
                        return callback(err);
                    });
                }, function(err){
                    return callback(err);
                });
            }
        }, function(err){
            if(!err) console.log('Table injury filled');
            return callback(err);
        });
    },

    /*
     * Fill the table game.
     * Only the games where our team is involved are stored.
     * @require: /games/boxscores/*.jons
     */
    function fillGame(callback){

        var files = require('fs').readdirSync(extractedPath + '/games/summaries');
        var games = [];

        // Loop over each files with a sync iterator function
        // in parallel
        async.each( files, function(file, callback){

            if(/(.*).json/.test(file)) {

                data = require('fs').readFileSync(extractedPath + '/games/summaries/' + file, 'utf8');
                var game = JSON.parse(data);

                // Reject games that has not been played or with missing values
                if(game.status == 'unnecessary' || !game.home || !game.away) {
                    console.log('No required values for game ' + game.id + ' summaries, game skipped for insert in table game');
                    return callback();
                }
                else{
                    // Take only games that involve our team
                    if( (game.home && (game.home.id == ourTeamId)) || (game.away && (game.away.id == ourTeamId)) ){
                        games.push( game );
                        connection.query(
                                "INSERT INTO `bi-m2`.`game` (`id`, `team_home_id`, `team_away_id`, `away_points`, `home_points`, `duration`, `date` ) "+
                                "VALUES ('"+game.id+"', '"+game.home.id+"', '"+game.away.id+"', '"+game.away.points+"', '"+game.home.points+"', '"+game.duration+"', '"+game.scheduled+"')",
                            function(err, rows) {
                                return callback(err);
                            }
                        );
                    }
                    else{
                        console.log('Game summary rejected because not about our team');
                        return callback(null);
                    }
                }
            }
            else{
                return callback(null);
            }
        },
        function(err){
            if(!err) console.log('Table game filled');
            return callback(err, games);
        });
    },

    /**
     * Fill statistics about the games statistics
     * Games received are only games about our team.
     * @param games array of game summary (from .json)
     */
    function fillGameStatistic( games, callback ){

        // Loop over each files with a sync iterator function
        // in parallel
        async.each( games, function(game, callback){

                /**
                 * Register
                 * Game statistics and then players statistics
                 */
                async.waterfall([
                    /**
                     * Add game statistics
                     * @param callback
                     */
                    function(callback){

                        // If the are no stat we delete the game entry
                        if( !game.home.statistics || !game.away.statistics ){
                            console.log('No statistics for game ' + game.id + ', game stat not generated and game removed from table game');
                            connection.query( "DELETE FROM `bi-m2`.`game` where game.id = '"+game.id+"'",
                                function(err, rows) {
                                    return callback(err, false);
                                }
                            );
                        }
                        else{
                            var teams = [game.home, game.away];
                            async.eachSeries(teams, function(team, callback){
                                connection.query(
                                        "INSERT INTO `bi-m2`.`game_stat` (`turnovers`, `team_id`, `game_id`, `assists`, `assists_turnover_ratio`, `three_points_made`, `two_points_made`, `rebounds`, `offensive_rebounds`, `defensive_rebounds`, `paint_pts`, `steals`, `blocks` ) " +
                                        "VALUES ('"+team.statistics.turnovers+"', '"+team.id+"', '"+game.id+"', '"+team.statistics.assists+"', "+team.statistics.assists_turnover_ratio+", '"+team.statistics.three_points_made+"', '"+team.statistics.two_points_made+"', '"+team.statistics.rebounds+"', '"+team.statistics.offensive_rebounds+"', '"+team.statistics.defensive_rebounds+"', '"+team.statistics.paint_pts+"', '"+team.statistics.steals+"', '"+team.statistics.blocks+"')",
                                    function(err, rows) {
                                        return callback(err, true);
                                    }
                                );
                            }, function(err){
                                return callback(err, true);
                            });
                        }
                    },

                    /**
                     * Add players statistics
                     * Only for our team
                     * @param callback
                     */
                    function(statValid, callback){

                        if(! statValid){
                            console.log('No statistics for game ' + game.id + ', players stat not generated');
                            return callback();
                        }

                        // Get correct players
                        var players = [];
                        if( game.home.id == ourTeamId ) players = game.home.players;
                        if( game.away.id == ourTeamId ) players = game.away.players;

                        // If the are no stat we delete the game entry
                        async.eachSeries(players, function(player, callback){

                            connection.query(
                                    "INSERT INTO `bi-m2`.`game_player_stat` (`player_id`, `game_id`, `assists`, `assists_turnover_ratio`, `three_points_made`, `two_points_made`, `rebounds`, `offensive_rebounds`, `defensive_rebounds`, `steals`, `blocks`, field_goals_made, free_throws_made, minutes, points, tech_fouls ) " +
                                    "VALUES ('"+player.id+"', '"+game.id+"', '"+player.statistics.assists+"', "+player.statistics.assists_turnover_ratio+", '"+player.statistics.three_points_made+"', '"+player.statistics.two_points_made+"', '"+player.statistics.rebounds+"', '"+player.statistics.offensive_rebounds+"', '"+player.statistics.defensive_rebounds+"', '"+player.statistics.steals+"', '"+player.statistics.blocks+"', '"+player.statistics.field_goals_made+"', '"+player.statistics.free_throws_made+"', '"+player.statistics.minutes+"', '"+player.statistics.points+"', '"+player.statistics.tech_fouls+"')",
                                function(err, rows) {
                                    return callback(err);
                                }
                            );
                        }, function(err){
                            return callback(err);
                        });
                    }
                ], function(err){
                    return callback(err);
                });
        },
        function(err){
            if(!err){
                console.log('Table game stat filled');
                console.log('Table player game stat filled');
            }
            return callback(err);
        });
    },

	/**
	 * Fill transferts table
	 */
    function fillTransfers(callback){

        var files = require('fs').readdirSync(extractedPath + '/transfers');

        async.each( files, function(file, callback){

                if(/(.*).json/.test(file)) {

                    data = require('fs').readFileSync(extractedPath + '/transfers/' + file, 'utf8');
                    var transfer = JSON.parse(data);

                    async.eachSeries(transfer.players, function(player, callback){

                        // Loop over the transferts of this player for this date
                        async.eachSeries(player.transfers, function(playerTransfer, callback){

                            if(playerTransfer.to_team){
//                                if( ! playerTransfer.to_team ) console.log(playerTransfer);
                                connection.query(
                                        "INSERT INTO `bi-m2`.`transfer` (`id`, `start_date`, `end_date`, `player_id`, `effective_date`, `to_team_id` ) "+
                                        "VALUES ('"+playerTransfer.id+"', '"+transfer.start_time+"', '"+transfer.end_time+"', '"+player.id+"', '"+playerTransfer.effective_date+"', '"+playerTransfer.to_team.id+"')",
                                    function(err, rows) {
                                        return callback(err);
                                    }
                                );
                            }
                            else if( playerTransfer.from_team) {
                                connection.query(
                                        "INSERT INTO `bi-m2`.`transfer` (`id`, `start_date`, `end_date`, `player_id`, `effective_date`, `from_team_id` ) "+
                                        "VALUES ('"+playerTransfer.id+"', '"+transfer.start_time+"', '"+transfer.end_time+"', '"+player.id+"', '"+playerTransfer.effective_date+"', '"+playerTransfer.from_team.id+"')",
                                    function(err, rows) {
                                        return callback(err);
                                    }
                                );
                            }
                            else{
                                console.log('No teams from/to for the transfert ' + playerTransfer.effective_date + ' for the player ' + player.full_name)
                                return callback();
                            }


                        }, function(err){
                            return callback(err);
                        });

                    }, function(err){
                        return callback(err);
                    });

                }
                else{
                    return callback(null);
                }
            },
            function(err){
                if(!err) console.log('Table transfers filled');
                return callback(err);
            });
    }
],
function(err, results) {
    if(err){
        console.error('Error in main program: ' + err.stack);
    }
    // results is now equal to: {one: 1, two: 2}

    connection.end();
    console.log('End of program');
});




