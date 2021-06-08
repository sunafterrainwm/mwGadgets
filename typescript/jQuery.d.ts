/* eslint-disable */
import "jquery";

interface init {
	(): JQuery;

	/**
	 * Creates DOM elements on the fly from the provided string of raw HTML.
	 * @param html _&#x40;param_ `html`
	 * <br>
	 * * `html (ownerDocument)` — A string of HTML to create on the fly. Note that this parses HTML, not XML. <br>
	 * * `html (attributes)` — A string defining a single, standalone, HTML element (e.g. &lt;div/&gt; or &lt;div&gt;&lt;/div&gt;).
	 * @param ownerDocument_attributes _&#x40;param_ `ownerDocument_attributes`
	 * <br>
	 * * `ownerDocument` — A document in which the new elements will be created. <br>
	 * * `attributes` — An object of attributes, events, and methods to call on the newly-created element.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 * @since 1.4
	 * @example ​ ````Create a div element (and all of its contents) dynamically and append it to the body element. Internally, an element is created and its innerHTML property set to the given markup.
```javascript
$( "<div><p>Hello</p></div>" ).appendTo( "body" )
```
	 * @example ​ ````Create some DOM elements.
```javascript
$( "<div/>", {
  "class": "test",
  text: "Click me!",
  click: function() {
	$( this ).toggleClass( "test" );
  }
})
  .appendTo( "body" );
```
	 */
	// tslint:disable-next-line:no-unnecessary-generics
	new<TElement extends HTMLElement = HTMLElement>(html: JQuery.htmlString, ownerDocument_attributes?: Document | JQuery.PlainObject): JQuery<TElement>;
	/**
	 * Accepts a string containing a CSS selector which is then used to match a set of elements.
	 * @param selector A string containing a selector expression
	 * @param context A DOM Element, Document, Selector or jQuery to use as context
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 * @example ​ ````Find all p elements that are children of a div element and apply a border to them.
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>jQuery demo</title>
  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
</head>
<body>
​
<p>one</p>
<div><p>two</p></div>
<p>three</p>
​
<script>
$( "div > p" ).css( "border", "1px solid gray" );
</script>
</body>
</html>
```
	 * @example ​ ````Find all inputs of type radio within the first form in the document.
```javascript
$( "input:radio", document.forms[ 0 ] );
```
	 * @example ​ ````Find all div elements within an XML document from an Ajax response.
```javascript
$( "div", xml.responseXML );
```
​
	 */
	// tslint:disable-next-line:no-unnecessary-generics
	new<TElement extends Element = HTMLElement>(selector: JQuery.Selector, context?: Element | Document | JQuery | JQuery.Selector): JQuery<TElement>;
	/**
	 * Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
	 * @param element A DOM element to wrap in a jQuery object.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 * @example ​ ````Set the background color of the page to black.
```javascript
$( document.body ).css( "background", "black" );
```
	 */
	// NOTE: `HTMLSelectElement` is both an Element and an Array-Like Object but jQuery treats it as an Element.
	new(element: HTMLSelectElement): JQuery<HTMLSelectElement>;
	/**
	 * Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
	 * @param element_elementArray _&#x40;param_ `element_elementArray`
	 * <br>
	 * * `element` — A DOM element to wrap in a jQuery object. <br>
	 * * `elementArray` — An array containing a set of DOM elements to wrap in a jQuery object.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 * @example ​ ````Set the background color of the page to black.
```javascript
$( document.body ).css( "background", "black" );
```
	 * @example ​ ````Hide all the input elements within a form.
```javascript
$( myForm.elements ).hide();
```
	 */
	new<T extends Element>(element_elementArray: T | ArrayLike<T>): JQuery<T>;
	/**
	 * Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
	 * @param selection An existing jQuery object to clone.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 */
	new<T>(selection: JQuery<T>): JQuery<T>;
	/**
	 * Binds a function to be executed when the DOM has finished loading.
	 * @param callback The function to execute when the DOM is ready.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 * @example ​ ````Execute the function when the DOM is ready to be used.
```javascript
$(function() {
  // Document is ready
});
```
	 * @example ​ ````Use both the shortcut for $(document).ready() and the argument to write failsafe jQuery code using the $ alias, without relying on the global alias.
```javascript
jQuery(function( $ ) {
  // Your code using failsafe $ alias here...
});
```
	 */
	// tslint:disable-next-line:no-unnecessary-generics unified-signatures
	new<TElement = HTMLElement>(callback: ((this: Document, $: JQueryStatic) => void)): JQuery<TElement>;
	/**
	 * Return a collection of matched elements either found in the DOM based on passed argument(s) or created by passing an HTML string.
	 * @param object A plain object to wrap in a jQuery object.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.0
	 */
	new<T extends JQuery.PlainObject>(object: T): JQuery<T>;
	/**
	 * Returns an empty jQuery set.
	 * @see \`{@link https://api.jquery.com/jQuery/ }\`
	 * @since 1.4
	 */
	// tslint:disable-next-line:no-unnecessary-generics
	new<TElement = HTMLElement>(): JQuery<TElement>;
	prototype: JQuery
}

declare global {
	interface JQueryStatic {
		prototype: JQuery;
	}

	interface JQuery {
		init: init;
	}
}

export = {};