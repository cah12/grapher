'use strict';
/*!
  \brief A class for spline interpolation

  The QwtSpline class is used for cubical spline interpolation.
  Two types of splines, natural and periodic, are supported.

  \par Usage:
  <ol>
  <li>First call setPoints() to determine the spline coefficients
      for a tabulated function y(x).
  <li>After the coefficients have been set up, the interpolated
      function value for an argument x can be determined by calling
      QwtSpline::value().
  </ol>

  \par Example:
  \code
#include <qwt_spline.h>

QPolygonF interpolate(const QPolygonF& points, int numValues)
{
    QwtSpline spline;
    if ( !spline.setPoints(points) )
        return points;

    QPolygonF interpolatedPoints(numValues);

    const double delta =
        (points[numPoints - 1].x() - points[0].x()) / (points.size() - 1);
    for(i = 0; i < points.size(); i++)  / interpolate
    {
        const double x = points[0].x() + i * delta;
        interpolatedPoints[i].setX(x);
        interpolatedPoints[i].setY(spline.value(x));
    }
    return interpolatedPoints;
}
  \endcode
*/

//! Spline type
Static.SplineType = {}

//! A natural spline
Static.SplineType.Natural = 0

//! A periodic spline
Static.SplineType.Periodic = 1

Static.lookup = function (x, values) {
    var i1;
    var size = values.length;

    if (x <= values[0].x)
        i1 = 0;
    else if (x >= values[size - 2].x)
        i1 = size - 2;
    else {
        i1 = 0;
        var i2 = size - 2;
        var i3 = 0;

        while (i2 - i1 > 1) {
            i3 = i1 + ((i2 - i1) >> 1);

            if (values[i3].x > x)
                i2 = i3;
            else
                i1 = i3;
        }
    }
    return i1;
}

