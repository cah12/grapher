

class PickerRubberband extends WidgetOverlay {
  constructor(/*QwtPicker*/ picker, /*QWidget*/ parent) {
    super(parent);

    this.setZ(30); //ensure the rubberband is drawn above everything

    var d_picker = picker;

    this.drawOverlay = function (painter) {
      //d_picker.rubberBandOverlay().clearCanvas()
      //painter.save()
      painter.setPen(d_picker.rubberBandPen());
      painter.setBrush(Static.NoBrush);
      d_picker.drawRubberBand(painter);
      //painter.restore()
    };
  }
}

class PickerTracker extends WidgetOverlay {
  constructor(/*QwtPicker*/ picker, /*QWidget*/ parent) {
    super(parent);
    this.setZ(30); //ensure the tracker is drawn above everything

    var d_picker = picker;

    this.drawOverlay = function (painter) {
      d_picker.trackerOverlay().clearCanvas();
      painter.save();
      painter.setPen(d_picker.trackerPen()); //This has no effect. trackerFont does it.
      d_picker.drawTracker(painter);
      painter.restore();
    };
  }
}

class PickerPrivateData {
  constructor() {
    this.enabled = false;

    this.stateMachine = null;

    this.resizeMode; //= QwtPicker::Stretch;

    this.rubberBand = Picker.RubberBand.NoRubberBand;
    this.rubberBandPen = new Misc.Pen("red", 1, "solid");

    this.trackerMode = Picker.DisplayMode.AlwaysOff;
    this.trackerPen = new Misc.Pen("red");
    this.trackerFont;

    this.pickedPoints = [];
    this.isActive = false;
    /*QPoint*/
    this.trackerPosition = new Misc.Point();

    this.mouseTracking = false; // used to save previous value

    /*QPointer< QwtPickerRubberband >*/
    this.rubberBandOverlay = null;
    /*QPointer< QwtPickerTracker>*/
    this.trackerOverlay = null;
  }
}

/**
 * Picker provides selections on a widget.
 *
 * Picker filters all enter, leave, mouse and keyboard events of a widget and translates them into an array of selected points.
 * The way how the points are collected depends on type of state machine that is associated with the picker. js-Qwt offers a few
 * predefined state machines for selecting:
 *
 * <b><i>Nothing - PickerTrackerMachine</i></b>
 *
 * <b><i>Single points - PickerClickPointMachine, PickerDragPointMachine</i></b>
 *
 * <b><i>Rectangles - PickerClickRectMachine, PickerDragRectMachine</i></b>
 *
 * <b><i>Polygons - PickerPolygonMachine</i></b>
 *
 * While these state machines cover the most common ways to collect points it is also possible to implement individual
 * machines as well. Picker translates the picked points into a selection using the adjustedPoints() method. adjustedPoints()
 * is intended to be reimplemented to fix up the selection according to application specific requirements. (e.g. when an
 * application accepts rectangles of a fixed aspect ratio only.)
 *
 * Optionally Picker support the process of collecting points by a rubber band and tracker displaying a text for the
 * current mouse position.
 *
 * @extends EventPattern
 */
