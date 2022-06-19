import { Vector2, Vector3 } from "three";
import { ProjectionType } from "../../domain/GeometryTypes";
import { MongePointProjection } from "../../domain/MongePointProjection";
import { GeometryMongePointError } from "../../errors/GeometryMongePointError";
import { PointProjectionModel } from "../../models/pointProjections/PointProjectionModel";
import { GeometryMongeData } from "../../persistance/GeometryMongeData";

export class GeometryMongePointService {
    database: GeometryMongeData = GeometryMongeData.getInstance();

    constructor() {
    }

    getPointProjectionByLabel(label: string): MongePointProjection | null {
        const pointProjection = this.database.getPointProjectionByLabel(label);
        return pointProjection ? pointProjection : null;
    }

    createProjection(label: string, coords: Vector2, type: ProjectionType):MongePointProjection | null {
        const finalLabel = label.concat(type === 'horizontal' ? '1' : '2');
        const oppositeLabel = label.concat(type === 'horizontal' ? '2' : '1');
        const projection = this.database.getPointProjectionByLabel(finalLabel);
        if (!projection) {
            const oppositeProjection = this.database.getPointProjectionByLabel(oppositeLabel);
            if (oppositeProjection) {
                if (oppositeProjection.worldCoords.x == coords.x) {
                    return this.createPointProjection(finalLabel, coords);
                } else {
                    throw new GeometryMongePointError("createPointProjection", `Projecao ${finalLabel} e ${oppositeLabel} nao tem a mesma abcissa`);
                }
            } else {
                return this.createPointProjection(finalLabel, coords);
            }
        } else {
            throw new GeometryMongePointError("createPointProjection", `Projecao ${finalLabel} ja existente`);
        }
    }

    createPointProjection(label: string, coords: Vector2):MongePointProjection | null {
        const projection = this.database.getPointProjectionByPosition(coords);
        if (projection) {
            projection.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const mongeModel = new PointProjectionModel(label, coords.x, coords.y);
            const newMongePointProjection = new MongePointProjection(newLabels, coords, mongeModel);
            this.database.pointProjections.push(newMongePointProjection);
            return newMongePointProjection;
        }
    }

    createLinePointProjection(label: string, coords: Vector2, type: ProjectionType): MongePointProjection | null {
        const finalLabel = '(' + label.concat(type === 'horizontal' ? '1' : '2') + ')';
        const oppositeLabel = label.concat(type === 'horizontal' ? '2' : '1');
        const projection = this.database.getPointProjectionByLabel(finalLabel);
        const lineProjection = this.database.getLineProjectionByLabel(finalLabel.substring(1, finalLabel.length - 1));
        if (!projection && !lineProjection) {
            const oppositePointLabel = '(' + oppositeLabel + ')';
            const oppositePointProjection = this.database.getPointProjectionByLabel(oppositePointLabel);
            if (!oppositePointProjection) {
                const oppositeProjection = this.database.getLineProjectionByLabel(oppositeLabel);
                if (oppositeProjection) {
                    const projectionX = this.database.getLineProjectionByLabel('x');
                    if (projectionX && oppositeProjection.isPerpendicular(projectionX.normal()) && oppositeProjection.containsPoint(coords)) {
                        return this.createPointProjection(finalLabel, coords);
                    } else {
                        throw new GeometryMongePointError("createLinePointProjection", `Projecao ${finalLabel} invalida`);
                    }
                } else {
                    return this.createPointProjection(finalLabel, coords);
                }
            } else {                                
                throw new GeometryMongePointError("createLinePointProjection", `Projecao ${finalLabel} invalida`);
            }
        } else {
            throw new GeometryMongePointError("createLinePointProjection", `Projecao ${finalLabel} ja existente`);
        }
    }

    removePointProjection(labelInput: string): MongePointProjection | null {
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

    mapProjections(labelInput: string):Vector3 | null {
        const horizontalProjection = this.database.getPointProjectionByLabel(labelInput.concat('1'));
        const frontalProjection = this.database.getPointProjectionByLabel(labelInput.concat('2'));
        if (horizontalProjection && frontalProjection) {
            return new Vector3(
                -horizontalProjection.worldCoords.y,
                frontalProjection.worldCoords.y,
                -horizontalProjection.worldCoords.x,
            );
        } else {
            return null;
        }
    }

    generateFirstPreviewPoint(position: Vector2, vector: Vector2, limitX: number, limitY: number): Vector2 {
        if (vector.y == 0) {
            return new Vector2(-limitX, position.y);
        }
        let k = (limitY - position.y) / vector.y;
        const Px = position.x + k * vector.x;
        if (Px < -limitX || Px > limitX) {
            if (Px < -limitX) {
                k = (-limitX - position.x) / vector.x;
                const Py = position.y + k * vector.y;
                return new Vector2(-limitX, Py);
            } else {
                k = (limitX - position.x) / vector.x;
                const Py = position.y + k * vector.y;
                return new Vector2(limitX, Py);
            }
        } else {
            return new Vector2(Px, limitY);
        }
    }

    generateSecondPreviewPoint(position: Vector2, vector: Vector2, limitX: number, limitY: number): Vector2 {
        if (vector.y == 0) {
            return new Vector2(limitX, position.y);
        }
        let k = (-limitY - position.y) / vector.y;
        const Px = position.x + k * vector.x;
        if (Px < -limitX || Px > limitX) {
            if (Px < -limitX) {
                k = (-limitX - position.x) / vector.x;
                const Py = position.y + k * vector.y;
                return new Vector2(-limitX, Py);
            } else {
                k = (limitX - position.x) / vector.x;
                const Py = position.y + k * vector.y;
                return new Vector2(limitX, Py);
            }
        } else {
            return new Vector2(Px, -limitY);
        }
    }

    generateXPoint(position: Vector2, vector: Vector2, limitX: number): Vector2 | null {
        let k = -position.y / vector.y;
        if (k != 0) {
            const Px = position.x + k * vector.x;
            if (Px > -limitX && Px < limitX) {
                return new Vector2(Px, 0);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
