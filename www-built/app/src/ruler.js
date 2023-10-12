

"include ['static', 'plotMarker']" 
/////////////////Ruler - subclass of PlotMarker//////////start
//Ruler.inheritsFrom( PlotMarker );
class Ruler extends PlotMarker{
//Define the Ruler constructor
//function Ruler(plot, name, lineStyle) {
    constructor(plot, name, lineStyle){
	// Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    
    //PlotMarker.call(this, name);
    super(name);
    this._picker = 0 
    this._pos = Number.MAX_VALUE; 
    this._rightClickMenu = 0;
	
	
    
    this._rulers = null;

    if(lineStyle == PlotMarker.LineStyle.VLine || lineStyle == PlotMarker.LineStyle.HLine)
     {
        this.setLineStyle(lineStyle);
        this.setLinePen(new Misc.Pen("blue"));
	
     }
    
    this.attach(plot);
    //console.log(plot, 25)

    this.setMouseTracking = function (enable) {
        this._picker.setMouseTracking(enable);
    }
}

/*scaleRect(){
        var rect = null;
        if ( this.plot() )
        {
            var xs = this.plot().axisScaleDiv( this.xAxis() );
            var ys = this.plot().axisScaleDiv( this.yAxis() );

            rect = new Misc.Rect( xs.lowerBound(), ys.lowerBound(),
                xs.range(), ys.range() );
            rect = rect.normalized();
        }

        return rect;
    }*/
     
}
//Ruler.prototype = Object.create(PlotMarker.prototype);
// Set the "constructor" property to refer to Ruler
//Ruler.prototype.constructor = Ruler;

Ruler.prototype.toString = function () {
	return '[Ruler]';
}

Ruler.prototype.setPicker = function (pick) {
	if(!pick)
        return false;
    //if(_picker)
        //delete _picker;
    this._picker = pick;
    return true;
}

Ruler.prototype.setZoomerSearch = function(on)
{
    //_picker.setControlFlag(Picker::ZoomerSearch, on);
    this._picker.setControlFlag(MPicker.DisplayChange.ZoomerSearch, on);
    this._picker.initZoomer();
}

Ruler.prototype.setPannerSearch = function(on)
 {
//     _picker->setControlFlag(Picker::PannerSearch, on);
	this._picker.setControlFlag(MPicker.DisplayChange.PannerSearch, on);     
}

//Ruler.prototype.setLockAt = function(val)
//{
     /*this._picker.setControlFlag(MPicker.DisplayChange.Locked, lock);
     this._picker.clearDragCursor()*/     
     //console.log("position: "+ val)
//}

Ruler.prototype.setLock = function(lock)
{
     this._picker.setControlFlag(MPicker.DisplayChange.Locked, lock);
     this._picker.clearDragCursor()
}

Ruler.prototype.lock = function()
{
     return this._picker.controlFlag(MPicker.DisplayChange.Locked);
}

Ruler.prototype.setTrackingTextStyle = function(trackingTextStyle)
{
     this._picker.setTrackingTextStyle(trackingTextStyle);
}

Ruler.prototype.trackingTextStyle = function()
{
     return this._picker.trackingTextStyle();
}

Ruler.prototype.setTrackingTextFont = function(f)
{
     this._picker.setTrackerFont(f);
}

Ruler.prototype.trackingTextFont = function()
{
     return this._picker.trackerFont();
}

Ruler.prototype.setTrackingTextColor = function(c)
{
    var font = this._picker.trackerFont();
    font.fontColor = c;
    this._picker.setTrackerFont(font);
}

Ruler.prototype.trackingTextColor = function()
{
     return this._picker.trackerFont().color;
}

Ruler.prototype.validatePosition = function(min, max)
{

}

Ruler.prototype.dragCursorShape = function()
{
     return this._picker.dragCursorShape();
}

Ruler.prototype.setDragCursorShape = function(shape)
{
     this._picker.setDragCursorShape(shape);
}

Ruler.prototype.setRightClickMenu = function(menu)
{
//     if(_rightClickMenu)
//     {
//         delete _rightClickMenu;
//         if(!menu)
//             menu = new DummyMenu(this);
//     }
//     _rightClickMenu = menu;
}
////////////////////////////////////////////////////////
/////////////////RulerV - subclass of PlotMarker//////////start
//RulerV.inheritsFrom( Ruler );
class RulerV extends Ruler{
//Define the RulerV constructor
//function RulerV(plot, name) {
    constructor(plot, name, rulerGroup){
	// Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    //Ruler.call(this, plot, name, VLine);
    super(plot, name, PlotMarker.LineStyle.VLine);
    if(rulerGroup)
        this._rulers = rulerGroup
    //if(plot){
	    this._picker = new PickerV(plot, this._pos, this);
	    //this._picker.setEnabled_2(true)
	//}
    }
}
//RulerV.prototype = Object.create(Ruler.prototype);
// Set the "constructor" property to refer to Ruler
//RulerV.prototype.constructor = RulerV;



RulerV.prototype.setPosition = function(pos)
{
    this._pos = pos;
    this._picker._rulerPos = pos
	this.setXValue(this._pos);    
}

/*RulerV.prototype.setLockAt = function(val)
{
     this.setPosition(val)
     this.setLock(true)
}*/

////////////////////////////////////
/////////////////RulerH - subclass of PlotMarker//////////start
//RulerH.inheritsFrom( Ruler );
class RulerH extends Ruler{
//Define the RulerV constructor
//function RulerH(plot, name) {
    constructor(plot, name, rulerGroup){
	// Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    //Ruler.call(this, plot, name, HLine);
    super(plot, name, PlotMarker.LineStyle.HLine);
    
    if(rulerGroup)
        this._rulers = rulerGroup
    //if(plot){
	    this._picker = new PickerH(plot, this._pos, this);
	    //this._picker.setEnabled_2(true)
	//}
    }
}
//RulerH.prototype = Object.create(Ruler.prototype);
// Set the "constructor" property to refer to Ruler
//RulerH.prototype.constructor = RulerH;


RulerH.prototype.setPosition = function(pos)
{
    this._pos = pos;
    this._picker._rulerPos = pos
	this.setYValue(this._pos);
}

/*RulerH.prototype.setLockAt = function(val)
{
     this.setPosition(val)//new Misc.Point(0, val))
     this.setLock(true)

}*/
////////////////////////////////////