class Picker extends EventPattern {
  /**
   * Creates a Picker. See example for usage.
   * @param {Picker.RubberBand} [rubberBand] Rubber band style
   * @param {Picker.DisplayMode} [trackerMode] Tracker mode
   * @param {Widget} parent Central widget, that will be observed
   * @example
   * const plot = new Plot();
   * ...
   * const picker = new Picker(plot); //Creates an picker that is enabled, but without a state machine. rubber band and tracker are disabled.
   * const picker = new Picker(Picker.RubberBand.RectRubberBand, Picker.DisplayMode.ActiveOnly, plot);
   */
  constructor(rubberBand, trackerMode, parent) {
    super(parent);
    const self = this;

    let clickEvent = "click";
    let mousedownEvent = "mousedown";
    let mouseupEvent = "mouseup";
    let mousemoveEvent = "mousemove";
    if (Static.isMobile()) {
      clickEvent = "tap";
      mousedownEvent = "touchstart";
      mouseupEvent = "touchend";
      mousemoveEvent = "touchmove";
    }

    var d_data;
    var m_pickedPoints = [];

    var m_parent = null;

    if (parent !== undefined && parent.toString() == "[Widget]") {
      m_parent = parent;
    }
    //console.log(m_parent.getElement());
    //m_parent.getElement()[0].focus();

    //! Initialize the picker - used by the constructors
    this.init = function (parent, rubberBand, trackerMode) {
      d_data = new PickerPrivateData();

      d_data.rubberBand = rubberBand;

      if (parent) {
        //if ( parent->focusPolicy() == Qt::NoFocus )
        //parent->setFocusPolicy( Qt::WheelFocus );

        //d_data->openGL = parent->inherits( "QGLWidget" );
        d_data.trackerFont = new Misc.Font(12);
        //d_data->mouseTracking = parent->hasMouseTracking();

        this.setEnabled_1(true);
      }

      this.setTrackerMode(trackerMode);
      Picker.pickers.push(this);
    };

    //For internal use
    this.getPickerData = function () {
      return d_data;
    };

    /**
     * Sets a state machine and delete the previous one
     * @param {PickerMachine} stateMachine State machine
     * @see {@link Picker#stateMachine stateMachine()}
     */
    this.setStateMachine = function (/*QwtPickerMachine*/ stateMachine) {
      if (d_data.stateMachine != stateMachine) {
        this.reset();

        //delete d_data->stateMachine;
        d_data.stateMachine = stateMachine;

        if (d_data.stateMachine) d_data.stateMachine.reset();
      }
    };

    /**
     *
     * @returns {PickerMachine} Assigned state machine
     * @see {@link Picker#setStateMachine setStateMachine()}
     */
    this.stateMachine = function () {
      return d_data.stateMachine;
    };

    /**
     *
     * @returns {Widget} the parent widget, where the selection happens
     */
    this.parentWidget = function () {
      return m_parent;
    };

    /**
     *
     * @param {Picker.RubberBand} rubberBand Rubber band style
     * @see {@link Picker#rubberBand rubberBand()}
     * @see {@link Picker.RubberBand RubberBand}
     */
    this.setRubberBand = function (rubberBand) {
      d_data.rubberBand = rubberBand;
    };

    /**
     *
     * @returns {Picker.RubberBand} Rubber band style
     * @see {@link Picker#setRubberBand setRubberBand()}
     * @see {@link Picker.RubberBand RubberBand}
     */
    this.rubberBand = function () {
      return d_data.rubberBand;
    };

    /**
     * Sets the display mode of the tracker.
     *
     * A tracker displays information about current position of the cursor as a string. The display mode controls
     * if the tracker has to be displayed whenever the observed widget has focus and cursor (AlwaysOn), never (AlwaysOff), or
     * only when the selection is active (ActiveOnly).
     * @param {Picker.DisplayMode} mode Tracker display mode
     */
    this.setTrackerMode = function (/*DisplayMode*/ mode) {
      if (d_data.trackerMode != mode) {
        d_data.trackerMode = mode;
        //this.setMouseTracking(d_data.trackerMode == Picker.DisplayMode.AlwaysOn);
      }
    };

    /**
     *
     * @returns {Picker.DisplayMode} Tracker display mode
     */
    this.trackerMode = function () {
      return d_data.trackerMode;
    };

    /**
     * En/disable the picker
     *
     * When enabled is true an event filter is installed for the observed widget, otherwise the event filter is removed.
     * @param {Boolean} enabled true or false
     */
    this.setEnabled = function (enabled) {
      if (d_data.enabled != enabled) {
        d_data.enabled = enabled;

        /*QWidget*/
        var w = self.parentWidget();
        if (w) {
          if (enabled) {
            w.installEventFilter(this);
          } else {
            w.removeEventFilter(this);
          }
        }

        self.updateDisplay();
      }
    };

    /**
     *
     * @returns {Boolean} true when enabled, false otherwise
     */
    this.isEnabled = function () {
      return d_data.enabled;
    };

    /**
     * Sets the font for the tracker
     * @param {Misc.Font} font Tracker font
     */
    this.setTrackerFont = function (font) {
      //if (font != d_data.trackerFont) {
      if (!font.isEqual(d_data.trackerFont)) {
        d_data.trackerFont = font;
        this.updateDisplay();
      }
    };

    /**
     *
     * @returns {Misc.Font} Tracker font
     */
    this.trackerFont = function () {
      return d_data.trackerFont;
    };

    /**
     * Sets the pen for the tracker
     * @param {Misc.Pen} pen Tracker pen
     */
    this.setTrackerPen = function (pen) {
      //if (pen != d_data.trackerPen) {
      if (!pen.isEqual(d_data.trackerPen)) {
        d_data.trackerPen = pen;
        this.updateDisplay();
      }
    };

    /**
     *
     * @returns {Misc.Pen} Tracker pen
     */
    this.trackerPen = function () {
      return d_data.trackerPen;
    };

    /**
     * Sets the pen for the rubberband
     * @param {Misc.Pen} pen Rubber band pen
     */
    this.setRubberBandPen = function (pen) {
      //if (pen != d_data.rubberBandPen) {
      if (!pen.isEqual(d_data.rubberBandPen)) {
        d_data.rubberBandPen = pen;
        this.updateDisplay();
      }
    };

    /**
     *
     * @returns {Misc.Pen} Rubber band pen
     */
    this.rubberBandPen = function () {
      return d_data.rubberBandPen;
    };

    /**
     * Draws a rubber band, depending on rubberBand()
     * @param {PaintUtil.Painter} painter Painter
     */
    this.drawRubberBand = function (painter) {
      if (
        !this.isActive() ||
        this.rubberBand() == Picker.RubberBand.NoRubberBand ||
        this.rubberBandPen().style == Static.NoPen
      ) {
        return;
      }

      /*const QPolygon*/
      var pa = this.adjustedPoints(d_data.pickedPoints);

      var selectionType = PickerMachine.SelectionType.NoSelection;

      if (d_data.stateMachine)
        selectionType = d_data.stateMachine.selectionType();

      switch (selectionType) {
        case PickerMachine.SelectionType.NoSelection:
        case PickerMachine.SelectionType.PointSelection: {
          if (pa.length < 1) return;

          /*const QPoint*/
          var pos = pa[0];

          ///*const QRect*/ var pRect = this.pickArea().boundingRect().toRect();
          /*const QRect*/
          var pRect = this.pickArea();
          switch (this.rubberBand()) {
            case Picker.RubberBand.VLineRubberBand: {
              painter.drawLine(pos.x, pRect.top(), pos.x, pRect.bottom());
              break;
            }
            case Picker.RubberBand.HLineRubberBand: {
              painter.drawLine(pRect.left(), pos.y, pRect.right(), pos.y);
              break;
            }
            case Picker.RubberBand.CrossRubberBand: {
              painter.drawLine(pos.x, pRect.top(), pos.x, pRect.bottom());
              painter.drawLine(pRect.left(), pos.y, pRect.right(), pos.y);
              break;
            }
            default:
              break;
          }
          break;
        }
        case PickerMachine.SelectionType.RectSelection: {
          if (pa.length < 2) return;

          //console.log(pa.toString());
          ///*const QRect*/ var rect = ( pa[0], pa[pa.length-1] ).normalized();
          /*const QRect*/
          var rect = new Misc.Rect(pa[0], pa[pa.length - 1]);
          rect = rect.normalized();
          switch (this.rubberBand()) {
            case Picker.RubberBand.EllipseRubberBand: {
              painter.drawEllipse(rect);
              break;
            }
            case Picker.RubberBand.RectRubberBand: {
              painter.drawRect(rect);
              break;
            }
            default:
              break;
          }
          break;
        }
        case PickerMachine.SelectionType.PolygonSelection: {
          if (pa.length < 2) return;
          if (this.rubberBand() == Picker.RubberBand.PolygonRubberBand) {
            painter.drawPolyline(pa);
            //console.log(pa)
          }
          break;
        }
        default:
          break;
      }
    };

    /**
     * Draws the tracker
     * @param {PaintUtil.Painter} painter Painter
     */
    this.drawTracker = function (painter) {
      var textRect = this.trackerRect(this.trackerFont());
      if (textRect !== null) {
        //this.clearTrackerCanvas();
        var label = this.trackerText(d_data.trackerPosition);
        if (label !== "") {
          //var trackerPainter = new PaintUtil.Painter(trackerCtx);
          //painter.save();
          //trackerPainter.setFont(m_trackerFont);
          //console.log(textRect.left())
          painter.setFont(d_data.trackerFont);
          painter.drawText(label, textRect.left(), textRect.bottom());
          //trackerPainter.save();
        }
        //painter.drawText(label, d_data.trackerPosition.x, d_data.trackerPosition.y, Static.AlignLeft)
      }
    };

    /**
     *
     * @returns {Array<Misc.Point>} Selected points
     */
    this.selection = function () {
      return this.adjustedPoints(d_data.pickedPoints);
    };

    /**
     *
     * @returns {Misc.Point} Current position of the tracker
     */
    this.trackerPosition = function () {
      return d_data.trackerPosition;
    };

    /**
     * Calculate the bounding rectangle for the tracker text from the current position of the tracker
     * @param {Misc.Font} font Font of the tracker text
     * @returns {Misc.Rect} Bounding rectangle of the tracker text
     * @see {@link Picker#trackerPosition trackerPosition()}
     */
    this.trackerRect = function (font) {
      if (this.trackerMode() === Picker.DisplayMode.AlwaysOff) {
        return null;
      }

      if (this.trackerPosition().x < 0 || this.trackerPosition().y < 0)
        return null;

      var text = this.trackerText(this.trackerPosition());

      if (text == "") return null;

      var textSize = font.textSize(text);

      var textRect = new Misc.Rect(
        new Misc.Point(),
        textSize.width,
        textSize.height
      );
      var pos = this.trackerPosition();

      var alignment = 0;

      //if (/*isActive() &&*/ this.trackerPosition().length > 1 && this.rubberBand() != Picker.RubberBand.NoRubberBand) {
      if (
        /*isActive() &&*/ m_pickedPoints.length.length > 1 &&
        this.rubberBand() != Picker.RubberBand.NoRubberBand
      ) {
        var last = m_pickedPoints[0];

        alignment |= pos.x >= last.x ? Static.AlignRight : Static.AlignLeft;
        alignment |= pos.y > last.y ? Static.AlignBottom : Static.AlignTop;
      } else alignment = Static.AlignTop | Static.AlignRight;

      var margin = 5;

      var x = pos.x;
      if (alignment & Static.AlignLeft) x -= textRect.width() + margin;
      else if (alignment & Static.AlignRight) x += margin;

      var y = pos.y;
      if (alignment & Static.AlignBottom) y += margin;
      else if (alignment & Static.AlignTop) y -= textRect.height() + margin;

      textRect.moveTopLeft(new Misc.Point(x, y));

      var pickRect = new Misc.Rect(
        new Misc.Point(),
        this.trackerOverlay().width(),
        this.trackerOverlay().height()
      );
      var right = Math.min(textRect.right(), pickRect.right() - margin);
      var bottom = Math.min(textRect.bottom(), pickRect.bottom() - margin);
      textRect.moveBottomRight(new Misc.Point(right, bottom));

      var left = Math.max(textRect.left(), pickRect.left() + margin);
      var top = Math.max(textRect.top(), pickRect.top() + margin);
      textRect.moveTopLeft(new Misc.Point(left, top));

      return textRect;
    };

    /**
     * Event filter
     *
     * When isEnabled() is true all events of the observed widget are filtered.
     * Mouse and keyboard events are translated into widgetMouse- and widgetKey- and widgetWheel-events. Paint and
     * Resize events are handled to keep rubber band and tracker up to date.
     * @param {HObject} object Object to be filtered
     * @param {Event} event Event
     * @returns {Boolean} Always false.
     */
    this.eventFilter = function (/*QObject*/ object, event) {
      //console.log('eventFilter() called in qwtpicker')
      if (!this.isEnabled()) return false;
      if (object && object == this.parentWidget()) {
        switch (event.type) {
          /*case QEvent::Resize:{
					const QResizeEvent *re = static_cast<QResizeEvent *>( event );


					// Adding/deleting additional event filters inside of an event filter
					//is not safe dues to the implementation in Qt ( changing alist while iterating ).
					//So we create the overlays in a way, that they don't install en event filter
					//( parent set to NULL ) and do the resizing here.

					if ( d_data->trackerOverlay )
					d_data->trackerOverlay->resize( re->size() );

					if ( d_data->rubberBandOverlay )
					d_data->rubberBandOverlay->resize( re->size() );

					if ( d_data->resizeMode == Stretch )
					stretchSelection( re->oldSize(), re->size() );

					updateDisplay();
					break;
					}*/
          //case QEvent::Enter:
          case "mouseenter": {
            this.widgetEnterEvent(event);
            break;
          }
          //case QEvent::Leave:
          case "mouseleave": {
            this.widgetLeaveEvent(event);
            break;
          }
          //case QEvent::MouseButtonPress:
          case mousedownEvent: {
            this.widgetMousePressEvent(event);
            break;
          }
          //case QEvent::MouseButtonRelease:
          case mouseupEvent: {
            this.widgetMouseReleaseEvent(event);
            break;
          }
          //QEvent::MouseButtonClick:
          case "click": {
            this.widgetMouseClickEvent(event);
            break;
          }
          //QEvent::MouseButtonDblClick:
          case "dblclick": {
            this.widgetMouseDoubleClickEvent(event);
            break;
          }
          //case QEvent::MouseMove:
          case mousemoveEvent: {
            //console.log(event.clientX)
            this.widgetMouseMoveEvent(event);
            break;
          }
          //case QEvent::KeyPress:
          case "keydown": {
            this.widgetKeyPressEvent(event);
            break;
          }
          //case QEvent::KeyRelease:
          case "keyup": {
            this.widgetKeyReleaseEvent(event);
            break;
          }
          //case QEvent::Wheel:
          case "mousewheel": {
            this.widgetWheelEvent(event);
            break;
          }
          default:
            break;
        }
      }
      return false;
    };

    /**
     * Passes an event to the state machine and executes the resulting commands. Append and Move commands use the current
     * position of the cursor.
     * @param {Event} event Event
     *
     */
    this.transition = function (event) {
      if (!d_data.stateMachine) return;

      /*const QList<QwtPickerMachine::Command>*/
      var commandList = d_data.stateMachine.transition(this, event);

      var pos;
      switch (event.type) {
        case "click":
        //case QEvent::MouseButtonDblClick:
        case "dblclick":
        case mousedownEvent:
        //case QEvent::MouseButtonRelease:
        case mouseupEvent:
        //case QEvent::MouseMove:
        case mousemoveEvent: {
          var me = event;

          var pos = new Misc.Point(me.clientX, me.clientY);
          //var pos = new Misc.Point(mouseEvent.clientX, mouseEvent.clientY)

          if (Static.isMobile()) {
            pos = new Misc.Point(
              event.originalEvent.changedTouches[0].clientX,
              event.originalEvent.changedTouches[0].clientY
            );
            //pos = new Misc.Point(event.originalEvent.touches[0].clientX, event.originalEvent.touches[0].clientY)
          }

          //pos = this.parentWidget().mapToElement( new Misc.Point(me.clientX, me.clietY) );
          //console.log(me.clientY)
          pos = this.parentWidget().mapToElement(pos);
          break;
        }
        default:
          //pos = this.parentWidget()->mapFromGlobal( QCursor::pos() );
          pos = this.parentWidget().mapToElement(new Misc.Point(0, 0));
      }

      for (var i = 0; i < commandList.length; i++) {
        switch (commandList[i]) {
          case Static.Begin: {
            this.begin();
            break;
          }
          case Static.Append: {
            this.append(pos);
            break;
          }
          case Static.Move: {
            this.move(pos);
            break;
          }
          case Static.Remove: {
            this.remove();
            break;
          }
          case Static.End: {
            this.end();
            break;
          }
        }
      }
    };

    /**
     * Reset the state machine and terminate ( end(false) ) the selection
     */
    this.reset = function () {
      if (d_data.stateMachine) d_data.stateMachine.reset();

      if (this.isActive()) this.end(false);
    };

    /**
     * Append a point to the selection and update rubber band and tracker.
     *
     * The appended() signal is emitted.
     * @param {Misc.Point} pos Additional point
     * @see {@link Picker#isActive isActive()}
     * @see {@link Picker#begin begin()}
     * @see {@link Picker#end end()}
     */
    this.append = function (pos) {
      if (d_data.isActive) {
        d_data.pickedPoints.push(pos);
        this.updateDisplay();
        Static.trigger("appended", pos);
      }
    };

    /**
     * Move the last point of the selection
     *
     * The moved event is emitted.
     * @param {Misc.Point} pos New position
     * @see {@link Picker#isActive isActive()}
     * @see {@link Picker#begin begin()}
     * @see {@link Picker#append append()}
     * @see {@link Picker#end end()}
     */
    this.move = function (/*const QPoint*/ pos) {
      if (d_data.isActive) {
        var idx = d_data.pickedPoints.length - 1;
        if (idx >= 0) {
          if (d_data.pickedPoints[idx] != pos) {
            d_data.pickedPoints[idx] = pos;

            this.updateDisplay();

            //Q_EMIT moved( pos );
            Static.trigger("moved", pos);
          }
        }
      }
    };

    /**
     * Remove the last point of the selection
     *
     * The removed event is triggered.
     * @see {@link Picker#isActive isActive()}
     * @see {@link Picker#begin begin()}
     * @see {@link Picker#append append()}
     * @see {@link Picker#move move()}
     */
    this.remove = function () {
      if (d_data.isActive) {
        var idx = d_data.pickedPoints.length - 1;
        if (idx > 0) {
          //var idx = d_data.pickedPoints.length;

          //var pos = d_data.pickedPoints[idx - 1];
          var pos = d_data.pickedPoints.pop();
          //d_data.pickedPoints.resize( idx - 1 );

          this.updateDisplay();
          Static.trigger("removed", pos);
        }
      }
    };

    /**
     * Validate and fix up the selection
     *
     * Accepts all selections unmodified
     * @param {Array<Misc.Point>} selection Selection to validate and fix up
     * @returns {Boolean} true, when accepted, false otherwise
     */
    this.accept = function (/*QPolygon &*/ selection) {
      return true;
    };

    /**
     * A picker is active between begin() and end().
     * @returns {Boolean} true if the selection is active.
     */
    this.isActive = function () {
      return d_data.isActive;
    };

    /**
     * Return the points, that have been collected so far. The selection() is calculated from the pickedPoints() in adjustedPoints().
     * @returns {Array<Misc.Point>} Picked points
     */
    this.pickedPoints = function () {
      return d_data.pickedPoints;
    };

    /**
     * Sets mouse tracking for the observed widget.
     *
     * In case of enable is true, the previous value is saved, that is restored when enable is false.
     * @param {Boolean} enable
     *
     */
    this.setMouseTracking = function (enable) {
      var widget = this.parentWidget();
      if (!widget) return;

      if (enable) {
        d_data.mouseTracking = widget.hasMouseTracking();
        widget.setMouseTracking(true);
      } else {
        widget.setMouseTracking(d_data.mouseTracking);
      }
    };

    /**
     * Find the area of the observed widget, where selection might happen.
     * @returns {Misc.Rect} widget.contentsRect();
     */
    this.pickArea = function () {
      //QPainterPath path;

      var widget = this.parentWidget();
      if (widget) return widget.contentsRect();
      return null;

      //return path;
    };

    /**
     * Update the state of rubber band and tracker label
     */
    this.updateDisplay = function () {
      /*QWidget*/
      var w = self.parentWidget();

      var showRubberband = false;
      var showTracker = false;

      if (w && w.isVisible() && d_data.enabled) {
        //console.log("self.isActive(): "+self.isActive())
        if (
          self.rubberBand() !== Picker.RubberBand.NoRubberBand &&
          self.isActive() &&
          self.rubberBandPen().style !== Static.NoPen
        ) {
          showRubberband = true;
        }

        if (
          self.trackerMode() == Picker.DisplayMode.AlwaysOn ||
          (self.trackerMode() == Picker.DisplayMode.ActiveOnly &&
            self.isActive())
        ) {
          if (self.trackerPen().color != Static.NoPen) {
            //&& !self.trackerRect( QFont() ).isEmpty() )
            showTracker = true;
          }
        }
      }

      /*QPointer< QwtPickerRubberband >*/
      var rw = d_data.rubberBandOverlay;
      if (showRubberband) {
        //if ( rw.isNull() )
        if (rw == null) {
          //rw = new PickerRubberband( self, null ); // NULL -> no extra event filter
          rw = new PickerRubberband(self, w);
          //console.log("rubberBandOverlay created")
          rw.setObjectName("PickerRubberBand");
          d_data.rubberBandOverlay = rw;
          //rw.setParent( w );
          //rw->resize( w->size() );
        }

        //if ( d_data.rubberBand <= Picker.RubberBand.RectRubberBand )
        //rw->setMaskMode( QwtWidgetOverlay::MaskHint );
        //else
        //rw->setMaskMode( QwtWidgetOverlay::AlphaMask );

        rw.updateOverlay();
      } else {
        /*if ( d_data->openGL ){
				// Qt 4.8 crashes for a delete
				if ( !rw.isNull() ){
				rw->hide();
				rw->deleteLater();
				rw = NULL;
				}
				}
				else{
				delete rw;
				}*/
        if (rw) {
          d_data.rubberBandOverlay.getCanvas().hide();
          delete d_data.rubberBandOverlay.getCanvas();
          d_data.rubberBandOverlay = null;
        }
      }

      /*QPointer< QwtPickerTracker >*/
      var tw = d_data.trackerOverlay;
      if (showTracker) {
        //if ( tw.isNull() )
        if (tw == null) {
          //tw = new PickerTracker( self, null ); // NULL -> no extra event filter
          tw = new PickerTracker(self, w);
          //console.log("trackerOverlay created")
          tw.setObjectName("PickerTracker");
          d_data.trackerOverlay = tw;
          //tw.setParent( w );
          // tw->resize( w->size() );
        }
        tw.setFont(d_data.trackerFont);
        tw.updateOverlay();
      } else {
        /*if ( d_data->openGL ){
				// Qt 4.8 crashes for a delete
				if ( !tw.isNull() ){
				tw->hide();
				tw->deleteLater();
				tw = NULL;
				}
				}*/
        /* else
			{
				delete tw;
				}*/

        if (tw) {
          //d_data.trackerOverlay.clearCanvas()
          //d_data.trackerOverlay = null
          d_data.trackerOverlay.getCanvas().hide();
          delete d_data.trackerOverlay.getCanvas();
          d_data.trackerOverlay = null;
        }
      }
    };

    /**
     *
     * @returns {WidgetOverlay} Overlay displaying the rubber band
     */
    this.rubberBandOverlay = function () {
      return d_data.rubberBandOverlay;
    };

    /**
     *
     * @returns {WidgetOverlay} Overlay displaying the tracker text
     */
    this.trackerOverlay = function () {
      return d_data.trackerOverlay;
    };

    /*this.widgetMouseReleaseEvent = function( mouseEvent ) {
		this.transition( mouseEvent );
		}*/

    if (rubberBand == undefined && trackerMode == undefined)
      this.init(
        parent,
        Picker.RubberBand.NoRubberBand,
        Picker.DisplayMode.AlwaysOff
      );
    else this.init(parent, rubberBand, trackerMode);
  }

