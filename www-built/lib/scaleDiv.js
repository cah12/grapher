

/**
 * A class representing a scale division.
 *
 * A js-Qwt scale is defined by its boundaries and 3 list for the positions of the major, medium and minor ticks.
 * The {@link ScaleDiv#upperBound upperBound()} might be smaller than the {@link ScaleDiv#lowerBound lowerBound()} to indicate inverted scales.
 * Scale divisions can be calculated from a QwtScaleEngine.
 */
class ScaleDiv {
  /**
   * Overloaded constructor. See example for usage.
   * @param {Number} [arg1] lowerBound First boundary
   * @param {Number} [arg2] upperBound Second boundary
   * @param {Array<Number>} [arg3] minorTicks List of minor ticks
   * @param {Array<Number>} [arg4] mediumTicks List medium ticks
   * @param {Array<Number>} [arg5] majorTicks List of major ticks
   * @example
   *  //Construct a scale division - Default constructor
   *  new ScaleDiv()
   *
   *  //Construct a scale division
   *  new ScaleDiv(interval: Interval, ticks: Array<Array<Number>>)
   *  - Parameters
   *  - interval  Interval
   *  - ticks     List of major, medium and minor ticks
   *
   *  //Construct a scale division
   *  new ScaleDiv(lowerBound: Number, upperBound: Number, ticks: Array<Array<Number>>)
   *  Parameters
   *  - lowerBound  First boundary
   *  - upperBound  Second boundary
   *  - ticks       List of major, medium and minor ticks
   *
   *  //Construct a scale division
   *  new ScaleDiv(lowerBound: Number, upperBound: Number, minorTicks: Array<Number>, mediumTicks: Array<Number>, majorTicks: Array<Number>)
   *  Parameters
   *  - lowerBound  First boundary
   *  - upperBound  Second boundary
   *  - minorTicks  List of minor ticks
   *  - mediumTicks List medium ticks
   *  - majorTicks  List of major ticks
   */
  constructor(arg1, arg2, arg3, arg4, arg5) {
    var d_lowerBound = 0.0;
    var d_upperBound = 0.0;
    var d_ticks = []; //array of array of numbers
    if (typeof arg1 == "undefined" || typeof arg2 == "undefined") {
      //constructor 1
    } else if (
      typeof arg3 == "undefined" &&
      typeof arg1 == "object" &&
      typeof arg2 == "object"
    ) {
      //constructor 2
      var interval = arg1;
      var ticks = arg2;
      d_lowerBound = interval.minValue();
      d_upperBound = interval.maxValue();

      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++)
        d_ticks[i] = ticks[i];
    } else if (typeof arg4 == "undefined") {
      //constructor 3
      d_lowerBound = arg1;
      d_upperBound = arg2;
      ticks = arg3;
      // d_lowerBound = lowerBound;
      // d_upperBound = upperBound;

      for (i = 0; i < ScaleDiv.TickType.NTickTypes; i++) d_ticks[i] = ticks[i];
    } else if (
      typeof arg1 == "undefined" &&
      typeof arg2 == "undefined" &&
      typeof arg3 == "undefined" &&
      typeof arg4 == "undefined" &&
      typeof arg5 == "undefined"
    ) {
      //constructor 3
      d_lowerBound = arg1;
      d_upperBound = arg2;
      minorTicks = arg3;
      mediumTicks = arg4;
      majorTicks = arg5;
      // d_lowerBound = lowerBound;
      // d_upperBound = upperBound;
      d_ticks[ScaleDiv.TickType.MinorTick] = minorTicks;
      d_ticks[ScaleDiv.TickType.MediumTick] = mediumTicks;
      d_ticks[ScaleDiv.TickType.MajorTick] = majorTicks;
    }

    /**
     * Change the interval
     *
     * lowerBound might be greater than upperBound for inverted scales.
     * @param {Number|object} arg1 If a number, first boundary. If an object, the interval.
     * @param {Number} [arg2] Second boundary.
     */
    this.setInterval = function (arg1, arg2) {
      if (typeof arg1 == "number" && typeof arg2 == "number") {
        d_lowerBound = arg1;
        d_upperBound = arg2;
        // d_lowerBound = lowerBound;
        // d_upperBound = upperBound;
      } else if (typeof arg1 == "object" && typeof arg2 == "undefined") {
        const interval = arg1;
        d_lowerBound = interval.minValue();
        d_upperBound = interval.maxValue();
      }
    };

    /**
     *
     * @returns {Interval} an Interval constructed from the current lowerBound and upperBound
     */
    this.interval = function () {
      return new Interval(d_lowerBound, d_upperBound);
    };

    /**
     * Set the first boundary
     * @param {Number} lowerBound First boundary
     */
    this.setLowerBound = function (lowerBound) {
      d_lowerBound = lowerBound;
    };

    /**
     *
     * @returns {Number} lower bound
     * @see {@link ScaleDiv#upperBound upperBound()}
     */
    this.lowerBound = function () {
      return d_lowerBound;
    };

