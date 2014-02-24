var boxObj;
var ptObj;
$(document).ready(function() {
	waypoint_init();
	boxObj = Boxgrid();
	boxObj.init();
	ptObj = PageTransitions();
	//Page.init();
});

function Cover($scope) {
	$scope.position = 0;
	$scope.sendMessage = function() {
	};
	$scope.cardClick = function (card) {
	};
}

function SkillSet($scope) {

	var skillHash = { 
		node:["#85CD2B"],
		angular:["#E52C3C"],
		python:["#ECF0F1"],
		php:["#6182b8"],
		mysql:["#2c596e"],
		mongo:["#82c564"],
		vim:["#4e4e4e"],
		html5:["#f0652c"],
		less:["#223553"],
		bootstrap:["#2d143e"],
		javascript:["#f0db4f"],
		expressjs:["#f0db4f"],
		socketio:["#aad959"],
		jade:["#67cc9a"],
		jquery:["#347cb3"],
		photoshop:["#96cafe"],
		ubuntu:["#c1392b"]
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
		boxObj.open($scope.current, skillHash[skill][0]);
	};
}

function Projects($scope) {
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
		ptObj.click();
	};
}

function waypoint_init () {
	var inprogress = false;
	/*
	$(".full-height").waypoint(function(direction) {
			if (direction === 'down' && inprogress === false) {
				var index = $(".full-height").index(this);
				move(index);
			}
		},
		{ offset: '95%' , triggerOnce : false }
	);

	$(".full-height").waypoint(function(direction) {
			if (direction === 'up' && inprogress === false) {
				var index = $(".full-height").index(this);
				move(index);
			}
		},
		{ offset: '-95%' , triggerOnce : false }
	);
   */

	$(".item-selector li").click(function () {
		var val = $(this).data('target');
		move(val);
	});

	function move(val) {
		var prev = $(".item-selector").data("current");
		if (! $(".full-height:eq("+val+")").length){
			return;
		}
		if (prev === val) {
			return;
		}
		var diff = Math.abs(val - prev);
		var delay = diff * 500;
		delay = (delay < 1000)?1000:delay;
		inprogress = true;
		$('html, body').animate(
			{ scrollTop: $(".full-height:eq("+val+")").offset().top },
			delay , callback);

		function callback() {
			inprogress = false;
			$(".item-selector li:eq("+prev+")").removeClass("active");
			$(".item-selector li:eq("+val+")").addClass("active");
			$(".item-selector").data("current", val);
		}
	}
}
