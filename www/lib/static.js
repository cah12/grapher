"use strict";
/**
 * The Static namespace contains miscellaneous identifiers and a few utility methods used throughout the jsQwt library.
 *
 * @namespace
 *
 * @property {} <br><h5><b>Miscellaneous_Const_Values</b></h5>
 * @property {String} NoPen="noPen"                 The color use in the buildiong of a colorless{@link Misc.Pen Pen}
 * @property {String} NoBrush="noBrush"               The color use in the buildiong of a colorless{@link Misc.Brush Brush}
 * @property {Number} _eps=1.0e-300                 The smallest positive value (epsilon)
 * @property {} <br><h5><b>Keyboard_KeyCodes</b></h5>
 * @property {Number} Key_Escape=27                 Escape key pressed
 * @property {Number} Key_Plus=107                  Plus key pressed
 * @property {Number} Key_Minus=109                 Minus key pressed
 * @property {Number} Key_Ctrl=17                   Control key pressed
 * @property {Number} Key_Shift=16                  Shift key pressed
 * @property {Number} Key_Return=13                 Return key pressed
 * @property {Number} Key_Space=32                  Space bar pressed
 * @property {Number} Key_Left=37                   Left arror key pressed
 * @property {Number} Key_Right=39                  Right arrow key pressed
 * @property {Number} Key_Up=38                    Up arrow key pressed
 * @property {Number} Key_Down=40                   Down arrow key pressed
 * @property {Number} Key_Undo=90                   Undo key pressed
 * @property {Number} Key_Redo=89                   Redo key pressed
 * @property {Number} Key_Home=36                   Home key pressed
 * @property {Number} Key_I=73                      I key pressed
 * @property {Number} Key_O=79                      O key pressed
 * @property {Number} Key_unknown=-1                Unknown key pressed
 * @property {} <br><h5><b>Bitwise_Combinable_Modifier_Flags</b></h5> <br>Example<br>To detect shift-control keys combination, use:<br><b>ShiftModifier | ControlModifier</b>
 * @property {Number} NoModifier=0x00000000         No modifier flag              (No modifier key is pressed)
 * @property {Number} ShiftModifier=0x02000000      Shift modifier flag           (Shift key on the keyboard is pressed)
 * @property {Number} ControlModifier=0x04000000    Control modifier flag         (Ctrl key on the keyboard is pressed)
 * @property {Number} AltModifier=0x08000000        Alt modifier flag             (Alt key on the keyboard is pressed)
 * @property {} <br><h5><b>Bitwise_Combinable_Alignment_Flags</b></h5>
 * @property {Number} AlignRight=1                  Align right flag
 * @property {Number} AlignLeft=2                   Align left flag
 * @property {Number} AlignBottom=4                 Align bottom flag
 * @property {Number} AlignTop=8                    Align top flag
 * @property {Number} AlignCenter=16                Align center flag
 * @property {} <br><h5><b>Mouse_Button_Ids</b></h5>
 * @property {Number} NoButton=-1                   No mouse button pressed
 * @property {Number} LeftButton=0                  Left mouse button pressed
 * @property {Number} MidButton=1                   Middle mouse button pressed
 * @property {Number} RightButton=2                 Right mouse button pressed
 * @property {} <br><h5><b>Bitwise_Combinable_Orientation_Flags</b></h5>
 * @property {Number} Horizontal=1                  Oriented horizontaly
 * @property {Number} Vertical=2                    Oriented vertically
 */
var Static = {};

math.config({ epsilon: 1e-301 });

/*Returns a sub-vector which contains elements from this vector, starting at position pos. If length is -1 (the default), all elements after pos are included; otherwise length elements (or all remaining elements if there are less than length elements) are included. */
Array.prototype.mid = function (pos, length = -1) {
  if (length == -1) return this.slice(pos + 1);
  length = Math.max(length, 0);
  return this.slice(pos, pos + length);
};

String.prototype.replaceAt = function (idx, rem, str) {
  if (idx < 0) return this;
  //return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  return this.slice(0, idx) + str + this.slice(idx + rem.length);
};

String.prototype.insert = function (index, string) {
  if (index > 0) {
    return (
      this.substring(0, index) + string + this.substring(index, this.length)
    );
  }
  return string + this;
};

