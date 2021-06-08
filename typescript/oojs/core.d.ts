/**
 * Namespace for all classes, static methods and static properties.
 *
 * @namespace OO
 */
interface OOjs {
	hasOwn: Object[ "hasOwnProperty" ];
	slice: any[][ "slice" ];
	toString: Object[ "toString" ];

	/**
	 * Utility to initialize a class for OO inheritance.
	 *
	 * Currently this just initializes an empty static object.
	 *
	 * @memberof OO
	 * @method initClass
	 * @param fn
	 */
	initClass( fn: Function ): void;

	/**
	 * Inherit from prototype to another using Object#create.
	 *
	 * Beware: This redefines the prototype, call before setting your prototypes.
	 *
	 * Beware: This redefines the prototype, can only be called once on a function.
	 * If called multiple times on the same function, the previous prototype is lost.
	 * This is how prototypal inheritance works, it can only be one straight chain
	 * (just like classical inheritance in PHP for example). If you need to work with
	 * multiple constructors consider storing an instance of the other constructor in a
	 * property instead, or perhaps use a mixin (see OO.mixinClass).
	 *
	 *     function Thing() {}
	 *     Thing.prototype.exists = function () {};
	 *
	 *     function Person() {
	 *         Person.super.apply( this, arguments );
	 *     }
	 *     OO.inheritClass( Person, Thing );
	 *     Person.static.defaultEyeCount = 2;
	 *     Person.prototype.walk = function () {};
	 *
	 *     function Jumper() {
	 *         Jumper.super.apply( this, arguments );
	 *     }
	 *     OO.inheritClass( Jumper, Person );
	 *     Jumper.prototype.jump = function () {};
	 *
	 *     Jumper.static.defaultEyeCount === 2;
	 *     var x = new Jumper();
	 *     x.jump();
	 *     x.walk();
	 *     x instanceof Thing && x instanceof Person && x instanceof Jumper;
	 *
	 * @memberof OO
	 * @method inheritClass
	 * @param targetFn
	 * @param originFn
	 * @throws If target already inherits from origin
	 */
	inheritClass( targetFn: Function, originFn: Function ): void;

	/**
	 * Copy over *own* prototype properties of a mixin.
	 *
	 * The 'constructor' (whether implicit or explicit) is not copied over.
	 *
	 * This does not create inheritance to the origin. If you need inheritance,
	 * use inheritClass instead.
	 *
	 * Beware: This can redefine a prototype property, call before setting your prototypes.
	 *
	 * Beware: Don't call before inheritClass.
	 *
	 *     function Foo() {}
	 *     function Context() {}
	 *
	 *     // Avoid repeating this code
	 *     function ContextLazyLoad() {}
	 *     ContextLazyLoad.prototype.getContext() {
	 *         if ( !this.context ) {
	 *             this.context = new Context();
	 *         }
	 *         return this.context;
	 *     };
	 *
	 *     function FooBar() {}
	 *     inheritClass( FooBar, Foo );
	 *     mixinClass( FooBar, ContextLazyLoad );
	 *
	 * @memberof OO
	 * @method mixinClass
	 * @param targetFn
	 * @param originFn
	 */
	mixinClass( targetFn: Function, originFn: Function ): void;

	/**
	 * Test whether one class is a subclass of another, without instantiating it.
	 *
	 * Every class is considered a subclass of Object and of itself.
	 *
	 * @memberof OO
	 * @method isSubClass
	 * @param testFn The class to be tested
	 * @param baseFn The base class
	 * @return Whether testFn is a subclass of baseFn (or equal to it)
	 */
	isSubclass( testFn: Function, baseFn: Function ): boolean;

