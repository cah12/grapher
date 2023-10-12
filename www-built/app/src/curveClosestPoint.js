"include ['static','widgetOverlay', 'plotMarker']";

class MyOverlay extends WidgetOverlay {
  //function MyOverlay(widget){
  constructor(widget, eventObject) {
    super(widget);
    //WidgetOverlay.call(this, widget);////////////////
    var self = this;

    this.eventObject = eventObject;

    this.toString = function () {
      return "[MyOverlay]";
    };
  }
  drawOverlay(painter) {
    let xMap = this.curve.plot().canvasMap(this.curve.xAxis());
    let yMap = this.curve.plot().canvasMap(this.curve.yAxis());

    let cx = xMap.transform(this.eventObject.p.x);
    let cy = yMap.transform(this.eventObject.p.y);
    //console.log("point: ("+ cx + ", "+cy+")");
    painter.setBrush(new Misc.Brush("lightGrey"));
    painter.drawCircle(cx, cy, 8);
  }
}

class CurveSegmentWidgetOverlay extends WidgetOverlay {
  constructor(widget, eventObject) {
    super(widget);
    var self = this;

    this.eventObject = eventObject;

    this.toString = function () {
      return "[MyOverlay]";
    };
  }
  drawOverlay(painter) {
    const curve = this.curve;
    const plot = curve.plot();
    let xMap = plot.canvasMap(curve.xAxis());
    let yMap = plot.canvasMap(curve.yAxis());

    //console.log(plot);
    let p = {};
    painter.setBrush(new Misc.Brush("lightGrey"));
    painter.drawCircle(
      this.eventObject.clientPt.x,
      this.eventObject.clientPt.y,
      8
    );

    let samples = curve.data().samples();
    //console.log(this.eventObject.indexOfSelectedPoint)

    let otherPoint = null;

    painter.setPen(new Misc.Pen(curve.pen().color, 1, "dash"));

    if (samples.length == 1) {
      p = ScaleMap.transform(xMap, yMap, this.eventObject.p);
    } else if (samples.length == 2) {
      if (this.eventObject.indexOfSelectedPoint == 0) {
        otherPoint = samples[1];
      } else {
        otherPoint = samples[0];
      }
      p.x = xMap.transform(otherPoint.x);
      p.y = yMap.transform(otherPoint.y);
    } else if (samples.length > 2) {
      if (this.eventObject.indexOfSelectedPoint == 0) {
        otherPoint = samples[1];
        p = ScaleMap.transform(xMap, yMap, otherPoint);
      } else if (this.eventObject.indexOfSelectedPoint == samples.length - 1) {
        otherPoint = samples[samples.length - 2];
        p = ScaleMap.transform(xMap, yMap, otherPoint);
      } else {
        otherPoint = samples[this.eventObject.indexOfSelectedPoint - 1];
        p = ScaleMap.transform(xMap, yMap, otherPoint);
        let otherPoint2 = samples[this.eventObject.indexOfSelectedPoint + 1];
        let p2 = ScaleMap.transform(xMap, yMap, otherPoint2);
        painter.drawLine(p2, this.eventObject.clientPt);
      }
    }
    //console.log(this.curve.title(), this.eventObject.indexOfSelectedPoint);
    this.eventObject.moved = true;
    this.eventObject.samples = samples;

    painter.drawLine(p, this.eventObject.clientPt);
  }
}

