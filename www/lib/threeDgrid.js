"use strict";

class ThreeJs {
  constructor(canvas, resizeCb = null) {
    const self = this;
    this.lines;

    let p_limit = 0.7;

    let numOfYlines = 10;
    let numOfXlines = 10;
    self._reverseContrast = false;
    let scene = new THREE.Scene();

    this.getScene = function () {
      return scene;
    };

    // const al = new THREE.SpotLight(0x0000ff, 1);
    // al.position.set(p_limit, p_limit, 1);
    // scene.add(al);

    this.getPlimit = function () {
      return p_limit;
    };

    //y - green x-red z- blue
    //const axesHelper = new THREE.AxesHelper(6);
    //axesHelper.rotateX(-Math.PI / 2);

    const aspect = canvas.width / canvas.height;

    function getGeometry(positions) {
      let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
      let geometry = new THREE.BufferGeometry();
      geometry.dynamic = true;
      geometry.setAttribute("position", positionAttribute);
      return geometry;
    }

    function getXaxisLinePosition() {
      const positions = [];
      //Generate Axes
      positions.push(-p_limit);
      positions.push(0);
      positions.push(0);
      ///////////////
      positions.push(1);
      positions.push(0);
      positions.push(0);

      //X arrow
      positions.push(1);
      positions.push(0);
      positions.push(0);
      /////////
      positions.push(0.95);
      positions.push(0);
      positions.push(0.02);

      positions.push(1);
      positions.push(0);
      positions.push(0);
      /////////
      positions.push(0.95);
      positions.push(0);
      positions.push(-0.02);

      return positions;
    }

    function getYaxisLinePosition() {
      const positions = [];
      /* //Generate Axes
      positions.push(-p_limit);
      positions.push(0);
      positions.push(0);
      ///////////////
      positions.push(1);
      positions.push(0);
      positions.push(0); */

      positions.push(0);
      positions.push(-p_limit);
      positions.push(0);
      ///////////////
      positions.push(0);
      positions.push(1);
      positions.push(0);

      /* positions.push(0);
      positions.push(0);
      positions.push(-p_limit);
      ///////////////
      positions.push(0);
      positions.push(0);
      positions.push(1);     */

      //Y arrow
      positions.push(0);
      positions.push(1);
      positions.push(0);
      /////////
      positions.push(0.02);
      positions.push(0.95);
      positions.push(0);

      positions.push(0);
      positions.push(1);
      positions.push(0);
      /////////
      positions.push(-0.02);
      positions.push(0.95);
      positions.push(0);

      return positions;
    }

    function getZaxisLinePosition() {
      const positions = [];

      positions.push(0);
      positions.push(0);
      positions.push(-p_limit);
      ///////////////
      positions.push(0);
      positions.push(0);
      positions.push(1);

      //Z arrow
      positions.push(0);
      positions.push(0);
      positions.push(1);
      /////////
      positions.push(0.02);
      positions.push(0);
      positions.push(0.95);

      positions.push(0);
      positions.push(0);
      positions.push(1);
      /////////
      positions.push(-0.02);
      positions.push(0);
      positions.push(0.95);

      return positions;
    }
    function getAxesLinesPosition() {
      const positions = [];
      //Generate Axes
      positions.push(-p_limit);
      positions.push(0);
      positions.push(0);
      ///////////////
      positions.push(1);
      positions.push(0);
      positions.push(0);

      positions.push(0);
      positions.push(-p_limit);
      positions.push(0);
      ///////////////
      positions.push(0);
      positions.push(1);
      positions.push(0);

      positions.push(0);
      positions.push(0);
      positions.push(-p_limit);
      ///////////////
      positions.push(0);
      positions.push(0);
      positions.push(1);

      //X arrow
      positions.push(1);
      positions.push(0);
      positions.push(0);
      /////////
      positions.push(0.95);
      positions.push(0);
      positions.push(0.02);

      positions.push(1);
      positions.push(0);
      positions.push(0);
      /////////
      positions.push(0.95);
      positions.push(0);
      positions.push(-0.02);

      //Y arrow
      positions.push(0);
      positions.push(1);
      positions.push(0);
      /////////
      positions.push(0.02);
      positions.push(0.95);
      positions.push(0);

      positions.push(0);
      positions.push(1);
      positions.push(0);
      /////////
      positions.push(-0.02);
      positions.push(0.95);
      positions.push(0);

      //Z arrow
      positions.push(0);
      positions.push(0);
      positions.push(1);
      /////////
      positions.push(0.02);
      positions.push(0);
      positions.push(0.95);

      positions.push(0);
      positions.push(0);
      positions.push(1);
      /////////
      positions.push(-0.02);
      positions.push(0);
      positions.push(0.95);

      return positions;
    }

    function getBoundLinesPosition() {
      const positions = [];

      //Draw front bound plane
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);

      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);

      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);

      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);

      //Draw back bound plane
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);

      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(p_limit);

      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(p_limit);

      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(p_limit);

      //Draw bottom bound plane
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);

      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(-p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(-p_limit);

      //Draw top bound plane
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);
      ////////////
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(p_limit);

      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(p_limit);
      ////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(p_limit);

      return positions;
    }

    function getMajGridLinesPosition(data) {
      const positions = [];

      //Draw x gridlines
      //major
      const xMajPaintTicks = data.xMajPaintTicks;
      for (let i = 0; i < xMajPaintTicks.length; i++) {
        const p = xMajPaintTicks[i].p;

        positions.push(p);
        positions.push(-p_limit);
        positions.push(0);
        //////////////3
        positions.push(p);
        positions.push(p_limit);
        positions.push(0);
      }
      //Permanent Edge
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(0);
      //////////////3
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(0);
      ////
      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(0);
      //////////////3
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(0);

      const yMajPaintTicks = data.yMajPaintTicks;
      for (let i = 0; i < yMajPaintTicks.length; i++) {
        const p = yMajPaintTicks[i].p;
        positions.push(-p_limit);
        positions.push(p);
        positions.push(0);
        ///////////////////
        positions.push(p_limit);
        positions.push(p);
        positions.push(0);
      }
      //Permanent Edge
      positions.push(-p_limit);
      positions.push(p_limit);
      positions.push(0);
      ///////////////////
      positions.push(p_limit);
      positions.push(p_limit);
      positions.push(0);
      ///
      positions.push(-p_limit);
      positions.push(-p_limit);
      positions.push(0);
      ///////////////////
      positions.push(p_limit);
      positions.push(-p_limit);
      positions.push(0);

      return positions;
    }

    function getMinGridLinesPosition(data) {
      const positions = [];
      //minor
      const xMinPaintTicks = data.xMinPaintTicks;
      for (let i = 0; i < xMinPaintTicks.length; i++) {
        const p = xMinPaintTicks[i];

        positions.push(p);
        positions.push(-p_limit);
        positions.push(0);
        //////////////3
        positions.push(p);
        positions.push(p_limit);
        positions.push(0);
      }

      const yMinPaintTicks = data.yMinPaintTicks;
      for (let i = 0; i < yMinPaintTicks.length; i++) {
        const p = yMinPaintTicks[i];
        positions.push(-p_limit);
        positions.push(p);
        positions.push(0);
        positions.push(p_limit);
        positions.push(p);
        positions.push(0);
      }
      return positions;
    }

    const clippingLimit = p_limit + 0.000001;
    const clipPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), clippingLimit), //left
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), clippingLimit), //right
      new THREE.Plane(new THREE.Vector3(0, 1, 0), clippingLimit), //bottom
      new THREE.Plane(new THREE.Vector3(0, -1, 0), clippingLimit), //top
      new THREE.Plane(new THREE.Vector3(0, 0, 1), clippingLimit), //back
      new THREE.Plane(new THREE.Vector3(0, 0, -1), clippingLimit), //front
    ];

    const helper0 = new THREE.PlaneHelper(clipPlanes[0], 2, 0xff0000);
    const helper1 = new THREE.PlaneHelper(clipPlanes[1], 2, 0xff0000);
    const helper2 = new THREE.PlaneHelper(clipPlanes[2], 2, 0xff0000);
    const helper3 = new THREE.PlaneHelper(clipPlanes[3], 2, 0xff0000);
    const helper4 = new THREE.PlaneHelper(clipPlanes[4], 2, 0xff0000);
    const helper5 = new THREE.PlaneHelper(clipPlanes[5], 2, 0xff0000);

    //scene.add(helper0);
    //scene.add(helper1);
    //scene.add(helper2);
    //scene.add(helper3);
    //scene.add(helper4);
    //scene.add(helper5);

    const loader = new FontLoader();
    const fontSize = 0.06;
    self.textMeshZ = null;
    self.textMeshY = null;
    self.textMeshX = null;

    self.labelMeshes = [];
    self.zLabelMeshes = [];

    this.xyGridGroup = new THREE.Group();

    this.generateAxesLines = function (data) {
      if (this.xAxisLines) {
        this.xAxisLines.geometry.dispose();
        this.yAxisLines.geometry.dispose();
        this.zAxisLines.geometry.dispose();
        scene.remove(this.xyGridGroup);
        //scene.remove(this.xAxisLines);
        // scene.remove(this.yAxisLines);
        scene.remove(this.zAxisLines);
      }

      //create a group and add the two cubes
      //These cubes can now be rotated / scaled etc as a group

      let geometry = getGeometry(getXaxisLinePosition(data));
      this.xAxisLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#636363",
        })
      );
      this.xyGridGroup.add(this.xAxisLines);
      //scene.add(this.xAxisLines);

      geometry = getGeometry(getYaxisLinePosition(data));
      this.yAxisLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#636363",
        })
      );
      this.xyGridGroup.add(this.yAxisLines);
      //scene.add(this.yAxisLines);

      scene.add(this.xyGridGroup);

      geometry = getGeometry(getZaxisLinePosition(data));
      this.zAxisLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#636363",
        })
      );
      scene.add(this.zAxisLines);

      loader.load(
        "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/fonts/helvetiker_bold.typeface.json",
        function (font) {
          const _majorPen = self._reverseContrast ? "#333333" : "#aaaaaa";
          if (self.textMeshX) {
            self.textMeshX.material.setValues({ color: _majorPen });
            self.textMeshY.material.setValues({ color: _majorPen });
            self.textMeshZ.material.setValues({ color: _majorPen });
          } else {
            const textGeometryY = new TextGeometry("Y", {
              font: font,
              size: fontSize,
              depth: 0.0001,
              curveSegments: 12,
            });
            // console.log(textGeometry);

            const textMaterial = new THREE.MeshBasicMaterial({
              color: _majorPen,
            });
            self.textMeshY = new THREE.Mesh(textGeometryY, textMaterial);
            self.textMeshY.position.y = 1;
            //self.textMeshY.position.x = -fontSize * 0.4;
            self.textMeshY.position.z = -fontSize * 0.4;
            self.textMeshY.rotateY(Math.PI / 2);
            self.textMeshY.rotateZ(Math.PI / 2);
            //scene.add(self.textMeshY);
            self.xyGridGroup.add(self.textMeshY);

            const textGeometryX = new TextGeometry("X", {
              font: font,
              size: fontSize,
              depth: 0.0001,
              curveSegments: 12,
            });

            self.textMeshX = new THREE.Mesh(textGeometryX, textMaterial);
            //self.textMeshX.position.y = -fontSize * 0.5;
            self.textMeshX.position.z = -fontSize * 0.5;
            self.textMeshX.position.x = 1;
            self.textMeshX.rotateX(Math.PI / 2);
            //scene.add(self.textMeshX);
            self.xyGridGroup.add(self.textMeshX);

            const textGeometryZ = new TextGeometry("Z", {
              font: font,
              size: fontSize,
              depth: 0.0001,
              curveSegments: 12,
            });

            self.textMeshZ = new THREE.Mesh(textGeometryZ, textMaterial);
            self.textMeshZ.position.z = 1;

            self.textMeshZ.geometry.computeBoundingBox();
            self.textMeshZ.geometry.translate(
              -self.textMeshZ.geometry.boundingBox.max.x / 2,
              0,
              0
            );

            scene.add(self.textMeshZ);
          }

          //////////Labels/////////////

          const labelTextMaterial = new THREE.MeshBasicMaterial({
            color: "#636363",
          });
          for (let i = 0; i < self.labelMeshes.length; i++) {
            self.labelMeshes[i].geometry.dispose();
            //scene.remove(self.labelMeshes[i]);
            self.xyGridGroup.remove(self.labelMeshes[i]);
          }
          for (let i = 0; i < self.zLabelMeshes.length; i++) {
            self.labelMeshes[i].geometry.dispose();
            scene.remove(self.zLabelMeshes[i]);
          }

          for (let i = 0; i < data.xMajPaintTicks.length; i++) {
            const element = data.xMajPaintTicks[i];
            const g = new TextGeometry(`${element.s}`, {
              font: font,
              size: fontSize * 0.5,
              depth: 0.0001,
              curveSegments: 12,
            });

            const m = new THREE.Mesh(g, labelTextMaterial);

            m.geometry.computeBoundingBox();
            m.geometry.translate(-m.geometry.boundingBox.max.x / 2, 0, 0);
            m.position.x = element.p;
            self.labelMeshes.push(m);

            //scene.add(m);
            self.xyGridGroup.add(m);
          }

          for (let i = 0; i < data.yMajPaintTicks.length; i++) {
            const element = data.yMajPaintTicks[i];
            const g = new TextGeometry(`${element.s}`, {
              font: font,
              size: fontSize * 0.5,
              depth: 0.0001,
              curveSegments: 12,
            });

            const m = new THREE.Mesh(g, labelTextMaterial);

            m.geometry.computeBoundingBox();
            m.geometry.translate(0, -m.geometry.boundingBox.max.y / 2, 0);
            m.position.y = element.p;
            self.labelMeshes.push(m);

            //scene.add(m);
            self.xyGridGroup.add(m);
          }

          for (let i = 0; i < data.zMajPaintTicks.length; i++) {
            const element = data.zMajPaintTicks[i];
            const g = new TextGeometry(`${element.s}`, {
              font: font,
              size: fontSize * 0.5,
              depth: 0.0001,
              curveSegments: 12,
            });

            const m = new THREE.Mesh(g, labelTextMaterial);

            m.geometry.computeBoundingBox();
            m.geometry.translate(0, 0, -m.geometry.boundingBox.max.y / 2);
            m.position.z = element.p;
            self.zLabelMeshes.push(m);

            scene.add(m);
          }
        }
      );
    };

    function transform(s, Map) {
      const s1 = Map.s1();
      const s2 = Map.s2();
      const pl = self.getPlimit();
      return ((s - s1) * 2 * pl) / (s2 - s1) - pl;
    }

    function transformZ(s, z_min, z_max) {
      const s1 = z_min;
      const s2 = z_max;
      const pl = self.getPlimit();
      return ((s - s1) * 2 * pl) / (s2 - s1) - pl;
    }

    this.doDrawMesh = function (plotItem, xMap, yMap) {
      const numberOfPoints = 60;
      let sx1 = xMap.s1();
      const sx2 = xMap.s2();
      let sy1 = yMap.s1();
      const sy2 = yMap.s2();
      const xStep = (sx2 - sx1) / (numberOfPoints - 1);
      const yStep = (sy2 - sy1) / (numberOfPoints - 1);

      const parser = math.parse(plotItem.fn);
      const scope = new Map();

      const pl = self.getPlimit();
      const geometry = new THREE.PlaneGeometry(
        transform(sx2, xMap) - transform(sx1, xMap),
        transform(sy2, yMap) - transform(sy1, yMap),
        numberOfPoints,
        numberOfPoints
      ); // Adjust size and subdivisions as needed
      const vertices = geometry.attributes.position.array;

      for (let i = 0; i <= numberOfPoints; i++) {
        for (let j = 0; j <= numberOfPoints; j++) {
          const x = (i / numberOfPoints) * (sx2 - sx1) - sx2; // Scale x to range -5 to 5
          const y = (j / numberOfPoints) * (sy2 - sy1) - sy2; // Scale y to range -5 to 5
          scope.set("x", x);
          scope.set("y", y);

          const z = transformZ(parser.evaluate(scope), 0, 200);
          vertices[(i * (numberOfPoints + 1) + j) * 3 + 2] = z; // Update z-coordinate of vertex
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      //console.log(typeof plotItem.alpha());

      const _alpha = (1 / 255) * plotItem.alpha();

      if (plotItem.lines) {
        plotItem.lines.geometry.dispose();
        plotItem.lines.geometry = geometry;
        plotItem.lines.material.setValues({ opacity: _alpha });
      } else {
        plotItem.lines = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: Utility.RGB2HTML(plotItem.colorMap().color2()),
            // wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: _alpha,
            clippingPlanes: clipPlanes,
          })
        );
      }

      console.log(plotItem.lines.visible);

      scene.add(plotItem.lines);
    };

    this.doDrawSeries = function (plotItem, positions) {
      const geometry = getGeometry(positions);

      if (plotItem.lines) {
        plotItem.lines.geometry.dispose();
        plotItem.lines.geometry = geometry;
      } else {
        plotItem.lines = new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({
            color: Utility.RGB2HTML(plotItem.colorMap().color2()),
            clippingPlanes: clipPlanes,
          })
        );
      }

      scene.add(plotItem.lines);
    };

    this.generateBoundLines = function (data) {
      let geometry = getGeometry(getBoundLinesPosition(data));

      // let indexPairs = getIndexPairs();
      // geometry.setIndex(indexPairs);
      this.boundLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial()
      );

      // console.log(self.lines);

      scene.add(this.boundLines);
      //scene.rotateX(-Math.PI / 2);
    };

    this.generateMajGridLines = function (data) {
      self.gridLinesData = data;
      let geometry = getGeometry(getMajGridLinesPosition(data));

      positionXYgrid(data, geometry);

      self.majLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: data.majColor,
          clippingPlanes: clipPlanes,
        })
      );

      //scene.add(self.majLines);
      this.xyGridGroup.add(self.majLines);
    };

    this.generateMinGridLines = function (data) {
      self.gridLinesData = data;

      let geometry = getGeometry(getMinGridLinesPosition(data));
      positionXYgrid(data, geometry);

      self.minLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: data.minColor,
          clippingPlanes: clipPlanes,
        })
      );

      //scene.add(self.minLines);
      this.xyGridGroup.add(self.minLines);
    };

    scene.rotateX(-Math.PI / 2);

    this.updateMajGridLines = function (data) {
      let geometry = getGeometry(getMajGridLinesPosition(data));
      positionXYgrid(data, geometry);

      self.majLines.material.setValues({
        color: data.majColor,
        clippingPlanes: clipPlanes,
      });

      self.majLines.geometry.dispose();
      self.majLines.geometry = geometry;
    };

    this.updateMinGridLines = function (data) {
      let geometry = getGeometry(getMinGridLinesPosition(data));
      positionXYgrid(data, geometry);

      self.minLines.material.setValues({
        color: data.minColor,
        clippingPlanes: clipPlanes,
      });

      self.minLines.geometry.dispose();
      self.minLines.geometry = geometry;
    };

    if (!canvas) {
      return;
    }

    //scene.fog = new THREE.FogExp2(0x000000, 0.6);
    let camera = new THREE.OrthographicCamera(
      -1 * aspect,
      1 * aspect,
      1,
      -1, // canvas.height / -2,
      0.01,
      200
    );
    //camera.position.z = 1;
    camera.position.set(p_limit, p_limit, 1);
    //camera.lookAt(scene.position);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });

    renderer.localClippingEnabled = true;

    renderer.setSize(canvas.width, canvas.height);

    const orbit = new OrbitControls(camera, $("#centralDiv")[0]);

    // const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.enableZoom = false;
    function positionXYgrid(data, geometry) {
      /* if (data.minZ >= 0) {
        geometry.translate(0, 0, -p_limit);
      } else if (data.maxZ <= 0) {
        geometry.translate(0, 0, p_limit);
      } else {
        geometry.translate(0, 0, transformZ(0, data.minZ, data.maxZ));
      } */
      if (data.minZ >= 0) {
        self.xyGridGroup.position.z = -p_limit;
      } else if (data.maxZ <= 0) {
        self.xyGridGroup.position.z = p_limit;
      } else {
        self.xyGridGroup.position.z = transformZ(0, data.minZ, data.maxZ);
      }
    }

    //orbit.autoRotate = true;
    //orbit.update();

    function animate() {
      resizeCb(canvas);
      renderer.setSize(canvas.width, canvas.height);
      orbit.update();

      if (self.textMeshZ) {
        self.textMeshZ.lookAt(camera.position);
      }

      for (let i = 0; i < self.zLabelMeshes.length; i++) {
        self.zLabelMeshes[i].lookAt(camera.position);
      }

      renderer.render(scene, camera);
    }

    //renderer.setAnimationLoop(animate);

    this.startAnimation = function () {
      renderer.setAnimationLoop(animate);
    };

    this.stopAnimation = function () {
      renderer.setAnimationLoop(null);
    };

    this.generateBoundLines();
  }

  /* setXgridLines(num) {
    if (this.xGridLines === num || num < 2) {
      return;
    }
    this.xGridLines = num;
    this.updateGridLines();
  } */

  /* setYgridLines(num) {
    if (this.yGridLines === num || num < 2) {
      return;
    }
    this.yGridLines = num;
    this.updateGridLines();
  } */

  /* setZgridLines(num) {
    if (this.zGridLines === num || num < 2) {
      return;
    }
    this.zGridLines = num;
    this.updateGridLines();
  } */

  visibility() {
    return this.lines.visible;
  }

  setVisibility(visible) {
    this.lines.visible = visible;
  }
}
/**
 * @extends PlotGrid
 */
