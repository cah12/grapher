"use strict";

"include ['modalDlg']";

class MAxisDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Curve Axis",
      spaceRows: true,
    };
    super(options);
    const self = this;
    let _curve = null;

    //Clear cache
    this.cleanup = function () {
      _curve = null;
    };

    this.addRow([
      '<div class="col-sm-5">Horizontal:</div>',
      '<div class="col-sm-7">\
        <select id="axisHorizontal1">\
          <option value="2">Bottom axis</option>\
          <option value="3">Top axis</option>\
        </select>\
      </div>',
    ]);

    this.addRow([
      '<div class="col-sm-5">Vertical:</div>',
      '<div class="col-sm-7">\
        <select id="axisVertical1">\
          <option value="0">Left axis</option>\
          <option value="1">Right axis</option>\
        </select>\
      </div>',
    ]);

    let hChanged = false;
    let vChanged = false;

    this.axisDlgInit = function () {
      if (_curve.xAxis() == Axis.AxisId.xBottom) {
        self.selector("axisHorizontal1").val("2");
      } else {
        self.selector("axisHorizontal1").val("3");
      }
      if (_curve.yAxis() == Axis.AxisId.yLeft) {
        self.selector("axisVertical1").val("0");
      } else {
        self.selector("axisVertical1").val("1");
      }
      self.selector("ok").prop("disabled", true);
      hChanged = false;
      vChanged = false;
    };

    this.addHandler("axisHorizontal1", "change", function () {
      if ($(this).val() == "2") {
        if (_curve.xAxis() !== Axis.AxisId.xBottom) {
          hChanged = true;
        } else {
          hChanged = false;
        }
      } else {
        if (_curve.xAxis() !== Axis.AxisId.xTop) {
          hChanged = true;
        } else {
          hChanged = false;
        }
      }
      if (vChanged || hChanged) {
        self.selector("ok").prop("disabled", false);
      } else {
        self.selector("ok").prop("disabled", true);
      }
    });

    this.addHandler("axisVertical1", "change", function () {
      if ($(this).val() == "0") {
        if (_curve.yAxis() !== Axis.AxisId.yLeft) {
          vChanged = true;
        } else {
          vChanged = false;
        }
      } else {
        if (_curve.yAxis() !== Axis.AxisId.yRight) {
          vChanged = true;
        } else {
          vChanged = false;
        }
      }
      if (vChanged || hChanged) {
        self.selector("ok").prop("disabled", false);
      } else {
        self.selector("ok").prop("disabled", true);
      }
    });

    this.addHandler("ok", "click", function () {
      const xAxis = parseInt(self.selector("axisHorizontal1").val());
      _curve.setXAxis(xAxis);
      //Static.trigger("axisChanged", [xAxis, _curve]);
      const yAxis = parseInt(self.selector("axisVertical1").val());
      _curve.setYAxis(yAxis);
      //Static.trigger("axisChanged", [yAxis, _curve]);
    });

    this.axisCb = function (curve) {
      _curve = curve; //The axis of this curve could be change via the dialog.
      this.showDlg();
    };
  }
  initializeDialog() {
    this.axisDlgInit();
  }

  beforeClose() {
    this.cleanup();
  }
}
