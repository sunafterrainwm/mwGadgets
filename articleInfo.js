// from https://zh.wikipedia.org/wiki/User:AnYiLin/js/ArticleInfo-wikimirror.js?oldid=64787252
( function ( mw ) {
	var dom = $( "#contentSub" );
	if (
		dom.length > 0 &&
		mw.config.get( "wgAction" ) === "view" &&
		mw.config.get( "wgIsArticle" ) &&
		mw.config.get( "wgCurRevisionId" ) !== 0 &&
		mw.config.get( "wgRevisionId" ) !== 0 &&
		mw.config.get( "wgCurRevisionId" ) === mw.config.get( "wgRevisionId" )
	) {
		$.ajax( {
			url: "https://xtools.wmflabs.org/api/page/articleinfo/" + mw.config.get( "wgDBname" ) + "/" +
				mw.config.get( "wgPageName" ).replace( /["?%&+]/g, escape ) + "?format=html&uselang=" + mw.config.get( "wgUserLanguage" ),
			success: function ( html ) {
				dom.before(
					$( "<div id=\"xtools\" style=\"font-size:84%;line-height:1.2em;width:auto\">" ).append(
						$( "<span id=\"xtools_result\">" ).html( html )
					)
				);
			}
		} );
	}
}( mw ) );