class ThreeDGrid extends PlotGrid {
  /**
   *
   * @param {String} tle Title of grid
   */
  constructor(tle, panner = null, magnifier = null) {
    super(tle);
    const self = this;

    this.threeDGrid = false;

    this._reverseContrast = false;

    this.grid = null;

    this.panner = panner;
    this.magnifier = magnifier;

    self.detachedCurves = [];

    //this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

    this.reverseContrast = function (on) {
      if (!this.grid) {
        return;
      }
      this._reverseContrast = on;
      this.grid._reverseContrast = on;
      this.plot().autoRefresh();
    };
    //console.log(plot);
    this.threeDgrid = null;
    this.canvas = null;

    Static.bind("itemAttached", function (e, plotItem, on) {
      const plot = plotItem.plot();
      const autoReplot = plot.autoReplot();
      plot.setAutoReplot(false);

      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectrogram) {
        if (on && self.threeDGridAttached) {
          plotItem.originalDraw = plotItem.draw;
          plotItem.draw = self.draw2;
        } else if (!on && plotItem.originalDraw) {
          plotItem.draw = plotItem.originalDraw;
        }
      }
      if (plotItem.rtti == PlotItem.RttiValues.Rtti_PlotSpectroCurve) {
        if (on && self.threeDGridAttached) {
          plotItem.originalDrawSeries = plotItem.drawSeries;
          plotItem.drawSeries = self.drawSeries;
        } else if (!on && plotItem.originalDrawSeries) {
          plotItem.drawSeries = plotItem.originalDrawSeries;
        }
      }
      plot.setAutoReplot(autoReplot);
      plot.autoRefresh();
    });

