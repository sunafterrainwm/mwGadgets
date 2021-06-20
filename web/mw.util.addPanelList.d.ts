// <%-- [PAGE_INFO] PageTitle=#User:Sunny00217/mw.util.addPanelList.d.ts# [END_PAGE_INFO] --%> &#60;syntaxhighlight lang="typescript"&#62;<syntaxhighlight lang="typescript">
declare global {
    namespace mw {
        namespace util {
            function addPanelList( after: string | JQuery<HTMLLIElement>,
				id: string | undefined, href: string, text: string ): JQuery<HTMLLIElement>;

			function addPanelList( after: string | JQuery<HTMLLIElement>, obj: {
				id: string | undefined;
				href: string;
				text: string;
			} ): JQuery<HTMLLIElement>[];
		}
	}
}

export {};
// </syntaxhighlight> &#60;/syntaxhighlight&#62;
