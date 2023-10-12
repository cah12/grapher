"include ['pointData']";

class FunctionData extends SyntheticPointData {
  constructor(yCb, numOfPoints) {
    super(numOfPoints);
    this.discontinuitySamples = null;
    var d_y = yCb;
    var parser = new EvaluateExp(d_y);

    this.setFn = function (fn) {
      d_y = fn;
      parser.setExpString(d_y);
    };

    this.y = function (_x) {
      if (parser.error) return 0;
      return parser.eval({
        x: _x,
      });
    };
  }

  sample(index) {
    if (this.discontinuitySamples) {
      if (index >= this.discontinuitySamples.length)
        return new Misc.Point(0, 0);
      return this.discontinuitySamples[index];
    }

    return super.sample(index);
  }
}
