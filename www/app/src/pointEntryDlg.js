"include ['modalDlg']";
"use strict";
// class MPointEntryDlg {
//   constructor() {
//     const self = this;
//     let dlg = null;
//     let buildDlg = _.once(function () {
//       /* Remove any $("#pointEntryModal") from the DOM before appending a new one.*/
//       $("#pointEntryModal").remove();
//       dlg = $(
//         '\
//                         <div class="modal fade" id="pointEntryModal" role="dialog">\
//                         <div class="modal-dialog modal-sm">\
//                         <div class="modal-content">\
//                         <div class="modal-header">\
//                         <button type="button" class= "close" id="closePointEntryDlg">&times;</button>\
//                         <h4 id="pointEntryTitle" class="modal-title">Add/Romve Point</h4>\
//                         </div>\
//                         <div class="modal-body">\
//                         <div class="row">\
//                         </div>\
//                         <br>\
//                         <div class="row">\
//                         </div>\
//                         <br>\
//                         <div class="row">\
//                         </div>\
//                         <br>\
//                         <div class="modal-footer">\
//                         <button id="pointEntryDlg_enter" type="button" class="btn btn-default" >Add</button>\
//                         <button id="pointEntryDlg_remove" type="button" class="btn btn-default" >Remove</button>\
//                         <button id="pointEntryDlg_ok" type="button" class="btn btn-default"  data-dismiss="modal">Finish</button>\
//                         </div>\
//                         </div>\
//                         </div>\
//                         </div>\
//                         </div>\
//                         '
//       );
//       $("body").append(dlg);
//       $("#pointEntryDlg_enter").click(enterCb);
//       $("#pointEntryDlg_remove").click(removeCb);
//       $("#closePointEntryDlg").click(closeCb);
//       $("#curve_name, #abscissa, #ordinate").keyup(keyupCb);

//       $("#pointEntryDlg_remove").attr("disabled", false);
//       $("#pointEntryDlg_enter").attr("disabled", true);

//       $("#pointEntryModal").on("shown.bs.modal", function () {
//         $("#pointEntryDlg_enter").trigger("focus");
//       });
//     });
//     buildDlg();

//     this.setDlgTitle = function (title) {
//       $("#pointEntryTitle").html(title);
//       if (title == "Modify/Remove Point") {
//         $("#pointEntryDlg_enter").html("Modify");
//       } else {
//         $("#pointEntryDlg_enter").html("Add");
//       }
//     };

//     this.dlgTitle = function (title) {
//       return $("#pointEntryTitle").html();
//     };

//     this.pointEntryCb = function (dlgTitle, plot, curveName, point) {
//       //self.modify = false;
//       self.curveName = curveName;
//       self.point = point;
//       //buildDlg();
//       $("body").append(dlg);
//       self.setDlgTitle(dlgTitle);
//       if (curveName !== undefined) {
//         $("#curve_name").val(curveName);
//       }
//       if (point !== undefined) {
//         $("#abscissa").val(point.x);
//         $("#ordinate").val(point.y);
//       }
//       self.plot = plot;
//       showDlg();
//       //if (self.curveName !== undefined && self.point !== undefined) {
//       if (dlgTitle == "Modify/Remove Point") {
//         //self.modify = true;
//         //self.setDlgTitle(dlgTitle)
//         $("#curve_name").attr("disabled", true);
//         //var curve = self.plot.findPlotCurve($("#curve_name").val());
//         //if(curve && curve.data().samples().length <= 1){
//         $("#pointEntryDlg_enter").attr("disabled", true);
//         //}
//       } else {
//         //self.setDlgTitle("Add/Romve Point")
//         //self.modify = false;
//         $("#curve_name").attr("disabled", false);
//         if (
//           !findPoint(new Misc.Point($("#abscissa").val(), $("#ordinate").val()))
//         )
//           $("#pointEntryDlg_enter").attr("disabled", false);
//       }
//     };

//     dlg.on("hidden.bs.modal", function () {
//       dlg.detach();
//     });

//     function closeCb() {
//       $("#pointEntryDlg_ok").click();
//     }

//     function showDlg() {
//       /* if (!self.plot.findPlotCurve($("#curve_name").val())) {
//                 $('#pointEntryDlg_remove').attr('disabled', true);
//             } */
//       setRemoveButtonAttribute();
//       $("#pointEntryModal").modal({
//         backdrop: "static",
//       });
//     }

