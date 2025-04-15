"use strict";
/**
 *
 * A class which draws a polar grid.
 *
 * The PolarGrid class is a subclass of PlotGrid class. It is used to draw a polar grid.
 * A polar grid consists of a pole (origin), a polar axis (initial ray), and a series of concentric
 * circles and radial lines emanating from the pole. It used to plot points using polar coordinates (r, θ).
 *
 * Applications using a PlotGrid together with a PolarGrid must provide code to toggle(hide/show) the grids.
 * @extends PlotGrid
 */
class PolarGrid extends PlotGrid {
  /**
   *
   * @param {String} tle Title of grid
   */
  constructor(tle, panner = null) {
    super(tle);
    const self = this;

    this.polarGrid = false;

    let m_zeroMinRadius = true;

    let radialPrecision = 4;
    let rayPrecision = 4;

    this.panner = panner;

    self.detachedCurves = [];

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

    Static.bind("axisChanged", function (e, newAxis, item, oldAxis) {
      if (!self.polarGrid || item.rtti != PlotItem.RttiValues.Rtti_PlotCurve) {
        return;
      }
      if (newAxis === Axis.AxisId.xTop) {
        item.setXAxis(Axis.AxisId.xBottom);
      }

      if (newAxis === Axis.AxisId.yRight) {
        item.setYAxis(Axis.AxisId.yLeft);
      }
      Utility.alert(
        `Cannot change the axis of "${item.title()}". Any curve in the polar grid is drawn to the bottom(x) and left(y) axes.`,
        null,
        "validAxesInPolarGridAxisChanged"
      );
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      const plot = plotItem.plot();
      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);

      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (on && self.polarGridAttached) {
          plotItem.originalDrawSticks = plotItem.drawSticks;
          plotItem.drawSticks = self.drawSticks;

          plotItem.originalClosePolyline = plotItem.closePolyline;
          plotItem.closePolyline = self.closePolyline;
        } else if (!on && plotItem.originalDraw) {
          plotItem.drawSticks = plotItem.originalDrawSticks;
          plotItem.closePolyline = plotItem.originalClosePolyline;
        }
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    });

    this.setZeroMinRadius = function (on) {
      m_zeroMinRadius = on;
      self.plot().autoRefresh();
    };

    this.zeroMinRadius = function () {
      return m_zeroMinRadius;
    };

    this.validAxes = function (curve) {
      if (
        curve &&
        curve.xAxis() === Axis.AxisId.xBottom &&
        curve.yAxis() === Axis.AxisId.yLeft
      ) {
        return true;
      }
      Utility.alert(
        `Check that the curve "${curve.title()}" is drawn to the bottom(x) and left(y) axes.`,
        null,
        "validAxesInPolarGrig"
      );
      return false;
    };

    this.closePolyline = function (xMap, yMap, polygon) {
      if (polygon.length < 2) return;

      const _self = this;

      const x = self.ctx.canvas.width / 2;
      const y = self.ctx.canvas.height / 2;

      let bs = _self.baseline();

      const series = _self.data();

      const axisScaleDiv = self.plot().axisScaleDiv(2);

      let samples = [];
      if (series instanceof FunctionData) {
        samples = series.discontinuitySamples;
      } else {
        samples = series.samples();
      }

      if (axisScaleDiv.upperBound() < axisScaleDiv.lowerBound()) {
        samples = samples.map(function (pt) {
          return new Misc.Point(-1 * pt.x, pt.y);
        });
      }

      bs = _self.baseline();

      const _validTransformPoints = self.transformedBaseline(
        bs,
        yMap,
        samples,
        x,
        y
      );

      if (_validTransformPoints.length === 0) {
        polygon.splice(0, polygon.length); //no closed polygon available. clear the array
        return;
      }

      _validTransformPoints.reverse();

      for (let i = 0; i < _validTransformPoints.length; i++) {
        polygon.push(_validTransformPoints[i]);
      }
      polygon.push(new Misc.Point(polygon[0]));
      //}
    };

