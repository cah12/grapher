define([
  "symbol",
  "plot",
  "legend",
  "magnifier",
  "pointData",
  "plotzoomer",
  "plotcurve",
  "panner",
  "plotMarker",
  "canvas",
  "widgetOverlay",
], function () {
  //-----------------------------------------------------------------
  //
  //
  //      A simple example which shows how to use QwtPlot connected
  //      to a data class without any storage, calculating each values
  //      on the fly.
  //-----------------------------------------------------------------
  ///////FunctionData - subclass of SyntheticPointData/////start
  //FunctionData.inheritsFrom( SyntheticPointData );
  //Define the FunctionData constructor
  //function FunctionData(yCb) {
  class FunctionData extends SyntheticPointData {
    constructor(yCb) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
      //SyntheticPointData.call(this, 100 );
      super(100);
      var d_y = yCb;

      this.y = function (x) {
        return d_y(x);
      };
      //we should not need this
      //this.setRectOfInterest(new Misc.Rect(0,0,10, 1))
    }
  }
  ///////FunctionData - subclass of SyntheticPointData/////end

  /////////////////ArrowSymbol - subclass of Symbol//////////start
  //ArrowSymbol.inheritsFrom( Symbol );
  //Define the ArrowSymbol constructor
  //function ArrowSymbol() {
  class ArrowSymbol extends Symbol {
    constructor() {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
      //Symbol.call(this);
      super();
      var self = this;
      self.setPen(new Misc.Pen("black", 0));
      self.setBrush(new Misc.Brush("red"));

      //Static.trigger("test", [45, "aaa"]);

      var path = new Misc.MPath();
      //console.log(path)
      /*path.moveTo( 0, 8 );
    path.lineTo( 0, 5 );
    path.lineTo( -3, 5 );
    path.lineTo( 0, 0 );
    path.lineTo( 3, 5 );
    path.lineTo( 0, 5 );*/

      /*path.moveTo( 3, 12 )
    path.lineTo( 3, 9 );
    path.lineTo( 0, 9 );
    path.lineTo( 3, 4 );
    path.lineTo( 6, 9 );
    path.lineTo( 3, 9 );*/

      path.moveTo(13, 18);
      path.lineTo(13, 15);
      path.lineTo(10, 15);
      path.lineTo(13, 10);
      path.lineTo(16, 15);
      path.lineTo(13, 15);
      path.data.rotation = -30.0;
      self.setPath(path);
      self.setPinPoint(new Misc.Point(13, 10));

      self.setSize(new Misc.Size(10, 14));

      // Static.bind("test", function(num, str){
      //     console.log(num)
      //     console.log(str)
      // })
    }
  }
  /////////////////ArrowSymbol - subclass of Symbol//////////end

  /////////////////MyPlot - subclass of Plot//////////start
  //MyPlot.inheritsFrom( Plot );
  class MyPlot extends Plot {
    constructor(parDiv) {
      super(parDiv);
      //Define the MyPlot constructor
      //function MyPlot(parDiv) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
      //Plot.call(this, parDiv );
      var self = this;

      self.setTitle("A Simple jQwtPlot Demonstration");
      self.insertLegend(new MLegend());

      // axes
      self.setAxisTitle(xBottom, "x -->");
      self.setAxisScale(xBottom, 0.0, 10.0);

      self.setAxisTitle(yLeft, "y -->");
      self.setAxisScale(yLeft, -1.0, 1.0);

      // panning with the left mouse button
      var p = new Panner(this);
      p.setCursor("move");

      // zoom in/out with the wheel
      new Magnifier(this);

      self.populate();

      var plotCanvas = new PlotCanvas(this);
      plotCanvas.setLineWidth(1);
      plotCanvas.setLineColor(Static.RGB2HTML(165, 193, 228));
      plotCanvas.setFrameStyle("solid");
      plotCanvas.setBorderRadius(15);
      plotCanvas.setBackgroundColor(255, 255, 255);

      var c = Static.RGB2HTML(165, 193, 228);
      var containerCanvas = new PlotContainerCanvas(this);
      containerCanvas.setBackground(
        "linear-gradient(to bottom, white," + c + "," + c + ")"
      );
    }
  }

  MyPlot.prototype.populate = function () {
    // Insert new curves
    var cSin = new Curve("y = sin(x)");
    //cSin->setRenderHint( QwtPlotItem::RenderAntialiased );
    cSin.setLegendAttribute(Static.LegendShowLine, true);
    cSin.setPen(new Misc.Pen("red"));
    cSin.attach(this);

    var cCos = new Curve("y = cos(x)");
    //cCos->setRenderHint( QwtPlotItem::RenderAntialiased );
    cCos.setLegendAttribute(Static.LegendShowLine, true);
    cCos.setPen(new Misc.Pen("blue"));
    cCos.attach(this);

    // Create sin and cos data
    cSin.setData(new FunctionData(Math.sin));
    cCos.setData(new FunctionData(Math.cos));

    // Insert markers

    //  ...a horizontal line at y = 0...
    var mY = new PlotMarker();
    mY.setLabel("y = 0");
    mY.setLabelAlignment(Static.AlignRight | Static.AlignTop);
    mY.setLineStyle(HLine);
    mY.setYValue(0.0);
    mY.attach(this);

    //  ...a vertical line at x = 2 * pi
    var mX = new PlotMarker();
    mX.setLabelOrientation(Vertical);
    mX.setLabel("x = 2 pi");
    mX.setLabelAlignment(Static.AlignLeft | Static.AlignBottom);
    //mX.setLabelOrientation( Vertical );
    mX.setLineStyle(VLine);
    mX.setLinePen(new Misc.Pen("black", 0, "dashDot"));
    mX.setXValue(2.0 * Math.PI);
    mX.attach(this);

    var x = 7.7;
    //var x = 2.5 * Math.PI;

    // an arrow at a specific position
    var mPos = new PlotMarker("Marker");
    mPos.setItemAttribute(Legend, true);
    mPos.setSymbol(new ArrowSymbol());
    mPos.setValue(new Misc.Point(x, Math.sin(x)));
    mPos.setLabel("x = " + x);
    mPos.setLabelAlignment(Static.AlignRight | Static.AlignBottom);

    mPos.attach(this);
  };
  /////////////////MyPlot - subclass of Plot//////////end

  var plot = new MyPlot($("#plotDiv"));
  plot.replot();

  var aw = plot.axisWidget(xBottom);
  //console.log(aw)

  aw.setEnabled_1(true);

  class MyObject extends HObject {
    constructor() {
      super();
      var self = this;
      this.toString = function () {
        return "[MyObject]";
      };
    }
    eventFilter(watched, event) {
      if (event.type == "mousedown") {
        //console.log(watched)
        var pt = watched.mapToElement({ x: event.clientX, y: event.clientY });
        var xMap = plot.canvasMap(xBottom);
        var v = xMap.invTransform(pt.x);
        //console.log(v)
        alert(
          "X-Scale clicked at:\n" + plot.axisTitle(Static.Bottom) + " " + v
        );
      }
      return true;
    }
  }

  var mo = new MyObject();
  //console.log(mo)

  //aw.mousePressEvent()
  aw.installEventFilter(mo);
  //aw.removeEventFilter(mo)

  //MyOverlay.inheritsFrom( WidgetOverlay );
  class MyOverlay extends WidgetOverlay {
    //function MyOverlay(widget){
    constructor(widget) {
      super(widget);
      //WidgetOverlay.call(this, widget);////////////////
      var self = this;

      /*this.mousePressEvent = function(event){//subclass can reimplement
        console.log("ow pressed")
        return false
    }*/

      /* this.drawOverlay = function(painter ) 
    {   
        //console.log(painter.canvasWidth())
        painter.drawLine(0,0,painter.canvasWidth(),painter.canvasHeight())
    } */

      // Static.bind("replot", function(){
      //     self.draw()
      // })

      //this.draw();

      this.toString = function () {
        return "[MyOverlay]";
      };
    }
    drawOverlay(painter) {
      //console.log(painter.canvasWidth())
      painter.drawLine(0, 0, painter.canvasWidth(), painter.canvasHeight());
    }
  }

  wo = new MyOverlay(plot.getCentralWidget());
  wo.draw();
});
