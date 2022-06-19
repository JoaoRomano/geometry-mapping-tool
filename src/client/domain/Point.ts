import { Vector3 } from "three";
import { PointModel } from "../models/points/PointModel";
import { PointProjection } from "./PointProjection";


export class Point {
    labels: string[];
    position: Vector3;
    horizontalProjection: PointProjection;
    frontalProjection: PointProjection;
    model: PointModel;
    
    constructor(labels: string[], position: Vector3, horizontalProjection: PointProjection, frontalProjection: PointProjection, model: PointModel) {
        this.labels = labels;
        this.position = position;
        this.horizontalProjection = horizontalProjection;
        this.frontalProjection = frontalProjection;
        this.model = model;
    }

    addLabel(label: string):void {
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