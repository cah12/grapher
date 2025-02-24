"include ['static','widgetOverlay', 'plotMarker']";

class MyCurveSelectorOverlay extends WidgetOverlay {
  //function MyCurveSelectorOverlay(widget){
  constructor(widget, eventObject) {
    super(widget);
    //WidgetOverlay.call(this, widget);////////////////
    var self = this;

    this.eventObject = eventObject;
    this.curve = null;

    this.setZ(2000.0);

    this.toString = function () {
      return "[MyCurveSelectorOverlay]";
    };
  }
  drawOverlay(painter) {
    let brushColor = "noBrush";
    if (this.eventObject.selected) brushColor = "darkGrey";
    painter.setBrush(new Misc.Brush(brushColor));
    painter.drawCircle(this.eventObject.pp.x, this.eventObject.pp.y, 8);
  }
}

class MyCurveSelectorObject extends HObject {
  constructor(plot, curveSelector) {
    super();
    var self = this;
    this._plot = plot;
    this.curveSelector = curveSelector;
    this._dmin = 10;
    //this._cb == null;
    this.selected = false;
    this.button = Static.LeftButton;
    this.abortButton = Static.LeftButton;
    this.abortLastButton = Static.LeftButton;
    this.modifiers = Static.NoModifier;
    this.abortModifiers = Static.ShiftModifier;
    this.abortLastModifiers = Static.ControlModifier;

    this.selectedCurves = [];

    //if (cb !== undefined) this._cb = cb;

    this.selectorWidgetOverlay = new MyCurveSelectorOverlay(
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
      return "[MyCurveSelectorObject]";
    };

    this.curves = [];

    function timesSelected(curve) {
      let times = 0;
      for (let i = 0; i < self.selectedCurves.length; i++) {
        if (self.selectedCurves[i] == curve) times++;
      }
      return times;
    }

    this.highLightSelectedCurve = function () {
      const times = timesSelected(this.selectorWidgetOverlay.curve) + 1;
      if (times <= 1) {
        const curve = new Curve(
          `%%${this.selectorWidgetOverlay.curve.title()}%%`
        );
        curve.setItemAttribute(PlotItem.ItemAttribute.Legend, false);
        curve.setSamples(this.selectorWidgetOverlay.curve.data().samples());
        // const times = timesSelected(this.selectorWidgetOverlay.curve) + 1;
        // if (times <= 1) {
        const highLightPen = new Misc.Pen(
          this.selectorWidgetOverlay.curve.pen().color,
          times * 3 * this.selectorWidgetOverlay.curve.pen().width,
          this.selectorWidgetOverlay.curve.pen().style
        );

        this.curves.push(curve);
        curve.setPen(highLightPen);

        curve.setAxes(
          this.selectorWidgetOverlay.curve.xAxis(),
          this.selectorWidgetOverlay.curve.yAxis()
        );
        curve.attach(plot);
        return true;
      }
      self.abortSelection();
      return false;
    };

    function abortLastSelection() {
      if (self.curves.length == 1) {
        self.abortSelections();
      } else {
        self.curves[self.curves.length - 1].detach();
        self.curves.pop();
        self.selectedCurves.pop();
        self.selectorWidgetOverlay.curve = 0;
      }
    }

    this.mouseDown = function (event) {
      if (
        event.button == this.abortButton &&
        Utility.modifiers(event) == this.abortModifiers
      ) {
        this.abortSelections();
        return;
      }
      if (
        event.button == this.abortLastButton &&
        Utility.modifiers(event) == this.abortLastModifiers
      ) {
        abortLastSelection();
        return;
      }
      if (
        event.button == this.button &&
        Utility.modifiers(event) == this.modifiers
      ) {
        if (this.selected) {
          //this.highLightSelectedCurve();
          if (this.highLightSelectedCurve())
            this.selectedCurves.push(this.selectorWidgetOverlay.curve);
        } else {
          Static.trigger("selectedCurves", [self.selectedCurves]);
          this.abortSelections();
        }
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
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      var curve = this.selectorWidgetOverlay.curve;
      self.mPos.setAxes(curve.xAxis(), curve.yAxis());

      setAlignment(point);
      self.mPos.setVisible(true);
      self.mPos.setValue(point);

      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    };

    this.hideMarker = function () {
      self.mPos.setVisible(false);
    };
  }

  abortSelection() {
    let curves = this.curves;
    const selectedCurve = this.selectorWidgetOverlay.curve;
    console.log(selectedCurve.title());
    console.log(curves[0].title());
    for (let i = 0; i < curves.length; i++) {
      const tt = curves[i].title().replaceAll("%", "");
      if (tt === selectedCurve.title()) {
        curves[i].detach();
      }
    }
    this.curves = curves.filter(function (curve) {
      const tt = curve.title().replaceAll("%", "");
      if (tt != selectedCurve.title()) {
        return true;
      }
      return false;
    });

    this.selectedCurves = this.selectedCurves.filter(function (curve) {
      const tt = curve.title().replaceAll("%", "");
      if (tt != selectedCurve.title()) {
        return true;
      }
      return false;
    });
    this.selectorWidgetOverlay.curve = 0;
    if (this.curves.length == 0) {
      this.curveSelector.setEnabled(false);
      $(window).trigger("mousedown");
    }
  }

  abortSelections() {
    for (let i = 0; i < this.curves.length; i++) {
      this.curves[i].detach();
    }
    this.curves = [];
    this.selectedCurves = [];
    this.selectorWidgetOverlay.curve = 0;
    this.curveSelector.setEnabled(false);
  }

  eventFilter(watched, event) {
    if (Static.isMobile()) {
      if (event.type == "touchstart") {
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
    } else if (event.type == "mousedown" /* || event.type == 'touchstart' */) {
      this.mouseDown(event);
    } else if (event.type == "dblclick" /* || event.type == 'touchstart' */) {
      //this.abortSelections();
    } else if (event.type == "mouseleave" /* || event.type == 'touchstart' */) {
      if (this.selected) {
        this.selectorWidgetOverlay.clearCanvas();
        this.selected = false;
      }
    } else if (event.type == "mousemove" /*  || event.type == 'touchmove' */) {
      event.preventDefault();
      let curves = this._plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      if (!curves.length) return;
      var pt = watched.mapToElement({
        x: event.clientX,
        y: event.clientY,
      });

      this.pp = pt;
      this.selectorWidgetOverlay.draw();

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
      if (
        curves[indexInCurvesListAtDmin].data().toString() ==
        "[SyntheticPointData]"
      )
        return;
      this.p = curves[indexInCurvesListAtDmin].data().samples()[
        curvePointIndexAtDmin
      ];

      if (dmin < this._dmin) {
        this.selectorWidgetOverlay.curve = curves[indexInCurvesListAtDmin];
        if (!this.selected) {
          this.selected = true;
          Static.trigger("pointSelected");
        }
      } else {
        this.selected = false;
        Static.trigger("pointNotSelected");
      }
    }
    return true;
  }
}

/**
 * The default behaviour is as follows:
 *
 * - Click on a point in the curve to select it.
 * - Ctrl and click anywhere in the plot area to deselect curves in reverse order. Deselecting the last curve exits the selection mode.
 * - Shift and click anywhere in the plot area to deselect all curves and exit selection mode.
 * - Click anywhere in the plot area except on a curve to end selection and trigger the "selectedCurves" event.
 * 
 * You can change the default behaviour with {@link setMousePattern setMousePattern()}, {@link setAbortMousePattern setAbortMousePattern()} and {@link setAbortLastMousePattern setAbortLastMousePattern()}
 * 
 * Applications bind to the "selectedCurves" event as shown below:
 * ~~~~
 *  Static.bind("selectedCurves", function (e, curves) { 
      //curves: array of selected curves;     
    });
    ~~~~
 * 
 */
class CurveSelector {
  constructor(plot) {
    const self = this;
    this._plot = plot;
    this.defaultCursor = this._plot.cursor();
    this.eventHandlingObject = new MyCurveSelectorObject(plot, this);
    this.cw = plot.getCentralWidget();
    this.cw.setEnabled_1(true);

    // Static.bind("selectionAborted", function () {
    //   self.setEnabled(false);
    // });
  }

  setDistance(dist) {
    this.eventHandlingObject._dmin = dist;
  }

  abortSelections() {
    this.eventHandlingObject.abortSelections();
  }

  abortSelection() {
    this.eventHandlingObject.abortSelection();
  }

  setEnabled(on) {
    if (on) {
      if (this._plot.cursor() == "none") return;
      this.cw.installEventFilter(this.eventHandlingObject);
      this._plot.setCursor("none");
    } else {
      this.cw.removeEventFilter(this.eventHandlingObject);
      this.eventHandlingObject.selectorWidgetOverlay.clearCanvas();
      this._plot.setCursor(this.defaultCursor);
    }
  }

  isEnabled() {
    return this._plot.cursor() == "none" ? true : false;
  }

  /**
   * Set the mouse button and keyboard modifiers for selection
   * @param {Number} button Button id (e.g Static.LeftButton, Static.RightButton or Static.MidButton)
   * @param {Number} modifiers Keyboard modifiers (e.g Static.ShiftModifier, Static.AltModifier or Static.ControlModifier)
   *
   * @example
   *  const curveSelector = new CurveSelector(plot);
   *  curveSelector.setMousePattern(Static.LeftButton, Static.AltModifier);
   *
   * This changes the default click to alt-click
   */
  setMousePattern(button, modifiers) {
    this.eventHandlingObject.button = button;
    this.eventHandlingObject.modifiers = modifiers;
  }

  /**
   * Set the mouse button and keyboard modifiers for aborting all selections
   * @param {Number} button Button id (e.g Static.LeftButton, Static.RightButton or Static.MidButton)
   * @param {Number} modifiers Keyboard modifiers (e.g Static.ShiftModifier, Static.AltModifier or Static.ControlModifier)
   *
   * @example
   *  const curveSelector = new CurveSelector(plot);
   *  curveSelector.setAbortMousePattern(Static.LeftButton, Static.AltModifier);
   *
   * This changes the default shift-click to alt-click
   */
  setAbortMousePattern(button, modifiers) {
    this.eventHandlingObject.abortButton = button;
    this.eventHandlingObject.abortModifiers = modifiers;
  }

  /**
   * Set the mouse button and keyboard modifiers for aborting the last selection
   * @param {Number} button Button id (e.g Static.LeftButton, Static.RightButton or Static.MidButton)
   * @param {Number} modifiers Keyboard modifiers (e.g Static.ShiftModifier, Static.AltModifier or Static.ControlModifier)
   *
   * @example
   *  const curveSelector = new CurveSelector(plot);
   *  curveSelector.setAbortLastMousePattern(Static.LeftButton, Static.AltModifier);
   *
   * This changes the default ctrl-click to alt-click
   */
  setAbortLastMousePattern(button, modifiers) {
    this.eventHandlingObject.abortLastButton = button;
    this.eventHandlingObject.abortLastModifiers = modifiers;
  }
}
