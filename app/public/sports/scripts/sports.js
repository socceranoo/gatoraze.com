function Groups($scope) {
	$scope.groups = groupData;
	$scope.currentGroup = "A";
}
$(document).ready(function() {
	//Page.init();
});

var bgArray = [
	/*
	"background-transparent",
	"background-transparent",
	"background-transparent",
   */
	"background-transparent",
	"background-peterRiver",
	"background-pumpkin",
	"background-metroCyan",
	"background-metroJade",
	"background-metroYellow",
	"background-metroOrange",
	"background-metroPurple",
	"background-turquoise"
];
var myApp = angular.module("Sports", []);

myApp.controller("MainCtrl" , function ($scope) {
	$container = $(".main");
	var total = $('#pt-main').children('.pt-page').length;
	var modal = $('#player-modal');
	$scope.limit = 10;
	$scope.stat_categories = JSON.parse(categories);
	$scope.teams = teamData;
	$scope.images = images;
	$scope.teamHash = {};
	$scope.leaders = {};
	$scope.team_stats = [];
	$scope.team_stats_hash = {};
	$scope.init_complete = false;
	for ( var j in teamData) {
		$scope.teamHash[teamData[j].short] = teamData[j];
	}

	$.post("/nfl-init", {}, function(data){
		$scope.team_stats = data.lead_teams;
		$scope.leaders = data.lead_players;
		$scope.currentLeader = $scope.leaders[$scope.category][0];
		$scope.currentTeamLeader = $scope.team_stats[0];
		for ( var j in $scope.team_stats) {
			$scope.team_stats_hash[$scope.team_stats[j].team] = $scope.team_stats[j];
		}
		$scope.init_complete = true;
		$scope.$apply();
	}, "json");

	$scope.currentCategory = "score";
	$scope.select_val = "score";
	$scope.setCurrentCategory = function (item) {
		$scope.currentCategory = item;
		$container.removeClass("slideDown");
		$scope.sortTeams($scope.stat_categories[item][0]);
	};
	$scope.currentTeam = teamData[0];
	$scope.currentTeamAbbr = $scope.currentTeam.short;
	$scope.currentPlayer = null;
	$scope.conf = ["AFC", "NFC"];
	$scope.div = ["North", "South", "East", "West"];
	$scope.teams_per_div = ["1", "2", "3", "4"];

	$scope.getImage = function (type, team) {
		var obj = $scope.images[type];
		return obj[0] + team[obj[1]] + obj[2];
	};

	$scope.categories = {
		passing:{
			passing_yds : ["Pass Yards", "yds"],
			passing_tds : ["Pass TDs", "TDs"],
			passing_att : ["Pass Att", ""],
			passing_cmp : ["Pass Cmpl", ""],
			passing_rating : ["QB Rat", ""],
			rushing_yds : ["Rush Yds", "yds"],
			rushing_tds : ["Rush TDs", "TDs"]
		},
		rushing:{
			rushing_yds : ["Rush Yds", "yds"],
			rushing_tds : ["Rush TDs", "TDs"],
			offense_tds : ["Total TDs", "TDs"],
			offense_yds : ["Total Yds", "yds"],
			rushing_ypc : ["Yards/carry", "yds"]
		},
		receiving:{
			receiving_yds : ["Receiving Yds", "yds"],
			receiving_tds : ["Receiving TDs", "TDs"],
			receiving_yac_yds : ["Yards after catch", "yds"],
			receiving_rec : ["Total Catches", "catches"],
			receiving_ypc : ["Yards/catch", "yds"]
		},
		defense_int:{
			defense_int : ["Interceptions", "int"],
		},
		defense_tkl:{
			defense_tkl : ["Tackles", "tackles"],
		},
		defense_sk:{
			defense_sk : ["Sacks", "sacks"],
		},
	};
	$scope.nextTeam = function () {
		var i = 0;
		var obj = $scope.team_stats;
		var length = obj.length;
		var limit = Math.min(obj.length, $scope.limit);
		for (i=0; i<length; i++) {
			if (obj[i].index < $scope.limit) {
				obj[i].index =  (limit + obj[i].index  - 1)%limit;
			}
			if (obj[i].index === 0) {
				$scope.currentTeamLeader = obj[i];
			}
		}
	};
	$scope.sortTeams = function (cat) {
		$scope.select_val = cat;
		var myArray = $scope.team_stats;
		myArray.sort(function(b, a) {
			return a[cat] - b[cat];
		});
		$scope.resetTeams(cat);
		myArray.sort(function(b, a) {
			return a.score - b.score;
		});
	};
	$scope.resetTeams = function (key) {
		var i = 0;
		var obj = $scope.team_stats;
		$scope.currentTeamLeader = obj[0];
		var length = obj.length;
		for (i=0; i<length; i++) {
			obj[i].index =  i;
		}
	};
	$scope.Math = window.Math;
	$scope.currentRoster = [];
	$scope.ptObj = PageTransitions(bgArray);
	$scope.current = 0;
	$scope.nextPt = function (input) {
		var page = ($scope.current+1)%total;
		if (input != -1) {
			page = input;
		}
		$scope.current = $scope.ptObj.click(page, false, null, null);
		$container.removeClass("slideRight");
		$container.removeClass("slideLeft");
		$container.removeClass("slideUp");
		$container.removeClass("slideDown");
	};

	$scope.sortLeaders = function (cat, subcat) {
		var myArray = $scope.leaders[cat];
		if (myArray === undefined)
			return;
		myArray.sort(function(b, a) {
			return a[subcat] - b[subcat];
		});
		$scope.resetLeaders(cat);
		myArray.sort(function(b, a) {
			return a[cat+"_yds"] - b[cat+"_yds"];
		});
	};
	$scope.subcategoryClick = function (category, item) {
		$scope.subcategory = item;
		$scope.sortLeaders(category, item);
	};
	$scope.categoryClick = function (item) {
		$scope.category = item;
		$scope.subcategory = Object.keys($scope.categories[$scope.category])[0];
		$scope.sortLeaders($scope.category, $scope.subcategory);
	};

	$scope.moveRight = function (callback) {
		$container.toggleClass("slideRight");
	};
	$scope.moveLeft = function (callback) {
		$container.toggleClass("slideLeft");
	};
	$scope.moveDown = function (callback) {
		$container.toggleClass("slideDown");
	};
	$scope.moveUp = function (callback) {
		$container.toggleClass("slideUp");
	};

	$scope.showPlayer = function (player) {
		$scope.currentPlayer = player;
		modal.modal('show');
	};

	$scope.categoryClick("passing");
	$scope.currentLeader = null;
	$scope.currentTeamLeader = null;
	$scope.nextLeader = function (key) {
		var i = 0;
		var obj = $scope.leaders[key];
		var length = $scope.leaders[key].length;
		var limit = Math.min($scope.leaders[key].length, $scope.limit);
		for (i=0; i<length; i++) {
			if (obj[i].index < $scope.limit) {
				obj[i].index =  (limit + obj[i].index  - 1)%limit;
				if (obj[i].index === 0) {
					$scope.currentLeader = obj[i];
				}
			}
		}
	};

	$scope.resetLeaders = function (key) {
		var i = 0;
		var obj = $scope.leaders[key];
		$scope.currentLeader = obj[0];
		var length = $scope.leaders[key].length;
		for (i=0; i<length; i++) {
			obj[i].index =  i;
		}
	};

	$scope.leaderClick = function(key, item){
		if($scope.currentLeader == item)
			return;
		var obj = $scope.leaders[key];
		$scope.currentLeader.index = item.index;
		item.index = 0;
		$scope.currentLeader = item;
	};
	$scope.getRoster = function (team) {
		$.post("/nfl-roster", {team:team.short}, function(data){
			var myArr = data.roster;
			alert(myArr[0].position);
			myArr.sort(function (a, b) {
				return a.position - b.position;
			});
			$scope.currentRoster = data.roster;
			$scope.leaders = data.leaders;
			$scope.currentLeader = $scope.leaders[$scope.category][0];
			$scope.currentTeam = team;
			$scope.currentTeamAbbr = team.short;
			$scope.$apply();
			$scope.nextPt(2);
		}, "json");
	};
});

myApp.directive('fallbackSrc', function () {
	var fallbackSrc = {
		link: function postLink(scope, iElement, iAttrs) {
			iElement.bind('error', function() {
				angular.element(this).attr("src", iAttrs.fallbackSrc);
			});
		}
	};
	return fallbackSrc;
});

angular.element(document).ready( function () {
});
