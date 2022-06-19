import { Color, Object3D, Scene } from "three";
import { GeometryMongeLineService } from "../services/geometryMonge/GeometryMongeLineService";
import { IGeometryScene } from "./IGeometryScene";

export class GeometryMongeScene implements IGeometryScene {
    lineMongeService: GeometryMongeLineService;
    limitX: number;
    limitY: number;
    scene: Scene;

    constructor(limitX: number, limitY: number, color: Color) {
        this.lineMongeService = new GeometryMongeLineService();
        this.limitX = limitX;
        this.limitY = limitY;
        this.scene = new Scene();
        this.scene.background = color;

        this.baseObjects();
    }

    baseObjects():void {
        const lineProjectionX = this.lineMongeService.createLineXProjection(this.limitX);
        this.scene.add(lineProjectionX.model.group);

        const lineProjectionYZ = this.lineMongeService.createLineYZProjection();
        this.scene.add(lineProjectionYZ?.model.group);
    }

    injectObjects():void {
    }

    addObject(object: Object3D):void {
        this.scene.add(object);
    }

    removeObject(object: Object3D):void {
        this.scene.remove(object);
    }
}