// String.prototype.replaceAt = function (index, replacement) {
//   return (
//     this.substring(0, index) +
//     replacement +
//     this.substring(index + replacement.length)
//   );
// };

Array.prototype.resize = function (newSize, init = undefined) {
  while (newSize > this.length) this.push(init);
};

Array.prototype.containsPoint = function (point) {
  var self = this;
  for (var i = 0; i < self.length; ++i) {
    if (self[i].isEqual(point)) return true;
  }
  return false;
};

Static.NoPen = "noPen";
Static.NoBrush = "noBrush";
Static._eps = 1.0e-300;

Static.Horizontal = 1;
Static.Vertical = 2;

Static.NoButton = -1;
Static.LeftButton = 0;
Static.MidButton = 1;
Static.RightButton = 2;

Static.Key_Escape = 27;
Static.Key_Plus = 107;
Static.Key_Minus = 109;
Static.Key_Ctrl = 17;
Static.Key_Shift = 16;
Static.Key_Return = 13;
Static.Key_Space = 32;
Static.Key_Left = 37;
Static.Key_Right = 39;
Static.Key_Up = 38;
Static.Key_Down = 40;
Static.Key_Undo = 90;
Static.Key_Redo = 89;
Static.Key_Home = 36;
Static.Key_I = 73;
Static.Key_O = 79;
Static.Key_unknown = -1;

/**
 * No modifier key pressed
 * @constant
 * @default [0x00000000]
 *
 */
Static.NoModifier = 0x00000000;
/**A Shift key on the keyboard is pressed.
 *
 * @constant
 * @default [0x02000000]
 *
 */
Static.ShiftModifier = 0x02000000;
/**
 * A Ctrl key on the keyboard is pressed.
 * @constant
 * @default  [0x04000000]
 */
Static.ControlModifier = 0x04000000; //
/**
 * An Alt key on the keyboard is pressed.
 * @constant
 * @default  [0x08000000]
 */
Static.AltModifier = 0x08000000;

Static.AlignRight = 1;
Static.AlignLeft = 2;
Static.AlignBottom = 4;
Static.AlignTop = 8;
Static.AlignCenter = 16;

/**
 * A function to execute when the event is triggered. The value false is also allowed as a shorthand
 * for a function that simply does return false.
 * @callback EventHandler
 * @param {Event} eventObject
 * @param {any} [extraParameter]
 * @param {...any} param
 * @returns {void}
 */

/**
 * Attach an event handler function for one or more events to the window element.
 * @param {string} events One or more space-separated event types and optional namespaces, such as "click" or "keydown.myPlugin".
 * @param {string} [selector] A selector string to filter the descendants of the selected elements that trigger the event. If the selector is null or omitted, the event is always triggered when it reaches the selected element.
 * @param {any} [data] Data to be passed to the handler in event.data when an event is triggered.
 * @param {EventHandler} handler A function to execute when the event is triggered. The value false is also allowed as a shorthand for a function that simply does return false.
 */
Static.bind = function (events, selector, data, handler) {
  $(window).off(events, selector, handler).on(events, selector, data, handler);
};

/**
 * Removes an event handler.
 * @param {string} events One or more space-separated event types and optional namespaces, or just namespaces, such as "click", "keydown.myPlugin", or ".myPlugin".
 * @param {string} [selector] A selector which should match the one originally passed to .on() when attaching event handlers.
 * @param {EventHandler} [handler] A handler function previously attached for the event(s), or the special value false.
 */
Static.unbind = function (events, selector, handler) {
  $(window).off(events, selector, handler);
};

/**
 * Execute all handlers and behaviors attached to the window element for the given event type.
 * @param {string} events A string containing a JavaScript event type, such as click or submit.
 * @param {...any} param Additional parameters to pass along to the event handler.
 */
Static.trigger = function (events, param) {
  $(window).trigger(events, param);
};

Static.stopkeyPressPropagation = function (element) {
  element.keydown(function (event) {
    event.stopPropagation();
  });
};

Static.onHtmlElementResize = function (dom_elem, callback) {
  const resizeObserver = new ResizeObserver(() => callback());
  resizeObserver.observe(dom_elem);
};

