"use strict";

/**
 * Curve that displays 3D points as dots, where the z coordinate is mapped to a color.
 * @extends PlotSeriesItem
 */
class SpectroCurve extends PlotSeriesItem {
  /**
   *
   * @param {String} tle Title of the curve
   */
  constructor(tle) {
    super(tle);

    this.rtti = PlotItem.RttiValues.Rtti_PlotSpectroCurve;
    var m_colorMap = new LinearColorMap(ColorMap.Format.Indexed);
    var m_colorRange = new Interval(0.0, 1000.0);
    var m_penWidth = 0.0;
    var m_colorTable = [];

    //! Initialize internal members
    this.init = function () {
      this.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
      this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

      this.setData(new Point3DSeriesData());
    };

    /*!
        Specify an attribute how to draw the curve

        \param attribute Paint attribute
        \param on On/Off
        \sa testPaintAttribute()
         */
    this.setPaintAttribute = function (attribute, on) {
      if (on) m_paintAttributes |= attribute;
      else m_paintAttributes &= ~attribute;
    };

    /*!
        \return True, when attribute is enabled
        \sa setPaintAttribute()
         */
    this.testPaintAttribute = function (attribute) {
      return m_paintAttributes & attribute;
    };

    /**
     * Initialize data with an array of samples.
     * @param {Array<Misc.Point>} samples  Array of points
     */
    this.setSamples = function (samples) {
      this.setData(new Point3DSeriesData(samples));
    };

    /**
     * Change the color map
     * Often it is useful to display the mapping between intensities and
     * colors as an additional plot axis, showing a color bar.
     * @param {ColorMap} colorMap Color Map
     * @see {@link SpectroCurve#colorMap colorMap()}
     * @see {@link SpectroCurve#setColorRange setColorRange()}
     * @see {@link ColorMap#rgb rgb()}
     */
    this.setColorMap = function (colorMap) {
      if (colorMap != m_colorMap) {
        m_colorMap = colorMap;
      }
      itemChanged();
    };

    /**
     *
     * @returns {ColorMap}  Color Map used for mapping the intensity values to colors
     * @see {@link SpectroCurve#colorMap colorMap()}
     * @see {@link SpectroCurve#setColorRange setColorRange()}
     * @see {@link ColorMap#rgb rgb()}
     */
    this.colorMap = function () {
      return m_colorMap;
    };

    /**
     * Set the value interval, that corresponds to the color map
     *
     * @param {Interval} interval interval.minValue() corresponds to 0.0,
     * interval.maxValue() to 1.0 on the color map.
     * @see {@link SpectroCurve#colorRange colorRange()}
     * @see {@link SpectroCurve#setColorMap setColorMap()}
     * @see {@link ColorMap#rgb rgb()}
     */
    this.setColorRange = function (interval) {
      if (interval != m_colorRange) {
        m_colorRange = interval;

        //legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Interval} Value interval, that corresponds to the color map
     * @see {@link SpectroCurve#setColorRange setColorRange()}
     * @see {@link SpectroCurve#setColorMap setColorMap()}
     * @see {@link ColorMap#rgb rgb()}
     */
    this.colorRange = function () {
      return m_colorRange;
    };

    /**
     * Assign a pen width
     * @param {Number} penWidth New pen width
     * @see {@link SpectroCurve#penWidth penWidth()}
     */
    this.setPenWidth = function (penWidth) {
      if (penWidth < 0.0) penWidth = 0.0;

      if (m_penWidth != penWidth) {
        m_penWidth = penWidth;

        //legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Number} Pen width used to draw a dot
     * @see {@link SpectroCurve#setPenWidth setPenWidth()}
     */
    this.penWidth = function () {
      return m_penWidth;
    };

    /**
     * Set the color range
     * Add stops at 0.0 and 1.0.
     * @param {string|object} color1 Color used for the minimum value of the value interval
     * @param {string|object} color2 Color used for the maximum value of the value interval
     * @see {@link SpectroCurve#color1 color1()}
     * @see {@link SpectroCurve#color2 color2()}
     */
    this.setColorInterval = function (color1, color2) {
      m_colorMap.setColorInterval(color1, color2);
      this.itemChanged();
    };

    /**
     *
     * @returns {string|object} The first color of the color range
     * @see {@link LinearColorMap#color1 color1()}
     */
    this.color1 = function () {
      return m_colorMap.color1();
    };

    /**
     *
     * @returns {string|object} The second color of the color range
     * @see {@link LinearColorMap#color2 color2()}
     */
    this.color2 = function () {
      return m_colorMap.color2();
    };

    /**
     * Draw a subset of the points
     * @param {ColorMap} xMap Maps x-values into pixel coordinates.
     * @param {ColorMap} yMap Maps y-values into pixel coordinates.
     * @param {Number} from Index of the first sample to be painted
     * @param {Number} to Index of the last sample to be painted. If to < 0 the
     * series will be painted to its last sample.
     * @see {@link SpectroCurve#drawDots drawDots()}
     */
    this.drawSeries = function (xMap, yMap, from, to) {
      var ctx = this.getContext();

      var painter = new PaintUtil.Painter(ctx);

      //if ( !painter || this.dataSize() <= 0 )
      if (this.dataSize() <= 0) return;

      if (to < 0) to = this.dataSize() - 1;

      if (from < 0) from = 0;

      if (from > to) return;

      this.drawDots(painter, xMap, yMap, /*canvasRect,*/ from, to);
      painter = null;
    };

    /**
     *
     * @param {PaintUtil.Painter} painter Painter
     * @param {ColorMap} xMap Maps x-values into pixel coordinates.
     * @param {ColorMap} yMap Maps y-values into pixel coordinates.
     * @param {Number} from Index of the first sample to be painted
     * @param {Number} to Index of the last sample to be painted. If to < 0 the
     * series will be painted to its last sample.
     * @see {@link SpectroCurve#drawSeries drawSeries()}
     */
    this.drawDots = function (painter, xMap, yMap, /*canvasRect,*/ from, to) {
      if (!m_colorRange.isValid()) return;

      //const bool doAlign = QwtPainter::roundingAlignment( painter );

      var format = m_colorMap.format();
      if (format == ColorMap.Format.Indexed)
        m_colorTable = m_colorMap.colorTable(m_colorRange);

      var series = this.data();

      for (var i = from; i <= to; i++) {
        var sample = series.sample(i);

        var xi = xMap.transform(sample.x);
        var yi = yMap.transform(sample.y);
        /*if ( doAlign ){
                xi = Math.round( xi );
                yi = Math.round( yi );
                }*/

        /*if ( d_data->paintAttributes & QwtPlotSpectroCurve::ClipPoints )
            {
                if ( !canvasRect.contains( xi, yi ) )
                continue;
                }*/

        if (format == ColorMap.Format.RGB) {
          var rgb = m_colorMap.rgb(m_colorRange, sample.z);
          painter.setPen(new Misc.Pen(Utility.RGB2HTML(rgb), m_penWidth));
          painter.setBrush(new Misc.Brush(Utility.RGB2HTML(rgb)));
        } else {
          var index = parseInt(m_colorMap.colorIndex(m_colorRange, sample.z));
          var color = m_colorTable[index];
          painter.setPen(new Misc.Pen(Utility.RGB2HTML(color), m_penWidth));
          painter.setBrush(new Misc.Brush(Utility.RGB2HTML(color)));
        }
        painter.drawPoint(new Misc.Point(xi, yi));
      }
      m_colorTable = []; //clear m_colorTable
    };

    this.init();
  }
}
