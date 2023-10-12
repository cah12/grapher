/**
 * Abstract class representing a function.
 */
class AbstractFunction {
    constructor() {
        this.members = [];
    }
    /**
     * Converts an arbitrary object into a {@link Function}.
     * @param o The object to convert. If o is a function, it is returned as is.
     * Otherwise, o is converted into a {@link ConstantFunction} that returns
     * the {@link Value} lifted from o.
     * @return The converted function
     */
    static lift(o) {
        if (o instanceof AbstractFunction) {
            return o;
        }
        return new ConstantFunction(Value.lift(o));
    }

    /**
     * Computes the return value of the function from its provided input
     * arguments.
     * @param arguments A variable number of input arguments
     * @return The return value of the function
     */
    evaluate() { //virtual
        // To be overridden by descendants
        return null;
    }

    /**
     * Binds a variable name to a specific value.
     * @param variable The name of the variable
     * @param value The value to bind this variable to
     */
    setTo(variable, value) {
        // To be overridden by descendants
    }
    /**
     * Gets the arity of the function.
     * @return The arity
     */
    getArity() {//virtual
        return 0;
    }

    equals(o) {
        if (o == null || !(o instanceof AbstractFunction)) {
            return false;
        }
        return o == this;
    }

    // d is a deserializer and j is a JSON structure
    static deserialize(d, j) {
        const params = [];
        for (const serializedParam of j.contents) {
            if (typeof serializedParam == "object" && Object.keys(serializedParam).length == 2 && typeof serializedParam.name != "undefined" && typeof serializedParam.contents != "undefined") {
                params.push(d.deserialize(serializedParam));
            } else {
                params.push(serializedParam);
            }
        }
        return new this(...params);
    }

    toJson() {
        const serializedMembers = [];
        for (const member of this.members) {
            if (typeof member == "object" && AbstractFunction.isPrototypeOf(member.constructor)) {
                serializedMembers.push(member.toJson())
            } else {
                serializedMembers.push(member);
            }
        }
        return {
            "name": this.constructor.name,
            "contents": serializedMembers
        };
    }

}


/**
 * Function or arity 0 that always returns the same object.
 * @extends AbstractFunction
 */
class ConstantFunction extends AbstractFunction {
    /**
     * Creates a new instance of constant function.
     * @param o The object to return
     */
    constructor(o) {
        super();
        this.members = [o];
        this.value = Value.lift(o);
    }

    evaluate() { //override base
        return this.value;
    }

    getArity() { //override base
        return 0;
    }

    set(variable, value) {
        return this;
    }
}