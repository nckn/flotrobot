//COLORS
var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    brownDark: 0x23190f,
    pink: 0xF5986E,
    yellow: 0xf4ce93,
    blue: 0x68c3c0,
    green: 0x45da8e
};

clock = void 0;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var startTime = Date.now();

// GAME VARIABLES
var game,
    deltaTime = 0,
    newTime = new Date().getTime(),
    oldTime = new Date().getTime();

function initWorld(){
  game = {
    speed: 0,
    initSpeed: .000035,
    baseSpeed: .00035,
    targetBaseSpeed: .00035,
    incrementSpeedByTime: .0000025,
    incrementSpeedByLevel: .000005,
    distanceForSpeedUpdate: 100,
    speedLastUpdate: 0,

    distance: 0,

    seaRadius: 600,
    seaLength: 800,
    //seaRotationSpeed:0.006,
    wavesMinAmp: 5,
    wavesMaxAmp: 20,
    wavesMinSpeed: 0.0001,
    wavesMaxSpeed: 0.0003,

    cameraFarPos: 500,
    cameraNearPos: 150,
    cameraSensivity: 0.002,

    coinDistanceTolerance: 15,
    coinValue: 3,
    coinsSpeed: .5,
    coinLastSpawn: 0,
    distanceForCoinsSpawn: 100,
    status: "playing",
   };
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
  camera.position.set(333.0, 2.97, -352.0);
  camera.rotation.set(-0.87142, 0.71778, 0.66358);
  camera.lookAt(scene.position);
  camera.position.y = game.planeDefaultHeight;
  //camera.lookAt(new THREE.Vector3(0, 400, 0));

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  clock = new THREE.Clock;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minDistance = 100;
  controls.maxDistance = 500;
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var vector = new THREE.Vector3();

  vector.set(
      ( event.clientX / window.innerWidth ) * 2 - 1,
      - ( event.clientY / window.innerHeight ) * 2 + 1,
      0.5 );

  vector.unproject( camera );

  var dir = vector.sub( camera.position ).normalize();

  var distance = - camera.position.z / dir.z;

  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

  lookAtPoint = pos;

}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event) {

}

function handleTouchEnd(event) {

}

// LIGHTS
var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}

