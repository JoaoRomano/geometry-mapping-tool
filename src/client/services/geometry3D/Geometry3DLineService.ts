import { Vector2, Vector3 } from "three";
import { DIMENSIONS } from "../../config";
import { ProjectionType } from "../../domain/GeometryTypes";
import { Line } from "../../domain/Line";
import { LineProjection } from "../../domain/LineProjection";
import { PointProjection } from "../../domain/PointProjection";
import { Geometry3DData } from "../../persistance/Geometry3DData";
import { createVector3, distanceBetweenTwoPointsVector3, equalsVector3, medianVector3 } from "../../utils";
import { Geometry3DLineError } from "../../errors/Geometry3DLineError";
import { LineModel } from "../../models/lines/LineModel";
import { LineProjection3DModel } from "../../models/lineProjections3D/LineProjection3DModel";

export class Geometry3DLineService {
    database: Geometry3DData = Geometry3DData.getInstance();

    constructor() {
    }

    createLineProjection(label: string, P1: Vector2, P2: Vector2, type: ProjectionType): LineProjection | null {
        if (type === 'horizontal') {
            const finalLabel = label.concat('1');
            const P13D = new Vector3(-P1.y, 0, -P1.x);
            const P23D = new Vector3(-P2.y, 0, -P2.x);
            return this.createHorizontalLineProjection(finalLabel, P13D, P23D);
        } else {
            const finalLabel = label.concat('2');
            const P13D = new Vector3(0, P1.y, -P1.x);
            const P23D = new Vector3(0, P2.y, -P2.x);
            return this.createFrontalLineProjection(finalLabel, P13D, P23D);
        }
    }

    createPlaneLineProjection(label: string, P1: Vector2, P2: Vector2, type: ProjectionType, isHorizontalOrFrontal: boolean): LineProjection | null {
        if (type === 'horizontal') {
            const finalLabel = isHorizontalOrFrontal ? `(h${label})` : `h${label}`
            const P13D = new Vector3(-P1.y, 0, -P1.x);
            const P23D = new Vector3(-P2.y, 0, -P2.x);
            return this.createHorizontalLineProjection(finalLabel, P13D, P23D);
        } else {
            const finalLabel = isHorizontalOrFrontal ? `(f${label})` : `f${label}`
            const P13D = new Vector3(0, P1.y, -P1.x);
            const P23D = new Vector3(0, P2.y, -P2.x);
            return this.createFrontalLineProjection(finalLabel, P13D, P23D);
        }
    }

    createHorizontalLineProjection(label: string, P1: Vector3, P2: Vector3): LineProjection | null {
        const vectorHorizontal = new Vector3(0, 0, 1);
        const pointsVector = createVector3(P1, P2);
        const angle = pointsVector.angleTo(vectorHorizontal);
        const point = medianVector3(P1, P2);

        const limitWidth = DIMENSIONS.scene3D.planeWidth / 2;
        const limitHeight = DIMENSIONS.scene3D.planeHeight / 2;
    
        if (angle != Math.PI) {
            // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
            let k = (limitHeight - point.x) / pointsVector.x;
            const p1z = Math.round((point.z + k * pointsVector.z) * 100) / 100;
            k = (limitWidth - point.z) / pointsVector.z;
            const p1x = Math.round((point.x + k * pointsVector.x) * 100) / 100;
            k = (-limitHeight - point.x) / pointsVector.x;
            const p2z = Math.round((point.z + k * pointsVector.z) * 100) / 100;
            k = (-limitWidth - point.z) / pointsVector.z;
            const p2x = Math.round((point.x + k * pointsVector.x) * 100) / 100;

            let validPoints = [];
            if (p1z <= limitWidth && p1z >= -limitWidth) {
                validPoints.push(new Vector3(limitHeight, 0, p1z));
            }
            if (p1x <= limitHeight && p1x >= -limitHeight) {
                validPoints.push(new Vector3(p1x, 0, limitHeight));
            }
            if (p2z >= -limitWidth && p2z <= limitWidth) {
                validPoints.push(new Vector3(-limitHeight, 0, p2z));
            }
            if (p2x <= limitHeight && p2x >= -limitHeight) {
                validPoints.push(new Vector3(p2x, 0, -limitHeight));
            }

            let uniqueValidPoints = validPoints.filter((value, index, array) => {
                let currIndex = -1;
                array.forEach((element, index) => {
                    if (equalsVector3(value, element)) {
                        currIndex = index;
                    }
                });
                return index == currIndex;
            });
            const p1 = uniqueValidPoints[0];
            const p2 = uniqueValidPoints[1];
            const position = medianVector3(p1, p2);
            const length = distanceBetweenTwoPointsVector3(p1, p2);
            const vector = new Vector3(Math.tan(angle), 0, 1);
            return this.createLineProjection3D(label, position, angle, vector, length, undefined, angle, p1);
        } else {
            const p1 = new Vector3(point.x, 0, limitWidth);
            const p2 = new Vector3(point.x, 0, -limitWidth);
            const position = medianVector3(p1, p2);
            const length = distanceBetweenTwoPointsVector3(p1, p2);
            const vector = new Vector3(1, 0, 0);
            return this.createLineProjection3D(label, position, angle, vector, length, undefined, undefined, p1);
        }
    }

