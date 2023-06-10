
/**
 * Author: LingNoi87
 * E-Mail: ewok.slayer101@gmail.com
 * Information: FreePointerFlyControls.js is a small but essential adaptation of the base library "PointerLockFlyControl.js". The camera now can be moved in the same manner as in first person shooters.
 * Motivation was to remove continuous panning, tilting once mouse has been displaced from "view center point". Rotation and translation is allowed in all axis and directions.
 */


import {
	EventDispatcher,
	Quaternion,
	Vector3
} from '../../build/three.module.js';

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

class FreePointerLockFlyControls extends EventDispatcher {

	constructor( object, domElement ) {

		super();

		this.object = object;
		this.domElement = domElement;

		// API

		this.movementSpeed = 1.0;
		this.rollSpeed = 0.005;

		this.dragToLook = false;
		this.autoForward = false;
		this.continuousRotation = false;
		this.invertUpDownKeys = false;
		this.isLocked = false;

		// disable default target object behavior

		// internals

		const scope = this;

		const EPS = 0.000001;

		const lastQuaternion = new Quaternion();
		const lastPosition = new Vector3();

		this.tmpQuaternion = new Quaternion();

		this.status = 0;

		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.moveVector = new Vector3( 0, 0, 0 );
		this.rotationVector = new Vector3( 0, 0, 0 );

		this.keydown = function ( event ) {

			if ( event.altKey ) 
			{
				return;
			}

			switch ( event.code ) {

				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

				case 'KeyW': this.moveState.forward = 1; break;
				case 'KeyS': this.moveState.back = 1; break;

				case 'KeyA': this.moveState.left = 1; break;
				case 'KeyD': this.moveState.right = 1; break;

				case 'KeyR': this.moveState.up = 1; break;
				case 'KeyF': this.moveState.down = 1; break;

				case 'ArrowUp':
					if(true == this.invertUpDownKeys){this.moveState.pitchDown = 1;}
					else{this.moveState.pitchUp = 1;} 
					break;
				case 'ArrowDown': 
					if(true == this.invertUpDownKeys){this.moveState.pitchUp = 1;}
					else{this.moveState.pitchDown = 1;} 
					break;
				case 'ArrowLeft': this.moveState.yawLeft = 1; break;
				case 'ArrowRight': this.moveState.yawRight = 1; break;

				case 'KeyQ': this.moveState.rollLeft = 1; break;
				case 'KeyE': this.moveState.rollRight = 1; break;
			}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.keyup = function ( event ) {
			switch ( event.code ) 
			{
				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

				case 'KeyW': this.moveState.forward = 0; break;
				case 'KeyS': this.moveState.back = 0; break;

				case 'KeyA': this.moveState.left = 0; break;
				case 'KeyD': this.moveState.right = 0; break;

				case 'KeyR': this.moveState.up = 0; break;
				case 'KeyF': this.moveState.down = 0; break;

				case 'ArrowUp':
					if(true == this.invertUpDownKeys){this.moveState.pitchDown = 0;}
					else{this.moveState.pitchUp = 0;} 
					break;
				case 'ArrowDown': 
					if(true == this.invertUpDownKeys){this.moveState.pitchUp = 0;}
					else{this.moveState.pitchDown = 0;} 
					break;

				case 'ArrowLeft': this.moveState.yawLeft = 0; break;
				case 'ArrowRight': this.moveState.yawRight = 0; break;

				case 'KeyQ': this.moveState.rollLeft = 0; break;
				case 'KeyE': this.moveState.rollRight = 0; break;
			}
			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.pointerdown = function ( event ) {

			if ( this.dragToLook ) 
			{
				this.status ++;
			} 
			else 
			{
				switch ( event.button ) 
				{
					case 0: this.moveState.forward = 1; break;
					case 2: this.moveState.back = 1; break;
				}
				this.updateMovementVector();
			}
		};

		this.pointermove = function ( event ) 
		{
			if(!this.continuousRotation || !this.isLocked){return;}
			if (( ! this.dragToLook || this.status > 0 ) && this.isLocked) 
			{
				const container = this.getContainerDimensions();
				const halfWidth = container.size[ 0 ] / 2;
				const halfHeight = container.size[ 1 ] / 2;

				this.moveState.yawLeft = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth ) / halfWidth;
				this.moveState.pitchDown = ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

				this.updateRotationVector();
			}
		};

		this.mousemove = function ( event ) 
		{
			if(this.continuousRotation || !this.isLocked){return;}
			const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			
			let rotMult = -0.001;
			scope.tmpQuaternion.set( movementY * rotMult, movementX * rotMult, 0, 1 ).normalize();
			scope.object.quaternion.multiply( scope.tmpQuaternion );

		};

		this.pointerup = function ( event ) {

			if ( this.dragToLook ) 
			{
				this.status --;
				this.moveState.yawLeft = this.moveState.pitchDown = 0;
			} 
			else 
			{
				switch ( event.button ) 
				{
					case 0: this.moveState.forward = 0; break;
					case 2: this.moveState.back = 0; break;
				}
				this.updateMovementVector();
			}
			this.updateRotationVector();
		};

		this.click = function(event)
		{
			if(!this.isLocked)
			{
				this.lock();
			}
		}

		this.update = function ( delta ) {

			const moveMult = delta * scope.movementSpeed;
			const rotMult = delta * scope.rollSpeed;

			scope.object.translateX( scope.moveVector.x * moveMult );
			scope.object.translateY( scope.moveVector.y * moveMult );
			scope.object.translateZ( scope.moveVector.z * moveMult );

			scope.tmpQuaternion.set( scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1 ).normalize();
			scope.object.quaternion.multiply( scope.tmpQuaternion );

			if (
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS
			) 
			{
				scope.dispatchEvent( _changeEvent );
				lastQuaternion.copy( scope.object.quaternion );
				lastPosition.copy( scope.object.position );
			}

		};

		this.updateMovementVector = function () 
		{
			const forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;
			this.moveVector.x = ( - this.moveState.left + this.moveState.right );
			this.moveVector.y = ( - this.moveState.down + this.moveState.up );
			this.moveVector.z = ( - forward + this.moveState.back );
		};

		this.updateRotationVector = function () 
		{
			this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
			this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
			this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );
		};

		this.getContainerDimensions = function () {

			if ( this.domElement != document ) {

				return {
					size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
					offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
				};

			} else {

				return {
					size: [ window.innerWidth, window.innerHeight ],
					offset: [ 0, 0 ]
				};
			}

		};

		this.lock = function() 
		{
			this.domElement.requestPointerLock();
		}

		this.unlock = function() 
		{
			this.domElement.ownerDocument.exitPointerLock();
		}


		this.onPointerlockChange = function(event) 
		{
			if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) 
			{
				this.dispatchEvent( _lockEvent );
				this.isLocked = true;
			}
			else 
			{
				this.dispatchEvent( _unlockEvent );
				this.isLocked = false;
			}	
		}
		