	/**
	 * Get a deeply nested property of an object using variadic arguments, protecting against
	 * undefined property errors.
	 *
	 * `quux = getProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `quux = obj.fbar.baz;`
	 * except that the former protects against JS errors if one of the intermediate properties
	 * is undefined. Instead of throwing an error, this function will return undefined in
	 * that case.
	 *
	 * @memberof OO
	 * @method getProp
	 * @param obj
	 * @param keys
	 * @return obj[arguments[1]][arguments[2]].... or undefined
	 */
	getProp( obj: Object, ...keys?: any[] ): Object | undefined;

	/**
	 * Set a deeply nested property of an object using variadic arguments, protecting against
	 * undefined property errors.
	 *
	 * `setProp( obj, 'foo', 'bar', 'baz' );` is equivalent to `obj.fbar = baz;` except that
	 * the former protects against JS errors if one of the intermediate properties is
	 * undefined. Instead of throwing an error, undefined intermediate properties will be
	 * initialized to an empty object. If an intermediate property is not an object, or if obj itself
	 * is not an object, this function will silently abort.
	 *
	 * @memberof OO
	 * @method setProp
	 * @param obj
	 * @param keys
	 * @param value
	 */
	setProp( obj: Object, ...keys?: any[], value: any ): void;

	/**
	 * Delete a deeply nested property of an object using variadic arguments, protecting against
	 * undefined property errors, and deleting resulting empty objects.
	 *
	 * @memberof OO
	 * @method deleteProp
	 * @param obj
	 * @param keys
	 */
	deleteProp( obj: Object, ...keys?: any[] ): void;

	/**
	 * Create a new object that is an instance of the same
	 * constructor as the input, inherits from the same object
	 * and contains the same own properties.
	 *
	 * This makes a shallow non-recursive copy of own properties.
	 * To create a recursive copy of plain objects, use #copy.
	 *
	 *     var foo = new Person( mom, dad );
	 *     fsetAge( 21 );
	 *     var foo2 = cloneObject( foo );
	 *     fsetAge( 22 );
	 *
	 *     // Then
	 *     foo2 !== foo; // true
	 *     foo2 instanceof Person; // true
	 *     foo2.getAge(); // 21
	 *     fgetAge(); // 22
	 *
	 * @memberof OO
	 * @method cloneObject
	 * @param origin
	 * @return Clone of origin
	 */
	cloneObject( origin: Object ): void;

	/**
	 * Get an array of all property values in an object.
	 *
	 * @memberof OO
	 * @method getObjectValues
	 * @param obj Object to get values from
	 * @return List of object values
	 */
	getObjectValues( obj: Object ): any[];

	/**
	 * Use binary search to locate an element in a sorted array.
	 *
	 * searchFunc is given an element from the array. `searchFunc(elem)` must return a number
	 * above 0 if the element we're searching for is to the right of (has a higher index than) elem,
	 * below 0 if it is to the left of elem, or zero if it's equal to elem.
	 *
	 * To search for a specific value with a comparator function (a `function cmp(a,b)` that returns
	 * above 0 if `a > b`, below 0 if `a < b`, and 0 if `a == b`), you can use
	 * `searchFunc = cmp.bind( null, value )`.
	 *
	 * @memberof OO
	 * @method binarySearch
	 * @param arr Array to search in
	 * @param searchFunc Search function
	 * @param forInsertion If not found, return index where val could be inserted
	 * @return Index where val was found, or null if not found
	 */
	binarySearch( arr: any[], searchFunc: Function, forInsertion?: boolean ): number | null;

	/**
	 * Recursively compare properties between two objects.
	 *
	 * A false result may be caused by property inequality or by properties in one object missing from
	 * the other. An asymmetrical test may also be performed, which checks only that properties in the
	 * first object are present in the second object, but not the inverse.
	 *
	 * If either a or b is null or undefined it will be treated as an empty object.
	 *
	 * @memberof OO
	 * @method compare
	 * @param a First object to compare
	 * @param b Second object to compare
	 * @param asymmetrical Whether to check only that a's values are equal to b's
	 *  (i.e. a is a subset of b)
	 * @return If the objects contain the same values as each other
	 */
	compare( a: Object | undefined | null, b: Object | undefined | null, asymmetrical?: boolean ): boolean;