    createFrontalLineProjection(label: string, P1: Vector3, P2: Vector3): LineProjection | null {
        const vectorFrontal = new Vector3(0, 0, 1);
        const pointsVector = createVector3(P1, P2);
        const angle = pointsVector.angleTo(vectorFrontal);
        const point = medianVector3(P1, P2);
        
        const limitWidth = DIMENSIONS.scene3D.planeWidth / 2;
        const limitHeight = DIMENSIONS.scene3D.planeHeight / 2;

        if (angle != Math.PI) {
            // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
            let k = (limitHeight - point.y) / pointsVector.y;
            const p1z = Math.round((point.z + k * pointsVector.z) * 100) / 100;
            k = (limitWidth - point.z) / pointsVector.z;
            const p1y = Math.round((point.y + k * pointsVector.y) * 100) / 100;
            k = (-limitHeight - point.y) / pointsVector.y;
            const p2z = Math.round((point.z + k * pointsVector.z) * 100) / 100;
            k = (-limitWidth - point.z) / pointsVector.z;
            const p2y = Math.round((point.y + k * pointsVector.y) * 100) / 100;

            let validPoints = [];
            if (p1z <= limitWidth && p1z >= -limitWidth) {
                validPoints.push(new Vector3(0, limitHeight, p1z));
            }
            if (p1y <= limitHeight && p1y >= -limitHeight) {
                validPoints.push(new Vector3(0, p1y, limitHeight));
            }
            if (p2z >= -limitWidth && p2z <= limitWidth) {
                validPoints.push(new Vector3(0, -limitHeight, p2z));
            }
            if (p2y <= limitHeight && p2y >= -limitHeight) {
                validPoints.push(new Vector3(0, p2y, -limitHeight));
            }

            let uniqueValidPoints = validPoints.filter((value, index, array) => {                
                let currIndex = -1;
                array.forEach((element, index) => {
                    if (equalsVector3(value, element)) {
                        currIndex = index;
                    }
                });
                return index == currIndex;
            });
            const p1 = uniqueValidPoints[0];
            const p2 = uniqueValidPoints[1];
            const position = medianVector3(p1, p2);
            const length = distanceBetweenTwoPointsVector3(p1, p2);
            const vector = new Vector3(0, -Math.tan(angle), 1);
            return this.createLineProjection3D(label, position, angle, vector, length, angle, undefined, p1);
        } else {
            const p1 = new Vector3(0, point.y, limitWidth);
            const p2 = new Vector3(0, point.y, -limitWidth);
            const position = medianVector3(p1, p2);
            const length = distanceBetweenTwoPointsVector3(p1, p2);
            const vector = new Vector3(0, 1, 0);
            return this.createLineProjection3D(label, position, angle, vector, length, undefined, undefined, p1);
        }
    }

    createLineProjection3D(label: string, position: Vector3, angle: number, vector: Vector3, length: number, rotationX: number | undefined, rotationY: number | undefined, labelPosition: Vector3 | undefined): LineProjection | null {
        const projection = this.database.getLineProjectionByPositionAndVector(position, vector);
        if (projection) {
            projection.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const model = new LineProjection3DModel(label, position, angle, length, rotationX, rotationY, labelPosition);
            const newLineProjection = new LineProjection(newLabels, position, angle, vector.normalize(), model);
            this.database.lineProjections.push(newLineProjection);
            return newLineProjection;
        }
    }

