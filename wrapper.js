/*Add the name of the folder to be made static to the "folder" variable.*/

const express = require('express');
const path = require('path');
const app = express();

const sep = path.sep;

const folder = "www-built";

app.use(express.static(path.join(__dirname, "public"+sep+folder)))
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
	console.log("Server started on PORT "+PORT);
});
