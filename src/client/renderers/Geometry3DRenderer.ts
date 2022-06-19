import { Color, PerspectiveCamera, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { COLORS, DIMENSIONS, UI } from '../config';
import { Geometry3DScene } from '../scenes/Geometry3DScene';
import { IGeometryScene } from '../scenes/IGeometryScene';
import { IGeometryRenderer } from './IGeometryRenderer';

export class Geometry3DRenderer implements IGeometryRenderer {
    scale: number;
    rendererElement: HTMLElement;
    renderer: WebGLRenderer;
    labelRenderer: CSS2DRenderer;
    scene: IGeometryScene;
    camera: PerspectiveCamera;
    controls: OrbitControls;

    private static instance: Geometry3DRenderer;

    private constructor() {
        this.scale = DIMENSIONS.renderer3D.scale;
        const element = document.getElementById(UI.classes.element3D);
        if (element) {
            this.rendererElement = element;
        } else {
            this.rendererElement = document.body;
        }

        this.scene = new Geometry3DScene(this.scale, new Color(COLORS.background3D));

        this.camera = new PerspectiveCamera(DIMENSIONS.renderer3D.fov, this.rendererElement.offsetWidth / this.rendererElement.offsetHeight, DIMENSIONS.renderer3D.near, DIMENSIONS.renderer3D.far);
        this.camera.position.setFromSphericalCoords(this.scale, Math.PI / 3, Math.PI / 4);

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
        this.rendererElement.appendChild(this.renderer.domElement);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.rendererElement.appendChild(this.labelRenderer.domElement);

        this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);

        window.addEventListener('resize', () => this.windowResize());

        this.scene.injectObjects();
    }

    public static getInstance():Geometry3DRenderer {
        if (Geometry3DRenderer.instance == null) {
            Geometry3DRenderer.instance = new Geometry3DRenderer();
        }
        return Geometry3DRenderer.instance;
    }

    windowResize() {
        this.camera.updateProjectionMatrix();
        this.camera.aspect = this.rendererElement.offsetWidth / this.rendererElement.offsetHeight;
        this.renderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
        this.labelRenderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
    }

    render():void {
        this.renderer.render(this.scene.scene, this.camera);
        this.labelRenderer.render(this.scene.scene, this.camera);
    }

    update():void {
        this.controls.update();
        this.render();
    }
}
