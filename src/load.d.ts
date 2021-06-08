import "../typescript/mw.load.getCSS";

declare global {
	/**
	 * @class Load
	 */
	interface LoadStatic {
		new ( scriptpath: string, type?: string ): Load;

		EcmModule( title: string, scriptpath?: string ): void;

		js: load.js;
		css: load.css;
	}

	interface Load {
		private load( title: string, scriptpath?: string, loadcall: Function | {
			js: Function, css: Function
		} ): JQuery.jqXHR | void;

		add( title: string, scriptpath?: string ): JQuery.jqXHR;

		push( list: string[][] ): void;
	}

	const load: LoadStatic;

	namespace load {
		interface js {
			new ( scriptpath: string ): Load;
		}

		interface css {
			new ( scriptpath: string ): Load;
		}
	}

	function loadjs( title: string, scriptpath?: string ): JQuery.jqXHR;

	function loadcss( title: string, scriptpath?: string ): JQuery.jqXHR;

	function loadjscss( prefix: string, scriptpath?: string ): JQuery.jqXHR;
}

export = {};
