// from https://zh.wikipedia.org/wiki/MediaWiki:Gadget-SpecialWikitext.js?oldid=65783997
/* eslint-disable camelcase */
// <nowiki>
mw.loader.using( "ext.gadget.site-lib" ).then( function () {
	if ( mw.config.get( "wgPageContentModel" ) === "wikitext" && [ "Delete", "Undelete" ].indexOf( mw.config.get( "wgCanonicalSpecialPageName" ) ) ) {
		return;
	}

	var toString = function ( value ) {
		return String( value );
	};

	/* =======================================
	 * 跟[[Module:Special wikitext]]保持一致的段落。
	 * ======================================= */
	var wikiTextKey = "_addText";

	var Parser = {};

	/**
	 * 使用頁面內容模型來判斷格式
	 *
	 * @param {string} input_string
	 * @param {string} content_model
	 * @return {string}
	 */
	Parser.check = function ( input_string, content_model ) {
		content_model = toString( content_model || mw.config.get( "wgPageContentModel" ) ).toLowerCase();
		// 根據文檔格式選用適當的解析模式
		switch ( content_model ) {
			case "json":
				return Parser.getJSONwikitext( input_string );
			case "js":
			case "javascript":
				return Parser.getJSwikitext( input_string );
			case "css":
			case "sanitized-css":
				return Parser.getCSSwikitext( input_string );
		}
		// 若不是json、js、css則返回空字串
		return "";
	};

	/**
	 * 合併多個wikitext字串，並以換行分隔
	 *
	 * @param {string} input_str
	 * @param {string} new_str
	 * @param {boolean} [escape]
	 * @return {string}
	 */
	Parser.addText = function ( input_str, new_str, escape ) {
		if ( new_str !== "" ) {
			if ( input_str !== "" ) {
				input_str += "\n";
			}
			var text = new_str;
			if ( escape ) {
				/**
				 * @type {string}
				 */
				var escape_str = JSON.parse( "[" + JSON.stringify(
					// Lua不支援\u、\x的跳脫符號；排除相關轉換
					toString( new_str ).replace( /\\([ux])/ig, "$1" )
				).replace( /\\/g, "\\" ) + "]" )[ 0 ];
				text = escape_str;
			}
			input_str += text;
		}
		return input_str;
	};

	/**
	 * 讀取wikitext字串，清除其中的跳脫字元，並忽略註解尾部
	 *
	 * @param {string} str
	 * @return {string}
	 */
	Parser.getString = function ( str ) {
		var test_str = /[^\n]*\*\//.exec( str );
		if ( test_str ) {
			test_str = test_str[ 0 ] || "";
			test_str = test_str.substr( 0, test_str.length - 2 );
		} else {
			test_str = str;
		}

		var trim_check = test_str.trim();
		var first_char = trim_check.charAt( 0 );
		if ( first_char === trim_check.charAt( trim_check.length - 1 ) && ( first_char === "'" || first_char === "\"" ) ) {
			return trim_check.substr( 1, trim_check.length - 2 );
		} else {
			return test_str;
		}
	};

	/**
	 * 讀取CSS之 ```_addText{content："XXX"}``` 模式的字串
	 *
	 * @param {string} str
	 * @return {string}
	 */
	Parser.getContentText = function ( str ) {
		var wikitext = "";
		try {
			str.replace( new RegExp( wikiTextKey + "\\s*\\{[^c\\}]*content\\s*:\\s*[^\\n]*", "g" ), function ( text ) {
				var temp_text = ( /content\s*:\s*[^\n]*/.exec( text ) || [ "content:" ] )[ 0 ]
					.replace( /^[\s\uFEFF\xA0\t\r\n\f ;}]+|[\s\uFEFF\xA0\t\r\n\f ;}]+$/g, "" )
					.replace( /\s*content\s*:\s*/, "" );
				if ( wikitext !== "" ) {
					wikitext += "\n";
				}
				wikitext += Parser.getString( temp_text );
				return text;
			} );
		} catch ( ex ) { }
		return wikitext;
	};

	/**
	 * 讀取物件定義模式為 ```_addText＝XXX``` 或 ```_addText：XXX``` 模式的字串
	 *
	 * @param {string} str
	 * @return {string}
	 */
	Parser.getObjText = function ( str ) {
		var wikitext = "";
		try {
			str.replace( new RegExp( wikiTextKey + "\\s*[\\=:]\\s*[^\n]*", "g" ), function ( text ) {
				var temp_text = text.replace( /^[\s\uFEFF\xA0\t\r\n\f ;}]+|[\s\uFEFF\xA0\t\r\n\f ;}]+$/g, "" )
					.replace( new RegExp( wikiTextKey + "\\s*[\\=:]\\s*" ), "" );
				if ( wikitext !== "" ) {
					wikitext += "\n";
				}
				wikitext += Parser.getString( temp_text );
				return text;
			} );
		} catch ( ex ) {}
		return wikitext;
	};

	/**
	 * 分析CSS中符合條件的wikitext
	 *
	 * @param {string} input_string
	 * @return {string}
	 */
	Parser.getCSSwikitext = function ( input_string ) {
		var wikitext = "";
		var css_text = input_string || $( "#wpTextbox1" ).val() || "";
		if ( css_text.trim() === "" ) {
			return "";
		}
		// 匹配 _addText { content："XXX" } 模式
		wikitext = Parser.addText( wikitext, Parser.getContentText( css_text ), true );
		// 同時亦匹配 /* _addText：XXX */ 模式
		wikitext = Parser.addText( wikitext, Parser.getObjText( css_text ) );
		return wikitext;
	};

	/**
	 * 分析JavaScript中符合條件的wikitext
	 *
	 * @param {string} input_string
	 * @return {string}
	 */
	Parser.getJSwikitext = function ( input_string ) {
		var wikitext = "";
		var js_text = input_string || $( "#wpTextbox1" ).val() || "";
		if ( js_text.trim() === "" ) {
			return "";
		}
		wikitext = Parser.addText( wikitext, Parser.getObjText( js_text ) );
		return wikitext;
	};

	/**
	 * 分析JSON中符合條件的wikitext
	 *
	 * @param {string} input_string
	 * @return {string}
	 */
	Parser.getJSONwikitext = function ( input_string ) {
		var wikitext = "";
		var json_text = input_string || $( "#wpTextbox1" ).val() || "";
		if ( json_text.trim() === "" ) {
			return "";
		}
		try {
			var json_data = JSON.parse( json_text );
			Object.keys( json_data ).forEach( function ( key ) {
				var k = key, v = json_data[ key ];
				if ( new RegExp( wikiTextKey ).exec( k ) && typeof ( v ) === "string" ) {
					wikitext = Parser.addText( wikitext, v );
				}
				// 如果是陣列物件會多包一層
				if ( typeof ( v ) !== "string" ) {
					for ( var prop in v ) {
						var testArr_k = prop, testArr_v = v[ prop ];
						if ( new RegExp( wikiTextKey ).exec( testArr_k ) && typeof ( testArr_v ) === "string" ) {
							wikitext = Parser.addText( wikitext, testArr_v );
						}
					}
				}
			} );
		} catch ( ex ) {}
		return wikitext;
	};

	// 本行以上的算法請跟[[Module:Special wikitext]]保持一致。

	/* =======================================
	 * 程式主要部分
	 * ======================================= */

	Parser.Api = new mw.Api( {
		ajax: {
			headers: {
				"Api-User-Agent": "SpecialWikitext/1.0 (" + mw.config.get( "wgWikiID" ) + ")"
			}
		}
	} );

	var $notice_loading = Parser.$notice_loading = "<div class=\"quotebox\" style=\"margin: auto; width: 50%; padding: 6px; border: 1px solid rgb(170, 170, 170); font-size: 88%; background-color: rgb(249, 249, 249);\"><div id=\"mw-addText-preview-loading-content\" style=\"background-color: rgb(249, 249, 249); color: rgb(0, 0, 0); text-align: center; font-size: larger;\"><img decoding=\"async\" data-file-width=\"32\" data-file-height=\"32\" width=\"32\" height=\"32\" src=\"//upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif\"><span>預覽載入中...</span></div></div>";

	var $notice_fail = Parser.$notice_fail = "<img decoding=\"async\" data-file-height=\"48\" width=\"32\" height=\"32\" src=\"//upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gnome-dialog-warning2.svg/32px-Gnome-dialog-warning2.svg.png\" srcset=\"//upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gnome-dialog-warning2.svg/48px-Gnome-dialog-warning2.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gnome-dialog-warning2.svg/64px-Gnome-dialog-warning2.svg.png 2x\"><span>預覽載入失敗</span>";

	/**
	 * 加入預覽分類
	 *
	 * @param {string} wikiText
	 * @param {string} pagename
	 * @param {boolean} is_preview
	 */
	Parser.addCategory = function ( wikiText, pagename, is_preview ) {
		if ( !wikiText ) {
			return;
		}

		wikiText = toString( wikiText );

		var params = {
			action: "parse",
			uselang: mw.config.get( "wgUserVariant" ),
			useskin: mw.config.get( "skin" ),
			title: pagename,
			text: wikiText,
			contentmodel: "wikitext",
			prop: "categorieshtml",
			format: "json"
		};

		if ( is_preview ) {
			params.preview = 1;
			params.disableeditsection = 1;
		}

		Parser.Api.get( params ).done( function ( data ) {
			if ( !data || !data.parse || !data.parse.categorieshtml ) {
				return;
			}

			$( "#catlinks" ).before( data.parse.categorieshtml[ "*" ] ).remove();
		} ).fail( function () {
			return;
		} );
	};

	/**
	 * 檢查對應selector的網頁物件是否存在
	 *
	 * @param {HTMLElement[]|HTMLElement} selectors
	 * @return {boolean}
	 */
	Parser.elementExist = function ( selectors ) {
		var selector_array = Array.isArray( selectors ) ?
			selectors : ( selectors ? [ selectors ] : [] );
		var ele_count = 0;
		for ( var i in selector_array ) {
			ele_count += ( $( selector_array[ i ] ) || [] ).length;
		}
		return ele_count > 0;
	};

	/**
	 * 檢查mediaWiki的設置
	 *
	 * @param {string} checkTarget
	 * @param {string} mwConfigs
	 * @return {string}
	 */
	Parser.checkMwConfig = function ( checkTarget, mwConfigs ) {
		var mwConfigData = mw.config.get( checkTarget );
		if ( !mwConfigData || ( toString( mwConfigData ).trim() === "" ) ) {
			return false;
		}
		mwConfigData = toString( mwConfigData ).toLowerCase();
		var mwConfig_array = Array.isArray( mwConfigs ) ?
			mwConfigs : ( mwConfigs ? [ mwConfigs ] : [] );
		return mwConfig_array.indexOf( mwConfigData ) > -1;
	};

	/**
	 * 將解析後的wikitext加入頁面中
	 *
	 * @param {string} parsedWikitext
	 */
	Parser.addParsedWikitext = function ( parsedWikitext ) {
		var html_obj = $( parsedWikitext );
		if ( Parser.elementExist( "#mw-_addText-preview-loading" ) ) {
			$( "#mw-_addText-preview-loading" ).html( parsedWikitext );
		} else if ( Parser.elementExist( ".diff-currentversion-title" ) ) {
			html_obj.insertAfter( ".diff-currentversion-title" );
		} else if ( Parser.elementExist( ".previewnote" ) ) {
			html_obj.insertAfter( ".previewnote" );
		} else if ( Parser.elementExist( "#mw-undelete-revision" ) ) {
			html_obj.insertAfter( "#mw-undelete-revision" );
		} else if ( Parser.elementExist( "#mw-content-text" ) ) {
			html_obj.insertBefore( "#mw-content-text" );
		}
	};

	/**
	 * 如果網頁物件存在，則改動其html內容
	 *
	 * @param {string} selector
	 * @param {string} html_content
	 */
	Parser.setHtml = function ( selector, html_content ) {
		if ( Parser.elementExist( selector ) ) {
			$( selector ).html( html_content );
		}
	};

	/**
	 * 加入[載入中]的提示
	 */
	Parser.addLoadingNotice = function () {
		if ( $notice_loading ) {
			Parser.addParsedWikitext( $notice_loading );
		}
	};

	/**
	 * 載入錯誤的提示
	 */
	Parser.loadingFailNotice = function () {
		Parser.setHtml( "#mw-_addText-preview-loading-content", $notice_fail );
	};

	/**
	 * 移除[載入中]的提示
	 */
	Parser.removeLoadingNotice = function () {
		Parser.setHtml( "#mw-_addText-preview-loading", "" );
	};

	/**
	 * 檢查是否有預覽的必要性
	 *
	 * @return {boolean}
	 */
	Parser.needPreview = function () {
		return document.body.innerHTML.search( "_addText" ) > -1;
	};

	/**
	 * 加入預覽內容
	 *
	 * @param {string} wikiText
	 * @param {string} pagename
	 * @param {boolean} is_preview
	 */
	Parser.addWikiText = function ( wikiText, pagename, is_preview ) {
		if ( toString( wikiText ).trim() !== "" ) {
			var expandparams = {
				action: "expandtemplates",
				uselang: mw.config.get( "wgUserVariant" ),
				useskin: mw.config.get( "skin" ),
				title: pagename,
				text: wikiText,
				prop: "wikitext",
				format: "json"
			};

			var parseparams = {
				action: "parse",
				uselang: mw.config.get( "wgUserVariant" ),
				useskin: mw.config.get( "skin" ),
				title: "Wikipedia:沙盒/SpecialWikitextParse",
				contentmodel: "wikitext",
				prop: "text",
				format: "json"
			};

			if ( is_preview ) {
				parseparams.preview = 1;
				parseparams.disableeditsection = 1;
			}

			Parser.Api.post( expandparams ).done( function ( expdata ) {
				if ( !expdata || !expdata.expandtemplates || !expdata.expandtemplates.wikitext ) {
					Parser.loadingFailNotice();
					return;
				}

				if ( toString( expdata.expandtemplates.wikitext || "" ).trim() === "" ) {
					Parser.removeLoadingNotice();
					return;
				}

				parseparams.text = expdata.expandtemplates.wikitext;

				Parser.Api.post( parseparams ).done( function ( data ) {
					if ( !data || !data.parse || !data.parse.text || !data.parse.text[ "*" ] ) {
						Parser.loadingFailNotice();
						return;
					}
					var parsed_wiki = toString( data.parse.text[ "*" ] || "" ).trim();
					if ( parsed_wiki !== "" ) {
						Parser.addParsedWikitext( parsed_wiki );
						Parser.addCategory( wikiText, pagename, is_preview );
					} else {
						Parser.removeLoadingNotice();
					}
				} ).fail( function () {
					Parser.loadingFailNotice();
				} );
			} ).fail( function () {
				Parser.loadingFailNotice();
			} );
		} else {
			Parser.removeLoadingNotice();
		}
	};

	/**
	 * 加入預覽的Lua內容
	 *
	 * @param {string} wikiText
	 * @param {string} pagename
	 * @param {boolean} ispreview
	 * @param {(parsed_wiki: string) => void} [callback]
	 */
	Parser.addLuaText = function ( wikiText, pagename, ispreview, callback ) {
		var temp_module_name = "AddText/Temp/Module/Data.lua";
		var module_call = {
			wikitext: "#invoke:", // 分開來，避免被分到[[:Category:有脚本错误的页面]]
			pagename: "Module:"
		};
		if ( toString( wikiText ).trim() !== "" ) {
			var params = {
				action: "parse",
				format: "json",
				uselang: mw.config.get( "wgUserVariant" ),
				useskin: mw.config.get( "skin" ),
				title: pagename,
				text: "{{" + module_call.wikitext + temp_module_name + "|main}}",
				prop: "text",
				contentmodel: "wikitext",
				templatesandboxtitle: module_call.pagename + temp_module_name,
				// 產生臨時Lua Module
				templatesandboxtext: "return {main=function()\nxpcall(function()\n" + wikiText + "\nend,function()end)\nlocal moduleWikitext = package.loaded[\"Module:Module wikitext\"]\nif moduleWikitext then\nlocal wikitext = moduleWikitext.main()\nif mw.text.trim(wikitext)~=''then\nreturn mw.getCurrentFrame():preprocess(moduleWikitext.main())\nend\nend\nreturn ''\nend}",
				templatesandboxcontentmodel: "Scribunto",
				templatesandboxcontentformat: "text/plain"
			};
			if ( ispreview ) {
				params.preview = 1;
				params.disableeditsection = 1;
			}

			Parser.Api.get( params ).done( function ( data ) {
				if ( !data || !data.parse || !data.parse.text || !data.parse.text[ "*" ] ) {
					Parser.loadingFailNotice();
					return;
				}
				var parsed_wiki = toString( data.parse.text[ "*" ] || "" ).trim();
				if ( parsed_wiki !== "" ) {
					// 若出錯在這個臨時模組中則取消
					if ( $( parsed_wiki ).find( ".scribunto-error" ).text().search( temp_module_name ) < 0 ) {
						if ( typeof callback === "function" ) {
							callback( parsed_wiki );
						} else {
							Parser.addParsedWikitext( parsed_wiki );
						}
					} else {
						Parser.removeLoadingNotice();
					}
				} else {
					Parser.removeLoadingNotice();
				}
			} ).fail( function () {
				Parser.loadingFailNotice();
			} );
		} else {
			Parser.removeLoadingNotice();
		}
	};

	/**
	 * 從頁面當前歷史版本取出 _addText
	 *
	 * @param {number} revisionId
	 * @param {string} current_page_name
	 */
	Parser.applyRevision = function ( revisionId, current_page_name ) {
		Parser.Api.get( {
			action: "parse", // get the original wikitext content of a page
			oldid: revisionId || mw.config.get( "wgRevisionId" ),
			prop: "wikitext",
			format: "json"
		} ).done( function ( data ) { // 若取得 _addText 則顯示預覽
			if ( !data || !data.parse || !data.parse.wikitext || !data.parse.wikitext[ "*" ] ) {
				Parser.loadingFailNotice();
				return;
			}
			var page_content = Parser.check( toString( data.parse.wikitext[ "*" ] || "" ).trim() );
			page_content = ( Parser.elementExist( "#mw-clearyourcache" ) ? "{{#invoke:Special wikitext/Template|int|clearyourcache}}" : "" ) +
				page_content;
			if ( page_content.trim() !== "" ) {
				Parser.addWikiText( page_content, current_page_name );
			} else {
				Parser.removeLoadingNotice();
			}
		} ).fail( function () {
			Parser.removeLoadingNotice();
		} );
	};

	/**
	 * 加入編輯提示 (如果存在)
	 *
	 * @param {string} current_page_name
	 * @param {string} pagesubname
	 */
	Parser.applyNotice = function ( current_page_name, pagesubname ) {
		Parser.Api.get( {
			action: "parse", // get the original wikitext content of a page
			uselang: mw.config.get( "wgUserVariant" ),
			useskin: mw.config.get( "skin" ),
			title: current_page_name + pagesubname,
			text: "{{#invoke:Special wikitext/Template|getNotices|" + current_page_name + "|" + pagesubname + "}}",
			prop: "text",
			format: "json"
		} ).done( function ( data ) {
			if ( !data || !data.parse || !data.parse.text || !data.parse.text[ "*" ] ) {
				return;
			}
			var html = data.parse.text[ "*" ];
			if ( $( toString( html ) ).text().trim() !== "" ) {
				Parser.addParsedWikitext( html );
			}
		} );
	};

	/* =======================================
	 * 測試樣例
	 * ======================================= */
	/**
	 * 本腳本的Testcase模式
	 *
	 * @param {boolean} is_preview
	 * @return {void}
	 */
	Parser.wikitextPreviewTestcase = function ( is_preview ) {

		// 沒有可預覽元素，退出。
		if ( !Parser.needPreview() ) {
			return;
		}

		var testcase_list = $( ".special-wikitext-preview-testcase" );
		// 若頁面中沒有Testcase，退出。
		if ( testcase_list.length < 0 ) {
			return;
		}

		// 收集位於頁面中的Testcase預覽元素
		/**
		 * @type {number}
		 */
		var i;
		/**
		 * @type {{element: HTMLElement, lang: string, code: string}[]}
		 */
		var testcase_data_list = [];
		/**
		 * @type {HTMLElement}
		 */
		var testcase_it;
		for ( i = 0; i < testcase_list.length; ++i ) {
			testcase_it = testcase_list[ i ];
			var code_it = $( testcase_it ).find( ".mw-highlight" );
			if ( code_it.length > 0 ) {
				var code_id = ( /(?:mw-highlight-lang-)([^\s]+)/.exec( $( code_it[ 0 ] ).attr( "class" ) ) || [] )[ 1 ];
				var load_index = testcase_data_list.length;
				$( testcase_it ).attr( "preview-id", load_index );
				testcase_data_list.push( {
					element: testcase_it,
					lang: code_id,
					code: toString( code_it.text() )
				} );
			}
		}

		// 整理頁面中的Testcase預覽元素，並放置[載入中]訊息
		var package_wikitext = "";
		for ( i in testcase_data_list ) {
			if ( Object.hasOwnProperty.call( testcase_data_list, i ) ) {
				testcase_it = testcase_data_list[ i ];
				if ( testcase_it.code.trim() !== "" ) {
					if ( [ "javascript", "js", "css", "json" ].indexOf( testcase_it.lang.toLowerCase() ) > -1 ) {
						var addWiki = Parser.check( testcase_it.code, testcase_it.lang );
						if ( addWiki.toString().trim() !== "" ) { // 如果解析結果非空才放置預覽
							$( testcase_it.element ).prepend( $notice_loading );
							package_wikitext += "<div class=\"special-wikitext-preview-testcase-" + i + "\">\n" + addWiki + "\n</div>";
						}
					} else if ( [ "lua", "scribunto" ].indexOf( testcase_it.lang.toLowerCase() ) > -1 ) {
						Parser.addLuaText( testcase_it.code, mw.config.get( "wgPageName" ), is_preview, ( function ( index ) {
							return function ( wikitext ) {
								$( testcase_data_list[ index ].element ).prepend( wikitext );
							};
						}( i ) ) );
					}
				}
			}
		}
		// 將整理完的Testcase預覽元素統一發送API請求，並將返回結果分發到各Testcase
		if ( package_wikitext.trim() !== "" ) {
			package_wikitext = "<div class=\"special-wikitext-preview-testcase-undefined\">" + package_wikitext + "</div>";
			var params = {
				action: "parse",
				uselang: mw.config.get( "wgUserVariant" ),
				useskin: mw.config.get( "skin" ),
				title: mw.config.get( "wgPageName" ),
				text: package_wikitext,
				contentmodel: "wikitext",
				prop: "text",
				format: "json"
			};
			if ( is_preview ) {
				params.preview = 1;
				params.disableeditsection = 1;
			}
			Parser.Api.get( params ).done( function ( data ) {
				if ( !data || !data.parse || !data.parse.text || !data.parse.text[ "*" ] ) {
					Parser.loadingFailNotice();
					return;
				}
				Parser.addCategory( package_wikitext, mw.config.get( "wgPageName" ), is_preview );
				var parsed_wiki = toString( data.parse.text[ "*" ] || "" ).trim();
				if ( parsed_wiki !== "" ) {
					var $parsed_element = $( parsed_wiki );
					$.each( testcase_data_list, function ( k, v ) {
						if ( Object.hasOwnProperty.call( testcase_data_list, k ) ) {
							if ( [ "javascript", "js", "css", "json" ].indexOf( v.lang.toLowerCase() ) > -1 ) {
								var check_parse_result = $parsed_element.find( ".special-wikitext-preview-testcase-undefined > .special-wikitext-preview-testcase-" + k );
								if ( check_parse_result.length > 0 ) {
									$( v.element ).find( "#mw-_addText-preview-loading" ).html( check_parse_result );
								}
							}
						}
					} );
				}
			} );
		}
	};

	/* =======================================
	 * 程式進入點
	 * ======================================= */
	/**
	 * 給頁面添加預覽
	 *
	 * @return {void}
	 */
	Parser.addPreview = function () {
		var current_page_name = mw.config.get( "wgPageName" );
		// 預覽模式只適用於以下頁面內容模型
		if ( Parser.checkMwConfig( "wgPageContentModel", [ "javascript", "js", "json", "text", "css", "sanitized-css" ] ) ) {
			// 模式1 : 頁面預覽
			if ( Parser.elementExist( ".previewnote" ) ) { // 檢查是否為預覽模式
				// 預覽有可能是在預覽其他條目
				var $preview_selector = $( ".previewnote .warningbox > p > b a" );
				if ( $preview_selector.length > 0 ) {
					var path_path = decodeURI( $preview_selector.attr( "href" ) || ( "/wiki/" + current_page_name ) ).replace( /^\/?wiki\//, "" );
					// 如果預覽的頁面並非本身，則不顯示預覽
					if ( path_path !== current_page_name ) {
						return;
					}
				}
				var addWiki = Parser.check();
				if ( toString( addWiki ).trim() !== "" ) { // 如果解析結果非空才放置預覽
					Parser.addLoadingNotice();// 放置提示，提示使用者等待AJAX
					Parser.addWikiText( addWiki, current_page_name, true );// 若取得 _addText 則顯示預覽
				}
			// 模式2 : 不支援顯示的特殊頁面
			} else if ( !Parser.elementExist( "#mw-clearyourcache" ) && Parser.checkMwConfig( "wgAction", "view" ) ) { // 經查，不止是模板樣式，所有未嵌入'#mw-clearyourcache'的頁面皆無法正常顯示
				if ( !Parser.needPreview() ) {
					return;
				}
				// 沒有預覽必要時，直接停止程式，不繼續判斷，以節省效能
				if ( !Parser.elementExist( "#wpTextbox1" ) ) { // 非編輯模式才執行 (預覽使用上方的if區塊)
					Parser.addLoadingNotice();// 放置提示，提示使用者等待AJAX
					Parser.applyRevision( mw.config.get( "wgRevisionId" ), current_page_name );// 為了讓歷史版本正常顯示，使用wgRevisionId取得內容
				}
			// 模式3 : 頁面歷史版本檢視 : 如需複查的項目為頁面歷史版本，本工具提供頁面歷史版本內容顯示支援
			} else if ( Parser.elementExist( "#mw-revision-info" ) && Parser.checkMwConfig( "wgAction", "view" ) ) { // 有嵌入'#mw-clearyourcache'的頁面的歷史版本會只能顯示最新版的 _addText 因此執行修正
				if ( !Parser.elementExist( "#wpTextbox1" ) ) { // 非編輯模式才執行 (預覽使用上方的if區塊)
					$( "#mw-clearyourcache" ).html( $notice_loading );// 差異模式(含檢閱修訂版本刪除)的插入點不同
					Parser.applyRevision( mw.config.get( "wgRevisionId" ), current_page_name );// 為了讓特定版本正常顯示，使用wgRevisionId取得內容
				}
			} else {
				Parser.removeLoadingNotice();
			}
		// 模組預覽功能  https://t.me/wikipedia_zh_n/1367097
		} else if ( Parser.checkMwConfig( "wgPageContentModel", [ "Scribunto", "scribunto", "lua" ] ) ) {
			if ( !Parser.needPreview() ) {
				return;
			}
			// 沒有預覽必要時，直接停止程式，不繼續判斷，以節省效能
			if ( Parser.elementExist( "#wpTextbox1" ) && Parser.elementExist( "table.diff" ) && !Parser.elementExist( ".previewnote" ) && !Parser.checkMwConfig( "wgAction", "view" ) ) {
				$( $notice_loading ).insertAfter( "#wikiDiff" );
				Parser.addLuaText( $( "#wpTextbox1" ).val(), current_page_name, true );
			}
		// 模式4 : 已刪頁面預覽
		} else if ( Parser.elementExist( "#mw-undelete-revision" ) ) { // 已刪內容頁面是特殊頁面，無法用常規方式判斷頁面內容模型
			if ( !Parser.needPreview() ) {
				return;
			} // 沒有預覽必要時，直接停止程式，不繼續判斷，以節省效能
			if ( Parser.elementExist( [ ".mw-highlight", "pre", ".mw-json" ] ) ) { // 確認正在預覽已刪內容
				var tryGetWiki = $( "textarea" ).val();// 嘗試取得已刪內容原始碼
				var tryAddWiki = Parser.getJSONwikitext( tryGetWiki );
				if ( tryAddWiki.trim() === "" ) {
					tryAddWiki = Parser.getCSSwikitext( tryGetWiki );
				}
				if ( tryAddWiki.trim() !== "" ) { // 若取得 _addText 則顯示預覽
					Parser.addLoadingNotice();
					Parser.addWikiText( tryAddWiki, mw.config.get( "wgRelevantPageName" ), true );
				// 嘗試Lua解析
				} else if ( /Module[_ ]wikitext.*_addText/i.exec( $( ".mw-parser-output" ).text() ) ) {
					// 本功能目前測試正常運作
					// 若哪天預覽又失效，請取消註解下方那行
					// Parse.addLuaText(tryGetWiki, mw.config.get("wgRelevantPageName"), true);
				}
			}
		// 如果特殊頁面缺乏編輯提示，則補上編輯提示 (如果存在)
		} else if ( !Parser.elementExist( ".mw-editnotice" ) && Parser.checkMwConfig( "wgCanonicalNamespace", "special" ) ) {
			var pagename = mw.config.get( "wgCanonicalSpecialPageName" );
			var pagesubname = mw.config.get( "wgPageName" ).replace( /^[^:]+:[^/]+/, "" );
			if ( pagename !== false && pagename !== null && toString( pagename ).trim() !== "" ) {
				var fullpagename = mw.config.get( "wgCanonicalNamespace" ) + ":" + pagename;
				Parser.applyNotice( fullpagename, pagesubname );
			}
		// 都不是的情況則不顯示預覽
		} else {
			Parser.removeLoadingNotice();
		}
	};

	if ( mw.config.get( "wgIsSpecialWikitextPreview" ) !== true ) { // 一頁只跑一次預覽，避免小工具重複安裝冒出一大堆預覽
		// 標記預覽已跑過
		mw.config.set( "wgIsSpecialWikitextPreview", true );
		// 執行預覽
		Parser.addPreview();
		// 檢查測試樣例
		Parser.wikitextPreviewTestcase( true );
	}

	window.Parser = Parser;
}, function ( $e ) {
	console.error( "Fail to load site-lib: " + $e );
} );
// </nowiki>
