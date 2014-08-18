/*
* debouncedresize: special jQuery event that happens once after a window resize
*
* latest version and complete README available on Github:
* https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
*
* Copyright 2011 @louis_remi
* Licensed under the MIT license.
*/
var $Event = $.event,
$special,
resizeTimeout;

$special = $Event.special.debouncedresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments,
			dispatch = function() {
				// set correct event type
				event.type = "debouncedresize";
				$Event.dispatch.apply( context, args );
			};

		if ( resizeTimeout ) {
			clearTimeout( resizeTimeout );
		}

		var temp = execAsap ?  dispatch() : resizeTimeout = setTimeout( dispatch, $special.threshold );
	},
	threshold: 50
};

var BoxGrid = function() {
	var $items = $( '.rb-grid > li' ),
		transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd',
			'msTransition' : 'MSTransitionEnd',
			'transition' : 'transitionend'
		},
		// transition end event name
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		// window and body elements
		$window = $( window ),
		$body = $('BODY'),
		// transitions support
		supportTransitions = Modernizr.csstransitions,
		// current item's index
		current = null,
		// window width and height
		winsize = getWindowSize();
		$close = $('.rb-close'),
		$overlay = $('.overlay'),
		$basecc = "#000",
		$inversecc = "#fff";

	function open ($item, background, invert, $overlayElem) {
		var cc = (invert)?$basecc:$inversecc;
		$overlay = $overlayElem;
		// save current item's index
		current = $item;
		var layoutProp = getItemLayoutProp( $item ),
			clipPropFirst = 'rect(' + layoutProp.top + 'px ' + ( layoutProp.left + layoutProp.width ) + 'px ' + ( layoutProp.top + layoutProp.height ) + 'px ' + layoutProp.left + 'px)',
			clipPropLast = 'rect(0px ' + winsize.width + 'px ' + (winsize.height) + 'px 0px)';
		$overlay.css( {
			clip : supportTransitions ? clipPropFirst : clipPropLast,
			opacity : 1,
			zIndex: 9999,
			pointerEvents : 'auto',
			background : background,
			color : cc
		});
		if( supportTransitions ) {
			$overlay.on( transEndEventName, function() {
				$overlay.off( transEndEventName );
				setTimeout( function() {
					$overlay.css( 'clip', clipPropLast ).on( transEndEventName, function() {
						$overlay.off( transEndEventName );
						//$body.css( 'overflow-y', 'hidden' );
					} );
				}, 25 );
			} );
		} else {
			//$body.css( 'overflow-y', 'hidden' );
		}
	}

	function close($item, $overlayElem, $current) {
		$overlay = $overlayElem;
		current = $current;
		if (current === null) {
			//$body.css( 'overflow-y', 'auto' );
		}
		var layoutProp = getItemLayoutProp( $item ),
			clipPropFirst = 'rect(' + layoutProp.top + 'px ' + ( layoutProp.left + layoutProp.width ) + 'px ' + ( layoutProp.top + layoutProp.height ) + 'px ' + layoutProp.left + 'px)',
		clipPropLast = 'auto';
		$overlay.css( {
			clip : supportTransitions ? clipPropFirst : clipPropLast,
			opacity : supportTransitions ? 1 : 0,
			pointerEvents : 'none'
		});
		if( supportTransitions ) {
			$overlay.on( transEndEventName, function() {
				$overlay.off( transEndEventName );
				setTimeout( function() {
					$overlay.css( 'opacity', 0 ).on( transEndEventName, function() {
						$overlay.off( transEndEventName ).css( { clip : clipPropLast, zIndex: -1 } );
						$overlay.css('background', 'transparent');
						$overlay.css('color', $basecc);
					} );
				}, 25 );
			} );
		} else {
			$overlay.css( 'z-index', -1 );
		}
		return false;
	}

	function initEvents() {
		$( window ).on( 'debouncedresize', function() {
			winsize = getWindowSize();
			// todo : cache the current item
			if( current !== null ) {
				$overlay.css( 'clip', 'rect(0px ' + winsize.width + 'px ' + winsize.height + 'px 0px)' );
			}
		});
	}

	function getItemLayoutProp( $item ) {
		var scrollT = $window.scrollTop(),
			scrollL = $window.scrollLeft(),
			itemOffset = $item.offset();
		return {
			left : itemOffset.left - scrollL,
			top : itemOffset.top - scrollT,
			width : $item.outerWidth(),
			height : $item.outerHeight()
		};

	}

	function getWindowSize() {
		//$body.css( 'overflow-y', 'hidden' );
		var w = $window.width(), h =  $window.height();
		if( current === null ) {
			//$body.css( 'overflow-y', 'auto' );
		}
		return { width : w, height : h };
	}
	initEvents();
	return { open : open, close : close };
};
