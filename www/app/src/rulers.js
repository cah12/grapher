"include ['static', 'mpicker', 'ruler']";
"use strict";

class MRulerV extends RulerV {
  constructor(plot, name, rulerGroup) {
    super(plot, name, rulerGroup);
    this.rulers = function () {
      return this._rulers;
    };

    this.validatePosition = function () {
      var changed = false;
      var inverted = false;
      var plot = this.plot();
      var intv = plot.axisInterval(this.xAxis());

      var min = intv.minValue();
      var max = intv.maxValue();

      var minVal = plot.transform(this._picker.xAxis(), min);
      var maxVal = plot.transform(this._picker.xAxis(), max);
      var rulerPosVal = plot.transform(this._picker.xAxis(), this._pos);
      var minX = this._rulers.minX();
      var maxX = this._rulers.maxX();

      if (min > max) {
        inverted = true;
        // var temp = minX;
        // minX = maxX;
        // maxX = temp;
      }

      var space = 2;
      if (Static.isMobile()) {
        space = 12;
      }

      var separationX =
        0.5 *
          (this.rulers().ruler(0).linePen().width +
            this.rulers().ruler(1).linePen().width) +
        space;

      var n = this._rulers.rulerId(this);
      if (n == 0) {
        if (this._rulers.ruler(1).isVisible()) {
          var val = plot.transform(
            this._picker.xAxis(),
            this._rulers.ruler(1)._pos
          );
          if (rulerPosVal >= val - separationX) {
            this._pos = plot.invTransform(
              this._picker.xAxis(),
              val - separationX
            );
            changed = true;
          }
          if (rulerPosVal < minVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), minVal);
            changed = true;
          }
          if (!inverted) {
            // var val = plot.transform(this._picker.xAxis(), this._rulers.ruler(1)._pos);
            // if (rulerPosVal >= val - separationX) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), val - separationX);
            //     changed = true;
            // }
            // if (rulerPosVal < minVal) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), minVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos < minX) {
              this._pos = minX;
              changed = true;
            }
          } else {
            // var val = plot.transform(this._picker.xAxis(), this._rulers.ruler(1)._pos);
            // if (rulerPosVal >= val - separationX) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), val - separationX);
            //     changed = true;
            // }
            // if (rulerPosVal < minVal) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), minVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos > maxX) {
              this._pos = maxX;
              changed = true;
            }
          }
        } else {
          if (rulerPosVal < minVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), minVal);
            changed = true;
          }
          if (rulerPosVal > maxVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), maxVal);
            changed = true;
          }
          if (this._rulers._curve && this._pos < minX) {
            this._pos = minX;
            changed = true;
          }
          if (this._rulers._curve && this._pos > maxX) {
            this._pos = maxX;
            changed = true;
          }
        }
      }
      if (n == 1) {
        if (this._rulers.ruler(0).isVisible()) {
          var val = plot.transform(
            this._picker.xAxis(),
            this._rulers.ruler(0)._pos
          );
          if (rulerPosVal <= val + separationX) {
            this._pos = plot.invTransform(
              this._picker.xAxis(),
              val + separationX
            );
            changed = true;
          }
          if (rulerPosVal > maxVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), maxVal);
            changed = true;
          }
          if (!inverted) {
            // var val = plot.transform(this._picker.xAxis(), this._rulers.ruler(0)._pos);
            // if (rulerPosVal <= val + separationX) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), val + separationX);
            //     changed = true;
            // }
            // if (rulerPosVal > maxVal) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), maxVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos > maxX) {
              this._pos = maxX;
              changed = true;
            }
          } else {
            // var val = plot.transform(this._picker.xAxis(), this._rulers.ruler(0)._pos);
            // if (rulerPosVal <= val + separationX) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), val + separationX);
            //     changed = true;
            // }
            // if (rulerPosVal > maxVal) {
            //     this._pos = plot.invTransform(this._picker.xAxis(), maxVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos < minX) {
              this._pos = minX;
              changed = true;
            }
          }
        } else {
          if (rulerPosVal < minVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), minVal);
            changed = true;
          }
          if (rulerPosVal > maxVal) {
            this._pos = plot.invTransform(this._picker.xAxis(), maxVal);
            changed = true;
          }
          if (this._rulers._curve && this._pos < minX) {
            this._pos = minX;
            changed = true;
          }
          if (this._rulers._curve && this._pos > maxX) {
            this._pos = maxX;
            changed = true;
          }
        }
      }
      if (changed) this.setPosition(this._pos);

      return changed;
    };
  }
  setVisible(visible) {
    super.setVisible(visible);
    if (visible && this._rulers) {
      var n = this._rulers.rulerId(this);
      if (
        (n == 0 && this._rulers.ruler(1).isVisible()) ||
        (n == 1 && this._rulers.ruler(0).isVisible())
      ) {
        //this._rulers.resetXPositions();
      }
    } else {
      this._pos = Number.MAX_VALUE;
      this._rulers.updateWatchesAndTable();
    }
  }

  setLockAt(val) {
    //console.log(this.title())//v_ruler1
    this.setPosition(val);
    this.validatePosition(); //this method may reset the position

    this.setLock(true);
    Static.trigger("positionChanged", [this, val]);
    //Static.trigger("shapeItemValueChanged")
  }
}

