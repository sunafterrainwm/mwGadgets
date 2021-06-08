/* eslint-disable mediawiki/msg-doc, jsdoc/no-undefined-types */
/**
 * 改自 https://zh.wikipedia.org/wiki/User:XinuGod/js/Gadget-Script-installer/Main.js?oldid=63953967
 */
mw.loader.using( [ "mediawiki.api", "mediawiki.util" ] ).done( function () {
	if (
		mw.config.get( "wgNamespaceNumber" ) === 0 ||
		mw.config.get( "wgPageContentModel" ) !== "javascript" &&
		$( ".scriptInstallerLink" ).length === 0 &&
		$( "table.infobox-user-script" ).length === 0
	) {
		return;
	}

	var Api = new mw.Api();

	var targets = [ "common", "monobook", "minerva", "vector", "cologneblue", "timeless" ];

	if ( mw.config.get( "wgServer" ) === ( window.wgGlobalJsCssLoadFrom || "//meta.wikimedia.org" ) ) {
		targets.push( "global" );
	}

	var prefix = "script-installer-";

	var Installer = {
		imports: {},
		scriptCount: 0,
		suffix: " via [[User:Sunny00217/script-installer.js|Script-installer]]",
		message: {
			installSummary: wgULS( "安装$1", "安裝$1" ),
			uninstallSummary: wgULS( "卸载$1", "移除$1" ),
			remoteUrlDesc: wgULS( "从$2中加载$1", "從$2中載入$1" ),
			disableSummary: wgULS( "禁用$1", "禁用$1" ),
			enableSummary: wgULS( "启用$1", "啟用$1" ),
			normalizeSummary: wgULS( "规范化脚本安装", "規範化指令碼安裝" ),
			panelHeader: wgULS( "您当前已安装以下脚本", "您當前已安裝以下指令碼" )
		},
		RegExp: {
			local: /^\s*(\/\/)?\s*importScript\s*\(\s*(?:"|')(.+?)(?:"|')\s*\)/,
			foreign: /^\s*(\/\/)?\s*mw\.loader\.load\s*\(\s*(?:"|')(.+?)(?:"|')\s*\)/
		},

		/**
		 * @param {string|null} page
		 * @param {string|null} wiki
		 * @param {string} url
		 * @param {number} type
		 * @param {boolean} disabled
		 * @return {string}
		 */
		toJs: function ( page, wiki, url, type, disabled ) {
			var dis = disabled ? "// " : "";

			switch ( type ) {
				case 0:
					return dis + "importScript('" + page + "'); // Backlink: [[" + page + "]]";
				case 1:
					url = "//" + wiki + ".org/w/index.php?title=" +
								page + "&action=raw&ctype=text/javascript";
					/* FALL THROUGH */
				case 2:
					return dis + "mw.loader.load('" + url + "');";
			}
		},

		// eslint-disable-next-line no-use-before-define
		Import: Import,

		getAllTargetWikitexts: function () {
			return $.getJSON(
				mw.util.wikiScript( "api" ),
				{
					format: "json",
					action: "query",
					prop: "revisions",
					rvprop: "content",
					rvslots: "main",
					titles: $.each( targets, function ( _i, target ) {
						return Installer.getFullTarget( target );
					} ).join( "|" )
				}
			).then( function ( data ) {
				if ( data && data.query && data.query.pages ) {
					var result = {},
						prefixLength = mw.config.get( "wgUserName" ).length + 6;

					$.each( data.query.pages, function ( _i, moreData ) {
						result[ moreData.title.substring( prefixLength ).slice( 0, -3 ) ] =
							moreData.revisions ? moreData.revisions[ 0 ].slots.main[ "*" ] : null;
					} );

					return result;
				}
			} );
		},

		/**
		 * @param {string} s
		 * @return {string}
		 */
		escapeForRegex: function ( s ) {
			return s.replace( /[-/\\^$*+?.()|[\]{}]/g, "\\$&" );
		},

		/**
		 * @param {string} target
		 * @return {string}
		 */
		getFullTarget: function ( target ) {
			return "User:" + mw.config.get( "wgUserName" ) + "/" +
					target + ".js";
		},

		// From https://stackoverflow.com/a/10192255
		/**
		 * @param {string[]} array
		 * @return {string[]}
		 */
		unique: function ( array ) {
			return $.grep( array, function ( el, index ) {
				return index === $.inArray( el, array );
			} );
		}

	};

	$.extend( Installer, window.ScriptInstaller );

	$.each( Installer.message, function ( k, v ) {
		mw.messages.set( prefix + k, v );
	} );

	/**
	 * @class Import
	 *
	 * Constructs an Import. An Import is a line in a JS file that imports a
	 * user script.
	 *
	 * Properties:
	 *  - "page" is a page name, such as "User:Foo/Bar.js".
	 *  - "wiki" is a wiki from which the script is loaded, such as
	 *    "en.wikipedia". If null, the script is local, on the user's
	 *    wiki.
	 *  - "url" is a URL that can be passed into mw.loader.load.
	 *  - "target" is the title of the user subpage where the script is,
	 *    without the .js ending: for example, "common".
	 *  - "disabled" is whether this import is commented out.
	 *  - "type" is 0 if local, 1 if remotely loaded, and 2 if URL.
	 *
	 * EXACTLY one of "page" or "url" are null for every Import. This
	 * constructor should not be used directly; use the factory
	 * functions (Import.ofLocal, Import.ofUrl, Import.fromJs) instead.
	 *
	 * @param {string|null} page a page name, such as "User:Foo/Bar.js".
	 * @param {string|null} wiki a wiki from which the script is loaded, such as
	 *    "en.wikipedia". If null, the script is local, on the user's
	 *    wiki.
	 * @param {string|null} url a URL that can be passed into mw.loader.load.
	 * @param {string} target the title of the user subpage where the script is,
	 *    without the .js ending: for example, "common".
	 * @param {boolean} disabled whether this import is commented out.
	 *
	 * @constructor
	 */
	var Import = function ( page, wiki, url, target, disabled ) {
		this.page = page;
		this.wiki = wiki;
		this.url = url;
		this.target = target;
		this.disabled = disabled;
		this.type = this.url ? 2 : ( this.wiki ? 1 : 0 );
	};

	/**
	 * @param {string} page
	 * @param {string} target
	 * @param {boolean} disabled
	 * @return {Import}
	 */
	Import.ofLocal = function ( page, target, disabled ) {
		if ( disabled === undefined ) {
			disabled = false;
		}
		return new Import( page, null, null, target, disabled );
	};

	/**
	 * URL to Import. Assumes wgScriptPath is "/w"
	 *
	 * @param {string} url
	 * @param {string} target
	 * @param {boolean} disabled
	 * @return {Import}
	 */
	Import.ofUrl = function ( url, target, disabled ) {
		if ( disabled === undefined ) {
			disabled = false;
		}
		var urlreg = /^(?:https?:)?\/\/(.+?)\.org\/w\/index\.php\?.*?title=(.+?(?:&|$))/;
		if ( urlreg.exec( url ) ) {
			var match = urlreg.exec( url ),
				title = decodeURIComponent( match[ 2 ].replace( /&$/, "" ) ),
				wiki = match[ 1 ];

			return new Import( title, wiki, null, target, disabled );
		}
		return new Import( null, null, url, target, disabled );
	};

	/**
	 * @param {string} line
	 * @param {string} target
	 * @return {Import}
	 */
	Import.fromJs = function ( line, target ) {
		/**
		 * @type {RegExpExecArray}
		 */
		var match;
		if ( Installer.RegExp.local.exec( line ) ) {
			match = Installer.RegExp.local.exec( line );
			return Import.ofLocal( match[ 2 ], target, !!match[ 1 ] );
		} else if ( Installer.RegExp.foreign.exec( line ) ) {
			match = Installer.RegExp.foreign.exec( line );
			return Import.ofUrl( match[ 2 ], target, !!match[ 1 ] );
		}
	};

	Import.prototype = {
		getDescription: function () {
			switch ( this.type ) {
				case 0:
					return this.page;
				case 1:
					return mw.msg( prefix + "remoteUrlDesc" ).replace( "$1", this.page ).replace( "$2", this.wiki );
				case 2:
					return this.url;
			}
		},

		/**
		 * Human-readable (NOT necessarily suitable for ResourceLoader) URL.
		 *
		 * @return {string}
		 */
		getHumanUrl: function () {
			switch ( this.type ) {
				case 0:
					return "/wiki/" + encodeURI( this.page );
				case 1:
					return "//" + this.wiki + ".org/wiki/" + encodeURI( this.page );
				case 2:
					return this.url;
			}
		},

		toJs: function () {
			return Installer.toJs( this.page, this.wiki, this.url, this.type, this.disabled );
		},

		/**
		 * Installs the import.
		 *
		 * @return {JQuery.Promise}
		 */
		install: function () {
			return Api.postWithEditToken( {
				action: "edit",
				title: Installer.getFullTarget( this.target ),
				summary: mw.msg( prefix + "installSummary" ).replace( "$1", this.getDescription() ) + Installer.suffix,
				appendtext: "\n" + this.toJs()
			} );
		},

		/**
		 * Get all line numbers from the target page that mention
		 * the specified script.
		 *
		 * @param {string} targetWikitext
		 * @return {number}
		 */
		getLineNums: function ( targetWikitext ) {
			function quoted( s ) {
				return new RegExp( "(['\"])" + Installer.escapeForRegex( s ) + "\\1" );
			}
			var toFind;
			switch ( this.type ) {
				case 0:
					toFind = quoted( this.page );
					break;
				case 1:
					toFind = new RegExp( Installer.escapeForRegex( this.wiki ) + ".*?" +
					Installer.escapeForRegex( this.page ) );
					break;
				case 2:
					toFind = quoted( this.url );
					break;
			}
			var lineNums = [], lines = targetWikitext.split( "\n" );
			for ( var i = 0; i < lines.length; i++ ) {
				if ( toFind.test( lines[ i ] ) ) {
					lineNums.push( i );
				}
			}
			return lineNums;
		}
	};

	/**
	 * Uninstalls the given import. That is, delete all lines from the
	 * target page that import the specified script.
	 */
	Import.prototype.uninstall = function () {
		var that = this;
		return getWikitext( getFullTarget( this.target ) ).then( function ( wikitext ) {
			var lineNums = that.getLineNums( wikitext ),
				newWikitext = wikitext.split( "\n" ).filter( function ( _, idx ) {
					return lineNums.indexOf( idx ) < 0;
				} ).join( "\n" );
			return api.postWithEditToken( {
				action: "edit",
				title: getFullTarget( that.target ),
				summary: STRINGS.uninstallSummary.replace( "$1", that.getDescription() ) + ADVERT,
				text: newWikitext
			} );
		} );
	};

	/**
	 * Sets whether the given import is disabled, based on the provided
	 * boolean value.
	 *
	 * @param disabled
	 */
	Import.prototype.setDisabled = function ( disabled ) {
		var that = this;
		this.disabled = disabled;
		return getWikitext( getFullTarget( this.target ) ).then( function ( wikitext ) {
			var lineNums = that.getLineNums( wikitext ),
				newWikitextLines = wikitext.split( "\n" );

			if ( disabled ) {
				lineNums.forEach( function ( lineNum ) {
					if ( newWikitextLines[ lineNum ].trim().indexOf( "//" ) != 0 ) {
						newWikitextLines[ lineNum ] = "//" + newWikitextLines[ lineNum ].trim();
					}
				} );
			} else {
				lineNums.forEach( function ( lineNum ) {
					if ( newWikitextLines[ lineNum ].trim().indexOf( "//" ) == 0 ) {
						newWikitextLines[ lineNum ] = newWikitextLines[ lineNum ].replace( /^\s*\/\/\s*/, "" );
					}
				} );
			}

			var summary = ( disabled ? STRINGS.disableSummary : STRINGS.enableSummary )
				.replace( "$1", that.getDescription() ) + ADVERT;
			return api.postWithEditToken( {
				action: "edit",
				title: getFullTarget( that.target ),
				summary: summary,
				text: newWikitextLines.join( "\n" )
			} );
		} );
	};

	Import.prototype.toggleDisabled = function () {
		this.disabled = !this.disabled;
		return this.setDisabled( this.disabled );
	};

	/**
	 * Move this import to another file.
	 *
	 * @param newTarget
	 */
	Import.prototype.move = function ( newTarget ) {
		if ( this.target === newTarget ) { return; }
		var old = new Import( this.page, this.wiki, this.url, this.target, this.disabled );
		this.target = newTarget;
		return $.when( old.uninstall(), this.install() );
	};

} );
