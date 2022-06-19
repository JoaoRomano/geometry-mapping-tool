import { Vector2 } from "three";
import { DIMENSIONS, GREEK_LETTERS } from "../../config";
import { LineProjectionType, ProjectionType } from "../../domain/GeometryTypes";
import { MongeLineProjection } from "../../domain/MongeLineProjection";
import { GeometryMongeLineError } from "../../errors/GeometryMongeLineError";
import { LineProjectionModel } from "../../models/lineProjections/LineProjectionModel";
import { GeometryMongeData } from "../../persistance/GeometryMongeData";
import { createVector2, generateAngle, medianVector2 } from "../../utils";

export class GeometryMongeLineService {
    database: GeometryMongeData = GeometryMongeData.getInstance();

    constructor() {
    }

    getLineProjectionByLabel(label: string): MongeLineProjection | null {
        const lineProjection = this.database.getLineProjectionByLabel(label);
        return lineProjection ? lineProjection : null;
    }

    validateProjectionLine(label: string, P1: Vector2, P2: Vector2, type: ProjectionType): MongeLineProjection | null {
        const finalLabel = label.concat(type === 'horizontal' ? '1' : '2');
        const oppositeLabel = label.concat(type === 'horizontal' ? '2' : '1');
        const projection = this.database.getLineProjectionByLabel(finalLabel);
        const pointProjection = this.database.getPointProjectionByLabel(`(${finalLabel})`);
        if (!projection && !pointProjection) {
            const oppositeProjection = this.database.getLineProjectionByLabel(oppositeLabel);
            const oppositePointProjection = this.database.getPointProjectionByLabel(`(${oppositeLabel})`);
            if (oppositeProjection) {
                const projectionX = this.database.getLineProjectionByLabel('x');
                if (projectionX) {
                    if (oppositeProjection.isPerpendicular(projectionX.normal())) {
                        if (oppositeProjection.position.x == P1.x && oppositeProjection.position.x == P2.x) {
                            return this.createLineProjection(finalLabel, P1, P2, type, 'line');
                        } else {
                            throw new GeometryMongeLineError("validateProjectionLine", "Projecao invalida");
                        }
                    } else {
                        if (!projectionX.isPerpendicular(createVector2(P1, P2))) {
                            return this.createLineProjection(finalLabel, P1, P2, type, 'line');
                        } else {
                            throw new GeometryMongeLineError("validateProjectionLine", "Projecao invalida");
                        }
                    }
                } else {
                    throw new GeometryMongeLineError("validateProjectionLine", "Projecao X inexistente");
                }
            } else if (oppositePointProjection) {
                const vector = P2.clone().sub(P1);
                const projectionX = this.database.getLineProjectionByLabel('x');
                if (projectionX && projectionX.isPerpendicular(vector) && P2.x == oppositePointProjection.worldCoords.x) {
                    return this.createLineProjection(finalLabel, P1, P2, type, 'line');
                } else {
                    throw new GeometryMongeLineError("validateProjectionLine", "Projecao invalida");
                }
            } else {
                return this.createLineProjection(finalLabel, P1, P2, type, 'line');
            }
        } else {
            throw new GeometryMongeLineError("validateProjectionLine", `Projecao ${finalLabel} ja existente`);
        }
    }

