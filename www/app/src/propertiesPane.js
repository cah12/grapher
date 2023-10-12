"include ['pane']";
"use strict";

/*
pp.addProperty({
name: "My Name only Prop",
id: "nameOnly"
})
pp.addProperty({
name: "My First Prop",
id: "firstProp",
type: "span"
})
pp.addProperty({
name: "My First Prop",
id: "firstProp",
type: "text"
})
pp.addProperty({
name: "My First Prop",
id: "firstProp",
type:"number",
value: 20.0,
min: 10.0,
max: 30.0,
step: 0.5
})

pp.addProperty({
name: "My Color",
id: "colorProp",
type:"color",
value: "red"

})

pp.addProperty({
name: "My Checkbox",
id: "checkboxProp",
type:"checkbox",
checked: true

})
pp.addProperty({
name: "My select",
id: "selectProp",
type:"select",
selectorOptions: ["one", "Two", "Three", 1, 2, 3]

})

pp.addProperty({
name: "My Radio1",
id: "radioProp1",
type:"radio",
group: "myRadioGroup",
checked: true

})

pp.addProperty({
name: "My Radio2",
id: "radioProp2",
type:"radio",
group: "myRadioGroup"

})
 */
/////

class PropertiesPane extends Pane {
  static fontsDisplay() {
    return [
      "Arial",
      "Arial Black",
      "Comic Sans MS",
      "Courier New",
      "Georgia",
      "Impact",
      "Lucida Console",
      "Lucida Sans Unicode",
      "PalatinoLinotype",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Gill Sans",
    ];
  }

  static fontGroup(displayIndex) {
    var fontsGroup = [
      "Arial,Arial,Helvetica,sans-serif",
      "Arial Black,Arial Black,Gadget,sans-serif",
      "Comic Sans MS,Comic Sans MS,cursive",
      "Courier New,Courier New,Courier,monospace",
      "Georgia,Georgia,serif",
      "Impact,Charcoal,sans-serif",
      "Lucida Console,Monaco,monospace",
      "Lucida Sans Unicode,Lucida Grande,sans-serif",
      "Palatino Linotype,Book Antiqua,Palatino,serif",
      "Tahoma,Geneva,sans-serif",
      "Times New Roman,Times,serif",
      "Trebuchet MS,Helvetica,sans-serif",
      "Verdana,Geneva,sans-serif",
      "Gill Sans,Geneva,sans-serif",
    ];
    return fontsGroup[displayIndex];
  }