class MRulerH extends RulerH {
  //Define the MRulerH constructor
  //function MRulerH(plot, name, rulerGroup) {
  constructor(plot, name, rulerGroup) {
    // Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    //RulerH.call(this, plot, name);
    super(plot, name, rulerGroup);
    //this._rulers = null

    //if(rulerGroup)
    // this._rulers = rulerGroup

    this.rulers = function () {
      return this._rulers;
    };

    this.validatePosition = function () {
      var changed = false;
      var inverted = false;
      var plot = this.plot();
      var intv = plot.axisInterval(this.yAxis());
      var min = intv.minValue();
      var max = intv.maxValue();

      var minVal = plot.transform(this.yAxis(), min);
      var maxVal = plot.transform(this.yAxis(), max);
      var rulerPosVal = plot.transform(this.yAxis(), this._pos);
      var minY = this._rulers.minY();
      var maxY = this._rulers.maxY();

      if (min > max) {
        inverted = true;
        // var temp = minX;
        // minX = maxX;
        // maxX = temp;
      }

      var space = 2;
      if (Static.isMobile()) {
        space = 12;
      }

      var separationY =
        0.5 *
          (this.rulers().ruler(2).linePen().width +
            this.rulers().ruler(3).linePen().width) +
        space;

      var n = this._rulers.rulerId(this);
      if (n == 2) {
        if (this._rulers.ruler(3).isVisible()) {
          var val = plot.transform(this.yAxis(), this._rulers.ruler(3)._pos);
          if (rulerPosVal <= val + separationY) {
            this._pos = plot.invTransform(this.yAxis(), val + separationY);
            changed = true;
          }
          if (rulerPosVal > minVal) {
            this._pos = plot.invTransform(this.yAxis(), minVal);
            changed = true;
          }
          if (!inverted) {
            // var val = plot.transform(this.yAxis(), this._rulers.ruler(3)._pos);
            // if (rulerPosVal <= val + separationY) {
            //     this._pos = plot.invTransform(this.yAxis(), val + separationY);
            //     changed = true;
            // }
            // if (rulerPosVal > minVal) {
            //     this._pos = plot.invTransform(this.yAxis(), minVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos < minY) {
              this._pos = minY;
              changed = true;
            }
          } else {
            // var val = plot.transform(this.yAxis(), this._rulers.ruler(3)._pos);
            // if (rulerPosVal <= val + separationY) {
            //     this._pos = plot.invTransform(this.yAxis(), val + separationY);
            //     changed = true;
            // }
            // if (rulerPosVal > minVal) {
            //     this._pos = plot.invTransform(this.yAxis(), minVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos > maxY) {
              this._pos = maxY;
              changed = true;
            }
          }
        } else {
          if (rulerPosVal < maxVal) {
            this._pos = plot.invTransform(this.yAxis(), maxVal);
            changed = true;
          }
          if (rulerPosVal > minVal) {
            this._pos = plot.invTransform(this.yAxis(), minVal);
            changed = true;
          }
          if (this._rulers._curve && this._pos < minY) {
            this._pos = minY;
            changed = true;
          }
          if (this._rulers._curve && this._pos > maxY) {
            this._pos = maxY;
            changed = true;
          }
        }
      }
      if (n == 3) {
        if (this._rulers.ruler(2).isVisible()) {
          var val = plot.transform(this.yAxis(), this._rulers.ruler(2)._pos);
          if (rulerPosVal >= val - separationY) {
            this._pos = plot.invTransform(this.yAxis(), val - separationY);
            changed = true;
          }
          if (rulerPosVal < maxVal) {
            this._pos = plot.invTransform(this.yAxis(), maxVal);
            changed = true;
          }
          if (!inverted) {
            // var val = plot.transform(this.yAxis(), this._rulers.ruler(2)._pos);
            // if (rulerPosVal >= val - separationY) {
            //     this._pos = plot.invTransform(this.yAxis(), val - separationY);
            //     changed = true;
            // }
            // if (rulerPosVal < maxVal) {
            //     this._pos = plot.invTransform(this.yAxis(), maxVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos > maxY) {
              this._pos = maxY;
              changed = true;
            }
          } else {
            // var val = plot.transform(this.yAxis(), this._rulers.ruler(2)._pos);
            // if (rulerPosVal >= val - separationY) {
            //     this._pos = plot.invTransform(this.yAxis(), val - separationY);
            //     changed = true;
            // }
            // if (rulerPosVal < maxVal) {
            //     this._pos = plot.invTransform(this.yAxis(), maxVal);
            //     changed = true;
            // }
            if (this._rulers._curve && this._pos < minY) {
              this._pos = minY;
              changed = true;
            }
          }
        } else {
          if (rulerPosVal > minVal) {
            this._pos = plot.invTransform(this.yAxis(), minVal);
            changed = true;
          }
          if (rulerPosVal < maxVal) {
            this._pos = plot.invTransform(this.yAxis(), maxVal);
            changed = true;
          }
          if (this._rulers._curve && this._pos < minY) {
            this._pos = minY;
            changed = true;
          }
          if (this._rulers._curve && this._pos > maxY) {
            this._pos = maxY;
          }
        }
      }
      if (changed) this.setPosition(this._pos);

      return changed;
    };
  }

  setVisible(visible) {
    super.setVisible(visible);
    if (visible && this._rulers) {
      var n = this._rulers.rulerId(this);
      if (
        (n == 2 && this._rulers.ruler(3).isVisible()) ||
        (n == 3 && this._rulers.ruler(2).isVisible())
      ) {
        //this._rulers.resetYPositions();
      }
    } else {
      this._pos = Number.MAX_VALUE;
      this._rulers.updateWatchesAndTable();
    }
  }

  setLockAt(val) {
    this.setPosition(val);
    this.validatePosition(); //this method may reset the position

    this.setLock(true);
    Static.trigger("positionChanged", [this, val]);
    //Static.trigger("shapeItemValueChanged")
  }
}
//MRulerH.prototype = Object.create(RulerH.prototype);
// Set the "constructor" property to refer to Ruler
//MRulerH.prototype.constructor = MRulerH;

