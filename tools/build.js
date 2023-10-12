({
	optimize: "none",
	optimizeCss: "standard",
	/*Uncomment the waitSeconds for complex builds. You can increase the value as necessary.*/
	//waitSeconds: 14,
	keepBuildDir: true,
	appDir: "../www",
    mainConfigFile: "../www/app.js",
    dir: "../www-built",
	modules: [
        {
            name: "app",
			exclude: [
				/\.ini/
			]
        } 
	]
})

