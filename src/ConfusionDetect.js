$( function () {
	if (
		mw.config.get( "wgCanonicalSpecialPageName" ) !== "Blankpage" ||
		mw.config.get( "wgPageName" ).split( "/" )[ 1 ] !== "ConfusionDetect"
	) {
		return;
	}

	$( "h1#firstHeading" ).text( wgULS( "页面标题繁简混杂检查", "頁面標題繁簡混雜檢查" ) );

	var oldTitle = document.title,
		wikiTitle = oldTitle.split( "-" );

	document.title = wgULS( "页面标题繁简混杂检查", "頁面標題繁簡混雜檢查" ) +
		( wikiTitle.length > 1 ? ( " - " + wikiTitle[ wikiTitle.length - 1 ].trim() ) : "" );

	mw.util.addCSS(
		".confusion-detect-hidden { display: none; }" +
		"#confusion-detect-log .confusion-detect-log-success { color: #55aa55; }" +
		"#confusion-detect-log .confusion-detect-log-warning { color: #ccaa00; }" +
		"#confusion-detect-log .confusion-detect-log-error { color: #ff0000; }" +
		"#confusion-detect-query .confusion-detect-query-warning { color: #ff0000; }"
	);

	$( "#mw-content-text" ).html( "<div id=\"confusion-detect-setting\">" +
		"<p>" +
		wgULS(
			"此小工具能搜索指定标题开头的页面是否繁简混杂，若要搜寻某页的子页面请填入该页的标题并加上<code>/</code>",
			"此小工具能搜索指定標題開頭的頁面是否繁簡混雜，若要搜尋某頁的子頁面請填入該頁的標題並加上 <code>/</code> "
		) +
		"</p>" +
		"<label>" + wgULS( "前缀：", "前綴：" ) + "<input type=\"text\" id=\"confusion-detect-prefix\"></label><br />" +
		"<label>" +
			"<input type=\"checkbox\" checked id=\"confusion-detect-donotshownoconfusion\">" +
			wgULS( "不显示没有繁简混杂的标题", "不顯示沒有繁簡混雜的標題" ) +
		"</label>" +
		"<br />" +
		"<a id=\"confusion-detect-start\">" + wgULS( "[开始]", "[開始]" ) + "</a>" +
	"</div>" )
		.append(
			"<hr class=\"confusion-detect-hidden\" />" +
			"<div id=\"confusion-detect-log\" class=\"confusion-detect-hidden\"></div>" +
			"<div id=\"confusion-detect-query\"></div>"
		);

	function log( msg, type ) {
		switch ( type ) {
			case 0:
				type = "success";
				break;
			case 1:
				type = "warning";
				break;
			case 2:
				type = "error";
				break;
			default:
				type = "info";
				break;
		}
		$( "#confusion-detect-log" ).append( "<p class=\"confusion-detect-log-" + type + "\">" + msg + "</p>" );
	}

	$( "#confusion-detect-start" ).on( "click", function ( e ) {
		e.preventDefault();
		$( "#confusion-detect-query" ).html( "" );
		if ( $( "#confusion-detect-prefix" ).val().trim() === "" ) {
			log( wgULS( "你没有填入标题！", "你沒有填入標題！" ), 1 );
			return;
		}
		var prefix = String( $( "#confusion-detect-prefix" ).val() ).trim();
		$( ".confusion-detect-hidden" ).removeClass( "confusion-detect-hidden" );
		log( wgULS( "正在搜索标题......", "正在搜尋標題......" ), -1 );
		var Api = new mw.Api();
		Api.get( {
			action: "query",
			prop: "revisions",
			titles: prefix,
			rvprop: []
		} ).then( function ( data ) {
			if ( !data || !data.query || !data.query.pages ) {
				if ( data.query.interwiki ) {
					log( wgULS( "错误：本工具无法处理跨维基之标题", "錯誤：本工具無法處理跨維基之標題" ), 2 );
				} else {
					log( wgULS( "无法识别的错误：", "無法識別的錯誤：" ) + JSON.stringify( data ), 2 );
					mw.log.error( "Unrecognized error:", data );
				}
				throw new Error();
			}
			var nsid = -3;
			$.each( data.query.pages, function ( _i, pageinfo ) {
				if ( typeof pageinfo.ns === "number" ) {
					nsid = pageinfo.ns;
				}
			} );

			if ( nsid < 0 ) {
				log( wgULS( "错误：输入标题无效", "錯誤：輸入標題無效" ), 2 );
				throw new Error();
			} else if ( nsid > 0 ) {
				prefix = prefix.replace( /^[^:]+:/, "" );
			}

			/**
			 * @type {JQuery.Deferred[]}
			 */
			var deferreds = [];

			/**
			 * @type {string[]}
			 */
			var list = [];

			function query( apcontinue ) {
				deferreds.push( Api.get( {
					action: "query",
					list: "allpages",
					apprefix: prefix,
					apnamespace: nsid,
					apcontinue: apcontinue,
					apfilterredir: "all",
					aplimit: 500,
					apdir: "ascending"
				// eslint-disable-next-line no-shadow
				} ).then( function ( data ) {
					if ( !data || !data.query || !data.query.allpages ) {
						log( wgULS( "无法识别的错误：", "無法識別的錯誤：" ) + JSON.stringify( data ), 2 );
						mw.log.error( "Unrecognized error:", data );
						throw new Error();
					}
					$.each( data.query.allpages, function ( _i, allpage ) {
						list.push( allpage.title );
					} );
					if ( data.continue && data.continue.apcontinue ) {
						query( "apcontinue" );
					} else {
						// eslint-disable-next-line no-use-before-define
						parsetitles();
					}
				} ).catch( function ( err ) {
					log( wgULS( "错误：", "錯誤：" ) + err, 2 );
					mw.log.error( "Unrecognized error:", $.makeArray( arguments ) );
					throw new Error();
				} ) );
			}

			query();

			function parsetitles() {
				$.when.apply( $, deferreds ).then( function () {
					var $ul = $( "<ul>" ),
						parser = "";
					if ( !$( "#confusion-detect-donotshownoconfusion" ).prop( "checked" ) ) {
						$ul.appendTo( $( "#confusion-detect-query" ) );
					}
					$.each( list, function ( i, title ) {
						$ul.append(
							$( "<li id=\"confusion-detect-query-" + i + "\">" )
								.append( $( "<a href=\"/wiki/" + mw.util.wikiUrlencode( title ) + "\">" ).text( title ) )
						);
						parser += "<li id=\"confusion-detect-query-" + i + "\">" + title + "</li>";
					} );

					log( wgULS( "正在处理标题......", "正在處理標題......" ), -1 );

					$.when(
						Api.parse( "<ul>" + parser + "<ul>", {
							uselang: "zh-hans"
						} ),
						Api.parse( "<ul>" + parser + "<ul>", {
							uselang: "zh-hant"
						} )
					).then( function ( hans, hant ) {
						var sHtml = $( $.parseHTML( hans ) ).find( "li" ),
							tHtml = $( $.parseHTML( hant ) ).find( "li" );

						$.each( list, function ( i, title ) {
							var s = $( sHtml.get( i ) ).html(),
								t = $( tHtml.get( i ) ).html();

							if ( title !== s && title !== t ) {
								$ul.find( "#confusion-detect-query-" + i )
									.append( " <span class=\"confusion-detect-query-warning\">" + wgULS( "疑似繁简混杂", "疑似繁簡混雜" ) + "</span>" );
							} else if ( $( "#confusion-detect-donotshownoconfusion" ).prop( "checked" ) ) {
								$ul.find( "#confusion-detect-query-" + i ).remove();
							}
						} );

						if ( $( "#confusion-detect-donotshownoconfusion" ).prop( "checked" ) ) {
							$ul.appendTo( $( "#confusion-detect-query" ) );
						}

						log( wgULS( "完成。", "完成。" ), 0 );
					} );
				} );
			}
		} ).catch( function ( err ) {
			if ( !( err instanceof Error ) || err.constructor !== Error ) {
				log( wgULS( "错误：", "錯誤：" ) + err, 2 );
				mw.log.error( "Unrecognized error:", $.makeArray( arguments ) );
			}
		} );
	} );
} );
