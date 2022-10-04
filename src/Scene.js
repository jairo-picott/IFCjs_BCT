import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer, GridHelper, AxesHelper, Raycaster, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//import Stats from 'stats.js/scr/Stats';

export class ThreeScene {

    constructor() {
        this.threeCanvas = document.getElementById('three-canvas');
        this.scene = new Scene();
        this.viewportSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        this.camera = new PerspectiveCamera(75, this.viewportSize.width / this.viewportSize.height);
        this.renderer = new WebGLRenderer({ alpha: true, canvas: this.threeCanvas });
        this.controls = new OrbitControls(this.camera, this.threeCanvas);
        this.axes = new AxesHelper();
        //this.stats = new Stats();
        //this.grid = new GridHelper();
        this.setupScene();
    }

    setupScene() {
        this.setupBasics();
        this.setupLights();
        this.setupWindowResize();
        this.setupAxes();
        //this.setupMonitoring();
        this.setupAnimation();
        this.setupCamera();
        //this.scene.add(this.grid)
    }


    setupAxes() {
        this.axes.material.depthTest = false;
        this.axes.renderOrder = 1;
        this.scene.add(this.axes);
        console.log("Axes done!");
    }

    setupAnimation = () => {
        this.controls.enableDamping = true;
        this.controls.target.set(-2, 0, 0);
        const animate = () => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        }
    }

    setupBasics() {
        this.renderer.setSize(this.viewportSize.width, this.viewportSize.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    setupLights() {
        const lightColor = 0xffffff;
        const ambientLight = new AmbientLight(lightColor, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(lightColor, 1);
        directionalLight.position.set(0, 10, 0);
        directionalLight.target.position.set(-5, 0, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            this.viewportSize.width = window.innerWidth;
            this.viewportSize.height = window.innerHeight;
            this.camera.aspect = this.viewportSize.width / this.viewportSize.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.viewportSize.width, this.viewportSize.height);
        });
    }


    /*
    setupMonitoring() {
        this.stats.showPanel(0);
        this.stats.dom.style.cssText = 'position:absolute;top:1rem;left:1rem;z-index:1';
        document.body.appendChild(this.stats.dom);
    }*/

    setupCamera() {
        this.camera.position.z = 15;
        this.camera.position.y = 13;
        this.camera.position.x = 8;
    }
}