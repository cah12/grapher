"include ['static', 'modalDlg']";

"use strict";

///////////////////////////////////////////////////////

class DefinesDlg extends ModalDlg {
  constructor(defines, _editor) {
    const options = {
      title: "Defines",
      spaceRows: true,
      dialogSize: "modal-md",
    };
    super(options);
    const self = this;
    self.defines = defines;

    self.showKeyboard = true;

    let editor = _editor;

    this.setEditor = function (_editor) {
      editor = _editor;
    };

    function removeAllHighlight() {
      const rows = self.selector("definesTable").find("TR");
      for (let i = 0; i < rows.length; i++) {
        const row = $(rows[i]).removeClass("definesTableRowselected");
      }
    }

    //Modal body code
    this.addRow([
      '<div class="col-md-1">Name:</div>',
      '<div class="col-md-3">\
      <input id="definesName" type="text" style="width:100%">\
      </input>\
      </div>',
      '<div class="col-md-1">Value:</div>',
      '<div class="col-md-7">\
      <math-field class="math-field-limits" id="definesValue" style="width:100%;color:#000000; font-size:2rem; border: solid"  title="">\
      </math-field>\
      </div>',
    ]);

    const mf = self.selector("definesValue")[0];

    $(mf).on("focusin", () => {
      if (self.showKeyboard) {
        mathVirtualKeyboard.container = self.getDlgModal()[0];
        mathVirtualKeyboard.show();
        $(".modal-dialog").css("top", "63%");
        this.getDlgModal()[0].scrollBy(0, 1000);
        this.getDlgModal().css("overflow", "hidden");
      }
    });

    $(mf).on("focusout", () => {
      if (self.showKeyboard) {
        mathVirtualKeyboard.container = $("body")[0];
        mathVirtualKeyboard.hide();
        $(".modal-dialog").css("top", "0%");
      }
    });

    Utility.extendGetValue(mf);

    this.addRow([
      `<div class="col-md-6"><input tabindex="-1" id="simplify" type="checkbox" checked> <label for="simplify">Simplify expanded equation</label> \
                          </input>\
                          </div>`,
      '<div class="col-md-6"><input tabindex="-1" id="showVirtualKeyboard" type="checkbox" checked> <label for="showVirtualKeyboard">Show virtual keyboard</label> \
                          </input>\
                          </div>',
    ]);

    this.addRow([
      '<div class="col-md-12"><table>\
      <tr style="border: 1px solid black">\
      <th style="border: 0px"> Name</th>\
      <th style="text-align: right; border: 0px">Value </th>\
      </tr>\
      </table>\
      <div style="position:relative; overflow: auto;height: 100px">\
      <table id="definesTable" style="border: 1px solid black">\
      <col width="15%">\
      </table>\
      </div>\
      </div>',
    ]);

    $(self.getDlgModal().find("BUTTON")[0]).addClass("DefinesClose");

    //Footer code
    this.selector("cancel").addClass("DefinesClose");
    this.selector("cancel").text("Close");
    this.selector("ok").hide();

    this.addFooterElement(
      '<button tabindex="-1" id="definesRemoveAll" type="button" class="btn btn-default" >Remove All</button>'
    );

    this.addFooterElement(
      '<button tabindex="-1" id="definesRemove" type="button" class="btn btn-default" >Remove</button>'
    );

    this.addFooterElement(
      '<button id="definesAdd" type="button" class="btn btn-default" >Add</button>'
    );

    this.addFooterElement(
      '<select tabindex="-1" name="uploadDefinesType" id="uploadDefinesType" style="margin:4px"><option value="loadFromLocalFs">from Local System</option><option value="loadFromMongoFs">from Mongo System</option></select>'
    );

    this.addFooterElement(
      '<label>\
      <input tabindex="-1" id="definesUpload" type="file" style="display: none;" name="files[]" multiple />\
      </label>'
    );

    this.addFooterElement(
      '<button tabindex="-1" id="definesUploadButton" type="button" class="btn btn-default DefinesOpen">\
  Load\
  </button>'
    );

    this.addHandler("definesUploadButton", "click", function (e) {
      //console.log($(this).hasClass("DefinesOpen"));
      if (self.selector("uploadDefinesType").val() === "loadFromLocalFs") {
        e.stopImmediatePropagation();
        self.selector("definesUpload").trigger("click");
      } else {
        //editor.openFile();
      }
    });

    function setRemoveButtonAttribute() {
      var define = defines.hasDefine(self.selector("definesName").val());
      if (!define) {
        self.selector("definesRemove").attr("disabled", true);
        //self.selector("definesRemoveAll").attr("disabled", true);
      } else {
        self.selector("definesRemove").attr("disabled", false);
        //self.selector("definesRemoveAll").attr("disabled", false);
      }
    }

    this.doAdd = function (name, val) {
      let { value, latexValue } = val;
      name = name.replace(/\s/g, "");
      value = value.replace(/\s/g, "");
      if (value) {
        val.value = value = value.replaceAll("mod", " mod ");
      }

      var define = defines.getDefine(name);
      if (define) {
        defines.define(name, val); //update
        let _name = name
          .replaceAll("(", "openPar")
          .replaceAll(")", "closePar")
          .replaceAll("'", "prime");

        $("#" + _name)[0].children[1].innerText = value;
        //self.closeDlg();
      } else {
        removeAllHighlight();

        defines.define(name, val);
        self.selector("definesRemoveAll").attr("disabled", false);
        let id = name
          .replaceAll("(", "openPar")
          .replaceAll(")", "closePar")
          .replaceAll("'", "prime");
        //id = id.replace(")", "closePar");
        const m_row = $(
          `<tr id= ${id} class="definesTableRowselected clickable-row" style="border: 1px solid black"><td style="border: 1px solid black"> ${name} </td><td>  ${value} </td></tr>`
        );
        self.selector("definesTable").append(m_row);
      }
      self.selector("definesName").val("");
      mf.setValue("", { suppressChangeNotifications: true });
      self.selector("definesName").focus();
      self.selector("definesAdd").attr("disabled", true);
      self.selector("definesRemove").attr("disabled", true);
    };

    this.addHandler("definesUpload", "change", function (evt) {
      var files = evt.target.files; // FileList object
      defines.upload(files);
    });

    this.addHandler("definesAdd", "click", function () {
      var name = self.selector("definesName").val();
      var error = defines.validateDefineName(
        self.selector("definesName").val()
      );
      if (error.errorType == Defines.DefineError.start) {
        alert('Define name,"' + name + '", must start with alpha character.');
        self.selector("definesName").val("");
        if (defines.definesSize()) {
          self.selector("definesRemoveAll").attr("disabled", false);
        }
        return;
      }
      if (error.errorType == Defines.DefineError.redefine) {
        Utility.alertYesNo(
          `Are you sure yo want to redefine "${name}"`,
          function (action) {
            if (action == 0 || action == 1) {
              self.selector("definesName").val("");
              mf.setValue("", { suppressChangeNotifications: true });
              return;
            } else {
              const value = math
                .simplify(
                  mf.getValue("ascii-math"),
                  {},
                  { exactFractions: true }
                )
                .toString();
              const latexValue = mf.latexValue;
              self.doAdd(name, { value, latexValue });
            }
            return;
          },
          "medium",
          "redefine"
        );
        return;
      }

      if (error.errorType == Defines.DefineError.contain) {
        alert(
          'Define name,"' +
            name +
            '", contains, or is part of, the earlier define.'
        );
        self.selector("definesName").val("");
        if (defines.definesSize()) {
          self.selector("definesRemoveAll").attr("disabled", false);
        }
        return;
      }
      if (error.errorType == Defines.DefineError.keyword) {
        // alert(
        //   'Define name,"' + name + '", contains "' + error.name + '" keyword!'
        // );
        Utility.alert(
          'Define name,"' + name + '", contains "' + error.name + '" keyword!',
          null,
          "keyWordOverwrite"
        );
        self.selector("definesName").val("");
        self.selector("definesAdd").attr("disabled", true);
        if (defines.definesSize()) {
          self.selector("definesRemoveAll").attr("disabled", false);
        }
        return;
      }
      const value = math
        .simplify(mf.getValue("ascii-math"), {}, { exactFractions: true })
        .toString();
      const latexValue = mf.latexValue;
      self.doAdd(name, { value, latexValue });
    });

    this.addHandler("definesName", "input", function (e) {
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val())
      ) {
        const define = defines.getDefineObj(self.selector("definesName").val());
        //if (define) self.selector("definesValue").val(define);
        if (define)
          mf.setValue(define.latexValue, { suppressChangeNotifications: true });
      }
      if (!self.selector("definesName").val().length) {
        mf.setValue("", { suppressChangeNotifications: true });
      }
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val()) &&
        mf.getValue("ascii-math").length &&
        _.isString(mf.getValue("ascii-math"))
      ) {
        setRemoveButtonAttribute();
        self.selector("definesAdd").attr("disabled", false);
        //888
        //self.selector("definesAdd").focus();
      } else {
        self.selector("definesAdd").attr("disabled", true);
        self.selector("definesRemove").attr("disabled", true);
        //self.selector("definesRemoveAll").attr("disabled", true);
      }
    });

    this.addHandler("definesValue", "input", function (e) {
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val())
      ) {
        setRemoveButtonAttribute();
        self.selector("definesAdd").attr("disabled", false);
        //888
        //self.selector("definesAdd").focus();
      } else {
        self.selector("definesAdd").attr("disabled", true);
        self.selector("definesRemove").attr("disabled", true);
        //self.selector("definesRemoveAll").attr("disabled", true);
      }
    });

    this.addHandler("definesRemove", "click", function () {
      let id = self.selector("definesName").val();
      id =
        "#" +
        id
          .replaceAll("(", "openPar")
          .replaceAll(")", "closePar")
          .replaceAll("'", "prime");
      //var id = "#" + self.selector("definesName").val();
      defines.removeDefine(self.selector("definesName").val());
      if (!defines.definesSize()) {
        self.selector("definesRemove").attr("disabled", true);
        self.selector("definesRemoveAll").attr("disabled", true);
        self.selector("definesAdd").attr("disabled", true);
      }
      $(id).remove();
      self.selector("definesName").val("");
      mf.setValue("", { suppressChangeNotifications: true });
      self.selector("definesName").focus();
      self.selector("definesRemove").attr("disabled", true);
      self.selector("definesAdd").attr("disabled", true);
    });

    this.addHandler("definesRemoveAll", "click", function () {
      defines.defineNames().forEach(function (key) {
        let _id = key
          .replaceAll("(", "openPar")
          .replaceAll(")", "closePar")
          .replaceAll("'", "prime");
        //_id = _id.replace(")", "closePar");
        var id = "#" + _id;
        $(id).remove();
      });
      self.selector("definesName").val("");
      mf.setValue("", { suppressChangeNotifications: true });
      self.selector("definesRemoveAll").attr("disabled", true);
      self.selector("definesRemove").attr("disabled", true);
      defines.removeAllDefines();
    });

    this.addHandler("simplify", "click", function () {
      defines.simplify($(this)[0].checked);
    });

    this.addHandler("showVirtualKeyboard", "click", function () {
      self.showKeyboard = $(this)[0].checked;
    });

    this.defineDlgInit = function () {
      self.selector("definesAdd").attr("disabled", true);
      // self.selector("definesRemove").attr("disabled", true);
      // self.selector("definesRemoveAll").attr("disabled", true);
      if (!defines.definesSize()) {
        self.selector("definesRemoveAll").attr("disabled", true);
        self.selector("definesRemove").attr("disabled", true);
      }

      const rows = self.selector("definesTable").find("TR");

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rowId = row.id
          .replaceAll("openPar", "(")
          .replaceAll("closePar", ")")
          .replaceAll("prime", "'");
        if (!defines.hasDefine(rowId)) {
          $("#" + row.id).remove();
        }
      }
    };

    self.selector("definesTable").on("click dblclick", function (e) {
      removeAllHighlight();
      const row = $(e.target).closest("tr");
      row.addClass("definesTableRowselected");
      const tds = $(row).find("TD");
      const name = $(tds[0]).html().replace(/\s/g, "");
      self.selector("definesName").val(name);
      const { latexValue } = self.defines.getDefineObj(name);

      mf.setValue(latexValue, { suppressChangeNotifications: true });

      //self.selector("definesValue").val($(tds[1]).html().replace(/\s/g, ""));
      self.selector("definesAdd").attr("disabled", true);
      self.selector("definesRemove").attr("disabled", false);
      self.selector("definesRemove").focus();

      if (e.type === "dblclick") {
        self.selector("definesRemove").click();
      }
    });
  }

  initializeDialog() {
    this.defineDlgInit();
  }
}