    Static.bind("visibilityChange", function (e, curve, on) {
      if (!curve.lines) return;
      curve.lines.visible = on;
    });

    function transform(s, Map) {
      const s1 = Map.s1();
      const s2 = Map.s2();
      const pl = self.grid.getPlimit();
      return ((s - s1) * 2 * pl) / (s2 - s1) - pl;
    }

    function transformZ(s, z_min, z_max) {
      const s1 = z_min;
      const s2 = z_max;
      const pl = self.grid.getPlimit();
      return ((s - s1) * 2 * pl) / (s2 - s1) - pl;
    }

    this.drawSeries = function (xMap, yMap, from, to) {
      var ctx = this.getContext();

      var painter = new PaintUtil.Painter(ctx);

      //if ( !painter || this.dataSize() <= 0 )
      if (this.dataSize() <= 0) return;

      if (to < 0) to = this.dataSize() - 1;

      if (from < 0) from = 0;

      if (from > to) return;

      const samples = this.data().samples();
      const positions = [];
      for (let i = 1; i < samples.length; i++) {
        const pt0 = samples[i - 1];
        positions.push(transform(pt0.x, xMap));
        positions.push(transform(pt0.y, yMap));
        positions.push(transformZ(pt0.z, this.minZ, this.maxZ));
        const pt = samples[i];
        positions.push(transform(pt.x, xMap));
        positions.push(transform(pt.y, yMap));
        positions.push(transformZ(pt.z, this.minZ, this.maxZ));
      }

      self.grid.doDrawSeries(this, positions);
      //console.log(positions);

      //this.drawDots(painter, xMap, yMap, /*canvasRect,*/ from, to);
      painter = null;
    };