	/**
	 * Create a plain deep copy of any kind of object.
	 *
	 * Copies are deep, and will either be an object or an array depending on `source`.
	 *
	 * @memberof OO
	 * @method copy
	 * @param source Object to copy
	 * @param leafCallback Applied to leaf values after they are cloned but before they are
	 *  added to the clone
	 * @param nodeCallback Applied to all values before they are cloned. If the
	 *  nodeCallback returns a value other than undefined, the returned value is used instead of
	 *  attempting to clone.
	 * @return Copy of source object
	 */
	copy( source: Object, leafCallback?: Function, nodeCallback?: Function ): Object;

	/**
	 * Generate a hash of an object based on its name and data.
	 *
	 * Performance optimization: <http://jsperf.com/ve-gethash-201208#/toJson_fnReplacerIfAoForElse>
	 *
	 * To avoid two objects with the same values generating different hashes, we utilize the replacer
	 * argument of JSON.stringify and sort the object by key as it's being serialized. This may or may
	 * not be the fastest way to do this; we should investigate this further.
	 *
	 * Objects and arrays are hashed recursively. When hashing an object that has a .getHash()
	 * function, we call that function and use its return value rather than hashing the object
	 * ourselves. This allows classes to define custom hashing.
	 *
	 * @memberof OO
	 * @method getHash
	 * @param val Object to generate hash for
	 * @return Hash of object
	 */
	getHash: getHash;

	/**
	 * Get the unique values of an array, removing duplicates.
	 *
	 * @memberof OO
	 * @method unique
	 * @param arr Array
	 * @return Unique values in array
	 */
	unique( arr: any[] ): any[];

	/**
	 * Compute the union (duplicate-free merge) of a set of arrays.
	 *
	 * Arrays values must be convertable to object keys (strings).
	 *
	 * By building an object (with the values for keys) in parallel with
	 * the array, a new item's existence in the union can be computed faster.
	 *
	 * @memberof OO
	 * @method simpleArrayUnion
	 * @param arrays Arrays to union
	 * @return Union of the arrays
	 */
	simpleArrayUnion( ...arrays: any[][] ): any[];

	/**
	 * Compute the intersection of two arrays (items in both arrays).
	 *
	 * Arrays values must be convertable to object keys (strings).
	 *
	 * @memberof OO
	 * @method simpleArrayIntersection
	 * @param a First array
	 * @param b Second array
	 * @return Intersection of arrays
	 */
	simpleArrayIntersection( a: any[], b: any[] ): any[];

	/**
	 * Compute the difference of two arrays (items in 'a' but not 'b').
	 *
	 * Arrays values must be convertable to object keys (strings).
	 *
	 * @memberof OO
	 * @method simpleArrayDifference
	 * @param a First array
	 * @param b Second array
	 * @return Intersection of arrays
	 */
	simpleArrayDifference( a: any[], b: any[] ): any[];

	/**
	 * Assert whether a value is a plain object or not.
	 *
	 * @memberof OO
	 * @param {any} obj
	 * @return {boolean}
	 */
	isPlainObject( obj: any ): boolean;

	EventEmitter: OoEventEmitterConstructor;

	EmitterList: OoEmitterListConstructor;

	SortedEmitterList: OoSortedEmitterListConstructor;

	Registry: OoRegistryConstructor;

	Factory: OoFactoryConstructor;
}

interface getHash {
	/**
	 * Generate a hash of an object based on its name and data.
	 *
	 * Performance optimization: <http://jsperf.com/ve-gethash-201208#/toJson_fnReplacerIfAoForElse>
	 *
	 * To avoid two objects with the same values generating different hashes, we utilize the replacer
	 * argument of JSON.stringify and sort the object by key as it's being serialized. This may or may
	 * not be the fastest way to do this; we should investigate this further.
	 *
	 * Objects and arrays are hashed recursively. When hashing an object that has a .getHash()
	 * function, we call that function and use its return value rather than hashing the object
	 * ourselves. This allows classes to define custom hashing.
	 *
	 * @memberof OO
	 * @method getHash
	 * @param val Object to generate hash for
	 * @return Hash of object
	 */
	( val: Object ): string;

