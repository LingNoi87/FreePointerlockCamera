import * as THREE from '../../build/three.module.js';
import { FreePointerLockFlyControls } from '../../build/FreePointerLockFlyControls.js';
import * as dat from "https://cdn.skypack.dev/dat.gui"
const gui = new dat.GUI();
const clock = new THREE.Clock();//used for orbintcontrol
const textureLoader = new THREE.TextureLoader();

function main() 
{

  //-----------------------camera, scene, renderer---------------------------------------------------
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas},{antialias:true, alpha:true});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

//----------------------------------------------------------------------------------------------------
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '/src/audio/space.mp3', function( buffer ) {
sound.setBuffer( buffer );
sound.setLoop( true );
sound.setVolume( 1.0 );
sound.play();
});

//--------------controls------------------------------------------------------------------
const controls = new FreePointerLockFlyControls( camera, canvas );
controls.movementSpeed = 0.4;
controls.domElement = renderer.domElement;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = false;
controls.invertUpDownKeys = true;

 //-----------------------------GUI Controls----------------------------------------------------------
var guiControls = new function() 
{
  this.playSound = true;
  this.invertUpDown = controls.invertUpDownKeys;
  this.autoForward = controls.autoForward;
  this.rollSpeed = controls.rollSpeed;
  this.movementSpeed = controls.movementSpeed;
}
const guiFolder = gui.addFolder('Settings');
guiFolder.add(guiControls, 'playSound').onChange(()=>{if(guiControls.playSound)
                                                         {  sound.play(); }
                                                         else
                                                         {  sound.pause(); }});
guiFolder.add(guiControls, 'invertUpDown').onChange(()=>{controls.invertUpDownKeys = guiControls.invertUpDown});       
guiFolder.add(guiControls, 'autoForward').onChange(()=>{controls.autoForward = guiControls.autoForward});     
guiFolder.add(guiControls, 'rollSpeed', 0, 0.5).onChange(()=>{controls.rollSpeed = guiControls.rollSpeed});
guiFolder.add(guiControls, 'movementSpeed', 0, 1.5).onChange(()=>{controls.movementSpeed = guiControls.movementSpeed});                                                    
guiFolder.open();




  // resize canvas on resize window
  window.addEventListener( 'resize', () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(window.devicePixelRatio);


  function updatePosDisplay()
  {
    document.getElementById("camera_pos").innerHTML = `${camera.position.x.toFixed(3)}, ${camera.position.y.toFixed(3)}, ${camera.position.z.toFixed(3)}`;
  };
  function updateDirDisplay()
  {
    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    document.getElementById("camera_dir").innerHTML = `${direction.x.toFixed(3)}, ${direction.y.toFixed(3)}, ${direction.z.toFixed(3)}`;
  }

  window.addEventListener('pointermove', updateDirDisplay);

  
  //------------------light sources----------------------------------------------------------------------
  const sunPos = new THREE.Vector3(390, 0.2, 0);
  const color = 0xFFFFFF;
  const intensity = 0.1;
  const ambLight = new THREE.AmbientLight(color, intensity);
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
  directionalLight.position.set(sunPos.x, sunPos.y, sunPos.z);
  scene.add(ambLight, directionalLight);

  //-----------------------mesh, material, geometry----------------------------------------------------------
const material = new THREE.MeshPhongMaterial({
  specular: 0x333333,
    shininess: 15,
    map: textureLoader.load('/src/img/earth.jpg'),
    // y scale is negated to compensate for normal map handedness.
    normalScale: new THREE.Vector2( 0.85, - 0.85)
});

//earth mesh
let earth = new THREE.Mesh();
const radius = 1;  
const widthSegments =  30;  
const heightSegments = 30;  
const earthGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
earth = new THREE.Mesh(earthGeometry, material);
scene.add(earth);//adds earth by reference-> any change to earth will effect scene


//sun mesh
const sunGeometry = new THREE.SphereGeometry(0.5, 15, 15);
const sunMesh = new THREE.Mesh(sunGeometry, new THREE.MeshBasicMaterial({color: 0xffff99}));
sunMesh.position.set(sunPos.x, sunPos.y, sunPos.z);





//star field geometry
const starfieldMesh = new THREE.Mesh(
  new THREE.SphereGeometry(500, 20, 20), 
  new THREE.MeshBasicMaterial({
    map: textureLoader.load('src/img/galaxy_starfield.png'), 
    side: THREE.BackSide
  })
);
scene.add(starfieldMesh);

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

scene.add(earth);//adds cube by reference-> any change to cube will effect scene
console.log("images loaded");


function handleKeys()
{
    updatePosDisplay();
}


  //-----------------super loop-------------------------------------------
  function render(time) 
  {
    const delta = clock.getDelta();
    time *= 0.001; //ms-->s
    const rot = time * 0.01;
    earth.rotation.y = rot;
    renderer.render(scene, camera);
    controls.update(delta);
    handleKeys();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
