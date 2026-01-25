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
    self.earlier = 0;

    this.discontinuity = [];

    this.unboundedDiscontinuity = null;

    this.parameterLimits = []; //Array of object: {minimum, maximum}

    this.toString = function () {
      return "[MyCurve]";
    };

    this.math_mode = Static.math_mode;

    //this.discontinuity = [0]; //-2, 2]; //0, Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI];
  }

  async drawCurve(painter, style, xMap, yMap, from, to) {
    const self = this;

    try {
      // const self = this;

      /* if (
        self.parametricFnX &&
        self.parametricFnY &&
        !self.parametricDiscontinuityIndex
      ) {
        //Parametric
        self.parametricDiscontinuityIndex = findDiscontinuity(self);
      } */

      if (!self.unboundedRange) {
        return self.doDraw(painter, style, xMap, yMap, from, to);
      } else {
        const data = self.data();
        if (self.discontinuosCurvePending) {
          data.discontinuitySamples = null;
          return;
        }

        const plot = self.plot();

        let scaleDiv = plot.axisScaleDiv(self.xAxis());
        if (Static.AxisInYX) {
          scaleDiv = plot.axisScaleDiv(self.yAxis());
        }
        let left = scaleDiv.lowerBound();
        let right = scaleDiv.upperBound();
        //Why???????
        // if (!isFinite(left) || !isFinite(right)) {
        //   scaleDiv = plot.axisScaleDiv(self.xAxis());
        //   left = scaleDiv.lowerBound();
        //   right = scaleDiv.upperBound();
        // }
        // left -= w;
        // right += w;
        if (
          self.left != left &&
          self.right != right &&
          self.discontinuity.length &&
          !self.discontinuosCurvePending
        ) {
          self.left = left;
          self.right = right;
          self.discontinuosCurvePending = true;

          if (
            /* Utility.isPeriodic(self.fn) */ typeof self.period == "number"
          ) {
            self.discontinuity = Utility.handlePeriodic(
              self.period,
              self.discontinuity,
              self.left,
              self.right,
            );
          } else if (
            !self.period &&
            !Utility.hasInfiniteDiscontinuity(self.discontinuity)
          ) {
            // console.log(45);
          }
        }

        let sz = self.data().size();
        if (
          Static.number_of_points_auto &&
          self.discontinuity &&
          self.discontinuity.length &&
          self.fn /* &&
          Utility.isPeriodic(self.fn) */
        ) {
          let s = Static.min_discontinuity_samples;
          if (Utility.isPeriodic(self.fn)) {
            s = s * 20;
          }
          sz = Math.max(s, data.size());
        }
        //const sz = Math.max(Static.min_discontinuity_samples, data.size());
        //console.log(data);
        data.setSize(sz);

        const obj = {
          fx: self.fn,
          lowerX: left,
          upperX: right,
          numOfSamples: sz,
          indepVar: Utility.findIndepVar(self.fn),
          discontinuity: self.discontinuity,
        };

        // try {
        //if (data.toString() != "[SyntheticPointData]") {
        data.discontinuitySamples = Utility.makeSamples(obj);

        if (Static.AxisInYX) {
          //Swap x and y in discontinuity samples
          const samples = data.discontinuitySamples.slice();
          for (let i = 0; i < samples.length; i++) {
            const pt = samples[i];
            const temp = pt.x;
            pt.x = pt.y;
            pt.y = temp;
            samples[i] = pt;
          }
          data.discontinuitySamples = samples;
        }

        self.doDraw(
          painter,
          style,
          xMap,
          yMap,
          from,
          to,
          data.discontinuitySamples,
        );

        //data.discontinuitySamples = null;
        plot.autoRefresh();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /* isScaleAdjustNeeded() {
    const self = this;
    let adjust = false;
    for (let i = 0; i < self.discontinuity.length; i++) {
      if (
        self.discontinuity[i][1] == "infinite" ||
        self.discontinuity[i][1] == "jump"
      ) {
        adjust = true;
        break;
      }
    }
    return adjust;
  } */

  isDrawDiscontinuosCurve(indexBeforeDiscontinuity) {
    const self = this;
    let hasInfiniteOrJump = false;
    // if (
    //   self.parametricDiscontinuityIndex &&
    //   self.parametricDiscontinuityIndex.length
    // ) {
    //   return true;
    // }
    // if (self.discontinuity.length == 1) {
    //   if (self.discontinuity[0][1] == "jump") {
    //     return true;
    //   }
    // }
    for (let i = 0; i < self.discontinuity.length; i++) {
      if (self.discontinuity[i].length >= 2) {
        if (
          self.discontinuity[i][1] == "infinite" ||
          self.discontinuity[i][1] == "essential" ||
          self.discontinuity[i][1] == "unknown2" ||
          self.discontinuity[i][1] == "jump" ||
          self.discontinuity[i][1] == "removable"
        ) {
          hasInfiniteOrJump = true;
          break;
        }
      }
    }
    for (let i = 0; i < self.discontinuityY.length; i++) {
      if (self.discontinuityY[i].length >= 2) {
        if (
          self.discontinuityY[i][1] == "infinite" ||
          self.discontinuityY[i][1] == "essential" ||
          self.discontinuityY[i][1] == "unknown2" ||
          self.discontinuityY[i][1] == "jump" ||
          self.discontinuityY[i][1] == "removable"
        ) {
          hasInfiniteOrJump = true;
          break;
        }
      }
    }

    if (!hasInfiniteOrJump) return false;

    if (
      indexBeforeDiscontinuity.length == 1 &&
      indexBeforeDiscontinuity[0] === -1
    ) {
      return false;
    }

    return true;
  }

  async doDraw(painter, style, xMap, yMap, from, to, samples) {
    const self = this;
    const plot = self.plot();
    self.discontinuityY = self.discontinuityY || [];
    if (
      !self.discontinuity.length &&
      !self.discontinuityY.length &&
      !self.discontinuosCurvePending
    ) {
      // if (!Utility.isAutoScale(plot)) {
      //plot.updateScalesOnSwap();
      // }
      return super.drawCurve(painter, style, xMap, yMap, from, to);
    } else {
      //[11, 74, 136, 199, 262, 324, 387]; //for 1/sin(x)
      let indexBeforeDiscontinuity;
      //if (samples && samples.length) {
      samples = samples || self.data().samples();

      to = samples.length - 1;

      let val_x = samples[0].x;
      if (Static.AxisInYX) {
        val_x = samples[0].y;
      }
      /* if (
        samples.length &&
        self.discontinuity.length == 1 &&
        self.discontinuity[0][1] == "removable" &&
        !self.unboundedRange
      ) {
        return super.drawCurve(painter, style, xMap, yMap, from, to);
      } */
      if (
        samples.length &&
        self.discontinuity.length == 1 &&
        self.discontinuity[0][1] != "infinite" &&
        self.discontinuity[0][1] != "essential" &&
        Utility.adjustForDecimalPlaces(val_x, 6) >=
          Utility.adjustForDecimalPlaces(self.discontinuity[0][0], 6) &&
        !self.unboundedRange
      ) {
        if (self.discontinuity.length == 0) {
          return super.drawCurve(painter, style, xMap, yMap, from, to);
        }
      }
      //samples = samples.sort((a, b) => a.pos - b.pos);
      indexBeforeDiscontinuity = self.indices(samples);
      if (self.discontinuityY && self.discontinuityY.length) {
        //swap x any y in samples
        samples = samples.map((pt) => {
          let x = pt.x;
          pt.x = pt.y;
          pt.y = x;
          return pt;
        });
        samples = samples.sort((a, b) => a.x - b.x);
        let indexBeforeDiscontinuityY = self.indices(samples, true);
        samples = samples.map((pt) => {
          let x = pt.x;
          pt.x = pt.y;
          pt.y = x;
          return pt;
        });
        samples = samples.sort((a, b) => a.pos - b.pos);
        indexBeforeDiscontinuity = indexBeforeDiscontinuity.concat(
          indexBeforeDiscontinuityY,
        );
        indexBeforeDiscontinuity = indexBeforeDiscontinuity.sort(
          (a, b) => a - b,
        );
      }
      if (
        !self.unboundedRange &&
        !self.isDrawDiscontinuosCurve(indexBeforeDiscontinuity)
      ) {
        return super.drawCurve(painter, style, xMap, yMap, from, to);
      }

      if (!self.setAxis) {
        self.setAxis = true;
        if (!self.unboundedRange) {
          Utility.setAutoScale(plot, true);
        }
        if (Utility.isScaleAdjustNeeded(self)) {
          if (!Static.AxisInYX) {
            plot.setAxisScale(self.yAxis(), -6, 6);
            if (self.discontinuityY && self.discontinuityY.length) {
              plot.setAxisScale(self.xAxis(), -10, 10);
            }
          } else {
            plot.setAxisScale(self.yAxis(), -10, 10);
            if (self.discontinuityY && self.discontinuityY.length) {
              plot.setAxisScale(self.xAxis(), -6, 6);
            }
          }
        }
      }
      self.drawDiscontinuosCurve(
        painter,
        style,
        xMap,
        yMap,
        from,
        to,
        indexBeforeDiscontinuity,
      );
    }
  }

  drawDiscontinuosCurve(
    painter,
    style,
    xMap,
    yMap,
    from,
    to,
    indexBeforeDiscontinuity,
  ) {
    if (indexBeforeDiscontinuity) {
      if (indexBeforeDiscontinuity.length) {
        this.discontinuosCurvePending = false;
        const plot = this.plot();
        let m_from = from,
          m_to;
        for (let i = 0; i < indexBeforeDiscontinuity.length; i++) {
          if (indexBeforeDiscontinuity[i] < 0) continue;
          m_to = indexBeforeDiscontinuity[i];
          if (m_from < m_to) {
            super.drawCurve(painter, style, xMap, yMap, m_from, m_to);
          }
          if (m_from == m_to) {
            // break;
            continue;
          }
          m_from = m_to + 1;
        }

        if (
          indexBeforeDiscontinuity.length == 1 &&
          indexBeforeDiscontinuity[0] == -1
        ) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }

        if ((m_to === undefined || m_to < to) && m_from < to) {
          super.drawCurve(painter, style, xMap, yMap, m_from, to);
        }
      } else {
        super.drawCurve(painter, style, xMap, yMap, from, to);
      }
    }

    // plot.autoRefresh();
  }

  indices(samples, do_y = false) {
    const self = this;
    let i = 0;
    const smallNumber = 1e-100;
    let indexBeforeDiscontinuity = [];

    let swapXY = false;
    let shf = 0;

    let discont = self.discontinuity;
    if (do_y) {
      discont = self.discontinuityY;
    }

    // check for large numbers
    for (i; i < samples.length; i++) {
      if (!Static.AxisInYX) {
        if (
          Math.abs(samples[i].y) >= Static.LargeNumber ||
          Math.abs(samples[i].x) >= Static.LargeNumber
        ) {
          indexBeforeDiscontinuity.push(i);
          i = i + 2; //skip next two points to avoid multiple discontinuities at same location
          continue;
        }
      } else {
        if (
          Math.abs(samples[i].x) >= Static.LargeNumber ||
          Math.abs(samples[i].y) >= Static.LargeNumber
        ) {
          indexBeforeDiscontinuity.push(i);
          i = i + 2; //skip next two points to avoid multiple discontinuities at same location
          continue;
        }
      }
    }

    for (let n = 0; n < discont.length; n++) {
      /* if (n === 0 && self.parametricFnX && isFinite(self.parametricFnX)) {
        //swap x and y
        samples = samples.map((pt) => {
          const temp = pt.x;
          pt.x = pt.y;
          pt.y = temp;
          return pt;
        });

        samples = samples.sort((a, b) => a.x - b.x);
        swapXY = true;
        shf = parseFloat(self.parametricFnX);
      } */
      if (discont[n][1] != "infinite" && discont[n][1] != "essential") {
        for (let i = 0; i < samples.length; i++) {
          if (!Static.AxisInYX) {
            if (samples[i].x > discont[n][0] - shf && i > 0) {
              indexBeforeDiscontinuity.push(i - 1);
              if (discont[n][2] != undefined && isFinite(discont[n][2])) {
                samples[i - 1].y = discont[n][2];
              } else if (discont[n][1] == "jump") {
                const x = (samples[i - 1].x + samples[i].x) / 2;
                const adjust =
                  Math.abs(discont[n][0] - x) < 1e-4 ? true : false;
                if (discont[n][0] - samples[i - 1].x > smallNumber && adjust) {
                  samples[i - 1].x = discont[n][0] - smallNumber;
                  samples[i].x = discont[n][0] + smallNumber;
                  samples[i - 1].y = math.evaluate(self.fn, {
                    x: discont[n][0] - smallNumber,
                  });
                  samples[i].y = math.evaluate(self.fn, {
                    x: discont[n][0] + smallNumber,
                  });
                }
              }
              break;
            }
          } else {
            if (samples[i].y > discont[n][0] && i > 0) {
              indexBeforeDiscontinuity.push(i - 1);
              break;
            }
          }
        }
      }
      /* if (discont[n][1] === "infinite" || discont[n][1] === "essential") {
        for (i; i < samples.length; i++) {
          if (!Static.AxisInYX) {
            if (
              Math.abs(samples[i].y) >= Static.LargeNumber ||
              Math.abs(samples[i].x) >= Static.LargeNumber
            ) {
              indexBeforeDiscontinuity.push(i);
              i = i + 2; //skip next two points to avoid multiple discontinuities at same location
              continue;
            }
          } else {
            if (
              Math.abs(samples[i].x) >= Static.LargeNumber ||
              Math.abs(samples[i].y) >= Static.LargeNumber
            ) {
              indexBeforeDiscontinuity.push(i);
              i = i + 2; //skip next two points to avoid multiple discontinuities at same location
              continue;
            }
          }
        }
      } */
    }

    if (swapXY) {
      samples = samples.map((pt) => {
        const temp = pt.x;
        pt.x = pt.y;
        pt.y = temp;
        return pt;
      });
      samples = samples.sort((a, b) => a.pos - b.pos);
    }

    if (indexBeforeDiscontinuity.length < discont.length) {
      indexBeforeDiscontinuity.push(samples.length - 1);
      if (
        discont[discont.length - 1][2] != undefined &&
        isFinite(discont[discont.length - 1][2])
      ) {
        samples[samples.length - 1].y = discont[discont.length - 1][2];
      }
    }

    if (indexBeforeDiscontinuity.length) {
      if (indexBeforeDiscontinuity[0] === 0) {
        indexBeforeDiscontinuity = indexBeforeDiscontinuity.slice(1);
      }
      if (
        indexBeforeDiscontinuity[indexBeforeDiscontinuity.length - 1] ==
        samples.length - 1
      ) {
        indexBeforeDiscontinuity.pop();
      }
    }

    /* if (
      self.parametricDiscontinuityIndex &&
      self.parametricDiscontinuityIndex.length
    ) {
      indexBeforeDiscontinuity = indexBeforeDiscontinuity.concat(
        self.parametricDiscontinuityIndex
      );
    } */
    return indexBeforeDiscontinuity.sort((a, b) => a - b);
  }

  async drawCurve1(painter, style, xMap, yMap, from, to) {
    const self = this;

    const plot = self.plot();
    const autoReplot = plot.autoReplot();

    plot.setAutoReplot(false);

    let samples = null;
    if (!self.unboundedRange) {
      samples = self.data().samples();
    }

    let indexBeforeDiscontinuity = [];

    if (
      //!self.unboundedRange &&
      (self.discontinuity && self.discontinuity.length) ||
      self.hasDiscontinuity
    ) {
      if (!self.unboundedRange) {
        //Account for discontinuity
        //samples are free of discontinuity.
        const samples = self.data().samples();

        //console.log(self.discontinuity);

        for (let n = 0; n < self.discontinuity.length; n++) {
          for (let i = 0; i < samples.length; i++) {
            if (!Static.AxisInYX) {
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

          //self.unboundedDiscontinuity = self.discontinuity;
          //console.log("Draw unbounded");
          const data = self.data();

          const sz = data.size();

          const scaleDiv = plot.axisScaleDiv(self.xAxis());
          let left = scaleDiv.lowerBound(),
            right = scaleDiv.upperBound();

          if (!self.hasDiscontinuity && self.discontinuity.length) {
            self.hasDiscontinuity = true;
          }

          if (self.left != left && self.right != right) {
            //console.log(456);
            self.left = left;
            self.right = right;

            if (Utility.isPeriodic(self.fn)) {
              self.discontinuity = Utility.handlePeriodic(
                self.discontinuity,
                self.left,
                self.right,
              );
            }
          }

          if (!self.discontinuity.length) {
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

            discontinuity: self.discontinuity,
          };

          data.discontinuitySamples = Utility.makeSamples(obj);

          if (self.discontinuity && data.discontinuitySamples) {
            for (let n = 0; n < self.discontinuity.length; n++) {
              for (let i = 0; i < data.discontinuitySamples.length; i++) {
                if (data.discontinuitySamples[i].x > self.discontinuity[n]) {
                  indexBeforeDiscontinuity.push(i - 1);
                  break;
                }
              }
            }
          }

          if (
            data.discontinuitySamples &&
            indexBeforeDiscontinuity &&
            self.discontinuity &&
            indexBeforeDiscontinuity.length < self.discontinuity.length
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
          //self.unboundedDiscontinuity = null;
        } catch (error) {
          console.log(error);
        }
      } ////////////
      if (!self.setAxis) {
        self.setAxis = true;
        if (!self.unboundedRange) Utility.setAutoScale(plot, true);
        if (Utility.isScaleAdjustNeeded(self)) {
          plot.setAxisScale(self.yAxis(), -6, 6);
          if (self.discontinuityY && self.discontinuityY.length) {
            plot.setAxisScale(self.xAxis(), -10, 10);
          }
        }
      }
    } else {
      super.drawCurve(painter, style, xMap, yMap, from, to);
    }
    if (!self.unboundedRange) {
      //self.plot().getLayout().getCentralWidget().setMouseTracking(true);
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    }

    //self.plot().getCentralWidget().setMouseTracking(true);
  }
}
//MyCurve.init();
