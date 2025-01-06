"use strict";

var Cancel = 0;
var No = 1;
var Yes = 2;

class AlertDlg {
  constructor() {
    var dlg = $(
      '<div class="modal fade" id="alert_Modal" role="dialog">\
		<div id="dlg" class="modal-dialog">\
		<!-- Modal content-->\
		<div class="modal-content">\
		<div class="modal-header">\
		<!--button type="button" class="close" data-dismiss="modal">&times;</button-->\
		<h4 class="modal-title"><b>Alert</b></h4>\
		</div>\
		<div class="modal-body">\
		<p id="msg" style="word-break: break-all;"></p>\
    <!--div id="msg"></div-->\
		</div>\
		<div id="alertDlgFooter1" class="modal-footer">\
    <label class="doNotShowContainer" style="float: left;"><input id="doNotShow" class="alertDoNotShow" type="checkbox"/> Don\'t show again</label>\
		<button type="button" class="btn btn-default" data-dismiss="modal">Ok</button>\
		</div>\
		<div id="alertDlgFooter2" class="modal-footer">\
		<button id="yes" class="alertYes" type="button" class="btn btn-default">Yes</button>\
		<button id="no" class="alertNo" type="button" class="btn btn-default">No</button>\
		<button id="cancel" class="alertCancel" type="button" class="btn btn-default">Cancel</button>\
    </div>\
		<div id="alertDlgFooter3" class="modal-footer">\
    <label class="doNotShowContainer" style="float: left;"><input id="doNotShow" class="alertDoNotShow" type="checkbox"/> Don\'t show again</label>\
		<button id="yes" class="alertYes" type="button" class="btn btn-default">Yes</button>\
		<button id="no" class="alertNo" type="button" class="btn btn-default">No</button>\
		<button id="cancel" class="alertCancel" type="button" class="btn btn-default">Cancel</button>\
		</div>\
		</div>\
		</div>\
		</div>'
    );

    //console.log(dlg)
    $("body").append(dlg);

    $(".doNotShowContainer").hide();

    dlg.css("z-index", 1000000000); //ensure dialog is not covered

    let doNotShowList = [];

    this.alert = function (msg, type, doNotShowOptionId) {
      if (doNotShowList.indexOf(doNotShowOptionId) != -1) return;
      $("body").append(dlg);
      $(".alertDoNotShow")[0].checked = false;
      $("#alertDlgFooter2").hide();
      $("#alertDlgFooter3").hide();
      $("#alertDlgFooter1").show();

      $("#msg").html(msg.replaceAll("\n", "<br>"));
      if (type == "small") {
        $("#dlg").addClass("modal-sm");
      } else {
        $("#dlg").removeClass("modal-sm");
      }
      if (doNotShowOptionId) {
        $(".doNotShowContainer").show();
      } else {
        $(".doNotShowContainer").hide();
      }

      if (!self.initialized) {
        self.initialized = true;
        $(".alertDoNotShow").on("change", function () {
          if ($(this)[0].checked) {
            doNotShowList.push(doNotShowOptionId);
          } else {
            const n = doNotShowList.indexOf(doNotShowOptionId);
            if (n != -1) {
              doNotShowList.splice(n, 1);
            }
          }
        });
      }

      dlg.modal({
        backdrop: "static",
      });
    };

    var self = this;

    this.alertYesNo = function (msg, cb, type, doNotShowOptionId) {
      if (doNotShowList.indexOf(doNotShowOptionId) != -1) {
        cb(Yes);
        return;
      }
      $("body").append(dlg);
      //$(".close").hide()
      $("#alert_Modal").modal("hide");
      this.alertYesCb = cb;
      $("#alertDlgFooter1").hide();
      $("#alertDlgFooter2").show();
      $("#msg").html(msg);
      if (type == "small") {
        $("#dlg").addClass("modal-sm");
      } else {
        $("#dlg").removeClass("modal-sm");
      }

      if (doNotShowOptionId) {
        $("#alertDlgFooter2").hide();
        $("#alertDlgFooter3").show();
        $(".doNotShowContainer").show();
      } else {
        $(".doNotShowContainer").hide();
        $("#alertDlgFooter3").hide();
      }

      if (!self.initialized) {
        self.initialized = true;
        $(".alertDoNotShow").on("change", function () {
          if ($(this)[0].checked) {
            doNotShowList.push(doNotShowOptionId);
          } else {
            const n = doNotShowList.indexOf(doNotShowOptionId);
            if (n != -1) {
              doNotShowList.splice(n, 1);
            }
          }
        });
      }

      dlg.modal({
        backdrop: "static",
      });
      //dlg.modal("show");
      //$("#alert_Modal").modal("show");
      //return 44;
    };

    $(".alertYes").click(function () {
      //$(".close").click();
      $("#alert_Modal").modal("hide");
      Utility.res = Yes;
      self.alertYesCb(Yes);
    });

    $(".alertNo").click(function () {
      //$(".close").click();
      $("#alert_Modal").modal("hide");
      Utility.res = No;
      self.alertYesCb(No);
    });

    $(".alertCancel").click(function () {
      // $(".close").click();
      $("#alert_Modal").modal("hide");
      Utility.res = Cancel;
      self.alertYesCb(Cancel);
    });

    dlg.on("hidden.bs.modal", function () {
      dlg.detach();
    });

    dlg.detach();
  }
}

class PromptDlg {
  constructor() {
    var prompt_dlg = $(
      '<div class="modal fade" id="promptModal" role="dialog">\
		<div id="prompt_dlg" class="modal-dialog">\
		<!-- Modal content-->\
		<div class="modal-content">\
		<div class="modal-header">\
    \
		<button type="button" class="close" data-dismiss="modal"></button>\
		<img id="progressSpinner" class="progress" style="position:relative; width:4%; height:4%; top:8px;" src="images/imageLoader.png"></img>\
    <img id="error" class="errorBlink" style="position:relative; width:4%; height:4%; top:-2px;" src="images/error.png"></img>\
    <span class="modal-title" id="prompt_title" style="font-size: 125%;">Alert</span>\
		</div>\
		<div class="modal-body">\
    \
		<input id="prompt_msg" style="width:100%" autofocus />\
		</div>\
		<div class="modal-footer">\
		<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>\
		<button id="prompt_ok" type="button" class="btn btn-default">Ok</button>\
		</div>\
		</div>\
		</div>\
		</div>'
    );

    //console.log(dlg)
    //prompt_dlg.append('<img id="progressSpinner" class="progress" style= "position: absolute;" src="images/imageLoader.png"></img>');
    $("body").append(prompt_dlg);

    var self = this;

    // this.showProgress = function(){
    //   $("#progressSpinner").css("animation", "spin 2s linear infinite");
    // }

    this.hideProgress = function () {
      $("#progressSpinner").hide();
    };

    //this.hideProgress();
    $("#error").hide();

    this.prompt = function (title, defaultMsg, cb, type) {
      $("body").append(prompt_dlg);
      if (type == "small") {
        $("#prompt_dlg").addClass("modal-sm");
      }
      $("#prompt_title").text(title);
      $("#prompt_msg").val(defaultMsg);
      $("#prompt_msg").select();
      this.cb = cb;
      prompt_dlg.modal({
        backdrop: "static",
      });
    };

    $("#prompt_msg").on("keydown", function (e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        $("#prompt_ok").click(); // Not working?
      }
    });

    prompt_dlg.on("shown.bs.modal", function () {
      $("#prompt_ok").trigger("focus");
    });

    prompt_dlg.on("hidden.bs.modal", function () {
      $("#progressSpinner").show();
      $("#error").hide();
      prompt_dlg.detach();
    });

    $("#prompt_ok").on("mouseenter", function () {
      $("#progressSpinner").css("animation", "spin 2s linear infinite");
    });

    $("#prompt_ok").on("mouseleave", function () {
      if (!Utility.promptProgress)
        $("#progressSpinner").css("animation", "none");
    });

    $("#prompt_ok").on("click", function () {
      Utility.promptProgress = true;
      if (self.cb($("#prompt_msg").val())) {
        $(".close").click();
      } else {
        $("#prompt_msg").select();
        $("#progressSpinner").hide();
        $("#error").attr("title", Utility.promptErrorMsg);
        $("#error").show();
      }
      //$("#progressSpinner").show();
      Utility.promptProgress = false;
    });

    $("#prompt_msg").on("input", function () {
      $("#progressSpinner").show();
      $("#error").hide();
    });

    prompt_dlg.detach();
  }
}

/**
 * @classdesc A class of static utility methods. You can derive from this class and add your own utility methods. See the eample below.
 * @example
 * class MyUtility extends Utility{
 * 	static myUtilityMethod(...){
 * 		...
 * 	}
 * }
 */

class Utility {
  static progressWait(on = true) {
    if (on) {
      $("html").addClass("wait");
    } else {
      $("html").removeClass("wait");
      Utility.inProgress = false;
    }
  }

  static progressSpinner(on = true) {
    if (!Utility.progressSpinnerInit) {
      Utility.progressSpinnerInit = true;
      $("#centralDiv").append(Utility.progressSpinner2);
    }
    if (on) {
      Utility.progressSpinner2.css(
        "left",
        parseInt($("#centralDiv").css("width")) * 0.5 - 21
      );
      Utility.progressSpinner2.css(
        "top",
        parseInt($("#centralDiv").css("height")) * 0.5 - 21
      );
      Utility.progressSpinner2.show();
    } else {
      Utility.progressSpinner2.hide();
      Utility.inProgress = false;
    }
  }

  /**
   * Get the number of decimal places in the number.
   * @param {number} value The number whose decimal places is to be determined.
   * @returns {number} A positive integer representing the number of decimal places.
   */
  static countDecimalPlaces(value) {
    if (value.im) {
      return 0;
    }
    let text = value.toString();
    // verify if number 0.000005 is represented as "5e-6"
    if (text.indexOf("e-") > -1) {
      let [base, trail] = text.split("e-");
      let deg = parseInt(trail, 10);
      return deg;
    }
    // count decimals for number in representation like "0.123456"
    if (Math.floor(value) !== value) {
      return value.toString().split(".")[1].length || 0;
    }
    return 0;
  }

  //Helper
  static BicubicInterpolation(values, x, y) {
    function TERP(t, a, b, c, d) {
      return (
        0.5 *
          (c -
            a +
            (2.0 * a - 5.0 * b + 4.0 * c - d + (3.0 * (b - c) + d - a) * t) *
              t) *
          t +
        b
      );
    }
    var i0, i1, i2, i3;

    i0 = TERP(x, values[0][0], values[1][0], values[2][0], values[3][0]);
    i1 = TERP(x, values[0][1], values[1][1], values[2][1], values[3][1]);
    i2 = TERP(x, values[0][2], values[1][2], values[2][2], values[3][2]);
    i3 = TERP(x, values[0][3], values[1][3], values[2][3], values[3][3]);
    return TERP(y, i0, i1, i2, i3);
  }

  /**
   * Compute the z - coordinate
   * @param {Array<object>} data Array of object (e.g. {x:2, y:-10, z:144}) representing a 3D point.
   * @param {Number} x x - coordinate
   * @param {Number} y y - coordinate
   * @returns {Number} z- coordinate (Bi-cubic interpolation)
   */
  static bicubicInterpolate(data, x, y) {
    var numberOfColumns = data.length;
    var numberOfRows = data[0].length;
    var rightColumn;
    var bottomRow;

    var colSpacing =
      (data[data.length - 1][0].x - data[0][0].x) / (data.length - 1);

    var colIndex = Math.floor((x - data[0][0].x) / colSpacing);

    for (var i = colIndex; i < numberOfColumns; i++) {
      if (data[i][0].x > x) {
        rightColumn = i; //data[i][0].x;

        break;
      }
    }
    if (rightColumn == undefined) rightColumn = numberOfColumns - 1; //data[numberOfColumns-1][0].x;

    var col0 = data[0];

    var rowSpacing = (col0[col0.length - 1].y - col0[0].y) / (col0.length - 1);

    var rowIndex = Math.floor((y - col0[0].y) / rowSpacing);
    for (var i = rowIndex; i < numberOfRows; i++) {
      if (col0[i].y > y) {
        bottomRow = i; //col0[i].y;

        break;
      }
    }
    if (bottomRow == undefined) bottomRow = numberOfRows - 1; //col0[numberOfRows-1].y;

    if (x > data[rightColumn][0].x || x < data[0][0].x) {
      throw "x out of range";
    }

    if (y > data[0][bottomRow].y || y < data[0][0].y) {
      throw "y out of range";
    }

    var leftBoundary = rightColumn - 2;
    var topBoundary = bottomRow - 2;

    if (
      leftBoundary >= 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow + 1 < numberOfRows
    ) {
      //inner case
      var p0 = [
        data[rightColumn - 2][bottomRow - 2].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 2].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary < 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow + 1 < numberOfRows
    ) {
      //left boundary case
      var p0 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 2].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary >= 0 &&
      topBoundary < 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow < numberOfRows
    ) {
      //top boundary case
      var p0 = [
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary >= 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 >= numberOfColumns &&
      bottomRow + 1 < numberOfRows
    ) {
      //right boundary case
      var p0 = [
        data[rightColumn - 2][bottomRow - 2].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary >= 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow + 1 >= numberOfRows
    ) {
      //bottom boundary case
      var p0 = [
        data[rightColumn - 2][bottomRow - 2].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 2].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary < 0 &&
      topBoundary < 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow < numberOfRows
    ) {
      //left + top boundary case
      var p0 = [
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary >= 0 &&
      topBoundary < 0 &&
      rightColumn + 1 >= numberOfColumns &&
      bottomRow < numberOfRows
    ) {
      //right + top boundary case
      var p0 = [
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow + 1].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow + 1].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      var p3 = [
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow + 1].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary < 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 < numberOfColumns &&
      bottomRow + 1 >= numberOfRows
    ) {
      //left + bottom boundary case
      var p0 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow].z,
      ];

      var p3 = [
        data[rightColumn + 1][bottomRow - 2].z,
        data[rightColumn + 1][bottomRow - 1].z,
        data[rightColumn + 1][bottomRow].z,
        data[rightColumn + 1][bottomRow].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    } else if (
      leftBoundary >= 0 &&
      topBoundary >= 0 &&
      rightColumn + 1 >= numberOfColumns &&
      bottomRow + 1 >= numberOfRows
    ) {
      //right + bottom boundary case
      var p0 = [
        data[rightColumn - 2][bottomRow - 2].z,
        data[rightColumn - 2][bottomRow - 1].z,
        data[rightColumn - 2][bottomRow].z,
        data[rightColumn - 2][bottomRow].z,
      ];

      var p1 = [
        data[rightColumn - 1][bottomRow - 2].z,
        data[rightColumn - 1][bottomRow - 1].z,
        data[rightColumn - 1][bottomRow].z,
        data[rightColumn - 1][bottomRow].z,
      ];

      var p2 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow].z,
      ];

      var p3 = [
        data[rightColumn][bottomRow - 2].z,
        data[rightColumn][bottomRow - 1].z,
        data[rightColumn][bottomRow].z,
        data[rightColumn][bottomRow].z,
      ];

