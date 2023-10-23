"use strict";

/**
 * Attributes of an entry on a legend.
 *
 * LegendData is a container to exchange attributes, that are only known to the plot-item and legend. By overloading
 * PlotItem.legendData() different attributes and a modified ( or completely different ) implementation of a legend could be used.
 *
 */
class LegendData extends EnumBase {
  constructor() {
    super();
    var m_map = {};
    var m_empty = true;

    /**
     * Returns the value of the TitleRole attribute
     * @returns {LegendData.Role}
     */
    this.title = function () {
      return this.value(LegendData.Role.TitleRole);
    };

    /**
     * Returns value of the IconRole attribute
     * @returns {LegendData.Role}
     */
    this.icon = function () {
      return this.value(LegendData.Role.IconRole);
    };

    /**
     * Returns value of the ModeRole attribute
     * @returns {(LegendData.Role | LegendData.Mode)}
     */
    this.mode = function () {
      if (this.hasRole(LegendData.Role.ModeRole))
        return this.value(LegendData.Role.ModeRole);
      return LegendData.Mode.ReadOnly;
    };

    /**
     * Set an attribute value
     * @param {Number} role Attribute role
     * @param {var} Attribute value Attribute value
     */
    this.setValue = function (role, val) {
      //m_data.push({role:role, value:val});
      m_map[role] = val;
      m_empty = false;
    };

    /**
     * Returns true when the internal map is empty
     * @returns {Boolean} true/false
     */
    this.isValid = function () {
      return !m_empty;
    };

    /**
     * Returns true when the internal map has an entry for role
     * @param {Number} role Attribute role
     * @returns {Boolean} role true / false
     */
    this.hasRole = function (role) {
      return contains(role);
    };

    /**
     * @param {Number} role Attribute role
     * @returns {Number} Attribute value for a specific role
     */
    this.value = function (role) {
      if (!contains(role)) return null;
      return m_map[role];
    };

    function contains(role) {
      if (typeof m_map[role] === "undefined") return false;
      return true;
    }

    /**
     *
     * @returns {String} A string representing the object.
     */
    this.toString = function () {
      return "[LegendData]";
    };
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link LegendData.Mode}</div>
 *
 * Mode defining how a legend entry interacts.
 * @name LegendData.Mode
 * @readonly
 * @property {Number} ReadOnly          The legend item is not interactive, like a label.
 * @property {Number} Clickable         The legend item is clickable, like a push button.
 * @property {Number} Checkable         The legend item is checkable, like a checkable button.
 *
 */
Enumerator.enum("Mode { ReadOnly , Clickable , Checkable }", LegendData);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link LegendData.Role}</div>
 *
 * Identifier instructing how to interpret data. The UserRole has a value of 32
 * @name LegendData.Role
 * @readonly
 * @property {Number} ModeRole          The value is a mode.
 * @property {Number} TitleRole         The value is a title.
 * @property {Number} IconRole          The value is an icon.
 * @property {Number} UserRole          Values < UserRole are reserved for internal use.
 */
Enumerator.enum(
  "Role { ModeRole , TitleRole , IconRole , UserRole = 32 }",
  LegendData
);

/**
 * Abstract base class for legend widgets.
 *
 * Legends under control of the Plot layout system need to be derived from AbstractLegend.
 * @abstract
 */
