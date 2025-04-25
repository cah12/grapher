/*
This file is essential to building configuration paths, dependencies and shiming. Scripts stored in or under the "src" directory are examined and built if necessary.
The easiest way to configure paths, dependencies and shiming is by using the include statement at the top of the file.
e.g.
"include ['dep1', 'depe2', ..., 'depn']";

class Derive extends Base {
...
}
In the above example, the include statement says the class "Derive"  depends on 'dep1', 'depe2', ..., 'depn'.
"include []";

class MyClass {
...
}
In the above example, the include statement says the class "MyClass"  has no dependencies. However, the include statement is still required so that the module gets shimmed and added to the path.
Once all includes are added, run "dependsBuild.js" script from node. That is, point the command prompt to the src folder and run "node dependsBuild.js".
Modules are requested in the define statement by the filename without the extension as shown below.
define(['mySource1', 'mySource2', 'mySource3', ...], function () {
....
})
Running the command node dependsBuild.js, generates the app.js file in the www folder.
In the tools folder there is a dependsBuild.bat file. This file is run by notepad++ with the alt b short cut.
 */
var append = false;
const fs = require("fs");
const Path = require("path");
const sep = Path.sep;
const appJsFilePath = ".." + sep + "www" + sep + "app.js";

var ids = [];
function processFile(path) {
  const text = fs.readFileSync(path, "utf8");
  text.split(/\r?\n/).forEach(function (line) {
    if (line.match("include")) {
      line = line.replace(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, ""); //remove comments
      line = line.trim();
      line = line.replace("include", "").replace(";", "");
      line = line.slice(1);
      line = line.slice(0, -1);
      line = line.trim();
      if (line[0] !== "[" || line[line.length - 1] !== "]") return;
      line = line.replace(sep, "");
      while (path.indexOf(sep) !== -1) path = path.replace(sep, "/");
      if (append) {
        fs.writeFileSync(
          "config.txt",
          "#" + line + "," + path,
          {
            flag: "a",
          },
          function () {}
        );
      } else {
        fs.writeFileSync("config.txt", line + "," + path, function () {});
        append = true;
      }
    }
  });
}
function buildTree(startPath) {
  fs.readdir(startPath, function (err, entries) {
    entries.forEach(function (file, ind) {
      const path = Path.join(startPath, file);
      if (fs.lstatSync(path).isDirectory()) {
        buildTree(path);
      } else if (file.match(/\.js$/)) {
        processFile(path);
      }
    });
  });
}
function writeWarning() {
  fs.writeFileSync(
    appJsFilePath,
    "/*This file was generated through the dependencies build proess. Do not modify or delete this file. If the file is accidentally modified or you suspect it is somehow corrupted, run build. It is always a good idea to run build before embarking on heavy troubleshooting.*/",
    function () {}
  );
}
var paths =
  "app: '../app', underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min'";
var shims =
  "{'static':{ deps:['miscObjects'] }, 'file':{ deps:['xlsx', 'upload'] }, 'utility':{ deps:['evaluateExp'] }, 'plot':{ deps:['static','widget','scaleWidget','utility', 'enumerator', 'miscObjects','painter','scaleDiv','interval','scaleMap','scaleWidget','transform','layout','scaleDraw','scaleEngine','pointMapper', 'graphic', 'enumerator'] }, 'plotItem':{ deps:['static', 'enumerator'] }, 'scaleMap':{ deps:['static','transform'] }, 'canvas':{ deps:['static'] }, 'curveFitter':{ deps:['static'] }, 'spline':{ deps:['static'] }, 'symbol':{ deps:['static','graphic'] }, 'seriesData':{ deps:['static','plotItem'] }, 'pointMapper':{ deps:['static'] }, 'pointData':{ deps:['static','seriesData'] }, 'scaleEngine':{ deps:['static'] }, 'scaleDraw':{ deps:['static','abstractScaleDraw'] }, 'widget':{ deps:['static','hObject'] }, 'widgetOverlay':{ deps:['static','widget'] }, 'scaleWidget':{ deps:['static','widget'] }, 'picker':{ deps:['underscore', 'static','widgetOverlay','pickermachine'] }, 'plotpicker':{ deps:['static','picker'] }, 'plotzoomer':{ deps:['plotpicker'] }, 'plotGrid':{ deps:['static','plotItem'] }, 'polarGrid':{ deps:['static','plotGrid'] },  'threeDgrid':{ deps:['static','plotGrid'] }, 'plotZoneItem':{ deps:['static', 'plotItem'] }, 'plotSpectrogram':{ deps:['static',  'conrec', 'plotRasterItem'] }, 'plotRasterItem':{ deps:['static', 'plotItem'] }, 'plotSpectroCurve':{ deps:['static','colorMap','plotItem','seriesData'] }, 'colorMap':{ deps:['static'] }, 'plotcurve':{ deps:['static','seriesData'] }, 'panner':{ deps:['static','hObject'] }, 'magnifier':{ deps:['static','hObject'] }, 'plotShapeItem':{ deps:['static','plotItem'] }, 'plotMarker':{ deps:['static','plotItem'] }, 'legend':{ deps:['static'] }, 'pickermachine':{ deps:['static','eventpattern'] }, 'widget':{ deps:['static','hObject'] }";
function writeRequireJsDotConfig() {
  fs.writeFileSync(
    appJsFilePath,
    "\nrequirejs.config ({baseUrl: 'lib', paths: {" +
      paths +
      "}, shim:" +
      shims +
      "}});",
    {
      flag: "a",
    },
    function () {}
  );
}
function writeRequireJs() {
  fs.writeFileSync(
    appJsFilePath,
    "\nrequirejs(['app/main']);",
    {
      flag: "a",
    },
    function () {}
  );
}
function writeAppJsFile() {
  writeWarning();
  writeRequireJsDotConfig();
  console.log("Wrote requirejs.config()... in www/app.js");
  console.log("Wrote requirejs()... in www/app.js");
  writeRequireJs();
}
function getSrcIdAndPaths(src) {
  src = src.replace("../www/app/src/", "").replace(".js", "");
  console.log(src);
  src = "../app/src/" + src;
  var res = src.split("/");
  var _srcId = res[res.length - 1];
  if (ids.indexOf(_srcId) !== -1) {
    throw "Unique source Id required";
  }
  ids.push(_srcId);
  return {
    srcId: _srcId,
    path: src,
  };
}
console.log("Scanned files and folders...");
buildTree(".." + sep + "www" + sep + "app" + sep + "src");
fs.readFile("config.txt", "utf8", function (err, data) {
  if (data !== "") {
    if (err) throw err;
    var dataArr = data.split("#");
    for (var i = 0; i < dataArr.length; ++i) {
      var depsAndPaths = dataArr[i].replace("],", "]#").split("#");
      var srcIdAndPaths = getSrcIdAndPaths(depsAndPaths[1]);
      shims =
        shims + "," + srcIdAndPaths.srcId + ": {deps: " + depsAndPaths[0] + "}";
      paths =
        paths + "," + srcIdAndPaths.srcId + ":'" + srcIdAndPaths.path + "'";
    }
    writeAppJsFile();
  } else {
    console.log("Did not find any dependency to build.");
  }
});