    validateProjectionPlane(label: string, P1: Vector2, P2: Vector2, type: ProjectionType, isHorizontalOrFrontal: boolean): MongeLineProjection | null { 
        const finalLabel = type === 'horizontal' ? `h${label}` : `f${label}`;
        const oppositeLabel = type === 'horizontal' ? `f${label}` : `h${label}`;
        const alternativeLabel = `(${finalLabel})`;
        const oppositeAlternativeLabel = `(${oppositeLabel})`;
        const projection = this.database.getLineProjectionByLabel(finalLabel);
        const alternativeProjection = this.database.getLineProjectionByLabel(alternativeLabel);
        if (!projection && !alternativeProjection) {
            const oppositeProjection = this.database.getLineProjectionByLabel(oppositeLabel);
            const oppositeAlternativeProjection = this.database.getLineProjectionByLabel(oppositeAlternativeLabel);
            if (oppositeProjection) {
                if (oppositeProjection.angle == Math.PI || oppositeProjection.angle == 0) {
                    const vector = createVector2(P1, P2);
                    if (vector.y == 0) {
                        return this.createLineProjection(finalLabel, P1, P2, type, 'plane');
                    } else {
                        throw new GeometryMongeLineError("validateProjectionPlane", "Projecao invalida");
                    }
                } else {
                    const vector = createVector2(P1, P2);
                    const k = -P1.y / vector.y;
                    const Px = Math.round((P1.x + k * vector.x) * 10) / 10;
                    if (Px == oppositeProjection.originPoint().x) {
                        return this.createLineProjection(finalLabel, P1, P2, type, 'plane');
                    } else {
                        throw new GeometryMongeLineError("validateProjectionPlane", "Projecao invalida");
                    }
                }
            } else if (oppositeAlternativeProjection) {
                throw new GeometryMongeLineError("validateProjectionPlane", "Projecao invalida");
            } else {
                return this.createLineProjection(isHorizontalOrFrontal ? alternativeLabel : finalLabel, P1, P2, type, 'plane');
            }
        } else {
            throw new GeometryMongeLineError("validateProjectionPlane", "Projecao ja existente");
        }
    }

    createLineProjection(label: string, P1: Vector2, P2: Vector2, type: ProjectionType, projectionType: LineProjectionType): MongeLineProjection | null {
        const position = medianVector2(P1, P2);
        const angle = P1.y < P2.y ? generateAngle(P1, P2) : generateAngle(P2, P1);
        const projection = this.database.getLineProjectionByPointAndAngle(position, angle);
        if (projection) {
            projection.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const mongeModel = new LineProjectionModel(label, P1, P2, type == 'horizontal' ? 'negative' : 'positive');
            const newMongeLineProjection = new MongeLineProjection(newLabels, position, angle, mongeModel, projectionType);
            this.database.lineProjections.push(newMongeLineProjection);
            return newMongeLineProjection;
        }
    }

    createLineXProjection(limitX: number): MongeLineProjection {
        const label = 'x';
        const positiveLimit = new Vector2(limitX, 0);
        const negativeLimit = new Vector2(-limitX, 0);
        const position = medianVector2(positiveLimit, negativeLimit);
        let newLabels = [];
        newLabels.push(label);
        const mongeModel = new LineProjectionModel(label, negativeLimit, positiveLimit, 'positive');
        const newMongeLineProjection = new MongeLineProjection(newLabels, position, 0, mongeModel, 'plane');
        this.database.lineProjections.push(newMongeLineProjection);
        return newMongeLineProjection;
    }

    createLineYZProjection(): MongeLineProjection {
        const label = `${decodeURI(GREEK_LETTERS.pi)}0`;
        const positiveLimit = new Vector2(0, DIMENSIONS.sceneMonge.pi0Height);
        const negativeLimit = new Vector2(0, -DIMENSIONS.sceneMonge.pi0Height);
        const position = medianVector2(positiveLimit, negativeLimit);
        let newLabels = [];
        newLabels.push(label);
        const mongeModel = new LineProjectionModel(label, negativeLimit, positiveLimit, 'negative');
        const newMongeLineProjection = new MongeLineProjection(newLabels, position, Math.PI, mongeModel, 'plane');
        return newMongeLineProjection;
    }

    getLineProjection(label: string): MongeLineProjection | null {
        const lineProjection = this.database.getLineProjectionByLabel(label);
        if (lineProjection) {
            return lineProjection;
        } else {
            return null;
        }
    }

    removeLineProjection(labelInput: string): MongeLineProjection | null {
        const projection = this.database.getLineProjectionByLabel(labelInput);
        if (projection && labelInput != 'x') {            
            if (projection.labels.length > 1) {
                projection.removeLabel(labelInput);
                return null;
            } else {
                projection.removeLabels();
                this.database.removeLineProjection(projection);
                return projection;
            }
        } else {
            return null;
        }
    }
}