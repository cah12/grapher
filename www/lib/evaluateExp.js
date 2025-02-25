/**
 * A class for evaluating an expression. See example
 *
 * This class uses Math.js
 * @example
 * const evalExp = new EvaluateExp("x^2");
 * console.log(evalExp.eval({x: 2})); // output: 4
 *
 * const cb = function(exp){
 *    return exp.replace("ahh", "10")
 * }
 *
 * const evalExp2 = new EvaluateExp("x^2 + ahh", cb);//The callback modifies the expression string to "x^2 + 10".
 * console.log(evalExp2.eval({x: 2})); //output: 14
 */
class EvaluateExp {
  /**
   * Creates an EvaluateExp instance.
   * @param {String} expStr expression
   * @param {Function} [modifyCb] optional callback that may modify the expression in some way
   */
  constructor(expStr, modifyCb) {
    var self = this;
    var m_expStr = expStr;
    var f;
    var simplified;
    this.error = false;
    var self = this;

    var expandDefines = function (m_expStr) {
      return m_expStr;
    };

    if (modifyCb) expandDefines = modifyCb;

    function init() {
      var expanded = expandDefines(m_expStr).replaceAll("mod", " mod ");
      try {
        simplified = math.compile(expanded);
        // if (!m_expStr.includes("log"))
        //   simplified = math.simplify(
        //     simplified.toString(),
        //     {},
        //     { exactFractions: false }
        //   );
        //simplified = math.compile(simplified);
      } catch (err) {
        // var charPos = parseInt(err.message.match(/(\d+)/)[0]);
        // alert("Invalid character in function: " + expanded[charPos - 1]);
        self.error = true;
        return;
      }
      // if (!m_expStr.includes("log") && simplified) {
      //   //Replace the whitespace delimiters stripped out by simplify()
      //   simplified = math.parse(simplified.replaceAll("mod", " mod "));
      //   simplified = simplified.compile();
      // }
    }

    if (m_expStr && m_expStr.length > 0) {
      //if (m_expStr !== undefined && m_expStr.length > 0) {
      m_expStr = Utility.logBaseAdjust(m_expStr);
      init();
    } else throw "Initialization of EvaluateExp failed.";

    /**
     * Change the expression being evaluated
     * @param {String} s expression
     */
    this.setExpString = function (s) {
      m_expStr = s;
      init();
    };

    /**
     *
     * @returns {String} The expression being evaluated
     */
    this.getExpString = function () {
      return m_expStr;
    };

    /**
     * Evaluates the expression against the scope
     * @param {object} obj scope (e.g. {x: 10})
     * @returns {Number} value
     */
    this.eval = function (obj) {
      this.error = false;
      try {
        return simplified.evaluate(obj);
        //if (val.im) val = val.im;
        //return val;
      } catch (err) {
        this.errorMessage = err.message;
        this.error = true;
        return 0;
      }
    };
  }
}