  /**
     * Map the pickedPoints() into a selection()
     * 
     * adjustedPoints() maps the points, that have been collected on Widget into a selection(). The default implementation 
     * simply returns the points unmodified. The reason, why a selection() differs from the picked points depends on the 
     * application requirements. e.g. : 
     * 
     * - A rectangular selection might need to have a specific aspect ratio only.
     * 
     * - A selection could accept non intersecting polygons only.
     * 
     * - ...
     * 
     * The example below is for a rectangular selection, where the first point is the center of the selected rectangle.
     * 
            Example
            MyPicker#adjustedPoints(points){
              let adjusted = [];
              if ( points.length == 2 ){
                const width = Math.abs(points[1].x - points[0].x);
                const height = Math.abs(points[1].y - points[0].y);

                const rect = new Misc.Rect(0, 0, 2 * width, 2 * height);
                rect.moveCenter(points[0]);

                adjusted.push(rect.topLeft());
                adjusted.push(rect.bottomRight());
              }
              return adjusted;
            }
     * @param {Array<Misc.Point>} points Selected points
     * @returns {Array<Misc.Point>} Selected points unmodified
     */
  adjustedPoints(points) {
    return points;
  }

  /**
   * Handle a enter event for the observed widget.
   * @param {Event} event event
   */
  widgetEnterEvent(event) {
    this.transition(event);
  }

