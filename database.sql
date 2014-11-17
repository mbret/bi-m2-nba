-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 17, 2014 at 01:16 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `bi-m2`
--

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
  `team_away_id` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  `experience` varchar(200) NOT NULL
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
  `season` varchar(200) NOT NULL
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=830 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
