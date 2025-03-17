"include ['static', 'modalDlg']";

class Trash extends ModalDlg {
  constructor(plot) {
    const options = {
      title: "Recycle bin",
      spaceRows: true,
      //dialogSize: "modal-md",
    };
    super(options);
    const self = this;
    const _plot = plot;
    let trashCollection = [];

    this.selector("ok").hide();

    this.addRow(['<div class="col-sm-12">No items found.</div>'], "noTrash");
    this.addRow(
      [
        '<div class="col-sm-12"><div style="overflow:auto"><table id="trashTable"></table></div></div>',
      ],
      "trash"
    );

    this.addFooterElement(
      '<button id="empty" type="button" class="btn btn-default" data-dismiss="modal">Empty bin</button>'
    );

    this.addHandler("empty", "click", function () {
      for (let i = 0; i < trashCollection.length; i++) {
        let e = trashCollection[i];
        e = null;
        trashCollection[i] = null;
      }
      trashCollection = [];
    });

    this.addFooterElement(
      '<button id="restore" type="button" class="btn btn-primary" data-dismiss="modal">Restore</button>'
    );

    this.addHandler("restore", "click", function () {
      const entries = self.selector("trashTable").find("INPUT");
      let modifiedCollection = [];
      for (let i = 0; i < entries.length; i++) {
        if (!entries[i].checked) {
          modifiedCollection.push(trashCollection[i]);
        } else {
          let existCurve = plot.findPlotItem(trashCollection[i].title());
          if (existCurve) {
            if (
              confirm(
                `The plot already has a plot item with a title "${trashCollection[
                  i
                ].title()}".\n\nReplace the plot item in the plot.`
              )
            ) {
              existCurve.detach();
            } else {
              modifiedCollection.push(trashCollection[i]);
              continue;
            }
          }
          //console.log(existCurve);
          trashCollection[i].attach(plot);
        }
      }
      //plot.autoRefresh();
      trashCollection = modifiedCollection;
    });

    this.initDlg = function () {
      if (trashCollection.length < 1) {
        self.selector("noTrash").show();
        self.selector("trash").hide();
        self.selector("empty").hide();
        self.selector("restore").hide();
      } else {
        self.selector("empty").show();
        self.selector("noTrash").hide();
        self.selector("trash").show();
        self.selector("trashTable").empty();

        for (let i = 0; i < trashCollection.length; i++) {
          let entry = $(
            "<tr></td><td><label><input class='selectedForTrash' type='checkbox' style='width:30px'>" +
              trashCollection[i].title() +
              "</input></label></td></tr>"
          );
          self.selector("trashTable").append(entry);
        }

        self.selector("restore").hide();
        $(".selectedForTrash")
          .off("change")
          .on("change", function () {
            const entries = self.selector("trashTable").find("INPUT");
            for (let i = 0; i < entries.length; i++) {
              if (entries[i].checked) {
                self.selector("restore").show();
                return;
              }
            }
            self.selector("restore").hide();
          });
      }
    };

    this.trash = function (plotItem) {
      trashCollection.push(plotItem);
      plotItem.detach();
    };

    this.trashCb = function () {
      this.showDlg();
    };
  }

  initializeDialog() {
    this.initDlg();
  }
}
