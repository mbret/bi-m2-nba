var database = 'bi-m2';
var tables = ['injury', 'team_player', 'team_coatch', 'coatch', 'game_stat', 'game_player_stat', 'game', 'player', 'team', 'transfer' ];
var extractedPath = 'extractedv2';
var mysql      = require('mysql');
var async      = require('async');
var _          = require('lodash');
var fastCsv = require("fast-csv");
var moment = require('moment');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'mysql',
    multipleStatement: true
});

/**
 * Here is the 'who has the biggest' board.
 * Feel free to add your own score :)
 *
 * Maxime: 147913ms (2,47mn)
 *
 */


console.time('[Information] Script executed in');

function getAffluenceByGameID( affluences, gameID ){
    for( var i = 0; i < affluences.length ; i++){
        var affluence = affluences[i];
//        console.log(gameID, affluence);
        if( affluence.idGame === gameID){
            return parseInt(affluence.affluence);
        }
    }
    return null;
}

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

        function removeDB(callback){
            connection.query( "DROP DATABASE IF EXISTS " + "`"+database+"`", function(err, results) {
                if (err) return callback(err);
                console.log('Database deleted');
                return callback();
            });
        },



        /*
         * Multiple statement is experimental with this mysql module and seems not to work yet so
         * each queries has been set here
         */
        function createDB(callback){

            var queries = [];
            queries.push("CREATE DATABASE IF NOT EXISTS " + "`"+database+"`" + " DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci");
            queries.push("USE " + "`"+database+"`;");
            queries.push("CREATE TABLE IF NOT EXISTS `coatch` ("+
                          "`id` varchar(200) NOT NULL,"+
                          "`full_name` varchar(200) NOT NULL,"+
                          "`position` varchar(200) NOT NULL,"+
                          "`experience` varchar(200) NOT NULL"+
                          "          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
            queries.push("CREATE TABLE IF NOT EXISTS `game` ("+
                          "`id` varchar(200) NOT NULL,"+
                          "`team_home_id` varchar(200) DEFAULT NULL,"+
                          "`away_points` int(11) NOT NULL,"+
                          "`home_points` int(11) NOT NULL,"+
                            "`affluence` int(11) NOT NULL,"+
                          "`duration` varchar(200) NOT NULL,"+
                          "`team_away_id` varchar(200) DEFAULT NULL,"+
                          "`date` date NOT NULL,"+
                          "KEY `team_home_id` (`team_home_id`,`team_away_id`),"+
                        "KEY `team_away_id` (`team_away_id`),"+
                        "KEY `id` (`id`)"+
                        ") ENGINE=InnoDB DEFAULT CHARSET=latin1;");
            queries.push("CREATE TABLE IF NOT EXISTS `game_player_stat` ("+
                  "`id` int(11) NOT NULL AUTO_INCREMENT,"+
                  "`three_points_made` int(11) NOT NULL,"+
                  "`two_points_made` int(11) NOT NULL,"+
                  "`assists` int(11) NOT NULL,"+
                  "`assists_turnover_ratio` int(11) NOT NULL,"+
                  "`blocks` int(11) NOT NULL,"+
                  "`defensive_rebounds` double NOT NULL,"+
                  "`offensive_rebounds` double NOT NULL,"+
                  "`field_goals_made` double NOT NULL,"+
                  "`free_throws_made` double NOT NULL,"+
                  "`minutes` double NOT NULL,"+
                  "`points` double NOT NULL,"+
                  "`rebounds` double NOT NULL,"+
                  "`steals` double NOT NULL,"+
                  "`tech_fouls` double NOT NULL,"+
                  "`player_id` varchar(200) DEFAULT NULL,"+
                  "`game_id` varchar(200) DEFAULT NULL,"+
                    "PRIMARY KEY (`id`),"+
                "KEY `player_id` (`player_id`),"+
                "KEY `game_id` (`game_id`),"+
                "KEY `game_id_2` (`game_id`),"+
                "KEY `player_id_2` (`player_id`),"+
                "KEY `game_id_3` (`game_id`)"+
                ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1603 ;");
            queries.push("CREATE TABLE IF NOT EXISTS `game_stat` ("+
                  "`id` double NOT NULL AUTO_INCREMENT,"+
                  "`turnovers` double DEFAULT NULL,"+
                  "`assists` double DEFAULT NULL,"+
                  "`assists_turnover_ratio` double DEFAULT NULL,"+
                  "`three_points_made` double DEFAULT NULL,"+
                  "`two_points_made` double DEFAULT NULL,"+
                  "`rebounds` double DEFAULT NULL,"+
                  "`offensive_rebounds` double DEFAULT NULL,"+
                  "`defensive_rebounds` double DEFAULT NULL,"+
                  "`paint_pts` double DEFAULT NULL,"+
                  "`steals` double DEFAULT NULL,"+
                  "`blocks` double DEFAULT NULL,"+
                  "`team_id` varchar(200) DEFAULT NULL,"+
                  "`game_id` varchar(200) DEFAULT NULL,"+
                    "PRIMARY KEY (`id`),"+
                "KEY `team_id` (`team_id`),"+
                "KEY `game_id` (`game_id`)"+
                ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=211 ;");
            queries.push("CREATE TABLE IF NOT EXISTS `injury` ("+
                  "`id` varchar(200) NOT NULL,"+
                  "`start_date` varchar(200) NOT NULL,"+
                  "`update_date` varchar(200) NOT NULL,"+
                  "`player_id` varchar(200) NOT NULL,"+
                  "`status` varchar(200) NOT NULL"+
                    ") ENGINE=InnoDB DEFAULT CHARSET=latin1;");
            queries.push("CREATE TABLE IF NOT EXISTS `player` ("+
                  "`id` varchar(200) NOT NULL,"+
                  "`name` varchar(200) NOT NULL,"+
                  "`birthdate` date NOT NULL,"+
                  "`height` varchar(200) NOT NULL,"+
                    "`weight` int(11) NOT NULL,"+
                  "`position` varchar(200) NOT NULL,"+
                  "`primary_position` varchar(200) NOT NULL,"+
                    "`status` varchar(200) NOT NULL,"+
                  "`experience` varchar(200) NOT NULL,"+
                    "KEY `id` (`id`)"+
                ") ENGINE=InnoDB DEFAULT CHARSET=latin1;");
            queries.push("CREATE TABLE IF NOT EXISTS `team` ("+
                  "`id` varchar(200) NOT NULL,"+
                  "`conference` varchar(200) NOT NULL,"+
                  "`division` varchar(200) NOT NULL,"+
                  "`name` varchar(200) NOT NULL,"+
                  "`season` varchar(200) NOT NULL,"+
                    "KEY `id` (`id`)"+
                ") ENGINE=InnoDB DEFAULT CHARSET=latin1;");
            queries.push("CREATE TABLE IF NOT EXISTS `team_coatch` ("+
                  "`id` double NOT NULL AUTO_INCREMENT,"+
                  "`coatch_id` varchar(200) NOT NULL,"+
                  "`team_id` varchar(200) NOT NULL,"+
                  "`season` int(11) NOT NULL,"+
                  "`start_date` date NOT NULL,"+
                  "`end_date` date NOT NULL,"+
                    "PRIMARY KEY (`id`)"+
                ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;");
            queries.push("CREATE TABLE IF NOT EXISTS `team_player` ("+
                  "`id` double NOT NULL AUTO_INCREMENT,"+
                  "`date_start` date NOT NULL,"+
                  "`date_end` date NOT NULL,"+
                  "`season` int(11) NOT NULL,"+
                  "`player_id` varchar(200) DEFAULT NULL,"+
                  "`team_id` varchar(200) DEFAULT NULL,"+
                    "PRIMARY KEY (`id`),"+
                "KEY `player_id` (`player_id`,`team_id`),"+
                "KEY `team_id` (`team_id`)"+
                ") ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;");
            queries.push("CREATE TABLE IF NOT EXISTS `transfer` ("+
                "`id` varchar(200) NOT NULL,"+
                "`start_date` date NOT NULL,"+
                "`end_date` date NOT NULL,"+
                "`effective_date` date NOT NULL,"+
                "`from_team_id` varchar(200) NOT NULL,"+
                "`to_team_id` varchar(200) DEFAULT NULL,"+
                "`player_id` varchar(200) NOT NULL"+
                ") ENGINE=InnoDB DEFAULT CHARSET=latin1;");


            async.eachSeries( queries,
                // Iterator
                function(query, cb){
                    connection.query( query, function(err, result) {
                        return cb(err);
                    });
                },
                // CB
                function(err){

                    if (err) return callback(err);

                    console.log('Database created');
                    for(var i = 0 ; i < tables.length ; i++){
                        console.log('Table ' + tables[i] +' created');
                    }
                    return callback();
                }
            );

        },

        function fillTableTeam(callback){
            async.parallel([
/*
                    function fillTableCoaches(callback){

                        var entries = [];
                        var clevelandID = 'Cleveland Cavaliers';

                        fastCsv.fromPath( extractedPath + "/coaches-cleveland.csv", {headers: ["name","Div","Conf"]})
                            .on("data", function(data){
                                if(data.Coach == 'Coach') return; // header
                                data.Experience = moment().diff(moment([data.From]), 'years');
                                entries.push(data);
                            })
                            .on("end", function(){
                                console.log("All coaches loaded from csv");
                                console.log("Coaches are inserting...");

                                // Add table coach
                                async.eachSeries( entries, function( entry, callback){

                                    connection.query(
                                        "INSERT INTO `bi-m2`.`coatch` (`id`, `full_name`, `position`, `experience` ) " +
                                        "VALUES ("+mysql.escape(entry.Coach)+", "+mysql.escape(entry.Coach)+", '"+null+"', '"+null+"')", function(err, rows) {
                                            return callback(err);
                                        });

                                }, function(err){
                                    if(!err) console.log('Table coache filled');

                                    // Add table team_coach
                                    async.eachSeries( entries, function( entry, callback){

                                        connection.query(
                                            "INSERT INTO `bi-m2`.`team_coatch` (`coatch_id`, `team_id`, `start_date`, `end_date`, `season` ) " +
                                            "VALUES ("+mysql.escape(entry.Coach)+", "+mysql.escape(clevelandID)+", '"+moment( new Date(entry.From)).format('YYYY-MM-DD')+"', '"+moment( new Date(entry.To)).format('YYYY-MM-DD')+"', '"+null+"')", function(err, rows) {
                                                return callback(err);
                                            });

                                    }, function(err){
                                        if(!err) console.log('Table team_coach filled');

                                        // Add table team_coach

                                        return callback(err);
                                    });

                                });
                            });
                    },
*/
                    function fillTableTeam(callback){

                        var entries = [];

                        fastCsv.fromPath( extractedPath + "/teams.csv", {headers: ["name","Div","Conf"]})
                            .on("data", function(data){
                                if(data.name == 'name') return; // header
                                entries.push(data);
                            })
                            .on("end", function(){
                                console.log("All teams loaded from csv");
                                console.log("Teams are inserting...");
                                async.eachSeries( entries, function( entry, callback){

                                    connection.query(
                                            "INSERT INTO `bi-m2`.`team` (`id`, `conference`, `division`, `name`) " +
                                            "VALUES ("+mysql.escape(entry.name)+", "+mysql.escape(entry.Conf)+", "+mysql.escape(entry.Div)+", "+mysql.escape(entry.name)+")",
                                        function(err, rows) {
                                            return callback(err);
                                        });

                                }, function(err){
                                    if(!err) console.log('Table team filled');
                                    return callback(err);
                                });
                            });
                    },

                    function fillTablePlayer(callback){

                        var players = [];

                        fastCsv.fromPath( extractedPath + "/players.csv", {headers: ["Player","From","To","Pos","Ht","Wt","Birth","Date","College"]})
                            .on("data", function(data){
                                if(data.Player == 'Player') return; // header
                                data.Experience = moment().diff(moment([data.From]), 'years');
                                players.push(data);
                            })
                            .on("end", function(){
                                console.log("All players loaded from csv");
                                console.log("Players inserting...");
                                async.eachSeries( players, function( player, callback){

                                    connection.query(
                                            "INSERT INTO `bi-m2`.`player` (`id`, `name`, `birthdate`, `height`, `weight`, `position`, `primary_position`, `status`, `experience` ) " +
                                            "VALUES (" +
                                            " "+mysql.escape(player.Player)+"," +
                                            " "+mysql.escape(player.Player)+"," +
                                            " '"+ moment( new Date(player.Birth)).format('YYYY-MM-DD')+"'," +
                                            " '"+player.Ht+"', " +
                                            " '"+player.Wt+"'," +
                                            " '"+player.Pos+"'," +
                                            " '"+player.Pos+"', " +
                                            " ''," +
                                            " '"+ player.Experience +"'" +
                                            ");",
                                        function(err, rows) {
                                            return callback(err, players);
                                        });

                                }, function(err){
                                    if(!err) console.log('Table player filled');
                                    return callback(err);
                                });
                            });
                    },

                    function fillTableGameStat(callback){

                        var gameStats = [];

                        fastCsv.fromPath( extractedPath + "/gamestatsproper.csv", {headers: ["twoperc","threeperc","assists","turno","blocks","orebounds","drebounds","ftPerc","points","steals","minutes","nameteam","gameid"]})
                            .on("data", function(data){
                                if(data.twoperc == 'twoperc') return; // header
                                gameStats.push(data);
                            })
                            .on("end", function(){
                                console.log("All game statistics loaded from csv");
                                console.log("Game statistics inserting...");
                                async.eachSeries( gameStats, function( stat, callback){

//                                    console.log(stat);
                                    connection.query(
                                            "INSERT INTO `bi-m2`.`game_stat` (`turnovers`, `team_id`, `game_id`, `assists`, `assists_turnover_ratio`, `three_points_made`, `two_points_made`, `rebounds`, `offensive_rebounds`, `defensive_rebounds`, `paint_pts`, `steals`, `blocks` ) " +
                                            "VALUES ('"+stat.turno+"', '"+stat.nameteam+"', '"+stat.gameid+"', '"+stat.assists+"', "+0+", '"+stat.threeperc+"', '"+stat.twoperc+"', '"+""+"', '"+stat.orebounds+"', '"+stat.drebounds+"', '"+stat.points+"', '"+stat.steals+"', '"+stat.blocks+"')",
                                        function(err, rows) {
                                            return callback(err, true);
                                        }
                                    );

                                }, function(err){
                                    if(!err) console.log('Table game statistic filled');
                                    return callback(err);
                                });
                            });



                    },

                    function fillTablePlayerStats(callback){

                        var entries = [];
                        fastCsv.fromPath( extractedPath + "/playerstats.csv", {headers: ["idGame","assists","blocks","drebounds","threeperc","twoperc","ftPerc","minutes","orebounds","nom","points","steals","turno"]})
                        .on("data", function(data){
                            if(data.idGame == 'idGame') return; // header
                                entries.push(data);
                        })
                        .on("end", function(){
                            console.log("All player statistics loaded from csv");
                            console.log("Player statistics inserting...");
                            async.eachSeries( entries, function( entry, callback){

                                connection.query(
                                        "INSERT INTO `bi-m2`.`game_player_stat` (`player_id`, `game_id`, `assists`, `assists_turnover_ratio`, `three_points_made`, `two_points_made`, `rebounds`, `offensive_rebounds`, `defensive_rebounds`, `steals`, `blocks`, field_goals_made, free_throws_made, minutes, points, tech_fouls ) " +
                                        "VALUES ("+mysql.escape(entry.nom)+", '"+entry.idGame+"', '"+entry.assists+"', '', '"+entry.threeperc+"', '"+entry.twoperc+"', '', '"+entry.orebounds+"', '"+entry.drebounds+"', '"+entry.steals+"', '"+entry.blocks+"', '', '"+entry.ftPerc+"', '"+entry.minutes+"', '"+entry.points+"', '')",
                                    function(err, rows) {
                                        return callback(err, true);
                                    }
                                );

                            }, function(err){
                                if(!err) console.log('Table player game statistic filled');
                                return callback(err);
                            });
                        });
                    },

                    function fillTableGame(callback){

                        // Load games
                        var entries = [];
                        fastCsv.fromPath( extractedPath + "/games.csv", {headers: ["id","date","hometeam","homescore","awayTeam","awayscore"]})
                            .on("data", function(data){
                                if(data.id == 'id') return; // header
                                entries.push(data);
                            })
                            .on("end", function(){
                                console.log("All games loaded from csv");

                                // Load affluence
                                var affluences = [];
                                fastCsv.fromPath( extractedPath + "/affluence.csv", {headers: ["idGame","affluence"]})
                                    .on("data", function(data){
                                        if(data.idGame == 'idGame') return; // header
                                        affluences.push(data);
                                    })
                                    .on("end", function(){


                                        console.log("Games inserting...");
                                        async.eachSeries( entries, function( entry, callback){

                                            connection.query(
                                                    "INSERT INTO `bi-m2`.`game` (`id`, `team_home_id`, `team_away_id`, `away_points`, `home_points`, `duration`, `date`, `affluence` ) "+
                                                    "VALUES ('"+entry.id+"', "+mysql.escape(entry.hometeam)+", "+mysql.escape(entry.awayTeam)+", '"+entry.awayscore+"', '"+entry.homescore+"', '', '"+moment( new Date(entry.date)).format('YYYY-MM-DD')+"', '"+getAffluenceByGameID(affluences, entry.id)+"')",
                                                function(err, rows) {
                                                    return callback(err, true);
                                                }
                                            );

                                        }, function(err){
                                            if(!err) console.log('Table game filled');
                                            return callback(err);
                                        });
                                    });
                            });
                    }


                ],
                function(err){
                    return callback(err);
                });
        },


    ],
    function(err, results) {
        console.timeEnd('[Information] Script executed in');
        if(err){
            console.error('Error in main program: ' + err.stack);
        }
        // results is now equal to: {one: 1, two: 2}

        connection.end();
        console.log('End of program');
    });