"include ['modalDlg']";
"use strict";

class MCurveStyleDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Curve Style",
      spaceRows: true,
      //hideCancelButton: true,
    };
    super(options);
    const self = this;
    self.curve = null;
    let styleMap = {
      Lines: Curve.CurveStyle.Lines,
      Sticks: Curve.CurveStyle.Sticks,
      Steps: Curve.CurveStyle.Steps,
      Dots: Curve.CurveStyle.Dots,
      NoCurve: Curve.CurveStyle.NoCurve,
    };
    let invertedStyleMap = _.invert(styleMap);

    this.addRow([
      '<div class="col-sm-5">Curve style:</div>',
      '<div class="col-sm-7">\
        <select id="curveStyleDlgStyle">\
          <option value="Lines">Lines (Default)</option>\
          <option value="Sticks">Sticks</option>\
          <option value="Steps">Steps</option>\
          <option value="Dots">Dots</option>\
          <option value="NoCurve">NoCurve</option>\
        </select>\
      </div>',
    ]);

    this.curveStyleCb = function (curve) {
      self.curve = curve;
      if (!self.curve || self.curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
        return;
      this.showDlg();
    };

    self.addHandler("ok", "click", function () {
      var style = styleMap[self.selector("curveStyleDlgStyle").val()];
      self.curve.setStyle(style);
      Static.trigger("curveStyleChanged", self.curve);
    });

    this.init = function () {
      self
        .selector("curveStyleDlgStyle")
        .val(invertedStyleMap[self.curve.style()]);
    };
  }

  initializeDialog() {
    this.init();
  }

  beforeClose() {
    this.curve = 0;
  }
}
