"use strict";

/**
 * A class for drawing symbols.
 */
class Symbol2 {
  /**
   * If no arguments are passed to the constructor, the symbol is constructed with gray interior,
   * black outline with zero width, no size and style 'NoSymbol'. See example.
   * @param {Symbol2.Style} [style] Style
   * @param {Misc.Brush} [brush] Brush (Only valid if a stye is passed)
   * @param {Misc.Pen} [pen] Pen (Only valid if a stye and brush is passed)
   * @param {Misc.Size} [size] Size (Only valid if a stye, brush and pen is passed)
   *
   * @example
   * new Symbol2(); //Default construction
   * new Symbol2(style);
   * new Symbol2(style, brush);
   * new Symbol2(style, brush, pen);
   * new Symbol2(style, brush, pen, size);
   */
  constructor(style, brush, pen, size) {
    //<<<<<<<<<<<<< Helpers >>>>>>>>>>>>>>>>>>//
    function mDrawXCrossSymbols(ctx, points, symbol) {
      var size = symbol.size();
      var pen = symbol.pen();
      var brush = symbol.brush();
      var sw = size.width;
      var sh = size.height;
      ctx.beginPath();
      ctx.strokeStyle = pen.color;
      ctx.lineWidth = pen.width;

      for (var i = 0; i < points.length; i++) {
        var x = points[i].x - 0.5 * sw - 1; //pen.width*0.5;
        var y = points[i].y - 0.5 * sh - 1; //pen.width*0.5;

        ctx.moveTo(x, y);
        ctx.lineTo(x + sw, y + sh);
        ctx.moveTo(x + sw, y);
        ctx.lineTo(x, y + sh);
      }
      ctx.stroke();
    }

    function mDrawLineSymbols(ctx, orientations, points, symbol) {
      var size = symbol.size();
      var pen = symbol.pen();
      var brush = symbol.brush();
      var sw = size.width;
      var sh = size.height;
      var painter = new PaintUtil.Painter(ctx);
      painter.setPen(pen);

      painter.save();

      for (var i = 0; i < points.length; i++) {
        if (orientations & Static.Horizontal) {
          var x = points[i].x - 0.5 * sw - 1; //- pen.width*0.5;
          var y = points[i].y - 1; //- pen.width*0.5;
          painter.drawLine(x, y, x + sw, y);
        }
        if (orientations & Static.Vertical) {
          var x = points[i].x - 1; //- pen.width*0.5;
          var y = points[i].y - 0.5 * sh - 1; //- pen.width*0.5;

          painter.drawLine(x, y, x, y + sh);
        }
      }
      painter.restore();
      painter = null;
    }

    function mDrawPathSymbols(ctx, points, symbol) {
      var numPoints = points.length;
      var size = symbol.size();
      var pen = symbol.pen();
      var brush = symbol.brush();
      var sw = size.width;
      var sh = size.height;
      var painter = new PaintUtil.Painter(ctx);
      painter.setPen(pen);
      painter.setBrush(brush);

      for (var i = 0; i < numPoints; i++) {
        var x = points[i].x;
        var y = points[i].y;
        var bRc = symbol.m_path.boundingRect();
        painter.save();
        painter.translate(x, y);
        //painter.scale(sw/bRc.width(), sh/bRc.height());
        symbol.m_path.data.scale = Math.min(
          size.width / bRc.width(),
          size.height / bRc.height()
        );

        if (symbol.m_path.data.rotation) {
          painter.rotate(symbol.m_path.data.rotation);
        }
        var pinpoint = symbol.pinPoint();
        //console.log(sw/bRc.width())
        painter.translate(-1 * pinpoint.x, -1 * pinpoint.y);
        //painter.scale(sw/bRc.width(), sh/bRc.height())
        painter.drawPath(symbol.m_path);
        painter.restore();
      }
      painter = null;
    }

    function mDrawDiamondSymbols(ctx, points, symbol) {
      var painter = new PaintUtil.Painter(ctx);
      painter.save();
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());
      var sz = symbol.size();
      var rc = new Misc.Rect(new Misc.Point(), symbol.size());
      var numPoints = points.length;

      for (var i = 0; i < numPoints; i++) {
        painter.save();
        painter.translate(points[i].x - 1, points[i].y - 1);
        painter.rotate(45);
        painter.drawRect(
          -0.5 * sz.width,
          -0.5 * sz.height,
          sz.width,
          sz.height
        );
        painter.restore();
      }
      painter.restore();
      painter = null;
    }

