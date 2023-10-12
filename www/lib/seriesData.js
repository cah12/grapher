"use strict";

/**
 * 
 * Abstract interface for iterating over samples

Qwt offers several implementations of the QwtSeriesData API,
but in situations, where data of an application specific format
needs to be displayed, without having to copy it, it is recommended
to implement an individual data access.

A subclass of SeriesData must implement:

- size(): Should return number of data points.

- sample(): Should return values x and y values of the sample at specific position
as Misc.Point object.

- boundingRect(): Should return the bounding rectangle of the data series.
It is used for autoscaling and might help certain algorithms for displaying
the data. You can use {@link SeriesData.mBoundingRectPoint mBoundingRectPoint()} for an implementation
but often it is possible to implement a more efficient algorithm
depending on the characteristics of the series.
The member d_boundingRect is intended for caching the calculated rectangle.
 */
class SeriesData {
  /**
   *
   * @param {Misc.Point} sample Sample point
   * @returns {Misc.Rect} Bounding rectangle
   */
  static mBoundingRectPoint(sample) {
    return new Misc.Rect(sample.x, sample.y, 0, 0); //{ left:sample.x, top:sample.y, right:sample.x, bottom:sample.y, width:0.0, height:0.0};
  }
  constructor() {
    Utility.makeAbstract(this, SeriesData);
    this.d_boundingRect = new Misc.Rect(); //{ left:0.0, top:0.0, right:-1.0, bottom:-1.0, width:-1.0, height:-1 };

    /**
     * Calculate the bounding rectangle of a series subset.
     *
     * Slow implementation, that iterates over the series.
     * @param {SeriesData} series Series
     * @param {Number} [from] Index of the first sample, <= 0 means from the beginning
     * @param {Number} [to] Index of the last sample, < 0 means to the end
     * @returns {Misc.Rect} Bounding rectangle
     */
    this.mBoundingRect = function (series, from, to) {
      var boundingRect = new Misc.Rect(); //{ left:0.0, top:0.0, right:-1.0, bottom:-1.0, width:-1.0, height:-1 }; // invalid;

      if (typeof from == "undefined") from = 0;

      if (typeof to == "undefined") to = series.size() - 1;

      if (to < from) return boundingRect;

      var i;
      for (i = from; i <= to; i++) {
        var rect = SeriesData.mBoundingRectPoint(series.sample(i));
        //console.log(boundingRect.width())
        if (rect.width() >= 0.0 && rect.height() >= 0.0) {
          boundingRect = rect;

          i++;
          break;
        }
      }
      //console.log(i)
      for (; i <= to; i++) {
        var rect = SeriesData.mBoundingRectPoint(series.sample(i));
        if (rect.width() >= 0.0 && rect.height() >= 0.0) {
          boundingRect.setRect(
            Math.min(boundingRect.left(), rect.left()),
            Math.min(boundingRect.top(), rect.top()),
            Math.max(boundingRect.right(), rect.right()) -
              Math.min(boundingRect.left(), rect.left()),
            Math.max(boundingRect.bottom(), rect.bottom()) -
              Math.min(boundingRect.top(), rect.top())
          );
        }
      }
      //
      return boundingRect;
    };

    /**
     * Set a the "rect of interest"
     *
     * {@link PlotSeriesItem} defines the current area of the plot canvas as "rectangle of interest" ( {@link PlotSeriesItem#updateScaleDiv updateScaleDiv()} ). It can be used to implement
     * different levels of details. The default implementation does nothing.
     * @param {Misc.Rect} rect Rectangle of interest
     */
    this.setRectOfInterest = function (rect) {
      //console.warn("Subclass must reimplement this method");
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[SeriesData]";
    };
  }
}

/**
 * Class for data that is organized as an Array.
 * @extends SeriesData
 *
 */
class ArraySeriesData extends SeriesData {
  constructor(samples) {
    super();
    var d_samples = [];
    if (typeof samples !== "undefined") d_samples = samples;

    /**
     * Assign an array of samples
     * @param {Array<Misc.Point>} samples Array of samples
     */
    this.setSamples = function (samples) {
      this.d_boundingRect = new Misc.Rect(); //{ left:0.0, top:0.0, right:-1.0, bottom:-1.0, width:-1.0, height:-1 };
      d_samples = samples;
    };

    /**
     *
     * @returns {Array<Misc.Point>} Array of samples
     */
    this.samples = function () {
      return d_samples;
    };

    /**
     *
     * @returns {Number} Number of samples
     */
    this.size = function () {
      return d_samples.length;
    };

    /**
     *
     * @param {Number} i index
     * @returns {Misc.Point} Sample at a specific position
     */
    this.sample = function (i) {
      return d_samples[i];
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[ArraySeriesData]";
    };
  }
}

