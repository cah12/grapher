

/**
 * A plot item, which displays any graphical shape, that can be defined by a Misc.MPath.
A Misc.MPath is a shape composed from intersecting and uniting regions, rectangles, ellipses or irregular areas defined by lines, and curves. PlotShapeItem displays a shape with a pen and brush.
PlotShapeItem offers a couple of optimizations like clipping or weeding. These algorithms need to convert the Misc.MPath into polygons that might be less performant for paths built from curves and ellipses.
*/
class PlotShapeItem extends PlotItem {
  constructor() {
    super("Shape");

    var m_renderTolerance = 0.0;

    var m_boundingRect = super.boundingRect();

    var m_pen = new Misc.Pen("black", 1, Static.NoPen);

    var m_brush = new Misc.Brush("#006464");
    var m_shape = new Misc.MPath();

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
    this.setItemAttribute(PlotItem.ItemAttribute.Legend, false);

    this.setZ(8.0);

    this.rtti = PlotItem.RttiValues.Rtti_PlotShape;

    this.getBoundingRect = function () {
      return m_boundingRect;
    };

    /**
     * Set a path built from a rectangle
     * @param {Misc.Rect} rect Rectangle
     * @see {@link PlotShapeItem#setShape setShape()}
     * @see {@link PlotShapeItem#shape shape()}
     * @see {@link PlotShapeItem#setPolygon setPolygon()}
     */
    this.setRect = function (rect) {
      var path = new Misc.MPath();
      path.addRect(rect);
      this.setShape(path);
    };

    /**
     * Set a path built from a polygon
     * @param {Misc.Polygon} polygon Polygon
     * @see {@link PlotShapeItem#setShape setShape()}
     * @see {@link PlotShapeItem#shape shape()}
     * @see {@link PlotShapeItem#setRect setRect()}
     */
    this.setPolygon = function (polygon) {
      var shape = new Misc.MPath();
      shape.addPolygon(polygon);
      this.setShape(shape);
    };

    /**
     * Set the shape to be displayed
     * @param {Misc.MPath} shape
     * @see {@link PlotShapeItem#setShape setShape()}
     * @see {@link PlotShapeItem#shape shape()}
     */
    this.setShape = function (shape) {
      //if ( shape != m_shape )
      {
        m_shape = shape;

        if (shape.isEmpty()) {
          m_boundingRect = PlotItem.prototype.boundingRect.call(this);
        } else {
          m_boundingRect = m_shape.boundingRect();
        }

        //itemChanged();
      }
    };

    /**
     * Assign a brush
     * @param {Misc.Brush} pen Brush
     */
    this.setBrush = function (brush) {
      m_brush = brush;
      this.itemChanged();
    };

    /**
     *
     * @returns {Misc.Brush} Brush used to fill the shape
     */
    this.brush = function () {
      return m_brush;
    };

    /**
     * Assign a pen
     * @param {Misc.Pen} pen Pen
     */
    this.setPen = function (pen) {
      m_pen = pen;
      this.itemChanged();
    };

    /**
     *
     * @returns {Misc.Pen} Pen used to draw the outline of the shape
     */
    this.pen = function () {
      return m_pen;
    };

    /**
     * Draw the shape item
     * @param {ScaleMap} xMap X-Scale Map
     * @param {ScaleMap} yMap Y-Scale Map
     *
     */
    this.draw = function (xMap, yMap) {
      //start with a clean canvas
      this.clearCanvas();
      if (m_shape.isEmpty()) return;

      if (m_pen.style == Static.NoPen && m_brush == Static.NoBrush) {
        return;
      }

      var canvasRect = this.getCanvasRect();
      //alert(canvasRect)
      var cRect = ScaleMap.invTransform_Rect(xMap, yMap, canvasRect);
      if (m_boundingRect.intersects(cRect)) {
        //alert(11)
        var ctx = this.getContext();
        var doAlign = false; //QwtPainter::roundingAlignment( painter );

        var path = ScaleMap.transformPath(xMap, yMap, m_shape, doAlign);

        /*if ( testPaintAttribute( QwtPlotShapeItem::ClipPolygons ) ){
                qreal pw = qMax( qreal( 1.0 ), painter->pen().widthF());
                QRectF clipRect = canvasRect.adjusted( -pw, -pw, pw, pw );

                QPainterPath clippedPath;
                clippedPath.setFillRule( path.fillRule() );

                const QList<QPolygonF> polygons = path.toSubpathPolygons();
                for ( int i = 0; i < polygons.size(); i++ ){
                const QPolygonF p = QwtClipper::clipPolygonF(
                clipRect, polygons[i], true );

                clippedPath.addPolygon( p );

                }

                path = clippedPath;
                }*/

        /*if ( d_data->renderTolerance > 0.0 )
            {
                QwtWeedingCurveFitter fitter( d_data->renderTolerance );

                QPainterPath fittedPath;
                fittedPath.setFillRule( path.fillRule() );

                const QList<QPolygonF> polygons = path.toSubpathPolygons();
                for ( int i = 0; i < polygons.size(); i++ )
                fittedPath.addPolygon( fitter.fitCurve( polygons[ i ] ) );

                path = fittedPath;
                }*/

        var painter = new PaintUtil.Painter(ctx);
        painter.setBrush(m_brush);
        painter.setPen(m_pen);
        painter.drawPath(path);
        painter = null;
      }
    };

    /**
     *
     * @returns {Misc.Rect} Bounding rectangle of the shape.
     */
    this.boundingRect = function () {
      return this.getBoundingRect();
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[PlotShapeItem]";
    };
  }
}
