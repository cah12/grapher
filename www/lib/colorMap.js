"use strict";

class ColorStop {
  constructor(p, c) {
    this.pos;
    this.m_rgb;
    //var r, g, b, a;
    /*this.r
        this.g
        this.b
        this.a*/

    // precalculated values
    //var rStep, gStep, bStep, aStep;
    /*this.r0
        this.g0
        this.b0
        this.a0
        this.posStep;*/

    if (p == undefined) {
      this.pos = 0.0;
      this.m_rgb = 0;
    } else {
      this.pos = p;
      this.m_rgb = c;
      if (c.indexOf("#") !== -1) this.m_rgb = Utility.HTMLToRGB(c);
      this.r = this.m_rgb.r;
      this.g = this.m_rgb.g;
      this.b = this.m_rgb.b;
      this.a = this.m_rgb.a; //qAlpha( rgb );
      if (this.a === undefined) this.a = 255;

      /*
            when mapping a value to rgb we will have to calcualate:
            - const int v = int( ( s1.v0 + ratio * s1.vStep ) + 0.5 );

            Thus adding 0.5 ( for rounding ) can be done in advance
             */
      this.r0 = this.r + 0.5;
      this.g0 = this.g + 0.5;
      this.b0 = this.b + 0.5;
      this.a0 = this.a + 0.5;

      this.rStep = 0.0;
      this.gStep = 0.0;
      this.bStep = 0.0;
      this.aStep = 0.0;
      this.posStep = 0.0;
    }

    this.updateSteps = function (nextStop) {
      this.rStep = nextStop.r - this.r;
      this.gStep = nextStop.g - this.g;
      this.bStep = nextStop.b - this.b;
      this.aStep = nextStop.a - this.a;
      this.posStep = nextStop.pos - this.pos;
    };
  }
}

class ColorStops {
  constructor() {
    var m_doAlpha = false;
    var m_stops = []; //new Array(256);

    this.findUpper = function (pos) {
      var index = 0;
      var n = m_stops.length;

      while (n > 0) {
        var half = n >> 1;
        var middle = index + half;

        if (m_stops[middle].pos <= pos) {
          index = middle + 1;
          n -= half + 1;
        } else n = half;
      }
      return index;
    };

    this.insert = function (pos, color) {
      // Lookups need to be very fast, insertions are not so important.
      // Anyway, a balanced tree is what we need here. TODO ...
      if (color[0] !== "#") color = Utility.colorNameToHex(color);

      if (pos < 0.0 || pos > 1.0) return;

      var index;
      if (m_stops.length == 0) {
        index = 0;
        m_stops.resize(1);
      } else {
        index = this.findUpper(pos);
        if (
          index == m_stops.length ||
          Math.abs(m_stops[index].pos - pos) >= 0.001
        ) {
          m_stops.resize(m_stops.length + 1);
          for (var i = m_stops.length - 1; i > index; i--)
            m_stops[i] = m_stops[i - 1];
        }
      }

      m_stops[index] = new ColorStop(pos, color);
      if (color.alpha != 255) m_doAlpha = true;

      if (index > 0) m_stops[index - 1].updateSteps(m_stops[index]);

      if (index < m_stops.length - 1)
        m_stops[index].updateSteps(m_stops[index + 1]);
    };

    this.rgb = function (mode, pos) {
      if (pos <= 0.0) return m_stops[0].m_rgb;
      if (pos >= 1.0) return m_stops[m_stops.length - 1].m_rgb;

      var index = this.findUpper(pos);
      if (mode == LinearColorMap.Mode.FixedColors) {
        return m_stops[index - 1].m_rgb;
      } else {
        var s1 = m_stops[index - 1];

        var ratio = (pos - s1.pos) / s1.posStep;

        var r = Math.round(s1.r0 + ratio * s1.rStep);
        var g = Math.round(s1.g0 + ratio * s1.gStep);
        var b = Math.round(s1.b0 + ratio * s1.bStep);

        if (m_doAlpha) {
          if (s1.aStep) {
            var a = s1.a0 + ratio * s1.aStep;
            return Utility.mRgba(r, g, b, a);
          } else {
            return Utility.mRgba(r, g, b, s1.a);
          }
        }
        return Utility.mRgb(r, g, b);
      }
    };

    this.stops = function () {
      var positions = new Array(m_stops.length);
      for (var i = 0; i < m_stops.length; i++) positions[i] = m_stops[i].pos;
      return positions;
    };
  }
}

/**
 * ColorMap is an abstract class used to map values into colors.
 *
 * For displaying 3D data on a 2D plane the 3rd dimension is often displayed using
 * colors, like, for example, in a spectrogram. Each color map is optimized to return
 * colors for only one of the following image formats: ColorMap.Format.RGB or ColorMap.Format.Indexed.
 * @abstract
 *
 */
