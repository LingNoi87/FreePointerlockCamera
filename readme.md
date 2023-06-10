
 # FreePointerFlyControls.js

 #### Information 
 FreePointerFlyControls.js is a small but essential adaptation of the original base library "PointerLockFlyControl.js". Now the camera can be moved in the same manner as in first person shooters.
 Motivation was to remove continuous panning, tilting once mouse has been displaced from "view center point". Rotation and translation is allowed in all axis and directions.
 
 #### How to run
 1) Clone project
 2) Run example.html by a server such as "live server" extension in VS Code

  #### How integrate in existing project
  Add following lines to your JS file (adapt according to your needs):

    import { FreePointerLockFlyControls } from '../../build/FreePointerLockFlyControls.js';
    //...
    const controls = new FreePointerLockFlyControls( camera, canvas );
    controls.movementSpeed = 0.4;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;
    controls.continuousRotation = false;
    controls.invertUpDownKeys = false;

    //...
    // in animation loop:
    const delta = clock.getDelta();
    //...
    controls.update(delta);



