class PrivateData_2 {
  constructor() {
    this.zoomRectIndex;
    /*QStack<QRectF>*/
    this.zoomStack = [];

    this.maxStackDepth;
  }
}

/**
 * PlotZoomer provides stacked zooming for a plot widget. It is tailored for plots with one x and y axis.
 *
 * PlotZoomer selects rectangles from user inputs ( mouse or keyboard ) translates them into plot coordinates and adjusts the axes to
 * them. The selection is supported by a rubber band and optionally by displaying the coordinates of the current mouse position.
 *
 * Zooming can be repeated as often as possible, limited only by {@link PlotZoomer#maxStackDepth maxStackDepth()} or {@link PlotZoomer#minZoomSize minZoomSize()}. Each rectangle
 * is pushed on a stack.
 *
 * The default setting how to select rectangles is a {@link PickerDragRectMachine} with the following bindings:
 * - `EventPattern::MouseSelect1` The first point of the zoom rectangle is selected by a mouse press, the second point from the position, where the mouse is released.
 * - `EventPattern::KeySelect1` The first key press selects the first, the second key press selects the second point.
 * - `EventPattern::KeyAbort` Discard the selection in the state, where the first point is selected.
 *
 * To traverse the zoom stack the following bindings are used:
 * - `EventPattern::MouseSelect3`, `EventPattern::KeyUndo` Zoom out one position on the zoom stack
 * - `EventPattern::MouseSelect6`, `EventPattern::KeyRedo` Zoom in one position on the zoom stack
 * - `EventPattern::MouseSelect2`, `EventPattern::KeyHome` Zoom to the zoom base
 *
 * The {@link PlotZoomer#setKeyPattern setKeyPattern()} and {@link PlotZoomer#setMousePattern setMousePattern()} functions can be used to configure the zoomer actions. The example below shows, how to configure the 'I' and 'O' keys for zooming in and out one position on the zoom stack. The "Home" key is used to "unzoom" the plot.
 * @example
 * //Using the overloaded constructor
 * const canvas = plot.getCentralWidget();
 * new PlotZoomer(canvas); //The default axes (Axis.AxisId.xBottom, Axis.AxisId.yLeft)
 * new PlotZoomer(Axis.AxisId.xTop, Axis.AxisId.yRight, canvas);
 *
 * //Setting up kepatterns
 * zoomer = new PlotZoomer( plot );
 * zoomer->setKeyPattern( EventPattern.KeyPatternCode.KeyUndo, Static.Key_I, Static.ShiftModifier );
 * zoomer->setKeyPattern( EventPattern.KeyPatternCode.KeyRedo, Static.Key_O, Static.ShiftModifier );
 * zoomer->setKeyPattern( EventPattern.KeyPatternCode.KeyHome, Static.Key_Home );
 * @extends PlotPicker
 */