/* MRulerH.prototype.setVisible = function (visible) {
    PlotMarker.prototype.setVisible.call(visible);
    if (visible && this._rulers) {
        var n = this._rulers.rulerId(this);
        if ((n == 2 && this._rulers.ruler(3).isVisible()) || (n == 3 && this._rulers.ruler(2).isVisible())) {
            this._rulers.resetYPositions();
        }
    }else{
        this._pos = Number.MAX_VALUE;
    }
}

MRulerH.prototype.setLockAt = function (val) {
    this.setPosition(val)
    this.setLock(true)
    Static.trigger("positionChanged", [this, val])
    //Static.trigger("shapeItemValueChanged")

} */
/////////////////////////////////////////////////////////////
class Rulers {
  constructor(plot, /*vRulerConstructor, hRulerConstructor,*/ flags) {
    var self = this;
    var _menu = [
      {
        name: "hide...",
        img: "images/hide.png",
        title: "hide the ruler.",
        fun: function () {
          plot.rv.currentRuler.setVisible(false);
          plot.rv.currentRuler._picker.clearDragCursor();
          if (!plot.rv.hasVisibleRuler()) {
          } else {
          }
        },
      },
      {
        name: "lock...",
        img: "images/lock.png",
        title: "lock the ruler in its current position.",
        fun: function () {
          plot.rv.currentRuler.setLock(true);
          if (!plot.rv.hasLockedRuler()) {
            //all rulers locked
          } else {
          }
        },
      },
      {
        name: "lock at...",
        img: "images/lockAt.png",
        title: "lock the ruler at a specific position.",
        fun: function () {
          var currentRulerPosition = 0;
          if (plot.rv.currentRuler instanceof RulerH) {
            currentRulerPosition = plot.rv.currentRuler.yValue();
          } else {
            currentRulerPosition = plot.rv.currentRuler.xValue();
          }

          Utility.prompt(
            "Enter a position",
            currentRulerPosition,
            function (val) {
              plot.rv.currentRuler.setLockAt(parseFloat(val));
              return true;
            },
            "small"
          );
        },
      },
    ];

    var rulerDeselectMenu = [
      {
        name: "Hide rulers",
        img: "images/hide.png",
        title: "Hide all rulers",
        fun: function () {
          plot.rv.setVisible(false);
        },
      },
      {
        name: "Show rulers",
        img: "images/show.png",
        title: "Show any hidden rulers",
        //disable: true,
        fun: function () {
          plot.rv.setVisible(true);
        },
      },
      {
        name: "Unlock rulers",
        img: "images/unlock.png",
        title: "Unlock any locked rulers",
        //disable: true,
        fun: function () {
          plot.rv.unlockAllRulers();
        },
      },
    ];

    this.setRulerDeselectMenu = function (menu) {
      if (!menu) {
        rulerDeselectMenu = [];
      } else {
        rulerDeselectMenu = menu;
      }
    };

    this._curve = 0;
    this._watchTable = new WatchTable(this);
    this._editor = 0;
    //this._flags = flags;
    this._curveShapeItem = 0;
    this._watchSetter = 0;
    this._rulerList = null;

    this._watchList = [];
    this.sidebarVisible = false;

    /*var vRulerConst = vRulerConstructor || MRulerV
        var hRulerConst = hRulerConstructor || MRulerH*/

    plot.setAutoReplot(true);

    //if(!this._rulerList){
    this._rulerList = [
      new MRulerV(plot, "v_ruler1", self),
      new MRulerV(plot, "v_ruler2", self),
      new MRulerH(plot, "h_ruler1", self),
      new MRulerH(plot, "h_ruler2", self),
    ];
    //}

    //console.log(this._rulerList)
    if (Static.isMobile()) {
      for (var i = 0; i < 4; ++i) {
        var p = this._rulerList[i].linePen();
        p.width = 2 * p.width;
        // this._rulerList[i].setLinePen(p)
      }
    }

    this._minX = 0;
    this._maxX = 0;
    this._minY = 0;
    this._maxY = 0;

    this.minX = function () {
      return this._minX;
    };
    this.maxX = function () {
      return this._maxX;
    };
    this.minY = function () {
      return this._minY;
    };
    this.maxY = function () {
      return this._maxY;
    };

    this.currentRuler = null;

    //var _menu = null;

    var el = plot.getLayout().getCentralDiv();
    var menuAppended = false;
    Static.bind("rulerSelected", function (e, ruler) {
      self.currentRuler = ruler;
      //ensure 'contextMenu' is included
      if (menuAppended) el.contextMenu("destroy");
      menuAppended = true;
      el.contextMenu(_menu, {
        triggerOn: "contextmenu",
        zIndex: 1,
      });
    });

    Static.bind("rulerDeselected", function () {
      // console.log(44)
      if (menuAppended) el.contextMenu("destroy");
      menuAppended = true;
      el.contextMenu(rulerDeselectMenu, {
        triggerOn: "contextmenu",
        zIndex: 1,
      });
    });

    /* this.setMenu = function (menu) {
            _menu = menu;
        } */

    this.init(plot);

    this.position = function (rulerId) {
      if (rulerId > -1 && rulerId < 4) {
        if (!this._rulerList[rulerId].isVisible()) return Number.MAX_VALUE; //error
        return this._rulerList[rulerId]._pos;
      }
      return Number.MAX_VALUE; //error
    };

    this.watch = function (id) {
      if (id >= 0 && id < this._watchList.length) return this._watchList[id];
      return null;
    };

    this.addToWatchList = function (watch) {
      this._watchList.push(watch);
      return this._watchList.length - 1;
    };

    this.setWatchEnabled = function (id, set) {
      if (id >= 0 && id < this._watchList.length) {
        if (this._watchList[id].isEnable() == set) return;
        this._watchList[id].setEnable(set);
        //To account for any changes that occurred during the disabled state, we updateWatch().
        if (set) this.updateWatch(this._watchList[id]);
        this._watchTable.updateWatchTable();
      }
    };

    this.isWatchEnabled = function (id) {
      if (id >= 0 && id < this._watchList.length) {
        return this._watchList[id].isEnable();
      }
      return false;
    };

    Static.bind("showSidebar", function (e, anchorPosition, on) {
      if (anchorPosition == "right") self.sidebarVisible = on;
    });

    this.updateWatchesAndTable = function () {
      //wwwwwwwww
      if (!self.sidebarVisible) return;
      if (!this._curve) return;
      this.updateWatches();
      if (this._watchTable) this._watchTable.updateWatchTable();

      /*$("#watchTableBody").hide()//
            $("#watchTableBody").show()//*/
      //this._valid = true;
    };

    this.setVisible = function (on) {
      this._rulerList.forEach(function (ruler) {
        ruler.setVisible(on);
      });
      if (on) {
        Static.trigger("curveAdjusted"); //Force sidebar update
        //this.updateWatchesAndTable();
      }
      this.refresh();
    };

    this.hasVisibleRuler = function () {
      for (var i = 0; i < 4; ++i) {
        if (this._rulerList[i].isVisible()) {
          return true;
        }
      }
      return false;
    };

    this.hasLockedRuler = function () {
      for (var i = 0; i < 4; ++i) {
        if (this._rulerList[i].lock()) {
          return true;
        }
      }
      return false;
    };

    /*this.allRulersHidden = function(){
        return !this.hasVisibleRuler
        }*/

    this.updateWatch = function (w) {
      if (w.isEnable()) {
        //var doReplot = plot.autoReplot();
        //plot.setAutoReplot(false);
        w.setCurveName(this._curve.title());
        w.setRulerLeft(this.position(0));
        w.setRulerRight(this.position(1));
        w.setRulerBottom(this.position(2));
        w.setRulerTop(this.position(3));
        if (this._curve) {
          w.setCurve(this._curve);
        }

        w.computeWatch();
      }
    };

    this.updateWatches = function () {
      var doReplot = plot.autoReplot();
      plot.setAutoReplot(false);
      this._watchList.forEach(function (w) {
        self.updateWatch(w);
      });
      plot.setAutoReplot(doReplot);
      plot.autoRefresh();
    };

    this.setEnabled = function (enable) {
      this._rulerList.forEach(function (ruler) {
        ruler._picker.setEnabled(enable);
      });
    };

    this.setMouseTracking = function (enable) {
      this._rulerList.forEach(function (ruler) {
        ruler._picker.setMouseTracking(enable);
      });
    };

    this.setZoomerSearch(true);
    this.setPannerSearch(true);

    //plot.setAutoReplot(true);
    this.setMouseTracking(true);

    Static.bind("zoomerAdded", function (e, zoomer) {
      //self.initZoomer()
      self.setZoomerSearch(
        self._rulerList[0]._picker.controlFlag(
          MPicker.DisplayChange.ZoomerSearch
        )
      );
      self.setMouseTracking(true);
    });

    Static.bind("pannerAdded", function (e, panner) {
      //self.initPanner()
      self.setPannerSearch(
        self._rulerList[0]._picker.controlFlag(
          MPicker.DisplayChange.PannerSearch
        )
      );
      self.setMouseTracking(true);
    });

    Static.bind("currentCurveChanged", function (e, curve) {
      self.setCurrentCurve(curve);
    });

    //this.setEnabled(true)
    //this.setMenu(menu1);

    plot.rv = this;

    Static.trigger("rulerDeselected");
  }

