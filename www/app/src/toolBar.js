"include []";
"use strict";
class ToolBar {
  constructor(obj, plotDiv) {
    var self = this;
    self.tbarHeight = 0;
    var buttonList = [];
    obj = obj || {};
    function defaultCb() {
      console.log("No callback defined for button");
    }
    var tbDiv = $(
      '<div id="toolBar1" class="noprint" style="border-radius:8px; margin-left:5px; margin-right:5px; position:relative; border-style: ridge; background-color: lightBlue"></div>'
    );
    if (obj.zIndex !== undefined) tbDiv.css("zIndex", obj.zIndex);
    tbDiv.insertBefore(plotDiv);
    //tbDiv[0].parent = plotDiv.parent()[0];
    //plotDiv.removeClass("noToolBar")
    //plotDiv.addClass("toolBar")
    //tbDiv.addClass("no-print")

    //Helper that gets a integer id from element's innerText.
    function buttonTextAttribToId(text) {
      for (let i = 0; i < buttonList.length; ++i) {
        if (buttonList[i].attr("buttonText") == text) {
          return i;
        }
      }
      return -1; //invalid ID
    }

    var addToggleSwitch = function (obj) {
      // style="margin-left:30px"
      var option = obj.label || "Option 1";
      var checked = "";
      if (obj.checked) checked = "checked";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      var chkbox = $(
        '<label data-toggle="tooltip" class="checkbox-inline switch">\
                                    <input id=' +
          obj.innerHtmlId +
          '  type="checkbox" value="" ' +
          checked +
          '>\
                                    <span class="slider round" style="width:48px"></span>\
                                    <span style="margin-left:30px">' +
          option +
          "</span>\
                                  </label>"
      );
      chkbox.css("marginLeft", obj.marginLeft || 4);
      chkbox.css("marginRight", obj.marginRight || 2);
      tbDiv.append(chkbox);
      // chkbox.css("width", "48px");
      chkbox.attr("title", obj.tooltip);
      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      $("#" + obj.innerHtmlId).on("change", function () {
        _cb($(this)[0].checked);
      });
      buttonList.push(chkbox);
      return buttonList.length - 1;
    };

    var addPushbutton = function (obj) {
      obj.text = obj.text; /* || "Button"*/
      obj.class = obj.class || "btn btn-primary";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      obj.duration = obj.duration || 40;
      var b = $(
        "<button id=" +
          obj.innerHtmlId +
          ' type="button" data-toggle="tooltip">'
      );
      b.addClass(obj.class);
      if (obj.icon !== undefined) {
        if (obj.text !== undefined && obj.text.length) b.text(obj.text + " ");
        var img = $("<img src=" + obj.icon + ' alt="Img" width=18px>');
        b.append(img);
      } else {
        b.text(obj.text);
      }

      //We store the unmodified text on the buttonText attribute. The text may be modified by adding spaces
      //or by locale translation.
      b.attr("buttonText", obj.text);

      tbDiv.append(b);

      b.css("zIndex", tbDiv.css("zIndex"));

      b.attr("title", obj.tooltip);
      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      var clickEvent = "click";
      var mousedownEvent = "mousedown";
      var mouseupEvent = "mouseup";
      if (Static.isMobile()) {
        clickEvent = "tap";
        mousedownEvent = "touchstart";
        mouseupEvent = "touchend";
      }

      if (obj.repeat) {
        b.interval = null;
        b.bind(mousedownEvent, function (e) {
          //console.log(mousedownEvent)
          if (mousedownEvent == "mousedown") {
            if (e.button != 0) {
              return;
            }
          }
          b.interval = setInterval(_cb, obj.duration);
        });
        /* $(window) */ b.bind(mouseupEvent + " mouseleave", function () {
          clearInterval(b.interval);
          //console.log(444)
        });
        // b.mouseup(function(){
        //             clearInterval(b.interval)
        //         });
      } else {
        b.bind(clickEvent, _cb);
      }
      buttonList.push(b);

      return buttonList.length - 1;
    };

    this.html = function () {
      return tbDiv;
    };

    this.disable = function (identifier) {
      if (typeof identifier == "string")
        identifier = buttonTextAttribToId(identifier);
      buttonList[identifier].attr("disabled", true);
    };

    this.enable = function (identifier) {
      if (typeof identifier == "string")
        identifier = buttonTextAttribToId(identifier);
      buttonList[identifier].attr("disabled", false);
    };

    this.hide = function (identifier) {
      if (typeof identifier == "string")
        identifier = buttonTextAttribToId(identifier);
      if (identifier == undefined) identifier = -1;
      if (identifier > -1 && identifier < buttonList.length) {
        buttonList[identifier].hide();
      } else {
        tbDiv.hide();
        //plotDiv.removeClass("toolBar")
        //plotDiv.addClass("noToolBar")
      }
      if (obj.refreshCb) refreshCb();
    };
    this.show = function (identifier) {
      if (typeof identifier == "string")
        identifier = buttonTextAttribToId(identifier);
      if (identifier == undefined) identifier = -1;
      if (identifier > -1 && identifier < buttonList.length) {
        buttonList[identifier].show();
      } else {
        tbDiv.show();
        //plotDiv.removeClass("noToolBar")
        //plotDiv.addClass("toolBar")
      }
      if (obj.refreshCb) refreshCb();
    };

    var addCheckbox = function (obj) {
      var option = obj.label || "Option 1";
      var checked = "";
      if (obj.checked) checked = "checked";

      obj.tooltip = obj.tooltip || "";

      const indexOfAmpersand = option.indexOf("&");
      if (indexOfAmpersand !== -1) {
        obj.ampersandNizeChar = option[indexOfAmpersand + 1].toUpperCase();
        option = option.replace("&", "");

        obj.tooltip = obj.tooltip + "\tAlt " + obj.ampersandNizeChar;

        $("body").on("keydown", function (event) {
          const keyCode = event.keyCode ? event.keyCode : event.which;
          if (
            event.altKey &&
            String.fromCharCode(keyCode) == obj.ampersandNizeChar
          ) {
            //event.preventDefault();
            $("#" + obj.innerHtmlId).click();
          }
        });
      }

      obj.innerHtmlId = obj.innerHtmlId || option + "elem_" + buttonList.length;
      var chkbox = $(
        '<label data-toggle="tooltip" class="checkbox-inline">\
                                    <input id=' +
          obj.innerHtmlId +
          '  type="checkbox" value="" ' +
          checked +
          ">" +
          option +
          "\
                                  </label>"
      );
      chkbox.css("marginLeft", obj.marginLeft || 8);
      chkbox.css("marginRight", obj.marginRight || 8);
      tbDiv.append(chkbox);

      if (obj.disabled) {
        $("#" + obj.innerHtmlId).attr("disabled", true);
      }

      chkbox.attr("title", obj.tooltip);
      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      $("#" + obj.innerHtmlId).click(function () {
        _cb($(this).is(":checked"));
      });
      buttonList.push($("#" + obj.innerHtmlId));
      return buttonList.length - 1;
    };

    var addSlider = function (obj) {
      var option = obj.label || "Option 1";
      var min = "";
      if (obj.min !== undefined) min = " min=" + '"' + obj.min + '"';
      var max = "";
      if (obj.max !== undefined) max = " max=" + '"' + obj.max + '"';
      var value = "";
      if (obj.value !== undefined) value = " value=" + obj.value + " ";
      var width = " width:" + 100 + "px ";
      if (obj.width !== undefined) width = " width:" + obj.width + "px ";
      //console.log(value)
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      var sliderCntrl = $(
        '<input style="position:absolute; ' +
          width +
          '" id=' +
          obj.innerHtmlId +
          " " +
          value +
          '  type="range" ' +
          min +
          " " +
          max +
          "/>"
      );
      var slider = $(
        "<label for=" +
          obj.innerHtmlId +
          'data-toggle="tooltip">' +
          option +
          "</label>"
      );
      slider.append(sliderCntrl);
      slider.css("marginLeft", obj.marginLeft || 8);
      slider.css("marginRight", obj.marginRight || 8);

      sliderCntrl.css("marginLeft", obj.marginLeft || 8);
      sliderCntrl.css("marginTop", obj.marginTop || 2);
      tbDiv.append(slider);
      sliderCntrl.css("top", tbDiv.css("top"));
      //var pos = parseInt($($("#"+obj.innerHtmlId).parent()).css("right"));
      var parent = $("#" + obj.innerHtmlId).parent()[0];
      var pos = parent.offsetLeft + parent.offsetWidth;
      //console.log()
      sliderCntrl.css("left", pos);
      slider.css(
        "width",
        parent.offsetWidth + parseInt(sliderCntrl.css("width"))
      );
      slider.attr("title", obj.tooltip);
      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      sliderCntrl.on("change", function () {
        _cb(parseInt($(this).val()));
        //console.log($(this).val())
      });
      buttonList.push(slider);
      return buttonList.length - 1;
    };

    var addRadiobutton = function (obj) {
      let _cb = obj.cb || defaultCb;
      let r = null;
      let inp = null;
      var option = obj.label || "Option 1";
      obj.tooltip = obj.tooltip || "";

      const indexOfAmpersand = option.indexOf("&");
      if (indexOfAmpersand !== -1) {
        obj.ampersandNizeChar = option[indexOfAmpersand + 1].toUpperCase();
        option = option.replace("&", "");

        obj.tooltip = obj.tooltip + "\tAlt " + obj.ampersandNizeChar;

        $("body").on("keydown", function (event) {
          const keyCode = event.keyCode ? event.keyCode : event.which;
          if (
            event.altKey &&
            String.fromCharCode(keyCode) == obj.ampersandNizeChar
          ) {
            //event.preventDefault();
            r.click();
          }
        });
      }
      obj.value = obj.value || option;
      obj.innerHtmlId = obj.innerHtmlId || option + "elem_" + buttonList.length;
      var name = obj.name || "optradio";
      var checked = "";
      if (obj.checked) checked = "checked";

      if (obj.checked)
        inp = $(
          "<input id=" +
            obj.innerHtmlId +
            ' type="radio" checked value=' +
            obj.value +
            " name=" +
            name +
            ">"
        );
      else
        inp = $(
          "<input id=" +
            obj.innerHtmlId +
            ' type="radio" value=' +
            obj.value +
            " name=" +
            name +
            ">"
        );
      r = $(
        '<label data-toggle="tooltip" class="checkbox-inline">\
                                    ' +
          option +
          "\
                                  </label>"
      );
      r.append(inp);
      r.css("marginLeft", obj.marginLeft || 0);
      r.css("marginRight", obj.marginRight || 0);
      tbDiv.append(r);

      r.attr("title", obj.tooltip);

      //We store the unmodified text on the buttonText attribute. The text may be modified by adding spaces
      //or by locale translation.
      r.attr("buttonText", option);

      r.addClass(obj.class);
      r.click(function (event) {
        _cb(r.find("INPUT").val());
      });
      buttonList.push(r);
      return buttonList.length - 1;
    };

    function makeListElement(obj) {
      var str = "";
      var checkbox = obj.hasCheckbox || false;
      var elementsInfo = obj.listElements || [];
      for (var i = 0; i < elementsInfo.length; ++i) {
        //elementsInfo[i].hasCheckbox = elementsInfo[i].hasCheckbox || false
        elementsInfo[i].icon = elementsInfo[i].icon || "";
        elementsInfo[i].checked = elementsInfo[i].checked || "unchecked";
        if (checkbox && !elementsInfo[i].icon.length) {
          if (elementsInfo[i].tooltip) {
            str +=
              '<li title="' +
              elementsInfo[i].tooltip +
              '"><a href="#"><label><input type="checkbox" ' +
              elementsInfo[i].checkboxState +
              " value=" +
              i +
              ">" +
              elementsInfo[i].text +
              "</label></a></li>";
          } else {
            str +=
              '<li><a href="#"><label><input type="checkbox" ' +
              elementsInfo[i].checkboxState +
              " value=" +
              i +
              ">" +
              elementsInfo[i].text +
              "</label></a></li>";
          }
        }
        if (!checkbox && elementsInfo[i].icon.length) {
          if (elementsInfo[i].tooltip) {
            str +=
              '<li title="' +
              elementsInfo[i].tooltip +
              '"><a href="#"><label><img src=' +
              elementsInfo[i].icon +
              ' alt="Img" width=20px>' +
              " " +
              elementsInfo[i].text +
              "</label></a></li>";
          } else {
            str +=
              '<li><a href="#"><label>' +
              elementsInfo[i].icon +
              elementsInfo[i].text +
              "</label></a></li>";
          }
        }
        if (checkbox && elementsInfo[i].icon.length) {
          if (elementsInfo[i].tooltip) {
            str +=
              '<li title="' +
              elementsInfo[i].tooltip +
              '"><a href="#"><label><img src=' +
              elementsInfo[i].icon +
              ' alt="Img" width=20px><input type="checkbox" ' +
              elementsInfo[i].checkboxState +
              ' value="">' +
              elementsInfo[i].text +
              "</label></a></li>";
          } else {
            str +=
              '<li><a href="#"><label><input type="checkbox" ' +
              elementsInfo[i].checkboxState +
              ' value="">' +
              elementsInfo[i].icon +
              elementsInfo[i].text +
              "</label></a></li>";
          }
        }
        if (!checkbox && !elementsInfo[i].icon.length) {
          //str += '<li><a href="#">'+elementsInfo[i].text+'</a></li>'
          if (elementsInfo[i].tooltip) {
            str +=
              '<li title="' +
              elementsInfo[i].tooltip +
              '"><a href="#"><label>' +
              elementsInfo[i].text +
              "</label></a></li>";
          } else {
            str +=
              '<li><a href="#"><label>' +
              elementsInfo[i].text +
              "</label></a></li>";
          }
        }
      }
      return str;
    }
    /*
<div class="dropdown">
<button class="btn btn-primary dropdown-toggle" type="button" id="about-us" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
About Us
<span class="caret"></span>
</button>
<ul class="dropdown-menu" aria-labelledby="about-us">
<li class="dropdown-header">Company Information</li>
<li><a href="#">Our Story</a></li>
<li><a href="#">Our Team</a></li>
<li class="dropdown-header">Contact Us</li>
<li><a href="#">Call Center</a></li>
<li><a href="#">Store Locations</a></li>
</ul>
</div> */

    var addDropdown = function (obj) {
      var option = obj.label || "Option 1";
      obj.text = obj.text || "Button";
      obj.tooltip = obj.tooltip || "";
      let m_ampersandNizeChar = null;
      const indexOfAmpersand = obj.text.indexOf("&");
      if (indexOfAmpersand !== -1) {
        m_ampersandNizeChar = obj.text[indexOfAmpersand + 1];
        obj.ampersandNizeChar = m_ampersandNizeChar.toUpperCase();
        obj.text = obj.text.replace("&", "");

        obj.tooltip = obj.tooltip + "\tAlt " + obj.ampersandNizeChar;

        $("body").on("keydown", function (event) {
          const keyCode = event.keyCode ? event.keyCode : event.which;
          if (
            event.altKey &&
            String.fromCharCode(keyCode) == obj.ampersandNizeChar
          ) {
            //event.preventDefault();
            $("#" + obj.innerHtmlId).click();
          }
        });
      } //////
      obj.innerHtmlId =
        obj.innerHtmlId || obj.text + "elem_" + buttonList.length;
      let d = $(
        '<span data-toggle="tooltip" class="dropdown">\
                              <button id=' +
          obj.innerHtmlId +
          ' class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
          obj.text +
          '\
                              <span class="caret"></span></button>\
                              <ul class="dropdown-menu">' +
          makeListElement(obj) +
          "</ul>\
                          </span>"
      );
      d.css("marginLeft", obj.marginLeft || 0);
      d.css("marginRight", obj.marginRight || 0);

      // console.log(456, tbDiv.css("zIndex"));

      // d.css({ position: "relative", zIndex: 100000 });

      d.addClass(obj.class);

      d.attr("title", obj.tooltip);

      //We store the unmodified text on the buttonText attribute. The text may be modified by adding spaces
      //or by locale translation.
      d.attr("buttonText", obj.text);
      d.attr("ampersandNizeChar", m_ampersandNizeChar);

      //console.log(obj.innerHtmlId)
      tbDiv.append(d);
      d.css("zIndex", tbDiv.css("zIndex"));
      // d.find("UL").css("zIndex", tbDiv.css("zIndex") );
      // console.log(d.find("UL").css("zIndex"));

      obj.cb = obj.cb || defaultCb;

      d.on("click", function (e) {
        var el = $(e.target);
        if (el.parent().parent().parent().hasClass("disabled")) return false;
        if (obj.hasCheckbox) return;

        var el = $(e.target);
        var index = el.closest("li").index();
        //var checked = el.prop("checked")
        if (index == -1) return;
        obj.cb(e, index);
      });

      d.on("change", function (e) {
        var el = $(e.target);

        //console.log()
        var checked = el.prop("checked");
        //if(index == -1 || checked==undefined)
        //return
        obj.cb(e, el.closest("li").index(), el.prop("checked"));
      });

      //d.css("zIndex", tbDiv.css("zIndex"));

      buttonList.push(d);
      return buttonList.length - 1;
    };

    var addSelect = function (obj) {
      obj.label = obj.label || "Select One";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      //obj.text = obj.text || "Button"
      var sel = $("<select/>");
      var s = $(
        '<span data-toggle="tooltip"><label for=' +
          obj.innerHtmlId +
          ">" +
          obj.label +
          ":</label>\
                            </span>"
      );
      s.append(sel);
      var seltns = obj.selections || [];
      for (var i = 0; i < seltns.length; ++i) {
        sel.append($("<option>" + seltns[i] + "</option>"));
      }
      s.css("marginLeft", obj.marginLeft || 8);
      s.css("marginRight", obj.marginRight || 8);

      s.addClass(obj.class);

      s.attr("title", obj.tooltip);

      //We store the unmodified text on the buttonText attribute. The text may be modified by adding spaces
      //or by locale translation.
      s.attr("buttonText", obj.label);

      tbDiv.append(s);
      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      sel.on("change", function () {
        _cb($(this)[0].selectedIndex);
      });
      buttonList.push(s);
      return buttonList.length - 1;
    };

    var addMenu = function (obj) {
      var option = obj.label || "Menu one";
      obj.text = obj.text || "Button";
      obj.tooltip = obj.tooltip || "";
      let m_ampersandNizeChar = null;
      const indexOfAmpersand = obj.text.indexOf("&");
      if (indexOfAmpersand !== -1) {
        m_ampersandNizeChar = obj.text[indexOfAmpersand + 1];
        obj.ampersandNizeChar = m_ampersandNizeChar.toUpperCase();
        obj.text = obj.text.replace("&", "");

        obj.tooltip = obj.tooltip + "\tAlt " + obj.ampersandNizeChar;

        $("body").on("keydown", function (event) {
          const keyCode = event.keyCode ? event.keyCode : event.which;
          if (
            event.altKey &&
            String.fromCharCode(keyCode) == obj.ampersandNizeChar
          ) {
            //event.preventDefault();
            $("#" + obj.innerHtmlId).click();
          }
        });
      }
      obj.innerHtmlId =
        obj.innerHtmlId || obj.text + "elem_" + buttonList.length;
      var d = $(
        "<button id=" +
          obj.innerHtmlId +
          ' class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">' +
          obj.text +
          "\
                              </button>"
      );
      d.css("marginLeft", obj.marginLeft || 0);
      d.css("marginRight", obj.marginRight || 0);

      d.addClass(obj.class);

      d.attr("title", obj.tooltip);

      //We store the unmodified text on the buttonText attribute. The text may be modified by adding spaces
      //or by locale translation.
      d.attr("buttonText", obj.text);
      d.attr("ampersandNizeChar", m_ampersandNizeChar);

      //console.log(obj.innerHtmlId)
      tbDiv.append(d);

      d.css("zIndex", tbDiv.css("zIndex"));
      //console.log(d.css("zIndex"));

      obj.cb = obj.cb || defaultCb;

      // d.on("click", function (e) {
      //   var el = $(e.target);
      //   if (el.parent().parent().parent().hasClass("disabled")) return false;
      //   if (obj.hasCheckbox) return;
      //   var el = $(e.target);
      //   var index = el.closest("li").index();
      //   //var checked = el.prop("checked")
      //   if (index == -1) return;
      //   obj.cb(e, index);
      // });

      // d.on("change", function (e) {
      //   var el = $(e.target);

      //   //console.log()
      //   var checked = el.prop("checked");
      //   //if(index == -1 || checked==undefined)
      //   //return
      //   obj.cb(e, el.closest("li").index(), el.prop("checked"));
      // });

      d.contextMenu(obj.menu, {
        //zIndex: tbDiv.css("zIndex"),
        // displayAround: "trigger",
        // horAdjust: -parseInt(d.css("width")),
        // verAdjust: parseInt(d.css("height")),
      });

      // d.contextMenu(menu1, {
      //   triggerOn: "contextmenu",
      //   zIndex: 1,
      //   // onClose: function (data, event) {
      //   //   m_curve = 0;
      //   // },
      // });

      buttonList.push(d);
      return buttonList.length - 1;
    };

    var addUpload = function (obj) {
      obj.label = obj.label || "Select One";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      //obj.text = obj.text || "Button"
      var inp = $(
        "<input id=" +
          obj.innerHtmlId +
          '  type="file" name="files[]" multiple style="display:none" />'
      );
      var u = $(
        '<button data-toggle="tooltip"><img src=' +
          Static.imagePath +
          "upload.png" +
          "></button>"
      );
      inp.css("marginLeft", -8);
      inp.css("marginRight", -8);
      inp.css("marginTop", -3);
      inp.css("marginBottom", -3);
      u.append(inp);

      /*var u = $('<button data-toggle="tooltip">\
                  <input type="file" id="files" name="files[]" multiple />\
                  </button>')*/
      u.css("marginLeft", obj.marginLeft || 8);
      u.css("marginRight", obj.marginRight || 8);

      u.addClass(obj.class);

      u.attr("title", obj.tooltip);

      tbDiv.append(u);

      buttonList.push(u);

      //A workaround to get the input file tag to work in some
      //IE browsers
      var click = false;
      u.click(function (e) {
        if (!click) {
          inp.trigger("click");
          click = false;
          return false;
        }
      });

      inp.click(function (e) {
        click = true;
      });

      return buttonList.length - 1;
    };

    var addNumber = function (obj) {
      obj.label = obj.label || "Select One";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      //obj.text = obj.text || "Button"
      obj.min = obj.min || -1000000;
      obj.max = obj.max || 1000000;
      obj.value = obj.value || obj.min;
      if (obj.value > obj.max) obj.value = obj.max;
      if (obj.value < obj.min) obj.value = obj.min;
      //console.log(typeof(obj.min))
      var n = $(
        '<span data-toggle="tooltip"><label for="sel1">' +
          obj.label +
          ":</label>\
                                   </span>"
      );
      var spinBox = $(
        "<input id=" +
          obj.innerHtmlId +
          '  type="number"\
                            value="10" name="some-name"/>'
      );
      n.append(spinBox);
      tbDiv.append(n);
      spinBox.attr({
        width: 200,
        min: obj.min,
        max: obj.max,
        step: obj.step,
        value: obj.value,
      });

      n.attr("title", obj.tooltip);

      n.css("marginLeft", obj.marginLeft || 8);
      n.css("marginRight", obj.marginRight || 8);

      n.addClass(obj.class);

      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      //n.click(_cb)
      spinBox.on("change", function () {
        _cb(parseFloat($(this).val()));
      });
      buttonList.push(n);
      return buttonList.length - 1;
    };

    var addLink = function (obj) {
      obj.text = obj.text || "Button";
      obj.innerHtmlId = obj.innerHtmlId || "elem_" + buttonList.length;
      var l = $("<A HREF=" + obj.href + " id=" + obj.innerHtmlId + "></a>");
      tbDiv.append(l);
      l.addClass(obj.class);

      l.attr("target", obj.target);

      let m_ampersandNizeChar = null;
      const indexOfAmpersand = obj.text.indexOf("&");
      if (indexOfAmpersand !== -1) {
        m_ampersandNizeChar = obj.text[indexOfAmpersand + 1];
        obj.ampersandNizeChar = m_ampersandNizeChar.toUpperCase();
        obj.text = obj.text.replace("&", "");

        obj.tooltip = obj.tooltip + "\tAlt " + obj.ampersandNizeChar;

        $("body").on("keydown", function (e) {
          const keyCode = e.keyCode ? e.keyCode : e.which;
          if (
            e.altKey &&
            String.fromCharCode(keyCode) == obj.ampersandNizeChar
          ) {
            l[0].dispatchEvent(new MouseEvent("click"));
          }
        });
      }

      l.text(obj.text);
      l.attr("title", obj.tooltip);

      var _cb =
        obj.cb ||
        function () {
          console.log("No callback defined for button");
        };
      l.click(_cb);
      buttonList.push(l);
      return buttonList.length - 1;
    };

    this.addToolButton = function (type, obj) {
      if (type == "pushbutton") return addPushbutton(obj);
      if (type == "checkbox") return addCheckbox(obj);
      if (type == "toggleSwitch") return addToggleSwitch(obj);
      if (type == "radio") return addRadiobutton(obj);
      if (type == "dropdown") return addDropdown(obj);
      if (type == "select") return addSelect(obj);
      if (type == "menu") return addMenu(obj);
      if (type == "slider") return addSlider(obj);
      if (type == "number") return addNumber(obj);
      if (type == "upload") return addUpload(obj);
      if (type == "link") return addLink(obj);
    };

    /* this.setButtonCheck = function (buttonId, on) {
      if (typeof buttonId == "string") {
        buttonId = buttonTextAttribToId(buttonId);
      }

      const input = $(buttonList[buttonId]).find("input").prevObject[0];
      //console.log(input, input.checked);
      if (input.checked != on) {
        input.checked = on;
      }
      $(input).trigger("change");
    };
 */
    this.setButtonCheck = function (buttonId, on) {
      if (typeof buttonId == "string") {
        buttonId = buttonTextAttribToId(buttonId);
      }

      const input = $(buttonList[buttonId]).find("input").prevObject;
      const e = document.getElementById(input[0].id);
      //console.log(e, input[0].checked);
      if (e && e.checked != on) {
        $(e).click();
      }
      //$(input).trigger("change");
    };

    this.isButtonChecked = function (buttonId) {
      if (typeof buttonId == "string") {
        buttonId = buttonTextAttribToId(buttonId);
      }
      const input = $(buttonList[buttonId]).find("input").prevObject[0];
      return input.checked;
    };

    /* this.setButtonCheck = function (buttonId, on) {
      if (typeof buttonId == "string") {
        buttonId = buttonTextAttribToId(buttonId);
      }

      //buttonList[buttonId].prop("checked", on);
      if (buttonList[buttonId][0].children[0]) {
        //$(buttonList[buttonId][0].children[0]).prop("checked", on);
        if (buttonList[buttonId][0].children[0].tagName == "INPUT")
          buttonList[buttonId][0].children[0].checked = on;
        else buttonList[buttonId][0].children[1].checked = on; //Some how translation requires thid
      } else buttonList[buttonId][0].checked = on;
    }; */

    /* this.isButtonChecked = function (buttonId) {
      if (typeof buttonId == "string") {
        buttonId = buttonTextAttribToId(buttonId);
      }

      //buttonList[buttonId].prop("checked", on);
      if (buttonList[buttonId][0].children[0]) {
        //$(buttonList[buttonId][0].children[0]).prop("checked", on);
        if (buttonList[buttonId][0].children[0].tagName == "INPUT")
          return buttonList[buttonId][0].children[0].checked;
        else return buttonList[buttonId][0].children[1].checked; //Some how translation requires thid
      } else return buttonList[buttonId][0].checked;
    }; */

    this.isDropdownItemChecked = function (buttonId, listIndex) {
      if (typeof buttonId == "string")
        buttonId = buttonTextAttribToId(buttonId);
      var input = $($(buttonList[buttonId].children()[1]).children()[listIndex])
        .children()
        .children()
        .children();
      //console.log(input.prop("checked"));
      // if (input && input[0].checked != undefined) {
      //   return input[0].checked;
      // }
      if (!input[1] && input[0].checked != undefined) {
        return input[0].checked;
      }
      if (input && input[1].checked != undefined) {
        return input[1].checked;
      }
      return true;
    };
    ////////////////
    this.setDropdownItemCheck = function (buttonId, listIndex, on) {
      if (typeof buttonId == "string")
        buttonId = buttonTextAttribToId(buttonId);
      var input = $(
        $(buttonList[buttonId].children()[1]).children()[listIndex]
      ).find("input");
      //input.prop("checked", on);

      //if (!input[1] && input[0].checked != undefined) {
      if (input[0].checked != on) {
        //$(input[0]).trigger("change");
        input.click();
        return;
      }
      //}
      // if (input && input[1] && input[1].checked != undefined) {
      //   if (input[1].checked != on) {
      //     input.click();
      //     return;
      //   }
      // }

      //input.trigger("change");
    };

    this.hideDropdownItem = function (buttonId, listIndex) {
      if (typeof buttonId == "string")
        buttonId = buttonTextAttribToId(buttonId);
      $($(buttonList[buttonId].children()[1]).children()[listIndex]).hide();
    };

    this.showDropdownItem = function (buttonId, listIndex) {
      if (typeof buttonId == "string")
        buttonId = buttonTextAttribToId(buttonId);
      $($(buttonList[buttonId].children()[1]).children()[listIndex]).show();
    };

    this.enableDropdownItem = function (buttonId, listIndex, on) {
      if (typeof buttonId == "string")
        buttonId = buttonTextAttribToId(buttonId);
      var liItem = $(
        $(buttonList[buttonId].children()[1]).children()[listIndex]
      ).addClass("disabled");
      if (!on) {
        liItem.addClass("disabled");
      } else {
        liItem.removeClass("disabled");
      }
    };

    var _prevH = parseFloat(tbDiv.css("height"));
    //console.log(_prevH)

    Static.onHtmlElementResize(tbDiv[0], function () {
      var changeOfHeight = parseFloat(tbDiv.css("height")) - _prevH;
      _prevH = parseFloat(tbDiv.css("height")); //console.log(changeOfHeight)
      self.tbarHeight = parseFloat(tbDiv.css("height"));
      plotDiv.css("height", parseFloat(plotDiv.css("height")) - changeOfHeight);
      Static.trigger("toolBarResized", [tbDiv, changeOfHeight]);
    });

    //Enable the default context menu for the toolbar
    Static.enableContextMenu(tbDiv[0]);
  }
}
