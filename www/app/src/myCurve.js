"include ['plotcurve']";

"use strict";

class MyCurve extends Curve {
  /* static init() {
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
  }  */
  constructor(tle) {
    super(tle);
    const self = this;
    this.setAxis = false;
    this.rc = null;
    this.axesSwapped = false;
    this.relation = false;

    self.left = 0;
    self.right = 0;

    this.unboundedDiscontinuity = null;

    this.parameterLimits = []; //Array of object: {minimum, maximum}

    this.toString = function () {
      return "[MyCurve]";
    };

    //self.plot().getLayout().getCentralWidget().setMouseTracking(false);

    /* Static.bind("itemAttached", function (e, item, on) {
      //console.log(486, item == self, on);
      if (item == self && on) {
        if (Static.swapAxes == 0) {
          //Implicit
          if (self.xIsDependentVariable) {
            self.swapAxes();
            Static.trigger("axesSwapped", item);
          }
        }
        if (Static.swapAxes == 1) {
          //Do not swap
        }
        if (Static.swapAxes == 2) {
          //Swap
          self.swapAxes();
          Static.trigger("axesSwapped", item);
        }
      }
    }); */

    //this.discontinuity = [0]; //-2, 2]; //0, Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI];
  }

  /* //f(x) is horizontal and x is vertical
  swapAxes() {
    if (!this.axesSwapped) {
      const self = this;
      const plot = self.plot();

      const x_scaleDiv = plot.axisScaleDiv(self.xAxis());
      let x_min = x_scaleDiv.lowerBound(),
        x_max = x_scaleDiv.upperBound();

      const y_scaleDiv = plot.axisScaleDiv(self.yAxis());
      let y_min = y_scaleDiv.lowerBound(),
        y_max = y_scaleDiv.upperBound();

      // console.log(x_min, x_max);
      // console.log(y_min, y_max);
      //console.log(this.discontinuity);

      let autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      let samples = self.data().samples();
      this.axesSwapped = true;
      samples = samples.map(function (pt) {
        let x = pt.x;
        pt.x = pt.y;
        pt.y = x;
        return pt;
      });
      if (self.turningPoints && self.turningPoints.length) {
        const points = self.turningPoints;
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const temp = pt.x;
          pt.x = pt.y;
          pt.y = temp;
          points[i] = pt;
        }
      }
      if (self.inflectionPoints && self.inflectionPoints.length) {
        const points = self.inflectionPoints;
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const temp = pt.x;
          pt.x = pt.y;
          pt.y = temp;
          points[i] = pt;
        }
      }

      for (let i = 5; i < 8; i++) {
        plot.rv.watch(i).setEnable(false);
        plot.tbar.hideDropdownItem("Watch", i);
      }
      self.setSamples(samples);
      plot.setAxisScale(self.xAxis(), y_min, y_max);
      plot.setAxisScale(self.yAxis(), x_min, x_max);
      Static.trigger("invalidateWatch");
      plot.rv.updateWatchesAndTable();
      plot.setAutoReplot(autoReplot);
      plot.rv.refresh();
    }
  }

  //x is horizontal and f(x) is vertical
  unSwapAxes() {
    if (!this.axesSwapped) return;

    const self = this;
    const plot = this.plot();
    const x_scaleDiv = plot.axisScaleDiv(self.xAxis());
    let x_min = x_scaleDiv.lowerBound(),
      x_max = x_scaleDiv.upperBound();

    const y_scaleDiv = plot.axisScaleDiv(self.yAxis());
    let y_min = y_scaleDiv.lowerBound(),
      y_max = y_scaleDiv.upperBound();

    let autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);

    this.axesSwapped = false;

    let samples = self.data().samples();
    samples = samples.map(function (pt) {
      let x = pt.x;
      pt.x = pt.y;
      pt.y = x;
      return pt;
    });
    if (self.turningPoints && self.turningPoints.length) {
      const points = self.turningPoints;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const temp = pt.x;
        pt.x = pt.y;
        pt.y = temp;
        points[i] = pt;
      }
    }
    if (self.inflectionPoints && self.inflectionPoints.length) {
      const points = self.inflectionPoints;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const temp = pt.x;
        pt.x = pt.y;
        pt.y = temp;
        points[i] = pt;
      }
    }
    for (let i = 5; i < 8; i++) {
      plot.tbar.showDropdownItem("Watch", i);
      if (plot.tbar.isDropdownItemChecked("Watch", i)) {
        plot.rv.watch(i).setEnable(true);
      }
    }
    self.setSamples(samples);
    plot.setAxisScale(self.xAxis(), y_min, y_max);
    plot.setAxisScale(self.yAxis(), x_min, x_max);
    plot.rv.updateWatchesAndTable();
    plot.setAutoReplot(autoReplot);
    plot.rv.refresh();
  } */