  ////////////////////////////////////////////////
  unlockAllRulers() {
    for (var i = 0; i < this._rulerList.length; ++i) {
      this._rulerList[i].setLock(false);
      //this._rulerList[i]._picker.setControlFlag(MPicker.DisplayChange.Locked, false);
    }
  }

  // setCurrentCurve(curve) {
  //   if (this._curve == curve) return;
  //   this.doSetCurrentCurve(curve);
  // }

  refresh() {
    var p = this._rulerList[0].plot();
    //p.replot(); //ensure scales are freshly computed. //Out1
    p.autoRefresh();
    if (
      this._curve &&
      this._curve.rtti == PlotItem.RttiValues.Rtti_PlotCurve &&
      this._curve.isVisible()
    ) {
      if (this._curve.isVisible()) {
        this._minX = this._curve.minXValue();
        this._maxX = this._curve.maxXValue();
        this._minY = this._curve.minYValue();
        this._maxY = this._curve.maxYValue();
      }

      var axis = this._rulerList[0].xAxis();
      var intvX = p.axisInterval(this._rulerList[0].xAxis());
      var minX = intvX.minValue();
      var maxX = intvX.maxValue();
      var intvY = p.axisInterval(this._rulerList[0].yAxis());
      var minY = intvY.minValue();
      var maxY = intvY.maxValue();

      //minX = this._minX < minX ? minX : this._minX;

      if (minX > maxX) {
        //inverted
        minX = this._maxX < maxX ? maxX : this._maxX;
        this._rulerList[0].setPosition(minX);
      } else {
        minX = this._minX < minX ? minX : this._minX;
        this._rulerList[0].setPosition(minX);
      }

      //maxX = this._maxX < maxX ? this._maxX : maxX;

      if (minX > maxX) {
        //inverted
        maxX = this._minX < minX ? this._minX : minX;
        this._rulerList[1].setPosition(maxX);
      } else {
        maxX = this._maxX < maxX ? this._maxX : maxX;
        this._rulerList[1].setPosition(maxX);
      }

      //minY = this._minY < minY ? minY : this._minY;
      if (minY > maxY) {
        //inverted
        minY = this._maxY < maxY ? maxY : this._maxY;
        this._rulerList[2].setPosition(minY);
      } else {
        minY = this._minY < minY ? minY : this._minY;
        this._rulerList[2].setPosition(minY);
      }

      //this._rulerList[2].setPosition(minY);

      //maxY = this._maxY < maxY ? this._maxY : maxY;
      if (minY > maxY) {
        //inverted
        maxY = this._minY < minY ? this._minY : minY;
        this._rulerList[3].setPosition(maxY);
      } else {
        maxY = this._maxY < maxY ? this._maxY : maxY;
        this._rulerList[3].setPosition(maxY);
      }

      //this._rulerList[3].setPosition(maxY);
      //unlockAllRulers();
      this.updateWatchesAndTable();
    } else {
      // if(this._watchTable)
      //     this._watchTable.setEnabled(false);
      this.resetXPositions();
      this.resetYPositions();
      // if(_curveShapeItem && _curveShapeItem.isVisible())
      // {
      //     _curveShapeItem.setVisible(false);
      //     _curveShapeItem.setVisibilityToBerestored(true);// note that visibility is to restored
      // }
    }
  }