/**
 * Class for iterating over an array of points.
 * @extends ArraySeriesData
 */
class PointSeriesData extends ArraySeriesData {
  constructor(samples) {
    super(samples);

    /**
     * Calculate the bounding rectangle
     *
     * The bounding rectangle is calculated once by iterating over all points and is stored for all following requests.
     * @returns {Misc.Rect} Bounding rectangle
     */
    this.boundingRect = function () {
      if (this.d_boundingRect.width() < 0.0)
        this.d_boundingRect = this.mBoundingRect(this);

      return this.d_boundingRect;
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[PointSeriesData]";
    };
  }
}

/**
 * Class for iterating over an array of 3D points.
 * @extends ArraySeriesData
 */
class Point3DSeriesData extends ArraySeriesData {
  constructor(samples) {
    super(samples);

    /**
     * Calculate the bounding rectangle
     *
     * The bounding rectangle is calculated once by iterating over all points and is stored for all following requests.
     * @returns {Misc.Rect} Bounding rectangle
     */
    this.boundingRect = function () {
      if (this.d_boundingRect.width() < 0.0)
        this.d_boundingRect = this.mBoundingRect(this);

      return this.d_boundingRect;
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[Point3DSeriesData]";
    };
  }
}

/**
 * Base class for plot items representing a series of samples.
 * @extends PlotItem
 */
class PlotSeriesItem extends PlotItem {
  /**
   *
   * @param {String} tle Title of the curve
   */
  constructor(tle) {
    super(tle);

    var d_series = null;
    var m_orientation = Static.Vertical;

    /**
     * Set the orientation of the item.
     *
     * The orientation() might be used in specific way by a plot item. e.g. a Curve uses it to identify
     * how to display the curve PlotCurve.CurveStyle.Steps or PlotCurve.CurveStyle.Sticks style.
     * @param {Number} orientation New orientation of the plot item
     */
    this.setOrientation = function (orientation) {
      if (m_orientation != orientation) {
        m_orientation = orientation;

        //legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Number} Orientation of the plot item
     * @see {@link PlotSeriesItem#setOrientation setOrientation()}
     */
    this.orientation = function () {
      return m_orientation;
    };

    /**
     * Draw the complete series
     * @param {ScaleMap} xMap Maps x-values into pixel coordinates.
     * @param {ScaleMap} yMap Maps y-values into pixel coordinates.
     */
    this.draw = function (xMap, yMap) {
      this.drawSeries(xMap, yMap, 0, -1);
    };

    /**
     * Update the item to changes of the axes scale division.
     *
     * When the axes of plot have changed, update the item. The default implementation does nothing, but
     * items that depend on the scale division (like PlotGrid()) have to
     * reimplement updateScaleDiv(). updateScaleDiv() is only called when the
     * ScaleInterest interest is enabled. The default implementation does
     * nothing.
     * @param {ScaleDiv} xScaleDiv Scale division of the x-axis
     * @param {ScaleDiv} yScaleDiv Scale division of the y-axis
     */
    this.updateScaleDiv = function (xScaleDiv, yScaleDiv) {
      var rect = new Misc.Rect(
        new Misc.Point(xScaleDiv.lowerBound(), yScaleDiv.lowerBound()),
        xScaleDiv.range(),
        yScaleDiv.range()
      );

      this.setRectOfInterest(rect);
    };

    this.data = function () {
      return d_series;
    };

    this.sample = function (index) {
      return d_series ? d_series.sample(index) : null;
    };

    this.setData = function (series) {
      if (d_series != series) {
        d_series = series;
        //dataChanged();
      }
    };

    this.dataSize = function () {
      if (d_series == null) return 0;

      return d_series.size();
    };

    this.dataRect = function () {
      if (d_series == null) return new Misc.Rect(); //{left: 1.0, top:1.0, width:-2.0, height:-2.0 }; // invalid

      return d_series.boundingRect();
    };

    this.setRectOfInterest = function (rect) {
      if (d_series) d_series.setRectOfInterest(rect);
    };

    this.swapData = function (series) {
      var swappedSeries = d_series;
      d_series = series;

      return swappedSeries;
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[PlotSeriesItem]";
    };
  }

  /**
   *
   * @returns {Misc.Rect} Bounding rectangle
   */
  boundingRect() {
    return this.dataRect();
  }
}
