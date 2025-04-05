"use strict";
/**
 * Axis position
 */
class Axis {}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link Axis.AxisId}</div>
 *
 * Axis position.
 * @name Axis.AxisId
 * @readonly
 * @property {Number} yLeft             Y axis left of the canvas.
 * @property {Number} yRight            Y axis right of the canvas.
 * @property {Number} xBottom           X axis below the canvas.
 * @property {Number} xTop              X axis above the canvas.
 * @property {Number} axisCnt           Number of axes
 */
Enumerator.enum("AxisId{yLeft, yRight, xBottom, xTop, axisCnt}", Axis);

class AxisData {
  constructor() {
    this.axisName = "";
    this.isEnabled = false;
    this.doAutoScale = true;
    this.minValue; // = -1000.0;
    this.maxValue; // = 1000.0;
    this.stepSize; // = 0;
    this.maxMajor; // = 10;
    this.maxMinor; // = 100;
    this.isValid = true;
    this.scaleDiv = null;
    this.scaleEngine = null;
    this.scaleWidget = null;
    this.scaleDomDiv = null;
    this.canvas = null;
  }

  toString() {
    return "[AxisData]";
  }
}

/**
 * A 2-D plotting widget.
 * Plot is a widget for plotting two-dimensional graphs. An unlimited number of plot items can be displayed on its canvas. Plot
 * items can be curves (PlotCurve), markers (PlotMarker), the grid (PlotGrid), or anything else derived from PlotItem.
 * A plot can have up to four axes, with each plot item attached to an x- and a y axis. The scales at the axes can be explicitly
 * set (ScaleDiv), or are calculated from the plot items, using algorithms (ScaleEngine) which can be configured separately
 * for each axis.
 *
 */
