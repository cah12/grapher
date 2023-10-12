
/*!
Constructor

\param size Number of points
\param interval Bounding interval for the points

\sa setInterval(), setSize()
 */

/**
 * @extends SeriesData
 */
class SyntheticPointData extends SeriesData {
  constructor(size, interval) {
    // Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    //SeriesData.call(this);
    super();
    var d_size = size;
    var d_interval = interval || new Interval();
    //console.log(d_interval)
    var d_rectOfInterest;
    var d_intervalOfInterest = new Interval(0.0, 10.0); //???

    this.setSize = function (size) {
      d_size = size;
    };

    this.size = function () {
      return d_size;
    };

    /*!
        Set the bounding interval

        \param interval Interval
        \sa interval(), setSize()
         */
    this.setInterval = function (interval) {
      d_interval = interval.normalized();
    };

    /*!
        \return Bounding interval
        \sa setInterval(), size()
         */
    this.interval = function () {
      return d_interval;
    };

    /*!
        Set a the "rectangle of interest"

        QwtPlotSeriesItem defines the current area of the plot canvas
        as "rect of interest" ( QwtPlotSeriesItem::updateScaleDiv() ).

        If interval().isValid() == false the x values are calculated
        in the interval rect.left() -> rect.right().

        \sa rectOfInterest()
         */
    this.setRectOfInterest = function (rect) {
      d_rectOfInterest = rect;
      d_intervalOfInterest = new Interval(
        rect.left(),
        rect.right()
      ).normalized();
    };

    /*!
        \return "rectangle of interest"
        \sa setRectOfInterest()
         */
    this.rectOfInterest = function () {
      return d_rectOfInterest;
    };

    /*!
        \brief Calculate the bounding rectangle

        This implementation iterates over all points, what could often
        be implemented much faster using the characteristics of the series.
        When there are many points it is recommended to overload and
        reimplement this method using the characteristics of the series
        ( if possible ).

        \return Bounding rectangle
         */
    this.boundingRect = function () {
      if (
        d_size == 0 ||
        !(d_interval.isValid() || d_intervalOfInterest.isValid())
      ) {
        return new Misc.Rect(1.0, 1.0, -2.0, -2.0); // something invalid
      }

      return this.mBoundingRect(this);
    };

    this.y = function (_x) {
      throw 'subclass must implement "this.y"';
    };

    /*!
        Calculate a x-value from an index

        x values are calculated by dividing an interval into
        equidistant steps. If !interval().isValid() the
        interval is calculated from the "rectangle of interest".

        \param index Index of the requested point
        \return Calculated x coordinate

        \sa interval(), rectOfInterest(), y()
         */
    this.x = function (index) {
      var interval = d_interval.isValid() ? d_interval : d_intervalOfInterest;

      if (!interval.isValid() || d_size == 0 || index >= d_size) return 0.0;

      var dx = interval.width() / d_size;
      return interval.minValue() + index * dx;
    };

    this.toString = function () {
      return "[SyntheticPointData]";
    };
  }

  /*!
  Calculate the point from an index

  \param index Index
  \return QPointF(x(index), y(x(index)));

  \warning For invalid indices ( index < 0 || index >= size() )
  (0, 0) is returned.
    */
  sample(index) {
    if (index >= this.size()) return new Misc.Point(0, 0);

    var xValue = this.x(index);
    var yValue = this.y(xValue);
    //console.log(this.y)

    return new Misc.Point(xValue, yValue);
  }
}

/////////////////////////////////////////////////////////end
