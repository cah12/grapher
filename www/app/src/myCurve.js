"include ['plotcurve']";

class MyCurve extends Curve {
  constructor(tle) {
    super(tle);
    const self = this;
    this.setAxis = false;
    this.rc = null;
    this.axesSwapped = false;

    this.parameterLimits = []; //Array of object: {minimum, maximum}

    this.toString = function () {
      return "[MyCurve]";
    };

    Static.bind("itemAttached", function (e, item, on) {
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
    });

    //this.discontinuity = [0]; //-2, 2]; //0, Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI];
  }

  //f(x) is horizontal and x is vertical
  swapAxes() {
    if (!this.axesSwapped) {
      //console.log(this.discontinuity);
      const self = this;
      const plot = self.plot();
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

      for (let i = 5; i < 8; i++) {
        plot.rv.watch(i).setEnable(false);
        plot.tbar.hideDropdownItem("Watch", i);
      }
      self.setSamples(samples);
      Static.trigger("invalidateWatch");
      plot.rv.updateWatchesAndTable();
      plot.setAutoReplot(autoReplot);
      plot.rv.refresh();
    }
  }

  //x is horizontal and f(x) is vertical
  unSwapAxes() {
    if (!this.axesSwapped) return;

    const plot = this.plot();
    let autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);

    this.axesSwapped = false;
    const self = this;
    let samples = self.data().samples();
    samples = samples.map(function (pt) {
      let x = pt.x;
      pt.x = pt.y;
      pt.y = x;
      return pt;
    });
    for (let i = 5; i < 8; i++) {
      plot.tbar.showDropdownItem("Watch", i);
      if (plot.tbar.isDropdownItemChecked("Watch", i)) {
        plot.rv.watch(i).setEnable(true);
      }
    }
    self.setSamples(samples);
    plot.rv.updateWatchesAndTable();
    plot.setAutoReplot(autoReplot);
    plot.rv.refresh();
  }

  drawCurve(painter, style, xMap, yMap, from, to) {
    const self = this;
    let samples = null; //self.data().samples();
    //console.log(self.data());
    if (!self.unboundedRange) {
      samples = self.data().samples();
    }

    //this.unSwapAxes();

    let indexBeforeDiscontinuity = [];
    const plot = self.plot();
    if (
      //!self.unboundedRange &&
      self.discontinuity &&
      self.discontinuity.length
    ) {
      // const autoReplot = plot.autoReplot();
      // plot.setAutoReplot(false);
      if (!self.unboundedRange) {
        //Account for discontinuity

        //samples are free of discontinuity.
        const samples = self.data().samples().slice();

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
          if (indexBeforeDiscontinuity[i] <= 0) continue;
          m_to = indexBeforeDiscontinuity[i];
          if (m_from < m_to) {
            super.drawCurve(painter, style, xMap, yMap, m_from, m_to);
          }
          m_from = m_to + 1;
        }

        if (
          indexBeforeDiscontinuity.length == 1 &&
          indexBeforeDiscontinuity[0] == -1
        ) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }

        if (m_to < to && m_from < to) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }
      } else {
        //console.log("Draw unbounded");
        let samples = [];
        const data = self.data();

        const sz = data.size();

        const scaleDiv = plot.axisScaleDiv(self.xAxis());
        let left = scaleDiv.lowerBound(),
          right = scaleDiv.upperBound();

        let discontinuity = Utility.discontinuity(
          self.fn,
          left,
          right,
          self.variable
        );
        if (!discontinuity.length) {
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

          discontinuity: discontinuity,
        };

        data.discontinuitySamples = Utility.makeSamples(obj);

        for (let n = 0; n < discontinuity.length; n++) {
          for (let i = 0; i < data.discontinuitySamples.length; i++) {
            if (data.discontinuitySamples[i].x > discontinuity[n]) {
              indexBeforeDiscontinuity.push(i - 1);
              break;
            }
          }
        }

        if (indexBeforeDiscontinuity.length < discontinuity.length)
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

        if (m_to < to && m_from < to) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }
      }
      if (!self.setAxis) {
        self.setAxis = true;
        plot.setAxisScale(self.yAxis(), -60, 60);
      }
    } else {
      super.drawCurve(painter, style, xMap, yMap, from, to);
    }
  }
}
