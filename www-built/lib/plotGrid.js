

/**
 * A class which draws a coordinate grid.
 *
 * The PlotGrid class can be used to draw a coordinate grid. A coordinate grid consists of major and minor vertical and horizontal grid lines. The locations of the grid lines are determined by the X and Y scale divisions which can be assigned with setXDiv() and setYDiv(). The draw() member draws the grid within a bounding rectangle.
 * @extends PlotItem
 */
class PlotGrid extends PlotItem {
  /**
   *
   * @param {String} tle Title of grid
   */
  constructor(tle) {
    super(tle);

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

    // Initialize our PlotGrid-specific properties
    // Enables major grid, disables minor grid
    var xEnabled = true;
    var yEnabled = true;
    var xMinEnabled = false;
    var yMinEnabled = false;

    var xScaleDiv = null;
    var yScaleDiv = null;

    var _majorPen = /* "rgb(192, 192, 192)"; */ "grey";
    var _minorPen = /* "rgb(221, 221, 221)"; */ "lightGrey";

    this.rtti = PlotItem.RttiValues.Rtti_PlotGrid;

    /**
     * Assign a pen color for major grid lines
     * @param {String} penColor pen color
     */
    this.setMajorPen = function (penColor) {
      if (_majorPen !== penColor) {
        _majorPen = penColor;
        this.itemChanged();
        //Static.trigger("itemChanged", [this, on]);
      }
    };

    /**
     *
     * @returns {Misc.Pen} the pen for the major grid lines
     * @see {@link PlotGrid#setMajorPen setMajorPen()}
     */
    this.majorPen = function () {
      return _majorPen;
    };

    /**
     * Assign a pen color for minor grid lines
     * @param {String} penColor pen color
     */
    this.setMinorPen = function (penColor) {
      if (_minorPen !== penColor) {
        _minorPen = penColor;
        this.itemChanged();
        //Static.trigger("itemChanged", [this, on]);
      }
    };

    /**
     *
     * @returns {Misc.Pen} the pen for the minor grid lines
     * @see {@link PlotGrid#setMinorPen setMinorPen()}
     */
    this.minorPen = function () {
      return _minorPen;
    };

    /**
     * Enable or disable vertical grid lines.
     * @param {Boolean} on Enable (true) or disable
     */
    this.enableX = function (on) {
      if (xEnabled != on) {
        xEnabled = on;
        //this.plot().autoRefresh()
        //legendChanged();
        this.itemChanged();
        Static.trigger("itemChanged", [this, on]);
      }
    };

    /**
     *
     * @returns {Boolean} true if vertical grid lines are enabled
     */
    this.xEnabled = function () {
      return xEnabled;
    };

    /**
     * Enable or disable horizontal grid lines.
     * @param {Boolean} on Enable (true) or disable
     */
    this.enableY = function (on) {
      if (yEnabled != on) {
        yEnabled = on;
        //this.plot().autoRefresh()
        //legendChanged();
        this.itemChanged();
        Static.trigger("itemChanged", [this, on]);
      }
    };

    /**
     *
     * @returns {Boolean} true if horizontal grid lines are enabled
     */
    this.yEnabled = function () {
      return yEnabled;
    };

    /**
     * Enable or disable minor vertical grid lines.
     * @param {Boolean} on Enable (true) or disable
     */
    this.enableXMin = function (on) {
      if (xMinEnabled != on) {
        xMinEnabled = on;
        //this.plot().autoRefresh()

        //legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Boolean} true if minor vertical grid lines are enabled
     * @see {@link PlotGrid#enableXMin enableXMin()}
     */
    this.xMinEnabled = function () {
      return xMinEnabled;
    };

    /**
     * Enable or disable minor horizontal grid lines.
     * @param {Boolean} on Enable (true) or disable
     */
    this.enableYMin = function (on) {
      if (yMinEnabled != on) {
        yMinEnabled = on;
        //this.plot().autoRefresh()

        //legendChanged();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Boolean} true if minor horizontal grid lines are enabled
     * @see {@link PlotGrid#enableYMin enableYMin()}
     */
    this.yMinEnabled = function () {
      return yMinEnabled;
    };

    /**
     * Assign a x axis division
     * @param {ScaleDiv} scaleDiv Scale division
     */
    this.setXDiv = function (scaleDiv) {
      if (xScaleDiv !== scaleDiv) {
        xScaleDiv = scaleDiv;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {ScaleDiv} The scale division of the x axis
     */
    this.xDiv = function () {
      return xScaleDiv;
    };

    /**
     * Assign a y axis division
     * @param {ScaleDiv} scaleDiv Scale division
     */
    this.setYDiv = function (scaleDiv) {
      if (yScaleDiv !== scaleDiv) {
        yScaleDiv = scaleDiv;
        //itemChanged();
      }
    };

    /**
     *
     * @returns {ScaleDiv} The scale division of the y axis
     */
    this.yDiv = function () {
      return yScaleDiv;
    };

    /**
     * Draw the grid
     *
     * The grid is drawn in the bounding rectangle such that grid lines begin and end at the rectangle's borders.
     * The X and Y maps are used to map the scale divisions into the drawing region screen.
     * @param {ScaleMap} xMap X axis map
     * @param {ScaleMap} yMap Y axis map
     */
    this.draw = function (xMap, yMap) {
      var p = this.plot();
      var xScaleDiv = p.axisScaleDiv(this.xAxis());
      var yScaleDiv = p.axisScaleDiv(this.yAxis());

      var ctx = this.getContext();

      //ctx.clearRect ( 0 , 0 , ctx.canvas.width, ctx.canvas.height );
      ctx.strokeStyle = _minorPen;

      if (xEnabled && xMinEnabled) {
        drawLines(
          ctx,
          "vertical",
          xMap,
          xScaleDiv.ticks(ScaleDiv.TickType.MinorTick)
        );
        drawLines(
          ctx,
          "vertical",
          xMap,
          xScaleDiv.ticks(ScaleDiv.TickType.MediumTick)
        );
      }

      if (yEnabled && yMinEnabled) {
        drawLines(
          ctx,
          "horizontal",
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MinorTick)
        );
        drawLines(
          ctx,
          "horizontal",
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MediumTick)
        );
      }
      //ctx.stroke();

      //  draw major grid lines
      ctx.strokeStyle = _majorPen;

      //ctx.beginPath();

      if (xEnabled) {
        drawLines(
          ctx,
          "vertical",
          xMap,
          xScaleDiv.ticks(ScaleDiv.TickType.MajorTick)
        );
      }

      if (yEnabled) {
        drawLines(
          ctx,
          "horizontal",
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MajorTick)
        );
      }

      //ctx.stroke();
    };

    const drawLines = function (context, orientation, scaleMap, values) {
      var x1 = 0;
      var x2 = context.canvas.width - 1.0;

      var y1 = 0; //canvasRect.top()();
      var y2 = context.canvas.height - 1.0;

      var painter = new PaintUtil.Painter(context);
      var lineThickness = painter.pen().width;

      for (var i = 0; i < values.length; i++) {
        var value = scaleMap.transform(values[i]);
        //if ( doAlign )
        //value = Math.round( value );

        if (orientation === "horizontal") {
          painter.drawLine(
            x1,
            value - lineThickness,
            x2,
            value - lineThickness
          );
        } else {
          painter.drawLine(
            value - lineThickness,
            y1,
            value - lineThickness,
            y2
          );
        }
      }
      painter = null;
    };

    /**
     * Update the grid to changes of the axes scale division
     * @param {ScaleDiv} xScale_div Scale division of the x-axis
     * @param {ScaleDiv} yScale_div Scale division of the y-axis
     * @see {@link Plot#updateAxes updateAxes()}
     */
    this.updateScaleDiv = function (xScale_div, yScale_div) {
      this.setXDiv(xScale_div);
      this.setYDiv(yScale_div);
    };

    /**
     *
     * @returns {String} Returns a string representing the object.
     */
    this.toString = function () {
      return "[PlotGrid]";
    };
  }
}