	/**
	 * Sort objects by key (helper function for getHash).
	 *
	 * This is a callback passed into JSON.stringify.
	 *
	 * @memberof OO
	 * @method getHash_keySortReplacer
	 * @param {string} key Property name of value being replaced
	 * @param {any} val Property value to replace
	 * @return {any} Replacement value
	 */
	keySortReplacer( key: string, val: any ): any;
}

interface OoEventEmitterConstructor {
	/**
	 * @class
	 */
	new (): OoEventEmitter;
	prototype: OoEventEmitter;

	static: OoEventEmitterStatic;
}

type OoEventEmitterStatic = {};

type OoEventEmitterEvent = OOjs.Event;

interface OoEventEmitter<EventList extends OOjs.Event = OoEventEmitterEvent> {
	/**
	 * Storage of bound event handlers by event name.
	 *
	 * @private
	 */
	bindings: Object;

	/**
	 * Add a listener to events of a specific event.
	 *
	 * The listener can be a function or the string name of a method; if the latter, then the
	 * name lookup happens at the time the listener is called.
	 *
	 * @param event Type of event to listen to
	 * @param method Function or method name to call when event occurs
	 * @param args Arguments to pass to listener, will be prepended to emitted arguments
	 * @param context Context object for function or method call
	 * @throws Listener argument is not a function or a valid method name
	 */
	on<T extends string>( event: T, method: EventList[ T ] | string, args?: any[], context?: Object ): OoEventEmitter;

	/**
	 * Add a one-time listener to a specific event.
	 *
	 * @param event Type of event to listen to
	 * @param listener Listener to call when event occurs
	 */
	once<T extends string>( event: T, listener: EventList[ T ] ): OoEventEmitter;

	/**
	 * Remove a specific listener from a specific event.
	 *
	 * @param event Type of event to remove listener from
	 * @param method Listener to remove. Must be in the same form as was passed
	 * to "on". Omit to remove all listeners.
	 * @param context Context object function or method call
	 * @throws Listener argument is not a function or a valid method name
	 */
	off<T extends string>( event: T, method?: EventList[ T ] | string, context?: Object ): OoEventEmitter;

	/**
	 * Emit an event.
	 *
	 * All listeners for the event will be called synchronously, in an
	 * unspecified order. If any listeners throw an exception, this won't
	 * disrupt the calls to the remaining listeners; however, the exception
	 * won't be thrown until the next tick.
	 *
	 * Listeners should avoid mutating the emitting object, as this is
	 * something of an anti-pattern which can easily result in
	 * hard-to-understand code with hidden side-effects and dependencies.
	 *
	 * @param event Type of event
	 * @param args Arguments passed to the event handler
	 * @return Whether the event was handled by at least one listener
	 */
	emit( event: string, ...args: any[] ): boolean;

	/**
	 * Emit an event, propagating the first exception some listener throws
	 *
	 * All listeners for the event will be called synchronously, in an
	 * unspecified order. If any listener throws an exception, this won't
	 * disrupt the calls to the remaining listeners. The first exception
	 * thrown will be propagated back to the caller; any others won't be
	 * thrown until the next tick.
	 *
	 * Listeners should avoid mutating the emitting object, as this is
	 * something of an anti-pattern which can easily result in
	 * hard-to-understand code with hidden side-effects and dependencies.
	 *
	 * @param event Type of event
	 * @param args Arguments passed to the event handler
	 * @return Whether the event was handled by at least one listener
	 */
	emitThrow( event: string, ...args: any[] ): boolean;

