

/**
 * PlotPicker provides selections on a plot canvas
 *
 * PlotPicker is a Picker tailored for selections on a plot canvas.
 * It is set to a x-Axis and y-Axis and translates all pixel coordinates
 * into this coordinate system.
 * @extends Picker
 */
class PlotPicker extends Picker {
  /**
   * Create a plot picker. See example for how to use the oveloaded constructor
   *
   * The picker is set to those x- and y-axis of the plot that are enabled. If both or no x-axis are enabled, the picker is set
   * to {@link Axis.AxisId Axis.AxisId.xBottom}. If both or no y-axis are enabled, it is set to {@link Axis.AxisId Axis.AxisId.yLeft}.
   * @param {Axis.AxisId} [xAxis] axis of the picker
   * @param {Axis.AxisId} [yAxis] axis of the picker
   * @param {Picker.RubberBand} [rubberBand]
   * @param {Picker.DisplayMode} [trackerMode]
   * @param {Widget} canvas
   * @example
   * const plot = new Plot();
   * ...
   * const picker = new PlotPicker(plot);
   * or
   * const picker = new PlotPicker(Axis.AxisId.xTop, Axis.AxisId.yRight, plot);
   * or
   * const picker = new PlotPicker(Axis.AxisId.xTop, Axis.AxisId.yRight, Picker.RubberBand.RectRubberBand, Picker.DisplayMode.AlwaysOff, plot);
   */
  constructor(xAxis, yAxis, rubberBand, trackerMode, /*QWidget **/ canvas) {
    var _constructor = 0;

    if (typeof xAxis !== "number") {
      //constructor 1
      /*PlotPicker( QWidget *canvas );*/
      canvas = xAxis;
      xAxis = -1;
      yAxis = -1;
      rubberBand = Picker.RubberBand.NoRubberBand;
      trackerMode = Picker.DisplayMode.AlwaysOff;
      _constructor = 1; //indicate the constructor to use
    }
    if (typeof rubberBand !== "number") {
      //constructor 2
      /*PlotPicker( int xAxis, int yAxis,/* QWidget */ /*canvas)*/
      canvas = rubberBand;
      rubberBand = Picker.RubberBand.NoRubberBand;
      trackerMode = Picker.DisplayMode.AlwaysOff;
      _constructor = 2; //indicate the constructor to use
    }

    if (canvas instanceof Plot) canvas = canvas.getCentralWidget();

    super(rubberBand, trackerMode, canvas);
    this.d_xAxis = -1;
    this.d_yAxis = -1;

    if (_constructor == 1) {
      var plot = this.plot();
      var xAxis = Axis.AxisId.xBottom;
      if (
        plot &&
        !plot.axisEnabled(Axis.AxisId.xBottom) &&
        plot.axisEnabled(Axis.AxisId.xTop)
      ) {
        xAxis = Axis.AxisId.xTop;
      }

      var yAxis = Axis.AxisId.yLeft;
      if (
        plot &&
        !plot.axisEnabled(Axis.AxisId.yLeft) &&
        plot.axisEnabled(Axis.AxisId.yRight)
      ) {
        yAxis = Axis.AxisId.yRight;
      }

      this.setAxis(xAxis, yAxis);
    } else {
      this.d_xAxis = xAxis;
      this.d_yAxis = yAxis;
    }

    this.setEnabled(true);
    if (canvas) canvas.setEnabled_1(true);
  }

  /**
   * Set the x and y axes of the picker
   * @param {Axis.AxisId} xAxis X axis
   * @param {Axis.AxisId} yAxis Y axis
   *
   */
  setAxis(xAxis, yAxis) {
    var plt = this.plot();
    if (!plt) return;

    if (xAxis != this.d_xAxis || yAxis != this.d_yAxis) {
      this.d_xAxis = xAxis;
      this.d_yAxis = yAxis;
    }
  }

  /**
   *
   * @returns {Axis.AxisId} Return x axis.
   */
  xAxis() {
    return this.d_xAxis;
  }

  /**
   *
   * @returns {Axis.AxisId} Return y axis.
   */
  yAxis() {
    return this.d_yAxis;
  }

  /**
   *
   * @returns {Plot} Plot widget, containing the observed plot canvas
   */
  plot() {
    var w = this.parentWidget();
    if (!w) return null;
    return w.plot;
  }

  /**
   *
   * @returns {Widget} Observed plot canvas
   */
  canvas() {
    return this.parentWidget();
  }

