if ( !mw.loader.getCSS ) {
	mw.loader.getCSS = function ( url ) {
		return $.ajax( url, {
			dataType: "text",
			cache: !0
		} ).done( function ( css ) {
			mw.util.addCSS( css );
		} ).catch( function () {
			throw new Error( "Failed to load script" );
		} );
	};
}