	/**
	 * Connect event handlers to an object.
	 *
	 * @param context Object to call methods on when events occur
	 * @param methods
	 *  List of event bindings keyed by event name containing either method names, functions or
	 *  arrays containing method name or function followed by a list of arguments to be passed to
	 *  callback before emitted arguments.
	 */
	connect( context: Object, methods: Record<string, string | Function | any[]> ): OoEventEmitter;

	/**
	 * Disconnect event handlers from an object.
	 *
	 * @param context Object to disconnect methods from
	 * @param methods
	 *  List of event bindings keyed by event name. Values can be either method names, functions or
	 *  arrays containing a method name.
	 *  NOTE: To allow matching call sites with connect(), array values are allowed to contain the
	 *  parameters as well, but only the method name is used to find bindings. It is discouraged to
	 *  have multiple bindings for the same event to the same listener, but if used (and only the
	 *  parameters vary), disconnecting one variation of (event name, event listener, parameters)
	 *  will disconnect other variations as well.
	 */
	disconnect( context: Object, methods?: Record<string, string | Function | any[]> ): OoEventEmitter;
}

interface OoEmitterListConstructor {
	/**
	 * Contain and manage a list of @{link OO.EventEmitter} items.
	 *
	 * Aggregates and manages their events collectively.
	 *
	 * This mixin must be used in a class that also mixes in @{link OO.EventEmitter}.
	 *
	 * @abstract
	 * @class
	 */
	new (): OoEmitterList;
	prototype: OoEmitterList;

	static: OoEmitterListStatic;
}

type OoEmitterListStatic = {};

interface OoEmitterListEvent extends OOjs.Event {
	/**
	 * @event add
	 *
	 * Item has been added.
	 *
	 * @param item Added item
	 * @param index Index items were added at
	 */
	add( item: OoEventEmitter, index: number ): void;

	/**
	 * @event move
	 *
	 * Item has been moved to a new index.
	 *
	 * @param item Moved item
	 * @param index Index item was moved to
	 * @param oldIndex The original index the item was in
	 */
	move( item: OoEventEmitter, index: number, oldIndex: number ): void;

	/**
	 * @event remove
	 *
	 * Item has been removed.
	 *
	 * @param item Removed item
	 * @param index Index the item was removed from
	 */
	remove( item: OoEventEmitter, index: number ): void

	/**
	 * @event clear
	 *
	 * The list has been cleared of items.
	 *
	 */
	clear(): void;
}

interface OoEmitterList<EventList extends OOjs.Event = OoEmitterListEvent> {
	items: any[];

	aggregateItemEvents: EventList;

	/**
	 * Get all items.
	 *
	 * @return Items in the list
	 */
	getItems(): OoEventEmitter[];

	/**
	 * Get the index of a specific item.
	 *
	 * @param item Requested item
	 * @return Index of the item
	 */
	getItemIndex( item: OoEventEmitter ): number;

	/**
	 * Get number of items.
	 *
	 * @return Number of items in the list
	 */
	getItemCount(): number;

	/**
	 * Check if a list contains no items.
	 *
	 * @return Group is empty
	 */
	isEmpty(): boolean;

	/**
	 * Aggregate the events emitted by the group.
	 *
	 * When events are aggregated, the group will listen to all contained items for the event,
	 * and then emit the event under a new name. The new event will contain an additional leading
	 * parameter containing the item that emitted the original event. Other arguments emitted from
	 * the original event are passed through.
	 *
	 * @param events An object keyed by the name of the event that
	 *  should be aggregated  (e.g., ‘click’) and the value of the new name to use
	 *  (e.g., ‘groupClick’). A `null` value will remove aggregated events.
	 * @throws If aggregation already exists
	 */
	aggregate( events: Record<string, string> | null ): void;

	/**
	 * Add items to the list.
	 *
	 * @param items Item to add or
	 *  an array of items to add
	 * @param index Index to add items at. If no index is
	 *  given, or if the index that is given is invalid, the item
	 *  will be added at the end of the list.
	 * @fires OO.EmitterList#add
	 * @fires OO.EmitterList#move
	 */
	addItems( items: OoEventEmitter | OoEventEmitter[], index?: number ): OoEmitterList;

