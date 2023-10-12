

/**
 * A transformation between coordinate systems. When being mapped between the scale and the paint device
 * coordinate system, Transform manipulates values.
 * A transformation consists of 2 methods:{@link transform}and{@link invTransform} where one is is the inverse function of the other.
 *
 * A transformation consists of 2 methods:
 * - transform
 * - invTransform
 *
 * where one is is the inverse function of the other.
 *
 * When p1, p2 are the boundaries of the paint device coordinates and s1, s2 the boundaries of the scale, ScaleMap uses the following calculations:
 *
 * p = p1 + ( p2 - p1 ) * ( T( s ) - T( s1 ) / ( T( s2 ) - T( s1 ) );
 *
 * s = invT ( T( s1 ) + ( T( s2 ) - T( s1 ) ) * ( p - p1 ) / ( p2 - p1 ) );
 */
class Transform {
  constructor() {}
  /**
   *
   * @returns {String} A string representing the object.
   */
  toString() {
    return "[Transform]";
  }

  /**
   * Modify value to be a valid value for the transformation. The default implementation does nothing.
   * @param {*} value Value to be bounded
   * @returns {Number} unmodified value
   */
  bounded(value) {
    return value;
  }

  /**
   * Transformation function
   * @param {Number} value Value
   * @returns {Number} modified value
   * @see {@link Transform#invTransform invTransform()}
   */
  transform(value) {
    //Subclass must implement
  }

  /**
   * Inverse transformation function
   * @param {Number} value Value
   * @returns {Number} modified value
   * @see {@link Transform#transform transform()}
   */
  invTransform(value) {
    //Subclass must implement
  }

  /**
   *
   * @returns {Transform} Clone of the transformation
   */
  copy() {
    return new Transform();
  }
}

/**
 * Null transformation.
 *
 * NullTransform returns the values unmodified.
 * @extends Transform
 */
class NullTransform extends Transform {
  constructor() {
    super();
  }

  //Documented in base class
  toString() {
    return "[NullTransform]";
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} value unmodified
   */
  transform(value) {
    return value;
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} value unmodified
   */
  invTransform(value) {
    return value;
  }

  /**
   *
   * @returns {NullTransform} Clone of the transformation
   */
  copy() {
    return new NullTransform();
  }
}

/**
 * Logarithmic transformation.
 *
 * LogTransform modifies the values using log() and exp().
 * @extends Transform
 */
class LogTransform extends Transform {
  constructor() {
    super();
  }

  //Documented in base class
  toString() {
    return "[LogTransform]";
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} log( value )
   */
  transform(value) {
    return Math.log(value);
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} exp( value )
   */
  invTransform(value) {
    return Math.exp(value);
  }

  /**
   *
   * @param {Number} value Value to be bounded
   * @returns {Number} bounded value
   */
  bounded(value) {
    if (value > Number.MAX_VALUE) return Number.MAX_VALUE;
    if (value < Number.MIN_VALUE) return Number.MIN_VALUE;
    return value;
  }

  /**
   *
   * @returns {LogTransform} Clone of the transformation
   */
  copy() {
    return new LogTransform();
  }
}

/**
 *A transformation using pow()
 *
 * PowerTransform preserves the sign of a value. e.g. a transformation with
 * a factor of 2 transforms a value of -3 to -9 and vice-versa. Thus PowerTransform
 * can be used for scales including negative values.
 * @extends Transform
 */
class PowerTransform extends Transform {
  /**
   *
   * @param {Number} exponent Exponent
   */
  constructor(exponent) {
    super();
    this.d_exponent = exponent;
  }

  //Documented in base class
  toString() {
    return "[PowerTransform]";
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} Exponentiation preserving the sign
   */
  transform(value) {
    if (value < 0.0) return -Math.pow(-value, 1.0 / this.d_exponent);
    else return Math.pow(value, 1.0 / this.d_exponent);
  }

  /**
   *
   * @param {Number} value Value to be transformed
   * @returns {Number} Inverse exponentiation preserving the sign
   */
  invTransform(value) {
    if (value < 0.0) return -Math.pow(-value, this.d_exponent);
    else return Math.pow(value, this.d_exponent);
  }

  /**
   *
   * @returns {PowerTransform} Clone of the transformation
   */
  copy() {
    return new PowerTransform(this.d_exponent);
  }
}
