"use strict";

"include []";

//function Watch(rulerGroup, dependentRuler){
class Watch {
  constructor(rulerGroup, dependentRuler) {
    var self = this;
    this._dependentRuler = dependentRuler || MPicker.DisplayChange.NoRuler;
    this._rulerGroup = rulerGroup;
    var _enable = true;
    this._curveName = "";
    this._curve = null;
    this._rulerLeft = Number.MAX_VALUE;
    this._rulerRight = Number.MAX_VALUE;
    this._rulerBottom = Number.MAX_VALUE;
    this._rulerTop = Number.MAX_VALUE;
    this._value; //undefined
    this._magnifying = false;

    this._update = false;

    this._rulerLeftPrevious = Number.MAX_VALUE;
    this._rulerRightPrevious = Number.MAX_VALUE;

    //Forces re-computation of watches without a ruler position change.
    Static.bind("invalidateWatch", function () {
      self._rulerLeftPrevious = Number.MAX_VALUE;
      self._rulerRightPrevious = Number.MAX_VALUE;
    });

    // Static.bind("magnifyingStart", function () {
    //     //console.log("magnifyingStart");
    //     self._magnifying = true;
    // })

    Static.bind("magnifyingStart", function () {
      //console.log("magnifyingStart");
      self._magnifying = true;
    });

    // Static.bind("magnifyingEnd", function () {
    //     //console.log("magnifyingEnd");
    //     self._magnifying = false;
    //     Static.trigger("positionChanged");
    // })

    Static.bind("magnifyingEnd", function () {
      //console.log("magnifyingEnd");
      self._magnifying = false;
      Static.trigger("positionChanged");
    });

    //subclass reimplement
    this.name = function () {};
    //subclass reimplement
    this.computeWatch = function () {};
    this.value = function () {
      if (typeof this._value === "undefined") {
        return "0";
      }
      let value = this._value;
      if (this.valueType == "number") {
        value = parseFloat(this._value);
      }
      if (!Number.isNaN(value)) {
        return value;
      }

      return this._value;
    };

    this.setCurveName = function (curveName) {
      this._curveName = curveName;
    };
    this.setCurve = function (curve) {
      this._curve = curve;
    };
    this.setRulerLeft = function (val) {
      this._rulerLeft = val;
    };
    this.setRulerRight = function (val) {
      this._rulerRight = val;
    };
    this.setRulerBottom = function (val) {
      if (this._curve && this._curve.plot())
        val = Utility.adjustForDecimalPlaces(
          val,
          this._curve.plot().axisDecimalPlaces(this._curve.yAxis())
        );
      this._rulerBottom = val;
    };
    this.setRulerTop = function (val) {
      if (this._curve && this._curve.plot())
        val = Utility.adjustForDecimalPlaces(
          val,
          this._curve.plot().axisDecimalPlaces(this._curve.yAxis())
        );
      this._rulerTop = val;
    };

    this.setEnable = function (set) {
      _enable = set;
      //if(!_enable && this._curve) this._curve = null;
      Static.trigger("watchEnabled", [this, set]);
      Static.trigger("invalidateWatch");
    };
    this.isEnable = function () {
      return _enable;
    };
    Utility.enableIntegrate();
  }
}

/*class WatchCurveName : public Watch
{
public:
    WatchCurveName():Watch(NO_RULER)
    {

    }
    QString name()const
    {
        return "Curve Name";
    }

    void computeWatch()
    {
        _value = _curveName;
    }


protected:


};

class WatchLeftRulerPosition : public Watch
{
public:
    WatchLeftRulerPosition():Watch(LEFT)
    {

    }
    QString name()const
    {
        return "Left Ruler Position";
    }

    void computeWatch()
    {
        if(_rulerLeft == DBL_MAX)
            _value = "Invalid";
        else
            _value = QString::number(_rulerLeft);
    }
protected:


};

class WatchRightRulerPosition : public Watch
{
public:
    WatchRightRulerPosition():Watch(RIGHT)
    {

    }
    QString name()const
    {
        return "Right Ruler Position";
    }

    void computeWatch()
    {
        if(_rulerRight == DBL_MAX)
            _value = "Invalid";
        else
            _value = QString::number(_rulerRight);
    }
protected:


};

class WatchBottomRulerPosition : public Watch
{
public:
    WatchBottomRulerPosition():Watch(BOTTOM)
    {

    }
    QString name()const
    {
        return "Bottom Ruler Position";
    }

    void computeWatch()
    {
        if(_rulerBottom == DBL_MAX)
            _value = "Invalid";
        else
            _value = QString::number(_rulerBottom);
    }
protected:


};

class WatchTopRulerPosition : public Watch
{
public:
    WatchTopRulerPosition():Watch(TOP)
    {

    }
    QString name()const
    {
        return "Top Ruler Position";
    }

    void computeWatch()
    {
        if(_rulerTop == DBL_MAX)
            _value = "Invalid";
        else
            _value = QString::number(_rulerTop);
    }
protected:


};



#endif // WATCH_H
*/
