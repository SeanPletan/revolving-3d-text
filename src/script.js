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
				skull,
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

				//

				const loader = new FontLoader();
				loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

					const geometry = new TextGeometry( 'Sean Pletan, Developer Sean Pletan, Developer', {
						font: font,
						size: 0.21,
						depth: .1,
						curveSegments: 36
					} );

					geometry.rotateX( Math.PI );

					const material = new THREE.MeshPhysicalMaterial( {
						color: 0x000000,
					} );

					const objectToCurve = new THREE.Mesh( geometry, material );

					flow = new Flow( objectToCurve );
					flow.updateCurve( 0, curve );
					scene.add( flow.object3D );
				} );




				const rgbeLoader = new RGBELoader()
				rgbeLoader.load(
					'env_map.hdr',
					(environmentMap) =>
					{
						environmentMap.mapping = THREE.EquirectangularReflectionMapping

						scene.background = environmentMap
						scene.environment = environmentMap
					})


				const gltfLoader = new GLTFLoader();
				gltfLoader.load(
					'skull_fin.glb', 
					( gltf ) => 
						{
							console.log(gltf)
							skull = gltf.scene
							skull.scale.set(3,3,3)
							skull.position.y = .2
							skull.rotation.y = Math.PI
							scene.add(skull)

						} 
					);

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

			//const clock = new THREE.Clock()
			function animate() {
				if ( flow ) 
				{
					flow.moveAlongCurve( -0.0005 );
				}
				render()
			}

			function render() {

				renderer.render( scene, camera );

				stats.update();

			}