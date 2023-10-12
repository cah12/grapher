"use strict";

"include ['modalDlg']";

class MFontPickerDlg extends ModalDlg {
  constructor() {
    const options = {
      title: "Font Picker",
      spaceRows: true,
    };

    super(options);
    const self = this;
    self.labelFont = null;

    this.addRow([
      '<div class="col-sm-2">Font:</div>',
      '<div class="col-sm-7">\
            <select id="fontPickerFont">\
                <option value="Arial">Arial</option>\
                <option value="Arial Black">Arial Black</option>\
                <option value="Comic Sans MS">Comic Sans MS</option>\
                <option value="Courier New">Courier New</option>\
                <option value="Georgia">Georgia</option>\
                <option value="Impact">Impact</option>\
                <option value="Lucida Console">Lucida Console</option>\
                <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>\
                <option value="PalatinoLinotype">PalatinoLinotype</option>\
                <option value="Tahoma">Tahoma</option>\
                <option value="Times New Roman">Times New Roman</option>\
                <option value="Trebuchet MS">Trebuchet MS</option>\
                <option value="Verdana">Verdana</option>\
                <option value="Gill Sans">Gill Sans</option>\
            </select>\
        </div>',
    ]);

    this.addRow([
      '<div class="col-sm-2">Point:</div>',
      '<div class="col-sm-4">\
            <input id="fontPickerPoint" type="number" min=6 max=40 value=12>\
        </div>',
      '<div class="col-sm-6">\
      <label>Bold: <input id="fontPickerBold" type="checkbox"></label>\
        </div>',
    ]);

    this.addRow([
      '<div class="col-sm-2">Color:</div>',
      '<div class="col-sm-4">\
            <input id="fontPickerColor" type="color" >\
        </div>',
      '<div class="col-sm-6">\
            <label>Italic: <input id="fontPickerItalic" type="checkbox" ></label>\
        </div>',
    ]);

    this.addHandler("fontPickerFont", "change", function () {
      self.labelFont.name = $(this).val();
      //console.log(self.labelFont);
    });

    this.addHandler("fontPickerColor", "change", function () {
      self.labelFont.fontColor = $(this).val();
      //console.log(self.labelFont);
    });

    this.addHandler("fontPickerPoint", "change", function () {
      self.labelFont.th = parseInt($(this).val());
    });

    this.addHandler("fontPickerBold", "change", function () {
      const checked = $(this)[0].checked;
      self.labelFont.weight = checked == true ? "bold" : "normal";
    });

    this.addHandler("fontPickerItalic", "change", function () {
      const checked = $(this)[0].checked;
      self.labelFont.style = checked == true ? "italic" : "normal";
    });

    this.fontPickerCb = function () {
      this.showDlg();
    };
  }

  initializeDialog() {
    //We create a new font similiar to the one we receive. This new font may be modified. The one we received is not modified.
    this.labelFont = new Misc.Font(this.labelFont);

    this.selector("fontPickerColor").val(this.labelFont.fontColor);
    this.selector("fontPickerFont").val(this.labelFont.name);
    this.selector("fontPickerPoint").val(this.labelFont.th);
    if (this.labelFont.weight == "bold")
      this.selector("fontPickerBold")[0].checked = true;
    else this.selector("fontPickerBold")[0].checked = false;
    if (this.labelFont.style == "italic")
      this.selector("fontPickerItalic")[0].checked = true;
    else this.selector("fontPickerItalic")[0].checked = false;
  }
}