  doSetRulersAxes(xAxis, yAxis) {
    var plot = this._rulerList[0].plot();
    var doReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    var oldXAxis = this._rulerList[0].xAxis();
    var oldYAxis = this._rulerList[0].yAxis();
    for (var i = 0; i < this._rulerList.length; ++i) {
      this._rulerList[i].setAxes(xAxis, yAxis);
      this._rulerList[i]._picker.setAxis(xAxis, yAxis);
    }
    //if(this._curveShapeItem)
    //this._curveShapeItem.setAxes(xAxis, yAxis);
    //updateConnectionOnXAxisChange(oldXAxis);
    //updateConnectionOnYAxisChange(oldYAxis);
    plot.setAutoReplot(doReplot);
    plot.autoRefresh();
  }

  adjustToCurve(curve) {
    this._curve = curve;
    //console.log(curve)
    if (this._curve) {
      /* if (this._curve.isVisible()) {
                this._minX = this._curve.minXValue();
                this._maxX = this._curve.maxXValue();
                this._minY = this._curve.minYValue();
                this._maxY = this._curve.maxYValue();
            } */
      this.doSetRulersAxes(this._curve.xAxis(), this._curve.yAxis()); //rulers reference these axes.
      if (this._curveShapeItem) {
        //this._curveShapeItem.setCurve(_curve);
        //this._curveShapeItem.setAbcissaValues(_minX, _maxX);
      }
    }
    this.refresh();
  }

