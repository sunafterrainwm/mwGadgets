declare global {
    namespace mw {
        namespace loader {
			/**
			 * @see /src/mw.load.getCSS.js
			 */
            function getCSS( url: string ): JQuery.Promise<any>;
		}
	}
}

export {};