		this.onPointerlockError = function(event) 
		{
			console.error( 'THREE.FreePointerLockFlyControls: Unable to use Pointer Lock API' );
			this.isLocked = false;
		}


		this.dispose = function () {

			this.domElement.removeEventListener( 'contextmenu', contextmenu );
			this.domElement.removeEventListener( 'pointerdown', _pointerdown );
			this.domElement.removeEventListener( 'pointermove', _pointermove );
			this.domElement.removeEventListener( 'pointerup', _pointerup );
			this.domElement.removeEventListener( 'mousemove', _mousemove );
			this.domElement.removeEventListener( 'click', _click );
			this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', _pointerlockChange );
			this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', _pointerlockError );

			window.removeEventListener( 'keydown', _keydown );
			window.removeEventListener( 'keyup', _keyup );

		};

		const _pointermove = this.pointermove.bind( this );
		const _pointerdown = this.pointerdown.bind( this );
		const _pointerup = this.pointerup.bind( this );
		const _keydown = this.keydown.bind( this );
		const _keyup = this.keyup.bind( this );
		const _mousemove = this.mousemove.bind(this);
		const _pointerlockChange = this.onPointerlockChange.bind( this );
		const _pointerlockError = this.onPointerlockError.bind( this );
		const _click = this.click.bind(this)

		this.domElement.addEventListener( 'contextmenu', contextmenu );
		this.domElement.addEventListener( 'pointerdown', _pointerdown );
		this.domElement.addEventListener( 'pointermove', _pointermove );
		this.domElement.addEventListener( 'mousemove', _mousemove );
		this.domElement.addEventListener( 'pointerup', _pointerup );
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', _pointerlockChange );
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', _pointerlockError );

		window.addEventListener( 'keydown', _keydown );
		window.addEventListener( 'keyup', _keyup );
		this.domElement.addEventListener( 'click', _click );

		this.updateMovementVector();
		this.updateRotationVector();

	}

}

function contextmenu( event ) {

	event.preventDefault();

}



export { FreePointerLockFlyControls };