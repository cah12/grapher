Let's take a look at index.html before we actually get into adding the toolbar. Currently, index.html is as shown below.

    <!--index.html-->

    <!DOCTYPE html>
    <html lang="en">

    <head>
        <title>Grapher</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.12/jquery.mousewheel.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/7.2.0/math.min.js"></script>
        <link href="css/layout.css" rel="stylesheet">
        <script data-main="app" src="lib/require.js"></script>
    </head>

    <body>
        <!-- Example (1) of a single plot taking up all of the screen -->
        <div id="plotDiv" class="plotContainer"></div>

        <!-- Example (2) of a single plot taking up 60% of width and 60% of height of the screen -->
        <!-- <div style="position: absolute; left: 20%; top:20%; width:60%; height: 60%;">
            <div id="plotDiv" class="plotContainer"></div>
        </div> -->

        <!-- Example (3) of two plots stacked each taking up approx half of the screen height-->
        <!-- <div style="position: absolute; width:100%; height: 49%;">
            <div id="plotDiv" class="plotContainer"></div>
        </div>
        <div style="position: absolute; top:49%; width:100%; height: 49%;">
            <div id="plotDiv2" class="plotContainer"></div>
        </div>	 -->

        <!-- Example (4) of two plots side-by-side each taking up approx. half of the screen width-->
        <!-- <div style="position: absolute; width:50%; height: 98%;">
            <div id="plotDiv" class="plotContainer"></div>
        </div>
        <div style="position: absolute; left:50%; width:50%; height: 98%;">
            <div id="plotDiv2" class="plotContainer"></div>
        </div> -->
    </body>

    </html>

Looking at the active code in the body, we note that, so far, we have been operating under Example (1) - A single plot taking up the entire screen. Since we need to provide space for our toolbar, our plot cannot take up the entire screen. What we need is a modified version of Example (2). Comment out the line `<div id="plotDiv" class="plotContainer"></div>` and add the code below.

    <div style="position: absolute; left: 1%; top:1%; width:10%; height: 100%;">
		<button id="add" style="width:100%;">Add Curve</button>
		<button id="remove" style="width:100%;">Remove Curves</button>
	</div>
	<div style="position: absolute; left: 12%; top:0%; width:86%; height: 98%;">
		<div id="plotDiv" class="plotContainer"></div>		
	</div>

Save the changes and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot6.png "The plot from the few lines of code above")

At this stage, our simple toolbar has two buttons. The first button adds a curve and the second button removes all curves. Now revised myPlot.js so that it is as shown below. 

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer', 'panner', 'plotcurve', 'legend']";

    class MyPlot extends Plot {
        constructor(title) {
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.        
            Utility.minorGridLines(grid, true);
            const magnifier = new Magnifier(self);
            //const zoomer = new PlotZoomer(self);
            const panner = new Panner(self);
            panner.setCursor("move");            

            $("#add").on("click", function () {
                Utility.prompt("Enter a function",
                    "x^2", function (fn) {
                        const curve2 = new Curve(Utility.generateCurveName(self));
                        curve2.setPen(new Misc.Pen(Utility.randomColor()));
                        const samples2 = Utility.makeSamples({ fx: fn, lowerX: -10, upperX: 10 });
                        curve2.setSamples(samples2);
                        curve2.attach(self);
                        return true;
                    }, "small")
            })

            $("#remove").on("click", function () {
                var L = self.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
                L.forEach(function (curve) {
                    curve.detach();
                });
            })

            self.insertLegend(new Legend());
            self.enableLegend(true);
        }
    }