  constructor(_parent) {
    super(_parent);
    var self = this;

    let pos = 0;

    var propertiesTable = $("<table/>");
    self.paneParent.append(propertiesTable);

    this.table = function () {
      return propertiesTable;
    };

    this.init = function (options) {
      var _options = options || {
        expandable: true,
        clickableNodeNames: true,
      };
      propertiesTable.treetable(_options);
    };

    /* $("#foldersTable").treetable(
                  "loadBranch",
                  parentNode,
                  makeRow(data.tree[i])
                ); */

    let removedNodeMap = new Map(); //unloadBranch(node)

    /* this.hide = function (id) {
      var node = propertiesTable.treetable("node", id);
      //console.log(node.row);
      if (node) {
        removedNodeMap.set(id, node);
        node.row.hide();
        // propertiesTable.treetable("removeNode", id);
      }
    };

    this.show = function (id) {
      var node = removedNodeMap.get(id);
      if (node) {
        let row = node.row;
        row.show();
        //row.find("SPAN")[0].remove();
        //propertiesTable.treetable("loadBranch", node.parentNode(), row);
      }
    }; */

    this.hide = function (id) {
      propertiesTable.treetable("collapseNode", id);
      var node = propertiesTable.treetable("node", id);
      if (node) {
        const row = node.row;
        let parentRow = node.row.parent();
        if (!parentRow[0]) {
          parentRow = propertiesTable.find("TBODY");
        }
        removedNodeMap.set(id, { row, parentRow });
        row.detach();
      }
    };

    this.show = function (id) {
      const obj = removedNodeMap.get(id);
      if (!obj) return;
      const { row, parentRow } = obj;
      if (row) {
        const pos = parseInt(row.attr("data-tt-pos"));
        const rows = parentRow[0].children;
        const posLastRow = parseInt(
          $(rows[rows.length - 1]).attr("data-tt-pos")
        );
        if (pos < posLastRow) {
          for (let index = 0; index < rows.length; index++) {
            const element = rows[index];
            if (parseInt($(element).attr("data-tt-pos")) > pos) {
              parentRow[0].insertBefore(row[0], element);
              break;
            }
          }
        } else {
          parentRow.append(row);
        }
      }
    };

    this.getElementValueDataAttribute = function (id) {
      //"data-tt-id" val
      var row = null;
      var trElements = propertiesTable[0].getElementsByTagName("TR");
      for (var i = 0; i < trElements.length; ++i) {
        if (trElements[i].getAttribute("data-tt-id") == id) {
          row = trElements[i];
          break;
        }
      }
      if (row) {
        var children = row.children;
        if (children.length !== 2) return null;
        return $(children[1].children[0]);
      }
      return null;
    };

    //This is not safe. It requires unique names
    this.getTableRowByPropertyName = function (name) {
      var trElements = propertiesTable[0].getElementsByTagName("TR");
      for (var i = 0; i < trElements.length; ++i) {
        if (trElements[i].cells[0].innerText == name) {
          return $(trElements[i]);
        }
      }
      return null;
    };

    this.getTableRowByPropertyId = function (id) {
      //"data-tt-id" val
      var trElements = propertiesTable[0].getElementsByTagName("TR");
      for (var i = 0; i < trElements.length; ++i) {
        if (trElements[i].getAttribute("data-tt-id") == id) {
          return $(trElements[i]);
        }
      }
      return null;
    };

    this.getElementValueDataByPropertyName = function (name) {
      //"data-tt-id" val
      var row = null;
      var trElements = propertiesTable[0].getElementsByTagName("TR");
      for (var i = 0; i < trElements.length; ++i) {
        if (trElements[i].cells[0].innerText == name) {
          row = trElements[i];
          break;
        }
      }
      if (row) {
        var children = row.children;
        if (children.length !== 2) return null;
        return $(children[1].children[0]);
      }
      return null;
    };

    this.setFontSize = function (sz) {
      //param e.g "10px"
      propertiesTable.css("font-size", sz);
    };

    function makeRow(options) {
      if (options.type == undefined) {
        options.type = "span";
      }

      var disabled = "";
      if (options.disabled) disabled = "disabled";
      var checked = "";
      if (options.checked) checked = "checked";
      var _value = "";
      if (options.value !== undefined) _value = "value=" + options.value;

      var row = null;

      if (options.type == "text") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input type="text" ' +
            disabled +
            " " +
            _value +
            ' style="width:100%"/></td></tr>'
        );
      }
      if (options.type == "button") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input type="button" ' +
            disabled +
            ' value="..." /></td></tr>'
        );
      }
      if (options.type == "number") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input type="number" ' +
            disabled +
            " step =" +
            options.step +
            " min =" +
            options.min +
            " max=" +
            options.max +
            " " +
            _value +
            ' style="width:100%"/></td></tr>'
        );
      }
      if (options.type == "checkbox") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input ' +
            disabled +
            ' type="checkbox" style="width:100%" ' +
            checked +
            "/></td></tr>"
        );
      }
      if (options.type == "radio") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input ' +
            disabled +
            ' type="radio" name=' +
            options.group +
            ' style="width:100%" ' +
            checked +
            "/></td></tr>"
        );
      }
      if (options.type == "color") {
        var color = "#000000";
        if (options.value) color = Utility.colorNameToHex(options.value);
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><input ' +
            disabled +
            ' type="color" value=' +
            color +
            " /></td></tr>"
        );
      }

      /////////////////////
      if (options.type == "span") {
        return $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            '</td><td style="border: 0.5px solid grey;"><span style="width:100%"/></td></tr>'
        );
      }

      if (options.type == "select") {
        var row = $(
          '<tr><td style="border: 0.5px solid grey;">' +
            options.name +
            "</td></tr>"
        );
        var select = $("<select " + disabled + " />");
        if (options.selectorOptions) {
          for (var i = 0; i < options.selectorOptions.length; ++i) {
            select.append(
              $("<option>" + options.selectorOptions[i] + "</option>")
            );
          }
        }
        return row.append(
          $('<td style="border: 0.5px solid grey;">').append(select)
        );
      }

      return row;
    }

    this.addProperty = function (options) {
      var row = makeRow(options);
      if (!row) return null;
      var selector = null;
      row.attr("data-tt-pos", pos);
      pos++;
      row.attr("data-tt-id", options.id);
      if (options.parentId !== undefined)
        row.attr("data-tt-parent-id", options.parentId);
      if (options.branchId !== undefined)
        row.attr("data-tt-branch", options.branchId);
      if (
        options.type == "text" ||
        options.type == "number" ||
        options.type == "color" ||
        options.type == "checkbox" ||
        options.type == "radio"
      ) {
        selector = $(row[0].getElementsByTagName("INPUT"));
        selector.on("change", function () {
          if (options.fun) {
            if (options.type == "checkbox") {
              options.fun($(this)[0].checked);
            } else {
              options.fun($(this).val());
            }
          }
        });
      }
      if (options.type == "select") {
        selector = $(row[0].getElementsByTagName("SELECT"));
        selector.on("change", function () {
          if (options.fun) {
            options.fun($(this)[0].selectedIndex);
          }
        });
      }
      if (options.type == "button") {
        selector = $(row[0].getElementsByTagName("INPUT"));
        selector.on("click", function () {
          if (options.fun) {
            options.fun();
          }
        });
      }
      if (options.type == "span") {
        //default
        selector = $(row[0].getElementsByTagName("SPAN"));
      }
      propertiesTable.append(row);
      if (options.title) row.attr("title", options.title);
      return selector;
    };
  }
  header(caption) {
    var hdr = $("<table />");
    hdr.append(
      '<caption style="text-align:center; border-width:4px; color:black"><b>' +
        caption +
        "</b></caption>"
    );
    this.headerTableHead = $(
      '<thead style="background-color:lightgray">\
              <tr style="border-style:solid; border-width:0.5px">\
              <th style="border-style:none;"><label>Property</label></th>\
              <th style="border-style:none; text-align:right"><label style="margin-right:4px">Value</label></th>\
              </tr>\
              </thead>'
    );
    hdr.append(this.headerTableHead);

    return hdr;
  }
}