    this.transformRadial = function (s, yMap) {
      const v = yMap.transform(s);
      return this.pole.y - v / 2;
    };

    function drawRadial(painter, xMap, yMap, ticks) {
      //circles
      if (!ticks || ticks.length === 0) {
        return;
      }
      const ctx = painter.context();

      let radius;
      for (let i = 0; i < ticks.length; i++) {
        radius = self.transformRadial(ticks[i], yMap);
        if (radius <= 0) {
          continue;
        }
        ctx.beginPath();
        ctx.arc(self.pole.x, self.pole.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      if (radius > 0 && radius < self.pole.y) {
        ctx.beginPath();
        ctx.arc(self.pole.x, self.pole.y, self.pole.y, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    function drawRays(painter, yMap, ticks) {
      //rays (lines from center)
      if (!ticks || ticks.length === 0) {
        return;
      }
      const ctx = painter.context();

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;

      const radius = ctx.canvas.height / 2;

      let angle = 0;

      let delta = self.angleStep(ticks);

      //for (let i = 0; i < ticks.length; i++) {
      for (let i = 0; i < ticks; i++) {
        const x2 = radius * math.cos(angle) + x;
        const y2 = y - radius * math.sin(angle);
        painter.drawLine(x, y, x2, y2);
        angle += delta;
      }
    }

    function drawRayLabel(painter, yMap, ticks) {
      const plot = self.plot();

      if (
        !plot
          .axisScaleDraw(0)
          .hasComponent(AbstractScaleDraw.ScaleComponent.Labels)
      ) {
        return;
      }
      //rays (lines from center)
      if (!ticks || ticks.length === 0) {
        return;
      }

      ticks = 12;

      const ctx = painter.context();

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;

      const th = painter.textSize("8888");

      const radius = 0.75 * y; // - th.width;

      let angle = 0;

      const degArrNormal = [
        0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
      ];
      const degArrInverted = [
        360, 330, 300, 270, 240, 210, 180, 150, 120, 90, 60, 30,
      ];
      let degArr = degArrNormal;
      let v = "\u03c0";

      const radArrNormal = [
        `0`,
        `${v}/6`,
        `${v}/3`,
        `${v}/2`,
        `2${v}/3`,
        `5${v}/6`,
        `${v}`,
        `7${v}/6`,
        `4${v}/3`,
        `3${v}/2`,
        `5${v}/3`,
        `11${v}/6`,
      ];

      let radArr = radArrNormal;

      const radArrInverted = [
        `2${v}`,
        `11${v}/6`,
        `5${v}/3`,
        `3${v}/2`,
        `4${v}/3`,
        `7${v}/6`,
        `${v}`,
        `5${v}/6`,
        `2${v}/3`,
        `${v}/2`,
        `${v}/3`,
        `${v}/6`,
      ];

      const xScaleDiv = plot.axisScaleDiv(2);
      if (xScaleDiv.upperBound() < xScaleDiv.lowerBound()) {
        degArr = degArrInverted;
        radArr = radArrInverted;
      }

      const s_space =
        Utility.mathMode() === "rad" ? (2 * Math.PI) / ticks : 360 / ticks;

      let labelArr = Utility.mathMode() === "rad" ? radArr : degArr;

      for (let i = 0; i < labelArr.length; i++) {
        if (i === 0 || i === 3 || i === 6 || i === 9) {
          angle += s_space;
          continue;
        }
        const x2 = radius * math.cos(angle) + x;
        const y2 = y - radius * math.sin(angle); // + 0.5 * th.height;
        painter.drawText(
          labelArr[i] /* .toPrecision(rayPrecision) */,
          x2,
          y2,
          "center"
        );
        angle += s_space;
      }
    }

    const longestText = function (ticks) {
      var result = "";
      for (var i = 0; i < ticks.length; i++) {
        const s = `${ticks[i]}`;
        result = result.length < s.length ? s : result;
      }

      return result;
    };

    //this.maxTickLength = function () {
    function drawRadialLabel(painter, xMap, yMap, ticks) {
      //circles
      if (!ticks || ticks.length === 0) {
        return;
      }
      const _majorPen = self.majorPen();
      //console.log(xMap);
      const axisScaleDraw = self.plot().axisScaleDraw(0);
      const ctx = painter.context();

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;

      const th = painter.textSize(longestText(ticks));

      let radius;

      const mode = Utility.mathMode();

      let backboneSpacing = 0;
      const textSpace = 2;

      let tickLength = 0;

      if (axisScaleDraw.hasComponent(AbstractScaleDraw.ScaleComponent.Ticks)) {
        tickLength = axisScaleDraw.tickLengths(ScaleDiv.TickType.MajorTick);
      }

      if (
        axisScaleDraw.hasComponent(AbstractScaleDraw.ScaleComponent.Backbone)
      ) {
        backboneSpacing = 3;
        painter.save();
        painter.setPen(_majorPen);
        //vertical
        painter.drawLine(
          x - backboneSpacing,
          0.5 * backboneSpacing,
          x - backboneSpacing,
          2 * y - 0.5 * backboneSpacing
        );
        //Horizontal
        painter.drawLine(
          x - y - 0.5 * backboneSpacing,
          y + backboneSpacing,
          x + y - 0.5 * backboneSpacing,
          y + backboneSpacing
        );
        painter.restore();
      }

      let trueRadius;
      for (let i = 1; i < ticks.length; i++) {
        radius = self.transformRadial(ticks[i], yMap) - 0.5 * th.height;
        trueRadius = radius + 0.5 * th.height;

        const x2 = radius * math.cos(mode == "rad" ? 0.418879 : 24) + x;
        const y2 = y - radius * math.sin(mode == "rad" ? 0.418879 : 24);
        radius = radius + th.height;
        const x2_ = x + radius * math.cos(mode == "rad" ? 3.50811 : 21 + 180);
        const y2_ = y - radius * math.sin(mode == "rad" ? 3.50811 : 21 + 180);

        if (
          axisScaleDraw.hasComponent(AbstractScaleDraw.ScaleComponent.Labels)
        ) {
          painter.drawText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            x - radius,
            y + tickLength + backboneSpacing + textSpace + th.height,
            "center"
          );
          painter.drawText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            radius + x,
            y + tickLength + backboneSpacing + textSpace + th.height,
            "center"
          );

          if (trueRadius + 0.5 * th.height < y) {
            painter.drawText(
              `${ticks[i].toPrecision(radialPrecision)}`,
              x - tickLength - backboneSpacing - textSpace,
              y + trueRadius + 0.5 * th.height,
              "right"
            );

            painter.drawText(
              `${ticks[i].toPrecision(radialPrecision)}`,
              x - tickLength - backboneSpacing - textSpace,
              y - trueRadius + 0.5 * th.height,
              "right"
            );
          }
        }

        if (tickLength) {
          painter.save();
          const tickPen = new Misc.Pen(_majorPen);
          tickPen.width = 2;
          painter.setPen(tickPen);
          //Along horizontal diameter
          painter.drawLine(
            x - trueRadius,
            y + backboneSpacing,
            x - trueRadius,
            y + tickLength + backboneSpacing
          );
          painter.drawLine(
            x + trueRadius,
            y + backboneSpacing,
            x + trueRadius,
            y + tickLength + backboneSpacing
          );
          //Along vertical diameter
          painter.drawLine(
            x - backboneSpacing,
            y + trueRadius,
            x - tickLength - backboneSpacing,
            y + trueRadius
          );
          painter.drawLine(
            x - backboneSpacing,
            y - trueRadius,
            x - tickLength - backboneSpacing,
            y - trueRadius
          );
          painter.restore();
        }
      }
    }

    //Azimuth (y) 0 - 360
    //Radial (x) 0 - 10 default
    this.draw = function (xMap, yMap) {
      const plot = this.plot();

      const axisScaleDiv = plot.axisScaleDiv(2);

      self._upperBound = axisScaleDiv.upperBound();
      self._lowerBound = axisScaleDiv.lowerBound();

      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      this.xMap = xMap;

      this.yMap = yMap;
      const _minorPen = self.minorPen();
      const _majorPen = self.majorPen();
      const xMinEnabled = self.xMinEnabled();
      const xEnabled = self.xEnabled();
      const yMinEnabled = self.yMinEnabled();
      const yEnabled = self.yEnabled();
      const p = this.plot();
      const yScaleDiv = p.axisScaleDiv(this.yAxis());

      const axisMaxMajorRay = p.axisMaxMajor(0);

      radialPrecision = p.axisPrecision(2);
      rayPrecision = p.axisPrecision(0);

      const ctx = this.getContext();
      this.ctx = ctx;

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;
      this.pole = new Misc.Point(x, y);

      var painter = new PaintUtil.Painter(ctx);

      if (xEnabled && xMinEnabled) {
        //  draw radial grid (circles)
        painter.setPen(new Misc.Pen(_minorPen));
        drawRadial(
          painter,
          xMap,
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MinorTick)
        );
      }

      if (xEnabled) {
        //  draw radial grid (circles)
        painter.setPen(new Misc.Pen(_majorPen));
        drawRadial(
          painter,
          xMap,
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MajorTick)
        );
        const font = p.axisLabelFont(Axis.AxisId.xBottom);
        painter.setFont(font);
        drawRadialLabel(
          painter,
          xMap,
          yMap,
          yScaleDiv.ticks(ScaleDiv.TickType.MajorTick)
        );
      }

      //draw azimuth grid

      if (yEnabled && yMinEnabled) {
        painter.setPen(new Misc.Pen(_minorPen));
        drawRays(painter, yMap, 6 * 4);
      }

      if (yEnabled) {
        painter.setPen(new Misc.Pen(_majorPen));
        drawRays(painter, yMap, 4);
        const font = p.axisLabelFont(Axis.AxisId.xBottom);
        //font.fontColor = "#D3D3D3";
        const _f = new Misc.Font(font);
        _f.fontColor = "#808080";
        painter.setFont(_f);
        drawRayLabel(painter, yMap, axisMaxMajorRay);
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    };

    this.mToPoints = function (
      boundingRect,
      xMap,
      yMap,
      series,
      from,
      to,
      round
    ) {
      //console.log("object");
      const { _validTransformPoints, untransformedPoints } =
        self.validTransformPoints(
          boundingRect,
          xMap,
          yMap,
          series,
          from,
          to,
          round
        );

      //console.log(_validTransformPoints, untransformedPoints);

      return _validTransformPoints;
    };

    this.mToPolylineFiltered = function (xMap, yMap, series, from, to, round) {
      return self.mToPoints(null, xMap, yMap, series, from, to, round);
    };

    this.drawSticks = function (painter, xMap, yMap, from, to) {
      /* "this" references the curve and "self" references the grid*/
      const { _validTransformPoints, untransformedPoints } =
        self.validTransformPoints(
          null,
          xMap,
          yMap,
          this.data(),
          from,
          to,
          null
        );
      const samples = _validTransformPoints;
      const unTransPoints = untransformedPoints;
      if (!samples.length) return;

      to = samples.length - 1;

      const ctx = painter.context();

      let bs = this.baseline();

      const transPoints = self.transformedBaseline(
        bs,
        yMap,
        unTransPoints,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );

      if (transPoints.length === 0 || samples.length === 0) return;

      for (let i = from; i <= to; i++) {
        painter.drawLine(
          transPoints[i].x,
          transPoints[i].y,
          samples[i].x,
          samples[i].y
        );
      }
    };

    this.updateAxes = function () {
      // Find bounding interval of the item data
      // for all axes, where autoscaling is enabled

      const self = this;

      const m_plotItemStore = this.plotItemStore();
      const d_axisData = this.axisData();

      var intv = [
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
        new Interval(Number.MAX_VALUE, -Number.MAX_VALUE),
      ];

      let prevRect = new Misc.Rect();

      for (var i = 0; i < m_plotItemStore.length; ++i) {
        var item = m_plotItemStore[i];
        if (!item.testItemAttribute(PlotItem.ItemAttribute.AutoScale)) continue;

        if (!item.isVisible()) continue;

        if (
          this.axisAutoScale(item.xAxis()) ||
          this.axisAutoScale(item.yAxis())
        ) {
          //alert(item)
          var rect = item.boundingRect();
          //if (!rect.isValid()) continue;

          if (rect.isEqual(prevRect)) continue;
          prevRect = rect;

          //console.log(rect.toString());

          if (rect.width() >= 0.0) {
            //intv[item.xAxis()] |= new Interval( rect.left(), rect.right());
            if (rect.left() < intv[item.xAxis()].minValue())
              intv[item.xAxis()].setMinValue(rect.left());
            if (rect.right() > intv[item.xAxis()].maxValue())
              intv[item.xAxis()].setMaxValue(rect.right());
            //intv[item.xAxis()].setInterval(rect.left(), rect.right())
          }

          if (rect.height() >= 0.0) {
            //intv[item.yAxis()] |= new Interval( rect.top(), rect.bottom );
            if (rect.top() < intv[item.yAxis()].minValue())
              intv[item.yAxis()].setMinValue(rect.top());
            if (rect.bottom() > intv[item.yAxis()].maxValue())
              intv[item.yAxis()].setMaxValue(rect.bottom());
          }

          if (item.rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
            if (item.xValue() < intv[item.xAxis()].minValue())
              intv[item.xAxis()].setMinValue(item.xValue());
            if (item.xValue() > intv[item.xAxis()].maxValue())
              intv[item.xAxis()].setMaxValue(item.xValue());

            if (item.yValue() < intv[item.yAxis()].minValue())
              intv[item.yAxis()].setMinValue(item.yValue());
            if (item.yValue() > intv[item.yAxis()].maxValue())
              intv[item.yAxis()].setMaxValue(item.yValue());
          }
        }
      }

      let setZeroMin = false;
      // Adjust scales
      for (var axisId = 0; axisId < Axis.AxisId.axisCnt; axisId++) {
        var d = d_axisData[axisId];
        var minValue = d.minValue;
        var maxValue = d.maxValue;
        var stepSize = d.stepSize;

        if (d.doAutoScale && intv[axisId].isValid()) {
          d.isValid = false;
          minValue = intv[axisId].minValue();
          maxValue = intv[axisId].maxValue();

          if (Utility.mFuzzyCompare(maxValue, minValue)) {
            minValue = minValue - Static._eps;
          }

          var xValues = {
            x1: axisId === 0 && m_zeroMinRadius ? 0 : minValue,
            x2: maxValue,
          };
          setZeroMin = true;
          d.scaleEngine.autoScale(d.maxMajor, xValues, stepSize);
          minValue = xValues["x1"];
          maxValue = xValues["x2"];
        }
        if (!d.isValid) {
          if (minValue < maxValue) {
            //Not inverted
            minValue =
              !setZeroMin && axisId === 0 && m_zeroMinRadius ? 0 : minValue;
          } else {
            //Inverted
            maxValue =
              !setZeroMin && axisId === 0 && m_zeroMinRadius ? 0 : maxValue;
          }
          d.scaleDiv = d.scaleEngine.divideScale(
            minValue,
            maxValue,
            d.maxMajor,
            d.maxMinor,
            stepSize
          );
          d.isValid = true;
        }
        var scaleWidget = this.axisWidget(axisId);
        scaleWidget.setScaleDiv(d.scaleDiv);

        //var startDist, endDist;
        var startAndEndObj = {
          start: undefined,
          end: undefined,
        };
        scaleWidget.getBorderDistHint(startAndEndObj);
        scaleWidget.setBorderDist(startAndEndObj.start, startAndEndObj.end);

        setZeroMin = false;
      }

      m_plotItemStore.forEach(function (item) {
        if (item.testItemInterest(PlotItem.ItemInterest.ScaleInterest)) {
          item.updateScaleDiv(
            self.axisScaleDiv(item.xAxis()),
            self.axisScaleDiv(item.yAxis())
          );
        }
      });
    };

    this.toString = function () {
      return "[PolarGrid]";
    };
  }

  transformedBaseline(baseline, yMap, samples, pole_x, pole_y) {
    const self = this;
    const _baseline = self.transformRadial(baseline, yMap);
    const baselineSamples = samples.map(function (pt) {
      return new Misc.Point(pt.x, _baseline);
    });
    const plot = self.plot();
    const auto = Utility.isAutoScale(plot);

    const _validTransformPoints = [];
    const radius = baselineSamples[0].y;
    for (let i = 0; i < baselineSamples.length; i++) {
      const angl = baselineSamples[i].x;

      baselineSamples[i].x = pole_x + radius * math.cos(angl);
      baselineSamples[i].y = radius * math.sin(-angl) + pole_y;
      let restrictRadius = auto ? self.pole.y : self.pole.y - 8;
      if (Math.abs(radius) <= Math.abs(restrictRadius)) {
        _validTransformPoints.push(
          new Misc.Point(baselineSamples[i].x, baselineSamples[i].y)
        );
      }
    }
    return _validTransformPoints;
  }

  angleStep(ticks) {
    let delta = (2 * Math.PI) / ticks;
    if (Utility.mathMode() === "deg") {
      delta = 360 / ticks;
    }
    return delta;
  }

  hide() {
    this.polarGridVisible(false);
    this.polarGrid = false;
    const plot = this.plot();
    if (this._axisMaxMinor !== undefined) {
      plot.setAxisMaxMinor(0, this._axisMaxMinor);
      plot.setAxisMaxMajor(0, this._axisMaxMajor);
    }
    super.hide();
    Static.trigger("polarGridStatus", this.polarGrid);
  }
  show() {
    const plot = this.plot();
    this._axisMaxMinor = plot.axisMaxMinor(0);
    this._axisMaxMajor = plot.axisMaxMajor(0);
    plot.setAxisMaxMinor(0, 6);
    plot.setAxisMaxMajor(0, 4);
    this.polarGrid = true;
    this.polarGridVisible(true);
    super.show();
    Static.trigger("polarGridStatus", this.polarGrid);
  }

  validTransformPoints(boundingRect, xMap, yMap, series, from, to, round) {
    const self = this;
    const points = [];
    let untransformedPoints = [];
    const _validTransformPoints = [];

    const axisScaleDiv = self.plot().axisScaleDiv(2);

    let samples = [];
    if (series instanceof FunctionData) {
      samples = series.discontinuitySamples;
    } else {
      samples = series.samples();
    }

    if (axisScaleDiv.upperBound() < axisScaleDiv.lowerBound()) {
      samples = samples.map(function (pt) {
        return new Misc.Point(-1 * pt.x, pt.y);
      });
    }

    const auto = Utility.isAutoScale(self.plot());
    if (!auto) {
      const s_x1 = xMap.s1();
      const s_x2 = xMap.s2();
      const inverted = s_x1 > s_x2 ? true : false;

      samples = samples.filter(function (pt) {
        if (!inverted) {
          //s_x2 > s_x1
          if (pt.x >= s_x1 && pt.x <= s_x2) {
            return true;
          }
          return false;
        } else {
          //s_x1 > s_x2
          if (-1 * pt.x <= s_x1 && -1 * pt.x >= s_x2) {
            return true;
          }
          return false;
        }
      });
      if (to > samples.length - 1) {
        to = samples.length - 1;
      }
    }

    for (let i = from; i <= to; i++) {
      const pt = samples[i];
      untransformedPoints.push(new Misc.Point(pt));
      points.push({ x: pt.x, y: self.transformRadial(pt.y, yMap) });
    }
    const x = self.ctx.canvas.width / 2;
    const y = self.ctx.canvas.height / 2;

    for (let i = 0; i < points.length; i++) {
      const angl = points[i].x;
      const radius = points[i].y;
      points[i].x = x + radius * math.cos(angl);
      points[i].y = radius * math.sin(-angl) + y;
      let restrictRadius = auto ? self.pole.y : self.pole.y - 8;
      if (Math.abs(radius) <= Math.abs(restrictRadius)) {
        _validTransformPoints.push(new Misc.Point(points[i].x, points[i].y));
      } else if (untransformedPoints) {
        untransformedPoints[i] = null;
      }
    }
    untransformedPoints = untransformedPoints.filter(function (pt) {
      if (pt) return true;
      return false;
    });
    return { _validTransformPoints, untransformedPoints };
  }

  polarGridVisible(on) {
    const self = this;
    self.polarGridAttached = on;
    const plot = self.plot();
    const autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);

    if (on) {
      const L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let i = 0; i < L.length; i++) {
        if (!self.validAxes(L[i])) {
          L[i].detach();
          self.detachedCurves.push(L[i]);
          continue;
        }
        L[i].originalDrawSticks = L[i].drawSticks;
        L[i].drawSticks = self.drawSticks;
        L[i].originalClosePolyline = L[i].closePolyline;
        L[i].closePolyline = self.closePolyline;
      }
      if (self.polarGrid) {
        self.original_mToPoints = Static.mToPoints;
        Static.mToPoints = self.mToPoints;
        self.original_mToPolylineFiltered = Static.mToPolylineFiltered;
        Static.mToPolylineFiltered = self.mToPolylineFiltered;

        self.original_widgetMousePressEvent_panner =
          self.panner.widgetMousePressEvent;
        self.panner.widgetMousePressEvent = function () {
          return true;
        };

        self.original_setAxisMaxMinor = plot.setAxisMaxMinor;
        plot.setAxisMaxMinor = function () {};
        self.original_setAxisMaxMajor = plot.setAxisMaxMajor;
        plot.setAxisMaxMajor = function () {};

        self.original_updateAxes = plot.updateAxes;
        plot.updateAxes = self.updateAxes;
      }
    } else {
      if (self.polarGrid) {
        Static.mToPoints = self.original_mToPoints;
        Static.mToPolylineFiltered = self.original_mToPolylineFiltered;
        self.panner.widgetMousePressEvent =
          self.original_widgetMousePressEvent_panner;

        plot.setAxisMaxMinor = self.original_setAxisMaxMinor;
        plot.setAxisMaxMajor = self.original_setAxisMaxMajor;

        plot.updateAxes = self.original_updateAxes;
      }
      const L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let i = 0; i < L.length; i++) {
        if (L[i].originalClosePolyline) {
          L[i].drawSticks = L[i].originalDrawSticks;
          L[i].closePolyline = L[i].originalClosePolyline;
        }
      }
      for (let i = 0; i < self.detachedCurves.length; i++) {
        const curve = self.detachedCurves[i];
        curve.attach(plot);
      }
      self.detachedCurves.length = 0;
    }
    plot.setAutoReplot(autoReplot);
    plot.autoRefresh();
  }
}
