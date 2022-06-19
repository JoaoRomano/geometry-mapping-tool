import { Group, Vector2 } from "three";
import { GREEK_LETTERS } from "../config";
import { AuxillaryToolModes, ProjectionType } from "../domain/GeometryTypes";
import { MongeLineProjection } from "../domain/MongeLineProjection";
import { Geometry3DLineError } from "../errors/Geometry3DLineError";
import { Geometry3DPlaneError } from "../errors/Geometry3DPlaneError";
import { GeometryMongeLineError } from "../errors/GeometryMongeLineError";
import { LinePreviewModel } from "../models/preview/LinePreviewModel";
import { PointPreviewModel } from "../models/preview/PointPreviewModel";
import { GeometryMongeRenderer } from "../renderers/GeometryMongeRenderer";
import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { Geometry3DLineService } from "../services/geometry3D/Geometry3DLineService";
import { Geometry3DPlaneService } from "../services/geometry3D/Geometry3DPlaneService";
import { GeometryMongeLineService } from "../services/geometryMonge/GeometryMongeLineService";
import { GeometryMongePointService } from "../services/geometryMonge/GeometryMongePointService";
import { perpendicularVector2 } from "../utils";
import { Tool } from "./Tool";

export class GeometryMongeAuxillaryLineTool implements Tool {
    sceneMonge: GeometryMongeScene;
    scene3D: Geometry3DScene;
    pointMongeService: GeometryMongePointService;
    lineMongeService: GeometryMongeLineService;
    line3DService: Geometry3DLineService;
    plane3DService: Geometry3DPlaneService;
    active: boolean;
    mode: AuxillaryToolModes;
    selected: boolean; 
    pickedProjection: MongeLineProjection | null;
    pointPreview: PointPreviewModel | null;
    linePreview: LinePreviewModel | null;
    group: Group;

    constructor(sceneMonge: GeometryMongeScene, scene3D: Geometry3DScene) {
        this.sceneMonge = sceneMonge;
        this.scene3D = scene3D;
        this.pointMongeService = new GeometryMongePointService();
        this.lineMongeService = new GeometryMongeLineService();
        this.line3DService = new Geometry3DLineService();
        this.plane3DService = new Geometry3DPlaneService();
        this.active = false; 
        this.mode = 'parallel';  
        this.selected = false;
        this.pickedProjection = null;
        this.pointPreview = null;
        this.linePreview = null; 
        this.group = new Group();
    }

    activate(): boolean {
        this.active = true;
        let toolElement = document.getElementById('auxillaryLineTool');
        let parallelToolElement = document.getElementById('parallelLineTool');
        let perpendicularElement = document.getElementById('perpendicularLineTool');
        if (toolElement) {
            toolElement.style.backgroundColor = "#00FF00";
        }
        if (this.mode == 'parallel') {
            if (parallelToolElement && perpendicularElement) {
                parallelToolElement.style.backgroundColor = "#00FF00";
                perpendicularElement.style.backgroundColor = "#FFFFFF";
            }
        } else {
            if (parallelToolElement && perpendicularElement) {
                parallelToolElement.style.backgroundColor = "#FFFFFF";
                perpendicularElement.style.backgroundColor = "#00FF00";
            }
        }
        this.sceneMonge.addObject(this.group);
        return true;
    }

    deactivate(): boolean {
        this.active = false;
        let toolElement = document.getElementById('auxillaryLineTool');
        let parallelToolElement = document.getElementById('parallelLineTool');
        let perpendicularElement = document.getElementById('perpendicularLineTool');
        if (toolElement && parallelToolElement && perpendicularElement) {
            toolElement.style.backgroundColor = "#FFFFFF";
            parallelToolElement.style.backgroundColor = "#FFFFFF";
            perpendicularElement.style.backgroundColor = "#FFFFFF";
        }
        this.selected = false;
        this.resetPreview();
        this.deselectObject();
        this.sceneMonge.removeObject(this.group);
        this.pickedProjection = null;
        return true;
    }

