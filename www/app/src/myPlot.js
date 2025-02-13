"include ['myLegend', 'curveClosestPoint', 'plot', 'functionData', 'plotGrid', 'spectrogram']";

"use strict";

/*function decimalPlaces(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
}*/

class MyPlot extends Plot {
  static init() {
    Static.bind("itemAttached", (e, item, on) => {
      if (item == this && on) {
        if (Static.swapAxes == 0) {
          //Implicit
          if (this.xIsDependentVariable) {
            this.swapAxes();
            Static.trigger("axesSwapped", item);
          }
        }
        if (Static.swapAxes == 1) {
          //Do not swap
        }
        if (Static.swapAxes == 2) {
          //Swap
          this.swapAxes();
          Static.trigger("axesSwapped", item);
        }
      }
    });
  }
  constructor(plotDiv, plotTitle) {
    super(plotDiv, plotTitle);

    //fileSystemUIinit();
    this.axesSwapped = false;
    var self = this;
    var m_curveShapeEnabledByPlotSettings = true;

    this.grid = new PlotGrid();

    this.fileSystemServices = null;

    Static.curvePropPane = 0;
    Static.plotPropPane = 1;
    Static.infoPropPane = 2;

    this.grid.attach(this);
    Utility.minorGridLines(this.grid, true);
    //console.log(this.grid)

    this.insertLegend(new MyLegend());
    this.enableLegend(true);

    let entry = "1,1";

    //this.defines = new MDefines(this /* , constructors */);
    this.file = new MFile(this /* , constructors */);

    this.trashDlg = new Trash(this);

    this.transformation = new Transformation(this);

    this.markerDlg = new MMarkerDlg();
    this.pointEntryDlg = new MPointEntryDlg();
    this._functionDlg = new MFunctionDlg(this);

    this.curveFitDlg = new MCurveFitDlg();
    this.curveStyleDlg = new MCurveStyleDlg();
    //this.functionCombinationDlg = new FunctionCombinationDlg(this);
    this.axisDlg = new MAxisDlg();

    this.zoneDlg = new ZoneDlg();
    this.curveAttributeDlg = new MCurveLegendAttributeDlg();

    //this.curveSettings = new MCurveSettings(this);

    let decimalPlacesY = self.axisDecimalPlaces(Axis.AxisId.yLeft);
    let decimalPlacesX = self.axisDecimalPlaces(Axis.AxisId.xBottom);

    function getCoffsVal() {
      var result = [];
      var coeffs = self._functionDlg.coeffs || [];
      for (var i = 0; i < coeffs.length; ++i) {
        result.push(1.0);
      }
      return result;
    }
    this.addCurveInit = function (curve) {
      curve.coeffs = self._functionDlg.coeffs;
      curve.variable = self._functionDlg.variable;
      curve.parametric_variable = self._functionDlg.parametric_variable;
      curve.coeffsVal = getCoffsVal();
      //curve.fn = self._functionDlg.fn;
      curve.fn = self._functionDlg.expandedFn;
      curve.parametricFnX = self._functionDlg.expandedParametricFnX;
      curve.parametricFnY = self._functionDlg.expandedParametricFnY;
      curve.unboundedRange = self._functionDlg.unboundedRange;
      curve.lowerX = parseFloat(self._functionDlg.lowerLimit);
      curve.upperX = parseFloat(self._functionDlg.upperLimit);
      curve.numOfSamples = self._functionDlg.numOfPoints;
    };

    function addCurve(title, samples, upload, fn) {
      if (!samples || samples.length == 0) {
        return null;
      }

      if (self.axesSwapped) {
        samples = samples.map(function (pt) {
          let x = pt.x;
          pt.x = pt.y;
          pt.y = x;
          return pt;
        });
      }
      if (self.findPlotCurve(title)) {
        Utility.alert(title + " already exist");
        return null;
      }

      let curve = new MyCurve(title);

      curve.expandedFn = fn;

      if (!upload) self.addCurveInit(curve);

      curve.setSamples(samples);
      curve.setPen(new Misc.Pen(Utility.randomColor(), 2));
      self.curveAttributeDlg.defaultIconSize = new Misc.Size(
        curve.getLegendIconSize()
      );
      var attribute = "";
      if (Static.showline && Static.showsymbol) {
        attribute = "lineAndSymbol";
      } else if (Static.showline) {
        attribute = "line";
      } else if (Static.showsymbol) {
        attribute = "symbol";
      }
      Utility.setLegendAttribute(curve, attribute, curve.getLegendIconSize()); //attribute = "line" or "symbol" or "lineAndSymbol"

      curve.functionDlgData = getFunctionDlgData(curve.rtti);

      self.rv.setCurrentCurve(curve);
      if (self.sidebar) {
        self.sidebar.initSidebar();
        self.rv.refresh(); //Added 06/17/2020
      }

      return curve;
    }

    function addSpectrocurve(title, color1, color2, _data, upload) {
      var samples, minZ, maxZ;
      if (!upload) {
        samples = _data.data;
        minZ = _data.zLimits.min;
        maxZ = _data.zLimits.max;
      } else {
        samples = _data.array;
        minZ = _data.minZ;
        maxZ = _data.maxZ;
      }
      if (!samples || samples.length == 0) {
        return null;
      }
      if (self.findPlotCurve(title)) {
        Utility.alert(title + " already exist");
        return null;
      }
      var curve = new SpectroCurve(title);
      curve.minZ = minZ;
      curve.maxZ = maxZ;
      curve.setSamples(samples);
      curve.setPenWidth(4);
      curve.setColorInterval(color1, color2);
      curve.setColorRange(new Interval(minZ, maxZ));

      curve.functionDlgData = getFunctionDlgData(curve.rtti);
      if (!upload) curve.fn = curve.functionDlgData.fn;

      //curve.attach(self);
      return curve;
    }

    Static.bind("addSpectrocurve", function (e, fileName, samples, upload) {
      addSpectrocurve(fileName, "red", "green", samples, upload).attach(self);
    });

    function addSpectrogram(title, color1, color2, data, upload) {
      var sgram = new Spectrogram(title);
      sgram.upload = upload;
      sgram.spectrogramData = data;
      if (upload) {
        sgram.setData(new SpectrogramFileData(data));
      } else {
        sgram.setData(new SpectrogramFunctionData(data));
      }

      sgram.setNumberOfContourPlanes(10);
      //sgram.setContourLevels(sgram.calculateContourLevels(10));

      //color1 = color1 || "darkCyan";
      //color2 = color2 || "red";

      //console.log(1000, sgram.colorMap())
      const colorMap = sgram.colorMap();
      colorMap.setColorInterval(color1, color2);
      colorMap.addColorStop(0.1, "cyan");
      colorMap.addColorStop(0.6, "green");
      colorMap.addColorStop(0.95, "yellow");

      //console.log(1000, colorMap)

      // A color bar on the right axis
      /* var rightAxis = self.axisWidget( Axis.AxisId.yRight );
             rightAxis.setTitle( "Intensity" );
             var zInterval = sgram.data().interval( Static.ZAxis );
             self.setAxisScale( Axis.AxisId.yRight, zInterval.minValue(), zInterval.maxValue() );
          	
             self.enableAxis( Axis.AxisId.yRight, true ); */

      sgram.functionDlgData = getFunctionDlgData(sgram.rtti);
      if (!upload) sgram.fn = sgram.functionDlgData.fn;

      //sgram.attach(self); //attach early

      //zoomer.setZoomBase();

      // Static.bind("alphaChanged", function (e, alpha) {
      //   //sgram.invalidateCache()
      //   sgram.setAlpha(alpha);
      // });

      // Static.bind("showSpectrogram", function (e, on) {
      //   sgram.setDisplayMode(PlotSpectrogram.DisplayMode.ImageMode, on);
      //   sgram.setDefaultContourPen(
      //     on ? new Misc.Pen("black", 0) : new Misc.Pen(Static.NoPen)
      //   );
      // });

      // Static.bind("showContour", function (e, on) {
      //   sgram.setDisplayMode(PlotSpectrogram.DisplayMode.ContourMode, on);
      // });

      // Static.bind("numberOfPlanes", function (e, val) {
      //   console.log(4441);
      //   sgram.setContourLevels(sgram.calculateContourLevels(val));
      // });

      //sgram.setAlpha( 50 )
      return sgram;
    }

    this.uploadSpectrogram = function (displayData, spectrogramData, upload) {
      const sgram = addSpectrogram(
        displayData.title,
        displayData.color1,
        displayData.color2,
        spectrogramData,
        upload
      );
      sgram.setNumberOfContourPlanes(displayData.numberOfContourPlanes);
      sgram.showContour(displayData.showContour);
      sgram.showSpectrogram(displayData.showSpectrogram);

      //sgram.attach(self);

      return sgram;
    };

    Static.bind("addSpectrogram", function (e, fileName, samples, upload) {
      const sgram = addSpectrogram(
        fileName,
        "#008b8b",
        "#ff0000",
        samples,
        upload
      );
      sgram.attach(self);
    });

    Static.bind("addCurve", function (e, title, samples, upload, result) {
      if (!samples.length) {
        const uploadStr = upload ? "during upload" : "";
        alert(
          `Failed to generate samples for the curve "${title}" ${uploadStr}.`
        );
        return;
      }
      let curve = addCurve(title, samples, upload);
      curve.attach(self);
    });

    function addUnboundedCurve(title, fn, numOfPoints) {
      if (self.findPlotCurve(title)) {
        Utility.alert(title + " already exist");
        return null;
      }
      //self.setAxisScale(Axis.AxisId.xBottom, 1.0, 10.0);
      self.setAxisScale(
        Axis.AxisId.xBottom,
        self._functionDlg.lowerLimit,
        self._functionDlg.upperLimit
      );
      let curve = new MyCurve(title);
      self.addCurveInit(curve);
      curve.functionData = new FunctionData(fn, numOfPoints);
      //console.log(1000, curve.functionData)
      curve.setData(
        curve.functionData /*  new FunctionData(fn, numOfPoints) */
      );
      curve.setPen(new Misc.Pen(Utility.randomColor(), 2));
      self.curveAttributeDlg.defaultIconSize = new Misc.Size(
        curve.getLegendIconSize()
      );

      if (Static.showline) {
        curve.setLegendAttribute(LegendShowLine, true);
      }
      if (Static.showsymbol) curve.setLegendAttribute(LegendShowSymbol, true);
      //console.log(r)
      //curve.attach(self);

      //setAutoScale(true)
      //Utility.setAutoScale(self, true);

      return curve;
    }

    this.createCurve = function (rtti, title) {
      if (rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        return new MyCurve(title);
      }
      if (rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
        return new PlotMarker(title);
      }
      if (rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        return new SpectroCurve(title);
      }
    };

    function getFunctionDlgData(rtti) {
      let functionDlgData = {};
      functionDlgData.rtti = rtti;
      if (rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        functionDlgData.coeffs = self._functionDlg.coeffs;
        functionDlgData.expandedFn = self._functionDlg.expandedFn;
        functionDlgData.parametricFnX = self._functionDlg.expandedParametricFnX;
        functionDlgData.parametricFnY = self._functionDlg.expandedParametricFnY;
        functionDlgData.fn = self._functionDlg.fn;
        functionDlgData.lowerLimit = self._functionDlg.lowerLimit;
        functionDlgData.numOfPoints = self._functionDlg.numOfPoints;
        functionDlgData.threeD = self._functionDlg.threeD;
        functionDlgData.title = self._functionDlg.title;
        functionDlgData.unboundedRange = self._functionDlg.unboundedRange;
        functionDlgData.upperLimit = self._functionDlg.upperLimit;
        functionDlgData.variable = self._functionDlg.variable;
        functionDlgData.parametric_variable =
          self._functionDlg.parametric_variable;
      }
      if (rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        functionDlgData.color1 = self._functionDlg.color1;
        functionDlgData.color2 = self._functionDlg.color2;
        functionDlgData.expandedFn = self._functionDlg.expandedFn;
        functionDlgData.fn = self._functionDlg.fn;
        functionDlgData.lowerLimit = self._functionDlg.lowerLimit;
        functionDlgData.lowerLimitFxy = self._functionDlg.lowerLimitFxy;
        functionDlgData.lowerLimitY = self._functionDlg.lowerLimitY;
        functionDlgData.numOfPoints = self._functionDlg.numOfPoints;
        functionDlgData.threeD = self._functionDlg.threeD;
        functionDlgData.threeDType = self._functionDlg.threeDType;
        functionDlgData.title = self._functionDlg.title;
        functionDlgData.upperLimit = self._functionDlg.upperLimit;
        functionDlgData.upperLimitFxy = self._functionDlg.upperLimitFxy;
        functionDlgData.upperLimitY = self._functionDlg.upperLimitY;
        functionDlgData.variable = self._functionDlg.variable;
        functionDlgData.variableY = self._functionDlg.variableY;
      }
      if (rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram) {
        functionDlgData.color1 = self._functionDlg.color1;
        functionDlgData.color2 = self._functionDlg.color2;
        functionDlgData.expandedFn = self._functionDlg.expandedFn;
        functionDlgData.fn = self._functionDlg.fn;
        functionDlgData.lowerLimit = self._functionDlg.lowerLimit;
        functionDlgData.lowerLimitFxy = self._functionDlg.lowerLimitFxy;
        functionDlgData.lowerLimitY = self._functionDlg.lowerLimitY;
        functionDlgData.numOfPoints = self._functionDlg.numOfPoints;
        functionDlgData.threeD = self._functionDlg.threeD;
        functionDlgData.threeDInterpolationType =
          self._functionDlg.threeDInterpolationType;
        functionDlgData.threeDType = self._functionDlg.threeDType;
        functionDlgData.title = self._functionDlg.title;
        functionDlgData.upperLimit = self._functionDlg.upperLimit;
        functionDlgData.upperLimitFxy = self._functionDlg.upperLimitFxy;
        functionDlgData.upperLimitY = self._functionDlg.upperLimitY;
        functionDlgData.variable = self._functionDlg.variable;
        functionDlgData.variableY = self._functionDlg.variableY;
      }
      return functionDlgData;
    }

    function setFunctionDlgData(functionDlgData) {
      if (functionDlgData.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        self._functionDlg.coeffs = functionDlgData.coeffs;
        self._functionDlg.expandedFn = functionDlgData.expandedFn;
        //_plot._functionDlg.fn = functionDlgData.fn;
        self._functionDlg.expandedParametricFnX =
          functionDlgData.expandedParametricFnX;
        self._functionDlg.expandedParametricFnY =
          functionDlgData.expandedParametricFnY;
        self._functionDlg.parametricFnX = functionDlgData.parametricFnX;
        self._functionDlg.parametricFnY = functionDlgData.parametricFnY;

        self._functionDlg.lowerLimit = functionDlgData.lowerLimit;
        self._functionDlg.numOfPoints = functionDlgData.numOfPoints;
        self._functionDlg.threeD = functionDlgData.threeD;
        self._functionDlg.title = functionDlgData.title;
        self._functionDlg.unboundedRange = functionDlgData.unboundedRange;
        self._functionDlg.upperLimit = functionDlgData.upperLimit;
        self._functionDlg.variable = functionDlgData.variable;
      }
      if (functionDlgData.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        self._functionDlg.color1 = functionDlgData.color1;
        self._functionDlg.color2 = functionDlgData.color2;
        self._functionDlg.expandedFn = functionDlgData.expandedFn;
        self._functionDlg.fn = functionDlgData.fn;
        self._functionDlg.lowerLimit = functionDlgData.lowerLimit;
        self._functionDlg.lowerLimitFxy = functionDlgData.lowerLimitFxy;
        self._functionDlg.lowerLimitY = functionDlgData.lowerLimitY;
        self._functionDlg.numOfPoints = functionDlgData.numOfPoints;
        self._functionDlg.threeD = functionDlgData.threeD;
        self._functionDlg.threeDType = functionDlgData.threeDType;
        self._functionDlg.title = functionDlgData.title;
        self._functionDlg.upperLimit = functionDlgData.upperLimit;
        self._functionDlg.upperLimitFxy = functionDlgData.upperLimitFxy;
        self._functionDlg.upperLimitY = functionDlgData.upperLimitY;
        self._functionDlg.variable = functionDlgData.variable;
        self._functionDlg.variableY = functionDlgData.variableY;
      }
      if (functionDlgData.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram) {
        self._functionDlg.color1 = functionDlgData.color1;
        self._functionDlg.color2 = functionDlgData.color2;
        self._functionDlg.expandedFn = functionDlgData.expandedFn;
        self._functionDlg.fn = functionDlgData.fn;
        self._functionDlg.lowerLimit = functionDlgData.lowerLimit;
        self._functionDlg.lowerLimitFxy = functionDlgData.lowerLimitFxy;
        self._functionDlg.lowerLimitY = functionDlgData.lowerLimitY;
        self._functionDlg.numOfPoints = functionDlgData.numOfPoints;
        self._functionDlg.threeD = functionDlgData.threeD;
        self._functionDlg.threeDInterpolationType =
          functionDlgData.threeDInterpolationType;
        self._functionDlg.threeDType = functionDlgData.threeDType;
        self._functionDlg.title = functionDlgData.title;
        self._functionDlg.upperLimit = functionDlgData.upperLimit;
        self._functionDlg.upperLimitFxy = functionDlgData.upperLimitFxy;
        self._functionDlg.upperLimitY = functionDlgData.upperLimitY;
        self._functionDlg.variable = functionDlgData.variable;
        self._functionDlg.variableY = functionDlgData.variableY;
      }
    }

    /*
     functionDlgData=
      {
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
    function initializeCoeff(m_fn) {
      let m_fnCpy = m_fn;
      // if (self._functionDlg.expandedParametricFnX === m_fn) {
      //   fnX = true;
      // }
      let coeffs = self._functionDlg.coeffs;

      if (m_fn) {
        m_fn = m_fn.replace(/\s/g, "");
        let fnc = Utility.purgeAndMarkKeywords(m_fn, true);
        for (var i = 0; i < coeffs.length; ++i) {
          let n = fnc.indexOf(coeffs[i]);
          while (
            n > 0 &&
            fnc[n - 1] !== "," &&
            fnc[n - 1] !== "*" &&
            fnc[n - 1] !== "/" &&
            fnc[n - 1] !== "+" &&
            fnc[n - 1] !== "-" &&
            fnc[n - 1] !== "%" &&
            fnc[n - 1] !== "(" &&
            fnc[n - 1] !== "^"
          ) {
            //fnc = fnc.replace(coeffs[i], "*" + coeffs[i]);
            fnc = fnc.replace(coeffs[i], "*" + "~");
            n = fnc.indexOf(coeffs[i], n + 2);
          }
          fnc = fnc.replaceAll("~", coeffs[i]);
        }
        m_fn = Utility.replaceKeywordMarkers(fnc);
        if (self._functionDlg.expandedFn) {
          self._functionDlg.expandedFn = m_fn;
        } else if (
          self._functionDlg.expandedParametricFnX &&
          self._functionDlg.expandedParametricFnY
        ) {
          if (m_fnCpy === self._functionDlg.expandedParametricFnX)
            self._functionDlg.expandedParametricFnX = m_fn;
          if (m_fnCpy === self._functionDlg.expandedParametricFnY)
            self._functionDlg.expandedParametricFnY = m_fn;
        }

        if (coeffs && self._functionDlg.coeffs.length) {
          let _fn = Utility.purgeAndMarkKeywords(m_fn);
          for (var i = 0; i < coeffs.length; ++i) {
            while (_fn.indexOf(coeffs[i]) != -1) {
              _fn = _fn.replace(coeffs[i], 1 + 1e-15); //log(x,a) don't work with a==1;
              //_fn = _fn.replace(coeffs[i], 1);
            }
          }
          m_fn = Utility.replaceKeywordMarkers(_fn);
        }
      }
      return m_fn;
    }

    this.functionDlgCb = async function (
      functionDlgData = null,
      providedFn = null,
      provided_m_lowerX = null,
      provided_m_upperX = null
    ) {
      let newCurve = null;

      if (functionDlgData) {
        setFunctionDlgData(functionDlgData);
      }

      var title = self._functionDlg.title,
        fn = self._functionDlg.expandedFn,
        lowerLimit = self._functionDlg.lowerLimit,
        upperLimit = self._functionDlg.upperLimit,
        numOfPoints = self._functionDlg.numOfPoints;

      //console.log(self._functionDlg.domainRangeRestriction);

      if (
        self._functionDlg.threeD &&
        self._functionDlg.expandedFn != "failedInverse"
      ) {
        //console.log("do 3d")
        if (self._functionDlg.threeDType === "spectrocurve") {
          var s = Utility.makeSamples({
            fx: fn,
            threeD: true,
            variable: self._functionDlg.variable,
            variableY: self._functionDlg.variableY,
            lowerX: parseFloat(self._functionDlg.lowerLimit),
            upperX: parseFloat(self._functionDlg.upperLimit),
            lowerY: parseFloat(self._functionDlg.lowerLimitY),
            upperY: parseFloat(self._functionDlg.upperLimitY),
            numOfSamples: self._functionDlg.numOfPoints,
            ok_fn: self._functionDlg.ok,
          });
          if (!s) {
            return;
          }
          if (s.length == 0) {
            Utility.alert(
              `Unable to derive samples for <b>"${Utility.adjustExpForDecimalPlaces(
                fn,
                decimalPlacesX
              )}"</b>. Check the function for the square-root of a negative, and limits for possible divide-by-zero.`
            );
            //self._functionDlg.close();
            //self._functionDlg.closeDlg = true;
            return;
          }

          newCurve = addSpectrocurve(
            title,
            self._functionDlg.color1,
            self._functionDlg.color2,
            s
          );

          newCurve.latex = self._functionDlg.latex;
          // newCurve.fn = fn;
          // newCurve.functionDlgData = getFunctionDlgData(newCurve.rtti);

          newCurve.attach(self);

          if (newCurve && self._functionDlg.close) {
            //self._functionDlg.close();
            //self._functionDlg.closeDlg = true;
          }
          return newCurve;
        }
        if (self._functionDlg.threeDType === "spectrogram") {
          //var fnData = {fn: "1 / ( v1 * v1 + v2 * v2 )", minX: -1.5, maxX: 1.5, minY: -1.5, maxY: 1.5, minZ: 0, maxZ: 10};
          var fnData = {
            /* fn: self._functionDlg.fn, */ fx: fn,
            variable: self._functionDlg.variable,
            variableY: self._functionDlg.variableY,
            minX: parseFloat(self._functionDlg.lowerLimit),
            maxX: parseFloat(self._functionDlg.upperLimit),
            minY: parseFloat(self._functionDlg.lowerLimitY),
            maxY: parseFloat(self._functionDlg.upperLimitY),
            minZ: parseFloat(self._functionDlg.lowerLimitFxy),
            maxZ: parseFloat(self._functionDlg.upperLimitFxy),
          };
          newCurve = addSpectrogram(
            title,
            self._functionDlg.color1,
            self._functionDlg.color2,
            fnData
          );
          newCurve.latex = self._functionDlg.latex;
          //newCurve.attach(self);
          if (!functionDlgData) newCurve.attach(self);
          // newCurve.fn = fn;
          // newCurve.functionDlgData = getFunctionDlgData(newCurve.rtti);

