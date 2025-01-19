"use strict";

require([
  // "mathsteps-master/math-steps",
  "enumerator",
  "curveLegendAttributeDlg",
  "regression",
  "functionDlg",
  "curveFitDlg",
  "curveStyleDlg",
  "axisDlg",
  "zoneDlg",
  "pointEntryDlg",
  "mtoolBar",
  "file",
  "watch",
  "basicWatch",
  "legendMenu",
  "rulers",
  "infoSidebar",
  "infoPropertiesPane",
  "plotSideBar",
  "curvePropertiesPane",
  "plotPropertiesPane",
  "myPlot",
  "myCurve",
  "plotSpectroCurve",
  "plotRasterItem",
  "plotSpectrogram",
  "rasterFileData",
  "rasterFunctionData",
  "pointData",
  "symbol",
  "legend",
  "magnifier",
  "plotGrid",
  "widgetOverlay",
  "myZoomer",
  "curveFitter",
  "spline",
  "panner",
  "plotMarker",
  "curveClosestPoint",
  "curveSelector",
  "curveShapeItem",
  "underscore",
  "widgetOverlay",
  "functionData",
  "watches",
  "addRemovePointPicker",
  "markerDlg",
  "defines",
  "canvas",
  "fontPicker",
  "plotZoneItem",
  "trash",
  "transformation",
], function () {
  //console.log(456, test);
  ////////////
  //var plot = new Plot($("#plotDiv"), "Plot");

  //We call these two methods early so that the entire application is properly informed.
  Enumerator.noThrowOnEnumRedefinition();
  Enumerator.setDefaultEnumNampespace("Enum");

  // // Utility.alert('This application is design to run in \"chrome browser\". While it may run in other browsers, some features may not behave as expected.', "small");

  var plot = new MyPlot($("#plotDiv"), "Plot");
  // var lgnd = new Legend()
  // var legendMenu = new LegendMenu(plot);
  /* remove menu items */
  // legendMenu.modifyMenu("rename", {})
  // legendMenu.modifyMenu("symbol", {})
  // legendMenu.modifyMenu("pen", {})
  // legendMenu.modifyMenu("remove", {})
  // legendMenu.modifyMenu("curve brush", {})
  // console.log(legendMenu)
  // plot.insertLegend(lgnd);
  // plot.enableLegend(true);
  // var c = new Curve("curve 1")
  // c.setSamples([new Misc.Point(0, 0), new Misc.Point(2, 6),  new Misc.Point(6, 3), new Misc.Point(10, 10)])
  // c.attach(plot)
  // plot.setAutoReplot(true)

  //plot.setLegendFont(new Misc.Font(20))

  // var plot1 = new Plot($("#plotDiv"), "Plot 1" );
  // plot1.setAutoReplot(true);

  // var g = new PlotGrid()
  // Utility.minorGridLines(g, true)
  // g.attach(plot1)
  // var m = new Magnifier(plot1)
  // plot1.setFooter("Footer")

  // var plot2 = new Plot($("#plotDiv2"), "Plot 2" );
  // plot2.setAutoReplot(true)
  // var m2 = new Magnifier(plot2);
  // plot2.setFooter("Footer2")

  // var plot3 = new Plot($("#plotDiv3")/* , "Plot 2"  */);
  // plot3.setAutoReplot(true)
  // var m2 = new Magnifier(plot3);
  // plot3.setFooter("Footer3")

  // Enumerator.setDefaultEnumNampespace("Enum")
  // Enumerator.noThrowOnEnumRedefinition()

  // Enumerator.enum("Hello{world1, world2, world3")
  // Enumerator.enum("Hello{world1=45, world2, world3")
  // //Enum.Hello.world1 = 45;
  //console.log((0x01 | 0x02))

  // const options2 = {
  //   hideAlphas: true,
  //   title: "Function Editor",
  //   screenColor: "#fff",
  //   screenTextColor: "#00f",
  //   prettyOnly: true,
  //   initializeWithLastValue: true,
  //   validOnly: true,
  //   bigDialog: true,
  //   //operatorButtonTextColor: "red"
  //   //buttonImages: {xSquareImg: "img/xSquare3.png"}
  //   // buttonImages: {xSquareImg: "Sqr", squareRootImg: "Sqrt", xToPowYImg: "x^y"}
  // };

  // //Create a second equation editor that will be trigger when a clickable html element with id 'test2' is clicked.
  // new EquationEditor("equationEditor" /* , options2 */);

  //////////////////////////////

  // class MyModal extends ModalDlg {
  //   constructor(obj) {
  //     super(obj);

  //     const columns = [
  //       '<div id="select101aa" class="col-sm-5">Horizontal:</div>',

  //       '<div class="col-sm-7">\
  //           <select id="select1">\
  //             <option value="bottomAxis">Bottom axis</option>\
  //             <option value="topAxis">Top axis</option>\
  //           </select>\
  //       </div>',
  //     ];

  //     const columns2 = [
  //       '<div class="col-sm-5">Vertical:</div>',

  //       '<div class="col-sm-7">\
  //           <select id="select2">\
  //             <option value="leftAxis">Left axis</option>\
  //             <option value="rightAxis">Right axis</option>\
  //           </select>\
  //       </div>',
  //     ];

  //     this.addRow(columns, "row1");
  //     this.addRow(columns2);
  //     this.addHandler("cancel", "click", function () {
  //       console.log("cancel");
  //     });
  //     this.addHandler("ok", "click", function () {
  //       console.log(456);
  //       //dlg.closeDlg();
  //     });
  //     this.addHandler("select1", "change", function () {
  //       if ($(this).val() == "bottomAxis") {
  //         console.log("bottomAxis");
  //       } else {
  //         console.log("topAxis");
  //       }
  //     });

  //     this.addHandler("select2", "change", function () {
  //       if ($(this).val() == "leftAxis") {
  //         console.log("leftAxis");
  //       } else {
  //         console.log("rightAxis");
  //       }
  //     });
  //   }
  // }

  // const options = {
  //   title: "Test Modal",
  //   //hideCancelButton: true,
  //   //spaceRows: true,
  //   // beforeDetach: function () {
  //   //   console.log("beforeDetach");
  //   // },
  // };
  // var dlg = new MyModal(options);
  // // dlg.hide("row1");
  // // dlg.show("row1");
  // // console.log(dlg.css("ok", {"width": 200}))
  // // console.log(dlg.css("ok", "width"))
  // dlg.addFooterButton("testButtonId", "Test Btn")
  // console.log(dlg.attr("testButtonId", "id"))
  // dlg.showDlg();

  /* var plot = new Plot($("#plotDiv"), "Plot");
  plot.setAutoReplot(true);

  plot.insertLegend(new Legend());
  plot.enableLegend(true);

  const curve = new Curve("Aaaa");
  curve.setSamples([new Misc.Point(1, 1), new Misc.Point(10, 10)]);
  curve.attach(plot);

  curve.detach();
  curve.attach(plot);

  curve.detach();
  curve.attach(plot);
  curve.detach();
  curve.attach(plot);
  curve.detach();
  curve.attach(plot);
  curve.detach();
  curve.attach(plot); */

  /* class MyPicker extends PlotPicker {
    constructor(plot) {
      super(
        Axis.AxisId.xBottom,
        Axis.AxisId.yLeft,
        Picker.RubberBand.NoRubberBand,
        Picker.DisplayMode.AlwaysOn,
        plot
      );
      var self = this;

      Static.bind("selected", function (e, pickedPoints) {
        var selection = self.selection()[0];
        console.log(
          ScaleMap.invTransform(
            plot.axisScaleDraw(Axis.AxisId.xBottom).scaleMap(),
            plot.axisScaleDraw(Axis.AxisId.yLeft).scaleMap(),
            selection
          )
        );
      });

      this.setStateMachine(new PickerClickPointMachine());

      this.setMousePattern(
        EventPattern.MousePatternCode.MouseSelect1,
        Static.LeftButton,
        Static.ShiftModifier
      );

      // this.setEnabled(true);
    }
  }

  var picker = new MyPicker(plot); */

  // let fx1 = "8x";
  // let fx2 = "4x";

  // let op = "/";

  // let fx = math.parse(`(${fx1}) ${op} (${fx2})`);
  // console.log(math.simplify(fx).toString());
  // fx = math.parse(math.simplify(fx).toString());
  // if (fx.fn == "divide") {
  //   //console.log(fx.args[0].toString());
  //   console.log(fx.args[1].toString());
  // } else {
  //   console.log("No denominator");
  // }

  //console.log(math.evaluate("1e-1").toString());

  // const a = [
  //   [-2, 3], //-2x +3y = 11
  //   [2, 1], //2x + y = 9
  // ];
  // const b = [11, 9];
  // const x = math.lusolve(a, b); // [ [[2], [5]] ]
  // console.log(x);

  // var Fraction = algebra.Fraction;
  // var Expression = algebra.Expression;
  // var Equation = algebra.Equation;

  // var x1 = algebra.parse("1/5  x + 2/15");
  // var x2 = algebra.parse("1/7  x + 4");

  // var eq = new Equation(x1, x2);
  // console.log(eq.toString());

  // var answer = eq.solveFor("x");

  // console.log("x = " + answer.toString());

  // const trash = new Trash();
  // trash.showDlg();

  // Utility.alertYesNo("AAA", function (val) {
  //   console.log(val);
  // });

  //const s = "|-2|x||";
  //console.log(Utility.insertAbs(s));

  /* const parser = new math.parser();
  parser.evaluate("f(x) = (4x^2)^(1/3)");

  const s = (10 + 10) / 20;

  console.log(parser.evaluate(`f(-10)`));
  for (let i = 1; i < 20; i++) {
    let x = -10 + s * i;
    console.log(parser.evaluate(`f(${x})`));
  }
  console.log(parser.evaluate(`f(10)`)); */

  //console.log(math.simplify("2 * 1 * x ^ (2 - 1)").toString());

  // var Fraction = algebra.Fraction;
  // var Expression = algebra.Expression;
  //var Equation = algebra.Equation;

  // var expr = new Expression("x");
  // expr = expr.subtract(3);
  // expr = expr.add("x");

  // console.log(expr.toString());

  // var eq = new Equation(expr, 4);

  // console.log(eq.toString());

  // var x = eq.solveFor("x");

  // console.log("x = " + x.toString());

  //var quad = new Equation(algebra.parse("81.2*x^2 +322.4*x-579.05"), 0);
  // var quad = new Equation(
  //   algebra.parse(
  //     "2.59e-5 * x ^ 3 - 0.0297938 * x ^ 2 + 8.8587678 * x - 100.2425242"
  //   ),
  //   0
  // );

  //console.log(quad.toString());
  // var answers = quad.solveFor("x");

  // console.log("x = " + answers.toString());

  //27x^3 +161x^2-579x+180

  //console.log(Utility.curveTurningPoint1("27x^3 +161x^2-579x+180", "x"));
  // console.log(
  //   Utility.curveTurningPoint(
  //     "2.28e-5x^3 - 0.0307742*x^2 + 10.9604433x - 271.7014375",
  //     "x"
  //   )
  // );

  //console.log(Utility.curveTurningPoint(curve));

  // let n = { value: 2.125456 };
  // n.value = Utility.adjustForDecimalPlaces(n.value, 2);
  // console.log(n);

  // let n = 212545.6;
  // n = Utility.toPrecision(n, 10);
  // console.log(n);
  //Utility.toPrecision(,precisionX);
  //console.log(486, math.evaluate(1 / 1e-100));

  /* function discontinuity(exp){    
    let m_exp = math.parse(exp);
    let denominators = [];
    let result = [];
    m_exp.forEach(function(e){
      if(e.op == "/"){
        denominators.push(e.args[1].toString());
      }    
    });
    
    denominators.forEach(function(e){
      let equat = new Equation(algebra.parse(e), 0); 
      if(equat.lhs.toString().indexOf("x") !==-1){
        let answers = equat.solveFor("x");        
        if(typeof answers == "object"){
          answers.forEach(function(ans){
            result.push(math.evaluate(ans.toString()));
          });
        }else{
          result.push(math.evaluate(answers.toString()));
        } 
      }     
    });
    return result;
  } */

  // var eq = nerdamer("x^2+y^2=1");
  // var y = eq.solveFor("y");
  // console.log(y.toString());

  // var eq = nerdamer("cos(1 / cos(x))=0");
  // var x = eq.solveFor("x");
  // console.log(x.toString());

  //x = Math.min.apply(null, x.toString())
  // x = Math.min.apply(null,x.toString().replace("[", "").replace("]", "").split(",").map(function(e){
  //   return parseFloat(e)
  // }))

  // for (let i = 0; i < x.length; i++) {
  //   console.log(i, x.at(i).valueOf());
  // }

  // var e = nerdamer("x/2+y/3");
  // var denominator = e.denominator().toString();
  // console.log(denominator);

  //1/(cos(1/(cos(x))))

  //console.log(486, math.evaluate("sin(180)"));

  //console.log(math.simplify("(-(x^2))^2").toString());
  //console.log("(-(x^2))^2");

  /* let entry = "1,1";
  Utility.prompt("Enter comma separated values", entry, function (csvStr) {
    if (csvStr) {
      const arr = csvStr.split(",");
      if (arr.length !== 2) {
        Utility.promptErrorMsg = `Improper translate values.\nExpected a comma separated value (csv).`;
        return false;
      }

      let m_translateX = Number.MAX_VALUE,
        m_translateY = Number.MAX_VALUE;

      try {
        let parser = new EvaluateExp(arr[0], self.defines.expandDefines);
        m_translateX = parser.eval();
        if (!math.isNumeric(m_translateX)) m_translateX = Number.MAX_VALUE;
      } catch (error) {
        m_translateX = Number.MAX_VALUE;
      }
      try {
        let parser = new EvaluateExp(arr[1], self.defines.expandDefines);
        m_translateY = parser.eval();
        if (!math.isNumeric(m_translateY)) m_translateY = Number.MAX_VALUE;
      } catch (error) {
        m_translateY = Number.MAX_VALUE;
      }
      // if (arr.length == 2) {
      if (
        m_translateX == Number.MAX_VALUE &&
        m_translateY == Number.MAX_VALUE
      ) {
        Utility.promptErrorMsg = `\"${arr[0]},${arr[1]}\" represent improper translate values.`;
        entry = csvStr;
        return false;
      }
      if (m_translateX == Number.MAX_VALUE) {
        Utility.promptErrorMsg = `\"${arr[0]}\" is an improper translate values.`;
        entry = csvStr;
        return false;
      }
      if (m_translateY == Number.MAX_VALUE) {
        Utility.promptErrorMsg = `\"${arr[1]}\" is an improper translate values.`;
        entry = csvStr;
        return false;
      }
      //entry = csvStr;
      //} else {
      validInput = true;
      // const m_translateX = math.evaluate(arr[0]);
      // const m_translateY = math.evaluate(arr[1]);

      for (let i = 0; i < curves.length; i++) {
        self.transformation.transform(
          curves[i],
          "Translate",
          m_translateX,
          m_translateY
        );
      }
      //}
    } else {
      return;
    }

    // console.log(str); //If the visitor clicks OK, the input is log to the console.
    // Utility.promptErrorMsg = "Invalid input. Expected a number.";
    return true;
  }); */

  // $("#testButton").click(function () {
  //   Utility.alert("No curves found", "small", true); //Display a small alert box with the message "No curves found".
  // });
  //console.log(math.evaluate("4^2a", { a: 2 }).toString());

  /* <div style="width:20%">
<div><output style="display: flex;justify-content: center;" name="ageOutputName" id="ageOutputId">24</output></div>
    <input id="min_value" style="width:11%;padding:0;" oninput="ageInputId.min = min_value.value"><input style="width:68%" type="range" name="ageInputName" id="ageInputId" value="24" min="1" max="100" oninput="ageOutputId.value = ageInputId.value"><input id="max_value" style="width:11%;padding:0;" oninput="ageInputId.max = max_value.value">
    
</div> */

  // console.log(math.simplify("sin(x)^2+cos(x)^2").toString());
  //console.log(asciimath.parseMath);

  // const str = "aaaaaaaa 26 c 44";
  //console.log(math.simplify("4x/a").toString());

  // var x = nerdamer("sin(9^0.5*4)/0.9");
  //console.log(math.parse("log(8,a+2)").toTex());

  // const parser = math.parser();
  // parser.set("a", 4);
  // const p = math.parse("x^2+a");
  // // const expEval = new EvaluateExp("x^2+a");

  // console.log(p.evaluate({ x: 2 }));

  //const parser = math.parser();
  //console.log(parser);
  //let simplified = parser.parse();
  //let simplified = parser.evaluate("x^2");
  // const parser2 = math.parser();
  //console.log(simplified.evaluate({ x: 2 }));
  //simplified.evaluate("f(x)=x^2");

  //console.log(mathsteps);

  /* const steps = mathsteps.solveEquation("3x +1= 35");

  steps.forEach((step) => {
    console.log("before change: " + step.oldEquation.ascii()); // e.g. before change: 2x + 3x = 35
    console.log("change: " + step.changeType); // e.g. change: SIMPLIFY_LEFT_SIDE
    console.log("after change: " + step.newEquation.ascii()); // e.g. after change: 5x = 35
    console.log("# of substeps: " + step.substeps.length); // e.g. # of substeps: 2
  }); */

  /* const Logger = Utility.loggerSetup();

  var expression = "(24x+32)(2x+2)/2";
  Logger.log(expression); */

  // const customFunctions = {
  //   log_: function (a, b) {
  //     return math.log(b, a);
  //   },
  // };

  //let result = text.match(/[^\(]*(\(.*\))[^\)]/);

  // customFunctions.logg_.toTex = "\\mathrm{${logg_}}\\left(${args}\\right)";
  // customFunctions.logg_.toString = "logg(${args})"; //template string

  //math.import(customFunctions);

  // console.log(math.simplify("logg_2(8,2)").toString());

  // function getOperand(str, startIndex, keyword, postKeyword = true) {
  //   const _str = str.substring(startIndex);

  //   //let re = new RegExp(`${keyword}[\\(]*(\\(.*\\))[^\\)]`);
  //   let re = new RegExp(`[\\(]*(\\(.*\\))[^\\)](?=mod)`);

  //   let result = text.match(re);

  //   return result;
  // }

  //let text = "log_(1+a)(1+x)-4x+3-log_(1+b)(1+x)";
  //let result = text.match(/\((?:[^)(]*(?R)?)*+\)/);
  //let result = text.match(/[^\(]*(\(.*\))[^\)](?=mod)/);
  //console.log(XRegExp.matchRecursive(text, "\\(", "\\)" /* , "g" */));

  //console.log(getOperand(text, 0, "mod"));

  // let text = "1bgmod4(1+x)";

  // console.log(
  //   text.match(/(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)(?=mod)|.(?=mod))/g)
  // );
  // console.log(
  //   text.match(
  //     /((?<=mod)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)|(?<=mod).)/g
  //   )
  // );

  // function handleLog_(text) {
  //   const matches = text.match(
  //     /(?<=log_)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
  //   );
  //   let text2 = text.replace(
  //     /(?<=log_)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g,
  //     ""
  //   );
  //   const matches2 = text2.match(
  //     /(?<=log_)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
  //   );
  //   matches.forEach(function (str, i) {
  //     text = text.replace(
  //       `_${matches[i]}${matches2[i]}`,
  //       `(${matches2[i]},${matches[i]})`
  //     );
  //   });
  //   return text;
  // }

  // console.log(
  //   math.simplify("-4.07 mod 4", {}, { exactFractions: false }).toString()
  // );

  //  \((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)

  //////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  //let str1 = "log^2(x)+log(x)+log_(1+b)^2(45-log_(a+2)(1+x))";

  //let str1 = "log(45-log_(a+2)(1+x))";
  //let str1 = "log(45)";
  //let str1 = "log(45+x)";
  //let str1 = "log_2(45)";
  //let str1 = "log_2(45+x)";
  //let str1 = "log_(a+2)(45+x)";

  //let str1 = "log_(1+b)^2(45-log_(a+2)(1+x))";
  //let str1 = "log^2(x)+log(x)+log^2(45-log_(a+2)(1+x))";
  //let str1 = "log^2(45-log_(a+2)(1+x))";
  //let str1 = "(sin^(-1)^(45))^(-1)";
  //let str1 = "log^2(45+x)";
  //let str1 = "log_2^2(45)";
  //let str1 = "log_2^2(45+x)";
  //let str1 = "log_(a+2)^2(45+x)";

  // function operand(str, keyword, indexOfKeyword) {
  //   let subStr = str.substring(indexOfKeyword + keyword.length);
  //   let result = null;
  //   try {
  //     result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //   } catch (error) {
  //     const subStrCpy = subStr.slice();
  //     subStr = subStrCpy.substring(0, subStrCpy.lastIndexOf(")"));
  //     try {
  //       result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //     } catch (error) {
  //       subStr = subStrCpy.substring(0, subStrCpy.lastIndexOf(")") - 1);
  //       try {
  //         result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //       } catch (error) {
  //         subStr = subStrCpy.replace(")", "");
  //         result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //       }
  //     }
  //   }

  //   let operand1 = subStr[0];
  //   //let result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //   if (result) {
  //     if (operand1 !== "(") {
  //       return { operand1, operand2: result[0] };
  //     } else {
  //       return { operand1: result[0], operand2: result[1] };
  //     }
  //   }
  //   return null;
  // }

  // function prefix(str, keyword, indexOfKeyword) {
  //   const subStr = str.substring(0, indexOfKeyword);
  //   // if (subStr[subStr.length - 1] === ")") {
  //   //   let result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
  //   //   if (result) {
  //   //     return `(${result[result.length - 1]})`;
  //   //   }
  //   // } else {
  //   let result = XRegExp.match(subStr, /(log_.*|[a-z]+)/g);
  //   if (result) {
  //     return result[result.length - 1];
  //   }
  //   //}
  //   return null;
  // }

  // function handleExponent(str) {
  //   //log_4^2(x)
  //   //handleExponent is be called before handleLog()
  //   XRegExp.forEach(str, /\^/g, function (e, i) {
  //     let obj = operand(e.input, "^", e.index);
  //     let pref = prefix(e.input, "^", e.index);
  //     if (
  //       obj &&
  //       obj.operand1 &&
  //       obj.operand2 &&
  //       pref &&
  //       pref.length > 1 &&
  //       pref[0] !== "("
  //     ) {
  //       let operand1 = obj.operand1;
  //       if (operand1.length > 1) {
  //         operand1 = `(${operand1})`;
  //       }
  //       if (Static.trigKeywords.indexOf(pref) !== -1 && operand1 === "(-1)") {
  //         const _pref = pref[0] === "a" ? pref.substring(1) : "a" + pref;
  //         str = str.replace(
  //           `${pref}^${operand1}(${obj.operand2})`,
  //           `${_pref}(${obj.operand2})`
  //         );
  //       } else {
  //         str = str.replace(
  //           `${pref}^${operand1}(${obj.operand2})`,
  //           `(${pref}(${obj.operand2}))^${operand1}`
  //         );
  //       }
  //     }
  //   });
  //   return str;
  // }

  // function handleLog(str) {
  //   //handleExponent must be called before handleLog()
  //   XRegExp.forEach(str, /log/g, function (e, i) {
  //     let obj = null;
  //     if (e.input[e.index + 3] !== "_") {
  //       obj = operand(e.input, "log", e.index);
  //       str = str.replace(`log(${obj.operand1})`, `~#~(${obj.operand1},10)`);
  //     } else {
  //       obj = operand(e.input, "log_", e.index);
  //       if (obj.operand1.replaceAll(" ", "").length === 1) {
  //         str = str.replace(
  //           `log_${obj.operand1}(${obj.operand2})`,
  //           `~#~(${obj.operand2},${obj.operand1})`
  //         );
  //       } else {
  //         str = str.replace(
  //           `log_(${obj.operand1})(${obj.operand2})`,
  //           `~#~(${obj.operand2},${obj.operand1})`
  //         );
  //       }
  //     }
  //   });
  //   return str; //.replaceAll("~#~", "log");
  // }

  // function handleExponentAndLog(str) {
  //   let resultCpy = null;
  //   let result = handleExponent(str);
  //   while (result !== resultCpy) {
  //     resultCpy = result.slice();
  //     result = handleLog(result);
  //   }
  //   return result.replaceAll("~#~", "log");
  // }

  // // console.log(handleExponent(str1));
  // // console.log(handleLog(str1));
  // console.log(handleExponentAndLog(str1));

  //operand(str1, "log");

  // let s =
  //   "0x^9+2.58e-10x^8+0x^7-4.8413e-8x^6+0x^5+0.000002702086x^4+0x^3+0.999955582217x^2+0x+0.000099537348";
  // s = s.replaceAll("0x", "0");

  // console.log(456, math.parse(s));

  // const fn = "x^2";
  // const variable = "x";
  // const _rulerLeft = -10;
  // const _rulerRight = 10;
  // const step = 0.1;

  // const value = math.evaluate(
  //   `integrate(${fn} , ${variable}, ${_rulerLeft}, ${_rulerRight}, false, ${step})`
  // );
  //console.log("value:", value);

  // console.log(
  //   456,
  //   getComputedStyle(document.documentElement).getPropertyValue("--part")
  // );

  ////////////////////////////////////////////////////////////////////////////////////

  // customElements.define(
  //   "show-hello",
  //   class extends HTMLElement {
  //     connectedCallback() {
  //       const shadow = this.attachShadow({ mode: "open" });
  //       shadow.innerHTML = `<p>
  //       Hello, ${this.getAttribute("name")}
  //     </p>`;
  //     }
  //   }
  // );
  //console.log(Utility.adjustForDecimalPlaces(-1e200, 200));

  // Utility.progressSpinner();

  // setTimeout(() => {
  //   Utility.progressSpinner(false);
  // }, 1000);

  // const str = "Hello Hope";
  // console.log(
  //   math
  //     .simplify(
  //       "x^0.33333",
  //       {},
  //       { exactFractions: true /* , fractionsLimit: 10000000000000 */ }
  //     )
  //     .toString()
  // );

  //f(x)=x^2
  //x=f(y)
  //x=y^2

  // const _defn = `x=${nerdamer("(y-4)^0.33333333").expand().toString()}`;
  // console.log(nerdamer("(y-4)^0.33333333").expand().toString());

  // const s = nerdamer.solveEquations(_defn, "y");

  // let equat = new algebra.Equation(algebra.parse("x^2+2x+4"), 2);
  // console.log(456, equat.solveFor("x").toString());

  // let eq = nerdamer("y=x^0.3");
  // let solution = eq.solveFor("y");
  // console.log(solution[0].toString());

  // let indepVar = "x";
  // var x = nerdamer(`deg(x^(-0.4),${indepVar})`);
  // console.log(parseFloat(math.simplify(x.toString())));
  // var y = nerdamer("deg(a*x^7+2*x+1,x)");
  // console.log(y.toString());

  //let str = math.simplify("sqrt(x)^2").toString();
  // var x = nerdamer("simplify(0.5(sqrt(4x+20)-2))").toString();
  // console.log(x);
});

/*
TODO
lnxlog(x)
*/
