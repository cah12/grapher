"use strict";

/**
 * Base class for all type of plot canvases.
 * @abstract
 *
 */
class AbstractCanvas {
  constructor(parentDiv) {
    Utility.makeAbstract(this, AbstractCanvas);
    var m_frameStyle = "none"; //Any valid CSS border-style property
    var m_lineWidth = 0;
    var m_lineColor = "#000000";
    var m_borderRadius = 0;
    var m_color = "#000000";
    var m_parentDiv = parentDiv;

    /**
     * Sets the witdth of the canvas borders.
     * @param {Number} width The width.
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setLineWidth = function (width) {
      m_lineWidth = width;
      //if (m_lineWidth)
      m_parentDiv.css("border-width", m_lineWidth);
      return this; //for chaining
    };

    /**
     * Sets the color of the canvas borders.
     * @param {(Number|String)} red This could be a number between [0-255] representing the red in a RGB color or a string such as "red" or "#ff0000" representing a color. If it is a string, other arguments may be omitted.
     * @param {(Number|undefined)} green If the first argument is a number, this argument is required. It is integer between 0-255 representing green in RGB color.
     * @param {(Number|undefined)} blue If the first argument is a number, this argument is required. It is integer between 0-255 representing blue in RGB color.
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setLineColor = function (red, green, blue) {
      if (typeof red == "number") {
        m_lineColor = Utility.RGB2HTML(red, green, blue);
      } else if (typeof red == "string") {
        m_lineColor = red;
      }
      m_parentDiv.css("border-color", m_lineColor);
      return this; //for chaining
    };

    /**
     * Sets the style of the cavas's border.
     * @param {String} style A string representing a valid HTML border style (e.g. "dotted", "dashed", "solid", "double", etc.)
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setFrameStyle = function (style) {
      m_frameStyle = s;
      m_parentDiv.css("border-style", s);
      return this; //for chaining
    };

    /**
     * Set the radius for the corners of the border frame
     * @param {Number} radius Radius of a rounded corner
     * @see {@link AbstractCanvas#getBorderRadius getBorderRadius()}
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setBorderRadius = function (radius) {
      m_borderRadius = radius;
      m_parentDiv.css("border-radius", m_borderRadius);
      return this; //for chaining
    };

    /**
     * Sets the background color of the canvas.
     * @param {(Number|String)} red This could be a number between [0-255] representing the red in a RGB color or a string such as "red" or "#ff0000" representing a color. If it is a string, other arguments may be omitted.
     * @param {(Number|undefined)} green If the first argument is a number, this argument is required. It is integer between 0-255 representing green in RGB color.
     * @param {(Number|undefined)} blue If the first argument is a number, this argument is required. It is integer between 0-255 representing blue in RGB color.
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setBackgroundColor = function (red, green, blue) {
      if (typeof red == "number") {
        m_color = Utility.RGB2HTML(red, green, blue);
      } else if (typeof red == "string") {
        m_color = red;
      }
      m_parentDiv.css("background-color", m_color);
      return this; //for chaining
    };

    /**
     * Sets the the cavas background.
     * @param {String} style A string representing a valid HTML background (e.g. "linear-gradient(yellow, white)", "lightblue url("img_tree.gif") no-repeat fixed center", etc.)
     * @returns {object} <strong><i>this</i></strong> For chaining.
     */
    this.setBackground = function (style) {
      m_parentDiv.css("background", style);
      return this; //for chaining
    };

    /**
     *
     * @returns {Number} Radius for the corners of the border frame.
     * @see {@link AbstractCanvas#setBorderRadius setBorderRadius()}
     */
    this.getBorderRadius = function () {
      return m_borderRadius;
    };

    /**
     *
     * @param {object} sheet Style sheet specifying style attributes.
     * @returns {object} <strong><i>this</i></strong> For chaining.
     * @example var pc = new PlotCanvas(plot); //create a canvas
     * var styleSheet = //Define the syles in a style sheet
     * {
     *  backgroundColor: "yellow",
     *  background: "linear-gradient(yellow, white)",
     *  borderRadius: 15,
     *  lineColor: "red",
     *  lineWidth: 4
     * };
     * pc.setStyleSheet(styleSheet); //Apply the styles to the canvas.
     */
    this.setStyleSheet = function (sheet) {
      if (sheet.backgroundColor !== undefined)
        this.setBackgroundColor(sheet.backgroundColor);
      if (sheet.background !== undefined) this.setBackground(sheet.background);
      if (sheet.borderRadius !== undefined)
        this.setBorderRadius(sheet.borderRadius);
      if (sheet.frameStyle !== undefined) this.setFrameStyle(sheet.frameStyle);
      if (sheet.lineColor !== undefined) this.setLineColor(sheet.lineColor);
      if (sheet.lineWidth !== undefined) this.setLineWidth(sheet.lineWidth);

      return this; //for chaining
    };
  }
}

/**
 * Canvas is the widget where all plot items are displayed
 * @extends AbstractCanvas
 */
class PlotCanvas extends AbstractCanvas {
  constructor(plot) {
    super(plot.getCentralWidget().getElement());
  }
}

/**
 * Canvas is the parent widget of the PlotCanvas widget.
 * @extends AbstractCanvas
 */
class PlotContainerCanvas extends AbstractCanvas {
  constructor(plot) {
    super(plot.getCentralWidget().getElement().parent());
  }
}