    createLine(label: string): Line | null {
        const horizontalLineLabel = label.concat('1');
        const horizontalPointLineLabel = '(' + label.concat('1') + ')';
        const horizontalLineProjection = this.database.getLineProjectionByLabel(horizontalLineLabel);
        const horizontalPointLineProjection = this.database.getPointProjectionByLabel(horizontalPointLineLabel);
        const frontalLineLabel = label.concat('2');
        const frontalPointLineLabel = '(' + label.concat('2') + ')';
        const frontalLineProjection = this.database.getLineProjectionByLabel(frontalLineLabel);
        const frontalPointLineProjection = this.database.getPointProjectionByLabel(frontalPointLineLabel);

        if (horizontalLineProjection && frontalLineProjection) {
            // oblique, profile, horizontal, frontal lines
            if (horizontalLineProjection.angle == Math.PI && frontalLineProjection.angle == Math.PI) {
                // frontal-horizontal lines
                return this.createFrontalHorizontalLine(label, horizontalLineProjection, frontalLineProjection);
            } else if (horizontalLineProjection.angle == Math.PI) {
                // frontal lines
                return this.createFrontalLine(label, horizontalLineProjection, frontalLineProjection);
            } else if (frontalLineProjection.angle == Math.PI) {
                // horizontal lines
                return this.createHorizontalLine(label, horizontalLineProjection, frontalLineProjection);
            } else if (horizontalLineProjection.angle == Math.PI / 2 && frontalLineProjection.angle == Math.PI / 2) {
                // profile not implemented
                return null;
            } else if (horizontalLineProjection.angle != Math.PI / 2 && horizontalLineProjection.angle != Math.PI && horizontalLineProjection.angle != 0 && frontalLineProjection.angle != Math.PI / 2 && frontalLineProjection.angle != Math.PI && frontalLineProjection.angle != 0) {
                // oblique lines
                return this.createObliqueLine(label, horizontalLineProjection, frontalLineProjection);
            } else {
                throw new Geometry3DLineError("createLine", "Reta nao tem as projecoes necessarias");
            }
        } else if (horizontalPointLineProjection && frontalLineProjection) {
            // vertical lines
            if (horizontalPointLineProjection.position.z == frontalLineProjection.position.z) {
                return this.createVerticalLine(label, horizontalPointLineProjection, frontalLineProjection);
            } else {
                throw new Geometry3DLineError("createLine", "Reta nao tem as projecoes necessarias");
            }
        } else if (horizontalLineProjection && frontalPointLineProjection) {
            // top lines
            if (horizontalLineProjection.position.z == frontalPointLineProjection.position.z) {
                return this.createTopLine(label, horizontalLineProjection, frontalPointLineProjection);
            } else {
                throw new Geometry3DLineError("createLine", "Reta nao tem as projecoes necessarias");
            }
        } else {
            return null;
        }
    }

