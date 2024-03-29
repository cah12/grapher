"include ['basicWatch']";

class Watches {
    constructor(plot) {
        var _watchElements = [];
		
		this.watchElements = function(){
			return _watchElements;
		}
	
		//plot.rv = new Rulers(plot)
			
		
		function addwatch(watch, options, disabled) {
			plot.rv.addToWatchList(watch)
			_watchElements.push(options)
			if (disabled) {
				watch.setEnable(false)
			}
		}

		//m_watch = new WatchAreaBelowCurve();

		addwatch(new WatchCurveName(plot.rv), {
			text: "Curve name",
			tooltip: "Name of the curve that is the subject of watches.",
			checkboxState: "checked"
		})
		addwatch(new WatchLeftRulerPosition(plot.rv), {
			text: "Left ruler position",
			tooltip: "Current position of the left ruler.",
			checkboxState: "checked"
		})
		addwatch(new WatchRightRulerPosition(plot.rv), {
			text: "Right ruler position",
			tooltip: "Current position of the right ruler.",
			checkboxState: "checked"
		})
		addwatch(new WatchBottomRulerPosition(plot.rv), {
			text: "Bottom ruler position",
			tooltip: "Current position of the bottom ruler."
		}, true)
		addwatch(new WatchTopRulerPosition(plot.rv), {
			text: "Top ruler position",
			tooltip: "Current position of the top ruler."
		}, true)
		addwatch(new WatchSlope(plot.rv), {
			text: "Slope at left ruler",
			tooltip: "Slope (gradient) in the curve at the point where the left ruler intersects the curve."
		}, true)
		
		plot.watchAreaBelowCurve = new WatchAreaBelowCurve(plot.rv);
		addwatch(plot.watchAreaBelowCurve, {
			text: "Area below curve",
			tooltip: "Area bounded by the curve, right ruler, x-axis and left ruler."
		}, true)
		addwatch(new WatchVolumeOfRevolution(plot.rv), {
			text: "Volume of revolution(X)",
			tooltip: "Volume generated by a 360 degrees rotation about the x-axis of the area bounded by the curve, right ruler, x-axis and left ruler."
		}, true);
		
		
    }
}