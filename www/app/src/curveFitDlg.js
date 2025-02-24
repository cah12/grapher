"use strict";

"include ['static', 'modalDlg']";

class MCurveFitDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Curve Fitter",
      spaceRows: true,
    };
    super(options);

    let numOfSamples = 100;
    let self = this;
    let m_type = "";
    let m_retain = false;
    let m_generate = false;
    let m_initialize = false;
    let m_name = "";
    let m_color = "";
    let m_order = -1;
    let m_origin = false;
    let m_tolerance = -1;
    let m_chunksize = -1;
    let m_plot = null;
    let m_curve = null;
    let m_option = { precision: 2 };

    function getRightHandSide(fn) {
      fn = fn.replace(/\s/g, "");
      fn = fn.replace("y=", "");

      while (fn.indexOf("+ -") != -1) {
        fn = fn.replace("+ -", "- ");
      }
      //Replace the whitespace delimiters stripped out by simplify()
      fn = fn.replaceAll("mod", " mod ");
      return fn;
    }

    function residuals(observations, predictions, curve) {
      let result = [];
      for (let i = 0; i < observations.length; i++) {
        let resid = Utility.adjustForDecimalPlaces(
          observations[i][1] - predictions[i][1],
          curve.plot().axisPrecision(curve.yAxis())
        );
        result.push(
          parseFloat(
            Utility.toPrecision(
              resid,
              curve.plot().axisPrecision(curve.yAxis())
            )
          )
        );
      }
      return result;
    }

    function regress(curve, type, order, throughOrigin, option) {
      if (type == "linear" && throughOrigin) {
        type = "linearthroughorigin";
      }
      //if(!curve.fitType){
      //curve.fitType = type
      //}
      var samples = curve.data().samples();
      var points = [];
      //var point = [0, 0]
      for (var i = 0; i < samples.length; ++i) {
        points.push([samples[i].x, samples[i].y]);
      }
      let result = regression(type, points, order, option);
      result.residuals = residuals(points, result.points, curve);
      return result;
    }

    //Clear cache
    this.cleanup = function () {
      m_curve = null;
    };

    this.curveFitInfoCb = function (curve) {
      //console.log(curve.title())
      var info = "";
      if (curve.fitType == "natural") {
        info += "Fit type:Natural Spline";
      } else if (curve.fitType == "periodic") {
        info += "Fit type:Periodic Spline";
      } else if (curve.fitType == "polynomial") {
        info += "Fit type:Polynomial";
        info += "; Equation:" + curve.equation;
      } else if (curve.fitType == "exponential") {
        info += "Fit type:Exponential";
        info += "; Equation:" + curve.equation;
      } else if (curve.fitType == "logarithmic") {
        info += "Fit type:Logarithmic";
        info += "; Equation:" + curve.equation;
      } else if (curve.fitType == "power") {
        info += "Fit type:Power";
        info += "; Equation:" + curve.equation;
      } else if (curve.fitType == "weeding") {
        info += "Fit type:Weeding";
        info += "; Tolerance:" + m_tolerance;
      } else if (curve.fitType == "linear") {
        if (curve.origin) {
          info += "Fit type:Linear Through Origin";
        } else {
          info += "Fit type:Linear";
        }
        info += "; Equation:" + curve.equation;
      }
      if (curve.residuals) {
        info += "\n" + `Residuals: [${curve.residuals}]`;
      }
      return info;
    };

    // this.curveFitDlg = function () {
    //   if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
    //     return;
    //   self
    //     .selector("curveFitDlg_name")
    //     .val(Utility.generateCurveName(m_plot, m_curve.title() + "_fit"));
    //   self
    //     .selector("curveFitDlg_color")
    //     .val(Utility.colorNameToHex(m_curve.pen().color));
    // };

    /* 
    y=mx+c
    m = (12-2)/(4-2) = 5
    12 = 5*4 + c
    c = 12 - 20 = -8
    y = 5x - 8
     */

    this.curveFitDlgInit = function () {
      if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
        return;

      const ord = Math.min(m_curve.dataSize() - 1, 9);
      const prec = Math.max(Math.min(ord * 5 - 8, 12), 2);
      //console.log(prec);
      this.selector("curveFitDlg_precision").val(prec);
      self.selector("order").val(ord);

      self
        .selector("curveFitDlg_name")
        .val(Utility.generateCurveName(m_plot, m_curve.title() + "_fit"));
      self
        .selector("curveFitDlg_color")
        .val(Utility.colorNameToHex(m_curve.pen().color));

      if (m_initialize) return;
      m_initialize = true;
      self.selector("ok").removeAttr("data-dismiss");
      self.selector("cont_origin").hide();
      self.selector("cont_order").hide();
      self.selector("cont_tolerance").hide();
      self.selector("cont_chunksize").hide();

      self.selector("attributes1").hide();
      self.selector("attributes2").hide();
      self.selector("curveFitDlg_retain")[0].checked = false;
    };

    this.addRow([
      '<div class="col-sm-5">Fitter type:</div>',
      '<div class="col-sm-7">\
        <select id="curveFitDlg_type">\
          <option value="natural">Natural spline</option>\
          <option value="periodic">Periodic spline</option>\
          <option value="weeding">Weeding</option>\
          <option value="linear">Linear</option>\
          <option value="polynomial">Polynomial</option>\
          <option value="exponential">Exponential</option>\
          <option value="logarithmic">Logarithmic</option>\
          <option value="power">Power</option>\
          <option value="noFitting">No fitting</option>\
        </select>\
      </div>',
    ]);

    this.addRow(
      [
        '<div class="col-sm-7">Through origin:</div>',
        '<div class="col-sm-2"><input id="origin" type="checkbox"/></div>',
      ],
      null,
      "cont_origin"
    );

    this.addRow(
      [
        '<div class="col-sm-2">Order:</div>',
        '<div class="col-sm-3"><input id="order" type="number" style="width:100%" value="2" min="1" max="20"/></div>',
        '<div>Precision: <input id="curveFitDlg_precision" type="number" min="1" max="100" value="2" /></div>',
      ],
      null,
      "cont_order"
    );

    this.addRow(
      [
        '<div class="col-sm-5">Tolerance:</div>',
        '<div class="col-sm-4"><input id="tolerance" type="number" style="width:100%" value="10.0" min="0.0" max="200.0"/></div>',
      ],
      null,
      "cont_tolerance"
    );

    this.addRow(
      [
        '<div class="col-sm-5">Chunk size:</div>',
        '<div class="col-sm-4"><input id="chunksize" type="number" style="width:100%" value="0" min="0" /></div>',
      ],
      null,
      "cont_chunksize"
    );

    this.addRow(
      [
        '<div class="col-sm-7">Retain original curve:</div>',
        '<div class="col-sm-2"><input id="curveFitDlg_retain" type="checkbox"/></div>',
      ],
      null,
      "cont_retain"
    );

    this.addRow(
      [
        '<div class="col-sm-7">Generate points:</div>',
        '<div class="col-sm-2"><input id="curveFitDlg_generate" type="checkbox" checked/></div>',
      ],
      null,
      "cont_generate"
    );

    this.addRow(
      [
        '<div class="col-sm-6">Fitted curve name:</div>',
        '<div class="col-sm-6"><input id="curveFitDlg_name" type="text" style="width:100%"/></div>',
      ],
      null,
      "attributes1"
    );

    this.addRow(
      [
        '<div class="col-sm-6">Fitted curve color:</div>',
        '<div class="col-sm-2"><input id="curveFitDlg_color" type="color"/></div>',
      ],
      null,
      "attributes2"
    );

    this.cb = function () {
      if (m_retain) {
        var title = m_name;
        if (m_plot.findPlotCurve(title)) {
          Utility.alert(title + " already exist");
          return; //false;
        }
      }
      self.closeDlg();
      var doReplot = m_plot.autoReplot();
      m_plot.setAutoReplot(false);

      var curve = new MyCurve();
      curve.setPen(new Misc.Pen(m_color));
      curve.fn = m_curve.fn;
      curve.variable = m_curve.variable;

      curve.setAxes(m_curve.xAxis(), m_curve.yAxis());

      //curve.fitType = self.type;
      curve.origin = m_origin;
      curve.setStyle(m_curve.style());

      if (m_type == "natural" || m_type == "periodic") {
        //console.log(self.curve.data())
        curve.setData(m_curve.data());
        var splineCurveFitter = new SplineCurveFitter();
        var s = splineCurveFitter.spline();
        if (m_type == "periodic") {
          s.setSplineType(Static.SplineType.Periodic);
          //curve.fitType = "periodic spline"
        } else {
          s.setSplineType(Static.SplineType.Natural);
          //curve.fitType = "natural spline"
        }
        curve.setCurveFitter(splineCurveFitter);
        /////////Start modification//////////
        /* generate and Set Fitted XY Points */
        if (m_generate) {
          var xMap = m_plot.axisScaleDraw(m_curve.xAxis()).scaleMap();
          var yMap = m_plot.axisScaleDraw(m_curve.yAxis()).scaleMap();
          var samp = m_curve.data().samples();
          var samps = [];
          for (var i = 0; i < samp.length; i++) {
            samps.push(
              new Misc.Point(
                xMap.transform(samp[i].x),
                yMap.transform(samp[i].y)
              )
            );
          }
          samps = splineCurveFitter.fitCurve(samps);
          curve.setCurveFitter(null);
          var _samps = [];
          for (var i = 0; i < samps.length; i++) {
            _samps.push(
              new Misc.Point(
                xMap.invTransform(samps[i].x),
                yMap.invTransform(samps[i].y)
              )
            );
          }
          curve.setSamples(_samps);
        } else {
          curve.setSamples(m_curve.data().samples());
        }
        /////////end modification//////////
      } else if (m_type == "weeding") {
        curve.setData(m_curve.data());
        //curve.fn = self.curve.fn;
        var weedingCurveFitter = new WeedingCurveFitter(10);
        weedingCurveFitter.setChunkSize(parseInt(m_chunksize));
        weedingCurveFitter.setTolerance(parseInt(m_tolerance));
        curve.setCurveFitter(weedingCurveFitter);
        /////////Start modification//////////
        /* generate and Set Fitted XY Points */
        if (m_generate) {
          var xMap = m_plot.axisScaleDraw(m_curve.xAxis()).scaleMap();
          var yMap = m_plot.axisScaleDraw(m_curve.yAxis()).scaleMap();
          var samp = m_curve.data().samples();
          var samps = [];
          for (var i = 0; i < samp.length; i++) {
            samps.push(
              new Misc.Point(
                xMap.transform(samp[i].x),
                yMap.transform(samp[i].y)
              )
            );
          }
          samps = weedingCurveFitter.fitCurve(samps);
          curve.setCurveFitter(null);
          var _samps = [];
          for (var i = 0; i < samps.length; i++) {
            _samps.push(
              new Misc.Point(
                xMap.invTransform(samps[i].x),
                yMap.invTransform(samps[i].y)
              )
            );
          }
          curve.setSamples(_samps);
        } else {
          curve.setSamples(m_curve.data().samples());
        }
        /////////end modification//////////
      } else if (m_type == "noFitting") {
        curve.setData(m_curve.data());
        //curve.fn = self.curve.fn;
        //console.log(self.curve.fn)
        curve.setCurveFitter(null);
        //return
      } else {
        var regr = regress(
          m_curve,
          m_type,
          parseInt(m_order),
          m_origin,
          m_option
        );
        //var regr = regress()//CurveFitDlg.curve, parseInt(CurveFitDlg.type))
        var rc = m_curve.data().boundingRect();
        var fn = regr.string;
        // while (fn.indexOf("+ -") != -1) {
        //   fn = fn.replace("+ -", "- ");
        // }

        fn = getRightHandSide(fn).replace("ln", "log");

        fn = fn
          .replaceAll(" ", "")
          .replaceAll("+-", "-")
          .replaceAll("-+", "-")
          .replaceAll("0x", "0");

        try {
          fn = math.simplify(fn, {}, { exactFractions: false }).toString();
        } catch (error) {
          console.log(error);
        }

        curve.equation = "y=" + fn;

        curve.expandedFn = curve.fn = fn; // = fn.replace('y =', '');
        curve.variable = "x";

        let functionDlgData = {};
        functionDlgData.rtti = PlotItem.RttiValues.Rtti_PlotCurve;
        functionDlgData.coeffs = [];
        functionDlgData.expandedFn = curve.expandedFn;
        functionDlgData.fn = curve.expandedFn;
        functionDlgData.lowerLimit = rc.left();
        functionDlgData.numOfPoints = numOfSamples;
        functionDlgData.threeD = false;
        functionDlgData.title = m_retain == true ? title : m_curve.title();
        functionDlgData.unboundedRange = false;
        functionDlgData.upperLimit = rc.right();
        functionDlgData.variable = "x";

        curve.functionDlgData = functionDlgData;

        //fn = fn.replace('=', '')
        const makeSamplesData = {
          fx: fn,
          lowerX: rc.left(),
          upperX: rc.right(),
          numOfSamples: numOfSamples,
        };
        var s = Utility.makeSamples(makeSamplesData);
        if (!s) return;
        curve.turningPoints = makeSamplesData.turningPoints;
        curve.residuals = regr.residuals;
        curve.setSamples(s);
      }
      //curve.attach(self.plot);//attach before detach
      if (m_retain) {
        curve.setTitle(title);
      } else {
        curve.setTitle(m_curve.title());
        m_curve.detach();
        m_curve.delete();
      }
      curve.fitType = m_type;
      /* if (m_type == "natural" || m_type == "periodic" || m_type == "weeding") {
                      if(m_generate)
                         curve.setCurveFitter(null);
                 } */
      curve.attach(m_plot);
      m_plot.setAutoReplot(doReplot);
      m_plot.autoRefresh();
      //self.close();
      //console.log(curve.curveFitter().spline().points())
    };

    this.addHandler("ok", "click", function () {
      m_type = self.selector("curveFitDlg_type").val();
      m_retain = self.selector("curveFitDlg_retain")[0].checked;
      m_generate = self.selector("curveFitDlg_generate")[0].checked;
      m_name = self.selector("curveFitDlg_name").val();
      m_color = self.selector("curveFitDlg_color").val();
      m_order = self.selector("order").val() || 1;
      m_option = {
        precision: parseInt(self.selector("curveFitDlg_precision").val()),
      };
      m_origin = self.selector("origin")[0].checked;
      m_tolerance = self.selector("tolerance").val();
      m_chunksize = self.selector("chunksize").val();
      self.cb();
    });

    this.addHandler("curveFitDlg_type", "change", function () {
      let form = "";
      //console.log($(this).val())
      if ($(this).val() == "linear") {
        self.selector("cont_origin").show();
        form = "y = mx + c";
      } else {
        self.selector("cont_origin").hide();
      }
      self.selector("cont_order").hide();
      if ($(this).val() == "polynomial") {
        // const ord = Math.min(12, m_curve.dataSize() - 1);
        // console.log("ord2", ord);
        //self.selector("order").val(ord);
        self.selector("cont_order").show();
        form = "y = aix^j ... + a0x^0";
      } /* else {
        self.selector("cont_order").hide();
      } */
      if ($(this).val() == "exponential") {
        // const ord = Math.min(12, m_curve.dataSize() - 1);
        // console.log("ord2", ord);
        //self.selector("order").val(ord);
        self.selector("cont_order").show();
        form = "y = ae^(bx)";
      } /* else {
        self.selector("cont_order").hide();
      } */
      if ($(this).val() == "logarithmic") {
        // const ord = Math.min(12, m_curve.dataSize() - 1);
        // console.log("ord2", ord);
        //self.selector("order").val(ord);
        self.selector("cont_order").show();
        form = "y = a + b ln x";
      } /* else {
        self.selector("cont_order").hide();
      } */
      if ($(this).val() == "power") {
        // const ord = Math.min(12, m_curve.dataSize() - 1);
        // console.log("ord2", ord);
        //self.selector("order").val(ord);
        self.selector("cont_order").show();
        form = "y = ax^b";
      } /* else {
        self.selector("cont_order").hide();
      } */
      if (
        $(this).val() == "natural" ||
        $(this).val() == "periodic" ||
        $(this).val() == "weeding"
      ) {
        self.selector("cont_generate").show();
      } else {
        self.selector("cont_generate").hide();
      }
      if ($(this).val() == "weeding") {
        self.selector("cont_tolerance").show();
        self.selector("cont_chunksize").show();
      } else {
        self.selector("cont_tolerance").hide();
        self.selector("cont_chunksize").hide();
      }
      if ($(this).val() !== "noFitting") {
        self.selector("cont_retain").show();
        self.selector("cont_retain").show();
        //self.selector("attributes").show();
        //self.selector("curveFitDlg_color").show();
      } else {
        self.selector("curveFitDlg_retain").prop("checked", false);
        self.selector("cont_retain").hide();
        self.selector("attributes1").hide();
        self.selector("attributes2").hide();
        //self.selector("curveFitDlg_color").hide();
      }
      self
        .selector("curveFitDlg_type")
        .attr("title", `Equation of the form "${form}".`);
    });

    this.addHandler("curveFitDlg_retain", "change", function () {
      if (!$(this)[0].checked) {
        self.selector("attributes1").hide();
        self.selector("attributes2").hide();
      } else {
        self.selector("attributes1").show();
        self.selector("attributes2").show();
      }
    });

    this.init = function () {};

    //     //Called by LegendMenu
    this.curveFitCb = function (curve) {
      m_plot = curve.plot();
      m_curve = curve;
      this.showDlg();
      //self.curveFitDlg();
    };
  }

  initializeDialog() {
    this.curveFitDlgInit();
  }

  beforeClose() {
    this.cleanup();
  }
}
