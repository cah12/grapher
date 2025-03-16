"include ['static']";

"use strict";
class LegendMenu {
  constructor(plot) {
    var self = this;
    var el = null;
    var table = null;
    let m_curve = null;

    var penWidthSubMenu = [
      {
        name: "1",
        //img:'images/top.png',
        fun: function () {
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve
          ) {
            m_curve.setPenWidth(1);
            Static.trigger("penAttributeChanged", m_curve);
            return;
          }
          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          var pen = m_curve.pen();
          pen.width = 1;
          m_curve.setPen(pen);
          Static.trigger("penAttributeChanged", m_curve);
        },
      },
      {
        name: "2",
        //img:'images/top.png',
        fun: function () {
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve
          ) {
            m_curve.setPenWidth(2);
            Static.trigger("penAttributeChanged", m_curve);
            return;
          }
          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          var pen = m_curve.pen();
          pen.width = 2;
          m_curve.setPen(pen);
          Static.trigger("penAttributeChanged", m_curve);
        },
      },
      {
        name: "3",
        //img:'images/all.png',
        fun: function () {
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve
          ) {
            m_curve.setPenWidth(3);
            Static.trigger("penAttributeChanged", m_curve);
            return;
          }
          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          var pen = m_curve.pen();
          pen.width = 3;
          m_curve.setPen(pen);
          Static.trigger("penAttributeChanged", m_curve);
        },
      },
      {
        name: "4",
        //img:'images/all.png',
        fun: function () {
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve
          ) {
            m_curve.setPenWidth(4);
            Static.trigger("penAttributeChanged", m_curve);
            return;
          }
          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          var pen = m_curve.pen();
          pen.width = 4;
          m_curve.setPen(pen);
          Static.trigger("penAttributeChanged", m_curve);
        },
      },
      {
        name: "5",
        //img:'images/all.png',
        fun: function () {
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve
          ) {
            m_curve.setPenWidth(5);
            Static.trigger("penAttributeChanged", m_curve);
            return;
          }
          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          var pen = m_curve.pen();
          pen.width = 5;
          m_curve.setPen(pen);
          Static.trigger("penAttributeChanged", m_curve);
        },
      },
    ];

    this.getPenWidthSubMenu = function () {
      return penWidthSubMenu;
    };

    var penSubMenu = [
      {
        name: "color",
        fun: function () {
          var colorSelector = $('<input type="color" style="opacity:0;">');

          if (!m_curve || m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve)
            return;
          colorSelector.val(Utility.colorNameToHex(m_curve.pen().color));
          colorSelector.change(function () {
            var pen = m_curve.pen();
            pen.color = $(this).val();
            m_curve.setPen(pen);
            Static.trigger("penAttributeChanged", m_curve);
            colorSelector.remove();
          });
          colorSelector.trigger("click");
        },
      },

      /*style
        solid
        dash : ctx.setLineDash([10, 5])
        dashDot : ctx.setLineDash([12, 5, 3, 5])
        dashDotDot : ctx.setLineDash([12, 5, 3, 5, 3, 5])
        dot : ctx.setLineDash([2, 8])
         */

      {
        name: "line style",
        //title: 'It will replace row',
        //img:'images/replace.png',
        subMenu: [
          {
            name: "solid",
            //img:'images/top.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              var pen = m_curve.pen();
              pen.style = "solid";
              m_curve.setPen(pen);
              Static.trigger("penAttributeChanged", m_curve);
            },
          },
          {
            name: "dot",
            //img:'images/top.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              var pen = m_curve.pen();
              pen.style = "dot";
              m_curve.setPen(pen);
              Static.trigger("penAttributeChanged", m_curve);
            },
          },
          {
            name: "dash",
            //img:'images/all.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              var pen = m_curve.pen();
              pen.style = "dash";
              m_curve.setPen(pen);
              Static.trigger("penAttributeChanged", m_curve);
            },
          },
          {
            name: "dashDot",
            //img:'images/all.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              var pen = m_curve.pen();
              pen.style = "dashDot";
              m_curve.setPen(pen);
              Static.trigger("penAttributeChanged", m_curve);
            },
          },
          {
            name: "dashDotDot",
            //img:'images/all.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              var pen = m_curve.pen();
              pen.style = "dashDotDot";
              m_curve.setPen(pen);
              Static.trigger("penAttributeChanged", m_curve);
            },
          },
        ],
      },
      {
        name: "pen width",
        //title: 'It will replace row',
        //img:'images/replace.png',
        subMenu: penWidthSubMenu, //
      },
    ];

    this.getPenSubMenu = function () {
      return penSubMenu;
    };

    /////////////submenu1///////////////////
    var subMenu1 = [
      /*style
            solid
            dash : ctx.setLineDash([10, 5])
            dashDot : ctx.setLineDash([12, 5, 3, 5])
            dashDotDot : ctx.setLineDash([12, 5, 3, 5, 3, 5])
            dot : ctx.setLineDash([2, 8])
             */

      {
        name: "style",
        //title: 'It will replace row',
        //img:'images/replace.png',
        subMenu: [
          {
            name: "Rectangle",
            //img:'images/top.png',
            fun: function () {
              //Utility.addSymbol(getCurve(), Symbol2.Style.MRect);
              Utility.addSymbol(m_curve, Symbol2.Style.MRect);
            },
          },
          {
            name: "Cross",
            //img:'images/top.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Cross);
            },
          },
          {
            name: "Diamond",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Diamond);
            },
          },
          {
            name: "Ellipse",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Ellipse);
            },
          },
          {
            name: "Diagonal cross",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.XCross);
            },
          },
          /*,{
                    name: 'Triangle',
                    //img:'images/all.png',
                    fun:function(){
                    Utility.addSymbol(m_curve, Triangle)
                    }
                    }*/
          {
            name: "None",
            //img:'images/all.png',
            fun: function () {
              if (
                !m_curve ||
                m_curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve
              )
                return;
              m_curve.setSymbol(null);
            },
          },
        ],
      },
    ];
    ///////////////////////////////
    ////////////////////////////subMenu2
    var subMenu2 = [
      ///////////

      /*style
            solid
            dash : ctx.setLineDash([10, 5])
            dashDot : ctx.setLineDash([12, 5, 3, 5])
            dashDotDot : ctx.setLineDash([12, 5, 3, 5, 3, 5])
            dot : ctx.setLineDash([2, 8])
             */

      {
        name: "style",
        //title: 'It will replace row',
        //img:'images/replace.png',
        subMenu: [
          {
            name: "Rectangle",
            //img:'images/top.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.MRect);
            },
          },
          {
            name: "Cross",
            //img:'images/top.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Cross);
            },
          },
          {
            name: "Diamond",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Diamond);
            },
          },
          {
            name: "Ellipse",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.Ellipse);
            },
          },
          {
            name: "Diagonal cross",
            //img:'images/all.png',
            fun: function () {
              Utility.addSymbol(m_curve, Symbol2.Style.XCross);
            },
          },
          /*,{
                    name: 'Triangle',
                    //img:'images/all.png',
                    fun:function(){
                    Utility.addSymbol(m_curve, Triangle)
                    }
                    }*/
          {
            name: "None",
            //img:'images/all.png',
            fun: function () {
              if (!m_curve) return;
              //m_curve.setSymbol(null);
              Utility.addSymbol(m_curve, Symbol2.Style.NoSymbol);
            },
          },
        ],
      },
      {
        name: "size",
        subMenu: [
          {
            name: "5x5",
            fun: function () {
              Utility.setSymbolSize(m_curve, 5);
            },
          },
          {
            name: "6x6",
            fun: function () {
              Utility.setSymbolSize(m_curve, 6);
            },
          },
          {
            name: "8x8",
            fun: function () {
              Utility.setSymbolSize(m_curve, 8);
            },
          },
          {
            name: "10x10",
            fun: function () {
              Utility.setSymbolSize(m_curve, 10);
            },
          },
          {
            name: "12x12",
            fun: function () {
              Utility.setSymbolSize(m_curve, 12);
            },
          },
          {
            name: "15x15",
            fun: function () {
              Utility.setSymbolSize(m_curve, 15);
            },
          },
        ],
      },
      {
        name: "fill brush",
        //title: 'It will merge row',
        //img:'images/merge.png',
        //disable: true,
        fun: function () {
          var colorSelector = $('<input type="color" style="opacity:0;">');
          //self.el.append(colorSelector)

          if (!m_curve) return;
          var sym = m_curve.symbol();
          if (sym) {
            var brush = sym.brush();
            var c = brush.color;
            if (c == "noBrush") {
              c = "#000000";
            }
            colorSelector.val(Utility.colorNameToHex(c));
            colorSelector.change(function () {
              //console.log($(this).val())
              //console.log(el.text())
              //$(this).remove();

              //var pen = m_curve.pen()
              brush.color = $(this).val();
              sym.setBrush(brush);
              plot.autoRefresh();
              plot.updateLegend(m_curve);
              Static.trigger("symbolAttributeChanged", m_curve);
              colorSelector.remove();
            });
            colorSelector.trigger("click");
          }
        },
      },
      {
        name: "pen",
        //img: 'images/update.png',
        //title: 'update button',
        //disable: true,
        subMenu: [
          {
            name: "color",
            fun: function () {
              var colorSelector = $('<input type="color" style="opacity:0;">');

              if (!m_curve) return;
              var sym = m_curve.symbol();
              if (!sym) return;
              colorSelector.val(Utility.colorNameToHex(sym.pen().color));
              colorSelector.change(function () {
                var pen = sym.pen();
                pen.color = $(this).val();
                sym.setPen(pen);
                plot.autoRefresh();
                plot.updateLegend(m_curve);
                Static.trigger("symbolAttributeChanged", m_curve);
                colorSelector.remove();
              });
              colorSelector.trigger("click");
            },
          },
          {
            name: "pen width",
            subMenu: [
              {
                name: "1",
                fun: function () {
                  Utility.setSymbolPenWidth(m_curve, 1);
                },
              },
              {
                name: "2",
                fun: function () {
                  Utility.setSymbolPenWidth(m_curve, 2);
                },
              },
              {
                name: "3",
                fun: function () {
                  Utility.setSymbolPenWidth(m_curve, 3);
                },
              },
              {
                name: "4",
                fun: function () {
                  Utility.setSymbolPenWidth(m_curve, 4);
                },
              },
              {
                name: "5",
                fun: function () {
                  Utility.setSymbolPenWidth(m_curve, 5);
                },
              },
            ],
          },
        ],
      },
    ];

    var menu1 = [
      {
        pos: 0,
        name: "curve brush",
        img: Static.imagePath + "brush.png",
        title: "Set the fill color.",
        fun: function () {
          Utility.setCurveBrush(m_curve, function (curve) {
            Static.trigger("curveBrushChanged", curve);
          });
        },
      },
      {
        pos: 4,
        name: "remove",
        img: Static.imagePath + "trash.png",
        title: "Removes the curve from the plot.",
        fun: function () {
          if (!m_curve) return;
          plot.trashDlg.trash(m_curve);
          //m_curve.detach();
        },
      },
      {
        pos: 5,
        name: "rename",
        img: Static.imagePath + "rename.png",
        title: "Renames the curve.",
        fun: function () {
          if (!m_curve) return;
          Utility.curveRenameDlg(m_curve.title(), m_curve.plot());
        },
      },
      {
        pos: 7,
        name: "symbol",
        img: Static.imagePath + "symbol.png",
        title: "attach/modify curve symbol",
        subMenu: null,
      },
      {
        pos: 8,
        name: "pen",
        img: Static.imagePath + "pen.png",
        title: "modify/change curve pen",
        subMenu: penSubMenu,
      },
      {
        pos: 9,
        name: "copy",
        img: Static.imagePath + "copy.png",
        title: "Copy the curve.",
        fun: function () {
          if (!m_curve) return;
          Utility.copyCurve(m_curve);
        },
      },
    ];

    this.getCurve = function () {
      return m_curve;
    };

    var getCurve = function () {
      //el == span  if el == font el.parent().parent() == span
      if (el == undefined) {
        return null;
      }
      var txt = null;
      if (el && el[0] && el[0].tagName == "FONT") {
        txt = el.parent().parent().attr("curveName");
      } else {
        txt = el.attr("curveName");
      }
      return plot.findPlotCurve(txt);
    };

    var menuModificationCb = function () {};

    this.setMenuModificationCb = function (cb) {
      menuModificationCb = cb;
    };

    var initialize = function () {
      //plot, detachCb, curveFitCb) {
      var _menuItemName = "";

      function indexOfMenuItemCb(_name, legendMenu) {
        _menuItemName = _name;
        return legendMenu.findIndex(findIndexOfMenuItemCb);
      }

      function findIndexOfMenuItemCb(obj) {
        return obj.name == _menuItemName;
      }

      table = $(plot.getLayout().getLegendDiv().children()[0]);

      function doLegenMenu(x, y) {
        var res = [];

        var ele = document.elementFromPoint(x, y);
        while (ele && ele.tagName != "BODY" && ele.tagName != "HTML") {
          res.push(ele);
          ele.style.display = "none";
          ele = document.elementFromPoint(x, y);
        }
        for (var i = 0; i < res.length; i++) {
          res[i].style.display = "";
        }
        var _ele = null;
        for (var i = 0; i < res.length; i++) {
          if (res[i].tagName !== "LABEL" && res[i].tagName !== "FONT") continue;
          _ele = res[i];
          break;
        }
        //console.log(_ele)

        if (el && el.menuAppended !== undefined && el.menuAppended)
          el.contextMenu("destroy");
        el = $(_ele).parent();
        //el.menuAppended = true;
        m_curve = getCurve();
        if (!m_curve) return;
        menuModificationCb();
        var subMenuIndex = indexOfMenuItemCb("symbol", menu1);
        if (subMenuIndex > -1) {
          menu1[subMenuIndex].subMenu = subMenu1;
          if (
            m_curve &&
            m_curve.rtti == PlotItem.RttiValues.Rtti_PlotCurve &&
            m_curve.symbol()
          ) {
            menu1[subMenuIndex].subMenu = subMenu2;
          }
        }
        el.menuAppended = true;
        el.contextMenu(menu1, {
          triggerOn: "contextmenu",
          zIndex: 1,
          onClose: function (data, event) {
            m_curve = 0;
          },
        });
      }

      Static.bind("itemAttached", function (e, plotItem, on) {
        if (!on) m_curve = 0;
      });

      table.off("touchstart").on("touchstart", function (e) {
        var x = e.originalEvent.touches[0].pageX;
        var y = e.originalEvent.touches[0].pageY;
        doLegenMenu(x, y);
      });

      table.off("mousedown").on("mousedown", function (e) {
        if (!Static.isMobile && e.button != 2) {
          //not right button
          return;
        }
        var x = e.pageX;
        var y = e.pageY;
        doLegenMenu(x, y);
      });
    };

    function insertItems(list) {
      for (var i = 0; i < list.length; ++i) {
        var found = _.find(menu1, function (item) {
          return item.name == list[i].name;
        });
        if (found !== undefined) {
          //console.warn("Multiple menu items with name \"" + list[i].name + '"');
          continue;
        }
        menu1.push(list[i]);
      }
    }

    function sortItems() {
      menu1 = menu1.sort(function (a, b) {
        return a.pos - b.pos;
      });
    }

    function removeItemAtIndex(list, index) {
      if (index > -1) {
        list.splice(index, 1);
      }
    }

    this.modifyMenu = function (name, modificationDataObj) {
      if (name == null) {
        if (!_.isArray(modificationDataObj)) {
          var found = _.find(menu1, function (item) {
            return item.name == modificationDataObj.name;
          });
          if (found == undefined) {
            menu1.push(modificationDataObj);
          }
        } else {
          insertItems(modificationDataObj);
        }
        sortItems();
        return;
      }
      var index1 = -1;
      var menu1Item = _.find(menu1, function (item, ind) {
        index1 = ind;
        return item.name == name;
      });
      if (menu1Item == undefined) {
        return;
      }
      if (_.isEmpty(modificationDataObj)) {
        removeItemAtIndex(menu1, index1);
        return;
      }
      menu1Item.pos = modificationDataObj.pos || menu1Item.pos;
      menu1Item.name = modificationDataObj.name || menu1Item.name;
      menu1Item.img = modificationDataObj.img || menu1Item.img;
      menu1Item.title = modificationDataObj.title || menu1Item.title;
      menu1Item.fun = modificationDataObj.fun || menu1Item.fun;
      menu1 = sortItems(menu1);
    };

    if (plot.legend()) {
      initialize();
    } else {
      Static.bind("legendInserted", function () {
        initialize();
        Static.unbind("legendInserted");
      });
    }
  }
}
