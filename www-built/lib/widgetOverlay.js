

/**
 * An overlay for a widget.
 * 
 * The main use case of an widget overlay is to avoid heavy repaint operation of the widget below. e.g. in combination with the plot 
 * canvas an overlay avoid replots as the content of the canvas can be restored from its backing store. WidgetOverlay is an abstract 
 * base class. Deriving classes are supposed to reimplement the following method:
- {@link WidgetOverlay#drawOverlay drawOverlay()}

Internally, {@link PlotPicker} uses overlays for displaying the rubber band and the tracker text.
* @extends Widget
 */
class WidgetOverlay extends Widget {
  /**
   *
   * @param {Widget} w Parent widget, where the overlay is aligned to
   * @example
   * const plot new Plot();
   * const overlay = new WidgetOverlay(plot.getCentralWidget());
   */
  constructor(w) {
    super(w);
    const self = this;
    this.curve = null;

    Static.bind("itemAttached", function (e, plotItem, on) {
      if (!on) self.curve = 0;
    });

    //called by updateOverlay() to perform drawing
    this.draw = function () {
      let p = new PaintUtil.Painter(this);
      this.drawOverlay(p);
      p = null;
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[WidgetOverlay]";
    };
  }

  /**
   * Recalculate and repaint the overlay
   */
  updateOverlay() {
    this.draw();
  }

  /**
   * Draw the widget overlay
   * @param {PaintUtil.Painter} painter Painter
   */
  drawOverlay(painter) {
    console.warn("drawOverlay() not reimplemented");
  }
}
