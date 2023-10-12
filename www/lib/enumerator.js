"use strict";

/**
 * A class for defining and managing enum types. Enum types are readonly. An attempt to overwrite an enum fails 
 * and throws an error in strict mode.
 * 
 */
class Enumerator {
	/**
	 * Sets the default namespace for enum(s). The default namespace is used if {@link Enumerator.enum Enumerator.enum()} is called without 
	 * a namespace argument. This method is usually called once and very early in the application.
	 * @see {@link EnumBase}
	 * @see {@link Enumerator.enum Enumerator.enum()}
	 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
	 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
	 * @param {string} ns The default enum namespace. 
	 */
	static setDefaultEnumNampespace(ns) {
		Enumerator.defaultEnumNameSpace = ns;
	}

	/**
	 * Applications call this method to get the default namespace.
	 * @returns {object} the default namespace.
	 * @see {@link EnumBase}
	 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
	 * @see {@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace()}
	 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
	 * @see {@link Enumerator.enum Enumerator.enum()}
	 */
	static getDefaultEnumNampespace() {
		return window[Enumerator.defaultEnumNameSpace] || window;
	}

	/**
	 * This method puts Enumerator in a state that prevents{@link Enumerator.enum Enumerator.enum()}frow throwing an error during enum re-definition.{@link Enumerator.enum Enumerator.enum()}silently returns without performing the re-definition. If{@link Enumerator.enum Enumerator.enum()}is called in the constructor, this method may be use to suppress re-definition errors. It is never good to suppress errors. Applications should instead use{@link Enumerator.enumExist Enumerator.enumExist()}in conditional logic. 
	 * @see {@link EnumBase}
	 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
	 * @see {@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace()}
	 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
	 * @see {@link Enumerator.enum Enumerator.enum()}
	 */
	static noThrowOnEnumRedefinition() {
		Enumerator.throwOnError = false;
	}

	/**
	 * Check if the enum exist.
	 * @see {@link EnumBase}
	 * @see {@link Enumerator.enum Enumerator.enum()}
	 * @see {@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace()}
	 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
	 * @see {@link Enumerator.noThrowOnEnumRedefinition Enumerator.noThrowOnEnumRedefinition()}
	 * @param {string} enumName enum name.
	 * @returns {boolean} true/false
	 */
	static enumExist(enumName) {
		var ns = window[Enumerator.defaultEnumNameSpace] || window;
		return ns[enumName] == undefined ? false : true;
	}


