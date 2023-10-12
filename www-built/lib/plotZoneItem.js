

/**
 * A plot item, which displays a zone. See example
 *
 * A horizontal zone highlights an interval of the y axis - a vertical zone an interval of the x axis - and is unbounded
 * in the opposite direction. It is filled with a brush and its border lines are optionally displayed with a pen.
 * @extends PlotItem
 *
 * @example
 * const plot = new Plot();
 * const z = new PlotZoneItem();
 * z.setInterval(250, 280);
 * z.setPen(new Misc.Pen("red"));
 * //z.setBrush(new Misc.Brush("blue"));
 * //z.setOrientation(Static.Horizontal);
 * //z.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
 * z.attach(plot);
 */
class PlotZoneItem extends PlotItem {
  /**
   * Initializes the zone with no pen and a semi transparent gray brush
   */
  constructor(title) {
    super(title);

    var m_orientation = Static.Vertical;
    var m_pen = new Misc.Pen("red", 8, Static.NoPen);
    var m_brush = new Misc.Brush("darkGray");
    var m_interval = new Interval();

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, false);
    //setItemAttribute( QwtPlotItem::Legend, false );
    this.setItemAttribute(PlotItem.ItemAttribute.Legend, false);

    this.setZ(5);

    this.rtti = PlotItem.RttiValues.Rtti_PlotZone;

    /**
     * Assign a pen
     *
     * The pen is used to draw the border lines of the zone
     * @param {Misc.Pen} pen Pen
     * @see {@link PlotZoneItem#pen pen()}
     * @see {@link PlotZoneItem#setBrush setBrush()}
     */
    this.setPen = function (pen) {
      //if ( d_data->pen != pen )
      {
        m_pen = pen;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {Misc.Pen} Pen used to draw the border lines
     * @see {@link PlotZoneItem#setPen setPen()}
     * @see {@link PlotZoneItem#brush brush()}
     */
    this.pen = function () {
      return m_pen;
    };

    /**
     * Assign a brush
     *
     * The brush is used to fill the zone
     * @param {Misc.Brush} brush Brush
     * @see {@link PlotZoneItem#pen pen()}
     * @see {@link PlotZoneItem#setBrush setBrush()}
     */
    this.setBrush = function (brush) {
      //if ( m_brush != brush )
      {
        m_brush = brush;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {Misc.Brush} Brush used to fill the zone
     * @see {@link PlotZoneItem#setPen setPen()}
     * @see {@link PlotZoneItem#brush brush()}
     */
    this.brush = function () {
      return m_brush;
    };

    /**
     * Set the orientation of the zone
     *
     * A horizontal zone highlights an interval of the y axis, a vertical zone of the x axis. It is unbounded in the
     * opposite direction.
     * @param {Number} orientation Orientation (Static.Vertical or Static.Horizontal)
     * @see {@link PlotZoneItem#orientation orientation()}
     * @see {@link PlotItem#setAxes setAxes()}
     */
    this.setOrientation = function (orientation) {
      if (m_orientation != orientation) {
        m_orientation = orientation;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {Number} Orientation of the zone
     * @see {@link PlotZoneItem#setOrientation setOrientation()}
     */
    this.orientation = function () {
      return m_orientation;
    };

    /**
     * Sets the interval of the zone
     * @param {Number | Interval} param1 Minimum of the interval or Interval object
     * @param {Number} [param2] Maximum of the interval (only considered if param1 is a Number)
     * @see {@link PlotZoneItem#interval interval()}
     * @see {@link PlotZoneItem#setOrientation setOrientation()}
     */
    this.setInterval = function (param1, param2) {
      if (typeof param2 == "undefined") m_interval = param1;
      else m_interval = new Interval(param1, param2);
    };

    /**
     *
     * @returns {Interval} Zone interval
     * @see {@link PlotZoneItem#setInterval setInterval()}
     * @see {@link PlotZoneItem#orientation orientation()}
     */
    this.interval = function () {
      return m_interval;
    };

    /**
     *  Draw the zone
     * @param {ScaleMap} xMap Scale Map
     * @param {ScaleMap} yMap Scale Map
     */
    this.draw = function (xMap, yMap) {
      if (!m_interval.isValid()) return;

      var pen = m_pen;
      //pen.setCapStyle( Qt::FlatCap );

      //const bool doAlign = QwtPainter::roundingAlignment( painter );
      var canvasRect = this.getCanvasRect();
      var ctx = this.getContext();

      var painter = new PaintUtil.Painter(ctx);
      painter.setBrush(m_brush);
      painter.setPen(m_pen);

      if (m_orientation == Static.Horizontal) {
        var y1 = yMap.transform(m_interval.minValue());
        var y2 = yMap.transform(m_interval.maxValue());

        //            if ( doAlign )
        //            {
        //                y1 = qRound( y1 );
        //                y2 = qRound( y2 );
        //            }

        var r = new Misc.Rect(
          new Misc.Point(canvasRect.left(), y1),
          canvasRect.width(),
          y2 - y1
        );
        r = r.normalized();

        if (m_brush.style != Static.NoBrush && y1 != y2) {
          painter.fillRect(r, m_brush);
        }

        if (m_pen.style != Static.NoPen) {
          painter.drawLine(r.left(), r.top(), r.right(), r.top());
          painter.drawLine(r.left(), r.bottom(), r.right(), r.bottom());
        }
      } else {
        var x1 = xMap.transform(m_interval.minValue());
        var x2 = xMap.transform(m_interval.maxValue());

        //            if ( doAlign )
        //            {
        //                x1 = qRound( x1 );
        //                x2 = qRound( x2 );
        //            }

        var r = new Misc.Rect(
          new Misc.Point(x1, canvasRect.top()),
          x2 - x1,
          canvasRect.height()
        );
        r = r.normalized();

        if (m_brush != Static.NoBrush && x1 != x2) {
          painter.fillRect(r, m_brush);
        }

        if (m_pen.style != Static.NoPen) {
          painter.drawLine(r.left(), r.top(), r.left(), r.bottom());
          painter.drawLine(r.right(), r.top(), r.right(), r.bottom());
        }
      }
      painter = null;
    };

    /**
     * The bounding rectangle is build from the interval in one direction and something invalid for the opposite direction.
     * @returns {Misc.Rect} An invalid rectangle with valid boundaries in one direction
     */
    this.boundingRect = function () {
      var br = new Misc.Rect(); //super.boundingRect();

      var intv = m_interval;

      if (intv.isValid()) {
        if (m_orientation == Static.Horizontal) {
          br.setTop(intv.minValue());
          br.setBottom(intv.maxValue());
        } else {
          br.setLeft(intv.minValue());
          br.setRight(intv.maxValue());
        }
      }

      return br;
    };
  }

  /**
   *
   * @returns {String} A string representation of the object.
   */
  toString() {
    return "[PlotZoneItem]";
  }
}
