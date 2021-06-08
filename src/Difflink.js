/*!
 * Difflink.js
 * https://meta.wikimedia.org//wiki/User:Sunny00217/Difflink.js
 * Cover from https://zh.wikipedia.org/w/index.php?title=MediaWiki:Gadget-Difflink.js&oldid=63763124
 *
 * Released under GPL v3 license
 */
$.when(
	mw.loader.getScript( "//meta.wikimedia.org/w/index.php?title=User:Sunny00217/wgULS.js&action=raw&ctype=text/javascript" ),
	mw.loader.using( [ "mediawiki.util", "mediawiki.widgets", "oojs-ui" ] )
).then( function () {
	if (
		!(
			( mw.config.get( "wgAction" ) === "view" && mw.config.get( "wgArticleId" ) && mw.config.get( "wgRevisionId" ) ) ||
			( mw.config.get( "wgDiffNewId" ) && mw.config.get( "wgDiffOldId" ) )
		)
	) {
		return;
	}

	var defaultTex = [ wgULS( "版本差异", "版本差異" ), "固定版本" ],
		txts = [ wgULS( "当前差异链接", "當前差異連結" ), wgULS( "当前修订链接", "當前修訂連結" ) ],
		decs = [
			wgULS( "复制链接到当前差异版本的维基语法", "複製連結到當前差異版本的維基語法" ),
			wgULS( "复制链接到当前修订版本的维基语法", "複製連結到當前修訂版本的維基語法" )
		],
		diff, oldid, t1, t2, t3,
		mod, tex, txt, dec;

	if ( mw.config.get( "wgDiffNewId" ) ) {
		mod = 0;
	} else {
		mod = 1;
	}

	tex = window.difflink instanceof Array && typeof window.difflink[ mod ] === "string" && window.difflink[ mod ] !== "" ?
		window.difflink[ mod ] :
		defaultTex[ mod ];

	txt = txts[ mod ];
	dec = decs[ mod ];

	var link = mw.util.addPortletLink( mw.config.get( "skin" ) === "minerva" ? "p-tb" : "p-cactions", "", txt, "t-difflink", dec );

	function reloadlink() {
		diff = mw.config.get( "wgDiffNewId" );
		oldid = mw.config.get( "wgDiffOldId" ) || mw.config.get( "wgRevisionId" );

		if ( diff ) {
			t1 = "Special:Diff/" + oldid + "/" + diff;
			if (
				mw.config.get( "wgCanonicalSpecialPageName" ) !== "ComparePages" && /** For [[Special:ComparePages]] **/
				!$( "td" ).is( ".diff-multi" )
			) {
				new mw.Api().get( {
					action: "compare",
					fromrev: diff,
					torelative: "prev",
					prop: "ids"
				} ).done( function ( data ) {
					// eslint-disable-next-line max-len
					if ( data.compare && data.compare.torevid === diff && data.compare.fromrevid === oldid ) {
						t1 = "Special:Diff/" + diff;
					}
				} );
			}
		} else {
			t1 = "Special:PermaLink/" + oldid;
		}
	}

	reloadlink();

	$( link ).on( "click", function ( e ) {
		e.preventDefault();
		var $dom = $( "<div>" );
		t2 = "[[" + t1 + "]]";
		t3 = "[[" + t1 + "|" + tex + "]]";

		[ t1, t2, t3 ].forEach( function ( v ) {
			$dom.append( new mw.widgets.CopyTextLayout( { copyText: v } ).$element );
		} );

		if ( /(Android|iPhone|Mobile)/i.test( navigator.userAgent ) ) {
			OO.ui.alert( $dom );
		} else {
			OO.ui.alert( $dom, { size: "medium" } );
		}
	} );

	mw.hook( "wikipage.content" ).add( reloadlink );
} );