	/**
	 * Creates an object that represents an enum. By default, this method throws an error during an enum re-definition attempt. To prevent throwing call{@link Enumerator.noThrowOnEnumRedefinition Enumerator.noThrowOnEnumRedefinition().}See example below.  
	 * @see {@link EnumBase}
	 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
	 * @see {@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace()}
	 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
	 * @see {@link Enumerator.noThrowOnEnumRedefinition Enumerator.noThrowOnEnumRedefinition()}
	 * @throws may throw an error if the first argument is not a string that properly describes a not previously defined enum.
	 * @throws may throw an error if the second argument points to an invalid nameSpace.
	 * @throws may throw an error if the enum was previously defined. Use{@link Enumerator.enumExist Enumerator.enumExist()}to check if a enum exist.
	 * @throws may throw an error if the enum flag value is not an integer or cannot be converted to an integer.
	 * @throws may throw an error if the enum flag values are not in ascending order.
	 * @param {string} enumStr A string describing the enum to be defined (e.g. "ErrorType { noError= 0, start, contain, keyword }").
	 * @param {object} [nameSpace] The namespace in which the enum is defined. If Enumerator.enum() is called without a nameSpace 
	 * argument, the default namespace is used. Unless explicitly set using the{@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace(),}the default namespace is the window. 
	 * @example
	 * //Set Enum as the default namespace.
	 * Enumerator.setDefaultEnumNampespace("Enum");
	 * 
	 * //Defines an enum "ErrorType" in the Enum namespace.
	 * Enumerator.enum("ErrorType { noError, start, contain, keyword }"); 
	 * console.log(Enum.ErrorType.keyword); //3
	 * //or
	 * Enumerator.enum("ErrorType { noError=10, start, contain, keyword }");
	 * console.log(Enum.ErrorType.keyword); //13 
	 * 
	 * //Defines an enum "ErrorType" in the MyClass namespace. 
	 * class MyClass {
	 * 		...	  		
	 * }
	 * Enumerator.enum("ErrorType { noError=10, start, contain, keyword }", MyClass); //After class declarion (preferred). Useful 
	 * if the class does not implement a constructor.
	 * 
	 * or
	 * class MyClass {
	 * 	constructor(){
	 * 		//Avoid this. Each time a MyClass object is instantiated this call is executed.
	 * 		Enumerator.enum("ErrorType { noError=10, start, contain, keyword }", MyClass); 
	 * 		...
	 *          
	 * 		//Better do this
	 * 		if(!Enumerator.enumExist("ErrorType")){ //The enum ErrorType does not exist. Safe to create it.
	 * 			Enumerator.enum("ErrorType { noError=10, start, contain, keyword }", MyClass);
	 * 		}
	 * 
	 * 		//or better yet
	 *		//call Enumerator.enum() outside (but after) the class declaration as shown below. 
	 *	}
	 * }
	 * Enumerator.enum("ErrorType { noError=10, start, contain, keyword }", MyClass); //This call represents best practice.
	 * console.log(MyClass.ErrorType.keyword); //13
	 * 
	 * 
	 */
	static enum(enumStr, nameSpace) {
		function isAlpha(ch) {
			return typeof ch === "string" && ch.length === 1
				&& (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z");
		}
		function isValidFlagName(flagName) {
			if (flagName.length == 0 || !isAlpha(flagName[0])) return false;
			for (let i = 1; i < flagName.length; i++) {
				if (!isAlpha(flagName[i]) && flagName[i] !== '_' && !Number.isInteger(parseInt(flagName[i])))
					return false;
			}
			return true;
		}
		if (arguments.length == 1 && window[Enumerator.defaultEnumNameSpace] == undefined) {
			if (Enumerator.defaultEnumNameSpace.length) window[Enumerator.defaultEnumNameSpace] = {};
		}
		if (nameSpace && typeof nameSpace != 'function') throw Error("Enumerator.enum() called with invalid second argument.");
		var ns = nameSpace || window[Enumerator.defaultEnumNameSpace] || window;
		var lastValue = undefined;
		var trimStr = enumStr.trim();
		var arr = trimStr.split('{');
		var enumName = arr[0].trim();
		var flags = arr[1].replace('}', '').split(',');

		if (ns[enumName]) {
			if (Enumerator.throwOnError)
				throw Error(`Redefinition of enum ${enumName}`);
			else
				return;
		}
		ns[enumName] = {};

		var flagName;
		for (var i = 0; i < flags.length; i++) {
			var flag = flags[i].split('=');
			var flagName = flag[0].trim();
			if (!isValidFlagName(flagName)) throw Error(`${flagName} is a invalid name for an enum constant.`);
			if (!isAlpha(flagName[0])) throw Error("Improperly defined Enum");
			if (flag.length > 2) throw Error("Improperly defined Enum");
			if (flag.length == 2) {//we have a name and value;
				var val = parseInt(flag[1])
				if (!Number.isInteger(val)) throw Error("Invalid enum value.");
				if (lastValue && val <= lastValue) {
					throw Error("Enum values must be in ascending order");
				}
				lastValue = val;
			} else {
				if (lastValue == undefined) {
					lastValue = 0
				} else {
					lastValue++;
				}

			}
			ns[enumName][flagName] = lastValue;
		}
		Object.freeze(ns[enumName]);
	}
}

//static variables
Enumerator.defaultEnumNameSpace = "";
Enumerator.throwOnError = true;


/**
 * Classes that are interested in C++ - like enum(s) should inherit EnumBase and use the dot notatation on the derived class to call the static method{@link EnumBase.enum enum().}The enum is always created in the namespace of the derived class. The methods{@link Enumerator.setDefaultEnumNampespace setDefaultEnumNampespace()}and{@link Enumerator.getDefaultEnumNampespace getDefaultEnumNampespace()}are not applicable. See example below. 
 * @see {@link Enumerator.setDefaultEnumNampespace Enumerator.setDefaultEnumNampespace()}
 * @see {@link Enumerator.getDefaultEnumNampespace Enumerator.getDefaultEnumNampespace()}
 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
 * @see {@link Enumerator.enum Enumerator.enum()}
 * @see {@link Enumerator.noThrowOnEnumRedefinition Enumerator.noThrowOnEnumRedefinition()} 
 * 
 * @example 
 * class MyClass extends EnumBase{
 *     //....
 * }
 * MyClass.enum("ErrorValue {a, b, c}"); //create an enum in the MyClass namespace.
 * console.log(MyClass.ErrorValue) //{a: 0, b: 1, c: 2}
 */
class EnumBase {
	/**
	 * Creates an object that represents an enum.
	 * By default, this method throws an error during a re-definition attempt. To prevent throwing call{@link Enumerator.noThrowOnEnumRedefinition Enumerator.noThrowOnEnumRedefinition().} 
	 * @see {@link Enumerator.enumExist Enumerator.enumExist()}
	 * @throws may throw an error if the first argument is not a string that properly describes a not previously defined enum.
	 * @throws may throw an error if the enum was previously defined. Use{@link Enumerator.enumExist Enumerator.enumExist()}to check if a enum exist.
	 * @throws may throw an error if the enum flag value is not an integer or cannot be converted to an integer.
	 * @throws may throw an error if the enum flag values are not in ascending order.
	 * @param {string} enumDefStr A string describing the enum to be defined (e.g. "ErrorType { noError= 0, start, contain, keyword }").
	 */
	static enum(enumDefStr) {
		Enumerator.enum(enumDefStr, this)
	}
}