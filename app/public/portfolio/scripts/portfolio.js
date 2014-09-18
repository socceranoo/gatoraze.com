
var bgArray = {
	arr: [
		"background-orange",
		"background-peterRiver",
		"background-alizarin",
		"background-metroCyan",
		"background-metroJade",
		"background-metroTeal",
		"background-metroPurple",
		"background-turquoise"
	],
	cur:[0, 0, 0, 0, 0, 0],
	valid:[false, true, false, true, false, false]
};
var ptObj = PageTransitions(bgArray.arr);
var mainFunc = null;

function delayedIterator ($scope, arrObj, key, value, delay) {
	var timer = null;
	var obj = arrObj;
	var iter = 0;
	var start = function () {
		timer = setInterval(function() {
			if (iter < obj.length) {
				obj[iter++][key] = value;
			} else {
				window.clearInterval(timer);
				iter = 0;
			}
			$scope.$apply();
		}, delay);
	};
	setTimeout(start, 200);
}
/*
function waypoint_init () {
	var inprogress = false;
	var current = 0;
	var fnHash = {up:{enter:[], leave:[]}, down:{enter:[], leave:[]}};
	$(".full-height").waypoint(function(direction) {
			if (direction === 'down' && inprogress === false) {
				var index = $(".full-height").index(this);
				setActive(index, direction);
			}
		}, { offset: '50%' , triggerOnce : false }
	);

	$(".full-height").waypoint( function(direction) {
			if (direction === 'up' && inprogress === false) {
				var index = $(".full-height").index(this);
				setActive(index, direction);
			}
		}, { offset: '-50%' , triggerOnce : false }
	);

	$(".item-selector li").click(function () {
		move($(this).index());
	});

	function move(val) {
		if (! $(".full-height:eq("+val+")").length){
			return;
		}
		if (current === val ) {
			if ($('html body').scrollTop() == $(".full-height:eq("+val+")").offset().top)
				return;
		}
		inprogress = true;
		var direction = (val - current) > 0 ? "down" : "up";
		var diff = Math.abs(val - current);
		var delay = diff * 500 + 500;
		//delay = (delay < 1000)?1000:delay;
		$('html, body').animate({ scrollTop: $(".full-height:eq("+val+")").offset().top }, delay , function () {
			setActive(val, direction);
		});
	}
	function setActive(val, direction) {
		//alert(val+" "+direction);
		inprogress = false;
		if (current !== val ) {
			if (fnHash[direction].enter[val]) {
				fnHash[direction].enter[val](direction);
			}
			if (fnHash[direction].leave[current]) {
				fnHash[direction].leave[current](direction);
			}
		}
		$(".item-selector li:eq("+current+")").removeClass("active");
		$(".item-selector li:eq("+val+")").addClass("active");
		current = val;
	}

	function getCurrent () {
		return current;
	}

	function register (direction, mode, index, fn) {
		fnHash.up[mode][index] = fn;
		fnHash.down[mode][index] = fn;
	}
	return {move:move, active:setActive, getVal:getCurrent, register:register};
}
*/

$(document).ready(function() {
	//Page.init();
});

angular.element(document).ready( function () {
});

function Cover($scope) {
	$scope.position = 0;
	$scope.navClick = function (index) {
		mainFunc(index);
	};
}

