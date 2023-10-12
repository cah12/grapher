

Static.XAxis = 0;
Static.YAxis = 1;
Static.ZAxis = 2;

/**
 * A plot item, which displays a spectrogram.
 * A spectrogram displays 3-dimensional data, where the 3rd dimension ( the intensity ) is displayed using colors. The colors are calculated from the values using a color map.
 * On multi-core systems the performance of the image composition can often be improved by dividing the area into tiles - each of them rendered in a different thread ( see QwtPlotItem::setRenderThreadCount() ).
 * In ContourMode contour lines are painted for the contour levels.
 */
class PlotSpectrogram extends PlotRasterItem {
  /**
   *
   * @param {String} tle Title of the spectrogram
   */
  constructor(tle) {
    super(tle);

    class PrivateData {
      constructor() {
        /* QwtRasterData */
        this.data = null;
        this.colorMap = new LinearColorMap();
        this.displayMode = PlotSpectrogram.DisplayMode.ImageMode;
        this.contourLevels = [];
        this.defaultContourPen = new Misc.Pen();
        this.numberOfContourPlanes = 10;
      }
    }
    var self = this;
    var gridSzX = 80;
    var gridSzY = 80;
    var d_data = new PrivateData();
    this.privateData = function () {
      return d_data;
    };

    this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);
    this.setItemAttribute(PlotItem.ItemAttribute.Legend, false);

    this.setZ(8.0);

    this.rtti = PlotItem.RttiValues.Rtti_PlotSpectrogram;

    /**
     * The display mode controls how the raster data will be represented.
     * @param {PlotSpectrogram.DisplayMode} mode Display mode
     * @param {Boolean} on On/Off
     * @see {@link PlotSpectrogram.DisplayMode DisplayMode}
     */
    this.setDisplayMode = function (mode, on) {
      if (on != (mode & d_data.displayMode)) {
        if (on) d_data.displayMode |= mode;
        else d_data.displayMode &= ~mode;

        this.legendChanged();
        this.itemChanged();
      }

      /* this.legendChanged();
            this.itemChanged(); */
    };

    /**
     * The display mode controls how the raster data will be represented.
     * @param {PlotSpectrogram.DisplayMode} mode Display mode
     * @returns {Boolean} true if mode is enabled
     */
    this.testDisplayMode = function (mode) {
      return d_data.displayMode & mode;
    };

    /**
     * Change the color map
     * Often it is useful to display the mapping between intensities and
     * colors as an additional plot axis, showing a color bar.
     * @param {ColorMap} colorMap Color Map
     */
    this.setColorMap = function (colorMap) {
      if (d_data.colorMap != colorMap) {
        d_data.colorMap = colorMap;
      }

      this.invalidateCache();

      this.legendChanged();
      this.itemChanged();
    };

    /**
     *
     * @returns {ColorMap} Color Map used for mapping the intensity values to colors
     * @see {@link PlotSpectrogram#setColorMap setColorMap()}
     */
    this.colorMap = function () {
      return d_data.colorMap;
    };

    /**
     * Set the default pen for the contour lines
     * @param {Misc.Pen|String} color Pen or color
     * @param {Number} [width] Pen width
     * @param {String} [style] Pen style
     * @see {@link PlotSpectrogram#defaultContourPen defaultContourPen()}
     * @see {@link PlotSpectrogram#contourPen contourPen()}
     */
    this.setDefaultContourPen = function (color, width, style) {
      var pen = color;
      if (typeof pen !== "object") pen = new Misc.Pen(color, width, style);
      doSetDefaultContourPen(pen);
    };

    function doSetDefaultContourPen(pen) {
      if (!pen.isEqual(d_data.defaultContourPen)) {
        d_data.defaultContourPen = pen;
        self.legendChanged();
        self.itemChanged();
      }
    }

    /**
     *
     * @returns {Misc.Pen} Default contour pen
     * @see {@link PlotSpectrogram#setDefaultContourPen setDefaultContourPen()}
     */
    this.defaultContourPen = function () {
      return d_data.defaultContourPen;
    };

    /**
     * Calculate the pen for a contour line
     * contourPen is only used if defaultContourPen().style == Static.NoPen
     * @param {Number} level Contour level
     * @returns {Misc.Pen} Pen for the contour line
     * @see {@link PlotSpectrogram#setDefaultContourPen setDefaultContourPen()}
     * @see {@link PlotSpectrogram#setColorMap setColorMap()}
     * @see {@link PlotSpectrogram#setContourLevels setContourLevels()}
     */
    this.contourPen = function (level) {
      if (d_data.data == null || d_data.colorMap == null) return new Misc.Pen();

      var intensityRange = d_data.data.interval(Static.ZAxis);
      var c = d_data.colorMap.rgb(intensityRange, level);

      return new Misc.Pen(c.toString());
    };

