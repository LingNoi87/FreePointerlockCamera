
 # FreePointerLockFlyControls.js
A threeJS camera control library 

 #### Information 
 FreePointerFlyControls.js is a threeJS camera control library that is a small but essential adaptation and fusion of the original camera control libraries "PointerLockFlyControl.js" and "FlyControls.js".
 
 ##### FlyControls.js
 Allows free translation and free rotation along and around all axis in 3D space. To prevent gimbal lock, it uses quaternions. However, one limitation is that looking around with mouse is done by displacing the mouse from view center. The larger the displacent the  larger the rotational speed towards displacement direction. It leads to a continuous pan/tilt if mouse does not go back to view center - something that is not desired.
 
 ##### PointerLockFlyControl.js
 Allows pan and tilt of camera proportional to and in the dirction of mousemove - just like in a first persion shooter. However, the limitation is that translational movement is only allowed on the x-y-plane and rolling is not possible at all.
 
 ##### FreePointerLockFlyControls.js
 Combines both control libraries. Now the camera can be moved in the same manner as in first person shooters, while rotation around all exis and trasnslation along all axis is possible withput gimbal lock.
 
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
    controls.update(delta);
    //...



