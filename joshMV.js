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

	const validateArray = validateType('Array');
	const validateBoolean = validateType('Boolean');
	const validateFunction = validateType('Function');
	const validateObject = validateType('Object');
	const validateNull = validateType('Null');
	const validateNumber = validateType('Number');
	const validateRegExp = validateType('RegExp');
	const validateString = validateType('String');
	const validateUndefined = validateType('Undefined');

	/* Validates the variable passed in is a function and calls it */
	/* ((Function, ...Params) -> Function(Params)) */
	const safeFunctionCall = (func, ...params) => validateFunction(func)(params);

	/* Calls a function from the object and the path if valid */
	/* First param is an Object */
	/* Second param is an Array or a String of the path of the Object */
	/* ((Object, (Array or String), ...Params) -> Function(Params)) */
	const safeFunctionCallFromObj = (obj, path, ...params) => {
		if (obj) {
			path = (R.type(path) == 'String') ? [path] : (R.type(path) == 'Array') ? path : null;
			if (path != null) {
				// R.pipe(R.pathOr(null), (func) => (safeFunctionCall(func, params)))(path, obj);
				let myFunc = R.pathOr(null, path, obj);
				if (myFunc != null && R.type(myFunc) == 'Function') return safeFunctionCall(myFunc, params);
			}
		}
		// throw new Error('JoshMV Error -- Bad path to function or obj.path != function');
		return null;
	};

	exports.parseStatusCode = parseStatusCode;
	exports.safeFunctionCall = safeFunctionCall;
	exports.safeFunctionCallFromObj = safeFunctionCallFromObj;
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