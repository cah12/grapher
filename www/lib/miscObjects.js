"use strict";
// var MoveToElement = 0;
// var LineToElement = 1;
// var Misc.CurveToElement = 2;
// var CurveToDataElement = 3;

/**
 * A collection useful clases.
 * @namespace
 */
var Misc = {};

Misc.EPSILON = Number.MIN_VALUE;

Misc.MoveToElement = 0;
Misc.LineToElement = 1;
Misc.CurveToElement = 2;
Misc.CurveToDataElement = 3;

/**
 * @classdesc Image is a class designed and optimized for direct pixel access and manipulation.
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {Misc.Size|Number} [w] The image size or width. Defaults to a width of 0
 * @param {Number} [h] The image height. Defaults to a height of 0
 * @example
 * new Image()//Creates an image of width == height == 0;
 * new Image(new Misc.Size(20, 30))//Creates an image of width == 20 and height == 30;
 * new Image(20, 30)//Creates an image of width == 20 and height == 30;
 *
 */
Misc.Image = function (w, h /* , a */) {
  var _w = w;
  var _h = h;

  var _colorTable = null;
  //var _a = 255;
  //var m_ctx = ctx;
  if (typeof w === "object" && _.has(w, "width") && _.has(w, "height")) {
    _w = w.width;
    _h = w.height;
    //a = h;
  }
  if (w == undefined) {
    _w = 0;
    _h = 0;
  }

  /* if(a !== undefined){
        if(a < 255 && a >=0)
            _a = a;
    } */

  var cnvs = $("<canvas/>");
  var m_ctx = cnvs[0].getContext("2d");

  /*
    For every pixel in an ImageData object there are four pieces of information, the RGBA values:
    R - The color red (from 0-255)
    G - The color green (from 0-255)
    B - The color blue (from 0-255)
    A - The alpha channel (from 0-255; 0 is transparent and 255 is fully visible)
    The color/alpha information is held in an array, and is stored in the data property of the ImageData object.
    */
  var m_data = null;
  if (_w !== 0 && _h !== 0) m_data = m_ctx.createImageData(_w, _h);

  /**
   *
   * @returns {Uint8ClampedArray} one-dimensional array containing the data in the RGBA order, with integer values between 0 and 255 (inclusive).
   */
  this.data = function () {
    return m_data.data;
  };

  /**
   * Scales the image
   *
   * Both width and height are scaled by the same factor
   * @param {Number} scale Scale factor
   */
  this.scaleImageData = function (scale) {
    if (!m_data) return;
    var scaled = m_ctx.createImageData(
      m_data.width * scale,
      m_data.height * scale
    );
    var subLine = m_ctx.createImageData(scale, 1).data;
    for (var row = 0; row < m_data.height; row++) {
      for (var col = 0; col < m_data.width; col++) {
        var sourcePixel = m_data.data.subarray(
          (row * m_data.width + col) * 4,
          (row * m_data.width + col) * 4 + 4
        );
        for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x * 4);
        for (var y = 0; y < scale; y++) {
          var destRow = row * scale + y;
          var destCol = col * scale;
          scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4);
        }
      }
    }

    m_data = scaled;
  };

  /**
   *
   * @returns {ImageData} ImageData object
   */
  this.imageData = function () {
    return m_data;
  };

  /**
   * Sets a new ImageData object
   * @param {ImageData} d ImageData object
   */
  this.setImageData = function (d) {
    m_data = d;
  };

  /**
   *
   * @returns {Number} image width
   */
  this.width = function () {
    return _w;
  };

  /**
   *
   * @param {Nimber} w Width of the image
   */
  this.setWidth = function (w) {
    _w = w;
  };

  /**
   *
   * @returns {Number} image height
   */
  this.height = function () {
    return _h;
  };

  /**
   *
   * @param {Number} h Height of the image
   */
  this.setHeight = function (h) {
    _h = h;
  };

  /**
   *
   * @returns {Misc.Size} Size of image
   */
  this.size = function () {
    return new Misc.Size(_w, _h);
  };

  /**
   *
   * @returns {Boolean} true, if Image data == null
   */
  this.isNull = function () {
    return m_data == null;
  };

  /**
   *
   * @returns {Misc.Image} Deep copy of the image
   */
  this.copy = function () {
    var res = new Misc.Image(this.width(), this.height());
    var imageDataCopy = new ImageData(
      new Uint8ClampedArray(m_data.data),
      m_data.width,
      m_data.height
    );
    res.setImageData(imageDataCopy);
    return res;
  };

  /**
   * Set the alpha value
   * @param {Number} a alpha value (0 - 255 inclusive)
   */
  this.setAlpha = function (a) {
    if (m_data.data && m_data.data[3] == a) return;
    var data = m_data.data;
    var i,
      len = data.length;
    for (i = 3; i < len; i += 4) {
      data[i] = a;
    }
  };

  /**
   * Set a pixel value at position with coordinate (x, y)
   * @param {Number} x X coordinate position
   * @param {Number} y Y coordinate position
   * @param {object} rgba (e.g. {r:240, g:20, b:0, a:50})
   */
  this.setPixel = function (x, y, rgba) {
    if (typeof rgba == "number") {
      rgba = _colorTable[Math.round(rgba)];
    }

    var redAddress = y * (_w * 4) + x * 4;

    // Copy the values into the array starting at index redAddress
    // m_data.data.set([rgba.r, rgba.g, rgba.b, 255], redAddress);

    m_data.data[redAddress] = rgba.r;
    m_data.data[redAddress + 1] = rgba.g;
    m_data.data[redAddress + 2] = rgba.b;
    //m_data.data[redAddress + 3] = 255;
    // if (rgba.a) {
    //   if (rgba.a > 255) rgba.a = 255;
    //   if (rgba.a < 0) rgba.a = 0;
    //   m_data.data[redAddress + 3] = rgba.a;
    // }
    m_data.data[redAddress + 3] = rgba.a || 255;
  };

  this.setColorTable = function (ct) {
    _colorTable = ct;
  };

  /**
   *
   * Get a pixel value at position with coordinate (x, y)
   * @param {Number} x X coordinate position
   * @param {Number} y Y coordinate position
   * @returns {object} the rgba (e.g. {r:240, g:20, b:0, a:50})
   */
  this.pixel = function (x, y) {
    if (y == undefined && _colorTable) {
      //x is a index into the colorTable
      return _colorTable[Math.round(x)];
    }
    var redAddress = y * (_w * 4) + x * 4;
    return {
      r: m_data.data[redAddress],
      g: m_data.data[redAddress + 1],
      b: m_data.data[redAddress + 2],
      a: m_data.data[redAddress + 3],
    };
  };
};