  /**
   * Handle a leave event for the observed widget.
   * @param {Event} event event
   */
  widgetLeaveEvent(event) {
    this.transition(event);

    this.getPickerData().trackerPosition = new Misc.Point(-1, -1);
    if (!this.isActive()) this.updateDisplay();
  }

  /**
   * Handle a key release event for the observed widget.
   *
   * Passes the event to the state machine.
   * @param {Event} keyEvent Key event
   */
  widgetKeyReleaseEvent(keyEvent) {
    this.transition(keyEvent);
  }

  /**
   * Handle a wheel event for the observed widget.
   *
   * Move the last point of the selection in case of isActive() == true
   * @param {Event} wheelEvent Wheel event
   */
  widgetWheelEvent(wheelEvent) {
    var pos = new Misc.Point(wheelEvent.clientX, wheelEvent.clientY);
    if (this.pickArea().contains(pos))
      this.getPickerData().trackerPosition = pos;
    else this.getPickerData().trackerPosition = new Misc.Point(-1, -1);

    this.updateDisplay();

    this.transition(wheelEvent);
  }

  /**
   * Handle mouse click event for the observed widget.
   * @param {Event} mouseEvent  Mouse event
   */
  widgetMouseClickEvent(mouseEvent) {
    this.transition(mouseEvent);
  }