          if (newCurve && self._functionDlg.close) {
            //self._functionDlg.close();
            //self._functionDlg.closeDlg = true;
          }
        }
        return newCurve;
      }

      /* If we get here, we have a 2D curve*/
      /* let coeffs = self._functionDlg.coeffs;

      if(self._functionDlg.expandedFn){
        self._functionDlg.expandedFn = self._functionDlg.expandedFn.replace(
          /\s/g,
          ""
        );
        let fnc = Utility.purgeAndMarkKeywords(self._functionDlg.expandedFn);
        for (var i = 0; i < coeffs.length; ++i) {
          let n = fnc.indexOf(coeffs[i]);
          while (n > 0 && fnc[n - 1] !== "*" && fnc[n - 1] !== "/" && fnc[n - 1] !== "+" && fnc[n - 1] !== "-" && fnc[n - 1] !== "%") {
            fnc = fnc.replace(
              coeffs[i],
              "*" + coeffs[i]
            );
            n = fnc.indexOf(coeffs[i]);
          }
        }
        fn = self._functionDlg.expandedFn = Utility.replaceKeywordMarkers(fnc);

        if (coeffs && self._functionDlg.coeffs.length) {
          let _fn = Utility.purgeAndMarkKeywords(fn);
          for (var i = 0; i < coeffs.length; ++i) {
            while (_fn.indexOf(coeffs[i]) != -1) {
              _fn = _fn.replace(coeffs[i], 1);
            }
          }
          fn = Utility.replaceKeywordMarkers(_fn);
        }
      } */
      let parametricFnX, parametricFnY;
      if (
        self._functionDlg.expandedFn &&
        self._functionDlg.expandedFn != "failedInverse"
      ) {
        fn = /* self._functionDlg.expandedFn = */ initializeCoeff(
          self._functionDlg.expandedFn
        );
      } else if (
        !functionDlgData &&
        self._functionDlg.expandedParametricFnX &&
        self._functionDlg.expandedParametricFnY &&
        self._functionDlg.expandedFn != "failedInverse"
      ) {
        parametricFnX = initializeCoeff(
          self._functionDlg.expandedParametricFnX
        );
        parametricFnY = initializeCoeff(
          self._functionDlg.expandedParametricFnY
        );
      } else if (
        functionDlgData &&
        functionDlgData.expandedParametricFnX &&
        functionDlgData.expandedParametricFnY
      ) {
        parametricFnX = initializeCoeff(functionDlgData.expandedParametricFnX);
        parametricFnY = initializeCoeff(functionDlgData.expandedParametricFnY);
      }

      let m_lowerX = parseFloat(self._functionDlg.lowerLimit);
      let m_upperX = parseFloat(self._functionDlg.upperLimit);
      if (
        functionDlgData &&
        functionDlgData.expandedParametricFnX &&
        functionDlgData.expandedParametricFnY
      ) {
        m_lowerX = functionDlgData.lowerX;
        m_upperX = functionDlgData.upperX;
      }

      let makeSamplesData = {
        fx: fn,
        parametricFnX,
        parametricFnY,
        parametric_variable: self._functionDlg.parametric_variable,
        variable: self._functionDlg.variable,
        // lowerX: provided_m_lowerX || m_lowerX,
        // upperX: provided_m_upperX || m_upperX,
        lowerX: m_lowerX,
        upperX: m_upperX,
        numOfSamples: self._functionDlg.numOfPoints,
        //ok_fn: self._functionDlg.ok,
        warnIgnoreCb: function () {
          Static.enterButton.click();
        },
      };

      let discont = [];
      ///////////////////////
      try {
        discont = await Utility.discontinuity(
          fn,
          makeSamplesData.lowerX,
          makeSamplesData.upperX,
          self._functionDlg.variable
        );
      } catch (error) {
        discont = [];
      }
      //console.log(discont);
      // discont = discont.sort(function (a, b) {
      //   return a - b;
      // });

      if (self._functionDlg.unboundedRange) {
        newCurve = addUnboundedCurve(title, fn, numOfPoints);
        newCurve.discontinuity = discont;
        //newCurve.setAxis = false;
        newCurve.latex = self._functionDlg.latex;
        newCurve.attach(self);
        if (newCurve && self._functionDlg.close) {
          //self._functionDlg.close();
          //self._functionDlg.closeDlg = true;
        }
      } else {
        if (discont.length && Utility.errorResponse == Utility.adjustDomain) {
          if (discont[0] == makeSamplesData.lowerX && discont.length == 1) {
            makeSamplesData.lowerX =
              discont[0] +
              (makeSamplesData.upperX - makeSamplesData.lowerX) / 300;
          } else if (
            discont[0] == makeSamplesData.lowerX &&
            discont.length > 1
          ) {
            makeSamplesData.lowerX =
              discont[0] +
              (makeSamplesData.upperX - makeSamplesData.lowerX) / 300;
            makeSamplesData.upperX =
              discont[1] -
              (makeSamplesData.upperX - makeSamplesData.lowerX) / 300;
          } else {
            makeSamplesData.upperX =
              discont[0] -
              (makeSamplesData.upperX - makeSamplesData.lowerX) / 300;
          }
        }
        makeSamplesData.discontinuity = discont;
        makeSamplesData.xDecimalPlaces = self.axisDecimalPlaces(
          Axis.AxisId.xBottom
        );

        makeSamplesData.yDecimalPlaces = self.axisDecimalPlaces(
          Axis.AxisId.yLeft
        );

        const samples = Utility.makeSamples(makeSamplesData);

        if (!samples) {
          const mf = $("#fnDlg_function")[0];
          Utility.displayErrorMessage(
            mf,
            `Unable to derive samples for "${Utility.adjustExpForDecimalPlaces(
              fn,
              decimalPlacesX
            )}. (1) Check the function for the square-root of a negative. (2) Check the limits for possible divide-by-zero. (3) Check that values in the domain and range are within [1e-300, 1e+300] and does cause an invalid input such as log or ln of 0 or a negative number. (4) Check that the syntax for "inverse" is correct.`
          );
          return;
        }
        if (samples.length == 0) {
          const mf = $("#fnDlg_function")[0];
          let fn = mf.getValue();
          if (providedFn) {
            fn = providedFn;
          }
          const arr = fn.split("=");
          const { lowerX, upperX, numOfSamples, variable } = makeSamplesData;
          if (
            arr.length == 2 &&
            arr[0].length == 1 &&
            arr[0] == variable &&
            arr[1].length == 4
          ) {
            const s = arr[1];
            if (Utility.isAlpha(s[0]) && s[1] == "(" && s[3] == ")") {
              fn = `${s[0]}^(-1)(${variable})`;
            }
          }
          let decObj = Utility.getInverseDeclaration(fn);
          if (decObj || providedFn) {
            let samples = null;
            if (providedFn) {
              makeSamplesData.fx = providedFn;
              samples = Utility.makeSamples(makeSamplesData);
              samples = samples.map(function (pt) {
                const temp = pt.x;
                pt.x = pt.y;
                pt.y = temp;
                return pt;
              });
            } else {
              samples = Utility.inverseRelationSamples(
                fn,
                lowerX,
                upperX,
                numOfSamples,
                variable,
                self
              );
            }

            if (samples && samples.length) {
              const c = new MyCurve(Utility.generateCurveName(self, "Inv_"));
              c.setSamples(samples);
              c.attach(self);
            } else {
              const arr = fn.split("=");
              if (arr.length == 2) {
                const dec = arr[0];
                if (dec.length == 4 && dec[1] == "(" && dec[3] == ")") {
                  //g(x)
                  self.defines.removeDefine(dec);
                }
              }
            }
            return;
          }

          // Utility.alert(
          //   `Unable to derive samples for <b>"${Utility.adjustExpForDecimalPlaces(
          //     fn,
          //     decimalPlacesX
          //   )}"</b>.\n1. Check the function for the square-root of a negative.\n2. Check the limits for possible divide-by-zero.\n3. Check that values in the domain and range are within [1e-300, 1e+300].`
          // );

          Utility.displayErrorMessage(
            mf,
            `Unable to derive samples for "${Utility.adjustExpForDecimalPlaces(
              fn,
              decimalPlacesX
            )}. (1) Check the function for the square-root of a negative. (2) Check the limits for possible divide-by-zero. (3) Check that values in the domain and range are within [1e-300, 1e+300] and does cause an invalid input such as log or ln of 0 or a negative number. (4) Check that the syntax for "inverse" is correct.`
          );
          return;
        }

        newCurve = addCurve(title, samples, false, fn);

        //makeSamples() may modify the domain.
        newCurve.lowerX = makeSamplesData.lowerX;
        newCurve.upperX = makeSamplesData.upperX;

        if (!newCurve.parametricLowerX) {
          newCurve.parametricLowerX = m_lowerX;
          newCurve.parametricUpperX = m_upperX;
        }

        newCurve.turningPoints = makeSamplesData.turningPoints;
        newCurve.inflectionPoints = makeSamplesData.inflectionPoints;
        newCurve.latex = self._functionDlg.latex;
        if (!newCurve) {
          return;
        }

        if (samples.length == 1) {
          const color = Utility.randomColor();
          let sym = new Symbol2(
            Symbol2.Style.Ellipse,
            new Misc.Brush(Utility.invert(color)),
            new Misc.Pen(color),
            new Misc.Size(8, 8)
          );
          newCurve.setSymbol(sym);
          let attribute = "";
          if (Static.showline && Static.showsymbol) {
            attribute = "lineAndSymbol";
          } else if (Static.showline) {
            attribute = "line";
          } else if (Static.showsymbol) {
            attribute = "symbol";
          }
          Utility.setLegendAttribute(
            newCurve,
            attribute,
            newCurve.getLegendIconSize()
          ); //attribute = "line" or "symbol" or "lineAndSymbol"
        }
        //Utility.addSymbol(newCurve, Symbol2.Style.Ellipse);
        newCurve.discontinuity = discont;
        //newCurve.setAxis = false;
        newCurve.xIsDependentVariable = self._functionDlg.xIsDependentVariable;

        // let decimalPlacesY = 4;
        // let decimalPlacesX = 4;
        let m_samples = newCurve.data().samples();
        if (!Static.userDecimalPlacesForCalculation) {
          const obj = Utility.grapherDeterminedDecimalPlaces(newCurve);
          decimalPlacesY = obj.decimalPlacesY;
          decimalPlacesX = obj.decimalPlacesX;
        } /* else {
          decimalPlacesY = self.axisDecimalPlaces(newCurve.yAxis());
          decimalPlacesX = self.axisDecimalPlaces(newCurve.xAxis());
        } */

        /* const tps = newCurve.turningPoints;
        if (tps && tps.length) {
          let scaleX = 1;
          let scaleY = 1;
          const width =
            math.max(
              math.abs(newCurve.minXValue()),
              math.abs(newCurve.maxXValue())
            ) * 2;
          const height =
            math.max(
              math.abs(newCurve.minYValue()),
              math.abs(newCurve.maxYValue())
            ) * 2;
          //const { width, height } = newCurve.boundingRect().size();
          if (width > 1e6) {
            scaleX = 1e6 / width;
          }
          if (height > 1e6) {
            scaleY = 1e6 / height;
          }

          let n = 0;
          m_samples = m_samples.map(function (e) {
            if (Utility.isPointATurningPoint(tps, e)) {
              let pt = new Misc.Point(
                Utility.adjustForDecimalPlaces(
                  e.x * scaleX,
                  decimalPlacesX / 2
                ),
                Utility.adjustForDecimalPlaces(e.y * scaleY, decimalPlacesY / 2)
              );
              pt.x = pt.x / scaleX;
              pt.y = pt.y / scaleY;
              newCurve.turningPoints[n] = pt;
              n++;
              return pt;
            }
            return new Misc.Point(
              Utility.adjustForDecimalPlaces(e.x, decimalPlacesX),
              Utility.adjustForDecimalPlaces(e.y, decimalPlacesY)
            );
          });

          newCurve.turningPoints = newCurve.turningPoints.filter(
            (item, index) => {
              if (index > 0) {
                return (
                  newCurve.turningPoints[index - 1].x !==
                  newCurve.turningPoints[index].x
                );
              }
              return true;
            }
          );
        } */

        /* const ips = newCurve.inflectionPoints;
        if (ips && ips.length) {
          let scaleX = 1;
          let scaleY = 1;
          const width =
            math.max(
              math.abs(newCurve.minXValue()),
              math.abs(newCurve.maxXValue())
            ) * 2;
          const height =
            math.max(
              math.abs(newCurve.minYValue()),
              math.abs(newCurve.maxYValue())
            ) * 2;
          //const { width, height } = newCurve.boundingRect().size();
          if (width > 1e6) {
            scaleX = 1e6 / width;
          }
          if (height > 1e6) {
            scaleY = 1e6 / height;
          }

          let n = 0;
          m_samples = m_samples.map(function (pt) {
            // if (scaleX !== 1 || scaleY !== 1) {
            if (Utility.isPointATurningPoint(ips, pt)) {
              pt.x = Utility.adjustForDecimalPlaces(
                pt.x * scaleX,
                decimalPlacesX / 2
              );
              pt.y = Utility.adjustForDecimalPlaces(
                pt.y * scaleY,
                decimalPlacesY / 2
              );
              pt.x = pt.x / scaleX;
              pt.y = pt.y / scaleY;
              newCurve.inflectionPoints[n] = pt;
              n++;
              return pt;
            }
            pt.x = Utility.adjustForDecimalPlaces(pt.x, decimalPlacesX);
            pt.y = Utility.adjustForDecimalPlaces(pt.y, decimalPlacesY);
            return pt;
          });

          newCurve.inflectionPoints = newCurve.inflectionPoints.filter(
            (item, index) => {
              if (index > 0) {
                return (
                  newCurve.inflectionPoints[index - 1].x !==
                  newCurve.inflectionPoints[index].x
                );
              }
              return true;
            }
          );
        } */

        const tps = newCurve.turningPoints;
        const ips = newCurve.inflectionPoints;
        let scaleX = 1;
        let scaleY = 1;
        if (
          !newCurve.discontinuity.length &&
          ((tps && tps.length) || (ips && ips.length))
        ) {
          const width =
            math.max(
              math.abs(newCurve.minXValue()),
              math.abs(newCurve.maxXValue())
            ) * 2;
          const height =
            math.max(
              math.abs(newCurve.minYValue()),
              math.abs(newCurve.maxYValue())
            ) * 2;
          //const { width, height } = newCurve.boundingRect().size();
          if (width > 1e6) {
            scaleX = 1e6 / width;
          }
          if (height > 1e6) {
            scaleY = 1e6 / height;
          }

          m_samples = m_samples.map(function (pt) {
            const tp = Utility.isPointATurningPoint(tps, pt);
            const ip = Utility.isPointATurningPoint(ips, pt);

            if ((tp || ip) && scaleX != 1) {
              pt.x = Utility.adjustForDecimalPlaces(
                pt.x * scaleX,
                decimalPlacesX + 1
              );
              pt.y = Utility.adjustForDecimalPlaces(
                pt.y * scaleY,
                decimalPlacesY
              );
              pt.x = pt.x / scaleX;
              pt.y = pt.y / scaleY;
              return pt;
            }

            pt.x = Utility.adjustForDecimalPlaces(
              pt.x,
              math.max(4, (decimalPlacesX + 1) * 2)
            );
            pt.y = Utility.adjustForDecimalPlaces(
              pt.y,
              math.max(4, decimalPlacesY * 2)
            );
            return pt;
          });

          newCurve.turningPoints = newCurve.turningPoints.filter(
            (item, index) => {
              if (index > 0) {
                return (
                  newCurve.turningPoints[index - 1].x !==
                  newCurve.turningPoints[index].x
                );
              }
              return true;
            }
          );
          newCurve.inflectionPoints = newCurve.inflectionPoints.filter(
            (item, index) => {
              if (index > 0) {
                return (
                  newCurve.inflectionPoints[index - 1].x !==
                  newCurve.inflectionPoints[index].x
                );
              }
              return true;
            }
          );
        }

        /////////////////////////////////////////

        newCurve.setSamples(m_samples);

        if (!functionDlgData) newCurve.attach(self);

        newCurve.domainRangeRestriction =
          self._functionDlg.domainRangeRestriction;

        return newCurve;
      }
      return newCurve;
    };

    this._functionDlg.init(self.functionDlgCb);

    this.addRemovePoint = new AddRemovePointPicker(this);
    // this.addRemovePoint.setAddRemoveMousePattern(
    //   EventPattern.MousePatternCode.MouseSelect1,
    //   Static.LeftButton,
    //   Static.ShiftModifier
    // );
    //this.addRemovePoint.activate(true);

    var rulers = new Rulers(this);
    //this.sidebar = new SideBar1(this);
    //this.sidebar.setRulers(self.rv);

    //p.showSidebar(true)
    Static.watchCentroidWithArea = true;
    Static.bind("watchCentroidWithArea", function (e, on) {
      Static.watchCentroidWithArea = on;
      Static.trigger("invalidateWatch");

      rulers.updateWatchesAndTable();
    });

    this.tbar = new MToolBar(
      this,
      {
        zIndex: 1003,
      },
      self.plotDiv
    );

    /* Static.watchCentroidWithArea = true;					
        Static.bind("watchCentroidWithArea", function (e, on) {
          Static.watchCentroidWithArea = on;
        }); */

    this.curveClosestPoint = new CurveClosestPoint(this);
    // this.curveClosestPoint.setMousePattern(
    //   Static.LeftButton,
    //   Static.AltModifier
    // );

    //let functions = [];
    //let curves = [];
    // let firstSelectedCurve = null;
    // let secondSelectedCurve = null;

    Static.bind("curveRenamed", function (e, curve, oldName, newName) {
      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotMarker) {
        let oldLabel = curve.label();
        let newLabel = oldLabel.replace(oldName, newName);
        curve.setLabel(newLabel);
        curve.plot().replot();
      }
    });

    async function doCombine(curves, prefix) {
      let precisionY, precisionX, decimalPlacesY, decimalPlacesX;
      if (curves[0]) {
        precisionY = curves[0].plot().axisPrecision(curves[0].yAxis());
        precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
        decimalPlacesY = curves[0].plot().axisDecimalPlaces(curves[0].yAxis());
        decimalPlacesX = curves[0].plot().axisDecimalPlaces(curves[0].xAxis());

        let invalid = false;
        for (let i = 0; i < curves.length; i++) {
          const curve = curves[i];
          const minXVal = math.abs(curve.minXValue());
          const minYVal = math.abs(curve.minYValue());
          const maxXVal = math.abs(curve.maxXValue());
          const maxYVal = math.abs(curve.maxYValue());

          if (minXVal !== 0) {
            if (minXVal < 1e-100) {
              invalid = true;
            }
          }
          if (minYVal !== 0) {
            if (minYVal < 1e-300) {
              invalid = true;
            }
          }
          if (maxXVal !== 0) {
            if (maxXVal > 1e100) {
              invalid = true;
            }
          }
          if (maxYVal !== 0) {
            if (maxYVal > 1e300) {
              invalid = true;
            }
          }

          if (invalid) {
            Utility.alert(
              `Unable to perform the operation. Check that values in the domain and range are within [1e-100, 1e+100] and [1e-300, 1e+300] respectively.`
            );
            return;
          }
        }
      }

      // for (let i = 0; i < curves.length; i++) {
      //   const curve = curves[i];
      //   if(curve.turningPoints){
      //     let tps = curve.turningPoints;
      //     tps = tps.map((pt)=>{
      //       pt.x = Utility.adjustForDecimalPlaces(pt.x, Math.min(100, decimalPlacesX/2));
      //       pt.y = Utility.adjustForDecimalPlaces(pt.y, Math.min(100, decimalPlacesY/2));
      //       return pt;
      //     });
      //     curve.turningPoints = tps;
      //   }
      // }

      function getArrowSymbolCount() {
        let list = self.itemList(PlotItem.RttiValues.Rtti_PlotMarker);
        if (!list.length) {
          return 0;
        }
        list = list.filter(function (e) {
          return e.symbol() && e.symbol().toString() === "[PointMarkerSymbol]";
        });
        return list.length;
      }

      function getArrowSymbolProperties() {
        let m = getArrowSymbolCount();
        const odd = m % 2;
        let result = {};
        result.spacing = 0;
        result.align = Static.AlignRight;
        result.angle = -45;
        if (!odd) {
          result.spacing = 0;
          result.align = Static.AlignLeft;
          result.angle = 45;
        }
        return result;
      }

      //console.log(curves[0]);
      let functions = [];
      let lowerLimit = undefined;
      let upperLimit = undefined;
      const operationType = self.curveSelector.operationType;
      self.curveSelector.operationType = null;

      if (curves.length == 0) {
        return;
      }

      let variable = curves[0].variable;
      // if (!(operationType == "Join" || operationType == "Join and keep")) {
      //   if (curves.length > 1 && operationType !== "Intersection") {
      //     for (let i = 1; i < curves.length; i++) {
      //       if (curves[i].variable !== variable) {
      //         alert("Selected functions have different idependent vaiables.");
      //         return;
      //       }
      //     }
      //   }
      // }

      if (
        operationType == "Translate" ||
        operationType == "Scale" ||
        operationType == "Reflect x-axis" ||
        operationType == "Reflect y-axis" ||
        operationType == "Reflect x and y-axes" ||
        operationType == "Reflect y equal" ||
        operationType == "Reflect x equal"
      ) {
        if (operationType == "Translate") {
          Utility.prompt(
            "Enter comma separated values",
            entry,
            function (csvStr) {
              if (csvStr) {
                const arr = csvStr.split(",");
                if (arr.length !== 2) {
                  Utility.promptErrorMsg = `Improper translate values.\nExpected a comma separated value (csv).`;
                  return false;
                }

                let m_translateX = Number.MAX_VALUE,
                  m_translateY = Number.MAX_VALUE;

                try {
                  let parser = new EvaluateExp(
                    arr[0],
                    self.defines.expandDefines
                  );
                  m_translateX = parser.eval();
                  if (!math.isNumeric(m_translateX))
                    m_translateX = Number.MAX_VALUE;
                } catch (error) {
                  m_translateX = Number.MAX_VALUE;
                }
                try {
                  let parser = new EvaluateExp(
                    arr[1],
                    self.defines.expandDefines
                  );
                  m_translateY = parser.eval();
                  if (!math.isNumeric(m_translateY))
                    m_translateY = Number.MAX_VALUE;
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
                entry = csvStr;
                //} else {
                //validInput = true;
                // const m_translateX = math.evaluate(arr[0]);
                // const m_translateY = math.evaluate(arr[1]);

                //const plot = curves[0].plot();
                // const doAutoReplot = plot.autoReplot();
                // plot.setAutoReplot(false);
                for (let i = 0; i < curves.length; i++) {
                  self.transformation.transform(
                    curves[i],
                    "Translate",
                    m_translateX,
                    m_translateY
                  );
                  curves[i] = null;
                }
              } else {
                return false;
              }

              // console.log(str); //If the visitor clicks OK, the input is log to the console.
              // Utility.promptErrorMsg = "Invalid input. Expected a number.";

              return true;
            }
          );
        }
        if (operationType == "Scale") {
          // let validInput = false;
          // while (!validInput) {
          let entry = "2";
          Utility.prompt("Enter a scale factor", entry, function (csvStr) {
            if (csvStr) {
              if (isNaN(parseFloat(csvStr))) {
                Utility.promptErrorMsg =
                  "Improper scale factor receive. Expected a number.";
                return false;
              } else {
                const scale = parseFloat(csvStr);
                for (let i = 0; i < curves.length; i++) {
                  self.transformation.transform(curves[i], "Scale", scale);
                  curves[i] = null;
                }
              }
            } else {
              return false;
            }
            return true;
          });
        }
        if (operationType == "Reflect x equal") {
          Utility.prompt("Enter a value for x = ", "1", function (val) {
            if (val) {
              if (isNaN(parseFloat(val))) {
                Utility.promptErrorMsg =
                  "Improper value receive. Expected a number.";
                return false;
              } else {
                const m_val = parseFloat(val);
                for (let i = 0; i < curves.length; i++) {
                  self.transformation.transform(
                    curves[i],
                    "Reflect x equal",
                    m_val
                  );
                  curves[i] = null;
                }
              }
            } else {
              return false;
            }
            return true;
          });
        }
        if (operationType == "Reflect y equal") {
          Utility.prompt("Enter a value for y = ", "1", function (val) {
            if (val) {
              if (isNaN(parseFloat(val))) {
                Utility.promptErrorMsg =
                  "Improper value receive. Expected a number.";
                return false;
              } else {
                const m_val = parseFloat(val);
                for (let i = 0; i < curves.length; i++) {
                  self.transformation.transform(
                    curves[i],
                    "Reflect y equal",
                    m_val
                  );
                  curves[i] = null;
                }
              }
            } else {
              return false;
            }
            return true;
          });
        }
        if (operationType == "Reflect x-axis") {
          for (let i = 0; i < curves.length; i++) {
            self.transformation.transform(curves[i], "Reflect x-axis");
          }
        }
        if (operationType == "Reflect y-axis") {
          for (let i = 0; i < curves.length; i++) {
            self.transformation.transform(curves[i], "Reflect y-axis");
          }
        }

        if (operationType == "Reflect x and y-axes") {
          for (let i = 0; i < curves.length; i++) {
            self.transformation.transform(curves[i], "Reflect x and y-axis");
          }
          // if (self.tbar.isButtonChecked(self.tbar.auto))
          //   Utility.setAutoScale(self, true);
        }
      }

      let coeffs = [];

      if (
        operationType == "Add" ||
        operationType == "Subtract" ||
        operationType == "Divide" ||
        operationType == "Multiply" ||
        operationType == "Composite" ||
        operationType == "Join" ||
        operationType == "Join and keep"
      ) {
        for (let i = 0; i < curves.length; i++) {
          if (!(operationType == "Join" || operationType == "Join and keep")) {
            if (!curves[i].expandedFn) {
              Utility.alert(
                `Your selection, "${curves[
                  i
                ].title()}", is not described by a known function.`
              );
              self.curveSelector.abortSelection();
              functions = [];
              return;
            }
          }
          if (curves[i].coeffs) {
            coeffs = coeffs.concat(curves[i].coeffs);
          }
          //functions.push(curves[i].expandedFn);
          functions.push(curves[i].fn);
        }

        coeffs = _.uniq(coeffs);

        let combinedFn = null;

        if (functions.length > 1 || curves.length > 1) {
          self.curveSelector.setEnabled(false);

          for (let i = 0; i < curves.length; i++) {
            /* if (!curves[i].expandedFn) {
            Utility.alert(
              `Your selection, "${curves[
                i
              ].title()}", is not described by a known function.`
            );
            functions = [];
            curves = [];
            lowerLimit = undefined;
            upperLimit = undefined;
            return;
          } */
            if (lowerLimit == undefined) {
              lowerLimit = curves[i].minXValue();
            } else if (curves[i].minXValue() < lowerLimit) {
              lowerLimit = curves[i].minXValue();
            }

            if (upperLimit == undefined) {
              upperLimit = curves[i].maxXValue();
            } else if (curves[i].maxXValue() > upperLimit) {
              upperLimit = curves[i].maxXValue();
            }
          }

          if (operationType == "Add") {
            let fn = "";
            for (let i = 0; i < functions.length; i++) {
              fn += functions[i];
              if (i < functions.length - 1) fn += "+";
            }
            combinedFn = math
              .simplify(math.parse(fn), {}, { exactFractions: false })
              .toString()
              .replace(/\s/g, "")
              .replaceAll("+-", "-");
            //Replace the whitespace delimiters stripped out by simplify()
            combinedFn = combinedFn.replaceAll("mod", " mod ");
          }
          if (operationType == "Subtract") {
            let fn = "";
            for (let i = 0; i < functions.length; i++) {
              fn += `(${functions[i]})`;
              if (i < functions.length - 1) fn += "-";
            }
            combinedFn = math
              .simplify(math.parse(fn), {}, { exactFractions: false })
              .toString()
              .replace(/\s/g, "")
              .replaceAll("+-", "-");
            //Replace the whitespace delimiters stripped out by simplify()
            combinedFn = combinedFn.replaceAll("mod", " mod ");
          }
          if (operationType == "Multiply") {
            let fn = "";
            for (let i = 0; i < functions.length; i++) {
              fn += `(${functions[i]})`;
              if (i < functions.length - 1) fn += "*";
            }
            combinedFn = math
              .simplify(math.parse(fn), {}, { exactFractions: false })
              .toString()
              .replace(/\s/g, "")
              .replaceAll("+-", "-");
            //Replace the whitespace delimiters stripped out by simplify()
            combinedFn = combinedFn.replaceAll("mod", " mod ");
          }
          if (operationType == "Divide") {
            let fn = "";
            for (let i = 0; i < functions.length; i++) {
              fn += `(${functions[i]})`;
              if (i < functions.length - 1) fn += "/";
            }
            combinedFn = math
              .simplify(math.parse(fn), {}, { exactFractions: false })
              .toString()
              .replace(/\s/g, "")
              .replaceAll("+-", "-");
            //Replace the whitespace delimiters stripped out by simplify()
            combinedFn = combinedFn.replaceAll("mod", " mod ");
          }
          if (operationType == "Composite") {
            let fn = functions[0];
            for (let i = 1; i < functions.length; i++) {
              const gx = functions[i];
              fn = fn.replaceAll(variable, "(" + gx + ")");
            }
            combinedFn = math
              .simplify(math.parse(fn), {}, { exactFractions: false })
              .toString()
              .replace(/\s/g, "")
              .replaceAll("+-", "-");
            //Replace the whitespace delimiters stripped out by simplify()
            combinedFn = combinedFn.replaceAll("mod", " mod ");

            var order = nerdamer(`deg(${combinedFn})`).toString();
            if (order === "1") {
              const combinedFnTest = combinedFn.replaceAll(variable, "U");
              if (
                math.abs(1 - math.evaluate(combinedFnTest, { U: 1 })) < 1e-10
              ) {
                combinedFn = variable;
              }
            }

            if (combinedFn != variable) {
              //console.log(Utility.isLinear(combinedFn, variable, 1e-10));
              const _combinedFn = Utility.isLinear(combinedFn, variable);
              if (_combinedFn)
                combinedFn = Utility.adjustExpForDecimalPlaces(
                  _combinedFn,
                  decimalPlacesX
                );
            }
          }

          function doJoin() {
            curves = curves.sort(function (a, b) {
              const samplesA = a.data().samples();
              const samplesB = b.data().samples();
              return samplesA[0].x - samplesB[0].x;
            });
            // for (let i = 0; i < curves.length; i++) {
            //   console.log(curves[i].title());
            // }
            let samples = curves[0].data().samples();
            for (let i = 1; i < curves.length; i++) {
              const samples2 = curves[i].data().samples();
              if (samples2[0].x >= samples[samples.length - 1].x) {
                if (samples[0].x > samples[samples.length - 1].x)
                  samples = samples.reverse();
                samples = samples.concat(samples2);
              } else {
                samples = [];
                curves = [];
                Utility.alert(
                  "Improper selection order or overlapping domain.",
                  "small"
                );
              }
            }
            //console.log(samples);
            if (samples.length) {
              const curve = new MyCurve(
                Utility.generateCurveName(self, "joined_")
              );
              curve.setSamples(samples);
              curve.attach(self);
            }
          }

          if (operationType == "Join") {
            doJoin();
            for (let i = 0; i < curves.length; i++) {
              curves[i].detach();
            }
          }

          if (operationType == "Join and keep") {
            doJoin();
          }

          //self.curveSelector.abortSelection();
          let numOfPoints = -1;
          for (let i = 0; i < curves.length; i++) {
            const sz = curves[i].data().size();
            if (sz > numOfPoints) {
              numOfPoints = sz;
            }
          }
          functions = [];
          curves = [];

          if (operationType == "Join" || operationType == "Join and keep")
            return;

          const functionDlgData = {
            rtti: PlotItem.RttiValues.Rtti_PlotCurve,
            lowerLimit, //Number
            upperLimit, //Number
            threeD: false,
            title: Utility.generateCurveName(self, "comb_"), //eq + domain[0], //String
            variable, //String
            fn: combinedFn, //String
            expandedFn: combinedFn, //String
            //numOfPoints: undefined, //Number
            numOfPoints, //Number
            unboundedRange: false, //Boolean
            coeffs, //: null, //Array
            threeDType: null, //String e.g. "spectrocurve"
            threeDInterpolationType: null, //String e.g. "bilinear"
            lowerLimitY: undefined, //Number
            upperLimitY: undefined, //Number
            lowerLimitFxy: undefined, //Number
            upperLimitFxy: undefined, //Number
            variableY: undefined, //String
            color1: "#008b8b", //String
            color2: "#ff0000", //String
          };

          const curve = self.functionDlgCb(functionDlgData);
          lowerLimit = undefined;
          upperLimit = undefined;
          if (curve) {
            curve.attach(self);
          }
        } //
      }

      if (operationType == "Create table") {
        //$("html").addClass("wait");
        curves[0].plot().plotPropertiesPane.generateTable(curves[0]);

        return;
      }

      if (operationType == "Copy curve") {
        Utility.copyCurves(curves);
        return;
      }

      if (operationType == "Discontinuity point") {
        let precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
        //const precision = Math.min(precisionX, precisionY);
        let decimalPlacesX = curves[0]
          .plot()
          .axisDecimalPlaces(curves[0].xAxis());

        const discontinuity = curves[0].discontinuity.map(function (e) {
          return Utility.toPrecision(
            Utility.adjustForDecimalPlaces(e, Math.min(decimalPlacesX, 9)),
            precisionX
          );
        });

        let n = discontinuity.length;
        let isAre = "is",
          discont = "discontinuity";
        let values = "value";
        if (discontinuity && n > 1) {
          (isAre = "are"), (discont = "discontinuities"), (values = "values");
        }
        let str = `There ${isAre} ${n} ${discont}.`;
        if (n) {
          str += ` Abscissa ${values}:\n` + discontinuity.toString();
        }
        alert(str);
      }

      if (
        operationType == "Turning point" ||
        operationType == "Inflection point" ||
        operationType == "Y-Intercept" ||
        operationType == "X-Intercept" ||
        operationType == "Inverse"
      ) {
        //console.log(curves);
        // let precisionY = curves[0].plot().axisPrecision(curves[0].yAxis());
        // let precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
        // let decimalPlacesY = curves[0]
        //   .plot()
        //   .axisDecimalPlaces(curves[0].yAxis());
        // let decimalPlacesX = curves[0]
        //   .plot()
        //   .axisDecimalPlaces(curves[0].xAxis());

        const doAutoReplot = self.autoReplot();
        self.setAutoReplot(false);
        let str = "";
        let m = 0;
        for (let i = 0; i < curves.length; i++) {
          //const points = Utility.curveTurningPoint(curves[i]);//fn, variable, samples
          let points;
          if (operationType == "Turning point") {
            const curve = curves[i];

            points = curve.turningPoints;

            if (points && points.length) {
              if (curve.coeffs && curve.coeffs.length) {
                let tpInvalid = false;
                const coeffsVal = curve.coeffsVal;
                for (let i = 0; i < coeffsVal.length; i++) {
                  if (coeffsVal[i] !== 1) {
                    tpInvalid = true;
                    break;
                  }
                }
                if (tpInvalid) {
                  let fn = curve.fn;
                  const coeffs = curve.coeffs;
                  for (let i = 0; i < coeffs.length; i++) {
                    fn = fn.replaceAll(coeffs[i], coeffsVal[i]);
                    points = Utility.curveTurningPoint(
                      fn,
                      curve.variable,
                      curve.data().samples(),
                      decimalPlacesX,
                      decimalPlacesY
                    );
                  }
                }
              }

              for (let n = 0; n < points.length; n++) {
                const odd = m % 2;
                m++;
                const { spacing, align } = getArrowSymbolProperties();
                const element = points[n];
                const tpName = Utility.generateCurveName(self, "T");
                const marker = new PlotMarker(tpName);
                marker.toolTipValueName = "Turning point:";
                marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
                marker.setXAxis(curve.xAxis());
                marker.setYAxis(curve.yAxis());

                marker.setSymbol(new PointMarkerSymbol());

                marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
                marker.setLegendIconSize(new Misc.Size(10, 10));

                marker.setValue(element);
                marker.setLabel(tpName);
                var m_symbol = marker.symbol();
                m_symbol.setSize(new Misc.Size(10, 10));
                marker.setLabelAlignment(align | Static.AlignBottom);
                marker.setSpacing(spacing);

                marker.setLabelFont(
                  new Misc.Font({
                    fontColor: "#0B00FC",
                    name: "Times New Roman",
                    style: "normal",
                    th: 12,
                    weight: "bold",
                  })
                );

                marker.attach(self);
              }
            }
          }

          /**
           * This operation
           */
          if (operationType == "Inverse") {
            const curve = curves[i];
            if (curve.expandedFn) {
              const invFn = await Utility.inverseFunction(
                curve.expandedFn,
                curve.variable
              );
              //return "failedInverse";
              const min_x = curve.minYValue();
              const max_x = curve.maxYValue();
              if (invFn && invFn != "failedInverse" && invFn.length) {
                for (let i = 0; i < invFn.length; i++) {
                  if (i > 0 && !Static.negativeRoot) {
                    break;
                  }
                  const fn = invFn[i];
                  self._functionDlg.expandedFn = fn;
                  self._functionDlg.title = Utility.generateCurveName(self);
                  if (i > 0) {
                    self._functionDlg.title = Utility.generateCurveName(
                      self,
                      "0~curve_"
                    );
                  }
                  self.functionDlgCb(null, curve.expandedFn, min_x, max_x);
                }
              }
              if (invFn === "failedInverse") {
                self._functionDlg.expandedFn = "failedInverse";
                self._functionDlg.title = Utility.generateCurveName(self);
                self.functionDlgCb(null, curve.expandedFn, min_x, max_x);
              }
            }
            /*const curve = curves[i];

            console.log("Inverse", curve);
            const newCurve = new MyCurve(`Inv-${curve.title()}`);
            const samples = curve.data().samples();
            const _samples = samples.map((pt) => {
              return new Misc.Point(pt.y, pt.x);
            });
             newCurve.setAxes(curve.xAxis(), curve.yAxis());
            newCurve.setSamples(_samples);
            // if (curve.turningPoints) {
            //   newCurve.turningPoints = curve.turningPoints.map((pt) => {
            //     return new Misc.Point(pt.y, pt.x);
            //   });
            // }
            // if (curve.inflectionPoints) {
            //   newCurve.inflectionPoints = curve.inflectionPoints.map((pt) => {
            //     return new Misc.Point(pt.y, pt.x);
            //   });
            // } 
            newCurve.relation = true;
            newCurve.attach(self);
            if (i == curves.length - 1) {
              self.setAutoReplot(doAutoReplot);
              self.autoRefresh();
              return;
            } */
          }

          if (operationType == "X-Intercept") {
            const curve = curves[i];

            let m_curves = [curve];
            let tempCurve = new MyCurve();
            tempCurve.fn = "0";
            tempCurve.setAxes(curve.xAxis(), curve.yAxis());

            const minX = curve.minXValue();
            const maxX = curve.maxXValue();

            tempCurve.setSamples([
              new Misc.Point(minX, 0),
              new Misc.Point(maxX, 0),
            ]);
            self.curveSelector.operationType = "Intersection";
            m_curves.push(tempCurve);
            doCombine(m_curves, "x~");
            self.curveSelector.operationType = null;
            tempCurve = null;

            if (i < curves.length) {
              continue;
            }
          }

          /* Dependent on function */
          if (
            operationType == "Y-Intercept" &&
            curves[i].expandedFn &&
            curves[i].expandedFn.length
          ) {
            //Start
            const curve = curves[i];

            let pts = [];
            // parametricFnX:"cos(t)"
            //parametricFnY:"sin(t)"
            //parametric_variable:"t"
            if (curve.expandedFn) {
              try {
                let pt = new Misc.Point(
                  0,
                  math.evaluate(
                    curve.expandedFn.replaceAll(curve.variable, "U"),
                    { U: 0 }
                  )
                );
                pts.push(pt);
              } catch (error) {
                console.log(error);
              }
            }

            if (curve.parametricFnX && curve.parametricFnY) {
              let res;
              var fn = `${curve.parametricFnX}=0`;
              var solution;

              try {
                Utility.progressWait();
                solution = await Static.solveFor(fn, curve.parametric_variable);
                Utility.progressWait(false);
                if (!solution.length) {
                  const mf = $("#fnDlg_function")[0];
                  Utility.displayErrorMessage(
                    mf,
                    `Unable to find a solution for "${fn}".`
                  );
                  return;
                }
              } catch (error) {
                console.log(error);
                Utility.progressWait(false);
              }
              if (Array.isArray(solution)) {
                for (let i = 0; i < solution.length; i++) {
                  res = solution[i].toString();
                  let _fn = curve.parametricFnY.replaceAll(
                    curve.parametric_variable,
                    `(${res})`
                  );
                  var _y = nerdamer(_fn);
                  _y = parseFloat(_y.evaluate().toString());
                  let _pt = new Misc.Point(0, _y);
                  if (
                    !Utility.arrayHasPoint(
                      pts,
                      _pt,
                      decimalPlacesX,
                      decimalPlacesY
                    )
                  ) {
                    pts.push(_pt);
                  }
                } //here2
              }
            }

            let pt;
            for (let i = 0; i < pts.length; ++i) {
              pt = pts[i];
              const { spacing, align } = getArrowSymbolProperties();

              const tpName = Utility.generateCurveName(self, "Y~");
              const marker = new PlotMarker(tpName);
              marker.toolTipValueName = "Y-Intercept:";
              marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
              marker.setXAxis(curve.xAxis());
              marker.setYAxis(curve.yAxis());

              marker.setSymbol(new PointMarkerSymbol());

              marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
              marker.setLegendIconSize(new Misc.Size(10, 10));

              marker.setValue(pt);
              marker.setLabel(tpName);
              var m_symbol = marker.symbol();
              m_symbol.setSize(new Misc.Size(10, 10));
              marker.setLabelAlignment(align | Static.AlignBottom);
              marker.setSpacing(spacing);

              marker.setLabelFont(
                new Misc.Font({
                  fontColor: "#0B00FC",
                  name: "Times New Roman",
                  style: "normal",
                  th: 12,
                  weight: "bold",
                })
              );

              marker.attach(self);
            }
          } //End

          /* Independent of function */
          if (operationType == "Y-Intercept" && !curves[i].expandedFn) {
            //Start
            const curve = curves[i];

            let m_curves = [curve];
            let tempCurve = new MyCurve();
            //tempCurve.fn = "0";
            tempCurve.setAxes(curve.xAxis(), curve.yAxis());

            const minY = curve.minYValue();
            const maxY = curve.maxYValue();

            tempCurve.setSamples([
              new Misc.Point(-1e-16, minY - 0.1 * Math.abs(minY)),
              new Misc.Point(1e-16, maxY + 0.1 * maxY),
            ]);
            self.curveSelector.operationType = "Intersection";
            //curves[i].toolTipValueName = "Y-Intercept";
            m_curves.push(tempCurve);
            doCombine(m_curves, "Y~");
            self.curveSelector.operationType = null;
            tempCurve = null;

            if (i < curves.length) {
              continue;
            }
          } //End

          if (operationType == "Inflection point") {
            const curve = curves[i];
            points = curve.inflectionPoints || [];

            if (curve.coeffs && curve.coeffs.length) {
              let unfltnInvalid = false;
              const coeffsVal = curve.coeffsVal;
              for (let i = 0; i < coeffsVal.length; i++) {
                if (coeffsVal[i] !== 1) {
                  unfltnInvalid = true;
                  break;
                }
              }
              if (unfltnInvalid) {
                let fn = curve.fn;
                const coeffs = curve.coeffs;
                for (let i = 0; i < coeffs.length; i++) {
                  fn = fn.replaceAll(coeffs[i], coeffsVal[i]);
                  points = Utility.curveInflectionPoint(
                    fn,
                    curve.variable,
                    curve.data().samples(),
                    curve,
                    decimalPlacesX,
                    decimalPlacesY
                  );
                }
              }
            }

            for (let n = 0; n < points.length; n++) {
              const element = points[n];
              const { spacing, align } = getArrowSymbolProperties();
              const ipName = Utility.generateCurveName(self, "I");
              const marker = new PlotMarker(ipName);
              marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
              marker.setXAxis(curve.xAxis());
              marker.setYAxis(curve.yAxis());

              marker.setSymbol(new PointMarkerSymbol());
              marker.toolTipValueName = "Inflection point:";

              marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
              marker.setLegendIconSize(new Misc.Size(10, 10));

              marker.setValue(element);
              marker.setLabel(ipName);
              var m_symbol = marker.symbol();
              m_symbol.setSize(new Misc.Size(10, 10));
              marker.setLabelAlignment(align | Static.AlignBottom);
              marker.setSpacing(spacing);

              marker.setLabelFont(
                new Misc.Font({
                  fontColor: "#FF0000",
                  name: "Times New Roman",
                  style: "normal",
                  th: 12,
                  weight: "bold",
                })
              );

              marker.attach(self);
            }
          }

          if (
            curves[i].parametricFnX &&
            (operationType == "Inflection point" ||
              operationType == "Turning point")
          ) {
            str += `${operationType.replace(
              " point",
              ""
            )} points for parametric functions not yet supported.\n`;
          } else if (!curves[i].expandedFn && !curves[i].parametricFnX) {
            str += `No function expression found to determine ${operationType.replace(
              " point",
              ""
            )} points for ${curves[i].title()}.\n`;
          } else if (
            operationType !== "Y-Intercept" &&
            operationType !== "X-Intercept" &&
            operationType !== "Inverse"
          ) {
            if (!points || !points.length) {
              str += `${curves[i].title()} has 0 ${operationType.replace(
                " point",
                ""
              )} point\n`;
            }
          }
        }
        self.setAutoReplot(doAutoReplot);
        self.autoRefresh();
        if (str.length) alert(str);
      }

      if (operationType == "Intersection") {
        if (!prefix) {
          prefix = "X";
        }

        if (curves.length > 1) {
          if (curves[0].title() == curves[1].title()) {
            alert("Cannot find the intersection of a curve with itself.");
            return;
          }

          if (curves[0].xAxis() !== curves[1].xAxis()) {
            alert(
              "Cannot find the intersection of a curve with different x-axis."
            );
            return;
          }

          if (curves[0].yAxis() !== curves[1].yAxis()) {
            alert(
              "Cannot find the intersection of a curve with different y-axis."
            );
            return;
          }

          if (curves[0].fn && curves[0].fn === curves[1].fn) {
            alert(
              "Cannot find the intersection of a curves of the same function."
            );
            return;
          }

          if (
            curves[0].parametricFnX &&
            curves[0].parametricFnX === curves[1].parametricFnX &&
            curves[0].parametricFnY === curves[1].parametricFnY
          ) {
            alert(
              "Cannot find the intersection of a curves with the same parametric functions."
            );
            return;
          }

          let res = [];
          let imaginary = false;

          //const round = 30;
          const m_eps = 1e-300;
          //const m_eps = 2.22e-16;
          let samples1 = curves[0].data().samples();
          let samples2 = curves[1].data().samples();

          let tempSamples = [];

          while (samples1.length > 160) {
            const tps = curves[0].turningPoints;
            const ips = curves[0].inflectionPoints;
            for (let i = 0; i < samples1.length; i++) {
              if (
                i % 2 == 0 ||
                Utility.isPointATurningPoint(tps, samples1[i]) ||
                Utility.isInflectionPoint(ips, samples1[i])
              ) {
                tempSamples.push(samples1[i]);
              }
            }
            if (
              tempSamples[tempSamples.length - 1].x !==
              samples1[samples1.length - 1].x
            ) {
              tempSamples.push(samples1[samples1.length - 1]);
            }
            samples1 = tempSamples;
            tempSamples = [];
          }

          tempSamples = [];
          while (samples2.length > 160) {
            const tps = curves[1].turningPoints;
            const ips = curves[0].inflectionPoints;
            for (let i = 0; i < samples2.length; i++) {
              if (
                i % 2 == 0 ||
                Utility.isPointATurningPoint(tps, samples2[i]) ||
                Utility.isInflectionPoint(ips, samples2[i])
              ) {
                tempSamples.push(samples2[i]);
              }
            }
            if (
              tempSamples[tempSamples.length - 1].x !==
              samples2[samples2.length - 1].x
            ) {
              tempSamples.push(samples2[samples2.length - 1]);
            }
            samples2 = tempSamples;
            tempSamples = [];
          }

          let samples1_minY = curves[0].minYValue();
          let samples1_maxY = curves[0].maxYValue();
          let samples2_minY = curves[1].minYValue();
          let samples2_maxY = curves[1].maxYValue();

          if (samples2.length == 2 && samples1.length > 2) {
            const temp = samples1;
            samples1 = samples2;
            samples2 = temp;

            const temp_samples1_minY = samples1_minY;
            samples1_minY = samples2_minY;
            samples2_minY = temp_samples1_minY;

            const temp_samples2_maxY = samples2_maxY;
            samples2_maxY = samples1_maxY;
            samples1_maxY = temp_samples2_maxY;
          }

          let parallelToXAxis = false;

          if (0) {
            if (1) {
              //Intersect line
              let point1Line1 = [samples1[0].x, samples1[0].y];
              let point2Line1 = [
                samples1[samples1.length - 1].x,
                samples1[samples1.length - 1].y,
              ];

              let point1Line2 = [samples2[0].x, samples2[0].y];
              let point2Line2 = [
                samples2[samples2.length - 1].x,
                samples2[samples2.length - 1].y,
              ];

              let point = math.intersect(
                point1Line1,
                point2Line1,
                point1Line2,
                point2Line2
              );

              if (point) {
                let x = Utility.adjustForDecimalPlaces(point[0]);
                let y = Utility.adjustForDecimalPlaces(point[1]);

                if (x == "Infinity" || y == "Infinity") {
                  if (prefix === "x~") alert(`0 x-intercept:\n`);
                  else alert(`0 points of intersection:\n`);
                  return;
                }

                const element = new Misc.Point(x, y);
                const { spacing, align } = getArrowSymbolProperties();
                const ipName = Utility.generateCurveName(self, prefix);
                const marker = new PlotMarker(ipName);
                marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
                marker.setXAxis(curves[0].xAxis());
                marker.setYAxis(curves[0].yAxis());

                marker.setSymbol(new PointMarkerSymbol());
                let toolTipName = "Intersection point:";
                if (ipName.indexOf("x~") !== -1) {
                  toolTipName = "X-Intercept:";
                }
                marker.toolTipValueName = toolTipName;

                marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
                marker.setLegendIconSize(new Misc.Size(10, 10));

                marker.setValue(element);
                marker.setLabel(ipName);
                var m_symbol = marker.symbol();
                m_symbol.setSize(new Misc.Size(10, 10));
                marker.setLabelAlignment(align | Static.AlignBottom);
                marker.setSpacing(spacing);

                marker.setLabelFont(
                  new Misc.Font({
                    fontColor: "#000000",
                    name: "Times New Roman",
                    style: "normal",
                    th: 12,
                    weight: "bold",
                  })
                );

                marker.attach(self);
                return;
              }
            }
          }

          /////////////////////////////////////////////////////////////

          if (!parallelToXAxis) {
            /* if (samples2.length > samples1.length) {
              const temp = samples2;
              samples2 = samples1;
              samples1 = temp;
            } */
            if (samples1.length >= samples2.length) {
              for (let i = 0; i < samples1.length; i++) {
                for (let n = 0; n < samples2.length; n++) {
                  if (
                    samples1[i].x == samples2[n].x &&
                    samples1[i].y == samples2[n].y
                  ) {
                    res.push(samples2[n]);
                  }
                }
              }
            } else {
              for (let i = 0; i < samples2.length; i++) {
                for (let n = 0; n < samples1.length; n++) {
                  if (
                    samples2[i].x == samples1[n].x &&
                    samples2[i].y == samples1[n].y
                  ) {
                    res.push(samples1[n]);
                  }
                }
              }
            }

            /* const min_rect_width =
              (curves[0].maxXValue() - curves[0].minXValue()) / 150;
            console.log(min_rect_width); */

            for (let i = 1; i < samples1.length; i++) {
              let point1Line1 = [
                samples1[i - 1].x,
                Math.abs(samples1[i - 1].y) < m_eps ? 0 : samples1[i - 1].y,
              ];
              let point2Line1 = [
                samples1[i].x,
                Math.abs(samples1[i].y) < m_eps ? 0 : samples1[i].y,
              ];

              let rect1 = new Misc.Rect(
                point1Line1[0],
                point1Line1[1],
                Math.abs(point2Line1[0] - point1Line1[0]) < 1e-12
                  ? 1e-12
                  : Math.abs(point2Line1[0] - point1Line1[0]),
                Math.abs(point2Line1[1] - point1Line1[1]) < 1e-12
                  ? 1e-12
                  : Math.abs(point2Line1[1] - point1Line1[1])
              ).normalized();
              //console.log(rect1.toString());

              for (let j = 1; j < samples2.length; j++) {
                let point1Line2 = [
                  samples2[j - 1].x,
                  Math.abs(samples2[j - 1].y) < m_eps ? 0 : samples2[j - 1].y,
                ];
                let point2Line2 = [
                  samples2[j].x,
                  Math.abs(samples2[j].y) < m_eps ? 0 : samples2[j].y,
                ];

                let rect2 = new Misc.Rect(
                  point1Line2[0],
                  point1Line2[1],
                  Math.abs(point2Line2[0] - point1Line2[0]) < 1e-12
                    ? 1e-12
                    : Math.abs(point2Line2[0] - point1Line2[0]),
                  Math.abs(point2Line2[1] - point1Line2[1]) < 1e-12
                    ? 1e-12
                    : Math.abs(point2Line2[1] - point1Line2[1])
                ).normalized();

                //console.log(rect2.toString());

                if (rect1.intersects(rect2)) {
                  let point = math.intersect(
                    point1Line1,
                    point2Line1,
                    point1Line2,
                    point2Line2
                  );

                  //console.log(point);
                  if (!point) {
                    continue;
                    // point = [0, 0];
                    // console.log(point);
                  }
                  let pt = new Misc.Point(point[0], point[1]);

                  if (
                    (point &&
                      rect2.contains(pt, false) &&
                      rect1.contains(pt, false)) ||
                    (rect1.height() == 0 && rect2.contains(pt, false)) ||
                    (rect2.height() == 0 && rect1.contains(pt, false))
                  ) {
                    if (
                      !Utility.arrayHasPoint(
                        res,
                        pt,
                        decimalPlacesX,
                        decimalPlacesY
                      )
                    ) {
                      res.push(pt);
                    }
                  }
                }
              }
            }

            const temp_samples = samples1;
            samples1 = samples2;
            samples2 = temp_samples;
            if (samples1.length >= samples2.length) {
              for (let i = 0; i < samples1.length; i++) {
                for (let n = 0; n < samples2.length; n++) {
                  if (
                    samples1[i].x == samples2[n].x &&
                    samples1[i].y == samples2[n].y
                  ) {
                    res.push(samples2[n]);
                  }
                }
              }
            } else {
              for (let i = 0; i < samples2.length; i++) {
                for (let n = 0; n < samples1.length; n++) {
                  if (
                    samples2[i].x == samples1[n].x &&
                    samples2[i].y == samples1[n].y
                  ) {
                    res.push(samples1[n]);
                  }
                }
              }
            }

            for (let i = 1; i < samples1.length; i++) {
              let point1Line1 = [
                samples1[i - 1].x,
                Math.abs(samples1[i - 1].y) < m_eps ? 0 : samples1[i - 1].y,
              ];
              let point2Line1 = [
                samples1[i].x,
                Math.abs(samples1[i].y) < m_eps ? 0 : samples1[i].y,
              ];

              let rect1 = new Misc.Rect(
                point1Line1[0],
                point1Line1[1],
                point2Line1[0] - point1Line1[0],
                point2Line1[1] - point1Line1[1]
              ).normalized();

              for (let j = 1; j < samples2.length; j++) {
                let point1Line2 = [
                  samples2[j - 1].x,
                  Math.abs(samples2[j - 1].y) < m_eps ? 0 : samples2[j - 1].y,
                ];
                let point2Line2 = [
                  samples2[j].x,
                  Math.abs(samples2[j].y) < m_eps ? 0 : samples2[j].y,
                ];

                let rect2 = new Misc.Rect(
                  point1Line2[0],
                  point1Line2[1],
                  point2Line2[0] - point1Line2[0],
                  point2Line2[1] - point1Line2[1]
                ).normalized();

                if (rect1.intersects(rect2)) {
                  let point = math.intersect(
                    point1Line1,
                    point2Line1,
                    point1Line2,
                    point2Line2
                  );

                  //console.log(point);
                  if (!point) {
                    continue;
                    // point = [0, 0];
                    // console.log(point);
                  }
                  let pt = new Misc.Point(point[0], point[1]);

                  if (
                    (point &&
                      rect2.contains(pt, false) &&
                      rect1.contains(pt, false)) ||
                    (rect1.height() == 0 && rect2.contains(pt, false)) ||
                    (rect2.height() == 0 && rect1.contains(pt, false))
                  ) {
                    if (
                      !Utility.arrayHasPoint(
                        res,
                        pt,
                        decimalPlacesX,
                        decimalPlacesY
                      )
                    ) {
                      res.push(pt);
                    }
                  }
                }
              }
            }
          }

          function adjustIp(_pt) {
            let pt = new Misc.Point(_pt.x, _pt.y);
            let fn1 = curves[0].fn;
            let fn2 = curves[1].fn;

            let add = true;
            if (fn1 && fn2) {
              const coeffs1 = curves[0].coeffs;
              const coeffs2 = curves[1].coeffs;
              const coeffs1Val = curves[0].coeffsVal;
              const coeffs2Val = curves[1].coeffsVal;

              if (coeffs1 && coeffs1Val) {
                for (let i = 0; i < coeffs1.length; i++) {
                  fn1 = fn1.replaceAll(coeffs1[i], coeffs1Val[i]);
                }
              }

              if (coeffs2 && coeffs2Val) {
                for (let i = 0; i < coeffs2.length; i++) {
                  fn2 = fn2.replaceAll(coeffs2[i], coeffs2Val[i]);
                }
              }

              // const mx = Utility.adjustForDecimalPlaces(pt.x, decimalPlacesX);
              const mx = pt.x;
              const my1 = math.evaluate(fn1, { x: mx });
              const my2 = math.evaluate(fn2, { x: mx });
              if (my1 == my2) {
                return pt;
              }

              let xMap = self.axisScaleDraw(curves[0].xAxis()).scaleMap();
              const px = 1e-4;
              //const px = 8e-3;
              const step = math.max(
                1e-5,
                math.abs(xMap.invTransform(2 * px) - xMap.invTransform(px))
              );

              //console.log("step", step);

              const fx = `(${fn2})-(${fn1})`;
              let diff = math.abs(math.evaluate(fx, { x: pt.x }));

              if (diff > 1e-8) {
                const d = math.abs(math.evaluate(fx, { x: pt.x + step }));
                if (d > diff) {
                  add = false;
                }

                let n = 0;
                let prevDiff = Number.MAX_VALUE;
                while (diff < prevDiff && n < 16000) {
                  n++;
                  prevDiff = diff;
                  if (add) {
                    pt.x = pt.x + step;
                    diff = math.abs(math.evaluate(fx, { x: pt.x }));
                  } else {
                    pt.x = pt.x - step;
                    diff = math.abs(math.evaluate(fx, { x: pt.x }));
                  }
                }
                //console.log("n", n);

                pt.x = pt.x - 0.5 * step;

                if (fn1.indexOf("^") === -1) {
                  const pt_y = math.evaluate(fn1, { x: pt.x });
                  pt.y = math.isNumeric(pt_y) ? pt_y : pt.y;
                } else if (fn2.indexOf("^") === -1) {
                  const pt_y = math.evaluate(fn2, { x: pt.x });
                  pt.y = math.isNumeric(pt_y) ? pt_y : pt.y;
                } else {
                  let pt_y_1 = math.evaluate(fn1, { x: pt.x });
                  pt_y_1 = math.isNumeric(pt_y_1) ? pt_y_1 : pt.y;
                  let pt_y_2 = math.evaluate(fn2, { x: pt.x });
                  pt_y_2 = math.isNumeric(pt_y_2) ? pt_y_2 : pt.y;
                  pt.y = (pt_y_1 + pt_y_2) / 2;
                }

                // pt.x = Utility.adjustForDecimalPlaces(pt.x, decimalPlacesX);
                // pt.y = Utility.adjustForDecimalPlaces(pt.y, decimalPlacesY);
                return pt;
              }
            }
            return pt;
          }

          // res = res.map((pt) => {
          //   pt.x = Utility.adjustForDecimalPlaces(
          //     parseFloat(pt.x),
          //     decimalPlacesX - 1
          //   );
          //   pt.y = Utility.adjustForDecimalPlaces(
          //     parseFloat(pt.y),
          //     decimalPlacesY - 1
          //   );
          //   return pt;
          // });

          if (prefix == "x~" || prefix == "Y~") {
            const variable = curves[0].variable;
            let fn = curves[0].fn;
            if ($.isNumeric(fn)) {
              fn = curves[1].fn;
            }

            const p = math.parse(fn);
            const scope = new Map();

            // if (
            //   res.length > 1 &&
            //   math.sign(res[0].x) != math.sign(res[res.length - 1].x)
            // ) {
            //    res.push(new Misc.Point(0, 0));
            // }
            /*if (p) {
             res = res.filter((pt) => {
              scope.set(variable, pt.x);
              const v = p.evaluate(scope);
              if (Utility.mFuzzyCompare(v, 0) || math.abs(pt.x) > 1) {
                return true;
              }
              return false;
            }); */
            //}
          }

          //console.log(res);

          res = res.map((e) => {
            return adjustIp(e);
          });

          let arr = [];
          for (let i = 0; i < res.length; i++) {
            if (
              !Utility.arrayHasPoint(
                arr,
                res[i],
                decimalPlacesX,
                decimalPlacesY
              )
            ) {
              arr.push(res[i]);
            }
          }

          res = arr;

          /* res = arr.map((e) => {
            return adjustIp(e);
          }); */

          res = res.filter((item, index) => {
            if (index > 0) {
              return (
                res[index - 1].x !== res[index].x ||
                res[index - 1].y !== res[index].y
              );
            }
            return true;
          });

          let str = "";
          for (let i = 0; i < res.length; i++) {
            const element = res[i];
            const { spacing, align } = getArrowSymbolProperties();
            const ipName = Utility.generateCurveName(self, prefix);
            const marker = new PlotMarker(ipName);
            marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
            marker.setXAxis(curves[0].xAxis());
            marker.setYAxis(curves[0].yAxis());

            // const sym = new Symbol2();
            // sym.setBrush(new Misc.Brush(Static.NoBrush));
            // sym.setSize(new Misc.Size(10, 10));
            // sym.setStyle(Symbol2.Style.Ellipse);
            // marker.setSymbol(sym);

            marker.setSymbol(new PointMarkerSymbol());
            let toolTipName = "Intersection point:";
            if (ipName.indexOf("x~") !== -1) {
              toolTipName = "X-Intercept:";
            }
            if (ipName.indexOf("Y~") !== -1) {
              toolTipName = "Y-Intercept:";
            }
            marker.toolTipValueName = toolTipName;

            marker.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
            marker.setLegendIconSize(new Misc.Size(10, 10));

            marker.setValue(element);
            marker.setLabel(ipName);
            var m_symbol = marker.symbol();
            m_symbol.setSize(new Misc.Size(10, 10));
            marker.setLabelAlignment(align | Static.AlignBottom);
            marker.setSpacing(spacing);

            marker.setLabelFont(
              new Misc.Font({
                fontColor: "#000000",
                name: "Times New Roman",
                style: "normal",
                th: 12,
                weight: "bold",
              })
            );

            marker.attach(self);
          }

          if (res.length == 0) {
            //alert(`0 points of intersection:\n`);
            if (prefix === "x~") alert(`No X-Intercept:\n`);
            else if (prefix === "Y~") alert(`No Y-Intercept:\n`);
            else alert(`0 points of intersection:\n`);
          }
        }
      }
    }

    function curveSelectorCb(curves) {
      doCombine(curves);
    }

    this.curveSelector = new CurveSelector(this);

    Static.bind("selectedCurves", function (e, curves) {
      //console.log(curves);
      curveSelectorCb(curves);
    });

    // this.curveSelector.setMousePattern(Static.LeftButton, Static.AltModifier);

    // this.curveSelector.setAbortMousePattern(
    //   Static.MidButton,
    //   Static.AltModifier
    // );

    // this.curveSelector.setAbortLastMousePattern(
    //   Static.MidButton,
    //   Static.ControlModifier
    // );

    // Static.bind("selectionAborted", function () {
    //   functions = [];
    //   curves = [];
    // });

    // Static.bind("lastSelectionAborted", function () {
    //   functions.pop();
    //   curves.pop();
    // });

    this.cs = new CurveShapeItem(this);
    //this.cs.attach(this);

    this.curveShapeEnabledByPlotSettings = function () {
      return m_curveShapeEnabledByPlotSettings;
    };

    this.setCurveShapeEnabledByPlotSettings = function (on) {
      m_curveShapeEnabledByPlotSettings = on;
    };

    this.setAxisTitle(Axis.AxisId.xBottom, "Bottom scale");
    this.setAxisTitle(Axis.AxisId.xTop, "Top scale");
    this.setAxisTitle(Axis.AxisId.yLeft, "Left scale");
    this.setAxisTitle(Axis.AxisId.yRight, "Right scale");

    this.magnifier = new Magnifier(this);

    Static.bind("magnifyingStart", function () {
      if (self.tbar.isButtonChecked(self.tbar.auto)) {
        self.setAxesAutoScale(false);
        self.tbar.setButtonCheck(self.tbar.pan, true);
        self.pan.setEnabled(true);
        self.zm.setEnabled(false);
      }
    });

    // Static.bind("rescaled", (e, auto) => {
    //   if (auto) {
    //     self.zm.setEnabled(false);
    //   }
    // });

    this.pan = new Panner(this);
    this.pan.setCursor("move");
    this.pan.setEnabled(false);

    this.zm = new MyPlotZoomer(this);
    var m_settings = null;
    this.leftSidebar = new PlotSideBar(this, self.plotDiv);
    this.leftSidebar.setTop(parseInt($("#toolBar1").css("height")) + 2);
    var pp = new CurvePropertiesPane(
      this.leftSidebar.gridItem(0).bodyElement,
      this,
      Static.curvePropPane
    );
    m_settings = new PlotPropertiesPane(
      this.leftSidebar.gridItem(1).bodyElement,
      this,
      Static.plotPropPane
    );
    this.plotPropertiesPane = m_settings;

    ///////////////////////////Handle Sidebars//////////////////
    Static.bind("sidebarShown", (e, anchorPosition, on) => {
      const plotDivContainerSize = self.plotDivContainerSize();
      if (anchorPosition === "left") {
        if (on) {
          if (!self.rightSidebar || !self.rightSidebar.isSideBarVisible()) {
            const percentW =
              (100 * parseFloat(self.leftSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            plotDiv.css("width", 98 - percentW + "%");
            plotDiv.css("left", percentW + "%");
          } else {
            const leftSidebarPercentW =
              (100 * parseFloat(self.leftSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            const rightSidebarPercentW =
              (100 * parseFloat(self.rightSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            plotDiv.css(
              "width",
              98 - leftSidebarPercentW - rightSidebarPercentW + "%"
            );
            plotDiv.css("left", leftSidebarPercentW + "%");
          }
        } else {
          if (!self.rightSidebar || !self.rightSidebar.isSideBarVisible()) {
            plotDiv.css("width", 98 + "%");
            plotDiv.css("left", "0%");
          } else {
            const rightSidebarPercentW =
              (100 * parseFloat(self.rightSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            //console.log(rightSidebarPercentW);
            plotDiv.css("width", 98 - rightSidebarPercentW + "%");
            plotDiv.css("left", "0%");
          }
        }
      }

      if (anchorPosition === "right") {
        if (on) {
          //right sidebar on
          if (!self.leftSidebar || !self.leftSidebar.isSideBarVisible()) {
            const percentW =
              (100 * parseFloat(self.rightSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            plotDiv.css("width", 98 - percentW + "%");
            plotDiv.css("right", percentW + "%");
          } else {
            const leftSidebarPercentW =
              (100 * parseFloat(self.leftSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            const rightSidebarPercentW =
              (100 * parseFloat(self.rightSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            plotDiv.css(
              "width",
              98 - leftSidebarPercentW - rightSidebarPercentW + "%"
            );
            plotDiv.css("left", leftSidebarPercentW + "%");
            self.rightSidebar
              .html()
              .css("left", 100 - rightSidebarPercentW + "%");
          }
        } else {
          //right sidebar off
          if (!self.leftSidebar || !self.leftSidebar.isSideBarVisible()) {
            plotDiv.css("width", 98 + "%");
            plotDiv.css("left", "0%");
          } else {
            const leftSidebarPercentW =
              (100 * parseFloat(self.leftSidebar.html().css("width"))) /
              plotDivContainerSize.width;
            plotDiv.css("width", 98 - leftSidebarPercentW + "%");
            plotDiv.css("left", leftSidebarPercentW + "%");
          }
        }
      }
    });
    /////////////////////////////////////////////////////////

    this.leftSidebar.showGridItem(1, true);

    this.rightSidebar = new InfoSideBar(this, self.plotDiv);
    this.rightSidebar.setTop(parseInt($("#toolBar1").css("height")) + 2);
    var pp = new InfoPropertiesPane(
      this.rightSidebar.gridItem(0).bodyElement,
      this,
      Static.infoPropPane
    );
    //this.rightSidebar.showGridItem(0, true);
    this.rightSidebar.showSidebar(false);

    //var m_settings = new MSettings();
    this.settings = function () {
      return m_settings;
    };
    //m_settings.setPlot(this);

    this.setFooter("Footer");

    var legendMenu = new LegendMenu(this);
    function axisDlgFn() {
      var curve = legendMenu.getCurve();
      if (!curve) return;
      self.axisDlg.axisCb(curve);
    }
    legendMenu.modifyMenu(null, {
      pos: 2,
      name: "axis",
      img: Static.imagePath + "axis.png",
      title: "Sets the axes associated with the curve.",
      fun: axisDlgFn,
    });

    legendMenu.setMenuModificationCb(function () {
      var curve = legendMenu.getCurve();

      if (Static.aspectRatioOneToOne) {
        legendMenu.modifyMenu("axis", {});
      } else {
        legendMenu.modifyMenu(null, {
          pos: 2,
          name: "axis",
          img: Static.imagePath + "axis.png",
          title: "Sets the axes associated with the curve.",
          fun: axisDlgFn,
        });
      }

      if (
        curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectrogram ||
        curve.rtti === PlotItem.RttiValues.Rtti_PlotZone ||
        curve.rtti === PlotItem.RttiValues.Rtti_PlotMarker
      ) {
        legendMenu.modifyMenu("curve brush", {}); //index 0
        legendMenu.modifyMenu("curve style", {}); //index 1
        legendMenu.modifyMenu("legend attribute", {}); //index 3
        legendMenu.modifyMenu("fit", {}); //index 6
        legendMenu.modifyMenu("symbol", {}); //index 7
        legendMenu.modifyMenu("pen", {}); //index 8
        legendMenu.modifyMenu("Zone", {}); //index 9
      } else {
        legendMenu.modifyMenu(null, [
          {
            pos: 0,
            name: "curve brush",
            img: Static.imagePath + "brush.png",
            title: "Set the fill color.",
            fun: function () {
              Utility.setCurveBrush(m_curve, function (curve) {
                Static.trigger("curveBrushChanged", curve);
              });
            },
          },
          {
            pos: 1,
            name: "curve style",
            img: Static.imagePath + "style.png",
            title: "Sets the style of the curve.",
            fun: function () {
              var curve = legendMenu.getCurve();
              if (!curve) return;
              self.curveStyleDlg.curveStyleCb(curve);
            },
          },
          {
            pos: 3,
            name: "legend attribute",
            img: Static.imagePath + "attribute.png",
            title: "Sets how the curve is represented on the legend.",
            fun: function () {
              var curve = legendMenu.getCurve();
              if (!curve) return;
              self.curveAttributeDlg.curveAttributeCb(curve);
            },
          },
          {
            pos: 6,
            name: "fit",
            img: Static.imagePath + "fit.png",
            title: "Defines a curve fitter.",
            fun: function () {
              var curve = legendMenu.getCurve();
              if (!curve) return;
              self.curveFitDlg.curveFitCb(curve);
            },
          },
          {
            pos: 7,
            name: "symbol",
            img: Static.imagePath + "symbol.png",
            title: "attach/modify curve symbol",
            subMenu: null,
          },
          {
            pos: 8,
            name: "pen",
            img: Static.imagePath + "pen.png",
            title: "modify/change curve pen",
            subMenu: legendMenu.getPenSubMenu(),
          },
        ]);
      }

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        legendMenu.modifyMenu(null, {
          name: "pen width",
          subMenu: legendMenu.getPenWidthSubMenu(),
        });
      } else {
        legendMenu.modifyMenu("pen width", {});
      }

      if (!legendMenu.getCurve().fitType) {
        legendMenu.modifyMenu("fit info...", {});
        return;
      }

      //legendMenu.modifyMenu(null, menuArray1);

      legendMenu.modifyMenu(null, {
        pos: 100,
        name: "fit info...",
        title: "Displays information associated with curve fitting.",
        fun: function () {
          var curve = legendMenu.getCurve();
          if (!curve) return;
          var info = self.curveFitDlg.curveFitInfoCb(curve);
          if (info.length) {
            Utility.alert(info);
          } else {
            Utility.alert(
              'No curve fitting equation found for "' + curve.title() + '."'
            );
          }
        },
      });
    });

    this.file.setInputElement($("#fileInput"));

    this.replot();
    this.setAutoReplot(true);

    Static.bind("visibilityChange", function (e, plotItem, on) {
      if (
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        if (!self.hasVisiblePlotCurve()) {
          self.watchAreaBelowCurve.setEnable(false);
        } else {
          self.watchAreaBelowCurve.setEnable(
            self.tbar.isDropdownItemChecked("Watch", 6)
          );
        }
      }
    });

    var el = self.getLayout().getCentralDiv();

    // el.on("touchend", function () {
    //   console.log(456);
    // });
    //console.log(el);
    var menu = [
      {
        name: "Hide rulers",
        img: Static.imagePath + "hide.png",
        title: "Hide all rulers",
        fun: function () {
          self.rv.setVisible(false);
        },
      },
      {
        name: "Show rulers",
        img: Static.imagePath + "show.png",
        title: "Show any hidden rulers",
        //disable: true,
        fun: function () {
          self.rv.setVisible(true);
        },
      },
      {
        name: "Unlock rulers",
        img: Static.imagePath + "unlock.png",
        title: "Unlock any locked rulers",
        //disable: true,
        fun: function () {
          self.rv.unlockAllRulers();
        },
      },
      {
        name: "Remove all items",
        title: "Permanently remove all items",
        //disable: true,
        img: Static.imagePath + "trashAll.png",
        fun: function () {
          var L = self
            .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotZone))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotMarker));

          L.forEach(function (curve) {
            if (
              curve.title() !== "cgMarker@12345" &&
              curve.title() !== "ClosestPointMarker123@###" &&
              curve.title() !== "v_ruler1" &&
              curve.title() !== "v_ruler2" &&
              curve.title() !== "h_ruler1" &&
              curve.title() !== "h_ruler2"
            ) {
              self.trashDlg.trash(curve);
              // curve.detach();
              // curve.delete();
            }
          });
        },
      },
      {
        name: "Remove all hidden items",
        title: "Permanently remove all hidden items",
        //disable: true,
        img: Static.imagePath + "trashAllHidden.png",
        fun: function () {
          var L = self
            .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotZone))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotMarker));

          L.forEach(function (curve) {
            if (
              curve.title() !== "cgMarker@12345" &&
              curve.title() !== "ClosestPointMarker123@###" &&
              curve.title() !== "v_ruler1" &&
              curve.title() !== "v_ruler2" &&
              curve.title() !== "h_ruler1" &&
              curve.title() !== "h_ruler2"
            ) {
              if (!curve.isVisible()) {
                self.trashDlg.trash(curve);
                // curve.detach();
                // curve.delete();
              }
            }
          });
        },
      },
      {
        name: "Hide all items",
        title: "Hide all items",
        //disable: true,
        img: Static.imagePath + "hide.png",
        fun: function () {
          var L = self
            .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotZone))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotMarker));

          L.forEach(function (curve) {
            //console.log(curve.title());
            if (
              curve.title() !== "cgMarker@12345" &&
              curve.title() !== "ClosestPointMarker123@###" &&
              curve.title() !== "v_ruler1" &&
              curve.title() !== "v_ruler2" &&
              curve.title() !== "h_ruler1" &&
              curve.title() !== "h_ruler2"
            )
              curve.setVisible(false);
            //Static.trigger("hideAllItems");
          });
          Static.trigger("hideAllItems");
        },
      },
      {
        name: "Show all items",
        title: "Show all items",
        //disable: true,
        img: Static.imagePath + "show.png",
        fun: function () {
          var L = self
            .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotZone))
            .concat(self.itemList(PlotItem.RttiValues.Rtti_PlotMarker));

          L.forEach(function (curve) {
            if (
              curve.title() !== "cgMarker@12345" &&
              curve.title() !== "ClosestPointMarker123@###" &&
              curve.title() !== "v_ruler1" &&
              curve.title() !== "v_ruler2" &&
              curve.title() !== "h_ruler1" &&
              curve.title() !== "h_ruler2"
            )
              curve.setVisible(true);
            //Static.trigger("showAllItems");
          });
          Static.trigger("showAllItems");
        },
      },
    ];

    Static.bind("rulerDeselected", function () {
      el.contextMenu(menu, {
        triggerOn: "contextmenu",
        zIndex: 1,
      });
    });
    //Start with this menu
    el.contextMenu(menu, {
      triggerOn: "contextmenu",
      zIndex: 1,
    });

    var m_gridlinesAccordingToCurve = true;

    Static.bind(
      "gridlinesAccordingToCurve",
      function (e, gridlinesAccordingToCurve) {
        m_gridlinesAccordingToCurve = gridlinesAccordingToCurve;
        var currentCurve = rulers.currentCurve();
        if (currentCurve && m_gridlinesAccordingToCurve) {
          self.grid.setAxes(currentCurve.xAxis(), currentCurve.yAxis());
        }
      }
    );

    Static.bind("currentCurveChanged", function (e, newCurve) {
      if (newCurve && m_gridlinesAccordingToCurve) {
        self.grid.setAxes(newCurve.xAxis(), newCurve.yAxis());
      }
      if (newCurve && m_zoomAccordingToCurve) {
        self.zm.setAxis(newCurve.xAxis(), newCurve.yAxis());
      }
      /* if (newCurve) {
        const sz = newCurve.dataSize();
        const val = (1 / 100) * sz;
        console.log(val);
        if(!Static.dicontinuityUserSetting){
          Static.dicontinuityOffsetFactor = val / Static.dicontinuityFactor;
          Static.trigger("dicontinuityOffsetFactor", val);
        }
      } */
    });

    Static.bind("axisChanged", function (e, axis, curve) {
      var c = self.rv.currentCurve() || curve;
      //console.log(c.title())

      if (curve && m_gridlinesAccordingToCurve) {
        self.grid.setAxes(c.xAxis(), c.yAxis());
      }
      if (curve && m_zoomAccordingToCurve) {
        self.zm.setAxis(c.xAxis(), c.yAxis());
      }
    });

    var m_zoomAccordingToCurve = true;

    Static.bind("zoomAccordingToCurve", function (e, zoomAccordingToCurve) {
      m_zoomAccordingToCurve = zoomAccordingToCurve;
      var currentCurve = rulers.currentCurve();
      if (currentCurve && m_zoomAccordingToCurve) {
        self.zm.setAxis(currentCurve.xAxis(), currentCurve.yAxis());
      }
    });

    /* Static.bind("currentCurveChanged", function (e, newCurve) {
          if (newCurve && m_zoomAccordingToCurve){
            self.zm.setAxis(newCurve.xAxis(), newCurve.yAxis());				
          }
        }); */

    /* Static.bind("axisChanged", function (e, axis, curve) {
          if (curve && m_zoomAccordingToCurve){
            self.zm.setAxis(curve.xAxis(), curve.yAxis());				
          }
        }); */

    ///////////////////Mongo-Filesystem///////////////////////////////////////
    //fsServerUrl: "https://grapher-file-system.herokuapp.com",
    //imageLoaderSrc: "img/imageLoader.png",
    //imageFolderSrc: "img/folder.png",
    // imageFileSrc: "img/file.png",
    //accessTokenExpiry: 20, //default == 10
    //persistSession: false, //default === true
    const fsOptions = {
      //zIndex: 2000,
      enableNotepad: true,
      //For Dev. Uncomment the following line.
      //fsServerUrl: "http://localhost:5000",
      fsServerUrl: "https://easy-grapher.herokuapp.com", //only necessary for cross domain

      listOfFileTypes: [
        {
          display: "Grapher plot (*.plt)",
          ext: ".plt",
          defaultFilename: "Grapher Plot",
        },
        {
          display: "Data table (*.tbl)",
          ext: ".tbl",
          defaultFilename: "Data table",
        },
        {
          display: "Defines (*.def)",
          ext: ".def",
          defaultFilename: "Defines",
        },
        {
          display: "Image (*.png)",
          ext: ".png",
          defaultFilename: "PNG Image",
        },
        {
          display: "Excel (*.xls)",
          ext: ".xls",
          defaultFilename: "Excel Worksheet",
        },
      ],

      listOfOpenWithTypes: [
        /* This type is added by default when notepad is enabled (i.e. enableNotepad: true) */
        /* { 
          name: "Text Editor", 
          options: { encoding: "utf8", flag: "r" } 
        }, */
        {
          img: Static.imagePath + "favicon.ico",
          name: "Grapher",
          options: { encoding: "utf8", flag: "r" },
        },
      ],
    };

    function p(params) {
      return new Promise((resolve, reject) => {
        resolve(localStorage.getItem("RefreshToken"));
      });
    }

    class FileSystem extends FileSystemServices {
      constructor(options) {
        super(options);
        const self = this;

        $(window).on("beforeSave", () => {});

        $(window).on("afterSave", () => {
          $("#myText").focus();
        });

        $("#myText").on("input", () => {
          self.currentFileModified();
        });

        $(window).bind("connected", () => {
          $("#fileInput").parent().prop("disabled", true);

          $("#fileInput")
            .parent()
            .attr(
              "title",
              "Upload data files. (This function is not availabe while you are logged in to the momgo fileSystemServices."
            );
        });
        $(window).bind("disconnected", () => {
          $("#fileInput").parent().prop("disabled", false);
          $("#fileInput")
            .parent()
            .attr(
              "title",
              "Upload data files. (This function is not availabe while logged in to the momgo fileSystemServices."
            );
        });
      }

      setData(data, filename, fileExt, editor) {
        //if (fileExt == '.plt' || editor == "Grapher") {
        // console.log(`Do not know how to open files with extension "${fileExt}".`);
        alert(`Do not know how to open files with extension "${fileExt}".`);
        // }
      }

      getRefreshToken() {
        return super.getRefreshToken();
      }
    }

    const fileSystemServices = (self.fileSystemServices = new FileSystem(
      fsOptions
    ));

    class GrapherEditor extends Editor {
      constructor(plot, options) {
        super(options);
        const self = this;
        this.plot = plot;
        this.fileNameBeforeSave = null;

        //Associate save and saveas menu items with the editor
        options.fs.addSaveAndSaveAsMenuItems();

        options.fs.registerEditor({ name: "Grapher", editor: self });

        //If the editor has content from a known file (i.e self.currentFilename() returns a valid filename)
        //and an input is detected, we set the currentFileModified flag (i.e we call currentFileModified(true))
        Static.bind("replot", function () {
          //console.log(456, self.currentFilename());
          if (self.currentFilename()) {
            self.currentFileModified(true);
            self.fileNameBeforeSave = self.currentFilename();
          }
        });
      }
      getData() {
        return self.file.getPlotData(); //'[{"bottomScaleEngineType":"[LinearScaleEngine]","leftScaleEngineType":"[LinearScaleEngine]","topScaleEngineType":"[LinearScaleEngine]","rightScaleEngineType":"[LinearScaleEngine]","title":"Plot","titleFont":{"th":20,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"footer":"Footer","footerFont":{"th":15,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"axisTitleFont":{"th":14,"name":"Arial","style":"normal","weight":"normal","fontColor":"black"},"xBottomAxisTitle":"Bottom scale","xTopAxisTitle":"Top scale","yLeftAxisTitle":"Left scale","yRightAxisTitle":"Right scale","autoScale":true},{"rtti":5,"title":"curve_1","functionDlgData":{"rtti":5,"coeffs":[],"expandedFn":"x^2","fn":"x^2","lowerLimit":-10,"numOfPoints":100,"threeD":false,"title":"curve_1","unboundedRange":false,"upperLimit":10,"variable":"x"},"fn":"x^2","pen":{"color":"rgb(75,122,25)","width":1,"style":"solid"},"symbolType":-1,"style":0,"xAxis":2,"yAxis":0}]';
      }

      setData(data, filename, ext, editorName) {
        const self = this;
        if (
          ext === ".tbl" ||
          ext === ".txt" ||
          ext === ".plt" ||
          editorName == "Grapher"
        ) {
          if (!self.currentFileModified()) {
            if (ext === ".plt" || ext === ".txt" || ext === ".tbl") {
              self.plot.file.setPlotData(
                { content: data, fileName: filename },
                true
              );
            }
            if (ext === ".plt") {
              self.currentFilename(filename);
            }
          } else {
            /* const saveChg = confirm(
              `Would you like to save the changes to ${this.currentFilename()}?`
            );
            if (!saveChg) {
              if (ext === ".plt" || ext === ".txt" || ext === ".tbl") {
                self.file.setPlotData(
                  { content: data, fileName: filename },
                  true
                );
              }
              if (ext === ".plt") {
                this.currentFilename(filename);
              }
            } */

            Utility.alertYesNo(
              `Would you like to save the changes to ${self.fileNameBeforeSave}?`,
              function (answer) {
                if (answer == Cancel) {
                  // if (sideBarHidden) {
                  //   _plot.rightSidebar.showSidebar(true);
                  // }
                  if (ext === ".plt") {
                    self.currentFilename(self.fileNameBeforeSave);
                    self.currentFileModified(true);
                  }

                  return;
                }
                if (answer == Yes) {
                  if (ext === ".plt") {
                    self.currentFilename(self.fileNameBeforeSave);
                    self.currentFileModified(true);
                  }
                  return;
                }
                if (answer == No) {
                  // if (sideBarHidden) {
                  //   _plot.rightSidebar.showSidebar(true);
                  // }

                  if (ext === ".plt" || ext === ".txt" || ext === ".tbl") {
                    self.plot.file.setPlotData(
                      { content: data, fileName: filename },
                      true
                    );
                  }
                  if (ext === ".plt") {
                    self.currentFilename(filename);
                    self.currentFileModified(false);
                  }

                  return;
                }
              }
            );
          }
        }
      }
    }

    class DefinesEditor extends Editor {
      constructor(plot, options) {
        super(options);
        const self = this;
        this.m_plot = plot;
        this.fs = options.fs;

        options.fs.registerEditor({ name: "Defines", editor: self });
      }

      getData() {
        return self.file.getPlotData(); //'[{"bottomScaleEngineType":"[LinearScaleEngine]","leftScaleEngineType":"[LinearScaleEngine]","topScaleEngineType":"[LinearScaleEngine]","rightScaleEngineType":"[LinearScaleEngine]","title":"Plot","titleFont":{"th":20,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"footer":"Footer","footerFont":{"th":15,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"axisTitleFont":{"th":14,"name":"Arial","style":"normal","weight":"normal","fontColor":"black"},"xBottomAxisTitle":"Bottom scale","xTopAxisTitle":"Top scale","yLeftAxisTitle":"Left scale","yRightAxisTitle":"Right scale","autoScale":true},{"rtti":5,"title":"curve_1","functionDlgData":{"rtti":5,"coeffs":[],"expandedFn":"x^2","fn":"x^2","lowerLimit":-10,"numOfPoints":100,"threeD":false,"title":"curve_1","unboundedRange":false,"upperLimit":10,"variable":"x"},"fn":"x^2","pen":{"color":"rgb(75,122,25)","width":1,"style":"solid"},"symbolType":-1,"style":0,"xAxis":2,"yAxis":0}]';
      }

      setData(data, filename, ext, editorName) {
        this.m_plot.defines.processUploadData({
          fileName: filename,
          content: data,
        });
        //Close the mongo file explorer
        this.fs.closeExplorerDlg();
      }
    }

    const options = {};
    options.fs = fileSystemServices;
    options.editorName = "Grapher";
    options.fileExtensions = [".plt", ".tbl", ".txt"];
    //options.explorerDialogParentId = "plotDiv";

    self.grapherEditor = new GrapherEditor(self, options);

    //If not called and the buit-in notepad is enabled, notepad is assume to be the default editor
    options.fs.setDefaultEditor(self.grapherEditor);

    const definesOptions = {};
    definesOptions.fs = fileSystemServices;
    definesOptions.editorName = "Defines";
    definesOptions.fileExtensions = [".def", ".txt"];
    //options.explorerDialogParentId = "definesModal";

    this.defines = new MDefines(this);

    /*DefinesDlg is a subclass of ModalDlg. Thus, it is only attached to the DOM when it is visible. Since DefinesEditor is a subclass of Editor and Editor binds events during construction, we must ensure that DefinesDlg is visble before DefinesEditor instances are created.*/

    const definesDlg = this.defines.getDefinesDlg();
    const definesDlgModal = definesDlg.getDlgModal();
    $("body").append(definesDlgModal);
    self.definesEditor = new DefinesEditor(self, definesOptions);
    this.defines.setEditor(self.definesEditor);
    definesDlgModal.detach();

    //console.log(fileSystemServices);

    //this.defines = new MDefines(this, self.definesEditor);

    //console.log(this.defines.getDlg().selector("definesUploadButton"));

    //this.defines.setEditor(self.definesEditor);

    //fileSystemServices.enableNotepad();
    ////////////////////////////////////////////////////////////////

    // var leftSidebarVisible_gridItem_0 = false;
    // var leftSidebarVisible_gridItem_1 = false;
    // var rightSidebarVisible = false;
    function beforePrintCb() {
      // leftSidebarVisible_gridItem_0 = self.leftSidebar.isGridItemVisible(0);//self.leftSidebar.isSideBarVisible();
      // if (leftSidebarVisible_gridItem_0)
      // 	self.leftSidebar.showGridItem(0, false);
      // leftSidebarVisible_gridItem_1 = self.leftSidebar.isGridItemVisible(1);//self.leftSidebar.isSideBarVisible();
      // if (leftSidebarVisible_gridItem_1)
      // 	self.leftSidebar.showGridItem(1, false);
      // rightSidebarVisible = self.rightSidebar.isSideBarVisible();
      // if (rightSidebarVisible)
      // 	self.rightSidebar.showSidebar(false);
      console.log("before Print");
    }

    function afterPrintCb() {
      // self.rightSidebar.showSidebar(rightSidebarVisible);
      // self.leftSidebar.showGridItem(0, leftSidebarVisible_gridItem_0);
      // self.leftSidebar.showGridItem(1, leftSidebarVisible_gridItem_1);
      console.log("after Print");
    }

    // self.registerPrintCb("beforePrint", beforePrintCb);
    // self.registerPrintCb("afterPrint", afterPrintCb);
    // var f = new Misc.Font();
    // f.th = 20;
    // this.setAxisLabelFont(Axis.AxisId.xBottom, f)

    // const options2 = {
    //     hideAlphas: true,
    //     title: 'Function Editor',
    //     screenColor: "#fff",
    //     screenTextColor: "#00f",
    //     prettyOnly: true,
    //     initializeWithLastValue: true,
    //     validOnly: true,
    //     bigDialog: true,
    //     //operatorButtonTextColor: "red"
    //     //buttonImages: {xSquareImg: "img/xSquare3.png"}
    //     // buttonImages: {xSquareImg: "Sqr", squareRootImg: "Sqrt", xToPowYImg: "x^y"}
    // }

    // //Create a second equation editor that will be trigger when a clickable html element with id 'test2' is clicked.
    // let edlg = new EquationEditor("equationEditor"/* , options2 */);

    // console.log(edlg)

    /* $(window).bind("equationEditorAngleModeChanged", function (e, mode) {
      console.log(mode);
    });

    var core = nerdamer.getCore();
    var _ = core.PARSER;
    core.Math2.sin_d = function (x) {
      return sin((x * pi) / 180);
    };
    //symbolic handler
    function symbolicHandler(x) {
      //for simplicity we'll work stricly with the Symbol class
      //Remember earlier we spoke of calling clone? In this case the A !== a
      //but it's good practice to call clone on values that are going to be reused
      //If a was to become 2*a then we'd also be dividing by 2*a and not a
      return new core.Symbol(Math.sin((x * Math.PI) / 180));
    }
    //let nerdamer know that it's ok to access this function
    //we do that using an array. The first parameter is the special handler
    //which we'll leave blank for now. This will only give it numeric capabilities
    _.functions.sin_d = [symbolicHandler, 1];
    //we can now use the function
    // var x = nerdamer("sin_d(90)").evaluate();
    // console.log(x.toString()); //i

    // x = nerdamer("solve(sin_d(x)=0,x)");
    // console.log(x.toString());

    core.Math2.asin_d = function (x) {
      return (Math.asin(x) * 180) / Math.PI;
    };
    //symbolic handler
    function symbolicHandler2(x) {
      //for simplicity we'll work stricly with the Symbol class
      //Remember earlier we spoke of calling clone? In this case the A !== a
      //but it's good practice to call clone on values that are going to be reused
      //If a was to become 2*a then we'd also be dividing by 2*a and not a
      return new core.Symbol((Math.asin(x) * 180) / Math.PI);
    }
    //let nerdamer know that it's ok to access this function
    //we do that using an array. The first parameter is the special handler
    //which we'll leave blank for now. This will only give it numeric capabilities
    _.functions.asin_d = [symbolicHandler2, 1];
    //we can now use the function
    // var x = nerdamer("asin_d(0.5)").evaluate();
    // console.log(x.toString()); //i

    // var x = nerdamer("solve(sin_r(x)=0,x)");
    // console.log(x.toString()); */

    const tbDiv = this.tbar.html(); //display: inline-block;
    //tbDiv.attr("display", "inline-block");

    // tbDiv.append(
    //   $(
    //     '<span class="GrapherTitle" style="cursor:default;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;width:130px; margin:5px"></span>'
    //   )
    // );

    // const last = $(tbDiv[0].lastChild);
    tbDiv.append(
      $(
        '<span class="GrapherTitle" style="cursor:default;text-overflow:ellipsis;white-space:nowrap;overflow:hidden; margin:5px; margin-left:20px"></span>'
      )
    );

    // console.log(tbDiv[0].lastChild);

    $(".GrapherTitle").mouseenter(function () {
      $(this).attr("title", $(this).html());
    });

    self.grapherEditor.initEditor();

    self.plotPropertiesPane.setPlotPropertiesSettings();

    ///////////////////////////////////Drag Sidebar Code///////////////////
    const leftSidebarSelector = this.leftSidebar.html();
    const rightSidebarSelector = this.rightSidebar.html();
    const plotContainerSelector = $(".plotContainer");

    let leftDividerPos = parseFloat(leftSidebarSelector.css("width"));

    let rightDividerPos;

    const originalCursor = leftSidebarSelector.css("cursor");
    const originalBorder = leftSidebarSelector.css("border");

    let onLeftDividerDrag = false;
    let onLeftDivider = false;
    let onRightDividerDrag = false;
    let onRightDivider = false;

    let originalLeftDividerPos = leftDividerPos;

    //aspectRatioUpdate
    $("body").on("mousemove", (e) => {
      const doAutoReplot = self.autoReplot();
      self.setAutoReplot(false);
      const oneToOne = Static.aspectRatioOneToOne;

      //e.preventDefault();

      //////Left Sidebar Code////////
      if (!onLeftDividerDrag) {
        if (Math.abs(e.clientX + 3 - leftDividerPos) < 6) {
          $("body").addClass("ewResizeCursor");
          onLeftDivider = true;
        } else {
          if (!onRightDividerDrag) {
            $("body").removeClass("ewResizeCursor");
          }
          onLeftDivider = false;
        }
      }
      if (onLeftDividerDrag) {
        if (oneToOne) {
          Static.aspectRatioOneToOne = false;
          self.plotPropertiesPane.aspectRatioUpdate();
        }
        const oldWidth = parseFloat(leftSidebarSelector.css("width"));
        const delta = e.clientX - oldWidth;
        let percentW = self.elementWidthToPercentage(oldWidth + delta);
        leftSidebarSelector.css("width", percentW);
        percentW = self.elementWidthToPercentage(
          parseFloat(plotContainerSelector.css("left")) + delta
        );
        plotContainerSelector.css("left", percentW);
        percentW = self.elementWidthToPercentage(
          parseFloat(plotContainerSelector.css("width")) - delta
        );
        plotContainerSelector.css("width", percentW);
        leftDividerPos = oldWidth + delta;
      }

      //////Right Sidebar Code////////
      if (!onRightDividerDrag) {
        if (Math.abs(e.clientX - rightDividerPos) < 6) {
          rightSidebarSelector.css("cursor", "ew-resize");
          $("body").css("cursor", "ew-resize");
          onRightDivider = true;
        } else {
          rightSidebarSelector.css("cursor", originalCursor);
          $("body").css("cursor", originalCursor);
          onRightDivider = false;
        }
      }
      if (onRightDividerDrag) {
        if (oneToOne) {
          Static.aspectRatioOneToOne = false;
          self.plotPropertiesPane.aspectRatioUpdate();
        }
        const delta = rightDividerPos - e.clientX;
        let percentW = self.elementWidthToPercentage(
          parseFloat(rightSidebarSelector.css("left")) - delta
        );
        rightSidebarSelector.css("left", percentW);
        percentW = self.elementWidthToPercentage(
          parseFloat(rightSidebarSelector.css("width")) + delta
        );
        rightSidebarSelector.css("width", percentW);
        percentW = self.elementWidthToPercentage(
          parseFloat(plotContainerSelector.css("width")) - delta
        );
        plotContainerSelector.css("width", percentW);
        rightDividerPos = parseFloat(rightSidebarSelector.css("left"));
      }
      if (oneToOne) {
        Static.aspectRatioOneToOne = true;
        self.plotPropertiesPane.aspectRatioUpdate();
      }
      self.setAutoReplot(doAutoReplot);
      self.autoRefresh();
    });

    leftSidebarSelector.on("mousedown", (e) => {
      // e.preventDefault();
      // if (Static.aspectRatioOneToOne) {
      //   return;
      // }
      if (onLeftDivider) {
        leftSidebarSelector.css({ "border-right": "3px solid #f0F" });
        onLeftDividerDrag = true;
      }
    });

    rightSidebarSelector.on("mousedown", (e) => {
      //e.preventDefault();
      // if (Static.aspectRatioOneToOne) {
      //   return;
      // }
      if (onRightDivider) {
        rightSidebarSelector.css({ "border-left": "3px solid #f0F" });
        onRightDividerDrag = true;
      }
    });

    let originalRightDividerPos;
    Static.bind("sidebarShown", (e, m_anchorPosition, on) => {
      if (m_anchorPosition === "left") {
        if (on) {
          //leftDividerPos = parseFloat(plotDiv.css("width"));
        }
      }
      if (m_anchorPosition === "right") {
        if (on) {
          rightDividerPos =
            self.plotDivContainerSize().width -
            2 -
            parseFloat(rightSidebarSelector.css("width"));
        }
      }
    });

    Static.bind("resize", () => {
      if (self.leftSidebar.isSideBarVisible()) {
        leftDividerPos = parseFloat(self.leftSidebar.html().css("width"));
      }
      if (self.rightSidebar.isSideBarVisible()) {
        rightDividerPos =
          self.plotDivContainerSize().width -
          2 -
          parseFloat(rightSidebarSelector.css("width"));
      }
    });

    // Static.bind("aspectRatioChanged", (e, checked) => {
    //   if (checked) {
    //     self.leftSidebar.html().css("width", "20%");
    //     self.rightSidebar.html().css("width", "20%");
    //     //Static.trigger("callAspectRatioFunction", [checked, false]);
    //   }
    // });

    // Static.bind("aspectRatioChanged", (e, checked) => {
    //   if (!Static.aspectRatioOneToOne) {
    //     if (self.leftSidebar.isSideBarVisible()) {
    //       leftDividerPos = parseFloat(leftSidebarSelector.css("width"));
    //     }
    //     if (self.rightSidebar.isSideBarVisible()) {
    //       rightDividerPos = parseFloat(rightSidebarSelector.css("left"));
    //     }
    //     // plotContainerSelector.css(
    //     //   "left",
    //     //   parseFloat(leftSidebarSelector.css("width")) + 2
    //     // );
    //   } else {
    //     //Static.trigger("callAspectRatioFunction", [checked, false]);
    //     //leftSidebarSelector.css("width", originalLeftDividerPos);
    //   }
    //   // const delta =
    //   //   parseFloat(leftSidebarSelector.css("width")) - originalLeftDividerPos;
    //   // console.log(originalLeftDividerPos, delta);

    //   // plotContainerSelector.css(
    //   //   "width",
    //   //   parseFloat(plotContainerSelector.css("width")) - delta
    //   // );

    //   //Static.trigger("callAspectRatioFunction", [checked, false]);
    // });

    $("body").on("mouseup", (e) => {
      //e.preventDefault();
      // if (Static.aspectRatioOneToOne) {
      //   return;
      // }
      leftSidebarSelector.css({ "border-right": originalBorder });
      onLeftDividerDrag = false;
      rightSidebarSelector.css({ "border-left": originalBorder });
      onRightDividerDrag = false;
    });

    //f(x) is horizontal and x is vertical
    this.swapAxes = function (enableWatch = false) {
      if (!this.axesSwapped) {
        const self = this;
        const plot = self;
        let swapable = true;

        const L = self.itemList();

        for (let i = 0; i < L.length; i++) {
          const item = L[i];
          const x_axis = item.xAxis();
          const y_axis = item.yAxis();
          if (x_axis != Axis.AxisId.xBottom || y_axis != Axis.AxisId.yLeft) {
            swapable = false;
            let s = "swap";
            if (enableWatch) {
              s = "unswap";
            }
            Utility.alert(
              `Axes ${s} failed because one or more plot item(s) is(are) associated with an axis other than the bottom or left axis.`,
              null,
              "swapAxisFailed"
            );
            break;
          }
        }

        if (swapable) {
          let autoReplot = plot.autoReplot();
          plot.setAutoReplot(false);
          for (let i = 0; i < L.length; i++) {
            const item = L[i];
            // const x_axis = item.xAxis();
            // const y_axis = item.yAxis();
            // const item_title = item.title();
            // if (x_axis != Axis.AxisId.xBottom || y_axis != Axis.AxisId.yLeft) {
            //   continue;
            // }

            if (item.rtti === PlotItem.RttiValues.Rtti_PlotCurve) {
              let samples = item.data().samples();
              this.axesSwapped = true;
              if (enableWatch) {
                item.axesSwapped = false;
              } else {
                item.axesSwapped = true;
              }

              samples = samples.map(function (pt) {
                let x = pt.x;
                pt.x = pt.y;
                pt.y = x;
                return pt;
              });
              item.setSamples(samples);
              // if (item.discontinuity && item.discontinuity.length) {
              //   item.discontinuity = item.discontinuity.reverse();
              // }
            }
            if (
              item.rtti === PlotItem.RttiValues.Rtti_PlotMarker &&
              item.title() != "ClosestPointMarker123@###"
            ) {
              this.axesSwapped = true;
              item.setValue(item.yValue(), item.xValue());
            }
          }

          if (this.axesSwapped) {
            const x_scaleDiv = plot.axisScaleDiv(Axis.AxisId.xBottom);
            let x_min = x_scaleDiv.lowerBound(),
              x_max = x_scaleDiv.upperBound();

            const y_scaleDiv = plot.axisScaleDiv(Axis.AxisId.yLeft);
            let y_min = y_scaleDiv.lowerBound(),
              y_max = y_scaleDiv.upperBound();

            if (!enableWatch) {
              for (let i = 5; i < 8; i++) {
                plot.rv.watch(i).setEnable(false);
                plot.tbar.hideDropdownItem("Watch", i);
              }
            }

            if (enableWatch) {
              for (let i = 5; i < 8; i++) {
                plot.tbar.showDropdownItem("Watch", i);
                if (plot.tbar.isDropdownItemChecked("Watch", i)) {
                  plot.rv.watch(i).setEnable(true);
                }
              }
            }

            plot.setAxisScale(Axis.AxisId.xBottom, y_min, y_max);
            plot.setAxisScale(Axis.AxisId.yLeft, x_min, x_max);
            Static.trigger("invalidateWatch");
            plot.rv.updateWatchesAndTable();
            plot.setAutoReplot(autoReplot);
            plot.rv.refresh();
          }
        }

        return this.axesSwapped;
      }
    };

    //x is horizontal and f(x) is vertical
    this.unSwapAxes = function () {
      if (!this.axesSwapped) return;
      this.axesSwapped = false;
      //this.swapAxes(true);
      if (!this.swapAxes(true)) {
        this.axesSwapped = true;
        return false;
      }
      this.axesSwapped = false;
      return true;
    };
  }
}
MyPlot.init();
