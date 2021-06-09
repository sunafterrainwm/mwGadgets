( function () {
	if ( !mw.loader.getCSS ) {
		mw.loader.getCSS = function ( url ) {
			return $.ajax( url, {
				dataType: "text",
				cache: !0
			} ).done( function ( css ) {
				mw.util.addCSS( css );
				return css;
			} ).catch( function () {
				throw new Error( "Failed to load script" );
			} );
		};
	}

	/**
	 *
	 * @param {string} scriptpath
	 * @param {string} type
	 * @class Load
	 * @constructor
	 */
	function Load( scriptpath, type ) {
		var defaults = this.defaults = {
			type: type,
			scriptpath: new URL( scriptpath || mw.config.get( "wgServer" ), window.location.origin )
		};

		if ( defaults.scriptpath.pathname === "/" ) {
			defaults.scriptpath.pathname = "/w/index.php";
		}
	}

	/* eslint-disable jsdoc/valid-types */
	/**
	 * @typedef {(modules: string, type?: string) => JQuery.jqXHR | void} loadcall
	 */
	/* eslint-enable jsdoc/valid-types */

	Load.prototype = {
		/**
		 * @param {string} title
		 * @param {string} [scriptpath]
		 * @param {loadcall | {js: loadcall;css: loadcall;}} [loadcall]
		 * @return {void|JQuery.jqXHR}
		 */
		load: function ( title, scriptpath, loadcall ) {
			var that = $.extend( {}, this.defaults );
			if ( scriptpath ) {
				that.scriptpath = new URL( scriptpath, window.location.origin );

				if ( that.scriptpath.pathname === "/" ) {
					that.scriptpath.pathname = "/w/index.php";
				}
			}
			switch ( that.type ) {
				case "js":
				case "javascript":
				case "text/javascript":
				case "application/javascript":
				case "application/ecmascript":
					that.type = "text/javascript";
					that.msg = "loadjs: $1";
					if ( loadcall && typeof loadcall !== "function" ) {
						loadcall = loadcall.js;
					}
					break;
				case "css":
				case "text/css":
					that.type = "text/css";
					that.msg = "loadcss: $1";
					if ( loadcall && typeof loadcall !== "function" ) {
						loadcall = loadcall.css;
					}
					break;
				case undefined:
				case null:
				case "":
					if ( title.match( /\.js$/ ) ) {
						that.type = "text/javascript";
						that.msg = "loadjs: $1";
						if ( loadcall && typeof loadcall !== "function" ) {
							loadcall = loadcall.js;
						}
					} else if ( title.match( /\.css$/ ) ) {
						that.type = "text/css";
						that.msg = "loadcss: $1";
						if ( loadcall && typeof loadcall !== "function" ) {
							loadcall = loadcall.css;
						}
					} else {
						return console.error( "Bad request: unknow type " + that.type );
					}
					break;
				default:
					return console.error( "Bad request: unknow type " + that.type );
			}
			console.log( that.msg.replace( "$1", that.scriptpath.href + "?title=" + title ) );
			return ( loadcall || mw.loader.load )(
				that.scriptpath.href + "?title=" + mw.util.wikiUrlencode( title ) + "&action=raw&ctype=" + that.type, that.type
			);
		},

		/**
		 *
		 * @param {string} title
		 * @param {string} scriptpath
		 * @return {void}
		 */
		add: function ( title, scriptpath ) {
			this.load( title, scriptpath, {
				js: mw.loader.getScript,
				css: mw.loader.getCSS
			} );
		},

		/**
		 *
		 * @param {string[][]} list
		 * @return {void}
		 */
		push: function ( list ) {
			var that = this;
			if ( typeof list === "object" ) {
				$.each( list, function ( _$k, $v ) {
					if ( typeof $v === "string" ) {
						that.load( $v );
					} else if ( Array.isArray( $v ) ) {
						that.load( $v[ 0 ], $v[ 1 ] );
					} else {
						try {
							that.load( $v.title, $v.scriptpath );
						} catch ( $e ) { }
					}
				} );
			} else {
				console.log( "unknow type of this object: " + list );
			}
		}
	};

	/**
	 * @param {string} title
	 * @param {string} [scriptpath]
	 * @return {void}
	 */
	Load.EcmModule = function ( title, scriptpath ) {
		var scriptpathUrl = new URL( scriptpath, window.location.origin );

		if ( scriptpathUrl.pathname === "/" ) {
			scriptpathUrl.pathname = "/w/index.php";
		}

		console.log( "loadmodule " + scriptpathUrl.href + "?title=" + title );

		$( "<script src=\"" + scriptpathUrl.href + "?title=" + mw.util.wikiUrlencode( title ) + "&action=raw&ctype=text/javascript\" type=\"module\">" ).appendTo( $( "head" ) );
	};

	/**
	 * @param {string} scriptpath
	 * @return {Load}
	 */
	Load.js = function ( scriptpath ) {
		return new Load( scriptpath, "text/javascript" );
	};

	/**
	 * @param {string} scriptpath
	 * @return {Load}
	 */
	Load.css = function ( scriptpath ) {
		return new Load( scriptpath, "text/css" );
	};

	window.load = Load;

	var loadjs = window.loadjs = function ( title, scriptpath ) {
		return new Load( scriptpath, "text/javascript" ).add( title );
	};

	var loadcss = window.loadcss = function ( title, scriptpath ) {
		return new Load( scriptpath, "text/css" ).add( title );
	};

	window.loadjscss = function ( prefix, scriptpath ) {
		return $.when( loadjs( prefix + ".js", scriptpath ), loadcss( prefix + ".css", scriptpath ) );
	};
}() );
