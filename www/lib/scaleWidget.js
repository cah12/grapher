"use strict";

/**
 * A Widget which contains a scale.
 *
 * This Widget can be used to decorate composite widgets with a scale.
 * @extends Widget
 */
class ScaleWidget extends Widget {
  constructor(plot, domDivElem, align) {
    super(domDivElem);
    var m_domDiv = this.getElement(); //domDivElem;
    var m_scaleDraw = null;
    var m_title = "";
    var m_plot = plot;

    var minBorderDist = [];
    var borderDist = [];

    var m_titleFont = new Misc.Font(14);
    var m_scaleFont = new Misc.Font(12);

    /**
     * Specify distances of the scale's endpoints from the
     * widget's borders. The actual borders will never be less
     * than minimum border distance.
     * @param {Number} dist1 Left or top Distance
     * @param {Number} dist2 Right or bottom distance
     */
    this.setBorderDist = function (dist1, dist2) {
      if (dist1 != borderDist[0] || dist2 != borderDist[1]) {
        borderDist[0] = dist1;
        borderDist[1] = dist2;
        //layoutScale();
      }
    };

    /**
     * Calculate a hint for the border distances.
     *
     * This member function calculates the distance of the scale's
     * endpoints from the widget borders which is required for the
     * mark labels to fit into the widget. The maximum of this distance
     * and the minimum border distance is returned.
     * @param {object} startAndEndObj Object with two properties: start (for the border width at the beginning of the scale) and end (for the border width at the end of the scale)
     */
    this.getBorderDistHint = function (startAndEndObj) {
      m_scaleDraw.getBorderDistHint(m_scaleFont, startAndEndObj);

      if (startAndEndObj.start < minBorderDist[0])
        startAndEndObj.start = minBorderDist[0];

      if (startAndEndObj.end < minBorderDist[1])
        startAndEndObj.end = minBorderDist[1];
    };

    /**
     * Change the label's font
     * @param {Misc.Font} font New font
     */
    this.setLabelFont = function (fontObj) {
      if (fontObj.th < 0 || fontObj.name === "" || fontObj.style === "") return;
      m_scaleFont = fontObj;
      m_plot.getLayout().adjustLayout(domDivElem, fontObj.th);
    };

    /**
     *
     * @returns {Misc.Font} font use in label
     */
    this.labelFont = function () {
      return m_scaleFont;
    };

    /**
     * Change the title's font
     * @param {Misc.Font} font New font
     */
    this.setTitleFont = function (fontObj) {
      if (fontObj.th < 0 || fontObj.name === "" || fontObj.style === "") return;
      m_titleFont = fontObj;
      m_plot.getLayout().adjustLayout(domDivElem, fontObj.th);
    };

    /**
     *
     * @returns {Misc.Font} font use in title
     */
    this.titleFont = function () {
      return m_titleFont;
    };

    /**
     * Set a scale draw
     *
     * scaleDraw has to be created with new and will be initialized with
     * the attributes of the previous scaleDraw object.
     * @param {ScaleDraw} scaleDraw ScaleDraw object
     */
    this.setScaleDraw = function (scaleDraw) {
      if (typeof scaleDraw == "undefined" || scaleDraw == m_scaleDraw) return;

      var sd = m_scaleDraw;
      if (sd) {
        //scaleDraw.setAlignment( m_scaleDraw.alignment() );
        scaleDraw.setScaleDiv(m_scaleDraw.scaleDiv());

        var transform = null;
        if (m_scaleDraw.scaleMap().transformation())
          transform = m_scaleDraw.scaleMap().transformation().copy();

        scaleDraw.setTransformation(transform);
      }

      //delete d_data->scaleDraw;
      m_scaleDraw = scaleDraw;

      //layoutScale();
    };

    /**
     *
     * @returns {ScaleDraw} scaleDraw of this scale
     */
    this.scaleDraw = function () {
      return m_scaleDraw;
    };

    //! Initialize the scale
    this.initScale = function (align) {
      m_scaleDraw = new ScaleDraw();
      m_scaleDraw.setAlignment(align);
      //m_scaleDraw.setLength( 10 );

      var linearScaleEngine = new LinearScaleEngine();
      m_scaleDraw.setScaleDiv(linearScaleEngine.divideScale(0.0, 100.0, 10, 5));
    };

    if (typeof align === "undefined")
      this.initScale(ScaleDraw.Alignment.LeftScale);
    else this.initScale(align);

    /**
     * Give title new text contents
     * @param {String} title New title
     */
    this.setTitle = function (title) {
      //alert(m_titleFont.th)
      if (m_title === title) return;
      if (title !== "") {
        if (m_title === "") {
          //We are adding a title for the first time. adjust the layout to accomodate it
          //alert(title)
          if (
            this.alignment() === ScaleDraw.Alignment.LeftScale ||
            this.alignment() === ScaleDraw.Alignment.RightScale
          ) {
            m_plot
              .getLayout()
              .adjustLayout(
                m_domDiv,
                parseFloat(m_domDiv.css("width")) + m_titleFont.th
              );
          } else {
            m_plot
              .getLayout()
              .adjustLayout(
                m_domDiv,
                parseFloat(m_domDiv.css("height")) + m_titleFont.th
              );
          }
          Static.trigger("axisTitleAdded", true);
        }
        m_title = title;
      } else {
        //We are clearing the title. reclaim the space
        if (
          this.alignment() === ScaleDraw.Alignment.LeftScale ||
          this.alignment() === ScaleDraw.Alignment.RightScale
        ) {
          m_plot
            .getLayout()
            .adjustLayout(
              m_domDiv,
              parseFloat(m_domDiv.css("width")) - m_titleFont.th
            );
        } else {
          m_plot
            .getLayout()
            .adjustLayout(
              m_domDiv,
              parseFloat(m_domDiv.css("height")) - m_titleFont.th
            );
        }
        m_title = "";
        Static.trigger("axisTitleAdded", false);
      }
      m_plot.getLayout().updateLayout();
    };

    /**
     *
     * @returns {String} title of the scale
     */
    this.title = function () {
      return m_title;
    };

    /**
     * Change the alignment
     * @param {ScaleDraw.Alignment} alignment New alignment
     */
    this.setAlignment = function (alignment) {
      if (m_scaleDraw) m_scaleDraw.setAlignment(alignment);
    };

    /**
     *
     * @returns {ScaleDraw.Alignment} the alignment
     */
    this.alignment = function () {
      if (m_scaleDraw == null) return ScaleDraw.Alignment.LeftScale;

      return m_scaleDraw.alignment();
    };

    /**
     * Calculate the label width
     * @param {String} str label
     * @returns {Number} width of the label
     */
    this.labelWidth = function (str) {
      return m_scaleFont.textSize(str).width;
    };

    /**
     * Draw the scale
     */
    this.draw = function () {
      //alert(painter)
      //var context = this.getContext();
      var longestTick = m_scaleDraw.maxTickLength();
      var spacingBetweenLabelAndTick = m_scaleDraw.spacing();
      var spacingBetweenTitleAndLabel = 10;
      var margin = 10;
      if (m_scaleDraw.orientation() === Static.Vertical) {
        //Compute the required width of widget

        var longestLbl = this.labelWidth(m_scaleDraw.longestLabel());
        var titleWidth = m_title !== "" ? m_titleFont.th : 0; //Title is vertical
        var widgetWidth =
          longestTick +
          spacingBetweenLabelAndTick +
          longestLbl +
          spacingBetweenTitleAndLabel +
          titleWidth +
          margin;

        m_plot.getLayout().adjustLayout(m_domDiv, widgetWidth);
      }
      if (m_scaleDraw.orientation() === Static.Horizontal) {
        var titleHeight = m_title !== "" ? m_titleFont.th : 0;

        var widgetHeight =
          longestTick +
          spacingBetweenLabelAndTick +
          m_scaleFont.th +
          spacingBetweenTitleAndLabel +
          titleHeight +
          margin;

        m_plot.getLayout().adjustLayout(m_domDiv, widgetHeight);
      }
      m_plot.getLayout().updateLayout();

      //We may very likely be painting widgets that are not visible
      var painter = new PaintUtil.Painter(this);
      painter.setFont(m_scaleFont);

      m_scaleDraw.draw(painter);
      if (m_title !== "") {
        painter.setFont(m_titleFont);
        this.drawTitle(painter);
      }
      painter = null;
    };

    /**
     * Rotate and paint a title according to its position.
     * @param {PaintUtil.Painter} painter Painter
     */
    this.drawTitle = function (painter) {
      var canvasWidth = painter.canvasWidth();
      var canvasHeight = painter.canvasHeight();

      painter.save();
      painter.setFont(m_titleFont);

      if (m_scaleDraw.alignment() === ScaleDraw.Alignment.LeftScale) {
        if (m_title !== "") {
          //var tl = painter.context().measureText(m_title).width;
          painter.drawVerticalText(m_title, m_titleFont.th, canvasHeight / 2);
        }
      } else if (m_scaleDraw.alignment() === ScaleDraw.Alignment.RightScale) {
        if (m_title !== "") {
          painter.drawVerticalText(
            m_title,
            canvasWidth - m_titleFont.th,
            canvasHeight / 2,
            true
          );
        }
      } else if (m_scaleDraw.alignment() === ScaleDraw.Alignment.BottomScale) {
        if (m_title !== "") {
          painter.drawText(
            m_title,
            canvasWidth / 2,
            canvasHeight - m_titleFont.th / 2,
            "center"
          );
        }
      } else if (m_scaleDraw.alignment() === ScaleDraw.Alignment.TopScale) {
        if (m_title !== "") {
          painter.drawText(m_title, canvasWidth / 2, m_titleFont.th, "center");
        }
      }
      painter.restore();
    };

    /**
     * Assign a scale division
     *
     * The scale division determines where to set the tick marks.
     * @param {ScaleDiv} scaleDiv Scale Division
     */
    this.setScaleDiv = function (scaleDiv) {
      if (m_scaleDraw.scaleDiv() !== scaleDiv) {
        m_scaleDraw.setScaleDiv(scaleDiv);
        //layoutScale();
        //alert("here")

        Static.trigger("scaleDivChanged");
      }
    };

    Static.bind("scaleDivChanged", this.scaleChange);

    /**
     * Set the transformation
     * @param {Transform} trans Transformation
     */
    this.setTransformation = function (trans) {
      m_scaleDraw.setTransformation(trans);
      //layoutScale();
    };

    this.toString = function () {
      return "[ScaleWidget]";
    };
  }
  /**
   * This function can be overloaded by derived classes.
   *
   * The default implementation does nothing
   */
  scaleChange() {
    //console.log('scaleChanged')
  }
}
