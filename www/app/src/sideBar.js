"include []"
'use strict';

class SideBar {
    constructor(parent, plotDiv, gridItems, anchorPosition) { //
        var self = this;
        this.plotDiv = plotDiv;
        var sideBarWidth = 20; //As percentage
        self.sideBarVisible = false;
        var m_anchorPosition = anchorPosition || "right";

        var m_html = null; // background-color:#ffc9ae;

        var sideBarDlg =
            $('<div class="grid-container noprint" style="position: absolute; border: 1px solid lightgray;"/>');

        parent.append(sideBarDlg);
        sideBarDlg.css('bottom', 0);
        sideBarDlg.css('top', 0);

        class GridItem {
            constructor() {
                this.visible = true;
                this.headerElement = null;
                this.bodyElement = null;
                this.element = null;
                this.anchorPosition = "";
            }
        }
        var gridItemsList = [];
        var numOfVisibleGridItems = 0;

        for (var i = 0; i < gridItems; ++i) {
            var gridItem = new GridItem();
            gridItem.anchorPosition = m_anchorPosition;
            gridItem.element = $('<div class="grid-item"></div>');
            sideBarDlg.append(gridItem.element);
            gridItem.headerElement = $('<div class="grid-item-header"></div>');
            gridItem.element.append(gridItem.headerElement);
            gridItem.bodyElement = $('<div class="grid-item-body"></div>');
            gridItem.element.append(gridItem.bodyElement);
            gridItemsList.push(gridItem);

            ++numOfVisibleGridItems;
        }

        this.hideAllGridItems = function () {
            for (var i = 0; i < gridItems; ++i) {
                this.doShowGridItem(i, false);
            }
        }



        this.setHeaderElement = function (gridIndex, val) {
            gridItemsList[gridIndex].headerElement.css("height", val + "px");
            this.setGridItemHeigth();
        }

        this.setGridItemHeigth = function () {//divide available height evenly
            var availableHeight = parseInt(sideBarDlg.css('height'));
            var gridItemHeightPercent = (1 / numOfVisibleGridItems) * 100;
            for (var i = 0; i < gridItemsList.length; ++i) {
                if (!gridItemsList[i].visible)
                    continue;
                gridItemsList[i].element.css("height", gridItemHeightPercent + "%");
                var itemHeight = parseInt(gridItemsList[i].element.css("height"));
                var headerHeight = parseInt(gridItemsList[i].headerElement.css("height"));
                var gridItemBodyHeightPercent = (1 - (headerHeight) / itemHeight) * 100;
                gridItemsList[i].bodyElement.css("height", gridItemBodyHeightPercent + "%");
            }
        }

        this.doShowGridItem = function (gridIndex, on) {
            if (gridItemsList[gridIndex].visible == on)
                return;
            if (on) {
                if (!this.sideBarVisible)
                    this.showSidebar(true);
                gridItemsList[gridIndex].element.show();
                ++numOfVisibleGridItems;
            } else {
                gridItemsList[gridIndex].element.hide();
                --numOfVisibleGridItems;
                if (numOfVisibleGridItems === 0)
                    this.showSidebar(false);
            }
            gridItemsList[gridIndex].visible = on;
            this.setGridItemHeigth();
            Static.trigger("showGridItem", [m_anchorPosition, gridIndex, on]);
            return numOfVisibleGridItems;
        }

        this.doIsGridItemVisible = function(gridIndex){
            return gridItemsList[gridIndex].visible;
        }


        this.gridItem = function (gridIndex) {
            if (gridIndex < gridItemsList.length)
                return gridItemsList[gridIndex];
            return null;
        }

        this.gridItemCount = function () {
            return gridItemsList.length;
        }

        this.setGridItemHeigth();
        sideBarDlg.css("width", (sideBarWidth) + "%");

        this.isSideBarVisible = function () {
            return self.sideBarVisible;
        }

        this.sideBarWidth = function () {
            return sideBarWidth;
        }

        this.setTop = function (top) {
            sideBarDlg.css('top', top);
        }

        /*none	Default value. Specifies no border
        hidden	The same as "none", except in border conflict resolution for table elements
        dotted	Specifies a dotted border
        dashed	Specifies a dashed border
        solid	Specifies a solid border
        double	Specifies a double border
        groove	Specifies a 3D grooved border. The effect depends on the border-color value
        ridge	Specifies a 3D ridged border. The effect depends on the border-color value
        inset	Specifies a 3D inset border. The effect depends on the border-color value
        outset	Specifies a 3D outset border. The effect depends on the border-color value
        initial	Sets this property to its default value. Read about initial
        inherit	Inherits this property from its parent element. Read about inherit*/
        this.setBorderStyle = function (style) {
            sideBarDlg.css('border-style', style);
        }

        this.setBorderWidth = function (width) {
            sideBarDlg.css('border-width', width);
        }

        this.setBackgroundColor = function (color) {
            sideBarDlg.css('background-color', color);
        }

        this.html = function () {
            return sideBarDlg;
        }

        //var visible = false;
        // Static.bind("beforePrint", function () {
        //     // if (self.sideBarVisible) {
        //     //     visible = true;
        //     //     self.showSidebar(false);
        //     // }

        // })

        // Static.bind("afterPrint", function () {
        //     // if (visible) {
        //     //     visible = false;
        //     //     self.showSidebar(true);
        //     // }
        // });



        this.anchorPosition = function () {
            return m_anchorPosition;
        }

        this.getIndexFromHeaderElement = function (headerElement) {
            for (var i = 0; i < self.gridItemCount(); ++i) {
                if ((self.gridItem(i).headerElement[0].offsetTop == headerElement.offsetTop) &&
                    (self.gridItem(i).headerElement[0].innerText == headerElement.innerText)) {
                    return i;
                }
            }
            return -1;
        }

        this.hideGridItemWithHeaderElement = function (headerElement) {
            //headerElement = headerElement[0];
            for (var i = 0; i < self.gridItemCount(); ++i) {
                if ((self.gridItem(i).headerElement[0].offsetTop == headerElement.offsetTop) &&
                    (self.gridItem(i).headerElement[0].innerText == headerElement.innerText)) {
                    return self.showGridItem(i, false);
                }
            }
            return -1;
        }

        var tbarDiv = null;
        Static.bind("toolBarResized", function (e, tbDiv, changeOfHeight) {
            tbarDiv = tbDiv;
            //maintain the 2px vertical spacing between toolbar and sidebar
            self.html().css("top", parseFloat(tbarDiv.css("height")) + 2)
        });


        //var plotDiv = null;
        Static.bind("resize", function () {
            //leftSidebar visible
            if (m_anchorPosition === "left" && self.isSideBarVisible()) {
                plotDiv.css("left", parseFloat(self.html().css("width")));
            }
            //Recalculate gridItems height     
            self.setGridItemHeigth();

        });

        // Static.bind("plotDivResized", function (e, el, changeInHeight) {
        //     plotDiv = el;
        // });

        this.hideAllGridItems();
        //this.showSidebar(false)
        sideBarDlg.hide();

    }