  async drawCurve(painter, style, xMap, yMap, from, to) {
    const self = this;

    const plot = self.plot();
    const autoReplot = plot.autoReplot();

    plot.setAutoReplot(false);
    // self.plot().getCentralWidget().setMouseTracking(false);

    let samples = null; //self.data().samples();
    //console.log(self.data());
    if (!self.unboundedRange) {
      samples = self.data().samples();
    }

    //self.panningStarted = false;

    //this.unSwapAxes();

    let indexBeforeDiscontinuity = [];

    if (
      //!self.unboundedRange &&
      self.discontinuity &&
      self.discontinuity.length
    ) {
      if (!self.unboundedRange) {
        //Account for discontinuity

        //samples are free of discontinuity.
        const samples = self.data().samples();

        //console.log(self.discontinuity);

        for (let n = 0; n < self.discontinuity.length; n++) {
          for (let i = 0; i < samples.length; i++) {
            if (!self.axesSwapped) {
              if (samples[i].x > self.discontinuity[n]) {
                indexBeforeDiscontinuity.push(i - 1);
                break;
              }
            } else {
              if (samples[i].y > self.discontinuity[n]) {
                indexBeforeDiscontinuity.push(i - 1);
                break;
              }
            }
          }
        }

        if (indexBeforeDiscontinuity.length < self.discontinuity.length)
          indexBeforeDiscontinuity.push(samples.length - 1);

        let m_from = from,
          m_to;
        for (let i = 0; i < indexBeforeDiscontinuity.length; i++) {
          if (indexBeforeDiscontinuity[i] < 0) continue;
          m_to = indexBeforeDiscontinuity[i];
          if (m_from < m_to) {
            //console.log(486, self.data().samples());
            super.drawCurve(painter, style, xMap, yMap, m_from, m_to);
            //console.log(487, self.data().samples());
          }
          m_from = m_to + 1;
        }

        if (
          indexBeforeDiscontinuity.length == 1 &&
          indexBeforeDiscontinuity[0] == -1
        ) {
          //console.log(486, self.data().samples());
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
          //console.log(487, self.data().samples());
        }

        if (m_to < to && m_from < to) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }
      } else {
        try {
          const plot = self.plot();
          const autoReplot = plot.autoReplot();
          plot.setAutoReplot(false);

          self.unboundedDiscontinuity = self.discontinuity;
          //console.log("Draw unbounded");
          let samples = [];
          const data = self.data();

          const sz = data.size();

          const scaleDiv = plot.axisScaleDiv(self.xAxis());
          let left = scaleDiv.lowerBound(),
            right = scaleDiv.upperBound();
          const width = right - left;

          left -= 0.25 * width;

          right += 0.25 * width;

          // let discontinuity;

          // if (self.left != left && self.right != right) {
          //   console.log(456);
          //   self.left = left;
          //   self.right = right;
          //if (Static.panning) {
          self.unboundedDiscontinuity = await Utility.discontinuity(
            self.fn,
            left,
            right,
            self.variable
          );
          //}

          //console.log(self.unboundedDiscontinuity);

          if (!self.unboundedDiscontinuity.length) {
            data.discontinuitySamples = null;
            return super.drawCurve(painter, style, xMap, yMap, from, to);
          }

          const obj = {
            fx: self.fn,
            lowerX: left,
            upperX: right,
            numOfSamples: sz,
            //indepVarIsDegree: obj.indepVarIsDegree,
            indepVar: Utility.findIndepVar(self.fn),
            //indepVarY = obj.variableY; // || findIndepVarY(fx); TODO

            discontinuity: self.unboundedDiscontinuity,
          };

          data.discontinuitySamples = Utility.makeSamples(obj);

          if (self.unboundedDiscontinuity && data.discontinuitySamples) {
            for (let n = 0; n < self.unboundedDiscontinuity.length; n++) {
              for (let i = 0; i < data.discontinuitySamples.length; i++) {
                if (
                  data.discontinuitySamples[i].x >
                  self.unboundedDiscontinuity[n]
                ) {
                  indexBeforeDiscontinuity.push(i - 1);
                  break;
                }
              }
            }
          }

          if (
            data.discontinuitySamples &&
            indexBeforeDiscontinuity &&
            self.unboundedDiscontinuity &&
            indexBeforeDiscontinuity.length < self.unboundedDiscontinuity.length
          )
            indexBeforeDiscontinuity.push(data.discontinuitySamples.length - 1);

          let m_from = from,
            m_to;
          for (let i = 0; i < indexBeforeDiscontinuity.length; i++) {
            if (indexBeforeDiscontinuity[i] <= 0) continue;
            m_to = indexBeforeDiscontinuity[i];
            if (m_from < m_to) {
              super.drawCurve(painter, style, xMap, yMap, m_from, m_to);
            }
            m_from = m_to + 1;
          }

          if (data.discontinuitySamples && data.discontinuitySamples.length) {
            m_to = data.discontinuitySamples.length - 1;
            if (m_from < m_to) {
              super.drawCurve(painter, style, xMap, yMap, m_from, m_to);
            }
          }

          /* if (m_to < to && m_from < to) {
            super.drawCurve(painter, style, xMap, yMap, m_from, to);
          } */
          self.unboundedDiscontinuity = null;
        } catch (error) {
          console.log(error);
        }
      } ////////////
      if (!self.setAxis) {
        self.setAxis = true;
        if (!self.unboundedRange) Utility.setAutoScale(plot, true);
        plot.setAxisScale(self.yAxis(), -6, 6);
      }
    } else {
      super.drawCurve(painter, style, xMap, yMap, from, to);
    }
    if (!self.unboundedRange) {
      //self.plot().getLayout().getCentralWidget().setMouseTracking(true);
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    }
    // self.plot().getCentralWidget().setMouseTracking(true);
  } ////////
}
//MyCurve.init();
