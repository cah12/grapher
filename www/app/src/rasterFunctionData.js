"include ['rasterData']";
"use strict";

class RasterFunctionData extends RasterData {
  constructor(functionData) {
    super();
    var fn = functionData.fx;
    fn = fn
      .replaceAll(functionData.variable, "_x")
      .replaceAll(functionData.variableY, "_y");

    // this.parser = new EvaluateExp(fn);
    // if (this.parser.error) {
    //   Utility.alert(this.parser.errorMessage);
    //   return null;
    // }

    try {
      this.code1 = math.compile(fn);
    } catch (error) {
      Utility.alert(error);
    }

    this.minX = functionData.minX;
    this.maxX = functionData.maxX;
    this.minY = functionData.minY;
    this.maxY = functionData.maxY;
    this.setInterval(Static.XAxis, new Interval(this.minX, this.maxX));
    this.setInterval(Static.YAxis, new Interval(this.minY, this.maxY));
    this.setInterval(
      Static.ZAxis,
      new Interval(functionData.minZ, functionData.maxZ)
    );

    this.map = new Map(); 
   }

  value(x, y) {
    //prevent out-of-range
    if (x >= this.maxX) x = this.maxX;
    if (x < this.minX) x = this.minX;
    if (y >= this.maxY) y = this.maxY;
    if (y < this.minY) y = this.minY;

    this.map.set("_x", x)
    this.map.set("_y", y)

    
    return this.code1.evaluate(this.map);
  }
}
//982
//750