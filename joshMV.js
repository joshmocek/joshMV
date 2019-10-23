(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
		(factory((global.J = {})));
}(this, (function(exports) {
	'use strict';
	const R = require('ramda');
	const _toUppercase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
	const parseStatusCode = (code) => (!isNaN(parseInt(code, 10))) ? parseInt(code, 10) : -1;

	/* Takes String and removes begining and ending "'s */
	/* ((String) -> String) */
	const stripEndQuotes = (s) => {
		if (s) {
			let t = s.length;
			if (s.charAt(0) == '"') s = s.substring(1, t--);
			if (s.charAt(--t) == '"') s = s.substring(0, t);
		} else {
			s = '';
		}
		return s;
	};

	/* Validates the type of a variable, if True returns variable else return default of the thingType passed in */
	/* ((String thingType, Variable thing) -> Variable of type thingType) */
	const validateType = (thingType) => (thing) => {
		thingType = _toUppercase(thingType);
		if (R.type(thing) === thingType) return thing;
		switch (thingType) {
			case 'Array':
				return [];
			case 'Boolean':
				return false;
			case 'Function':
				return R.identity;
			case 'Object':
				return {};
			case 'Null':
				return null;
			case 'Number':
				return 0;
			case 'RegExp':
				return new RegExp("/.*/");
			case 'String':
				return '';
			case 'Undefined':
				return undefined;
		}
	};

	/* Takes fn and if type is not a function returns an identity function */
	/* ((Function) -> Function) */
	const validateArray = validateType('Array');
	const validateBoolean = validateType('Boolean');
	const validateFunction = validateType('Function');
	const validateObject = validateType('Object');
	const validateNull = validateType('Null');
	const validateNumber = validateType('Number');
	const validateRegExp = validateType('RegExp');
	const validateString = validateType('String');
	const validateUndefined = validateType('Undefined');

	/*
	 * Returns the supplied function's return by applying
	 * the supplied parameters to the passed function.
	 * Note that if the supplied function is != 'Function'
	 * then the supplied function defaults to (x) => x;
	 *
	 * Validates the variable passed in is a function and calls it
	 * ((Function)(...Params) -> Function(Params))
	 *
	 * @func
	 * @memberOf J
	 * @since v0.1.0
	 * @category Function
	 * @sig (func) => (...params) => func(...params)
	 * @param {Function} func
	 * @param {...*} params to pass to the function
	 * @return {*} returns func(...*)
	 * @see J.safePathFuncOnObj, J.safeFunctionCallFromObj
	 * @example
	 *
	 *			let add2 = (x, y) => x + y;
	 *      J.safeFunctionCall(add2)(1, 2); //=> 3
	 *
	 *			let safeAdd2 = J.safeFunctionCall(add2);
	 *			safeAdd2(3, 2): //=> 5
	 */

	const safeFunctionCall = (func) => (...params) => validateFunction(func)(...params);

	/* Calls a function from the object and the path if valid */
	/* First param is an Object */
	/* Second param is an Array or a String of the path of the Object */
	/* ((Array or String) => (Object) => (...Params) -> Function(...Params)) */
	const safeFunctionCallFromObj = (path) => (obj) => (...params) => {
		if (obj) {
			path = (R.type(path) == 'String') ? [path] : (R.type(path) == 'Array') ? path : null;
			if (path != null) {
				// R.pipe(R.pathOr(null), (func) => (safeFunctionCall(func, params)))(path, obj);
				let myFunc = R.pathOr(null, path, obj);
				if (myFunc != null && R.type(myFunc) == 'Function') return safeFunctionCall(myFunc)(...params);
			}
		}
		console.error('JoshMV Error -- Bad path to function or obj.path != function: ' + JSON.stringify(path));
		return null;
	};

	/*
	 * Returns the function at the object's path function return by applying
	 * the supplied parameters to the passed function.
	 * Note that if the supplied object's path is != 'Function'
	 * then the supplied function defaults to (x) => x;
	 *
	 * Validates that the object path is a valid function and returns
	 * the functions return. Any of the parameters are invalid it returns null.
	 * (Array or String) => (Object) => (...Params) -> Object[path](Params)
	 *
	 * @func
	 * @memberOf J
	 * @since v0.1.0
	 * @category Function
	 * @sig (path) => (obj) => (...params) => obj[path](...params)
	 * @param {Array|String} path to traverse
	 * @param {Object} obj An object that has a function at the path supplied
	 * @param {...*} params to pass to the function
	 * @return {*} returns obj[path](...*)
	 * @see J.safeFunctionCall, J.safeFunctionCallFromObj
	 * @example
	 *			const simpleObj = {
	 *				"add2": (x, y) => x + y
	 *			};
	 *      J.safePathFuncOnObj('add2')(simpleObj)(5, 4); //=> 9
	 *
	 *			let safeAdd2FromObj = J.safePathFuncOnObj('add2');
	 *			safeAdd2FromObj(simpleObj)(5, 3): //=> 8
	 *
	 *			J.safePathFuncOnObj('add3')(simpleObj)(1, 2); //=> null
	 *			// JoshMV Error -- Bad Function : 'add3'
	 *
	 *			J.safePathFuncOnObj('add2')(null)(2, 3); //=> null
	 *			// JoshMV Error -- Bad Obj : 'null'
	 */

	const safePathFuncOnObj = (path) => {
		let _path = (R.type(path) == 'String') ? [path] : (R.type(path) == 'Array') ? path : null;
		if (_path == null) {
			console.error('JoshMV Error -- Bad path : ' + JSON.stringify(path));
			return (x) => (...y) => null;
		}
		return (obj) => {
			if (obj) {
				let myFunc = R.pathOr(null, _path, obj);
				if (myFunc != null && R.type(myFunc) == 'Function') return safeFunctionCall(myFunc);
				console.error('JoshMV Error -- Bad Function : ' + JSON.stringify(path));
			}
			if (!obj) console.error('JoshMV Error -- Bad Obj : ' + JSON.stringify(obj));
			return (...uselessParams) => null;
		};
	};

	exports.parseStatusCode = parseStatusCode;
	exports.safeFunctionCall = safeFunctionCall;
	exports.safeFunctionCallFromObj = safeFunctionCallFromObj;
	exports.safePathFuncOnObj = safePathFuncOnObj;
	exports.stripEndQuotes = stripEndQuotes;
	exports.validateArray = validateArray;
	exports.validateBoolean = validateBoolean;
	exports.validateFunction = validateFunction;
	exports.validateObject = validateObject;
	exports.validateNull = validateNull;
	exports.validateNumber = validateNumber;
	exports.validateRegExp = validateRegExp;
	exports.validateString = validateString;
	exports.validateUndefined = validateUndefined;

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
})));