    this.draw2 = function (xMap, yMap) {
      var ctx = this.getContext();

      //console.log(this.isVisible());

      self.grid.doDrawMesh(this, xMap, yMap);
    };

    var m_base = 10;
    this.base = function () {
      return m_base;
    };

    this.contains = function (interval, value) {
      if (!interval.isValid()) return false;

      if (
        Utility.m3FuzzyCompare(value, interval.minValue(), interval.width()) < 0
      )
        return false;

      if (
        Utility.m3FuzzyCompare(value, interval.maxValue(), interval.width()) > 0
      )
        return false;

      return true;
    };

    this.strip = function (ticks, interval) {
      if (!interval.isValid() || ticks.length === 0) return [];

      if (
        this.contains(interval, ticks[0]) &&
        this.contains(interval, ticks[ticks.length - 1])
      ) {
        return ticks;
      }

      var strippedTicks = [];
      for (var i = 0; i < ticks.length; i++) {
        if (this.contains(interval, ticks[i])) strippedTicks.push(ticks[i]);
      }
      return strippedTicks;
    };

    this.align = function (interval, stepSize) {
      var x1 = interval.minValue();
      var x2 = interval.maxValue();

      if (-Number.MAX_VALUE + stepSize <= x1) {
        var x = ScaleArithmetic.floorEps(x1, stepSize);
        if (Utility.m3FuzzyCompare(x1, x, stepSize) !== 0) x1 = x;
      }

      if (Number.MAX_VALUE - stepSize >= x2) {
        var x = ScaleArithmetic.ceilEps(x2, stepSize);
        if (Utility.m3FuzzyCompare(x2, x, stepSize) !== 0) x2 = x;
      }

      return new Interval(x1, x2);
    };

