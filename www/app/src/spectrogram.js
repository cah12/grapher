"use strict";

"include ['static', 'plotSpectrogram', 'colorMap', 'rasterFileData', 'rasterFunctionData']";

class LinearColorMapRGB extends LinearColorMap {
  constructor() {
    super(ColorMap.Format.RGB);
    this.setColorInterval("darkCyan", "red");
    this.addColorStop(0.1, "cyan");
    this.addColorStop(0.6, "green");
    this.addColorStop(0.95, "yellow");
  }
}

class LinearColorMapIndexed extends LinearColorMap {
  constructor() {
    super(ColorMap.Format.Indexed);
    this.setColorInterval("darkCyan", "red");
    this.addColorStop(0.1, "cyan");
    this.addColorStop(0.6, "green");
    this.addColorStop(0.95, "yellow");
  }
}

class Spectrogram extends PlotSpectrogram {
  constructor(title) {
    super(title);
    var self = this;
    // let Enum = {};
    // Enum.ColorMap = {
    //   RGBMap: 0,
    //   IndexMap: 1,
    //   HueMap: 2,
    //   AlphaMap: 3,
    // };

    var d_alpha = 255;
    var d_mapType;

    self.setColorMap(new LinearColorMapRGB());
    //self->setRenderThreadCount( 0 ); // use system specific thread count
    self.setAlpha(d_alpha);
    self.setCachePolicy(PlotRasterItem.CachePolicy.PaintCache);
    /* QList<double> */ var contourLevels = [];
    for (var level = 0.5; level < 10.0; level += 1.0) contourLevels.push(level);
    self.setContourLevels(contourLevels);

    this.setItemAttribute(PlotItem.ItemAttribute.Legend, true);
    //this.setLegendAttribute(Static.LegendCheckable, false)

    //self.setData( new SpectrogramData() );
    //var zInterval = self.data().interval( Static.ZAxis );

    /* // A color bar on the right axis
			var rightAxis = this.axisWidget( Axis.AxisId.yRight );
			rightAxis.setTitle( "Intensity" ); */
    //rightAxis.setColorBarEnabled( true );

    /* this.setAxisScale( Axis.AxisId.yRight, zInterval.minValue(), zInterval.maxValue() );
			this.enableAxis( Axis.AxisId.yRight, true );
			
			

			//plotLayout()->setAlignCanvasToScales( true );

			//setColorMap( Plot::RGBMap );
			
			// LeftButton for the zooming
			// MidButton for the panning
			// RightButton: zoom out by 1
			// Ctrl+RighButton: zoom out to full size
			
			/* var zoomer = new MyZoomer( this );
			zoomer.setMousePattern( EventPattern.MousePatternCode.MouseSelect2,
				Static.RightButton, Static.ControlModifier );
			zoomer.setMousePattern( EventPattern.MousePatternCode.MouseSelect3,
				Static.RightButton ); */

    /* var panner = new Panner( this );
			panner.enableAxis( Axis.AxisId.yRight, false );
			panner.setMouseButton( Static.MidButton ); */

    // Avoid jumping when labels with more/less digits
    // appear/disappear when scrolling vertically

    /* const QFontMetrics fm( axisWidget( QwtPlot::yLeft )->font() );
			QwtScaleDraw *sd = axisScaleDraw( QwtPlot::yLeft );
			sd->setMinimumExtent( fm.width( "100.00" ) ); */

    /* zoomer.setRubberBandPen( new Misc.Pen("darkBlue") );
			zoomer.setTrackerPen( new Misc.Pen("darkBlue") ); */

    //this.setPixelSize(new Misc.Size(2, 2));

    // Static.unbind("magnifyingEnd");
    // Static.unbind("magnifyingStart");

    const mgEnd = function () {
      self.setPixelSize(new Misc.Size(1, 1));
      self.itemChanged();
    };

    Static.bind("magnifyingEnd", mgEnd);

    const mgStart = function () {
      self.setPixelSize(new Misc.Size(4, 4));
    };

    Static.bind("magnifyingStart", mgStart);

    this.showContour = function (on) {
      this.setDisplayMode(PlotSpectrogram.DisplayMode.ContourMode, on);
      self.itemChanged();
    };

    this.showSpectrogram = function (on) {
      this.setDisplayMode(PlotSpectrogram.DisplayMode.ImageMode, on);
      this.setDefaultContourPen(
        on ? new Misc.Pen("black", 0) : new Misc.Pen(Static.NoPen)
      );
    };

    this.setSpectrogramColorMap = function (type) {
      var plot = this.plot();
      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      var axis = plot.axisWidget(Axis.AxisId.yRight);
      var zInterval = this.data().interval(Static.ZAxis);

      d_mapType = type;

      var alpha = d_alpha;
      switch (type) {
        case Spectrogram.ColorMap.HueMap: {
          /* d_spectrogram->setColorMap( new HueColorMap() );
						axis->setColorMap( zInterval, new HueColorMap() );
						break; */
        }
        case Spectrogram.ColorMap.AlphaMap: {
          /* alpha = 255;
						d_spectrogram->setColorMap( new AlphaColorMap() );
						axis->setColorMap( zInterval, new AlphaColorMap() );
						break; */
        }
        case Spectrogram.ColorMap.IndexMap: {
          const oldColorMap = this.colorMap();
          const colorMap = new LinearColorMapIndexed();
          colorMap.setColorInterval(oldColorMap.color1(), oldColorMap.color2());
          colorMap.addColorStop(0.1, "cyan");
          colorMap.addColorStop(0.6, "green");
          colorMap.addColorStop(0.95, "yellow");
          this.setColorMap(colorMap);
          //axis.setColorMap( zInterval, new LinearColorMapIndexed() );
          break;
        }
        case Spectrogram.ColorMap.RGBMap:
        default: {
          const oldColorMap = this.colorMap();
          const colorMap = new LinearColorMapRGB();
          colorMap.setColorInterval(oldColorMap.color1(), oldColorMap.color2());
          colorMap.addColorStop(0.1, "cyan");
          colorMap.addColorStop(0.6, "green");
          colorMap.addColorStop(0.95, "yellow");
          this.setColorMap(colorMap);
        }
      }
      this.setSpectrogramAlpha(alpha);
      plot.setAutoReplot(autoReplot);

      self.itemChanged();
    };

    this.setSpectrogramAlpha = function (alpha) {
      //var plot = this.plot();
      // setting an alpha value doesn't make sense in combination
      // with a color map interpolating the alpha value

      d_alpha = alpha;
      if (d_mapType != Spectrogram.ColorMap.AlphaMap) {
        this.setAlpha(alpha);
        self.itemChanged();
      }
    };

    this.cleanUp = function () {
      Static.unbind("magnifyingEnd", mgEnd);
      Static.unbind("magnifyingStart", mgStart);
    };
  }

  delete() {
    this.cleanUp();
    super.delete(); //Call the base class
  }
}
Enumerator.enum("ColorMap {RGBMap, IndexMap, HueMap, AlphaMap}", Spectrogram);

class SpectrogramFileData extends RasterFileData {
  constructor(fileData) {
    super(fileData);
    this.setInterval(Static.ZAxis, new Interval(0.0, 10.0));
    //this.setInterpolaionType(Spectrogram.InterpolationType.linear)
  }
}

class SpectrogramFunctionData extends RasterFunctionData {
  constructor(functionData) {
    super(functionData);
    //this.setInterval( Static.ZAxis, new Interval( 0.0, 10.0 ) );
  }
}
