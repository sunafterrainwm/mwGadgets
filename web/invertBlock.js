/**
 * User:Sunny00217/invertBlock.js
 * 改自 https://zh.wikipedia.org/wiki/User:燃灯/invertBlock.js?oldid=51362012
 * 讓新版的 {{tlx|block}} 也能有類似效果
 **/
// <%-- [PAGE_INFO] PageTitle=#User:Sunny00217/invertBlock.js# [END_PAGE_INFO] --%> <nowiki>
$( function () {
	/**
	 * @param {HTMLDivElement} $body
	 */
	function init( $body ) {
		$body.find( "mark.inline-text-blocked" ).on( "mouseenter", function ( e ) {
			e.preventDefault();
			var color = $( this ).css( "background-color" ).trim();
			$( this )
				.removeClass( "inline-text-blocked" )
				.data( "inline-text-blocked-mouseenter-bg", color )
				.css( "background-color", "initial" )
				.css( "color", color );
		} ).on( "mouseleave", function ( e ) {
			e.preventDefault();
			if ( $( this ).data( "inline-text-blocked-mouseenter-bg" ) ) {
				$( this )
					.addClass( "inline-text-blocked" )
					.css( "background-color", $( this ).data( "inline-text-blocked-mouseenter-bg" ) )
					.css( "color", "transparent" );
			}
		} ).on( "click", function ( e ) {
			var R, G, B, A;
			e.preventDefault();

			var color = $( this ).css( "background-color" ).trim();
			if ( color.match( /^#[A-Fa-f\d]{3}[A-Fa-f\d]{3}?$/ ) ) {
				if ( color.match( /^#[A-Fa-f\d]{3}$/ ) ) {
					R = parseInt( "0x" + color.substr( 1, 1 ), 16 ) * 16;
					G = parseInt( "0x" + color.substr( 2, 1 ), 16 ) * 16;
					B = parseInt( "0x" + color.substr( 2, 1 ), 16 ) * 16;
				} else {
					R = parseInt( "0x" + color.substr( 1, 2 ), 16 );
					G = parseInt( "0x" + color.substr( 3, 2 ), 16 );
					B = parseInt( "0x" + color.substr( 5, 2 ), 16 );
				}
				A = 1;
			} else if ( color.match( /^#[A-Fa-f\d]{4}[A-Fa-f\d]{4}?$/ ) ) {
				if ( color.match( /^#[A-Fa-f\d]{4}$/ ) ) {
					R = parseInt( "0x" + color.substr( 1, 1 ), 16 ) * 16;
					G = parseInt( "0x" + color.substr( 2, 1 ), 16 ) * 16;
					B = parseInt( "0x" + color.substr( 2, 1 ), 16 ) * 16;
					A = parseInt( "0x" + color.substr( 3, 1 ), 16 ) * 16;
				} else {
					R = parseInt( "0x" + color.substr( 1, 2 ), 16 );
					G = parseInt( "0x" + color.substr( 3, 2 ), 16 );
					B = parseInt( "0x" + color.substr( 5, 2 ), 16 );
					A = parseInt( "0x" + color.substr( 7, 2 ), 16 );
				}
			} else if ( color.match( /^rgb\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i ) ) {
				color.replace( /^rgb\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, function ( all, r, g, b ) {
					R = parseInt( r.trim(), 10 );
					G = parseInt( g.trim(), 10 );
					B = parseInt( b.trim(), 10 );
					return all;
				} );
				A = 1;
			} else if ( color.match( /^rgba\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(1|0|0\.\d+)\s*\)$/i ) ) {
				color.replace( /^rgba\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(1|0|0\.\d+)\s*\)$/i, function ( all, r, g, b, a ) {
					R = parseInt( r.trim(), 10 );
					G = parseInt( g.trim(), 10 );
					B = parseInt( b.trim(), 10 );
					A = parseInt( a.trim(), 10 );
					return all;
				} );
			}

			$( this )
				.removeClass( "inline-text-blocked" )
				.css( "background-color", "initial" )
				.css( "color",
					!isNaN( R + G + B + A ) ?
						(
							( A && A < 100 && 765 || R + G + B ) > 400 ?
								"rgba( 0, 0, 0, 0.6 )" :
								"rgba( " + R + ", " + G + ", " + B + ", " + A + " )"
						) :
						color
				)
				.off();
		} );
	}

	mw.hook( "wikipage.content" ).add( init );
} );
