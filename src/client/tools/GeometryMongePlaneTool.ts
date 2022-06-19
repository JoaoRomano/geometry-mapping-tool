import { Group, Vector2 } from "three";
import { GREEK_LETTERS } from "../config";
import { ProjectionType } from "../domain/GeometryTypes";
import { Geometry3DLineError } from "../errors/Geometry3DLineError";
import { Geometry3DPlaneError } from "../errors/Geometry3DPlaneError";
import { GeometryMongeLineError } from "../errors/GeometryMongeLineError";
import { AnglePreviewModel } from "../models/preview/AnglePreviewModel";
import { LinePreviewModel } from "../models/preview/LinePreviewModel";
import { PointPreviewModel } from "../models/preview/PointPreviewModel";
import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { Geometry3DLineService } from "../services/geometry3D/Geometry3DLineService";
import { Geometry3DPlaneService } from "../services/geometry3D/Geometry3DPlaneService";
import { GeometryMongeLineService } from "../services/geometryMonge/GeometryMongeLineService";
import { GeometryMongePointService } from "../services/geometryMonge/GeometryMongePointService";
import { createVector2, generateAngle } from "../utils";
import { Tool } from "./Tool";

export class GeometryMongePlaneTool implements Tool {
    sceneMonge: GeometryMongeScene;
    scene3D: Geometry3DScene;
    pointMongeService: GeometryMongePointService;
    lineMongeService: GeometryMongeLineService;
    line3DService: Geometry3DLineService;
    plane3DService: Geometry3DPlaneService;
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
        this.lineMongeService = new GeometryMongeLineService();
        this.line3DService = new Geometry3DLineService();
        this.plane3DService = new Geometry3DPlaneService();
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
        let toolElement = document.getElementById('planeTool');
        let horizontalToolElement = document.getElementById('horizontalPlaneTool');
        let frontalElement = document.getElementById('frontalPlaneTool');
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
        let toolElement = document.getElementById('planeTool');
        let horizontalToolElement = document.getElementById('horizontalPlaneTool');
        let frontalElement = document.getElementById('frontalPlaneTool');
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
            let labelInput = this.validateLabelInput();
            let isHorizontalOrFrontal = this.isHorizontalOrFrontal();
            if (labelInput && this.linePreview) {
                try {
                    let newMongeLineProjection = this.lineMongeService.validateProjectionPlane(labelInput, this.linePreview.position1, this.linePreview.position2, this.type, isHorizontalOrFrontal);
                    if (newMongeLineProjection) {
                        this.sceneMonge.addObject(newMongeLineProjection.model.group);
                    }
                    let new3DLineProjection = this.line3DService.createPlaneLineProjection(labelInput, this.linePreview.position1, this.linePreview.position2, this.type, isHorizontalOrFrontal);
                    if (new3DLineProjection) {
                        this.scene3D.addObject(new3DLineProjection.model.group);
                    }
                    let new3DLine = this.plane3DService.createPlane(labelInput, isHorizontalOrFrontal);
                    if (new3DLine) {
                        this.scene3D.addObject(new3DLine.model.group);
                    }
                } catch (e: any) {
                    if (e.constructor === GeometryMongeLineError || e.constructor === Geometry3DLineError || e.constructor === Geometry3DPlaneError) {
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
        const PX = this.pointMongeService.generateXPoint(P1, createVector2(firstPoint, secondPoint), this.sceneMonge.limitX);
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

    validateLabelInput(): string | null {
        let labelInput = prompt('Insira o nome do plano')?.toLowerCase();
        if (labelInput) {
            if (GREEK_LETTERS[labelInput]) {
                return decodeURI(GREEK_LETTERS[labelInput]);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    isHorizontalOrFrontal(): boolean {
        if (this.linePreview && this.linePreview.position1.y == this.linePreview.position2.y) {
            let isHorizontalOrFrontalInput = prompt('Plano de Rampa? (s/n)');
            return isHorizontalOrFrontalInput == 'n' ? true : false;
        } else {
            return false;
        }
    }
}