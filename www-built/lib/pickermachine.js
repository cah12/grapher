

/**
 * A state machine for Picker selections.
 *
 * PickerMachine accepts key and mouse events and translates them into selection commands.
 */
class PickerMachine {
  /**
   *
   * @param {PlotItem.SelectionType} type the selection type
   */
  constructor(type) {
    Static.Begin = 0;
    Static.Append = 1;
    Static.Move = 2;
    Static.Remove = 3;
    Static.End = 4;
    var d_selectionType = type;
    var d_state = 0;

    /**
     *
     * @returns {PlotItem.SelectionType} the selection type
     */
    this.selectionType = function () {
      return d_selectionType;
    };

    /**
     *
     * @returns {Number} the current state
     */
    this.state = function () {
      return d_state;
    };

    /**
     * Change the current state.
     * @param {Number} state New state
     */
    this.setState = function (/* int*/ state) {
      d_state = state;
    };

    /**
     * Set the current state to 0.
     */
    this.reset = function () {
      this.setState(0);
    };

    /**
     * Transition
     * @param {EventPattern} p pattern
     * @param {Event} e event
     */
    this.transition = function (p, e) {
      console.warn("Subclass must reimplement");
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerMachine]";
  }
}
/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link ClassName.SelectionType}</div>
 *
 * Type of a selection.
 * @name PickerMachine.SelectionType
 * @readonly
 * @property {Number} NoSelection             The state machine not usable for any type of selection.
 * @property {Number} PointSelection          The state machine is for selecting a single point.
 * @property {Number} RectSelection           The state machine is for selecting a rectangle (2 points).
 * @property {Number} PolygonSelection        The state machine is for selecting a polygon (many points).
 */
Enumerator.enum(
  "SelectionType { NoSelection = -1 , PointSelection , RectSelection , PolygonSelection }",
  PickerMachine
);

/**
 * A state machine for indicating mouse movements.
 * @extends PickerMachine
 */
class PickerTrackerMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.NoSelection);

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ p, /*const QEvent*/ e) {
      var cmdList = [];

      switch (e.type) {
        //case QEvent::Enter:
        //case QEvent::MouseMove:
        case "mouseenter":
        case "mousemove":
        case "touchmove": {
          if (this.state() == 0) {
            cmdList.push(Static.Begin);
            cmdList.push(Static.Append);
            this.setState(1);
          } else {
            cmdList.push(Static.Move);
          }
          break;
        }
        //case QEvent::Leave:
        case "mouseleave": {
          cmdList.push(Static.Remove);
          cmdList.push(Static.End);
          this.setState(0);
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerTrackerMachine]";
  }
}

/**
 * A state machine for point selections.
 * @extends PickerMachine
 */
class PickerClickPointMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.PointSelection);
    const Enum = Enumerator.getDefaultEnumNampespace();

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            cmdList.push(Static.Begin);
            cmdList.push(Static.Append);
            cmdList.push(Static.End);
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          var keyEvent = event;
          if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect1,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.End);
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerClickPointMachine]";
  }
}

/**
 * A state machine for point selections.
 * @extends PickerMachine
 */
class PickerDblClickPointMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.PointSelection);
    const Enum = Enumerator.getDefaultEnumNampespace();

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "dblclick":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            cmdList.push(Static.Begin);
            cmdList.push(Static.Append);
            cmdList.push(Static.End);
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          var keyEvent = event;
          if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect1,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.End);
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerDblClickPointMachine]";
  }
}

/**
 * A state machine for point selections.
 * @extends PickerMachine
 */
class PickerDragPointMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.PointSelection);

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              this.setState(1);
            }
          }
          break;
        }
        //case QEvent::MouseMove:
        case "mousemove":
        case "touchmove":
        //case QEvent::Wheel:
        case "mousewheel": {
          if (this.state() != 0) cmdList.push(Static.Move);
          break;
        }
        //case QEvent::MouseButtonRelease:
        case "mouseup":
        case "touchend": {
          if (this.state() != 0) {
            cmdList.push(Static.End);
            this.setState(0);
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          var keyEvent = event;
          if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect1,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              if (this.state() == 0) {
                cmdList.push(Static.Begin);
                cmdList.push(Static.Append);
                this.setState(1);
              } else {
                cmdList.push(Static.End);
                this.setState(0);
              }
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerDragPointMachine]";
  }
}

/**
 * A state machine for point selections.
 *
 * Pressing EventPattern.MousePatternCode.MouseSelect1 or EventPattern.KeyPatternCode.KeySelect1 selects a point.
 * @extends PickerMachine
 */
class PickerClickRectMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.RectSelection);

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            switch (this.state()) {
              case 0: {
                cmdList.push(Static.Begin);
                cmdList.push(Static.Append);
                this.setState(1);
                break;
              }
              case 1: {
                // Uh, strange we missed the MouseButtonRelease
                break;
              }
              default: {
                cmdList.push(Static.End);
                this.setState(0);
              }
            }
          }
          break;
        }
        //case QEvent::MouseMove:
        case "mousemove":
        case "touchmove":
        //case QEvent::Wheel:
        case "mousewheel": {
          if (this.state() != 0) cmdList.push(Static.Move);
          break;
        }
        //case QEvent::MouseButtonRelease:
        case "mouseup":
        case "touchend": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            if (this.state() == 1) {
              cmdList.push(Static.Append);
              this.setState(2);
            }
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          var keyEvent = event;
          if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect1,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              if (this.state() == 0) {
                cmdList.push(Static.Begin);
                cmdList.push(Static.Append);
                this.setState(1);
              } else {
                if (this.state() == 1) {
                  cmdList.push(Static.Append);
                  this.setState(2);
                } else if (this.state() == 2) {
                  cmdList.push(Static.End);
                  this.setState(0);
                }
              }
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerClickRectMachine]";
  }
}

/**
 * A state machine for rectangle selections.
 * @extends PickerMachine
 */
class PickerDragRectMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.RectSelection);

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            event.type == "touchstart" ||
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.Append);
              this.setState(2);
            }
          }
          break;
        }
        //case QEvent::MouseMove:
        case "mousemove":
        case "touchmove":
        //case QEvent::Wheel:
        case "mousewheel": {
          if (this.state() != 0) cmdList.push(Static.Move);
          break;
        }
        //case QEvent::MouseButtonRelease:
        case "mouseup":
        case "touchend": {
          if (this.state() == 2) {
            cmdList.push(Static.End);
            this.setState(0);
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          if (
            eventPattern.keyMatch(EventPattern.KeyPatternCode.KeySelect1, event)
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.Append);
              this.setState(2);
            } else {
              cmdList.push(Static.End);
              this.setState(0);
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerDragRectMachine]";
  }
}

/**
 * A state machine for polygon selections.
 * @extends PickerMachine
 */
class PickerPolygonMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.PolygonSelection);

    //Documented in base class
    this.transition = function (/*QwtEventPattern*/ eventPattern, event) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.Append);
              this.setState(1);
            } else {
              cmdList.push(Static.Append);
            }
          }
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect2,
              event
            )
          ) {
            if (this.state() == 1) {
              cmdList.push(Static.End);
              this.setState(0);
            }
          }
          break;
        }
        //case QEvent::MouseMove:
        case "mousemove":
        case "touchmove":
        //case QEvent::Wheel:
        case "mousewheel": {
          if (this.state() != 0) cmdList.push(Static.Move);
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          var keyEvent = event;
          if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect1,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              if (this.state() == 0) {
                cmdList.push(Static.Begin);
                cmdList.push(Static.Append);
                cmdList.push(Static.Append);
                this.setState(1);
              } else {
                cmdList.push(Static.Append);
              }
            }
          } else if (
            eventPattern.keyMatch(
              EventPattern.KeyPatternCode.KeySelect2,
              keyEvent
            )
          ) {
            //if ( !keyEvent->isAutoRepeat() )
            {
              if (this.state() == 1) {
                cmdList.push(Static.End);
                this.setState(0);
              }
            }
          }
          break;
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerPolygonMachine]";
  }
}

/**
 * A state machine for line selections.
 * @extends PickerMachine
 */
class PickerDragLineMachine extends PickerMachine {
  constructor() {
    super(PickerMachine.SelectionType.PolygonSelection);

    //Documented in base class
    this.transition = function transition(
      /*QwtEventPattern*/ eventPattern,
      event
    ) {
      var cmdList = [];

      switch (event.type) {
        //case QEvent::MouseButtonPress:
        case "mousedown":
        case "touchstart": {
          if (
            eventPattern.mouseMatch(
              EventPattern.MousePatternCode.MouseSelect1,
              event
            )
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.Append);
              this.setState(1);
            }
          }
          break;
        }
        //case QEvent::KeyPress:
        case "keydown": {
          if (
            eventPattern.keyMatch(EventPattern.KeyPatternCode.KeySelect1, event)
          ) {
            if (this.state() == 0) {
              cmdList.push(Static.Begin);
              cmdList.push(Static.Append);
              cmdList.push(Static.Append);
              this.setState(1);
            } else {
              cmdList.push(Static.End);
              this.setState(0);
            }
          }
          break;
        }
        //case QEvent::MouseMove:
        case "mousemove":
        case "touchmove":
        //case QEvent::Wheel:
        case "mousewheel": {
          if (this.state() != 0) cmdList.push(Static.Move);

          break;
        }
        //case QEvent::MouseButtonRelease:
        case "mouseup":
        case "touchend": {
          if (this.state() != 0) {
            cmdList.push(Static.End);
            this.setState(0);
          }
        }
        default:
          break;
      }

      return cmdList;
    };
  }

  /**
   *
   * @returns Returns a string representing the object.
   */
  toString() {
    return "[PickerDragLineMachine]";
  }
}