    this.buildMajorTicks = function (interval, stepSize) {
      var numTicks = Math.round(interval.width() / stepSize) + 1;
      if (numTicks > 10000) numTicks = 10000;

      var ticks = [];

      ticks.push(interval.minValue());
      for (var i = 1; i < numTicks - 1; i++)
        ticks.push(interval.minValue() + i * stepSize);
      ticks.push(interval.maxValue());

      //console.log(ticks)
      return ticks;
    };

    /**
     * Calculate minor/medium ticks for major ticks
     * @param {Array<Number>} majorTicks Major ticks
     * @param {Number} maxMinorSteps Maximum number of minor steps
     * @param {Number} stepSize Step size
     * @param {Array<Number>} minorTicks Array to be filled with the calculated minor ticks
     * @param {Array<Number>} mediumTicks Array to be filled with the calculated medium ticks
     */
    this.buildMinorTicks = function (
      majorTicks,
      maxMinorSteps,
      stepSize,
      minorTicks,
      mediumTicks
    ) {
      var minStep = Static.mStepSize(stepSize, maxMinorSteps, this.base());
      if (minStep === 0.0) return;

      // # ticks per interval
      var numTicks = Math.ceil(Math.abs(stepSize / minStep)) - 1;

      var medIndex = -1;
      if (numTicks % 2) medIndex = numTicks / 2;

      // calculate minor ticks

      for (var i = 0; i < majorTicks.length; i++) {
        var val = majorTicks[i];
        for (var k = 0; k < numTicks; k++) {
          val += minStep;

          var alignedValue = val;
          if (Utility.m3FuzzyCompare(val, 0.0, stepSize) === 0)
            alignedValue = 0.0;

          if (k == medIndex) mediumTicks.push(alignedValue);
          else minorTicks.push(alignedValue);
        }
      }
    };

