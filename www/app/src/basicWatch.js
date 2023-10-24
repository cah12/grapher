"use strict";

"include ['static','watch', 'plotMarker', 'symbol']";

Static.accuracyFactorModerate = /* 0.004 */ 1; //moderate
Static.accuracyFactor = Static.accuracyFactorModerate;
Static.watchUpdateError = false;
Static.showWatchUpdateError = true;

Static.total_area = 0;
Static.total_volume = 0;

class CGMarker extends PlotMarker {
  constructor() {
    super("cgMarker@12345");
    var self = this;

    class CGSymbol extends Symbol2 {
      constructor() {
        super();
        var self = this;
        self.type = "arrow";
        self.setPen(new Misc.Pen("black", 2));
        self.setBrush(new Misc.Brush("red"));
        var path = new Misc.MPath();
        path.moveTo(5, 10);
        path.lineTo(5, 0);
        path.moveTo(0, 5);
        path.lineTo(10, 5);
        // path.lineTo( 13, 10 );
        // path.lineTo( 16, 15 );
        // path.lineTo( 13, 15 );
        //path.data.rotation = $("#marker_symbolAngle").val();
        self.setPath(path);
        self.setPinPoint(new Misc.Point(6, 6));
        self.setSize(new Misc.Size(12, 12));
      }
    }
    self.setSymbol(new CGSymbol());
    self.setLabel("CG");
    self.setLabelAlignment(Static.AlignCenter | Static.AlignBottom);

    var areaWatchEnabled = false;
    const watchEnabledCb = function (e, watch, on) {
      if (watch.name() === "Area below curve") {
        self.setVisible(on);
        areaWatchEnabled = on;
      }
    };
    Static.bind("watchEnabled", watchEnabledCb);

    const showSidebarCb = function (e, anchorPosition, on) {
      if (on && areaWatchEnabled) self.setVisible(true);
      else self.setVisible(false);
    };
    Static.bind("showSidebar", showSidebarCb);

    const axisChangedCb = function (e, axis, curve) {
      if (curve != undefined) self.setAxes(curve.xAxis(), curve.yAxis());
    };
    Static.bind("axisChanged", axisChangedCb);

    const currentCurveChangedCb = function (e, curve) {
      if (curve != undefined) self.setAxes(curve.xAxis(), curve.yAxis());
    };
    Static.bind("currentCurveChanged", currentCurveChangedCb);

    this.cleanUp = function () {
      // Static.unbind("watchEnabled", watchEnabledCb);
      // Static.unbind("showSidebar", showSidebarCb);
      // Static.unbind("axisChanged", axisChangedCb);
      // Static.unbind("currentCurveChanged", currentCurveChangedCb);
    };
  }

  delete() {
    this.cleanUp();
  }
}

class WatchCurveName extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    this.name = function () {
      return "Curve name";
    };
    this.computeWatch = function () {
      Static.watchUpdateError = false;
      if (this._value !== this._curveName) {
        this._update = true;
        this._value = this._curveName;
      } else {
        this._update = false;
      }
      this._curve = 0;
    };
  }
}

class WatchLeftRulerPosition extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    var self = this;
    this.name = function () {
      return "Left ruler position";
    };
    this.valueType = "number";
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      this._update = true;

      if (this._rulerLeft == Number.MAX_VALUE) this._value = "Invalid";
      else {
        //this._value = this._rulerLeft// = Utility.adjustForDecimalPlaces(this._rulerLeft, this._curve.plot().axisDecimalPlaces(this._curve.xAxis()));
        this._value = Utility.adjustForDecimalPlaces(
          this._rulerLeft,
          this._curve.plot().axisDecimalPlaces(this._curve.xAxis())
        ); //this._rulerLeft;
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(
          this._value,
          this._curve.plot().axisPrecision(this._curve.xAxis())
        );
      }
      this._curve = 0;
    };
    this.cb = function () {
      var prevValue = self._value;
      var pos = self._rulerGroup.setPosition(0, $(this).val());
      /* setPosition() returns the actual position set. Because of validation, this may be different than the argument passed to setPosition() */
      if (prevValue !== pos) {
        Static.trigger("positionChanged", [self._rulerGroup.ruler(0), pos]);
      } else {
        $(this).val(pos);
      }
    };
  }
}

