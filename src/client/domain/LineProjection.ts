import { Vector3 } from "three";
import { LineProjection3DModel } from "../models/lineProjections3D/LineProjection3DModel";

export class LineProjection {
    labels: string[];
    position: Vector3;
    angle: number;
    vector: Vector3;
    model: LineProjection3DModel;
    
    constructor(labels: string[], position: Vector3, angle: number, vector: Vector3, model: LineProjection3DModel) {
        this.labels = labels;
        this.position = position;
        this.angle = angle;
        this.vector = vector;
        this.model = model;
    }

    addLabel(label: string) {
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