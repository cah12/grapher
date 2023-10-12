
/**
 * Layout engine for Plot. It is used by the Plot widget to organize its internal widgets or by Plot.print() to render its content.
 *
 */
class Layout {
  constructor(plotDiv, plot) {
    var self = this;
    var plt = plot;
    var leftOfLeftScaleDiv = 0;
    var topOfCentralDiv = 0;
    var bottomOfCentralDiv = 0;
    var rightOfCentralDiv = 0;
    var leftOfCentralDiv = 0;
    var rightOfRightScaleDiv = 0;
    var rightOfLegendDiv = 0;
    var bottomOfBottomScaleDiv = 0;
    var bottomOfFooterDiv = 0;
    var topOfTopScaleDiv = 0;

    if (!plotDiv) return;

    var plotDivContainer = plotDiv.parent();

    if (plotDiv.parent()[0] === document.body) {
      plotDiv.css("position", "absolute");
    }

    var titleDiv = $("<div />").attr({
      id: "titleDiv",
    });
    plotDiv.append(titleDiv);
    //if (titleDiv.css("top") !== "auto"); //topOfTitleDiv = parseFloat(titleDiv.css("top"))
    var topScaleDiv = $("<div />").attr({
      id: "topScaleDiv",
    });
    plotDiv.append(topScaleDiv);
    if (topScaleDiv.css("top") !== "auto")
      topOfTopScaleDiv = parseFloat(topScaleDiv.css("top"));
    var leftScaleDiv = $("<div />").attr({
      id: "leftScaleDiv",
    });
    plotDiv.append(leftScaleDiv);

    if (leftScaleDiv.css("left") !== "auto")
      leftOfLeftScaleDiv = parseFloat(leftScaleDiv.css("left"));
    var centralDiv = $("<div />").attr({
      id: "centralDiv",
    });
    plotDiv.append(centralDiv);
    if (centralDiv.css("top") !== "auto")
      topOfCentralDiv = parseFloat(centralDiv.css("top"));
    if (centralDiv.css("bottom") !== "auto")
      bottomOfCentralDiv = parseFloat(centralDiv.css("bottom"));
    if (centralDiv.css("right") !== "auto")
      rightOfCentralDiv = parseFloat(centralDiv.css("right"));
    if (centralDiv.css("left") !== "auto")
      leftOfCentralDiv = parseFloat(centralDiv.css("left"));

    /**
     *
     * @returns {object} Central DIV element selector (The Central DIV is where all PlotItems are drawn)
     */
    this.getCentralDiv = function () {
      return centralDiv;
    };
    var rightScaleDiv = $("<div />").attr({
      id: "rightScaleDiv",
    });
    plotDiv.append(rightScaleDiv);
    if (rightScaleDiv.css("right") !== "auto")
      rightOfRightScaleDiv = parseFloat(rightScaleDiv.css("right"));

    var legendDiv = $("<div/>").attr({
      id: "legendDiv",
    });
    plotDiv.append(legendDiv);
    if (legendDiv.css("right") !== "auto")
      rightOfLegendDiv = parseFloat(legendDiv.css("right"));
    var bottomScaleDiv = $("<div />").attr({
      id: "bottomScaleDiv",
    });
    plotDiv.append(bottomScaleDiv);
    if (bottomScaleDiv.css("bottom") !== "auto")
      bottomOfBottomScaleDiv = parseFloat(bottomScaleDiv.css("bottom"));

    var footerDiv = $("<div />").attr({
      id: "footerDiv",
    });
    plotDiv.append(footerDiv);
    if (footerDiv.css("bottom") !== "auto")
      bottomOfFooterDiv = parseFloat(footerDiv.css("bottom"));

    /**
     *
     * @returns {object} Plot DIV element selector
     */
    this.getPlotDiv = function () {
      return plotDiv;
    };

    /**
     *
     * @returns {object} Legend DIV element selector
     */
    this.getLegendDiv = function () {
      return legendDiv;
    };

    /**
     *
     * @returns {object} Title DIV element selector
     */
    this.getTitleDiv = function () {
      return titleDiv;
    };

    /**
     *
     * @returns {object} Footer DIV element selector
     */
    this.getFooterDiv = function () {
      return footerDiv;
    };

    var scaleDivElement = [
      leftScaleDiv,
      rightScaleDiv,
      bottomScaleDiv,
      topScaleDiv,
    ];

    /**
     *
     * @param {Axis.AxisId} type Axis Id
     * @returns {object} Scale DIV element selector
     */
    this.getScaleDivElement = function (type) {
      if (type < 0 || type >= Axis.AxisId.axisCnt) return null;
      return scaleDivElement[type];
    };

    //Usually called by methods that change font. It creates or reclaims space associted with font change.
    this.adjustLayout = function (domElement, newValue) {
      var dim = "width";
      if (
        domElement[0].id === "footerDiv" ||
        domElement[0].id === "titleDiv" ||
        domElement[0].id === "topScaleDiv" ||
        domElement[0].id === "bottomScaleDiv"
      )
        dim = "height";
      domElement.css(dim, newValue);
    };

    function topScaleAndTitle() {
      var titleHeight = parseFloat(titleDiv.css("height"));
      var topScaleHeight = parseFloat(topScaleDiv.css("height"));
      legendDiv.css("top", titleHeight);
      topScaleDiv.css("top", titleHeight);
      centralDiv.css("top", titleHeight + topScaleHeight);
      leftScaleDiv.css("top", titleHeight + topScaleHeight);
      rightScaleDiv.css("top", titleHeight + topScaleHeight);
    }

    function topScaleAndNotTitle() {
      var topScaleHeight = parseFloat(topScaleDiv.css("height"));
      legendDiv.css("top", 0);
      topScaleDiv.css("top", 0);
      centralDiv.css("top", topScaleHeight);
      leftScaleDiv.css("top", topScaleHeight);
      rightScaleDiv.css("top", topScaleHeight);
    }

    function titleAndNotTopScale() {
      var titleHeight = parseFloat(titleDiv.css("height"));
      legendDiv.css("top", titleHeight);
      centralDiv.css("top", titleHeight);
      leftScaleDiv.css("top", titleHeight);
      rightScaleDiv.css("top", titleHeight);
    }

    function notTitleAndNotTopScale() {
      legendDiv.css("top", 0);
      centralDiv.css("top", 0);
      leftScaleDiv.css("top", 0);
      rightScaleDiv.css("top", 0);
    }

    function adjustForTitle() {
      var titleVisible = titleDiv.css("display") == "none" ? true : false;
      if (plt.axisEnabled(Axis.AxisId.xTop)) {
        //case: top axis enabled
        if (titleVisible) {
          topScaleAndTitle();
        } else {
          topScaleAndNotTitle();
        }
      } else {
        //case: top axis not enabled
        if (titleVisible) {
          titleAndNotTopScale();
        } else {
          notTitleAndNotTopScale();
        }
      }
    }

    function adjustForTopScale() {
      var titleVisible = titleDiv.css("display") !== "none" ? true : false;
      if (titleVisible) {
        //case: title exist
        if (plt.axisEnabled(Axis.AxisId.xTop)) {
          topScaleAndTitle();
        } else {
          titleAndNotTopScale();
        }
      } else {
        //case: title does exist
        if (plt.axisEnabled(Axis.AxisId.xTop)) {
          topScaleAndNotTitle();
        } else {
          notTitleAndNotTopScale();
        }
      }
    }

    function bottomScaleAndFooter() {
      var footerHeight = parseFloat(footerDiv.css("height"));
      var bottomScaleHeight = parseFloat(bottomScaleDiv.css("height"));
      legendDiv.css("bottom", footerHeight);
      bottomScaleDiv.css("bottom", footerHeight);
      centralDiv.css("bottom", footerHeight + bottomScaleHeight);
      leftScaleDiv.css("bottom", footerHeight + bottomScaleHeight);
      rightScaleDiv.css("bottom", footerHeight + bottomScaleHeight);
    }

    function bottomScaleAndNotFooter() {
      var bottomScaleHeight = parseFloat(bottomScaleDiv.css("height"));
      legendDiv.css("bottom", 0);
      bottomScaleDiv.css("bottom", 0);
      centralDiv.css("bottom", bottomScaleHeight);
      leftScaleDiv.css("bottom", bottomScaleHeight);
      rightScaleDiv.css("bottom", bottomScaleHeight);
    }

    function footerAndNotBottomtScale() {
      var footerHeight = parseFloat(footerDiv.css("height"));
      legendDiv.css("bottom", footerHeight);
      centralDiv.css("bottom", footerHeight);
      leftScaleDiv.css("bottom", footerHeight);
      rightScaleDiv.css("bottom", footerHeight);
    }

    function notFooterAndNotBottomScale() {
      legendDiv.css("bottom", 0);
      centralDiv.css("bottom", 0);
      leftScaleDiv.css("bottom", 0);
      rightScaleDiv.css("bottom", 0);
    }

    function adjustForFooter() {
      var footerVisible = footerDiv.css("display") == "none" ? true : false;
      if (plt.axisEnabled(Axis.AxisId.xBottom)) {
        //case: bottom axis enabled
        if (footerVisible) {
          bottomScaleAndFooter();
        } else {
          bottomScaleAndNotFooter();
        }
      } else {
        //case: bottom axis not enabled
        if (footerVisible) {
          footerAndNotBottomtScale();
        } else {
          notFooterAndNotBottomScale();
        }
      }
    }
    function adjustForBottomScale() {
      var footerVisible = footerDiv.css("display") == "none" ? false : true;
      if (footerVisible) {
        //case: footer exist
        if (plt.axisEnabled(Axis.AxisId.xBottom)) {
          bottomScaleAndFooter();
        } else {
          footerAndNotBottomtScale();
        }
      } else {
        //case: footer does exist
        if (plt.axisEnabled(Axis.AxisId.xBottom)) {
          bottomScaleAndNotFooter();
        } else {
          notFooterAndNotBottomScale();
        }
      }
    }

    function rightScaleAndLegend() {
      var legendWidth = parseFloat(legendDiv.css("width"));
      var rightScaleWidth = parseFloat(rightScaleDiv.css("width"));
      titleDiv.css("right", legendWidth + rightScaleWidth + 14 + 3);
      topScaleDiv.css("right", legendWidth + rightScaleWidth + 14 + 3);
      footerDiv.css("right", legendWidth + rightScaleWidth + 14 + 3);
      bottomScaleDiv.css("right", legendWidth + rightScaleWidth + 14 + 3);
      legendDiv.css("right", 3);
      centralDiv.css("right", legendWidth + rightScaleWidth + 14 + 3);
      rightScaleDiv.css("right", legendWidth + 14 + 3);
    }
    function rightScaleAndNotLegend() {
      var rightScaleWidth = parseFloat(rightScaleDiv.css("width"));
      titleDiv.css("right", rightScaleWidth);
      topScaleDiv.css("right", rightScaleWidth);
      footerDiv.css("right", rightScaleWidth);
      bottomScaleDiv.css("right", rightScaleWidth);
      centralDiv.css("right", rightScaleWidth);
      rightScaleDiv.css("right", 0);
    }

    function legendAndNotRightScale() {
      var legendWidth = parseFloat(legendDiv.css("width"));
      centralDiv.css("right", legendWidth + 3 + 14);
      titleDiv.css("right", legendWidth + 3 + 14);
      topScaleDiv.css("right", legendWidth + 3 + 14);
      footerDiv.css("right", legendWidth + 3 + 14);
      bottomScaleDiv.css("right", legendWidth + 3 + 14);
      legendDiv.css("right", 3);
    }

    function notLegendAndNotRightScale() {
      titleDiv.css("right", 0);
      topScaleDiv.css("right", 0);
      footerDiv.css("right", 0);
      bottomScaleDiv.css("right", 0);
      centralDiv.css("right", 0);
    }

    function adjustForLegend() {
      if (plt.legend()) legendDiv.css("width", plt.legend().legendDivWidth());
      if (plt.axisEnabled(Axis.AxisId.yRight)) {
        //case: right axis enabled
        if (plt.isLegendEnabled()) {
          rightScaleAndLegend();
        } else {
          rightScaleAndNotLegend();
        }
      } else {
        //case: right axis not enabled
        if (plt.isLegendEnabled()) {
          legendAndNotRightScale();
        } else {
          notLegendAndNotRightScale();
        }
      }
    }

    function adjustForRightScale() {
      if (plt.isLegendEnabled()) {
        //case: legend exist
        if (plt.axisEnabled(Axis.AxisId.yRight)) {
          rightScaleAndLegend();
        } else {
          legendAndNotRightScale();
        }
      } else {
        //case: legend does not exist
        if (plt.axisEnabled(Axis.AxisId.yRight)) {
          rightScaleAndNotLegend();
        } else {
          notLegendAndNotRightScale();
        }
      }
    }

    function adjustForLeftScale() {
      var leftScaleWidth = parseFloat(leftScaleDiv.css("width"));
      if (plt.axisEnabled(Axis.AxisId.yLeft)) {
        titleDiv.css("left", leftScaleWidth);
        topScaleDiv.css("left", leftScaleWidth);
        footerDiv.css("left", leftScaleWidth);
        bottomScaleDiv.css("left", leftScaleWidth);
        centralDiv.css("left", leftScaleWidth);
      } else {
        titleDiv.css("left", 0);
        topScaleDiv.css("left", 0);
        footerDiv.css("left", 0);
        bottomScaleDiv.css("left", 0);
        centralDiv.css("left", 0);
      }
    }

    var plotDivContainerH = parseFloat(plotDivContainer.css("height"));

    /**
     *
     * Adjust the geometries of the various widgets to account for a change in geometry of any widget.
     */
    this.updateLayout = function () {
      if (typeof plt === "undefined") return;
      var plotDivContainerChangeInHeight =
        parseFloat(plotDivContainer.css("height")) - plotDivContainerH;
      plotDivContainerH = parseFloat(plotDivContainer.css("height"));
      plotDiv.css(
        "height",
        parseFloat(plotDiv.css("height")) + plotDivContainerChangeInHeight
      );

      adjustForTitle();
      adjustForTopScale();
      adjustForFooter();
      adjustForBottomScale();
      adjustForLegend();
      adjustForRightScale();
      adjustForLeftScale();

      //Static.trigger("layoutUpdated");
    };

    /**
     *
     * @returns {Boolean} true, if the Legend DIV element is visible
     */
    this.isLegendDivVisible = function () {
      if (legendDiv[0].style.display === "block") return true;
      return false;
    };

    /**
     * Sets the Plot for the layout
     * @param {Plot} plot
     */
    this.setPlot = function (plot) {
      plt = plot;
    };

    /**
     *
     * @returns {String} A string representation of the object
     */
    this.toString = function () {
      return "[Layout]";
    };
  }
}
