"include ['sideBar']";
"use strict";

class InfoSideBar extends SideBar {
  constructor(plot, plotDiv) {
    //
    super(plotDiv.parent(), plotDiv, 1, "right");
    var self = this;
    var m_plot = plot;
    this.plot = function () {
      return m_plot;
    };
    Static.bind("paneClose", function (e, headerElement) {
      if (self.anchorPosition() === "right") {
        plot.tbar.setButtonCheck(plot.sBar, false);
      }
      //self.hideGridItemWithHeaderElement(headerElement);
    });
    this.setHeaderElement(0, 40);
  }

  showGridItem(gridIndex, on) {
    this.doShowGridItem(gridIndex, on);
  }

  showSidebar(on) {
    if (this.isSideBarVisible() == on) return;
    super.showSidebar(on);

    this.plot().autoRefresh();
  }
}
