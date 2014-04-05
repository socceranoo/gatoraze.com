var PageTransitions = function() {

	var $main = $('#pt-main'),
		$pages = $main.children('.pt-page'),
		priAnim = 0,
		secAnim = 0,
		pagesCount = $pages.length,
		current = 0,
		isAnimating = false,
		endCurrPage = false,
		endNextPage = false,
		animEndEventNames = {
			'WebkitAnimation' : 'webkitAnimationEnd',
			'OAnimation' : 'oAnimationEnd',
			'msAnimation' : 'MSAnimationEnd',
			'animation' : 'animationend'
		},
		// animation end event name
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		// support css animations
		support = Modernizr.cssanimations;

	function init() {
		$pages.each( function() {
			var $page = $( this );
			$page.data('originalClassList', $page.attr('class'));
		});
		$pages.eq(current).addClass( 'pt-page-current' );
	}

	function clickButton() {
		if( isAnimating ) {
			return false;
		}
		isAnimating = true;
		var $currPage = $pages.eq( current );
		if( current < pagesCount - 1 ) {
			++current;
		} else {
			current = 0;
		}
		var $nextPage = $pages.eq(current).addClass( 'pt-page-current' );
		var ret = getNextAnimation(true);

		$currPage.addClass( ret[0]).on( animEndEventName, function() {
			$currPage.off( animEndEventName );
			endCurrPage = true;
			if( endNextPage ) {
				onEndAnimation( $currPage, $nextPage );
			}
		});

		$nextPage.addClass(ret[1]).on( animEndEventName, function() {
			$nextPage.off( animEndEventName );
			endNextPage = true;
			if( endCurrPage ) {
				onEndAnimation( $currPage, $nextPage );
			}
		});

		if( !support ) {
			onEndAnimation( $currPage, $nextPage );
		}

		return current;

	}

	function onEndAnimation( $outpage, $inpage ) {
		endCurrPage = false;
		endNextPage = false;
		resetPage( $outpage, $inpage );
		isAnimating = false;
	}

	function resetPage( $outpage, $inpage ) {
		$outpage.attr( 'class', $outpage.data( 'originalClassList' ) );
		$inpage.attr( 'class', $inpage.data( 'originalClassList' ) + ' pt-page-current' );
	}

	function getNextAnimation (next) {
		var arr = [
			/*
			[
				['pt-page-moveToLeft', 'pt-page-moveFromRight'],
				['pt-page-moveToRight', 'pt-page-moveFromLeft'],
				['pt-page-moveToTop', 'pt-page-moveFromBottom'],
				['pt-page-moveToBottom', 'pt-page-moveFromTop']
			],
			[
				['pt-page-fade', 'pt-page-moveFromRight pt-page-ontop'],
				['pt-page-fade', 'pt-page-moveFromLeft pt-page-ontop'],
				['pt-page-fade', 'pt-page-moveFromBottom pt-page-ontop'],
				['pt-page-fade', 'pt-page-moveFromTop pt-page-ontop']
			],
			[
				['pt-page-moveToLeftFade', 'pt-page-moveFromRightFade'],
				['pt-page-moveToRightFade', 'pt-page-moveFromLeftFade'],
				['pt-page-moveToTopFade', 'pt-page-moveFromBottomFade'],
				['pt-page-moveToBottomFade', 'pt-page-moveFromTopFade']
			],
			[
				['pt-page-moveToLeftEasing pt-page-ontop', 'pt-page-moveFromRight'],
				['pt-page-moveToRightEasing pt-page-ontop', 'pt-page-moveFromLeft'],
				['pt-page-moveToTopEasing pt-page-ontop', 'pt-page-moveFromBottom'],
				['pt-page-moveToBottomEasing pt-page-ontop', 'pt-page-moveFromTop']
			],
			[
				['pt-page-scaleDown', 'pt-page-moveFromRight pt-page-ontop'],
				['pt-page-scaleDown', 'pt-page-moveFromLeft pt-page-ontop'],
				['pt-page-scaleDown', 'pt-page-moveFromBottom pt-page-ontop'],
				['pt-page-scaleDown', 'pt-page-moveFromTop pt-page-ontop']
			],
			*/
			[
				['pt-page-scaleDown', 'pt-page-scaleUpDown pt-page-delay300'],
				['pt-page-scaleDownUp', 'pt-page-scaleUp pt-page-delay300'],
				['pt-page-scaleDownCenter', 'pt-page-scaleUpCenter pt-page-delay400']
			],
			[
				['pt-page-moveToLeft pt-page-ontop', 'pt-page-scaleUp'],
				['pt-page-moveToRight pt-page-ontop', 'pt-page-scaleUp'],
				['pt-page-moveToTop pt-page-ontop', 'pt-page-scaleUp'],
				['pt-page-moveToBottom pt-page-ontop', 'pt-page-scaleUp']
			],
			[
				['pt-page-rotateRightSideFirst', 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop'],
				['pt-page-rotateLeftSideFirst', 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop'],
				['pt-page-rotateTopSideFirst', 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop'],
				['pt-page-rotateBottomSideFirst', 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop']
			],
			[
				['pt-page-flipOutRight', 'pt-page-flipInLeft pt-page-delay500'],
				['pt-page-flipOutLeft', 'pt-page-flipInRight pt-page-delay500'],
				['pt-page-flipOutTop', 'pt-page-flipInBottom pt-page-delay500'],
				['pt-page-flipOutBottom', 'pt-page-flipInTop pt-page-delay500']
			],
			[
				['pt-page-rotateFall pt-page-ontop', 'pt-page-scaleUp']
			],
			[
				['pt-page-rotateOutNewspaper', 'pt-page-rotateInNewspaper pt-page-delay500']
			],
			[
				['pt-page-rotatePushLeft', 'pt-page-moveFromRight'],
				['pt-page-rotatePushRight', 'pt-page-moveFromLeft'],
				['pt-page-rotatePushTop', 'pt-page-moveFromBottom'],
				['pt-page-rotatePushBottom', 'pt-page-moveFromTop']
			],
			[
				['pt-page-rotatePushLeft', 'pt-page-rotatePullRight pt-page-delay180'],
				['pt-page-rotatePushRight', 'pt-page-rotatePullLeft pt-page-delay180'],
				['pt-page-rotatePushTop', 'pt-page-rotatePullBottom pt-page-delay180'],
				['pt-page-rotatePushBottom', 'pt-page-rotatePullTop pt-page-delay180']
			],
			[
				['pt-page-rotateFoldLeft', 'pt-page-moveFromRightFade'],
				['pt-page-rotateFoldRight', 'pt-page-moveFromLeftFade'],
				['pt-page-rotateFoldTop', 'pt-page-moveFromBottomFade'],
				['pt-page-rotateFoldBottom', 'pt-page-moveFromTopFade']
			],
			[
				['pt-page-moveToRightFade', 'pt-page-rotateUnfoldLeft'],
				['pt-page-moveToLeftFade', 'pt-page-rotateUnfoldRight'],
				['pt-page-moveToBottomFade', 'pt-page-rotateUnfoldTop'],
				['pt-page-moveToTopFade', 'pt-page-rotateUnfoldBottom']
			],
			[
				['pt-page-rotateRoomLeftOut pt-page-ontop', 'pt-page-rotateRoomLeftIn'],
				['pt-page-rotateRoomRightOut pt-page-ontop', 'pt-page-rotateRoomRightIn'],
				['pt-page-rotateRoomTopOut pt-page-ontop', 'pt-page-rotateRoomTopIn'],
				['pt-page-rotateRoomBottomOut pt-page-ontop', 'pt-page-rotateRoomBottomIn']
			],
			[
				['pt-page-rotateCubeLeftOut pt-page-ontop', 'pt-page-rotateCubeLeftIn'],
				['pt-page-rotateCubeRightOut pt-page-ontop', 'pt-page-rotateCubeRightIn'],
				['pt-page-rotateCubeTopOut pt-page-ontop', 'pt-page-rotateCubeTopIn'],
				['pt-page-rotateCubeBottomOut pt-page-ontop', 'pt-page-rotateCubeBottomIn']
			],
			[
				['pt-page-rotateCarouselLeftOut pt-page-ontop', 'pt-page-rotateCarouselLeftIn'],
				['pt-page-rotateCarouselRightOut pt-page-ontop', 'pt-page-rotateCarouselRightIn'],
				['pt-page-rotateCarouselTopOut pt-page-ontop', 'pt-page-rotateCarouselTopIn'],
				['pt-page-rotateCarouselBottomOut pt-page-ontop', 'pt-page-rotateCarouselBottomIn']
			],
			[
				['pt-page-rotateSidesOut', 'pt-page-rotateSidesIn pt-page-delay200'],
				['pt-page-rotateSlideOut', 'pt-page-rotateSlideIn']
			]
		];
		var ret = arr[priAnim][secAnim];
		priAnim = (priAnim + 1)%arr.length;
		return ret;
	}
	init();
	return { init : init , click: clickButton};
};