"include []";
"use strict";

class Transformation {
  constructor(plot) {
    const m_plot = plot;

    this.transform = function (curve, type, param1, param2) {
      const variable = curve.variable;
      const numOfPoints = curve.dataSize();
      let lowerX = null;
      let upperX = null;
      if (type == "Translate") {
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (fn) {
          if (param1 !== 0) {
            fn = fn.replaceAll("x", "(x+" + param1 * -1 + ")");
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
          lowerX = curve.lowerX;
          upperX = curve.upperX;
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
        _curve.attach(m_plot);
      }

      if (type == "Scale") {
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
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
        _curve.attach(m_plot);
      }

      if (type == "Reflect x-axis") {
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (fn) {
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
        _curve.attach(m_plot);
      }

      if (type == "Reflect y-axis") {
        //console.log(curve.expandedFn, param1, param2);
        let { fn, parametricFnX, parametricFnY } = curve;
        if (fn) {
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
        _curve.attach(m_plot);
      }

      if (type == "Reflect x and y-axis") {
        // console.log(curve.expandedFn, param1, param2);
        let fn = `-(${curve.fn})`;
        fn = math
          .simplify(
            fn.replaceAll(variable, `(-1*${variable})`),
            {},
            { exactFractions: false }
          )
          .toString();
        //Replace the whitespace delimiters stripped out by simplify()
        fn = fn.replaceAll("mod", " mod ");
        const functionDlgData = {
          rtti: PlotItem.RttiValues.Rtti_PlotCurve,
          lowerLimit: curve.maxXValue() * -1, //Number
          upperLimit: curve.minXValue() * -1, //Number
          threeD: false,
          title: Utility.generateCurveName(m_plot, "trans_"), //eq + domain[0], //String
          variable, //String
          fn: fn, //String
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
        _curve.attach(m_plot);
      }
    };
  }
}