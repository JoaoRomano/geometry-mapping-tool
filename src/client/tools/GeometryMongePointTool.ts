import { Vector2 } from "three";
import { ProjectionType } from "../domain/GeometryTypes";
import { Geometry3DPointError } from "../errors/Geometry3DPointError";
import { GeometryMongePointError } from "../errors/GeometryMongePointError";
import { PointPreviewModel } from "../models/preview/PointPreviewModel";
import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { Geometry3DPointService } from "../services/geometry3D/Geometry3DPointService";
import { GeometryMongePointService } from "../services/geometryMonge/GeometryMongePointService";
import { ITool } from "./Tool";

export class GeometryMongePointTool implements ITool {
    sceneMonge: GeometryMongeScene;
    scene3D: Geometry3DScene;
    pointMongeService: GeometryMongePointService;
    point3DService: Geometry3DPointService;
    active: boolean;
    type: ProjectionType;
    pointer: Vector2;
    pointPreview: PointPreviewModel;

    constructor(sceneMonge: GeometryMongeScene, scene3D: Geometry3DScene) {
        this.sceneMonge = sceneMonge;
        this.scene3D = scene3D;
        this.pointMongeService = new GeometryMongePointService();
        this.point3DService = new Geometry3DPointService();
        this.active = false;
        this.type = 'horizontal';
        this.pointer = new Vector2();
        this.pointPreview = new PointPreviewModel(this.pointer.x, this.pointer.y);
    }

    setType(type: ProjectionType): void {
        this.type = type;
        if (this.type === 'horizontal') {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${(-this.pointer.y).toFixed(1)})`]);
        } else {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${this.pointer.y.toFixed(1)})`]);
        }
    }

    activate(): boolean {
        this.active = true;
        let toolElement = document.getElementById('pointTool');
        let horizontalToolElement = document.getElementById('horizontalPointTool');
        let frontalElement = document.getElementById('frontalPointTool');
        if (toolElement) {
            toolElement.style.backgroundColor = "#00FF00";
        }
        if (this.type == 'horizontal') {
            if (horizontalToolElement && frontalElement) {
                horizontalToolElement.style.backgroundColor = "#00FF00";
                frontalElement.style.backgroundColor = "#FFFFFF";
            }
        } else {
            if (horizontalToolElement && frontalElement) {
                horizontalToolElement.style.backgroundColor = "#FFFFFF";
                frontalElement.style.backgroundColor = "#00FF00";
            }
        }
        if (this.type === 'horizontal') {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${(-this.pointer.y).toFixed(1)})`]);
        } else {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${this.pointer.y.toFixed(1)})`]);
        }
        this.sceneMonge.addObject(this.pointPreview.group);
        return true;
    }

    deactivate(): boolean {
        this.sceneMonge.removeObject(this.pointPreview.group);
        this.pointPreview.label.removeLabels();
        this.active = false;
        let toolElement = document.getElementById('pointTool');
        let horizontalToolElement = document.getElementById('horizontalPointTool');
        let frontalElement = document.getElementById('frontalPointTool');
        if (toolElement && horizontalToolElement && frontalElement) {
            toolElement.style.backgroundColor = "#FFFFFF";
            horizontalToolElement.style.backgroundColor = "#FFFFFF";
            frontalElement.style.backgroundColor = "#FFFFFF";
        }
        return true;
    }

    onMouseMove(pointer: Vector2): void {
        this.pointer = pointer;
        if (this.type === 'horizontal') {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${-this.pointer.y.toFixed(1)})`]);
            this.pointPreview.setPosition(new Vector2(this.pointer.x, this.pointer.y));
        } else {
            this.pointPreview.setLabels([`(${-this.pointer.x.toFixed(1)},${this.pointer.y.toFixed(1)})`]);
            this.pointPreview.setPosition(new Vector2(this.pointer.x, this.pointer.y));
        }
    }

    onMouseDown(pointer: Vector2): void {
        this.pointer = pointer;
        let labelInput = prompt('Insira o nome do ponto')?.toUpperCase().substring(0,1);
        if (labelInput) {
            try {
                const worldCoords = new Vector2(this.pointer.x, this.pointer.y);
                let newMongePoint = this.pointMongeService.createProjection(labelInput, worldCoords, this.type);
                let new3DProjection = this.point3DService.createPointProjection(labelInput, worldCoords, this.type);
                if (new3DProjection != null) {
                    this.scene3D.addObject(new3DProjection.model.group);
                }
                if (newMongePoint != null) {
                    this.sceneMonge.addObject(newMongePoint.model.group);
                }
                const point3Dcoords = this.pointMongeService.mapProjections(labelInput);
                if (point3Dcoords) {
                    const point = this.point3DService.createPoint(labelInput, point3Dcoords);
                    if (point) {
                        this.scene3D.addObject(point.model.group);
                    }
                }
            } catch (e: any) {
                if (e.constructor === GeometryMongePointError || Geometry3DPointError) {
                    alert(e.message);
                }
            }
        }
    }
}