//     dlg.detach();
//   }
// }

class MPointEntryDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Add/Romve Point",
      spaceRows: true,
      hideCancelButton: true,
    };
    super(options);
    const self = this;

    this.addFooterElement(
      '<button id="pointEntryDlg_remove" class="btn btn-default">Remove</button>'
    );

    this.addFooterElement(
      '<button id="pointEntryDlg_enter" class="btn btn-default">Add</button>'
    );

    this.addRow([
      '<div class="col-sm-4">Name:</div>',
      '<div class="col-sm-8"><input id="curve_name" type="text" value="curve_1" style="width:100%"></div>',
    ]);

    this.addRow([
      '<div class="col-sm-4">Abscissa(X):</div>',
      '<div class="col-sm-8"><input id="abscissa" type="text" value="0.0" style="width:100%"></div>',
    ]);

    this.addRow([
      '<div class="col-sm-4">Ordinate(Y):</div>',
      '<div class="col-sm-8"><input id="ordinate" type="text" value="0.0" style="width:100%"></div>',
    ]);

    function findPoint(pt) {
      var curve = self.plot.findPlotCurve($("#curve_name").val());
      if (!curve) return false;
      var samples = curve.data().samples();
      if (samples.length > 0) {
        for (var i = 0; i < samples.length; ++i) {
          if (pt.x == samples[i].x && pt.y == samples[i].y) {
            return true;
          }
        }
      }
      return false;
    }

    async function enterCb() {
      try {
        let curve = self.plot.findPlotCurve(self.selector("curve_name").val());
        if (curve) {
          //if (self.modify) {
          if (self.selector("title").html() == "Modify/Remove Point") {
            curve.removePoint(self.point, true);
            //self.plot.cs.setLimits(); //set curveShapeItem limits to undefined
            Static.trigger("curveAdjusted");
          }
        } else {
          //"Create curve"
          curve = new MyCurve(self.selector("curve_name").val());
          //curve = new MyCurve(Utility.generateCurveName(self.plot));
          //curve.attach(self.plot);
          let color = Utility.randomColor();
          curve.setPen(new Misc.Pen(color));
          let sym = new Symbol2(
            Symbol2.Style.MRect,
            new Misc.Brush(Utility.invert(color)),
            new Misc.Pen(color),
            new Misc.Size(8, 8)
          );
          curve.setSymbol(sym);
          let attribute = "";
          if (Static.showline && Static.showsymbol) {
            attribute = "lineAndSymbol";
          } else if (Static.showline) {
            attribute = "line";
          } else if (Static.showsymbol) {
            attribute = "symbol";
          }
          Utility.setLegendAttribute(
            curve,
            attribute,
            curve.getLegendIconSize()
          ); //attribute = "line" or "symbol" or "lineAndSymbol"
          curve.attach(self.plot);
        }
        let samples = curve.data().samples();
        const abscissaVal_L = await self.plot.defines.expandDefines(
          self.selector("abscissa").val()
        );
        let abscissaVal;
        try {
          abscissaVal = math.evaluate(abscissaVal_L);
        } catch (error) {
          console.log(error);
        }

        const ordinateVal_L = await self.plot.defines.expandDefines(
          self.selector("ordinate").val()
        );
        let ordinateVal;
        try {
          ordinateVal = math.evaluate(ordinateVal_L);
        } catch (error) {
          console.log(error);
        }

        let p = new Misc.Point(abscissaVal, ordinateVal);
        self.point = p;
        if (!samples.containsPoint(p)) {
          samples.push(p);
        }
        samples.sort(function (a, b) {
          /* if(a.x < b.x) return -1;
                if(a.x > b.x) return 1;
                return 0; */
          return a.x - b.x;
        });
        curve.setSamples(samples);
        self.plot.autoRefresh();
        Static.trigger("pointAdded", curve);
        //self.plot.cs.setLimits(); //set curveShapeItem limits to undefined
        Static.trigger("curveAdjusted");
        /* We have at least one point. Ensure remove button is enabled. */
        //$('#pointEntryDlg_remove').attr('disabled', false);
        //setRemoveButtonAttribute();
        self.selector("pointEntryDlg_enter").attr("disabled", true);
        if (samples.length > 1)
          self.selector("pointEntryDlg_remove").attr("disabled", false);
      } catch (error) {
        console.log(error);
      }
    }

    function removeCb() {
      let curve = self.plot.findPlotCurve(self.selector("curve_name").val());
      curve.removePoint(
        new Misc.Point(
          parseFloat(self.selector("abscissa").val()),
          parseFloat(self.selector("ordinate").val())
        )
      );
      //self.plot.cs.setLimits(); //set curveShapeItem limits to undefined
      self.selector("pointEntryDlg_remove").attr("disabled", true);
      self.selector("pointEntryDlg_enter").attr("disabled", false);
      Static.trigger("curveAdjusted");
    }

    async function keyupCb() {
      try {
        var curve = self.plot.findPlotCurve(self.selector("curve_name").val());
        var samples;
        if (curve) samples = curve.data().samples();
        if (self.selector("abscissa").val() == "-") {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
          return;
        }
        var abscissaVal;
        try {
          const abscissaVal_L = await self.plot.defines.expandDefines(
            self.selector("abscissa").val()
          );
          abscissaVal = math.evaluate(abscissaVal_L); //.toString(10);
        } catch (error) {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
          return;
        }
        if (self.selector("ordinate").val() == "-") {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
          return;
        }
        var ordinateVal;
        try {
          const ordinateVal_L = await self.plot.defines.expandDefines(
            self.selector("ordinate").val()
          );
          ordinateVal = math.evaluate(ordinateVal_L); //.toString(10);
        } catch (error) {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
          return;
        }

        if (ordinateVal == undefined || abscissaVal == undefined) {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
          return;
        }

        if (findPoint(new Misc.Point(abscissaVal, ordinateVal))) {
          if (samples.length > 1)
            self.selector("pointEntryDlg_remove").attr("disabled", false);
          self.selector("pointEntryDlg_enter").attr("disabled", true);
        } else {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
          self.selector("pointEntryDlg_enter").attr("disabled", false);
        }
      } catch (error) {
        console.log(error);
      }
    }

    self.addHandler("pointEntryDlg_enter", "click", enterCb);
    self.addHandler("pointEntryDlg_remove", "click", removeCb);
    self.addHandler("curve_name, abscissa, ordinate", "keyup", keyupCb);

    function setRemoveButtonAttribute() {
      var curve = self.plot.findPlotCurve(self.selector("curve_name").val());

      if (!curve) {
        self.selector("pointEntryDlg_remove").attr("disabled", true);
      } else {
        if (curve.data().samples().length > 1) {
          self.selector("pointEntryDlg_remove").attr("disabled", false);
        } else {
          self.selector("pointEntryDlg_remove").attr("disabled", true);
        }
      }
    }

    this.pointEntryCb = function (dlgTitle, plot, curveName, point) {
      self.curveName = curveName;
      self.point = point;
      self.dlgTitle = dlgTitle;
      self.plot = plot;
      this.showDlg();
      //this.init(); //or call init() inside of initializeDialog()
    };

    this.init = function () {
      this.selector("ok").text("Finish");
      self.selector("title").html(self.dlgTitle);

      if (self.dlgTitle == "Modify/Remove Point") {
        self.selector("pointEntryDlg_enter").text("Modify");
      } else {
        self.selector("pointEntryDlg_enter").text("Add");
      }

      if (self.curveName !== undefined) {
        self.selector("curve_name").val(self.curveName);
      }
      if (self.point !== undefined) {
        self.selector("abscissa").val(self.point.x);
        self.selector("ordinate").val(self.point.y);
      }

      if (self.dlgTitle == "Modify/Remove Point") {
        self.selector("curve_name").attr("disabled", true);
        self.selector("pointEntryDlg_enter").attr("disabled", true);
      } else {
        self.selector("curve_name").attr("disabled", false);
        if (
          !findPoint(
            new Misc.Point(
              self.selector("abscissa").val(),
              self.selector("ordinate").val()
            )
          )
        )
          self.selector("pointEntryDlg_enter").attr("disabled", false);
      }
      setRemoveButtonAttribute();
    };
  }

  initializeDialog() {
    this.init();
  }

  beforeClose() {
    this.curveName = 0;
    this.point = 0;
    this.dlgTitle = 0;
    this.plot = 0;
  }
}
