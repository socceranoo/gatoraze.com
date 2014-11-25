module.exports = function () {
	var unirest = require('unirest');
	var python = require('node-python');
	var py_nfldb = python.import('nfldb');
	var pyjson = python.import('json');
	var nflgame = python.import('nflgame');
	var db = py_nfldb.connect();

	var util = require('util');
	var fs = require('fs');
	var exec = require('child_process').exec;
	var http = require('http');
	var teamHash = {};

	var executeProcess = function(cmd, callback) {
		exec(cmd, {maxBuffer: 2*1024*1024}, function (error, stdout, stderr) {
			callback(stdout);
		});
	};

	var image_base = {
		helmet_left:["http://i.nflcdn.com/static/site/6.5/img/logos/helmet-left-weather-mascot-311x292/day/sunny/", "long_lc", ".png"],
		helmet_right:["http://i.nflcdn.com/static/site/6.5/img/logos/helmet-right-weather-mascot-311x292/night/sunny/", "long_lc", ".png"],
		subheader:["http://i.nflcdn.com/static/site/6.5/img/subheaders/", "short_lc", ".png"],
		logo:["http://i.nflcdn.com/static/site/6.5/img/logos/svg/teams-matte-mascot/", "long_lc", ".svg"],
		glossy_logo:["http://i.nflcdn.com/static/site/6.5/img/logos/120x80/", "short", ".png"]
	};

	//executeProcess("pwd", function (data) {
		//console.log(data);
	//});
	var add_player_details_to_result = function(resultArr) {
		var item = null;
		for (var i in resultArr) {
			item = resultArr[i];
			item.index = parseInt(i, 10);
			if (teamHash[item.team] === undefined) {
				teamHash[item.team] = require("./data/"+item.team+"-mapping.json");
			}
			item.player = teamHash[item.team][item.player_id];
		}
	};

	var temp = [
		{ short: 'BAL',  short_lc: 'bal',  long: 'Ravens',  long_lc: 'ravens' },
		{ short: 'CIN',  short_lc: 'cin',  long: 'Bengals',  long_lc: 'bengals' },
		{ short: 'CLE',  short_lc: 'cle',  long: 'Browns',  long_lc: 'browns' },
		{ short: 'PIT',  short_lc: 'pit',  long: 'Steelers',  long_lc: 'steelers' },

		{ short: 'HOU',  short_lc: 'hou',  long: 'Texans',  long_lc: 'texans' },
		{ short: 'IND', short_lc: 'ind', long: 'Colts', long_lc: 'colts' },
		{ short: 'JAC',  short_lc: 'jac',  long: 'Jaguars',  long_lc: 'jaguars' },
		{ short: 'TEN',  short_lc: 'ten',  long: 'Titans',  long_lc: 'titans' },

		{ short: 'BUF', short_lc: 'buf', long: 'Bills', long_lc: 'bills' },
		{ short: 'MIA',  short_lc: 'mia',  long: 'Dolphins',  long_lc: 'dolphins' },
		{ short: 'NE',  short_lc: 'ne',  long: 'Patriots',  long_lc: 'patriots' },
		{ short: 'NYJ', short_lc: 'nyj', long: 'Jets', long_lc: 'jets' },

		{ short: 'DEN',  short_lc: 'den',  long: 'Broncos',  long_lc: 'broncos' },
		{ short: 'KC', short_lc: 'kc', long: 'Chiefs', long_lc: 'chiefs' },
		{ short: 'OAK',  short_lc: 'oak',  long: 'Raiders',  long_lc: 'raiders' },
		{ short: 'SD',  short_lc: 'sd',  long: 'Chargers',  long_lc: 'chargers' },


		{ short: 'CHI', short_lc: 'chi', long: 'Bears', long_lc: 'bears' },
		{ short: 'DET', short_lc: 'det', long: 'Lions', long_lc: 'lions' },
		{ short: 'GB',  short_lc: 'gb',  long: 'Packers',  long_lc: 'packers' },
		{ short: 'MIN',  short_lc: 'min',  long: 'Vikings',  long_lc: 'vikings' },

		{ short: 'ATL',  short_lc: 'atl',  long: 'Falcons',  long_lc: 'falcons' },
		{ short: 'CAR',  short_lc: 'car',  long: 'Panthers',  long_lc: 'panthers' },
		{ short: 'NO', short_lc: 'no', long: 'Saints', long_lc: 'saints' },
		{ short: 'TB',  short_lc: 'tb',  long: 'Buccaneers',  long_lc: 'buccaneers' },

		{ short: 'DAL',  short_lc: 'dal',  long: 'Cowboys',  long_lc: 'cowboys' },
		{ short: 'NYG',  short_lc: 'nyg',  long: 'Giants',  long_lc: 'giants' },
		{ short: 'PHI',  short_lc: 'phi',  long: 'Eagles',  long_lc: 'eagles' },
		{ short: 'WAS',  short_lc: 'was',  long: 'Redskins',  long_lc: 'redskins' },

		{ short: 'ARI',  short_lc: 'ari',  long: 'Cardinals',  long_lc: 'cardinals' },
		{ short: 'SEA',  short_lc: 'sea',  long: 'Seahawks',  long_lc: 'seahawks' },
		{ short: 'SF', short_lc: 'sf', long: '49ers', long_lc: '49ers' },
		{ short: 'STL', short_lc: 'stl', long: 'Rams', long_lc: 'rams' }
	];
	/*
	   unirest.get('http://worldcup.sfg.io/teams/').send().end(function (response) {
	   var teams = response.body;
	   for (var x in teams) {
	   teams[x].country_code = fifaToISO[teams[x].fifa_code];
	   groups[groupIdtoLetter[teams[x].group_id]].push(teams[x]);
	   }
	   exportVariable.groups = groups;
	//console.log(groups);
	});
	*/
	var getLeaders = function (limit, team, callback) {
		executeProcess("/Users/manjunath_mageswaran/Public/node-login/app/server/sports/db-utils.py "+limit+" "+team, function (data) {
			var final_data = JSON.parse(data);
			add_player_details_to_result(final_data.passing);
			add_player_details_to_result(final_data.rushing);
			add_player_details_to_result(final_data.receiving);
			add_player_details_to_result(final_data.defense_sk);
			add_player_details_to_result(final_data.defense_int);
			add_player_details_to_result(final_data.defense_tkl);
			console.log("loaded");
			callback(final_data);
		});
	};
	var teamStats = function (team, callback) {
		executeProcess("/Users/manjunath_mageswaran/Public/node-login/app/server/sports/team-stats.py ", function (data) {
			var final_data = JSON.parse(data);
			final_data.sort(function (b, a) {
				return a.score - b.score;
			});
			add_player_details_to_result(final_data);
			console.log("team loaded");
			callback(final_data);
		});
	};
	var getRoster = function(team) {
		return require("./data/"+team+".json");
	};
	var ret_data = {lead_players:null, lead_teams:null};
	var getData = function(callback) {
		if (ret_data.lead_players !== null && ret_data.lead_teams !== null) {
			callback(ret_data);
			return;
		}
		var ret_func = function () {
			if (ret_data.lead_players !== null && ret_data.lead_teams !== null) {
				callback(ret_data);
			}
		};
		getLeaders(30, " ", function(leaders) {
			ret_data.lead_players = leaders;
			ret_func();
		});
		teamStats(" ", function(team_stats) {
			ret_data.lead_teams = team_stats;
			ret_func();
		});
	};

	var exportVariable = {
		categories:null,
		teams:temp,
		getLeaders:getLeaders,
		images:image_base,
		getRoster:getRoster,
		getData:getData
	};
	executeProcess("/Users/manjunath_mageswaran/Public/node-login/app/server/sports/categories.py ", function (data) {
		exportVariable.categories = data;
	});
	return exportVariable;
};
