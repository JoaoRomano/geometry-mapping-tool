import { Vector3 } from "three";
import { LineModel } from "../models/lines/LineModel";

export class Line {
    labels: string[];
    position: Vector3;
    vector: Vector3;
    model: LineModel;
    
    constructor(labels: string[], position: Vector3, vector: Vector3, model: LineModel) {
        this.labels = labels;
        this.position = position;
        this.vector = vector;
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