	/**
	 * Move an item from its current position to a new index.
	 *
	 * The item is expected to exist in the list. If it doesn't,
	 * the method will throw an exception.
	 *
	 * @private
	 * @param item Items to add
	 * @param newIndex Index to move the item to
	 * @return The index the item was moved to
	 * @throws If item is not in the list
	 */
	moveItem( item: OoEventEmitter, newIndex: number ): number;

	/**
	 * Utility method to insert an item into the list, and
	 * connect it to aggregate events.
	 *
	 * Don't call this directly unless you know what you're doing.
	 * Use #addItems instead.
	 *
	 * This method can be extended in child classes to produce
	 * different behavior when an item is inserted. For example,
	 * inserted items may also be attached to the DOM or may
	 * interact with some other nodes in certain ways. Extending
	 * this method is allowed, but if overridden, the aggregation
	 * of events must be preserved, or behavior of emitted events
	 * will be broken.
	 *
	 * If you are extending this method, please make sure the
	 * parent method is called.
	 *
	 * @protected
	 * @param item Item to add
	 * @param index Index to add items at
	 * @return The index the item was added at
	 */
	insertItem( item: OoEventEmitter | Object, index: number ): number;

	/**
	 * Remove items.
	 *
	 * @param items Items to remove
	 * @fires OO.EmitterList#remove
	 */
	removeItems( items: OoEventEmitter[] ): OoEmitterList;

	/**
	 * Clear all items.
	 *
	 * @fires OO.EmitterList#clear
	 */
	clearItems(): OoEmitterList;
}

interface OoSortedEmitterListConstructor {
	/**
	 * Manage a sorted list of OO.EmitterList objects.
	 *
	 * The sort order is based on a callback that compares two items. The return value of
	 * callback( a, b ) must be less than zero if a < b, greater than zero if a > b, and zero
	 * if a is equal to b. The callback should only return zero if the two objects are
	 * considered equal.
	 *
	 * When an item changes in a way that could affect their sorting behavior, it must
	 * emit the {@link OO.SortedEmitterList#event:itemSortChange itemSortChange} event.
	 * This will cause it to be re-sorted automatically.
	 *
	 * This mixin must be used in a class that also mixes in {@link OO.EventEmitter}.
	 *
	 * @abstract
	 * @class
	 * @mixes OO.EmitterList
	 * @param sortingCallback Callback that compares two items.
	 */
	new ( sortingCallback: Function ): OoSortedEmitterList;
	prototype: OoSortedEmitterList;

	static: Object;
}

type OoSortedEmitterListStatic = OoEventEmitterStatic & {};

interface OoSortedEmitterListEvent extends OoEmitterListEvent {
	/**
	 * @event itemSortChange
	 *
	 * An item has changed properties that affect its sort positioning
	 * inside the list.
	 */
	itemSortChange(): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface OoSortedEmitterList<EventList extends OoEmitterListEvent = OoSortedEmitterListEvent> extends OoEmitterList<OoSortedEmitterListEvent> {
	sortingCallback: Function;

	/**
	 * Handle a case where an item changed a property that relates
	 * to its sorted order.
	 *
	 * @param item Item in the list
	 */
	onItemSortChange( item: OoEventEmitter ): void;

	/**
	 * Change the sorting callback for this sorted list.
	 *
	 * The callback receives two items. The return value of callback(a, b) must be less than zero
	 * if a < b, greater than zero if a > b, and zero if a is equal to b.
	 *
	 * @param sortingCallback Sorting callback
	 */
	setSortingCallback( sortingCallback: Function ): void;

	/**
	 * Add items to the sorted list.
	 *
	 * @param items Item to add or
	 *  an array of items to add
	 * @return
	 */
	addItems( items: OoEventEmitter | OoEventEmitter[] ): OoSortedEmitterList;

	/**
	 * Find the index a given item should be inserted at. If the item is already
	 * in the list, this will return the index where the item currently is.
	 *
	 * @param item Items to insert
	 * @return The index the item should be inserted at
	 */
	findInsertionIndex( item: OoEventEmitter ): number;
}

interface OoRegistryConstructor {
	/**
	 * A map interface for associating arbitrary data with a symbolic name. Used in
	 * place of a plain object to provide additional {@link OO.Registry#register registration}
	 * or {@link OO.Registry#lookup lookup} functionality.
	 *
	 * See <https://www.mediawiki.org/wiki/OOjs/Registries_and_factories>.
	 *
	 * @class
	 * @mixes OO.EventEmitter
	 */
	new (): OoRegistry;
	prototype: OoRegistry;