/**
 *
 * @returns {boolean} true / false
 */
Static.isMobile = function () {
  return (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(
      navigator.userAgent || navigator.vendor || window.opera
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      (navigator.userAgent || navigator.vendor || window.opera).substr(0, 4)
    )
  );
};

Static.trigKeywords = [
  "asinh",
  "acosh",
  "atanh",
  "acoth",
  "asech",
  "acsch",
  "asin",
  "acos",
  "atan",
  "acot",
  "asec",
  "acsc",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "sech",
  "csch",
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
];

Static.keywords = [
  "unaryMinus",
  "sqrt",
  "nthRoot",
  "asinh",
  "acosh",
  "atanh",
  "acoth",
  "asech",
  "acsch",
  "asin",
  "acos",
  "atan",
  "acot",
  "asec",
  "acsc",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "sech",
  "csch",
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "ln",
  "log",
  // "log2",
  // "log3",
  // "log4",
  // "log5",
  // "log6",
  // "log7",
  // "log8",
  // "log9",
  // "log10",
  "deg",
  "pi",
  "PI",
  "e",
  // "E",
  "abs",
  "mod",
  "U",
]; //"deg" comes before "e", deliberately.

///Prevent default right click menu
$("body").on("contextmenu", function (e) {
  e.preventDefault();
});

Static.enableRightClickLight = function (el) {
  el.addEventListener("contextmenu", Static.bringBackDefault, true);
};

Static.bringBackDefault = function (event) {
  event.returnValue = true;
  typeof event.stopPropagation === "function" && event.stopPropagation();
  typeof event.cancelBubble === "function" && event.cancelBubble();
};

Static.enableContextMenu = function (el) {
  void (el.ondragstart = null);
  void (el.onselectstart = null);
  void (el.onclick = null);
  void (el.onmousedown = null);
  void (el.onmouseup = null);
  void (el.oncontextmenu = null);
  Static.enableRightClickLight(el);
};

Static.dicontinuityFactor = 1e6;
Static.dicontinuityOffsetFactor = 2 / Static.dicontinuityFactor; //8e6;

Static.negativeRoot = true;
Static.aspectRatioOneToOne = false;

Static.swapAxes = 0; //0 == Implict, 1==Do not swap and 2 == swap

Static.uniqueParameter = false;

Static.animationDuration_Moderate = 4000;
Static.animationDuration_Slow = Static.animationDuration_Moderate * 2;
Static.animationDuration_Fast = Static.animationDuration_Moderate / 2;
Static.animationDuration = Static.animationDuration_Moderate;

Static.theoreticalPixelSize = 2; //default

Static.dicontinuityUserSetting = false;

Static.userDecimalPlacesForCalculation = false;

Static.showTooltipLegend = true;

//Change types used in steps (working)
Static.operation = 0;
Static.constructEquation = 1;
Static.rearrangeEquation = 2;
Static.solveEquation = 3;

////////////////////////////////////////////////

const originalParse = math.parse;
const originalSimplify = math.simplify;

Static.isAlpha = function (ch) {
  ch = ch.toLowerCase().charCodeAt(0);
  return ch > 96 && ch < 122;
};

function reduceMultiplyByZero(str) {
  if (!str && !str.length) {
    return str;
  }
  if (typeof str !== "string") {
    return str;
  }
  //remove white space
  str = str.replace(/\s/g, "");

  //insert * between 0 followed by alpha eg 0x
  if (str) {
    let m_str = "";
    for (let i = 1; i < str.length; i++) {
      const c = str[i - 1];
      m_str += c;
      if (c === "0" && Static.isAlpha(str[i])) {
        m_str += "*";
      }
    }
    m_str += str[str.length - 1];
    str = m_str;
  }

  let m_str = str.slice();
  const node = originalParse(str);
  if (node.type === "OperatorNode" && node.op === "*") {
    const [leftArg, rightArg] = node.args;
    if (leftArg.value && leftArg.value === 0) {
      const stringToReplace = `${leftArg.value}*${rightArg.name}`;
      m_str = m_str.replace(stringToReplace, "0");
    }
    //console.log(leftArg, rightArg);
  }

  node.forEach(function (node, path, parent) {
    if (node.type === "OperatorNode" && node.op === "*") {
      const [leftArg, rightArg] = node.args;
      if (leftArg.value && leftArg.value === 0) {
        const stringToReplace = `${leftArg.value}*${rightArg.name}`;
        m_str = m_str.replace(stringToReplace, "0");
      }
      //console.log(leftArg, rightArg);
    }
    //console.log(node.toString());
  });
  return m_str;
}

