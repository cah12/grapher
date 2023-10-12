
We start this exercise by identifying an issue. Navigate to the index.html file and open it the browser. Now resize the browser window and note if the plot updates. The plot should not update. 
Navigate to the main.js file, open it, and add the line `plot.setAutoReplot(true);`. The main.js should look as shown below

    require([ /*Add dependencies, in quotes, to the array*/       
            'plot'
            ], function(){  
            
        /* You can modify this file. However, do not rename it. */
        const plot = new Plot();
        plot.setAutoReplot(true);	
    })
Save the changes to main.js, refresh and resize the browser. The plot should be updating on browser window resize.
This demonstrate that `autoReplot` feature of Plot defaults to false. 

Would'nt it be nice to have a Plot that behaves like we want it to. We can get such a Plot by subclassing (extending) and specializing it to our taste. Lets do that.
We navigate to myPlot.js (in src folder) and open it. It should look as shown below.
    
    /*myPlot.js*/
    
    "include ['plot']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
        }
    }
Apart from the `"include ['plot']";` line at the top, this is typical ES6 subclassing. The `"include ['plot']";` line, instructs the build utility (to be discussed later) that myPlot.js is dependent on plot.js. The build utility looks, recursively, at everything in the src folder during a build. Be sure to put your scripts in the src folder or in a folder within the src folder.
Now lets try to use our MyPlot type. We navigate to main.js and make changes so that it is as shown below.
    
    /*main.js*/

    require([ /*Add dependencies, in quotes, to the array*/       
            'myPlot'
            ], function(){  
            
        /* You can modify this file. However, do not rename it. */
        const plot = new MyPlot();    
    })

If we save the changes and refresh the browser we'll get an error that looks like: (`require.js:168 Uncaught Error: Script error for: myPlot`).
This indicates that the presence of a module under the src folder is necessary but not sufficient for it to be successfully required by the requirejs. We need to run the dependsBuild utility that ships wit js-QWT everytime we add a new module under the src folder or change its dependencies by modifying the include statement. Doing so, updates app.js and, thus, requirejs becomes aware of the new module and its dependicies. 
Now that we know this, let us run dependsBuild.bat (it is in the tools folder). The output should be simillar to below.
    
    Scanning files and folders...
    myPlot
    Wrote requirejs.config()... in www/app.js
    Wrote requirejs()... in www/app.js
    config.txt was deleted
    Press any key to continue . . .

The important part of this output is line 2. This indicates that requirejs is aware of the myPlot module. Now return to the browser and refresh it. All should be well. All except for the auto re-plotting. Lets return to myPlot.js and make auto re-plotting a feature of MyPlot. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
            const self = this;
            self.setAutoReplot(true);
        }
    }
Save the changes to myPlot.js, refresh and resize the browser. The plot should be updating on browser window resize.

Let's make our plot more graph-like. Let's add a grid. Modify myPlot.js so that it is as below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.
        }
    }
Since our modifications include a change to the include statement at the top of the file, we run dependsBuild.bat. Save the changes to myPlot.js and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot2.png "The plot from the few lines of code above")

What!!. No minor gridlines. Yes, minor gridlines are not enabled by default. Revised myPlot.js so that it is as shown below. 

    "include ['plot', 'plotGrid']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.
            grid.enableXMin(true); //enable x gridlines
            grid.enableYMin(true); //enable y gridlines
        }
    }
Save the changes and refresh the browser. We should have something similar to the screenshot below.

![Plot, The plot from the few lines of code above](./img/plot3.png "The plot from the few lines of code above")

Alternatively, we can enable minor gridlines by using

    Utility.minorGridLines(grid, true); //enable x and y minor gridlines
instead of

    grid.enableXMin(true); //enable x gridlines
    grid.enableYMin(true); //enable y gridlines

Be sure to require the utility module in main.js before calling Utility methods.

Let's make our plot interactive. We'll add a magnifer. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.        
            Utility.minorGridLines(grid, true);
            const magnifier = new Magnifier(self);
        }
    }
Remember to run dependsBuild.bat. 
Once the browser is refreshed, we should be able to interact with the plot. Roll the mousewheel forward and backward and observe the scale. Press the mouse right button and move the mouse up and down and observe the scale. Hold down the SHIFT key and press the + or - key and observe the scale.

Let's do more. We'll add a zoomer. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer']";

    class MyPlot extends Plot{
        constructor(title){
            super(title);
            const self = this;
            self.setAutoReplot(true);

            const grid = new PlotGrid(); //create a grid.
            grid.attach(self); //Associate the grid with the plot.        
            Utility.minorGridLines(grid, true);
            const magnifier = new Magnifier(self);
            const zoomer = new PlotZoomer(self);
        }
    }    
Remember to run dependsBuild.bat.
Once the browser is refreshed, we should be able to interact with the plot. Press the mouse left button and drag it in an approximate diagonal direction. You should see a zoom rectangle in the grid. Releasing the mouse causes the scales to update (zoom). 

Let's do even more. We'll add a panner. Revised myPlot.js so that it is as shown below.

    /*myPlot.js*/

    "include ['plot', 'plotGrid', 'magnifier', 'plotzoomer', 'panner']";

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
        }
    }    
Remember to run dependsBuild.bat. Additionally, note the line `const zoomer = new PlotZoomer(self);` is commented out. This is because the default configuration of the Panner and Zoomer rely on the left mouse button for interraction. 

Once the browser is refreshed, we should be able to pan. Press the mouse left button and drag it.

One final adjustment to the Panner code. Let's set the cursor use during panning. Add the line

    panner.setCursor("move");
    
to the existing code, save, refresh the browser and test. 

It would be improper to close this exercise without mentioning that PlotGrid, Magnifier, PlotZoomer and Panner are all classes that could be subclassed to add special behaviour. 


Next: {@tutorial child_2}

Back: {@tutorial tutorial_0}