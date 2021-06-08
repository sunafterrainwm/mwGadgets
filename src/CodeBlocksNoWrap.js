/* eslint-disable jsdoc/no-undefined-types */
/**
 * from https://zh.wikipedia.org/wiki/User:JasonHK/Gadget-CodeBlocks-NoWrap.js?oldid=65856736
 */
$( function ( $ ) {

	/**
	 * @param {JQuery<HTMLBodyElement>|JQuery<HTMLDivElement>} container
	 */
	function initializeCodeBlocks( container ) {
		$( "pre:not(.mw-codeblock)", container ).each(
			/**
			 * @this {HTMLPreElement}
			 */
			function () {
				$( this ).contents()
					.wrapAll( "<div class=\"mw-codeblock-container\">" )
					.end()
					.parent( ".mw-highlight" )
					.addBack()
					.addClass( "mw-codeblock" );
			} );
	}

	initializeCodeBlocks( document.body );

	mw.hook( "wikipage.content" ).add(
		function ( container ) {
			initializeCodeBlocks( container );
		} );

} );
