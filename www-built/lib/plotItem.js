

/**
 * Base class for items on the plot canvas.
 *
 * A plot item is "something", that can be painted on the plot canvas, or only affects the scales of the plot widget. They can be categorized as:
 *
 * <dl><dt>Representator<br>A "Representator" is an item that represents some sort of data on the plot canvas. The different representator classes are organized according to the characteristics of the data:
 * <ul><li>QwtPlotMarker Represents a point or a horizontal/vertical coordinate</li>
 * <li>QwtPlotCurve Represents a series of points</li>
 * <li>QwtPlotSpectrogram ( QwtPlotRasterItem ) Represents raster data</li>
 * <li>...</li></ul></dt>
 * <dt><br>Decorators<br>A "Decorator" is an item, that displays additional information, that is not related to any data:
 * <ul><li>QwtPlotGrid</li>
 * <li>QwtPlotScaleItem</li>
 * <li>QwtPlotSvgItem</li>
 * <li>...</li></ul></dt></dl>
 *
 * Depending on the{@link PlotItem.ItemAttribute}flags, an item is included into autoscaling or has an entry on the legend.
 * Before misusing the existing item classes it might be better to implement a new type of plot item ( don't implement a
 * watermark as spectrogram ). Deriving a new type of QwtPlotItem primarily means to implement the YourPlotItem::draw() method.
 *
 */
