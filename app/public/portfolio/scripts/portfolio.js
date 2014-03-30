var navObj;
$(document).ready(function() {
	navObj = waypoint_init();
	//Page.init();
});

function Cover($scope) {
	$scope.position = 0;
	$scope.click1 = function (index) {
		navObj.move(index);
	};
}

function SkillSet($scope) {
	var boxObj = BoxGrid();
	var skillHash = {
		node:["#85CD2B", true],
		angular:["#E52C3C", false],
		python:["#ECF0F1", true],
		php:["#6182b8", false],
		mysql:["#2c596e", false],
		mongo:["#82c564", true],
		vim:["#4e4e4e", true],
		html5:["#f0652c", false],
		less:["#223553", false],
		bootstrap:["#2d143e", false],
		javascript:["#f0db4f", true],
		expressjs:["#f0db4f", true],
		socketio:["#aad959", true],
		jade:["#67cc9a", true],
		jquery:["#347cb3", true],
		photoshop:["#96cafe", true],
		ubuntu:["#c1392b", false]
	};
	var background = "#996699";
	$scope.position = 0;
	$scope.current = null;
	$scope.sendMessage = function() {
	};
	$scope.skillClose = function () {
		boxObj.close($scope.current);
	};
	$scope.skillClick = function ($event, skill) {
		$scope.current = $($event.target);
		boxObj.open($scope.current, skillHash[skill][0], skillHash[skill][1]);
	};
}

function Projects($scope) {
	var ptObj = PageTransitions();
	$scope.current = 0;
	$scope.position = 0;
	$scope.sendMessage = function() {
	};
	$scope.moveRight = function () {
		$container = $(".projects");
		var opened = $container.data( 'opened' );
		if (! opened) {
			$container.addClass("slideRight").data('opened', true);
		} else {
			$container.removeClass("slideRight").data('opened', false);
		}
	};
	$scope.nextPt = function () {
		$scope.current = ptObj.click();
	};
}

function waypoint_init () {
	var inprogress = false;
	var current = 0;
	/*
   */
	$(".full-height").waypoint(function(direction) {
			if (direction === 'down' && inprogress === false) {
				var index = $(".full-height").index(this);
				setActive(index);
			}
		},
		{ offset: '50%' , triggerOnce : false }
	);

	$(".full-height").waypoint(function(direction) {
			if (direction === 'up' && inprogress === false) {
				var index = $(".full-height").index(this);
				setActive(index);
			}
		},
		{ offset: '-50%' , triggerOnce : false }
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
		var diff = Math.abs(val - current);
		var delay = diff * 500 + 100;
		delay = (delay < 1000)?1000:delay;
		inprogress = true;
		$('html, body').animate({ scrollTop: $(".full-height:eq("+val+")").offset().top }, delay , function () {
			setActive(val);
		});
	}
	function setActive(val) {
		inprogress = false;
		$(".item-selector li:eq("+current+")").removeClass("active");
		$(".item-selector li:eq("+val+")").addClass("active");
		current = val;
	}

	return {move:move, active:setActive};
}