    this.buildTicks = function (interval, stepSize, maxMinorSteps, ticks) {
      var boundingInterval = this.align(interval, stepSize);

      ticks[ScaleDiv.TickType.MajorTick] = this.buildMajorTicks(
        boundingInterval,
        stepSize
      );

      if (maxMinorSteps > 0) {
        var minorTicks = [];
        var mediumTicks = [];
        this.buildMinorTicks(
          ticks[ScaleDiv.TickType.MajorTick],
          maxMinorSteps,
          stepSize,
          minorTicks,
          mediumTicks
        );
        ticks[ScaleDiv.TickType.MinorTick] = minorTicks;
        ticks[ScaleDiv.TickType.MediumTick] = mediumTicks;
      }

      for (var i = 0; i < ScaleDiv.TickType.NTickTypes; i++) {
        var obj = this.strip(ticks[i], interval);
        ticks[i] = [];
        ticks[i] = obj;

        // ticks very close to 0.0 are
        // explicitely set to 0.0

        for (var j = 0; j < ticks[i].length; j++) {
          if (Utility.m3FuzzyCompare(ticks[i][j], 0.0, stepSize) === 0)
            ticks[i][j] = 0.0;
        }
      }
    };

    this.divideScale = function (
      x1,
      x2,
      maxMajorSteps,
      maxMinorSteps,
      stepSize
    ) {
      if (typeof stepSize === "undefined") stepSize = 0.0;
      var interval = new Interval(x1, x2).normalized();
      if (interval.width() <= 0) return new ScaleDiv();

      stepSize = Math.abs(stepSize);
      if (stepSize === 0.0) {
        if (maxMajorSteps < 1) maxMajorSteps = 1;

        stepSize = ScaleArithmetic.divideInterval(
          interval.width(),
          maxMajorSteps,
          this.base()
        );
      }

      var scaleDiv = new ScaleDiv();

      if (stepSize !== 0.0) {
        var ticks = [];

        this.buildTicks(interval, stepSize, maxMinorSteps, ticks);
        scaleDiv = new ScaleDiv(interval, ticks);
        //console.log(interval.width())
        //console.log(ticks)
      }

      if (x1 > x2) scaleDiv.invert();

      return scaleDiv;
    };

