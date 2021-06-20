/* eslint-disable no-jquery/no-global-selector */
// from https://zh.wikipedia.org/wiki/User:AnYiLin/js/ConfirmLogout.js?oldid=66096258
$( function () {
	/**
	 * @param {JQuery.Event} e
	 */
	function onClick( e ) {
		e.preventDefault();
		e.stopPropagation();
		mw.loader.using( [ "ext.gadget.site-lib", "mediawiki.api", "mediawiki.notification", "oojs-ui" ] ).then( function () {
			OO.ui.confirm( wgUVS( "您确定要登出吗？", "您確認要登出嗎？" ) ).then( function ( confirmed ) {
				if ( confirmed ) {
					mw.notify( [ wgUVS( "您正在登出，请稍候。", "您正在登出，請稍候。" ) ], { autoHide: false } );
					new mw.Api().postWithToken( "csrf", {
						action: "logout"
					} ).then( function () {
						window.location.reload();
					} );
				}
			} );
		} );
	}

	$( "#ca-cb-logout > a, .menu__item--logout, #pt-logout > a" ).on( onClick );

	/**
	 * @param {JQuery<HTMLDivElement>} $content
	 */
	var confirmLogoutHook = function ( $content ) {
		$content.find( "a" ).filter( function ( _i, ele ) {
			return ele.href.match(
				/(?:^(?:https?:)?\/\/(?:(?:zh.wikipedia.org|zhwp.org)\/(?:wiki|zh|zh-hans|zh-hant|zh-cn|zh-my|zh-sg|zh-tw|zh-hk|zh-mo)|zhwp.org)\/|\/wiki\/|[?#]title=)special:(?:用户退出|用戶登出|使用者登出|%E7%94%A8%E6%88%B7%E9%80%80%E5%87%BA|%E7%94%A8%E6%88%B6%E7%99%BB%E5%87%BA|%E4%BD%BF%E7%94%A8%E8%80%85%E7%99%BB%E5%87%BA|(?:user)?logout)(?:[?#]|$)/i
			);
		} ).on( onClick );
	};
	confirmLogoutHook( mw.util.$content );
	mw.hook( "wikipage.content" ).add( confirmLogoutHook );
}() );