Let's upgrade our toolbar. Modify index.html so that it is as show below.

    /*index.html*/

    <!DOCTYPE html>
    <html lang="en">

    <head>
        <title>js-QWT</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.12/jquery.mousewheel.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/7.2.0/math.min.js"></script>
        <link href="css/layout.css" rel="stylesheet">
        <script data-main="app" src="lib/require.js"></script>
    </head>

    <body>
        <div class="noprint" style="position: absolute; left: 1%; top:1%; width:10%; height: 100%;">
            <button id="add" style="width:100%;">Add Curve</button>
            <button id="remove" style="width:100%;">Remove Curves</button>
            <div style="width:100%; border: solid 1px; margin-top:2px; margin-bottom: 2px;">
                <div style="text-align:center">Mode</div>
                <input id="auto" style="margin-left: 8px"; type="radio" name="mode" value="Auto" checked>
                <label for="auto">Auto</label><br>
                <input id="pan" style="margin-left: 8px"; type="radio" name="mode" value="Pan">
                <label for="pan">Pan</label><br>
                <input id="zoom" style="margin-left: 8px"; type="radio" name="mode" value="Zoom">
                <label for="zoom">Zoom</label>
            </div>
            <button id="print" style="width:100%;">Print</button>
        </div>
        <div style="position: absolute; left: 12%; top:0%; width:86%; height: 98%;">
            <div id="plotDiv" class="plotContainer"></div>
        </div>

        <!-- Example (1)  of a single plot taking up all of the screen -->
        <!-- <div id="plotDiv" class="plotContainer"></div> -->

        <!-- Example (2) of a single plot taking up 60% of width and 60% of height of the screen -->
        <!-- <div style="position: absolute; left: 20%; top:20%; width:60%; height: 60%;">
            <div id="plotDiv" class="plotContainer"></div>		
        </div> -->

        <!-- Example (3) of two plots stacked each taking up approx half of the screen height-->
        <!-- <div style="position: absolute; width:100%; height: 49%;">
            <div id="plotDiv" class="plotContainer"></div>		
        </div>
        <div style="position: absolute; top:49%; width:100%; height: 49%;">
            <div id="plotDiv2" class="plotContainer"></div>		
        </div>	 -->

        <!-- Example (4) of two plots side-by-side each taking up approx. half of the screen width-->
        <!-- <div style="position: absolute; width:50%; height: 98%;">
            <div id="plotDiv" class="plotContainer"></div>		
        </div>
        <div style="position: absolute; left:50%; width:50%; height: 98%;">
            <div id="plotDiv2" class="plotContainer"></div>		
        </div> -->
    </body>

    </html>

Save the changes and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot7.png "The plot from the few lines of code above")

Our toolbar now has a radio button group for setting the mode and a button for printing. 

Revised myPlot.js so that it is as shown below. Refresh the browser and test the toolbar. All should be fine.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer', 'panner', 'plotcurve', 'legend']";

    class MyPlot extends Plot {
        constructor(title) {
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.        
            Utility.minorGridLines(grid, true);
            const magnifier = new Magnifier(self);
            const zoomer = new PlotZoomer(self);
            zoomer.setEnabled(false);
            const panner = new Panner(self);
            panner.setEnabled(false);
            panner.setCursor("move");

            $("#add").on("click", function () {
                Utility.prompt("Enter a function",
                    "x^2", function (fn) {
                        const curve2 = new Curve(Utility.generateCurveName(self));
                        curve2.setPen(new Misc.Pen(Utility.randomColor()));
                        const samples2 = Utility.makeSamples({ fx: fn, lowerX: -10, upperX: 10 });
                        curve2.setSamples(samples2);
                        curve2.attach(self);
                        return true;
                    }, "small")
            })

            $("#remove").on("click", function () {
                var L = self.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
                L.forEach(function (curve) {
                    curve.detach();
                });
            })

            $('input[type="radio"]').on('change', function (e) {
                switch (this.value) {
                    case "Auto": {
                        Utility.setAutoScale(self, true);
                        panner.setEnabled(false);
                        zoomer.setEnabled(false);                    
                        break;
                    }
                    case "Pan": {
                        Utility.setAutoScale(self, false);
                        panner.setEnabled(true);
                        zoomer.setEnabled(false);
                        break;
                    }
                    case "Zoom": {
                        Utility.setAutoScale(self, false);
                        panner.setEnabled(false);
                        zoomer.setEnabled(true);
                        zoomer.setZoomBase(zoomer.scaleRect());
                        break;
                    }
                }
            });
            
            Static.bind("rescaled", function (e, auto) {
                if(!auto){ 
                    $("#auto")[0].checked = false;
                }            
            });

            $("#print").on("click", function () {
                self.print();
            })

            self.insertLegend(new Legend());
            self.enableLegend(true);
        }
    }

Back: {@tutorial child_2}
