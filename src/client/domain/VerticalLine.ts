import { Vector3 } from "three";
import { LineModel } from "../models/lines/LineModel";
import { Line } from "./Line";
import { LineProjection } from "./LineProjection";
import { PointProjection } from "./PointProjection";

export class VerticalLine extends Line {
    horizontalProjection: PointProjection;
    frontalProjection: LineProjection;

    constructor(labels: string[], position: Vector3, vector: Vector3, horizontalProjection: PointProjection, frontalProjection: LineProjection, model: LineModel) {
        super(labels, position, vector, model);
        this.horizontalProjection = horizontalProjection;
        this.frontalProjection = frontalProjection;
    }
}