class MyObject extends HObject {
  constructor(plot, cb) {
    super();
    var self = this;
    this._plot = plot;
    this._dmin = 10;
    this._cb == null;
    this.selected = false;
    //this.selectedCurve = false;
    this.button = Static.LeftButton;
    this.modifiers = Static.NoModifier;

    this.drawSegment = false;
    this.moved = false;

    this.panEnabled = false;
    this.zmEnabled = false;

    if (cb !== undefined) this._cb = cb;

    this.selectorWidgetOverlay = new MyOverlay(plot.getCentralWidget(), this);
    this.curveSegmentWidgetOverlay = new CurveSegmentWidgetOverlay(
      plot.getCentralWidget(),
      this
    );

    Static.bind("visibilityChange", function (e, curve, on) {
      if (self.selectorWidgetOverlay.curve !== curve) return;
      if (!on) {
        self.selectorWidgetOverlay.clearCanvas();
        this.selected = false;
      }
    });

    this.toString = function () {
      return "[MyObject]";
    };

    // this.undoStack = [];
    // this.redoStack = [];

    this.mouseUp = function (event) {
      this.drawSegment = false;
      this.curveSegmentWidgetOverlay.clearCanvas();

      if (this.moved) {
        const curve = this.curveSegmentWidgetOverlay.curve;

        const plot = this.curveSegmentWidgetOverlay.curve.plot();

        //const curve = this.curveSegmentWidgetOverlay.curve;
        let newPos = ScaleMap.invTransform(
          plot.axisScaleDraw(curve.xAxis()).scaleMap(),
          plot.axisScaleDraw(curve.yAxis()).scaleMap(),
          this.clientPt
        );
        //store the udo data before sample modification
        //const samples = this.samples.map((a) => Object.assign({}, a)); //store a copy of the samples
        const samples = this.samples.map(function(e){
          return new Misc.Point(e);
        });
        MyObject.undoStack.push({ curve, samples });
        this.samples[this.indexOfSelectedPoint] = newPos;

        this.samples.sort(function (a, b) {
          return a.x - b.x;
        });
        curve.setSamples(this.samples);

        Static.trigger(
          "currentCurveChangedEnds",
          this.selectorWidgetOverlay.curve
        );
        plot.rv.setCurrentCurve(this.previousCurrentCurve);
        Static.trigger("currentCurveChanged", this.previousCurrentCurve);

        this.previousCurrentCurve = null;

        plot.autoRefresh();
      }
      this.moved = false;

      if (this.zmEnabled) {
        plot.zm.setEnabled(true);
        //plot.pan.setEnabled(false);
        this.zmEnabled = false;
      }

      if (this.panEnabled) {
        plot.pan.setEnabled(true);
        //plot.zm.setEnabled(false);
        this.panEnabled = false;
      }
    };

    this.mouseClick = function (event) {
      if (
        event.button == this.button &&
        Utility.modifiers(event) == this.modifiers
      ) {
        if (this.selected) {
          //console.log("point: ("+ p.x + ", "+p.y+")")
          if (this._cb == null)
            alert(
              "Curve: " +
                this.selectorWidgetOverlay.curve.title() +
                "; point: (" +
                this.p.x +
                ", " +
                this.p.y +
                ")"
            );
          else {
            this._cb(this.selectorWidgetOverlay.curve, this.p);
          }
          //this.selected = false;
        }
        //this.selected = false;
        //return false;
      }
      return true;
    };

    function setAlignment(pt) {
      var curve = self.selectorWidgetOverlay.curve;
      var xs = plot.axisScaleDiv(curve.xAxis());
      var ys = plot.axisScaleDiv(curve.yAxis());
      var rect = new Misc.Rect(
        xs.lowerBound(),
        ys.lowerBound(),
        xs.range(),
        ys.range()
      );
      rect = rect.normalized();
      var alignment = 0;
      alignment |=
        pt.x < rect.left() + 0.3 * rect.width()
          ? Static.AlignRight
          : Static.AlignLeft;
      alignment |=
        pt.y - 0.3 * rect.height() > rect.top()
          ? Static.AlignBottom
          : Static.AlignTop;
      self.mPos.setLabelAlignment(alignment);
    }

    this.showMarker = function (point) {
      this.dragStartPoint = point;
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      var curve = this.selectorWidgetOverlay.curve;
      self.mPos.setAxes(curve.xAxis(), curve.yAxis());

      setAlignment(point);
      self.mPos.setVisible(true);
      self.mPos.setValue(point);

      var xVal = Utility.toPrecision(
        point.x,
        plot.axisPrecision(curve.xAxis())
      );
      var yVal = Utility.toPrecision(
        point.y,
        plot.axisPrecision(curve.yAxis())
      );

      self.mPos.setLabel("(" + xVal.toString() + ", " + yVal.toString() + ")");
      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    };

    this.hideMarker = function () {
      self.mPos.setVisible(false);
    };

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if(!on){
          MyObject.undoStack = MyObject.undoStack.filter(function(e){
            return e.curve != plotItem;
          });
          MyObject.redoStack = MyObject.undoStack.filter(function(e){
            return e.curve != plotItem;
          });
        }
      }
    });
  }

  eventFilter(watched, event) {
    if (event.type === "keydown") {
      if (event.ctrlKey) {
        //if (this.dragIndex < 0) return;
        if (event.keyCode === 90) {
          event.preventDefault();
          //console.log("undo");
          //const curve = this.curveSegmentWidgetOverlay.curve;
          const dragData = MyObject.undoStack.pop();
          if (!dragData) return;
          //store the redo data
          const curve = dragData.curve;
          // const samples = curve
          //   .data()
          //   .samples()
          //   .map((a) => Object.assign({}, a)); //store a copy of the samples

            const samples = curve
            .data()
            .samples().map(function(e){
              return new Misc.Point(e);
            });

            

          MyObject.redoStack.push({ curve, samples });

          dragData.curve.setSamples(dragData.samples);
          dragData.curve.plot().autoRefresh();
          Static.trigger("undoRedoOperation", curve);
          return;
        }
        if (event.keyCode === 89) {
          event.preventDefault();
          //console.log("redo");
          //const curve = this.curveSegmentWidgetOverlay.curve;
          const dragData = MyObject.redoStack.pop();
          if (!dragData) return;
          //const curve =
          //store the undo data
          const curve = dragData.curve;
          // const samples = curve
          //   .data()
          //   .samples()
          //   .map((a) => Object.assign({}, a)); //store a copy of the samples

            const samples = curve
            .data()
            .samples().map(function(e){
              return new Misc.Point(e);
            });
          MyObject.undoStack.push({ curve, samples });

          dragData.curve.setSamples(dragData.samples);
          dragData.curve.plot().autoRefresh();
          Static.trigger("undoRedoOperation", curve);
          return;
        }
      }
    }

    if (Static.isMobile()) {
      if (event.type == "touchstart") {
        //console.log(watched)
        let curves = this._plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
        if (!curves.length) return;

        var pt = watched.mapToElement({
          x: event.originalEvent.touches[0].clientX,
          y: event.originalEvent.touches[0].clientY,
        });

        let dist = {
          distance: -1,
        };
        let curvePointIndex = -1;
        let curvePointIndexAtDmin = -1;

        let dmin = 1.0e10;
        let indexInCurvesListAtDmin = -1;

        for (var i = 0; i < curves.length; ++i) {
          if (
            !curves[i].isVisible() ||
            curves[i].data().toString() == "[SyntheticPointData]"
          )
            continue;
          curvePointIndex = curves[i].closestPoint(pt, dist);
          if (dist.distance < dmin) {
            dmin = dist.distance;
            indexInCurvesListAtDmin = i;
            curvePointIndexAtDmin = curvePointIndex;
          }
        }
        if (curvePointIndexAtDmin == -1) return;

        this.p = curves[indexInCurvesListAtDmin].data().samples()[
          curvePointIndexAtDmin
        ];

        if (dmin < this._dmin) {
          if (this._cb == null)
            alert(
              "Curve: " +
                curves[indexInCurvesListAtDmin].title() +
                "; point: (" +
                this.p.x +
                ", " +
                this.p.y +
                ")"
            );
          else {
            this._cb(curves[indexInCurvesListAtDmin], this.p);
          }
        }
      }
      return;
    } else if (event.type == "click" /* || event.type == 'touchstart' */) {
      /* if ( !isMobile){
        if( event.button != m_mouseButton || Utility.modifiers(event) !== buttonModifiers)
        return true;
        } */
      this.mouseClick(event);
    } else if (event.type == "mousedown" /* || event.type == 'touchstart' */) {
      if (this.selected) {
        this.drawSegment = true;
        const plot = this.curveSegmentWidgetOverlay.curve.plot();
        this.zmEnabled = plot.zm.isEnabled();
        if (this.zmEnabled) {
          plot.zm.setEnabled(false);
        }
        this.panEnabled = plot.pan.isEnabled();
        if (this.panEnabled) {
          plot.pan.setEnabled(false);
        }
      }
    } else if (event.type == "mouseup" /* || event.type == 'touchstart' */) {
      this.mouseUp(event);
    } else if (event.type == "mouseleave" /* || event.type == 'touchstart' */) {
      this.moved = 0;
      this.previousCurrentCurve = null;
      this.mouseUp(event);

      if (this.selected) {
        this.selectorWidgetOverlay.clearCanvas();
        this.selected = false;
      }
    } else if (event.type == "mousemove" /*  || event.type == 'touchmove' */) {
      event.preventDefault();
      //console.log(watched)
      let curves = this._plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      if (!curves.length) return;
      var pt = watched.mapToElement({
        x: event.clientX,
        y: event.clientY,
      });
      this.clientPt = pt;

      /* if (event.originalEvent.changedTouches)//event.type == "touchmove")
            pt = watched.mapToElement({
            x: event.originalEvent.changedTouches[0].clientX,
            y: event.originalEvent.changedTouches[0].clientY
            }); */

      let dist = {
        distance: -1,
      };
      let curvePointIndex = -1;
      let curvePointIndexAtDmin = -1;

      let dmin = 1.0e10;
      let indexInCurvesListAtDmin = -1;

      for (var i = 0; i < curves.length; ++i) {
        if (
          !curves[i].isVisible() ||
          curves[i].data().toString() == "[SyntheticPointData]"
        )
          continue;
        curvePointIndex = curves[i].closestPoint(pt, dist);
        if (dist.distance < dmin) {
          dmin = dist.distance;
          indexInCurvesListAtDmin = i;
          curvePointIndexAtDmin = curvePointIndex;
          if (!this.drawSegment) {
            this.indexOfSelectedPoint = curvePointIndexAtDmin;

            // this.mPos.setAxes(
            //   curves[indexInCurvesListAtDmin].xAxis(),
            //   curves[indexInCurvesListAtDmin].yAxis()
            // );
          }
        }
      }
      if (curvePointIndexAtDmin == -1) return;
      if (
        curves[indexInCurvesListAtDmin].data().toString() ==
        "[SyntheticPointData]"
      )
        return;
      this.p = curves[indexInCurvesListAtDmin].data().samples()[
        curvePointIndexAtDmin
      ];

      ////////////////
      if (this.drawSegment) {
        const plot = this.curveSegmentWidgetOverlay.curve.plot();

        if (!this.previousCurrentCurve) {
          this.previousCurrentCurve = plot.rv.currentCurve();
          plot.rv.setCurrentCurve(this.selectorWidgetOverlay.curve);
          Static.trigger(
            "currentCurveChanged",
            this.selectorWidgetOverlay.curve
          );
          //console.log(plot.rv.currentCurve().title());
        }

        this.curveSegmentWidgetOverlay.draw();
        // }
      }
      //////////////////
      if (!this.selected) {
        this.selectorWidgetOverlay.clearCanvas();
      }
      if (!this.previousCurrentCurve && dmin < this._dmin) {
        this.curveSegmentWidgetOverlay.curve =
          this.selectorWidgetOverlay.curve = curves[indexInCurvesListAtDmin];
        if (!this.selected) {
          this.selectorWidgetOverlay.draw();
          this.selected = true;
          this.showMarker(this.p);
          //if (!this.drawSegment) this.indexOfSelectedPoint = curvePointIndex;
          Static.trigger("pointSelected");
        }
      } else {
        this.selected = false;
        this.hideMarker();
        Static.trigger("pointNotSelected");
      }
    }
    return true;
  }
}