class WatchRightRulerPosition extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    var self = this;

    this.name = function () {
      return "Right ruler position";
    };
    this.valueType = "number";
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      this._update = true;

      if (this._rulerRight == Number.MAX_VALUE) this._value = "Invalid";
      else {
        //this._value = this._rulerRight //= Utility.adjustForDecimalPlaces(this._rulerRight, this._curve.plot().axisDecimalPlaces(this._curve.xAxis()));
        this._value = Utility.adjustForDecimalPlaces(
          this._rulerRight,
          this._curve.plot().axisDecimalPlaces(this._curve.xAxis())
        ); //this._rulerRight;
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(
          this._value,
          this._curve.plot().axisPrecision(this._curve.xAxis())
        );
      }
      this._curve = 0;
    };
    this.cb = function () {
      var prevValue = self._value;
      var pos = self._rulerGroup.setPosition(1, $(this).val());
      /* setPosition() returns the actual position set. Because of validation, this may be different than the argument passed to setPosition() */
      //$(this).val(pos);
      //Static.trigger("positionChanged", [self._rulerGroup.ruler(1), pos]);

      if (prevValue !== pos) {
        Static.trigger("positionChanged", [self._rulerGroup.ruler(1), pos]);
      } else {
        $(this).val(pos);
      }
    };
  }
}

class WatchBottomRulerPosition extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    var self = this;
    this.valueType = "number";
    this.name = function () {
      return "Bottom ruler position";
    };
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      this._update = true;

      if (this._rulerBottom == Number.MAX_VALUE) this._value = "Invalid";
      else {
        this._value = Utility.adjustForDecimalPlaces(
          this._rulerBottom,
          this._curve.plot().axisDecimalPlaces(this._curve.xAxis())
        ); //this._rulerBottom;
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(
          this._value,
          this._curve.plot().axisPrecision(this._curve.yAxis())
        );
      }
      this._curve = 0;
    };
    this.cb = function () {
      var prevValue = self._value;
      var pos = self._rulerGroup.setPosition(2, $(this).val());
      /* setPosition() returns the actual position set. Because of validation, this may be different than the argument passed to setPosition() */
      if (prevValue !== pos) {
        Static.trigger("positionChanged", [self._rulerGroup.ruler(2), pos]);
      } else {
        $(this).val(pos);
      }
    };
  }
}

class WatchTopRulerPosition extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    var self = this;
    this.valueType = "number";
    this.name = function () {
      return "Top ruler position";
    };
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      this._update = true;

      if (this._rulerTop == Number.MAX_VALUE) this._value = "Invalid";
      else {
        this._value = Utility.adjustForDecimalPlaces(
          this._rulerTop,
          this._curve.plot().axisDecimalPlaces(this._curve.xAxis())
        ); //this._rulerTop;
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(
          this._value,
          this._curve.plot().axisPrecision(this._curve.yAxis())
        );
      }
      this._curve = 0;
    };
    this.cb = function () {
      var prevValue = self._value;
      var pos = self._rulerGroup.setPosition(3, $(this).val());
      /* setPosition() returns the actual position set. Because of validation, this may be different than the argument passed to setPosition() */
      if (prevValue !== pos) {
        Static.trigger("positionChanged", [self._rulerGroup.ruler(3), pos]);
      } else {
        $(this).val(pos);
      }
    };
  }
}