class PlotItem {
  /**
   *
   * @param {String} tle Title of the plotitem
   */
  constructor(tle) {
    var self = this;
    this.plotId = "";
    var _context = null;
    var _plot = null;
    var cnvs = null;
    var d_interests;

    var m_domDiv = $("#centralDiv");

    var m_isVisible = true;
    var m_attributes = 0x0;
    //interests( 0 ),
    //renderHints( 0 ),
    //renderThreadCount( 1 ),
    var m_z = 0.0;
    var m_xAxis = Axis.AxisId.xBottom;
    var m_yAxis = Axis.AxisId.yLeft;
    var m_title = tle || "";

    this.rtti = PlotItem.RttiValues.Rtti_PlotItem;

    var m_legendIconSize = new Misc.Size(10, 10);

    /**
     *
     * @returns {Misc.Size} Legeng icon size
     * @see {@link PlotItem#setLegendIconSize setLegendIconSize()}
     * @see {@link PlotItem#legendIcon legendIcon()}
     */
    this.getLegendIconSize = function () {
      return m_legendIconSize;
    };

    /**
     * Set the size of the legend icon
     * @param {Misc.Size} size Size
     * @see {@link PlotItem#getLegendIconSize getLegendIconSize()}
     * @see {@link PlotItem#legendIcon legendIcon()}
     */
    this.setLegendIconSize = function (size) {
      m_legendIconSize = size;
      //legendChanged();
      if (_plot) _plot.updateLegend(this);
    };

    /**
     * Toggle an item interest
     * @param {PlotItem.ItemInterest} interest Interest type
     * @param {Boolean} on true/false
     * @see {@link PlotItem#testItemInterest testItemInterest()}
     * @see {@link PlotItem.ItemAttribute ItemAttribute}
     */
    this.setItemInterest = function (interest, on) {
      //if ( d_interests.testFlag( interest ) != on )
      {
        if (on) d_interests |= interest;
        else d_interests &= ~interest;

        this.itemChanged();
      }
    };

    /**
     * Test an item interest
     * @param {PlotItem.ItemInterest} interest Interest type
     * @returns {Boolean} true/false
     * @see {@link PlotItem#setItemInterest setItemInterest()}
     * @see {@link PlotItem.ItemAttribute ItemAttribute}
     */
    this.testItemInterest = function (interest) {
      //return d_interests.testFlag( interest );
      return d_interests & interest;
    };

    /**
     *
     * @returns {Plot} Return attached plot.
     */
    this.plot = function () {
      return _plot;
    };

    /**
     *
     * @returns {String} Title of the item
     * @see {@link PlotItem#setTitle setTitle()}
     */
    this.title = function () {
      return m_title;
    };

    /**
     * Set a new title
     * @param {String} tle Title
     * @see {@link PlotItem#title title()}
     */
    this.setTitle = function (tle) {
      if (m_title !== tle) {
        m_title = tle;
        this.legendChanged();
        this.itemChanged();
        Static.trigger("titleChange", [this, tle]);
      }
    };

    /**
     * Clears the canvas for the central div (i.e. the div in which plotitems are drawn)
     */
    this.clearCanvas = function () {
      this.getContext().clearRect(0, 0, cnvs[0].width, cnvs[0].height);
    };

    /**
     * Attach the item to a plot.
     *
     * This method will attach a PlotItem to the Plot argument. It will first detach the PlotItem
     * from any plot from a previous call to attach (if necessary). If a null argument is passed, it will
     * detach from any Plot it was attached to.
     * @param {Plot} plot Plot widget
     * @see {@link PlotItem#detach detach()}
     */
    this.attach = function (plot) {
      if (plot == _plot) {
        //Cannot attach the same plot more than once
        return;
      }

      if (_plot) {
        _plot.attachItem(this, false);
      }

      _plot = plot;

      if (_plot) {
        //if (cnvs === null) {
        cnvs = $("<canvas />").attr({
          style: "position: absolute; background-color: transparent",
        });
        //console.log("canvas created")
        _plot.getLayout().getCentralDiv().append(cnvs);
        cnvs.css({
          "border-radius": "inherit",
        });

        if (m_z != 0) {
          cnvs.css("zIndex", m_z);
        }
        //}
        _plot.attachItem(this, true);
      }
    };

    /**
     * This method detaches a PlotItem from any Plot it has been associated with.
     * detach() is equivalent to calling attach( null )
     * @see {@link PlotItem#attach attach()}
     */
    this.detach = function () {
      this.attach(null);
    };

    /**
     *
     * @param {Number} z Z order
     */
    this.setZ = function (z) {
      if (m_z !== z) {
        m_z = z;
        if (cnvs) {
          cnvs.css("zIndex", m_z);
        }
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Number} Z order
     */
    this.getZ = function (z) {
      return m_z;
    };

    /**
     *
     * @returns {object} Canvas for the central div (i.e. the div in which plotitems are drawn)
     */
    this.getCanvas = function () {
      return cnvs;
    };

    function syncSizes() {
      if (_plot) {
        var cd = _plot.getLayout().getCentralDiv();
        cnvs[0].width = parseFloat(cd.css("width"));
        cnvs[0].height = parseFloat(cd.css("height"));
      }
    }

    /**
     *
     * @returns {object} 2d context for the central div canvas
     */
    this.getContext = function () {
      syncSizes();
      if (!cnvs) return null;
      return cnvs[0].getContext("2d");
    };

    //Helper
    this._setAxes = function (xAxis, yAxis) {
      if (xAxis == m_xAxis && yAxis == m_yAxis) return;
      if (xAxis == Axis.AxisId.xBottom || xAxis == Axis.AxisId.xTop)
        m_xAxis = xAxis;

      if (yAxis == Axis.AxisId.yLeft || yAxis == Axis.AxisId.yRight)
        m_yAxis = yAxis;

      this.itemChanged();
    };

    /**
     * Toggle an item attribute
     * @param {PlotItem.ItemAttribute} attribute Attribute type
     * @param {*} on true/false
     * @see {@link PlotItem#testItemAttribute testItemAttribute()}
     */
    this.setItemAttribute = function (attribute, on) {
      if (on) m_attributes |= attribute;
      else m_attributes &= ~attribute;
      if (attribute == PlotItem.ItemAttribute.Legend) this.legendChanged();

      this.itemChanged();
    };

    /**
     * Test an item attribute
     * @param {PlotItem.ItemAttribute} attribute Attribute type
     * @returns {Boolean} true/false
     * @see {@link PlotItem#setItemAttribute setItemAttribute()}
     *
     */
    this.testItemAttribute = function (attribute) {
      return m_attributes & attribute;
    };

    /**
     * Show the item
     */
    this.show = function () {
      this.setVisible(true);
    };

    /**
     * Hide the item.
     */
    this.hide = function () {
      this.setVisible(false);
    };

    //Helper
    this.doSetVisible = function (on) {
      if (on !== m_isVisible) {
        m_isVisible = on;
        if (!on) cnvs.hide();
        else cnvs.show();
        this.itemChanged();
        Static.trigger("visibilityChange", [this, on]);
      }
    };

    /**
     *
     * @returns {Boolean} true if visible
     * @see {@link PlotItem#setVisible setVisible()}
     * @see {@link PlotItem#show show()}
     * @see {@link PlotItem#hide hide()}
     */
    this.isVisible = function () {
      return m_isVisible;
    };

    /**
     * Update the legend and call Plot.autoRefresh() for the parent plot.
     * @see {@link PlotItem#legendChanged legendChanged()}
     * @see {@link Plot#autoRefresh autoRefresh()}
     */
    this.itemChanged = function () {
      if (_plot) _plot.autoRefresh();
    };

    /**
     * Update the legend of the parent plot.
     * @see {@link Plot#updateLegend updateLegend()}
     */
    this.legendChanged = function () {
      if (this.testItemAttribute(PlotItem.ItemAttribute.Legend) && _plot)
        _plot.updateLegend(this);
    };

    //Helper
    this._setXAxis = function (axis) {
      if (m_xAxis == axis) return;
      if (axis == Axis.AxisId.xBottom || axis == Axis.AxisId.xTop) {
        m_xAxis = axis;
        this.itemChanged();
      }
      /*if(_plot)
            _plot.autoRefresh()*/
    };

    //Helper
    this._setYAxis = function (axis) {
      if (m_yAxis == axis) return;
      if (axis == Axis.AxisId.yLeft || axis == Axis.AxisId.yRight) {
        m_yAxis = axis;
        this.itemChanged();
      }
    };

    /**
     *
     * @returns {Axis.AxisId} Return xAxis
     */
    this.xAxis = function () {
      return m_xAxis;
    };

    /**
     *
     * @returns {Axis.AxisId} Return yAxis
     */
    this.yAxis = function () {
      return m_yAxis;
    };

    /**
     *
     * @returns {Misc.Rect} Rectangle of the central div element. (i.e. the div where plotitems are drawn)
     */
    this.getCanvasRect = function () {
      syncSizes();
      return new Misc.Rect(new Misc.Point(), cnvs[0].width, cnvs[0].height);
    };

    /**
     *
     * @returns {Misc.Size} Legend icon size
     * @see {@link PlotItem#setLegendIconSize setLegendIconSize()}
     * @see {@link PlotItem#legendIcon legendIcon()}
     */
    this.legendIconSize = function () {
      return this.getLegendIconSize();
    };

    /**
     * The default implementation returns an invalid icon
     * @param {Number} index Index of the legend entry
     * @param {Misc.Size} size Icon size
     * @returns {Graphic} Icon representing the item on the legend
     * @see {@link PlotItem#setLegendIconSize setLegendIconSize()}
     * @see {@link PlotItem#legendData legendData()}
     */
    this.legendIcon = function (index, size) {
      return null;
    };

    // /**
    //  * Return a default icon from a brush.
    //  * The default icon is a filled rectangle used in several derived classes as legendIcon().
    //  * @param {Misc.Brush} brush Fill brush
    //  * @param {Misc.Size} size Icon size
    //  * @returns {object} A filled rectangle
    //  */
    // this.defaultIcon = function (brush, size) {
    //   var icon = null;
    //   if (size.width > 0 && size.height > 0) {
    //     //icon.setDefaultSize( size );

    //     var r = new Misc.Rect(0, 0, size.width, size.height);
    //     icon = new GraphicUtil.Graphic(null, size.width + 1, size.height + 1);
    //     var painter = new GraphicPainter(icon);
    //     painter.fillRect(r, brush);
    //   }

    //   return icon;
    // };

    /**
     * Return all information, that is needed to represent the item on the legend.
     * Most items are represented by one entry on the legend showing an icon and a text. LegendData is basically an Array that can contain any type. It is possible to overload
     * and reimplement legendData() to return almost any type of information, that is understood by the receiver that acts as the legend.
     * The default implementation returns one entry with the title() of the item and the legendIcon().
     * @returns {LegendData} Data needed to represent the item on the legend
     * @see {@link PlotItem#title title()}
     * @see {@link PlotItem#legendIcon legendIcon()}
     * @see {@link Legend}
     */
    this.legendData = function () {
      var data = new LegendData();

      var titleValue = this.title();

      //QVariant titleValue;
      //qVariantSetValue( titleValue, label );
      data.setValue(LegendData.Role.TitleRole, titleValue);
      //alert(this.legendIconSize())
      var iconValue = this.legendIcon(0, this.legendIconSize());
      if (iconValue) {
        //QVariant iconValue;
        //qVariantSetValue( iconValue, graphic );
        data.setValue(LegendData.Role.IconRole, iconValue);
      }

      //var list =[];
      //list.push(data);
      return [data];
    };
  }

  /**
   *
   * @returns {String} A string representation of the object.
   */
  toString() {
    return '[PlotItem "' + this.plotId + '"]';
  }

  /**
   * A width or height < 0.0 is ignored by the autoscaler
   * @returns {Misc.Rect} An invalid bounding rect: Misc.Rect()
   */
  boundingRect() {
    return new Misc.Rect(); //1.0, 1.0, -2.0, -2.0); //{ left:1.0, top:1.0, right:-2.0, bottom:-2.0 , width:-3.0, height: -3.0}; // invalid
  }

  /**
   * Show/Hide the item
   * @param {Boolean} on Show if true, otherwise hide
   * @see {@link PlotItem#isVisible isVisible()}
   * @see {@link PlotItem#show show()}
   * @see {@link PlotItem#hide hide()}
   */
  setVisible(on) {
    this.doSetVisible(on);
  }

  /**
   * Set the X axis
   *
   * The item will painted according to the coordinates its Axes.
   * @param {Axis.AxisId} axis X Axis ( Axis.AxisId.xBottom or Axis.AxisId.xTop )
   * @see {@link PlotItem#setAxes setAxes()}
   * @see {@link PlotItem#setYAxis setYAxis()}
   * @see {@link PlotItem#xAxis xAxis()}
   */
  setXAxis(axis) {
    this._setXAxis(axis);
  }

  /**
   * Set the Y axis
   *
   * The item will painted according to the coordinates its Axes.
   * @param {Axis.AxisId} axis Y Axis ( Axis.AxisId.yLeft or Axis.AxisId.yRight )
   * @see {@link PlotItem#setAxes setAxes()}
   * @see {@link PlotItem#setXAxis setXAxis()}
   * @see {@link PlotItem#yAxis yAxis()}
   */
  setYAxis(axis) {
    this._setYAxis(axis);
  }

  /**
   * Set X and Y axis
   *
   * The item will painted according to the coordinates of its Axes.
   * @param {Axis.AxisId} xAxis X Axis ( Axis.AxisId.xBottom or Axis.AxisId.xTop )
   * @param {Axis.AxisId} yAxis Y Axis ( Axis.AxisId.yLeft or Axis.AxisId.yRight )
   * @see {@link PlotItem#setXAxis setXAxis()}
   * @see {@link PlotItem#setYAxis setYAxis()}
   * @see {@link PlotItem#xAxis xAxis()}
   * @see {@link PlotItem#yAxis yAxis()}
   */
  setAxes(xAxis, yAxis) {
    this._setAxes(xAxis, yAxis);
  }

  /**
   * Draw the item.
   * @param {ScaleMap} xMap Maps x-values into pixel coordinates.
   * @param {ScaleMap} yMap Maps y-values into pixel coordinates.
   */
  draw(xMap, yMap) {
    console.log("No drawing mehod define in subclass");
  }

  /**
   * Subclasses of PlotItem must implement this method and do all required clean-up work prior to item destruction. See example.
   *
   * This method is not called automatically. You must call this method explicitly.
   *
   * If no clean-up work is required, you can rely on the base method, `PlotItem#delete()`, which does nothing.
   * @example
   *
   * class MyPlotItem extends PlotItem{
   *    constructor(){
   *       super();
   *       ...
   *       const cb = function () {
   *          //Doing something on myCustomEvent
   *       };
   *
   *       Static.bind("myCustomEvent", cb);
   *
   *       //Do all your clean-up here
   *       this.cleanUp = function(){
   *           Static.bind("myCustomEvent", cb);
   *       }
   *    }
   *
   *    //Implement the destroy method to remove the handler.
   *    delete() {
   *        this.cleanUp();
   *        super.delete();
   *    }
   * }
   *
   * const plot new Plot();
   * ...
   * const myPlotItem = new MyPlotItem(); //creates an instance that binds `myCustomEvent` to a callback `cb`
   * myPlotItem.attach(plot);
   * ...
   * myPlotItem.detach();
   * myPlotItem.delete();
   *
   */
  delete() {}

  /**
   * Use this method to do all required clean-up work prior to destruction of an array of objects. See example
   * @param {Array<object>} arr Array of objects
   * @example
   *
   * class MyHObject extends HObject{
   *    constructor(){
   *        super();
   *        ...
   *        const cb = function () {
   *          //Doing something on myCustomEvent
   *       };
   *
   *       Static.bind("myCustomEvent", cb);
   *
   *       //Do all your clean-up here
   *       this.cleanUp = function(){
   *           Static.unbind("myCustomEvent", cb);
   *       }
   *    }
   *    //Implement the destroy method to remove the handler.
   *    delete() {
   *        this.cleanUp();
   *        super.delete(); //Call the base class
   *    }
   * }
   *
   * class MyPlotItem extends PlotItem{
   *    constructor(){
   *       super();
   *       ...
   *       let listOfHObjects = [];
   *       for(let i=0; i<4; i++){
   *           listOfHObjects.push(new MyHObject());
   *       }
   *       ...
   *       //Do all your clean-up here
   *       this.cleanUp = function(){
   *           this.deleteArray(listOfHObjects);
   *       }
   *    }
   *
   *    //Implement the destroy method to remove the handler.
   *    delete() {
   *        this.cleanUp();
   *        super.delete();
   *    }
   * }
   *
   * const myPlotItem = new MyPlotItem();
   *
   * myPlotItem.delete();
   *
   *
   */
  deleteArray(arr) {
    arr.forEach((element) => {
      element.delete();
    });
  }
}

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PlotItem.RttiValues}</div>
 *
 * Runtime type information.
 * RttiValues is used to cast plot items, without having to enable runtime type information of the compiler
 * @name PlotItem.RttiValues
 * @readonly
 * @property {Number} Rtti_PlotItem                 Unspecific value, that can be used, when it doesn't matter.
 * @property {Number} Rtti_PlotGrid                 For PlotGrid.
 * @property {Number} Rtti_PlotScale                For PlotScaleItem.
 * @property {Number} Rtti_PlotLegend               For LegendItem.
 * @property {Number} Rtti_PlotMarker               For PlotMarker.
 * @property {Number} Rtti_PlotCurve                For Curve.
 * @property {Number} Rtti_PlotSpectroCurve         For SpectroCurve.
 * @property {Number} Rtti_PlotIntervalCurve        For IntervalCurve.
 * @property {Number} Rtti_PlotHistogram            For Histogram.
 * @property {Number} Rtti_PlotSpectrogram          For PlotSpectrogram.
 * @property {Number} Rtti_PlotGraphic              For PlotGraphic.
 * @property {Number} Rtti_PlotTradingCurve         For PlotTradingCurve.
 * @property {Number} Rtti_PlotBarChart             For PlotBarChart.
 * @property {Number} Rtti_PlotMultiBarChart        For PlotMultiBarChart .
 * @property {Number} Rtti_PlotShape                For PlotShapeItem.
 * @property {Number} Rtti_PlotTextLabel            For PlotTextLabel.
 * @property {Number} Rtti_PlotZone                 For PlotZoneItem.
 * @property {Number} Rtti_PlotVectorField          For PlotVectorField.
 * @property {Number} Rtti_PlotUserItem             For PlotUserItem = 1000.
 */
