import { IGeometryScene } from "../scenes/IGeometryScene";

export interface IGeometryRenderer {
    rendererElement: HTMLElement;
    renderer: THREE.WebGLRenderer;
    scene: IGeometryScene;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    windowResize():void;
    render():void;
    update():void;
}