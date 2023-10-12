"use strict";

/**
 * Objects of this class handle change events from the input of type "file".
 *
 *
 */
class UpLoad {
  constructor() {
    var self = this;
    this.cb = null;

    /**
     * Reset the file input. (inputDiv[0].value = "";)
     * @param {object} inputDiv jQuery element selector
     */
    this.reset = function (inputDiv) {
      inputDiv[0].value = "";
    };

    this.handleFiles = function (files) {
      // Loop through the FileList.
      for (var i = 0, f; (f = files[i]); i++) {
        // Only process image files.
        var fileExtension = f.name.split(".")[1];

        if (
          fileExtension != "txt" &&
          fileExtension != "xls" &&
          fileExtension != "xlsx" &&
          fileExtension != "plt" &&
          fileExtension != "fnc"
        ) {
          continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
          return function (e) {
            //console.log(e)
            if (self.cb)
              self.cb({
                fileName: theFile.name,
                content: e.target.result,
              });
            else
              console.log({
                fileName: theFile.name,
                content: e.target.result,
              });
          };
        })(f);

        //console.log(f)
        // Read in the file.
        if (fileExtension == "xls" || fileExtension == "xlsx") {
          reader.readAsBinaryString(f);
        } else {
          reader.readAsText(f);
        }
      } //
    };

    /**
     * Set the file input element.
     *
     * This method sets the input selector and installs the change event handler. The change event handler is equipped
     * with a {@link FileReader} that executes a callback with an object as argument. The object has two
     * properties: fileName and content.
     * @example
     * {
     *    fileName: "table1.txt",
     *    content: "-10, 100\r\n-8, 64\r\n-6, 36\r\n-4, 16\r\n-2, 4\r\n0, 0\r\n2, 4\r\n4, 16"
     * }
     *
     * Applications must set the callback.
     * @example
     * const upload = new UpLoad();
     * upload.cb = function(fileData){
     *    console.log(fileData.fileName);
     *    console.log(fileData.content);
     * }
     * @param {object} inputDiv jQuery element selector
     */
    this.setInputElement = function (inputDiv) {
      Static.bind("itemAttached", function (e, plotItem, on) {
        //if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve) {
        if (
          plotItem.rtti > PlotItem.RttiValues.Rtti_PlotMarker &&
          plotItem.rtti < PlotItem.RttiValues.Rtti_PlotShape
        ) {
          if ($("#fileInput").val().includes(plotItem.title()) && !on)
            self.reset($("#fileInput"));
        }
      });
      inputDiv.change(function (evt) {
        //var files = evt.target.files; // FileList object
        self.handleFiles(evt.target.files);
      });
    };
  }
}