  /**
   * Handle mouse double click event for the observed widget.
   * @param {Event} mouseEvent  Mouse event
   */
  widgetMouseDoubleClickEvent(mouseEvent) {
    this.transition(mouseEvent);
  }

  /**
   * Handle a mouse move event for the observed widget.
   * @param {Event} mouseEvent  Mouse event
   */
  widgetMouseMoveEvent(mouseEvent) {
    var pos = new Misc.Point(mouseEvent.clientX, mouseEvent.clientY);
    //var pos = new Misc.Point(mouseEvent.clientX, mouseEvent.clientY)

    if (Static.isMobile()) {
      pos = new Misc.Point(
        mouseEvent.originalEvent.changedTouches[0].clientX,
        mouseEvent.originalEvent.changedTouches[0].clientY
      );
      //pos = new Misc.Point(mouseEvent.originalEvent.touches[0].clientX, mouseEvent.originalEvent.touches[0].clientY)
    }
    pos = this.mapToElement(pos);

    if (this.pickArea().contains(pos))
      this.getPickerData().trackerPosition = pos;
    else this.getPickerData().trackerPosition = new Misc.Point(-1, -1);

    if (!this.isActive()) this.updateDisplay();

    this.transition(mouseEvent);
  }

  /**
   * Handle a mouse press event for the observed widget.
   * @param {Event} mouseEvent Mouse event
   */
  widgetMousePressEvent(mouseEvent) {
    this.transition(mouseEvent);
  }

