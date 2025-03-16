"use strict";

"include ['static', 'plotpicker']";

class MPicker extends PlotPicker {
  constructor(plot, rulerPos, ruler) {
    super(plot);
    var self = this;
    this._rulerPos = rulerPos;
    this._ruler = ruler;
    var _zoomer = null,
      _panner = null,
      _magnifier = null;
    var _qwtPlotCursorShape = "";
    var _cursorOld = null;
    var _cursorDrag = null;
    var _preventDragging = false;
    var _controlFlags = 0;

    var _mouseDown = false;

    //At this stage, no current curve is set. Thus, we could live with whatever axes the base class (QwtPlotPicker) sets.
    //We make the adjustment when we set a valid current curve that is visible.
    if (this._ruler) {
      this._ruler.setAxes(this.xAxis(), this.yAxis());
    }

    var _trackingTextStyle = MPicker.TrackingExtent.FullTrackingText;
    if (this.plot()) {
      _qwtPlotCursorShape = this.plot().cursor();
    }

    this.preventDragging = function (on) {
      _preventDragging = on;
    };

    this.controlFlag = function (flag) {
      return Boolean(_controlFlags & flag);
    };

    this.setControlFlag = function (flag, set) {
      if (set) _controlFlags |= flag;
      else _controlFlags &= ~flag;
    };

    this.prohibit = function () {
      if (_zoomer && this.controlFlag(MPicker.DisplayChange.ZoomerSearch)) {
        this.setControlFlag(
          MPicker.DisplayChange.ZoomEnabled,
          _zoomer.isEnabled()
        );
        if (this.controlFlag(MPicker.DisplayChange.ZoomEnabled))
          _zoomer.setEnabled(false);
      }
      if (_panner && this.controlFlag(MPicker.DisplayChange.PannerSearch)) {
        this.setControlFlag(
          MPicker.DisplayChange.PanEnabled,
          _panner.isEnabled()
        );
        if (this.controlFlag(MPicker.DisplayChange.PanEnabled))
          _panner.setEnabled(false);
      }

      if (
        _magnifier &&
        this.controlFlag(MPicker.DisplayChange.MagnifierSearch)
      ) {
        this.setControlFlag(
          MPicker.DisplayChange.MagnifierEnabled,
          _magnifier.isEnabled()
        );
        if (this.controlFlag(MPicker.DisplayChange.MagnifierEnabled))
          _magnifier.setEnabled(false);
      }
    };

    this.restore = function () {
      if (_zoomer && this.controlFlag(MPicker.DisplayChange.ZoomEnabled)) {
        //Zooming was disable before dragging.
        _zoomer.setEnabled(true); //Dragging has ended. Re-enable zooming.
        this.setControlFlag(MPicker.DisplayChange.ZoomEnabled, false);
      }
      if (_panner && this.controlFlag(MPicker.DisplayChange.PanEnabled)) {
        //Panning was disable before dragging.
        _panner.setEnabled(true); //Dragging has ended. Re-enable panning.
        this.setControlFlag(MPicker.DisplayChange.PanEnabled, false);
      }
      if (
        _magnifier &&
        this.controlFlag(MPicker.DisplayChange.MagnifierEnabled)
      ) {
        //Panning was disable before dragging.
        _magnifier.setEnabled(true); //Dragging has ended. Re-enable magnifier.
        this.setControlFlag(MPicker.DisplayChange.MagnifierEnabled, false);
      }
    };

    this.setDragCursor = function () {
      if (_preventDragging) return;
      if (this.controlFlag(MPicker.DisplayChange.DragCursor)) return;
      if (plot.cursor() != _qwtPlotCursorShape) return;
      _cursorOld = plot.cursor();
      _cursorDrag = this._dragCursorShape;
      plot.setCursor(_cursorDrag);
      this.setControlFlag(MPicker.DisplayChange.DragCursor, true);
      //We prohibit magnifying, zooming and/or panning during dragging.
      this.prohibit();

      Static.trigger("rulerSelected", self._ruler);
    };

    this.clearDragCursor = function () {
      if (!this.controlFlag(MPicker.DisplayChange.DragCursor)) return;
      this._ruler.plot().setCursor(_cursorOld);
      this.setControlFlag(MPicker.DisplayChange.DragCursor, false);
      this.restore();
      Static.trigger("rulerDeselected", self._ruler);
    };

    this.setTrackingTextStyle = function (trackingTextStyle) {
      _trackingTextStyle = trackingTextStyle;
    };

    this.trackerText = function (pos) {
      if (
        this._ruler.lock() ||
        _trackingTextStyle == MPicker.TrackingExtent.NoTrackingText ||
        (!this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
          !this.controlFlag(MPicker.DisplayChange.ZoomEnabled))
      )
        return "";

      if (_trackingTextStyle == MPicker.TrackingExtent.FullTrackingText) {
        var xTitle = this.axisTitle();
        if (!xTitle.length) return this._rulerPos;
        return xTitle + "=" + this._rulerPos;
      }
      if (_trackingTextStyle == MPicker.TrackingExtent.PartialTrackingText) {
        return this._rulerPos;
      }
      return "";
    };

    this.panningFinished = function () {
      this.setControlFlag(MPicker.DisplayChange.PanningInProgress, false);
    };

    this.panningStarted = function () {
      this.setControlFlag(MPicker.DisplayChange.PanningInProgress, true);
    };

    var plotDivParent = plot.getLayout().getPlotDiv().parent();
    plotDivParent.off("mouseup").on("mouseup", function () {
      if (MPicker.DisplayChange.LeftButtonDown) {
        if (Static.isMobile()) {
          self.clearDragCursor();
        }
        self.setControlFlag(MPicker.DisplayChange.LeftButtonDown, false);
      }
    });

    this.initMagnifier = function () {
      if (
        !this.controlFlag(MPicker.DisplayChange.MagnifierSearch) ||
        _magnifier
      )
        return;
      if (plot.magnifier) {
        _magnifier = plot.magnifier;
      }
    };

    this.initZoomer = function () {
      if (!this.controlFlag(MPicker.DisplayChange.ZoomerSearch) && _zoomer) {
        //_zoomer = null
        return;
      }
      if (plot.zoomer) {
        _zoomer = plot.zoomer;
      }
    };

    this.initPanner = function () {
      if (!this.controlFlag(MPicker.DisplayChange.PannerSearch) && _panner)
        return;
      if (plot.panner) {
        _panner = plot.panner;
      }
    };

    this.doMouseReleaseEvent = function (event) {
      if (
        !this._ruler.isVisible() ||
        this.controlFlag(MPicker.DisplayChange.PanningInProgress)
      )
        return;
      if (event.button == Static.LeftButton) {
        if (this.controlFlag(MPicker.DisplayChange.LeftButtonDown)) {
          Static.trigger("positionChanged", [this._ruler, this._rulerPos]);
        }
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, false);
      }

      if (Static.isMobile()) {
        if (this.controlFlag(MPicker.DisplayChange.LeftButtonDown)) {
          Static.trigger("positionChanged", [this._ruler, this._rulerPos]);
        }
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, false);
      }
    };

    this.doMouseLeaveEvent = function (event) {
      if (plot.rv._curve && _mouseDown) {
        Static.trigger("positionChanged", [self._ruler, self._rulerPos]);
      }
    };

    $(window).mouseup(function (event) {
      // if (plot.rv._curve)
      //   Static.trigger("positionChanged", [self._ruler, self._rulerPos]);
      _mouseDown = false;
    });

    $(window).mousedown(function (event) {
      _mouseDown = true;
    });
  }

  widgetMouseReleaseEvent(event) {
    this.doMouseReleaseEvent(event);
    //super.widgetMouseReleaseEvent(event);
  }

  widgetLeaveEvent(event) {
    this.doMouseLeaveEvent(event);
    //super.widgetMouseReleaseEvent(event);
  }
}
Enumerator.enum(
  "DisplayChange{MagnifierEnabled = 1,\
  ZoomEnabled = 2,\
  PanEnabled = 4,\
  Locked = 8,\
  LeftButtonDown = 16,\
  DragCursor = 32,\
  PanningInProgress = 64,\
  MagnifierSearch = 128,\
  ZoomerSearch = 256,\
  PannerSearch = 512,\
  NoRuler = 1024;}",
  MPicker
);

