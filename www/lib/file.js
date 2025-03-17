"use strict";

/**
 * @classdesc A abstract base class for drawing scales. It can be used to draw linear or logarithmic scales.
 *
 */
class MFile {
  constructor(plot /* , constructors */) {
    //const curveConstructor = constructors.curveConstructor;
    //const markerConstructor = constructors.markerConstructor;
    const Enum = Enumerator.getDefaultEnumNampespace();
    let Upload = new UpLoad();
    let self = this;
    let _plot = null;

    function get_plotData() {
      ////m__plot.setAxisScaleEngine(Axis.AxisId.yLeft, new LinearScaleEngine())
      let data = [];
      let p = {};
      p.bottomScaleEngineType = _plot
        .axisScaleEngine(Axis.AxisId.xBottom)
        .toString();
      p.leftScaleEngineType = _plot
        .axisScaleEngine(Axis.AxisId.yLeft)
        .toString();
      p.topScaleEngineType = _plot.axisScaleEngine(Axis.AxisId.xTop).toString();
      p.rightScaleEngineType = _plot
        .axisScaleEngine(Axis.AxisId.yRight)
        .toString();
      p.title = _plot.title();
      p.titleFont = _plot.titleFont();
      p.footer = _plot.footer();
      p.footerFont = _plot.footerFont();

      p.axisTitleFont = _plot.axisTitleFont(Axis.AxisId.xBottom);
      p.xBottomAxisTitle = _plot.axisTitle(Axis.AxisId.xBottom);
      p.xTopAxisTitle = _plot.axisTitle(Axis.AxisId.xTop);
      p.yLeftAxisTitle = _plot.axisTitle(Axis.AxisId.yLeft);
      p.yRightAxisTitle = _plot.axisTitle(Axis.AxisId.yRight);

      p.autoScale = _plot.axisAutoScale(Axis.AxisId.xBottom);
      if (!p.autoScale) {
        p.xBottomMin = _plot.axisInterval(Axis.AxisId.xBottom).minValue();
        p.xBottomMax = _plot.axisInterval(Axis.AxisId.xBottom).maxValue();
        p.yLeftMin = _plot.axisInterval(Axis.AxisId.yLeft).minValue();
        p.yLeftMax = _plot.axisInterval(Axis.AxisId.yLeft).maxValue();
        p.xTopMin = _plot.axisInterval(Axis.AxisId.xTop).minValue();
        p.xTopMax = _plot.axisInterval(Axis.AxisId.xTop).maxValue();
        p.yRightMin = _plot.axisInterval(Axis.AxisId.yRight).minValue();
        p.yRightMax = _plot.axisInterval(Axis.AxisId.yRight).maxValue();
      }

      // p.view_0_enabled = _plot.axisEnabled(0);
      // p.view_1_enabled = _plot.axisEnabled(1);
      // p.view_2_enabled = _plot.axisEnabled(2);
      // p.view_3_enabled = _plot.axisEnabled(3);

      p.view_0_enabled = _plot.tbar.isDropdownItemChecked("View", 0);
      p.view_1_enabled = _plot.tbar.isDropdownItemChecked("View", 1);
      p.view_2_enabled = _plot.tbar.isDropdownItemChecked("View", 2);
      p.view_3_enabled = _plot.tbar.isDropdownItemChecked("View", 3);
      p.view_4_enabled = _plot.tbar.isDropdownItemChecked("View", 4);
      p.view_5_enabled = _plot.tbar.isDropdownItemChecked("View", 5);
      p.view_6_enabled = _plot.tbar.isDropdownItemChecked("View", 6);
      p.view_7_enabled = _plot.tbar.isDropdownItemChecked("View", 7);
      p.view_8_enabled = _plot.tbar.isDropdownItemChecked("View", 8);

      p.watch_0_enabled = _plot.tbar.isDropdownItemChecked("Watch", 0);
      p.watch_1_enabled = _plot.tbar.isDropdownItemChecked("Watch", 1);
      p.watch_2_enabled = _plot.tbar.isDropdownItemChecked("Watch", 2);
      p.watch_3_enabled = _plot.tbar.isDropdownItemChecked("Watch", 3);
      p.watch_4_enabled = _plot.tbar.isDropdownItemChecked("Watch", 4);
      p.watch_5_enabled = _plot.tbar.isDropdownItemChecked("Watch", 5);
      p.watch_6_enabled = _plot.tbar.isDropdownItemChecked("Watch", 6);
      p.watch_7_enabled = _plot.tbar.isDropdownItemChecked("Watch", 7);

      p.sideBarVisible = _plot.tbar.isButtonChecked(_plot.sBar);

      p.math_mode = Static.math_mode;

      const rL = _plot.rv._rulerList;

      p.ruler_0_Visibility = rL[0].isVisible();
      p.ruler_1_Visibility = rL[1].isVisible();
      p.ruler_2_Visibility = rL[2].isVisible();
      p.ruler_3_Visibility = rL[3].isVisible();

      p.defines = {};
      if (_plot.defines.definesSize()) {
        p.defines = Object.fromEntries(_plot.defines.getDefinesMap());
      }

      //p.defines = _plot.defines.getDef

      data.push(p);

      //Handle Rtti_PlotCurve
      let list = _plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let i = 0; i < list.length; ++i) {
        data.push(Utility.getPlotCurveData(list[i]));
      }

      //Handle Rtti_PlotMarker
      list = _plot.itemList(PlotItem.RttiValues.Rtti_PlotMarker);
      list = _.filter(list, function (item) {
        return (
          item.rulers === undefined &&
          item.title() !== "ClosestPointMarker123@###" &&
          item.title() !== "cgMarker@12345"
        );
      });
      for (let i = 0; i < list.length; ++i) {
        let d = {};
        d.title = list[i].title();
        d.rtti = PlotItem.RttiValues.Rtti_PlotMarker;
        d.label = list[i].label();
        d.x = list[i].xValue();
        d.y = list[i].yValue();
        d.labelAlignment = list[i].labelAlignment();
        d.labelOrientation = list[i].labelOrientation();
        d.labelFont = list[i].labelFont();
        d.lineStyle = list[i].lineStyle();
        d.linePen = list[i].linePen();

        let sym = list[i].symbol();

        if (sym) {
          d.type = sym.type;
          d.symbolType = sym.style();
          d.symbolWidth = sym.size().width;
          d.symbolHeight = sym.size().height;
          d.symbolPenColor = sym.pen().color;
          d.symbolPenWidth = sym.pen().width;
          d.symbolBrushColor = sym.brush().color;
          d.rotation = sym.rotation && sym.rotation();
        }
        d.xAxis = list[i].xAxis();
        d.yAxis = list[i].yAxis();

        data.push(d);
      }

      //Handle PlotSpectroCurve
      list = _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve);
      for (let i = 0; i < list.length; ++i) {
        let d = {};
        d.title = list[i].title();
        d.rtti = PlotItem.RttiValues.Rtti_PlotSpectroCurve;

        const fn = list[i].fn;
        if (fn) {
          d.functionDlgData = list[i].functionDlgData;
        } else {
          d.samples = list[i].data().samples();
        }
        d.color1 = list[i].color1();
        d.color2 = list[i].color2();
        d.minZ = list[i].minZ;
        d.maxZ = list[i].maxZ;
        //d.samples = list[i].data().samples();
        d.fn = list[i].fn;
        d.penWidth = list[i].penWidth(); //here

        d.xAxis = list[i].xAxis();
        d.yAxis = list[i].yAxis();

        data.push(d);
      }

