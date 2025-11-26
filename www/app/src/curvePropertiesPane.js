"include ['propertiesPane']";
"use strict";

class CurvePropertiesPane extends PropertiesPane {
  constructor(_parent, plot) {
    super(_parent);
    var self = this;

    self.setHeader(
      plot.leftSidebar.gridItem(0).headerElement,
      "Curve Properties",
      true
    );

    var curveSelectProp = this.addProperty({
      name: "Curve",
      id: "currentCurve",
      type: "select",
      title: "Curve being modified",
      fun: currentCurve,
    });
    this.addProperty({
      name: "Rename",
      id: "renameCurve",
      type: "button",
      title: "Give the curve a different unique name",
      fun: renameCurve,
    });
    this.addProperty({
      name: "Remove",
      id: "removeCurve",
      type: "button",
      title: "Permanently remove the currently selected curve",
      fun: removeCurve,
    });
    this.addProperty({
      name: "Fit",
      id: "fitCurve",
      type: "button",
      title: "Assign a curve fitter to the currently selected curve",
      fun: fitCurve,
    });
    this.addProperty({
      name: "Zone",
      id: "zone",
      type: "button",
      title: "Assign a zone to the currently selected curve",
      fun: zone,
    });
    this.addProperty({
      name: "Legend Attributes",
      id: "legendAttributes",
      type: "button",
      title: "Configure how the curve is represented on the legend",
      fun: legendAttributes,
    });
    this.addProperty({
      name: "Orientation",
      id: "orientation",
      type: "select",
      selectorOptions: ["Vertical", "Horizontal"],
      title:
        "Set the orientation of the curve. This affect how the step and stick styles are displayed",
      fun: orientation,
    });
    var curveStyleOptions = [
      "Lines (Default)",
      "Sticks",
      "Steps",
      "Dots",
      "NoCurve",
    ];
    var curveSTyleSelector = this.addProperty({
      name: "Style",
      id: "curveStyle",
      type: "select",
      selectorOptions: curveStyleOptions,
      title: "Set the curve's drawing style",
      fun: curveStyle,
    });

    var axisSpanElement = this.addProperty({
      name: "Axes",
      id: "curveAxes",
      title:
        "Set X and Y axis. The curve is drawn according to the coordinates of its Axes.",
    });
    var axisHorizontalSelectElement = this.addProperty({
      name: "Horizontal",
      id: "horizontal",
      parentId: "curveAxes",
      type: "select",
      selectorOptions: ["Bottom", "Top"],
      title: "Set X axis.",
      fun: horizontal,
    });
    var axisVerticalSelectElement = this.addProperty({
      name: "Vertical",
      id: "vertical",
      parentId: "curveAxes",
      type: "select",
      selectorOptions: ["Left", "Right"],
      title: "Set Y axis.",
      fun: vertical,
    });
    var swapAxes = this.addProperty({
      name: "Swap axes",
      id: "swapAxes",
      parentId: "curveAes",
      type: "checkbox",
      title:
        "If checked, the axes are swapped. That is, f(x) is horizontal and x is vertical.",
      fun: swapAxesFn,
    });
    this.addProperty({
      name: "Pen",
      title: "Build and assign a pen.",
      id: "curvePen",
    });
    this.addProperty({
      name: "Color",
      id: "curvePenColor",
      parentId: "curvePen",
      type: "color",
      title: "Set the pen color",
      fun: curvePenColor,
    });
    this.addProperty({
      name: "Style",
      id: "curvePenStyle",
      parentId: "curvePen",
      type: "select",
      selectorOptions: ["solid", "dot", "dash", "dash-dot", "dash-dot-dot"],
      title: "Set the pen style",
      fun: curvePenStyle,
    });
    this.addProperty({
      name: "Width",
      id: "curvePenWidth",
      parentId: "curvePen",
      type: "select",
      selectorOptions: [1, 2, 3, 4, 5],
      title: "Set the pen width",
      fun: curvePenWidth,
    });
    this.addProperty({
      name: "Curve Symbol",
      title:
        "Assign a symbol. Any previously set symbol is removed by setting a new one.",
      id: "curveSymbol",
    });
    this.addProperty({
      name: "Pen",
      title: "Build and assign a pen.",
      id: "curveSymPen",
      parentId: "curveSymbol",
    });
    this.addProperty({
      name: "Color",
      id: "curveSymbolPenColor",
      parentId: "curveSymPen",
      type: "color",
      title: "Set the pen color",
      fun: curveSymbolPenColor,
    });
    this.addProperty({
      name: "Width",
      id: "curveSymbolPenWidth",
      parentId: "curveSymPen",
      type: "select",
      selectorOptions: [1, 2, 3, 4, 5],
      title: "Set the pen width",
      fun: curveSymbolPenWidth,
    });
    this.addProperty({
      name: "Fill Brush",
      id: "curveSymbolBrushColor",
      parentId: "curveSymbol",
      type: "color",
      title:
        "Assign a brush. The brush is used to draw the interior of the symbol.",
      fun: curveSymbolBrushColor,
    });
    this.addProperty({
      name: "Style",
      id: "curveSymbolStyle",
      parentId: "curveSymbol",
      type: "select",
      selectorOptions: [
        "None",
        "Rectangle",
        "Cross",
        "Diamond",
        "Ellipse",
        "Diagonal cross",
      ],
      title: "Specify the symbol style",
      fun: curveSymbolStyle,
    });
    this.addProperty({
      name: "Size",
      id: "curveSymbolSize",
      parentId: "curveSymbol",
      type: "select",
      selectorOptions: ["5x5", "6x6", "8x8", "10x10", "12x12", "15x15"],
      title: "Specify the symbol's size.",
      fun: curveSymbolSize,
    });
    this.addProperty({
      name: "Fill",
      title:
        "If the curve style is not equal to Sticks, the area between the curve and the baseline can be filled.",
      id: "curveFill",
    });
    this.addProperty({
      name: "Brush",
      id: "curveFillBrushColor",
      parentId: "curveFill",
      type: "color",
      title: "Assign the brush used to fill the curve.",
      fun: curveFillBrushColor,
    });
    var fillCurveCheckBox = this.addProperty({
      name: "Fill Curve",
      id: "fillCurve",
      parentId: "curveFill",
      type: "checkbox",
      title: "If checked, curve filling is enabled.",
      fun: fillCurve,
    });
    this.addProperty({
      name: "Baseline",
      id: "baseline",
      type: "number",
      value: 0.0,
      step: 0.5,
      title:
        "Set the value of the baseline. The baseline is required for filling the curve with a brush or the Sticks curve style.",
      fun: baseline,
    });

    this.addProperty({
      name: "Pen Width",
      id: "penWidth",
      type: "select",
      selectorOptions: [1, 2, 3, 4, 5],
      title: "Assign a pen width.",
      fun: curvePenWidth2,
    });

    let colorMap = this.addProperty({
      name: "Colormap",
      id: "colormap",
      type: "select",
      selectorOptions: ["RGB-map", "Indexed-map"],
      title:
        "Change the color map. Color Maps are used for mapping the intensity values to colors",
      fun: colormap,
    });

    this.addProperty({
      name: "Interpolation",
      id: "interpolation",
      type: "select",
      selectorOptions: ["Bi-Linear", "Bi-Cubic"],
      title: "Select the interpolation type.",
      fun: interpolation,
    });

    var spectrogramElement = this.addProperty({
      name: "Spectrogram",
      title: "Configure how the spectrogram is drawn.",
      id: "spectrogram",
    });
    this.addProperty({
      name: "show",
      id: "showSpectrogram",
      parentId: "spectrogram",
      type: "checkbox",
      checked: true,
      title: "If checked, the spectrogram is drawn.",
      fun: showSpectrogram,
    });
    this.addProperty({
      name: "alpha",
      id: "alpha",
      parentId: "spectrogram",
      type: "number",
      min: 0.0,
      max: 255,
      value: 255,
      step: 1,
      title: "Set an alpha value for the raster data.",
      fun: alpha,
    });

    var contoursElement = this.addProperty({
      name: "Contours",
      title: "Configure contours.",
      id: "contours",
    });
    this.addProperty({
      name: "show",
      id: "showContours",
      parentId: "contours",
      type: "checkbox",
      title: "If checked, contours are drawn.",
      fun: showContours,
    });
    this.addProperty({
      name: "Number of planes",
      id: "numberOfPlanes",
      parentId: "contours",
      type: "number",
      min: 0.0,
      max: 20,
      value: 10,
      step: 1,
      title: "Set the number of contour planes.",
      fun: numberOfPlanes,
    });

    this.addProperty({
      name: "Color interval",
      title: "Set the color range.",
      id: "colorInterval",
    });
    this.addProperty({
      name: "color1",
      id: "color1",
      parentId: "colorInterval",
      type: "color",
      title: "Color used for the minimum value of the value interval.",
      fun: color1,
    });
    this.addProperty({
      name: "color2",
      id: "color2",
      parentId: "colorInterval",
      type: "color",
      title: "Color used for the maximum value of the value interval.",
      fun: color2,
    });

    this.addProperty({
      name: "Color range",
      title: "Set the value interval, that corresponds to the color map.",
      id: "colorRange",
    });
    this.addProperty({
      name: "minimum Z",
      id: "minimumZ",
      parentId: "colorRange",
      type: "number",
      title: "Lower limit of the interval.",
      fun: minimumZ,
    });
    this.addProperty({
      name: "maximum Z",
      id: "maximumZ",
      parentId: "colorRange",
      type: "number",
      title: "Upper limit of the interval.",
      fun: maximumZ,
    });

    this.init(); //call this method after adding all properties

    //var curveSelectProp = this.getElementValueDataByPropertyName("Current Curve")
    //var curveSelectProp = this.getElementValueDataAttribute("currentCurve");
    //console.log(axisSpanElement)
    this.setFontSize("12px");

    /* function initCurveSelect() {
            let opts = curveSelectProp.children();
            for (let i = 0; i < opts.length; ++i) {
                curveSelectProp[0].removeChild(opts[i]);
            }
            let curves = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
            for (let i = 0; i < curves.length; ++i) {
				let opt = $('<option>' + curves[i].title() + '</option>');
				opt.attr("value", curves[i].title());
				curveSelectProp.append(opt);                
            }
            Static.trigger("currentCurveChangedViaPropertiesPane", curves[0]);
            return null;
        } */

    function initCurveSelect() {
      let opts = curveSelectProp.children();
      for (let i = 0; i < opts.length; ++i) {
        curveSelectProp[0].removeChild(opts[i]);
      }
      var itemList = plot.itemList();
      var curves = [];
      for (var i = 0; i < itemList.length; ++i) {
        if (
          itemList[i].rtti === PlotItem.RttiValues.Rtti_PlotCurve ||
          itemList[i].rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
          itemList[i].rtti === PlotItem.RttiValues.Rtti_PlotSpectrogram
        ) {
          curves.push(itemList[i]);
        }
      }
      for (let i = 0; i < curves.length; ++i) {
        let opt = $("<option>" + curves[i].title() + "</option>");
        opt.attr("value", curves[i].title());
        curveSelectProp.append(opt);
      }
      Static.trigger("currentCurveChangedViaPropertiesPane", curves[0]);
      return null;
    }

    function currentCurve(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      initDlg(curve);
      Static.trigger("currentCurveChangedViaPropertiesPane", curve);
    }

    /* function disableCurveDependentCntrls(on){
			axisHorizontalSelectElement.attr("disabled", on);
			axisVerticalSelectElement.attr("disabled", on);
		} */

    Static.bind("showGridItem", function (e, m_anchorPosition, gridIndex, on) {
      if (m_anchorPosition == "left" && gridIndex == 0 && on) {
        let curve = plot.findPlotCurve(curveSelectProp.val());
        initDlg(curve);
      }
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        if (on) {
          //attached
          //plot.leftSidebar.showGridItem(0, true);
          colorMap[0].selectedIndex = 0;
        } else {
          //detached
          if (
            !plot.hasVisiblePlotCurve() &&
            !plot.hasVisiblePlotSpectroCurve() &&
            !plot.hasVisiblePlotSpectrogram()
          ) {
            /* $("#curvePropertyDiv2").hide();
						$("#curvePropertyDiv").hide();
						$("#curvePropertyHead").hide();
						$("#plotPropertyDiv").css("height", "92%"); */
            //self.showPropertiesPane(false);
            plot.leftSidebar.showGridItem(0, false);
          }
          if (!plot.hasPlotCurve()) {
            //disableCurveDependentCntrls(true)
          }
        }
        initCurveSelect();

        initDlg(plot.findPlotCurve(curveSelectProp.val()));
        //}
      }
    });

