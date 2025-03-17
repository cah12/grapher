"include []";
"use strict";
class MCurveSettings {
  /*constructor(_plot) {
    let self = this;
    //let _plot = null;
    let _curveFitCb = null;
    let _curveFitInfoCb = null;
    let _curveAttributeCb = null;
    let _curveStyleCb = null;
    let _curveAxisCb = null;
    $("body").append(
      $(
        '\
                <!-- Modal -->\
                <div class="modal fade" id="curveSettingsModal" role="dialog">\
                <div class="modal-dialog">\
                \
                <!-- Modal content-->\
                <div class="modal-content">\
                <div class="modal-header">\
                <!--button type="button" class="close" data-dismiss="modal">&times;</button-->\
                <h4 class="modal-title">Curve attributes</h4>\
                </div>\
                <div class="modal-body">\
                \
                \
                <div class="row">\
                <div class="col-sm-3">Curve name:</div>\
                <div class="col-sm-5"><select id="curveSelect" style="width:100%"></select></div>\
                <div class="col-sm-2"><button id="remove">Remove</button></div>\
                <div class="col-sm-2"><button id="rename">Rename</button></div>\
                </div>\
                \
                <br>\
                <div class="row">\
                <div class="col-sm-3">Pen color:<input id="penColor" type="color"/></div>\
                <div class="col-sm-4">Pen width:<select id="penWidth" style="width:50%"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>\
                <div class="col-sm-5">Pen style:<select id="penStyle" style="width:60%"><option>solid</option><option>dot</option><option>dash</option><option>dashDot</option><option>dashDotDot</option></select></div>\
                </div>\
                \
                <br>\
                <div class="row">\
                <div class="col-sm-6">Horizontal axis:<select id="horizontalAxis" style="width:50%"><option value="2">Bottom</option><option value="3">Top</option></select></div>\
                <div class="col-sm-5">Vertical axis:<select id="verticalAxis" style="width:60%"><option value="0">Left</option><option value="1">Right</option></select></div>\
                </div>\
                \
                <br>\
                <div class="row">\
                <div class="col-sm-1"><button id="fit">Fit</button></div><div class="col-sm-3"><button id="legendAttribute">Legend attribute</button></div><div class="col-sm-3"><button id="curveStyle">Curve style</button></div><div class="col-sm-2"><button id="curveBrush"> Brush</button></div><div class="col-sm-3"><button id="clearBrush">No brush</button></div><!--div class="col-sm-2"><button id="curveAxis">Axis</button></div-->\
                <div class="col-sm-3"><button id="fitInfo">Curve Fit Info...</button></div>\
                </div>\
                \
                <br>\
                <div class="row">\
                <div class="col-sm-2">Symbols</div>\
                <div class="col-sm-8"><select id="symbolType"><option value="None">None</option><option value="MRect">Rectangle</option><option value="Cross">Cross</option><option value="Diamond">Diamond</option><option value="Ellipse">Ellipse</option><option value="XCross">Diagonal cross</option></select></div>\
                </div>\
                \
                <br>\
                <div id="symbolContainer">\
                <div class="row">\
                <div class="col-sm-6">Symbol pen color:<input id="penColorSymbol" type="color"/></div>\
                <div class="col-sm-6">Symbol pen width:<select id="penWidthSymbol" style="width:50%"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>\
                </div>\
                <br>\
                <div class="row">\
                <div class="col-sm-6">Symbol fill brush:<input id="fillBrushSymbol" type="color"/></div>\
                <div class="col-sm-6">Symbol size:<select id="sizeSymbol" style="width:50%"><option value="5">5x5</option><option value="6">6x6</option><option value="8">8x8</option><option value="10">10x10</option><option value="12">12x12</option><option value="15">15x15</option></select></div>\
                </div>\
                </div>\
                \
                \
                </div>\
                <div class="modal-footer">\
                <button id="cancelAxisDlg" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>\
                <button type="button" class="btn btn-default" data-dismiss="modal">Ok</button>\
                </div>\
                </div>\
                \
                </div>\
                </div>\
                '
      )
    );
    $("#curveSelect").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      initDlg(curve);
    });
    $("#remove").click(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      curve.detach();
      curve.delete();
      if (!_plot.hasPlotCurve()) {
        $("#cancelAxisDlg").click();
        return;
      }
      let opts = $("#curveSelect").children();
      $("#curveSelect")[0].removeChild(
        opts[$("#curveSelect")[0].selectedIndex]
      );
      initDlg(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#rename").click(function () {
      Utility.curveRenameDlg($("#curveSelect").val(), _plot, function () {
        let ind = $("#curveSelect")[0].selectedIndex;
        initCurveSelect();
        $("#curveSelect")[0].selectedIndex = ind;
        return true;
      });
      return true;
    });
    $("#fit").click(function () {
      _curveFitCb(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#legendAttribute").click(function () {
      _curveAttributeCb(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#clearBrush").click(function () {
      Utility.removeCurveBrush(_plot.findPlotCurve($("#curveSelect").val()));
      initClearBrushButton(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#curveBrush").click(function () {
      Utility.setCurveBrush(
        _plot.findPlotCurve($("#curveSelect").val()),
        initClearBrushButton
      );
    });
    $("#curveStyle").click(function () {
      _curveStyleCb(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#curveAxis").click(function () {
      _curveAxisCb(_plot.findPlotCurve($("#curveSelect").val()));
    });
    $("#fitInfo").click(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let info = _curveFitInfoCb(curve);
      if (info.length) {
        Utility.alert(info);
      } else {
        Utility.alert(
          'No curve fitting equation found for "' + curve.title() + '."'
        );
      }
    });
    $("#penColor").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let pen = curve.pen();
      pen.color = $(this).val();
      curve.setPen(pen);
    });
    $("#penWidth").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let pen = curve.pen();
      pen.width = $(this).val();
      curve.setPen(pen);
    });
    $("#penStyle").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let pen = curve.pen();
      pen.style = $(this).val();
      curve.setPen(pen);
    });
    $("#horizontalAxis").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      curve.setXAxis($(this).val());
      Static.trigger("axisChanged", [$(this).val(), curve]);
    });
    $("#verticalAxis").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      curve.setYAxis($(this).val());
      Static.trigger("axisChanged", [$(this).val(), curve]);
    });
    $("#symbolType").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      if ($("#symbolType").val() == "None") {
        $("#symbolContainer").hide();
        //restore default pen, brush color and symbol size
        $("#penWidthSymbol").val(1);
        $("#penColorSymbol").val(Utility.colorNameToHex("black"));
        $("#fillBrushSymbol").val(Utility.colorNameToHex("transparent"));
        $("#sizeSymbol").val(10);
      } else {
        $("#symbolContainer").show();
      }
      addSymbol(curve, $(this).val());
    });
    $("#penColorSymbol").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let sym = curve.symbol();
      if (!sym) {
        return;
      }
      let pen = sym.pen();
      pen.color = $(this).val();
      sym.setPen(pen);
      curve.plot().autoRefresh();
      curve.plot().updateLegend(curve);
    });
    $("#penWidthSymbol").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      setSymbolPenWidth(curve, parseInt($(this).val()));
    });
    $("#fillBrushSymbol").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      let sym = curve.symbol();
      if (!sym) {
        return;
      }
      let pen = sym.brush();
      pen.color = $(this).val();
      sym.setBrush(pen);
      curve.plot().autoRefresh();
      curve.plot().updateLegend(curve);
    });
    $("#sizeSymbol").change(function () {
      let curve = _plot.findPlotCurve($("#curveSelect").val());
      setSymbolSize(curve, parseInt($(this).val()));
    });
    function addSymbol(curve, style) {
      if (style == "None") {
        curve.setSymbol(null);
        return;
      }
      let _style = -1;
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
    function setSymbolPenWidth(curve, width) {
      Utility.setSymbolPenWidth(curve, width);
    }
    function setSymbolSize(curve, value) {
      Utility.setSymbolSize(curve, value);
    }
    function initCurveSelect() {
      let opts = $("#curveSelect").children();
      for (let i = 0; i < opts.length; ++i) {
        $("#curveSelect")[0].removeChild(opts[i]);
      }
      let curves = _plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let i = 0; i < curves.length; ++i) {
        if (curves[i].isVisible()) {
          let opt = $("<option>" + curves[i].title() + "</option>");
          opt.attr("value", curves[i].title());
          $("#curveSelect").append(opt);
        }
      }
      $("#sizeSymbol").val(10);
      if (curves.length) {
        return curves[0];
      }
      return null;
    }
    function initClearBrushButton(curve) {
      if (curve.brush().color == Static.NoBrush) {
        $("#clearBrush").hide();
      } else {
        $("#clearBrush").show();
      }
    }
    function initDlg(curve) {
      if (!curve) return;
      let penStyles = ["solid", "dot", "dash", "dashDot", "dashDotDot"];
      $("#penColor").val(Utility.colorNameToHex(curve.pen().color));
      $("#penWidth")[0].selectedIndex = curve.pen().width - 1;
      $("#penStyle")[0].selectedIndex = penStyles.indexOf(curve.pen().style);
      $("#horizontalAxis")[0].selectedIndex = curve.xAxis() - 2;
      $("#verticalAxis")[0].selectedIndex = curve.yAxis();
      if (!curve.fitType) {
        $("#fitInfo").hide();
      } else {
        $("#fitInfo").show();
      }
      initClearBrushButton(curve);
      let symbol = curve.symbol();
      if (symbol) {
        let symbolStyle = symbol.style();
        if (symbolStyle == Symbol2.Style.MRect) $("#symbolType").val("MRect");
        if (symbolStyle == Symbol2.Style.Cross) $("#symbolType").val("Cross");
        if (symbolStyle == Symbol2.Style.Diamond)
          $("#symbolType").val("Diamond");
        if (symbolStyle == Symbol2.Style.Ellipse)
          $("#symbolType").val("Ellipse");
        if (symbolStyle == Symbol2.Style.XCross) $("#symbolType").val("XCross");
      } else {
        $("#symbolType").val("None");
      }
      if ($("#symbolType").val() == "None") {
        $("#symbolContainer").hide();
      } else {
        $("#symbolContainer").show();
        $("#penColorSymbol").val(symbol.pen().color);
        $("#penWidthSymbol").val(symbol.pen().width);
        $("#fillBrushSymbol").val(symbol.brush().color);
        $("#sizeSymbol").val(symbol.size().width);
      }
    }
    this.init = function () {
      _curveFitCb = _plot.curveFitDlg.curveFitCb;
      _curveFitInfoCb = _plot.curveFitDlg.curveFitInfoCb;
      _curveAttributeCb = _plot.curveAttributeDlg.curveAttributeCb;
      _curveStyleCb = _plot.curveStyleDlg.curveStyleCb;
      _curveAxisCb = _plot.axisDlg.axisCb;
    };
    this.curveSettingsDlg = function () {
      if (!_plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length) {
        Utility.alert("No curves found", "small");
      } else {
        initDlg(initCurveSelect());
        $("#curveSettingsModal").modal({
          backdrop: "static",
        });
      }
    };

    this.init();
  }*/
}
