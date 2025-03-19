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
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_lowerLimit" style="width:100%" />-10.0</math-field></div>\
                <div class="col-sm-3">Upper limit(<span class="limit_x">x</span>):</div>\
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_upperLimit" style="width:100%" />10.0</math-field></div>\
                </div>\
                <!--br-->\
                <div id="limitsY" class="row">\
                <div class="col-sm-3">Lower limit(y):</div>\
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_lowerLimitY" style="width:100%" value="-10.0"/></math-field></div>\
                <div class="col-sm-3">Upper limit(y):</div>\
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_upperLimitY" style="width:100%" value="10.0"/></math-field></div>\
                </div>\
                <!--br-->\
                <div id="limitsFxy" class="row">\
                <div class="col-sm-3">Lower limit(f(xy)):</div>\
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_lowerLimitFxy" style="width:100%" value="0"/></math-field></div>\
                <div class="col-sm-3">Upper limit(f(xy)):</div>\
                <div class="col-sm-3"><math-field class="math-field-limits math-field-limits-enter" style="width:100%; font-size:1.2em;" id="fnDlg_upperLimitFxy" style="width:100%" value="10.0"/></math-field></div>\
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
                  <label for="deg">deg</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp\
                  <input type="radio" id="rad" name="math_mode" value="rad">\
                  <label for="rad">rad</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp\
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

    // const mathFieldLimits = $(".math-field-limits")[0];
    // mathFieldLimits.mathVirtualKeyboardPolicy = "manual";
    // console.log(mathFieldLimits.mathVirtualKeyboardPolicy);
    // //mathFieldLimits.mathVirtualKeyboardPolicy = "manual";
    // mathFieldLimits.addEventListener("focusin", () =>
    //   mathVirtualKeyboard.hide()
    // );
    // mathFieldLimits.addEventListener("focusout", () =>
    //   mathVirtualKeyboard.hide()
    // );

    Utility.extendGetValue($("#fnDlg_lowerLimit")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimit")[0]);

    Utility.extendGetValue($("#fnDlg_lowerLimitY")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimitY")[0]);

    Utility.extendGetValue($("#fnDlg_lowerLimitFxy")[0]);
    Utility.extendGetValue($("#fnDlg_upperLimitFxy")[0]);

    Replacement.replace();

    $('input[name="math_mode"]')
      .off("change")
      .on("change", async function () {
        Static.math_mode = $(this).val();
        Replacement.config.angles = $(this).val();
        if (Static.imagePath != "images/") {
          try {
            let res = await mode(Replacement.config.angles);
            //console.log(res);
          } catch (error) {
            console.log(error);
          }
        }
        $("#fnDlg_ok").trigger("focus");
      });

    $("#fnDlg_variable")
      .off("input")
      .on("input", function () {
        const mf = $("#fnDlg_function")[0];
        let fnDlgFunctionVal = mf.getValue("ascii-math");
        if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
          $(".limit_x").html($(this).val());
        }
      });

    $("#fnDlg_variable")
      .off("keydown")
      .on("keydown", function (e) {
        if (e.keyCode == 13) {
          $("#fnDlg_ok").trigger("focus");
        }
      });

    $("#fnDlg_parametric_variable")
      .off("keydown")
      .on("keydown", function (e) {
        if (e.keyCode == 13) {
          $("#fnDlg_ok").trigger("focus");
        }
      });

    $("#fnDlg_parametric_variable")
      .off("input")
      .on("input", function () {
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

    function getCoeffs(fnStr, indepVar) {
      var result = [];

      var fn = fnStr;

      fn = Utility.purgeKewords(fn).str;
      if (!indepVar) {
        indepVar = $("#fnDlg_variable").val();
      }

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
      if (Utility.mFuzzyCompare(lowerLimit, upperLimit, 1e-300)) {
        Utility.alert(
          "Upper limit is equal Lower limit.",
          null,
          "upper_equal_lower_limit"
        );
        return false;
      }
      if (lowerLimit > upperLimit) {
        Utility.alert("Upper limit must be greater than Lower limit.");
        return false;
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
      $("#functionModal")
        .off("shown.bs.modal")
        .on("shown.bs.modal", function () {
          $("#fnDlg_ok").trigger("focus");
        });

      $("#functionModal")
        .off("hidden.bs.modal")
        .on("hidden.bs.modal", function () {
          $("#executeButton").trigger("focus");
        });

      $("#fnDlg_numberOfPoints,#fnDlg_color1,#fnDlg_color2")
        .off("change")
        .on("change", (e) => {
          $("#fnDlg_ok").trigger("focus");
        });

      const els = document.getElementsByClassName("math-field-limits-enter");
      for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("beforeinput", (e) => {
          if (e.inputType === "insertLineBreak") {
            e.preventDefault();
            $("#fnDlg_ok").click();
          }
        });
      }

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
        $("#fnDlg_ok").trigger("focus");
      });

      $("#fnDlg_threeD").change(function () {
        self.threeD = $(this)[0].checked;
        if (!self.threeD) {
          $("#threedTypeContainer").hide();
          $("#limitsY").hide();
          $("#limitsFxy").hide();
          $("#unboundedContainer").show();
          $("#fx").html("f(x):");
          //$("#fnDlg_function").val("x^2");
          $("#fnDlg_function")[0].setValue(Utility.toLatex("x^2"), {
            suppressChangeNotifications: true,
          });
          $("#colorInterval").hide();
          $("#cont_parametric_variable").show();
          $("#cont_variable").show();
        } else {
          $("#threedTypeContainer").show();
          $("#limitsY").show();
          $("#limitsFxy").show();
          $("#unboundedContainer").hide();
          $("#fx").html("f(x,y):");
          //$("#fnDlg_function").val("x^2 + y^2");
          $("#fnDlg_function")[0].setValue(Utility.toLatex("x^2 + y^2"), {
            suppressChangeNotifications: true,
          });
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

        $("#fnDlg_ok").trigger("focus");
      });

      $("#threeDType").change(function () {
        if ($(this).val() == "spectrogram") {
          $("#interpolationContainer").show();
        } else {
          $("#interpolationContainer").hide();
        }
        $("#fnDlg_ok").trigger("focus");
      });

      $("#interpolationType").change(function () {
        $("#fnDlg_ok").trigger("focus");
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
        return [];
        /*let noNegativeRoot = false;
        //return fn;
        if (!self.expandedFn || $.isNumeric(self.expandedFn)) return fn;
        let degOfPoly;
        try {
          degOfPoly = nerdamer.deg(`${self.expandedFn}`).toString();
          nerdamer.clear("all");
          nerdamer.flush();
        } catch (error) {
          nerdamer.clear("all");
          nerdamer.flush();
          //return fn;
        }
        //console.log(self.expandedFn, degOfPoly);
        if (degOfPoly && degOfPoly % 2 != 0) {
          return fn;
        }
        const node = math.parse(self.expandedFn);
        let filtered = node.filter(function (node) {
          if (
            node.fn &&
            (node.fn === "pow" || (node.fn.name && node.fn.name === "sqrt"))
          ) {
            if (node.fn.name && node.fn.name === "sqrt") {
              return true;
            }
            const val = node.args[1].value;
            if ($.isNumeric(val) && val < 1) {
              const fr = math.simplify(`${val}`, {}, { exactFractions: true });
              if (fr && fr.args && fr.args[1]) {
                const denom = fr.args[1].value;
                if (denom % 2 == 0) {
                  return true;
                }
              }
              noNegativeRoot = true;
              return false;
            }
          }
          return false;
        });

        if (noNegativeRoot) {
          filtered = [];
        }

        

        

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
          if (filtered[i].fn) {
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

        fn = _.uniq(fn);

        if (fn.length) fn = [fn[0]];

        return fn;*/
      } ///////////////////////

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

      async function doExpandDefinesAndAdjustLogBase(
        fnDlgFunctionVal,
        variable,
        derive
      ) {
        try {
          fnDlgFunctionVal = await plot.defines.expandDefines(
            fnDlgFunctionVal,
            variable,
            derive
          );

          return Utility.logBaseAdjust(fnDlgFunctionVal);
        } catch (error) {
          console.log(error);
          Utility.logBaseAdjust(fnDlgFunctionVal);
        }
      }

      this.doEnter = async function (fnDlgFunctionVal, closeDlg) {
        Static.g_solution_arr = null;
        Utility.progressWait2();

        self.coeffs = null;
        self.variable = null;
        self.parametric_variable = null;

        self.expandedFn = null;
        self.parametricFnX = null;
        self.parametricFnY = null;
        self.expandedParametricFnX = null;
        self.expandedParametricFnY = null;
        self.unboundedRange = null;
        self.numOfPoints = null;

        if (!fnDlgFunctionVal || fnDlgFunctionVal.length == 0) {
          const mf = $("#fnDlg_function")[0];
          mf.setValue("?....?");
          Utility.displayErrorMessage(mf, `You made an invalid entry.`);
          Utility.progressWait2(false);
          return;
        }

        fnDlgFunctionVal = Utility.removeUnwantedAsterisk(fnDlgFunctionVal);

        const ind = Utility.isValidCharInExpression(fnDlgFunctionVal);

        if (ind != -1) {
          const mf = $("#fnDlg_function")[0];
          Utility.displayErrorMessage(
            mf,
            `Invalid character, "${fnDlgFunctionVal[ind]}", at position ${
              ind + 1
            }.`
          );
          Utility.progressWait2(false);
          return;
        }

        /* if (fnDlgFunctionVal.indexOf("=") == -1) {
          try {
            fnDlgFunctionVal = await Static.solveFor(
              `y=${fnDlgFunctionVal}`,
              "y"
            );
            if (fnDlgFunctionVal.length) {
              fnDlgFunctionVal = fnDlgFunctionVal[0];
            }
          } catch (error) {
            const mf = $("#fnDlg_function")[0];
            Utility.displayErrorMessage(
              mf,
              `"${fnDlgFunctionVal}" is an invalid function.`
            );
            Utility.progressWait2(false);
            return;
          }
        } */

        let forceDefined = false;
        let expanded = false;
        let defineName = null;
        let defineValue = null;
        self.coeffs = [];
        let domainGap_lower = [];
        let domainGap_upper = [];
        let variable = self.variable;

        self.expandedParametricFnX = null;
        self.expandedParametricFnY = null;

        self.expandedFn = null;
        self.xIsDependentVariable = false;
        self.domainRangeRestriction = [];

        if (Utility.isParametricFunction(fnDlgFunctionVal)) {
          variable = self.parametric_variable;
        }

        async function forceDefine(fn, dec) {
          fn = fn.replaceAll(dec, "U");
          const arr = fn.split("=");
          if (arr.length !== 2) {
            Utility.progressWait2(false);
            return false; //failed to force definition
          }

          try {
            const expandedRHS = await plot.defines.expandDefines(
              arr[1],
              self.variable,
              false
            );
            if (!expandedRHS) {
              Utility.progressWait2(false);
              return null;
            }

            const expandedLHS = await plot.defines.expandDefines(
              arr[0],
              self.variable,
              false
            );
            if (!expandedLHS) {
              Utility.progressWait2(false);
              return null;
            }
            fn = `${expandedLHS}=${expandedRHS}`;
            //fn = `${expandedLHS}=${expandedRHS}`;
            fn = Utility.insertProductSign(fn, self.variable, plot.defines);

            let res = null;
            //fn = fn.replaceAll(dec, "U");

            if (expandedLHS == "U" && expandedRHS.indexOf("U") === -1) {
              res = expandedRHS;
            }

            if (expandedRHS == "U" && expandedLHS.indexOf("U") === -1) {
              res = expandedLHS;
            }

            if (!res) {
              //need to account for nerdamer's inability to deal with polynomials
              // whose abs is <1 (with the exception of 0.5)

              let poly = math
                .simplify(`${expandedLHS}-${expandedRHS}`)
                .toString();
              let deg_of_poly;
              try {
                deg_of_poly = math.abs(
                  parseFloat(
                    math.simplify(
                      nerdamer(`deg(${poly},${self.variable})`).toString()
                    )
                  )
                );
              } catch (error) {
                console.log(error);
              }

              if (deg_of_poly < 1 && deg_of_poly != 0 && deg_of_poly != 0.5) {
                Utility.progressWait2(false);
                return false;
              }

              var solution;

              try {
                //Utility.progressWait();
                solution = await Static.solveFor(fn, "U", self.variable);
                Utility.progressWait2(false);
                if (!solution.length) {
                  const mf = $("#fnDlg_function")[0];
                  Utility.displayErrorMessage(
                    mf,
                    `Unable to find a solution for "${fn}".`
                  );
                  Utility.progressWait2(false);
                  return;
                }
              } catch (error) {
                console.log(error);
                Utility.progressWait2(false);
              }
              res = solution[0];
            }
            if (res) {
              try {
                if (res.indexOf(",") !== -1) {
                  const sltns = res.replaceAll(",", ", ");
                  const _res = res.split(",");
                  if (_res[0] === "0" && _res[1] !== "0") {
                    res = _res[1];
                  } else {
                    res = _res[0];
                  }
                  if (_res[0] !== "0") {
                    Utility.alert(
                      `The solutions for the definition of "${dec}" are [ ${sltns} ].\nThe first solution, "${res}", is used.`,
                      "",
                      "multiple_solution"
                    );
                  }
                }
                res = res.replace("U", dec);
                if (res.indexOf("U") !== -1) {
                  Utility.progressWait2(false);
                  return false; //failed to force definition
                }
                if (plot.defines.getDefine(dec)) {
                  alert(
                    `You are attempting to re-define ${dec}. Redefinition is not permitted.`
                  );
                  Utility.progressWait2(false);
                  return;
                }

                try {
                  await plot.defines.addDefine(
                    dec,
                    math.simplify(res, {}, { exactFractions: false }).toString()
                  );
                } catch (error) {
                  console.log(error);
                }

                Utility.progressWait2(false);
                return true;
              } catch (error) {
                console.log(error);
                return;
              }

              //////////////
            }
            Utility.progressWait2(false);
            return false;
          } catch (error) {
            console.log(error);
            return false;
          }
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
          //const mf = plot.plotPropertiesPane.mf;

          //let fnDlgFunctionVal = Utility.latexToAscii(mf);
          //let fnDlgFunctionVal = mf.getValue("ascii-math");
          const str = Utility.removeUnwantedParentheses(fnDlgFunctionVal);
          if (fnDlgFunctionVal.length > str.length) {
            fnDlgFunctionVal = `(${str})`;
          }

          self.variable = $("#fnDlg_variable").val();
          self.parametric_variable = $("#fnDlg_parametric_variable").val();

          if (fnDlgFunctionVal.indexOf("=") === -1) {
            let m_str = fnDlgFunctionVal;
            let str = Utility.getFunctionDeclaration(m_str);
            let error = [];
            while (str) {
              if (!plot.defines.getDefine(str)) {
                error.push(str);
              }
              m_str = m_str.replaceAll(str, "");
              str = Utility.getFunctionDeclaration(m_str);
            }
            if (error.length) {
              let s = error.toString();
              const lastIndex = s.lastIndexOf(",");
              if (lastIndex !== -1) {
                s =
                  s.substring(0, lastIndex) +
                  " and " +
                  s.substring(lastIndex + 1);
                s = s.replaceAll(",", ", ");
              }

              const ikws =
                Utility.getIncludedKeywords(fnDlgFunctionVal).join(", ");

              if (ikws.length) {
                Utility.displayErrorMessage(
                  mf,
                  `Failed to retrieve a valid define, ${s}, for expanding ${fnDlgFunctionVal}. Adding paranthesis to the argument of "${ikws}" may resolve the problem.`
                );
              } else {
                Utility.displayErrorMessage(
                  mf,
                  `Failed to retrieve a valid define, ${s}, for expanding ${fnDlgFunctionVal}.`
                );
              }
              Utility.progressWait2(false);
              return;
            }
          }

          if (!fnDlgFunctionVal) {
            alert("Invalid entry");
            Utility.progressWait2(false);
            return false;
          }

          //y=x{-2<x<2}
          let domainRangeRestriction = fnDlgFunctionVal.substring(
            fnDlgFunctionVal.indexOf("{"),
            fnDlgFunctionVal.indexOf("}") + 1
          );
          const s = domainRangeRestriction.replaceAll("<=", "");
          if (
            s &&
            s.length &&
            (s.indexOf("<") !== -1 ||
              s.indexOf(">") !== -1 ||
              s.indexOf(">=") !== -1)
          ) {
            // alert(
            //   `Only "less than or equal" (i.e <=) permitted in defining the domain.`
            // );
            Utility.displayErrorMessage(
              mf,
              `Only "less than or equal" (i.e <=) permitted in defining the domain.`
            );
            Utility.progressWait2(false);
            return;
          }
          let variablePlusExpanded = null;
          let variablePlus = domainRangeRestriction.substring(
            domainRangeRestriction.indexOf("=") + 1,
            domainRangeRestriction.indexOf(
              "<",
              domainRangeRestriction.indexOf("=")
            )
          );
          if (variablePlus.length > 1) {
            try {
              if (
                variablePlus.indexOf(self.variable) == -1 &&
                variablePlus.indexOf(self.parametric_variable) == -1
              ) {
                Utility.displayErrorMessage(
                  mf,
                  `The domain, ${domainRangeRestriction}, is improperly declared.`
                );
                Utility.progressWait2(false);
                return false;
              }

              variable = self.variable;

              if (Utility.isParametricFunction(fnDlgFunctionVal)) {
                variable = self.parametric_variable;
              }

              variablePlusExpanded = await plot.defines.expandDefines(
                variablePlus,
                variable /* ,
              true */
              );
              const match = variablePlusExpanded
                .replaceAll(variable, "")
                .replaceAll("^", "")
                .match(/[a-zA-z]/);
              if (match && match.length) {
                Utility.displayErrorMessage(
                  mf,
                  `The domain, ${domainRangeRestriction}, is improperly declared. Try defining "${match[0]}".`
                );
                Utility.progressWait2(false);
                return false;
              }
            } catch (error) {
              console.log(error);
              return false;
            }
          }
          fnDlgFunctionVal = fnDlgFunctionVal.replace(
            domainRangeRestriction,
            ""
          );
          //domainRangeRestriction = domainRangeRestriction.replace(/\s/g, "");
          if (
            domainRangeRestriction.length > 0 &&
            domainRangeRestriction.length < 9
          ) {
            //Utility.alert(`${domainRangeRestriction} is improperly declared.`);
            Utility.displayErrorMessage(
              mf,
              `The domain, ${domainRangeRestriction}, is improperly declared.`
            );
            Utility.progressWait2(false);
            return false;
          }

          //self.xIsDependentVariable
          if (domainRangeRestriction.length && self.variable) {
            domainRangeRestriction = domainRangeRestriction
              .replaceAll("<=", "")
              .replace("{", "")
              .replace("}", "");
            /* if (
              domainRangeRestriction.indexOf("<") !== -1 &&
              domainRangeRestriction.indexOf(">") !== -1 &&
              domainRangeRestriction.indexOf(">=") !== -1
            ) {
              // alert(
              //   `Only "less than or equal" (i.e <=) permitted in defining the domain.`
              // );
              Utility.displayErrorMessage(
                mf,
                `Only "less than or equal" (i.e <=) permitted in defining the domain.`
              );
              return;
            } */
            async function handleDomain() {
              ////////
              try {
                domainRangeRestriction = domainRangeRestriction.replaceAll(
                  "''",
                  "doublePrime"
                );
                domainRangeRestriction = domainRangeRestriction.replaceAll(
                  "'",
                  "singlePrime"
                );

                const arr = domainRangeRestriction.split(variablePlus);
                if (arr && arr.length < 2) {
                  Utility.displayErrorMessage(
                    mf,
                    `Improperly declared domain. Expected "${variable}" as the variable.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }

                let ss = arr[0];
                let ind = 1;

                for (; ind < arr.length; ind++) {
                  try {
                    math.parse(ss);
                    math.parse(arr[ind]);
                    ss += "~";
                    ss += arr[ind];
                    break;
                  } catch (error) {
                    ss += variablePlus;
                    ss += arr[ind];
                    continue;
                  }
                }

                domainRangeRestriction = ss;
                domainRangeRestriction = domainRangeRestriction.replaceAll(
                  "doublePrime",
                  "''"
                );
                domainRangeRestriction = domainRangeRestriction.replaceAll(
                  "singlePrime",
                  "'"
                );

                domainRangeRestriction = domainRangeRestriction.split("~");
                if (
                  domainRangeRestriction.length != 2 ||
                  domainRangeRestriction[0].length == 0 ||
                  domainRangeRestriction[1].length == 0
                ) {
                  // Utility.alert(
                  //   `Improperly declared domain. Expected "${self.variable}" as the variable.`
                  // );
                  Utility.displayErrorMessage(
                    mf,
                    `Improperly declared domain. Expected "${variable}" as the variable.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }

                domainRangeRestriction[0] = await plot.defines.expandDefines(
                  domainRangeRestriction[0],
                  self.variable
                );
                domainRangeRestriction[1] = await plot.defines.expandDefines(
                  domainRangeRestriction[1],
                  self.variable
                );
                if (
                  parseFloat(domainRangeRestriction[0]) >=
                  parseFloat(domainRangeRestriction[1])
                ) {
                  Utility.displayErrorMessage(
                    mf,
                    `Invalid domain declaration. Lower limit must be less than the upper limit.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                if (variablePlusExpanded && variablePlusExpanded.length > 1) {
                  let fn = `${variablePlusExpanded}=${domainRangeRestriction[0]}`;

                  let solution;
                  try {
                    //Utility.progressWait();
                    solution = await Static.solveFor(fn, variable, variable);
                    Utility.progressWait2(false);
                    if (!solution.length) {
                      const mf = $("#fnDlg_function")[0];
                      Utility.displayErrorMessage(
                        mf,
                        `Unable to find a solution for "${fn}".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                  } catch (error) {
                    console.log(error);
                    Utility.progressWait2(false);
                  }

                  let sol;
                  for (let i = 0; i < solution.length; i++) {
                    sol = math
                      .simplify(solution[i].replaceAll("abs", ""))
                      .toString();
                    if ($.isNumeric(sol)) {
                      domainGap_lower.push(sol);
                    }
                  }

                  domainGap_lower = domainGap_lower.sort((a, b) => {
                    return parseFloat(a) - parseFloat(b);
                  });

                  if (domainGap_lower.length > 2) {
                    let arr = [];
                    for (let i = 0; i < domainGap_lower.length; i++) {
                      if ((i + 1) % 2 == 0) {
                        domainGap_upper.push(domainGap_lower[i]);
                      } else {
                        arr.push(domainGap_lower[i]);
                      }
                    }
                    domainGap_lower = arr;
                  }

                  fn = `${variablePlusExpanded}=${domainRangeRestriction[1]}`;

                  //console.log(eq.toString());
                  //solution = eq.solveFor(variable);

                  try {
                    //Utility.progressWait();
                    solution = await Static.solveFor(fn, variable, variable);
                    Utility.progressWait2(false);
                    if (!solution.length) {
                      const mf = $("#fnDlg_function")[0];
                      Utility.displayErrorMessage(
                        mf,
                        `Unable to find a solution for "${fn}".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                  } catch (error) {
                    console.log(error);
                    Utility.progressWait2(false);
                  }

                  sol;
                  //console.log(solution);

                  for (let i = 0; i < solution.length; i++) {
                    sol = math
                      .simplify(solution[i].replaceAll("abs", ""))
                      .toString();
                    if ($.isNumeric(sol)) {
                      domainGap_upper.push(sol);
                    }
                  }
                }

                if (
                  domainGap_lower.length == 1 &&
                  domainGap_upper.length == 1
                ) {
                  domainRangeRestriction = [
                    domainGap_lower[0],
                    domainGap_upper[0],
                  ];
                }

                if (
                  domainGap_lower.length == 2 &&
                  domainGap_upper.length == 2
                ) {
                  domainRangeRestriction = [
                    domainGap_lower[0],
                    domainGap_upper[0],
                  ];
                }

                if (
                  domainGap_lower.length == 0 &&
                  domainGap_upper.length == 2
                ) {
                  let l = parseFloat(domainGap_upper[0]);
                  let u = parseFloat(domainGap_upper[1]);

                  if (l > u) {
                    const temp = u;
                    u = l;
                    l = temp;
                  }
                  domainRangeRestriction = [l + "", u + ""];
                }

                if (
                  domainGap_lower.length == 2 &&
                  domainGap_upper.length == 0
                ) {
                  let l = parseFloat(domainGap_lower[0]);
                  let u = parseFloat(domainGap_lower[1]);

                  if (l > u) {
                    const temp = u;
                    u = l;
                    l = temp;
                  }
                  domainRangeRestriction = [l + "", u + ""];
                }

                if (
                  domainGap_lower.length == 1 &&
                  domainGap_upper.length == 2
                ) {
                  if (
                    parseFloat(domainGap_upper[0]) >
                    parseFloat(domainGap_upper[1])
                  ) {
                    let temp = domainGap_upper[0];
                    domainGap_upper[0] = domainGap_upper[1];
                    domainGap_upper[1] = temp;
                  } //
                  let l = parseFloat(domainGap_upper[0]);
                  let u = parseFloat(domainGap_upper[1]);
                  if (
                    parseFloat(domainGap_lower[0]) <
                    parseFloat(domainGap_upper[0])
                  ) {
                    l = parseFloat(domainGap_lower[0]);
                  }

                  if (
                    parseFloat(domainGap_lower[0]) >
                    parseFloat(domainGap_upper[1])
                  ) {
                    u = parseFloat(domainGap_lower[0]);
                  }

                  if (l > u) {
                    const temp = u;
                    u = l;
                    l = temp;
                  }
                  domainRangeRestriction = [l + "", u + ""];

                  /* let l = parseFloat(domainGap_lower[0]);
                let l_0, u;

                if (
                  parseFloat(domainGap_upper[0]) <
                  parseFloat(domainGap_upper[1])
                ) {
                  l_0 = parseFloat(domainGap_upper[0]);
                  if (l_0 < l) {
                    l = l_0;
                  }
                  u = parseFloat(domainGap_upper[1]);
                } else {
                  l_0 = parseFloat(domainGap_upper[1]);
                  if (l_0 < l) {
                    l = l_0;
                  }
                  u = parseFloat(domainGap_upper[0]);
                }

                if (l > u) {
                  const temp = u;
                  u = l;
                  l = temp;
                }
                domainRangeRestriction = [l + "", u + ""]; */
                }

                if (
                  domainGap_lower.length == 2 &&
                  domainGap_upper.length == 1
                ) {
                  if (
                    parseFloat(domainGap_lower[0]) >
                    parseFloat(domainGap_lower[1])
                  ) {
                    let temp = domainGap_lower[0];
                    domainGap_lower[0] = domainGap_lower[1];
                    domainGap_lower[1] = temp;
                  }

                  let l = parseFloat(domainGap_lower[0]);
                  let u = parseFloat(domainGap_lower[1]);
                  if (
                    parseFloat(domainGap_upper[0]) <
                    parseFloat(domainGap_lower[0])
                  ) {
                    l = parseFloat(domainGap_upper[0]);
                  }

                  if (
                    parseFloat(domainGap_upper[0]) >
                    parseFloat(domainGap_lower[1])
                  ) {
                    u = parseFloat(domainGap_upper[0]);
                  }

                  if (l > u) {
                    const temp = u;
                    u = l;
                    l = temp;
                  }
                  domainRangeRestriction = [l + "", u + ""];
                }

                ///////////////////////////////////////////////////////////////////
                if (
                  parseFloat(domainRangeRestriction[0]) >
                  parseFloat(domainRangeRestriction[1])
                ) {
                  const temp = domainRangeRestriction[0];
                  domainRangeRestriction[0] = domainRangeRestriction[1];
                  domainRangeRestriction[1] = temp;
                }

                let dmLimit = domainRangeRestriction[0];
                domainRangeRestriction[0] = await plot.defines.expandDefines(
                  domainRangeRestriction[0],
                  self.variable,
                  true
                );
                const v = await plot.defines.expandDefines(
                  domainRangeRestriction[0]
                );
                domainRangeRestriction[0] = handleCoeffs(v);

                if (!domainRangeRestriction[0]) {
                  Utility.displayErrorMessage(
                    mf,
                    `Unable to resolve lower limit, ${dmLimit}, within the declared domain.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                dmLimit = domainRangeRestriction[1];
                domainRangeRestriction[1] = await plot.defines.expandDefines(
                  domainRangeRestriction[1],
                  self.variable,
                  true
                );
                const v2 = await plot.defines.expandDefines(
                  domainRangeRestriction[1]
                );
                domainRangeRestriction[1] = handleCoeffs(v2);

                if (!domainRangeRestriction[1]) {
                  Utility.displayErrorMessage(
                    mf,
                    `Unable to resolve upper limit, ${dmLimit}, within the declared domain.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                if (
                  parseFloat(domainRangeRestriction[0]) >=
                  parseFloat(domainRangeRestriction[1])
                ) {
                  Utility.displayErrorMessage(
                    mf,
                    `Upper limit must be greater than Lower limit.`
                  );
                  Utility.progressWait2(false);
                  return false;
                } ///
                Utility.progressWait2(false);
                return true;
              } catch (error) {
                console.log(error);
                return true;
              }
            }

            if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
              if (variablePlus.indexOf(self.variable) == -1) {
                Utility.displayErrorMessage(
                  mf,
                  `Improperly declared domain. Expected "${self.variable}" as the variable.`
                );
                Utility.progressWait2(false);
                return false;
              }

              if (!handleDomain()) {
                Utility.progressWait2(false);
                return false;
              }
              if (
                variablePlus.length > 1 &&
                domainGap_lower.length + domainGap_upper.length < 2
              ) {
                Utility.displayErrorMessage(
                  mf,
                  `Unable to resolve the declared domain.`
                );
                Utility.progressWait2(false);
                return false;
              }
            } else {
              if (variablePlus.indexOf(self.parametric_variable) == -1) {
                Utility.displayErrorMessage(
                  mf,
                  `Improperly declared domain. Expected "${self.parametric_variable}" as the variable.`
                );
                Utility.progressWait2(false);
                return false;
              }
              handleDomain();
              if (
                variablePlus.length > 1 &&
                domainGap_lower.length + domainGap_upper.length < 2
              ) {
                Utility.displayErrorMessage(
                  mf,
                  `Unable to resolve the declared domain.`
                );
                Utility.progressWait2(false);
                return false;
              }
            }

            if (
              parseFloat(domainRangeRestriction[0]) >
              parseFloat(domainRangeRestriction[1])
            ) {
              const temp = domainRangeRestriction[0];
              domainRangeRestriction[0] = domainRangeRestriction[1];
              domainRangeRestriction[1] = temp;
            }
            $("#fnDlg_lowerLimit")[0].setValue(
              Utility.toLatex(domainRangeRestriction[0]),
              { suppressChangeNotifications: true }
            );
            $("#fnDlg_upperLimit")[0].setValue(
              Utility.toLatex(domainRangeRestriction[1]),
              { suppressChangeNotifications: true }
            );
            self.domainRangeRestriction = domainRangeRestriction;
          }
          let arr = fnDlgFunctionVal.split("=");

          let lhs, rhs;

          if (
            arr.length == 2 &&
            fnDlgFunctionVal.indexOf("y") !== -1 &&
            self.variable !== "y"
          ) {
            try {
              lhs = await plot.defines.expandDefines(
                arr[0],
                self.variable,
                true
              );
              if (!Utility.isValidExpression(lhs, "y", arr[1], self.variable)) {
                Utility.displayErrorMessage(
                  mf,
                  `Degree of polynomial in "y" greater than 3 not yet supported - "${lhs}".`
                );
                Utility.progressWait2(false);
                return;
              }
              if (!lhs) {
                const ikws = Utility.getIncludedKeywords(arr[0]).join(", ");

                if (ikws.length) {
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to retrieve a valid define for expanding "${arr[0]}". Adding paranthesis to the argument of "${ikws}" may resolve the problem.`
                  );
                } else {
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to retrieve a valid define for expanding "${arr[0]}".`
                  );
                }

                Utility.progressWait2(false);
                return;
              }
              rhs = await plot.defines.expandDefines(
                arr[1],
                self.variable,
                true
              );
              if (!Utility.isValidExpression(rhs, "y", arr[0], self.variable)) {
                Utility.displayErrorMessage(
                  mf,
                  `Degree of polynomial in "y" greater than 3 not yet supported - "${rhs}".`
                );
                Utility.progressWait2(false);
                return;
              }
              if (!rhs) {
                const ikws = Utility.getIncludedKeywords(arr[1]).join(", ");

                if (ikws.length) {
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to retrieve a valid define for expanding "${arr[1]}". Adding paranthesis to the argument of "${ikws}" may resolve the problem.`
                  );
                } else {
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to retrieve a valid define for expanding "${arr[1]}".`
                  );
                }

                Utility.progressWait2(false);
                return;
              }
              fnDlgFunctionVal = `${lhs}=${rhs}`;
              let res;
              try {
                res = math.simplify(`-1*(${lhs}-(${rhs}))`).toString();
              } catch (error) {
                console.log(error);
              }

              if (res.indexOf("y") == -1) {
                // alert(
                //   `The equation, ${fnDlgFunctionVal}, simplifies 0*y=${res}. This leads to the invalid divide-by-zero.`
                // );
                Utility.displayErrorMessage(
                  mf,
                  `The equation, ${fnDlgFunctionVal}, simplifies 0*y=${res}. This leads to the invalid divide-by-zero.`
                );
                Utility.progressWait2(false);
                return;
              }

              if (rhs == "y") {
                rhs = lhs;
                lhs = "y";
              }

              if (lhs != "y") {
                let validForNerdamer = true;
                let invalidExponent = null;

                if (validForNerdamer) {
                  // let eq = nerdamer(fnDlgFunctionVal);
                  // console.log(eq.toString());
                  let solution; // = eq.solveFor("y");

                  try {
                    //Utility.progressWait();
                    solution = await Static.solveFor(
                      fnDlgFunctionVal,
                      "y",
                      variable
                    );
                    Utility.progressWait2(false);
                    if (!solution.length) {
                      const mf = $("#fnDlg_function")[0];
                      Utility.displayErrorMessage(
                        mf,
                        `Unable to find a solution for "${fnDlgFunctionVal}".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                  } catch (error) {
                    console.log(error);
                    Utility.progressWait2(false);
                    Utility.displayErrorMessage(
                      mf,
                      `Unable to find a solution for "${fnDlgFunctionVal}".`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                  arr = ["y", solution[0].replaceAll("abs", "")];
                  Static.g_solution_arr = solution;

                  fnDlgFunctionVal = `y=${arr[1]}`;
                } else {
                  Utility.displayErrorMessage(
                    mf,
                    `Unable to resolve for "y". The absolute value of the degree of polynomial must be greater than 1 or equal to 0.5`
                  );
                  Utility.progressWait2(false);
                  return;
                }
              }
            } catch (error) {
              console.log(error);
              return;
            }
          }

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

            try {
              let indexOf_ = arr[0].indexOf("_");
              if (indexOf_ !== -1) {
                throw { message: `${indexOf_}` };
              }
              math.parse(arr[0]);
            } catch (error) {
              Utility.displayErrorMessage(mf, error.message);
              Utility.progressWait2(false);
              return;
            }

            if (arr.length > 1) {
              try {
                math.parse(arr[1]);
              } catch (error) {
                Utility.displayErrorMessage(mf, error.message);
                Utility.progressWait2(false);
                return;
              }
            }
          }

          if (self.variable == "y") {
            if (arr.length !== 2 && arr[0].length != 1) {
              // alert(
              //   "Improrper declaration. Try adding 'x=' to the start of the equation"
              // );
              Utility.displayErrorMessage(
                mf,
                "Improrper declaration. Try adding 'x=' to the start of the equation"
              );
              Utility.progressWait2(false);
              return false;
            }
            self.xIsDependentVariable = true;
          }
          if (arr.length == 2) {
            if (
              1
              //arr[0].length != 4 ||
              //arr[0].indexOf("(") == -1 ||
              //arr[0].indexOf(")") == -1
            ) {
              ////////////////////////////////////////////////////////
              let m_lhs = arr[0];
              let m_rhs = arr[1];
              let m_rhs_fnDec = Utility.getFunctionDeclaration(m_rhs);
              if (m_rhs_fnDec) {
                if (!plot.defines.getDefine(m_rhs_fnDec)) {
                  if (
                    self.variable !== "y" &&
                    fnDlgFunctionVal.indexOf("y") !== -1
                  ) {
                    // alert(
                    //   `Cannot use "y" in this context. It is reserved for use as the independent variable.`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `Cannot use "y" in this context. It is reserved for use as the independent variable.`
                    );
                    Utility.progressWait2(false);
                    return;
                  }

                  if (await forceDefine(fnDlgFunctionVal, m_rhs_fnDec)) {
                    // alert(`Tried but failed to define "${m_rhs_fnDec}".`);
                    // return;

                    forceDefined = true;
                    fnDlgFunctionVal = m_rhs = m_rhs_fnDec;
                    arr = [m_rhs];
                  } else {
                    Utility.displayErrorMessage(
                      mf,
                      `Unable to resolve for "${m_rhs_fnDec}". The absolute value of the degree of polynomial must be greater than 1 or equal to 0.5`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                }
              }
              m_rhs_fnDec = Utility.getFullDerivativeDeclaration(m_rhs);
              if (m_rhs_fnDec) {
                try {
                  const _dec = Utility.getFunctionDeclaration(m_rhs);
                  if (_dec) {
                    m_rhs = m_rhs.replaceAll(_dec, "U");
                  }
                  m_rhs = await plot.defines.expandDefines(
                    m_rhs,
                    self.variable,
                    true
                  );
                  if (_dec) {
                    m_rhs = m_rhs.replaceAll("U", _dec);
                  }
                  if (!m_rhs) {
                    //alert(`Tried but failed to define "${m_rhs_fnDec}".`);
                    Utility.displayErrorMessage(
                      mf,
                      `Tried but failed to define "${m_rhs_fnDec}".`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                  arr[1] = m_rhs;
                } catch (error) {
                  console.log(error);
                  return;
                }
              }

              if (!forceDefined) {
                let m_lhs_fnDec = Utility.getFunctionDeclaration(m_lhs);
                if (m_lhs_fnDec) {
                  if (!plot.defines.getDefine(m_lhs_fnDec)) {
                    try {
                      if (
                        self.variable !== "y" &&
                        fnDlgFunctionVal.indexOf("y") !== -1
                      ) {
                        // alert(
                        //   `Cannot use "y" in this context. It is reserved for use as the independent variable.`
                        // );
                        Utility.displayErrorMessage(
                          mf,
                          `Cannot use "y" in this context. It is reserved for use as the independent variable.`
                        );
                        Utility.progressWait2(false);
                        return;
                      }

                      const fd = await forceDefine(
                        fnDlgFunctionVal,
                        m_lhs_fnDec
                      );

                      if (fd) {
                        fnDlgFunctionVal = m_lhs = m_lhs_fnDec;
                        arr = [m_lhs];
                      } else {
                        Utility.displayErrorMessage(
                          mf,
                          `Unable to resolve for "${m_lhs_fnDec}". The absolute value of the degree of polynomial must be greater than 1 or equal to 0.5`
                        );
                        Utility.progressWait2(false);
                        return;
                      }
                    } catch (error) {
                      console.log(error);
                      return;
                    }
                  } else {
                    if (
                      arr[0].indexOf("y") == -1 &&
                      arr[1].indexOf("y") == -1
                    ) {
                      // alert(
                      //   `The equation, ${fnDlgFunctionVal}, is missing the dependent variable "y".\nRevise the entry to exclude the equal sign or add "y".`
                      // );
                      Utility.displayErrorMessage(
                        mf,
                        `The equation, ${fnDlgFunctionVal}, is missing the dependent variable "y".\nRevise the entry to exclude the equal sign or add "y".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                  }
                }
                m_lhs_fnDec = Utility.getFullDerivativeDeclaration(m_lhs);
                if (m_lhs_fnDec) {
                  try {
                    const _dec = Utility.getFunctionDeclaration(m_rhs);
                    if (_dec) {
                      m_lhs = m_lhs.replaceAll(_dec, "U");
                    }
                    m_lhs = await plot.defines.expandDefines(
                      m_lhs,
                      self.variable,
                      true
                    );
                    if (_dec) {
                      m_lhs = m_lhs.replaceAll("U", _dec);
                    }
                    if (!_dec) {
                      m_lhs = await plot.defines.expandDefines(
                        m_lhs,
                        self.variable,
                        true
                      );
                    }
                    if (!m_lhs) {
                      //alert(`Tried but failed to define "${m_lhs_fnDec}".`);
                      Utility.displayErrorMessage(
                        mf,
                        `Tried but failed to define "${m_lhs_fnDec}".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                    arr[0] = m_lhs;
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
              if (m_lhs !== "0" && fnDlgFunctionVal !== m_lhs) {
                try {
                  m_lhs = await doExpandDefinesAndAdjustLogBase(
                    m_lhs,
                    self.variable,
                    false
                  );
                  if (!m_lhs) {
                    // alert(
                    //   `Failed to expand, ${arr[0]}, the left-hand-side. Perhaps because all or part of it is unknown and cannot be derive.`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `Failed to expand, ${arr[0]}, the left-hand-side. Perhaps because all or part of it is unknown and cannot be derive.`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                } catch (error) {
                  console.log(error);
                  return;
                }
              }

              m_rhs = arr[1];
              if (arr.length == 2) {
                try {
                  m_rhs = await doExpandDefinesAndAdjustLogBase(
                    m_rhs,
                    self.variable,
                    false
                  );
                  if (!m_rhs /*  && m_lhs !== "0" */) {
                    // alert(
                    //   `Failed to expand, ${arr[1]}, the right-hand-side. Perhaps because all or part of it is unknown and cannot be derive.`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `Failed to expand, ${arr[1]}, the right-hand-side. Perhaps because all or part of it is unknown and cannot be derive.`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                } catch (error) {
                  console.log(error);
                  return;
                }
              }

              if (arr.length == 2) {
                let dec = Utility.getFunctionDeclaration(arr[0]);
                if (!dec) {
                  dec = Utility.getFunctionDeclaration(arr[1]);
                }
                if (dec) {
                  fnDlgFunctionVal = `${arr[0]}=${arr[1]}`;
                  fnDlgFunctionVal = fnDlgFunctionVal.replaceAll(dec, "U");
                  var solution;
                  try {
                    //Utility.progressWait();
                    solution = await Static.solveFor(
                      fnDlgFunctionVal,
                      "U",
                      variable
                    );
                    Utility.progressWait2(false);
                    if (!solution.length) {
                      const mf = $("#fnDlg_function")[0];
                      Utility.displayErrorMessage(
                        mf,
                        `Unable to find a solution for "${fnDlgFunctionVal}".`
                      );
                      Utility.progressWait2(false);
                      return;
                    }
                  } catch (error) {
                    console.log(error);
                    Utility.progressWait2(false);
                  }

                  arr = [solution[0]];

                  fnDlgFunctionVal = arr[0];
                  if (plot.defines.getDefine(dec)) {
                    // alert(
                    //   `You are attempting to re-define ${dec}. Redefinition is not permitted.`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `You are attempting to re-define ${dec}. Redefinition is not permitted.`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                  $(window).trigger("defineAdded", [dec, fnDlgFunctionVal]);
                } else {
                  if (arr[0].indexOf("y") == -1 && arr[1].indexOf("y") == -1) {
                    // alert(
                    //   `The equation, ${arr[0]}=${arr[1]}, is missing the dependent variable "y".\nRevise the entry to exclude the equal sign or add "y".`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `The equation, ${arr[0]}=${arr[1]}, is missing the dependent variable "y".\nRevise the entry to exclude the equal sign or add "y".`
                    );
                    Utility.progressWait2(false);
                    return;
                  }
                  if (m_lhs.length == 1 && m_rhs.indexOf("y") == -1) {
                    arr = [m_rhs];
                  } else {
                    var solution;

                    let _v = "y";
                    if (self.variable == "y") {
                      _v = "x";
                    }
                    try {
                      //Utility.progressWait();
                      solution = await Static.solveFor(
                        fnDlgFunctionVal,
                        _v,
                        variable
                      );
                      Utility.progressWait2(false);
                      if (!solution.length) {
                        const mf = $("#fnDlg_function")[0];
                        Utility.displayErrorMessage(
                          mf,
                          `Unable to find a solution for "${fnDlgFunctionVal}".`
                        );
                        Utility.progressWait2(false);
                        return;
                      }
                    } catch (error) {
                      console.log(error);
                      Utility.progressWait2(false);
                    }
                    arr = [solution[0]];
                  }
                  fnDlgFunctionVal = arr[0];
                }
              }
            }
          }
          if (arr.length == 2) {
            try {
              if (arr[0].length != 1) {
                if (
                  arr[0].length != 4 ||
                  arr[0].indexOf("(") == -1 ||
                  arr[0].indexOf(")") == -1
                ) {
                  // Utility.alert(
                  //   "Invalid function declaration.\nExpected something of the form 'f(x)=X^2'."
                  // );
                  Utility.displayErrorMessage(
                    mf,
                    `Invalid function declaration.\nExpected something of the form 'f(x)=X^2'.`
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                let errorType = plot.defines.validateDefineName(
                  arr[0]
                ).errorType;
                if (errorType == Defines.DefineError.start) {
                  alert(
                    'Define name,"' +
                      arr[0] +
                      '", must start with alpha character.'
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                if (errorType == Defines.DefineError.contain) {
                  if (arr[1].indexOf("y") == -1) {
                    alert(
                      'Define name,"' +
                        arr[0] +
                        '", contains, or is part of, the earlier define.'
                    );
                    Utility.progressWait2(false);
                    return false;
                  }
                  errorType = 0;
                }
                if (errorType == Defines.DefineError.keyword) {
                  alert(
                    'Define name,"' +
                      arr[0] +
                      '", contains "' +
                      error.name +
                      '" keyword!'
                  );
                  Utility.progressWait2(false);
                  return false;
                }
                if (errorType != Defines.DefineError.noError) {
                  alert(`An error exist within the defines.`);
                  Utility.progressWait2(false);
                  return false;
                }

                ///////////////
                let m_arr = fnDlgFunctionVal.split("=");
                if (m_arr.length == 2 && m_arr[1].indexOf("y") !== -1) {
                  m_arr[0] = await doExpandDefinesAndAdjustLogBase(
                    m_arr[0],
                    self.variable
                  );
                  var fn = `${m_arr[0]}=${m_arr[1]}`;
                  var solution;

                  let _v = "y";
                  if (self.variable == "y") {
                    _v = "x";
                  }

                  //Utility.progressWait();
                  solution = await Static.solveFor(fn, _v, variable);
                  Utility.progressWait2(false);
                  if (!solution.length) {
                    const mf = $("#fnDlg_function")[0];
                    Utility.displayErrorMessage(
                      mf,
                      `Unable to find a solution for "${fn}".`
                    );
                    Utility.progressWait2(false);
                    return;
                  }

                  arr[0] = "y";
                  arr[1] = solution[0].toString();

                  fnDlgFunctionVal = arr[1];
                }

                fnDlgFunctionVal = await doExpandDefinesAndAdjustLogBase(
                  arr[1],
                  self.variable
                );
                if (!fnDlgFunctionVal) {
                  //alert(`Failed to successfully expand ${arr[1]}`);
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to successfully expand ${arr[1]}`
                  );
                  Utility.progressWait2(false);
                  return;
                }

                defineName = arr[0];
                defineValue = fnDlgFunctionVal;
              } else {
                fnDlgFunctionVal = await doExpandDefinesAndAdjustLogBase(
                  arr[1],
                  self.variable
                );
              }
            } catch (error) {
              console.log(error);
              return;
            }
          } /////////////////////c

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
              try {
                //console.time("timer");
                self.expandedFn =
                  self.fn =
                  fnDlgFunctionVal =
                    await plot.defines.expandDefines(
                      fnDlgFunctionVal,
                      self.variable,
                      false
                    );
                //console.timeEnd("timer");
                if (!self.expandedFn) {
                  Utility.progressWait2(false);
                  return;
                }
                if (typeof self.expandedFn == "object") {
                  //console.log("do relation");
                  const relationFn = self.expandedFn.fn;
                  self.expandedFn = self.fn = fnDlgFunctionVal = null;

                  const { lowerLimit, upperLimit, numOfPoints, variable } =
                    self;

                  const samples = Utility.inverseRelationSamples(
                    relationFn,
                    lowerLimit,
                    upperLimit,
                    numOfPoints,
                    variable,
                    plot
                  );

                  if (samples && samples.length) {
                    const c = new MyCurve(
                      Utility.generateCurveName(plot, "Inv_")
                    );
                    c.setSamples(samples);
                    c.attach(plot);
                  }
                  Utility.progressWait2(false);
                  return;
                }
              } catch (error) {
                console.log(error);
              }
            } else {
              try {
                self.expandedFn = self.fn = await plot.defines.expandDefines(
                  fnDlgFunctionVal,
                  self.variable
                );
                if (!self.expandedFn) {
                  const ikws =
                    Utility.getIncludedKeywords(fnDlgFunctionVal).join(", ");

                  if (ikws.length) {
                    Utility.displayErrorMessage(
                      mf,
                      `Failed to retrieve a valid define, ${dec}, for expanding ${fnDlgFunctionVal}. Adding paranthesis to the argument of "${ikws}" may resolve the problem.`
                    );
                  } else {
                    Utility.displayErrorMessage(
                      mf,
                      `Failed to retrieve a valid define, ${dec}, for expanding ${fnDlgFunctionVal}.`
                    );
                  }

                  Utility.progressWait2(false);
                  return;
                }
              } catch (error) {
                console.log(error);
                return;
              }
            }
          }

          if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
            try {
              if (!expanded) {
                self.expandedFn = await doExpandDefinesAndAdjustLogBase(
                  fnDlgFunctionVal,
                  self.variable,
                  false
                );
                if (!self.expandedFn) {
                  //alert(`Failed to successfully expand ${fnDlgFunctionVal}`);
                  Utility.displayErrorMessage(
                    mf,
                    `Failed to successfully expand ${fnDlgFunctionVal}`
                  );
                  Utility.progressWait2(false);
                  return;
                }

                if (self.expandedFn.charAt(1) === "'") {
                  $(window).trigger("defineRemoved", arr[0]);
                  plot.defines.removeDefine(arr[0]);

                  // Utility.alert(
                  //   `You are attempting to use an unknown derivative on the right-hand-side of the equation.`
                  // );
                  Utility.displayErrorMessage(
                    mf,
                    `You are attempting to use an unknown derivative on the right-hand-side of the equation.`
                  );
                  Utility.progressWait2(false);
                  return;
                }
              }
            } catch (error) {
              console.log(error);
              return;
            }
          } else {
            //Parametric function
            try {
              self.expandedFn = null;
              const obj = Utility.splitParametricFunction(fnDlgFunctionVal);
              if (!obj) {
                //alert("Improperrly defined parametric function.");
                Utility.displayErrorMessage(
                  mf,
                  `Improperrly defined parametric function.`
                );
                Utility.progressWait2(false);
                return;
              }
              let arr = [obj.operand, obj.base];
              self.expandedParametricFnX =
                await doExpandDefinesAndAdjustLogBase(
                  arr[0],
                  self.variable,
                  false
                );
              self.parametricFnX = arr[0];
              if (!self.expandedParametricFnX) {
                //alert(`Failed to successfully expand ${arr[0]}`);
                Utility.displayErrorMessage(
                  mf,
                  `Failed to successfully expand ${arr[0]}`
                );
                Utility.progressWait2(false);
                return;
              }
              self.expandedParametricFnY =
                await doExpandDefinesAndAdjustLogBase(
                  arr[1],
                  self.variable,
                  false
                );
              self.parametricFnY = arr[1];
              if (!self.expandedParametricFnY) {
                //alert(`Failed to successfully expand ${arr[1]}`);
                Utility.displayErrorMessage(
                  mf,
                  `Failed to successfully expand ${arr[1]}`
                );
                Utility.progressWait2(false);
                return;
              }
            } catch (error) {
              console.log(error);
              return;
            }
          } ///////////////////////c

          if (!self.threeD) {
            if (self.expandedFn) {
              if (/Infinity/.test(self.expandedFn)) {
                //Utility.alert("Invalid function. Probably yields infinity.");
                Utility.displayErrorMessage(
                  mf,
                  `Invalid function. Probably yields infinity.`
                );
                Utility.progressWait2(false);
                return false;
              }
              self.coeffs = getCoeffs(self.expandedFn);
              if (self.coeffs.length > 5) {
                // Utility.alert(
                //   "Number of unknown coefficient cannot be greater than 5."
                // );
                Utility.displayErrorMessage(
                  mf,
                  `Number of unknown coefficient cannot be greater than 5.`
                );
                $("#cont_variable").show();
                Utility.progressWait2(false);
                return false;
              }
            } else if (
              self.expandedParametricFnX &&
              self.expandedParametricFnY
            ) {
              $("#cont_parametric_variable").show();
              //self.parametric_variable = $("#fnDlg_parametric_variable").val();
              // self.coeffs = getCoeffs(
              //   (
              //     self.expandedParametricFnX + self.expandedParametricFnY
              //   ).replaceAll(self.parametric_variable, "")
              // );
              self.coeffs = getCoeffs(
                self.expandedParametricFnX + self.expandedParametricFnY,
                self.parametric_variable
              );

              if (self.coeffs.length > 5) {
                // Utility.alert(
                //   "Number of unknown coefficient cannot be greater than 5."
                // );
                Utility.displayErrorMessage(
                  mf,
                  `Number of unknown coefficient cannot be greater than 5.`
                );
                $("#cont_variable").show();
                Utility.progressWait2(false);
                return false;
              }
            }
          }

          if (domainRangeRestriction.length) {
            const arr_0 = await plot.defines.expandDefines(
              domainRangeRestriction[0]
            );
            const arr_1 = await plot.defines.expandDefines(
              domainRangeRestriction[1]
            );
            handleCoeffs(arr_0);
            handleCoeffs(arr_1);
          }

          function replaceParameterWith_1(str) {
            if (self.coeffs == undefined || self.coeffs.length == 0) return str;
            let s = Utility.purgeAndMarkKeywords(str);
            for (let i = 0; i < self.coeffs.length; i++) {
              if (s.indexOf(self.coeffs[i]) != -1) {
                s = s.replaceAll(self.coeffs[i], `(1)`);
              }
            }
            return Utility.replaceKeywordMarkers(s);
          }

          try {
            self.lowerLimit = $("#fnDlg_lowerLimit")[0].getValue("ascii-math");
            const lw = await plot.defines.expandDefines(
              self.lowerLimit,
              self.variable
            );
            self.lowerLimit = math.evaluate(replaceParameterWith_1(lw));
            if (self.lowerLimit == undefined) {
              Utility.alert("Please enter a valid lower(x) limit.");
              $("#settingsButton").click();
              Utility.progressWait2(false);
              return false;
            }
            var lower = Math.abs(self.lowerLimit);
            if (self.lowerLimit > 0 && lower < Math.cbrt(Static._eps)) {
              Utility.alert(
                `Absolute value of lower(x) limit must not be less than ${Math.cbrt(
                  Static._eps
                )}.`
              );
              Utility.progressWait2(false);
              return false;
            }
          } catch (err) {
            Utility.alert("Please enter a valid lower(x) limit.");
            $("#settingsButton").click();
            Utility.progressWait2(false);
            return false;
          }

          try {
            self.upperLimit = $("#fnDlg_upperLimit")[0].getValue("ascii-math");
            const ul = await plot.defines.expandDefines(
              self.upperLimit,
              self.variable
            );
            self.upperLimit = math.evaluate(replaceParameterWith_1(ul));
            if (self.upperLimit == undefined) {
              Utility.alert("Please enter a valid upper(x) limit.");
              $("#settingsButton").click();
              Utility.progressWait2(false);
              return false;
            }
            // var upper = Math.abs(self.upperLimit);
            // if (self.upperLimit > 0 && upper < Math.cbrt(Static._eps)) {
            //   Utility.alert(
            //     `Absolute value of upper(x) limit must not be less than ${Math.cbrt(
            //       Static._eps
            //     )}.`
            //   );
            //   return false;
            // }
          } catch (err) {
            Utility.alert("Please enter a valid upper(x) limit.");
            $("#settingsButton").click();
            Utility.progressWait2(false);
            return false;
            //}
          }

          if (!validateLimits(self.lowerLimit, self.upperLimit)) {
            $("#settingsButton").click();
            Utility.progressWait2(false);
            return false;
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
            ) {
              $("#settingsButton").click();
              Utility.progressWait2(false);
              return false;
            }
            self.unboundedRange = $("#fnDlg_unboundedRange")[0].checked;
          } else {
            //do 3d initialization
            self.variableY = $("#fnDlg_variableY").val();
            let m_uniqChars = uniqueChars(self.expandedFn).join("");
            m_uniqChars = m_uniqChars
              .replace(self.variableY, "")
              .replace(self.variable, "");
            if (m_uniqChars.length) {
              if (m_uniqChars.length == 1)
                //alert(`Undefined symbol "${m_uniqChars}"`);
                Utility.displayErrorMessage(
                  mf,
                  `Undefined symbol "${m_uniqChars}"`
                );
              //alert(`Undefined symbols "${m_uniqChars}"`);
              else
                Utility.displayErrorMessage(
                  mf,
                  `Undefined symbols "${m_uniqChars}"`
                );
              Utility.progressWait2(false);
              return;
            }

            self.threeDType = $("#threeDType").val();
            if (self.threeDType === "spectrogram") {
              self.threeDInterpolationType = $("#interpolationType").val();
            }
            try {
              self.lowerLimitY =
                $("#fnDlg_lowerLimitY")[0].getValue("ascii-math");
              self.lowerLimitY = math.evaluate(self.lowerLimitY);
            } catch (err) {
              Utility.alert("Please enter a valid lower(y) limit.");
              $("#settingsButton").click();
              return false;
            }
            try {
              self.upperLimitY =
                $("#fnDlg_upperLimitY")[0].getValue("ascii-math");
              self.upperLimitY = math.evaluate(self.upperLimitY);
            } catch (err) {
              Utility.alert("Please enter a valid upper(y) limit.");
              $("#settingsButton").click();
              return false;
            }
            try {
              self.lowerLimitFxy = $("#fnDlg_lowerLimitFxy")[0].getValue(
                "ascii-math"
              );
              self.lowerLimitFxy = math.evaluate(self.lowerLimitFxy);
            } catch (err) {
              Utility.alert("Please enter a valid lower(f(xy)) limit.");
              $("#settingsButton").click();
              return false;
            }
            try {
              self.upperLimitFxy = $("#fnDlg_upperLimitFxy")[0].getValue(
                "ascii-math"
              );
              self.upperLimitFxy = math.evaluate(self.upperLimitFxy);
            } catch (err) {
              Utility.alert("Please enter a valid upper(f(xy)) limit.");
              $("#settingsButton").click();
              return false;
            }
            self.variableY = $("#fnDlg_variableY").val();
            self.color1 = $("#fnDlg_color1").val();
            self.color2 = $("#fnDlg_color2").val();
          }
          //console.time("timer");
          let _newCurve = null;
          try {
            _newCurve = await cb();
            Utility.progressWait2(false);
          } catch (error) {
            console.log(error);
            Utility.progressWait2(false);
            return false;
          }

          //console.timeEnd("timer");
          ///Determine if a negative Root curve is required and add it
          if (
            _newCurve &&
            _newCurve.rtti === PlotItem.RttiValues.Rtti_PlotCurve &&
            _newCurve.data().size()
          ) {
            const fn = negativeRootFn();
            if (Static.negativeRoot && fn && fn.length) {
              Static.g_solution_arr = null;
              const title = self.title;
              for (let i = 0; i < fn.length; i++) {
                self.fn = self.expandedFn = fn[i];
                self.title = i + "~" + title;
                cb();
              }
            }
            const degOfPoly = nerdamer.deg(variablePlus).toString();
            if (
              domainGap_lower.length > 1 &&
              domainGap_upper.length > 1 &&
              degOfPoly /* &&
              parseFloat(degOfPoly) % 2 == 0 */
            ) {
              //$$ x^2\{2\le x^2\le10\} $$
              //console.log(456);
              let l_lmt = domainGap_lower[1];
              let u_lmt = domainGap_upper[1];
              let scope = new Map();
              scope.set(self.variable, 1);
              try {
                self.lowerLimit = math.evaluate(l_lmt, scope);
                self.upperLimit = math.evaluate(u_lmt, scope);
              } catch (error) {
                console.log(error);
              }

              if (self.lowerLimit > self.upperLimit) {
                let temp = u_lmt;
                u_lmt = l_lmt;
                l_lmt = temp;
                temp = self.upperLimit;
                self.upperLimit = self.lowerLimit;
                self.lowerLimit = temp;
              }
              self.domainRangeRestriction = [l_lmt, u_lmt];

              if (parseFloat(self.lowerLimit) > parseFloat(self.upperLimit)) {
                const temp = self.lowerLimit;
                domainRangeRestriction[0] = self.upperLimit;
                self.upperLimit = temp;
              }

              $("#fnDlg_lowerLimit")[0].setValue(
                Utility.toLatex(self.lowerLimit + ""),
                { suppressChangeNotifications: true }
              );
              $("#fnDlg_upperLimit")[0].setValue(
                Utility.toLatex(self.upperLimit + ""),
                { suppressChangeNotifications: true }
              );
              self.title = "dmn-" + self.title;
              cb();
            }
          }

          if (Static.g_solution_arr) {
            for (let i = 1; i < Static.g_solution_arr.length; i++) {
              const m_fn = Static.g_solution_arr[i].toString();
              if (m_fn.indexOf("|") !== -1 || m_fn.indexOf("i") !== -1) {
                continue;
              }
              self.expandedFn = self.fn = m_fn;
              self.title = Utility.generateCurveName(plot);
              let _newCurve2 = null;
              try {
                _newCurve2 = cb();
              } catch (error) {
                Utility.progressWait2(false);
                return false;
              }
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
        Utility.progressWait2(false);
        return true;
      };

      $("#fnDlg_function")
        .off("input")
        .on("input", function () {
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

    this.functionDlg = async function (curveName) {
      if (Static.imagePath != "images/") {
        try {
          let res = await mode(Replacement.config.angles);
          // console.log(res);
        } catch (error) {
          console.log(error);
        }
      }
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

    this.close = function () {
      $("#fnDlg_cancel").click();
      //m_dlg1.detach();
    };

    function handleCoeffs(str) {
      if (!str) return null;

      let s = Utility.purgeAndMarkKeywords(str);
      for (let index = 0; index < s.length; index++) {
        if (Utility.isAlpha(s[index]) && !plot.defines.hasDefine(s[index])) {
          if (self.coeffs.indexOf(s[index]) == -1) {
            self.coeffs.push(s[index]);
          }
        }
      }
      s = Utility.replaceKeywordMarkers(s);
      return s;
    }
  }
}
