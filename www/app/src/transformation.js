"include []";
"use strict";

class Transformation {
  constructor(plot) {
    const m_plot = plot;

    this.transform = function (curve, type, param1, param2) {
      const variable = curve.variable;
      const numOfPoints = curve.dataSize();
      let lowerX = curve.lowerX;
      let upperX = curve.upperX;
      const doSwap = curve.axesSwapped;

      const doAutoReplot = plot.autoReplot();

      if (type == "Translate") {
        plot.setAutoReplot(false);
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(pt.x + param1, pt.y + param2));
          }

          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);

          plot.autoRefresh();

          return;
        }
        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          if (param1 !== 0) {
            fn = fn.replaceAll(variable, `(${variable}+  ${param1} * -1 )`);
            //fn = fn.replaceAll("+-", "-");
          }
          if (param2 !== 0) {
            fn = "(" + fn + ")+" + param2;
          }

          fn = math
            .simplify(fn.replaceAll("+-", "-"), {}, { exactFractions: false })
            .toString();
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
          // lowerX = curve.lowerX;
          // upperX = curve.upperX;
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          parametricFnX = `${parametricFnX}+${param1}`;
          parametricFnY = `${parametricFnY}+${param2}`;
        }

        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.minXValue() + param1, //Number
          upperLimit: curve.maxXValue() + param1, //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          parametric_variable: curve.parametric_variable,
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String
          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.minXValue() + param1,
          //   curve.maxXValue() + param1
          // ),
          // discontinuity: curve.discontinuity.map(function (e) {
          //   return e + param1;
          // }),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        //_curve.setAxis = true;
        // _curve.discontinuity = curve.discontinuity.map(function (e) {
        //   return e + param1;
        // });
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }

        plot.autoRefresh();
      }

      if (type == "Scale") {
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(pt.x, pt.y * param1));
          }

          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);

          plot.autoRefresh();
          return;
        }
        if (fn) {
          fn = math
            .simplify("(" + fn + ")*" + param1, {}, { exactFractions: false })
            .toString();
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");

          //console.log(fn);
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          parametricFnX = `(${parametricFnX})*${param1}`;
          parametricFnY = `(${parametricFnY})*${param1}`;
        }

        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.minXValue(), //Number
          upperLimit: curve.maxXValue(), //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String
          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.minXValue(),
          //   curve.maxXValue()
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        //_curve.discontinuity = curve.discontinuity;
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        _curve.attach(m_plot);
      }

      if (type == "Reflect x-axis") {
        plot.setAutoReplot(false);
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(pt.x, -1 * pt.y));
          }

          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);

          plot.autoRefresh();
          return;
        }
        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          fn = math
            .simplify(`-(${curve.fn})`, {}, { exactFractions: false })
            .toString();
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          //parametricFnX = `-(${parametricFnX})`;
          parametricFnY = `-(${parametricFnY})`;
        }
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.minXValue(), //Number
          upperLimit: curve.maxXValue(), //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String

          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.minXValue(),
          //   curve.maxXValue()
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }
        plot.autoRefresh();
      }

      if (type == "Reflect y equal") {
        //let translate =
        plot.setAutoReplot(false);
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(pt.x, -1 * pt.y + 2 * param1));
          }

          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);

          plot.autoRefresh();
          return;
        }
        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          fn = math
            .simplify(`-(${curve.fn})`, {}, { exactFractions: false })
            .toString();
          fn = "(" + fn + ")+" + param1 * 2;
          //fn = fn.replaceAll(variable, `(${variable}+  ${param1} * 2 )`);
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          //parametricFnX = `-(${parametricFnX})`;
          parametricFnY = `-(${parametricFnY})`;
        }
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.minXValue(), //Number
          upperLimit: curve.maxXValue(), //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String

          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.minXValue(),
          //   curve.maxXValue()
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }
        plot.autoRefresh();
      }

      if (type == "Reflect x equal") {
        plot.setAutoReplot(false);
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(-1 * pt.x + 2 * param1, pt.y));
          }
          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);
          plot.autoRefresh();
          return;
        }
        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          fn = math
            .simplify(
              fn.replaceAll(variable, `(-1*${variable})`),
              {},
              { exactFractions: false }
            )
            .toString();
          fn = fn.replaceAll(variable, `(${variable}+  ${param1} * -2 )`);
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          parametricFnX = `-(${parametricFnX})`;
          //parametricFnY = `-(${parametricFnY})`;
        }
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.maxXValue() * -1 + 2 * param1, //Number
          upperLimit: curve.minXValue() * -1 + 2 * param1, //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String

          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.maxXValue() * -1,
          //   curve.minXValue() * -1
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }
        plot.autoRefresh();
      } //

      if (type == "Reflect y-axis") {
        plot.setAutoReplot(false);
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(-1 * pt.x, pt.y));
          }
          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);
          plot.autoRefresh();
          return;
        }
        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          fn = math
            .simplify(
              fn.replaceAll(variable, `(-1*${variable})`),
              {},
              { exactFractions: false }
            )
            .toString();
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          parametricFnX = `-(${parametricFnX})`;
          //parametricFnY = `-(${parametricFnY})`;
        }
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.maxXValue() * -1, //Number
          upperLimit: curve.minXValue() * -1, //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String

          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.maxXValue() * -1,
          //   curve.minXValue() * -1
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }
        plot.autoRefresh();
      } //

      if (type == "Reflect x and y-axis") {
        plot.setAutoReplot(false);
        // console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (!fn && !parametricFnX && !parametricFnY) {
          console.log("No function");
          const _curve = new MyCurve(
            Utility.generateCurveName(m_plot, "trans_")
          );
          const samples = curve.data().samples();
          let _samples = [];
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            _samples.push(new Misc.Point(-1 * pt.x, -1 * pt.y));
          }
          _curve.setSamples(_samples);
          _curve.setAxes(curve.xAxis(), curve.yAxis());
          plot.setAutoReplot(doAutoReplot);
          _curve.attach(m_plot);
          plot.autoRefresh();
          return;
        }

        if (fn) {
          if (doSwap) {
            curve.unSwapAxes();
          }
          fn = math
            .simplify(`-(${curve.fn})`, {}, { exactFractions: false })
            .toString();
          fn = math
            .simplify(
              fn.replaceAll(variable, `(-1*${variable})`),
              {},
              { exactFractions: false }
            )
            .toString();
          //Replace the whitespace delimiters stripped out by simplify()
          fn = fn.replaceAll("mod", " mod ");
        }
        if (parametricFnX && parametricFnY) {
          lowerX = curve.parametricLowerX;
          upperX = curve.parametricUpperX;
          parametricFnX = `-(${parametricFnX})`;
          parametricFnY = `-(${parametricFnY})`;
        }
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.maxXValue() * -1, //Number
          upperLimit: curve.minXValue() * -1, //Number
          lowerX,
          upperX,
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
          parametricFnX,
          parametricFnY,
          expandedParametricFnX: parametricFnX,
          expandedParametricFnY: parametricFnY,
          expandedFn: fn, //String
          numOfPoints, //Number
          unboundedRange: false, //Boolean
          coeffs: curve.coeffs, //Array
          threeDType: null, //String e.g. "spectrocurve"
          threeDInterpolationType: null, //String e.g. "bilinear"
          lowerLimitY: undefined, //Number
          upperLimitY: undefined, //Number
          lowerLimitFxy: undefined, //Number
          upperLimitFxy: undefined, //Number
          variableY: undefined, //String
          color1: "#008b8b", //String
          color2: "#ff0000", //String

          // discontinuity: Utility.discontinuity(
          //   fn,
          //   curve.maxXValue() * -1,
          //   curve.minXValue() * -1
          // ),
        };

        const _curve = m_plot.functionDlgCb(functionDlgData);
        _curve.setAxes(curve.xAxis(), curve.yAxis());
        plot.setAutoReplot(doAutoReplot);
        _curve.attach(m_plot);
        if (doSwap) {
          _curve.swapAxes();
          curve.swapAxes();
        }
        plot.autoRefresh();
      }
    };
  }
}
