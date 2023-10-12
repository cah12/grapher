
Static.mLog = function (base, value) {
  return Math.log(value) / Math.log(base);
};

Static.mLogInterval = function (base, interval) {
  return new Interval(
    Static.mLog(base, interval.minValue()),
    Static.mLog(base, interval.maxValue())
  );
};

Static.mPowInterval = function (base, interval) {
  return new Interval(
    Math.pow(base, interval.minValue()),
    Math.pow(base, interval.maxValue())
  );
};

Static.mStepSize = function (intervalSize, maxSteps, base) {
  //return 41.666666;
  if (maxSteps <= 0) return 0.0;

  if (maxSteps > 2) {
    for (var numSteps = maxSteps; numSteps > 1; numSteps--) {
      var stepSize = intervalSize / numSteps;

      var p = Math.floor(Math.log(stepSize) / Math.log(base));
      var fraction = Math.pow(base, p);

      for (var n = base; n > 1; n /= 2) {
        if (Utility.mFuzzyCompare(stepSize, n * fraction)) return stepSize;

        if (n === 3 && base % 2 === 0) {
          if (Utility.mFuzzyCompare(stepSize, 2 * fraction)) return stepSize;
        }
      }
      //return stepSize; //added without proof
    }
  }
  return intervalSize * 0.5;
};

/**
 * Arithmetic including a tolerance.
 */
class ScaleArithmetic {
  /**
   * Calculate a step size for a given interval
   *
   * @param {Number} intervalSize Interval size
   * @param {Number} numSteps Number of steps
   * @param {Number} base Base for the division ( usually 10 )
   * @returns {Number} Calculated step size
   */
  static divideInterval(intervalSize, numSteps, base) {
    if (numSteps <= 0) return 0.0;

    var v = ScaleArithmetic.divideEps(intervalSize, numSteps);
    //    alert(v)
    if (v === 0.0) return 0.0;

    var lx = Static.mLog(base, Math.abs(v));
    var p = Math.floor(lx);

    var fraction = Math.pow(base, lx - p);

    var n = base;
    while (n > 1 && fraction <= n / 2) n /= 2;

    var stepSize = n * Math.pow(base, p);
    if (v < 0) stepSize = -stepSize;

    return stepSize;
  }

  /**
   * Ceil a value, relative to an interval
   * @param {Number} value  Value to be ceiled
   * @param {Number} intervalSize Interval size
   * @returns {Number} Rounded value
   * @see {@link ScaleArithmetic#floorEps floorEps()}
   */
  static ceilEps(value, intervalSize) {
    var eps = Static._eps * intervalSize;

    value = (value - eps) / intervalSize;
    return Math.ceil(value) * intervalSize;
  }

  /**
   * Floor a value, relative to an interval
   * @param {Number} value  Value to be floored
   * @param {Number} intervalSize Interval size
   * @returns {Number} Rounded value
   * @see {@link ScaleArithmetic#ceilEps ceilEps()}
   */
  static floorEps(value, intervalSize) {
    var eps = Static._eps * intervalSize;

    value = (value + eps) / intervalSize;
    return Math.floor(value) * intervalSize;
  }

  /**
   * Divide an interval into steps
   * @param {Number} intervalSize Interval size
   * @param {Number} numSteps Number of steps
   * @returns {Number} Step size
   */
  static divideEps(intervalSize, numSteps) {
    if (numSteps === 0.0 || intervalSize === 0.0) return 0.0;

    return (intervalSize - Static._eps * intervalSize) / numSteps;
  }
}

/**
 * Base class for scale engines.
 *
 * A scale engine tries to find "reasonable" ranges and step sizes for scales. The layout of the scale can
 * be varied with setAttribute(). js-Qwt offers implementations for logarithmic and linear scales.
 */
