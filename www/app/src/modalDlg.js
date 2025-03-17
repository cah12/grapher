"use strict";

"include []";

/**
 * The ModalDlg class defines the standard interface that modal dialogs must use. It may be instantiated directly. However, you should 
 * subclass it to create new dialogs.
 * 
 * When subclassing ModalDlg, you may implement {@link ModalDlg.initializeDialog initializeDialog()} 
 * and {@link ModalDlg.beforeClose beforeClose()}. 
 * 
 * @example
 * class MyModal extends ModalDlg {
    constructor(obj) {
      super(obj);

      const columns = [
        '<div class="col-sm-5">Horizontal:</div>',

        '<div class="col-sm-7">\
            <select id="select1">\
              <option value="bottomAxis">Bottom axis</option>\
              <option value="topAxis">Top axis</option>\
            </select>\
        </div>',
      ];

      const columns2 = [
        '<div class="col-sm-5">Vertical:</div>',
        
        '<div class="col-sm-7">\
            <select id="select2">\
              <option value="leftAxis">Left axis</option>\
              <option value="rightAxis">Right axis</option>\
            </select>\
        </div>',
      ];

      //this.removeAttr(this.okId(), "data-dismiss");
      this.addRow(columns);
      this.addRow(columns2);
      this.addHandler(this.cancelId(), "click", function () {
        console.log("cancel");
      });
      this.addHandler(this.okId(), "click", function () {
        console.log(456);
        //if this.removeAttr(this.okId(), "data-dismiss"); is called, you need to explicitly clo9se the dlg.
        //dlg.closeDlg();
      });
      this.addHandler("select1", "change", function () {
        if ($(this).val() == "bottomAxis") {
          console.log("bottomAxis");
        } else {
          console.log("topAxis");
        }
      });

      this.addHandler("select2", "change", function () {
        if ($(this).val() == "bottomAxis2") {
          console.log("bottomAxis2");
        } else {
          console.log("topAxis2");
        }
      });
    }
  }

  const options = {
    title: "Test Modal",
    dialogSize: "modal-md",
    //hideCancelButton: true,
    //spaceRows: true,
    // beforeDetach: function () {
    //   console.log("beforeDetach");
    // },
  };
  var dlg = new MyModal(options);
  dlg.showDlg();
 */
