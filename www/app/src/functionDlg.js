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

    $('input[name="math_mode"]').on("change", function () {
      Replacement.config.angles = $(this).val();
      $("#fnDlg_ok").trigger("focus");
    });

    $("#fnDlg_variable").on("input", function () {
      const mf = $("#fnDlg_function")[0];
      let fnDlgFunctionVal = mf.getValue("ascii-math");
      if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
        $(".limit_x").html($(this).val());
      }
    });

    $("#fnDlg_variable").on("keydown", function (e) {
      if (e.keyCode == 13) {
        $("#fnDlg_ok").trigger("focus");
      }
    });

    $("#fnDlg_parametric_variable").on("keydown", function (e) {
      if (e.keyCode == 13) {
        $("#fnDlg_ok").trigger("focus");
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
        return true;
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
      $("#functionModal").on("shown.bs.modal", function () {
        $("#fnDlg_ok").trigger("focus");
      });

      $("#functionModal").on("hidden.bs.modal", function () {
        $("#executeButton").trigger("focus");
      });

      $("#fnDlg_numberOfPoints,#fnDlg_color1,#fnDlg_color2").on(
        "change",
        (e) => {
          $("#fnDlg_ok").trigger("focus");
        }
      );

      const els = document.getElementsByClassName("math-field-limits-enter");
      for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("beforeinput", (e) => {
          if (e.inputType === "insertLineBreak") {
            e.preventDefault();
            $("#fnDlg_ok").click();
          }
        });
      }

      /* $("#fnDlg_lowerLimit")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      });
      $("#fnDlg_upperLimit")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      });
      $("#fnDlg_lowerLimitY")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      });
      $("#fnDlg_upperLimitY")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      });
      $("#fnDlg_lowerLimitFxy")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      });
      $("#fnDlg_upperLimitFxy")[0].addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertLineBreak") {
          e.preventDefault();
          $("#fnDlg_ok").click();
        }
      }); */

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
        let noNegativeRoot = false;
        //return fn;
        if (!self.expandedFn || $.isNumeric(self.expandedFn)) return fn;
        /* let degOfPoly;
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
        } */
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
              const denom = fr.args[1].value;
              if (denom % 2 == 0) {
                return true;
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

        // filtered = filtered.concat(
        //   node.filter(function (node) {
        //     return node.fn && node.fn.name === "sqrt";
        //   })
        // );

        /* filtered = filtered.concat(
          node.filter(function (node) {
            if (node.fn === "sqrt") {
              return true;
            }
            if (node.fn === "pow") {
              const val = node.args[1].value;
              if ($.isNumeric(val) && val < 1) {
                const fr = math.simplify(
                  `${val}`,
                  {},
                  { exactFractions: true }
                );
                const denom = fr.args[1].value;
                if (denom % 2 == 0) {
                  return true;
                }
                //console.log(fr);
              }
            }
            return false;
          })
        ); */

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

      this.doEnter = function (fnDlgFunctionVal, closeDlg) {
        const ind = Utility.isValidCharInExpression(fnDlgFunctionVal);
        if (ind != -1) {
          const mf = $("#fnDlg_function")[0];
          Utility.displayErrorMessage(
            mf,
            `Invalid chararacter, "${fnDlgFunctionVal[ind]}", at position ${
              ind + 1
            }.`
          );
          return;
        }
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

        function forceDefine(fn, dec) {
          fn = fn.replaceAll(dec, "U");
          const arr = fn.split("=");
          if (arr.length !== 2) {
            return false; //failed to force definition
          }

          const expandedRHS = plot.defines.expandDefines(
            arr[1],
            self.variable,
            false
          );
          if (!expandedRHS) return null;
          const expandedLHS = plot.defines.expandDefines(
            arr[0],
            self.variable,
            false
          );
          if (!expandedLHS) return null;
          fn = `${expandedLHS}=${expandedRHS}`;
          fn = `${expandedLHS}=${expandedRHS}`;
          fn = Utility.insertProductSign(fn, plot.defines);

          let res = null;
          //fn = fn.replaceAll(dec, "U");

          if (expandedLHS == "U") {
            res = expandedRHS;
          }

          if (expandedRHS == "U") {
            res = expandedLHS;
          }

          if (!res) {
            var eq = nerdamer(fn);
            var solution = eq.solveFor("U");
            if (typeof solution === "array" && solution[0]) {
              res = solution[0].toString();
            } else {
              res = solution.toString();
            }
            nerdamer.clear("all");
            nerdamer.flush();
          }
          if (res) {
            //res = `U=${res}`;
            //console.log(res);
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
              return false; //failed to force definition
            }
            if (plot.defines.getDefine(dec)) {
              alert(
                `You are attempting to re-define ${dec}. Redefinition is not permitted.`
              );
              return;
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
              // alert(
              //   `Failed to retrieve a valid define, ${s}, for expanding ${fnDlgFunctionVal}.`
              // );

              Utility.displayErrorMessage(
                mf,
                `Failed to retrieve a valid define, ${s}, for expanding ${fnDlgFunctionVal}.`
              );
              return;
            }
          }

          if (!fnDlgFunctionVal) {
            alert("Invalid entry");
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
            if (
              variablePlus.indexOf(self.variable) == -1 &&
              variablePlus.indexOf(self.parametric_variable) == -1
            ) {
              Utility.displayErrorMessage(
                mf,
                `The domain, ${domainRangeRestriction}, is improperly declared.`
              );
              return false;
            }

            variable = self.variable;

            if (Utility.isParametricFunction(fnDlgFunctionVal)) {
              variable = self.parametric_variable;
            }

            variablePlusExpanded = plot.defines.expandDefines(
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
            function handleDomain() {
              // if(variablePlus && variablePlus.length==1){
              //   return;
              // }
              domainRangeRestriction = domainRangeRestriction.replace(
                variablePlus,
                "~"
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
                return false;
              }

              if (variablePlusExpanded && variablePlusExpanded.length > 1) {
                let eq = nerdamer(
                  `${variablePlusExpanded}=${domainRangeRestriction[0]}`
                );
                let solution = eq.solveFor(variable);
                let sol;
                console.log(solution);
                if (typeof solution === "object" && solution[0]) {
                  for (let i = 0; i < solution.length; i++) {
                    sol = math
                      .simplify(solution[i].toString().replaceAll("abs", ""))
                      .toString();
                    if ($.isNumeric(sol)) {
                      domainGap_lower.push(sol);
                    }
                  }
                } else {
                  sol = solution.toString().replaceAll("abs", "");
                  if ($.isNumeric(sol)) {
                    domainGap_lower.push(sol);
                  }
                }
                nerdamer.clear("all");
                nerdamer.flush();
                //domainRangeRestriction[0] = sol;

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

                eq = nerdamer(
                  `${variablePlusExpanded}=${domainRangeRestriction[1]}`
                );
                console.log(eq.toString());
                solution = eq.solveFor(variable);
                sol;
                console.log(solution);
                if (typeof solution === "object" && solution[0]) {
                  for (let i = 0; i < solution.length; i++) {
                    sol = math
                      .simplify(solution[i].toString().replaceAll("abs", ""))
                      .toString();
                    if ($.isNumeric(sol)) {
                      domainGap_upper.push(sol);
                    }
                  }
                } else {
                  sol = solution.toString().replaceAll("abs", "");
                  if ($.isNumeric(sol)) {
                    domainGap_upper.push(sol);
                  }
                }
                nerdamer.clear("all");
                nerdamer.flush();
                //domainRangeRestriction[1] = sol;
              }

              if (domainGap_lower.length == 1 && domainGap_upper.length == 1) {
                domainRangeRestriction = [
                  domainGap_lower[0],
                  domainGap_upper[0],
                ];
              }

              if (domainGap_lower.length == 2 && domainGap_upper.length == 2) {
                domainRangeRestriction = [
                  domainGap_lower[0],
                  domainGap_upper[0],
                ];
              }

              if (domainGap_lower.length == 0 && domainGap_upper.length == 2) {
                let l = parseFloat(domainGap_upper[0]);
                let u = parseFloat(domainGap_upper[1]);

                if (l > u) {
                  const temp = u;
                  u = l;
                  l = temp;
                }
                domainRangeRestriction = [l + "", u + ""];
              }

              if (domainGap_lower.length == 2 && domainGap_upper.length == 0) {
                let l = parseFloat(domainGap_lower[0]);
                let u = parseFloat(domainGap_lower[1]);

                if (l > u) {
                  const temp = u;
                  u = l;
                  l = temp;
                }
                domainRangeRestriction = [l + "", u + ""];
              }

              if (domainGap_lower.length == 1 && domainGap_upper.length == 2) {
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

              if (domainGap_lower.length == 2 && domainGap_upper.length == 1) {
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
              domainRangeRestriction[0] = plot.defines.expandDefines(
                domainRangeRestriction[0],
                self.variable,
                true
              );
              domainRangeRestriction[0] = handleCoeffs(
                domainRangeRestriction[0]
              );

              if (!domainRangeRestriction[0]) {
                Utility.displayErrorMessage(
                  mf,
                  `Unable to resolve lower limit, ${dmLimit}, within the declared domain.`
                );
                return false;
              }
              dmLimit = domainRangeRestriction[1];
              domainRangeRestriction[1] = plot.defines.expandDefines(
                domainRangeRestriction[1],
                self.variable,
                true
              );
              domainRangeRestriction[1] = handleCoeffs(
                domainRangeRestriction[1]
              );

              if (!domainRangeRestriction[1]) {
                Utility.displayErrorMessage(
                  mf,
                  `Unable to resolve upper limit, ${dmLimit}, within the declared domain.`
                );
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
                return;
              } ///
            }

            if (!Utility.isParametricFunction(fnDlgFunctionVal)) {
              if (variablePlus.indexOf(self.variable) == -1) {
                Utility.displayErrorMessage(
                  mf,
                  `Improperly declared domain. Expected "${self.variable}" as the variable.`
                );
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
                return false;
              }
            } else {
              if (variablePlus.indexOf(self.parametric_variable) == -1) {
                Utility.displayErrorMessage(
                  mf,
                  `Improperly declared domain. Expected "${self.parametric_variable}" as the variable.`
                );
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
                return false;
              }
              /*domainRangeRestriction = domainRangeRestriction.replace(
                //self.parametric_variable,
                variablePlus,
                "~"
              );
              domainRangeRestriction = domainRangeRestriction.split("~");
              if (domainRangeRestriction.length != 2) {
                // Utility.alert(
                //   `Improperly declared domain. Expected "${self.parametric_variable}" as the variable.`
                // );

                Utility.displayErrorMessage(
                  mf,
                  `Improperly declared domain. Expected "${self.parametric_variable}" as the variable.`
                );
                return false;
              }
              domainRangeRestriction[0] = plot.defines.expandDefines(
                domainRangeRestriction[0],
                self.parametric_variable,
                true
              );
              domainRangeRestriction[1] = plot.defines.expandDefines(
                domainRangeRestriction[1],
                self.parametric_variable,
                true
              );
              if (
                parseFloat(domainRangeRestriction[0]) >=
                parseFloat(domainRangeRestriction[1])
              ) {
                Utility.displayErrorMessage(
                  mf,
                  `Upper limit must be greater than Lower limit.`
                );
                return;
              }*/
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
          // for (let i = 0; i < arr.length; i++) {
          //   try {
          //     math.parse(arr[i]);
          //   } catch (error) {
          //     Utility.displayErrorMessage(mf, error.message);
          //     return;
          //   }
          // }

          if (
            arr.length == 2 &&
            fnDlgFunctionVal.indexOf("y") !== -1 &&
            self.variable !== "y"
          ) {
            const lhs = plot.defines.expandDefines(arr[0], self.variable, true);
            if (!Utility.isValidExpression(lhs, "y")) {
              Utility.displayErrorMessage(
                mf,
                `Degree of polynomial in "y" greater than 3 not yet supported - "${lhs}".`
              );
              return;
            }
            if (!lhs) {
              // alert(
              //   `Failed to retrieve a valid define for expanding "${arr[0]}".`
              // );
              Utility.displayErrorMessage(
                mf,
                `Failed to retrieve a valid define for expanding "${arr[0]}".`
              );
              return;
            }
            const rhs = plot.defines.expandDefines(arr[1], self.variable, true);
            if (!Utility.isValidExpression(rhs, "y")) {
              Utility.displayErrorMessage(
                mf,
                `Degree of polynomial in "y" greater than 3 not yet supported - "${rhs}".`
              );
              return;
            }
            if (!rhs) {
              // alert(
              //   `Failed to retrieve a valid define for expanding "${arr[1]}".`
              // );
              Utility.displayErrorMessage(
                mf,
                `Failed to retrieve a valid define for expanding "${arr[1]}".`
              );
              return;
            }
            fnDlgFunctionVal = `${lhs}=${rhs}`;
            let res = math.simplify(`-1*(${lhs}-(${rhs}))`).toString();
            if (res.indexOf("y") == -1) {
              // alert(
              //   `The equation, ${fnDlgFunctionVal}, simplifies 0*y=${res}. This leads to the invalid divide-by-zero.`
              // );
              Utility.displayErrorMessage(
                mf,
                `The equation, ${fnDlgFunctionVal}, simplifies 0*y=${res}. This leads to the invalid divide-by-zero.`
              );
              return;
            }

            let eq = nerdamer(fnDlgFunctionVal);
            let solution = eq.solveFor("y");
            //console.log(solution);
            if (typeof solution === "object" && solution[0]) {
              //arr = ["y", solution[0].toString()];
              arr = ["y", solution[0].toString().replaceAll("abs", "")];
            } else {
              arr = ["y", solution.toString().replaceAll("abs", "")];
              //arr = ["y", solution.toString()];
            }
            nerdamer.clear("all");
            nerdamer.flush();
            fnDlgFunctionVal = `y=${arr[1]}`;
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
              return;
            }

            if (arr.length > 1) {
              try {
                math.parse(arr[1]);
              } catch (error) {
                Utility.displayErrorMessage(mf, error.message);
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
                    return;
                  }

                  if (forceDefine(fnDlgFunctionVal, m_rhs_fnDec)) {
                    // alert(`Tried but failed to define "${m_rhs_fnDec}".`);
                    // return;

                    forceDefined = true;
                    fnDlgFunctionVal = m_rhs = m_rhs_fnDec;
                    arr = [m_rhs];
                  }
                }
              }
              m_rhs_fnDec = Utility.getFullDerivativeDeclaration(m_rhs);
              if (m_rhs_fnDec) {
                const _dec = Utility.getFunctionDeclaration(m_rhs);
                if (_dec) {
                  m_rhs = m_rhs.replaceAll(_dec, "U");
                }
                m_rhs = plot.defines.expandDefines(m_rhs, self.variable, true);
                if (_dec) {
                  m_rhs = m_rhs.replaceAll("U", _dec);
                }
                if (!m_rhs) {
                  //alert(`Tried but failed to define "${m_rhs_fnDec}".`);
                  Utility.displayErrorMessage(
                    mf,
                    `Tried but failed to define "${m_rhs_fnDec}".`
                  );
                  return;
                }
                arr[1] = m_rhs;
              }

              if (!forceDefined) {
                let m_lhs_fnDec = Utility.getFunctionDeclaration(m_lhs);
                if (m_lhs_fnDec) {
                  if (!plot.defines.getDefine(m_lhs_fnDec)) {
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
                      return;
                    }

                    if (forceDefine(fnDlgFunctionVal, m_lhs_fnDec)) {
                      fnDlgFunctionVal = m_lhs = m_lhs_fnDec;
                      arr = [m_lhs];
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
                      return;
                    }
                  }
                }
                m_lhs_fnDec = Utility.getFullDerivativeDeclaration(m_lhs);
                if (m_lhs_fnDec) {
                  const _dec = Utility.getFunctionDeclaration(m_rhs);
                  if (_dec) {
                    m_lhs = m_lhs.replaceAll(_dec, "U");
                  }
                  m_lhs = plot.defines.expandDefines(
                    m_lhs,
                    self.variable,
                    true
                  );
                  if (_dec) {
                    m_lhs = m_lhs.replaceAll("U", _dec);
                  }
                  if (!_dec) {
                    m_lhs = plot.defines.expandDefines(
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
                    return;
                  }
                  arr[0] = m_lhs;
                }
              }
              if (m_lhs !== "0" && fnDlgFunctionVal !== m_lhs) {
                m_lhs = doExpandDefinesAndAdjustLogBase(
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
                  return;
                }
              }

              //let m_rhs = Utility.insertProductSign(arr[1], plot.defines);
              m_rhs = arr[1];
              if (arr.length == 2) {
                m_rhs = doExpandDefinesAndAdjustLogBase(
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
                  return;
                }

                //fnDlgFunctionVal = `${m_lhs}=${m_rhs}`;
                //arr = fnDlgFunctionVal.split("=");
              }

              //console.log("Implicit");
              // fnDlgFunctionVal = Utility.insertProductSign(
              //   fnDlgFunctionVal,
              //   plot.defines
              // );
              if (arr.length == 2) {
                let dec = Utility.getFunctionDeclaration(arr[0]);
                if (!dec) {
                  dec = Utility.getFunctionDeclaration(arr[1]);
                }
                if (dec) {
                  fnDlgFunctionVal = `${arr[0]}=${arr[1]}`;
                  fnDlgFunctionVal = fnDlgFunctionVal.replaceAll(dec, "U");
                  var eq = nerdamer(fnDlgFunctionVal);
                  var solution = eq.solveFor("U");
                  if (typeof solution === "object" && solution[0]) {
                    arr = [solution[0].toString()];
                  } else {
                    arr = [solution.toString()];
                  }
                  nerdamer.clear("all");
                  nerdamer.flush();
                  fnDlgFunctionVal = arr[0];
                  if (plot.defines.getDefine(dec)) {
                    // alert(
                    //   `You are attempting to re-define ${dec}. Redefinition is not permitted.`
                    // );
                    Utility.displayErrorMessage(
                      mf,
                      `You are attempting to re-define ${dec}. Redefinition is not permitted.`
                    );
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
                    return;
                  }
                  if (m_lhs.length == 1) {
                    arr = [m_rhs];
                  } else {
                    var eq = nerdamer(fnDlgFunctionVal);
                    var solution =
                      self.variable == "y"
                        ? eq.solveFor("x")
                        : eq.solveFor("y");
                    if (typeof solution === "object" && solution[0]) {
                      arr = [solution[0].toString()];
                    } else {
                      arr = [solution.toString()];
                    }
                    nerdamer.clear("all");
                    nerdamer.flush();
                  }
                  fnDlgFunctionVal = arr[0];
                }
              }
            }
          }
          if (arr.length == 2) {
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
                return false;
              }
              let errorType = plot.defines.validateDefineName(arr[0]).errorType;
              if (errorType == Defines.DefineError.start) {
                alert(
                  'Define name,"' +
                    arr[0] +
                    '", must start with alpha character.'
                );
                return false;
              }
              if (errorType == Defines.DefineError.contain) {
                if (arr[1].indexOf("y") == -1) {
                  alert(
                    'Define name,"' +
                      arr[0] +
                      '", contains, or is part of, the earlier define.'
                  );
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
                return false;
              }
              if (errorType != Defines.DefineError.noError) {
                alert(`An error exist within the defines.`);
                return false;
              }

              ///////////////
              let m_arr = fnDlgFunctionVal.split("=");
              if (m_arr.length == 2 && m_arr[1].indexOf("y") !== -1) {
                m_arr[0] = doExpandDefinesAndAdjustLogBase(
                  m_arr[0],
                  self.variable
                );
                var eq = nerdamer(`${m_arr[0]}=${m_arr[1]}`);
                var solution =
                  self.variable == "y" ? eq.solveFor("x") : eq.solveFor("y");
                if (typeof solution === "object" && solution[0]) {
                  arr[0] = "y";
                  arr[1] = solution[0].toString();
                } else {
                  arr[0] = "y";
                  arr[1] = solution.toString();
                }
                nerdamer.clear("all");
                nerdamer.flush();

                fnDlgFunctionVal = arr[1];
              }
              ////////////////
              //let m_rhs = Utility.insertProductSign(arr[1], plot.defines);
              fnDlgFunctionVal = doExpandDefinesAndAdjustLogBase(
                arr[1],
                self.variable
              );
              if (!fnDlgFunctionVal) {
                //alert(`Failed to successfully expand ${arr[1]}`);
                Utility.displayErrorMessage(
                  mf,
                  `Failed to successfully expand ${arr[1]}`
                );
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
              //console.time("timer");
              self.expandedFn =
                self.fn =
                fnDlgFunctionVal =
                  plot.defines.expandDefines(
                    fnDlgFunctionVal,
                    self.variable,
                    false
                  );
              //console.timeEnd("timer");
              if (!self.expandedFn) {
                return;
              }
              if (typeof self.expandedFn == "object") {
                console.log("do relation");
                const relationFn = self.expandedFn.fn;
                self.expandedFn = self.fn = fnDlgFunctionVal = null;

                const { lowerLimit, upperLimit, numOfPoints, variable } = self;

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

                return;
              }
            } else {
              self.expandedFn = self.fn = plot.defines.expandDefines(
                fnDlgFunctionVal,
                self.variable
              );
              if (!self.expandedFn) {
                // alert(
                //   `Failed to retrieve a valid define, ${dec}, for expanding "${fnDlgFunctionVal}".`
                // );
                Utility.displayErrorMessage(
                  mf,
                  `Failed to retrieve a valid define, ${dec}, for expanding "${fnDlgFunctionVal}".`
                );
                return;
              }
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
                //alert(`Failed to successfully expand ${fnDlgFunctionVal}`);
                Utility.displayErrorMessage(
                  mf,
                  `Failed to successfully expand ${fnDlgFunctionVal}`
                );
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
                return;
              }
            }
          } else {
            //Parametric function
            self.expandedFn = null;
            const obj = Utility.splitParametricFunction(fnDlgFunctionVal);
            if (!obj) {
              //alert("Improperrly defined parametric function.");
              Utility.displayErrorMessage(
                mf,
                `Improperrly defined parametric function.`
              );
              return;
            }
            let arr = [obj.operand, obj.base];
            self.expandedParametricFnX = doExpandDefinesAndAdjustLogBase(
              arr[0],
              self.variable,
              false
            );
            if (!self.expandedParametricFnX) {
              //alert(`Failed to successfully expand ${arr[0]}`);
              Utility.displayErrorMessage(
                mf,
                `Failed to successfully expand ${arr[0]}`
              );
              return;
            }
            self.expandedParametricFnY = doExpandDefinesAndAdjustLogBase(
              arr[1],
              self.variable,
              false
            );
            if (!self.expandedParametricFnY) {
              //alert(`Failed to successfully expand ${arr[1]}`);
              Utility.displayErrorMessage(
                mf,
                `Failed to successfully expand ${arr[1]}`
              );
              return;
            }
          }

          if (!self.threeD) {
            if (self.expandedFn) {
              if (/Infinity/.test(self.expandedFn)) {
                //Utility.alert("Invalid function. Probably yields infinity.");
                Utility.displayErrorMessage(
                  mf,
                  `Invalid function. Probably yields infinity.`
                );
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
                return false;
              }
            }
          }

          if (domainRangeRestriction.length) {
            handleCoeffs(domainRangeRestriction[0]);
            handleCoeffs(domainRangeRestriction[1]);

            // s = Utility.purgeAndMarkKeywords(domainRangeRestriction[1]);
            // for (let index = 0; index < s.length; index++) {
            //   if (
            //     Utility.isAlpha(s[index]) &&
            //     !plot.defines.hasDefine(s[index])
            //   ) {
            //     if (self.coeffs.indexOf(s[index]) == -1) {
            //       self.coeffs.push(s[index]);
            //     }
            //   }
            // }
            // domainRangeRestriction[1] = Utility.replaceKeywordMarkers(s);

            //console.log(domainRangeRestriction[0], domainRangeRestriction[1]);
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
            //handleCoeffs(self.lowerLimit);
            self.lowerLimit = math.evaluate(
              replaceParameterWith_1(
                plot.defines.expandDefines(self.lowerLimit, self.variable)
              )
            );
            if (self.lowerLimit == undefined) {
              Utility.alert("Please enter a valid lower(x) limit.");
              $("#settingsButton").click();
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
            $("#settingsButton").click();
            return false;
          }

          try {
            self.upperLimit = $("#fnDlg_upperLimit")[0].getValue("ascii-math");
            //handleCoeffs(self.upperLimit);
            self.upperLimit = math.evaluate(
              replaceParameterWith_1(
                plot.defines.expandDefines(self.upperLimit, self.variable)
              )
            );
            if (self.upperLimit == undefined) {
              Utility.alert("Please enter a valid upper(x) limit.");
              $("#settingsButton").click();
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
            $("#settingsButton").click();
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
            ) {
              $("#settingsButton").click();
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
              return;
            }

            self.threeDType = $("#threeDType").val();
            if (self.threeDType === "spectrogram") {
              self.threeDInterpolationType = $("#interpolationType").val();
            }
            try {
              self.lowerLimitY =
                $("#fnDlg_lowerLimitY")[0].getValue("ascii-math");
              //handleCoeffs(self.lowerLimitY);
              self.lowerLimitY = math.evaluate(self.lowerLimitY);
            } catch (err) {
              Utility.alert("Please enter a valid lower(y) limit.");
              $("#settingsButton").click();
              return false;
            }
            try {
              self.upperLimitY =
                $("#fnDlg_upperLimitY")[0].getValue("ascii-math");
              //handleCoeffs(self.upperLimitY);
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
              //handleCoeffs(self.lowerLimitFxy);
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
              //handleCoeffs(self.upperLimitFxy);
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
          const _newCurve = cb();
          //console.timeEnd("timer");
          ///Determine if a negative Root curve is required and add it
          if (
            _newCurve &&
            _newCurve.rtti === PlotItem.RttiValues.Rtti_PlotCurve &&
            _newCurve.data().size()
          ) {
            const fn = negativeRootFn();
            if (Static.negativeRoot && fn) {
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
              self.lowerLimit = math.evaluate(l_lmt, scope);
              self.upperLimit = math.evaluate(u_lmt, scope);
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

    // m_dlg1.on("hidden.bs.modal", function () {
    //   //m_dlg1.detach();
    // });

    this.close = function () {
      $("#fnDlg_cancel").click();
      //m_dlg1.detach();
    };

    function handleCoeffs(str) {
      if (!str) return null;
      //if (!self.coeffs) self.coeffs = [];
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
