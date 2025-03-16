"include []";
"use strict";

class Pane {
  constructor(_parent) {
    var self = this;
    self.paneParent = $("<div/>");
    _parent.append(self.paneParent);
    _parent.parent().css("border", "4px ridge white");

    this.setPaneHeight = function (percent) {
      //param e.g "50%"
      self.paneParent.css("height", percent);
    };

    this.setHeader = function (headerElement, caption, close) {
      var close = close || false;
      var _header = this.header(caption);
      if (close) {
        var closeButton = $(
          '<div><button class="closeButton" style="position: absolute; right:5px" title="Close">X</button></div>'
        );
        headerElement.append(closeButton);
        closeButton.off("click").on("click", function () {
          Static.trigger("paneClose", headerElement);
        });
      }
      headerElement.append(_header);
    };
  }
  //subclass can re-implement
  header(caption) {
    var hdr = $(
      '<div style="text-align:center; padding-top: 10px; border-style: solid; border-width:1px; border-color:#666666; font-size: 16px; color:#666666"/>'
    );
    hdr.append("<label>" + caption + "</label>");
    return hdr;
  }
}
