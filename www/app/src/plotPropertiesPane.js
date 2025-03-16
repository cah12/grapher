"include ['propertiesPane']";
"use strict";

class PlotPropertiesPane extends PropertiesPane {
  constructor(_parent, plot) {
    super(_parent);
    var self = this;
    self.setHeader(
      plot.leftSidebar.gridItem(1).headerElement,
      "Easy Grapher",
      true
    );
    const headerElement = plot.leftSidebar.gridItem(1).headerElement;
    headerElement.css({ height: 40, fontSize: 18 });
    headerElement.parent().css("font-family", "Times New Roman, Times, serif");
    headerElement.parent().css({ fontSize: 16 });
    this.headerTableHead.hide();

    this.shadeWatchArea = true;
    /*********************************************************************************************
     *Plot Specific Properties
     **********************************************************************************************/
    /*********************************************************************************************
     *Function Editor
     ********************************************************************************************/
    let tableSamples = [];
    let newTableCurve = null;
    function makePointTableRow() {
      let row = $(
        '<tr>\
        <td style="border: 1px solid"><math-field class="math-field-limits" style="display: flex; justify-content: center; margin: 1px; font-size: 16px;" value=""></math-field></td>\
        <td style="border: 1px solid"><math-field class="math-field-limits" style="display: flex; justify-content: center; margin: 1px; font-size: 16px;" value=""></math-field></td>\
      </tr>'
      );

      const row_inputs = $(row).find("math-field");
      Utility.extendGetValue(row_inputs[0]);
      Utility.extendGetValue(row_inputs[1]);

      row.off("change").on("change", function () {
        //const row = $(this).parent().parent();
        const inputs = $(this).find("math-field");

        tableSamples = getPointsFromTable();
        newTableCurve.setSamples(tableSamples);
        plot.autoRefresh();
        //console.log(tableSamples);
        if (validInput(inputs[0].value) && validInput(inputs[1].value)) {
          const rows = $("#pointTableTable")[0].rows;
          const _inputs = $(rows[rows.length - 1]).find("math-field");
          if (
            _inputs &&
            _inputs[0] &&
            _inputs[0].value &&
            _inputs[0].value.replace(/\s/g, "").length &&
            _inputs[1] &&
            _inputs[1].value &&
            _inputs[1].value.replace(/\s/g, "").length
          ) {
            $("#pointTableTable").append(makePointTableRow());

            const lastRow = $("#pointTableTable").find("TR").last();
            const inp = lastRow.find("math-field").first()[0];
            //console.log(inp);
            inp.focus();
          }
        }
      });
      row.off("input").on("input", function () {
        //console.log($("#pointTableTable")[0].rows);
        const rows = $("#pointTableTable")[0].rows;
        const inputs = $(this).find("math-field");
        if (
          //rows.length > 2 &&
          $(this).index() !== rows.length - 1 &&
          inputs[0].value.length == 0 &&
          inputs[1].value.length == 0
        ) {
          //console.log(478, $(this).index());
          //tableSamples = getPointsFromTable();
          //console.log(tableSamples);
          $(this).off("change");
          $(this).off("input");
          $("#pointTableTable")[0].deleteRow($(this).index());
        }
      });

      return row;
    }

    /* table-layout: fixed;
  width: 100%;   */

    const pointTable = $(
      '<div style="border: 4px ridge white;">\
        <div style="background-color:lightgray; height:25px;"><b>Table (</b><span id="tableCurveName"></span>)<button id="pointTableClose" class="closeButton" style="float:right;" title="Close">X</button></div>\
        <table id="pointTableTable" style="table-layout: fixed;">\
          <tr style="font-size: 18px;">\
              <th style="text-align: center;">x<sub>1</sub></th>\
              <th style="text-align: center;">y<sub>1</sub></th>\
          </tr>\
        </table>\
      </div>'
    );

    const t = this.table();
    const e = $(
      '<tr>\
      <td colspan="2" style="margin:0px; padding:0px;">\
        <div style="font-size: 14px;">\
        <math-field id="fnDlg_function" data-toggle="tooltip" data-trigger="hover" data-placement="bottom" data-original-title="Enter a function" title="" style="width:100%; padding-left: 2px; padding-right: 2px; font-size: 20px; border-style: solid; border-width: 1px">x^2</math-field><div>\
        &nbspTitle: <input id="fnDlg_title" style="margin:1px; width:30%; height:26px;" type="text" value="curve_1"/><button id="executeButton" style="float: right" title="Add the defined curve to the plot"><img src=' +
        Static.imagePath +
        "execute.png" +
        ' width="20" height="20"></button><button id="settingsButton" style="float: right" title="Curve definition settings"><img src=' +
        Static.imagePath +
        "wrench.png" +
        ' width="20" height="20"></button><button id="tableButton" style="float: right" title="Point table"><img src=' +
        Static.imagePath +
        "table.png" +
        ' width="20" height="20"></button></div>\
        </div>\
      </td>\
    </tr>'
    );
    t.prepend(e);

    t.parent().append(pointTable);

    $("#pointTableTable").append(makePointTableRow());

    $("math-field")[0].addEventListener(
      "keydown",
      (ev) => {
        if (ev.key === "\\") {
          ev.preventDefault();
          $("#fnDlg_function")[0].executeCommand(["insert", "\\backslash"]);
        } else if (ev.key === "Escape") ev.preventDefault();
      },
      { capture: true }
    );

    function validInput(str) {
      let result = false;
      if (str && str.length) {
        result = true;
      }
      return result;
    }

    async function getPointsFromTable() {
      let samples = [];
      try {
        const rows = $("#pointTableTable")[0].rows;
        let precisionX = plot.axisPrecision(newTableCurve.xAxis());
        let decimalPlacesX = plot.axisDecimalPlaces(newTableCurve.xAxis());
        let precisionY = plot.axisPrecision(newTableCurve.yAxis());
        let decimalPlacesY = plot.axisDecimalPlaces(newTableCurve.yAxis());
        for (let i = 1; i < rows.length; i++) {
          const inputs = $(rows[i]).find("math-field");
          let x = "",
            y = "";
          if (inputs && inputs[0] && inputs[0].value) {
            x = inputs[0].value.replace(/\s/g, "");
          }
          if (inputs && inputs[1] && inputs[1].value) {
            y = inputs[1].value.replace(/\s/g, "");
          }
          if (x.length) {
            const _x = await plot.defines.expandDefines(
              inputs[0].getValue("ascii-math")
            );
            x = Utility.logBaseAdjust(_x);
            try {
              x = math.evaluate(x).toString();
            } catch (error) {
              alert(error.message);
              inputs[0].value = "";
              return;
            }
            inputs[0].value = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(x, decimalPlacesX),
              precisionX
            );
          }
          if (y.length) {
            //Utility.logBaseAdjust(fnDlgFunctionVal)
            const _y = await plot.defines.expandDefines(
              inputs[1].getValue("ascii-math")
            );
            y = Utility.logBaseAdjust(_y);
            try {
              y = math.evaluate(y).toString();
            } catch (error) {
              alert(error.message);
              inputs[1].value = "";
              return;
            }
            inputs[1].value = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(y, decimalPlacesY),
              precisionY
            );
          }

          // const
          // const y = parseFloat(inputs[1].value);
          if (x.length && y.length) {
            x = parseFloat(x);
            y = parseFloat(y);
            samples.push(new Misc.Point(x, y));
          }
        }

        samples.sort(function (a, b) {
          return a.x - b.x;
        });

        return samples;
      } catch (error) {
        console.log(error);
        return samples;
      }
    }

    function updatePointTable(curve) {
      if (!pointTable.is(":visible")) {
        return;
      }

      const samples = curve.data().samples();
      const rows = $("#pointTableTable")[0].rows;
      if (rows.length - 2 !== samples.length) {
      }
      while (rows.length - 2 > samples.length) {
        $(rows[1]).remove();
      }
      let precisionX = plot.axisPrecision(curve.xAxis());
      let decimalPlacesX = plot.axisDecimalPlaces(curve.xAxis());
      let precisionY = plot.axisPrecision(curve.yAxis());
      let decimalPlacesY = plot.axisDecimalPlaces(curve.yAxis());
      let indexInSamples = 0;
      for (let i = 1; i < rows.length; i++) {
        const inputs = $(rows[i]).find("math-field");
        if (inputs[0].value.length && inputs[1].value.length) {
          inputs[0].value = Utility.toPrecision(
            Utility.adjustForDecimalPlaces(
              samples[indexInSamples].x,
              decimalPlacesX
            ),
            precisionX
          );
          inputs[1].value = Utility.toPrecision(
            Utility.adjustForDecimalPlaces(
              samples[indexInSamples].y,
              decimalPlacesY
            ),
            precisionY
          );
          indexInSamples++;
        }
      }
      Static.trigger("pointsTableUpdated", curve);
    }

    pointTable.hide();
    headerElement.show();

    $("#settingsButton").click(function () {
      plot._functionDlg.functionDlg(Utility.generateCurveName(plot));
    });

    const mf = $("#fnDlg_function")[0];
    this.mf = mf;

    // mf.mathVirtualKeyboardPolicy = "manual";
    // mf.addEventListener("focusin", () => mathVirtualKeyboard.show());
    // mf.addEventListener("focusout", () => mathVirtualKeyboard.hide());

    Utility.extendGetValue(mf);
    //mf.setOptions({ smartSuperscript: false });
    $(mf).tooltip();
    // mf.setOptions({
    //   inlineShortcuts: {
    //     "*": "*",
    //   },
    // });

    // mf.setOptions({
    //   inlineShortcuts: {
    //     ...mf.getOptions("inlineShortcuts"), // Preserve default shortcuts
    //     "*": "\\ast",
    //   },
    // });

    let executeButtonClicked = false;

    mf.addEventListener("beforeinput", (e) => {
      if (e.data == "insertLineBreak" && mf.caretPoint) {
        //$("#executeButton").trigger("mousedown"); //show wait cursor
        //$("body").trigger("click");
        //Utility.progressWait();
      }
    });

    $("#executeButton")
      .off("mousedown")
      .on("mousedown", () => {
        //Utility.progressWait();
      });

    $("#executeButton")
      .off("mouseleave")
      .on("mouseleave", () => {
        // if (!executeButtonClicked) Utility.progressWait(false);
      });

    Static.enterButton = $("#executeButton");

    $("#executeButton").click(function () {
      executeButtonClicked = true;

      Static.errorMessage = "";
      mf.applyStyle({ backgroundColor: "none" }, { range: [0, -1] });
      const m_value = $("#fnDlg_function")[0].value;
      //if (m_value) {
      plot._functionDlg.doEnter(m_value, true);
      executeButtonClicked = false;
      // Utility.progressWait(false);
      // } else {
      //   Utility.displayErrorMessage(mf, Static.errorMessage); //add error message
      // }
      $("#fnDlg_function")[0].executeCommand("selectAll");
      $("#fnDlg_function").focus();
    });

    $("#fnDlg_function")
      .off("input")
      .on("input", function (e) {
        Static.errorMessage = "";
        Utility.displayErrorMessage(mf, null); //clear error message
      });

    $("#fnDlg_function")
      .off("keyup")
      .on("keyup", function (e) {
        mf.applyStyle({ backgroundColor: "none" }, { range: [0, -1] });
      });

    $("#fnDlg_function")
      .off("keyup")
      .on("keyup", function (e) {
        const w = parseFloat(t.parent().parent().css("width"));
        //console.log($("#fnDlg_function")[0].caretPoint);
        if ($("#fnDlg_function")[0].caretPoint) {
          const c = $("#fnDlg_function")[0].caretPoint.x;

          if (c > w) {
            t.parent().parent()[0].scrollLeft = c - w + 80;
          }
          if (e.key === "Enter" || e.keyCode === 13) {
            // $("#executeButton").click();

            mathVirtualKeyboard.hide();
            $("#executeButton").click();
          }
        }
      });

    Static.bind("itemAttached", function (e, curve, on) {
      //const L = plot.itemList();
      //console.log(L);
      //axesOrientation.attr("disabled", false);
      if (curve === newTableCurve && !on) {
        //console.log(456);
        t.show();
        pointTable.hide();
        headerElement.show();
        clearPointTable();
        newTableCurve = null;
      }
      $("#fnDlg_title").val(Utility.generateCurveName(plot));
    });

    Static.bind("currentCurveChangedEnds", function (e, curve) {
      if (!curve) return;
      //console.log(curve.data().samples());
      //const samples = curve.samples();
      if (curve == newTableCurve) {
        updatePointTable(curve);
      }
    });

    $("#tableButton").click(function () {
      t.hide();
      //t.parent().append(pointTable);
      pointTable.show();
      headerElement.hide();

      newTableCurve = new MyCurve($("#fnDlg_title").val());
      $("#tableCurveName").html($("#fnDlg_title").val());
      let color = Utility.randomColor();
      newTableCurve.setPen(new Misc.Pen(color, 4));
      newTableCurve.setStyle(Curve.CurveStyle.Dots);

      newTableCurve.attach(plot);
    });

    function clearPointTable() {
      // let mfs = $("#pointTableTable").find("math-field");
      // console.log(mfs);

      let rows = $("#pointTableTable")[0].rows;
      while (rows.length > 2) {
        $(rows[1]).remove();
        //console.log(c[0].innerHTML, c[1].innerHTML);
        // $(c[0].innerHTML).remove();
        // $(c[1].innerHTML).remove();
        //$("#pointTableTable")[0].deleteRow(1);
      }
      // rows = $("#pointTableTable")[0].rows;
      const inputs = $("#pointTableTable").find("math-field");
      inputs[0].value = "";
      inputs[1].value = "";
    }

    $("#pointTableClose").click(function () {
      $("#fnDlg_title").val(Utility.generateCurveName(plot));

      if (getPointsFromTable().length == 0) {
        newTableCurve.detach();
        newTableCurve = null;
      }
      t.show();
      pointTable.hide();
      headerElement.show();
      clearPointTable();
    });

    function xEnteredFunction() {
      console.log("x entered");
    }

    function yEnteredFunction() {
      console.log("y entered");
    }

    Static.bind("undoRedoOperation", function (e, curve) {
      if (newTableCurve === curve) {
        updatePointTable(curve);
      }
    });

    Static.bind("curveRenamed", function (e, curve, existingName, newName) {
      if (curve === newTableCurve) {
        $("#tableCurveName").html(newName);
      }
    });

    this.generateTable = function (curve) {
      //Show the points table
      t.hide();
      //t.parent().append(pointTable);
      pointTable.show();
      headerElement.hide();

      $("#tableCurveName").html(curve.title());

      newTableCurve = curve;

      //Ensure we have a clear table
      clearPointTable();
      let precisionX = plot.axisPrecision(curve.xAxis());
      let decimalPlacesX = plot.axisDecimalPlaces(curve.xAxis());
      let precisionY = plot.axisPrecision(curve.yAxis());
      let decimalPlacesY = plot.axisDecimalPlaces(curve.yAxis());
      const samples = curve.data().samples();
      for (let i = 0; i < samples.length; i++) {
        const element = samples[i];
        const lastRow = $("#pointTableTable").find("TR").last();
        lastRow.find("math-field").first()[0].value = Utility.toPrecision(
          Utility.adjustForDecimalPlaces(element.x, decimalPlacesX),
          precisionX
        );
        lastRow.find("math-field").last()[0].value = Utility.toPrecision(
          Utility.adjustForDecimalPlaces(element.y, decimalPlacesY),
          precisionY
        );
        $("#pointTableTable").append(makePointTableRow());
      }
    };

    /******************************************************************************************
     * Graph settings
     * *****************************************************************************************/

    this.addProperty({
      name: "Graph Settings",
      title: "Graph properties",
      id: "graphSettings",
    });

    /*********************************************************************************************
     *General Settings Properties
     ********************************************************************************************/
    this.addProperty({
      name: "General Settings",
      title: "General properties",
      id: "generalSettings",
      parentId: "graphSettings",
    });
    /*  var axesOrientation = this.addProperty({
      name: "Axes orientation",
      id: "axesOrientation",
      parentId: "generalSettings",
      type: "select",
      selectorOptions: ["Implicit", "Do not swap axes", "Swap axes"],
    });
    this.addProperty({
      name: "1:1 aspect ratio",
      id: "aspectRatio",
      parentId: "generalSettings",
      type: "checkbox",
      //checked: true,
      title: "Set plot asspectRatio",
      fun: aspectRatio,
    });
    this.addProperty({
      name: "+/- root",
      id: "plusMinusRoot",
      parentId: "generalSettings",
      type: "checkbox",
      //checked: true,
      title: "Add a curve for any negative root",
      fun: negativeRoot,
    }); */
    this.addProperty({
      name: "Plot Title",
      title: "Configure plot title",
      id: "plotTitle",
      parentId: "generalSettings",
    });
    var plotTitleTitleSelector = this.addProperty({
      name: "Title",
      id: "plotTitleTitle",
      parentId: "plotTitle",
      type: "text",
      title: "Set a plot title",
      fun: plotTitleTitle,
    });
    this.addProperty({
      name: "Font",
      id: "plotTitleFont",
      parentId: "plotTitle",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set plot title font type",
      fun: plotTitleFont,
    });
    this.addProperty({
      name: "Point",
      id: "plotTitlePoint",
      parentId: "plotTitle",
      type: "number",
      value: "20",
      min: "6",
      max: "32",
      title: "Set plot title font size",
      fun: plotTitlePoint,
    });
    this.addProperty({
      name: "Color",
      id: "plotTitleColor",
      parentId: "plotTitle",
      type: "color",
      title: "Set plot title font color",
      title: "Set plot title font color",
      fun: plotTitleColor,
    });
    this.addProperty({
      name: "Bold",
      id: "plotTitleBold",
      parentId: "plotTitle",
      type: "checkbox",
      checked: true,
      title: "Set plot title font weight",
      fun: plotTitleBold,
    });
    this.addProperty({
      name: "Plot Footer",
      title: "Configure plot footer",
      id: "plotFooter",
      parentId: "generalSettings",
    });
    this.addProperty({
      name: "Footer",
      id: "plotFooterFooter",
      parentId: "plotFooter",
      type: "text",
      value: "Footer",
      title: "Set a plot footer",
      fun: plotFooterFooter,
    });
    this.addProperty({
      name: "Font",
      id: "plotFooterFont",
      parentId: "plotFooter",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set plot footer font type",
      fun: plotFooterFont,
    });
    this.addProperty({
      name: "Point",
      id: "plotFooterPoint",
      parentId: "plotFooter",
      type: "number",
      value: "20",
      min: "6",
      max: "32",
      title: "Set plot footer font size",
      fun: plotFooterPoint,
    });
    this.addProperty({
      name: "Color",
      id: "plotFooterColor",
      parentId: "plotFooter",
      type: "color",
      title: "Set plot footer font color",
      fun: plotFooterColor,
    });
    this.addProperty({
      name: "Bold",
      id: "plotFooterBold",
      parentId: "plotFooter",
      type: "checkbox",
      checked: true,
      title: "Set plot footer font weight",
      fun: plotFooterBold,
    });
    const plot_background = this.addProperty({
      name: "Background",
      id: "plotBackground",
      parentId: "generalSettings",
      type: "color",
      value: "#ffffc8",
      title: "Set plot background color",
      fun: plotBackground,
    });
    this.addProperty({
      name: "Legend",
      title: "Configure legend",
      id: "plotLegend",
      parentId: "generalSettings",
    });
    this.addProperty({
      name: "Background",
      id: "plotLegendBackground",
      parentId: "plotLegend",
      type: "color",
      value: "#ffffff",
      title: "Set legend background color",
      fun: plotLegendBackground,
    });
    this.addProperty({
      name: "Show Line",
      id: "plotLegendShowLine",
      parentId: "plotLegend",
      type: "checkbox",
      title: "If checked, curve is represented by a line on the legend",
      fun: plotLegendShowLine,
    });
    this.addProperty({
      name: "Show Symbol",
      id: "plotLegendShowSymbol",
      parentId: "plotLegend",
      type: "checkbox",
      title: "If checked, attached symbols are represented on the legend",
      fun: plotLegendShowSymbol,
    });

    //////
    this.addProperty({
      name: "Font",
      id: "plotLegendFont",
      parentId: "plotLegend",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set plot legend font type",
      fun: plotLegendFont,
    });
    this.addProperty({
      name: "Point",
      id: "plotLegendPoint",
      parentId: "plotLegend",
      type: "number",
      value: "12",
      min: "6",
      max: "32",
      title: "Set plot legend font size",
      fun: plotLegendPoint,
    });
    this.addProperty({
      name: "Color",
      id: "plotLegendColor",
      parentId: "plotLegend",
      type: "color",
      title: "Set plot legend font color",
      fun: plotLegendColor,
    });
    this.addProperty({
      name: "Bold",
      id: "plotLegendBold",
      parentId: "plotLegend",
      type: "checkbox",
      checked: false,
      title: "Set plot legend font weight",
      fun: plotLegendBold,
    });

    this.addProperty({
      name: "Tooltip",
      id: "tooltipLegend",
      parentId: "plotLegend",
      // type: "checkbox",
      // checked: false,
      title: "Set tooltip properties",
      //fun: plotLegendBold,
    });

    const show_Tooltip_Legend = this.addProperty({
      name: "Show Tooltip",
      id: "showTooltipLegend",
      parentId: "tooltipLegend",
      type: "checkbox",
      checked: true,
      title: "Show tooltip on hover",
      fun: showTooltipLegend,
    });

    const decimal_Exponts_Legend = this.addProperty({
      name: "Use decimals",
      id: "decimalExpontsLegend",
      parentId: "tooltipLegend",
      type: "checkbox",
      checked: false,
      title: "Prefer decimals when possible.",
      fun: decimalExpontsLegend,
    });

    this.addProperty({
      name: "Background",
      id: "tooltipLegendBackground",
      parentId: "tooltipLegend",
      type: "color",
      value: "#7e5730",
      title: "Set legend tooltip background color",
      fun: tooltipLegendBackground,
    });

    /* this.addProperty({
      name: "Font",
      id: "tooltipLegendFont",
      parentId: "tooltipLegend",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set tooltip legend font type",
      fun: tooltipLegendFont,
    }); */

    this.addProperty({
      name: "Point",
      id: "tooltipLegendPoint",
      parentId: "tooltipLegend",
      type: "number",
      value: "12",
      min: "6",
      max: "32",
      title: "Set tooltip legend font size",
      fun: tooltipLegendPoint,
    });
    this.addProperty({
      name: "Color",
      id: "tooltipLegendColor",
      parentId: "tooltipLegend",
      type: "color",
      value: "#ffffff",
      title: "Set tooltip legend font color",
      fun: tooltipLegendColor,
    });

    /* this.addProperty({
      name: "Bold",
      id: "tooltipLegendBold",
      parentId: "tooltipLegend",
      type: "checkbox",
      checked: false,
      title: "Set tooltip legend font weight",
      fun: tooltipLegendBold,
    }); */

    /***************************************Drawing Settings Properties************************************/
    this.addProperty({
      name: "Drawing Settings",
      title: "Drawing properties",
      id: "drawingSettings",
      parentId: "graphSettings",
    });
    var axesOrientation = this.addProperty({
      name: "Axes orientation",
      title:
        "Swap the bottom and left axes and redraw all plot items associated with them.",
      id: "axesOrientation",
      parentId: "drawingSettings",
      type: "select",
      //disabled: true,
      selectorOptions: ["Implicit", "Don't/Undo swap axes", "Swap axes"],
    });
    //axesOrientation.attr("disabled", false);

    var aspectRatioChkBx = this.addProperty({
      name: "1:1 aspect ratio",
      id: "aspectRatio",
      parentId: "drawingSettings",
      type: "checkbox",
      //checked: true,
      title: "Set plot asspectRatio",
      fun: aspectRatio,
    });

    /* this.addProperty({
      name: "+/- root",
      id: "plusMinusRoot",
      parentId: "drawingSettings",
      type: "checkbox",
      checked: true,
      title: "Add a curve for any negative root",
      fun: negativeRoot,
    }); */

    var animationRate = this.addProperty({
      name: "Animation rate",
      id: "animationRate",
      parentId: "drawingSettings",
      type: "select",
      selectorOptions: ["Moderate", "Slow", "Fast"],
      title: "Set the animation speed for parameters",
      //disabled: true,
    });

    var theoreticalPixel = this.addProperty({
      name: "Theoretical pixel",
      id: "theoreticalPixel",
      parentId: "drawingSettings",
      type: "select",
      selectorOptions: ["1 x 1 (1px)", "2 x 2 (4px)", "3 x 3 (9px)"],
      title:
        "Theoretical pixel affects the plotting response of spectrograms. The smaller the theoretical pixel the slower the plotting.",
      //disabled: true,
    });

    theoreticalPixel[0].selectedIndex = 1;

    theoreticalPixel.change(function () {
      Static.theoreticalPixelSize = parseInt([$(this)[0].selectedIndex]) + 1;
    });

    animationRate.change(function () {
      const animationRates = [
        Static.animationDuration_Moderate,
        Static.animationDuration_Slow,
        Static.animationDuration_Fast,
      ];
      Static.animationDuration = animationRates[$(this)[0].selectedIndex];
    });

    /***************************************Scale Settings Properties************************************/
    this.addProperty({
      name: "Scale Settings",
      title: "Configure scales",
      id: "scaleSettings",
      parentId: "graphSettings",
    });
    this.addProperty({
      name: "Title",
      title: "Configure scale title",
      id: "scaleTitle",
      parentId: "scaleSettings",
    });
    var bottomScaleTitle = this.addProperty({
      name: "Bottom",
      id: "bottomScaleTitle",
      parentId: "scaleTitle",
      type: "text",
      value: "Bottom-Scale",
      title: "Set bottom scale title",
      fun: bottomScaleTitle,
    });
    var topScaleTitle = this.addProperty({
      name: "Top",
      id: "topScaleTitle",
      parentId: "scaleTitle",
      type: "text",
      value: "Top-Scale",
      title: "Set top scale title",
      fun: topScaleTitle,
    });
    var leftScaleTitle = this.addProperty({
      name: "Left",
      id: "leftScaleTitle",
      parentId: "scaleTitle",
      type: "text",
      value: "Left-Scale",
      title: "Set left scale title",
      fun: leftScaleTitle,
    });
    var rightScaleTitle = this.addProperty({
      name: "Right",
      id: "rightScaleTitle",
      parentId: "scaleTitle",
      type: "text",
      value: "Right-Scale",
      title: "Set right scale title",
      fun: rightScaleTitle,
    });
    this.addProperty({
      name: "Font",
      id: "scaleTitleFont",
      parentId: "scaleTitle",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set scale title font type",
      fun: scaleTitleFont,
    });
    this.addProperty({
      name: "Point",
      id: "scaleTitlePoint",
      parentId: "scaleTitle",
      type: "number",
      value: "14",
      min: "6",
      max: "32",
      title: "Set scale title font size",
      fun: scaleTitlePoint,
    });
    this.addProperty({
      name: "Color",
      id: "scaleTitleColor",
      parentId: "scaleTitle",
      type: "color",
      title: "Set scale title font color",
      fun: scaleTitleColor,
    });
    this.addProperty({
      name: "Bold",
      id: "scaleTitleBold",
      parentId: "scaleTitle",
      type: "checkbox",
      title: "Set scale title font weight",
      fun: scaleTitleBold,
    });
    this.addProperty({
      name: "Type & precision",
      title: "Configure scale type and precision",
      id: "scalePosition",
      parentId: "scaleSettings",
    });
    this.addProperty({
      name: "Bottom",
      title: "Configure bottom scale type",
      id: "scalePositionBottom",
      parentId: "scalePosition",
    });
    var bottom_attribute = this.addProperty({
      name: "Attribute",
      title: "Scale attributes used during autoscaling",
      id: "scalePositionBottomAttribute",
      parentId: "scalePositionBottom",
    });
    var bottom_Reference = this.addProperty({
      name: "Reference",
      title: "Reference used for IncludeReference and Symmetric",
      id: "scalePositionBottomAttributeReference",
      parentId: "scalePositionBottomAttribute",
      type: "number",
      value: "0",
      disabled: true,
      fun: function (value) {
        plot
          .axisScaleEngine(Axis.AxisId.xBottom)
          .setReference(parseFloat(value));
        plot.autoRefresh();
      },
    });
    var bottom_IncludeReference = this.addProperty({
      name: "IncludeReference",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionBottomAttributeIncludeReference",
      parentId: "scalePositionBottomAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.xBottom);
        se.setAttribute(ScaleEngine.Attributes.IncludeReference, checked);
        bottom_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );

        plot.autoRefresh();
      },
    });
    var bottom_Symmetric = this.addProperty({
      name: "Symmetric",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionBottomAttributeSymmetric",
      parentId: "scalePositionBottomAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.xBottom);
        se.setAttribute(ScaleEngine.Attributes.Symmetric, checked);
        bottom_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var bottom_Floating = this.addProperty({
      name: "Floating",
      title:
        "Do not round scales to the closest major division during autoscaling",
      id: "scalePositionBottomAttributeFloating",
      parentId: "scalePositionBottomAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.xBottom)
          .setAttribute(ScaleEngine.Attributes.Floating, checked);
        plot.autoRefresh();
      },
    });
    var bottom_Inverted = this.addProperty({
      name: "Inverted",
      title: "Invert the scale during autoscaling",
      id: "scalePositionBottomAttributeInverted",
      parentId: "scalePositionBottomAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.xBottom)
          .setAttribute(ScaleEngine.Attributes.Inverted, checked);
        plot.autoRefresh();
      },
    });
    var bottom_linear = this.addProperty({
      name: "Linear",
      title: "Linear scale",
      id: "scalePositionBottomLinear",
      parentId: "scalePositionBottom",
      type: "radio",
      checked: true,
      group: "scalePositionBottomGroup",
    });
    var bottom_log = this.addProperty({
      name: "Log",
      title: "Log scale",
      id: "scalePositionBottomLog",
      parentId: "scalePositionBottom",
      type: "radio",
      group: "scalePositionBottomGroup",
    });
    var bottom_logBase = this.addProperty({
      name: "Base",
      title: "Set the base of Log scale",
      id: "scalePositionBottomBase",
      parentId: "scalePositionBottom",
      disabled: true,
      type: "number",
      value: "10",
      min: "2",
      max: "10",
    });
    var bottom_precision = this.addProperty({
      name: "Precision",
      title:
        "Display scale labels either as exponential or fixed-point notation with the specified number of digits.",
      id: "scalePositionBottomBottom",
      parentId: "scalePositionBottom",
      type: "number",
      value: "4",
      min: "2",
      max: "10",
    });
    this.addProperty({
      name: "Top",
      title: "Configure top scale type",
      id: "scalePositionTop",
      parentId: "scalePosition",
    });
    var top_attribute = this.addProperty({
      name: "Attribute",
      title: "Scale attributes used during autoscaling",
      id: "scalePositionTopAttribute",
      parentId: "scalePositionTop",
    });
    var top_Reference = this.addProperty({
      name: "Reference",
      title: "Reference used for IncludeReference and Symmetric",
      id: "scalePositionTopAttributeIncludeReference",
      parentId: "scalePositionTopAttribute",
      type: "number",
      value: "0",
      disabled: true,
      fun: function (value) {
        plot.axisScaleEngine(Axis.AxisId.xTop).setReference(parseFloat(value));
        plot.autoRefresh();
      },
    });
    var top_IncludeReference = this.addProperty({
      name: "IncludeReference",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionTopAttributeIncludeReference",
      parentId: "scalePositionTopAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.xTop);
        se.setAttribute(ScaleEngine.Attributes.IncludeReference, checked);
        top_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var top_Symmetric = this.addProperty({
      name: "Symmetric",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionTopAttributeSymmetric",
      parentId: "scalePositionTopAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.xTop);
        se.setAttribute(ScaleEngine.Attributes.Symmetric, checked);
        top_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var top_Floating = this.addProperty({
      name: "Floating",
      title:
        "Do not round scales to the closest major division during autoscaling",
      id: "scalePositionTopAttributeFloating",
      parentId: "scalePositionTopAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.xTop)
          .setAttribute(ScaleEngine.Attributes.Floating, checked);
        plot.autoRefresh();
      },
    });
    var top_Inverted = this.addProperty({
      name: "Inverted",
      title: "Invert the scale during autoscaling",
      id: "scalePositionTopAttributeInverted",
      parentId: "scalePositionTopAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.xTop)
          .setAttribute(ScaleEngine.Attributes.Inverted, checked);
        plot.autoRefresh();
      },
    });
    var top_linear = this.addProperty({
      name: "Linear",
      title: "Linear scale",
      id: "scalePositionTopLinear",
      parentId: "scalePositionTop",
      type: "radio",
      checked: true,
      group: "scalePositionTopGroup",
    });
    var top_log = this.addProperty({
      name: "Log",
      title: "Log scale",
      id: "scalePositionTopLog",
      parentId: "scalePositionTop",
      type: "radio",
      group: "scalePositionTopGroup",
    });
    var top_logBase = this.addProperty({
      name: "Base",
      title: "Set the base of Log scale",
      id: "scalePositionTopBase",
      parentId: "scalePositionTop",
      disabled: true,
      type: "number",
      value: "10",
      min: "2",
      max: "10",
    });
    var top_precision = this.addProperty({
      name: "Precision",
      title:
        "Display scale labels either as exponential or fixed-point notation with the specified number of digits.",
      id: "scalePositionTopTop",
      parentId: "scalePositionTop",
      type: "number",
      value: "4",
      min: "2",
      max: "10",
    });
    this.addProperty({
      name: "Left",
      title: "Configure left scale type",
      id: "scalePositionLeft",
      parentId: "scalePosition",
    });
    var left_attribute = this.addProperty({
      name: "Attribute",
      title: "Scale attributes used during autoscaling",
      id: "scalePositionLeftAttribute",
      parentId: "scalePositionLeft",
    });
    var left_Reference = this.addProperty({
      name: "Reference",
      title: "Reference used for IncludeReference and Symmetric",
      id: "scalePositionLeftAttributeIncludeReference",
      parentId: "scalePositionLeftAttribute",
      type: "number",
      value: "0",
      disabled: true,
      fun: function (value) {
        plot.axisScaleEngine(Axis.AxisId.yLeft).setReference(parseFloat(value));
        plot.autoRefresh();
      },
    });
    var left_IncludeReference = this.addProperty({
      name: "IncludeReference",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionLeftAttributeIncludeReference",
      parentId: "scalePositionLeftAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.yLeft);
        se.setAttribute(ScaleEngine.Attributes.IncludeReference, checked);
        left_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var left_Symmetric = this.addProperty({
      name: "Symmetric",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionLeftAttributeSymmetric",
      parentId: "scalePositionLeftAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.yLeft);
        se.setAttribute(ScaleEngine.Attributes.Symmetric, checked);
        left_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var left_Floating = this.addProperty({
      name: "Floating",
      title:
        "Do not round scales to the closest major division during autoscaling",
      id: "scalePositionLeftAttributeFloating",
      parentId: "scalePositionLeftAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.yLeft)
          .setAttribute(ScaleEngine.Attributes.Floating, checked);
        plot.autoRefresh();
      },
    });
    var left_Inverted = this.addProperty({
      name: "Inverted",
      title: "Invert the scale during autoscaling",
      id: "scalePositionLeftAttributeInverted",
      parentId: "scalePositionLeftAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.yLeft)
          .setAttribute(ScaleEngine.Attributes.Inverted, checked);
        plot.autoRefresh();
      },
    });
    var left_linear = this.addProperty({
      name: "Linear",
      title: "Linear scale",
      id: "scalePositionLeftLinear",
      parentId: "scalePositionLeft",
      type: "radio",
      checked: true,
      group: "scalePositionLeftGroup",
    });
    var left_log = this.addProperty({
      name: "Log",
      title: "Log scale",
      id: "scalePositionLeftLog",
      parentId: "scalePositionLeft",
      type: "radio",
      group: "scalePositionLeftGroup",
    });
    var left_logBase = this.addProperty({
      name: "Base",
      title: "Set the base of Log scale",
      id: "scalePositionLeftBase",
      parentId: "scalePositionLeft",
      disabled: true,
      type: "number",
      value: "10",
      min: "2",
      max: "10",
    });
    var left_precision = this.addProperty({
      name: "Precision",
      title:
        "Display scale labels either as exponential or fixed-point notation with the specified number of digits.",
      id: "scalePositionLeftLeft",
      parentId: "scalePositionLeft",
      type: "number",
      value: "4",
      min: "2",
      max: "10",
    });
    this.addProperty({
      name: "Right",
      title: "Configure right scale type",
      id: "scalePositionRight",
      parentId: "scalePosition",
    });
    var right_attribute = this.addProperty({
      name: "Attribute",
      title: "Scale attributes used during autoscaling",
      id: "scalePositionRightAttribute",
      parentId: "scalePositionRight",
    });
    var right_Reference = this.addProperty({
      name: "Reference",
      title: "Reference used for IncludeReference and Symmetric",
      id: "scalePositionRightAttributeIncludeReference",
      parentId: "scalePositionRightAttribute",
      type: "number",
      value: "0",
      disabled: true,
      fun: function (value) {
        plot
          .axisScaleEngine(Axis.AxisId.yRight)
          .setReference(parseFloat(value));
        plot.autoRefresh();
      },
    });
    var right_IncludeReference = this.addProperty({
      name: "IncludeReference",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionRightAttributeIncludeReference",
      parentId: "scalePositionRightAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.yRight);
        se.setAttribute(ScaleEngine.Attributes.IncludeReference, checked);
        right_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var right_Symmetric = this.addProperty({
      name: "Symmetric",
      title: "Include the value at Reference during autoscaling",
      id: "scalePositionRightAttributeSymmetric",
      parentId: "scalePositionRightAttribute",
      type: "checkbox",
      fun: function (checked) {
        const se = plot.axisScaleEngine(Axis.AxisId.yRight);
        se.setAttribute(ScaleEngine.Attributes.Symmetric, checked);
        right_Reference.attr(
          "disabled",
          !se.testAttribute(
            ScaleEngine.Attributes.IncludeReference |
              ScaleEngine.Attributes.Symmetric
          )
        );
        plot.autoRefresh();
      },
    });
    var right_Floating = this.addProperty({
      name: "Floating",
      title:
        "Do not round scales to the closest major division during autoscaling",
      id: "scalePositionRightAttributeFloating",
      parentId: "scalePositionRightAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.yRight)
          .setAttribute(ScaleEngine.Attributes.Floating, checked);
        plot.autoRefresh();
      },
    });
    var right_Inverted = this.addProperty({
      name: "Inverted",
      title: "Invert the scale during autoscaling",
      id: "scalePositionRightAttributeInverted",
      parentId: "scalePositionRightAttribute",
      type: "checkbox",
      fun: function (checked) {
        plot
          .axisScaleEngine(Axis.AxisId.yRight)
          .setAttribute(ScaleEngine.Attributes.Inverted, checked);
        plot.autoRefresh();
      },
    });
    var right_linear = this.addProperty({
      name: "Linear",
      title: "Linear scale",
      id: "scalePositionRightLinear",
      parentId: "scalePositionRight",
      type: "radio",
      checked: true,
      group: "scalePositionRightGroup",
    });
    var right_log = this.addProperty({
      name: "Log",
      title: "Log scale",
      id: "scalePositionRightLog",
      parentId: "scalePositionRight",
      type: "radio",
      group: "scalePositionRightGroup",
    });
    var right_logBase = this.addProperty({
      name: "Base",
      title: "Set the base of Log scale",
      id: "scalePositionRightBase",
      parentId: "scalePositionRight",
      disabled: true,
      type: "number",
      value: "10",
      min: "2",
      max: "10",
    });
    var right_precision = this.addProperty({
      name: "Precision",
      title:
        "Display scale labels either as exponential or fixed-point notation with the specified number of digits.",
      id: "scalePositionRightRight",
      parentId: "scalePositionRight",
      type: "number",
      value: "4",
      min: "2",
      max: "10",
    });
    ///////////
    this.addProperty({
      name: "Font",
      id: "scaleTitleFont",
      parentId: "scalePosition",
      type: "select",
      selectorOptions: PropertiesPane.fontsDisplay(),
      title: "Set scale label font type",
      fun: scaleLabelFont,
    });

    this.addProperty({
      name: "Point",
      id: "scaleLabelPoint",
      parentId: "scalePosition",
      type: "number",
      value: "12",
      min: "6",
      max: "32",
      title: "Set scale label font size",
      fun: scaleLabelPoint,
    });
    this.addProperty({
      name: "Color",
      id: "scaleTitleColor",
      parentId: "scalePosition",
      type: "color",
      title: "Set scale label font color",
      fun: scaleLabelColor,
    });
    this.addProperty({
      name: "Bold",
      id: "scaleTitleBold",
      parentId: "scalePosition",
      type: "checkbox",
      title: "Set scale label font weight",
      fun: scaleLabelBold,
    });
    ////////////////

    this.addProperty({
      name: "Limits",
      title: "Configure scale limits",
      id: "scaleLimits",
      parentId: "scaleSettings",
    });

    var enableUserScale = this.addProperty({
      name: "Enable user scale",
      id: "limitsEnableUserScale",
      parentId: "scaleLimits",
      type: "checkbox",
    });

    this.addProperty({
      name: "Bottom",
      id: "limitsBottom",
      parentId: "scaleLimits",
    });
    var bottom_min = this.addProperty({
      name: "minimum",
      id: "limitsBottomMinimum",
      parentId: "limitsBottom",
      type: "number",
      value: "0",
      disabled: true,
    });
    var bottom_max = this.addProperty({
      name: "maximum",
      id: "limitsBottomMaximum",
      parentId: "limitsBottom",
      type: "number",
      value: "0",
      disabled: true,
    });
    this.addProperty({
      name: "Left",
      id: "limitsLeft",
      parentId: "scaleLimits",
    });
    var left_min = this.addProperty({
      name: "minimum",
      id: "limitsLeftMinimum",
      parentId: "limitsLeft",
      type: "number",
      value: "0",
      disabled: true,
    });
    var left_max = this.addProperty({
      name: "maximum",
      id: "limitsLeftMaximum",
      parentId: "limitsLeft",
      type: "number",
      value: "0",
      disabled: true,
    });
    this.addProperty({ name: "Top", id: "limitsTop", parentId: "scaleLimits" });
    var top_min = this.addProperty({
      name: "minimum",
      id: "limitsTopMinimum",
      parentId: "limitsTop",
      type: "number",
      value: "0",
      disabled: true,
    });
    var top_max = this.addProperty({
      name: "maximum",
      id: "limitsTopMaximum",
      parentId: "limitsTop",
      type: "number",
      value: "0",
      disabled: true,
    });
    this.addProperty({
      name: "Right",
      id: "limitsRight",
      parentId: "scaleLimits",
    });
    var right_min = this.addProperty({
      name: "minimum",
      id: "limitsRightMinimum",
      parentId: "limitsRight",
      type: "number",
      value: "0",
      disabled: true,
    });
    var right_max = this.addProperty({
      name: "maximum",
      id: "limitsRightMaximum",
      parentId: "limitsRight",
      type: "number",
      value: "0",
      disabled: true,
    });
    /*this.addProperty({
			name: "Exp. Notation",
			title: "Set Exp. Notation limits",
			id: "scaleExpNotation",
			parentId: "scaleSettings",
		});
		 var exponent_lower = this.addProperty({
			name: "Values less than",
			id: "expNotationValuesLessThan",
			parentId: "scaleExpNotation",
			type: "number",
			value: "-1e+4",
		});
		var exponent_upper = this.addProperty({
			name: "Values greater than",
			id: "expNotationValuesGreaterThan",
			parentId: "scaleExpNotation",
			type: "number",
			value: "1e+4",
		}); */
    this.addProperty({
      name: "Margins",
      title: "Set scale margins",
      id: "scaleMargins",
      parentId: "scaleSettings",
    });
    var margin_left = this.addProperty({
      name: "Left axis",
      id: "scaleMarginsLeftAxis",
      parentId: "scaleMargins",
      type: "number",
      min: "0",
      value: "0.0",
    });
    var margin_right = this.addProperty({
      name: "Right axis",
      id: "scaleMarginsRightAxis",
      parentId: "scaleMargins",
      type: "number",
      min: "0",
      value: "0.0",
    });
    var margin_bottom = this.addProperty({
      name: "Bottom axis",
      id: "scaleMarginsBottomAxis",
      parentId: "scaleMargins",
      type: "number",
      min: "0",
      value: "0.0",
    });
    var margin_top = this.addProperty({
      name: "Top axis",
      id: "scaleMarginsTopAxis",
      parentId: "scaleMargins",
      type: "number",
      min: "0",
      value: "0.0",
    });
    this.addProperty({
      name: "Components",
      title: "Configure plot components",
      id: "scaleComponents",
      parentId: "scaleSettings",
    });
    var show_backbone = this.addProperty({
      name: "Show backbone",
      id: "scaleComponentsShowBackbone",
      parentId: "scaleComponents",
      type: "checkbox",
      checked: true,
    });
    var show_labels = this.addProperty({
      name: "Show labels",
      id: "scaleComponentsShowLabels",
      parentId: "scaleComponents",
      type: "checkbox",
      checked: true,
    });
    var show_ticks = this.addProperty({
      name: "Show ticks",
      id: "scaleComponentsShowTicks",
      parentId: "scaleComponents",
      type: "checkbox",
      checked: true,
    });
    var tick_length = this.addProperty({
      name: "Tick length",
      id: "scaleComponentsTickLength",
      parentId: "scaleComponents",
      type: "select",
      selectorOptions: ["Small", "Medium", "Large"],
    });

    /********************Point Operation Settings Properties****************************************/
    /* this.addProperty({name: "Point Operation Settings", id: "pointOperationSettings"});
				var point_selection = this.addProperty({name: "When a point is selected", id: "pointSelected", parentId: "pointOperationSettings", type:"select", selectorOptions: ["Display data", "remove it", "Modify it"]});
				var addRemovePoint = this.addProperty({name: "Add/Remove Point", id: "addRemovePoint", parentId: "pointOperationSettings", type:"checkbox"}); */

    /***************Error Settings Properties**************************************************/
    this.addProperty({
      name: "Error Settings",
      title: "Configure error handling",
      id: "errorSettings",
      parentId: "graphSettings",
    });
    var errorResponse = this.addProperty({
      name: "When an error occurs",
      id: "errorResponse",
      parentId: "errorSettings",
      type: "select",
      selectorOptions: [
        "Silently ignore",
        //"Adjust the domain",
        "Stop and warn",

        //"Allow for ignore",
      ],
    });

    /*****************Zoomer Settings Properties**************************************************/
    var zoomerSettings = this.addProperty({
      name: "Zoomer Settings",
      title: "Configure zoomer",
      id: "zoomerSettings",
      parentId: "graphSettings",
    });

    var zoomerAxes = this.addProperty({
      name: "Zoom according to the current curve axes",
      id: "zoomerAxes",
      parentId: "zoomerSettings",
      type: "checkbox",
      checked: true,
    });
    var zoomAxisHorizontal = this.addProperty({
      name: "Horizontal",
      id: "zoomerHorizontalAxes",
      parentId: "zoomerSettings",
      type: "select",
      selectorOptions: ["Bottom", "Top"],
      disabled: true,
    });
    var zoomAxisVertical = this.addProperty({
      name: "Vertical",
      id: "zoomerVerticalAxes",
      parentId: "zoomerSettings",
      type: "select",
      selectorOptions: ["Left", "Right"],
      disabled: true,
    });
    var trackerMode = this.addProperty({
      name: "Tracker mode",
      id: "zoomerTrackerMode",
      parentId: "zoomerSettings",
      type: "select",
      selectorOptions: ["Always off", "Always on", "Active only"],
      //disabled: true,
    });

    /********************Magnifier Settings Properties***********************************************/
    var magnifierSettings = this.addProperty({
      name: "Magnifier Settings",
      title: "Configure magnifier",
      id: "magnifierSettings",
      parentId: "graphSettings",
    });
    var magnifierLeftAxis = this.addProperty({
      name: "Left axis enabled",
      id: "magnifierLeftAxis",
      parentId: "magnifierSettings",
      type: "checkbox",
      checked: true,
    });
    var magnifierRightAxis = this.addProperty({
      name: "Right axis enabled",
      id: "magnifierRightAxis",
      parentId: "magnifierSettings",
      type: "checkbox",
    });
    var magnifierBottomAxis = this.addProperty({
      name: "Bottom axis enabled",
      id: "magnifierBottomAxis",
      parentId: "magnifierSettings",
      type: "checkbox",
      checked: true,
    });
    var magnifierTopAxis = this.addProperty({
      name: "Top axis enabled",
      id: "magnifierTopAxis",
      parentId: "magnifierSettings",
      type: "checkbox",
    });

    /******************Watch Settings Properties***************************************************/
    var watchSettings = this.addProperty({
      name: "Watch Settings",
      title: "Configure watch",
      id: "watchSettings",
      parentId: "graphSettings",
    });

    var watchShading = this.addProperty({
      name: "Shading",
      id: "watchShading",
      parentId: "watchSettings",
    });
    var watchShadeWatchArea = this.addProperty({
      name: "Shade watch area",
      id: "watchShadeWatchArea",
      parentId: "watchShading",
      type: "checkbox",
      checked: true,
    });
    var watchShadeAutoScale = this.addProperty({
      name: "Shade to axis",
      title: "If autoscaling is enabled, shade up to the axis.",
      id: "watchShadeAutoScale",
      parentId: "watchShading",
      type: "checkbox",
      checked: true,
    });
    var watchShadeColor = this.addProperty({
      name: "Shade color",
      title: "Set the shading color",
      id: "watchShadeColor",
      parentId: "watchShading",
      value: "#006464",
      type: "color",
    });
    var watchCentroidWithArea = this.addProperty({
      name: "Watch centroid with area",
      title: "Place a marker at the centroid",
      id: "watchCentroidWithArea",
      parentId: "watchSettings",
      type: "checkbox",
      checked: true,
    });

    /******************Watch Calculation Properties***************************************************/
    var watchCalculationAccuracy = this.addProperty({
      name: "Calculation Settings",
      id: "watchCalculationAccuracy",
      title: "Configure calculation accuracy",
      parentId: "graphSettings",
    });
    this.addProperty({
      name: "Accuracy level",
      id: "watchCalculationAccuracyLevel",
      title: "Set the accuracy level",
      parentId: "watchCalculationAccuracy",
    });
    var watchCalculationAccuracyLow = this.addProperty({
      name: "Low",
      id: "watchCalculationAccuracyLow",
      parentId: "watchCalculationAccuracyLevel",
      type: "radio",
      group: "watchCalculationAccuracyGroup",
    });
    var watchCalculationAccuracyModerate = this.addProperty({
      name: "Moderate",
      id: "watchCalculationAccuracyModerate",
      parentId: "watchCalculationAccuracyLevel",
      type: "radio",
      group: "watchCalculationAccuracyGroup",
      checked: true,
    });
    var watchCalculationAccuracyHigh = this.addProperty({
      name: "High",
      id: "watchCalculationAccuracyHigh",
      parentId: "watchCalculationAccuracyLevel",
      type: "radio",
      group: "watchCalculationAccuracyGroup",
    });

    /* var decimalPlacesForCalculation =  */ this.addProperty({
      name: "Decimals",
      title: "Prefer decimals when ever possible",
      id: "decimals",
      parentId: "watchCalculationAccuracy",
    });

    var preferDecimals = this.addProperty({
      name: "Use decimals",
      title: "Prefer decimals when ever possible",
      id: "preferDecimals",
      parentId: "decimals",
      type: "checkbox",
      //checked: true,
    });

    var decimalPlacesForCalculation = this.addProperty({
      name: "Decimal places in calculation",
      title: "Set the maximum decimal places used in calculations for an axis",
      id: "decimalPlacesForCalculationy",
      parentId: "decimals",
    });

    var userDecimalPlacesForCalculation = this.addProperty({
      name: "Enable user selection",
      title: "Let the user set the maximum decimal places used in calculations",
      id: "userDecimalPlacesForCalculation",
      parentId: "decimalPlacesForCalculationy",
      type: "checkbox",
      //checked: true,
    });
    var bottom_decimalPlaces = this.addProperty({
      name: "Bottom axis",
      title: "Set the maximum decimal places used in calculations",
      id: "scalePositionBottomBottom",
      parentId: "decimalPlacesForCalculationy",
      disabled: true,
      type: "number",
      value: "1",
      min: "0",
    });
    var left_decimalPlaces = this.addProperty({
      name: "Left axis",
      title: "Set the maximum decimal places used in calculations",
      id: "scalePositionBottomBottom",
      parentId: "decimalPlacesForCalculationy",
      type: "number",
      disabled: true,
      value: "1",
      min: "0",
    });
    var top_decimalPlaces = this.addProperty({
      name: "Top axis",
      title: "Set the maximum decimal places used in calculations",
      id: "scalePositionBottomBottom",
      parentId: "decimalPlacesForCalculationy",
      type: "number",
      disabled: true,
      value: "1",
      min: "0",
    });
    var right_decimalPlaces = this.addProperty({
      name: "Right axis",
      title: "Set the maximum decimal places used in calculations",
      id: "scalePositionBottomBottom",
      parentId: "decimalPlacesForCalculationy",
      type: "number",
      disabled: true,
      value: "1",
      min: "0",
    });

    var dicontinuity = this.addProperty({
      name: "Nearnest to discontinuity",
      title: "Set how discontinuity calculations are made.",
      id: "dicontinuity",
      parentId: "watchCalculationAccuracy",
    });

    var dicontinuityUserSetting = this.addProperty({
      name: "Allow user setting",
      title: "Allow the user to set the nearnest to discontinuity",
      id: "dicontinuityUserSetting",
      parentId: "dicontinuity",
      type: "checkbox",
    });

    var dicontinuityOffsetFactor = this.addProperty({
      name: "Nearnest (1 millionth)",
      title:
        "Set how close a point is to any discontinuity as a millionth of a step.",
      id: "dicontinuityOffsetFactor",
      parentId: "dicontinuity",
      type: "number",
      value: "2",
      min: "2",
      max: "100",
      disabled: true,
    });

    dicontinuityUserSetting.change(function () {
      if ($(this)[0].checked) {
        dicontinuityOffsetFactor.attr("disabled", false);
      } else {
        dicontinuityOffsetFactor.attr("disabled", true);
      }
      Static.dicontinuityUserSetting = $(this)[0].checked;
    });

    dicontinuityOffsetFactor.change(function () {
      //console.log($(this).val());
      let val = parseInt($(this).val());
      if (val < 2) {
        val = 2;
        $(this).val(2);
      }
      Static.dicontinuityOffsetFactor = val / Static.dicontinuityFactor;
    });

    Static.bind("numberOfPoints", function (e, sz) {
      if (!Static.dicontinuityUserSetting) {
        let val = (1 / 100) * sz;
        //if(plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length){
        if (val > dicontinuityOffsetFactor.val()) {
          dicontinuityOffsetFactor.val(val);
          Static.dicontinuityOffsetFactor = val / Static.dicontinuityFactor;
        }
      }
    });

    var uniqueParameter = this.addProperty({
      name: "Unique parameters",
      title:
        "If checked, parameters are unique to the curve in which they exist.",
      id: "uniqueParameter",
      parentId: "watchCalculationAccuracy",
      type: "checkbox",
      checked: false,
      fun: function (checked) {
        Static.uniqueParameter = checked;
      },
    });

    //////////////////////////////////

    function updateCalculationDecimalPlaces(_curve = null) {
      //if (userDecimalPlacesForCalculation[0].checked) return;
      var curve = _curve || plot.rv._curve;
      //console.log(curve)
      if (curve) {
        const autoReplot = plot.autoReplot();
        plot.setAutoReplot(false);
        var xAxis = curve.xAxis();
        var yAxis = curve.yAxis();
        let xDecimalPlaces = 4;
        let yDecimalPlaces = 4;
        if (userDecimalPlacesForCalculation[0].checked) {
          if (xAxis == Axis.AxisId.xBottom) {
            xDecimalPlaces = parseInt(bottom_decimalPlaces.val());
          }
          if (xAxis == Axis.AxisId.xTop) {
            xDecimalPlaces = parseInt(top_decimalPlaces.val());
          }
          if (yAxis == Axis.AxisId.yLeft) {
            yDecimalPlaces = parseInt(left_decimalPlaces.val());
          }
          if (yAxis == Axis.AxisId.yRight) {
            yDecimalPlaces = parseInt(right_decimalPlaces.val());
          }
        } else {
          const obj = Utility.grapherDeterminedDecimalPlaces(curve);
          yDecimalPlaces = obj.decimalPlacesY;
          xDecimalPlaces = obj.decimalPlacesX;
        }
        if (
          xAxis == Axis.AxisId.xBottom &&
          xDecimalPlaces != parseInt(bottom_decimalPlaces.val())
        ) {
          bottom_decimalPlaces.val(xDecimalPlaces);
          bottom_decimalPlaces.trigger("change");
        }
        if (
          xAxis == Axis.AxisId.xTop &&
          xDecimalPlaces != parseInt(top_decimalPlaces.val())
        ) {
          top_decimalPlaces.val(xDecimalPlaces);
          top_decimalPlaces.trigger("change");
        }
        if (
          yAxis == Axis.AxisId.yLeft &&
          yDecimalPlaces != parseInt(left_decimalPlaces.val())
        ) {
          left_decimalPlaces.val(yDecimalPlaces);
          left_decimalPlaces.trigger("change");
        }
        if (
          yAxis == Axis.AxisId.yRight &&
          yDecimalPlaces != parseInt(right_decimalPlaces.val())
        ) {
          right_decimalPlaces.val(yDecimalPlaces);
          right_decimalPlaces.trigger("change");
        }
        plot.setAutoReplot(autoReplot);
        plot.autoRefresh();
      } else {
        if (!userDecimalPlacesForCalculation[0].checked) {
          bottom_decimalPlaces.val(20);
          top_decimalPlaces.val(20);
          left_decimalPlaces.val(20);
          right_decimalPlaces.val(20);
        }
      }
      Static.trigger("updateCalculationDecimalPlaces");
    }

    this.updateCalculationDecimalPlaces = function (curve) {
      updateCalculationDecimalPlaces(curve);
    };

    Static.bind("replot", function () {
      updateCalculationDecimalPlaces();
    });

    function setReadonlyUserDecimalPlacesForCalculation(on) {
      bottom_decimalPlaces.attr("disabled", on);
      left_decimalPlaces.attr("disabled", on);
      top_decimalPlaces.attr("disabled", on);
      right_decimalPlaces.attr("disabled", on);
    }
    userDecimalPlacesForCalculation.change(function () {
      setReadonlyUserDecimalPlacesForCalculation(!this.checked);

      updateCalculationDecimalPlaces();
      bottom_decimalPlaces.trigger("change");
      top_decimalPlaces.trigger("change");
      left_decimalPlaces.trigger("change");
      right_decimalPlaces.trigger("change");
      Static.userDecimalPlacesForCalculation = this.checked;
    });

    preferDecimals.change(function () {
      Static.preferDecimals = this.checked;
    });
    /////////////////////////////////////////////

    /* var watchShading = this.addProperty({
      name: "Shading",
      id: "watchShading",
      parentId: "watchSettings",
    });
    var watchShadeWatchArea = this.addProperty({
      name: "Shade watch area",
      id: "watchShadeWatchArea",
      parentId: "watchShading",
      type: "checkbox",
      checked: true,
    });
    var watchShadeAutoScale = this.addProperty({
      name: "Shade to axis",
      title: "If autoscaling is enabled, shade up to the axis.",
      id: "watchShadeAutoScale",
      parentId: "watchShading",
      type: "checkbox",
      checked: true,
    });
    var watchShadeColor = this.addProperty({
      name: "Shade color",
      title: "Set the shading color",
      id: "watchShadeColor",
      parentId: "watchShading",
      value: "#006464",
      type: "color",
    });
    var watchCentroidWithArea = this.addProperty({
      name: "Watch centroid with area",
      title: "Place a marker at the centroid",
      id: "watchCentroidWithArea",
      parentId: "watchSettings",
      type: "checkbox",
      checked: true,
    }); */

    /*****************************Grid Settings Properties****************************************************/
    this.addProperty({
      name: "Grid Settings",
      title: "Configure grid",
      id: "gridSettings",
      parentId: "graphSettings",
    });
    this.addProperty({
      name: "Minor Lines",
      id: "gridMinorLines",
      parentId: "gridSettings",
    });
    var minor_gridLines = this.addProperty({
      name: "Show",
      id: "gridMinorLinesShow",
      parentId: "gridMinorLines",
      type: "checkbox",
      checked: true,
    });
    var minor_divisions = this.addProperty({
      name: "Minors per major",
      id: "gridMinorsPerMajor",
      parentId: "gridMinorLines",
      type: "number",
      value: "5",
      min: "2",
      max: "20",
    });
    var minor_line_color = this.addProperty({
      name: "Color",
      id: "gridMinorLinesColor",
      parentId: "gridMinorLines",
      type: "color",
    });
    this.addProperty({
      name: "Major Lines",
      id: "gridMajorLines",
      parentId: "gridSettings",
    });
    var major_gridLines = this.addProperty({
      name: "Show",
      id: "gridMajorLinesShow",
      parentId: "gridMajorLines",
      type: "checkbox",
      checked: true,
    });
    var major_divisions = this.addProperty({
      name: "Majors",
      id: "gridMajorMajors",
      parentId: "gridMajorLines",
      type: "number",
      value: "8",
      min: "1",
      max: "40",
    });
    var major_line_color = this.addProperty({
      name: "Color",
      id: "gridMajorLinesColor",
      parentId: "gridMajorLines",
      type: "color",
    });
    var gridSettings = this.addProperty({
      name: "Grid Axes",
      id: "gridAxes",
      parentId: "gridSettings",
    });
    var gridAxes = this.addProperty({
      name: "According to current curve",
      id: "gridAxesAccordingToCurve",
      parentId: "gridAxes",
      type: "checkbox",
      checked: true,
    });
    var gridAxisHorizontal = this.addProperty({
      name: "Horizontal",
      id: "gridHorizontalAxes",
      parentId: "gridAxes",
      type: "select",
      selectorOptions: ["Bottom", "Top"],
      disabled: true,
    });
    var gridAxisVertical = this.addProperty({
      name: "Vertical",
      id: "gridVerticalAxes",
      parentId: "gridAxes",
      type: "select",
      selectorOptions: ["Left", "Right"],
      disabled: true,
    });

    /********************Point Operation Settings Properties****************************************/
    var point_selection = this.addProperty({
      name: "When a point is selected",
      title: "Set what happens to selected point",
      id: "pointSelected",
      parentId: "graphSettings",
      type: "select",
      selectorOptions: ["Display data", "remove it", "Modify it"],
    });
    var addRemovePoint = this.addProperty({
      name: "Add/Remove Point",
      title:
        "If checked, point addition (with double click) and point removal (with left click) is enabled. Point selection (P-Sel), is disabled.",
      id: "addRemovePoint",
      type: "checkbox",
      parentId: "graphSettings",
    });

    this.init(); //call this method after adding all properties

    /**************************************General Settings Properties Callbacks*****************************/
    axesOrientation.change(function () {
      //"Implicit", "Do not swap axes", "Swap axes"
      var index = $(this)[0].selectedIndex;
      if (index == 0) {
        //Implicit
        Static.swapAxes = 0;
        //console.log("Implicit", Static.swapAxes);
      } else if (index == 1) {
        //Do not swap axes
        //Static.swapAxes = 1;
        //console.log("Do not swap axes", Static.swapAxes);
        if (!plot.unSwapAxes()) {
          //Static.swapAxes = 1;
          $(this)[0].selectedIndex = Static.swapAxes;
        } else {
          Static.swapAxes = 1;
        }
      } else if (index == 2) {
        //Swap axes
        //Static.swapAxes = 2;
        //console.log("Swap axes", Static.swapAxes);
        if (!plot.swapAxes()) {
          //Static.swapAxes = 0;
          $(this)[0].selectedIndex = Static.swapAxes;
        } else {
          Static.swapAxes = 2;
        }
      }
      // if ((index === 1 || index === 2) && plot.rv._curve) {
      //   if (index === 1) {
      //     plot.rv._curve.unSwapAxes();
      //   }
      //   if (index === 2) {
      //     plot.rv._curve.swapAxes();
      //   }
      // }
    });

    ///////////////////////////////////////////////

    const plotDiv = $("#plotDiv");
    let doAdjust = false;
    let centralDivW = 0,
      centralDivH = 0;
    function doAdjustPlotDiv1() {
      //const legendW = plot.legend().legendDivWidth();
      //const legendW = plot.legend().maxWidth();
      //console.log(legendW);
      if (Math.abs(centralDivW - centralDivH) < 4) return;
      if (centralDivW > centralDivH) {
        let diff =
          parseFloat(plot.getLayout().getCentralDiv().css("width")) -
          parseFloat(plot.getLayout().getCentralDiv().css("height"));
        let plotDivW = parseFloat(plotDiv.css("width")) - diff;
        plotDiv.css("width", plotDivW + "px");
      } else {
        let diff =
          parseFloat(plot.getLayout().getCentralDiv().css("height")) -
          parseFloat(plot.getLayout().getCentralDiv().css("width"));
        let plotDivH = parseFloat(plotDiv.css("height")) - diff;
        plotDiv.css("height", plotDivH + "px");
      }
      plot.autoRefresh();
    }

    Static.onHtmlElementResize(plot.legend().legendDiv()[0], function () {
      // const legendW = plot.legend().legendDivWidth();
      // console.log(legendW);
      //doAdjustPlotDiv();
    });

    let rightSideBarVisible = false;
    let leftSideBarVisible = false;
    let index_0 = false,
      index_1 = false;
    Static.bind("showGridItem", function (e, m_anchorPosition, gridIndex, on) {
      if (m_anchorPosition == "right") {
        rightSideBarVisible = on;
      }
      if (m_anchorPosition == "left") {
        leftSideBarVisible = on;
        if (gridIndex == 0) index_0 = on;
        if (gridIndex == 1) index_1 = on;
      }
      // if (Static.aspectRatioOneToOne) {
      //   if (doAdjust) doAdjustPlotDiv();
      // }
      if (on) {
        Static.trigger("invalidateWatch");
        Static.trigger("positionChanged");
      } /* else{
        plot.tbar.setButtonCheck(plot.tbar.sBar, false);
      } */
    });

    function negativeRoot(checked) {
      Static.negativeRoot = checked;
    }

    //let aspectRatioAutoScale = false;

    function adjustScales() {
      if (!Utility.isAutoScale(plot)) return;
      //We ensure the scales are updated.
      plot.updateAxes();

      const yAxisInterval = plot.axisInterval(0);
      const xAxisInterval = plot.axisInterval(2);
      const yAxisInverted =
        yAxisInterval.minValue() > yAxisInterval.maxValue() ? true : false;
      const xAxisInverted =
        xAxisInterval.minValue() > xAxisInterval.maxValue() ? true : false;

      let maxWidth = Math.max(
        Math.abs(yAxisInterval.maxValue() - yAxisInterval.minValue()),
        Math.abs(xAxisInterval.maxValue() - xAxisInterval.minValue())
      );
      //console.log("maxWidth", yAxisInterval.width());
      let minY = yAxisInterval.minValue();
      if (yAxisInverted) {
        minY = yAxisInterval.maxValue();
      }

      let minX = xAxisInterval.minValue();

      if (xAxisInverted) {
        minX = xAxisInterval.maxValue();
      }

      if (yAxisInverted) {
        plot.setAxisScale(0, minY + maxWidth, minY);
      } else {
        plot.setAxisScale(0, minY, minY + maxWidth);
      }

      if (xAxisInverted) {
        plot.setAxisScale(2, minX + maxWidth, minX);
      } else {
        plot.setAxisScale(2, minX, minX + maxWidth);
      }
      plot.tbar.setButtonCheck(plot.tbar.auto, true);
    }

    let plotItemMap = new Map();

    function adjustPlotItemAxis(plotItem) {
      plotItemMap.set(plotItem, {
        xAxis: plotItem.xAxis(),
        yAxis: plotItem.yAxis(),
      });
      plotItem.setAxes(Axis.AxisId.xBottom, Axis.AxisId.yLeft);
      plot.legend().updateLegendToolTip(plotItem);
    }

    function restorePlotItemAxis() {
      plotItemMap.forEach(function (value, plotItem) {
        plotItem.setAxes(value.xAxis, value.yAxis);
        plot.legend().updateLegendToolTip(plotItem);
      });
      plotItemMap.clear();
    }

    Static.bind("visibilityChange", function (e, curve, on) {
      if (Static.aspectRatioOneToOne) {
        var doReplot = plot.autoReplot();
        plot.setAutoReplot(false);
        // aspectRatioChkBx.click();
        // aspectRatioChkBx.click();
        self.aspectRatioUpdate();
        plot.setAutoReplot(doReplot);
        plot.autoRefresh();
      }
    });

    function aspectRatio(checked, trigger = true) {
      Static.aspectRatioOneToOne = checked;
      let plotDivContainerSize = plot.plotDivContainerSize();
      //plotDivContainerSize.width -= 15;

      let legendWidth = 0;
      if (plot.isLegendEnabled() && plot.itemList().length) {
        legendWidth = parseFloat($("#legendDiv").css("width")) + 17;
      }
      //console.log(legendWidth);

      let leftSidebarWidth = 0;
      if (plot.leftSidebar.isSideBarVisible()) {
        leftSidebarWidth = parseFloat(plot.leftSidebar.html().css("width")) + 8;
      }
      let rightSidebarWidth = 0;
      if (plot.rightSidebar.isSideBarVisible()) {
        rightSidebarWidth =
          parseFloat(plot.rightSidebar.html().css("width")) + 8;
      }

      let leftAxisWidth = 0;
      if (plot.axisEnabled(Axis.AxisId.yLeft)) {
        leftAxisWidth = parseFloat($("#leftScaleDiv").css("width"));
      }
      let rightAxisWidth = 0;
      if (plot.axisEnabled(Axis.AxisId.yRight)) {
        rightAxisWidth = parseFloat($("#rightScaleDiv").css("width"));
      }
      let bottomAxisHeight = 0;
      if (plot.axisEnabled(Axis.AxisId.xBottom)) {
        bottomAxisHeight = parseFloat($("#bottomScaleDiv").css("height"));
      }
      let topAxisHeight = 0;
      if (plot.axisEnabled(Axis.AxisId.xTop)) {
        topAxisHeight = parseFloat($("#topScaleDiv").css("height"));
      }
      //console.log(plot)

      let footerHeight = 0;
      // if (plot.footer().length) {
      //   footerHeight = parseFloat($("#footerDiv").css("height")) - 17;
      //   if (!plot.footerVisible()) {
      //     footerHeight *= -1;
      //   }
      // }
      if (plot.footerVisible()) {
        footerHeight = parseFloat($("#footerDiv").css("height")) - 0;
      }
      let titleHeight = 0;
      // if (plot.title().length) {
      //   titleHeight = parseFloat($("#titleDiv").css("height")) - 17;
      //   if (!plot.titleVisible()) {
      //     titleHeight *= -1;
      //   }
      // }
      if (plot.titleVisible()) {
        titleHeight = parseFloat($("#titleDiv").css("height")) - 0;
      }

      if (checked) {
        const availableCentralDivWidth =
          parseFloat($(".plotDivPrint").css("width")) -
          leftSidebarWidth -
          rightSidebarWidth -
          leftAxisWidth -
          legendWidth -
          rightAxisWidth;

        const availableCentralDivHeight =
          parseFloat($(".plotDivPrint").css("height")) -
          footerHeight -
          bottomAxisHeight -
          topAxisHeight -
          titleHeight -
          plot.tbar.tbarHeight;
        -bottomAxisHeight - topAxisHeight - footerHeight - titleHeight;
        let centralDivOneToOneDimension = availableCentralDivHeight;
        if (availableCentralDivHeight > availableCentralDivWidth) {
          centralDivOneToOneDimension = availableCentralDivWidth;
        }
        const percentW =
          (100 *
            (centralDivOneToOneDimension +
              leftAxisWidth +
              rightAxisWidth +
              legendWidth)) /
          plotDivContainerSize.width;
        const percentH =
          (100 *
            (centralDivOneToOneDimension +
              footerHeight +
              bottomAxisHeight +
              topAxisHeight +
              titleHeight)) /
          plotDivContainerSize.height;
        plotDiv.css("width", percentW + "%");
        plotDiv.css("height", percentH + "%");
        // plotDiv.css("width", centralDivOneToOneDimension + leftAxisWidth + rightAxisWidth);
        // plotDiv.css("height", centralDivOneToOneDimension + footerHeight + bottomAxisHeight + topAxisHeight + titleHeight);

        const plotItems = plot.itemList();
        for (let index = 0; index < plotItems.length; index++) {
          const plotItem = plotItems[index];
          adjustPlotItemAxis(plotItem);
        }
        //doAdjust = true;
        //doAdjustPlotDiv();
        if (plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length > 0)
          adjustScales();

        self.rightAxisEnabled = plot.axisEnabled(1);
        self.topAxisEnabled = plot.axisEnabled(3);

        plot.enableAxis(1, false);
        plot.enableAxis(3, false);

        //Toggling the Auto is somehow required
        const on = plot.tbar.isButtonChecked("Auto");
        if (on) {
          plot.tbar.setButtonCheck("Auto", false);
          plot.tbar.setButtonCheck("Auto", true);
        }
      } else {
        const availablePlotDivWidth =
          parseFloat($(".plotDivPrint").css("width")) -
          leftSidebarWidth -
          rightSidebarWidth -
          12;

        let percentW =
          (100 * availablePlotDivWidth) / plotDivContainerSize.width;
        plotDiv.css("width", percentW + "%");
        let percentH =
          98 - (100 * plot.tbar.tbarHeight) / plotDivContainerSize.height;
        plotDiv.css("height", percentH + "%");

        restorePlotItemAxis();
        plot.enableAxis(1, self.rightAxisEnabled);
        plot.enableAxis(3, self.topAxisEnabled);
        doAdjust = false;

        // const autoScale = plot.tbar.isButtonChecked(plot.tbar.auto);
        // if (autoScale) {
        //   Utility.setAutoScale(plot, false);
        //   Utility.setAutoScale(plot, true);
        //   plot.tbar.setButtonCheck(plot.tbar.auto, true);
        // }
      }
      if (trigger) {
        Static.trigger("aspectRatioChanged", checked);
      }
      plot.autoRefresh();
    }

    this.aspectRatioUpdate = function () {
      aspectRatio(Static.aspectRatioOneToOne, false);
    };

    Static.bind(
      "showSidebar legendEnabled titleVisible titleAdded footerAdded footerVisible axisEnabled",
      (e, m_anchorPosition, on) => {
        if (plot.leftSidebar && plot.rightSidebar) {
          if (Static.aspectRatioOneToOne) {
            aspectRatio(true);
          }
        }
      }
    );

    $(window).resize(function () {
      if (Static.aspectRatioOneToOne) {
        aspectRatio(true);
      }
    });
    ///////////
    ///////////////
    //////////////////

    Static.bind("aspectRatioChanged", function () {
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      if (!Static.aspectRatioOneToOne) {
        if (plot.tbar.isButtonChecked(plot.tbar.auto))
          Utility.setAutoScale(plot, true);
        plot.tbar.showDropdownItem("View", 2);
        plot.tbar.showDropdownItem("View", 3);
      } else {
        plot.tbar.hideDropdownItem("View", 2);
        plot.tbar.hideDropdownItem("View", 3);
        Utility.setAutoScale(plot, true);
        adjustScales();
      }
      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    });

    Static.bind("autoScalingEnabled", function (e, auto) {
      if (Static.aspectRatioOneToOne && auto) {
        adjustScales();
      }
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (!Static.dicontinuityUserSetting) {
        const plotCurves = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
        let _val = Number.MIN_VALUE;
        if (plotCurves.length == 0) {
          _val = 2;
        } else {
          for (let i = 0; i < plotCurves.length; i++) {
            const v = plotCurves[i].dataSize() * (1 / 100);
            _val = v > _val ? v : _val;
          }
        }
        dicontinuityOffsetFactor.val(_val);
        Static.dicontinuityOffsetFactor = _val / Static.dicontinuityFactor;
      }
      if (!on) {
        plotItemMap.delete(plotItem);
      }
      if (!Static.aspectRatioOneToOne) return;
      const doAutoReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      //doAdjustPlotDiv();
      if (
        on &&
        plot.itemList(/* PlotItem.RttiValues.Rtti_PlotCurve */).length > 0
      ) {
        adjustPlotItemAxis(plotItem);

        if (
          plot.itemList(/* PlotItem.RttiValues.Rtti_PlotCurve */).length == 1
        ) {
          // aspectRatio(false);
          // aspectRatio(true);
        }

        //if (plotItem instanceof MyCurve) {
        //Utility.setAutoScale(plot, true);
        adjustScales();
        //}
      }
      if (!on) {
        if (
          plot.itemList(/* PlotItem.RttiValues.Rtti_PlotCurve */).length == 0
        ) {
          aspectRatio(true);
        } else {
          if (plot.tbar.isButtonChecked(plot.tbar.auto)) {
            Utility.setAutoScale(plot, true);
            adjustScales();
          }
        }
      }
      plot.setAutoReplot(doAutoReplot);
      plot.autoRefresh();

      if (
        !Static.dicontinuityUserSetting &&
        plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length == 0
      ) {
        dicontinuityOffsetFactor.val(2);
        Static.dicontinuityOffsetFactor = 2 / Static.dicontinuityFactor;
      }
    });

    Static.bind("visibilityChange", function (e, plotItem, visible) {
      if (Static.aspectRatioOneToOne) {
        if (plot.tbar.isButtonChecked(plot.tbar.auto)) {
          if (
            plotItem instanceof MyCurve ||
            plotItem instanceof Spectrogram ||
            plotItem instanceof SpectroCurve
          ) {
            Utility.setAutoScale(plot, true);
            adjustScales();
          }
        }
      }
    });

    function plotTitleTitle(title) {
      plot.setTitle(title);
    }
    function plotTitleFont(index) {
      var font = plot.titleFont();
      font.name = PropertiesPane.fontGroup(index);
      plot.setTitleFont(font);
    }
    function plotTitlePoint(val) {
      var font = plot.titleFont();
      font.th = val;
      plot.setTitleFont(font);
    }
    function plotTitleColor(color) {
      var font = plot.titleFont();
      font.fontColor = color;
      plot.setTitleFont(font);
    }
    function plotTitleBold(checked) {
      var font = plot.titleFont();
      if (checked) {
        font.weight = "bold";
      } else {
        font.weight = "normal";
      }
      plot.setTitleFont(font);
    }
    function plotFooterFooter(footer) {
      plot.setFooter(footer);
    }
    function plotFooterFont(index) {
      var font = plot.footerFont();
      font.name = PropertiesPane.fontGroup(index);
      plot.setFooterFont(font);
    }
    function plotFooterPoint(val) {
      var font = plot.footerFont();
      font.th = val;
      plot.setFooterFont(font);
    }
    function plotFooterColor(color) {
      var font = plot.footerFont();
      font.fontColor = color;
      plot.setFooterFont(font);
    }
    function plotFooterBold(checked) {
      var font = plot.footerFont();
      if (checked) {
        font.weight = "bold";
      } else {
        font.weight = "normal";
      }
      plot.setFooterFont(font);
    }
    function plotBackground(color) {
      plot.setPlotBackground(color);
    }
    function plotLegendBackground(color) {
      var table = plot.getLayout().getLegendDiv().children()[0];
      $(table).css("background-color", color);
    }
    function plotLegendShowLine(checked) {
      Static.showline = checked;
    }
    function plotLegendShowSymbol(checked) {
      Static.showsymbol = checked;
    }

    //////
    function plotLegendFont(index) {
      var font = plot.legendFont();
      font.name = PropertiesPane.fontGroup(index);
      plot.setLegendFont(font);
    }
    function plotLegendPoint(val) {
      var font = plot.legendFont();
      font.th = parseInt(val);
      plot.setLegendFont(font);
    }
    function plotLegendColor(color) {
      var font = plot.legendFont();
      font.fontColor = color;
      plot.setLegendFont(font);
    }
    function plotLegendBold(checked) {
      var font = plot.legendFont();
      if (checked) {
        font.weight = "bold";
      } else {
        font.weight = "normal";
      }
      plot.setLegendFont(font);
    }

    function decimalExpontsLegend(checked) {
      Static.useDecimal = checked;
    }

    function showTooltipLegend(checked) {
      Static.showTooltipLegend = checked;

      if (checked) {
        self.show("tooltipLegendBackground");
        self.show("tooltipLegendPoint");
        self.show("tooltipLegendColor");
      } else {
        self.hide("tooltipLegendBackground");
        self.hide("tooltipLegendPoint");
        self.hide("tooltipLegendColor");
      }
    }

    function tooltipLegendBackground(color) {
      $("#legendDiv")[0].style.setProperty("--tooltip-bg-color", color);
    }

    function tooltipLegendPoint(val) {
      const th = parseInt(val);
      $("#legendDiv")[0].style.setProperty("--tooltip-font-size", th + "px");
    }
    function tooltipLegendColor(color) {
      $("#legendDiv")[0].style.setProperty("--tooltip-color", color);
    }

    /**************************************Scale Settings Properties Callbacks*****************************/
    //helpers
    function setAxisTitleFont() {
      //helper
      var axisLabelFont = plot.axisLabelFont(Axis.AxisId.xBottom);
      var axisTitleFont = plot.axisTitleFont(Axis.AxisId.xBottom);
      axisLabelFont.th = axisTitleFont.th * 0.86;
      setAxisLabelFont();
      plot.setAxisTitleFont(Axis.AxisId.xBottom, axisTitleFont);
      plot.setAxisTitleFont(Axis.AxisId.xTop, axisTitleFont);
      plot.setAxisTitleFont(Axis.AxisId.yLeft, axisTitleFont);
      plot.setAxisTitleFont(Axis.AxisId.yRight, axisTitleFont);
    }
    function setAxisLabelFont() {
      plot.setAxisLabelFont(Axis.AxisId.xBottom, axisLabelFont);
      plot.setAxisLabelFont(Axis.AxisId.xTop, axisLabelFont);
      plot.setAxisLabelFont(Axis.AxisId.yLeft, axisLabelFont);
      plot.setAxisLabelFont(Axis.AxisId.yRight, axisLabelFont);
    }

    function bottomScaleTitle(title) {
      plot.setAxisTitle(Axis.AxisId.xBottom, title);
    }
    function topScaleTitle(title) {
      plot.setAxisTitle(Axis.AxisId.xTop, title);
    }
    function leftScaleTitle(title) {
      plot.setAxisTitle(Axis.AxisId.yLeft, title);
    }
    function rightScaleTitle(title) {
      plot.setAxisTitle(Axis.AxisId.yRight, title);
    }

    function scaleTitleFont(index) {
      var font = plot.axisTitleFont(Axis.AxisId.xBottom);
      font.name = PropertiesPane.fontGroup(index);
      plot.setAxisTitleFont(Axis.AxisId.xBottom, font);
      plot.setAxisTitleFont(Axis.AxisId.xTop, font);
      plot.setAxisTitleFont(Axis.AxisId.yLeft, font);
      plot.setAxisTitleFont(Axis.AxisId.yRight, font);
    }
    function scaleTitlePoint(val) {
      var font = plot.axisTitleFont(Axis.AxisId.xBottom);
      font.th = parseInt(val); // * 0.86;
      plot.setAxisTitleFont(Axis.AxisId.xBottom, font);
      plot.setAxisTitleFont(Axis.AxisId.xTop, font);
      plot.setAxisTitleFont(Axis.AxisId.yLeft, font);
      plot.setAxisTitleFont(Axis.AxisId.yRight, font);
    }
    function scaleTitleColor(color) {
      var font = plot.axisTitleFont(Axis.AxisId.xBottom);
      font.fontColor = color;
      plot.setAxisTitleFont(Axis.AxisId.xBottom, font);
      plot.setAxisTitleFont(Axis.AxisId.xTop, font);
      plot.setAxisTitleFont(Axis.AxisId.yLeft, font);
      plot.setAxisTitleFont(Axis.AxisId.yRight, font);
    }
    function scaleTitleBold(checked) {
      var font = plot.axisTitleFont(Axis.AxisId.xBottom);
      if (checked) {
        font.weight = "bold";
      } else {
        font.weight = "normal";
      }
      plot.setAxisTitleFont(Axis.AxisId.xBottom, font);
      plot.setAxisTitleFont(Axis.AxisId.xTop, font);
      plot.setAxisTitleFont(Axis.AxisId.yLeft, font);
      plot.setAxisTitleFont(Axis.AxisId.yRight, font);
    }

    /////////////
    function scaleLabelFont(index) {
      var font = plot.axisLabelFont(Axis.AxisId.xBottom);
      font.name = PropertiesPane.fontGroup(index);
      plot.setAxisLabelFont(Axis.AxisId.xBottom, font);
      plot.setAxisLabelFont(Axis.AxisId.xTop, font);
      plot.setAxisLabelFont(Axis.AxisId.yLeft, font);
      plot.setAxisLabelFont(Axis.AxisId.yRight, font);
    }
    function scaleLabelPoint(val) {
      var font = plot.axisLabelFont(Axis.AxisId.xBottom);
      font.th = parseInt(val); // * 0.86;
      plot.setAxisLabelFont(Axis.AxisId.xBottom, font);
      plot.setAxisLabelFont(Axis.AxisId.xTop, font);
      plot.setAxisLabelFont(Axis.AxisId.yLeft, font);
      plot.setAxisLabelFont(Axis.AxisId.yRight, font);
    }
    function scaleLabelColor(color) {
      var font = plot.axisLabelFont(Axis.AxisId.xBottom);
      font.fontColor = color;
      plot.setAxisLabelFont(Axis.AxisId.xBottom, font);
      plot.setAxisLabelFont(Axis.AxisId.xTop, font);
      plot.setAxisLabelFont(Axis.AxisId.yLeft, font);
      plot.setAxisLabelFont(Axis.AxisId.yRight, font);
    }
    function scaleLabelBold(checked) {
      var font = plot.axisLabelFont(Axis.AxisId.xBottom);
      if (checked) {
        font.weight = "bold";
      } else {
        font.weight = "normal";
      }
      plot.setAxisLabelFont(Axis.AxisId.xBottom, font);
      plot.setAxisLabelFont(Axis.AxisId.xTop, font);
      plot.setAxisLabelFont(Axis.AxisId.yLeft, font);
      plot.setAxisLabelFont(Axis.AxisId.yRight, font);
    }
    ///

    //["NoAttribute", "IncludeReference", "Symmetric", "Floating",  "Inverted"]
    // function scaleAttribute(index) {
    // 	const se = plot.axisScaleEngine(Axis.AxisId.xBottom);
    // 	if(index == 0){
    // 		se.setAttributes(0);
    // 		//se.setAttribute(ScaleEngine.Attributes.NoAttribute, true);
    // 	}
    // 	if(index == 3){
    // 		se.setAttribute(ScaleEngine.Attributes.Floating, true);
    // 	}
    // 	if(index == 4){
    // 		se.setAttribute(ScaleEngine.Attributes.Inverted, true);
    // 	}
    // 	plot.autoRefresh();
    // }

    bottom_log.change(function () {
      bottom_logBase.attr("disabled", false);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.xBottom, new LogScaleEngine());
      //$("#margin_bottom").val(0);
    });
    bottom_logBase.change(function () {
      Static.trigger("invalidateWatch");
      plot.axisScaleEngine(Axis.AxisId.yLeft).setBase($(this).val());
      plot.autoRefresh();
    });
    bottom_linear.change(function () {
      bottom_logBase.attr("disabled", true);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.xBottom, new LinearScaleEngine());
      //Static.trigger("invalidateWatch");
      //Static.trigger("curveAdjusted");
      //$("#margin_bottom").val(0)
    });

    left_log.change(function () {
      left_logBase.attr("disabled", false);
      // $("#margin_left").val(0)
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.yLeft, new LogScaleEngine());
    });
    $("#left_logBase").change(function () {
      Static.trigger("invalidateWatch");
      m_plot.axisScaleEngine(Axis.AxisId.yLeft).setBase($(this).val());
      m_plot.autoRefresh();
    });
    left_linear.change(function () {
      left_logBase.attr("disabled", true);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.yLeft, new LinearScaleEngine());
      //Static.trigger("invalidateWatch");
      //Static.trigger("curveAdjusted");
      //$("#margin_left").val(0);
    });

    top_log.change(function () {
      top_logBase.attr("disabled", false);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.xTop, new LogScaleEngine());
      //$("#margin_top").val(0)
    });

    top_logBase.change(function () {
      Static.trigger("invalidateWatch");
      plot.axisScaleEngine(Axis.AxisId.yLeft).setBase($(this).val());
      plot.autoRefresh();
    });

    top_linear.change(function () {
      $("#top_logBase").attr("disabled", true);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.xTop, new LinearScaleEngine());
      // $("#margin_top").val(0);
    });

    right_log.change(function () {
      //console.log(44)
      right_logBase.attr("disabled", false);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.yRight, new LogScaleEngine());
      //$("#margin_right").val(0);
    });

    right_logBase.change(function () {
      Static.trigger("invalidateWatch");
      plot.axisScaleEngine(Axis.AxisId.yLeft).setBase($(this).val());
      plot.autoRefresh();
    });

    right_linear.change(function () {
      $("#right_logBase").attr("disabled", true);
      Static.trigger("invalidateWatch");
      plot.setAxisScaleEngine(Axis.AxisId.yRight, new LinearScaleEngine());
      // $("#margin_right").val(0);
    });

    bottom_precision.change(function () {
      plot.setAxisPrecision(Axis.AxisId.xBottom, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
      bottom_min.val(
        parseFloat(bottom_min.val()).toPrecision(
          parseInt(bottom_precision.val())
        )
      );
      bottom_max.val(
        parseFloat(bottom_max.val()).toPrecision(
          parseInt(bottom_precision.val())
        )
      );
    });

    top_precision.change(function () {
      plot.setAxisPrecision(Axis.AxisId.xTop, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
      top_min.val(
        parseFloat(top_min.val()).toPrecision(parseInt(top_precision.val()))
      );
      top_max.val(
        parseFloat(top_max.val()).toPrecision(parseInt(top_precision.val()))
      );
    });
    left_precision.change(function () {
      plot.setAxisPrecision(Axis.AxisId.yLeft, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
      left_min.val(
        parseFloat(left_min.val()).toPrecision(parseInt(left_precision.val()))
      );
      left_max.val(
        parseFloat(left_max.val()).toPrecision(parseInt(left_precision.val()))
      );
    });
    right_precision.change(function () {
      plot.setAxisPrecision(Axis.AxisId.yRight, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
      right_min.val(
        parseFloat(right_min.val()).toPrecision(parseInt(right_precision.val()))
      );
      right_max.val(
        parseFloat(right_max.val()).toPrecision(parseInt(right_precision.val()))
      );
    });

    bottom_decimalPlaces.val(plot.axisDecimalPlaces(Axis.AxisId.xBottom));
    bottom_decimalPlaces.change(function () {
      plot.setAxisDecimalPlaces(Axis.AxisId.xBottom, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
    });

    top_decimalPlaces.val(plot.axisDecimalPlaces(Axis.AxisId.xTop));
    top_decimalPlaces.change(function () {
      plot.setAxisDecimalPlaces(Axis.AxisId.xTop, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
    });

    left_decimalPlaces.val(plot.axisDecimalPlaces(Axis.AxisId.yLeft));
    left_decimalPlaces.change(function () {
      plot.setAxisDecimalPlaces(Axis.AxisId.yLeft, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
    });

    right_decimalPlaces.val(plot.axisDecimalPlaces(Axis.AxisId.yRight));
    right_decimalPlaces.change(function () {
      plot.setAxisDecimalPlaces(Axis.AxisId.yRight, parseInt($(this).val()));
      Static.trigger("invalidateWatch");
      Static.trigger("decimalPlacesChanged");
    });

    function setReadonly(on) {
      bottom_min.attr("disabled", on);
      bottom_max.attr("disabled", on);
      left_min.attr("disabled", on);
      left_max.attr("disabled", on);
      top_min.attr("disabled", on);
      top_max.attr("disabled", on);
      right_min.attr("disabled", on);
      right_max.attr("disabled", on);
    }
    enableUserScale.change(function () {
      setReadonly(!this.checked);
      //Utility.setAutoScale(plot, !this.checked)
      //initLimitsInput();
      if (left_min.val() !== left_max.val())
        plot.setAxisScale(
          Axis.AxisId.yLeft,
          parseFloat(left_min.val()),
          parseFloat(left_max.val())
        );
      if (bottom_min.val() !== bottom_max.val())
        plot.setAxisScale(
          Axis.AxisId.xBottom,
          parseFloat(bottom_min.val()),
          parseFloat(bottom_max.val())
        );
      if (right_min.val() !== right_max.val())
        plot.setAxisScale(
          Axis.AxisId.yRight,
          parseFloat(right_min.val()),
          parseFloat(right_max.val())
        );
      if (top_min.val() !== top_max.val())
        plot.setAxisScale(
          Axis.AxisId.xTop,
          parseFloat(top_min.val()),
          parseFloat(top_max.val())
        );
    });

    Static.bind("autoScaleChanged", function (e, on) {
      setReadonly(on);
      enableUserScale.prop("checked", !on);
    });

    var curve = null;
    Static.bind("itemAttached", function (e, plotItem, on) {
      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        initLimitsInput();
      }
    });

    Static.bind("scaleDivChanged", function (e) {
      initLimitsInput();
    });

    function initLimitsInput() {
      var intv = plot.axisInterval(Axis.AxisId.xBottom);
      bottom_min.val(
        intv.minValue().toPrecision(parseInt(bottom_precision.val()))
      );
      bottom_max.val(
        intv.maxValue().toPrecision(parseInt(bottom_precision.val()))
      );
      intv = plot.axisInterval(Axis.AxisId.yLeft);
      left_min.val(intv.minValue().toPrecision(parseInt(left_precision.val())));
      left_max.val(intv.maxValue().toPrecision(parseInt(left_precision.val())));
      intv = plot.axisInterval(Axis.AxisId.xTop);
      top_min.val(intv.minValue().toPrecision(parseInt(top_precision.val())));
      top_max.val(intv.maxValue().toPrecision(parseInt(top_precision.val())));
      intv = plot.axisInterval(Axis.AxisId.yRight);
      right_min.val(
        intv.minValue().toPrecision(parseInt(right_precision.val()))
      );
      right_max.val(
        intv.maxValue().toPrecision(parseInt(right_precision.val()))
      );
    }
    bottom_min.change(function () {
      if (!math.equal(bottom_min.val(), bottom_max.val()))
        plot.setAxisScale(
          Axis.AxisId.xBottom,
          parseFloat(bottom_min.val()),
          parseFloat(bottom_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          left_min.val() != bottom_min.val()
        ) {
          left_min.val(parseFloat(bottom_min.val()));
          left_min.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          right_min.val() != bottom_min.val()
        ) {
          right_min.val(parseFloat(bottom_min.val()));
          right_min.change();
        }
      }
    });
    bottom_max.change(function () {
      if (!math.equal(bottom_min.val(), bottom_max.val()))
        plot.setAxisScale(
          Axis.AxisId.xBottom,
          parseFloat(bottom_min.val()),
          parseFloat(bottom_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          left_max.val() != bottom_max.val()
        ) {
          left_max.val(parseFloat(bottom_max.val()));
          left_max.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          right_max.val() != bottom_max.val()
        ) {
          right_max.val(parseFloat(bottom_max.val()));
          right_max.change();
        }
      }
    });
    top_min.change(function () {
      if (!math.equal(top_min.val(), top_max.val()))
        plot.setAxisScale(
          Axis.AxisId.xTop,
          parseFloat(top_min.val()),
          parseFloat(top_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          left_min.val() != top_min.val()
        ) {
          left_min.val(parseFloat(top_min.val()));
          left_min.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          right_min.val() != top_min.val()
        ) {
          right_min.val(parseFloat(top_min.val()));
          right_min.change();
        }
      }
    });
    top_max.change(function () {
      if (!math.equal(top_min.val(), top_max.val()))
        plot.setAxisScale(
          Axis.AxisId.xTop,
          parseFloat(top_min.val()),
          parseFloat(top_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          left_max.val() != top_max.val()
        ) {
          left_max.val(parseFloat(top_max.val()));
          left_max.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          right_max.val() != top_max.val()
        ) {
          right_max.val(parseFloat(top_max.val()));
          right_max.change();
        }
      }
    });
    left_min.change(function () {
      if (!math.equal(left_min.val(), left_max.val()))
        plot.setAxisScale(
          Axis.AxisId.yLeft,
          parseFloat(left_min.val()),
          parseFloat(left_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          bottom_min.val() != left_min.val()
        ) {
          bottom_min.val(parseFloat(left_min.val()));
          bottom_min.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          top_min.val() != left_min.val()
        ) {
          top_min.val(parseFloat(left_min.val()));
          top_min.change();
        }
      }
    });
    left_max.change(function () {
      if (!math.equal(left_min.val(), left_max.val()))
        plot.setAxisScale(
          Axis.AxisId.yLeft,
          parseFloat(left_min.val()),
          parseFloat(left_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          bottom_max.val() != left_max.val()
        ) {
          bottom_max.val(parseFloat(left_max.val()));
          bottom_max.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yLeft &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          top_max.val() != left_max.val()
        ) {
          top_max.val(parseFloat(left_max.val()));
          top_max.change();
        }
      }
    });
    right_min.change(function () {
      if (!math.equal(right_min.val(), right_max.val()))
        plot.setAxisScale(
          Axis.AxisId.yRight,
          parseFloat(right_min.val()),
          parseFloat(right_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          bottom_min.val() != right_min.val()
        ) {
          bottom_min.val(parseFloat(right_min.val()));
          bottom_min.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          top_min.val() != right_min.val()
        ) {
          top_min.val(parseFloat(right_min.val()));
          top_min.change();
        }
      }
    });
    right_max.change(function () {
      if (!math.equal(right_min.val(), right_max.val()))
        plot.setAxisScale(
          Axis.AxisId.yRight,
          parseFloat(right_min.val()),
          parseFloat(right_max.val())
        );
      const currentCurve = plot.rv.currentCurve();
      if (Static.aspectRatioOneToOne && currentCurve) {
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xBottom &&
          bottom_max.val() != right_max.val()
        ) {
          bottom_max.val(parseFloat(right_max.val()));
          bottom_max.change();
        }
        if (
          currentCurve.yAxis() == Axis.AxisId.yRight &&
          currentCurve.xAxis() == Axis.AxisId.xTop &&
          top_max.val() != right_max.val()
        ) {
          top_max.val(parseFloat(right_max.val()));
          top_max.change();
        }
      }
    });
    /* exponent_lower.change(function () {
			plot.setNonExponentNotationLimits(parseFloat($(this).val()), parseFloat(exponent_upper.val()));
		});

		exponent_upper.change(function () {
			plot.setNonExponentNotationLimits(parseFloat(exponent_lower.val()), parseFloat($(this).val()));
		}); */

    margin_left.change(function () {
      var margin = 0;
      var scaleEngine = plot.axisScaleEngine(Axis.AxisId.yLeft);
      if (scaleEngine instanceof LogScaleEngine) {
        var scaleDiv = plot.axisScaleDiv(Axis.AxisId.yLeft);
        //margin = (Static.mLog(scaleEngine.base(), scaleDiv.upperBound()) - Static.mLog(scaleEngine.base(), scaleDiv.lowerBound()))*$(this).val()/100;
        margin = Static.mLog(scaleEngine.base(), $(this).val());
      } else {
        var intvY = plot.axisInterval(Axis.AxisId.yLeft);
        //margin = intvY.width()*$(this).val()/100;
        margin = $(this).val();
      }
      plot.axisScaleEngine(Axis.AxisId.yLeft).setMargins(margin, margin);
      plot.autoRefresh();
    });

    margin_right.change(function () {
      var margin = 0;
      var scaleEngine = plot.axisScaleEngine(Axis.AxisId.yRight);
      if (scaleEngine instanceof LogScaleEngine) {
        var scaleDiv = plot.axisScaleDiv(Axis.AxisId.yRight);
        //margin = (Static.mLog(scaleEngine.base(), scaleDiv.upperBound()) - Static.mLog(scaleEngine.base(), scaleDiv.lowerBound()))*$(this).val()/100;
        margin = Static.mLog(scaleEngine.base(), $(this).val());
      } else {
        var intvY = plot.axisInterval(Axis.AxisId.yRight);
        //margin = intvY.width()*$(this).val()/100;
        margin = $(this).val();
      }
      plot.axisScaleEngine(Axis.AxisId.yRight).setMargins(margin, margin);
      plot.autoRefresh();
    });

    margin_bottom.change(function () {
      var margin = 0;
      var scaleEngine = plot.axisScaleEngine(Axis.AxisId.xBottom);
      if (scaleEngine instanceof LogScaleEngine) {
        var scaleDiv = plot.axisScaleDiv(Axis.AxisId.xBottom);

        margin = Static.mLog(scaleEngine.base(), $(this).val());
      } else {
        var intvY = plot.axisInterval(Axis.AxisId.xBottom);
        //margin = intvY.width()*$(this).val()/100;
        margin = $(this).val();
      }
      plot.axisScaleEngine(Axis.AxisId.xBottom).setMargins(margin, margin);
      plot.autoRefresh();
    });

    margin_top.change(function () {
      var margin = 0;
      var scaleEngine = plot.axisScaleEngine(Axis.AxisId.xTop);
      if (scaleEngine instanceof LogScaleEngine) {
        var scaleDiv = plot.axisScaleDiv(Axis.AxisId.xTop);

        margin = Static.mLog(scaleEngine.base(), $(this).val());
      } else {
        var intvY = plot.axisInterval(Axis.AxisId.xTop);
        //margin = intvY.width()*$(this).val()/100;
        margin = $(this).val();
      }
      plot.axisScaleEngine(Axis.AxisId.xTop).setMargins(margin, margin);
      plot.autoRefresh();
    });

    show_backbone.change(function () {
      Utility.enableComponent(
        plot,
        AbstractScaleDraw.ScaleComponent.Backbone,
        this.checked
      );
    });
    show_ticks.change(function () {
      Utility.enableComponent(
        plot,
        AbstractScaleDraw.ScaleComponent.Ticks,
        this.checked
      );
      tickLengthRow.toggle(this.checked);
    });

    tick_length.change(function () {
      var map = ["small", "medium", "large"];
      Utility.setTickLength(plot, map[$(this)[0].selectedIndex]);
    });
    show_labels.change(function () {
      Utility.enableComponent(
        plot,
        AbstractScaleDraw.ScaleComponent.Labels,
        this.checked
      );
    });
    point_selection.change(function () {
      var index = $(this)[0].selectedIndex;
      if (index == 1) {
        //console.log("remove");
        plot.curveClosestPoint.setCb(function (curve, point) {
          curve.removePoint(point);
        });
      } else if (index == 2) {
        //console.log("modify");
        plot.curveClosestPoint.setCb(function (curve, point) {
          plot.pointEntryDlg.pointEntryCb(
            "Modify/Remove Point",
            plot,
            curve.title(),
            point
          );
        });
      } else {
        //console.log("display");
        plot.curveClosestPoint.setCb(null);
      }
    });
    addRemovePoint.change(function () {
      plot.addRemovePoint.activate(this.checked);
      if (this.checked) {
        //console.log("addRemovePoint on");
        plot.zm.setTrackerMode(Picker.DisplayMode.AlwaysOff);
        plot.curveSelector.abortSelection();
      } else {
        //console.log("addRemovePoint off");
        plot.zm.setTrackerMode(Picker.DisplayMode.ActiveOnly);
      }
      Static.trigger("addRemovePoint", this.checked);
    });
    errorResponse.change(function () {
      var index = $(this)[0].selectedIndex;
      if (index == 1) {
        //console.log("Utility.warn");
        Utility.errorResponse = Utility.warn;
      } else if (index == 0) {
        //console.log("Utility.silentIgnore");
        Utility.errorResponse = Utility.silentIgnore;
        /* } else if (index == 3) {
        //console.log("Utility.warnIgnore");
        Utility.errorResponse = Utility.warnIgnore; */
      } /* else if (index == 1) {
        //index == 0 stopWarn
        //console.log("Utility.adjustDomain");
        Utility.errorResponse = Utility.adjustDomain;
      } */
    });

    Static.bind("currentCurveChanged", function (e, _curve) {
      curve = _curve;
      if (curve) {
        var zoomer = plot.zm;
        if (zoomerAxes[0].checked) {
          zoomer.setAxis(curve.xAxis(), curve.yAxis());
        } else {
          var h = Axis.AxisId.xBottom;
          if (zoomAxisHorizontal[0].selectedIndex == 1) {
            h = Axis.AxisId.xTop;
          }
          var v = Axis.AxisId.yLeft;
          if (zoomAxisVertical[0].selectedIndex == 1) {
            v = Axis.AxisId.yRight;
          }
          zoomer.setAxis(h, v);
        }
      }
      setZoomerAxesInfo();
    });
    /* change via PropertiesPane and via axisDlg respectively */
    Static.bind(
      "curveAxisChangedViaPropertiesPane axisChanged",
      function (e, axis, curve) {
        var zoomer = plot.zm;
        if (zoomerAxes[0].checked) {
          zoomer.setAxis(curve.xAxis(), curve.yAxis());
        } else {
          if (zoomAxisHorizontal[0].selectedIndex == 0) {
            zoomer.setAxis(Axis.AxisId.xBottom, zoomer.yAxis());
          } else {
            zoomer.setAxis(Axis.AxisId.xTop, zoomer.yAxis());
          }
          if (zoomAxisVertical[0].selectedIndex == 0) {
            zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yLeft);
          } else {
            zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yRight);
          }
        }
        setZoomerAxesInfo();
      }
    );

    function zoomerAxisControlsDisabled(on) {
      zoomAxisHorizontal.attr("disabled", on);
      zoomAxisVertical.attr("disabled", on);
    }

    zoomAxisVertical.change(function () {
      var zoomer = plot.zm;
      if ($(this)[0].selectedIndex == 0) {
        zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yLeft);
      } else {
        zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yRight);
      }
      setZoomerAxesInfo();
    });

    zoomAxisHorizontal.change(function () {
      var zoomer = plot.zm;
      if ($(this)[0].selectedIndex == 0) {
        zoomer.setAxis(Axis.AxisId.xBottom, zoomer.yAxis());
      } else {
        zoomer.setAxis(Axis.AxisId.xTop, zoomer.yAxis());
      }
      setZoomerAxesInfo();
    });

    trackerMode.change(function () {
      plot.zm.setTrackerMode($(this)[0].selectedIndex);
      // var zoomer = plot.zm;
      // if ($(this)[0].selectedIndex == 0) {
      //   zoomer.setAxis(Axis.AxisId.xBottom, zoomer.yAxis());
      // } else {
      //   zoomer.setAxis(Axis.AxisId.xTop, zoomer.yAxis());
      // }
      // setZoomerAxesInfo();
    });

    zoomerAxes.click(function () {
      if ($(this)[0].checked) {
        zoomerAxisControlsDisabled(true);
      } else {
        zoomerAxisControlsDisabled(false);
        var zoomer = plot.zm;
        if (zoomAxisHorizontal[0].selectedIndex == 0) {
          zoomer.setAxis(Axis.AxisId.xBottom, zoomer.yAxis());
        } else {
          zoomer.setAxis(Axis.AxisId.xTop, zoomer.yAxis());
        }
        if (zoomAxisVertical[0].selectedIndex == 0) {
          zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yLeft);
        } else {
          zoomer.setAxis(zoomer.xAxis(), Axis.AxisId.yRight);
        }
      }
      setZoomerAxesInfo();
      Static.trigger("zoomAccordingToCurve", $(this)[0].checked);
    });

    function setZoomerAxesInfo() {
      var horizontal = "";
      //zoomAxisHorizontal[0].selectedIndex = 0;
      var vertical = "";
      //zoomAxisVertical[0].selectedIndex = 0;
      var zoomer = plot.zm;
      if (zoomerAxes[0].checked && curve) {
        if (curve.yAxis() == Axis.AxisId.yRight) {
          vertical = "Right";
          zoomAxisVertical[0].selectedIndex = 1;
        } else {
          vertical = "Left";
          zoomAxisVertical[0].selectedIndex = 0;
        }
        if (curve.xAxis() == Axis.AxisId.xTop) {
          horizontal = "Top";
          zoomAxisHorizontal[0].selectedIndex = 1;
        } else {
          horizontal = "Bottom";
          zoomAxisHorizontal[0].selectedIndex = 0;
        }
      } else {
        if (zoomAxisHorizontal[0].selectedIndex == 1) {
          horizontal = "Top";
        } else {
          horizontal = "Bottom";
        }
        if (zoomAxisVertical[0].selectedIndex == 1) {
          vertical = "Right";
        } else {
          vertical = "Left";
        }
      }
      zoomerSettings.html(horizontal + ", " + vertical);
    }
    function setMagnifierAxesInfo() {
      var info = "";
      var left = "";
      var right = "";
      var bottom = "";
      var top = "";
      var magnifier = plot.magnifier;
      if (magnifier.isAxisEnabled(Axis.AxisId.yLeft)) {
        left = "Left";
      }
      if (magnifier.isAxisEnabled(Axis.AxisId.yRight)) {
        right = "Right";
      }
      if (magnifier.isAxisEnabled(Axis.AxisId.xBottom)) {
        bottom = "Bottom";
      }
      if (magnifier.isAxisEnabled(Axis.AxisId.xTop)) {
        top = "Top";
      }

      var previousInfoLength = 0;
      info = info + left;
      if (
        info.length > previousInfoLength &&
        (right.length || bottom.length || top.length)
      )
        info = info + ", ";
      previousInfoLength = info.length;
      info = info + right;
      if (info.length > previousInfoLength && (bottom.length || top.length))
        info = info + ", ";
      previousInfoLength = info.length;
      info = info + bottom;
      if (info.length > previousInfoLength && top.length) info = info + ", ";
      info = info + top;
      if (info == "") info = "No axis enabled";
      magnifierSettings.html(info);
    }
    magnifierLeftAxis.change(function () {
      plot.magnifier.setAxisEnabled(Axis.AxisId.yLeft, this.checked);
      setMagnifierAxesInfo();
    });
    magnifierRightAxis.change(function () {
      plot.magnifier.setAxisEnabled(Axis.AxisId.yRight, this.checked);
      setMagnifierAxesInfo();
    });
    magnifierBottomAxis.change(function () {
      plot.magnifier.setAxisEnabled(Axis.AxisId.xBottom, this.checked);
      setMagnifierAxesInfo();
    });
    magnifierTopAxis.change(function () {
      plot.magnifier.setAxisEnabled(Axis.AxisId.xTop, this.checked);
      setMagnifierAxesInfo();
    });

    function watchShadeIcon(color) {
      var val = 12; //parseFloat($("#sizeSymbol").val());
      var size = new Misc.Size(val, val);
      var height = val;
      var width = val;
      // var graphic = new GraphicUtil.Graphic(null, width, height);
      var graphic = new Graphic(null, width, height);
      var painter = new PaintUtil.Painter(graphic);
      painter.setBrush(new Misc.Brush(color));
      var rc = new Misc.Rect(new Misc.Point(), new Misc.Size(val, val));
      rc.moveCenter(new Misc.Point(val / 2, val / 2));
      painter.drawRect(rc.left(), rc.top(), rc.width(), rc.height());
      painter = null;
      return graphic;
    }

    function setBrushIcon(color) {
      //curvePenIcon_td
      var icon = watchShadeIcon(color);
      if (watchShading[0].children) $(watchShading[0].children[0]).remove();
      if (icon && watchShadeWatchArea[0].checked) icon.setParent(watchShading);
    }

    function setWatchInfo() {
      var info = "";
      var accuracy = "";
      var shade = "No shade";
      if (Static.accuracyFactor == Static.accuracyFactorModerate * 2) {
        accuracy = "Low";
      }
      if (Static.accuracyFactor == Static.accuracyFactorModerate) {
        accuracy = "Moderate";
      }
      if (Static.accuracyFactor == Static.accuracyFactorModerate * 0.01) {
        accuracy = "High";
      }
      if (watchShadeWatchArea[0].checked) {
        shade = "Shade ";
      }
      watchCalculationAccuracy.html(accuracy);
      watchSettings.html(accuracy + "; " + shade);
      if (watchShadeWatchArea[0].checked)
        watchShadeIcon(watchShadeColor.val()).setParent(watchSettings);
    }
    watchCalculationAccuracyLow.change(function () {
      //console.log("Low");
      Static.accuracyFactor = Static.accuracyFactorModerate * 2; //Step is equivalent to 2 px
      setWatchInfo();
      Static.trigger("invalidateWatch");
      Static.trigger("calculationAccuracy");
    });
    watchCalculationAccuracyModerate.change(function () {
      //console.log("Moderate");
      Static.accuracyFactor = Static.accuracyFactorModerate; //Step is equivalent to 1 px
      setWatchInfo();
      Static.trigger("invalidateWatch");
      Static.trigger("calculationAccuracy");
    });
    watchCalculationAccuracyHigh.change(function () {
      //console.log("High");
      Static.accuracyFactor = Static.accuracyFactorModerate * 0.01; //Step is equivalent to 0.01 px
      setWatchInfo();
      Static.trigger("invalidateWatch");
      Static.trigger("calculationAccuracy");
    });
    watchShadeWatchArea.change(function () {
      self.shadeWatchArea = watchShadeWatchArea[0].checked;
      if (self.shadeWatchArea) watchShadeColor.attr("disabled", false);
      else watchShadeColor.attr("disabled", true);
      setWatchInfo();

      setBrushIcon(watchShadeColor.val());
      Static.trigger("shadeWatchArea", self.shadeWatchArea);
    });

    watchShadeColor.change(function () {
      setBrushIcon($(this).val());
      setWatchInfo();
      Static.trigger("curveShapeColorChanged", $(this).val());
    });

    watchShadeAutoScale.change(function () {
      //Static.watchCentroidWithArea = $(this)[0].checked;
      Static.trigger("autoScaleCurveShapeItem", $(this)[0].checked);
    });

    //Static.watchCentroidWithArea = true;
    watchCentroidWithArea.change(function () {
      //Static.watchCentroidWithArea = $(this)[0].checked;
      Static.trigger("watchCentroidWithArea", $(this)[0].checked);
    });

    minor_divisions.change(function () {
      //Static.showsymbol = this.checked
      var value = Math.min(Math.max(2, $(this).val()), 20);
      minor_divisions.val(value);
      //console.log(value)
      plot.setAxisMaxMinor(Axis.AxisId.yLeft, value);
      plot.setAxisMaxMinor(Axis.AxisId.yRight, value);
      plot.setAxisMaxMinor(Axis.AxisId.xTop, value);
      plot.setAxisMaxMinor(Axis.AxisId.xBottom, value);
    });
    major_divisions.change(function () {
      //Static.showsymbol = this.checked
      var value = Math.min(Math.max(1, $(this).val()), 40);
      major_divisions.val(value);
      plot.setAxisMaxMajor(Axis.AxisId.yLeft, $(this).val());
      plot.setAxisMaxMajor(Axis.AxisId.yRight, $(this).val());
      plot.setAxisMaxMajor(Axis.AxisId.xTop, $(this).val());
      plot.setAxisMaxMajor(Axis.AxisId.xBottom, $(this).val());
    });
    minor_line_color.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      grid.setMinorPen(minor_line_color[0].value);
    });
    major_line_color.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      grid.setMajorPen(major_line_color[0].value);
    });
    major_gridLines.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      Utility.majorGridLines(grid, $(this)[0].checked);
      minor_gridLines.attr("disabled", !$(this)[0].checked);
    });
    Static.bind("majorGridLines", function (e, grid, on) {
      major_gridLines[0].checked = on;
      minor_gridLines.attr("disabled", !on);
    });
    minor_gridLines.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      Utility.minorGridLines(grid, $(this)[0].checked);
    }); //gridAxisHorizontal
    Static.bind("minorGridLines", function (e, grid, on) {
      minor_gridLines[0].checked = on;
    });

    /////////////////////////////////////////////////
    Static.bind("currentCurveChanged", function (e, _curve) {
      curve = _curve;
      if (curve) {
        var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
        if (gridAxes[0].checked) {
          grid.setAxes(curve.xAxis(), curve.yAxis());
        } else {
          var h = Axis.AxisId.xBottom;
          if (gridAxisHorizontal[0].selectedIndex == 1) {
            h = Axis.AxisId.xTop;
          }
          var v = Axis.AxisId.yLeft;
          if (gridAxisVertical[0].selectedIndex == 1) {
            v = Axis.AxisId.yRight;
          }
          grid.setAxes(h, v);
        }
      }
      setGridAxesInfo();
    });
    /* change via PropertiesPane and via axisDlg respectively */
    Static.bind(
      "curveAxisChangedViaPropertiesPane axisChanged",
      function (e, axis, curve) {
        var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
        if (gridAxes[0].checked) {
          grid.setAxes(curve.xAxis(), curve.yAxis());
        } else {
          if (gridAxisHorizontal[0].selectedIndex == 0) {
            grid.setAxes(Axis.AxisId.xBottom, grid.yAxis());
          } else {
            grid.setAxes(Axis.AxisId.xTop, grid.yAxis());
          }
          if (zoomAxisVertical[0].selectedIndex == 0) {
            grid.setAxes(grid.xAxis(), Axis.AxisId.yLeft);
          } else {
            grid.setAxes(grid.xAxis(), Axis.AxisId.yRight);
          }
        }
        setGridAxesInfo();
      }
    );

    Static.bind("pSel", function (e, on) {
      if (on) {
        self.show("pointSelected");
        addRemovePoint[0].checked = false;
        addRemovePoint.trigger("change");
        plot.curveSelector.setEnabled(false);
      } else {
        self.hide("pointSelected");
      }
    });

    Static.bind("curveSel", function (e, on) {
      if (on) {
        self.show("pointSelected");
        addRemovePoint[0].checked = false;
        addRemovePoint.trigger("change");
        //plot.curveSelector.setEnabled(false);
      } else {
        self.hide("pointSelected");
      }
    });

    function gridAxisControlsDisabled(on) {
      gridAxisHorizontal.attr("disabled", on);
      gridAxisVertical.attr("disabled", on);
    }

    gridAxisVertical.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      if ($(this)[0].selectedIndex == 0) {
        grid.setAxes(grid.xAxis(), Axis.AxisId.yLeft);
      } else {
        grid.setAxes(grid.xAxis(), Axis.AxisId.yRight);
      }
      setGridAxesInfo();
    });

    gridAxisHorizontal.change(function () {
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      if ($(this)[0].selectedIndex == 0) {
        grid.setAxes(Axis.AxisId.xBottom, grid.yAxis());
      } else {
        grid.setAxes(Axis.AxisId.xTop, grid.yAxis());
      }
      setGridAxesInfo();
    });

    gridAxes.click(function () {
      if ($(this)[0].checked) {
        gridAxisControlsDisabled(true);
      } else {
        gridAxisControlsDisabled(false);
        var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
        if (gridAxisHorizontal[0].selectedIndex == 0) {
          grid.setAxes(Axis.AxisId.xBottom, grid.yAxis());
        } else {
          grid.setAxes(Axis.AxisId.xTop, grid.yAxis());
        }
        if (gridAxisVertical[0].selectedIndex == 0) {
          grid.setAxes(grid.xAxis(), Axis.AxisId.yLeft);
        } else {
          grid.setAxes(grid.xAxis(), Axis.AxisId.yRight);
        }
      }
      setGridAxesInfo();
      Static.trigger("gridlinesAccordingToCurve", $(this)[0].checked);
    });

    function setGridAxesInfo() {
      var horizontal = "";
      //gridAxisHorizontal[0].selectedIndex = 0;
      var vertical = "";
      //gridAxisVertical[0].selectedIndex = 0;
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      if (gridAxes[0].checked && curve) {
        if (curve.yAxis() == Axis.AxisId.yRight) {
          vertical = "Right";
          gridAxisVertical[0].selectedIndex = 1;
        } else {
          vertical = "Left";
          gridAxisVertical[0].selectedIndex = 0;
        }
        if (curve.xAxis() == Axis.AxisId.xTop) {
          horizontal = "Top";
          gridAxisHorizontal[0].selectedIndex = 1;
        } else {
          horizontal = "Bottom";
          gridAxisHorizontal[0].selectedIndex = 0;
        }
      } else {
        if (gridAxisHorizontal[0].selectedIndex == 1) {
          horizontal = "Top";
        } else {
          horizontal = "Bottom";
        }
        if (gridAxisVertical[0].selectedIndex == 1) {
          vertical = "Right";
        } else {
          vertical = "Left";
        }
      }
      gridSettings.html(horizontal + ", " + vertical);
    }
    /////////////////////////////////////////////////////

    function aspectRatioOneToOneFn() {
      /* if (Static.aspectRatioOneToOne) {
        self.hide("scalePositionBottomAttribute");
        self.hide("scalePositionTopAttribute");
        self.hide("scalePositionLeftAttribute");
        self.hide("scalePositionRightAttribute");
      } else {
        self.show("scalePositionBottomAttribute");
        self.show("scalePositionTopAttribute");
        self.show("scalePositionLeftAttribute");
        self.show("scalePositionRightAttribute");
      } */

      //bottom_Reference.attr("disabled", Static.aspectRatioOneToOne);
      bottom_IncludeReference.attr("disabled", Static.aspectRatioOneToOne);
      bottom_Symmetric.attr("disabled", Static.aspectRatioOneToOne);
      bottom_Floating.attr("disabled", Static.aspectRatioOneToOne);
      bottom_Inverted.attr("disabled", Static.aspectRatioOneToOne);

      //top_Reference.attr("disabled", Static.aspectRatioOneToOne);
      top_IncludeReference.attr("disabled", Static.aspectRatioOneToOne);
      top_Symmetric.attr("disabled", Static.aspectRatioOneToOne);
      top_Floating.attr("disabled", Static.aspectRatioOneToOne);
      top_Inverted.attr("disabled", Static.aspectRatioOneToOne);

      //left_Reference.attr("disabled", Static.aspectRatioOneToOne);
      left_IncludeReference.attr("disabled", Static.aspectRatioOneToOne);
      left_Symmetric.attr("disabled", Static.aspectRatioOneToOne);
      left_Floating.attr("disabled", Static.aspectRatioOneToOne);
      left_Inverted.attr("disabled", Static.aspectRatioOneToOne);

      //right_Reference.attr("disabled", Static.aspectRatioOneToOne);
      right_IncludeReference.attr("disabled", Static.aspectRatioOneToOne);
      right_Symmetric.attr("disabled", Static.aspectRatioOneToOne);
      right_Floating.attr("disabled", Static.aspectRatioOneToOne);
      right_Inverted.attr("disabled", Static.aspectRatioOneToOne);

      if (!Static.aspectRatioOneToOne) {
        if (bottom_IncludeReference[0].checked) {
          bottom_Reference.attr("disabled", false);
        } else {
          bottom_Reference.attr("disabled", true);
        }
      } else {
        bottom_Reference.attr("disabled", true);
      }

      if (!Static.aspectRatioOneToOne) {
        if (right_IncludeReference[0].checked) {
          right_Reference.attr("disabled", false);
        } else {
          right_Reference.attr("disabled", true);
        }
      } else {
        right_Reference.attr("disabled", true);
      }

      if (!Static.aspectRatioOneToOne) {
        if (top_IncludeReference[0].checked) {
          top_Reference.attr("disabled", false);
        } else {
          top_Reference.attr("disabled", true);
        }
      } else {
        top_Reference.attr("disabled", true);
      }

      if (!Static.aspectRatioOneToOne) {
        if (left_IncludeReference[0].checked) {
          left_Reference.attr("disabled", false);
        } else {
          left_Reference.attr("disabled", true);
        }
      } else {
        left_Reference.attr("disabled", true);
      }
    }

    Static.bind("aspectRatioChanged", function () {
      aspectRatioOneToOneFn();
    });

    function initControls() {
      aspectRatioOneToOneFn();
      zoomerAxisControlsDisabled(true);
      setZoomerAxesInfo();
      setGridAxesInfo();
      setMagnifierAxesInfo();
      setWatchInfo();
      setBrushIcon(watchShadeColor.val());
      plotTitleTitleSelector.val(plot.title());
      initLimitsInput();
      var grid = plot.itemList(PlotItem.RttiValues.Rtti_PlotGrid)[0];
      //console.log(grid.xMinEnabled())
      minor_gridLines[0].checked = grid.xMinEnabled();
      major_gridLines[0].checked = grid.xEnabled();
      bottomScaleTitle.val(plot.axisTitle(Axis.AxisId.xBottom));
      topScaleTitle.val(plot.axisTitle(Axis.AxisId.xTop));
      leftScaleTitle.val(plot.axisTitle(Axis.AxisId.yLeft));
      rightScaleTitle.val(plot.axisTitle(Axis.AxisId.yRight));

      minor_line_color.val(Utility.colorNameToHex(grid.minorPen()));
      major_line_color.val(Utility.colorNameToHex(grid.majorPen()));
      //console.log(minor_line_color)

      self.hide("pointSelected");
      /* self.hide("lowerLimitY");
      self.hide("upperLimitY");
      self.hide("lowerLimitXY");
      self.hide("upperLimitXY");
      self.hide("color1Min");
      self.hide("color2Max");
      self.hide("threeDType"); */
    }

    initControls();

    // self.hide("pointSelected");
    //self.hide("upperLimit");

    this.setPlotPropertiesSettings = function () {
      const bottom_decimalPlaces_val = localStorage.getItem(
        "DecimalPlacesBottomAxis"
      );
      if (bottom_decimalPlaces_val) {
        bottom_decimalPlaces.val(bottom_decimalPlaces_val);
        bottom_decimalPlaces.trigger("change");
      }
      const top_decimalPlaces_val = localStorage.getItem(
        "DecimalPlacesTopAxis"
      );
      if (top_decimalPlaces_val) {
        top_decimalPlaces.val(top_decimalPlaces_val);
        top_decimalPlaces.trigger("change");
      }
      const left_decimalPlaces_val = localStorage.getItem(
        "DecimalPlacesLeftAxis"
      );
      if (left_decimalPlaces_val) {
        left_decimalPlaces.val(left_decimalPlaces_val);
        left_decimalPlaces.trigger("change");
      }
      const right_decimalPlaces_val = localStorage.getItem(
        "DecimalPlacesRightAxis"
      );
      if (right_decimalPlaces_val) {
        right_decimalPlaces.val(right_decimalPlaces_val);
        right_decimalPlaces.trigger("change");
      }
      const bottom_precision_val = localStorage.getItem("BottomPrecision");
      if (bottom_precision_val) {
        bottom_precision.val(bottom_precision_val);
        bottom_precision.trigger("change");
      }
      const top_precision_val = localStorage.getItem("TopPrecision");
      if (top_precision_val) {
        top_precision.val(top_precision_val);
        top_precision.trigger("change");
      }
      const left_precision_val = localStorage.getItem("LeftPrecision");
      if (left_precision_val) {
        left_precision.val(left_precision_val);
        left_precision.trigger("change");
      }
      const right_precision_val = localStorage.getItem("RightPrecision");
      if (right_precision_val) {
        right_precision.val(right_precision_val);
        right_precision.trigger("change");
      }
      const plot_background_val = localStorage.getItem("PlotBackground");
      if (plot_background_val) {
        plot_background.val(plot_background_val);
        plot_background.trigger("change");
      }

      const expontsLegend = localStorage.getItem("decimalExpontsLegend");
      //console.log(expontsLegend);
      if (expontsLegend === "false") {
        decimal_Exponts_Legend.prop("checked", false);
      } else if (expontsLegend === "true") {
        decimal_Exponts_Legend.prop("checked", true);
      }

      const showTooltip = localStorage.getItem("showTooltipLegend");
      //console.log(showTooltip);
      if (showTooltip === "false") {
        show_Tooltip_Legend.prop("checked", false);
      } else if (showTooltip === "true") {
        show_Tooltip_Legend.prop("checked", true);
      }
    };

    this.savePlotPropertiesSettings = function () {
      localStorage.setItem(
        "DecimalPlacesBottomAxis",
        bottom_decimalPlaces.val()
      );
      localStorage.setItem("DecimalPlacesTopAxis", top_decimalPlaces.val());
      localStorage.setItem("DecimalPlacesLeftAxis", left_decimalPlaces.val());
      localStorage.setItem("DecimalPlacesRightAxis", right_decimalPlaces.val());

      localStorage.setItem("BottomPrecision", bottom_precision.val());
      localStorage.setItem("TopPrecision", top_precision.val());
      localStorage.setItem("LeftPrecision", left_precision.val());
      localStorage.setItem("RightPrecision", right_precision.val());

      localStorage.setItem("PlotBackground", plot_background.val());

      localStorage.setItem("decimalExpontsLegend", Static.useDecimal);
      localStorage.setItem("showTooltipLegend", Static.showTooltipLegend);
    };

    this.restoreDefaults = function () {
      localStorage.setItem("DecimalPlacesBottomAxis", 4);
      localStorage.setItem("DecimalPlacesTopAxis", 4);
      localStorage.setItem("DecimalPlacesLeftAxis", 4);
      localStorage.setItem("DecimalPlacesRightAxis", 4);

      localStorage.setItem("BottomPrecision", 4);
      localStorage.setItem("TopPrecision", 4);
      localStorage.setItem("LeftPrecision", 4);
      localStorage.setItem("RightPrecision", 4);

      localStorage.setItem("PlotBackground", "#ffffc8");

      localStorage.setItem("decimalExpontsLegend", false);
      localStorage.setItem("showTooltipLegend", true);

      //console.log()
      self.setPlotPropertiesSettings();
    };

    Static.bind("beforeunload", function () {
      self.savePlotPropertiesSettings();
    });

    Static.bind("reload", function () {
      self.savePlotPropertiesSettings();
    });

    //
  }
}