      return Utility.BicubicInterpolation(
        [p0, p1, p2, p3],
        (x - data[rightColumn - 1][0].x) /
          (data[rightColumn][0].x - data[rightColumn - 1][0].x),
        (y - col0[bottomRow - 1].y) /
          (col0[bottomRow].y - col0[bottomRow - 1].y)
      );
    }
    return undefined;
  }

  //Helper
  static BilinearInterpolation(q11, q12, q21, q22, x1, x2, y1, y2, x, y) {
    /*  var x2x1, y2y1, x2x, y2y, yy1, xx1;
		x2x1 = x2 - x1;
		y2y1 = y2 - y1;
		x2x = x2 - x;
		y2y = y2 - y;
		yy1 = y - y1;
		xx1 = x - x1; 
		  return 1.0 / (x2x1 * y2y1) * (
			q11 * x2x * y2y +
			q21 * xx1 * y2y +
			q12 * x2x * yy1 +
			q22 * xx1 * yy1
		);  */

    return (
      (1.0 / ((x2 - x1) * (y2 - y1))) *
      (q11 * (x2 - x) * (y2 - y) +
        q21 * (x - x1) * (y2 - y) +
        q12 * (x2 - x) * (y - y1) +
        q22 * (x - x1) * (y - y1))
    );
  }

  /**
   * Compute the z - coordinate
   * @param {Array<Array<Number>>} data Array of object (e.g. {x:2, y:-10, z:144}) representing a 3D point.
   * @param {Number} x x - coordinate
   * @param {Number} y y - coordinate
   * @returns {Number} z- coordinate (Bi-linear interpolation)
   */
  static bilinearInterpolate(data, x, y) {
    var numberOfColumns = data.length;
    var numberOfRows = data[0].length;
    var rightColumn;
    var bottomRow;

    var colSpacing =
      (data[data.length - 1][0].x - data[0][0].x) / (data.length - 1);

    var colIndex = Math.floor((x - data[0][0].x) / colSpacing);
    //console.log(colIndex);

    for (var i = colIndex; i < numberOfColumns; i++) {
      if (data[i][0].x > x) {
        rightColumn = i; //data[i][0].x;

        break;
      }
    }
    if (rightColumn == undefined) rightColumn = numberOfColumns - 1;

    var col0 = data[0];

    var rowSpacing = (col0[col0.length - 1].y - col0[0].y) / (col0.length - 1);

    var rowIndex = Math.floor((y - col0[0].y) / rowSpacing);

    for (var i = rowIndex; i < numberOfRows; i++) {
      if (col0[i].y > y) {
        bottomRow = i; //col0[i].y;

        break;
      }
    }
    if (bottomRow == undefined) bottomRow = numberOfRows - 1;

    if (x > data[rightColumn][0].x || x < data[0][0].x) {
      throw "x out of range";
    }

    if (y > data[0][bottomRow].y || y < data[0][0].y) {
      throw "y out of range";
    }

    var leftBoundary = rightColumn - 1;
    var topBoundary = bottomRow - 1;

    var x1, y1, x2, y2, q11, q12, q21, q22;

    x1 = data[leftBoundary][0].x;
    x2 = data[rightColumn][0].x;
    y1 = data[0][bottomRow].y;
    y2 = data[0][topBoundary].y;

    q11 = data[leftBoundary][bottomRow].z;
    q12 = data[leftBoundary][topBoundary].z;
    q21 = data[rightColumn][bottomRow].z;
    q22 = data[rightColumn][topBoundary].z;

    return Utility.BilinearInterpolation(
      q11,
      q12,
      q21,
      q22,
      x1,
      x2,
      y1,
      y2,
      x,
      y
    );
  }

  /**
   * Generate a unique curve name
   * @param {Plot} plot Plot to which a curve with the generated name will be attached
   * @param {String} [prefix] Prefix of name. The default is "curve_".
   * @returns {string} unique curve name
   */
  static generateCurveName(plot, prefix) {
    let suffix = 1;
    let preFix = prefix || "curve_";
    let curveName = preFix.concat(suffix);
    while (plot.findPlotCurve(curveName)) curveName = preFix.concat(++suffix);
    return curveName;
  }

  /**
   * Generate a unique curve copy name
   * @param {Plot} plot Plot to which a curve with the generated name will be attached
   * @param {String} [name] The name of the curve being copied.
   * @returns {string} unique curve name
   */
  static generateCurveCopyName(plot, name) {
    let suffix = 1;
    let preFix = name + "_copy";
    let curveName = preFix.concat(suffix);
    while (plot.findPlotCurve(curveName)) curveName = preFix.concat(++suffix);
    return curveName;
  }

  static dragAndDropFiles(dropElement, handler) {
    let borderColor = dropElement.css("border-color");
    let borderWidth = dropElement.css("border-width");
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropElement[0].addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ["dragenter", "dragover"].forEach((eventName) => {
      dropElement[0].addEventListener(eventName, highlight, false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
      dropElement[0].addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      dropElement.css("border-color", "purple");
      dropElement.css("border-width", "4px");
      //dropElement.addClass("highlight");
    }

    function unhighlight(e) {
      dropElement.css("border-color", borderColor);
      dropElement.css("border-width", borderWidth);
      //dropElement.removeClass("highlight");
    }

    dropElement[0].addEventListener("drop", handleDrop, false);

    function handleDrop(e) {
      handler(e.dataTransfer.files); ///
    }
  }

  static arrayHasPoint(arr, pt, decimalPlacesX = 8, decimalPlacesY = 8) {
    for (let i = 0; i < arr.length; i++) {
      //if (arr[i].isEqual(pt)) return true;
      if (
        Utility.adjustForDecimalPlaces(arr[i].x, decimalPlacesX) ==
          Utility.adjustForDecimalPlaces(pt.x, decimalPlacesX) &&
        Utility.adjustForDecimalPlaces(arr[i].y, decimalPlacesY) ==
          Utility.adjustForDecimalPlaces(pt.y, decimalPlacesY)
      ) {
        return true;
      }
    }
    return false;
  }

  static pltPlotCurveData(plot, curveData) {
    let curve = null;
    if (curveData.fn) {
      curve = plot.functionDlgCb(curveData.functionDlgData);
      curve.setTitle(curveData.title);
      //return;
    } else {
      //curve = new curveConstructor(curveData.title);
      curve = plot.createCurve(curveData.rtti, curveData.title);
      curve.setSamples(Utility.pointsFromXYObjectArray(curveData.samples));
    }

    if (curveData.symbolType !== Symbol2.Style.NoSymbol) {
      let sym = new Symbol2();
      sym.setStyle(curveData.symbolType);
      sym.setSize(new Misc.Size(curveData.symbolWidth, curveData.symbolWidth));
      sym.setPen(
        new Misc.Pen(curveData.symbolPenColor, curveData.symbolPenWidth)
      );
      sym.setBrush(new Misc.Brush(curveData.symbolBrushColor));
      curve.setSymbol(sym);
    }

    curve.setStyle(curveData.style);
    if (curveData.fitType) {
      curve.fitType = curveData.fitType;
      curve.equation = curveData.equation;
    }

    //curve.setSamples(Utility.pointsFromXYObjectArray(curveData.samples));
    if (curveData.fitType == "natural" || curveData.fitType == "periodic") {
      //curve.setData(CurveFitDlg.curve.data())
      let f = new SplineCurveFitter();
      let s = f.spline();
      if (curveData.fitType == "periodic") {
        s.setSplineType(Static.SplineType.Periodic);
      } else {
        s.setSplineType(Static.SplineType.Natural);
      }
      curve.setCurveFitter(f);
    }

    curve.setPen(
      new Misc.Pen(
        curveData.pen.color,
        curveData.pen.width,
        curveData.pen.style
      )
    );

    curve.setAxes(curveData.xAxis, curveData.yAxis);

    return curve;
  }

  static getPlotCurveData(curve) {
    let d = {};
    d.rtti = PlotItem.RttiValues.Rtti_PlotCurve;
    d.title = curve.title();

    const fn = curve.fn;
    if (fn) {
      d.functionDlgData = curve.functionDlgData;
    } else {
      d.samples = curve.data().samples();
    }

    d.fn = curve.fn;

    d.pen = curve.pen();
    d.fitType = curve.fitType;
    d.equation = curve.equation;

    let sym = curve.symbol();
    d.symbolType = Symbol2.Style.NoSymbol;
    if (sym) {
      d.symbolType = sym.style();
      d.symbolWidth = sym.size().width;
      d.symbolPenColor = sym.pen().color;
      d.symbolPenWidth = sym.pen().width;
      d.symbolBrushColor = sym.brush().color;
    }
    d.style = curve.style();

    d.xAxis = curve.xAxis();
    d.yAxis = curve.yAxis();

    return d;
  }

  static copyCurve(curve) {
    const plot = curve.plot();
    let newTitle = Utility.generateCurveCopyName(plot, curve.title());
    const curveData = Utility.getPlotCurveData(curve);
    curveData.title = newTitle;
    if (curveData.functionDlgData) {
      curveData.functionDlgData.title = newTitle;
    }
    Utility.pltPlotCurveData(plot, curveData).attach(plot);
  }

  static copyCurves(curves) {
    const plot = curves[0].plot();
    const autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);
    for (let i = 0; i < curves.length; i++) {
      Utility.copyCurve(curves[i]);
    }
    plot.setAutoReplot(autoReplot);
    plot.autoRefresh();
  }

  /**
   * Check a key press event for modifier (ALT, SHIFT, CTRL) key press.
   *
   * Modifiers are represented by the constants:
   * - {@link Static.NoModifier}
   * - {@link Static.AltModifier}
   * - {@link Static.ControlModifier}
   * - {@link Static.ShiftModifier}
   *
   * To check if an event is associated with ALT modifier, for example, use: `modifiers(event) & Static.AltModifier`
   * @param {Event} event Key Event
   * @returns {number} Number identifying any modifier combinations.
   */
  static modifiers(event) {
    var _modifiers = Static.NoModifier;
    if (event.altKey && event.ctrlKey && event.shiftKey)
      return (
        _modifiers |
        Static.AltModifier |
        Static.ControlModifier |
        Static.ShiftModifier
      );
    if (event.altKey && event.ctrlKey)
      return _modifiers | Static.AltModifier | Static.ControlModifier;
    if (event.altKey && event.shiftKey)
      return _modifiers | Static.AltModifier | Static.ShiftModifier;
    if (event.ctrlKey && event.shiftKey)
      return _modifiers | Static.ControlModifier | Static.ShiftModifier;
    if (event.altKey) return _modifiers | Static.AltModifier;
    if (event.ctrlKey) return _modifiers | Static.ControlModifier;
    if (event.shiftKey) return _modifiers | Static.ShiftModifier;
    return _modifiers;
  }

  /**
   * Check a mouse event for button press
   * @param {Event} event
   * @returns {number} Constant identifying mouse button pressed. (NoButton=-1: No mouse button pressed, LeftButton=0: Left mouse button pressed, MidButton=1: Middle mouse button pressed, RightButton=2: Right mouse button pressed)
   */
  static button(event) {
    if (event == null) return false;
    return event.button;
  }

  /**
   * Get a list of predefined colors
   * @returns {Array<String>}
   */
  static colorList() {
    return ["black", "red", "green", "blue", "yellow", "brown"];
  }

  /**
   * Convert an array of array of numbers ([[-10, 50], [41, 89], ...]) to an array
   * of Misc.Point ([new Mic.Point(-10, 50), new Mic.Point(41, 89), ...])
   *
   * @param {Array<Array<Number>>} arrayOfTwoMemberArrays
   * @returns {Array<Misc.Point>}
   */
  static makePoints(arrayOfTwoMemberArrays) {
    return arrayOfTwoMemberArrays.map(function (arrayOfTwoMembers) {
      return new Misc.Point(
        parseFloat(arrayOfTwoMembers[0]),
        parseFloat(arrayOfTwoMembers[1])
      );
    });
  }

  // /**
  //  * Build an object containing data that can be use for a spectrocure.
  //  *
  //  *
  //  *
  //  * The points property holds a array of object (e.g.: {x:2, y:-10, z:12}) that represent a 3D point.
  //  *
  //  * zMin and zMax properties hold the minimum and maximum z value respectively.
  //  * @param {Array<Array<Number>>} arrayOfThreeMemberArrays Array of array of numbers ([[-10, 50, 87], [41, 89, -150], ...])
  //  * @returns {object} spectrocure data object. See example below.
  //  * @example
  //  * {
  //  *    points: [{x:2, y:-10, z:12}, {x:2, y:-10, z:12}, ...],
  //  *    zMin: 2,
  //  *    zMax: 30
  //  * }
  //  */
  // static makeSpectrocurvePoints1(arrayOfThreeMemberArrays) {
  //   //console.log(arr)
  //   var res = [];
  //   var minZ = Number.MAX_VALUE;
  //   var maxZ = Number.MIN_VALUE;
  //   arrayOfThreeMemberArrays.forEach(function (arrayOfThreeMembers) {
  //     var zVal = parseFloat(arrayOfThreeMembers[2]);
  //     if (zVal < minZ) minZ = arrayOfThreeMembers[2];
  //     if (zVal > maxZ) maxZ = arrayOfThreeMembers[2];
  //     res.push({
  //       x: parseFloat(arrayOfThreeMembers[0]),
  //       y: parseFloat(arrayOfThreeMembers[1]),
  //       z: zVal,
  //     });
  //   });
  //   return { points: res, zMin: minZ, zMax: maxZ };
  // }

  /**
   * Construct an array of xy object (e.g.: [{x:2, y:15}, {x:-22, y:125}, ...]) from an array of Misc.Point
   * @param {Array<Misc.Point>} points List of points
   * @returns {Array<object>} Array of 2D objects
   */
  static pointsToXYObjectArray(points) {
    return points.map(function (pt) {
      return {
        x: pt.x,
        y: pt.y,
      };
    });
  }

  /**
   * Construct an array of Misc.Point (e.g.: [ new Misc.Point(2, 15), new Misc.Point(-22, 125), ...]) from an array of 2D xy object
   * @param {Array<object>} XYpoints List of xy objects
   * @returns {Array<Misc.Point>} Array of 2D points
   */
  static pointsFromXYObjectArray(XYpoints) {
    return XYpoints.map(function (pt) {
      return new Misc.Point(pt.x, pt.y);
    });
  }

  /**
   * Construct a linear equation of the form `mx + c` from 2 known points in a xy coordinate system.
   * @param {Misc.Point} p1 First point
   * @param {Misc.Point} p2 Second point
   * @returns {String} equation (e.g. "-15 x + 34")
   */
  static linearEquationFromPoints(p1, p2, decimalPlaces = 400) {
    var m = (p2.y - p1.y) / (p2.x - p1.x);
    var c = -m * p1.x + p1.y;
    const eps = 1e-20;
    // if (decimalPlaces) {
    //   if (math.abs(m) < eps)
    //     m = Utility.adjustForDecimalPlaces(m, decimalPlaces);
    //   if (math.abs(c) < eps)
    //     c = Utility.adjustForDecimalPlaces(c, decimalPlaces);
    // }
    // var fn = m.toString();
    // fn += "x+";
    // fn += c.toString();

    var fn = `${m}x+${c}`;
    //console.log("fn:", fn);
    return fn;
  }

  /**
   * Build an object containing data that can be use for a curve, spectrocure or spectrogram.
   *
   * The points property holds a array of object that describes a 2D ({x:2, y:-10}) or 3D ({x:2, y:-10, z:12}) point.
   *
   * dataType property holds a string that gives a hint. Possible types are "curve" (for 2D), "spectrocurve" or "spectrogram" (for 3D). The hint is provided by making it the first line in the file. If no hint is provided, dataType property is set to null and toArrays() will try to determine if the csv content is for 2D or 3D spectrocurve or 3D spectrogram.
   *
   * zMin and zMax properties hold the minimum and maximum z value respectively.
   * @param {String} csvContent A string containing the csv content read from a file. (e.g.: "2, 4\n3, 9\n, ..." representing csv that describes 2D or "2, 4, -10\n3, 9, 12\n, ..." representing csv that describes 3D)
   * @returns {object} data object. See example below.
   * @example
   * For 2D data
   * {
   *    points: [{x:2, y:-10}, {x:2, y:-10}, ...],
   *    dataType: "curve", // or null
   *    zMin: 2,
   *    zMax: 30
   * }
   *
   * For 3D data
   * {
   *    points: [{x:2, y:-10, z:12}, {x:2, y:-10, z:12}, ...],
   *    dataType: "spectrocurve", //or "spectrogram" or null
   *    zMin: 2,
   *    zMax: 30
   * }
   */
  static toArrays(csvContent) {
    var _minZ = Number.MAX_VALUE;
    var _maxZ = Number.MIN_VALUE;
    var type = null;
    var arr = csvContent.split("\n");
    var keyword = arr[0].toLowerCase();
    if (keyword.includes("curve")) {
      type = "curve";
    } else if (keyword.includes("spectrocurve")) {
      type = "spectrocurve";
    } else if (keyword.includes("spectrogram")) {
      type = "spectrogram";
    }
    var result = [];
    for (var i = 0; i < arr.length; ++i) {
      var pt = arr[i].split(",");
      if (isNaN(parseFloat(pt))) {
        continue;
      }
      pt = pt.map(function (item) {
        return parseFloat(item);
      });
      if (pt.length == 3) {
        //3d data
        result.push({ x: pt[0], y: pt[1], z: pt[2] });
        if (result[result.length - 1].z < _minZ)
          _minZ = result[result.length - 1].z;
        if (result[result.length - 1].z > _maxZ)
          _maxZ = result[result.length - 1].z;
      } else {
        result.push(pt);
      }
    }
    return { array: result, dataType: type, minZ: _minZ, maxZ: _maxZ };
  }

  /**
   * Toggles auto scale for all axes on and off
   *
   * Triggers the "rescaled" event. (Static.trigger("rescaled", auto);)
   * @param {Plot} plot The plot
   * @param {Boolean} auto On / Off
   */
  static setAutoScale(plot, auto) {
    const autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);

    plot.setAxesAutoScale(auto);
    plot.setAutoReplot(autoReplot);
    plot.autoRefresh();
    Static.trigger("rescaled", auto);
  }

  /**
   * Toggles auto scale for all axes on and off
   *
   * @param {Plot} plot The plot
   * @returns {Boolean} True, if autoscale is set
   */
  static isAutoScale(plot) {
    if (
      !plot.axisAutoScale(0) ||
      !plot.axisAutoScale(1) ||
      !plot.axisAutoScale(2) ||
      !plot.axisAutoScale(3)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Toggles the major gridlines for both x and Y on and off
   *
   * Triggers the "majorGridLines" event. (Static.trigger("majorGridLines", [grid, on]);)
   * @param {PlotGrid} grid
   * @param {Boolean} on On / Off
   *
   */
  static majorGridLines(grid, on) {
    grid.enableX(on);
    grid.enableY(on);
    Static.trigger("majorGridLines", [grid, on]);
  }

  /**
   * Toggles the minor gridlines for both x and Y on and off
   *
   * Triggers the "majorGridLines" event. (Static.trigger("minorGridLines", [grid, on]);)
   * @param {PlotGrid} grid
   * @param {Boolean} on On / Off
   *
   */
  static minorGridLines(grid, on) {
    grid.enableXMin(on);
    grid.enableYMin(on);
    Static.trigger("minorGridLines", [grid, on]);
  }

  /**
   * Generates a random color
   *
   * @param {Number} brightness The desired brightness. Six levels of brightness from 0 to 5, 0 being the darkest
   * @returns {String} rgb color (e.g.: "rgb(255, 0, 0)")
   */
  static randomColor(brightness = 0) {
    // Six levels of brightness from 0 to 5, 0 being the darkest
    if (brightness > 5) brightness = 5;
    if (brightness < 0) brightness = 0;
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(
      function (x) {
        return Math.round(x / 2.0);
      }
    );
    return "rgb(" + mixedrgb.join(",") + ")";
  }

  /**
   * Display a color picker that allows the user to select a brush color. The color chosen is use to build a bush that is assigned to the curve.
   * @param {Curve} curve The curve
   * @param {Function} successCb A callback that is executed when a color change is selected.
   */
  static setCurveBrush(curve, successCb) {
    var colorSelector = $('<input type="color" style="opacity:0;">');
    if (!curve || curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve) return;
    if (curve.brush().color == Static.NoBrush)
      colorSelector.val(Utility.colorNameToHex("rgb(255, 255, 254)"));
    else colorSelector.val(Utility.colorNameToHex(curve.brush().color));
    colorSelector.change(function () {
      var brush = curve.brush();
      brush.color = $(this).val();
      curve.setBrush(brush);
      if (successCb !== undefined) {
        successCb(curve);
      }
      $(this).remove();
    });
    colorSelector.trigger("click");
  }

  /**
   * Sets a brush color to Static.NoBrush
   * @param {Curve} curve The curve
   */
  static removeCurveBrush(curve) {
    var brush = curve.brush();
    brush.color = Static.NoBrush;
    curve.setBrush(brush);
  }

  /**
   * Set the pen width of a curve symbol.
   *
   * This method triggers the "symbolAttributeChanged" event (Static.trigger("symbolAttributeChanged", curve))
   * @param {Curve} curve The curve
   * @param {Number} width Pen width
   */
  static setSymbolPenWidth(curve, width) {
    var sym = curve.symbol();
    if (!sym) {
      return;
    }
    var pen = sym.pen();
    pen.width = width;
    //sym.setPen(pen)
    //curve.setSymbol(sym) //reset the symbol so that the legend size is recalculated
    curve.plot().autoRefresh();

    Utility.updateLegendIconSize(curve); //recalculate legend icon size
    curve.plot().updateLegend(curve);
    //curve.itemChanged();
    //curve.legendChanged();
    Static.trigger("symbolAttributeChanged", curve);
  }

  /**
   * Recalculates legend icon size
   * @param {Curve} curve The curve
   */
  static updateLegendIconSize(curve) {
    var sz = curve.getLegendIconSize();
    if (curve.symbol()) {
      sz = curve.symbol().boundingRect().size();
      //sz.width += 2; // margin
      //sz.height += 3; // margin
    }

    if (
      curve.symbol() &&
      curve.testLegendAttribute(Curve.LegendAttribute.LegendShowSymbol)
    ) {
      if (curve.testLegendAttribute(Curve.LegendAttribute.LegendShowLine)) {
        // Avoid, that the line is completely covered by the symbol

        var w = Math.ceil(1.5 * sz.width);

        if (w % 2) w++;

        sz.width = Math.max(40, w);
      }
      curve.setLegendIconSize(sz);
    } else if (
      curve.testLegendAttribute(Curve.LegendAttribute.LegendShowLine)
    ) {
      sz.width = 40;
      curve.setLegendIconSize(sz);
    }
  }

  /**
   * Sets the curve symbol size
   *
   * This method triggers the "symbolAttributeChanged" event (Static.trigger("symbolAttributeChanged", curve))
   * @param {Curve} curve The curve
   * @param {Misc.Size} value New size
   *
   */
  static setSymbolSize(curve, value) {
    //console.log(value)
    var sym = curve.symbol();
    if (!sym) return;
    var sz = sym.size();
    sz.width = value;
    sz.height = value;
    sym.setSize(sz);
    curve.plot().autoRefresh();
    Utility.updateLegendIconSize(curve); //recalculate legend icon size
    //curve.itemChanged();
    //curve.legendChanged();
    curve.plot().updateLegend(curve);
    Static.trigger("symbolAttributeChanged", curve);
  }

  /**
   * Add a new symbol of a given style to the curve
   *
   * This method triggers the "symbolAdded" event (Static.trigger("symbolAdded", curve))
   * @param {Curve} curve The curve
   * @param {Symbol2.Style} style New symbol style
   *
   */
  static addSymbol(curve, style) {
    if (!curve || curve.rtti !== PlotItem.RttiValues.Rtti_PlotCurve) return;
    if (style == Symbol2.Style.NoSymbol) {
      curve.setSymbol(null);
      //return;
    }
    var sym = curve.symbol();
    if (sym == null) {
      sym = new Symbol2();
      sym.setBrush(new Misc.Brush(Static.NoBrush));
      sym.setSize(new Misc.Size(10, 10));
      curve.setSymbol(sym);
    }
    //console.log(sym.size())
    if (sym.size().width <= 0) sym.setSize(new Misc.Size(10, 10));
    sym.setStyle(style);
    curve.itemChanged();
    curve.legendChanged();
    Static.trigger("symbolAdded", curve);
  }

  /**
   * Displays a dialog that allows editing of a new title for the curve.
   *
   * Triggers the "curveRenamed" event. (Static.trigger("curveRenamed", auto);)
   * @param {String} existingName Current curve title
   *
   * This method triggers the "curveRenamed" event (Static.trigger("curveRenamed", curve))
   * @param {Plot} plot The plot
   * @param {Function} successCb A callback that is executed when a new title is selected.
   *
   */
  static curveRenameDlg(existingName, plot, successCb) {
    Utility.prompt(
      'Enter a new name for "' + existingName + '"',
      existingName,
      function (newName) {
        if (existingName == newName) {
          //User decided not change the name
          Utility.alert("You did not change the name!");
          return false;
        }
        var curve = plot.findPlotCurve(existingName);
        if (!plot.findPlotCurve(newName)) {
          //A curve with title "name" (i.e the new name chosen by user is not known to the app)
          curve.setTitle(newName);
          if (successCb !== undefined) successCb(newName, curve);
          Static.trigger("curveRenamed", [curve, existingName, newName]);
          return true;
        } else {
          Utility.alert(newName + " already exist");
          return false;
        }
      },
      "small"
    );
  }

  /**
   * Sets how the curve (or any plot item) is represented on the legend.
   * @param {Curve} curve The curve
   * @param {String} attribute Attribute. Possible attributes are: "line", "symbol" or "lineAndSymbol".
   * @param {Mis.Size} defaultIconSize Icon size
   */
  static setLegendAttribute(curve, attribute, defaultIconSize) {
    //attribute = "line" or "symbol" or "lineAndSymbol"
    if (attribute == "line") {
      //LegendShowLine is dependent on defaultIconSize. Be sure icon size is set to defaultIconSize
      //before setting LegendShowLine.
      curve.setLegendIconSize(new Misc.Size(defaultIconSize));
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowSymbol, false);
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowLine, true);
      return;
    }
    if (attribute == "symbol") {
      //LegendShowSymbol is dependent on defaultIconSize. Be sure icon size is set to defaultIconSize
      //before setting LegendShowSymbol.
      curve.setLegendIconSize(new Misc.Size(defaultIconSize));
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowLine, false);
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowSymbol, true);
      return;
    }
    if (attribute == "lineAndSymbol") {
      //LegendShowSymbol is dependent on defaultIconSize. Be sure icon size is set to defaultIconSize
      //before setting LegendShowSymbol.
      curve.setLegendIconSize(new Misc.Size(defaultIconSize));
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowLine, true);
      curve.setLegendAttribute(Curve.LegendAttribute.LegendShowSymbol, true);
      return;
    }
    //defaultIconSize.width = defaultIconSize.height;//ensure the icon is square
    //curve.setLegendIconSize(new Misc.Size(defaultIconSize))
    curve.setLegendAttribute(Curve.LegendAttribute.LegendShowLine, false);
    curve.setLegendAttribute(Curve.LegendAttribute.LegendShowSymbol, false);
    //iconSize is dependent on attributes. be sure to clear any attributes
    //before setting iconSize.
  }

  /*var Backbone = 0x01;
	//! Ticks
	var Ticks = 0x02;
	//! Labels
	var Labels = 0x04;*/

  /**
   * En/disable component(s)
   *
   * @param {Plot} plot The plot
   * @param {AbstractScaleDraw.ScaleComponent} component The component to en/disable. Use | operator to en/disable more thn one component at a time. (e.g.: AbstractScaleDraw.ScaleComponent.Ticks | AbstractScaleDraw.ScaleComponent.Backbone)
   * @param {Boolean} on true / false
   */
  static enableComponent(plot, component, on) {
    var scaleDraw = null;
    for (var axisId = 0; axisId < Axis.AxisId.axisCnt; ++axisId) {
      scaleDraw = plot.axisScaleDraw(axisId);
      scaleDraw.enableComponent(component, on);
    }
    plot.autoRefresh();
  }

  /**
   * Sets the tick lenght of scale ticks
   * @param {Plot} plot The plot
   * @param {String} length The new length ("small", "medium" or "large")
   */
  static setTickLength(plot, length) {
    //length = "small", "medium" or "large"
    var scaleDraw = null;
    for (var axisId = 0; axisId < Axis.AxisId.axisCnt; ++axisId) {
      scaleDraw = plot.axisScaleDraw(axisId);
      if (length == "small") {
        scaleDraw.setTickLength(ScaleDiv.TickType.MajorTick, 6);
        scaleDraw.setTickLength(ScaleDiv.TickType.MinorTick, 3);
      } else if (length == "medium") {
        scaleDraw.setTickLength(ScaleDiv.TickType.MajorTick, 8);
        scaleDraw.setTickLength(ScaleDiv.TickType.MinorTick, 4);
      } else if (length == "large") {
        scaleDraw.setTickLength(ScaleDiv.TickType.MajorTick, 12);
        scaleDraw.setTickLength(ScaleDiv.TickType.MinorTick, 6);
      }
    }
    plot.autoRefresh();
  }

  static makeParametricSamples(obj) {
    var parametricFnX = obj.parametricFnX;
    var parametricFnY = obj.parametricFnY;
    var lowerX = obj.lowerX;
    var upperX = obj.upperX;
    var numOfSamples = obj.numOfSamples;
    var indepVarIsDegree = obj.indepVarIsDegree;
    var parametric_variable = obj.parametric_variable;
    var indepVar = obj.variable; // || Utility.findIndepVar(fx);

    if (typeof numOfSamples === "undefined") numOfSamples = 100;

    if (parametric_variable !== "t") {
      parametricFnX = Utility.purgeAndMarkKeywords(parametricFnX);
      while (parametricFnX.indexOf(parametric_variable) != -1)
        parametricFnX = parametricFnX.replace(parametric_variable, "t");
      parametricFnX = Utility.replaceKeywordMarkers(parametricFnX);

      parametricFnY = Utility.purgeAndMarkKeywords(parametricFnY);
      while (parametricFnY.indexOf(parametric_variable) != -1)
        parametricFnY = parametricFnY.replace(parametric_variable, "t");
      parametricFnY = Utility.replaceKeywordMarkers(parametricFnY);
    }

    let parserFnX = new EvaluateExp(parametricFnX);
    if (parserFnX.error) {
      Utility.alert(parserFnX.errorMessage);
      return null;
    }
    let parserFnY = new EvaluateExp(parametricFnY);
    if (parserFnY.error) {
      Utility.alert(parserFnY.errorMessage);
      return null;
    }
    var samples = [];
    var step = (upperX - lowerX) / (numOfSamples - 1);

    for (var i = 0; i <= numOfSamples - 1; ++i) {
      var tVal = lowerX + i * step;

      let xVal = parserFnX.eval({ t: tVal });
      if (!isFinite(xVal)) {
        if (Utility.errorResponse == Utility.warn) {
          Utility.alert(
            `"${xVal}" is an invalid "x" parametric input or  causes a "divide by zero" error.`
          );
          return null;
        } else if (Utility.errorResponse == Utility.warnIgnore) {
          Utility.alertYesNo(
            "Error found!!! Do you want to silently ignore errors?",
            function (answer) {
              if (answer == Cancel) {
                //console.log("C");
                return null;
              }
              if (answer == Yes) {
                //console.log("Y");
                Utility.errorResponse = Utility.silentIgnore;
                Utility.errorResponseChanged = true;
                obj.warnIgnoreCb && obj.warnIgnoreCb();
                return null;
              }
              if (answer == No) {
                console.log("N");
                return null;
              }
              //return 1
            }
          );
          samples = [];
        } else {
          continue;
        }
      }

      let yVal = parserFnY.eval({ t: tVal });
      if (!isFinite(yVal)) {
        if (Utility.errorResponse == Utility.warn) {
          Utility.alert(
            `"${yVal}" is an invalid "y" parametric input or  causes a "divide by zero" error.`
          );
          return null;
        } else if (Utility.errorResponse == Utility.warnIgnore) {
          /* Utility.alertYesNo(
            "Error found!!! Do you want to silently ignore errors?",
            function (answer) {
              if (answer == Cancel) {
                //console.log("C");
                return null;
              }
              if (answer == Yes) {
                //console.log("Y");
                Utility.errorResponse = Utility.silentIgnore;
                Utility.errorResponseChanged = true;
                obj.warnIgnoreCb && obj.warnIgnoreCb();
                return null;
              }
              if (answer == No) {
                console.log("N");
                return null;
              }
              //return 1
            }
          );
          samples = []; */
        } else {
          continue;
        }
      }

      if (samples.length == 0) {
        samples.push(new Misc.Point(xVal, yVal));
      } else {
        if (
          samples[samples.length - 1].x !== xVal &&
          samples[samples.length - 1].y !== yVal
        )
          samples.push(new Misc.Point(xVal, yVal));
      }
    }
    // samples = _.uniq(samples, function (e) {
    //   return e.x && e.y;
    // });
    return samples;
  }

  /**
   * Make data for a Curve or Spectrocurve
   * @param {object} obj data required by  makeSamples()
   *
   * obj has the following properties:
   * - fx - The function e.g. "x^2 + 2x + 1"
   * - lowerX - lower x limit e.g.: -10
   * - upperX - upper x limit e.g.: 10
   * - lowerY - lower y limit e.g.: -10 (only valid for Spectrocurve)
   * - upperY - upper y limit e.g.: -10 (only valid for Spectrocurve)
   * - numOfSamples - Number of points
   * - indepVar - The character representing the x independent variable. If this property is not provided, makeSamples() try to determine the independent variable.
   * - indepVarY - The character representing the y independent variable.
   * @returns {object | Array<Misc.Point>} An oject containing data for a Spectrocurve (e.g.: {data: [new Mis.Point(0, 1), new Mis.Point(10, -21), ...], zLimits: { min: 0, max: 20 }}) or an array of points for a Curve (e.g.: [new Mis.Point(0, 1), new Mis.Point(10, -21), ...])
   */
  static makeSamples(obj, limits_x = null) {
    //console.time("object");
    if (obj.parametricFnX && obj.parametricFnY) {
      return Utility.makeParametricSamples(obj);
    }

    if (limits_x) {
      obj.lowerX = limits_x.lowerX;
      obj.upperX = limits_x.upperX;
    }

    var fx = obj.fx;
    var parametricFnX = obj.parametricFnX;
    var parametricFnY = obj.parametricFnY;
    var lowerX = obj.lowerX;
    var upperX = obj.upperX;
    var lowerY;
    var upperY;
    var numOfSamples = obj.numOfSamples;
    var indepVarIsDegree = obj.indepVarIsDegree;
    var parametric_variable = obj.parametric_variable;
    var indepVar = obj.variable || Utility.findIndepVar(fx);
    var indepVarY = obj.variableY; // || findIndepVarY(fx); TODO

    obj.discontinuity = obj.discontinuity || [];

    if (obj.discontinuity.length) {
      numOfSamples = Math.round((numOfSamples *= 2));
      //numOfSamples = numOfSamples < 300 ? 300 : numOfSamples;
    }

    //let parser = new EvaluateExp(fx);

    if (typeof numOfSamples === "undefined") numOfSamples = 100;
    if (indepVar !== "x") {
      fx = Utility.purgeAndMarkKeywords(fx);
      while (fx.indexOf(indepVar) != -1) fx = fx.replace(indepVar, "x");
      fx = Utility.replaceKeywordMarkers(fx);
      indepVar = "x";
    }

    if (obj.threeD && indepVarY !== "y") {
      let n = 0;
      while (fx.indexOf(indepVarY) != -1 && n < 500) {
        fx = fx.replace(indepVarY, "y");
        n++;
      }

      lowerY = obj.lowerY;
      var upperY = obj.upperY;
    }

    let parser = new EvaluateExp(fx);

    if (obj.threeD) {
      lowerY = obj.lowerY;
      upperY = obj.upperY;
    }

    var samples = [];

    if (parser.error) {
      Utility.alert(parser.errorMessage);
      return null;
    }

    /* const node = math.parse(fx); // parse expression into a node tree
		const code = node.compile();  */

    var step = (upperX - lowerX) / (numOfSamples - 1);
    var stepY;
    if (obj.threeD) {
      stepY = (upperY - lowerY) / (numOfSamples - 1);
    }

    var yVal;
    var zVal;
    var zMin = Number.MAX_VALUE;
    var zMax = Number.MIN_VALUE;
    // let insertZero = false;
    // if (lowerX < 0 && upperX > 0) {
    //   insertZero = true;
    // }

    let indexInDiscontinuity = 0;
    //let firstDiscontinuity = obj.discontinuity[0];
    for (var i = 0; i <= numOfSamples - 1; ++i) {
      var xVal = lowerX + i * step;

      if (obj.threeD) {
        yVal = lowerY + i * stepY;
        zVal = parser.eval({ x: xVal, y: yVal });
        if (zVal < zMin) zMin = zVal;
        if (zVal > zMax) zMax = zVal;
      } else {
        let x = Utility.adjustForDecimalPlaces(xVal, 8);

        let d = Utility.adjustForDecimalPlaces(
          obj.discontinuity[indexInDiscontinuity],
          8
        );

        //console.log(x, d);
        if (
          obj.discontinuity.length &&
          indexInDiscontinuity < obj.discontinuity.length &&
          x >= d
        ) {
          d = obj.discontinuity[indexInDiscontinuity];
          if (d - step * 0.01 >= lowerX) {
            yVal = parser.eval({
              x: d - step * 0.01,
            });
            samples.push(new Misc.Point(d - step * 0.01, yVal)); //point before but close to discontinuity
            samples.push(
              new Misc.Point(d - step * 0.0001, math.sign(yVal) * 1e300)
            ); //point before but close to discontinuity
          }
          if (d + step * 0.01 < upperX) {
            yVal = parser.eval({
              x: d + step * 0.01,
            });
            samples.push(
              new Misc.Point(d + step * 0.0001, math.sign(yVal) * 1e300)
            ); //point after but close to discontinuity

            samples.push(new Misc.Point(d + step * 0.01, yVal)); //point after but close to discontinuity
          }
          yVal = NaN;
          indexInDiscontinuity++;
          //firstDiscontinuity = undefined;
          //i--;
        } else {
          yVal = parser.eval({ x: xVal });
          if (math.isNaN(yVal)) {
            // alert(
            //   `Unable to plot the function. Perhaps the "Vertical Line Test!!" failed`
            // );
            return [];
          }
          const abs_yVal = Math.abs(yVal);
          if (abs_yVal !== 0) {
            if (abs_yVal < 1e-300 || abs_yVal > 1e300) {
              return [];
            }
          }
        }
      }

      //if (!isFinite(yVal) || (Utility.errorResponse != Utility.adjustDomain && obj.discontinuity.length)) {
      if (!isFinite(yVal)) {
        if (Utility.errorResponse == Utility.warn) {
          Utility.alert(
            "f(" +
              xVal +
              "): is an error. Perhaps " +
              xVal +
              " is an invalid input or f(" +
              xVal +
              ') causes a "divide by zero" error.'
          );
          return null;
        } else if (Utility.errorResponse == Utility.warnIgnore) {
          Utility.alertYesNo(
            "Error found!!! Do you want to silently ignore errors?",
            function (answer) {
              if (answer == Cancel) {
                //console.log("C");
                return null;
              }
              if (answer == Yes) {
                //console.log("Y");
                Utility.errorResponse = Utility.silentIgnore;
                Utility.errorResponseChanged = true;
                samples = [];
                obj.warnIgnoreCb && obj.warnIgnoreCb();
                //Utility.makeSamples(obj);
                return null;
              }
              if (answer == No) {
                console.log("N");
                return null;
              }
              //return 1
            }
          );

          samples = [];
          return null;
        } else {
          continue;
        }
      }
      if (obj.threeD && !isFinite(zVal)) {
        if (Utility.errorResponse == Utility.warn) {
          Utility.alert(
            "f(" +
              xVal +
              "," +
              yVal +
              '): yields infinity. Probably a "divide by zero" error. Try changing the limits or adjusting number of points.'
          );
          return null;
        } else if (Utility.errorResponse == Utility.warnIgnore) {
          Utility.alertYesNo(
            "Error found!!! Do you want to silently ignore errors?",
            function (answer) {
              if (answer == Cancel) {
                console.log("C");
                return null;
              }
              if (answer == Yes) {
                console.log("Y");

                Utility.errorResponse = Utility.silentIgnore;
                Utility.errorResponseChanged = true;
                //obj.ok_fn(obj);
                samples = [];
                return null;
              }
              if (answer == No) {
                console.log("N");
                return null;
              }
              //return 1
            }
          );
          samples = [];
          // break;
        } else {
          continue;
        }
      }
      if (parser.error) {
        Utility.alert(parser.errorMessage);
        return null;
      }
      if (obj.threeD) {
        samples.push({ x: xVal, y: yVal, z: zVal });
      } else {
        samples.push(new Misc.Point(xVal, yVal));
      }
    }
    if (Utility.errorResponseChanged) {
      Utility.errorResponseChanged = false;
      Utility.errorResponse = Utility.warnIgnore;
    }
    //console.log(samples)
    if (obj.threeD) {
      return { data: samples, zLimits: { min: zMin, max: zMax } };
    }
    if (!obj.threeD) {
      //samples = Utility.removeNonNumericPoints(samples);
      let _points = [];
      let points = [];
      if (!obj.discontinuity.length) {
        _points = Utility.curveInflectionPoint(fx, indepVar, samples);
        points = Utility.curveTurningPoint(fx, indepVar, samples);
      }

      obj.inflectionPoints = _points; //return inflection points to makeSamples() caller
      obj.turningPoints = points; //return turning points to makeSamples() caller

      if (_points.length) {
        for (let i = 0; i < _points.length; i++) {
          if (
            _points[i].x > samples[0].x &&
            _points[i].x < samples[samples.length - 1].x
          ) {
            samples.push(_points[i]);
          }
        }
      }

      //let points = Utility.curveTurningPoint(fx, indepVar, samples);
      //console.log("Add Turning points", points);

      //obj.turningPoints = points; //return turning points to makeSamples() caller

      //console.time("object");
      if (points.length) {
        //$$ x^2\{2\le x^3-2x^2+4\le10\} $$
        for (let i = 0; i < points.length; i++) {
          if (
            points[i].x > samples[0].x &&
            points[i].x < samples[samples.length - 1].x
          ) {
            samples.push(points[i]);
          }
        }
      }
      if (lowerX < 0 && upperX > 0) {
        samples.push(new Misc.Point(0, parser.eval({ x: 0 })));
      }

      samples = samples.sort(function (a, b) {
        if (step > 0) return a.x - b.x;
        else return b.x - a.x;
      });

      samples = samples.filter((item, index) => {
        if (index > 0) {
          return (
            samples[index - 1].x !== samples[index].x ||
            samples[index - 1].y !== samples[index].y
          );
        }
        return true;
      });

      samples = samples.filter((item, index) => {
        return _.isFinite(samples[index].y);
      });

      let lastPt = new Misc.Point();

      //let lastPt = samples[samples.length - 1];
      lastPt.x = upperX;
      lastPt.y = parser.eval({ x: upperX });
      if (!obj.adjustingCurve) {
        const places = 300; //Math.min(60, obj.xDecimalPlaces);
        const inc = step / 30000;
        const iteratn = 20000; //40000;
        let reSample = false;
        let x_lower;
        let x_upper;
        if (
          samples[0] &&
          //samples[0].x > lowerX
          Utility.adjustForDecimalPlaces(samples[0].x, 12) >
            Utility.adjustForDecimalPlaces(lowerX, 12)
        ) {
          let scope = new Map();
          scope.set(indepVar, samples[0].x - step);
          let num = parser.eval(scope);

          // scope.set(indepVar, samples[0].x - step);
          // num = parser.eval(scope);

          let n = 0;

          let x = 0;

          while (!isFinite(num) && n < iteratn) {
            n++;
            x = samples[0].x - step + n * inc;
            scope.set(indepVar, x);
            num = parser.eval(scope);
            //console.log("test1", n);
          }
          if (n === iteratn) {
            obj.adjustingCurve = true;
          }
          //console.log("test1", n);

          x_lower = samples[0].x - step + n * inc;
          samples[0].x = x_lower /*  = Utility.adjustForDecimalPlaces(
            x_lower,
            places
          ) */;
          reSample = true;
        } else {
          x_lower = samples[0].x;
        }

        const sz = samples.length;
        if (
          samples[sz - 1] &&
          //samples[sz - 1].x < upperX
          Utility.adjustForDecimalPlaces(samples[sz - 1].x, 12) <
            Utility.adjustForDecimalPlaces(upperX, 12)
        ) {
          let scope = new Map();
          scope.set(indepVar, samples[sz - 1].x + step);
          let num = parser.eval(scope);

          let n = 0;

          let x = 0;
          while (!isFinite(num) && n < iteratn) {
            n++;
            x = samples[sz - 1].x + step - n * inc;
            scope.set(indepVar, x);
            num = parser.eval(scope);
          }
          if (n === iteratn) {
            obj.adjustingCurve = true;
          }
          //console.log("test2", n);

          x_upper = samples[sz - 1].x + step - n * inc;
          samples[sz - 1].x = x_upper /*  = Utility.adjustForDecimalPlaces(
            x_upper,
            places
          ) */;
          reSample = true;
        } else {
          x_upper = samples[sz - 1].x;
        }

        if (reSample) {
          let lowerX = x_lower;
          let upperX = x_upper;
          // if (obj.xDecimalPlaces) {
          //   lowerX = Utility.adjustForDecimalPlaces(
          //     x_lower,
          //     places
          //     /* obj.xDecimalPlaces */
          //   );
          //   upperX = Utility.adjustForDecimalPlaces(
          //     x_upper,
          //     places
          //     /* obj.xDecimalPlaces */
          //   );
          // }
          return Utility.makeSamples(obj, { lowerX, upperX });
        }
      }
    }

    samples = Utility.removeNonNumericPoints(samples);
    if (limits_x) {
      let { lowerX, upperX } = limits_x;
      let xRound = math.round(lowerX);
      let yRound = parser.eval({ x: xRound });
      if ($.isNumeric(yRound)) {
        samples[0].x = xRound;
        samples[0].y = yRound;
      }

      xRound = math.round(upperX);
      yRound = parser.eval({ x: xRound });
      if ($.isNumeric(yRound)) {
        samples[samples.length - 1].x = xRound;
        samples[samples.length - 1].y = yRound;
      }
    }

    return samples;
  }

  static removeNonNumericPoints(samples) {
    if (!samples) return [];
    return samples.filter((pt) => {
      if ($.isNumeric(pt.x) && $.isNumeric(pt.y)) return true;
      return false;
    });
  }

  static curveTurningPoint1(
    fn,
    variable,
    samples,
    decimalPlacesX = 100,
    decimalPlacesY = 100
  ) {
    if (!variable || fn.indexOf(variable) == -1) {
      return [];
    }
    if (!samples || samples.length == 0) {
      return [];
    }

    //Replace the whitespace delimiters stripped out by simplify()
    fn = fn.replaceAll("mod", " mod ");

    let m_fn = fn;
    let result = [];
    let derivative = null;

    try {
      derivative = math.derivative(m_fn, variable);
    } catch (error) {
      return result;
    }

    derivative = derivative.toString();
    if (isFinite(derivative)) {
      return result;
    }

    const parser = new EvaluateExp(derivative);
    let step = 0;
    const numOfSteps = 1000 / Static.accuracyFactor;
    step = (samples[1].x - samples[0].x) / numOfSteps;
    let sign = math.sign(parser.eval({ x: samples[0].x }));
    for (let i = 1; i < samples.length; i++) {
      ////////////////////////
      //const m = parser.eval({ x: samples[i].x });
      const m = math.sign(parser.eval({ x: samples[i].x }));
      if (m !== sign) {
        //if (math.sign(m) !== 0 && math.sign(m) == sign * -1) {
        //Search for turning point
        // const numOfSteps = 1000 / Static.accuracyFactor;
        // step = (samples[i + 1].x - samples[i].x) / numOfSteps;
        let arr = [];
        for (let n = 0; n < numOfSteps; n++) {
          let xVal = samples[i - 1].x + n * step;
          arr.push(Math.abs(parser.eval({ x: xVal })));
        }
        const min = Math.min(...arr);
        //sign *= -1;
        sign = math.sign(parser.eval({ x: samples[i].x }));
        let xVal = samples[i - 1].x + arr.indexOf(min) * step;
        result.push(
          new Misc.Point(
            Utility.adjustForDecimalPlaces(xVal, decimalPlacesX),
            Utility.adjustForDecimalPlaces(
              math.evaluate(m_fn, { x: xVal }),
              decimalPlacesY
            )
          )
        );
      }
    }
    //Test
    let arr = [];
    step = samples[1].x - samples[0].x;
    for (let i = 0; i < result.length; i++) {
      const x = result[i].x;
      // if (Utility.mFuzzyCompare(result[i].y, math.evaluate(m_fn, { x }))) {
      //   arr.push(result[i]);
      //   continue;
      // }
      let pt1 = new Misc.Point(x - step, math.evaluate(fn, { x: x - step }));
      let pt2 = new Misc.Point(x, math.evaluate(fn, { x }));
      const slopeBeforeTp = Utility.slope(pt1, pt2);
      pt1 = new Misc.Point(x, math.evaluate(fn, { x }));
      pt2 = new Misc.Point(x + step, math.evaluate(fn, { x: x + step }));
      const slopeAfterTp = Utility.slope(pt1, pt2);
      if (Utility.mFuzzyCompare(result[i].y, math.evaluate(m_fn, { x }))) {
        if (math.sign(slopeBeforeTp) !== math.sign(slopeAfterTp)) {
          arr.push(result[i]);
          continue;
        }
      }

      if (math.sign(slopeBeforeTp) !== math.sign(slopeAfterTp)) {
        let n = 0;
        const incrmt = step * 1e-5;
        let _x1 = x - 500 * incrmt;
        let _y1;
        let _x2 = _x1 + incrmt;
        let _y2;
        let slope = math.abs(slopeBeforeTp);
        let prevSlope = Number.MAX_VALUE;
        while (slope < prevSlope && n < 3000) {
          prevSlope = slope;
          pt1.x = _x1 + n * incrmt;
          pt1.y = math.evaluate(fn, { x: pt1.x });
          pt2.x = _x2 + n * incrmt;
          pt2.y = math.evaluate(fn, { x: pt2.x });
          slope = math.abs(Utility.slope(pt1, pt2));
          n++;
        }
        //console.log("TP n:", n);
        pt1.x = pt1.x - 0.5 * incrmt;
        pt1.y = math.evaluate(fn, { x: pt1.x });
        //console.log("TP:", pt1);
        arr.push(pt1);
      }
    }
    // arr = arr.map((pt) => {
    //   pt.x = Utility.adjustForDecimalPlaces(pt.x, 100);
    //   pt.y = Utility.adjustForDecimalPlaces(pt.y, 200);
    //   return pt;
    // });
    return arr;
  }

  static slope(p1, p2) {
    const slp = (p2.y - p1.y) / (p2.x - p1.x);
    //console.log(slp);
    return slp;
  }

  static isPointATurningPoint(tps, pt) {
    if (!tps) return false;
    for (let i = 0; i < tps.length; i++) {
      if (tps[i].x === pt.x && tps[i].y === pt.y) {
        return true;
      }
    }
    return false;
  }

  static isInflectionPoint(ips, pt) {
    if (!ips) return false;
    for (let i = 0; i < ips.length; i++) {
      if (ips[i].x === pt.x && ips[i].y === pt.y) {
        return true;
      }
    }
    return false;
  }

  static curveTurningPoint(
    fn,
    variable,
    samples,
    curve = null,
    decimalPlacesX = 200,
    decimalPlacesY = 400
  ) {
    let result = [];
    if (samples.length < 2) {
      return result;
    }

    //console.time("CurveTurning");

    let slopes = getSlopes(samples);

    let indices = getIndices(slopes);
    //console.log(indices);

    const parser = math.parse(fn);
    const scope = new Map();

    for (let i = 0; i < indices.length; i++) {
      const ind = indices[i];
      if (ind <= 0) continue;

      let x = samples[ind].x;
      let y = samples[ind].y;
      const numOfSteps = 200000;
      const step = (samples[ind + 1].x - x) / numOfSteps;
      let increasing = true;
      let prevY = y;
      scope.set(variable, x + step);
      if (y > parser.evaluate(scope)) {
        increasing = false;
      }
      let n = 0;
      while (n < numOfSteps + 1) {
        x = x + n * step;
        scope.set(variable, x + step);
        y = parser.evaluate(scope);
        if (increasing && y < prevY) {
          break;
        }
        if (!increasing && y > prevY) {
          break;
        }
        prevY = y;
        n++;
      }
      //console.log(n);

      result.push(new Misc.Point(x - step, prevY));
      //result.push(new Misc.Point(samples[ind].x, samples[ind].y));
    }
    //console.timeEnd("CurveTurning");
    return result;

    function getIndices(_slopes, brk = false) {
      let indices = [];
      let sign1;
      let sign = math.sign(_slopes[0]);
      for (let i = 1; i < _slopes.length; i++) {
        sign1 = math.sign(_slopes[i]);
        //sign = math.sign(_slopes[i - 1]);
        //console.log(sign, sign1);
        if (sign == sign1) {
          continue;
        }
        sign *= -1;
        indices.push(i - 1);
        if (brk) break;
      }
      return indices;
    }

    function getSlopes(_samples) {
      let slopes = [];
      for (let i = 1; i < _samples.length; i++) {
        slopes.push(Utility.slope(_samples[i], _samples[i - 1]));
      }
      return slopes;
    }
  }

  static curveInflectionPoint(
    fn,
    variable,
    samples,
    curve = null,
    decimalPlacesX = 200,
    decimalPlacesY = 400
  ) {
    let result = [];
    if (samples.length < 2) {
      return result;
    }
    //console.time("CurveInflection");

    let slopes = getSlopes(samples);

    let indices = getIndices(slopes);
    if (indices.length * 3 > slopes.length) {
      //we need at least 3 slopes to determine inflection.
      return result;
    }

    const parser = math.parse(fn);
    const scope = new Map();

    for (let i = 0; i < indices.length; i++) {
      const ind = indices[i];
      if (ind == 0) continue;

      let n = 0;
      let innerSamples = [];
      const numOfSteps = 5000;
      const xEnd = samples[ind + 1].x;
      const step = (xEnd - samples[ind].x) / numOfSteps;
      let x = samples[ind].x;

      let y;
      innerSamples.push({ x: samples[ind].x, y: samples[ind].y });
      while (/* x <= xEnd &&  */ n < numOfSteps) {
        x += step;
        scope.set(variable, x);
        y = parser.evaluate(scope);
        innerSamples.push({ x, y });
        n++;
      }
      innerSamples[innerSamples.length - 1] = {
        x: xEnd,
        y: samples[ind + 1].y,
      };

      const innerSlopes = getSlopes(innerSamples);
      const innerIndices = getIndices(innerSlopes, true);
      const innerInd = innerIndices[innerIndices.length - 1];
      if (!innerInd) {
        continue;
      }
      let endPoint1Line1 = [innerSamples[innerInd].x, innerSamples[innerInd].y];
      let endPoint2Line1 = [
        innerSamples[innerInd + 1].x,
        innerSamples[innerInd + 1].y,
      ];
      let endPoint1Line2 = [
        innerSamples[innerInd].x,
        (innerSamples[innerInd].y + innerSamples[innerInd + 1].y) / 2,
      ];
      let endPoint2Line2 = [
        innerSamples[innerInd + 1].x,
        (innerSamples[innerInd].y + innerSamples[innerInd + 1].y) / 2,
      ];

      const res = math.intersect(
        endPoint1Line1,
        endPoint2Line1,
        endPoint1Line2,
        endPoint2Line2
      );

      if (res) {
        result.push(new Misc.Point(res[0], res[1]));
      }
    }
    //console.timeEnd("CurveInflection");
    return result;

    function getIndices(_slopes, brk = false) {
      let indices = [];
      let polarity = true;
      for (let i = 1; i < _slopes.length; i++) {
        if (
          polarity ? _slopes[i] < _slopes[i - 1] : _slopes[i] > _slopes[i - 1]
        ) {
          polarity = !polarity;
          indices.push(i - 1);
          if (i > 1 && brk) {
            break;
          }
        }
      }
      return indices;
    }

    function getSlopes(_samples) {
      let slopes = [];
      for (let i = 1; i < _samples.length; i++) {
        slopes.push(Utility.slope(_samples[i], _samples[i - 1]));
      }
      return slopes;
    }
  }

  //Utility.mode

  static mathMode() {
    //rad 0.89399666360055789051826949840421 grad 0.98768834059513772619004024769344
    const test = math.evaluate("sin(90)");
    if (test == 0.89399666360055789051826949840421) {
      return "rad";
    }
    if (test == 0.98768834059513772619004024769344) {
      return "grad";
    }
    return "deg";
  }

  /* static getOperand(str, keyword, indexOfKeyword) {
    const subStr = str.substring(indexOfKeyword + keyword.length);
    let operand1 = subStr[0];
    let result = XRegExp.matchRecursive(subStr, "\\(", "\\)", "g");
    if (result) {
      if (operand1 !== "(") {
        return { operand1, operand2: result[0] };
      } else {
        return { operand1: result[0], operand2: result[1] };
      }
    }
    return null;
  } */

  static derivativeOrder(name) {
    let order = 0;
    name = name.trim();
    if (name.length < 4 || name.indexOf("(") == -1 || name.indexOf(")") == -1) {
      return 0;
    }
    for (let i = 1; i < name.length; i++) {
      if (name[i] !== "'") {
        break;
      }
      order++;
    }
    return order;
  }

  static getFullDerivativeDeclaration(str) {
    let m_str = Utility.purgeAndMarkKeywords(str);
    let ind = m_str.lastIndexOf("'(");
    for (let index = ind - 1; index > 0; index--) {
      if (m_str[index] == "'") ind--;
      else break;
    }
    if (ind == -1) {
      Utility.replaceKeywordMarkers(m_str);
      return null;
    }
    //const startIndex = m_str.indexOf("'") - 1;
    let res = ""; //m_str[ind - 1] + "'";
    for (let index = ind - 1; index < m_str.length; index++) {
      res += m_str[index];
      if (m_str[index] == "(") {
        ind = index;
        break;
      }
    }
    let par = 1;
    for (let i = ind + 1; i < m_str.length; i++) {
      res += m_str[i];
      if (m_str[i] == "(") par++;
      if (m_str[i] == ")") par--;
      if (par == 0) break;
    }
    Utility.replaceKeywordMarkers(m_str);
    return res;
  }

  static getInverseDeclaration(str, index = 0) {
    //f^(-1)(x)
    if (!str || str.length < 9) {
      return null;
    }
    let m_str = Utility.purgeAndMarkKeywords(str);
    for (let i = index + 6; i < m_str.length; i++) {
      if (
        m_str[i] === "(" &&
        m_str[i - 2] == "1" &&
        m_str[i - 3] == "-" &&
        Utility.isAlpha(m_str[i - 6])
      ) {
        const res = m_str.substring(i - 6, i + 1);
        Utility.replaceKeywordMarkers(m_str);

        let n = str.indexOf(res) + 7;

        let bracket = 1;
        let arg = "";
        for (n; n < str.length; n++) {
          const c = str[n];

          if (c == "(") {
            bracket++;
          }
          if (c == ")") {
            bracket--;
          }
          if (bracket == 0) {
            break;
          }
          arg += c;
        }

        return { dec: `${res}${arg})`, arg };
      }
    }
    Utility.replaceKeywordMarkers(m_str);
    return null;
  }

  static getFunctionDeclaration(str) {
    //f(x)
    let m_str = Utility.purgeAndMarkKeywords(str);
    for (let i = 3; i < m_str.length; i++) {
      if (
        m_str[i] === ")" &&
        m_str[i - 2] === "(" &&
        Utility.isAlpha(m_str[i - 1]) &&
        Utility.isAlpha(m_str[i - 3])
      ) {
        const res = m_str.substring(i - 3, i + 1);
        Utility.replaceKeywordMarkers(m_str);
        return res;
      }
    }
    Utility.replaceKeywordMarkers(m_str);
    return null;
  }

  /**
   *
   * @param {*} exp
   * @param {*} keyword
   * @param {*} indexOfKeyword
   * @returns
   */
  static getOperand(exp, keyword, indexOfKeyword) {
    //get operand
    let unmodifiedOperand = null;
    let operand = "";
    let lBracket = 0;
    for (let i = indexOfKeyword + keyword.length; i < exp.length; i++) {
      if (exp[i] == "(") {
        operand += "(";
        lBracket++;
        continue;
      }
      if (exp[i] == ")") {
        if (lBracket) {
          operand += ")";
          lBracket--;
          if (lBracket == 0) {
            break;
          }
        }
        continue;
      }
      operand += exp[i];
    }
    if (
      //str.substr(0, str.lastIndexOf(list[i]))
      operand.length > 3 &&
      operand[0] == "(" &&
      operand[1] == "(" &&
      operand[operand.length - 1] == ")" &&
      operand[operand.length - 2] == ")"
    ) {
      operand = operand.substring(
        operand.indexOf("(") + 1,
        operand.lastIndexOf(")")
      );
      unmodifiedOperand = `(${operand})`;
    }
    try {
      const m_operand = operand.substring(0, operand.indexOf("{"));
      const arr = m_operand.split("=");
      for (let i = 0; i < arr.length; i++) {
        math.parse(arr[i]);
      }
      return { operand, unmodifiedOperand };
    } catch (error) {
      return null;
    }

    //return { operand, unmodifiedOperand };
  }

  // static getOperand(exp, keyword, indexOfKeyword) {
  //   //get operand
  //   let operand = "";
  //   let lBracket = 0;
  //   for (let i = indexOfKeyword + keyword.length; i < exp.length; i++) {
  //     if (exp[i] == "(") {
  //       operand += "(";
  //       lBracket++;
  //       continue;
  //     }
  //     if (exp[i] == ")") {
  //       operand += ")";
  //       lBracket--;
  //       if (lBracket == 0) {
  //         break;
  //       }
  //       continue;
  //     }
  //     operand += exp[i];
  //   }
  //   return operand;
  // }

  static getLogOperandAndBase(str, index) {
    let bracket = 0;
    let result = "";
    for (let i = index + 3; i < str.length; i++) {
      const c = str[i];
      result += c;
      if (c == "(") {
        bracket++;
      }
      if (c == ")") {
        bracket--;
      }
      if (bracket == 0) {
        return result;
      }
    }
    return result;
  }

  static getOperandOfExponentToken(exp, indexOfExponent) {
    //get operand
    let operand = "";
    let unmodifiedOperand = null;
    if (Utility.isAlpha(exp[indexOfExponent + 1])) {
      //return exp[indexOfExponent + 1];
      return { operand: exp[indexOfExponent + 1], unmodifiedOperand };
    } else {
      const substr = exp.substring(indexOfExponent + 1);
      const num = parseFloat(substr);
      if (!isNaN(num)) {
        //return num.toString();
        // let s = num.toString();
        // if (s.length > 1) {
        //   s = s[0] + "*" + s.substring(1);
        // }
        return { operand: num.toString(), unmodifiedOperand };
      }
    }

    let lBracket = 0;
    for (let i = indexOfExponent + 1; i < exp.length; i++) {
      if (exp[i] == "(") {
        operand += "(";
        lBracket++;
        continue;
      }
      if (exp[i] == ")") {
        operand += ")";
        lBracket--;
        if (lBracket == 0) {
          break;
        }
        continue;
      }
      operand += exp[i];
    }
    // if (
    //   //str.substr(0, str.lastIndexOf(list[i]))
    //   operand.length > 3 &&
    //   operand[0] == "(" &&
    //   operand[1] == "(" &&
    //   operand[operand.length - 1] == ")" &&
    //   operand[operand.length - 2] == ")"
    // ) {
    //   operand = operand.substring(
    //     operand.indexOf("(") + 1,
    //     operand.lastIndexOf(")")
    //   );
    //   unmodifiedOperand = `(${operand})`;
    // }

    //operand = operand.replaceAll("")
    return { operand, unmodifiedOperand };
  }

  static discontinuity(exp, lower, upper, indepVar) {
    //console.time("discontinuity");
    function bindEquationEditorAngleModeChanged() {
      $(window).bind("equationEditorAngleModeChanged", function (e, mode) {
        console.log(mode);
        Utility.mode = mode;
      });
    }

    const bindFunc = _.once(bindEquationEditorAngleModeChanged);
    bindFunc();

    if (indepVar !== "x") {
      exp = Utility.purgeAndMarkKeywords(exp);
      let n = 0;
      while (exp.indexOf(indepVar) != -1 && n < 500) {
        exp = exp.replace(indepVar, "x");
        n++;
      }
      exp = Utility.replaceKeywordMarkers(exp);
    }

    let denominators = [];
    const trigs = [
      "sin",
      "cos",
      "tan",
      "sec",
      "csc",
      "cot",
      "asin",
      "acos",
      "atan",
      "asec",
      "acsc",
      "acot",
    ];

    function replaceTrigTanKeyword(exp, keyword, replacement1, replacement2) {
      if (exp.indexOf(keyword) == -1) return exp;
      while (exp.indexOf(keyword) !== -1) {
        const indexOfKeyword = exp.indexOf(keyword);

        //get operand
        /* let operand = "";
        let lBracket = 0;
        for (let i = indexOfKeyword + keyword.length; i < exp.length; i++) {
          if (exp[i] == "(") {
            operand += "(";
            lBracket++;
            continue;
          }
          if (exp[i] == ")") {
            operand += ")";
            lBracket--;
            if (lBracket == 0) {
              break;
            }
            continue;
          }
          operand += exp[i];
        } */

        let obj = Utility.getOperand(exp, keyword, indexOfKeyword);
        if (!obj) {
          Static.errorMessage = `Failed to determine operand for "${keyword}". Please check.`;
          return null;
        }
        if (obj.unmodifiedOperand) {
          exp = exp.replace(obj.unmodifiedOperand, obj.operand);
        }
        let operand = obj.operand;
        exp = exp.replace(
          keyword + operand,
          "((" + replacement1 + operand + ")/(" + replacement2 + operand + "))"
        );
      }
      return exp;
    }

    function replaceTrigKeyword(exp, keyword, replacement) {
      if (exp.indexOf(keyword) == -1) return exp;
      while (exp.indexOf(keyword) !== -1) {
        const indexOfKeyword = exp.indexOf(keyword);

        //get operand
        /* let operand = "";
        let lBracket = 0;
        for (let i = indexOfKeyword + keyword.length; i < exp.length; i++) {
          if (exp[i] == "(") {
            operand += "(";
            lBracket++;
            continue;
          }
          if (exp[i] == ")") {
            operand += ")";
            lBracket--;
            if (lBracket == 0) {
              break;
            }
            continue;
          }
          operand += exp[i];
        } */

        let obj = Utility.getOperand(exp, keyword, indexOfKeyword);
        if (!obj) {
          Static.errorMessage = `Failed to determine operand for "${keyword}". Please check.`;
          return null;
        }
        if (obj.unmodifiedOperand) {
          exp = exp.replace(obj.unmodifiedOperand, obj.operand);
        }
        let operand = obj.operand;

        exp = exp.replace(
          keyword + operand,
          "(1/(" + replacement + operand + "))"
        );
      }
      return exp;
    }

    function adjustConstantForMode(exp) {
      const trigsForConstantAdjustment = [
        "sin",
        "cos",
        "tan",
        "sec",
        "csc",
        "cot",
        // "asin",
        // "acos",
        // "atan",
        // "asec",
        // "acsc",
        // "acot",
      ];

      for (let i = 0; i < trigsForConstantAdjustment.length; i++) {
        let keyword = trigsForConstantAdjustment[i];
        let indexOfKeyword = exp.indexOf(keyword);
        if (indexOfKeyword == -1) continue;
        while (indexOfKeyword !== -1) {
          indexOfKeyword = exp.indexOf(keyword, indexOfKeyword);
          if (indexOfKeyword !== -1) {
            //get operand
            let operand = "";
            let lBracket = 0;
            for (let i = indexOfKeyword + keyword.length; i < exp.length; i++) {
              if (exp[i] == "(") {
                operand += "(";
                lBracket++;
                continue;
              }
              if (exp[i] == ")") {
                operand += ")";
                lBracket--;
                if (lBracket == 0) {
                  break;
                }
                continue;
              }
              operand += exp[i];
            }
            let constant = 0,
              replacement = 0;
            if (Utility.mathMode() == "deg") {
              constant = Math.abs(math.evaluate(operand, { x: 0 }));
              if (constant != 0) {
                replacement = (constant * Math.PI) / 180;
                exp = exp.replace(constant, replacement);
              }
            }

            indexOfKeyword++;
            //replacement.toString().length - constant.toString().length + 1;
          }
        }
      }
      return exp;
    }

    function adjustForMode(factor, solution) {
      // let considerMode = false;
      // for (let i = 0; i < denominators.length; i++) {
      //   for (let n = 0; n < trigs.length; n++) {
      //     if (denominators[i].indexOf(trigs[n]) !== -1) {
      //       considerMode = true;
      //       break;
      //     }
      //   }
      //   if (considerMode) break;
      // }
      // if (considerMode && Utility.mathMode() == "deg") {
      //   return (solution * 180) / Math.PI;
      // }
      // return solution;

      for (let i = 0; i < trigs.length; i++) {
        if (factor.indexOf(trigs[i]) !== -1) {
          if (Utility.mathMode() == "deg") {
            return (solution * 180) / Math.PI;
          }
        }
      }
      return solution;
    }

    function getCoeff(exp) {
      //exp = math.simplify(exp, {}, { exactFractions: false }).toString();
      let coeff = [];
      const node = math.parse(exp);
      const filtered = node.filter(function (node) {
        return node.op === "*" && node.args[1].name === "x";
      });

      // let filtered_constant = node.filter(function (node) {
      //   return node.type === "ConstantNode";
      // });

      for (let i = 0; i < filtered.length; i++) {
        coeff.push(filtered[i].args[0].getContent().value);
      }
      //coeff = _.uniq(coeff);
      return coeff;
    }

    function isPeriodic(exp) {
      return exp.indexOf("sin") != -1 || exp.indexOf("cos") != -1;
      /* exp = math.simplify(exp, {}, { exactFractions: false }).toString();
      let keyWord = "sin";
      if (exp.indexOf("cos") != -1) {
        keyWord = "cos";
      }
      let operand = Utility.getOperand(exp, keyWord, exp.indexOf(keyWord));
      operand = operand.replace("(", "").replace(")", "");
      let periodic = true;
      let _result = [];
      if (operand.length) {
        exp = exp.replaceAll(operand, "x");
        //exp = exp.replaceAll("*", "");
        let eq = nerdamer(`${exp}=0`);
        var solution = eq.solveFor("x");

        if (solution.length !== undefined && solution.length > 20) {
          for (let i = 0; i < solution.length; i++) {
            let val = Utility.adjustForDecimalPlaces(
              adjustForMode(math.evaluate(solution.at(i).valueOf())),
              10
            );
            _result.push(val);
          }
          _result = _.uniq(_result);
          _result = _result.sort(function (a, b) {
            return a - b;
          });

          //let periodic = true;
          //if (solution.length > 20) {
          let m_d = (_result[1] % 180) - (_result[0] % 180);
          for (let i = 1; i < _result.length; i++) {
            if (((_result[i] % 180) - (_result[i - 1] % 180)) % 180 != m_d) {
              periodic = false;
              break;
            }
          }
          // }
        }
      }
      return periodic; */
    }

    function getFactors(exp) {
      let factors = [];
      const node = math.parse(exp);
      const filtered = node.filter(function (node) {
        return (
          node.op === "*" &&
          (node.args[0].name === "sin" || node.args[0].name === "cos") &&
          (node.args[1].name === "sin" || node.args[1].name === "cos")
        );
      });

      // let filtered_constant = node.filter(function (node) {
      //   return node.type === "ConstantNode";
      // });

      for (let i = 0; i < filtered.length; i++) {
        factors.push(filtered[i].args[0].getContent().toString());
        factors.push(filtered[i].args[1].getContent().toString());
      }

      factors = factors.filter(function (e) {
        return e.indexOf("x") !== -1;
      });
      factors = _.uniq(factors);
      return factors;
    }

    function getDenominators(exp) {
      let denom = [];
      const node = math.parse(exp);
      const filtered = node.filter(function (node) {
        return node.op === "/";
      });

      // let filtered_constant = node.filter(function (node) {
      //   return node.type === "ConstantNode";
      // });

      for (let i = 0; i < filtered.length; i++) {
        denom.push(filtered[i].args[1].getContent().toString());
      }

      denom = denom.filter(function (e) {
        return e.indexOf("x") !== -1;
      });
      denom = _.uniq(denom);
      return denom;
    }

    exp = replaceTrigKeyword(exp, "sec", "cos");
    exp = replaceTrigKeyword(exp, "csc", "sin");
    exp = replaceTrigKeyword(exp, "cot", "tan");

    exp = replaceTrigTanKeyword(exp, "tan", "sin", "cos");
    //exp = replaceTrigTanKeyword(exp, "cot", "cos", "sin");
    try {
      exp = math.simplify(exp, {}, { exactFractions: false }).toString();
    } catch (error) {}
    //Replace the whitespace delimiters stripped out by simplify()
    exp = exp.replaceAll("mod", " mod ");
    exp = adjustConstantForMode(exp);

    let factors = [];
    denominators = denominators.concat(getDenominators(exp));
    denominators.forEach(function (d) {
      factors = factors.concat(getFactors(d));
    });

    if (factors.length == 0) {
      factors = denominators;
    }
    //console.log(486, denominators);

    let result = [];

    let d = 0;
    factors.forEach(function (e) {
      let m_result = [];
      let eq = null;
      var solution = null;
      try {
        eq = nerdamer(`${e}=0`);
        solution = eq.solveFor("x");
        //nerdamer.flush();
      } catch (error) {
        console.log("Error in discontinuity()");
      }
      nerdamer.clear("all");
      nerdamer.flush();

      let periodic = false;
      let coeff = 1;
      if (
        solution.length > 20 &&
        (e.indexOf("sin") !== -1 || e.indexOf("cos") !== -1)
      ) {
        /* let coeffs = getCoeff(e);
        if (coeffs.length) coeff = coeffs[0]; */
        periodic = isPeriodic(e);
      }

      if (solution.length !== undefined) {
        for (let i = 0; i < solution.length; i++) {
          //console.log(solution.at(i).valueOf());

          let val = adjustForMode(e, solution.at(i).valueOf());
          //val = Utility.adjustForDecimalPlaces(val, 10);
          m_result.push(val);
        }
        m_result = _.uniq(m_result);
        m_result = m_result.sort(function (a, b) {
          return a - b;
        });

        //let periodic = true;
        if (solution.length > 20) {
          if (periodic) {
            //a periodic function
            //Check for periodic
            d = m_result[1] - m_result[0];
            let a1 = m_result[0];

            if (d != 0) {
              //a periodic function
              if (m_result[0] > lower) {
                a1 = m_result[0] - Math.round((m_result[0] - lower) / d) * d;
              }
              m_result = [];

              let n = 0;
              while (1) {
                m_result.push(a1 + n * d);
                if (m_result[n] > upper) {
                  break;
                }
                n++;
              }
            }
          } else {
            //non periodic function with many solutions
          }
        }

        for (let i = 0; i < m_result.length; i++) {
          if (
            (m_result[i] >= lower ||
              Utility.mFuzzyCompare(m_result[i], lower, 1e-7)) &&
            (m_result[i] <= upper ||
              Utility.mFuzzyCompare(upper, m_result[i], 1e-7))
          ) {
            result.push(Utility.adjustForDecimalPlaces(m_result[i], 20));
          }
        }
      } else {
        let val = solution.valueOf();
        if (
          (val > lower || Utility.mFuzzyCompare(val, lower, 1e-10)) &&
          (val < upper || Utility.mFuzzyCompare(val, upper, 1e-10))
        ) {
          result.push(val);
        }
      }
    });

    result = _.uniq(result);
    result = result.sort(function (a, b) {
      return a - b;
    });
    //console.timeEnd("discontinuity");
    return result;
  }

  /* static filterOutlier(samples) {
    let m_samples = samples.map(function (e) {
      return e.y;
    });

    //Arrange the data in order from smallest to largest.
    m_samples = m_samples.sort(function (a, b) {
      return a - b;
    });

    const numberOfSamples = m_samples.length;

    //Find the first quartile, Q1.
    let Q1 = m_samples[Math.round(0.25 * numberOfSamples)];
    let Q3 = m_samples[Math.round(0.75 * numberOfSamples)];

    let IQR = Q3 - Q1;

    //Find the upper boundary.
    const upper = Q3 + 20 * IQR;

    //Find the lower boundary.
    const lower = Q1 - 20 * IQR;

    samples = samples.filter(function (e) {
      return e.y > lower && e.y < upper;
    });

    return samples;
  } */

  /**
   * Make a class abstract. Abstract classes cannot be instantiated. See example.
   * @param {object} obj The `this` value
   * @param {Function} constructor The constructor
   * @example
   * class MyAbstractClass {
   *    constructor() {
   *      Utility.makeAbstract(this, MyAbstractClass);
   *    }
   * }
   * new MyAbstractClass() //Throws an error
   *
   * class MyClass extends MyAbstractClass {
   * }
   * new MyClass() //Ok
   *
   */
  static makeAbstract(obj, constructor) {
    if (obj.constructor == constructor) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Returns val bounded by min and max. This is equivalent to Math.max(min, Math.min(val, max)).
   * @param {Number} min Minimum value
   * @param {Number} val Value
   * @param {Number} max Maximum value
   * @returns {Number} Value
   * @example
   * let myValue = 10;
     let minValue = 2;
     let maxValue = 6;

     let boundedValue = Utility.qBound(minValue, myValue, maxValue);
     // boundedValue == 6
   */
  static qBound(min, val, max) {
    return Math.max(min, Math.min(val, max));
  }

  /**
   * Adjust the precision of a number.
   *
   * In most cases, round-off errors donÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t matter: they have no significant impact on the results. However,
   * it looks ugly when displaying output to a user. A solution is to limit the precision just below
   * the actual precision of 16 digits in the displayed output:
   * @param {number} value number to be adjusted.
   * @param {number} numberOfDigits required precision.
   * @returns {String} adjusted number.
   */
  static toPrecision(value, numberOfDigits) {
    if (numberOfDigits < 1) {
      numberOfDigits = 1;
    } else if (numberOfDigits > 16) {
      numberOfDigits = 16;
    }
    //return math.format(value, {precision: numberOfDigits});
    value = parseFloat(value);
    if ($.isNumeric(value)) return value.toPrecision(numberOfDigits);
    return value;
  }

  static decimalPlaces(num) {
    var match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0)
    );
  }

  static grapherDeterminedDecimalPlaces(curve) {
    let decimalPlacesX = 1;
    let decimalPlacesY = 1;

    if (!curve || !curve.sample) {
      return { decimalPlacesX: 2, decimalPlacesY: 2 };
    }

    const sample0 = curve.sample(0);
    const sample1 = curve.sample(1);
    if (sample0 && sample1) {
      let x0 = Utility.adjustForDecimalPlaces(sample0.x, decimalPlacesX);
      let x1 = Utility.adjustForDecimalPlaces(sample1.x, decimalPlacesX);

      let n = 0;
      while (x0 == x1 && n < 300) {
        decimalPlacesX++;
        x0 = Utility.adjustForDecimalPlaces(sample0.x, decimalPlacesX);
        x1 = Utility.adjustForDecimalPlaces(sample1.x, decimalPlacesX);
        n++;
      }
      //decimalPlacesX--;

      //const parser = math.parse(curve.fn);
      n = 0;
      let y0 = Utility.adjustForDecimalPlaces(sample0.y, decimalPlacesY);
      let y1 = Utility.adjustForDecimalPlaces(sample1.y, decimalPlacesY);
      while (y0 == y1 && n < 300) {
        decimalPlacesY++;
        y0 = Utility.adjustForDecimalPlaces(sample0.y, decimalPlacesY);
        y1 = Utility.adjustForDecimalPlaces(sample1.y, decimalPlacesY);
        n++;
      }
      //decimalPlacesY--;

      if (decimalPlacesY == 302) {
        decimalPlacesY = 2;
      }
    }
    //console.log({ decimalPlacesX, decimalPlacesY });
    return { decimalPlacesX, decimalPlacesY };
  }

  /**
   * Adjust the decimal places of a number. See example.
   * @param {number} number number to be adjusted.
   * @param {number} places number of decimal places.
   * @returns {number} adjusted number.
   * @example
   * adjustForDecimalPlaces(4.145214, 3) -> 4.145
   */
  static adjustForDecimalPlaces(number, places) {
    if (typeof number == "string") {
      number = parseFloat(number);
    }
    if (places === 0) return Math.round(number);
    if (places == undefined) places = 5;

    // if (places > 300) places = 300;
    var multiplier = Math.pow(10, places);
    const val = Math.round(number * multiplier);
    if (!isFinite(val)) return number;
    return val / multiplier;
  }

  /**
   * Compares the floating point value a and b and returns true if they are considered equal, otherwise false.
   * @param {Number} a
   * @param {Number} b
   * @returns {Boolean} true if they are considered equal, otherwise false.
   */
  static mFuzzyCompare(a, b, eps = Static._eps) {
    var diff = Math.abs(a - b);
    if (diff < eps) {
      return true;
    }
    return false;
    //return (Math.abs(a - b) * 1000000000000. <= Math.min(Math.abs(a), Math.abs(b)));
  }
  //return (qAbs(p1 - p2) * 100000.f <= qMin(qAbs(p1), qAbs(p2)));

  /**
   * Compares the floating point value value1 and value2 and returns true if they are considered equal, otherwise false.
   * @param {Number} value1 Value
   * @param {Number} value2 Value
   * @param {Number} intervalSize Interval width
   * @returns {Boolean} true if they are considered equal, otherwise false.
   * @example
   * //The following two checks will determine if the value is within the interval
   * m3FuzzyCompare(value, interval.minValue(), interval.width())
   * m3FuzzyCompare(value, interval.maxValue(), interval.width())
   */
  static m3FuzzyCompare(value1, value2, intervalSize) {
    var eps = Math.abs(Static._eps * intervalSize);

    if (value2 - value1 > eps) return -1;

    if (value1 - value2 > eps) return 1;

    return 0;
  }

  /**
   * Build a RGB color string that represents the inverted color of the RGB color string received as argument.
   * @param {String} rgb Color (e.g.: "rgb(255, 0, 0)", "#ff0000", or "red")
   * @returns {String} Inverted color
   */
  static invert(bg) {
    if (typeof bg == "string" && bg.indexOf("#") == -1)
      bg = Utility.RGB2HTML(bg);
    // rgb = Utility.colorToRGB(rgb);
    // rgb = [].slice
    //   .call(arguments)
    //   .join(",")
    //   .replace(/rgb\(|\)|rgba\(|\)|\s/gi, "")
    //   .split(",");
    // for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
    // return "rgb(" + rgb.join(", ") + ")";

    bg = parseInt(Number(bg.replace("#", "0x")), 10);
    bg = ~bg;
    bg = bg >>> 0;
    bg = bg & 0x00ffffff;
    bg = "#" + bg.toString(16).padStart(6, "0");

    return bg;
  }

  /**
   * Generate a RGB color string from the argument.
   */
  static colorToRGB(hex) {
    if (hex.indexOf("rgb") !== -1) return hex;
    if (hex.indexOf("#") == -1) hex = Utility.colorNameToHex(hex);
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const r =
      "rgb(" +
      parseInt(result[1], 16) +
      "," +
      parseInt(result[2], 16) +
      "," +
      parseInt(result[3], 16) +
      ")";

    return r;
  }

  /**
   * Generate a hex color string from the argument(s). See example for usage.
   * @param {object|String|Number} red An object or string representing a RGB color or a number ([0-255]) representing the red component of the color.
   * @param {Number} [green] A number ([0-255]) representing the green component of the color (Disregarded if red is not a number)
   * @param {Number} [blue] A number ([0-255]) representing the blue component of the color (Disregarded if red is not a number)
   * @returns {String} hex color string
   * @example
   * RGB2HTML({r:255, g:0, b:0}) -> "#ff0000"
   * RGB2HTML("rgb(255, 0, 0)") -> "#ff0000"
   * RGB2HTML(255, 0, 0) -> "#ff0000"
   */
  static RGB2HTML(red, green, blue) {
    if (typeof red == "string") {
      var str = red;
      //console.log(red)
      str = str.replace("rgb(", "");
      red = parseInt(str);
      str = str.replace(",", "");
      str = str.replace(red, "");
      green = parseInt(str);
      str = str.replace(",", "");
      str = str.replace(green, "");
      blue = parseInt(str);
    }
    if (red.r !== undefined) {
      var temp = red;
      red = red.r;
      green = temp.g;
      blue = temp.b;
    }
    var decColor = 0x1000000 + blue + 0x100 * green + 0x10000 * red;
    return "#" + decColor.toString(16).substr(1);
  }

  /**
   * Get a hex color string from a color name.
   * @param {String} colour color name
   * @returns {String} hex color string
   * @example
   * colorNameToHex("aliceblue") -> "#f0f8ff"
   */
  static colorNameToHex(colour) {
    var colours = {
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aqua: "#00ffff",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      black: "#000000",
      blanchedalmond: "#ffebcd",
      blue: "#0000ff",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgrey: "#a9a9a9",
      darkgreen: "#006400",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      fuchsia: "#ff00ff",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      gray: "#808080",
      grey: "#808080",
      green: "#008000",
      greenyellow: "#adff2f",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      "indianred ": "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgrey: "#d3d3d3",
      lightgray: "#d3d3d3",
      lightgreen: "#90ee90",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      lime: "#00ff00",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      maroon: "#800000",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370d8",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      navy: "#000080",
      oldlace: "#fdf5e6",
      olive: "#808000",
      olivedrab: "#6b8e23",
      orange: "#ffa500",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#d87093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      purple: "#800080",
      rebeccapurple: "#663399",
      red: "#ff0000",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      silver: "#c0c0c0",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      teal: "#008080",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      white: "#ffffff",
      whitesmoke: "#f5f5f5",
      yellow: "#ffff00",
      yellowgreen: "#9acd32",
    };

    if (typeof colour === "object")
      return Utility.RGB2HTML(colour.r, colour.g, colour.b);

    if (colour[0] == "r" && colour[1] == "g" && colour[2] == "b")
      return Utility.RGB2HTML(colour);

    if (colour[0] == "#") return colour;

    if (typeof colours[colour.toLowerCase()] != "undefined")
      return colours[colour.toLowerCase()];

    return "#000000";
  }

  /**
   * Displays a dialog box with a message.
   * @param {string} msg The text to display in the dialog box
   * @param {string} [type = "big"] To display a small dialog, use "small" for this argument.
   * @param {string} [doNotShowOptionId] Unique Id use to display the "Don't show again" checkbox.
   *
   * @example
   * Utility.alert("No curves found", "small") //Display a small alert Utility.alertYesNobox with the message "No curves found".
   */
  static alert(msg, type, doNotShowOptionId) {
    if (Utility.alertObj == undefined) {
      Utility.alertObj = new AlertDlg();
    }
    Utility.alertObj.alert(msg, type, doNotShowOptionId);
  }

  /**
	 * Displays a dialog box with a question and allow the user to cancel or answer Yes or No.
	 * @param {string} msg The text(question) to display in the dialog box.
	 * @param {Function} cb A callback, that takes one argument(an integer), that is called when the user clicks Yes, No or Cancel. See example below.
	 * @param {string} [type = "big"] To display a small dialog, use "small" for this argument.
	 * @example Utility.alertYesNo("Do you want to save the changes to the Grapher?", function(answer){
		switch(answer){
			case Cancel:
				console.log('do Cancel stuff')
				break;
			case Yes:
				console.log('do Yes stuff')
				break;
			case No:
				console.log('do No stuff')
				break;
			default:
				// code block
		}
		}); 
	 */

  static alertYesNoAsync(msg, type, doNotShowOptionId) {
    return new Promise((resolve, reject) => {
      if (Utility.alertObj == undefined) {
        Utility.alertObj = new AlertDlg();
      }
      Utility.alertObj.alertYesNo(
        msg,
        () => {
          return resolve(Utility.res);
        },
        type,
        doNotShowOptionId
      );
    });
  }

  static alertYesNo(msg, cb, type, doNotShowOptionId) {
    if (Utility.alertObj == undefined) {
      Utility.alertObj = new AlertDlg();
    }
    Utility.alertObj.alertYesNo(msg, cb, type, doNotShowOptionId);
  }

  /**
	 * Displays a dialog box that prompts the visitor for input.
	 * @param {string} msg The text to display in the dialog box
	 * @param {string} defaultMsg The default input text
	 * @param {Function} cb A callback, that takes one argument, that is called when the visitor clicks OK. See example below.
	 * @param {string} [type = "big"] To display a small dialog, use "small" for this argument.
	 * @example Utility.prompt("Enter a new name for", "AAAA", function(str){
			console.log(str) //If the visitor clicks OK, the input is log to the console. 
			return true
			})
	 */
  static prompt(msg, defaultMsg, cb, type) {
    if (Utility.promptObj == undefined) {
      Utility.promptObj = new PromptDlg();
    }
    Utility.promptObj.prompt(msg, defaultMsg, cb, type);
  }

  /**
   * Build a color string of the form "rgb(225, 0, 0)" from the form "#ff0000";
   * @param {String} hex Hex color string
   * @returns {String} Equivalent RGB color string
   */
  static HTMLToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? Utility.mRgb(
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        )
      : null;
  }

  /**
   * Build an object representing a RGB color
   * @param {Number} red Integer between 0 and 255 representing the red color component
   * @param {Number} green Integer between 0 and 255 representing the green color component
   * @param {Number} blue Integer between 0 and 255 representing the blue color component
   * @returns {object} An object of the form {r: 255, g:0, b:0}. The object has a toString() method that provides a string representation of the object. obj.toString() -> "rgb(255, 0, 0)"
   */
  static mRgb(red, green, blue) {
    return {
      r: red,
      g: green,
      b: blue,
      toString: function () {
        return "rgb(" + red + "," + green + "," + blue + ")";
      },
    };
  }

  /**
   * Build an object representing a RGBA color
   * @param {Number} red Integer between 0 and 255 representing the red color component
   * @param {Number} green Integer between 0 and 255 representing the green color component
   * @param {Number} blue Integer between 0 and 255 representing the blue color component
   * @param {Number} alpha Integer between 0 and 255 representing the alpha color component
   * @returns {object} An object of the form {r: 255, g:0, b:0, a:0}. The object has a toString() method that provides a string representation of the object. obj.toString() -> "rgb(255, 0, 0, 0)"
   */
  static mRgba(red, green, blue, alpha) {
    return {
      r: red,
      g: green,
      b: blue,
      a: alpha,
      toString: function () {
        return "rgb(" + red + "," + green + "," + blue + "," + alpha + ")";
      },
    };
  }

  static containAlpha(str) {
    if (!str || str.length == 0) {
      return false;
    }
    for (let i = 0; i < str.length; i++) {
      if (Utility.isAlpha(str[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {String} ch Character
   * @returns {number} Returns true if the character is a letter. otherwise returns false.
   */
  static isAlpha(ch) {
    ch = ch.toLowerCase().charCodeAt(0);
    return ch > 96 && ch < 122;
  }

  static isDigit(c) {
    let pattern = /[0-9]/;
    return pattern.test(c);
  }

  static isMathematicalEqual(exp1, exp2) {
    if (exp1 === exp2) {
      return true;
    }
    exp1 = Utility.purgeAndMarkKeywords(exp1);
    let scope = new Map();
    for (let i = 0; i < exp1.length; i++) {
      if (Utility.isAlpha(exp1[i])) {
        scope.set(exp1[i], 1);
      }
    }
    exp1 = Utility.replaceKeywordMarkers(exp1);
    let s1 = exp1;
    try {
      s1 = math.evaluate(exp1, scope);
    } catch (error) {}
    let s2 = exp2;
    try {
      s2 = math.evaluate(exp2, scope);
    } catch (error) {}
    if (typeof s1 === "object" && typeof s2 === "object") {
      return s1.im == s2.im && s1.re == s2.re;
    }
    return s1 == s2;
  }

  static removeUnwantedParentheses(str) {
    while (str[0] === "(" && str[str.length - 1] === ")") {
      str = str.replace("(", "").replace(/.$/, "");
    }

    // if (Utility.containsKeyword(str)) {
    //   return str;
    // }

    // let arr = str.match(/\([-+*/.+a-zA-Z0-9]*\)/g);
    // if (!arr) return str;
    // for (let i = 0; i < arr.length; i++) {
    //   let doReplace = false;
    //   let subStr = arr[i];

    //   let replStr = subStr.substring(1, subStr.length - 1);

    //   let replStr2 = replStr
    //     .replaceAll("*", "")
    //     .replaceAll("/", "")
    //     .replace(/[a-zA-Z]/g, "");
    //   if (math.hasNumericValue(replStr2)) {
    //     doReplace = true;
    //   }

    //   if (replStr.length === 1 || math.hasNumericValue(replStr) || doReplace) {
    //     str = str.replace(subStr, replStr);
    //   }
    // }
    return str;
  }

  static removeUnwantedAsterisk(str) {
    //return str;
    if (str.length < 3) return str;
    if (str.length == 3) {
      if (str[1] == "*" && Utility.isDigit(str[0]) && Utility.isAlpha(str[2])) {
        return str.replace("*", "");
      }
      return str;
    }
    let result = str[0];

    for (let i = 1; i < str.length; i++) {
      if (str[i] !== "*") {
        result += str[i];
        continue;
      }

      if (str[i - 2] && str[i - 2] == "^") {
        result += str[i];
        continue;
      }

      if (Utility.isDigit(str[i - 1]) && Utility.isAlpha(str[i + 1])) {
        if (str[i + 2]) {
          if (!Utility.isAlpha(str[i + 2])) {
            continue;
          } else {
            result += str[i];
          }
        }
      }
      if (
        Utility.isAlpha(str[i - 1]) &&
        (str[i + 1] == "(" || Utility.isDigit(str[i + 1]))
      ) {
        result += str[i];
        continue;
      }
      if (
        Utility.isAlpha(str[i - 1]) &&
        str[i + 2] &&
        Utility.isAlpha(str[i + 1]) &&
        Utility.isAlpha(str[i + 2])
      ) {
        result += str[i];
      }
    }
    return result;
  }

  static enableIntegrate() {}

  /**
   * The expression parser of math.js has support for letting functions
   * parse and evaluate arguments themselves, instead of calling them with
   * evaluated arguments.
   *
   * By adding a property `raw` with value true to a function, the function
   * will be invoked with unevaluated arguments, allowing the function
   * to process the arguments in a customized way.
   *
   * enableIntegrate() sets up math.js to handle finite integration.
   *
   *
   * Syntax:
   *
   *     integrate(integrand, variable, start, end)
   *     integrate(integrand, variable, start, end, step)
   *
   * @example
   * math.evaluate('integrate(2*x, x, 0, 2)') //integrate 2x with respect to x between the limit [0 - 2]
   * math.evaluate('integrate(2*x, x, 0, 2, 0.01)') //integrate 2x with respect to x between the limit [0 - 2] in steps of 0.01
   *
   */
  static enableIntegrate() {
    if (math.integrate) return;
    //integraeEnabled = true;

    /**
     * Calculate the numeric integration of a function
     *
     * @param {Function} f
     * @param {number} start
     * @param {number} end
     * @param {number} [step=0.01]
     * @inner
     */
    function integrate(f, start, end, volumeX, step) {
      //Reset
      Static.total_area = 0;
      Static.total_volume = 0;
      var _x = 0;
      volumeX = volumeX || false;
      var x = start;
      var y = 0;
      if (volumeX) {
        if (step > Static._eps) {
          for (x; x < end; x += step) {
            var _x = x + step;
            if (_x > end) step = step - (_x - end);
            y = f(x + step / 2);
            Static.total_volume += y * step * y * Math.PI;
          }
        } else {
          alert(
            "The aplication is attempting to use too small a step in the trapezoidial rule."
          );
        }
        return Static.total_volume;
      }
      if (step > Static._eps) {
        for (x; x < end; x += step) {
          var _x = x + step;
          if (_x > end) step = step - (_x - end);
          y = f(x + step / 2);
          Static.total_area += y * step;
        }
      } else {
        alert(
          "The aplication is attempted to use too small a step in the trapezoidial rule."
        );
      }

      return Static.total_area;
    }

    /**
     * A transformation for the integrate function. This transformation will be
     * invoked when the function is used via the expression parser of math.js.
     *
     * Syntax:
     *
     *     integrate(integrand, variable, start, end)
     *     integrate(integrand, variable, start, end, step)
     *
     * Usage:
     *
     *     math.evaluate('integrate(2*x, x, 0, 2)')
     *     math.evaluate('integrate(2*x, x, 0, 2, 0.01)')
     *
     * @param {Array.<math.expression.node.Node>} args
     *            Expects the following arguments: [f, x, start, end, step]
     * @param {object} math
     * @param {object} [scope]
     */
    integrate.transform = function (args, math, scope) {
      // determine the variable name
      if (!args[1].isSymbolNode) {
        throw new Error("Second argument must be a symbol");
      }
      const variable = args[1].name;

      // evaluate start, end, and step
      var start = args[2].compile().evaluate(scope);
      var end = args[3].compile().evaluate(scope);
      var volumeX = args[4] && args[4].compile().evaluate(scope); // volumeX is optional
      var step = args[5] && args[5].compile().evaluate(scope); // step is optional

      // create a new scope, linked to the provided scope. We use this new scope
      // to apply the variable.
      var fnScope = scope;

      // construct a function which evaluates the first parameter f after applying
      // a value for parameter x.
      var fnCode = args[0].compile();
      var f = function (x) {
        fnScope.set(variable, x);
        return fnCode.evaluate(fnScope);
      };

      // execute the integration
      return integrate(f, start, end, volumeX, step);
    };

    // mark the transform function with a "rawArgs" property, so it will be called
    // with uncompiled, unevaluated arguments.
    integrate.transform.rawArgs = true;

    // import the function into math.js. Raw functions must be imported in the
    // math namespace, they can't be used via `eval(scope)`.
    math.import({
      integrate: integrate,
    });
  }

  /**
   * Build a string from `str` for which any keyword is replaced by `""`
   * @param {*} str
   * @returns {String} String with all keywords removed
   */
  static purgeKewords(str) {
    var result = str.replace(/\^/g, "");
    let count = 0;
    for (var i = 0; i < Static.keywords.length; ++i) {
      while (result.indexOf(Static.keywords[i]) != -1) {
        result = result.replace(Static.keywords[i], "");
        count++;
      }
    }
    return { str: result, count };
  }

  /**
   * Search a expresion string for a independent variable.
   *
   * An idependent variable is any alpha character other than e.
   * @param {String} fx Expression string
   * @returns {String} Independent variable.
   */
  static findIndepVar(fx) {
    //e = 2.718281828, thus 'e' is excluded from alphas
    var alphas = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var i = 0;

    var fnWithoutKeywords = Utility.purgeKewords(fx).str;

    while (i < fnWithoutKeywords.length) {
      var c = fnWithoutKeywords.charAt(i);
      var str = "";
      while (alphas.indexOf(c) != -1 && i < fnWithoutKeywords.length) {
        str += c;
        ++i;
        c = fnWithoutKeywords.charAt(i);
      }
      if (str.length === 1) {
        return str;
      }
      ++i;
    }
    return undefined;
  }

  // /\b(log)\b/g
  /*
  subStr is a regular expression. Look-out for special characters.
  */
  static countString(str, subStr, wholeWord = false) {
    let pattern = null;
    if (wholeWord) {
      pattern = new RegExp(`\\b${subStr}\\b`, "g");
    } else {
      pattern = new RegExp(`${subStr}`, "g");
    }
    let res = str.match(pattern);
    if (res) {
      return res.length;
    }
    return 0;
  }

  static getLogBase(str, index) {
    let result = "";
    let bracket = 0;
    let collectChar = false;
    for (let i = index; i < str.length; i++) {
      if (collectChar) {
        result += str[i];
      }
      if (str[i] == "(") {
        bracket++;
        if (!collectChar) {
          collectChar = true;
          result += str[i];
        }
      }
      if (str[i] == ")") {
        bracket--;
        //result += str[i];
      }
      if (collectChar && bracket == 0) {
        return result;
      }
    }
    return result;
  }

  static splitParametricFunction(str) {
    if (!Utility.isParametricFunction(str)) {
      return null;
    }

    let logCommaExpected = 0;
    let arr = null;
    str = str.replace("(", "");
    str = str.substring(0, str.length - 1);

    const comma = Utility.countString(str, ",");
    if (comma == 1) {
      arr = str.split(",");
      return { operand: arr[0], base: arr[1] };
    } else {
      for (let i = 0; i < str.length; i++) {
        if (
          i + 3 < str.length &&
          str[i] == "l" &&
          str[i + 1] == "o" &&
          str[i + 2] == "g"
        ) {
          logCommaExpected++;
          i += 3;
        }
        if (str[i] == ",") {
          if (logCommaExpected == 0) {
            return {
              operand: str.substring(0, i),
              base: str.substring(i + 1, str.length),
            };
          } else {
            logCommaExpected--;
          }
        }
      }
    }
    return null;
  }

  static isParametricFunction(str) {
    if (!str && str.length) {
      return false;
    }
    const indOfCurly = str.indexOf("{");
    if (indOfCurly != -1) {
      str = str.substring(0, indOfCurly);
    }
    if (!(str[0] == "(" && str[str.length - 1] == ")")) {
      return false;
    }

    str = str.replace("(", "");
    str = str.replace(/.$/, "");
    const arr = str.split(",");
    if (arr.length != 2 || arr[0].length < 1 || arr[1].length < 1) {
      return false;
    }

    const comma = Utility.countString(str, ",");
    if (comma == 0) {
      return false;
    } else {
      const kw = Utility.countString(str, "log");
      if (comma - kw == 1) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * Check the expression string for a keyword
   * @param {String} str String to search
   * @returns {String} keyword or if no keyword is found, null.
   */
  static containsKeyword(str) {
    for (var i = 0; i < Static.keywords.length; i++) {
      if (str.indexOf(Static.keywords[i]) == -1) continue;
      return Static.keywords[i];
    }
    return null;
  }

  static containsTrigKeyword(str) {
    for (var i = 0; i < Static.trigKeywords.length; i++) {
      if (str.indexOf(Static.trigKeywords[i]) == -1) continue;
      return Static.trigKeywords[i];
    }
    return null;
  }

  // static insertAbs(expStr) {
  //   var str = expStr;

  //   let bar = 0;
  //   let par = 0;
  //   for (let i = 0; i < str.length; i++) {
  //     if (str[i] == "|") {
  //       bar++;
  //       str = str.replace(str[i], "$"); //opening bar
  //     }
  //     if (par == 0) {
  //     }
  //   }

  //   str = str.replace("$", "abs(");
  //   str = str.replace("~", ")");
  //   return str;
  // }

  /**
   * Build a Math.js valid expression string from `expStr` for which any occurrences of `logb(x)` is replaced by `log(x, b)` where b, the base, is an integer between 2 and 10.
   * @example
   * logBaseAdjust("4x^2 + log4(1.5x)") -> "4x^2 + log(1.5x, 4)"
   * @param {String} expStr Expression string
   * @returns {String} Modified expression string
   */
  static logBaseAdjust(expStr) {
    /* var logBaseStr = [
      "log2",
      "log3",
      "log4",
      "log5",
      "log6",
      "log7",
      "log8",
      "log9",
      "log10",
    ];

    //helper
    function insertLogBase(expStr, logStr) {
      if (!expStr) return null;
      var str = expStr;
      //var resultStr = "";
      if (expStr.includes(logStr)) {
        var base = logStr.replace("log", "");
        //console.log(base)
        while (str.indexOf(logStr) !== -1) {
          var i = str.indexOf(logStr) + logStr.length;
          var leftPar = 0;
          var rightPar = 0;
          for (i; i < str.length; ++i) {
            if (str[i] == "(") leftPar++;
            if (str[i] == ")") rightPar++;
            if (leftPar == rightPar) {
              str = str.insertAt(i, 0, "," + base);
              str = str.replace(logStr, "log");
              //console.log(str)
              break;
            }
          }
        }
      }
      return str;
    }

    for (var i = 0; i < logBaseStr.length; i++) {
      expStr = insertLogBase(expStr, logBaseStr[i]);
    } */
    return expStr;
  }

  /**
   * Get the square of the number
   * @param {Number} value Number to square (value*value)
   * @returns {number} Square of value (value*value)
   */
  static sqr(value) {
    return Math.pow(value, 2);
  }

  static replaceKeywordMarkers(str) {
    for (var i = 0; i < Utility.keywordMarkers.length; ++i) {
      while (str.indexOf(Utility.keywordMarkers[i].marker) != -1) {
        str = str.replace(
          Utility.keywordMarkers[i].marker,
          Utility.keywordMarkers[i].keyword
        );
        // console.log("replaceKey");
      }
    }
    Utility.keywordMarkers = [];
    return str;
  }

  static purgeAndMarkKeywords(str, exclude_e = false) {
    let result = str;
    for (var i = 0; i < Static.keywords.length; ++i) {
      if (Static.keywords[i] == "e" && exclude_e) {
        continue;
      }
      while (result.indexOf(Static.keywords[i]) != -1) {
        var _marker = "%" + Utility.keywordMarkers.length + "%";
        result = result.replace(Static.keywords[i], _marker);
        Utility.keywordMarkers.push({
          marker: _marker,
          keyword: Static.keywords[i],
        });
        //console.log("purgeKey");
      }
    }
    return result;
  }

  static insertProductSignOn_e(str) {
    if ($.isNumeric(str)) {
      return str;
    }
    if (str.indexOf(",") != -1) return str;
    if (!str || str.length == 0) {
      return "";
    }
    str = Utility.purgeAndMarkKeywords(str, true);
    let indexOfe = str.indexOf("e");
    while (indexOfe !== -1) {
      let replaced = false;
      if (
        indexOfe > 0 &&
        (Utility.isDigit(str[indexOfe - 1]) ||
          Utility.isAlpha(str[indexOfe - 1]) ||
          str[indexOfe - 1] === "~")
      ) {
        str = str.replace("e", "*~");
        replaced = true;
      }
      if (
        indexOfe < str.length - 1 &&
        (Utility.isAlpha(str[indexOfe + 1]) ||
          Utility.isDigit(str[indexOfe + 1]))
      ) {
        str = str.replace("e", "~*");
        replaced = true;
      }

      if (!replaced) {
        str = str.replace("e", "~");
      }
      indexOfe = str.indexOf("e");
    }
    str = str.replaceAll("~", "e");
    str = Utility.replaceKeywordMarkers(str, true);
    return str;
  }

  static insertProductSignOnPi(str) {
    if ($.isNumeric(str)) {
      return str;
    }
    if (str.indexOf(",") != -1) return str;
    if (!str || str.length == 0) {
      return "";
    }
    let indexOfPi = str.indexOf("pi");
    while (indexOfPi !== -1) {
      let replaced = false;
      if (
        indexOfPi > 0 &&
        (Utility.isAlpha(str[indexOfPi - 1]) || str[indexOfPi - 1] === "~")
      ) {
        str = str.replace("pi", "*~~");
        replaced = true;
      }
      if (
        indexOfPi + 1 < str.length - 1 &&
        (Utility.isAlpha(str[indexOfPi + 2]) ||
          Utility.isDigit(str[indexOfPi + 2]))
      ) {
        str = str.replace("pi", "~~*");
        replaced = true;
      }

      if (!replaced) {
        str = str.replace("pi", "~~");
      }
      indexOfPi = str.indexOf("pi");
    }
    str = str.replaceAll("~~", "pi");
    return str;
  }

  static insertProductSign(str, defines) {
    if (!str) return null;
    if (str.indexOf(",") != -1) return str;
    if (!str || str.length == 0) {
      return "";
    }

    str = str.replace(/\s/g, "");

    // try {
    //   str = math
    //     .simplify(str, {}, { exactFractions: false })
    //     .toString()
    //     .replace(/\s/g, "");
    // } catch (error) {}
    // str = math
    //   .simplify(str, {}, { exactFractions: false })
    //   .toString()
    //   .replace(/\s/g, "");

    //Replace the whitespace delimiters stripped out by simplify()
    //str = str.replaceAll("mod", " mod ");

    function hasKeyword(str) {
      for (var i = 0; i < Static.keywords.length; ++i) {
        while (str.indexOf(Static.keywords[i]) != -1) return true;
      }
      return false;
    }

    //if (hasKeyword(str)) return str;

    let res = null;
    if (hasKeyword(str)) {
      str = Utility.purgeAndMarkKeywords(str);
      res = str.match(/%(.*?)%/g);
      for (let i = 0; i < res.length; i++) {
        // str = str.replace(res[i], `(${res[i]}`);
      }
    }

    var result = "";
    result += str[0];
    for (var i = 1; i < str.length; ++i) {
      if (
        (Utility.isAlpha(str[i - 1]) && Utility.isAlpha(str[i])) ||
        (Utility.isAlpha(str[i - 1]) && str[i] == "(")
      ) {
        if (
          defines &&
          !defines.isCharPartOfAdefine(str[i - 1]) &&
          str[i - 1] !== ","
        ) {
          //if (!defines?.isCharPartOfAdefine(str[i - 1]) && str[i - 1] !== ",") {
          result += "*";
        }
      }
      // if (_.isFinite(str[i - 1]) && Utility.isAlpha(str[i])) {
      //   result += "*";
      // }
      result += str[i];
    }

    if (res) {
      /* for (let i = 0; i < res.length; i++) {
        result = result.replace(`(${res[i]}`, res[i]);
      } */
      result = Utility.replaceKeywordMarkers(result);
    }

    result = Utility.insertProductSignOnPi(result);
    result = Utility.insertProductSignOn_e(result);

    return result;
  }

  /* Static.keywords = [
  "unaryMinus",
  "sqrt",
  "asinh",
  "acosh",
  "atanh",
  "acoth",
  "asech",
  "acsch",
  "asin",
  "acos",
  "atan",
  "acot",
  "asec",
  "acsc",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "sech",
  "csch",
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "ln",
  "log",
  "log2",
  "log3",
  "log4",
  "log5",
  "log6",
  "log7",
  "log8",
  "log9",
  "log10",
  "deg",
  "pi",
  "PI",
  "e",
  // "E",
  "abs",
  //"mod",
]; //"deg" comes before "e", deliberately. */

  static getExponentTokenPrefix(str, indexOfToken) {
    const substr = str.substring(0, indexOfToken);
    let pattern = /log_\(([^)]+)\)/;
    let _result = substr.match(pattern);
    if (_result && _result[0]) {
      return _result[0];
    }

    pattern = /log_([^)]+)/;
    _result = substr.match(pattern);
    if (_result && _result[0]) {
      return _result[0];
    }

    let result = "";
    indexOfToken--;

    while (
      indexOfToken > -1 &&
      (Utility.isAlpha(str[indexOfToken]) || str[indexOfToken - 1] == "_") //log^ || log_^ || log_2^ || log_(22)^
    ) {
      result += str[indexOfToken];
      indexOfToken--;
    }
    return [...result].reverse().join("");
    //return "log_(10)";
  }

  static missingClosingPar(str) {
    let par = 0;
    for (let i = 0; i < str.length; i++) {
      const element = str[i];
      if (str[i] == "(") {
        par++;
      }
      if (str[i] == ")") {
        par--;
      }
    }
    if (par > 0) {
      return true;
    }
    return false;
  }

  static replaceLatex(result) {
    function getDivideOperand(exp, keyword, indexOfKeyword) {
      //get operand
      let operand = "";
      let lBracket = 0;
      for (let i = indexOfKeyword; i < exp.length; i++) {
        if (!lBracket && exp[i] == "(") {
          operand += "(";
          lBracket++;
          continue;
        }
        if (lBracket && exp[i] !== ")") {
          //operand += ")";
          operand += exp[i];
        }
        if (exp[i] == ")") {
          operand += ")";
          if (operand.indexOf("\\frac") !== -1) {
            if (exp[i + 1] && exp[i + 1] == "(") {
              continue;
            } else {
              operand = operand.replace("(", "");
              return operand;
            }
          }
          operand = operand.replace("(", "").replace(")", "");
          return operand;
        }
      }
      return null;
    }

    function purgeLatexFrac(str) {
      let index = str.indexOf("frac");
      if (index == -1) return str;

      while (index !== -1) {
        let operandsArr = str.replace(")(", ")@(").split("@");
        let operand1 = operandsArr[0].replace("frac", "");
        let operand2 = operandsArr[1];
        str = str.replace(
          `frac${operand1}${operand2}`,
          `${operand1}/${operand2}`
        );
        index = str.indexOf("frac");
      }
      return str;
    }

    //result = purgeLatexFrac(result);

    result = result
      .replaceAll("^{}", "")
      .replace(/\\operatorname{abs}/g, "abs")
      .replace(/{/g, "(")
      .replace(/}/g, ")")
      .replace(/\\operatorname{abs}/g, "abs")
      .replace(/\\left/g, "")
      .replace(/\\right/g, "")
      .replace(/\\cdot/g, "*")
      .replace(/\\lbrace/g, "{")
      .replace(/\\rbrace/g, "}")
      .replace(/\\sin/g, "sin")
      .replace(/\\cos/g, "cos")
      .replace(/\\tan/g, "tan")
      .replace(/\\cot/g, "cot")
      .replace(/\\csc/g, "csc")
      .replace(/\\sec/g, "sec")
      .replace(/\\log2/g, "log2")
      .replace(/\\ln/g, "ln")
      .replace(/\\pi/g, "pi")
      //.replace(/^(\\prime)/g, "'")
      .replaceAll("\\prime", "'")
      //.replace(/^(\\doubleprime)/g, "''")
      .replaceAll("\\doubleprime", "''")
      .replaceAll("')", "'")
      .replaceAll("('", "'")
      .replaceAll("^'", "'")
      .replace(/\\sqrt/g, "sqrt")
      .replaceAll("sin^(-1)", "asin") //\sin^{(-1)}
      .replaceAll("sin^((-1))", "asin")
      .replaceAll("cos^(-1)", "acos")
      .replaceAll("cos^((-1))", "acos")
      .replaceAll("tan^(-1)", "atan")
      .replaceAll("tan^((-1))", "atan")
      .replaceAll("cot^(-1)", "acot")
      .replaceAll("cot^((-1))", "acot")
      .replaceAll("sec^(-1)", "asec")
      .replaceAll("sec^((-1))", "asec")
      .replaceAll("csc^(-1)", "acsc")
      .replaceAll("csc^((-1))", "acsc")
      .replace(/\\sinh/g, "sinh")
      .replace(/\\cosh/g, "cosh")
      .replace(/\\tanh/g, "tanh")
      .replace(/\\coth/g, "coth")
      .replace(/\\csch/g, "csch")
      .replace(/\\sech/g, "sech")
      .replaceAll("sinh^(-1)", "asinh")
      .replaceAll("sinh^((-1))", "asinh")
      .replaceAll("cosh^(-1)", "acosh")
      .replaceAll("cosh^((-1))", "acosh")
      .replaceAll("tanh^(-1)", "atanh")
      .replaceAll("tanh^((-1))", "atanh")
      .replaceAll("coth^(-1)", "acoth")
      .replaceAll("coth^((-1))", "acoth")
      .replaceAll("csch^(-1)", "acsch")
      .replaceAll("csch^((-1))", "acsch")
      .replaceAll("sech^(-1)", "asech")
      .replaceAll("sech^((-1))", "asech")
      .replace(/\\log/g, "log")
      .replace(/\\abs/g, "abs")
      .replace(/\\times/g, "*")
      //.replaceAll("?", ")")
      .replace(/\\/g, "")
      .replace(/\s/g, "");

    result = purgeLatexFrac(result);

    return result;
  }

  static isValidNonAlphaChar(c) {
    const isValidNonAlphaChars = ["(", ")", "+", "*", "-", "/", "^"];
    return isValidNonAlphaChars.indexOf(c) != -1;
  }

  static indexOfFirstNonValidChar(str) {
    const isValidNonAlphaChar = ["(", ")", "+", "*", "-", "/"];
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (
        Utility.isAlpha(c) ||
        Utility.isDigit(c) ||
        Utility.isValidNonAlphaChar(c)
      ) {
        continue;
      }
      if (i < str.length - 2 && c == "." && Utility.isDigit(str[i + 1])) {
        continue;
      }
      return i;
    }
    return -1; //Invalid index
  }

  static toLatex(str) {
    let latexValue = str;
    try {
      let node = math.parse(str);
      latexValue = node.toTex({ parenthesis: "auto", implicit: "hide" });
    } catch (error) {
      //
    }
    return latexValue;
  }

  static mathjsErrorToPosition(errorStr) {
    let arr = errorStr.match(/(char \d+)/);
    if (arr) {
      return parseInt(arr[0].replace("char ", ""));
    }
    return -1;
  }

  static adjustExpForDecimalPlaces(exp, places) {
    let m_exp = exp;

    for (let i = 0; i < exp.length; i++) {
      let c = exp[i];
      let num = "";
      if (c == "." || Utility.isDigit(c)) {
        while (
          c == "." ||
          Utility.isDigit(c) ||
          (c == "e" && i > 0 && Utility.isDigit(exp[i - 1])) ||
          ((c == "-" || c == "+") && i > 0 && exp[i - 1] == "e")
        ) {
          num += c;
          i++;
          c = exp[i];
        }
        m_exp = m_exp.replace(num, Utility.adjustForDecimalPlaces(num, places));
      }
    }

    return m_exp;
  }

  static inverseRelationSamples(
    relationFn,
    lowerLimit,
    upperLimit,
    numOfPoints,
    variable,
    plot
  ) {
    let str = relationFn;
    const mf = $("#fnDlg_function")[0];
    let obj = Utility.getInverseDeclaration(str);
    let n = 0;
    let _index = 0;
    let decObjs = [];
    while (obj && obj.dec && obj.arg && n < 100) {
      let solution = null;

      decObjs.push(obj);

      if (solution) {
        obj = Utility.getInverseDeclaration(str, _index);
      } else {
        _index += str.indexOf(obj.dec) + 8;
        obj = Utility.getInverseDeclaration(str, _index);
      }
      n++;
    } //

    const xArr = math.range(
      lowerLimit,
      upperLimit,
      (upperLimit - lowerLimit) / numOfPoints,
      true
    );

    if (decObjs.length > 1) {
      let decStr = "";
      for (let i = 0; i < decObjs.length; i++) {
        decStr += decObjs[i].dec;
        if (i < decObjs.length - 1) {
          decStr += ", ";
        }
      }
      Utility.displayErrorMessage(
        mf,
        `Tried but failed to plot inverse relation. Cannot handle multiple inverse declaration, ${decStr}.`
      );
      return;
    }
    const { dec, arg } = decObjs[0];
    if (dec !== relationFn) {
      Utility.displayErrorMessage(
        mf,
        `Tried but failed to plot inverse relation. Found ${relationFn}. Expected ${dec}.`
      );
      return;
    }

    if (arg !== variable) {
      let _dec = dec.replace(arg, variable);
      Utility.displayErrorMessage(
        mf,
        `Tried but failed to plot inverse relation. Unable to resolve independent variable. Found ${relationFn}. Expected ${_dec}.`
      );
      return;
    }

    let m_defn = plot.defines.getDefine(
      dec.replace("^(-1)", "").replace(arg, variable)
    );
    //m_defn = m_defn.replaceAll(variable, `(${arg})`);
    const p = math.parse(m_defn);
    const scope = new Map();

    scope.set(variable, 1);

    try {
      p.evaluate(scope);
    } catch (error) {
      return null;
    }
    const samples = xArr._data.map((val) => {
      scope.set(variable, val);
      return new Misc.Point(p.evaluate(scope), val);
    });

    return samples;
  }

  static isLinear(exp, variable = "x", eps = 1e-6) {
    if (!exp || exp.indexOf(variable) == -1) return null;
    exp = nerdamer(exp).toString();
    // let deg_of_poly = parseFloat(
    //   math.simplify(nerdamer(`deg(${exp},${variable})`).toString())
    // );

    // if (deg_of_poly === 1) return exp;

    const xArr = math.range(-50, 50, 1, true);
    const p = math.parse(exp);
    const scope = new Map();
    scope.set(variable, 1);

    try {
      p.evaluate(scope);
    } catch (error) {
      return null;
    }

    const points = xArr.map((val) => {
      scope.set(variable, val);
      return { x: val, y: p.evaluate(scope) };
    });
    const data = points._data;
    const testSlope = Utility.slope(data[data.length - 1], data[0]);
    for (let i = 1; i < data.length; i++) {
      if (
        !Utility.mFuzzyCompare(
          Utility.slope(data[i - 1], data[i]),
          testSlope,
          eps
        )
      ) {
        return null;
      }
    }

    return Utility.linearEquationFromPoints(
      data[data.length - 1],
      data[0]
    ).replaceAll("x", variable);
  }

  static isValidCharInExpression(str) {
    if (!str) return 0;
    const mf = $("#fnDlg_function")[0];
    // let count = Utility.countString(str, "\\.");
    // if (count > 1) {
    //   return str.indexOf(".");
    // }
    let count = Utility.countString(str, "{");
    if (count > 1) {
      return str.indexOf("{");
    }
    if (count == 1 && str.indexOf(",") > str.indexOf("{")) {
      return str.indexOf(",");
    }
    count = Utility.countString(str, "}");
    if (count > 1) {
      return str.indexOf("}");
    }
    count = Utility.countString(str, "<=");
    if (count > 2) {
      return str.indexOf("<=");
    }
    count = Utility.countString(str, ",");
    let logCount = Utility.countString(str, "log");
    if (!Utility.isParametricFunction(str) && count != logCount) {
      return str.indexOf(",");
    }
    str = str.replaceAll(" ", "");
    let comma = 0;
    let openCurly = 0;
    let closedCurly = 0;

    if (str)
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (
          c == "'" ||
          c == "+" ||
          c == "-" ||
          c == "*" ||
          c == "/" ||
          c == "^" ||
          c == "=" ||
          c == "," ||
          c == "(" ||
          c == ")" ||
          c == "{" ||
          c == "}" ||
          c == "." ||
          c == "<" ||
          Utility.isAlpha(c) ||
          Utility.isDigit(c)
        ) {
          if (c == ",") {
            comma++;
          }
          if (c == "{") {
            openCurly++;
          }
          if (c == "}") {
            closedCurly++;
          }
          if (c == "." && i >= str.length - 1 && !Utility.isDigit(str[i + 1])) {
            return i;
          }

          if (comma > 1) {
            return i;
          }
          if (openCurly > 1) {
            return i;
          }
          if (closedCurly > 1) {
            return i;
          }
          continue;
        } else {
          return i;
        }
      }

    return -1;
  }

  static isValidExpression(exp, variable = "x") {
    if (!exp || exp.length == 0) {
      return false;
    }
    if (exp.indexOf("=") !== -1) {
      throw new Error(
        "Expected an expression as first argument. Got an equation."
      );
    }
    if (nerdamer.deg(exp, variable).toString() > 3) {
      return false;
    }
    if (nerdamer.deg(exp, "y").toString() > 3) {
      return false;
    }
    return true;
  }

  static adjustLatexLogBaseDecimalPlaces(decimalPlaces) {
    Utility.logLatex = math.log.toTex;

    math.log.toTex = function (node, options) {
      node.traverse(function (node, path, parent) {
        //console.log(node, path, parent); //args[1]
        if (node.type === "ConstantNode" && path === "args[1]") {
          node.value = math.round(node.value, math.min(15, decimalPlaces));
        }
        return node;
      });
      return `\\mathrm{log_{${node.args[1]}}}\\left(${node.args[0]}\\right)`;
    };
  }

  static restoreLatexLogBaseDecimalPlaces() {
    math.log.toTex = Utility.logLatex;
  }

  static extendGetValue(mf) {
    try {
      //Alow custom functions.
      const customFunctions = {
        log_: function (a, b) {
          return math.log(b, a);
        },
      };
      math.import(customFunctions);
    } catch (error) {}

    /* 
      Helper functions    */

    function exponentOnKeyword(result) {
      result = result.replaceAll("#", "~");
      let index = result.indexOf("^");
      let bracketAdded = false;
      while (index !== -1) {
        const prefix = Utility.getExponentTokenPrefix(result, index);

        let obj = Utility.getOperandOfExponentToken(result, index);
        if (obj.operand.length > 1 && obj.operand[0] !== "(") {
          result = result.replace(
            `${prefix}^${obj.operand[0]}`,
            `(${prefix}^${obj.operand[0]})`
          );
          bracketAdded = true;
        }
        if (Static.trigKeywords.indexOf(prefix) !== -1) {
          if (obj.operand == "-1" || obj.operand == "(-1)") {
            if (prefix[0] == "a") {
              result = result.replace(`${prefix}`, `${prefix.substring(1)}`);
            } else {
              result = result.replace(`${prefix}`, `a${prefix}`);
            }
            result = result.replace(`^${obj.operand}`, "");
          } else {
            result = result.replace(`${prefix}^${obj.operand}`, `${prefix}^`);
            const oprnd = Utility.getOperand(
              result,
              prefix + "^",
              result.indexOf(prefix + "^")
            );
            result = result.replace(
              `${prefix}^${oprnd.operand}`,
              `(${prefix}${oprnd.operand})#${obj.operand}` //
            );
          }
        }
        if (obj.unmodifiedOperand) {
          result = result.replace(obj.unmodifiedOperand, obj.operand);
        }
        const operandOfExponent = obj.operand;

        if (prefix.indexOf("pi") === -1) {
          obj = Utility.getOperand(
            result,
            prefix + "^" + operandOfExponent,
            index - prefix.length + 1
          );
          if (!obj) {
            Static.errorMessage = `Failed to determine operand for "^". Please check.`;
            return null;
          }
        } else {
          // obj = Utility.getOperand(result, "^", index);
          // if (obj.unmodifiedOperand) {
          //   result = result.replace(obj.unmodifiedOperand, obj.operand);
          // }
          index = result.indexOf("^", index + 1);
          continue;
        }
        let operand = obj.operand;

        if (prefix.length > 1 && Static.keywords.indexOf(prefix) !== -1) {
          const strToReplace = `${prefix}^${operandOfExponent}${operand}`;
          const replacementStr = `${prefix}${operand}^(${operandOfExponent})`;
          result = result.replace(strToReplace, replacementStr);
          index = result.indexOf(
            "^" /* ,
            result.indexOf(operand, index) + operand.length + 2 */
          );
        } else {
          if (bracketAdded) {
            index = result.indexOf("^", index + 2);
          } else {
            index = result.indexOf("^", index + 1);
          }
          bracketAdded = false;
        }
        //result = result.replace("^", "#");
      }
      result = result.replaceAll("#", "^");
      result = result.replaceAll("~", "#");
      return result;
    }

    //////////////////////////////////////////////////////

    mf.getValueTemp = mf.getValue;

    mf.getValue = function (format = "ascii-math") {
      let latex = mf.getValueTemp("latex");
      //latex = latex.replaceAll("{}}", "");
      //Handle \frac start
      let index = latex.indexOf("\\frac");
      while (index !== -1) {
        if (latex[index + 5] !== "{") {
          latex = latex.insert(index + 7, "\\cdot ");
          index = latex.indexOf("\\frac", index + 12);
        } else {
          index = latex.indexOf("}{", index);
          index = latex.indexOf("}", index + 2);
          latex = latex.insert(index + 1, "\\cdot ");
          index = latex.indexOf("\\frac", index + 5);
        }
      } //}\cdot \{0\le
      latex = latex.trim().replaceAll("  ", " ");

      latex = latex
        .replaceAll("\\cdot \\{", " \\{")
        .replaceAll("\\cdot\\{", "\\{");
      latex = latex.replaceAll("\\cdot }", " }");
      latex = latex.replaceAll("\\cdot \\cdot ", "\\cdot ");
      latex = latex.replaceAll("\\cdot \\cdot", "\\cdot ");
      latex = latex.replaceAll("\\cdot \\right", "\\right");
      index = latex.lastIndexOf("\\cdot ");
      if (index !== -1) {
        if (latex.length - 1 - 5 == index) {
          latex = latex.substring(0, latex.lastIndexOf("\\cdot "));
        }
      }
      latex = latex.replaceAll("\\frac", "\\cdot \\frac");
      if (latex.indexOf("\\cdot") == 0) {
        latex = latex.replace("\\cdot", "");
      }

      latex = latex.replaceAll("\\cdot\\cdot ", "\\cdot ");
      latex = latex.replaceAll("\\left(\\cdot ", "\\left(");
      latex = latex.replaceAll("+\\cdot", "+").replaceAll("\\cdot +", "+");
      latex = latex.replaceAll("-\\cdot", "-").replaceAll("\\cdot -", "-");
      latex = latex.replaceAll("{\\cdot", "{");
      latex = latex.replaceAll("=\\cdot", "=");
      // if (latex.indexOf("\\cdot") == 0) {
      //   latex = latex.replace("\\cdot", "");
      // }
      //latex = latex.replaceAll(" ", "");
      //Handle \frac end

      //x^2\{ \frac{a}{4}\cdot \le x\le\cdot \frac{a}{2}\cdot \}
      latex = latex
        .replaceAll("\\cdot \\le", "\\le")
        .replaceAll("\\le\\cdot", "\\le")
        .replaceAll("\\cdot \\}", "\\}");

      let result = latex
        .replace(/\\times/g, "\\cdot")
        .replaceAll("\\prime", "primePlaceHolder")
        //.replaceAll("{\\prime}", "primePlaceHolder")
        .replaceAll("{primePlaceHolder}", "primePlaceHolder")
        .replaceAll("{\\doubleprime}", "doublePrimePlaceHolder")
        // .replaceAll(
        //   "primePlaceHolderprimePlaceHolder",
        //   "doublePrimePlaceHolder"
        // )
        .replace(/\\cdot/g, " cdotPlaceHolder ");

      // while(result.idexOf("primePlaceHolderprimePlaceHolder")!==-1){
      //   result = result.replace()
      // }

      mf.value = result;

      result = mf.getValueTemp(format);
      mf.latexValue = latex;

      // const matches1 = result.match(
      //   /(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)(?=mod)|.(?=mod))/
      // );
      // const matches2 = result.match(
      //   /((?<=mod)\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)|(?<=mod).)/
      // );

      // if (matches1) {
      //   matches1.forEach(function (oprnd1, i) {
      //     result = result.replace(
      //       `${matches1[i]}mod${matches2[i]}`,
      //       `mod(${matches1[i]},${matches2[i]})`
      //     );
      //   });
      // }

      result = result.replaceAll("primePlaceHolder", "'");
      result = result.replaceAll("doublePrimePlaceHolder", "''");
      result = result.replaceAll("('", "'");
      result = result.replaceAll("')", "'");
      result = result.replaceAll("^'", "'");
      result = result.replaceAll("cdotPlaceHolder", "*");

      result = result
        .replace(/\s/g, "")
        .replace(/\\operatorname{abs}/g, "abs")
        .replace(/\\lbrace/g, "{")
        .replace(/\\rbrace/g, "}");

      //console.log(457, result);

      //console.log(456, result);

      if (Utility.missingClosingPar(result)) {
        result = result.replace(/\?/g, ")");
      }

      //console.log(result);
      //result = exponentOnKeyword(result);
      result = Utility.parametizeKeywordArg(result);

      result = exponentOnKeyword(result);

      index = result.indexOf("log");
      if (index !== -1) {
        while (index !== -1 && result[index + 3] !== "_") {
          result = result.replace("log", "#_(10)");
          index = result.indexOf("log", index + 7);
        }
        result = result.replaceAll("#", "log");

        index = result.indexOf("log_(");
        while (index !== -1) {
          const n = result.indexOf(")", index);
          const base = Utility.getLogBase(result, index); //log_12(8)
          const obj = Utility.getOperand(result, `log_${base}`, index);
          if (!obj) {
            Static.errorMessage = `Failed to determine operand for "log_${base}". Please check.`;
            return null;
          }
          if (obj.unmodifiedOperand) {
            result = result.replace(obj.unmodifiedOperand, obj.operand);
          }
          let operand = obj.operand;
          result = result.replace(
            `log_${base}${operand}`,
            `log(${operand},${base})`
          );
          index = result.indexOf("log_(");
        }

        index = result.indexOf("log_");
        while (index !== -1) {
          const base = result[index + 4];
          const obj = Utility.getOperand(result, `log_${base}`, index);
          if (!obj) {
            Static.errorMessage = `Failed to determine operand for "log_${base}". Please check.`;
            return null;
          }
          if (obj.unmodifiedOperand) {
            result = result.replace(obj.unmodifiedOperand, obj.operand);
          }
          let operand = obj.operand;

          result = result.replace(
            `log_${base}${operand}`,
            `log(${operand},${base})`
          );
          index = result.indexOf("log_");
        }
      }

      index = result.indexOf("ln");
      while (index !== -1) {
        const obj = Utility.getOperand(result, `ln`, index);
        if (!obj) {
          Static.errorMessage = `Failed to determine operand for "ln". Please check.`;
          return null;
        }
        if (obj.unmodifiedOperand) {
          result = result.replace(obj.unmodifiedOperand, obj.operand);
        }
        let operand = obj.operand;
        result = result.replace(`ln${operand}`, `log(${operand})`);
        index = result.indexOf("ln");
      }

      // result = result.replaceAll("ln", "log");

      //Add whitespace delimiters to mod (i.e modulus ooperator)
      result = result.replaceAll("mod", "%");
      //.replaceAll("=*", "=");

      //console.log(result);

      mf.value = latex;

      index = result.indexOf("|");
      let m = 0;
      while (index !== -1) {
        if (m == 0 || m % 2 == 0) {
          result = result.replace("|", "abs(");
        } else {
          result = result.replace("|", ")");
        }
        m++;
        index = result.indexOf("|");
      }

      // result = Utility.parametizeKeywordArg(result);

      return result;
    };
  }

  static parametizeKeywordArg(str) {
    if (!str || $.isNumeric(str) || str.length < 4) {
      return str;
    }
    const arr = Static.trigKeywords;

    let purgeStr = Utility.purgeAndMarkKeywords(str, true);
    //purgeStr = purgeStr.replaceAll("%e%", "e");

    let result = "";
    let delimiter = 0;
    let unbalance = false;
    for (let i = 0; i < purgeStr.length; i++) {
      let c = purgeStr[i];
      result += c;
      if (c == "%") {
        delimiter++;
        if (delimiter == 2) {
          delimiter = 0;
          if (purgeStr[i + 1] === "^") {
            i++;
            result += "^";
            i++;
            let bracket = 0;
            if (purgeStr[i] === "(") {
              //bracket++;
              // result += "(";
              // i++;
              let itr = 0;
              while (itr < 100) {
                itr++;
                const c = purgeStr[i];
                if (c === "(") {
                  bracket++;
                }
                if (c === ")") {
                  bracket--;
                }
                result += c;
                i++;
                if (bracket == 0) {
                  break;
                }
              }
            } else {
              result += purgeStr[i];
              i++;
            }
            i--;
          }
          if (purgeStr[i + 1] !== "(") {
            result += "(";
            unbalance = true;
            i++;
            for (i; i < purgeStr.length; i++) {
              c = purgeStr[i];
              if (
                c == "=" ||
                c == "+" ||
                c == "-" ||
                c == "{" ||
                c == "," /*  || purgeStr[i - 1] === "^" */
              ) {
                result += ")";
                result += c;
                unbalance = false;
                break;
              }
              result += purgeStr[i];
            }
            if (unbalance) {
              unbalance = false;
              result += ")";
            }
          }
        }
      }
    }
    result = Utility.replaceKeywordMarkers(result);

    result = result.replaceAll("()", "");

    return result;
  }

  static parametricTex(_curve, fnStr) {
    if (!fnStr) return null;
    // let precisionY = _curve.plot().axisPrecision(_curve.yAxis());
    // let precisionX = _curve.plot().axisPrecision(_curve.xAxis());
    // let decimalPlacesY = _curve.plot().axisDecimalPlaces(_curve.yAxis());
    let decimalPlacesX = _curve.plot().axisDecimalPlaces(_curve.xAxis());

    fnStr = fnStr.replaceAll(" ", "");

    let parametricArr = [];
    let parametricObj = Utility.splitParametricFunction(fnStr);
    if (!parametricObj) {
      parametricArr.push(fnStr);
    } else {
      parametricArr.push(parametricObj.operand);
      parametricArr.push(parametricObj.base);
    }

    let m_fnConcat = "";

    for (let i = 0; i < parametricArr.length; i++) {
      let fnStr = parametricArr[i];

      //Replace the whitespace delimiters stripped out by simplify()
      fnStr = fnStr.replaceAll("mod", " mod ");

      let m_fn = "";
      if (_curve.rtti == PlotItem.RttiValues.Rtti_PlotMarker) {
        m_fn = fnStr;
      } else {
        Utility.adjustLatexLogBaseDecimalPlaces(decimalPlacesX);
        fnStr = fnStr.replaceAll("+-", "-").replaceAll("-+", "-");

        m_fn = math
          .simplify(fnStr, {}, { exactFractions: false })
          .toTex({ parenthesis: "auto", implicit: "hide" });

        //.simplify(fnStr, {}, { exactFractions: false })
        Utility.restoreLatexLogBaseDecimalPlaces();
      }

      let ind = m_fn.indexOf("log(");
      while (ind !== -1) {
        let operand = Utility.getOperand(m_fn, "log", ind).operand;
        const obj = Utility.splitParametricFunction(operand);
        m_fn = m_fn.replace(
          `log${operand}`,
          `\\mathrm{log_{${obj.base}}}\\left(${obj.operand}\\right)`
        );
        ind = m_fn.indexOf("log(");
      }

      if (parametricArr.length > 1) {
        if (i == 0) {
          m_fnConcat += "(";
          m_fnConcat += m_fn;
          m_fnConcat += ",";
        } else {
          m_fnConcat += m_fn;
          m_fnConcat += ")";
        }
      } else {
        m_fnConcat += m_fn;
      }
    }
    return m_fnConcat;
  }

  static displayErrorMessage(mf, errorMessage) {
    if (errorMessage) {
      Utility.toolTip = $(mf).attr("data-original-title");
      mf.applyStyle({ backgroundColor: "red" }, { range: [-1, 0] });
      $(mf).addClass("red-tooltip").attr("data-original-title", errorMessage);
    } else {
      $(mf).tooltip("hide");
      $(mf).attr("data-original-title", Utility.toolTip);
      $(mf).removeClass("red-tooltip");
    }
  }

  static tex2svgMultiline(
    latex,
    lengthHint = 24,
    options = { em: 16, ex: 6, display: false }
  ) {
    //////Helpers//////////
    const mj = function (tex) {
      return MathJax.tex2svg(tex, options);
    };

    const indexBetweenCurly = function (str, index) {
      const m_substring = str.substring(0, index);
      const matchOpenCurly = m_substring.match(/{/g);
      const matchCloseCurly = m_substring.match(/}/g);
      if (matchOpenCurly == null && matchCloseCurly == null) {
        return false;
      }
      if (matchOpenCurly && matchCloseCurly == null) {
        return true;
      }
      if (matchOpenCurly == null && matchCloseCurly) {
        return true;
      }
      if (matchOpenCurly.length !== matchCloseCurly.length) {
        return true;
      }
      return false;
    };

    const indexBetweenParenthis = function (str, index) {
      const m_substring = str.substring(0, index);
      const matchOpenCurly = m_substring.match(/\(/g);
      const matchCloseCurly = m_substring.match(/\)/g);
      if (matchOpenCurly == null && matchCloseCurly == null) {
        return false;
      }
      if (matchOpenCurly && matchCloseCurly == null) {
        return true;
      }
      if (matchOpenCurly == null && matchCloseCurly) {
        return true;
      }
      if (matchOpenCurly.length !== matchCloseCurly.length) {
        return true;
      }
      return false;
    };

    const indexBetweenBracket = function (str, index) {
      if (!indexBetweenCurly(str, index)) {
        return indexBetweenParenthis(str, index);
      }
      return true;
    };

    //console.log(indexBetweenCurly("45+{{x-3}+25}+{}", 13));

    ////////////////////////////////

    if (latex.length <= lengthHint) {
      return mj(latex, options);
    }

    let substringsArr = [];

    let lag = latex;
    let indexOfPlus = lag.indexOf("+");
    let indexOfMinus = lag.indexOf("-");

    while (indexOfPlus > -1 || indexOfMinus > -1) {
      if (indexOfPlus > -1 && !indexBetweenBracket(lag, indexOfPlus)) {
        let lead = lag.substring(0, indexOfPlus);
        substringsArr.push(lead);
        lag = lag.substring(indexOfPlus);
        indexOfPlus = lag.indexOf("+", 1);
        indexOfMinus = lag.indexOf("-", 1);
        continue;
      } else if (indexOfMinus > -1 && !indexBetweenBracket(lag, indexOfMinus)) {
        let lead = lag.substring(0, indexOfMinus);
        substringsArr.push(lead);
        lag = lag.substring(indexOfMinus);
        indexOfPlus = lag.indexOf("+", 1);
        indexOfMinus = lag.indexOf("-", 1);
        continue;
      }
      if (indexOfPlus !== -1) indexOfPlus = lag.indexOf("+", indexOfPlus + 1);
      if (indexOfMinus !== -1)
        indexOfMinus = lag.indexOf("-", indexOfMinus + 1);
    }
    if (lag.length) {
      substringsArr.push(lag);
    }

    let m_substringsArr = [];
    let s = substringsArr[0];
    for (let i = 1; i < substringsArr.length; i++) {
      if ((s + substringsArr[i]).length < lengthHint) {
        s += substringsArr[i];
        continue;
      }
      m_substringsArr.push(s);
      s = substringsArr[i];
    }
    m_substringsArr.push(s);

    //let tooltipParts1_arr = tooltipParts1.split("#");
    let child = mj(m_substringsArr[0]);
    //let childInnerHtml = "";
    for (let i = 1; i < m_substringsArr.length; i++) {
      const element = m_substringsArr[i];
      child.innerHTML = child.innerHTML + `<br>` + mj(element).innerHTML;
    }
    return child;
  }

  /////////////////////////////////////////////////////////////
  /*static loggerSetup() {
    var stepper = (function () {
      "use strict";
      var core = nerdamer.getCore(),
        _ = core.PARSER,
        //the container for the function steps
        stepper = {},
        //nerdamer makes recursive calls when adding, subtracting, etc. Making
        //sure the stack is clear ensures that we're at the first call
        stack = [];
      //a function to add calls to the stack
      var wrapper = function (f, a, b) {
        stack.push("lock");
        var r = f(a, b);
        stack.pop();
        return r;
      };
      //This logging function makes sure that there aren't any items on the stack
      //before logging
      var logger = function () {
        if (stack.length === 0 && typeof this === "function")
          this.apply(undefined, arguments);
      };

      var expression = null;

      //the semi-globals
      var add, subtract, divide, multiply, pow, fcall;

      var load = function () {
        //ADD
        add = _.add;
        var step_add = function (a, b) {
          var result;
          logger.call(stepper.pre_add, a, b);
          var wrapper_result = wrapper(
            function (a, b) {
              result = add.call(_, a.clone(), b.clone());
              return result;
            },
            a,
            b
          );
          logger.call(stepper.post_add, result, a, b);
          return wrapper_result;
        };
        _.add = step_add;
        //SUBTRACT
        subtract = _.subtract;
        var step_subtract = function (a, b) {
          var result;
          logger.call(stepper.pre_subtract, a, b);
          var wrapper_result = wrapper(
            function (a, b) {
              result = subtract.call(_, a.clone(), b.clone());
              return result;
            },
            a,
            b
          );
          logger.call(stepper.post_subtract, result, a, b);
          return wrapper_result;
        };
        _.subtract = step_subtract;
        //DIVIDE
        divide = _.divide;
        var step_divide = function (a, b) {
          var result;
          logger.call(stepper.pre_divide, a, b);
          var wrapper_result = wrapper(
            function (a, b) {
              result = divide.call(_, a.clone(), b.clone());
              return result;
            },
            a,
            b
          );
          logger.call(stepper.post_divide, result, a, b);
          return wrapper_result;
        };
        _.divide = step_divide;
        //MULTIPLY
        multiply = _.multiply;
        var step_multiply = function (a, b) {
          var result;
          logger.call(stepper.pre_multiply, a, b);
          var wrapper_result = wrapper(
            function (a, b) {
              result = multiply.call(_, a.clone(), b.clone());
              return result;
            },
            a,
            b
          );
          logger.call(stepper.post_multiply, result, a, b);
          return wrapper_result;
        };
        _.multiply = step_multiply;
        //POW
        pow = _.pow;
        var step_pow = function (a, b) {
          var result;
          logger.call(stepper.pre_pow, a, b);
          var wrapper_result = wrapper(
            function (a, b) {
              result = pow.call(_, a.clone(), b.clone());
              return result;
            },
            a,
            b
          );
          logger.call(stepper.post_pow, result, a, b);
          return wrapper_result;
        };
        _.pow = step_pow;
        //CALLFUNCTION
        //function calls are not recursive and can have more than one call on the stack
        //because of this we don't use the wrapper
        fcall = _.callfunction;
        var step_fcall = function (fname, args) {
          if (
            stepper.pre_function_call &&
            typeof stepper.pre_function_call === "function"
          )
            stepper.pre_function_call.call(undefined, fname, args);
          var f = fcall.call(_, fname, args);
          if (
            stepper.post_function_call &&
            typeof stepper.post_function_call === "function"
          )
            stepper.post_function_call.call(undefined, f, fname, args);
          return f;
        };
        _.callfunction = step_fcall;
      };

      //load(); //fire away

      var xport = function (o, override) {
        for (var x in o) {
          if (!stepper[x] || (stepper[x] && override)) stepper[x] = o[x];
        }
      };

      xport.unload = function () {
        _.add = add;
        _.subtract = subtract;
        _.multiply = multiply;
        _.divide = divide;
        _.pow = pow;
        _.callfunction = fcall;
      };

      function write(str) {
        console.log(str);
      }

      var rmBrackets = Utility.removeUnwantedParentheses;

      function reWriteExpression(expression) {
        let _expression = nerdamer(`sort(${expression})`).toString();
        if (_expression[0] !== "[") {
          //simplified expression returned
          return { exp: _expression, change: "simplified" };
        }

        _expression = _expression
          .replace("[", "")
          .replace("]", "")
          .replace(/,/g, "+");

        let test = math.simplify(`${_expression} - ${expression}`).toString();
        //Replace the whitespace delimiters stripped out by simplify()
        test = test.replaceAll("mod", " mod ");
        if (test !== "0" && test !== "+0" && test !== "-0") {
          return { exp: expression, change: "unchanged" };
        }

        if (math.compareText(_expression, expression) !== 0) {
          return { exp: _expression, change: "rearranged" };
        }

        return { exp: expression, change: "unchanged" };
      }

      var updateExp = function (oper, result, a, b = null) {
        //result = result.toString();
        if (oper == "+") {
          expression = expression.replace(`${a}+${b}`, result + "");
        }
        if (oper == "-") {
          expression = expression.replace(`${a}-${b}`, result + "");
        }
        if (oper == "*") {
          expression = expression.replace(`${a}*${b}`, result + "");
        }
        if (oper == "/") {
          expression = expression.replace(`${a}/${b}`, result + "");
        }
      };

      // var findInExpression = function (s) {
      //   const str = s.toString();
      //   if (expression.indexOf(str) !== -1) {
      //     return str;
      //   }

      //   return null;
      // };

      xport.log = function (_exp, type = "Simplify") {
        const expEqu = type === "Simplify" ? "expression" : "equation";
        write(`${type} ${expEqu} "${_exp}"\n`);
        _exp = _exp.replaceAll(" ", "");
        //const e = reWriteExpression(rmBrackets(exp));
        const { exp, change } = reWriteExpression(_exp);
        if (change === "simplified") {
          write(`Simplifying:-\n\tWe get: ${exp}\n`);
        } else if (change === "rearranged") {
          write(`Re-writing the equation.\n\tWe get: ${exp}\n`);
        } else {
          write(`No simplification:-\n\tWe get: ${exp}\n`);
        }

        expression = exp;

        load();
        nerdamer(expression);
        xport.unload();
      };

      xport.clear = function () {
        stepper = {};
      };

      xport.load = load;

      xport.exp = function () {
        return expression;
      };

      xport.write = write;

      xport.expression = expression;
      xport.updateExp = updateExp;

      return xport;
    })();

    stepper({
      pre_add: function (a, b) {
        //console.log("Adding " + a + " to " + b);
      },
      pre_subtract: function (a, b) {
        //console.log("Subtracting " + b + " from " + a);
      },
      pre_multiply: function (a, b) {
        //console.log("Multiplying " + a + " by " + b);
      },
      pre_divide: function (a, b) {
        //console.log("Dividing " + a + " by " + b);
      },
      pre_pow: function (a, b) {
        //console.log("Raising " + a + " to the power of " + b);
      },
      pre_function_call: function (fname, args) {
        console.log(
          "The function " + fname + " was called with arguments " + args
        );
      },
      post_function_call: function (f) {
        console.log("Afterwards this resulted in " + f + "\n");
      },
      post_add: function (result, a, b) {
        stepper.updateExp("+", result, a, b);
        stepper.write(`Adding ${a} to ${b}:\n\tWe get: ${stepper.exp()}`);
      },
      post_subtract: function (result, a, b) {
        stepper.updateExp("-", result, a, b);
        stepper.write(
          `Subtracting ${b} from ${a}:\n\tWe get: ${stepper.exp()}`
        );
      },
      post_multiply: function (result, a, b) {
        stepper.updateExp("*", result, a, b);
        stepper.write(`Multiplying ${a} by ${b}:\n\tWe get: ${stepper.exp()}`);
      },
      post_divide: function (result, a, b) {
        stepper.updateExp("/", result, a, b);
        stepper.write(`Dividing ${a} by ${b}:\n\tWe get: ${stepper.exp()}`);
        // console.log(
        //   "The result of dividing " + a + " by " + b + " was " + result + "\n"
        // );
      },
      post_pow: function (result, a, b) {
        console.log(
          "The result of raising " +
            a +
            " to the powe rof " +
            b +
            " was " +
            result +
            "\n"
        );
      },
    });

    return stepper;
  }*/

  ////////////////////////////////////////////////////////////////
}
Utility.promptErrorMsg = "";
Utility.promptProgress = false;
Utility.adjustDomain = 0;
Utility.warn = 1;
Utility.warnIgnore = 2;
Utility.silentIgnore = 3;
Utility.errorResponseChanged = false;
//Utility.errorResponse = Utility.adjustDomain;
Utility.errorResponse = Utility.silentIgnore;
Utility.keywordMarkers = [];

Utility.mode = "deg";

Utility.stepsData = null;

Utility.progressSpinner2 = $(
  '<img id="imageLoader" class="loader" style= "display:none; z-index:100000; width:40px;height:40px; position: absolute;" src="images/imageLoader.png">'
);
Utility.progressSpinnerInit = false;
