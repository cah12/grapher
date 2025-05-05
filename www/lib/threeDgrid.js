"use strict";

class ThreeJs {
  constructor(canvas, resizeCb = null) {
    const self = this;
    this.lines;

    let p_limit = 0.7;

    this.color = "#222222";

    let numOfYlines = 10;
    let numOfXlines = 10;
    let scene = new THREE.Scene();

    this.getPlimit = function () {
      return p_limit;
    };

    //y - green x-red z- blue
    //const axesHelper = new THREE.AxesHelper(6);
    //axesHelper.rotateX(-Math.PI / 2);

    const aspect = canvas.width / canvas.height;

    /* function mapFrom3D(x, y, z) {
              return x + y * self.xGridLines + z * self.xGridLines * self.yGridLines;
            }
        
            function mapTo3D(i) {
              let z = Math.floor(i / (self.xGridLines * self.yGridLines));
              i -= z * self.xGridLines * self.yGridLines;
              let y = Math.floor(i / self.xGridLines);
              let x = i % self.xGridLines;
              return { x: x, y: y, z: z };
            } */

    function getGeometry(positions) {
      let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
      let geometry = new THREE.BufferGeometry();
      geometry.dynamic = true;
      geometry.setAttribute("position", positionAttribute);
      return geometry;
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

    const clipPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.700001), //left
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.70001), //right
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.70001), //bottom
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.70001), //top
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.70001), //back
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.70001), //front
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

    this.generateAxesLines = function (data) {
      let geometry = getGeometry(getAxesLinesPosition(data));

      // let indexPairs = getIndexPairs();
      // geometry.setIndex(indexPairs);
      const lines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: "#636363",
          //clippingPlanes: clipPlanes,
          //clipIntersection: true,
        })
      );

      // console.log(self.lines);

      scene.add(lines);
      //scene.rotateX(-Math.PI / 2);
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
      function equation(x, y) {
        return x * x + y * y; // Example: z = sin(sqrt(x^2 + y^2))
      }

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
      /* for (let i = 0; i < numberOfPoints; i++) {
        let y = sy1 + i * yStep;
        for (let j = 0; i < numberOfPoints; i++) {
          let x = sx1 + i * xStep;
          scope.set("x", x);
          scope.set("y", y);
          const z = transformZ(parser.evaluate(scope), 0, 200);
          //console.log(z);
          vertices[(i * (numberOfPoints + 1) + j) * 3 + 2] = z; // Update z-coordinate of vertex
        }
        //indices.push(i);
      } */

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      if (plotItem.lines) {
        plotItem.lines.geometry.dispose();
        plotItem.lines.geometry = geometry;
      } else {
        plotItem.lines = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            //color: 0xff0000,
            // wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
            clippingPlanes: clipPlanes,
          })
        );
      }

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
            color: 0xff0000,
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
      const lines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: self.color,
          //clippingPlanes: clipPlanes,
          //clipIntersection: true,
        })
      );

      // console.log(self.lines);

      scene.add(lines);
      //scene.rotateX(-Math.PI / 2);
    };

    this.generateMajGridLines = function (data) {
      self.gridLinesData = data;
      let geometry = getGeometry(getMajGridLinesPosition(data));

      self.majLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: data.majColor,
          clippingPlanes: clipPlanes,
        })
      );
      scene.add(self.majLines);
    };

    this.generateMinGridLines = function (data) {
      self.gridLinesData = data;

      let geometry = getGeometry(getMinGridLinesPosition(data));

      self.minLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: data.minColor,
          clippingPlanes: clipPlanes,
        })
      );

      scene.add(self.minLines);
    };

    scene.rotateX(-Math.PI / 2);

    this.updateMajGridLines = function (data) {
      let geometry = getGeometry(getMajGridLinesPosition(data));

      self.majLines.material.setValues({
        color: data.majColor,
        clippingPlanes: clipPlanes,
      });

      self.majLines.geometry.dispose();
      self.majLines.geometry = geometry;
    };

    this.updateMinGridLines = function (data) {
      let geometry = getGeometry(getMinGridLinesPosition(data));

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
    //orbit.autoRotate = true;
    //orbit.update();

    function animate() {
      resizeCb(canvas);
      renderer.setSize(canvas.width, canvas.height);
      orbit.update();

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

    //this.generateGridLines();
    this.generateAxesLines();

    /*  window.addEventListener("resize", function () {
      if (resizeCb) {
        resizeCb(canvas);
      }
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.width, canvas.height);
    }); */
  }
  /* setGridLineColor(color) {
    this.color = color;
    this.lines.material = new THREE.LineBasicMaterial({
      color: this.color,
    });
  } */

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

    this.grid = null;

    let m_zeroMinRadius = true;
    let m_zeroMinAngle = false;

    let radialPrecision = 4;
    let rayPrecision = 4;

    this.panner = panner;
    this.magnifier = magnifier;

    self.detachedCurves = [];

    //this.setItemAttribute(PlotItem.ItemAttribute.AutoScale, true);

    // this.plot = function () {
    //   return plot;
    // };
    //console.log(plot);
    this.threeDgrid = null;
    this.canvas = null;

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

      self.grid.doDrawMesh(this, xMap, yMap);
    };

    this.draw = function (xMap, yMap) {
      //console.log("here");
      var p = this.plot();
      var xScaleDiv = p.axisScaleDiv(this.xAxis());
      var yScaleDiv = p.axisScaleDiv(this.yAxis());

      var ctx = this.getContext();

      /* majColor: "#333333",
          minColor: "#222222", */

      const _minorPen = self.minorPen();
      const _majorPen = self.majorPen();
      const xMinEnabled = self.xMinEnabled();
      const xEnabled = self.xEnabled();
      const yMinEnabled = self.yMinEnabled();
      const yEnabled = self.yEnabled();
      //const p = this.plot();

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

      const data = {
        xMinPaintTicks,
        yMinPaintTicks,
        xMajPaintTicks,
        yMajPaintTicks,
        majColor: _majorPen,
        minColor: _minorPen,
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
    } else {
      $(this.canvas).show();
    }
    this.grid.startAnimation();
    this.setMinorPen("#222222");
    this.setMajorPen("#333333");
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