    createVerticalLine(label: string, horizontalPointLineProjection: PointProjection, frontalLineProjection: LineProjection): Line | null {
        const point = new Vector3(horizontalPointLineProjection.position.x, frontalLineProjection.position.y, horizontalPointLineProjection.position.z);
        
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const p1 = new Vector3(point.x, limitY, point.z);
        const p2 = new Vector3(point.x, -limitY, point.z);
        const position = medianVector3(p1, p2);
        const vector = createVector3(p1, p2).normalize();
        const length = distanceBetweenTwoPointsVector3(p1, p2);

        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const lineModel = new LineModel(label, position, length, undefined, undefined, undefined, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    createTopLine(label: string, horizontalLineProjection: LineProjection, frontalPointLineProjection: PointProjection): Line | null {
        const horizontalAngle = horizontalLineProjection.angle;
        const point = new Vector3(horizontalLineProjection.position.x, frontalPointLineProjection.position.y, horizontalLineProjection.position.z);
        
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const p1 = new Vector3(limitX, point.y, point.z);
        const p2 = new Vector3(-limitX, point.y, point.z);
        const vector = createVector3(p1, p2).normalize();
        const position = medianVector3(p1, p2);
        const length = distanceBetweenTwoPointsVector3(p1, p2);

        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const lineModel = new LineModel(label, position, length, undefined, undefined, horizontalAngle, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    createFrontalHorizontalLine(label: string, horizontalLineProjection: LineProjection, frontalLineProjection: LineProjection): Line | null {
        const horizontalAngle = horizontalLineProjection.angle;
        const frontalAngle = frontalLineProjection.angle;
        const point = new Vector3(horizontalLineProjection.position.x, frontalLineProjection.position.y, horizontalLineProjection.position.z);

        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const p1 = new Vector3(point.x, point.y, limitY);
        const p2 = new Vector3(point.x, point.y, -limitY);
        const position = medianVector3(p1, p2);
        const vector = createVector3(p1, p2).normalize();
        const length = distanceBetweenTwoPointsVector3(p1, p2);

        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const lineModel = new LineModel(label, position, length, undefined, frontalAngle / 2, horizontalAngle / 2, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    createFrontalLine(label: string, horizontalLineProjection: LineProjection, frontalLineProjection: LineProjection): Line | null {
        const frontalAngle = frontalLineProjection.angle;
        const point = new Vector3(horizontalLineProjection.position.x, frontalLineProjection.position.y, frontalLineProjection.position.z);
        
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const vector = new Vector3(0, -Math.tan(frontalAngle), 1).normalize();

        let k = (limitX - point.y) / vector.y;
        const p1z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (limitY - point.z) / vector.z;
        const p1y = Math.round((point.y + k * vector.y) * 100) / 100;
        k = (-limitX - point.y) / vector.y;
        const p2z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (-limitY - point.z) / vector.z;
        const p2y = Math.round((point.y + k * vector.y) * 100) / 100;

        let validPoints = [];
        if (p1z <= limitY && p1z >= -limitY) {
            validPoints.push(new Vector3(point.x, limitX, p1z));
        }
        if (p1y <= limitX && p1y >= -limitX) {
            validPoints.push(new Vector3(point.x, p1y, limitX));
        }
        if (p2z >= -limitY && p2z <= limitY) {
            validPoints.push(new Vector3(point.x, -limitX, p2z));
        }
        if (p2y <= limitX && p2y >= -limitX) {
            validPoints.push(new Vector3(point.x, p2y, -limitX));
        }
        
        let uniqueValidPoints = validPoints.filter((value, index, array) => {
            let currIndex = -1;
            array.forEach((element, index) => {
                if (equalsVector3(value, element)) {
                    currIndex = index;
                }
            });
            return index == currIndex;
        });
        const p1 = uniqueValidPoints[0];
        const p2 = uniqueValidPoints[1];
        const position = medianVector3(p1, p2);
        const length = distanceBetweenTwoPointsVector3(p1, p2);

        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const lineModel = new LineModel(label, position, length, Math.PI / 2 + frontalAngle, undefined, undefined, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    createHorizontalLine(label: string, horizontalLineProjection: LineProjection, frontalLineProjection: LineProjection): Line | null {
        const horizontalAngle = horizontalLineProjection.angle;
        const point = new Vector3(horizontalLineProjection.position.x, frontalLineProjection.position.y, horizontalLineProjection.position.z);

        const limitWidth = DIMENSIONS.scene3D.planeWidth / 2;
        const limitHeight = DIMENSIONS.scene3D.planeHeight / 2;
    
        // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
        const vector = new Vector3(Math.tan(horizontalAngle), 0, 1).normalize();

        let k = (limitHeight - point.x) / vector.x;
        const p1z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (limitWidth - point.z) / vector.z;
        const p1x = Math.round((point.x + k * vector.x) * 100) / 100;
        k = (-limitHeight - point.x) / vector.x;
        const p2z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (-limitWidth - point.z) / vector.z;
        const p2x = Math.round((point.x + k * vector.x) * 100) / 100;

        let validPoints = [];
        if (p1z <= limitWidth && p1z >= -limitWidth) {
            validPoints.push(new Vector3(limitHeight, point.y, p1z));
        }
        if (p1x <= limitHeight && p1x >= -limitHeight) {
            validPoints.push(new Vector3(p1x, point.y, limitHeight));
        }
        if (p2z >= -limitWidth && p2z <= limitWidth) {
            validPoints.push(new Vector3(-limitHeight, point.y, p2z));
        }
        if (p2x <= limitHeight && p2x >= -limitHeight) {
            validPoints.push(new Vector3(p2x, point.y, -limitHeight));
        }

        let uniqueValidPoints = validPoints.filter((value, index, array) => {
            let currIndex = -1;
            array.forEach((element, index) => {
                if (equalsVector3(value, element)) {
                    currIndex = index;
                }
            });
            return index == currIndex;
        });
        const p1 = uniqueValidPoints[0];
        const p2 = uniqueValidPoints[1];
        const position = medianVector3(p1, p2);
        const length = distanceBetweenTwoPointsVector3(p1, p2);

        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const lineModel = new LineModel(label, position, length, undefined, Math.PI / 2 + horizontalAngle, Math.PI / 2, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    createObliqueLine(label: string, horizontalLineProjection: LineProjection, frontalLineProjection: LineProjection): Line | null {
        const horizontalAngle = horizontalLineProjection.angle;
        const frontalAngle = frontalLineProjection.angle;

        // discover a point of the line (ex: point H)
        let k = -frontalLineProjection.position.y / -Math.tan(frontalAngle);
        const Hz = frontalLineProjection.position.z + k * 1;
        k = Hz - horizontalLineProjection.position.z / 1;
        const Hx = horizontalLineProjection.position.x + k * Math.tan(horizontalAngle);
        const positionH = new Vector3(Hx, 0, Hz);

        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitZ = DIMENSIONS.scene3D.planeHeight / 2;
        const vector = new Vector3(Math.tan(horizontalAngle), -Math.tan(frontalAngle), 1).normalize();
        
        // discover 2 border points of the line
        // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
        let possiblePoints = []
        k = (limitX - positionH.x) / vector.x;
        const p1y = Math.round((positionH.y + k * vector.y) * 100) / 100;
        const p1z = Math.round((positionH.z + k * vector.z) * 100) / 100;
        possiblePoints.push(new Vector3(limitX, p1y, p1z));
        k = (limitY - positionH.y) / vector.y;
        const p2x = Math.round((positionH.x + k * vector.x) * 100) / 100;
        const p2z = Math.round((positionH.z + k * vector.z) * 100) / 100;
        possiblePoints.push(new Vector3(p2x, limitY, p2z));
        k = (limitZ - positionH.z) / vector.z;
        const p3x = Math.round((positionH.x + k * vector.x) * 100) / 100;
        const p3y = Math.round((positionH.y + k * vector.y) * 100) / 100;
        possiblePoints.push(new Vector3(p3x, p3y, limitZ));
        k = (-limitX - positionH.x) / vector.x;
        const p4y = Math.round((positionH.y + k * vector.y) * 100) / 100;
        const p4z = Math.round((positionH.z + k * vector.z) * 100) / 100;
        possiblePoints.push(new Vector3(-limitX, p4y, p4z));
        k = (-limitY - positionH.y) / vector.y;
        const p5x = Math.round((positionH.x + k * vector.x) * 100) / 100;
        const p5z = Math.round((positionH.z + k * vector.z) * 100) / 100;
        possiblePoints.push(new Vector3(p5x, -limitY, p5z));
        k = (-limitZ - positionH.z) / vector.z;
        const p6x = Math.round((positionH.x + k * vector.x) * 100) / 100;
        const p6y = Math.round((positionH.y + k * vector.y) * 100) / 100;
        possiblePoints.push(new Vector3(p6x, p6y, -limitZ));

        let validPoints: Vector3[] = [];
        possiblePoints.forEach((point) => {
            if (point.x <= limitX && point.x >= -limitX && point.y <= limitY && point.y >= -limitY && point.z <= limitZ && point.z >= -limitZ) {
                validPoints.push(point);
            }
        })
        
        let uniqueValidPoints = validPoints.filter((value, index, array) => {
            let currIndex = -1;
            array.forEach((element, index) => {
                if (equalsVector3(value, element)) {
                    currIndex = index;
                }
            });
            return index == currIndex;
        });
        const p1 = uniqueValidPoints[0];
        const p2 = uniqueValidPoints[1];
        const position = medianVector3(p1, p2);
        const length = distanceBetweenTwoPointsVector3(p1, p2);
        
        const line = this.database.getLineByPositionAndVector(position, vector);
        if (line) {
            line.addLabel(label);
            return null;
        } else {
            let newLabels = [];
            newLabels.push(label);
            const rotationZ = vector.x < 0 && vector.y > 0 || vector.x > 0 && vector.y < 0 ? vector.negate().angleTo(new Vector3(0, -Math.tan(frontalAngle), 1)) : vector.angleTo(new Vector3(0, -Math.tan(frontalAngle), 1));
            const lineModel = new LineModel(label, position, length, Math.PI / 2 + frontalAngle, undefined, rotationZ, p1);
            const newLine = new Line(newLabels, position, vector, lineModel);
            this.database.lines.push(newLine);
            return newLine;
        }
    }

    removeLineProjection(labelInput: string): LineProjection | null {
        let lineProjections = this.database.getLineProjectionByLabel(labelInput);
        if (lineProjections) {
            if (lineProjections.labels.length > 1) {
                lineProjections.removeLabel(labelInput);
                return null;
            } else {
                lineProjections.removeLabels();
                this.database.removeLineProjection(lineProjections);
                return lineProjections;
            }
        } else {
            return null;
        }
    }

    removeLine(labelInput: string): Line | null {
        let line = this.database.getLineByLabel(labelInput);
        if (line) {
            if (line.labels.length > 1) {
                line.removeLabel(labelInput);
                return null;
            } else {
                line.removeLabels();
                this.database.removeLine(line);
                return line;
            }
        } else {
            return null;
        }
    }
}