Enumerator.enum(
  "TrackingExtent{NoTrackingText, FullTrackingText, PartialTrackingText}",
  MPicker
);

class PickerV extends MPicker {
  constructor(plot, rulerPos, ruler) {
    super(plot, rulerPos, ruler);
    this._dragCursorShape = "w-resize";

    this.axisTitle = function () {
      return this._ruler.plot().axisTitle(this.xAxis());
    };
  }

  widgetMousePressEvent(event) {
    //event.preventDefault();

    if (
      !this._ruler.isVisible() ||
      this.controlFlag(MPicker.DisplayChange.PanningInProgress)
    )
      return;
    if (event.button == 2) {
      if (this.controlFlag(MPicker.DisplayChange.DragCursor)) {
      }
      return true;
    }

    if (Static.isMobile()) {
      if (Static.isMobile()) {
        this.clearDragCursor();
      }
      var _rulerPosVal = this._ruler
        .plot()
        .transform(this.xAxis(), this._rulerPos);
      var clientX = event.originalEvent.touches[0].clientX;
      var clientY = event.originalEvent.touches[0].clientY;
      var pt = this.mapToElement(new Misc.Point(clientX, clientY));
      var val = pt.x;
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        val < _rulerPosVal + 12 &&
        val > _rulerPosVal - 12
      ) {
        this.setDragCursor();
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, true);
      }
    } else if (event.button == Static.LeftButton || Static.isMobile()) {
      if (this.controlFlag(MPicker.DisplayChange.DragCursor)) {
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, true);
      }
      return true;
    }
    return;
  }

  widgetMouseMoveEvent(event) {
    //event.preventDefault();

    var plot = this._ruler.plot();
    if (!plot.rv._curve) {
      return;
    }
    var clientX = event.clientX;
    var clientY = event.clientY;
    if (Static.isMobile()) {
      var touchobj = event.originalEvent.changedTouches[0]; // reference first touch point for this event
      clientX = parseInt(touchobj.clientX);
      clientY = parseInt(touchobj.clientY);
    }

    var pt = this.mapToElement(new Misc.Point(clientX, clientY));
    var pw = this._ruler.linePen().width;
    var inRect = plot
      .getCentralWidget()
      .contentsRect()
      .adjusted(pw + 1, 0, -(pw + 1), 0)
      .contains(pt);
    if (!inRect) {
      return;
    }

    if (
      !this._ruler.isVisible() ||
      this.controlFlag(MPicker.DisplayChange.PanningInProgress)
    )
      return;
    if (!this.controlFlag(MPicker.DisplayChange.Locked)) {
      // if (Static.isMobile()) {
      //   var touchobj = event.originalEvent.changedTouches[0]; // reference first touch point for this event
      //   clientX = parseInt(touchobj.clientX);
      //   clientY = parseInt(touchobj.clientY);
      // }
      var val = pt.x;
      var _rulerPosVal = this._ruler
        .plot()
        .transform(this.xAxis(), this._rulerPos);
      if (this.controlFlag(MPicker.DisplayChange.LeftButtonDown)) {
        this._rulerPos = plot.invTransform(this.xAxis(), val);
        this._rulerPos = this._ruler._rulers.setPosition(
          this._ruler._rulers.rulerId(this._ruler),
          this._rulerPos
        );
        //this._rulerPos = this._ruler._pos;
        Static.trigger("positionChanging", [this._ruler, this._ruler._pos]);
      }
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        val < _rulerPosVal + 2 &&
        val > _rulerPosVal - 2
      ) {
        this.setDragCursor();
      }
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        !(val < _rulerPosVal + 2 && val > _rulerPosVal - 2)
      ) {
        this.clearDragCursor();
      }
    }
  }
}