    /**
     * Calculate the levels of the contour lines
     *
     * {@link PlotSpectrogram#contourLevels contourLevels()} returns the same levels but sorted.
     * @param {Number} numberOfPlanes The number of contour planes
     * @param {Number} minZ lowest point
     * @param {Number} maxZ highest point
     * @returns {Array<Number>} array of levels
     */
    this.calculateContourLevels = function (numberOfPlanes, minZ, maxZ) {
      if (numberOfPlanes < 1) return [];
      var zInterval = d_data.data.interval(Static.ZAxis);
      if (minZ == undefined) {
        minZ = zInterval.minValue();
        maxZ = zInterval.maxValue();
      }

      var cI = /* Math.round */ (maxZ - minZ) / numberOfPlanes;

      var contourLevels = [];

      for (var level = minZ + 0.5 * cI; level < maxZ; level += cI)
        contourLevels.push(level);

      return contourLevels;
    };

    let numberOfContourPlanes = 10;

    /**
     *
     * @returns {Number} The number of contour planes
     */
    this.numberOfContourPlanes = function () {
      return numberOfContourPlanes;
    };

    this.setNumberOfContourPlanes = function (numberOfPlanes) {
      numberOfContourPlanes = numberOfPlanes;
      this.setContourLevels(this.calculateContourLevels(numberOfPlanes));
    };

    /**
     * Set the levels of the contour lines
     *
     * {@link PlotSpectrogram#contourLevels contourLevels()} returns the same levels but sorted.
     * @param {Array<Number>} levels Values of the contour levels
     */
    this.setContourLevels = function (/* const QList<double> & */ levels) {
      d_data.contourLevels = levels;
      _.sortBy(d_data.contourLevels);

      this.legendChanged();
      this.itemChanged();
    };

    /**
     * The levels are sorted in increasing order.
     * @returns {Array<Number>} Levels of the contour lines.
     */
    this.contourLevels = function () {
      return d_data.contourLevels;
    };

