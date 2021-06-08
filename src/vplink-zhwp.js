// 改自 https://zh.wikipedia.org/w/index.php?title=User:Wcam/common.js&oldid=56399001

$( function () {
	mw.util.addCSS( "il.n-villagepump{ font-size:85% }" );

	var vplist = [
		[ "消息" ],
		[ "方针", wgULS( "方针", "方針" ) ],
		[ "技术", wgULS( "技术", "技術" ) ],
		[ "求助" ],
		[ "条目探讨", wgULS( "条目探讨", "條目探討" ) ],
		[ "其他" ]
	];
	/**
	 * @type {JQuery<HTMLDivElement>}
	 */
	var vps = $( "<div>" );

	for ( var k = 0; k < vplist.length; k++ ) {
		this.vp = vplist[ k ];
		vps.add( "<li id=\"n-villagepump-" + this.vp[ 0 ] + "\" class=\"n-villagepump\"><a href=\"/wiki/Wikipedia:互助客栈/" + this.vp[ 0 ] + "\" title=\"" + wgULS( "互助客栈", "互助客棧" ) + this.vp[ 1 ] || this.vp[ 0 ] + "版\">" + this.vp[ 1 ] || this.vp[ 0 ] + "</a></il>\n" );
		delete this.vp;
	}

	$( "body div#mw-panel nav#p-help ul.vector-menu-content-list li#n-villagepump" ).after( vps );

} );
