
function simulateTyping (str, textArea, delay, callback) {
	var currentCharIndex = 0;
	var timeout;
	function typeChar(){
		var char = str[currentCharIndex];
		if (textArea.val().length == str.length) {
			clearTimeout(timeout);
			currentCharIndex = 0;
			if (typeof callback !== 'undefined') {
				callback();
			}
			return;
		}
		textArea.val(textArea.val() + char);
		currentCharIndex ++;
		timeout = setTimeout(typeChar, delay);
	}
	typeChar();
}

function delayInit () {
	function iterator ($scope, obj, key, value, delay) {
		var timer = null;
		var iter = 0;
		var execute = function () {
			if (iter < obj.length) {
				obj[iter++][key] = value;
			} else {
				window.clearInterval(timer);
				iter = 0;
			}
			$scope.$apply();
		};
		var start = function () {
			timer = setInterval(execute, delay);
		};

		if (obj.length) {
			//obj[iter++][key] = true;
			setTimeout(start, 5);
		}
	}
	return {iterator:iterator};
}

function Main($scope) {
	$scope.first_sub = 8;
	var test = 0;
	var sub = -1;
	$scope.current = current;
	var bgArray = [
		"background-orange",
		"background-metroJade",
		//"background-pumpkin",
		"background-turquoise",
		"background-metroOrange",
		"background-peterRiver",
		"background-emerald",
		"background-metroRed",
		"background-metroCyan",
	];
	$scope.delayObj = delayInit();
	$scope.ptObj = PageTransitions(bgArray);
	//$scope.ptObj = PageTransitions(bgArray, $scope.current);
	$scope.bgArray = ["background-asbestos", "background-metroTeal", "background-midnightBlue", "background-metroPurple", "background-sunFlower"];
	$scope.bgArray = $scope.bgArray.concat(bgArray);
	$scope.curSubScreen = -1;
	$scope.curItem = null;
	$scope.curScreenImage = "";
	$container = $(".main");
	$item_divs = [null, null, $(".project-item"), $(".interest-item"), null, null, $(".work-item")];
	$scope.about_me = null;

	$scope.nextPt = function (page) {
		var html = $scope.restoreSubScreen();
		$scope.curSubScreen = -1;
		$scope.navigate(page, 0, null, html);
	};

	$scope.navigate = function (page, direction, item, html) {
		$container.removeClass("slideRight");
		$container.removeClass("slideLeft");
		$container.removeClass("slideUp");
		$container.removeClass("slideDown");
		$scope.current = $scope.ptObj.click(page, direction, item, html);
	};

	$scope.restoreSubScreen = function () {
		if ($scope.curSubScreen == -1)
			return null;
		//alert($scope.curSubScreen);
		var category = parseInt($scope.curSubScreen/100, 10);
		var item = parseInt(($scope.curSubScreen%100)/10, 10);
		var screen = $scope.curSubScreen%10;
		var parentDiv = $item_divs[category].eq(item);
		if (parentDiv.children('.screen-item').length === 0) {
			parentDiv.append($scope.curItem);
			return;
		}
		if (screen === 0)
			$item_divs[category].eq(item).children('.screen-item').eq(screen).before($scope.curItem);
		else
			$item_divs[category].eq(item).children('.screen-item').eq(screen-1).after($scope.curItem);
		return ($scope.curItem)? $scope.curItem.html() : null;
	};
	$scope.selectSubScreen = function (category, item, screen) {
		var first_sub = $scope.first_sub;
		var second_sub = $scope.first_sub + 1;
		var index = category*100 + 10*item + screen;
		if ($scope.curSubScreen == index) {
			$scope.navigate($scope.current, 0, null, html);
			return;
		}
		var dir = ($scope.curSubScreen < index) ? 1 : 2;
		var html = $scope.restoreSubScreen();
		$scope.curItem = $item_divs[category].eq(item).children('.screen-item').eq(screen);
		var nextPage = ($scope.current == first_sub) ? second_sub : first_sub;
		$scope.navigate(nextPage, dir, $scope.curItem, html);
		$scope.curSubScreen = index;
	};
	$scope.nextPt(test);
	if (test == 2 || test == 6) {
		if (sub >=0 ) {
			$scope.selectSubScreen(test, sub, 0);
		}
	}
	$scope.moveRight = function (callback) {
		$container.toggleClass("slideRight");
	};
	$scope.moveLeft = function (callback) {
		$container.toggleClass("slideLeft");
	};
	$scope.moveUp = function (callback) {
		$container.toggleClass("slideUp");
	};
	$scope.moveDown = function (callback) {
		$container.toggleClass("slideDown");
	};
	$scope.changeBg = function (bg, callback) {
		$scope.ptObj.changebg(bg);
		if (typeof callback !== 'undefined') {
			callback();
		}
	};
	$scope.selectScreenImage = function ($event) {
		var elem = $event.target;
		$scope.curScreenImage = $(elem).attr('src');
		$("#screen-modal").modal();
	};
	$scope.closeScreenModal = function ($event) {
		$("#screen-modal").modal('hide');
	};
	$scope.selectPage = function(cat, index) {
		$scope.selectSubScreen(cat, index, 0);
	};
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
	var actual = true;
	$scope.position = 0;
	$scope.navClick = function (index) {
		$scope.$parent.nextPt(index);
	};
	var delay = 50;
	var string = "\nHello,\nI am a full stack software developer,\nbased in San Francisco bay area, California.";
	//var string = "\nhi, I am Manjunath,\ni am a software developer from silicon valley,\ninterested in full stack development.";
	var textArea = $("#txt");
	$scope.exit = function () {
		textArea.val('');
	};
	$scope.entry = function () {
		if (actual === false) {
			textArea.val(string);
		}
		simulateTyping(string, textArea, delay, function () {
			//simulateTyping("Do not use browser back button to navigate", $("#txt2"), delay);
		});
	};
	$scope.entry();
	//$scope.$parent.ptObj.register(null, "enter", 0, $scope.entry);
	//$scope.$parent.ptObj.register(null, "leave", 0, $scope.exit);
}