    showSidebar(on) {
        if (this.isSideBarVisible() == on)
            return;
        this.sideBarVisible = on;
        //Static.trigger("showSidebar", on);
        if (on) {
            this.html().show();
            if (this.anchorPosition() == "right") {
                this.html().css("right", 0.5 + "%");
            } else if (this.anchorPosition() == "left") {
                this.html().css("left", 0.5 + "%");
            }
        } else {
            this.html().hide();
        }
        var plotDivWidthAsPercentage = (parseFloat(this.plotDiv.css("width")) / parseFloat(this.plotDiv.parent().css("width"))) * 100;
        if (on) {
            if (this.anchorPosition() == "right") {
                this.plotDiv.css("width", (plotDivWidthAsPercentage - this.sideBarWidth()) + "%");
            }
            else if (this.anchorPosition() == "left") {
                this.plotDiv.css("left", this.sideBarWidth() + "%");
                this.plotDiv.css("width", (plotDivWidthAsPercentage - this.sideBarWidth()) + "%");
            }
            //this.showGridItem(1, true)
        } else {
            this.plotDiv.css("width", (plotDivWidthAsPercentage + this.sideBarWidth()) + "%");
            if (this.anchorPosition() == "left") {
                this.plotDiv.css("left", 0 + "%");
            }
        }
        Static.trigger("showSidebar", [this.anchorPosition(), on]);
    }

    showGridItem(gridIndex, on) {
        this.doShowGridItem(gridIndex, on);
    }

    isGridItemVisible(gridIndex) {
        return this.doIsGridItemVisible(gridIndex);
    }
}
