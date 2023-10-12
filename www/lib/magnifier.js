"use strict";

/**
 * Magnifier provides zooming, by magnifying in steps.
 *
 * Using Magnifier, a plot can be zoomed in/out in steps using keys, the mouse wheel or moving a mouse button in vertical direction.
 * Together with {@link PlotZoomer} and {@link Panner} it is possible to implement individual and powerful navigation of the plot canvas.
 * @extends HObject
 * @see {@link PlotZoomer}
 * @see {@link Panner}
 * @see {@link Plot}
 */
class Magnifier extends HObject {
  /**
   * Creates a magnifier for the plot.
   * @param {Plot} plot Plot object associated with the magnifier.
   */
  constructor(plot) {
    super();
    var self = this;
    var m_plot = null;
    var m_isEnabled = true;
    var m_wheelFactor = 1.9;
    var m_wheelModifiers = Static.NoModifier;
    var m_mouseFactor = 0.95;
    var m_mouseButton = Static.RightButton;
    var m_mouseButtonModifiers = Static.NoModifier;
    var m_keyFactor = 0.9;
    var m_zoomInKey = 107; //Key_Plus;
    var m_zoomInKeyModifiers = Static.Key_Shift; //Static.NoModifier;
    var m_zoomOutKey = 109; //Key_Minus;
    var m_zoomOutKeyModifiers = Static.Key_Shift; //Static.NoModifier;
    var m_mousePressed = false;
    var m_zoomInKeyModifiersEnabled = false;
    var m_zoomOutKeyModifiersEnabled = false;
    var initialPosX = 0;
    var initialPosY = 0;
    var tm = 0;
    var m_isAxisEnabled = [];

    for (var axis = 0; axis < Axis.AxisId.axisCnt; axis++)
      m_isAxisEnabled[axis] = true;

    m_isAxisEnabled[1] = false;
    m_isAxisEnabled[3] = false;

    /**
     * Disable an axis.
     * Only Axes that are enabled will be zoomed. All other axes will remain unchanged.
     * @see {@link Magnifier#isAxisEnabled isAxisEnabled()}
     * @param {Axis.AxisId} axis Axis
     * @param {boolean} on On/Off
     */
    this.setAxisEnabled = function (axis, on) {
      if (axis >= 0 && axis < Axis.AxisId.axisCnt) m_isAxisEnabled[axis] = on;
    };

    /**
     * Test if an axis is enabled
     * @param {Axis.AxisId} axis Axis
     * @returns {boolean} true, if the axis is enabled.
     */
    this.isAxisEnabled = function (axis) {
      if (axis >= 0 && axis < Axis.AxisId.axisCnt) return m_isAxisEnabled[axis];
      return true;
    };

    if (typeof plot !== "undefined") {
      plot.magnifier = this;
      m_plot = plot;
      this.setElement(m_plot.getLayout().getCentralDiv());
    }

    /**
     *
     * @returns {Plot} Plot, containing the observed plot canvas.
     */
    this.plot = function () {
      return m_plot;
    };

    /**
     * Change the wheel factor.
     * The wheel factor defines the ratio between the current range
     * on the parent widget and the zoomed range for each
     * step of the wheel. Use values > 1 for magnification (i.e. 2.0)
     * and values < 1 for scaling down (i.e. 1/2.0 = 0.5).
     * You can use this feature for inverting the direction of the wheel.
     * The default value is 0.9.
     * @see {@link Magnifier#wheelFactor wheelFactor()},
     * {@link Magnifier#setMouseFactor setMouseFactor()} and
     * {@link Magnifier#setKeyFactor setKeyFactor()}
     * @param {number} factor Wheel factor
     */
    this.setWheelFactor = function (factor) {
      m_wheelFactor = factor;
    };

    /**
     *
     * @returns {number}  Wheel factor.
     * @see {@link Magnifier#setWheelFactor setWheelFactor()}
     */
    this.wheelFactor = function () {
      return m_wheelFactor;
    };

    /**
     *
     * @param {number} modifiers Keyboard modifiers. Use the bitwise OR operator as
     * necessary (e.g Static.ShiftModifier | Static.ControlModifier
     * indicates SHIFT and CTRL keys pressed).
     */
    this.setWheelModifiers = function (modifiers) {
      m_wheelModifiers = modifiers;
    };

    /**
     *
     * @returns {number} Wheel modifiers
     */
    this.wheelModifiers = function () {
      return m_wheelModifiers;
    };

    /**
     * Change the mouse factor. The mouse factor defines the ratio
     * between the current range on the parent widget
     * and the zoomed range for each vertical mouse movement.
     * The default value is 0.95.
     * @see {@link Magnifier#mouseFactor mouseFactor()},
     * {@link Magnifier#setMouseButton setMouseButton()},
     * {@link Magnifier#setWheelFactor setWheelFactor()} and
     * {@link Magnifier#setKeyFactor setKeyFactor()}
     * @param {number} factor Mouse factor
     */
    this.setMouseFactor = function (factor) {
      m_mouseFactor = factor;
    };

    /**
     *
     * @returns {number} Mouse factor
     * @see {@link  Magnifier#setMouseFactor setMouseFactor()}
     */
    this.mouseFactor = function () {
      return m_mouseFactor;
    };

    /**
     * Assign the mouse button, that is used for zooming in/out.
     * The default value is Qt::RightButton.
     * @param {number} button
     * @param {number} modifiers Keyboard modifiers
     * @see {@link Magnifier#getMouseButton getMouseButton()}
     */
    this.setMouseButton = function (button, modifiers) {
      m_mouseButton = button;
      m_mouseButtonModifiers = modifiers;
    };

    /**
     *
     * @returns {object} object containing button and modifiers
     */
    this.getMouseButton = function () {
      return {
        button: m_mouseButton,
        modifiers: m_mouseButtonModifiers,
      };
    };

    /**
     * Change the key factor. The key factor defines the ratio between
     * the current range on the parent widget and the zoomed
     * range for each key press of the zoom in/out keys.
     * The default value is 0.9.
     * @see {@link Magnifier#keyFactor keyFactor()},
     * {@link Magnifier#setZoomInKey setZoomInKey()},
     * {@link Magnifier#setZoomOutKey setZoomOutKey()},
     * {@link Magnifier#setWheelFactor setWheelFactor()} and
     * {@link Magnifier#setMouseFactor setMouseFactor()}
     * @param {number} factor Key factor
     */
    this.setKeyFactor = function (factor) {
      m_keyFactor = factor;
    };

    /**
     *
     * @returns {number} Key factor
     */
    this.keyFactor = function () {
      return m_keyFactor;
    };

    /**
     * Assign the key, that is used for zooming in. The default
     * combination is Qt::Key_Plus + Qt::NoModifier.
     * @see {@link Magnifier#getZoomInKey getZoomInKey()} and
     * {@link Magnifier#setZoomInKey setZoomInKey()}
     * @param {number} key
     * @param {number} modifiers
     */
    this.setZoomInKey = function (key, modifiers) {
      m_zoomInKey = key;
      m_zoomInKeyModifiers = modifiers;
    };

    /**
     * Retrieve the settings of the zoom in key
     * @see {@link Magnifier#setZoomInKey setZoomInKey()}
     * @returns {object}
     */
    this.getZoomInKey = function () {
      return {
        key: m_zoomInKey,
        modifiers: m_zoomInKeyModifiers,
      };
    };

    /**
     * Assign the key that is used for zooming out. The default combination
     * is Qt::Key_Minus + Qt::NoModifier.
     * @param {number} key
     * @param {number} modifiers
     * @see {@link Magnifier#getZoomOutKey getZoomOutKey()} and
     * {@link Magnifier#setZoomOutKey setZoomOutKey()}
     */
    this.setZoomOutKey = function (key, modifiers) {
      m_zoomOutKey = key;
      m_zoomOutKeyModifiers = modifiers;
    };

    /**
     * Retrieve the settings of the zoom out key.
     * @see {@link Magnifier#setZoomOutKey setZoomOutKey()}
     * @returns {object}
     */
    this.getZoomOutKey = function () {
      return {
        key: m_zoomOutKey,
        modifiers: m_zoomOutKeyModifiers,
      };
    };

    // /**
    //  * When enabled, mouse and keyboard events are monitored.
    //  * @param {Boolean} on true / false
    //  * @see {@link Magnifier#isEnabled isEnabled()}
    //  */
    // this.setEnabled = function (on) {
    //   m_isEnabled = on;
    // };

    // /**
    //  *
    //  * @returns {boolean} true / false
    //  * @see {@link Magnifier#setEnabled setEnabled()}
    //  */
    // this.isEnabled = function () {
    //   return m_isEnabled;
    // };

    //Documented in base class
    this.event = function (event) {
      if (!m_isEnabled) return;
      switch (event.type) {
        case "mousedown":
          {
            if (this.plot() == null) {
              return true;
            }
            if (event.button !== m_mouseButton) {
              return true;
            }
            initialPosX = event.clientX;
            initialPosY = event.clientY;
            m_mousePressed = true;
            return true;
          }
          break;
        case "mouseup":
          {
            if (
              event.button === m_mouseButton &&
              m_mousePressed &&
              this.plot()
            ) {
              m_mousePressed = false;
            }
          }
          break;
        case "mousemove":
          {
            if (!m_mousePressed) return;
            var dy = event.clientY - initialPosY;
            if (dy != 0) {
              var f = m_mouseFactor;
              if (dy < 0) f = 1 / f;
              this.rescale(f);
            }
            initialPosX = event.clientX;
            initialPosY = event.clientY;
          }
          break;
        case "keydown":
          {
            if (event.keyCode == m_zoomInKeyModifiers) {
              m_zoomInKeyModifiersEnabled = true;
            }
            if (event.keyCode == m_zoomOutKeyModifiers) {
              m_zoomOutKeyModifiersEnabled = true;
            }
            if (event.keyCode == m_zoomInKey && m_zoomInKeyModifiersEnabled) {
              this.rescale(m_keyFactor);
            } else if (
              event.keyCode == m_zoomOutKey &&
              m_zoomOutKeyModifiersEnabled
            ) {
              this.rescale(1.0 / m_keyFactor);
            }
          }
          break;
        case "keyup":
          {
            if (event.keyCode == m_zoomInKeyModifiers) {
              m_zoomInKeyModifiersEnabled = false;
            }
            if (event.keyCode == m_zoomOutKeyModifiers) {
              m_zoomOutKeyModifiersEnabled = false;
            }
          }
          break;
        case "mousewheel":
          {
            if (m_wheelFactor != 0.0) {
              var f = Math.pow(m_wheelFactor, Math.abs(event.deltaY / 15));
              if (event.deltaY > 0) f = 1 / f;
              this.rescale(f);
            }
          }
          break;
        default:
        // code block
      }
    };

    /**
     * Zoom in/out the axes scales
     * @param {number} factor
     * @returns {(void|boolean)} If boolean, false.
     */
    this.rescale = function (factor) {
      var plt = this.plot();
      if (plt == null) return;
      factor = Math.abs(factor);
      if (factor == 1.0 || factor == 0.0) return;
      var doReplot = false;
      var autoReplot = plt.autoReplot();
      plt.setAutoReplot(false);
      clearTimeout(tm);
      Static.trigger("magnifyingStart");

      for (var axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++) {
        var scaleDiv = this.plot().axisScaleDiv(axisId);
        if (this.isAxisEnabled(axisId)) {
          var scaleEngine = this.plot().axisScaleEngine(axisId);
          var center, width_2, lower, upper;
          //Static.mLog = function(base, value)
          if (scaleEngine instanceof LogScaleEngine) {
            center =
              (Static.mLog(scaleEngine.base(), scaleDiv.lowerBound()) +
                Static.mLog(scaleEngine.base(), scaleDiv.upperBound())) /
              2;
            width_2 =
              ((Static.mLog(scaleEngine.base(), scaleDiv.upperBound()) -
                Static.mLog(scaleEngine.base(), scaleDiv.lowerBound())) /
                2) *
              factor;
            lower = Math.pow(scaleEngine.base(), center - width_2);
            upper = Math.pow(scaleEngine.base(), center + width_2);
          } else {
            center = scaleDiv.lowerBound() + scaleDiv.range() / 2;
            width_2 = (scaleDiv.range() / 2) * factor;
            lower = center - width_2;
            upper = center + width_2;
          }
          plt.setAxisScale(axisId, lower, upper);
          doReplot = true;
        }
      }
      //Ensure "magnifyingEnd" event is not triggered if rescaling is occurs within 100ms.
      tm = setTimeout(function () {
        //Static.trigger("magnifyingEnd");
        Static.trigger("magnifyingEnd");
      }, 100);
      //plt.setAxesAutoScale(false);
      plt.setAutoReplot(autoReplot);
      plt.autoRefresh();
      return false;
    };

    //Enable the object. Turn on envent monitoring.
    this.setEnabled_1(true);

    /**
     *
     * @returns {string} a string representing the object.
     */
    this.toString = function () {
      return "[Magnifier]";
    };
  }
}