      //Handle PlotSpectrogram
      list = _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram);
      for (let i = 0; i < list.length; ++i) {
        let d = {};
        d.title = list[i].title();
        d.rtti = PlotItem.RttiValues.Rtti_PlotSpectrogram;

        const fn = list[i].fn;
        if (fn) {
          d.functionDlgData = list[i].functionDlgData;
        } else {
          //d.samples = list[i].data().samples();
        }
        d.fn = list[i].fn;

        d.upload = list[i].upload;
        d.spectrogramData = list[i].spectrogramData; //file data
        const colorMap = list[i].colorMap();
        d.color1 = colorMap.color1();
        d.color2 = colorMap.color2();
        d.showContour = list[i].testDisplayMode(
          PlotSpectrogram.DisplayMode.ContourMode
        );
        d.showSpectrogram = list[i].testDisplayMode(
          PlotSpectrogram.DisplayMode.ImageMode
        );
        d.numberOfContourPlanes = list[i].numberOfContourPlanes();
        data.push(d);
      }
      return data;
    }

    this.getPlotData = function () {
      const _data = get_plotData();
      //console.log(2000, _data);
      return JSON.stringify(_data);
    };

    function saveData(data, fileName) {
      return new Promise(function (resolve, reject) {
        if (!data || !fileName) {
          return reject("Invalid data and (or) filename");
        }
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        let json = JSON.stringify(data),
          blob = new Blob([json], { type: "octet/stream" }),
          url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        resolve(0);
      });
    }

    async function plt(data) {
      try {
        let obj = JSON.parse(data.content);

        let p = obj[0];
        if (p.rightScaleEngineType == "[LogScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.yRight, new LogScaleEngine());
        }
        if (p.leftScaleEngineType == "[LogScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.yLeft, new LogScaleEngine());
        }
        if (p.bottomScaleEngineType == "[LogScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.xBottom, new LogScaleEngine());
        }
        if (p.topScaleEngineType == "[LogScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.xTop, new LogScaleEngine());
        }

        if (p.rightScaleEngineType == "[LinearScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.yRight, new LinearScaleEngine());
        }
        if (p.leftScaleEngineType == "[LinearScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.yLeft, new LinearScaleEngine());
        }
        if (p.bottomScaleEngineType == "[LinearScaleEngine]") {
          _plot.setAxisScaleEngine(
            Axis.AxisId.xBottom,
            new LinearScaleEngine()
          );
        }
        if (p.topScaleEngineType == "[LinearScaleEngine]") {
          _plot.setAxisScaleEngine(Axis.AxisId.xTop, new LinearScaleEngine());
        }

        if (!p.autoScale) {
          _plot.setAxisScale(Axis.AxisId.xBottom, p.xBottomMin, p.xBottomMax);
          _plot.setAxisScale(Axis.AxisId.yLeft, p.yLeftMin, p.yLeftMax);
          _plot.setAxisScale(Axis.AxisId.xTop, p.xTopMin, p.xTopMax);
          _plot.setAxisScale(Axis.AxisId.yRight, p.yRightMin, p.yRightMax);
        } else {
          Utility.setAutoScale(_plot, true);
        }
        //setAutoScale(true)

        _plot.setTitleFont(new Misc.Font(p.titleFont));
        _plot.setFooterFont(new Misc.Font(p.footerFont));
        _plot.setAxisTitleFont(
          Axis.AxisId.xBottom,
          new Misc.Font(p.axisTitleFont)
        );
        _plot.setAxisTitleFont(
          Axis.AxisId.xTop,
          new Misc.Font(p.axisTitleFont)
        );
        _plot.setAxisTitleFont(
          Axis.AxisId.yLeft,
          new Misc.Font(p.axisTitleFont)
        );
        _plot.setAxisTitleFont(
          Axis.AxisId.yRight,
          new Misc.Font(p.axisTitleFont)
        );

        _plot.setTitle(p.title);
        _plot.setFooter(p.footer);
        _plot.setAxisTitle(Axis.AxisId.xBottom, p.xBottomAxisTitle);
        _plot.setAxisTitle(Axis.AxisId.xTop, p.xTopAxisTitle);
        _plot.setAxisTitle(Axis.AxisId.yLeft, p.yLeftAxisTitle);
        _plot.setAxisTitle(Axis.AxisId.yRight, p.yRightAxisTitle);

        const rL = _plot.rv._rulerList;

        rL[0].setVisible(p.ruler_0_Visibility);
        rL[1].setVisible(p.ruler_1_Visibility);
        rL[2].setVisible(p.ruler_2_Visibility);
        rL[3].setVisible(p.ruler_3_Visibility);

        if (p.view_0_enabled === undefined) {
          p.view_0_enabled = true;
        }
        if (p.view_1_enabled === undefined) {
          p.view_1_enabled = true;
        }
        if (p.view_2_enabled === undefined) {
          p.view_2_enabled = false;
        }
        if (p.view_3_enabled === undefined) {
          p.view_3_enabled = false;
        }
        if (p.view_4_enabled === undefined) {
          p.view_4_enabled = true;
        }
        if (p.view_5_enabled === undefined) {
          p.view_5_enabled = true;
        }
        if (p.view_6_enabled === undefined) {
          p.view_6_enabled = true;
        }
        if (p.view_7_enabled === undefined) {
          p.view_7_enabled = true;
        }
        if (p.view_8_enabled === undefined) {
          p.view_8_enabled = true;
        }

        _plot.tbar.setDropdownItemCheck("View", 0, p.view_0_enabled);
        _plot.tbar.setDropdownItemCheck("View", 1, p.view_1_enabled);
        _plot.tbar.setDropdownItemCheck("View", 2, p.view_2_enabled);
        _plot.tbar.setDropdownItemCheck("View", 3, p.view_3_enabled);
        _plot.tbar.setDropdownItemCheck("View", 4, p.view_4_enabled);
        _plot.tbar.setDropdownItemCheck("View", 5, p.view_5_enabled);
        _plot.tbar.setDropdownItemCheck("View", 6, p.view_6_enabled);
        _plot.tbar.setDropdownItemCheck("View", 7, p.view_7_enabled);
        _plot.tbar.setDropdownItemCheck("View", 8, p.view_8_enabled);

        if (p.watch_0_enabled === undefined) {
          p.watch_0_enabled = true;
        }
        if (p.watch_1_enabled === undefined) {
          p.watch_1_enabled = true;
        }
        if (p.watch_2_enabled === undefined) {
          p.watch_2_enabled = true;
        }
        if (p.watch_3_enabled === undefined) {
          p.watch_3_enabled = true;
        }
        if (p.watch_4_enabled === undefined) {
          p.watch_4_enabled = false;
        }
        if (p.watch_5_enabled === undefined) {
          p.watch_5_enabled = false;
        }
        if (p.watch_6_enabled === undefined) {
          p.watch_6_enabled = false;
        }
        if (p.watch_7_enabled === undefined) {
          p.watch_7_enabled = false;
        }

        _plot.tbar.setDropdownItemCheck("Watch", 0, p.watch_0_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 1, p.watch_1_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 2, p.watch_2_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 3, p.watch_3_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 4, p.watch_4_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 5, p.watch_5_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 6, p.watch_6_enabled);
        _plot.tbar.setDropdownItemCheck("Watch", 7, p.watch_7_enabled);

        if (p.defines) {
          const entries = Object.entries(p.defines);
          for (let i = 0; i < entries.length; i++) {
            const element = entries[i];
            await _plot.defines.addDefine(element[0], element[1].value);
          }
        }

        //setMathMode(p.math_mode);
        for (let i = 1; i < obj.length; ++i) {
          if (
            obj[i].rtti == PlotItem.RttiValues.Rtti_PlotCurve &&
            _plot.findPlotCurve(obj[i].title)
          ) {
            Utility.alert(obj[i].title + " already exist");
            //Upload.reset($("#fileInput"));
            return; //false;
          }
        }

        for (let i = 1; i < obj.length; ++i) {
          setMathMode(obj[i].math_mode);
          //Deal with Rtti_PlotCurve
          if (obj[i].rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
            let curve = await Utility.pltPlotCurveData(_plot, obj[i]);
            curve.attach(_plot);
          }

          // if (p.sideBarVisible && !_plot.tbar.isButtonChecked(_plot.sBar)) {
          //   $("#sideBarCheckBoxId").click();
          // }
          _plot.tbar.setButtonCheck(_plot.sBar, p.sideBarVisible);

          //Deal with Rtti_PlotSpectroCurve
          if (obj[i].rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
            //console.log("obj[i].color1, obj[i].color2", obj[i].color1, obj[i].color2)
            let curve = null;
            if (obj[i].fn) {
              curve = _plot.functionDlgCb(obj[i].functionDlgData);
            } else {
              //curve = new curveConstructor(obj[i].title);
              curve = _plot.createCurve(obj[i].rtti, obj[i].title);
              curve.setSamples(obj[i].samples);
            }

            //let curve = new SpectroCurve(obj[i].title);
            curve.setPenWidth(obj[i].penWidth);
            //curve.setSamples(obj[i].samples);
            curve.setColorInterval(obj[i].color1, obj[i].color2);
            curve.setColorRange(new Interval(obj[i].minZ, obj[i].maxZ));
            curve.minZ = obj[i].minZ;
            curve.maxZ = obj[i].maxZ;

            //curve.attach(_plot);
          }

          //Deal with Rtti_PlotSpectrogram
          if (obj[i].rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram) {
            let curve = null;
            if (obj[i].fn) {
              curve = _plot.functionDlgCb(obj[i].functionDlgData);
              curve.setNumberOfContourPlanes(obj[i].numberOfContourPlanes);
              curve.showContour(obj[i].showContour);
              curve.showSpectrogram(obj[i].showSpectrogram);
            } else {
              const displayData = {
                title: obj[i].title,
                color1: obj[i].color1,
                color2: obj[i].color2,
                showContour: obj[i].showContour,
                showSpectrogram: obj[i].showSpectrogram,
                numberOfContourPlanes: obj[i].numberOfContourPlanes,
              };
              _plot.uploadSpectrogram(
                displayData,
                obj[i].spectrogramData,
                obj[i].upload
              );
            }
            curve.attach(_plot);
          }

          //Deal with PlotItem.RttiValues.Rtti_PlotMarker
          if (obj[i].rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
            //let marker = new markerConstructor(obj[i].title);
            let marker = _plot.createCurve(obj[i].rtti, obj[i].title);
            if (obj[i].symbolType !== Symbol2.Style.NoSymbol) {
              let sym = null;
              if (obj[i].type && obj[i].type === "arrow")
                sym = new ArrowSymbol();
              else if (obj[i].type && obj[i].type === "dotOnLine")
                sym = new DotOnLineSymbol();

              if (sym) {
                sym.setSize(
                  new Misc.Size(obj[i].symbolWidth, obj[i].symbolHeight)
                );
                if (sym.setRotation) {
                  sym.setRotation(obj[i].rotation);
                }
                sym.setPen(
                  new Misc.Pen(obj[i].symbolPenColor, obj[i].symbolPenWidth)
                );
                sym.setBrush(new Misc.Brush(obj[i].symbolBrushColor));
                marker.setSymbol(sym);
              }

              marker.setLineStyle(obj[i].lineStyle);
              marker.setLinePen(
                new Misc.Pen(
                  obj[i].linePen.color,
                  obj[i].linePen.width,
                  obj[i].linePen.style
                )
              );
              marker.setAxes(obj[i].xAxis, obj[i].yAxis);
              marker.setValue(obj[i].x, obj[i].y);
              marker.setLabel(obj[i].label);
              marker.setLabelAlignment(obj[i].labelAlignment);
              marker.setLabelOrientation(obj[i].labelOrientation); //Misc.Font = function (th, name, style, weight,fontColor)
              marker.setLabelFont(
                new Misc.Font(
                  obj[i].labelFont.th,
                  obj[i].labelFont.name,
                  obj[i].labelFont.style,
                  obj[i].labelFont.weight,
                  obj[i].labelFont.fontColor
                )
              );
              marker.attach(_plot);
              //
            }
          }
        }

        setMathMode(p.math_mode);

        //Upload.reset($("#fileInput"));
      } catch (error) {
        console.log(error);
      }
    }

    this.setPlotData = function (data, mongo = false) {
      //console.log(1000, data)
      //plt(data);
      this.upload(data, mongo);
    };

    this.init = function (plot) {
      // self = this
      _plot = plot;
      Upload.cb = this.upload;
    };

    this.setInputElement = function (el) {
      Upload.setInputElement(el);
    };

    ////////////////////////////////////////////////////////////////////////////////
    const centralDiv = plot.getLayout().getCentralDiv();

    Utility.dragAndDropFiles(centralDiv, Upload.handleFiles);

    ///////////////////////////////////////////////////////////

    this.upload = function (data, mongo = false) {
      let extension = data.fileName.split(".")[1];
      if (extension === "def") {
        plot.defines.processUploadData({
          fileName: data.fileName,
          content: data.content,
        });
      }
      if (
        extension == "xls" ||
        extension == "xlsx" ||
        extension == "txt" ||
        //extension == "def" ||
        extension == "tbl"
      ) {
        //csv
        let samples = null;
        let csvArray = null;
        if (extension == "xls" || extension == "xlsx") {
          let workbook = XLSX.read(data.content, {
            type: "binary",
          });
          //Fetch the name of First Sheet.
          let firstSheet = workbook.SheetNames[0];

          /* XLSX.utils.sheet_to_csv generates CSV
          XLSX.utils.sheet_to_json generates an array of objects
          XLSX.utils.sheet_to_formulae generates a list of formulae */
          csvArray = Utility.toArrays(
            XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet])
          );
        } else {
          csvArray = Utility.toArrays(data.content);
        }

        if (!csvArray.dataType) {
          //data type not specified. Try to determine type from data traits
          if (csvArray.array.length && csvArray.array[0].hasOwnProperty("z")) {
            //3d data
            // let tempArray = [];
            // for (let i = 0; i < csvArray.array.length; i++) {
            //   tempArray.push(csvArray.array[i].x);
            // }
            let tempArray = csvArray.array.map(function (pt) {
              return pt.x;
            });

            if (tempArray.length === _.uniq(tempArray).length) {
              csvArray.dataType = "spectrocurve";
            } else {
              csvArray.dataType = "spectrogram";
            }
          } else {
            //2 d
            csvArray.dataType = "curve";
          }
        }

        if (csvArray.dataType === "curve") {
          //2 d
          let samples = Utility.makePoints(csvArray.array);
          Static.trigger("addCurve", [data.fileName, samples, true]);
        } else if (csvArray.dataType === "spectrocurve") {
          //3 d
          //let samples = Utility.makeSpectrocurvePoints(csvArray.array);
          Static.trigger("addSpectrocurve", [data.fileName, csvArray, true]);
        } else if (csvArray.dataType === "spectrogram") {
          //3 d
          //let samples = Utility.toArrays(csvArray.array);"#008b8b", "#ff0000"
          Static.trigger("addSpectrogram", [data.fileName, csvArray, true]);
        }
      } else if (extension == "plt") {
        //console.log(100, _plot.rightSidebar)
        let sideBarHidden = false;
        if (_plot.rightSidebar.isSideBarVisible()) {
          _plot.rightSidebar.showSidebar(false);
          //_plot.sidebar.setSidebarReDisplay(true);
          sideBarHidden = true;
        }

        let list = _plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
        let list2 = _plot.itemList(PlotItem.RttiValues.Rtti_PlotMarker);
        let list3 = _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve);
        let list4 = _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram);
        list2 = _.filter(list2, function (item) {
          return (
            item.rulers === undefined &&
            item.title() !== "ClosestPointMarker123@###" &&
            item.title() !== "cgMarker@12345"
          );
        });
        list = list.concat(list2);
        list = list.concat(list3);
        list = list.concat(list4);
        if (list.length) {
          if (!mongo) {
            Utility.alertYesNo(
              "Do you want to save the changes to the Grapher?",
              function (answer) {
                if (answer == Cancel) {
                  //Upload.reset($("#fileInput"));
                  if (sideBarHidden) {
                    _plot.rightSidebar.showSidebar(true);

                    //_plot.sidebar.setSidebarReDisplay(true);
                  }
                  return;
                }
                if (answer == Yes) {
                  function saveCb() {
                    //Upload.reset($("#fileInput"));
                    for (let i = 0; i < list.length; ++i) {
                      list[i].detach();
                      list[i].delete();
                    }
                    plt(data);
                  }
                  self.save(saveCb);
                  // Upload.reset($("#fileInput"));
                  // for (let i = 0; i < list.length; ++i) {
                  //   list[i].detach();
                  //   list[i].delete();
                  // }
                  // plt(data);

                  return;
                }
                if (answer == No) {
                  for (let i = 0; i < list.length; ++i) {
                    list[i].detach();
                    list[i].delete();
                  }
                  plt(data);
                  if (sideBarHidden) {
                    _plot.rightSidebar.showSidebar(true);

                    //_plot.sidebar.setSidebarReDisplay(true);
                  }

                  return;
                }
              }
            );
          } else {
            for (let i = 0; i < list.length; ++i) {
              list[i].detach();
              list[i].delete();
            }
            plt(data);
          }
        } else {
          plt(data);
        }
      } else if (extension == "fnc") {
        let _fndefs = data.content.replace(/\r\n/g, "%").replace(/\s/g, "");
        _fndefs = _fndefs.split("%");
        let fndefs = [];
        for (let i = 0; i < _fndefs.length; i++) {
          if (_fndefs[i].length) fndefs.push(_fndefs[i]);
        }

        let samples = [];
        let curve = null;
        //let title = "";
        let domainRight = undefined;
        const merge = fndefs[0].trim() == "merge";
        //let i = 0;
        if (merge) {
          fndefs.shift();
          fndefs.sort(function (a, b) {
            let domainA = a
              .split("[")[1]
              .replace("]", "")
              .split(",")
              .map(function (val) {
                return parseFloat(val);
              });
            let domainB = b
              .split("[")[1]
              .replace("]", "")
              .split(",")
              .map(function (val) {
                return parseFloat(val);
              });
            return domainA[0] - domainB[0];
          });
        }
        for (let i = 0; i < fndefs.length; i++) {
          const arr = fndefs[i].split("=")[1];
          const variables = fndefs[i]
            .split("=")[0]
            .split("(")[1]
            .replace(")", "")
            .split(",")
            .map(function (v) {
              return v.trim();
            });
          let eq = arr.split("[")[0].trim();
          let domain = arr
            .split("[")[1]
            .replace("]", "")
            .split(",")
            .map(function (val) {
              return parseFloat(val);
            });

          if (domainRight) {
            if (domain[0] < domainRight) {
              domain[0] = domainRight;
            }
          }
          domainRight = domain[1];

          /*
     functionDlgData=
      {
        rtti: PlotItem.RttiValues.Rtti_PlotCurve,
        lowerLimit: undefined, //Number
        upperLimit: undefined, //Number
        threeD: false
        title: null, //String
        variable: null, //String
        fn: null, //String
        expandedFn: null, //String
        numOfPoints: undefined, //Number
        unboundedRange: false, //Boolean
        coeffs: null, //Array
        threeDType: null, //String e.g. "spectrocurve"
        threeDInterpolationType: null, //String e.g. "bilinear"
        lowerLimitY: undefined, //Number
        upperLimitY: undefined, //Number
        lowerLimitFxy: undefined, //Number
        upperLimitFxy: undefined, //Number
        variableY: null, //String
        color1: "#008b8b", //String
        color2: "#ff0000" //String
      }
      */
          const functionDlgData = {
            rtti: PlotItem.RttiValues.Rtti_PlotCurve,
            lowerLimit: domain[0], //Number
            upperLimit: domain[1], //Number
            threeD: false,
            title: Utility.generateCurveName(_plot), //eq + domain[0], //String
            variable: variables[0], //String
            fn: eq, //String
            expandedFn: eq, //String
            numOfPoints: undefined, //Number
            unboundedRange: false, //Boolean
            coeffs: null, //Array
            threeDType: null, //String e.g. "spectrocurve"
            threeDInterpolationType: null, //String e.g. "bilinear"
            lowerLimitY: undefined, //Number
            upperLimitY: undefined, //Number
            lowerLimitFxy: undefined, //Number
            upperLimitFxy: undefined, //Number
            variableY: variables[1], //String
            color1: "#008b8b", //String
            color2: "#ff0000", //String
          };

          if (merge) {
            functionDlgData.numOfPoints = Math.round(100 / (fndefs.length - 1));
          }

          curve = _plot.functionDlgCb(functionDlgData);
          if (merge) {
            samples = samples.concat(curve.data().samples());
            continue;
          } else {
            curve.attach(_plot);
          }
        }
        if (merge) {
          curve.setSamples(samples);
          curve.fn = curve.expandedFn = undefined;
          curve.attach(_plot);
        }
        //Upload.reset($("#fileInput"));
      }
      //Upload.reset($("#fileInput"));
    };

    this.save = function (cb) {
      Utility.prompt(
        "Enter a filename without extensions",
        "plot_1",
        async function (filename) {
          filename += ".plt";
          //console.log(filename)
          //let textFile = new Blob(['Hello Sir'],{type: 'text/plain'})

          let data = get_plotData();
          //console.log(data)
          try {
            await saveData(data, filename);
            if (cb) cb();
          } catch (err) {
            throw err;
          }

          return true;
        },
        "small"
      );
    };

    this.init(plot);

    function setMathMode(mode) {
      if (mode === undefined) {
        mode = "deg";
      }
      let radioButtons = document.getElementsByName("math_mode");
      for (let i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].value === mode) {
          radioButtons[i].checked = true; // Select the radio button with value 'myValue'
          $(radioButtons[i]).trigger("change");
        }
      }
    }
  } //,,,,
}
