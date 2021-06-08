/**
 * User:Sunny00217/invertBlock.js
 * 改自 https://zh.wikipedia.org/wiki/User:燃灯/invertBlock.js?oldid=51362012
 * 讓新版的 {{tlx|block}} 也能有類似效果
 **/
// <%-- [PAGE_INFO] PageTitle=#User:Sunny00217/invertBlock.js# [END_PAGE_INFO] --%> <nowiki>
$( function () {
	$( "mark.inline-text-blocked" ).on( "mouseenter", function ( e ) {
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

		/**
		 * @param {string[]} str
		 * @return {number}
		 */
		function sumRGB( str ) {
			if ( str.length < 3 ) {
				return 0;
			}
			var ret = parseInt( str[ 0 ] ) + parseInt( str[ 1 ] ) + parseInt( str[ 2 ] );
			if ( str[ 3 ] && str[ 3 ] < 100 ) { // if too transparent
				ret = 765; // 255 * 3
			}
			return ret;
		}

		var color = $( this ).css( "background-color" ).trim();
		if ( color.match( /^#[A-Fa-f\d]{3}[A-Fa-f\d]{3}?$/ ) ) {
			if ( color.match( /^#[A-Fa-f\d]{3}$/ ) ) {
				R = parseInt( "0x" + color.substr( 1, 1 ) ) * 16;
				G = parseInt( "0x" + color.substr( 2, 1 ) ) * 16;
				B = parseInt( "0x" + color.substr( 2, 1 ) ) * 16;
			} else {
				R = parseInt( "0x" + color.substr( 1, 2 ) );
				G = parseInt( "0x" + color.substr( 3, 2 ) );
				B = parseInt( "0x" + color.substr( 5, 2 ) );
			}
			A = 1;
		} else if ( color.match( /^#[A-Fa-f\d]{4}[A-Fa-f\d]{4}?$/ ) ) {
			if ( color.match( /^#[A-Fa-f\d]{4}$/ ) ) {
				R = parseInt( "0x" + color.substr( 1, 1 ) ) * 16;
				G = parseInt( "0x" + color.substr( 2, 1 ) ) * 16;
				B = parseInt( "0x" + color.substr( 2, 1 ) ) * 16;
				A = parseInt( "0x" + color.substr( 3, 1 ) ) * 16;
			} else {
				R = parseInt( "0x" + color.substr( 1, 2 ) );
				G = parseInt( "0x" + color.substr( 3, 2 ) );
				B = parseInt( "0x" + color.substr( 5, 2 ) );
				A = parseInt( "0x" + color.substr( 7, 2 ) );
			}
		} else if ( color.match( /^rgb\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i ) ) {
			color.replace( /^rgb\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, function ( all, r, g, b ) {
				R = parseInt( r.trim() );
				G = parseInt( g.trim() );
				B = parseInt( b.trim() );
				return all;
			} );
		} else if ( color.match( /^rgba\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(1|0|0\.\d+)\s*\)$/i ) ) {
			color.replace( /^rgba\(\s*(\d{1,3})\s*,(\s*\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(1|0|0\.\d+)\s*\)$/i, function ( all, r, g, b, a ) {
				R = parseInt( r.trim() );
				G = parseInt( g.trim() );
				B = parseInt( b.trim() );
				A = parseInt( a.trim() );
				return all;
			} );
		}

		$( this )
			.removeClass( "inline-text-blocked" )
			.css( "background-color", "initial" )
			.css( "color", sumRGB( color.substring( color.indexOf( "(" ) + 1, color.indexOf( ")" ) ).split( "," ) ) > 400 ? "rgba( 0, 0, 0, 0.6 )" : color )
			.off();
	} );
} );
