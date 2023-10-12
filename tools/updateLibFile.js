/*
This utility propogates any change made to a library file to all projects.
Usage:
command
node updateLibFile.js <fileNameOfModifiedFile>
or run updateLibFile.bat (preferable)
 */
const fs = require('fs');
const Path = require('path');

var _replaceStr = "";

function existsCb(exists) {
    process.exitCode = 0;
    if (exists) {
		var startPath = process.env.projFldPath;
		var cwd = process.cwd();
		startPath = startPath.replace("'", '').replace('"', '');
		startPath = startPath.replace("'", '').replace('"', '');
		var str = cwd.replace(startPath, '');
		var depth = str.split('\\').length;
		if(depth == 0)
			depth = str.split('/').length;
		var _startPath = "";
		for(var i =0; i<depth; ++i){
			_startPath += '../';
			_replaceStr += '..\\';
		}
		_startPath += 'Projects';
		buildTree(_startPath);        
    } else {
        console.log("Please enter a valid filename.");
        process.exitCode = 1;
    }
}

var filename = process.argv.slice(2)[0] || "";
if (filename.indexOf('.js') == -1)
    filename = filename + '.js';
var pathToModifiedFile = process.cwd().replace('tools', 'www\\lib\\' + filename);
fs.exists(pathToModifiedFile, existsCb);

function copyFile(source, target, cb) {
    var cbCalled = false;
    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

function buildTree(startPath) {
    fs.readdir(startPath, function (err, entries) {
		entries.forEach(function (file, ind) {
            const path = Path.join(startPath, file);
			if (fs.lstatSync(path).isDirectory()) {
                buildTree(path);
            } else if (file.match(/\.js$/)) {
                if (path.slice(-9 - (filename.length)) == '\\www\\lib\\' + filename) {
                    var p = path.replace(_replaceStr, '');
                    if (pathToModifiedFile.indexOf(p) == -1) {
						console.log(path);
                        copyFile(pathToModifiedFile, path, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }

                }
            }
        });
    });
}
