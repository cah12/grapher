"use strict";
/**
 * A plot item, that represents a series of points.
 *
 * A curve is the representation of a series of points in the x-y plane. It supports different display styles,
 * interpolation ( f.e. spline ) and symbols.
 *
 * **Usage**
 *
 * **a) Assign curve properties**: When a curve is created, it is configured to draw black solid lines with in {@link Curve.CurveStyle Curve.CurveStyle.Lines} style and no symbols. You can change this by calling {@link Curve#setPen setPen()}, {@link Curve#setStyle setStyle()} and {@link Curve#setSymbol setSymbol()}.
 *
 * b) **Connect/Assign data**: Curve gets its points using a {@link SeriesData}. There are several convenience classes derived from {@link SeriesData}, that also store the points. Curve also offers a couple of variations of setSamples(), that build SeriesData objects from arrays internally.
 *
 * c) **Attach the curve to a plot**: See {@link PlotItem#attach attach()}
 * @extends PlotSeriesItem
 */
class Curve extends PlotSeriesItem {
  static mVerifyRange(size, i1, i2) {
    if (size < 1) return 0;

    i1 = Math.max(0, Math.min(i1, size - 1));
    i2 = Math.max(0, Math.min(i2, size - 1));

    if (i1 > i2) {
      //qSwap( i1, i2 );
      var temp = i1;
      i1 = i2;
      i2 = temp;
    }

    return i2 - i1 + 1;
  }
  /**
   *
   * @param {String} tle Title of curve
   */
  constructor(tle) {
    super(tle);

    var m_style = Curve.CurveStyle.Lines;
    var c_attributes = 0x0;
    var m_baseline = 0;
    var m_paintAttributes = Curve.PaintAttribute.FilterPoints;
    var m_legendAttributes = Curve.LegendAttribute.LegendNoAttribute;
    var m_brush = new Misc.Brush(); //"NoBrush";
    var m_pen = new Misc.Pen(); //mMakePen();

    var m_curveFitter = null;

    var m_symbol = null;

    this.rtti = PlotItem.RttiValues.Rtti_PlotCurve;

    this.setItemInterest(PlotItem.ItemInterest.ScaleInterest, true);

    /**
     *
     * @returns {Number} boundingRect().left()
     */
    this.minXValue = function () {
      return this.boundingRect().left();
    };

    /**
     *
     * @returns {Number} boundingRect().right()
     */
    this.maxXValue = function () {
      return this.boundingRect().right();
    };

    /**
     *
     * @returns {Number} boundingRect().top()
     */
    this.minYValue = function () {
      return this.boundingRect().top();
    };

    /**
     *
     * @returns {Number} boundingRect().bottom()
     */
    this.maxYValue = function () {
      return this.boundingRect().bottom();
    };

    /**
     * Specify an attribute how to draw the legend icon
     * @param {Curve.LegendAttribute} attribute Attribute
     * @param {Boolean} on On/Off
     * @see {@link Curve#testLegendAttribute testLegendAttribute()}
     * @see {@link Curve#legendIcon legendIcon()}
     */
    this.setLegendAttribute = function (attribute, on) {
      if (on != this.testLegendAttribute(attribute)) {
        if (on) m_legendAttributes |= attribute;
        else m_legendAttributes &= ~attribute;

        Utility.updateLegendIconSize(this);
        //alert(this.legendIconSize())
        //legendChanged();

        if (this.plot()) this.plot().updateLegend(this);
      }
    };

    /**
     *
     * @param {Curve.LegendAttribute} attribute
     * @returns {Boolean} True, when attribute is enabled
     * @see {@link Curve#setLegendAttribute setLegendAttribute()}
     */
    this.testLegendAttribute = function (attribute) {
      return m_legendAttributes & attribute;
    };

    /**
     *
     * @returns {Number} Attributes how to draw the legend icon
     */
    this.legendAttributes = function () {
      return m_legendAttributes;
    };

    /**
     * Assign a symbol.
     *
     * The curve will take the ownership of the symbol, hence the previously set symbol will be removed by setting
     * a new one. If symbol is null, no symbol will be drawn.
     * @param {Symbol2} symbol Symbol
     * @see {@link Curve#symbol symbol()}
     */
    this.setSymbol = function (symbol) {
      if (symbol !== m_symbol) {
        m_symbol = symbol;

        Utility.updateLegendIconSize(this);

        this.legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Symbol2} Current symbol or null, when no symbol has been assigned
     * @see {@link Curve#setSymbol setSymbol()}
     */
    this.symbol = function () {
      return m_symbol;
    };

    /**
     * Assign a brush.
     *
     * In case of brush.style != Static.NoBrush and {@link Curve#style style()} != {@link Curve.CurveStyle Curve.CurveStyle.Sticks} the area between the curve and the baseline will be filled.
     *
     * The fill algorithm simply connects the first and the last curve point to the baseline. So the curve data has to be sorted (ascending or descending).
     * @param {Misc.Brush} brush New brush
     * @see {@link Curve#brush brush()}
     * @see {@link Curve#setBaseline setBaseline()}
     * @see {@link Curve#baseline baseline()}
     */
    this.setBrush = function (brush) {
      if (typeof brush == "string") brush = new Misc.Brush(brush);
      //if(!m_brush.isEqual(brush)){
      m_brush = brush;
      this.legendChanged();
      this.itemChanged();
      // }
    };

    /**
     *
     * @returns {Misc.Brush} Brush used to fill the area between lines and the baseline
     * @see {@link Curve#setBrush setBrush()}
     * @see {@link Curve#setBaseline setBaseline()}
     * @see {@link Curve#baseline baseline()}
     */
    this.brush = function () {
      return m_brush;
    };

    /**
     * Build and assign a pen
     * @param {Misc.Pen} pen New pen
     * @see {@link Curve#pen pen()}
     * @see {@link Curve#brush brush()}
     */
    this.setPen = function (pen) {
      if (typeof pen !== "object") return;
      //if(!m_pen.isEqual(pen)){
      m_pen = pen;
      this.legendChanged();
      this.itemChanged();
      //}
    };

    /**
     *
     * @returns {Misc.Pen} Pen used to draw the lines
     * @see {@link Curve#setPen setPen()}
     * @see {@link Curve#setBrush setBrush()}
     */
    this.pen = function () {
      return m_pen;
    };

    /**
     * Specify an attribute how to draw the curve
     * @param {Curve.PaintAttribute} attribute Paint attribute
     * @param {Boolean} on On/Off
     * @see {@link Curve#testPaintAttribute testPaintAttribute()}
     */
    this.setPaintAttribute = function (attribute, on) {
      if (on) m_paintAttributes |= attribute;
      else m_paintAttributes &= ~attribute;
    };

    /**
     *
     * @param {Curve.PaintAttribute} attribute
     * @returns {Boolean} True, when attribute is enabled
     * @see {@link Curve#setPaintAttribute setPaintAttribute()}
     */
    this.testPaintAttribute = function (attribute) {
      return m_paintAttributes & attribute;
    };

    /**
     * Initialize data with an array of points.
     * @param {Array<Misc.Point>} samples Array of points
     */
    this.setSamples = function (samples) {
      this.setData(new PointSeriesData(samples));
    };

    /**
     * Specify an attribute for drawing the curve
     * @param {Curve.CurveAttribute} attribute Curve attribute
     * @param {Boolean} on On/Off
     * @see {@link Curve#testCurveAttribute testCurveAttribute()}
     * @see {@link Curve#setCurveFitter setCurveFitter()}
     */
    this.setCurveAttribute = function (attribute, on) {
      if (typeof on === "undefined") on = true;
      if ((c_attributes & attribute) == on) return;

      if (on) c_attributes |= attribute;
      else c_attributes &= ~attribute;

      this.itemChanged();
    };

    /**
     *
     * @returns {Number} Attributes how to draw curve
     */
    this.curveAttributes = function () {
      return c_attributes;
    };

    /**
     *
     * @param {Curve.CurveAttribute} attribute
     * @returns {Boolean} true, if attribute is enabled
     * @see {@link Curve#setCurveAttribute setCurveAttribute()}
     */
    this.testCurveAttribute = function (attribute) {
      return c_attributes & attribute;
    };

    //! Initialize internal members
    this.init = function () {
      this.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
      this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

      this.setData(new PointSeriesData());
      //this.setCurveAttribute(Curve.CurveAttribute.Fitted, true);

      this.setZ(20.0);
    };

    /**
     * Set the curve's drawing style
     * @param {Curve.CurveStyle} style Curve style
     * @see {@link Curve#style style()}
     */
    this.setStyle = function (style) {
      if (style != m_style) {
        m_style = style;
        this.legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Curve.CurveStyle} Style of the curve
     * @see {@link Curve#setStyle setStyle()}
     */
    this.style = function () {
      return m_style;
    };

    /**
     * Draw an interval of the curve
     * @param {ScaleMap} xMap Maps x-values into pixel coordinates.
     * @param {ScaleMap} yMap Maps y-values into pixel coordinates.
     * @param {Number} from Index of the first point to be painted
     * @param {Number} to Index of the last point to be painted. If to < 0 the curve will be painted to its last point.
     * @see {@link Curve#drawCurve drawCurve()}
     * @see {@link Curve#drawSymbols drawSymbols()}
     */
    this.drawSeries = function (xMap, yMap, from, to) {
      var ctx = this.getContext();

      var painter = new PaintUtil.Painter(ctx);
      // painter.setPen(m_pen);
      // painter.setBrush(m_brush);
      var numSamples = this.dataSize();

      if (numSamples <= 0) return;

      //        if ( typeof(from) == "undefined" )
      //            from = 0;

      //        if ( typeof(to) == "undefined" )
      //            to = numSamples - 1;
      if (to < 0) to = numSamples - 1;

      //alert(from)

      if (Curve.mVerifyRange(numSamples, from, to) > 0) {
        painter.save();
        painter.setPen(m_pen);
        painter.setBrush(m_brush);
        //painter->setPen( d_data->pen );

        /*
                Qt 4.0.0 is slow when drawing lines, but it's even
                slower when the painter has a brush. So we don't
                set the brush before we really need it.
                 */

        this.drawCurve(painter, m_style, xMap, yMap, from, to);
        painter.restore();

        if (m_symbol && m_symbol.style() !== Symbol2.Style.NoSymbol) {
          painter.save();
          painter.setPen(m_symbol.pen());
          painter.setBrush(m_symbol.brush());
          this.drawSymbols(ctx, m_symbol, xMap, yMap, from, to);
          painter.restore();
        }
      }
      painter = null;
    };

    /**
     * Draw symbols
     * @param {object} ctx 2d context for the central div canvas
     * @param {Symbol2} symbol Curve symbol
     * @param {ScaleMap} xMap x map
     * @param {ScaleMap} yMap y map
     * @param {Number} from Index of the first point to be painted
     * @param {Number} to Index of the last point to be painted
     * @see {@link Curve#setSymbol setSymbol()}
     * @see {@link Curve#drawSeries drawSeries()}
     * @see {@link Curve#drawCurve drawCurve()}
     */
    this.drawSymbols = function (ctx, symbol, xMap, yMap, from, to) {
      var mapper = new PointMapper();
      //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.RoundPoints,  QwtPainter::roundingAlignment( painter ) );
      mapper.setFlag(
        PointMapper.TransformationFlag.WeedOutPoints,
        this.testPaintAttribute(Curve.PaintAttribute.FilterPoints)
      );
      //mapper.setBoundingRect( canvasRect );

      var chunkSize = 500;

      //var ctx = this.getContext();
      for (var i = from; i <= to; i += chunkSize) {
        var n = Math.min(chunkSize, to - i + 1);

        var points = mapper.toPointsF(xMap, yMap, this.data(), i, i + n - 1);

        if (points.length > 0) symbol.drawSymbols(ctx, points);
      }
    };

    /**
     * Set the value of the baseline
     *
     * The baseline is needed for filling the curve with a brush or the Sticks drawing style.
     *
     * The interpretation of the baseline depends on the orientation(). With Static.Horizontal, the baseline is
     * interpreted as a horizontal line at y = baseline(), with Static.Vertical, it is interpreted as a vertical line at x = baseline().
     *
     * The default value is 0.0.
     * @param {Number} value Value of the baseline
     * @see {@link Curve#baseline baseline()}
     * @see {@link Curve#setBrush setBrush()}
     * @see {@link Curve#setStyle setStyle()}
     * @see {@link PlotSeriesItem#orientation orientation()}
     */
    this.setBaseline = function (value) {
      if (m_baseline != value) {
        m_baseline = value;
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Number} Value of the baseline
     * @see {@link Curve#setBaseline setBaseline()}
     */
    this.baseline = function () {
      return m_baseline;
    };

    /*!
        \brief Draw lines

        If the CurveAttribute Curve.CurveAttribute.Fitted is enabled a QwtCurveFitter tries
        to interpolate/smooth the curve, before it is painted.

        \param painter Painter
        \param xMap x map
        \param yMap y map
        \param canvasRect Contents rectangle of the canvas
        \param from index of the first point to be painted
        \param to index of the last point to be painted

        \sa setCurveAttribute(), setCurveFitter(), draw(),
        drawLines(), drawDots(), drawSteps(), drawSticks()
         */
    /* this.drawLines = function (painter, xMap, yMap, from, to) {
        if (from > to)
        return;

        //const bool doAlign = QwtPainter::roundingAlignment( painter );
        var doFit = (c_attributes & Curve.CurveAttribute.Fitted) && m_curveFitter;
        var doFill = m_brush.color !== Static.NoBrush ? true : false;
        //alert(doFill)

        //        QRectF clipRect;
        //        if ( d_data->paintAttributes & ClipPolygons )
        //        {
        //            qreal pw = qMax( qreal( 1.0 ), painter->pen().widthF());
        //            clipRect = canvasRect.adjusted(-pw, -pw, pw, pw);
        //        }

        var doIntegers = false;

        //        const bool noDuplicates = d_data->paintAttributes & Curve.PaintAttribute.FilterPoints;


        var mapper = new PointMapper;
        //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.RoundPoints, doAlign );
        //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.WeedOutPoints, noDuplicates );
        //mapper.setBoundingRect( canvasRect );


        //alert(443)
        var polyline = mapper.toPolygonF(xMap, yMap, this.data(), from, to);
        //alert(444)

        if (doFit) {
        //console.log(44)
        polyline = m_curveFitter.fitCurve(polyline);
        }

        //console.log(polyline)


        painter.drawPolyline(polyline);
        if (doFill) {
        this.fillCurve(painter, xMap, yMap, polyline);
        }

        } */

    /**
     * Assign a curve fitter
     *
     * The curve fitter "smooths" the curve points, when the Fitted CurveAttribute is set. setCurveFitter(null) also disables curve fitting.
     *
     * The curve fitter operates on the translated points ( = widget coordinates) to be functional for logarithmic scales. Obviously this is less performant
     * for fitting algorithms, that reduce the number of points.
     *
     * For situations, where curve fitting is used to improve the performance of painting huge series of points it might be
     * better to execute the fitter on the curve points once and to cache the result in the QwtSeriesData object.
     * @param {CurveFitter} curveFitter Curve fitter
     * @see {@link Curve.CurveAttribute Curve.CurveAttribute.Fitted}
     */
    this.setCurveFitter = function (curveFitter) {
      //m_curveFitter = 0;
      m_curveFitter = curveFitter;

      this.itemChanged();
    };

    /**
     * Get the curve fitter. If curve fitting is disabled null is returned.
     * @returns {CurveFitter} Curve fitter
     * @see {@link Curve#setCurveFitter setCurveFitter()}
     * @see {@link Curve.CurveAttribute Curve.CurveAttribute.Fitted}
     */
    this.curveFitter = function () {
      return m_curveFitter;
    };

    function qwtSqr(x) {
      return x * x;
    }

    /**
     * Find the closest curve point index for a specific position
     *
     * closestPoint() implements a dumb algorithm, that iterates over all points
     * @param {Misc.Point} pos Position, where to look for the closest curve point
     * @param {object} dist If dist != null, closestPoint() returns the distance between the position and the closest curve point in the property `dist.distance`
     * @returns {Number} Index of the closest curve point, or -1 if none can be found
     */
    this.closestPoint = function (
      /* const QPoint & */ pos,
      /* double * */ dist
    ) {
      let numSamples = this.dataSize();

      if (this.plot() == null || numSamples <= 0) return -1;

      let series = this.data();

      let xMap = this.plot().canvasMap(this.xAxis());
      let yMap = this.plot().canvasMap(this.yAxis());

      let index = -1;
      let dmin = 1.0e10;

      for (var i = 0; i < numSamples; i++) {
        let sample = series.sample(i);

        let cx = xMap.transform(sample.x) - pos.x;
        let cy = yMap.transform(sample.y) - pos.y;

        /* let cx = sample.x  - pos.x;
                let cy = sample.y  - pos.y; */

        let f = qwtSqr(cx) + qwtSqr(cy);
        if (f < dmin) {
          index = i;
          dmin = f;
        }
      }
      if (dist) dist.distance = Math.sqrt(dmin);

      return index;
    };

    /**
     * Fill the area between the curve and the baseline with the curve brush
     * @param {PaintUtil.Painter} painter Painter
     * @param {ScaleMap} xMap x map
     * @param {ScaleMap} yMap y map
     * @param {Array<Misc.Point>} polygon Polygon - will be modified !
     * @see {@link Curve#setBrush setBrush()}
     * @see {@link Curve#setBaseline setBaseline()}
     * @see {@link Curve#setStyle setStyle()}
     */
    this.fillCurve = function (painter, xMap, yMap, polygon) {
      if (m_brush.color == Static.NoBrush) return;

      //alert(polygon.length)
      this.closePolyline(xMap, yMap, polygon);
      if (polygon.length <= 2)
        // a line can't be filled
        return;

      //alert(polygon.length)

      //if ( d_data->paintAttributes & ClipPolygons )
      //polygon = QwtClipper::clipPolygonF( canvasRect, polygon, true );

      painter.setPen(new Misc.Pen(m_brush.color));
      painter.drawPolygon(polygon);

      //painter->restore();
    };

    /**
     * Complete a polygon to be a closed polygon including the area between the original polygon and the baseline.
     * @param {ScaleMap} xMap X map
     * @param {ScaleMap} yMap Y map
     * @param {Array<Misc.Point>} polygon Polygon to be completed
     */
    this.closePolyline = function (xMap, yMap, polygon) {
      if (polygon.length < 2) return;

      //const bool doAlign = QwtPainter::roundingAlignment( painter );

      var baseline = m_baseline;

      if (this.orientation() == Static.Vertical) {
        if (yMap.transformation())
          baseline = yMap.transformation().bounded(baseline);

        var refY = yMap.transform(baseline);
        //if ( doAlign )
        //refY = qRound( refY );

        //polygon.push({x:polygon[polygon.length -1].x, y:refY} );
        //polygon.push( {x:polygon[0].x, y:refY} );
        polygon.push(new Misc.Point(polygon[polygon.length - 1].x, refY));
        polygon.push(new Misc.Point(polygon[0].x, refY));
      } else {
        if (xMap.transformation())
          baseline = xMap.transformation().bounded(baseline);

        var refX = xMap.transform(baseline);
        //if ( doAlign )
        //refX = qRound( refX );

        //polygon.push( {x:refX, y:polygon[polygon.length -1].y} );
        //polygon.push( {x:refX, y:polygon[0].y} );
        polygon.push(new Misc.Point(refX, polygon[polygon.length - 1].y));
        polygon.push(new Misc.Point(refX, polygon[0].y));
      }
    };

    /**
     * Draw step function
     *
     * The direction of the steps depends on Inverted attribute.
     * @param {PaintUtil.Painter} painter Painter
     * @param {ScaleMap} xMap x map
     * @param {ScaleMap} yMap y map
     * @param {Number} from index of the first point to be painted
     * @param {Number} to index of the last point to be painted
     * @see {@link Curve#draw draw()}
     * @see {@link Curve#drawDots drawDots()}
     * @see {@link Curve#drawLines drawLines()}
     * @see {@link Curve#drawSticks drawSticks()}
     */
    this.drawSteps = function (painter, xMap, yMap, from, to) {
      //const bool doAlign = QwtPainter::roundingAlignment( painter );

      //QPolygonF polygon( 2 * ( to - from ) + 1 );
      //alert(from+", "+to)
      var points = [];
      var sz = 2 * (to - from) + 1;
      for (var i = 0; i < sz; ++i)
        //points.push({x:0,y:0})
        points.push(new Misc.Point());

      //alert(points.length)

      var inverted = this.orientation() == Static.Vertical;
      if (c_attributes & Curve.CurveAttribute.Inverted) inverted = !inverted;

      var series = this.data();

      var i, ip;
      for (i = from, ip = 0; i <= to; i++, ip += 2) {
        var sample = series.sample(i);

        var xi = xMap.transform(sample.x);
        var yi = yMap.transform(sample.y);
        //            if ( doAlign )
        //            {
        //                xi = Math.round( xi );
        //                yi = Math.round( yi );
        //            }

        if (ip > 0) {
          var p0 = points[ip - 2];
          var p = points[ip - 1];

          if (inverted) {
            p.x = p0.x;
            p.y = yi;
          } else {
            p.x = xi;
            p.y = p0.y;
          }
        }

        points[ip].x = xi;
        points[ip].y = yi;
      }
      //alert(points)
      //        if ( d_data->paintAttributes & ClipPolygons )
      //        {
      //            const QPolygonF clipped = QwtClipper::clipPolygonF(
      //                canvasRect, polygon, false );

      //            QwtPainter::drawPolyline( painter, clipped );
      //        }
      //        else
      //        {

      painter.drawPolyline(points);
      if (this.brush() != "noBrush" /* doFill */) {
        this.fillCurve(painter, xMap, yMap, points);
      }
      //if ( this.brush() != "noBrush" )
      //            fillCurve( painter, xMap, yMap, canvasRect, polygon );
    };

    /**
     * Draw sticks
     *
     * @param {PaintUtil.Painter} painter Painter
     * @param {ScaleMap} xMap x map
     * @param {ScaleMap} yMap y map
     * @param {Number} from index of the first point to be painted
     * @param {Number} to index of the last point to be painted
     * @see {@link Curve#draw draw()}
     * @see {@link Curve#drawDots drawDots()}
     * @see {@link Curve#drawLines drawLines()}
     * @see {@link Curve#drawSteps drawSteps()}
     */
    this.drawSticks = function (painter, xMap, yMap, from, to) {
      //alert(45)
      //painter->save();
      //painter->setRenderHint( QPainter::Antialiasing, false );

      //const bool doAlign = QwtPainter::roundingAlignment( painter );
      //m_baseline = -100;

      var x0 = xMap.transform(m_baseline);
      var y0 = yMap.transform(m_baseline);
      //        if ( doAlign )
      //        {
      //            x0 = qRound( x0 );
      //            y0 = qRound( y0 );
      //        }

      var o = this.orientation();

      var series = this.data();

      //var penWidth = 1;
      //var penColor  = "#ff0000";
      //ctx.strokeStyle = penColor;///////////
      //ctx.beginPath();

      for (var i = from; i <= to; i++) {
        var sample = series.sample(i);
        var xi = xMap.transform(sample.x);
        var yi = yMap.transform(sample.y);
        //            if ( doAlign )
        //            {
        //                xi = qRound( xi );
        //                yi = qRound( yi );
        //            }

        if (o == Static.Horizontal)
          //ctx.moveTo(x0, yi);
          painter.drawLine(x0, yi, xi, yi);
        //ctx.moveTo(xi, y0);
        else painter.drawLine(xi, y0, xi, yi);
        //ctx.lineTo(xi, yi);
      }

      //ctx.stroke();
      //ctx.closePath();
    };

    /**
     *
     * Draw dots
     *
     * @param {PaintUtil.Painter} painter Painter
     * @param {ScaleMap} xMap x map
     * @param {ScaleMap} yMap y map
     * @param {Number} from index of the first point to be painted
     * @param {Number} to index of the last point to be painted
     * @see {@link Curve#draw draw()}
     * @see {@link Curve#drawSticks drawSticks()}
     * @see {@link Curve#drawLines drawLines()}
     * @see {@link Curve#drawSteps drawSteps()}
     */
    this.drawDots = function (painter, xMap, yMap, from, to) {
      //TODO
      /*var penWidth = 1;
            var penColor  = "#ff0000";
            //var ctx = this.getContext();
            ctx.fillStyle = penColor;///////////

             */

      //ctx.beginPath();

      //const QColor color = painter->pen().color();

      //if ( painter->pen().style() == Qt::NoPen || color.alpha() == 0 )
      //{
      //return;
      //}

      //const bool doFill = ( d_data->brush.style() != Qt::NoBrush )
      // && ( d_data->brush.color().alpha() > 0 );
      //const bool doAlign = QwtPainter::roundingAlignment( painter );

      var mapper = new PointMapper();
      //mapper.setBoundingRect( canvasRect );
      //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.RoundPoints, doAlign );

      if (m_paintAttributes & Curve.PaintAttribute.FilterPoints) {
        mapper.setFlag(PointMapper.TransformationFlag.WeedOutPoints, true);
      }

      /*if ( doFill ){
            mapper.setFlag( PointMapper.TransformationFlag.WeedOutPoints, false );

            var points = mapper.toPointsF( xMap, yMap, data(), from, to );

            this.drawPoints( painter, points );
            //fillCurve( painter, xMap, yMap, canvasRect, points );
            }*/

      /*else*/
      if (m_paintAttributes & Curve.PaintAttribute.MinimizeMemory) {
        var series = this.data();

        for (var i = from; i <= to; i++) {
          var sample = series.sample(i);

          var xi = xMap.transform(sample.x);
          var yi = yMap.transform(sample.y);

          /*if ( doAlign ){
                    xi = qRound( xi );
                    yi = qRound( yi );
                    }*/

          //this.drawPoint(ctx, {x:xi, y:yi});
          //this.drawPoint(ctx, new Point(xi, yi));
          painter.drawPoint(new Misc.Point(xi, yi));
        }

        //ctx.closePath();
      } else {
        var points = mapper.toPointsF(xMap, yMap, this.data(), from, to);
        //alert(points)

        //this.drawPoints(ctx, points );
        painter.drawPoints(points);
      }
    };

    /**
     *
     * @param {Number} index Index of the legend entry
     * @param {Misc.Size} size Icon size
     * @returns {Graphic} Icon representing the curve on the legend
     * @see {@link PlotItem#setLegendIconSize setLegendIconSize()}
     * @see {@link PlotItem#legendData legendData()}
     */
    this.legendIcon = function (index, size) {
      if (size.width === 0 && size.height === 0) return null;

      var graphic = new Graphic(null, size.width, size.height);

      //graphic.setDefaultSize( size );
      //graphic.setRenderHint( QwtGraphic::RenderPensUnscaled, true );

      //QPainter painter( &graphic );
      //painter.setRenderHint( QPainter::Antialiasing,
      // testRenderHint( QwtPlotItem::RenderAntialiased ) );
      var painter = new PaintUtil.Painter(graphic);

      if (
        this.legendAttributes() == 0 ||
        this.legendAttributes() & Curve.LegendAttribute.LegendShowBrush
      ) {
        var brush = this.brush();

        if (brush.color == Static.NoBrush && this.legendAttributes() == 0) {
          if (this.style() != Curve.CurveStyle.NoCurve) {
            brush = new Misc.Brush(this.pen().color);
          } else if (
            this.symbol() &&
            this.symbol().style() != Symbol2.Style.NoSymbol
          ) {
            brush = new Misc.Brush(this.symbol().pen().color);
          }
        }
        if (brush.color != Static.NoBrush) {
          var r = new Misc.Rect(0, 0, size.width, size.height);
          painter.fillRect(r, brush);
          //graphic.setParent($("#demo"))
        }
      }

      if (this.legendAttributes() & Curve.LegendAttribute.LegendShowLine) {
        if (this.pen().color != Static.NoPen) {
          var pn = this.pen();
          //pn.setCapStyle( Qt::FlatCap );

          painter.setPen(pn);

          var y = 0.5 * size.height;
          painter.drawLine(0.0, y, size.width, y);
        }
      }

      if (this.legendAttributes() & Curve.LegendAttribute.LegendShowSymbol) {
        if (this.symbol()) {
          var sh = size.height / 2; // + 1;
          if (this.symbol().style() == Symbol2.Style.Ellipse) sh -= 1;
          //painter.pen().width = this.symbol().pen().width
          //console.log(painter.pen().width)
          painter.setPen(this.symbol().pen());
          this.symbol().drawGraphicSymbol(
            painter,
            new Misc.Point(size.width / 2, sh),
            size
          );
        }
      }
      painter = null;
      return graphic;
    };

    /**
     * Removes the specified point from the curve.
     *
     * Triggers the pointRemoved event - (Static.trigger("pointRemoved", this))
     * @param {Misc.Point} point Point to remove
     * @param {Boolean} always=false if false (the default) and the curve has only one point, the point is not removed.
     */
    this.removePoint = function (point, always) {
      if (always == undefined) always = false;
      //console.log("Remove: curve found")
      var samples = this.data().samples();
      if (samples.length == 1 && !always) {
        Utility.alert(
          "You cannot remove the only point in the curve. Remove the entire curve."
        );
        return;
      }
      var newSamples = [];
      //var x = point.x;
      //var y = point.y;
      for (var i = 0; i < samples.length; ++i) {
        //if (samples[i].x == x && samples[i].y == y)
        if (samples[i].isEqual(point)) continue;
        newSamples.push(samples[i]);
      }
      if (newSamples.length === samples.length && !always) {
        Utility.alert("The point selected for removal does not exist.");
        return;
      }
      this.setSamples(newSamples);
      this.itemChanged();
      Static.trigger("pointRemoved", this);
    };

    /**
     *
     * @returns {String} A string representation of the object
     */
    this.toString = function () {
      return "[Curve]";
    };

    this.init();
  }

  /**
   * Draw the line part (without symbols) of a curve interval.
   * @param {PaintUtil.Painter} painter
   * @param {Curve.CurveStyle} style curve style
   * @param {ScaleMap} xMap x map
   * @param {ScaleMap} yMap y map
   * @param {Number} from index of the first point to be painted
   * @param {Number} to index of the last point to be painted
   * @see {@link Curve#draw draw()}
   * @see {@link Curve#drawDots drawDots()}
   * @see {@link Curve#drawLines drawLines()}
   * @see {@link Curve#drawSteps drawSteps()}
   * @see {@link Curve#drawSticks drawSticks()}
   */
  drawCurve(painter, style, xMap, yMap, from, to) {
    switch (style) {
      case Curve.CurveStyle.Lines:
        if (this.testCurveAttribute(Curve.CurveAttribute.Fitted)) {
          // we always need the complete
          // curve for fitting
          from = 0;
          to = this.dataSize() - 1;
        }
        this.drawLines(painter, xMap, yMap, from, to);
        break;
      case Curve.CurveStyle.Sticks:
        this.drawSticks(painter, xMap, yMap, from, to);
        break;
      case Curve.CurveStyle.Steps:
        this.drawSteps(painter, xMap, yMap, from, to);
        break;
      case Curve.CurveStyle.Dots:
        this.drawDots(painter, xMap, yMap, from, to);
        break;
      case Curve.CurveStyle.NoCurve:
      default:
        break;
    }
  }

  /**
   *
   * Draw lines
   *
   * If the CurveAttribute Curve.CurveAttribute.Fitted is enabled a CurveFitter tries to interpolate/smooth the curve,
   * before it is painted.
   * @param {PaintUtil.Painter} painter Painter
   * @param {ScaleMap} xMap x map
   * @param {ScaleMap} yMap y map
   * @param {Number} from index of the first point to be painted
   * @param {Number} to index of the last point to be painted
   * @see {@link Curve#setCurveAttribute setCurveAttribute()}
   * @see {@link Curve#setCurveFitter setCurveFitter()}
   * @see {@link Curve#draw draw()}
   * @see {@link Curve#drawSticks drawSticks()}
   * @see {@link Curve#drawDots drawDots()}
   * @see {@link Curve#drawSteps drawSteps()}
   */
  drawLines(painter, xMap, yMap, from, to) {
    if (from > to) return;

    //const bool doAlign = QwtPainter::roundingAlignment( painter );
    var doFit =
      this.curveAttributes() & Curve.CurveAttribute.Fitted &&
      this.curveFitter();
    var doFill = this.brush().color !== Static.NoBrush ? true : false;
    //alert(doFill)

    //        QRectF clipRect;
    //        if ( d_data->paintAttributes & ClipPolygons )
    //        {
    //            qreal pw = qMax( qreal( 1.0 ), painter->pen().widthF());
    //            clipRect = canvasRect.adjusted(-pw, -pw, pw, pw);
    //        }

    var doIntegers = false;

    //        const bool noDuplicates = d_data->paintAttributes & Curve.PaintAttribute.FilterPoints;

    var mapper = new PointMapper();
    //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.RoundPoints, doAlign );
    //mapper.setFlag( QwtPointMapper::PointMapper.TransformationFlag.WeedOutPoints, noDuplicates );
    //mapper.setBoundingRect( canvasRect );

    //alert(443)
    var polyline = mapper.toPolygonF(xMap, yMap, this.data(), from, to);
    //console.log(486, polyline);

    if (doFit) {
      //console.log(44)
      polyline = this.curveFitter().fitCurve(polyline);
    }

    //console.log(polyline)

    painter.drawPolyline(polyline);
    if (doFill) {
      this.fillCurve(painter, xMap, yMap, polyline);
    }
  }
}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Curve.CurveStyle}</div>
 *
 * Curve styles.
 * @name Curve.CurveStyle
 * @readonly
 * @property {Number} NoCurve=-1             Don't draw a curve. Note: This doesn't affect the symbols.
 * @property {Number} Lines                  Connect the points with straight lines. The lines might be interpolated depending on the 'Fitted' attribute. Curve fitting can be configured using {@link Curve#setCurveFitter setCurveFitter()}.
 * @property {Number} Sticks                 Draw vertical or horizontal sticks ( depending on the {@link Curve#orientation orientation()} ) from a baseline which is defined by {@link Curve#setBaseline setBaseline()}.
 * @property {Number} Steps                  Connect the points with a step function. The step function is drawn from the left to the right or vice versa, depending on the {@link Curve.CurveAttribute Curve.CurveAttribute.Inverted} attribute.
 * @property {Number} Dots                   Draw dots at the locations of the data points. Note: This is different from a dotted line (see {@link Curve#setPen setPen()}).
 * @property {Number} UserCurve=100          Styles >= Curve.CurveStyle.UserCurve are reserved for derived classes of Curve that overload {@link Curve#drawCurve drawCurve()} with additional application specific curve types.
 */
Enumerator.enum(
  "CurveStyle {  NoCurve = -1 , Lines , Sticks , Steps , Dots , UserCurve = 100  }",
  Curve
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Curve.CurveAttribute}</div>
 *
 * Attribute for drawing the curve
 * @name Curve.CurveAttribute
 * @readonly
 * @property {Number} Inverted=0x01             For Curve.CurveStyle.Steps only. Draws a step function from the right to the left.
 * @property {Number} Fitted=0x02               Only in combination with Curve.CurveStyle.Lines A CurveFitter tries to interpolate/smooth the curve, before it is painted.
 */
Enumerator.enum("CurveAttribute { Inverted = 0x01 , Fitted = 0x02 }", Curve);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Curve.LegendAttribute}</div>
 *
 * Attributes how to represent the curve on the legend
 * @name Curve.LegendAttribute
 * @readonly
 * @property {Number} LegendNoAttribute=0x00             Curve tries to find a color representing the curve and paints a rectangle with it.
 * @property {Number} LegendShowLine=0x01                If the {@link Curve#style style()} is not Curve.CurveStyle.NoCurve a line is painted with the curve {@link Curve#pen pen()}.
 * @property {Number} LegendShowSymbol=0x02              If the curve has a valid symbol it is painted.
 * @property {Number} LegendShowBrush=0x04               If the curve has a brush a rectangle filled with the curve {@link Curve#brush brush()} is painted.
 */
Enumerator.enum(
  "LegendAttribute { LegendNoAttribute = 0x00 , LegendShowLine = 0x01 , LegendShowSymbol = 0x02 , LegendShowBrush = 0x04 }",
  Curve
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link ClassName.EnumName}</div>
 *
 * enum description
 * @name ClassName.EnumName
 * @readonly
 * @property {Number} flag1             This is flag 1.
 * @property {Number} flag2             This is flag 2.
 */
Enumerator.enum(
  "PaintAttribute { ClipPolygons = 0x01 , FilterPoints = 0x02 , MinimizeMemory = 0x04 , ImageBuffer = 0x08 , FilterPointsAggressive = 0x10}",
  Curve
);