class WatchSlope extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    this.name = function () {
      return "Slope at left ruler";
    };
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      if (
        self._magnifying == true ||
        this._rulerLeft == this._rulerLeftPrevious
      ) {
        this._update = false;
        this._curve = 0;
        return;
      }
      this._update = true;
      let m_value = 0;
      var precisionY = this._curve.plot().axisPrecision(this._curve.yAxis());
      var precisionX = this._curve.plot().axisPrecision(this._curve.xAxis());

      var decimalPlacesY = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.yAxis());
      var decimalPlacesX = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.xAxis());

      let _rulerLeft = (this._rulerLeftPrevious = this._rulerLeft);
      //Pre-calculation adjustment
      _rulerLeft = Utility.adjustForDecimalPlaces(_rulerLeft, decimalPlacesX);

      if (this._rulerLeft == Number.MAX_VALUE || !isFinite(this._rulerLeft))
        this._value = "Invalid";
      else {
        if (this._curve.expandedFn && !this._curve.expandedFn.includes("log")) {
          var fn = this._curve.expandedFn;
          if (this._curve.variable != "z") {
            while (fn.indexOf(this._curve.variable) != -1) {
              fn = fn.replace(this._curve.variable, "z");
            }
          }
          if (this._curve.coeffs) {
            for (var i = 0; i < this._curve.coeffs.length; ++i) {
              while (fn.indexOf(this._curve.coeffs[i]) != -1) {
                fn = fn.replace(
                  this._curve.coeffs[i],
                  this._curve.coeffsVal[i]
                );
              }
            }
          }
          this._value = math.derivative(fn, "z").evaluate({
            z: _rulerLeft,
          });
          this._value = Utility.adjustForDecimalPlaces(
            this._value,
            Math.max(decimalPlacesX, decimalPlacesY)
          );
          if (isNaN(this._value)) Static.watchUpdateError = true;
          this._value = Utility.toPrecision(
            this._value,
            Math.min(precisionX, precisionY)
          );
          this._curve = 0;
          return;
        }
        var numOfPoints = this._curve.dataSize();
        var x = this._rulerLeft;
        for (var i = 1; i < numOfPoints; ++i) {
          if (this._curve.sample(i).x > x) {
            var p2 = this._curve.sample(i);
            var p1 = this._curve.sample(i - 1);
            this._value = (p2.y - p1.y) / (p2.x - p1.x);

            this._value = Utility.adjustForDecimalPlaces(
              this._value,
              Math.max(decimalPlacesX, decimalPlacesY)
            );
            if (isNaN(this._value)) Static.watchUpdateError = true;
            this._value = Utility.toPrecision(
              this._value,
              Math.min(precisionX, precisionY)
            );
            this._curve = 0;
            return;
          }
        }
      }
      this._curve = 0;
    };
  }
}

