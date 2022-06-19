import { Vector2, Vector3 } from "three";
import { ProjectionType } from "../../domain/GeometryTypes";
import { Point } from "../../domain/Point";
import { PointProjection } from "../../domain/PointProjection";
import { Geometry3DPointError } from "../../errors/Geometry3DPointError";
import { FrontalPointProjection3DModel } from "../../models/pointProjections3D/FrontalPointProjection3DModel";
import { HorizontalPointProjection3DModel } from "../../models/pointProjections3D/HorizontalPointProjection3DModel";
import { PointModel } from "../../models/points/PointModel";
import { Geometry3DData } from "../../persistance/Geometry3DData";

export class Geometry3DPointService {
    database: Geometry3DData = Geometry3DData.getInstance();

    constructor() {
        
    }

    createPointProjection(label: string, coords: Vector2, type: ProjectionType): PointProjection | null {
        if (type == 'horizontal') {
            const finalLabel = label.concat('1');
            const coordsTo3D = new Vector3(-coords.y, 0, -coords.x);
            return this.createHorizontalPointProjection(finalLabel, coordsTo3D);
        } else {
            const finalLabel = label.concat('2');
            const coordsTo3D = new Vector3(0, coords.y, -coords.x);
            return this.createFrontalPointProjection(finalLabel, coordsTo3D);
        }
    }

    createLinePointProjection(label: string, coords: Vector2, type: ProjectionType): PointProjection | null {
        if (type == 'horizontal') {
            const finalLabel = label.concat('1');
            const coordsTo3D = new Vector3(-coords.y, 0, -coords.x);
            return this.createHorizontalPointProjection('(' + finalLabel + ')', coordsTo3D);
        } else {
            const finalLabel = label.concat('2');
            const coordsTo3D = new Vector3(0, coords.y, -coords.x);
            return this.createFrontalPointProjection('(' + finalLabel + ')', coordsTo3D);
        }
    }

    createHorizontalPointProjection(label: string, coords: Vector3): PointProjection | null {
        const projection = this.database.getPointProjectionByPosition(coords);
        if (projection) {
            projection.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const model = new HorizontalPointProjection3DModel(coords, label);
            const newPointProjection = new PointProjection(newLabels, coords, model);
            this.database.pointProjections.push(newPointProjection);
            return newPointProjection;
        }
    }

    createFrontalPointProjection(label: string, coords: Vector3): PointProjection | null {
        const projection = this.database.getPointProjectionByPosition(coords);
        if (projection) {
            projection.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const model = new FrontalPointProjection3DModel(coords, label);
            const newPointProjection = new PointProjection(newLabels, coords, model);
            this.database.pointProjections.push(newPointProjection);
            return newPointProjection;
        }
    }

    createPoint(label: string, coords: Vector3): Point | null {
        const horizontalLabel = label.concat('1');
        const frontalLabel = label.concat('2');
        const horizontalProjection = this.database.pointProjections.find((projection) => {
            return projection.labels.includes(horizontalLabel);
        });
        const frontalProjection = this.database.pointProjections.find((projection) => {
            return projection.labels.includes(frontalLabel);
        });
        if (horizontalProjection && frontalProjection) {
            const point = this.database.getPointByPosition(coords);
            if (point) {
                point.addLabel(label);
                return null;
            } else {
                let newLabels = [];
                newLabels.push(label);
                const model = new PointModel(coords, label);
                const newPoint = new Point(newLabels, coords, horizontalProjection, frontalProjection, model);
                this.database.points.push(newPoint);
                return newPoint;
            }
        } else {
            throw new Geometry3DPointError("createPoint", "Ponto nao tem as duas projecoes");
        }
    }

    removePointProjection(labelInput: string): PointProjection | null {
        let projection = this.database.getPointProjectionByLabel(labelInput);
        if (projection) {
            if (projection.labels.length > 1) {
                projection.removeLabel(labelInput);
                return null;
            } else {
                projection.removeLabels();
                this.database.removePointProjection(projection);
                return projection;
            }
        } else {
            return null;
        }
    }

    removePoint(labelInput: string): Point | null {
        let point = this.database.getPointByLabel(labelInput);
        if (point) {
            if (point.labels.length > 1) {
                point.removeLabel(labelInput);
                return null;
            } else {
                point.removeLabels();
                this.database.removePoint(point);
                return point;
            }
        } else {
            return null;
        }
    }
}