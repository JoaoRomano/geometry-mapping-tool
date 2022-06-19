import { Group, Vector2 } from "three";
import { GREEK_LETTERS, GREEK_LETTERS_REGEX, GREEK_LETTERS_VALUES_REGEX } from "../config";
import { LineProjectionType } from "../domain/GeometryTypes";
import { MongeLineProjection } from "../domain/MongeLineProjection";
import { MongePointProjection } from "../domain/MongePointProjection";
import { GeometryMongeRenderer } from "../renderers/GeometryMongeRenderer";
import { Geometry3DScene } from "../scenes/Geometry3DScene";
import { GeometryMongeScene } from "../scenes/GeometryMongeScene";
import { Geometry3DLineService } from "../services/geometry3D/Geometry3DLineService";
import { Geometry3DPlaneService } from "../services/geometry3D/Geometry3DPlaneService";
import { Geometry3DPointService } from "../services/geometry3D/Geometry3DPointService";
import { GeometryMongeLineService } from "../services/geometryMonge/GeometryMongeLineService";
import { GeometryMongePointService } from "../services/geometryMonge/GeometryMongePointService";
import { Tool } from "./Tool";

export class GeometryMongeDeleteTool implements Tool {
    sceneMonge: GeometryMongeScene;
    scene3D: Geometry3DScene;
    pointMongeService: GeometryMongePointService;
    point3DService: Geometry3DPointService;
    lineMongeService: GeometryMongeLineService;
    line3DService: Geometry3DLineService;
    plane3DService: Geometry3DPlaneService;
    active: boolean;
    selectedProjection: MongePointProjection | MongeLineProjection | null;

    constructor(sceneMonge: GeometryMongeScene, scene3D: Geometry3DScene) {
        this.sceneMonge = sceneMonge;
        this.scene3D = scene3D;
        this.pointMongeService = new GeometryMongePointService();
        this.point3DService = new Geometry3DPointService();
        this.lineMongeService = new GeometryMongeLineService();
        this.line3DService = new Geometry3DLineService();
        this.plane3DService = new Geometry3DPlaneService();
        this.active = false;
        this.selectedProjection = null;
    }

    activate(): boolean {
        this.active = true;
        let toolElement = document.getElementById('deleteTool');
        if (toolElement) {
            toolElement.style.backgroundColor = "#00FF00";
        }
        return true;
    }

    deactivate(): boolean {
        this.active = false;
        let toolElement = document.getElementById('deleteTool');
        if (toolElement) {
            toolElement.style.backgroundColor = "#FFFFFF";
        }
        this.deselectObject();
        return true;
    }

    onMouseMove(pointer: Vector2): void {
        const renderer = GeometryMongeRenderer.getInstance();
        const normalPointer = new Vector2(
            pointer.x / (renderer.viewSize + 1), 
            pointer.y / (renderer.aspectRatio * renderer.viewSize + 1)
        );
        renderer.raycaster.setFromCamera( normalPointer, renderer.camera );

        // calculate objects intersecting the picking ray
        const intersects = renderer.raycaster.intersectObjects( renderer.scene.scene.children );
        let selected = false;
        if (intersects.length > 0) {
            let intersectedObject = intersects[0].object;
            if (intersectedObject.parent) {
                let group = intersectedObject.parent as Group;
                const arr = group.name.split('_');
                if (arr.length == 3) {
                    const type = arr[0];
                    const label = arr[2];
                    if (type == 'point') {
                        const pointProjection = this.pointMongeService.getPointProjectionByLabel(label);
                        selected = pointProjection ? true : false;
                        if (pointProjection && pointProjection != this.selectedProjection) {
                            this.deselectObject();
                            this.selectObject(pointProjection);
                        }
                    } else if (type == 'line') {
                        const lineProjection = this.lineMongeService.getLineProjectionByLabel(label);
                        selected = lineProjection ? true : false;
                        if (lineProjection && lineProjection != this.selectedProjection) {
                            this.deselectObject();
                            this.selectObject(lineProjection);
                        }
                    }
                }
            }
        }
        if (!selected) {
            this.deselectObject();
        }
    }

