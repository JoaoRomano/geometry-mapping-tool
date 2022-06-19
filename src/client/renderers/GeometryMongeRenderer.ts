import { Color, OrthographicCamera, Raycaster, Vector2, Vector3, WebGLRenderer } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { IGeometryRenderer } from './IGeometryRenderer';
import { GeometryMongeScene } from '../scenes/GeometryMongeScene';
import { ToolBox } from '../tools/Toolbox';
import { COLORS, DIMENSIONS, UI } from '../config';
import { Geometry3DRenderer } from './Geometry3DRenderer';
import { Geometry3DScene } from '../scenes/Geometry3DScene';

export class GeometryMongeRenderer implements IGeometryRenderer {
    viewSize: number;
    aspectRatio: number;
    rendererElement: HTMLElement;
    renderer: WebGLRenderer;
    labelRenderer: CSS2DRenderer;
    scene: GeometryMongeScene;
    toolbox: ToolBox;
    camera: OrthographicCamera;
    pointer: Vector2;
    raycaster: Raycaster;
    controls: OrbitControls;

    private static instance: GeometryMongeRenderer;

    private constructor() {
        this.viewSize = DIMENSIONS.rendererMonge.viewSize;
        const element = document.getElementById(UI.classes.elementMonge);
        if (element) {
            this.rendererElement = element;
        } else {
            this.rendererElement = document.body;
        }
        this.aspectRatio = this.rendererElement.offsetHeight / this.rendererElement.offsetWidth;
        
        const limitX = this.viewSize;
        const limitY = this.viewSize * this.aspectRatio;
        this.scene = new GeometryMongeScene(limitX, limitY, new Color(COLORS.backgroundMonge));

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
        this.rendererElement.appendChild(this.renderer.domElement);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.rendererElement.offsetWidth, this.rendererElement.offsetHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.rendererElement.appendChild(this.labelRenderer.domElement);
        
        this.camera = new OrthographicCamera(
            -this.viewSize - DIMENSIONS.rendererMonge.viewSizeExcess.x,
            this.viewSize + DIMENSIONS.rendererMonge.viewSizeExcess.x,
            this.aspectRatio * this.viewSize + DIMENSIONS.rendererMonge.viewSizeExcess.y,
            -this.aspectRatio * this.viewSize - DIMENSIONS.rendererMonge.viewSizeExcess.y,
            DIMENSIONS.rendererMonge.near,
            DIMENSIONS.rendererMonge.far,
        );
        this.camera.position.set( 0, 0, 1000 );

        this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
        this.controls.enableRotate = false;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;

        this.raycaster = new Raycaster();
        this.pointer = new Vector2(1, 1);
        
        this.scene.injectObjects();
        
        this.toolbox = new ToolBox(this.scene, Geometry3DRenderer.getInstance().scene as Geometry3DScene);
        if (this.toolbox.toolboxElement) {
            document.body.appendChild(this.toolbox.toolboxElement);
        }
        
        window.addEventListener('resize', () => this.windowResize());
        window.addEventListener('keypress', (event) => this.onKeyPress(event))
        
        this.rendererElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.rendererElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
    }

    public static getInstance():GeometryMongeRenderer {
        if (GeometryMongeRenderer.instance == null) {
            GeometryMongeRenderer.instance = new GeometryMongeRenderer();
        }
        return GeometryMongeRenderer.instance;
    }

    /*
                 +y
                 |
                 |
        -x ------|------ +x
                 |  
                 |
                 -y
    */

    onMouseMove(event: MouseEvent):void {
        const pointer = new Vector2();
        pointer.x = ((event.clientX / window.innerWidth * 2 - 1.5) * 2) * (this.viewSize + 1);
	    pointer.y = -((event.clientY / window.innerHeight * 2 - 1) * (this.aspectRatio * this.viewSize + 1));
        pointer.x = Number.parseFloat((pointer.x).toFixed(1));
        pointer.y = Number.parseFloat((pointer.y).toFixed(1));
        if (this.toolbox.activeTool) {
            this.toolbox.activeTool.onMouseMove(pointer);
        }   
    }

    onMouseDown(event: MouseEvent):void {
        const pointer = new Vector2();
        pointer.x = (((event.clientX / window.innerWidth * 2 - 1.5) * 2) * (this.viewSize + 1));
	    pointer.y = -((event.clientY / window.innerHeight * 2 - 1) * (this.aspectRatio * this.viewSize + 1));
        pointer.x = Number.parseFloat((pointer.x).toFixed(1));
        pointer.y = Number.parseFloat((pointer.y).toFixed(1));
        if (this.toolbox.activeTool) {
            this.toolbox.activeTool.onMouseDown(pointer);
        }
    }

    onKeyPress(event: KeyboardEvent) {
        let key = event.key;
        this.toolbox.selectTool(key);
    }

    windowResize():void {
        this.camera.updateProjectionMatrix();
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