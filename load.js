/* eslint-disable camelcase, jsdoc/no-undefined-types */
( function () {

	function Url( uri ) {
		try {
			return new URL( uri );
		} catch ( e ) {
			if ( uri.startsWith( "//" ) ) {
				return new URL( window.location.protocol + uri );
			} else {
				return new URL( window.location.protocol + "//" + uri );
			}
		}
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
			scriptpath: Url( scriptpath || mw.config.get( "wgServer" ) )
		};

		if ( defaults.scriptpath.pathname === "/" ) {
			defaults.scriptpath.pathname = "/w/index.php";
		}
	}

	Load.prototype = {
		/**
		 * @param {string} title
		 * @param {string} [scriptpath]
		 * @param {boolean} [use_getScript]
		 * @return {void|JQuery.jqXHR}
		 */
		load: function ( title, scriptpath, use_getScript ) {
			var that = $.extend( {}, this.defaults );
			if ( scriptpath ) {
				that.scriptpath = Url( scriptpath );

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
					break;
				case "css":
				case "text/css":
					that.type = "text/css";
					that.msg = "loadcss: $1";
					break;
				case undefined:
				case null:
				case "":
					if ( title.match( /\.js$/ ) ) {
						that.type = "text/javascript";
						that.msg = "loadjs: $1";
					} else if ( title.match( /\.css$/ ) ) {
						that.type = "text/css";
						that.msg = "loadcss: $1";
					} else {
						return console.error( "Bad request: unknow type " + that.type );
					}
					break;
				default:
					return console.error( "Bad request: unknow type " + that.type );
			}
			console.log( that.msg.replace( "$1", that.scriptpath.href + "?title=" + title ) );
			return mw.loader[ use_getScript ? "getScript" : "load" ](
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
			this.load( title, scriptpath, true );
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
	Load.ecm_module = function ( title, scriptpath ) {
		var scriptpath_uri = new URL( scriptpath );

		if ( scriptpath_uri.pathname === "/" ) {
			scriptpath_uri.pathname = "/w/index.php";
		}

		console.log( "loadmodule" + scriptpath_uri.href + "?title=" + title );

		$( "<script src=\"" + title + "\" type=\"module\">" ).appendTo( $( "head" ) );
	};

	/**
	 * @param {string} scriptpath
	 * @return {Load}
	 */
	Load.js = function ( scriptpath ) {
		return new Load( scriptpath, "text/javascript" );
	};

	Load.css = function ( scriptpath ) {
		return new Load( scriptpath, "text/css" );
	};

	window.load = Load;

	window.loadjs = function ( title, scriptpath ) {
		return new Load( scriptpath, "text/javascript" ).add( title );
	};

	window.loadcss = function ( title, scriptpath ) {
		return new Load( scriptpath, "text/css" ).add( title );
	};
}() );
