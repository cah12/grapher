

/**
 * Abstract base class for a curve fitter.
 * @abstract
 *
 */
class CurveFitter {
  constructor() {
    Utility.makeAbstract(this, CurveFitter);
    /**
     * Find a curve which has the best fit to a series of data points
     *
     * @abstract
     * @param {Misc.Polygon} polygon Series of data points
     * @returns {Array<Misc.Point>} Curve points
     */
    this.fitCurve = function (polygon) {
      throw '"fitCurve()" not reimplemented in subclass';
    };
  }
}

/*!
Use the default spline algorithm for polygons with
increasing x values ( p[i-1] < p[i] ), otherwise use
a parametric spline algorithm.
*/

/**
 * A curve fitter using cubic splines.
 * @extends CurveFitter
 *
 */
class SplineCurveFitter extends CurveFitter {
  constructor() {
    super();
    var m_fitMode = SplineCurveFitter.FitMode.Auto;
    var m_spline = new Spline();
    var m_splineSize = 100;

    function fitSpline(points) {
      m_spline.setPoints(points);
      if (!m_spline.isValid()) return points;

      var fittedPoints = new Array(m_splineSize);

      var x1 = points[0].x;
      var x2 = points[points.length - 1].x;
      var dx = x2 - x1;
      var delta = dx / (m_splineSize - 1);

      for (var i = 0; i < m_splineSize; i++) {
        //var p = fittedPoints[i];

        var v = x1 + i * delta;
        var sv = m_spline.value(v);

        /*p.x = v;
				p.y = sv;*/
        fittedPoints[i] = new Misc.Point(v, sv);
      }
      m_spline.reset();

      return fittedPoints;
    }

    function fitParametric(points) {
      var i;
      var size = points.length;

      var fittedPoints = []; //( d_data->splineSize );
      //fittedPoints.resize(m_splineSize, new Misc.Point(-1, -1))
      for (var i = 0; i < m_splineSize; i++) {
        fittedPoints.push(new Misc.Point(-1, -1));
      }
      var splinePointsX = []; //( size );
      var splinePointsY = []; //( size );

      for (var i = 0; i < size; i++) {
        splinePointsX.push(new Misc.Point(-1, -1));
        splinePointsY.push(new Misc.Point(-1, -1));
      }

      var p = points;
      var spX = splinePointsX;
      var spY = splinePointsY;

      var param = 0.0;
      for (i = 0; i < size; i++) {
        var x = p[i].x;
        var y = p[i].y;
        if (i > 0) {
          //console.log(Math)
          var delta = Math.sqrt(
            Utility.sqr(x - spX[i - 1].y) + Utility.sqr(y - spY[i - 1].y)
          );
          param += Math.max(delta, 1.0);
        }
        spX[i].x = param;
        spX[i].y = x;
        //spX.push({x:param, y:x});
        spY[i].x = param;
        spY[i].y = y;
        //spY.push({x:param, y:y});
      }

      m_spline.setPoints(splinePointsX);
      if (!m_spline.isValid()) return points;

      var deltaX = splinePointsX[size - 1].x / (m_splineSize - 1);
      for (i = 0; i < m_splineSize; i++) {
        var dtmp = i * deltaX;
        fittedPoints[i].x = m_spline.value(dtmp);
      }

      m_spline.setPoints(splinePointsY);
      if (!m_spline.isValid()) return points;

      var deltaY = splinePointsY[size - 1].x / (m_splineSize - 1);
      for (i = 0; i < m_splineSize; i++) {
        var dtmp = i * deltaY;
        fittedPoints[i].y = m_spline.value(dtmp);
      }

      return fittedPoints;
    }

    /**
     * Set the algorithm used for building the spline.
     *
     * @param {mod} mode Mode representing a spline algorithm.
     * @see {@link SplineCurveFitter#fitMode fitMode()}
     */
    this.setFitMode = function (mode) {};

    /**
     *
     * @returns {} Mode representing a spline algorithm
     * @see {@link SplineCurveFitter#setFitMode setFitMode()}
     */
    this.fitMode = function () {
      return;
    };

    /**
     * Assign a spline
     * @param {Spline} spline
     * @see {@link SplineCurveFitter#spline spline()}
     */
    this.setSpline = function (spline) {
      m_spline = spline;
      m_spline.reset();
    };

    /**
     *
     * @returns {Spline} Spline
     * @see {@link SplineCurveFitter#setSpline setSpline()}
     */
    this.spline = function () {
      return m_spline;
    };

    /**
     * Assign a spline size ( has to be at least 10 points )
     * @param {Number} splineSize Spline size
     * @see {@link SplineCurveFitter#splineSize splineSize()}
     */
    this.setSplineSize = function (splineSize) {
      m_splineSize = Math.max(splineSize, 10);
    };

    /**
     *
     * @returns {Number} Spline size
     * @see {@link SplineCurveFitter#setSplineSize setSplineSize()}
     */
    this.splineSize = function () {
      return m_splineSize;
    };

    /**
     * Find a curve which has the best fit to a series of data points.
     *
     * @param {Misc.Polygon} points Series of data points
     * @returns {Array<Misc.Point>} Curve points
     */
    this.fitCurve = function (points) {
      //console.log(polygon)
      var size = points.length;
      if (size <= 2) return points;

      var fitMode = m_fitMode;
      if (fitMode == SplineCurveFitter.FitMode.Auto) {
        fitMode = SplineCurveFitter.FitMode.Spline;

        var p = points; //.data();
        for (var i = 1; i < size; i++) {
          if (p[i].x <= p[i - 1].x) {
            fitMode = SplineCurveFitter.FitMode.ParametricSpline;
            break;
          }
        }
      }

      if (fitMode == SplineCurveFitter.FitMode.ParametricSpline)
        return fitParametric(points);
      else return fitSpline(points);
    };
  }
}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link SplineCurveFitter.FitMode}</div>
 *
 * A curve fitter using cubic splines. The default setting is Auto.
 *
 * @name SplineCurveFitter.FitMode
 * @readonly
 * @property {Number} Auto               Use the default spline algorithm for polygons with increasing x values ( p[i-1] < p[i] ), otherwise use a parametric spline algorithm.
 * @property {Number} Spline             Use a default spline algorithm.
 * @property {Number} ParametricSpline   Use a parametric spline algorithm.
 */