    /**
     * Set the second boundary
     * @param {Number} upperBound Second boundary
     */
    this.setUpperBound = function (upperBound) {
      d_upperBound = upperBound;
    };

    /**
     *
     * @returns {Number} upper bound
     * @see {@link ScaleDiv#lowerBound lowerBound()}
     */
    this.upperBound = function () {
      return d_upperBound;
    };

    /**
     *
     * @returns {Number} upperBound() - lowerBound()
     */
    this.range = function () {
      return d_upperBound - d_lowerBound;
    };

    /**
     *
     * @returns {Boolean} true, if the scale division is empty. i.e ( lowerBound() == upperBound() )
     */
    this.isEmpty = function () {
      return d_lowerBound == d_upperBound;
    };

    /**
     *
     * @returns {Boolean} true, if the scale division is increasing. i.e. ( lowerBound() <= upperBound() )
     */
    this.isIncreasing = function () {
      return d_lowerBound <= d_upperBound;
    };

    /**
     * Return if a value is between lowerBound() and upperBound()
     * @param {Number} value Value
     * @returns {Boolean} true/false
     */
    this.contains = function (value) {
      var min = Math.min(d_lowerBound, d_upperBound);
      var max = Math.max(d_lowerBound, d_upperBound);
      return value >= min && value <= max;
    };

    /**
     * Invert the scale division
     * @see {@link ScaleDiv#inverted inverted()}
     */
    this.invert = function () {
      //qSwap( d_lowerBound, d_upperBound );
      var temp = d_lowerBound;
      d_lowerBound = d_upperBound;
      d_upperBound = temp;

      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++) {
        //QList<double>& ticks = d_ticks[i];
        var ticks = d_ticks[i];
        var size = ticks.length;
        var size2 = size / 2;

        for (var j = 0; j < size2; j++) {
          //qSwap( ticks[j], ticks[size - 1 - j] );
          temp = ticks[j];
          ticks[j] = ticks[size - 1 - j];
          ticks[size - 1 - j] = temp;
        }
        d_ticks[i] = ticks;
      }
    };

    /**
     *
     * @returns {ScaleDiv} A scale division with inverted boundaries and ticks
     * @see {@link ScaleDiv#invert invert()}
     */
    this.inverted = function () {
      var other = new ScaleDiv(d_lowerBound, d_upperBound, d_ticks);
      other.invert();
      return other;
    };

    /**
     * Return a scale division with an interval [lowerBound, upperBound]
     * where all ticks outside this interval are removed
     * @param {Number} lowerBound Lower bound
     * @param {Number} upperBound Upper bound
     * @returns {ScaleDiv} Scale division with all ticks inside of the given interval
     */
    this.bounded = function (lowerBound, upperBound) {
      var min = Math.min(lowerBound, upperBound);
      var max = Math.max(lowerBound, upperBound);

      var sd = new ScaleDiv();
      sd.setInterval(lowerBound, upperBound);

      for (tickType = 0; tickType < ScaleDiv.TickType.NTickTypes; tickType++) {
        var ticks = d_ticks[tickType];

        var boundedTicks = [];
        for (i = 0; i < ticks.size(); i++) {
          var tick = ticks[i];
          if (tick >= min && tick <= max) boundedTicks.push(tick);
        }

        sd.setTicks(tickType, boundedTicks);
      }

      return sd;
    };

    /**
     * Assign ticks
     * @param {ScaleDiv.TickType} type ScaleDiv.TickType.MinorTick, ScaleDiv.TickType.MediumTick or ScaleDiv.TickType.MajorTick
     * @param {Array<Number>} ticks Values of the tick positions
     */
    this.setTicks = function (type, ticks) {
      if (type >= 0 && type < ScaleDiv.TickType.NTickTypes)
        d_ticks[type] = ticks;
    };

    /**
     * Return a list of ticks
     * @param {ScaleDiv.TickType} type ScaleDiv.TickType.MinorTick, ScaleDiv.TickType.MediumTick or ScaleDiv.TickType.MajorTick
     * @returns {Array<Number>} Tick list
     */
    this.ticks = function (type) {
      if (type >= 0 && type < ScaleDiv.TickType.NTickTypes) {
        // console.log(type)
        // console.log(d_ticks)
        return d_ticks[type];
      }
      return [];
    };
  }

  /**
   * @returns {String} a string representing the object.
   */
  toString() {
    return "[ScaleDiv]";
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link ScaleDiv.TickType}</div>
 *
 * Scale tick types.
 * @name ScaleDiv.TickType
 * @readonly
 * @property {Number} NoTick=-1             No ticks.
 * @property {Number} MinorTick             Minor ticks.
 * @property {Number} MediumTick            Medium ticks.
 * @property {Number} MajorTick             Major ticks.
 * @property {Number} NTickTypes            Number of valid tick types.
 */
Enumerator.enum(
  "TickType {	NoTick = -1 , MinorTick , MediumTick , MajorTick ,	NTickTypes }",
  ScaleDiv
);