class WatchAreaBelowCurve extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);

    var self = this;
    var cgMarker = null; //new CGMarker();
    var plot = null; //this._curve.plot();

    this.name = function () {
      return "Area below curve";
    };
    var set = 0;
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      var autoReplot = this._curve.plot().autoReplot();
      this._curve.plot().setAutoReplot(false);
      if (
        self._magnifying == true ||
        (this._rulerLeft == this._rulerLeftPrevious &&
          this._rulerRight == this._rulerRightPrevious)
      ) {
        //self._magnifying = false;
        this._update = false;
        //this._curve = 0;
        return;
      }

      this._update = true;

      let m_value = 0;
      var precisionY = this._curve.plot().axisPrecision(this._curve.yAxis());
      var precisionX = this._curve.plot().axisPrecision(this._curve.xAxis());
      const precision = Math.min(precisionX, precisionY);

      var decimalPlacesY = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.yAxis());
      var decimalPlacesX = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.xAxis());

      let _rulerLeft = (this._rulerLeftPrevious = this._rulerLeft);
      let _rulerRight = (this._rulerRightPrevious = this._rulerRight);
      //Pre-calculation adjustment
      _rulerLeft = Utility.adjustForDecimalPlaces(_rulerLeft, decimalPlacesX);
      _rulerRight = Utility.adjustForDecimalPlaces(_rulerRight, decimalPlacesX);

      var widthPx =
        this._curve.plot().transform(this._curve.xAxis(), _rulerRight) -
        this._curve.plot().transform(this._curve.xAxis(), _rulerLeft);
      const step = Math.abs(
        (Static.accuracyFactor * (_rulerRight - _rulerLeft)) / widthPx
      );
      //console.log("step:" + step);
      if (isNaN(step) || step === 0) {
        this._curve = 0;
        return;
      }

      //console.log(step)
      if (!cgMarker) {
        cgMarker = new CGMarker();
        cgMarker.setAxes(this._curve.xAxis(), this._curve.yAxis());
        plot = this._curve.plot();
        cgMarker.attach(plot);
      }

      if (
        _rulerLeft == Number.MAX_VALUE ||
        !isFinite(_rulerLeft) ||
        _rulerRight == Number.MAX_VALUE ||
        !isFinite(_rulerRight)
      )
        this._value = "Invalid";
      else {
        if (this._curve.expandedFn) {
          var fn = this._curve.expandedFn;
          fn = Utility.logBaseAdjust(fn);
          // if (this._curve.variable != "z") {
          //   while (fn.indexOf(this._curve.variable) != -1) {
          //     fn = fn.replace(this._curve.variable, "z");
          //   }
          // }
          if (this._curve.coeffs) {
            for (var i = 0; i < this._curve.coeffs.length; ++i) {
              while (fn.indexOf(this._curve.coeffs[i]) != -1) {
                fn = fn.replace(
                  this._curve.coeffs[i],
                  this._curve.coeffsVal[i]
                );
              }
            }
          }

          if (_rulerLeft > _rulerRight) {
            var temp = _rulerLeft;
            _rulerLeft = _rulerRight;
            _rulerRight = temp;
          }

          this._value = math.evaluate(
            `integrate(${fn} , ${this._curve.variable}, ${_rulerLeft}, ${_rulerRight}, false, ${step})`
          );

          var twoAbarY = math.evaluate(
            `integrate((${fn})^2 , ${this._curve.variable}, ${_rulerLeft}, ${_rulerRight}, false, ${step})`
          );

          var AbarX = math.evaluate(
            `integrate(${this._curve.variable}*(${fn}) , ${this._curve.variable}, ${_rulerLeft}, ${_rulerRight}, false, ${step})`
          );

          // var twoAbarY = math.evaluate(
          //   "integrate(" +
          //     "((" +
          //     fn +
          //     ")" +
          //     "*" +
          //     "(" +
          //     fn +
          //     "))" +
          //     ", z," +
          //     _rulerLeft +
          //     "," +
          //     _rulerRight +
          //     ",false," +
          //     step +
          //     ")"
          // );
          // var AbarX = math.evaluate(
          //   "integrate(" +
          //     "z * (" +
          //     fn +
          //     ")" +
          //     ", z," +
          //     _rulerLeft +
          //     "," +
          //     _rulerRight +
          //     ",false," +
          //     step +
          //     ")"
          // );
          m_value = this._value;

          this._value = Utility.adjustForDecimalPlaces(
            this._value,
            decimalPlacesX + decimalPlacesY
          );
          if (isNaN(this._value)) Static.watchUpdateError = true;
          this._value = Utility.toPrecision(this._value, precision);

          var barY = Utility.adjustForDecimalPlaces(
            twoAbarY / (2 * m_value),
            decimalPlacesY
          );
          if (isNaN(barY)) Static.watchUpdateError = true;
          barY = Utility.toPrecision(barY, precisionY);
          //console.log(decimalPlacesX);
          var barX = Utility.adjustForDecimalPlaces(
            AbarX / m_value,
            decimalPlacesX
          );
          if (isNaN(barX)) Static.watchUpdateError = true;
          barX = Utility.toPrecision(barX, precisionX);

          if (Static.watchCentroidWithArea) {
            if (this._value == 0) {
              barX = barY = "Infinity";
            }
            this._value += " centroid:(" + barX + ", " + barY + ")";
            cgMarker.setValue(barX, barY);
            cgMarker.setVisible(true);
          } else {
            cgMarker.setVisible(false);
          }

          if (!this._curve || !this._curve.plot()) return;
          this._curve.plot().setAutoReplot(autoReplot);
          //this._curve.plot().autoRefresh();
          this._curve = 0;
          return;
        }
        if (!this._curve) return;
        var numOfPoints = this._curve.dataSize();
        this._value = 0;
        var twoAbarY = 0;
        var AbarX = 0;

        for (var i = 1; i < numOfPoints; ++i) {
          var p2 = this._curve.sample(i); //point to right of the left ruler
          var p1 = this._curve.sample(i - 1); //point to left of (or at) the
          var fn = Utility.linearEquationFromPoints(p1, p2);
          var left = p1.x;
          if (p2.x < _rulerLeft) continue;
          if (p1.x > _rulerRight) continue;
          if (left < _rulerLeft) left = _rulerLeft;
          var right = p2.x;
          if (right > _rulerRight) right = _rulerRight;
          this._value += math.evaluate(
            "integrate(" +
              fn +
              ", x," +
              left +
              "," +
              right +
              ",false," +
              step +
              ")"
          );
          twoAbarY += math.evaluate(
            "integrate(" +
              "((" +
              fn +
              ")" +
              "*" +
              "(" +
              fn +
              "))" +
              ", x," +
              left +
              "," +
              right +
              ",false," +
              step +
              ")"
          );
          AbarX += math.evaluate(
            "integrate(" +
              "x * (" +
              fn +
              ")" +
              ", x," +
              left +
              "," +
              right +
              ",false," +
              step +
              ")"
          );
        }

        m_value = this._value;
        this._value = Utility.adjustForDecimalPlaces(
          this._value,
          decimalPlacesX + decimalPlacesY
        );
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(this._value, precision);
        var barY = Utility.adjustForDecimalPlaces(
          twoAbarY / (2 * m_value),
          decimalPlacesY
        );
        if (isNaN(barY)) Static.watchUpdateError = true;
        var barX = Utility.adjustForDecimalPlaces(
          AbarX / m_value,
          decimalPlacesX
        );
        if (isNaN(barX)) Static.watchUpdateError = true;
        barY = Utility.toPrecision(barY, precisionY);
        barX = Utility.toPrecision(barX, precisionX);

        if (Static.watchCentroidWithArea) {
          if (this._value == 0) {
            barX = barY = "Infinity";
          }
          this._value += " centroid:(" + barX + ", " + barY + ")";
          cgMarker.setValue(barX, barY);
          cgMarker.setVisible(true);
        } else {
          cgMarker.setVisible(false);
        }
      }
      if (!this._curve || !this._curve.plot()) return;
      this._curve.plot().setAutoReplot(autoReplot);
      //this._curve.plot().autoRefresh();
      this._curve = 0;
    };
  }
}

