"include ['static', 'modalDlg']";

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
      '<div class="col-md-5">\
      <input id="definesName" type="text" style="width:100%">\
      </input>\
      </div>',
      '<div class="col-md-1">Value:</div>',
      '<div class="col-md-5">\
      <input id="definesValue" type="text" style="width:100%">\
      </input>\
      </div>',
    ]);

    this.addRow([
      '<div class="col-md-12"><input tabindex="-1" id="simplify" type="checkbox" checked> <label for="simplify">Simplify expanded equation</label> \
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

    console.log();

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
        self.selector("definesRemoveAll").attr("disabled", true);
      } else {
        self.selector("definesRemove").attr("disabled", false);
        self.selector("definesRemoveAll").attr("disabled", false);
      }
    }

    this.doAdd = function (name, value) {
      name = name.replace(/\s/g, "");
      value = value.replace(/\s/g, "");
      var define = defines.getDefine(name);
      if (define) {
        defines.define(name, value); //update
        let _name = name
          .replaceAll("(", "openPar")
          .replaceAll(")", "closePar")
          .replaceAll("'", "prime");

        $("#" + _name)[0].children[1].innerText = value;
        //self.closeDlg();
      } else {
        removeAllHighlight();
        defines.define(name, value);
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
      self.selector("definesValue").val("");
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
      if (error.errorType == Defines.DefineError.contain) {
        /* alert(
          'Define name,"' +
            name +
            '", contains, or is part of, the earlier define.'
        ); */
        /* self.selector("definesName").val("");
        if (defines.definesSize()) {
          self.selector("definesRemoveAll").attr("disabled", false);
        } */
        //return;
        Utility.alertYesNo(
          `Are you sure yo want to redefine "${name}"`,
          function (action) {
            if (action == 0 || action == 1) {
              self.selector("definesName").val("");
              self.selector("definesValue").val("");
              return;
            } else {
              var value = self.selector("definesValue").val();
              self.doAdd(name, value);
            }
          },
          "medium",
          "redefine"
        );
        return;
      }
      if (error.errorType == Defines.DefineError.keyword) {
        alert(
          'Define name,"' + name + '", contains "' + error.name + '" keyword!'
        );
        self.selector("definesName").val("");
        if (defines.definesSize()) {
          self.selector("definesRemoveAll").attr("disabled", false);
        }
        return;
      }
      var value = self.selector("definesValue").val();
      self.doAdd(name, value);
    });

    this.addHandler("definesName", "input", function (e) {
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val())
      ) {
        var define = defines.getDefine(self.selector("definesName").val());
        if (define) self.selector("definesValue").val(define);
      }
      if (!self.selector("definesName").val().length) {
        self.selector("definesValue").val("");
      }
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val()) &&
        self.selector("definesValue").val().length &&
        _.isString(self.selector("definesValue").val())
      ) {
        setRemoveButtonAttribute();
        self.selector("definesAdd").attr("disabled", false);
        //888
        //self.selector("definesAdd").focus();
      } else {
        self.selector("definesAdd").attr("disabled", true);
        self.selector("definesRemove").attr("disabled", true);
        self.selector("definesRemoveAll").attr("disabled", true);
      }
    });

    this.addHandler("definesValue", "input", function (e) {
      if (
        self.selector("definesName").val().length &&
        _.isString(self.selector("definesName").val()) &&
        self.selector("definesValue").val().length &&
        _.isString(self.selector("definesValue").val())
      ) {
        setRemoveButtonAttribute();
        self.selector("definesAdd").attr("disabled", false);
        //888
        //self.selector("definesAdd").focus();
      } else {
        self.selector("definesAdd").attr("disabled", true);
        self.selector("definesRemove").attr("disabled", true);
        self.selector("definesRemoveAll").attr("disabled", true);
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
      self.selector("definesValue").val("");
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
      self.selector("definesRemoveAll").attr("disabled", true);
      self.selector("definesRemove").attr("disabled", true);
      defines.removeAllDefines();
    });

    this.addHandler("simplify", "click", function () {
      defines.simplify($(this)[0].checked);
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

      self.selector("definesName").val($(tds[0]).html().replace(/\s/g, ""));
      //self.selector("definesName").trigger("input");

      self.selector("definesValue").val($(tds[1]).html().replace(/\s/g, ""));
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
    //let keywordMarkers = [];
    let m_simplify = true;

    /* function replaceKeywordMarkers(str) {
      for (var i = 0; i < keywordMarkers.length; ++i) {
        while (str.indexOf(keywordMarkers[i].marker) != -1) {
          str = str.replace(
            keywordMarkers[i].marker,
            keywordMarkers[i].keyword
          );
        }
      }
      keywordMarkers = [];
      return str;
    }

    function purgeAndMarkKeywords(str) {
      for (var i = 0; i < Static.keywords.length; ++i) {
        while (str.indexOf(Static.keywords[i]) != -1) {
          var _marker = "%" + keywordMarkers.length + "%";
          str = str.replace(Static.keywords[i], _marker);
          keywordMarkers.push({ marker: _marker, keyword: Static.keywords[i] });
        }
      }
      return str;
    } */

    function getParenthesizeDefine(name) {
      if (m_defines.has(name)) {
        return "(" + m_defines.get(name) + ")";
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
      var earlier = m_defines.has(_name);
      if (earlier) {
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

    /* function derivativeOrder(name) {
      let order = 0;
      name = name.trim();
      if (
        name.length < 4 ||
        name.indexOf("(") == -1 ||
        name.indexOf(")") == -1
      ) {
        return 0;
      }
      for (let i = 1; i < name.length; i++) {
        if (name[i] !== "'") {
          break;
        }
        order++;
      }
      return order;
    } */

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

      if (derive) {
        m_str = str.slice();
        dec = Utility.getFunctionDeclaration(str);
        while (dec) {
          m_str = m_str.replace(dec, "");
          if (dec) {
            if (!m_defines.get(dec)) {
              alert(
                `Attempt to use "${dec}" rejected because it is undefined.`
              );
              return null;
            }
          }
          dec = Utility.getFunctionDeclaration(m_str);
        }

        //handle derivativesdeclarations
        m_str = str.slice();
        let full_dec = Utility.getFullDerivativeDeclaration(m_str, variable);
        dec = self.getDerivativeDeclaration(m_str, variable);
        let values = [];
        let names = [];
        while (full_dec) {
          m_str = m_str.replace(full_dec, "");
          if (dec) {
            if (!m_defines.get(dec)) {
              let _derivativeOrder = Utility.derivativeOrder(dec);
              let fnDec = dec.replaceAll("'", "");
              let _derivative = m_defines.get(fnDec);

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
                alert(
                  `Attempt to define "${dec}" failed because "${fnDec}" is undefined.`
                );
                return null;
              }
            } else {
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
          for (let i = 0; i < names.length; i++) {
            $(window).trigger("defineAdded", [names[i], values[i]]);
          }
        }
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
      res = Utility.replaceKeywordMarkers(res);
      if (m_simplify) {
        try {
          res = math.simplify(res, {}, { exactFractions: false }).toString();
          res = res.replace(/\s/g, "");
          res = res.replaceAll("+-", "-");
          res = res.replaceAll("-+", "-");

          //Replace the whitespace delimiters stripped out by simplify()
          res = res.replaceAll("mod", " mod ");
          //counter++;
          //console.log(counter, res);
          return Utility.removeUnwantedAsterisk(res);
        } catch (error) {
          //console.log(counter, res);
          Utility.alert(error, "small", "m_simplify");
          throw "MathJs throwed an error.";
          //return res;
        }
      } //else return Utility.replaceKeywordMarkers(res);
    }

    /* this.getDerivativeDeclaration = function (str, variable) {
      let ind = str.lastIndexOf("'(");
      for (let index = ind - 1; index > 0; index--) {
        if (str[index] == "'") ind--;
        else break;
      }
      if (ind == -1) return null;
      //const startIndex = str.indexOf("'") - 1;
      let res = ""; //str[ind - 1] + "'";
      for (let index = ind - 1; index < str.length; index++) {
        res += str[index];
        if (str[index] == "(") {
          ind = index;
          break;
        }
      }
      let par = 1;
      for (let i = ind + 1; i < str.length; i++) {
        res += str[i];
        if (str[i] == "(") par++;
        if (str[i] == ")") par--;
        if (par == 0) break;
      }
      return res;
    }; */

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
      let prevExpanded = str;
      str = doExpandDefines(str, variable, derive);
      //let prevExpanded = null;
      let n = 0;
      while (str && str !== prevExpanded && n < 200) {
        prevExpanded = str;
        str = doExpandDefines(str, variable, derive);
        n++;
      }
      return Utility.insertProductSign(str);
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

    this.getDefine = function (name) {
      return m_defines.get(name);
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
      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; (f = files[i]); i++) {
        // Only process image files.
        var fileExtension = f.name.split(".")[1];

        if (
          fileExtension != "txt" &&
          fileExtension != "xls" &&
          fileExtension != "xlsx" &&
          fileExtension != "plt"
        ) {
          continue;
        }

        var reader = new FileReader();

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
      }
    };
  }
}

Enumerator.enum("DefineError { noError= 0, start, contain, keyword }", Defines);

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
      dlg.doAdd(name, value);
    });
  }
}