class ScaleEngine {
  /**
   *
   * @param {Number} bs=10 Base of the scale engine
   */
  constructor(bs) {
    var m_base = 10;
    var m_lowerMargin = 0.0;
    var m_upperMargin = 0.0;
    if (typeof bs !== "undefined") m_base = bs;
    var m_transform = null;
    var m_referenceValue = 0.0;

    var m_attributes = 0;

    /**
     *
     * @returns {Number} The margin at the lower end of the scale. The default margin is 0.
     * @see {@link ScaleEngine#setMargins setMargins()}
     */
    this.lowerMargin = function () {
      return m_lowerMargin;
    };

    /**
     *
     * @returns {Number} The margin at the upper end of the scale. The default margin is 0.
     * @see {@link ScaleEngine#setMargins setMargins()}
     */
    this.upperMargin = function () {
      return m_upperMargin;
    };

    /**
     * Specify margins at the scale's endpoints
     *
     * Margins can be used to leave a minimum amount of space between the enclosed intervals and the boundaries of the scale.
     *
     * LogScaleEngine measures the margins in decades.
     * @param {Number} lower minimum distance between the scale's lower boundary and the smallest enclosed value
     * @param {Number} upper minimum distance between the scale's upper boundary and the greatest enclosed value
     * @see {@link ScaleEngine#upperMargin upperMargin()}
     * @see {@link ScaleEngine#lowerMargin lowerMargin()}
     */
    this.setMargins = function (lower, upper) {
      m_lowerMargin = Math.max(lower, 0.0);
      m_upperMargin = Math.max(upper, 0.0);
    };

    /**
     * Assign a transformation
     *
     * The transformation object is used as factory for clones that are returned by {@link ScaleEngine#transformation transformation()}
     * @param {Transfor} transform Transformation
     * @see {@link ScaleEngine#copy copy()}
     */
    this.setTransformation = function (transform) {
      if (transform !== m_transform) {
        //delete m_transform;
        m_transform = transform;
      }
    };

    /**
     * Create and return a clone of the transformation of the engine. When the engine
     * has no special transformation null is returned, indicating no transformation.
     * @returns {Transform} A clone of the transfomation
     * @see {@link ScaleEngine#setTransformation setTransformation()}
     */
    this.transformation = function () {
      var transform = null;
      if (m_transform) {
        transform = m_transform.copy();
      }

      return transform;
    };

    /**
     * Calculate a step size for an interval size
     * @param {Number} intervalSize Interval size
     * @param {Number} numSteps Number of steps
     * @returns {Number} Step size
     */
    this.divideInterval = function (intervalSize, numSteps) {
      return ScaleArithmetic.divideInterval(intervalSize, numSteps, m_base);
    };

    /**
     * Calculate a scale division.
     *
     * Implemented in {@link LogScaleEngine} and {@link LinearScaleEngine}.
     * @param {Number} x1 First interval limit
     * @param {Number} x2 Second interval limit
     * @param {Number} maxMajorSteps Maximum for the number of major steps
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Number} stepSize Step size. If stepSize == 0.0, the scaleEngine calculates one.
     * @returns {ScaleDiv} Calculated scale division.
     */
    this.divideScale = function (
      x1,
      x2,
      maxMajorSteps,
      maxMinorSteps,
      stepSize
    ) {
      console.warn("Subclass must implement divideScale()");
    };

    /**
     * Check if an interval "contains" a value
     * @param {Interval} interval Interval
     * @param {Number} value Value
     * @returns {Boolean} true, when the value is inside the interval
     */
    this.contains = function (interval, value) {
      if (!interval.isValid()) return false;

      if (
        Utility.m3FuzzyCompare(value, interval.minValue(), interval.width()) < 0
      )
        return false;

      if (
        Utility.m3FuzzyCompare(value, interval.maxValue(), interval.width()) > 0
      )
        return false;

      return true;
    };

    /**
     * Remove ticks from a list, that are not inside an interval
     * @param {Array} ticks Tick list
     * @param {Interval} interval Interval
     * @returns {Array} Stripped tick list
     */
    this.strip = function (ticks, interval) {
      if (!interval.isValid() || ticks.length === 0) return [];

      if (
        this.contains(interval, ticks[0]) &&
        this.contains(interval, ticks[ticks.length - 1])
      ) {
        return ticks;
      }

      var strippedTicks = [];
      for (var i = 0; i < ticks.length; i++) {
        if (this.contains(interval, ticks[i])) strippedTicks.push(ticks[i]);
      }
      return strippedTicks;
    };

    /**
     * Build an interval around a value
     *
     * In case of v == 0.0 the interval is [-0.5, 0.5], otherwide it is [0.5 * v, 1.5 * v]
     * @param {Number} value Initial value
     * @returns {Interval} Calculated interval
     */
    this.buildInterval = function (value) {
      var delta = value === 0.0 ? 0.5 : Math.abs(0.5 * value);

      if (Number.MAX_VALUE - delta < value)
        return new Interval(Number.MAX_VALUE - delta, Number.MAX_VALUE);

      if (-Number.MAX_VALUE + delta > value)
        return new Interval(-Number.MAX_VALUE, -Number.MAX_VALUE + delta);

      return new Interval(value - delta, value + delta);
    };

    /**
     * Change a scale attribute
     * @param {ScaleEngine.Attributes} attribute
     * @param {Boolean} on On/Off
     */
    this.setAttribute = function (attribute, on) {
      if (on) m_attributes |= attribute;
      else m_attributes &= ~attribute;
    };

    /**
     *
     * @param {ScaleEngine.Attributes} attribute Attribute to be tested
     * @returns {Boolean} true, if attribute is enabled.
     */
    this.testAttribute = function (attribute) {
      return m_attributes & attribute;
    };

    /**
     * Change the scale attribute
     * @param {ScaleEngine.Attributes} attributes Set scale attributes
     */
    this.setAttributes = function (attributes) {
      m_attributes = attributes;
    };

    /**
     *
     * @returns {ScaleEngine.Attributes} Scale attributes
     */
    this.attributes = function () {
      return m_attributes;
    };

    /**
     * Set the base of the scale engine
     *
     * While a base of 10 is what 99.9% of all applications need certain scales might need a different base: e.g. 2.
     * The default setting is 10
     * @param {Number} base Base of the engine
     * @see {@link ScaleEngine#base base()}
     */
    this.setBase = function (base) {
      m_base = Math.max(base, 2);
    };

    /**
     *
     * @returns {Number} Base of the scale engine
     * @see {@link ScaleEngine#setBase setBase()}
     */
    this.base = function () {
      return m_base;
    };

    /**
     * Specify a reference point
     *
     * The reference point is needed if options IncludeReference or Symmetric are active. Its default value is 0.0.
     * @param {Number} r new reference value
     */
    this.setReference = function (r) {
      m_referenceValue = r;
    };

    /**
     *
     * @returns {Number} the reference value
     * @see {@link ScaleEngine#setReference setReference()}
     *
     */
    this.reference = function () {
      return m_referenceValue;
    };
  }

