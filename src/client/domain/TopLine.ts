import { Vector3 } from "three";
import { LineModel } from "../models/lines/LineModel";
import { Line } from "./Line";
import { LineProjection } from "./LineProjection";
import { PointProjection } from "./PointProjection";

export class TopLine extends Line {
    horizontalProjection: LineProjection;
    frontalProjection: PointProjection;

    constructor(labels: string[], position: Vector3, vector: Vector3, horizontalProjection: LineProjection, frontalProjection: PointProjection, model: LineModel) {
        super(labels, position, vector, model);
        this.horizontalProjection = horizontalProjection;
        this.frontalProjection = frontalProjection;
    }
}