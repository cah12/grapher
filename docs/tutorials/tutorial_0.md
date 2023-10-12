
js-QWT requires Node.js and uglifyjs. Thus, if you don't have them installed on your system, install them now. Download Node.js from {@link https://nodejs.org/en/download/} and check that it is properly installed by opening your command prompt, typing `node` and press Enter. You should see the Node.js version. Use node's package manager to install uglifyjs globally. At the command prompt, type `npm install uglify-js -g`.

Download js-QWT from {@link https://github.com/cah12/js-QWT.git/} and extract it in a folder of your choice. Assuming that you extract to a folder jsQwtProjects, you should see the structure shown below in your file explorer.

    jsQwtProjects
      js-QWT-master
        tools
          build.bat
          build.js
          dependsBuild.bat
          dependsBuild.js
          r.js
        www
          app
            src
              myPlot.js
            main.js
          css
          images
          lib
          app.js
          index.html

Finally, navigate to index.html and open it in your browser. Your browser should display something similar to the screenshot below.
![The default plot!](./img/plot1.png "The default plot")

Next: {@tutorial child_1}

