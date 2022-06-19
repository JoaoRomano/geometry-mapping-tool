import { Vector3 } from "three";
import { PlaneModel } from "../models/planes/PlaneModel";
import { PlaneType } from "./GeometryTypes";

export class Plane {
    labels: string[];
    position: Vector3;
    normal: Vector3;
    type: PlaneType;
    model: PlaneModel;
    
    constructor(labels: string[], position: Vector3, normal: Vector3, type: PlaneType, model: PlaneModel) {
        this.labels = labels;
        this.position = position;
        this.normal = normal;
        this.type = type;
        this.model = model;
    }

    addLabel(label: string): void {
        this.labels.push(label);
        this.model.label.addLabel(label);
    }

    removeLabel(label: string) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.model.label.removeLabel(label);
    }

    removeLabels(): void {
        this.model.label.removeLabels();
    }
}