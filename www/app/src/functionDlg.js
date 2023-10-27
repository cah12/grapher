"include ['defines']";
"use strict";
class MFunctionDlg {
  constructor(plot) {
    let self = this;

    class Replacement {
      // our extended configuration options
      /* static config = {
        angles: "deg", // 'rad', 'deg', 'grad'
      }; */

      //static originalFunctionMap = {};

      static restore() {
        if (Replacement.originalFunctionMap["sin"] !== undefined) {
          //replaced. so restore
          let replacements = {};

          // create trigonometric functions replacing the input depending on angle config
          const fns1 = ["sin", "cos", "tan", "sec", "cot", "csc"];

          fns1.forEach(function (name) {
            const fnNumber = Replacement.originalFunctionMap[name];

            // create a typed-function which check the input types
            replacements[name] = math.typed(name, {
              number: fnNumber,
              "Array | Matrix": function (x) {
                return math.map(x, fnNumber);
              },
            });
          });

          // create trigonometric functions replacing the output depending on angle config
          const fns2 = [
            "asin",
            "acos",
            "atan",
            "atan2",
            "acot",
            "acsc",
            "asec",
          ];
          fns2.forEach(function (name) {
            const fnNumber = Replacement.originalFunctionMap[name];

            // create a typed-function which check the input types
            replacements[name] = math.typed(name, {
              number: fnNumber,
              "Array | Matrix": function (x) {
                return math.map(x, fnNumber);
              },
            });
          });

          // import all replacements into math.js, override existing trigonometric functions
          math.import(replacements, { override: true });
          Replacement.originalFunctionMap = {};
        }
      }

      static replace() {
        if (Replacement.originalFunctionMap["sin"] === undefined) {
          let replacements = {};

          // create trigonometric functions replacing the input depending on angle config
          const fns1 = ["sin", "cos", "tan", "sec", "cot", "csc"];

          fns1.forEach(function (name) {
            const fn = math[name]; // the original function
            Replacement.originalFunctionMap[name] = fn;

            const fnNumber = function (x) {
              // convert from configured type of angles to radians
              switch (Replacement.config.angles) {
                case "deg":
                  return fn((x / 360) * 2 * Math.PI);
                case "grad":
                  return fn((x / 400) * 2 * Math.PI);
                default:
                  return fn(x);
              }
            };

            // create a typed-function which check the input types
            replacements[name] = math.typed(name, {
              number: fnNumber,
              "Array | Matrix": function (x) {
                return math.map(x, fnNumber);
              },
            });
          });

          // create trigonometric functions replacing the output depending on angle config
          const fns2 = [
            "asin",
            "acos",
            "atan",
            "atan2",
            "acot",
            "acsc",
            "asec",
          ];
          fns2.forEach(function (name) {
            const fn = math[name]; // the original function
            Replacement.originalFunctionMap[name] = fn;

            const fnNumber = function (x) {
              const result = fn(x);

              if (typeof result === "number") {
                // convert to radians to configured type of angles
                switch (Replacement.config.angles) {
                  case "deg":
                    return (result / 2 / Math.PI) * 360;
                  case "grad":
                    return (result / 2 / Math.PI) * 400;
                  default:
                    return result;
                }
              }

              return result;
            };

            // create a typed-function which check the input types
            replacements[name] = math.typed(name, {
              number: fnNumber,
              "Array | Matrix": function (x) {
                return math.map(x, fnNumber);
              },
            });
          });

          // import all replacements into math.js, override existing trigonometric functions
          math.import(replacements, { override: true });
        }
      }
    }

    Replacement.config = {
      angles: "deg", // 'rad', 'deg', 'grad'
    };

    Replacement.originalFunctionMap = {};

    var m_dlg1 = $(
      '\
                <div class="modal fade" id="functionModal" role="dialog">\
                <div class="modal-dialog modal-md">\
                <div class="modal-content">\
                <div class="modal-header">\
                <button type="button" class="close" data-dismiss="modal">&times;</button>\
                <h4 class="modal-title">Curve Function</h4>\
                </div>\
                <div class="modal-body">\
                <div class="row">\
                <div class="col-sm-2">Three D:</div>\
                <div class="col-sm-1"><input id="fnDlg_threeD" type="checkbox"/></div>\
                <div id="threedTypeContainer">\
                <div class="col-sm-1">Type:</div>\
                <div class="col-sm-3"><select id="threeDType">\
                <option value="spectrocurve">Spectrocurve</option>\
                <option value="spectrogram">Spectrogram</option>\
                </select>\
                </div>\
                <div id="interpolationContainer">\
                <div class="col-sm-2">Interpolation:</div>\
                <div class="col-sm-3"><select id="interpolationType">\
                <option value="biLinear">Bi-linear</option>\
                <option value="biCubic">Bi-cubic</option>\
                </select>\
                </div>\
                </div>\
                </div>\
                </div>\
                <br>\
                <!--div class="row"-->\
                <!--div class="col-sm-2">Curve title:</div-->\
                <!--div class="col-sm-10"><input id="fnDlg_title" style="width:100%" type="text" value="curve_1"/></div-->\
                <!--div id="fx" class="col-sm-1">f(x):</div-->\
                <!--div class="col-sm-5"><input id="fnDlg_function" style="width:85%" type="text" value="x^2"><button id="equationEditor" style="width:15%"><img style="width:100%" src="images/function.png"></img></button></input></div-->\
                <!--div class="col-sm-7"><math-field id="fnDlg_function" style="width:91%; font-size: 20px; border-style: solid; border-width: 1px;" value="x^2"></math-field><button id="equationEditor" style="position:absolute; top:0px; right:15px; width:30px; height:100%;"><img style="width:100%" src="images/function.png"></img></button></div-->\
                <!--div class="col-sm-7"><math-field id="fnDlg_function2" style="font-size: 20px; border-style: solid; border-width: 1px">x^2</math-field></div-->\
                <!--/div>\
                <br-->\
                <div id="limits" class="row">\
                <div class="col-sm-3">Lower limit(<span class="limit_x">x</span>):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_lowerLimit" value="-10.0"/></math-field></div>\
                <div class="col-sm-3">Upper limit(<span class="limit_x">x</span>):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_upperLimit" style="width:100%" value="10.0"/></math-field></div>\
                </div>\
                <!--br-->\
                <div id="limitsY" class="row">\
                <div class="col-sm-3">Lower limit(y):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_lowerLimitY" style="width:100%" value="-10.0"/></math-field></div>\
                <div class="col-sm-3">Upper limit(y):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_upperLimitY" style="width:100%" value="10.0"/></math-field></div>\
                </div>\
                <!--br-->\
                <div id="limitsFxy" class="row">\
                <div class="col-sm-3">Lower limit(f(xy)):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_lowerLimitFxy" style="width:100%" value="0"/></math-field></div>\
                <div class="col-sm-3">Upper limit(f(xy)):</div>\
                <div class="col-sm-3"><math-field style="font-size:1.2em;" id="fnDlg_upperLimitFxy" style="width:100%" value="10.0"/></math-field></div>\
                </div>\
                <!--br-->\
                <div id="colorInterval" class="row">\
                <div class="col-sm-3">Color1(min):</div>\
                <div class="col-sm-3"><input id="fnDlg_color1" type="color" value="#008b8b"/></div>\
                <div class="col-sm-3">Color2(max):</div>\
                <div class="col-sm-3"><input id="fnDlg_color2" type="color" value="#ff0000"/></div>\
                </div>\
                <br>\
                <div class="row">\
                <div id="unboundedContainer">\
                <div class="col-sm-3">Unbounded range:</div>\
                <div class="col-sm-3"><input id="fnDlg_unboundedRange" type="checkbox"/></div>\
                </div>\
                <div class="col-sm-3">Number of points:</div>\
                <div class="col-sm-3"><input id="fnDlg_numberOfPoints" style="width:100%" type="number" min="2" value="200"/></div>\
                </div>\
                <br>\
                <div id="cont_variable" class="row">\
                <div class="col-sm-3">Enter variable(x):</div>\
                <div class="col-sm-1"><input id="fnDlg_variable" style="width:100%" type="text" value="x" /></div>\
                </div>\
                <br>\
                <div id="cont_parametric_variable" class="row">\
                <div class="col-sm-3">Enter parameter(t):</div>\
                <div class="col-sm-1"><input id="fnDlg_parametric_variable" style="width:100%" type="text" value="t" /></div>\
                </div>\
                <div id="cont_variableY" class="row">\
                <div class="col-sm-3">Enter variable(y):</div>\
                <div class="col-sm-1"><input id="fnDlg_variableY" style="width:100%" type="text" value="y" /></div>\
                </div>\
                <div class="col-sm-12">\
                  <input type="radio" id="deg" name="math_mode" value="deg" checked>\
                  <label for="deg">deg</label>\
                  <input type="radio" id="rad" name="math_mode" value="rad">\
                  <label for="rad">rad</label>\
                  <input type="radio" id="grad" name="math_mode" value="grad">\
                  <label for="grad">grad</label>\
                </div>\
                <br>\
                <br>\
                <div class="modal-footer">\
                <!--button id="fnDlg_enter" type="button" class="btn btn-default">Enter</button-->\
                <button id="fnDlg_ok" type="button" class="btn btn-default" data-dismiss="modal">Ok</button>\
                <button id="fnDlg_cancel" type="button" class="btn btn-default"  data-dismiss="modal">Close</button>\
                </div>\
                </div>\
                </div>\
                </div>\
                </div>\
                '
    );

    $("body").append(m_dlg1);

    Utility.extendGetValue($("#fnDlg_lowerLimit")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimit")[0]);

    Utility.extendGetValue($("#fnDlg_lowerLimitY")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimitY")[0]);

    Utility.extendGetValue($("#fnDlg_lowerLimitFxy")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimitFxy")[0]);

    Replacement.replace();

    $('input[name="math_mode"]').on("change", function () {
      Replacement.config.angles = $(this).val();
    });

    $("#fnDlg_variable").on("input", function () {
      const mf = $("#fnDlg_function")[0];
      let fnDlgFunctionVal = mf.getValue("ascii-math");
      if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
        $(".limit_x").html($(this).val());
      }
    });

    $("#fnDlg_parametric_variable").on("input", function () {
      const mf = $("#fnDlg_function")[0];
      let fnDlgFunctionVal = mf.getValue("ascii-math");
      if (Utility.isParametricFunction(fnDlgFunctionVal)) {
        $(".limit_x").html($(this).val());
      }
    });

    function uniqueChars(str) {
      var result = [];
      str = Utility.purgeKewords(str).str;
      for (var i = 0; i < str.length; ++i) {
        if (Utility.isAlpha(str[i])) {
          if (result.indexOf(str[i]) == -1) {
            result.push(str[i]);
          }
        }
      }
      return result;
    }

    function selectorCont(index) {
      return $("#coeff_cont" + (index + 1));
    }

    function selector(index) {
      return $("#coeff" + (index + 1));
    }
    /*
        math.acos(x)	Calculate the inverse cosine of a value.
        math.acosh(x)	Calculate the hyperbolic arccos of a value, defined as acosh(x) = ln(sqrt(x^2 - 1) + x).
        math.acot(x)	Calculate the inverse cotangent of a value, defined as acot(x) = atan(1/x).
        math.acoth(x)	Calculate the hyperbolic arccotangent of a value, defined as acoth(x) = atanh(1/x) = (ln((x+1)/x) + ln(x/(x-1))) / 2.
        math.acsc(x)	Calculate the inverse cosecant of a value, defined as acsc(x) = asin(1/x).
        math.acsch(x)	Calculate the hyperbolic arccosecant of a value, defined as acsch(x) = asinh(1/x) = ln(1/x + sqrt(1/x^2 + 1)).
        math.asec(x)	Calculate the inverse secant of a value.
        math.asech(x)	Calculate the hyperbolic arcsecant of a value, defined as asech(x) = acosh(1/x) = ln(sqrt(1/x^2 - 1) + 1/x).
        math.asin(x)	Calculate the inverse sine of a value.
        math.asinh(x)	Calculate the hyperbolic arcsine of a value, defined as asinh(x) = ln(x + sqrt(x^2 + 1)).
        math.atan(x)	Calculate the inverse tangent of a value.
        math.atan2(y, x)	Calculate the inverse tangent function with two arguments, y/x.
        math.atanh(x)	Calculate the hyperbolic arctangent of a value, defined as atanh(x) = ln((1 + x)/(1 - x)) / 2.
        math.cos(x)	Calculate the cosine of a value.
        math.cosh(x)	Calculate the hyperbolic cosine of a value, defined as cosh(x) = 1/2 * (exp(x) + exp(-x)).
        math.cot(x)	Calculate the cotangent of a value.
        math.coth(x)	Calculate the hyperbolic cotangent of a value, defined as coth(x) = 1 / tanh(x).
        math.csc(x)	Calculate the cosecant of a value, defined as csc(x) = 1/sin(x).
        math.csch(x)	Calculate the hyperbolic cosecant of a value, defined as csch(x) = 1 / sinh(x).
        math.sec(x)	Calculate the secant of a value, defined as sec(x) = 1/cos(x).
        math.sech(x)	Calculate the hyperbolic secant of a value, defined as sech(x) = 1 / cosh(x).
        math.sin(x)	Calculate the sine of a value.
        math.sinh(x)	Calculate the hyperbolic sine of a value, defined as sinh(x) = 1/2 * (exp(x) - exp(-x)).
        math.tan(x)	Calculate the tangent of a value.
        math.tanh(x)	Calculate the hyperbolic tangent of a value, defined as tanh(x) = (exp(2 * x) - 1) / (exp(2 * x) + 1).
         */

    /*var keywords =
        ["asinh", "acosh", "atanh", "acoth", "asech", "acsch",
        "asin", "acos", "atan", "acot", "asec", "acsc",
        "sinh", "cosh", "tanh", "coth", "sech", "csch",
        "sin", "cos", "tan", "sec", "csc", "cot", "log2", "log3",  "log4", "log5", "log6", "log7", "log8", "log9", "log10", "deg",
        "pi", "PI", "e", "E"]//"deg" comes before "e", deliberately.
         */

    /* function hasKeyword(str) {
      for (var i = 0; i < Static.keywords.length; ++i) {
        while (
          str.indexOf(Static.keywords[i]) != -1 
        )
          return true;
      }
      return false;
    } */

    /* function insertProductSign(str) {
      if (hasKeyword(str)) return str;
      var result = "";
      result += str[0];
      for (var i = 1; i < str.length; ++i) {
        if (
          (Utility.isAlpha(str[i - 1]) && Utility.isAlpha(str[i])) ||
          (Utility.isAlpha(str[i - 1]) && str[i] == "(")
        ) {
          result += "*";
        }
        if (_.isFinite(str[i - 1]) && Utility.isAlpha(str[i])) {
          result += "*";
        }
        result += str[i];
      }
      return result;
    } */

    /* function replaceLogWithLog10(str) {
            var result = str;
            if (result.includes("log")) {
                if (!result.includes("log10")) {
                    result = result.replace("log", "log10");
                }
            }
            return result;
        } */

    function replaceLnWithLog(str) {
      // var result = str;
      // if (result.includes("ln")) {
      //   result = result.replace("ln", "log");
      // }
      // return result;
      return str.replaceAll("ln", "log");
    }

    function getCoeffs(fnStr) {
      var result = [];

      var fn = fnStr;

      fn = Utility.purgeKewords(fn).str;

      var indepVar = $("#fnDlg_variable").val();
      while (fn.indexOf(indepVar) != -1) fn = fn.replace(indepVar, "");
      for (var i = 0; i < fn.length; ++i) {
        if (Utility.isAlpha(fn[i])) {
          if (result.indexOf(fn[i]) == -1) {
            result.push(fn[i]);
          }
        }
      }
      return result;
    }

    function validateLimits(lowerLimit, upperLimit) {
      if (lowerLimit >= upperLimit) {
        Utility.alert(
          "Upper limit is less than Lower limit. Scale will be inverted."
        );
      }
      return true;
    }

    const options2 = {
      hideAlphas: true,
      title: "Function Editor",
      screenColor: "#fff",
      screenTextColor: "#00f",
      prettyOnly: true,
      initializeWithLastValue: true,
      validOnly: true,
      bigDialog: true,
      //operatorButtonTextColor: "red"
      //buttonImages: {xSquareImg: "img/xSquare3.png"}
      // buttonImages: {xSquareImg: "Sqr", squareRootImg: "Sqrt", xToPowYImg: "x^y"}
    };

    let editor = null;
    Static.enterButton = null;

    this.init = function (cb) {
      $("#functionModal").on("shown.bs.modal", function () {
        $("#fnDlg_ok").trigger("focus");
      });

      //$("#cont_parametric_variable").hide();
      //$("#cont_variable").hide();
      $("#cont_variableY").hide();
      $("#threedTypeContainer").hide();
      $("#colorInterval").hide();
      $("#limitsY").hide();
      $("#limitsFxy").hide();
      $("#interpolationContainer").hide();

      self.threeD = false;

      $("#fnDlg_unboundedRange").change(function () {
        if ($(this)[0].checked) {
          //$("#limits").hide();
        } else {
          //$("#limits").show();
        }
      });

      $("#fnDlg_threeD").change(function () {
        self.threeD = $(this)[0].checked;
        if (!self.threeD) {
          $("#threedTypeContainer").hide();
          $("#limitsY").hide();
          $("#limitsFxy").hide();
          $("#unboundedContainer").show();
          $("#fx").html("f(x):");
          $("#fnDlg_function").val("x^2");
          $("#colorInterval").hide();
          $("#cont_parametric_variable").show();
          $("#cont_variable").show();
        } else {
          $("#threedTypeContainer").show();
          $("#limitsY").show();
          $("#limitsFxy").show();
          $("#unboundedContainer").hide();
          $("#fx").html("f(x,y):");
          $("#fnDlg_function").val("x^2 + y^2");
          $("#colorInterval").show();
          $("#cont_parametric_variable").hide();
          $("#cont_variable").hide();
        }
        //$("#cont_variable").hide();
        //$("#cont_parametric_variable").hide();
        $("#cont_variableY").hide();
        $("#fnDlg_variable").val("x");
        $("#fnDlg_variableY").val("y");
        $("#fnDlg_function").change();
      });

      $("#threeDType").change(function () {
        if ($(this).val() == "spectrogram") {
          $("#interpolationContainer").show();
        } else {
          $("#interpolationContainer").hide();
        }
      });

      /* let functionDlgData = {
        rtti: PlotItem.RttiValues.Rtti_PlotCurve,
        lowerLimit: -15, //Number
        upperLimit: 10, //Number
        threeD: false,
        title: "MyCurve", //String
        variable: "x", //String
        fn: "x^3", //String
        expandedFn: "x^3", //String
        numOfPoints: 100, //Number
        unboundedRange: false, //Boolean
        coeffs: [], //Array
        threeDType: null, //String e.g. "spectrocurve"
        threeDInterpolationType: null, //String e.g. "bilinear"
        lowerLimitY: undefined, //Number
        upperLimitY: undefined, //Number
        lowerLimitFxy: undefined, //Number
        upperLimitFxy: undefined, //Number
        variableY: null, //String
        color1: "#008b8b", //String
        color2: "#ff0000", //String
      }; */

      function negativeRootFn() {
        let fn = [];
        if (!self.expandedFn) return fn;
        const node = math.parse(self.expandedFn);
        let filtered = node.filter(function (node) {
          return node.op === "^";
        });

        filtered = filtered.concat(
          node.filter(function (node) {
            return node.fn && node.fn.name === "sqrt";
          })
        );

        for (let i = 0; i < filtered.length; i++) {
          //console.log(filtered[i].args);
          // if (filtered[i].args[0].indexOf(self.variable) == -1) {
          //   return null;
          // }
          let rhs = filtered[i].args[1];
          if (
            rhs &&
            rhs.content &&
            rhs.content.op == "/" &&
            rhs.content.args[1].value
          ) {
            let val = rhs.content.args[1].value;
            if (val % 2 == 0) {
              let s = self.expandedFn.replace(
                filtered[i].toString(),
                `-(${filtered[i].toString()})`
              );
              //console.log(456, filtered[i].toString());
              try {
                s = math.simplify(s, {}, { exactFractions: false }).toString();
              } catch (error) {}
              //Replace the whitespace delimiters stripped out by simplify()
              fn = fn.replaceAll("mod", " mod ");
              fn.push(s);
            }
          }
          if (filtered[i].fn && filtered[i].fn.name === "sqrt") {
            let s = self.expandedFn.replace(
              filtered[i].toString().replace(/\s/g, ""),
              `-(${filtered[i].toString()})`
            );
            try {
              s = math.simplify(s, {}, { exactFractions: false }).toString();
            } catch (error) {}
            //Replace the whitespace delimiters stripped out by simplify()
            //fn = fn.replaceAll("mod", " mod "); //removed
            s = s.replaceAll("mod", " mod "); //added
            fn.push(s);
          }
        }

        return fn;
      }

      function derivativeOrder(name) {
        let order = 0;
        name = name.trim();
        if (
          name.length < 4 ||
          name.indexOf("(") == -1 ||
          name.indexOf(")") == -1
        ) {
          return 0;
        }
        for (let i = 1; i < name.length; i++) {
          if (name[i] !== "'") {
            break;
          }
          order++;
        }
        return order;
      }

      function doExpandDefinesAndAdjustLogBase(
        fnDlgFunctionVal,
        variable,
        derive
      ) {
        fnDlgFunctionVal = plot.defines.expandDefines(
          fnDlgFunctionVal,
          variable,
          derive
        );

        return Utility.logBaseAdjust(fnDlgFunctionVal);
      }

      this.doEnter = function (closeDlg) {
        let expanded = false;
        let defineName = null;
        let defineValue = null;

        self.expandedParametricFnX = null;
        self.expandedParametricFnY = null;

        self.expandedFn = null;
        self.xIsDependentVariable = false;
        self.domainRangeRestriction = [];

        function forceDefine(fn, dec) {
          const arr = fn.split("=");
          if (arr.length !== 2) {
            return false; //failed to force definition
          }

          const expandedRHS = plot.defines.expandDefines(arr[1], self.variable);
          fn = `${arr[0]}=${expandedRHS}`;

          let res = null;
          fn = fn.replaceAll(dec, "U");

          var eq = nerdamer(fn);
          var solution = eq.solveFor("U");
          if (typeof solution === "array") {
            res = solution[0].toString();
          } else {
            res = solution.toString();
          }
          nerdamer.flush();
          if (res) {
            res = res.replace("U", dec);
            if (res.indexOf("U") !== -1) {
              return false; //failed to force definition
            }
            $(window).trigger("defineAdded", [
              dec,
              math.simplify(res, {}, { exactFractions: false }).toString(),
            ]);
            return true;
          }
          return false;
        }
        //console.log(456)
        if ($("#fnDlg_numberOfPoints").val() < 2) {
          $("#fnDlg_numberOfPoints").val(60);
          Utility.alert('"Number of points" cannot be \nless than 2');
        } else {
          ////
          Static.trigger(
            "numberOfPoints",
            parseInt($("#fnDlg_numberOfPoints").val())
          );

          const mf = $("#fnDlg_function")[0];

          //let fnDlgFunctionVal = Utility.latexToAscii(mf);
          let fnDlgFunctionVal = mf.getValue("ascii-math");

          /* //insert * between 0 followed by alpha eg 0x
          let m_fnDlgFunctionVal = "";
          for (let i = 1; i < fnDlgFunctionVal.length; i++) {
            const c = fnDlgFunctionVal[i-1];
            m_fnDlgFunctionVal += c;
            if(c==="0" && Utility.isAlpha(fnDlgFunctionVal[i])){
              m_fnDlgFunctionVal += "*";
            }            
          }
          m_fnDlgFunctionVal += fnDlgFunctionVal[fnDlgFunctionVal.length-1]; */
          // fnDlgFunctionVal = m_fnDlgFunctionVal;

          if (!fnDlgFunctionVal) {
            return false;
          }

          //self.latex = mf.value;

          //y=x{-2<x<2}
          let domainRangeRestriction = fnDlgFunctionVal.substring(
            fnDlgFunctionVal.indexOf("{"),
            fnDlgFunctionVal.indexOf("}") + 1
          );
          fnDlgFunctionVal = fnDlgFunctionVal.replace(
            domainRangeRestriction,
            ""
          );
          //domainRangeRestriction = domainRangeRestriction.replace(/\s/g, "");
          if (
            domainRangeRestriction.length > 0 &&
            domainRangeRestriction.length < 7
          ) {
            Utility.alert(`${domainRangeRestriction} is improperly declared.`);
            return false;
          }
          self.variable = $("#fnDlg_variable").val();
          self.parametric_variable = $("#fnDlg_parametric_variable").val();
          //self.xIsDependentVariable
          if (domainRangeRestriction.length && self.variable) {
            if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
              domainRangeRestriction = domainRangeRestriction
                .replaceAll("<", "")
                .replace("{", "")
                .replace("}", "")
                .split(self.variable);
            } else {
              domainRangeRestriction = domainRangeRestriction
                .replaceAll("<", "")
                .replace("{", "")
                .replace("}", "")
                .split(self.parametric_variable);
            }
            if (domainRangeRestriction.length != 2) {
              Utility.alert(
                `${domainRangeRestriction} is improperly declared.`
              );
              return false;
            }
            $("#fnDlg_lowerLimit").val(domainRangeRestriction[0]);
            $("#fnDlg_upperLimit").val(domainRangeRestriction[1]);
            self.domainRangeRestriction = domainRangeRestriction;
          }
          let arr = fnDlgFunctionVal.split("=");

          /* const mf = document.getElementById('formula');
          // Change the color and size of the first two characters of the mathfield
          mf.applyStyle({color: "red", fontSize: 7 }, { range: [0, 2] });

          To remove a style, set the value of the fontFamily, color or backgroundColor property to "none"
          mf.applyStyle({color: "none", fontSize: 7 }, { range: [0, 2] }); */

          if (arr[0].indexOf(",") == -1) {
            //not parametric
            let ind = 0;
            let lhs = "Left hand side:";
            let dotAdded = false;
            if (arr.length < 2) {
              lhs = "";
            }
            /* try {
              math.parse(arr[0]);
            } catch (error) {
              //let pos = parseInt(error.message.match(/(\d+)/)[0]) - 1;
              let pos = Utility.mathjsErrorToPosition(error.message) - 1;
              console.log(pos);
              let mfValueCpy = mf.value.slice();
              mfValueCpy = mfValueCpy.replace(/[\\\{\}]/g, "");
              //mfValueCpy = mfValueCpy.replace(/\{/g, "");
              //mfValueCpy = mfValueCpy.replace(/\}/g, "");

              const diff = mf.value.length - mfValueCpy.length;

              let ltxt = mf.value;
              //console.log(ltxt, mfValueCpy);
              ind = pos - diff < 0 ? 0 : pos - diff;

              if (mfValueCpy.length == 1) {
                dotAdded = true;
                mf.value += ".";
              }

              //mf.style.color = "red";
              mf.applyStyle({ color: "red" }, { range: [ind, ind + 1] });
              if (dotAdded) {
                mf.value = mf.value.substring(0, mf.value.length - 1);
              }
              dotAdded = false;
              return;
            } */
            try {
              let indexOf_ = arr[0].indexOf("_");
              if (indexOf_ !== -1) {
                throw { message: `${indexOf_}` };
              }
              // indexOf_ = arr[0].indexOf("~");
              // if (indexOf_ !== -1) {
              //   throw { message: `${indexOf_ + 2}` };
              // }
              math.parse(arr[0]);
              //const p = mf.computeEngine.parse(mf.value);
              //console.log(mf.getValue("ascii-math"));
            } catch (error) {
              //console.log(error.message);
              // let pos = Utility.mathjsErrorToPosition(error.message) - 1;
              // Utility.highLightErrorInMathField(mf, pos);
              Utility.displayErrorMessage(mf, error.message);
              return;
            }

            if (arr.length > 1) {
              try {
                math.parse(arr[1]);
              } catch (error) {
                //Utility.highLightErrorInMathField(mf, pos);
                Utility.displayErrorMessage(mf, error.message);

                /* console.log(pos);
                let mfValueCpy = mf.value.slice();
                mfValueCpy = mfValueCpy.replace(/\\/g, "");
                mfValueCpy = mfValueCpy.replace(/\{/g, "");
                mfValueCpy = mfValueCpy.replace(/\}/g, "");
                const diff = mf.value.length - mfValueCpy.length;

                // let ltxt = mf.value;
                // console.log(ltxt);
                ind = pos - diff < 0 ? 0 : pos - diff;
                ind = ind + arr[0].length + 1;

                // if (mfValueCpy.length == 1) {
                //   dotAdded = true;
                //   mf.value += ".";
                // }

                //mf.style.color = "red";
                mf.applyStyle({ color: "red" }, { range: [ind, ind + 1] });
                if (dotAdded) {
                  mf.value = mf.value.substring(0, mf.value.length - 1);
                }
                dotAdded = false; */
                return;
              }
            }
          }

          // const restoreColor = mf.style.color;
          // $("#fnDlg_function").on("change", function (e) {
          //   mf.style.color = "none";
          //   // mf.applyStyle({ color: "none" }, { range: [ind, ind + 1] });
          // });

          if (self.variable == "y") {
            if (arr.length !== 2 && arr[0].length != 1) {
              alert(
                "Improrper declaration. Try adding 'x=' to the start of the equation"
              );
              return false;
            }
            self.xIsDependentVariable = true;
          }
          if (arr.length == 2) {
            if (
              arr[0].length != 4 ||
              arr[0].indexOf("(") == -1 ||
              arr[0].indexOf(")") == -1
            ) {
              //let m_lhs = Utility.insertProductSign(arr[0], plot.defines);
              let m_lhs = arr[0];
              const m_lhs_fnDec = Utility.getFunctionDeclaration(m_lhs);
              if (m_lhs_fnDec) {
                if (!plot.defines.getDefine(m_lhs_fnDec)) {
                  console.log(
                    `${m_lhs_fnDec} is an undefined function. try to define it`
                  );
                  if (!forceDefine(fnDlgFunctionVal, m_lhs_fnDec)) {
                    alert(`Tried but failed to define "${m_lhs_fnDec}".`);
                    return;
                  }
                }
              }
              m_lhs = doExpandDefinesAndAdjustLogBase(m_lhs, self.variable);
              if (!m_lhs) {
                return;
              }

              //let m_rhs = Utility.insertProductSign(arr[1], plot.defines);
              let m_rhs = arr[1];
              m_rhs = doExpandDefinesAndAdjustLogBase(m_rhs, self.variable);
              if (!m_rhs) {
                return;
              }

              fnDlgFunctionVal = `${m_lhs}=${m_rhs}`;

              //console.log("Implicit");
              // fnDlgFunctionVal = Utility.insertProductSign(
              //   fnDlgFunctionVal,
              //   plot.defines
              // );
              if (m_lhs.length == 1) {
                arr = [m_rhs];
              } else {
                var eq = nerdamer(fnDlgFunctionVal);
                var solution =
                  self.variable == "y" ? eq.solveFor("x") : eq.solveFor("y");
                if (typeof solution === "object") {
                  arr = [solution[0].toString()];
                } else {
                  arr = [solution.toString()];
                }
                nerdamer.flush();
              }
              fnDlgFunctionVal = arr[0];
            }
          }
          if (arr.length == 2) {
            if (arr[0].length != 1) {
              if (
                arr[0].length != 4 ||
                arr[0].indexOf("(") == -1 ||
                arr[0].indexOf(")") == -1
              ) {
                Utility.alert(
                  "Invalid function declaration.\nExpected something of the form 'f(x)=X^2'."
                );
                return false;
              }
              const errorType = plot.defines.validateDefineName(
                arr[0]
              ).errorType;
              if (errorType == Defines.DefineError.start) {
                alert(
                  'Define name,"' +
                    arr[0] +
                    '", must start with alpha character.'
                );
                return false;
              }
              if (errorType == Defines.DefineError.contain) {
                alert(
                  'Define name,"' +
                    arr[0] +
                    '", contains, or is part of, the earlier define.'
                );
                return false;
              }
              if (errorType == Defines.DefineError.keyword) {
                alert(
                  'Define name,"' +
                    arr[0] +
                    '", contains "' +
                    error.name +
                    '" keyword!'
                );
                return false;
              }
              if (errorType != Defines.DefineError.noError) {
                return false;
              }

              //let m_rhs = Utility.insertProductSign(arr[1], plot.defines);
              fnDlgFunctionVal = doExpandDefinesAndAdjustLogBase(
                arr[1],
                self.variable
              );
              if (!fnDlgFunctionVal) {
                return;
              }

              defineName = arr[0];
              defineValue = fnDlgFunctionVal;
            } else {
              fnDlgFunctionVal = doExpandDefinesAndAdjustLogBase(
                arr[1],
                self.variable
              );
            }
          }

          if (
            arr.length == 1 &&
            !Utility.isParametricFunction(fnDlgFunctionVal)
          ) {
            expanded = true;
            let dec = Utility.getFullDerivativeDeclaration(
              fnDlgFunctionVal,
              self.variable
            );
            if (!dec) {
              self.expandedFn =
                self.fn =
                fnDlgFunctionVal =
                  plot.defines.expandDefines(
                    fnDlgFunctionVal,
                    self.variable,
                    false
                  );
              // fnDlgFunctionVal =
              //   Utility.insertProductSign(fnDlgFunctionVal, plot.defines);
            } else {
              /* while (dec) {
                let f_of_x = plot.defines.getDerivativeDeclaration(
                  dec,
                  self.variable
                );

                if (plot.defines.getDefine(f_of_x))
                  fnDlgFunctionVal = plot.defines.expandDefines(
                    dec,
                    self.variable,
                    false
                  );
                else
                  fnDlgFunctionVal = plot.defines.expandDefines(
                    fnDlgFunctionVal,
                    self.variable
                  );

                dec = Utility.getFullDerivativeDeclaration(
                  fnDlgFunctionVal,
                  self.variable
                );
              } */

              self.expandedFn = self.fn = plot.defines.expandDefines(
                fnDlgFunctionVal,
                self.variable
              );
            }
          }

          if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
            if (!expanded) {
              self.expandedFn = doExpandDefinesAndAdjustLogBase(
                fnDlgFunctionVal,
                self.variable,
                false
              );
              if (!self.expandedFn) {
                return;
              }

              if (self.expandedFn.charAt(1) === "'") {
                $(window).trigger("defineRemoved", arr[0]);
                plot.defines.removeDefine(arr[0]);

                Utility.alert(
                  `You are attempting to use an unknown derivative on the right-hand-side of the equation.`
                );
                return;
              }
            }
          } else {
            //Parametric function
            self.expandedFn = null;
            const obj = Utility.splitParametricFunction(fnDlgFunctionVal);
            if (!obj) {
              alert("Improperrly defined parametric function.");
              return;
            }
            let arr = [obj.operand, obj.base];
            self.expandedParametricFnX = doExpandDefinesAndAdjustLogBase(
              arr[0],
              self.variable
            );
            if (!self.expandedParametricFnX) {
              return;
            }
            self.expandedParametricFnY = doExpandDefinesAndAdjustLogBase(
              arr[1],
              self.variable
            );
            if (!self.expandedParametricFnY) {
              return;
            }
          }

          if (!self.threeD) {
            if (self.expandedFn) {
              if (/Infinity/.test(self.expandedFn)) {
                Utility.alert("Invalid function. Probably yields infinity.");
                return false;
              }
              self.coeffs = getCoeffs(self.expandedFn);
              self.expandedFn = replaceLnWithLog(self.expandedFn);
              if (self.coeffs.length > 5) {
                Utility.alert(
                  "Number of unknown coefficient cannot be greater than 5."
                );
                $("#cont_variable").show();
                return false;
              }
            } else if (
              self.expandedParametricFnX &&
              self.expandedParametricFnY
            ) {
              $("#cont_parametric_variable").show();
              //self.parametric_variable = $("#fnDlg_parametric_variable").val();
              self.coeffs = getCoeffs(
                (
                  self.expandedParametricFnX + self.expandedParametricFnY
                ).replaceAll(self.parametric_variable, "")
              );
              self.expandedParametricFnX = replaceLnWithLog(
                self.expandedParametricFnX
              );
              self.expandedParametricFnY = replaceLnWithLog(
                self.expandedParametricFnY
              );
              if (self.coeffs.length > 5) {
                Utility.alert(
                  "Number of unknown coefficient cannot be greater than 5."
                );
                $("#cont_variable").show();
                return false;
              }
            }
          }

          if (domainRangeRestriction.length) {
            let s = Utility.purgeAndMarkKeywords(domainRangeRestriction[0]);
            for (let index = 0; index < s.length; index++) {
              if (
                Utility.isAlpha(s[index]) &&
                !plot.defines.hasDefine(s[index])
              ) {
                if (self.coeffs.indexOf(s[index]) == -1) {
                  self.coeffs.push(s[index]);
                }
              }
            }
            domainRangeRestriction[0] = Utility.replaceKeywordMarkers(s);

            s = Utility.purgeAndMarkKeywords(domainRangeRestriction[1]);
            for (let index = 0; index < s.length; index++) {
              if (
                Utility.isAlpha(s[index]) &&
                !plot.defines.hasDefine(s[index])
              ) {
                if (self.coeffs.indexOf(s[index]) == -1) {
                  self.coeffs.push(s[index]);
                }
              }
            }
            domainRangeRestriction[1] = Utility.replaceKeywordMarkers(s);

            //console.log(domainRangeRestriction[0], domainRangeRestriction[1]);
          }

          function replaceParameterWith_1(str) {
            if (self.coeffs == undefined || self.coeffs.length == 0) return str;
            let s = Utility.purgeAndMarkKeywords(str);
            for (let i = 0; i < self.coeffs.length; i++) {
              if (s.indexOf(self.coeffs[i]) != -1) {
                s = s.replaceAll(self.coeffs[i], "(1)");
              }
            }
            return Utility.replaceKeywordMarkers(s);
          }

          try {
            // console.log(
            //   plot.defines.expandDefines($("#fnDlg_lowerLimit").val())
            // );

            self.lowerLimit = $("#fnDlg_lowerLimit")[0].getValue("ascii-math");

            $("#fnDlg_lowerLimit")[0].value = self.lowerLimit = math.evaluate(
              replaceParameterWith_1(
                plot.defines.expandDefines(self.lowerLimit, self.variable)
              )
            );
            if (self.lowerLimit == undefined) {
              Utility.alert("Please enter a valid lower(x) limit.");
              return false;
            }
            var lower = Math.abs(self.lowerLimit);
            if (self.lowerLimit > 0 && lower < Math.cbrt(Static._eps)) {
              Utility.alert(
                `Absolute value of lower(x) limit must not be less than ${Math.cbrt(
                  Static._eps
                )}.`
              );
              return false;
            }
          } catch (err) {
            /* try {
              self.lowerLimit = math.evaluate(
                replaceParameterWith_1($("#fnDlg_lowerLimit").val())
              );
              if (!self.lowerLimit) {
                Utility.alert("Please enter a valid lower(x) limit.");
                return false;
              }
              var lower = Math.abs(self.lowerLimit);
              if (self.lowerLimit > 0 && lower < Math.cbrt(Static._eps)) {
                Utility.alert(
                  `Absolute value of lower(x) limit must not be less than ${Math.cbrt(
                    Static._eps
                  )}.`
                );
                return false;
              }
            } catch (err) {
              Utility.alert("Please enter a valid lower(x) limit.");
              return;
            } */
            Utility.alert("Please enter a valid lower(x) limit.");
            return false;
          }

          try {
            $("#fnDlg_upperLimit")[0].value = self.upperLimit =
              $("#fnDlg_upperLimit")[0].getValue("ascii-math");
            self.upperLimit = math.evaluate(
              replaceParameterWith_1(
                plot.defines.expandDefines(self.upperLimit, self.variable)
              )
            );
            if (!self.upperLimit) {
              Utility.alert("Please enter a valid upper(x) limit.");
              return false;
            }
            var upper = Math.abs(self.upperLimit);
            if (self.upperLimit > 0 && upper < Math.cbrt(Static._eps)) {
              Utility.alert(
                `Absolute value of upper(x) limit must not be less than ${Math.cbrt(
                  Static._eps
                )}.`
              );
              return false;
            }
          } catch (err) {
            /* try {
              self.upperLimit = math.evaluate(
                replaceParameterWith_1($("#fnDlg_upperLimit").val())
              );
              if (!self.upperLimit) {
                Utility.alert("Please enter a valid upper(x) limit.");
                return false;
              }
              var upper = Math.abs(self.upperLimit);
              if (self.upperLimit > 0 && upper < Math.cbrt(Static._eps)) {
                Utility.alert(
                  `Absolute value of upper(x) limit must not be less than ${Math.cbrt(
                    Static._eps
                  )}.`
                );
                return false;
              }
            } catch (err) { */
            Utility.alert("Please enter a valid upper(x) limit.");
            return false;
            //}
          }

          self.title = $("#fnDlg_title").val();
          //self.variable = $("#fnDlg_variable").val();
          self.fn = self.expandedFn;
          //self.expandedFn = insertProductSign(expandedFn);
          self.numOfPoints = parseInt($("#fnDlg_numberOfPoints").val());

          if (!self.threeD) {
            if (self.expandedFn) {
              var uniqChars = uniqueChars(self.expandedFn);
              if (
                uniqChars.length > 0 &&
                uniqChars.indexOf($("#fnDlg_variable").val()) == -1
              ) {
                /* if(self.coeffs && self.coeffs.length){
                  for (let index = 0; index < uniqChars.length; index++) {
                    const element = uniqChars[index];
                    if(self.coeffs.indexOf(element)==-1 ){
                      
                    }
                  }
                } */
                /*  Utility.alert(
                  "Please enter a valid variable.",
                  "small",
                  "valid variable"
                );*/
                //$("#cont_variable").show();
                /*plot.defines.removeDefine(arr[0]);
                return false; */
              }
            }
            if (self.expandedParametricFnX) {
              var uniqChars = uniqueChars(self.expandedParametricFnX);
              if (
                uniqChars.length > 0 &&
                uniqChars.indexOf($("#fnDlg_parametric_variable").val()) == -1
              ) {
                /* Utility.alert(
                  "Please enter a valid parameter.",
                  "small",
                  "valid parameter"
                );
                $("#cont_parametric_variable").show();
                return false; */
              }
            }
            if (self.expandedParametricFnY) {
              var uniqChars = uniqueChars(self.expandedParametricFnY);
              if (
                uniqChars.length > 0 &&
                uniqChars.indexOf($("#fnDlg_parametric_variable").val()) == -1
              ) {
                /* Utility.alert(
                  "Please enter a valid parameter.",
                  "small",
                  "valid parameter"
                );
                $("#cont_parametric_variable").show();
                return false; */
              }
            }

            if (
              !validateLimits(
                parseFloat(self.lowerLimit),
                parseFloat(self.upperLimit)
              )
            )
              return false;
            self.unboundedRange = $("#fnDlg_unboundedRange")[0].checked;
          } else {
            //do 3d initialization
            self.threeDType = $("#threeDType").val();
            if (self.threeDType === "spectrogram") {
              self.threeDInterpolationType = $("#interpolationType").val();
            }
            try {
              $("#fnDlg_lowerLimitY")[0].value = self.lowerLimitY =
                $("#fnDlg_lowerLimitY")[0].getValue("ascii-math");
              self.lowerLimitY = math.evaluate(self.lowerLimitY);
            } catch (err) {
              Utility.alert("Please enter a valid lower(y) limit.");
              return false;
            }
            try {
              $("#fnDlg_upperLimitY")[0].value = self.upperLimitY =
                $("#fnDlg_upperLimitY")[0].getValue("ascii-math");
              self.upperLimitY = math.evaluate(self.upperLimitY);
            } catch (err) {
              Utility.alert("Please enter a valid upper(y) limit.");
              return false;
            }
            try {
              $("#fnDlg_lowerLimitFxy")[0].value = self.lowerLimitFxy = $(
                "#fnDlg_lowerLimitFxy"
              )[0].getValue("ascii-math");
              self.lowerLimitFxy = math.evaluate(self.lowerLimitFxy);
            } catch (err) {
              Utility.alert("Please enter a valid lower(f(xy)) limit.");
              return false;
            }
            try {
              $("#fnDlg_upperLimitFxy")[0].value = self.upperLimitFxy = $(
                "#fnDlg_upperLimitFxy"
              )[0].getValue("ascii-math");
              self.upperLimitFxy = math.evaluate(self.upperLimitFxy);
            } catch (err) {
              Utility.alert("Please enter a valid upper(f(xy)) limit.");
              return false;
            }
            self.variableY = $("#fnDlg_variableY").val();
            self.color1 = $("#fnDlg_color1").val();
            self.color2 = $("#fnDlg_color2").val();
          }
          cb();
          ///Determine if a negative Root curve is required and add it
          const fn = negativeRootFn();
          if (Static.negativeRoot && fn) {
            const title = self.title;
            for (let i = 0; i < fn.length; i++) {
              self.fn = self.expandedFn = fn[i];
              self.title = i + "~" + title;
              cb();
            }
          }
          if (
            self.coeffs &&
            self.coeffs.length &&
            !$("#sideBarCheckBoxId")[0].checked
          ) {
            $("#sideBarCheckBoxId").click();
          }
          if (closeDlg /*  && self.closeDlg */) {
            self.close();
          }
        } ///

        if (
          defineName &&
          defineName.length &&
          defineValue &&
          defineValue.length
        ) {
          const n_last = defineName.length - 1;
          if (
            defineName[n_last] == ")" &&
            defineName[n_last - 1] === self.variable &&
            defineName[n_last - 2] == "("
          ) {
            const define = plot.defines.getDefine(defineName);
            if (!define) {
              $(window).trigger("defineAdded", [defineName, defineValue]);
            }
          }
        }

        return true;
      };

      $("#fnDlg_function").on("input", function () {
        $("#fnDlg_function2").val($(this).val());
        var fn = $(this).val();
        if (!self.threeD) {
          if (uniqueChars(fn).length > 1 || fn.indexOf("x") == -1) {
            $("#cont_variable").show();
          } else {
            $("#cont_variable").hide();
          }
        } else {
          if (
            uniqueChars(fn).length > 2 ||
            fn.indexOf("x") == -1 ||
            fn.indexOf("y") == -1
          ) {
            $("#cont_variable").show();
            $("#cont_variableY").show();
          } else {
            $("#cont_variable").hide();
            $("#cont_variableY").hide();
          }
        }
      });

      //m_dlg1.detach();
    };

    this.functionDlg = function (curveName) {
      //$("body").append(m_dlg1);
      $("#functionModal").modal({
        backdrop: "static",
      });
      $("#fnDlg_title").val(curveName);
      const mf = $("#fnDlg_function")[0];
      let fnDlgFunctionVal = mf.getValue("ascii-math");
      if (Utility.isParametricFunction(fnDlgFunctionVal)) {
        $(".limit_x").html($("#fnDlg_parametric_variable").val());
      } else {
        $(".limit_x").html($("#fnDlg_variable").val());
      }
    };

    m_dlg1.on("hidden.bs.modal", function () {
      //m_dlg1.detach();
    });

    this.close = function () {
      $("#fnDlg_cancel").click();
      //m_dlg1.detach();
    };

    // const options = {
    //             hideAlphas: true,
    //             title: 'Function Editor',
    //             screenColor: "#fff",
    //             screenTextColor: "#00f",
    //             prettyOnly: true,
    //             initializeWithLastValue: true,
    //             validOnly: true,
    //             bigDialog: true,
    //             //operatorButtonTextColor: "red"
    //             //buttonImages: {xSquareImg: "img/xSquare3.png"}
    //              buttonImages: {xSquareImg: "Sqr", squareRootImg: "Sqrt", xToPowYImg: "x^y"}
    //         }

    //         //Create a second equation editor that will be trigger when a clickable html element with id 'test2' is clicked.
    //         let edlg = new EquationEditor("equationEditor", options);

    //         console.log(edlg)

    /* $(window).on(
      "equationEdited",
      function (e, asciiEquation, latexEquation, idOfTriggerElement) {
        if (idOfTriggerElement == "equationEditor") {
          console.log(
            "Ascii:" + asciiEquation,
            "\nLatex:" + latexEquation,
            "\nTriggerElement:" + idOfTriggerElement
          );
          //$("#fnDlg_function").val(asciiEquation);
          $("#fnDlg_function").val(latexEquation);
          $("#fnDlg_function").trigger("input");
        }
      }
    ); */

    //jQuery("#equationEditor").click();
  }
}
