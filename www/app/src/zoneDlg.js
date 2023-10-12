"use strict";

"include []";

class ZoneDlg {
  constructor() {
    var self = this;
    var _plot = null;
    const dlg = $(
      '\
                        <div class="modal fade" id="zoneModal" role="dialog">\
                        <div class="modal-dialog modal-sm">\
                        <div class="modal-content">\
                        <div class="modal-header">\
                        <button type="button" class="close" data-dismiss="modal">&times;</button>\
                        <h4 class="modal-title">Zone Item</h4>\
                        </div>\
                        <div class="modal-body">\
                        <div class="row">\
                        <div class="col-sm-4">Zone title:</div>\
                        <div class="col-sm-8">\
                        <input id="zoneTitle" type="text" style="width:100%"/>\
                        </div>\
                        </div>\
                        <br>\
                        <div class="row">\
                        <div class="col-sm-5">Orientation:</div>\
                        <div class="col-sm-7">\
                        <select id="zoneOrientation" style="width:100%">\
                        <option value="Vertical">Vertical</option>\
                        <option value="Horizontal">Horizontal</option>\
                        </select>\
                        </div>\
                        </div>\
                        <br>\
                        <div class="row">\
                        <div class="col-sm-7">Horizontal axis:</div>\
                        <div class="col-sm-5">\
                        <select id="zoneHorizontalAxis" style="width:100%">\
                        <option value="Bottom">Bottom</option>\
                        <option value="Top">Top</option>\
                        </select>\
                        </div>\
                        </div>\
                        <br>\
                        <div class="row">\
                        <div class="col-sm-7">Vertical axis:</div>\
                        <div class="col-sm-5">\
                        <select id="zoneVerticalAxis" style="width:100%">\
                        <option value="Left">Left</option>\
                        <option value="Right">Right</option>\
                        </select>\
                        </div>\
                        </div>\
                        <br>\
                        \
                        \
                        <div class="row">\
                        <div id="lowerLimitLabel" class="col-sm-2">\
                        Left:\
                        </div>\
                        <div class="col-sm-4">\
                        <input id="lowerLimit" type="number" value="0" style="width:100%"/>\
                        </div>\
                        <div id="upperLimitLabel" class="col-sm-2">\
                        Right:\
                        </div>\
                        <div class="col-sm-4">\
                        <input id="upperLimit" type="number" value="1" style="width:100%"/>\
                        </div>\
                        </div>\
                        <br>\
                        \
                        \
                        <div class="row">\
                        <div class="col-sm-6">\
                        <input id="brushColor" type="color" value="#D3D3D3"> Brush</color>\
                        </div>\
                        <div class="col-sm-6">\
                        <input id="penColor" type="color" value="#000000"> Pen</color>\
                        </div>\
                        </div>\
                        <br>\
                        <div class="row">\
                        <div class="col-sm-7">Represent zone item on the legend:</div>\
                        <div class="col-sm-2"><input id="representOnLegend" type="checkbox" checked/></div>\
                        </div>\
                        </div>\
                        <br>\
                        <div class="modal-footer">\
                        <button id="zoneDlg_ok" type="button" class="btn btn-default">Ok</button>\
                        </div>\
                        </div>\
                        </div>\
                        </div>\
                        </div>\
                        '
    );

    $("body").append(dlg);

    $("#zoneModal").on("shown.bs.modal", function () {
      $("#zoneDlg_ok").trigger("focus");
    });

    $("#zoneDlg_ok").click(function () {
      if (_plot.findPlotCurve($("#zoneTitle").val())) {
        alert(`${$("#zoneTitle").val()} already exist.`);
        return;
      }

      const z = new PlotZoneItem($("#zoneTitle").val());
      z.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
      const lowerLimit = parseFloat($("#lowerLimit").val());
      const upperLimit = parseFloat($("#upperLimit").val());
      if (lowerLimit > upperLimit) {
        alert(
          `${$("#lowerLimitLabel")
            .html()
            .trim()
            .replace(":", "")} cannot be greater than ${$("#upperLimitLabel")
            .html()
            .trim()
            .replace(":", "")}. Please retry.`
        );
        return;
      }
      z.setInterval(
        parseFloat($("#lowerLimit").val()),
        parseFloat($("#upperLimit").val())
      );

      z.setAxes(
        $("#zoneHorizontalAxis").val() == "Bottom"
          ? Axis.AxisId.xBottom
          : Axis.AxisId.xTop,
        $("#zoneVerticalAxis").val() == "Left"
          ? Axis.AxisId.xLeft
          : Axis.AxisId.yRight
      );
      z.setPen(new Misc.Pen($("#penColor").val()));
      z.setBrush(new Misc.Brush($("#brushColor").val()));
      if ($("#zoneOrientation").val() == "Vertical")
        z.setOrientation(Static.Vertical);
      else z.setOrientation(Static.Horizontal);
      if ($("#representOnLegend")[0].checked)
        z.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
      z.attach(_plot);
      $("#zoneModal").modal("hide");
    });

    $("#zoneOrientation").change(function () {
      if ($(this).val() == "Vertical") {
        $("#lowerLimitLabel").html("Left:");
        $("#upperLimitLabel").html("Right:");
      } else {
        $("#lowerLimitLabel").html("Bottom:");
        $("#upperLimitLabel").html("Top:");
      }
      let ortn = "V_";
      if ($("#zoneOrientation").val() !== "Vertical") ortn = "H_";

      $("#zoneTitle").val(Utility.generateCurveName(_plot, ortn + "zone_"));
    });

    function showDlg() {
      $("#zoneModal").modal({
        backdrop: "static",
      });
    }

    this.zoneCb = function (plot) {
      $("body").append(dlg);
      _plot = plot;
      let ortn = "V_";
      if ($("#zoneOrientation").val() !== "Vertical") ortn = "H_";

      $("#zoneTitle").val(Utility.generateCurveName(plot, ortn + "zone_"));
      showDlg();
    };

    dlg.on("hidden.bs.modal", function () {
      dlg.detach();
    });

    dlg.detach();
  }
}