    this.draw = function (xMap, yMap) {
      //console.log("here");
      var p = this.plot();
      var xScaleDiv = p.axisScaleDiv(this.xAxis());
      var yScaleDiv = p.axisScaleDiv(this.yAxis());

      var ctx = this.getContext();

      const _minorPen = self._reverseContrast ? "#222222" : "#cccccc";
      const _majorPen = self._reverseContrast ? "#333333" : "#aaaaaa";

      self.grid.boundLines.material.setValues({ color: _minorPen });

      if (self._reverseContrast) {
        self.grid.getScene().background = new THREE.Color().setHex(0x000000);
      } else {
        self.grid.getScene().background = new THREE.Color().setHex(0xffffff);
      }

      //const _majorPen = self.majorPen();
      const xMinEnabled = self.xMinEnabled();
      const xEnabled = self.xEnabled();
      const yMinEnabled = self.yMinEnabled();
      const yEnabled = self.yEnabled();
      //const p = this.plot();

      //console.log(_minorPen);

      ctx.strokeStyle = _minorPen;

      let scaleTicks = xScaleDiv.ticks(ScaleDiv.TickType.MinorTick);
      const xMinPaintTicks = scaleTicks.map(function (s) {
        return transform(s, xMap);
      });

      scaleTicks = yScaleDiv.ticks(ScaleDiv.TickType.MinorTick);
      const yMinPaintTicks = scaleTicks.map(function (s) {
        return transform(s, yMap);
      });

      scaleTicks = xScaleDiv.ticks(ScaleDiv.TickType.MajorTick);
      const xMajPaintTicks = scaleTicks.map(function (s) {
        return { p: transform(s, xMap), s: s };
      });

      scaleTicks = yScaleDiv.ticks(ScaleDiv.TickType.MajorTick);
      const yMajPaintTicks = scaleTicks.map(function (s) {
        return { p: transform(s, yMap), s: s };
      });

      const zScaleDiv = this.divideScale(
        0,
        200,
        8, //maxMajorSteps,
        5 //maxMinorSteps,
      );

      scaleTicks = zScaleDiv.ticks(ScaleDiv.TickType.MajorTick);
      const zMajPaintTicks = scaleTicks.map(function (s) {
        return { p: transformZ(s, 0, 200), s: s };
      });

      //console.log(zScaleDiv.ticks(ScaleDiv.TickType.MajorTick));

      const data = {
        xMinPaintTicks,
        yMinPaintTicks,
        xMajPaintTicks,
        yMajPaintTicks,
        zMajPaintTicks,
        majColor: _majorPen,
        minColor: _minorPen,
        minZ: 0,
        maxZ: 200,
      };

      if (xEnabled && xMinEnabled) {
        // console.log(data);
        if (!self.grid.majLines) {
          self.grid.generateMajGridLines(data);
        } else {
          self.grid.updateMajGridLines(data);
        }
        if (!self.grid.minLines) {
          self.grid.generateMinGridLines(data);
        } else {
          self.grid.updateMinGridLines(data);
        }
        self.grid.majLines.visible = true;
        self.grid.minLines.visible = true;
      }

      /* if (yEnabled && yMinEnabled) {
      } */
      //ctx.strokeStyle = _majorPen;
      else if (xEnabled && !xMinEnabled) {
        if (!self.grid.majLines) {
          self.grid.generateMajGridLines(data);
        } else {
          self.grid.updateMajGridLines(data);
        }
        if (self.grid.minLines) {
          self.grid.minLines.visible = false;
        }
        self.grid.majLines.visible = true;
      } else if (!xEnabled) {
        if (self.grid.minLines) {
          self.grid.minLines.visible = false;
        }
        if (self.grid.majLines) {
          self.grid.majLines.visible = false;
        }
      }

      self.grid.generateAxesLines(data);

      /* if (yEnabled) {
        
      } */
    };