const customParse = function (str) {
  if (typeof str !== "string") {
    return str;
  }
  return originalParse(reduceMultiplyByZero(str));
};

const customSimplify = function (str, scope, options) {
  if (str && str.im) return str;
  scope = scope || {};
  options = options || { exactFractions: false };
  // options.exactFractions = true;
  if (typeof str !== "string") str = str.toString();
  return originalSimplify(reduceMultiplyByZero(str), scope, options);
};

math.parse = customParse;
math.simplify = customSimplify;

const originalDerivative = math.derivative;

math.derivative = function (str, variable, options) {
  //console.log(456, str);
  if (typeof str === "string") str = str.replaceAll("ln", "log");
  //console.log(457, str);
  // math.simplify = originalSimplify;
  let result = originalDerivative(str, variable, { simplify: false });
  if (!options) {
    result = originalSimplify(result.toString());
  }
  return result;
};

Static.errorMessage = "";

Static.accuracyFactorModerate = 1; //moderate

// const registry = new FinalizationRegistry((message) => console.log(message));

// function example() {
//   const x = {};
//   registry.register(x, "x has been collected");
// }

// example();

const customPow = function (num, pow) {
  const rd = Math.round(pow);

  if (pow - rd !== 0 && math.abs(pow - rd) < 1) {
    const p = 1 / pow;
    if (p % 2 !== 0) {
      const sign = math.sign(num);
      return Math.pow(math.abs(num), pow) * sign;
    }
  }

  return originalPow(num, pow);
};

const originalPow = math.pow;
math.pow = customPow;

/////////easy-grapher.herokuapp.com//////////////
Static.imagePath = "images/";
Static.grapherHelp = "";
//////////////////////////////////////

////////////https://simplegrapher.onrender.com///////////////
Static.imagePath = "../static/images/"; //for SimpleGrapher in python
Static.grapherHelp = "../static/"; //for SimpleGrapher in python

Static.solveFor = function (exp, v, indepVar = "x") {
  Utility.progressWait();
  // exp = Utility.insertProductSign(exp, indepVar);
  if (exp.indexOf("=") != -1) {
    const arr = exp.split("=");
    let lhs;
    try {
      lhs = math.evaluate(arr[0]).toString();
    } catch (error) {
      lhs = arr[0];
    }
    let rhs;
    try {
      rhs = math.evaluate(arr[1]).toString();
    } catch (error) {
      rhs = arr[1];
    }
    exp = `${lhs}=${rhs}`;
  }

  if (Static.imagePath === "images/") {
    // console.log("Static.solveFor()");

    let eq = nerdamer(exp);
    //console.log(eq.toString());
    let solution = eq.solveFor(v);
    nerdamer.clear("all");
    nerdamer.flush();
    if (typeof solution != "object") {
      Utility.progressWait(false);
      return [solution.toString()];
    }
    const result = [];
    if (Array.isArray(solution)) {
      for (let i = 0; i < solution.length; i++) {
        const sln = solution[i].toString();
        if (sln.indexOf("i") == -1 /*  && sln.indexOf("abs") == -1 */) {
          result.push(solution[i].toString().replaceAll("abs", ""));
        }
      }
    } else {
      result.push(solution.toString().replaceAll("abs", ""));
    }
    Utility.progressWait(false);
    return result;
  } else {
    Utility.progressWait(false);

    // const arr = exp.split("=");
    // exp = math.simplify(arr[0], {exactFractions:true}).toString();
    // let right = null;
    // if (arr.length == 2) {
    //   right = math.simplify(arr[1], {exactFractions:true}).toString();
    //   exp = `${exp}=${right}`;
    // }

    // exp = nerdamer(exp).toString();
    // nerdamer.clear();
    exp = Utility.insertProductSign(exp, indepVar);
    return solve_for(exp, v);
  }
};
