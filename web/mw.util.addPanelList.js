// <%-- [PAGE_INFO]PageTitle=#User:Sunny00217/mw.util.addPanelList.js#[END_PAGE_INFO] --%> <nowiki>
( function ( $, mw ) {
	mw.util.addPanelList = function ( after, id, href, text ) {
		if ( typeof id === "object" ) {
			var result = [];
			$.each( id, function ( _i, obj ) {
				result.push( mw.util.addPanelList( after, obj.id, obj.href, obj.text ) );
			} );
			return result;
		}

		var $after = $( after );
		var parant = $after.parent();

		if (
			parant.length !== 1 ||
			parant.get( 0 ).tagName.toLowerCase() !== "ul" ||
			typeof id !== "string" ||
			!text
		) {
			return null;
		}

		return $( "<li>" ).attr( "id", id ).append(
			$( "<a>" )
				.attr( "href", href || "" )
				.text( text )
		);
	};
}( jQuery, mediawiki ) );
// </nowiki>