function SkillSet($scope) {
	var boxObj = BoxGrid();
	var background = "#996699";
	$scope.superSet = superSet;
	$scope.currentSuperSkill = $scope.superSet[0];
	$scope.currentSkill = $scope.currentSuperSkill.skills[0];
	$scope.skillOverlay = $("#skill-overlay");
	$scope.superSkillOverlay = $("#super-skill-overlay");
	$scope.currentElem = null;
	$scope.currentSuperElem = null;
	$scope.superSkillClose = function () {
		boxObj.close($scope.currentSuperElem, $scope.superSkillOverlay, null);
	};
	$scope.skillClose = function () {
		boxObj.close($scope.currentElem, $scope.skillOverlay, $scope.currentSuperElem);
	};
	$scope.skillClick = function ($event, skill) {
		if (skill.click === false)
			return;
		$scope.currentElem = $($event.target);
		boxObj.open($scope.currentElem, skill.bg, skill.invert, $scope.skillOverlay);
		$scope.currentSkill = skill;
	};

	$scope.superSkillClick = function ($event, superSkill) {
		$scope.currentSuperElem = $($event.target);
		$scope.currentSuperSkill = superSkill;
		bg = superSkill.bg;
		boxObj.open($scope.currentSuperElem, bg, superSkill.invert, $scope.superSkillOverlay);
		//delayedIterator($scope, $scope.currentSuperSkill.skills, "valid", true, 200);
	};

	$scope.reset = function (obj) {
		var i = 0;
		var j = 0;
		for (i=0; i<obj.length; i++) {
			obj[i].valid = false;
		}
	};
	$scope.exit = function () {
		$scope.reset($scope.superSet);
		$scope.$apply();
	};
	$scope.entry = function () {
		delayedIterator($scope, $scope.superSet, "valid", true, 200);
	};
	$scope.reset($scope.superSet);
	ptObj.register(null, "enter", 1, $scope.entry);
	ptObj.register(null, "leave", 1, $scope.exit);
}

function Main($scope) {
	$scope.current = 0;
	$scope.position = 0;
	$scope.nextPt = function (arg) {
		$scope.current = ptObj.click(arg);
	};
	mainFunc = $scope.nextPt;
}

function Projects($scope) {
	$scope.cur = 6;
	$scope.projectClick = function() {
		$scope.moveRight();
	};
	$scope.moveRight = function (callback) {
		$container = $(".projects");
		$container.toggleClass("slideRight");
	};
	$scope.nextScreen = function () {
		ptObj.click($scope.cur, true);
		$scope.cur = ($scope.cur == 6) ? 7 : 6;
	};
}

function Interests($scope) {
	$scope.interests=[interests1, interests2];
	$scope.active = [false, false];
	$scope.current = [interests1[0], interests2[0]];

	$scope.nextInterest = function (option) {
		var i = 0;
		var obj = $scope.interests[option];
		for (i=0; i<obj.length; i++) {
			obj[i].index =  (obj.length + obj[i].index  - 1)%obj.length;
			if (obj[i].index === 0) {
				$scope.current[option] = obj[i];
			}
		}
	};

	$scope.interestClick = function(option, item){
		if($scope.current == item)
			return;
		var obj = $scope.interests[option];
		$scope.current[option].index = item.index;
		item.index = 0;
		$scope.current[option] = item;
	};
	var timer = null;
	$scope.startInterestSlide = function () {
		timer = setInterval(function() {
			//$scope.index = ($scope.index + 1)%$scope.total;
			if ($scope.active[0] === true) {
				return;
			}
			$scope.$apply(function () {
				$scope.nextInterest(0);
			});
		}, 5000);
	};
	$scope.stopInterestSlide = function () {
		window.clearInterval(timer);
	};

	$scope.mouseEnter = function(option, item) {
		if (item == $scope.current[option])
			$scope.active[option] = true;
	};

	$scope.mouseLeave = function(option, item) {
		if (item == $scope.current[option])
			$scope.active[option] = false;
	};
	ptObj.register(null, "enter", 3, $scope.startInterestSlide);
	ptObj.register(null, "leave", 3, $scope.stopInterestSlide);
}


