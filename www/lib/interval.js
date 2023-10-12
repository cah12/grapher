"use strict";

/**
 * A class representing an interval.
 *
 * The interval is represented by 2 numbers, the lower and the upper limit.
 *
 */
class Interval {
  /**
   * The constructor is overloaded. See example.
   * @param {Number} [minValue] Minimum value
   * @param {Number} [maxValue] Maximum value
   * @param {Interval.BorderFlag} borderFlags=Interval.BorderFlag.IncludeBorders Include/Exclude borders
   * @example
   * const interval = new Interval(); //Creates an invalid interval [0.0, -1.0]
   * const interval = new Interval(4.5, 104.6); //Build an interval with from min/max values. Include borders.
   * const interval = new Interval(4.5, 104.6, Interval.BorderFlag.ExcludeBorders); //Build an interval with from min/max values. Exclude borders.
   */
  constructor(minValue, maxValue, borderFlags) {
    // if(minValue <= Number.MIN_VALUE && maxValue == 0){
    //     minValue = -0.5;
    //     maxValue = 0.5;
    // }

    // console.log(`min: ${minValue}`)
    // console.log(`max: ${maxValue}`)
    var d_minValue = 0.0;
    var d_maxValue = -1.0;
    var d_borderFlags = Interval.BorderFlag.IncludeBorders;

    //minValue, maxValue, borderFlags
    if (typeof minValue !== "undefined" && typeof maxValue !== "undefined") {
      d_minValue = minValue;
      d_maxValue = maxValue;
    }
    if (typeof borderFlags !== "undefined") d_borderFlags = borderFlags;

    /**
     * Change the border flags
     * @param {Interval.BorderFlag} borderFlags  Or'd BorderMode flags
     * @see {@link Interval#borderFlags borderFlags()}
     */
    this.setBorderFlags = function (borderFlags) {
      d_borderFlags = borderFlags;
    };

    /**
     *
     * @returns {Interval.BorderFlag} Border flags
     * @see {@link Interval#setBorderFlags setBorderFlags()}
     */
    this.borderFlags = function () {
      return d_borderFlags;
    };

    /**
     * Assigns the lower limit of the interval
     * @param {Number} minValue Minimum value
     */
    this.setMinValue = function (minValue) {
      d_minValue = minValue;
    };

    /**
     * Assigns the upper limit of the interval
     * @param {Number} maxValue Maximum value
     */
    this.setMaxValue = function (maxValue) {
      d_maxValue = maxValue;
    };

    /**
     *
     * @returns {Number} Lower limit of the interval
     */
    this.minValue = function () {
      return d_minValue;
    };

    /**
     *
     * @returns {Number} Upper limit of the interval
     */
    this.maxValue = function () {
      return d_maxValue;
    };
  }

  /**
   *
   * @returns {String} A string representation of the object.
   */
  toString() {
    return "[Interval]";
  }

  /**
   * Assigns the limits of the interval
   * @param {Numbe} minValue Minimum value
   * @param {Number} maxValue  Maximum value
   * @param {Interval.BorderFlag} borderFlags Include/Exclude borders
   */
  setInterval(minValue, maxValue, borderFlags) {
    this.setMinValue(minValue);
    this.setMaxValue(maxValue);
    this.setBorderFlags(borderFlags);
  }

  /**
   * A interval is valid when {@link Interval#minValue minValue()} <= {@link Interval#maxValue maxValue()}. In case of Interval.BorderFlag.ExcludeBorders it is true when {@link Interval#minValue minValue()} < {@link Interval#maxValue maxValue()}
   * @returns {Boolean} true, when the interval is valid
   */
  isValid() {
    if ((this.borderFlags() & Interval.BorderFlag.ExcludeBorders) === 0)
      return this.minValue() <= this.maxValue();
    else return this.minValue() < this.maxValue();
  }

  /**
   * Return the width of an interval
   *
   * The width of invalid intervals is 0.0, otherwise the result is {@link Interval#maxValue maxValue()} - {@link Interval#minValue minValue()}.
   * @returns {Number} Interval width
   * @see {@link Interval#isValid isValid()}
   */
  width() {
    return this.isValid() ? this.maxValue() - this.minValue() : 0.0;
  }

  /**
   *
   * @returns {Boolean} true, if {@link Interval#isValid isValid()} && ({@link Interval#minValue minValue()} >= {@link Interval#maxValue maxValue()})
   */
  isNull() {
    return this.isValid() && this.minValue() >= this.maxValue();
  }

