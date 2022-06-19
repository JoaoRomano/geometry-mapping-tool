import { Object3D, Scene } from "three";

export interface IGeometryScene {
    scene: Scene;

    baseObjects():void;
    injectObjects():void;
    addObject(object: Object3D):void;
    removeObject(object: Object3D):void ;
}