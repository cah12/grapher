"include ['myLegend', 'curveClosestPoint', 'plot', 'functionData', 'plotGrid', 'spectrogram']";

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
  constructor(plotDiv, plotTitle) {
    super(plotDiv, plotTitle);

    //fileSystemUIinit();
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

    /* var m_settings = new MSettings();        
        this.settings = function () {
          return m_settings;
        }
        m_settings.setPlot(this); */

    /* const constructors = {
      curveConstructor: MyCurve,
      markerConstructor: PlotMarker,
      //arrowSymbolConstructor: PointMarkerSymbol
    }; */

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
      if (self.findPlotCurve(title)) {
        Utility.alert(title + " already exist");
        return null;
      }

      var curve = new MyCurve(title);
      curve.expandedFn = fn;

      if (!upload) self.addCurveInit(curve);

      curve.setSamples(samples);
      curve.setPen(new Misc.Pen(Utility.randomColor()));
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

      //curve.attach(self);
      //self.enableLegend(enabled);
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
      //newCurve.attach(self);
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
      //curve.setPen(new Misc.Pen(colorList[numberOfCurves(self) % 6]))
      curve.setPen(new Misc.Pen(Utility.randomColor()));
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
        let fnc = Utility.purgeAndMarkKeywords(m_fn);
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
            fnc = fnc.replace(coeffs[i], "*" + coeffs[i]);
            n = fnc.indexOf(coeffs[i]);
          }
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
            }
          }
          m_fn = Utility.replaceKeywordMarkers(_fn);
        }
      }
      return m_fn;
    }

    this.functionDlgCb = function (functionDlgData = null) {
      // const xDecimalPlaces = self.axisDecimalPlaces(Axis.AxisId.xBottom);
      // const yDecimalPlaces = self.axisDecimalPlaces(Axis.AxisId.yLeft);
      //console.log(functionDlgData);
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

      if (self._functionDlg.threeD) {
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
          if (!s) return;
          if (s.length == 0) {
            Utility.alert(
              "Unable to derive samples from the provided domain. Check the function and limits for possible divide-by-zero error"
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
      if (self._functionDlg.expandedFn) {
        fn = /* self._functionDlg.expandedFn = */ initializeCoeff(
          self._functionDlg.expandedFn
        );
      } else if (
        self._functionDlg.expandedParametricFnX &&
        self._functionDlg.expandedParametricFnY
      ) {
        parametricFnX = initializeCoeff(
          self._functionDlg.expandedParametricFnX
        );
        parametricFnY = initializeCoeff(
          self._functionDlg.expandedParametricFnY
        );
      }

      let makeSamplesData = {
        fx: fn,
        parametricFnX,
        parametricFnY,
        parametric_variable: self._functionDlg.parametric_variable,
        variable: self._functionDlg.variable,
        lowerX: parseFloat(self._functionDlg.lowerLimit),
        upperX: parseFloat(self._functionDlg.upperLimit),
        numOfSamples: self._functionDlg.numOfPoints,
        //ok_fn: self._functionDlg.ok,
        warnIgnoreCb: function () {
          Static.enterButton.click();
        },
      };

      let discont = [];

      try {
        discont = Utility.discontinuity(
          fn,
          makeSamplesData.lowerX,
          makeSamplesData.upperX,
          self._functionDlg.variable
        );
      } catch (error) {
        //discont = [];
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
        /* let makeSamplesData = {
          fx: fn,
          variable: self._functionDlg.variable,
          lowerX: parseFloat(self._functionDlg.lowerLimit),
          upperX: parseFloat(self._functionDlg.upperLimit),
          numOfSamples: self._functionDlg.numOfPoints,
          //ok_fn: self._functionDlg.ok,
          warnIgnoreCb: function () {
            Static.enterButton.click();
          },
        }; */

        /* let discont = [];

        try {
          discont = Utility.discontinuity(
            fn,
            makeSamplesData.lowerX,
            makeSamplesData.upperX
          );
        } catch (error) {
          //discont = [];
        }
        //console.log(discont)
        discont = discont.sort(function (a, b) {
          return a - b;
        }); */

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
        // makeSamplesData.xDecimalPlaces = xDecimalPlaces;
        // makeSamplesData.yDecimalPlaces = yDecimalPlaces;
        const samples = Utility.makeSamples(makeSamplesData);
        if (!samples) return;
        if (samples.length == 0) {
          Utility.alert(
            "Unable to derive samples from the provided domain. Check the function and limits for possible divide-by-zero error"
          );
          //self._functionDlg.close();
          //self._functionDlg.closeDlg = true;
          return;
        }
        newCurve = addCurve(title, samples, false, fn);
        newCurve.turningPoints = makeSamplesData.turningPoints;
        newCurve.latex = self._functionDlg.latex;
        if (!newCurve) return;
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

        // if (!functionDlgData) newCurve.attach(self);

        var decimalPlacesY = 4;
        var decimalPlacesX = 4;
        let m_samples = newCurve.data().samples();
        if (!Static.userDecimalPlacesForCalculation) {
          const obj = Utility.grapherDeterminedDecimalPlaces(newCurve);
          decimalPlacesY = obj.decimalPlacesY;
          decimalPlacesX = obj.decimalPlacesX;
        } else {
          var decimalPlacesY = self.axisDecimalPlaces(newCurve.yAxis());
          var decimalPlacesX = self.axisDecimalPlaces(newCurve.xAxis());
        }

        m_samples = m_samples.map(function (e) {
          return new Misc.Point(
            Utility.adjustForDecimalPlaces(e.x, decimalPlacesX),
            Utility.adjustForDecimalPlaces(e.y, decimalPlacesY)
          );
        });
        newCurve.setSamples(m_samples);

        if (!functionDlgData) newCurve.attach(self);

        //newCurve.functionDlgData = getFunctionDlgData(newCurve.rtti);

        if (newCurve && self._functionDlg.close) {
          //self._functionDlg.close();
          //self._functionDlg.closeDlg = true;
        }

        newCurve.domainRangeRestriction =
          self._functionDlg.domainRangeRestriction;

        return newCurve;
      }
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

    function doCombine(curves) {
      let precisionY, precisionX, decimalPlacesY, decimalPlacesX;
      if (curves[0]) {
        precisionY = curves[0].plot().axisPrecision(curves[0].yAxis());
        precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
        decimalPlacesY = curves[0].plot().axisDecimalPlaces(curves[0].yAxis());
        decimalPlacesX = curves[0].plot().axisDecimalPlaces(curves[0].xAxis());
      }

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
      if (!(operationType == "Join" || operationType == "Join and keep")) {
        if (curves.length > 1 && operationType !== "Intersection") {
          for (let i = 1; i < curves.length; i++) {
            if (curves[i].variable !== variable) {
              alert("Selected functions have different idependent vaiables.");
              return;
            }
          }
        }
      }

      if (
        operationType == "Translate" ||
        operationType == "Scale" ||
        operationType == "Reflect x-axis" ||
        operationType == "Reflect y-axis" ||
        operationType == "Reflect x and y-axes"
      ) {
        if (operationType == "Translate") {
          let entry = "1,1";
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
                //entry = csvStr;
                //} else {
                //validInput = true;
                // const m_translateX = math.evaluate(arr[0]);
                // const m_translateY = math.evaluate(arr[1]);

                const plot = curves[0].plot();
                // const doAutoReplot = plot.autoReplot();
                // plot.setAutoReplot(false);
                for (let i = 0; i < curves.length; i++) {
                  self.transformation.transform(
                    curves[i],
                    "Translate",
                    m_translateX,
                    m_translateY
                  );
                }
                // plot.setAutoReplot(doAutoReplot);
                // plot.autoRefresh();
                //}
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
                ].title()}", is not described by a know function.`
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
              ].title()}", is not described by a know function.`
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
            numOfPoints: undefined, //Number
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
          curve.attach(self);
        } //
      }

      if (operationType == "Create table") {
        //$("html").addClass("wait");
        curves[0].plot().plotPropertiesPane.generateTable(curves[0]);
        //$("html").removeClass("wait");
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
        operationType == "Inflection point"
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
        let str = "";
        let m = 0;
        for (let i = 0; i < curves.length; i++) {
          //const points = Utility.curveTurningPoint(curves[i]);//fn, variable, samples
          let points;
          if (operationType == "Turning point") {
            // points = Utility.curveTurningPoint(
            //   curves[i].expandedFn,
            //   curves[i].variable,
            //   curves[i].data().samples(),
            //   decimalPlacesX,
            //   decimalPlacesY
            // );
            const curve = curves[i];
            points = curve.turningPoints;

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

              // const sym = new Symbol2();
              // sym.setBrush(new Misc.Brush(Static.NoBrush));
              // sym.setSize(new Misc.Size(10, 10));
              // sym.setStyle(Symbol2.Style.Ellipse);
              // marker.setSymbol(sym);

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

          if (operationType == "Inflection point") {
            points = Utility.curveInflectionPoint(
              curves[i].expandedFn,
              curves[i].variable,
              curves[i].data().samples(),
              decimalPlacesX,
              decimalPlacesY
            );

            const curve = curves[i];

            for (let n = 0; n < points.length; n++) {
              const element = points[n];
              const { spacing, align } = getArrowSymbolProperties();
              const ipName = Utility.generateCurveName(self, "I");
              const marker = new PlotMarker(ipName);
              marker.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
              marker.setXAxis(curve.xAxis());
              marker.setYAxis(curve.yAxis());

              // const sym = new Symbol2();
              // sym.setBrush(new Misc.Brush(Static.NoBrush));
              // sym.setSize(new Misc.Size(10, 10));
              // sym.setStyle(Symbol2.Style.Ellipse);
              // marker.setSymbol(sym);

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
          if (!points.length) {
            let pointType = "turning";
            if (operationType == "Inflection point") pointType = "inflection";
            str += `${curves[i].title()} (0 ${pointType} point)\n`;
          }
        }
        if (str.length) alert(str);
      }

      if (operationType == "Intersection") {
        //console.log(curves);
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

          // let precisionY = curves[0].plot().axisPrecision(curves[0].yAxis());
          // let precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
          // let decimalPlacesY = curves[0]
          //   .plot()
          //   .axisDecimalPlaces(curves[0].yAxis());
          // let decimalPlacesX = curves[0]
          //   .plot()
          //   .axisDecimalPlaces(curves[0].xAxis());

          let res = [];

          if (curves[0].expandedFn && curves[1].expandedFn) {
            // Utility.logStep(Static.operation, {
            //   equations: [curves[0].expandedFn, curves[1].expandedFn],
            //   variable: curves[0].variable,
            // });
            // Utility.logStep(Static.constructEquation, operationType);
            let simplifiedExp = math
              .simplify(`(${curves[0].expandedFn})-(${curves[1].expandedFn})`)
              .toString();
            //Replace the whitespace delimiters stripped out by simplify()
            simplifiedExp = simplifiedExp.replaceAll("mod", " mod ");
            //Utility.logStep(Static.rearrangeEquation, operationType);
            if (simplifiedExp.indexOf(curves[0].variable) == -1) {
              alert(`0 points of intersection:\n`);
              return;
            }

            nerdamer.flush();
            var eq = nerdamer(
              `(${curves[0].expandedFn})-(${curves[1].expandedFn})=0`
            );
            Static.expression = `(${curves[0].expandedFn})-(${curves[1].expandedFn})=0`;
            //Utility.logStep(Static.solveEquation, operationType);
            var solution = eq.solveFor(curves[0].variable);
            //Static.stepper.unload();
            //console.log(solution[0].toString(), solution[1].toString());
            if (solution && solution.length < 20) {
              const fn = curves[0].expandedFn.replaceAll(
                curves[0].variable,
                "Z"
              );

              for (let i = 0; i < solution.length; i++) {
                const val = math.evaluate(solution.at(i).valueOf());

                res.push({
                  x: val,
                  y: math.evaluate(fn, {
                    Z: val,
                  }),
                });
              }

              const xLower = Math.max(curves[0].lowerX, curves[1].lowerX);
              const xUpper = Math.min(curves[0].upperX, curves[1].upperX);
              //console.log(xLower, xUpper);

              const m_l = res.length;

              res = res.filter(function (e) {
                return e.x >= xLower && e.x <= xUpper;
              });

              if (res.length == 0) {
                //Utility.logStep("info", `No solution(s) within domain [${xLower}, ${xUpper}]`);
              }

              if (m_l == res.length) {
                //Utility.logStep("info", `All solution(s) within domain [${xLower}, ${xUpper}]`);
              }

              const { spacing, align, angle } = getArrowSymbolProperties();

              let str = "";
              for (let i = 0; i < res.length; i++) {
                const element = res[i];
                const { spacing, align } = getArrowSymbolProperties();
                const ipName = Utility.generateCurveName(self, "X");
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
                marker.toolTipValueName = "Intersection point:";

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

              //const ptStr = res.length > 1 ? "points" : "point";

              //alert(`${res.length} ${ptStr} of intersection:\n` + str);
              return;
            }
          }

          //console.log(decimalPlacesX, decimalPlacesY);

          //const round = 30;
          const m_eps = 1e-14;
          let samples1 = curves[0].data().samples();
          let samples2 = curves[1].data().samples();

          if (samples2.length == 2 && samples1.length > 2) {
            const temp = samples1;
            samples1 = samples2;
            samples2 = temp;
          }

          if (
            (samples1.length == 2 ||
              Utility.linearEquationFromPoints(samples1[0], samples1[1], 10) ==
                Utility.linearEquationFromPoints(
                  samples1[1],
                  samples1[2],
                  10
                )) &&
            (samples2.length == 2 ||
              Utility.linearEquationFromPoints(samples2[0], samples2[1], 10) ==
                Utility.linearEquationFromPoints(samples2[1], samples2[2], 10))
          ) {
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

            // let precisionY = curves[0].plot().axisPrecision(curves[0].yAxis());
            // let precisionX = curves[0].plot().axisPrecision(curves[0].xAxis());
            // //const precision = Math.min(precisionX, precisionY);
            // let decimalPlacesY = curves[0]
            //   .plot()
            //   .axisDecimalPlaces(curves[0].yAxis());
            // let decimalPlacesX = curves[0]
            //   .plot()
            //   .axisDecimalPlaces(curves[0].xAxis());

            let x = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(point[0], decimalPlacesX),
              precisionX
            );
            let y = Utility.toPrecision(
              Utility.adjustForDecimalPlaces(point[1], decimalPlacesY),
              precisionY
            );

            if (x == "Infinity" || y == "Infinity") {
              alert(`0 points of intersection:\n`);
              return;
            }

            const element = new Misc.Point(x, y);
            const { spacing, align } = getArrowSymbolProperties();
            const ipName = Utility.generateCurveName(self, "X");
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
            marker.toolTipValueName = "Intersection point:";

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

          /////////////////////////////////////////////////////////////

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

                let pt = new Misc.Point(point[0], point[1]);

                function resHasPoint(pt) {
                  for (let i = 0; i < res.length; i++) {
                    //if (res[i].isEqual(pt)) return true;
                    if (
                      Utility.adjustForDecimalPlaces(
                        res[i].x,
                        decimalPlacesX
                      ) ==
                        Utility.adjustForDecimalPlaces(pt.x, decimalPlacesX) &&
                      Utility.adjustForDecimalPlaces(
                        res[i].y,
                        decimalPlacesY
                      ) == Utility.adjustForDecimalPlaces(pt.y, decimalPlacesY)
                    ) {
                      return true;
                    }
                  }
                  return false;
                }

                if (
                  (point &&
                    rect2.contains(pt, false) &&
                    rect1.contains(pt, false)) ||
                  (rect1.height() == 0 && rect2.contains(pt, false)) ||
                  (rect2.height() == 0 && rect1.contains(pt, false))
                ) {
                  if (!resHasPoint(pt)) res.push(pt);
                }
              }
            }
          }

          let str = "";
          for (let i = 0; i < res.length; i++) {
            const element = res[i];
            const { spacing, align } = getArrowSymbolProperties();
            const ipName = Utility.generateCurveName(self, "X");
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
            marker.toolTipValueName = "Intersection point:";

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

          if (res.length == 0) alert(`0 points of intersection:\n`);
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
      self.setAxesAutoScale(false);
    });

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
      img: "images/axis.png",
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
          img: "images/axis.png",
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
            img: "images/brush.png",
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
            img: "images/style.png",
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
            img: "images/attribute.png",
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
            img: "images/fit.png",
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
            img: "images/symbol.png",
            title: "attach/modify curve symbol",
            subMenu: null,
          },
          {
            pos: 8,
            name: "pen",
            img: "images/pen.png",
            title: "modify/change curve pen",
            subMenu: legendMenu.getPenSubMenu(),
          },
          /* {
            pos: 9,
            name: "Zone",
            img: "images/zone.jfif",
            title: "Adds a zone",
            fun: function () {
              var curve = legendMenu.getCurve();
              if (!curve) {
                alert("Must have at least one curve.");
                return;
              }
              self.zoneDlg.zoneCb(curve.plot());
            },
          }, */
        ]);
      }

      if (curve.rtti === PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        legendMenu.modifyMenu(null, {
          name: "pen width",
          //title: 'It will replace row',
          //img:'images/replace.png',
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
          /* self.tbar.setDropdownItemCheck("Watch", 6, false);
          self.watchAreaBelowCurve.setEnable(false); */
          //Static.trigger("positionChanged"); //force sidebar update
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
        img: "images/hide.png",
        title: "Hide all rulers",
        fun: function () {
          self.rv.setVisible(false);
        },
      },
      {
        name: "Show rulers",
        img: "images/show.png",
        title: "Show any hidden rulers",
        //disable: true,
        fun: function () {
          self.rv.setVisible(true);
        },
      },
      {
        name: "Unlock rulers",
        img: "images/unlock.png",
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
        img: "images/trashAll.png",
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
        img: "images/trashAllHidden.png",
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
        img: "images/hide.png",
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
        img: "images/show.png",
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
      //fsServerUrl: "http://localhost:5500", //only necessary for cross domain

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
          img: "images/favicon.ico",
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
      constructor(options) {
        super(options);
        const self = this;

        //Associate save and saveas menu items with the editor
        options.fs.addSaveAndSaveAsMenuItems();

        options.fs.registerEditor({ name: "Grapher", editor: self });

        //If the editor has content from a known file (i.e self.currentFilename() returns a valid filename)
        //and an input is detected, we set the currentFileModified flag (i.e we call currentFileModified(true))
        Static.bind("replot", function () {
          if (self.currentFilename()) self.currentFileModified(true);
        });
      }
      getData() {
        return self.file.getPlotData(); //'[{"bottomScaleEngineType":"[LinearScaleEngine]","leftScaleEngineType":"[LinearScaleEngine]","topScaleEngineType":"[LinearScaleEngine]","rightScaleEngineType":"[LinearScaleEngine]","title":"Plot","titleFont":{"th":20,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"footer":"Footer","footerFont":{"th":15,"name":"Arial","style":"normal","weight":"bold","fontColor":"black"},"axisTitleFont":{"th":14,"name":"Arial","style":"normal","weight":"normal","fontColor":"black"},"xBottomAxisTitle":"Bottom scale","xTopAxisTitle":"Top scale","yLeftAxisTitle":"Left scale","yRightAxisTitle":"Right scale","autoScale":true},{"rtti":5,"title":"curve_1","functionDlgData":{"rtti":5,"coeffs":[],"expandedFn":"x^2","fn":"x^2","lowerLimit":-10,"numOfPoints":100,"threeD":false,"title":"curve_1","unboundedRange":false,"upperLimit":10,"variable":"x"},"fn":"x^2","pen":{"color":"rgb(75,122,25)","width":1,"style":"solid"},"symbolType":-1,"style":0,"xAxis":2,"yAxis":0}]';
      }

      setData(data, filename, ext, editorName) {
        if (
          ext === ".tbl" ||
          ext === ".txt" ||
          ext === ".plt" ||
          editorName == "Grapher"
        ) {
          if (ext === ".plt" || ext === ".txt" || ext === ".tbl") {
            self.file.setPlotData({ content: data, fileName: filename });
          }
          if (ext === ".plt") {
            this.currentFilename(filename);
          }
        }
      }
    }

    class DefinesEditor extends Editor {
      constructor(options) {
        super(options);
        const self = this;

        options.fs.registerEditor({ name: "Defines", editor: self });
      }
    }

    const options = {};
    options.fs = fileSystemServices;
    options.editorName = "Grapher";
    options.fileExtensions = [".plt", ".tbl", ".txt"];
    //options.explorerDialogParentId = "plotDiv";

    self.grapherEditor = new GrapherEditor(options);

    //If not called and the buit-in notepad is enabled, notepad is assume to be the default editor
    options.fs.setDefaultEditor(self.grapherEditor);

    const definesOptions = {};
    definesOptions.fs = fileSystemServices;
    definesOptions.editorName = "Defines";
    definesOptions.fileExtensions = [".def", ".txt"];
    //options.explorerDialogParentId = "definesModal";

    self.definesEditor = new DefinesEditor(definesOptions);
    this.defines = new MDefines(this, self.definesEditor);

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

    const tbDiv = this.tbar.html();
    //console.log(tbDiv);
    tbDiv.append(
      $(
        '<span class="GrapherTitle" style="float:right; margin-right:4px"></span>'
      )
    );

    self.grapherEditor.initEditor();
  }
}