  /**
   * @returns {String} a string representing the object.
   */
  toString() {
    return "[ScaleEngine]";
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link ScaleEngine.Attributes}</div>
 *
 * Layout attributes
 * @name ScaleEngine.Attributes
 * @readonly
 * @property {Number} NoAttribute=0x00             No attributes.
 * @property {Number} IncludeReference=0x01        Build a scale which includes the {@link ScaleEngine#reference reference()} value.
 * @property {Number} Symmetric=0x02               Build a scale which is symmetric to the {@link ScaleEngine#reference reference()} value.
 * @property {Number} Floating=0x04                The endpoints of the scale are supposed to be equal the outmost included values plus the specified margins (see {@link ScaleEngine#setMargins setMargins()}). If this attribute is not set, the endpoints of the scale will be integer multiples of the step size.
 * @property {Number} Inverted=0x08                Turn the scale upside down. ( = 0x08)
 */
Enumerator.enum(
  "Attributes{  NoAttribute = 0x00 , IncludeReference = 0x01 , Symmetric = 0x02 , Floating = 0x04 ,  Inverted = 0x08}",
  ScaleEngine
);

/**
 * A scale engine for linear scales.
 * @extends ScaleEngine
 */
class LinearScaleEngine extends ScaleEngine {
  constructor(bs) {
    super(bs);

    /**
     * Align and divide an interval
     * @param {Number} maxNumSteps Max. number of steps
     * @param {object} xValueObject An object with with two properties: x1(First limit of the interval - In/Out) and x2(Second limit of the interval - In/Out).
     * @param {Number} stepSize Step size (Out)
     */
    this.autoScale = function (maxNumSteps, xValueObject, stepSize) {
      var interval = new Interval(xValueObject["x1"], xValueObject["x2"]);
      interval = interval.normalized();

      interval.setMinValue(interval.minValue() - this.lowerMargin());
      interval.setMaxValue(interval.maxValue() + this.upperMargin());

      if (this.testAttribute(ScaleEngine.Attributes.Symmetric))
        interval = interval.symmetrize(this.reference());

      if (this.testAttribute(ScaleEngine.Attributes.IncludeReference))
        interval = interval.extend(this.reference());

      if (interval.width() === 0.0)
        interval = this.buildInterval(interval.minValue());

      stepSize = ScaleArithmetic.divideInterval(
        interval.width(),
        Math.max(maxNumSteps, 1),
        this.base()
      );

      if (!this.testAttribute(ScaleEngine.Attributes.Floating))
        interval = this.align(interval, stepSize);

      xValueObject["x1"] = interval.minValue();
      xValueObject["x2"] = interval.maxValue();

      if (this.testAttribute(ScaleEngine.Attributes.Inverted)) {
        //qSwap(x1, x2);
        xValueObject["x2"] = interval.minValue();
        xValueObject["x1"] = interval.maxValue();
        stepSize = -stepSize;
      }
    };

    //Documented in base class
    this.divideScale = function (
      x1,
      x2,
      maxMajorSteps,
      maxMinorSteps,
      stepSize
    ) {
      if (typeof stepSize === "undefined") stepSize = 0.0;
      var interval = new Interval(x1, x2).normalized();
      if (interval.width() <= 0) return new ScaleDiv();

      stepSize = Math.abs(stepSize);
      if (stepSize === 0.0) {
        if (maxMajorSteps < 1) maxMajorSteps = 1;

        stepSize = ScaleArithmetic.divideInterval(
          interval.width(),
          maxMajorSteps,
          this.base()
        );
      }

      var scaleDiv = new ScaleDiv();

      if (stepSize !== 0.0) {
        var ticks = [];

        this.buildTicks(interval, stepSize, maxMinorSteps, ticks);
        scaleDiv = new ScaleDiv(interval, ticks);
        //console.log(interval.width())
        //console.log(ticks)
      }

      if (x1 > x2) scaleDiv.invert();

      return scaleDiv;
    };

    /**
     * Calculate ticks for an interval
     * @param {Interval} interval Interval
     * @param {Number} stepSize Step size
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Array<Array<Number>>} ticks Arrays to be filled with the calculated ticks
     * @see {@link LinearScaleEngine#buildMajorTicks buildMajorTicks()}
     * @see {@link LinearScaleEngine#buildMinorTicks buildMinorTicks()}
     */
    this.buildTicks = function (interval, stepSize, maxMinorSteps, ticks) {
      var boundingInterval = this.align(interval, stepSize);

      ticks[ScaleDiv.TickType.MajorTick] = this.buildMajorTicks(
        boundingInterval,
        stepSize
      );

      if (maxMinorSteps > 0) {
        var minorTicks = [];
        var mediumTicks = [];
        this.buildMinorTicks(
          ticks[ScaleDiv.TickType.MajorTick],
          maxMinorSteps,
          stepSize,
          minorTicks,
          mediumTicks
        );
        ticks[ScaleDiv.TickType.MinorTick] = minorTicks;
        ticks[ScaleDiv.TickType.MediumTick] = mediumTicks;
      }

      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++) {
        var obj = this.strip(ticks[i], interval);
        ticks[i] = [];
        ticks[i] = obj;

        // ticks very close to 0.0 are
        // explicitely set to 0.0

        for (var j = 0; j < ticks[i].length; j++) {
          if (Utility.m3FuzzyCompare(ticks[i][j], 0.0, stepSize) === 0)
            ticks[i][j] = 0.0;
        }
      }
    };

    /**
     * Calculate major ticks for an interval
     * @param {Interval} interval Interval
     * @param {Number} stepSize Step size
     * @returns {Array<Number>} Calculated ticks
     */
    this.buildMajorTicks = function (interval, stepSize) {
      var numTicks = Math.round(interval.width() / stepSize) + 1;
      if (numTicks > 10000) numTicks = 10000;

      var ticks = [];

      ticks.push(interval.minValue());
      for (var i = 1; i < numTicks - 1; i++)
        ticks.push(interval.minValue() + i * stepSize);
      ticks.push(interval.maxValue());

      //console.log(ticks)
      return ticks;
    };

    /**
     * Calculate minor/medium ticks for major ticks
     * @param {Array<Number>} majorTicks Major ticks
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Number} stepSize Step size
     * @param {Array<Number>} minorTicks Array to be filled with the calculated minor ticks
     * @param {Array<Number>} mediumTicks Array to be filled with the calculated medium ticks
     */
    this.buildMinorTicks = function (
      majorTicks,
      maxMinorSteps,
      stepSize,
      minorTicks,
      mediumTicks
    ) {
      var minStep = Static.mStepSize(stepSize, maxMinorSteps, this.base());
      if (minStep === 0.0) return;

      // # ticks per interval
      var numTicks = Math.ceil(Math.abs(stepSize / minStep)) - 1;

      var medIndex = -1;
      if (numTicks % 2) medIndex = numTicks / 2;

      // calculate minor ticks

      for (var i = 0; i < majorTicks.length; i++) {
        var val = majorTicks[i];
        for (var k = 0; k < numTicks; k++) {
          val += minStep;

          var alignedValue = val;
          if (Utility.m3FuzzyCompare(val, 0.0, stepSize) === 0)
            alignedValue = 0.0;

          if (k == medIndex) mediumTicks.push(alignedValue);
          else minorTicks.push(alignedValue);
        }
      }
    };

    /**
     * Align an interval to a step size
     *
     * The limits of an interval are aligned that both are integer multiples of the step size.
     * @param {Interval} interval
     * @param {Number} stepSize
     * @returns {Interval} Aligned interval
     */
    this.align = function (interval, stepSize) {
      var x1 = interval.minValue();
      var x2 = interval.maxValue();

      if (-Number.MAX_VALUE + stepSize <= x1) {
        var x = ScaleArithmetic.floorEps(x1, stepSize);
        if (Utility.m3FuzzyCompare(x1, x, stepSize) !== 0) x1 = x;
      }

      if (Number.MAX_VALUE - stepSize >= x2) {
        var x = ScaleArithmetic.ceilEps(x2, stepSize);
        if (Utility.m3FuzzyCompare(x2, x, stepSize) !== 0) x2 = x;
      }

      return new Interval(x1, x2);
    };
  }

  /**
   *
   * @returns {String}  A string representing the object. .
   */
  toString() {
    return "[LinearScaleEngine]";
  }
}

/**
 * A scale engine for logarithmic scales.
 * @extends ScaleEngine
 */
class LogScaleEngine extends ScaleEngine {
  constructor(bs) {
    super(bs);
    //ScaleEngine.call(this, bs);

    this.setTransformation(new LogTransform());

    /**
     * Align and divide an interval
     * @param {Number} maxNumSteps  Max. number of steps
     * @param {object} xValueObject An object with with two properties: x1(First limit of the interval - In/Out) and x2(Second limit of the interval - In/Out).
     * @param {Number} stepSize Step size (Out)
     */
    this.autoScale = function (maxNumSteps, xValueObject, stepSize) {
      //if ( x1 > x2 )
      //qSwap( x1, x2 );

      if (xValueObject["x1"] > xValueObject["x2"]) {
        const temp = xValueObject["x1"];
        xValueObject["x1"] = xValueObject["x2"];
        xValueObject["x2"] = temp;
      }

      var logBase = this.base();

      var interval = new Interval(
        xValueObject["x1"] / Math.pow(logBase, this.lowerMargin()),
        xValueObject["x2"] * Math.pow(logBase, this.upperMargin())
      );

      if (interval.maxValue() / interval.minValue() < logBase) {
        // scale width is less than one step -> try to build a linear scale

        var linearScaler = new LinearScaleEngine();
        linearScaler.setAttributes(this.attributes());
        linearScaler.setReference(this.reference());
        linearScaler.setMargins(this.lowerMargin(), this.upperMargin());

        linearScaler.autoScale(maxNumSteps, xValueObject, stepSize);

        var linearInterval = new Interval(
          xValueObject["x1"],
          xValueObject["x2"]
        );
        linearInterval.normalized();

        linearInterval = linearInterval.limited(1.0e-100, 1.0e100);

        if (linearInterval.maxValue() / linearInterval.minValue() < logBase) {
          // the aligned scale is still less than one step
          if (stepSize < 0.0)
            stepSize = -Static.mLog(logBase, Math.abs(stepSize));
          else stepSize = Static.mLog(logBase, stepSize);

          return;
        }
      }

      var logRef = 1.0;
      if (this.reference() > 1.0e-100 / 2)
        logRef = Math.min(this.reference(), 1.0e100 / 2);

      if (this.testAttribute(ScaleEngine.Attributes.Symmetric)) {
        const delta = Math.max(
          interval.maxValue() / logRef,
          logRef / interval.minValue()
        );
        interval.setInterval(logRef / delta, logRef * delta);
      }

      if (this.testAttribute(ScaleEngine.Attributes.IncludeReference))
        interval = interval.extend(logRef);

      interval = interval.limited(1.0e-100, 1.0e100);

      if (interval.width() == 0.0)
        interval = this.buildInterval(interval.minValue());

      stepSize = this.divideInterval(
        Static.mLogInterval(logBase, interval).width(),
        Math.max(maxNumSteps, 1)
      );
      if (stepSize < 1.0) stepSize = 1.0;

      if (!this.testAttribute(ScaleEngine.Attributes.Floating))
        interval = this.align(interval, stepSize);

      xValueObject["x1"] = interval.minValue();
      xValueObject["x2"] = interval.maxValue();

      if (this.testAttribute(ScaleEngine.Attributes.Inverted)) {
        //qSwap(x1, x2);
        xValueObject["x2"] = interval.minValue();
        xValueObject["x1"] = interval.maxValue();
        stepSize = -stepSize;
      }
    };

    //Documented in base class
    this.divideScale = function (
      x1,
      x2,
      maxMajorSteps,
      maxMinorSteps,
      stepSize
    ) {
      //alert(456)
      var interval = new Interval(x1, x2);
      interval.normalized();
      interval = interval.limited(1.0e-100, 1.0e100);

      if (interval.width() <= 0) return new ScaleDiv();

      var logBase = this.base();

      if (interval.maxValue() / interval.minValue() < logBase) {
        // scale width is less than one decade -> build linear scale

        var linearScaler = new LinearScaleEngine();
        linearScaler.setAttributes(this.attributes());
        linearScaler.setReference(this.reference());
        linearScaler.setMargins(this.lowerMargin(), this.upperMargin());

        if (stepSize != 0.0) {
          if (stepSize < 0.0) stepSize = -Math.pow(logBase, -stepSize);
          else stepSize = Math.pow(logBase, stepSize);
        }

        return linearScaler.divideScale(
          x1,
          x2,
          maxMajorSteps,
          maxMinorSteps,
          stepSize
        );
      }

      stepSize = Math.abs(stepSize);
      if (stepSize == 0.0) {
        if (maxMajorSteps < 1) maxMajorSteps = 1;
        //alert(mLogInterval( logBase, interval ).width())
        stepSize = ScaleArithmetic.divideInterval(
          Static.mLogInterval(logBase, interval).width(),
          maxMajorSteps,
          this.base()
        );
        //alert(stepSize)
        if (stepSize < 1.0) stepSize = 1.0; // major step must be >= 1 decade
      }

      var scaleDiv = new ScaleDiv();
      //alert(stepSize)
      if (stepSize != 0.0) {
        //alert(stepSize)
        var ticks = [];

        this.buildTicks(interval, stepSize, maxMinorSteps, ticks);
        scaleDiv = new ScaleDiv(interval, ticks);

        //alert(432)
      }

      if (x1 > x2) scaleDiv.invert();

      return scaleDiv;
    };

    /**
     * Calculate ticks for an interval
     * @param {Interval} interval Interval
     * @param {Number} stepSize Step size
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Array<Array<Number>>} ticks Arrays to be filled with the calculated ticks
     * @see {@link LinearScaleEngine#buildMajorTicks buildMajorTicks()}
     * @see {@link LinearScaleEngine#buildMinorTicks buildMinorTicks()}
     */
    this.buildTicks = function (interval, stepSize, maxMinorSteps, ticks) {
      var boundingInterval = this.align(interval, stepSize);

      ticks[ScaleDiv.TickType.MajorTick] = this.buildMajorTicks(
        boundingInterval,
        stepSize
      );

      if (maxMinorSteps > 0) {
        var minorTicks = [];
        var mediumTicks = [];
        this.buildMinorTicks(
          ticks[ScaleDiv.TickType.MajorTick],
          maxMinorSteps,
          stepSize,
          minorTicks,
          mediumTicks
        );
        ticks[ScaleDiv.TickType.MinorTick] = minorTicks;
        ticks[ScaleDiv.TickType.MediumTick] = mediumTicks;
      }

      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++) {
        var obj = this.strip(ticks[i], interval);
        ticks[i] = [];
        ticks[i] = obj;

        // ticks very close to 0.0 are
        // explicitely set to 0.0

        for (var j = 0; j < ticks[i].length; j++) {
          if (Utility.m3FuzzyCompare(ticks[i][j], 0.0, stepSize) === 0)
            ticks[i][j] = 0.0;
        }
      }
    };

    /**
     * Calculate major ticks for an interval
     * @param {Interval} interval Interval
     * @param {Number} stepSize Step size
     * @returns {Array<Number>} Calculated ticks
     */
    this.buildMajorTicks = function (interval, stepSize) {
      var width = Static.mLogInterval(this.base(), interval).width();

      var numTicks = Math.round(width / stepSize) + 1;
      if (numTicks > 10000) numTicks = 10000;

      var lxmin = Math.log(interval.minValue());
      var lxmax = Math.log(interval.maxValue());
      var lstep = (lxmax - lxmin) / (numTicks - 1);

      var ticks = [];

      ticks.push(interval.minValue());

      for (var i = 1; i < numTicks - 1; i++)
        ticks.push(Math.exp(lxmin + i * lstep));

      ticks.push(interval.maxValue());

      //alert(ticks)

      return ticks;
    };

    /**
     * Calculate minor/medium ticks for major ticks
     * @param {Array<Number>} majorTicks Major ticks
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Number} stepSize Step size
     * @param {Array<Number>} minorTicks Array to be filled with the calculated minor ticks
     * @param {Array<Number>} mediumTicks Array to be filled with the calculated medium ticks
     */
    this.buildMinorTicks = function (
      majorTicks,
      maxMinorSteps,
      stepSize,
      minorTicks,
      mediumTicks
    ) {
      var logBase = this.base();

      if (stepSize < 1.1) {
        // major step width is one base
        var minStep = this.divideInterval(stepSize, maxMinorSteps + 1);
        if (minStep == 0.0) return;

        var numSteps = Math.round(stepSize / minStep);

        var mediumTickIndex = -1;
        if (numSteps > 2 && numSteps % 2 == 0) mediumTickIndex = numSteps / 2;

        for (i = 0; i < majorTicks.length - 1; i++) {
          var v = majorTicks[i];
          var s = logBase / numSteps;

          if (s >= 1.0) {
            for (j = 2; j < numSteps; j++) {
              minorTicks.push(v * j * s);
            }
          } else {
            for (j = 1; j < numSteps; j++) {
              var tick = v + (j * v * (logBase - 1)) / numSteps;
              if (j == mediumTickIndex) mediumTicks.push(tick);
              else minorTicks.push(tick);
            }
          }
        }
      } else {
        var minStep = this.divideInterval(stepSize, maxMinorSteps);
        if (minStep == 0.0) return;

        if (minStep < 1.0) minStep = 1.0;

        // # subticks per interval
        var numTicks = Math.round(stepSize / minStep) - 1;

        // Do the minor steps fit into the interval?
        if (
          Utility.m3FuzzyCompare((numTicks + 1) * minStep, stepSize, stepSize) >
          0
        ) {
          numTicks = 0;
        }

        if (numTicks < 1) return;

        var mediumTickIndex = -1;
        if (numTicks > 2 && numTicks % 2) mediumTickIndex = numTicks / 2;

        // substep factor = base^substeps
        var minFactor = Math.max(Math.pow(logBase, minStep), logBase);

        for (var i = 0; i < majorTicks.length; i++) {
          var tick = majorTicks[i];
          for (var j = 0; j < numTicks; j++) {
            tick *= minFactor;

            if (j == mediumTickIndex) mediumTicks.push(tick);
            else minorTicks.push(tick);
          }
        }
      }
    };

    /**
     * Align an interval to a step size
     *
     * The limits of an interval are aligned that both are integer multiples of the step size.
     * @param {Interval} interval
     * @param {Number} stepSize
     * @returns {Interval} Aligned interval
     */
    this.align = function (interval, stepSize) {
      var intv = Static.mLogInterval(this.base(), interval);

      var x1 = ScaleArithmetic.floorEps(intv.minValue(), stepSize);
      if (Utility.m3FuzzyCompare(interval.minValue(), x1, stepSize) == 0)
        x1 = interval.minValue();

      var x2 = ScaleArithmetic.ceilEps(intv.maxValue(), stepSize);
      if (Utility.m3FuzzyCompare(interval.maxValue(), x2, stepSize) == 0)
        x2 = interval.maxValue();

      return Static.mPowInterval(this.base(), new Interval(x1, x2));
    };
  }

  /**
   *
   * @returns {String}  A string representing the object. .
   */
  toString() {
    return "[LogScaleEngine]";
  }
}