class Defines {
  constructor() {
    let self = this;
    let m_defines = new Map();
    let m_simplify = true;

    this.getDefinesDlg = function () {
      return null; //subclass reimplement to return something useful.
    };

    function getParenthesizeDefine(name) {
      if (m_defines.has(name)) {
        return "(" + m_defines.get(name).value + ")";
      }
      console.warn('"' + name + '"' + " is not predefined!");
      return "";
    }

    this.simplify = function (on) {
      m_simplify = on;
    };

    this.validateDefineName = function (_name) {
      let c = _name[0].toLowerCase().charCodeAt(0);
      if (!(c > 96 && c < 122)) {
        return { errorType: Defines.DefineError.start, name: _name };
      }

      // const keys = m_defines.keys();
      let earlier = null;
      m_defines.forEach((val, key) => {
        if (_name.indexOf(key) !== -1 || key.indexOf(_name) !== -1) {
          earlier = key;
        }
      });

      //var earlier = m_defines.has(_name);
      if (earlier) {
        if (_name.length === earlier.length)
          return { errorType: Defines.DefineError.redefine, name: earlier };
        return { errorType: Defines.DefineError.contain, name: earlier };
      }
      var keyword = Utility.containsKeyword(_name);
      if (keyword) {
        return { errorType: Defines.DefineError.keyword, name: keyword };
      }
      return { errorType: Defines.DefineError.noError, name: _name };
    };

    this.define = function (_name, _value) {
      m_defines.set(_name, _value);
    };

    function getFunctionDeclarationArgument(str) {
      const ind = str.indexOf("(");
      if (ind == -1) return null;
      const startIndex = ind + 1;
      let res = "(";
      let par = 1;
      for (let i = startIndex; i < str.length; i++) {
        res += str[i];
        if (str[i] == "(") par++;
        if (str[i] == "(") par--;
        if (par == 0) break;
      }
      res = res.substring(1);
      res = res.slice(0, -1);
      return res;
    }

    let counter = 0;
    function doExpandDefines(str, variable, derive) {
      //handle function declarations

      let m_str;
      let dec;

      if (str.indexOf("^(-1)") !== -1) {
        dec = Utility.getInverseDeclaration(str);
        let n = 0;
        while (dec && n < 100) {
          // const _dec = dec.replace("^(-1)", "");
          let _dec = `${dec}${variable})`;
          _dec = _dec.replace("^(-1)", "");
          let _defn = m_defines.get(_dec);
          if (!_defn) {
            return null;
          }
          _defn = _defn.value.replaceAll(variable, "y");
          _defn = `${_defn}=x`;
          let eq = null;
          let solution = null;
          try {
            eq = nerdamer(`${_defn}`);
            solution = eq.solveFor("y");
            nerdamer.flush();
          } catch (error) {
            console.log("Error in discontinuity()");
          }
          console.log(typeof solution);
          if (typeof solution != "object") {
            solution = [solution];
          }
          solution = solution[0].toString().replaceAll("abs", "");
          solution = math
            .simplify(solution, {}, { exactFractions: false })
            .toString()
            .replaceAll(" ", "");

          //f^(-1)(
          let i = 7;

          let bracket = 1;
          let arg = "";
          for (let i = 7; i < str.length; i++) {
            const c = str[i];

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

          dec = `${dec}${arg})`;

          solution = solution.replaceAll(variable, `(${arg})`);

          str = str.replace(dec, solution);
          console.log(solution);
          dec = Utility.getInverseDeclaration(str);
          n++;
        }
      }

      if (derive) {
        m_str = str.slice();
        dec = Utility.getFunctionDeclaration(str);
        while (dec) {
          m_str = m_str.replaceAll(dec, "");
          if (dec) {
            //if (!m_defines.get(dec)) {
            // alert(
            //   `Attempt to use "${dec}" rejected because it is undefined.`
            // );
            // return null;
            // }
          }
          dec = Utility.getFunctionDeclaration(m_str);
        }

        //handle derivativesdeclarations
        m_str = str.slice();
        let full_dec = Utility.getFullDerivativeDeclaration(m_str, variable);
        // if (!m_defines.get(full_dec)) {
        dec = self.getDerivativeDeclaration(m_str, variable);
        let values = [];
        let names = [];
        while (full_dec) {
          m_str = m_str.replaceAll(full_dec, "");
          if (dec) {
            if (!m_defines.get(dec)) {
              let _derivativeOrder = Utility.derivativeOrder(dec);
              let fnDec = dec.replaceAll("'", "");
              let _derivative = null;
              if (m_defines.get(fnDec))
                _derivative = m_defines.get(fnDec).value;

              if (_derivative) {
                const variable = fnDec[fnDec.length - 2];
                for (let index = 0; index < _derivativeOrder; index++) {
                  _derivative = math
                    .derivative(_derivative, variable)
                    .toString();
                  //_derivative = _derivative.replaceAll(variable, arg);
                }
                _derivative = _derivative.replace(/\s/g, "");
                names.push(dec);
                values.push(_derivative);
                //$(window).trigger("defineAdded", [dec, _derivative]);
              } else {
                // alert(
                //   `Attempt to define "${dec}" failed because "${fnDec}" is undefined.`
                // );
                return null;
              }
            } else {
              // if (m_str.length) {
              //   return null;
              // }
              full_dec = Utility.getFullDerivativeDeclaration(m_str, variable);
              if (full_dec) {
                dec = self.getDerivativeDeclaration(m_str, variable);
              }
              continue;
            }
          }
          full_dec = Utility.getFullDerivativeDeclaration(m_str, variable);
          if (full_dec) {
            dec = self.getDerivativeDeclaration(m_str, variable);
          }
        }
        if (names.length) {
          let m_names = _.uniq(names);
          for (let i = 0; i < m_names.length; i++) {
            $(window).trigger("defineAdded", [m_names[i], values[i]]);
          }
        }
        //}
      }

      var defined;
      var i;
      let startIndex = 0;
      let res = str.slice().replace(/\s/g, "");
      let m_res = res.slice();
      res = Utility.purgeAndMarkKeywords(res);
      m_defines.forEach(function (value, key, map) {
        if (key.indexOf("(") == -1) {
          while (res.indexOf(key) !== -1) {
            res = res.replace(
              key,
              Utility.purgeAndMarkKeywords(getParenthesizeDefine(key))
            );
          }
        } else {
          const f = key.substring(0, key.indexOf("(") + 1);
          const names = self.defineNames();

          for (let i = 0; i < names.length; i++) {
            if (names[i].indexOf(f) != -1) {
              let n = 0;

              while (res.indexOf(f, startIndex) !== -1 && n < 100) {
                startIndex = res.indexOf(f);
                n++;
                let def = getParenthesizeDefine(names[i]);
                let m_x = names[i].substring(
                  names[i].indexOf("(") + 1,
                  names[i].indexOf(")")
                );
                let subInd = 0;
                let s_par = 0;
                let o_par = false;
                for (let index = startIndex; index < m_res.length; index++) {
                  if (m_res[index] == "(") s_par++;
                  if (m_res[index] == ")") s_par--;
                  if (
                    !o_par &&
                    index > 0 &&
                    m_res[index] == "(" /*  && */
                    /* m_res[index - 1] == f[0] */
                    /* m_res[index - 1] == f[index - 1] */
                  ) {
                    o_par = true;
                  }
                  if (o_par && s_par == 0) {
                    subInd = index;
                    break;
                  }
                }
                let m_x_replacement = m_res.substring(
                  m_res.indexOf(f),
                  subInd + 1
                );
                m_x_replacement =
                  getFunctionDeclarationArgument(m_x_replacement);
                def = def.replaceAll(m_x, "(" + m_x_replacement + ")");
                if (res[0] === f[0]) {
                  res = res.replace(f + m_x_replacement + ")", def);
                } else {
                  res = res.replace(f + m_x_replacement + ")", "*" + def);
                  res = res.replace("**", "*");
                  res = res.replace("+*", "+");
                  res = res.replace("-*", "-");
                  res = res.replace("/*", "/");
                  res = res.replace("(*(", "((");
                  res = res.replace(")*)", "))");
                }

                m_res = res.slice();
                startIndex = 0;
              }
              break;
            }
          }
        }
      });

      /* [
  { l: 'n1*n3 + n2*n3', r: '(n1+n2)*n3' },
  'n1*n3 + n2*n3 -> (n1+n2)*n3',
  function (node) {
    // ... return a new node or return the node unchanged
    return node
  }
] 
[{ l: 'c1*v1', r: 'c1v1' }]
*/
      if (res.indexOf("'") !== -1) {
        return null;
      }
      res = Utility.replaceKeywordMarkers(res);
      if (m_simplify) {
        try {
          res = math.simplify(res, {}, { exactFractions: false }).toString();
          res = res.replace(/\s/g, "");
          res = res.replaceAll("+-", "-");
          res = res.replaceAll("-+", "-");

          //Replace the whitespace delimiters stripped out by simplify()
          res = res.replaceAll("mod", " mod ");
          return Utility.removeUnwantedAsterisk(res);
        } catch (error) {
          // Utility.alert(error.message, "small", "m_simplify");
          // return res;
          res = res.replace(/\s/g, "");
          res = res.replaceAll("+-", "-");
          res = res.replaceAll("-+", "-");

          //Replace the whitespace delimiters stripped out by simplify()
          res = res.replaceAll("mod", " mod ");
          return Utility.removeUnwantedAsterisk(res);
        }
      }
      return res;
    }

    this.getDerivativeDeclaration = function (str, variable) {
      //let test = 0;
      let ind = str.lastIndexOf("'(");
      let index = ind - 1;
      let res = null;
      for (; index > -1; index--) {
        if (str[index] == "'") continue;
        else {
          res = str.substring(index, ind + 2);
          res = `${res}${variable})`;
          break;
        }
      }
      //console.log("test:" + test++);
      if (!variable && res) {
        // const f = res.substring(0, res.indexOf("("));
        // console.log(f);
        let f = "";
        let numOfPrimes = 0;
        for (let i = ind; i >= 0; i--) {
          if (str[i] == "'") {
            numOfPrimes++;
            continue;
          }
          f += str[i];
          break;
        }
        for (let i = 0; i < numOfPrimes; i++) {
          f += "'";
        }
        f += "(";
        const keys = this.defineNames();
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].indexOf(f) !== -1) return keys[i];
        }
      }
      return res;
    };

    /* this.getFunctionDeclaration = function (str) {
      //f(x)
      for (let i = 3; i < str.length; i++) {
        if (
          str[i] === ")" &&
          str[i - 2] === "(" &&
          Utility.isAlpha(str[i - 1]) &&
          Utility.isAlpha(str[i - 3])
        ) {
          if (i == 3 || !Utility.isAlpha(str[i - 4]))
            return str.substring(i - 3, i + 1);
        }
      }
      return null;
    }; */

    this.expandDefines = function (str, variable, derive = true) {
      if ($.isNumeric(str)) {
        return str;
      }
      if (!str || str.length === 0) {
        return str;
      }
      str = str.replaceAll(" ", "");
      let prevExpanded = str;

      str = doExpandDefines(str, variable, derive);
      if (!str) return null;
      //let prevExpanded = null;

      let n = 0;
      /* if (!variable) {
        while (str !== prevExpanded && n < 100) {
          prevExpanded = str;
          str = doExpandDefines(str, variable, derive);
          //prevExpanded = str;
          n++;
        }
      } else { */
      //prevExpanded = str;
      /* let scope = new Map();
        scope.set(variable, 1);
        let s1 = str;
        try {
          s1 = math.evaluate(str, scope);
        } catch (error) {}
        let s2 = prevExpanded;
        try {
          s2 = math.evaluate(prevExpanded, scope);
        } catch (error) {}
        if (typeof s1 === "number") {
          s1 = `${Math.round(s1)}`;
        }
        if (typeof s2 === "number") {
          s2 = `${Math.round(s2)}`;
        }
        s1 = math
          .simplify(math.parse(s1), {}, { exactFractions: false })
          .toString()
          .replaceAll("*", "")
          .replaceAll(" ", "");
        s2 = math
          .simplify(math.parse(s2), {}, { exactFractions: false })
          .toString()
          .replaceAll("*", "")
          .replaceAll(" ", ""); */
      while (!Utility.isMathematicalEqual(str, prevExpanded) && n < 100) {
        prevExpanded = str;
        str = doExpandDefines(str, variable, derive);
        //prevExpanded = str;
        /* s1 = str;
          try {
            s1 = math.evaluate(str, scope);
          } catch (error) {}
          s2 = prevExpanded;
          try {
            s2 = math.evaluate(prevExpanded, scope);
          } catch (error) {}
          if (typeof s1 === "number") {
            s1 = `${Math.round(s1)}`;
          }
          if (typeof s2 === "number") {
            s2 = `${Math.round(s2)}`;
          }
          s1 = math
            .simplify(math.parse(s1), {}, { exactFractions: false })
            .toString()
            .replaceAll("*", "")
            .replaceAll(" ", "");
          s2 = math
            .simplify(math.parse(s2), {}, { exactFractions: false })
            .toString()
            .replaceAll("*", "")
            .replaceAll(" ", ""); */
        n++;
      }
      // }
      const _fn = Utility.isLinear(str, variable);
      if (_fn) str = _fn;
      return Utility.insertProductSign(str).replaceAll("mod", " mod ");
    };

    this.removeDefine = function (name) {
      m_defines.delete(name);
    };

    this.removeAllDefines = function () {
      m_defines.clear();
    };

    this.defineNames = function () {
      return Array.from(m_defines.keys());
    };

    this.isCharPartOfAdefine = function (c) {
      const defines = this.defineNames();
      let definesFirstChar = "";
      for (let i = 0; i < defines.length; i++) {
        definesFirstChar += defines[i][0];
      }
      return definesFirstChar.indexOf(c) != -1;
    };

    this.definesSize = function () {
      return m_defines.size;
    };

    this.hasDefine = function (name) {
      return m_defines.has(name);
    };

    this.getDefineObj = function (name) {
      return m_defines.get(name);
    };

    this.getDefine = function (name) {
      const val = m_defines.get(name);

      if (val) {
        let { value } = val;
        if (value) {
          return value.replaceAll("mod", " mod ");
        }
      }
      return null;
    };

    this.processUploadData = function (data) {
      var extension = data.fileName.split(".")[1];
      //console.log(extension)
      if (
        extension == "xls" ||
        extension == "xlsx" ||
        extension == "txt" ||
        extension == "def"
      ) {
        //csv
        var samples = null;
        var csvArray = null;
        if (extension == "xls" || extension == "xlsx") {
          var workbook = XLSX.read(data.content, {
            type: "binary",
          });
          //Fetch the name of First Sheet.
          var firstSheet = workbook.SheetNames[0];

          csvArray = XLSX.utils
            .sheet_to_csv(workbook.Sheets[firstSheet])
            .split("\n");
        } else {
          csvArray = data.content.split("\n");
        }
        var errorFound = false;
        for (var i = 0; i < csvArray.length; i++) {
          var row = csvArray[i].split(",");
          if (row.length !== 2) continue;
          var name = row[0];
          var value = row[1];
          if (name.length && value.length) {
            var error = self.validateDefineName(name);
            if (!errorFound && error.errorType > Defines.DefineError.noError)
              errorFound = true;
            if (error.errorType == Defines.DefineError.noError)
              $(window).trigger("defineAdded", [name, value]);
          }
        }
        if (errorFound) {
          alert(
            "One or more invalid names found or an attempt to load the same file more than once."
          );
          return -1; //error
        }
        return 0; //No error
      }
    };

    this.upload = function (files) {
      const self = this;
      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; (f = files[i]); i++) {
        // Only process image files.
        var fileExtension = f.name.split(".")[1];

        if (
          fileExtension != "txt" &&
          fileExtension != "xls" &&
          fileExtension != "xlsx" &&
          fileExtension != "def" &&
          fileExtension != "plt"
        ) {
          continue;
        }

        var reader = new FileReader();

        reader.onloadend = (function () {
          return function (e) {
            self.getDefinesDlg().selector("definesUpload").val(""); //reset
          };
        })();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
          return function (e) {
            //console.log(e)
            const result = self.processUploadData({
              fileName: theFile.name,
              content: e.target.result,
            });
          };
        })(f);

        //console.log(f)
        // Read in the image file as a data URL.
        if (fileExtension == "xls" || fileExtension == "xlsx") {
          reader.readAsBinaryString(f);
        } else {
          reader.readAsText(f);
        }
        //$("#fileInput").val("");
      }
    };
  }
}

Enumerator.enum(
  "DefineError { noError= 0, start, redefine, contain, keyword }",
  Defines
);

class MDefines extends Defines {
  constructor(plot, editor) {
    super();
    const self = this;
    this.plot = plot;

    const dlg = new DefinesDlg(this, editor);

    this.setEditor = function (editor) {
      dlg.setEditor(editor);
    };

    this.getDefinesDlg = function () {
      return dlg;
    };

    this.defines = function () {
      dlg.showDlg();
    };

    $(window).bind("fileOpened", function (e, data, filename, ext, editorName) {
      // if (ext !== ".txt" && ext !== ".def") {
      //   return;
      // }
      // if (editorName === self.plot.definesEditor.getEditorData().name) {
      //   const result = self.processUploadData({
      //     fileName: filename,
      //     content: data,
      //   });
      // }
    });

    $(window).bind("defineAdded", function (e, name, value) {
      value = self.expandDefines(value, null, false);
      //console.log(value);
      //value = Utility.logBaseAdjust(value);
      let latexValue = Utility.toLatex(value);
      dlg.doAdd(name, { value, latexValue });
    });
  }
}