    plot.leftSidebar.showGridItem(0, false);

    var selectIndex = -1;
    function renameCurve() {
      selectIndex = curveSelectProp[0].selectedIndex;
      Utility.curveRenameDlg(curveSelectProp.val(), plot);
    }

    Static.bind("curveRenamed", function () {
      if (selectIndex == -1) selectIndex = curveSelectProp[0].selectedIndex;
      initCurveSelect();
      curveSelectProp[0].selectedIndex = selectIndex;
      var curve = plot.findPlotCurve(curveSelectProp.val());
      //initDlg(curve);
      selectIndex = -1;
    });

    function removeCurve() {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      plot.trashDlg.trash(curve);
      // curve.detach();
      // curve.delete();
    }

    function fitCurve() {
      plot.curveFitDlg.curveFitCb(plot.findPlotCurve(curveSelectProp.val()));
    }

    function zone() {
      //plot.zoneDlg.zoneCb(plot.findPlotCurve(curveSelectProp.val()));
      plot.zoneDlg.zoneCb(plot);
    }

    function legendAttributes() {
      plot.curveAttributeDlg.curveAttributeCb(
        plot.findPlotCurve(curveSelectProp.val())
      );
    }

    function orientation(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      if (selectIndex == 1) curve.setOrientation(Static.Horizontal);
      else curve.setOrientation(Static.Vertical);
    }