  /* void QwtPicker::widgetKeyPressEvent( QKeyEvent* keyEvent )
 {
     int dx = 0;
     int dy = 0;
  
     int offset = 1;
     if ( keyEvent->isAutoRepeat() )
         offset = 5;
  
     if ( keyMatch( KeyLeft, keyEvent ) )
         dx = -offset;
     else if ( keyMatch( KeyRight, keyEvent ) )
         dx = offset;
     else if ( keyMatch( KeyUp, keyEvent ) )
         dy = -offset;
     else if ( keyMatch( KeyDown, keyEvent ) )
         dy = offset;
     else if ( keyMatch( KeyAbort, keyEvent ) )
     {
         reset();
     }
     else
         transition( keyEvent );
  
     if ( dx != 0 || dy != 0 )
     {
         const QRect rect = pickArea().boundingRect().toRect();
         const QPoint pos = parentWidget()->mapFromGlobal( QCursor::pos() );
  
         int x = pos.x() + dx;
         x = qMax( rect.left(), x );
         x = qMin( rect.right(), x );
  
         int y = pos.y() + dy;
         y = qMax( rect.top(), y );
         y = qMin( rect.bottom(), y );
  
         QCursor::setPos( parentWidget()->mapToGlobal( QPoint( x, y ) ) );
     }
 }
  
 void QwtPicker::widgetKeyReleaseEvent( QKeyEvent* keyEvent )
 {
     transition( keyEvent );
 } */

