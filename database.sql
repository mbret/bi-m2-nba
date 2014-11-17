-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 17, 2014 at 07:43 PM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `bi-m2`
--
CREATE DATABASE IF NOT EXISTS `bi-m2` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `bi-m2`;

-- --------------------------------------------------------

--
-- Table structure for table `coatch`
--

CREATE TABLE IF NOT EXISTS `coatch` (
  `id` varchar(200) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `position` varchar(200) NOT NULL,
  `experience` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `game`
--

CREATE TABLE IF NOT EXISTS `game` (
  `id` varchar(200) NOT NULL,
  `team_home_id` varchar(200) NOT NULL,
  `away_points` int(11) NOT NULL,
  `home_points` int(11) NOT NULL,
  `duration` varchar(200) NOT NULL,
  `team_away_id` varchar(200) NOT NULL,
  `date` date NOT NULL,
  KEY `team_home_id` (`team_home_id`,`team_away_id`),
  KEY `team_away_id` (`team_away_id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `game_player_stat`
--

CREATE TABLE IF NOT EXISTS `game_player_stat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `three_points_made` int(11) NOT NULL,
  `two_points_made` int(11) NOT NULL,
  `assists` int(11) NOT NULL,
  `assists_turnover_ratio` int(11) NOT NULL,
  `blocks` int(11) NOT NULL,
  `defensive_rebounds` double NOT NULL,
  `offensive_rebounds` double NOT NULL,
  `field_goals_made` double NOT NULL,
  `free_throws_made` double NOT NULL,
  `minutes` double NOT NULL,
  `points` double NOT NULL,
  `rebounds` double NOT NULL,
  `steals` double NOT NULL,
  `tech_fouls` double NOT NULL,
  `player_id` varchar(200) NOT NULL,
  `game_id` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `game_id` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `game_stat`
--

CREATE TABLE IF NOT EXISTS `game_stat` (
  `id` double NOT NULL AUTO_INCREMENT,
  `turnovers` double DEFAULT NULL,
  `assists` double DEFAULT NULL,
  `assists_turnover_ratio` double DEFAULT NULL,
  `three_points_made` double DEFAULT NULL,
  `two_points_made` double DEFAULT NULL,
  `rebounds` double DEFAULT NULL,
  `offensive_rebounds` double DEFAULT NULL,
  `defensive_rebounds` double DEFAULT NULL,
  `paint_pts` double DEFAULT NULL,
  `steals` double DEFAULT NULL,
  `blocks` double DEFAULT NULL,
  `team_id` varchar(200) DEFAULT NULL,
  `game_id` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `injury`
--

CREATE TABLE IF NOT EXISTS `injury` (
  `id` varchar(200) NOT NULL,
  `start_date` varchar(200) NOT NULL,
  `update_date` varchar(200) NOT NULL,
  `player_id` varchar(200) NOT NULL,
  `status` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `player`
--

CREATE TABLE IF NOT EXISTS `player` (
  `id` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `birthdate` date NOT NULL,
  `height` int(11) NOT NULL,
  `position` varchar(200) NOT NULL,
  `primary_position` varchar(200) NOT NULL,
  `status` varchar(200) NOT NULL,
  `experience` varchar(200) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE IF NOT EXISTS `team` (
  `id` varchar(200) NOT NULL,
  `conference` varchar(200) NOT NULL,
  `division` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `season` varchar(200) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `team_coatch`
--

CREATE TABLE IF NOT EXISTS `team_coatch` (
  `id` double NOT NULL AUTO_INCREMENT,
  `coatch_id` varchar(200) NOT NULL,
  `team_id` varchar(200) NOT NULL,
  `season` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `team_player`
--

CREATE TABLE IF NOT EXISTS `team_player` (
  `id` double NOT NULL AUTO_INCREMENT,
  `date_start` date NOT NULL,
  `date_end` date NOT NULL,
  `season` int(11) NOT NULL,
  `player_id` varchar(200) NOT NULL,
  `team_id` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`,`team_id`),
  KEY `team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game`
--
ALTER TABLE `game`
ADD CONSTRAINT `game_ibfk_2` FOREIGN KEY (`team_away_id`) REFERENCES `team` (`id`),
ADD CONSTRAINT `game_ibfk_1` FOREIGN KEY (`team_home_id`) REFERENCES `team` (`id`);

--
-- Constraints for table `game_player_stat`
--
ALTER TABLE `game_player_stat`
ADD CONSTRAINT `game_player_stat_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`),
ADD CONSTRAINT `game_player_stat_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`);

--
-- Constraints for table `team_player`
--
ALTER TABLE `team_player`
ADD CONSTRAINT `team_player_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
ADD CONSTRAINT `team_player_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
