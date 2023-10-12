

/**
 * A class for SVG.
 *
 */
class Graphic {
  /**
   * Creates a SVG object
   * @param {object} e jQuery element selector
   * @param {Numbe} w Width of SVG
   * @param {Number} h Height of SVG
   */
  constructor(e, w, h) {
    this.parent = e;
    var m_width = w;
    var m_height = h;

    var m_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    m_svg.setAttribute("width", w);
    m_svg.setAttribute("height", h);
    if (this.parent) this.parent[0].appendChild(m_svg);

    /**
     * Sets the parent element of SVG element
     * @param {object} p Parent element
     */
    this.setParent = function (p) {
      this.parent = p;
      this.parent[0].appendChild(m_svg);
    };

    /**
     *
     * @returns {object} Parent element of SVG element
     */
    this.parent = function () {
      return this.parent;
    };

    /**
     * Sets the width of the SVG element
     * @param {Number} h Width
     */
    this.setWidth = function (w) {
      m_width = w;
    };

    /**
     *
     * @returns {Number} Width of SVG element
     */
    this.width = function () {
      return m_width;
    };

    /**
     * Sets the height of the SVG element
     * @param {Number} h Height
     */
    this.setHeight = function (h) {
      m_height = h;
    };

    /**
     *
     * @returns {Number} Height of SVG element
     */
    this.height = function () {
      return m_height;
    };

    /**
     *
     * @returns {object} SVG element
     */
    this.svg = function () {
      return m_svg;
    };

    /**
     *
     * @returns {String} A string representing the object.
     */
    this.toString = function () {
      return "[Graphic]";
    };
  }
}
