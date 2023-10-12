/**
 * RasterData defines an interface to any type of raster data.
 *
 * RasterData is an abstract interface, that is used by PlotRasterItem to find the values at the pixels of its raster.
 *
 *
 */
class RasterData {
  constructor() {
    var d_intervals = [null, null, null];

    /**
     * Sets the bounding interval for the x, y or z coordinates.
     * @param {Axis.AxisId} axis Axis
     * @param {Interval} interval Bounding interval
     * @see {@link RasterData#interval interval()}
     */
    this.setInterval = function (axis, interval) {
      d_intervals[axis] = interval;
    };

    /**
     *
     * @param {Axis.AxisId} axis Axis
     * @returns {Interval} Bounding interval for an axis
     * @see {@link RasterData#setInterval setInterval()}
     */
    this.interval = function (axis) {
      return d_intervals[axis];
    };

    /**
     * Build contour data object. The properties of the object are:
     * - d: Array of Array of Number (the value at the intersection a column and row. This is the z value for the (x, y, z) sample).
     * - x: Array of Number (x values. This is the x value for the (x, y, z) sample)
     * - y: Array of Number (y values. This is the y value for the (x, y, z) sample)
     *
     * A valid 3D sample, for example, is `(x[2], y[4], d[2][4])`
     *
     * @param {Number} gridSizeX Number of columns in grid
     * @param {Number} gridSizeY Number of rows in grid
     * @returns {object} contour data object
     */
    this.contourLinesData = function (gridSizeX, gridSizeY) {
      var gridSzX = gridSizeX || 100;
      var gridSzY = gridSizeY || 100;
      var intervalX = this.interval(Static.XAxis);
      var intervalY = this.interval(Static.YAxis);
      var dx = intervalX.width() / (gridSzX - 1);
      var dy = intervalY.width() / (gridSzY - 1);
      var x = [];
      var xMin = intervalX.minValue();
      var y = [];
      var yMin = intervalY.minValue();

      for (var i = 0; i < gridSzX; i++) {
        x.push(xMin + i * dx);
      }
      for (var i = 0; i < gridSzY; i++) {
        y.push(yMin + i * dy);
      }
      //Correct last point
      x[gridSzX - 1] = intervalX.maxValue();
      y[gridSzY - 1] = intervalY.maxValue();

      var d = []; //array of arrarys

      for (var xi = 0; xi < x.length; xi++) {
        var col = [];
        for (var yi = 0; yi < y.length; yi++) {
          col.push(this.value(x[xi], y[yi]));
        }
        d.push(col);
      }
      return { d: d, x: x, y: y };
    };
  }

  value(x, y) {}
}