class PlotZoomer extends PlotPicker {
  /**
   * Create a zoomer for a plot canvas. See example.
   * @param {Axis.AxisId} [xAxis] Axis of the zoomer
   * @param {Axis.AxisId} [yAxis] Axis of the zoomer
   * @param {Widget} canvas Central widget
   * @param {Boolean} doReplot=true Call {@link Plot#replot replot()} for the attached plot before initializing the zoomer with its scales. This might be necessary, when the plot is in a state with pending scale changes.
   * @example
   * const canvas = plot.getCentralWidget();
   * new PlotZoomer(canvas); //The default axes (Axis.AxisId.xBottom, Axis.AxisId.yLeft)
   * new PlotZoomer(Axis.AxisId.xTop, Axis.AxisId.yRight, canvas);
   */
  constructor(xAxis, yAxis, /*QWidget **/ canvas, doReplot = true) {
    if (typeof xAxis !== "number") {
      //first argument is a widget
      canvas = xAxis;
      super(canvas);
    } else {
      super(xAxis, yAxis, canvas);
    }

    /*if ( canvas )
		this.init( doReplot );*/

    var self = this;

    /*PrivateData*/
    var d_data;

    this.privateData = function () {
      return d_data;
    };

    this.getZoomerData = function () {
      return d_data;
    };

    //! Init the zoomer, used by the constructors
    this.init = function (doReplot) {
      d_data = new PrivateData_2();

      d_data.maxStackDepth = -1;

      this.setTrackerMode(Picker.DisplayMode.ActiveOnly);
      //this.setTrackerMode( Picker.DisplayMode.AlwaysOn );
      this.setRubberBand(Picker.RubberBand.RectRubberBand);
      this.setStateMachine(new PickerDragRectMachine());

      this.plot().zoomer = this;

      Static.trigger("zoomerAdded", this);

      if (doReplot && this.plot()) {
        this.plot().autoRefresh();
      }

      this.setZoomBase(this.scaleRect());
    };

    /**
     * Reinitialized the zoom stack with scaleRect() as base.
     * @param {boolean | Misc.Rect} [doReplot = true] - If boolean and true, calls replot() method for the attached plot before initializing
     * the zoomer with its scales. This is necessary, when the plot is in a state with pending scale changes. The default is true.
     * If a valid Rect object, sets the initial size of the zoomer. The Rect is united with the current scaleRect() and the zoom stack is
     * reinitialized with it as zoom base. plot is zoomed to scaleRect().
     * @see {@link PlotPicker}, {@link Plot#autoReplot autoReplot()}
     * @see {@link Plot#replot replot()}.
     */
    this.setZoomBase = function (doReplot = true) {
      //or  /*setZoomBase( const QRectF & );*/
      if (typeof doReplot == "object") {
        var base = doReplot;
        var plt = this.plot();
        if (!plt) return;

        /*const QRectF*/
        var sRect = this.scaleRect();
        /*const QRectF*/
        var bRect = base | sRect;
        var bRect = null;
        if (!base) bRect = sRect;
        else bRect = base;

        //d_data.zoomStack.clear();
        d_data.zoomStack = [];
        d_data.zoomStack.push(bRect);
        d_data.zoomRectIndex = 0;

        if (!base.isEqual(sRect)) {
          d_data.zoomStack.push(sRect);
          d_data.zoomRectIndex++;
        }

        this.rescale();
      } else {
        var plt = this.plot();
        if (plt == null) return;

        if (doReplot) plt.autoRefresh();

        //d_data.zoomStack.clear();
        d_data.zoomStack = [];
        d_data.zoomStack.push(this.scaleRect());
        d_data.zoomRectIndex = 0;

        this.rescale();
      }
    };

    /**
     *
     * @returns Initial rectangle of the zoomer.
     * @see {@link PlotZoomer#setZoomBase setZoomBase()}
     * @see {@link PlotZoomer#zoomRect zoomRect()}
     */
    this.zoomBase = function () {
      return d_data.zoomStack[0];
    };

    /**
     *
     * @returns Rectangle at the current position on the zoom stack.
     * @see {@link PlotZoomer#zoomRectIndex zoomRectIndex()}
     * @see {@link PlotZoomer#scaleRect scaleRect()}
     */
    this.zoomRect = function () {
      return d_data.zoomStack[d_data.zoomRectIndex];
    };

    /**
     * Limit the number of recursive zoom operations to depth.
     *
     * A value of -1 set the depth to unlimited, 0 disables zooming.
     * If the current zoom rectangle is below depth, the plot is unzoomed.
     *
     * depth doesn't include the zoom base, so zoomStack().count() might be maxStackDepth() + 1.
     * @param {Number} depth Maximum for the stack depth
     * @see {@link PlotZoomer#maxStackDepth maxStackDepth()}
     */
    this.setMaxStackDepth = function (depth) {
      d_data.maxStackDepth = depth;

      if (depth >= 0) {
        // unzoom if the current depth is below d_data2->maxStackDepth

        /*const int*/
        var zoomOut = d_data.zoomStack.length - 1 - depth; // -1 for the zoom base

        if (zoomOut > 0) {
          this.zoom(-zoomOut);
          for (
            var i = d_data.zoomStack.length - 1;
            i > d_data.zoomRectIndex;
            i--
          ) {
            d_data.zoomStack.pop(); // remove trailing rects
          }
        }
      }
    };

    /**
     *
     * @returns {Number} Maximal depth of the zoom stack.
     * @see {@link PlotZoomer#setMaxStackDepth setMaxStackDepth()}
     */
    this.maxStackDepth = function () {
      return d_data.maxStackDepth;
    };

    /**
     *
     * @returns {Array<Misc.Rect>} The zoom stack. zoomStack()[0] is the zoom base, zoomStack()[1] the first zoomed rectangle.
     * @see {@link PlotZoomer#setZoomStack setZoomStack()}
     * @see {@link PlotZoomer#zoomRectIndex zoomRectIndex()}
     */
    this.zoomStack = function () {
      return d_data.zoomStack;
    };

    /**
     * Assign a zoom stack. If zoomed, the zoomed event is triggered - Static.trigger("zoomed", this.zoomRect())
     *
     * In combination with other types of navigation it might be useful to modify to manipulate the complete zoom stack.
     * @param {Array<Misc.Rect>} zoomStack  New zoom stack
     * @param {Number} zoomRectIndex=-1 Index of the current position of zoom stack. In case of -1 the current position is at the top of the stack.
     * @see {@link PlotZoomer#zoomStack zoomStack()}
     * @see {@link PlotZoomer#zoomRectIndex zoomRectIndex()}
     */
    this.setZoomStack = function (zoomStack, zoomRectIndex = -1) {
      if (this.zoomStack.length == 0) return;

      if (
        d_data.maxStackDepth >= 0 &&
        this.zoomStack.length > d_data.maxStackDepth
      ) {
        return;
      }

      if (zoomRectIndex < 0 || zoomRectIndex > this.zoomStack.length)
        zoomRectIndex = zoomStack.length - 1;

      var doRescale = this.zoomStack[zoomRectIndex] != this.zoomRect();

      d_data.zoomStack = zoomStack;
      d_data.zoomRectIndex = zoomRectIndex;

      if (doRescale) {
        this.rescale();
        //Q_EMIT zoomed( zoomRect() );
        Static.trigger("zoomed", this.zoomRect());
      }
    };

    /**
     *
     * @returns {Number} Index of current position of zoom stack.
     */
    this.zoomRectIndex = function () {
      return d_data.zoomRectIndex;
    };

    /**
     * Move the current zoom rectangle.
     *
     * The changed rectangle is limited by the zoom base
     * @param {Number} dx X offset
     * @param {Number} dy Y offset
     * @see {@link PlotZoomer#moveTo moveTo()}
     */
    this.moveBy = function (dx, dy) {
      /*const QRectF*/
      var rect = d_data.zoomStack[d_data.zoomRectIndex];
      moveTo(new Misc.Point(rect.left() + dx, rect.top() + dy));
    };

    /**
     * Move the the current zoom rectangle.
     *
     * The changed rectangle is limited by the zoom base
     * @param {Misc.Point} pos New position
     * @see {@link PlotZoomer#moveBy moveBy()}
     */
    this.moveTo = function (/*const QPointF*/ pos) {
      var x = pos.x;
      var y = pos.y;

      if (x < this.zoomBase().left()) x = this.zoomBase().left();
      if (x > this.zoomBase().right() - this.zoomRect().width())
        x = this.zoomBase().right() - this.zoomRect().width();

      if (y < this.zoomBase().top()) y = this.zoomBase().top();
      if (y > this.zoomBase().bottom() - this.zoomRect().height())
        y = this.zoomBase().bottom() - this.zoomRect().height();

      if (x != this.zoomRect().left() || y != this.zoomRect().top()) {
        d_data.zoomStack[d_data.zoomRectIndex].moveTo(x, y);
        this.rescale();
      }
    };

    /**
     * Zoom in. If zoomed, the zoomed event is triggered - Static.trigger("zoomed", this.zoomRect())
     *
     * Clears all rectangles above the current position of the zoom stack and pushes the normalized rectangle on it.
     *
     * If the maximal stack depth is reached, zoom is ignored.
     * @param {Misc.Rect} rect
     */
    this.zoom = function (/*QRectF*/ rect) {
      //or /*virtual void zoom( int up );*/
      if (typeof rect == "number") {
        var offset = rect;
        if (offset == 0) d_data.zoomRectIndex = 0;
        else {
          var newIndex = d_data.zoomRectIndex + offset;
          newIndex = Math.max(0, newIndex);
          newIndex = Math.min(d_data.zoomStack.length - 1, newIndex);

          d_data.zoomRectIndex = newIndex;
        }

        this.rescale();

        Static.trigger("zoomed", this.zoomRect());
      } else {
        if (
          d_data.maxStackDepth >= 0 &&
          d_data.zoomRectIndex >= d_data.maxStackDepth
        ) {
          return;
        }

        var zoomRect = rect.normalized();
        if (!zoomRect.isEqual(d_data.zoomStack[d_data.zoomRectIndex])) {
          for (
            var i = d_data.zoomStack.length - 1;
            i > d_data.zoomRectIndex;
            i--
          ) {
            d_data.zoomStack.pop();
          }
          d_data.zoomStack.push(zoomRect);
          d_data.zoomRectIndex++;

          this.rescale();

          Static.trigger("zoomed", zoomRect);
        }
      }
    };

    /**
     * Limit zooming by a minimum rectangle
     * @returns {Misc.Size} zoomBase().width() / 10e4, zoomBase().height() / 10e4
     */
    this.minZoomSize = function () {
      return new Misc.Size(
        d_data.zoomStack[0].width() / 10e4,
        d_data.zoomStack[0].height() / 10e4
      );
    };

    /**
     * Check and correct a selected rectangle
     *
     * Reject rectangles with a height or width < 2, otherwise expand the selected rectangle to a minimum size of 11x11 and
     * accept it.
     * @param {Array<Misc.Point>} pa List of selected points to validate
     * @returns {Boolean} true If the rectangle is accepted, or has been changed to an accepted one.
     */
    this.accept = function (/*QPolygon*/ pa) {
      if (pa.length < 2) return false;

      var rect = new Misc.Rect(pa[0], pa[pa.length - 1]);
      rect = rect.normalized();

      var minSize = 2;
      if (rect.width() < minSize && rect.height() < minSize) return false;

      var minZoomSize = 11;

      var center = rect.center();
      rect.setSize(
        rect.size().expandedTo(new Misc.Size(minZoomSize, minZoomSize))
      );
      rect.moveCenter(center);

      pa.resize(2);
      pa[0] = rect.topLeft();
      pa[1] = rect.bottomRight();

      return true;
    };

    if (canvas) this.init(doReplot);
  }