  doSetCurrentCurve(curve) {
    //var oldCurve = this._curve;
    if (curve && curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve) {
      //console.log(456);
      $("#watchTableContainer").hide();
    } else {
      $("#watchTableContainer").show();
    }
    this.adjustToCurve(curve);
    //Static.trigger("currentCurveChanged", curve);
  }

  setCurrentCurve(curve) {
    if (this._curve == curve) return;
    this.doSetCurrentCurve(curve);
  }

  currentCurve() {
    return this._curve;
  }

  init(plot) {
    var self = this;
    var _rulerList = this._rulerList; //Static.trigger("decimalPlacesChanged");

    Static.bind(
      "positionChanged decimalPlacesChanged calculationAccuracy",
      function (e, ruler, rulerPos) {
        self.updateWatchesAndTable();
      }
    );

    Static.bind("curveAdjusted", function () {
      ///Added 06/17/2020
      self.refresh();
    });

    Static.bind("rescaled", function () {
      //self.refresh();
      Static.trigger("curveAdjusted"); //shapeItem update
    });

    Static.bind("pointAdded pointRemoved", function (e, curve) {
      self.doSetCurrentCurve(curve);
    });

    Static.bind("axisChanged", function (e, axis, curve) {
      if (self.currentCurve() === curve) {
        self.adjustToCurve(curve);
      }
    });

    //this._rulerList[0].setLinePen(new Misc.Pen("red"));
    //this._rulerList[2].setLinePen(new Misc.Pen("red"));
    this._rulerList[0].linePen().color = "red";
    this._rulerList[2].linePen().color = "red";

    this.resetXPositions();
    this.resetYPositions();
  }