class ColorMap {
  /**
   *
   * @param {ColorMap.Format} [format=ColorMap.Format.RGB] Format of the color map
   */
  constructor(format = ColorMap.Format.RGB) {
    Utility.makeAbstract(this, ColorMap);
    var m_format = format;

    this.format = function () {
      return m_format;
    };

    /**
     * Set the format of the color map
     *
     * @param {ColorMap.Format} format Format of the color map.
     * @inheritdoc
     *
     */
    this.setFormat = function (format) {
      m_format = format;
    };

    /**
     *
     * Map a value of a given interval into a color index.
     *
     * @param {Number} numColors Number of colors
     * @param {Interval} interval Range for all values
     * @param {Number} value Value to map into a color index
     */
    this.colorIndex = function (numColors, interval, value) {
      var width = interval.width();
      if (width <= 0.0) return 0;

      if (value <= interval.minValue()) return 0;

      var maxIndex = numColors - 1;
      if (value >= interval.maxValue()) return maxIndex;

      var v = maxIndex * ((value - interval.minValue()) / width);
      return v + 0.5;
    };

    /**
     * Build and return a color map of 256 colors.
     *
     * The color table is needed for rendering indexed images in combination with using{@link ColorMap#colorIndex colorIndex()}.
     * @param {Interval} interval Range for the values
     * @returns {} A color table, that can be used for a Image
     * @inheritdoc
     *
     */
    this.colorTable = function (interval) {
      var table = new Array(256);
      if (interval.isValid()) {
        var step = interval.width() / (table.length - 1);
        for (var i = 0; i < table.length; i++)
          table[i] = this.rgb(interval, interval.minValue() + step * i);
      }
      return table;
    };

    /**
     * This is a pure virtual method that must be reimplement by the subclass.
     *
     * Maps a value of a given interval into a RGB value.
     *
     * @param {Interval} interval Range for all values.
     * @param {Number} value Value to map into a RGB value.
     * @returns {object} An object such as {red:255, g:0, b:0} represnting a RGB color for the value.
     *
     */
    this.rgb = function (interval, value) {
      //pure virtual method. Makes the class an abstract class
    };
  }
  /**
   *
   * @returns {String} A string representing the object.
   */
  toString() {
    return "[ColorMap]";
  }
}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link ColorMap.Format}</div>
 *
 * Format for color mapping
 * @name ColorMap.Format
 * @readonly
 * @property {Number} RGB               The map is intended to map into RGB values.
 * @property {Number} Indexed           Map values into 8 bit values, that are used as indexes into the color table. Indexed
 *                                      color maps are used to generate ColorMap.Format.Indexed images. The calculation of the
 *                                      color index is usually faster and the resulting image has a lower memory footprint.
 * @see {@link ColorMap#colorIndex colorIndex()}
 * @see {@link ColorMap#colorTable colorTable()}
 *
 */
Enumerator.enum("Format { RGB , Indexed }", ColorMap);

/**
 * Builds a color map from color stops.
 *
 * A color stop is a color at a specific position. The valid range for the positions is [0.0, 1.0]. When mapping a value into
 * a color it is translated into this interval according to mode().
 *
 * @extends ColorMap
 *
 */
class LinearColorMap extends ColorMap {
  /**
   * Build a color map with two stops at 0.0 and 1.0. If one or no arguments are provided, the color at 0.0 and 1.0 is
   * blue and yellow respectively.
   *
   * The overloaded version: <strong><i>LinearColorMap(format = ColorMap.Format.RGB).</i></strong>
   * Thus, you may provide one or no arguments. "#0000FF" and "#FFFF00" are used as color1 and color2 respectively.
   *
   *
   * @param {string|object} [color1]    Color used for the minimum value of the value interval. This could be a string
   *                                  representing a color (e.g "red", "#ff0000", "rgb(255, 0, 0)", etc.) or an object
   *                                  representing a RGB color (e.g. {red:255, g:0, b:0})
   * @param {string|object} [color2]    Color used for the maximum value of the value interval. This could be a string
   *                                  representing a color (e.g "red", "#ff0000", "rgb(255, 0, 0)", etc.) or an object
   *                                  representing a RGB color (e.g. {red:255, g:0, b:0})
   * @param {ColorMap.Format} [format=ColorMap.Format.RGB] 	Preferred format for the color map.
   *
   *
   */
  constructor(color1, color2, format) {
    var singleParam = format == undefined;
    if (singleParam) format = color1;
    super(format);

    var m_colorStops;

    this.m_mode = LinearColorMap.Mode.ScaledColors;

    /**
     * Set the color range
     *
     * Add stops at 0.0 and 1.0.
     * @param {string|object} color1    Color used for the minimum value of the value interval. This could be a string
     *                                  representing a color (e.g "red", "#ff0000", "rgb(255, 0, 0)", etc.) or an object
     *                                  representing a RGB color (e.g. {red:255, g:0, b:0})
     * @param {string|object} color2    Color used for the minimum value of the value interval. This could be a string
     *                                  representing a color (e.g "red", "#ff0000", "rgb(255, 0, 0)", etc.) or an object
     *                                  representing a RGB color (e.g. {red:255, g:0, b:0})
     * @see {@link LinearColorMap#color1 color1()}
     * @see {@link LinearColorMap#color1 color1()}
     */
    this.setColorInterval = function (color1, color2) {
      m_colorStops = new ColorStops();
      m_colorStops.insert(0.0, color1);
      m_colorStops.insert(1.0, color2);
    };

    if (!singleParam) this.setColorInterval(color1, color2);
    else this.setColorInterval("#0000FF", "#FFFF00"); //blue, yellow

    /**
     * Set the mode of the color map
     *
     * FixedColors means the color is calculated from the next lower color stop. ScaledColors means the color is calculated
     * by interpolating the colors of the adjacent stops.
     * @param {LinearColorMap.Mode} mode The mode.
     * @see {@link LinearColorMap#mode mode()}
     */
    this.setMode = function (mode) {
      this.m_mode = mode;
    };

    /**
     *
     * @returns {LinearColorMap.Mode} Mode of the color map
     * @see {@link LinearColorMap#setMode setMode()}
     */
    this.mode = function () {
      return this.m_mode;
    };

    /**
     * Add a color stop
     *
     * The value has to be in the range [0.0, 1.0]. For example, a stop at position 17.0 for a range [10.0,20.0] must be
     * passed as: (17.0 - 10.0) / (20.0 - 10.0)
     * @param {Number} value Value between [0.0, 1.0]
     * @param {string|object} color     Color stop. This could be a string representing a color (e.g "red", "#ff0000",
     *                                  "rgb(255, 0, 0)", etc.) or an object representing a RGB color (e.g. {red:255, g:0, b:0})
     */
    this.addColorStop = function (value, color) {
      if (value >= 0.0 && value <= 1.0) m_colorStops.insert(value, color);
    };

    /**
     *
     * @returns {Array<number>} Positions of color stops in increasing order
     */
    this.colorStops = function () {
      return m_colorStops.stops();
    };

    /**
     *
     * @returns {object}    An object such as {red:255, g:0, b:0} represnting a RGB color that is the first color of the
     *                      color range.
     * @see {@link LinearColorMap#setColorInterval setColorInterval()}
     */
    this.color1 = function () {
      return m_colorStops.rgb(this.m_mode, 0.0);
    };

    /**
     *
     * @returns {object}    An object such as {red:255, g:0, b:0} represnting a RGB color that is the second color of the
     *                      color range.
     * @see {@link LinearColorMap#setColorInterval setColorInterval()}
     */
    this.color2 = function () {
      return m_colorStops.rgb(this.m_mode, 1.0);
    };

    this.rgb = function (interval, value) {
      if (isNaN(value)) return 0; //0u;

      var width = interval.width();
      if (width <= 0.0) return 0; //0u;

      var ratio = (value - interval.minValue()) / width;
      return m_colorStops.rgb(this.m_mode, ratio);
    };

    //Use base class doc.
    this.colorIndex = function (interval, value) {
      var width = interval.width();

      if (isNaN(value) || width <= 0.0 || value <= interval.minValue())
        return 0;

      if (value >= interval.maxValue()) return 255;

      var ratio = (value - interval.minValue()) / width;

      var index;
      if (this.m_mode == LinearColorMap.Mode.FixedColors)
        index = /*static_cast<unsigned char>*/ ratio * 255;
      // always floor
      else index = /*static_cast<unsigned char>*/ ratio * 255 + 0.5;

      return index;
    };
  }
  /**
   * 
   * @returns {String} A string representing the object.
.
   */
  toString() {
    return "[LinearColorMap]";
  }
}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link LinearColorMap.Mode}</div>
 *
 * Mode of color map
 * @name LinearColorMap.Mode
 * @readonly
 * @property {Number} FixedColors             Return the color from the next lower color stop
 * @property {Number} ScaledColors            Interpolating the colors of the adjacent stops.
 * @see {@link LinearColorMap#setMode setMode()}
 */
Enumerator.enum("Mode { FixedColors , ScaledColors }", LinearColorMap);