class WatchVolumeOfRevolution extends Watch {
  constructor(rulerGroup) {
    super(rulerGroup);
    var self = this;
    function getvolume(y1, y2, w) {
      var volume = y1 * w * Math.PI * y1;
      volume =
        volume + 0.5 * (y2 - y1) * w * (y1 + (y2 - y1) / 3) * 2 * Math.PI;
      //this._curve = 0;
      return volume;
    }
    this.name = function () {
      return "Volume of revolution";
    };
    this.computeWatch = function () {
      if (!this._curve.plot()) return;
      Static.watchUpdateError = false;
      if (
        self._magnifying == true ||
        (this._rulerLeft == this._rulerLeftPrevious &&
          this._rulerRight == this._rulerRightPrevious)
      ) {
        this._update = false;
        this._curve = 0;
        return;
      }
      this._update = true;
      var precisionY = this._curve.plot().axisPrecision(this._curve.yAxis());
      var precisionX = this._curve.plot().axisPrecision(this._curve.xAxis());
      const precision = Math.min(precisionX, precisionY);

      var decimalPlacesY = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.yAxis());
      var decimalPlacesX = this._curve
        .plot()
        .axisDecimalPlaces(this._curve.xAxis());
      // var step = Static.calcStep(this._curve);

      let _rulerLeft = (this._rulerLeftPrevious = this._rulerLeft);
      let _rulerRight = (this._rulerRightPrevious = this._rulerRight);

      //Pre-calculation adjustment
      _rulerLeft = Utility.adjustForDecimalPlaces(_rulerLeft, decimalPlacesX);
      _rulerRight = Utility.adjustForDecimalPlaces(_rulerRight, decimalPlacesX);

      var widthPx =
        this._curve.plot().transform(this._curve.xAxis(), _rulerRight) -
        this._curve.plot().transform(this._curve.xAxis(), _rulerLeft);
      const step = Math.abs(
        (Static.accuracyFactor * (_rulerRight - _rulerLeft)) / widthPx
      );
      if (isNaN(step) || step === 0) {
        //console.log(step);
        this._curve = 0;
        return;
      }

      if (this._rulerLeft == Number.MAX_VALUE || !isFinite(this._rulerLeft))
        this._value = "Invalid";
      else {
        if (this._curve.expandedFn) {
          var fn = this._curve.expandedFn;
          fn = Utility.logBaseAdjust(fn);
          if (this._curve.variable != "x") {
            while (fn.indexOf(this._curve.variable) != -1) {
              fn = fn.replace(this._curve.variable, "x");
            }
          }
          if (this._curve.coeffs) {
            for (var i = 0; i < this._curve.coeffs.length; ++i) {
              while (fn.indexOf(this._curve.coeffs[i]) != -1) {
                fn = fn.replace(
                  this._curve.coeffs[i],
                  this._curve.coeffsVal[i]
                );
              }
            }
          }

          if (_rulerLeft > _rulerRight) {
            var temp = _rulerLeft;
            _rulerLeft = _rulerRight;
            _rulerRight = temp;
          }
          //var decimalPlaces = 2 * this._curve.plot().axisDecimalPlaces(this._curve.yAxis()) + this._curve.plot().axisDecimalPlaces(this._curve.xAxis());
          //var step = Static.calcStep(this._curve);
          this._value = math.evaluate(
            `integrate(${fn} , ${this._curve.variable}, ${_rulerLeft}, ${_rulerRight}, true, ${step})`
          );
          // this._value = math.evaluate(
          //   "integrate(" +
          //     fn +
          //     ", x," +
          //     _rulerLeft +
          //     "," +
          //     _rulerRight +
          //     ",true," +
          //     step +
          //     ")"
          // );
          this._value = Utility.adjustForDecimalPlaces(
            this._value,
            decimalPlacesX + 2 * decimalPlacesY
          );
          if (isNaN(this._value)) Static.watchUpdateError = true;
          this._value = Utility.toPrecision(this._value, precision);

          if (isNaN(this._value)) this._value = "< 1E-300";
          this._curve = 0;
          return;
        }
        var numOfPoints = this._curve.dataSize();
        var xLeft = this._rulerLeft;
        var xRight = this._rulerRight;
        var A0 = 0;
        var An = 0;
        var Ai = 0;
        for (var i = 1; i < numOfPoints; ++i) {
          var p2 = this._curve.sample(i); //point to right of the left ruler
          var p1 = this._curve.sample(i - 1); //point to left of (or at) the
          if (!A0 && p2.x > xLeft && p2.x <= xRight) {
            var y = p1.y + ((p2.y - p1.y) * (xLeft - p1.x)) / (p2.x - p1.x); //point to left of (or at) the left ruler
            A0 = getvolume(y, p2.y, p2.x - xLeft);
            continue;
          }
          if (A0 && p2.x <= xRight) {
            Ai += getvolume(p2.y, p1.y, p2.x - p1.x);
            continue;
          }
          if (p2.x > xRight) {
            if (p1.x >= xLeft) {
              var y = p2.y + ((p2.y - p1.y) * (xRight - p2.x)) / (p2.x - p1.x);
              An = getvolume(y, p1.y, xRight - p1.x);
              break;
            } else {
              var y2 = p2.y + ((p2.y - p1.y) * (xRight - p2.x)) / (p2.x - p1.x);
              var y1 = p1.y + ((p2.y - p1.y) * (xLeft - p1.x)) / (p2.x - p1.x);
              An = getvolume(y2, y1, xRight - xLeft);
              break;
            }
          }
        }
        //var decimalPlaces = 2 * this._curve.plot().axisDecimalPlaces(this._curve.yAxis()) + this._curve.plot().axisDecimalPlaces(this._curve.xAxis());
        this._value = Utility.adjustForDecimalPlaces(
          A0 + Ai + An,
          decimalPlacesY + 2 * decimalPlacesX
        );
        if (isNaN(this._value)) Static.watchUpdateError = true;
        this._value = Utility.toPrecision(this._value, precision);

        if (isNaN(this._value)) this._value = "< 1E-300";
      }
      this._curve = 0;
    };
  }
}