    var styleMap = [
      Curve.CurveStyle.Lines,
      Curve.CurveStyle.Sticks,
      Curve.CurveStyle.Steps,
      Curve.CurveStyle.Dots,
      Curve.CurveStyle.NoCurve,
    ];
    function curveStyle(selectIndex) {
      //curveStyleOptions
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.setStyle(styleMap[selectIndex]);
    }
    Static.bind("curveStyleChanged", function (e, curve) {
      initDlg(curve);
    });

    function setContoursTd(curve) {
      var visible = "Visible";
      if (!curve.testDisplayMode(PlotSpectrogram.DisplayMode.ContourMode))
        visible = "Hidden";
      contoursElement.html(
        visible + ", planes:" + curve.contourLevels().length
      );
    }

    function setSpectrogramTd(curve) {
      var visible = "Visible";
      if (!curve.testDisplayMode(PlotSpectrogram.DisplayMode.ImageMode))
        visible = "Hidden";
      spectrogramElement.html(visible + ", alpha:" + curve.alpha());
    }

    //var axisSpanElement = this.getElementValueDataAttribute("curveAxes");
    function setCurveAxesTd(curve) {
      var vertical = "Left";
      if (curve.yAxis() == Axis.AxisId.yRight) vertical = "Right";
      var horizontal = "Bottom";
      if (curve.xAxis() == Axis.AxisId.xTop) horizontal = "Top";
      axisSpanElement.html(horizontal + ", " + vertical);
    }
    Static.bind("axisChanged", function (e, axis, curve) {
      initDlg(curve);
    });
    //var axisHorizontalSelectElement = this.getElementValueDataAttribute("horizontal");
    function horizontal(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      var axis = selectIndex == 0 ? Axis.AxisId.xBottom : Axis.AxisId.xTop;
      curve.setXAxis(axis);
      setCurveAxesTd(curve);
      Static.trigger("curveAxisChangedViaPropertiesPane", [axis, curve]);
    }
    //var axisVerticalSelectElement = this.getElementValueDataAttribute("vertical");
    function vertical(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      var axis = selectIndex == 0 ? Axis.AxisId.yLeft : Axis.AxisId.yRight;
      curve.setYAxis(axis);
      setCurveAxesTd(curve);
      Static.trigger("curveAxisChangedViaPropertiesPane", [axis, curve]);
    }