class AbstractLegend {
  constructor() {
    Utility.makeAbstract(this, AbstractLegend);
    var m_plot = null;
    //var m_checked = false;
    var m_legendDiv = null;
    var m_maxChar = ""; //Number of characters in longest label
    //var m_iconWidth = 0;
    var m_maxWidth = 100;
    var margin = 8;
    var m_checkChangeFn = function (plotItem, check) {
      plotItem.setVisible(!check);
      m_plot.autoRefresh();
    };

    if (typeof checkChangeFn !== "undefined") m_checkChangeFn = checkChangeFn;

    var m_itemList = [];

    this.indexInLegend = function (plotItem) {
      return m_itemList.indexOf(plotItem);
    };

    var tbl = $("<table/>");

    this.legendTableElement = function () {
      return tbl;
    };

    /**
     * Set the DIV element that houses the legend.
     * @param {HTMLElement} div DIV element housing the legend
     */
    this.setLegendDiv = function (div) {
      if (m_legendDiv) {
        return;
      }
      m_legendDiv = div;
      m_legendDiv.append(tbl);
      m_legendDiv.css("overflow", "auto");
    };

    /**
     * Get the DIV element that houses the legend.
     * @returns {HTMLElement} DIV element
     */
    this.legendDiv = function () {
      return m_legendDiv;
    };

    /**
     * Associate the lengend with a plot. The plot becomes the owner (parent) of the legend and the layout system
     * is able to magnage changes in size and position.
     * @param {Plot} plot the plot that owns the legend.
     */
    this.setPlot = function (plot) {
      m_plot = plot;
      if (m_legendDiv !== $("#legendDiv")) {
        plot.getLayout().getPlotDiv().append(m_legendDiv);
      }
    };

    /**
     * Returns true if the legend contains no items.
     * @returns {Boolean} true / false
     */
    this.isEmpty = function () {
      return tbl[0].rows.length >= 1 ? false : true;
    };

    /**
     * Sets the width that would not be exceeded by the legend. The legend width expands or shrinks based on the width
     * of legend items. Horizontal scroll bars are introduce at max width.
     * @param {Number} width max width.
     */
    this.setMaxWidth = function (width) {
      m_maxWidth = width;
    };

    /**
     * Returns the width that the legend will not exceed.
     * @returns {Number} maximum width
     */
    this.maxWidth = function () {
      return m_maxWidth;
    };

    this.maxIconWidth = function () {
      let w = 0;
      const items = m_plot.itemList();
      for (let i = 0; i < items.length; i++) {
        var itemData = items[i].legendData()[0];
        if (!itemData.isValid()) continue;
        var icon = itemData.icon();
        if (icon && icon.width() > w) w = icon.width();
      }
      return w;
    };

    /**
     * Calculates and returns the width of the legend DIV element. The calculation considers each lengend item's text, font, icon size and margin.
     * The value returned is never greater than maximum width.
     * @returns {Number} lengend width
     */
    this.legendDivWidth = function () {
      var w =
        //m_plot.legendFont().textSize(m_maxChar).width + m_iconWidth + margin;
        m_plot.legendFont().textSize(m_maxChar).width +
        this.maxIconWidth() +
        margin;
      return w < this.maxWidth() ? w : this.maxWidth();
    };

    //Helper
    function reIndexRowElement(rowElement, newIndex) {
      var Children = $(rowElement).parent().children();
      var target = Children[newIndex];

      if ($(rowElement).index() > newIndex) {
        if (target == null) {
          target = Children[0];
        }
        if (target != rowElement && target != null) {
          $(target).before(rowElement);
        }
      } else {
        if (target == null) {
          target = Children[Children.length - 1];
        }
        if (target != rowElement && target != null) {
          $(target).after(rowElement);
        }
      }
    }

    const mj = function (tex) {
      return MathJax.tex2svg(tex, { em: 16, ex: 6, display: false });
    };

    this.setTooltip = function (rowIndex, tooltip) {
      const toolTipSpanElem = $($(tbl.find("TR")[rowIndex]).find("SPAN")[1]);
      const tooltipParts = tooltip.split("\n");

      try {
        // display and re-render the expression
        MathJax.typesetClear();
        toolTipSpanElem[0].innerHTML = "";

        if (tooltipParts[1]) {
          let child0 = mj(tooltipParts[0]);
          let tooltipParts1 = tooltipParts[1]
            .replace("Inflection point", "Infltn.~point")
            .replace("Turning point", "Turning~point")
            .replace("Intersection point", "Intersn.~point");

          let child = Utility.tex2svgMultiline(tooltipParts1, 60, {
            em: 16,
            ex: 6,
            display: false,
          });

          child.innerHTML = child0.innerHTML + `<br>` + child.innerHTML;
          toolTipSpanElem[0].appendChild(child);
        } else {
          let child = mj(tooltipParts[0]);
          toolTipSpanElem[0].appendChild(child);
        }
      } catch (err) {}
    };

    let rightClickActive = false;
    let dontScroll = false;

    this.doAddItem = function (plotItem, rowNumber) {
      function accumRowHeight(rowIndex) {
        const rows = tbl.find("TR");
        let result = 0;
        for (let i = 0; i <= rowIndex; i++) {
          result += parseInt($(rows[i]).css("height"));
        }
        return result;
      }

      let delayExpired = false;

      let hover = false;
      let tm = null;
      let mouseDown = false;
      function showTooltip(rowIndex, show = true) {
        if (!Static.showTooltipLegend) {
          return;
        }
        const toolTipSpanElem = $($(tbl.find("TR")[rowIndex]).find("SPAN")[1]);

        if (show) {
          clearTimeout(tm);
          tm = setTimeout(function () {
            if (!hover || mouseDown) return;
            if (rightClickActive) return;

            const rows = tbl.find("TR");
            for (let i = 0; i < rows.length; i++) {
              $($(rows[i]).find("SPAN")[1]).css("visibility", "hidden");
            }
            toolTipSpanElem.css("visibility", "visible");
          }, 500);
        } else {
          toolTipSpanElem.css("visibility", "hidden");
        }
      }

      var font = plotItem.plot().legendFont();

      var itemData = plotItem.legendData()[0];

      if (!itemData.isValid()) return;

      var title = itemData.title();
      var icon = itemData.icon();

      //if (icon && icon.width() > m_iconWidth) m_iconWidth = icon.width();
      var row = $("<tr></tr>");

      var tdElem = $('<td class="unchecked"></td>');
      var textLabel = $("<label/>");
      textLabel.css("color", font.fontColor);
      textLabel.css("font-size", font.th);
      textLabel.css("font-weight", font.weight);
      textLabel.css("font-family", font.name);
      textLabel.text(" " + title);

      var spanElem = $("<span></span>");
      var toolTipSpanElem = $("<span class='legendTooltip'></span>");
      //We store the unmodified title in the curveName attribute. The title in the label may be modified by adding space
      //or by locale translation.
      spanElem.attr("curveName", title);
      if (icon) icon.setParent(spanElem);
      textLabel.appendTo(spanElem);
      spanElem.appendTo(tdElem);
      toolTipSpanElem.appendTo(tdElem);

      //toolTipSpanElem.appendTo(m_plot.getLayout().getCentralDiv());

      row.append(tdElem);

      tbl.append(row);

      if (rowNumber !== undefined && rowNumber > -1) {
        m_itemList.splice(rowNumber, 0, plotItem);
        reIndexRowElement(row, rowNumber);
      } else {
        m_itemList.push(plotItem);
      }

      let scrollTop = 0;

      row.on("mouseenter", function (e) {
        if (mouseDown) return;
        hover = true;
        const hasScroll =
          m_legendDiv[0].scrollHeight > m_legendDiv[0].offsetHeight;
        //console.log(hasScroll);
        const toolTipSpanElem = $($(this).find("SPAN")[1]);
        if (toolTipSpanElem.html() == "") {
          return;
        }
        const tBarHeight = parseInt(m_plot.tbar.html().css("height"));
        let legendTop = parseInt(m_legendDiv.css("top")) + tBarHeight;
        let topOfTooltip = 0;

        //console.log($(":root")[0].style.getPropertyValue("--main-bg-color"));
        //toolTipSpanElem.css("background-color", Static.tooltipLegendBackground);
        //font-family:Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
        //toolTipSpanElem.css("font-family", "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif");
        //use top arrow
        toolTipSpanElem.removeClass("legendTooltip1");
        toolTipSpanElem.addClass("legendTooltip");
        topOfTooltip = legendTop + accumRowHeight(row.index());

        if (
          topOfTooltip - parseInt(toolTipSpanElem.css("height")) >
          legendTop +
            m_legendDiv.scrollTop() +
            0.5 * parseInt(row.css("height"))
        ) {
          //use bottom arrow
          toolTipSpanElem.removeClass("legendTooltip");
          toolTipSpanElem.addClass("legendTooltip1");
          //$(".legendTooltip1:after").css("border-color", "#7e5730 transparent transparent transparent");

          topOfTooltip =
            legendTop +
            accumRowHeight(row.index()) -
            parseInt(toolTipSpanElem.css("height")) -
            parseInt(row.css("height"));
        }

        if (hasScroll) {
          topOfTooltip = Math.min(
            topOfTooltip,
            topOfTooltip - m_legendDiv[0].scrollTop
          );
        }

        toolTipSpanElem.css("top", topOfTooltip + 16);
        toolTipSpanElem.css(
          "left",
          parseInt(m_plot.plotDiv.css("left")) +
            parseInt(m_plot.plotDiv.css("width")) -
            parseInt(toolTipSpanElem.css("width")) -
            0.6 * parseInt(row.css("width"))
        );
        showTooltip($(this).index());
      });

      row.on("mouseleave", function (e) {
        if (mouseDown) return;
        hover = false;
        showTooltip($(this).index(), false);
      });

      m_legendDiv.on("scroll", function () {
        //console.log(486);
        if (dontScroll || rightClickActive) {
          $(this).scrollTop(scrollTop);
        } else {
          scrollTop = m_legendDiv[0].scrollTop;
        }
      });

      $(window).on("mousemove", function (e) {
        dontScroll = false;
      });

      row.on("mousedown", function (e) {
        dontScroll = true;
        rightClickActive = false;
        if (e.which == 3) {
          rightClickActive = true;
          showTooltip($(this).index(), false);
        }
      });

      $(window).on("mousedown", function (e) {
        mouseDown = true;
        if (e.which !== 3) {
          rightClickActive = false;
        }
      });

      $(window).on("mouseup", function (e) {
        mouseDown = false;
        //rightClickActive = false;
      });

      tdElem.on("click", plotItem, function (event) {
        showTooltip($(this).parent().index(), false);
        hover = false;
        //dontScroll = true;
        let m_checked = false;
        if ($(this).attr("class") === "unchecked") {
          $(this).removeClass("unchecked");
          $(this).addClass("checked");
          m_checked = true;
        } else {
          $(this).removeClass("checked");
          $(this).addClass("unchecked");
          //m_checked = false;
        }
        if (m_checkChangeFn) m_checkChangeFn(event.data, m_checked);
      });

      if (!plotItem.isVisible()) {
        tdElem.click();
      }

      if (plotItem.title().length > m_maxChar.length)
        m_maxChar = plotItem.title();

      //Static.trigger("legendToolTipChanged", plotItem);
    };

    Static.bind("hideAllItems", function () {
      const elements = tbl.find("TD");
      for (let i = 0; i < elements.length; i++) {
        $(elements[i]).removeClass("unchecked");
        $(elements[i]).addClass("checked");
      }
    });

    Static.bind("showAllItems", function () {
      const elements = tbl.find("TD");
      for (let i = 0; i < elements.length; i++) {
        $(elements[i]).removeClass("checked");
        $(elements[i]).addClass("unchecked");
      }
    });

    // Static.bind("legendToolTipChanged", function (e, _curve) {
    //   var rowNumber = m_itemList.indexOf(_curve);
    //   const horizontal =
    //     _curve.xAxis() == Axis.AxisId.xBottom ? "Bottom" : "Top";
    //   const vertical = _curve.yAxis() == Axis.AxisId.yLeft ? "Left" : "Right";
    //   let fn = "f(x): N/A";
    //   //if (_curve.fn) fn = `f(${_curve.variable}): ${_curve.fn}`;
    //   //_curve = 0;
    //   let title = "Axes: " + horizontal + ", " + vertical;
    //   if (_curve.fn) title += "\n" + `f(${_curve.variable}): ${_curve.fn}`;
    //   $(tbl[0].rows[rowNumber]).attr("title", title);
    //   _curve = 0;
    // });

    // Static.bind("axisChanged", function (e, axis, _curve) {
    //   Static.trigger("legendToolTipChanged", _curve);
    // });

    function removeElementAt(index) {
      if (index > -1) {
        m_itemList.splice(index, 1);
      }
    }

    //Helper
    function removeClickFromTDElement(rowIndex) {
      $(tbl[0].rows[rowIndex].children[0]).off("click");
    }

    /**
     * Find the legend item representing plotItem and remove it from the lengend.
     * @param {PlotItem} plotItem plot item represented by the legend item to remove
     */
    this.removeItem = function (plotItem) {
      var rowNumber = m_itemList.indexOf(plotItem);
      if (rowNumber < 0) return;
      removeElementAt(rowNumber);
      removeClickFromTDElement(rowNumber);
      //$(tbl[0].rows[rowNumber]).off("titleChanged");
      tbl[0].deleteRow(rowNumber);
      if (parseInt(tbl.css("height")) < parseInt(m_legendDiv.css("height"))) {
        m_legendDiv.css("overflow-y", "auto");
      }
      if (parseInt(tbl.css("width")) < parseInt(m_legendDiv.css("width"))) {
        m_legendDiv.css("overflow-x", "auto");
      }

      return rowNumber;
    };

    /**
     * Remove all legend items from the legend.
     */
    this.clearLegend = function () {
      var numRows = tbl[0].rows.length;
      for (var i = 0; i < numRows; ++i) {
        tbl[0].deleteRow(0);
      }
    };

    /**
     * Get the position (zero index) of the legend item in the legend.
     * @param {String} name the title of the legend item
     * @returns {Number} zero index row number on success or -1 on failure
     */
    this.rowNumberFromName = function (name) {
      var Rows = tbl[0].rows;
      for (var i = 0; i < Rows.length; ++i) {
        if (Rows[i].cells[0].innerText === name) return i;
      }
      return -1; //not found
    };
  }

