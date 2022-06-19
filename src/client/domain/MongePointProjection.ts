import { Vector2 } from "three";
import { PointProjectionModel } from "../models/pointProjections/PointProjectionModel";

export class MongePointProjection {
    labels: string[];
    worldCoords: Vector2;
    model: PointProjectionModel;

    constructor(labels: string[], worldCoords: Vector2, model: PointProjectionModel) {
        this.labels = labels;
        this.worldCoords = worldCoords;
        this.model = model;
    }

    addLabel(label: string) {
        this.labels.push(label);
        this.model.label.addLabel(label);
    }

    removeLabel(label: string) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.model.label.removeLabel(label);
        this.model.group.name = `point_projection_${this.labels[0]}`;
    }

    removeLabels(): void {
        this.model.label.removeLabels();
    }
}