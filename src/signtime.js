/* eslint-disable camelcase */
/**
 * 由
 * https://en.wikipedia.org/w/index.php?title=User:Gary/comments_in_local_time.js&oldid=937247852
 * 及
 * https://zh.wikipedia.org/w/index.php?title=MediaWiki:Gadget-CommentsinLocalTime.js&oldid=52706880
 * 改來
 * 拿來把英文簽名轉成中文
 **/
$( function () {

	var LocalComments = {},
		i = 0;

	LocalComments.disablePages = function () {
		if ( mw.config.get( "wgDiffOldId" ) !== null ) {
			return true;
		}
		return false;
	};

	/**
	 * @type {string[]|RegExp[]}
	 */
	LocalComments.disabledUrls = [ /[?&]action=history[&$]/, /[?&]disable=loco[&$]/ ];

	/**
	 * @type {string[]|RegExp[]}
	 */
	LocalComments.wikiPreviewUrls = [ /[?&]action=edit[&$]/, /[?&]action=submit[&$]/ ];

	if ( typeof ( window.LocalComments ) === "object" ) {
		$.extend( LocalComments, window.LocalComments );
	}

	if ( [ -1, 0, 8 ].indexOf( mw.config.get( "wgNamespaceNumber" ) ) || LocalComments.disablePages() ) {
		return;
	}

	for ( i = 0; i < LocalComments.disabledUrls.length; i++ ) {
		if ( new RegExp( LocalComments.disabledUrls[ i ] ).exec( window.location.href ) ) {
			return;
		}
	}

	var elementId = "bodyContent";

	for ( i = 0; i < LocalComments.wikiPreviewUrls.length; i++ ) {
		if ( new RegExp( LocalComments.wikiPreviewUrls[ i ] ).exec( window.location.href ) ) {
			elementId = "wikiPreview";
		}
	}

	LocalComments.dateformat = {};

	/**
	 * @param {number} year
	 * @param {number} month
	 * @param {number} day
	 * @param {number} hour
	 * @param {number} minute
	 * @return {string}
	 */
	LocalComments.dateformat.zh = function ( year, month, day, hour, minute ) {
		var time = new Date();
		time.setUTCFullYear( year, month - 1, day );
		var day_names = [ "日", "一", "二", "三", "四", "五", "六" ];
		var day_of_the_week = day_names[ time.getDay() ];
		return year + "年" + month + "月" + day + "日 (" + day_of_the_week + ") " + hour + ":" + minute + " (UTC)";
	};

	/**
	 * @param {string} month
	 * @return {string}
	 */
	function en_month( month ) {
		if ( month === "January" ) {
			month = "1";
		} else if ( month === "February" ) {
			month = "2";
		} else if ( month === "March" ) {
			month = "3";
		} else if ( month === "April" ) {
			month = "4";
		} else if ( month === "May" ) {
			month = "5";
		} else if ( month === "June" ) {
			month = "6";
		} else if ( month === "July" ) {
			month = "7";
		} else if ( month === "August" ) {
			month = "8";
		} else if ( month === "September" ) {
			month = "9";
		} else if ( month === "October" ) {
			month = "10";
		} else if ( month === "November" ) {
			month = "11";
		} else if ( month === "December" ) {
			month = "12";
		} else {
			month = "？？？";
		}
		return month;
	}

	/**
	 * @param {string} n
	 * @return {string}
	 */
	function lzh_num( n ) {
		if ( n === "〇" ) {
			n = "0";
		} else if ( n === "一" ) {
			n = "1";
		} else if ( n === "二" ) {
			n = "2";
		} else if ( n === "三" ) {
			n = "3";
		} else if ( n === "四" ) {
			n = "4";
		} else if ( n === "五" ) {
			n = "5";
		} else if ( n === "六" ) {
			n = "6";
		} else if ( n === "七" ) {
			n = "7";
		} else if ( n === "八" ) {
			n = "8";
		} else if ( n === "九" ) {
			n = "9";
		} else if ( n === "" ) {
			n = "";
		} else {
			n = "？？？";
		}
		return n;
	}

	function en_to_zh( all ) {
		var [ , hour, minute, day, month, year ] = /(\d{1,2}):(\d{2}), (\d{1,2}) ([A-Z][a-z]+) (\d{4}) \(UTC\)/g.exec( all );
		month = en_month( month );
		return LocalComments.dateformat.zh( year, month, day, hour, minute );
	}

	function zh_yue_to_zh( _all, year, month, day, hour, minute ) {
		return LocalComments.dateformat.zh( year, month, day, hour, minute );
	}

	function lzh_to_zh( _all, year3, year4, month1, month2, day1, day2, hour1, hour2, minute1, minute2 ) {
		var year = "20" + lzh_num( year3 ) + lzh_num( year4 );
		var month = lzh_num( month1 ) + lzh_num( month2 );
		var day = lzh_num( day1 ) + lzh_num( day2 );
		var hour = lzh_num( hour1 ) + lzh_num( hour2 );
		var minute = lzh_num( minute1 ) + lzh_num( minute2 );
		return LocalComments.dateformat.zh( year, month, day, hour, minute );
	}

	var elem = $( "#" + elementId );

	replace_text( document.getElementById( element_id ), /(\d{1,2}):(\d{2}), (\d{1,2}) ([A-Z][a-z]+) (\d{4}) \(UTC\)/g, en_to_zh );
	replace_text( document.getElementById( element_id ), /(\d{4})年(\d{1,2})月(\d{1,2})號 \([一二三四五六日]\) (\d\d):(\d\d) \(UTC\)/g, zh_yue_to_zh );
	replace_text( document.getElementById( element_id ), /二〇([〇一二三四五六七八九])([〇一二三四五六七八九])年([〇一二]|)([〇一二三四五六七八九])月([〇一二]|)([〇一二三四五六七八九])日 （[一二三四五六日]） ([〇一二])([〇一二三四五六七八九])時([〇一二三四五六])([〇一二三四五六七八九])分 \(UTC\)/g, lzh_to_zh );

	/**
	 * @param {HTMLElement} node
	 * @param {RegExp} search
	 * @param {Function} replace
	 */
	function replacer( node, search, replace ) {
		if ( node.nodeType !== Node.TEXT_NODE ) {
			var value = $( node ).text(),
				matches = search.exec( value );

			if ( matches ) {
				var parent = $( node ).parent();
			}

		} else {
			$( node ).children().each( function () {
				replacer( this, search, replace );
			} );
		}
	}
	/**
	 * @param {HTMLElement} node
	 * @param {RegExp} search
	 * @param {Function} replace
	 */
	function replace_text( node, search, replace ) {
		if ( node.nodeType === 3 ) {
			value = node.nodeValue;
			matches = value.match( search );

			if ( matches !== null ) {
				node_parent_node = node.parentNode;
				old_node = node;
				// old_node_list = node.parentNode.childNodes;

				new_node = document.createDocumentFragment();

				var after_match = value;

				for ( match = 0; match < matches.length; match++ ) {
					var position = after_match.search( search );
					var length = matches[ match ].toString().length;
					var before_match = after_match.substring( 0, position );
					after_match = after_match.substring( position + length );

					first_span = document.createElement( "span" );
					first_span.setAttribute( "style", "white-space: nowrap;" );

					second_span = document.createElement( "span" );
					second_span.setAttribute( "lang", "zh-tw" );
					second_span.setAttribute( "class", "localcomments" );
					second_span.setAttribute( "title", matches[ match ] );
					second_span.appendChild( document.createTextNode( matches[ match ].toString().replace( search, replace ) ) );

					first_span.appendChild( second_span );

					new_node.appendChild( document.createTextNode( before_match ) );
					new_node.appendChild( first_span );

					// new_node_list = new_node.childNodes;
					// old_node_list = new_node_list;
				}

				new_node.appendChild( document.createTextNode( after_match ) );
				node_parent_node.replaceChild( new_node, old_node );
			}
		} else {
			var children = [], child = node.firstChild;
			while ( child ) {
				children[ children.length ] = child;
				child = child.nextSibling;
			}

			for ( var child = 0; child < children.length; child++ ) { replace_text( children[ child ], search, replace ); }
		}
	}

	if ( window.location.href.indexOf( "&disable=loco" ) === -1 ) {
		CommentsInLocalTime();
	}
} );