  /**
   * Adjust the observed plot to zoomRect()
   *
   * Initiates {@link Plot#replot replot()}
   *
   */
  rescale() {
    var plt = this.plot();
    if (!plt) return;
    let d_data = this.privateData();
    var rect = d_data.zoomStack[d_data.zoomRectIndex];
    /*if ( rect !== this.scaleRect() )*/
    if (!rect.isEqual(this.scaleRect())) {
      var doReplot = plt.autoReplot();
      plt.setAutoReplot(false);

      var x1 = rect.left();
      var x2 = rect.right();
      if (!plt.axisScaleDiv(this.xAxis()).isIncreasing()) {
        //qSwap( x1, x2 );
        var temp = x1;
        x1 = x2;
        x2 = temp;
      }

      plt.setAxisScale(this.xAxis(), x1, x2);

      var y1 = rect.top();
      var y2 = rect.bottom();
      if (!plt.axisScaleDiv(this.yAxis()).isIncreasing()) {
        //qSwap( y1, y2 );
        var temp = y1;
        y1 = y2;
        y2 = temp;
      }

      plt.setAxisScale(this.yAxis(), y1, y2);

      plt.setAutoReplot(doReplot);

      plt.autoRefresh();
    }
  }

  /**
   * Static.Key_Plus zooms in, Static.Key_Minus zooms out one position on the zoom stack, Static.Key_Escape zooms out to the zoom base.
   *
   * Changes the current position on the stack, but doesn't pop any rectangle.
   *
   * The keys codes can be changed, using {@link EventPattern#setKeyPattern setKeyPattern()}
   * @param {Event} ke Key event
   */
  widgetKeyPressEvent(ke) {
    const Enum = Enumerator.getDefaultEnumNampespace();
    if (!this.isActive()) {
      if (this.keyMatch(EventPattern.KeyPatternCode.KeyUndo, ke)) this.zoom(-1);
      else if (this.keyMatch(EventPattern.KeyPatternCode.KeyRedo, ke))
        this.zoom(+1);
      else if (this.keyMatch(EventPattern.KeyPatternCode.KeyHome, ke))
        this.zoom(0);
    }

    super.widgetKeyPressEvent(ke);
  }

