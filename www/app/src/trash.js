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
        '<div class="col-sm-12"><div style="max-height: 200px; overflow-y: auto;"><table id="trashTable"></table></div></div>',
      ],
      "trash",
    );

    this.addFooterElement(
      '<button id="empty" type="button" class="btn btn-default" data-dismiss="modal">Empty bin</button>',
    );

    this.addHandler("empty", "click", function () {
      for (let i = 0; i < trashCollection.length; i++) {
        let e = trashCollection[i];
        if (e.lines) {
          e.lines.geometry.dispose();
          e.lines = null;
        }
        e = null;
        trashCollection[i] = null;
      }
      trashCollection = [];
    });

    this.addFooterElement(
      '<button id="restore" type="button" class="btn btn-primary" data-dismiss="modal">Restore</button>',
    );

    this.addHandler("restore", "click", function () {
      const dlg = self.getDlgModal();
      dlg[0].style.display = "flex"; // Show modal
      // dlg.addClass("wait-cursor-active");
      Utility.progressWait2(true);
      setTimeout(function () {
        // self.closeDlg();

        try {
          trashCollection = self.doRestore(trashCollection, plot);
          Utility.progressWait2(false);
          dlg[0].style.display = "none"; // Hide modal
          // dlg.removeClass("wait-cursor-active");
        } catch (error) {
          Utility.progressWait2(false);
          dlg[0].style.display = "none"; // Hide modal
          // dlg.removeClass("wait-cursor-active");
          console.log(error);
        }
      }, 5);
    });

    this.addFooterElement(
      '<button id="selectAll" type="button" class="btn btn-primary">Select all</button>',
    );

    this.addHandler("selectAll", "click", function () {
      const entries = self.selector("trashTable").find("INPUT");
      for (let i = 0; i < entries.length; i++) {
        entries[i].checked = true;
      }
      self.selector("selectAll").hide();
      self.selector("restore").show();
    });

    this.initDlg = function () {
      if (trashCollection.length < 1) {
        self.selector("noTrash").show();
        self.selector("trash").hide();
        self.selector("empty").hide();
        self.selector("restore").hide();
        self.selector("selectAll").hide();
      } else {
        self.selector("empty").show();
        self.selector("noTrash").hide();
        self.selector("trash").show();
        self.selector("selectAll").show();
        self.selector("trashTable").empty();

        for (let i = 0; i < trashCollection.length; i++) {
          let entry = $(
            "<tr></td><td><label><input class='selectedForTrash' type='checkbox' style='width:30px'>" +
              trashCollection[i].title() +
              "</input></label></td></tr>",
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
                self.selector("selectAll").hide();
                return;
              }
            }
            self.selector("restore").hide();
            self.selector("selectAll").show();
          });
      }
      // self.setModalMaxHeight();
    };

    this.trash = function (plotItem) {
      //Utility.progressWait2(true);
      trashCollection.push(plotItem);
      plotItem.detach();
      //Utility.progressWait2(false);
    };

    this.trashCb = function () {
      this.showDlg();
    };

    // $(":checkbox").on("change", function () {
    //   if (this.checked) {
    //     self.selector("restore").show();
    //   } else {
    //     self.selector("restore").hide();
    //   }
    // });
  }

  doRestoreAsync(trashCollection, plot) {
    return new Promise((resolve, reject) => {
      try {
        trashCollection = this.doRestore(trashCollection, plot);
        resolve(trashCollection);
      } catch (error) {
        reject(error);
      }
    });
  }

  doRestore(trashCollection, plot) {
    const self = this;
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
              `The plot already has a plot item with a title "${trashCollection[i].title()}".\n\nReplace the plot item in the plot.`,
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
    return trashCollection;
  }

  initializeDialog() {
    this.initDlg();
  }

  // setModalMaxHeight() {
  //   const self = this;
  //   const modalElement = self.selector("trashTable")[0];
  //   // 1. Calculate available height (viewport minus padding)
  //   const viewportHeight = window.innerHeight;
  //   const maxHeight = viewportHeight * 0.5; // 90% of viewport

  //   // 2. Set the max-height property
  //   modalElement.style.maxHeight = maxHeight + "px";
  //   modalElement.style.overflowY = "auto"; // Ensure scrollability
  // }
}