	static: OoRegistryStatic;
}

type OoRegistryStatic = OoEventEmitterStatic & {};

interface OoRegistryEvent extends OoEmitterListEvent {
	/**
	 * @event register
	 *
	 * @param {string} name
	 * @param {any} data
	 */
	register( name: string, data: any ): void;

	/**
	 * @event unregister
	 *
	 * @param {string} name
	 * @param {any} data Data removed from registry
	 */
	unregister( name: string, data: any ): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface OoRegistry<EventList extends OoEventEmitterStatic = OoRegistryStatic> extends OoEventEmitter<OoRegistryStatic> {
	registry: Object;

	/**
	 * Associate one or more symbolic names with some data.
	 *
	 * Any existing entry with the same name will be overridden.
	 *
	 * @param name Symbolic name or list of symbolic names
	 * @param data Data to associate with symbolic name
	 * @fires OO.Registry#register
	 * @throws Name argument must be a string or array
	 */
	register( name: string | string[], data: any ): void;

	/**
	 * Remove one or more symbolic names from the registry.
	 *
	 * @param name Symbolic name or list of symbolic names
	 * @fires OO.Registry#unregister
	 * @throws Name argument must be a string or array
	 */
	unregister( name: string|string[] ): void;

	/**
	 * Get data for a given symbolic name.
	 *
	 * @param name Symbolic name
	 * @return Data associated with symbolic name
	 */
	lookup( name: string ): any | undefined;
}

interface OoFactoryConstructor extends OoRegistryConstructor {
	/**
	 * @class
	 * @extends OO.Registry
	 */
	new (): OoFactory;
	prototype: OoFactory;

	static: OoFactoryStatic;

	super: OoRegistryConstructor;
}

type OoFactoryStatic = OoRegistryStatic & {};

type OoFactoryEvent = OoRegistryEvent & {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface OoFactory<EventList extends OoRegistryStatic = OoFactoryEvent> extends OoRegistry<OoFactoryEvent> {
	/**
	 * Register a constructor with the factory.
	 *
	 *     function MyClass() {};
	 *     OO.initClass( MyClass );
	 *     MyClass.static.name = 'hello';
	 *     // Register class with the factory, available via the symbolic name "hello"
	 *     factory.register( MyClass );
	 *
	 * @param constructor Constructor to use when creating object
	 * @param name Symbolic name to use for #create().
	 *  This parameter may be omitted in favour of letting the constructor decide
	 *  its own name, through `constructor.static.name`.
	 * @throws If a parameter is invalid
	 */
	register( constructor: Function, name?: string ): void;

	/**
	 * Unregister a constructor from the factory.
	 *
	 * @param name Constructor function or symbolic name to unregister
	 * @throws If a parameter is invalid
	 */
	unregister( name: string | Function ): void;

	/**
	 * Create an object based on a name.
	 *
	 * Name is used to look up the constructor to use, while all additional arguments are passed to the
	 * constructor directly, so leaving one out will pass an undefined to the constructor.
	 *
	 * @param name Object name
	 * @param args Arguments to pass to the constructor
	 * @return The new object
	 * @throws Unknown object name
	 */
	create( name: string, ...args?: any ): Object;
}
