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
	$scope.skillSet = skillSet;
	$scope.currentSkill = $scope.skillSet[0];
	var background = "#996699";
	$scope.position = 0;
	$scope.current = null;
	$scope.sendMessage = function() {
	};
	$scope.skillClose = function () {
		$scope.currentSkill = null;
		boxObj.close($scope.current);
	};
	$scope.skillClick = function ($event, skill) {
		$scope.current = $($event.target);
		boxObj.open($scope.current, skill.bg, skill.invert);
		$scope.currentSkill = skill;
	};
}

function Projects($scope) {
	var ptObj = PageTransitions();
	$scope.current = 0;
	$scope.position = 0;
	$scope.projectClick = function() {
		$scope.moveRight();
	};
	$scope.moveRight = function () {
		$container = $(".projects");
		var opened = $container.data('opened');
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

function Contact($scope){

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
