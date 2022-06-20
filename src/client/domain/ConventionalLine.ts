import { Vector3 } from "three";
import { LineModel } from "../models/lines/LineModel";
import { Line } from "./Line";
import { LineProjection } from "./LineProjection";

export class ConventionalLine extends Line {
    horizontalProjection: LineProjection;
    frontalProjection: LineProjection;

    constructor(labels: string[], position: Vector3, vector: Vector3, horizontalProjection: LineProjection, frontalProjection: LineProjection, model: LineModel) {
        super(labels, position, vector, model);
        this.horizontalProjection = horizontalProjection;
        this.frontalProjection = frontalProjection;
    }
}