class PickerH extends MPicker {
  constructor(plot, rulerPos, ruler) {
    super(plot, rulerPos, ruler);

    this._dragCursorShape = "s-resize";

    this.axisTitle = function () {
      return this._ruler.plot().axisTitle(this.yAxis());
    };
  }

  widgetMousePressEvent(event) {
    //event.preventDefault();

    if (
      !this._ruler.isVisible() ||
      this.controlFlag(MPicker.DisplayChange.PanningInProgress)
    )
      return;
    if (event.button == 2) {
      if (this.controlFlag(MPicker.DisplayChange.DragCursor)) {
      }
      return true;
    }

    if (Static.isMobile()) {
      var _rulerPosVal = this._ruler
        .plot()
        .transform(this.yAxis(), this._rulerPos);
      var clientX = event.originalEvent.touches[0].clientX;
      var clientY = event.originalEvent.touches[0].clientY;
      var pt = this.mapToElement(new Misc.Point(clientX, clientY));
      var val = pt.y;
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        val < _rulerPosVal + 12 &&
        val > _rulerPosVal - 12
      ) {
        this.setDragCursor();
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, true);
      }
    } else if (event.button == Static.LeftButton || Static.isMobile()) {
      if (this.controlFlag(MPicker.DisplayChange.DragCursor)) {
        this.setControlFlag(MPicker.DisplayChange.LeftButtonDown, true);
      }
      return true;
    }
    return;
  }

  widgetMouseMoveEvent(event) {
    //event.preventDefault();

    var plot = this._ruler.plot();
    if (!plot.rv._curve) {
      return;
    }
    var clientX = event.clientX;
    var clientY = event.clientY;
    if (Static.isMobile()) {
      var touchobj = event.originalEvent.changedTouches[0]; // reference first touch point for this event
      clientX = parseInt(touchobj.clientX);
      clientY = parseInt(touchobj.clientY);
    }
    var pt = this.mapToElement(new Misc.Point(clientX, clientY));
    var pw = this._ruler.linePen().width;
    var inRect = plot
      .getCentralWidget()
      .contentsRect()
      .adjusted(0, pw + 1, 0, -(pw + 1))
      .contains(pt);

    if (!inRect) return;

    if (
      !this._ruler.isVisible() ||
      this.controlFlag(MPicker.DisplayChange.PanningInProgress)
    )
      return;
    if (!this.controlFlag(MPicker.DisplayChange.Locked)) {
      // if (Static.isMobile()) {
      //   var touchobj = event.originalEvent.changedTouches[0]; // reference first touch point for this event
      //   clientX = parseInt(touchobj.clientX);
      //   clientY = parseInt(touchobj.clientY);
      // }

      var val = pt.y;
      var _rulerPosVal = this._ruler
        .plot()
        .transform(this.yAxis(), this._rulerPos);

      if (this.controlFlag(MPicker.DisplayChange.LeftButtonDown)) {
        this._rulerPos = plot.invTransform(this.yAxis(), val);
        this._rulerPos = this._ruler._rulers.setPosition(
          this._ruler._rulers.rulerId(this._ruler),
          this._rulerPos
        );
        Static.trigger("positionChanging", [this._ruler, this._ruler._pos]);
      }
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        val < _rulerPosVal + 2 &&
        val > _rulerPosVal - 2
      ) {
        this.setDragCursor();
      }
      if (
        !this.controlFlag(MPicker.DisplayChange.LeftButtonDown) &&
        !(val < _rulerPosVal + 2 && val > _rulerPosVal - 2)
      ) {
        this.clearDragCursor();
      }
    }
  }
}