  /**
   * Handle a key press event for the observed widget.
   *
   * Selections can be completely done by the keyboard. The arrow keys
   * move the cursor, the abort key aborts a selection. All other keys are handled by the current state machine.
   * @param {Event} keyEvent Key event
   */
  widgetKeyPressEvent(keyEvent) {
    var dx = 0;
    var dy = 0;

    var offset = 1;
    // if ( keyEvent->isAutoRepeat() )
    //offset = 5;
    //const Enum = Enumerator.getDefaultEnumNampespace();
    if (this.keyMatch(EventPattern.KeyPatternCode.KeyLeft, keyEvent))
      dx = -offset;
    else if (this.keyMatch(EventPattern.KeyPatternCode.KeyRight, keyEvent))
      dx = offset;
    else if (this.keyMatch(EventPattern.KeyPatternCode.KeyUp, keyEvent))
      dy = -offset;
    else if (this.keyMatch(EventPattern.KeyPatternCode.KeyDown, keyEvent))
      dy = offset;
    else if (this.keyMatch(EventPattern.KeyPatternCode.KeyAbort, keyEvent)) {
      this.reset();
    } else this.transition(keyEvent);

    if (dx !== 0 || dy !== 0) {
      ///*const QRect* rect = pickArea().boundingRect().toRect();
      /*const QRect*/
      var rect = this.pickArea(); //.boundingRect().toRect();
      /*const QPoint*/

      // var pos = this.parentWidget().mapToElement(
      //   new Misc.Point(clientX, clientY)
      // );

      // var x = pos.x + dx;
      // x = Math.max(rect.left(), x);
      // x = Math.min(rect.right(), x);

      // var y = pos.y + dy;
      // y = Math.max(rect.top(), y);
      // y = Math.min(rect.bottom(), y);

      //console.log(dx, dy);

      //QCursor::setPos( parentWidget()->mapToGlobal( QPoint( x, y ) ) );
      ////////////////////////////
      //console.log(keyEvent);
    }
  }

