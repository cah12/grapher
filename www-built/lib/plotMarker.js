

/**
 * A class for drawing markers.
 *
 * A marker can be a horizontal line, a vertical line, a symbol, a label or any combination of them, which can be drawn
 * around a center point inside a bounding rectangle.
 *
 * The setSymbol() member assigns a symbol to the marker. The symbol is drawn at the specified point.
 *
 * With setLabel(), a label can be assigned to the marker. The setLabelAlignment() member specifies where the label is drawn.
 * All the Align*-constants in static.js are valid. The interpretation of the alignment depends on the marker's line style.
 * The alignment refers to the center point of the marker, which means, for example, that the label would be printed left above
 * the center point if the alignment was set to AlignLeft | AlignTop.
 * @extends PlotItem
 */
class PlotMarker extends PlotItem {
  /**
   *
   * @param {String} tle Title of the marker
   */
  constructor(tle) {
    super(tle);
    var m_label = "";
    var m_labelFont = new Misc.Font();
    var m_labelAlignment = Static.AlignCenter;
    var m_labelOrientation = Static.Horizontal;
    var m_spacing = 2;
    var m_pen = new Misc.Pen(); //mMakePen();
    var m_symbol = null;
    var m_style = PlotMarker.LineStyle.NoLine;
    var m_xValue = 0.0;
    var m_yValue = 0.0;

    this.rtti = PlotItem.RttiValues.Rtti_PlotMarker;

    /**
     *
     * @returns {Misc.Font} label font
     */
    this.labelFont = function () {
      return m_labelFont;
    };

    /**
     * Sets the label font
     * @param {Misc.Font} f New font
     */
    this.setLabelFont = function (f) {
      m_labelFont = f;
    };

    /**
     *
     * @returns {Misc.Pont} Value
     */
    this.value = function () {
      return new Misc.Point(m_xValue, m_yValue);
    };

    /**
     *
     * @returns {Number} x Value
     */
    this.xValue = function () {
      return m_xValue;
    };

    /**
     *
     * @returns {Number} y Value
     */
    this.yValue = function () {
      return m_yValue;
    };

    /**
     * Set Value.
     * @param {Number} x X value
     * @param {number} y Y value
     */
    this.setValue = function (x, y) {
      //console.log(x)
      if (typeof x == "object") {
        var temp = x;
        x = temp.x;
        y = temp.y;
      }
      if (x != m_xValue || y != m_yValue) {
        m_xValue = x;
        m_yValue = y;
        //itemChanged();
        if (this.plot()) this.plot().autoRefresh();
      }
    };

    //! Set X Value

    /**
     * Set X Value
     * @param {Number} x
     */
    this.setXValue = function (x) {
      this.setValue(x, m_yValue);
    };

    /**
     * Set Y Value
     * @param {Number} y
     */
    this.setYValue = function (y) {
      this.setValue(m_xValue, y);
    };

    /**
     * Set the label
     * @param {String} label Label text
     * @see {@link PlotMarker#label label()}
     */
    this.setLabel = function (label) {
      if (label != m_label) {
        m_label = label;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {String} the label
     * @see {@link PlotMarker#setLabel setLabel()}
     */
    this.label = function () {
      return m_label;
    };

    /**
     * Set the alignment of the label
     * In case of HLine the alignment is relative to the y position of the marker, but the horizontal flags correspond to the canvas rectangle. In case of QwtPlotMarker::VLine the alignment is relative to the x position of the marker, but the vertical flags correspond to the canvas rectangle. In all other styles the alignment is relative to the marker's position.
     * @param {Number} align Alignment.
     * @see {@link PlotMarker#labelAlignment labelAlignment()}
     * @see {@link PlotMarker#labelOrientation labelOrientation()}
     */
    this.setLabelAlignment = function (align) {
      if (align !== m_labelAlignment) {
        m_labelAlignment = align;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {Number} the label alignment
     * @see {@link PlotMarker#setLabelAlignment setLabelAlignment()}
     * @see {@link PlotMarker#setLabelOrientation setLabelOrientation()}
     */
    this.labelAlignment = function () {
      return m_labelAlignment;
    };

    /**
     * Set the orientation of the label
     * When orientation is Qt::Vertical the label is rotated by 90.0 degrees ( from bottom to top ).
     * @param {Number} orientation Orientation of the label
     * @see {@link PlotMarker#labelOrientation labelOrientation()}
     */
    this.setLabelOrientation = function (orientation) {
      if (orientation != m_labelOrientation) {
        m_labelOrientation = orientation;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {Number} the label orientation
     * @see {@link PlotMarker#setLabelOrientation setLabelOrientation()}
     * @see {@link PlotMarker#labelAlignment labelAlignment()}
     */
    this.labelOrientation = function () {
      return m_labelOrientation;
    };

    /**
     * Set the spacing
     * When the label is not centered on the marker position, the spacing is the distance between the position and the label.
     * @param {Number} spacing Spacing
     * @see {@link PlotMarker#spacing spacing()}
     * @see {@link PlotMarker#setLabelAlignment setLabelAlignment()}
     */
    this.setSpacing = function (spacing) {
      if (spacing < 0) spacing = 0;

      if (spacing == m_spacing) return;

      m_spacing = spacing;
      //itemChanged();
    };

    /**
     *
     * @returns {Number} the spacing
     * @see {@link PlotMarker#setSpacing setSpacing()}
     */
    this.spacing = function () {
      return m_spacing;
    };

    /**
     * Assign a symbol
     * @param {Symbol} symbol New symbol
     * @see {@link PlotMarker#symbol symbol()}
     */
    this.setSymbol = function (symbol) {
      m_symbol = symbol;
    };

    /**
     *
     * @returns {Symbol} the symbol
     */
    this.symbol = function () {
      return m_symbol;
    };

    /**
     * Draw the marker
     * @param {ScaleMap} xMap x Scale Map
     * @param {ScaleMap} yMap y Scale Map
     */
    this.draw = function (xMap, yMap) {
      var canvasRect = this.getCanvasRect();
      //$("#demo").text(mRectToString(canvasRect))
      var pos = new Misc.Point(
        xMap.transform(m_xValue),
        yMap.transform(m_yValue)
      );

      var ctx = this.getContext();

      // draw lines
      this.drawLines(ctx, canvasRect, pos);

      // draw symbol
      //console.log(m_symbol.style())
      if (m_symbol && m_symbol.style() !== Symbol2.Style.NoSymbol) {
        var sz = m_symbol.size();
        var clipRect = canvasRect.adjusted(
          -sz.width,
          -sz.height,
          sz.width,
          sz.height
        );
        if (clipRect.contains(pos)) {
          m_symbol.drawSymbol(ctx, pos);
        }
      }

      this.drawLabel(ctx, canvasRect, pos);
    };

    /**
     * Align and draw the text label of the marker
     * @param {object} ctx Paint context
     * @param {Misc.Rect} canvasRect Contents rectangle of the canvas in painter coordinates
     * @param {Misc.Point} pos Position of the marker, translated into widget coordinates
     *
     */
    this.drawLabel = function (ctx, canvasRect, pos) {
      if (m_label === "") return;

      var align = m_labelAlignment;
      var alignPos = pos;

      var symbolOff = new Misc.Size(0, 0);
      //var canvasRect = this.getCanvasRect();

      //var ctx = this.getContext();

      switch (m_style) {
        case PlotMarker.LineStyle.VLine: {
          // In VLine-style the y-position is pointless and
          // the alignment flags are relative to the canvas

          if (m_labelAlignment & Static.AlignTop) {
            alignPos.y = canvasRect.top();
            align &= ~Static.AlignTop;
            align |= Static.AlignBottom;
          } else if (m_labelAlignment & Static.AlignBottom) {
            // In HLine-style the x-position is pointless and
            // the alignment flags are relative to the canvas

            alignPos.y = canvasRect.bottom() - 1;
            align &= ~Static.AlignBottom;
            align |= Static.AlignTop;
          } else {
            alignPos.y = canvasRect.center().y;
          }
          break;
        }
        case PlotMarker.LineStyle.HLine: {
          if (m_labelAlignment & Static.AlignLeft) {
            alignPos.x = canvasRect.left();
            align &= ~Static.AlignLeft;
            align |= Static.AlignRight;
          } else if (m_labelAlignment & Static.AlignRight) {
            alignPos.x = canvasRect.right() - 1;
            align &= ~Static.AlignRight;
            align |= Static.AlignLeft;
          } else {
            alignPos.x = canvasRect.center().x;
          }
          break;
        }
        default: {
          if (m_symbol && m_symbol.style() !== Symbol2.Style.NoSymbol) {
            var sz = m_symbol.size();
            symbolOff = new Misc.Size((sz.width + 1) / 2, (sz.height + 1) / 2);
            //symbolOff /= 2;
          }
        }
      }

      var pw2 = m_pen.width / 2.0;
      if (pw2 == 0.0) pw2 = 0.5;

      var spacing = m_spacing;

      var xOff = Math.max(pw2, symbolOff.width);
      var yOff = Math.max(pw2, symbolOff.height);

      var textSize = m_labelFont.textSize(m_label);

      if (align & Static.AlignLeft) {
        alignPos.x -= xOff + spacing;
        if (m_labelOrientation == Static.Vertical)
          alignPos.x -= textSize.height;
        else alignPos.x -= textSize.width;
      } else if (align & Static.AlignRight) {
        alignPos.x += xOff + spacing;
        //>>>>>>>>>>>>Added>>>>>>>>>>>>>>>>>>>>>
        if (m_labelOrientation == Static.Vertical)
          alignPos.x += textSize.height;
        /*else
                    alignPos.x += textSize.width; */
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      } else {
        if (m_labelOrientation == Static.Vertical)
          alignPos.x -= textSize.height / 2;
        else alignPos.x -= textSize.width / 2;
      }

      if (align & Static.AlignTop) {
        alignPos.y -= yOff + spacing;
        if (m_labelOrientation != Static.Vertical)
          alignPos.y -= textSize.height;
      } else if (align & Static.AlignBottom) {
        alignPos.y += yOff + spacing;
        if (m_labelOrientation == Static.Vertical) alignPos.y += textSize.width;
      } else {
        if (m_labelOrientation == Static.Vertical)
          alignPos.y += textSize.width / 2;
        else alignPos.y -= textSize.height / 2;
      }

      var painter = new PaintUtil.Painter(ctx);
      //painter.save();
      painter.translate(alignPos.x, alignPos.y);
      //if ( m_labelOrientation == Static.Vertical )
      //painter.rotate( -90*Math.PI/180 );
      painter.setFont(m_labelFont);
      var textRect = new Misc.Rect(0, 0, textSize.width, textSize.height);
      if (m_labelOrientation == Static.Vertical)
        painter.drawVerticalText(
          m_label,
          textRect.left() + textSize.height * 0.3,
          textRect.bottom() - textSize.width * 0.75
        );
      else painter.drawText(m_label, textRect.left(), textRect.bottom() - 2);
      //painter.restore();

      //painter = null
    }; //this.drawVerticalText = function(txt, tx, ty, topDown)

    /**
     * Draw the lines marker
     * @param {object} ctx Paint context
     * @param {Misc.Rect} canvasRect Contents rectangle of the canvas in painter coordinates
     * @param {Misc.Point} pos Position of the marker, translated into widget coordinates
     * @see {@link PlotMarker#drawLabel drawLabel()}
     * @see {@link Symbol#drawSymbol drawSymbol()}
     */
    this.drawLines = function (ctx, canvasRect, pos) {
      if (m_style == PlotMarker.LineStyle.NoLine) return;

      //var doAlign = QwtPainter::roundingAlignment( painter );

      var painter = new PaintUtil.Painter(ctx);
      painter.setPen(m_pen);

      if (
        m_style == PlotMarker.LineStyle.HLine ||
        m_style == PlotMarker.LineStyle.Cross
      ) {
        var y = pos.y;
        //if ( doAlign )
        //y = qRound( y );

        painter.drawLine(canvasRect.left(), y, canvasRect.right() - 1.0, y);
      }
      if (
        m_style == PlotMarker.LineStyle.VLine ||
        m_style == PlotMarker.LineStyle.Cross
      ) {
        var x = pos.x;
        //if ( doAlign )
        //x = qRound( x );

        painter.drawLine(x, canvasRect.top(), x, canvasRect.bottom() - 1.0);
      }
      painter = null;
    };

    /**
     * Set the line style
     * @param {PlotMarker.LineStyle} style Line style.
     * @see {@link PlotMarker#lineStyle lineStyle()}
     */
    this.setLineStyle = function (style) {
      if (style != m_style) {
        m_style = style;

        // legendChanged();
        // itemChanged();
      }
    };

    /**
     *
     * @returns {PlotMarker.LineStyle} the line style
     * @see {@link PlotMarker#setLineStyle setLineStyle()}
     */
    this.lineStyle = function () {
      return m_style;
    };

    /**
     * Specify a pen for the line.
     * @param {Misc.Pen} pen New pen
     * @see {@link PlotMarker#linePen linePen()}
     */
    this.setLinePen = function (pen) {
      // if ( pen != m_pen )
      //{
      m_pen = pen;
      if (this.plot()) this.plot().autoRefresh();

      // legendChanged();
      //itemChanged();
      //}
    };

    /**
     *
     * @returns {Misc.Pen} the line pen
     * @see {@link PlotMarker#setLinePen setLinePen()}
     */
    this.linePen = function () {
      return m_pen;
    };

    this.setZ(1000.0);

    /**
     *
     * @returns {String} Returns a string representing the object.
     */
    this.toString = function () {
      return "[PlotMarker]";
    };

    /**
     *
     * @param {Number} index Index of the legend entry
     * @param {Misc.Size} size Icon size
     * @returns {Graphic} Icon representing the marker on the legend
     * @see {@link PlotMarker#setLegendIconSize setLegendIconSize()}
     * @see {@link PlotMarker#legendData legendData()}
     */
    this.legendIcon = function (index, size) {
      if (size.width === 0 && size.height === 0) return null;

      var graphic = new Graphic(null, size.width, size.height);

      var painter = new PaintUtil.Painter(graphic);

      if (m_style !== PlotMarker.LineStyle.NoLine) {
        painter.setPen(this.linePen());

        if (
          m_style == PlotMarker.LineStyle.HLine ||
          m_style == PlotMarker.LineStyle.Cross
        ) {
          let y = 0.5 * size.height;
          painter.drawLine(0.0, y, size.width, y);
        }

        if (
          m_style == PlotMarker.LineStyle.VLine ||
          m_style == PlotMarker.LineStyle.Cross
        ) {
          let x = 0.5 * size.width;
          painter.drawLine(x, 0.0, x, size.height);
        }
      }

      if (this.symbol()) {
        let sh = size.height / 2; // + 1;
        if (this.symbol().style() == Symbol2.Style.Ellipse) sh -= 1;
        painter.setPen(this.symbol().pen());
        this.symbol().drawGraphicSymbol(
          painter,
          new Misc.Point(size.width / 2, sh),
          size
        );
      }

      painter = null;
      return graphic;
    };

    /*!
        \return Icon representing the marker on the legend
        \param index Index of the legend entry 
                        ( usually there is only one )
        \param size Icon size
        \sa setLegendIconSize(), legendData()
        */
    /* QwtGraphic QwtPlotMarker::legendIcon( int index,
            const QSizeF &size ) const
        {
            Q_UNUSED( index );

            if ( size.isEmpty() )
                return QwtGraphic();

            QwtGraphic icon;
            icon.setDefaultSize( size );
            icon.setRenderHint( QwtGraphic::RenderPensUnscaled, true );

            QPainter painter( &icon );
            painter.setRenderHint( QPainter::Antialiasing,
                testRenderHint( QwtPlotItem::RenderAntialiased ) );

            if ( d_data->style != QwtPlotMarker::PlotMarker.LineStyle.NoLine )
            {
                painter.setPen( d_data->pen );

                if ( d_data->style == QwtPlotMarker::HLine ||
                    d_data->style == QwtPlotMarker::Cross )
                {
                    const double y = 0.5 * size.height();

                    QwtPainter::drawLine( &painter, 
                        0.0, y, size.width(), y );
                }

                if ( d_data->style == QwtPlotMarker::VLine ||
                    d_data->style == QwtPlotMarker::Cross )
                {
                    const double x = 0.5 * size.width();

                    QwtPainter::drawLine( &painter, 
                        x, 0.0, x, size.height() );
                }
            }

            if ( d_data->symbol )
            {
                const QRect r( 0.0, 0.0, size.width(), size.height() );
                d_data->symbol->drawSymbol( &painter, r );
            }

            return icon;
        }  */
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PlotMarker.LineStyle}</div>
 *
 * Line styles.
 * @name PlotMarker.LineStyle
 * @readonly
 * @property {Number} NoLine            No line.
 * @property {Number} HLine             A horizontal line.
 * @property {Number} VLine             A vertical line.
 * @property {Number} Cross             A crosshair.
 */
Enumerator.enum("LineStyle { NoLine , HLine , VLine , Cross }", PlotMarker);
