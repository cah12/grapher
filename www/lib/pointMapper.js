"use strict";
// Mapping points with filtering out consecutive
// points mapped to the same position

Static.mToPolylineFiltered = function (xMap, yMap, series, from, to, round) {
  // in curves with many points consecutive points
  // are often mapped to the same position. As this might
  // result in empty lines ( or symbols hidden by others )
  // we try to filter them out

  //var polyline = [];//( to - from + 1 );
  //Point *points = polyline.data();
  var points = [];

  var sample0 = series.sample(from);

  //points.push({x:Math.round( xMap.transform( sample0.x ) ), y:Math.round( yMap.transform( sample0.y ) )})
  //points.push(new Misc.Point(Math.round(xMap.transform(sample0.x)), Math.round(yMap.transform(sample0.y))));
  points[0] = new Misc.Point(
    Math.round(xMap.transform(sample0.x)),
    Math.round(yMap.transform(sample0.y))
  );

  var pos = 0;
  for (var i = from + 1; i <= to; i++) {
    var sample = series.sample(i);
    var p;
    if (round)
      //p = { x:Math.round( xMap.transform( sample.x ) ), y:Math.round( yMap.transform( sample.y ) ) };
      p = new Misc.Point(
        Math.round(xMap.transform(sample.x)),
        Math.round(yMap.transform(sample.y))
      );
    //            p = { x: xMap.transform( sample.x ), y: yMap.transform( sample.y )  };
    else p = new Misc.Point(xMap.transform(sample.x), yMap.transform(sample.y));

    if (points[pos].x === p.x && points[pos].y === p.y) continue;
    pos++;
    //points.push(p);
    points[pos] = p;
  }

  //polyline.resize( pos + 1 );
  return points;
};

// mapping points without any filtering - beside checking
// the bounding rectangle

Static.mToPoints = function (
  boundingRect,
  xMap,
  yMap,
  series,
  from,
  to,
  round
) {
  //Polygon polyline( to - from + 1 );
  var points = [];

  var numPoints = 0;

  if (
    boundingRect.left() <= boundingRect.right() &&
    boundingRect.top() <= boundingRect.bottom()
  ) {
    // iterating over all values
    // filtering out all points outside of
    // the bounding rectangle

    let x, y;

    for (let i = from; i <= to; i++) {
      var sample = series.sample(i);

      // console.log(series.size().toString());

      x = xMap.transform(sample.x);
      y = yMap.transform(sample.y);

      if (
        x >= boundingRect.left() &&
        x <= boundingRect.right() &&
        y >= boundingRect.top() &&
        y <= boundingRect.bottom()
      ) {
        if (round) {
          points.push(new Misc.Point(Math.round(x), Math.round(y)));
        } else {
          points.push(new Misc.Point(x, y));
        }
        numPoints++;
      }
    }

    //polyline.resize( numPoints );
  } else {
    // simply iterating over all values
    // without any filtering

    for (var i = from; i <= to; i++) {
      var sample = series.sample(i);

      var x = xMap.transform(sample.x) - 1; //minus 1 why
      // if (x < 0) x = 0;
      var y = yMap.transform(sample.y) - 1; //minus 1 why
      // if (y < 0) y = 0;

      if (round) {
        //                points.push({x:Math.round( x ), y:Math.round( y )});
        points.push(new Misc.Point(Math.round(x), Math.round(y)));
      } else {
        //                points.push({x:x, y:y});
        points.push(new Misc.Point(x, y));
      }

      numPoints++;
    }
  }

  return points;
};

/**
 * A helper class for translating a series of points.
 *
 * PointMapper is a collection of methods and optimizations for translating a series of points into paint device coordinates. It is used by {@link Curve} but might also be useful for similar plot items displaying a {@link SeriesData}.
 */