    onMouseDown(pointer: Vector2): void {    
        let type: LineProjectionType = 'line'; 
        if (this.selectedProjection) {
            const labels = this.selectedProjection.labels;
            let deletedLabel = labels[0];
            if (labels.length > 1) {
                let response: string | null = '';
                while (response != null && !labels.includes(response)) {
                    response = prompt(`Qual e a projecao que pretende eliminar? (${labels.join(',').toString()})`);
                    if (response) {
                        const planeRegex = new RegExp(`(f|h)${GREEK_LETTERS_REGEX}`);
                        if (planeRegex.test(response)) {
                            type = 'plane';
                            if (response[0] == '(' && response[response.length - 1] == ')') {
                                response = `(${response[1] + decodeURI(GREEK_LETTERS[response.substring(2, response.length - 1)])})`;
                            } else {
                                response = `${response[0] + decodeURI(GREEK_LETTERS[response.substring(1, response.length)])}`
                            }
                        }
                    }
                }
                if (response) {
                    deletedLabel = response;
                }
            }
            let response: string | null = '';
            while (response != null && response != 's' && response != 'n') {
                response = prompt(`Tem a certeza que quer eliminar a projecao ${deletedLabel} (s/n)`);
                if (response) {
                    const planeRegex = new RegExp(`(f|h)${GREEK_LETTERS_VALUES_REGEX}`);
                    if (planeRegex.test(deletedLabel)) {
                        type = 'plane';
                    }
                }
            }
            if (response == 's') {
                // Check if monge projection is a point or a line
                if (this.selectedProjection instanceof MongePointProjection) {
                    // Remove monge point projection
                    const removedMongeProjection = this.pointMongeService.removePointProjection(deletedLabel);
                    if (removedMongeProjection) {
                        this.sceneMonge.removeObject(removedMongeProjection.model.group);
                    }
                    // Remove 3D point projection
                    const removed3DProjection = this.point3DService.removePointProjection(deletedLabel);
                    if (removed3DProjection) {
                        this.scene3D.removeObject(removed3DProjection.model.group);
                    }
                    // Remove 3D element (point/line)
                    const lineRegex = new RegExp('\([a-z](1|2)\)');
                    if (!lineRegex.test(deletedLabel)) {
                        const removedPoint = this.point3DService.removePoint(deletedLabel[0]);
                        if (removedPoint) {
                            this.scene3D.removeObject(removedPoint.model.group);
                        }
                    } else {
                        const removedLine = this.line3DService.removeLine(deletedLabel[1]);
                        if (removedLine) {
                            this.scene3D.removeObject(removedLine.model.group);
                        }
                    }
                } else if (this.selectedProjection instanceof MongeLineProjection) {
                    // Remove monge line projection
                    const removedMongeProjection = this.lineMongeService.removeLineProjection(deletedLabel);
                    if (removedMongeProjection) {
                        this.sceneMonge.removeObject(removedMongeProjection.model.group);
                    }
                    // Remove 3D line projection
                    const removed3DProjection = this.line3DService.removeLineProjection(deletedLabel);
                    if (removed3DProjection) {
                        this.scene3D.removeObject(removed3DProjection.model.group);
                    }
                    // Remove 3D element (line/plane)
                    if (type == 'line') {
                        const removedLine = this.line3DService.removeLine(deletedLabel[0]);
                        if (removedLine) {
                            this.scene3D.removeObject(removedLine.model.group);
                        }
                    } else {
                        const removedPlane = this.plane3DService.removePlane(deletedLabel.replace('(', '').replace(')', '').substring(1, deletedLabel.length));
                        if (removedPlane) {
                            this.scene3D.removeObject(removedPlane.model.group);
                        }
                    }
                }
            }
        }
    }

    selectObject(projection: MongePointProjection | MongeLineProjection): void {
        this.selectedProjection = projection;
        this.selectedProjection.model.setColor('#FF0000');
    }

    deselectObject(): void {
        if (this.selectedProjection) {
            this.selectedProjection.model.setColorDefault();
        }
        this.selectedProjection = null;
    }
}