    resetPreview(): void {
        if (this.pointPreview) {
            this.group.remove(this.pointPreview.group);
            this.pointPreview.label.removeLabels();
        }
        if (this.linePreview) {
            this.group.remove(this.linePreview.group);
        }
        this.pointPreview = null;
        this.linePreview = null;
    }

    setMode(mode: AuxillaryToolModes): void {
        this.mode = mode;
    }

    onMouseMove(pointer: Vector2): void {        
        if (!this.selected) {
            this.onMouseMovePicking(pointer);
        } else {
            this.updatePointPreview(pointer);
            if (this.pickedProjection && this.linePreview) {
                this.group.remove(this.linePreview.group);
                this.linePreview = this.generateLinePreview(
                    pointer, 
                    this.mode === 'parallel' ? this.pickedProjection.vector : perpendicularVector2(this.pickedProjection.vector)
                );
                this.group.add(this.linePreview.group);
            }
        }
    }

    onMouseDown(pointer: Vector2): void {
        if (this.pickedProjection) {
            if (this.selected) {
                const responseLabel = prompt("Plano (p) ou reta (r)?");
                if (responseLabel == 'r') {
                    this.onMouseDownLine();
                } else if (responseLabel == 'p') {
                    this.onMouseDownPlane();
                }
            } else {
                this.selected = true;
                this.pointPreview = this.generatePointPreview(pointer);
                this.group.add(this.pointPreview.group);
                if (this.pickedProjection) {
                    this.linePreview = this.generateLinePreview(
                        pointer, 
                        this.mode === 'parallel' ? this.pickedProjection.vector : perpendicularVector2(this.pickedProjection.vector)
                    );
                    this.group.add(this.linePreview.group);
                }
            }
        }
    }

    onMouseMovePicking(pointer: Vector2): void {
        const renderer = GeometryMongeRenderer.getInstance();
        const normalPointer = new Vector2(
            pointer.x / (renderer.viewSize + 1), 
            pointer.y / (renderer.aspectRatio * renderer.viewSize + 1)
        );
        renderer.raycaster.setFromCamera( normalPointer, renderer.camera );

        // calculate objects intersecting the picking ray
        const intersects = renderer.raycaster.intersectObjects( renderer.scene.scene.children );
        let selectedProjection = false;
        if (intersects.length > 0) {
            let intersectedObject = intersects[0].object;
            if (intersectedObject.parent) {
                let group = intersectedObject.parent as Group;
                const arr = group.name.split('_');
                if (arr.length == 3) {
                    const type = arr[0];
                    const label = arr[2];
                    if (type == 'line') {                        
                        const lineProjection = this.lineMongeService.getLineProjectionByLabel(label);
                        selectedProjection = lineProjection ? true : false;
                        if (lineProjection && lineProjection != this.pickedProjection) {
                            this.deselectObject();
                            this.selectObject(lineProjection);
                        }
                    }
                }
            }
        }
        if (!selectedProjection) {
            this.deselectObject();
        }
    }

    onMouseDownLine(): void {
        let labelInput = prompt("Insira o nome da projecao: (ex: r1)");
        if (labelInput && labelInput.length == 2 && this.linePreview) {
            try {
                if (labelInput[1] == '1' || labelInput[1] == '2') {
                    const type = labelInput[1] == '1' ? 'horizontal' : 'frontal';
                    let newMongeLineProjection = this.lineMongeService.validateProjectionLine(labelInput[0], this.linePreview.position1, this.linePreview.position2, type);
                    if (newMongeLineProjection) {
                        this.sceneMonge.addObject(newMongeLineProjection.model.group);
                    }
                    let new3DLineProjection = this.line3DService.createLineProjection(labelInput[0], this.linePreview.position1, this.linePreview.position2, type);
                    if (new3DLineProjection) {
                        this.scene3D.addObject(new3DLineProjection.model.group);
                    }
                    let new3DLine = this.line3DService.createLine(labelInput[0]);
                    if (new3DLine) {
                        this.scene3D.addObject(new3DLine.model.group);
                    }
                }
            } catch (e: any) {
                if (e.constructor === GeometryMongeLineError || e.constructor === Geometry3DLineError) {
                    alert(e.message);
                }
            } finally {
                this.resetPreview();
                this.deselectObject();
            }
        } else {
            this.resetPreview();
            this.deselectObject();
        }
    }