    function mDrawRectSymbols(ctx, points, symbol) {
      var painter = new PaintUtil.Painter(ctx);
      painter.save();
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());
      var rc = new Misc.Rect(new Misc.Point(), symbol.size());
      var numPoints = points.length;

      for (var i = 0; i < numPoints; i++) {
        rc.moveCenter(points[i]);
        //painter.drawRect(rc.left()-0.5*symbol.pen().width, rc.top()-0.5*symbol.pen().width, rc.width(), rc.height());
        painter.drawRect(rc.left(), rc.top(), rc.width(), rc.height());
      }
      painter.restore();
      painter = null;
    }

    function mDrawEllipseSymbols(ctx, points, symbol) {
      var painter = new PaintUtil.Painter(ctx);
      painter.save();
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());
      var radius = Math.min(symbol.size().width, symbol.size().height) / 2;
      var numPoints = points.length;

      for (var i = 0; i < numPoints; i++) {
        //painter.drawCircle(points[i].x-0.5*symbol.pen().width, points[i].y-0.5*symbol.pen().width, radius);
        painter.drawCircle(points[i].x - 1, points[i].y - 1, radius);
      }
      painter.restore();
      painter = null;
    }

    function mDrawCrossGraphicSymbol(painter, point, size, symbol) {
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());
      var rc = new Misc.Rect(new Misc.Point(), symbol.size());
      rc.moveCenter(point);
      painter.drawLine(
        rc.left() + 0.5 * rc.width(),
        rc.top(),
        rc.left() + 0.5 * rc.width(),
        rc.bottom()
      );
      painter.drawLine(
        rc.left(),
        rc.top() + 0.5 * rc.height(),
        rc.right(),
        rc.top() + 0.5 * rc.height()
      );
    }

    function mDrawXCrossGraphicSymbol(painter, point, size, symbol) {
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());
      var rc = new Misc.Rect(new Misc.Point(), symbol.size());
      rc.moveCenter(point);
      painter.drawLine(rc.left(), rc.top(), rc.right(), rc.bottom());
      painter.drawLine(rc.right(), rc.top(), rc.left(), rc.bottom());
    }

    function mDrawRectGraphicSymbol(painter, point, size, symbol) {
      //console.log(symbol.brush().color)
      painter.setBrush(symbol.brush());
      //var p = new Misc.Pen(symbol.pen())
      //if(symbol.brush1()) //allow the brush to go to the center line of the pen. This is consistent with symbol on curve.
      //p.width /= 2;
      //painter.setPen( p)//symbol.pen() );
      var rc = new Misc.Rect(new Misc.Point(), symbol.size());
      rc.moveCenter(point);
      painter.drawRect(rc.left(), rc.top(), rc.width(), rc.height());
    }

    function mDrawDiamondGraphicSymbol(painter, point, size, symbol) {
      painter.setBrush(symbol.brush());
      //painter.setPen( symbol.pen() );
      var rc = new Misc.Rect(
        new Misc.Point(),
        symbol.size().width * 0.707,
        symbol.size().height * 0.707
      );
      rc.moveCenter(point);
      painter.drawRect(rc.left(), rc.top(), rc.width(), rc.height());
      painter.transform({
        rotation: 45,
        rotationX: point.x,
        rotationY: point.y,
      });
    }

    function mDrawEllipseGraphicSymbol(painter, point, size, symbol) {
      painter.setBrush(symbol.brush());
      //painter.setPen( symbol.pen() );
      var radius =
        Math.min(
          symbol.size().width - symbol.pen().width,
          symbol.size().height - symbol.pen().width
        ) / 2; //- symbol.pen().width
      painter.drawCircle(point.x, point.y, radius);
    }

    function mDrawPathGraphicSymbol(painter, point, iconSize, symbol) {
      var pen = symbol.pen();
      var pw = 0.0;
      if (pen.style !== Static.NoPen) pw = Math.max(pen.width, 1.0);
      var rc = symbol.path().boundingRect();
      rc = rc.adjusted(-pw, -pw, pw, pw);
      var data = symbol.path().data;
      data.xOffset = -1 * rc.left();
      data.yOffset = -1 * rc.top();
      data.xCenter = (rc.right() - rc.left()) / 2;
      data.yCenter = (rc.bottom() - rc.top()) / 2;
      painter.setBrush(symbol.brush());
      painter.setPen(symbol.pen());

      //painter.scale(iconSize.width/rc.width(), iconSize.height/rc.height())
      data.scale = Math.min(
        iconSize.width / rc.width(),
        iconSize.height / rc.height()
      );

      //symbol.path().data = data
      painter.drawPath(symbol.path());
    }

    //super()
    var m_style = Symbol2.Style.NoSymbol;
    var m_size = new Misc.Size(-1, -1); //{width:-1, height: -1};//invalid size
    //var m_size = new Misc.Size(10, 10);//default size
    var m_brush = new Misc.Brush("gray");
    var m_pen = new Misc.Pen(); //{color:"black", width:1, style:"solid"};
    var m_isPinPointEnabled = false;
    this.m_path = 0;

    var m_pinpoint = new Misc.Point(0, 0);

    if (typeof size !== "undefined") {
      m_style = style;
      m_brush = brush;
      m_pen = pen;
      m_size = size;
    } else if (typeof pen !== "undefined") {
      m_style = style;
      m_brush = brush;
      m_pen = pen;
    } else if (typeof brush !== "undefined") {
      m_style = style;
      m_brush = brush;
    } else if (typeof style !== "undefined") {
      m_style = style;
    }

    /**
     * Set a pin point.
     *
     * The position of a complex symbol is not always aligned to its center ( e.g. an arrow, where the peak points to a position ).
     * The pin point defines the position inside of a Pixmap, Graphic, SvgDocument or PainterPath symbol where the represented
     * point has to be aligned to.
     * @param {Misc.Point} pt Pin point
     */
    this.setPinPoint = function (pt) {
      m_pinpoint = pt;
    };

    /**
     *
     * @returns {Misc.Point} pt Pin point
     */
    this.pinPoint = function () {
      return m_pinpoint;
    };

    /**
     * Set the symbol's size
     * @param {Misc.Size} size New size
     */
    this.setSize = function (size) {
      if (size.isValid() && !size.isEqual(m_size)) {
        m_size = size;
        //invalidateCache();
      }
    };

    /**
     *
     * @returns {Misc.Size} Size
     */
    this.size = function () {
      return m_size;
    };

    /**
     * Specify the symbol style
     * @param {Symbol2.Style} style Style
     * @see {@link Symbol2#style style()}
     */
    this.setStyle = function (style) {
      if (m_style != style) {
        m_style = style;
        //invalidateCache();
      }
    };

    /**
     *
     * @returns {Symbol2.Style} Current symbol style
     * @see {@link Symbol2#setStyle setStyle()}
     */
    this.style = function () {
      return m_style;
    };

    /**
     * Set a painter path as symbol
     *
     * The symbol is represented by a painter path, where the origin ( 0, 0 ) of the path coordinate system is
     * mapped to the position of the symbol.
     * When the symbol has valid size the painter path gets scaled to fit into the size. Otherwise the symbol
     * size depends on the bounding rectangle of the path.
     *
     * The style is implicitely set to {@link Symbol2.Style}.
     * @param {Misc.MPath} path Path
     * @see {@link Symbol2#path path()}
     * @see {@link Symbol2#setSize setSize()}
     */
    this.setPath = function (path) {
      m_style = Symbol2.Style.Path;
      // d_data->path.path = path;
      // d_data->path.graphic.reset();
      this.m_path = path;
    };

    /**
     *
     * @returns {Misc.MPath} Painter path for displaying the symbol
     * @see {@link Symbol2#setPath setPath()}
     */
    this.path = function () {
      return this.m_path;
    };

    /**
     * Build and assign a pen
     * @param {Misc.Pen} pen Pen
     * @see {@link Symbol2#pen pen()}
     * @see {@link Symbol2#brush brush()}
     */
    this.setPen = function (pen) {
      //if ( brush != m_brush )
      {
        m_pen = pen;
      }
    };

    /**
     *
     * @returns {Misc.Pen} Pen
     * @see {@link Symbol2#setPen setPen()}
     * @see {@link Symbol2#brush brush()}
     */
    this.pen = function () {
      return m_pen;
    };

    /**
     * Assign a brush
     *
     * The brush is used to draw the interior of the symbol.
     * @param {Misc.Brush} brush Brush
     * @see {@link Symbol2#brush brush()}
     */
    this.setBrush = function (brush) {
      // if ( brush != m_brush )
      {
        m_brush = brush;
        //invalidateCache();

        if (m_style == Symbol2.Style.Path); //d_data->path.graphic.reset();
      }
    };

    /**
     *
     * @returns {Misc.Brush} Brush
     * @see {@link Symbol2#setBrush setBrush()}
     */
    this.brush = function () {
      return m_brush;
    };

    //Internal use only
    this.brush1 = function () {
      return m_brush.color !== "noBrush";
    };

    /**
     * Render an array of symbols
     *
     * Painting several symbols is more effective than drawing symbols one by one, as a couple of layout calculations
     * and setting of pen/brush can be done once for the complete array.
     * @param {object} ctx 2d context for the central div canvas
     * @param {Array<Misc.Point>} points Array of points
     */
    this.drawSymbols = function (ctx, points) {
      if (points.length <= 0) return;

      var useCache = false;

      //alert("drawSymbols: here")

      // Don't use the pixmap, when the paint device
      // could generate scalable vectors

      //        if ( QwtPainter::roundingAlignment( painter ) &&  !painter->transform().isScaling() )
      //        {
      //            if ( d_data->cache.policy == QwtSymbol::Cache )
      //            {
      //                useCache = true;
      //            }
      //            else if ( d_data->cache.policy == QwtSymbol::AutoCache )
      //            {
      //                if ( painter->paintEngine()->type() == QPaintEngine::Raster )
      //                {
      //                    useCache = true;
      //                }
      //                else
      //                {
      //                    switch( d_data->style )
      //                    {
      //                        case QwtSymbol::XCross:
      //                        case QwtSymbol::HLine:
      //                        case QwtSymbol::VLine:
      //                        case QwtSymbol::Cross:
      //                            break;

      //                        case QwtSymbol::Pixmap:
      //                        {
      //                            if ( !d_data->size.isEmpty() &&
      //                                d_data->size != d_data->pixmap.pixmap.size() )
      //                            {
      //                                useCache = true;
      //                            }
      //                            break;
      //                        }
      //                        default:
      //                            useCache = true;
      //                    }
      //                }
      //            }
      //        }

      if (useCache) {
        //var br = this.boundingRect();/////////////////////

        //var rect = {left:0, top:0, width:br.width(), height:br.height() };

        //            if ( d_data->cache.pixmap.isNull() )
        //            {
        //                d_data->cache.pixmap = QwtPainter::backingStore( NULL, br.size() );
        //                d_data->cache.pixmap.fill( Qt::transparent );

        //                QPainter p( &d_data->cache.pixmap );
        //                p.setRenderHints( painter->renderHints() );
        //                p.translate( -br.top()Left() );

        //                const QPointF pos;
        //                renderSymbols( &p, &pos, 1 );
        //            }

        var dx = br.left();
        var dy = br.top();

        for (var i = 0; i < numPoints; i++) {
          var left = Math.round(points[i].x) + dx;
          var top = Math.round(points[i].y) + dy;

          //painter->drawPixmap( left, top, d_data->cache.pixmap );
        }
      } else {
        //painter->save();

        this.renderSymbols(ctx, points);
        //painter->restore();
      }
    };

    /**
     * Draw a graphic symbol to the specified size at the specified position.
     * @param {PaintUtil.Painter} painter Painter
     * @param {Misc.Point} pos Position of the symbol in screen coordinates
     * @param {Misc.Size} size Size of the symbol in screen coordinates
     */
    this.drawGraphicSymbol = function (painter, pos, size) {
      this.renderGraphicSymbol(painter, pos, size);
    };

    /**
     * Draw the symbol at a specified position.
     * @param {object} ctx 2d context for the central div canvas
     * @param {Misc.Point} pos Position of the symbol in screen coordinates
     */
    this.drawSymbol = function (ctx, pos) {
      this.drawSymbols(ctx, [pos]);
    };

    /**
     * Render the symbol to series of points
     * @param {object} ctx 2d context for the central div canvas
     * @param {Array<Misc.Point>} points Positions of the symbols
     */
    this.renderSymbols = function (ctx, points) {
      var numPoints = points.length;

      switch (m_style) {
        case Symbol2.Style.Ellipse: {
          mDrawEllipseSymbols(ctx, points, this);
          break;
        }
        case Symbol2.Style.MRect: {
          mDrawRectSymbols(ctx, points, this);
          break;
        }
        case Symbol2.Style.Diamond: {
          mDrawDiamondSymbols(ctx, points, this);
          break;
        }
        case Symbol2.Style.Cross: {
          mDrawLineSymbols(
            ctx,
            Static.Horizontal | Static.Vertical,
            points,
            this
          );
          break;
        }
        case Symbol2.Style.XCross: {
          mDrawXCrossSymbols(ctx, points, this);
          break;
        }
        //            case QwtSymbol::Triangle:
        //            case QwtSymbol::UTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Up,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::DTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Down,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::RTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Right,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::LTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Left,
        //                    points, numPoints, *this );
        //                break;
        //            }
        case Symbol2.Style.HLine: {
          mDrawLineSymbols(ctx, Static.Horizontal, points, this);
          break;
        }
        case Symbol2.Style.VLine: {
          mDrawLineSymbols(ctx, Static.Vertical, points, this);
          break;
        }
        //            case QwtSymbol::Star1:
        //            {
        //                qwtDrawStar1Symbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Star2:
        //            {
        //                qwtDrawStar2Symbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Hexagon:
        //            {
        //                qwtDrawHexagonSymbols( painter, points, numPoints, *this );
        //                break;
        //            }
        case Symbol2.Style.Path: {
          // if ( d_data->path.graphic.isNull() )
          // {
          //     d_data->path.graphic = qwtPathGraphic( d_data->path.path,
          //         d_data->pen, d_data->brush );
          // }

          // qwtDrawGraphicSymbols( painter, points, numPoints,
          //     d_data->path.graphic, *this );
          mDrawPathSymbols(ctx, points, this);
          break;
        }
        //            case QwtSymbol::Pixmap:
        //            {
        //                qwtDrawPixmapSymbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Graphic:
        //            {
        //                qwtDrawGraphicSymbols( painter, points, numPoints,
        //                    d_data->graphic.graphic, *this );
        //                break;
        //            }
        //            case QwtSymbol::SvgDocument:
        //            {
        //    #ifndef QWT_NO_SVG
        //                qwtDrawSvgSymbols( painter, points, numPoints,
        //                    d_data->svg.renderer, *this );
        //    #endif
        //                break;
        //            }
        default:
      }
    };

    //Helper
    this.renderGraphicSymbol = function (painter, point, size) {
      if (m_style !== Symbol2.Style.Cross || m_style !== Symbol2.Style.XCross) {
        var p = new Misc.Pen(this.pen());
        if (this.brush1())
          //allow the brush to go to the center line of the pen. This is consistent with symbol on curve.
          p.width /= 2;
        painter.setPen(p); //symbol.pen() );
      }

      switch (m_style) {
        case Symbol2.Style.Ellipse: {
          // mDrawEllipseSymbols(ctx, points, this );
          mDrawEllipseGraphicSymbol(painter, point, 0, this);
          break;
        }
        case Symbol2.Style.MRect: {
          mDrawRectGraphicSymbol(painter, point, 0, this);
          break;
        }
        case Symbol2.Style.Diamond: {
          //mDrawDiamondSymbols(ctx, points, this );
          mDrawDiamondGraphicSymbol(painter, point, 0, this);
          break;
        }
        case Symbol2.Style.Cross: {
          mDrawCrossGraphicSymbol(painter, point, 0, this);
          break;
        }
        case Symbol2.Style.XCross: {
          //mDrawXCrossSymbols(ctx, points, this );
          mDrawXCrossGraphicSymbol(painter, point, 0, this);
          break;
        }
        //            case QwtSymbol::Triangle:
        //            case QwtSymbol::UTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Up,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::DTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Down,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::RTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Right,
        //                    points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::LTriangle:
        //            {
        //                qwtDrawTriangleSymbols( painter, QwtTriangle::Left,
        //                    points, numPoints, *this );
        //                break;
        //            }
        case Symbol2.Style.HLine: {
          //mDrawLineSymbols( ctx, Horizontal, points, this );
          break;
        }
        case Symbol2.Style.VLine: {
          //mDrawLineSymbols( ctx, Vertical, points, this );
          break;
        }
        //            case QwtSymbol::Star1:
        //            {
        //                qwtDrawStar1Symbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Star2:
        //            {
        //                qwtDrawStar2Symbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Hexagon:
        //            {
        //                qwtDrawHexagonSymbols( painter, points, numPoints, *this );
        //                break;
        //            }
        case Symbol2.Style.Path: {
          //console.log(44)
          /*if ( d_data->path.graphic.isNull() )
                        {
                            d_data->path.graphic = qwtPathGraphic( d_data->path.path,
                                d_data->pen, d_data->brush );
                        }
         
                        qwtDrawGraphicSymbols( painter, points, numPoints,
                            d_data->path.graphic, *this );*/
          //mDrawRectGraphicSymbol(painter, point, size, this );
          mDrawPathGraphicSymbol(painter, point, size, this);
          break;
        }
        //            case QwtSymbol::Pixmap:
        //            {
        //                qwtDrawPixmapSymbols( painter, points, numPoints, *this );
        //                break;
        //            }
        //            case QwtSymbol::Graphic:
        //            {
        //                qwtDrawGraphicSymbols( painter, points, numPoints,
        //                    d_data->graphic.graphic, *this );
        //                break;
        //            }
        //            case QwtSymbol::SvgDocument:
        //            {
        //    #ifndef QWT_NO_SVG
        //                qwtDrawSvgSymbols( painter, points, numPoints,
        //                    d_data->svg.renderer, *this );
        //    #endif
        //                break;
        //            }
        default:
      }
    };

    /**
     * Calculates the bounding rectangle for a symbol
     * @returns {Misc.Rect} Bounding rectangle
     */
    this.boundingRect = function () {
      var rect = new Misc.Rect();

      switch (m_style) {
        case Symbol2.Style.Ellipse:
        case Symbol2.Style.MRect:
        case Symbol2.Style.Hexagon: {
          var pw = 0.0;
          if (m_pen.style != Static.NoPen) pw = Math.max(m_pen.width, 1.0);

          rect = new Misc.Rect(
            new Misc.Point(),
            m_size.width + pw,
            m_size.height + pw
          );
          rect.moveCenter(new Misc.Point());

          break;
        }
        case Symbol2.Style.XCross:
        case Symbol2.Style.Diamond:
        case Symbol2.Style.Triangle:
        case Symbol2.Style.UTriangle:
        case Symbol2.Style.DTriangle:
        case Symbol2.Style.RTriangle:
        case Symbol2.Style.LTriangle:
        case Symbol2.Style.Star1:
        case Symbol2.Style.Star2: {
          var pw = 0.0;
          if (m_pen.style !== Static.NoPen) pw = Math.max(m_pen.width, 1.0);

          rect = new Misc.Rect(
            new Misc.Point(),
            m_size.width + pw,
            m_size.height + pw
          );
          rect.moveCenter(new Misc.Point());
          break;
        }
        case Symbol2.Style.Path: {
          rect = m_path.boundingRect();
          console.log(rect.width());
          rect.moveCenter(new Misc.Point());

          break;
        }
        //            case QwtSymbol::Pixmap:
        //            {
        //                if ( d_data->size.isEmpty() )
        //                    rect.setSize( d_data->pixmap.pixmap.size() );
        //                else
        //                    rect.setSize( d_data->size );

        //                rect.moveCenter( QPointF( 0.0, 0.0 ) );

        //                // pinpoint ???
        //                break;
        //            }
        //            case QwtSymbol::Graphic:
        //            {
        //                rect = qwtScaledBoundingRect(
        //                    d_data->graphic.graphic, d_data->size );

        //                break;
        //            }
        //    #ifndef QWT_NO_SVG
        //            case QwtSymbol::SvgDocument:
        //            {
        //                if ( d_data->svg.renderer )
        //                    rect = d_data->svg.renderer->viewBoxF();

        //                if ( d_data->size.isValid() && !rect.isEmpty() )
        //                {
        //                    QSizeF sz = rect.size();

        //                    const double sx = d_data->size.width() / sz.width();
        //                    const double sy = d_data->size.height() / sz.height();

        //                    QTransform transform;
        //                    transform.scale( sx, sy );

        //                    rect = transform.mapRect( rect );
        //                }
        //                break;
        //            }
        //    #endif
        default: {
          rect = new Misc.Rect(new Misc.Point(), m_size.width, m_size.height);
          rect.moveCenter(new Misc.Point());
        }
      }

      //        if ( d_data->style == QwtSymbol::Graphic ||
      //            d_data->style == QwtSymbol::SvgDocument || d_data->style == QwtSymbol::Path )
      //        {
      //            QPointF pinPoint( 0.0, 0.0 );
      //            if ( d_data->isPinPointEnabled )
      //                pinPoint = rect.center() - d_data->pinPoint;

      //            rect.moveCenter( pinPoint );
      //        }

      var r = new Misc.Rect();
      r.setLeft(Math.floor(rect.left()));
      r.setTop(Math.floor(rect.top()));
      r.setRight(Math.ceil(rect.right()));
      r.setBottom(Math.ceil(rect.bottom()));

      //if ( m_style != Pixmap )
      //r.adjust( -1, -1, 1, 1 ); // for antialiasing

      return r;
    };
  }

  /**
   *
   * @returns {String} A string representing the object. .
   */
  toString() {
    return "[Symbol2]";
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Symbol2.Style}</div>
 *
 * Symbol Style
 * @name Symbol2.Style
 * @readonly
 * @property {Number} NoSymbol             No symbol = -1.
 * @property {Number} Ellipse              Ellipse.
 * @property {Number} MRect                Rectangle.
 * @property {Number} Diamond              Diamond.
 * @property {Number} Triangle             Triangle.
 * @property {Number} DTriangle            Down Triangle.
 * @property {Number} UTriangle            Up Triangle.
 * @property {Number} LTriangle            Left Triangle.
 * @property {Number} RTriangle            Right Triangle.
 * @property {Number} Cross                Cross.
 * @property {Number} XCross               X Cross.
 * @property {Number} HLine                Horizontal Line.
 * @property {Number} VLine                Vertical Line.
 * @property {Number} Star1                Star1.
 * @property {Number} Star2                Star2.
 * @property {Number} Hexagon              Hexagon.
 * @property {Number} Path                 The symbol is represented by a painter path, where the origin ( 0, 0 ) of the path coordinate system is mapped to the position of the symbol. See {@link Symbol2#setPinPoint setPinPoint()}
 * @property {Number} Pixmap               The symbol is represented by a pixmap. The pixmap is centered or aligned to its pin point. See {@link Symbol2#setPinPoint setPinPoint()}
 * @property {Number} MGraphic             The symbol is represented by a graphic. The graphic is centered or aligned to its pin point. See {@link Symbol2#setPinPoint setPinPoint()}
 * @property {Number} SvgDocument          The symbol is represented by a SVG graphic. The graphic is centered or aligned to its pin point. See {@link Symbol2#setPinPoint setPinPoint()}
 * @property {Number} UserStyle            UserStyle = 1000.
 */
Enumerator.enum(
  "Style {NoSymbol = -1, Ellipse, MRect, Diamond, Triangle, DTriangle, UTriangle, LTriangle, \
    RTriangle, Cross, XCross, HLine, \
    VLine, Star1, Star2, Hexagon, Path, Pixmap, MGraphic, SvgDocument, UserStyle = 1000;}",
  Symbol2
);

/**
 * This class adds rotation to Path symbols. They are intended to be the base class for symbols that are rotatable.
 * @extends Symbol2
 */
class RotatableSymbol extends Symbol2 {
  construction(angle) {
    this.path().data.rotation = angle;
  }

  /**
   *
   * @returns {Number} Clockwise rotation in degrees
   */
  rotation() {
    return this.path().data.rotation;
  }

  /**
   * Sets the clockwise rotation in degrees.
   *
   * Rotation is about the pin point.
   * @param {number} val Clockwise rotation in degrees
   */
  setRotation(val) {
    this.path().data.rotation = val;
  }
}

/**
 * An arrow symbol
 * @extends  RotatableSymbol
 */
class PointMarkerSymbol extends Symbol2 {
  constructor(angle = 0) {
    super();
    var self = this;
    self.setStyle(Symbol2.Style.Ellipse);
    let m_pointType = "Turning point:";
    self.type = "pointMarker";
    self.setPen(new Misc.Pen("red", 2));
    self.setBrush(new Misc.Brush("rgba(0,255,255)"));
    // var path = new Misc.MPath();
    // path.moveTo(13, 30); //a
    // path.lineTo(13, 15); //b
    // path.lineTo(10, 15); //c
    // path.lineTo(7, 9.8); //d
    // path.lineTo(10, 4.6); //e
    // path.lineTo(16, 4.6); //f
    // path.lineTo(19, 9.8); //g
    // path.lineTo(16, 15); //h
    // path.lineTo(13, 15); //b.. for close
    // path.data.rotation = angle;
    // self.setPath(path);
    // self.setPinPoint(new Misc.Point(13, 9.8));

    this.pointType = function () {
      return m_pointType;
    };

    this.setPointType = function (pointType) {
      m_pointType = pointType;
    };
  }
  toString() {
    return "[PointMarkerSymbol]";
  }
}

/**
 * An arrow symbol
 * @extends  RotatableSymbol
 */
class PointMarkerSymbol2 extends RotatableSymbol {
  constructor(angle = 0) {
    super();
    var self = this;
    let m_pointType = "Turning point:";
    self.type = "pointMarker";
    self.setPen(new Misc.Pen("red", 2));
    self.setBrush(new Misc.Brush("rgba(0,255,255)"));
    var path = new Misc.MPath();
    path.moveTo(13, 30); //a
    path.lineTo(13, 15); //b
    path.lineTo(10, 15); //c
    path.lineTo(7, 9.8); //d
    path.lineTo(10, 4.6); //e
    path.lineTo(16, 4.6); //f
    path.lineTo(19, 9.8); //g
    path.lineTo(16, 15); //h
    path.lineTo(13, 15); //b.. for close
    path.data.rotation = angle;
    self.setPath(path);
    self.setPinPoint(new Misc.Point(13, 9.8));

    this.pointType = function () {
      return m_pointType;
    };

    this.setPointType = function (pointType) {
      m_pointType = pointType;
    };
  }
  toString() {
    return "[PointMarkerSymbol2]";
  }
}

/**
 * An arrow symbol
 * @extends  RotatableSymbol
 */
class ArrowSymbol extends RotatableSymbol {
  constructor(angle = 0) {
    super();
    var self = this;
    self.type = "arrow";
    self.setPen(new Misc.Pen("black"));
    self.setBrush(new Misc.Brush("red"));
    var path = new Misc.MPath();
    path.moveTo(13, 30);
    path.lineTo(13, 15);
    path.lineTo(10, 15);
    path.lineTo(13, 10);
    path.lineTo(16, 15);
    path.lineTo(13, 15);
    path.data.rotation = angle;
    self.setPath(path);
    self.setPinPoint(new Misc.Point(13, 10));
  }
  toString() {
    return "[ArrowSymbol]";
  }
}

/**
 * A symbol comprising of a line with a square dot at the front end
 * @extends  RotatableSymbol
 */
class DotOnLineSymbol extends RotatableSymbol {
  constructor(angle = 0) {
    super();
    var self = this;
    self.type = "dotOnLine";
    self.setPen(new Misc.Pen("black"));
    self.setBrush(new Misc.Brush("red"));
    var path = new Misc.MPath();
    path.moveTo(13, 30);
    path.lineTo(13, 15);
    path.addRect(new Misc.Rect(10, 9, 6, 6));
    path.data.rotation = angle;
    self.setPath(path);
    self.setPinPoint(new Misc.Point(14, 13));
    self.setSize(new Misc.Size(6, 23));
  }
}