  /**
   * Handle a mouse release event for the observed widget.
   * @param {Event} mouseEvent Mouse event
   */
  widgetMouseReleaseEvent(mouseEvent) {
    this.transition(mouseEvent);
  }

  /**
   * Close a selection setting the state to inactive.
   *
   * The selection is validated and maybe fixed by accept().
   * @param {Boolean} ok If true, complete the selection and trigger a appropriate event
   * @returns {Boolean} true if the selection is accepted, false otherwise
   * @see {@link Picker#isActive isActive()}
   * @see {@link Picker#begin begin()}
   * @see {@link Picker#append append()}
   * @see {@link Picker#move move()}
   * @see {@link Picker#accept accept()}
   */
  end(ok) {
    var d = this.getPickerData();
    if (d.isActive) {
      this.setMouseTracking(false);

      d.isActive = false;

      Static.trigger("activated", false);

      if (this.trackerMode() == Picker.DisplayMode.ActiveOnly)
        d.trackerPosition = new Misc.Point(-1, -1);

      if (ok) ok = this.accept(d.pickedPoints);

      if (
        ok //Static.trigger("selected", d.pickedPoints);
      );
      else d.pickedPoints = [];

      this.updateDisplay();
    } else ok = false;

    return ok;
  }

  /**
   * Open a selection setting the state to active
   * @see {@link Picker#isActive isActive()}
   * @see {@link Picker#end end()}
   * @see {@link Picker#move move()}
   */
  begin() {
    var d = this.getPickerData();
    if (!d) return;
    if (d.isActive) return;

    d.pickedPoints = []; //.resize( 0 );
    d.isActive = true;

    Static.trigger("activated", true);

    if (this.trackerMode() !== Picker.DisplayMode.AlwaysOff) {
      if (d.trackerPosition.x < 0 || d.trackerPosition.y < 0) {
        var w = this.parentWidget();
        if (w)
          //d_data.trackerPosition = w->mapFromGlobal( QCursor::pos() );
          d.trackerPosition = w.mapToElement(new Misc.Point(0, 0));
      }
    }

    this.updateDisplay();
    this.setMouseTracking(true);
  }

  /**
   * Return the label for a position
   *
   * In case of HLineRubberBand the label is the value of the y position, in case of VLineRubberBand the value of the x position.
   * Otherwise the label contains x and y position separated by a ','.
   * @param {Number} pos Position
   * @returns {String} Converted position as string
   */
  trackerText(pos) {
    //pos =  this.invTransform( pos )
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
}

Picker.pickers = [];

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Picker.RubberBand}</div>
 *
 * Rubber band style
 *
 * The default value is Picker.NoRubberBand.
 * @name Picker.RubberBand
 * @readonly
 * @property {Number} NoRubberBand             	No rubberband.
 * @property {Number} HLineRubberBand          	A horizontal line ( only for PickerMachine.SelectionType.PointSelection )
 * @property {Number} VLineRubberBand          	A vertical line ( only for PickerMachine.SelectionType.PointSelection )
 * @property {Number} CrossRubberBand          	A crosshair ( only for PickerMachine.SelectionType.PointSelection )
 * @property {Number} RectRubberBand           	A rectangle ( only for PickerMachine.SelectionType.RectSelection )
 * @property {Number} EllipseRubberBand         An ellipse ( only for PickerMachine.SelectionType.PointSelection )
 * @property {Number} PolygonRubberBand         A polygon line ( only for PickerMachine.SelectionType.PolygonSelection )
 * @property {Number} UserRubberBand         	Values >= UserRubberBand(100) can be used to define additional rubber bands.
 */
Enumerator.enum(
  "RubberBand {\
	NoRubberBand = 0 , HLineRubberBand , VLineRubberBand , CrossRubberBand ,\
	RectRubberBand , EllipseRubberBand , PolygonRubberBand , UserRubberBand = 100\
  }",
  Picker
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Picker.DisplayMode}</div>
 *
 * Display mode.
 * @name Picker.DisplayMode
 * @readonly
 * @property {Number} AlwaysOff               Display never.
 * @property {Number} AlwaysOn                Display always.
 * @property {Number} ActiveOnly              Display only when the selection is active.
 */
Enumerator.enum("DisplayMode { AlwaysOff , AlwaysOn , ActiveOnly }", Picker);
