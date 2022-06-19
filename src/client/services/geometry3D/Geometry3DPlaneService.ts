import { Vector3 } from "three";
import { DIMENSIONS } from "../../config";
import { LineProjection } from "../../domain/LineProjection";
import { Plane } from "../../domain/Plane";
import { Geometry3DPlaneError } from "../../errors/Geometry3DPlaneError";
import { PlaneModel } from "../../models/planes/PlaneModel";
import { Geometry3DData } from "../../persistance/Geometry3DData";
import { createVector3, distanceBetweenTwoPointsVector3, equalsVector3, medianVector3, vectorialProduct } from "../../utils";

export class Geometry3DPlaneService {
    database: Geometry3DData = Geometry3DData.getInstance();

    constructor() {
    }

    createPlane(label: string, isHorizontalOrFrontal: boolean): Plane | null {
        if (isHorizontalOrFrontal) {
            // Horizontal and Frontal Planes
            const horizontalPlaneProjectionLabel = `(h${label})`;
            const frontalPlaneProjectionLabel = `(f${label})`;
            const horizontalPlaneProjection = this.database.getLineProjectionByLabel(horizontalPlaneProjectionLabel);
            const frontalPlaneProjection = this.database.getLineProjectionByLabel(frontalPlaneProjectionLabel);
            if (horizontalPlaneProjection && !frontalPlaneProjection) {
                // Frontal Plane
                return this.createFrontalPlane(label, horizontalPlaneProjection);
            } else if (!horizontalPlaneProjection && frontalPlaneProjection) {
                // Horizontal Plane
                return this.createHorizontalPlane(label, frontalPlaneProjection);
            } else {
                // error
                throw new Geometry3DPlaneError("createPlane", "Projecoes invalidas");
            }
        } else {
            const horizontalPlaneProjectionLabel = `h${label}`;
            const frontalPlaneProjectionLabel = `f${label}`;
            const horizontalPlaneProjection = this.database.getLineProjectionByLabel(horizontalPlaneProjectionLabel);
            const frontalPlaneProjection = this.database.getLineProjectionByLabel(frontalPlaneProjectionLabel);
            if (horizontalPlaneProjection && frontalPlaneProjection) {
                // Oblique, Top, Vertical, Profile, Ramp and Passerby Planes
                if (horizontalPlaneProjection.angle == Math.PI / 2 && frontalPlaneProjection.angle == Math.PI / 2 && horizontalPlaneProjection.position.x == frontalPlaneProjection.position.x) {
                    // Profile Plane
                    return this.createProfilePlane(label, horizontalPlaneProjection);
                } else if ((horizontalPlaneProjection.angle == Math.PI || horizontalPlaneProjection.angle == 0) && (frontalPlaneProjection.angle == Math.PI || frontalPlaneProjection.angle == 0)) {
                    if (horizontalPlaneProjection.position.y == 0 && frontalPlaneProjection.position.y == 0) {
                        // Passerby Plane
                        return null;
                    } else {
                        // Ramp Plane
                        return this.createRampPlane(label, horizontalPlaneProjection, frontalPlaneProjection);
                    }
                } else if (horizontalPlaneProjection.angle == Math.PI / 2 && frontalPlaneProjection.angle != Math.PI && frontalPlaneProjection.angle != 0) {
                    // Top Plane
                    return this.createTopPlane(label, horizontalPlaneProjection, frontalPlaneProjection);
                } else if (frontalPlaneProjection.angle == Math.PI / 2 && horizontalPlaneProjection.angle != Math.PI && horizontalPlaneProjection.angle != 0) {
                    // Vertical Plane
                    return this.createVerticalPlane(label, horizontalPlaneProjection, frontalPlaneProjection);
                } else if (horizontalPlaneProjection.angle != Math.PI / 2 && horizontalPlaneProjection.angle != Math.PI && horizontalPlaneProjection.angle != 0 && frontalPlaneProjection.angle != Math.PI / 2 && frontalPlaneProjection.angle != Math.PI && frontalPlaneProjection.angle != 0) {
                    // Oblique Plane
                    return this.createObliquePlane(label, horizontalPlaneProjection, frontalPlaneProjection);
                } else {
                    // error
                    throw new Geometry3DPlaneError("createPlane", "Projecoes invalidas");
                }
            } else {
                return null;
            }
        }
    }

