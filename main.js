import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

function drawCube() {
	if (WebGL.isWebGL2Available()) {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		camera.position.z = 5;

		function animate() {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			renderer.render(scene, camera);
		}
		renderer.setAnimationLoop(animate);

	} else {
		const warning = WebGL.getWebGL2ErrorMessage();
		document.getElementById('body').appendChild(warning);
	}
}

class CTank extends THREE.Object3D {

	constructor(width, height, depth) {
		super();

		this.width = width;
		this.height = height;
		this.depth = depth;

		this.group = new THREE.Group();

		this.#createMainMesh();
		this.group.add(this.mainMesh);

		this.#createOutlineLineSegments();
		this.group.add(this.outlineLineSegments);

	}

	#createOutlineLineSegments() {
		this.outlineGeometry = new THREE.EdgesGeometry(this.mainGeometry);
		this.outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
		this.outlineLineSegments = new THREE.LineSegments(this.outlineGeometry, this.outlineMaterial);
	}

	#createMainMesh() {
		this.mainGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
		this.mainMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.3,
			side: THREE.DoubleSide, // make sure both sides of the box are renderer
		});
		this.mainMesh = new THREE.Mesh(this.mainGeometry, this.mainMaterial);
	}

	getTankGroup() {
		return this.group;
	}

	setRenderOrder(renderOrder) {
		this.mainMesh.renderOrder = renderOrder;
		this.outlineLineSegments.renderOrder = renderOrder;
	}

};

class CParticle extends THREE.Object3D {

	constructor() {
		super();

		this.mainGeometry = new THREE.SphereGeometry(1, 16, 16); // actual particle radius = 0.1 for fluid
		// ToDo : can this material be common instead of individual
		this.mainMaterial = new THREE.MeshStandardMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.8
		});
		this.mainMesh = new THREE.Mesh(this.mainGeometry, this.mainMaterial);
	}

	getParticle() {
		return this.mainMesh;
	}

	setRenderOrder(renderOrder) {
		this.mainMesh.renderOrder = renderOrder;
	}
}


function drawTank() {
	let renderRequested = false;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x333333); // Gray color (hex: #808080)

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Create a cuboidal tank
	/*const geometry = new THREE.BoxGeometry(10, 5, 10);
	const material = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.3,
		side: THREE.DoubleSide // make sure both sides of the box are rendered
	});
	const tank = new THREE.Mesh(geometry, material);
	tank.position.y = 2;*/

	const particle = new CParticle();
	scene.add(particle.getParticle());
	particle.renderOrder = 1;


	const tank = new CTank(10, 5, 10);
	scene.add(tank.getTankGroup());
	tank.renderOrder = 2;

	// outline geometry
	/*const edges = new THREE.EdgesGeometry(geometry);
	const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
	const outline = new THREE.LineSegments(edges, outlineMaterial);
	scene.add(outline);*/

	// lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0xffffff, 1, 100);
	pointLight.position.set(10, 10, 10);
	scene.add(pointLight);

	// camera position
	camera.position.z = 15;
	camera.position.y = 5;

	// Add orbit controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = true;

	// Render function
	function render() {
		renderRequested = false;
		renderer.render(scene, camera);
	}

	// Initial render
	render();

	// Render on control changes
	controls.addEventListener('change', render);

	// Handle window resize
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		render();
	});
}


// Call the function to initialize the scene
//drawCube();

drawTank();