    onMouseDownPlane(): void {
        let labelInput = prompt("Insira o nome da projecao: (ex: halpha)");
        if (labelInput && this.linePreview) {
            try {
                let isHorizontalOrFrontal = labelInput[0] == '(' && labelInput[labelInput.length - 1] == ')';
                let type: ProjectionType | null = null;
                let name = null;
                if (isHorizontalOrFrontal) {
                    type = labelInput[1] == 'f' ? 'frontal' : labelInput[1] == 'h' ? 'horizontal' : null;
                    name = GREEK_LETTERS[labelInput.slice(2, labelInput.length - 1)];
                } else {
                    type = labelInput[0] == 'f' ? 'frontal' : labelInput[0] == 'h' ? 'horizontal' : null;
                    name = GREEK_LETTERS[labelInput.slice(1, labelInput.length)];
                }
                if (type != null && name != null) {
                    name = decodeURI(name);
                    let newMongeLineProjection = this.lineMongeService.validateProjectionPlane(name, this.linePreview.position1, this.linePreview.position2, type, isHorizontalOrFrontal);
                    if (newMongeLineProjection) {
                        this.sceneMonge.addObject(newMongeLineProjection.model.group);
                    }
                    let new3DLineProjection = this.line3DService.createPlaneLineProjection(name, this.linePreview.position1, this.linePreview.position2, type, isHorizontalOrFrontal);
                    if (new3DLineProjection) {
                        this.scene3D.addObject(new3DLineProjection.model.group);
                    }
                    let new3DLine = this.plane3DService.createPlane(name, isHorizontalOrFrontal);
                    if (new3DLine) {
                        this.scene3D.addObject(new3DLine.model.group);
                    }
                }
            } catch (e: any) {
                if (e.constructor === GeometryMongeLineError || e.constructor === Geometry3DLineError || e.constructor === Geometry3DPlaneError) {
                    alert(e.message);
                }
            } finally {
                this.resetPreview();
                this.deselectObject();
            }
        } else {
            this.resetPreview();
            this.deselectObject();
        }
    }

    selectObject(projection: MongeLineProjection): void {
        this.pickedProjection = projection;
        this.pickedProjection.model.setColor('#FF0000');
    }

    deselectObject(): void {
        if (this.pickedProjection) {
            this.pickedProjection.model.setColorDefault();
        }
        this.pickedProjection = null;
    }

    generatePointPreview(pointer: Vector2): PointPreviewModel {
        let pointPreview = new PointPreviewModel(pointer.x, pointer.y);
        pointPreview.setPosition(new Vector2(pointer.x, pointer.y));
        pointPreview.setLabels([`(${-pointer.x.toFixed(1)},${-pointer.y.toFixed(1)})`]);
        return pointPreview;
    }

    generateLinePreview(pointer: Vector2, vector: Vector2): LinePreviewModel {
        const P1 = this.pointMongeService.generateFirstPreviewPoint(pointer, vector, this.sceneMonge.limitX, this.sceneMonge.limitY);
        const P2 = this.pointMongeService.generateSecondPreviewPoint(pointer, vector, this.sceneMonge.limitX, this.sceneMonge.limitY);
        return new LinePreviewModel(P1, P2);
    }

    updatePointPreview(pointer: Vector2): void {
        if (this.pointPreview) {
            this.pointPreview.setPosition(new Vector2(pointer.x, pointer.y));
            this.pointPreview.setLabels([`(${-pointer.x.toFixed(1)},${-pointer.y.toFixed(1)})`]);
        }
    }
}