"include ['rasterData']";


class RasterFileData extends RasterData {
  constructor(fileData) {
    RasterFileData.InterpolationType = { cubic: 0, linear: 1 };
    super();
    this._interpolationType = RasterFileData.InterpolationType.linear;
    var arr = fileData.array;
    this.samples3D = [];
    var columnX;

    var columnLen = 0,
      i,
      n = arr.length;
    for (i = 0; i < n; i++) {
      if (i == 0) {
        columnX = arr[i].x;
        columnLen++;
        continue;
      }
      if (columnX === arr[i].x) {
        columnLen++;
      } else {
        break;
      }
    }
    this.samples3D = _.chunk(arr, columnLen);

    this.minX = this.samples3D[0][0].x;
    this.maxX = this.samples3D[this.samples3D.length - 1][0].x;
    var col0 = this.samples3D[0];
    this.minY = col0[0].y;
    this.maxY = col0[col0.length - 1].y;
    this.setInterval(Static.XAxis, new Interval(this.minX, this.maxX));
    this.setInterval(Static.YAxis, new Interval(this.minY, this.maxY));
    this.setInterval(Static.ZAxis, new Interval(fileData.minZ, fileData.maxZ));
  }

  interpolaionType() {
    return this._interpolationType;
  }

  setInterpolaionType(type) {
    if (
      type < RasterFileData.InterpolationType.cubic ||
      type > RasterFileData.InterpolationType.linear
    )
      return;
    this._interpolationType = type;
  }

  value(x, y) {
    //prevent out-of-range
    if (x > this.maxX) x = this.maxX;
    if (x < this.minX) x = this.minX;
    if (y > this.maxY) y = this.maxY;
    if (y < this.minY) y = this.minY;

    if (this.interpolaionType() == RasterFileData.InterpolationType.cubic)
      return Utility.bicubicInterpolate(this.samples3D, x, y);
    else if (this.interpolaionType() == RasterFileData.InterpolationType.linear)
      return Utility.bilinearInterpolate(this.samples3D, x, y);
  }
}

Enumerator.enum("InterpolationType {cubic, linear}", RasterFileData);