  setZoomerSearch(on) {
    this._rulerList.forEach(function (ruler) {
      ruler.setZoomerSearch(on);
      ruler._picker.initZoomer();
    });
  }

  setPannerSearch(on) {
    this._rulerList.forEach(function (ruler) {
      ruler.setPannerSearch(on);
      ruler._picker.initPanner();
    });
  }

  setPosition(rulerId, pos) {
    pos = parseFloat(pos);
    if (this._rulerList[rulerId]._pos == pos) return pos;
    var initialPos = this._rulerList[rulerId]._pos;
    this._rulerList[rulerId]._pos = pos;
    this._rulerList[rulerId].validatePosition();
    var changed = this._rulerList[rulerId]._pos !== initialPos;
    if (changed) {
      this._rulerList[rulerId].setPosition(this._rulerList[rulerId]._pos);
      //Static.trigger("positionChanged", [this._rulerList[rulerId], this._rulerList[rulerId]._pos]);
    }
    return this._rulerList[rulerId]._pos;
  }

  resetXPositions() {
    var plot = this._rulerList[0].plot();
    var doReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    var intv = plot.axisInterval(this._rulerList[0].xAxis());
    if (!this._curve || !this._curve.isVisible()) {
      this._rulerList[0].setPosition(intv.minValue());
      this._rulerList[1].setPosition(intv.maxValue());
    } else {
      if (intv.minValue() > this._minX)
        this._rulerList[0].setPosition(intv.minValue());
      else this._rulerList[0].setPosition(this._minX);
      if (intv.maxValue() < this._maxX)
        this._rulerList[1].setPosition(intv.maxValue());
      else this._rulerList[1].setPosition(this._maxX);
    }
    plot.setAutoReplot(doReplot);
    plot.autoRefresh();
  }

  resetYPositions() {
    var plot = this._rulerList[0].plot();
    var doReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    var intv = plot.axisInterval(this._rulerList[0].yAxis());
    if (!this._curve || !this._curve.isVisible()) {
      this._rulerList[2].setPosition(intv.minValue());
      this._rulerList[3].setPosition(intv.maxValue());
    } else {
      this._rulerList[2].setPosition(this._minY);
      this._rulerList[3].setPosition(this._maxY);

      if (intv.minValue() > this._minY)
        this._rulerList[2].setPosition(intv.minValue());
      else this._rulerList[2].setPosition(this._minY);
      if (intv.maxValue() < this._maxY)
        this._rulerList[3].setPosition(intv.maxValue());
      else this._rulerList[3].setPosition(this._maxY);
    }
    plot.setAutoReplot(doReplot);
    plot.autoRefresh();
  }

  ruler(rulerId) {
    if (rulerId < 4 && rulerId >= 0) return this._rulerList[rulerId];
    return 0;
  }

  rulerId(r) {
    if (!r) return -1;
    return this._rulerList.indexOf(r);
  }