    function swapAxesFn(checked) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      if (checked) curve.swapAxes();
      else curve.unSwapAxes();
    }

    this.penIcon = function (curve /* index, size */) {
      if (!curve) return null;
      var height = 16;
      var width = 50;
      var graphic = new Graphic(null, width, height);
      var painter = new PaintUtil.Painter(graphic);
      if (curve.pen().color != Static.NoPen) {
        var pn = curve.pen();
        painter.setPen(pn);
        var y = height * 0.5; //0.5 * parseFloat($("#curvePenIcon_td").css('height'));
        painter.drawLine(0.0, y, width, y);
      }
      painter = null;
      return graphic;
    };
    this.spanElem = null;
    var curvePenSpanElementParent =
      this.getElementValueDataAttribute("curvePen").parent();
    this.setPenIcon = function () {
      //curvePenIcon_td
      var plotItem = plot.findPlotCurve(curveSelectProp.val());
      var tdElem = curvePenSpanElementParent;
      var icon = this.penIcon(plotItem);
      if (this.spanElem) this.spanElem.remove();
      this.spanElem = $('<span id="spanElem" />');
      if (icon) icon.setParent(this.spanElem);
      this.spanElem.appendTo(tdElem);
    };
    var curvePenColorElement =
      this.getElementValueDataAttribute("curvePenColor");
    function curvePenColor(color) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      let pen = curve.pen();
      pen.color = color;
      curve.setPen(pen);
      initDlg(curve);
    }
    Static.bind("penAttributeChanged", function (e, curve) {
      initDlg(curve);
    });
    var curvePenStyles = ["solid", "dot", "dash", "dashDot", "dashDotDot"];
    var curvePenStyleElement =
      this.getElementValueDataAttribute("curvePenStyle");
    function curvePenStyle(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      let pen = curve.pen();
      pen.style = curvePenStyles[selectIndex];
      curve.setPen(pen);
      initDlg(curve);
    }
    var curvePenWidthElement =
      this.getElementValueDataAttribute("curvePenWidth");
    function curvePenWidth(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      let pen = curve.pen();
      pen.width = selectIndex + 1;
      curve.setPen(pen);
      initDlg(curve);
    }

    function minimumZ(val) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.colorRange().setMinValue(val);
      plot.autoRefresh();
    }

    function maximumZ(val) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.colorRange().setMaxValue(val);
      plot.autoRefresh();
    }

    function color1(color) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.setColorInterval(color, Utility.RGB2HTML(curve.color2()));
    }

    function color2(color) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.setColorInterval(Utility.RGB2HTML(curve.color1()), color);
    }

    function numberOfPlanes(val) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      //curve.setContourLevels( curve.calculateContourLevels(val) );
      curve.setNumberOfContourPlanes(parseInt(val));
      setContoursTd(curve);
    }

    function showContours(on) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.showContour(on);
      setContoursTd(curve);
    }

    function showSpectrogram(on) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.showSpectrogram(on);
      setSpectrogramTd(curve);
    }

    function alpha(val) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.setAlpha(parseInt(val));
      setSpectrogramTd(curve);
    }

    function colormap(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      if (selectIndex == 0) {
        curve.setSpectrogramColorMap(Spectrogram.ColorMap.RGBMap);
      } else {
        curve.setSpectrogramColorMap(Spectrogram.ColorMap.IndexMap);
      }
    }

    function interpolation(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      var data = curve.data();
      if (!data.hasOwnProperty("_interpolationType")) return;
      if (selectIndex == 0) {
        data.setInterpolaionType(RasterFileData.InterpolationType.linear);
      } else {
        data.setInterpolaionType(RasterFileData.InterpolationType.cubic);
      }
      curve.invalidateCache();
      curve.itemChanged();
    }

    function curvePenWidth2(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      /* let pen = curve.pen();
            pen.width = selectIndex + 1; */
      curve.setPenWidth(selectIndex + 1);
      //initDlg(curve);
    }

    var curveSymbolSizeElement =
      this.getElementValueDataAttribute("curveSymbolSize");
    this.symbolIcon = function (curve /* index, size */) {
      if (!curve) return null;
      var val = 10; //parseFloat($("#sizeSymbol").val());
      var size = new Misc.Size(val, val);
      var height = val;
      var width = val;
      var graphic = new Graphic(null, width, height);
      var painter = new PaintUtil.Painter(graphic);
      if (curve.symbol()) {
        var sh = height / 2; // + 1;
        if (curve.symbol().style() == Symbol2.Style.Ellipse) {
          //sh -= 1;
        }
        painter.setPen(curve.symbol().pen());
        curve
          .symbol()
          .drawGraphicSymbol(painter, new Misc.Point(width / 2, sh), size);
      }
      painter = null;
      return graphic;
    };
    this.spanElem2 = null;
    var curveSymbolSpanElementParent =
      this.getElementValueDataAttribute("curveSymbol").parent();
    this.setSymbolIcon = function () {
      //curvePenIcon_td
      var plotItem = plot.findPlotCurve(curveSelectProp.val());
      var tdElem = curveSymbolSpanElementParent;
      var icon = this.symbolIcon(plotItem);
      if (this.spanElem2) this.spanElem2.remove();
      this.spanElem2 = $('<span id="spanElem2" />');
      if (icon) icon.setParent(this.spanElem2);
      this.spanElem2.appendTo(tdElem);
    };
    Static.bind("symbolAdded symbolAttributeChanged", function (e, curve) {
      initDlg(curve);
    });
    var curveSymbolPenColorElement = this.getElementValueDataAttribute(
      "curveSymbolPenColor"
    );
    function curveSymbolPenColor(color) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      let sym = curve.symbol();
      if (!sym) {
        return;
      }
      let pen = sym.pen();
      pen.color = color;
      sym.setPen(pen);
      initDlg(curve);
      curve.plot().autoRefresh();
      curve.plot().updateLegend(curve);
    }
    var curveSymbolPenWidthElement = this.getElementValueDataAttribute(
      "curveSymbolPenWidth"
    );
    function curveSymbolPenWidth(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      Utility.setSymbolPenWidth(curve, selectIndex + 1);
      self.setSymbolIcon();
    }
    var curveSymbolBrushColorElement = this.getElementValueDataAttribute(
      "curveSymbolBrushColor"
    );
    function curveSymbolBrushColor(color) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      let sym = curve.symbol();
      if (!sym) {
        return;
      }
      let brush = sym.brush();
      brush.color = color;
      sym.setBrush(brush);
      curve.plot().autoRefresh();
      curve.plot().updateLegend(curve);
      self.setSymbolIcon();
    }
    function addSymbol(curve, style) {
      let _style = Symbol2.Style.NoSymbol; //style == 'None'
      if (style == "MRect") {
        _style = Symbol2.Style.MRect;
      }
      if (style == "Cross") {
        _style = Symbol2.Style.Cross;
      }
      if (style == "Diamond") {
        _style = Symbol2.Style.Diamond;
      }
      if (style == "Ellipse") {
        _style = Symbol2.Style.Ellipse;
      }
      if (style == "XCross") {
        _style = Symbol2.Style.XCross;
      }
      Utility.addSymbol(curve, _style);
    }
    var curveSymbolSizeElement =
      this.getElementValueDataAttribute("curveSymbolSize");
    var curveSymbolStyleElement =
      this.getElementValueDataAttribute("curveSymbolStyle");
    var symbolStyles = [
      "None",
      "MRect",
      "Cross",
      "Diamond",
      "Ellipse",
      "XCross",
    ];
    var symbolStylesInt = [
      Symbol2.Style.MRect,
      Symbol2.Style.Cross,
      Symbol2.Style.Diamond,
      Symbol2.Style.Ellipse,
      Symbol2.Style.XCross,
    ];
    function curveSymbolStyle(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());

      if (symbolStyles[selectIndex] == "None") {
        curveSymbolPenWidthElement.val(1);
        curveSymbolPenColorElement.val(Utility.colorNameToHex("black"));
        curveSymbolBrushColorElement.val(Utility.colorNameToHex("transparent"));
        curveSymbolSizeElement.val(10);
      } else {
      }
      addSymbol(curve, symbolStyles[selectIndex]);
    }
    //var curveSymbolSizeElement = this.getElementValueDataAttribute("curveSymbolSize");
    var symbolSizes = [5, 6, 8, 10, 12, 15];
    //var symbolStylesInt = [MRect, Cross, Diamond, Symbol2.Style.Ellipse, XCross];
    function curveSymbolSize(selectIndex) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      Utility.setSymbolSize(curve, symbolSizes[selectIndex]);
      self.setSymbolIcon();
    }

    var curveFillElement = this.getElementValueDataAttribute("curveFill");
    var curveFillElementParent = curveFillElement.parent();
    this.brushIcon = function (curve, color) {
      if (!curve) return null;
      var val = 12; //parseFloat($("#sizeSymbol").val());
      var size = new Misc.Size(val, val);
      var height = val;
      var width = val;
      var graphic = new Graphic(null, width, height);
      var painter = new PaintUtil.Painter(graphic);
      if (curve.brush().color == "noBrush") return null;
      painter.setBrush(curve.brush());
      //painter.setBrush( new Misc.Brush(curveFillElement.val()) );
      var rc = new Misc.Rect(new Misc.Point(), new Misc.Size(val, val));
      rc.moveCenter(new Misc.Point(val / 2, val / 2));
      painter.drawRect(rc.left(), rc.top(), rc.width(), rc.height());
      painter = null;
      return graphic;
    };
    this.spanElem3 = null;
    var curveFillBrushColorElement = this.getElementValueDataAttribute(
      "curveFillBrushColor"
    );
    var curveFillBrushColorElementParent = curveFillBrushColorElement.parent();
    this.setBrushIcon = function () {
      //curvePenIcon_td
      var plotItem = plot.findPlotCurve(curveSelectProp.val());
      var tdElem = curveFillElementParent;
      var icon = self.brushIcon(plotItem);
      if (this.spanElem3) this.spanElem3.remove();
      this.spanElem3 = $('<span id="spanElem" />');
      if (icon) icon.setParent(this.spanElem3);
      this.spanElem3.appendTo(tdElem);
    };
    function curveFillBrushColor(color) {
      var curve = plot.findPlotCurve(curveSelectProp.val());
      if (curve.fill) {
        let brush = curve.brush();
        brush.color = color;
        curve.setBrush(brush);
      }
      self.setBrushIcon();
    }
    var fillCurveElement = this.getElementValueDataAttribute("fillCurve");
    function fillCurve(checked) {
      var curve = plot.findPlotCurve(curveSelectProp.val());
      curve.fill = checked;
      if (checked) {
        let brush = curve.brush();
        brush.color = curveFillBrushColorElement.val();
        curve.setBrush(brush);
      } else {
        Utility.removeCurveBrush(curve);
      }
      self.setBrushIcon();
      //console.log(curve.brush());
    }
    Static.bind("curveBrushChanged", function (e, curve) {
      initDlg(curve);
      //fillCurveCheckBox[0].checked = true;
      fillCurveCheckBox[0].checked =
        curve.brush().color != "noBrush" ? true : false;
    });
    var baselineElement = this.getElementValueDataAttribute("baseline");
    function baseline(val) {
      let curve = plot.findPlotCurve(curveSelectProp.val());
      curve.setBaseline(parseFloat(val));
    }

    var showContoursElement = self.getElementValueDataAttribute("showContours");
    var numberOfPlanesElement =
      self.getElementValueDataAttribute("numberOfPlanes");
    var showSpectrogramElement =
      self.getElementValueDataAttribute("showSpectrogram");
    var alphaElement = self.getElementValueDataAttribute("alpha");

    var penWidthElement = self.getElementValueDataAttribute("penWidth");
    var color1Element = self.getElementValueDataAttribute("color1");
    var color2Element = self.getElementValueDataAttribute("color2");
    var minimumZElement = self.getElementValueDataAttribute("minimumZ");
    var maximumZElement = self.getElementValueDataAttribute("maximumZ");

    function aspectRatioOneToOneFn() {
      axisHorizontalSelectElement.attr("disabled", Static.aspectRatioOneToOne);
      axisVerticalSelectElement.attr("disabled", Static.aspectRatioOneToOne);
    }

    Static.bind("aspectRatioChanged", function () {
      aspectRatioOneToOneFn();
    });

    function initDlg(curve) {
      if (!curve || curve.title() !== curveSelectProp.val()) {
        return;
      }
      if (curve.rtti === PlotItem.RttiValues.Rtti_Plotcurve)
        fillCurveCheckBox[0].checked =
          curve.brush().color != "noBrush" ? true : false;

      aspectRatioOneToOneFn();
      //if (curve.axesSwapped) {
      if (Static.AxisInYX) {
        swapAxes[0].checked = true;
      } else {
        swapAxes[0].checked = false;
      }

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        self.show("penWidth");
        self.show("colorInterval");
        self.show("colorRange");
        penWidthElement[0].selectedIndex = curve.penWidth() - 1;
        color1Element.val(Utility.RGB2HTML(curve.color1()));
        color2Element.val(Utility.RGB2HTML(curve.color2()));
        var intv = curve.colorRange();
        minimumZElement.val(intv.minValue());
        maximumZElement.val(intv.maxValue());
      } else {
        self.hide("penWidth");
        self.hide("colorInterval");
        self.hide("colorRange");
      }

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectrogram) {
        if (curve.isVisible()) {
          self.show("spectrogram");
          self.show("contours");
        } else {
          self.hide("spectrogram");
          self.hide("contours");
        }

        self.show("colormap");

        if (curve.data().hasOwnProperty("_interpolationType"))
          //plotting from file
          self.show("interpolation");
        else self.hide("interpolation");

        var on = curve.testDisplayMode(PlotSpectrogram.DisplayMode.ImageMode);
        showSpectrogramElement[0].checked = curve.testDisplayMode(
          PlotSpectrogram.DisplayMode.ImageMode
        );
        alphaElement.val(curve.alpha());
        showContoursElement[0].checked = curve.testDisplayMode(
          PlotSpectrogram.DisplayMode.ContourMode
        );
        numberOfPlanesElement.val(curve.contourLevels().length);
        setSpectrogramTd(curve);
        setContoursTd(curve);
      } else {
        self.hide("spectrogram");
        self.hide("contours");
        self.hide("interpolation");
        self.hide("colormap");
      }

      if (
        curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        self.hide("fitCurve");
        self.hide("curveSymbol");
        self.hide("legendAttributes");
        self.hide("orientation");
        self.hide("curveStyle");
        self.hide("curveFill");
        self.hide("baseline");
        self.hide("curvePen");
        self.hide("swapAxes");
        //self.hide("zone");
      } else {
        self.show("fitCurve");
        self.show("curveSymbol");
        self.show("legendAttributes");
        self.show("orientation");
        self.show("curveStyle");
        self.show("curveFill");
        self.show("baseline");
        self.show("curvePen");
        self.show("swapAxes");
        //self.show("zone");
      }
      /* let penStyles = ["solid", "dot", "dash", "dashDot", "dashDotDot"];
            $("#penColor").val(Utility.colorNameToHex(curve.pen().color));
            $("#penWidth")[0].selectedIndex = curve.pen().width - 1;
            $("#penStyle")[0].selectedIndex = penStyles.indexOf(curve.pen().style); */
      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotCurve) {
        curvePenColorElement.val(Utility.colorNameToHex(curve.pen().color));
        curvePenStyleElement[0].selectedIndex = curvePenStyles.indexOf(
          curve.pen().style
        );
        curvePenWidthElement[0].selectedIndex = curve.pen().width - 1;
        if (curve.symbol()) {
          curveSymbolPenColorElement.val(
            Utility.colorNameToHex(curve.symbol().pen().color)
          );
          curveSymbolPenWidthElement[0].selectedIndex =
            curve.symbol().pen().width - 1;
          curveSymbolBrushColorElement.val(
            Utility.colorNameToHex(curve.symbol().brush().color)
          );
          var index = -1;
          var style = curve.symbol().style();
          if (style == "None") index = 0;
          else index = symbolStylesInt.indexOf(curve.symbol().style()) + 1;
          curveSymbolStyleElement[0].selectedIndex = index;
          //console.log(curve.symbol().size())
          curveSymbolSizeElement[0].selectedIndex = symbolSizes.indexOf(
            curve.symbol().size().height
          );
        } else {
          curveSymbolPenColorElement.val(Utility.colorNameToHex("black"));
          curveSymbolPenWidthElement[0].selectedIndex = 0;
          curveSymbolBrushColorElement.val(Utility.colorNameToHex("black"));
          curveSymbolStyleElement[0].selectedIndex = 0;
          //console.log(curve.symbol().size())
          curveSymbolSizeElement[0].selectedIndex = 3;
        }
      }

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotCurve) {
        curveSTyleSelector[0].selectedIndex =
          _.keys(styleMap)[_.values(styleMap).indexOf(curve.style())];
      }

      axisHorizontalSelectElement[0].selectedIndex =
        curve.xAxis() == Axis.AxisId.xBottom ? 0 : 1;
      axisVerticalSelectElement[0].selectedIndex =
        curve.yAxis() == Axis.AxisId.yLeft ? 0 : 1;

      setCurveAxesTd(curve);

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotCurve) {
        self.setPenIcon();
        self.setSymbolIcon();

        //fillCurveElement[0].checked = curve.fill;
        fillCurveCheckBox[0].checked =
          curve.brush().color != "noBrush" ? true : false;
        curveFillBrushColorElement.val(curve.brush().color);
        self.setBrushIcon();

        baselineElement.val(curve.baseline());

        var orientationElement =
          self.getElementValueDataAttribute("orientation");
        if (curve.orientation() == Static.Vertical)
          orientationElement[0].selectedIndex = 0;
        else orientationElement[0].selectedIndex = 1;
      }
    }

    ////////////////////
    //console.log(spectrogramNode)
    Static.bind("visibilityChange", function (e, curve, on) {
      if (
        curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram &&
        curve.title() == curveSelectProp.val()
      ) {
        if (curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectrogram) {
          /* if (on) {
            self.show("spectrogram");
            self.show("contours");
            //curve.setDisplayMode(PlotSpectrogram.DisplayMode.ImageMode, true);
          } else {
            self.hide("spectrogram");
            self.hide("contours");
          } */
          //curve.setDisplayMode(PlotSpectrogram.DisplayMode.ImageMode, on);
        }
      }
    });

    ///////////////////////
  }
}