function Contact($scope){
	var xPos = -1;
	var total = 21;
	var imgHeight = 720;
	var timer = null;
	var messageTimer = null;
	$scope.temp = 0;
	$scope.elem = $(".snowkick-img");
	$scope.index = 0;
	$scope.total = 5;
	$scope.arr = [
		{name:"Facebook", class:"fa-facebook color-merald", href:"https://facebook.com/socceranoo"},
		{name:"Mail", class:"fa-envelope color-louds", href:"mailto:socceranoo@gmail.com"},
		//{name:"Google Plus", class:"fa-google-plus color-etroCyan", href:"https://plus.google.com/u/0/105434114873208835365/"},
		{name:"Linked-in", class:"fa-linkedin color-unFlower", href:"https://www.linkedin.com/pub/manjunath-mageswaran/14/466/372/"},
		{name:"Twitter", class:"fa-twitter color-lizarin", href:"https://twitter.com/socceranoo"},
		{name:"Pinterest", class:"fa-pinterest color-etroNavy", href:"https://pinterest.com/socceranoo"},
		{name:"Resume", class:"fa-file-text color-etroNavy", href:"/portfolio/images/UIResume.pdf"}
	];

	$scope.startSnowkick = function (startvalue, step, endvalue, delay) {
		xPos = startvalue;
		timer = setInterval(function() {
			xPos = (xPos + step);
			if (xPos === endvalue) {
				$scope.stopSnowkick();
				xPos = -1;
				$scope.temp += 2;
				return;
			}
			var pos_str = (-1 *imgHeight*xPos)+"px 0px";
			$scope.elem.css('background-position', pos_str);
		}, delay);
	};

	$scope.stopSnowkick = function () {
		window.clearInterval(timer);
	};

	$scope.restartSnowkick = function (option) {
		if (xPos !== -1) {
			return;
		}
		if (option %2 === 0) {
			$scope.startSnowkick(0, 1, total, 100);
		} else {
			$scope.startSnowkick(total-1, -1, -1, 100);
		}
	};
	var wp_func_enter = function (direction) {
		xPos = -1;
		$scope.restartSnowkick(2);
		messageTimer = setInterval(function() {
			$scope.index = ($scope.index + 1)%$scope.total;
			$scope.$digest();
		}, 3000);
	};
	var wp_func_leave = function (direction) {
		$scope.stopSnowkick();
		var pos_str = "0px 0px";
		$scope.elem.css('background-position', pos_str);
		window.clearInterval(messageTimer);
	};
	ptObj.register(null, "enter", 5, wp_func_enter);
	ptObj.register(null, "leave", 5, wp_func_leave);
}

function Awards($scope) {
	$scope.awards = [
		{result:"Won", name:"Standing Ovation Award", img:"about-me/symantec.png",data:"Symantec Marketing team for action in the making of Symantec’s Disaster recovery solutions videos (1 min and 10 min versions)"},
		{result:"Won", name:"Standing Ovation Award", img:"about-me/symantec.png", data:"Symantec Engineering team for action in customer escalations and contribution towards product release."},
		{result:"Won", name:"First place", img:"about-me/symantec.png", data:"Hackathon event at Symantec Engineering team for developing the tool bugspies."},
		{result:"Nominated", name:"Achievers Award", img:"about-me/symantec.png", data:"Symantec Engineering team."},
		{result:"Won", name:"Achievement Award", img:"about-me/gator.png", data:"New Engineering Graduate Students, University of Florida."},
	];
	var classLeft = "turn-page";
	$scope.page = -1;
	$scope.zcounter = 11;
	$scope.pageTurn = function (index) {
		var elem = $(".page-elem:eq("+index+")");
		if(elem.hasClass(classLeft)) {
			elem.removeClass(classLeft);
			elem.css('z-index', ++$scope.zcounter);
			$scope.page--;
			if (index === 0)
				$scope.reset();
		} else {
			elem.addClass(classLeft);
			elem.css('z-index', ++$scope.zcounter);
			$scope.page++;
		}
		//$scope.$digest();
	};
	$scope.reset = function () {
		$scope.page = -1;
		$scope.zcounter = 11;
		$(".page-elem").each(function (i, obj) {
			$(this).removeClass(classLeft);
			$(this).css('z-index', 10-i);
		});
	};

	var wp_func_enter = function (direction) {
		$scope.page++;
		var elem = $(".page-elem:eq(0)");
		elem.addClass(classLeft);
		elem.css('z-index', ++$scope.zcounter);
		$scope.$digest();
	};
	//ptObj.register(null, "enter", 4, wp_func_enter);
	ptObj.register(null, "leave", 4, $scope.reset);
}

function Groups($scope) {
	$scope.groups = groupData;
	$scope.currentGroup = "A";
}
