"include ['plotShapeItem']";

class CurveShapeItem extends PlotShapeItem {
  constructor(plot) {
    super();
    var _curve = null;
    var _poly = null;
    var _lowerLimit = undefined;
    var _upperLimit = undefined;
    var _enabled = true;
    var self = this;

    function polygonBelowCurve /* curve,  */() {
      /* lowerLimit, upperLimit */
      var samples = null;
      var poly = [];
      if (_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve) return;
      if (_curve.data().toString() == "[SyntheticPointData]") {
        //curve.setData(new FunctionData(fn, numOfPoints));
        let sz = _curve.functionData.size();
        let smpls = [];

        for (var i = 0; i < sz - 1; ++i) {
          smpls.push(_curve.functionData.sample(i));
        }
        samples = smpls;
      } else {
        samples = _curve.data().samples();
      }

      if (!samples) return;
      //var samples =  _curve.data().samples();
      if (samples.length < 2) return;

      if (
        _lowerLimit < samples[0].x ||
        _upperLimit > samples[samples.length - 1].x ||
        _lowerLimit >= _upperLimit
      ) {
        return null;
      }

      if (_lowerLimit == undefined) _lowerLimit = samples[0].x;
      if (_upperLimit == undefined) _upperLimit = samples[samples.length - 1].x;
      var lowerIndex = -1;
      var upperIndex = -1;
      var poly = [];

      for (var i = 1; i < samples.length; i++) {
        if (samples[i].x > _lowerLimit && lowerIndex == -1) {
          lowerIndex = i - 1;
          poly.push(samples[lowerIndex]);
        }
        if (samples[i - 1].x < _upperLimit) {
          upperIndex = i;
          if (lowerIndex != -1) poly.push(samples[upperIndex]);
        }
      }

      var lowerInterpolatedPt;
      var upperInterpolatedPt;

      //console.log(samples[lowerIndex + 1])
      var axisScaleEngine = _curve
        .plot()
        .axisScaleEngine(_curve.xAxis())
        .toString();
      //console.log(axisScaleEngine.toString())//[LinearScaleEngine]
      if (axisScaleEngine == "[LinearScaleEngine]") {
        lowerInterpolatedPt = samples[lowerIndex].interpolatedPoint(
          samples[lowerIndex + 1],
          _lowerLimit
        );
        upperInterpolatedPt = samples[upperIndex - 1].interpolatedPoint(
          samples[upperIndex],
          _upperLimit
        );
      } else if (axisScaleEngine == "[LogScaleEngine]") {
        lowerInterpolatedPt = samples[lowerIndex].logInterpolatedPoint(
          samples[lowerIndex + 1],
          _lowerLimit
        );
        upperInterpolatedPt = samples[upperIndex - 1].logInterpolatedPoint(
          samples[upperIndex],
          _upperLimit
        );
      }

      if (poly.length && poly[0].x !== lowerInterpolatedPt.x) {
        poly.splice(0, 1, lowerInterpolatedPt);
      }
      if (poly.length && poly[poly.length - 1].x !== upperInterpolatedPt.x) {
        poly.pop();
        poly.push(upperInterpolatedPt);
      }
      //We pass Number.MIN_VALUE instead of 0 so that for log scale, Math.log(0) is not called.
      poly.splice(0, 0, new Misc.Point(poly[0].x, Number.MIN_VALUE));
      poly.push(new Misc.Point(poly[poly.length - 1].x, Number.MIN_VALUE));

      return poly;
    }

    this.setEnabled = function (on) {
      _enabled = on;
      if (_enabled && _curve && _curve.isVisible()) {
        this.setVisible(true);
        this.refresh();
      } else {
        this.setVisible(false);
      }
    };

    this.enabled = function (on) {
      return _enabled;
    };

    this.setCurve = function (curve) {
      if (curve && _curve == curve) return;
      _curve = curve;
      this.setLimits(); //set limits to undefined (i.e. invalidate limits)
      if (_enabled && _curve && _curve.isVisible()) {
        this.setVisible(true);
        this.refresh();
      }
    };

    this.curve = function () {
      return _curve;
    };

    this.refresh = function () {
      if (this.isVisible() && _curve) {
        _poly = polygonBelowCurve /* _curve, */();
        /* _lowerLimit, _upperLimit */
      } else {
        _poly = null;
      }
      this.setPolygon(_poly);
      if (_curve && _poly) {
        self.setAxes(_curve.xAxis(), _curve.yAxis());
        _curve.plot().autoRefresh();
      }
    };

    this.setLimits = function (lowerLimit, upperLimit) {
      _lowerLimit = lowerLimit;
      _upperLimit = upperLimit;
      this.refresh();
    };

    this.setLowerLimit = function (lowerLimit) {
      _lowerLimit = lowerLimit;
      this.refresh();
    };

    this.setUpperLimit = function (upperLimit) {
      _upperLimit = upperLimit;
      this.refresh();
    };

    Static.bind("visibilityChange", function (e, curve, on) {
      if (curve.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (_curve && curve == _curve && _enabled && on) {
          self.setVisible(true);
        } else {
          if (self.plot().curveShapeEnabledByPlotSettings())
            self.setEnabled(self.plot().tbar.isDropdownItemChecked("Watch", 6));
          if (curve == _curve) {
            self.setVisible(false);
            self.setLimits(); //set limits to undefined
          }
        }
        //Static.trigger("positionChanged"); //force sidebar update
      }
      Static.trigger("curveAdjusted"); //force sidebar update
    });

    Static.bind("axisChanged", function (e, axis, curve) {
      if (curve.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        //if (self._curve && (curve === self._curve) && _enabled && on) {
        if (_curve && curve === _curve /*  && _enabled */) {
          /*
					set limits to undefined. setLimits() call refresh() and refresh() ensures
					that the curve axis is in sync with the ShapeItem (i.e self or this) axis.
					*/
          self.setLimits();
          //self.setAxes(curve.xAxis(), curve.yAxis());
        } /* else if (curve == self._curve) {
                    self.setVisible(false);
                } */
        //self.setLimits(); //set limits to undefined
      }
    });

    function adjustCurveShape(ruler, pos) {
      if (ruler && _curve) {
        if (ruler.title() == "v_ruler1" || ruler.title() == "v_ruler2") {
          //left ruler
          if (!plot.axisScaleDiv(_curve.xAxis()).isIncreasing()) {
            if (ruler.title() == "v_ruler2") self.setLowerLimit(pos);
            else self.setUpperLimit(pos);
          } else {
            if (ruler.title() == "v_ruler1") self.setLowerLimit(pos);
            else self.setUpperLimit(pos);
          }
        }
      }
    }

    var prevRulerPos = Number.MAX_VALUE;
    var prevRuler = Number.MAX_VALUE;
    Static.bind("positionChanging", function (e, ruler, pos) {
      if (prevRuler === ruler && prevRulerPos === pos) return;
      var plot = ruler.plot();
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      adjustCurveShape(ruler, pos);
      prevRuler = ruler;
      prevRulerPos = pos;
      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    });

    Static.bind("positionChanged", function (e, ruler, pos) {
      if (!ruler) return;
      //if (prevRuler === ruler && prevRulerPos === pos) return;
      var plot = ruler.plot();
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      adjustCurveShape(ruler, pos);
      prevRuler = ruler;
      prevRulerPos = pos;
      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    });

    Static.bind("currentCurveChanged", function (e, newCurve) {
      if (newCurve) self.setCurve(newCurve);
    });

    Static.bind("curveShapeColorChanged", function (e, color) {
      var brush = self.brush();
      brush.color = color;
      self.setBrush(brush);
      var pen = self.pen();
      pen.color = color;
      self.setPen(pen);
    });

    Static.bind("watchEnabled", function (e, watch, on) {
      if (plot.settings() && plot.settings().shadeWatchArea) {
        if (watch.name() == "Area below curve") {
          //if(watch === m_watch){
          self.setEnabled(on);
        }
      }
    });

    Static.bind("shadeWatchArea", function (e, on) {
      plot.setCurveShapeEnabledByPlotSettings(on);
      //case: watch is enabled && shadeWatchArea off
      if (
        (!on && plot.watchAreaBelowCurve.isEnable()) ||
        (!on && !plot.watchAreaBelowCurve.isEnable())
      ) {
        self.setEnabled(false);
      }
      //case: watch is enabled && shadeWatchArea on
      else if (on && plot.watchAreaBelowCurve.isEnable()) {
        self.setEnabled(true);
        //console.log("case: watch is  enabled && shadeWatchArea on")
      }
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      //only plotcure has shapeitem
      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (on) {
          //attached
          if (!self.curve()); //plot.cs.setCurve(plotItem);
        } else {
          //detached
          if (
            !plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length ||
            !plot.hasVisiblePlotCurve()
          ) {
            self.setCurve(null);
          }
        }
        Static.trigger("visibilityChange", [plotItem, on]);
        if (plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve).length == 1)
          Static.trigger("currentCurveChanged", plotItem);
      }
    });

    Static.bind("curveAdjusted", function () {
      if (!self.isVisible()) return;
      self.setLimits(); //set curveShapeItem limits to undefined
      //self.refresh(); //setLimits() call refresh
    });

    //this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, false);

    Static.bind("autoScaleCurveShapeItem", function (e, on) {
      self.setItemAttribute(PlotItem.ItemAttribute.AutoScale, on);
    });

    this.attach(plot);
    this.setEnabled(false);
  }
}