function SkillSet($scope) {
	var boxObj = BoxGrid();
	var background = "#996699";
	var delayObj = $scope.$parent.delayObj;
	$scope.superSet = superSet;
	$scope.currentSuperSkill = $scope.superSet[0];
	$scope.currentSkill = $scope.currentSuperSkill.skills[0];
	$scope.skillOverlay = $("#skill-overlay");
	$scope.superSkillOverlay = $("#super-skill-overlay");
	$scope.currentElem = null;
	$scope.currentSuperElem = null;
	$scope.changeLeftPaneColor = function (color) {
		//$scope.$parent.ptObj.changeleftpane(color);
	};
	$scope.skillClose = function () {
		boxObj.close($scope.currentElem, $scope.skillOverlay, $scope.currentSuperElem);
		$scope.currentElem = null;
		$scope.changeLeftPaneColor($scope.currentSuperSkill.bg);
	};
	$scope.skillClick = function ($event, skill) {
		if (skill.click === false)
			return;
		$scope.currentElem = $($event.target);
		boxObj.open($scope.currentElem, skill.bg, skill.invert, $scope.skillOverlay);
		$scope.currentSkill = skill;
		$scope.changeLeftPaneColor(skill.bg);
	};
	$scope.superSkillClose = function () {
		boxObj.close($scope.currentSuperElem, $scope.superSkillOverlay, null);
		$scope.currentSuperElem = null;
		$scope.changeLeftPaneColor(null);
	};
	$scope.superSkillClick = function ($event, superSkill) {
		$scope.currentSuperElem = $($event.target);
		$scope.currentSuperSkill = superSkill;
		bg = superSkill.bg;
		$scope.changeLeftPaneColor(bg);
		boxObj.open($scope.currentSuperElem, bg, superSkill.invert, $scope.superSkillOverlay);
	};

	$scope.exit = function () {
		delayObj.iterator($scope, $scope.superSet, "valid", false, 10);
		if ($scope.currentElem)
			$scope.skillClose();
	};
	$scope.entry = function () {
		if ($scope.currentSuperElem)
			$scope.superSkillClose();
		delayObj.iterator($scope, $scope.superSet, "valid", true, 200);
	};
	$scope.exit();
	$scope.$parent.ptObj.register(null, "enter", 1, $scope.entry);
	$scope.$parent.ptObj.register(null, "leave", 1, $scope.exit);
}

function Projects($scope) {
	var delayObj = $scope.$parent.delayObj;
	$scope.projects = projects;
	$scope.exit = function () {
		delayObj.iterator($scope, $scope.projects, "valid", false, 0);
	};
	$scope.entry = function () {
		delayObj.iterator($scope, $scope.projects, "valid", true, 100);
	};
	$scope.exit();

	$scope.$parent.ptObj.register(null, "enter", 2, $scope.entry);
	$scope.$parent.ptObj.register(null, "leave", 2, $scope.exit);
}

function Interests($scope) {
	$scope.interests=[interests1, interests2];
	$scope.active = [false, false];
	$scope.current = [interests1[0], interests2[0]];

	$scope.about_me = [
		"have experience working with an agile/scrum-based development model",
		"have experience working with remote, cross-geo and distributed teams",
		"self-motivated and can work for long hours",
		"can learn things really fast and get on board quickly",
		"a huge fan of the open source and can work with 3rd party APIs",
		"can communicate well with others in both written and verbal forms",
		"always aim to write elegant and well tested code and take pride in them"
	];

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
				//return;
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
	$scope.$parent.ptObj.register(null, "enter", 3, $scope.startInterestSlide);
	$scope.$parent.ptObj.register(null, "leave", 3, $scope.stopInterestSlide);
	$scope.$parent.about_me = $scope.about_me;
}