Enumerator.enum("FitMode {	Auto, Spline, ParametricSpline}", SplineCurveFitter);

////////////////////WeedingCurveFitter////////////////////////////////////////////////
class WC_PrivateData {
  constructor() {
    this.tolerance = 1.0;
    this.chunkSize = 0;
  }
}

class WC_Line {
  constructor(i1 = 0, i2 = 0) {
    //super();

    this.from = i1;
    this.to = i2;
  }
}

/** 
  A curve fitter implementing Douglas and Peucker algorithm

  The purpose of the Douglas and Peucker algorithm is that given a 'curve'
  composed of line segments to find a curve not too dissimilar but that
  has fewer points. The algorithm defines 'too dissimilar' based on the
  maximum distance (tolerance) between the original curve and the
  smoothed curve.

  The runtime of the algorithm increases non linear ( worst case O( n*n ) )
  and might be very slow for huge polygons. To avoid performance issues
  it might be useful to split the polygon ( setChunkSize() ) and to run the algorithm
  for these smaller parts. The disadvantage of having no interpolation
  at the borders is for most use cases irrelevant.

  The smoothed curve consists of a subset of the points that defined the
  original curve.

  In opposite to SplineCurveFitter the Douglas and Peucker algorithm reduces
  the number of points. By adjusting the tolerance parameter according to the
  axis scales SplineCurveFitter can be used to implement different
  level of details to speed up painting of curves of many points.  
  * @extends CurveFitter
*/
class WeedingCurveFitter extends CurveFitter {
  /**
   *
   * @param {Number} tolerance=1.0 Tolerance
   * @example
   * new WeedingCurveFitter(); //Default construction. Tolerance == 1.0
   * new WeedingCurveFitter(2.0); //Tolerance == 2.0
   */
  constructor(tolerance = 1.0) {
    super();
    var d_data;

    var simplify = function (/* QPolygonF */ points) {
      var toleranceSqr = d_data.tolerance * d_data.tolerance;

      /* QStack<Line> */ var stack = [];
      //stack.reserve( 500 );

      /* const QPointF * */ var p = points; //.data();
      /* const int */ var nPoints = points.length;

      //QVector<bool> usePoint( nPoints, false );
      var usePoint = [];
      usePoint.resize(nPoints, false);

      stack.push(new WC_Line(0, nPoints - 1));

      //while ( !stack.isEmpty() )
      while (stack.length) {
        /* const Line */ var r = stack.pop();

        // initialize line segment
        /* const double */ var vecX = p[r.to].x - p[r.from].x;
        /* const double */ var vecY = p[r.to].y - p[r.from].y;

        /* const double */ var vecLength = Math.sqrt(vecX * vecX + vecY * vecY);

        /* const double */ var unitVecX =
          vecLength != 0.0 ? vecX / vecLength : 0.0;
        /* const double */ var unitVecY =
          vecLength != 0.0 ? vecY / vecLength : 0.0;

        var maxDistSqr = 0.0;
        var nVertexIndexMaxDistance = r.from + 1;
        for (var i = r.from + 1; i < r.to; i++) {
          //compare to anchor
          var fromVecX = p[i].x - p[r.from].x;
          var fromVecY = p[i].y - p[r.from].y;

          var distToSegmentSqr;
          if (fromVecX * unitVecX + fromVecY * unitVecY < 0.0) {
            distToSegmentSqr = fromVecX * fromVecX + fromVecY * fromVecY;
          } else {
            var toVecX = p[i].x - p[r.to].x;
            var toVecY = p[i].y - p[r.to].y;
            var toVecLength = toVecX * toVecX + toVecY * toVecY;

            var s = toVecX * -unitVecX + toVecY * -unitVecY;
            if (s < 0.0) {
              distToSegmentSqr = toVecLength;
            } else {
              distToSegmentSqr = Math.abs(toVecLength - s * s);
            }
          }

          if (maxDistSqr < distToSegmentSqr) {
            maxDistSqr = distToSegmentSqr;
            nVertexIndexMaxDistance = i;
          }
        }
        if (maxDistSqr <= toleranceSqr) {
          usePoint[r.from] = true;
          usePoint[r.to] = true;
        } else {
          stack.push(new WC_Line(r.from, nVertexIndexMaxDistance));
          stack.push(new WC_Line(nVertexIndexMaxDistance, r.to));
        }
      }

      /* QPolygonF */ var stripped = [];
      for (var i = 0; i < nPoints; i++) {
        if (usePoint[i])
          //stripped += p[i];
          stripped.push(p[i]);
      }

      return stripped;
    };

    /**
     * Assign the tolerance
     * The tolerance is the maximum distance, that is acceptable
     * between the original curve and the smoothed curve.
     *
     * Increasing the tolerance will reduce the number of the resulting points.
     *
     * @param {Number} tolerance Tolerance
     * @see {@link WeedingCurveFitter#tolerance tolerance()}
     */
    this.setTolerance = function (tolerance) {
      d_data.tolerance = Math.max(tolerance, 0.0);
    };

    /**
     *
     * @returns {Number} Tolerance
     * @see {@link WeedingCurveFitter#setTolerance setTolerance()}
     */
    this.tolerance = function () {
      return d_data.tolerance;
    };

    /**
     * Limit the number of points passed to a run of the Douglas Peucker algorithm
     *
     * The runtime of the Douglas Peucker algorithm increases non linear
     * with the number of points. For a chunk size > 0 the polygon
     * is split into pieces passed to the algorithm one by one.
     * @param {Number} numPoints Maximum for the number of points passed to the algorithm
     * @see {@link WeedingCurveFitter#chunkSize chunkSize()}
     */
    this.setChunkSize = function (numPoints) {
      if (numPoints > 0)
        //numPoints = Math.max( numPoints, 3U );
        numPoints = Math.max(numPoints, 3);

      d_data.chunkSize = numPoints;
    };

    /**
     *
     * @returns {Number} Maximum for the number of points passed to a run
     * of the algorithm - or 0, when unlimited
     * @see {@link WeedingCurveFitter#setChunkSize setChunkSize()}
     */
    this.chunkSize = function () {
      return d_data.chunkSize;
    };

    /**
     *
     * @param {Array<Misc.Point>} points Series of data points
     * @returns {Array<Misc.Point>} Curve points
     */
    this.fitCurve = function (/* QPolygonF */ points) {
      /* QPolygonF */ var fittedPoints = [];

      if (d_data.chunkSize == 0) {
        fittedPoints = simplify(points);
      } else {
        for (var i = 0; i < points.length; i += d_data.chunkSize) {
          var p = points.mid(i, d_data.chunkSize);
          //fittedPoints += simplify( p );
          fittedPoints = fittedPoints.concat(simplify(p));
        }
      }

      return fittedPoints;
    };

    d_data = new WC_PrivateData();
    this.setTolerance(tolerance);
  }
}
