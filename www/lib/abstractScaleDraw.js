"use strict";

/**
 * An abstract base class for drawing scales. It can be used to draw linear or logarithmic scales.
 * After a scale division has been specified as a {@link ScaleDiv} object, using setScaleDiv(), the scale can be drawn
 * with the{@link AbstractScaleDraw#draw draw()}member.
 * @see {@link AbstractScaleDraw#enableComponent enableComponent()}
 * @see {@link AbstractScaleDraw#hasComponent hasComponent()}
 *
 * @tutorial Tutorial_1
 *
 *
 */
class AbstractScaleDraw {
  constructor() {
    Utility.makeAbstract(this, AbstractScaleDraw);

    const Enum = Enumerator.getDefaultEnumNampespace();

    var m_components =
      AbstractScaleDraw.ScaleComponent.Backbone |
      AbstractScaleDraw.ScaleComponent.Ticks |
      AbstractScaleDraw.ScaleComponent.Labels;
    var m_tickLength = [];
    m_tickLength[ScaleDiv.TickType.MinorTick] = 4.0;
    m_tickLength[ScaleDiv.TickType.MediumTick] = 6.0;
    m_tickLength[ScaleDiv.TickType.MajorTick] = 8.0;
    var m_map = new ScaleMap();
    var m_scaleDiv = null;

    var m_decimalPlaces = 4; //For calculations only
    var m_precision = 4; //For display

    var m_spacing = 4;
    var m_penWidth = 1;
    this.data = {}; //any useful data can be stored here.

    /**
     * Get the number precison.
     * @returns {Number} Number precision
     * @see {@link AbstractScaleDraw#setPrecision setPrecision()}
     */
    this.precision = function () {
      return m_precision;
    };

    /**
     * Sets the number precison.
     * @param {Number} numberOfDigits The desired precision
     * @see {@link Utility.toPrecision Utility.toPrecision()}
     * @see {@link AbstractScaleDraw#precision precision()}
     */
    this.setPrecision = function (numberOfDigits) {
      m_precision = numberOfDigits;
    };

    /**
     * Get the number decimal places.
     * @returns {Number} Number decimal places
     * @see {@link AbstractScaleDraw#setDecimalPlaces setDecimalPlaces()}
     */
    this.decimalPlaces = function () {
      return m_decimalPlaces;
    };

    /**
     * Sets the number decimal places.
     * @param {Number} places
     * @see {@link AbstractScaleDraw#decimalPlaces decimalPlaces()}
     */
    this.setDecimalPlaces = function (places) {
      m_decimalPlaces = places;
    };

    /**
     * Get the character count of the longest label.
     * @returns {Number} Number of charaters in longest label.
     */
    this.longestLabel = function () {
      var m_longestLabel = "";
      var majorTicks = m_scaleDiv.ticks(ScaleDiv.TickType.MajorTick);
      if (majorTicks) {
        majorTicks.forEach(function (tick, i) {
          if (i !== 0 && i !== majorTicks.length - 1) {
            //the first and last tick label are not drawn
            if (m_scaleDiv.contains(tick)) {
              tick = Utility.toPrecision(tick, m_precision);
              //if (tick > m_nonExponentNotationUpperLimit || tick < m_nonExponentNotationLowerLimit)
              //tick = parseFloat(tick).toExponential(m_decimalPlaces);
              if (tick.toString().length > m_longestLabel.length)
                m_longestLabel = tick.toString();
            }
          }
        });
      }
      return m_longestLabel;
    };

    /**
     * En/Disable a component of the scale
     * @param {AbstractScaleDraw.ScaleComponent} component
     * @param {Boolean} enable On/Off
     * @see {@link AbstractScaleDraw#hasComponent hasComponent()}
     */
    this.enableComponent = function (component, enable) {
      if (enable) m_components |= component;
      else m_components &= ~component;
    };

    /**
     * Check if a component is enabled
     * @param {AbstractScaleDraw.ScaleComponent} component Component type
     * @returns {Boolean} true, when component is enabled
     * @see {@link AbstractScaleDraw#enableComponent enableComponent()}
     */
    this.hasComponent = function (component) {
      return m_components & component;
    };

    /**
     * Change the scale division
     * @param {ScaleDiv} scaleDiv New scale division
     */
    this.setScaleDiv = function (scaleDiv) {
      m_scaleDiv = scaleDiv;
      m_map.setScaleInterval(m_scaleDiv.lowerBound(), m_scaleDiv.upperBound());
      //d_data->labelCache.clear();
    };

    /**
     * Change the transformation of the scale
     * @param {Transform} trans New scale transformation
     */
    this.setTransformation = function (trans) {
      m_map.setTransformation(trans);
    };

    /**
     *
     * @returns {ScaleMap} Map how to translate between scale and pixel values
     */
    this.scaleMap = function () {
      return m_map;
    };

    /**
     *
     * @returns {ScaleDiv} scale division
     */
    this.scaleDiv = function () {
      return m_scaleDiv;
    };

    /**
     * Specify the width of the scale pen
     * @param {Number} width Pen width
     * @see {@link AbstractScaleDraw#penWidth penWidth()}
     */
    this.setPenWidth = function (width) {
      if (width <= 0) width = 1;

      if (width !== m_penWidth) m_penWidth = width;
    };

    /**
     * @returns {Number} Scale pen width
     * @see {@link AbstractScaleDraw#setPenWidth setPenWidth()}
     */
    this.penWidth = function () {
      return m_penWidth;
    };

    /**
     * Draw the scale
     * @param {PaintUtil.Painter } painter The painter
     */
    this.draw = function (painter) {
      if (this.orientation() === Static.Horizontal)
        m_map.setPaintInterval(0, painter.canvasWidth());
      else m_map.setPaintInterval(painter.canvasHeight(), 0);
      if (this.hasComponent(AbstractScaleDraw.ScaleComponent.Labels)) {
        var majorTicks = m_scaleDiv.ticks(ScaleDiv.TickType.MajorTick);
        for (var i = 0; i < majorTicks.length; i++) {
          var v = majorTicks[i];
          if (m_scaleDiv.contains(v)) this.drawLabel(painter, v);
        }
      }
      if (this.hasComponent(AbstractScaleDraw.ScaleComponent.Ticks)) {
        painter.save();
        painter.setPen(new Misc.Pen("grey", m_penWidth));
        for (
          var tickType = ScaleDiv.TickType.MinorTick;
          tickType < ScaleDiv.TickType.NTickTypes;
          tickType++
        ) {
          var ticks = m_scaleDiv.ticks(tickType);
          for (i = 0; i < ticks.length; i++) {
            var v = ticks[i];
            if (m_scaleDiv.contains(v))
              this.drawTick(painter, v, m_tickLength[tickType]);
          }
        }
        painter.restore();
      }
      if (this.hasComponent(AbstractScaleDraw.ScaleComponent.Backbone)) {
        painter.save();
        painter.setPen(new Misc.Pen("grey", m_penWidth));
        this.drawBackbone(painter);
        painter.restore();
      }
    };

    /**
     * Set the spacing between tick and labels
     *
     * The spacing is the distance between ticks and labels. The default spacing is 4 pixels.
     * @param {Number} spacing Spacing
     * @see {@link AbstractScaleDraw#spacing spacing()}
     */
    this.setSpacing = function (spacing) {
      if (spacing < 0) spacing = 0;

      m_spacing = spacing;
    };

    /**
     * Get the spacing
     * The spacing is the distance between ticks and labels. The default spacing is 4 pixels.         *
     * @returns {Number} Spacing
     * @see {@link AbstractScaleDraw#setSpacing setSpacing()}
     */
    this.spacing = function () {
      return m_spacing;
    };

    /**
     * Set the length of the ticks
     * @param {ScaleDiv.TickType} tickType Tick type
     * @param {Number} length New length
     */
    this.setTickLength = function (tickType, length) {
      if (
        tickType < ScaleDiv.TickType.MinorTick ||
        tickType > ScaleDiv.TickType.MajorTick
      ) {
        return;
      }
      if (length < 0.0) length = 0.0;
      var maxTickLen = 1000.0;
      if (length > maxTickLen) length = maxTickLen;
      m_tickLength[tickType] = length;
    };

    /**
     * Returns Length of the ticks
     * @param {ScaleDiv.TickType} tickType
     * @returns {Number} tick length
     * @see {@link AbstractScaleDraw#setTickLength setTickLength()}
     * @see {@link AbstractScaleDraw#maxTickLength maxTickLength()}
     */
    this.tickLength = function (tickType) {
      if (
        tickType < ScaleDiv.TickType.MinorTick ||
        tickType > ScaleDiv.TickType.MajorTick
      ) {
        return 0;
      }
      return m_tickLength[tickType];
    };

    /**
     * Returns the length of the longest tick. Useful for layout calculations.
     * @returns {Number}
     * @see {@link AbstractScaleDraw#tickLength tickLength()}
     * @see {@link AbstractScaleDraw#setTickLength setTickLength()}
     */
    this.maxTickLength = function () {
      var length = 0.0;
      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++)
        length = Math.max(length, m_tickLength[i]);

      return length;
    };

    /**
     * Convert a value into its representing label. The value is converted to a plain text using Number.toLocaleString()
     *
     * @param {Number} value Value
     * @returns {String} Label string.
     */
    this.label = function (value) {
      if (Utility.mFuzzyCompare(value, Static._eps))
        //DELETED
        value = 0.0;
      return value.toString();
      //return parseFloat(value).toLocaleString(Static.getFullLangCode());
      //return parseFloat(value).toLocaleString();
    };

    /**
     * 
     * @returns {String} A string representing the object.
.
     */
    this.toString = function () {
      return "[AbstractScaleDraw]";
    };
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link AbstractScaleDraw.ScaleComponent}</div>
 *
 * Components of a scale.
 * @name AbstractScaleDraw.ScaleComponent
 * @readonly
 * @property {Number} Backbone    The line where the ticks are located = 0x01
 * @property {Number} Ticks       Ticks                                = 0x02
 * @property {Number} Labels      Labels                               = 0x04
 */
Enumerator.enum(
  "ScaleComponent { Backbone = 0x01 , Ticks = 0x02 , Labels = 0x04 }",
  AbstractScaleDraw
);