class ModalDlg {
  constructor(obj) {
    const self = this;
    const { title, hideCancelButton, spaceRows, dialogSize } = obj;
    let m_title = title || "Modal Dialog";
    const m_id = Math.floor(Math.random() * 10000).toString();
    const bodyId = "body" + m_id;
    const footerId = "footer" + m_id;
    const okId = "ok" + m_id;
    const cancelId = "cancel" + m_id;
    const titleId = "title" + m_id;

    let focusId = okId;

    let m_appended = false;

    var str = "modal-dialog modal-sm";

    const dlg = $(
      '\
                          <div class="modal fade" role="dialog">\
                          <div id="dialogSizeClass" class="modal-dialog modal-sm">\
                          <div class="modal-content">\
                          <div class="modal-header">\
                          <button type="button" class="close" data-dismiss="modal">&times;</button>\
                          <h4 id=' +
        titleId +
        ' class="modal-title">' +
        m_title +
        "</h4>\
                          </div>\
                          <div id=" +
        bodyId +
        ' class="modal-body">\
                          \
                          <div id=' +
        footerId +
        ' class="modal-footer" style="padding-right:0px">\
                          <button id=' +
        okId +
        ' type="button" class="btn btn-primary"  data-dismiss="modal">Ok</button><button id=' +
        cancelId +
        ' type="button" class="btn btn-default"  data-dismiss="modal">Cancel</button>\
                          </div>\
                          </div>\
                          </div>\
                          </div>\
                          </div>\
                          '
    );

    this.getDlgModal = function () {
      return dlg;
    };

    $("body").append(dlg);
    if (hideCancelButton) $("#" + cancelId).remove();

    if (dialogSize) {
      $("#dialogSizeClass").removeClass("modal-sm");
      $("#dialogSizeClass").addClass(dialogSize);
    }

    this.closeDlg = function () {
      dlg.modal("hide");
    };

    dlg.off("hidden.bs.modal").on("hidden.bs.modal", function () {
      m_appended = false;
      self.beforeClose();
      dlg.detach();
    });

    dlg.off("shown.bs.modal").on("shown.bs.modal", function () {
      $("#" + focusId).trigger("focus");
    });

    /**
     * Generate an id that is unique within the HTML document from an id that is unique within the dialog.
     * @param {String} idStr Identifier that is unique within the dialog.
     * @returns {String} jQuery selector object that is unique within the HTML document.
     */
    function makeUniqueId(idStr) {
      return idStr + m_id;
    }

    /**
     * Shows the dialog.
     *
     */
    this.showDlg = function () {
      if (dlg) {
        dlg.detach();
      }
      $("body").append(dlg);
      m_appended = true;
      self.initializeDialog();
      dlg.modal({
        backdrop: "static",
      });
    };

    /**
     * Sets the element having the focus when the dialog is displayed.
     * @param {String} id Id of the element having the focus.
     */
    this.setFocus = function (id) {
      focusId = makeUniqueId(id);
    };

    function adjustIds(row) {
      if (row[0].id.length) {
        row[0].id = makeUniqueId(row[0].id);
      }
      const elements = row.find("*");
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].id.length) {
          elements[i].id = makeUniqueId(elements[i].id);
        }
      }
    }

    /**
     * Gets the jQuery selector.
     *
     * @param {String} id Identifier that is unique within the dialog.
     * @returns {object} jQuery selector object that is unique within the HTML document.
     */
    this.selector = function (id) {
      if (!m_appended) $("body").append(dlg);
      const sltr = $("#" + makeUniqueId(id));
      if (!m_appended) dlg.detach();
      return sltr;
    };

    /**
     * Adds a HTML element to the footer.
     * @param {String} element The element to create
     * @example
     * MyModalDlg extends ModalDlg{
     *  constructor(options){
     *    super(options);
     *    ...
     *    this.addFooterElement('<button id="save">Save</button>');
     *    this.addFooterElement('<select name="uploadDefinesType" id="uploadDefinesType"><option value="loadFromLocalFs">from Local System</option><option value="loadFromMongoFs">from Mongo System</option></select>');
     *  }
     * }
     */
    this.addFooterElement = function (element) {
      if (!m_appended) $("body").append(dlg);
      const children = $("#" + footerId)[0].children;
      const el = $(element);
      adjustIds(el);
      $("#" + footerId)[0].insertBefore(el[0], children[0]);
      if (!m_appended) dlg.detach();
    };

    /**
     *
     * @param {Array<String>} arrayOfColumns
     * @param {String} [rowIdOpt]
     * @param {String} [containerIdOpt]
     */
    this.addRow = function (arrayOfColumns, rowIdOpt, containerIdOpt) {
      if (!m_appended) $("body").append(dlg);

      let row = $('<div class="row"/>');
      if (rowIdOpt) {
        //row = $("<div id=" + makeUniqueId(rowIdOpt) + ' class="row"/>');
        row = $("<div id=" + rowIdOpt + ' class="row"/>');
      }

      for (let i = 0; i < arrayOfColumns.length; i++) {
        row.append($(`${arrayOfColumns[i]}`));
      }
      if (arrayOfColumns.length > 0) {
        if (containerIdOpt) {
          const div = $("<div id=" + makeUniqueId(containerIdOpt) + "/>");
          $("#" + bodyId)[0].insertBefore(div[0], $("#" + footerId)[0]);
          div.append(row);
          if (spaceRows) div.append($("<br>"));
        } else {
          $("#" + bodyId)[0].insertBefore(row[0], $("#" + footerId)[0]);
          if (spaceRows)
            $("#" + bodyId)[0].insertBefore($("<br>")[0], $("#" + footerId)[0]);
        }
        adjustIds(row);
      }

      if (!m_appended) dlg.detach();
    };

    /**
     * The addHandler() method sets up a function that will be called whenever the specified event is delivered to the target.
     * @param {String} id Identifier or identifiers (e.g. "myId" or "myId_1, myId_2, myId_3, ...") of the event target.
     * @param {String} eventType Event
     * @param {Function} handler callback function that is invoked when the event is triggered.
     */
    this.addHandler = function (id, eventType, handler) {
      const L = id.split(",");
      if (!m_appended) $("body").append(dlg);
      for (let i = 0; i < L.length; i++) {
        $("#" + makeUniqueId(L[i].trim()))
          .off(eventType)
          .on(eventType, handler);
      }
      if (!m_appended) dlg.detach();
    };

    dlg.detach();
  }

  /**
   * Subclass must implement this method to do all dialog initializing. Attempting to initialize the dialog outside of this method
   * may lead to unexpected behaviour.
   *
   * Internally, this method is called by showDlg() each time showDlg() is invoked. It is called after the dialog is attached to the
   * DOM but before the is shown.
   *
   * Note: The add... methods (i.e. addRow(), addFooterButton() and addHandler()) should not be called within the initializeDialog() method.
   */
  initializeDialog() {}

  /**
   * Subclass must implement this method to do all clean-up annd reset work.
   *
   * Internally, this method is called before the dialog is detached from the DOM but after it is closed.
   */
  beforeClose() {}
}
