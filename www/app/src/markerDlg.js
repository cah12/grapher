"include ['fontPicker']";
"use strict";
class MMarkerDlg {
  constructor() {
    const self = this;
    var fontDlg = null;

    /* Remove any $("#markerModal") from the DOM before appending a new one.*/
    fontDlg = new MFontPickerDlg();
    fontDlg.labelFont = new Misc.Font();
    $("#markerModal").remove();
    const dlg = $(
      '\
                        <div class="modal fade" id="markerModal" role="dialog">\
                        <div class="modal-dialog modal-md">\
                        <div class="modal-content">\
                        <div class="modal-header">\
                        <button type="button" class= "close" id="closeMarkerDlg">&times;</button>\
                        <h4 id="markerTitle" class="modal-title">Marker</h4>\
                        </div>\
                        <div class="modal-body">\
\
\
\
  <!--div class="panel panel-default">\
    <div class="panel-heading">Panel Heading</div>\
    <div class="panel-body">\
    Panel Content\
    </div>\
  </div-->\
\
\
\
  <div class="panel panel-default">\
    <div class="panel-heading">General</div>\
    <div class="panel-body">\
    <div class="row"><!--row start-->\
    <div class="col-sm-3">Name</div>\
    <div class="col-sm-3"><input id="marker_name" type="text"      value="marker_1" style="width:100%"></div>\
    <div class="col-sm-3">Show on legend</div><div class="col-sm-3"><input id="marker_legend" type="checkbox"></div>\
    </div><!--row end-->\
    <div class="row"><!--row start-->\
    <div class="col-sm-3">Horizontal axis:</div>\
    <div class="col-sm-3">\
       <select id="markerHorizontalAxis"style="width:100%">\
         <option value="markerAxisBottom">Bottom</option>\
         <option value="markerAxisTop">Top</option>\
	 </select>\
    </div>\
    <div class="col-sm-3">Vertical axis:</div>\
    <div class="col-sm-3">\
       <select id="markerVerticalAxis"style="width:100%">\
         <option value="markerAxisLeft">Left</option>\
         <option value="markerAxisRight">Right</option>\
       </select>\
     </div>\
    </div><!--row end-->\
    <div class="row"><!--row start-->\
    <div class="col-sm-3">X-value</div>\
    <div class="col-sm-3"><input id="marker_xValue" type="text"  value=0.0 size="6" style="width:100%"></div>\
    <div class="col-sm-3">Y-value</div>\
<div class="col-sm-3"><input id="marker_yValue" type="text" value=0.0 size="6" style="width:100%"></div>\
    </div><!--row end-->\
    </div>\
  </div>\
\
\
\
<div class="panel panel-default">\
    <div class="panel-heading">Label</div>\
    <div class="panel-body">\
    <div class="row"><!--row start-->\
    <div class="col-sm-3">Text</div>\
    <div class="col-sm-3"><input id="marker_label" type="text"  value="Marker 1" size=12 style="width:100%"></div>\
    <div class="col-sm-1">Font</div>\
<div class="col-sm-1"><input id="marker_labelFont" type="button" value="//"></div>\
    <div class="col-sm-1">Space</div>\
<div class="col-sm-3"><input id="marker_labelSpace" type="number" value=2 min=2 max=40 style="width:100%"></div>\
    </div><!--row end-->\
    <div class="row"><!--row start-->\
    <div class="col-sm-3">Alignment:</div>\
    <div class="col-sm-3">\
       <select id="markerLabelAlignment" style="width:100%">\
        <option value="markerAlignmentLeftTop">Left-Top</option>\
		<option value="markerAlignmentLeftCenter">Left-Center</option>\
        <option value="markerAlignmentLeftBottom">Left-Bottom </option>\
        <option value="markerAlignmentRightTop">Right-Top</option>\
		<option value="markerAlignmentRightCenter">Right-Center</option>\
        <option value="markerAlignmentRightBottom">Right-Bottom</option>\
	    <option value="markerAlignmentCenterTop">Center-Top</option>\
		<option value="markerAlignmentCenterCenter">Center-Center</option>\
        <option value="markerAlignmentCenterBottom">Center-Bottom</option>\
       </select>\
    </div>\
    <div class="col-sm-3">Orientation:</div>\
    <div class="col-sm-3">\
       <select id="markerLabelOrientation" style="width:100%">\
         <option value="markerLabelHorizontal">Horizontal</option>\
         <option value="markerLabelVertical">Vertical</option>\
       </select>\
    </div>\
    </div><!--row end-->\
    </div>\
  </div>\
\
\
\
<div class="panel panel-default">\
    <div class="panel-heading">Line</div>\
    <div class="panel-body">\
    <div class="row"><!--row start-->\
    <div class="col-sm-1">Style:</div>\
    <div class="col-sm-3">\
      <select id="markerLineStyle">\
	   <option value=NoLine>No line</option>\
        <option value=VLine>Vertical line</option>\
        <option value=HLine>Horizontal line</option>\
	   <option value=Cross>Cross line</option>\
      </select>\
    </div>\
    <div class="col-sm-2">Pen color</div>\
    <div class="col-sm-1"><input id="marker_lineColor" type="color" style="width:100%"></div>\
    <div class="col-sm-2">Pen type:</div>\
    <div class="col-sm-3">\
      <select id="markerLineType" style="width:100%">\
	   <option value=solid>solid</option>\
        <option value=dot>dot</option>\
        <option value=dash>dash</option>\
	   <option value=dashDot>dash-dot</option>\
	   <option value=dashDotDot>dash-dot-dot</option>\
	 </select>\
    </div>\
    </div><!--row end-->\
    </div>\
  </div>\
\
\
\
<div class="panel panel-default">\
    <div class="panel-heading">Symbol</div>\
    <div class="panel-body">\
    <div class="row"><!--row start-->\
    <div class="col-sm-1">Style:</div>\
                        <div class="col-sm-3">\
                        <select id="markerSymbol">\
						<option value=none>No symbol</option>\
                        <option value=arrow>Arrow</option>\
                        <option value=dotOnLine>Dot-on-line</option>\
						</select>\
                        </div>\
						<div class="col-sm-1">Angle:</div>\
                        <div class="col-sm-2"><input id="marker_symbolAngle" type="number" style="width:100%" value=0.0></div>\
<div class="col-sm-3">Size(widthXheight)</div>\
                        <div class="col-sm-1" title="width x height">\
                        <select id="markerSymbolSize">\
					<option value="6x6">6x6</option>\
                        	<option value="6x8">6x8</option>\
                        	<option value="6x10">6x10</option>\
					<option value="6x12">6x12</option>\
                        	<option value="6x14">6x14</option>\
					<option value="8x6">8x6</option>\
                        	<option value="8x8">8x8</option>\
                        	<option value="8x10">8x10</option>\
					<option value="8x12">8x12</option>\
                        	<option value="8x14">8x14</option>\
					<option value="10x6">10x6</option>\
                        	<option value="10x8">10x8</option>\
                        	<option value="10x10">10x10</option>\
					<option value="10x12">10x12</option>\
                        	<option value="10x14">10x14</option>\
					<option value="12x6">12x6</option>\
                        	<option value="12x8">12x8</option>\
                        	<option value="12x10">12x10</option>\
					<option value="12x12">12x12</option>\
                        	<option value="12x14">12x14</option>\
					<option value="14x6">14x6</option>\
                        	<option value="14x8">14x8</option>\
                        	<option value="14x10">14x10</option>\
					<option value="14x12">14x12</option>\
                        	<option value="14x14">14x14</option>\
				  </select>\
                        </div>\
    </div><!--row end-->\
    </div>\
  </div>\
\
\
\
\
<div class="modal-footer">\
                        <button id="markerDlg_cancel" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>\
						<button id="markerDlg_remove" type="button" class="btn btn-default">Remove</button>\
                        <button id="markerDlg_ok" type="button" class="btn btn-default">Ok</button>\
                        </div>\
                        </div>\
                        </div>\
                        </div>\
                        </div>\
                        '
    );

    $("body").append(dlg);

    $("#markerSymbolSize").val("14x14");

    $("#markerDlg_ok").click(okCb);
    $("#markerDlg_remove").click(removeCb);
    $("#closeMarkerDlg").click(closeCb);
    $("#marker_name").focusout(focusoutCb);
    $("#marker_labelFont").click(labelFontCb);

    $("#markerLineStyle").click(function () {
      if ($(this).val() == "NoLine") {
        $("#marker_lineColor").attr("disabled", true);
        $("#markerLineType").attr("disabled", true);
      } else {
        $("#marker_lineColor").attr("disabled", false);
        $("#markerLineType").attr("disabled", false);
      }
    });

    $("#markerModal").on("shown.bs.modal", function () {
      $("#markerDlg_ok").trigger("focus");
    });

    this.markerCb = function (plot) {
      $("body").append(dlg);
      self.plot = plot;
      showDlg();
    };

    function removeCb() {
      var marker = self.plot.findPlotMarker($("#marker_name").val());
      if (marker) {
        // marker.detach();
        // marker.delete();
        self.plot.trashDlg.trash(marker);
        closeCb();
      }
    }

    function initDlg() {
      fontDlg.labelFont = new Misc.Font();
      var marker = self.plot.findPlotMarker($("#marker_name").val());
      if (marker) {
        fontDlg.labelFont = marker.labelFont();
        $("#markerDlg_remove").attr("disabled", false);
        $("#marker_label").val(marker.label());
        $("#marker_xValue").val(marker.xValue());
        $("#marker_yValue").val(marker.yValue());

        $("#marker_labelSpace").val(marker.spacing());

        if (
          marker.labelAlignment() & Static.AlignLeft &&
          marker.labelAlignment() & Static.AlignTop
        ) {
          $("#markerLabelAlignment").val("markerAlignmentLeftTop");
        } else if (
          marker.labelAlignment() & Static.AlignLeft &&
          marker.labelAlignment() & Static.AlignCenter
        ) {
          $("#markerLabelAlignment").val("markerAlignmentLeftCenter");
        } else if (
          marker.labelAlignment() & Static.AlignLeft &&
          marker.labelAlignment() & Static.AlignBottom
        ) {
          $("#markerLabelAlignment").val("markerAlignmentLeftBottom");
        } else if (
          marker.labelAlignment() & Static.AlignRight &&
          marker.labelAlignment() & Static.AlignTop
        ) {
          $("#markerLabelAlignment").val("markerAlignmentRightTop");
        } else if (
          marker.labelAlignment() & Static.AlignRight &&
          marker.labelAlignment() & Static.AlignCenter
        ) {
          $("#markerLabelAlignment").val("markerAlignmentRightCenter");
        } else if (
          marker.labelAlignment() & Static.AlignRight &&
          marker.labelAlignment() & Static.AlignBottom
        ) {
          $("#markerLabelAlignment").val("markerAlignmentRightBottom");
        } else if (
          marker.labelAlignment() & Static.AlignCenter &&
          marker.labelAlignment() & Static.AlignTop
        ) {
          $("#markerLabelAlignment").val("markerAlignmentCenterTop");
        } else if (
          marker.labelAlignment() & Static.AlignCenter &&
          marker.labelAlignment() & Static.AlignBottom
        ) {
          $("#markerLabelAlignment").val("markerAlignmentCenterBottom");
        } else if (marker.labelAlignment() & Static.AlignCenter) {
          $("#markerLabelAlignment").val("markerAlignmentCenterCenter");
        }

        if (marker.labelOrientation() == Static.Horizontal) {
          $("#markerLabelOrientation").val("markerLabelHorizontal");
        } else {
          $("#markerLabelOrientation").val("markerLabelVertical");
        }

        if (marker.testItemAttribute(PlotItem.ItemAttribute.Legend)) {
          $("#marker_legend")[0].checked = true;
        } else {
          $("#marker_legend")[0].checked = false;
        }
        if (marker.xAxis() === Axis.AxisId.xBottom)
          $("#markerHorizontalAxis").val("markerAxisBottom");
        else $("#markerHorizontalAxis").val("markerAxisTop");
        if (marker.yAxis() === Axis.AxisId.yLeft)
          $("#markerVerticalAxis").val("markerAxisLeft");
        else $("#markerVerticalAxis").val("markerAxisRight");

        var mstyle = "NoLine";
        var lineStyle = marker.lineStyle();
        if (lineStyle == PlotMarker.LineStyle.VLine) mstyle = "VLine";
        else if (lineStyle == PlotMarker.LineStyle.HLine) mstyle = "HLine";
        else if (lineStyle == PlotMarker.LineStyle.Cross) mstyle = "Cross";
        $("#markerLineStyle").val(mstyle);

        $("#marker_lineColor").val(marker.linePen().color);
        $("#markerLineType").val(marker.linePen().style);

        var symbol = marker.symbol();
        if (symbol) {
          if (symbol.type === "arrow") {
            $("#markerSymbol").val("arrow");
          } else if (symbol.type === "dotOnLine") {
            $("#markerSymbol").val("dotOnLine");
          }
          var path = symbol.path();
          if (path) {
            $("#marker_symbolAngle").val(parseFloat(path.data.rotation));
          }
        } else {
          $("#markerSymbol").val("none");
        }
      } else {
        $("#markerDlg_remove").attr("disabled", true);
        //$("#marker_lineColor").attr("disabled", true);
        //$("#markerLineType").attr("disabled", true);
      }
      if ($("#markerLineStyle").val() == "NoLine") {
        $("#marker_lineColor").attr("disabled", true);
        $("#markerLineType").attr("disabled", true);
      } else {
        $("#marker_lineColor").attr("disabled", false);
        $("#markerLineType").attr("disabled", false);
      }

      if (symbol) {
        if (symbol.size().width == 6 && symbol.size().height == 6)
          $("#markerSymbolSize").val("6x6");
        else if (symbol.size().width == 6 && symbol.size().height == 8)
          $("#markerSymbolSize").val("6x8");
        else if (symbol.size().width == 6 && symbol.size().height == 10)
          $("#markerSymbolSize").val("6x10");
        else if (symbol.size().width == 6 && symbol.size().height == 12)
          $("#markerSymbolSize").val("6x12");
        else if (symbol.size().width == 6 && symbol.size().height == 14)
          $("#markerSymbolSize").val("6x14");
        else if (symbol.size().width == 8 && symbol.size().height == 6)
          $("#markerSymbolSize").val("8x6");
        else if (symbol.size().width == 8 && symbol.size().height == 8)
          $("#markerSymbolSize").val("8x8");
        else if (symbol.size().width == 8 && symbol.size().height == 10)
          $("#markerSymbolSize").val("8x10");
        else if (symbol.size().width == 8 && symbol.size().height == 12)
          $("#markerSymbolSize").val("8x12");
        else if (symbol.size().width == 8 && symbol.size().height == 14)
          $("#markerSymbolSize").val("8x14");
        else if (symbol.size().width == 10 && symbol.size().height == 6)
          $("#markerSymbolSize").val("10x6");
        else if (symbol.size().width == 10 && symbol.size().height == 8)
          $("#markerSymbolSize").val("10x8");
        else if (symbol.size().width == 10 && symbol.size().height == 10)
          $("#markerSymbolSize").val("10x10");
        else if (symbol.size().width == 10 && symbol.size().height == 12)
          $("#markerSymbolSize").val("10x12");
        else if (symbol.size().width == 10 && symbol.size().height == 14)
          $("#markerSymbolSize").val("10x14");
        else if (symbol.size().width == 12 && symbol.size().height == 6)
          $("#markerSymbolSize").val("12x6");
        else if (symbol.size().width == 12 && symbol.size().height == 8)
          $("#markerSymbolSize").val("12x8");
        else if (symbol.size().width == 12 && symbol.size().height == 10)
          $("#markerSymbolSize").val("12x10");
        else if (symbol.size().width == 12 && symbol.size().height == 12)
          $("#markerSymbolSize").val("12x12");
        else if (symbol.size().width == 12 && symbol.size().height == 14)
          $("#markerSymbolSize").val("12x14");
        else if (symbol.size().width == 14 && symbol.size().height == 6)
          $("#markerSymbolSize").val("14x6");
        else if (symbol.size().width == 14 && symbol.size().height == 8)
          $("#markerSymbolSize").val("14x8");
        else if (symbol.size().width == 14 && symbol.size().height == 10)
          $("#markerSymbolSize").val("14x10");
        else if (symbol.size().width == 14 && symbol.size().height == 12)
          $("#markerSymbolSize").val("14x12");
        else if (symbol.size().width == 14 && symbol.size().height == 14)
          $("#markerSymbolSize").val("14x14");
      }
    }

    function focusoutCb() {
      initDlg();
    }

    /* fontColor: "black"
name: "Arial"
style: "normal"
th: 12
weight: "normal" */

    function labelFontCb() {
      var marker = self.plot.findPlotMarker($("#marker_name").val());
      var font;
      if (marker) {
        //console.log(marker.title());
        fontDlg.labelFont = marker.labelFont();
      } else {
        //fontDlg.labelFont = new Misc.Font();
      }
      fontDlg.fontPickerCb();
      //fontDlg.labelFont = new Misc.Font();
    }

    function closeCb() {
      $("#markerDlg_cancel").click();
    }

    /* // an arrow at a specific position
		var mPos = new PlotMarker( "Marker" );
		mPos.setItemAttribute( PlotItem.ItemAttribute.Legend, true );
		mPos.setSymbol(new ArrowSymbol() );
		mPos.setValue(new Misc.Point( x, Math.sin( x ) ) );
		mPos.setLabel( "x = " + x );
		mPos.setLabelAlignment( Static.AlignRight | Static.AlignBottom );

		mPos.attach( this ); */

    function okCb() {
      var marker = self.plot.findPlotMarker($("#marker_name").val());
      if (marker) {
        marker.detach();
        //marker = null;
      }
      marker = new PlotMarker($("#marker_name").val());
      marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

      marker.setSpacing(parseInt($("#marker_labelSpace").val()));

      marker.setLabelFont(new Misc.Font(fontDlg.labelFont));

      if ($("#markerHorizontalAxis").val() === "markerAxisBottom")
        marker.setXAxis(Axis.AxisId.xBottom);
      else marker.setXAxis(Axis.AxisId.xTop);
      if ($("#markerVerticalAxis").val() === "markerAxisLeft")
        marker.setYAxis(Axis.AxisId.yLeft);
      else marker.setYAxis(Axis.AxisId.yRight);
      if ($("#markerSymbol").val() === "arrow")
        marker.setSymbol(
          new ArrowSymbol(parseFloat($("#marker_symbolAngle").val()))
        );
      else if ($("#markerSymbol").val() === "dotOnLine")
        marker.setSymbol(
          new DotOnLineSymbol(parseFloat($("#marker_symbolAngle").val()))
        );

      marker.setLinePen(
        new Misc.Pen(
          $("#marker_lineColor").val(),
          1,
          $("#markerLineType").val()
        )
      );

      if ($("#markerLineStyle").val() === "HLine")
        marker.setLineStyle(PlotMarker.LineStyle.HLine);
      else if ($("#markerLineStyle").val() === "VLine")
        marker.setLineStyle(PlotMarker.LineStyle.VLine);
      else if ($("#markerLineStyle").val() === "Cross")
        marker.setLineStyle(PlotMarker.LineStyle.Cross);
      else {
        marker.setLineStyle(PlotMarker.LineStyle.NoLine);
      }

      //call marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true) after lineStyle and or symbolType is set
      if ($("#marker_legend")[0].checked) {
        marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
      } else {
        marker.setItemAttribute(PlotItem.ItemAttribute.Legend, false);
      }

      marker.setLegendIconSize(new Misc.Size(20, 20));

      var xVal = math.evaluate(
        self.plot.defines.expandDefines($("#marker_xValue").val())
      );

      var yVal = math.evaluate(
        self.plot.defines.expandDefines($("#marker_yValue").val())
      );
      marker.setValue(new Misc.Point(xVal, yVal));
      marker.setLabel($("#marker_label").val());
      //var labelAlignment = Static.AlignRight;
      if ($("#markerLabelAlignment").val() == "markerAlignmentLeftTop") {
        marker.setLabelAlignment(Static.AlignLeft | Static.AlignTop);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentLeftCenter"
      ) {
        marker.setLabelAlignment(Static.AlignLeft | Static.AlignCenter);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentLeftBottom"
      ) {
        marker.setLabelAlignment(Static.AlignLeft | Static.AlignBottom);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentRightTop"
      ) {
        marker.setLabelAlignment(Static.AlignRight | Static.AlignTop);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentRightCenter"
      ) {
        marker.setLabelAlignment(Static.AlignRight | Static.AlignCenter);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentRightBottom"
      ) {
        marker.setLabelAlignment(Static.AlignRight | Static.AlignBottom);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentCenterTop"
      ) {
        marker.setLabelAlignment(Static.AlignCenter | Static.AlignTop);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentCenterCenter"
      ) {
        marker.setLabelAlignment(Static.AlignCenter);
      } else if (
        $("#markerLabelAlignment").val() == "markerAlignmentCenterBottom"
      ) {
        marker.setLabelAlignment(Static.AlignCenter | Static.AlignBottom);
      }

      if ($("#markerLabelOrientation").val() == "markerLabelHorizontal") {
        marker.setLabelOrientation(Static.Horizontal);
      } else if ($("#markerLabelOrientation").val() == "markerLabelVertical") {
        marker.setLabelOrientation(Static.Vertical);
      }

      var m_symbol = marker.symbol();
      if (m_symbol) {
        if ($("#markerSymbolSize").val() === "6x6")
          m_symbol.setSize(new Misc.Size(6, 6));
        else if ($("#markerSymbolSize").val() === "6x10")
          m_symbol.setSize(new Misc.Size(6, 12));
        else if ($("#markerSymbolSize").val() === "6x12")
          m_symbol.setSize(new Misc.Size(6, 12));
        else if ($("#markerSymbolSize").val() === "6x14")
          m_symbol.setSize(new Misc.Size(6, 14));
        else if ($("#markerSymbolSize").val() === "8x6")
          m_symbol.setSize(new Misc.Size(8, 6));
        else if ($("#markerSymbolSize").val() === "8x8")
          m_symbol.setSize(new Misc.Size(8, 8));
        else if ($("#markerSymbolSize").val() === "8x10")
          m_symbol.setSize(new Misc.Size(8, 10));
        else if ($("#markerSymbolSize").val() === "8x12")
          m_symbol.setSize(new Misc.Size(8, 12));
        else if ($("#markerSymbolSize").val() === "8x14")
          m_symbol.setSize(new Misc.Size(8, 14));
        else if ($("#markerSymbolSize").val() === "10x6")
          m_symbol.setSize(new Misc.Size(10, 6));
        else if ($("#markerSymbolSize").val() === "10x8")
          m_symbol.setSize(new Misc.Size(10, 8));
        else if ($("#markerSymbolSize").val() === "10x10")
          m_symbol.setSize(new Misc.Size(10, 10));
        else if ($("#markerSymbolSize").val() === "10x12")
          m_symbol.setSize(new Misc.Size(10, 12));
        else if ($("#markerSymbolSize").val() === "10x14")
          m_symbol.setSize(new Misc.Size(10, 14));
        else if ($("#markerSymbolSize").val() === "12x6")
          m_symbol.setSize(new Misc.Size(12, 6));
        else if ($("#markerSymbolSize").val() === "12x8")
          m_symbol.setSize(new Misc.Size(12, 8));
        else if ($("#markerSymbolSize").val() === "12x10")
          m_symbol.setSize(new Misc.Size(12, 10));
        else if ($("#markerSymbolSize").val() === "12x12")
          m_symbol.setSize(new Misc.Size(12, 12));
        else if ($("#markerSymbolSize").val() === "12x14")
          m_symbol.setSize(new Misc.Size(12, 14));
        else if ($("#markerSymbolSize").val() === "14x6")
          m_symbol.setSize(new Misc.Size(14, 6));
        else if ($("#markerSymbolSize").val() === "14x8")
          m_symbol.setSize(new Misc.Size(14, 8));
        else if ($("#markerSymbolSize").val() === "14x10")
          m_symbol.setSize(new Misc.Size(14, 10));
        else if ($("#markerSymbolSize").val() === "14x12")
          m_symbol.setSize(new Misc.Size(14, 12));
        else if ($("#markerSymbolSize").val() === "14x14")
          m_symbol.setSize(new Misc.Size(14, 14));

        //marker.setSymbol(m_symbol)
      }

      //marker.setLegendIconSize(new Misc.Size(20,20))
      //marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);

      marker.attach(self.plot);

      closeCb();
      self.plot.autoRefresh();
    }

    function showDlg() {
      /* var marker = self.plot.findPlotMarker($("#marker_name").val());
			if(marker){
				$("#markerDlg_remove").attr("disabled", false);
			}else{
				$("#markerDlg_remove").attr("disabled", true);
			} */

      initDlg();
      //fontDlg.labelFont = new Misc.Font();
      $("#markerModal").modal({
        backdrop: "static",
      });
    }

    dlg.on("hidden.bs.modal", function () {
      dlg.detach();
    });

    dlg.detach();
  }
}