  /**
   * Static.MidButton zooms out one position on the zoom stack. Static.MidButton + Static.ShiftModifier zooms in one position on the zoom stack.
   *
   * Changes the current position on the stack, but doesn't pop any rectangle.
   *
   * The mouse events can be changed, using {@link EventPattern#setMousePattern setMousePattern()}
   * @param {Event} me Mouse event
   */
  widgetMouseReleaseEvent(me) {
    const Enum = Enumerator.getDefaultEnumNampespace();
    if (this.mouseMatch(EventPattern.MousePatternCode.MouseSelect2, me));
    else if (this.mouseMatch(EventPattern.MousePatternCode.MouseSelect3, me))
      //this.zoom(0);
      this.zoom(-1);
    else if (this.mouseMatch(EventPattern.MousePatternCode.MouseSelect6, me))
      this.zoom(+1);
    else super.widgetMouseReleaseEvent(me);
  }

  /**
   * Expand the selected rectangle to {@link PlotZoomer#minZoomSize minZoomSize()} and zoom in if accepted.
   * @param {Boolean} ok If true, complete the selection and emit selected signals otherwise discard the selection.
   * @returns {Boolean} True if the selection has been accepted, false otherwise
   * @see {@link PlotZoomer#accept accept()}
   * @see {@link PlotZoomer#minZoomSize minZoomSize()}
   */
  end(ok = true) {
    ok = super.end(ok);
    if (!ok) return false;

    var plot = this.plot();
    if (!plot) return false;

    var pa = this.selection();
    if (pa.length < 2) return false;

    var rect = new Misc.Rect(pa[0], pa[pa.length - 1]);
    rect = rect.normalized();

    var zoomRect = this.invTransform(rect).normalized();

    var minSize = this.minZoomSize();
    if (minSize.isValid()) {
      /*const QPointF*/
      var center = zoomRect.center();
      zoomRect.setSize(zoomRect.size().expandedTo(this.minZoomSize()));
      zoomRect.moveCenter(center);
    }
    this.zoom(zoomRect);
    return true;
  }