    createFrontalPlane(label: string, horizontalPlaneProjection: LineProjection): Plane | null {
        const position = new Vector3(horizontalPlaneProjection.position.x, 0, 0);
        const normal = new Vector3(1, 0, 0);
        
        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const rotationY = Math.PI / 2;
            const labelPosition = new Vector3(horizontalPlaneProjection.position.x, DIMENSIONS.scene3D.planeHeight / 2 - 0.5, DIMENSIONS.scene3D.planeWidth / 2 - 0.5);
            const planeModel = new PlaneModel(label, position, DIMENSIONS.scene3D.planeWidth, DIMENSIONS.scene3D.planeHeight, undefined, rotationY, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'frontal', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createHorizontalPlane(label: string, frontalPlaneProjection: LineProjection): Plane | null {
        const position = new Vector3(0, frontalPlaneProjection.position.y, 0);
        const normal = new Vector3(0, 1, 0);
        
        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const rotationX = Math.PI / 2;
            const labelPosition = new Vector3(DIMENSIONS.scene3D.planeWidth / 2 - 0.5, frontalPlaneProjection.position.y, DIMENSIONS.scene3D.planeWidth / 2 - 0.5);
            const planeModel = new PlaneModel(label, position, DIMENSIONS.scene3D.planeWidth, DIMENSIONS.scene3D.planeHeight, rotationX, undefined, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'horizontal', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createProfilePlane(label: string, horizontalPlaneProjection: LineProjection): Plane | null {
        const position = new Vector3(0, 0, horizontalPlaneProjection.position.z);
        const normal = new Vector3(0, 0, 1);
        
        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const labelPosition = new Vector3(DIMENSIONS.scene3D.planeWidth / 2 - 0.5, DIMENSIONS.scene3D.planeHeight / 2 - 0.5, horizontalPlaneProjection.position.z);
            const planeModel = new PlaneModel(label, position, DIMENSIONS.scene3D.planeWidth, DIMENSIONS.scene3D.planeHeight, undefined, undefined, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'profile', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createRampPlane(label: string, horizontalPlaneProjection: LineProjection, frontalPlaneProjection: LineProjection): Plane | null {
        const vector = createVector3(horizontalPlaneProjection.position, frontalPlaneProjection.position);
        const vectorAux = new Vector3(0, 0, 1);
        const point = horizontalPlaneProjection.position;
        const normal = vectorialProduct(vector, vectorAux);
        
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;

        let k = (limitX - point.x) / vector.x;
        const p1y = Math.round((point.y + k * vector.y) * 100) / 100;
        k = (limitY - point.y) / vector.y;
        const p1x = Math.round((point.x + k * vector.x) * 100) / 100;
        k = (-limitX - point.x) / vector.x;
        const p2y = Math.round((point.y + k * vector.y) * 100) / 100;
        k = (-limitY - point.y) / vector.y;
        const p2x = Math.round((point.x + k * vector.x) * 100) / 100;
        
        let validPoints = [];
        if (p1x <= limitY && p1x >= -limitY) {
            validPoints.push(new Vector3(p1x, limitY, point.z));
        }
        if (p1y <= limitX && p1y >= -limitX) {
            validPoints.push(new Vector3(limitX, p1y, point.z));
        }
        if (p2x >= -limitY && p2x <= limitY) {
            validPoints.push(new Vector3(p2x, -limitY, point.z));
        }
        if (p2y <= limitX && p2y >= -limitX) {
            validPoints.push(new Vector3(-limitX, p2y, point.z));
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

        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const rotationX = Math.PI / 2;
            const rotationY = normal.y < 0 ? Math.PI / 2 - normal.angleTo(new Vector3(1, 0, 0)) : normal.angleTo(new Vector3(1, 0, 0)) + Math.PI / 2;
            const labelPosition = new Vector3(p1.x, p1.y, DIMENSIONS.scene3D.planeWidth / 2 - 1);
            const planeModel = new PlaneModel(label, position, length, DIMENSIONS.scene3D.planeHeight, rotationX, rotationY, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'ramp', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createTopPlane(label: string, horizontalPlaneProjection: LineProjection, frontalPlaneProjection: LineProjection): Plane | null {
        const point = new Vector3(horizontalPlaneProjection.position.x, frontalPlaneProjection.position.y, frontalPlaneProjection.position.z);
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const vector = new Vector3(0, -Math.tan(frontalPlaneProjection.angle), 1);
        const vectorAux = new Vector3(1, 0, 0);
        const normal = vectorialProduct(vector, vectorAux);
        
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

        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const rotationX = normal.z < 0 ? Math.PI / 2 - normal.angleTo(new Vector3(0, 1, 0)) : Math.PI / 2 + normal.angleTo(new Vector3(0, 1, 0));
            const labelPosition = new Vector3(DIMENSIONS.scene3D.planeWidth / 2 - 1, p1.y, p1.z);
            const planeModel = new PlaneModel(label, position, DIMENSIONS.scene3D.planeWidth, length, rotationX, undefined, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'top', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createVerticalPlane(label: string, horizontalPlaneProjection: LineProjection, frontalPlaneProjection: LineProjection): Plane | null {
        const point = new Vector3(horizontalPlaneProjection.position.x, frontalPlaneProjection.position.y, horizontalPlaneProjection.position.z);
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const vector = new Vector3(Math.tan(horizontalPlaneProjection.angle), 0, 1);
        const vectorAux = new Vector3(0, 1, 0);
        const normal = vectorialProduct(vector, vectorAux);
    
        let k = (limitX - point.x) / vector.x;
        const p1z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (limitY - point.z) / vector.z;
        const p1x = Math.round((point.x + k * vector.x) * 100) / 100;
        k = (-limitX - point.x) / vector.x;
        const p2z = Math.round((point.z + k * vector.z) * 100) / 100;
        k = (-limitY - point.z) / vector.z;
        const p2x = Math.round((point.x + k * vector.x) * 100) / 100;

        let validPoints = [];
        if (p1z <= limitY && p1z >= -limitY) {
            validPoints.push(new Vector3(limitX, point.y, p1z));
        }
        if (p1x <= limitX && p1x >= -limitX) {
            validPoints.push(new Vector3(p1x, point.y, limitX));
        }
        if (p2z >= -limitY && p2z <= limitY) {
            validPoints.push(new Vector3(-limitX, point.y, p2z));
        }
        if (p2x <= limitX && p2x >= -limitX) {
            validPoints.push(new Vector3(p2x, point.y, -limitX));
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

        const plane = this.database.getPlaneByPositionAndNormal(position, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            const rotationY = normal.z < 0 ? -normal.angleTo(new Vector3(0, 0, 1)) : -normal.angleTo(new Vector3(0, 0, 1));
            const labelPosition = new Vector3(p1.x, DIMENSIONS.scene3D.planeHeight / 2 - 1, p1.z);
            const planeModel = new PlaneModel(label, position, length, DIMENSIONS.scene3D.planeHeight, undefined, rotationY, undefined, labelPosition);
            const newPlane = new Plane(newLabels, position, normal, 'vertical', planeModel);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    createObliquePlane(label: string, horizontalPlaneProjection: LineProjection, frontalPlaneProjection: LineProjection): Plane | null {
        const normal = new Vector3(horizontalPlaneProjection.angle + Math.PI / 2, frontalPlaneProjection.angle + Math.PI / 2, 1);
    
        // discover a point of the line (ex: point M)
        let k = -frontalPlaneProjection.position.y / -Math.tan(frontalPlaneProjection.angle);
        const Mz = frontalPlaneProjection.position.z + k * 1;
        const positionM = new Vector3(0, 0, Math.round(Mz * 10) / 10);
        
        const limitX = DIMENSIONS.scene3D.planeHeight / 2;
        const limitY = DIMENSIONS.scene3D.planeWidth / 2;
        const limitZ = DIMENSIONS.scene3D.planeHeight / 2;
        
        // discover 2 border points of the frontal line
        // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
        let possiblePoints: Vector3[] = [];
        k = (limitX - positionM.y) / frontalPlaneProjection.vector.y;
        let p1z = Math.round((positionM.z + k * frontalPlaneProjection.vector.z) * 100) / 100;
        k = (limitY - positionM.z) / frontalPlaneProjection.vector.z;
        let p1y = Math.round((positionM.y + k * frontalPlaneProjection.vector.y) * 100) / 100;
        k = (-limitX - positionM.y) / frontalPlaneProjection.vector.y;
        let p2z = Math.round((positionM.z + k * frontalPlaneProjection.vector.z) * 100) / 100;
        k = (-limitY - positionM.z) / frontalPlaneProjection.vector.z;
        let p2y = Math.round((positionM.y + k * frontalPlaneProjection.vector.y) * 100) / 100;

        let validPoints: Vector3[] = [];
        if (p1z <= limitY && p1z >= -limitY) {
            validPoints.push(new Vector3(0, limitX, p1z));
        }
        if (p1y <= limitX && p1y >= -limitX) {
            validPoints.push(new Vector3(0, p1y, limitX));
        }
        if (p2z >= -limitY && p2z <= limitY) {
            validPoints.push(new Vector3(0, -limitX, p2z));
        }
        if (p2y <= limitX && p2y >= -limitX) {
            validPoints.push(new Vector3(0, p2y, -limitX));
        }

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
        const frontalCenter = medianVector3(p1, p2);
        const frontalLength = distanceBetweenTwoPointsVector3(p1, p2);

        // discover 2 border points of the horizontal line
        // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
        k = (limitX - frontalCenter.x) / horizontalPlaneProjection.vector.x;
        const p3z = Math.round((frontalCenter.z + k * horizontalPlaneProjection.vector.z) * 100) / 100;
        k = (limitY - frontalCenter.z) / horizontalPlaneProjection.vector.z;
        const p3x = Math.round((frontalCenter.x + k * horizontalPlaneProjection.vector.x) * 100) / 100;
        k = (-limitX - frontalCenter.x) / horizontalPlaneProjection.vector.x;
        const p4z = Math.round((frontalCenter.z + k * horizontalPlaneProjection.vector.z) * 100) / 100;
        k = (-limitY - frontalCenter.z) / horizontalPlaneProjection.vector.z;
        const p4x = Math.round((frontalCenter.x + k * horizontalPlaneProjection.vector.x) * 100) / 100;

        validPoints = [];
        if (p3z <= limitY && p3z >= -limitY) {
            validPoints.push(new Vector3(limitX, frontalCenter.y, p3z));
        }
        if (p3x <= limitX && p3x >= -limitX) {
            validPoints.push(new Vector3(p3x, frontalCenter.y, limitX));
        }
        if (p4z >= -limitY && p4z <= limitY) {
            validPoints.push(new Vector3(-limitX, frontalCenter.y, p4z));
        }
        if (p4x <= limitX && p4x >= -limitX) {
            validPoints.push(new Vector3(p4x, frontalCenter.y, -limitX));
        }

        uniqueValidPoints = validPoints.filter((value, index, array) => {
            let currIndex = -1;
            array.forEach((element, index) => {
                if (equalsVector3(value, element)) {
                    currIndex = index;
                }
            });
            return index == currIndex;
        });
        const p3 = uniqueValidPoints[0];
        const p4 = uniqueValidPoints[1];
        const horizontalCenter = medianVector3(p3, p4);
        const horizontalLength = distanceBetweenTwoPointsVector3(p3, p4);

        const plane = this.database.getPlaneByPositionAndNormal(horizontalCenter, normal);
        if (plane) {
            plane.addLabel(label);
            return null;
        } else {
            let newLabels = [label];
            k = -frontalPlaneProjection.position.z / 1;
            let b = frontalPlaneProjection.position.y + k * -Math.tan(frontalPlaneProjection.angle);
            
            // y = mx + b (YZ plane) 
            let intersectionZ = -b / (-Math.tan(frontalPlaneProjection.angle) + Math.tan(frontalPlaneProjection.angle + Math.PI / 2));
            let intersectionY = -Math.tan(frontalPlaneProjection.angle) * intersectionZ + b;
            let intersectionPoint = new Vector3(0, intersectionY, intersectionZ);

            // (x, y, z) = (x1, y1, z1) + k(vx, vy, vz)
            k = -horizontalPlaneProjection.position.z / 1;
            let Hx = horizontalPlaneProjection.position.x + k * Math.tan(horizontalPlaneProjection.angle);
            let positionH = new Vector3(Hx, 0, 0);
            let newPlanePosition = new Vector3(0, 0, 0);
            if (Hx == 0 && intersectionPoint.z == 0) {
                // new plane position y = 1
                k = 1 - frontalPlaneProjection.position.y / -Math.tan(frontalPlaneProjection.angle + Math.PI / 4);
                console.log(k);
                let newZ = frontalPlaneProjection.position.z + k * 1;
                newPlanePosition = new Vector3(0, 1, newZ);
                console.log(newPlanePosition);
            }
            const planeVector = createVector3(positionH, intersectionPoint);
            const perpendicularFrontalVector = new Vector3(0, -Math.tan(frontalPlaneProjection.angle + Math.PI / 2), 1);
            const yAngle = positionH.x >= 0 ? perpendicularFrontalVector.angleTo(planeVector) : perpendicularFrontalVector.negate().angleTo(planeVector);
            const rotationX = -(Math.PI / 2 - frontalPlaneProjection.angle);
            const rotationY = Math.PI / 2 - yAngle;
            const labelPosition = new Vector3(p1.x, p1.y, p1.z);
            const planeModel = new PlaneModel(label, horizontalCenter, horizontalLength, frontalLength, rotationX, rotationY, undefined, labelPosition);
            const newPlane = new Plane(newLabels, horizontalCenter, normal, 'oblique', planeModel);
            // -------------------------------------------------
            // const intersectionPointModel = new PointModel(intersectionPoint, 'iP');
            // const hPointModel = new PointModel(positionH, 'pH');
            // planeModel.group.add(intersectionPointModel.group, hPointModel.group);
            this.database.planes.push(newPlane);
            return newPlane;
        }
    }

    removePlane(labelInput: string): Plane | null {
        let plane = this.database.getPlaneByLabel(labelInput);
        if (plane) {
            if (plane.labels.length > 1) {
                plane.removeLabel(labelInput);
                return null;
            } else {
                plane.removeLabels();
                this.database.removePlane(plane);
                return plane;
            }
        } else {
            return null;
        }
    }
}