import * as THREE from 'three';
			import { TransformControls } from 'three/addons/controls/TransformControls.js';
			import Stats from 'three/addons/libs/stats.module.js';
			import { Flow } from 'three/addons/modifiers/CurveModifier.js';
			import { FontLoader } from 'three/addons/loaders/FontLoader.js';
			import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
            import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
            import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
            import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

			const ACTION_SELECT = 1, ACTION_NONE = 0;
			const curveHandles = [];
			const mouse = new THREE.Vector2();

			let stats;
			let scene,
				camera,
				renderer,
				rayCaster,
				control,
				flow,
				action = ACTION_NONE;

			init();

			function init() {

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera(
					40,
					window.innerWidth / window.innerHeight,
					1,
					1000
				);
				camera.position.set( 0, 0, 5 );
				camera.lookAt( scene.position );

				let initialPoints = [
					{x: 0, z: 1, y: 0},
                    {x: .707, z: .707, y: 0},
					{x: 1, z: 0, y: 0},
                    {x: .707, z: -.707, y: 0},
					{x: 0, z: -1, y:  0},
                    {x: -.707, z: -.707, y: 0},
					{x: - 1, z: 0, y: 0},
                    {x: -.707, z: .707, y: 0},
				];


				const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
				const boxMaterial = new THREE.MeshBasicMaterial();
                //const size = 10; const divisions = 10; const gridHelper = new THREE.GridHelper( size, divisions ); scene.add( gridHelper );

				for ( const handlePos of initialPoints ) {

					const handle = new THREE.Mesh( boxGeometry, boxMaterial );
					handle.position.copy( handlePos );
					curveHandles.push( handle );
					//scene.add( handle );

				}

				const curve = new THREE.CatmullRomCurve3(
					curveHandles.map( ( handle ) => handle.position )
				);
				curve.curveType = 'centripetal';
				curve.closed = true;

				//const points = curve.getPoints( 50 );
				// const line = new THREE.LineLoop(
				// 	new THREE.BufferGeometry().setFromPoints( points ),
				// 	new THREE.LineBasicMaterial( { color: 0x00ff00 } )
				// );

				// scene.add( line );

				//

				const light = new THREE.DirectionalLight( 0xffaa33, 3 );
				light.position.set( - 10, 10, 10 );
				scene.add( light );

				const light2 = new THREE.AmbientLight( 0x003973, 3 );
				scene.add( light2 );

				//

				const loader = new FontLoader();
				loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

					const geometry = new TextGeometry( 'Sean Pletan Developer Sean Pletan Developer', {
						font: font,
						size: 0.213,
						depth: 0.05,
						curveSegments: 12,
						bevelEnabled: true,
						bevelThickness: 0.02,
						bevelSize: 0.01,
						bevelOffset: 0,
						bevelSegments: 5,
					} );

					geometry.rotateX( Math.PI );

					const material = new THREE.MeshStandardMaterial( {
						color: 0x99ffff
					} );

					const objectToCurve = new THREE.Mesh( geometry, material );

					flow = new Flow( objectToCurve );
					flow.updateCurve( 0, curve );
					scene.add( flow.object3D );


                    new RGBELoader()
                    .load( 'public/env_map.hdr', function ( texture ) {
            
                        texture.mapping = THREE.EquirectangularReflectionMapping;
            
                        scene.background = texture;
                        scene.environment = texture;
            
                        render();
            
                        // model
                        const loader = new GLTFLoader();
                        loader.load('public/skull_fin.glb', async function ( gltf ) {
            
                            const model = gltf.scene;
            
                            // wait until the model can be added to the scene without blocking due to shader compilation
            
                            await renderer.compileAsync( model, camera, scene );
                            model.rotation.y = 3.14;
            
                            scene.add( model );
            
                            render();
                        } );
                    } );
                    










				} );

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				renderer.domElement.addEventListener( 'pointerdown', onPointerDown );

				rayCaster = new THREE.Raycaster();
				control = new OrbitControls( camera, renderer.domElement );
				control.addEventListener( 'dragging-changed', function ( event ) {

					if ( ! event.value ) {

						const points = curve.getPoints( 50 );
						line.geometry.setFromPoints( points );
						flow.updateCurve( 0, curve );

					}

				} );

				stats = new Stats();
				document.body.appendChild( stats.dom );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onPointerDown( event ) {

				action = ACTION_SELECT;
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			}

			function animate() {

				if ( action === ACTION_SELECT ) {

					rayCaster.setFromCamera( mouse, camera );
					action = ACTION_NONE;
					const intersects = rayCaster.intersectObjects( curveHandles, false );
					if ( intersects.length ) {

						const target = intersects[ 0 ].object;
						control.attach( target );
						scene.add( control.getHelper() );

					}

				}

				if ( flow ) {

					flow.moveAlongCurve( -0.001 );

				}

				render();

			}

			function render() {

				renderer.render( scene, camera );

				stats.update();

			}