  /**
   * Rejects selections, when the stack depth is too deep, or the zoomed rectangle is {@link PlotZoomer#minZoomSize minZoomSize()}.
   * @see {@link PlotZoomer#minZoomSize minZoomSize()}
   * @see {@link PlotZoomer#maxStackDepth maxStackDepth()}
   */
  begin() {
    var d = this.getZoomerData();
    if (d.maxStackDepth >= 0) {
      if (d.zoomRectIndex >= d.maxStackDepth) return;
    }
    var minSize = this.minZoomSize();
    if (minSize.isValid()) {
      var sz = new Misc.Size(
        d.zoomStack[d.zoomRectIndex].width() * 0.9999,
        d.zoomStack[d.zoomRectIndex].height() * 0.9999
      );

      if (minSize.width >= sz.width && minSize.height >= sz.height) {
        return;
      }
    }
    super.begin();
  }

  /**
   * Reinitialize the axes, and set the zoom base to their scales.
   * @param {Axis.AxisId} xAxis X axis
   * @param {Axis.AxisId} yAxis Y axis
   */
  setAxis(xAxis, yAxis) {
    if (xAxis != super.xAxis() || yAxis != super.yAxis()) {
      super.setAxis(xAxis, yAxis);
      if (this.setZoomBase !== undefined) this.setZoomBase(this.scaleRect());
    }
  }
}
