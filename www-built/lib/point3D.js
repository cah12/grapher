/**
 * Point3D class defines a 3D point
 */
class Point3D {
  /**
   * The constructor is overloaded. See example.
   * @param {Number} [x] x value or a Misc.Point or Point3D
   * @param {Number} [y] y value
   * @param {Number} [z] z value
   * @example
   * const p3d = new Point3D(); //(0, 0, 0)
   * const p3d = new Point3D(new Misc.Point(1, 2)); //(1, 2, 0)
   * const p3d = new Point3D(1, 2, 3); //(1, 2, 3)
   * const other_p3d = new Point3D(p3d); //(1, 2, 3)
   *
   */
  constructor(/* double  */ x, /* double */ y, /* double */ z) {
    var d_x = 0.0;
    var d_y = 0.0;
    var d_z = 0.0;
    if (x == undefined) {
    } else if (y !== undefined) {
      d_x = x;
      d_y = y;
      d_z = z;
    } else if (typeof x == "object" && x.z == undefined) {
      d_x = x.x;
      d_y = x.y;
      d_z = 0;
    } else {
      d_x = x.x();
      d_y = x.y();
      d_z = x.z();
    }

    /**
     * A point is considered to be null if x, y and z-coordinates are equal to zero.
     * @returns {Boolean} True if the point is null; otherwise returns false.
     */
    this.isNull = function () {
      return d_x == 0.0 && d_y == 0.0 && d_z == 0.0;
    };

    /**
     *
     * @returns {Number} The x-coordinate of the point.
     */
    this.x = function () {
      return d_x;
    };

    /**
     *
     * @returns {Number} The y-coordinate of the point.
     */
    this.y = function () {
      return d_y;
    };

    /**
     *
     * @returns {Number} The z-coordinate of the point.
     */
    this.z = function () {
      return d_z;
    };

    /**
     * Sets the x-coordinate of the point to the value specified by x.
     * @param {Numbe} x value
     */
    this.setX = function (x) {
      d_x = x;
    };

    //! Sets the y-coordinate of the point to the value specified by y.

    /**
     * Sets the y-coordinate of the point to the value specified by y.
     * @param {Numbe} y value
     */
    this.setY = function (y) {
      d_y = y;
    };

    /**
     * Sets the z-coordinate of the point to the value specified by z
     * @param {Number} z value
     */
    this.setZ = function (z) {
      d_z = z;
    };

    /**
     * Sets a 3D point to a 3D point
     * @param {Point3D} pt3D point
     */
    this.setPoint3D = function (pt3D) {
      d_x = pt3D.x();
      d_y = pt3D.y();
      d_z = pt3D.z();
    };

    /**
     *
     * @returns {Misc.Point} 2D point, where the z coordinate is dropped.
     */
    this.toPoint = function () {
      return new Misc.Point(d_x, d_y);
    };

    /**
     *
     * @returns {String} A string representing the object.
     */
    this.toString = function () {
      return "[" + d_x + ", " + d_y + ", " + d_z + "]";
    };
  }
}