  /**
   *
   * @returns {String} A string representing the object.
   */
  toString() {
    return "[AbstractLegend]";
  }

  //Subclass overwrite this method.>>>>>>>>>>>>>
  //! \return True, when no plot item is inserted
  /* isEmpty() {
        return true;
    }; */
  //Subclass overwrite this method.
  /*!
    Render the legend into a given rectangle.

    \param painter Painter
    \param rect Bounding rectangle
    \param fillBackground When true, fill rect with the widget background

    \sa renderLegend() is used by QwtPlotRenderer
     */
  renderLegend(painter, rect, fillBackground) {
    return true;
  }
  //Subclass overwrite this method.
  /*!
    \brief Update the entries for a plot item

    \param itemInfo Info about an item
    \param data List of legend entry attributes for the  item
     */
  updateLegend(itemInfo, data) {}

  /**
   * Build a legend item that represents the plot item and add it to the legend.
   *
   * If a row number argument > -1 is provided, the legend item is inserted at that row number. Otherwise, the lengend item is
   * appended to the bottom of the legend.
   * @param {PlotItem} plotItem
   * @param {Number} [rowNumber] Zero index position of the legend item
   */
  addItem(plotItem, rowNumber) {
    this.doAddItem(plotItem, rowNumber);
  }
}

/**
 * The legend widget.
 *
 * The Legend widget is a tabular arrangement of legend items. Legend items might be any type of widget, but in general
 * they will be a Label.
 * @extends AbstractLegend
 */
class Legend extends AbstractLegend {
  constructor() {
    super();
  }
  /**
   *
   * @returns {String} A string representing the object.
   */
  toString() {
    return "[Legend]";
  }
}
