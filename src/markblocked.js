/* eslint-disable es5/no-es6-methods */
/* eslint-disable no-use-before-define */
/**
 * 改自 https://zh.wikipedia.org/wiki/MediaWiki:Gadget-markblocked.js?oldid=65626610
 * 到底為甚麼連到其他網站的連結也會被標記成封禁（（（
 * ----------
 * This gadget will pull the user accounts and IPs from the history page
 * and will strike out the users that are currently blocked.
 */
$( function () {
	mw.util.addCSS(
		".user-blocked-temp {" + ( window.mbTempStyle || "opacity: 0.7; text-decoration: line-through" ) + "}" +
		".user-blocked-indef {" + ( window.mbIndefStyle || "opacity: 0.4; font-style: italic; text-decoration: line-through" ) + "}" +
		".user-blocked-partial {" + ( window.mbPartialStyle || "text-decoration: underline; text-decoration-style: dotted" ) + "}" +
		".user-blocked-tipbox {" + ( window.mbTipBoxStyle || "font-size:smaller; background:#FFFFF0; border:1px solid #FEA; padding:0 0.3em; color:#AAA" ) + "}"
	);
	/**
	 * @type {JQuery<HTMLStyleElement>}
	 */
	var waitingCSS = $( "<style>a.userlink {opacity:" + ( window.mbLoadingOpacity || 0.85 ) + "}</style>" );

	function markBlocked( container ) {
		var ipv6Regex = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;

		/**
		 * @type {JQuery<HTMLAnchorElement>}
		 */
		var contentLinks;

		// Collect all the links in the page's content
		if ( container ) {
			contentLinks = $( container ).find( "a" );
		} else if ( mw.util.$content ) {
			contentLinks = mw.util.$content.find( "a" ).add( "#ca-nstab-user a" );
		} else {
			contentLinks = $();
		}

		var lang = mw.config.get( "wgUserLanguage" );

		/**
		 * @type {string}
		 */
		var mbTooltip = typeof window.mbTooltip === "string" ? window.mbTooltip :
			lang === "en" ? "; blocked ($1) by $2: $3 ($4 ago)" : wgULS( "；由$2封禁$1：$3（$4前）", "；由$2封鎖$1：$3（$4前）" );

		/**
		 * @type {string}
		 */
		var mbTooltipPartial = typeof window.mbTooltipPartial === "string" ? window.mbTooltipPartial :
			lang === "en" ? "; partially blocked ($1) by $2: $3 ($4 ago)" : wgULS( "；由$2部分封禁$1：$3（$4前）", "；由$2部分封鎖$1：$3（$4前）" );

		/**
		 * @type {string}
		 */
		var mbInfinity = typeof window.mbInfinity === "string" ? window.mbInfinity :
			lang === "en" ? "infinity" : wgULS( "无限期", "無限期" );

		// Get all aliases for user: & user_talk:
		/**
		 * @type {string[]}
		 */
		var userNS = [];
		for ( var ns in mw.config.get( "wgNamespaceIds" ) ) {
			if ( [ 2, 3 ].indexOf( mw.config.get( "wgNamespaceIds" )[ ns ] ) === -1 ) {
				userNS.push( ns.replace( /_/g, " " ) + ":" );
			}
		}

		// Let wikis that are importing this gadget specify the local alias of Special:Contributions
		/**
		 * @type {string}
		 */
		var contributions = typeof window.markblocked_contributions === "string" ? window.markblocked_contributions :
			"Special:(?:Contribs|Contributions|用户贡献|用戶貢獻|使用者贡献|使用者貢獻)";

		// eslint-disable-next-line camelcase
		window.markblocked_contributions = contributions;

		// RegExp for all titles that are  User:/User_talk:/Special:Contributions/ (for userscripts)
		var userTitleRX = new RegExp( "^(" + userNS.join( "|" ) + "|" + contributions + "\\/)+([^\\/#]+)$", "i" );

		// RegExp for links
		// articleRX also matches external links in order to support the noping template
		var articleRX = new RegExp( mw.config.get( "wgArticlePath" ).replace( "$1", "" ) + "([^#]+)" );
		var scriptRX = new RegExp( "^" + mw.config.get( "wgScript" ) + "\\?title=([^#&]+)" );

		/* eslint-disable jsdoc/valid-types */
		/**
		 * @type {{[x:string]: string[]}}
		 */
		/* eslint-enable jsdoc/valid-types */
		var userLinks = {};
		/**
		 * @type {string}
		 */
		var user;
		/**
		 * @type {string}
		 */
		var url;
		/**
		 * @type {string}
		 */
		var pgTitle;

		// Find all "user" links and save them in userLinks :
		// { 'users': [<link1>, <link2>, ...], 'user2': [<link3>, <link3>, ...], ... }
		contentLinks.each( function ( _i, lnk ) {
			if ( $( lnk ).hasClass( "mw-changeslist-date" ) || $( lnk ).parent( "span" ).hasClass( "mw-history-undo" ) || $( lnk ).parent( "span" ).hasClass( "mw-rollback-link" ) ) {
				return;
			}
			url = $( lnk ).attr( "href" );
			if ( !url ) {
				return;
			} else if ( new URL( url, window.location.origin ).origin !== window.location.origin ) {
				return;
			} else {
				url = new URL( url, window.location.origin ).href.replace( window.location.origin, "" );
			}

			if ( articleRX.exec( url ) ) {
				pgTitle = articleRX.exec( url )[ 1 ];
			} else if ( scriptRX.exec( url ) ) {
				pgTitle = scriptRX.exec( url )[ 1 ];
			} else {
				return;
			}
			pgTitle = decodeURIComponent( pgTitle ).replace( /_/g, " " );
			user = userTitleRX.exec( pgTitle );
			if ( !user ) {
				return;
			}
			user = user[ 2 ];
			if ( ipv6Regex.test( user ) ) {
				user = user.toUpperCase();
			}
			$( lnk ).addClass( "userlink" );
			if ( !userLinks[ user ] ) {
				userLinks[ user ] = [];
			}
			userLinks[ user ].push( lnk );
		} );

		// Convert users into array
		/**
		 * @type {string[]}
		 */
		var users = [];
		for ( var u in userLinks ) {
			users.push( u );
		}

		if ( users.length === 0 ) {
			return;
		}

		waitingCSS.appendTo( $( "head" ) );

		// API request
		var serverTime, apiRequests = 0;
		while ( users.length > 0 ) {
			apiRequests++;
			$.post(
				mw.util.wikiScript( "api" ) + "?format=json&action=query",
				{
					list: "blocks",
					bklimit: 100,
					bkusers: users.splice( 0, 50 ).join( "|" ),
					bkprop: "user|by|timestamp|expiry|reason|restrictions"
					// no need for 'id|flags'
				},
				markLinks
			);
		}

		return; // the end

		// Callback: receive data and mark links
		/* eslint-disable max-len, jsdoc/valid-types */
		/**
		 * @param {{query:{blocks?:{by:string;expiry:string;reason:string;restrictions?:{namespace:number[]};timestamp:string;user:string}[]}}} resp
		 * @param {JQuery.Ajax.SuccessTextStatus} _status
		 * @param {JQuery.jqXHR<{query:{blocks?:{by:string;expiry:string;reason:string;restrictions?:{namespace:number[]};timestamp:string;user:string}[]}}>} xhr
		 * @return {void}
		 */
		/* eslint-enable max-len, jsdoc/valid-types */
		function markLinks( resp, _status, xhr ) {
			serverTime = new Date( xhr.getResponseHeader( "Date" ) );
			/* eslint-disable max-len */
			/**
			 * @type {{by:string;expiry:string;reason:string;restrictions?:{namespace:number[]};timestamp:string;user:string}[]}
			 */
			var list;
			/**
			 * @type {{by:string;expiry:string;reason:string;restrictions?:{namespace:number[]};timestamp:string;user:string}}
			 */
			/* eslint-enable max-len */
			var blk;
			/**
			 * @type {string}
			 */
			var tip;
			/**
			 * @type {string[]}
			 */
			var links;
			/**
			 * @type {string}
			 */
			var lnk;
			/**
			 * @type {string}
			 */
			var clss;
			/**
			 * @type {string}
			 */
			var blTime;
			if ( !resp || !resp.query || !resp.query.blocks ) {
				return;
			}

			list = resp.query.blocks;

			for ( var i = 0; i < list.length; i++ ) {
				blk = list[ i ];
				// Partial block
				var partial = blk.restrictions && !Array.isArray( blk.restrictions );
				if ( /^in/.test( blk.expiry ) ) {
					clss = partial ? "partial" : "indef";
					blTime = blk.expiry;
				} else {
					clss = partial ? "partial" : "temp";
					blTime = inHours( parseTS( blk.expiry ) - parseTS( blk.timestamp ) );
				}
				tip = mbTooltip;
				if ( partial ) {
					tip = mbTooltipPartial;
				}
				tip = tip.replace( "$1", blTime ).replace( "infinity", mbInfinity )
					.replace( "$2", blk.by )
					.replace( "$3", blk.reason )
					.replace( "$4", inHours( serverTime - parseTS( blk.timestamp ) ) );
				links = userLinks[ blk.user ];
				// eslint-disable-next-line no-unmodified-loop-condition
				for ( var k = 0; links && k < links.length; k++ ) {
					lnk = $( links[ k ] );
					// eslint-disable-next-line mediawiki/class-doc
					lnk = lnk.addClass( "user-blocked-" + clss );
					if ( window.mbTipBox ) {
						$( "<span class=\"user-blocked-tipbox\">#</span>" ).attr( "title", tip ).insertBefore( lnk );
					} else {
						lnk.attr( "title", lnk.attr( "title" ) + tip );
					}
				}
			}

			if ( --apiRequests === 0 ) { // last response
				waitingCSS.remove();
				$( "#ca-showblocks" ).parent().remove(); // remove added portlet link
			}

		}

		// --------AUX functions

		// 20081226220605  or  2008-01-26T06:34:19Z   -> date
		function parseTS( ts ) {
			var m = ts.replace( /\D/g, "" ).match( /(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/ );
			return new Date( Date.UTC( m[ 1 ], m[ 2 ] - 1, m[ 3 ], m[ 4 ], m[ 5 ], m[ 6 ] ) );
		}

		function inHours( ms ) { // milliseconds -> "2:30" or 5,06d or 21d
			var mm = Math.floor( ms / 60000 );
			if ( !mm ) {
				return Math.floor( ms / 1000 ) + "秒";
			}
			var hh = Math.floor( mm / 60 );
			mm = mm % 60;
			var dd = Math.floor( hh / 24 );
			hh = hh % 24;
			if ( dd ) {
				if ( dd < 10 && hh ) {
					return dd + "日" + hh + "小時";
				}
				return dd + "日";
			}
			return hh + "小時" + zz( mm ) + "分";
		}

		function zz( v ) { // 6 -> '06'
			if ( v <= 9 ) {
				v = "0" + v;
			}
			return v;
		}
	}// -- end of main function

	// Start on some pages
	switch ( mw.config.get( "wgAction" ) ) {
		case "edit":
		case "submit":
			break;
		default:
			if ( mw.config.get( "wgNamespaceNumber" ) === 0 && mw.config.get( "wgAction" ) === "view" ) {
				break;
			}

			$.when( $.ready, mw.loader.using( "mediawiki.util" ) ).then( function () {
				if ( window.mbNoAutoStart ) {
					var portletLink = mw.util.addPortletLink( "p-cactions", "", "XX", "ca-showblocks" );
					$( portletLink ).on( "click", function ( e ) {
						e.preventDefault();
						markBlocked();
					} );
				} else {
					mw.hook( "wikipage.content" ).add( markBlocked );
				}
			} );
	}
} );