  /**
   * @returns {Misc.Rect} Normalized bounding rectangle of the axes
   */
  scaleRect() {
    var rect = null;
    if (this.plot()) {
      var xs = this.plot().axisScaleDiv(this.xAxis());
      var ys = this.plot().axisScaleDiv(this.yAxis());

      rect = new Misc.Rect(
        xs.lowerBound(),
        ys.lowerBound(),
        xs.range(),
        ys.range()
      );
      rect = rect.normalized();
    }

    return rect;
  }

  /**
   * Translate a rectangle from pixel into plot coordinates
   * @param {Misc.Rect} rect
   * @returns {Misc.Rect} Rectangle in plot coordinates
   * @see {@link PlotPicker#transform transform()}
   */
  /*QRectF */ invTransform(/*const QRect &*/ rect) {
    var xMap = this.plot().canvasMap(this.d_xAxis);
    var yMap = this.plot().canvasMap(this.d_yAxis);
    if (_.has(rect, "x") && _.has(rect, "y")) {
      //argument is a point
      var pos = rect;
      return new Misc.Point(xMap.invTransform(pos.x), yMap.invTransform(pos.y));
    } else {
      //argument is a rect
      return ScaleMap.invTransform_Rect(xMap, yMap, rect);
    }
  }

  /**
   * Translate a rectangle from plot into pixel coordinates
   * @param {Misc.Rect} rect
   * @returns {Misc.Rect} Rectangle in pixel coordinates
   * @see {@link PlotPicker#invTransform invTransform()}
   */
  /*QRect */ transform(/* const QRectF &*/ rect) {
    var xMap = this.plot().canvasMap(this.d_xAxis);
    var yMap = this.plot().canvasMap(this.d_yAxis);
    if (rect.x !== undefined) {
      //argument is a point
      var pos = rect;
      var p = new Misc.Point(xMap.transform(pos.x), yMap.transform(pos.y));

      return p;
    } else {
      //return QwtScaleMap::transform( xMap, yMap, rect ).toRect();
      return Static.mTransform(xMap, yMap, rect);
    }
  }

  /**
   * Translate a pixel position into a position string
   * @param {Misc.Point} pos Position in pixel coordinates
   * @returns {String} Position string
   */
  /*virtual QwtText */ trackerText(/* const QPointF &*/ pos) {
    pos = this.invTransform(pos);
    var label; //= "";

    switch (this.rubberBand()) {
      case Picker.RubberBand.HLineRubberBand:
        label = pos.y.toString();
        break;
      case Picker.RubberBand.VLineRubberBand:
        label = pos.x.toString();
        break;
      default:
        label = pos.x.toString() + ", " + pos.y.toString();
    }
    return label;
  }

  /**
   * Move the last point of the selection
   * @param {Misc.Point} pos New position
   * @see {@link PlotPicker#isActive isActive()}
   * @see {@link PlotPicker#begin begin()}
   * @see {@link PlotPicker#end end()}
   * @see {@link PlotPicker#append append()}
   */
  move(/*const QPoint &*/ pos) {
    super.method(move(pos));
    Static.trigger("moved", invTransform(pos));
  }

  /**
   * Append a point to the selection and update rubber band and tracker.
   * @param {Misc.Point} pos New position
   * @see {@link PlotPicker#isActive isActive()}
   * @see {@link PlotPicker#begin begin()}
   * @see {@link PlotPicker#end end()}
   */
  append(/*const QPoint & */ pos) {
    super.method(append(pos));
    Static.trigger("appended", invTransform(pos));
  }

  /**
   * Close a selection setting the state to inactive.
   * @param {Boolean} ok If true, complete the selection and emit selected signals otherwise discard the selection.
   * @returns {Boolean} True if the selection has been accepted, false otherwise
   */
  /*virtual bool*/ end(ok = true) {
    ok = super.end(ok);
    if (!ok) return false;

    var plot = this.plot();
    if (!plot) return false;

    var points = this.selection();
    if (points.length == 0) return false;

    var selectionType = PickerMachine.SelectionType.NoSelection;

    if (this.stateMachine())
      selectionType = this.stateMachine().selectionType();

    switch (selectionType) {
      case PickerMachine.SelectionType.PointSelection: {
        var pos = this.invTransform(points[0]);
        Static.trigger("selected", pos);
        break;
      }
      case PickerMachine.SelectionType.RectSelection: {
        if (points.length >= 2) {
          var p1 = points[0];
          var p2 = points[points.length - 1];

          var rect = new Misc.Rect(p1, p2).normalized();
          Static.trigger("selected", this.invTransform(rect));
        }
        break;
      }
      case PickerMachine.SelectionType.PolygonSelection: {
        var dpa = [];
        for (var i = 0; i < points.length; i++)
          dpa.push(this.invTransform(points[i]));

        Static.trigger("selected", dpa);
      }
      default:
        break;
    }

    return true;
  }
}
