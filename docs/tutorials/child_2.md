In this exercise we'll add curves to the plot we developed in the previous exercise. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer', 'panner', 'plotcurve']";

    class MyPlot extends Plot{
        constructor(title){
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

            const curve1 = new Curve("curve_1");
            curve1.setPen(new Misc.Pen("red", 2, "dash"))
            const samples1 = [new Misc.Point(-10, 8), new Misc.Point(5, 30), new Misc.Point(10, 90)];
            curve1.setSamples(samples1);
            curve1.attach(self);

            const curve2 = new Curve("curve_2"); 
            curve2.setPen(new Misc.Pen(Utility.randomColor()));
            const samples2 = Utility.makeSamples({fx: "x^2+2*x+1", lowerX: -15, upperX: 10, threeD: false});
            curve2.setSamples(samples2);
            curve2.attach(self);
        }
    }

Remember to run dependsBuild.bat. Save the changes and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot4.png "The plot from the few lines of code above")

Go ahead and interact with the plot. Magnify, pan, etc. Comment out the panner code and uncomment the zoomer code and test zooming.

It is important to note that Plot has an autoscale feature that is on as default. Magnifying, panning and zooming turns autoscaling off. Autoscaling ensures that scales chosen are such that the full extent of all visible curves attached to the plot are shown. Now, refresh the browser and take care not to Magnify, pan or zoom. Make a mental note of the scales. Comment out the line `curve2.attach(self);` so that only curve1 is attached to the plot. Refresh the browser and note the scale. Uncomment the line `curve2.attach(self);` and add the line `curve2.setVisible(false);`. Refresh the browser and note the scale. Finally, remove the line `curve2.setVisible(false);` so that myPlot.js is as shown above.

Let's represent our two curves on a legend. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer', 'panner', 'plotcurve', 'legend']";

    class MyPlot extends Plot{
        constructor(title){
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

            const curve1 = new Curve("curve_1");
            curve1.setPen(new Misc.Pen("red", 2, "dash"))
            const samples1 = [new Misc.Point(-10, 8), new Misc.Point(5, 30), new Misc.Point(10, 90)];
            curve1.setSamples(samples1);
            curve1.attach(self);

            const curve2 = new Curve("curve_2"); 
            curve2.setPen(new Misc.Pen(Utility.randomColor()));
            const samples2 = Utility.makeSamples({fx: "x^2+2*x+1", lowerX: -15, upperX: 10, threeD: false});
            curve2.setSamples(samples2);
            curve2.attach(self);

            self.insertLegend(new Legend());
            self.enableLegend(true);
        }
    }

Remember to run dependsBuild.bat. Save the changes and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot5.png "The plot from the few lines of code above")

Clicking on a legend item toggles visibility off and on. Go ahead and test. Point your mouse to a legend item and left click it. Observe the scales adjusting. If you accidentally magnified, panned or zoomed, the scales won't adjust. Refresh the browser and repeat the test.

Next: {@tutorial child_3} 

Back: {@tutorial child_1}