Enumerator.enum(
  "RttiValues {\
    Rtti_PlotItem = 0 , Rtti_PlotGrid , Rtti_PlotScale , Rtti_PlotLegend ,\
    Rtti_PlotMarker , Rtti_PlotCurve , Rtti_PlotSpectroCurve , Rtti_PlotIntervalCurve ,\
    Rtti_PlotHistogram , Rtti_PlotSpectrogram , Rtti_PlotGraphic , Rtti_PlotTradingCurve ,\
    Rtti_PlotBarChart , Rtti_PlotMultiBarChart , Rtti_PlotShape , Rtti_PlotTextLabel ,\
    Rtti_PlotZone , Rtti_PlotVectorField , Rtti_PlotUserItem = 1000\
  }",
  PlotItem
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PlotItem.ItemAttribute}</div>
 *
 * Plot Item Attributes.
 * Various aspects of a plot widget depend on the attributes of the attached plot items. If and how a single plot item participates in these updates depends on its attributes.
 * @name PlotItem.ItemAttribute
 * @readonly
 * @property {Number} Legend             The item is represented on the legend.
 * @property {Number} AutoScale          The boundingRect() of the item is included in the autoscaling calculation as long as its width or height is >= 0.0
 * @property {Number} Margins            The item needs extra space to display something outside its bounding rectangle.
 */
Enumerator.enum(
  "ItemAttribute { Legend = 0x01 , AutoScale = 0x02 , Margins = 0x04 }",
  PlotItem
);

/**
 * <div style="border-bottom: 1px solid #7393B3; font-size: 20px">enum{@link PlotItem.ItemInterest}</div>
 *
 * Plot Item Interests.
 * Plot items might depend on the situation of the corresponding plot widget. By enabling an interest the plot item
 * will be notified, when the corresponding attribute of the plot widgets has changed.
 * @name PlotItem.ItemInterest
 * @readonly
 * @property {Number} ScaleInterest              The item is interested in updates of the scales
 * @property {Number} LegendInterest             The item is interested in updates of the legend ( of other items ) This flag is intended for items, that want to implement a legend for displaying entries of other plot item.
 */
Enumerator.enum(
  "ItemInterest { ScaleInterest = 0x01 , LegendInterest = 0x02 }",
  PlotItem
);