MyObject.undoStack = [];
MyObject.redoStack = [];

class CurveClosestPoint {
  constructor(plot, cb) {
    const self = this;
    this.eventHandlingObject = new MyObject(plot, cb);
    if (cb !== undefined) this.eventHandlingObject.cb = cb;
    this.cw = plot.getCentralWidget();
    this.cw.setEnabled_1(true);
    //this.cw.installEventFilter(this.eventHandlingObject);
    //this.eventHandlingObject.wo = new MyOverlay(plot.getCentralWidget(), this.eventHandlingObject);
    this.eventHandlingObject.mPos = new PlotMarker("ClosestPointMarker123@###");
    var labelFont = this.eventHandlingObject.mPos.labelFont();
    labelFont.th = 14;
    labelFont.fontColor = "red";
    //labelFont.weight = "bold";
    //console.log(labelFont)
    this.eventHandlingObject.mPos.setLabelFont(labelFont);
    //this.mPos.setItemAttribute( PlotItem.ItemAttribute.Legend, true );
    //mPos.setSymbol(new ArrowSymbol() );
    //this.eventHandlingObject.mPos.setValue(new Misc.Point( 500, 500 ) );
    //this.eventHandlingObject.mPos.setZ(50000);
    //this.eventHandlingObject.mPos.setLabel("AAAAAb");
    //this.eventHandlingObject.mPos.setLabelAlignment( Static.AlignRight | Static.AlignBottom );

    this.eventHandlingObject.mPos.attach(plot);
    this.eventHandlingObject.mPos.setVisible(false);

    //DOCS Undo Redo operation not allowed for a curve in an open table.
    Static.bind("pointsTableUpdated", function (e, curve) {});
  }

  setDistance(dist) {
    this.eventHandlingObject._dmin = dist;
  }

  setEnabled(on) {
    //this.cw.setEnabled_1(on);
    if (on) {
      this.cw.installEventFilter(this.eventHandlingObject);
    } else {
      this.cw.removeEventFilter(this.eventHandlingObject);
      this.eventHandlingObject.selectorWidgetOverlay.clearCanvas();
    }
  }

  setCb(cb) {
    this.eventHandlingObject._cb = cb;
  }

  setMousePattern(button, modifiers) {
    this.eventHandlingObject.button = button;
    this.eventHandlingObject.modifiers = modifiers;
  }
}
