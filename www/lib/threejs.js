//import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class ThreeDgrid {
  constructor(canvas, resizeCb = null) {
    const self = this;
    this.lines;

    this.color = "#222222";

    let numOfYlines = 10;
    let numOfXlines = 10;
    let scene = new THREE.Scene();

    //y - green x-red z- blue
    //const axesHelper = new THREE.AxesHelper(6);
    //axesHelper.rotateX(-Math.PI / 2);

    //scene.add(axesHelper);

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
      positions.push(-0.5);
      positions.push(0);
      positions.push(0);
      ///////////////
      positions.push(1);
      positions.push(0);
      positions.push(0);

      positions.push(0);
      positions.push(-0.5);
      positions.push(0);
      ///////////////
      positions.push(0);
      positions.push(1);
      positions.push(0);

      positions.push(0);
      positions.push(0);
      positions.push(-0.5);
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
      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(-0.5);
      ////////////
      positions.push(0.5);
      positions.push(-0.5);
      positions.push(-0.5);

      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(0.5);
      ////////////
      positions.push(0.5);
      positions.push(-0.5);
      positions.push(0.5);

      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(-0.5);
      ////////////
      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(0.5);

      positions.push(0.5);
      positions.push(-0.5);
      positions.push(-0.5);
      ////////////
      positions.push(0.5);
      positions.push(-0.5);
      positions.push(0.5);

      //Draw back bound plane
      positions.push(-0.5);
      positions.push(0.5);
      positions.push(-0.5);
      ////////////
      positions.push(0.5);
      positions.push(0.5);
      positions.push(-0.5);

      positions.push(-0.5);
      positions.push(0.5);
      positions.push(0.5);
      ////////////
      positions.push(0.5);
      positions.push(0.5);
      positions.push(0.5);

      positions.push(-0.5);
      positions.push(0.5);
      positions.push(-0.5);
      ////////////
      positions.push(-0.5);
      positions.push(0.5);
      positions.push(0.5);

      positions.push(0.5);
      positions.push(0.5);
      positions.push(-0.5);
      ////////////
      positions.push(0.5);
      positions.push(0.5);
      positions.push(0.5);

      //Draw bottom bound plane
      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(-0.5);
      ////////////
      positions.push(-0.5);
      positions.push(0.5);
      positions.push(-0.5);

      positions.push(0.5);
      positions.push(-0.5);
      positions.push(-0.5);
      ////////////
      positions.push(0.5);
      positions.push(0.5);
      positions.push(-0.5);

      //Draw top bound plane
      positions.push(-0.5);
      positions.push(-0.5);
      positions.push(0.5);
      ////////////
      positions.push(-0.5);
      positions.push(0.5);
      positions.push(0.5);

      positions.push(0.5);
      positions.push(-0.5);
      positions.push(0.5);
      ////////////
      positions.push(0.5);
      positions.push(0.5);
      positions.push(0.5);

      return positions;
    }

    function getGridLinesPosition() {
      const positions = [];

      //Draw y gridlines

      const yspacing = 1 / (numOfYlines - 1);
      for (let i = 0; i < numOfYlines; i++) {
        positions.push(-0.5);
        positions.push(-0.5 + i * yspacing);
        positions.push(0);
        positions.push(0.5);
        positions.push(-0.5 + i * yspacing);
        positions.push(0);
      }

      //Draw x gridlines
      const xspacing = 1 / (numOfXlines - 1);
      for (let i = 0; i < numOfXlines; i++) {
        positions.push(-0.5 + i * xspacing);
        positions.push(-0.5);
        positions.push(0);
        //////////////3
        positions.push(-0.5 + i * xspacing);
        positions.push(0.5);
        positions.push(0);
      }

      return positions;
    }

    /* function getPositions1() {
      let n = self.xGridLines * self.yGridLines * self.zGridLines;
      let positions = [];
      //xSpacing = (self.xGridLines - 1)/2
      for (let i = 0; i < n; i++) {
        let p = mapTo3D(i);
        positions.push(
          (p.x - (self.xGridLines - 1) / 2) / (self.xGridLines - 1)
        );
        positions.push(
          (p.y - (self.yGridLines - 1) / 2) / (self.yGridLines - 1)
        );
        positions.push(
          (p.z - (self.zGridLines - 1) / 2) / (self.zGridLines - 1)
        );
      }
      return positions;
    } */

    const clipPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.500001), //left
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.50001), //right
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.50001), //bottom
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.50001), //top
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.50001), //back
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.50001), //front
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

    function generateAxesLines() {
      let geometry = getGeometry(getAxesLinesPosition());

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
    }

    function generateBoundLines() {
      let geometry = getGeometry(getBoundLinesPosition());

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
    }

    function generateGridLines() {
      let geometry = getGeometry(getGridLinesPosition());

      // let indexPairs = getIndexPairs();
      // geometry.setIndex(indexPairs);
      self.lines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
          color: self.color,
          clippingPlanes: clipPlanes,
          //clipIntersection: true,
        })
      );

      // console.log(self.lines);

      scene.add(self.lines);
      //scene.rotateX(-Math.PI / 2);
    }

    scene.rotateX(-Math.PI / 2);

    this.updateGridLines = function () {
      //let indexPairs = getIndexPairs();
      const geometry = getGeometry(getGridLinesPosition());
      //geometry.setIndex(indexPairs);
      self.lines.geometry = geometry;
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
    camera.position.set(0.5, 0.5, 1);
    //camera.lookAt(scene.position);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });

    renderer.localClippingEnabled = true;

    renderer.setSize(canvas.width, canvas.height);

    const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.01;
    //orbit.enableZoom = false;
    //orbit.autoRotate = true;
    // orbit.enableDamping = true;

    function animate() {
      orbit.update();
      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    generateBoundLines();

    generateGridLines();
    generateAxesLines();

    window.addEventListener("resize", function () {
      if (resizeCb) {
        resizeCb(canvas);
      }
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.width, canvas.height);
    });
  }
  setGridLineColor(color) {
    this.color = color;
    this.lines.material = new THREE.LineBasicMaterial({ color: this.color });
  }

  setXgridLines(num) {
    if (this.xGridLines === num || num < 2) {
      return;
    }
    this.xGridLines = num;
    this.updateGridLines();
  }

  setYgridLines(num) {
    if (this.yGridLines === num || num < 2) {
      return;
    }
    this.yGridLines = num;
    this.updateGridLines();
  }

  setZgridLines(num) {
    if (this.zGridLines === num || num < 2) {
      return;
    }
    this.zGridLines = num;
    this.updateGridLines();
  }

  visibility() {
    return this.lines.visible;
  }

  setVisibility(visible) {
    this.lines.visible = visible;
  }
}
/*
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

function adjustSize(_canvas) {
  _canvas.width = window.innerWidth;
  _canvas.height = window.innerHeight;
}

const grid = new ThreeDgrid(canvas, adjustSize);

const visibilityButton = document.getElementById("visible");
visibilityButton.onclick = () => {
  const visible = grid.visibility();
  grid.setVisibility(!visible);
};

const _xGridLines = document.getElementById("xGridLines");
_xGridLines.onchange = (e) => {
  grid.setXgridLines(parseInt(_xGridLines.value));
};

const _yGridLines = document.getElementById("yGridLines");
_yGridLines.onchange = (e) => {
  grid.setYgridLines(parseInt(_yGridLines.value));
};

const _zGridLines = document.getElementById("zGridLines");
_zGridLines.onchange = (e) => {
  grid.setZgridLines(parseInt(_zGridLines.value));
};
const _lineColor = document.getElementById("lineColor");
_lineColor.onchange = (e) => {
  grid.setGridLineColor(_lineColor.value);
};
*/
