import { Vector3 } from "three";
import { PointProjection3DModel } from "../models/pointProjections3D/PointProjection3DModel";

export class PointProjection {
    labels: string[];
    position: Vector3;
    model: PointProjection3DModel;

    constructor(labels: string[], position: Vector3, model: PointProjection3DModel) {
        this.labels = labels;
        this.position = position;
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