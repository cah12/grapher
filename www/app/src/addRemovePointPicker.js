"include ['plot', 'curveClosestPoint', 'plotpicker', 'plotcurve', 'symbol']";

class AddRemovePointPicker extends PlotPicker {
  constructor(plot) {
    super(
      Axis.AxisId.xBottom,
      Axis.AxisId.yLeft,
      Picker.RubberBand.NoRubberBand,
      Picker.DisplayMode.AlwaysOn,
      plot
    );
    var self = this;
    var curve = null;
    var m_activated = false;
    this.setStateMachine(new PickerDblClickPointMachine());
    //this.setTrackerPen(new Misc.Pen("blue"));

    var cp = new CurveClosestPoint(plot, function (curve, p) {
      if (!m_activated) return;
      curve.removePoint(p);
      Static.trigger("curveAdjusted");
    });

    this.setEnabled(false);

    this.activate = function (on) {
      m_activated = on;
      this.setEnabled(on);
      cp.setEnabled(on);
    };

    this.setAddRemoveMousePattern = function (
      pattern,
      button,
      modifiers = Static.NoModifier
    ) {
      this.setMousePattern(pattern, button, modifiers);
      cp.setMousePattern(button, modifiers);
    };

    Static.bind("currentCurveChanged", function (e, _curve) {
      if (curve === _curve) return;
      curve = _curve || null;
      if (curve) {
        self.setAxis(curve.xAxis(), curve.yAxis());
      }
    });

    Static.bind("axisChanged", function (e, axis, _curve) {
      if (curve === _curve) self.setAxis(curve.xAxis(), curve.yAxis());
    });

    Static.bind("pointSelected", function () {
      if (m_activated) self.setEnabled(false);
    });

    Static.bind("pointNotSelected", function () {
      if (m_activated) self.setEnabled(true);
    });

    function enterPoint(p) {
      if (!m_activated) return;
      if (!curve) {
        //"Create curve"
        curve = new MyCurve(Utility.generateCurveName(plot));
        // console.log(plot.axisAutoScale(0));
        // curve.setItemAttribute(
        //   PlotItem.ItemAttribute.AutoScale,
        //   plot.axisAutoScale(0)
        // );
        //console.log(plot);
        let color = Utility.randomColor();
        curve.setPen(new Misc.Pen(color));
        let sym = new Symbol2(
          Symbol2.Style.MRect,
          new Misc.Brush(Utility.invert(color)),
          new Misc.Pen(color),
          new Misc.Size(8, 8)
        );
        curve.setSymbol(sym);
        let attribute = "";
        if (Static.showline && Static.showsymbol) {
          attribute = "lineAndSymbol";
        } else if (Static.showline) {
          attribute = "line";
        } else if (Static.showsymbol) {
          attribute = "symbol";
        }
        Utility.setLegendAttribute(curve, attribute, curve.getLegendIconSize()); //attribute = "line" or "symbol" or "lineAndSymbol"
        curve.attach(plot);
      }
      let samples = curve.data().samples();
      if (!samples.containsPoint(p)) {
        samples.push(p);
      }
      samples.sort(function (a, b) {
        /* if(a.x < b.x) return -1;
                if(a.x > b.x) return 1;
                return 0; */
        return a.x - b.x;
      });
      curve.setSamples(samples);
      //plot.autoRefresh();
      Static.trigger("pointAdded", curve);
      //plot.cs.setLimits(); //set curveShapeItem limits to undefined
      Static.trigger("curveAdjusted");
      /* We have at least one point. Ensure remove button is enabled. */
      //$('#pointEntryDlg_remove').attr('disabled', false);
    }

    var prevPoint = new Misc.Point(Number.MAX_VALUE, Number.MAX_VALUE);
    Static.bind("selected", function (e, pickedPoints) {
      var selection = self.selection()[0];
      if (!selection) return;
      if (prevPoint.isEqual(selection)) return;
      prevPoint = selection;
      if (curve)
        enterPoint(
          ScaleMap.invTransform(
            plot.axisScaleDraw(curve.xAxis()).scaleMap(),
            plot.axisScaleDraw(curve.yAxis()).scaleMap(),
            selection
          )
        );
      else
        enterPoint(
          ScaleMap.invTransform(
            plot.axisScaleDraw(Axis.AxisId.xBottom).scaleMap(),
            plot.axisScaleDraw(Axis.AxisId.yLeft).scaleMap(),
            selection
          )
        );
    });

    var f = this.trackerFont();
    //f.th = 14;
    f.fontColor = "blue";
    this.setTrackerFont(f);
  }

  trackerText(pos) {
    var plot = this.plot();
    pos = this.invTransform(pos);
    var label; //= "";
    var numberOfDigitsX = 1;
    if (plot.axisEnabled(Axis.AxisId.xBottom)) {
      numberOfDigitsX = plot.axisPrecision(Axis.AxisId.xBottom);
    } else if (plot.axisEnabled(Axis.AxisId.xTop)) {
      numberOfDigitsX = plot.axisPrecision(Axis.AxisId.xTop);
    } else numberOfDigitsX = plot.axisPrecision(Axis.AxisId.xBottom);
    var numberOfDigitsY = 1;
    if (plot.axisEnabled(Axis.AxisId.yLeft))
      numberOfDigitsY = plot.axisPrecision(Axis.AxisId.yLeft);
    else if (plot.axisEnabled(Axis.AxisId.yRight))
      numberOfDigitsY = plot.axisPrecision(Axis.AxisId.yRight);
    else numberOfDigitsY = plot.axisPrecision(Axis.AxisId.yLeft);

    var yVal = Utility.toPrecision(pos.y, numberOfDigitsY);
    var xVal = Utility.toPrecision(pos.x, numberOfDigitsX);

    switch (this.rubberBand()) {
      case Picker.RubberBand.HLineRubberBand:
        label = yVal.toString();
        break;
      case Picker.RubberBand.VLineRubberBand:
        label = xVal.toString();
        break;
      default:
        label = xVal.toString() + ", " + yVal.toString();
    }
    return label;
  }
}
