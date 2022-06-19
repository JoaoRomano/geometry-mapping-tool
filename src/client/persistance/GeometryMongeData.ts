import { Vector2 } from "three";
import { MongeLineProjection } from "../domain/MongeLineProjection";
import { MongePointProjection } from "../domain/MongePointProjection";

export class GeometryMongeData {
    pointProjections: MongePointProjection[];
    lineProjections: MongeLineProjection[];

    private static instance: GeometryMongeData;

    private constructor() {
        this.pointProjections = [];
        this.lineProjections = [];
    }

    public static getInstance(): GeometryMongeData {
        if (GeometryMongeData.instance == null) {
            GeometryMongeData.instance = new GeometryMongeData();
        }
        return GeometryMongeData.instance;
    }

    getLineProjectionByLabel(label: string): MongeLineProjection | undefined {
        return this.lineProjections.find((projection) => {
            return projection.labels.includes(label);
        });
    }

    getLineProjectionByPointAndAngle(P: Vector2, angle: number): MongeLineProjection | undefined {
        return this.lineProjections.find((projection) => {
            return projection.position.x == P.x && projection.position.y == P.y && projection.angle == angle;
        });
    }

    getPointProjectionByLabel(label: string): MongePointProjection | undefined {
        return this.pointProjections.find((projection) => {
            return projection.labels.includes(label);
        });
    }

    getPointProjectionByPosition(position: Vector2): MongePointProjection | undefined {
        return this.pointProjections.find((projection) => {
            return projection.worldCoords.x == position.x && projection.worldCoords.y == position.y;
        });
    }

    removePointProjection(projection: MongePointProjection): void {
        this.pointProjections.splice(this.pointProjections.indexOf(projection), 1);
    }

    removeLineProjection(projection: MongeLineProjection): void {
        this.lineProjections.splice(this.lineProjections.indexOf(projection), 1);
    }
}