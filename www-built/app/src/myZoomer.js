"include ['plotzoomer']";

class MyPlotZoomer extends PlotZoomer {
  constructor(plot) {
    super(plot);
    this.setEnabled(false);
    this.setTrackerMode(Picker.DisplayMode.AlwaysOff);
    this.setTrackerPen(new Misc.Pen("blue"));
    var f = this.trackerFont();
    //f.th = 14;
    f.fontColor = "blue";
    this.setTrackerFont(f);

    // this.setStateMachine(new PickerClickRectMachine());

    // this.setRubberBand(Picker.RubberBand.RectRubberBand);

    // Static.bind("zoomed", function (e, zoomRect) {
    //   console.log(zoomRect);
    // });
  }

  rescale() {
    if (Static.aspectRatioOneToOne) {
      let d_data = this.privateData();
      var rect = d_data.zoomStack[d_data.zoomRectIndex];
      if (rect.width() < rect.height()) {
        rect.setWidth(rect.height());
      }
      if (rect.width() > rect.height()) {
        rect.setHeight(rect.width());
      }
      d_data.zoomStack[d_data.zoomRectIndex] = rect;
    }
    super.rescale();
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

  // adjustedPoints(points) {
  //   let adjusted = [];
  //   if (points.length == 2) {
  //     const width = Math.abs(points[1].x - points[0].x);
  //     const height = Math.abs(points[1].y - points[0].y);
  //     const rect = new Misc.Rect(0, 0, 2 * width, 2 * height);
  //     rect.moveCenter(points[0]);
  //     adjusted.push(rect.topLeft());
  //     adjusted.push(rect.bottomRight());
  //   }
  //   return adjusted;
  // }
}