class Spline {
    constructor() {

        var m_points = null
        var m_a = []
        var m_b = []
        var m_c = []
        var m_splineType = Static.SplineType.Natural

        this.setSplineType = function (splineType) {
            m_splineType = splineType;
        }

        this.splineType = function () {
            return m_splineType;
        }

        /*!
          \brief Calculate the spline coefficients
    
          Depending on the value of \a periodic, this function
          will determine the coefficients for a natural or a periodic
          spline and store them internally.
    
          \param points Points
          \return true if successful
          \warning The sequence of x (but not y) values has to be strictly monotone
                   increasing, which means <code>points[i].x() < points[i+1].x()</code>.
               If this is not the case, the function will return false
        */
        this.setPoints = function (points) {
            var size = points.length;
            if (size <= 2) {
                this.reset();
                return false;
            }

            m_points = points;

            m_a.resize(size - 1);
            m_b.resize(size - 1);
            m_c.resize(size - 1);

            var ok;
            if (m_splineType == Static.SplineType.Periodic)
                ok = this.buildPeriodicSpline(points);
            else
                ok = this.buildNaturalSpline(points);

            if (!ok)
                this.reset();

            return ok;
        }

        this.points = function () {
            return m_points;
        }

        this.reset = function () {
            m_a.resize(0);
            m_b.resize(0);
            m_c.resize(0);
            m_points.resize(0);
        }

        this.isValid = function () {
            return m_a.length > 0;
        }

        /*!
          Calculate the interpolated function value corresponding
          to a given argument x.
    
          \param x Coordinate
          \return Interpolated coordinate
        */
        this.value = function (x) {
            if (m_a.length == 0)
                return 0.0;

            var i = Static.lookup(x, m_points);

            var delta = x - m_points[i].x;
            return ((((m_a[i] * delta) + m_b[i])
                * delta + m_c[i]) * delta + m_points[i].y);
        }

        this.coefficientsA = function () {
            return m_a;
        }

        this.coefficientsB = function () {
            return m_b;
        }

        this.coefficientsC = function () {
            return m_c;
        }

        this.buildNaturalSpline = function (points) {
            var i;

            var p = points;
            var size = points.length

            var a = m_a;
            var b = m_b;
            var c = m_c;

            //  set up tridiagonal equation system; use coefficient
            //  vectors as temporary buffers
            var h = new Array(size - 1);
            for (i = 0; i < size - 1; i++) {
                h[i] = p[i + 1].x - p[i].x;
                if (h[i] <= 0)
                    return false;
            }

            var d = new Array(size - 1);
            var dy1 = (p[1].y - p[0].y) / h[0];
            for (i = 1; i < size - 1; i++) {
                b[i] = c[i] = h[i];
                a[i] = 2.0 * (h[i - 1] + h[i]);

                var dy2 = (p[i + 1].y - p[i].y) / h[i];
                d[i] = 6.0 * (dy1 - dy2);
                dy1 = dy2;
            }

            //
            // solve it
            //

            // L-U Factorization
            for (i = 1; i < size - 2; i++) {
                c[i] /= a[i];
                a[i + 1] -= b[i] * c[i];
            }

            // forward elimination
            var s = new Array(size);
            s[1] = d[1];
            for (i = 2; i < size - 1; i++)
                s[i] = d[i] - c[i - 1] * s[i - 1];

            // backward elimination
            s[size - 2] = - s[size - 2] / a[size - 2];
            for (i = size - 3; i > 0; i--)
                s[i] = - (s[i] + b[i] * s[i + 1]) / a[i];
            s[size - 1] = s[0] = 0.0;

            //
            // Finally, determine the spline coefficients
            //
            for (i = 0; i < size - 1; i++) {
                a[i] = (s[i + 1] - s[i]) / (6.0 * h[i]);
                b[i] = 0.5 * s[i];
                c[i] = (p[i + 1].y - p[i].y) / h[i]
                    - (s[i + 1] + 2.0 * s[i]) * h[i] / 6.0;
            }

            return true;

        }

        this.buildPeriodicSpline = function (points) {
            var i;

            var p = points;
            var size = points.length

            var a = m_a
            var b = m_b
            var c = m_c

            var d = new Array(size - 1);
            var h = new Array(size - 1);
            var s = new Array(size);

            //
            //  setup equation system; use coefficient
            //  vectors as temporary buffers
            //
            for (i = 0; i < size - 1; i++) {
                h[i] = p[i + 1].x - p[i].x;
                if (h[i] <= 0.0)
                    return false;
            }

            var imax = size - 2;
            var htmp = h[imax];
            var dy1 = (p[0].y - p[imax].y) / htmp;
            for (i = 0; i <= imax; i++) {
                b[i] = c[i] = h[i];
                a[i] = 2.0 * (htmp + h[i]);
                var dy2 = (p[i + 1].y - p[i].y) / h[i];
                d[i] = 6.0 * (dy1 - dy2);
                dy1 = dy2;
                htmp = h[i];
            }

            //
            // solve it
            //

            // L-U Factorization
            a[0] = Math.sqrt(a[0]);
            c[0] = h[imax] / a[0];
            var sum = 0;

            for (i = 0; i < imax - 1; i++) {
                b[i] /= a[i];
                if (i > 0)
                    c[i] = - c[i - 1] * b[i - 1] / a[i];
                a[i + 1] = Math.sqrt(a[i + 1] - Utility.sqr(b[i]));
                sum += Utility.sqr(c[i]);
            }
            b[imax - 1] = (b[imax - 1] - c[imax - 2] * b[imax - 2]) / a[imax - 1];
            a[imax] = Math.sqrt(a[imax] - Utility.sqr(b[imax - 1]) - sum);


            // forward elimination
            s[0] = d[0] / a[0];
            sum = 0;
            for (i = 1; i < imax; i++) {
                s[i] = (d[i] - b[i - 1] * s[i - 1]) / a[i];
                sum += c[i - 1] * s[i - 1];
            }
            s[imax] = (d[imax] - b[imax - 1] * s[imax - 1] - sum) / a[imax];


            // backward elimination
            s[imax] = - s[imax] / a[imax];
            s[imax - 1] = -(s[imax - 1] + b[imax - 1] * s[imax]) / a[imax - 1];
            for (i = imax - 2; i >= 0; i--)
                s[i] = - (s[i] + b[i] * s[i + 1] + c[i] * s[imax]) / a[i];

            //
            // Finally, determine the spline coefficients
            //
            s[size - 1] = s[0];
            for (i = 0; i < size - 1; i++) {
                a[i] = (s[i + 1] - s[i]) / (6.0 * h[i]);
                b[i] = 0.5 * s[i];
                c[i] = (p[i + 1].y - p[i].y)
                    / h[i] - (s[i + 1] + 2.0 * s[i]) * h[i] / 6.0;
            }

            return true;

        }

    }
};

