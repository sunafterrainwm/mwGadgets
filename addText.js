/* eslint-disable camelcase */
$( function ( $ ) {
	var wikiTextKey = "_addText";

	var Parse = {
		/**
		 * 合併多個wikitext字串，並以換行分隔
		 *
		 * @param {string} target
		 * @param {string} str
		 * @param {boolean} _escape
		 * @return {string}
		 */
		extend: function ( target, str, _escape ) {
			if ( str !== "" ) {
				if ( target !== "" ) {
					target = target + "\n";
				}
				var text = str;
				if ( _escape ) {
					var escape_str = JSON.stringify( str.toString() );
					escape_str = escape_str.substr( 1, escape_str.length - 2 );
					text = escape_str;
				}
				target += text;
			}
			return target;
		},

		/**
		 * 讀取wikitext字串，並去除其中的跳脫字元
		 *
		 * @param {string} $str
		 * @return {string}
		 */
		ProcessString: function ( $str ) {
			$str = $str.trim();
			var first_char = $str.charAt( 0 );
			if ( first_char === $str.charAt( $str.length - 1 ) && ( first_char === "'" || first_char === "\"" ) ) {
				$str = $str.substr( 1, $str.length - 2 );
			}

			try {
				// eslint-disable-next-line no-new-func
				return new Function( "return '" + $str + "'" )();
			} catch ( $e1 ) {
				try {
					// eslint-disable-next-line no-new-func
					return new Function( "return \"" + $str + "\"" )();
				} catch ( $e2 ) {
					return $str;
				}
			}
		},

		/**
		 * 讀取CSS之 ```_addText { content:"XXX" }``` 模式的字串
		 *
		 * @param {string} str
		 * @return {string}
		 */
		GetCSSContent: function ( str ) {
			var wikitext = "",
				that = this;
			try {
				str.replace( new RegExp( wikiTextKey + "\\s*\\{[^c\\}]*content\\s*:\\s*[^\n]*", "g" ), function ( text ) {
					var temp = ( /content\s*:\s*[^\n]*/.exec( text ) || [ "content:" ] )[ 0 ]
						.replace( /^[\s\uFEFF\xA0\t\r\n\f ;}]+|[\s\uFEFF\xA0\t\r\n\f ;}]+$/g, "" )
						.replace( /\s*content\s*:\s*/, "" );
					if ( wikitext !== "" ) {
						wikitext += "\n";
					}
					wikitext += that.ProcessString( temp );
					return text;
				} );
			} catch ( ex ) {}
			return wikitext;
		},

		/**
		 * 讀取物件定義模式為 ```_addText=XXX``` 或 ```_addText:XXX``` 模式的字串
		 *
		 * @param {string} str
		 * @return {string}
		 */
		GetObjText: function ( str ) {
			var wikitext = "",
				that = this;
			try {
				str.replace( new RegExp( wikiTextKey + "\\s*[\\=:]\\s*[^\n]*", "g" ), function ( text ) {
					var temp_text = text.replace( /^[\s\uFEFF\xA0\t\r\n\f ;}]+|[\s\uFEFF\xA0\t\r\n\f ;}]+$/g, "" )
						.replace( new RegExp( wikiTextKey + "\\s*[\\=:]\\s*" ), "" );
					if ( wikitext !== "" ) {
						wikitext += "\n";
					}

					var test_str = /[^\n]*\*\//.exec( temp_text );
					if ( test_str ) {
						temp_text = ( test_str[ 0 ] || "" );
						temp_text = temp_text.substr( 0, temp_text.length - 2 );
					}

					wikitext += that.ProcessString( temp_text );
					return text;
				} );
			} catch ( ex ) {}
			return wikitext;
		},

		/**
		 * 分析lua中符合條件的wikitext
		 *
		 * @param {string} str
		 * @return {string}
		 */
		ProcessLua: function ( str ) {
			var process = /^[\s\t]*require\(\s*['"][Mm]odule:[Mm]odule[\s_]Wikitext['"]\s*\)._addText\((.*)\)$/.exec( str ),
				out = "";

			if ( !process ) {
				return "";
			}

			process[ 1 ] = process[ 1 ] ? process[ 1 ].trim() : "";

			out =
				process[ 1 ].match( /'(.*)'/ ) ||
				process[ 1 ].match( /"(.*)"/ ) ||
				process[ 1 ].match( /\[\[(.*)\]\]/ ) ||
				process[ 1 ].match( /\[=\[(.*)\]=\]/ )[ 1 ];

			return this.ProcessString( out );
		},

		/**
		 * 分析CSS中符合條件的wikitext
		 *
		 * @param {string} str
		 * @return {string}
		 */
		ProcessCSS: function ( str ) {
			var wikitext = "";
			if ( str.trim() === "" ) {
				return "";
			}
			// 匹配 _addText { content:"XXX" } 模式
			wikitext = this.extend( wikitext, this.GetCSSContent( str ), true );
			// 同時亦匹配 /* _addText:XXX */ 模式
			wikitext = this.extend( wikitext, this.GetObjText( str ), true );
			return wikitext;
		},

		/**
		 * 分析JavaScript中符合條件的wikitext
		 *
		 * @param {string} str
		 * @return {string}
		 */
		ProcessJavaScript: function ( str ) {
			var wikitext = "";
			if ( str.trim() === "" ) {
				return "";
			}
			wikitext = this.extend( wikitext, this.GetObjText( str ) );
			return wikitext;
		},

		/**
		 * 分析JSON中符合條件的wikitext
		 *
		 * @param {string} json
		 * @return {string}
		 */
		ProcessJSON: function ( json ) {
			var wikitext = "",
				data = JSON.parse( json ),
				that = this;

			$.each( data, function ( $k, $v ) {
				if ( $k === wikiTextKey ) {
					if ( typeof ( $v ) === "string" ) {
						wikitext = that.extend( wikitext, $v );
					} else {
						// 如果是陣列物件會多包一層
						$.each( $v, function ( $vk, $vv ) {
							if ( new RegExp( wikiTextKey ).exec( $vk ) && typeof ( $vv ) === "string" ) {
								wikitext = that.extend( wikitext, $vv );
							}
						} );
					}
				}
			} );

			return wikitext;
		},

		/**
		 * 使用頁面內容模型來判斷格式
		 *
		 * @return {Function}
		 */
		getProcessFunction: function () {
			// 根據文檔格式選用適當的解析模式
			switch ( mw.config.get( "wgPageContentModel" ).toLowerCase() ) {
				case "json":
					return this.ProcessJSON.bind( this );
				case "javascript":
					return this.ProcessJavaScript.bind( this );
				case "css":
				case "sanitized-css":
					return this.ProcessCSS.bind( this );
				/*
				case "scribunto":
					return this.ProcessLua();
				*/
			}
			// 若不是json、js、css、lua則返回空函數
			return function () {
				return "";
			};
		}
	};

	var wpText = Parse.getProcessFunction()( $( "#wpTextbox1" ).val() ).trim();

	if ( wpText.length < 0 ) {
		return;
	}

	new mw.Api().parse( wpText ).then( function ( parse ) {
		var parsed = parse.toString().trim();
		if ( parsed !== "" ) {
			if ( $( ".previewnote" ) ) {
				$( ".previewnote" ).after( parsed );
			} else if ( $( ".mw-parser-output" ) ) {
				$( ".mw-parser-output" ).after( parsed );
			}
		}
	} );

} );
