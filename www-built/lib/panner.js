
/**
 * Panner provides panning of a widget.
 *
 * Panner grabs the contents of a widget, that can be dragged in all directions. During dragging, all plotItems are move by the
 * computed offset (deltaX, deltaY). When dragging stops, new scales are calculated to account for the offset and
 * plotitems are re-drawn. Areas, that are not part of content are not painted while panning. This makes
 * panning fast enough for widgets, where repaints are too slow for mouse movements.
 * @extends HObject
 */
class Panner extends HObject {
  /**
   * Creates an panner that is enabled for the left mouse button.
   * @param {Plot} plot Parent widget to be panned
   */
  constructor(plot) {
    super();

    var self = this;
    var m_plot = null;
    var m_mouseButton = Static.LeftButton;
    var buttonModifiers = Static.NoModifier;

    var abortKey = Static.Key_Escape;
    var abortKeyModifiers = Static.NoModifier;

    var initialPosX = 0;
    var initialPosY = 0;
    var posX = 0;
    var posY = 0;

    var m_enabled = false;

    var m_canvas = null;

    var m_mouseDown = false;

    var m_cursor = "";
    var m_restoreCursor = "";
    var m_hasCursor = false;
    var m_orientations = Static.Vertical | Static.Horizontal;

    var deltaX = 0;
    var deltaY = 0;

    if (typeof plot !== "undefined") {
      plot.panner = this;
      m_plot = plot;
    }

    /**
     *
     * @returns {Plot} Plot associated with the Panner
     */
    this.plot = function () {
      return m_plot;
    };

    /**
     * Change the mouse button and modifiers used for panning
     * @param {Number} btn button id (e.g. Static.LeftButton, Static.RightButton, Static.MidButton)
     * @param {Number} modifiers=Static.NoModifier Modifiers (e.g. Static.ShiftModifier, Static.ControlModifier, Static.AltModifier).
     *
     * Modifiers can be combined (e.g. Static.ShiftModifier|Static.ControlModifier)
     */
    this.setMouseButton = function (btn, modifiers = Static.NoModifier) {
      m_mouseButton = btn;
      buttonModifiers = modifiers;
    };

    /**
     *
     * @returns {object} Get mouse button and modifiers used for panning. The returned object has two properties: button and modifiers.
     */
    this.getMouseButton = function () {
      return { button: m_mouseButton, modifiers: buttonModifiers };
    };

    /**
     * Set the orientations, where panning is enabled
     *
     * The default value is in both directions: Static.Vertical | Static.Horizontal
     * @param {Number} orientation
     */
    this.setOrientation = function (orientation) {
      m_orientations = orientation;
    };

    function movePlotItems() {
      var itemStore = self.plot().plotItemStore();
      for (var i = 0; i < itemStore.length; ++i) {
        var c = itemStore[i].getCanvas();
        c.css("left", deltaX);
        c.css("top", deltaY);
      }
    }

    /**
     * Calculate new scales to account for the offset and redraw plotitems in accordance with the new scales.
     * @param {Number} _deltaX X offset in paint coodinate
     * @param {Number} _deltaY Y offset in paint coodinate
     */
    this.rescaleAndRedraw = function (_deltaX, _deltaY) {
      var itemStore = self.plot().plotItemStore();
      for (var i = 0; i < itemStore.length; ++i) {
        var c = itemStore[i].getCanvas();
        c.css("left", 0);
        c.css("top", 0);
      }
      var doReplot = false;
      var autoReplot = m_plot.autoReplot();
      m_plot.setAutoReplot(false);
      var rescaled = false;
      for (var axis = 0; axis < Axis.AxisId.axisCnt; axis++) {
        var map = self.plot().canvasMap(axis);
        var p1 = map.transform(self.plot().axisScaleDiv(axis).lowerBound());
        var p2 = map.transform(self.plot().axisScaleDiv(axis).upperBound());
        var d1, d2;

        if (axis == Axis.AxisId.xBottom || axis == Axis.AxisId.xTop) {
          d1 = map.invTransform(p1 - _deltaX);
          d2 = map.invTransform(p2 - _deltaX);
        } else {
          d1 = map.invTransform(p1 - _deltaY);
          d2 = map.invTransform(p2 - _deltaY);
        }
        //this.setAxisScale(axis, d1, d2);
        this.plot().setAxisScale(axis, d1, d2);

        doReplot = true;
      }

      m_plot.setAutoReplot(autoReplot);
      m_plot.autoRefresh();
    };

    const showCursor = function (on) {
      if (on == m_hasCursor) return;

      if (self.plot() == null || m_cursor == "") return;

      m_hasCursor = on;

      if (on) {
        if (self.plot().isCursorSet()) {
          m_restoreCursor = self.plot().cursor();
        }
        self.plot().setCursor(m_cursor);
      } else {
        if (m_restoreCursor !== "") {
          self.plot().setCursor(m_restoreCursor);
          m_restoreCursor = "";
        } else self.plot().unsetCursor();
      }
    };

    /**
     * Sets the cursor that is active during panning
     * @param {String} cursor valid html cursor string
     */
    this.setCursor = function (cursor) {
      m_cursor = cursor;
    };

    /**
     *
     * @returns {String} Cursor that is active while panning
     */
    this.cursor = function () {
      if (m_cursor != "") return m_cursor;

      if (this.plot() != null) return this.plot().cursor();

      return "";
    };

    if (this.plot()) this.setEnabled_1(true);

    /**
     * En/disable the panner
     *
     * When enabled is true an event filter is installed for the observed widget, otherwise the event filter is removed.
     * @param {Boolean} enabled rue or false
     */
    this.setEnabled = function (enabled) {
      if (m_enabled != enabled) {
        m_enabled = enabled;

        /*QWidget*/
        var w = plot.getCentralWidget();
        if (w) {
          if (enabled) {
            //w.setEnabled_1(true)
            w.installEventFilter(this);
          } else {
            w.removeEventFilter(this);
          }
        }
      }
    };

    /**
     *
     * @returns {Boolean} true, if panner is enabled
     */
    this.isEnabled = function () {
      return m_enabled;
    };

    /**
     * Handle a mouse press event for the observed widget.
     * @param {Event} event Mouse press
     */
    this.widgetMousePressEvent = function (event) {
      var isMobile = Static.isMobile();

      if (!isMobile) {
        if (
          event.button != m_mouseButton ||
          Utility.modifiers(event) !== buttonModifiers
        )
          return true;
      }

      if (isMobile) {
        initialPosX = event.originalEvent.touches[0].clientX;
        initialPosY = event.originalEvent.touches[0].clientY;
        m_mouseDown = true;
      } else {
        initialPosX = event.clientX;
        initialPosY = event.clientY;
        m_mouseDown = true;
      }

      showCursor(true);
      //return true
      return true;
    };

    /**
     * Handle a mouse up event for the observed widget.
     * @param {Event} event Mouse up
     */
    this.widgetMouseUpEvent = function (event) {
      if (!m_mouseDown) return;
      m_mouseDown = false;
      showCursor(false);
      if (deltaX != 0 || deltaY != 0) {
        self.rescaleAndRedraw(deltaX, deltaY);
        deltaX = 0;
        deltaY = 0;
      }

      // return true
    };

    /**
     * Handle a mouse move event for the observed widget.
     * @param {Event} event Mouse event
     */
    this.widgetMouseMoveEvent = function (event) {
      if (m_mouseDown) {
        if (!Static.isMobile()) {
          deltaX = event.clientX - initialPosX;
          deltaY = event.clientY - initialPosY;
        } else {
          var touchobj = event.originalEvent.changedTouches[0]; // reference first touch point for this event
          deltaX = parseInt(touchobj.clientX) - initialPosX;
          deltaY = parseInt(touchobj.clientY) - initialPosY;
        }
        if (m_orientations == Static.Vertical) deltaX = 0;
        if (m_orientations == Static.Horizontal) deltaY = 0;
        movePlotItems(/*deltaX, deltaY*/);
      }
      // return true;
    };
    Static.trigger("pannerAdded", this);
    this.setEnabled(true);
  }

  // setAxisScale(axis, d1, d2) {
  //   this.plot().setAxisScale(axis, d1, d2);
  // }

  /**
   * Event filter.
   *
   * When {@link Panner#isEnabled isEnabled()} is true mouse events of the observed widget are filtered.
   * @param {HObject} watched Object to be filtered
   * @param {Event} event Event
   */
  eventFilter(watched, event) {
    if (!this.isEnabled()) return;
    var mt = false;
    switch (event.type) {
      case "mousedown":
      case "touchstart":
        {
          this.widgetMousePressEvent(event);
        }
        break;
      case "mousemove":
      case "touchmove":
        this.widgetMouseMoveEvent(event);
        break;
      case "mouseleave":
        this.widgetMouseUpEvent(event);
        break;
      case "mouseup":
      case "touchend":
        {
          this.widgetMouseUpEvent(event);
        }
        break;
      default:
      // code block
    }
  }

  /**
   *
   * @returns A string representing the object.
   */
  toString() {
    return "[Panner]";
  }
}
