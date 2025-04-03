"use strict";
/**
 * /////////////////////////////////////
 * A class which draws a coordinate grid.
 *
 * The PlotGrid class can be used to draw a coordinate grid. A coordinate grid consists of major and minor vertical and horizontal grid lines. The locations of the grid lines are determined by the X and Y scale divisions which can be assigned with setXDiv() and setYDiv(). The draw() member draws the grid within a bounding rectangle.
 * @extends PlotItem
 */
class PolarGrid extends PlotGrid {
  /**
   *
   * @param {String} tle Title of grid
   */
  constructor(tle) {
    super(tle);
    const self = this;

    let s1 = null;
    let s2 = null;

    Static.polarGrid = true; //paaner checks dthis flag and ignores panning

    let radialPrecision = 4;
    let rayPrecision = 4;

    let magnifying = false;

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

    //this.rtti = PlotItem.RttiValues.Rtti_PolarGrid;

    Static.bind("magnifyingStart", function () {
      magnifying = true;
    });

    Static.bind("magnifyingEnd", function () {
      magnifying = false;
    });

    Static.bind("rescaled", function (e, axisId, min, max) {
      if (axisId === 0 && !magnifying) {
        s1 = min;
        s2 = max;
      }
    });

    Static.bind("polarGridVisible", function (e, on) {
      self.polarGridAttached = on;
      //console.log("self.polarGridAttached", self.polarGridAttached);
      const plot = self.plot();
      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      if (on) {
        const L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
        for (let i = 0; i < L.length; i++) {
          L[i].originalDraw = L[i].drawSeries;
          L[i].drawSeries = self.drawSeries;
        }
      } else {
        const L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
        for (let i = 0; i < L.length; i++) {
          if (L[i].originalDraw) {
            L[i].drawSeries = L[i].originalDraw;
          }
        }
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      const plot = plotItem.plot();
      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);

      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (on && self.polarGridAttached) {
          plotItem.originalDraw = plotItem.drawSeries;
          plotItem.drawSeries = self.drawSeries;
        } else if (!on && plotItem.originalDraw) {
          plotItem.drawSeries = plotItem.originalDraw;
        }
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    });

    //self === grid this === curve
    this.drawSeries = function (xMap, yMap, from = 0, to = -1) {
      if (!self.polarGridAttached) {
        return;
      }
      const _self = this; //
      /*********** Helpers Start *************************** */
      function validTransformPoints() {
        const points = [];
        const _validTransformPoints = [];
        const samples = _self.data().samples();
        for (let i = 0; i < samples.length; i++) {
          const pt = samples[i];
          points.push({ x: pt.x, y: self.transformRadial(pt.y, yMap) });
        }
        const x = self.ctx.canvas.width / 2;
        const y = self.ctx.canvas.height / 2;

        const auto = Utility.isAutoScale(_self.plot());
        for (let i = 0; i < points.length; i++) {
          const angl = points[i].x;
          const radius = points[i].y;
          points[i].x = x + radius * math.cos(angl);
          points[i].y = radius * math.sin(-angl) + y;
          let restrictRadius = auto ? self.pole.y : self.pole.y - 8;
          if (Math.abs(radius) < Math.abs(restrictRadius)) {
            _validTransformPoints.push(
              new Misc.Point(points[i].x, points[i].y)
            );
          }
        }
        return _validTransformPoints;
      }

      const drawDots = function (painter, xMap, yMap, from, to) {
        const points = validTransformPoints();
        for (let i = 0; i < points.length; i++) {
          painter.drawPoint(points[i]);
        }
      };

      const drawLines = function (painter, xMap, yMap, from, to) {
        const points = validTransformPoints();
        painter.drawPolyline(points);
      };

      const drawSymbols = function (ctx, symbol, xMap, yMap, from, to) {
        const points = validTransformPoints();
        if (points.length > 0) symbol.drawSymbols(ctx, points);
      };

      const drawSteps = function (painter, xMap, yMap, from, to) {
        const samples = validTransformPoints();
        let points = [];
        from = 0;
        to = samples.length - 1;
        let sz = 2 * (to - from) + 1;
        for (let i = 0; i < sz; ++i) points.push(new Misc.Point());

        let inverted = _self.orientation() == Static.Vertical;
        if (_self.curveAttributes() & Curve.CurveAttribute.Inverted)
          inverted = !inverted;

        let i, ip;

        for (i = from, ip = 0; i <= to; i++, ip += 2) {
          let sample = samples[i];

          let xi = sample.x;
          let yi = sample.y;

          if (ip > 0) {
            let p0 = points[ip - 2];
            let p = points[ip - 1];

            if (inverted) {
              p.x = p0.x;
              p.y = yi;
            } else {
              p.x = xi;
              p.y = p0.y;
            }
          }

          points[ip].x = xi;
          points[ip].y = yi;
        }

        painter.drawPolyline(points);
        if (_self.brush() != "noBrush" /* doFill */) {
          _self.fillCurve(painter, xMap, yMap, points);
        }
      };

      const drawSticks = function (painter, xMap, yMap, from, to) {
        const m_baseline = _self.baseline();
        const x0 = self.pole.x + m_baseline; //xMap.transform(m_baseline);
        const y0 = self.pole.y; //yMap.transform(m_baseline);

        const o = _self.orientation();

        const samples = validTransformPoints();

        for (let i = from; i <= to; i++) {
          const sample = samples[i];
          const xi = sample.x;
          const yi = sample.y;

          if (o == Static.Horizontal) painter.drawLine(x0, yi, xi, yi);
          else painter.drawLine(xi, y0, xi, yi);
        }
      };

      const doDrawCurve = function (painter, style, xMap, yMap, from, to) {
        switch (style) {
          case Curve.CurveStyle.Lines:
            if (_self.testCurveAttribute(Curve.CurveAttribute.Fitted)) {
              // we always need the complete
              // curve for fitting
              from = 0;
              to = _self.dataSize() - 1;
            }
            drawLines(painter, xMap, yMap, from, to);
            break;
          case Curve.CurveStyle.Sticks:
            drawSticks(painter, xMap, yMap, from, to);
            break;
          case Curve.CurveStyle.Steps:
            drawSteps(painter, xMap, yMap, from, to);
            break;
          case Curve.CurveStyle.Dots:
            drawDots(painter, xMap, yMap, from, to);
            break;
          case Curve.CurveStyle.NoCurve:
          default:
            break;
        }
      };

      /*********** Helpers End *************************** */

      // const plot = this.plot();
      // const autoReplot = plot.autoReplot();
      // plot.setAutoReplot(false);
      // this.clearCanvas();

      const ctx = _self.getContext();

      let painter = new PaintUtil.Painter(ctx);
      const numSamples = _self.dataSize();

      if (numSamples <= 0) return;

      if (to < 0) to = numSamples - 1;
      //doDrawCurve(painter, style, xMap, yMap, from, to);
      if (Curve.mVerifyRange(numSamples, from, to) > 0) {
        painter.save();
        painter.setPen(_self.pen());
        painter.setBrush(_self.brush());

        doDrawCurve(painter, _self.style(), xMap, yMap, from, to);
        painter.restore();
        const m_symbol = _self.symbol();
        if (m_symbol && m_symbol.style() !== Symbol2.Style.NoSymbol) {
          painter.save();
          painter.setPen(m_symbol.pen());
          painter.setBrush(m_symbol.brush());
          drawSymbols(ctx, m_symbol, xMap, yMap, from, to);
          painter.restore();
        }
      }
      painter = null;

      // plot.setAutoReplot(autoReplot);
      // plot.autoRefresh();
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
      //rays (lines from center)
      if (!ticks || ticks.length === 0) {
        return;
      }

      const ctx = painter.context();

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;

      const th = painter.textSize("8888");

      const radius = y - th.width;

      let angle = 0;

      if (s1 === null) {
        s1 = yMap.s1();
        s2 = yMap.s2();
      }

      //const s_space = (s2 - s1) / ticks;
      const s_space =
        Utility.mathMode() === "rad" ? (2 * Math.PI) / ticks : 360 / ticks;

      const labelArr = [0];

      let v = 0; //s1;
      for (let i = 1; i < ticks; i++) {
        v += s_space;
        labelArr.push(v);
      }

      let delta = (2 * Math.PI) / 8;
      if (Utility.mathMode() === "deg") {
        delta = 360 / ticks;
      }

      //for (let i = 0; i < ticks.length; i++) {
      for (let i = 0; i < ticks; i++) {
        const x2 = radius * math.cos(angle) + x;
        const y2 = y - radius * math.sin(angle) + 0.5 * th.height;
        painter.drawText(
          labelArr[i].toPrecision(rayPrecision),
          x2,
          y2,
          "center"
        );
        //painter.drawRotatedText("789", x2, y2, -1 * angle /* degrees */);
        angle += delta;
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
      //console.log(xMap);
      const ctx = painter.context();

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;

      const th = painter.textSize(longestText(ticks));

      let radius;

      const mode = Utility.mathMode();

      for (let i = 1; i < ticks.length; i++) {
        radius = self.transformRadial(ticks[i], yMap) - 0.5 * th.height;

        const x2 = radius * math.cos(mode == "rad" ? 0.418879 : 24) + x;
        const y2 = y - radius * math.sin(mode == "rad" ? 0.418879 : 24);
        radius = radius + th.height;
        const x2_ = x + radius * math.cos(mode == "rad" ? 3.50811 : 21 + 180);
        const y2_ = y - radius * math.sin(mode == "rad" ? 3.50811 : 21 + 180);

        if (mode === "rad") {
          painter.drawRotatedText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            x2,
            y2,
            1.15192,
            true
          );

          painter.drawRotatedText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            x2_,
            y2_,
            1.20428,
            true
          );
        } else {
          painter.drawRotatedText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            x2,
            y2,
            -24 + 90
          );

          painter.drawRotatedText(
            `${ticks[i].toPrecision(radialPrecision)}`,
            x2_,
            y2_,
            -21 + 90
          );
        }
      }
    }

    //Azimuth (y) 0 - 360
    //Radial (x) 0 - 10 default
    this.draw = function (xMap, yMap) {
      const plot = this.plot();
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
      const xScaleDiv = p.axisScaleDiv(this.xAxis());
      const yScaleDiv = p.axisScaleDiv(this.yAxis());

      const axisMaxMinorRadial = p.axisMaxMinor(1);
      const axisMaxMinorRay = p.axisMaxMinor(0);

      const axisMaxMajorRadial = p.axisMaxMajor(1);
      const axisMaxMajorRay = p.axisMaxMajor(0);

      radialPrecision = p.axisPrecision(2);
      rayPrecision = p.axisPrecision(0);

      const ctx = this.getContext();
      this.ctx = ctx;

      const x = ctx.canvas.width / 2;
      const y = ctx.canvas.height / 2;
      this.pole = new Misc.Point(x, y);

      //console.log(this.pole.toString());

      //   ctx.strokeStyle = _minorPen;
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
        drawRays(painter, yMap, axisMaxMinorRay * axisMaxMajorRay);
      }

      if (yEnabled) {
        painter.setPen(new Misc.Pen(_majorPen));
        drawRays(painter, yMap, axisMaxMajorRay);
        const font = p.axisLabelFont(Axis.AxisId.xBottom);
        painter.setFont(font);
        drawRayLabel(painter, yMap, axisMaxMajorRay);
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    };

    this.toString = function () {
      return "[PolarGrid]";
    };
  }

  angleStep(ticks) {
    let delta = (2 * Math.PI) / 8;
    if (Utility.mathMode() === "deg") {
      delta = 360 / ticks;
    }
    return delta;
  }

  //The order of triggering is important
  hide() {
    Static.trigger("polarGridVisible", false);
    super.hide();
    //Static.trigger("polarGridVisible", false);
  }
  show() {
    //Static.trigger("polarGridVisible", true);
    super.show();
    Static.trigger("polarGridVisible", true);
  }
}
