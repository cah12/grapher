"include ['modalDlg']";
"use strict";

class MCurveLegendAttributeDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Curve Legend Attribute",
      spaceRows: true,
      //hideCancelButton: true,
    };
    super(options);
    let self = this;
    self.defaultIconSize = null;

    this.addRow([
      '<div class="col-sm-5">Attribute:</div>',
      '<div class="col-sm-7">\
           <select id="curveAttribute">\
             <option value="default">Brush color(Default)</option>\
             <option value="line">Line</option>\
             <option value="symbol">Symbol</option>\
             <option value="lineAndSymbol">Line and Symbol</option>\
           </select>\
        </div>',
    ]);

    this.addRow(
      [
        '<div class="col-sm-5">Icon size:</div>',
        '<div class="col-sm-7">\
          <select id="iconSize">\
            <option value="small">Small</option>\
            <option value="medium">Medium</option>\
            <option value="large">Large</option>\
          </select>\
        </div>',
      ],
      "iconSizeRow"
    );

    function setIconSize(val) {
      if (val == "small") {
        //We are dealing with square icon
        self.curve.setLegendIconSize(
          new Misc.Size(
            self.defaultIconSize.height - 4,
            self.defaultIconSize.height - 4
          )
        );
      } else if (val == "medium") {
        self.curve.setLegendIconSize(
          new Misc.Size(
            self.defaultIconSize.height,
            self.defaultIconSize.height
          )
        );
      } else {
        self.curve.setLegendIconSize(
          new Misc.Size(
            self.defaultIconSize.height + 4,
            self.defaultIconSize.height + 4
          )
        );
      }
      self.curve.plot().autoRefresh();
    }

    this.addHandler("curveAttribute", "change", function () {
      if ($(this).val() == "line") {
        self.selector("iconSizeRow").hide();
      } else if ($(this).val() == "symbol") {
        self.selector("iconSizeRow").hide();
      } else if ($(this).val() == "lineAndSymbol") {
        self.selector("iconSizeRow").hide();
      } else {
        self.selector("iconSizeRow").show();
      }
    });

    this.addHandler("ok", "click", function () {
      Utility.setLegendAttribute(
        self.curve,
        self.selector("curveAttribute").val(),
        self.defaultIconSize
      );
      if (self.selector("curveAttribute").val() === "default")
        setIconSize(self.selector("iconSize").val());
      self.curve.plot().autoRefresh();
    });

    this.curveAttributeDlg = function () {
      if (!self.curve || self.curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
        return;

      if (
        self.curve.testLegendAttribute(Curve.LegendAttribute.LegendShowLine) &&
        self.curve.testLegendAttribute(Curve.LegendAttribute.LegendShowSymbol)
      ) {
        self.selector("curveAttribute").val("lineAndSymbol");
      } else if (
        self.curve.testLegendAttribute(Curve.LegendAttribute.LegendShowSymbol)
      ) {
        self.selector("curveAttribute").val("symbol");
      } else if (
        self.curve.testLegendAttribute(Curve.LegendAttribute.LegendShowLine)
      ) {
        self.selector("curveAttribute").val("line");
      } else {
        self.selector("curveAttribute").val("default");
      }

      if (
        self.curve.getLegendIconSize().width ==
        self.defaultIconSize.width - 4
      ) {
        self.selector("iconSize").val("small");
      } else if (
        self.curve.getLegendIconSize().width == self.defaultIconSize.width
      ) {
        self.selector("iconSize").val("medium");
      } else if (
        self.curve.getLegendIconSize().width ==
        self.defaultIconSize.width + 4
      ) {
        self.selector("iconSize").val("large");
      }

      if (
        self.selector("curveAttribute").val() == "line" ||
        self.selector("curveAttribute").val() == "symbol" ||
        self.selector("curveAttribute").val() == "lineAndSymbol"
      )
        self.selector("iconSizeRow").hide();
      else {
        self.selector("iconSizeRow").show();
      }
    };

    this.curveAttributeDlgInit = function () {
      self.curveAttributeDlg();
    };

    this.curveAttributeCb = function (curve) {
      if (!self.defaultIconSize)
        self.defaultIconSize = new Misc.Size(curve.getLegendIconSize());
      self.curve = curve;
      self.showDlg();
    };
  }

  initializeDialog() {
    this.curveAttributeDlgInit();
  }

  beforeClose() {
    this.curve = 0;
  }
}
