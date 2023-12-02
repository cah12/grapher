"include ['pane']";
"use strict";

class InfoPropertiesPane extends Pane {
  constructor(_parent, plot) {
    super(_parent);
    var self = this;
    var m_sidebarReDisplay = false;
    let playImgSrc = "images/play.png";

    let curCurve = null;

    let domainMin = 0;
    let domainMax = 0;

    self.setHeader(
      plot.rightSidebar.gridItem(0).headerElement,
      "Sidebar",
      true
    );

    var sideBarDlg = $(
      '<div style="background-color:rgba(249, 251, 221, 0.8);  ">\
                <div style="margin:4px">\
                <select id="currentCurve" style="width:100%">\
                </select></div>\
                <!--div><input type="text" id="fnDisplay" style="width:100%; background-color:rgba(255, 255, 255, 0.8); padding-left:6px" readonly /></div-->\
                <div><button id="copyText" title="Copy to clipboard"><img src="images/copy.png" style="width:15px;height:15px;padding=0px;margin=0px"></button><span id="fnDisplay" style="background-color:rgba(255, 255, 255, 0.8); margin:0px 4px 0px 4px; padding-left:6px;"></span></button></div>\
                <!--div style="white-space: nowrap;"><label style="padding-left:6px">onchange: <input id="onchange" type="checkbox" readonly /> </label>\
				damp: <input id="damp" style="width:30%" type="number" min="1" value="30000" step="500"/>\
				</div-->\
                \
                <div style="height:30%; overflow: auto">\
                  <div id="coeff_cont0" style="background-color:lightBlue; margin:2px; border-radius:4px">\
                  <div style="">Parameter:<b><span id="coeff0">?</span></b></div>\
                  <div style="margin:0px">\
                  <div style="white-space: nowrap;">\
                  <button id="coeff_val0_playButton" style="padding:0"><img src="images/play.png" alt="play button" width="20" height="20" title="Animate the function over the domain"></button><input id="coeff_val0_min" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Minimum value of coefficient"/><input id="coeff_val0" style="width:52%" type="number" value="1" title="A coefficient in the function that could be ajusted"/><input id="coeff_val0_max" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Maximum value of coefficient"/>\
                  </div>\
                  </div>\
                  </div>\
                  <br>\
                  <div id="coeff_cont1" style="background-color:lightBlue; margin:2px; border-radius:4px">\
                  <div style="">Parameter:<b><span id="coeff1">?</span></b></div>\
                  <div style="margin:0px">\
                  <div style="white-space: nowrap;">\
                  <button id="coeff_val1_playButton" style="padding:0"><img src="images/play.png" alt="play button" width="20" height="20" title="Animate the function over the domain"></button><input id="coeff_val1_min" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Minimum value of coefficient"/><input id="coeff_val1" style="width:52%" type="number" value="1" title="A coefficient in the function that could be ajusted"/><input id="coeff_val1_max" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Maximum value of coefficient"/>\
                  </div>\
                  </div>\
                  </div>\
                  <br>\
                  <div id="coeff_cont2" style="background-color:lightBlue; margin:2px; border-radius:4px">\
                  <div style="">Parameter:<b><span id="coeff2">?</span></b></div>\
                  <div style="margin:0px">\
                  <div style="white-space: nowrap;">\
                  <button id="coeff_val2_playButton" style="padding:0"><img src="images/play.png" alt="play button" width="20" height="20" title="Animate the function over the domain"></button><input id="coeff_val2_min" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Minimum value of coefficient"/><input id="coeff_val2" style="width:52%" type="number" value="1" title="A coefficient in the function that could be ajusted"/><input id="coeff_val2_max" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Maximum value of coefficient"/>\
                  </div>\
                  </div>\
                  </div>\
                  <br>\
                  <div id="coeff_cont3" style="background-color:lightBlue; margin:2px; border-radius:4px">\
                  <div style="">Parameter:<b><span id="coeff3">?</span></b></div>\
                  <div style="margin:0px">\
                  <div style="white-space: nowrap;">\
                  <button id="coeff_val3_playButton" style="padding:0"><img src="images/play.png" alt="play button" width="20" height="20" title="Animate the function over the domain"></button><input id="coeff_val3_min" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Minimum value of coefficient"/><input id="coeff_val3" style="width:52%" type="number" value="1" title="A coefficient in the function that could be ajusted"/><input id="coeff_val3_max" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Maximum value of coefficient"/>\
                  </div>\
                  </div>\
                  </div>\
                  <br>\
                  <div id="coeff_cont4" style="background-color:lightBlue; margin:2px; border-radius:4px">\
                  <div style="">Parameter:<b><span id="coeff4">?</span></b></div>\
                  <div style="margin:0px">\
                  <div style="white-space: nowrap;">\
                  <button id="coeff_val4_playButton" style="padding:0"><img src="images/play.png" alt="play button" width="20" height="20" title="Animate the function over the domain"></button><input id="coeff_val4_min" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Minimum value of coefficient"/><input id="coeff_val4" style="width:52%" type="number" value="1" title="A coefficient in the function that could be ajusted"/><input id="coeff_val4_max" class="noInputArrows no-outline noInputBorders" type="number" style="width:20%" title="Maximum value of coefficient"/>\
                  </div>\
                  </div>\
                  </div>\
                </div>\
                \
                <div id="watchTableContainer">\
                <div style="text-align:center"><h4>Watches</h4></div>\
                <div class="table-responsive" style="height: 47%">\
                \
                \
                <table class="table table-bordered" id="watchTable">\
                <thead>\
                <tr>\
                <th>Watch</th>\
                <th>Value</th>\
                </tr>\
                </thead>\
                <tbody id="watchTableBody">\
                </tbody>\
                </table>\
                </div>\
                \
                \
                </div>\
                </div>'
    );

    self.paneParent.append(sideBarDlg);
    plot.sidebar = self;

    this.sidebarDlg = function () {
      return sideBarDlg;
    };

    let parameterLimitsMap = new Map(); //parameterLimitsMap.set(curve, {})

    /* for (var i = 0; i < 5; ++i) {
      $("#coeff_val" + i + "_min").val(1);
      $("#coeff_val" + i + "_min").attr("title", `Minimum value: ${1}`);
      $("#coeff_val" + i + "_max").val(2);
      $("#coeff_val" + i + "_max").attr("title", `Maximum value: ${2}`);
    } */

    function initSidebarSelect() {
      var opts = $("#currentCurve").children();
      for (var i = 0; i < opts.length; ++i) {
        $("#currentCurve")[0].removeChild(opts[i]);
      }
      var curves = plot
        .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotZone));
      for (var i = 0; i < curves.length; ++i) {
        if (curves[i].isVisible()) {
          var opt = $("<option>" + curves[i].title() + "</option>");
          opt.attr("value", curves[i].title());
          $("#currentCurve").append(opt);
        }
      }
    }

    function hideAllInputs() {
      for (var i = 0; i < 5; ++i) {
        $("#coeff_cont" + i).hide();
      }
    }

    var damp = 30000;
    //Utility.alert("You have more than 5 unknown coefficients. Only the first 5 coefficients could be adjusted from the sidebar. The value of each remaining will be 1.")
    function initSidebarInput() {
      /* var curves = plot
        .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
        .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotZone)); */
      hideAllInputs();
      curCurve = plot.findPlotCurve($("#currentCurve").val());
      if (!curCurve) {
        return;
      }
      /* $("#fnDisplay").val("");
      //console.log(curCurve);
      if (curCurve.functionDlgData && curCurve.fn) {
        if (curCurve.functionDlgData.variableY) {
          $("#fnDisplay").val(
            "f(" +
              curCurve.functionDlgData.variable +
              "," +
              curCurve.functionDlgData.variableY +
              ")=" +
              curCurve.fn
          );
        } else {
          $("#fnDisplay").val("f(" + curCurve.variable + ")=" + curCurve.fn);
        }
      } */

      const mj = function (tex) {
        return MathJax.tex2svg(tex, { em: 16, ex: 6, display: false });
      };

      $("#fnDisplay").html("");
      //console.log(curCurve);
      let m_html = null;
      if (
        (curCurve.functionDlgData && curCurve.fn) ||
        (curCurve.parametricFnX && curCurve.parametricFnY)
      ) {
        if (curCurve.functionDlgData && curCurve.fn) {
          if (curCurve.functionDlgData.variableY) {
            m_html =
              "f(" +
              curCurve.functionDlgData.variable +
              "," +
              curCurve.functionDlgData.variableY +
              ")=" +
              curCurve.fn;
          } else {
            m_html = "f(" + curCurve.variable + ")=" + curCurve.fn;
          }
        } else {
          m_html = `(${curCurve.parametricFnX}, ${curCurve.parametricFnY})`;
          m_html = Utility.parametricTex(curCurve, m_html);
        }
        m_html = m_html.replaceAll("mod", " mod ");

        try {
          // display and re-render the expression
          MathJax.typesetClear();
          $("#fnDisplay")[0].innerHTML = "";
          let child = null;
          if (!curCurve.parametricFnX) {
            child = Utility.tex2svgMultiline(
              math
                .parse(m_html)
                .toTex({ parenthesis: "auto", implicit: "hide" }),
              60,
              {
                em: 16,
                ex: 6,
                display: false,
              }
            );
            //$("#fnDisplay")[0].appendChild(child);
          } else {
            child = Utility.tex2svgMultiline(
              `Par(${curCurve.parametric_variable}):${m_html}`,
              60,
              {
                em: 16,
                ex: 6,
                display: false,
              }
            );
          }
          $("#fnDisplay")[0].appendChild(child);
        } catch (err) {}
      }

      function copyTextCb() {
        if (!curCurve.parametricFnX) {
          navigator.clipboard.writeText(
            math
              .parse(curCurve.fn.replaceAll("mod", " mod "))
              .toTex({ em: 16, ex: 6, display: false })
          );
        } else {
          const s1 = math
            .parse(curCurve.parametricFnX.replaceAll("mod", " mod "))
            .toTex({ em: 16, ex: 6, display: false });
          const s2 = math
            .parse(curCurve.parametricFnY.replaceAll("mod", " mod "))
            .toTex({ em: 16, ex: 6, display: false });
          navigator.clipboard.writeText(`(${s1},${s2})`);
        }
      }
      $("#copyText").off("click", copyTextCb);
      $("#copyText").on("click", copyTextCb);

      var widthX = curCurve.upperX - curCurve.lowerX;
      var step = widthX / (damp / 10000);
      var coeffs = curCurve.coeffs || [];
      var numOfCoeffs = coeffs.length;
      for (var i = 0; i < numOfCoeffs; ++i) {
        $("#coeff_val" + i).attr("step", step);
        if (!curCurve.parameterLimits[i]) {
          curCurve.parameterLimits.push({ minimum: 1, maximum: 2 });
        }
        $("#coeff_val" + i + "_min").val(curCurve.parameterLimits[i].minimum);
        $("#coeff_val" + i + "_min").attr(
          "title",
          `Minimum value: ${curCurve.parameterLimits[i].minimum}`
        );
        $("#coeff_val" + i + "_max").val(curCurve.parameterLimits[i].maximum);
        $("#coeff_val" + i + "_max").attr(
          "title",
          `Maximum value: ${curCurve.parameterLimits[i].maximum}`
        );
      }

      /* $("#damp").on("input", function () {
        var val = parseInt($("#damp").val());
        if (!_.isFinite(val) || val < 1) {
          $("#damp").val(damp);
        } else {
          damp = val;
        }
        step = widthX / (damp / 10000);
        for (var i = 0; i < numOfCoeffs; ++i) {
          $("#coeff_val" + i).attr("step", step);
        }
      }); */

      if (numOfCoeffs > 5) {
        numOfCoeffs = 5;
      }

      for (var i = 0; i < numOfCoeffs; ++i) {
        $("#coeff" + i).html(coeffs[i]);
        $("#coeff_val" + i).attr("step", step);
        $("#coeff_val" + i).val(curCurve.coeffsVal[i]);
        // $("#coeff_val" + i + "_min").val(1);
        // $("#coeff_val" + i + "_min").attr("title", `Minimum value: ${1}`);
        // $("#coeff_val" + i + "_max").val(2);
        // $("#coeff_val" + i + "_max").attr("title", `Maximum value: ${2}`);

        $("#coeff_val" + i).stop(true);
        $("#coeff_val" + i + "_playButton")[0].children[0].src =
          "images/play.png";
        $("#coeff_cont" + i).show();
      }
    }

    function initSidebar() {
      initSidebarSelect();
      initSidebarInput();
      Static.trigger(
        "currentCurveChanged",
        plot.findPlotCurve($("#currentCurve").val())
      );
    }

    this.sidebarReDisplay = function () {
      return m_sidebarReDisplay;
    };

    this.setSidebarReDisplay = function (on) {
      m_sidebarReDisplay = on;
    };

    this.setTop = function (topPosition) {
      sideBarDlg.css("top", topPosition);
    };

    function initializeEventHandlers() {
      $("#currentCurve").change(function () {
        //Invalidate cache and, thus, force integrate() to re-compute
        Static.total_volume = undefined;
        Static.total_area = undefined;
        Static.prevStart = undefined;
        Static.prevEnd = undefined;
        initSidebarInput();
        Static.trigger("invalidateWatch");
        Static.trigger(
          "currentCurveChanged",
          plot.findPlotCurve($("#currentCurve").val())
        );
      });

      ///////////////////////////////////////////////////////

      /* $("#onchange").change(function () {
        for (let i = 0; i < 5; i++) {
          $("#coeff_val" + i).stop(true);
          $("#coeff_val" + i + "_playButton")[0].children[0].src =
            "images/play.png";
        }
      }); */

      $(
        "#coeff_val0_max, #coeff_val1_max, #coeff_val2_max, #coeff_val3_max, #coeff_val4_max, #coeff_val0_min, #coeff_val1_min, #coeff_val2_min, #coeff_val3_min, #coeff_val4_min"
      ).on("input", function () {
        const c = $(this)[0].id.charAt(9);
        $("#coeff_val" + c).stop(true);
        $("#coeff_val" + c + "_playButton")[0].children[0].src =
          "images/play.png";
        let curCurve = plot.findPlotCurve($("#currentCurve").val());
        if ($(this)[0].id.indexOf("_min") !== -1) {
          $(this).attr("title", `Minimum value: ${$(this).val()}`);
          curCurve.parameterLimits[parseInt(c)].minimum = parseFloat(
            $(this).val()
          );
        } else {
          $(this).attr("title", `Maximum value: ${$(this).val()}`);
          curCurve.parameterLimits[parseInt(c)].maximum = parseFloat(
            $(this).val()
          );
        }
      });

      $(
        "#coeff_val0_playButton, #coeff_val1_playButton, #coeff_val2_playButton, #coeff_val3_playButton, #coeff_val4_playButton"
      ).click(function () {
        const c = $(this)[0].id.charAt(9);
        const imgSrc = $(this)[0].children[0].src;
        if (imgSrc.indexOf("pause.png") !== -1) {
          //pause button pressed
          $("#coeff_val" + c).stop(true);
          $(this)[0].children[0].src = "images/play.png";
        } else {
          //play button pressed
          const minValue = parseFloat($("#coeff_val" + c + "_min").val());
          const maxValue = parseFloat($("#coeff_val" + c + "_max").val());
          if (minValue >= maxValue) {
            alert("Maximum value must be greater than minimum value.");
            $("#coeff_val" + c + "_max").select();
            return;
          }
          /* $("#onchange")[0].checked = false;
            $("#onchange").trigger("change"); */
          startAnimation();
          function startAnimation() {
            //$("#onchange")[0].checked = false;
            //if ($("#onchange")[0].checked) $("#onchange").click();

            const option = {
              duration: Static.animationDuration,
              step: function () {
                $("#coeff_val" + c).trigger("input");
              },
            };
            const option2 = {
              duration: Static.animationDuration,
              complete: startAnimation,
              step: function () {
                $("#coeff_val" + c).trigger("input");
              },
            };
            $("#coeff_val" + c)
              .val(parseFloat($("#coeff_val" + c + "_min").val()))
              .animate({ value: maxValue }, option);
            $("#coeff_val" + c)
              .val(parseFloat($("#coeff_val" + c + "_min").val()))
              .animate({ value: minValue }, option2);
          }
          $(this)[0].children[0].src = "images/pause.png";
        }
      });

      //////////////////////////////////////////////////////////////////////////

      //immediate update
      $("#coeff_val0, #coeff_val1, #coeff_val2, #coeff_val3, #coeff_val4").on(
        "input",
        function () {
          //if (!$("#onchange")[0].checked) {
          const value = parseFloat($(this).val());
          const minValue = parseFloat($("#" + $(this)[0].id + "_min").val());
          const maxValue = parseFloat($("#" + $(this)[0].id + "_max").val());
          if (value > maxValue) {
            $(this).val(maxValue);
          }
          if (value < minValue) {
            $(this).val(minValue);
          }
          //console.log(minValue, maxValue);
          if (validateInput($(this))) adjustCurve($(this));
        }
        //}
      );
      //update on enter
      /* $("#coeff_val0, #coeff_val1, #coeff_val2, #coeff_val3, #coeff_val4").on(
        "change",
        function () {
          if (!validateInput($(this))) {
            $(this).val(getLastValidValue($(this)));
            return;
          }
          if ($("#onchange")[0].checked) {
            const value = parseFloat($(this).val());
            const minValue = parseFloat($("#" + $(this)[0].id + "_min").val());
            const maxValue = parseFloat($("#" + $(this)[0].id + "_max").val());
            if (value > maxValue) {
              $(this).val(maxValue);
            }
            if (value < minValue) {
              $(this).val(minValue);
            }
            adjustCurve($(this));
          } 
        }
      ); */
    }

    var initializeEventHandlersOnce = _.once(initializeEventHandlers);
    this.initSidebar = function () {
      initSidebar();
      initializeEventHandlersOnce();
    };

    this.currentCurveName = function () {
      return $("#currentCurve").val();
    };

    Static.bind("titleChange", function () {
      initSidebar();
    });

    Static.bind("pointAdded pointRemoved", function (e, curve) {
      $("#currentCurve").val(curve.title);
    });

    const inputIds = [
      "coeff_val0",
      "coeff_val1",
      "coeff_val2",
      "coeff_val3",
      "coeff_val4",
    ];

    function adjustDomain(curCurve, selector) {
      const selectorIndex = inputIds.indexOf(selector[0].id);
      var coeffs = curCurve.coeffs;
      if (curCurve.domainRangeRestriction.length) {
        let s = curCurve.domainRangeRestriction[0];
        s = curCurve.plot().defines.expandDefines(s);
        s = Utility.purgeAndMarkKeywords(s);
        // s = s.replaceAll(
        //   coeffs[selectorIndex],
        //   `(${curCurve.coeffsVal[selectorIndex]})`
        // );
        for (let index = 0; index < coeffs.length; index++) {
          if (s.indexOf(coeffs[index]) != -1) {
            s = s.replaceAll(coeffs[index], `(${curCurve.coeffsVal[index]})`);
          }
        }
        if (curCurve.parametricFnX) {
          curCurve.parametricLowerX = math.evaluate(
            Utility.replaceKeywordMarkers(s)
          );
        } else {
          curCurve.lowerX = math.evaluate(Utility.replaceKeywordMarkers(s));
        }

        s = curCurve.domainRangeRestriction[1];
        s = curCurve.plot().defines.expandDefines(s); //plot.defines.expandDefines
        s = Utility.purgeAndMarkKeywords(s);
        for (let index = 0; index < coeffs.length; index++) {
          if (s.indexOf(coeffs[index]) != -1) {
            s = s.replaceAll(coeffs[index], `(${curCurve.coeffsVal[index]})`);
          }
        }
        if (curCurve.parametricFnX) {
          curCurve.parametricUpperX = math.evaluate(
            Utility.replaceKeywordMarkers(s)
          );
        } else {
          curCurve.upperX = math.evaluate(Utility.replaceKeywordMarkers(s));
        }

        //console.log(domainRangeRestriction[0], domainRangeRestriction[1]);
      }
    }

    function adjustCurveUnique(selector) {
      var curCurve = plot.findPlotCurve($("#currentCurve").val());
      if (curCurve.title() !== self.currentCurveName()) {
        return;
      }
      var coeffs = curCurve.coeffs;
      var fn = curCurve.fn;
      if (curCurve.fn) {
        fn = Utility.purgeAndMarkKeywords(fn);
        for (var i = 0; i < coeffs.length; ++i) {
          while (fn.indexOf(coeffs[i]) != -1) {
            fn = fn.replace(coeffs[i], `(${$("#coeff_val" + i).val()})`);
          }
          curCurve.coeffsVal[i] = parseFloat($("#coeff_val" + i).val());
        }
        fn = Utility.replaceKeywordMarkers(fn);
        curCurve.expandedFn = fn; //Added 6/17/2020

        adjustDomain(curCurve, selector);

        var data = curCurve.data();
        if (curCurve.unboundedRange) {
          data.setFn(fn);
        } else {
          var s = Utility.makeSamples({
            fx: fn,
            lowerX: curCurve.lowerX,
            upperX: curCurve.upperX,
            numOfSamples: curCurve.numOfSamples,
          });
          if (!s) {
            console.log(784);
            return;
          }
          data.setSamples(s);
        }
      } else if (curCurve.parametricFnX && curCurve.parametricFnY) {
        let parametricFnX = curCurve.parametricFnX,
          parametricFnY = curCurve.parametricFnY;
        fn = Utility.purgeAndMarkKeywords(parametricFnX);
        for (var i = 0; i < coeffs.length; ++i) {
          while (fn.indexOf(coeffs[i]) != -1) {
            fn = fn.replace(coeffs[i], $("#coeff_val" + i).val());
          }
          curCurve.coeffsVal[i] = $("#coeff_val" + i).val();
        }
        parametricFnX = Utility.replaceKeywordMarkers(fn);

        fn = Utility.purgeAndMarkKeywords(parametricFnY);
        for (var i = 0; i < coeffs.length; ++i) {
          while (fn.indexOf(coeffs[i]) != -1) {
            fn = fn.replace(coeffs[i], $("#coeff_val" + i).val());
          }
          curCurve.coeffsVal[i] = $("#coeff_val" + i).val();
        }
        parametricFnY = Utility.replaceKeywordMarkers(fn);

        adjustDomain(curCurve, selector);

        var data = curCurve.data();
        if (curCurve.unboundedRange) {
          data.setFn(curCurve.expandedFn);
        } else {
          var s = Utility.makeSamples({
            fx: null,
            // lowerX: curCurve.lowerX,
            // upperX: curCurve.upperX,
            lowerX: curCurve.parametricLowerX,
            upperX: curCurve.parametricUpperX,
            numOfSamples: curCurve.numOfSamples,
            parametricFnX,
            parametricFnY,
            parametric_variable: curCurve.parametric_variable,
          });
          if (!s) {
            console.log(781);
            return;
          }

          data.setSamples(s);
        }
      }
      Static.trigger("curveAdjusted");
      plot.autoRefresh();
    }

    function adjustCurveNonUnique(selector) {
      const currentCurveCoeffs = plot.findPlotCurve(
        self.currentCurveName()
      ).coeffs;

      const selectorIndex = inputIds.indexOf(selector[0].id);

      var array = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let index = 0; index < array.length; index++) {
        const curCurve = array[index];
        //console.log(curCurve.title(), self.currentCurveName());

        var coeffs = curCurve.coeffs;

        for (var i = 0; i < coeffs.length; ++i) {
          if (curCurve.fn) {
            var fn = Utility.purgeAndMarkKeywords(curCurve.fn);
            if (coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1) {
              while (
                coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1 &&
                fn.indexOf(currentCurveCoeffs[selectorIndex]) != -1
              ) {
                fn = fn.replace(
                  currentCurveCoeffs[selectorIndex],
                  `(${selector.val()})`
                );
              }
              for (let index = 0; index < coeffs.length; index++) {
                const element = coeffs[index];
                fn = fn.replaceAll(element, curCurve.coeffsVal[index]);
              }
              curCurve.coeffsVal[selectorIndex] = parseFloat(selector.val());

              curCurve.expandedFn = Utility.replaceKeywordMarkers(fn); //Added 6/17/2020

              adjustDomain(curCurve, selector);

              var data = curCurve.data();
              if (curCurve.unboundedRange) {
                data.setFn(curCurve.expandedFn);
              } else {
                var s = Utility.makeSamples({
                  fx: curCurve.expandedFn,
                  lowerX: curCurve.lowerX,
                  upperX: curCurve.upperX,
                  numOfSamples: curCurve.numOfSamples,
                });
                if (!s) {
                  console.log(782);
                  return;
                }
                data.setSamples(s);
              }
            } //
          } else if (curCurve.parametricFnX && curCurve.parametricFnY) {
            let parametricFnX = curCurve.parametricFnX,
              parametricFnY = curCurve.parametricFnY;
            var fn = Utility.purgeAndMarkKeywords(parametricFnX);
            if (coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1) {
              while (
                coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1 &&
                fn.indexOf(currentCurveCoeffs[selectorIndex]) != -1
              ) {
                fn = fn.replace(
                  currentCurveCoeffs[selectorIndex],
                  `(${selector.val()})`
                );
              }
              for (let index = 0; index < coeffs.length; index++) {
                const element = coeffs[index];
                fn = fn.replaceAll(element, curCurve.coeffsVal[index]);
              }
              //curCurve.coeffsVal[selectorIndex] = selector.val();
              curCurve.coeffsVal[selectorIndex] = parseFloat(selector.val());
            }

            for (let index = 0; index < coeffs.length; index++) {
              const element = coeffs[index];
              fn = fn.replaceAll(element, curCurve.coeffsVal[index]);
            }
            parametricFnX = Utility.replaceKeywordMarkers(fn); //Added 6/17/2020

            fn = Utility.purgeAndMarkKeywords(parametricFnY);
            if (coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1) {
              while (
                coeffs.indexOf(currentCurveCoeffs[selectorIndex]) != -1 &&
                fn.indexOf(currentCurveCoeffs[selectorIndex]) != -1
              ) {
                fn = fn.replace(
                  currentCurveCoeffs[selectorIndex],
                  `(${selector.val()})`
                );
              }
              for (let index = 0; index < coeffs.length; index++) {
                const element = coeffs[index];
                fn = fn.replaceAll(element, curCurve.coeffsVal[index]);
              }
              //curCurve.coeffsVal[selectorIndex] = selector.val();
              curCurve.coeffsVal[selectorIndex] = parseFloat(selector.val());
            }

            for (let index = 0; index < coeffs.length; index++) {
              const element = coeffs[index];
              fn = fn.replaceAll(element, curCurve.coeffsVal[index]);
            }
            parametricFnY = Utility.replaceKeywordMarkers(fn); //Added 6/17/2020

            adjustDomain(curCurve, selector);
            var data = curCurve.data();
            if (curCurve.unboundedRange) {
              data.setFn(curCurve.expandedFn);
            } else {
              var s = Utility.makeSamples({
                fx: null,
                // lowerX: curCurve.lowerX,
                // upperX: curCurve.upperX,
                lowerX: curCurve.parametricLowerX,
                upperX: curCurve.parametricUpperX,
                numOfSamples: curCurve.numOfSamples,
                parametricFnX,
                parametricFnY,
                parametric_variable: curCurve.parametric_variable,
              });
              if (!s) {
                console.log(783);
                return;
              }
              data.setSamples(s);
            }
          }
        }
      }
      Static.trigger("curveAdjusted");
      plot.autoRefresh();
    }

    function adjustCurve(selector) {
      if (Static.uniqueParameter) {
        adjustCurveUnique(selector);
      } else {
        adjustCurveNonUnique(selector);
      }
    }

    Static.bind("visibilityChange", function (e, plotItem, on) {
      if (!on) {
        for (var i = 0; i < 5; ++i) {
          $("#coeff_val" + i).stop(true);
          $("#coeff_val" + i + "_playButton")[0].children[0].src =
            "images/play.png";
        }
      }
    });

    Static.bind("itemAttached", function (e, plotItem, on) {
      for (var i = 0; i < 5; ++i) {
        $("#coeff_val" + i).stop(true);
        $("#coeff_val" + i + "_playButton")[0].children[0].src =
          "images/play.png";
      }
      if (
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve ||
        plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram
      ) {
        if (on) {
          //attached
        } else {
          //detached
          if (
            !plot
              .itemList(PlotItem.RttiValues.Rtti_PlotCurve)
              .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve))
              .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram))
              .concat(plot.itemList(PlotItem.RttiValues.Rtti_PlotZone))
              .length ||
            !plot.hasVisiblePlotCurve()
          ) {
            //self.showSidebar(false);
          }
        }
        Static.trigger("visibilityChange", [plotItem, on]);
      }
    });

    // function getLastValidValue(input) {
    //   /* var inputIds = [
    //     "coeff_val0",
    //     "coeff_val1",
    //     "coeff_val2",
    //     "coeff_val3",
    //     "coeff_val4",
    //   ]; */
    //   var curCurve = plot.findPlotCurve($("#currentCurve").val());

    //   return curCurve.coeffsVal[inputIds.indexOf(input[0].id)];
    // }

    function isValidNumber(val) {
      return _.isFinite(parseFloat(val));
    }

    function validateInput(input) {
      var inputIds = [
        "coeff_val0",
        "coeff_val1",
        "coeff_val2",
        "coeff_val3",
        "coeff_val4",
      ];
      var curCurve = plot.findPlotCurve($("#currentCurve").val());
      var coeffsVal = curCurve.coeffsVal;

      var inputIdIndex = inputIds.indexOf(input[0].id);
      if (!isValidNumber(input.val())) {
        return false;
      }

      return true;
    }

    self.initSidebar();
  }
}
