

/**
 * The widget is the atom of the user interface: it receives mouse, keyboard
 * and other events from the window system, and paints a representation of
 * itself on the screen. Every widget is rectangular, and they are sorted
 * in a Z-order. A widget is clipped by its parent and by the widgets in
 * front of it.
 *
 * All widgets have a div element are associated with one of the predefined DIV element. The Ids of the predefined DIV elements are:
 * - titleDiv
 * - bottomScaleDiv
 * - footerDiv
 * - topScaleDiv
 * - leftScaleDiv
 * - rightScaleDiv
 * - centralDiv
 * - legendDiv
 *
 * Applications, generally, should use the Widget class as a base class (see example). The plot and Layout classes work together to create all widgets needed for an application. Thus there is no need for applications to extend the Widget class.
 * @extends HObject
 * @example
 *  class MyTitleWidget extends Widget {
 *      constructor(){
 *        super($("#titleDiv"))
 *      }
 *  }
 */
class Widget extends HObject {
  /**
   *
   * @param {object} el jQuery div element selector.
   */
  constructor(el) {
    super(el);
    let self = this;
    let m_visible = true;
    let m_z = 0.0;
    var m_font = new Misc.Font(12);
    let cnvs = $("<canvas />").attr({
      style: "position: absolute; background-color: transparent",
    });
    if (this.getElement()) {
      this.getElement().append(cnvs);
    }

    this.clearCanvas = function () {
      let ctx = this.getContext();
      if (!ctx) return;
      ctx.clearRect(0, 0, cnvs[0].width, cnvs[0].height);
    };

    /**
     *
     * @returns {CanvasRenderingContext2D} object representing a two-dimensional rendering context.
     */
    this.getContext = function () {
      if (!this.getElement()) return null;
      cnvs[0].width = parseFloat(this.getElement().css("width"));
      cnvs[0].height = parseFloat(this.getElement().css("height"));
      return cnvs[0].getContext("2d");
    };

    /**
     *
     * @returns {Number} canvas width
     */
    this.width = function () {
      return cnvs[0].width;
    };

    /**
     *
     * @returns {Number} canvas height
     */
    this.height = function () {
      return cnvs[0].height;
    };

    /**
     * Sets the widget canvas parent DIV
     * @param {HTMLDivElement} el Div element
     */
    this.setCanvasParent = function (el) {
      this.getElement().append(cnvs);
    };

    /**
     *
     * @returns {HTMLCanvasElement} html canvas for the widget
     */
    this.getCanvas = function () {
      return cnvs;
    };

    /**
     *
     * @returns {Misc.Rect} the area inside the widget's margins.
     */
    this.contentsRect = function () {
      let e = this.getElement();
      return new Misc.Rect(
        0,
        0,
        parseFloat(e.css("width")),
        parseFloat(e.css("height"))
      );
    };

    /**
     * En/disable widget's visibility
     * @param {Boolean} on If true, visible.
     */
    this.setVisible = function (on) {
      if (on || typeof on === "undefined") {
        this.getCanvas().show();
        m_visible = true;
      } else {
        this.getCanvas().hide();
        m_visible = false;
      }
    };

    /**
     * Sets visibility to false
     */
    this.hide = function () {
      this.setVisible(false);
    };

    /**
     * Sets visibility to true
     */
    this.show = function () {
      this.setVisible(true);
    };

    /**
     *
     * @returns {Misc.Font} Font use to draw text on the widget
     */
    this.font = function () {
      return m_font;
    };

    /**
     * Sets a ne font use to draw text on the widget
     * @param {Misc.Font} f New font
     */
    this.setFont = function (f) {
      m_font = f;
    };

    /**
     *
     * @returns {Boolean} true, if the widget is visible
     */
    this.isVisible = function () {
      return m_visible;
    };

    /**
     * Sets the z-order
     *
     * Widgets are painted accoding to the z-order
     * @param {Number} z order
     */
    this.setZ = function (z) {
      if (m_z !== z) {
        m_z = z;
        if (cnvs) {
          cnvs.css("zIndex", m_z);
        }
        //this.itemChanged()
      }
    };

    /**
     *
     * @returns {Number} the z-order
     */
    this.getZ = function () {
      return m_z;
    };

    /**
     *
     * @returns Returns a string representing the object.
     */
    this.toString = function () {
      return "[Widget]";
    };
  }

  /**
   * Sets the html element that is the widget canvas parent (container)
   * @param {HTMLDivElement} el canvas container
   */
  setElement(el) {
    this.super(el);
    this.setCanvasParent(el);
  }
}