class Plot {
  /**
   *
   * @param {(string|jQuery)} _plotDiv plot parent. If this parameter is a string, it is converted to a jQuery selector object: $("#plotDiv")
   * @param {string} [pTitle] Title of the plot
   * @example
   *    <!--index.html-->

        <!DOCTYPE html>
        <html lang="en">

          <head>
              ...
          </head>

          <body>
              <div id="plotDiv" class="plotContainer"></div>
              ...
          </body>

        </html>



        //app.js
        require([      
          'plot'
        ], function(){         
            const plot = new Plot($("#plotDiv")); //or new Plot() since Plot assumes the div id is "plotDiv"
            plot.setAutoReplot(true);	
        })

   */
  constructor(_plotDiv, pTitle) {
    class AxesWidgetOverlay extends WidgetOverlay {
      constructor(plot) {
        super(plot.getCentralWidget());
        this.plot = plot;

        this.scaleDrawY = plot.axisWidget(0).scaleDraw();
        this.scaleDrawX = plot.axisWidget(2).scaleDraw();
        this.setZ(4000);
      }
      drawOverlay(painter) {
        this.clearCanvas();

        const precisionX = this.plot.axisPrecision(Axis.AxisId.xBottom);
        const precisionY = this.plot.axisPrecision(Axis.AxisId.yLeft);
        var m_tickLength = [];
        m_tickLength[ScaleDiv.TickType.MinorTick] = 4.0;
        m_tickLength[ScaleDiv.TickType.MediumTick] = 6.0;
        m_tickLength[ScaleDiv.TickType.MajorTick] = 8.0;
        const self = this;
        const scaleDrawX = self.scaleDrawX;
        const m_scaleDivX = scaleDrawX.scaleDiv();

        const scaleDrawY = self.scaleDrawY;
        const m_scaleDivY = scaleDrawY.scaleDiv();

        let backBoneSpacing = 0;
        if (
          scaleDrawY.hasComponent(AbstractScaleDraw.ScaleComponent.Backbone)
        ) {
          backBoneSpacing = 1;
        }

        var font = this.plot.axisLabelFont(Axis.AxisId.xBottom);
        painter.setFont(font);

        const centAxesAtZero = this.plot.centerAxesZero;
        const x_0 = this.plot.transform(2, 0);
        const y_0 = this.plot.transform(0, 0);
        if (scaleDrawY.alignment() === ScaleDraw.Alignment.LeftScale) {
          if (
            scaleDrawY.hasComponent(AbstractScaleDraw.ScaleComponent.Labels)
          ) {
            var majorTicks = m_scaleDivY.ticks(ScaleDiv.TickType.MajorTick);
            const ctx = painter.context();
            //const delta = painter.canvasWidth() - x_0; /// 2 + backBoneSpacing;
            const delta = !centAxesAtZero
              ? painter.canvasWidth() / 2 + backBoneSpacing
              : painter.canvasWidth() - x_0 + backBoneSpacing;
            ctx.translate(-delta, 0);

            for (var i = 0; i < majorTicks.length; i++) {
              var v = majorTicks[i];
              if (m_scaleDivY.contains(v)) {
                const pos = scaleDrawY.labelPosition(painter.context(), v);
                painter.drawText(
                  scaleDrawY.label(v.toPrecision(precisionY)),
                  pos.x,
                  pos.y,
                  "right"
                );
              }
            }
            ctx.translate(delta, 0);
          }
          if (scaleDrawY.hasComponent(AbstractScaleDraw.ScaleComponent.Ticks)) {
            painter.save();
            painter.setPen(new Misc.Pen("grey", 1));
            for (
              var tickType = ScaleDiv.TickType.MinorTick;
              tickType < ScaleDiv.TickType.NTickTypes;
              tickType++
            ) {
              var ticks = m_scaleDivY.ticks(tickType);
              const ctx = painter.context();
              //const delta = painter.canvasWidth() - x_0; /// 2 + backBoneSpacing;
              const delta = !centAxesAtZero
                ? painter.canvasWidth() / 2 + backBoneSpacing
                : painter.canvasWidth() - x_0 + backBoneSpacing;
              ctx.translate(-delta, 0);
              for (i = 0; i < ticks.length; i++) {
                var v = ticks[i];
                if (m_scaleDivY.contains(v))
                  scaleDrawY.drawTick(painter, v, m_tickLength[tickType]);
              }
              ctx.translate(delta, 0);
            }
            painter.restore();
          }

          if (
            scaleDrawY.hasComponent(AbstractScaleDraw.ScaleComponent.Backbone)
          ) {
            painter.save();
            const ctx = painter.context();
            //const delta = painter.canvasWidth() - x_0; /// 2 + backBoneSpacing;
            const delta = !centAxesAtZero
              ? painter.canvasWidth() / 2 + backBoneSpacing
              : painter.canvasWidth() - x_0 + backBoneSpacing;
            ctx.translate(-delta, 0);
            painter.setPen(new Misc.Pen("grey", 1));
            scaleDrawY.drawBackbone(painter);
            ctx.translate(delta, 0);
            painter.restore();
          }
        }
        if (scaleDrawX.alignment() === ScaleDraw.Alignment.BottomScale) {
          if (
            scaleDrawX.hasComponent(AbstractScaleDraw.ScaleComponent.Labels)
          ) {
            var majorTicks = m_scaleDivX.ticks(ScaleDiv.TickType.MajorTick);
            const ctx = painter.context();
            const delta = /* y_0; */ !centAxesAtZero
              ? painter.canvasHeight() / 2 - 1 + backBoneSpacing
              : y_0;
            ctx.translate(0, delta);

            for (var i = 0; i < majorTicks.length; i++) {
              var v = majorTicks[i];
              if (m_scaleDivX.contains(v)) {
                var pos = scaleDrawX.labelPosition(painter.context(), v);
                painter.drawText(
                  scaleDrawX.label(v.toPrecision(precisionX)),
                  pos.x,
                  pos.y,
                  "center"
                );
              }
            }
            ctx.translate(0, -delta);
          }
          if (scaleDrawX.hasComponent(AbstractScaleDraw.ScaleComponent.Ticks)) {
            painter.save();
            painter.setPen(new Misc.Pen("grey", 1));
            for (
              var tickType = ScaleDiv.TickType.MinorTick;
              tickType < ScaleDiv.TickType.NTickTypes;
              tickType++
            ) {
              var ticks = m_scaleDivX.ticks(tickType);
              const ctx = painter.context();
              const delta = /* y_0; */ !centAxesAtZero
                ? painter.canvasHeight() / 2 - 1 + backBoneSpacing
                : y_0;
              ctx.translate(0, delta);
              for (i = 0; i < ticks.length; i++) {
                var v = ticks[i];
                if (m_scaleDivX.contains(v))
                  scaleDrawX.drawTick(painter, v, m_tickLength[tickType]);
              }
              ctx.translate(0, -delta);
            }
            painter.restore();
          }
          if (
            scaleDrawX.hasComponent(AbstractScaleDraw.ScaleComponent.Backbone)
          ) {
            painter.save();
            const ctx = painter.context();
            const delta = /* y_0; */ !centAxesAtZero
              ? painter.canvasHeight() / 2 - 1 + backBoneSpacing
              : y_0;
            ctx.translate(0, delta);
            painter.setPen(new Misc.Pen("grey", 1));
            scaleDrawX.drawBackbone(painter);
            ctx.translate(0, -delta);
            painter.restore();
          }
        }

        //console.log(x_0);
        painter.save();
        //y line
        painter.setPen(new Misc.Pen("#A9A9A9", 1));
        if (centAxesAtZero) {
          painter.drawLine(x_0, 0, x_0, painter.canvasHeight());
          painter.drawLine(0, y_0, painter.canvasWidth(), y_0);
        } else {
          painter.drawLine(
            painter.canvasWidth() / 2,
            0,
            painter.canvasWidth() / 2,
            painter.canvasHeight()
          );
          painter.drawLine(
            0,
            painter.canvasHeight() / 2,
            painter.canvasWidth(),
            painter.canvasHeight() / 2
          );
        }
        painter.restore();
      }
    }

    this.plotDiv = null;
    if (_plotDiv == undefined) {
      this.plotDiv = $("#plotDiv");
    } else {
      this.plotDiv = _plotDiv;
    }

    this.plotDiv.addClass("plotDivPrint");

    /* If plotDiv parent is not a DIV, we give it a new parent that is a DIV */
    if (this.plotDiv.parent()[0].tagName !== "DIV") {
      var plotDivParent = $(
        '<div style="position: absolute; width:100%; height: 98%;"></div>'
      );
      this.plotDiv.parent().append(plotDivParent);
      var element = this.plotDiv.detach();
      plotDivParent.append(element);
      plotDivParent.addClass("plotDivPrint");
    } else {
      this.plotDiv.parent().addClass("plotDivPrint");
    }

    const self = this; //'self' is used in place of 'this' in callbacks
    var m_plotItemStore = [];
    let m_centerAxesEnabled = false;
    var d_axisData = [];
    var plotDivHeightAsPercentOfPlotDivParent = 0;

    var plotDivContainer = this.plotDiv.parent();
    this.centerAxesZero = false;

    let titleVisible = true;
    let footerVisible = true;

    var plotDivContainerWidth = parseFloat(plotDivContainer.css("width"));
    var plotDivContainerHeight = parseFloat(plotDivContainer.css("height"));

    var beforePrintCb = null;
    var afterPrintCb = null;
    //var m_sidebarVisible = false;

    var _title = "";
    var m_footer = "";
    var legendEnable = false;
    var m_cursor = "";
    var m_defaultCursor = "";

    let m_axisTitleY, m_axisTitleX;

    var m_autoReplot = false;
    var m_legend = null;

    var m_legendFont = new Misc.Font();

    this.zoomer = null; //stores zoomer known to the plot
    this.panner = null; //stores panner known to the plot

    /**
     * Change the legend's font
     * @param {Misc.Font} font New font
     */
    this.setLegendFont = function (font) {
      m_legendFont = font;
    };

    /**
     *
     * @returns {Misc.Font} font use in legend
     */
    this.legendFont = function () {
      return m_legendFont;
    };

    /**
     * Replots the plot if autoReplot() is true.
     */
    this.autoRefresh = function () {
      if (m_autoReplot) {
        this.replot();

        //this.updateLayout
      }
    };

    /**
     * Set or reset the autoReplot option. If the autoReplot option is set, the plot will be
     * updated implicitly by manipulating member functions. Since this may be time-consuming, it is recommended to leave this
     * option switched off and call replot() explicitly if necessary.
     *
     * The autoReplot option is set to false by default, which means that the user has to call replot() in order to make
     * changes visible.
     * @param {boolean} tf  true or false. Defaults to true.
     * @see {@link Plot#replot replot()}
     */
    this.setAutoReplot = function (tf) {
      m_autoReplot = tf;
    };

    /**
     * @returns {boolean} true if the autoReplot option is set.
     * @see {@link Plot#setAutoReplot setAutoReplot}
     */
    this.autoReplot = function () {
      return m_autoReplot;
    };

    /**
     *
     * @returns {Array<PlotItem>} List of attached plotItems
     * @see {@link Plot#itemList itemList()}
     */
    this.plotItemStore = function () {
      return m_plotItemStore;
    };

    var m_titleFont = new Misc.Font(12);

    var m_footerFont = new Misc.Font(12);

    var layout = new Layout(this.plotDiv, this);

    /**
     * @returns {Layout} the plot's layout
     */
    this.getLayout = function () {
      return layout;
    };

    /**
     * Return the current interval of the specified axis
     *
     * This is only a convenience function for axisScaleDiv( axisId ).interval();
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Interval} Scale interval
     * @see {@link ScaleDiv}
     * @see {@link Plot#axisScaleDiv axisScaleDiv()}
     */
    this.axisInterval = function (axisId) {
      if (!this.axisValid(axisId)) return new Interval();

      return d_axisData[axisId].scaleDiv.interval();
    };

    /**
     * Format a number to a specified length
     * @param {Number} axisId Axis id
     * @param {Number} places Length
     *
     */
    this.setAxisPrecision = function (axisId, places) {
      if (!this.axisValid(axisId)) return;
      this.axisScaleDraw(axisId).setPrecision(places);

      this.autoRefresh();
    };

    /**
     * Sets the decimal places used by an axis
     * @param {Axis.AxisId} axisId Axis id
     * @param {Number} places Decimal places
     */
    this.setAxisDecimalPlaces = function (axisId, places) {
      if (!this.axisValid(axisId)) return;
      this.axisScaleDraw(axisId).setDecimalPlaces(places);

      this.autoRefresh();
    };

    /* this.setNonExponentNotationLimits = function (lower, upper) {
      for (var axisId = 0; axisId < Axis.AxisId.axisCnt; ++axisId) {
        this.axisScaleDraw(axisId).setNonExponentLimits(lower, upper);
      }
      this.autoRefresh();
    };

    this.getNonExponentNotationLimits = function () {
      return this.axisScaleDraw(0).getNonExponentNotationLimits();
    }; */

    /**
     *
     * @param {Axis.AxisId} axisId Axis id
     * @returns {Number} The number precision
     * @see {@link Plot#setAxisPrecision setAxisPrecision()}
     */
    this.axisPrecision = function (axisId) {
      if (!this.axisValid(axisId)) return 3;

      return this.axisScaleDraw(axisId).precision();
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis id
     * @returns {Number} Decimal places for the axis
     * @see {@link Plot#setAxisDecimalPlaces setAxisDecimalPlaces()}
     */
    this.axisDecimalPlaces = function (axisId) {
      if (!this.axisValid(axisId)) return 3;

      return this.axisScaleDraw(axisId).decimalPlaces();
    };

    var centralWidget = new Widget(layout.getCentralDiv());
    var titleWidget = new Widget(layout.getTitleDiv());
    var footerWidget = new Widget(layout.getFooterDiv());

    centralWidget.setEnabled_1(true);

    centralWidget.plot = this;

    /**
     *
     * @returns {Widget} The central widget. The central widget is the parent of all plotItems
     */
    this.getCentralWidget = function () {
      return centralWidget;
    };

    /**
     *
     * @returns {Widget} The title widget.
     */
    this.getTitleWidget = function () {
      return titleWidget;
    };

    /**
     *
     * @returns {Widget} The footer widget.
     */
    this.getFooterWidget = function () {
      return footerWidget;
    };

    //! Initialize axes
    const initAxesData = function () {
      var axisId;

      for (axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++)
        d_axisData[axisId] = new AxisData();

      d_axisData[Axis.AxisId.yLeft].axisName = "AxisYLeft";
      d_axisData[Axis.AxisId.yRight].axisName = "AxisYRight";
      d_axisData[Axis.AxisId.xTop].axisName = "AxisXTop";
      d_axisData[Axis.AxisId.xBottom].axisName = "AxisXBottom";

      /* d_axisData[Axis.AxisId.yLeft].scaleDomDiv = layout.getScaleDivElement(Axis.AxisId.yLeft);
            d_axisData[Axis.AxisId.yRight].scaleDomDiv = layout.getScaleDivElement(Axis.AxisId.yRight);
            d_axisData[Axis.AxisId.xTop].scaleDomDiv = layout.getScaleDivElement(Axis.AxisId.xTop);
            d_axisData[Axis.AxisId.xBottom].scaleDomDiv = layout.getScaleDivElement(Axis.AxisId.xBottom); */

      d_axisData[Axis.AxisId.yLeft].scaleWidget = new ScaleWidget(
        self,
        layout.getScaleDivElement(Axis.AxisId.yLeft),
        ScaleDraw.Alignment.LeftScale
      );
      d_axisData[Axis.AxisId.yRight].scaleWidget = new ScaleWidget(
        self,
        layout.getScaleDivElement(Axis.AxisId.yRight),
        ScaleDraw.Alignment.RightScale
      );
      d_axisData[Axis.AxisId.xTop].scaleWidget = new ScaleWidget(
        self,
        layout.getScaleDivElement(Axis.AxisId.xTop),
        ScaleDraw.Alignment.TopScale
      );
      d_axisData[Axis.AxisId.xBottom].scaleWidget = new ScaleWidget(
        self,
        layout.getScaleDivElement(Axis.AxisId.xBottom),
        ScaleDraw.Alignment.BottomScale
      );

      //#if 1
      // better find the font sizes from the application font
      //QFont fscl( fontInfo().family(), 10 );
      //QFont fttl( fontInfo().family(), 12, QFont::Bold );
      //#endif

      for (axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++) {
        var d = d_axisData[axisId];

        d.scaleEngine = new LinearScaleEngine();
        d.scaleWidget.setTransformation(d.scaleEngine.transformation());

        //d.scaleWidget->setFont( fscl );
        //d.scaleWidget->setMargin( 2 );

        //QwtText text = d.scaleWidget->title();
        //text.setFont( fttl );
        //d.scaleWidget->setTitle( text );

        d.doAutoScale = true;
        // d.minValue = 0.0;
        // d.maxValue = 1000.0;

        d.minValue = -10.0;
        d.maxValue = 10.0;

        d.stepSize = 0.0;
        d.maxMinor = 5;
        d.maxMajor = 8;
        d.isValid = false;
      }
      d_axisData[Axis.AxisId.yLeft].isEnabled = true;
      d_axisData[Axis.AxisId.yRight].isEnabled = true;
      d_axisData[Axis.AxisId.xBottom].isEnabled = true;
      d_axisData[Axis.AxisId.xTop].isEnabled = true;
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Number} The maximum number of minor ticks for a specified axis
     */
    this.axisMaxMinor = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].maxMinor;
      return 0;
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Number} The maximum number of major ticks for a specified axis
     */
    this.axisMaxMajor = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].maxMajor;
      return 0;
    };

    /**
     * Sets the maximum number of minor scale intervals for a specified axis
     * @param {Axis.AxisId} axisId Axis index
     * @param {Number} maxMinor Maximum number of minor steps
     * @see {@link Plot#axisMaxMinor axisMaxMinor()}
     */
    this.setAxisMaxMinor = function (axisId, maxMinor) {
      if (this.axisValid(axisId)) {
        var maxMinor = Utility.qBound(0, maxMinor, 100);

        var d = d_axisData[axisId];
        if (maxMinor != d.maxMinor) {
          d.maxMinor = maxMinor;
          d.isValid = false;
          this.autoRefresh();
        }
      }
    };

    /**
     * Sets the maximum number of major scale intervals for a specified axis
     * @param {Axis.AxisId} axisId Axis index
     * @param {Number} maxMajor Maximum number of minor steps
     * @see {@link Plot#axisMaxMajor axisMaxMajor()}
     */
    this.setAxisMaxMajor = function (axisId, maxMajor) {
      if (this.axisValid(axisId)) {
        var maxMajor = Utility.qBound(1, maxMajor, 10000);

        var d = d_axisData[axisId];
        if (maxMajor != d.maxMajor) {
          d.maxMajor = maxMajor;
          d.isValid = false;
          this.autoRefresh();
        }
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId axis index
     * @returns {Boolean} true if the specified axis exists, otherwise false
     */
    this.axisValid = function (axisId) {
      return axisId >= Axis.AxisId.yLeft && axisId < Axis.AxisId.axisCnt;
    };

    /**
     * Change the scale engine for an axis
     * @param {Axis.AxisId} axisId Axis index
     * @param {scaleEngine} engine Scale engine
     * @see {@link Plot#axisScaleEngine axisScaleEngine()}
     */
    this.setAxisScaleEngine = function (axisId, engine) {
      if (this.axisValid(axisId) && engine !== null) {
        var d = d_axisData[axisId];
        //alert(d.scaleEngine)

        d.scaleEngine = engine;
        //alert(d.scaleEngine)

        d_axisData[axisId].scaleWidget.setTransformation(
          engine.transformation()
        );
        //alert(d_axisData[axisId].scaleWidget.scaleDraw().scaleMap().transformation())

        d.isValid = false;

        this.autoRefresh();
      }
    };

    /**
     *
     * @returns {Legend} the plot's legend
     * @see {@link Plot#insertLegend insertLegend()}
     */
    this.legend = function () {
      return m_legend;
    };

    /**
     * Insert a legend.
     *
     * The legend is organized in one column from top to down on the right of the plot.
     * insertLegend() sets the plot widget as parent for the legend. The legend is deleted when the plot is destroyed or when another
     * legend is inserted.
     * insertLegend() triggers the "legendInserted" event.
     * @param {Legend} legend Legend
     * @see {@link Plot#legend legend()}
     */
    this.insertLegend = function (legend) {
      m_legend = legend;
      m_legend.setLegendDiv(layout.getLegendDiv());
      m_legend.setPlot(this);
      //We add any items attached to the plot before insertLegend was called.
      for (var i = 0; i < m_plotItemStore.length; ++i) {
        insertLegendItem(m_plotItemStore[i]);
      }
      Static.trigger("legendInserted", m_legend);
    };

    /*if the legend is not enabled, it is enabled when an item is added.*/
    const insertLegendItem = function (plotItem, rowNumber) {
      if (m_legend === null || plotItem == null) return;
      if (plotItem.testItemAttribute(PlotItem.ItemAttribute.Legend)) {
        m_legend.addItem(plotItem, rowNumber);
      }
      if (!m_legend.isEmpty()) {
        //legendEnable = true;
        if (legendEnable) {
          m_legend.legendDiv().show();
        }
      }
      //this.enableLegend(true);
    };

    /*if the legend is enabled, it is disabled when the last item is removed.*/
    const removeLegendItem = function (plotItem) {
      if (m_legend === null) return;
      //var row = m_legend.rowNumberFromName(plotItem.title());
      //if(row >=0){
      var rowNumber = m_legend.removeItem(plotItem);
      if (m_legend.isEmpty()) {
        //legendEnable = false;
        m_legend.legendDiv().hide();
      }
      //this.enableLegend(legendEnable);
      // }
      return rowNumber;
    };

    /**
     * Keep the legend item in sync with the plotitem it represents
     * @param {PlotItem} plotItem Plot item
     * @see {@link PlotItem#legendData legendData()}
     */
    this.updateLegend = function (plotItem) {
      if (plotItem == null) return;

      if (plotItem.testItemAttribute(PlotItem.ItemAttribute.Legend)) {
        //reinsert legend item so that legend data changes are accounted for.
        //Alternatively, we could have tried to rehabilitate the legend item in place!!
        var rowNumber = removeLegendItem(plotItem);
        insertLegendItem(plotItem, rowNumber);

        Static.trigger("legendUpdated", plotItem);
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {ScaleEngine} Scale engine for a specific axis
     */
    this.axisScaleEngine = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].scaleEngine;
      else return null;
    };

    /**
     * Enable autoscaling for a specified axis
     *
     * This member function is used to switch back to autoscaling mode after a fixed scale has been set.
     * Autoscaling is enabled by default.
     * @param {Axis.AxisId} axisId Axis index
     * @param {Boolean} on On/Off
     * @see {@link Plot#setAxisScale setAxisScale()}
     * @see {@link Plot#setAxisScaleDiv setAxisScaleDiv()}
     * @see {@link Plot#updateAxes updateAxes()}
     */
    this.setAxisAutoScale = function (axisId, on) {
      if (this.axisValid(axisId) && d_axisData[axisId].doAutoScale !== on) {
        d_axisData[axisId].doAutoScale = on;
        Static.trigger("autoScaleChanged", on);
        this.autoRefresh();
      }
    };

    /**
     * Enable autoscaling for a specified axis
     *
     * This member function is used to switch back to autoscaling mode after a fixed scale has been set.
     * Autoscaling is enabled by default.
     * @param {Axis.AxisId} axisId Axis index
     * @param {Boolean} on On/Off
     * @see {@link Plot#setAxisScale setAxisScale()}
     * @see {@link Plot#setAxisScaleDiv setAxisScaleDiv()}
     * @see {@link Plot#updateAxes updateAxes()}
     */
    this.setAxesAutoScale = function (on) {
      let changed = false;
      for (let i = 0; i < 4; i++) {
        if (d_axisData[i].doAutoScale !== on) {
          d_axisData[i].doAutoScale = on;
          changed = true;
        }
      }
      if (!changed) return;
      Static.trigger("autoScaleChanged", on);
      this.autoRefresh();
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Boolean} true, if autoscaling is enabled
     */
    this.axisAutoScale = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].doAutoScale;
      else return false;
    };

    /**
     * Disable autoscaling and specify a fixed scale for a selected axis.
     *
     * In updateAxes() the scale engine calculates a scale division from the specified parameters, that will be
     * assigned to the scale widget. So updates of the scale widget usually happen delayed with the next replot.
     * @param {Axis.AxisId} axisId Axis index
     * @param {Number} min Minimum of the scale
     * @param {Number} max Maximum of the scale
     * @param {Number} stepSize Major step size. If <code>step == 0</code>, the step size is
     * calculated automatically using the maxMajor setting.
     * @see {@link Plot#setAxisMaxMajor setAxisMaxMajor()}
     * @see {@link Plot#setAxisAutoScale setAxisAutoScale()}
     * @see {@link ScaleEngine#divideScale divideScale()}
     */
    this.setAxisScale = function (axisId, min, max, stepSize) {
      const autoReplot = self.autoReplot();
      self.setAutoReplot(false);
      var step = 0;
      if (typeof stepSize !== "undefined") step = stepSize;
      if (this.axisValid(axisId)) {
        var d = d_axisData[axisId];
        d.doAutoScale = false;
        d.isValid = false;
        d.minValue = min;
        d.maxValue = max;
        d.stepSize = step;

        Static.trigger("rescaled", [axisId, min, max]);
        self.setAutoReplot(autoReplot);
        this.autoRefresh();
      }
    };

    /**
     * Enable or disable a specified axis
     *
     * When an axis is disabled, this only means that it is not visible on the screen. Curves and markers
     * can be attached to disabled axes and transformation of screen coordinates
     * into values works as normal.
     * @param {Axis.setAxisScaleDiv} axisId Axis index
     * @param {Boolean} tf true (enabled) or false (disabled)
     */
    this.enableAxis = function (axisId, tf) {
      if (this.axisValid(axisId) && tf !== d_axisData[axisId].isEnabled) {
        d_axisData[axisId].isEnabled = tf;
        if (tf) d_axisData[axisId].scaleWidget.show();
        else d_axisData[axisId].scaleWidget.hide();
        this.autoRefresh();
        Static.trigger("axisEnabled", [axisId, tf]);
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Boolean} true, if a specified axis is enabled
     */
    this.axisEnabled = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].isEnabled;
      else return false;
    };

    /**
     * Change the title of a specified axis
     * @param {Axis.AxisId} axisId Axis index
     * @param {String} title Axis title
     */
    this.setAxisTitle = function (axisId, title) {
      if (this.axisValid(axisId)) {
        d_axisData[axisId].scaleWidget.setTitle(title);
        this.autoRefresh();
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {String} Title of a specified axis
     */
    this.axisTitle = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].scaleWidget.title();
      else return "";
    };

    /**
     * Return the scale division of a specified axis
     *
     * axisScaleDiv(axisId).lowerBound(), axisScaleDiv(axisId).upperBound() are the current limits of the axis scale.
     * @param {Axis.AxisId} axisId Axis index
     * @returns {ScaleDiv} The scale division of a specified axis
     * @see {@link ScaleDiv}
     * @see {@link Plot#setAxisScaleDiv setAxisScaleDiv()}
     * @see {@link ScaleEngine#divideScale divideScale()}
     */
    this.axisScaleDiv = function (axisId) {
      return d_axisData[axisId].scaleDiv;
    };

    /**
     * Disable autoscaling and specify a fixed scale for a selected axis.
     *
     * The scale division will be stored locally only until the next call of updateAxes(). So updates of the
     * scale widget usually happen delayed with the next replot.
     * @param {Axis.AxisId} axisId Axis index
     * @param {ScaleDiv} scaleDiv Scale division
     * @see {@link Plot#setAxisScale setAxisScale()}
     * @see {@link Plot#setAxisAutoScale setAxisAutoScale()}
     */
    this.setAxisScaleDiv = function (axisId, scaleDiv) {
      if (this.axisValid(axisId)) {
        var d = d_axisData[axisId];
        d.doAutoScale = false;
        d.scaleDiv = scaleDiv;
        d.isValid = true;
        this.autoRefresh();
      }
    };

    /**
     * Return the scale draw of a specified axis
     * @param {Axis.AxisId} axisId Axis index
     * @returns {ScaleDraw} Specified scaleDraw for axis, or null if axis is invalid.
     */
    this.axisScaleDraw = function (axisId) {
      if (!this.axisValid(axisId)) return null;
      return this.axisWidget(axisId).scaleDraw();
    };

    /**
     * Change the font of an axis
     *
     * This function changes the font of the tick labels, not of the axis title.
     * @param {Axis.AxisId} axisId Axis index
     * @param {Misc.Font} fontObj Font
     */
    this.setAxisLabelFont = function (axisId, fontObj) {
      if (this.axisValid(axisId)) {
        this.axisWidget(axisId).setLabelFont(fontObj);
        this.autoRefresh();
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Misc.Font} The font of the scale labels for a specified axis
     */
    this.axisLabelFont = function (axisId) {
      if (this.axisValid(axisId)) return this.axisWidget(axisId).labelFont();
      return null;
    };

    /**
     * Change the font of an axis title
     *
     * @param {Axis.AxisId} axisId Axis index
     * @param {Misc.Font} fontObj Font
     */
    this.setAxisTitleFont = function (axisId, fontObj) {
      if (this.axisValid(axisId)) {
        this.axisWidget(axisId).setTitleFont(fontObj);
        this.autoRefresh();
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {Misc.Font} The font of the title for a specified axis
     */
    this.axisTitleFont = function (axisId) {
      if (this.axisValid(axisId)) return this.axisWidget(axisId).titleFont();
      return null;
    };

    initAxesData();

    /**
     *
     * @returns {Boolean} true, if a cursor is set
     */
    this.isCursorSet = function () {
      return m_cursor !== "";
    };

    /**
     *
     *
     * @returns {String} The current cursor
     */
    this.cursor = function () {
      return m_cursor;
    };

    /**
     * Sets the mouse cursor to be displayed when pointing over the central widget. (The central widget is where plotitems are drawn)
     *
     * Calling unsetCursor() restores the default cursor.
     * @param {String} cursor A string representing a valid HTML cursor. The default is "crosshair".
     * @see {@link Plot#unsetCursor unsetCursor()}
     * @see {@link Plot#setDefaultCursor setDefaultCursor()}
     */
    this.setCursor = function (cursor) {
      if (cursor == m_cursor) return;
      var previousCursor = m_cursor;
      m_cursor = cursor;
      layout.getCentralDiv().css("cursor", m_cursor);
      return previousCursor;
    };

    /**
     * Sets the default mouse cursor to be displayed when pointing over the central widget. (The central widget is where plotitems are drawn)
     *
     * Calling unsetCursor() restores the default cursor.
     * @param {String} cursor A string representing a valid HTML cursor. The default is "crosshair".
     * @see {@link Plot#unsetCursor unsetCursor()}
     * @see {@link Plot#setCursor setCursor()}
     */
    this.setDefaultCursor = function (cursor) {
      if (m_defaultCursor == cursor) return;
      m_defaultCursor = cursor;
    };

    /**
     * Restores the default mouse cursor to be displayed when pointing over the central widget. (The central widget is where plotitems are drawn)
     *
     * @param {String} cursor A string representing a valid HTML cursor. The default is "crosshair".
     * @see {@link Plot#setDefaultCursor setDefaultCursor()}
     * @see {@link Plot#setCursor setCursor()}
     */
    this.unsetCursor = function () {
      if (m_defaultCursor == m_cursor) return;
      m_cursor = m_defaultCursor;
      layout.getCentralDiv()[0].style.cursor = m_cursor;
    };

    /**
     * @returns {string} Title of the plot.
     */
    this.title = function () {
      return _title;
    };

    /**
     * Hides the widget that displays the title
     * @see {@link Plot#showTitle showTitle()}
     */
    this.hideTitle = function () {
      if (_title == "") return;
      layout.getTitleDiv().hide();
      layout.updateLayout();
      this.autoRefresh();
      titleVisible = false;
      Static.trigger("titleVisible", false);
    };

    /**
     * Shows the widget that displays the title
     * @see {@link Plot#hideTitle hideTitle()}
     */
    this.showTitle = function () {
      if (_title == "") return;
      layout.getTitleDiv().show();
      layout.updateLayout();
      this.autoRefresh();
      titleVisible = true;
      Static.trigger("titleVisible", true);
    };

    /**
     * Change the plot's title.
     * @param {string} ttl New title.
     */
    this.setTitle = function (ttl) {
      if (_title !== ttl) {
        _title = ttl;

        if (ttl.trim(" ").length == 0) _title = "";

        if (_title !== "") {
          layout.getTitleDiv().show(); //ensure the div is visible
          titleVisible = true;
          Static.trigger("titleAdded", true);
        } else {
          layout.getTitleDiv().hide();
          titleVisible = false;
          Static.trigger("titleAdded", false);
        }
        layout.updateLayout();
        this.autoRefresh();
        //console.log("setTitle called")
      }
    };

    this.titleVisible = function () {
      return titleVisible;
    };

    /**
     * Change the font of the title
     *
     * @param {Misc.Font} fontObj Font
     */
    this.setTitleFont = function (fontObj) {
      if (fontObj.th < 0 || fontObj.name === "" || fontObj.style === "") return;
      m_titleFont = fontObj;
      layout.adjustLayout(layout.getTitleDiv(), fontObj.th * 2);
      this.autoRefresh();
    };
    this.setTitleFont(new Misc.Font(20, "Arial", "normal", "bold"));

    /**
     *
     * @returns {Misc.Font} The title font
     */
    this.titleFont = function () {
      return m_titleFont;
    };

    /**
     *
     * @returns {String} The footer
     */
    this.footer = function () {
      return m_footer;
    };

    this.footerVisible = function () {
      return footerVisible;
    };

    /**
     * Hides the widget that displays the footer
     * @see {@link Plot#showFooter showFooter()}
     */
    this.hideFooter = function () {
      if (m_footer == "") return;
      layout.getFooterDiv().hide();
      layout.updateLayout();
      this.autoRefresh();
      footerVisible = false;
      Static.trigger("footerVisible", false);
    };

    /**
     * Shows the widget that displays the footer
     * @see {@link Plot#hideFooter hideFooter()}
     */
    this.showFooter = function () {
      if (m_footer == "") return;
      layout.getFooterDiv().show();
      layout.updateLayout();
      this.autoRefresh();
      footerVisible = true;
      Static.trigger("footerVisible", true);
    };

    /**
     * Change the plot's footer.
     * @param {string} ttl New footer.
     */
    this.setFooter = function (ftr) {
      if (m_footer !== ftr) {
        m_footer = ftr;
        if (ftr.trim(" ").length == 0) m_footer = "";
        if (m_footer !== "") {
          layout.getFooterDiv().show(); //ensure the div is visible
          footerVisible = true;
          Static.trigger("footerAdded", true);
        } else {
          layout.getFooterDiv().hide();
          footerVisible = false;
          Static.trigger("footerAdded", false);
        }
        layout.updateLayout();
        this.autoRefresh();
      }
    };
    layout.getFooterDiv().hide();

    /**
     * Change the font of the footer
     *
     * @param {Misc.Font} fontObj Font
     */
    this.setFooterFont = function (fontObj) {
      if (fontObj.th < 0 || fontObj.name === "" || fontObj.style === "") return;
      m_footerFont = fontObj;
      layout.adjustLayout(layout.getFooterDiv(), fontObj.th * 2);
      this.autoRefresh();
    };
    this.setFooterFont(new Misc.Font(15, "Arial", "normal", "bold"));

    /**
     *
     * @returns {Misc.Font} The footer font
     */
    this.footerFont = function () {
      return m_footerFont;
    };

    /**
     * Toggle the legend visibility.
     *
     * An empty legend, though enabled, is not visible.
     * @param {Boolean} on If true, the legend is enabled.
     *
     */
    this.enableLegend = function (on) {
      //if (on == legendEnable)
      //return;
      legendEnable = on;
      if (!m_legend || m_legend.isEmpty()) return;
      //legendEnable = on;
      if (on) {
        //layout.getLegendDiv().show();
        m_legend.legendDiv().show();
      } else {
        //layout.getLegendDiv().hide();
        m_legend.legendDiv().hide();
      }
      this.autoRefresh();
      Static.trigger("legendEnabled", on);
    };

    /**
     *
     * @returns {Boolean} true, if the legend is enabled
     */
    this.isLegendEnabled = function () {
      //console.log(layout.getLegendDiv()[0].style.display)
      if (!m_legend) {
        return false;
      }
      return !(m_legend.legendDiv()[0].style.display == "none"); //legendEnable;
    };

    /**
     * Transform the x or y coordinate of a position in the drawing region into a value.
     * @param {Axis.AxisId} axisId Axis index
     * @param {Number} pos position
     * @returns {Number} Position as axis coordinate
     * The position can be an x or a y coordinate, depending on the specified axis.
     */
    this.invTransform = function (axisId, pos) {
      if (this.axisValid(axisId))
        return this.canvasMap(axisId).invTransform(pos);
      else return 0.0;
    };

    /**
     * Transform a value into a coordinate in the plotting region
     * @param {Axis.AxisId} axisId Axis index
     * @param {Number} value value
     * @returns {Number} X or Y coordinate in the plotting region corresponding to the value.
     */
    this.transform = function (axisId, value) {
      if (this.axisValid(axisId))
        return this.canvasMap(axisId).transform(value);
      else return 0.0;
    };

    var _plotBackGround = "";

    /**
     * Sets the background color of the central widget. (The central widget is where plotitems are drawn)
     * @param {String} color A valid HTML color
     * @see {@link Plot#plotBackground plotBackground()}
     */
    this.setPlotBackground = function (color) {
      this.getCentralWidget().getElement().css("background-color", color);
    };
    this.setPlotBackground("rgb(255, 255, 200)");

    /**
     * Gets the background color of the central widget. (The central widget is where plotitems are drawn)
     * @returns {String} color
     * @see {@link Plot#setPlotBackground setPlotBackground()}
     */
    this.plotBackground = function () {
      return this.getCentralWidget().getElement().css("background-color");
    };

    /**
     * Sets the border radius of the central widget. (The central widget is where plotitems are drawn)
     * @param {Number} radius The radius
     * @see {@link Plot#borderRadius borderRadius()}
     */
    this.setBorderRadius = function (radius) {
      var cw = this.getCentralWidget();
      //cw.getElement().css("border-radius", radius)
      cw.getCanvas().css("border-radius", radius);
    };

    /**
     *
     * @returns {Number} The border radius
     */
    this.borderRadius = function () {
      return m_borderRadius;
    };

    /**
     * Gets the first plot item with the title. This method is useful if plot items have a unique title.
     * @param {String} title Plot item title
     * @returns {Curve} The the first plot item with the title or null
     */
    this.findPlotCurve = function (title) {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      list = this.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      list = this.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      list = this.itemList(PlotItem.RttiValues.Rtti_PlotZone);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      list = this.itemList(PlotItem.RttiValues.Rtti_PlotMarker);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      return null;
    };

    /**
     *
     * @param {String} title PlotMarker title
     * @returns {PlotMarker} The PlotMarker with the title or null
     */
    this.findPlotMarker = function (title) {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotMarker);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      return null;
    };

    /**
     *
     * @param {String} title PlotItem title
     * @returns {PlotMarker} The PlotItem with the title or null
     */
    this.findPlotItem = function (title) {
      var list = this.itemList();
      for (var i = 0; i < list.length; ++i) {
        if (list[i].title() === title) return list[i];
      }
      return null;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one visible Curve
     */
    this.hasVisiblePlotCurve = function () {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].isVisible()) return true;
      }
      return false;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one visible PlotCurve or PlotSpectroCurve or PlotSpectrogram
     */
    this.hasVisibleCurveSpectrocurveOrSpectrogram = function () {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotCurve)
        .concat(this.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
        .concat(this.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
        .concat(this.itemList(PlotItem.RttiValues.Rtti_PlotZone));
      for (var i = 0; i < list.length; ++i) {
        if (list[i].isVisible()) return true;
      }
      return false;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one visible SpectroCurve
     */
    this.hasVisiblePlotSpectroCurve = function () {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].isVisible()) return true;
      }
      return false;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one visible PlotSpectrogram
     */
    this.hasVisiblePlotSpectrogram = function () {
      var list = this.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram);
      for (var i = 0; i < list.length; ++i) {
        if (list[i].isVisible()) return true;
      }
      return false;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one Curve
     */
    this.hasPlotCurve = function () {
      return this.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length > 0;
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one SpectroCurve
     */
    this.hasPlotSpectroCurve = function () {
      return (
        this.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve).length > 0
      );
    };

    /**
     *
     * @returns {Boolean} true, if the plot has at least one PlotSpectrogram
     */
    this.hasPlotSpectrogram = function () {
      return this.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram).length > 0;
    };

    /**
     * Draws the background
     */
    this.drawBackGround = function () {
      var painter = new PaintUtil.Painter(centralWidget);
      painter.fillRect(
        new Misc.Rect(0, 0, centralWidget.width(), centralWidget.height()),
        _plotBackGround
      );
      painter = null;
    };

    /**
     * Draws the title
     */
    this.drawTitle = function () {
      if (_title === "") return;
      var painter = new PaintUtil.Painter(titleWidget);
      painter.setFont(m_titleFont);
      painter.drawText(
        _title,
        titleWidget.width() / 2,
        (2.6 * m_titleFont.th) / 2,
        "center"
      );
      painter = null;
    };

    /**
     * Draws the footer
     */
    this.drawFooter = function () {
      if (m_footer === "") return;
      var painter = new PaintUtil.Painter(footerWidget);
      painter.setFont(m_footerFont);
      painter.drawText(
        m_footer,
        footerWidget.width() / 2,
        (2.6 * m_footerFont.th) / 2,
        "center"
      );
      painter = null;
    };

    /**
     *
     * @param {PlotItem.RttiValues} [type] Rtti value of the plotItem. If this argument is not provided, all attached plotItems are returned.
     * @returns {Array<PlotItem>} List of plotitems with PlotItem.RttiValues == type or a list of all attached plotItems.
     */
    this.itemList = function (type) {
      if (typeof type === "undefined") return m_plotItemStore;
      return _.filter(m_plotItemStore, function (item) {
        return item.rtti === type;
      });
    };

    this.itemListReplace = function (type, item) {
      for (let i = 0; i < m_plotItemStore.length; i++) {
        if (m_plotItemStore[i].rtti === type) {
          m_plotItemStore[i] = item;
          break;
        }
      }
    };

    this.setItemList = function (list) {
      m_plotItemStore = list;
    };

    const insertItem = function (item) {
      if (item.rtti === PlotItem.RttiValues.Rtti_PlotGrid) {
        m_plotItemStore.unshift(item);
      } else {
        m_plotItemStore.push(item);
      }
    };

    const removeItem = function (item) {
      var index = m_plotItemStore.indexOf(item);
      if (index > -1) {
        m_plotItemStore[index] = null;
        m_plotItemStore.splice(index, 1);
      }
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis
     * @returns {ScaleMap} Map for the axis on the canvas. With this map pixel coordinates can translated to plot coordinates and vice versa.
     * @see {@link ScaleMap}
     * @see {@link Plot#transform transform()}
     * @see {@link Plot#invTransform invTransform()}
     */
    this.canvasMap = function (axisId) {
      var map = new ScaleMap();
      //        if ( !d_data->canvas )
      //            return map;

      map.setTransformation(this.axisScaleEngine(axisId).transformation());

      var sd = this.axisScaleDiv(axisId);
      map.setScaleInterval(sd.lowerBound(), sd.upperBound());

      if (1) {
        //this.axisEnabled(axisId)) {
        var s = this.axisWidget(axisId);
        if (axisId == Axis.AxisId.yLeft || axisId == Axis.AxisId.yRight) {
          //var y = s->y() + s->startBorderDist() - d_data->canvas->y();
          var h = s.height();
          map.setPaintInterval(h, 0);
        } else {
          //double x = s->x() + s->startBorderDist() - d_data->canvas->x();
          var w = s.width();
          map.setPaintInterval(0, w);
        }
      }
      /*else {

            // int margin = 0;
            //if ( !plotLayout()->alignCanvasToScale( axisId ) )
            // margin = plotLayout()->canvasMargin( axisId );

            //const QRect &canvasRect = d_data->canvas->contentsRect();
            if (axisId == Axis.AxisId.yLeft || axisId == Axis.AxisId.yRight) {
            map.setPaintInterval(centralWidget.height(), 0);
            } else {
            map.setPaintInterval(0, centralWidget.width());
            }
            }*/
      return map;
    };

    /**
     *
     * @param {Axis.AxisId} axisId Axis index
     * @returns {ScaleWidget} Scale widget of the specified axis, or null if axisId is invalid.
     */
    this.axisWidget = function (axisId) {
      if (this.axisValid(axisId)) return d_axisData[axisId].scaleWidget;

      return null;
    };

    /**
     * Rebuild the axes scales
     *
     * In case of autoscaling the boundaries of a scale are calculated from the bounding rectangles
     * of all plot items, having the PlotItem.ItemAttribute.AutoScale flag enabled ( ScaleEngine.autoScale() ).
     * Then a scale division is calculated ( ScaleEngine.didvideScale() ) and assigned to scale widget.
     * When the scale boundaries have been assigned with setAxisScale() a scale division is
     * calculated ( QwtScaleEngine::didvideScale() ) for this interval and assigned to the scale widget.
     * When the scale has been set explicitly by setAxisScaleDiv() the locally stored scale division gets
     * assigned to the scale widget. The scale widget indicates modifications by triggering the scaleDivChanged event.
     * updateAxes() is usually called by replot().
     * @see {@link Plot#setAxisAutoScale setAxisAutoScale()}
     * @see {@link Plot#setAxisScale setAxisScale()}
     * @see {@link Plot#setAxisScaleDiv setAxisScaleDiv()}
     * @see {@link Plot#replot replot()}
     * @see {@link PlotItem#boundingRect boundingRect()}
     */
    this.updateAxes = function () {
      // Find bounding interval of the item data
      // for all axes, where autoscaling is enabled

      var intv = [
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
      ];

      let prevRect = new Misc.Rect();

      for (var i = 0; i < m_plotItemStore.length; ++i) {
        var item = m_plotItemStore[i];
        if (!item.testItemAttribute(PlotItem.ItemAttribute.AutoScale)) continue;

        if (!item.isVisible()) continue;

        if (
          this.axisAutoScale(item.xAxis()) ||
          this.axisAutoScale(item.yAxis())
        ) {
          //alert(item)
          var rect = item.boundingRect();
          //if (!rect.isValid()) continue;

          if (rect.isEqual(prevRect)) continue;
          prevRect = rect;

          //console.log(rect.toString());

          if (rect.width() >= 0.0) {
            //intv[item.xAxis()] |= new Interval( rect.left(), rect.right());
            if (rect.left() < intv[item.xAxis()].minValue())
              intv[item.xAxis()].setMinValue(rect.left());
            if (rect.right() > intv[item.xAxis()].maxValue())
              intv[item.xAxis()].setMaxValue(rect.right());
            //intv[item.xAxis()].setInterval(rect.left(), rect.right())
          }

          if (rect.height() >= 0.0) {
            //intv[item.yAxis()] |= new Interval( rect.top(), rect.bottom );
            if (rect.top() < intv[item.yAxis()].minValue())
              intv[item.yAxis()].setMinValue(rect.top());
            if (rect.bottom() > intv[item.yAxis()].maxValue())
              intv[item.yAxis()].setMaxValue(rect.bottom());
          }

          if (item.rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
            if (item.xValue() < intv[item.xAxis()].minValue())
              intv[item.xAxis()].setMinValue(item.xValue());
            if (item.xValue() > intv[item.xAxis()].maxValue())
              intv[item.xAxis()].setMaxValue(item.xValue());

            if (item.yValue() < intv[item.yAxis()].minValue())
              intv[item.yAxis()].setMinValue(item.yValue());
            if (item.yValue() > intv[item.yAxis()].maxValue())
              intv[item.yAxis()].setMaxValue(item.yValue());
          }
        }
      }

      // Adjust scales
      const axisCnt = !Static.polarGrid ? Axis.AxisId.axisCnt : 1;
      for (var axisId = 0; axisId < axisCnt; axisId++) {
        var d = d_axisData[axisId];
        var minValue = d.minValue;
        var maxValue = d.maxValue;
        var stepSize = d.stepSize;
        //alert(d.doAutoScale)

        if (d.doAutoScale && intv[axisId].isValid()) {
          //console.log(this);
          //alert("here")
          d.isValid = false;

          minValue = !Static.polarGrid ? intv[axisId].minValue() : 0;
          maxValue = !Static.polarGrid
            ? intv[axisId].maxValue()
            : intv[axisId].maxValue() * 1.05;

          if (Utility.mFuzzyCompare(maxValue, minValue)) {
            //minValue = minValue - 1.0e-6;
            minValue = minValue - Static._eps;
          }

          var xValues = {
            x1: minValue,
            x2: maxValue,
          };
          d.scaleEngine.autoScale(d.maxMajor, xValues, stepSize);
          minValue = xValues["x1"];
          maxValue = xValues["x2"];
        }
        if (!d.isValid) {
          //alert("or here")
          d.scaleDiv = d.scaleEngine.divideScale(
            minValue,
            maxValue,
            d.maxMajor,
            d.maxMinor,
            stepSize
          );
          d.isValid = true;
          //alert(d.scaleDiv.ticks(2))
        }
        var scaleWidget = this.axisWidget(axisId);
        scaleWidget.setScaleDiv(d.scaleDiv);

        //var startDist, endDist;
        var startAndEndObj = {
          start: undefined,
          end: undefined,
        };
        scaleWidget.getBorderDistHint(startAndEndObj);
        scaleWidget.setBorderDist(startAndEndObj.start, startAndEndObj.end);
      }

      m_plotItemStore.forEach(function (item) {
        if (item.testItemInterest(PlotItem.ItemInterest.ScaleInterest)) {
          item.updateScaleDiv(
            self.axisScaleDiv(item.xAxis()),
            self.axisScaleDiv(item.yAxis())
          );
        }
      });
    };

    /**
     * Attach/Detach a plot item
     * @param {PlotItem} plotItem Plot item
     * @param {Boolean} on When true attach the item, otherwise detach it
     */
    this.attachItem = function (plotItem, on) {
      if (on) {
        if (!plotItem.getCanvas()) {
          return plotItem.attach(this);
        }
        insertItem(plotItem);
        if (plotItem.testItemAttribute(PlotItem.ItemAttribute.Legend)) {
          insertLegendItem(plotItem);
        }
      } else {
        plotItem.getCanvas().remove();
        if (plotItem.testItemAttribute(PlotItem.ItemAttribute.Legend)) {
          removeLegendItem(plotItem);
        }
        removeItem(plotItem);
      }
      Static.trigger("itemAttached", [plotItem, on]);
      //if (!on) plotItem = null;
      this.autoRefresh();
    };

    self.axesWidgetOverlay = new AxesWidgetOverlay(self);

    this.isCenterAxesEnabled = function () {
      return m_centerAxesEnabled;
    };

    this.enableCenterAxes = function (on) {
      m_centerAxesEnabled = on;
      if (on) {
        m_axisTitleY = self.axisTitle(Axis.AxisId.yLeft);
        self.setAxisTitle(Axis.AxisId.yLeft, "");
        m_axisTitleX = self.axisTitle(Axis.AxisId.xBottom);
        self.setAxisTitle(Axis.AxisId.xBottom, "");
        self.enableAxis(Axis.AxisId.yLeft, false);
        self.enableAxis(Axis.AxisId.xBottom, false);
        self.enableAxis(Axis.AxisId.yRight, false);
        self.enableAxis(Axis.AxisId.xTop, false);
        self.tbar.setDropdownItemCheck("View", 0, false);
        self.tbar.setDropdownItemCheck("View", 1, false);
        self.tbar.setDropdownItemCheck("View", 2, false);
        self.tbar.setDropdownItemCheck("View", 3, false);
      } else {
        self.setAxisTitle(Axis.AxisId.yLeft, m_axisTitleY);
        self.setAxisTitle(Axis.AxisId.xBottom, m_axisTitleX);
        self.enableAxis(Axis.AxisId.yLeft, true);
        self.enableAxis(Axis.AxisId.xBottom, true);

        if (self.tbar.isDropdownItemChecked("View", 2)) {
          self.enableAxis(Axis.AxisId.yRight, true);
        }
        if (self.tbar.isDropdownItemChecked("View", 3)) {
          self.enableAxis(Axis.AxisId.xTop, true);
        }

        if (self.axisEnabled(0)) {
          self.tbar.setDropdownItemCheck("View", 0, true);
        }
        if (self.axisEnabled(2)) {
          self.tbar.setDropdownItemCheck("View", 1, true);
        }
        if (self.axisEnabled(1)) {
          self.tbar.setDropdownItemCheck("View", 2, true);
        }
        if (self.axisEnabled(3)) {
          self.tbar.setDropdownItemCheck("View", 3, true);
        }
        self.axesWidgetOverlay.clearCanvas();
      }
    };

    /**
     * Redraw the plot.
     *
     * If the autoReplot option is not set (which is the default) or if any curves are
     * attached to raw data, the plot has to be refreshed explicitly in order to make changes visible.
     * @see {@link Plot#updateAxes updateAxes()}
     * @see {@link Plot#setAutoReplot setAutoReplot()}
     */
    this.replot = function () {
      if (parseInt(this.getLayout().getCentralDiv().css("width")) < 60) return;

      var doAutoReplot = this.autoReplot();
      this.setAutoReplot(false);
      this.updateAxes();

      //Without a border of width 1px gridlines will not align with scale ticks.
      //var centralDiv = this.getLayout().getCentralDiv()
      //if(centralDiv.css("border-style") =="none")
      //centralDiv.css("border-style", "solid")
      //if(centralDiv.css("border-width") !=="1px")
      //centralDiv.css("border-width", 1)

      /*m_scaleDraw.data.plotCanvasBorderWidth =
            parseFloat(m_plot.getLayout().getCentralDiv().
            css("border-width"))*/

      for (var axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++) {
        var axisWidget = d_axisData[axisId].scaleWidget;
        axisWidget.scaleDraw().data.plotBorderWidth = parseFloat(
          this.getLayout().getCentralDiv().css("border-width")
        );
        axisWidget.draw();
      }

      if (m_centerAxesEnabled) {
        self.axesWidgetOverlay.draw();
      }

      this.drawTitle();
      this.drawFooter();

      for (var i = 0; i < m_plotItemStore.length; ++i) {
        if (!m_plotItemStore[i].isVisible()) continue;
        m_plotItemStore[i].draw(
          this.axisScaleDraw(m_plotItemStore[i].xAxis()).scaleMap(),
          this.axisScaleDraw(m_plotItemStore[i].yAxis()).scaleMap()
        );
      }
      Static.trigger("replot");
      this.setAutoReplot(doAutoReplot);
    };

    this.setAutoReplot(true);

    layout.getTitleDiv().hide();
    if (typeof pTitle !== "undefined") {
      this.setTitle(pTitle);
    }

    m_defaultCursor = layout.getCentralDiv().css("cursor");
    this.setCursor("crosshair");

    this.enableAxis(Axis.AxisId.yRight, false);
    this.enableAxis(Axis.AxisId.xTop, false);
    layout.getFooterDiv().hide(); //initially hidden
    if (m_legend) m_legend.legendDiv().hide();
    //initially hidden
    else layout.getLegendDiv().hide(); //initially hidden

    this.setAutoReplot(false);

    this.toString = function () {
      return '[Plot "' + _title + '"]';
    };

    this.print = function () {
      window.print();
    };

    this.registerPrintCb = function (type, cb) {
      if (type == "beforePrint") beforePrintCb = cb;
      if (type == "afterPrint") afterPrintCb = cb;
    };

    Static.bind("plotDivResized", function () {
      var pH = parseFloat(self.plotDiv.parent().css("height"));
      var h = parseFloat(self.plotDiv.css("height"));
      plotDivHeightAsPercentOfPlotDivParent = (h / pH) * 100;
    });

    window.matchMedia("print").addListener(function (mql) {
      if (mql.matches) {
        if (beforePrintCb) {
          beforePrintCb();
          return;
        }
        self.autoRefresh(); //ensure the plot is up-to-date
      } else {
        if (afterPrintCb) {
          afterPrintCb();
          //return;
        }
        self.plotDiv.css("height", plotDivHeightAsPercentOfPlotDivParent + "%");
      }
    });

    Static.bind("resize", function () {
      plotDivContainerWidth = parseFloat(plotDivContainer.css("width"));
      plotDivContainerHeight = parseFloat(plotDivContainer.css("height"));
      self.autoRefresh();
      //console.log(100);
    });

    this.plotDivContainerSize = function () {
      return new Misc.Size(plotDivContainerWidth, plotDivContainerHeight);
    };

    /**
     *
     * @param {Number} val
     * @returns {String} A string e.g 45%
     */
    this.elementWidthToPercentage = function (val) {
      return (100 * val) / plotDivContainerWidth + "%";
    };

    /**
     *
     * @param {Number} val
     * @returns {String} A string e.g 45%
     */
    this.elementHeightToPercentage = function (val) {
      return (100 * val) / plotDivContainerHeight + "%";
    };

    var _prevH = parseFloat(plotDivContainer.css("height"));
    var _prevH2 = parseFloat(self.plotDiv.css("height"));
    //console.log(_prevH)

    Static.onHtmlElementResize(self.plotDiv[0], function () {
      var changeOfHeight = parseFloat(self.plotDiv.css("height")) - _prevH2;
      _prevH2 = parseFloat(self.plotDiv.css("height"));
      Static.trigger("plotDivResized", [self.plotDiv, changeOfHeight]);
      self.autoRefresh();
    });

    Static.onHtmlElementResize(plotDivContainer[0], function () {
      var changeOfHeight = parseFloat(plotDivContainer.css("height")) - _prevH;
      _prevH = parseFloat(plotDivContainer.css("height"));
      Static.trigger("plotDivContainerResized", [
        plotDivContainer,
        changeOfHeight,
      ]);
    });
  }
}