Sea = function() {
  var geom = new THREE.CylinderGeometry(game.seaRadius, game.seaRadius, game.seaLength, 40, 10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i = 0; i < l; i++) {
    var v = geom.vertices[i];
    //v.y = Math.random() * 30;
    this.waves.push({
      y:v.y,
      x:v.x,
      z:v.z,
      ang:Math.random() * Math.PI * 2,
      amp:game.wavesMinAmp + Math.random() * (game.wavesMaxAmp-game.wavesMinAmp),
      speed:game.wavesMinSpeed + Math.random() * (game.wavesMaxSpeed - game.wavesMinSpeed)
    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function () {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i = 0; i < l; i++) {
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
    vprops.ang += vprops.speed * deltaTime;
    this.mesh.geometry.verticesNeedUpdate = true;
  }
}

// 3D Models
var sea;

var curvePoints = [2], arms = [2], legs = [2];

var group, neck, cube, eyeLock, head, mouth, eyes = [2], pupils = [2];

function rotateObject(object, degreeX = 0, degreeY =0 , degreeZ = 0) {

   degreeX = (degreeX * Math.PI) / 180;
   degreeY = (degreeY * Math.PI) / 180;
   degreeZ = (degreeZ * Math.PI) / 180;

   object.rotateX(degreeX);
   object.rotateY(degreeY);
   object.rotateZ(degreeZ);

}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

// create a random timer interval holder
var randInterval = 200;
var randChild = 0;

// add a set interval timer that clears itself and re-generates with a new random interval
var blink = function() {
  randChild = randomIntInRage(1, 4);
  randInterval = randomIntInRage(5, 9);
  eyes[0].children[0].scale.z = 0.1;
  eyes[1].children[0].scale.z = 0.1;
  mouth.scale.y = 0.4;
  clearInterval(interval);
  interval = setInterval(blink, randInterval*400);
  setTimeout(function() {
    eyes[0].children[0].scale.z = 1;
    eyes[1].children[0].scale.z = 1;
    mouth.scale.y = 1;
  }, 100);
}

var interval = setInterval(blink, randInterval);

function loop() {

  newTime = new Date().getTime();
  deltaTime = newTime - oldTime;
  oldTime = newTime;

  // console.log(camera.rotation);
  console.log(camera.position);

  sea.mesh.rotation.z += game.speed * deltaTime;//*game.seaRotationSpeed;

  if ( sea.mesh.rotation.z > 2 * Math.PI)  sea.mesh.rotation.z -= 2 * Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity) * deltaTime * 0.005;

  sea.moveWaves();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);

  // Hack for disabling pan
  controls.userPanSpeed = 0;
  controls.userZoom = true;
  controls.update();

  var dtime = Date.now() - startTime;
  raft.position.y = 1.0 + 3 * Math.sin(dtime / 1000);

  raft.rotation.y += 0.02 * clock.getDelta();
  head.rotation.z = -0.05 + 0.15 * Math.sin(dtime / 1200);
  head.lookAt(camera.position);
  // group.children[2].rotation.z = 0.1 * Math.sin(dtime / 300);
  // group.children[3].rotation.z = 0.1 * Math.sin(dtime / 300);
  group.children[4].rotation.z = -0.75 + 0.15 * Math.sin(dtime / 200);
  group.children[5].rotation.z = -0.75 - 0.15 * Math.sin(dtime / 200);

  raft.rotation.y = -0.75 + 0.15 * Math.sin(dtime / 1200);
  raft.rotation.x = -0.001 + 0.15 * Math.sin(dtime / 800);

  var vector = new THREE.Vector3();

  // update the picking ray with the camera and mouse position  
  // raycaster.setFromCamera( mouse, camera ); 

  // calculate objects intersecting the picking ray
  // var intersects = raycaster.intersectObjects( scene.children );

  // for ( var i = 0; i < intersects.length; i++ ) {

  //  intersects[ i ].object.material.color.set( 0xff0000 );
  
  // }

  return renderer.render(scene, camera);
}

function randomIntInRage(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function normalize(v, vmin, vmax, tmin, tmax) {
  var nv = Math.max(Math.min(v, vmax), vmin);
  var dv = vmax - vmin;
  var pc = (nv - vmin) / dv;
  var dt = tmax - tmin;
  var tv = tmin + (pc * dt);
  return tv;
}

function createRobot() {

  Mat = function(matColor) {
    return new THREE.MeshPhongMaterial({color: matColor, shading: THREE.FlatShading});
  }

  var raftMat = new Mat(Colors.brown); 
  var bodyMat = new Mat(Colors.red);
  var headMat = new Mat(Colors.green);
  var eyeMat = new Mat(Colors.yellow);

  var raftGeom = new THREE.BoxGeometry(40, 60, 40);
  raft = new THREE.Mesh(raftGeom, raftMat);
  raft.position.y = -10;

  group = new THREE.Object3D();
  group.position.x = 20;
  group.position.y = 34;

  // add tube shape
  curvePoints[0] = [new THREE.Vector3( 2, -2, 0 ), new THREE.Vector3( 8, -2, 0 ), new THREE.Vector3( 12, -8, 0 )];
  
  Extrusion = function() {
    this.ext = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePoints[0]), 4, 0.5), bodyMat);
    return this.ext;
  }

  BlackShape = function(x=1, y=1, z=1) {
    return new THREE.Mesh(new THREE.CubeGeometry(x, y, z), new THREE.MeshLambertMaterial({ color: 0x000000 } ));
  }

  Eye = function(num) {
    this.eye = new THREE.Mesh( new THREE.CylinderGeometry( 1, 1, 6, 32 ), eyeMat );
    this.pupil = new BlackShape(0.5, 0.5, 0.5);
    this.eye .add( this.pupil );
    this.pupil.position.y = -3;
    this.eye.position.x = 2;
    return this.eye;
  }

  arms[0] = new Extrusion();
  arms[1] = new Extrusion();

  legs[0] = new Extrusion();
  legs[1] = new Extrusion();

  // var tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.SplineCurve3(points), 64, 20), new THREE.MeshLambertMaterial({ color: 0x00FF00 }));
  arms[0].rotation.y = -Math.PI / 2;
  arms[1].rotation.y = Math.PI / 2;

  arms[0].position.y = 4;
  arms[1].position.y = 4;

  legs[0].rotation.z = -Math.PI / 3;
  legs[1].rotation.z = -Math.PI / 3;

  legs[0].position.z = -2;
  legs[1].position.z = 2;

  arms[0].castShadow = arms[0].receiveShadow = true;

  var bodyGeom = new THREE.BoxGeometry(8, 8, 8);
  cube = new THREE.Mesh(bodyGeom, bodyMat);

  neck = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 6, 32 ), bodyMat );
  neck.position.y = 7;

  head = new THREE.Mesh(new THREE.CylinderGeometry( 4, 4, 8, 32 ), headMat );
  head.position.y = 4;

  mouth = new BlackShape(2, 0.5, 2);
  mouth.position.x = 3;
  mouth.position.y = -2;
  mouth.position.z = 3;
  mouth.rotation.y = - (45 * Math.PI/180);

  eyes[0] = new Eye();
  eyes[1] = new Eye();

  eyes[0].position.z = 2;
  rotateObject( eyes[0], 90, 0, 90);

  eyes[1].position.z = -2;
  rotateObject( eyes[1], 90, 0, 90);

  eyeLock = new THREE.Object3D();

  eyeLock.add( eyes[0] );
  eyeLock.add( eyes[1] );
  eyeLock.rotation.y = - (45 * Math.PI/180);

  head.add( mouth );
  head.add( eyeLock );

  neck.add( head );
  group.add( cube );
  group.add( neck );
  group.add( arms[0] );
  group.add( arms[1] );
  group.add( legs[0] );
  group.add( legs[1] );
  raft.add( group );
  scene.add( raft );

}

function init(event){

  // UI

  initWorld();
  createScene();

  createRobot();
  createLights();
  createSea();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

window.addEventListener('load', init, false);
