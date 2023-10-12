"include ['toolBar', 'curveSettings']";


class MToolBar extends ToolBar {
  constructor(_plot, obj, plotDiv) {
    super(obj, plotDiv);

    var self = this;
    //var _plot = data.plot;

    var watches = new Watches(_plot);
    var m_watchElements = watches.watchElements();

    /* Callbacks */
    /* function addRemovePointCb(checked) {
        _plot.addRemovePoint.activate(checked);
        }  */

    function radioButtonCb(checkedValue) {
      // var myRadio = $("input[name=viewMode]");
      // var checkedValue = myRadio.filter(":checked").val();

      /* if (checkedValue == "Neutral") {
            _plot.pan.setEnabled(false);
            Utility.setAutoScale(_plot, false);
            _plot.zm.setEnabled(false);
            _plot.addRemovePoint.activate(false);
            _plot.rv.preventDragging(false);
            } */

      /* if (checkedValue == "Add/Remove") {
            _plot.pan.setEnabled(false);
            Utility.setAutoScale(_plot, false);
            _plot.zm.setEnabled(false);
            _plot.addRemovePoint.activate(true);
            //_plot.rv.preventDragging(true);
            } */

      //if (checkedValue == Static.getTranslation(document.documentElement.getAttribute("lang"), "Zoom")) {
      if (checkedValue == "Zoom") {
        //_plot.addRemovePoint.activate(false);
        _plot.pan.setEnabled(false);
        Utility.setAutoScale(_plot, false);
        Static.trigger("autoScalingEnabled", false);
        _plot.zm.setEnabled(true);
        _plot.zm.setZoomBase(_plot.zm.scaleRect());

        _plot.curveSelector.abortSelection();
        //_plot.rv.preventDragging(false);
      }
      //if (checkedValue == Static.getTranslation(document.documentElement.getAttribute("lang"), "Pan")) {
      if (checkedValue == "Pan") {
        //_plot.addRemovePoint.activate(false);
        _plot.zm.setEnabled(false);
        _plot.pan.setEnabled(true);
        _plot.curveSelector.abortSelection();

        Utility.setAutoScale(_plot, false);
        Static.trigger("autoScalingEnabled", false);
        //_plot.rv.preventDragging(false);
      }

      //if (checkedValue == Static.getTranslation(document.documentElement.getAttribute("lang"), "Auto")) {
      if (checkedValue == "Auto") {
        //_plot.addRemovePoint.activate(false);
        _plot.pan.setEnabled(false);
        _plot.zm.setEnabled(false);
        Utility.setAutoScale(_plot, true);
        Static.trigger("autoScalingEnabled", true);
        //_plot.rv.preventDragging(false);
      }
    }

    var fnListView = [
      /* function pointSelection(on) {
                _plot.curveClosestPoint.setEnabled(on);
            },  */ function leftAxis(on) {
        _plot.enableAxis(Axis.AxisId.yLeft, on);
      },
      function bottomAxis(on) {
        _plot.enableAxis(Axis.AxisId.xBottom, on);
      },
      function rightAxis(on) {
        _plot.enableAxis(Axis.AxisId.yRight, on);
      },
      function topAxis(on) {
        _plot.enableAxis(Axis.AxisId.xTop, on);
      },
      function majorGridLines(on) {
        Utility.majorGridLines(_plot.grid, on);
        self.enableDropdownItem("View", 5, on);
      },
      function minorGridLines(on) {
        Utility.minorGridLines(_plot.grid, on);
      },
      function titleFn(on) {
        if (on) {
          _plot.showTitle();
        } else {
          _plot.hideTitle();
        }
      },
      function footerFn(on) {
        if (on) {
          _plot.showFooter();
        } else {
          _plot.hideFooter();
        }
      },
      function legendFn(on) {
        _plot.enableLegend(on);
      },
    ];

    Static.bind("majorGridLines", function (e, grid, on) {
      self.setDropdownItemCheck("View", 4, on);
      self.enableDropdownItem("View", 5, on);
    });
    Static.bind("minorGridLines", function (e, grid, on) {
      self.setDropdownItemCheck("View", 5, on);
    });

    function pointEntryFn() {
      _plot.pointEntryDlg.pointEntryCb("Add/Romve Point", _plot);
      //_plot.pointEntryDlg.setDlgTitle("Add/Romve Point")
    }

    var w;
    function calculatorFn() {
      // if (!w || w.closed) {
      //     w = window.open("https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo", "_blank", "width=480,height=345, top=200, left=200");
      // }
      // w.focus();
      window.open("Calculator:///");
    }

    function definesFn(val) {
      _plot.defines.defines(/* _plot */);
    }

    function markerFn(val) {
      _plot.markerDlg.markerCb(_plot);
    }

    function trashFn(val) {
      _plot.trashDlg.trashCb(_plot);
    }

    function functionFn() {
      _plot._functionDlg.functionDlg(Utility.generateCurveName(_plot));
    }

    function zoneFn() {
      console.log(456);
      _plot.zoneDlg.zoneCb(_plot);
    }

    var fnListFile = [
      _plot.file.save,
      /* _plot.curveSettings.curveSettingsDlg, */ /* _plot.settings().settingsDlg, */ functionFn,
      pointEntryFn,
      calculatorFn,
      definesFn,
      markerFn,
      zoneFn,
      _plot.print,
      trashFn,
    ];

    this.addToolButton("dropdown", {
      text: "F&ile",
      //tooltip: "AAA",
      cb: function (e, index) {
        //console.log(index, checked)
        //data.fnList[index]();
        fnListFile[index]();
      },
      listElements: [
        {
          text: "Save",
          icon: "images/save.png",
          tooltip: "Save the current graph.",
        } /*,  {
                    text: "Curve settings",
                    icon: 'images/curveSettings.png',
                    tooltip: "Launches the curve settings dialog."
                } */ /* , {
                    text: "Plot settings",
                    icon: 'images/settings.png',
                    tooltip: "Launches the plot settings dialog."
                } */,
        {
          text: "Curve Function",
          icon: "images/function.png",
          tooltip: "Launches the function dialog.",
        },
        {
          text: "Point entry",
          icon: "images/pointEntry.png",
          tooltip: "Launches the point entry dialog.",
        },
        {
          text: "Calculator",
          icon: "images/calculator.png",
          tooltip: "Launches the calculator.",
        },
        {
          text: "Defines",
          icon: "images/defines.png",
          tooltip: "Launches the defines dialog.",
        },
        {
          text: "Marker",
          icon: "images/marker.png",
          tooltip: "Launches the marker dialog.",
        },
        {
          text: "Zone",
          icon: "images/zone.jfif",
          tooltip: "Adds a zone.",
        },
        {
          text: "Print",
          icon: "images/print.png",
          tooltip: "Print the current graph.",
        },
        {
          text: "Recycle bin",
          icon: "images/trash.png",
          tooltip: "Open the recycle bin.",
        },
      ],
    });

    var cProp = this.addToolButton("checkbox", {
      label: "&C-Prop" /*checked: true,*/,
      cb: function (on) {
        _plot.leftSidebar.showGridItem(0, on);
      },
      tooltip: "Show/Hide curve properties pane",
      disabled: true,
    });

    var pProp = this.addToolButton("checkbox", {
      label: "&P-Prop",
      checked: true,
      cb: function (on) {
        _plot.leftSidebar.showGridItem(1, on);
      },
      tooltip: "Show/Hide plot properties pane",
    });

    Static.bind("showGridItem", function (e, m_anchorPosition, gridIndex, on) {
      if (m_anchorPosition == "left") {
        //if(!on){
        if (gridIndex == 0) self.setButtonCheck(cProp, on);
        else self.setButtonCheck(pProp, on);
        //}
      }
      /* if(gridIndex === 0){
                self.setButtonCheck(cProp, on);
            }else{
                self.setButtonCheck(pProp, on);
            }  */
    });

    this.addToolButton("upload", {
      //text:"Title",
      //cb:uploadFn,
      innerHtmlId: "fileInput",
      class: "btn btn-primary",
      tooltip: "Upload data files",
    });

    let zoom = this.addToolButton("radio", {
      label: "&Zoom",
      tooltip: "Enable zooming. Press the mouse left button and drag.",
      name: "viewMode",
      cb: radioButtonCb,
    });
    this.addToolButton("radio", {
      label: "Pa&n",
      tooltip:
        "Allow dragging of all plot items to new positions. Press the mouse left button and drag.",
      name: "viewMode",
      cb: radioButtonCb,
    });
    self.auto = this.addToolButton("radio", {
      label: "&Auto",
      tooltip:
        "Determine and and apply the scale that\nallows the extent of all curves to be shown.",
      name: "viewMode",
      cb: radioButtonCb,
      checked: true,
    });

    // Static.bind("aspectRatioChanged", function (e, checked) {
    //   if (!checked && Utility.isAutoScale(_plot)) {
    //     Utility.setAutoScale(_plot, false);
    //     Utility.setAutoScale(_plot, true);
    //   }
    // });

    //self.setButtonCheck(auto, false);
    //self.hide(auto);

    this.addToolButton("dropdown", {
      text: "&View",
      //tooltip: "Allow for hiding/showing various components of a plot.",
      hasCheckbox: true,
      cb: function (e, index, checked) {
        //console.log(index, checked)
        //data.fnListView[index](checked);
        fnListView[index](checked);
        Static.trigger("viewChanged", checked);
      },
      listElements: [
        /* {
                    text: "Point selection",
                    icon: "images/pointSelection.png",
                    tooltip: "Turn on point selection. This may affect response." //,
                    //checkboxState: "checked"
                },  */ {
          text: "Left axis",
          icon: "images/axis.png",
          tooltip: "Enable left axis",
          checkboxState: "checked",
        },
        {
          text: "Bottom axis",
          icon: "images/axis.png",
          tooltip: "Enable bottom axis",
          checkboxState: "checked",
        },
        {
          text: "Right axis",
          icon: "images/axis.png",
          tooltip: "Enable right axis",
        },
        {
          text: "Top axis",
          icon: "images/axis.png",
          tooltip: "Enable top axis",
        },
        {
          text: "Major gridlines",
          icon: "images/major_grid.png",
          tooltip: "Enable major gridlines",
          checkboxState: "checked",
        },
        {
          text: "Minor gridlines",
          icon: "images/minor_grid.png",
          tooltip: "Enable minor gridlines",
          checkboxState: "checked",
        },
        {
          text: "Title",
          icon: "images/title.png",
          tooltip: "Enable title",
          checkboxState: "checked",
        },
        {
          text: "Footer",
          icon: "images/footer.png",
          tooltip: "Enable footor",
          checkboxState: "checked",
        },
        {
          text: "Legend",
          icon: "images/legend.png",
          tooltip: "Enable the legend (at least one curve should be present)",
          checkboxState: "checked",
        } /* , {
                    text: "Sidebar",
                    icon: "images/side_bar.png",
                    tooltip: "Display the sidebar"
                } */,
      ],
    });

    var sBar = this.addToolButton("checkbox", {
      label: "&S-Bar",
      innerHtmlId: "sideBarCheckBoxId",
      cb: function (on) {
        if (
          _plot
            .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
            .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
            .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
            .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotZone)).length
        ) {
          //_plot.rightSidebar.showSidebar(on);
          _plot.rightSidebar.showGridItem(0, on);
          _plot.rv.updateWatchesAndTable();
          Static.trigger("resize");
          /* if(!on){
                            _plot.cs.setEnabled(false)
                        } */
          //console.log(458, on)
        }
        if (!on) _plot.sidebar.setSidebarReDisplay(false);
      },
      tooltip: "Show/Hide sidbar",
      disabled: true,
    });
    var pSel = this.addToolButton("checkbox", {
      label: "P-Se&l",
      cb: function (on) {
        _plot.curveClosestPoint.setEnabled(on);
        _plot.curveSelector.abortSelection();
        Static.trigger("pSel", on);
      },
      tooltip:
        'Turn on "Point Selection" and turns off "Add/Remove Point". This may affect response.',
    });

    Static.bind("addRemovePoint curveSel", function (e, on) {
      if (on) {
        self.setButtonCheck(pSel, false);
        _plot.curveClosestPoint.setEnabled(false);
        _plot.plotPropertiesPane.hide("pointSelected");
      }
    });

    this.addToolButton("pushbutton", {
      text: "+",
      icon: "images/zoom_in.png",
      repeat: true,
      tooltip: "Zoom in.\tShift +",
      cb: function (e) {
        var f = 0.98; //0.995; //magnifier.mouseFactor();
        // for (var axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++) {
        //var scaleDiv = _plot.axisScaleDiv(axisId);
        //if (scaleDiv.range() > 0.000000001) {
        _plot.magnifier.rescale(f);
        // }
        // }
      },
    });

    this.addToolButton("pushbutton", {
      text: "-",
      icon: "images/zoom_out.png",
      repeat: true,
      tooltip: "Zoom out.\tShift -",
      cb: function (e) {
        var f = 1 / 0.98; //magnifier.mouseFactor();
        _plot.magnifier.rescale(f);
      },
    });

    this.addToolButton("dropdown", {
      text: "&Watch",
      tooltip: "Enable/disable watches.",
      hasCheckbox: true,
      cb: function (e, index, checked) {
        if (checked && !$("#sideBarCheckBoxId")[0].checked) {
          $("#sideBarCheckBoxId").click();
        }
        _plot.rv.watch(index).setEnable(checked);
        _plot.rv.updateWatchesAndTable();
        Static.trigger("curveAdjusted"); //shapeItem update
      },
      listElements: m_watchElements,
    });

    ///////////////////////////////////////////////////////////////////
    let m_index;

    /* this.addToolButton("dropdown", {
      text: "&Combine",
      tooltip: "Combine functions",
      //hasCheckbox: true,
      cb: function (e, index, checked) {
        if (!_plot.hasVisiblePlotCurve()) {
          Utility.alert("No visible 2D curves", "small");
          return;
        }

        _plot.curveSelector.setEnabled(true);
        _plot.pan.setEnabled(false);
        self.setButtonCheck("Pan", false);
        _plot.zm.setEnabled(false);
        self.setButtonCheck("Zoom", false);

        Static.trigger("curveSel", true);

        if (index == 0) {
          _plot.curveSelector.operationType = "Add";
          //console.log("(f + g)(x)");
        }
        if (index == 1) {
          _plot.curveSelector.operationType = "Subtract";
          //console.log("(f - g)(x)");
        }
        if (index == 2) {
          _plot.curveSelector.operationType = "Multiply";
          //console.log("(f * g)(x)");
        }
        if (index == 3) {
          _plot.curveSelector.operationType = "Divide";
          //console.log("(f / g)(x)");
        }
        if (index == 4) {
          _plot.curveSelector.operationType = "Composite";
        }
        if (index == 5) {
          _plot.curveSelector.operationType = "Join";
        }
        if (index == 6) {
          _plot.curveSelector.operationType = "Join and keep";
        }
      },
      listElements: [
        { text: "(f + g)(x)", tooltip: "Add functions" },
        { text: "(f - g)(x)", tooltip: "Subtract functions" },
        { text: "(f * g)(x)", tooltip: "Multiply functions" },
        { text: "(f / g)(x)", tooltip: "Divide functions" },
        { text: "(f o g)(x)", tooltip: "Composite function" },
        { text: "Join", tooltip: "Join curves" },
        { text: "Join and keep", tooltip: "Join curves and keep segments." },
      ],
    }); */

    function operationPrep(operation) {
      if (!_plot.hasVisiblePlotCurve()) {
        Utility.alert("No visible 2D curves", "small");
        return;
      }
      _plot.curveSelector.setEnabled(true);
      _plot.pan.setEnabled(false);
      self.setButtonCheck("Pan", false);
      _plot.zm.setEnabled(false);
      self.setButtonCheck("Zoom", false);

      Static.trigger("curveSel", true);
      _plot.curveSelector.operationType = operation;
    }

    this.addToolButton("menu", {
      text: "&Operation",
      tooltip: "Function operations",
      menu: [
        {
          name: "Combine",
          subMenu: [
            {
              name: "(f + g)(x)",
              //img: "images/brush.png",
              title: "Add functions",
              fun: function () {
                operationPrep("Add");
              },
            },
            {
              name: "(f - g)(x)",
              //img: "images/brush.png",
              title: "Subtract functions",
              fun: function () {
                operationPrep("Subtract");
              },
            },
            {
              name: "(f * g)(x)",
              //img: "images/brush.png",
              title: "Multiply functions",
              fun: function () {
                operationPrep("Multiply");
              },
            },
            {
              name: "(f / g)(x)",
              //img: "images/brush.png",
              title: "Divide functions",
              fun: function () {
                operationPrep("Divide");
              },
            },
            {
              name: "(f o g)(x)",
              //img: "images/brush.png",
              title: "Composite function",
              fun: function () {
                operationPrep("Composite");
              },
            },
            {
              name: "join",
              subMenu: [
                {
                  name: "Join and discard",
                  //img: "images/brush.png",
                  title: "Join curves and discard segments",
                  fun: function () {
                    operationPrep("Join");
                  },
                },
                {
                  name: "Join and keep",
                  //img: "images/brush.png",
                  title: "Join curves and keep segments.",
                  fun: function () {
                    operationPrep("Join and keep");
                  },
                },
              ],
            },
          ],
        }, ///
        {
          name: "Transform",
          subMenu: [
            {
              name: "Translate",
              //img: "images/brush.png",
              title: "Translate the curve",
              fun: function () {
                operationPrep("Translate");
              },
            },
            {
              name: "Scale",
              //img: "images/brush.png",
              title: "Scale the function",
              fun: function () {
                operationPrep("Scale");
              },
            },
            {
              name: "Reflect",
              subMenu: [
                {
                  name: "over x-axis",
                  //img: "images/brush.png",
                  title: "Reflect the curve over the x-axis",
                  fun: function () {
                    operationPrep("Reflect x-axis");
                  },
                },
                {
                  name: "over y-axis",
                  //img: "images/brush.png",
                  title: "Reflect the curve over the y-axis",
                  fun: function () {
                    operationPrep("Reflect y-axis");
                    //operationPrep("Join and keep");
                  },
                },
                {
                  name: "over x and y-axes",
                  //img: "images/brush.png",
                  title: "Reflect the curve over the x and y-axes",
                  fun: function () {
                    operationPrep("Reflect x and y-axes");
                    //operationPrep("Join and keep");
                  },
                },
              ],
            },
          ],
        },
        {
          name: "Point",
          subMenu: [
            {
              name: "Intersection",
              //img: "images/brush.png",
              title:
                "Find the point of intersection between two curves or two straight lines or a curve and straight line",
              fun: function () {
                operationPrep("Intersection");
              },
            },
            {
              name: "Turning point(s)",
              //img: "images/brush.png",
              title: "Find the turning point(s) in a curve.",
              fun: function () {
                operationPrep("Turning point");
              },
            },
            {
              name: "Inflection point(s)",
              //img: "images/brush.png",
              title: "Find the inflection point(s) in a curve.",
              fun: function () {
                operationPrep("Inflection point");
              },
            },
            {
              name: "Discontinuity point(s)",
              //img: "images/brush.png",
              title: "Find the abscissa values of any discontinuities.",
              fun: function () {
                operationPrep("Discontinuity point");
              },
            },
          ],
        },
        {
          name: "Create table",
          //img: "images/brush.png",
          title: "Create a points table for the curve",
          fun: function () {
            operationPrep("Create table");
          },
        },
        {
          name: "Copy curve",
          //img: "images/brush.png",
          title: "Create a copyy of the curve",
          fun: function () {
            operationPrep("Copy curve");
          },
        },
      ],
    });

    ///////////////////////////////////////////////////////////////////////////////////////////
    this.addToolButton("pushbutton", {
      text: "Mongo-Filesystem",
      //tooltip: "Zoom out",
      class: "mongo-fs-login-logout-register btn btn-primary",
      cb: function () {
        //console.log("Callback called")
      },
    });

    /////////////////////////////////////////////////////////////////////////////////

    //We add the help button last. This way it is always to the right
    this.addToolButton("link", {
      text: "&Help",
      cb: function () {
        //console.log("Callback called")
      },
      //href: 'C:\\Users\\anthony\\Documents\\helpFiles\\_tmphhp\\grapher.chm',
      href: "grapherHelp/Grapher.html",
      //href: 'help.html',
      target: "_blank",
      class: "noSelect",
      tooltip: "Launches online help.",
    });

    Static.bind("showGridItem", function (e, m_anchorPosition, gridIndex, on) {
      if (m_anchorPosition == "right") {
        if (!on) {
          self.setButtonCheck(sBar, false);
          if (_plot.sidebar) _plot.sidebar.setSidebarReDisplay(false);
        }
      }
    });

    Static.bind("visibilityChange", function (e, plotItem, on) {
      if (
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        if (_plot.sidebar) {
          _plot.sidebar.initSidebar();
        }
        if (!_plot.hasVisibleCurveSpectrocurveOrSpectrogram()) {
          //_plot.tbar.setDropdownItemCheck("View", 10, false);
          self.disable(sBar);
          _plot.tbar.hideDropdownItem("View", 10);
          if (_plot.rightSidebar && _plot.rightSidebar.isSideBarVisible()) {
            Utility.alert("Ooops!! Nothing to watch.");
            _plot.rightSidebar.showSidebar(false);
            _plot.sidebar.setSidebarReDisplay(true);
          }
        } else {
          //_plot.tbar.showDropdownItem("View", 10);
          self.enable(sBar);
          if (_plot.sidebar && _plot.sidebar.sidebarReDisplay()) {
            //_plot.tbar.setDropdownItemCheck("View", 10, true);

            _plot.rightSidebar.showSidebar(true);
            //m_sidebarReDisplay = false;
            _plot.sidebar.setSidebarReDisplay(false);
          }
          //Static.trigger("positionChanged"); //force sidebar update
        }
      }
    });

    Static.bind("itemChanged", function (e, plotItem, on) {
      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotGrid) {
        if (!on) {
          _plot.tbar.hideDropdownItem("View", 5);
        } else {
          _plot.tbar.showDropdownItem("View", 5);
        }
      }
    });

    Static.bind("rescaled", function (e, auto) {
      if (!auto) {
        self.setButtonCheck("Auto", false);
      }
    });

    if (_plot.title() == "") {
      self.hideDropdownItem("View", 6);
    }
    Static.bind("titleAdded", function (e, param) {
      //console.log(44, param)
      if (param) {
        self.showDropdownItem("View", 6);
      } else {
        self.hideDropdownItem("View", 6);
      }
    });

    if (_plot.footer() == "") {
      self.hideDropdownItem("View", 7);
    }
    Static.bind("footerAdded", function (e, param) {
      //console.log(44, param)
      if (param) {
        self.showDropdownItem("View", 7);
      } else {
        self.hideDropdownItem("View", 7);
      }
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        if (on) {
          //attached
          if (
            plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
            plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
            plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
          )
            self.enable(sBar);
          self.enable(cProp);
        } else {
          //detached
          if (
            _plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length == 0 &&
            _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve).length ==
              0 &&
            _plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram).length == 0
          ) {
            self.disable(cProp);
          }
          if (
            !_plot
              .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
              .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
              .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
              .concat(_plot.itemList(PlotItem.RttiValues.Rtti_PlotZone)).length
              .length ||
            !_plot.hasVisibleCurveSpectrocurveOrSpectrogram()
          ) {
            self.disable(sBar);
            self.setButtonCheck(sBar, false);
          }
        }
        Static.trigger("visibilityChange", [plotItem, on]);
      }
    });

    Static.bind("showSidebar", function (e, anchorPosition, on) {
      if (anchorPosition !== "right") return;
      self.setButtonCheck(sBar, on);
      //console.log(459, on)
      if (on && _plot.tbar.isDropdownItemChecked("Watch", 6))
        _plot.cs.setEnabled(true);
      else _plot.cs.setEnabled(false);
    });

    /* The following code must be the last part of object construction. This way toolbar height is based on elements added to it. */
    if (_plot.sidebar !== undefined) {
      //sidebar created before toolbar
      //_plot.sidebar.setTop(parseInt($("#toolBar1").css("height")) + 2);
    } else {
      //sidebar created after toolbar. We listen for sidebar creation
      /* Static.bind("sidebarCreated", function (e, sidebar) {
                _plot.sidebar = sidebar;
                sidebar.setTop(parseInt($("#toolBar1").css("height")) + 2);
                Static.unbind("sidebarCreated");
            }); */
    }

    /* $(window).resize(function (e) {
            _plot.sidebar.setTop(parseInt($("#toolBar1").css("height")) + 2);
        }); */

    //this.hideDropdownItem("View", 10);
    //this.setButtonCheck('Auto', false);

    //"https://cah12.github.io/grapher/test.txt"

    /* mongodb://<dbuser>:<dbpassword>@ds023468.mlab.com:23468/cahuserdb
	var level = function(levelIndex, cb){
		//console.log("levelIndex:" + levelIndex);
		$.ajax({
          method: "POST",          
          url: '/level',
          data: {levelIndex: levelIndex},
          success: cb || defaultCb
        });
	}	 */

    /* $.ajaxPrefilter(function(options, originalOptions, jqXHR){
            options.url = 'https://game-service.herokuapp.com' + originalOptions.url;
            //options.url = 'http://localhost:3000' + originalOptions.url;           
        }); */

    function defaultCb(data, status) {
      console.log(status, data);
    }

    /* var level = function(levelIndex, cb){
		//console.log("levelIndex:" + levelIndex);
		$.ajax({
          method: "POST",          
          url: '/level',
          data: {levelIndex: levelIndex},
          success: cb || defaultCb
        });
	} */

    /* this.addToolButton("pushbutton", {
            text: "Test",
            tooltip: "Testing.",
            cb: function (e) {
                
				  $.ajax({
					  //Access-Control-Allow-Origin: https://example.com
					  
					  method: "GET",          
					  url: '/grapher/test.php/?name=tt&address=ttRd',
					  success: function(data, status){
						  console.log(status)
						  console.log(data)
					  }
					});
            }
        }); */
  }
}