function Contact($scope){
	var messageTimer = null;
	$scope.pull_value = 0;
	$control_elem = $(".pull-down-control");
	$succes_elem = $(".pull-down-success");
	$failure_elem = $(".pull-down-failure");
	$scope.message = [["a", "call"], ["an", "e-mail"], ["a", "message"], ["a", "post"], ["an", "inmail"], ["a", "tweet"]];
	$scope.index = 0;
	$scope.total = $scope.message.length;
	$scope.arr = [
		{name:"Facebook", class:"fa-facebook color-merald", href:"https://facebook.com/socceranoo"},
		{name:"Mail", class:"fa-envelope color-louds", href:"mailto:socceranoo@gmail.com"},
		//{name:"Google Plus", class:"fa-google-plus color-etroCyan", href:"https://plus.google.com/u/0/105434114873208835365/"},
		{name:"Linked-in", class:"fa-linkedin color-unFlower", href:"https://www.linkedin.com/pub/manjunath-mageswaran/14/466/372/"},
		{name:"Twitter", class:"fa-twitter color-lizarin", href:"https://twitter.com/socceranoo"},
		{name:"Pinterest", class:"fa-pinterest color-etroNavy", href:"https://pinterest.com/socceranoo"},
		{name:"Resume", class:"fa-file-text color-etroNavy", href:"/portfolio/images/UIResume.pdf"}
	];

	$scope.pull_down = function (bool) {
		$control_elem.slideUp();
		if (bool === true) {
			$succes_elem.slideDown();
			$scope.pull_value = 1;
		} else {
			$failure_elem.slideDown();
			$scope.pull_value = 2;
		}
	};
	$scope.pull_up = function () {
		$control_elem.slideDown();
		$succes_elem.slideUp();
		$failure_elem.slideUp();
		$scope.pull_value = 0;
	};
	var wp_func_enter = function (direction) {
		messageTimer = setInterval(function() {
			$scope.index = ($scope.index + 1)%$scope.total;
			$scope.$digest();
		}, 3000);
		$scope.pull_down(true);
	};
	var wp_func_leave = function (direction) {
		window.clearInterval(messageTimer);
		$scope.pull_up();
	};
	$scope.$parent.ptObj.register(null, "enter", 5, wp_func_enter);
	$scope.$parent.ptObj.register(null, "leave", 5, wp_func_leave);
}

function Gallery($scope) {
	$scope.elem = $(".snowkick-img");
	var xPos = -1;
	var total = 21;
	var imgHeight = 720;
	var timer = null;
	$scope.temp = 0;
	var delay = 125;
	var string = "Coming soon ....";
	var textArea = $("#coming-soon");
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
		simulateTyping(string, textArea, delay);
	};
	var wp_func_enter = function (direction) {
		xPos = -1;
		$scope.restartSnowkick(2);
	};
	var wp_func_leave = function (direction) {
		$scope.stopSnowkick();
		var pos_str = "0px 0px";
		$scope.elem.css('background-position', pos_str);
	};
	textArea.val('');
	$scope.$parent.ptObj.register(null, "enter", 7, wp_func_enter);
	$scope.$parent.ptObj.register(null, "leave", 7, wp_func_leave);
}

function Work($scope) {
	var delayObj = $scope.$parent.delayObj;
	$scope.works = works;
	$scope.exit = function () {
		delayObj.iterator($scope, $scope.works, "valid", false, 0);
	};
	$scope.entry = function () {
		delayObj.iterator($scope, $scope.works, "valid", true, 100);
	};

	$scope.exit();

	$scope.$parent.ptObj.register(null, "enter", 6, $scope.entry);
	$scope.$parent.ptObj.register(null, "leave", 6, $scope.exit);
}

function Awards($scope) {
	$scope.awards = [
		{result:"Won", name:"Standing Ovation Award", img:"about-me/symantec.png",data:"from Symantec Marketing team for action in the making of Symantec’s Disaster recovery solutions videos"},
		{result:"Won", name:"Standing Ovation Award", img:"about-me/symantec.png", data:"from Symantec Engineering team for action in customer escalations and contribution towards product release."},
		{result:"Won", name:"First place", img:"about-me/symantec.png", data:"in a hackathon event at Symantec for developing the tool bugspies."},
		{result:"Nominated for", name:"Achievers Award", img:"about-me/symantec.png", data:"by Symantec Engineering team for contributions in 2013-2014."},
		{result:"Won", name:"Applause Award", img:"about-me/symantec.png", data:"from Symantec Engineering team for developing the DRaaS prototype for proof of concept."},
		{result:"Won", name:"Achievement Award", img:"about-me/gator.png", data:"from University of Florida Grad school for new engineering graduate students."},
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
		$scope.pageTurn(0);
		$scope.$digest();
		return;
	};
	$scope.$parent.ptObj.register(null, "enter", 4, wp_func_enter);
	$scope.$parent.ptObj.register(null, "leave", 4, $scope.reset);
}