  /**
   * Invalidate the interval
   *
   * The limits are set to interval [0.0, -1.0]
   * @see {@link Interval#isValid isValid()}
   */
  invalidate() {
    this.setMinValue(0.0);
    this.setMaxValue(-1.0);
  }

  /**
   * Normalize the limits of the interval
   *
   * If {@link Interval#maxValue maxValue()} < {@link Interval#minValue minValue()} the limits will be inverted.
   * @returns {Interval} Normalized interval
   * @see {@link Interval#isValid isValid()}
   * @see {@link Interval#inverted inverted()}
   */
  normalized() {
    if (this.minValue() > this.maxValue()) {
      return this.inverted();
    }
    if (
      this.minValue() == this.maxValue() &&
      this.borderFlags() == Interval.BorderFlag.ExcludeMinimum
    ) {
      return this.inverted();
    }

    return this;
  }

  /**
   * Invert the limits of the interval
   * @returns {Interval} Inverted interval
   * @see {@link Interval#normalized normalized()}
   */
  inverted() {
    var borderFlags = Interval.BorderFlag.IncludeBorders;
    if (this.borderFlags() & Interval.BorderFlag.ExcludeMinimum)
      borderFlags |= Interval.BorderFlag.ExcludeMaximum;
    if (this.borderFlags() & Interval.BorderFlag.ExcludeMaximum)
      borderFlags |= Interval.BorderFlag.ExcludeMinimum;

    return new Interval(this.maxValue(), this.minValue(), borderFlags);
  }

  /**
   * Test if a value is inside an interval
   * @param {Number} value Value
   * @returns {Boolean} true, if value >= {@link Interval#minValue minValue()} && value <= {@link Interval#maxValue maxValue()}
   */
  contains(value) {
    if (!this.isValid()) return false;

    if (value < this.minValue() || value > this.maxValue()) return false;

    if (
      value == this.minValue() &&
      this.borderFlags() & Interval.BorderFlag.ExcludeMinimum
    )
      return false;

    if (
      value == this.maxValue() &&
      this.borderFlags() & Interval.BorderFlag.ExcludeMaximum
    )
      return false;

    return true;
  }

  /**
   * Limit the interval, keeping the border modes
   * @param {Number} lowerBound Lower limit
   * @param {Number} upperBound Upper limit
   * @returns {Interval} Limited interval
   */
  limited(lowerBound, upperBound) {
    if (!this.isValid() || lowerBound > upperBound) return new Interval();

    var minValue = Math.max(this.minValue(), lowerBound);
    minValue = Math.min(minValue, upperBound);

    var maxValue = Math.max(this.maxValue(), lowerBound);
    maxValue = Math.min(maxValue, upperBound);

    return new Interval(minValue, maxValue, this.borderFlags());
  }

  /**
   * Adjust the limit that is closer to value, so that value becomes the center of the interval.
   * @param {Number} value Center
   * @returns {Interval} Interval with value as center
   */
  symmetrize(value) {
    if (!this.isValid()) return this;

    const delta = Math.max(
      Math.abs(value - this.maxValue()),
      Math.abs(value - this.minValue())
    );

    return new Interval(value - delta, value + delta);
  }

  /**
   * Extend the interval.
   *
   * If value is below {@link Interval#minValue minValue()},value becomes the lower limit. If value is above {@link Interval#maxValue maxValue()},value becomes the upper limit.
   * extend() has no effect for invalid intervals
   * @param {Number} value
   * @returns {Interval} extended interval
   */
  extend(value) {
    if (!this.isValid()) return this;

    return new Interval(
      Math.min(value, this.minValue()),
      Math.max(value, this.maxValue()),
      this.borderFlags()
    );
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Interval.BorderFlag}</div>
 *
 * Flag indicating if a border is included or excluded
 * @name Interval.BorderFlag
 * @readonly
 * @property {Number} IncludeBorders=0x00             Min/Max values are inside the interval.
 * @property {Number} ExcludeMinimum=0x01             Min value is not included in the interval.
 * @property {Number} ExcludeMaximum=0x02             Max value is not included in the interval.
 * @property {Number} ExcludeBorders=0x03             Min/Max values are not included in the interval.
 */
Enumerator.enum(
  "BorderFlag { IncludeBorders = 0x00 , ExcludeMinimum = 0x01 , ExcludeMaximum = 0x02 , ExcludeBorders = 0x03 }",
  Interval
);