  preventDragging(on) {
    for (var i = 0; i < this._rulerList.length; ++i) {
      this._rulerList[i]._picker.preventDragging(on);
    }
  }

  setRulersXAxis(axis) {
    var plot = this._rulerList[0].plot();
    var doReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    //var oldAxis = this._rulerList[0].xAxis();
    for (var i = 0; i < this._rulerList.length; ++i) {
      this._rulerList[i].setXAxis(axis);
      this._rulerList[i]._picker.setAxis(axis, this._rulerList[i].yAxis());
    }
    if (this._curveShapeItem)
      this._curveShapeItem.setAxes(axis, this._rulerList[0].yAxis());
    //updateConnectionOnXAxisChange(oldAxis);
    plot.setAutoReplot(doReplot);
    plot.autoRefresh();
  }

  setRulersYAxis(axis) {
    var plot = this._rulerList[0].plot();
    var doReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    //var oldAxis = this._rulerList[0].xAxis();
    for (var i = 0; i < this._rulerList.length; ++i) {
      this._rulerList[i].setYAxis(axis);
      this._rulerList[i]._picker.setAxis(this._rulerList[i].xAxis(), axis);
    }
    if (this._curveShapeItem)
      this._curveShapeItem.setAxes(_rulerList[0].xAxis(), axis);
    //updateConnectionOnYAxisChange(oldAxis);
    plot.setAutoReplot(doReplot);
    plot.autoRefresh();
  }
}

///////////////////////////////////////////////////
class WatchTable {
  constructor(_rulerGroup) {
    let self = this;
    var firstUpdate = true;

    function makeRow(watch) {
      var watchVariable = watch.name();
      var value = watch.value();

      if (watch.valueType == "number" || watch.valueType == "text") {
        var elemId = watchVariable;
        while (elemId.indexOf(" ") != -1) {
          elemId = elemId.replaceAll(" ", "");
        }
        var row = $("<tr><td>" + watchVariable + "</td></tr>");
        $("#watchTableBody").append(row);
        var valueElem = $(
          "<td><input id=" +
            elemId +
            " type=" +
            watch.valueType +
            '  style="width:100%" value=' +
            value +
            " /></td>"
        );
        row.append(valueElem);
        $("#" + elemId).on("change", watch.cb);
      } else {
        var row2 = $(
          "<tr><td>" + watchVariable + "</td><td>" + value + "</td></tr>"
        );
        $("#watchTableBody").append(row2);
      }
    }

    this.insertInfoRow = function (watch) {
      makeRow(watch);
    };

    function updateRow(row, watch) {
      var watchVariable = watch.name();
      var value = watch.value();

      if (watch.valueType == "number" || watch.valueType == "text") {
        $(row[0].children[1].children).val(value);
      } else {
        row[0].children[1].innerText = value;
      }
    }

    this.updateWatchTable = function () {
      //Static.watchUpdateError; // = false;
      var wl = _rulerGroup._watchList;
      if (firstUpdate && _rulerGroup._curve && _rulerGroup._curve.isVisible()) {
        for (var i = 0; i < wl.length; ++i) {
          var w = wl[i];
          this.insertInfoRow(w);
          if (!w.isEnable()) {
            var rows = $("#watchTableBody")[0].children;
            $(rows[i]).hide();
          }
        }
        firstUpdate = false;
        return;
      }

      if (_rulerGroup._curve && _rulerGroup._curve.isVisible()) {
        var rows = $("#watchTableBody")[0].children;
        for (var i = 0; i < wl.length; ++i) {
          var w = _rulerGroup.watch(i);
          if (!w.isEnable()) {
            $(rows[i]).hide();
          } else {
            if (w._update) updateRow($(rows[i]), w);
            $(rows[i]).show();
          }
        }
      }

      if (Static.showWatchUpdateError && Static.watchUpdateError) {
        if (
          confirm(
            "The application encountered extremely small values that may affect the computation of one or more watches. This may be due to incorrect axes decimal places setup (Plot Property pane: Watch Settings -> Calculation accuracy -> Decimal places in calculation).\n\nWould you like to prevent this message ?"
          )
        ) {
          Static.showWatchUpdateError = false;
        }
      }
    };

    Static.bind("titleChange", function (e, plotItem, title) {
      //Force update of watchTable
      Static.trigger("positionChanged");
    });
  }
}