    this.toString = function () {
      return "[ThreeDGrid]";
    };
  }

  hide() {
    const plot = this.plot();
    if (this.grid) {
      this.grid.stopAnimation();
    }
    $(this.canvas).hide();
    //$(this.canvas_2d).show();
    for (let i = 0; i < this.detachedCurves.length; i++) {
      const element = this.detachedCurves[i];
      element.attach(this.plot());
    }
    this.threeDGridVisible(false);
    super.hide();
    Static.trigger("threeDGridStatus", this.threeDGrid);
  }
  show() {
    // this.clearCanvas();
    const plot = this.plot();

    function adjustSize(_canvas) {
      _canvas.width = parseFloat($("#centralDiv").css("width"));
      _canvas.height = parseFloat($("#centralDiv").css("height"));
    }

    const L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
    for (let i = 0; i < L.length; i++) {
      if (1) {
        L[i].detach();
        this.detachedCurves.push(L[i]);
      }
    }

    // this.panner.setEnabled(false);
    // this.magnifier.setEnabled_1(false);
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      $("#centralDiv").append(this.canvas);
      $(this.canvas).css("zIndex", 5000);
      this.grid = new ThreeJs(this.canvas, adjustSize);
      this.grid._reverseContrast = this._reverseContrast;
    } else {
      $(this.canvas).show();
    }
    this.grid.startAnimation();
    // this.setMinorPen("#222222");
    // this.setMajorPen("#333333");
    this.threeDGridVisible(true);
    super.show();
    //plot.replot();
    Static.trigger("threeDGridStatus", this.threeDGrid);
  }

  threeDGridVisible(on) {
    const self = this;
    self.threeDGridAttached = on;
    const plot = self.plot();
    const autoReplot = plot.autoReplot();
    plot.setAutoReplot(false);

    self.threeDGrid = on;

    if (on) {
      let L = plot.itemList(PlotItem.RttiValues.Rtti_PlotCurve);
      for (let i = 0; i < L.length; i++) {
        self.detachedCurves.push(L[i]);
      }
      L = plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectroCurve);
      for (let i = 0; i < L.length; i++) {
        L[i].originalDrawSeries = L[i].drawSeries;
        L[i].drawSeries = self.drawSeries;
      }
      L = plot.itemList(PlotItem.RttiValues.Rtti_PlotSpectrogram);
      for (let i = 0; i < L.length; i++) {
        L[i].originalDraw = L[i].draw;
        L[i].draw = self.draw2;
      }
      if (self.threeDGrid) {
        self.original_widgetMousePressEvent_panner =
          self.panner.widgetMousePressEvent;
        self.panner.widgetMousePressEvent = function () {
          return true;
        };

        //self.original_updateAxes = plot.updateAxes;
        //plot.updateAxes = self.updateAxes;
      }
    } else {
      if (self.threeDGrid) {
        //Static.mToPoints = self.original_mToPoints;
        //Static.mToPolylineFiltered = self.original_mToPolylineFiltered;
        self.panner.widgetMousePressEvent =
          self.original_widgetMousePressEvent_panner;

        //plot.updateAxes = self.original_updateAxes;
      }
      let L = plot.itemList(PlotItem.RttiValues.Rtti_SpectroCurve);
      for (let i = 0; i < L.length; i++) {
        if (L[i].originalDrawSeries) {
          L[i].drawSeries = L[i].originalDrawSeries;
        }
      }
      L = plot.itemList(PlotItem.RttiValues.Rtti_Spectrogram);
      for (let i = 0; i < L.length; i++) {
        if (L[i].originalDraw) {
          L[i].draw = L[i].originalDraw;
        }
      }
      for (let i = 0; i < self.detachedCurves.length; i++) {
        const curve = self.detachedCurves[i];
        curve.attach(plot);
      }
      self.detachedCurves.length = 0;
    }
    plot.setAutoReplot(autoReplot);
    plot.autoRefresh();
    //console.log(456);
  }
}