    /**
     * Set the data to be displayed
     * @param {object} data Spectrogram Data
     */
    this.setData = function (/* QwtRasterData * */ data) {
      if (data != d_data.data) {
        d_data.data = data;

        this.invalidateCache();
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {object} Spectrogram data
     */
    this.data = function () {
      return d_data.data;
    };

    /**
     * The default implementation returns the interval of the associated raster data object.
     * @param {Number} axis X, Y, or Z axis
     * @returns {Interval} Bounding interval for an axis
     */
    this.interval = function (/* Qt::Axis */ axis) {
      if (d_data.data == null) return new Interval();

      return d_data.data.interval(axis);
    };

    /**
     * Render an image from data and color map.
     * For each pixel of area the value is mapped into a color.
     * @param {ScaleMap} xMap X-Scale Map
     * @param {ScaleMap} yMap Y-Scale Map
     * @param {Misc.Rect} area Requested area for the image in scale coordinates
     * @param {Misc.Size} imageSize Size of the requested image
     * @returns {Misc.Image} An Image
     */
    this.renderImage = function (xMap, yMap, area, imageSize) {
      if (
        imageSize.isEmpty() ||
        d_data.data == null ||
        d_data.colorMap == null
      ) {
        return new Misc.Image();
      }

      var intensityRange = d_data.data.interval(Static.ZAxis);
      if (!intensityRange.isValid()) return new Misc.Image();

      var image = new Misc.Image(imageSize);

      if (d_data.colorMap.format() == ColorMap.Format.Indexed)
        image.setColorTable(d_data.colorMap.colorTable(intensityRange));

      //d_data.data.initRaster(area, image.size());

      var tile = new Misc.Rect(0, 0, imageSize.width, imageSize.height);
      this.renderTile(xMap, yMap, tile, image);

      //d_data.data.discardRaster();

      return image;
    };

    /**
     * Render a tile of an image.
     * Rendering in tiles can be used to composite an image
     * We always use the default alpha value of 255
     * @param {ScaleMap} xMap X-Scale Map
     * @param {ScaleMap} yMap Y-Scale Map
     * @param {Misc.Rect} tile Geometry of the tile in image coordinates
     * @param {Misc.Image} image Image to be rendered
     *
     */
    this.renderTile = function (xMap, yMap, tile, image) {
      //console.time();
      var range = d_data.data.interval(Static.ZAxis);
      if (!range.isValid()) return;

      var extraPixelW = this.pixelSize().width - 1;
      var extraPixelH = this.pixelSize().height - 1;

      var incrementW = extraPixelW + 1;
      var incrementH = extraPixelH + 1;

      var y,
        x,
        top = tile.top(), //+ extraPixelH,
        bottom = tile.bottom(),
        left = tile.left(), // + extraPixelW,
        right = tile.right();

      if (d_data.colorMap.format() == ColorMap.Format.RGB) {
        for (y = top; y < bottom; y += incrementH) {
          var ty = yMap.invTransform(y);

          for (x = left; x < right; x += incrementW) {
            var tx = xMap.invTransform(x);
            var rgba = d_data.colorMap.rgb(range, d_data.data.value(tx, ty));
            rgba.a = this.alpha(); //the default alpha value of 255
            for (var yy = extraPixelH; yy >= 0; --yy) {
              for (var xx = extraPixelW; xx >= 0; --xx) {
                image.setPixel(
                  x + xx - extraPixelW,
                  y + yy - extraPixelH,
                  rgba
                );
              }
            }
          }
        }
      } else if (d_data.colorMap.format() == ColorMap.Format.Indexed) {
        for (y = top; y < bottom; y += incrementH) {
          var ty = yMap.invTransform(y);

          for (x = left; x < right; x += incrementW) {
            var tx = xMap.invTransform(x);
            var rgba = image.pixel(
              d_data.colorMap.colorIndex(range, d_data.data.value(tx, ty))
            );
            rgba.a = this.alpha(); //the default alpha value of 255
            for (var yy = extraPixelH; yy >= 0; --yy) {
              for (var xx = extraPixelW; xx >= 0; --xx) {
                image.setPixel(
                  x + xx - extraPixelW,
                  y + yy - extraPixelH,
                  rgba
                );
              }
            }
          }
        }
      }
      //console.timeEnd();
    };

    /**
     * Calculate and draw contour lines
     * @param {PaintUtil.Painter} painter
     * @param {ScaleMap} xMap X-Scale Map
     * @param {ScaleMap} yMap Y-Scale Map
     *
     */
    this.renderContourLines = function (painter, xMap, yMap) {
      function drawContour(startX, startY, endX, endY, contourLevel, k) {
        var pen = self.defaultContourPen();
        if (pen.style == Static.NoPen) pen = self.contourPen(contourLevel);

        if (pen.style == Static.NoPen) return;

        painter.setPen(pen);
        painter.drawLine(
          xMap.transform(startX),
          yMap.transform(startY),
          xMap.transform(endX),
          yMap.transform(endY)
        );
      }

      if (d_data.data == null) return;
      var levels = d_data.contourLevels;
      var data = d_data.data.contourLinesData(/* levels,  */ gridSzX, gridSzY);
      var c = new Conrec(drawContour);
      c.contour(
        data.d,
        0,
        data.x.length - 1,
        0,
        data.y.length - 1,
        data.x,
        data.y,
        levels.length,
        levels
      );
    };
  }

  /**
   * Draw the spectrogram
   * @param {ScaleMap} xMap Maps x-values into pixel coordinates.
   * @param {ScaleMap} yMap Maps y-values into pixel coordinates.
   * @see {@link PlotSpectrogram#setDisplayMode setDisplayMode()}
   * @see {@link PlotSpectrogram#renderImage renderImage()}
   * @see {@link PlotSpectrogram#renderContourLines renderContourLines()}
   * @see {@link PlotRasterItem#draw PlotRasterItem.draw()}
   */
  draw(xMap, yMap) {
    var d_data = this.privateData();
    var canvasRect = this.getCanvasRect();
    var painter = new PaintUtil.Painter(this);
    if (d_data.displayMode & PlotSpectrogram.DisplayMode.ImageMode)
      super.draw(painter, xMap, yMap, canvasRect);

    if (d_data.displayMode & PlotSpectrogram.DisplayMode.ContourMode) {
      var area = ScaleMap.invTransform_Rect(xMap, yMap, canvasRect);

      var br = this.boundingRect();

      if (br.isValid()) {
        area.united(br);
        if (area.isEmpty()) return;
      }
      this.renderContourLines(painter, xMap, yMap, canvasRect);
    }
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PlotSpectrogram.DisplayMode}</div>
 *
 * The display mode controls how the raster data will be represented.
 * @name PlotSpectrogram.DisplayMode
 * @readonly
 * @property {Number} ImageMode               The values are mapped to colors using a color map.
 * @property {Number} ContourMode             The data is displayed using contour lines
 */
Enumerator.enum(
  "DisplayMode {ImageMode = 0x01 /* The values are mapped to colors using a color map*/, ContourMode = 0x02 /* The data is displayed using contour lines */}",
  PlotSpectrogram
);
