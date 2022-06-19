import { Group, Vector2 } from "three";
import { ProjectionType } from "../domain/GeometryTypes";
import { Geometry3DLineError } from "../errors/Geometry3DLineError";
import { GeometryMongeLineError } from "../errors/GeometryMongeLineError";
import { GeometryMongePointError } from "../errors/GeometryMongePointError";
import { AnglePreviewModel } from "../models/preview/AnglePreviewModel";
import { LinePreviewModel } from "../models/preview/LinePreviewModel";
import { PointPreviewModel } from "../models/preview/PointPreviewModel";
import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { Geometry3DLineService } from "../services/geometry3D/Geometry3DLineService";
import { Geometry3DPointService } from "../services/geometry3D/Geometry3DPointService";
import { GeometryMongeLineService } from "../services/geometryMonge/GeometryMongeLineService";
import { GeometryMongePointService } from "../services/geometryMonge/GeometryMongePointService";
import { createVector2, generateAngle } from "../utils";
import { Tool } from "./Tool";

export class GeometryMongeLineTool implements Tool {
    sceneMonge: GeometryMongeScene;
    scene3D: Geometry3DScene;
    pointMongeService: GeometryMongePointService;
    point3DService: Geometry3DPointService;
    lineMongeService: GeometryMongeLineService;
    line3DService: Geometry3DLineService;
    active: boolean;
    pointer: Vector2;
    type: ProjectionType;
    firstPoint: PointPreviewModel | null;
    pointPreview: PointPreviewModel;
    linePreview: LinePreviewModel | null;
    anglePreview: AnglePreviewModel | null;
    group: Group;

    constructor(sceneMonge: GeometryMongeScene, scene3D: Geometry3DScene) {
        this.sceneMonge = sceneMonge;
        this.scene3D = scene3D;
        this.pointMongeService = new GeometryMongePointService();
        this.point3DService = new Geometry3DPointService();
        this.lineMongeService = new GeometryMongeLineService();
        this.line3DService = new Geometry3DLineService();
        this.active = false;
        this.pointer = new Vector2();
        this.type = 'horizontal';
        this.firstPoint = null;
        this.pointPreview = new PointPreviewModel(this.pointer.x, this.pointer.y);
        this.linePreview = null;
        this.anglePreview = null;
        this.group = new Group();
        this.group.add(this.pointPreview.group);
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
        let toolElement = document.getElementById('lineTool');
        let horizontalToolElement = document.getElementById('horizontalLineTool');
        let frontalElement = document.getElementById('frontalLineTool');
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
        this.sceneMonge.addObject(this.group);
        return true;
    }

    deactivate(): boolean {
        this.sceneMonge.removeObject(this.group);
        this.pointPreview.label.removeLabels();
        this.resetPreview();
        this.active = false;
        let toolElement = document.getElementById('lineTool');
        let horizontalToolElement = document.getElementById('horizontalLineTool');
        let frontalElement = document.getElementById('frontalLineTool');
        if (toolElement && horizontalToolElement && frontalElement) {
            toolElement.style.backgroundColor = "#FFFFFF";
            horizontalToolElement.style.backgroundColor = "#FFFFFF";
            frontalElement.style.backgroundColor = "#FFFFFF";
        }
        return true;
    }

    resetPreview(): void {
        if (this.firstPoint) {
            this.group.remove(this.firstPoint.group);
            this.firstPoint.label.removeLabels();
        }
        if (this.linePreview) {
            this.group.remove(this.linePreview.group);
        }
        if (this.anglePreview) {
            this.group.remove(this.anglePreview.group);
            this.anglePreview.removeLabels();
        }
        this.firstPoint = null;
        this.linePreview = null;
        this.anglePreview = null;
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

        if (this.firstPoint) {
            if (this.linePreview) {
                this.group.remove(this.linePreview.group);
            }
            if (this.anglePreview) {
                this.group.remove(this.anglePreview.group);
                this.anglePreview.removeLabels();
            }
            if (this.firstPoint.position.x != this.pointer.x || this.firstPoint.position.y != this.pointer.y) {
                this.linePreview = this.generateLinePreview(this.firstPoint.position, this.pointer);
                this.group.add(this.linePreview.group);
            }
        }
    }

    onMouseDown(pointer: Vector2): void {
        this.pointer = pointer;
        if (this.firstPoint) {
            let labelInput = prompt('Insira o nome da reta')?.toLowerCase().substring(0,1);
            if (labelInput && this.firstPoint) {
                try {
                    if (this.linePreview && (this.pointer.x != this.firstPoint.position.x || this.pointer.y != this.firstPoint.position.y)) {
                        let newMongeLineProjection = this.lineMongeService.validateProjectionLine(labelInput, this.linePreview.position1, this.linePreview.position2, this.type);
                        if (newMongeLineProjection) {
                            this.sceneMonge.addObject(newMongeLineProjection.model.group);
                        }
                        let new3DLineProjection = this.line3DService.createLineProjection(labelInput, this.linePreview.position1, this.linePreview.position2, this.type);
                        if (new3DLineProjection) {
                            this.scene3D.addObject(new3DLineProjection.model.group);
                        }
                    } else {
                        let newMongePointProjection = this.pointMongeService.createLinePointProjection(labelInput, this.firstPoint.position, this.type);
                        if (newMongePointProjection) {
                            this.sceneMonge.addObject(newMongePointProjection.model.group);
                        }
                        let new3DPointProjection = this.point3DService.createLinePointProjection(labelInput, this.firstPoint.position, this.type);
                        if (new3DPointProjection) {
                            this.scene3D.addObject(new3DPointProjection.model.group);
                        }
                    }
                    let new3DLine = this.line3DService.createLine(labelInput);
                    if (new3DLine) {
                        this.scene3D.addObject(new3DLine.model.group);
                    }
                } catch (e: any) {
                    if (e.constructor === GeometryMongeLineError || e.constructor === GeometryMongePointError || e.constructor === Geometry3DLineError) {
                        alert(e.message);
                    }
                } finally {
                    this.resetPreview();
                }
            } else {
                this.resetPreview();
            }
        } else if (this.firstPoint == null) {
            this.firstPoint = new PointPreviewModel(this.pointer.x, this.pointer.y);
            this.firstPoint.label.setLabels([`(${-this.pointer.x.toFixed(1)},${-this.pointer.y.toFixed(1)})`]);
            this.group.add(this.firstPoint.group);
        }
    }

    generateLinePreview(firstPoint: Vector2, secondPoint: Vector2): LinePreviewModel {
        const P1 = this.pointMongeService.generateFirstPreviewPoint(firstPoint, createVector2(firstPoint, secondPoint), this.sceneMonge.limitX, this.sceneMonge.limitY);
        const P2 = this.pointMongeService.generateSecondPreviewPoint(firstPoint, createVector2(secondPoint, firstPoint), this.sceneMonge.limitX, this.sceneMonge.limitY);
        const PX = this.pointMongeService.generateXPoint(P1, createVector2(P1, P2), this.sceneMonge.limitX);
        if (this.anglePreview) {
            this.group.remove(this.anglePreview.group);
            this.anglePreview.removeLabels();
        }
        const radians = generateAngle(P2, P1);
        if (PX) {
            this.anglePreview = new AnglePreviewModel(PX, radians);
            this.group.add(this.anglePreview.group);
        }
        return new LinePreviewModel(P1, P2);
    }
}