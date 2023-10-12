"use strict";

class MousePattern {
  constructor(btn, modifierCodes) {
    this.button = Static.NoButton;
    this.modifiers = Static.NoModifier;
    if (btn !== undefined) {
      this.button = btn;
    }
    if (modifierCodes !== undefined) {
      this.modifiers = modifierCodes;
    }
  }
}

//! A pattern for key events
class KeyPattern {
  constructor(keyCode, modifierCodes) {
    this.key = Static.Key_unknown;
    this.modifiers = Static.NoModifier;
    if (keyCode !== undefined) {
      this.key = keyCode;
    }
    if (modifierCodes !== undefined) {
      this.modifiers = modifierCodes;
    }
  }
}

/**
 * A collection of event patterns.
 *
 * EventPattern introduces a level of indirection for mouse and keyboard inputs. Those are represented by symbolic names, so the application code can be configured by individual mappings.
 *
 */
class EventPattern extends HObject {
  constructor(parent) {
    super(parent);
    const self = this;

    const MouseSelect1 = EventPattern.MousePatternCode.MouseSelect1;
    const MouseSelect2 = EventPattern.MousePatternCode.MouseSelect2;
    const MouseSelect3 = EventPattern.MousePatternCode.MouseSelect3;
    const MouseSelect4 = EventPattern.MousePatternCode.MouseSelect4;
    const MouseSelect5 = EventPattern.MousePatternCode.MouseSelect5;
    const MouseSelect6 = EventPattern.MousePatternCode.MouseSelect6;
    const MousePatternCount = EventPattern.MousePatternCode.MousePatternCount;

    var d_mousePattern = [];
    var d_keyPattern = [];

    /**
     * Set default mouse patterns, depending on the number of mouse buttons
     * @param {Number} numButtons Number of mouse buttons ( <= 3 )
     * @see {@link EventPattern.MousePatternCode MousePatternCode}
     */
    this.initMousePattern = function (numButtons) {
      //d_mousePattern.resize( MousePatternCount );
      for (var i = 0; i < MousePatternCount; ++i)
        d_mousePattern.push(new MousePattern());
      //console.log(d_mousePattern)

      switch (numButtons) {
        case 1: {
          this.setMousePattern(MouseSelect1, Static.LeftButton);
          this.setMousePattern(
            MouseSelect2,
            Static.LeftButton,
            Static.ControlModifier
          );
          this.setMousePattern(
            MouseSelect3,
            Static.LeftButton,
            Static.AltModifier
          );
          break;
        }
        case 2: {
          this.setMousePattern(MouseSelect1, Static.LeftButton);
          this.setMousePattern(MouseSelect2, Static.RightButton);
          this.setMousePattern(
            MouseSelect3,
            Static.LeftButton,
            Static.AltModifier
          );
          break;
        }
        default: {
          this.setMousePattern(MouseSelect1, Static.LeftButton);
          this.setMousePattern(MouseSelect2, Static.RightButton);
          this.setMousePattern(MouseSelect3, Static.MidButton);
        }
      }
      //console.log(d_mousePattern)
      this.setMousePattern(
        MouseSelect4,
        d_mousePattern[MouseSelect1].button,
        d_mousePattern[MouseSelect1].modifiers | Static.ShiftModifier
      );

      this.setMousePattern(
        MouseSelect5,
        d_mousePattern[MouseSelect2].button,
        d_mousePattern[MouseSelect2].modifiers | Static.ShiftModifier
      );

      this.setMousePattern(
        MouseSelect6,
        d_mousePattern[MouseSelect3].button,
        d_mousePattern[MouseSelect3].modifiers | Static.ShiftModifier
      );
    };

    /**
     * Set default key patterns
     * @see {@link EventPattern.KeyPatternCode KeyPatternCode}
     */
    this.initKeyPattern = function () {
      //d_keyPattern.resize( KeyPatternCount );
      for (var i = 0; i < EventPattern.KeyPatternCode.KeyPatternCount; ++i)
        d_keyPattern.push(new KeyPattern());

      this.setKeyPattern(
        EventPattern.KeyPatternCode.KeySelect1,
        Static.Key_Return
      );
      this.setKeyPattern(
        EventPattern.KeyPatternCode.KeySelect2,
        Static.Key_Space
      );
      this.setKeyPattern(
        EventPattern.KeyPatternCode.KeyAbort,
        Static.Key_Escape
      );

      this.setKeyPattern(EventPattern.KeyPatternCode.KeyLeft, Static.Key_Left);
      this.setKeyPattern(
        EventPattern.KeyPatternCode.KeyRight,
        Static.Key_Right
      );
      this.setKeyPattern(EventPattern.KeyPatternCode.KeyUp, Static.Key_Up);
      this.setKeyPattern(EventPattern.KeyPatternCode.KeyDown, Static.Key_Down);

      this.setKeyPattern(EventPattern.KeyPatternCode.KeyRedo, Static.Key_Plus);
      this.setKeyPattern(EventPattern.KeyPatternCode.KeyUndo, Static.Key_Minus);
      this.setKeyPattern(
        EventPattern.KeyPatternCode.KeyHome,
        Static.Key_Escape
      );
    };

    /**
     * Change one mouse pattern
     * @param {EventPattern.MousePatternCode} pattern Index of the pattern
     * @param {Number} button Button
     * @param {Number} modifiers=Static.NoModifier Keyboard modifiers
     */
    this.setMousePattern = function (pattern, button, modifiers) {
      if (button == undefined) {
        d_mousePattern = pattern;
      } else {
        if (modifiers == undefined) modifiers = Static.NoModifier;
        if (pattern >= 0 && pattern < MousePatternCount) {
          d_mousePattern[pattern].button = button;
          d_mousePattern[pattern].modifiers = modifiers;
        }
      }
    };

    /**
     * Change one key pattern
     * @param {EventPattern.KeyPatternCode} pattern Index of the pattern
     * @param {Number} key Key
     * @param {Number} modifiers Keyboard modifiers
     */
    this.setKeyPattern = function (pattern, key, modifiers) {
      if (key == undefined) {
        d_mousePattern = pattern;
      } else {
        if (modifiers == undefined) modifiers = Static.NoModifier;
        if (
          pattern >= 0 &&
          pattern < EventPattern.KeyPatternCode.KeyPatternCount
        ) {
          d_keyPattern[pattern].key = key;
          d_keyPattern[pattern].modifiers = modifiers;
        }
      }
    };

    /**
     * Compare a mouse event with an event pattern.
     *
     * A mouse event matches the pattern when both have the same button value and in the state value the same key flags(Qt::KeyButtonMask) are set.
     * @param {EventPattern.MousePatternCode} code Index of the event pattern
     * @param {Event} event Mouse event
     * @returns {Boolean} true if matches
     * @see {@link EventPattern#keyMatch keyMatch()}
     */
    this.mouseMatch = function (/*MousePatternCode*/ code, event) {
      if (code >= 0 && code < MousePatternCount)
        return mouseMatch2(d_mousePattern[code], event);

      return false;
    };

    const mouseMatch2 = function (pattern, event) {
      if (event == null) return false;
      return (
        pattern.button == Utility.button(event) &&
        pattern.modifiers == Utility.modifiers(event)
      );
    };

    /**
     *
     * @returns {Array<EventPattern.KeyPatternCode>} Key pattern
     */
    this.keyPattern = function () {
      return d_keyPattern;
    };

    /**
     *
     * @returns {Array<EventPattern.MousePatternCode>} Mouse pattern
     */
    this.mousePattern = function () {
      return d_mousePattern;
    };

    /**
     *
     * @param {Event} event Key event
     * @returns {Number} Key code
     */
    this.key = function (event) {
      if (event == null) return false;
      return event.keyCode;
    };

    /**
     * Compare a key event with an event pattern.
     * @param {EventPattern.KeyPatternCode} code Index of the event pattern
     * @param {Event} event Key event
     * @returns {Boolean} true if matches
     * @see {@link EventPattern#mouseMatch mouseMatch()}
     */
    this.keyMatch = function (/*KeyPatternCode*/ code, event) {
      if (code >= 0 && code < EventPattern.KeyPatternCode.KeyPatternCount)
        return keyMatch2(d_keyPattern[code], event);

      return false;
    };

    const keyMatch2 = function (/*KeyPattern*/ pattern, event) {
      if (event == null) return false;

      //const KeyPattern keyPattern( event->key(), event->modifiers() );
      //return keyPattern == pattern;
      return (
        pattern.key == self.key(event) &&
        pattern.modifiers == Utility.modifiers(event)
      );
    };

    this.initKeyPattern();
    this.initMousePattern(3);
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link EventPattern.KeyPatternCode}</div>
 *
 * Symbolic keyboard input codes.
 * @name EventPattern.KeyPatternCode
 * @readonly
 * @property {Number} KeySelect1                Static.Key_Return.
 * @property {Number} KeySelect2                Static.Key_Space.
 * @property {Number} KeyAbort                  Static.Key_Escape.
 * @property {Number} KeyLeft                   Static.Key_Left.
 * @property {Number} KeyRight                  Static.Key_Right.
 * @property {Number} KeyUp                     Static.Key_Up.
 * @property {Number} KeyDown                   Static.Key_Down.
 * @property {Number} KeyRedo                   Static.Key_Plus.
 * @property {Number} KeyUndo                   Static.Key_Minus.
 * @property {Number} KeyHome                   Static.Key_Escape
 * @property {Number} KeyPatternCount           Number of key patterns.
 *
 */
Enumerator.enum(
  "KeyPatternCode {KeySelect1, KeySelect2, KeyAbort, KeyLeft, KeyRight, KeyUp, KeyDown, KeyRedo, KeyUndo, KeyHome, KeyPatternCount}",
  EventPattern
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link EventPattern.MousePatternCode}</div>
 *
 * Symbolic mouse input codes.
 * @name EventPattern.MousePatternCode
 * @readonly
 * @property {Number} MouseSelect1             The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton
 * - Static.LeftButton
 * - Static.LeftButton
 * @property {Number} MouseSelect2              The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton + Static.ControlModifier
 * - Static.RightButton
 * - Static.RightButton
 * @property {Number} MouseSelect3              The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton + Static.AltModifier
 * - Static.LeftButton + Static.AltModifier
 * - Static.MidButton
 * @property {Number} MouseSelect4              The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton + Static.ShiftModifier
 * - Static.LeftButton + Static.ShiftModifier
 * - Static.LeftButton + Static.ShiftModifier
 * @property {Number} MouseSelect5              The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton + Static.ControlButton | Static.ShiftModifier
 * - Static.RightButton + Static.ShiftModifier
 * - Static.RightButton + Static.ShiftModifier
 * @property {Number} MouseSelect6              The default setting for 1, 2 and 3 button mice is:
 * - Static.LeftButton + Static.AltModifier + Static.ShiftModifier
 * - Static.LeftButton + Static.AltModifier | Static.ShiftModifier
 * - Static.MidButton + Static.ShiftModifier
 * @property {Number} MousePatternCount         Number of mouse patterns.
 */
Enumerator.enum(
  "MousePatternCode {MouseSelect1, MouseSelect2, MouseSelect3, MouseSelect4, MouseSelect5, MouseSelect6, MousePatternCount}",
  EventPattern
);
