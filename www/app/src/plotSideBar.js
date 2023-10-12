"include ['sideBar']"
'use strict';

class PlotSideBar extends SideBar{
    constructor(plot, plotDiv) {//
		super(plotDiv.parent(), plotDiv, 2, "left");
		var self = this;
        var m_plot = plot;
		this.plot = function(){
			return m_plot;
		}
		
		Static.bind("paneClose", function(e, headerElement){
		   self.hideGridItemWithHeaderElement(headerElement);
		}); 
		
	}
	
	showSidebar(on) {
		if(this.isSideBarVisible() == on)
			return;			
		super.showSidebar(on);		
		this.plot().autoRefresh();           
	}

showGridItem (gridIndex, on) {
      this.doShowGridItem (gridIndex, on);
   }

	
}
