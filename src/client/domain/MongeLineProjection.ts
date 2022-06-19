import { Vector2 } from "three";
import { LineProjectionModel } from "../models/lineProjections/LineProjectionModel";
import { LineProjectionType } from "./GeometryTypes";

export class MongeLineProjection {
    labels: string[];
    position: Vector2;
    angle: number;
    vector: Vector2;
    model: LineProjectionModel;
    type: LineProjectionType;
    
    constructor(labels: string[], position: Vector2, angle: number, model: LineProjectionModel, type: LineProjectionType) {
        this.labels = labels;
        this.position = position;
        this.angle = angle;
        if (this.angle == Math.PI / 2) {
            this.vector = new Vector2(0, 1);
        } else {
            this.vector = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
        }
        this.model = model;
        this.type = type;
    }

    addLabel(label: string) {
        this.labels.push(label);
        this.model.addProjection(label);
    }

    removeLabel(label: string) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.model.label.removeLabel(label);
        this.model.group.name = `line_projection_${this.labels[0]}`;
    }

    removeLabels(): void {
        this.model.label.removeLabels();
    }

    normal(): Vector2 {
        return this.vector.clone().normalize();
    }

    sameOrientation(v: Vector2): boolean {
        const thisNormal = this.normal();
        const normal = v.normalize();
        const negativeNormal = normal.clone().negate();
        return (thisNormal.x == normal.x && thisNormal.y == normal.y) ||
            (thisNormal.x == negativeNormal.x && thisNormal.y == negativeNormal.y);
    }

    containsPoint(P: Vector2): boolean {
        // (Px,Py) = (Pox,Poy) + k * (Vx,Vy)
        const thisNormal = this.normal();
        if (thisNormal.x == 0) {
            return this.position.x == P.x;
        } else if (thisNormal.y == 0) {
            return this.position.y == P.y;
        } else {
            const k = (P.x - this.position.x) / thisNormal.x;
            const Py = this.position.y + k * thisNormal.y;
            return Py == P.y;
        }
    }

    originPoint(): Vector2 {
        const k = -this.position.y / this.vector.y;
        const Px = this.position.x + k * this.vector.x;
        return new Vector2(Math.round(Px * 10) / 10, 0);
    }

    isPerpendicular(v: Vector2): boolean {
        return this.normal().x * v.x + this.normal().y * v.y == 0;
    }
}