import { Vector3 } from "three";
import { Line } from "../domain/Line";
import { LineProjection } from "../domain/LineProjection";
import { Plane } from "../domain/Plane";
import { Point } from "../domain/Point";
import { PointProjection } from "../domain/PointProjection";
import { equalsVector3 } from "../utils";

export class Geometry3DData {
    points: Point[];
    pointProjections: PointProjection[];
    lines: Line[];
    lineProjections: LineProjection[];
    planes: Plane[];

    private static instance: Geometry3DData;

    private constructor() {
        this.points = [];
        this.pointProjections = [];
        this.lines = [];
        this.lineProjections = [];
        this.planes = [];
    }

    public static getInstance():Geometry3DData {
        if (Geometry3DData.instance == null) {
            Geometry3DData.instance = new Geometry3DData();
        }
        return Geometry3DData.instance;
    }

    getPointProjectionByPosition(position: Vector3): PointProjection | undefined {
        return this.pointProjections.find((projection) => {
            return equalsVector3(projection.position, position);
        });
    }

    getPointProjectionByLabel(label: string): PointProjection | undefined {
        return this.pointProjections.find((projection) => {
            return projection.labels.includes(label);
        });
    }

    getPointByLabel(label: string): Point | undefined {
        return this.points.find((point) => {
            return point.labels.includes(label);
        });
    }

    getPointByPosition(position: Vector3): Point | undefined {
        return this.points.find((point) => {
            return equalsVector3(point.position, position);
        });
    }

    getLineProjectionByLabel(label: string): LineProjection | undefined {
        return this.lineProjections.find((projection) => {
            return projection.labels.includes(label);
        });
    }

    getLineProjectionByPositionAndVector(position: Vector3, vector: Vector3): LineProjection | undefined {
        return this.lineProjections.find((projection) => {
            return equalsVector3(projection.position, position) && equalsVector3(projection.vector, vector);
        });
    }

    getLineByLabel(label: string): Line | undefined {
        return this.lines.find((line) => {
            return line.labels.includes(label);
        })
    }

    getLineByPositionAndVector(position: Vector3, vector: Vector3): Line | undefined {
        return this.lines.find((line) => {
            return equalsVector3(line.position, position) && equalsVector3(line.vector, vector);
        });
    }

    getPlaneByLabel(label: string): Plane | undefined {
        return this.planes.find((plane) => {
            return plane.labels.includes(label);
        })
    }

    getPlaneByPositionAndNormal(position: Vector3, normal: Vector3): Plane | undefined {
        return this.planes.find((plane) => {
            return equalsVector3(position, plane.position) && equalsVector3(normal, plane.normal);
        })
    }

    removePointProjection(pointProjection: PointProjection): void {
        this.pointProjections.splice(this.pointProjections.indexOf(pointProjection), 1);
    }

    removePoint(point: Point): void {
        this.points.splice(this.points.indexOf(point), 1);
    }

    removeLineProjection(lineProjection: LineProjection): void {
        this.lineProjections.splice(this.lineProjections.indexOf(lineProjection), 1);
    }

    removeLine(line: Line): void {
        this.lines.splice(this.lines.indexOf(line), 1);
    }

    removePlane(plane: Plane): void {
        this.planes.splice(this.planes.indexOf(plane), 1);
    }
}