/*style
          solid
          dash : ctx.setLineDash([10, 5])
          dashDot : ctx.setLineDash([12, 5, 3, 5])
          dashDotDot : ctx.setLineDash([12, 5, 3, 5, 3, 5])
          dot : ctx.setLineDash([2, 8])
        */
/**
 * @classdesc A pen has a color, width and style property.
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {String|Misc.Pen} [c] Color or other pen
 * @param {Number} [w] Width
 * @param {String} [s] Style. Possible values are:
 * - `solid`
 * - `dash`
 * - `dashDot`
 * - `dashDotDot`
 * - `dot`
 * @example
 * new Misc.Pen(); //Creates a black solid pen of width 1.
 * new Misc.Pen("red"); //Creates a red solid pen of width 1.
 * new Misc.Pen("red", 2); //Creates a red solid pen of width 2.
 * new Misc.Pen("red", 2, "dash"); //Creates a red dash pen of width 2.
 * new Misc.Pen(existingPen); //Creates a pen with color == existingPen.color, width == existingPen.width and style == existingPen.style.
 */
Misc.Pen = function (c, w, s) {
  if (typeof c === "object") {
    return new Misc.Pen(c.color, c.width, c.style);
  }
  this.color = "black";
  this.width = 1.0;
  this.style = "solid";
  if (c == Static.NoPen || s == Static.NoPen) this.style = Static.NoPen;

  if (typeof s !== "undefined") this.style = s;
  if (typeof w !== "undefined") this.width = w;
  if (typeof c !== "undefined") this.color = c;
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Pen.prototype.toString = function () {
  return (
    "[color:" +
    this.color +
    ", width:" +
    this.width +
    ", style:" +
    this.style +
    "]"
  );
};

/**
 * Check pen for equality.
 * @param {Misc.Pen} otherPen pen
 * @returns {Boolean} true, if otherPen is equal to this pen
 */
Misc.Pen.prototype.isEqual = function (otherPen) {
  if (otherPen == undefined) return false;
  if (
    this.color == otherPen.color &&
    this.style == otherPen.style &&
    this.width == otherPen.width
  )
    return true;

  return false;
};

/**
 * @classdesc Brush used for painting / filling
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {String} type valid html color
 * new Misc.Brush(); //Creates a colorless brush.
 * new Misc.Brush("red"); //Creates a red brush.
 */
Misc.Brush = function (type) {
  this.color = Static.NoBrush;
  if (typeof type !== "undefined" /*  && typeof(type)=="string" */)
    this.color = type;
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Brush.prototype.toString = function () {
  return "[Brush: " + this.color + "]";
};

/**
 * Check brush for equality.
 * @param {Misc.Brush} otherBrush pen
 * @returns {Boolean} true, if otherPen is equal to this pen
 */
Misc.Brush.prototype.isEqual = function (otherBrush) {
  if (this.color == otherBrush.color) return true;
  return false;
};

/**
 * @classdesc A Line describes a finite length line (or a line segment) on a two-dimensional surface.
 * The start and end points of the line are specified using floating point accuracy for coordinates.
 *
 * @constructor
 * @param {Misc.Point} point1 First point
 * @param {Misc.Point} point2 Second point
 *
 */
Misc.Line = function (point1, point2) {
  var m_p1 = point1;
  var m_p2 = point2;

  /**
   *
   * @returns {Misc.Point} Returns the line's start point.
   */
  this.p1 = function () {
    return m_p1;
  };

  /**
   *
   * @returns {Misc.Point} Returns the line's end point.
   */
  this.p2 = function () {
    return m_p2;
  };
};

/**
 *
 * @returns {Number} Returns the x-coordinate of the line's start point.
 */
Misc.Line.prototype.x1 = function () {
  return this.p1().x;
};

/**
 *
 * @returns {Number} Returns the x-coordinate of the line's end point.
 */
Misc.Line.prototype.x2 = function () {
  return this.p2().x;
};

/**
 *
 * @returns {Number} Returns the y-coordinate of the line's start point.
 */
Misc.Line.prototype.y1 = function () {
  return this.p1().y;
};

/**
 *
 * @returns {Number} Returns the y-coordinate of the line's end point.
 */
Misc.Line.prototype.y2 = function () {
  return this.p2().y;
};

// Misc.Line.prototype.x2 = function () {
//   return this.p2().x;
// };

/**
 *
 * @returns {Number} the length of the line
 */
Misc.Line.prototype.length = function () {
  return Math.sqrt(
    (this.p2().x - this.p1().x) * (this.p2().x - this.p1().x) +
      (this.p2().y - this.p1().y) * (this.p2().y - this.p1().y)
  );
};

/**
 * @classdesc A size is specified by a width and a height. It can be set in the constructor
 * and changed by assigning to the width and height property.
 *
 * The isValid() function determines if a size is valid (a valid size has
 * both width and height greater than or equal to zero).
 *
 * The isEmpty() function returns true if either of the width and height is less
 * than, or equal to, zero.
 *
 * Use the expandedTo() function to retrieve a size which holds the maximum
 * height and width of this size and a given size. Similarly, the boundedTo() function
 * returns a size which holds the minimum height and width of this size and a given
 * size.
 *
 * Size can be compared.
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {Misc.Size|Number} [w] Width or an existing Misc.Size object
 * @param {Number} [h] Height
 * @example
 * new Misc.Size(); //Creates a Size of width == height == 0.
 * new Misc.Size(20, 100); //Creates a Size of width == 20 and height == 100.
 * new Misc.Size(existingSize); //Creates a Size of width == existingSize.width and height == existingSize.height.
 */
Misc.Size = function (w, h) {
  if (w instanceof Misc.Size) {
    h = w.height;
    w = w.width;
  }
  this.width = 0.0;
  this.height = 0.0;
  if (typeof h !== "undefined") {
    this.width = w;
    this.height = h;
  }
};

/**
 *
 * @returns {Boolean} Returns true if both the width and height is equal to or greater than 0; otherwise returns false.
 */
Misc.Size.prototype.isValid = function () {
  if (this.width < 0 || this.height < 0) return false;
  return true;
};

/**
 *
 * @returns {Boolean} Returns true if either of the width and height is less than or equal to 0; otherwise returns false.
 */
Misc.Size.prototype.isEmpty = function () {
  return this.width <= 0 || this.height <= 0;
};

/**
 *
 * @returns {Misc.Size} A deep copy of the object
 */
Misc.Size.prototype.copy = function () {
  return new Misc.Size(this.width, this.height);
};

/**
 *
 * @param {Misc.Size} size
 * @returns {Boolean} true if size is equal to this size; otherwise returns false.
 */
Misc.Size.prototype.isEqual = function (size) {
  /* if ((this.width == size.width) && (this.height == size.height))
        return true;
    return false; */
  var x = this.width - size.width,
    y = this.height - size.height;
  return x * x + y * y < Misc.EPSILON;
};

/**
 *
 * @param {Misc.Size} otherSize
 * @returns {Misc.Size} A size holding the maximum width and height of this size and the given otherSize.
 */
Misc.Size.prototype.expandedTo = function (otherSize) {
  return new Misc.Size(
    Math.max(this.width, otherSize.width),
    Math.max(this.height, otherSize.height)
  );
};

/**
 *
 * @param {Misc.Size} otherSize
 * @returns {Misc.Size} A size holding the minimum width and height of this size and the given otherSize.
 */
Misc.Size.prototype.boundedTo = function (otherSize) {
  return new Misc.Size(
    Math.min(this.width, otherSize.width),
    Math.min(this.height, otherSize.height)
  );
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Size.prototype.toString = function () {
  return "[" + this.width + ", " + this.height + "]";
};

/**
 * @classdesc A point is specified by a x coordinate and an y coordinate which can be accessed
 * using pt.x and pt.y. The coordinates can be set (or altered) by assigning directly to the property (e.g. pt.x = 4.5).
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {Number|Misc.Point} [x]  x coordinate or an existingPoint object
 * @param {Number} [y]  y coordinate
 * @example
 * new Misc.Point(); //Creates a point with x coordinate == 0 and y coordinate == 0.
 * new Misc.Point(10, 20); //Creates a point with x coordinate == 10 and y coordinate == 20.
 * new Misc.Point(existingPoint); //Creates a point with x coordinate == existingPoint.x and y coordinate == existingPoint.y.
 */
Misc.Point = function (x, y) {
  if (x instanceof Misc.Point) {
    this.x = x.x;
    this.y = x.y;
    return;
  }
  this.x = 0.0;
  this.y = 0.0;

  if (typeof y !== "undefined") {
    this.y = y;
  }
  if (typeof x !== "undefined") {
    this.x = x;
  }
};

/**
 * Calculate the linear interpolated point
 * @param {Misc.Point} pt other point
 * @param {Number} xVal x coordinate for interpolation
 * @returns {Misc.Point} interpolated point
 */
Misc.Point.prototype.interpolatedPoint = function (pt, xVal) {
  if (xVal == pt.x) {
    return pt;
  }
  if (xVal == this.x) {
    return this;
  }
  var yVal = ((this.y - pt.y) / (this.x - pt.x)) * (xVal - pt.x) + pt.y;
  return new Misc.Point(xVal, yVal);
};

/**
 * Calculate the log interpolated point
 * @param {Misc.Point} pt other point
 * @param {Number} xVal x coordinate for interpolation
 * @returns {Misc.Point} interpolated point
 */
Misc.Point.prototype.logInterpolatedPoint = function (pt, xVal) {
  if (xVal == pt.x) {
    return pt;
  }
  if (xVal == this.x) {
    return this;
  }
  var yVal =
    ((this.y - pt.y) / (math.log(this.x, 10) - math.log(pt.x, 10))) *
      (math.log(xVal, 10) - math.log(pt.x, 10)) +
    pt.y;
  return new Misc.Point(xVal, yVal);
};

/**
 *
 * @param {Misc.Point} pt
 * @returns {Boolean} true if pt is equal to this point; otherwise returns false.
 */
Misc.Point.prototype.isEqual = function (pt) {
  //return (this.x === pt.x && this.y === pt.y)
  var x = this.x - pt.x,
    y = this.y - pt.y;
  return x * x + y * y < Misc.EPSILON;
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Point.prototype.toString = function () {
  return "(" + this.x + ", " + this.y + ")";
};

/**
 * @classdesc A rectangle is normally expressed as a top-left corner and a size. The size (width and height) of a Rect is always equivalent to the mathematical rectangle that forms the basis for its rendering.
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {Number|Misc.Point} [param1] x coordinate of the top-left corner or the {@link Misc.Point} representing the top-left corner
 * @param {Number|Misc.Point|Misc.Size} [param2] The width of the rectangle or a {@link Misc.Point} representing the bottom-right corner of the rectangle or a {@link Misc.Size} object specifying the width and height of the rectangle.
 * @param {Number} [param3] Width of the rectangle
 * @param {Number} [param4] Height of the rectangle
 * @example
 * new Misc.Rect(x, y width, height); //Constructs a rectangle with `(x, y)` as its top-left corner and the given `width` and `height`.
 * new Misc.Rect(topLeft, size); //Constructs a rectangle with the given topLeft({@link Misc.Point}) corner and the given size({@link Misc.Size}).
 * new Misc.Rect(topLeft, bottomRight); //Constructs a rectangle with the given topLeft({@link Misc.Point}) corner and the given bottomRight({@link Misc.Point}).
 * new Misc.Rect(); //Constructs an invalid rectangle. (i.e. a rectangle of width == height == -1).
 */
Misc.Rect = function (param1, param2, param3, param4) {
  var m_left = 0.0;
  var m_top = 0.0;
  var m_right = -1.0;
  var m_bottom = -1.0;
  var m_width = -1.0;
  var m_height = -1;
  if (typeof param4 !== "undefined") {
    m_left = param1;
    m_top = param2;
    m_width = param3;
    m_height = param4;
    m_right = m_left + m_width;
    m_bottom = m_top + m_height;
  } else if (typeof param3 !== "undefined") {
    m_left = param1.x;
    m_top = param1.y;
    m_width = param2;
    m_height = param3;
    m_right = m_left + m_width;
    m_bottom = m_top + m_height;
  } else if (typeof param2 !== "undefined") {
    m_left = param1.x;
    m_top = param1.y;
    if (typeof param2.x !== "undefined") {
      m_right = param2.x;
      m_bottom = param2.y;
      m_width = m_right - m_left;
      m_height = m_bottom - m_top;
    } else {
      m_width = param2.width;
      m_height = param2.height;
      m_right = m_left + m_width;
      m_bottom = m_top + m_height;
    }
  }

  /**
   *
   * @returns {Number} The x-coordinate of the rectangle's left edge. Equivalent to x().
   */
  this.left = function () {
    return m_left;
  };

  /**
   * Sets the left edge of the rectangle to the given x coordinate.
   *
   * May change the width, but will never change the right edge of the rectangle.
   * @param {Number} val Value
   */
  this.setLeft = function (val) {
    if (m_left === val) return;
    m_left = val;
    m_width = m_right - m_left;
  };

  /**
   *
   * @returns {Number} The y-coordinate of the rectangle's top edge. Equivalent to y().
   */
  this.top = function () {
    return m_top;
  };

  /**
   * Sets the top edge of the rectangle to the given y coordinate.
   *
   * May change the height, but will never change the bottom edge of the rectangle.
   * @param {Number} val Value
   */
  this.setTop = function (val) {
    if (m_top === val) return;
    m_top = val;
    m_height = m_bottom - m_top;
  };

  /**
   *
   * @returns {Number} The x-coordinate of the rectangle's right edge.
   */
  this.right = function () {
    return m_right;
  };

  /**
   * Sets the right edge of the rectangle to the given x coordinate.
   *
   * May change the width, but will never change the leftt edge of the rectangle.
   * @param {Number} val Value
   */
  this.setRight = function (val) {
    if (m_right === val) return;
    m_right = val;
    m_width = m_right - m_left;
  };

  /**
   *
   * @returns {Number} The y-coordinate of the rectangle's bottom edge.
   */
  this.bottom = function () {
    return m_bottom;
  };

  /**
   * Sets the bottom edge of the rectangle to the given y coordinate.
   *
   * May change the height, but will never change the top edge of the rectangle.
   * @param {Number} val Value
   */
  this.setBottom = function (val) {
    if (m_bottom === val) return;
    m_bottom = val;
    m_height = m_bottom - m_top;
  };

  /**
   *
   * @returns {Number} The width of the rectangle.
   */
  this.width = function () {
    return m_width;
  };

  /**
   *
   * @returns {Number} The height of the rectangle.
   */
  this.height = function () {
    return m_height;
  };
};

/**
 * Sets the width of the rectangle to the given width.
 *
 * The right edge is changed, but not the left one.
 * @param {Number} val Value
 */
Misc.Rect.prototype.setWidth = function (val) {
  if (this.width() === val) return;
  //m_width = val;
  //m_right = m_left + m_width;
  this.setRight(this.left() + val);
};

/**
 * A valid rectangle has a left() <= right() and top() <= bottom(). Note that non-trivial operations like intersections are not defined for invalid rectangles. A valid rectangle is not empty (i.e., isValid() == !isEmpty()).
 * @returns {Boolean} true, if the rectangle is valid, otherwise returns false.
 */
Misc.Rect.prototype.isValid = function () {
  if (this.width() <= 0 || this.height() <= 0) return false;
  return true;
};

/**
 *
 * @returns {Misc.Rect} A deep copy of the object
 */
Misc.Rect.prototype.copy = function () {
  return new Misc.Rect(this.left(), this.top(), this.width(), this.height());
};

/**
 * Sets the height of the rectangle to the given height.
 *
 * The bottom edge is changed, but not the top one.
 * @param {Number} val Value
 */
Misc.Rect.prototype.setHeight = function (val) {
  if (this.height() === val) return;
  //m_height = val;
  //m_bottom = m_top + m_height
  this.setBottom(this.top() + val);
};

/**
 * Adds dx1, dy1, dx2 and dy2 respectively to the existing coordinates of the rectangle.
 * @param {Number} dx1
 * @param {Number} dy1
 * @param {Number} dx2
 * @param {Number} dy2
 */
Misc.Rect.prototype.adjust = function (dx1, dy1, dx2, dy2) {
  this.setLeft(this.left() + dx1);
  this.setTop(this.top() + dy1);
  this.setRight(this.right() + dx2);
  this.setBottom(this.bottom() + dy2);
};

/**
 *
 * @returns {Misc.Size} The size of the rectangle.
 */
Misc.Rect.prototype.size = function () {
  return new Misc.Size(this.width(), this.height());
};

/**
 * Sets the size of the rectangle to the given size. The top-left corner is not moved.
 * @param {Misc.Size} sz size
 */
Misc.Rect.prototype.setSize = function (sz) {
  this.setWidth(sz.width);
  this.setHeight(sz.height);
  //return new Misc.Size(this.width(), this.height());
};

/**
 * Sets the coordinates of the rectangle's top-left corner to (x, y), and its size to the given width and height.
 * @param {Number} x Left
 * @param {Number} y Top
 * @param {Number} width Width
 * @param {Number} height Height
 */
Misc.Rect.prototype.setRect = function (x, y, width, height) {
  //m_left = x;
  this.setLeft(x);
  // m_top = y;
  this.setTop(y);
  // m_width = width;
  this.setWidth(width);
  // m_height = height;
  this.setHeight(height);
  // m_right = m_left + m_width;
  // m_bottom = m_top + m_height;
};

/**
 *
 * @param {Misc.Rect} rect
 * @returns {Misc.Rect} The bounding rectangle of this rectangle and the given rectangle.
 */
Misc.Rect.prototype.united = function (rect) {
  return new Misc.Rect(
    Math.min(this.left(), rect.left()),
    Math.min(this.top(), rect.top()),
    Math.max(this.right(), rect.right()) - Math.min(this.left(), rect.left()),
    Math.max(this.bottom(), rect.bottom()) - Math.min(this.top(), rect.top())
  );
};

/**
 *
 * @returns {Misc.Rect} A normalized rectangle; i.e., a rectangle that has a non-negative width and height.
 */
Misc.Rect.prototype.normalized = function () {
  //normalize the rect.
  var rc = new Misc.Rect(this.left(), this.top(), this.width(), this.height());
  if (rc.width() < 0) {
    var temp = rc.right();
    rc.setRight(rc.left());
    rc.setLeft(temp);
  }
  if (this.height() < 0) {
    var temp = rc.bottom();
    rc.setBottom(rc.top());
    rc.setTop(temp);
  }
  return rc;
};

/**
 *
 * @returns {Misc.Rect} A modified Rect based on the values of this rectangle. The coordinates in the returned rectangle are rounded to the nearest integer.
 */
Misc.Rect.prototype.toRect = function () {
  return new Misc.Rect(
    Math.round(this.left()),
    Math.round(this.top()),
    Math.round(this.width()),
    Math.round(this.height())
  );
};

/**
 *
 * @returns {Misc.Point} The center point of the rectangle.
 */
Misc.Rect.prototype.center = function () {
  return new Misc.Point(
    0.5 * (this.left() + this.right()),
    0.5 * (this.top() + this.bottom())
  );
};

//Moves the rectangle, leaving the top-left corner at
//the given position. The rectangle's size is unchanged.

/**
 * Moves the rectangle, leaving the top-left corner at the given position. The rectangle's size is unchanged.
 * @param {Misc.Point} pt
 */
Misc.Rect.prototype.moveTopLeft = function (pt) {
  var w = this.width();
  var h = this.height();
  //m_left = pt.x;
  this.setLeft(pt.x);
  //m_top = pt.y;
  this.setTop(pt.y);
  //m_right = pt.x+m_width;
  this.setRight(pt.x + w);
  //m_bottom = pt.y+m_height;
  this.setBottom(pt.y + h);
};

/**
 * Moves the rectangle, leaving the bottom-right corner at the given position. The rectangle's size is unchanged.
 * @param {Misc.Point} pt
 */
Misc.Rect.prototype.moveBottomRight = function (pt) {
  var w = this.width();
  var h = this.height();
  // m_right = pt.x;
  this.setRight(pt.x);
  // m_bottom = pt.y;
  this.setBottom(pt.y);
  // m_left = pt.x-m_width
  this.setLeft(pt.x - w);
  // m_top = pt.y-m_height;
  this.setTop(pt.y - h);
};

/**
 * Moves the rectangle, leaving the center point at the given position. The rectangle's size is unchanged.
 * @param {Misc.Point} pt
 */
Misc.Rect.prototype.moveCenter = function (pt) {
  var w = this.width();
  var h = this.height();
  // m_right = pt.x + 0.5*m_width;
  this.setRight(pt.x + 0.5 * w);
  // m_bottom = pt.y+0.5*m_height;
  this.setBottom(pt.y + 0.5 * h);
  // m_left = pt.x-0.5*m_width;
  this.setLeft(pt.x - 0.5 * w);
  // m_top = pt.y-0.5*m_height;
  this.setTop(pt.y - 0.5 * h);
  return this; //for chaining
};

/**
 *
 * @param {Misc.Rect} rect
 * @returns {Boolean} true, if this rectangle intersects with the given rectangle (i.e., there is at least one pixel that is within both rectangles), otherwise returns false.
 */
Misc.Rect.prototype.intersects = function (rect) {
  // var bres =
  //   this.contains(rect.leftTop(), false) ||
  //   this.contains(rect.rightTop(), false) ||
  //   this.contains(rect.leftBottom(), false) ||
  //   this.contains(rect.rightBottom(), false);
  // var bres1 =
  //   rect.contains(this.leftTop(), false) ||
  //   rect.contains(this.rightTop(), false) ||
  //   rect.contains(this.leftBottom(), false) ||
  //   rect.contains(this.rightBottom(), false);
  // return bres || bres1;

  var xmin = Math.max(this.left(), rect.left());
  var xmax1 = this.left() + this.width();
  var xmax2 = rect.left() + rect.width();
  var xmax = Math.min(xmax1, xmax2);

  if (xmax > xmin) {
    var ymin = Math.max(this.top(), rect.top());
    var ymax1 = this.top() + this.height();
    var ymax2 = rect.top() + rect.height();
    var ymax = Math.min(ymax1, ymax2);
    if (ymax >= ymin) {
      return true;
    }
  }
  return false;
};

/**
 *
 * @param {Misc.Rect} rect
 * @returns {Misc.Rect} The intersection of this rectangle and the given rectangle.
 */
Misc.Rect.prototype.intersected = function (rect) {
  if (
    rect.contains(new Misc.Point(this.left(), this.top()), false) ||
    rect.contains(new Misc.Point(this.right(), this.top()), false) ||
    rect.contains(new Misc.Point(this.right(), this.bottom()), false) ||
    rect.contains(new Misc.Point(this.left(), this.bottom()), false) ||
    this.contains(new Misc.Point(rect.left(), rect.top()), false) ||
    this.contains(new Misc.Point(rect.right(), rect.top()), false) ||
    this.contains(new Misc.Point(rect.right(), rect.bottom()), false) ||
    this.contains(new Misc.Point(rect.left(), rect.bottom()), false)
  ) {
    var left = Math.max(this.left(), rect.left());
    var top = Math.max(this.top(), rect.top());
    var width = Math.min(this.right() - left, rect.right() - left);
    var height = Math.min(this.bottom() - top, rect.bottom() - top);
    return new Misc.Rect(left, top, width, height);
  }
  return new Misc.Rect();
};

/**
 *
 * @param {Number} left
 * @param {Number} top
 * @param {Number} right
 * @param {Number} bottom
 * @returns {Misc.Rect} A new rectangle with left, top, right and bottom added respectively to the existing coordinates of this rectangle.
 */
Misc.Rect.prototype.adjusted = function (left, top, right, bottom) {
  var pt1 = new Misc.Point(this.left() + left, this.top() + top);
  var pt2 = new Misc.Point(this.right() + right, this.bottom() + bottom);
  return new Misc.Rect(pt1, pt2);
};

/**
 *
 * @param {Misc.Point} pt
 * @param {Boolean} proper
 * @returns {Boolean} true, if the given point is inside or on the edge of the rectangle, otherwise
 * returns false. If proper is true, this function only returns true if the given point is inside the rectangle (i.e., not on the edge).
 */
Misc.Rect.prototype.contains = function (pt, proper) {
  if (typeof proper === "undefined" || proper === true)
    return (
      pt.x > this.left() &&
      pt.y > this.top() &&
      pt.x < this.right() &&
      pt.y < this.bottom()
    );
  else
    return (
      pt.x >= this.left() &&
      pt.y >= this.top() &&
      pt.x <= this.right() &&
      pt.y <= this.bottom()
    );
};

/**
 *
 * @param {Misc.Rect} other
 * @returns {Boolean} true, if this rectangle is approximately equal to other rectangle, otherwise returns false.
 */
Misc.Rect.prototype.isEqual = function (other) {
  var otherPoint = new Misc.Point(other.left(), other.top());

  if (new Misc.Point(this.left(), this.top()).isEqual(otherPoint)) {
    var x = this.width() - other.width(),
      y = this.height() - other.height();
    return x * x + y * y < Misc.EPSILON;
  }
  return false;
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's top-left corner.
 */
Misc.Rect.prototype.leftTop = function () {
  return new Misc.Point(this.left(), this.top());
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's top-left corner.
 */
Misc.Rect.prototype.topLeft = function () {
  return this.leftTop();
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's top-right corner.
 */
Misc.Rect.prototype.rightTop = function () {
  return new Misc.Point(this.right(), this.top());
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's top-right corner.
 */
Misc.Rect.prototype.topRight = function () {
  return new Misc.Point(this.right(), this.top());
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's bottom-left corner.
 */
Misc.Rect.prototype.leftBottom = function () {
  return new Misc.Point(this.left(), this.bottom());
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's bottom-left corner.
 */
Misc.Rect.prototype.bottomLeft = function () {
  return this.rightBottom();
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's bottom-right corner.
 */
Misc.Rect.prototype.rightBottom = function () {
  return new Misc.Point(this.right(), this.bottom());
};

/**
 *
 * @returns {Misc.Point} The position of the rectangle's bottom-right corner.
 */
Misc.Rect.prototype.bottomRight = function () {
  return this.rightBottom();
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Rect.prototype.toString = function () {
  return (
    "[" +
    this.left() +
    ", " +
    this.top() +
    ", " +
    this.width() +
    ", " +
    this.height() +
    "]"
  );
};

/**
 * An empty rectangle has width() <= 0 or height() <= 0. An empty rectangle is not valid (i.e., isEmpty() == !isValid()).
 * @returns {Boolean} true, if the rectangle is empty, otherwise returns false.
 *
 *
 */
Misc.Rect.prototype.isEmpty = function () {
  return this.width() <= 0 || this.height() <= 0;
};

/**
 *
 * @returns {Number} The x-coordinate of the rectangle's left edge. Equivalent to left().
 */
Misc.Rect.prototype.x = function () {
  return this.left();
};

/**
 *
 * @returns {Number} The y-coordinate of the rectangle's left edge. Equivalent to left().
 */
Misc.Rect.prototype.y = function () {
  return this.top();
};

/* Constructs a polygon from the given rectangle. If closed is false, the polygon just contains the four points of 
the rectangle ordered clockwise, otherwise the polygon's fifth point is set to rectangle.topLeft().

Note that the bottom-right corner of the rectangle is located at (rectangle.x() + rectangle.width(), 
rectangle.y() + rectangle.height()). */

/**
 * @classdesc A Polygon object holds an Array<Misc.Point>. You add points to the polygon with the add method.
 *
 * Constructs a polygon from the given rectangle. If closed is false, the polygon just
 * contains the four points of the rectangle ordered clockwise, otherwise the polygon's
 * fifth point is set to rectangle.topLeft().
 *
 * Note that the bottom-right corner of the rectangle is located at (rectangle.x() + rectangle.width(), rectangle.y() + rectangle.height()).
 *
 * The constructor is overloaded. See example.
 * @constructor
 * @param {Misc.Rect} [rectangle] Rectangle
 * @param {Boolean} [closed] if true, close the polygon. Defaults to false.
 * @example
 * new Misc.Polygon(); //Creates an empty polygon
 * new Misc.Polygon(new Misc.Rect(1, 2, 40, 50)); //Creates a open polygon from the rectangle
 * new Misc.Polygon(new Misc.Rect(1, 2, 40, 50), true); //Creates a close polygon from the rectangle
 */
Misc.Polygon = function (/* const QRect & */ rectangle, /*  bool  */ closed) {
  this.points = [];
  if (rectangle == undefined) {
    return;
  }
  if (close == undefined) {
    close = false;
  }
  this.points.push(
    new Misc.Point(rectangle.left(), rectangle.top()),
    new Misc.Point(rectangle.right(), rectangle.top()),
    new Misc.Point(rectangle.right(), rectangle.bottom()),
    new Misc.Point(rectangle.left(), rectangle.bottom())
  );
  if (close) {
    this.points.push(new Misc.Point(rectangle.left(), rectangle.top()));
  }
};

/**
 * Adds a point to the polygon
 * @param {Misc.Point} pt Point to add
 */
Misc.Polygon.prototype.add = function (pt) {
  this.points.push(pt);
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Polygon.prototype.toString = function () {
  return "[Polygon]";
};

/**
 * @classdesc Specify the font face, font size, and color of text
 * @constructor
 * @param {number|object} th text height
 * @param {string} name font name
 * @param {string} style font style. Available styles are "normal", "italic", and "oblique". (This param is mostly used to specify italic text.)
 * @param {string | number} weight specify the font weight. Possible string values are "normal", "bold", "bolder" and "lighter". Possible number values are 100, 200, 300, 400, 500, 600, 700, 800, 900.
 * @param {string} color Set the color of text. The string provided should represent a valid html color.
 *
 */
Misc.Font = function (th, name, style, weight, color) {
  if (typeof th == "object") {
    this.th = th.th;
    this.name = th.name;
    this.style = th.style; //normal italic or oblique
    this.weight = th.weight; //normal lighter or bold or 100, 200, ...900
    this.fontColor = th.fontColor;
  } else {
    this.th = 12;
    this.name = "Arial";
    this.style = "normal"; //normal italic or oblique
    this.weight = "normal"; //normal lighter or bold or 100, 200, ...900
    this.fontColor = "black";
  }
  if (typeof th != "object") {
    if (typeof color !== "undefined") this.fontColor = color;
    if (typeof weight !== "undefined") this.weight = weight;
    if (typeof style !== "undefined") this.style = style;
    if (typeof name !== "undefined") this.name = name;
    if (typeof th !== "undefined") this.th = th;
  }
};

/**
 * Calculate the width and height of the text drawn with this Font and return it as a Misc.Size object.
 * @param {String} str text
 * @returns {Misc.Size} text size
 */
Misc.Font.prototype.textSize = function (str) {
  if (str == "" || typeof str == "undefined") return new Misc.Size(0, 0);
  var canvas = $("<canvas />");
  var context = canvas[0].getContext("2d");
  context.font =
    this.weight + " " + this.style + " " + this.th + "px " + this.name;

  var w = context.measureText(str).width * 1.16;
  var h = context.measureText("M").width;
  canvas.remove();
  return new Misc.Size(w, h);
};

/**
 *
 * @returns A string representing the object.
.
 */
Misc.Font.prototype.toString = function () {
  return (
    "[th:" +
    this.th +
    ", name:" +
    this.name +
    ", style:" +
    this.style +
    ", weight:" +
    this.weight +
    ", color:" +
    this.fontColor +
    "]"
  );
};

/**
 * Check fonts for equality.
 * @param {Misc.Font} otherFont font
 * @returns {Boolean} true, if otherFont is equal to this font
 */
Misc.Font.prototype.isEqual = function (otherFont) {
  return this.toString() == otherFont.toString();
};

/**
 * @classdesc MPathElement is use to define a MPath.
 *
 * Possible element types are:
 * - Misc.MoveToElement
 * - Misc.LineToElement
 * - Misc.CurveToElement
 * - Misc.CurveToDataElement
 * @constructor
 * @param {Number} [elementType]
 * @param {Number} [xVal]
 * @param {Number} [yVal]
 *
 */
Misc.MPathElement = function (elementType, xVal, yVal) {
  this.type = Misc.MoveToElement;
  this.x = 0.0;
  this.y = 0.0;
  if (typeof xVal !== "undefined") this.x = xVal;
  if (typeof yVal !== "undefined") this.y = yVal;
  if (typeof elementType !== "undefined") this.type = elementType;
};

/**
 *
 * @returns A string representing the object.
 */
Misc.MPathElement.prototype.toString = function () {
  return (
    "[MPathElement: type(" +
    this.type +
    "), point" +
    new Misc.Point(this.x, this.y) +
    "]"
  );
};

/**
 * @classdesc MPath is use to define a SVG Path.
 * @constructor
 */
Misc.MPath = function () {
  var m_elements = [];
  this.data = {}; //useful for passing any data in path

  /**
   *
   * @returns {Array<Misc.MPathElement>} List of elements defining the path
   */
  this.elements = function () {
    return m_elements;
  };
};

/**
 *
 * @returns {Number} Number of MPathElement in the path
 */
Misc.MPath.prototype.elementCount = function () {
  return this.elements().length;
};

/**
 *
 * @param {Number} index Index
 * @returns {Misc.MPathElement} element at index
 */
Misc.MPath.prototype.elementAt = function (index) {
  if (index < 0 || index >= this.elements().length) return null;
  return this.elements()[index];
};

/**
 * Adds a MoveToElement to the path
 * @param {Number} x x - coordinate
 * @param {Number} y y - coordinate
 */
Misc.MPath.prototype.moveTo = function (x, y) {
  this.elements().push(new Misc.MPathElement(Misc.MoveToElement, x, y));
};

/**
 * Adds a LineToElement to the path
 * @param {Number} x x - coordinate
 * @param {Number} y y - coordinate
 */
Misc.MPath.prototype.lineTo = function (x, y) {
  this.elements().push(new Misc.MPathElement(Misc.LineToElement, x, y));
};

/**
 * Builds a cubic curve for the path from three Misc.CurveToElement using (x, y), (x1, y1) and (x2, y2).
 * @param {Number} x x - coordinate
 * @param {Number} y y - coordinate
 * @param {Number} x1 x - coordinate
 * @param {Number} y1 y - coordinate
 * @param {Number} x2 x - coordinate
 * @param {Number} y2 y - coordinate
 */
Misc.MPath.prototype.cubicTo = function (x, y, x1, y1, x2, y2) {
  var els = this.elements();
  els.push(new Misc.MPathElement(Misc.CurveToElement, x, y));
  els.push(new Misc.MPathElement(Misc.CurveToElement, x1, y1));
  els.push(new Misc.MPathElement(Misc.CurveToElement, x2, y2));
};

/**
 *
 * @returns A string representing the object.
 */
Misc.MPath.prototype.toString = function () {
  var s = "[MPath: elementCount = " + this.elements().length + "]";
  return s;
};

/**
 *
 * @returns {Boolean} true, if the path does not have a MPathElement
 */
Misc.MPath.prototype.isEmpty = function () {
  return this.elements().length == 0 ? true : false;
};

/**
 * Adds a rectangle to the path
 * @param {Misc.Rect} rect Rect
 */
Misc.MPath.prototype.addRect = function (rect) {
  var els = this.elements();
  els.push(new Misc.MPathElement(Misc.MoveToElement, rect.left(), rect.top()));
  els.push(new Misc.MPathElement(Misc.LineToElement, rect.right(), rect.top()));
  els.push(
    new Misc.MPathElement(Misc.LineToElement, rect.right(), rect.bottom())
  );
  els.push(
    new Misc.MPathElement(Misc.LineToElement, rect.left(), rect.bottom())
  );
  els.push(new Misc.MPathElement(Misc.LineToElement, rect.left(), rect.top()));
};

/**
 * Adds a polygon to the path
 * @param {Misc.Polygon} rect Rect
 */
Misc.MPath.prototype.addPolygon = function (polygon) {
  if (!polygon || !polygon.length) return;
  this.elements().push(
    new Misc.MPathElement(Misc.MoveToElement, polygon[0].x, polygon[0].y)
  );
  for (var i = 1; i < polygon.length; ++i) {
    this.elements().push(
      new Misc.MPathElement(Misc.LineToElement, polygon[i].x, polygon[i].y)
    );
  }
};

/**
 * Adds a MPathElement to the path
 * @param {MPathElement} pathElement
 */
Misc.MPath.prototype.addPathElement = function (pathElement) {
  this.elements().push(pathElement);
};

/**
 *
 * @returns {Misc.Rect} Bounding rectagle of the path
 */
Misc.MPath.prototype.boundingRect = function () {
  var pts = [];

  var left = 0;
  var top = 0;
  var right = 0;
  var bottom = 0;
  var firstPass = false;

  for (var i = 0; i < this.elements().length; i++) {
    var element = this.elements()[i];

    switch (element.type) {
      case Misc.LineToElement:
      case Misc.MoveToElement:
      case Misc.CurveToElement: {
        if (!firstPass) {
          left = element.x;
          top = element.y;
          right = element.x;
          bottom = element.y;
          firstPass = true;
        }
        left = Math.min(left, element.x);
        right = Math.max(right, element.x);
        top = Math.min(top, element.y);
        bottom = Math.max(bottom, element.y);
        break;
      }
      case Misc.CurveToDataElement: {
        break;
      }
    }
  }

  if (this.data.rotation == undefined || this.data.rotation == 0) {
    return new Misc.Rect(left, top, right - left, bottom - top);
  }

  let theta = this.data.rotation;

  theta = (theta * Math.PI) / 180; //in radians

  let w = right - left;
  let h = bottom - top;

  let newHeight = Math.abs(w * Math.sin(theta)) + Math.abs(h * Math.cos(theta));

  let newWidth = Math.abs(h * Math.sin(theta)) + Math.abs(w * Math.cos(theta));
  return new Misc.Rect(
    left - (newWidth - w) / 2,
    top - (newHeight - h) / 2,
    newWidth,
    newHeight
  );
};