class PointMapper {
  constructor() {
    var m_flags = 0;
    //var m_boundingRect = { left:0.0, top:0.0, right:-1.0, bottom:-1.0, width:-1.0, height:-1 };
    var m_boundingRect = new Misc.Rect();

    /**
     * Set a bounding rectangle for the point mapping algorithm
     *
     * A valid bounding rectangle can be used for optimizations
     * @param {Misc.Rect} rect Bounding rectangle
     * @see {@link PointMapper#boundingRect boundingRect()}
     */
    this.setBoundingRect = function (rect) {
      m_boundingRect = rect;
    };

    /**
     *
     * @returns {Misc.Rect} Bounding rectangle
     * @see {@link PointMapper#setBoundingRect setBoundingRect()}
     */
    this.boundingRect = function () {
      return m_boundingRect;
    };

    /**
     * Modify a flag affecting the transformation process
     * @param {PointMapper.TransformationFlag} flag Flag type
     * @param {Boolean} on Value
     * @see {@link PointMapper#setFlags setFlags()}
     */
    this.setFlag = function (flag, on) {
      if (on) m_flags |= flag;
      else m_flags &= ~flag;
    };

    /**
     * Set the flags affecting the transformation process
     * @param {PointMapper.TransformationFlag} flags 	Flags
     * @see {@link PointMapper#flags flags()}
     * @see {@link PointMapper#setFlag setFlag()}
     */
    this.setFlags = function (flags) {
      m_flags = flags;
    };

    /**
     *
     * @returns {Number} Flags affecting the transformation process
     * @see {@link PointMapper#setFlags setFlags()}
     * @see {@link PointMapper#setFlag setFlag()}
     */
    this.flags = function () {
      return m_flags;
    };

    /**
     *
     * @param {PointMapper.TransformationFlag} flag Flag type
     * @returns {Boolean} True, when the flag is set
     * @see {@link PointMapper#setFlag setFlag()}
     * @see {@link PointMapper#setFlags setFlags()}
     */
    this.testFlag = function (flag) {
      return m_flags & flag;
    };

    /**
     * Translate a series of points into a QPolygonF
     *
     * When the WeedOutPoints flag is enabled consecutive points, that are mapped to the same position will be one point.
     *
     * When PointMapper.TransformationFlag.RoundPoints is set all points are rounded to integers.
     * @param {Number} xMap x map
     * @param {Number} yMap y map
     * @param {SeriesData} series Series of points to be mapped
     * @param {Number} from Index of the first point to be painted
     * @param {Number} to Index of the last point to be painted
     * @returns {Array<Misc.Point>} Translated polygon
     */
    this.toPolygonF = function (xMap, yMap, series, from, to) {
      // console.log(xMap.s1(), xMap.s2());
      // console.log(yMap.s1(), yMap.s2());
      // console.log("");
      // const left = xMap.s1();
      // const top = yMap.s2();
      // const w = xMap.s2() - xMap.s1();
      // const h = yMap.s2() - yMap.s1();

      // console.log(left, top, w, h);

      // const boundingRect = new Misc.Rect();
      // boundingRect.setLeft(xMap.p1());
      // boundingRect.setRight(xMap.p2());
      // boundingRect.setBottom(yMap.p1());
      // boundingRect.setTop(yMap.p2());
      // console.log(boundingRect.toString());

      var polyline = [];

      if (m_flags & PointMapper.TransformationFlag.WeedOutPoints) {
        if (m_flags & PointMapper.TransformationFlag.RoundPoints) {
          polyline = Static.mToPolylineFiltered(
            xMap,
            yMap,
            series,
            from,
            to,
            true
          );
        } else {
          polyline = Static.mToPolylineFiltered(
            xMap,
            yMap,
            series,
            from,
            to,
            false
          );
        }
      } else {
        if (m_flags & PointMapper.TransformationFlag.RoundPoints) {
          polyline = Static.mToPoints(
            new Misc.Rect(0.0, 0.0, -1.0, -1),
            //boundingRect,
            xMap,
            yMap,
            series,
            from,
            to,
            true
          );
        } else {
          polyline = Static.mToPoints(
            new Misc.Rect(0.0, 0.0, -1.0, -1),
            //boundingRect,
            xMap,
            yMap,
            series,
            from,
            to,
            false
          );
          //alert(polyline)
        }
      }

      return polyline;
    };

    /**
     * Translate a series into a Array<Misc.Point>
     *
     * WeedOutPoints & PointMapper.TransformationFlag.RoundPoints & boundingRect().isValid()
     *
     * All points that are mapped to the same position will be one point. Points outside of the bounding rectangle are ignored.
     *
     * WeedOutPoints & PointMapper.TransformationFlag.RoundPoints & !boundingRect().isValid(). All consecutive points that are mapped to the same position will one point.
     *
     * !WeedOutPoints & boundingRect().isValid(). Points outside of the bounding rectangle are ignored.
     *
     * When PointMapper.TransformationFlag.RoundPoints is set all points are rounded to integers.
     * @param {Number} xMap x map
     * @param {Number} yMap y map
     * @param {SeriesData} series Series of points to be mapped
     * @param {Number} from Index of the first point to be painted
     * @param {Number} to Index of the last point to be painted
     * @returns {Array<Misc.Point>} Translated polygon
     */
    this.toPointsF = function (xMap, yMap, series, from, to) {
      var points; //= [];

      if (m_flags & PointMapper.TransformationFlag.WeedOutPoints) {
        if (m_flags & PointMapper.TransformationFlag.RoundPoints) {
          if (
            m_boundingRect.left() <= m_boundingRect.right() &&
            m_boundingRect.top() <= m_boundingRect.bottom()
          ) {
            points = Static.mToPointsFiltered(
              m_boundingRect,
              xMap,
              yMap,
              series,
              from,
              to
            );
          } else {
            // without a bounding rectangle all we can
            // do is to filter out duplicates of
            // consecutive points

            points = Static.mToPolylineFiltered(
              xMap,
              yMap,
              series,
              from,
              to,
              true
            );
          }
        } else {
          // when rounding is not allowed we can't use
          // qwtToPointsFilteredF

          points = Static.mToPolylineFiltered(
            xMap,
            yMap,
            series,
            from,
            to,
            false
          );
        }
      } else {
        if (m_flags & PointMapper.TransformationFlag.RoundPoints) {
          points = Static.mToPoints(
            m_boundingRect,
            xMap,
            yMap,
            series,
            from,
            to,
            true
          );
        } else {
          points = Static.mToPoints(
            m_boundingRect,
            xMap,
            yMap,
            series,
            from,
            to,
            false
          );
        }
      }

      return points;
    };
  }

  /**
   *
   * @returns {String} A string representation of the object.
   */
  toString() {
    return "[PointMapper]";
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PointMapper.TransformationFlag}</div>
 *
 * Flags affecting the transformation process.
 * @name PointMapper.TransformationFlag
 * @readonly
 * @property {Number} RoundPoints=0x01                Round points to integer values.
 * @property {Number} WeedOutPoints=0x02              Try to remove points, that are translated to the same position.
 */
Enumerator.enum(
  "TransformationFlag { RoundPoints = 0x01 , WeedOutPoints = 0x02}",
  PointMapper
);
